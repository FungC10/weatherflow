'use client';

import { useState, useMemo } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getCurrent, getForecast } from '@/lib/api';
import { queryKeys } from '@/lib/queryKeys';
import { Units } from '@/lib/types';
import { convertCurrentWeather, convertForecast } from '@/lib/unitConversion';
import { formatTemp } from '@/lib/format';
import { useStrings } from '@/lib/LocaleContext';
import { LastGeo, setLastGeo } from '@/lib/storage';

interface YourLocationCardProps {
  lastGeo: LastGeo;
  units: Units;
  onLocationSelect: (city: { lat: number; lon: number; name: string; country?: string }) => void;
  onRefresh?: (updatedGeo: LastGeo) => void;
}

export default function YourLocationCard({ lastGeo, units, onLocationSelect, onRefresh }: YourLocationCardProps) {
  const strings = useStrings();
  const queryClient = useQueryClient();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [refreshError, setRefreshError] = useState<string | null>(null);

  // Fetch current weather in metric (will convert later)
  const { data: currentWeather, isLoading: isLoadingCurrent, error: currentError } = useQuery({
    queryKey: queryKeys.current(lastGeo.lat, lastGeo.lon, 'metric'),
    queryFn: () => getCurrent(lastGeo.lat, lastGeo.lon, 'metric'),
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 15 * 60 * 1000,
  });

  // Fetch forecast in metric
  const { data: forecastData, isLoading: isLoadingForecast, error: forecastError } = useQuery({
    queryKey: queryKeys.forecast(lastGeo.lat, lastGeo.lon, 'metric'),
    queryFn: () => getForecast(lastGeo.lat, lastGeo.lon, 'metric'),
    staleTime: 30 * 60 * 1000, // 30 minutes
    gcTime: 60 * 60 * 1000,
  });

  const convertedCurrent = useMemo(() => {
    if (!currentWeather) return null;
    if (units === 'metric') return currentWeather;
    return convertCurrentWeather(currentWeather, 'metric', units);
  }, [currentWeather, units]);

  const convertedForecast = useMemo(() => {
    if (!forecastData) return null;
    if (units === 'metric') return forecastData;
    return convertForecast(forecastData, 'metric', units);
  }, [forecastData, units]);

  const timeAgo = useMemo(() => {
    const updated = new Date(lastGeo.updatedAt);
    const now = new Date();
    const diffMs = now.getTime() - updated.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins === 1) return '1 minute ago';
    if (diffMins < 60) return `${diffMins} minutes ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours === 1) return '1 hour ago';
    if (diffHours < 24) return `${diffHours} hours ago`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays === 1) return '1 day ago';
    return `${diffDays} days ago`;
  }, [lastGeo.updatedAt]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    setRefreshError(null);
    
    try {
      // Update timestamp and storage
      const updatedAt = new Date().toISOString();
      setLastGeo(lastGeo.lat, lastGeo.lon, lastGeo.label);
      
      // Notify parent of update
      if (onRefresh) {
        onRefresh({
          ...lastGeo,
          updatedAt,
        });
      }
      
      // Invalidate and refetch queries
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: queryKeys.current(lastGeo.lat, lastGeo.lon, 'metric'),
        }),
        queryClient.invalidateQueries({
          queryKey: queryKeys.forecast(lastGeo.lat, lastGeo.lon, 'metric'),
        }),
      ]);
      
      // Refetch the queries
      await Promise.all([
        queryClient.refetchQueries({
          queryKey: queryKeys.current(lastGeo.lat, lastGeo.lon, 'metric'),
        }),
        queryClient.refetchQueries({
          queryKey: queryKeys.forecast(lastGeo.lat, lastGeo.lon, 'metric'),
        }),
      ]);
    } catch (error) {
      setRefreshError('Failed to refresh location data');
      setTimeout(() => setRefreshError(null), 3000);
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleClick = () => {
    onLocationSelect({
      lat: lastGeo.lat,
      lon: lastGeo.lon,
      name: lastGeo.label,
    });
  };

  const isLoading = isLoadingCurrent || isLoadingForecast || isRefreshing;
  const hasError = currentError || forecastError || refreshError;

  if (hasError && !currentWeather && !forecastData) {
    return (
      <div className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-xl rounded-2xl p-5 border border-red-200 dark:border-red-500/30 shadow-lg">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">Your Location</h3>
          <span className="text-xs text-slate-500 dark:text-slate-400">{timeAgo}</span>
        </div>
        <p className="text-sm text-red-600 dark:text-red-400 mb-3">
          {refreshError || 'Failed to load weather data'}
        </p>
        <button
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="text-sm text-cyan-600 dark:text-cyan-400 hover:text-cyan-700 dark:hover:text-cyan-300 underline font-medium disabled:opacity-50"
          aria-label="Refresh location weather data"
        >
          {isRefreshing ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>
    );
  }

  const temp = convertedCurrent?.main.temp;
  const description = convertedCurrent?.weather[0]?.description || '';

  return (
    <div
      onClick={handleClick}
      className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-xl rounded-2xl p-5 border border-slate-200/50 dark:border-slate-700/50 shadow-lg cursor-pointer transition-all hover:scale-[1.02] hover:shadow-xl active:scale-[0.98]"
      role="button"
      aria-label={`Your location: ${lastGeo.label}. ${temp ? `${formatTemp(temp, units)}` : 'Loading'}. Click to view details.`}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <svg className="w-5 h-5 text-cyan-600 dark:text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">Your Location</h3>
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleRefresh();
          }}
          disabled={isRefreshing}
          className="px-3 py-1 text-xs font-medium text-cyan-600 dark:text-cyan-400 hover:text-cyan-700 dark:hover:text-cyan-300 hover:bg-cyan-50 dark:hover:bg-cyan-900/20 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:ring-offset-2"
          aria-label="Refresh location weather data"
        >
          {isRefreshing ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>

      {isLoading && !temp && (
        <div className="animate-pulse space-y-2">
          <div className="h-6 bg-slate-200/60 dark:bg-slate-700/60 rounded w-20"></div>
          <div className="h-4 bg-slate-200/60 dark:bg-slate-700/60 rounded w-32"></div>
        </div>
      )}

      {temp && (
        <>
          <div className="flex items-center justify-between mb-2">
            <div className="text-3xl font-bold text-cyan-600 dark:text-cyan-300">
              {formatTemp(temp, units)}
            </div>
            {description && (
              <span className="text-sm text-slate-600 dark:text-slate-400 capitalize">
                {description}
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-500 mb-2">{lastGeo.label}</p>
        </>
      )}

      <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-200/50 dark:border-slate-700/50">
        <span className="text-xs text-slate-500 dark:text-slate-400">Updated {timeAgo}</span>
        {refreshError && (
          <span className="text-xs text-red-600 dark:text-red-400">{refreshError}</span>
        )}
      </div>

      {isLoading && (
        <div className="sr-only" aria-live="polite">
          Loading weather data for your location
        </div>
      )}
    </div>
  );
}

