import { memo } from 'react';
import { Units, DailyForecast } from '@/lib/types';
import { formatTemp } from '@/lib/format';
import { getOpenMeteoWeatherIcon, getVariedWeatherEmoji, getVariedWeatherDescription, isOpenMeteoDayTime } from '@/lib/weatherIconOpenMeteo';

interface ForecastItemProps {
  forecast: DailyForecast;
  units: Units;
  isToday?: boolean;
}

const ForecastItem = memo(function ForecastItem({ forecast, units, isToday = false }: ForecastItemProps) {
  const dayName = isToday 
    ? 'Today' 
    : new Date(forecast.dt * 1000).toLocaleDateString('en-US', { weekday: 'short' });

  const weather = forecast.weather[0];
  const isDay = isOpenMeteoDayTime(forecast.dt);
  const weatherIcon = weather ? getOpenMeteoWeatherIcon(weather.id, isDay) : 'unknown';
  const weatherEmoji = weather ? getVariedWeatherEmoji(weather.id, weatherIcon, forecast.dt) : '🌤️';

  const maxTemp = formatTemp(forecast.temp.max, units);
  const minTemp = formatTemp(forecast.temp.min, units);
  const description = weather ? getVariedWeatherDescription(weather.id, forecast.dt) : 'Unknown conditions';

  return (
    <div 
      className="bg-white/5 backdrop-blur-sm rounded-lg p-4 border border-slate-700/30 hover:bg-white/10 transition-all duration-200 hover:shadow-lg"
      role="listitem"
      aria-label={`${dayName} forecast: ${description}, high ${maxTemp}, low ${minTemp}`}
    >
      <div className="flex items-center justify-between">
        <div className="flex-1 flex items-center space-x-4">
          <div className="text-3xl" aria-hidden="true">{weatherEmoji}</div>
          <div className="flex-1">
            <h4 className="font-semibold text-slate-200 text-base">{dayName}</h4>
            <p className="text-slate-400 text-sm capitalize" aria-label={`Weather condition: ${description}`}>
              {description}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <div className="text-right">
            <div className="text-slate-200 text-lg font-semibold" aria-label={`High temperature ${maxTemp}`}>
              {maxTemp}
            </div>
            <div className="text-slate-500 text-sm" aria-label={`Low temperature ${minTemp}`}>
              {minTemp}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

export default ForecastItem;
