'use client';

import { useState } from 'react';
import { GeoPoint, Units } from '@/lib/types';
import { generateCityUrl } from '@/lib/cityUtils';
import { useStrings } from '@/lib/LocaleContext';

interface ShareButtonProps {
  city: GeoPoint;
  units: Units;
  className?: string;
}

export default function ShareButton({ city, units, className = '' }: ShareButtonProps) {
  const strings = useStrings();
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showLink, setShowLink] = useState(false);

  const handleShare = async () => {
    // Clear any previous error state
    setError(null);
    
    // Toggle link display if already shown
    if (showLink) {
      setShowLink(false);
      return;
    }
    
    try {
      const url = generateCityUrl(city, units);
      const fullUrl = `${window.location.origin}${url}`;
      
      if (navigator.share) {
        // Use native share API if available
        await navigator.share({
          title: `Weather for ${city.name}`,
          text: `Check out the weather in ${city.name}`,
          url: fullUrl,
        });
        // If we reach here, sharing was successful
        return;
      } else {
        // Fallback to clipboard and show link
        await navigator.clipboard.writeText(fullUrl);
        setCopied(true);
        setShowLink(true);
        setTimeout(() => setCopied(false), 2000);
        return;
      }
    } catch (error) {
      // Check if it's a user cancellation (AbortError)
      if (error instanceof Error && error.name === 'AbortError') {
        // User cancelled the share dialog - this is normal, don't show error
        console.log('Share cancelled by user');
        return;
      }
      
      // Check if it's a permission denied error
      if (error instanceof Error && error.name === 'NotAllowedError') {
        console.log('Share not allowed - trying clipboard fallback');
        // Try clipboard as fallback
        try {
          const url = generateCityUrl(city, units);
          const fullUrl = `${window.location.origin}${url}`;
          await navigator.clipboard.writeText(fullUrl);
          setCopied(true);
          setShowLink(true);
          setTimeout(() => setCopied(false), 2000);
          return;
        } catch (clipboardError) {
          console.error('Clipboard also failed:', clipboardError);
          setError('Unable to share or copy link');
          setTimeout(() => setError(null), 3000);
          return;
        }
      }
      
      // For other errors, try clipboard as fallback
      console.error('Share failed:', error);
      try {
        const url = generateCityUrl(city, units);
        const fullUrl = `${window.location.origin}${url}`;
        await navigator.clipboard.writeText(fullUrl);
        setCopied(true);
        setShowLink(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (clipboardError) {
        console.error('Clipboard fallback failed:', clipboardError);
        setError('Unable to share or copy link');
        setTimeout(() => setError(null), 3000);
      }
    }
  };

  const getFullUrl = () => {
    const url = generateCityUrl(city, units);
    return `${typeof window !== 'undefined' ? window.location.origin : ''}${url}`;
  };

  return (
    <div className="relative">
      <button
        onClick={handleShare}
        className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:ring-offset-2 focus:ring-offset-slate-900 ${
          error 
            ? 'bg-red-600 hover:bg-red-700 text-white' 
            : copied 
              ? 'bg-green-600 hover:bg-green-700 text-white'
              : 'bg-cyan-600 hover:bg-cyan-700 text-white'
        } ${className}`}
        aria-label={error ? 'Share failed' : copied ? strings.linkCopiedToClipboard : `Share weather for ${city.name || 'Unknown City'}`}
        title={error ? 'Share failed' : copied ? strings.linkCopiedToClipboard : `Share weather for ${city.name || 'Unknown City'}`}
      >
        {error ? (
          <>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
            <span>Failed</span>
          </>
        ) : copied ? (
          <>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span>{strings.linkCopied}</span>
          </>
        ) : (
          <>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
            </svg>
            <span>{strings.share}</span>
          </>
        )}
      </button>
      
      {/* Error tooltip */}
      {error && (
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-red-600 text-white text-xs rounded whitespace-nowrap z-10">
          {error}
        </div>
      )}

      {/* Link display */}
      {showLink && (
        <div className="absolute top-full left-0 mt-2 w-80 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-3 shadow-lg z-10">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <p className="text-xs text-slate-600 dark:text-slate-400 mb-1">Shareable link:</p>
              <p 
                className="text-xs text-slate-800 dark:text-slate-200 break-all font-mono bg-slate-50 dark:bg-slate-900 p-2 rounded border border-slate-200 dark:border-slate-700"
                title={getFullUrl()}
              >
                {getFullUrl()}
              </p>
            </div>
            <button
              onClick={() => setShowLink(false)}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors flex-shrink-0"
              aria-label="Close link display"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
