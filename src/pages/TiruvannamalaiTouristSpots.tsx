import { Link } from "react-router-dom";
import {
  MapPin,
  Landmark,
  Mountain,
  Flower2,
  ArrowRight,
  Compass,
  Waves,
  Castle,
  Trees,
  Clock,
  HelpCircle,
} from "lucide-react";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import { SpiritualCard } from "@/components/SpiritualCard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Seo from "@/components/Seo";

// Landmark photos (Wikimedia Commons, CC BY-SA) — optimised to WebP by Vite.
import heroImg from "@/assets/tourist/arunachala-hill.jpg?w=1600&q=68&format=webp";
import templeImg from "@/assets/tourist/arunachaleswarar-temple.jpg?w=800&q=72&format=webp";
import hillImg from "@/assets/tourist/arunachala-hill.jpg?w=800&q=72&format=webp";
import ramanaImg from "@/assets/tourist/ramana-ashram.jpg?w=800&q=72&format=webp";
import gingeeImg from "@/assets/tourist/gingee-fort.jpg?w=800&q=72&format=webp";
import sathanurImg from "@/assets/tourist/sathanur-dam.jpg?w=800&q=72&format=webp";
import javadhuImg from "@/assets/tourist/javadhu-hills.jpg?w=800&q=72&format=webp";

interface Spot {
  name: string;
  desc: string;
  /** Approx distance from Tiruvannamalai town centre. */
  distance?: string;
  /** Short category / highlight label. */
  tag?: string;
  /** Optional landmark photo (imported, optimised URL). */
  img?: string;
}

const TEMPLE_SITES: Spot[] = [
  {
    name: "Arunachaleswarar Temple (Annamalaiyar Temple)",
    tag: "Agni Lingam",
    distance: "Town centre",
    img: templeImg,
    desc: "One of India's largest Shiva temples and the spiritual heart of Tiruvannamalai, spread over ~25 acres. Dedicated to Lord Shiva as Arunachaleswarar — the Agni (fire) Lingam among the Pancha Bhoota Sthalams. Famous for its 66m eastern gopuram, the thousand-pillared hall, the Sivaganga and Ayyankulam tanks, and the Karthigai Deepam beacon lit atop Arunachala Hill.",
  },
  {
    name: "Girivalam Path",
    tag: "14 km sacred loop",
    distance: "Around the hill",
    img: hillImg,
    desc: "The ~14km road that circles Arunachala Hill, walked clockwise by devotees — especially on Pournami (full moon) nights. It passes all 8 Ashta Lingam temples plus many smaller shrines, water points and rest areas.",
  },
  {
    name: "Adi Annamalai Temple",
    tag: "Ancient Shiva temple",
    distance: "~6 km",
    desc: "An old and revered Shiva temple on the far side of Arunachala along the Girivalam path, believed to be one of the original shrines of the region. A quieter, atmospheric stop with fine sculpture.",
  },
  {
    name: "Pavazhakundru",
    tag: "Girivalam stop",
    distance: "On the path",
    desc: "A small hillock and shrine along the Girivalam path — a popular rest and prasadam point during Pournami, and associated with Ramana Maharshi's early years.",
  },
];

