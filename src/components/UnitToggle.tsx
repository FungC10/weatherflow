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
        className="relative inline-flex h-10 w-20 items-center rounded-2xl bg-slate-200 dark:bg-slate-700 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-slate-900 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-300 dark:hover:bg-slate-600 hover:shadow-lg active:scale-95"
        role="switch"
        aria-checked={units === 'imperial'}
        aria-labelledby="units-label"
        aria-describedby="units-description"
      >
        <span
          className={`${
            units === 'imperial' ? 'translate-x-9' : 'translate-x-1'
          } inline-block h-8 w-8 transform rounded-xl bg-gradient-to-r from-cyan-400 to-blue-400 transition-transform duration-300 shadow-lg`}
          aria-hidden="true"
        />
        {/* Text labels positioned to match toggle positions */}
        <span className="absolute left-2 top-1/2 -translate-y-1/2 text-xs font-medium text-slate-600 dark:text-slate-300 transition-opacity duration-200" aria-hidden="true">
          <span className={`${units === 'metric' ? 'opacity-100' : 'opacity-40'}`}>
            C
          </span>
        </span>
        <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs font-medium text-slate-600 dark:text-slate-300 transition-opacity duration-200" aria-hidden="true">
          <span className={`${units === 'imperial' ? 'opacity-100' : 'opacity-40'}`}>
            F
          </span>
        </span>
      </button>
      <div id="units-description" className="sr-only">
        Currently set to {units === 'metric' ? 'Celsius' : 'Fahrenheit'}. Click to switch to {units === 'metric' ? 'Fahrenheit' : 'Celsius'}.
      </div>
    </div>
  );
});

export default UnitToggle;
