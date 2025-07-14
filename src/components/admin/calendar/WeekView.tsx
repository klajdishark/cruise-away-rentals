import React from 'react';

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

interface WeekViewProps {
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

export const WeekView = ({currentDate, bookings, onBookingClick, onDateClick}: WeekViewProps) => {
    const getWeekDays = () => {
        const days = [];
        const startOfWeek = new Date(currentDate);
        startOfWeek.setDate(currentDate.getDate() - currentDate.getDay());

        for (let i = 0; i < 7; i++) {
            const day = new Date(startOfWeek);
            day.setDate(startOfWeek.getDate() + i);
            days.push(day);
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

    const isToday = (date: Date) => {
        const today = new Date();
        return date.toDateString() === today.toDateString();
    };

    const timeSlots = Array.from({length: 24}, (_, i) => {
        const hour = i.toString().padStart(2, '0');
        return `${hour}:00`;
    });

    const weekDays = getWeekDays();

    return (
        <div className="flex">
            {/* Time column */}
            <div className="w-20 flex-shrink-0">
                <div className="h-16 border-b"></div>
                {timeSlots.map(time => (
                    <div key={time} className="h-12 border-b text-xs text-muted-foreground p-1">
                        {time}
                    </div>
                ))}
            </div>

            {/* Days columns */}
            <div className="flex-1 grid grid-cols-7 gap-1">
                {weekDays.map(date => {
                    const dayBookings = getBookingsForDate(date);
                    const isCurrentDay = isToday(date);

                    return (
                        <div key={date.toISOString()} className="border-l">
                            {/* Day header */}
                            <div
                                className={`
                  h-16 p-2 border-b cursor-pointer hover:bg-muted/50 transition-colors
                  ${isCurrentDay ? 'bg-primary/10' : ''}
                `}
                                onClick={() => onDateClick(date)}
                            >
                                <div className="text-xs text-muted-foreground">
                                    {date.toLocaleDateString('en-US', {weekday: 'short'})}
                                </div>
                                <div className={`text-lg font-medium ${isCurrentDay ? 'text-primary' : ''}`}>
                                    {date.getDate()}
                                </div>
                            </div>

                            {/* Time slots */}
                            <div className="relative">
                                {timeSlots.map(time => (
                                    <div key={time} className="h-12 border-b hover:bg-muted/20 cursor-pointer"/>
                                ))}

                                {/* Bookings overlay */}
                                <div className="absolute inset-0 pointer-events-none">
                                    {dayBookings.map((booking, index) => (
                                        <div
                                            key={booking.id}
                                            className={`
                        absolute left-1 right-1 p-1 rounded text-white text-xs cursor-pointer pointer-events-auto
                        ${getStatusColor(booking.status)}
                      `}
                                            style={{
                                                top: `${8 * 48 + index * 60}px`, // Start at 8 AM + offset for multiple bookings
                                                height: '56px'
                                            }}
                                            onClick={() => onBookingClick(booking)}
                                        >
                                            <div className="font-medium truncate">{booking.customer}</div>
                                            <div className="truncate opacity-80">{booking.vehicle}</div>
                                            <div className="truncate opacity-60">${booking.total}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};
