import { Link } from "react-router-dom";
import {
  MapPin,
  Clock,
  Footprints,
  Bike,
  Car,
  ArrowRight,
  Milestone,
  Compass,
  Download,
} from "lucide-react";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import { SpiritualCard } from "@/components/SpiritualCard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Seo from "@/components/Seo";
import { useLanguage } from "@/contexts/LanguageContext";

// Cumulative distances derived from the mapped Girivalam path (src/data/girivalam-path.ts),
// matched to each Ashta Lingam temple's coordinates (src/data/landmarks.ts).
// `dir` is a compass code translated via t('dist.dir.<code>'); fromKey/toKey are
// translation keys for the start/finish temple label (Lingam names stay as proper nouns).
const STAGES = [
  { fromKey: "dist.start", to: "Indra Lingam", dir: "E", cumulative: 0.2, leg: 0.2 },
  { from: "Indra Lingam", to: "Agni Lingam", dir: "SE", cumulative: 1.6, leg: 1.4 },
  { from: "Agni Lingam", to: "Yama Lingam", dir: "S", cumulative: 3.3, leg: 1.7 },
  { from: "Yama Lingam", to: "Nirruti Lingam", dir: "SW", cumulative: 5.1, leg: 1.8 },
  { from: "Nirruti Lingam", to: "Varuna Lingam", dir: "W", cumulative: 6.6, leg: 1.5 },
  { from: "Varuna Lingam", to: "Vayu Lingam", dir: "NW", cumulative: 8.6, leg: 2.0 },
  { from: "Vayu Lingam", to: "Kubera Lingam", dir: "N", cumulative: 10.1, leg: 1.5 },
  { from: "Kubera Lingam", to: "Esanya Lingam", dir: "NE", cumulative: 12.0, leg: 1.9 },
  { from: "Esanya Lingam", toKey: "dist.finish", dir: "E", cumulative: 13.8, leg: 1.8 },
] as const;

const MODES = [
  { icon: Footprints, nameKey: "dist.mode.walkTradName", paceKey: "dist.mode.walkTradPace", timeKey: "dist.mode.walkTradTime" },
  { icon: Footprints, nameKey: "dist.mode.walkBriskName", paceKey: "dist.mode.walkBriskPace", timeKey: "dist.mode.walkBriskTime" },
  { icon: Bike, nameKey: "dist.mode.cycleName", paceKey: "dist.mode.cyclePace", timeKey: "dist.mode.cycleTime" },
  { icon: Car, nameKey: "dist.mode.carName", paceKey: "dist.mode.carPace", timeKey: "dist.mode.carTime" },
] as const;

