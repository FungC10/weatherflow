export type Locale = 'en' | 'es' | 'fr' | 'de' | 'it' | 'pt' | 'ja' | 'ko' | 'zh';

export interface Strings {
  // App branding
  appName: string;
  appDescription: string;
  
  // Search functionality
  searchPlaceholder: string;
  searchLabel: string;
  searchHelp: string;
  recentSearches: string;
  clearRecentSearches: string;
  searching: string;
  
  // Location services
  useMyLocation: string;
  gettingLocation: string;
  locationDenied: string;
  locationUnavailable: string;
  locationTimeout: string;
  
  // Units
  units: string;
  celsius: string;
  fahrenheit: string;
  unitsDescription: string;
  
  // Weather data
  temperature: string;
  feelsLike: string;
  wind: string;
  humidity: string;
  pressure: string;
  weatherCondition: string;
  lastUpdated: string;
  
  // Forecast
  forecastTitle: string;
  today: string;
  high: string;
  low: string;
  hourlyTemperature: string;
  
  // States
  noWeatherData: string;
  noForecastData: string;
  noForecastDescription: string;
  loadingWeather: string;
  loadingForecast: string;
  loadingMap: string;
  
  // Errors
  errorTitle: string;
  errorMessage: string;
  retry: string;
  tryAgain: string;
  networkError: string;
  apiError: string;
  
  // Actions
  share: string;
  shareWeather: string;
  linkCopied: string;
  viewPage: string;
  clearSearch: string;
  backToSearch: string;
  
  // Map
  showMap: string;
  hideMap: string;
  mapPlaceholder: string;
  mapDescription: string;
  
  // Offline
  offlineData: string;
  lastUpdatedAt: string;
  
  // Favorites
  addToFavorites: string;
  removeFromFavorites: string;
  favorites: string;
  noFavorites: string;
  addFavoritesMessage: string;
  favoriteAdded: string;
  favoriteRemoved: string;
  
  // Empty state
  welcomeTitle: string;
  welcomeMessage: string;
  searchForCity: string;
  
  // Accessibility
  searchSuggestions: string;
  weatherDetails: string;
  forecastList: string;
  currentWeather: string;
  temperatureValue: string;
  windValue: string;
  humidityValue: string;
  pressureValue: string;
  weatherConditionValue: string;
  forecastItem: string;
  highTemperature: string;
  lowTemperature: string;
  weatherConditionLabel: string;
  interactiveMap: string;
  mapPlaceholderLabel: string;
  temperatureMap: string;
  weatherConditionMap: string;
  offlineDataLabel: string;
  shareWeatherFor: string;
  linkCopiedToClipboard: string;
  shareWeatherForCity: string;
  viewDetailedWeatherPage: string;
  clearSearchAndReturn: string;
  hideMapView: string;
  showMapView: string;
  pressEnterToActivate: string;
  clickToRetry: string;
  lastUpdatedLabel: string;
  
  // Wind directions
  north: string;
  northeast: string;
  east: string;
  southeast: string;
  south: string;
  southwest: string;
  west: string;
  northwest: string;
}

