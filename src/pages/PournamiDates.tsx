import React, { useMemo } from "react";
import { Helmet } from "react-helmet-async";
import { addDays, format } from "date-fns";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import { Badge } from "@/components/ui/badge";
import { SpiritualCard } from "@/components/SpiritualCard";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { getPournamiForYear, usePournamiDates } from "@/hooks/get-pournamidates";
import { istTimeLabel } from "@/lib/pournami-astro";
import { crowdFor, type CrowdLevel } from "@/data/pournami-crowd";
import { currentMonth, monthRef } from "@/lib/girivalam-months";
import { useLanguage } from "@/contexts/LanguageContext";
import {
    Calendar,
    Flame,
    Milestone,
    Moon,
    Users,
    Clock,
    MapPin,
    ArrowRight,
    AlertCircle,
} from "lucide-react";

/**
 * One canonical URL for this page, used by the canonical tag, the breadcrumb and
 * every Event entry.
 *
 * The trailing slash matters: react-snap prerenders this route to a directory,
 * and Search Console shows Google has indexed the slashed form (1,055 impressions
 * in the 17 Nov sample) while the slashless twin picked up only 9. The canonical
 * tag used to point at the slashless one, so the tag and the indexed URL
 * disagreed. Aligning to the URL that already holds the equity is the safe
 * direction. `/pournami-dates` renders this same component and so emits this
 * same canonical, which is what consolidates the two routes.
 */
const CANONICAL = "https://mygirivalam.in/blog/pournami-dates-2025-2026/";

