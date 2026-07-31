import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { useNavigate } from "react-router-dom";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import { SpiritualCard } from "@/components/SpiritualCard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Bed, UtensilsCrossed, Users, Car, CheckCircle2,
  LogIn, MapPin, Phone, ChevronRight, Sparkles,
  Shield, Star, Heart, Calendar,
} from "lucide-react";

const SERVICE_CAT_KEYS = [
  {
    icon: <Bed className="h-7 w-7" />,
    titleKey: "servicesPreview.cat1Title", nativeKey: "servicesPreview.cat1Native", badgeKey: "servicesPreview.cat1Badge",
    descKey: "servicesPreview.cat1Desc",
    featureKeys: ["servicesPreview.cat1F1", "servicesPreview.cat1F2", "servicesPreview.cat1F3", "servicesPreview.cat1F4"],
    color: "from-amber-500 to-orange-500",
  },
  {
    icon: <UtensilsCrossed className="h-7 w-7" />,
    titleKey: "servicesPreview.cat2Title", nativeKey: "servicesPreview.cat2Native", badgeKey: "servicesPreview.cat2Badge",
    descKey: "servicesPreview.cat2Desc",
    featureKeys: ["servicesPreview.cat2F1", "servicesPreview.cat2F2", "servicesPreview.cat2F3", "servicesPreview.cat2F4"],
    color: "from-green-500 to-emerald-600",
  },
  {
    icon: <Users className="h-7 w-7" />,
    titleKey: "servicesPreview.cat3Title", nativeKey: "servicesPreview.cat3Native", badgeKey: "servicesPreview.cat3Badge",
    descKey: "servicesPreview.cat3Desc",
    featureKeys: ["servicesPreview.cat3F1", "servicesPreview.cat3F2", "servicesPreview.cat3F3", "servicesPreview.cat3F4"],
    color: "from-sky-500 to-blue-600",
  },
  {
    icon: <Car className="h-7 w-7" />,
    titleKey: "servicesPreview.cat4Title", nativeKey: "servicesPreview.cat4Native", badgeKey: "servicesPreview.cat4Badge",
    descKey: "servicesPreview.cat4Desc",
    featureKeys: ["servicesPreview.cat4F1", "servicesPreview.cat4F2", "servicesPreview.cat4F3", "servicesPreview.cat4F4"],
    color: "from-purple-500 to-violet-600",
  },
];

const WHY_KEYS = [
  { icon: <Shield className="h-5 w-5" />,   titleKey: "servicesPreview.why1Title", descKey: "servicesPreview.why1Desc" },
  { icon: <Star className="h-5 w-5" />,     titleKey: "servicesPreview.why2Title", descKey: "servicesPreview.why2Desc" },
  { icon: <Calendar className="h-5 w-5" />, titleKey: "servicesPreview.why3Title", descKey: "servicesPreview.why3Desc" },
  { icon: <Heart className="h-5 w-5" />,    titleKey: "servicesPreview.why4Title", descKey: "servicesPreview.why4Desc" },
];

const FAQ_KEYS = [
  { qKey: "servicesPreview.faq1Q", aKey: "servicesPreview.faq1A" },
  { qKey: "servicesPreview.faq2Q", aKey: "servicesPreview.faq2A" },
  { qKey: "servicesPreview.faq3Q", aKey: "servicesPreview.faq3A" },
  { qKey: "servicesPreview.faq4Q", aKey: "servicesPreview.faq4A" },
  { qKey: "servicesPreview.faq5Q", aKey: "servicesPreview.faq5A" },
  { qKey: "servicesPreview.faq6Q", aKey: "servicesPreview.faq6A" },
];

const STATS = [
  { value: "50+",     labelKey: "servicesPreview.staysLabel" },
  { value: "20+",     labelKey: "servicesPreview.foodLabel" },
  { value: "10,000+", labelKey: "servicesPreview.bookingsLabel" },
  { value: "4.8★",   labelKey: "servicesPreview.ratingLabel" },
];

