import { ClickSound } from "@/components/ClickSound";
import { BookOpen, Heart, Play } from "lucide-react";
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import PournamiExpandableCard from "@/components/PournamiExpandableCard";
import { useLanguage } from "@/contexts/LanguageContext";

const DesktopHero = () => {
    const { t } = useLanguage();
    return (
        <div className="relative z-10 flex-1 flex items-center justify-center px-4 pt-20">
            <div className="max-w-7xl mx-auto w-full">

                <div className="text-center mb-10">
                    <div className="font-playfair text-6xl font-bold mb-4 tracking-tight" role="heading" aria-level={2}>
                        <span className="spiritual-gradient-text">Girivalam</span>
                    </div>
                </div>

                {/* Desktop 3-column layout */}
                <div className="grid grid-cols-12 gap-8 items-start">

                    {/* Left Column: Quick Actions */}
                    <div className="col-span-3 flex flex-col gap-5">

                        <ClickSound soundText="Starting sacred journey">
                            <Link to="/my-girivalam" className="group">
                                <div className="spiritual-card flex items-center gap-4 hover:border-primary/40">
                                    <div className="p-2 rounded-full bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                                        <Play className="h-6 w-6 ml-1" />
                                    </div>
                                    <div className="text-left">
                                        <h3 className="font-semibold text-lg text-foreground/90">{t('home.startGirivalam')}</h3>
                                        <p className="text-xs text-muted-foreground">{t('home.startGirivalamDesc')}</p>
                                    </div>
                                </div>
                            </Link>
                        </ClickSound>

                        <ClickSound soundText="Opening donation page">
                            <Link to="/support-girivalam" className="group">
                                <div className="spiritual-card flex items-center gap-4 hover:border-primary/40 cursor-pointer">
                                    <div className="p-2 rounded-full bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                                        <Heart className="h-6 w-6" />
                                    </div>
                                    <div className="text-left">
                                        <h3 className="font-semibold text-lg text-foreground/90">{t('home.donateNow')}</h3>
                                        <p className="text-xs text-muted-foreground">{t('home.donateNowDesc')}</p>
                                    </div>
                                </div>
                            </Link>
                        </ClickSound>

                        <Link to="/ai-guide" className="group">
                            <div className="spiritual-card flex items-center gap-4 hover:border-primary/40 cursor-pointer">
                                <div className="p-2 rounded-full bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                                    <BookOpen className="h-6 w-6" />
                                </div>
                                <div className="text-left">
                                    <h3 className="font-semibold text-lg text-foreground/90">{t('home.spiritualGuide')}</h3>
                                    <p className="text-xs text-muted-foreground">{t('home.spiritualGuideDesc')}</p>
                                </div>
                            </div>
                        </Link>

                    </div>


                    {/* Center Column: Pournami Expandable Card */}
                    <div className="col-span-6 flex justify-center">
                        <div className="max-w-lg w-full">
                            <PournamiExpandableCard />
                        </div>
                    </div>

                    {/* Right Column: Mantra & Wisdom */}
                    <div className="col-span-3">
                        <div className="spiritual-card bg-primary/5 border-primary/10 h-full flex flex-col justify-center text-center p-8 relative overflow-hidden">
                            <div className="absolute top-0 right-0 -mr-4 -mt-4 opacity-5">
                                <Heart className="h-32 w-32" />
                            </div>

                            <h3 className="font-playfair text-xl font-semibold mb-6 flex items-center justify-center gap-2 text-foreground/80">
                                <span className="w-8 h-[1px] bg-primary/40"></span>
                                {t('home.todaysMantra')}
                                <span className="w-8 h-[1px] bg-primary/40"></span>
                            </h3>

                            <p className="font-playfair text-xl leading-relaxed text-foreground/90 italic mb-6">
                                "Arunachala Shiva, Arunachala Shiva, Arunachala Shiva, Aruna Shiva"
                            </p>

                            <Badge variant="outline" className="w-fit mx-auto border-primary/20 text-muted-foreground font-normal">
                                {t('home.sacredChant')}
                            </Badge>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};
export default DesktopHero;