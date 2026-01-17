-- ============================================
-- More Training - Appointments & Invitations
-- ============================================

-- Appointments Table
CREATE TABLE IF NOT EXISTS public.appointments (
    id BIGSERIAL PRIMARY KEY,
    coach_id BIGINT REFERENCES public.profiles(id) ON DELETE CASCADE,
    athlete_id BIGINT REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    start_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ NOT NULL,
    meeting_link TEXT,
    status TEXT DEFAULT 'SCHEDULED' CHECK (status IN ('SCHEDULED', 'CANCELLED', 'COMPLETED')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Invitations Table
CREATE TABLE IF NOT EXISTS public.invitations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    coach_id BIGINT REFERENCES public.profiles(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    name TEXT,
    sport TEXT,
    suggested_plan TEXT,
    status TEXT DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'ACCEPTED', 'EXPIRED')),
    expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '7 days'),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invitations ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view their own appointments" ON public.appointments
    FOR SELECT USING (
        coach_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()) OR
        athlete_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid())
    );

CREATE POLICY "Coaches can manage their own appointments" ON public.appointments
    FOR ALL USING (coach_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()));

CREATE POLICY "Coaches can manage their invitations" ON public.invitations
    FOR ALL USING (coach_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()));

-- Indexing
CREATE INDEX IF NOT EXISTS idx_appointments_coach ON public.appointments(coach_id);
CREATE INDEX IF NOT EXISTS idx_appointments_athlete ON public.appointments(athlete_id);
CREATE INDEX IF NOT EXISTS idx_invitations_coach ON public.invitations(coach_id);
CREATE INDEX IF NOT EXISTS idx_invitations_email ON public.invitations(email);
