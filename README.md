# WeatherFlow

A modern, feature-rich weather application built with Next.js 15, TypeScript, and Tailwind CSS. Get current weather conditions, detailed forecasts, and interactive maps for any city worldwide with a beautiful, accessible interface.

## ✨ Features

### 🌤️ **Weather Data**
- **Current Weather**: Real-time temperature, humidity, wind speed, pressure, and conditions
- **5-Day Forecast**: Extended weather predictions with daily highs, lows, and conditions
- **Hourly Temperature Prediction**: Always-visible 24-hour temperature chart with clear hour labels
- **Weather Icons**: Dynamic weather icons with day/night variations
- **Unit Conversion**: Instant Celsius ↔ Fahrenheit conversion (no API calls)

### 🔍 **Search & Discovery**
- **Smart Search**: Debounced city search with instant suggestions
- **Form Validation**: React Hook Form integration with inline error messages
- **Recent Searches**: Quick access to previously searched cities (stores full location data)
- **Favorites System**: Pin up to 8 favorite cities for instant access
- **Favorite City Cards**: View weather for all favorites at once on the main page
- **Favorite Quick Access**: Small chips bar for switching favorites when viewing weather
- **Keyboard Navigation**: Full arrow key navigation and Enter to select
- **Geolocation**: Use your current location with permission handling
- **Your Location Card**: Persistent location card on home page after successful geolocation

### 🗺️ **Interactive Features**
- **Collapsible Map**: Interactive map with city markers and weather popups
- **Map Navigation**: "View details" link in map popups to navigate to city detail pages
- **Deep Linking**: Shareable URLs with city coordinates and units
- **Share Button**: Copy shareable links with clipboard fallback and URL display
- **Offline Support**: Cached weather data when offline
- **PWA Ready**: Installable as a mobile app with service worker

### 🎨 **User Experience**
- **Light/Dark Mode**: Beautiful theme toggle with system preference detection
- **Glass-morphism Design**: Modern UI with backdrop blur effects and gradient accents
- **Micro-animations**: Subtle entrance animations for cards and forecast items (respects reduced motion)
- **Responsive Design**: Perfect on desktop, tablet, and mobile
- **Accessibility**: WCAG AA compliant with screen reader support
- **Animations**: Smooth transitions and hover effects (respects reduced motion)
- **Loading States**: Elegant loading animations and error handling
- **Clean Interface**: Simplified toggles and intuitive layout
- **Navigation**: Clickable logo to return home without focusing search

### ⚡ **Performance**
- **Instant Unit Toggle**: Client-side conversion (no API calls)
- **Smart Caching**: TanStack Query with optimized stale times
- **Code Splitting**: Dynamic imports for maps and charts
- **Bundle Optimization**: 127kB main bundle with lazy loading

## 🛠️ Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS with CSS variables for theming
- **Data Fetching**: TanStack Query (React Query)
- **Maps**: Leaflet + React-Leaflet
- **Charts**: Chart.js (dynamic import with SVG fallback)
- **Animations**: Framer Motion
- **Forms**: React Hook Form
- **Icons**: Heroicons
- **Testing**: Vitest + React Testing Library
- **PWA**: Service Worker + Manifest
- **State Management**: React Context (Theme, Locale)
- **Storage**: LocalStorage for favorites, recent searches, theme, units, and last geolocation

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- (Optional) OpenWeatherMap API key for premium features

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd weatherflow
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```
   
   The app works out of the box with Open-Meteo (no API key required). Optionally configure:

### 🌤 Environment Variables
| Variable | Required | Description | Default |
|-----------|-----------|-------------|---------|
| `NEXT_PUBLIC_WEATHER_PROVIDER` | No | `"open-meteo"` (free) or `"openweather"` (requires key) | `open-meteo` |
| `NEXT_PUBLIC_WEATHER_API_KEY` | Only if provider = openweather | Your OpenWeatherMap key | - |
| `NEXT_PUBLIC_TILE_URL` | No | Map tile URL template | OpenStreetMap |
| `NEXT_PUBLIC_TILE_ATTRIBUTION` | No | Map attribution HTML | OpenStreetMap |

**For Open-Meteo (default, no key needed):**
```
NEXT_PUBLIC_WEATHER_PROVIDER=open-meteo
```

**For OpenWeatherMap (requires API key):**
```
NEXT_PUBLIC_WEATHER_PROVIDER=openweather
NEXT_PUBLIC_WEATHER_API_KEY=your_api_key_here
```

4. **Get an API key (only if using OpenWeatherMap)**
   - Visit [OpenWeatherMap](https://openweathermap.org/api)
   - Sign up for a free account
   - Generate an API key
   - Add it to your `.env.local` file

5. **Run the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📜 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run test` - Run tests
- `npm run test:watch` - Run tests in watch mode
- `npm run test:coverage` - Run tests with coverage
- `npm run test:ui` - Run tests with UI
- `npm run test:components` - Run component tests
- `npm run test:all` - Run all tests
- `npm run ci` - Run lint, tests, and build
- `npm run analyze` - Analyze bundle size

