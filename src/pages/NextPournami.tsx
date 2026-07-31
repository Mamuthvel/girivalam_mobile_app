import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { format, differenceInSeconds } from "date-fns";
import {
  Moon, Heart, Sparkles, Users, Sun, Sunrise, Sunset, MapPin,
  Play, BookOpen, Bell, HeartHandshake, ShieldCheck, Utensils,
  Clock, Check, Volume2, ArrowLeft
} from "lucide-react";
import { usePournamiDates } from "@/hooks/get-pournamidates";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import WeatherWidget from "@/components/WeatherWidget";
import Seo from "@/components/Seo";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";

const TAMIL_MONTHS: Record<string, string> = {
  January: "தை (Thai)", February: "மாசி (Maasi)", March: "பங்குனி (Panguni)",
  April: "சித்திரை (Chithirai)", May: "வைகாசி (Vaikasi)", June: "ஆனி (Aani)",
  July: "ஆடி (Aadi)", August: "ஆவணி (Aavani)", September: "புரட்டாசி (Purattasi)",
  October: "ஐப்பசி (Aippasi)", November: "கார்த்திகை (Karthigai)", December: "மார்கழி (Margazhi)",
};

const CHECKLIST = [
  "Drink enough water",
  "Wear comfortable clothes",
  "Carry torch",
  "Keep slippers if needed",
  "Mobile fully charged",
  "Power bank",
  "Offer flowers",
  "Maintain silence",
  "Respect other devotees",
];

const BENEFITS = [
  { icon: Sparkles, title: "Spiritual Benefits", desc: "Deepens devotion and inner awareness." },
  { icon: Heart, title: "Mental Peace", desc: "Calms the mind, dissolves anxiety." },
  { icon: Moon, title: "Remove Negative Karma", desc: "Sincere steps purify past deeds." },
  { icon: Sun, title: "Full Moon Energy", desc: "Absorb the sacred lunar vibrations." },
  { icon: Users, title: "Blessings for Family", desc: "Prayers extend to loved ones." },
  { icon: HeartHandshake, title: "Career & Prosperity", desc: "Grace of Arunachaleswarar for all paths." },
];

const START_WINDOWS = [
  { icon: Sunrise, title: "Early Morning", time: "4:00 – 6:00 AM", crowd: "Low", color: "text-green-600" },
  { icon: Sun, title: "Evening", time: "5:00 – 7:00 PM", crowd: "Moderate", color: "text-yellow-600" },
  { icon: Sunset, title: "Night", time: "9:00 PM – 12:00 AM", crowd: "High", color: "text-amber-600" },
  { icon: Moon, title: "Full Moon Peak", time: "Midnight", crowd: "Very High", color: "text-red-600" },
];

const SAFETY_TIPS = [
  "Stay hydrated throughout the walk.",
  "Walk on the left side of the path.",
  "Avoid plastic — keep Arunachala clean.",
  "Keep children close at all times.",
  "Follow police and volunteer instructions.",
  "Respect the holy path and fellow devotees.",
];

function useCountdown(target: Date) {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);
  const diff = Math.max(0, differenceInSeconds(target, now));
  return {
    days: Math.floor(diff / 86400),
    hours: Math.floor((diff % 86400) / 3600),
    minutes: Math.floor((diff % 3600) / 60),
    seconds: diff % 60,
  };
}

const CHECKLIST_KEY = "next-pournami-checklist";
const SANKALP_KEY = "next-pournami-sankalp";

