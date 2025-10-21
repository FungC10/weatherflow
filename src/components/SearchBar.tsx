'use client';

import { useState, useEffect } from 'react';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';

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
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSubmit(e);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-md mx-auto">
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <MagnifyingGlassIcon className="h-5 w-5 text-slate-400" />
        </div>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          className="block w-full pl-10 pr-3 py-3 border border-slate-600 rounded-lg bg-slate-800/50 text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
        />
      </div>
    </form>
  );
}
