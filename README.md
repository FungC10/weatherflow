# WeatherFlow

A modern weather application built with Next.js 14, TypeScript, and Tailwind CSS. Get current weather conditions and 5-day forecasts for any city worldwide.

## Features

- 🌤️ **Current Weather**: Real-time weather data with temperature, humidity, wind, and pressure
- 📅 **5-Day Forecast**: Extended weather predictions with daily highs and lows
- 🗺️ **Interactive Map**: Visualize weather data on an interactive map
- 📍 **Geolocation**: Use your current location for instant weather updates
- 🔍 **Search**: Find weather for any city worldwide
- 📱 **Responsive**: Works perfectly on desktop and mobile devices
- ♿ **Accessible**: Full keyboard navigation and screen reader support
- 🎨 **Dark Theme**: Beautiful dark UI with cyan accents

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Data Fetching**: TanStack Query (React Query)
- **Maps**: Leaflet + React-Leaflet
- **Animations**: Framer Motion
- **Icons**: Heroicons
- **Testing**: Vitest + React Testing Library

## Getting Started

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

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run test` - Run tests
- `npm run test:watch` - Run tests in watch mode
- `npm run test:coverage` - Run tests with coverage
- `npm run test:ui` - Run tests with UI
- `npm run ci` - Run lint, tests, and build

## Testing

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
```

## Deployment

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

## API Usage

This app supports multiple weather providers:

### Open-Meteo (Default, Free)
- **Geocoding**: `https://geocoding-api.open-meteo.com/v1/search`
- **Weather**: `https://api.open-meteo.com/v1/forecast`
- No API key required
- Free for unlimited use
- High-quality weather data

### OpenWeatherMap (Optional, Premium)
- **Current Weather**: `https://api.openweathermap.org/data/2.5/weather`
- **5-Day Forecast**: `https://api.openweathermap.org/data/3.0/onecall`
- Requires API key
- Free tier: 1,000 calls per day

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## License

This project is licensed under the ISC License.

## Acknowledgments

- [OpenWeatherMap](https://openweathermap.org/) for weather data
- [OpenStreetMap](https://www.openstreetmap.org/) for map tiles
- [Next.js](https://nextjs.org/) for the amazing framework
- [Tailwind CSS](https://tailwindcss.com/) for styling
- [TanStack Query](https://tanstack.com/query) for data fetching