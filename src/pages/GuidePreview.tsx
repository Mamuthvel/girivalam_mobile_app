import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import { SpiritualCard } from "@/components/SpiritualCard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  MapPin, Clock, Compass, Star, ChevronRight,
  LogIn, Headphones, Heart, Footprints, AlertCircle,
  Sun, Moon, Sparkles, Mountain, BookOpen,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { Navigate } from "react-router-dom";

/**
 * This page is the public Girivalam guide: signed-in users are sent to
 * /girivalam-guide instead, so the preview is what search traffic actually
 * lands on. It used to point its canonical at /girivalam-guide, i.e. it told
 * Google it was not the real page — while carrying 10,039 impressions a quarter
 * against that page's 28. It is now self-canonical.
 */
const CANONICAL = "https://mygirivalam.in/girivalam-guide-preview/";

// Static color/code/mantra data — no translation needed
const ASHTA_LINGAM_KEYS = [
  { id: 1, nameKey: "linga.indra",   sigKey: "guidePreview.sig.indra",   dirKey: "guidePreview.dirEast",  dirCode: "E",  mantra: "Om Indraya Namaha"  },
  { id: 2, nameKey: "linga.agni",    sigKey: "guidePreview.sig.agni",    dirKey: "guidePreview.dirSE",    dirCode: "SE", mantra: "Om Agnaye Namaha"      },
  { id: 3, nameKey: "linga.yama",    sigKey: "guidePreview.sig.yama",    dirKey: "guidePreview.dirSouth", dirCode: "S",  mantra: "Om Yamaya Namaha"    },
  { id: 4, nameKey: "linga.niruthi", sigKey: "guidePreview.sig.nirruti", dirKey: "guidePreview.dirSW",    dirCode: "SW", mantra: "Om Nirrutaye Namaha" },
  { id: 5, nameKey: "linga.varuna",  sigKey: "guidePreview.sig.varuna",  dirKey: "guidePreview.dirWest",  dirCode: "W",  mantra: "Om Varunaya Namaha"      },
  { id: 6, nameKey: "linga.vayu",    sigKey: "guidePreview.sig.vayu",    dirKey: "guidePreview.dirNW",    dirCode: "NW", mantra: "Om Vayave Namaha"     },
  { id: 7, nameKey: "linga.kubera",  sigKey: "guidePreview.sig.kubera",  dirKey: "guidePreview.dirNorth", dirCode: "N",  mantra: "Om Kuberaya Namaha"  },
  { id: 8, nameKey: "linga.esanya",  sigKey: "guidePreview.sig.esanya",  dirKey: "guidePreview.dirNE",    dirCode: "NE", mantra: "Om Esanyaya Namaha"     },
];

const PREP_KEYS = [
  { icon: <Sun className="h-5 w-5" />,        titleKey: "guidePreview.prep1Title", descKey: "guidePreview.prep1Desc" },
  { icon: <Footprints className="h-5 w-5" />, titleKey: "guidePreview.prep2Title", descKey: "guidePreview.prep2Desc" },
  { icon: <Clock className="h-5 w-5" />,      titleKey: "guidePreview.prep3Title", descKey: "guidePreview.prep3Desc" },
  { icon: <Heart className="h-5 w-5" />,      titleKey: "guidePreview.prep4Title", descKey: "guidePreview.prep4Desc" },
  { icon: <Mountain className="h-5 w-5" />,   titleKey: "guidePreview.prep5Title", descKey: "guidePreview.prep5Desc" },
  { icon: <Moon className="h-5 w-5" />,       titleKey: "guidePreview.prep6Title", descKey: "guidePreview.prep6Desc" },
];

const FAQ_KEYS = [
  { qKey: "guidePreview.faq1Q", aKey: "guidePreview.faq1A" },
  { qKey: "guidePreview.faq2Q", aKey: "guidePreview.faq2A" },
  { qKey: "guidePreview.faq3Q", aKey: "guidePreview.faq3A" },
  { qKey: "guidePreview.faq4Q", aKey: "guidePreview.faq4A" },
  { qKey: "guidePreview.faq5Q", aKey: "guidePreview.faq5A" },
  { qKey: "guidePreview.faq6Q", aKey: "guidePreview.faq6A" },
];

const FEATURE_KEYS = [
  { icon: <MapPin className="h-4 w-4" />,    labelKey: "guidePreview.feat1" },
  { icon: <Headphones className="h-4 w-4" />, labelKey: "guidePreview.feat2" },
  { icon: <Footprints className="h-4 w-4" />, labelKey: "guidePreview.feat3" },
  { icon: <BookOpen className="h-4 w-4" />,   labelKey: "guidePreview.feat4" },
];

