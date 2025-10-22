'use client';

import { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { Icon } from 'leaflet';
import { GeoPoint, CurrentWeather, Units } from '@/lib/types';
import { formatTemp } from '@/lib/format';
import 'leaflet/dist/leaflet.css';

// Fix for default markers in react-leaflet
delete (Icon.Default.prototype as any)._getIconUrl;
Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface MapPanelProps {
  city: GeoPoint | null;
  currentWeather: CurrentWeather | null;
  units: Units;
  isVisible: boolean;
}

export default function MapPanel({ city, currentWeather, units, isVisible }: MapPanelProps) {
  const mapRef = useRef<any>(null);

  // Update map center when city changes
  useEffect(() => {
    if (mapRef.current && city && isVisible) {
      mapRef.current.setView([city.lat, city.lon], 10);
    }
  }, [city, isVisible]);

  if (!isVisible) {
    return null;
  }

  if (!city) {
    return (
      <div className="w-full h-64 bg-slate-800/50 rounded-lg border border-slate-700/30 flex items-center justify-center" role="img" aria-label="Map placeholder">
        <div className="text-center">
          <div className="text-slate-400 mb-2" aria-hidden="true">🗺️</div>
          <p className="text-slate-400 text-sm">Select a city to view the map</p>
        </div>
      </div>
    );
  }

  const tileUrl = process.env.NEXT_PUBLIC_TILE_URL || 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
  const tileAttribution = process.env.NEXT_PUBLIC_TILE_ATTRIBUTION || '© OpenStreetMap contributors';

  return (
    <div className="w-full h-64 rounded-lg overflow-hidden border border-slate-700/30" role="img" aria-label={`Interactive map showing ${city.name} weather location`}>
      <MapContainer
        center={[city.lat, city.lon]}
        zoom={10}
        style={{ height: '100%', width: '100%' }}
        ref={mapRef}
        className="z-0"
      >
        <TileLayer
          url={tileUrl}
          attribution={tileAttribution}
        />
        <Marker position={[city.lat, city.lon]}>
          <Popup>
            <div className="text-center">
              <h3 className="font-semibold text-slate-800 mb-1">
                {city.name}
              </h3>
              {currentWeather && (
                <div className="text-slate-600">
                  <div className="text-lg font-medium" aria-label={`Temperature ${formatTemp(currentWeather.main.temp, units)}`}>
                    {formatTemp(currentWeather.main.temp, units)}
                  </div>
                  <div className="text-sm capitalize" aria-label={`Weather condition ${currentWeather.weather[0]?.description}`}>
                    {currentWeather.weather[0]?.description}
                  </div>
                </div>
              )}
            </div>
          </Popup>
        </Marker>
      </MapContainer>
    </div>
  );
}
