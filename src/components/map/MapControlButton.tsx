import React from "react";
import { Hand, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface MapControlButtonProps {
  isDraggingEnabled: boolean;
  onToggle: () => void;
  className?: string;
}

const MapControlButton: React.FC<MapControlButtonProps> = ({
  isDraggingEnabled,
  onToggle,
  className = "",
}) => {
  return (
    <Button
      variant="secondary"
      size="sm"
      onClick={onToggle}
      className={cn(
        "absolute bottom-4 bg-black right-4 z-[1000] flex items-center gap-2 rounded-xl shadow-lg transition-all duration-300",
        "bg-card/95 backdrop-blur-sm border border-border/50 hover:bg-card",
        isDraggingEnabled && "ring-2 ring-primary/50 shadow-primary/20 shadow-lg",
        className
      )}
    >
      {isDraggingEnabled ? (
        <>
          <Hand className="h-4 w-4" />
          <span className="text-sm font-medium">Move Map</span>
        </>
      ) : (
        <>
          <Lock className="h-4 w-4" />
          <span className="text-sm font-medium">Lock Map</span>
        </>
      )}
    </Button>
  );
};

export default MapControlButton;
