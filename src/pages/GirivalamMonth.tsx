import { useMemo } from "react";
import { Link, useParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { addDays, format } from "date-fns";
import { AlertCircle, ArrowLeft, ArrowRight, Calendar, Clock, MapPin, Milestone, Moon, Users } from "lucide-react";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import { SpiritualCard } from "@/components/SpiritualCard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import NotFound from "@/pages/NotFound";
import { crowdFor } from "@/data/pournami-crowd";
import { isoToLocalDate, istTimeLabel, istToday } from "@/lib/pournami-astro";
import {
  currentMonth,
  isPublishedMonth,
  parseMonthSlug,
  pournamiInMonth,
  shiftMonth,
} from "@/lib/girivalam-months";

const SITE = "https://mygirivalam.in";

/**
 * One page per month of the Girivalam calendar, e.g. /girivalam-dates/october-2026.
 *
 * Every figure is computed by src/lib/pournami-astro.ts, so these pages need no
 * yearly maintenance and the URL space rolls forward on its own (see
 * scripts/generate-seo-routes.mjs, which keeps the sitemap and the prerender
 * list in step).
 */
const GirivalamMonth = () => {
  const { slug = "" } = useParams();
  const ref = useMemo(() => parseMonthSlug(slug), [slug]);
  const today = istToday();

  // An unparseable slug is a genuine 404, not an empty month page.
  if (!ref) return <NotFound />;

  const occurrences = pournamiInMonth(ref);
  const now = currentMonth();
  const isThisMonth = ref.slug === now.slug;
  const canonical = `${SITE}/girivalam-dates/${ref.slug}/`;

  // Any month can be computed, but an unbounded crawlable URL space is a crawl
  // budget problem — months outside the published window stay usable and
  // linkable, just not indexable.
  const indexable = isPublishedMonth(ref);

  const previous = shiftMonth(ref, -1);
  const next = shiftMonth(ref, 1);

  const upcoming = occurrences.filter((o) => o.date >= today);
  const todays = occurrences.find((o) => o.date === today);

  /** The sentence that has to answer the query before anyone clicks. */
  const answer = (() => {
    if (occurrences.length === 0) {
      return `There is no Pournami Girivalam in ${ref.label} — the full moon falls outside this calendar month.`;
    }
    const list = occurrences
      .map((o) => `${format(isoToLocalDate(o.date), "EEEE d MMMM")} (${o.name}), full moon at ${istTimeLabel(o.fullMoonAt)} IST`)
      .join("; and ");
    const count = occurrences.length === 1 ? "is 1 Pournami Girivalam" : `are ${occurrences.length} Pournami Girivalams`;
    return `There ${count} in ${ref.label}: ${list}.`;
  })();

  const metaDescription =
    occurrences.length > 0
      ? `Girivalam dates in ${ref.label}: ${occurrences
          .map((o) => `${format(isoToLocalDate(o.date), "EEE d MMM")} (${o.name}) — full moon ${istTimeLabel(o.fullMoonAt)} IST`)
          .join(", ")}. Timings, crowd levels and the 14 km route map.`
      : `No Pournami Girivalam falls in ${ref.label}. See the nearest Girivalam dates, timings and the 14 km Arunachala route map.`;

  const eventSchema = occurrences.map((o) => ({
    "@context": "https://schema.org",
    "@type": "Event",
    name: `${o.name} Girivalam — ${ref.label}`,
    startDate: `${o.date}T18:00:00+05:30`,
    endDate: `${format(addDays(isoToLocalDate(o.date), 1), "yyyy-MM-dd")}T06:00:00+05:30`,
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
    description: `Pournami Girivalam at Tiruvannamalai — the 14 km barefoot circumambulation of Arunachala Hill. Exact full moon: ${format(isoToLocalDate(o.date), "d MMMM yyyy")} at ${istTimeLabel(o.fullMoonAt)} IST.`,
    url: canonical,
  }));

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: `When is Girivalam in ${ref.label}?`,
        acceptedAnswer: { "@type": "Answer", text: answer },
      },
      {
        "@type": "Question",
        name: `How many km is the Girivalam walk?`,
        acceptedAnswer: {
          "@type": "Answer",
          text: "The Girivalam path is 14 km around Arunachala Hill, starting and ending at Arunachaleswarar Temple and walked clockwise past the 8 Ashta Lingam shrines. Most pilgrims take 4–6 hours barefoot.",
        },
      },
    ],
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: `${SITE}/` },
      { "@type": "ListItem", position: 2, name: "Girivalam Dates", item: `${SITE}/pournami-dates/` },
      { "@type": "ListItem", position: 3, name: `Girivalam Dates ${ref.label}`, item: canonical },
    ],
  };

  const crowdColor = (crowd: string) =>
    crowd === "Very High"
      ? "bg-kumkum/10 text-kumkum"
      : crowd === "High"
        ? "bg-warning/10 text-warning"
        : "bg-success/10 text-success";

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>{`Girivalam Dates ${ref.label} — Pournami Date & Timings`}</title>
        <meta name="description" content={metaDescription} />
        <link rel="canonical" href={canonical} />
        {!indexable && <meta name="robots" content="noindex, follow" />}
        <meta property="og:title" content={`Girivalam Dates ${ref.label}`} />
        <meta property="og:description" content={metaDescription} />
        <meta property="og:url" content={canonical} />
        <meta property="og:type" content="article" />
        <script type="application/ld+json">{JSON.stringify(breadcrumbSchema)}</script>
        <script type="application/ld+json">{JSON.stringify(faqSchema)}</script>
        {eventSchema.length > 0 && (
          <script type="application/ld+json">{JSON.stringify(eventSchema)}</script>
        )}
      </Helmet>

      <SiteHeader />

      <div className="relative pt-24 pb-10 px-4 bg-gradient-to-b from-primary/5 to-background">
        <div className="max-w-4xl mx-auto text-center">
          <Badge variant="outline" className="mb-4 bg-primary/10 border-primary/30">
            <Moon className="h-3 w-3 mr-1" />
            {isThisMonth ? "This month" : "Pournami Girivalam"}
          </Badge>
          <h1 className="font-playfair text-4xl md:text-5xl font-bold mb-4 text-foreground">
            Girivalam Dates in {ref.label}
          </h1>
          {/* The answer, first in the DOM and above the fold. */}
          <p className="mx-auto max-w-2xl text-lg text-muted-foreground">{answer}</p>

          {/* "girivalam today" and "this month girivalam date" both land here. */}
          {isThisMonth && (
            <p className="mx-auto mt-5 inline-flex items-center gap-2 rounded-2xl bg-primary/10 px-4 py-3 text-base ring-1 ring-primary/20">
              <Clock className="h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
              <span className="font-semibold text-foreground">
                {todays
                  ? "Today is Pournami — Girivalam is tonight."
                  : upcoming.length > 0
                    ? `Today is not Pournami. The next Girivalam this month is ${format(isoToLocalDate(upcoming[0].date), "EEEE d MMMM")}.`
                    : "Today is not Pournami, and this month's Girivalam has passed."}
              </span>
            </p>
          )}
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-10">
        {occurrences.length > 0 ? (
          <section className="mb-12">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {occurrences.map((o) => {
                const dateObj = isoToLocalDate(o.date);
                const crowd = crowdFor(o.name);
                const past = o.date < today;
                return (
                  <SpiritualCard key={o.date} className="p-6">
                    <div className="mb-3 flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm text-muted-foreground">{format(dateObj, "EEEE")}</p>
                        <p className="font-playfair text-2xl font-bold">{format(dateObj, "d MMMM yyyy")}</p>
                      </div>
                      <Moon className="h-5 w-5 shrink-0 text-primary" aria-hidden="true" />
                    </div>
                    <p className="mb-1 text-sm font-medium text-foreground/80">{o.name}</p>
                    <p className="mb-3 text-xs text-muted-foreground">
                      Full moon {istTimeLabel(o.fullMoonAt)} IST
                      {o.uncertain && " · confirm with the local panchangam"}
                    </p>
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge className={crowdColor(crowd)}>
                        <Users className="mr-1 h-3 w-3" />
                        {crowd} crowd
                      </Badge>
                      {past && <Badge variant="outline">Completed</Badge>}
                      {o.date === today && <Badge className="bg-primary text-primary-foreground">Today</Badge>}
                    </div>
                  </SpiritualCard>
                );
              })}
            </div>
          </section>
        ) : (
          <section className="mb-12">
            <SpiritualCard className="flex items-start gap-3 p-6">
              <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-warning" aria-hidden="true" />
              <p className="text-muted-foreground">
                A lunar month is about 29.5 days, so a Gregorian month occasionally contains no
                full moon at all. Check {previous.label} and {next.label} below, or the{" "}
                <Link to="/pournami-dates" className="text-primary underline underline-offset-4">
                  full Girivalam calendar
                </Link>
                .
              </p>
            </SpiritualCard>
          </section>
        )}

        {/* Month-to-month links: how a crawler discovers the rest of the set. */}
        <nav aria-label="Other months" className="mb-12 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Link to={`/girivalam-dates/${previous.slug}`} className="group">
            <SpiritualCard className="flex h-full items-center gap-3 p-5 transition-shadow hover:shadow-lg">
              <ArrowLeft className="h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
              <span>
                <span className="block text-xs text-muted-foreground">Previous month</span>
                <span className="font-semibold group-hover:text-primary">
                  Girivalam dates {previous.label}
                </span>
              </span>
            </SpiritualCard>
          </Link>
          <Link to={`/girivalam-dates/${next.slug}`} className="group">
            <SpiritualCard className="flex h-full items-center justify-between gap-3 p-5 transition-shadow hover:shadow-lg">
              <span>
                <span className="block text-xs text-muted-foreground">Next month</span>
                <span className="font-semibold group-hover:text-primary">
                  Girivalam dates {next.label}
                </span>
              </span>
              <ArrowRight className="h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
            </SpiritualCard>
          </Link>
        </nav>

        <section className="mb-12 grid grid-cols-1 gap-4 md:grid-cols-3">
          <Link to="/pournami-dates" className="group">
            <SpiritualCard className="h-full p-6 transition-shadow hover:shadow-lg">
              <Calendar className="mb-2 h-5 w-5 text-primary" aria-hidden="true" />
              <h2 className="font-playfair text-lg font-bold group-hover:text-primary">
                Full Pournami calendar
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Every Girivalam date with timings and crowd levels.
              </p>
            </SpiritualCard>
          </Link>
          <Link to="/girivalam-distance-route" className="group">
            <SpiritualCard className="h-full p-6 transition-shadow hover:shadow-lg">
              <Milestone className="mb-2 h-5 w-5 text-primary" aria-hidden="true" />
              <h2 className="font-playfair text-lg font-bold group-hover:text-primary">
                How many km is Girivalam?
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                The 14 km route, leg by leg, and how long it takes.
              </p>
            </SpiritualCard>
          </Link>
          <Link to="/ashta-lingam-temples" className="group">
            <SpiritualCard className="h-full p-6 transition-shadow hover:shadow-lg">
              <MapPin className="mb-2 h-5 w-5 text-primary" aria-hidden="true" />
              <h2 className="font-playfair text-lg font-bold group-hover:text-primary">
                All 8 Ashta Lingam temples
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Every shrine in route order, with distances.
              </p>
            </SpiritualCard>
          </Link>
        </section>

        <section className="rounded-3xl bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5 px-4 py-10 text-center">
          <h2 className="mb-3 font-playfair text-2xl font-bold">Walk it with live GPS</h2>
          <p className="mx-auto mb-6 max-w-xl text-muted-foreground">
            Follow the 14 km path on a live map, find the next Ashta Lingam shrine, and share your
            location with family as you walk.
          </p>
          <Link to="/girivalam-map">
            <Button size="lg">
              <MapPin className="mr-2 h-4 w-4" />
              Open the live map
            </Button>
          </Link>
        </section>
      </div>

      <SiteFooter />
    </div>
  );
};

export default GirivalamMonth;
