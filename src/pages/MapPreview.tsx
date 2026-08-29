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
import { useLanguage } from "@/contexts/LanguageContext";
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
  const { t } = useLanguage();
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
    { icon: <Footprints className="h-5 w-5" />, title: t('mp.featStep'), desc: t('mp.featStepDesc') },
    { icon: <Target className="h-5 w-5" />, title: t('mp.feat14k'), desc: t('mp.feat14kDesc') },
    { icon: <MapPin className="h-5 w-5" />, title: t('mp.featLandmarks').replace('{count}', String(landmarkCount)), desc: t('mp.featLandmarksDesc') },
    { icon: <Users className="h-5 w-5" />, title: t('mp.featGroup'), desc: t('mp.featGroupDesc') },
  ];

  return (
    <div className="min-h-screen bg-background pt-20 md:pt-24">
      <Seo
        title="Girivalam Map — Live GPS Route & 8 Ashta Lingam Temples | Tiruvannamalai"
        description="Interactive Girivalam map for Tiruvannamalai: the 14 km Arunachala route with live GPS location, all 8 Ashta Lingam temples, water points, food and rest stops along the sacred path."
        canonical="/girivalam-map"
      />
      <SiteHeader />

      <div className="px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Hero Section */}
          <div className="text-center mb-8">
            <Badge variant="secondary" className="mb-4 px-4 py-1">
              <Sparkles className="h-3 w-3 mr-1" />
              {t('mp.previewMode')}
            </Badge>
            <h1 className="font-playfair text-4xl font-bold mb-4">{t('mp.h1')}</h1>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              {t('mp.intro')}
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
                      {t('mp.readyTitle')}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {t('mp.readyDesc')}
                    </p>
                  </div>
                  
                  <div className="flex gap-3">
                    <Button asChild variant="outline">
                      <Link to="/girivalam-guide">
                        <Heart className="mr-2 h-4 w-4" />
                        {t('mp.learnMore')}
                      </Link>
                    </Button>
                    <Button asChild className="sacred-button">
                      <Link to="/auth">
                        <LogIn className="mr-2 h-4 w-4" />
                        {t('mp.signInTrack')}
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
                  <span className="text-muted-foreground">{t('mp.legendPath')}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-[#FF6B35] rounded-full border-2 border-white shadow"></div>
                  <span className="text-muted-foreground">{t('mp.legendTemples').replace('{count}', String(templeCount))}</span>
                </div>
              </div>
            </div>
          </SpiritualCard>

          {/* Temple List Preview */}
          <div className="mt-8">
            <h2 className="font-playfair text-2xl font-bold text-center mb-6">{t('mp.templesTitle')}</h2>
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
                      <p className="text-xs text-muted-foreground mt-1">{t(`dist.dir.${temple.direction}`)}</p>
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
                <span className="text-sm text-muted-foreground">{t('mp.devoteesUsed')}</span>
              </div>
              <h3 className="font-playfair text-xl font-bold mb-2">{t('mp.trackTitle')}</h3>
              <p className="text-muted-foreground mb-6">
                {t('mp.trackDesc')}
              </p>
              <Button asChild size="lg" className="sacred-button">
                <Link to="/auth">
                  <Play className="mr-2 h-5 w-5" />
                  {t('mp.startTracking')}
                </Link>
              </Button>
            </SpiritualCard>
          </div>

          {/* SEO content */}
          <section className="mt-14 max-w-3xl mx-auto text-left">
            <h2 className="font-playfair text-2xl font-bold mb-3">
              {t('mp.aboutTitle')}
            </h2>
            <p className="text-muted-foreground text-sm md:text-base leading-relaxed mb-4">
              {t('mp.aboutP1')}
            </p>
            <p className="text-muted-foreground text-sm md:text-base leading-relaxed mb-6">
              {t('mp.aboutP2')}
            </p>
            <h3 className="font-semibold text-lg mb-2">{t('mp.howTitle')}</h3>
            <ul className="text-muted-foreground text-sm md:text-base leading-relaxed space-y-1 list-disc pl-5 mb-6">
              <li>{t('mp.how1')}</li>
              <li>{t('mp.how2')}</li>
              <li>{t('mp.how3')}</li>
              <li>{t('mp.how4')}</li>
            </ul>
            <div className="flex flex-wrap gap-3">
              <Link to="/girivalam-distance-route" className="text-sm text-primary hover:underline">
                {t('mp.linkDistance')}
              </Link>
              <Link to="/ashta-lingam-temples" className="text-sm text-primary hover:underline">
                {t('mp.linkTemples')}
              </Link>
              <Link to="/next-pournami" className="text-sm text-primary hover:underline">
                {t('mp.linkPournami')}
              </Link>
            </div>
          </section>
        </div>
      </div>

      {/* Site Footer with Map Attribution */}
      <SiteFooter />
    </div>
  );
};

export default MapPreview;
