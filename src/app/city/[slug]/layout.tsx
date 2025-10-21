import { Metadata } from 'next';

interface CityLayoutProps {
  children: React.ReactNode;
  params: Promise<{
    slug: string;
  }>;
}

export async function generateMetadata({ params }: CityLayoutProps): Promise<Metadata> {
  const { slug } = await params;
  const cityName = slug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  
  return {
    title: `Weather in ${cityName} | WeatherFlow`,
    description: `Current weather conditions and 5-day forecast for ${cityName}. Get real-time weather data, temperature, humidity, and more.`,
    keywords: [`weather ${cityName}`, `forecast ${cityName}`, 'weather app', 'weather forecast'],
    openGraph: {
      title: `Weather in ${cityName}`,
      description: `Current weather conditions and forecast for ${cityName}`,
      type: 'website',
    },
    twitter: {
      card: 'summary',
      title: `Weather in ${cityName}`,
      description: `Current weather conditions and forecast for ${cityName}`,
    },
  };
}

export default function CityLayout({ children }: CityLayoutProps) {
  return children;
}
