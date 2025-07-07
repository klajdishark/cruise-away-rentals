
-- Create customers table with simplified structure
CREATE TABLE public.customers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  profile_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  phone TEXT NOT NULL,
  date_of_birth DATE,
  license_number TEXT NOT NULL,
  license_expiry DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'flagged', 'suspended')),
  license_status TEXT NOT NULL DEFAULT 'pending' CHECK (license_status IN ('verified', 'pending', 'rejected')),
  total_bookings INTEGER NOT NULL DEFAULT 0,
  total_spent DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create customer_documents table for document management
CREATE TABLE public.customer_documents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_id UUID NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
  document_type TEXT NOT NULL,
  document_name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_size INTEGER,
  mime_type TEXT,
  uploaded_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add is_suspended field to profiles table
ALTER TABLE public.profiles 
ADD COLUMN is_suspended BOOLEAN NOT NULL DEFAULT false;

-- Create storage bucket for customer documents
INSERT INTO storage.buckets (id, name, public) 
VALUES ('customer-documents', 'customer-documents', false);

-- Enable RLS on customers table
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for customers table
CREATE POLICY "Admins can manage all customers" 
  ON public.customers 
  FOR ALL 
  USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can view their own customer record" 
  ON public.customers 
  FOR SELECT 
  USING (profile_id = auth.uid());

-- Enable RLS on customer_documents table
ALTER TABLE public.customer_documents ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for customer_documents table
CREATE POLICY "Admins can manage all customer documents" 
  ON public.customer_documents 
  FOR ALL 
  USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can view their own documents" 
  ON public.customer_documents 
  FOR SELECT 
  USING (EXISTS (
    SELECT 1 FROM public.customers 
    WHERE customers.id = customer_documents.customer_id 
    AND customers.profile_id = auth.uid()
  ));

-- Create storage policies for customer documents bucket
CREATE POLICY "Admins can upload customer documents" 
  ON storage.objects 
  FOR INSERT 
  WITH CHECK (
    bucket_id = 'customer-documents' 
    AND has_role(auth.uid(), 'admin')
  );

CREATE POLICY "Admins can view customer documents" 
  ON storage.objects 
  FOR SELECT 
  USING (
    bucket_id = 'customer-documents' 
    AND has_role(auth.uid(), 'admin')
  );

CREATE POLICY "Admins can delete customer documents" 
  ON storage.objects 
  FOR DELETE 
  USING (
    bucket_id = 'customer-documents' 
    AND has_role(auth.uid(), 'admin')
  );

-- Create trigger to update updated_at column
CREATE TRIGGER update_customers_updated_at
  BEFORE UPDATE ON public.customers
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX idx_customers_email ON public.customers(email);
CREATE INDEX idx_customers_status ON public.customers(status);
CREATE INDEX idx_customers_profile_id ON public.customers(profile_id);
CREATE INDEX idx_customer_documents_customer_id ON public.customer_documents(customer_id);
