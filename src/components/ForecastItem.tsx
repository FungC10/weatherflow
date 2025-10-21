import { memo } from 'react';
import { Units, DailyForecast } from '@/lib/types';
import { formatTemp } from '@/lib/format';
import { getWeatherIcon, getWeatherEmoji, isDayTime } from '@/lib/weatherIcon';

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
  const isDay = weather ? isDayTime(weather.icon) : true;
  const weatherIcon = weather ? getWeatherIcon(weather.id, isDay) : 'unknown';
  const weatherEmoji = getWeatherEmoji(weatherIcon);

  return (
    <div className="bg-white/5 backdrop-blur-sm rounded-lg p-4 border border-slate-700/30 hover:bg-white/10 transition-colors">
      <div className="flex items-center justify-between">
        <div className="flex-1 flex items-center space-x-3">
          <span className="text-2xl">{weatherEmoji}</span>
          <div>
            <h4 className="font-medium text-slate-200 text-sm">{dayName}</h4>
            <p className="text-slate-400 text-xs capitalize">
              {weather?.description || 'Unknown'}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <div className="text-slate-300 text-sm font-medium">
            {formatTemp(forecast.temp.max, units)}
          </div>
          <div className="text-slate-500 text-sm">
            {formatTemp(forecast.temp.min, units)}
          </div>
        </div>
      </div>
    </div>
  );
});

export default ForecastItem;
