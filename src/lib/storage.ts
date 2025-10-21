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