export default function GuidePreview() {
  const { user, loading: authLoading } = useAuth();
  const { t } = useLanguage();

  // JSON-LD, always English for crawlers. Rendered through Helmet rather than
  // appended to document.head in an effect: the effect sat below the early
  // returns below, so the hook count changed once auth resolved (React throws
  // on that render), and react-snap never reliably captured the markup.
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQ_KEYS.map(f => ({
      "@type": "Question",
      name: t(f.qKey),
      acceptedAnswer: { "@type": "Answer", text: t(f.aKey) },
    })),
  };
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: "https://mygirivalam.in/" },
      { "@type": "ListItem", position: 2, name: "Girivalam Guide", item: CANONICAL },
    ],
  };

  if (authLoading) return null;
  // Declarative, so there is no navigation side effect during render.
  if (user) return <Navigate to="/girivalam-guide" replace />;

  return (
    <>
      <Helmet>
        {/* 55 characters, so it survives mobile truncation — 89% of this page's
            traffic is mobile. The old title led with "Spiritual Guide" while the
            impressions arrive on practical how-to and generic Girivalam queries,
            which is how 10,039 impressions converted at 0.80%. The Ashta Lingam
            reference intent is served by /ashta-lingam-temples, so this page no
            longer competes for it. */}
        <title>Girivalam Guide — How to Walk the 14 km Arunachala Path</title>
        <meta name="description" content="How to do Girivalam at Tiruvannamalai: where to start, which direction to walk, what to carry, how long the 14 km path takes, and all 8 Ashta Lingam stops." />
        <link rel="canonical" href={CANONICAL} />
        <meta property="og:title" content="Girivalam Guide — How to Walk the 14 km Arunachala Path" />
        <meta property="og:description" content="Where to start, which direction, what to carry, and how long the sacred 14 km walk around Arunachala Hill takes." />
        <meta property="og:type" content="article" />
        <meta property="og:url" content={CANONICAL} />
        <meta property="og:image" content="https://mygirivalam.in/images/girivalam-og-image.jpg" />
        <meta name="twitter:card" content="summary_large_image" />
        <script type="application/ld+json">{JSON.stringify(faqSchema)}</script>
        <script type="application/ld+json">{JSON.stringify(breadcrumbSchema)}</script>
      </Helmet>

      <div className="min-h-screen bg-background pt-20 md:pt-24">
        <SiteHeader />

        {/* Hero */}
        <section className="px-4 py-12 md:py-20 text-center">
          <div className="max-w-3xl mx-auto">
            <Badge variant="secondary" className="mb-4 px-4 py-1 text-sm">
              <Sparkles className="h-3.5 w-3.5 mr-1.5" />
              {t("guidePreview.badge")}
            </Badge>
            <h1 className="font-playfair text-4xl md:text-5xl font-bold mb-5 leading-tight">
              {t("guidePreview.heroTitle")} —{" "}
              <span className="text-accent">{t("guidePreview.heroHighlight")}</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed">
              {t("guidePreview.heroDesc")}
            </p>
            <div className="flex flex-wrap justify-center gap-4 mb-10">
              {[
                { icon: <MapPin className="h-4 w-4 text-primary" />, key: "guidePreview.stat1" },
                { icon: <Clock className="h-4 w-4 text-primary" />,  key: "guidePreview.stat2" },
                { icon: <Star className="h-4 w-4 text-primary" />,   key: "guidePreview.stat3" },
                { icon: <Compass className="h-4 w-4 text-primary" />,key: "guidePreview.stat4" },
              ].map((s, i) => (
                <div key={i} className="flex items-center gap-2 text-sm font-medium">{s.icon} {t(s.key)}</div>
              ))}
            </div>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button asChild size="lg" className="sacred-button">
                <Link to="/auth"><LogIn className="h-4 w-4 mr-2" />{t("guidePreview.signInCta")}</Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link to="/girivalam-map-preview"><MapPin className="h-4 w-4 mr-2" />{t("guidePreview.viewMapCta")}</Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Ashta Lingam grid */}
        <section className="px-4 pb-16" aria-labelledby="ashta-lingam-heading">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-10">
              <h2 id="ashta-lingam-heading" className="font-playfair text-3xl font-bold mb-3">
                {t("guidePreview.ashtaTitle")}
              </h2>
              <p className="text-muted-foreground max-w-xl mx-auto">{t("guidePreview.ashtaDesc")}</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {ASHTA_LINGAM_KEYS.map((lingam) => (
                <SpiritualCard key={lingam.id} className="p-5 flex flex-col gap-3 hover:shadow-lg transition-shadow">
                  <div className="flex items-start justify-between">
                    <div className="w-10 h-10 rounded-full bg-forest-night text-glow ring-1 ring-glow/30 flex items-center justify-center font-bold text-sm shadow">
                      {lingam.dirCode}
                    </div>
                    <Badge variant="outline" className="text-xs">{t(lingam.dirKey)}</Badge>
                  </div>
                  <div>
                    <h3 className="font-semibold text-base leading-tight">{t(lingam.nameKey)}</h3>
                  </div>
                  <div className="bg-primary/5 border border-primary/15 rounded-lg px-3 py-2">
                    <p className="text-xs text-primary font-medium italic">{lingam.mantra}</p>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed flex-1">{t(lingam.sigKey)}</p>
                  <div className="pt-1 border-t border-border/50 flex items-center gap-1.5 text-xs">
                    <Headphones className="h-3 w-3 flex-shrink-0 text-primary" />
                    <span className="text-primary text-xs font-medium">{t("guidePreview.audioNote")}</span>
                  </div>
                </SpiritualCard>
              ))}
            </div>
          </div>
        </section>

        {/* Preparation tips */}
        <section className="px-4 py-14 bg-muted/30" aria-labelledby="preparation-heading">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-10">
              <h2 id="preparation-heading" className="font-playfair text-3xl font-bold mb-3">
                {t("guidePreview.prepTitle")}
              </h2>
              <p className="text-muted-foreground">{t("guidePreview.prepDesc")}</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {PREP_KEYS.map((tip, i) => (
                <SpiritualCard key={i} className="p-5 flex gap-4">
                  <div className="mt-0.5 p-2 rounded-xl bg-primary/10 text-primary h-fit flex-shrink-0">{tip.icon}</div>
                  <div>
                    <h3 className="font-semibold mb-1 text-sm">{t(tip.titleKey)}</h3>
                    <p className="text-xs text-muted-foreground leading-relaxed">{t(tip.descKey)}</p>
                  </div>
                </SpiritualCard>
              ))}
            </div>
          </div>
        </section>

        {/* App features CTA */}
        <section className="px-4 py-14">
          <div className="max-w-4xl mx-auto">
            <SpiritualCard className="p-8 bg-gradient-to-br from-primary/5 via-background to-accent/5 text-center">
              <Badge className="mb-4">{t("guidePreview.ctaBadge")}</Badge>
              <h2 className="font-playfair text-2xl md:text-3xl font-bold mb-4">{t("guidePreview.ctaTitle")}</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8 text-sm">
                {FEATURE_KEYS.map((f, i) => (
                  <div key={i} className="flex flex-col items-center gap-2 p-3 rounded-xl bg-card border">
                    <div className="text-primary">{f.icon}</div>
                    <span className="font-medium text-xs text-center">{t(f.labelKey)}</span>
                  </div>
                ))}
              </div>
              <Button asChild size="lg" className="sacred-button">
                <Link to="/auth"><LogIn className="h-4 w-4 mr-2" />{t("guidePreview.ctaButton")}</Link>
              </Button>
            </SpiritualCard>
          </div>
        </section>

        {/* FAQ */}
        <section className="px-4 py-14 bg-muted/30" aria-labelledby="faq-heading">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-10">
              <h2 id="faq-heading" className="font-playfair text-3xl font-bold mb-3">{t("guidePreview.faqTitle")}</h2>
              <p className="text-muted-foreground">{t("guidePreview.faqDesc")}</p>
            </div>
            <div className="space-y-4">
              {FAQ_KEYS.map((faq, i) => (
                <SpiritualCard key={i} className="p-5">
                  <h3 className="font-semibold mb-2 flex items-center gap-2">
                    <ChevronRight className="h-4 w-4 text-primary flex-shrink-0" />{t(faq.qKey)}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed pl-6">{t(faq.aKey)}</p>
                </SpiritualCard>
              ))}
            </div>
          </div>
        </section>

        {/* Bottom CTA */}
        <section className="px-4 py-14 text-center">
          <div className="max-w-lg mx-auto">
            <AlertCircle className="h-8 w-8 text-primary mx-auto mb-4" />
            <h2 className="font-playfair text-2xl font-bold mb-3">{t("guidePreview.bottomTitle")}</h2>
            <p className="text-muted-foreground mb-6">{t("guidePreview.bottomDesc")}</p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button asChild size="lg" className="sacred-button">
                <Link to="/auth"><LogIn className="h-4 w-4 mr-2" />{t("guidePreview.signInFree")}</Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link to="/girivalam-map-preview"><MapPin className="h-4 w-4 mr-2" />{t("guidePreview.previewMap")}</Link>
              </Button>
            </div>
          </div>
        </section>

        <SiteFooter />
      </div>
    </>
  );
}
