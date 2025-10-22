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

  const handleShare = async () => {
    try {
      const url = generateCityUrl(city, units);
      const fullUrl = `${window.location.origin}${url}`;
      
      if (navigator.share) {
        // Use native share API if available
        await navigator.share({
          title: `${strings.shareWeather} ${city.name}`,
          text: `${strings.shareWeather} ${city.name}`,
          url: fullUrl,
        });
      } else {
        // Fallback to clipboard
        await navigator.clipboard.writeText(fullUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    } catch (error) {
      console.error('Failed to share:', error);
      // Fallback to clipboard if native share fails
      try {
        const url = generateCityUrl(city, units);
        const fullUrl = `${window.location.origin}${url}`;
        await navigator.clipboard.writeText(fullUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (clipboardError) {
        console.error('Failed to copy to clipboard:', clipboardError);
      }
    }
  };

  return (
    <button
      onClick={handleShare}
      className={`flex items-center space-x-2 px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:ring-offset-2 focus:ring-offset-slate-900 ${className}`}
      aria-label={copied ? strings.linkCopiedToClipboard : strings.shareWeatherForCity.replace('{city}', city.name)}
      title={copied ? strings.linkCopiedToClipboard : strings.shareWeatherForCity.replace('{city}', city.name)}
    >
      {copied ? (
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
  );
}
