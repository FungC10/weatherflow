'use client';

import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getFavorites, FavoriteCity } from '@/lib/storage';
import { getCurrent } from '@/lib/api';
import { queryKeys } from '@/lib/queryKeys';
import CurrentCard from './CurrentCard';
import { Units, GeoPoint, CurrentWeather } from '@/lib/types';
import { convertCurrentWeather } from '@/lib/unitConversion';

interface FavoriteCitiesCardsProps {
  units: Units;
  onCitySelect: (city: GeoPoint) => void;
}

export default function FavoriteCitiesCards({ units, onCitySelect }: FavoriteCitiesCardsProps) {
  const [favorites, setFavorites] = useState<FavoriteCity[]>([]);

  useEffect(() => {
    const loadFavorites = () => {
      const favs = getFavorites();
      setFavorites(favs);
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
  }, []);

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

  if (isLoading) {
    return (
      <div className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-xl rounded-3xl p-6 border border-slate-200/50 dark:border-slate-700/50 shadow-lg animate-pulse">
        <div className="h-8 bg-slate-200/60 dark:bg-slate-700/60 rounded w-32 mb-4"></div>
        <div className="h-12 bg-slate-200/60 dark:bg-slate-700/60 rounded w-20 mb-4"></div>
        <div className="grid grid-cols-2 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-4 bg-slate-200/60 dark:bg-slate-700/60 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  if (!convertedWeather) {
    return null;
  }

  return (
    <div
      onClick={() => onCitySelect(city)}
      className="cursor-pointer transition-transform hover:scale-[1.02] active:scale-[0.98]"
    >
      <CurrentCard
        weather={convertedWeather}
        location={city}
        units={units}
      />
    </div>
  );
}

