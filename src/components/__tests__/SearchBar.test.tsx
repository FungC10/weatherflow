import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import SearchBar from '../SearchBar'

// Mock the storage functions
jest.mock('@/lib/storage', () => ({
  getRecentSearches: jest.fn(() => ['London', 'New York', 'Tokyo']),
  clearRecentSearches: jest.fn(),
}))

describe('SearchBar', () => {
  const mockOnSearch = jest.fn()

  beforeEach(() => {
    mockOnSearch.mockClear()
  })

  it('renders search input with correct attributes', () => {
    render(<SearchBar onSearch={mockOnSearch} />)
    
    const input = screen.getByRole('combobox', { name: /search for a city/i })
    expect(input).toBeInTheDocument()
    expect(input).toHaveAttribute('aria-expanded', 'false')
    expect(input).toHaveAttribute('aria-haspopup', 'listbox')
  })

  it('calls onSearch when typing and debounces input', async () => {
    const user = userEvent.setup()
    render(<SearchBar onSearch={mockOnSearch} />)
    
    const input = screen.getByRole('combobox', { name: /search for a city/i })
    await user.type(input, 'London')
    
    // Wait for debounce
    await waitFor(() => {
      expect(mockOnSearch).toHaveBeenCalledWith('London')
    }, { timeout: 500 })
  })

  it('shows recent searches dropdown on focus', async () => {
    const user = userEvent.setup()
    render(<SearchBar onSearch={mockOnSearch} />)
    
    const input = screen.getByRole('combobox', { name: /search for a city/i })
    await user.click(input)
    
    expect(screen.getByRole('listbox', { name: /recent searches/i })).toBeInTheDocument()
    expect(screen.getByText('Recent Searches')).toBeInTheDocument()
  })

  it('navigates recent searches with arrow keys', async () => {
    const user = userEvent.setup()
    render(<SearchBar onSearch={mockOnSearch} />)
    
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
    render(<SearchBar onSearch={mockOnSearch} />)
    
    const input = screen.getByRole('combobox', { name: /search for a city/i })
    await user.click(input)
    
    // Navigate to first option and select it
    await user.keyboard('{ArrowDown}{Enter}')
    
    expect(mockOnSearch).toHaveBeenCalledWith('London')
    expect(input).toHaveValue('London')
  })

  it('closes dropdown with Escape key', async () => {
    const user = userEvent.setup()
    render(<SearchBar onSearch={mockOnSearch} />)
    
    const input = screen.getByRole('combobox', { name: /search for a city/i })
    await user.click(input)
    
    expect(screen.getByRole('listbox')).toBeInTheDocument()
    
    await user.keyboard('{Escape}')
    
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
  })

  it('focuses search input with "/" key shortcut', async () => {
    const user = userEvent.setup()
    render(<SearchBar onSearch={mockOnSearch} />)
    
    // Click somewhere else first
    await user.click(document.body)
    
    // Press "/" key
    await user.keyboard('/')
    
    const input = screen.getByRole('combobox', { name: /search for a city/i })
    expect(input).toHaveFocus()
  })

  it('does not focus search when already focused', async () => {
    const user = userEvent.setup()
    render(<SearchBar onSearch={mockOnSearch} />)
    
    const input = screen.getByRole('combobox', { name: /search for a city/i })
    await user.click(input)
    
    // Press "/" key while already focused
    await user.keyboard('/')
    
    expect(input).toHaveFocus()
    expect(input).toHaveValue('/')
  })

  it('clears recent searches when clear button is clicked', async () => {
    const user = userEvent.setup()
    const { clearRecentSearches } = require('@/lib/storage')
    
    render(<SearchBar onSearch={mockOnSearch} />)
    
    const input = screen.getByRole('combobox', { name: /search for a city/i })
    await user.click(input)
    
    const clearButton = screen.getByRole('button', { name: /clear all recent searches/i })
    await user.click(clearButton)
    
    expect(clearRecentSearches).toHaveBeenCalled()
  })

  it('handles disabled state correctly', () => {
    render(<SearchBar onSearch={mockOnSearch} disabled={true} />)
    
    const input = screen.getByRole('combobox', { name: /search for a city/i })
    expect(input).toBeDisabled()
  })

  it('submits form with Enter key', async () => {
    const user = userEvent.setup()
    render(<SearchBar onSearch={mockOnSearch} />)
    
    const input = screen.getByRole('combobox', { name: /search for a city/i })
    await user.type(input, 'Paris')
    await user.keyboard('{Enter}')
    
    expect(mockOnSearch).toHaveBeenCalledWith('Paris')
  })
})
