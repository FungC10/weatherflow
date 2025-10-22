import { describe, it, expect } from 'vitest'
import {
  getOpenMeteoWeatherIcon,
  getOpenMeteoWeatherEmoji,
  getOpenMeteoWeatherDescription,
  getVariedWeatherEmoji,
  getVariedWeatherDescription,
  isOpenMeteoDayTime,
  type WeatherIcon
} from '../weatherIconOpenMeteo'

describe('weatherIconOpenMeteo utilities', () => {
  describe('getOpenMeteoWeatherIcon', () => {
    it('maps clear sky codes correctly', () => {
      expect(getOpenMeteoWeatherIcon(0, true)).toBe('clear-day')
      expect(getOpenMeteoWeatherIcon(0, false)).toBe('clear-night')
    })

    it('maps cloud codes correctly', () => {
      expect(getOpenMeteoWeatherIcon(1, true)).toBe('partly-cloudy-day')
      expect(getOpenMeteoWeatherIcon(1, false)).toBe('partly-cloudy-night')
      expect(getOpenMeteoWeatherIcon(2, true)).toBe('partly-cloudy-day')
      expect(getOpenMeteoWeatherIcon(2, false)).toBe('partly-cloudy-night')
      expect(getOpenMeteoWeatherIcon(3, true)).toBe('cloudy')
      expect(getOpenMeteoWeatherIcon(3, false)).toBe('cloudy')
    })

    it('maps fog codes correctly', () => {
      expect(getOpenMeteoWeatherIcon(45, true)).toBe('fog')
      expect(getOpenMeteoWeatherIcon(45, false)).toBe('fog')
      expect(getOpenMeteoWeatherIcon(48, true)).toBe('fog')
      expect(getOpenMeteoWeatherIcon(48, false)).toBe('fog')
    })

    it('maps drizzle codes correctly', () => {
      expect(getOpenMeteoWeatherIcon(51, true)).toBe('rain')
      expect(getOpenMeteoWeatherIcon(53, true)).toBe('rain')
      expect(getOpenMeteoWeatherIcon(55, true)).toBe('rain')
      expect(getOpenMeteoWeatherIcon(56, true)).toBe('rain')
      expect(getOpenMeteoWeatherIcon(57, true)).toBe('rain')
    })

    it('maps rain codes correctly', () => {
      expect(getOpenMeteoWeatherIcon(61, true)).toBe('rain')
      expect(getOpenMeteoWeatherIcon(63, true)).toBe('rain')
      expect(getOpenMeteoWeatherIcon(65, true)).toBe('rain')
      expect(getOpenMeteoWeatherIcon(66, true)).toBe('rain')
      expect(getOpenMeteoWeatherIcon(67, true)).toBe('rain')
    })

    it('maps snow codes correctly', () => {
      expect(getOpenMeteoWeatherIcon(71, true)).toBe('snow')
      expect(getOpenMeteoWeatherIcon(73, true)).toBe('snow')
      expect(getOpenMeteoWeatherIcon(75, true)).toBe('snow')
      expect(getOpenMeteoWeatherIcon(77, true)).toBe('snow')
    })

    it('maps rain shower codes correctly', () => {
      expect(getOpenMeteoWeatherIcon(80, true)).toBe('shower-rain')
      expect(getOpenMeteoWeatherIcon(81, true)).toBe('shower-rain')
      expect(getOpenMeteoWeatherIcon(82, true)).toBe('shower-rain')
    })

    it('maps snow shower codes correctly', () => {
      expect(getOpenMeteoWeatherIcon(85, true)).toBe('snow')
      expect(getOpenMeteoWeatherIcon(86, true)).toBe('snow')
    })

    it('maps thunderstorm codes correctly', () => {
      expect(getOpenMeteoWeatherIcon(95, true)).toBe('thunderstorm')
      expect(getOpenMeteoWeatherIcon(96, true)).toBe('thunderstorm')
      expect(getOpenMeteoWeatherIcon(99, true)).toBe('thunderstorm')
    })

    it('returns unknown for invalid codes', () => {
      expect(getOpenMeteoWeatherIcon(999, true)).toBe('unknown')
      expect(getOpenMeteoWeatherIcon(-1, true)).toBe('unknown')
    })
  })

  describe('getOpenMeteoWeatherEmoji', () => {
    it('returns correct emojis for all weather icons', () => {
      const testCases: Array<[WeatherIcon, string]> = [
        ['clear-day', '☀️'],
        ['clear-night', '🌙'],
        ['partly-cloudy-day', '⛅'],
        ['partly-cloudy-night', '☁️'],
        ['cloudy', '☁️'],
        ['rain', '🌧️'],
        ['shower-rain', '🌦️'],
        ['thunderstorm', '⛈️'],
        ['snow', '❄️'],
        ['mist', '🌫️'],
        ['fog', '🌫️'],
        ['unknown', '🌤️']
      ]

      testCases.forEach(([icon, expectedEmoji]) => {
        expect(getOpenMeteoWeatherEmoji(icon)).toBe(expectedEmoji)
      })
    })

    it('returns default emoji for invalid icon', () => {
      expect(getOpenMeteoWeatherEmoji('invalid' as WeatherIcon)).toBe('🌤️')
    })
  })

  describe('getOpenMeteoWeatherDescription', () => {
    it('returns correct descriptions for known codes', () => {
      expect(getOpenMeteoWeatherDescription(0)).toBe('Clear sky')
      expect(getOpenMeteoWeatherDescription(1)).toBe('Mostly sunny')
      expect(getOpenMeteoWeatherDescription(2)).toBe('Partly cloudy')
      expect(getOpenMeteoWeatherDescription(3)).toBe('Cloudy')
      expect(getOpenMeteoWeatherDescription(45)).toBe('Foggy')
      expect(getOpenMeteoWeatherDescription(48)).toBe('Foggy with rime')
      expect(getOpenMeteoWeatherDescription(51)).toBe('Light drizzle')
      expect(getOpenMeteoWeatherDescription(61)).toBe('Light rain')
      expect(getOpenMeteoWeatherDescription(71)).toBe('Light snow')
      expect(getOpenMeteoWeatherDescription(80)).toBe('Light rain showers')
      expect(getOpenMeteoWeatherDescription(95)).toBe('Thunderstorm')
    })

    it('returns default description for unknown codes', () => {
      expect(getOpenMeteoWeatherDescription(999)).toBe('Unknown conditions')
      expect(getOpenMeteoWeatherDescription(-1)).toBe('Unknown conditions')
    })
  })

  describe('getVariedWeatherEmoji', () => {
    it('returns varied emojis for overcast conditions', () => {
      const overcastEmojis = ['☁️', '🌥️', '☁️', '🌤️', '☁️']
      const timestamp = 1640995200 // Fixed timestamp for consistent testing
      
      // Test that we get different emojis for the same code 3
      const results = Array.from({ length: 5 }, (_, i) => 
        getVariedWeatherEmoji(3, 'cloudy', timestamp + (i * 86400))
      )
      
      // Should get different emojis based on the variation logic
      expect(results).toEqual(expect.arrayContaining(overcastEmojis))
    })

    it('returns standard emoji for non-overcast conditions', () => {
      expect(getVariedWeatherEmoji(0, 'clear-day')).toBe('☀️')
      expect(getVariedWeatherEmoji(1, 'partly-cloudy-day')).toBe('⛅')
      expect(getVariedWeatherEmoji(61, 'rain')).toBe('🌧️')
    })
  })

  describe('getVariedWeatherDescription', () => {
    it('returns varied descriptions for overcast conditions', () => {
      const overcastDescriptions = ['Cloudy', 'Overcast', 'Cloudy skies', 'Overcast skies', 'Cloudy conditions']
      const timestamp = 1640995200 // Fixed timestamp for consistent testing
      
      // Test that we get different descriptions for the same code 3
      const results = Array.from({ length: 5 }, (_, i) => 
        getVariedWeatherDescription(3, timestamp + (i * 86400))
      )
      
      // Should get different descriptions based on the variation logic
      expect(results).toEqual(expect.arrayContaining(overcastDescriptions))
    })

    it('returns standard description for non-overcast conditions', () => {
      expect(getVariedWeatherDescription(0)).toBe('Clear sky')
      expect(getVariedWeatherDescription(1)).toBe('Mostly sunny')
      expect(getVariedWeatherDescription(61)).toBe('Light rain')
    })
  })

  describe('isOpenMeteoDayTime', () => {
    it('returns true for daytime hours', () => {
      // Create timestamps that will be 6 AM, 12 PM, and 5 PM in local time
      const now = new Date()
      const sixAM = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 6, 0, 0).getTime() / 1000
      const twelvePM = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 12, 0, 0).getTime() / 1000
      const fivePM = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 17, 0, 0).getTime() / 1000
      
      expect(isOpenMeteoDayTime(sixAM)).toBe(true)
      expect(isOpenMeteoDayTime(twelvePM)).toBe(true)
      expect(isOpenMeteoDayTime(fivePM)).toBe(true)
    })

    it('returns false for nighttime hours', () => {
      // Create timestamps that will be 12 AM, 5 AM, and 6 PM in local time
      const now = new Date()
      const twelveAM = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0).getTime() / 1000
      const fiveAM = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 5, 0, 0).getTime() / 1000
      const sixPM = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 18, 0, 0).getTime() / 1000
      
      expect(isOpenMeteoDayTime(twelveAM)).toBe(false)
      expect(isOpenMeteoDayTime(fiveAM)).toBe(false)
      expect(isOpenMeteoDayTime(sixPM)).toBe(false)
    })

    it('handles edge cases correctly', () => {
      // Create timestamps for exactly 6 AM and 6 PM in local time
      const now = new Date()
      const sixAM = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 6, 0, 0).getTime() / 1000
      const sixPM = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 18, 0, 0).getTime() / 1000
      
      expect(isOpenMeteoDayTime(sixAM)).toBe(true)
      expect(isOpenMeteoDayTime(sixPM)).toBe(false)
    })
  })
})
