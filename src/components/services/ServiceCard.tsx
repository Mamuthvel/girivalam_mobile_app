import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Service, ServiceCategory } from "@/types/services";
import { 
  Bed, 
  Utensils, 
  User, 
  Car, 
  Crown, 
  Star,
  Users,
  Clock,
  MapPin,
  Check,
  Phone,
  ImageIcon
} from "lucide-react";

interface ServiceCardProps {
  service: Service;
  onBook: (service: Service) => void;
}

const categoryConfig: Record<ServiceCategory, { icon: typeof Bed; colorClass: string }> = {
  accommodation: { icon: Bed, colorClass: "bg-primary/10 text-primary" },
  food: { icon: Utensils, colorClass: "bg-secondary/10 text-secondary" },
  guide: { icon: User, colorClass: "bg-accent/10 text-accent" },
  transport: { icon: Car, colorClass: "bg-sky/10 text-sky" },
  special: { icon: Crown, colorClass: "bg-purple-500/10 text-purple-600" },
  community: { icon: Users, colorClass: "bg-green-500/10 text-green-600" },
  support: { icon: Star, colorClass: "bg-muted text-muted-foreground" }
};

export function ServiceCard({ service, onBook }: ServiceCardProps) {
  const config = categoryConfig[service.category] || categoryConfig.support;
  const Icon = config.icon;
  const hasImages = service.images && service.images.length > 0;

  return (
    <Card className="hover:shadow-lg transition-all duration-300 group cursor-pointer h-full flex flex-col overflow-hidden">
      {/* Image Carousel */}
      {hasImages ? (
        <div className="relative">
          <Carousel className="w-full">
            <CarouselContent>
              {service.images!.map((imageUrl, index) => (
                <CarouselItem key={index}>
                  <div className="aspect-video w-full overflow-hidden">
                    <img
                      src={imageUrl}
                      alt={`${service.name} - Image ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            {service.images!.length > 1 && (
              <>
                <CarouselPrevious className="left-2 h-7 w-7" />
                <CarouselNext className="right-2 h-7 w-7" />
              </>
            )}
          </Carousel>
          <div className="absolute bottom-2 right-2 bg-background/80 backdrop-blur-sm rounded-full px-2 py-1 text-xs text-muted-foreground">
            {service.images!.length} photo{service.images!.length > 1 ? 's' : ''}
          </div>
        </div>
      ) : (
        <div className="aspect-video w-full bg-muted flex items-center justify-center">
          <ImageIcon className="h-12 w-12 text-muted-foreground/50" />
        </div>
      )}

      <CardHeader className="pb-3">
        <div className="flex items-center justify-between mb-2">
          <Badge className={config.colorClass}>
            <Icon className="h-4 w-4 mr-1" />
            <span className="capitalize">{service.category}</span>
          </Badge>
          <div className="text-right">
            <p className="text-xl font-bold text-primary">₹{service.price}</p>
            <p className="text-xs text-muted-foreground">{service.currency}</p>
          </div>
        </div>
        <CardTitle className="font-playfair text-lg group-hover:text-primary transition-colors line-clamp-2">
          {service.name}
        </CardTitle>
        {service.description && (
          <CardDescription className="text-sm line-clamp-2">
            {service.description}
          </CardDescription>
        )}
      </CardHeader>

      <CardContent className="space-y-3 flex-1 flex flex-col">
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Users className="h-4 w-4" />
            <span>Max {service.max_capacity}</span>
          </div>
          {service.duration_hours && (
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              <span>{service.duration_hours}h</span>
            </div>
          )}
        </div>

        {service.location && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <MapPin className="h-4 w-4 shrink-0" />
            <span className="line-clamp-1">{service.location}</span>
          </div>
        )}

        {service.contact_phone && (
          <a 
            href={`tel:${service.contact_phone}`}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
            onClick={(e) => e.stopPropagation()}
          >
            <Phone className="h-4 w-4 shrink-0" />
            <span>{service.contact_phone}</span>
          </a>
        )}

        {service.amenities && service.amenities.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {service.amenities.slice(0, 3).map((amenity, index) => (
              <Badge key={index} variant="outline" className="text-xs">
                {amenity}
              </Badge>
            ))}
            {service.amenities.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{service.amenities.length - 3} more
              </Badge>
            )}
          </div>
        )}

        <div className="flex items-center justify-between pt-3 mt-auto border-t border-border/50">
          <div className="flex items-center gap-1 text-sm">
            <Check className="h-4 w-4 text-green-600" />
            <span className="text-green-600">{service.available_slots} available</span>
          </div>

          <Button
            onClick={(e) => {
              e.stopPropagation();
              onBook(service);
            }}
            className="sacred-button"
            size="sm"
          >
            Book Now
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
