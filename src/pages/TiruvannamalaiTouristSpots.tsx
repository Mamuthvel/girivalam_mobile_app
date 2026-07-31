import { Link } from "react-router-dom";
import { MapPin, Landmark, Mountain, Flower2, ArrowRight } from "lucide-react";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import { SpiritualCard } from "@/components/SpiritualCard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Seo from "@/components/Seo";

const TEMPLE_SITES = [
  {
    name: "Arunachaleswarar Temple (Annamalaiyar Temple)",
    desc: "One of the largest Shiva temples in India and the spiritual heart of Tiruvannamalai, dedicated to Lord Shiva as Arunachaleswarar — the Agni (fire) Lingam among the Pancha Bhoota Sthalams. Known for its towering gopurams, the Ayyankulam and Sivaganga temple tanks, and the Karthigai Deepam festival when a giant beacon is lit atop Arunachala Hill.",
  },
  {
    name: "Girivalam Path",
    desc: "The ~14km road that circles Arunachala Hill, walked clockwise by devotees, especially on Pournami (full moon) nights. Passes all 8 Ashta Lingam temples and several smaller shrines, water points, and rest areas.",
  },
  {
    name: "Pavazhakundru",
    desc: "A small hillock and shrine along the Girivalam path, a popular stop for rest and prasadam distribution during Pournami.",
  },
];

const ASHRAM_SITES = [
  {
    name: "Sri Ramanasramam (Ramana Ashram)",
    desc: "The ashram founded around the samadhi of Sri Ramana Maharshi, at the foot of Arunachala Hill. A major destination for meditators and spiritual seekers from across the world.",
  },
  {
    name: "Virupaksha Cave",
    desc: "A cave on the slopes of Arunachala where Ramana Maharshi lived for many years in the early 20th century. Reached by a short climb from Ramanasramam.",
  },
  {
    name: "Skandashram",
    desc: "Located above Virupaksha Cave, this was Ramana Maharshi's residence after Virupaksha Cave, offering views over the town and temple. A short, popular trek for visitors.",
  },
  {
    name: "Seshadri Swamigal Ashram",
    desc: "Ashram dedicated to Seshadri Swamigal, a revered saint and contemporary of Ramana Maharshi in Tiruvannamalai.",
  },
  {
    name: "Yogi Ramsuratkumar Ashram",
    desc: "Ashram of the 20th-century mystic Yogi Ramsuratkumar, located in Tiruvannamalai and visited by his devotees.",
  },
];

const NATURE_SITES = [
  {
    name: "Arunachala Hill Trek",
    desc: "The hill itself can be climbed via marked trails to the peak, passing several caves and meditation spots. Best attempted early morning to avoid heat.",
  },
  {
    name: "Sivaganga Tank",
    desc: "A temple tank within the Arunachaleswarar Temple complex, used for ritual bathing and considered sacred.",
  },
];

