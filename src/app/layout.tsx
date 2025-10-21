import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { QueryProvider } from '@/lib/queryClient';
import ServiceWorkerProvider from '@/components/ServiceWorkerProvider';
import '@/styles/globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'WeatherFlow',
  description: 'Minimal, elegant, city-first weather app',
  manifest: '/manifest.webmanifest',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'WeatherFlow',
  },
  icons: {
    icon: '/icons/icon-192x192.png',
    apple: '/icons/icon-192x192.png',
  },
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#22d3ee',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <QueryProvider>
          <ServiceWorkerProvider />
          <div className="min-h-screen bg-slate-900 text-slate-100">
            <div className="container mx-auto px-4 py-8">
              {children}
            </div>
          </div>
        </QueryProvider>
      </body>
    </html>
  );
}
