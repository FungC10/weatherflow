interface LoadingShimmerProps {
  type?: 'card' | 'list' | 'full';
  message?: string;
}

export default function LoadingShimmer({ 
  type = 'card', 
  message = "Loading weather data..." 
}: LoadingShimmerProps) {
  if (type === 'full') {
    return (
      <div className="space-y-6" role="status" aria-live="polite" aria-label={message}>
        {/* Current weather card skeleton */}
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50 shadow-lg">
          <div className="animate-pulse">
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="h-6 bg-slate-700/60 rounded w-32 mb-2"></div>
                <div className="h-4 bg-slate-700/60 rounded w-24"></div>
              </div>
              <div className="text-right">
                <div className="h-12 bg-slate-700/60 rounded w-20 mb-2"></div>
                <div className="h-4 bg-slate-700/60 rounded w-16"></div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex items-center space-x-2">
                  <div className="h-4 w-4 bg-slate-700/60 rounded"></div>
                  <div className="h-4 bg-slate-700/60 rounded w-16"></div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Forecast list skeleton */}
        <div className="space-y-3">
          <div className="h-6 bg-slate-700/60 rounded w-32 mb-4"></div>
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
        </div>
        <div className="sr-only">{message}</div>
      </div>
    );
  }

  if (type === 'list') {
    return (
      <div className="space-y-2" role="status" aria-live="polite" aria-label={message}>
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
        <div className="sr-only">{message}</div>
      </div>
    );
  }

  // Default card type
  return (
    <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50 shadow-lg" role="status" aria-live="polite" aria-label={message}>
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
