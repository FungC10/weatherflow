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

2) Tech Stack
Layer
Tech
Purpose
App
React + TypeScript
UI & logic
Styling
Tailwind CSS
Utility styling (responsive & accessible)
HTTP / Cache
TanStack Query (recommended)
Request caching, retries, dedup
Maps
Leaflet + react-leaflet
Map tiles, markers, interactions
Icons
Heroicons / custom weather SVG
Clear iconography
Animations
Framer Motion (lightweight use)
Page and component transitions
Build/Deploy
Vite or Next.js (App Router)
Local dev + Vercel deploy (either is fine)
QA
Vitest + Testing Library
Unit & component tests
Lint/Format
ESLint + Prettier
Consistent codebase

⸻

3) Directory Structure
/src
  /app                      # (Next.js) or just /pages for Vite SPA routing
    page.tsx                # Home (search-first)
    /city/[slug]/page.tsx   # City detail page (optional deep link)
  /components
    SearchBar.tsx
    CurrentCard.tsx
    ForecastList.tsx
    ForecastItem.tsx
    MapPanel.tsx
    UnitToggle.tsx
    EmptyState.tsx
    ErrorState.tsx
    LoadingShimmer.tsx
  /lib
    api.ts                  # Fetchers (current, forecast, geocoding)
    queryKeys.ts            # TanStack Query keys
    format.ts               # Date/number/unit helpers
    weatherIcon.ts          # Code → icon mapping
    geo.ts                  # Geolocation helpers & permission gates
    storage.ts              # Local storage helpers (recent searches, units)
    types.ts                # Weather/geo TypeScript types
  /styles
    globals.css             # Tailwind base + design tokens
  /assets
    icons/                  # SVGs for weather conditions
  /tests
    components/*.test.tsx
    lib/*.test.ts
.env.example                # OWM key + map tile URL

⸻

4) Environment & Secrets
# .env example
VITE_OWM_API_KEY=xxxxxx                # OpenWeatherMap API Key
VITE_TILE_URL=https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png
VITE_TILE_ATTRIBUTION="© OpenStreetMap contributors"
	•	Never commit real keys.
	•	Provide an .env.example with placeholders.
	•	In Next.js, use NEXT_PUBLIC_... prefixes.

⸻

5) Data Model (simplified)
// src/lib/types.ts
export type Units = 'metric' | 'imperial';

export type GeoPoint = { lat: number; lon: number; name?: string; country?: string };

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

⸻

6) API Layer

Vendor: OpenWeatherMap (OWM)
Endpoints used (typical choices):
	•	Geocoding: /geo/1.0/direct?q={city}&limit=5&appid=...
	•	Current: /data/2.5/weather?lat={lat}&lon={lon}&units={u}&appid=...
	•	OneCall (forecast): /data/3.0/onecall?lat={lat}&lon={lon}&exclude=minutely,hourly,alerts&units={u}&appid=...

Fetcher design
// src/lib/api.ts
import { CurrentWeather, Forecast, GeoPoint, Units } from './types';

const BASE = 'https://api.openweathermap.org';
const KEY = import.meta.env.VITE_OWM_API_KEY;

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
Caching strategy (TanStack Query)
	•	Keys: ['city', q], ['current', lat, lon, units], ['forecast', lat, lon, units]
	•	staleTime: 5–10 minutes for current; 30 minutes for forecast
	•	retry: 1–2 times; no retry on 4xx
	•	Request dedupe: Query client handles parallel calls

Rate-limit hygiene
	•	Debounce search input (300–500ms)
	•	Cancel in-flight requests on new queries
	•	Cache city results for session

⸻

7) State & Data Flow

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

19) Summary

WeatherFlow is a compact, search-centric weather app that highlights:
	•	Clean API orchestration with cached queries
	•	Permission-aware geolocation
	•	Optional map exploration without bloating the bundle
	•	Tasteful motion & strong a11y