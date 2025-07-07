
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface AvailabilityCheckParams {
  vehicleId: string;
  startDate: string;
  endDate: string;
  excludeBookingId?: string;
}

export const useVehicleAvailability = () => {
  const [isChecking, setIsChecking] = useState(false);

  const checkAvailability = useCallback(async ({ 
    vehicleId, 
    startDate, 
    endDate, 
    excludeBookingId 
  }: AvailabilityCheckParams): Promise<boolean> => {
    if (!vehicleId || !startDate || !endDate) {
      return true; // Don't block if required data is missing
    }

    setIsChecking(true);
    
    try {
      console.log('Checking availability for:', { vehicleId, startDate, endDate, excludeBookingId });
      
      const { data, error } = await supabase.rpc('check_vehicle_availability', {
        p_vehicle_id: vehicleId,
        p_start_date: startDate,
        p_end_date: endDate,
        p_exclude_booking_id: excludeBookingId || null
      });

      if (error) {
        console.error('Error checking vehicle availability:', error);
        return true; // Default to available if check fails
      }

      console.log('Availability check result:', data);
      return data === true;
    } catch (error) {
      console.error('Error in availability check:', error);
      return true; // Default to available if check fails
    } finally {
      setIsChecking(false);
    }
  }, []); // Empty dependency array since the function doesn't depend on any external values

  return {
    checkAvailability,
    isChecking
  };
};
