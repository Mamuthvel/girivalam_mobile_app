import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import BadgeCelebration, { type CelebBadge } from "@/components/BadgeCelebration";
import {
  ArrowLeft, Activity, MessageSquare, TrendingUp, Footprints, MapPin,
  Clock, Users, User, Calendar, Loader2, AlertCircle, CheckCircle2,
  Timer, Star, Award,
} from "lucide-react";
import SiteHeader from "@/components/SiteHeader";
import { SpiritualCard } from "@/components/SpiritualCard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import CommunityFeed from "@/components/CommunityFeed";
import { useJourneyStats, type RecentJourney, type JourneyStats } from "@/hooks/useJourneyStats";

// ─── Achievement badges ──────────────────────────────────────────────────────

interface BadgeDef {
  emoji: string;
  title: string;
  desc: string;
  goal: number;
  value: (s: JourneyStats) => number;
}

const BADGES: BadgeDef[] = [
  { emoji: '🏔️', title: 'First Girivalam', desc: 'Complete your first round', goal: 1, value: s => s.completedGirivalams },
  { emoji: '🙏', title: 'Devotee', desc: 'Complete 3 Girivalams', goal: 3, value: s => s.completedGirivalams },
  { emoji: '🕉️', title: 'Pilgrim', desc: 'Complete 10 Girivalams', goal: 10, value: s => s.completedGirivalams },
  { emoji: '⭐', title: 'Sacred 25', desc: 'Complete 25 Girivalams', goal: 25, value: s => s.completedGirivalams },
  { emoji: '👥', title: 'Group Walker', desc: 'Walk with a group', goal: 1, value: s => s.groupCount },
  { emoji: '🥾', title: '100 KM Club', desc: 'Walk 100 km in total', goal: 100, value: s => Math.floor(s.totalDistance) },
  { emoji: '🔥', title: 'On a Streak', desc: '3 months in a row', goal: 3, value: s => s.currentStreak },
  { emoji: '🌕', title: 'Faithful Soul', desc: '6-month streak', goal: 6, value: s => s.currentStreak },
];

