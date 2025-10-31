'use client';

import { SunIcon, MoonIcon } from '@heroicons/react/24/outline';
import { useTheme } from '@/lib/ThemeContext';

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  const isLight = theme === 'light';
  const CurrentIcon = isLight ? SunIcon : MoonIcon;

  const toggleTheme = () => {
    setTheme(isLight ? 'dark' : 'light');
  };

  return (
    <div className="relative">
      <button
        onClick={toggleTheme}
        className="group relative flex items-center justify-center w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-slate-900 hover:scale-105 active:scale-95"
        aria-label={`Current theme: ${isLight ? 'Light' : 'Dark'}. Click to toggle.`}
        title={`Current: ${isLight ? 'Light' : 'Dark'}`}
      >
        <CurrentIcon className="w-5 h-5 text-slate-600 dark:text-slate-300 transition-colors duration-200" />
      </button>

      {/* Tooltip */}
      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 text-xs rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap">
        {isLight ? 'Light' : 'Dark'} mode
        <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-2 border-r-2 border-t-2 border-transparent border-t-slate-900 dark:border-t-slate-100"></div>
      </div>
    </div>
  );
}
