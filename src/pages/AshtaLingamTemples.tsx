import { Link } from "react-router-dom";
import { MapPin, Flame, Sparkles } from "lucide-react";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import { SpiritualCard } from "@/components/SpiritualCard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Seo from "@/components/Seo";
import { ashtalingamTemples } from "@/data/landmarks";
import { TOTAL_KM, km, lingamLeg } from "@/data/girivalam-stages";

/** Stable anchor id, so "esanya lingam timings" can be deep-linked and indexed. */
const slug = (name: string) => name.toLowerCase().replace(/[^a-z0-9]+/g, "-");

const PAGE_URL = "https://mygirivalam.in/ashta-lingam-temples/";

/** Shared timings — see note in src/data/landmarks.ts. */
const COMMON_TIMINGS = ashtalingamTemples[0]?.timings ?? "";

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
              "@id": PAGE_URL,
            },
          },
          {
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              { "@type": "ListItem", position: 1, name: "Home", item: "https://mygirivalam.in/" },
              { "@type": "ListItem", position: 2, name: "Guides", item: "https://mygirivalam.in/guides/" },
              { "@type": "ListItem", position: 3, name: "Ashta Lingam Temples", item: PAGE_URL },
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
              url: `${PAGE_URL}#${slug(t.name)}`,
            })),
          },
          {
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: [
              {
                "@type": "Question",
                name: "How many Lingams are there in Tiruvannamalai?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: `There are 8 Ashta Lingam temples around Arunachala Hill in Tiruvannamalai, one for each direction: Indra (east), Agni (south-east), Yama (south), Nirruti (south-west), Varuna (west), Vayu (north-west), Kubera (north) and Esanya (north-east). All 8 stand on the 14 km Girivalam path and are visited in that clockwise order.`,
                },
              },
              {
                "@type": "Question",
                name: "Which is the first Lingam in Girivalam?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "Indra Lingam is the first, about 0.2 km from Arunachaleswarar Temple on the eastern side. Girivalam is walked clockwise from there, and Esanya Lingam in the north-east is the eighth and last before the path returns to the temple.",
                },
              },
              {
                "@type": "Question",
                name: "What is the distance between Kubera Lingam and Esanya Lingam?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: `Kubera Lingam to Esanya Lingam is about ${km(lingamLeg("Esanya Lingam")!.leg)} km along the Girivalam path. Kubera sits at roughly ${km(lingamLeg("Kubera Lingam")!.cumulative)} km from the start and Esanya at ${km(lingamLeg("Esanya Lingam")!.cumulative)} km.`,
                },
              },
              {
                "@type": "Question",
                name: "What are the Ashta Lingam temple timings?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: `The Ashta Lingam shrines are generally open ${COMMON_TIMINGS}. Hours are extended on Pournami and festival days such as Karthigai Deepam, when the shrines stay open through the night for Girivalam. Confirm locally before planning a visit around a specific shrine.`,
                },
              },
            ],
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
        {/* Answer-first summary. "how many lingam in tiruvannamalai",
            "all lingam in tiruvannamalai" and "8 lingam in tiruvannamalai" are all
            question-shaped queries that want the count and the list immediately. */}
        <section className="mb-12">
          <SpiritualCard className="p-6 md:p-8 border-primary/30 bg-primary/5">
            <p className="text-lg leading-relaxed text-foreground">
              There are <strong>8 Ashta Lingam temples</strong> in Tiruvannamalai, one guarding
              each direction around Arunachala Hill, all standing on the{" "}
              <Link to="/girivalam-distance-route" className="text-primary underline underline-offset-4 hover:text-primary/80">
                14 km Girivalam path
              </Link>
              . Walked clockwise from the temple they come in this order:
            </p>
            <ol className="mt-4 grid grid-cols-2 gap-x-4 gap-y-2 sm:grid-cols-4">
              {ashtalingamTemples.map((temple, i) => {
                const leg = lingamLeg(temple.name);
                return (
                  <li key={temple.id}>
                    <a
                      href={`#${slug(temple.name)}`}
                      className="block rounded-xl bg-background/70 px-3 py-2 text-sm transition-colors hover:bg-background"
                    >
                      <span className="font-semibold text-foreground">
                        {i + 1}. {temple.name}
                      </span>
                      <span className="block text-xs text-muted-foreground">
                        {temple.direction}
                        {leg ? ` · ${km(leg.cumulative)} km` : ""}
                      </span>
                    </a>
                  </li>
                );
              })}
            </ol>
            {COMMON_TIMINGS && (
              <p className="mt-4 text-sm text-muted-foreground">
                All 8 shrines are generally open <strong>{COMMON_TIMINGS}</strong>, with extended
                hours on Pournami and Karthigai Deepam nights.
              </p>
            )}
            <p className="mt-2 text-sm text-muted-foreground">
              Distances are measured along the mapped route, which totals {km(TOTAL_KM)} km; the
              walk is traditionally described as 14 km.
            </p>
          </SpiritualCard>
        </section>

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
                <SpiritualCard key={temple.id} id={slug(temple.name)} className="p-6 scroll-mt-24">
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
                  {(() => {
                    const leg = lingamLeg(temple.name);
                    if (!leg) return null;
                    return (
                      <p className="mb-2 text-sm text-foreground/80">
                        <span className="font-medium">{km(leg.cumulative)} km</span> from the start
                        {leg.previous ? ` · ${km(leg.leg)} km from ${leg.previous}` : " of the walk"}
                      </p>
                    );
                  })()}
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
