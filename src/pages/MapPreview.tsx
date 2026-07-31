import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import { SpiritualCard } from "@/components/SpiritualCard";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Map from "@/components/Map";
import Seo from "@/components/Seo";
import { fetchAllLandmarks } from "@/services/landmarkService";
import type { Landmark } from "@/data/landmarks";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import {
  MapPin,
  Navigation as NavigationIcon,
  Compass,
  Play,
  Users,
  Footprints,
  LogIn,
  Sparkles,
  Target,
  Heart
} from "lucide-react";
import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";

const MapPreview = () => {
  const [allLandmarks, setAllLandmarks] = useState<Landmark[]>([]);
  const [landmarksLoading, setLandmarksLoading] = useState(true);
  const [selectedLandmarkTypes, setSelectedLandmarkTypes] = useState<Landmark['type'][]>(['temple']);
  
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  // If user is logged in, redirect to full tracker
  useEffect(() => {
    if (user) {
      navigate('/girivalam-map');
    }
  }, [user, navigate]);

  // Load landmarks
  useEffect(() => {
    const loadLandmarks = async () => {
      try {
        const data = await fetchAllLandmarks();
        setAllLandmarks(data);
      } catch {
        toast({
          title: "Failed to load landmarks",
          variant: "destructive",
        });
      } finally {
        setLandmarksLoading(false);
      }
    };
    loadLandmarks();
  }, []);

  const templeCount = allLandmarks.filter(l => l.type === 'temple').length;
  const landmarkCount = allLandmarks.length;

  const features = [
    { icon: <Footprints className="h-5 w-5" />, title: "Step Counter", desc: "Track your walking steps" },
    { icon: <Target className="h-5 w-5" />, title: "14km Path", desc: "Auto-detect Girivalam route" },
    { icon: <MapPin className="h-5 w-5" />, title: `${landmarkCount}+ Landmarks`, desc: "Temples, food & more" },
    { icon: <Users className="h-5 w-5" />, title: "Group Tracking", desc: "Walk together with family" },
  ];

  return (
    <div className="min-h-screen bg-background pt-20 md:pt-24">
      <Seo
        title="Girivalam Map Preview — Ashta Lingam & 14km Path | MyGirivalam.in"
        description="Preview the interactive Tiruvannamalai Girivalam map: the 14km Arunachala circumambulation route, all 8 Ashta Lingam temples, water points, food, rest stops and more. Sign in for live GPS tracking."
        canonical="/girivalam-map"
      />
      <SiteHeader />

      <div className="px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Hero Section */}
          <div className="text-center mb-8">
            <Badge variant="secondary" className="mb-4 px-4 py-1">
              <Sparkles className="h-3 w-3 mr-1" />
              Preview Mode
            </Badge>
            <h1 className="font-playfair text-4xl font-bold mb-4">Sacred Girivalam Map</h1>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Explore the 14km sacred path around Arunachala Hill. Sign in to unlock GPS tracking, step counter, and group features.
            </p>
          </div>

          {/* Feature Highlights */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {features.map((feature, index) => (
              <SpiritualCard key={index} className="text-center p-4">
                <div className="p-2 bg-primary/10 rounded-xl mx-auto w-fit mb-2">
                  {feature.icon}
                </div>
                <h3 className="font-medium text-sm">{feature.title}</h3>
                <p className="text-xs text-muted-foreground">{feature.desc}</p>
              </SpiritualCard>
            ))}
          </div>

          {/* Map Preview Card */}
          <SpiritualCard className="relative overflow-hidden">
            {/* Map Container */}
            <div className="relative h-[400px] md:h-[500px] rounded-lg overflow-hidden">
              <Map 
                allLandmarks={allLandmarks}
                selectedTypes={selectedLandmarkTypes}
                className="w-full h-full"
              />
              
              {/* Overlay CTA */}
              <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-transparent to-transparent pointer-events-none" />
              
              <div className="absolute bottom-0 left-0 right-0 p-6 pointer-events-auto">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-card/95 backdrop-blur-sm rounded-xl p-4 border shadow-lg">
                  <div className="text-center sm:text-left">
                    <h3 className="font-playfair text-lg font-semibold flex items-center gap-2">
                      <Compass className="h-5 w-5 text-primary" />
                      Ready to Start Your Journey?
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Sign in to track your progress with GPS
                    </p>
                  </div>
                  
                  <div className="flex gap-3">
                    <Button asChild variant="outline">
                      <Link to="/girivalam-guide">
                        <Heart className="mr-2 h-4 w-4" />
                        Learn More
                      </Link>
                    </Button>
                    <Button asChild className="sacred-button">
                      <Link to="/auth">
                        <LogIn className="mr-2 h-4 w-4" />
                        Sign In to Track
                      </Link>
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {/* Legend */}
            <div className="p-4 border-t">
              <div className="flex flex-wrap items-center justify-center gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-1 bg-[#FF6B35] rounded"></div>
                  <span className="text-muted-foreground">Girivalam Path (14km)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-[#FF6B35] rounded-full border-2 border-white shadow"></div>
                  <span className="text-muted-foreground">Ashta Lingam Temples ({templeCount})</span>
                </div>
              </div>
            </div>
          </SpiritualCard>

          {/* Temple List Preview */}
          <div className="mt-8">
            <h2 className="font-playfair text-2xl font-bold text-center mb-6">Ashta Lingam Temples</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {allLandmarks
                .filter(l => l.type === 'temple')
                .slice(0, 8)
                .map((temple) => (
                  <SpiritualCard key={temple.id} className="p-4 text-center">
                    <div className="p-2 bg-primary/10 rounded-full w-10 h-10 mx-auto mb-2 flex items-center justify-center">
                      <MapPin className="h-5 w-5 text-primary" />
                    </div>
                    <h3 className="font-medium text-sm line-clamp-2">{temple.name}</h3>
                    {temple.direction && (
                      <p className="text-xs text-muted-foreground mt-1">{temple.direction}</p>
                    )}
                  </SpiritualCard>
                ))}
            </div>
          </div>

          {/* Bottom CTA */}
          <div className="mt-12 text-center">
            <SpiritualCard className="inline-block p-8 max-w-lg mx-auto bg-gradient-to-br from-primary/5 to-accent/5">
              <div className="flex items-center justify-center gap-2 mb-4">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm text-muted-foreground">1000+ devotees have used this app</span>
              </div>
              <h3 className="font-playfair text-xl font-bold mb-2">Track Your Sacred Journey</h3>
              <p className="text-muted-foreground mb-6">
                Join thousands of devotees who have completed Girivalam with our GPS tracker
              </p>
              <Button asChild size="lg" className="sacred-button">
                <Link to="/auth">
                  <Play className="mr-2 h-5 w-5" />
                  Start Tracking Now
                </Link>
              </Button>
            </SpiritualCard>
          </div>
        </div>
      </div>
      
      {/* Site Footer with Map Attribution */}
      <SiteFooter />
    </div>
  );
};

export default MapPreview;
