import type { Dispatch, SetStateAction } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { TabsContent } from '@/components/ui/tabs';
import { Search, Download } from 'lucide-react';
import type { Booking, BookingStatusFilter } from '../adminTypes';

interface BookingsTabProps {
  bookingSearch: string;
  setBookingSearch: Dispatch<SetStateAction<string>>;
  bookingStatusFilter: BookingStatusFilter;
  setBookingStatusFilter: Dispatch<SetStateAction<BookingStatusFilter>>;
  exportBookingsToCsv: () => void;
  filteredBookings: Booking[];
  updateBookingStatus: (
    bookingId: string,
    field: 'status' | 'payment_status',
    value: string,
  ) => void;
}

const BookingsTab = ({
  bookingSearch,
  setBookingSearch,
  bookingStatusFilter,
  setBookingStatusFilter,
  exportBookingsToCsv,
  filteredBookings,
  updateBookingStatus,
}: BookingsTabProps) => (
  <TabsContent value="bookings">
    <Card>
      <CardHeader>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div>
            <CardTitle>Bookings</CardTitle>
            <CardDescription>
              Track booking status and manage reservations
            </CardDescription>
          </div>
          <div className="flex flex-col md:flex-row gap-2 md:items-center">
            <div className="relative w-full md:w-56">
              <Search className="h-4 w-4 absolute left-2 top-2.5 text-muted-foreground" />
              <Input
                className="pl-8"
                placeholder="Search bookings..."
                value={bookingSearch}
                onChange={(e) => setBookingSearch(e.target.value)}
              />
            </div>
            <Select
              value={bookingStatusFilter}
              onValueChange={(value) =>
                setBookingStatusFilter(value as BookingStatusFilter)
              }
            >
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                <SelectItem value="confirmed">Confirmed</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              size="sm"
              onClick={exportBookingsToCsv}
              className="flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              Export CSV
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Customer</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Payment</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredBookings.map((booking) => (
              <TableRow key={booking.id}>
                <TableCell>{booking.customer_name}</TableCell>
                <TableCell>{booking.customer_phone}</TableCell>
                <TableCell>{booking.customer_email}</TableCell>
                <TableCell>
                  {booking.booking_date
                    ? new Date(
                      booking.booking_date
                    ).toLocaleDateString()
                    : '-'}
                </TableCell>
                <TableCell>
                  <Badge
                    variant={
                      booking.status === 'confirmed'
                        ? 'default'
                        : booking.status === 'pending'
                          ? 'secondary'
                          : 'outline'
                    }
                  >
                    {booking.status ?? 'unknown'}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge
                    variant={
                      booking.payment_status === 'paid'
                        ? 'default'
                        : booking.payment_status === 'pending'
                          ? 'secondary'
                          : 'outline'
                    }
                  >
                    {booking.payment_status ?? 'unknown'}
                  </Badge>
                </TableCell>
                <TableCell>
                  ₹{Number(booking.total_amount || 0).toLocaleString()}
                </TableCell>
                <TableCell className="text-right">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm">
                        Edit
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-md">
                      <DialogHeader>
                        <DialogTitle>Edit Booking</DialogTitle>
                        <DialogDescription>
                          Update booking status and payment information.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="text-sm font-medium">Customer</label>
                            <p className="text-sm text-muted-foreground">{booking.customer_name}</p>
                          </div>
                          <div>
                            <label className="text-sm font-medium">Phone</label>
                            <p className="text-sm text-muted-foreground">{booking.customer_phone}</p>
                          </div>
                        </div>
                        <div>
                          <label className="text-sm font-medium">Email</label>
                          <p className="text-sm text-muted-foreground">{booking.customer_email || 'Not provided'}</p>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="text-sm font-medium">Date</label>
                            <p className="text-sm text-muted-foreground">
                              {booking.booking_date
                                ? new Date(booking.booking_date).toLocaleDateString()
                                : '-'}
                            </p>
                          </div>
                          <div>
                            <label className="text-sm font-medium">Amount</label>
                            <p className="text-sm text-muted-foreground">
                              ₹{Number(booking.total_amount || 0).toLocaleString()}
                            </p>
                          </div>
                        </div>
                        {booking.special_requests && (
                          <div>
                            <label className="text-sm font-medium">Special Requests</label>
                            <p className="text-sm text-muted-foreground">{booking.special_requests}</p>
                          </div>
                        )}
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="text-sm font-medium">Booking Status</label>
                            <Select
                              value={booking.status || 'pending'}
                              onValueChange={(value) => updateBookingStatus(booking.id, 'status', value)}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="pending">Pending</SelectItem>
                                <SelectItem value="confirmed">Confirmed</SelectItem>
                                <SelectItem value="cancelled">Cancelled</SelectItem>
                                <SelectItem value="completed">Completed</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <label className="text-sm font-medium">Payment Status</label>
                            <Select
                              value={booking.payment_status || 'pending'}
                              onValueChange={(value) => updateBookingStatus(booking.id, 'payment_status', value)}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="pending">Pending</SelectItem>
                                <SelectItem value="paid">Paid</SelectItem>
                                <SelectItem value="failed">Failed</SelectItem>
                                <SelectItem value="refunded">Refunded</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </TableCell>
              </TableRow>
            ))}
            {filteredBookings.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={8}
                  className="text-center text-sm text-muted-foreground"
                >
                  No bookings found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  </TabsContent>
);

export default BookingsTab;
