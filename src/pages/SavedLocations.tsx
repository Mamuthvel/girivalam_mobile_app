import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, Plus, Navigation, Pencil, Trash2, ArrowLeft, Save, X, Locate } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Link, useNavigate } from "react-router-dom";
import SiteHeader from "@/components/SiteHeader";
import { logger } from "@/lib/logger";

interface SavedLocation {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  location_type: string;
  note: string | null;
  created_at: string;
}

const LOCATION_TYPES = [
  { value: "parking", label: "🅿️ Parking" },
  { value: "temple", label: "🛕 Temple" },
  { value: "water", label: "💧 Water Point" },
  { value: "food", label: "🍽️ Food" },
  { value: "rest", label: "🪑 Rest Area" },
  { value: "medical", label: "🏥 Medical" },
  { value: "custom", label: "📍 Custom" },
];

const SavedLocations = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const [locations, setLocations] = useState<SavedLocation[]>([]);
  const [loading, setLoading] = useState(true);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  
  // Dialog states
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<SavedLocation | null>(null);
  
  // Form states
  const [formName, setFormName] = useState("");
  const [formType, setFormType] = useState("custom");
  const [formNote, setFormNote] = useState("");
  const [formLat, setFormLat] = useState<number | null>(null);
  const [formLng, setFormLng] = useState<number | null>(null);
  const [isGettingLocation, setIsGettingLocation] = useState(false);

  useEffect(() => {
    if (user) {
      fetchLocations();
    } else {
      setLoading(false);
    }
    getCurrentLocation();
  }, [user]);

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (error) => {
          logger.error("Error getting location:", error);
        }
      );
    }
  };

  const fetchLocations = async () => {
    if (!user) return;
    
    setLoading(true);
    const { data, error } = await supabase
      .from("saved_locations")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      toast({
        title: "Error",
        description: "Failed to fetch saved locations",
        variant: "destructive",
      });
    } else {
      setLocations(data || []);
    }
    setLoading(false);
  };

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const formatDistance = (km: number): string => {
    if (km < 1) {
      return `${Math.round(km * 1000)} m`;
    }
    return `${km.toFixed(1)} km`;
  };

  const useCurrentGPS = () => {
    setIsGettingLocation(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setFormLat(position.coords.latitude);
          setFormLng(position.coords.longitude);
          setIsGettingLocation(false);
          toast({
            title: "Location captured",
            description: "Your current GPS location has been set",
          });
        },
        (error) => {
          setIsGettingLocation(false);
          toast({
            title: "Location Error",
            description: "Could not get your current location",
            variant: "destructive",
          });
        }
      );
    } else {
      setIsGettingLocation(false);
      toast({
        title: "Not Supported",
        description: "Geolocation is not supported by your browser",
        variant: "destructive",
      });
    }
  };

  const resetForm = () => {
    setFormName("");
    setFormType("custom");
    setFormNote("");
    setFormLat(null);
    setFormLng(null);
  };

  const handleAddLocation = async () => {
    if (!user) {
      toast({
        title: "Login Required",
        description: "Please login to save locations",
        variant: "destructive",
      });
      navigate("/auth");
      return;
    }

    if (!formName.trim()) {
      toast({
        title: "Name Required",
        description: "Please enter a name for this location",
        variant: "destructive",
      });
      return;
    }

    if (formLat === null || formLng === null) {
      toast({
        title: "Location Required",
        description: "Please capture your GPS location",
        variant: "destructive",
      });
      return;
    }

    const { error } = await supabase.from("saved_locations").insert({
      user_id: user.id,
      name: formName.trim(),
      latitude: formLat,
      longitude: formLng,
      location_type: formType,
      note: formNote.trim() || null,
    });

    if (error) {
      toast({
        title: "Error",
        description: "Failed to save location",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Location Saved 📍",
        description: `${formName} has been saved successfully`,
      });
      setIsAddDialogOpen(false);
      resetForm();
      fetchLocations();
    }
  };

  const handleEditLocation = async () => {
    if (!selectedLocation || !formName.trim()) return;

    const { error } = await supabase
      .from("saved_locations")
      .update({
        name: formName.trim(),
        location_type: formType,
        note: formNote.trim() || null,
        latitude: formLat || selectedLocation.latitude,
        longitude: formLng || selectedLocation.longitude,
      })
      .eq("id", selectedLocation.id);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to update location",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Location Updated",
        description: `${formName} has been updated`,
      });
      setIsEditDialogOpen(false);
      setSelectedLocation(null);
      resetForm();
      fetchLocations();
    }
  };

  const handleDeleteLocation = async () => {
    if (!selectedLocation) return;

    const { error } = await supabase
      .from("saved_locations")
      .delete()
      .eq("id", selectedLocation.id);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to delete location",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Location Deleted",
        description: `${selectedLocation.name} has been removed`,
      });
      setIsDeleteDialogOpen(false);
      setSelectedLocation(null);
      fetchLocations();
    }
  };

  const openEditDialog = (location: SavedLocation) => {
    setSelectedLocation(location);
    setFormName(location.name);
    setFormType(location.location_type);
    setFormNote(location.note || "");
    setFormLat(location.latitude);
    setFormLng(location.longitude);
    setIsEditDialogOpen(true);
  };

  const openDeleteDialog = (location: SavedLocation) => {
    setSelectedLocation(location);
    setIsDeleteDialogOpen(true);
  };

  const openInMaps = (lat: number, lng: number, name: string) => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&travelmode=walking`;
    window.open(url, "_blank");
  };

  const getTypeIcon = (type: string) => {
    const typeObj = LOCATION_TYPES.find(t => t.value === type);
    return typeObj ? typeObj.label.split(" ")[0] : "📍";
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <SiteHeader />
        <div className="container mx-auto px-4 py-8 pt-20">
          <Card className="max-w-md mx-auto text-center p-8">
            <MapPin className="h-16 w-16 mx-auto text-primary/50 mb-4" />
            <h2 className="text-xl font-semibold mb-2">Login Required</h2>
            <p className="text-muted-foreground mb-6">
              Please login to save and manage your custom locations
            </p>
            <Button onClick={() => navigate("/auth")} className="w-full">
              Login to Continue
            </Button>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      
      <div className="container mx-auto px-4 py-6 pt-20 max-w-2xl">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Link to="/">
            <Button variant="ghost" size="icon" className="rounded-full">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div className="flex-1">
            <h1 className="text-2xl font-bold">Saved Locations</h1>
            <p className="text-sm text-muted-foreground">
              Your private saved places
            </p>
          </div>
          <Button onClick={() => setIsAddDialogOpen(true)} size="sm" className="gap-2">
            <Plus className="h-4 w-4" />
            Add
          </Button>
        </div>

        {/* Locations List */}
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-4">
                  <div className="h-6 bg-muted rounded w-1/3 mb-2" />
                  <div className="h-4 bg-muted rounded w-1/2" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : locations.length === 0 ? (
          <Card className="text-center p-8">
            <MapPin className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
            <h3 className="font-semibold mb-2">No Saved Locations</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Save your parking spot, favorite temples, or any custom location
            </p>
            <Button onClick={() => setIsAddDialogOpen(true)} className="gap-2">
              <Plus className="h-4 w-4" />
              Add Your First Location
            </Button>
          </Card>
        ) : (
          <AnimatePresence mode="popLayout">
            <div className="space-y-3">
              {locations.map((location, index) => (
                <motion.div
                  key={location.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -100 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card className="overflow-hidden hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <div className="text-2xl">{getTypeIcon(location.location_type)}</div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold truncate">{location.name}</h3>
                          {location.note && (
                            <p className="text-sm text-muted-foreground truncate">
                              {location.note}
                            </p>
                          )}
                          {userLocation && (
                            <p className="text-sm text-primary font-medium mt-1">
                              📍 {formatDistance(
                                calculateDistance(
                                  userLocation.lat,
                                  userLocation.lng,
                                  location.latitude,
                                  location.longitude
                                )
                              )} away
                            </p>
                          )}
                        </div>
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => openInMaps(location.latitude, location.longitude, location.name)}
                          >
                            <Navigation className="h-4 w-4 text-primary" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => openEditDialog(location)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive"
                            onClick={() => openDeleteDialog(location)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </AnimatePresence>
        )}

        {/* Privacy Note */}
        <p className="text-xs text-muted-foreground text-center mt-8 px-4">
          🔒 Your saved locations are private and linked only to your account.
        </p>
      </div>

      {/* Add Location Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-primary" />
              Add New Location
            </DialogTitle>
            <DialogDescription>
              Save a custom location for easy access during Girivalam
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Location Name *</Label>
              <Input
                id="name"
                placeholder="e.g., My Parking Spot"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="type">Location Type</Label>
              <Select value={formType} onValueChange={setFormType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  {LOCATION_TYPES.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>GPS Location *</Label>
              <Button
                type="button"
                variant="outline"
                className="w-full gap-2"
                onClick={useCurrentGPS}
                disabled={isGettingLocation}
              >
                <Locate className={`h-4 w-4 ${isGettingLocation ? 'animate-spin' : ''}`} />
                {isGettingLocation ? "Getting Location..." : "Use Current GPS Location"}
              </Button>
              {formLat !== null && formLng !== null && (
                <p className="text-xs text-muted-foreground text-center">
                  📍 {formLat.toFixed(6)}, {formLng.toFixed(6)}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="note">Note (Optional)</Label>
              <Input
                id="note"
                placeholder="Any additional details..."
                value={formNote}
                onChange={(e) => setFormNote(e.target.value)}
              />
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => {
              setIsAddDialogOpen(false);
              resetForm();
            }}>
              Cancel
            </Button>
            <Button onClick={handleAddLocation} className="gap-2">
              <Save className="h-4 w-4" />
              Save Location
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Location Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Pencil className="h-5 w-5 text-primary" />
              Edit Location
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Location Name *</Label>
              <Input
                id="edit-name"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="edit-type">Location Type</Label>
              <Select value={formType} onValueChange={setFormType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  {LOCATION_TYPES.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>GPS Location</Label>
              <Button
                type="button"
                variant="outline"
                className="w-full gap-2"
                onClick={useCurrentGPS}
                disabled={isGettingLocation}
              >
                <Locate className={`h-4 w-4 ${isGettingLocation ? 'animate-spin' : ''}`} />
                Update to Current Location
              </Button>
              {formLat !== null && formLng !== null && (
                <p className="text-xs text-muted-foreground text-center">
                  📍 {formLat.toFixed(6)}, {formLng.toFixed(6)}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-note">Note (Optional)</Label>
              <Input
                id="edit-note"
                value={formNote}
                onChange={(e) => setFormNote(e.target.value)}
              />
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => {
              setIsEditDialogOpen(false);
              setSelectedLocation(null);
              resetForm();
            }}>
              Cancel
            </Button>
            <Button onClick={handleEditLocation} className="gap-2">
              <Save className="h-4 w-4" />
              Update
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <Trash2 className="h-5 w-5" />
              Delete Location
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{selectedLocation?.name}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => {
              setIsDeleteDialogOpen(false);
              setSelectedLocation(null);
            }}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteLocation}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SavedLocations;
