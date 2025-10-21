'use client';

import { useState, useEffect } from 'react';
import { setJSON, getJSON } from '@/lib/storage';
import { Units } from '@/lib/types';

interface UnitToggleProps {
  onChange: (units: Units) => void;
  disabled?: boolean;
}

export default function UnitToggle({ onChange, disabled = false }: UnitToggleProps) {
  const [units, setUnits] = useState<Units>('metric');

  // Load units from localStorage on mount
  useEffect(() => {
    const savedUnits = getJSON<Units>('weatherflow:units');
    if (savedUnits && (savedUnits === 'metric' || savedUnits === 'imperial')) {
      setUnits(savedUnits);
      onChange(savedUnits);
    }
  }, [onChange]);

  const handleToggle = () => {
    const newUnits = units === 'metric' ? 'imperial' : 'metric';
    setUnits(newUnits);
    setJSON('weatherflow:units', newUnits);
    onChange(newUnits);
  };

  return (
    <div className="flex items-center space-x-2">
      <span className="text-sm text-slate-300">Units:</span>
      <button
        onClick={handleToggle}
        disabled={disabled}
        className="relative inline-flex h-8 w-16 items-center rounded-full bg-slate-700 transition-colors focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:ring-offset-2 focus:ring-offset-slate-900 disabled:opacity-50 disabled:cursor-not-allowed"
        role="switch"
        aria-checked={units === 'imperial'}
        aria-label={`Switch to ${units === 'metric' ? 'imperial' : 'metric'} units`}
      >
        <span
          className={`${
            units === 'imperial' ? 'translate-x-9' : 'translate-x-1'
          } inline-block h-6 w-6 transform rounded-full bg-cyan-400 transition-transform`}
        />
        <span className="absolute inset-0 flex items-center justify-center text-xs font-medium text-slate-300">
          <span className={`${units === 'metric' ? 'opacity-100' : 'opacity-0'} transition-opacity`}>
            °C
          </span>
          <span className={`${units === 'imperial' ? 'opacity-100' : 'opacity-0'} transition-opacity`}>
            °F
          </span>
        </span>
      </button>
    </div>
  );
}
