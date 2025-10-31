'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { useQuery } from '@tanstack/react-query';
import { MagnifyingGlassIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { getRecentSearches, clearRecentSearches, addRecentSearch } from '@/lib/storage';
import { searchCity } from '@/lib/api';
import { queryKeys } from '@/lib/queryKeys';
import { GeoPoint } from '@/lib/types';
import { useStrings } from '@/lib/LocaleContext';

interface SearchFormData {
  query: string;
}

interface SearchBarProps {
  onCitySelect: (city: GeoPoint) => void;
  placeholder?: string;
  disabled?: boolean;
}

export default function SearchBar({ 
  onCitySelect, 
  placeholder,
  disabled = false 
}: SearchBarProps) {
  const strings = useStrings();
  const actualPlaceholder = placeholder || strings.searchPlaceholder;
  
  // React Hook Form setup
  const { 
    register, 
    handleSubmit, 
    watch, 
    setValue,
    formState: { errors },
    setError,
    clearErrors
  } = useForm<SearchFormData>({
    defaultValues: {
      query: ''
    },
    mode: 'onSubmit' // Only validate on submit
  });

  const query = watch('query');
  const inputRef = useRef<HTMLInputElement | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const hideTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const [recentSearches, setRecentSearches] = useState<GeoPoint[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const [isFocused, setIsFocused] = useState(false);

  // Debounced search query
  const [debouncedQuery, setDebouncedQuery] = useState('');

  // Debounce the search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (hideTimeoutRef.current) {
        clearTimeout(hideTimeoutRef.current);
      }
    };
  }, []);

  // Search for cities using TanStack Query
  const { data: searchResults = [], isLoading: isSearching } = useQuery({
    queryKey: queryKeys.city(debouncedQuery),
    queryFn: ({ signal }) => searchCity(debouncedQuery, signal),
    enabled: debouncedQuery.length >= 2 && !disabled,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes garbage collection
    retry: (failureCount, error) => {
      // Don't retry on 4xx errors
      if (error && 'status' in error && typeof error.status === 'number' && error.status >= 400 && error.status < 500) {
        return false;
      }
      return failureCount < 1;
    },
  });

  // Load recent searches on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const recent = getRecentSearches();
      // Filter out any invalid city objects
      const validRecent = recent.filter((city): city is GeoPoint => 
        city && typeof city === 'object' && 
        typeof city.lat === 'number' && 
        typeof city.lon === 'number' &&
        typeof city.name === 'string'
      );
      setRecentSearches(validRecent);
    }
  }, []);

  // Global keyboard shortcut: "/" to focus search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === '/' && !disabled && !e.ctrlKey && !e.metaKey && !e.altKey) {
        // Only focus if not already focused and not typing in an input
        if (document.activeElement !== inputRef.current && 
            document.activeElement?.tagName !== 'INPUT' && 
            document.activeElement?.tagName !== 'TEXTAREA') {
          e.preventDefault();
          inputRef.current?.focus();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [disabled]);

  // Show suggestions when input is focused and we have data
  useEffect(() => {
    const hasResults = searchResults.length > 0 || recentSearches.length > 0;
    setShowSuggestions(isFocused && hasResults && (query.length > 0 || recentSearches.length > 0));
  }, [searchResults, recentSearches, query, isFocused]);

  // Handle escape key to close dropdown
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && showSuggestions) {
        setShowSuggestions(false);
        setFocusedIndex(-1);
        inputRef.current?.focus();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [showSuggestions]);

  const onSubmit = (data: SearchFormData) => {
    const trimmedQuery = data.query.trim();
    
    // Validation: non-empty query
    if (!trimmedQuery) {
      setError('query', {
        type: 'manual',
        message: 'Please enter a city name to search'
      });
      return;
    }
    
    // Clear any errors if validation passes
    clearErrors('query');
    
    // If there are search results, select the first one
    if (searchResults.length > 0) {
      // Select the first search result but keep suggestions visible
      handleCitySelect(searchResults[0], false);
    }
  };

  const scheduleHideSuggestions = useCallback(() => {
    // Clear any existing timeout
    if (hideTimeoutRef.current) {
      clearTimeout(hideTimeoutRef.current);
    }
    // Hide suggestions after a short delay
    hideTimeoutRef.current = setTimeout(() => {
      setShowSuggestions(false);
      setFocusedIndex(-1);
    }, 2000); // 2 seconds delay
  }, []);

  const handleCitySelect = useCallback((city: GeoPoint, hideSuggestions = true) => {
    onCitySelect(city);
    // Create a display name that includes country for better identification
    const displayName = city.country ? `${city.name}, ${city.country}` : city.name;
    setValue('query', displayName || city.lat?.toString() || 'Unknown Location');
    if (hideSuggestions) {
      setShowSuggestions(false);
      setFocusedIndex(-1);
    } else {
      // Schedule hiding suggestions after a delay
      scheduleHideSuggestions();
    }
    // Save the city object to recent searches
    addRecentSearch(city);
  }, [onCitySelect, scheduleHideSuggestions, setValue]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    const recentSearchOptions = recentSearches.map(city => ({ ...city, type: 'recent' as const }));
    const allOptions = [...searchResults.map(city => ({ ...city, type: 'search' as const })), ...recentSearchOptions];
    
    if (!showSuggestions || allOptions.length === 0) {
      if (e.key === 'Enter') {
        // Let RHF handle form submit
        handleSubmit(onSubmit)(e);
      }
      return;
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setFocusedIndex(prev => 
          prev < allOptions.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setFocusedIndex(prev => 
          prev > 0 ? prev - 1 : allOptions.length - 1
        );
        break;
      case 'Enter':
        e.preventDefault();
        if (focusedIndex >= 0 && focusedIndex < allOptions.length) {
          const selected = allOptions[focusedIndex];
          if (selected.type === 'search') {
            handleCitySelect(selected as GeoPoint, false); // Keep suggestions visible
          } else if (selected.type === 'recent') {
            // This is a recent search city, select it directly
            handleCitySelect(selected as GeoPoint, false);
          }
        } else {
          // Let RHF handle form submit
          handleSubmit(onSubmit)(e);
        }
        break;
      case 'Escape':
        e.preventDefault();
        setShowSuggestions(false);
        setFocusedIndex(-1);
        break;
    }
  };

  const handleClearRecent = useCallback(() => {
    clearRecentSearches();
    setRecentSearches([]);
    setFocusedIndex(-1);
  }, []);

  const handleInputFocus = useCallback(() => {
    setIsFocused(true);
    if (recentSearches.length > 0 || searchResults.length > 0) {
      setShowSuggestions(true);
    }
  }, [recentSearches.length, searchResults.length]);

  const handleInputBlur = useCallback(() => {
    // Delay hiding to allow clicking on suggestions
    setTimeout(() => {
      setIsFocused(false);
      setShowSuggestions(false);
      setFocusedIndex(-1);
    }, 150);
  }, []);

  // Register input with React Hook Form
  // Note: Validation is handled manually in onSubmit to only show errors on submit
  const { ref, onChange, ...inputProps } = register('query', {
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
      // Clear errors when user starts typing
      clearErrors('query');
      setFocusedIndex(-1);
      // Cancel any pending hide timeout when user types
      if (hideTimeoutRef.current) {
        clearTimeout(hideTimeoutRef.current);
        hideTimeoutRef.current = null;
      }
    }
  });

  // Merge refs for input
  const mergedInputRef = useCallback((node: HTMLInputElement | null) => {
    inputRef.current = node;
    ref(node);
  }, [ref]);

  // Close suggestions when clicking outside the input/dropdown
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent | TouchEvent) => {
      const target = e.target as Node;
      if (
        inputRef.current && !inputRef.current.contains(target) &&
        dropdownRef.current && !dropdownRef.current.contains(target)
      ) {
        setIsFocused(false);
        setShowSuggestions(false);
        setFocusedIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, []);


  return (
    <div className="w-full max-w-md mx-auto relative">
      <form onSubmit={handleSubmit(onSubmit)} role="search" aria-label="Search for weather">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <MagnifyingGlassIcon className="h-5 w-5 text-slate-400" aria-hidden="true" />
          </div>
          <input
            {...inputProps}
            ref={mergedInputRef}
            type="text"
            onChange={(e) => {
              onChange(e);
              setFocusedIndex(-1);
              // Cancel any pending hide timeout when user types
              if (hideTimeoutRef.current) {
                clearTimeout(hideTimeoutRef.current);
                hideTimeoutRef.current = null;
              }
            }}
            onKeyDown={handleKeyDown}
            onFocus={handleInputFocus}
            onBlur={handleInputBlur}
            placeholder={actualPlaceholder}
            disabled={disabled}
            autoComplete="off"
            aria-label={strings.searchLabel}
            aria-describedby={errors.query ? "search-error search-help" : "search-help"}
            aria-expanded={showSuggestions}
            aria-haspopup="listbox"
            aria-invalid={errors.query ? "true" : "false"}
            role="combobox"
            className={`block w-full pl-10 pr-3 py-3 border rounded-2xl bg-white/80 dark:bg-slate-800/50 text-slate-900 dark:text-slate-100 placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 backdrop-blur-sm shadow-sm hover:shadow-md focus:shadow-lg ${
              errors.query 
                ? 'border-red-300 dark:border-red-500/50 focus:ring-red-400' 
                : 'border-slate-300 dark:border-slate-600'
            }`}
          />
        </div>
        {errors.query && (
          <div 
            id="search-error"
            className="mt-1 ml-3 text-xs text-red-600 dark:text-red-400"
            role="alert"
            aria-live="polite"
          >
            {errors.query.message || 'Please enter a city name to search'}
          </div>
        )}
        <div id="search-help" className="sr-only">
          Press / to focus search, use arrow keys to navigate recent searches, Enter to select
        </div>
      </form>

      {/* Search Suggestions Dropdown */}
      {showSuggestions && (searchResults.length > 0 || recentSearches.length > 0) && (
        <div 
          ref={dropdownRef}
          className="absolute top-full left-0 right-0 mt-3 bg-white/95 dark:bg-slate-800/95 backdrop-blur-xl border border-slate-200/50 dark:border-slate-700/50 rounded-2xl shadow-xl z-50"
          role="listbox"
          aria-label="Search suggestions"
        >
          {/* Search Results */}
          {searchResults.length > 0 && (
            <div className="p-2">
              {searchResults.map((city, index) => (
                <button
                  key={`search-${city.lat}-${city.lon}`}
                  onClick={() => handleCitySelect(city)}
                   className={`w-full text-left px-4 py-3 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700/50 rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:ring-offset-1 focus:ring-offset-white dark:focus:ring-offset-slate-800 ${
                     index === focusedIndex ? 'bg-slate-100 dark:bg-slate-700/50 ring-2 ring-cyan-400' : ''
                   }`}
                  role="option"
                  aria-selected={index === focusedIndex}
                  tabIndex={-1}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-slate-800 dark:text-slate-200">{city.name}</span>
                    <span className="text-xs text-slate-600 dark:text-slate-400">{city.country}</span>
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* Recent Searches */}
          {recentSearches.length > 0 && (
            <>
              <div className="p-3 border-t border-slate-200 dark:border-slate-600">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-medium text-slate-700 dark:text-slate-300">{strings.recentSearches}</h3>
                  <button
                    onClick={handleClearRecent}
                    className="text-slate-400 hover:text-slate-300 transition-colors focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:ring-offset-2 focus:ring-offset-slate-800 rounded"
                    title="Clear recent searches"
                    aria-label={strings.clearRecentSearches}
                  >
                    <XMarkIcon className="h-4 w-4" aria-hidden="true" />
                  </button>
                </div>
              </div>
              <div className="p-2">
                {recentSearches.map((city, index) => (
                  <button
                    key={`recent-${city.lat}-${city.lon}`}
                    onClick={() => handleCitySelect(city)}
                    className={`w-full text-left px-3 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100/60 dark:hover:bg-slate-700/50 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:ring-offset-1 focus:ring-offset-white dark:focus:ring-offset-slate-800 ${
                      (index + searchResults.length) === focusedIndex ? 'bg-slate-100 dark:bg-slate-700/50 ring-2 ring-cyan-400' : ''
                    }`}
                    role="option"
                    aria-selected={(index + searchResults.length) === focusedIndex}
                    tabIndex={-1}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-slate-800 dark:text-slate-200">{city.name}</span>
                      <span className="text-xs text-slate-600 dark:text-slate-400">{city.country}</span>
                    </div>
                  </button>
                ))}
              </div>
            </>
          )}

          {/* Loading State */}
          {isSearching && (
            <div className="p-3 text-center">
              <div className="text-sm text-slate-400">{strings.searching}</div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
