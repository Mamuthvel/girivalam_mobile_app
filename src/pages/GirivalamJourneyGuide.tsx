import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { 
  MapPin, 
  Moon, 
  Heart, 
  Sparkles,
  Compass,
  Flame,
  Scale,
  Mountain,
  Droplets,
  Wind,
  Gem,
  Brain,
  CheckCircle2,
  ArrowRight,
  Navigation as NavigationIcon,
  ChevronRight,
  Circle,
  Clock,
  Route
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Navigation } from "@/components/Navigation";
import { cn } from "@/lib/utils";

const ASHTA_LINGAMS = [
  {
    id: 1,
    name: "Indra Lingam",
    tamilName: "இந்திர லிங்கம்",
    direction: "East",
    element: "Leadership & Power",
    benefit: "Mental clarity and focus",
    icon: Sparkles,
    color: "text-amber-600",
    distanceFromPrevious: 0,
    cumulativeDistance: 0,
    highlights: ["Starting point", "Best at sunrise", "Prosperity blessings"]
  },
  {
    id: 2,
    name: "Agni Lingam",
    tamilName: "அக்னி லிங்கம்",
    direction: "South East",
    element: "Fire & Transformation",
    benefit: "Purification of karma",
    icon: Flame,
    color: "text-orange-600",
    distanceFromPrevious: 1.8,
    cumulativeDistance: 1.8,
    highlights: ["Purification", "Fire deity", "Tuesday special"]
  },
  {
    id: 3,
    name: "Yama Lingam",
    tamilName: "யம லிங்கம்",
    direction: "South",
    element: "Dharma & Justice",
    benefit: "Discipline and righteousness",
    icon: Scale,
    color: "text-stone-600",
    distanceFromPrevious: 1.7,
    cumulativeDistance: 3.5,
    highlights: ["Longevity blessings", "Ancestor prayers", "Midday worship"]
  },
  {
    id: 4,
    name: "Niruthi Lingam",
    tamilName: "நிரிருதி லிங்கம்",
    direction: "South West",
    element: "Earth & Foundation",
    benefit: "Stability and grounding",
    icon: Mountain,
    color: "text-emerald-700",
    distanceFromPrevious: 1.8,
    cumulativeDistance: 5.3,
    highlights: ["Protection", "Remove negativity", "Fear removal"]
  },
  {
    id: 5,
    name: "Varuna Lingam",
    tamilName: "வருண லிங்கம்",
    direction: "West",
    element: "Water & Flow",
    benefit: "Emotional balance and peace",
    icon: Droplets,
    color: "text-blue-600",
    distanceFromPrevious: 1.9,
    cumulativeDistance: 7.2,
    highlights: ["Water deity", "Purification", "Evening prayers"]
  },
  {
    id: 6,
    name: "Vayu Lingam",
    tamilName: "வாயு லிங்கம்",
    direction: "North West",
    element: "Air & Breath",
    benefit: "Health and vitality",
    icon: Wind,
    color: "text-cyan-600",
    distanceFromPrevious: 1.8,
    cumulativeDistance: 9.0,
    highlights: ["Wind deity", "Respiratory health", "Voice blessings"]
  },
  {
    id: 7,
    name: "Kubera Lingam",
    tamilName: "குபேர லிங்கம்",
    direction: "North",
    element: "Wealth & Abundance",
    benefit: "Prosperity and success",
    icon: Gem,
    color: "text-yellow-600",
    distanceFromPrevious: 2.0,
    cumulativeDistance: 11.0,
    highlights: ["Wealth deity", "Business success", "Financial blessings"]
  },
  {
    id: 8,
    name: "Ishanya Lingam",
    tamilName: "ஈசான்ய லிங்கம்",
    direction: "North East",
    element: "Divine Knowledge",
    benefit: "Wisdom and enlightenment",
    icon: Brain,
    color: "text-violet-600",
    distanceFromPrevious: 3.0,
    cumulativeDistance: 14.0,
    highlights: ["Final temple", "Spiritual enlightenment", "Moksha blessings"]
  }
];

