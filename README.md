# WeatherFlow

Minimal, elegant, city-first weather app with optional map browse mode.

## Tech Stack

- **Next.js 14** with App Router
- **TypeScript** for type safety
- **Tailwind CSS** for styling
- **TanStack Query** for data fetching and caching
- **Framer Motion** for animations
- **React Hook Form** for form handling

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```

2. Copy environment variables:
   ```bash
   cp .env.example .env.local
   ```

3. Add your OpenWeatherMap API key to `.env.local`:
   ```
   NEXT_PUBLIC_OWM_API_KEY=your_api_key_here
   ```

4. Run the development server:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
src/
├── app/                 # Next.js App Router pages
├── components/          # React components
├── lib/                 # Utilities and configurations
│   ├── queryClient.tsx  # TanStack Query setup
│   ├── storage.ts       # Local storage helpers
│   └── types.ts         # TypeScript type definitions
└── styles/              # Global styles
    └── globals.css      # Tailwind CSS imports
```

## Features

- Dark theme with slate background and cyan accents
- Responsive design
- TypeScript for type safety
- TanStack Query for efficient data fetching
- Local storage utilities
- Clean, minimal UI

## Environment Variables

- `NEXT_PUBLIC_OWM_API_KEY`: OpenWeatherMap API key
- `NEXT_PUBLIC_TILE_URL`: Map tile URL template
- `NEXT_PUBLIC_TILE_ATTRIBUTION`: Map tile attribution text
