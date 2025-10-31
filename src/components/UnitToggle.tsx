'use client';

import { useState, useEffect, memo, useCallback } from 'react';
import { setJSON, getJSON } from '@/lib/storage';
import { Units } from '@/lib/types';

interface UnitToggleProps {
  onChange: (units: Units) => void;
  disabled?: boolean;
}

const UnitToggle = memo(function UnitToggle({ onChange, disabled = false }: UnitToggleProps) {
  const [units, setUnits] = useState<Units>('metric');

  // Load units from localStorage on mount
  useEffect(() => {
    const savedUnits = getJSON<Units>('weatherflow:units');
    if (savedUnits && (savedUnits === 'metric' || savedUnits === 'imperial')) {
      setUnits(savedUnits);
      onChange(savedUnits);
    }
  }, [onChange]);

  const handleToggle = useCallback(() => {
    const newUnits = units === 'metric' ? 'imperial' : 'metric';
    setUnits(newUnits);
    setJSON('weatherflow:units', newUnits);
    onChange(newUnits);
  }, [units, onChange]);

  return (
    <div className="flex items-center space-x-2">
      <span className="text-sm text-slate-600 dark:text-slate-300" id="units-label">Units:</span>
      <button
        onClick={handleToggle}
        disabled={disabled}
        className="group relative flex items-center justify-center w-12 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-slate-900 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 active:scale-95"
        role="switch"
        aria-checked={units === 'imperial'}
        aria-labelledby="units-label"
        aria-describedby="units-description"
      >
        <span className="text-sm font-medium text-slate-700 dark:text-slate-200">
          {units === 'metric' ? '°C' : '°F'}
        </span>
      </button>
      <div id="units-description" className="sr-only">
        Currently set to {units === 'metric' ? 'Celsius' : 'Fahrenheit'}. Click to switch to {units === 'metric' ? 'Fahrenheit' : 'Celsius'}.
      </div>
    </div>
  );
});

export default UnitToggle;
