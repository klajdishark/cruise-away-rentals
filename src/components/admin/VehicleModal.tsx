import React from 'react';
import {Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle,} from '@/components/ui/dialog';
import {VehicleForm} from './VehicleForm';
import {Vehicle} from '@/hooks/useVehicles';

interface VehicleModalProps {
    isOpen: boolean;
    onClose: () => void;
    vehicle?: Vehicle;
    onSubmit: (data: any) => void;
    isSubmitting?: boolean;
}

export const VehicleModal = ({isOpen, onClose, vehicle, onSubmit, isSubmitting = false}: VehicleModalProps) => {
    const handleSubmit = (data: any) => {
        onSubmit(data);
        onClose();
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>
                        {vehicle ? 'Edit Vehicle' : 'Add New Vehicle'}
                    </DialogTitle>
                    <DialogDescription>
                        {vehicle
                            ? 'Update the vehicle information below.'
                            : 'Fill in the details to add a new vehicle to your fleet.'
                        }
                    </DialogDescription>
                </DialogHeader>

                <VehicleForm
                    vehicle={vehicle}
                    onSubmit={handleSubmit}
                    onCancel={onClose}
                    isSubmitting={isSubmitting}
                />
            </DialogContent>
        </Dialog>
    );
};
