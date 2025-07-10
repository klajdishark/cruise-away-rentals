
-- Update the check_vehicle_availability function to be truly read-only
CREATE OR REPLACE FUNCTION public.check_vehicle_availability(
  p_vehicle_id uuid, 
  p_start_date date, 
  p_end_date date, 
  p_exclude_booking_id uuid DEFAULT NULL
)
RETURNS boolean
LANGUAGE plpgsql
STABLE
AS $function$
BEGIN
  -- Check if vehicle has any overlapping bookings
  -- We'll check for unexpired pending bookings instead of trying to update them
  RETURN NOT EXISTS (
    SELECT 1 
    FROM public.bookings 
    WHERE vehicle_id = p_vehicle_id
      AND status IN ('pending', 'confirmed', 'active')
      AND (p_exclude_booking_id IS NULL OR id != p_exclude_booking_id)
      AND (
        -- For pending bookings, only consider them if they haven't expired
        (status = 'pending' AND (pending_expires_at IS NULL OR pending_expires_at > now()))
        OR status IN ('confirmed', 'active')
      )
      AND (
        (start_date <= p_end_date AND end_date >= p_start_date)
      )
  );
END;
$function$
