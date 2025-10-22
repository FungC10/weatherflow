import { memo, useMemo } from 'react';
import { Units, DailyForecast } from '@/lib/types';
import ForecastItem from './ForecastItem';
import { motion } from 'framer-motion';
import { useStrings } from '@/lib/LocaleContext';

interface ForecastListProps {
  forecasts?: DailyForecast[];
  units: Units;
  isLoading?: boolean;
}

const ForecastList = memo(function ForecastList({ forecasts, units, isLoading = false }: ForecastListProps) {
  const strings = useStrings();
  // Memoize the loading skeleton to prevent re-creation
  const loadingSkeleton = useMemo(() => (
    <div className="space-y-3">
      <h3 className="text-lg font-semibold text-slate-200 mb-4">{strings.forecastTitle}</h3>
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
  ), []);

  // Memoize the empty state
  const emptyState = useMemo(() => (
    <div className="text-center py-8">
      <div className="text-slate-400 mb-2">📅</div>
      <h3 className="text-lg font-semibold text-slate-200 mb-2">{strings.noForecastData}</h3>
      <p className="text-slate-400 text-sm">
        {strings.noForecastDescription}
      </p>
    </div>
  ), []);

  if (isLoading) {
    return loadingSkeleton;
  }

  if (!forecasts || forecasts.length === 0) {
    return emptyState;
  }

  // Memoize the animation variants to prevent re-creation
  const containerVariants = useMemo(() => ({
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    transition: { duration: 0.3 }
  }), []);

  const itemVariants = useMemo(() => ({
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: (index: number) => ({ 
      duration: 0.3, 
      delay: index * 0.1,
      ease: "easeOut" as const
    })
  }), []);

  return (
    <div className="space-y-3">
      <h3 id="forecast-heading" className="text-lg font-semibold text-slate-200 mb-4">{strings.forecastTitle}</h3>
      <motion.div 
        className="space-y-2"
        role="list"
        aria-labelledby="forecast-heading"
        aria-label={strings.forecastList}
        {...containerVariants}
      >
        {forecasts.slice(0, 5).map((forecast, index) => (
          <motion.div
            key={forecast.dt}
            initial={itemVariants.initial}
            animate={itemVariants.animate}
            transition={itemVariants.transition(index)}
          >
            <ForecastItem
              forecast={forecast}
              units={units}
              isToday={index === 0}
            />
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
});

export default ForecastList;
