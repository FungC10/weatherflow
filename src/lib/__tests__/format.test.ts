import { describe, it, expect } from 'vitest'
import { formatTemp, formatWind, formatPressure, formatDate, formatTime, localTime, getWindDirection } from '../format'

describe('format utilities', () => {
  describe('formatTemp', () => {
    it('formats temperature in metric units', () => {
      expect(formatTemp(20, 'metric')).toBe('20°C')
      expect(formatTemp(0, 'metric')).toBe('0°C')
      expect(formatTemp(-5, 'metric')).toBe('-5°C')
    })

    it('formats temperature in imperial units', () => {
      expect(formatTemp(68, 'imperial')).toBe('68°F')
      expect(formatTemp(32, 'imperial')).toBe('32°F')
      expect(formatTemp(23, 'imperial')).toBe('23°F')
    })
  })

  describe('formatWind', () => {
    it('formats wind speed in metric units', () => {
      expect(formatWind(5.5, 'metric')).toBe('5.5 km/h')
      expect(formatWind(0, 'metric')).toBe('0 km/h')
    })

    it('formats wind speed in imperial units', () => {
      expect(formatWind(12.3, 'imperial')).toBe('12.3 mph')
      expect(formatWind(0, 'imperial')).toBe('0 mph')
    })
  })

  describe('formatPressure', () => {
    it('formats pressure in metric units', () => {
      expect(formatPressure(1013, 'metric')).toBe('1013 hPa')
      expect(formatPressure(0, 'metric')).toBe('0 hPa')
    })

    it('formats pressure in imperial units', () => {
      expect(formatPressure(29.92, 'imperial')).toBe('29.92 inHg')
      expect(formatPressure(0, 'imperial')).toBe('0 inHg')
    })
  })

  describe('localTime', () => {
    it('converts timestamp to local time with timezone offset', () => {
      const timestamp = 1640995200 // 2021-12-31 00:00:00 UTC
      const timezone = 0 // UTC
      const result = localTime(timestamp, timezone)
      expect(result).toBeInstanceOf(Date)
      expect(result.getTime()).toBe(timestamp * 1000)
    })

    it('handles positive timezone offset', () => {
      const timestamp = 1640995200 // 2021-12-31 00:00:00 UTC
      const timezone = 3600 // UTC+1
      const result = localTime(timestamp, timezone)
      expect(result).toBeInstanceOf(Date)
      // Should be 1 hour ahead
      expect(result.getTime()).toBe((timestamp + 3600) * 1000)
    })

    it('handles negative timezone offset', () => {
      const timestamp = 1640995200 // 2021-12-31 00:00:00 UTC
      const timezone = -3600 // UTC-1
      const result = localTime(timestamp, timezone)
      expect(result).toBeInstanceOf(Date)
      // Should be 1 hour behind
      expect(result.getTime()).toBe((timestamp - 3600) * 1000)
    })
  })

  describe('formatTime', () => {
    it('formats time with timezone offset', () => {
      const timestamp = 1640995200 // 2021-12-31 00:00:00 UTC
      const timezone = 0 // UTC
      const result = formatTime(timestamp, timezone)
      expect(result).toMatch(/^\d{1,2}:\d{2} (AM|PM)$/)
    })

    it('handles different timezone offsets', () => {
      const timestamp = 1640995200 // 2021-12-31 00:00:00 UTC
      const timezone = 3600 // UTC+1
      const result = formatTime(timestamp, timezone)
      expect(result).toMatch(/^\d{1,2}:\d{2} (AM|PM)$/)
    })
  })

  describe('formatDate', () => {
    it('formats date with timezone offset', () => {
      const timestamp = 1640995200 // 2021-12-31 00:00:00 UTC
      const timezone = 0 // UTC
      const result = formatDate(timestamp, timezone)
      expect(result).toContain('Friday')
      expect(result).toContain('2021')
    })

    it('handles different timezone offsets', () => {
      const timestamp = 1640995200 // 2021-12-31 00:00:00 UTC
      const timezone = 3600 // UTC+1
      const result = formatDate(timestamp, timezone)
      expect(result).toContain('Friday')
      expect(result).toContain('2021')
    })
  })

  describe('getWindDirection', () => {
    it('returns correct wind direction for cardinal points', () => {
      expect(getWindDirection(0)).toBe('N')
      expect(getWindDirection(90)).toBe('E')
      expect(getWindDirection(180)).toBe('S')
      expect(getWindDirection(270)).toBe('W')
    })

    it('returns correct wind direction for intercardinal points', () => {
      expect(getWindDirection(45)).toBe('NE')
      expect(getWindDirection(135)).toBe('SE')
      expect(getWindDirection(225)).toBe('SW')
      expect(getWindDirection(315)).toBe('NW')
    })

    it('handles edge cases', () => {
      expect(getWindDirection(22.5)).toBe('NNE')
      expect(getWindDirection(337.5)).toBe('NNW')
      expect(getWindDirection(360)).toBe('N')
    })

    it('handles negative degrees', () => {
      // Negative degrees should be normalized to positive equivalent
      expect(getWindDirection(-90)).toBe('W') // -90 = 270
      expect(getWindDirection(-45)).toBe('NW') // -45 = 315
    })

    it('handles degrees greater than 360', () => {
      expect(getWindDirection(450)).toBe('E')
      expect(getWindDirection(720)).toBe('N')
    })
  })
})
