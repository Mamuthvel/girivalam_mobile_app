import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";

export interface CelebBadge {
  emoji: string;
  title: string;
  desc: string;
}

// Pre-computed confetti particles (kept module-level so they don't reshuffle on re-render).
const CONFETTI = Array.from({ length: 40 }, (_, i) => ({
  id: i,
  left: Math.random() * 100,
  delay: Math.random() * 0.7,
  duration: 1.8 + Math.random() * 1.6,
  emoji: ["🎉", "✨", "🌟", "🔥", "🙏", "🕉️", "⭐"][i % 7],
  size: 14 + Math.random() * 16,
}));

/**
 * Full-screen badge-unlock celebration with a confetti burst.
 * Self-contained (framer-motion only) — tap anywhere or press Continue to dismiss.
 */
const BadgeCelebration = ({ badges, onClose }: { badges: CelebBadge[]; onClose: () => void }) => {
  if (badges.length === 0) return null;
  const primary = badges[0];

  return (
    <motion.div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      role="dialog"
      aria-label="Badge unlocked"
    >
      {/* Confetti */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {CONFETTI.map((c) => (
          <motion.span
            key={c.id}
            className="absolute top-0 select-none"
            style={{ left: `${c.left}%`, fontSize: c.size }}
            initial={{ y: "-10vh", opacity: 0, rotate: 0 }}
            animate={{ y: "110vh", opacity: [0, 1, 1, 0], rotate: 360 }}
            transition={{ duration: c.duration, delay: c.delay, ease: "easeIn" }}
          >
            {c.emoji}
          </motion.span>
        ))}
      </div>

      {/* Card */}
      <motion.div
        className="relative w-full max-w-sm rounded-3xl border border-primary/30 bg-card p-8 text-center shadow-2xl"
        initial={{ scale: 0.7, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 260, damping: 20 }}
        onClick={(e) => e.stopPropagation()}
      >
        <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-primary">
          {badges.length > 1 ? `${badges.length} Badges Unlocked!` : "Badge Unlocked!"}
        </p>

        <motion.div
          className="mb-3 text-7xl"
          initial={{ scale: 0, rotate: -15 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ delay: 0.15, type: "spring", stiffness: 300, damping: 15 }}
        >
          {primary.emoji}
        </motion.div>

        <h3 className="mb-1 font-playfair text-2xl font-bold">{primary.title}</h3>
        <p className="text-sm text-muted-foreground">{primary.desc}</p>

        {badges.length > 1 && (
          <div className="mt-4 flex flex-wrap justify-center gap-2">
            {badges.slice(1).map((b) => (
              <span
                key={b.title}
                className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-1 text-xs text-primary"
              >
                {b.emoji} {b.title}
              </span>
            ))}
          </div>
        )}

        <Button onClick={onClose} className="mt-6 w-full" size="lg">
          🙏 Continue
        </Button>
      </motion.div>
    </motion.div>
  );
};

export default BadgeCelebration;
