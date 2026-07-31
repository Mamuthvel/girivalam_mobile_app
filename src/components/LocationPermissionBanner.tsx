import React from 'react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { AlertCircle, MapPin, Clock } from "lucide-react";

interface LocationPermissionBannerProps {
  permissionStatus: 'granted' | 'denied' | 'prompt' | 'unknown';
  lastLocation?: { lat: number; lng: number } | null;
  lastUpdate?: Date | null;
  onRequestPermission?: () => void;
}

export const LocationPermissionBanner: React.FC<LocationPermissionBannerProps> = ({
  permissionStatus,
  lastLocation,
  lastUpdate,
  onRequestPermission
}) => {
  if (permissionStatus === 'granted') {
    return null;
  }

  const formatLastUpdate = (date: Date | null) => {
    if (!date) return 'Unknown';
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return 'Just now';
  };

  return (
    <Alert className="mb-4 border-warning">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle className="flex items-center justify-between">
        <span>Location Access {permissionStatus === 'denied' ? 'Disabled' : 'Required'}</span>
      </AlertTitle>
      <AlertDescription className="mt-2 space-y-2">
        <p className="text-sm">
          {permissionStatus === 'denied' 
            ? "Your location is off. Please enable location access to use tracking features."
            : "Location access is needed to track your journey and share your location with groups."}
        </p>
        
        {lastLocation && lastUpdate && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground pt-2 border-t">
            <Clock className="h-3 w-3" />
            <span>Last tracked: {formatLastUpdate(lastUpdate)}</span>
            <MapPin className="h-3 w-3 ml-2" />
            <span>
              {lastLocation.lat.toFixed(4)}, {lastLocation.lng.toFixed(4)}
            </span>
          </div>
        )}
        
        {permissionStatus === 'prompt' && onRequestPermission && (
          <Button 
            size="sm" 
            onClick={onRequestPermission}
            className="mt-2"
          >
            Enable Location Access
          </Button>
        )}
        
        {permissionStatus === 'denied' && (
          <p className="text-xs text-muted-foreground mt-2">
            To enable location access, please check your browser settings.
          </p>
        )}
      </AlertDescription>
    </Alert>
  );
};
