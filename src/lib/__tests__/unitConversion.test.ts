import { describe, it, expect } from 'vitest';
import {
  celsiusToFahrenheit,
  fahrenheitToCelsius,
  convertTemperature,
  kmhToMph,
  mphToKmh,
  convertWindSpeed,
  convertCurrentWeather,
  convertDailyForecast,
  convertForecast,
  convertHourlyData
} from '../unitConversion';
import { CurrentWeather, DailyForecast, Forecast, HourlyData, Units } from '../../types';

describe('Unit Conversion', () => {
  describe('Temperature conversion', () => {
    it('should convert celsius to fahrenheit correctly', () => {
      expect(celsiusToFahrenheit(0)).toBe(32);
      expect(celsiusToFahrenheit(100)).toBe(212);
      expect(celsiusToFahrenheit(25)).toBe(77);
    });

    it('should convert fahrenheit to celsius correctly', () => {
      expect(fahrenheitToCelsius(32)).toBe(0);
      expect(fahrenheitToCelsius(212)).toBe(100);
      expect(fahrenheitToCelsius(77)).toBe(25);
    });

    it('should convert temperature between units', () => {
      expect(convertTemperature(0, 'metric', 'imperial')).toBe(32);
      expect(convertTemperature(32, 'imperial', 'metric')).toBe(0);
      expect(convertTemperature(25, 'metric', 'imperial')).toBe(77);
      expect(convertTemperature(77, 'imperial', 'metric')).toBe(25);
    });

    it('should return same value when units are the same', () => {
      expect(convertTemperature(25, 'metric', 'metric')).toBe(25);
      expect(convertTemperature(77, 'imperial', 'imperial')).toBe(77);
    });
  });

  describe('Wind speed conversion', () => {
    it('should convert km/h to mph correctly', () => {
      expect(kmhToMph(100)).toBeCloseTo(62.1371, 4);
      expect(kmhToMph(0)).toBe(0);
      expect(kmhToMph(50)).toBeCloseTo(31.0686, 4);
    });

    it('should convert mph to km/h correctly', () => {
      expect(mphToKmh(62.1371)).toBeCloseTo(100, 4);
      expect(mphToKmh(0)).toBe(0);
      expect(mphToKmh(31.0686)).toBeCloseTo(50, 3);
    });

    it('should convert wind speed between units', () => {
      expect(convertWindSpeed(100, 'metric', 'imperial')).toBeCloseTo(62.1371, 4);
      expect(convertWindSpeed(62.1371, 'imperial', 'metric')).toBeCloseTo(100, 4);
    });

    it('should return same value when units are the same', () => {
      expect(convertWindSpeed(100, 'metric', 'metric')).toBe(100);
      expect(convertWindSpeed(62.1371, 'imperial', 'imperial')).toBe(62.1371);
    });
  });

  describe('CurrentWeather conversion', () => {
    const mockCurrentWeather: CurrentWeather = {
      coord: { lat: 51.5074, lon: -0.1278 },
      dt: 1640995200,
      timezone: 0,
      name: 'London',
      weather: [{ id: 800, main: 'Clear', description: 'clear sky', icon: '01d' }],
      main: {
        temp: 20,
        feels_like: 22,
        humidity: 65,
        pressure: 1013
      },
      wind: {
        speed: 10,
        deg: 180
      }
    };

    it('should convert current weather from metric to imperial', () => {
      const result = convertCurrentWeather(mockCurrentWeather, 'metric', 'imperial');
      
      expect(result.main.temp).toBeCloseTo(68, 0); // 20°C = 68°F
      expect(result.main.feels_like).toBeCloseTo(71.6, 0); // 22°C = 71.6°F
      expect(result.wind.speed).toBeCloseTo(6.21, 1); // 10 km/h = 6.21 mph
      expect(result.coord).toEqual(mockCurrentWeather.coord);
      expect(result.name).toBe(mockCurrentWeather.name);
    });

    it('should convert current weather from imperial to metric', () => {
      const imperialWeather = convertCurrentWeather(mockCurrentWeather, 'metric', 'imperial');
      const result = convertCurrentWeather(imperialWeather, 'imperial', 'metric');
      
      expect(result.main.temp).toBeCloseTo(20, 0);
      expect(result.main.feels_like).toBeCloseTo(22, 0);
      expect(result.wind.speed).toBeCloseTo(10, 0);
    });

    it('should return same data when units are the same', () => {
      const result = convertCurrentWeather(mockCurrentWeather, 'metric', 'metric');
      expect(result).toEqual(mockCurrentWeather);
    });
  });

  describe('DailyForecast conversion', () => {
    const mockDailyForecast: DailyForecast = {
      dt: 1640995200,
      temp: { min: 15, max: 25 },
      weather: [{ id: 800, main: 'Clear', description: 'clear sky', icon: '01d' }]
    };

    it('should convert daily forecast from metric to imperial', () => {
      const result = convertDailyForecast(mockDailyForecast, 'metric', 'imperial');
      
      expect(result.temp.min).toBeCloseTo(59, 0); // 15°C = 59°F
      expect(result.temp.max).toBeCloseTo(77, 0); // 25°C = 77°F
      expect(result.dt).toBe(mockDailyForecast.dt);
      expect(result.weather).toEqual(mockDailyForecast.weather);
    });

    it('should return same data when units are the same', () => {
      const result = convertDailyForecast(mockDailyForecast, 'metric', 'metric');
      expect(result).toEqual(mockDailyForecast);
    });
  });

  describe('Forecast conversion', () => {
    const mockForecast: Forecast = {
      timezone_offset: 0,
      daily: [
        {
          dt: 1640995200,
          temp: { min: 15, max: 25 },
          weather: [{ id: 800, main: 'Clear', description: 'clear sky', icon: '01d' }]
        }
      ],
      hourly: [
        { time: '2022-01-01T00:00', temperature: 18 },
        { time: '2022-01-01T01:00', temperature: 16 }
      ]
    };

    it('should convert forecast from metric to imperial', () => {
      const result = convertForecast(mockForecast, 'metric', 'imperial');
      
      expect(result.daily[0].temp.min).toBeCloseTo(59, 0); // 15°C = 59°F
      expect(result.daily[0].temp.max).toBeCloseTo(77, 0); // 25°C = 77°F
      expect(result.hourly![0].temperature).toBeCloseTo(64.4, 0); // 18°C = 64.4°F
      expect(result.hourly![1].temperature).toBeCloseTo(60.8, 0); // 16°C = 60.8°F
      expect(result.timezone_offset).toBe(mockForecast.timezone_offset);
    });

    it('should return same data when units are the same', () => {
      const result = convertForecast(mockForecast, 'metric', 'metric');
      expect(result).toEqual(mockForecast);
    });
  });

  describe('HourlyData conversion', () => {
    const mockHourlyData: HourlyData[] = [
      { time: '2022-01-01T00:00', temperature: 18 },
      { time: '2022-01-01T01:00', temperature: 16 }
    ];

    it('should convert hourly data from metric to imperial', () => {
      const result = convertHourlyData(mockHourlyData, 'metric', 'imperial');
      
      expect(result[0].temperature).toBeCloseTo(64.4, 0); // 18°C = 64.4°F
      expect(result[1].temperature).toBeCloseTo(60.8, 0); // 16°C = 60.8°F
      expect(result[0].time).toBe(mockHourlyData[0].time);
      expect(result[1].time).toBe(mockHourlyData[1].time);
    });

    it('should return same data when units are the same', () => {
      const result = convertHourlyData(mockHourlyData, 'metric', 'metric');
      expect(result).toEqual(mockHourlyData);
    });
  });
});
