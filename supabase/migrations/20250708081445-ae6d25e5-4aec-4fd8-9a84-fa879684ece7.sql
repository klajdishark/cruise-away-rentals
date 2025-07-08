
-- Create contract templates table
CREATE TABLE public.contract_templates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  template_content TEXT NOT NULL,
  variables JSONB DEFAULT '{}',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create contracts table
CREATE TABLE public.contracts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  booking_id UUID NOT NULL REFERENCES public.bookings(id) ON DELETE CASCADE,
  template_id UUID REFERENCES public.contract_templates(id),
  contract_number TEXT NOT NULL UNIQUE,
  content TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'pending_signature', 'signed', 'cancelled')),
  version INTEGER NOT NULL DEFAULT 1,
  pdf_url TEXT,
  customer_signature TEXT,
  customer_signed_at TIMESTAMP WITH TIME ZONE,
  admin_signature TEXT,
  admin_signed_at TIMESTAMP WITH TIME ZONE,
  signed_by UUID REFERENCES public.profiles(id),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create contract versions table for version history
CREATE TABLE public.contract_versions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  contract_id UUID NOT NULL REFERENCES public.contracts(id) ON DELETE CASCADE,
  version INTEGER NOT NULL,
  content TEXT NOT NULL,
  changes_summary TEXT,
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add RLS policies for contract_templates
ALTER TABLE public.contract_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage contract templates" 
  ON public.contract_templates 
  FOR ALL 
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Add RLS policies for contracts
ALTER TABLE public.contracts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage all contracts" 
  ON public.contracts 
  FOR ALL 
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Customers can view their own contracts" 
  ON public.contracts 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.bookings b 
      JOIN public.customers c ON c.id = b.customer_id 
      WHERE b.id = contracts.booking_id AND c.profile_id = auth.uid()
    )
  );

-- Add RLS policies for contract_versions
ALTER TABLE public.contract_versions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage contract versions" 
  ON public.contract_versions 
  FOR ALL 
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Customers can view their contract versions" 
  ON public.contract_versions 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.contracts c
      JOIN public.bookings b ON b.id = c.booking_id
      JOIN public.customers cust ON cust.id = b.customer_id
      WHERE c.id = contract_versions.contract_id AND cust.profile_id = auth.uid()
    )
  );

-- Add triggers for updated_at columns
CREATE TRIGGER update_contract_templates_updated_at
  BEFORE UPDATE ON public.contract_templates
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_contracts_updated_at
  BEFORE UPDATE ON public.contracts
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Function to generate contract number
CREATE OR REPLACE FUNCTION public.generate_contract_number()
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
  contract_number TEXT;
  year_suffix TEXT;
BEGIN
  year_suffix := EXTRACT(YEAR FROM now())::TEXT;
  
  SELECT 'CNT-' || year_suffix || '-' || LPAD((COUNT(*) + 1)::TEXT, 4, '0')
  INTO contract_number
  FROM public.contracts
  WHERE EXTRACT(YEAR FROM created_at) = EXTRACT(YEAR FROM now());
  
  RETURN contract_number;
END;
$$;

-- Function to create contract version
CREATE OR REPLACE FUNCTION public.create_contract_version()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  -- Only create version if content has changed
  IF OLD.content IS DISTINCT FROM NEW.content THEN
    INSERT INTO public.contract_versions (
      contract_id, 
      version, 
      content, 
      changes_summary,
      created_by
    ) VALUES (
      NEW.id, 
      NEW.version, 
      NEW.content, 
      'Content updated',
      auth.uid()
    );
  END IF;
  
  RETURN NEW;
END;
$$;

-- Add trigger to create contract versions
CREATE TRIGGER create_contract_version_trigger
  AFTER UPDATE ON public.contracts
  FOR EACH ROW EXECUTE FUNCTION public.create_contract_version();

-- Insert default contract template
INSERT INTO public.contract_templates (name, description, template_content, variables) VALUES 
(
  'Standard Vehicle Rental Agreement',
  'Default template for vehicle rental contracts',
  '<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: Arial, sans-serif; margin: 40px; }
        .header { text-align: center; margin-bottom: 30px; }
        .section { margin-bottom: 20px; }
        .signature { margin-top: 40px; border-top: 1px solid #000; padding-top: 10px; }
    </style>
</head>
<body>
    <div class="header">
        <h1>VEHICLE RENTAL AGREEMENT</h1>
        <p>Contract Number: {{contract_number}}</p>
        <p>Date: {{contract_date}}</p>
    </div>
    
    <div class="section">
        <h3>CUSTOMER INFORMATION</h3>
        <p><strong>Name:</strong> {{customer_name}}</p>
        <p><strong>Email:</strong> {{customer_email}}</p>
        <p><strong>Phone:</strong> {{customer_phone}}</p>
        <p><strong>License Number:</strong> {{customer_license}}</p>
    </div>
    
    <div class="section">
        <h3>VEHICLE INFORMATION</h3>
        <p><strong>Vehicle:</strong> {{vehicle_brand}} {{vehicle_model}} {{vehicle_year}}</p>
        <p><strong>License Plate:</strong> {{vehicle_license_plate}}</p>
        <p><strong>Color:</strong> {{vehicle_color}}</p>
    </div>
    
    <div class="section">
        <h3>RENTAL DETAILS</h3>
        <p><strong>Pickup Date:</strong> {{pickup_date}}</p>
        <p><strong>Return Date:</strong> {{return_date}}</p>
        <p><strong>Pickup Location:</strong> {{pickup_location}}</p>
        <p><strong>Return Location:</strong> {{return_location}}</p>
        <p><strong>Duration:</strong> {{duration_days}} days</p>
        <p><strong>Daily Rate:</strong> ${{daily_rate}}</p>
        <p><strong>Total Amount:</strong> ${{total_amount}}</p>
    </div>
    
    <div class="section">
        <h3>TERMS AND CONDITIONS</h3>
        <p>1. The renter agrees to return the vehicle in the same condition as received.</p>
        <p>2. The renter is responsible for all damages, traffic violations, and parking tickets.</p>
        <p>3. The vehicle must be returned with the same fuel level as at pickup.</p>
        <p>4. Late returns will incur additional charges.</p>
        <p>5. The renter must be at least 21 years old with a valid driver''s license.</p>
    </div>
    
    <div class="signature">
        <p><strong>Customer Signature:</strong> ___________________________ Date: ___________</p>
        <br>
        <p><strong>Company Representative:</strong> ___________________________ Date: ___________</p>
    </div>
</body>
</html>',
  '{
    "contract_number": "Contract identification number",
    "contract_date": "Date when contract is created",
    "customer_name": "Customer full name",
    "customer_email": "Customer email address",
    "customer_phone": "Customer phone number",
    "customer_license": "Customer license number",
    "vehicle_brand": "Vehicle brand/make",
    "vehicle_model": "Vehicle model",
    "vehicle_year": "Vehicle year",
    "vehicle_license_plate": "Vehicle license plate",
    "vehicle_color": "Vehicle color",
    "pickup_date": "Rental start date",
    "return_date": "Rental end date",
    "pickup_location": "Pickup location",
    "return_location": "Return/dropoff location",
    "duration_days": "Number of rental days",
    "daily_rate": "Daily rental rate",
    "total_amount": "Total rental amount"
  }'::jsonb
);