const GirivalamDistanceRoute = () => {
  const { t } = useLanguage();
  return (
    <div className="min-h-screen bg-background">
      <Seo
        title="Tiruvannamalai Girivalam Distance — How Many KM? Full 14 km Route Map"
        description="Tiruvannamalai Girivalam is a 14 km circular walk around Arunachala Hill. See how many km it is, the full route map, distance between each of the 8 Ashta Lingam temples, and how long it takes on foot, cycle or by car."
        canonical="/girivalam-distance-route"
        type="article"
        jsonLd={[
          {
            "@context": "https://schema.org",
            "@type": "Article",
            headline: "Girivalam Distance & Route Guide — How Many KM, How Long?",
            description:
              "Complete breakdown of the 14km Tiruvannamalai Girivalam route, distance between the 8 Ashta Lingam temples, and travel time on foot, cycle, or by vehicle.",
            author: { "@type": "Organization", name: "MyGirivalam.in" },
            publisher: {
              "@type": "Organization",
              name: "MyGirivalam.in",
              logo: { "@type": "ImageObject", url: "https://mygirivalam.in/logo.svg" },
            },
            mainEntityOfPage: {
              "@type": "WebPage",
              "@id": "https://mygirivalam.in/girivalam-distance-route",
            },
          },
          {
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              { "@type": "ListItem", position: 1, name: "Home", item: "https://mygirivalam.in/" },
              { "@type": "ListItem", position: 2, name: "Guides", item: "https://mygirivalam.in/guides" },
              { "@type": "ListItem", position: 3, name: "Distance & Route", item: "https://mygirivalam.in/girivalam-distance-route" },
            ],
          },
          {
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: [
              {
                "@type": "Question",
                name: "How many kilometers is Girivalam in Tiruvannamalai?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "The Girivalam path around Arunachala Hill is approximately 14 km long, forming a full circle around the hill starting and ending near Arunachaleswarar Temple.",
                },
              },
              {
                "@type": "Question",
                name: "How long does it take to complete Girivalam on foot?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "Most devotees walking barefoot at a devotional pace with stops at the 8 Ashta Lingam temples take 4–6 hours. A brisk walk with footwear and fewer stops can take 3–4 hours.",
                },
              },
              {
                "@type": "Question",
                name: "Which direction does Girivalam go — clockwise or anticlockwise?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "Girivalam is walked clockwise (keeping Arunachala Hill on the right), starting from the East near Indra Lingam and passing through Agni, Yama, Nirruti, Varuna, Vayu, Kubera, and Esanya Lingam before returning to the start.",
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
            <Milestone className="h-3 w-3 mr-1" />
            {t('dist.badge')}
          </Badge>
          <h1 className="font-playfair text-4xl md:text-6xl font-bold mb-4 text-foreground">
            {t('dist.h1')}
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            {t('dist.intro')}
          </p>
          <div className="mt-6 flex flex-col items-center gap-3">
            <a
              href="/girivalam-route-map.pdf"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground shadow-sm transition-colors hover:bg-primary/90"
            >
              <Download className="h-4 w-4" />
              {t('dist.downloadPdf')}
            </a>
            <Link
              to="/girivalam-map"
              className="inline-flex items-center gap-2 rounded-lg border border-primary/30 bg-background px-5 py-3 text-sm font-semibold text-primary shadow-sm transition-colors hover:bg-primary/10"
            >
              <MapPin className="h-4 w-4" />
              {t('dist.openLiveGps')}
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-12">
        {/* Quick stats */}
        <section className="mb-16 grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: t('dist.statDistance'), value: t('dist.statDistanceVal') },
            { label: t('dist.statTime'), value: t('dist.statTimeVal') },
            { label: t('dist.statStops'), value: t('dist.statStopsVal') },
            { label: t('dist.statDirection'), value: t('dist.statDirectionVal') },
          ].map((s) => (
            <SpiritualCard key={s.label} className="p-5 text-center">
              <p className="text-2xl md:text-3xl font-bold text-primary">{s.value}</p>
              <p className="text-sm text-muted-foreground mt-1">{s.label}</p>
            </SpiritualCard>
          ))}
        </section>

        {/* Route stage table */}
        <section className="mb-16">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-primary/10 rounded-xl">
              <Compass className="h-6 w-6 text-primary" />
            </div>
            <h2 className="font-playfair text-3xl font-bold">{t('dist.stageTitle')}</h2>
          </div>
          <p className="text-muted-foreground mb-6 max-w-3xl">
            {t('dist.stageIntroA')}
            <Link to="/girivalam-map" className="text-primary hover:underline">
              {t('dist.liveRouteMapLink')}
            </Link>
            {t('dist.stageIntroB')}
          </p>
          <div className="overflow-x-auto rounded-xl border border-border">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-primary/5 text-left">
                  <th className="p-3 font-semibold">{t('dist.thStage')}</th>
                  <th className="p-3 font-semibold">{t('dist.thDirection')}</th>
                  <th className="p-3 font-semibold">{t('dist.thLeg')}</th>
                  <th className="p-3 font-semibold">{t('dist.thCumulative')}</th>
                </tr>
              </thead>
              <tbody>
                {STAGES.map((s, i) => (
                  <tr key={i} className={i % 2 === 0 ? "bg-background" : "bg-muted/30"}>
                    <td className="p-3">
                      <span className="font-medium">{"fromKey" in s ? t(s.fromKey) : s.from}</span>
                      <ArrowRight className="inline h-3 w-3 mx-2 text-muted-foreground" />
                      <span>{"toKey" in s ? t(s.toKey) : s.to}</span>
                    </td>
                    <td className="p-3 text-muted-foreground">{t(`dist.dir.${s.dir}`)}</td>
                    <td className="p-3">{s.leg.toFixed(1)} km</td>
                    <td className="p-3 font-medium text-primary">{s.cumulative.toFixed(1)} km</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Duration by mode */}
        <section className="mb-16">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-primary/10 rounded-xl">
              <Clock className="h-6 w-6 text-primary" />
            </div>
            <h2 className="font-playfair text-3xl font-bold">{t('dist.durationTitle')}</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {MODES.map((m) => (
              <SpiritualCard key={m.nameKey} className="p-6 flex items-start gap-4">
                <div className="p-3 bg-primary/10 rounded-xl shrink-0">
                  <m.icon className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-semibold text-foreground">{t(m.nameKey)}</p>
                  <p className="text-sm text-muted-foreground mt-1">{t(m.paceKey)}</p>
                  <p className="text-lg font-bold text-primary mt-2">{t(m.timeKey)}</p>
                </div>
              </SpiritualCard>
            ))}
          </div>
          <p className="text-sm text-muted-foreground mt-4">
            {t('dist.durationNoteA')}
            <Link to="/pournami-dates" className="text-primary hover:underline">
              {t('dist.pournamiCalendarLink')}
            </Link>
            {t('dist.durationNoteB')}
          </p>
        </section>

        {/* CTA */}
        <section className="text-center py-12 px-4 bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5 rounded-3xl">
          <h3 className="font-playfair text-3xl font-bold mb-3">{t('dist.ctaTitle')}</h3>
          <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
            {t('dist.ctaDesc')}
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link to="/girivalam-map">
              <Button size="lg" className="bg-primary hover:bg-primary/90">
                <MapPin className="h-4 w-4 mr-2" />
                {t('dist.openLiveMap')}
              </Button>
            </Link>
            <Link to="/ashta-lingam-temples">
              <Button size="lg" variant="outline">
                {t('dist.exploreTemples')}
              </Button>
            </Link>
          </div>
        </section>
      </div>

      <SiteFooter />
    </div>
  );
};

export default GirivalamDistanceRoute;
