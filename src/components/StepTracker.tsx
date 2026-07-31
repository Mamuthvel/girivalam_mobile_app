import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Footprints, MapPin, Clock, Zap } from "lucide-react";

interface StepTrackerProps {
  stepCount: number;
  distance: number;
  timeElapsed: number;
  isTracking: boolean;
  className?: string;
}

export const StepTracker: React.FC<StepTrackerProps> = ({ 
  stepCount, 
  distance, 
  timeElapsed, 
  isTracking,
  className = ""
}) => {
  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const estimatedCalories = Math.round(stepCount * 0.04); // Rough estimation
  const avgSpeed = timeElapsed > 0 ? (distance / (timeElapsed / 3600)).toFixed(1) : '0.0'; // km/h

  return (
    <Card className={`sticky bottom-4 z-50 bg-card/95 backdrop-blur-sm border-primary/20 shadow-lg ${className}`}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Badge variant={isTracking ? "default" : "secondary"} className="animate-pulse">
              <Zap className="h-3 w-3 mr-1" />
              {isTracking ? "Live Tracking" : "Paused"}
            </Badge>
          </div>
          <Badge variant="outline" className="text-xs">
            Speed: {avgSpeed} km/h
          </Badge>
        </div>

        <div className="grid grid-cols-4 gap-4">
          <div className="text-center">
            <div className="flex items-center justify-center mb-1">
              <Footprints className="h-4 w-4 text-primary" />
            </div>
            <p className="text-lg font-bold text-primary">{stepCount.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground">Steps</p>
          </div>

          <div className="text-center">
            <div className="flex items-center justify-center mb-1">
              <MapPin className="h-4 w-4 text-accent" />
            </div>
            <p className="text-lg font-bold text-accent">{distance.toFixed(2)}</p>
            <p className="text-xs text-muted-foreground">KM</p>
          </div>

          <div className="text-center">
            <div className="flex items-center justify-center mb-1">
              <Clock className="h-4 w-4 text-sky-500" />
            </div>
            <p className="text-lg font-bold text-sky-500">{formatTime(timeElapsed)}</p>
            <p className="text-xs text-muted-foreground">Time</p>
          </div>

          <div className="text-center">
            <div className="flex items-center justify-center mb-1">
              <span className="text-orange-500">🔥</span>
            </div>
            <p className="text-lg font-bold text-orange-500">{estimatedCalories}</p>
            <p className="text-xs text-muted-foreground">Cal</p>
          </div>
        </div>

        {/* Progress indicators */}
        <div className="mt-3 space-y-1">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Girivalam Progress</span>
            <span>{((distance / 14) * 100).toFixed(1)}%</span>
          </div>
          <div className="w-full bg-muted rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-primary to-primary-glow h-2 rounded-full transition-all duration-1000" 
              style={{ width: `${Math.min(((distance / 14) * 100), 100)}%` }}
            ></div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default StepTracker;