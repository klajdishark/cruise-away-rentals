
-- Make the email field nullable in the customers table
ALTER TABLE public.customers 
ALTER COLUMN email DROP NOT NULL;

-- Also remove the unique constraint on email since it can now be null
-- and we might have multiple customers with null emails
ALTER TABLE public.customers 
DROP CONSTRAINT IF EXISTS customers_email_key;
