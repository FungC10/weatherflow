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
import { askLocation, getLocationErrorMessage, GeoLocationError } from '@/lib/geo';
import { addRecentSearch } from '@/lib/storage';

type AppState = 'empty' | 'loading' | 'error' | 'success';

export default function Home() {
  const [selectedCity, setSelectedCity] = useState<GeoPoint | null>(null);
  const [units, setUnits] = useState<Units>('metric');
  const [searchQuery, setSearchQuery] = useState('');
  const [locationError, setLocationError] = useState<string | null>(null);
  const [isRequestingLocation, setIsRequestingLocation] = useState(false);
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
    setLocationError(null);
    
    // Mock city selection for now (will be replaced with real geocoding)
    const mockCity: GeoPoint = {
      lat: 40.7128 + (Math.random() - 0.5) * 0.1,
      lon: -74.0060 + (Math.random() - 0.5) * 0.1,
      name: query,
      country: 'US'
    };
    
    setSelectedCity(mockCity);
    addRecentSearch(query);
  };

  const handleUseLocation = async () => {
    setIsRequestingLocation(true);
    setLocationError(null);
    
    try {
      const location = await askLocation();
      const locationCity: GeoPoint = {
        lat: location.lat,
        lon: location.lon,
        name: location.name || 'Current Location',
        country: location.country
      };
      
      setSelectedCity(locationCity);
      setSearchQuery(locationCity.name || 'Current Location');
      addRecentSearch(locationCity.name || 'Current Location');
    } catch (error) {
      const geoError = error as GeoLocationError;
      setLocationError(getLocationErrorMessage(geoError));
    } finally {
      setIsRequestingLocation(false);
    }
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
          
          {/* Location Button and Error */}
          <div className="mt-4 flex flex-col items-center space-y-2">
            <button
              onClick={handleUseLocation}
              disabled={isRequestingLocation}
              className="flex items-center space-x-2 px-4 py-2 bg-cyan-600 hover:bg-cyan-700 disabled:bg-cyan-600/50 text-white rounded-lg transition-colors disabled:cursor-not-allowed"
            >
              {isRequestingLocation ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                  <span>Getting location...</span>
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span>Use my location</span>
                </>
              )}
            </button>
            
            {locationError && (
              <div className="text-sm text-red-400 text-center max-w-md">
                {locationError}
              </div>
            )}
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
