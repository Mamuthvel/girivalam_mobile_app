import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  ArrowLeft, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  AlertCircle,
  CalendarDays,
  Bell,
  Info,
  AlertTriangle,
  PartyPopper,
  Wrench,
  Shield
} from "lucide-react";
import SiteHeader from "@/components/SiteHeader";
import { SpiritualCard } from "@/components/SpiritualCard";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import Seo from "@/components/Seo";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTempleStatus, formatTime, isTempleOpen } from "@/hooks/useTempleStatus";

const TempleHome = () => {
  const { t } = useLanguage();
  const { status, poojaTimings, announcements, loading } = useTempleStatus();

  const getStatusColor = (statusValue: string) => {
    switch (statusValue) {
      case 'open': return 'bg-green-500/20 text-green-700 dark:text-green-400';
      case 'closed': return 'bg-red-500/20 text-red-700 dark:text-red-400';
      case 'limited_darshan': return 'bg-amber-500/20 text-amber-700 dark:text-amber-400';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getStatusIcon = (statusValue: string) => {
    switch (statusValue) {
      case 'open': return <CheckCircle2 className="h-5 w-5" />;
      case 'closed': return <XCircle className="h-5 w-5" />;
      case 'limited_darshan': return <AlertCircle className="h-5 w-5" />;
      default: return <Clock className="h-5 w-5" />;
    }
  };

  const getStatusLabel = (statusValue: string) => {
    switch (statusValue) {
      case 'open': return t('temple.statusOpen') || 'Open';
      case 'closed': return t('temple.statusClosed') || 'Closed';
      case 'limited_darshan': return t('temple.statusLimited') || 'Limited Darshan';
      default: return 'Unknown';
    }
  };

  const getAnnouncementIcon = (type: string) => {
    switch (type) {
      case 'warning': return <AlertTriangle className="h-5 w-5 text-amber-500" />;
      case 'festival': return <PartyPopper className="h-5 w-5 text-purple-500" />;
      case 'maintenance': return <Wrench className="h-5 w-5 text-blue-500" />;
      case 'emergency': return <Shield className="h-5 w-5 text-red-500" />;
      default: return <Info className="h-5 w-5 text-primary" />;
    }
  };

  const getAnnouncementBg = (type: string) => {
    switch (type) {
      case 'warning': return 'bg-amber-500/10 border-amber-500/30';
      case 'festival': return 'bg-purple-500/10 border-purple-500/30';
      case 'maintenance': return 'bg-blue-500/10 border-blue-500/30';
      case 'emergency': return 'bg-red-500/10 border-red-500/30';
      default: return 'bg-primary/10 border-primary/30';
    }
  };

  const isCurrentlyOpen = status ? isTempleOpen(status.opening_time, status.closing_time) && status.status === 'open' : false;

  return (
    <div className="min-h-screen bg-background">
      <Seo
        title="Arunachaleswarar Temple Timings — Live Status, Darshan & Pooja Schedule | MyGirivalam.in"
        description="Live Arunachaleswarar Temple status: opening & closing times, darshan availability, and today's pooja timings in Tiruvannamalai, updated in real time."
        canonical="/temple-home"
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: [
            {
              "@type": "Question",
              name: "What are the Arunachaleswarar Temple timings?",
              acceptedAnswer: {
                "@type": "Answer",
                text: "Arunachaleswarar Temple in Tiruvannamalai is generally open from early morning until late evening, with darshan and pooja timings that can vary on festival days such as Pournami and Karthigai Deepam. Check this page for live, up-to-date temple status and today's pooja schedule.",
              },
            },
          ],
        }}
      />
      <SiteHeader />

      <div className="relative min-h-screen flex flex-col">
        {/* Gradient Background */}
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-background to-background" />
        
        {/* Back Button */}
        <div className="relative z-10 pt-20 px-4">
          <Link to="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="h-4 w-4" />
            <span className="text-sm">{t('common.back') || 'Back'}</span>
          </Link>
        </div>

        {/* Main Content */}
        <div className="relative z-10 flex-1 px-4 py-6 max-w-3xl mx-auto w-full">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-8"
          >
            {/* Temple Icon */}
            <div className="mx-auto mb-4 p-4 bg-primary/10 rounded-full w-fit">
              <span className="text-4xl">🛕</span>
            </div>
            
            <h1 className="font-playfair text-3xl md:text-4xl font-bold mb-2">
              <span className="spiritual-gradient-text">{t('temple.title') || 'Temple Home'}</span>
            </h1>
            <p className="text-muted-foreground text-sm max-w-md mx-auto">
              {t('temple.subtitle') || 'Arunachaleswarar Temple - Live Status & Timings'}
            </p>
          </motion.div>

          {/* Announcements */}
          {announcements.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="mb-6 space-y-3"
            >
              {announcements.map((announcement) => (
                <div
                  key={announcement.id}
                  className={`p-4 rounded-xl border ${getAnnouncementBg(announcement.announcement_type)}`}
                >
                  <div className="flex items-start gap-3">
                    {getAnnouncementIcon(announcement.announcement_type)}
                    <div className="flex-1">
                      <h4 className="font-semibold text-sm">{announcement.title}</h4>
                      <p className="text-sm text-muted-foreground mt-1">{announcement.message}</p>
                    </div>
                  </div>
                </div>
              ))}
            </motion.div>
          )}

          {/* Temple Status Card */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <SpiritualCard className="p-6 mb-6">
              {loading ? (
                <div className="space-y-4">
                  <Skeleton className="h-12 w-32 mx-auto" />
                  <Skeleton className="h-6 w-48 mx-auto" />
                  <Skeleton className="h-6 w-full" />
                </div>
              ) : status ? (
                <>
                  {/* Status Badge */}
                  <div className="flex justify-center mb-4">
                    <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full ${getStatusColor(status.status)}`}>
                      {getStatusIcon(status.status)}
                      <span className="font-semibold">{getStatusLabel(status.status)}</span>
                    </div>
                  </div>

                  {/* Real-time indicator */}
                  <div className="flex justify-center mb-4">
                    {isCurrentlyOpen ? (
                      <div className="flex items-center gap-2 text-green-600 dark:text-green-400 text-sm">
                        <span className="relative flex h-2 w-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                        </span>
                        {t('temple.currentlyOpen') || 'Currently Open for Darshan'}
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 text-muted-foreground text-sm">
                        <Clock className="h-4 w-4" />
                        {t('temple.currentlyClosed') || 'Temple is currently closed'}
                      </div>
                    )}
                  </div>

                  {/* Timings */}
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="text-center p-3 bg-muted/50 rounded-lg">
                      <p className="text-xs text-muted-foreground mb-1">{t('temple.opens') || 'Opens'}</p>
                      <p className="font-semibold text-lg">{formatTime(status.opening_time)}</p>
                    </div>
                    <div className="text-center p-3 bg-muted/50 rounded-lg">
                      <p className="text-xs text-muted-foreground mb-1">{t('temple.closes') || 'Closes'}</p>
                      <p className="font-semibold text-lg">{formatTime(status.closing_time)}</p>
                    </div>
                  </div>

                  {/* Darshan Availability */}
                  <div className="flex items-center justify-center gap-2 mb-4 p-3 rounded-lg bg-muted/30">
                    {status.darshan_available ? (
                      <>
                        <CheckCircle2 className="h-5 w-5 text-green-500" />
                        <span className="text-sm font-medium">{t('temple.darshanAvailable') || 'Darshan Available'}</span>
                      </>
                    ) : (
                      <>
                        <XCircle className="h-5 w-5 text-red-500" />
                        <span className="text-sm font-medium">{t('temple.darshanUnavailable') || 'Darshan Not Available'}</span>
                      </>
                    )}
                  </div>

                  {/* Special Notes */}
                  {status.special_notes && (
                    <div className="p-3 bg-amber-500/10 rounded-lg text-sm text-amber-700 dark:text-amber-400">
                      <p>{status.special_notes}</p>
                    </div>
                  )}

                  {/* Source Badge */}
                  <div className="flex justify-center mt-4">
                    <Badge variant={status.source === 'admin' ? 'default' : 'secondary'} className="text-xs">
                      {status.source === 'admin' ? (
                        <><CheckCircle2 className="h-3 w-3 mr-1" /> {t('temple.verified') || 'Verified (Admin)'}</>
                      ) : (
                        <><Clock className="h-3 w-3 mr-1" /> {t('temple.estimated') || 'Estimated (Auto)'}</>
                      )}
                    </Badge>
                  </div>
                </>
              ) : (
                <p className="text-center text-muted-foreground">{t('temple.noData') || 'No temple data available'}</p>
              )}
            </SpiritualCard>
          </motion.div>

          {/* Pooja Timings */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <SpiritualCard className="p-6 mb-6">
              <div className="flex items-center gap-2 mb-4">
                <CalendarDays className="h-5 w-5 text-primary" />
                <h3 className="font-semibold text-lg">{t('temple.poojaTimings') || 'Pooja Timings'}</h3>
              </div>

              {loading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-16 w-full" />
                  ))}
                </div>
              ) : poojaTimings.length > 0 ? (
                <div className="space-y-3">
                  {poojaTimings.map((pooja) => (
                    <div
                      key={pooja.id}
                      className="flex items-center justify-between p-3 bg-muted/30 rounded-lg"
                    >
                      <div className="flex-1">
                        <p className="font-medium text-sm">{pooja.pooja_name}</p>
                        {pooja.description && (
                          <p className="text-xs text-muted-foreground">{pooja.description}</p>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-sm">
                          {formatTime(pooja.start_time)}
                          {pooja.end_time && ` - ${formatTime(pooja.end_time)}`}
                        </p>
                        <Badge variant={pooja.source === 'admin' ? 'default' : 'secondary'} className="text-[10px] mt-1">
                          {pooja.source === 'admin' ? t('temple.verified') || 'Verified' : t('temple.estimated') || 'Estimated'}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-muted-foreground text-sm">{t('temple.noPoojaData') || 'No pooja timings available'}</p>
              )}
            </SpiritualCard>
          </motion.div>

          {/* Disclaimer */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-center"
          >
            <p className="text-xs text-muted-foreground flex items-center justify-center gap-1">
              <Bell className="h-3 w-3" />
              {t('temple.disclaimer') || 'Timings may vary on festival days. Please confirm locally.'}
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default TempleHome;
