'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { MagnifyingGlassIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { getRecentSearches, clearRecentSearches, addRecentSearch } from '@/lib/storage';
import { searchCity } from '@/lib/api';
import { queryKeys } from '@/lib/queryKeys';
import { GeoPoint } from '@/lib/types';

interface SearchBarProps {
  onCitySelect: (city: GeoPoint) => void;
  placeholder?: string;
  disabled?: boolean;
}

export default function SearchBar({ 
  onCitySelect, 
  placeholder = "Search for a city...",
  disabled = false 
}: SearchBarProps) {
  const [query, setQuery] = useState('');
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Debounced search query
  const [debouncedQuery, setDebouncedQuery] = useState('');

  // Debounce the search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

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
      setRecentSearches(getRecentSearches());
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

  // Show suggestions when we have search results or recent searches
  useEffect(() => {
    const hasResults = searchResults.length > 0 || recentSearches.length > 0;
    setShowSuggestions(hasResults && (query.length > 0 || recentSearches.length > 0));
  }, [searchResults, recentSearches, query]);

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim() && searchResults.length > 0) {
      // Select the first search result
      handleCitySelect(searchResults[0]);
    }
  };

  const handleCitySelect = useCallback((city: GeoPoint) => {
    onCitySelect(city);
    setQuery(city.name || '');
    setShowSuggestions(false);
    setFocusedIndex(-1);
    if (city.name) {
      addRecentSearch(city.name);
    }
  }, [onCitySelect]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    const recentSearchOptions = recentSearches.map(name => ({ name, type: 'recent' as const }));
    const allOptions = [...searchResults.map(city => ({ ...city, type: 'search' as const })), ...recentSearchOptions];
    
    if (!showSuggestions || allOptions.length === 0) {
      if (e.key === 'Enter') {
        handleSubmit(e);
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
            handleCitySelect(selected as GeoPoint);
          } else if (selected.type === 'recent') {
            // This is a recent search string, we need to search for it
            setQuery(selected.name);
          }
        } else {
          handleSubmit(e);
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
    if (recentSearches.length > 0 || searchResults.length > 0) {
      setShowSuggestions(true);
    }
  }, [recentSearches.length, searchResults.length]);

  const handleInputBlur = useCallback(() => {
    // Delay hiding to allow clicking on suggestions
    setTimeout(() => {
      setShowSuggestions(false);
      setFocusedIndex(-1);
    }, 150);
  }, []);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
    setFocusedIndex(-1);
  }, []);


  return (
    <div className="w-full max-w-md mx-auto relative">
      <form onSubmit={handleSubmit} role="search" aria-label="Search for weather">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <MagnifyingGlassIcon className="h-5 w-5 text-slate-400" aria-hidden="true" />
          </div>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            onFocus={handleInputFocus}
            onBlur={handleInputBlur}
            placeholder={placeholder}
            disabled={disabled}
            autoComplete="off"
            aria-label="Search for a city"
            aria-describedby="search-help"
                    aria-expanded={showSuggestions}
                    aria-haspopup="listbox"
                    role="combobox"
            className="block w-full pl-10 pr-3 py-3 border border-slate-600 rounded-lg bg-slate-800/50 text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 backdrop-blur-sm"
          />
        </div>
        <div id="search-help" className="sr-only">
          Press / to focus search, use arrow keys to navigate recent searches, Enter to select
        </div>
      </form>

      {/* Search Suggestions Dropdown */}
      {showSuggestions && (searchResults.length > 0 || recentSearches.length > 0) && (
        <div 
          ref={dropdownRef}
          className="absolute top-full left-0 right-0 mt-2 bg-slate-800/95 backdrop-blur-sm border border-slate-600 rounded-lg shadow-lg z-50"
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
                  className={`w-full text-left px-3 py-2 text-sm text-slate-300 hover:bg-slate-700/50 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:ring-offset-1 focus:ring-offset-slate-800 ${
                    index === focusedIndex ? 'bg-slate-700/50 ring-2 ring-cyan-400' : ''
                  }`}
                  role="option"
                  aria-selected={index === focusedIndex}
                  tabIndex={-1}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{city.name}</span>
                    <span className="text-xs text-slate-400">{city.country}</span>
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* Recent Searches */}
          {recentSearches.length > 0 && (
            <>
              <div className="p-3 border-t border-slate-600">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-medium text-slate-300">Recent Searches</h3>
                  <button
                    onClick={handleClearRecent}
                    className="text-slate-400 hover:text-slate-300 transition-colors focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:ring-offset-2 focus:ring-offset-slate-800 rounded"
                    title="Clear recent searches"
                    aria-label="Clear all recent searches"
                  >
                    <XMarkIcon className="h-4 w-4" aria-hidden="true" />
                  </button>
                </div>
              </div>
              <div className="p-2">
                {recentSearches.map((search, index) => (
                  <button
                    key={`recent-${index}`}
                    onClick={() => setQuery(search)}
                    className={`w-full text-left px-3 py-2 text-sm text-slate-300 hover:bg-slate-700/50 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:ring-offset-1 focus:ring-offset-slate-800 ${
                      (index + searchResults.length) === focusedIndex ? 'bg-slate-700/50 ring-2 ring-cyan-400' : ''
                    }`}
                    role="option"
                    aria-selected={(index + searchResults.length) === focusedIndex}
                    tabIndex={-1}
                  >
                    {search}
                  </button>
                ))}
              </div>
            </>
          )}

          {/* Loading State */}
          {isSearching && (
            <div className="p-3 text-center">
              <div className="text-sm text-slate-400">Searching...</div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