const ASHRAM_SITES: Spot[] = [
  {
    name: "Sri Ramanasramam (Ramana Ashram)",
    tag: "Meditation retreat",
    distance: "~2 km",
    img: ramanaImg,
    desc: "The ashram built around the samadhi of Sri Ramana Maharshi at the foot of Arunachala. A world-renowned centre for meditation and self-enquiry, with a shrine hall, library of rare books, and simple satvic meals.",
  },
  {
    name: "Virupaksha Cave",
    tag: "Om-shaped cave",
    distance: "~1.5 km climb",
    desc: "An Om-shaped cave on the slopes of Arunachala where Ramana Maharshi meditated for around 16 years. Reached by a short climb above Ramanasramam and still used for silent meditation.",
  },
  {
    name: "Skandashram",
    tag: "Hillside cave",
    distance: "~2 km climb",
    desc: "Set just above Virupaksha Cave, this was Ramana Maharshi's residence for several years. The short trek is rewarded with sweeping views over the temple and town.",
  },
  {
    name: "Mango Tree Cave (Mamara Guhai)",
    tag: "Meditation cave",
    distance: "On the hill",
    desc: "A quiet cave on Arunachala where Ramana Maharshi is said to have spent time in deep meditation. A peaceful, less-crowded spot for reflection.",
  },
  {
    name: "Seshadri Swamigal Ashram",
    tag: "Saint's samadhi",
    distance: "~2 km",
    desc: "Ashram and samadhi shrine of Seshadri Swamigal, a revered saint and contemporary of Ramana Maharshi, close to Ramanasramam.",
  },
  {
    name: "Yogi Ramsuratkumar Ashram",
    tag: "Modern mystic",
    distance: "~1 km",
    desc: "The serene ashram of the 20th-century mystic Yogi Ramsuratkumar, with a striking hall and gardens, visited by devotees from across India.",
  },
];

const NATURE_SITES: Spot[] = [
  {
    name: "Arunachala Hill Trek",
    tag: "Sacred summit",
    distance: "From the town",
    img: hillImg,
    desc: "The holy hill itself can be climbed via marked trails past caves and meditation spots to the peak. Best attempted before sunrise to beat the heat; go with a guide as trails are rugged.",
  },
  {
    name: "Sivaganga & Temple Tanks",
    tag: "Sacred tanks",
    distance: "Temple complex",
    desc: "The Sivaganga and Ayyankulam tanks within and beside the Arunachaleswarar Temple, used for ritual bathing and considered sacred by pilgrims.",
  },
];

const NEARBY_SITES: Spot[] = [
  {
    name: "Sathanur Dam",
    tag: "Picnic spot",
    distance: "~30 km",
    img: sathanurImg,
    desc: "A scenic dam across the Thenpennai (Ponnaiyar) river with landscaped parks, a crocodile farm and a fish grotto — a popular family picnic outing, especially after the monsoon.",
  },
  {
    name: "Gingee Fort (Senji Fort)",
    tag: "Historic fort",
    distance: "~37 km",
    img: gingeeImg,
    desc: "A dramatic hill fortress dating to the 13th century, expanded by the Vijayanagara empire and later the Marathas. Called the 'Troy of the East' for its formidable ramparts and hilltop citadel.",
  },
  {
    name: "Parvathamalai",
    tag: "Trekking hill temple",
    distance: "~25 km",
    desc: "A steep, sacred hill topped by the Mallikarjuna Swamy (Shiva) temple. A challenging trek popular with devotees and adventure seekers, best done in the cooler months and daylight hours.",
  },
  {
    name: "Tirumalai Jain Temple",
    tag: "Jain heritage",
    distance: "~40 km",
    desc: "An ancient Jain complex with temples, rock-cut caves and a towering statue of Neminatha — one of the tallest Jain images in Tamil Nadu, set amid quiet hills.",
  },
  {
    name: "Javadhu Hills",
    tag: "Hill station",
    distance: "~75 km",
    img: javadhuImg,
    desc: "A cool forested range with Beeman Falls, Komutteri Lake, the Kavalur (Vainu Bappu) Observatory and Amirthi forest — a scenic escape for a longer day trip.",
  },
  {
    name: "Padaveedu Village",
    tag: "Village of temples",
    distance: "~35 km",
    desc: "Historic settlement known as the 'village of temples', with remnants of 13th-century Sambuvarayar-era architecture and several old shrines.",
  },
];

