import React from 'react';
import {Dialog, DialogContent, DialogHeader, DialogTitle} from '@/components/ui/dialog';
import {Button} from '@/components/ui/button';
import {X} from 'lucide-react';
import {CalendarBooking} from './calendar/DayView';

interface BookingsListModalProps {
  isOpen: boolean;
  onClose: () => void;
  bookings: CalendarBooking[];
  onEdit: (booking: CalendarBooking) => void;
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'confirmed':
      return 'bg-green-500';
    case 'pending':
      return 'bg-yellow-500';
    case 'active':
      return 'bg-blue-500';
    case 'completed':
      return 'bg-gray-500';
    case 'canceled':
      return 'bg-red-500';
    default:
      return 'bg-gray-500';
  }
};

export const BookingsListModal = ({isOpen, onClose, bookings, onEdit}: BookingsListModalProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex justify-between items-center">
            <span>Bookings ({bookings.length})</span>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-2">
          {bookings.map(booking => (
            <div
              key={booking.id}
              className={`p-3 rounded-lg border cursor-pointer hover:bg-muted/50 transition-colors`}
              onClick={() => {
                onEdit(booking);
                onClose();
              }}
            >
              <div className="flex justify-between items-start">
                <div>
                  <div className="font-medium">{booking.customer}</div>
                  <div className="text-sm text-muted-foreground">{booking.vehicle}</div>
                </div>
                <div className={`text-xs px-2 py-1 rounded-full text-white ${getStatusColor(booking.status)}`}>
                  {booking.status}
                </div>
              </div>
              <div className="mt-2 text-sm">
                {new Date(booking.startDate).toLocaleDateString()} - {new Date(booking.endDate).toLocaleDateString()}
              </div>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
};
