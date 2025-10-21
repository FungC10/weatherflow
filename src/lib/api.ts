import { 
  CurrentWeather, 
  Forecast, 
  Units, 
  GeoPoint,
  OpenMeteoGeocodingResult,
  OpenMeteoForecastResponse 
} from './types';

const GEOCODING_BASE_URL = 'https://geocoding-api.open-meteo.com/v1';
const FORECAST_BASE_URL = 'https://api.open-meteo.com/v1';

// Search for cities using Open-Meteo Geocoding API
export async function searchCity(query: string): Promise<GeoPoint[]> {
  if (!query.trim()) {
    return [];
  }

  const url = `${GEOCODING_BASE_URL}/search?name=${encodeURIComponent(query)}&count=5&language=en`;
  
  const response = await fetch(url);
  
  if (!response.ok) {
    throw new Error(`Failed to search cities: ${response.status} ${response.statusText}`);
  }
  
  const data = await response.json();
  
  if (!data.results || !Array.isArray(data.results)) {
    return [];
  }
  
  return data.results.map((result: OpenMeteoGeocodingResult): GeoPoint => ({
    lat: result.latitude,
    lon: result.longitude,
    name: result.name,
    country: result.country
  }));
}

// Get current weather using Open-Meteo API
export async function getCurrent(lat: number, lon: number, units: Units): Promise<CurrentWeather> {
  const temperatureUnit = units === 'metric' ? 'celsius' : 'fahrenheit';
  const windSpeedUnit = units === 'metric' ? 'kmh' : 'mph';
  
  const url = `${FORECAST_BASE_URL}/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,wind_speed_10m,wind_direction_10m,weathercode&timezone=auto&temperature_unit=${temperatureUnit}&wind_speed_unit=${windSpeedUnit}`;
  
  const response = await fetch(url);
  
  if (!response.ok) {
    throw new Error(`Failed to fetch current weather: ${response.status} ${response.statusText}`);
  }
  
  const data: OpenMeteoForecastResponse = await response.json();
  
  // Convert Open-Meteo format to our UI format
  const current = data.current;
  const timestamp = Math.floor(new Date(current.time).getTime() / 1000);
  
  return {
    coord: { lat: data.latitude, lon: data.longitude },
    dt: timestamp,
    timezone: data.utc_offset_seconds,
    name: `${data.latitude.toFixed(2)}, ${data.longitude.toFixed(2)}`, // Will be overridden by city name
    weather: [{
      id: current.weathercode,
      main: getWeatherMain(current.weathercode),
      description: getWeatherDescription(current.weathercode),
      icon: getWeatherIcon(current.weathercode)
    }],
    main: {
      temp: current.temperature_2m,
      feels_like: current.temperature_2m, // Open-Meteo doesn't provide feels_like
      humidity: current.relative_humidity_2m,
      pressure: 1013 // Open-Meteo doesn't provide pressure in free tier
    },
    wind: {
      speed: current.wind_speed_10m,
      deg: current.wind_direction_10m
    }
  };
}

// Get forecast using Open-Meteo API
export async function getForecast(lat: number, lon: number, units: Units): Promise<Forecast> {
  const temperatureUnit = units === 'metric' ? 'celsius' : 'fahrenheit';
  const windSpeedUnit = units === 'metric' ? 'kmh' : 'mph';
  
  const url = `${FORECAST_BASE_URL}/forecast?latitude=${lat}&longitude=${lon}&daily=weathercode,temperature_2m_max,temperature_2m_min&timezone=auto&temperature_unit=${temperatureUnit}&wind_speed_unit=${windSpeedUnit}`;
  
  const response = await fetch(url);
  
  if (!response.ok) {
    throw new Error(`Failed to fetch forecast: ${response.status} ${response.statusText}`);
  }
  
  const data: OpenMeteoForecastResponse = await response.json();
  
  // Convert Open-Meteo format to our UI format
  const daily = data.daily;
  const dailyForecasts = daily.time.map((time, index) => ({
    dt: Math.floor(new Date(time).getTime() / 1000),
    temp: {
      min: daily.temperature_2m_min[index],
      max: daily.temperature_2m_max[index]
    },
    weather: [{
      id: daily.weathercode[index],
      main: getWeatherMain(daily.weathercode[index]),
      description: getWeatherDescription(daily.weathercode[index]),
      icon: getWeatherIcon(daily.weathercode[index])
    }]
  }));
  
  return {
    timezone_offset: data.utc_offset_seconds,
    daily: dailyForecasts
  };
}

// Helper functions to convert Open-Meteo weather codes to readable strings
function getWeatherMain(code: number): string {
  const weatherMap: Record<number, string> = {
    0: 'Clear',
    1: 'Clear', 2: 'Clear', 3: 'Clear',
    45: 'Fog', 48: 'Fog',
    51: 'Drizzle', 53: 'Drizzle', 55: 'Drizzle',
    56: 'Drizzle', 57: 'Drizzle',
    61: 'Rain', 63: 'Rain', 65: 'Rain',
    66: 'Rain', 67: 'Rain',
    71: 'Snow', 73: 'Snow', 75: 'Snow',
    77: 'Snow',
    80: 'Rain', 81: 'Rain', 82: 'Rain',
    85: 'Snow', 86: 'Snow',
    95: 'Thunderstorm',
    96: 'Thunderstorm', 99: 'Thunderstorm'
  };
  
  return weatherMap[code] || 'Unknown';
}

function getWeatherDescription(code: number): string {
  const descriptionMap: Record<number, string> = {
    0: 'Clear sky',
    1: 'Mainly clear', 2: 'Partly cloudy', 3: 'Overcast',
    45: 'Fog', 48: 'Depositing rime fog',
    51: 'Light drizzle', 53: 'Moderate drizzle', 55: 'Dense drizzle',
    56: 'Light freezing drizzle', 57: 'Dense freezing drizzle',
    61: 'Slight rain', 63: 'Moderate rain', 65: 'Heavy rain',
    66: 'Light freezing rain', 67: 'Heavy freezing rain',
    71: 'Slight snow', 73: 'Moderate snow', 75: 'Heavy snow',
    77: 'Snow grains',
    80: 'Slight rain showers', 81: 'Moderate rain showers', 82: 'Violent rain showers',
    85: 'Slight snow showers', 86: 'Heavy snow showers',
    95: 'Thunderstorm',
    96: 'Thunderstorm with slight hail', 99: 'Thunderstorm with heavy hail'
  };
  
  return descriptionMap[code] || 'Unknown';
}

function getWeatherIcon(code: number): string {
  const iconMap: Record<number, string> = {
    0: '01d',
    1: '02d', 2: '03d', 3: '04d',
    45: '50d', 48: '50d',
    51: '09d', 53: '09d', 55: '09d',
    56: '09d', 57: '09d',
    61: '10d', 63: '10d', 65: '10d',
    66: '10d', 67: '10d',
    71: '13d', 73: '13d', 75: '13d',
    77: '13d',
    80: '09d', 81: '09d', 82: '09d',
    85: '13d', 86: '13d',
    95: '11d',
    96: '11d', 99: '11d'
  };
  
  return iconMap[code] || '01d';
}
