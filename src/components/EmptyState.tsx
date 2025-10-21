interface EmptyStateProps {
  title?: string;
  message?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export default function EmptyState({ 
  title = "Welcome to WeatherFlow",
  message = "Search for a city to get started with weather information",
  action
}: EmptyStateProps) {
  return (
    <div className="text-center py-12">
      <div className="text-6xl mb-4">🌤️</div>
      <h2 className="text-2xl font-bold text-slate-200 mb-4">{title}</h2>
      <p className="text-slate-400 mb-6 max-w-md mx-auto">{message}</p>
      {action && (
        <button
          onClick={action.onClick}
          className="inline-flex items-center px-4 py-2 bg-cyan-500 hover:bg-cyan-600 text-white font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:ring-offset-2 focus:ring-offset-slate-900"
        >
          {action.label}
        </button>
      )}
    </div>
  );
}
