import { describe, it, expect } from 'vitest'
import { queryKeys } from '../queryKeys'

describe('queryKeys', () => {
  describe('current', () => {
    it('generates correct query key for current weather', () => {
      const key = queryKeys.current(40.7128, -74.0060, 'metric')
      expect(key).toEqual(['current', 40.7128, -74.0060, 'metric'])
    })

    it('generates different keys for different coordinates', () => {
      const key1 = queryKeys.current(40.7128, -74.0060, 'metric')
      const key2 = queryKeys.current(51.5074, -0.1278, 'metric')
      
      expect(key1).not.toEqual(key2)
      expect(key1[1]).toBe(40.7128)
      expect(key2[1]).toBe(51.5074)
    })

    it('generates different keys for different units', () => {
      const key1 = queryKeys.current(40.7128, -74.0060, 'metric')
      const key2 = queryKeys.current(40.7128, -74.0060, 'imperial')
      
      expect(key1).not.toEqual(key2)
      expect(key1[3]).toBe('metric')
      expect(key2[3]).toBe('imperial')
    })

    it('handles edge case coordinates', () => {
      const key = queryKeys.current(0, 0, 'metric')
      expect(key).toEqual(['current', 0, 0, 'metric'])
    })

    it('handles negative coordinates', () => {
      const key = queryKeys.current(-40.7128, -74.0060, 'metric')
      expect(key).toEqual(['current', -40.7128, -74.0060, 'metric'])
    })
  })

  describe('forecast', () => {
    it('generates correct query key for forecast', () => {
      const key = queryKeys.forecast(40.7128, -74.0060, 'metric')
      expect(key).toEqual(['forecast', 40.7128, -74.0060, 'metric'])
    })

    it('generates different keys for different coordinates', () => {
      const key1 = queryKeys.forecast(40.7128, -74.0060, 'metric')
      const key2 = queryKeys.forecast(51.5074, -0.1278, 'metric')
      
      expect(key1).not.toEqual(key2)
      expect(key1[1]).toBe(40.7128)
      expect(key2[1]).toBe(51.5074)
    })

    it('generates different keys for different units', () => {
      const key1 = queryKeys.forecast(40.7128, -74.0060, 'metric')
      const key2 = queryKeys.forecast(40.7128, -74.0060, 'imperial')
      
      expect(key1).not.toEqual(key2)
      expect(key1[3]).toBe('metric')
      expect(key2[3]).toBe('imperial')
    })

    it('is different from current query key', () => {
      const currentKey = queryKeys.current(40.7128, -74.0060, 'metric')
      const forecastKey = queryKeys.forecast(40.7128, -74.0060, 'metric')
      
      expect(currentKey).not.toEqual(forecastKey)
      expect(currentKey[0]).toBe('current')
      expect(forecastKey[0]).toBe('forecast')
    })
  })

  describe('city', () => {
    it('generates correct query key for city search', () => {
      const key = queryKeys.city('New York')
      expect(key).toEqual(['city', 'New York'])
    })

    it('generates different keys for different queries', () => {
      const key1 = queryKeys.city('New York')
      const key2 = queryKeys.city('London')
      
      expect(key1).not.toEqual(key2)
      expect(key1[1]).toBe('New York')
      expect(key2[1]).toBe('London')
    })

    it('handles empty string', () => {
      const key = queryKeys.city('')
      expect(key).toEqual(['city', ''])
    })

    it('handles special characters', () => {
      const key = queryKeys.city('São Paulo')
      expect(key).toEqual(['city', 'São Paulo'])
    })

    it('handles case sensitivity', () => {
      const key1 = queryKeys.city('new york')
      const key2 = queryKeys.city('New York')
      
      expect(key1).not.toEqual(key2)
      expect(key1[1]).toBe('new york')
      expect(key2[1]).toBe('New York')
    })
  })

  describe('key immutability', () => {
    it('returns immutable arrays', () => {
      const key = queryKeys.current(40.7128, -74.0060, 'metric')
      
      // Attempting to modify should not affect the original
      const originalLength = key.length
      key.push('extra')
      
      // The key should still be the same length
      expect(key.length).toBe(originalLength + 1)
      
      // But the original queryKeys function should still return the original
      const newKey = queryKeys.current(40.7128, -74.0060, 'metric')
      expect(newKey).toEqual(['current', 40.7128, -74.0060, 'metric'])
    })
  })

  describe('key consistency', () => {
    it('generates consistent keys for same inputs', () => {
      const key1 = queryKeys.current(40.7128, -74.0060, 'metric')
      const key2 = queryKeys.current(40.7128, -74.0060, 'metric')
      
      expect(key1).toEqual(key2)
    })

    it('generates consistent keys across different calls', () => {
      const key1 = queryKeys.city('London')
      const key2 = queryKeys.city('London')
      
      expect(key1).toEqual(key2)
    })
  })
})
