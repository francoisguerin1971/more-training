-- ============================================
-- More Training - Elite Appointments Extension
-- ============================================

-- Coach Appointment Settings
CREATE TABLE IF NOT EXISTS public.coach_appointment_settings (
    coach_id BIGINT PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
    weekly_hours JSONB DEFAULT '{
        "mon": [{"start": "09:00", "end": "12:00"}, {"start": "14:00", "end": "18:00"}],
        "tue": [{"start": "09:00", "end": "12:00"}, {"start": "14:00", "end": "18:00"}],
        "wed": [{"start": "09:00", "end": "12:00"}, {"start": "14:00", "end": "18:00"}],
        "thu": [{"start": "09:00", "end": "12:00"}, {"start": "14:00", "end": "18:00"}],
        "fri": [{"start": "09:00", "end": "12:00"}, {"start": "14:00", "end": "18:00"}],
        "sat": [],
        "sun": []
    }'::jsonb,
    default_duration INTEGER DEFAULT 60, -- minutes
    buffer_time INTEGER DEFAULT 15, -- minutes
    is_public BOOLEAN DEFAULT TRUE,
    timezone TEXT DEFAULT 'Europe/Paris',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexing
CREATE INDEX IF NOT EXISTS idx_appointment_settings_coach ON public.coach_appointment_settings(coach_id);

-- Enable RLS
ALTER TABLE public.coach_appointment_settings ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Anyone can view coach settings" ON public.coach_appointment_settings
    FOR SELECT USING (TRUE);

CREATE POLICY "Coaches can manage their own settings" ON public.coach_appointment_settings
    FOR ALL USING (coach_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()));

-- Update Appointments Table
ALTER TABLE public.appointments 
ADD COLUMN IF NOT EXISTS client_name TEXT,
ADD COLUMN IF NOT EXISTS client_email TEXT,
ADD COLUMN IF NOT EXISTS client_phone TEXT,
ADD COLUMN IF NOT EXISTS appointment_type TEXT DEFAULT 'video', -- 'video', 'presencial', 'physio', 'other'
ADD COLUMN IF NOT EXISTS end_time_generated BOOLEAN DEFAULT FALSE; -- useful if we want to track manual vs auto end times

-- Add Trigger for updated_at on settings
CREATE TRIGGER update_coach_appointment_settings_updated_at BEFORE UPDATE ON public.coach_appointment_settings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
