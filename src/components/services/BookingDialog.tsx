import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { SpiritualCard } from "@/components/SpiritualCard";
import { Service, BookingFormData } from "@/types/services";
import { format, addDays, isBefore, isAfter, startOfDay } from "date-fns";
import {
  CreditCard,
  Calendar as CalendarIcon,
  Loader2
} from "lucide-react";
import { useState } from "react";
import { toast } from "@/hooks/use-toast";

interface BookingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  service: Service | null;
  form: BookingFormData;
  onFormChange: (updates: Partial<BookingFormData>) => void;
  onSubmit: () => Promise<boolean>;
  isSubmitting: boolean;
  validationErrors: Record<string, string>;
}

export function BookingDialog({
  open,
  onOpenChange,
  service,
  form,
  onFormChange,
  onSubmit,
  isSubmitting,
  validationErrors
}: BookingDialogProps) {
  const [calendarOpen, setCalendarOpen] = useState(false);

  if (!service) return null;

  const totalAmount = service.price * form.guests_count;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit();
  };

  const today = new Date();
  const maxDate = addDays(today, 5);

  const handleGuestsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value) || 1;
    if (value > service.max_capacity) {
      toast({
        title: "Maximum capacity reached",
        description: "Use the counter to increase the number of guests.",
        variant: "destructive",
      });
      onFormChange({ guests_count: service.max_capacity });
    } else {
      onFormChange({ guests_count: value });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-playfair flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-primary" />
            Book {service.name}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Service Summary */}
          <SpiritualCard className="p-4">
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="font-medium">Service:</span>
                <span className="text-right">{service.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Price per person:</span>
                <span className="text-primary font-bold">₹{service.price}</span>
              </div>
              {service.duration_hours && (
                <div className="flex justify-between">
                  <span className="font-medium">Duration:</span>
                  <span>{service.duration_hours}h</span>
                </div>
              )}
              <div className="flex justify-between pt-2 border-t border-border/50">
                <span className="font-semibold">Total:</span>
                <span className="text-primary font-bold text-lg">₹{totalAmount}</span>
              </div>
            </div>
          </SpiritualCard>

          {/* Booking Form */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="booking_date">Booking Date</Label>
              <div className="mt-1">
                <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full justify-start text-left font-normal"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {format(form.booking_date, "PPP")}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={form.booking_date}
                      onSelect={(date) => {
                        if (date) {
                          onFormChange({ booking_date: date });
                          setCalendarOpen(false);
                        }
                      }}
                      disabled={(date) =>
                        isBefore(startOfDay(date), startOfDay(today)) ||
                        isAfter(startOfDay(date), startOfDay(maxDate))
                      }
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            <div>
              <Label htmlFor="guests_count">Number of Guests</Label>
              <Input
                id="guests_count"
                type="number"
                min="1"
                max={service.max_capacity}
                value={form.guests_count}
                onChange={handleGuestsChange}
                className={validationErrors.guests_count ? "border-destructive" : ""}
              />
              {validationErrors.guests_count && (
                <p className="text-sm text-destructive mt-1">{validationErrors.guests_count}</p>
              )}
            </div>

            <div>
              <Label htmlFor="customer_name">Full Name *</Label>
              <Input
                id="customer_name"
                value={form.customer_name}
                onChange={(e) => onFormChange({ customer_name: e.target.value })}
                placeholder="Enter your full name"
                maxLength={100}
                className={validationErrors.customer_name ? "border-destructive" : ""}
              />
              {validationErrors.customer_name && (
                <p className="text-sm text-destructive mt-1">{validationErrors.customer_name}</p>
              )}
            </div>

            <div>
              <Label htmlFor="customer_phone">Phone Number *</Label>
              <div className="flex gap-2 mt-1">
                <select
                  value={form.country_code || "+91"}
                  onChange={(e) => onFormChange({ country_code: e.target.value })}
                  className="w-24 h-10 rounded-md border border-input bg-background px-3 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  <option value="+91">🇮🇳 +91</option>
                  <option value="+1">🇺🇸 +1</option>
                  <option value="+44">🇬🇧 +44</option>
                  <option value="+61">🇦🇺 +61</option>
                  <option value="+65">🇸🇬 +65</option>
                  <option value="+971">🇦🇪 +971</option>
                </select>
                <Input
                  id="customer_phone"
                  value={form.customer_phone}
                  onChange={(e) => onFormChange({ customer_phone: e.target.value.replace(/\D/g, '').slice(0, 10) })}
                  placeholder="9876543210"
                  maxLength={10}
                  className={`flex-1 ${validationErrors.customer_phone ? "border-destructive" : ""}`}
                />
              </div>
              {validationErrors.customer_phone && (
                <p className="text-sm text-destructive mt-1">{validationErrors.customer_phone}</p>
              )}
            </div>

            <div>
              <Label htmlFor="customer_email">Email (Optional)</Label>
              <Input
                id="customer_email"
                type="email"
                value={form.customer_email}
                onChange={(e) => onFormChange({ customer_email: e.target.value })}
                placeholder="your@email.com"
                maxLength={255}
                className={validationErrors.customer_email ? "border-destructive" : ""}
              />
              {validationErrors.customer_email && (
                <p className="text-sm text-destructive mt-1">{validationErrors.customer_email}</p>
              )}
            </div>

            <div>
              <Label htmlFor="special_requests">Special Requests (Optional)</Label>
              <Textarea
                id="special_requests"
                value={form.special_requests}
                onChange={(e) => onFormChange({ special_requests: e.target.value })}
                placeholder="Any special requirements..."
                maxLength={500}
                rows={3}
              />
            </div>
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            className="w-full sacred-button"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <CreditCard className="mr-2 h-4 w-4" />
                Confirm Booking - ₹{totalAmount}
              </>
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}