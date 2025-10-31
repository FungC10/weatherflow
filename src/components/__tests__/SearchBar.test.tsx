import React from 'react'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi, describe, it, expect, beforeEach } from 'vitest'
import { render, mockGeolocation, localStorageMock } from '../../../test/utils'
import SearchBar from '../SearchBar'

// Mock the storage functions
vi.mock('../../lib/storage', () => ({
  getRecentSearches: vi.fn(() => [
    { name: 'London', country: 'GB', lat: 51.5074, lon: -0.1278 },
    { name: 'New York', country: 'US', lat: 40.7128, lon: -74.0060 },
    { name: 'Tokyo', country: 'JP', lat: 35.6762, lon: 139.6503 }
  ]),
  addRecentSearch: vi.fn(),
  clearRecentSearches: vi.fn(),
}))

// Mock the API functions
vi.mock('../../lib/api', () => ({
  searchCity: vi.fn((query: string) => {
    const mockResults = {
      'london': [{ name: 'London', country: 'GB', lat: 51.5074, lon: -0.1278 }],
      'paris': [{ name: 'Paris', country: 'FR', lat: 48.8566, lon: 2.3522 }],
      'tokyo': [{ name: 'Tokyo', country: 'JP', lat: 35.6762, lon: 139.6503 }],
    }
    return Promise.resolve(mockResults[query.toLowerCase()] || [])
  })
}))

