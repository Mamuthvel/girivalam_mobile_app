import { lazy, Suspense, useEffect, useState } from "react";

const Toaster = lazy(() => import("@/components/ui/toaster").then(m => ({ default: m.Toaster })));
const Sonner = lazy(() => import("@/components/ui/sonner").then(m => ({ default: m.Toaster })));

const LazyOverlays = () => {
  const [shouldLoad, setShouldLoad] = useState(false);

  useEffect(() => {
    // Use a more reliable approach for loading overlays
    const load = () => setShouldLoad(true);

    // Check if we're in a browser environment
    if (typeof window === 'undefined') return;

    // Use setTimeout with a shorter delay to ensure DOM is ready
    const timer = setTimeout(load, 100);

    return () => clearTimeout(timer);
  }, []);

  if (!shouldLoad) return null;

  return (
    <Suspense fallback={null}>
      <Toaster />
      <Sonner />
    </Suspense>
  );
};

export default LazyOverlays;
