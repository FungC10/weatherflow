🌦 WeatherFlow — Architecture Overview

Minimal, elegant, city-first weather app with optional map browse mode.
Goal: show clean API integration, smooth UX on low bandwidth, and tasteful UI.

!!! add this file into .gitignore (keep a public ARCHITECTURE.public.md if needed)

Commit style
Use feat:, fix:, refactor:, chore:, docs:.
Always commit by feature (small, reviewable diffs).

⸻

1) Purpose

WeatherFlow demonstrates API integration, geolocation, and map interaction with a refined visual rhythm. It’s part of the Pazu Creates portfolio:
	•	InsightBoard – async data flow & charts
	•	TaskZen – offline-first state & UI logic
	•	WeatherFlow – API + map + motion + detail design

Focus: quick search → clear results → graceful states. Works without login or backend.

⸻

## 2) Tech Stack

| Layer | Tech | Purpose |
|-------|------|---------|
| **App** | Next.js 14 + TypeScript | App Router, SSR, type safety |
| **Styling** | Tailwind CSS + @tailwindcss/postcss | Utility styling (responsive & accessible) |
| **HTTP / Cache** | TanStack Query | Request caching, retries, dedup |
| **Maps** | Leaflet + react-leaflet | Map tiles, markers, interactions |
| **Icons** | Heroicons / custom weather SVG | Clear iconography |
| **Animations** | Framer Motion | Page and component transitions |
| **Forms** | React Hook Form | Form handling and validation |
| **Build/Deploy** | Next.js + Vercel | Local dev + production deploy |
| **QA** | Vitest + Testing Library | Unit & component tests |
| **Lint/Format** | ESLint + Prettier | Consistent codebase |

⸻

## 3) Directory Structure

```
/src
├── /app                    # Next.js App Router
│   ├── layout.tsx          # Root layout with QueryProvider
│   ├── page.tsx            # Home (search-first)
│   └── /city/[slug]/page.tsx  # City detail page (optional deep link)
├── /components             # React components
│   ├── SearchBar.tsx
│   ├── CurrentCard.tsx
│   ├── ForecastList.tsx
│   ├── ForecastItem.tsx
│   ├── MapPanel.tsx
│   ├── UnitToggle.tsx
│   ├── EmptyState.tsx
│   ├── ErrorState.tsx
│   └── LoadingShimmer.tsx
├── /lib                    # Utilities and configurations
│   ├── queryClient.tsx     # TanStack Query setup
│   ├── api.ts              # Fetchers (current, forecast, geocoding)
│   ├── queryKeys.ts        # TanStack Query keys
│   ├── format.ts           # Date/number/unit helpers
│   ├── weatherIcon.ts      # Code → icon mapping
│   ├── geo.ts              # Geolocation helpers & permission gates
│   ├── storage.ts          # Local storage helpers (recent searches, units)
│   └── types.ts            # Weather/geo TypeScript types
├── /styles
│   └── globals.css         # Tailwind base + design tokens
├── /assets
│   └── icons/              # SVGs for weather conditions
└── /tests
    ├── components/*.test.tsx
    └── lib/*.test.ts

# Configuration files
.env.example                # OWM key + map tile URL
tailwind.config.js          # Tailwind configuration
postcss.config.js           # PostCSS with @tailwindcss/postcss
next.config.js              # Next.js configuration
tsconfig.json               # TypeScript configuration
```

⸻

## 4) Environment & Secrets

```bash
# .env.example
NEXT_PUBLIC_OWM_API_KEY=__REPLACE_ME__                    # OpenWeatherMap API Key
NEXT_PUBLIC_TILE_URL=https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png
NEXT_PUBLIC_TILE_ATTRIBUTION=© OpenStreetMap contributors
```

**Security Notes:**
- ✅ Never commit real keys
- ✅ Provide an `.env.example` with placeholders
- ✅ In Next.js, use `NEXT_PUBLIC_...` prefixes for client-side env vars
- ✅ Add `.env*.local` to `.gitignore`

⸻

## 5) Data Model (simplified)

```typescript
// src/lib/types.ts
export type Units = 'metric' | 'imperial';

export type GeoPoint = { 
  lat: number; 
  lon: number; 
  name?: string; 
  country?: string; 
};

export type CurrentWeather = {
  coord: { lat: number; lon: number };
  dt: number;                        // unix timestamp
  timezone: number;                  // seconds offset
  name: string;
  weather: { id: number; main: string; description: string; icon: string }[];
  main: { temp: number; feels_like: number; humidity: number; pressure: number };
  wind: { speed: number; deg: number };
};

export type DailyForecast = {
  dt: number;
  temp: { min: number; max: number };
  weather: { id: number; main: string; description: string; icon: string }[];
};

export type Forecast = {
  timezone_offset: number;
  daily: DailyForecast[];
};
```

⸻

## 6) Setup & Configuration

