import React, { useEffect, useMemo } from "react";
import { Helmet } from "react-helmet-async";
import { format } from "date-fns";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import { Badge } from "@/components/ui/badge";
import { SpiritualCard } from "@/components/SpiritualCard";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { getPournamiForYear, usePournamiDates } from "@/hooks/get-pournamidates";
import { useLanguage } from "@/contexts/LanguageContext";
import {
    Calendar,
    Moon,
    Users,
    Clock,
    MapPin,
    ArrowRight,
    AlertCircle,
} from "lucide-react";

// Editorial crowd expectation per Purnima (festival months draw the largest crowds).
const CROWD_BY_NAME: Record<string, "Very High" | "High" | "Medium"> = {
    "Kartik Purnima": "Very High",      // Karthigai Deepam
    "Vaishakha Purnima": "Very High",   // Buddha Purnima
    "Magha Purnima": "Very High",
    "Phalguna Purnima": "Very High",    // Holi / Masi Magam
    "Ashadha Purnima": "Very High",     // Guru Purnima
    "Ashwin Purnima": "High",           // Sharad Purnima
    "Chaitra Purnima": "High",
    "Shravana Purnima": "High",
    "Margashirsha Purnima": "High",
    "Pausha Purnima": "High",
    "Bhadrapada Purnima": "Medium",
    "Jyeshtha Purnima": "Medium",
};

const crowdFor = (name: string): "Very High" | "High" | "Medium" => {
    const key = Object.keys(CROWD_BY_NAME).find((k) => name.startsWith(k));
    return key ? CROWD_BY_NAME[key] : "High";
};

