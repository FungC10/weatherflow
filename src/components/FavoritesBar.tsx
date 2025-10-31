'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { StarIcon } from '@heroicons/react/24/solid';
import { StarIcon as StarOutlineIcon } from '@heroicons/react/24/outline';
import { GeoPoint } from '@/lib/types';
import { getFavorites, removeFavorite } from '@/lib/storage';
import { useStrings } from '@/lib/LocaleContext';

interface FavoritesBarProps {
  onCitySelect: (city: GeoPoint) => void;
  className?: string;
}

export default function FavoritesBar({ onCitySelect, className = '' }: FavoritesBarProps) {
  const strings = useStrings();
  const [favorites, setFavorites] = useState<Array<{ name: string; country: string; lat: number; lon: number; addedAt: string }>>([]);
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);

  // Load favorites on mount
  useEffect(() => {
    const loadFavorites = () => {
      const favs = getFavorites();
      setFavorites(favs);
    };

    loadFavorites();
    
    // Listen for storage changes (from other tabs)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'weatherflow:favorites') {
        loadFavorites();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const handleCitySelect = useCallback((city: { name: string; country: string; lat: number; lon: number }) => {
    onCitySelect({
      name: city.name,
      country: city.country,
      lat: city.lat,
      lon: city.lon
    });
  }, [onCitySelect]);

  const handleRemoveFavorite = useCallback((city: { name: string; country: string; lat: number; lon: number }) => {
    if (removeFavorite(city)) {
      setFavorites(prev => prev.filter(fav => 
        !(fav.name === city.name && 
          fav.country === city.country &&
          Math.abs(fav.lat - city.lat) < 0.001 &&
          Math.abs(fav.lon - city.lon) < 0.001)
      ));
    }
  }, []);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (favorites.length === 0) return;

    switch (e.key) {
      case 'ArrowRight':
        e.preventDefault();
        setFocusedIndex(prev => (prev + 1) % favorites.length);
        break;
      case 'ArrowLeft':
        e.preventDefault();
        setFocusedIndex(prev => prev <= 0 ? favorites.length - 1 : prev - 1);
        break;
      case 'Enter':
        e.preventDefault();
        if (focusedIndex >= 0 && focusedIndex < favorites.length) {
          handleCitySelect(favorites[focusedIndex]);
        }
        break;
      case 'Escape':
        e.preventDefault();
        setFocusedIndex(-1);
        break;
    }
  }, [favorites, focusedIndex, handleCitySelect]);

  // Focus management
  useEffect(() => {
    if (focusedIndex >= 0 && containerRef.current) {
      const focusedElement = containerRef.current.querySelector(`[data-index="${focusedIndex}"]`) as HTMLElement;
      if (focusedElement) {
        focusedElement.focus();
      }
    }
  }, [focusedIndex]);

  if (favorites.length === 0) {
    return (
      <div className={`text-center py-2 ${className}`}>
        <div className="inline-flex items-center gap-2 text-slate-600 dark:text-slate-400 text-sm">
          <StarOutlineIcon className="h-4 w-4" aria-hidden="true" />
          <span>{strings.noFavorites}</span>
          <span className="text-xs text-slate-500 dark:text-slate-500">•</span>
          <span className="text-xs">{strings.addFavoritesMessage}</span>
        </div>
      </div>
    );
  }

  return (
    <div 
      ref={containerRef}
      className={className}
      onKeyDown={handleKeyDown}
      role="region"
      aria-label={strings.favorites}
    >
      <div className="flex flex-wrap gap-2">
        {favorites.map((favorite, index) => (
          <div
            key={`${favorite.name}-${favorite.country}-${favorite.lat}-${favorite.lon}`}
            data-index={index}
            tabIndex={focusedIndex === index ? 0 : -1}
            className={`
              group flex items-center space-x-2 px-3 py-2 bg-white/60 dark:bg-slate-800/50 hover:bg-white/80 dark:hover:bg-slate-700/50 
              rounded-xl border border-slate-200/50 dark:border-slate-600/50 hover:border-slate-300/50 dark:hover:border-slate-500/50 
              transition-all duration-300 cursor-pointer focus:outline-none focus:ring-2 
              focus:ring-cyan-400 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-slate-900
              ${focusedIndex === index ? 'ring-2 ring-cyan-400 ring-offset-2 ring-offset-white dark:ring-offset-slate-900' : ''}
              hover:shadow-md hover:scale-105 active:scale-95
            `}
            onClick={() => handleCitySelect(favorite)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                handleCitySelect(favorite);
              }
            }}
            role="button"
            aria-label={`${favorite.name}, ${favorite.country}. Click to view weather.`}
          >
            <span className="text-slate-800 dark:text-slate-200 text-sm font-medium truncate max-w-32">
              {favorite.name}
            </span>
            <span className="text-slate-600 dark:text-slate-400 text-xs">
              {favorite.country}
            </span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleRemoveFavorite(favorite);
              }}
              className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 p-1 hover:bg-slate-600/50 rounded"
              aria-label={`${strings.removeFromFavorites} ${favorite.name}`}
              title={strings.removeFromFavorites}
            >
              <StarIcon className="h-3 w-3 text-amber-400" aria-hidden="true" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