### **Next.js 14 Configuration**
- ✅ App Router enabled by default (no experimental flags needed)
- ✅ TypeScript with strict mode enabled
- ✅ Path aliases configured (`@/*` → `./src/*`)

### **Tailwind CSS Setup**
- ✅ Uses `@tailwindcss/postcss` plugin (required for Next.js 15+)
- ✅ Dark theme with slate-900 background and cyan-300 accents
- ✅ PostCSS configuration with autoprefixer

### **TanStack Query Integration**
- ✅ QueryClient provider in root layout
- ✅ Default options: 5min staleTime, 2 retries, no window focus refetch
- ✅ Client-side only (wrapped in 'use client' directive)

### **Project Structure**
- ✅ Clean separation: `/app`, `/components`, `/lib`, `/styles`
- ✅ TypeScript types defined in `/lib/types.ts`
- ✅ Storage utilities in `/lib/storage.ts`
- ✅ Environment variables properly configured

⸻

## 7) API Layer

Vendor: OpenWeatherMap (OWM)
Endpoints used (typical choices):
	•	Geocoding: /geo/1.0/direct?q={city}&limit=5&appid=...
	•	Current: /data/2.5/weather?lat={lat}&lon={lon}&units={u}&appid=...
	•	OneCall (forecast): /data/3.0/onecall?lat={lat}&lon={lon}&exclude=minutely,hourly,alerts&units={u}&appid=...

### **Fetcher Design**
```typescript
// src/lib/api.ts
import { CurrentWeather, Forecast, GeoPoint, Units } from './types';

const BASE = 'https://api.openweathermap.org';
const KEY = process.env.NEXT_PUBLIC_OWM_API_KEY;

export async function searchCity(q: string): Promise<GeoPoint[]> {
  const url = `${BASE}/geo/1.0/direct?q=${encodeURIComponent(q)}&limit=5&appid=${KEY}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed city search');
  const rows = await res.json();
  return rows.map((r: any) => ({ name: r.name, country: r.country, lat: r.lat, lon: r.lon }));
}

