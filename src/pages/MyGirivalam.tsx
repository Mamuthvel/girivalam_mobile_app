import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { User, MapPin, ArrowLeft, Mountain } from "lucide-react";
import SiteHeader from "@/components/SiteHeader";
import { SpiritualCard } from "@/components/SpiritualCard";
import { ClickSound } from "@/components/ClickSound";

const MyGirivalam = () => {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      
      {/* Hero Background */}
      <div className="relative min-h-screen flex flex-col">
        {/* Gradient Background */}
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-background to-background" />
        
        {/* Back Button */}
        <div className="relative z-10 pt-20 px-4">
          <Link to="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="h-4 w-4" />
            <span className="text-sm">Back to Home</span>
          </Link>
        </div>

        {/* Main Content */}
        <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 py-8">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-10"
          >
            {/* Mountain Icon */}
            <div className="mx-auto mb-6 p-4 bg-primary/10 rounded-full w-fit">
              <Mountain className="h-12 w-12 text-primary" />
            </div>
            
            <h1 className="font-playfair text-4xl md:text-5xl font-bold mb-4">
              <span className="spiritual-gradient-text">My Girivalam</span>
            </h1>
            <p className="text-muted-foreground text-lg max-w-md mx-auto">
              Choose how you want to experience the sacred circumambulation of Arunachala
            </p>
          </motion.div>

          {/* Selection Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl w-full px-4">
            
            {/* Solo Girivalam Card */}
            <ClickSound soundText="Starting solo journey">
              <Link to="/girivalam-map?mode=solo" className="group">
                <motion.div
                  initial={{ opacity: 0, x: -30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                >
                  <SpiritualCard className="h-full p-8 hover:border-primary/40 transition-all duration-300 group-hover:shadow-lg">
                    <div className="flex flex-col items-center text-center">
                      {/* Icon - Solo Person with Mountain */}
                      <div className="relative mb-6">
                        <div className="p-6 bg-gradient-to-br from-primary/20 to-primary/5 rounded-full group-hover:scale-110 transition-transform duration-300">
                          <div className="relative">
                            {/* Mountain silhouette */}
                            <svg className="h-20 w-20 text-primary/30" viewBox="0 0 100 100" fill="currentColor">
                              <path d="M10 80 L50 20 L90 80 Z" />
                            </svg>
                            {/* Single person walking */}
                            <div className="absolute bottom-2 left-1/2 -translate-x-1/2">
                              <User className="h-8 w-8 text-primary" />
                            </div>
                          </div>
                        </div>
                        {/* Decorative ring */}
                        <div className="absolute inset-0 rounded-full border-2 border-dashed border-primary/20 animate-spin" style={{ animationDuration: '20s' }} />
                      </div>

                      <h2 className="font-playfair text-2xl font-semibold mb-3 text-foreground">
                        Solo Girivalam
                      </h2>
                      <p className="text-muted-foreground mb-4 leading-relaxed">
                        Track your personal journey around Arunachala with distance, time, and progress
                      </p>

                      {/* Features */}
                      <div className="flex flex-wrap justify-center gap-2 mt-2">
                        <span className="px-3 py-1 bg-primary/10 text-primary text-xs rounded-full">
                          GPS Tracking
                        </span>
                        <span className="px-3 py-1 bg-primary/10 text-primary text-xs rounded-full">
                          Step Counter
                        </span>
                        <span className="px-3 py-1 bg-primary/10 text-primary text-xs rounded-full">
                          Progress Map
                        </span>
                      </div>
                    </div>
                  </SpiritualCard>
                </motion.div>
              </Link>
            </ClickSound>

            {/* Group Girivalam Card */}
            <ClickSound soundText="Starting group journey">
              <Link to="/girivalam-map?mode=group" className="group">
                <motion.div
                  initial={{ opacity: 0, x: 30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                >
                  <SpiritualCard className="h-full p-8 hover:border-secondary/40 transition-all duration-300 group-hover:shadow-lg">
                    <div className="flex flex-col items-center text-center">
                      {/* Icon - Multiple People with Mountain */}
                      <div className="relative mb-6">
                        <div className="p-6 bg-gradient-to-br from-secondary/20 to-secondary/5 rounded-full group-hover:scale-110 transition-transform duration-300">
                          <div className="relative">
                            {/* Mountain silhouette */}
                            <svg className="h-20 w-20 text-secondary/30" viewBox="0 0 100 100" fill="currentColor">
                              <path d="M10 80 L50 20 L90 80 Z" />
                            </svg>
                            {/* Multiple people around */}
                            <div className="absolute bottom-2 left-1/4 -translate-x-1/2">
                              <User className="h-6 w-6 text-secondary" />
                            </div>
                            <div className="absolute bottom-2 left-1/2 -translate-x-1/2">
                              <User className="h-7 w-7 text-secondary" />
                            </div>
                            <div className="absolute bottom-2 right-1/4 translate-x-1/2">
                              <User className="h-6 w-6 text-secondary" />
                            </div>
                          </div>
                        </div>
                        {/* Decorative ring */}
                        <div className="absolute inset-0 rounded-full border-2 border-dashed border-secondary/20 animate-spin" style={{ animationDuration: '20s', animationDirection: 'reverse' }} />
                      </div>

                      <h2 className="font-playfair text-2xl font-semibold mb-3 text-foreground">
                        Group Girivalam
                      </h2>
                      <p className="text-muted-foreground mb-4 leading-relaxed">
                        Walk together with friends & family, share locations and track group progress
                      </p>

                      {/* Features */}
                      <div className="flex flex-wrap justify-center gap-2 mt-2">
                        <span className="px-3 py-1 bg-secondary/10 text-secondary text-xs rounded-full">
                          Create/Join Group
                        </span>
                        <span className="px-3 py-1 bg-secondary/10 text-secondary text-xs rounded-full">
                          Live Locations
                        </span>
                        <span className="px-3 py-1 bg-secondary/10 text-secondary text-xs rounded-full">
                          Group Chat
                        </span>
                      </div>
                    </div>
                  </SpiritualCard>
                </motion.div>
              </Link>
            </ClickSound>
          </div>

          {/* Bottom Note */}
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="text-center text-muted-foreground text-sm mt-10 flex items-center justify-center gap-2"
          >
            <MapPin className="h-4 w-4" />
            14 km sacred path around Arunachala Hill
          </motion.p>
        </div>
      </div>
    </div>
  );
};

export default MyGirivalam;
