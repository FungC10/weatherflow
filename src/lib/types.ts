export type Units = 'metric' | 'imperial';

export type GeoPoint = { 
  lat: number; 
  lon: number; 
  name?: string; 
  country?: string; 
};

// Open-Meteo API Response Types
export type OpenMeteoGeocodingResult = {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  country: string;
  admin1?: string; // state/province
  admin2?: string; // county
};

export type OpenMeteoCurrentWeather = {
  time: string;
  temperature_2m: number;
  relative_humidity_2m: number;
  wind_speed_10m: number;
  wind_direction_10m: number;
  weathercode: number;
};

export type OpenMeteoDailyForecast = {
  time: string[];
  weathercode: number[];
  temperature_2m_max: number[];
  temperature_2m_min: number[];
};

export type OpenMeteoForecastResponse = {
  latitude: number;
  longitude: number;
  timezone: string;
  timezone_abbreviation: string;
  utc_offset_seconds: number;
  current: OpenMeteoCurrentWeather;
  daily: OpenMeteoDailyForecast;
  hourly?: {
    time: string[];
    temperature_2m: number[];
  };
};

// UI Types (normalized for our components)
export type CurrentWeather = {
  coord: { lat: number; lon: number };
  dt: number;                        // unix timestamp
  timezone: number;                  // seconds offset
  name: string;
  weather: { id: number; main: string; description: string; icon: string }[];
  main: { temp: number; feels_like: number; humidity: number; pressure: number };
  wind: { speed: number; deg: number };
};

export type DailyForecast = {
  dt: number;
  temp: { min: number; max: number };
  weather: { id: number; main: string; description: string; icon: string }[];
};

export type HourlyData = {
  time: string;
  temperature: number;
};

export type Forecast = {
  timezone_offset: number;
  daily: DailyForecast[];
  hourly?: HourlyData[];
  _cached?: boolean;
  _cachedAt?: string;
};
