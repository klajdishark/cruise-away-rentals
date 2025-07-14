import React from 'react';
import {Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle,} from '@/components/ui/dialog';
import {BookingForm} from './BookingForm';

interface Booking {
    id?: string;
    customer: string;
    vehicle: string;
    startDate: string;
    endDate: string;
    status: 'pending' | 'confirmed' | 'active' | 'completed' | 'canceled';
    total: number;
    duration?: number;
    notes?: string;
}

interface BookingModalProps {
    isOpen: boolean;
    onClose: () => void;
    booking?: Booking;
    onSubmit: (data: any) => void;
}

export const BookingModal = ({isOpen, onClose, booking, onSubmit}: BookingModalProps) => {
    const handleSubmit = (data: any) => {
        onSubmit(data);
        onClose();
    };

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

                <BookingForm
                    booking={booking}
                    onSubmit={handleSubmit}
                    onCancel={onClose}
                />
            </DialogContent>
        </Dialog>
    );
};
