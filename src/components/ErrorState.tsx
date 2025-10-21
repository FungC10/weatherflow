import { useEffect, useRef } from 'react';

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  autoFocus?: boolean;
}

export default function ErrorState({ 
  title = "Something went wrong",
  message = "We couldn't load the weather data. Please try again.",
  onRetry,
  autoFocus = true
}: ErrorStateProps) {
  const retryButtonRef = useRef<HTMLButtonElement>(null);

  // Auto-focus retry button when error appears
  useEffect(() => {
    if (autoFocus && onRetry && retryButtonRef.current) {
      retryButtonRef.current.focus();
    }
  }, [autoFocus, onRetry]);

  return (
    <div 
      className="text-center py-12" 
      role="alert" 
      aria-live="assertive"
      aria-labelledby="error-title"
      aria-describedby="error-message"
    >
      <div className="text-6xl mb-4" aria-hidden="true">⚠️</div>
      <h2 id="error-title" className="text-2xl font-bold text-slate-200 mb-4">
        {title}
      </h2>
      <p id="error-message" className="text-slate-400 mb-6 max-w-md mx-auto">
        {message}
      </p>
      {onRetry && (
        <button
          ref={retryButtonRef}
          onClick={onRetry}
          className="inline-flex items-center px-6 py-3 bg-red-500 hover:bg-red-600 text-white font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-offset-2 focus:ring-offset-slate-900 hover:shadow-lg hover:scale-105 active:scale-95"
          aria-label={`${title}. ${message} Click to retry.`}
        >
          <svg 
            className="w-4 h-4 mr-2" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" 
            />
          </svg>
          Try Again
        </button>
      )}
    </div>
  );
}
