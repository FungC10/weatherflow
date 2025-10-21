'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { MagnifyingGlassIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { getRecentSearches, clearRecentSearches } from '@/lib/storage';

interface SearchBarProps {
  onSearch: (query: string) => void;
  placeholder?: string;
  disabled?: boolean;
}

export default function SearchBar({ 
  onSearch, 
  placeholder = "Search for a city...",
  disabled = false 
}: SearchBarProps) {
  const [query, setQuery] = useState('');
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [showRecent, setShowRecent] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

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

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      if (query.trim()) {
        onSearch(query.trim());
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query, onSearch]);

  // Handle escape key to close dropdown
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && showRecent) {
        setShowRecent(false);
        setFocusedIndex(-1);
        inputRef.current?.focus();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [showRecent]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch(query.trim());
      setShowRecent(false);
      setFocusedIndex(-1);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showRecent || recentSearches.length === 0) {
      if (e.key === 'Enter') {
        handleSubmit(e);
      }
      return;
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setFocusedIndex(prev => 
          prev < recentSearches.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setFocusedIndex(prev => 
          prev > 0 ? prev - 1 : recentSearches.length - 1
        );
        break;
      case 'Enter':
        e.preventDefault();
        if (focusedIndex >= 0 && focusedIndex < recentSearches.length) {
          handleRecentClick(recentSearches[focusedIndex]);
        } else {
          handleSubmit(e);
        }
        break;
      case 'Escape':
        e.preventDefault();
        setShowRecent(false);
        setFocusedIndex(-1);
        break;
    }
  };

  const handleRecentClick = useCallback((search: string) => {
    setQuery(search);
    onSearch(search);
    setShowRecent(false);
    setFocusedIndex(-1);
    inputRef.current?.focus();
  }, [onSearch]);

  const handleClearRecent = () => {
    clearRecentSearches();
    setRecentSearches([]);
    setFocusedIndex(-1);
  };

  const handleInputFocus = () => {
    if (recentSearches.length > 0) {
      setShowRecent(true);
    }
  };

  const handleInputBlur = () => {
    // Delay hiding to allow clicking on recent items
    setTimeout(() => {
      setShowRecent(false);
      setFocusedIndex(-1);
    }, 150);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
    setFocusedIndex(-1);
  };

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
            aria-expanded={showRecent}
            aria-haspopup="listbox"
            role="combobox"
            className="block w-full pl-10 pr-3 py-3 border border-slate-600 rounded-lg bg-slate-800/50 text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 backdrop-blur-sm"
          />
        </div>
        <div id="search-help" className="sr-only">
          Press / to focus search, use arrow keys to navigate recent searches, Enter to select
        </div>
      </form>

      {/* Recent Searches Dropdown */}
      {showRecent && recentSearches.length > 0 && (
        <div 
          ref={dropdownRef}
          className="absolute top-full left-0 right-0 mt-2 bg-slate-800/95 backdrop-blur-sm border border-slate-600 rounded-lg shadow-lg z-50"
          role="listbox"
          aria-label="Recent searches"
        >
          <div className="p-3 border-b border-slate-600">
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
                key={index}
                onClick={() => handleRecentClick(search)}
                className={`w-full text-left px-3 py-2 text-sm text-slate-300 hover:bg-slate-700/50 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:ring-offset-1 focus:ring-offset-slate-800 ${
                  index === focusedIndex ? 'bg-slate-700/50 ring-2 ring-cyan-400' : ''
                }`}
                role="option"
                aria-selected={index === focusedIndex}
                tabIndex={-1}
              >
                {search}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
