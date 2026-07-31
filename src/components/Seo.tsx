import { Helmet } from "react-helmet-async";

const SITE_URL = "https://mygirivalam.in";
const DEFAULT_IMAGE = `${SITE_URL}/images/girivalam-og-image.jpg`;

interface SeoProps {
  /** Page title (a concise, keyword-rich phrase — no site suffix needed). */
  title: string;
  /** Meta description, ~150–160 characters. */
  description: string;
  /** Canonical path ("/next-pournami") or absolute URL. */
  canonical: string;
  /** Absolute OG/Twitter image URL. Defaults to the site OG image. */
  image?: string;
  /** OG type — "website" (default) or "article". */
  type?: "website" | "article";
  /** If true, tell crawlers not to index this page. */
  noindex?: boolean;
  /**
   * Optional JSON-LD structured data (a single object or an array of them).
   * Use for FAQPage, Event, Article, HowTo, etc. — strong signals for both
   * Google rich results and AI answer engines (GEO).
   */
  jsonLd?: Record<string, unknown> | Record<string, unknown>[];
}

/**
 * Centralised per-page SEO/GEO metadata. Renders a unique title, description,
 * canonical URL, Open Graph / Twitter tags, and optional JSON-LD. Keeping this
 * in one component ensures every page ships consistent, crawlable metadata —
 * important because AI crawlers largely don't execute JS, so pre-rendered
 * (react-snap) output is what they read.
 */
const Seo = ({
  title,
  description,
  canonical,
  image = DEFAULT_IMAGE,
  type = "website",
  noindex = false,
  jsonLd,
}: SeoProps) => {
  const url = canonical.startsWith("http") ? canonical : `${SITE_URL}${canonical}`;
  const blocks = jsonLd ? (Array.isArray(jsonLd) ? jsonLd : [jsonLd]) : [];

  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={url} />
      {noindex && <meta name="robots" content="noindex, follow" />}

      {/* Open Graph */}
      <meta property="og:type" content={type} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={url} />
      <meta property="og:image" content={image} />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />

      {blocks.map((block, i) => (
        <script key={i} type="application/ld+json">
          {JSON.stringify(block)}
        </script>
      ))}
    </Helmet>
  );
};

export default Seo;
