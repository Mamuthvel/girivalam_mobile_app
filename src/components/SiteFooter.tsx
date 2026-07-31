import React from "react";

const SiteFooter: React.FC = () => {
  return (
    <footer className="w-full py-4 px-4 border-t border-border/30 bg-card/50 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-muted-foreground">
        <div className="flex items-center gap-2">
          <span>© {new Date().getFullYear()} Arunachala Vibe</span>
          <span className="hidden sm:inline">•</span>
          <span className="hidden sm:inline">Sacred Girivalam Guide</span>
        </div>
        
        {/* Leaflet Attribution - Required by OpenStreetMap */}
        <div className="flex items-center gap-1">
          <span>Map data ©</span>
          <a
            href="https://www.openstreetmap.org/copyright"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-primary transition-colors underline underline-offset-2"
          >
            OpenStreetMap
          </a>
          <span>contributors</span>
        </div>
      </div>
    </footer>
  );
};

export default SiteFooter;
