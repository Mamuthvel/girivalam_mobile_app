import React from 'react';
import { Check, Phone, Mail, Calendar, Users, CreditCard, MessageCircle } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";

interface ServiceContact {
  contact_phone: string | null;
  show_contact_after_booking: boolean;
  contact_display_mode: 'call' | 'whatsapp' | 'both';
}

interface BookingDetails {
  id: string;
  service_name: string;
  booking_date: string;
  guests_count: number;
  total_amount: number;
  customer_name: string;
  customer_phone: string;
  customer_email?: string;
  status: string;
  payment_status: string;
  service_contact?: ServiceContact;
}

interface BookingConfirmationProps {
  booking: BookingDetails;
  onClose: () => void;
}

export const BookingConfirmation: React.FC<BookingConfirmationProps> = ({ booking, onClose }) => {
  const serviceContact = booking.service_contact;
  const showContact = serviceContact?.show_contact_after_booking && serviceContact?.contact_phone;
  const contactMode = serviceContact?.contact_display_mode || 'both';

  const handleCall = () => {
    if (serviceContact?.contact_phone) {
      window.location.href = `tel:${serviceContact.contact_phone}`;
    }
  };

  const handleWhatsApp = () => {
    if (serviceContact?.contact_phone) {
      const phone = serviceContact.contact_phone.replace(/[^0-9]/g, '');
      const message = encodeURIComponent(
        `🙏 Namaste! I have just booked "${booking.service_name}".\n\n` +
        `📋 Booking ID: ${booking.id.slice(0, 8)}\n` +
        `📅 Date: ${format(new Date(booking.booking_date), 'PPP')}\n` +
        `👥 Guests: ${booking.guests_count}\n\n` +
        `Please confirm my booking. Thank you! 🙏`
      );
      window.open(`https://wa.me/${phone}?text=${message}`, '_blank');
    }
  };

  return (
    <Card className="max-w-md mx-auto">
      <CardHeader className="text-center pb-4">
        <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
          <Check className="h-8 w-8 text-green-600" />
        </div>
        <CardTitle className="font-playfair text-2xl text-green-700">
          Booking Confirmed! 🙏
        </CardTitle>
        <CardDescription>
          Your sacred journey booking has been submitted successfully
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="bg-muted/50 rounded-lg p-4 space-y-3">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Booking ID:</span>
            <span className="font-mono text-sm">{booking.id.slice(0, 8)}</span>
          </div>
          
          <div className="flex justify-between">
            <span className="text-muted-foreground">Service:</span>
            <span className="font-medium">{booking.service_name}</span>
          </div>
          
          <div className="flex justify-between">
            <span className="text-muted-foreground">Date:</span>
            <span className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              {format(new Date(booking.booking_date), 'PPP')}
            </span>
          </div>
          
          <div className="flex justify-between">
            <span className="text-muted-foreground">Guests:</span>
            <span className="flex items-center gap-1">
              <Users className="h-4 w-4" />
              {booking.guests_count}
            </span>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Total Amount:</span>
            <span className="text-xl font-bold text-primary">₹{booking.total_amount}</span>
          </div>
        </div>

        {/* Service Contact Section - Only shown after booking confirmation */}
        {showContact && (
          <div className="bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-950/30 dark:to-amber-950/30 rounded-lg p-4 border border-orange-200 dark:border-orange-800">
            <h4 className="font-medium text-orange-800 dark:text-orange-300 mb-3 flex items-center gap-2">
              <Phone className="h-4 w-4" />
              Contact Service Provider
            </h4>
            <p className="text-lg font-semibold text-orange-900 dark:text-orange-200 mb-3">
              {serviceContact.contact_phone}
            </p>
            <div className="flex gap-2">
              {(contactMode === 'call' || contactMode === 'both') && (
                <Button 
                  onClick={handleCall}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                  size="lg"
                >
                  <Phone className="h-4 w-4 mr-2" />
                  Call Now
                </Button>
              )}
              {(contactMode === 'whatsapp' || contactMode === 'both') && (
                <Button 
                  onClick={handleWhatsApp}
                  className="flex-1 bg-[#25D366] hover:bg-[#128C7E] text-white"
                  size="lg"
                >
                  <MessageCircle className="h-4 w-4 mr-2" />
                  WhatsApp
                </Button>
              )}
            </div>
          </div>
        )}

        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Phone className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">{booking.customer_phone}</span>
            <Badge variant="outline" className="ml-auto">Your Contact</Badge>
          </div>
          
          {booking.customer_email && (
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">{booking.customer_email}</span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="flex items-center gap-1">
            <CreditCard className="h-3 w-3" />
            Payment: {booking.payment_status}
          </Badge>
          <Badge variant="outline">
            Status: {booking.status}
          </Badge>
        </div>

        <div className="bg-sky-50 dark:bg-sky-950/30 border border-sky-200 dark:border-sky-800 rounded-lg p-4">
          <h4 className="font-medium text-sky-700 dark:text-sky-300 mb-2">What's Next?</h4>
          <ul className="text-sm text-sky-600 dark:text-sky-400 space-y-1">
            <li>• You'll receive a confirmation call within 2 hours</li>
            <li>• Payment can be made on arrival or as advised</li>
            <li>• Carry a valid ID for verification</li>
            {showContact && <li>• Contact the service provider directly using the buttons above</li>}
          </ul>
        </div>

        <Button onClick={onClose} className="w-full sacred-button">
          Continue Your Journey
        </Button>
      </CardContent>
    </Card>
  );
};