const strings: Record<Locale, Strings> = {
  en: {
    // App branding
    appName: 'WeatherFlow',
    appDescription: 'A modern weather application built with Next.js 14, TypeScript, and Tailwind CSS',
    
    // Search functionality
    searchPlaceholder: 'Search for a city...',
    searchLabel: 'Search for a city',
    searchHelp: 'Press / to focus search, use arrow keys to navigate recent searches, Enter to select',
    recentSearches: 'Recent Searches',
    clearRecentSearches: 'Clear all recent searches',
    searching: 'Searching...',
    
    // Location services
    useMyLocation: 'Use my location',
    gettingLocation: 'Getting location...',
    locationDenied: 'Location access denied. Please enable location permissions to use this feature.',
    locationUnavailable: 'Location services are not available on this device.',
    locationTimeout: 'Location request timed out. Please try again.',
    
    // Units
    units: 'Units:',
    celsius: 'Celsius',
    fahrenheit: 'Fahrenheit',
    unitsDescription: 'Currently set to {units}. Click to switch to {otherUnits}.',
    
    // Weather data
    temperature: 'Temperature',
    feelsLike: 'Feels like',
    wind: 'Wind',
    humidity: 'Humidity',
    pressure: 'Pressure',
    weatherCondition: 'Weather condition',
    lastUpdated: 'Last updated',
    
    // Forecast
    forecastTitle: '5-Day Forecast',
    today: 'Today',
    high: 'High',
    low: 'Low',
    hourlyTemperature: '24-Hour Temperature',
    
    // States
    noWeatherData: 'No Weather Data',
    noForecastData: 'No Forecast Data',
    noForecastDescription: 'Search for a city to see the 5-day forecast',
    loadingWeather: 'Loading weather data...',
    loadingForecast: 'Loading forecast...',
    loadingMap: 'Loading map...',
    
    // Errors
    errorTitle: 'Something went wrong',
    errorMessage: "We couldn't load the weather data. Please try again.",
    retry: 'Retry',
    tryAgain: 'Try Again',
    networkError: 'Network error. Please check your connection.',
    apiError: 'API error. Please try again later.',
    
    // Actions
    share: 'Share',
    shareWeather: 'Share this city\'s weather',
    linkCopied: 'Copied!',
    viewPage: 'View Page',
    clearSearch: 'Clear search',
    backToSearch: 'Back to Search',
    
    // Map
    showMap: 'Show map',
    hideMap: 'Hide map',
    mapPlaceholder: 'Select a city to view the map',
    mapDescription: 'Interactive map showing weather location',
    
    // Offline
    offlineData: 'Offline data',
    lastUpdatedAt: 'last updated at',
    
    // Favorites
    addToFavorites: 'Add to favorites',
    removeFromFavorites: 'Remove from favorites',
    favorites: 'Favorites',
    noFavorites: 'No favorites yet',
    addFavoritesMessage: 'Add cities to your favorites for quick access',
    favoriteAdded: 'Added to favorites',
    favoriteRemoved: 'Removed from favorites',
    
    // Empty state
    welcomeTitle: 'Welcome to WeatherFlow',
    welcomeMessage: 'Search for a city to get started with weather information',
    searchForCity: 'Search for a city',
    
    // Accessibility
    searchSuggestions: 'Search suggestions',
    weatherDetails: 'Weather details',
    forecastList: '5-day weather forecast',
    currentWeather: 'Current weather',
    temperatureValue: 'Temperature {value}',
    windValue: 'Wind {value} {direction}',
    humidityValue: 'Humidity {value} percent',
    pressureValue: 'Pressure {value}',
    weatherConditionValue: 'Weather condition {value}',
    forecastItem: '{day} forecast: {condition}, high {high}, low {low}',
    highTemperature: 'High temperature {value}',
    lowTemperature: 'Low temperature {value}',
    weatherConditionLabel: 'Weather condition: {value}',
    interactiveMap: 'Interactive map showing {city} weather location',
    mapPlaceholderLabel: 'Map placeholder',
    temperatureMap: 'Temperature {value}',
    weatherConditionMap: 'Weather condition {value}',
    offlineDataLabel: 'Offline data - last updated at {time}',
    shareWeatherFor: 'Share weather for {city}',
    linkCopiedToClipboard: 'Link copied to clipboard',
    shareWeatherForCity: 'Share weather for {city}',
    viewDetailedWeatherPage: 'View detailed weather page for {city}',
    clearSearchAndReturn: 'Clear search and return to home',
    hideMapView: 'Hide map view',
    showMapView: 'Show map view',
    pressEnterToActivate: 'Press Enter to activate',
    clickToRetry: 'Click to retry',
    lastUpdatedLabel: 'Last updated {time}',
    
    // Wind directions
    north: 'North',
    northeast: 'Northeast',
    east: 'East',
    southeast: 'Southeast',
    south: 'South',
    southwest: 'Southwest',
    west: 'West',
    northwest: 'Northwest',
  },
  
  // Placeholder for other locales (can be expanded later)
  es: {} as Strings,
  fr: {} as Strings,
  de: {} as Strings,
  it: {} as Strings,
  pt: {} as Strings,
  ja: {} as Strings,
  ko: {} as Strings,
  zh: {} as Strings,
};

// Helper function to get strings for a locale
export function getStrings(locale: Locale = 'en'): Strings {
  return strings[locale] || strings.en;
}

// Helper function to format strings with placeholders
export function formatString(template: string, values: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (match, key) => {
    return values[key]?.toString() || match;
  });
}

// Export default strings for easy access
export default strings.en;
