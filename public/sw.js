// Service Worker for WeatherFlow PWA
const CACHE_NAME = 'weatherflow-v1';
const FORECAST_CACHE_NAME = 'weatherflow-last';
const STATIC_CACHE_URLS = [
  '/',
  '/manifest.webmanifest',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
  // Add other static assets as needed
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('Service Worker: Install event');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Service Worker: Caching static assets');
        return cache.addAll(STATIC_CACHE_URLS);
      })
      .then(() => {
        console.log('Service Worker: Static assets cached');
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('Service Worker: Cache failed', error);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activate event');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Service Worker: Deleting old cache', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      console.log('Service Worker: Activated');
      return self.clients.claim();
    })
  );
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
  // Only handle GET requests
  if (event.request.method !== 'GET') {
    return;
  }

  // Handle forecast API requests specially
  if (event.request.url.includes('api.open-meteo.com/v1/forecast')) {
    event.respondWith(handleForecastRequest(event.request));
    return;
  }

  // Skip cross-origin requests for other APIs
  if (!event.request.url.startsWith(self.location.origin)) {
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then((cachedResponse) => {
        // Return cached version if available
        if (cachedResponse) {
          console.log('Service Worker: Serving from cache', event.request.url);
          return cachedResponse;
        }

        // Otherwise fetch from network
        console.log('Service Worker: Fetching from network', event.request.url);
        return fetch(event.request)
          .then((response) => {
            // Don't cache non-successful responses
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            // Clone the response for caching
            const responseToCache = response.clone();

            // Cache the response for future use
            caches.open(CACHE_NAME)
              .then((cache) => {
                cache.put(event.request, responseToCache);
              });

            return response;
          })
          .catch((error) => {
            console.error('Service Worker: Fetch failed', error);
            
            // Return offline page for navigation requests
            if (event.request.destination === 'document') {
              return caches.match('/');
            }
            
            throw error;
          });
      })
  );
});

// Handle forecast API requests with special caching
async function handleForecastRequest(request) {
  try {
    // Try to fetch from network first
    const response = await fetch(request);
    
    if (response.ok) {
      // Clone the response for caching
      const responseToCache = response.clone();
      
      // Store in forecast cache with timestamp
      const cache = await caches.open(FORECAST_CACHE_NAME);
      await cache.put('forecast-last', responseToCache);
      
      // Also store timestamp
      const timestamp = new Date().toISOString();
      await cache.put('forecast-timestamp', new Response(timestamp));
      
      console.log('Service Worker: Cached forecast data', timestamp);
      return response;
    }
    
    throw new Error(`HTTP ${response.status}`);
  } catch (error) {
    console.log('Service Worker: Network failed, trying cache', error.message);
    
    // Network failed, try to serve from cache
    const cache = await caches.open(FORECAST_CACHE_NAME);
    const cachedResponse = await cache.match('forecast-last');
    
    if (cachedResponse) {
      console.log('Service Worker: Serving cached forecast data');
      return cachedResponse;
    }
    
    // No cached data available
    throw error;
  }
}

// Handle background sync (if supported)
self.addEventListener('sync', (event) => {
  console.log('Service Worker: Background sync', event.tag);
  // Add background sync logic here if needed
});

// Handle push notifications (if needed in the future)
self.addEventListener('push', (event) => {
  console.log('Service Worker: Push event', event);
  // Add push notification logic here if needed
});
