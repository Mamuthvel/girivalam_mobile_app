import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  ArrowLeft, 
  Phone, 
  Shield, 
  Ambulance, 
  Flame, 
  Baby, 
  Building2,
  AlertTriangle
} from "lucide-react";
import SiteHeader from "@/components/SiteHeader";
import { SpiritualCard } from "@/components/SpiritualCard";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";

interface EmergencyContact {
  id: string;
  service: string;
  serviceKey: string;
  number: string;
  description: string;
  descriptionKey: string;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
}

const emergencyContacts: EmergencyContact[] = [
  {
    id: "police",
    service: "Police",
    serviceKey: "emergency.police",
    number: "100",
    description: "24×7 Emergency Police Service",
    descriptionKey: "emergency.policeDesc",
    icon: <Shield className="h-6 w-6" />,
    color: "text-blue-600 dark:text-blue-400",
    bgColor: "bg-blue-100 dark:bg-blue-900/30",
  },
  {
    id: "ambulance",
    service: "Ambulance",
    serviceKey: "emergency.ambulance",
    number: "108",
    description: "Free Emergency Medical Services",
    descriptionKey: "emergency.ambulanceDesc",
    icon: <Ambulance className="h-6 w-6" />,
    color: "text-red-600 dark:text-red-400",
    bgColor: "bg-red-100 dark:bg-red-900/30",
  },
  {
    id: "fire",
    service: "Fire Department",
    serviceKey: "emergency.fire",
    number: "101",
    description: "Fire & Rescue Services",
    descriptionKey: "emergency.fireDesc",
    icon: <Flame className="h-6 w-6" />,
    color: "text-orange-600 dark:text-orange-400",
    bgColor: "bg-orange-100 dark:bg-orange-900/30",
  },
  {
    id: "childline",
    service: "Childline",
    serviceKey: "emergency.childline",
    number: "1098",
    description: "Child Protection Helpline",
    descriptionKey: "emergency.childlineDesc",
    icon: <Baby className="h-6 w-6" />,
    color: "text-purple-600 dark:text-purple-400",
    bgColor: "bg-purple-100 dark:bg-purple-900/30",
  },
  {
    id: "hospital",
    service: "Govt. Hospital",
    serviceKey: "emergency.hospital",
    number: "04175-252170",
    description: "Thiruvannamalai Govt. Hospital",
    descriptionKey: "emergency.hospitalDesc",
    icon: <Building2 className="h-6 w-6" />,
    color: "text-green-600 dark:text-green-400",
    bgColor: "bg-green-100 dark:bg-green-900/30",
  },
  {
    id: "women",
    service: "Women Helpline",
    serviceKey: "emergency.women",
    number: "181",
    description: "Women Safety & Support",
    descriptionKey: "emergency.womenDesc",
    icon: <Phone className="h-6 w-6" />,
    color: "text-pink-600 dark:text-pink-400",
    bgColor: "bg-pink-100 dark:bg-pink-900/30",
  },
];

const EmergencyContacts = () => {
  const { t } = useLanguage();

  const handleDial = (number: string) => {
    // Opens the phone's dial pad with number prefilled (does not auto-call)
    window.location.href = `tel:${number}`;
  };

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>Emergency Contacts — Tiruvannamalai Girivalam | MyGirivalam.in</title>
        <meta name="description" content="Important emergency contacts for Tiruvannamalai Girivalam pilgrims. Police, ambulance, hospital, temple trust helpline, and fire service numbers." />
        <link rel="canonical" href="https://mygirivalam.in/emergency-contacts" />
      </Helmet>
      <SiteHeader />

      <div className="relative min-h-screen flex flex-col">
        <div className="absolute inset-0 bg-gradient-to-b from-destructive/5 via-background to-background" />

        {/* Back Button */}
        <div className="relative z-10 pt-20 px-4">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="text-sm">{t('common.back')}</span>
          </Link>
        </div>

        {/* Main Content */}
        <div className="relative z-10 flex-1 flex flex-col items-center px-4 py-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-8"
          >
            <div className="mx-auto mb-6 p-4 bg-destructive/10 rounded-full w-fit">
              <AlertTriangle className="h-10 w-10 text-destructive" />
            </div>

            <h1 className="font-playfair text-3xl md:text-4xl font-bold mb-3">
              <span className="text-destructive">{t('emergency.title')}</span>
            </h1>
            <p className="text-muted-foreground max-w-md mx-auto">
              {t('emergency.subtitle')}
            </p>
          </motion.div>

          {/* Emergency Contacts List */}
          <div className="w-full max-w-lg space-y-4">
            {emergencyContacts.map((contact, index) => (
              <motion.div
                key={contact.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
              >
                <SpiritualCard className="p-4">
                  <div className="flex items-center gap-4">
                    {/* Icon */}
                    <div className={`p-3 rounded-xl ${contact.bgColor} ${contact.color}`}>
                      {contact.icon}
                    </div>

                    {/* Service Info */}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-lg">
                        {t(contact.serviceKey) || contact.service}
                      </h3>
                      <p className="text-sm text-muted-foreground truncate">
                        {t(contact.descriptionKey) || contact.description}
                      </p>
                    </div>

                    {/* Dial Button */}
                    <Button
                      size="lg"
                      onClick={() => handleDial(contact.number)}
                      className="min-w-[100px] font-mono text-lg font-bold bg-primary hover:bg-primary/90"
                    >
                      <Phone className="h-4 w-4 mr-2" />
                      {contact.number}
                    </Button>
                  </div>
                </SpiritualCard>
              </motion.div>
            ))}
          </div>

          {/* Safety Note */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="mt-8 text-center"
          >
            <SpiritualCard className="p-4 bg-muted/50 max-w-lg mx-auto">
              <p className="text-sm text-muted-foreground">
                <span className="font-medium">🙏 {t('emergency.safetyNote')}</span>
                <br />
                {t('emergency.safetyMessage')}
              </p>
            </SpiritualCard>
          </motion.div>

          {/* Footer Note */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.8 }}
            className="mt-6 text-center text-sm text-muted-foreground"
          >
            <p>🙏 {t('emergency.footer')}</p>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default EmergencyContacts;
