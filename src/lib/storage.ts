/**
 * Local storage helpers for WeatherFlow
 */

export function getJSON<T>(key: string): T | null {
  try {
    if (typeof window === 'undefined') return null;
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : null;
  } catch {
    return null;
  }
}

export function setJSON<T>(key: string, value: T): void {
  try {
    if (typeof window === 'undefined') return;
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Silently fail if localStorage is not available
  }
}

export function removeKey(key: string): void {
  try {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(key);
  } catch {
    // Silently fail if localStorage is not available
  }
}

// Recent searches helpers
export function getRecentSearches(): string[] {
  try {
    if (typeof window === 'undefined') return [];
    const recent = getJSON<string[]>('weatherflow:recent');
    return recent || [];
  } catch {
    return [];
  }
}

export function addRecentSearch(search: string): void {
  try {
    if (typeof window === 'undefined') return;
    const recent = getRecentSearches();
    const updated = pushUnique(recent, search, 6);
    setJSON('weatherflow:recent', updated);
  } catch {
    // Silently fail if localStorage is not available
  }
}

export function clearRecentSearches(): void {
  try {
    if (typeof window === 'undefined') return;
    removeKey('weatherflow:recent');
  } catch {
    // Silently fail if localStorage is not available
  }
}

function pushUnique<T>(array: T[], item: T, maxLength: number): T[] {
  // Remove existing item if it exists
  const filtered = array.filter(existing => existing !== item);
  // Add new item to the beginning
  const updated = [item, ...filtered];
  // Keep only the most recent items
  return updated.slice(0, maxLength);
}

// Forecast snapshot storage helpers
export interface ForecastSnapshot {
  data: any;
  timestamp: string;
  city: string;
  units: string;
}

export function saveSnapshot(data: any, city: string, units: string): void {
  try {
    if (typeof window === 'undefined') return;
    
    const snapshot: ForecastSnapshot = {
      data,
      timestamp: new Date().toISOString(),
      city,
      units
    };

    setJSON('weatherflow:forecast-snapshot', snapshot);
  } catch {
    // Silently fail if localStorage is not available
  }
}

export function getSnapshot(): ForecastSnapshot | null {
  try {
    if (typeof window === 'undefined') return null;
    return getJSON<ForecastSnapshot>('weatherflow:forecast-snapshot');
  } catch {
    return null;
  }
}

export function clearSnapshot(): void {
  try {
    if (typeof window === 'undefined') return;
    removeKey('weatherflow:forecast-snapshot');
  } catch {
    // Silently fail if localStorage is not available
  }
}

// Helper to check if snapshot is recent (less than 24 hours old)
export function isSnapshotRecent(snapshot: ForecastSnapshot): boolean {
  const snapshotTime = new Date(snapshot.timestamp).getTime();
  const now = new Date().getTime();
  const twentyFourHours = 24 * 60 * 60 * 1000;
  
  return (now - snapshotTime) < twentyFourHours;
}

// Helper to format snapshot timestamp for display
export function formatSnapshotTime(timestamp: string): string {
  const date = new Date(timestamp);
  return date.toLocaleString('en-US', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  });
}
