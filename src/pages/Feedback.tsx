import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Send, Star, MessageSquare, CheckCircle2 } from "lucide-react";
import SiteHeader from "@/components/SiteHeader";
import { SpiritualCard } from "@/components/SpiritualCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { logger } from "@/lib/logger";
import Seo from "@/components/Seo";

const feedbackTypes = [
  { value: "suggestion", label: "💡 Suggestion" },
  { value: "appreciation", label: "🙏 Appreciation" },
  { value: "complaint", label: "😔 Complaint" },
  { value: "technical_issue", label: "🔧 Technical Issue" },
  { value: "donation_query", label: "💰 Donation-related Query" },
];

// Country codes with phone length validation
const countryCodes = [
  { code: "+91", flag: "🇮🇳", name: "India", minLength: 10, maxLength: 10 },
  { code: "+1", flag: "🇺🇸", name: "USA", minLength: 10, maxLength: 10 },
  { code: "+44", flag: "🇬🇧", name: "UK", minLength: 10, maxLength: 11 },
  { code: "+61", flag: "🇦🇺", name: "Australia", minLength: 9, maxLength: 9 },
  { code: "+65", flag: "🇸🇬", name: "Singapore", minLength: 8, maxLength: 8 },
  { code: "+971", flag: "🇦🇪", name: "UAE", minLength: 9, maxLength: 9 },
  { code: "+966", flag: "🇸🇦", name: "Saudi Arabia", minLength: 9, maxLength: 9 },
  { code: "+60", flag: "🇲🇾", name: "Malaysia", minLength: 9, maxLength: 10 },
  { code: "+49", flag: "🇩🇪", name: "Germany", minLength: 10, maxLength: 11 },
  { code: "+33", flag: "🇫🇷", name: "France", minLength: 9, maxLength: 9 },
  { code: "+81", flag: "🇯🇵", name: "Japan", minLength: 10, maxLength: 11 },
  { code: "+86", flag: "🇨🇳", name: "China", minLength: 11, maxLength: 11 },
  { code: "+82", flag: "🇰🇷", name: "South Korea", minLength: 10, maxLength: 11 },
  { code: "+27", flag: "🇿🇦", name: "South Africa", minLength: 9, maxLength: 9 },
  { code: "+55", flag: "🇧🇷", name: "Brazil", minLength: 10, maxLength: 11 },
  { code: "+52", flag: "🇲🇽", name: "Mexico", minLength: 10, maxLength: 10 },
  { code: "+7", flag: "🇷🇺", name: "Russia", minLength: 10, maxLength: 10 },
  { code: "+39", flag: "🇮🇹", name: "Italy", minLength: 10, maxLength: 10 },
  { code: "+34", flag: "🇪🇸", name: "Spain", minLength: 9, maxLength: 9 },
  { code: "+31", flag: "🇳🇱", name: "Netherlands", minLength: 9, maxLength: 9 },
];

