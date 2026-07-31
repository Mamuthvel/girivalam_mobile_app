import { Link } from "react-router-dom";
import {
  BookOpen,
  Milestone,
  Flame,
  Landmark,
  Moon,
  Clock,
  Sparkles,
  ShieldAlert,
  ArrowRight,
} from "lucide-react";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import { SpiritualCard } from "@/components/SpiritualCard";
import { Badge } from "@/components/ui/badge";
import Seo from "@/components/Seo";

const GUIDES = [
  {
    icon: BookOpen,
    title: "Complete Girivalam Guide",
    desc: "Everything a first-time pilgrim needs to know about walking Girivalam at Tiruvannamalai.",
    href: "/girivalam-guide",
  },
  {
    icon: Milestone,
    title: "Girivalam Distance & Route",
    desc: "The full 14km route broken into stages, with distances between each Ashta Lingam temple and how long it takes on foot, cycle, or by car.",
    href: "/girivalam-distance-route",
  },
  {
    icon: Flame,
    title: "Ashta Lingam Temples",
    desc: "Guide to the 8 sacred shrines guarding each direction around Arunachala Hill.",
    href: "/ashta-lingam-temples",
  },
  {
    icon: Landmark,
    title: "Tiruvannamalai Tourist Places",
    desc: "Temples, ashrams, caves, and hill trails to explore beyond the Girivalam path.",
    href: "/tiruvannamalai-tourist-spots",
  },
  {
    icon: Moon,
    title: "Pournami Dates 2025–2026",
    desc: "Full moon calendar for planning your Girivalam around the most auspicious nights.",
    href: "/pournami-dates",
  },
  {
    icon: Clock,
    title: "Next Pournami Countdown",
    desc: "Live countdown to the next full moon, weather, checklist, and route information.",
    href: "/next-pournami",
  },
  {
    icon: Sparkles,
    title: "Spiritual Resources",
    desc: "Mantras, stories, and practices to deepen your Girivalam experience.",
    href: "/spiritual-resources",
  },
  {
    icon: ShieldAlert,
    title: "Emergency Contacts",
    desc: "Police, medical, and helpline numbers to keep handy during your pilgrimage.",
    href: "/emergency-contacts",
  },
];

const Guides = () => {
  return (
    <div className="min-h-screen bg-background">
      <Seo
        title="Girivalam Guides — Route, Temples, Dates & Tourist Places | MyGirivalam.in"
        description="All MyGirivalam.in guides in one place: Girivalam route & distance, the 8 Ashta Lingam temples, Tiruvannamalai tourist places, Pournami dates, and more."
        canonical="/guides"
        jsonLd={[
          {
            "@context": "https://schema.org",
            "@type": "CollectionPage",
            name: "Girivalam Guides",
            description:
              "Collection of guides covering the Girivalam route, the 8 Ashta Lingam temples, Tiruvannamalai tourist places, and Pournami dates.",
            url: "https://mygirivalam.in/guides",
          },
          {
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              { "@type": "ListItem", position: 1, name: "Home", item: "https://mygirivalam.in/" },
              { "@type": "ListItem", position: 2, name: "Guides", item: "https://mygirivalam.in/guides" },
            ],
          },
        ]}
      />
      <SiteHeader />

      {/* Hero */}
      <div className="relative pt-24 pb-12 px-4 bg-gradient-to-b from-primary/5 to-background">
        <div className="max-w-4xl mx-auto text-center">
          <Badge variant="outline" className="mb-4 bg-primary/10 border-primary/30">
            <BookOpen className="h-3 w-3 mr-1" />
            All Guides
          </Badge>
          <h1 className="font-playfair text-4xl md:text-6xl font-bold mb-4 text-foreground">
            Girivalam Guides
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Everything you need to plan a sacred Girivalam at Tiruvannamalai — route and
            distance, the 8 Ashta Lingam temples, Pournami dates, nearby tourist places, and
            practical safety information.
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {GUIDES.map((g) => (
            <Link key={g.href} to={g.href} className="block h-full">
              <SpiritualCard className="p-6 h-full flex flex-col">
                <div className="p-3 bg-primary/10 rounded-xl w-fit mb-4">
                  <g.icon className="h-6 w-6 text-primary" />
                </div>
                <h2 className="font-playfair text-xl font-bold mb-2">{g.title}</h2>
                <p className="text-sm text-muted-foreground leading-relaxed flex-1">{g.desc}</p>
                <span className="inline-flex items-center gap-1 text-sm font-medium text-primary mt-4">
                  Read guide <ArrowRight className="h-4 w-4" />
                </span>
              </SpiritualCard>
            </Link>
          ))}
        </div>
      </div>

      <SiteFooter />
    </div>
  );
};

export default Guides;
