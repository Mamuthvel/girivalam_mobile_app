import { Helmet } from "react-helmet-async";
import { Navigation } from "@/components/Navigation";
import SiteFooter from "@/components/SiteFooter";
import { SpiritualCard } from "@/components/SpiritualCard";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { SacredAudioPlayer } from "@/components/SacredAudioPlayer";
import { useAllLingaAudio, useAllChantAudio } from "@/hooks/useSacredAudio";
import { AuthPreview } from "@/components/AuthPreview";
import { SpiritualGuideTeaser } from "@/components/previews/SpiritualGuideTeaser";
import { useAuth } from "@/contexts/AuthContext";
import {
  Play,
  Pause,
  BookOpen,
  Clock,
  CheckCircle,
  AlertCircle,
  Volume2,
  Languages,
  MapPin
} from "lucide-react";
import spiritualGuideImage from "@/assets/spiritual-guide.jpg";
import { useState, useEffect } from "react";

const ashtaLingamData = [
  {
    id: 1,
    name: "Indra Lingam",
    tamilName: "இந்திர லிங்கம்",
    direction: "East",
    deity: "Lord Indra - King of Gods",
    tamilDeity: "இந்திரன் - தேவர்களின் ராஜா",
    mantra: "Om Indraya Namaha",
    tamilMantra: "ஓம் இந்திராய நமஹ",
    story: "The first stop on the sacred Girivalam, representing the dawn and new beginnings. Lord Indra, the ruler of heaven, is said to have worshipped here to regain his lost glory and power.",
    tamilStory: "புனித கிரிவலத்தின் முதல் நிறுத்தம், விடியல் மற்றும் புதிய தொடக்கங்களைக் குறிக்கிறது. சொர்க்கத்தின் அரசன் இந்திரன் தனது இழந்த மகிமையையும் சக்தியையும் மீண்டும் பெற இங்கே வழிபட்டதாக கூறப்படுகிறது.",
    significance: "Brings prosperity, removes obstacles from life, and grants leadership qualities",
    tamilSignificance: "செழிப்பு அளிக்கிறது, வாழ்க்கையில் உள்ள தடைகளை நீக்குகிறது, தலைமைத்துவ குணங்களை வழங்குகிறது",
    timing: "Best visited at dawn (5:30-7:00 AM)",
    tamilTiming: "விடியலில் (காலை 5:30-7:00) வருவது சிறந்தது",
    specialFeatures: "First rays of sun hit this temple, making it highly auspicious for new ventures",
    tamilSpecialFeatures: "சூரியனின் முதல் கிரணங்கள் இந்த கோவிலைத் தாக்குகின்றன, புதிய முயற்சிகளுக்கு மிகவும் சுபகரமானது"
  },
  {
    id: 2,
    name: "Agni Lingam",
    tamilName: "அக்னி லிங்கம்",
    direction: "Southeast",
    deity: "Lord Agni - God of Fire",
    tamilDeity: "அக்னி பகவான் - அக்னி தேவன்",
    mantra: "Om Agnaye Namaha",
    tamilMantra: "ஓம் அக்னயே நமஹ",
    story: "Sacred to Agni, the fire god. This temple purifies all sins and negative karma through the divine fire element. Devotees believe that circumambulating here burns away all impurities.",
    tamilStory: "அக்னி தேவனுக்கு புனிதமான இடம். இந்த கோவில் தெய்வீக அக்னி உறுப்பு மூலம் அனைத்து பாவங்களையும் எதிர்மறை கர்மங்களையும் சுத்திகரிக்கிறது. இங்கே பிரதக்ஷிணம் செய்வது அனைத்து அசுத்தங்களையும் எரித்துவிடும் என்று பக்தர்கள் நம்புகின்றனர்.",
    significance: "Purifies the soul, burns away negativities, and grants digestive health",
    tamilSignificance: "ஆத்மாவை சுத்திகரிக்கிறது, எதிர்மறைகளை எரித்துவிடுகிறது, செரிமான ஆரோக்கியத்தை வழங்குகிறது",
    timing: "Morning prayers (6:00-8:00 AM)",
    tamilTiming: "காலை பிரார்த்தனைகள் (காலை 6:00-8:00)",
    specialFeatures: "Sacred fire ceremony (homa) performed regularly, especially on Tuesdays",
    tamilSpecialFeatures: "புனித அக்னி சடங்கு (ஹோமம்) வழக்கமாக, குறிப்பாக செவ்வாய்கிழமைகளில் நடத்தப்படுகிறது"
  },
  {
    id: 3,
    name: "Yama Lingam",
    tamilName: "யம லிங்கம்",
    direction: "South",
    deity: "Lord Yama - God of Death and Dharma",
    tamilDeity: "யம ராஜன் - மரண தேவன் மற்றும் தர்ம தேவன்",
    mantra: "Om Yamaya Namaha",
    tamilMantra: "ஓம் யமாய நமஹ",
    story: "Lord Yama, the judge of souls, is believed to have received salvation by worshipping Lord Shiva at this sacred spot. This temple provides protection from untimely death and grants longevity.",
    tamilStory: "ஆத்மாக்களின் நீதிபதியான யம ராஜன் இந்த புனித இடத்தில் சிவபெருமானை வழிபட்டு முக்தி பெற்றதாக நம்பப்படுகிறது. இந்த கோவில் அகால மரணத்திலிருந்து பாதுகாப்பு அளித்து நீண்ட ஆயுளை வழங்குகிறது.",
    significance: "Protects from untimely death, grants longevity, and ensures righteous path",
    tamilSignificance: "அகால மரணத்திலிருந்து பாதுகாக்கிறது, நீண்ட ஆயுள் வழங்குகிறது, நீதியான பாதையை உறுதி செய்கிறது",
    timing: "Midday worship (11:00 AM-1:00 PM)",
    tamilTiming: "மதிய வழிபாடு (காலை 11:00-மதியம் 1:00)",
    specialFeatures: "Devotees offer special prayers for ancestors and departed souls",
    tamilSpecialFeatures: "பக்தர்கள் மூதாதையர் மற்றும் இறந்த ஆத்மாக்களுக்காக சிறப்பு பிரார்த்தனைகள் செய்கின்றனர்"
  },
  {
    id: 4,
    name: "Nirruti Lingam",
    tamilName: "நிரிருதி லிங்கம்",
    direction: "Southwest",
    deity: "Lord Nirruti - Guardian of Southwest",
    tamilDeity: "நிரிருதி - தென்மேற்கின் பாதுகாவலர்",
    mantra: "Om Nirrutaye Namaha",
    tamilMantra: "ஓம் நிரிருதயே நமஹ",
    story: "This lingam represents protection from evil forces and negative energies from the southwest direction. Nirruti is the guardian deity who protects devotees from unseen dangers and black magic.",
    tamilStory: "இந்த லிங்கம் தென்மேற்கு திசையிலிருந்து வரும் தீய சக்திகள் மற்றும் எதிர்மறை ஆற்றல்களிலிருந்து பாதுகாப்பைக் குறிக்கிறது. நிரிருதி என்பது பக்தர்களை கண்ணுக்குத் தெரியாத ஆபத்துகள் மற்றும் கருந்தொழிலிலிருந்து பாதுகாக்கும் காவல் தெய்வம்.",
    significance: "Removes fear, provides divine protection, and destroys evil influences",
    tamilSignificance: "பயத்தை நீக்குகிறது, தெய்வீக பாதுகாப்பை வழங்குகிறது, தீய தாக்கங்களை அழிக்கிறது",
    timing: "Afternoon prayers (2:00-4:00 PM)",
    tamilTiming: "மதிய பிற்பகல் பிரார்த்தனைகள் (மதியம் 2:00-4:00)",
    specialFeatures: "Many devotees perform special rituals here to ward off negative energies",
    tamilSpecialFeatures: "பல பக்தர்கள் எதிர்மறை ஆற்றல்களை விரட்ட இங்கே சிறப்பு சடங்குகள் செய்கின்றனர்"
  },
  {
    id: 5,
    name: "Varuna Lingam",
    tamilName: "வருண லிங்கம்",
    direction: "West",
    deity: "Lord Varuna - God of Water and Oceans",
    tamilDeity: "வருண பகவான் - நீர் மற்றும் கடல்களின் தேவன்",
    mantra: "Om Varunaya Namaha",
    tamilMantra: "ஓம் வருணாய நமஹ",
    story: "Lord Varuna, the ruler of waters and judge of moral conduct, is worshipped here. This temple is especially powerful for those seeking purification and cleansing of sins through divine grace.",
    tamilStory: "நீரின் அதிபதியும் தார்மீக நடத்தையின் நீதிபதியுமான வருண பகவான் இங்கே வழிபடப்படுகிறார். தெய்வீக அருள் மூலம் சுத்திகரிப்பு மற்றும் பாவ நிவாரணம் தேடுபவர்களுக்கு இந்த கோவில் மிகவும் சக்தி வாய்ントது.",
    significance: "Grants purity of mind and body, controls rainfall, and removes water-related problems",
    tamilSignificance: "மன மற்றும் உடல் தூய்மையை வழங்குகிறது, மழையை கட்டுப்படுத்துகிறது, நீர் தொடர்பான பிரச்சனைகளை நீக்குகிறது",
    timing: "Evening prayers (5:00-7:00 PM)",
    tamilTiming: "மாலை பிரார்த்தனைகள் (மாலை 5:00-7:00)",
    specialFeatures: "Devotees offer water and perform abhishekam for purification",
    tamilSpecialFeatures: "பக்தர்கள் சுத்திகரிப்புக்காக நீர் காணிக்கை செலுத்தி அபிஷேகம் செய்கின்றனர்"
  },
  {
    id: 6,
    name: "Vayu Lingam",
    tamilName: "வாயு லிங்கம்",
    direction: "Northwest",
    deity: "Lord Vayu - God of Wind and Life Force",
    tamilDeity: "வாயு பகவான் - காற்று மற்றும் உயிர் சக்தியின் தேவன்",
    mantra: "Om Vayave Namaha",
    tamilMantra: "ஓம் வாயவே நமஹ",
    story: "Lord Vayu, the vital force of life, is honored at this temple. Devotees believe that worshipping here cures respiratory ailments and grants the power of eloquent speech and wisdom.",
    tamilStory: "உயிரின் முக்கிய சக்தியான வாயு பகவான் இந்த கோவிலில் கௌரவிக்கப்படுகிறார். இங்கே வழிபடுவது சுவாச நோய்களை குணப்படுத்தும் மற்றும் சொற்செறிவு மற்றும் ஞானத்தின் சக்தியை வழங்கும் என்று பக்தர்கள் நம்புகின்றனர்.",
    significance: "Cures respiratory problems, grants eloquent speech, and improves mental clarity",
    tamilSignificance: "சுவாச பிரச்சனைகளை குணப்படுத்துகிறது, சொற்செறிவை வழங்குகிறது, மன தெளிவை மேம்படுத்துகிறது",
    timing: "Late afternoon (4:00-6:00 PM)",
    tamilTiming: "மாலை நேரம் (மாலை 4:00-6:00)",
    specialFeatures: "Many singers and speakers visit here to improve their vocal abilities",
    tamilSpecialFeatures: "பல பாடகர்கள் மற்றும் பேச்சாளர்கள் தங்கள் குரல் திறமைகளை மேம்படுத்த இங்கே வருகின்றனர்"
  },
  {
    id: 7,
    name: "Kubera Lingam",
    tamilName: "குபேர லிங்கம்",
    direction: "North",
    deity: "Lord Kubera - God of Wealth and Prosperity",
    tamilDeity: "குபேர பகவான் - செல்வம் மற்றும் செழிப்பின் தேவன்",
    mantra: "Om Kuberaya Namaha",
    tamilMantra: "ஓம் குபேராய நமஹ",
    story: "Lord Kubera, the treasurer of the gods and ruler of wealth, is worshipped here. This temple is renowned for blessing devotees with material prosperity, business success, and financial stability.",
    tamilStory: "தேவர்களின் பொருளாளரும் செல்வத்தின் அதிபதியுமான குபேர பகவான் இங்கே வழிபடப்படுகிறார். இந்த கோவில் பக்தர்களுக்கு பொருள் செழிப்பு, வணிக வெற்றி மற்றும் நிதி நிலைத்தன்மையை அருளுவதில் புகழ்பெற்றது.",
    significance: "Grants wealth, business success, and removes financial difficulties",
    tamilSignificance: "செல்வத்தை வழங்குகிறது, வணிக வெற்றியை அளிக்கிறது, நிதி சிக்கல்களை நீக்குகிறது",
    timing: "Morning wealth prayers (7:00-9:00 AM)",
    tamilTiming: "காலை செல்வ பிரார்த்தனைகள் (காலை 7:00-9:00)",
    specialFeatures: "Business people and entrepreneurs regularly visit for prosperity blessings",
    tamilSpecialFeatures: "வணிகர்கள் மற்றும் தொழில் முனைவோர் செழிப்பு ஆசீர்வாதங்களுக்காக வழக்கமாக வருகின்றனர்"
  },
  {
    id: 8,
    name: "Esanya Lingam",
    tamilName: "ஈசான்ய லிங்கம்",
    direction: "Northeast",
    deity: "Lord Shiva - Esanya Direction Guardian",
    tamilDeity: "சிவபெருமான் - ஈசான்ய திசை காவலர்",
    mantra: "Om Esanyaya Namaha",
    tamilMantra: "ஓம் ஈசான்யாய நமஹ",
    story: "The final temple in the Ashtalinga circuit, representing completion and divine blessings. This is considered the most auspicious direction, governed directly by Lord Shiva, bringing spiritual enlightenment and moksha.",
    tamilStory: "அஷ்டலிங்க சுற்றுப்பயணத்தின் இறுதி கோவில், நிறைவு மற்றும் தெய்வீக ஆசீர்வாதங்களைக் குறிக்கிறது. இது மிகவும் சுபகரமான திசையாக கருதப்படுகிறது, சிவக்பெருமானால் நேரடியாக ஆளப்படுகிறது, ஆன்மீக ஞானம் மற்றும் மோட்சத்தை கொண்டு வருகிறது.",
    significance: "Grants spiritual enlightenment, moksha, and completes the divine circuit",
    tamilSignificance: "ஆன்மீக ஞானத்தை வழங்குகிறது, மோட்சத்தை அளிக்கிறது, தெய்வீக சுற்றுவட்டத்தை நிறைவு செய்கிறது",
    timing: "Sunrise completion prayers (6:30-8:00 AM)",
    tamilTiming: "சூரிய உதய நிறைவு பிரார்த்தனைகள் (காலை 6:30-8:00)",
    specialFeatures: "Devotees complete their Girivalam here with thanksgiving prayers",
    tamilSpecialFeatures: "பக்தர்கள் நன்றி பிரார்த்தனைகளுடன் தங்கள் கிரிவலத்தை இங்கே நிறைவு செய்கின்றனர்"
  }
];

