import { Suspense, lazy } from "react";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Routes, Route } from "react-router-dom";
import LazyOverlays from "./LazyOverlays";
import logoUrl from "@/assets/newlogo-optimized.svg?format=webp&w=128&q=80";
import ProtectedRoute from "@/components/ProtectedRoute";
import ErrorBoundary from "@/components/ErrorBoundary";
// ChatEmergencyWidget removed from user interface - admin support only

// Route-level code splitting to keep initial bundle small
const Index = lazy(() => import("./pages/Index"));
const Auth = lazy(() => import("./pages/Auth"));
const MapTracker = lazy(() => import("./pages/MapTracker"));
const MapPreview = lazy(() => import("./pages/MapPreview"));
const SpiritualGuide = lazy(() => import("./pages/SpiritualGuide"));
const GuidePreview = lazy(() => import("./pages/GuidePreview"));
const Services = lazy(() => import("./pages/Services"));
const ServicesPreview = lazy(() => import("./pages/ServicesPreview"));
const Admin = lazy(() => import("./pages/admin-panel/Admin"));
const NotFound = lazy(() => import("./pages/NotFound"));
const Profile = lazy(() => import("./pages/Profile"));
const GirivalamJourneyGuide = lazy(() => import("./pages/GirivalamJourneyGuide"));
const PournamiDates = lazy(() => import("./pages/PournamiDates"));
const MyGirivalam = lazy(() => import("./pages/MyGirivalam"));
const MyGirivalamHistory = lazy(() => import("./pages/MyGirivalamHistory"));
const Feedback = lazy(() => import("./pages/Feedback"));
const Settings = lazy(() => import("./pages/Settings"));
const SavedLocations = lazy(() => import("./pages/SavedLocations"));
const EmergencyContacts = lazy(() => import("./pages/EmergencyContacts"));
const SupportGirivalam = lazy(() => import("./pages/SupportGirivalam"));
const TempleHome = lazy(() => import("./pages/TempleHome"));
const JoinGroup = lazy(() => import("./pages/JoinGroup"));
const Personal = lazy(() => import("./pages/Personal"));
const SpiritualResources = lazy(() => import("./pages/SpiritualResources"));
const Terms = lazy(() => import("./pages/Terms"));
const Privacy = lazy(() => import("./pages/Privacy"));
const HeroSkeleton = lazy(() => import("./pages/HeroSkeleton"));
const NextPournami = lazy(() => import("./pages/NextPournami"));
const AIGuide = lazy(() => import("./pages/AIGuide"));
const LiveAnnadhanam = lazy(() => import("./pages/LiveAnnadhanam"));
const TrustProfile = lazy(() => import("./pages/TrustProfile"));
const Guides = lazy(() => import("./pages/Guides"));
const GirivalamDistanceRoute = lazy(() => import("./pages/GirivalamDistanceRoute"));
const AshtaLingamTemples = lazy(() => import("./pages/AshtaLingamTemples"));
const TiruvannamalaiTouristSpots = lazy(() => import("./pages/TiruvannamalaiTouristSpots"));
const DeleteAccount = lazy(() => import("./pages/DeleteAccount"));
const ChildSafety = lazy(() => import("./pages/ChildSafety"));

// Preload critical routes
if (typeof window !== 'undefined') {
  // Preload Index component after initial load
  setTimeout(() => {
    import("./pages/Index");
  }, 100);
}

const App = () => (
  <TooltipProvider>
    <LazyOverlays />
    <ErrorBoundary>
    <Suspense
      fallback={
        <div style={{ display: "grid", placeItems: "center", minHeight: "100vh" }}>
          <img src={logoUrl} alt="Loading..." className="h-14 w-14 animate-pulse" />
        </div>
      }
    >
      {/* Chat widget hidden for users - support available via admin panel */}

      <Routes>
        {/* Public routes */}
        <Route path="/" element={<Index />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/delete-account" element={<DeleteAccount />} />
        <Route path="/child-safety" element={<ChildSafety />} />
        <Route path="/emergency-contacts" element={<EmergencyContacts />} />
        <Route path="/feedback" element={<Feedback />} />
        <Route path="/girivalam-map-preview" element={<MapPreview />} />
        <Route path="/girivalam-guide-preview" element={<GuidePreview />} />
        <Route path="/girivalam-services-preview" element={<ServicesPreview />} />
        <Route path="/hero-skeleton" element={<HeroSkeleton />} />

        {/* Protected routes - require authentication */}
        <Route
          path="/my-girivalam"
          element={
            <ProtectedRoute>
              <MyGirivalam />
            </ProtectedRoute>
          }
        />
        <Route
          path="/my-girivalam-history"
          element={
            <ProtectedRoute>
              <MyGirivalamHistory />
            </ProtectedRoute>
          }
        />
        <Route path="/temple-home" element={<TempleHome />} />
        <Route path="/girivalam-map" element={<MapTracker />} />
        <Route path="/girivalam-guide" element={<SpiritualGuide />} />
        <Route
          path="/girivalam-journey-guide"
          element={
            <ProtectedRoute>
              <GirivalamJourneyGuide />
            </ProtectedRoute>
          }
        />
        <Route path="/girivalam-services" element={<Services />} />
        <Route path="/pournami-dates" element={<PournamiDates />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Admin />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/settings"
          element={
            <ProtectedRoute>
              <Settings />
            </ProtectedRoute>
          }
        />
        <Route
          path="/saved-locations"
          element={
            <ProtectedRoute>
              <SavedLocations />
            </ProtectedRoute>
          }
        />
        <Route
          path="/support-girivalam"
          element={
            <ProtectedRoute>
              <SupportGirivalam />
            </ProtectedRoute>
          }
        />
        <Route path="/blog/pournami-dates-2025-2026" element={<PournamiDates />} />
        {/* Public: invite recipients (often logged-out) must see the group invite first */}
        <Route path="/join" element={<JoinGroup />} />
        <Route
          path="/personal"
          element={
            <ProtectedRoute>
              <Personal />
            </ProtectedRoute>
          }
        />
        <Route path="/spiritual-resources" element={<SpiritualResources />} />
        <Route path="/next-pournami" element={<NextPournami />} />
        <Route path="/guides" element={<Guides />} />
        <Route path="/girivalam-distance-route" element={<GirivalamDistanceRoute />} />
        <Route path="/ashta-lingam-temples" element={<AshtaLingamTemples />} />
        <Route path="/tiruvannamalai-tourist-spots" element={<TiruvannamalaiTouristSpots />} />
        <Route path="/ai-guide" element={<AIGuide />} />
        <Route path="/annadhanam" element={<LiveAnnadhanam />} />
        <Route path="/annadhanam/trust/:id" element={<TrustProfile />} />

        {/* Catch-all */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
    </ErrorBoundary>
  </TooltipProvider>
);

export default App;
