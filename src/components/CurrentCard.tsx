import { memo } from 'react';
import { GeoPoint, Units, CurrentWeather } from '@/lib/types';
import { formatTemp, formatWind, formatPressure, formatDate, getWindDirection } from '@/lib/format';

interface CurrentCardProps {
  weather?: CurrentWeather;
  location?: GeoPoint;
  units: Units;
  isLoading?: boolean;
}

const CurrentCard = memo(function CurrentCard({ weather, location, units, isLoading = false }: CurrentCardProps) {
  if (isLoading) {
    return (
      <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50">
        <div className="animate-pulse">
          <div className="h-6 bg-slate-700 rounded w-1/3 mb-4"></div>
          <div className="h-12 bg-slate-700 rounded w-1/2 mb-4"></div>
          <div className="space-y-2">
            <div className="h-4 bg-slate-700 rounded w-3/4"></div>
            <div className="h-4 bg-slate-700 rounded w-1/2"></div>
            <div className="h-4 bg-slate-700 rounded w-2/3"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!weather) {
    return (
      <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50 text-center">
        <div className="text-slate-400 mb-2">🌤️</div>
        <h3 className="text-lg font-medium text-slate-300 mb-2">No Weather Data</h3>
        <p className="text-slate-400 text-sm">
          Search for a city to see current weather conditions
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-100">{weather.name}</h2>
          <p className="text-slate-400 text-sm">
            {formatDate(weather.dt, weather.timezone)}
          </p>
        </div>
        <div className="text-right">
          <div className="text-4xl font-bold text-cyan-300">
            {formatTemp(weather.main.temp, units)}
          </div>
          <p className="text-slate-400 text-sm">
            Feels like {formatTemp(weather.main.feels_like, units)}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 text-sm">
        <div className="flex items-center space-x-2">
          <span className="text-slate-400">💨</span>
          <span className="text-slate-300">
            {formatWind(weather.wind.speed, units)} {getWindDirection(weather.wind.deg)}
          </span>
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-slate-400">💧</span>
          <span className="text-slate-300">
            {weather.main.humidity}%
          </span>
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-slate-400">📊</span>
          <span className="text-slate-300">
            {formatPressure(weather.main.pressure, units)}
          </span>
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-slate-400">🌡️</span>
          <span className="text-slate-300 capitalize">
            {weather.weather[0]?.description || 'Unknown'}
          </span>
        </div>
      </div>
    </div>
  );
});

export default CurrentCard;
