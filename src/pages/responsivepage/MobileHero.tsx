import { ClickSound } from "@/components/ClickSound";
import { SpiritualCard } from "@/components/SpiritualCard";
import { BookOpen, Heart, Play } from "lucide-react";
import { Link } from "react-router-dom";
import PournamiExpandableCard from "@/components/PournamiExpandableCard";
import { useLanguage } from "@/contexts/LanguageContext";

const MobileHero = () => {
  const { t } = useLanguage();
  return (
    <>
      {/* Hero Content */}
      <div className="relative z-10 flex-1 flex items-center justify-center px-4 pt-12 pb-12 overflow-y-auto">
        <div className="max-w-md mx-auto w-full text-center">

          <div className="font-playfair text-4xl md:text-6xl font-bold mb-6 tracking-tight" role="heading" aria-level={2}>
            <span className="spiritual-gradient-text">Girivalam</span>
          </div>

          <div className="flex flex-col gap-4">

            {/* Main Actions Grid */}
            <div className="grid grid-cols-2 gap-4">
              <ClickSound soundText="Starting sacred journey">
                <Link to="/my-girivalam" className="group h-full">
                  <div className="spiritual-card bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20 p-4 h-full flex flex-col justify-center items-center gap-3 hover:border-primary/40 text-center">
                    <div className="p-3 rounded-full bg-background/50 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors shadow-sm">
                      <Play className="h-6 w-6 ml-1" />
                    </div>
                    <span className="font-medium text-lg text-foreground/90 leading-tight">{t('home.startGirivalam')}</span>
                  </div>
                </Link>
              </ClickSound>

              <div className="flex flex-col gap-4">
                <ClickSound soundText="Opening donation page">
                  <Link to="/support-girivalam">
                    <div className="spiritual-card p-4 flex items-center justify-center gap-3 hover:border-primary/40 cursor-pointer group bg-white/60">
                      <Heart className="h-5 w-5 text-primary group-hover:scale-110 transition-transform" />
                      <span className="font-medium text-foreground/90">{t('home.donate')}</span>
                    </div>
                  </Link>
                </ClickSound>

                <ClickSound soundText="Start Spiritual Guide">
                  <Link to="/ai-guide">
                    <div className="spiritual-card p-4 flex items-center justify-center gap-3 hover:border-primary/40 cursor-pointer group bg-white/60">
                      <BookOpen className="h-5 w-5 text-primary group-hover:scale-110 transition-transform" />
                      <span className="font-medium text-foreground/90">{t('home.guideShort')}</span>
                    </div>
                  </Link>
                </ClickSound>
              </div>
            </div>

            {/* Pournami Expandable Card */}
            <div className="mt-2">
              <PournamiExpandableCard />
            </div>

            {/* Today's Quote */}
            <SpiritualCard className="mt-2 bg-primary/5 border-primary/10">
              <div className="flex flex-col items-center text-center p-2">
                <div className="flex items-center gap-2 mb-3 text-primary/80">
                  <Heart className="h-4 w-4" />
                  <span className="text-sm font-medium uppercase tracking-widest">{t('home.todaysMantra')}</span>
                  <Heart className="h-4 w-4" />
                </div>
                <p className="font-playfair text-lg leading-relaxed text-foreground/90 italic mb-3">
                  "Arunachala Shiva, Arunachala Shiva, Arunachala Shiva, Aruna Shiva"
                </p>
              </div>
            </SpiritualCard>

          </div>
        </div>
      </div>
    </>
  );
};

export default MobileHero;
