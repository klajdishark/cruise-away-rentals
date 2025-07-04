
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Calendar, Grid, List, Plus } from 'lucide-react';
import { MonthView } from './calendar/MonthView';
import { WeekView } from './calendar/WeekView';
import { DayView } from './calendar/DayView';
import { BookingModal } from './BookingModal';

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

type ViewMode = 'month' | 'week' | 'day';

const mockBookings: Booking[] = [
  {
    id: 'BK001',
    customer: 'John Doe',
    vehicle: 'Toyota Camry 2023',
    startDate: '2024-01-15',
    endDate: '2024-01-20',
    status: 'confirmed',
    total: 225,
    duration: 5,
  },
  {
    id: 'BK002',
    customer: 'Jane Smith',
    vehicle: 'Honda Civic 2022',
    startDate: '2024-01-18',
    endDate: '2024-01-22',
    status: 'pending',
    total: 160,
    duration: 4,
  },
  {
    id: 'BK003',
    customer: 'Mike Johnson',
    vehicle: 'BMW X5 2023',
    startDate: '2024-01-10',
    endDate: '2024-01-15',
    status: 'completed',
    total: 425,
    duration: 5,
  },
  {
    id: 'BK004',
    customer: 'Sarah Wilson',
    vehicle: 'Tesla Model 3 2023',
    startDate: '2024-01-20',
    endDate: '2024-01-25',
    status: 'active',
    total: 375,
    duration: 5,
  },
];

export const CalendarView = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<ViewMode>('month');
  const [bookings, setBookings] = useState<Booking[]>(mockBookings);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<Booking | undefined>();

  const navigateDate = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    
    switch (viewMode) {
      case 'month':
        newDate.setMonth(currentDate.getMonth() + (direction === 'next' ? 1 : -1));
        break;
      case 'week':
        newDate.setDate(currentDate.getDate() + (direction === 'next' ? 7 : -7));
        break;
      case 'day':
        newDate.setDate(currentDate.getDate() + (direction === 'next' ? 1 : -1));
        break;
    }
    
    setCurrentDate(newDate);
  };

  const handleBookingClick = (booking: Booking) => {
    setSelectedBooking(booking);
    setIsModalOpen(true);
  };

  const handleCreateBooking = (date?: Date) => {
    setSelectedBooking(undefined);
    setIsModalOpen(true);
  };

  const handleSubmitBooking = (data: any) => {
    if (selectedBooking) {
      setBookings(bookings.map(booking => 
        booking.id === selectedBooking.id 
          ? { 
              ...booking, 
              ...data,
              duration: Math.ceil((new Date(data.endDate).getTime() - new Date(data.startDate).getTime()) / (1000 * 60 * 60 * 24))
            }
          : booking
      ));
    } else {
      const newBooking: Booking = {
        id: `BK${String(bookings.length + 1).padStart(3, '0')}`,
        ...data,
        duration: Math.ceil((new Date(data.endDate).getTime() - new Date(data.startDate).getTime()) / (1000 * 60 * 60 * 24))
      };
      setBookings([...bookings, newBooking]);
    }
  };

  const formatDateHeader = () => {
    const options: Intl.DateTimeFormatOptions = {};
    
    switch (viewMode) {
      case 'month':
        options.year = 'numeric';
        options.month = 'long';
        break;
      case 'week':
        const weekStart = new Date(currentDate);
        const weekEnd = new Date(currentDate);
        weekStart.setDate(currentDate.getDate() - currentDate.getDay());
        weekEnd.setDate(weekStart.getDate() + 6);
        return `${weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${weekEnd.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
      case 'day':
        options.year = 'numeric';
        options.month = 'long';
        options.day = 'numeric';
        break;
    }
    
    return currentDate.toLocaleDateString('en-US', options);
  };

  const renderView = () => {
    switch (viewMode) {
      case 'month':
        return (
          <MonthView
            currentDate={currentDate}
            bookings={bookings}
            onBookingClick={handleBookingClick}
            onDateClick={handleCreateBooking}
          />
        );
      case 'week':
        return (
          <WeekView
            currentDate={currentDate}
            bookings={bookings}
            onBookingClick={handleBookingClick}
            onDateClick={handleCreateBooking}
          />
        );
      case 'day':
        return (
          <DayView
            currentDate={currentDate}
            bookings={bookings}
            onBookingClick={handleBookingClick}
            onDateClick={handleCreateBooking}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Calendar View</h1>
          <p className="text-muted-foreground">Manage bookings in calendar format</p>
        </div>
        <Button onClick={() => handleCreateBooking()}>
          <Plus className="w-4 h-4 mr-2" />
          New Booking
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigateDate('prev')}
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigateDate('next')}
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
              <CardTitle className="text-xl">{formatDateHeader()}</CardTitle>
            </div>
            
            <div className="flex gap-2">
              <Button
                variant={viewMode === 'month' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('month')}
              >
                <Grid className="w-4 h-4 mr-2" />
                Month
              </Button>
              <Button
                variant={viewMode === 'week' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('week')}
              >
                <List className="w-4 h-4 mr-2" />
                Week
              </Button>
              <Button
                variant={viewMode === 'day' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('day')}
              >
                <Calendar className="w-4 h-4 mr-2" />
                Day
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {renderView()}
        </CardContent>
      </Card>

      <BookingModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        booking={selectedBooking}
        onSubmit={handleSubmitBooking}
      />
    </div>
  );
};
