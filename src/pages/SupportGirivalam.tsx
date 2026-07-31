import { useState } from "react";
import { Helmet } from "react-helmet-async";
import SiteHeader from "@/components/SiteHeader";
import { SpiritualCard } from "@/components/SpiritualCard";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { toast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import {
  Droplets,
  UtensilsCrossed,
  Smartphone,
  Laptop,
  Shield,
  Heart,
  Copy,
  Check,
  Phone,
  MessageCircle,
  Flame,
} from "lucide-react";

const UPI_ID = "paytm.s14g9v9@pty";
const CONTACT_NAME = "Chandru Venkatachalam";
const CONTACT_PHONE = "+91 8925483701";
const WHATSAPP_NUMBER = "918925483701";

const donationCategories = [
  {
    id: 1,
    icon: Droplets,
    title: "Donate Water Bottles",
    description: "Provide clean drinking water to Girivalam devotees walking around the sacred mountain",
    amount: "50",
    color: "from-blue-500/20 to-cyan-500/10",
    iconColor: "text-blue-500",
    bgColor: "bg-blue-500/10",
  },
  {
    id: 2,
    icon: UtensilsCrossed,
    title: "Donate Food (Annadhanam)",
    description: "Support free food distribution for devotees during their sacred journey",
    amount: "100",
    color: "from-orange-500/20 to-amber-500/10",
    iconColor: "text-orange-500",
    bgColor: "bg-orange-500/10",
  },
  {
    id: 3,
    icon: Smartphone,
    title: "Support App Development",
    description: "Help build a dedicated mobile application for easier Girivalam experience",
    amount: "200",
    color: "from-purple-500/20 to-violet-500/10",
    iconColor: "text-purple-500",
    bgColor: "bg-purple-500/10",
  },
  {
    id: 4,
    icon: Laptop,
    title: "Donate Laptop / PC",
    description: "Support the creator developing this website using only a mobile device - any laptop helps!",
    amount: "500",
    color: "from-emerald-500/20 to-green-500/10",
    iconColor: "text-emerald-500",
    bgColor: "bg-emerald-500/10",
    hasContact: true,
  },
  {
    id: 5,
    icon: Shield,
    title: "Safety & Help Services",
    description: "Fund emergency services, first aid kits, and safety volunteers along the path",
    amount: "150",
    color: "from-red-500/20 to-rose-500/10",
    iconColor: "text-red-500",
    bgColor: "bg-red-500/10",
  },
];

const SupportGirivalam = () => {
  const { t } = useLanguage();
  const [copiedId, setCopiedId] = useState<number | null>(null);

  const handleUPIPayment = (amount: string, purpose: string) => {
    const upiLink = `upi://pay?pa=${UPI_ID}&pn=${encodeURIComponent(CONTACT_NAME)}&am=${amount}&cu=INR&tn=${encodeURIComponent(purpose)}`;
    window.location.href = upiLink;
  };

  const handleCopyUPI = async (id: number) => {
    try {
      await navigator.clipboard.writeText(UPI_ID);
      setCopiedId(id);
      toast({
        title: "UPI ID Copied",
        description: "Paste it in your payment app",
      });
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      toast({
        title: "Copy failed",
        description: "Please copy manually: " + UPI_ID,
        variant: "destructive",
      });
    }
  };

  const handleWhatsAppContact = () => {
    const message = encodeURIComponent(
      "Hello! I would like to donate a laptop/PC to support Girivalam app development."
    );
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${message}`, "_blank");
  };

  const handleCall = () => {
    window.location.href = `tel:${CONTACT_PHONE}`;
  };

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>Support Girivalam - Donate | Arunachala Vibe</title>
        <meta
          name="description"
          content="Support sacred Girivalam services through donations for water, food, app development, and safety services."
        />
      </Helmet>

      <SiteHeader />

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-10"
        >
          <div className="mx-auto mb-6 w-20 h-20 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center shadow-xl">
            <Flame className="h-10 w-10 text-white" />
          </div>
          <h1 className="font-playfair text-3xl md:text-4xl font-bold mb-3">
            Support Girivalam
          </h1>
          <p className="text-muted-foreground max-w-md mx-auto">
            Your generous contributions help maintain sacred services for devotees walking the holy path around Arunachala
          </p>
        </motion.div>

        {/* Donation Cards Grid */}
        <div className="grid gap-6 md:grid-cols-2">
          {donationCategories.map((category, index) => (
            <motion.div
              key={category.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <SpiritualCard className={`h-full bg-gradient-to-br ${category.color} border-none`}>
                <div className="p-6">
                  <div className="flex items-start gap-4 mb-4">
                    <div className={`p-3 rounded-xl ${category.bgColor}`}>
                      <category.icon className={`h-6 w-6 ${category.iconColor}`} />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg mb-1">{category.title}</h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {category.description}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {/* UPI Payment Button */}
                    <Button
                      onClick={() => handleUPIPayment(category.amount, category.title)}
                      className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-medium"
                    >
                      <Heart className="h-4 w-4 mr-2" />
                      Donate ₹{category.amount}
                    </Button>

                    {/* Copy UPI Button */}
                    <Button
                      variant="outline"
                      onClick={() => handleCopyUPI(category.id)}
                      className="w-full"
                    >
                      {copiedId === category.id ? (
                        <>
                          <Check className="h-4 w-4 mr-2 text-green-500" />
                          UPI Copied!
                        </>
                      ) : (
                        <>
                          <Copy className="h-4 w-4 mr-2" />
                          Copy UPI ID
                        </>
                      )}
                    </Button>

                    {/* WhatsApp Contact for Laptop Donation */}
                    {category.hasContact && (
                      <Button
                        variant="secondary"
                        onClick={handleWhatsAppContact}
                        className="w-full bg-green-500/10 text-green-600 hover:bg-green-500/20 border-green-500/20"
                      >
                        <MessageCircle className="h-4 w-4 mr-2" />
                        Contact via WhatsApp
                      </Button>
                    )}
                  </div>
                </div>
              </SpiritualCard>
            </motion.div>
          ))}
        </div>

        {/* Contact Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-10"
        >
          <SpiritualCard className="bg-muted/30">
            <div className="p-6">
              <h3 className="font-semibold text-lg mb-4 text-center">Contact for Support</h3>
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-center sm:text-left">
                  <p className="font-medium">{CONTACT_NAME}</p>
                  <p className="text-sm text-muted-foreground">{CONTACT_PHONE}</p>
                </div>
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={handleCall}
                    className="h-12 w-12 rounded-full"
                  >
                    <Phone className="h-5 w-5" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={handleWhatsAppContact}
                    className="h-12 w-12 rounded-full bg-green-500/10 text-green-600 hover:bg-green-500/20 border-green-500/20"
                  >
                    <MessageCircle className="h-5 w-5" />
                  </Button>
                </div>
              </div>
            </div>
          </SpiritualCard>
        </motion.div>

        {/* Footer Message */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="text-center text-sm text-muted-foreground mt-8"
        >
          <Heart className="inline h-4 w-4 text-orange-500 mr-1" />
          Made with devotion for Arunachala devotees
        </motion.p>
      </main>
    </div>
  );
};

export default SupportGirivalam;
