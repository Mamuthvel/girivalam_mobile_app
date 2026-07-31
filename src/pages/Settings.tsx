import { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import { motion } from "framer-motion";
import { Settings as SettingsIcon, Globe, Moon, Sun, Bell, Shield, Smartphone, Check, Music2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import SiteHeader from "@/components/SiteHeader";
import { useLanguage, languageOptions, Language } from "@/contexts/LanguageContext";

const NOTIFICATION_STORAGE_KEY = 'girivalam_notifications';
export const JOURNEY_SETTINGS_KEY = 'girivalam_journey_settings';

interface JourneySettings {
  proximityAudioEnabled: boolean;
}

interface NotificationSettings {
  girivalamReminders: boolean;
  safetyAlerts: boolean;
  appUpdates: boolean;
}

const Settings = () => {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const { language, setLanguage, t } = useLanguage();
  const [mounted, setMounted] = useState(false);

  const [journeySettings, setJourneySettings] = useState<JourneySettings>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(JOURNEY_SETTINGS_KEY);
      if (saved) {
        try { return JSON.parse(saved); } catch { /* ignore */ }
      }
    }
    return { proximityAudioEnabled: true };
  });

  useEffect(() => {
    localStorage.setItem(JOURNEY_SETTINGS_KEY, JSON.stringify(journeySettings));
  }, [journeySettings]);

  const [notifications, setNotifications] = useState<NotificationSettings>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(NOTIFICATION_STORAGE_KEY);
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch {
          return { girivalamReminders: true, safetyAlerts: true, appUpdates: false };
        }
      }
    }
    return { girivalamReminders: true, safetyAlerts: true, appUpdates: false };
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    localStorage.setItem(NOTIFICATION_STORAGE_KEY, JSON.stringify(notifications));
  }, [notifications]);

  const handleNotificationChange = (key: keyof NotificationSettings) => {
    setNotifications(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const isDark = resolvedTheme === 'dark';

  if (!mounted) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      
      <main className="container max-w-2xl mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Page Header */}
          <div className="flex items-center gap-3 mb-8">
            <div className="p-3 rounded-full bg-primary/10">
              <SettingsIcon className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-playfair font-semibold text-foreground">
                {t('settings.title')}
              </h1>
              <p className="text-muted-foreground text-sm">
                Customize your experience
              </p>
            </div>
          </div>

          <div className="space-y-6">
            {/* Language Settings */}
            <Card className="border-border/50 shadow-gentle">
              <CardHeader className="pb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <Globe className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{t('settings.language')}</CardTitle>
                    <CardDescription>{t('settings.languageDesc')}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <RadioGroup
                  value={language}
                  onValueChange={(value) => setLanguage(value as Language)}
                  className="grid grid-cols-2 gap-3"
                >
                  {languageOptions.map((lang) => (
                    <motion.div
                      key={lang.code}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Label
                        htmlFor={lang.code}
                        className={`flex items-center justify-between p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 ${
                          language === lang.code
                            ? 'border-primary bg-primary/5'
                            : 'border-border hover:border-primary/50 hover:bg-muted/50'
                        }`}
                      >
                        <div className="flex flex-col">
                          <span className="font-medium text-foreground">{lang.nativeName}</span>
                          <span className="text-xs text-muted-foreground">{lang.name}</span>
                        </div>
                        <RadioGroupItem value={lang.code} id={lang.code} className="sr-only" />
                        {language === lang.code && (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="p-1 rounded-full bg-primary"
                          >
                            <Check className="h-3 w-3 text-primary-foreground" />
                          </motion.div>
                        )}
                      </Label>
                    </motion.div>
                  ))}
                </RadioGroup>
              </CardContent>
            </Card>

            {/* Theme Settings */}
            <Card className="border-border/50 shadow-gentle">
              <CardHeader className="pb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    {isDark ? (
                      <Moon className="h-5 w-5 text-primary" />
                    ) : (
                      <Sun className="h-5 w-5 text-primary" />
                    )}
                  </div>
                  <div>
                    <CardTitle className="text-lg">{t('settings.theme')}</CardTitle>
                    <CardDescription>{t('settings.themeDesc')}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-3">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setTheme('light')}
                    className={`p-4 rounded-xl border-2 transition-all duration-200 text-left ${
                      !isDark
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-primary/50 hover:bg-muted/50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-amber-100">
                          <Sun className="h-4 w-4 text-amber-600" />
                        </div>
                        <span className="font-medium text-foreground">{t('settings.lightMode')}</span>
                      </div>
                      {!isDark && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="p-1 rounded-full bg-primary"
                        >
                          <Check className="h-3 w-3 text-primary-foreground" />
                        </motion.div>
                      )}
                    </div>
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setTheme('dark')}
                    className={`p-4 rounded-xl border-2 transition-all duration-200 text-left ${
                      isDark
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-primary/50 hover:bg-muted/50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-indigo-100 dark:bg-indigo-900/50">
                          <Moon className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                        </div>
                        <span className="font-medium text-foreground">{t('settings.darkMode')}</span>
                      </div>
                      {isDark && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="p-1 rounded-full bg-primary"
                        >
                          <Check className="h-3 w-3 text-primary-foreground" />
                        </motion.div>
                      )}
                    </div>
                  </motion.button>
                </div>
              </CardContent>
            </Card>

            {/* Notification Settings */}
            <Card className="border-border/50 shadow-gentle">
              <CardHeader className="pb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <Bell className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{t('settings.notifications')}</CardTitle>
                    <CardDescription>{t('settings.notificationsDesc')}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Girivalam Reminders */}
                <div className="flex items-center justify-between p-4 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-orange-100 dark:bg-orange-900/30">
                      <Moon className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                    </div>
                    <div>
                      <Label className="font-medium cursor-pointer">{t('settings.girivalamReminders')}</Label>
                      <p className="text-xs text-muted-foreground">{t('settings.girivalamRemindersDesc')}</p>
                    </div>
                  </div>
                  <Switch
                    checked={notifications.girivalamReminders}
                    onCheckedChange={() => handleNotificationChange('girivalamReminders')}
                  />
                </div>

                {/* Safety Alerts */}
                <div className="flex items-center justify-between p-4 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-red-100 dark:bg-red-900/30">
                      <Shield className="h-4 w-4 text-red-600 dark:text-red-400" />
                    </div>
                    <div>
                      <Label className="font-medium cursor-pointer">{t('settings.safetyAlerts')}</Label>
                      <p className="text-xs text-muted-foreground">{t('settings.safetyAlertsDesc')}</p>
                    </div>
                  </div>
                  <Switch
                    checked={notifications.safetyAlerts}
                    onCheckedChange={() => handleNotificationChange('safetyAlerts')}
                  />
                </div>

                {/* App Updates */}
                <div className="flex items-center justify-between p-4 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                      <Smartphone className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <Label className="font-medium cursor-pointer">{t('settings.appUpdates')}</Label>
                      <p className="text-xs text-muted-foreground">{t('settings.appUpdatesDesc')}</p>
                    </div>
                  </div>
                  <Switch
                    checked={notifications.appUpdates}
                    onCheckedChange={() => handleNotificationChange('appUpdates')}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Journey Experience Settings */}
            <Card className="border-border/50 shadow-gentle">
              <CardHeader className="pb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <Music2 className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">Journey Experience</CardTitle>
                    <CardDescription>Audio and guidance during your walk</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-amber-100 dark:bg-amber-900/30">
                      <Music2 className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                    </div>
                    <div>
                      <Label className="font-medium cursor-pointer">Temple Proximity Audio</Label>
                      <p className="text-xs text-muted-foreground">
                        Auto-play mantra when you approach an Ashta Lingam temple
                      </p>
                    </div>
                  </div>
                  <Switch
                    checked={journeySettings.proximityAudioEnabled}
                    onCheckedChange={(v) =>
                      setJourneySettings(prev => ({ ...prev, proximityAudioEnabled: v }))
                    }
                  />
                </div>
              </CardContent>
            </Card>

            {/* Privacy Note */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="flex items-center justify-center gap-2 p-4 rounded-xl bg-muted/30 border border-border/50"
            >
              <Shield className="h-4 w-4 text-muted-foreground" />
              <p className="text-sm text-muted-foreground text-center">
                {t('settings.privacyNote')}
              </p>
            </motion.div>
          </div>
        </motion.div>
      </main>
    </div>
  );
};

export default Settings;
