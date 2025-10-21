/**
 * Maps OpenWeatherMap weather codes to icon identifiers
 * Based on OWM weather condition codes: https://openweathermap.org/weather-conditions
 */

export type WeatherIcon = 
  | 'clear-day' | 'clear-night'
  | 'partly-cloudy-day' | 'partly-cloudy-night'
  | 'cloudy'
  | 'rain' | 'shower-rain'
  | 'thunderstorm'
  | 'snow'
  | 'mist' | 'fog'
  | 'unknown';

export function getWeatherIcon(code: number, isDay: boolean = true): WeatherIcon {
  // Clear sky
  if (code === 800) {
    return isDay ? 'clear-day' : 'clear-night';
  }
  
  // Clouds
  if (code >= 801 && code <= 804) {
    if (code === 801) {
      return isDay ? 'partly-cloudy-day' : 'partly-cloudy-night';
    }
    return 'cloudy';
  }
  
  // Rain
  if (code >= 500 && code <= 531) {
    if (code >= 520 && code <= 531) {
      return 'shower-rain';
    }
    return 'rain';
  }
  
  // Thunderstorm
  if (code >= 200 && code <= 232) {
    return 'thunderstorm';
  }
  
  // Snow
  if (code >= 600 && code <= 622) {
    return 'snow';
  }
  
  // Atmosphere (mist, fog, etc.)
  if (code >= 700 && code <= 781) {
    if (code === 701 || code === 741) {
      return 'fog';
    }
    return 'mist';
  }
  
  return 'unknown';
}

export function getWeatherEmoji(icon: WeatherIcon): string {
  const emojiMap: Record<WeatherIcon, string> = {
    'clear-day': '☀️',
    'clear-night': '🌙',
    'partly-cloudy-day': '⛅',
    'partly-cloudy-night': '☁️',
    'cloudy': '☁️',
    'rain': '🌧️',
    'shower-rain': '🌦️',
    'thunderstorm': '⛈️',
    'snow': '❄️',
    'mist': '🌫️',
    'fog': '🌫️',
    'unknown': '❓'
  };
  
  return emojiMap[icon] || '❓';
}

export function isDayTime(icon: string): boolean {
  return icon.endsWith('d');
}
