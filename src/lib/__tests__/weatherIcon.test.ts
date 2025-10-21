import { describe, it, expect } from 'vitest'
import { getWeatherIcon, getWeatherEmoji, isDayTime } from '../weatherIcon'

describe('weatherIcon utilities', () => {
  describe('getWeatherIcon', () => {
    it('returns correct icon for clear sky', () => {
      expect(getWeatherIcon(800, true)).toBe('clear-day')
      expect(getWeatherIcon(800, false)).toBe('clear-night')
    })

    it('returns correct icon for clouds', () => {
      expect(getWeatherIcon(801, true)).toBe('partly-cloudy-day')
      expect(getWeatherIcon(801, false)).toBe('partly-cloudy-night')
      expect(getWeatherIcon(802, true)).toBe('cloudy')
      expect(getWeatherIcon(803, true)).toBe('cloudy')
      expect(getWeatherIcon(804, true)).toBe('cloudy')
    })

    it('returns correct icon for rain', () => {
      expect(getWeatherIcon(500, true)).toBe('rain')
      expect(getWeatherIcon(501, true)).toBe('rain')
      expect(getWeatherIcon(502, true)).toBe('rain')
      expect(getWeatherIcon(503, true)).toBe('rain')
      expect(getWeatherIcon(504, true)).toBe('rain')
    })

    it('returns correct icon for snow', () => {
      expect(getWeatherIcon(600, true)).toBe('snow')
      expect(getWeatherIcon(601, true)).toBe('snow')
      expect(getWeatherIcon(602, true)).toBe('snow')
      expect(getWeatherIcon(611, true)).toBe('snow')
      expect(getWeatherIcon(612, true)).toBe('snow')
      expect(getWeatherIcon(613, true)).toBe('snow')
    })

    it('returns correct icon for thunderstorm', () => {
      expect(getWeatherIcon(200, true)).toBe('thunderstorm')
      expect(getWeatherIcon(201, true)).toBe('thunderstorm')
      expect(getWeatherIcon(202, true)).toBe('thunderstorm')
      expect(getWeatherIcon(230, true)).toBe('thunderstorm')
      expect(getWeatherIcon(231, true)).toBe('thunderstorm')
      expect(getWeatherIcon(232, true)).toBe('thunderstorm')
    })

    it('returns correct icon for fog', () => {
      expect(getWeatherIcon(741, true)).toBe('fog')
      expect(getWeatherIcon(741, false)).toBe('fog')
    })

    it('returns correct icon for wind', () => {
      expect(getWeatherIcon(771, true)).toBe('mist')
      expect(getWeatherIcon(771, false)).toBe('mist')
    })

    it('returns unknown for unrecognized weather codes', () => {
      expect(getWeatherIcon(999, true)).toBe('unknown')
      expect(getWeatherIcon(-1, false)).toBe('unknown')
    })
  })

  describe('getWeatherEmoji', () => {
    it('returns correct emoji for known weather icons', () => {
      expect(getWeatherEmoji('clear-day')).toBe('☀️')
      expect(getWeatherEmoji('clear-night')).toBe('🌙')
      expect(getWeatherEmoji('partly-cloudy-day')).toBe('⛅')
      expect(getWeatherEmoji('partly-cloudy-night')).toBe('☁️')
      expect(getWeatherEmoji('cloudy')).toBe('☁️')
      expect(getWeatherEmoji('rain')).toBe('🌧️')
      expect(getWeatherEmoji('snow')).toBe('❄️')
      expect(getWeatherEmoji('unknown')).toBe('❓')
      expect(getWeatherEmoji('thunderstorm')).toBe('⛈️')
      expect(getWeatherEmoji('fog')).toBe('🌫️')
      expect(getWeatherEmoji('mist')).toBe('🌫️')
    })

    it('returns question mark for unknown weather icons', () => {
      expect(getWeatherEmoji('unknown')).toBe('❓')
      expect(getWeatherEmoji('unknown')).toBe('❓')
    })
  })

  describe('isDayTime', () => {
    it('returns true for day icons', () => {
      expect(isDayTime('01d')).toBe(true)
      expect(isDayTime('02d')).toBe(true)
      expect(isDayTime('03d')).toBe(true)
      expect(isDayTime('04d')).toBe(true)
      expect(isDayTime('09d')).toBe(true)
      expect(isDayTime('10d')).toBe(true)
      expect(isDayTime('11d')).toBe(true)
      expect(isDayTime('13d')).toBe(true)
      expect(isDayTime('50d')).toBe(true)
    })

    it('returns false for night icons', () => {
      expect(isDayTime('01n')).toBe(false)
      expect(isDayTime('02n')).toBe(false)
      expect(isDayTime('03n')).toBe(false)
      expect(isDayTime('04n')).toBe(false)
      expect(isDayTime('09n')).toBe(false)
      expect(isDayTime('10n')).toBe(false)
      expect(isDayTime('11n')).toBe(false)
      expect(isDayTime('13n')).toBe(false)
      expect(isDayTime('50n')).toBe(false)
    })

    it('handles edge cases', () => {
      expect(isDayTime('')).toBe(false)
      expect(isDayTime('d')).toBe(true)
      expect(isDayTime('n')).toBe(false)
      expect(isDayTime('01')).toBe(false)
    })
  })
})
