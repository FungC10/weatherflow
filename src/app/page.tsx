'use client';

import { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import SearchBar from '@/components/SearchBar';
import UnitToggle from '@/components/UnitToggle';
import CurrentCard from '@/components/CurrentCard';
import ForecastList from '@/components/ForecastList';
import EmptyState from '@/components/EmptyState';
import ErrorState from '@/components/ErrorState';
import LoadingShimmer from '@/components/LoadingShimmer';
import { Units, GeoPoint } from '@/lib/types';
import { getCurrent, getForecast } from '@/lib/api';
import { queryKeys } from '@/lib/queryKeys';

type AppState = 'empty' | 'loading' | 'error' | 'success';

export default function Home() {
  const [selectedCity, setSelectedCity] = useState<GeoPoint | null>(null);
  const [units, setUnits] = useState<Units>('metric');
  const [searchQuery, setSearchQuery] = useState('');
  const queryClient = useQueryClient();

  // Fetch current weather when city is selected
  const { 
    data: currentWeather, 
    isLoading: isLoadingWeather, 
    error: weatherError 
  } = useQuery({
    queryKey: selectedCity ? queryKeys.current(selectedCity.lat, selectedCity.lon, units) : ['no-query'],
    queryFn: async () => {
      if (!selectedCity) return null;
      // Only fetch on client side
      if (typeof window === 'undefined') return null;
      return getCurrent(selectedCity.lat, selectedCity.lon, units);
    },
    enabled: !!selectedCity && typeof window !== 'undefined',
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
  });

  // Fetch forecast when city is selected
  const { 
    data: forecastData, 
    isLoading: isLoadingForecast, 
    error: forecastError 
  } = useQuery({
    queryKey: selectedCity ? queryKeys.forecast(selectedCity.lat, selectedCity.lon, units) : ['no-forecast-query'],
    queryFn: async () => {
      if (!selectedCity) return null;
      // Only fetch on client side
      if (typeof window === 'undefined') return null;
      return getForecast(selectedCity.lat, selectedCity.lon, units);
    },
    enabled: !!selectedCity && typeof window !== 'undefined',
    staleTime: 10 * 60 * 1000, // 10 minutes
    retry: 2,
  });

  // Get forecast data from API
  const forecasts = forecastData?.daily || [];

  const handleSearch = (query: string) => {
    if (!query.trim()) return;
    
    setSearchQuery(query);
    
    // Mock city selection for now (will be replaced with real geocoding)
    const mockCity: GeoPoint = {
      lat: 40.7128 + (Math.random() - 0.5) * 0.1,
      lon: -74.0060 + (Math.random() - 0.5) * 0.1,
      name: query,
      country: 'US'
    };
    
    setSelectedCity(mockCity);
  };

  const handleUnitsChange = (newUnits: Units) => {
    setUnits(newUnits);
    // Invalidate both current weather and forecast queries to refetch with new units
    if (selectedCity) {
      queryClient.invalidateQueries({
        queryKey: queryKeys.current(selectedCity.lat, selectedCity.lon, units)
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.forecast(selectedCity.lat, selectedCity.lon, units)
      });
    }
  };

  const handleRetry = () => {
    if (selectedCity) {
      queryClient.invalidateQueries({
        queryKey: queryKeys.current(selectedCity.lat, selectedCity.lon, units)
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.forecast(selectedCity.lat, selectedCity.lon, units)
      });
    }
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    setSelectedCity(null);
  };

  return (
    <main className="min-h-screen">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-slate-900/80 backdrop-blur-sm border-b border-slate-700/50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col sm:flex-row items-center justify-between space-y-4 sm:space-y-0">
            <h1 className="text-2xl font-bold text-cyan-300">WeatherFlow</h1>
            <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-4">
              <SearchBar onSearch={handleSearch} />
              <UnitToggle onChange={handleUnitsChange} />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {!selectedCity && (
            <EmptyState 
              action={{
                label: "Search for a city",
                onClick: () => {
                  if (typeof window !== 'undefined') {
                    document.querySelector('input')?.focus();
                  }
                }
              }}
            />
          )}

          {selectedCity && (isLoadingWeather || isLoadingForecast) && (
            <LoadingShimmer type="full" />
          )}

          {selectedCity && (weatherError || forecastError) && (
            <ErrorState 
              title="Failed to load weather data"
              message={
                weatherError instanceof Error ? weatherError.message :
                forecastError instanceof Error ? forecastError.message :
                'Something went wrong'
              }
              onRetry={handleRetry} 
            />
          )}

          {selectedCity && currentWeather && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-slate-200">
                  Weather for {selectedCity.name}
                </h2>
                <button
                  onClick={handleClearSearch}
                  className="text-slate-400 hover:text-slate-300 text-sm"
                >
                  Clear search
                </button>
              </div>
              
              <CurrentCard 
                weather={currentWeather}
                location={selectedCity}
                units={units}
              />
              
              <ForecastList 
                forecasts={forecasts}
                units={units}
                isLoading={isLoadingForecast}
              />
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
