import React from 'react';

interface CalendarBooking {
    id: string;
    customer: string;
    customer_id: string;
    vehicle: string;
    vehicle_id: string;
    startDate: string;
    endDate: string;
    status: 'pending' | 'confirmed' | 'active' | 'completed' | 'canceled';
    total: number;
    duration: number;
    notes?: string;
    customers?: {
        id: string;
        name: string;
        email: string;
        phone: string;
    };
    vehicles?: {
        id: string;
        brand: string;
        model: string;
        year: number;
        license_plate: string;
    };
}

interface DayViewProps {
    currentDate: Date;
    bookings: CalendarBooking[];
    onBookingClick: (booking: CalendarBooking | { id: string, date: string, bookings: CalendarBooking[] }) => void;
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

export const DayView = ({currentDate, bookings, onBookingClick, onDateClick}: DayViewProps) => {
    const getBookingsForDate = (date: Date) => {
        const dateStr = date.toISOString().split('T')[0];
        return bookings.filter(booking => {
            const startDate = new Date(booking.startDate);
            const endDate = new Date(booking.endDate);
            const checkDate = new Date(dateStr);
            return checkDate >= startDate && checkDate <= endDate;
        });
    };

    const timeSlots = Array.from({length: 24}, (_, i) => {
        const hour = i.toString().padStart(2, '0');
        return `${hour}:00`;
    });

    const dayBookings = getBookingsForDate(currentDate);
    const isToday = currentDate.toDateString() === new Date().toDateString();

    return (
        <div className="flex">
            {/* Time column */}
            <div className="w-20 flex-shrink-0">
                {timeSlots.map(time => (
                    <div key={time} className="h-16 border-b text-xs text-muted-foreground p-2 flex items-center">
                        {time}
                    </div>
                ))}
            </div>

            {/* Day column */}
            <div className="flex-1 border-l relative">
                {/* Time slots */}
                {timeSlots.map(time => (
                    <div
                        key={time}
                        className="h-16 border-b hover:bg-muted/20 cursor-pointer transition-colors"
                        onClick={() => onDateClick(currentDate)}
                    />
                ))}

                {/* Current time indicator */}
                {isToday && (
                    <div
                        className="absolute left-0 right-0 h-0.5 bg-red-500 z-10"
                        style={{
                            top: `${(new Date().getHours() + new Date().getMinutes() / 60) * 64}px`
                        }}
                    >
                        <div className="w-3 h-3 bg-red-500 rounded-full -ml-1.5 -mt-1.5"></div>
                    </div>
                )}

                {/* Bookings overlay */}
                <div className="absolute inset-0 p-2">
                    {dayBookings.map((booking, index) => (
                        <div
                            key={booking.id}
                            className={`
                absolute left-2 right-2 p-3 rounded-lg text-white cursor-pointer hover:opacity-90 transition-opacity shadow-lg
                ${getStatusColor(booking.status)}
              `}
                            style={{
                                top: `${8 * 64 + index * 80}px`, // Start at 8 AM + offset for multiple bookings
                                height: '72px'
                            }}
                            onClick={() => onBookingClick(booking)}
                        >
                            <div className="font-semibold text-sm">{booking.customer}</div>
                            <div className="text-xs opacity-90 truncate">{booking.vehicle}</div>
                            <div className="text-xs opacity-75">
                                ${booking.total} • {booking.duration} days
                            </div>
                            <div className="text-xs opacity-60 mt-1">
                                {booking.startDate} - {booking.endDate}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};
