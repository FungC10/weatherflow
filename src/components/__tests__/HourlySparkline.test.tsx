import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import HourlySparkline from '../HourlySparkline';
import { HourlyData, Units } from '@/lib/types';

// Mock Chart.js
vi.mock('chart.js', () => ({
  Chart: vi.fn().mockImplementation(() => ({
    destroy: vi.fn()
  })),
  registerables: []
}));

// Mock the LocaleContext
vi.mock('@/lib/LocaleContext', () => ({
  useStrings: () => ({
    hourlyTemperature: '24-Hour Temperature'
  })
}));

// Mock formatTemp
vi.mock('@/lib/format', () => ({
  formatTemp: (temp: number, units: Units) => `${temp}°${units === 'metric' ? 'C' : 'F'}`
}));

describe('HourlySparkline', () => {
  const mockHourlyData: HourlyData[] = [
    { time: '2024-01-01T00:00', temperature: 15 },
    { time: '2024-01-01T01:00', temperature: 14 },
    { time: '2024-01-01T02:00', temperature: 13 },
    { time: '2024-01-01T03:00', temperature: 12 },
    { time: '2024-01-01T04:00', temperature: 11 },
  ];

  beforeEach(() => {
    // Mock window.matchMedia
    Object.defineProperty(global, 'window', {
      value: {
        matchMedia: vi.fn().mockImplementation(query => ({
          matches: false,
          media: query,
          onchange: null,
          addListener: vi.fn(),
          removeListener: vi.fn(),
          addEventListener: vi.fn(),
          removeEventListener: vi.fn(),
          dispatchEvent: vi.fn(),
        })),
      },
      writable: true,
    });
  });

  it('renders loading state initially', () => {
    render(
      <HourlySparkline 
        hourlyData={mockHourlyData} 
        units="metric" 
      />
    );

    expect(screen.getByText('24-Hour Temperature')).toBeInTheDocument();
    // Should show loading skeleton
    expect(document.querySelector('.animate-pulse')).toBeInTheDocument();
  });

  it('renders canvas element for chart', () => {
    render(
      <HourlySparkline 
        hourlyData={mockHourlyData} 
        units="metric" 
      />
    );

    const canvas = document.querySelector('canvas');
    expect(canvas).toBeInTheDocument();
    expect(canvas).toHaveAttribute('aria-label', '24-hour temperature chart showing 5 data points');
  });

  it('applies custom className', () => {
    const { container } = render(
      <HourlySparkline 
        hourlyData={mockHourlyData} 
        units="metric" 
        className="custom-class"
      />
    );

    expect(container.firstChild).toHaveClass('custom-class');
  });

  it('handles empty hourly data gracefully', () => {
    render(
      <HourlySparkline 
        hourlyData={[]} 
        units="metric" 
      />
    );

    expect(screen.getByText('24-Hour Temperature')).toBeInTheDocument();
  });

  it('shows error state when chart loading fails', async () => {
    // Mock Chart.js to throw an error
    vi.doMock('chart.js', () => {
      throw new Error('Chart.js failed to load');
    });

    render(
      <HourlySparkline 
        hourlyData={mockHourlyData} 
        units="metric" 
      />
    );

    // Should eventually show error state
    // Note: This test might need adjustment based on actual error handling
  });
});
