import { Link } from "react-router-dom";
import { MapPin, Flame, Sparkles } from "lucide-react";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import { SpiritualCard } from "@/components/SpiritualCard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Seo from "@/components/Seo";
import { ashtalingamTemples } from "@/data/landmarks";

const GUARDIAN: Record<string, { deity: string; significance: string }> = {
  "Indra Lingam": {
    deity: "Indra, king of the celestial devas",
    significance:
      "Marks the start of the Girivalam path on the eastern side, close to Arunachaleswarar Temple's main entrance. Devotees typically begin their circumambulation here.",
  },
  "Agni Lingam": {
    deity: "Agni, the fire god",
    significance:
      "Located in the south-east, associated with purification through sacred fire. Many devotees pause here for a short prayer before continuing south.",
  },
  "Yama Lingam": {
    deity: "Yama, lord of dharma and death",
    significance:
      "Guards the southern direction. Traditionally linked with overcoming the fear of death and living a righteous life.",
  },
  "Nirruti Lingam": {
    deity: "Nirruti, guardian against misfortune",
    significance:
      "Sits in the south-west, believed to protect devotees from evil forces and obstacles on their spiritual path.",
  },
  "Varuna Lingam": {
    deity: "Varuna, lord of water and oceans",
    significance:
      "Positioned in the west, near water bodies. Associated with cleansing and the flow of life.",
  },
  "Vayu Lingam": {
    deity: "Vayu, the wind god",
    significance:
      "Located north-west. Represents prana (life force/breath) and is linked to health and vitality.",
  },
  "Kubera Lingam": {
    deity: "Kubera, lord of wealth",
    significance:
      "Guards the north, invoked by devotees seeking prosperity and abundance.",
  },
  "Esanya Lingam": {
    deity: "Eesanya (Shiva) — lord of the north-east",
    significance:
      "The final of the 8 temples on the clockwise route, marking the return stretch toward Arunachaleswarar Temple.",
  },
};

const AshtaLingamTemples = () => {
  return (
    <div className="min-h-screen bg-background">
      <Seo
        title="Ashta Lingam Temples of Tiruvannamalai — All 8 Sacred Shrines Guide | MyGirivalam.in"
        description="Complete guide to the 8 Ashta Lingam temples on the Tiruvannamalai Girivalam path — Indra, Agni, Yama, Nirruti, Varuna, Vayu, Kubera and Esanya Lingam — with directions, distances, and timings."
        canonical="/ashta-lingam-temples"
        type="article"
        jsonLd={[
          {
            "@context": "https://schema.org",
            "@type": "Article",
            headline: "Ashta Lingam Temples of Tiruvannamalai — All 8 Sacred Shrines Guide",
            description:
              "Guide to the 8 Ashta Lingam temples encircling Arunachala Hill, each guarding one of the eight directions along the Girivalam path.",
            author: { "@type": "Organization", name: "MyGirivalam.in" },
            publisher: {
              "@type": "Organization",
              name: "MyGirivalam.in",
              logo: { "@type": "ImageObject", url: "https://mygirivalam.in/logo.svg" },
            },
            mainEntityOfPage: {
              "@type": "WebPage",
              "@id": "https://mygirivalam.in/ashta-lingam-temples",
            },
          },
          {
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              { "@type": "ListItem", position: 1, name: "Home", item: "https://mygirivalam.in/" },
              { "@type": "ListItem", position: 2, name: "Guides", item: "https://mygirivalam.in/guides" },
              { "@type": "ListItem", position: 3, name: "Ashta Lingam Temples", item: "https://mygirivalam.in/ashta-lingam-temples" },
            ],
          },
          {
            "@context": "https://schema.org",
            "@type": "ItemList",
            itemListElement: ashtalingamTemples.map((t, i) => ({
              "@type": "ListItem",
              position: i + 1,
              name: t.name,
              description: t.description,
            })),
          },
        ]}
      />
      <SiteHeader />

      {/* Hero */}
      <div className="relative pt-24 pb-12 px-4 bg-gradient-to-b from-primary/5 to-background">
        <div className="max-w-4xl mx-auto text-center">
          <Badge variant="outline" className="mb-4 bg-primary/10 border-primary/30">
            <Flame className="h-3 w-3 mr-1" />
            Ashta Lingam Guide
          </Badge>
          <h1 className="font-playfair text-4xl md:text-6xl font-bold mb-4 text-foreground">
            The 8 Ashta Lingam Temples
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Eight small shrines encircle Arunachala Hill, each guarding one of the eight
            directions and consecrated to a Dikpalaka (directional guardian deity). Together
            they mark the Girivalam path devotees walk clockwise around the hill.
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-12">
        {/* What are Ashta Lingams */}
        <section className="mb-16">
          <SpiritualCard className="p-8">
            <h2 className="font-playfair text-3xl font-bold mb-4">What Are the Ashta Lingams?</h2>
            <p className="text-lg text-muted-foreground leading-relaxed mb-4">
              "Ashta" means eight and "Lingam" refers to the symbolic form of Lord Shiva. The
              Ashta Lingam temples are eight small shrines positioned around Arunachala Hill,
              each facing one of the eight cardinal and intercardinal directions and dedicated
              to that direction's guardian deity (Dikpalaka) — Indra, Agni, Yama, Nirruti,
              Varuna, Vayu, Kubera, and Eesanya.
            </p>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Devotees performing Girivalam stop at each of these temples along the 14km path,
              offering brief prayers as they circle the hill clockwise, keeping Arunachala on
              their right.
            </p>
          </SpiritualCard>
        </section>

        {/* Temple cards */}
        <section className="mb-16">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-primary/10 rounded-xl">
              <Sparkles className="h-6 w-6 text-primary" />
            </div>
            <h2 className="font-playfair text-3xl font-bold">All 8 Temples, In Route Order</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {ashtalingamTemples.map((temple, i) => {
              const info = GUARDIAN[temple.name];
              return (
                <SpiritualCard key={temple.id} className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Stop {i + 1} of 8</p>
                      <h3 className="font-playfair text-2xl font-bold">{temple.name}</h3>
                    </div>
                    <Badge variant="outline" className="shrink-0">
                      {temple.direction}
                    </Badge>
                  </div>
                  {info && (
                    <p className="text-sm font-medium text-primary/80 mb-2">
                      Guardian deity: {info.deity}
                    </p>
                  )}
                  <p className="text-sm text-muted-foreground leading-relaxed mb-3">
                    {info?.significance || temple.description}
                  </p>
                  {temple.timings && (
                    <p className="text-xs text-muted-foreground">
                      <span className="font-medium">Timings:</span> {temple.timings}
                    </p>
                  )}
                </SpiritualCard>
              );
            })}
          </div>
        </section>

        {/* CTA */}
        <section className="text-center py-12 px-4 bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5 rounded-3xl">
          <h3 className="font-playfair text-3xl font-bold mb-3">Find Every Temple on the Live Map</h3>
          <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
            Track your location and get directions to each Ashta Lingam temple as you walk the
            Girivalam path.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link to="/girivalam-map">
              <Button size="lg" className="bg-primary hover:bg-primary/90">
                <MapPin className="h-4 w-4 mr-2" />
                Open Live Map
              </Button>
            </Link>
            <Link to="/girivalam-distance-route">
              <Button size="lg" variant="outline">
                View Full Route & Distances
              </Button>
            </Link>
          </div>
        </section>
      </div>

      <SiteFooter />
    </div>
  );
};

export default AshtaLingamTemples;
