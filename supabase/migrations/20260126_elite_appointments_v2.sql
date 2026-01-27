-- ============================================
-- More Training - Appointments Enhancements
-- ============================================

-- Add notification and monetization settings to coach_appointment_settings
ALTER TABLE public.coach_appointment_settings
ADD COLUMN IF NOT EXISTS confirmation_email BOOLEAN DEFAULT TRUE,
ADD COLUMN IF NOT EXISTS confirmation_sms BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS is_external_booking_enabled BOOLEAN DEFAULT FALSE; -- Paid feature for the coach

-- Add tracking for cancellations and billing to appointments
ALTER TABLE public.appointments
ADD COLUMN IF NOT EXISTS cancelled_by TEXT, -- 'coach', 'athlete', 'external'
ADD COLUMN IF NOT EXISTS cancellation_reason TEXT,
ADD COLUMN IF NOT EXISTS billing_status TEXT DEFAULT 'pending', -- 'pending', 'paid', 'included', 'failed'
ADD COLUMN IF NOT EXISTS amount_cents INTEGER,
ADD COLUMN IF NOT EXISTS currency TEXT DEFAULT 'EUR';

-- Ensure updated_at trigger is applied if table existed
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_coach_appointment_settings_updated_at') THEN
        CREATE TRIGGER update_coach_appointment_settings_updated_at BEFORE UPDATE ON public.coach_appointment_settings
            FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
END $$;