const FAQS = [
  {
    q: "What is Tiruvannamalai famous for?",
    a: "Tiruvannamalai is famous for the Arunachaleswarar (Annamalaiyar) Temple, the sacred Arunachala Hill, and the Girivalam full-moon circumambulation. It is also a major meditation destination thanks to Sri Ramana Maharshi's ashram, and hosts the spectacular Karthigai Deepam festival.",
  },
  {
    q: "What are the best places to visit in Tiruvannamalai?",
    a: "The top places are the Arunachaleswarar Temple, Sri Ramanasramam, Virupaksha Cave and Skandashram on Arunachala Hill, the Girivalam path, and nearby excursions such as Sathanur Dam, Gingee Fort and Parvathamalai.",
  },
  {
    q: "How many days do you need in Tiruvannamalai?",
    a: "One to two days is enough to see the temple, the ashrams and caves on the hill, and to walk part of the Girivalam path. Add an extra day if you want to visit nearby attractions like Sathanur Dam, Gingee Fort or Javadhu Hills.",
  },
  {
    q: "What is the best time to visit Tiruvannamalai?",
    a: "November to February is the most comfortable, with cooler weather. Pournami (full moon) nights and the Karthigai Deepam festival (Nov–Dec) are the most auspicious times for Girivalam but draw very large crowds.",
  },
];

const SpotCard = ({ spot, FallbackIcon }: { spot: Spot; FallbackIcon: typeof Landmark }) => (
  <SpiritualCard className="overflow-hidden hover:shadow-lg transition-shadow">
    {/* Media */}
    <div className="relative aspect-[16/10] w-full overflow-hidden bg-gradient-to-br from-primary/15 to-primary/5">
      {spot.img ? (
        <img
          src={spot.img}
          alt={spot.name}
          loading="lazy"
          decoding="async"
          className="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center">
          <FallbackIcon className="h-10 w-10 text-primary/40" />
        </div>
      )}
      {spot.tag && (
        <Badge className="absolute left-3 top-3 bg-background/85 text-foreground border-transparent backdrop-blur-sm shadow-sm">
          {spot.tag}
        </Badge>
      )}
    </div>
    {/* Body */}
    <div className="p-6">
      <div className="flex items-start justify-between gap-3 mb-2">
        <h3 className="font-playfair text-xl font-bold">{spot.name}</h3>
        {spot.distance && (
          <span className="inline-flex items-center gap-1 text-xs text-muted-foreground whitespace-nowrap mt-1">
            <MapPin className="h-3 w-3" />
            {spot.distance}
          </span>
        )}
      </div>
      <p className="text-sm text-muted-foreground leading-relaxed">{spot.desc}</p>
    </div>
  </SpiritualCard>
);

const Section = ({
  icon: Icon,
  title,
  spots,
}: {
  icon: typeof Landmark;
  title: string;
  spots: Spot[];
}) => (
  <section className="mb-16">
    <div className="flex items-center gap-3 mb-6">
      <div className="p-3 bg-primary/10 rounded-xl">
        <Icon className="h-6 w-6 text-primary" />
      </div>
      <h2 className="font-playfair text-3xl font-bold">{title}</h2>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {spots.map((s) => (
        <SpotCard key={s.name} spot={s} FallbackIcon={Icon} />
      ))}
    </div>
  </section>
);