export default function ServicesPreview() {
  const { user, loading: authLoading } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  if (authLoading) return null;
  if (user) {
    navigate("/girivalam-services", { replace: true });
    return null;
  }

  // JSON-LD schemas
  useEffect(() => {
    const faqSchema = document.createElement("script");
    faqSchema.type = "application/ld+json";
    faqSchema.text = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: FAQ_KEYS.map(f => ({
        "@type": "Question",
        name: t(f.qKey),
        acceptedAnswer: { "@type": "Answer", text: t(f.aKey) },
      })),
    });
    const localBiz = document.createElement("script");
    localBiz.type = "application/ld+json";
    localBiz.text = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "TouristInformationCenter",
      name: "MyGirivalam — Tiruvannamalai Pilgrimage Services",
      description: "Book accommodation, food, guides and transport for Girivalam pilgrimage in Tiruvannamalai.",
      url: "https://mygirivalam.in/girivalam-services-preview",
      address: { "@type": "PostalAddress", addressLocality: "Tiruvannamalai", addressRegion: "Tamil Nadu", addressCountry: "IN" },
    });
    const breadcrumb = document.createElement("script");
    breadcrumb.type = "application/ld+json";
    breadcrumb.text = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: "https://mygirivalam.in/" },
        { "@type": "ListItem", position: 2, name: "Services", item: "https://mygirivalam.in/girivalam-services-preview" },
      ],
    });
    document.head.append(faqSchema, localBiz, breadcrumb);
    return () => { [faqSchema, localBiz, breadcrumb].forEach(s => document.head.removeChild(s)); };
  }, []);

  return (
    <>
      <Helmet>
        <title>Girivalam Services — Accommodation, Food, Guides &amp; Transport Tiruvannamalai | MyGirivalam</title>
        <meta name="description" content="Book accommodation, pure vegetarian food, local guides and transport for Girivalam pilgrimage in Tiruvannamalai. Verified services for Pournami and year-round pilgrims." />
        <meta name="keywords" content="Tiruvannamalai accommodation, Girivalam services, Tiruvannamalai hotels, Arunachala guide, Girivalam transport, Tiruvannamalai food, pilgrim services Tamil Nadu" />
        <link rel="canonical" href="https://mygirivalam.in/girivalam-services" />
        <meta property="og:title" content="Girivalam Services — Accommodation, Guides &amp; Transport in Tiruvannamalai" />
        <meta property="og:description" content="Book verified accommodation, food, guides and transport for your Girivalam pilgrimage." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://mygirivalam.in/girivalam-services-preview" />
        <meta property="og:image" content="https://mygirivalam.in/og-services.jpg" />
        <meta name="twitter:card" content="summary_large_image" />
      </Helmet>

      <div className="min-h-screen bg-background pt-20 md:pt-24">
        <SiteHeader />

        {/* Hero */}
        <section className="px-4 py-12 md:py-20 text-center">
          <div className="max-w-3xl mx-auto">
            <Badge variant="secondary" className="mb-4 px-4 py-1 text-sm">
              <Sparkles className="h-3.5 w-3.5 mr-1.5" />
              {t("servicesPreview.badge")}
            </Badge>
            <h1 className="font-playfair text-4xl md:text-5xl font-bold mb-5 leading-tight">
              {t("servicesPreview.heroTitle")} —{" "}
              <span className="text-primary">{t("servicesPreview.heroHighlight")}</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed">
              {t("servicesPreview.heroDesc")}
            </p>
            <div className="flex flex-wrap justify-center gap-4 mb-10">
              <div className="flex items-center gap-2 text-sm font-medium"><Bed className="h-4 w-4 text-primary" /> {t("servicesPreview.stat1")}</div>
              <div className="flex items-center gap-2 text-sm font-medium"><UtensilsCrossed className="h-4 w-4 text-primary" /> {t("servicesPreview.stat2")}</div>
              <div className="flex items-center gap-2 text-sm font-medium"><Users className="h-4 w-4 text-primary" /> {t("servicesPreview.stat3")}</div>
              <div className="flex items-center gap-2 text-sm font-medium"><MapPin className="h-4 w-4 text-primary" /> Tiruvannamalai</div>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button asChild size="lg" className="sacred-button">
                <Link to="/auth"><LogIn className="h-4 w-4 mr-2" />{t("servicesPreview.signInCta")}</Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link to="/girivalam-guide-preview"><MapPin className="h-4 w-4 mr-2" />{t("servicesPreview.guideCta")}</Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Service categories */}
        <section className="px-4 pb-16" aria-labelledby="services-heading">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-10">
              <h2 id="services-heading" className="font-playfair text-3xl font-bold mb-3">{t("servicesPreview.availTitle")}</h2>
              <p className="text-muted-foreground max-w-xl mx-auto">{t("servicesPreview.availDesc")}</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {SERVICE_CAT_KEYS.map((cat, i) => (
                <SpiritualCard key={i} className="p-6 flex flex-col gap-4 hover:shadow-lg transition-shadow">
                  <div className="flex items-start gap-4">
                    <div className={`p-3 rounded-2xl bg-gradient-to-br ${cat.color} text-white flex-shrink-0 shadow`}>{cat.icon}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-0.5">
                        <h3 className="font-semibold text-lg leading-tight">{t(cat.titleKey)}</h3>
                        <Badge variant="outline" className="text-xs">{t(cat.badgeKey)}</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">{t(cat.nativeKey)}</p>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">{t(cat.descKey)}</p>
                  <ul className="space-y-1.5">
                    {cat.featureKeys.map((fk, fi) => (
                      <li key={fi} className="flex items-center gap-2 text-xs">
                        <CheckCircle2 className="h-3.5 w-3.5 text-green-500 flex-shrink-0" />
                        <span>{t(fk)}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="pt-2 border-t border-border/50">
                    <Button asChild variant="outline" size="sm" className="w-full">
                      <Link to="/auth">
                        <LogIn className="h-3.5 w-3.5 mr-1.5" />
                        {t("servicesPreview.signInToBrowse")} {t(cat.titleKey)}
                      </Link>
                    </Button>
                  </div>
                </SpiritualCard>
              ))}
            </div>
          </div>
        </section>

        {/* Why book */}
        <section className="px-4 py-14 bg-muted/30" aria-labelledby="why-heading">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-10">
              <h2 id="why-heading" className="font-playfair text-3xl font-bold mb-3">{t("servicesPreview.whyTitle")}</h2>
              <p className="text-muted-foreground">{t("servicesPreview.whyDesc")}</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {WHY_KEYS.map((item, i) => (
                <SpiritualCard key={i} className="p-5 text-center flex flex-col items-center gap-3">
                  <div className="p-3 rounded-2xl bg-primary/10 text-primary">{item.icon}</div>
                  <h3 className="font-semibold text-sm">{t(item.titleKey)}</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">{t(item.descKey)}</p>
                </SpiritualCard>
              ))}
            </div>
          </div>
        </section>

        {/* Stats */}
        <section className="px-4 py-12">
          <div className="max-w-4xl mx-auto">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              {STATS.map((stat, i) => (
                <SpiritualCard key={i} className="p-4">
                  <div className="font-playfair text-2xl font-bold text-primary mb-1">{stat.value}</div>
                  <div className="text-xs text-muted-foreground">{t(stat.labelKey)}</div>
                </SpiritualCard>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="px-4 py-8 pb-16">
          <div className="max-w-4xl mx-auto">
            <SpiritualCard className="p-8 bg-gradient-to-br from-primary/5 via-background to-accent/5 text-center">
              <h2 className="font-playfair text-2xl md:text-3xl font-bold mb-3">{t("servicesPreview.ctaTitle")}</h2>
              <p className="text-muted-foreground mb-6 max-w-lg mx-auto text-sm leading-relaxed">{t("servicesPreview.ctaDesc")}</p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button asChild size="lg" className="sacred-button">
                  <Link to="/auth"><LogIn className="h-4 w-4 mr-2" />{t("servicesPreview.ctaButton")}</Link>
                </Button>
                <Button asChild variant="outline" size="lg">
                  <Link to="/girivalam-map-preview"><MapPin className="h-4 w-4 mr-2" />{t("servicesPreview.viewMapCta")}</Link>
                </Button>
              </div>
            </SpiritualCard>
          </div>
        </section>

        {/* FAQ */}
        <section className="px-4 py-14 bg-muted/30" aria-labelledby="faq-heading">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-10">
              <h2 id="faq-heading" className="font-playfair text-3xl font-bold mb-3">{t("servicesPreview.faqTitle")}</h2>
              <p className="text-muted-foreground">{t("servicesPreview.faqDesc")}</p>
            </div>
            <div className="space-y-4">
              {FAQ_KEYS.map((faq, i) => (
                <SpiritualCard key={i} className="p-5">
                  <h3 className="font-semibold mb-2 flex items-start gap-2 text-sm">
                    <ChevronRight className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />{t(faq.qKey)}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed pl-6">{t(faq.aKey)}</p>
                </SpiritualCard>
              ))}
            </div>
          </div>
        </section>

        {/* Help */}
        <section className="px-4 py-10 text-center">
          <div className="max-w-lg mx-auto">
            <Phone className="h-7 w-7 text-primary mx-auto mb-3" />
            <h2 className="font-semibold text-lg mb-2">{t("servicesPreview.helpTitle")}</h2>
            <p className="text-muted-foreground text-sm mb-4">{t("servicesPreview.helpDesc")}</p>
            <Button asChild variant="outline">
              <Link to="/auth"><LogIn className="h-4 w-4 mr-2" />{t("servicesPreview.signInSupport")}</Link>
            </Button>
          </div>
        </section>

        <SiteFooter />
      </div>
    </>
  );
}
