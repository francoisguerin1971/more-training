-- Populate dedicated columns from profile_data JSONB if they are null
-- This ensures existing data is preserved during the transition to dedicated columns.

UPDATE public.profiles
SET 
  first_name = COALESCE(first_name, profile_data->>'firstName'),
  last_name = COALESCE(last_name, profile_data->>'lastName'),
  pseudo = COALESCE(pseudo, profile_data->>'pseudo')
WHERE 
  first_name IS NULL OR 
  last_name IS NULL OR 
  pseudo IS NULL;

-- Verification query:
-- SELECT id, email, first_name, last_name, pseudo FROM public.profiles LIMIT 5;