const PournamiDates = () => {
    const { dates } = usePournamiDates();
    const { t } = useLanguage();
    const crowdLabel = (c: "Very High" | "High" | "Medium") =>
        t(c === "Very High" ? "pd.crowdVeryHigh" : c === "High" ? "pd.crowdHigh" : "pd.crowdMedium");

    // Rolling two-year window so the page never goes stale.
    const currentYear = new Date().getFullYear();
    const nextYear = currentYear + 1;

    const yearSections = useMemo(
        () =>
            [currentYear, nextYear].map((year) => ({
                year,
                items: getPournamiForYear(year).map((d) => ({
                    month: format(d.dateObj, "MMMM"),
                    date: format(d.dateObj, "MMM d, yyyy"),
                    name: d.name,
                    crowd: crowdFor(d.name),
                })),
            })),
        [currentYear, nextYear]
    );

    // Structured-data Events for the next upcoming Pournami dates (self-updating).
    const upcomingEvents = useMemo(() => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return dates
            .filter((d) => d.dateObj >= today)
            .slice(0, 8)
            .map((d) => {
                const start = new Date(d.dateObj);
                start.setHours(18, 0, 0, 0);
                const end = new Date(d.dateObj);
                end.setDate(end.getDate() + 1);
                end.setHours(6, 0, 0, 0);
                const fmt = (dt: Date) =>
                    `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, "0")}-${String(
                        dt.getDate()
                    ).padStart(2, "0")}T${String(dt.getHours()).padStart(2, "0")}:00`;
                return {
                    name: `Pournami Girivalam — ${format(d.dateObj, "MMMM yyyy")}`,
                    startDate: fmt(start),
                    endDate: fmt(end),
                };
            });
    }, [dates]);

    useEffect(() => {
        // Add Article Schema
        const script = document.createElement("script");
        script.type = "application/ld+json";
        script.text = JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Article",
            headline: `Pournami Girivalam Dates ${currentYear}-${nextYear} | Full Moon Calendar`,
            description:
                `Complete list of Pournami Girivalam dates for ${currentYear}-${nextYear}. Plan your sacred circumambulation during full moon at Tiruvannamalai.`,
            author: {
                "@type": "Organization",
                name: "MyGirivalam.in",
            },
            publisher: {
                "@type": "Organization",
                name: "MyGirivalam.in",
                logo: {
                    "@type": "ImageObject",
                    url: "https://mygirivalam.in/logo.svg",
                },
            },
            datePublished: "2025-01-14",
            dateModified: new Date().toISOString().slice(0, 10),
            mainEntityOfPage: {
                "@type": "WebPage",
                "@id": "https://mygirivalam.in/blog/pournami-dates-2025-2026",
            },
        });
        document.head.appendChild(script);

        // Add Breadcrumb Schema
        const breadcrumbScript = document.createElement("script");
        breadcrumbScript.type = "application/ld+json";
        breadcrumbScript.text = JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            "itemListElement": [{
                "@type": "ListItem",
                "position": 1,
                "name": "Home",
                "item": "https://mygirivalam.in/"
            }, {
                "@type": "ListItem",
                "position": 2,
                "name": "Blog",
                "item": "https://mygirivalam.in/blog"
            }, {
                "@type": "ListItem",
                "position": 3,
                "name": `Pournami Dates ${currentYear}-${nextYear}`,
                "item": "https://mygirivalam.in/blog/pournami-dates-2025-2026"
            }]
        });
        document.head.appendChild(breadcrumbScript);

        // Event schema for each upcoming Pournami Girivalam (self-updating).
        const eventScripts = upcomingEvents.map((ev) => {
            const s = document.createElement("script");
            s.type = "application/ld+json";
            s.text = JSON.stringify({
                "@context": "https://schema.org",
                "@type": "Event",
                name: ev.name,
                startDate: ev.startDate,
                endDate: ev.endDate,
                eventStatus: "https://schema.org/EventScheduled",
                eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
                isAccessibleForFree: true,
                location: {
                    "@type": "Place",
                    name: "Arunachala Girivalam Path",
                    address: {
                        "@type": "PostalAddress",
                        addressLocality: "Tiruvannamalai",
                        addressRegion: "Tamil Nadu",
                        postalCode: "606601",
                        addressCountry: "IN",
                    },
                },
                description: "Sacred full moon Girivalam circumambulation of the 14km Arunachala Hill path in Tiruvannamalai. Millions of pilgrims walk barefoot during Pournami night.",
                organizer: {
                    "@type": "Organization",
                    name: "MyGirivalam.in",
                    url: "https://mygirivalam.in",
                },
                url: "https://mygirivalam.in/blog/pournami-dates-2025-2026",
            });
            document.head.appendChild(s);
            return s;
        });

        return () => {
            document.head.removeChild(script);
            document.head.removeChild(breadcrumbScript);
            eventScripts.forEach((s) => document.head.removeChild(s));
        };
    }, [currentYear, nextYear, upcomingEvents]);

    const getCrowdColor = (crowd: string) => {
        switch (crowd) {
            case "Very High":
                return "bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400";
            case "High":
                return "bg-orange-100 text-orange-700 dark:bg-orange-900/20 dark:text-orange-400";
            default:
                return "bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400";
        }
    };

    return (
        <div className="min-h-screen bg-background">
            <Helmet>
                <title>{`Girivalam Dates ${currentYear} & ${nextYear} — Full Pournami Calendar | MyGirivalam.in`}</title>
                <meta name="description" content={`Girivalam dates ${currentYear} & ${nextYear}: every Pournami (full moon) date for Tiruvannamalai, with crowd levels and prep tips. Plus a live map and GPS tracker for your walk.`} />
                <link rel="canonical" href="https://mygirivalam.in/blog/pournami-dates-2025-2026" />
            </Helmet>
            <SiteHeader />

            {/* Hero Section */}
            <div className="relative pt-24 pb-12 px-4 bg-gradient-to-b from-primary/5 to-background">
                <div className="max-w-4xl mx-auto text-center">
                    <Badge variant="outline" className="mb-4 bg-primary/10 border-primary/30">
                        <Moon className="h-3 w-3 mr-1" />
                        {t('pd.badge')}
                    </Badge>
                    <h1 className="font-playfair text-4xl md:text-6xl font-bold mb-4 text-foreground">
                        {t('pd.h1').replace('{years}', `${currentYear}-${nextYear}`)}
                    </h1>
                    <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
                        {t('pd.intro').replace('{years}', `${currentYear}-${nextYear}`)}
                    </p>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-6xl mx-auto px-4 py-12">
                {/* What is Pournami Girivalam */}
                <section className="mb-16">
                    <SpiritualCard className="p-8">
                        <h2 className="font-playfair text-3xl font-bold mb-4">
                            {t('pd.whatTitle')}
                        </h2>
                        <p className="text-lg text-muted-foreground leading-relaxed mb-4">
                            {t('pd.whatP1')}
                        </p>
                        <p className="text-lg text-muted-foreground leading-relaxed">
                            {t('pd.whatP2')}
                        </p>
                    </SpiritualCard>
                </section>

                {/* Yearly Dates (rolling, generated from the live Pournami calendar) */}
                {yearSections.map((section) => (
                    <section key={section.year} className="mb-16">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-3 bg-primary/10 rounded-xl">
                                <Calendar className="h-6 w-6 text-primary" />
                            </div>
                            <h2 className="font-playfair text-3xl font-bold">
                                {t('pd.yearTitle').replace('{year}', String(section.year))}
                            </h2>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {section.items.map((item, index) => (
                                <SpiritualCard key={index} className="p-6 hover:shadow-lg transition-shadow">
                                    <div className="flex justify-between items-start mb-3">
                                        <div>
                                            <p className="text-sm text-muted-foreground">{item.month}</p>
                                            <p className="font-semibold text-lg">{item.date}</p>
                                        </div>
                                        <Moon className="h-5 w-5 text-primary" />
                                    </div>
                                    <p className="text-sm font-medium text-foreground/80 mb-3">
                                        {item.name}
                                    </p>
                                    <Badge className={getCrowdColor(item.crowd)}>
                                        <Users className="h-3 w-3 mr-1" />
                                        {crowdLabel(item.crowd)}
                                    </Badge>
                                </SpiritualCard>
                            ))}
                        </div>
                    </section>
                ))}

                {/* Best Time to Start */}
                <section className="mb-16">
                    <SpiritualCard className="p-8 bg-gradient-to-br from-sky-50 to-blue-50 dark:from-sky-950/20 dark:to-blue-950/20 border-sky-200 dark:border-sky-800">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-3 bg-sky-100 dark:bg-sky-900/30 rounded-xl">
                                <Clock className="h-6 w-6 text-sky-600 dark:text-sky-400" />
                            </div>
                            <h2 className="font-playfair text-3xl font-bold">
                                {t('pd.bestTimeTitle')}
                            </h2>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="text-center p-4 bg-white/50 dark:bg-background/50 rounded-lg">
                                <p className="text-sm text-muted-foreground mb-2">{t('pd.idealStart')}</p>
                                <p className="text-2xl font-bold text-sky-600 dark:text-sky-400">
                                    6:00 PM - 8:00 PM
                                </p>
                                <p className="text-sm text-muted-foreground mt-2">
                                    {t('pd.idealDesc')}
                                </p>
                            </div>

                            <div className="text-center p-4 bg-red-50 dark:bg-red-950/20 rounded-lg">
                                <p className="text-sm text-muted-foreground mb-2">{t('pd.avoid')}</p>
                                <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                                    10:00 PM - 2:00 AM
                                </p>
                                <p className="text-sm text-muted-foreground mt-2">
                                    {t('pd.avoidDesc')}
                                </p>
                            </div>

                            <div className="text-center p-4 bg-green-50 dark:bg-green-950/20 rounded-lg">
                                <p className="text-sm text-muted-foreground mb-2">{t('pd.lessCrowded')}</p>
                                <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                                    3:00 AM - 6:00 AM
                                </p>
                                <p className="text-sm text-muted-foreground mt-2">
                                    {t('pd.lessDesc')}
                                </p>
                            </div>
                        </div>
                    </SpiritualCard>
                </section>

                {/* Tips for Pournami Girivalam */}
                <section className="mb-16">
                    <SpiritualCard className="p-8 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20 border-amber-200 dark:border-amber-800">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-3 bg-amber-100 dark:bg-amber-900/30 rounded-xl">
                                <AlertCircle className="h-6 w-6 text-amber-600 dark:text-amber-400" />
                            </div>
                            <h2 className="font-playfair text-3xl font-bold">
                                {t('pd.tipsTitle')}
                            </h2>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {[
                                t('pd.tip1'),
                                t('pd.tip2'),
                                t('pd.tip3'),
                                t('pd.tip4'),
                                t('pd.tip5'),
                                t('pd.tip6'),
                                t('pd.tip7'),
                                t('pd.tip8'),
                            ].map((tip, index) => (
                                <div
                                    key={index}
                                    className="flex items-start gap-3 p-3 bg-white/50 dark:bg-background/50 rounded-lg"
                                >
                                    <ArrowRight className="h-5 w-5 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
                                    <p className="text-foreground/90">{tip}</p>
                                </div>
                            ))}
                        </div>
                    </SpiritualCard>
                </section>

                {/* CTA Section */}
                <section className="text-center py-12 px-4 bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5 rounded-3xl">
                    <h3 className="font-playfair text-3xl font-bold mb-3">
                        {t('pd.ctaTitle')}
                    </h3>
                    <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
                        {t('pd.ctaDesc')}
                    </p>
                    <div className="flex flex-wrap gap-4 justify-center">
                        <Link to="/girivalam-map">
                            <Button size="lg" className="bg-primary hover:bg-primary/90">
                                <MapPin className="h-4 w-4 mr-2" />
                                {t('pd.viewRouteMap')}
                            </Button>
                        </Link>
                        <Link to="/girivalam-services">
                            <Button size="lg" variant="outline">
                                {t('pd.bookServices')}
                            </Button>
                        </Link>
                        <Link to="/girivalam-guide">
                            <Button size="lg" variant="outline">
                                {t('pd.completeGuide')}
                            </Button>
                        </Link>
                    </div>
                </section>
            </div>
            <SiteFooter />
        </div>
    );
};

export default PournamiDates;
