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
      <span className="text-sm text-slate-300" id="units-label">Units:</span>
      <button
        onClick={handleToggle}
        disabled={disabled}
        className="relative inline-flex h-8 w-16 items-center rounded-full bg-slate-700 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:ring-offset-2 focus:ring-offset-slate-900 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-600 hover:shadow-lg active:scale-95"
        role="switch"
        aria-checked={units === 'imperial'}
        aria-labelledby="units-label"
        aria-describedby="units-description"
      >
        <span
          className={`${
            units === 'imperial' ? 'translate-x-9' : 'translate-x-1'
          } inline-block h-6 w-6 transform rounded-full bg-cyan-400 transition-transform duration-200 shadow-sm`}
          aria-hidden="true"
        />
        <span className="absolute inset-0 flex items-center justify-center text-xs font-medium text-slate-300" aria-hidden="true">
          <span className={`${units === 'metric' ? 'opacity-100' : 'opacity-0'} transition-opacity duration-200`}>
            °C
          </span>
          <span className={`${units === 'imperial' ? 'opacity-100' : 'opacity-0'} transition-opacity duration-200`}>
            °F
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
