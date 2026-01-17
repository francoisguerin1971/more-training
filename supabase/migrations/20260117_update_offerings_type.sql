-- ============================================
-- More Training - Coach Offerings Enhancements
-- ============================================

-- Add type and limit constraints if needed
-- Actually, we can just enforce the count at the application level, 
-- but adding a 'type' column is necessary.

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'coach_offerings' AND COLUMN_NAME = 'type') THEN
        ALTER TABLE public.coach_offerings ADD COLUMN type TEXT DEFAULT 'PACKAGE' CHECK (type IN ('PACKAGE', 'HOURLY'));
    END IF;
END $$;

-- Update existing records to PACKAGE if they don't have a type
UPDATE public.coach_offerings SET type = 'PACKAGE' WHERE type IS NULL;
