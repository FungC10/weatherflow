'use client';

import { useState, useEffect } from 'react';
import SearchBar from '@/components/SearchBar';
import UnitToggle from '@/components/UnitToggle';
import CurrentCard from '@/components/CurrentCard';
import ForecastList from '@/components/ForecastList';
import EmptyState from '@/components/EmptyState';
import ErrorState from '@/components/ErrorState';
import LoadingShimmer from '@/components/LoadingShimmer';
import { Units, GeoPoint } from '@/lib/types';

type AppState = 'empty' | 'loading' | 'error' | 'success';

export default function Home() {
  const [state, setState] = useState<AppState>('empty');
  const [selectedCity, setSelectedCity] = useState<GeoPoint | null>(null);
  const [units, setUnits] = useState<Units>('metric');
  const [searchQuery, setSearchQuery] = useState('');

  // Mock data for demonstration
  const mockWeather = selectedCity ? {
    coord: { lat: selectedCity.lat, lon: selectedCity.lon },
    dt: Date.now() / 1000,
    timezone: 0,
    name: selectedCity.name || 'Unknown City',
    weather: [{ id: 800, main: 'Clear', description: 'clear sky', icon: '01d' }],
    main: { 
      temp: units === 'metric' ? 22 : 72, 
      feels_like: units === 'metric' ? 24 : 75, 
      humidity: 65, 
      pressure: 1013 
    },
    wind: { speed: units === 'metric' ? 3.5 : 7.8, deg: 180 }
  } : null;

  const mockForecasts = selectedCity ? Array.from({ length: 5 }, (_, i) => ({
    dt: (Date.now() / 1000) + (i * 86400),
    temp: { 
      min: units === 'metric' ? 15 + i : 59 + i, 
      max: units === 'metric' ? 25 + i : 77 + i 
    },
    weather: [{ id: 800, main: 'Clear', description: 'clear sky', icon: '01d' }]
  })) : [];

  const handleSearch = (query: string) => {
    if (!query.trim()) return;
    
    setSearchQuery(query);
    setState('loading');
    
    // Simulate API call delay
    setTimeout(() => {
      // Mock city selection
      const mockCity: GeoPoint = {
        lat: 40.7128 + (Math.random() - 0.5) * 0.1,
        lon: -74.0060 + (Math.random() - 0.5) * 0.1,
        name: query,
        country: 'US'
      };
      
      setSelectedCity(mockCity);
      setState('success');
    }, 1000);
  };

  const handleUnitsChange = (newUnits: Units) => {
    setUnits(newUnits);
  };

  const handleRetry = () => {
    if (searchQuery) {
      handleSearch(searchQuery);
    }
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    setSelectedCity(null);
    setState('empty');
  };

  return (
    <main className="min-h-screen">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-slate-900/80 backdrop-blur-sm border-b border-slate-700/50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col sm:flex-row items-center justify-between space-y-4 sm:space-y-0">
            <h1 className="text-2xl font-bold text-cyan-300">WeatherFlow</h1>
            <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-4">
              <SearchBar onSearch={handleSearch} />
              <UnitToggle onChange={handleUnitsChange} />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {state === 'empty' && (
            <EmptyState 
              action={{
                label: "Search for a city",
                onClick: () => document.querySelector('input')?.focus()
              }}
            />
          )}

          {state === 'loading' && (
            <LoadingShimmer type="full" />
          )}

          {state === 'error' && (
            <ErrorState onRetry={handleRetry} />
          )}

          {state === 'success' && selectedCity && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-slate-200">
                  Weather for {selectedCity.name}
                </h2>
                <button
                  onClick={handleClearSearch}
                  className="text-slate-400 hover:text-slate-300 text-sm"
                >
                  Clear search
                </button>
              </div>
              
              <CurrentCard 
                weather={mockWeather || undefined}
                location={selectedCity}
                units={units}
              />
              
              <ForecastList 
                forecasts={mockForecasts}
                units={units}
              />
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
