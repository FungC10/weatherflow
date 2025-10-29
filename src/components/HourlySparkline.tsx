'use client';

import { useEffect, useRef, useState, memo } from 'react';
import { HourlyData, Units } from '@/lib/types';
import { formatTemp } from '@/lib/format';
import { useStrings } from '@/lib/LocaleContext';

interface HourlySparklineProps {
  hourlyData: HourlyData[];
  units: Units;
  className?: string;
  titleText?: string;
}

const HourlySparkline = memo(function HourlySparkline({ 
  hourlyData, 
  units, 
  className = '',
  titleText
}: HourlySparklineProps) {
  const strings = useStrings();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    const loadChart = async () => {
      try {
        // Dynamic import of Chart.js with auto-registration (more compatible)
        const { default: Chart } = await import('chart.js/auto');

        if (!mounted || !canvasRef.current) return;

        // Check for reduced motion preference
        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

        // Prepare data for the next 24 hours
        const next24Hours = hourlyData.slice(0, 24);
        const labels = next24Hours.map((_, index) => {
          const hour = new Date().getHours() + index;
          return hour % 24;
        });

        const temperatures = next24Hours.map(data => data.temperature);

        // Create the chart
        const ctx = canvasRef.current.getContext('2d');
        if (!ctx) return;
        const chart = new Chart(ctx, {
          type: 'line',
          data: {
            labels,
            datasets: [{
              data: temperatures,
              borderColor: '#22d3ee', // cyan-400
              backgroundColor: 'rgba(34, 211, 238, 0.1)',
              borderWidth: 2,
              pointRadius: 0,
              pointHoverRadius: 4,
              pointBackgroundColor: '#22d3ee',
              pointBorderColor: '#22d3ee',
              pointHoverBackgroundColor: '#06b6d4', // cyan-500
              pointHoverBorderColor: '#06b6d4',
              tension: 0.4,
              fill: true
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: {
              intersect: false,
              mode: 'index'
            },
            plugins: {
              legend: {
                display: false
              },
              tooltip: {
                backgroundColor: 'rgba(15, 23, 42, 0.9)', // slate-900
                titleColor: '#f1f5f9', // slate-100
                bodyColor: '#f1f5f9',
                borderColor: '#22d3ee',
                borderWidth: 1,
                cornerRadius: 8,
                displayColors: false,
                callbacks: {
                  title: (context) => {
                    const hour = context[0].label;
                    return `${hour}:00`;
                  },
                  label: (context) => {
                    const temp = context.parsed.y;
                    return temp !== null ? `${formatTemp(temp, units)}` : '';
                  }
                }
              }
            },
            scales: {
              x: {
                display: true,
                grid: {
                  display: false
                },
                ticks: {
                  color: '#94a3b8', // slate-400
                  font: {
                    size: 12
                  },
                  maxTicksLimit: 6,
                  callback: (value) => `${value}:00`
                }
              },
              y: {
                display: false
              }
            },
            animation: prefersReducedMotion ? false : {
              duration: 800,
              easing: 'easeInOutQuart'
            },
            elements: {
              point: {
                hoverBackgroundColor: '#06b6d4'
              }
            }
          }
        });

        if (mounted) {
          setIsLoaded(true);
        }

        // Cleanup function
        return () => {
          chart.destroy();
        };
      } catch (err) {
        console.error('Failed to load Chart.js:', err);
        if (mounted) {
          setError('Failed to load chart');
        }
      }
    };

    loadChart();

    return () => {
      mounted = false;
    };
  }, [hourlyData, units]);

  if (error) {
    return (
      <div className={`text-center py-4 text-slate-400 text-sm ${className}`}>
        {error}
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div className={`text-center py-4 ${className}`}>
        <div className="animate-pulse">
          <div className="h-16 bg-slate-700/30 rounded-lg"></div>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-2 ${className}`}>
      <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300">
        {titleText || strings.hourlyTemperature || '24-Hour Temperature'}
      </h4>
      <div className="relative h-16">
        <canvas
          ref={canvasRef}
          className="w-full h-full"
          aria-label={`24-hour temperature chart showing ${hourlyData.length} data points`}
        />
      </div>
    </div>
  );
});

export default HourlySparkline;
