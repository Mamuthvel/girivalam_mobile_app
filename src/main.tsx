import { createRoot, hydrateRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { HelmetProvider } from 'react-helmet-async'
import { ThemeProvider } from 'next-themes'
import { AuthProvider } from './contexts/AuthContext.tsx'
import { LanguageProvider } from './contexts/LanguageContext.tsx'
import { AudioPlayerProvider } from './contexts/AudioPlayerContext.tsx'
import ErrorBoundary from './components/ErrorBoundary.tsx'
import App from './App.tsx'
import './index.css'
import { logger } from "@/lib/logger";
import { Capacitor } from "@capacitor/core";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
      refetchOnWindowFocus: false, // Reduce unnecessary refetches
    },
  },
});

// Ensure the root element exists
const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error('Root element not found');
}

const app = (
  <ErrorBoundary>
    <HelmetProvider>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
          <LanguageProvider>
            <BrowserRouter>
              <AuthProvider>
                <AudioPlayerProvider>
                  <App />
                </AudioPlayerProvider>
              </AuthProvider>
            </BrowserRouter>
          </LanguageProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </HelmetProvider>
  </ErrorBoundary>
);

// If react-snap pre-rendered this page, hydrate over existing HTML; otherwise do a fresh render
if (rootElement.hasChildNodes()) {
  hydrateRoot(rootElement, app);
} else {
  createRoot(rootElement).render(app);
}

// Register service worker for caching (web only — skip inside the native app
// shell, where a service worker can serve stale bundled assets)
if ('serviceWorker' in navigator && import.meta.env.PROD && !Capacitor.isNativePlatform()) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then((registration) => {
        logger.log('SW registered: ', registration);
      })
      .catch((registrationError) => {
        logger.log('SW registration failed: ', registrationError);
      });
  });
}
