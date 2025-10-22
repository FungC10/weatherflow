'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Locale, getStrings, Strings } from './strings';

interface LocaleContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  strings: Strings;
}

const LocaleContext = createContext<LocaleContextType | undefined>(undefined);

interface LocaleProviderProps {
  children: ReactNode;
  defaultLocale?: Locale;
}

export function LocaleProvider({ children, defaultLocale = 'en' }: LocaleProviderProps) {
  const [locale, setLocale] = useState<Locale>(defaultLocale);
  const [strings, setStrings] = useState<Strings>(() => getStrings(defaultLocale));

  // Update strings when locale changes
  useEffect(() => {
    setStrings(getStrings(locale));
  }, [locale]);

  // Check for URL parameter override
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const langParam = urlParams.get('lang') as Locale;
      
      if (langParam && langParam !== locale) {
        setLocale(langParam);
      }
    }
  }, [locale]);

  const value = {
    locale,
    setLocale,
    strings,
  };

  return (
    <LocaleContext.Provider value={value}>
      {children}
    </LocaleContext.Provider>
  );
}

export function useLocale() {
  const context = useContext(LocaleContext);
  if (context === undefined) {
    throw new Error('useLocale must be used within a LocaleProvider');
  }
  return context;
}

// Hook for easy access to strings
export function useStrings() {
  const { strings } = useLocale();
  return strings;
}
