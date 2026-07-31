import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Lock, LogIn, UserPlus } from "lucide-react";
import { Link } from "react-router-dom";
import { useEffect, useState, useRef } from "react";

interface AuthPreviewProps {
  title: string;
  description: string;
  features: string[];
  icon?: React.ReactNode;
  backgroundContent?: React.ReactNode;
}

export const AuthPreview = ({ title, description, features, icon, backgroundContent }: AuthPreviewProps) => {
  const [scrollY, setScrollY] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        const scrollProgress = -rect.top;
        setScrollY(scrollProgress);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Parallax factor - background moves slower than scroll
  const parallaxOffset = scrollY * 0.3;

  return (
    <div ref={containerRef} className="relative min-h-[70vh] overflow-hidden">
      {/* Blurred Background Content with Parallax */}
      {backgroundContent && (
        <div 
          className="absolute inset-0 pointer-events-none select-none transition-transform duration-100 ease-out will-change-transform" 
          aria-hidden="true"
          style={{ transform: `translateY(${parallaxOffset}px) scale(1.1)` }}
        >
          <div className="blur-sm opacity-40">
            {backgroundContent}
          </div>
          {/* Gradient overlay for better card visibility */}
          <div className="absolute inset-0 bg-gradient-to-b from-background/60 via-background/80 to-background" />
        </div>
      )}

      {/* Auth Card */}
      <div className="relative z-10 flex items-center justify-center px-4 py-12 min-h-[70vh]">
        <Card className="max-w-lg w-full text-center border-primary/20 bg-card/95 backdrop-blur-md shadow-2xl animate-scale-in">
          <CardHeader className="pb-4">
            <div className="mx-auto p-4 bg-primary/10 rounded-full w-fit mb-4">
              {icon || <Lock className="h-8 w-8 text-primary" />}
            </div>
            <Badge variant="outline" className="mx-auto mb-2 bg-primary/10 border-primary/30">
              Login Required
            </Badge>
            <CardTitle className="font-playfair text-2xl md:text-3xl">{title}</CardTitle>
            <CardDescription className="text-base">{description}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Features Preview */}
            <div className="text-left space-y-2">
              <p className="text-sm font-medium text-muted-foreground mb-3">What you'll get access to:</p>
              <ul className="space-y-2">
                {features.map((feature, index) => (
                  <li key={index} className="flex items-center gap-2 text-sm animate-fade-in" style={{ animationDelay: `${index * 50}ms` }}>
                    <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                    {feature}
                  </li>
                ))}
              </ul>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <Button asChild className="flex-1 sacred-button">
                <Link to="/auth">
                  <LogIn className="mr-2 h-4 w-4" />
                  Sign In
                </Link>
              </Button>
              <Button asChild variant="outline" className="flex-1">
                <Link to="/auth?mode=signup">
                  <UserPlus className="mr-2 h-4 w-4" />
                  Create Account
                </Link>
              </Button>
            </div>

            <p className="text-xs text-muted-foreground">
              Join thousands of pilgrims on their sacred journey
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
