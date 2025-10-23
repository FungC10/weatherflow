'use client';

import { SunIcon, MoonIcon, ComputerDesktopIcon } from '@heroicons/react/24/outline';
import { useTheme } from '@/lib/ThemeContext';

export default function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme();

  const themes = [
    { value: 'light' as const, icon: SunIcon, label: 'Light' },
    { value: 'dark' as const, icon: MoonIcon, label: 'Dark' },
    { value: 'system' as const, icon: ComputerDesktopIcon, label: 'System' },
  ];

  const currentTheme = themes.find(t => t.value === theme) || themes[2];
  const CurrentIcon = currentTheme.icon;

  const cycleTheme = () => {
    const currentIndex = themes.findIndex(t => t.value === theme);
    const nextIndex = (currentIndex + 1) % themes.length;
    setTheme(themes[nextIndex].value);
  };

  return (
    <div className="relative">
      <button
        onClick={cycleTheme}
        className="group relative flex items-center justify-center w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-slate-900 hover:scale-105 active:scale-95"
        aria-label={`Current theme: ${currentTheme.label}. Click to cycle through themes.`}
        title={`Current: ${currentTheme.label}`}
      >
        <CurrentIcon className="w-5 h-5 text-slate-600 dark:text-slate-300 transition-colors duration-200" />
        
        {/* Theme indicator dots */}
        <div className="absolute -bottom-1 -right-1 flex space-x-0.5">
          {themes.map((t, index) => (
            <div
              key={t.value}
              className={`w-1.5 h-1.5 rounded-full transition-all duration-200 ${
                t.value === theme
                  ? 'bg-cyan-500 scale-125'
                  : 'bg-slate-300 dark:bg-slate-600 scale-75'
              }`}
            />
          ))}
        </div>
      </button>

      {/* Tooltip */}
      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 text-xs rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap">
        {currentTheme.label} mode
        <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-2 border-r-2 border-t-2 border-transparent border-t-slate-900 dark:border-t-slate-100"></div>
      </div>
    </div>
  );
}