## 🧪 Testing

This project uses Vitest for testing with React Testing Library for component testing.

```bash
# Run all tests
npm run test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run tests with UI
npm run test:ui

# Run component tests
npm run test:components

# Run all tests
npm run test:all
```

**Test Coverage:**
- ✅ Unit tests for utility functions (format, weather icons, unit conversion)
- ✅ Component tests for SearchBar, CurrentCard, ForecastList
- ✅ Integration tests for API calls and data flow
- ✅ Accessibility tests for screen reader support
- ✅ Performance tests for memoization and caching

## 🚀 Deployment

### Vercel (Recommended)

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Initial commit"
   git push origin main
   ```

2. **Deploy to Vercel**
   - Go to [Vercel](https://vercel.com)
   - Import your GitHub repository
   - The app will deploy automatically with Open-Meteo (no API key needed)
   - Preview deployments are created automatically for each PR

3. **Environment Variables in Vercel (Optional)**
   - Go to your project dashboard
   - Navigate to Settings → Environment Variables
   - Add variables only if you want to use OpenWeatherMap:
     ```
     NEXT_PUBLIC_WEATHER_PROVIDER=openweather
     NEXT_PUBLIC_WEATHER_API_KEY=your_api_key_here
     ```
   - Map variables (optional):
     ```
     NEXT_PUBLIC_TILE_URL=https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png
     NEXT_PUBLIC_TILE_ATTRIBUTION=© OpenStreetMap contributors
     ```

4. **Health Check**
   - Your deployed app includes a health check at `/api/ping`
   - Returns: `{ "ok": true, "version": "1.0.0", "timestamp": "...", "environment": "production" }`

### Other Platforms

The app can be deployed to any platform that supports Next.js:

- **Netlify**: Connect your GitHub repo and deploy
- **Railway**: Deploy with one click
- **DigitalOcean App Platform**: Deploy from GitHub
- **AWS Amplify**: Connect repository and deploy

## 🔌 API Usage

This app supports multiple weather providers:

### Open-Meteo (Default, Free)
- **Geocoding**: `https://geocoding-api.open-meteo.com/v1/search`
- **Weather**: `https://api.open-meteo.com/v1/forecast`
- **Hourly Data**: `https://api.open-meteo.com/v1/forecast` (with hourly parameter)
- No API key required
- Free for unlimited use
- High-quality weather data
- WMO weather codes

### OpenWeatherMap (Optional, Premium)
- **Current Weather**: `https://api.openweathermap.org/data/2.5/weather`
- **5-Day Forecast**: `https://api.openweathermap.org/data/3.0/onecall`
- Requires API key
- Free tier: 1,000 calls per day

## 🎯 Key Features Deep Dive

### Unit Conversion System
- **Instant Conversion**: No API calls when toggling units
- **Client-Side Math**: Accurate temperature and wind speed conversion
- **Consistent Data**: Always fetch in metric, convert to display units
- **Performance**: Zero network requests for unit changes

### Favorites System
- **Local Storage**: Persistent favorites across sessions
- **Limit Management**: Maximum 8 favorites with automatic cleanup
- **Cross-Tab Sync**: Favorites sync across browser tabs
- **Weather Cards Display**: Main page shows weather cards for all favorites
- **Quick Switch Bar**: Small chips for switching favorites when viewing weather (hidden on front page)
- **Empty State Logic**: Welcome message hidden when 3+ favorites exist
- **Keyboard Navigation**: Arrow keys + Enter to select favorites