// Mock TanStack Query
vi.mock('@tanstack/react-query', async () => {
  const actual = await vi.importActual('@tanstack/react-query')
  return {
    ...actual,
    useQuery: vi.fn(({ queryKey, queryFn, enabled }) => {
      const [type, query] = queryKey
      
      if (type === 'city' && enabled && query) {
        return {
          data: query === 'london' ? [{ name: 'London', country: 'GB', lat: 51.5074, lon: -0.1278 }] : [],
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

describe('SearchBar', () => {
  const mockOnCitySelect = vi.fn()

  beforeEach(() => {
    mockOnCitySelect.mockClear()
  })

  it('renders search input with correct attributes', () => {
    render(<SearchBar onCitySelect={mockOnCitySelect} />)
    
    const input = screen.getByRole('combobox', { name: /search for a city/i })
    expect(input).toBeInTheDocument()
    expect(input).toHaveAttribute('aria-expanded', 'false')
    expect(input).toHaveAttribute('aria-haspopup', 'listbox')
  })

  it('calls onCitySelect when a city is selected', async () => {
    const user = userEvent.setup()
    render(<SearchBar onCitySelect={mockOnCitySelect} />)
    
    const input = screen.getByRole('combobox', { name: /search for a city/i })
    await user.type(input, 'london')
    
    // Wait for search results to appear
    await waitFor(() => {
      expect(screen.getByText('London')).toBeInTheDocument()
    }, { timeout: 1000 })
    
    // Click on the first result
    const londonResult = screen.getByText('London')
    await user.click(londonResult)
    
    expect(mockOnCitySelect).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'London',
        country: 'GB',
        lat: 51.5074,
        lon: -0.1278
      })
    )
  })

  it('shows recent searches dropdown on focus', async () => {
    const user = userEvent.setup()
    render(<SearchBar onCitySelect={mockOnCitySelect} />)
    
    const input = screen.getByRole('combobox', { name: /search for a city/i })
    await user.click(input)
    
    expect(screen.getByRole('listbox', { name: /search suggestions/i })).toBeInTheDocument()
    expect(screen.getByText('Recent Searches')).toBeInTheDocument()
  })

  it('navigates recent searches with arrow keys', async () => {
    const user = userEvent.setup()
    render(<SearchBar onCitySelect={mockOnCitySelect} />)
    
    const input = screen.getByRole('combobox', { name: /search for a city/i })
    await user.click(input)
    
    // Press arrow down
    await user.keyboard('{ArrowDown}')
    
    const firstOption = screen.getByRole('option', { name: 'London' })
    expect(firstOption).toHaveAttribute('aria-selected', 'true')
    
    // Press arrow down again
    await user.keyboard('{ArrowDown}')
    
    const secondOption = screen.getByRole('option', { name: 'New York' })
    expect(secondOption).toHaveAttribute('aria-selected', 'true')
    expect(firstOption).toHaveAttribute('aria-selected', 'false')
  })

  it('selects recent search with Enter key', async () => {
    const user = userEvent.setup()
    render(<SearchBar onCitySelect={mockOnCitySelect} />)
    
    const input = screen.getByRole('combobox', { name: /search for a city/i })
    await user.click(input)
    
    // Navigate to first option and select it
    await user.keyboard('{ArrowDown}{Enter}')
    
    // Should set the query to the recent search
    expect(input).toHaveValue('London')
  })

  it('closes dropdown with Escape key', async () => {
    const user = userEvent.setup()
    render(<SearchBar onCitySelect={mockOnCitySelect} />)
    
    const input = screen.getByRole('combobox', { name: /search for a city/i })
    await user.click(input)
    
    expect(screen.getByRole('listbox')).toBeInTheDocument()
    
    await user.keyboard('{Escape}')
    
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
  })

  it('focuses search input with "/" key shortcut', async () => {
    const user = userEvent.setup()
    render(<SearchBar onCitySelect={mockOnCitySelect} />)
    
    // Click somewhere else first
    await user.click(document.body)
    
    // Press "/" key
    await user.keyboard('/')
    
    const input = screen.getByRole('combobox', { name: /search for a city/i })
    expect(input).toHaveFocus()
  })

  it('does not focus search when already focused', async () => {
    const user = userEvent.setup()
    render(<SearchBar onCitySelect={mockOnCitySelect} />)
    
    const input = screen.getByRole('combobox', { name: /search for a city/i })
    await user.click(input)
    
    // Press "/" key while already focused
    await user.keyboard('/')
    
    expect(input).toHaveFocus()
    expect(input).toHaveValue('/')
  })

  it('clears recent searches when clear button is clicked', async () => {
    const user = userEvent.setup()
    const { clearRecentSearches } = await import('@/lib/storage')
    
    render(<SearchBar onCitySelect={mockOnCitySelect} />)
    
    const input = screen.getByRole('combobox', { name: /search for a city/i })
    await user.click(input)
    
    const clearButton = screen.getByRole('button', { name: /clear all recent searches/i })
    await user.click(clearButton)
    
    expect(clearRecentSearches).toHaveBeenCalled()
  })

  it('handles disabled state correctly', () => {
    render(<SearchBar onCitySelect={mockOnCitySelect} disabled={true} />)
    
    const input = screen.getByRole('combobox', { name: /search for a city/i })
    expect(input).toBeDisabled()
  })

  it('submits form with Enter key when search results are available', async () => {
    const user = userEvent.setup()
    render(<SearchBar onCitySelect={mockOnCitySelect} />)
    
    const input = screen.getByRole('combobox', { name: /search for a city/i })
    await user.type(input, 'london')
    
    // Wait for search results to appear
    await waitFor(() => {
      expect(screen.getByText('London')).toBeInTheDocument()
    }, { timeout: 1000 })
    
    await user.keyboard('{Enter}')
    
    expect(mockOnCitySelect).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'London',
        country: 'GB',
        lat: 51.5074,
        lon: -0.1278
      })
    )
  })

  it('shows validation error when submitting empty form', async () => {
    const user = userEvent.setup()
    render(<SearchBar onCitySelect={mockOnCitySelect} />)
    
    const input = screen.getByRole('combobox', { name: /search for a city/i })
    
    // Try to submit empty form
    await user.keyboard('{Enter}')
    
    // Check for error message
    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeInTheDocument()
      expect(screen.getByText(/please enter a city name/i)).toBeInTheDocument()
    })
    
    // Error should be accessible
    const errorMessage = screen.getByRole('alert')
    expect(errorMessage).toHaveAttribute('aria-live', 'polite')
    expect(errorMessage).toHaveAttribute('id', 'search-error')
  })

  it('clears validation error when user starts typing', async () => {
    const user = userEvent.setup()
    render(<SearchBar onCitySelect={mockOnCitySelect} />)
    
    const input = screen.getByRole('combobox', { name: /search for a city/i })
    
    // Submit empty form to trigger error
    await user.keyboard('{Enter}')
    
    // Wait for error to appear
    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeInTheDocument()
    })
    
    // Start typing - error should clear
    await user.type(input, 'l')
    
    // Error should disappear
    await waitFor(() => {
      expect(screen.queryByRole('alert')).not.toBeInTheDocument()
    })
  })
})
