import { useStrings } from '@/lib/LocaleContext';

interface LoadingShimmerProps {
  type?: 'card' | 'list' | 'full';
  message?: string;
}

export default function LoadingShimmer({ 
  type = 'card', 
  message
}: LoadingShimmerProps) {
  const strings = useStrings();
  const actualMessage = message || strings.loadingWeather;
  if (type === 'full') {
    return (
      <div className="space-y-8 w-full" role="status" aria-live="polite" aria-label={actualMessage}>
        {/* City Header Skeleton */}
        <div className="text-center">
          <div className="flex items-center justify-center space-x-4 mb-6">
            <div className="h-12 bg-slate-200/60 dark:bg-slate-700/60 rounded-lg w-48 animate-pulse"></div>
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 bg-slate-200/60 dark:bg-slate-700/60 rounded-2xl animate-pulse"></div>
              <div className="h-10 w-10 bg-slate-200/60 dark:bg-slate-700/60 rounded-lg animate-pulse"></div>
            </div>
          </div>
        </div>

        {/* Weather Cards Grid Skeleton - matches actual layout */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 w-full">
          {/* Current Weather Card - 2 columns on XL */}
          <div className="xl:col-span-2 h-full">
            <div className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-xl rounded-3xl p-6 md:p-8 border border-slate-200/50 dark:border-slate-700/50 shadow-xl h-full animate-pulse">
              <div className="flex items-start justify-between gap-4 mb-4">
                <div className="flex-1 min-w-0">
                  <div className="h-8 md:h-10 xl:h-12 bg-slate-200/60 dark:bg-slate-700/60 rounded w-40 mb-2"></div>
                  <div className="h-4 md:h-5 bg-slate-200/60 dark:bg-slate-700/60 rounded w-32"></div>
                </div>
                <div className="text-right">
                  <div className="h-16 md:h-20 xl:h-24 bg-slate-200/60 dark:bg-slate-700/60 rounded w-24 mb-2"></div>
                  <div className="h-4 bg-slate-200/60 dark:bg-slate-700/60 rounded w-20"></div>
                </div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mt-2">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <div className="h-5 w-5 bg-slate-200/60 dark:bg-slate-700/60 rounded"></div>
                    <div className="h-5 bg-slate-200/60 dark:bg-slate-700/60 rounded flex-1"></div>
                  </div>
                ))}
              </div>
              <div className="mt-6">
                <div className="h-20 bg-slate-200/60 dark:bg-slate-700/60 rounded-lg"></div>
              </div>
            </div>
          </div>

          {/* Map Card - 1 column on XL */}
          <div className="space-y-6 h-full">
            <div className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-xl rounded-3xl p-6 border border-slate-200/50 dark:border-slate-700/50 shadow-lg h-full flex flex-col animate-pulse">
              <div className="flex items-center justify-between mb-4">
                <div className="h-7 bg-slate-200/60 dark:bg-slate-700/60 rounded w-24"></div>
                <div className="h-10 w-10 bg-slate-200/60 dark:bg-slate-700/60 rounded-2xl"></div>
              </div>
              <div className="flex-1 min-h-[16rem] bg-slate-200/60 dark:bg-slate-700/60 rounded-2xl"></div>
            </div>
          </div>
        </div>

        {/* Forecast Section Skeleton */}
        <div className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-xl rounded-3xl p-8 border border-slate-200/50 dark:border-slate-700/50 shadow-lg">
          <div className="space-y-3">
            <div className="h-7 bg-slate-200/60 dark:bg-slate-700/60 rounded w-40 mb-4 animate-pulse"></div>
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="bg-slate-50/60 dark:bg-white/5 backdrop-blur-sm rounded-lg p-4 border border-slate-200/60 dark:border-slate-700/30 animate-pulse">
                <div className="flex items-center justify-between">
                  <div className="flex-1 flex items-center space-x-4">
                    <div className="h-10 w-10 bg-slate-200/60 dark:bg-slate-700/60 rounded"></div>
                    <div className="flex-1">
                      <div className="h-5 bg-slate-200/60 dark:bg-slate-700/60 rounded w-20 mb-2"></div>
                      <div className="h-4 bg-slate-200/60 dark:bg-slate-700/60 rounded w-32"></div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="h-6 bg-slate-200/60 dark:bg-slate-700/60 rounded w-16 mb-1"></div>
                    <div className="h-4 bg-slate-200/60 dark:bg-slate-700/60 rounded w-12"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="sr-only">{actualMessage}</div>
      </div>
    );
  }

  if (type === 'list') {
    return (
      <div className="space-y-2" role="status" aria-live="polite" aria-label={actualMessage}>
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="bg-white/5 backdrop-blur-sm rounded-lg p-4 border border-slate-700/30 shadow-sm">
            <div className="animate-pulse">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="h-4 bg-slate-700/60 rounded w-16 mb-2"></div>
                  <div className="h-3 bg-slate-700/60 rounded w-24"></div>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="h-4 bg-slate-700/60 rounded w-8"></div>
                  <div className="h-4 bg-slate-700/60 rounded w-8"></div>
                </div>
              </div>
            </div>
          </div>
        ))}
        <div className="sr-only">{actualMessage}</div>
      </div>
    );
  }

  // Default card type
  return (
    <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50 shadow-lg" role="status" aria-live="polite" aria-label={actualMessage}>
      <div className="animate-pulse">
        <div className="h-6 bg-slate-700/60 rounded w-1/3 mb-4"></div>
        <div className="h-12 bg-slate-700/60 rounded w-1/2 mb-4"></div>
        <div className="space-y-2">
          <div className="h-4 bg-slate-700/60 rounded w-3/4"></div>
          <div className="h-4 bg-slate-700/60 rounded w-1/2"></div>
          <div className="h-4 bg-slate-700/60 rounded w-2/3"></div>
        </div>
      </div>
      <div className="sr-only">{message}</div>
    </div>
  );
}