const TiruvannamalaiTouristSpots = () => {
  return (
    <div className="min-h-screen bg-background">
      <Seo
        title="Tiruvannamalai Tourist Places — Temples, Ashrams & Arunachala Hill Guide | MyGirivalam.in"
        description="Explore Tiruvannamalai's top tourist places: Arunachaleswarar Temple, Ramana Ashram, Virupaksha Cave, Skandashram, and the Arunachala Hill trek — alongside the sacred Girivalam path."
        canonical="/tiruvannamalai-tourist-spots"
        type="article"
        jsonLd={[
          {
            "@context": "https://schema.org",
            "@type": "Article",
            headline: "Tiruvannamalai Tourist Places — Temples, Ashrams & Arunachala Hill Guide",
            description:
              "Guide to the top places to visit in Tiruvannamalai — temples, ashrams, caves, and the Arunachala Hill trek — alongside the sacred Girivalam path.",
            author: { "@type": "Organization", name: "MyGirivalam.in" },
            publisher: {
              "@type": "Organization",
              name: "MyGirivalam.in",
              logo: { "@type": "ImageObject", url: "https://mygirivalam.in/logo.svg" },
            },
            mainEntityOfPage: {
              "@type": "WebPage",
              "@id": "https://mygirivalam.in/tiruvannamalai-tourist-spots",
            },
          },
          {
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              { "@type": "ListItem", position: 1, name: "Home", item: "https://mygirivalam.in/" },
              { "@type": "ListItem", position: 2, name: "Guides", item: "https://mygirivalam.in/guides" },
              { "@type": "ListItem", position: 3, name: "Tourist Spots", item: "https://mygirivalam.in/tiruvannamalai-tourist-spots" },
            ],
          },
        ]}
      />
      <SiteHeader />

      {/* Hero */}
      <div className="relative pt-24 pb-12 px-4 bg-gradient-to-b from-primary/5 to-background">
        <div className="max-w-4xl mx-auto text-center">
          <Badge variant="outline" className="mb-4 bg-primary/10 border-primary/30">
            <Landmark className="h-3 w-3 mr-1" />
            Places to Visit
          </Badge>
          <h1 className="font-playfair text-4xl md:text-6xl font-bold mb-4 text-foreground">
            Tiruvannamalai Tourist Places
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Beyond the Girivalam path, Tiruvannamalai is home to one of India's great Shiva
            temples, the ashrams of Ramana Maharshi and other saints, sacred caves on Arunachala
            Hill, and quiet spots for meditation and reflection.
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-12">
        {/* Temples */}
        <section className="mb-16">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-primary/10 rounded-xl">
              <Landmark className="h-6 w-6 text-primary" />
            </div>
            <h2 className="font-playfair text-3xl font-bold">Temples & Sacred Sites</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {TEMPLE_SITES.map((s) => (
              <SpiritualCard key={s.name} className="p-6">
                <h3 className="font-playfair text-xl font-bold mb-2">{s.name}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{s.desc}</p>
              </SpiritualCard>
            ))}
          </div>
        </section>

        {/* Ashrams */}
        <section className="mb-16">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-primary/10 rounded-xl">
              <Flower2 className="h-6 w-6 text-primary" />
            </div>
            <h2 className="font-playfair text-3xl font-bold">Ashrams & Meditation Spots</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {ASHRAM_SITES.map((s) => (
              <SpiritualCard key={s.name} className="p-6">
                <h3 className="font-playfair text-xl font-bold mb-2">{s.name}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{s.desc}</p>
              </SpiritualCard>
            ))}
          </div>
        </section>

        {/* Nature */}
        <section className="mb-16">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-primary/10 rounded-xl">
              <Mountain className="h-6 w-6 text-primary" />
            </div>
            <h2 className="font-playfair text-3xl font-bold">Hill & Nature</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {NATURE_SITES.map((s) => (
              <SpiritualCard key={s.name} className="p-6">
                <h3 className="font-playfair text-xl font-bold mb-2">{s.name}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{s.desc}</p>
              </SpiritualCard>
            ))}
          </div>
        </section>

        {/* Practical tips */}
        <section className="mb-16">
          <SpiritualCard className="p-8 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20 border-amber-200 dark:border-amber-800">
            <h2 className="font-playfair text-3xl font-bold mb-4">Planning Your Visit</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                "Visit the temple early morning or evening to avoid the midday heat.",
                "Combine ashram visits (Ramanasramam, Virupaksha Cave, Skandashram) into one walking route up the hill.",
                "Plan around Pournami if you also want to experience Girivalam — expect much larger crowds.",
                "Dress modestly when entering temples and ashrams.",
                "Carry water — shade and facilities are limited on the hill trails.",
                "Most ashrams observe quiet hours; check timings before visiting.",
              ].map((tip) => (
                <div key={tip} className="flex items-start gap-3 p-3 bg-white/50 dark:bg-background/50 rounded-lg">
                  <ArrowRight className="h-5 w-5 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
                  <p className="text-foreground/90 text-sm">{tip}</p>
                </div>
              ))}
            </div>
          </SpiritualCard>
        </section>

        {/* CTA */}
        <section className="text-center py-12 px-4 bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5 rounded-3xl">
          <h3 className="font-playfair text-3xl font-bold mb-3">Planning to Walk Girivalam Too?</h3>
          <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
            See the full route, distances, and the 8 Ashta Lingam temples along the way.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link to="/girivalam-distance-route">
              <Button size="lg" className="bg-primary hover:bg-primary/90">
                <MapPin className="h-4 w-4 mr-2" />
                View Route & Distances
              </Button>
            </Link>
            <Link to="/guides">
              <Button size="lg" variant="outline">
                More Girivalam Guides
              </Button>
            </Link>
          </div>
        </section>
      </div>

      <SiteFooter />
    </div>
  );
};

export default TiruvannamalaiTouristSpots;
