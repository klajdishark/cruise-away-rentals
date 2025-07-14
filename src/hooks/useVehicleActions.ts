import {useToast} from '@/hooks/use-toast';
import {useVehicles, Vehicle} from './useVehicles';

/**
 * Handles vehicle CRUD operations
 * @returns Methods for vehicle actions
 */
export const useVehicleActions = () => {
    const {toast} = useToast();
    const {addVehicle, updateVehicle, deleteVehicle} = useVehicles();

    const handleDelete = async (vehicleId: string, vehicles: Vehicle[]) => {
        const vehicle = vehicles.find(v => v.id === vehicleId);
        if (vehicle?.status === 'rented') {
            toast({
                title: "Cannot Delete Vehicle",
                description: "This vehicle is currently rented and cannot be deleted.",
                variant: "destructive",
            });
            return false;
        }

        const success = await deleteVehicle(vehicleId);
        if (success) {
            toast({
                title: "Vehicle Deleted",
                description: "The vehicle has been successfully removed from your fleet.",
            });
        }
        return success;
    };

    const handleSubmit = async (data: any, editingVehicle?: Vehicle) => {
        try {
            if (editingVehicle) {
                const result = await updateVehicle(editingVehicle.id, data);
                if (result) {
                    toast({
                        title: "Vehicle Updated",
                        description: "The vehicle information has been successfully updated.",
                    });
                    return true;
                }
            } else {
                const result = await addVehicle(data);
                if (result) {
                    toast({
                        title: "Vehicle Added",
                        description: "The new vehicle has been successfully added to your fleet.",
                    });
                    return true;
                }
            }
            return false;
        } catch (error) {
            toast({
                title: "Error",
                description: "An error occurred while saving the vehicle. Please try again.",
                variant: "destructive",
            });
            return false;
        }
    };

    return {handleDelete, handleSubmit};
};
