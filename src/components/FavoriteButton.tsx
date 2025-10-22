'use client';

import { useState, useEffect, useCallback } from 'react';
import { StarIcon } from '@heroicons/react/24/solid';
import { StarIcon as StarOutlineIcon } from '@heroicons/react/24/outline';
import { GeoPoint } from '@/lib/types';
import { isFavorite, addFavorite, removeFavorite } from '@/lib/storage';
import { useStrings } from '@/lib/LocaleContext';

interface FavoriteButtonProps {
  city: GeoPoint;
  className?: string;
  onToggle?: (isFavorite: boolean) => void;
}

export default function FavoriteButton({ city, className = '', onToggle }: FavoriteButtonProps) {
  const strings = useStrings();
  const [isFav, setIsFav] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  // Check if city is favorite on mount
  useEffect(() => {
    const checkFavorite = () => {
      if (city.name && city.country) {
        const favorite = isFavorite({
          name: city.name,
          country: city.country,
          lat: city.lat,
          lon: city.lon
        });
        setIsFav(favorite);
      }
    };

    checkFavorite();
    
    // Listen for storage changes (from other tabs)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'weatherflow:favorites') {
        checkFavorite();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [city]);

  const handleToggle = useCallback(async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (isAnimating || !city.name || !city.country) return;

    setIsAnimating(true);

    try {
      const cityData = {
        name: city.name,
        country: city.country,
        lat: city.lat,
        lon: city.lon
      };

      if (isFav) {
        const success = removeFavorite(cityData);
        if (success) {
          setIsFav(false);
          onToggle?.(false);
        }
      } else {
        const success = addFavorite(cityData);
        if (success) {
          setIsFav(true);
          onToggle?.(true);
        }
      }
    } finally {
      // Reset animation state after a short delay
      setTimeout(() => setIsAnimating(false), 300);
    }
  }, [city, isFav, isAnimating, onToggle]);

  return (
    <button
      onClick={handleToggle}
      className={`
        p-2 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 
        focus:ring-cyan-400 focus:ring-offset-2 focus:ring-offset-slate-900
        ${isFav 
          ? 'text-amber-400 hover:text-amber-300 hover:bg-amber-500/10' 
          : 'text-slate-400 hover:text-amber-400 hover:bg-amber-500/10'
        }
        ${isAnimating ? 'scale-110' : 'hover:scale-105'}
        ${className}
      `}
      aria-label={isFav ? strings.removeFromFavorites : strings.addToFavorites}
      title={isFav ? strings.removeFromFavorites : strings.addToFavorites}
      disabled={isAnimating}
    >
      {isFav ? (
        <StarIcon 
          className={`h-5 w-5 transition-all duration-200 ${isAnimating ? 'animate-pulse' : ''}`} 
          aria-hidden="true" 
        />
      ) : (
        <StarOutlineIcon 
          className={`h-5 w-5 transition-all duration-200 ${isAnimating ? 'animate-pulse' : ''}`} 
          aria-hidden="true" 
        />
      )}
    </button>
  );
}
