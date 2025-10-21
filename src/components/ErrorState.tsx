interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
}

export default function ErrorState({ 
  title = "Something went wrong",
  message = "We couldn't load the weather data. Please try again.",
  onRetry
}: ErrorStateProps) {
  return (
    <div className="text-center py-12">
      <div className="text-6xl mb-4">⚠️</div>
      <h2 className="text-2xl font-bold text-slate-200 mb-4">{title}</h2>
      <p className="text-slate-400 mb-6 max-w-md mx-auto">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="inline-flex items-center px-4 py-2 bg-red-500 hover:bg-red-600 text-white font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-offset-2 focus:ring-offset-slate-900"
        >
          Try Again
        </button>
      )}
    </div>
  );
}