const PournamiDates = () => {
    const { dates, nextPournamiEntry, today } = usePournamiDates();
    const { t } = useLanguage();
    const crowdLabel = (c: CrowdLevel) =>
        t(c === "Very High" ? "pd.crowdVeryHigh" : c === "High" ? "pd.crowdHigh" : "pd.crowdMedium");

    // Rolling two-year window so the page never goes stale.
    const currentYear = new Date().getFullYear();
    const nextYear = currentYear + 1;

    const yearSections = useMemo(
        () =>
            [currentYear, nextYear].map((year) => ({
                year,
                items: getPournamiForYear(year).map((d) => ({
                    monthSlug: monthRef(d.dateObj.getFullYear(), d.dateObj.getMonth() + 1).slug,
                    month: format(d.dateObj, "MMMM"),
                    date: format(d.dateObj, "MMM d, yyyy"),
                    name: d.name,
                    crowd: crowdFor(d.name),
                    // The exact instant is the thing no competing calendar publishes.
                    moonTime: istTimeLabel(d.fullMoonAt),
                    uncertain: d.uncertain,
                })),
            })),
        [currentYear, nextYear]
    );

    /**
     * Event schema for the upcoming Pournami nights, self-updating.
     *
     * Times are written with an explicit +05:30 offset. The previous version
     * formatted them from the device clock, so the same page described a
     * different walk window depending on where the reader happened to be.
     * 6 PM–6 AM is the site's editorial walk window; the exact astronomical
     * instant goes in the description, where it can be stated as fact.
     */
    const eventSchema = useMemo(
        () =>
            dates
                .filter((d) => d.date >= today)
                .slice(0, 8)
                .map((d) => ({
                    "@context": "https://schema.org",
                    "@type": "Event",
                    name: `${d.name} Girivalam — ${format(d.dateObj, "MMMM yyyy")}`,
                    startDate: `${d.date}T18:00:00+05:30`,
                    endDate: `${format(addDays(d.dateObj, 1), "yyyy-MM-dd")}T06:00:00+05:30`,
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
                    description: `Sacred full moon Girivalam — the 14 km barefoot circumambulation of Arunachala Hill at Tiruvannamalai. Exact full moon: ${format(d.dateObj, "d MMMM yyyy")} at ${istTimeLabel(d.fullMoonAt)} IST.`,
                    organizer: { "@type": "Organization", name: "MyGirivalam.in", url: "https://mygirivalam.in" },
                    url: CANONICAL,
                })),
        [dates, today]
    );

    const articleSchema = useMemo(
        () => ({
            "@context": "https://schema.org",
            "@type": "Article",
            headline: `Pournami Girivalam Dates ${currentYear}-${nextYear} | Full Moon Calendar`,
            description: `Complete list of Pournami Girivalam dates for ${currentYear}-${nextYear}. Plan your sacred circumambulation during full moon at Tiruvannamalai.`,
            author: { "@type": "Organization", name: "MyGirivalam.in" },
            publisher: {
                "@type": "Organization",
                name: "MyGirivalam.in",
                logo: { "@type": "ImageObject", url: "https://mygirivalam.in/logo.svg" },
            },
            datePublished: "2025-01-14",
            dateModified: today,
            mainEntityOfPage: { "@type": "WebPage", "@id": CANONICAL },
        }),
        [currentYear, nextYear, today]
    );

    const breadcrumbSchema = useMemo(
        () => ({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
                { "@type": "ListItem", position: 1, name: "Home", item: "https://mygirivalam.in/" },
                { "@type": "ListItem", position: 2, name: "Blog", item: "https://mygirivalam.in/blog" },
                {
                    "@type": "ListItem",
                    position: 3,
                    name: `Pournami Dates ${currentYear}-${nextYear}`,
                    item: CANONICAL,
                },
            ],
        }),
        [currentYear, nextYear]
    );

    const nextDateLabel = format(nextPournamiEntry.dateObj, "EEE d MMM yyyy");
    const thisMonth = currentMonth();
    const metaDescription =
        `Next Girivalam: ${nextDateLabel} (${nextPournamiEntry.name}) — full moon ` +
        `${istTimeLabel(nextPournamiEntry.fullMoonAt)} IST. Every Pournami date for ` +
        `Tiruvannamalai ${currentYear} & ${nextYear} with timings and crowd levels.`;

    const getCrowdColor = (crowd: string) => {
        switch (crowd) {
            case "Very High":
                return "bg-kumkum/10 text-kumkum";
            case "High":
                return "bg-warning/10 text-warning";
            default:
                return "bg-success/10 text-success";
        }
    };

    return (
        <div className="min-h-screen bg-background">
            <Helmet>
                {/* Shorter than before: the old title ran to 70 characters and was
                    truncated on mobile, where 85% of this page's traffic comes from. */}
                <title>{`Girivalam Dates ${currentYear} & ${nextYear} — Pournami Calendar & Timings`}</title>
                {/* Answer-first. "girivalam dates 2026" drew 254 impressions and one
                    click in the 17 Nov sample; the snippet never contained a date.
                    This one leads with the next date and its exact full-moon time,
                    and needs no yearly edit. */}
                <meta name="description" content={metaDescription} />
                <link rel="canonical" href={CANONICAL} />
                <meta property="og:title" content={`Girivalam Dates ${currentYear} & ${nextYear} — Pournami Calendar`} />
                <meta property="og:description" content={metaDescription} />
                <meta property="og:url" content={CANONICAL} />
                {/* Rendered here rather than appended to document.head in an effect,
                    so react-snap captures it in the prerendered HTML. */}
                <script type="application/ld+json">{JSON.stringify(articleSchema)}</script>
                <script type="application/ld+json">{JSON.stringify(breadcrumbSchema)}</script>
                <script type="application/ld+json">{JSON.stringify(eventSchema)}</script>
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
                    <p className="text-xl text-muted-foreground mb-6 max-w-3xl mx-auto">
                        {t('pd.intro').replace('{years}', `${currentYear}-${nextYear}`)}
                    </p>

                    {/* The answer, above the fold and first in the DOM — this is what
                        the date queries are actually asking for. */}
                    <p className="mx-auto mb-8 inline-flex flex-wrap items-center justify-center gap-x-2 gap-y-1 rounded-2xl bg-primary/10 px-4 py-3 text-base ring-1 ring-primary/20">
                        <Moon className="h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
                        <span className="font-semibold text-foreground">{t('pd.nextGirivalam')}:</span>
                        <span className="font-semibold text-foreground">{nextDateLabel}</span>
                        <span className="text-muted-foreground">· {nextPournamiEntry.name}</span>
                        <span className="text-muted-foreground">
                            · {t('pd.fullMoon').replace('{time}', istTimeLabel(nextPournamiEntry.fullMoonAt))}
                        </span>
                    </p>

                    {/* "girivalam today", "this month girivalam date" and
                        "girivalam this month" are 1,153 impressions a quarter at
                        0.69% CTR — they need somewhere current to land. */}
                    <p className="mb-8">
                        <Link
                            to={`/girivalam-dates/${thisMonth.slug}`}
                            className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:text-primary/80"
                        >
                            {t('pd.thisMonth').replace('{month}', thisMonth.label)}
                            <ArrowRight className="h-4 w-4" aria-hidden="true" />
                        </Link>
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
                                    <p className="text-sm font-medium text-foreground/80 mb-1">
                                        {item.name}
                                    </p>
                                    {/* Month page link — carries the internal link graph for
                                        /girivalam-dates/<month>-<year> and gives month-specific
                                        queries somewhere of their own to land. */}
                                    <Link
                                        to={`/girivalam-dates/${item.monthSlug}`}
                                        className="mb-1 inline-block text-xs text-primary underline underline-offset-4 hover:text-primary/80"
                                    >
                                        {item.month} {section.year} Girivalam details
                                    </Link>
                                    {/* No competing calendar publishes the exact instant. */}
                                    <p className="mb-3 text-xs text-muted-foreground">
                                        {t('pd.fullMoon').replace('{time}', item.moonTime)}
                                        {item.uncertain && ` · ${t('pd.confirmDate')}`}
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

                {/* Related guides.
                    This page carries 1,055 impressions/day while
                    /girivalam-distance-route and /ashta-lingam-temples draw none, and
                    nothing here linked to either. Descriptive anchors, from the page
                    that actually has the authority to pass. */}
                <section className="mb-16">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Link to="/girivalam-distance-route" className="group">
                            <SpiritualCard className="h-full p-6 transition-shadow hover:shadow-lg">
                                <div className="flex items-center gap-3 mb-2">
                                    <Milestone className="h-5 w-5 text-primary" />
                                    <h3 className="font-playfair text-xl font-bold group-hover:text-primary">
                                        {t('pd.relatedDistance')}
                                    </h3>
                                </div>
                                <p className="text-sm text-muted-foreground">{t('pd.relatedDistanceDesc')}</p>
                            </SpiritualCard>
                        </Link>
                        <Link to="/ashta-lingam-temples" className="group">
                            <SpiritualCard className="h-full p-6 transition-shadow hover:shadow-lg">
                                <div className="flex items-center gap-3 mb-2">
                                    <Flame className="h-5 w-5 text-primary" />
                                    <h3 className="font-playfair text-xl font-bold group-hover:text-primary">
                                        {t('pd.relatedLingam')}
                                    </h3>
                                </div>
                                <p className="text-sm text-muted-foreground">{t('pd.relatedLingamDesc')}</p>
                            </SpiritualCard>
                        </Link>
                    </div>
                </section>

                {/* Best Time to Start */}
                <section className="mb-16">
                    <SpiritualCard className="p-8 bg-gradient-to-br from-primary/10 to-primary/10 border-primary/30">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-3 bg-primary/10 rounded-xl">
                                <Clock className="h-6 w-6 text-accent" />
                            </div>
                            <h2 className="font-playfair text-3xl font-bold">
                                {t('pd.bestTimeTitle')}
                            </h2>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="text-center p-4 bg-white/50 dark:bg-background/50 rounded-lg">
                                <p className="text-sm text-muted-foreground mb-2">{t('pd.idealStart')}</p>
                                <p className="text-2xl font-bold text-accent">
                                    6:00 PM - 8:00 PM
                                </p>
                                <p className="text-sm text-muted-foreground mt-2">
                                    {t('pd.idealDesc')}
                                </p>
                            </div>

                            <div className="text-center p-4 bg-kumkum/10 rounded-lg">
                                <p className="text-sm text-muted-foreground mb-2">{t('pd.avoid')}</p>
                                <p className="text-2xl font-bold text-kumkum">
                                    10:00 PM - 2:00 AM
                                </p>
                                <p className="text-sm text-muted-foreground mt-2">
                                    {t('pd.avoidDesc')}
                                </p>
                            </div>

                            <div className="text-center p-4 bg-success/10 rounded-lg">
                                <p className="text-sm text-muted-foreground mb-2">{t('pd.lessCrowded')}</p>
                                <p className="text-2xl font-bold text-success">
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
                    <SpiritualCard className="p-8 bg-gradient-to-br from-warning/10 to-warning/10 border-warning/30">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-3 bg-warning/10 rounded-xl">
                                <AlertCircle className="h-6 w-6 text-warning" />
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
                                    <ArrowRight className="h-5 w-5 text-warning mt-0.5 flex-shrink-0" />
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
