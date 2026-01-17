-- Add name fields to profiles table
-- Migration: Add first_name, last_name, and pseudo columns
-- Date: 2026-01-16

-- Add new columns
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS first_name TEXT,
ADD COLUMN IF NOT EXISTS last_name TEXT,
ADD COLUMN IF NOT EXISTS pseudo TEXT,
ADD COLUMN IF NOT EXISTS avatar_url TEXT;

-- Create indexes
-- Use hash index for pseudo (better for equality searches, no size limit)
CREATE INDEX IF NOT EXISTS idx_profiles_pseudo ON public.profiles USING hash(pseudo);


-- Migrate existing data from profile_data JSONB to new columns
UPDATE public.profiles
SET 
    first_name = profile_data->>'firstName',
    last_name = profile_data->>'lastName',
    pseudo = profile_data->>'pseudo',
    avatar_url = profile_data->>'avatar'
WHERE profile_data IS NOT NULL;


-- Optional: Update full_name from first_name + last_name if full_name is empty
UPDATE public.profiles
SET full_name = CONCAT(first_name, ' ', last_name)
WHERE full_name IS NULL 
  AND first_name IS NOT NULL 
  AND last_name IS NOT NULL;

-- Note: We keep the data in profile_data JSONB for backward compatibility
-- The application can gradually transition to using the new columns
