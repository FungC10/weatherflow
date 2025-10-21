import { CurrentWeather, Units } from './types';

const BASE_URL = 'https://api.openweathermap.org';

function getApiKey(): string {
  if (typeof window === 'undefined') {
    // Server-side rendering - return a placeholder
    return 'placeholder-key';
  }
  
  const apiKey = process.env.NEXT_PUBLIC_OWM_API_KEY;
  if (!apiKey) {
    throw new Error('NEXT_PUBLIC_OWM_API_KEY is not defined. Please add your OpenWeatherMap API key to .env.local');
  }
  
  return apiKey;
}

export async function getCurrent(lat: number, lon: number, units: Units): Promise<CurrentWeather> {
  const apiKey = getApiKey();
  const url = `${BASE_URL}/data/2.5/weather?lat=${lat}&lon=${lon}&units=${units}&appid=${apiKey}`;
  
  const response = await fetch(url);
  
  if (!response.ok) {
    if (response.status === 401) {
      throw new Error('Invalid API key. Please check your OpenWeatherMap API key.');
    }
    if (response.status === 404) {
      throw new Error('Weather data not found for this location.');
    }
    if (response.status === 429) {
      throw new Error('API rate limit exceeded. Please try again later.');
    }
    throw new Error(`Failed to fetch weather data: ${response.status} ${response.statusText}`);
  }
  
  const data = await response.json();
  return data;
}