const NextPournami = () => {
  const { nextPournami, dates } = usePournamiDates();
  const countdown = useCountdown(nextPournami);
  const monthName = format(nextPournami, "MMMM");
  const info = dates.find(d => d.dateObj.toDateString() === nextPournami.toDateString());
  const pournamiName = info?.name || `${monthName} Pournami`;

  const [checked, setChecked] = useState<Record<string, boolean>>({});
  const [sankalp, setSankalp] = useState(false);

  useEffect(() => {
    try {
      const c = localStorage.getItem(CHECKLIST_KEY);
      if (c) setChecked(JSON.parse(c));
      setSankalp(localStorage.getItem(SANKALP_KEY) === "true");
    } catch {}
  }, []);

  useEffect(() => {
    localStorage.setItem(CHECKLIST_KEY, JSON.stringify(checked));
  }, [checked]);

  const checkedCount = useMemo(() => Object.values(checked).filter(Boolean).length, [checked]);
  const progressPct = (checkedCount / CHECKLIST.length) * 100;

  const acceptSankalp = () => {
    setSankalp(true);
    localStorage.setItem(SANKALP_KEY, "true");
    toast({ title: "🙏 Sankalp accepted", description: "May Arunachala guide every step." });
  };

  const playMantra = () => {
    try {
      const u = new SpeechSynthesisUtterance("Om Arunachaleswaraya Namaha");
      u.rate = 0.75;
      window.speechSynthesis.speak(u);
    } catch {
      toast({ title: "Audio unavailable", description: "Chant mentally with devotion." });
    }
  };

  const remindMe = () => {
    toast({ title: "🔔 Reminder set", description: `We'll gently remind you before ${pournamiName}.` });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-primary/5">
      <Seo
        title="Next Pournami Girivalam Date — Full Moon Countdown | MyGirivalam.in"
        description="Find the next Pournami (full moon) Girivalam date at Tiruvannamalai with a live countdown, timings, weather, and a pilgrim checklist for walking the sacred 14km Arunachala path."
        canonical="/next-pournami"
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "FAQPage",
          "mainEntity": [
            {
              "@type": "Question",
              "name": "When is the next Pournami Girivalam at Tiruvannamalai?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "Pournami Girivalam is performed on every full moon (Pournami) night at Tiruvannamalai. MyGirivalam.in shows the next Pournami date with a live countdown, moonrise and sunset timings, and weather so you can plan your walk around Arunachala Hill.",
              },
            },
            {
              "@type": "Question",
              "name": "Why is Pournami the best day for Girivalam?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "Pournami (full moon) is considered the most auspicious time for Girivalam. Devotees believe the full moon's energy amplifies the spiritual benefit of circumambulating Arunachala Hill, and hundreds of thousands gather at Tiruvannamalai on Pournami nights to walk the 14km path together.",
              },
            },
          ],
        }}
      />
      {/* Hero */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/30 via-primary/10 to-transparent" />
        <div className="absolute inset-0 opacity-20"
          style={{ backgroundImage: "radial-gradient(circle at 30% 40%, hsl(var(--primary)) 0%, transparent 50%)" }} />
        <div className="relative z-10 px-4 pt-6 pb-8 max-w-3xl mx-auto">
          <Link to="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary mb-4">
            <ArrowLeft className="h-4 w-4" /> Back to Home
          </Link>
          <div className="text-center space-y-3">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20">
              <Moon className="h-4 w-4 text-primary" />
              <span className="text-xs font-medium tracking-widest uppercase text-primary">Next Pournami</span>
            </div>
            <h1 className="font-playfair text-3xl md:text-5xl font-bold spiritual-gradient-text">
              {pournamiName}
            </h1>
            <p className="text-lg text-foreground/80">
              {format(nextPournami, "EEEE, MMMM d, yyyy")}
            </p>
            <p className="text-sm text-muted-foreground">
              {TAMIL_MONTHS[monthName]} • Nakshatra of Full Moon
            </p>

            {/* Countdown */}
            <div className="grid grid-cols-4 gap-2 max-w-md mx-auto pt-4">
              {[
                { label: "Days", val: countdown.days },
                { label: "Hours", val: countdown.hours },
                { label: "Min", val: countdown.minutes },
                { label: "Sec", val: countdown.seconds },
              ].map(x => (
                <div key={x.label} className="bg-background/70 backdrop-blur rounded-xl border border-primary/20 py-3">
                  <div className="text-2xl md:text-3xl font-bold text-primary tabular-nums">{x.val}</div>
                  <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{x.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 pb-24 space-y-8">
        {/* About */}
        <Section icon={BookOpen} title="About Pournami">
          <p className="text-sm md:text-base text-foreground/80 leading-relaxed">
            Pournami is the Full Moon day. Performing Girivalam around Arunachala on this
            sacred day is believed to remove sins, bring peace, improve health, and bestow
            Lord Arunachaleswarar's blessings.
          </p>
        </Section>

        {/* Benefits */}
        <Section icon={Heart} title="Why Devotees Perform Girivalam">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {BENEFITS.map(b => (
              <Card key={b.title} className="p-3 bg-primary/5 border-primary/10">
                <b.icon className="h-5 w-5 text-primary mb-2" />
                <div className="font-medium text-sm">{b.title}</div>
                <div className="text-xs text-muted-foreground mt-1">{b.desc}</div>
              </Card>
            ))}
          </div>
        </Section>

        {/* Checklist */}
        <Section icon={Check} title="Pournami Checklist">
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Progress</span>
              <span className="font-medium">{checkedCount}/{CHECKLIST.length} Ready</span>
            </div>
            <Progress value={progressPct} className="h-2" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2">
              {CHECKLIST.map(item => (
                <label key={item} className={cn(
                  "flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors",
                  checked[item] ? "bg-primary/10 border-primary/30" : "bg-card border-border hover:border-primary/20"
                )}>
                  <Checkbox
                    checked={!!checked[item]}
                    onCheckedChange={(v) => setChecked(s => ({ ...s, [item]: !!v }))}
                  />
                  <span className={cn("text-sm", checked[item] && "line-through text-muted-foreground")}>{item}</span>
                </label>
              ))}
            </div>
          </div>
        </Section>

        {/* Start Times */}
        <Section icon={Clock} title="Best Time to Start Girivalam">
          <div className="grid grid-cols-2 gap-3">
            {START_WINDOWS.map(w => (
              <Card key={w.title} className="p-3">
                <div className="flex items-start justify-between">
                  <w.icon className="h-5 w-5 text-primary" />
                  <Badge variant="outline" className={cn("text-[10px]", w.color)}>{w.crowd}</Badge>
                </div>
                <div className="font-medium text-sm mt-2">{w.title}</div>
                <div className="text-xs text-muted-foreground">{w.time}</div>
              </Card>
            ))}
          </div>
        </Section>

        {/* Weather */}
        <Section icon={Sun} title="Weather Forecast">
          <div className="rounded-xl overflow-hidden border border-border">
            <WeatherWidget />
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Sunrise ~6:15 AM • Sunset ~5:55 PM • Moonrise near sunset on Pournami
          </p>
        </Section>

        {/* Crowd */}
        <Section icon={Users} title="Live Crowd Status">
          <div className="flex items-center gap-3 p-4 rounded-xl bg-yellow-500/10 border border-yellow-500/20">
            <div className="h-3 w-3 rounded-full bg-yellow-500 animate-pulse" />
            <div>
              <div className="font-medium">Moderate Crowd</div>
              <div className="text-xs text-muted-foreground">Updated by admin • Peaks 6 PM – 9 PM</div>
            </div>
          </div>
        </Section>

        {/* Route */}
        <Section icon={MapPin} title="Route Information">
          <div className="grid grid-cols-2 gap-3 mb-3">
            <Stat label="Total Distance" value="14 km" />
            <Stat label="Est. Time" value="4–6 hrs" />
            <Stat label="Ashta Lingams" value="8 sacred" />
            <Stat label="Facilities" value="Water • Toilets • Medical" />
          </div>
          <Link to="/girivalam-map">
            <Button variant="outline" className="w-full">
              <MapPin className="h-4 w-4 mr-2" /> Open Interactive Map
            </Button>
          </Link>
        </Section>

        {/* Mantra */}
        <Section icon={Volume2} title="Pournami Mantra">
          <div className="text-center p-6 rounded-xl bg-primary/5 border border-primary/20">
            <p className="font-playfair text-2xl italic text-foreground/90 mb-4">
              "Om Arunachaleswaraya Namaha"
            </p>
            <Button onClick={playMantra} variant="outline">
              <Play className="h-4 w-4 mr-2" /> Play Chant
            </Button>
          </div>
        </Section>

        {/* Story */}
        <Section icon={BookOpen} title="Pournami Story">
          <p className="text-sm text-foreground/80 leading-relaxed">
            When Brahma and Vishnu quarreled over supremacy, Lord Shiva appeared as an
            infinite column of light — Arunachala. On Pournami nights, this sacred hill is
            said to radiate its purest energy. Circling it with devotion on this day is
            believed to grant liberation, as taught by the sages of Tiruvannamalai.
          </p>
        </Section>

        {/* Temple Timings */}
        <Section icon={Clock} title="Temple Timings">
          <div className="grid grid-cols-2 gap-2 text-sm">
            <Row k="Opening" v="5:30 AM" />
            <Row k="Special Pooja" v="6:00 AM" />
            <Row k="Deepa Aradhana" v="7:30 PM" />
            <Row k="Closing" v="9:30 PM" />
          </div>
          <Link to="/temple-home" className="text-xs text-primary hover:underline mt-3 inline-block">
            View full temple schedule →
          </Link>
        </Section>

        {/* Annadhanam */}
        <Section icon={Utensils} title="Annadhanam">
          <div className="space-y-2">
            {[
              { name: "Adi Annamalai Junction", time: "11 AM – 2 PM", status: "Available" },
              { name: "Pavazhakundru", time: "12 PM – 3 PM", status: "Available" },
              { name: "Yama Lingam", time: "6 PM – 9 PM", status: "Closed" },
            ].map(a => (
              <div key={a.name} className="flex items-center justify-between p-3 rounded-lg bg-card border">
                <div>
                  <div className="text-sm font-medium">{a.name}</div>
                  <div className="text-xs text-muted-foreground">{a.time}</div>
                </div>
                <Badge variant={a.status === "Available" ? "default" : "secondary"}>{a.status}</Badge>
              </div>
            ))}
          </div>
        </Section>

        {/* Safety */}
        <Section icon={ShieldCheck} title="Safety Tips">
          <ul className="space-y-2">
            {SAFETY_TIPS.map(t => (
              <li key={t} className="flex items-start gap-2 text-sm text-foreground/80">
                <Check className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                <span>{t}</span>
              </li>
            ))}
          </ul>
        </Section>

        {/* Sankalp */}
        <Section icon={HeartHandshake} title="Devotee Sankalp">
          <div className="p-5 rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 text-center">
            <p className="font-playfair italic text-foreground/90 mb-4">
              "I begin this Girivalam with devotion, humility, and faith.
              May Lord Arunachala guide every step."
            </p>
            <Button onClick={acceptSankalp} disabled={sankalp} className="w-full sm:w-auto">
              {sankalp ? "🙏 Sankalp Accepted" : "🙏 I Accept"}
            </Button>
          </div>
        </Section>

        {/* Bottom Actions */}
        <div className="grid grid-cols-2 gap-3 pt-4">
          <Link to="/my-girivalam"><Button className="w-full"><Play className="h-4 w-4 mr-2" />Start Girivalam</Button></Link>
          <Link to="/girivalam-map"><Button variant="outline" className="w-full"><MapPin className="h-4 w-4 mr-2" />Live Map</Button></Link>
          <Link to="/girivalam-guide"><Button variant="outline" className="w-full"><BookOpen className="h-4 w-4 mr-2" />Full Guide</Button></Link>
          <Button variant="outline" onClick={remindMe}><Bell className="h-4 w-4 mr-2" />Remind Me</Button>
          <Link to="/support-girivalam" className="col-span-2">
            <Button variant="secondary" className="w-full"><Heart className="h-4 w-4 mr-2" />Donate</Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

const Section = ({ icon: Icon, title, children }: { icon: any; title: string; children: React.ReactNode }) => (
  <section className="space-y-3">
    <div className="flex items-center gap-2">
      <Icon className="h-5 w-5 text-primary" />
      <h2 className="font-playfair text-xl font-semibold">{title}</h2>
    </div>
    {children}
  </section>
);

const Stat = ({ label, value }: { label: string; value: string }) => (
  <div className="p-3 rounded-lg bg-card border">
    <div className="text-xs text-muted-foreground">{label}</div>
    <div className="text-sm font-semibold mt-0.5">{value}</div>
  </div>
);

const Row = ({ k, v }: { k: string; v: string }) => (
  <div className="flex justify-between p-2 rounded bg-card border">
    <span className="text-muted-foreground">{k}</span>
    <span className="font-medium">{v}</span>
  </div>
);

export default NextPournami;
