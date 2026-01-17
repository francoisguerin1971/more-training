-- ============================================
-- More Training - Initialize Extended Schema
-- ============================================

-- Training Plans Table
CREATE TABLE IF NOT EXISTS public.training_plans (
    id BIGSERIAL PRIMARY KEY,
    coach_id BIGINT REFERENCES public.profiles(id) ON DELETE CASCADE,
    athlete_id BIGINT REFERENCES public.profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    sport TEXT,
    start_date DATE,
    end_date DATE,
    status TEXT DEFAULT 'DRAFT' CHECK (status IN ('DRAFT', 'ACTIVE', 'COMPLETED', 'CANCELLED')),
    plan_data JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Coach-Athlete Relationships Table
CREATE TABLE IF NOT EXISTS public.coach_athlete_relationships (
    id BIGSERIAL PRIMARY KEY,
    coach_id BIGINT REFERENCES public.profiles(id) ON DELETE CASCADE,
    athlete_id BIGINT REFERENCES public.profiles(id) ON DELETE CASCADE,
    status TEXT DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'ACTIVE', 'SUSPENDED', 'TERMINATED')),
    subscription_plan TEXT, -- 'basic', 'premium', 'elite'
    monthly_price_cents INTEGER,
    start_date DATE,
    end_date DATE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(coach_id, athlete_id)
);

-- Training Sessions Table
CREATE TABLE IF NOT EXISTS public.training_sessions (
    id BIGSERIAL PRIMARY KEY,
    plan_id BIGINT REFERENCES public.training_plans(id) ON DELETE CASCADE,
    athlete_id BIGINT REFERENCES public.profiles(id) ON DELETE CASCADE,
    scheduled_date DATE NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    session_type TEXT,
    planned_load INTEGER,
    actual_load INTEGER,
    duration_minutes INTEGER,
    status TEXT DEFAULT 'PLANNED' CHECK (status IN ('PLANNED', 'COMPLETED', 'SKIPPED', 'RESCHEDULED')),
    session_data JSONB DEFAULT '{}'::jsonb,
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Subscriptions Table
CREATE TABLE IF NOT EXISTS public.subscriptions (
    id BIGSERIAL PRIMARY KEY,
    relationship_id BIGINT REFERENCES public.coach_athlete_relationships(id) ON DELETE CASCADE,
    stripe_subscription_id TEXT UNIQUE,
    status TEXT DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'PAST_DUE', 'CANCELLED', 'UNPAID')),
    current_period_start TIMESTAMPTZ,
    current_period_end TIMESTAMPTZ,
    cancel_at_period_end BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Payments Table
CREATE TABLE IF NOT EXISTS public.payments (
    id BIGSERIAL PRIMARY KEY,
    subscription_id BIGINT REFERENCES public.subscriptions(id) ON DELETE SET NULL,
    stripe_payment_intent_id TEXT UNIQUE,
    amount_cents INTEGER NOT NULL,
    currency TEXT DEFAULT 'EUR',
    status TEXT DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'SUCCEEDED', 'FAILED', 'REFUNDED')),
    payment_method TEXT,
    stripe_fee_cents INTEGER,
    platform_fee_cents INTEGER DEFAULT 0,
    coach_payout_cents INTEGER,
    paid_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Coach Offerings Table
CREATE TABLE IF NOT EXISTS public.coach_offerings (
    id BIGSERIAL PRIMARY KEY,
    coach_id BIGINT REFERENCES public.profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    price_cents INTEGER NOT NULL,
    billing_interval TEXT DEFAULT 'MONTH' CHECK (billing_interval IN ('MONTH', 'YEAR')),
    features JSONB DEFAULT '[]'::jsonb,
    is_active BOOLEAN DEFAULT TRUE,
    is_recommended BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.training_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.training_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coach_athlete_relationships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coach_offerings ENABLE ROW LEVEL SECURITY;

-- Basic Policies (simplified for initialization)
CREATE POLICY "Coaches manage their plans" ON public.training_plans FOR ALL USING (coach_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()));
CREATE POLICY "Athletes view plans" ON public.training_plans FOR SELECT USING (athlete_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()));
CREATE POLICY "Coaches manage relationships" ON public.coach_athlete_relationships FOR ALL USING (coach_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()));
CREATE POLICY "Athletes view relationships" ON public.coach_athlete_relationships FOR SELECT USING (athlete_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()));

-- Indexing
CREATE INDEX IF NOT EXISTS idx_tp_coach ON public.training_plans(coach_id);
CREATE INDEX IF NOT EXISTS idx_tp_athlete ON public.training_plans(athlete_id);
CREATE INDEX IF NOT EXISTS idx_car_coach ON public.coach_athlete_relationships(coach_id);
CREATE INDEX IF NOT EXISTS idx_car_athlete ON public.coach_athlete_relationships(athlete_id);