const BadgeCell = ({ badge, stats }: { badge: BadgeDef; stats: JourneyStats }) => {
  const val = badge.value(stats);
  const earned = val >= badge.goal;
  const pct = Math.min(100, Math.round((val / badge.goal) * 100));
  return (
    <div className={`text-center p-3 rounded-xl border ${earned ? 'bg-primary/5 border-primary/30' : 'bg-muted/20 border-border'}`}>
      <div className={`text-3xl mb-1 ${earned ? '' : 'grayscale opacity-40'}`}>{badge.emoji}</div>
      <p className="text-xs font-semibold leading-tight">{badge.title}</p>
      <p className="text-[10px] text-muted-foreground leading-tight mb-1.5">{badge.desc}</p>
      {earned ? (
        <span className="text-[10px] font-medium text-primary">✓ Earned</span>
      ) : (
        <>
          <div className="w-full bg-muted rounded-full h-1">
            <div className="bg-primary/50 h-1 rounded-full" style={{ width: `${pct}%` }} />
          </div>
          <span className="text-[10px] text-muted-foreground">{val}/{badge.goal}</span>
        </>
      )}
    </div>
  );
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

const fmtDate = (iso: string) =>
  new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

const fmtTime = (seconds: number) => {
  if (!seconds) return '—';
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (h === 0) return `${m}m`;
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
};

// ─── Journey row ─────────────────────────────────────────────────────────────

const JourneyRow = ({ j }: { j: RecentJourney }) => (
  <div className="flex items-center gap-3 p-3 bg-muted/20 rounded-xl">
    <div className={`p-2 rounded-full flex-shrink-0 ${j.type === 'solo' ? 'bg-primary/10' : 'bg-accent/10'}`}>
      {j.type === 'solo'
        ? <User className="h-4 w-4 text-primary" />
        : <Users className="h-4 w-4 text-accent" />}
    </div>

    <div className="flex-1 min-w-0">
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium capitalize">{j.type} Journey</span>
        {j.completed
          ? <CheckCircle2 className="h-3.5 w-3.5 text-green-500 flex-shrink-0" />
          : (
            <span className="text-[11px] px-1.5 py-0.5 bg-muted rounded-full text-muted-foreground flex-shrink-0">
              {j.progress}%
            </span>
          )}
      </div>
      <p className="text-xs text-muted-foreground">{fmtDate(j.startedAt)}</p>
    </div>

    <div className="text-right flex-shrink-0 space-y-0.5">
      <p className="text-sm font-semibold">{j.distanceKm} km</p>
      <p className="text-xs text-muted-foreground">{fmtTime(j.timeSeconds)}</p>
    </div>
  </div>
);

// ─── Page ────────────────────────────────────────────────────────────────────

const MyGirivalamHistory = () => {
  const [activeTab, setActiveTab] = useState("feed");
  const stats = useJourneyStats();
  const { user } = useAuth();
  const [celebrate, setCelebrate] = useState<CelebBadge[]>([]);

  // Detect newly-unlocked badges since the user last viewed this page and celebrate them.
  useEffect(() => {
    if (!user || stats.isLoading || stats.error) return;
    const key = `girivalam_badges_seen_${user.id}`;
    const earned = BADGES.filter(b => b.value(stats) >= b.goal);
    const earnedTitles = earned.map(b => b.title);

    let seen: string[] | null = null;
    try {
      const raw = localStorage.getItem(key);
      seen = raw ? JSON.parse(raw) : null;
    } catch { seen = null; }

    // First visit: baseline the already-earned badges so we don't celebrate retroactively.
    if (seen === null) {
      try { localStorage.setItem(key, JSON.stringify(earnedTitles)); } catch { /* ignore */ }
      return;
    }

    const newly = earned.filter(b => !seen!.includes(b.title));
    if (newly.length > 0) {
      setCelebrate(newly.map(b => ({ emoji: b.emoji, title: b.title, desc: b.desc })));
      try { localStorage.setItem(key, JSON.stringify(earnedTitles)); } catch { /* ignore */ }
    }
  }, [user, stats]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-primary/5">
      <SiteHeader />

      <AnimatePresence>
        {celebrate.length > 0 && (
          <BadgeCelebration badges={celebrate} onClose={() => setCelebrate([])} />
        )}
      </AnimatePresence>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Back Navigation */}
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors mb-6"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Home
        </Link>

        {/* Page Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <Badge variant="outline" className="mb-3 bg-primary/10 border-primary/30">
            <Activity className="h-3 w-3 mr-1" />
            Journey History
          </Badge>
          <h1 className="font-playfair text-3xl md:text-4xl font-bold mb-2">My Girivalam</h1>
          <p className="text-muted-foreground">Your sacred journey history and progress</p>
        </motion.div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6 bg-muted/50 p-1">
            <TabsTrigger
              value="feed"
              className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              <MessageSquare className="h-4 w-4" />
              Journey Feed
            </TabsTrigger>
            <TabsTrigger
              value="stats"
              className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              <TrendingUp className="h-4 w-4" />
              Journey Stats
            </TabsTrigger>
          </TabsList>

          {/* Journey Feed Tab */}
          <TabsContent value="feed" className="space-y-6">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}>
              <CommunityFeed />
            </motion.div>
          </TabsContent>

          {/* Journey Stats Tab */}
          <TabsContent value="stats" className="space-y-6">
            {stats.isLoading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : stats.error ? (
              <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
                <AlertCircle className="h-10 w-10 text-destructive" />
                <p className="text-sm text-muted-foreground">{stats.error}</p>
              </div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.1 }}
                className="space-y-6"
              >
                {/* Overview Cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <SpiritualCard className="text-center p-4">
                    <div className="p-2 bg-primary/10 rounded-full w-fit mx-auto mb-2">
                      <MapPin className="h-5 w-5 text-primary" />
                    </div>
                    <p className="text-2xl font-bold text-primary">{stats.totalGirivalams}</p>
                    <p className="text-xs text-muted-foreground">Total Girivalams</p>
                  </SpiritualCard>

                  <SpiritualCard className="text-center p-4">
                    <div className="p-2 bg-accent/10 rounded-full w-fit mx-auto mb-2">
                      <Footprints className="h-5 w-5 text-accent" />
                    </div>
                    <p className="text-2xl font-bold text-accent">{stats.totalDistance}</p>
                    <p className="text-xs text-muted-foreground">KM Walked</p>
                  </SpiritualCard>

                  <SpiritualCard className="text-center p-4">
                    <div className="p-2 bg-sky-500/10 rounded-full w-fit mx-auto mb-2">
                      <Clock className="h-5 w-5 text-sky-500" />
                    </div>
                    <p className="text-2xl font-bold text-sky-500">{stats.totalTime}</p>
                    <p className="text-xs text-muted-foreground">Hours Spent</p>
                  </SpiritualCard>

                  <SpiritualCard className="text-center p-4">
                    <div className="p-2 bg-orange-500/10 rounded-full w-fit mx-auto mb-2">
                      <Calendar className="h-5 w-5 text-orange-500" />
                    </div>
                    <p className="text-2xl font-bold text-orange-500">{stats.templesCompleted}</p>
                    <p className="text-xs text-muted-foreground">Temples Visited</p>
                  </SpiritualCard>
                </div>

                {/* Streak */}
                <SpiritualCard className="p-6 bg-gradient-to-br from-orange-500/10 to-primary/5 border-orange-500/20">
                  <div className="flex items-center justify-center gap-5">
                    <div className="text-5xl">🔥</div>
                    <div className="text-center">
                      <p className="text-4xl font-bold text-orange-500 leading-none">{stats.currentStreak}</p>
                      <p className="text-sm font-medium mt-1">month streak</p>
                    </div>
                  </div>
                  <p className="text-center text-xs text-muted-foreground mt-3">
                    {stats.currentStreak > 0
                      ? 'Complete a Girivalam every month to keep your streak alive 🙏'
                      : 'Complete a Girivalam this month to start your streak'}
                  </p>
                </SpiritualCard>

                {/* Achievements / Badges */}
                <SpiritualCard className="p-6">
                  <h3 className="font-playfair text-lg font-semibold mb-4 text-center flex items-center justify-center gap-2">
                    <Award className="h-5 w-5 text-primary" /> Achievements
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {BADGES.map(b => (
                      <BadgeCell key={b.title} badge={b} stats={stats} />
                    ))}
                  </div>
                  <p className="text-center text-xs text-muted-foreground mt-4">
                    {BADGES.filter(b => b.value(stats) >= b.goal).length} of {BADGES.length} unlocked
                  </p>
                </SpiritualCard>

                {/* Solo vs Group Breakdown */}
                <SpiritualCard className="p-6">
                  <h3 className="font-playfair text-lg font-semibold mb-4 text-center">Journey Breakdown</h3>
                  <div className="grid grid-cols-2 gap-6">
                    <div className="text-center p-4 bg-muted/30 rounded-xl">
                      <div className="flex items-center justify-center gap-2 mb-2">
                        <User className="h-5 w-5 text-primary" />
                        <span className="font-medium">Solo</span>
                      </div>
                      <p className="text-3xl font-bold text-primary">{stats.soloCount}</p>
                      <p className="text-xs text-muted-foreground mt-1">Individual journeys</p>
                    </div>
                    <div className="text-center p-4 bg-muted/30 rounded-xl">
                      <div className="flex items-center justify-center gap-2 mb-2">
                        <Users className="h-5 w-5 text-accent" />
                        <span className="font-medium">Group</span>
                      </div>
                      <p className="text-3xl font-bold text-accent">{stats.groupCount}</p>
                      <p className="text-xs text-muted-foreground mt-1">Community walks</p>
                    </div>
                  </div>
                </SpiritualCard>

                {/* Lifetime Progress */}
                <SpiritualCard className="p-6">
                  <h3 className="font-playfair text-lg font-semibold mb-4 text-center">Lifetime Progress</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center p-3 bg-muted/20 rounded-lg">
                      <div className="flex items-center gap-3">
                        <Footprints className="h-5 w-5 text-muted-foreground" />
                        <span className="text-sm">Total Steps</span>
                      </div>
                      <span className="font-semibold">{stats.stepsWalked.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-muted/20 rounded-lg">
                      <div className="flex items-center gap-3">
                        <Star className="h-5 w-5 text-muted-foreground" />
                        <span className="text-sm">Completed Rounds</span>
                      </div>
                      <span className="font-semibold">{stats.completedGirivalams}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-muted/20 rounded-lg">
                      <div className="flex items-center gap-3">
                        <TrendingUp className="h-5 w-5 text-muted-foreground" />
                        <span className="text-sm">Average per Girivalam</span>
                      </div>
                      <span className="font-semibold">
                        {stats.totalGirivalams > 0
                          ? `${(stats.totalDistance / stats.totalGirivalams).toFixed(1)} km`
                          : '—'}
                      </span>
                    </div>
                    {stats.bestTimeHours != null && (
                      <div className="flex justify-between items-center p-3 bg-muted/20 rounded-lg">
                        <div className="flex items-center gap-3">
                          <Timer className="h-5 w-5 text-muted-foreground" />
                          <span className="text-sm">Best Time</span>
                        </div>
                        <span className="font-semibold">{stats.bestTimeHours}h</span>
                      </div>
                    )}
                  </div>

                  {/* Progress Bar */}
                  <div className="mt-6 pt-4 border-t border-border">
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-muted-foreground">Journey to 100 Girivalams</span>
                      <span className="font-medium">{stats.totalGirivalams} / 100</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-3">
                      <div
                        className="bg-gradient-to-r from-primary to-accent h-3 rounded-full transition-all duration-1000"
                        style={{ width: `${Math.min(stats.totalGirivalams, 100)}%` }}
                      />
                    </div>
                  </div>
                </SpiritualCard>

                {/* Recent Journeys */}
                {stats.recentJourneys.length > 0 && (
                  <SpiritualCard className="p-6">
                    <h3 className="font-playfair text-lg font-semibold mb-4 text-center">Recent Journeys</h3>
                    <div className="space-y-2">
                      {stats.recentJourneys.map(j => (
                        <JourneyRow key={j.id} j={j} />
                      ))}
                    </div>
                  </SpiritualCard>
                )}

                {/* Empty state */}
                {stats.totalGirivalams === 0 && stats.soloCount === 0 && stats.groupCount === 0 && (
                  <div className="text-center py-12 space-y-3">
                    <MapPin className="h-12 w-12 mx-auto text-muted-foreground/40" />
                    <p className="text-muted-foreground">No journeys recorded yet.</p>
                    <p className="text-sm text-muted-foreground/70">Start your first Girivalam on the map!</p>
                  </div>
                )}

                {/* Motivational Note */}
                <div className="text-center p-6 bg-primary/5 rounded-2xl border border-primary/20">
                  <p className="text-sm text-muted-foreground italic">
                    "Each step around Arunachala purifies the soul. Your devotion is recorded in the divine."
                  </p>
                  <p className="text-xs text-primary mt-2">🙏 Om Namah Shivaya</p>
                </div>
              </motion.div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default MyGirivalamHistory;