const TiruvannamalaiTouristSpots = () => {
  const allSpots = [...TEMPLE_SITES, ...ASHRAM_SITES, ...NATURE_SITES, ...NEARBY_SITES];

  return (
    <div className="min-h-screen bg-background">
      <Seo
        title="Tiruvannamalai Tourist Places — Temples, Ashrams, Arunachala Hill & Nearby Spots | MyGirivalam.in"
        description="Complete Tiruvannamalai tourist guide: Arunachaleswarar Temple, Ramana Ashram, Virupaksha Cave, Skandashram, Arunachala Hill trek, plus nearby Sathanur Dam, Gingee Fort, Parvathamalai & Javadhu Hills — with distances and tips."
        canonical="/tiruvannamalai-tourist-spots"
        type="article"
        jsonLd={[
          {
            "@context": "https://schema.org",
            "@type": "Article",
            headline:
              "Tiruvannamalai Tourist Places — Temples, Ashrams & Arunachala Hill Guide",
            description:
              "Guide to the top places to visit in Tiruvannamalai — temples, ashrams, caves, the Arunachala Hill trek and nearby excursions — alongside the sacred Girivalam path.",
            author: { "@type": "Organization", name: "MyGirivalam.in" },
            publisher: {
              "@type": "Organization",
              name: "MyGirivalam.in",
              logo: { "@type": "ImageObject", url: "https://mygirivalam.in/logo.svg" },
            },
            dateModified: new Date().toISOString().slice(0, 10),
            mainEntityOfPage: {
              "@type": "WebPage",
              "@id": "https://mygirivalam.in/tiruvannamalai-tourist-spots",
            },
          },
          {
            "@context": "https://schema.org",
            "@type": "ItemList",
            name: "Tourist places in Tiruvannamalai",
            itemListElement: allSpots.map((s, i) => ({
              "@type": "ListItem",
              position: i + 1,
              item: {
                "@type": "TouristAttraction",
                name: s.name,
                description: s.desc,
                address: {
                  "@type": "PostalAddress",
                  addressLocality: "Tiruvannamalai",
                  addressRegion: "Tamil Nadu",
                  addressCountry: "IN",
                },
              },
            })),
          },
          {
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: FAQS.map((f) => ({
              "@type": "Question",
              name: f.q,
              acceptedAnswer: { "@type": "Answer", text: f.a },
            })),
          },
          {
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              { "@type": "ListItem", position: 1, name: "Home", item: "https://mygirivalam.in/" },
              { "@type": "ListItem", position: 2, name: "Guides", item: "https://mygirivalam.in/guides" },
              {
                "@type": "ListItem",
                position: 3,
                name: "Tourist Spots",
                item: "https://mygirivalam.in/tiruvannamalai-tourist-spots",
              },
            ],
          },
        ]}
      />
      <SiteHeader />

      {/* Hero */}
      <div className="relative pt-24 pb-14 px-4 overflow-hidden">
        <img
          src={heroImg}
          alt="Arunachala Hill at dawn, Tiruvannamalai"
          className="absolute inset-0 h-full w-full object-cover"
          loading="eager"
          decoding="async"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/70 via-background/80 to-background" />
        <div className="relative max-w-4xl mx-auto text-center">
          <Badge variant="outline" className="mb-4 bg-primary/10 border-primary/30">
            <Landmark className="h-3 w-3 mr-1" />
            Places to Visit
          </Badge>
          <h1 className="font-playfair text-4xl md:text-6xl font-bold mb-4 text-foreground">
            Tiruvannamalai Tourist Places
          </h1>
          <p className="text-xl text-foreground/80 max-w-3xl mx-auto">
            Beyond the Girivalam path, Tiruvannamalai is home to one of India's great Shiva
            temples, the ashrams of Ramana Maharshi and other saints, sacred caves on Arunachala
            Hill, and a handful of scenic day-trips nearby.
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-12">
        <Section icon={Landmark} title="Temples & Sacred Sites" spots={TEMPLE_SITES} />
        <Section icon={Flower2} title="Ashrams, Caves & Meditation Spots" spots={ASHRAM_SITES} />
        <Section icon={Mountain} title="Arunachala Hill & Nature" spots={NATURE_SITES} />
        <Section icon={Compass} title="Nearby Excursions & Day Trips" spots={NEARBY_SITES} />

        {/* Quick reference distances */}
        <section className="mb-16">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-primary/10 rounded-xl">
              <Waves className="h-6 w-6 text-primary" />
            </div>
            <h2 className="font-playfair text-3xl font-bold">Distances at a Glance</h2>
          </div>
          <SpiritualCard className="p-2 md:p-4 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-muted-foreground border-b border-border">
                  <th className="p-3 font-medium">Place</th>
                  <th className="p-3 font-medium">Type</th>
                  <th className="p-3 font-medium">From town</th>
                </tr>
              </thead>
              <tbody>
                {[...NATURE_SITES, ...NEARBY_SITES].map((s) => (
                  <tr key={s.name} className="border-b border-border/50 last:border-0">
                    <td className="p-3 font-medium">{s.name}</td>
                    <td className="p-3 text-muted-foreground">{s.tag}</td>
                    <td className="p-3 text-muted-foreground whitespace-nowrap">{s.distance}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </SpiritualCard>
        </section>

        {/* Practical tips */}
        <section className="mb-16">
          <SpiritualCard className="p-8 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20 border-amber-200 dark:border-amber-800">
            <div className="flex items-center gap-3 mb-6">
              <Clock className="h-6 w-6 text-amber-600 dark:text-amber-400" />
              <h2 className="font-playfair text-3xl font-bold">Planning Your Visit</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                "Visit the temple early morning or after evening pooja to avoid the midday heat and crowds.",
                "Combine Ramanasramam, Virupaksha Cave and Skandashram into one walking route up the hill.",
                "Plan around Pournami if you also want to experience Girivalam — but expect very large crowds.",
                "Dress modestly when entering temples and ashrams; footwear is left outside.",
                "Carry water and a torch — shade and facilities are limited on the hill trails.",
                "Most ashrams observe quiet hours and silent meditation; check timings before visiting.",
                "For nearby spots like Sathanur Dam or Gingee Fort, hire a cab and set aside half a day.",
                "November to February is the most pleasant time to visit.",
              ].map((tip) => (
                <div
                  key={tip}
                  className="flex items-start gap-3 p-3 bg-white/50 dark:bg-background/50 rounded-lg"
                >
                  <ArrowRight className="h-5 w-5 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
                  <p className="text-foreground/90 text-sm">{tip}</p>
                </div>
              ))}
            </div>
          </SpiritualCard>
        </section>

        {/* FAQ */}
        <section className="mb-16">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-primary/10 rounded-xl">
              <HelpCircle className="h-6 w-6 text-primary" />
            </div>
            <h2 className="font-playfair text-3xl font-bold">Frequently Asked Questions</h2>
          </div>
          <div className="space-y-4">
            {FAQS.map((f) => (
              <SpiritualCard key={f.q} className="p-6">
                <h3 className="font-semibold text-lg mb-2">{f.q}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{f.a}</p>
              </SpiritualCard>
            ))}
          </div>
        </section>

        {/* Photo credits */}
        <p className="text-xs text-muted-foreground text-center mb-12">
          Photos via{" "}
          <a
            href="https://commons.wikimedia.org/wiki/Category:Tiruvannamalai"
            target="_blank"
            rel="noopener noreferrer"
            className="underline underline-offset-2 hover:text-primary"
          >
            Wikimedia Commons
          </a>{" "}
          contributors (CC BY-SA) — Arunachala Hill, Arunachaleswarar Temple, Sri Ramanasramam,
          Gingee Fort, Sathanur Dam &amp; Javadhu Hills.
        </p>

        {/* CTA */}
        <section className="text-center py-12 px-4 bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5 rounded-3xl">
          <h3 className="font-playfair text-3xl font-bold mb-3">Planning to Walk Girivalam Too?</h3>
          <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
            See the full route, distances, and the 8 Ashta Lingam temples along the way.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link to="/girivalam-distance-route">
              <Button size="lg" className="bg-primary hover:bg-primary/90">
                <MapPin className="h-4 w-4 mr-2" />
                View Route & Distances
              </Button>
            </Link>
            <Link to="/ashta-lingam-temples">
              <Button size="lg" variant="outline">
                <Castle className="h-4 w-4 mr-2" />
                Ashta Lingam Temples
              </Button>
            </Link>
            <Link to="/guides">
              <Button size="lg" variant="outline">
                <Trees className="h-4 w-4 mr-2" />
                More Girivalam Guides
              </Button>
            </Link>
          </div>
        </section>
      </div>

      <SiteFooter />
    </div>
  );
};

export default TiruvannamalaiTouristSpots;
