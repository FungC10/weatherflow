export type Units = 'metric' | 'imperial';

export type GeoPoint = { 
  lat: number; 
  lon: number; 
  name?: string; 
  country?: string; 
};
