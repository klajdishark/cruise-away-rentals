
-- Create system_settings table to store global system configuration
CREATE TABLE public.system_settings (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  setting_key text NOT NULL UNIQUE,
  setting_value jsonb NOT NULL,
  description text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create locations table to store rental locations
CREATE TABLE public.locations (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  address text NOT NULL,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS on both tables
ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.locations ENABLE ROW LEVEL SECURITY;

-- Create policies for system_settings (only admins can manage)
CREATE POLICY "Admins can manage system settings" 
  ON public.system_settings 
  FOR ALL 
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Create policies for locations (only admins can manage)
CREATE POLICY "Admins can manage locations" 
  ON public.locations 
  FOR ALL 
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Insert default system settings
INSERT INTO public.system_settings (setting_key, setting_value, description) VALUES
('min_age', '21', 'Minimum age requirement for rentals'),
('max_mileage', '200', 'Daily mileage limit'),
('cancellation_hours', '24', 'Cancellation notice period in hours'),
('base_tax_rate', '8.5', 'Base tax rate percentage'),
('security_deposit', '200', 'Security deposit amount'),
('maintenance_mode', 'false', 'System maintenance mode status');

-- Insert default locations
INSERT INTO public.locations (name, address, status) VALUES
('Downtown Branch', '123 Main St, City Center', 'active'),
('Airport Location', '456 Airport Blvd, Terminal A', 'active'),
('Mall Branch', '789 Shopping Mall Dr', 'active'),
('University Campus', '321 University Ave', 'inactive');

-- Create trigger to update updated_at column
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_system_settings_updated_at 
  BEFORE UPDATE ON public.system_settings 
  FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_locations_updated_at 
  BEFORE UPDATE ON public.locations 
  FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
