import React from 'react'
import { render, RenderOptions } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { vi } from 'vitest'

// Mock fetch globally
global.fetch = vi.fn()

// Create a custom render function that includes providers
const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
      },
    },
  })

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  )
}

const customRender = (
  ui: React.ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => render(ui, { wrapper: AllTheProviders, ...options })

// Mock geolocation
const mockGeolocation = {
  getCurrentPosition: vi.fn(),
  watchPosition: vi.fn(),
  clearWatch: vi.fn(),
}

// Ensure navigator exists before defining geolocation
if (typeof global.navigator === 'undefined') {
  Object.defineProperty(global, 'navigator', {
    value: {},
    writable: true,
  })
}

Object.defineProperty(global.navigator, 'geolocation', {
  value: mockGeolocation,
  writable: true,
})

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
}

// Ensure window exists before defining localStorage
if (typeof global.window === 'undefined') {
  Object.defineProperty(global, 'window', {
    value: {},
    writable: true,
  })
}

Object.defineProperty(global.window, 'localStorage', {
  value: localStorageMock,
  writable: true,
})

// Re-export everything
export * from '@testing-library/react'
export { customRender as render }
export { mockGeolocation, localStorageMock }
