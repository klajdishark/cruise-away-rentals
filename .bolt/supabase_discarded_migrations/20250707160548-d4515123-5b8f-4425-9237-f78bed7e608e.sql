
-- First, let's see what the current constraint allows
SELECT pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint 
WHERE conname = 'booking_forms_form_type_check';

-- If the constraint exists but doesn't allow 'delivery', we need to update it
-- Let's drop the existing constraint and create a new one that allows both 'pickup' and 'delivery'
ALTER TABLE public.booking_forms DROP CONSTRAINT IF EXISTS booking_forms_form_type_check;

-- Add the correct constraint that allows both pickup and delivery forms
ALTER TABLE public.booking_forms 
ADD CONSTRAINT booking_forms_form_type_check 
CHECK (form_type IN ('pickup', 'delivery'));
