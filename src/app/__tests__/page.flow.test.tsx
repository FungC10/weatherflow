import React from 'react'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi, describe, it, expect, beforeEach } from 'vitest'
import { render, mockGeolocation, localStorageMock } from '../../../test/utils'
import Page from '../page'

// Mock the API functions
const mockSearchCity = vi.fn()
const mockGetCurrent = vi.fn()
const mockGetForecast = vi.fn()

vi.mock('../../lib/api', () => ({
  searchCity: mockSearchCity,
  getCurrent: mockGetCurrent,
  getForecast: mockGetForecast,
}))

// Mock the storage functions
vi.mock('../../lib/storage', () => ({
  getRecentSearches: vi.fn(() => []),
  addRecentSearch: vi.fn(),
  getUnits: vi.fn(() => 'metric'),
  setUnits: vi.fn(),
}))

// Mock the geo functions
vi.mock('../../lib/geo', () => ({
  askLocation: vi.fn(),
}))

// Mock TanStack Query
vi.mock('@tanstack/react-query', async () => {
  const actual = await vi.importActual('@tanstack/react-query')
  return {
    ...actual,
    useQuery: vi.fn(({ queryKey, queryFn, enabled }) => {
      const [type, lat, lon, units] = queryKey
      
      if (type === 'current' && enabled) {
        return {
          data: {
            coord: { lat: 51.5074, lon: -0.1278 },
            dt: 1640995200,
            timezone: 0,
            name: 'London',
            weather: [{ id: 800, main: 'Clear', description: 'clear sky', icon: '01d' }],
            main: { temp: 15, feels_like: 14, humidity: 65, pressure: 1013 },
            wind: { speed: 3.5, deg: 180 },
          },
          isLoading: false,
          error: null,
        }
      }
      
      if (type === 'forecast' && enabled) {
        return {
          data: {
            timezone_offset: 0,
            daily: [
              {
                dt: 1640995200,
                temp: { min: 10, max: 18 },
                weather: [{ id: 800, main: 'Clear', description: 'clear sky', icon: '01d' }],
              },
              {
                dt: 1641081600,
                temp: { min: 12, max: 20 },
                weather: [{ id: 801, main: 'Clouds', description: 'few clouds', icon: '02d' }],
              },
            ],
          },
          isLoading: false,
          error: null,
        }
      }
      
      return {
        data: undefined,
        isLoading: false,
        error: null,
      }
    }),
  }
})

