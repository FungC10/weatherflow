import { Units } from './types';

export function formatTemp(temp: number, units: Units): string {
  const rounded = Math.round(temp);
  return `${rounded}°${units === 'metric' ? 'C' : 'F'}`;
}

export function formatWind(speed: number, units: Units): string {
  const unit = units === 'metric' ? 'km/h' : 'mph';
  return `${Math.round(speed * 10) / 10} ${unit}`;
}

export function formatPressure(pressure: number, units: Units): string {
  const unit = units === 'metric' ? 'hPa' : 'inHg';
  return `${pressure} ${unit}`;
}

export function localTime(timestamp: number, timezoneOffset: number): Date {
  // Convert unix timestamp to milliseconds and add timezone offset
  const utc = timestamp * 1000;
  const local = new Date(utc + (timezoneOffset * 1000));
  return local;
}

export function formatTime(timestamp: number, timezoneOffset: number): string {
  const date = localTime(timestamp, timezoneOffset);
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });
}

export function formatDate(timestamp: number, timezoneOffset: number): string {
  const date = localTime(timestamp, timezoneOffset);
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

export function getWindDirection(degrees: number): string {
  const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
  // Normalize degrees to 0-360 range
  const normalizedDegrees = ((degrees % 360) + 360) % 360;
  const index = Math.round(normalizedDegrees / 22.5) % 16;
  return directions[index];
}

/**
 * Convert a string to a URL-friendly slug
 * @param name - The string to convert
 * @returns URL-friendly slug (lowercase, trimmed, spaces/invalid chars replaced with '-')
 */
export function slugify(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '') // Remove invalid characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
    .replace(/^-|-$/g, ''); // Remove leading/trailing hyphens
}
