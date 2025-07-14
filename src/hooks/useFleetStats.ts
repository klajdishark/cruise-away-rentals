import {Vehicle} from './useVehicles';

/**
 * Calculates fleet statistics from vehicle data
 * @param vehicles Array of vehicle objects
 * @returns Object containing total, available, rented, and maintenance counts
 */
export const useFleetStats = (vehicles: Vehicle[]) => {
    return {
        total: vehicles.length,
        available: vehicles.filter(v => v.status === 'active').length,
        rented: vehicles.filter(v => v.status === 'rented').length,
        maintenance: vehicles.filter(v => v.status === 'maintenance').length
    };
};
