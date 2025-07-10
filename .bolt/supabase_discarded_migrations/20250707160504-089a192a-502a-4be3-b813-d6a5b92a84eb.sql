
-- Check what the actual constraint allows
SELECT conname, consrc 
FROM pg_constraint 
JOIN pg_class ON conrelid = pg_class.oid 
WHERE pg_class.relname = 'booking_forms' AND contype = 'c';

-- If there's a constraint limiting form_type values, let's see what's currently allowed
-- and potentially update it to allow 'delivery' and 'pickup' values
SELECT column_name, data_type, column_default, is_nullable
FROM information_schema.columns 
WHERE table_name = 'booking_forms' AND column_name = 'form_type';