const BEST_PRACTICES = [
  "Walk barefoot to connect with the sacred earth",
  "Maintain silence or chant mantras softly",
  "Carry water and light snacks",
  "Start early morning or evening for comfort",
  "Respect fellow devotees and the path",
  "Visit each Ashta Lingam with awareness"
];

const GirivalamJourneyGuide = () => {
  const [showFloatingCta, setShowFloatingCta] = useState(false);
  const [expandedLingam, setExpandedLingam] = useState<number | null>(null);

  useEffect(() => {
    const handleScroll = () => {
      // Show floating CTA after scrolling 300px
      setShowFloatingCta(window.scrollY > 300);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50/80 via-orange-50/40 to-white">
      <Navigation />
      
      {/* Hero Section */}
      <section className="px-4 pt-20 pb-12 md:pt-28 md:pb-16">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-amber-100/80 rounded-full mb-6">
            <Moon className="h-4 w-4 text-amber-700" />
            <span className="text-sm font-medium text-amber-800">Sacred Pilgrimage</span>
          </div>
          
          <h1 className="text-3xl md:text-5xl font-bold text-stone-800 mb-4 leading-tight font-playfair">
            Girivalam Journey Guide
          </h1>
          
          <p className="text-lg md:text-xl text-stone-600 mb-2">
            Walk Around Arunachala with Awareness
          </p>
          
          <p className="text-sm text-stone-500 mb-8">
            Spiritual meaning, Ashta Lingams & walking guidance
          </p>
          
          <Link to="/girivalam-map">
            <Button 
              size="lg" 
              className="bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white shadow-lg shadow-amber-200 px-8 py-6 text-lg rounded-xl"
            >
              <NavigationIcon className="mr-2 h-5 w-5" />
              Open Live Map & Tracker
            </Button>
          </Link>
          
          <p className="mt-4 text-sm text-stone-500 flex items-center justify-center gap-2">
            <MapPin className="h-4 w-4" />
            14 km sacred walk around Arunachala
          </p>
        </div>
      </section>

      {/* What is Girivalam */}
      <section className="px-4 py-10 md:py-14">
        <div className="max-w-2xl mx-auto">
          <Card className="p-6 md:p-8 bg-white/80 backdrop-blur border-amber-100 shadow-lg shadow-amber-50 rounded-2xl">
            <h2 className="text-xl md:text-2xl font-semibold text-stone-800 mb-6 flex items-center gap-3 font-playfair">
              <Heart className="h-6 w-6 text-orange-500" />
              What is Girivalam?
            </h2>
            
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <div className="mt-1 h-2 w-2 rounded-full bg-amber-500 flex-shrink-0" />
                <p className="text-stone-600 text-base md:text-lg">
                  <strong className="text-stone-700">Sacred Circumambulation</strong> – Walking around the holy Arunachala Hill, believed to be Lord Shiva himself in the form of fire
                </p>
              </li>
              <li className="flex items-start gap-3">
                <div className="mt-1 h-2 w-2 rounded-full bg-amber-500 flex-shrink-0" />
                <p className="text-stone-600 text-base md:text-lg">
                  <strong className="text-stone-700">Pournami Special</strong> – Best performed on Full Moon nights when thousands of devotees walk together in devotion
                </p>
              </li>
              <li className="flex items-start gap-3">
                <div className="mt-1 h-2 w-2 rounded-full bg-amber-500 flex-shrink-0" />
                <p className="text-stone-600 text-base md:text-lg">
                  <strong className="text-stone-700">Spiritual Benefits</strong> – Brings inner peace, mental clarity, and deepens devotion to the divine
                </p>
              </li>
              <li className="flex items-start gap-3">
                <div className="mt-1 h-2 w-2 rounded-full bg-amber-500 flex-shrink-0" />
                <p className="text-stone-600 text-base md:text-lg">
                  <strong className="text-stone-700">Eight Energy Points</strong> – Visit the Ashta Lingams representing cosmic energies along the path
                </p>
              </li>
            </ul>
          </Card>
        </div>
      </section>

      {/* Ashta Lingam Section */}
      <section className="px-4 py-10 md:py-14 bg-gradient-to-b from-transparent via-amber-50/50 to-transparent">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-2xl md:text-3xl font-bold text-stone-800 mb-3 font-playfair">
              Ashta Lingams
            </h2>
            <p className="text-stone-600 text-base md:text-lg">
              8 Sacred Energy Points of Girivalam
            </p>
            <p className="text-sm text-stone-500 mt-2">Tap on each temple to learn more</p>
          </div>
          
          {/* Temple Stops with Connection Line */}
          <div className="relative">
            {/* Connection Line */}
            <div className="absolute left-6 md:left-7 top-8 bottom-8 w-0.5 bg-gradient-to-b from-amber-400 via-orange-400/50 to-amber-400/20" />

            <div className="space-y-1">
              {ASHTA_LINGAMS.map((lingam, index) => {
                const IconComponent = lingam.icon;
                const isExpanded = expandedLingam === lingam.id;
                
                return (
                  <div key={lingam.id} className="relative">
                    {/* Distance Indicator (between stops) */}
                    {index > 0 && (
                      <div className="ml-14 md:ml-16 py-2 flex items-center gap-2 text-xs text-stone-500">
                        <ChevronRight className="h-3 w-3" />
                        <span>{lingam.distanceFromPrevious} km</span>
                        <span>•</span>
                        <span>~{Math.round(lingam.distanceFromPrevious * 14)} min walk</span>
                      </div>
                    )}

                    {/* Stop Card */}
                    <div
                      onClick={() => setExpandedLingam(isExpanded ? null : lingam.id)}
                      className={cn(
                        "relative flex items-start gap-4 p-4 rounded-xl cursor-pointer transition-all duration-200",
                        isExpanded 
                          ? "bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 shadow-md" 
                          : "bg-white/80 hover:bg-amber-50/50 border border-transparent hover:border-amber-100"
                      )}
                    >
                      {/* Status Icon */}
                      <div
                        className={cn(
                          "relative z-10 flex-shrink-0 w-12 h-12 md:w-14 md:h-14 rounded-full flex items-center justify-center transition-all",
                          isExpanded 
                            ? "bg-gradient-to-br from-amber-500 to-orange-500 text-white shadow-lg shadow-amber-200" 
                            : "bg-gradient-to-br from-amber-100 to-orange-100 text-amber-700"
                        )}
                      >
                        {isExpanded ? (
                          <IconComponent className="h-6 w-6" />
                        ) : (
                          <span className="text-lg md:text-xl font-bold">{index + 1}</span>
                        )}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <h4 className="font-semibold text-stone-800 flex items-center gap-2 text-base md:text-lg">
                              {lingam.name}
                              {!isExpanded && <IconComponent className={cn("h-4 w-4", lingam.color)} />}
                            </h4>
                            <div className="flex items-center gap-2 mt-0.5">
                              <p className="text-sm text-stone-500">{lingam.tamilName}</p>
                            </div>
                          </div>
                          <Badge variant="outline" className="text-xs bg-white/80 border-amber-200 text-amber-700 flex-shrink-0">
                            {lingam.direction}
                          </Badge>
                        </div>

                        {/* Collapsed Preview */}
                        {!isExpanded && (
                          <p className="text-sm text-stone-600 mt-2 line-clamp-1">
                            {lingam.element} • {lingam.benefit}
                          </p>
                        )}

                        {/* Expanded Content */}
                        {isExpanded && (
                          <div className="mt-3 space-y-3 animate-in slide-in-from-top-2 duration-200">
                            {/* Element & Benefit */}
                            <div className="space-y-2">
                              <p className="text-sm md:text-base text-stone-700">
                                <span className="font-medium">Element:</span> {lingam.element}
                              </p>
                              <p className="text-sm md:text-base text-emerald-700 font-medium flex items-center gap-1">
                                <Sparkles className="h-4 w-4" />
                                {lingam.benefit}
                              </p>
                            </div>

                            {/* Stats */}
                            <div className="flex flex-wrap gap-3 text-sm">
                              <span className="flex items-center gap-1 text-stone-500">
                                <Route className="h-4 w-4" />
                                {lingam.cumulativeDistance} km from start
                              </span>
                              {index > 0 && (
                                <span className="flex items-center gap-1 text-stone-500">
                                  <Clock className="h-4 w-4" />
                                  ~{Math.round(lingam.cumulativeDistance * 14)} min total
                                </span>
                              )}
                            </div>

                            {/* Highlights */}
                            <div className="flex flex-wrap gap-2">
                              {lingam.highlights.map((highlight, i) => (
                                <Badge key={i} variant="secondary" className="text-xs bg-amber-100/80 text-amber-800 border-0">
                                  {highlight}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Best Practices */}
      <section className="px-4 py-10 md:py-14">
        <div className="max-w-2xl mx-auto">
          <Card className="p-6 md:p-8 bg-gradient-to-br from-emerald-50 to-teal-50/50 border-emerald-100 shadow-lg rounded-2xl">
            <h2 className="text-xl md:text-2xl font-semibold text-stone-800 mb-6 flex items-center gap-3 font-playfair">
              <CheckCircle2 className="h-6 w-6 text-emerald-600" />
              Best Practices & Preparation
            </h2>
            
            <ul className="space-y-3">
              {BEST_PRACTICES.map((practice, index) => (
                <li key={index} className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                  <p className="text-stone-700 text-base md:text-lg">{practice}</p>
                </li>
              ))}
            </ul>
          </Card>
        </div>
      </section>

      {/* Call to Action */}
      <section className="px-4 py-12 md:py-20">
        <div className="max-w-2xl mx-auto text-center">
          <div className="p-8 md:p-12 bg-gradient-to-br from-amber-600 via-orange-600 to-amber-700 rounded-3xl shadow-xl shadow-amber-200">
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-4 font-playfair">
              Ready to Begin Your Girivalam?
            </h2>
            
            <p className="text-amber-100 mb-8 text-base md:text-lg">
              Track your journey, find Ashta Lingams, and navigate with ease
            </p>
            
            <Link to="/girivalam-map">
              <Button 
                size="lg" 
                className="bg-white hover:bg-amber-50 text-amber-700 font-semibold px-8 py-6 text-lg rounded-xl shadow-lg"
              >
                Start Girivalam with Live Map
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer Spacing - extra space for floating CTA */}
      <div className="h-24" />

      {/* Floating Bottom CTA Bar */}
      <div 
        className={`fixed bottom-0 left-0 right-0 z-50 transition-all duration-300 ease-out ${
          showFloatingCta 
            ? "translate-y-0 opacity-100" 
            : "translate-y-full opacity-0"
        }`}
      >
        <div className="bg-white/95 backdrop-blur-lg border-t border-amber-100 shadow-[0_-4px_20px_rgba(0,0,0,0.1)] px-4 py-3 safe-area-pb">
          <div className="max-w-lg mx-auto flex items-center justify-between gap-3">
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-stone-800 truncate">Ready to walk?</p>
              <p className="text-xs text-stone-500 truncate">Track your 14km Girivalam journey</p>
            </div>
            <Link to="/girivalam-map" className="flex-shrink-0">
              <Button 
                size="sm"
                className="bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white shadow-lg shadow-amber-200/50 px-4 py-2 rounded-lg"
              >
                <NavigationIcon className="mr-1.5 h-4 w-4" />
                Open Map
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GirivalamJourneyGuide;
