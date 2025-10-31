'use client';

import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getFavorites, FavoriteCity } from '@/lib/storage';
import { getCurrent } from '@/lib/api';
import { queryKeys } from '@/lib/queryKeys';
import { Units, GeoPoint, CurrentWeather } from '@/lib/types';
import { convertCurrentWeather } from '@/lib/unitConversion';
import { formatTemp } from '@/lib/format';

interface FavoriteCitiesCardsProps {
  units: Units;
  onCitySelect: (city: GeoPoint) => void;
  onFavoritesCountChange?: (count: number) => void;
}

export default function FavoriteCitiesCards({ units, onCitySelect, onFavoritesCountChange }: FavoriteCitiesCardsProps) {
  const [favorites, setFavorites] = useState<FavoriteCity[]>([]);

  useEffect(() => {
    const loadFavorites = () => {
      const favs = getFavorites();
      setFavorites(favs);
      onFavoritesCountChange?.(favs.length);
    };

    loadFavorites();
    
    // Listen for storage changes
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'weatherflow:favorites') {
        loadFavorites();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    
    // Poll for changes (since same-tab changes don't trigger storage event)
    const interval = setInterval(loadFavorites, 1000);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, [onFavoritesCountChange]);

  if (favorites.length === 0) {
    return null;
  }

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {favorites.map((favorite) => (
          <FavoriteCityCard
            key={`${favorite.lat}-${favorite.lon}`}
            favorite={favorite}
            units={units}
            onCitySelect={onCitySelect}
          />
        ))}
      </div>
    </div>
  );
}

function FavoriteCityCard({
  favorite,
  units,
  onCitySelect
}: {
  favorite: FavoriteCity;
  units: Units;
  onCitySelect: (city: GeoPoint) => void;
}) {
  const [originalWeather, setOriginalWeather] = useState<CurrentWeather | null>(null);

  const { data: currentWeather, isLoading } = useQuery({
    queryKey: queryKeys.current(favorite.lat, favorite.lon, 'metric'),
    queryFn: async () => {
      if (typeof window === 'undefined') return null;
      return getCurrent(favorite.lat, favorite.lon, 'metric');
    },
    enabled: typeof window !== 'undefined',
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 15 * 60 * 1000,
  });

  useEffect(() => {
    if (currentWeather && !originalWeather) {
      setOriginalWeather(currentWeather);
    }
  }, [currentWeather, originalWeather]);

  const convertedWeather = originalWeather && units !== 'metric'
    ? convertCurrentWeather(originalWeather, 'metric', units)
    : originalWeather || undefined;

  const city: GeoPoint = {
    lat: favorite.lat,
    lon: favorite.lon,
    name: favorite.name,
    country: favorite.country
  };

  const tempValue = convertedWeather ? formatTemp(convertedWeather.main.temp, units) : null;
  const description = convertedWeather?.weather[0]?.description || '';

  if (isLoading) {
    return (
      <div className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-xl rounded-2xl p-5 border border-slate-200/50 dark:border-slate-700/50 shadow-lg animate-pulse">
        <div className="h-6 bg-slate-200/60 dark:bg-slate-700/60 rounded w-28 mb-3"></div>
        <div className="h-12 bg-slate-200/60 dark:bg-slate-700/60 rounded w-20"></div>
      </div>
    );
  }

  if (!convertedWeather || !tempValue) {
    return null;
  }

  return (
    <div
      onClick={() => onCitySelect(city)}
      className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-xl rounded-2xl p-5 border border-slate-200/50 dark:border-slate-700/50 shadow-lg cursor-pointer transition-all hover:scale-[1.02] hover:shadow-xl active:scale-[0.98]"
      role="button"
      aria-label={`${city.name}, ${city.country}. ${tempValue}. Click to view details.`}
    >
      <div className="flex items-center justify-between">
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 truncate mb-1">
            {city.name}
          </h3>
          <p className="text-xs text-slate-600 dark:text-slate-400 truncate">
            {city.country}
          </p>
        </div>
        <div className="text-right ml-4">
          <div className="text-3xl font-bold text-cyan-600 dark:text-cyan-300 leading-none">
            {tempValue}
          </div>
          {description && (
            <p className="text-xs text-slate-600 dark:text-slate-400 capitalize mt-1 truncate max-w-[80px]">
              {description}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

