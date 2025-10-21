'use client';

import { useEffect } from 'react';
import { registerServiceWorker } from '@/lib/sw-register';

export default function ServiceWorkerProvider() {
  useEffect(() => {
    registerServiceWorker();
  }, []);

  return null; // This component doesn't render anything
}
