
-- Add a trigger to automatically create pickup and delivery forms when a booking is confirmed
CREATE OR REPLACE FUNCTION create_booking_forms()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  -- Create pickup form when booking is confirmed
  IF NEW.status = 'confirmed' AND OLD.status != 'confirmed' THEN
    INSERT INTO public.booking_forms (booking_id, form_type)
    VALUES (NEW.id, 'pickup');
  END IF;
  
  -- Create delivery form when booking is completed
  IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
    INSERT INTO public.booking_forms (booking_id, form_type)
    VALUES (NEW.id, 'delivery');
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create the trigger
DROP TRIGGER IF EXISTS booking_forms_trigger ON public.bookings;
CREATE TRIGGER booking_forms_trigger
  AFTER UPDATE ON public.bookings
  FOR EACH ROW
  EXECUTE FUNCTION create_booking_forms();

-- Update any existing completed bookings that don't have delivery forms
INSERT INTO public.booking_forms (booking_id, form_type)
SELECT id, 'delivery'
FROM public.bookings 
WHERE status = 'completed' 
AND id NOT IN (
  SELECT booking_id 
  FROM public.booking_forms 
  WHERE form_type = 'delivery'
);
