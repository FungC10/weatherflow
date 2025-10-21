import { Units } from '@/lib/types';
import ForecastItem from './ForecastItem';

interface DailyForecast {
  dt: number;
  temp: { min: number; max: number };
  weather: { id: number; main: string; description: string; icon: string }[];
}

interface ForecastListProps {
  forecasts?: DailyForecast[];
  units: Units;
  isLoading?: boolean;
}

export default function ForecastList({ forecasts, units, isLoading = false }: ForecastListProps) {
  if (isLoading) {
    return (
      <div className="space-y-3">
        <h3 className="text-lg font-semibold text-slate-200 mb-4">5-Day Forecast</h3>
        {Array.from({ length: 5 }).map((_, index) => (
          <div key={index} className="bg-white/5 backdrop-blur-sm rounded-lg p-4 border border-slate-700/30">
            <div className="animate-pulse">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="h-4 bg-slate-700 rounded w-16 mb-2"></div>
                  <div className="h-3 bg-slate-700 rounded w-24"></div>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="h-4 bg-slate-700 rounded w-8"></div>
                  <div className="h-4 bg-slate-700 rounded w-8"></div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!forecasts || forecasts.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="text-slate-400 mb-2">📅</div>
        <h3 className="text-lg font-semibold text-slate-200 mb-2">No Forecast Data</h3>
        <p className="text-slate-400 text-sm">
          Search for a city to see the 5-day forecast
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <h3 className="text-lg font-semibold text-slate-200 mb-4">5-Day Forecast</h3>
      <div className="space-y-2">
        {forecasts.slice(0, 5).map((forecast, index) => (
          <ForecastItem
            key={forecast.dt}
            forecast={forecast}
            units={units}
            isToday={index === 0}
          />
        ))}
      </div>
    </div>
  );
}
