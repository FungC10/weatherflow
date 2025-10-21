import { GeoPoint, Units } from './types';

/**
 * Convert a city name to a URL-friendly slug
 * @param cityName - The city name to convert
 * @returns URL-friendly slug
 */
export function cityNameToSlug(cityName: string): string {
  return cityName
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '') // Remove special characters except spaces and hyphens
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
    .replace(/^-|-$/g, ''); // Remove leading/trailing hyphens
}

/**
 * Convert a slug back to a city name
 * @param slug - The URL slug to convert
 * @returns City name
 */
export function slugToCityName(slug: string): string {
  return slug
    .replace(/-/g, ' ') // Replace hyphens with spaces
    .replace(/\b\w/g, l => l.toUpperCase()); // Capitalize first letter of each word
}

/**
 * Generate a shareable URL for a city
 * @param city - The city to generate URL for
 * @param units - The units to include in URL
 * @returns Shareable URL
 */
export function generateCityUrl(city: GeoPoint, units: Units): string {
  const slug = cityNameToSlug(city.name || 'Unknown City');
  const params = new URLSearchParams({
    lat: city.lat.toString(),
    lon: city.lon.toString(),
    u: units,
  });
  
  return `/city/${slug}?${params.toString()}`;
}

/**
 * Parse city data from URL parameters
 * @param slug - The city slug from URL
 * @param searchParams - URL search parameters
 * @returns Parsed city data or null if invalid
 */
export function parseCityFromUrl(slug: string, searchParams: URLSearchParams): {
  city: GeoPoint | null;
  units: Units;
} {
  const lat = searchParams.get('lat');
  const lon = searchParams.get('lon');
  const units = searchParams.get('u') as Units | null;

  if (!lat || !lon || isNaN(parseFloat(lat)) || isNaN(parseFloat(lon))) {
    return { city: null, units: 'metric' };
  }

  const city: GeoPoint = {
    lat: parseFloat(lat),
    lon: parseFloat(lon),
    name: slugToCityName(slug),
    country: '', // We don't have country info in the URL
  };

  return {
    city,
    units: (units === 'metric' || units === 'imperial') ? units : 'metric',
  };
}
