
-- Create enum for booking status
CREATE TYPE public.booking_status AS ENUM ('pending', 'confirmed', 'active', 'completed', 'canceled');

-- Create bookings table
CREATE TABLE public.bookings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_id UUID NOT NULL REFERENCES public.customers(id) ON DELETE RESTRICT,
  vehicle_id UUID NOT NULL REFERENCES public.vehicles(id) ON DELETE RESTRICT,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  start_time TIME DEFAULT '09:00:00',
  end_time TIME DEFAULT '09:00:00',
  pickup_location TEXT NOT NULL,
  dropoff_location TEXT NOT NULL,
  total_amount DECIMAL(10,2) NOT NULL,
  daily_rate DECIMAL(10,2) NOT NULL,
  duration_days INTEGER NOT NULL,
  status public.booking_status NOT NULL DEFAULT 'pending',
  notes TEXT,
  booking_type TEXT NOT NULL DEFAULT 'online' CHECK (booking_type IN ('online', 'offline')),
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  pending_expires_at TIMESTAMP WITH TIME ZONE,
  
  -- Constraints
  CONSTRAINT bookings_date_check CHECK (end_date >= start_date),
  CONSTRAINT bookings_duration_check CHECK (duration_days > 0),
  CONSTRAINT bookings_amount_check CHECK (total_amount >= 0)
);

-- Create indexes for performance
CREATE INDEX idx_bookings_customer_id ON public.bookings(customer_id);
CREATE INDEX idx_bookings_vehicle_id ON public.bookings(vehicle_id);
CREATE INDEX idx_bookings_status ON public.bookings(status);
CREATE INDEX idx_bookings_dates ON public.bookings(start_date, end_date);
CREATE INDEX idx_bookings_pending_expires ON public.bookings(pending_expires_at) WHERE status = 'pending';

-- Create delivery/inspection forms table
CREATE TABLE public.booking_forms (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  booking_id UUID NOT NULL REFERENCES public.bookings(id) ON DELETE CASCADE,
  form_type TEXT NOT NULL CHECK (form_type IN ('pickup', 'return')),
  vehicle_condition JSONB,
  fuel_level INTEGER CHECK (fuel_level >= 0 AND fuel_level <= 100),
  mileage_reading INTEGER,
  damages JSONB,
  photos JSONB,
  inspector_notes TEXT,
  customer_signature TEXT,
  inspector_signature TEXT,
  completed_at TIMESTAMP WITH TIME ZONE,
  completed_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  -- Ensure only one form of each type per booking
  UNIQUE(booking_id, form_type)
);

-- Enable RLS on bookings table
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

-- RLS policies for bookings
CREATE POLICY "Admins can manage all bookings" 
  ON public.bookings 
  FOR ALL 
  USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Customers can view their own bookings" 
  ON public.bookings 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.customers 
      WHERE customers.id = bookings.customer_id 
      AND customers.profile_id = auth.uid()
    )
  );

CREATE POLICY "Customers can create their own bookings" 
  ON public.bookings 
  FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.customers 
      WHERE customers.id = bookings.customer_id 
      AND customers.profile_id = auth.uid()
    )
  );

-- Enable RLS on booking forms table
ALTER TABLE public.booking_forms ENABLE ROW LEVEL SECURITY;

-- RLS policies for booking forms
CREATE POLICY "Admins can manage all booking forms" 
  ON public.booking_forms 
  FOR ALL 
  USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Customers can view their own booking forms" 
  ON public.booking_forms 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.bookings b
      JOIN public.customers c ON c.id = b.customer_id
      WHERE b.id = booking_forms.booking_id 
      AND c.profile_id = auth.uid()
    )
  );

-- Create function to automatically cancel expired pending bookings
CREATE OR REPLACE FUNCTION public.cancel_expired_pending_bookings()
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE public.bookings 
  SET status = 'canceled',
      updated_at = now()
  WHERE status = 'pending' 
    AND pending_expires_at IS NOT NULL 
    AND pending_expires_at < now();
END;
$$;

-- Create function to check vehicle availability
CREATE OR REPLACE FUNCTION public.check_vehicle_availability(
  p_vehicle_id UUID,
  p_start_date DATE,
  p_end_date DATE,
  p_exclude_booking_id UUID DEFAULT NULL
)
RETURNS boolean
LANGUAGE plpgsql
STABLE
AS $$
BEGIN
  -- First cancel any expired pending bookings
  PERFORM public.cancel_expired_pending_bookings();
  
  -- Check if vehicle has any overlapping bookings
  RETURN NOT EXISTS (
    SELECT 1 
    FROM public.bookings 
    WHERE vehicle_id = p_vehicle_id
      AND status IN ('pending', 'confirmed', 'active')
      AND (p_exclude_booking_id IS NULL OR id != p_exclude_booking_id)
      AND (
        (start_date <= p_end_date AND end_date >= p_start_date)
      )
  );
END;
$$;

-- Create function to calculate booking total
CREATE OR REPLACE FUNCTION public.calculate_booking_total(
  p_daily_rate DECIMAL,
  p_start_date DATE,
  p_end_date DATE
)
RETURNS DECIMAL
LANGUAGE plpgsql
IMMUTABLE
AS $$
DECLARE
  days INTEGER;
BEGIN
  days := (p_end_date - p_start_date) + 1;
  RETURN p_daily_rate * days;
END;
$$;

-- Create trigger to update updated_at timestamp
CREATE TRIGGER bookings_updated_at_trigger
  BEFORE UPDATE ON public.bookings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Create trigger to set pending expiration time
CREATE OR REPLACE FUNCTION public.set_pending_expiration()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.status = 'pending' AND OLD.status IS DISTINCT FROM 'pending' THEN
    NEW.pending_expires_at = now() + INTERVAL '15 minutes';
  ELSIF NEW.status != 'pending' THEN
    NEW.pending_expires_at = NULL;
  END IF;
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER bookings_set_pending_expiration_trigger
  BEFORE INSERT OR UPDATE ON public.bookings
  FOR EACH ROW EXECUTE FUNCTION public.set_pending_expiration();