const SPIRITUAL_GUIDE_PREVIEW_FEATURES = [
  "Complete Ashta Lingam guide with mantras",
  "Audio mantras in Tamil and English",
  "Detailed stories and significance",
  "Preparation tips and guidelines",
  "Temple timings and directions",
  "Do's and Don'ts for Girivalam"
];

const SpiritualGuide = () => {
  const { user, loading: authLoading } = useAuth();
  const [playingMantra, setPlayingMantra] = useState<number | null>(null);
  const [tamilMode, setTamilMode] = useState(false);
  
  // Fetch all linga and chant audio from database
  const { data: lingaAudioMap = {} } = useAllLingaAudio();
  const { data: chantAudioMap = {} } = useAllChantAudio();

  useEffect(() => {
    // Add FAQ Schema for SEO
    const script = document.createElement("script");
    script.type = "application/ld+json";
    script.text = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "mainEntity": [
        {
          "@type": "Question",
          "name": "What is Girivalam?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Girivalam is the sacred 14km circumambulation of Arunachala Hill in Tiruvannamalai, Tamil Nadu. It is performed barefoot as a spiritual practice, walking clockwise around the holy hill."
          }
        },
        {
          "@type": "Question",
          "name": "How long does Girivalam take?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Girivalam typically takes 3-4 hours for regular walkers. During Pournami (full moon), it may take 5-6 hours due to large crowds. The best time to start is before dawn (5:30-7:00 AM)."
          }
        },
        {
          "@type": "Question",
          "name": "What are the 8 Lingams in Girivalam?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "The Ashta Lingam are eight sacred Shiva temples marking the Girivalam path: Indra Lingam (East), Agni Lingam (Southeast), Yama Lingam (South), Nirruti Lingam (Southwest), Varuna Lingam (West), Vayu Lingam (Northwest), Kubera Lingam (North), and Esanya Lingam (Northeast)."
          }
        },
        {
          "@type": "Question",
          "name": "What should I wear for Girivalam?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Dress modestly in traditional attire. Men typically wear dhoti or simple pants with shirt. Women wear saree, salwar kameez, or traditional dress. Avoid leather items and dress respectfully for temple visits."
          }
        },
        {
          "@type": "Question",
          "name": "Can we do Girivalam during periods?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Yes, women can perform Girivalam during menstruation. The path is open to all devotees regardless of gender or physical condition. However, entry to inner sanctums of some temples may have traditional restrictions."
          }
        },
        {
          "@type": "Question",
          "name": "What is the best time for Girivalam?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "The best time is before dawn (5:30-7:00 AM) for maximum spiritual benefit and to avoid crowds. Pournami (full moon) nights are considered most auspicious but are very crowded. Early morning offers peaceful atmosphere and cooler weather."
          }
        }
      ]
    });
    document.head.appendChild(script);

    // Add Breadcrumb Schema
    const breadcrumbScript = document.createElement("script");
    breadcrumbScript.type = "application/ld+json";
    breadcrumbScript.text = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "itemListElement": [{
        "@type": "ListItem",
        "position": 1,
        "name": "Home",
        "item": "https://mygirivalam.in/"
      }, {
        "@type": "ListItem",
        "position": 2,
        "name": "Spiritual Guide",
        "item": "https://mygirivalam.in/girivalam-guide"
      }]
    });
    document.head.appendChild(breadcrumbScript);

    return () => {
      document.head.removeChild(script);
      document.head.removeChild(breadcrumbScript);
    };
  }, []);

  const toggleMantra = (id: number) => {
    setPlayingMantra(playingMantra === id ? null : id);
  };

  // Show auth preview for non-authenticated users
  if (!authLoading && !user) {
    return (
      <div className="min-h-screen bg-background">
        <div className="flex justify-center pt-8 px-4">
          <Navigation />
        </div>
        <AuthPreview
          title="Sacred Spiritual Guide"
          description="Sign in to access the complete Ashta Lingam guide with mantras, stories, and devotional practices."
          features={SPIRITUAL_GUIDE_PREVIEW_FEATURES}
          icon={<BookOpen className="h-8 w-8 text-primary" />}
          backgroundContent={<SpiritualGuideTeaser />}
        />
        <SiteFooter />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>Ashta Lingam Spiritual Guide — Girivalam | MyGirivalam.in</title>
        <meta name="description" content="Complete Ashta Lingam guide for Tiruvannamalai Girivalam. Sacred stories, mantras in Tamil & English, puja timings, do's & don'ts for all 8 Shiva temples on the Girivalam path." />
        <link rel="canonical" href="https://mygirivalam.in/girivalam-guide" />
      </Helmet>
      {/* Navigation */}
      <div className="flex justify-center pt-8 px-4">
        <Navigation />
      </div>

      {/* Hero Section */}
      <section className="relative px-4 py-16">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <Badge variant="outline" className="mb-4 bg-primary/10 border-primary/30">
                📿 Sacred Wisdom
              </Badge>
              <h1 className="font-playfair text-5xl font-bold mb-6">
                Spiritual Guide &
                <span className="block text-primary">Sacred Resources</span>
              </h1>
              <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
                Discover the profound wisdom of the Ashta Lingam temples, sacred mantras,
                and devotional practices that have guided pilgrims for centuries.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button className="sacred-button">
                  <BookOpen className="mr-2 h-5 w-5" />
                  Start Learning
                </Button>
                <Button variant="outline" className="bg-card/80 border-primary/30">
                  <Volume2 className="mr-2 h-5 w-5" />
                  Audio Guides
                </Button>
                <div className="flex items-center space-x-2 bg-card/50 px-4 py-2 rounded-lg border border-primary/20">
                  <Switch
                    id="tamil-mode"
                    checked={tamilMode}
                    onCheckedChange={setTamilMode}
                  />
                  <Label htmlFor="tamil-mode" className="flex items-center gap-2 text-sm">
                    <Languages className="h-4 w-4" />
                    {tamilMode ? "தமிழ்" : "Tamil"}
                  </Label>
                </div>
              </div>
            </div>

            <div className="relative">
              <img
                src={spiritualGuideImage}
                alt="Peaceful meditation and spiritual guidance"
                className="rounded-2xl shadow-2xl"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background/20 to-transparent rounded-2xl" />
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className="px-4 pb-16">
        <div className="max-w-6xl mx-auto">
          <Tabs defaultValue="ashta-lingam" className="w-full">
            <TabsList className="w-full flex overflow-x-auto scrollbar-hide mb-8 justify-start md:justify-center">
              <TabsTrigger value="ashta-lingam" className="font-medium flex-shrink-0">Ashta Lingam</TabsTrigger>
              <TabsTrigger value="guidelines" className="font-medium flex-shrink-0">Do's & Don'ts</TabsTrigger>
              <TabsTrigger value="mantras" className="font-medium flex-shrink-0">Chanting</TabsTrigger>
              <TabsTrigger value="timings" className="font-medium flex-shrink-0">Puja Times</TabsTrigger>
            </TabsList>

            {/* Ashta Lingam Tab */}
            <TabsContent value="ashta-lingam" className="space-y-6">
              <div className="text-center mb-8">
                <h2 className="font-playfair text-3xl font-bold mb-4">
                  {tamilMode ? "புனித அஷ்ட லிங்கம்" : "The Sacred Ashta Lingam"}
                </h2>
                <p className="text-muted-foreground text-lg">
                  {tamilMode
                    ? "புனித அருணாசல மலையைப் பாதுகாக்கும் சிவபெருமானின் எட்டு தெய்வீக வெளிப்பாடுகள்"
                    : "Eight divine manifestations of Lord Shiva protecting the holy Arunachala Hill"
                  }
                </p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {ashtaLingamData.map((lingam) => (
                  <SpiritualCard key={lingam.id} className="hover:scale-[1.02] transition-transform">
                    <div className="space-y-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-playfair text-xl font-semibold">
                            {tamilMode ? lingam.tamilName : lingam.name}
                          </h3>
                          <p className="text-sm text-muted-foreground flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {tamilMode ? "திசை:" : "Direction:"} {lingam.direction}
                          </p>
                        </div>
                        <Badge variant="secondary">{lingam.id}/8</Badge>
                      </div>

                      <div className="space-y-3">
                        <div>
                          <h4 className="font-medium text-primary mb-1">
                            {tamilMode ? "முன்னிலை தெய்வம்" : "Presiding Deity"}
                          </h4>
                          <p className="text-sm text-muted-foreground">
                            {tamilMode ? lingam.tamilDeity : lingam.deity}
                          </p>
                        </div>

                        <div>
                          <h4 className="font-medium text-primary mb-2">
                            {tamilMode ? "புனித கதை" : "Sacred Story"}
                          </h4>
                          <p className="text-sm leading-relaxed">
                            {tamilMode ? lingam.tamilStory : lingam.story}
                          </p>
                        </div>

                        <div>
                          <h4 className="font-medium text-primary mb-1">
                            {tamilMode ? "ஆன்மீக முக்கியத்துவம்" : "Spiritual Significance"}
                          </h4>
                          <p className="text-sm text-accent font-medium">
                            {tamilMode ? lingam.tamilSignificance : lingam.significance}
                          </p>
                        </div>

                        {lingam.specialFeatures && (
                          <div>
                            <h4 className="font-medium text-secondary mb-1">
                              {tamilMode ? "சிறப்பு அம்சங்கள்" : "Special Features"}
                            </h4>
                            <p className="text-sm text-muted-foreground">
                              {tamilMode ? lingam.tamilSpecialFeatures : lingam.specialFeatures}
                            </p>
                          </div>
                        )}

                        <div className="flex items-center justify-between pt-3 border-t border-border/50">
                          <div className="flex-1">
                            <p className="mantra-text text-primary font-medium mb-1">
                              {tamilMode ? lingam.tamilMantra : lingam.mantra}
                            </p>
                            <div className="flex items-center mt-1">
                              <Clock className="h-3 w-3 text-muted-foreground mr-1" />
                              <p className="text-xs text-muted-foreground">
                                {tamilMode ? lingam.tamilTiming : lingam.timing}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <SacredAudioPlayer
                              audioUrl={lingaAudioMap[lingam.id]?.audio_url || null}
                              audioId={`linga-${lingam.id}`}
                              size="sm"
                              variant="outline"
                              className="bg-primary/5 border-primary/30 hover:bg-primary/10"
                            />
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => toggleMantra(lingam.id)}
                              className="bg-secondary/5 border-secondary/30 hover:bg-secondary/10"
                            >
                              {playingMantra === lingam.id ? (
                                <Pause className="h-4 w-4" />
                              ) : (
                                <Play className="h-4 w-4" />
                              )}
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </SpiritualCard>
                ))}
              </div>
            </TabsContent>

            {/* Guidelines Tab */}
            <TabsContent value="guidelines" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <SpiritualCard>
                  <div className="text-center mb-6">
                    <div className="p-4 bg-primary/10 rounded-xl mx-auto w-fit mb-4">
                      <CheckCircle className="h-8 w-8 text-primary" />
                    </div>
                    <h3 className="font-playfair text-xl font-semibold">Sacred Do's</h3>
                  </div>

                  <div className="space-y-3">
                    {[
                      "Start before dawn for maximum spiritual benefit",
                      "Walk clockwise around the hill (pradakshina)",
                      "Maintain silence or chant mantras",
                      "Dress modestly in traditional attire",
                      "Carry only essentials - water, prasadam",
                      "Show respect at each Ashta Lingam temple",
                      "Help fellow devotees when needed"
                    ].map((item, index) => (
                      <div key={index} className="flex items-start space-x-3">
                        <CheckCircle className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                        <p className="text-sm">{item}</p>
                      </div>
                    ))}
                  </div>
                </SpiritualCard>

                <SpiritualCard>
                  <div className="text-center mb-6">
                    <div className="p-4 bg-destructive/10 rounded-xl mx-auto w-fit mb-4">
                      <AlertCircle className="h-8 w-8 text-destructive" />
                    </div>
                    <h3 className="font-playfair text-xl font-semibold">Sacred Don'ts</h3>
                  </div>

                  <div className="space-y-3">
                    {[
                      "Never walk counter-clockwise",
                      "Avoid consuming non-vegetarian food",
                      "Don't use footwear inside temple premises",
                      "Avoid loud conversations or music",
                      "Don't carry leather items or alcohol",
                      "Never disrespect the sacred path",
                      "Avoid photographing during puja times"
                    ].map((item, index) => (
                      <div key={index} className="flex items-start space-x-3">
                        <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
                        <p className="text-sm">{item}</p>
                      </div>
                    ))}
                  </div>
                </SpiritualCard>
              </div>
            </TabsContent>

            {/* Mantras Tab */}
            <TabsContent value="mantras" className="space-y-6">
              <SpiritualCard>
                <div className="text-center mb-8">
                  <h3 className="font-playfair text-2xl font-semibold mb-4">
                    {tamilMode ? "புனித மந்திர வழிகாட்டி" : "Sacred Chanting Guide"}
                  </h3>
                  <p className="text-muted-foreground">
                    {tamilMode
                      ? "உங்கள் ஆன்மீக பயணத்தை மேம்படுத்த சக்திவாய்ந்த மந்திரங்கள்"
                      : "Powerful mantras to enhance your spiritual journey"
                    }
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h4 className="font-playfair font-semibold text-lg text-primary">
                      {tamilMode ? "முக்கிய அருணாசல மந்திரங்கள்" : "Main Arunachala Mantras"}
                    </h4>

                    <div className="p-4 bg-primary/5 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <h5 className="font-medium">
                          {tamilMode ? "முதன்மை கீர்த்தனை" : "Primary Chant"}
                        </h5>
                        <SacredAudioPlayer
                          audioUrl={chantAudioMap['primary-chant']?.audio_url || null}
                          audioId="primary-chant"
                          size="sm"
                          className="bg-primary/10"
                        />
                      </div>
                      <p className="mantra-text text-primary">
                        {tamilMode
                          ? "அருணாசல சிவ, அருணாசல சிவ,<br />அருணாசல சிவ, அருண சிவ"
                          : "Arunachala Shiva, Arunachala Shiva,<br />Arunachala Shiva, Aruna Shiva"
                        }
                      </p>
                    </div>

                    <div className="p-4 bg-secondary/5 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <h5 className="font-medium">
                          {tamilMode ? "ரமணரின் பிரார்த்தனை" : "Ramana's Prayer"}
                        </h5>
                        <SacredAudioPlayer
                          audioUrl={chantAudioMap['ramana-prayer']?.audio_url || null}
                          audioId="ramana-prayer"
                          size="sm"
                          className="bg-secondary/10"
                        />
                      </div>
                      <p className="mantra-text text-secondary text-sm">
                        {tamilMode
                          ? "அருணாசலா! உன்னை இதயத்தில் தியானிப்பவர்களின் அகங்காரத்தை நீ வேரோடு பிடுங்குகிறாய், ஓ அருணாசலா!"
                          : "Arunachala! Thou dost root out the ego of those who meditate on Thee in the heart, Oh Arunachala!"
                        }
                      </p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-playfair font-semibold text-lg text-accent">
                      {tamilMode ? "திசை மந்திரங்கள்" : "Directional Mantras"}
                    </h4>

                    <div className="space-y-3">
                      {[
                        { id: "indra", sanskrit: "Om Indraya Namaha", tamil: "ஓம் இந்திராய நமஹ" },
                        { id: "agni", sanskrit: "Om Agnaye Namaha", tamil: "ஓம் அக்னயே நமஹ" },
                        { id: "yama", sanskrit: "Om Yamaya Namaha", tamil: "ஓம் யமாய நமஹ" },
                        { id: "nirruti", sanskrit: "Om Nirrutaye Namaha", tamil: "ஓம் நிரிருதயே நமஹ" },
                        { id: "varuna", sanskrit: "Om Varunaya Namaha", tamil: "ஓம் வருணாய நமஹ" },
                        { id: "vayu", sanskrit: "Om Vayave Namaha", tamil: "ஓம் வாயவே நமஹ" },
                        { id: "kubera", sanskrit: "Om Kuberaya Namaha", tamil: "ஓம் குபேராய நமஹ" },
                        { id: "esanya", sanskrit: "Om Esanyaya Namaha", tamil: "ஓம் ஈசான்யாய நமஹ" }
                      ].map((mantra, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-accent/5 rounded-lg">
                          <p className="mantra-text text-accent text-sm">
                            {tamilMode ? mantra.tamil : mantra.sanskrit}
                          </p>
                          <SacredAudioPlayer
                            audioUrl={chantAudioMap[`${mantra.id}-mantra`]?.audio_url || null}
                            audioId={`${mantra.id}-mantra`}
                            size="sm"
                            variant="ghost"
                            className="p-2"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </SpiritualCard>
            </TabsContent>

            {/* Timings Tab */}
            <TabsContent value="timings" className="space-y-6">
              <SpiritualCard>
                <div className="text-center mb-8">
                  <h3 className="font-playfair text-2xl font-semibold mb-4">Sacred Puja Timings</h3>
                  <p className="text-muted-foreground">
                    Optimal times for worship at each temple during your Girivalam
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-4">
                    <h4 className="font-playfair font-semibold text-lg text-primary text-center">Morning Pujas</h4>
                    <div className="space-y-3">
                      <div className="p-3 bg-primary/5 rounded-lg text-center">
                        <p className="font-medium">Dawn Prayers</p>
                        <p className="text-sm text-muted-foreground">5:30 - 7:00 AM</p>
                        <Badge variant="outline" className="mt-2">Best Energy</Badge>
                      </div>
                      <div className="p-3 bg-primary/5 rounded-lg text-center">
                        <p className="font-medium">Morning Abhishekam</p>
                        <p className="text-sm text-muted-foreground">6:00 - 8:00 AM</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-playfair font-semibold text-lg text-accent text-center">Afternoon Pujas</h4>
                    <div className="space-y-3">
                      <div className="p-3 bg-accent/5 rounded-lg text-center">
                        <p className="font-medium">Madhyahna Puja</p>
                        <p className="text-sm text-muted-foreground">12:00 - 1:00 PM</p>
                      </div>
                      <div className="p-3 bg-accent/5 rounded-lg text-center">
                        <p className="font-medium">Afternoon Aarti</p>
                        <p className="text-sm text-muted-foreground">4:00 - 5:00 PM</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-playfair font-semibold text-lg text-secondary text-center">Evening Pujas</h4>
                    <div className="space-y-3">
                      <div className="p-3 bg-secondary/5 rounded-lg text-center">
                        <p className="font-medium">Sandhya Aarti</p>
                        <p className="text-sm text-muted-foreground">6:30 - 7:30 PM</p>
                        <Badge variant="outline" className="mt-2">Most Popular</Badge>
                      </div>
                      <div className="p-3 bg-secondary/5 rounded-lg text-center">
                        <p className="font-medium">Night Prayers</p>
                        <p className="text-sm text-muted-foreground">8:00 - 9:00 PM</p>
                      </div>
                    </div>
                  </div>
                </div>
              </SpiritualCard>
            </TabsContent>
          </Tabs>
        </div>
      </div>
      <SiteFooter />
    </div>
  );
};

export default SpiritualGuide;