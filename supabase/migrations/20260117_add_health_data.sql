-- ============================================
-- More Training - Health data
-- ============================================

CREATE TABLE IF NOT EXISTS public.health_data (
    id BIGSERIAL PRIMARY KEY,
    athlete_id BIGINT REFERENCES public.profiles(id) ON DELETE CASCADE,
    type TEXT NOT NULL, -- 'hrv', 'sleep_score', 'fatigue', 'rhr'
    value FLOAT NOT NULL,
    recorded_at TIMESTAMPTZ DEFAULT NOW(),
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.health_data ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Athletes manage their own health data" ON public.health_data
    FOR ALL USING (athlete_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()));

CREATE POLICY "Coaches view athlete health data" ON public.health_data
    FOR SELECT USING (
        athlete_id IN (
            SELECT athlete_id FROM public.coach_athlete_relationships 
            WHERE coach_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid())
        )
    );

-- Indexing
CREATE INDEX IF NOT EXISTS idx_health_athlete ON public.health_data(athlete_id);
CREATE INDEX IF NOT EXISTS idx_health_recorded ON public.health_data(recorded_at);
