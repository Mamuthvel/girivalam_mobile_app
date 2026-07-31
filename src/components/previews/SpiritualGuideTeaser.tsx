import { SpiritualCard } from "@/components/SpiritualCard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BookOpen, Volume2, MapPin, Star, Clock } from "lucide-react";

const SAMPLE_LINGAMS = [
  { name: "Indra Lingam", direction: "East", deity: "Lord Indra" },
  { name: "Agni Lingam", direction: "Southeast", deity: "Lord Agni" },
  { name: "Yama Lingam", direction: "South", deity: "Lord Yama" },
  { name: "Kubera Lingam", direction: "North", deity: "Lord Kubera" },
];

export const SpiritualGuideTeaser = () => {
  return (
    <div className="px-4 py-12">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <Badge variant="outline" className="mb-4 bg-primary/10 border-primary/30">
            📿 Sacred Wisdom
          </Badge>
          <h1 className="font-playfair text-4xl md:text-5xl font-bold mb-4">
            Spiritual Guide & <span className="text-primary">Sacred Resources</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            Discover the profound wisdom of the Ashta Lingam temples and sacred mantras.
          </p>
        </div>

        {/* Sample Lingam Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {SAMPLE_LINGAMS.map((lingam, index) => (
            <SpiritualCard key={index}>
              <div className="text-center space-y-3">
                <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <MapPin className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-playfair text-lg font-semibold">{lingam.name}</h3>
                <p className="text-sm text-muted-foreground">{lingam.direction}</p>
                <Badge variant="secondary" className="text-xs">{lingam.deity}</Badge>
                <Button size="sm" variant="outline" className="w-full mt-2">
                  <Volume2 className="h-4 w-4 mr-2" />
                  Play Mantra
                </Button>
              </div>
            </SpiritualCard>
          ))}
        </div>

        {/* Quick Tips Preview */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-emerald-500/10 rounded-lg border border-emerald-500/20">
            <h4 className="font-medium text-emerald-600 mb-2">✓ Do's</h4>
            <p className="text-sm text-muted-foreground">Walk barefoot, maintain silence...</p>
          </div>
          <div className="p-4 bg-destructive/10 rounded-lg border border-destructive/20">
            <h4 className="font-medium text-destructive mb-2">✗ Don'ts</h4>
            <p className="text-sm text-muted-foreground">Avoid leather, don't run...</p>
          </div>
          <div className="p-4 bg-primary/10 rounded-lg border border-primary/20">
            <h4 className="font-medium text-primary mb-2">⏰ Timings</h4>
            <p className="text-sm text-muted-foreground">Best: 5:30 AM - 7:00 AM</p>
          </div>
        </div>
      </div>
    </div>
  );
};
