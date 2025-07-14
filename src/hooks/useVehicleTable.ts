import {useMemo, useState} from 'react';
import {Vehicle} from './useVehicles';

/**
 * Handles vehicle table filtering and search functionality
 * @param vehicles Array of vehicle objects
 * @returns Filtered vehicles and control methods
 */
export const useVehicleTable = (vehicles: Vehicle[]) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<'all' | Vehicle['status']>('all');

    const filteredVehicles = useMemo(() =>
            vehicles.filter(vehicle => {
                const matchesSearch = `${vehicle.brand} ${vehicle.model}`
                    .toLowerCase().includes(searchTerm.toLowerCase());
                const matchesStatus = statusFilter === 'all' || vehicle.status === statusFilter;
                return matchesSearch && matchesStatus;
            }),
        [vehicles, searchTerm, statusFilter]);

    return {
        filteredVehicles,
        searchTerm,
        setSearchTerm,
        statusFilter,
        setStatusFilter
    };
};