export async function getCurrent(lat: number, lon: number, units: Units): Promise<CurrentWeather> {
  const url = `${BASE}/data/2.5/weather?lat=${lat}&lon=${lon}&units=${units}&appid=${KEY}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed current weather');
  return res.json();
}

export async function getForecast(lat: number, lon: number, units: Units): Promise<Forecast> {
  const url = `${BASE}/data/3.0/onecall?lat=${lat}&lon=${lon}&units=${units}&exclude=minutely,hourly,alerts&appid=${KEY}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed forecast');
  return res.json();
}
```

### **Caching Strategy (TanStack Query)**
- **Keys**: `['city', q]`, `['current', lat, lon, units]`, `['forecast', lat, lon, units]`
- **staleTime**: 5–10 minutes for current; 30 minutes for forecast
- **retry**: 1–2 times; no retry on 4xx
- **Request dedupe**: Query client handles parallel calls

### **Rate-limit Hygiene**
- **Debounce** search input (300–500ms)
- **Cancel** in-flight requests on new queries
- **Cache** city results for session

⸻

## 8) State & Data Flow

User
→ types in city or grants geolocation
→ searchCity() or navigator.geolocation.getCurrentPosition()
→ fetch current & forecast in parallel
→ render CurrentCard + ForecastList
→ optional MapPanel loads centered at {lat, lon} with a city marker
[SearchBar] ──debounce──> [Query: city]
           ┌────────────> [Query: current]
           └────────────> [Query: forecast]
[UnitToggle] ───────────> invalidates current/forecast queries
[MapPanel] <──────────── lat/lon sync (via props or url state)
[Storage]  <──────────── recent searches, last units
Local storage keys:
	•	weatherflow:recent → GeoPoint[] (max 6)
	•	weatherflow:units → 'metric' | 'imperial'

⸻

8) UI/UX Flow

Home (Search-first)
	•	Sticky SearchBar + UnitToggle
	•	If geolocation allowed → show “Your location” card
	•	CurrentCard (temp, feel-like, wind, humidity, description)
	•	ForecastList (5–7 days) with subtle enter transitions
	•	Secondary: MapPanel collapsed by default (toggle open)

Map Mode
	•	react-leaflet map
	•	Marker at selected city; click shows popover with temp & link “View details”
	•	Tile attribution footer (OSM)

States
	•	Loading: skeleton LoadingShimmer
	•	Empty: EmptyState (tip to search or enable location)
	•	Error: ErrorState (network/server copy + retry button)
	•	No permission: suggest manual search

Keyboard & A11y
	•	/ focuses search
	•	Enter selects first suggestion
	•	Tab cycles suggestions
	•	Buttons have aria-label
	•	Color contrast ≥ AA; motion reduced when prefers-reduced-motion

Design tokens (Tailwind)
	•	Background: bg-slate-900
	•	Card: bg-white/10 backdrop-blur-sm
	•	Accent: text-cyan-300 / ring-cyan-400
	•	Motion: transition-all duration-300 (no custom colors set in code)

⸻

9) Components (responsibilities)
	•	SearchBar: debounced input, suggestions, submit handler
	•	UnitToggle: metric/imperial, persists to storage, invalidates queries
	•	CurrentCard: main panel; maps weatherIcon(code) → SVG
	•	ForecastList / ForecastItem: daily max/min, description, icon
	•	MapPanel: leaflet map, marker, attribution, optional tile switch
	•	EmptyState / ErrorState / LoadingShimmer: state components

⸻

10) Permission & Geolocation
	•	Request location only after explicit user action (“Use my location”)
	•	Handle three outcomes: granted, denied, prompt
	•	If denied: show copy with manual search + one-click retry

    // src/lib/geo.ts
export const askLocation = (): Promise<GeolocationPosition> =>
  new Promise((resolve, reject) => {
    if (!navigator.geolocation) return reject(new Error('Geolocation unavailable'));
    navigator.geolocation.getCurrentPosition(resolve, reject, { enableHighAccuracy: true, timeout: 8000 });
  });


⸻

11) Formatting & Icon Logic
	•	Helper format.ts: temperature, wind, local time (timezone offset), day names
	•	weatherIcon.ts: map OWM codes → internal icon IDs (day/night variants if desired)
	•	Avoid heavy icon packs; tree-shake custom SVGs per condition.

⸻

12) Performance
	•	Debounce search; memoize suggestions
	•	Avoid re-render storms: split components, use React.memo where meaningful
	•	Lazy load MapPanel (dynamic import)
	•	Image/Icon sprites or inline SVG for zero network overhead
	•	Cache first city’s forecast longer; invalidate when units change

⸻

13) Accessibility & Internationalization
	•	All interactive elements: aria-* labels
	•	Units readable by screen readers (“20 degrees Celsius”)
	•	i18n ready: copy centralized (e.g., lib/strings.ts)
	•	Number/date formatting via Intl respecting locale

⸻

14) Testing
	•	Unit: format.ts, weatherIcon.ts, query key composition
	•	Component: Search → suggestions → select flow
	•	Integration: Mock fetch for current/forecast; test loading/error/empty paths

⸻

15) Security & Compliance
	•	API key stays in client env (public) → restrict capabilities in vendor dashboard where possible
	•	Respect vendor ToS & tile attribution (OSM/tiles)
	•	No PII stored; only recent city names & units in localStorage

⸻

16) Routes & Deep Links (optional)
	•	/city/hong-kong?lat=22.28&lon=114.16&u=metric
	•	Hydrates from query params → runs current/forecast queries
	•	Enables shareable links & SEO (if Next.js)

⸻

17) Deployment
	•	Vercel: set env vars; enable edge cache for static assets
	•	Preview deployments per PR
	•	Health checks: simple /api/ping if Next.js; else rely on Vercel status

⸻

18) Future Enhancements
	•	Hourly graph (sparkline) with Chart.js (lazy-loaded)
	•	Favorite cities (pinned cards)
	•	Theme toggle (system / light / dark)
	•	Offline snapshot of last successful forecast
	•	Map: draw “feels like” heat overlay (simple colored circles)
	•	PWA: add install prompt & offline shell
	•	Alternative providers (WeatherKit, Meteo, etc.) via adapter interface

⸻

## 19) Troubleshooting

### **Common Setup Issues**

#### **Tailwind CSS PostCSS Error**
```
Error: It looks like you're trying to use `tailwindcss` directly as a PostCSS plugin
```
**Solution**: Install `@tailwindcss/postcss` and update `postcss.config.js`:
```bash
npm install @tailwindcss/postcss
```
```js
// postcss.config.js
module.exports = {
  plugins: {
    '@tailwindcss/postcss': {},
    autoprefixer: {},
  },
}
```

#### **Next.js 15 Configuration Warning**
```
Invalid next.config.js options detected: Unrecognized key(s) in object: 'appDir'
```
**Solution**: Remove deprecated `experimental.appDir` - App Router is enabled by default in Next.js 13+.

#### **Environment Variables Not Working**
**Solution**: Ensure variables use `NEXT_PUBLIC_` prefix for client-side access:
```bash
NEXT_PUBLIC_OWM_API_KEY=your_key_here
```

### **Development Server Issues**
- **Port conflicts**: Kill existing processes with `lsof -ti:3000 | xargs kill -9`
- **Cache issues**: Clear `.next` folder and restart dev server
- **TypeScript errors**: Check `tsconfig.json` path aliases are correct

⸻

## 20) Summary

WeatherFlow is a compact, search-centric weather app that highlights:
	•	Clean API orchestration with cached queries
	•	Permission-aware geolocation
	•	Optional map exploration without bloating the bundle
	•	Tasteful motion & strong a11y