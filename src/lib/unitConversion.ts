import { Units, CurrentWeather, DailyForecast, HourlyData } from '@/lib/types';

// Temperature conversion functions
export function celsiusToFahrenheit(celsius: number): number {
  return (celsius * 9/5) + 32;
}

export function fahrenheitToCelsius(fahrenheit: number): number {
  return (fahrenheit - 32) * 5/9;
}

export function convertTemperature(temp: number, fromUnits: Units, toUnits: Units): number {
  if (fromUnits === toUnits) return temp;
  
  if (fromUnits === 'metric' && toUnits === 'imperial') {
    return celsiusToFahrenheit(temp);
  } else if (fromUnits === 'imperial' && toUnits === 'metric') {
    return fahrenheitToCelsius(temp);
  }
  
  return temp;
}

// Wind speed conversion functions
export function kmhToMph(kmh: number): number {
  return kmh * 0.621371;
}

export function mphToKmh(mph: number): number {
  return mph * 1.609344;
}

export function convertWindSpeed(speed: number, fromUnits: Units, toUnits: Units): number {
  if (fromUnits === toUnits) return speed;
  
  if (fromUnits === 'metric' && toUnits === 'imperial') {
    return kmhToMph(speed);
  } else if (fromUnits === 'imperial' && toUnits === 'metric') {
    return mphToKmh(speed);
  }
  
  return speed;
}

// Convert CurrentWeather data
export function convertCurrentWeather(weather: CurrentWeather, fromUnits: Units, toUnits: Units): CurrentWeather {
  if (fromUnits === toUnits) return weather;

  return {
    ...weather,
    main: {
      ...weather.main,
      temp: convertTemperature(weather.main.temp, fromUnits, toUnits),
      feels_like: convertTemperature(weather.main.feels_like, fromUnits, toUnits),
    },
    wind: {
      ...weather.wind,
      speed: convertWindSpeed(weather.wind.speed, fromUnits, toUnits),
    }
  };
}

// Convert DailyForecast data
export function convertDailyForecast(forecast: DailyForecast, fromUnits: Units, toUnits: Units): DailyForecast {
  if (fromUnits === toUnits) return forecast;

  return {
    ...forecast,
    temp: {
      min: convertTemperature(forecast.temp.min, fromUnits, toUnits),
      max: convertTemperature(forecast.temp.max, fromUnits, toUnits),
    }
  };
}

// Convert Forecast data
export function convertForecast(forecast: { daily: DailyForecast[]; hourly?: HourlyData[] }, fromUnits: Units, toUnits: Units) {
  if (fromUnits === toUnits) return forecast;

  return {
    ...forecast,
    daily: forecast.daily.map(day => convertDailyForecast(day, fromUnits, toUnits)),
    hourly: forecast.hourly?.map(hour => ({
      ...hour,
      temperature: convertTemperature(hour.temperature, fromUnits, toUnits)
    }))
  };
}

// Convert HourlyData
export function convertHourlyData(hourly: HourlyData[], fromUnits: Units, toUnits: Units): HourlyData[] {
  if (fromUnits === toUnits) return hourly;

  return hourly.map(hour => ({
    ...hour,
    temperature: convertTemperature(hour.temperature, fromUnits, toUnits)
  }));
}
