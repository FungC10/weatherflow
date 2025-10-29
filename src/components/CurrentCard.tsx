import { memo } from 'react';
import { GeoPoint, Units, CurrentWeather, HourlyData } from '@/lib/types';
import { formatTemp, formatWind, formatPressure, formatDate, getWindDirection } from '@/lib/format';
import { useStrings } from '@/lib/LocaleContext';
import dynamic from 'next/dynamic';
import FavoriteButton from './FavoriteButton';

// Dynamic import for HourlySparkline to avoid loading Chart.js on mobile
const HourlySparkline = dynamic(() => import('./HourlySparkline'), {
  ssr: false,
  loading: () => null
});

interface CurrentCardProps {
  weather?: CurrentWeather;
  location?: GeoPoint;
  units: Units;
  isLoading?: boolean;
  hourlyData?: HourlyData[];
}

const CurrentCard = memo(function CurrentCard({ weather, location, units, isLoading = false, hourlyData }: CurrentCardProps) {
  const strings = useStrings();
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

  const tempValue = formatTemp(weather.main.temp, units);
  const feelsLikeValue = formatTemp(weather.main.feels_like, units);
  const windValue = formatWind(weather.wind.speed, units);
  const windDirection = getWindDirection(weather.wind.deg);
  const pressureValue = formatPressure(weather.main.pressure, units);
  const humidityValue = weather.main.humidity;
  const description = weather.weather[0]?.description || 'Unknown';

  return (
    <div className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-xl rounded-3xl p-6 md:p-8 border border-slate-200/50 dark:border-slate-700/50 shadow-xl h-full flex flex-col" role="region" aria-labelledby="current-weather-title">
      <div className="flex items-start justify-between gap-4 mb-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 flex-wrap">
            <h2 id="current-weather-title" className="text-xl md:text-2xl xl:text-3xl font-bold text-slate-800 dark:text-slate-100 truncate">{weather.name}</h2>
            {location && (
              <FavoriteButton 
                city={location} 
                className="flex-shrink-0"
              />
            )}
          </div>
          <p className="text-slate-600 dark:text-slate-400 text-xs md:text-sm" aria-label={`${strings.lastUpdated} ${formatDate(weather.dt, weather.timezone)}`}>
            {formatDate(weather.dt, weather.timezone)}
          </p>
        </div>
        <div className="text-right">
          <div className="text-5xl md:text-6xl xl:text-7xl font-bold text-cyan-600 dark:text-cyan-300 leading-none" aria-label={`${strings.temperature} ${tempValue}`}>
            {tempValue}
          </div>
          <p className="text-slate-600 dark:text-slate-400 text-xs md:text-sm" aria-label={`${strings.feelsLike} ${feelsLikeValue}`}>
            {strings.feelsLike} {feelsLikeValue}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 text-sm md:text-base mt-2" role="group" aria-label={strings.weatherDetails}>
        <div className="flex items-center gap-2">
          <span className="text-lg" aria-hidden="true">💨</span>
          <span className="text-slate-700 dark:text-slate-300" aria-label={`${strings.wind} ${windValue} ${windDirection}`}>
            {windValue} {windDirection}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-lg" aria-hidden="true">💧</span>
          <span className="text-slate-700 dark:text-slate-300" aria-label={`${strings.humidity} ${humidityValue} percent`}>
            {humidityValue}%
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-lg" aria-hidden="true">📊</span>
          <span className="text-slate-700 dark:text-slate-300" aria-label={`${strings.pressure} ${pressureValue}`}>
            {pressureValue}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-lg" aria-hidden="true">🌡️</span>
          <span className="text-slate-700 dark:text-slate-300 capitalize" aria-label={`${strings.weatherCondition} ${description}`}>
            {description}
          </span>
        </div>
      </div>

      {/* Hourly Temperature Sparkline - Desktop Only, always show when data exists */}
      {hourlyData && hourlyData.length > 0 && (
        <div className="mt-4 md:mt-6 hidden md:block" id="hourly-sparkline">
          <HourlySparkline 
            hourlyData={hourlyData} 
            units={units}
            className="w-full"
          />
        </div>
      )}
      
      {/* Spacer to push content if needed */}
      <div className="mt-auto" />
    </div>
  );
});

export default CurrentCard;