describe('Page Integration Flow', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockSearchCity.mockResolvedValue([
      { name: 'London', country: 'GB', lat: 51.5074, lon: -0.1278 }
    ])
  })

  it('shows empty state initially', () => {
    render(<Page />)
    
    expect(screen.getByText('Welcome to WeatherFlow')).toBeInTheDocument()
    expect(screen.getByText('Search for a city to get started with weather information')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /search for a city/i })).toBeInTheDocument()
  })

  it('shows search bar and unit toggle', () => {
    render(<Page />)
    
    expect(screen.getByRole('combobox', { name: /search for a city/i })).toBeInTheDocument()
    expect(screen.getByRole('switch', { name: /units/i })).toBeInTheDocument()
    expect(screen.getByText('Units:')).toBeInTheDocument()
  })

  it('shows "Use my location" button', () => {
    render(<Page />)
    
    expect(screen.getByRole('button', { name: /use your current location/i })).toBeInTheDocument()
  })

  it('handles successful city search and displays weather data', async () => {
    const user = userEvent.setup()
    render(<Page />)
    
    const input = screen.getByRole('combobox', { name: /search for a city/i })
    await user.type(input, 'london')
    
    // Wait for search results and select
    await waitFor(() => {
      expect(screen.getByText('London')).toBeInTheDocument()
    })
    
    const londonResult = screen.getByText('London')
    await user.click(londonResult)
    
    // Should show weather data
    await waitFor(() => {
      expect(screen.getByText('London')).toBeInTheDocument()
      expect(screen.getByText('15°C')).toBeInTheDocument()
      expect(screen.getByText('clear sky')).toBeInTheDocument()
    })
  })

  it('handles geolocation success', async () => {
    const user = userEvent.setup()
    const { askLocation } = await import('@/lib/geo')
    
    // Mock successful geolocation
    mockGeolocation.getCurrentPosition.mockImplementation((success) => {
      success({
        coords: {
          latitude: 51.5074,
          longitude: -0.1278,
          accuracy: 10,
        },
      } as GeolocationPosition)
    })
    
    askLocation.mockResolvedValue({
      coords: {
        latitude: 51.5074,
        longitude: -0.1278,
        accuracy: 10,
      },
    } as GeolocationPosition)
    
    render(<Page />)
    
    const locationButton = screen.getByRole('button', { name: /use your current location/i })
    await user.click(locationButton)
    
    // Should show weather data for current location
    await waitFor(() => {
      expect(screen.getByText('London')).toBeInTheDocument()
      expect(screen.getByText('15°C')).toBeInTheDocument()
    })
  })

  it('handles geolocation permission denied', async () => {
    const user = userEvent.setup()
    const { askLocation } = await import('@/lib/geo')
    
    // Mock geolocation permission denied
    const error = new Error('User denied geolocation')
    error.name = 'NotAllowedError'
    askLocation.mockRejectedValue(error)
    
    render(<Page />)
    
    const locationButton = screen.getByRole('button', { name: /use your current location/i })
    await user.click(locationButton)
    
    // Should show error message
    await waitFor(() => {
      expect(screen.getByText(/location access denied/i)).toBeInTheDocument()
    })
  })

  it('handles geolocation timeout', async () => {
    const user = userEvent.setup()
    const { askLocation } = await import('@/lib/geo')
    
    // Mock geolocation timeout
    const error = new Error('Geolocation timeout')
    error.name = 'TimeoutError'
    askLocation.mockRejectedValue(error)
    
    render(<Page />)
    
    const locationButton = screen.getByRole('button', { name: /use your current location/i })
    await user.click(locationButton)
    
    // Should show error message
    await waitFor(() => {
      expect(screen.getByText(/location request timed out/i)).toBeInTheDocument()
    })
  })

  it('handles geolocation not supported', async () => {
    const user = userEvent.setup()
    const { askLocation } = await import('@/lib/geo')
    
    // Mock geolocation not supported
    const error = new Error('Geolocation not supported')
    error.name = 'NotSupportedError'
    askLocation.mockRejectedValue(error)
    
    render(<Page />)
    
    const locationButton = screen.getByRole('button', { name: /use your current location/i })
    await user.click(locationButton)
    
    // Should show error message
    await waitFor(() => {
      expect(screen.getByText(/geolocation not supported/i)).toBeInTheDocument()
    })
  })

  it('toggles units and updates display', async () => {
    const user = userEvent.setup()
    render(<Page />)
    
    const unitToggle = screen.getByRole('switch', { name: /units/i })
    await user.click(unitToggle)
    
    // Should show Fahrenheit
    expect(screen.getByText('°F')).toBeInTheDocument()
  })

  it('shows map toggle button when city is selected', async () => {
    const user = userEvent.setup()
    render(<Page />)
    
    const input = screen.getByRole('combobox', { name: /search for a city/i })
    await user.type(input, 'london')
    
    await waitFor(() => {
      expect(screen.getByText('London')).toBeInTheDocument()
    })
    
    const londonResult = screen.getByText('London')
    await user.click(londonResult)
    
    // Should show map toggle
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /show map/i })).toBeInTheDocument()
    })
  })

  it('handles keyboard navigation in search', async () => {
    const user = userEvent.setup()
    render(<Page />)
    
    const input = screen.getByRole('combobox', { name: /search for a city/i })
    await user.type(input, 'london')
    
    await waitFor(() => {
      expect(screen.getByText('London')).toBeInTheDocument()
    })
    
    // Use arrow keys to navigate
    await user.keyboard('{ArrowDown}')
    expect(screen.getByRole('option', { name: /london/i })).toHaveAttribute('aria-selected', 'true')
    
    // Select with Enter
    await user.keyboard('{Enter}')
    
    await waitFor(() => {
      expect(screen.getByText('London')).toBeInTheDocument()
    })
  })

  it('handles escape key to close search suggestions', async () => {
    const user = userEvent.setup()
    render(<Page />)
    
    const input = screen.getByRole('combobox', { name: /search for a city/i })
    await user.type(input, 'london')
    
    await waitFor(() => {
      expect(screen.getByText('London')).toBeInTheDocument()
    })
    
    // Press Escape
    await user.keyboard('{Escape}')
    
    // Suggestions should be hidden
    expect(screen.queryByRole('option')).not.toBeInTheDocument()
  })

  it('shows share and view page buttons when city is selected', async () => {
    const user = userEvent.setup()
    render(<Page />)
    
    const input = screen.getByRole('combobox', { name: /search for a city/i })
    await user.type(input, 'london')
    
    await waitFor(() => {
      expect(screen.getByText('London')).toBeInTheDocument()
    })
    
    const londonResult = screen.getByText('London')
    await user.click(londonResult)
    
    // Should show action buttons
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /share/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /view page/i })).toBeInTheDocument()
    })
  })
})
