import React from "react";

const SiteFooter: React.FC = () => {
  return (
    <footer className="w-full py-4 px-4 border-t border-border/30 bg-card/50 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-center gap-x-2 gap-y-1 text-xs text-muted-foreground text-center">
        <span>© {new Date().getFullYear()} Arunachala Vibe</span>
        <span aria-hidden="true">•</span>
        <span>Sacred Girivalam Guide</span>
        <span aria-hidden="true">•</span>
        <span>
          Crafted by{" "}
          <a
            href="https://muthuvel.vercel.app/"
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-foreground/80 hover:text-primary transition-colors underline underline-offset-2"
          >
            Muthu V
          </a>
        </span>
        <span aria-hidden="true">•</span>
        <span>
          Map data ©{" "}
          <a
            href="https://www.openstreetmap.org/copyright"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-primary transition-colors underline underline-offset-2"
          >
            OpenStreetMap
          </a>{" "}
          contributors
        </span>
      </div>
    </footer>
  );
};

export default SiteFooter;
