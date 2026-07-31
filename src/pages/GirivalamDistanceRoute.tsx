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
} from "lucide-react";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import { SpiritualCard } from "@/components/SpiritualCard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Seo from "@/components/Seo";

// Cumulative distances derived from the mapped Girivalam path (src/data/girivalam-path.ts),
// matched to each Ashta Lingam temple's coordinates (src/data/landmarks.ts).
const STAGES = [
  { from: "Arunachaleswarar Temple (Start)", to: "Indra Lingam", direction: "East", cumulative: 0.2, leg: 0.2 },
  { from: "Indra Lingam", to: "Agni Lingam", direction: "South-East", cumulative: 1.6, leg: 1.4 },
  { from: "Agni Lingam", to: "Yama Lingam", direction: "South", cumulative: 3.3, leg: 1.7 },
  { from: "Yama Lingam", to: "Nirruti Lingam", direction: "South-West", cumulative: 5.1, leg: 1.8 },
  { from: "Nirruti Lingam", to: "Varuna Lingam", direction: "West", cumulative: 6.6, leg: 1.5 },
  { from: "Varuna Lingam", to: "Vayu Lingam", direction: "North-West", cumulative: 8.6, leg: 2.0 },
  { from: "Vayu Lingam", to: "Kubera Lingam", direction: "North", cumulative: 10.1, leg: 1.5 },
  { from: "Kubera Lingam", to: "Esanya Lingam", direction: "North-East", cumulative: 12.0, leg: 1.9 },
  { from: "Esanya Lingam", to: "Arunachaleswarar Temple (Finish)", direction: "East", cumulative: 13.8, leg: 1.8 },
];

const MODES = [
  { icon: Footprints, mode: "Walking (barefoot, traditional)", pace: "~2.5–3 km/h with stops", time: "4–6 hours" },
  { icon: Footprints, mode: "Walking (brisk, with footwear)", pace: "~4–5 km/h", time: "3–4 hours" },
  { icon: Bike, mode: "Cycle", pace: "~12–15 km/h", time: "50–70 minutes" },
  { icon: Car, mode: "Car / two-wheeler", pace: "~25–30 km/h (with traffic on Pournami)", time: "30–45 minutes" },
];

const GirivalamDistanceRoute = () => {
  return (
    <div className="min-h-screen bg-background">
      <Seo
        title="Girivalam Distance & Route Guide — How Many KM, How Long? | MyGirivalam.in"
        description="Tiruvannamalai Girivalam is a 14km circular walk around Arunachala Hill. See the full route, distance between each of the 8 Ashta Lingam temples, and how long it takes on foot, cycle, or by car."
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
            Route Guide
          </Badge>
          <h1 className="font-playfair text-4xl md:text-6xl font-bold mb-4 text-foreground">
            Girivalam Distance & Route
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            The sacred circumambulation of Arunachala Hill is a 14km clockwise path. Here's the
            exact route, the distance between each of the 8 Ashta Lingam temples, and how long
            it takes on foot, cycle, or by vehicle.
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-12">
        {/* Quick stats */}
        <section className="mb-16 grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Total Distance", value: "~14 km" },
            { label: "Walking Time", value: "4–6 hrs" },
            { label: "Ashta Lingam Stops", value: "8 temples" },
            { label: "Direction", value: "Clockwise" },
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
            <h2 className="font-playfair text-3xl font-bold">Route Stage by Stage</h2>
          </div>
          <p className="text-muted-foreground mb-6 max-w-3xl">
            Distances below are measured along the mapped Girivalam path used in our{" "}
            <Link to="/girivalam-map" className="text-primary hover:underline">
              live route map
            </Link>
            , from the temple to each of the 8 Ashta Lingam shrines and back. Figures are
            approximate — actual walking distance can vary slightly depending on the exact path
            taken.
          </p>
          <div className="overflow-x-auto rounded-xl border border-border">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-primary/5 text-left">
                  <th className="p-3 font-semibold">Stage</th>
                  <th className="p-3 font-semibold">Direction</th>
                  <th className="p-3 font-semibold">Leg Distance</th>
                  <th className="p-3 font-semibold">Cumulative</th>
                </tr>
              </thead>
              <tbody>
                {STAGES.map((s, i) => (
                  <tr key={i} className={i % 2 === 0 ? "bg-background" : "bg-muted/30"}>
                    <td className="p-3">
                      <span className="font-medium">{s.from}</span>
                      <ArrowRight className="inline h-3 w-3 mx-2 text-muted-foreground" />
                      <span>{s.to}</span>
                    </td>
                    <td className="p-3 text-muted-foreground">{s.direction}</td>
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
            <h2 className="font-playfair text-3xl font-bold">How Long Does Girivalam Take?</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {MODES.map((m) => (
              <SpiritualCard key={m.mode} className="p-6 flex items-start gap-4">
                <div className="p-3 bg-primary/10 rounded-xl shrink-0">
                  <m.icon className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-semibold text-foreground">{m.mode}</p>
                  <p className="text-sm text-muted-foreground mt-1">{m.pace}</p>
                  <p className="text-lg font-bold text-primary mt-2">{m.time}</p>
                </div>
              </SpiritualCard>
            ))}
          </div>
          <p className="text-sm text-muted-foreground mt-4">
            Times increase significantly on Pournami (full moon) nights when the path is
            crowded with lakhs of devotees — see our{" "}
            <Link to="/pournami-dates" className="text-primary hover:underline">
              Pournami dates calendar
            </Link>{" "}
            to plan around peak crowds.
          </p>
        </section>

        {/* CTA */}
        <section className="text-center py-12 px-4 bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5 rounded-3xl">
          <h3 className="font-playfair text-3xl font-bold mb-3">Walk the Route With Live Tracking</h3>
          <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
            Follow your progress along the 14km path in real time, with all 8 Ashta Lingam
            temples marked.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link to="/girivalam-map">
              <Button size="lg" className="bg-primary hover:bg-primary/90">
                <MapPin className="h-4 w-4 mr-2" />
                Open Live Map
              </Button>
            </Link>
            <Link to="/ashta-lingam-temples">
              <Button size="lg" variant="outline">
                Explore the 8 Temples
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
