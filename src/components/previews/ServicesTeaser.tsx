import { SpiritualCard } from "@/components/SpiritualCard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Bed, Utensils, Car, MapPin, Clock, Star } from "lucide-react";

const SAMPLE_SERVICES = [
  { name: "Temple Stay Rooms", category: "Accommodation", price: "₹800/night", rating: 4.8 },
  { name: "Local Guide Service", category: "Guide", price: "₹500", rating: 4.9 },
  { name: "Auto/Taxi Booking", category: "Transport", price: "₹150+", rating: 4.7 },
];

export const ServicesTeaser = () => {
  return (
    <div className="px-4 py-12">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <Badge variant="outline" className="mb-4 bg-primary/10 border-primary/30">
            🏛️ Sacred Services
          </Badge>
          <h1 className="font-playfair text-4xl md:text-5xl font-bold mb-4">
            Services & <span className="text-primary">Booking</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            Everything you need for a comfortable Girivalam journey.
          </p>
        </div>

        {/* Sample Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {SAMPLE_SERVICES.map((service, index) => (
            <SpiritualCard key={index}>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Badge variant="secondary">{service.category}</Badge>
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 text-amber-500 fill-amber-500" />
                    <span className="text-sm font-medium">{service.rating}</span>
                  </div>
                </div>
                <h3 className="font-playfair text-xl font-semibold">{service.name}</h3>
                <div className="flex items-center justify-between">
                  <span className="text-primary font-bold">{service.price}</span>
                  <Button size="sm" className="sacred-button">Book Now</Button>
                </div>
              </div>
            </SpiritualCard>
          ))}
        </div>

        {/* Food Locations Preview */}
        <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
          {["Temple Entrance", "Indra Lingam", "Yama Lingam", "Varuna Lingam"].map((loc, i) => (
            <div key={i} className="p-3 bg-muted/50 rounded-lg text-center">
              <MapPin className="h-4 w-4 text-primary mx-auto mb-2" />
              <p className="text-sm font-medium">{loc}</p>
              <p className="text-xs text-muted-foreground">Food Available</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
