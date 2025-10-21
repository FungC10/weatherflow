import { Units } from '@/lib/types';

interface DailyForecast {
  dt: number;
  temp: { min: number; max: number };
  weather: { id: number; main: string; description: string; icon: string }[];
}

interface ForecastItemProps {
  forecast: DailyForecast;
  units: Units;
  isToday?: boolean;
}

export default function ForecastItem({ forecast, units, isToday = false }: ForecastItemProps) {
  const tempUnit = units === 'metric' ? '°C' : '°F';
  const dayName = isToday 
    ? 'Today' 
    : new Date(forecast.dt * 1000).toLocaleDateString('en-US', { weekday: 'short' });

  return (
    <div className="bg-white/5 backdrop-blur-sm rounded-lg p-4 border border-slate-700/30 hover:bg-white/10 transition-colors">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <h4 className="font-medium text-slate-200 text-sm">{dayName}</h4>
          <p className="text-slate-400 text-xs capitalize">
            {forecast.weather[0]?.description || 'Unknown'}
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <div className="text-slate-300 text-sm">
            {Math.round(forecast.temp.max)}{tempUnit}
          </div>
          <div className="text-slate-500 text-sm">
            {Math.round(forecast.temp.min)}{tempUnit}
          </div>
        </div>
      </div>
    </div>
  );
}
