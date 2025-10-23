import { useStrings } from '@/lib/LocaleContext';

interface EmptyStateProps {
  title?: string;
  message?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export default function EmptyState({ 
  title,
  message,
  action
}: EmptyStateProps) {
  const strings = useStrings();
  const actualTitle = title || strings.welcomeTitle;
  const actualMessage = message || strings.welcomeMessage;
  return (
    <div className="text-center py-12" role="region" aria-labelledby="empty-state-title">
      <div className="text-6xl mb-4" aria-hidden="true">🌤️</div>
      <h2 id="empty-state-title" className="text-2xl font-bold text-slate-800 dark:text-slate-200 mb-4">{actualTitle}</h2>
      <p className="text-slate-600 dark:text-slate-400 mb-6 max-w-md mx-auto">{actualMessage}</p>
      {action && (
        <button
          onClick={action.onClick}
          className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white font-medium rounded-2xl transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-slate-900 hover:shadow-lg hover:scale-105 active:scale-95"
          aria-label={`${action.label}. ${strings.pressEnterToActivate}`}
        >
          {action.label}
        </button>
      )}
    </div>
  );
}
