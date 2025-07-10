
-- Create enum types for vehicle properties
CREATE TYPE public.vehicle_status AS ENUM ('active', 'rented', 'maintenance', 'inactive');
CREATE TYPE public.fuel_type AS ENUM ('gasoline', 'diesel', 'electric', 'hybrid');
CREATE TYPE public.transmission_type AS ENUM ('manual', 'automatic');

-- Create vehicles table
CREATE TABLE public.vehicles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  brand TEXT NOT NULL,
  model TEXT NOT NULL,
  year INTEGER NOT NULL CHECK (year >= 1900 AND year <= EXTRACT(YEAR FROM CURRENT_DATE) + 1),
  price DECIMAL(10,2) NOT NULL CHECK (price > 0),
  location TEXT NOT NULL,
  mileage INTEGER NOT NULL DEFAULT 0 CHECK (mileage >= 0),
  status vehicle_status NOT NULL DEFAULT 'active',
  description TEXT,
  fuel_type fuel_type NOT NULL DEFAULT 'gasoline',
  transmission transmission_type NOT NULL DEFAULT 'automatic',
  seats INTEGER NOT NULL CHECK (seats >= 1 AND seats <= 15),
  color TEXT NOT NULL,
  license_plate TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create vehicle_images table for storing multiple images per vehicle
CREATE TABLE public.vehicle_images (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  vehicle_id UUID NOT NULL REFERENCES public.vehicles(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create storage bucket for vehicle images
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'vehicle-images', 
  'vehicle-images', 
  true, 
  5242880, -- 5MB limit
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
);

-- Enable RLS on vehicles table
ALTER TABLE public.vehicles ENABLE ROW LEVEL SECURITY;

-- Enable RLS on vehicle_images table
ALTER TABLE public.vehicle_images ENABLE ROW LEVEL SECURITY;

-- Create policies for vehicles table
-- Allow everyone to view active vehicles (for public car browsing)
CREATE POLICY "Anyone can view active vehicles" 
  ON public.vehicles 
  FOR SELECT 
  USING (status = 'active');

-- Allow admins to view all vehicles
CREATE POLICY "Admins can view all vehicles" 
  ON public.vehicles 
  FOR SELECT 
  USING (public.has_role(auth.uid(), 'admin'));

-- Allow admins to insert vehicles
CREATE POLICY "Admins can insert vehicles" 
  ON public.vehicles 
  FOR INSERT 
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Allow admins to update vehicles
CREATE POLICY "Admins can update vehicles" 
  ON public.vehicles 
  FOR UPDATE 
  USING (public.has_role(auth.uid(), 'admin'));

-- Allow admins to delete vehicles
CREATE POLICY "Admins can delete vehicles" 
  ON public.vehicles 
  FOR DELETE 
  USING (public.has_role(auth.uid(), 'admin'));

-- Create policies for vehicle_images table
-- Allow everyone to view images of active vehicles
CREATE POLICY "Anyone can view vehicle images" 
  ON public.vehicle_images 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.vehicles 
      WHERE vehicles.id = vehicle_images.vehicle_id 
      AND (vehicles.status = 'active' OR public.has_role(auth.uid(), 'admin'))
    )
  );

-- Allow admins to manage vehicle images
CREATE POLICY "Admins can manage vehicle images" 
  ON public.vehicle_images 
  FOR ALL 
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Create storage policies for vehicle images bucket
CREATE POLICY "Anyone can view vehicle images in storage"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'vehicle-images');

CREATE POLICY "Admins can upload vehicle images"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'vehicle-images' 
    AND public.has_role(auth.uid(), 'admin')
  );

CREATE POLICY "Admins can update vehicle images"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'vehicle-images' 
    AND public.has_role(auth.uid(), 'admin')
  );

CREATE POLICY "Admins can delete vehicle images"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'vehicle-images' 
    AND public.has_role(auth.uid(), 'admin')
  );

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_vehicles_updated_at 
  BEFORE UPDATE ON public.vehicles 
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX idx_vehicles_status ON public.vehicles(status);
CREATE INDEX idx_vehicles_location ON public.vehicles(location);
CREATE INDEX idx_vehicles_brand_model ON public.vehicles(brand, model);
CREATE INDEX idx_vehicle_images_vehicle_id ON public.vehicle_images(vehicle_id);
CREATE INDEX idx_vehicle_images_display_order ON public.vehicle_images(vehicle_id, display_order);
