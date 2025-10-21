export type Units = 'metric' | 'imperial';

export type GeoPoint = { 
  lat: number; 
  lon: number; 
  name?: string; 
  country?: string; 
};

export type CurrentWeather = {
  coord: { lat: number; lon: number };
  dt: number;                        // unix timestamp
  timezone: number;                  // seconds offset
  name: string;
  weather: { id: number; main: string; description: string; icon: string }[];
  main: { temp: number; feels_like: number; humidity: number; pressure: number };
  wind: { speed: number; deg: number };
};