### Search Experience
- **Debounced Search**: 300ms delay to prevent excessive API calls
- **Form Validation**: React Hook Form with inline error messages for empty submissions
- **Smart Suggestions**: Recent searches + API results
- **Click Outside to Close**: Suggestions close when clicking outside search bar
- **Full Location Data**: Recent searches store complete GeoPoint data (lat, lon, name, country)
- **Keyboard First**: Full arrow key navigation
- **Persistent UI**: Suggestions stay visible after Enter (2s delay)
- **Accessibility**: Proper ARIA attributes and error announcements

### Theme & UI
- **System Preference Detection**: Automatically detects and applies user's preferred theme
- **Persistent Theme**: Theme preference saved to localStorage
- **Smooth Transitions**: FOUC prevention with inline script for instant theme application
- **Simplified Controls**: Clean toggle buttons without unnecessary indicators
- **Responsive Cards**: Weather cards adapt to screen size
- **Loading Placeholders**: Full-size loading states matching actual content layout
- **Micro-entrance Animations**: Subtle fade-in and slide-up animations for CurrentCard and ForecastItem (180ms, respects prefers-reduced-motion)

### Offline Support
- **Service Worker**: Caches static assets and weather data
- **Offline Indicator**: Shows when using cached data
- **Graceful Degradation**: App works without network
- **Data Persistence**: Last successful forecast cached locally

### Accessibility Features
- **WCAG AA Compliance**: Proper contrast ratios and focus management
- **Screen Reader Support**: Comprehensive ARIA labels and descriptions
- **Keyboard Navigation**: Full keyboard accessibility
- **Reduced Motion**: Respects user motion preferences (prefers-reduced-motion media query)
- **Focus Management**: Proper focus handling on route changes
- **Form Validation**: Accessible error messages with ARIA attributes

## 📱 PWA Features

- **Installable**: Add to home screen on mobile devices
- **Offline Ready**: Works without internet connection
- **App-like Experience**: Full-screen mode and native feel
- **Service Worker**: Background caching and updates
- **Manifest**: Proper app metadata and icons

## 🔧 Development

### Project Structure
```
src/
├── app/                 # Next.js App Router pages
├── components/          # React components
├── lib/                 # Utility functions and types
│   ├── __tests__/      # Unit tests
│   └── ...
└── styles/             # Global CSS
```

### Key Components
- **SearchBar**: Smart search with React Hook Form validation, suggestions, recent searches, and keyboard navigation
- **CurrentCard**: Weather display with favorites button, hourly prediction chart, and micro-entrance animation
- **ForecastList**: 5-day forecast with weather icons and conditions
- **ForecastItem**: Individual forecast items with subtle stagger animations
- **MapPanel**: Interactive map with city markers, weather popups, and "View details" links
- **FavoriteCitiesCards**: Grid display of favorite cities with current weather on main page
- **FavoritesBar**: Compact chips bar for quick favorite switching (shown only when viewing weather)
- **YourLocationCard**: Persistent location card displayed after successful geolocation
- **ThemeToggle**: Light/dark mode toggle with system preference detection
- **UnitToggle**: Simple Celsius/Fahrenheit toggle button

### Performance Optimizations
- **React.memo**: Prevents unnecessary re-renders
- **useCallback/useMemo**: Memoized functions and values
- **Dynamic Imports**: Lazy loading for maps and charts
- **Query Optimization**: Smart caching and stale time management
- **Bundle Splitting**: Separate chunks for different features

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

### Development Guidelines
- Follow TypeScript best practices
- Write tests for new features
- Ensure accessibility compliance
- Maintain performance standards
- Update documentation

## 📄 License

This project is licensed under the ISC License.

## 🙏 Acknowledgments

- [Open-Meteo](https://open-meteo.com/) for free weather data
- [OpenWeatherMap](https://openweathermap.org/) for premium weather data
- [OpenStreetMap](https://www.openstreetmap.org/) for map tiles
- [Next.js](https://nextjs.org/) for the amazing framework
- [Tailwind CSS](https://tailwindcss.com/) for styling
- [TanStack Query](https://tanstack.com/query) for data fetching
- [Chart.js](https://www.chartjs.org/) for data visualization
- [Leaflet](https://leafletjs.com/) for interactive maps
- [Heroicons](https://heroicons.com/) for beautiful icons
- [Framer Motion](https://www.framer.com/motion/) for smooth animations
- [React Hook Form](https://react-hook-form.com/) for form management