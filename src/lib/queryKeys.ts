export const queryKeys = {
  current: (lat: number, lon: number, units: string) => ['current', lat, lon, units] as const,
  forecast: (lat: number, lon: number, units: string) => ['forecast', lat, lon, units] as const,
  city: (query: string) => ['city', query] as const,
} as const;
