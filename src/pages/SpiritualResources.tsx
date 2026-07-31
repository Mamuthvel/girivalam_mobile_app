import { useState } from "react";
import { Helmet } from "react-helmet-async";
import { Navigation } from "@/components/Navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { 
  Mountain, 
  MapPin, 
  Clock, 
  Droplets, 
  Heart, 
  BookOpen, 
  Calendar,
  Shield,
  Footprints,
  Wind
} from "lucide-react";

const SpiritualResources = () => {
  const [personalNotes, setPersonalNotes] = useState("");

  const sacredPlaces = [
    {
      name: "Arunachaleswarar Temple",
      description: "One of the largest temple complexes in India, dedicated to Lord Shiva."
    },
    {
      name: "Ashta Lingams",
      description: "Eight traditional sacred locations positioned around the hill, representing the cardinal directions."
    }
  ];

  const safetyInfo = [
    { icon: Footprints, text: "Approximate distance: 14 kilometers around the hill" },
    { icon: Clock, text: "Average walking time: 4-6 hours depending on pace" },
    { icon: MapPin, text: "Rest points available along the path with seating areas" },
    { icon: Droplets, text: "Water and refreshments available at various stops" },
    { icon: Shield, text: "Wear comfortable footwear and carry water" }
  ];

  const optionalPractices = [
    "Some devotees prefer walking in silence for inner reflection",
    "You may choose to practice breath awareness during the walk",
    "Simple mindfulness can be observed while walking",
    "Walking barefoot is optional and a personal choice"
  ];

  const mantras = [
    {
      sanskrit: "Om Namah Shivaya",
      meaning: "Salutations to Lord Shiva"
    },
    {
      sanskrit: "Om Arunachala Shivaya Namaha",
      meaning: "Salutations to Lord Shiva of Arunachala"
    },
    {
      sanskrit: "Arunachala Shiva",
      meaning: "Invoking the presence of Arunachala"
    }
  ];

  const templeTimings = [
    { period: "Morning", time: "5:30 AM - 12:30 PM" },
    { period: "Evening", time: "4:00 PM - 9:30 PM" }
  ];

  const festivals = [
    "Karthigai Deepam (November/December)",
    "Maha Shivaratri (February/March)",
    "Pournami (Full Moon days)"
  ];

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>Spiritual Resources — Girivalam Preparation Guide | MyGirivalam.in</title>
        <meta name="description" content="Spiritual resources for Tiruvannamalai Girivalam. Preparation tips, sacred items checklist, devotional notes, and guidelines for a meaningful Arunachala pilgrimage." />
        <link rel="canonical" href="https://mygirivalam.in/spiritual-resources" />
      </Helmet>
      {/* Navigation */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border/50 px-4 py-3">
        <Navigation />
      </header>

      <main className="container mx-auto px-4 py-6 pb-20 max-w-3xl">
        {/* Header Section */}
        <section className="text-center mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
            Spiritual Guide & Sacred Resources
          </h1>
          <p className="text-muted-foreground text-sm md:text-base">
            General spiritual information and sacred references for reflection and awareness.
          </p>
        </section>

        {/* Introduction */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <p className="text-foreground/90 leading-relaxed text-sm md:text-base">
              This page provides cultural, historical, and spiritual context related to Girivalam 
              and the sacred hill of Arunachala. All content is informational and intended for 
              general awareness. Participation in any practice is entirely optional and based 
              on personal preference.
            </p>
          </CardContent>
        </Card>

        {/* Significance of Girivalam */}
        <Card className="mb-6">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Mountain className="h-5 w-5 text-primary" />
              Significance of Girivalam
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-foreground/90 leading-relaxed text-sm md:text-base">
              Girivalam refers to the practice of circumambulating the sacred hill of Arunachala 
              in Tiruvannamalai, Tamil Nadu. This tradition has been observed for centuries and 
              holds cultural and spiritual significance for many. The 14-kilometer path around 
              the hill passes through various temples and sacred sites, offering an opportunity 
              for quiet reflection and connection with nature.
            </p>
          </CardContent>
        </Card>

        {/* Sacred Places */}
        <Card className="mb-6">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <MapPin className="h-5 w-5 text-primary" />
              Sacred Places
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {sacredPlaces.map((place, index) => (
              <div key={index} className="border-l-2 border-primary/30 pl-4">
                <h3 className="font-medium text-foreground">{place.name}</h3>
                <p className="text-muted-foreground text-sm">{place.description}</p>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Route & Safety Info */}
        <Card className="mb-6">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Shield className="h-5 w-5 text-primary" />
              Girivalam Route & Safety Info
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {safetyInfo.map((info, index) => (
                <li key={index} className="flex items-start gap-3">
                  <info.icon className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                  <span className="text-foreground/90 text-sm">{info.text}</span>
                </li>
              ))}
            </ul>
            <div className="mt-4 p-3 bg-muted/50 rounded-lg">
              <p className="text-sm text-muted-foreground">
                <strong>Weather awareness:</strong> Check weather conditions before starting. 
                Early morning or evening walks are generally more comfortable.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Optional Spiritual Practices */}
        <Card className="mb-6">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Heart className="h-5 w-5 text-primary" />
              Optional Spiritual Practices
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground mb-4 uppercase tracking-wide">
              These practices are entirely optional
            </p>
            <ul className="space-y-3">
              {optionalPractices.map((practice, index) => (
                <li key={index} className="flex items-start gap-3">
                  <Wind className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                  <span className="text-foreground/90 text-sm">{practice}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        {/* Mantras & Verses */}
        <Card className="mb-6">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <BookOpen className="h-5 w-5 text-primary" />
              Mantras & Verses
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground mb-4">
              For personal spiritual comfort. Use as you prefer.
            </p>
            <div className="space-y-4">
              {mantras.map((mantra, index) => (
                <div key={index} className="p-3 bg-muted/30 rounded-lg">
                  <p className="font-medium text-foreground">{mantra.sanskrit}</p>
                  <p className="text-sm text-muted-foreground mt-1">{mantra.meaning}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Temple Timings & Festivals */}
        <Card className="mb-6">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Calendar className="h-5 w-5 text-primary" />
              Temple Timings & Festivals
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mb-4">
              <h4 className="text-sm font-medium text-foreground mb-2">General Timings</h4>
              <div className="space-y-2">
                {templeTimings.map((timing, index) => (
                  <div key={index} className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{timing.period}</span>
                    <span className="text-foreground">{timing.time}</span>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <h4 className="text-sm font-medium text-foreground mb-2">Major Festivals</h4>
              <ul className="space-y-1">
                {festivals.map((festival, index) => (
                  <li key={index} className="text-sm text-muted-foreground">
                    • {festival}
                  </li>
                ))}
              </ul>
            </div>
            <p className="text-xs text-muted-foreground mt-4 italic">
              Timings may vary on special occasions. Please verify locally.
            </p>
          </CardContent>
        </Card>

        {/* Personal Reflection */}
        <Card className="mb-6">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Heart className="h-5 w-5 text-primary" />
              Personal Reflection
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground mb-3">
              Your notes are private and stored only on this device.
            </p>
            <div className="space-y-3">
              <p className="text-sm text-foreground/80 italic">
                "What did you feel today? What are you grateful for?"
              </p>
              <Textarea
                placeholder="Write your personal reflections here..."
                value={personalNotes}
                onChange={(e) => setPersonalNotes(e.target.value)}
                className="min-h-[120px] resize-none"
              />
            </div>
          </CardContent>
        </Card>

        {/* Disclaimer */}
        <footer className="text-center py-6 border-t border-border/50">
          <p className="text-xs text-muted-foreground max-w-md mx-auto">
            This content is intended for general spiritual awareness and does not replace 
            medical, legal, or professional advice.
          </p>
        </footer>
      </main>
    </div>
  );
};

export default SpiritualResources;
