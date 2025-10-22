import { describe, it, expect } from 'vitest';
import { getStrings, formatString, Locale } from '../strings';

describe('strings', () => {
  it('should return English strings by default', () => {
    const strings = getStrings();
    expect(strings.appName).toBe('WeatherFlow');
    expect(strings.searchPlaceholder).toBe('Search for a city...');
    expect(strings.useMyLocation).toBe('Use my location');
  });

  it('should return English strings for en locale', () => {
    const strings = getStrings('en');
    expect(strings.appName).toBe('WeatherFlow');
    expect(strings.temperature).toBe('Temperature');
    expect(strings.wind).toBe('Wind');
  });

  it('should format strings with placeholders', () => {
    const template = 'Temperature {value} degrees {unit}';
    const values = { value: '20', unit: 'Celsius' };
    const result = formatString(template, values);
    expect(result).toBe('Temperature 20 degrees Celsius');
  });

  it('should handle missing placeholder values', () => {
    const template = 'Temperature {value} degrees {unit}';
    const values = { value: '20' };
    const result = formatString(template, values);
    expect(result).toBe('Temperature 20 degrees {unit}');
  });

  it('should have all required string keys', () => {
    const strings = getStrings('en');
    const requiredKeys = [
      'appName', 'searchPlaceholder', 'useMyLocation', 'temperature',
      'wind', 'humidity', 'pressure', 'forecastTitle', 'today',
      'errorTitle', 'retry', 'share', 'offlineData'
    ];

    requiredKeys.forEach(key => {
      expect(strings).toHaveProperty(key);
      expect(typeof strings[key as keyof typeof strings]).toBe('string');
    });
  });
});
