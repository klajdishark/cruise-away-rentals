
-- Create vehicle_categories table
CREATE TABLE public.vehicle_categories (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL UNIQUE,
  description text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Add category_id column to vehicles table
ALTER TABLE public.vehicles 
ADD COLUMN category_id uuid REFERENCES public.vehicle_categories(id);

-- Enable RLS on vehicle_categories table
ALTER TABLE public.vehicle_categories ENABLE ROW LEVEL SECURITY;

-- Create policies for vehicle_categories (only admins can manage)
CREATE POLICY "Admins can manage vehicle categories" 
  ON public.vehicle_categories 
  FOR ALL 
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Allow everyone to view categories (for public vehicle browsing)
CREATE POLICY "Anyone can view vehicle categories" 
  ON public.vehicle_categories 
  FOR SELECT 
  USING (true);

-- Insert default categories
INSERT INTO public.vehicle_categories (name, description) VALUES
('Economy', 'Budget-friendly compact cars'),
('SUV', 'Sport Utility Vehicles with spacious interiors'),
('Luxury', 'Premium vehicles with high-end features'),
('Electric', 'Eco-friendly electric vehicles'),
('Hybrid', 'Fuel-efficient hybrid vehicles'),
('Truck', 'Pickup trucks and commercial vehicles'),
('Van', 'Multi-passenger vans and cargo vehicles');

-- Create trigger to update updated_at column for categories
CREATE TRIGGER update_vehicle_categories_updated_at 
  BEFORE UPDATE ON public.vehicle_categories 
  FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
