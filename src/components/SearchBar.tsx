'use client';

import { useState, useEffect } from 'react';
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

  // Load recent searches on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setRecentSearches(getRecentSearches());
    }
  }, []);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      if (query.trim()) {
        onSearch(query.trim());
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query, onSearch]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch(query.trim());
      setShowRecent(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSubmit(e);
    }
  };

  const handleRecentClick = (search: string) => {
    setQuery(search);
    onSearch(search);
    setShowRecent(false);
  };

  const handleClearRecent = () => {
    clearRecentSearches();
    setRecentSearches([]);
  };

  const handleInputFocus = () => {
    if (recentSearches.length > 0) {
      setShowRecent(true);
    }
  };

  const handleInputBlur = () => {
    // Delay hiding to allow clicking on recent items
    setTimeout(() => setShowRecent(false), 150);
  };

  return (
    <div className="w-full max-w-md mx-auto relative">
      <form onSubmit={handleSubmit}>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <MagnifyingGlassIcon className="h-5 w-5 text-slate-400" />
          </div>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={handleInputFocus}
            onBlur={handleInputBlur}
            placeholder={placeholder}
            disabled={disabled}
            className="block w-full pl-10 pr-3 py-3 border border-slate-600 rounded-lg bg-slate-800/50 text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
          />
        </div>
      </form>

      {/* Recent Searches Dropdown */}
      {showRecent && recentSearches.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-slate-800/95 backdrop-blur-sm border border-slate-600 rounded-lg shadow-lg z-50">
          <div className="p-3 border-b border-slate-600">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-slate-300">Recent Searches</h3>
              <button
                onClick={handleClearRecent}
                className="text-slate-400 hover:text-slate-300 transition-colors"
                title="Clear recent searches"
              >
                <XMarkIcon className="h-4 w-4" />
              </button>
            </div>
          </div>
          <div className="p-2">
            {recentSearches.map((search, index) => (
              <button
                key={index}
                onClick={() => handleRecentClick(search)}
                className="w-full text-left px-3 py-2 text-sm text-slate-300 hover:bg-slate-700/50 rounded-md transition-colors"
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
