-- ============================================
-- More Training - Technical Assessments
-- ============================================

CREATE TABLE IF NOT EXISTS public.technical_assessments (
    id BIGSERIAL PRIMARY KEY,
    coach_id BIGINT REFERENCES public.profiles(id) ON DELETE CASCADE,
    athlete_id BIGINT REFERENCES public.profiles(id) ON DELETE CASCADE,
    form_status TEXT NOT NULL,
    fatigue INTEGER NOT NULL,
    motivation INTEGER NOT NULL,
    focus TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.technical_assessments ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Coaches can manage their assessments" ON public.technical_assessments
    FOR ALL USING (coach_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()));

CREATE POLICY "Athletes can view their own assessments" ON public.technical_assessments
    FOR SELECT USING (athlete_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()));

-- Indexing
CREATE INDEX IF NOT EXISTS idx_tech_coach ON public.technical_assessments(coach_id);
CREATE INDEX IF NOT EXISTS idx_tech_athlete ON public.technical_assessments(athlete_id);
