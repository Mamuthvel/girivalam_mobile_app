import { useState, useEffect, useMemo, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Service, ServiceCategory, ServiceFilters, BookingFormData } from "@/types/services";
import { useAuth } from "@/contexts/AuthContext";
import { z } from "zod";
import { format } from "date-fns";
import { logger } from "@/lib/logger";

// Validation schema for booking form
export const bookingSchema = z.object({
  customer_name: z.string()
    .trim()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name must be less than 100 characters")
    .regex(/^[a-zA-Z\s.'-]+$/, "Name contains invalid characters"),
  customer_phone: z.string()
    .trim()
    .min(10, "Phone number must be 10 digits")
    .max(10, "Phone number must be 10 digits")
    .regex(/^[0-9]+$/, "Phone number must contain only digits"),
  customer_email: z.string()
    .trim()
    .email("Invalid email address")
    .max(255, "Email must be less than 255 characters")
    .optional()
    .or(z.literal("")),
  special_requests: z.string()
    .max(500, "Special requests must be less than 500 characters")
    .optional(),
  guests_count: z.number()
    .int("Guest count must be a whole number")
    .min(1, "At least 1 guest required")
});

const initialBookingForm: BookingFormData = {
  service_id: "",
  booking_date: new Date(),
  guests_count: 1,
  customer_name: "",
  customer_phone: "",
  customer_email: "",
  special_requests: "",
  country_code: "+91"
};

export function useServices() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [services, setServices] = useState<Service[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState<ServiceFilters>({ category: "all" });
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [bookingForm, setBookingForm] = useState<BookingFormData>(initialBookingForm);
  const [isBookingDialogOpen, setIsBookingDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  // Fetch services from database
  const fetchServices = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("services")
        .select("*")
        .eq("is_active", true)
        .order("category, price");

      if (error) throw error;
      
      // Map to our Service type with proper category casting
      const mappedServices: Service[] = (data || []).map(item => ({
        ...item,
        category: item.category as ServiceCategory,
        contact_display_mode: (item.contact_display_mode || 'both') as 'call' | 'whatsapp' | 'both',
      }));
      
      setServices(mappedServices);
    } catch (error) {
      logger.error("Error fetching services:", error);
      toast({
        title: "Error",
        description: "Unable to load services. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchServices();
  }, [fetchServices]);

  // Filter services based on current filters
  const filteredServices = useMemo(() => {
    return services.filter(service => {
      if (filters.category !== "all" && service.category !== filters.category) {
        return false;
      }
      if (filters.searchQuery) {
        const query = filters.searchQuery.toLowerCase();
        return (
          service.name.toLowerCase().includes(query) ||
          service.description?.toLowerCase().includes(query) ||
          service.location?.toLowerCase().includes(query)
        );
      }
      return true;
    });
  }, [services, filters]);

  // Get unique categories from services
  const categories = useMemo(() => {
    const cats = new Set(services.map(s => s.category));
    return Array.from(cats);
  }, [services]);

  // Open booking dialog for a service
  const openBookingDialog = useCallback((service: Service) => {
    setSelectedService(service);
    setBookingForm({ ...initialBookingForm, service_id: service.id });
    setValidationErrors({});
    setIsBookingDialogOpen(true);
  }, []);

  // Close booking dialog
  const closeBookingDialog = useCallback(() => {
    setIsBookingDialogOpen(false);
    setSelectedService(null);
    setBookingForm(initialBookingForm);
    setValidationErrors({});
  }, []);

  // Update booking form
  const updateBookingForm = useCallback((updates: Partial<BookingFormData>) => {
    setBookingForm(prev => ({ ...prev, ...updates }));
  }, []);

  // Submit booking
  const submitBooking = useCallback(async (): Promise<boolean> => {
    if (!selectedService) return false;

    // Require authentication
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to make a booking.",
        variant: "destructive",
      });
      return false;
    }

    // Validate input
    setValidationErrors({});
    const validationData = {
      customer_name: bookingForm.customer_name,
      customer_phone: bookingForm.customer_phone,
      customer_email: bookingForm.customer_email || "",
      special_requests: bookingForm.special_requests,
      guests_count: bookingForm.guests_count
    };

    try {
      bookingSchema.parse(validationData);

      // Check capacity
      if (bookingForm.guests_count > selectedService.max_capacity) {
        setValidationErrors({ 
          guests_count: `Maximum ${selectedService.max_capacity} guests allowed` 
        });
        toast({
          title: "Invalid Guest Count",
          description: `This service can accommodate maximum ${selectedService.max_capacity} guests.`,
          variant: "destructive",
        });
        return false;
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errors: Record<string, string> = {};
        error.errors.forEach((err) => {
          if (err.path[0]) {
            errors[err.path[0].toString()] = err.message;
          }
        });
        setValidationErrors(errors);
        toast({
          title: "Validation Error",
          description: "Please check your input and try again.",
          variant: "destructive",
        });
        return false;
      }
    }

    setIsSubmitting(true);
    try {
      const totalAmount = selectedService.price * bookingForm.guests_count;

      const { data: booking, error } = await supabase
        .from("bookings")
        .insert({
          user_id: user.id,
          service_id: bookingForm.service_id,
          booking_date: format(bookingForm.booking_date, "yyyy-MM-dd"),
          guests_count: bookingForm.guests_count,
          total_amount: totalAmount,
          customer_name: bookingForm.customer_name.trim(),
          customer_phone: `${bookingForm.country_code || '+91'}${bookingForm.customer_phone.trim()}`,
          customer_email: bookingForm.customer_email?.trim() || null,
          special_requests: bookingForm.special_requests?.trim() || null,
          status: "pending",
          payment_status: "pending"
        })
        .select("id")
        .single();

      if (error) throw error;

      // The in-app admin notification is written by the trg_notify_admin_on_booking
      // trigger, so it survives this tab closing. This call only sends the email.
      const notificationPromise = supabase.functions.invoke('notify-admin', {
        body: {
          category: 'booking',
          skip_in_app: true,
          dedupe_key: booking.id,
          title: `New Booking: ${selectedService.name}`,
          message: `New booking received from ${bookingForm.customer_name} for ${selectedService.name} on ${format(bookingForm.booking_date, "yyyy-MM-dd")}. Amount: ₹${totalAmount}. Phone: ${bookingForm.country_code || '+91'}${bookingForm.customer_phone.trim()}`,
          metadata: {
            booking_id: booking.id,
            customer_name: bookingForm.customer_name.trim(),
            customer_phone: `${bookingForm.country_code || '+91'}${bookingForm.customer_phone.trim()}`,
            customer_email: bookingForm.customer_email?.trim() || null,
            service_name: selectedService.name,
            booking_date: format(bookingForm.booking_date, "yyyy-MM-dd"),
            total_amount: totalAmount,
            guests_count: bookingForm.guests_count
          }
        }
      });

      notificationPromise.then((response) => {
        logger.log("✅ Notification sent successfully:", response);
      }).catch((notificationError) => {
        logger.error("❌ Failed to send admin notification:", notificationError);
        logger.error("Error details:", {
          message: notificationError?.message,
          status: notificationError?.status,
          statusText: notificationError?.statusText
        });
      });

      toast({
        title: "Booking Submitted! 🙏",
        description: `Your booking for ${selectedService.name} has been submitted. You will receive a confirmation call soon.`,
      });

      closeBookingDialog();
      return true;
    } catch (error) {
      logger.error("Error creating booking:", error);
      logger.error("Error details:", {
        message: error?.message,
        code: error?.code,
        details: error?.details,
        hint: error?.hint,
        user: user?.id,
        serviceId: bookingForm.service_id,
        bookingDate: bookingForm.booking_date
      });
      toast({
        title: "Booking Failed",
        description: "Unable to submit booking. Please try again.",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsSubmitting(false);
    }
  }, [selectedService, user, bookingForm, toast, closeBookingDialog]);

  return {
    // Data
    services,
    filteredServices,
    categories,
    isLoading,
    
    // Filters
    filters,
    setFilters,
    
    // Booking
    selectedService,
    bookingForm,
    isBookingDialogOpen,
    isSubmitting,
    validationErrors,
    
    // Actions
    fetchServices,
    openBookingDialog,
    closeBookingDialog,
    updateBookingForm,
    submitBooking
  };
}
