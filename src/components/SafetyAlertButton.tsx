import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { AlertTriangle, Phone, MapPin, Loader2, CheckCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/contexts/LanguageContext';
import { logger } from "@/lib/logger";

interface SafetyAlertButtonProps {
  groupId: string;
  groupName: string;
  userLocation?: { lat: number; lng: number };
}

const SafetyAlertButton: React.FC<SafetyAlertButtonProps> = ({
  groupId,
  groupName,
  userLocation,
}) => {
  const [showDialog, setShowDialog] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [alertSent, setAlertSent] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();
  const { t } = useLanguage();

  const handleSendAlert = async () => {
    if (!user || !groupId) return;

    setIsSending(true);
    try {
      // Send help message to group chat
      const locationText = userLocation 
        ? `📍 Location: https://www.google.com/maps?q=${userLocation.lat},${userLocation.lng}`
        : '📍 Location not available';

      const alertMessage = `🚨 **HELP NEEDED** 🚨\n\nA group member needs assistance!\n\n${locationText}\n\nPlease check on them immediately.`;

      const { error } = await supabase
        .from('group_messages')
        .insert({
          group_id: groupId,
          user_id: user.id,
          content: alertMessage,
          message_type: 'alert',
          metadata: {
            type: 'help_alert',
            location: userLocation,
            timestamp: new Date().toISOString(),
          }
        });

      if (error) throw error;

      setAlertSent(true);
      toast({
        title: t('safety.alertSent'),
        description: t('safety.alertSentDesc'),
      });

      // Reset after 5 seconds
      setTimeout(() => {
        setShowDialog(false);
        setAlertSent(false);
      }, 3000);
    } catch (error) {
      logger.error('Error sending alert:', error);
      toast({
        title: t('safety.alertFailed'),
        description: t('safety.alertFailedDesc'),
        variant: 'destructive',
      });
    } finally {
      setIsSending(false);
    }
  };

  const handleEmergencyCall = () => {
    window.location.href = 'tel:112';
  };

  return (
    <>
      {/* Floating Help Button */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', delay: 0.5 }}
        className="fixed bottom-24 right-4 z-50"
      >
        <Button
          variant="destructive"
          size="lg"
          className="rounded-full h-14 w-14 shadow-lg hover:shadow-xl transition-all"
          onClick={() => setShowDialog(true)}
        >
          <AlertTriangle className="h-6 w-6" />
        </Button>
        <span className="absolute -top-1 -right-1 flex h-4 w-4">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-4 w-4 bg-red-500"></span>
        </span>
      </motion.div>

      {/* Help Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="w-[95vw] max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="h-5 w-5" />
              {t('safety.needHelp')}
            </DialogTitle>
            <DialogDescription className="pt-2">
              {t('safety.helpDesc')}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <AnimatePresence mode="wait">
              {alertSent ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col items-center py-6"
                >
                  <div className="p-4 bg-green-500/10 rounded-full mb-4">
                    <CheckCircle className="h-12 w-12 text-green-500" />
                  </div>
                  <p className="text-center font-medium">{t('safety.alertSent')}</p>
                  <p className="text-center text-sm text-muted-foreground">
                    {t('safety.groupNotified')}
                  </p>
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="space-y-3"
                >
                  {/* Alert Group Button */}
                  <Button
                    className="w-full h-14 text-lg bg-amber-500 hover:bg-amber-600"
                    onClick={handleSendAlert}
                    disabled={isSending}
                  >
                    {isSending ? (
                      <Loader2 className="h-5 w-5 animate-spin mr-2" />
                    ) : (
                      <AlertTriangle className="h-5 w-5 mr-2" />
                    )}
                    {t('safety.alertGroup')}
                  </Button>

                  {/* Share Location Info */}
                  {userLocation && (
                    <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg text-sm">
                      <MapPin className="h-4 w-4 text-primary flex-shrink-0" />
                      <span className="text-muted-foreground">
                        {t('safety.locationWillBeShared')}
                      </span>
                    </div>
                  )}

                  <div className="relative py-2">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-background px-2 text-muted-foreground">
                        {t('safety.or')}
                      </span>
                    </div>
                  </div>

                  {/* Emergency Call Button */}
                  <Button
                    variant="destructive"
                    className="w-full h-14 text-lg"
                    onClick={handleEmergencyCall}
                  >
                    <Phone className="h-5 w-5 mr-2" />
                    {t('safety.callEmergency')} (112)
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <DialogFooter>
            {!alertSent && (
              <Button variant="outline" onClick={() => setShowDialog(false)}>
                {t('safety.cancel')}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default SafetyAlertButton;
