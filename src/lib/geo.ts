/**
 * Geolocation utilities for WeatherFlow
 */

export interface GeoLocation {
  lat: number;
  lon: number;
  name?: string;
  country?: string;
}

export interface GeoLocationError {
  code: number;
  message: string;
  type: 'permission_denied' | 'position_unavailable' | 'timeout' | 'unknown';
}

export async function askLocation(): Promise<GeoLocation> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject({
        code: 0,
        message: 'Geolocation is not supported by this browser',
        type: 'unknown'
      } as GeoLocationError);
      return;
    }

    const options: PositionOptions = {
      enableHighAccuracy: true,
      timeout: 10000, // 10 seconds
      maximumAge: 300000 // 5 minutes
    };

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        resolve({
          lat: latitude,
          lon: longitude,
          name: 'Current Location',
          country: undefined
        });
      },
      (error) => {
        let type: GeoLocationError['type'];
        
        switch (error.code) {
          case error.PERMISSION_DENIED:
            type = 'permission_denied';
            break;
          case error.POSITION_UNAVAILABLE:
            type = 'position_unavailable';
            break;
          case error.TIMEOUT:
            type = 'timeout';
            break;
          default:
            type = 'unknown';
        }

        reject({
          code: error.code,
          message: error.message,
          type
        } as GeoLocationError);
      },
      options
    );
  });
}

export function getLocationErrorMessage(error: GeoLocationError): string {
  switch (error.type) {
    case 'permission_denied':
      return 'Location access denied. Click "Use my location" again to allow access, or enable location in your browser settings.';
    case 'position_unavailable':
      return 'Unable to determine your location. Please try again or search manually.';
    case 'timeout':
      return 'Location request timed out. Please try again.';
    default:
      return 'Unable to get your location. Please search manually.';
  }
}
