import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { MapPin, Shield, Users } from "lucide-react";

interface LocationSharingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAccept: () => void;
  onDecline: () => void;
  groupName: string;
}

export const LocationSharingDialog: React.FC<LocationSharingDialogProps> = ({
  open,
  onOpenChange,
  onAccept,
  onDecline,
  groupName
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-primary" />
            Share Your Location?
          </DialogTitle>
          <DialogDescription className="space-y-4 pt-4">
            <p>
              Would you like to share your live location with <strong>{groupName}</strong>?
            </p>
            <div className="space-y-3 text-sm">
              <div className="flex items-start gap-2">
                <Users className="h-4 w-4 mt-0.5 text-muted-foreground" />
                <span>Help friends and group members find each other on the map</span>
              </div>
              <div className="flex items-start gap-2">
                <Shield className="h-4 w-4 mt-0.5 text-muted-foreground" />
                <span>Your location is only shared while you're tracking and only with group members</span>
              </div>
            </div>
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button
            variant="outline"
            onClick={onDecline}
            className="w-full sm:w-auto"
          >
            Not Now
          </Button>
          <Button
            onClick={onAccept}
            className="w-full sm:w-auto"
          >
            Share Location
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
