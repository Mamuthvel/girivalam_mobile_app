import { lazy, Suspense, useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import SiteHeader from "@/components/SiteHeader";
import { SpiritualCard } from "@/components/SpiritualCard";
import { ClickSound } from "@/components/ClickSound";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  MapPin,
  BookOpen,
  CreditCard,
  MapPinPlus,
  AlertTriangle,
  View,
  Mountain
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import heroImage from "@/assets/updated_hero_image.webp?format=webp";
import { Link } from "react-router-dom";
const DesktopHero = lazy(() => import("./responsivepage/DesktopHero"));
const MobileHero = lazy(() => import("./responsivepage/MobileHero"));
const WeatherWidget = lazy(() => import("@/components/WeatherWidget"));
import LiveAnnadhanamCard from "@/components/annadhanam/LiveAnnadhanamCard";

import { useLanguage } from "@/contexts/LanguageContext";
import HeroSkeleton from "./HeroSkeleton";

const Index = () => {
  const { t } = useLanguage();
  const { toast } = useToast();
  const { user } = useAuth();
  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 1024);

  const handleComingSoonClick = (featureName: string) => {
    toast({
      title: featureName,
      description: t('home.comingSoon'),
      duration: 2500,
    });
  };

  useEffect(() => {
    const handleResize = () => setIsDesktop(window.innerWidth >= 1024);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);
  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>Tiruvannamalai Girivalam Guide — Live Map & 2026 Dates</title>
        <meta name="description" content="Tiruvannamalai Girivalam guide: 14km route map, Ashta Lingam temples, live GPS tracking, and 2026 Pournami dates — everything for your sacred walk." />
        <link rel="canonical" href="https://mygirivalam.in/" />
        <meta property="og:url" content="https://mygirivalam.in/" />
        <script type="application/ld+json">{JSON.stringify({
          "@context": "https://schema.org",
          "@type": "FAQPage",
          "mainEntity": [
            {
              "@type": "Question",
              "name": "What is Girivalam?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "Girivalam (also spelled Giri Valam) is the sacred circumambulation of Arunachala Hill in Tiruvannamalai, Tamil Nadu. Devotees walk the 14 km path around the hill, which is believed to represent Lord Shiva himself. It is considered one of the most powerful spiritual practices in South India."
              }
            },
            {
              "@type": "Question",
              "name": "How long is the Girivalam path?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "The Girivalam path is approximately 14 km (around 8.7 miles) long and encircles the sacred Arunachala Hill in Tiruvannamalai. The route passes through 8 Ashta Lingam shrines and several temples. An average walker completes it in 3 to 4 hours."
              }
            },
            {
              "@type": "Question",
              "name": "When is the best time to do Girivalam?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "Girivalam can be done on any day, but Pournami (full moon night) is the most auspicious time. Thousands of devotees gather every month on Pournami to walk the sacred path under the moonlight. Early morning (before 6 AM) or evening after sunset are ideal times to avoid heat."
              }
            },
            {
              "@type": "Question",
              "name": "What are the 8 Ashta Lingams on the Girivalam path?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "The 8 Ashta Lingams on the Girivalam path represent the eight directions and are dedicated to Lord Shiva: Indra Lingam (East), Agni Lingam (South-East), Yama Lingam (South), Niruthi Lingam (South-West), Varuna Lingam (West), Vayu Lingam (North-West), Kubera Lingam (North), and Isanya Lingam (North-East)."
              }
            },
            {
              "@type": "Question",
              "name": "Is Girivalam safe to do at night?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "Yes, Girivalam is generally safe at night, especially on Pournami days when the route is well-lit and thousands of devotees walk together. The path is regularly patrolled by police during festival days. Use our live GPS tracker on MyGirivalam.in to navigate safely at any time."
              }
            },
            {
              "@type": "Question",
              "name": "What should I carry for Girivalam?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "For a comfortable Girivalam, carry: water bottle (at least 1 litre), comfortable footwear or walk barefoot as is traditional, a small bag with snacks, a phone with MyGirivalam.in open for GPS navigation, and light cotton clothing. Avoid heavy bags and wear clothes suitable for temple entry."
              }
            },
            {
              "@type": "Question",
              "name": "How to reach Tiruvannamalai for Girivalam?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "Tiruvannamalai is well connected by road and rail. By train, the nearest railway station is Tiruvannamalai (TVA) on the Villupuram–Katpadi line. By bus, state buses run frequently from Chennai (about 190 km), Bangalore (about 210 km), and Puducherry (about 100 km). The nearest airport is Chennai International Airport (about 200 km)."
              }
            },
            {
              "@type": "Question",
              "name": "What is the significance of Pournami Girivalam?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "Pournami Girivalam, performed on the full moon night, is believed to be especially powerful as the moon's energy amplifies the spiritual benefits of the circumambulation. It is said that walking the Girivalam path on Pournami is equivalent to performing the ritual 10,000 times on a regular day. Hundreds of thousands gather at Tiruvannamalai for this monthly event."
              }
            },
            {
              "@type": "Question",
              "name": "Is Girivalam also spelled Giri Valam, or called திருவண்ணாமலை கிரிவலம்?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "Yes — Girivalam is also spelled Giri Valam or Giriwalam, and called Giri Pradakshina, Annamalai Giri Pradakshina, or Thiruvannamalai Girivalam. In Tamil it is திருவண்ணாமலை கிரிவலம் (Tiruvannamalai Girivalam) — the sacred circumambulation of Arunachala Hill, walked barefoot by lakhs of devotees on Pournami days."
              }
            }
          ]
        })}</script>
      </Helmet>
      <SiteHeader />
      {/* Hero Section */}
      <section className="relative min-h-screen flex flex-col">
        {/* Hero Background */}
        <div className="absolute inset-0 overflow-hidden">
          <img
            src={heroImage}
            alt="Sacred Arunachala Hill at golden hour"
            className="w-full h-full object-cover  contrast-125 saturate-150"
            loading="eager"
            fetchPriority="high"
            decoding="async"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-background/20 via-background/40 to-background/80" />
        </div>

        {/* Weather Widget - positioned at top of hero */}
        <div className={`${isDesktop ? "relative z-10 pt-4 top-20" : "relative z-10 pt-4 top-12"}`}>
          <Suspense fallback={<div className="h-12 w-32 mx-auto rounded-full bg-muted/40 backdrop-blur-sm animate-pulse" />}>
            <WeatherWidget bg={isDesktop ? false : true} />
          </Suspense>
        </div>
        <Suspense fallback={<HeroSkeleton />}>
          {isDesktop ? (
            // Desktop Layout
            <DesktopHero />
          ) : (
            // Existing Mobile Layout
            <MobileHero />
          )}
        </Suspense>

      </section>

      {/* SEO Introduction — visible text for Google indexing */}
      <section className="px-4 pt-10 pb-2">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="font-playfair text-4xl font-bold mb-4">
            Tiruvannamalai Girivalam Guide
          </h1>
          <p className="text-lg text-muted-foreground leading-relaxed max-w-2xl mx-auto">
            Your complete companion for the sacred 14&nbsp;km Girivalam circumambulation
            around Arunachala Hill. Get live GPS navigation, Ashta Lingam temple timings,
            Pournami dates, mantras, and spiritual guidance — all in one place.
          </p>
        </div>
      </section>

      {/* Sacred Services Grid */}
      <section className="px-4 pb-8 cv-auto pt-8">
        <div className="max-w-6xl mx-auto">
          <h2 className="font-playfair text-3xl font-bold text-center mb-6">{t('home.sacredServices')}</h2>

          {/* Live Booking Stats */}
          {/* <div className="mb-8">
            <RealTimeBookings />
          </div> */}

          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {/* Temple Home Card */}
            <ClickSound soundText="Opening temple home">
              <Link to="/temple-home" className="group h-full">
                <SpiritualCard className="text-center group-hover:bg-amber-500/5 h-full flex flex-col justify-between min-h-[160px] p-4 md:p-6">
                  <div className="p-4 bg-amber-500/10 rounded-xl mx-auto w-fit mb-4 group-hover:scale-110 transition-transform">
                    <span className="text-3xl">🛕</span>
                  </div>
                  <div className="flex-1 flex flex-col justify-center">
                    <h3 className="font-medium text-lg mb-2">{t('home.templeHome') || 'Temple Home'}</h3>
                    <p className="text-sm text-muted-foreground">{t('home.templeHomeDesc') || 'Live Status & Timings'}</p>
                  </div>
                </SpiritualCard>
              </Link>
            </ClickSound>

            <LiveAnnadhanamCard />


            <ClickSound soundText="Opening sacred map">
              <Link to="/girivalam-map" className="group h-full">
                <SpiritualCard className="text-center group-hover:bg-primary/5 h-full flex flex-col justify-between min-h-[160px] p-4 md:p-6">
                  <div className="p-4 bg-primary/10 rounded-xl mx-auto w-fit mb-4 group-hover:scale-110 transition-transform">
                    <MapPin className="h-8 w-8 text-primary" />
                  </div>
                  <div className="flex-1 flex flex-col justify-center">
                    <h3 className="font-medium text-lg mb-2">{t('home.sacredMap')}</h3>
                    <p className="text-sm text-muted-foreground">{t('home.gpsNavigation')}</p>
                  </div>
                </SpiritualCard>
              </Link>
            </ClickSound>

            <ClickSound soundText="Opening Spiritual Guide">
              <Link to="/ai-guide" className="group h-full">
                <SpiritualCard className="text-center group-hover:bg-secondary/5 h-full flex flex-col justify-between min-h-[160px] p-4 md:p-6">
                  <div className="p-4 bg-secondary/10 rounded-xl mx-auto w-fit mb-4 group-hover:scale-110 transition-transform">
                    <BookOpen className="h-8 w-8 text-secondary" />
                  </div>
                  <div className="flex-1 flex flex-col justify-center">
                    <h3 className="font-medium text-lg mb-2">{t('nav.guide')}</h3>
                    <p className="text-sm text-muted-foreground">Stories & Mantras</p>
                  </div>
                </SpiritualCard>
              </Link>
            </ClickSound>

            {/* <ClickSound soundText="Opening services">
              <Link to="/girivalam-booknow">
                <Button
                  variant="outline"
                  size="sm"
                  className="text-lg px-8 py-4 bg-card/80 backdrop-blur-sm hover:bg-card border-primary/30"
                >
                  <CreditCard className="mr-2 h-5 w-5" />
                  Book Now
                </Button>
              </Link>
            </ClickSound> */}

            {/* <ClickSound soundText="Opening services">
              <Link to="/girivalam-services">
                <Button
                  variant="outline"
                  size="sm"
                  className="text-lg px-6 py-4 bg-card/80 backdrop-blur-sm hover:bg-card border-primary/30"
                >
                  <Heart className="mr-2 h-5 w-5" />
                  Services
                </Button>
              </Link>
            </ClickSound> */}

            <ClickSound soundText="Opening booking system">
              <Link to={user ? "/girivalam-services" : "/girivalam-services-preview"} className="group h-full">
                <SpiritualCard className="text-center group-hover:bg-accent/5 h-full flex flex-col justify-between min-h-[160px] p-4 md:p-6">
                  <div className="p-4 bg-accent/10 rounded-xl mx-auto w-fit mb-4 group-hover:scale-110 transition-transform">
                    <CreditCard className="h-8 w-8 text-accent" />
                  </div>
                  <div className="flex-1 flex flex-col justify-center">
                    <h3 className="font-medium text-lg mb-2">Book Now</h3>
                    <p className="text-sm text-muted-foreground">Reserve Services</p>
                  </div>
                </SpiritualCard>
              </Link>
            </ClickSound>

            <ClickSound soundText="Emergency contacts">
              <Link to="/emergency-contacts" className="group h-full">
                <SpiritualCard className="text-center group-hover:bg-destructive/5 h-full flex flex-col justify-between min-h-[160px] p-4 md:p-6">
                  <div className="p-4 bg-destructive/10 rounded-xl mx-auto w-fit mb-4 group-hover:scale-110 transition-transform">
                    <AlertTriangle className="h-8 w-8 text-destructive" />
                  </div>
                  <div className="flex-1 flex flex-col justify-center">
                    <h3 className="font-medium text-lg mb-2">{t('home.emergency')}</h3>
                    <p className="text-sm text-muted-foreground">{t('home.emergencyDesc')}</p>
                  </div>
                </SpiritualCard>
              </Link>
            </ClickSound>

            <ClickSound soundText="Save extra locations">
              <Link to="/saved-locations" className="group h-full">
                <SpiritualCard className="text-center group-hover:bg-primary/5 h-full flex flex-col justify-between min-h-[160px] p-4 md:p-6">
                  <div className="p-4 bg-primary/10 rounded-xl mx-auto w-fit mb-4 group-hover:scale-110 transition-transform">
                    <MapPinPlus className="h-8 w-8 text-primary" />
                  </div>
                  <div className="flex-1 flex flex-col justify-center">
                    <h3 className="font-medium text-lg mb-2">Save Locations</h3>
                    <p className="text-sm text-muted-foreground">Your Custom Spots</p>
                  </div>
                </SpiritualCard>
              </Link>
            </ClickSound>

            {/* Coming Soon: 360° of Arunachala */}
            <ClickSound soundText="360 degree view coming soon">
              <div
                onClick={() => handleComingSoonClick(t('home.360arunachala'))}
                className="group h-full cursor-pointer"
              >
                <SpiritualCard className="text-center group-hover:bg-sky-500/5 h-full flex flex-col justify-between min-h-[160px] p-6 md:p-6 relative overflow-hidden">
                  {/* Coming Soon Badge */}
                  <div className="absolute top-0 right-2 flex items-center gap-1 px-2 py-[2px] bg-gradient-to-r from-amber-500/20 to-orange-500/20 rounded-full border border-amber-500/30">
                    <span className="text-xs">⏳</span>
                    <span className="text-[10px] font-medium text-amber-600 dark:text-amber-400 uppercase tracking-wide">{t('home.comingSoon')}</span>
                  </div>

                  {/* Divine Glow Pulse Animation */}
                  <div className="absolute inset-0 bg-gradient-to-br from-sky-500/5 via-transparent to-cyan-500/5 animate-pulse pointer-events-none" />

                  <div className="p-4 bg-sky-500/10 rounded-xl mx-auto w-fit mb-4 group-hover:scale-110 transition-transform relative">
                    <div className="absolute inset-0 bg-sky-400/20 rounded-xl animate-[pulse_2s_ease-in-out_infinite]" />
                    <View className="h-8 w-8 text-sky-600 dark:text-sky-400 relative z-10" />
                  </div>
                  <div className="flex-1 flex flex-col justify-center relative z-10">
                    <h3 className="font-medium text-lg mb-2">{t('home.360arunachala')}</h3>
                    <p className="text-sm text-muted-foreground">{t('home.360arunachalaDesc')}</p>
                  </div>
                </SpiritualCard>
              </div>
            </ClickSound>

            {/* Coming Soon: Tourism Spots */}
            <ClickSound soundText="Tourism spots coming soon">
              <div
                onClick={() => handleComingSoonClick(t('home.tourismSpots'))}
                className="group h-full cursor-pointer"
              >
                <SpiritualCard className="text-center group-hover:bg-emerald-500/5 h-full flex flex-col justify-between min-h-[160px] p-4 md:p-6 relative overflow-hidden">
                  {/* Coming Soon Badge */}
                  <div className="absolute top-0 right-2 flex items-center gap-1 px-2 py-[2px] bg-gradient-to-r from-amber-500/20 to-orange-500/20 rounded-full border border-amber-500/30">
                    <span className="text-xs">⏳</span>
                    <span className="text-[10px] font-medium text-amber-600 dark:text-amber-400 uppercase tracking-wide">{t('home.comingSoon')}</span>
                  </div>

                  {/* Divine Glow Pulse Animation */}
                  <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 via-transparent to-teal-500/5 animate-pulse pointer-events-none" />

                  <div className="p-4 bg-emerald-500/10 rounded-xl mx-auto w-fit mb-4 group-hover:scale-110 transition-transform relative">
                    <div className="absolute inset-0 bg-emerald-400/20 rounded-xl animate-[pulse_2s_ease-in-out_infinite]" />
                    <Mountain className="h-8 w-8 text-emerald-600 dark:text-emerald-400 relative z-10" />
                  </div>
                  <div className="flex-1 flex flex-col justify-center relative z-10">
                    <h3 className="font-medium text-lg mb-2">{t('home.tourismSpots')}</h3>
                    <p className="text-sm text-muted-foreground">{t('home.tourismSpotsDesc')}</p>
                  </div>
                </SpiritualCard>
              </div>
            </ClickSound>
          </div>
        </div>
      </section>
      {/* FAQ Section — AEO structured content */}
      <section className="px-4 py-10">
        <div className="max-w-3xl mx-auto">
          <h2 className="font-playfair text-3xl font-bold text-center mb-2">
            Frequently Asked Questions
          </h2>
          <p className="text-center text-muted-foreground text-sm mb-8">
            Everything you need to know about Girivalam at Tiruvannamalai
          </p>
          <Accordion type="single" collapsible className="space-y-2">
            {[
              {
                q: "What is Girivalam?",
                a: "Girivalam is the sacred 14 km circumambulation of Arunachala Hill in Tiruvannamalai, Tamil Nadu. Devotees walk the path around the hill, which is believed to represent Lord Shiva himself — one of the most powerful spiritual practices in South India."
              },
              {
                q: "How long is the Girivalam path?",
                a: "The Girivalam path is approximately 14 km (8.7 miles) and circles the sacred Arunachala Hill, passing through 8 Ashta Lingam shrines and several temples. Most walkers complete it in 3 to 4 hours."
              },
              {
                q: "When is the best time to do Girivalam?",
                a: "Girivalam can be done any day, but Pournami (full moon night) is the most auspicious. Early morning before 6 AM or after sunset are ideal to avoid heat. Our app shows the exact next Pournami date and crowd forecast."
              },
              {
                q: "What are the 8 Ashta Lingams on the Girivalam path?",
                a: "The Ashta Lingams represent the 8 directions: Indra Lingam (East), Agni Lingam (SE), Yama Lingam (South), Niruthi Lingam (SW), Varuna Lingam (West), Vayu Lingam (NW), Kubera Lingam (North), and Isanya Lingam (NE). Each shrine is a dedicated stop along the 14 km route."
              },
              {
                q: "Is Girivalam safe to do at night?",
                a: "Yes — especially on Pournami days when the route is well-lit and thousands walk together with police patrolling the path. Use our live GPS tracker to navigate safely at any time of day or night."
              },
              {
                q: "What should I carry for Girivalam?",
                a: "Carry at least 1 litre of water, comfortable footwear (or walk barefoot as tradition), light cotton clothes suitable for temple entry, a small snack, and your phone with MyGirivalam.in open for live GPS navigation."
              },
              {
                q: "How to reach Tiruvannamalai?",
                a: "By train, use Tiruvannamalai station (TVA) on the Villupuram–Katpadi line. Frequent buses run from Chennai (~190 km), Bangalore (~210 km), and Puducherry (~100 km). The nearest airport is Chennai International (~200 km)."
              },
              {
                q: "What is the significance of Pournami Girivalam?",
                a: "Walking Girivalam on Pournami (full moon night) is believed to be especially powerful — scriptures say it is equivalent to performing the ritual 10,000 times on a regular day. Hundreds of thousands of devotees gather at Tiruvannamalai every month for this event."
              },
              {
                q: "Is Girivalam also spelled Giri Valam, or called திருவண்ணாமலை கிரிவலம்?",
                a: "Yes — Girivalam is also spelled Giri Valam or Giriwalam, and called Giri Pradakshina, Annamalai Giri Pradakshina, or Thiruvannamalai Girivalam. In Tamil it is திருவண்ணாமலை கிரிவலம் (Tiruvannamalai Girivalam) — அருணாசலா மலையை சுற்றி வரும் புனிதமான பிரதட்சிணை (the sacred circumambulation of Arunachala Hill), walked barefoot by lakhs of devotees on Pournami days."
              }
            ].map((item, i) => (
              <AccordionItem key={i} value={`faq-${i}`} className="border border-border/40 rounded-lg px-4 bg-card/40 backdrop-blur-sm">
                <AccordionTrigger className="text-left font-medium text-base hover:no-underline py-4">
                  {item.q}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground text-sm leading-relaxed pb-4">
                  {item.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-card/30 border-t border-border/30 py-4 cv-auto">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <p className="text-muted-foreground text-sm">
            &copy; 2026 MyGirivalam.in &mdash; Made with devotion for Arunachala devotees
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
