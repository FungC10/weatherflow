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
