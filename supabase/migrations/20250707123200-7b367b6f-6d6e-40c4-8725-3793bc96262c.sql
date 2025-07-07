
-- Add a column to track which image is the default for each vehicle
ALTER TABLE public.vehicle_images 
ADD COLUMN is_default BOOLEAN NOT NULL DEFAULT false;

-- Create a unique constraint to ensure only one default image per vehicle
CREATE UNIQUE INDEX idx_vehicle_images_unique_default 
ON public.vehicle_images (vehicle_id) 
WHERE is_default = true;

-- Create a function to automatically set the first image as default if no default exists
CREATE OR REPLACE FUNCTION public.ensure_default_vehicle_image()
RETURNS TRIGGER AS $$
BEGIN
  -- If this is an insert and no default image exists for this vehicle, make this one default
  IF TG_OP = 'INSERT' THEN
    IF NOT EXISTS (
      SELECT 1 FROM public.vehicle_images 
      WHERE vehicle_id = NEW.vehicle_id AND is_default = true
    ) THEN
      NEW.is_default = true;
    END IF;
  END IF;
  
  -- If updating to set as default, unset other defaults for this vehicle
  IF TG_OP = 'UPDATE' AND NEW.is_default = true AND OLD.is_default = false THEN
    UPDATE public.vehicle_images 
    SET is_default = false 
    WHERE vehicle_id = NEW.vehicle_id AND id != NEW.id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically manage default images
CREATE TRIGGER trigger_ensure_default_vehicle_image
  BEFORE INSERT OR UPDATE ON public.vehicle_images
  FOR EACH ROW
  EXECUTE FUNCTION public.ensure_default_vehicle_image();