const Feedback = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [countryCode, setCountryCode] = useState("+91");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [phoneError, setPhoneError] = useState("");
  
  const [formData, setFormData] = useState({
    name: "",
    feedback_type: "suggestion",
    message: "",
    rating: 0,
    is_public: false,
  });

  const getSelectedCountry = () => {
    return countryCodes.find(c => c.code === countryCode) || countryCodes[0];
  };

  const validatePhoneNumber = (phone: string, code: string): { valid: boolean; error: string } => {
    const country = countryCodes.find(c => c.code === code);
    if (!country) {
      return { valid: false, error: "Invalid country code" };
    }

    const digitsOnly = phone.replace(/\D/g, '');
    
    if (!digitsOnly) {
      return { valid: false, error: "Mobile number is required" };
    }

    if (digitsOnly.length < country.minLength) {
      return { valid: false, error: `Mobile number must be at least ${country.minLength} digits for ${country.name}` };
    }

    if (digitsOnly.length > country.maxLength) {
      return { valid: false, error: `Mobile number must be at most ${country.maxLength} digits for ${country.name}` };
    }

    return { valid: true, error: "" };
  };

  const handlePhoneChange = (value: string) => {
    // Only allow digits
    const digitsOnly = value.replace(/\D/g, '');
    const country = getSelectedCountry();
    // Limit to max length for the country
    const limited = digitsOnly.slice(0, country.maxLength);
    setPhoneNumber(limited);
    
    // Clear error when user starts typing
    if (phoneError) {
      setPhoneError("");
    }
  };

  const handleCountryCodeChange = (code: string) => {
    setCountryCode(code);
    setPhoneNumber(""); // Reset phone when country changes
    setPhoneError("");
  };

  const handleRating = (rating: number) => {
    setFormData((prev) => ({ ...prev, rating }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate phone number
    const phoneValidation = validatePhoneNumber(phoneNumber, countryCode);
    if (!phoneValidation.valid) {
      setPhoneError(phoneValidation.error);
      toast({
        title: "Invalid Mobile Number",
        description: phoneValidation.error,
        variant: "destructive",
      });
      return;
    }

    if (!formData.message.trim()) {
      toast({
        title: "Message Required",
        description: "Please enter your feedback message.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const deviceType = /Mobile|Android|iPhone/i.test(navigator.userAgent)
        ? "mobile"
        : "desktop";

      const fullMobileNumber = `${countryCode}${phoneNumber}`;

      const { error } = await supabase.from("feedback").insert({
        name: formData.name || null,
        mobile_number: fullMobileNumber,
        feedback_type: formData.feedback_type,
        message: formData.message,
        rating: formData.rating || null,
        is_public: formData.is_public,
        device_type: deviceType,
        user_agent: navigator.userAgent,
        user_id: user?.id || null,
      });

      if (error) throw error;

      setIsSubmitted(true);
      toast({
        title: "🙏 Thank You!",
        description: "Your feedback helps us serve devotees better.",
      });
    } catch (error) {
      logger.error("Feedback submission error:", error);
      toast({
        title: "Submission Failed",
        description: "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setFormData({
      name: "",
      feedback_type: "suggestion",
      message: "",
      rating: 0,
      is_public: false,
    });
    setPhoneNumber("");
    setCountryCode("+91");
    setPhoneError("");
    setIsSubmitted(false);
  };

  const country = getSelectedCountry();

  return (
    <div className="min-h-screen bg-background">
      <Seo
        title="Feedback | MyGirivalam.in"
        description="Share suggestions, appreciation, or report issues with MyGirivalam.in — the Tiruvannamalai Girivalam guide with live GPS tracking and temple timings."
        canonical="/feedback"
      />
      <SiteHeader />

      <div className="relative min-h-screen flex flex-col">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-background to-background" />

        {/* Back Button */}
        <div className="relative z-10 pt-20 px-4">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="text-sm">Back to Home</span>
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
            <div className="mx-auto mb-6 p-4 bg-primary/10 rounded-full w-fit">
              <MessageSquare className="h-10 w-10 text-primary" />
            </div>

            <h1 className="font-playfair text-3xl md:text-4xl font-bold mb-3">
              <span className="spiritual-gradient-text">Feedback & Suggestions</span>
            </h1>
            <p className="text-muted-foreground max-w-md mx-auto">
              Your voice helps us improve the sacred Girivalam experience for all devotees
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="w-full max-w-lg"
          >
            {isSubmitted ? (
              <SpiritualCard className="p-8 text-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 200, damping: 15 }}
                >
                  <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto mb-4" />
                </motion.div>
                <h2 className="font-playfair text-2xl font-semibold mb-3">
                  Thank you 🙏
                </h2>
                <p className="text-muted-foreground mb-6">
                  Your feedback helps us serve devotees better.
                </p>
                <Button onClick={handleReset} variant="outline">
                  Submit Another Feedback
                </Button>
              </SpiritualCard>
            ) : (
              <SpiritualCard className="p-6">
                <form onSubmit={handleSubmit} className="space-y-5">
                  {/* Rating */}
                  <div className="text-center pb-4 border-b border-border/50">
                    <Label className="text-sm font-medium mb-3 block">
                      How was your experience with Arunachala Vibe?
                    </Label>
                    <div className="flex justify-center gap-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => handleRating(star)}
                          className="p-1 transition-transform hover:scale-110 focus:outline-none"
                        >
                          <Star
                            className={`h-8 w-8 transition-colors ${
                              star <= formData.rating
                                ? "fill-amber-400 text-amber-400"
                                : "text-muted-foreground/40"
                            }`}
                          />
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Name */}
                  <div className="space-y-2">
                    <Label htmlFor="name">Name (Optional)</Label>
                    <Input
                      id="name"
                      placeholder="Your name"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, name: e.target.value }))
                      }
                    />
                  </div>

                  {/* Mobile - Required with country code */}
                  <div className="space-y-2">
                    <Label htmlFor="mobile">
                      Mobile Number <span className="text-destructive">*</span>
                    </Label>
                    <div className="flex gap-2">
                      <Select value={countryCode} onValueChange={handleCountryCodeChange}>
                        <SelectTrigger className="w-[120px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="max-h-[300px]">
                          {countryCodes.map((c) => (
                            <SelectItem key={c.code} value={c.code}>
                              {c.flag} {c.code}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Input
                        id="mobile"
                        type="tel"
                        inputMode="numeric"
                        placeholder={`Enter ${country.minLength} digit number`}
                        value={phoneNumber}
                        onChange={(e) => handlePhoneChange(e.target.value)}
                        className={`flex-1 ${phoneError ? 'border-destructive focus-visible:ring-destructive' : ''}`}
                        required
                      />
                    </div>
                    {phoneError && (
                      <p className="text-sm text-destructive">{phoneError}</p>
                    )}
                    <p className="text-xs text-muted-foreground">
                      {country.flag} {country.name}: {country.minLength === country.maxLength 
                        ? `${country.minLength} digits required` 
                        : `${country.minLength}-${country.maxLength} digits required`
                      }
                    </p>
                  </div>

                  {/* Feedback Type */}
                  <div className="space-y-2">
                    <Label>Feedback Type</Label>
                    <Select
                      value={formData.feedback_type}
                      onValueChange={(value) =>
                        setFormData((prev) => ({ ...prev, feedback_type: value }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        {feedbackTypes.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Message */}
                  <div className="space-y-2">
                    <Label htmlFor="message">
                      Your Message <span className="text-destructive">*</span>
                    </Label>
                    <Textarea
                      id="message"
                      placeholder="Share your thoughts, suggestions, or experiences..."
                      className="min-h-[120px] resize-none"
                      value={formData.message}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, message: e.target.value }))
                      }
                      required
                    />
                  </div>

                  {/* Public Toggle */}
                  <div className="flex items-start gap-3 p-4 bg-muted/50 rounded-xl">
                    <Checkbox
                      id="is_public"
                      checked={formData.is_public}
                      onCheckedChange={(checked) =>
                        setFormData((prev) => ({
                          ...prev,
                          is_public: checked as boolean,
                        }))
                      }
                    />
                    <div className="space-y-1">
                      <Label
                        htmlFor="is_public"
                        className="text-sm font-medium cursor-pointer"
                      >
                        Share as Devotee Blessing
                      </Label>
                      <p className="text-xs text-muted-foreground">
                        Allow this feedback to be shown publicly as a devotee review
                      </p>
                    </div>
                  </div>

                  {/* Submit */}
                  <Button
                    type="submit"
                    className="w-full"
                    size="lg"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <span className="flex items-center gap-2">
                        <span className="h-4 w-4 border-2 border-current border-r-transparent rounded-full animate-spin" />
                        Submitting...
                      </span>
                    ) : (
                      <span className="flex items-center gap-2">
                        <Send className="h-4 w-4" />
                        Submit Feedback
                      </span>
                    )}
                  </Button>
                </form>
              </SpiritualCard>
            )}
          </motion.div>

          {/* Blessings Wall Preview */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="mt-8 text-center text-sm text-muted-foreground"
          >
            <p>💝 Made with devotion for Arunachala devotees</p>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Feedback;
