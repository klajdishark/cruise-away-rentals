
import React from 'react';
import { Badge } from '@/components/ui/badge';

interface Booking {
  id: string;
  customer: string;
  vehicle: string;
  startDate: string;
  endDate: string;
  status: 'pending' | 'confirmed' | 'active' | 'completed' | 'canceled';
  total: number;
  duration: number;
  notes?: string;
}

interface MonthViewProps {
  currentDate: Date;
  bookings: Booking[];
  onBookingClick: (booking: Booking) => void;
  onDateClick: (date: Date) => void;
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

export const MonthView = ({ currentDate, bookings, onBookingClick, onDateClick }: MonthViewProps) => {
  const getDaysInMonth = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    
    // Start from Sunday of the week containing the first day
    startDate.setDate(firstDay.getDate() - firstDay.getDay());
    
    const days = [];
    const current = new Date(startDate);
    
    // Generate 6 weeks (42 days) to fill the calendar grid
    for (let i = 0; i < 42; i++) {
      days.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }
    
    return days;
  };

  const getBookingsForDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return bookings.filter(booking => {
      const startDate = new Date(booking.startDate);
      const endDate = new Date(booking.endDate);
      const checkDate = new Date(dateStr);
      return checkDate >= startDate && checkDate <= endDate;
    });
  };

  const isCurrentMonth = (date: Date) => {
    return date.getMonth() === currentDate.getMonth();
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const days = getDaysInMonth();

  return (
    <div className="grid grid-cols-7 gap-1">
      {/* Day headers */}
      {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
        <div key={day} className="p-2 text-center font-medium text-muted-foreground border-b">
          {day}
        </div>
      ))}
      
      {/* Calendar days */}
      {days.map(date => {
        const dayBookings = getBookingsForDate(date);
        const isOtherMonth = !isCurrentMonth(date);
        const isCurrentDay = isToday(date);
        
        return (
          <div
            key={date.toISOString()}
            className={`
              min-h-[120px] p-2 border border-border cursor-pointer hover:bg-muted/50 transition-colors
              ${isOtherMonth ? 'text-muted-foreground bg-muted/20' : ''}
              ${isCurrentDay ? 'bg-primary/10 border-primary' : ''}
            `}
            onClick={() => onDateClick(date)}
          >
            <div className={`text-sm font-medium mb-1 ${isCurrentDay ? 'text-primary' : ''}`}>
              {date.getDate()}
            </div>
            
            <div className="space-y-1">
              {dayBookings.slice(0, 2).map(booking => (
                <div
                  key={booking.id}
                  className={`
                    text-xs p-1 rounded cursor-pointer hover:opacity-80 text-white
                    ${getStatusColor(booking.status)}
                  `}
                  onClick={(e) => {
                    e.stopPropagation();
                    onBookingClick(booking);
                  }}
                >
                  <div className="truncate font-medium">{booking.customer}</div>
                  <div className="truncate opacity-80">{booking.vehicle}</div>
                </div>
              ))}
              
              {dayBookings.length > 2 && (
                <div className="text-xs text-muted-foreground p-1">
                  +{dayBookings.length - 2} more
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};
