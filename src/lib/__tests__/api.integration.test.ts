import { describe, it, expect, beforeEach, vi } from 'vitest'
import { searchCity, getCurrent, getForecast } from '../api'

// Mock fetch globally
global.fetch = vi.fn()

describe('API Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('searchCity', () => {
    it('searches for cities successfully', async () => {
      const mockResponse = {
        results: [
          {
            name: 'London',
            country: 'GB',
            latitude: 51.5074,
            longitude: -0.1278
          }
        ]
      }

      ;(global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse)
      })

      const result = await searchCity('london')

      expect(result).toEqual([
        {
          name: 'London',
          country: 'GB',
          lat: 51.5074,
          lon: -0.1278
        }
      ])

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('geocoding-api.open-meteo.com/v1/search'),
        expect.any(Object)
      )
    })

    it('handles search errors gracefully', async () => {
      ;(global.fetch as any).mockRejectedValueOnce(new Error('Network error'))

      await expect(searchCity('invalid')).rejects.toThrow('Network error')
    })

    it('returns empty array for no results', async () => {
      ;(global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve([])
      })

      const result = await searchCity('nonexistent')

      expect(result).toEqual([])
    })
  })

  describe('getCurrent', () => {
    it('fetches current weather successfully', async () => {
      const mockResponse = {
        latitude: 51.5074,
        longitude: -0.1278,
        current: {
          temperature_2m: 15.5,
          relative_humidity_2m: 65,
          wind_speed_10m: 3.5,
          wind_direction_10m: 180,
          weathercode: 0
        },
        current_units: {
          temperature_2m: '°C',
          relative_humidity_2m: '%',
          wind_speed_10m: 'km/h'
        },
        utc_offset_seconds: 0
      }

      ;(global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse)
      })

      const result = await getCurrent(51.5074, -0.1278, 'metric')

      expect(result).toEqual({
        coord: { lat: 51.5074, lon: -0.1278 },
        dt: expect.any(Number),
        timezone: 0,
        name: '51.51, -0.13',
        weather: [{ id: 0, main: 'Clear', description: 'Clear sky', icon: expect.stringMatching(/clear-(day|night)/) }],
        main: {
          temp: 15.5,
          feels_like: 15.5,
          humidity: 65,
          pressure: 1013
        },
        wind: { speed: 3.5, deg: 180 }
      })

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('api.open-meteo.com/v1/forecast')
      )
    })

    it('handles API errors', async () => {
      ;(global.fetch as any).mockResolvedValueOnce({
        ok: false,
        status: 400,
        statusText: 'Bad Request'
      })

      await expect(getCurrent(51.5074, -0.1278, 'metric')).rejects.toThrow(
        'Failed to fetch current weather: 400 Bad Request'
      )
    })
  })

  describe('getForecast', () => {
    it('fetches forecast successfully', async () => {
      const mockResponse = {
        daily: {
          time: ['2023-01-01', '2023-01-02'],
          weathercode: [0, 1],
          temperature_2m_max: [18, 20],
          temperature_2m_min: [10, 12]
        },
        utc_offset_seconds: 0
      }

      ;(global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse)
      })

      const result = await getForecast(51.5074, -0.1278, 'metric')

      expect(result).toEqual({
        timezone_offset: 0,
        daily: [
          {
            dt: expect.any(Number),
            temp: { min: 10, max: 18 },
            weather: [{ id: 0, main: 'Clear', description: 'Clear sky', icon: 'clear-day' }]
          },
          {
            dt: expect.any(Number),
            temp: { min: 12, max: 20 },
            weather: [{ id: 1, main: 'Clear', description: 'Mostly sunny', icon: 'partly-cloudy-day' }]
          }
        ]
      })
    })

    it('handles forecast API errors', async () => {
      ;(global.fetch as any).mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error'
      })

      await expect(getForecast(51.5074, -0.1278, 'metric')).rejects.toThrow(
        'Failed to fetch forecast: 500 Internal Server Error'
      )
    })

    it('handles network failures gracefully', async () => {
      // Mock network failure
      ;(global.fetch as any).mockRejectedValueOnce(new Error('Network error'))

      await expect(getForecast(51.5074, -0.1278, 'metric')).rejects.toThrow('Network error')
    })
  })

  describe('Error Handling', () => {
    it('handles network timeouts', async () => {
      ;(global.fetch as any).mockRejectedValueOnce(new Error('timeout'))

      await expect(searchCity('london')).rejects.toThrow('timeout')
    })

    it('handles malformed JSON responses', async () => {
      ;(global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.reject(new Error('Invalid JSON'))
      })

      await expect(searchCity('london')).rejects.toThrow('Invalid JSON')
    })
  })
})
