import React, {useState} from 'react';
import {Card, CardContent, CardHeader, CardTitle} from '@/components/ui/card';
import {Button} from '@/components/ui/button';
import {Calendar, ChevronLeft, ChevronRight, Grid, List, Plus} from 'lucide-react';
import {MonthView} from './calendar/MonthView';
import {WeekView} from './calendar/WeekView';
import {DayView} from './calendar/DayView';
import {BookingModal} from './BookingModal';
import {BookingsListModal} from './BookingsListModal';
import {useBookings} from '@/hooks/useBookings';
import {Tables} from '@/integrations/supabase/types';

type ViewMode = 'month' | 'week' | 'day';

export interface CalendarBooking {
    id: string;
    customer: string;
    customer_id: string;
    vehicle: string;
    vehicle_id: string;
    startDate: string;
    endDate: string;
    startTime?: string;
    endTime?: string;
    pickupLocation?: string;
    dropoffLocation?: string;
    dailyRate?: number;
    status: 'pending' | 'confirmed' | 'active' | 'completed' | 'canceled';
    bookingType?: 'online' | 'offline';
    total: number;
    duration: number;
    notes?: string;
    customers?: Tables<'customers'>;
    vehicles?: Tables<'vehicles'>;
}

const calculateDuration = (startDate: string, endDate: string) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    return Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
};

const calculateTotal = (startDate: string, endDate: string, dailyRate: number) => {
    const duration = calculateDuration(startDate, endDate);
    return duration * (dailyRate || 0);
};

export const CalendarView = () => {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [viewMode, setViewMode] = useState<ViewMode>('month');
    const {bookings: supabaseBookings, isLoading, error, createBooking, updateBooking} = useBookings();

    const bookings = supabaseBookings.map(booking => ({
        id: booking.id,
        customer: booking.customers?.name || 'Unknown',
        customer_id: booking.customer_id,
        vehicle: `${booking.vehicles?.brand} ${booking.vehicles?.model} ${booking.vehicles?.year}`,
        vehicle_id: booking.vehicle_id,
        startDate: booking.start_date,
        endDate: booking.end_date,
        startTime: booking.start_time,
        endTime: booking.end_time,
        pickupLocation: booking.pickup_location,
        dropoffLocation: booking.dropoff_location,
        dailyRate: booking.daily_rate,
        status: booking.status,
        bookingType: booking.booking_type as 'online' | 'offline',
        total: booking.total_amount,
        duration: booking.duration_days,
        notes: booking.notes,
        customers: booking.customers as Tables<'customers'>,
        vehicles: booking.vehicles as Tables<'vehicles'>
    }));

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isListModalOpen, setIsListModalOpen] = useState(false);
    const [selectedBooking, setSelectedBooking] = useState<CalendarBooking | undefined>();
    const [selectedDateBookings, setSelectedDateBookings] = useState<CalendarBooking[]>([]);
    const [selectedDateRange, setSelectedDateRange] = useState<{startDate: string, endDate: string} | null>(null);

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

    const handleBookingClick = (booking: CalendarBooking | { id: string, date: string, bookings: CalendarBooking[] }) => {
        if ('bookings' in booking) {
            setSelectedDateBookings(booking.bookings);
            setIsListModalOpen(true);
            setIsModalOpen(false);
        } else {
            setIsModalOpen(false); // Close modal first to reset state
            setTimeout(() => {
                setSelectedBooking(booking);
                setIsModalOpen(true);
            }, 100);
            setIsListModalOpen(false);
        }
    };

    const handleCreateBooking = (dateRange?: {startDate: string, endDate: string}) => {
        setSelectedBooking(undefined);
        setSelectedDateRange(dateRange || null);
        setIsModalOpen(true);
    };

    const handleSubmitBooking = (data: any) => {
        if (!data.customer_id || !data.vehicle_id) {
            // Show error to user
            return;
        }

        const bookingData = {
            customer_id: data.customer_id,
            vehicle_id: data.vehicle_id,
            start_date: data.start_date,
            end_date: data.end_date,
            start_time: data.start_time || '09:00:00',
            end_time: data.end_time || '09:00:00',
            pickup_location: data.pickup_location,
            dropoff_location: data.dropoff_location,
            daily_rate: data.daily_rate,
            status: data.status || 'pending',
            booking_type: data.booking_type || 'offline',
            total_amount: calculateTotal(data.start_date, data.end_date, data.daily_rate),
            duration_days: calculateDuration(data.start_date, data.end_date),
            notes: data.notes || ''
        };

        if (selectedBooking) {
            updateBooking({id: selectedBooking.id, ...bookingData});
        } else {
            createBooking(bookingData);
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
                return `${weekStart.toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric'
                })} - ${weekEnd.toLocaleDateString('en-US', {month: 'short', day: 'numeric', year: 'numeric'})}`;
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
                    <Plus className="w-4 h-4 mr-2"/>
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
                                    <ChevronLeft className="w-4 h-4"/>
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => navigateDate('next')}
                                >
                                    <ChevronRight className="w-4 h-4"/>
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
                                <Grid className="w-4 h-4 mr-2"/>
                                Month
                            </Button>
                            <Button
                                variant={viewMode === 'week' ? 'default' : 'outline'}
                                size="sm"
                                onClick={() => setViewMode('week')}
                            >
                                <List className="w-4 h-4 mr-2"/>
                                Week
                            </Button>
                            <Button
                                variant={viewMode === 'day' ? 'default' : 'outline'}
                                size="sm"
                                onClick={() => setViewMode('day')}
                            >
                                <Calendar className="w-4 h-4 mr-2"/>
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
            <BookingsListModal
                isOpen={isListModalOpen}
                onClose={() => setIsListModalOpen(false)}
                bookings={selectedDateBookings}
                onEdit={(booking) => {
                    setIsListModalOpen(false);
                    setSelectedBooking(booking);
                    setIsModalOpen(true);
                }}
            />
        </div>
    );
};
