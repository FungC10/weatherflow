'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import dynamic from 'next/dynamic';
import { GeoPoint, Units, CurrentWeather, Forecast } from '@/lib/types';
import { queryKeys } from '@/lib/queryKeys';
import { getCurrent, getForecast } from '@/lib/api';
import { getJSON } from '@/lib/storage';
import { parseCityFromUrl } from '@/lib/cityUtils';
import SearchBar from '@/components/SearchBar';
import UnitToggle from '@/components/UnitToggle';
import CurrentCard from '@/components/CurrentCard';
import ForecastList from '@/components/ForecastList';
import EmptyState from '@/components/EmptyState';
import ErrorState from '@/components/ErrorState';
import LoadingShimmer from '@/components/LoadingShimmer';

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

interface CityPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default function CityPage({ params }: CityPageProps) {
  const searchParams = useSearchParams();
  const [units, setUnits] = useState<Units>('metric');
  const [showMap, setShowMap] = useState(false);
  const [slug, setSlug] = useState<string>('');

  // Handle async params
  useEffect(() => {
    params.then(({ slug }) => setSlug(slug));
  }, [params]);

  // Parse city data from URL parameters
  const { city: selectedCity, units: urlUnits } = slug ? parseCityFromUrl(slug, searchParams) : { city: null, units: 'metric' };

  // Initialize units from URL or localStorage
  useEffect(() => {
    if (urlUnits && (urlUnits === 'metric' || urlUnits === 'imperial')) {
      setUnits(urlUnits);
    } else {
      // Fallback to stored units
      const storedUnits = getJSON<Units>('weatherflow:units');
      if (storedUnits) {
        setUnits(storedUnits);
      }
    }
  }, [urlUnits]);

  // Fetch weather data
  const { data: currentWeather, isLoading: isLoadingWeather, error: weatherError } = useQuery({
    queryKey: queryKeys.current(selectedCity?.lat || 0, selectedCity?.lon || 0, units),
    queryFn: () => getCurrent(selectedCity!.lat, selectedCity!.lon, units),
    enabled: !!selectedCity && typeof window !== 'undefined',
  });

  const { data: forecastData, isLoading: isLoadingForecast, error: forecastError } = useQuery({
    queryKey: queryKeys.forecast(selectedCity?.lat || 0, selectedCity?.lon || 0, units),
    queryFn: () => getForecast(selectedCity!.lat, selectedCity!.lon, units),
    enabled: !!selectedCity && typeof window !== 'undefined',
  });

  const handleUnitsChange = (newUnits: Units) => {
    setUnits(newUnits);
    // Update URL with new units
    const url = new URL(window.location.href);
    url.searchParams.set('u', newUnits);
    window.history.replaceState({}, '', url.toString());
  };

  const handleRetry = () => {
    window.location.reload();
  };

  const handleBackToHome = () => {
    window.location.href = '/';
  };

  // Determine app state
  const isLoading = isLoadingWeather || isLoadingForecast;
  const hasError = weatherError || forecastError;
  const hasData = currentWeather && forecastData;

  let appState: 'empty' | 'loading' | 'error' | 'success' = 'empty';
  if (isLoading) appState = 'loading';
  else if (hasError) appState = 'error';
  else if (hasData) appState = 'success';

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-cyan-400 mb-2">WeatherFlow</h1>
              <p className="text-slate-400">
                {selectedCity ? `Weather in ${selectedCity.name}` : 'City Weather'}
              </p>
            </div>
            <button
              onClick={handleBackToHome}
              className="flex items-center space-x-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-lg transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              <span>Back to Search</span>
            </button>
          </div>

          {/* Search and Controls */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1">
              <SearchBar onCitySelect={() => {}} disabled />
            </div>
            <UnitToggle onChange={handleUnitsChange} />
          </div>
        </div>

        {/* Content */}
        {appState === 'empty' && (
          <EmptyState 
            title="Invalid City URL"
            message="The city URL is invalid or missing required parameters."
            action={{
              label: "Back to Search",
              onClick: handleBackToHome
            }}
          />
        )}

        {appState === 'loading' && (
          <LoadingShimmer />
        )}

        {appState === 'error' && (
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

        {appState === 'success' && (
          <div className="space-y-6">
            {/* Current Weather */}
            <CurrentCard weather={currentWeather!} units={units} />

            {/* Forecast */}
            <ForecastList forecasts={forecastData!.daily} units={units} />

            {/* Map Toggle and Panel */}
            <div className="space-y-3">
              <button
                onClick={() => setShowMap(!showMap)}
                className="flex items-center space-x-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-lg transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                </svg>
                <span>{showMap ? 'Hide map' : 'Show map'}</span>
              </button>
              
              {showMap && (
                <MapPanel
                  city={selectedCity}
                  currentWeather={currentWeather || null}
                  units={units}
                  isVisible={showMap}
                />
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
