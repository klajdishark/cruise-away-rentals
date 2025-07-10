
-- Check the constraint on booking_forms table to see what values are allowed for form_type
SELECT constraint_name, check_clause 
FROM information_schema.check_constraints 
WHERE constraint_name = 'booking_forms_form_type_check';

-- Also check what values currently exist in the form_type column
SELECT DISTINCT form_type FROM public.booking_forms;

-- Let's also see the table definition to understand the constraint better
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'booking_forms' 
AND table_schema = 'public'
ORDER BY ordinal_position;
