/**
 * Maps Open-Meteo WMO weather codes to icon identifiers
 * Based on WMO Weather interpretation codes: https://open-meteo.com/en/docs
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

export function getOpenMeteoWeatherIcon(code: number, isDay: boolean = true): WeatherIcon {
  // Clear sky (0)
  if (code === 0) {
    return isDay ? 'clear-day' : 'clear-night';
  }
  
  // Mainly clear, partly cloudy, and overcast (1-3)
  if (code >= 1 && code <= 3) {
    if (code === 1) {
      return isDay ? 'partly-cloudy-day' : 'partly-cloudy-night';
    }
    if (code === 2) {
      return isDay ? 'partly-cloudy-day' : 'partly-cloudy-night';
    }
    // Code 3 (overcast) - add some variation
    return isDay ? 'cloudy' : 'cloudy';
  }
  
  // Fog and depositing rime fog (45, 48)
  if (code === 45 || code === 48) {
    return 'fog';
  }
  
  // Drizzle (51-57)
  if (code >= 51 && code <= 57) {
    return 'rain';
  }
  
  // Rain (61-67)
  if (code >= 61 && code <= 67) {
    return 'rain';
  }
  
  // Snow (71-77)
  if (code >= 71 && code <= 77) {
    return 'snow';
  }
  
  // Rain showers (80-82)
  if (code >= 80 && code <= 82) {
    return 'shower-rain';
  }
  
  // Snow showers (85-86)
  if (code >= 85 && code <= 86) {
    return 'snow';
  }
  
  // Thunderstorm (95, 96, 99)
  if (code === 95 || code === 96 || code === 99) {
    return 'thunderstorm';
  }
  
  return 'unknown';
}

export function getOpenMeteoWeatherEmoji(icon: WeatherIcon): string {
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
    'unknown': '🌤️' // Use a generic weather emoji instead of question mark
  };
  
  return emojiMap[icon] || '🌤️';
}

// Add variation for overcast conditions to make forecast more interesting
export function getVariedWeatherEmoji(code: number, icon: WeatherIcon, timestamp?: number): string {
  // For overcast conditions (code 3), add some variation
  if (code === 3) {
    const overcastEmojis = ['☁️', '🌥️', '☁️', '🌤️', '☁️'];
    // Use timestamp to get more varied results based on the actual day
    // Add some randomness based on the day of year to ensure variety
    const dayOfYear = timestamp ? Math.floor(timestamp / 86400) : 0;
    const index = (dayOfYear + code) % overcastEmojis.length;
    return overcastEmojis[index];
  }
  
  return getOpenMeteoWeatherEmoji(icon);
}

export function getOpenMeteoWeatherDescription(code: number): string {
  const descriptionMap: Record<number, string> = {
    0: 'Clear sky',
    1: 'Mostly sunny',
    2: 'Partly cloudy',
    3: 'Cloudy',
    45: 'Foggy',
    48: 'Foggy with rime',
    51: 'Light drizzle',
    53: 'Moderate drizzle',
    55: 'Heavy drizzle',
    56: 'Light freezing drizzle',
    57: 'Heavy freezing drizzle',
    61: 'Light rain',
    63: 'Moderate rain',
    65: 'Heavy rain',
    66: 'Light freezing rain',
    67: 'Heavy freezing rain',
    71: 'Light snow',
    73: 'Moderate snow',
    75: 'Heavy snow',
    77: 'Snow grains',
    80: 'Light rain showers',
    81: 'Moderate rain showers',
    82: 'Heavy rain showers',
    85: 'Light snow showers',
    86: 'Heavy snow showers',
    95: 'Thunderstorm',
    96: 'Thunderstorm with hail',
    99: 'Severe thunderstorm'
  };
  
  return descriptionMap[code] || 'Unknown conditions';
}

// Add variation for overcast descriptions to make forecast more interesting
export function getVariedWeatherDescription(code: number, timestamp?: number): string {
  // For overcast conditions (code 3), add some variation
  if (code === 3) {
    const overcastDescriptions = ['Cloudy', 'Overcast', 'Cloudy skies', 'Overcast skies', 'Cloudy conditions'];
    // Use timestamp to get more varied results based on the actual day
    // Add some randomness based on the day of year to ensure variety
    const dayOfYear = timestamp ? Math.floor(timestamp / 86400) : 0;
    const index = (dayOfYear + code) % overcastDescriptions.length;
    return overcastDescriptions[index];
  }
  
  return getOpenMeteoWeatherDescription(code);
}

export function isOpenMeteoDayTime(timestamp: number): boolean {
  const hour = new Date(timestamp * 1000).getHours();
  return hour >= 6 && hour < 18;
}
