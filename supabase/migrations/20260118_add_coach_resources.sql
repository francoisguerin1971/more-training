-- ============================================
-- More Training - Coach Resources Library
-- ============================================

CREATE TABLE IF NOT EXISTS public.coach_resources (
    id BIGSERIAL PRIMARY KEY,
    coach_id BIGINT REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    type TEXT NOT NULL CHECK (type IN ('document', 'video', 'link')),
    content_url TEXT NOT NULL,
    is_public BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.coach_resources ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Coaches can manage their resources" ON public.coach_resources
    FOR ALL USING (coach_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()));

CREATE POLICY "Athletes can view shared resources" ON public.coach_resources
    FOR SELECT USING (
        is_public = TRUE AND 
        coach_id IN (
            SELECT coach_id FROM public.coach_athlete_relationships 
            WHERE athlete_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid())
            AND status = 'ACTIVE'
        )
    );

-- Indexing
CREATE INDEX IF NOT EXISTS idx_cr_coach ON public.coach_resources(coach_id);
