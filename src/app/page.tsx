'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import SearchBar from '@/components/SearchBar';
import UnitToggle from '@/components/UnitToggle';
import CurrentCard from '@/components/CurrentCard';
import EmptyState from '@/components/EmptyState';
import ErrorState from '@/components/ErrorState';
import LoadingShimmer from '@/components/LoadingShimmer';
import { Units, GeoPoint } from '@/lib/types';
import { getCurrent, getForecast } from '@/lib/api';
import { queryKeys } from '@/lib/queryKeys';
import { askLocation, getLocationErrorMessage, GeoLocationError } from '@/lib/geo';
import { addRecentSearch } from '@/lib/storage';
import { generateCityUrl } from '@/lib/cityUtils';
import ShareButton from '@/components/ShareButton';
import dynamic from 'next/dynamic';

// Lazy-load MapPanel to protect initial bundle
const MapPanel = dynamic(() => import('@/components/MapPanel'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-64 bg-slate-800/50 rounded-lg border border-slate-700/30 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-cyan-400 border-t-transparent mx-auto mb-2"></div>
        <p className="text-slate-400 text-sm">Loading map...</p>
      </div>
    </div>
  )
});

// Lazy-load ForecastList for better code splitting
const ForecastList = dynamic(() => import('@/components/ForecastList'), {
  ssr: false,
  loading: () => (
    <div className="space-y-3">
      <h3 className="text-lg font-semibold text-slate-200 mb-4">5-Day Forecast</h3>
      {Array.from({ length: 5 }).map((_, index) => (
        <div key={index} className="bg-white/5 backdrop-blur-sm rounded-lg p-4 border border-slate-700/30">
          <div className="animate-pulse">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="h-4 bg-slate-700 rounded w-16 mb-2"></div>
                <div className="h-3 bg-slate-700 rounded w-24"></div>
              </div>
              <div className="flex items-center space-x-2">
                <div className="h-4 bg-slate-700 rounded w-8"></div>
                <div className="h-4 bg-slate-700 rounded w-8"></div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
});

type AppState = 'empty' | 'loading' | 'error' | 'success';

export default function Home() {
  const [selectedCity, setSelectedCity] = useState<GeoPoint | null>(null);
  const [units, setUnits] = useState<Units>('metric');
  const [searchQuery, setSearchQuery] = useState('');
  const [locationError, setLocationError] = useState<string | null>(null);
  const [isRequestingLocation, setIsRequestingLocation] = useState(false);
  const [showMap, setShowMap] = useState(false);
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
    staleTime: 8 * 60 * 1000, // 8 minutes - current weather changes more frequently
    gcTime: 15 * 60 * 1000, // 15 minutes garbage collection
    retry: (failureCount, error) => {
      // Don't retry on 4xx errors (client errors)
      if (error && 'status' in error && typeof error.status === 'number' && error.status >= 400 && error.status < 500) {
        return false;
      }
      return failureCount < 1; // Only retry once for other errors
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000), // Exponential backoff
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
    staleTime: 30 * 60 * 1000, // 30 minutes - forecast changes less frequently
    gcTime: 60 * 60 * 1000, // 1 hour garbage collection
    retry: (failureCount, error) => {
      // Don't retry on 4xx errors (client errors)
      if (error && 'status' in error && typeof error.status === 'number' && error.status >= 400 && error.status < 500) {
        return false;
      }
      return failureCount < 1; // Only retry once for other errors
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000), // Exponential backoff
  });

  // Get forecast data from API - memoized to prevent unnecessary re-renders
  const forecasts = useMemo(() => forecastData?.daily || [], [forecastData?.daily]);

  const handleSearch = useCallback((query: string) => {
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
  }, []);

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

  const handleUnitsChange = useCallback((newUnits: Units) => {
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
  }, [selectedCity, units, queryClient]);

  const handleRetry = useCallback(() => {
    if (selectedCity) {
      queryClient.invalidateQueries({
        queryKey: queryKeys.current(selectedCity.lat, selectedCity.lon, units)
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.forecast(selectedCity.lat, selectedCity.lon, units)
      });
    }
  }, [selectedCity, units, queryClient]);

  const handleNavigateToCity = useCallback(() => {
    if (selectedCity) {
      const cityUrl = generateCityUrl(selectedCity, units);
      window.location.href = cityUrl;
    }
  }, [selectedCity, units]);

  const handleClearSearch = useCallback(() => {
    setSearchQuery('');
    setSelectedCity(null);
    // Focus search input after clearing
    if (typeof window !== 'undefined') {
      setTimeout(() => {
        const input = document.querySelector('input[type="text"]') as HTMLInputElement | null;
        input?.focus();
      }, 100);
    }
  }, []);

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
              className="flex items-center space-x-2 px-4 py-2 bg-cyan-600 hover:bg-cyan-700 disabled:bg-cyan-600/50 text-white rounded-lg transition-all duration-200 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:ring-offset-2 focus:ring-offset-slate-900 hover:shadow-lg hover:scale-105 active:scale-95"
              aria-label={isRequestingLocation ? "Getting your current location" : "Use your current location for weather"}
            >
              {isRequestingLocation ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" aria-hidden="true"></div>
                  <span>Getting location...</span>
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span>Use my location</span>
                </>
              )}
            </button>
            
            {locationError && (
              <div 
                className="text-sm text-red-400 text-center max-w-md p-3 bg-red-500/10 border border-red-500/20 rounded-lg backdrop-blur-sm"
                role="alert"
                aria-live="polite"
              >
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
            <LoadingShimmer 
              type="full" 
              message={`Loading weather data for ${selectedCity.name}...`}
            />
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
              autoFocus={true}
            />
          )}

          {selectedCity && currentWeather && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-slate-200">
                  Weather for {selectedCity.name}
                </h2>
                <div className="flex items-center space-x-3">
                  <ShareButton city={selectedCity} units={units} />
                  <button
                    onClick={handleNavigateToCity}
                    className="flex items-center space-x-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:ring-offset-2 focus:ring-offset-slate-900 hover:shadow-lg hover:scale-105 active:scale-95"
                    aria-label={`View detailed weather page for ${selectedCity.name}`}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                    <span>View Page</span>
                  </button>
                  <button
                    onClick={handleClearSearch}
                    className="text-slate-400 hover:text-slate-300 text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:ring-offset-2 focus:ring-offset-slate-900 rounded px-2 py-1"
                    aria-label="Clear search and return to home"
                  >
                    Clear search
                  </button>
                </div>
              </div>
              
              <CurrentCard 
                weather={currentWeather}
                location={selectedCity}
                units={units}
              />
              
              {/* Map Toggle and Panel */}
              <div className="space-y-3">
                <button
                  onClick={() => setShowMap(!showMap)}
                  className="flex items-center space-x-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:ring-offset-2 focus:ring-offset-slate-900 hover:shadow-lg hover:scale-105 active:scale-95"
                  aria-label={showMap ? 'Hide map view' : 'Show map view'}
                  aria-expanded={showMap}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                  </svg>
                  <span>{showMap ? 'Hide map' : 'Show map'}</span>
                </button>
                
                {showMap && (
                  <MapPanel
                    city={selectedCity}
                    currentWeather={currentWeather}
                    units={units}
                    isVisible={showMap}
                  />
                )}
              </div>
              
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
