import React, {useState, useEffect} from 'react';
import {Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle,} from '@/components/ui/dialog';
import {BookingForm} from './BookingForm';

import {CalendarBooking} from './CalendarView';

interface BookingModalProps {
    isOpen: boolean;
    onClose: () => void;
    booking?: CalendarBooking;
    initialDates?: {startDate: string, endDate: string};
    onSubmit: (data: any) => void;
}

export const BookingModal = ({isOpen, onClose, booking, initialDates, onSubmit}: BookingModalProps) => {
    const [isLoading, setIsLoading] = useState(!booking);
    const handleSubmit = (data: any) => {
        onSubmit(data);
        onClose();
    };

    useEffect(() => {
        // For new bookings, we have initial data immediately
        // For existing bookings, we need to load the booking data
        if (booking) {
            setIsLoading(true);
            // Simulate loading existing booking data
            setTimeout(() => setIsLoading(false), 100);
        } else {
            setIsLoading(false); // No loading for new bookings
        }
    }, [booking]);

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>
                        {booking ? 'Edit Booking' : 'Create New Booking'}
                    </DialogTitle>
                    <DialogDescription>
                        {booking
                            ? 'Update the booking information below.'
                            : 'Fill in the details to create a new booking.'
                        }
                    </DialogDescription>
                </DialogHeader>

                {isLoading ? (
                    <div className="flex justify-center items-center h-64">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
                    </div>
                ) : (
                    <BookingForm
                        booking={booking}
                        initialDates={initialDates}
                        onSubmit={handleSubmit}
                        onCancel={onClose}
                    />
                )}
            </DialogContent>
        </Dialog>
    );
};
