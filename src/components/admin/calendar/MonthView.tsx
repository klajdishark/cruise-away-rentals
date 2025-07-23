import React, {useEffect, useRef, useState} from 'react';

import {CalendarBooking} from '../CalendarView';

interface MonthViewProps {
    currentDate: Date;
    bookings: CalendarBooking[];
    onBookingClick: (booking: CalendarBooking | { id: string, date: string, bookings: CalendarBooking[] }) => void;
    onDateClick: (dateRange: {startDate: string, endDate: string}) => void;
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

export const MonthView = ({currentDate, bookings, onBookingClick, onDateClick}: MonthViewProps) => {
    const [selectionStart, setSelectionStart] = useState<Date | null>(null);
    const [selectionEnd, setSelectionEnd] = useState<Date | null>(null);
    const [isSelecting, setIsSelecting] = useState(false);
    const calendarRef = useRef<HTMLDivElement>(null);

    const handleMouseDown = (date: Date) => {
        setSelectionStart(date);
        setSelectionEnd(date);
        setIsSelecting(true);
    };

    const handleMouseEnter = (date: Date) => {
        if (isSelecting && selectionStart) {
            setSelectionEnd(date);
        }
    };

    const handleMouseUp = () => {
        if (isSelecting && selectionStart && selectionEnd) {
            const start = selectionStart < selectionEnd ? selectionStart : selectionEnd;
            const end = selectionStart < selectionEnd ? selectionEnd : selectionStart;
            const startStr = start.toISOString().split('T')[0];
            const endStr = end.toISOString().split('T')[0];
            onDateClick({startDate: startStr, endDate: endStr});
        }
        setIsSelecting(false);
        setSelectionStart(null);
        setSelectionEnd(null);
    };

    useEffect(() => {
        const handleGlobalMouseUp = () => {
            if (isSelecting) {
                handleMouseUp();
            }
        };

        document.addEventListener('mouseup', handleGlobalMouseUp);
        return () => {
            document.removeEventListener('mouseup', handleGlobalMouseUp);
        };
    }, [isSelecting, selectionStart, selectionEnd]);
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
              min-h-[120px] p-2 border border-border transition-colors relative
              ${isOtherMonth ? 'text-muted-foreground bg-muted/20' : ''}
              ${isCurrentDay ? 'bg-primary/10 border-primary' : ''}
              ${selectionStart && selectionEnd && date >= selectionStart && date <= selectionEnd ? 'bg-blue-100' : ''}
              ${selectionStart && selectionEnd && (date.getTime() === selectionStart.getTime() || date.getTime() === selectionEnd.getTime()) ? 'border-blue-500 border-2' : ''}
              cursor-pointer hover:bg-muted/50
            `}
                        onMouseDown={() => handleMouseDown(date)}
                        onMouseEnter={() => handleMouseEnter(date)}
                        onClick={() => {
                            if (!isSelecting && dayBookings.length === 0) {
                                const dateStr = date.toISOString().split('T')[0];
                                onDateClick({startDate: dateStr, endDate: dateStr});
                            }
                        }}
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
                                <div 
                                    className="text-xs text-muted-foreground p-1 bg-background/80 rounded hover:bg-muted cursor-pointer"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onBookingClick({
                                            id: 'list-view',
                                            date: date.toISOString(),
                                            bookings: dayBookings
                                        });
                                    }}
                                >
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
