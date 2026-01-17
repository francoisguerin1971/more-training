-- ============================================
-- More Training - Extended Schema
-- ============================================

-- Training Plans Table
CREATE TABLE public.training_plans (
    id BIGSERIAL PRIMARY KEY,
    coach_id BIGINT REFERENCES public.profiles(id) ON DELETE CASCADE,
    athlete_id BIGINT REFERENCES public.profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    sport TEXT,
    start_date DATE,
    end_date DATE,
    status TEXT DEFAULT 'DRAFT' CHECK (status IN ('DRAFT', 'ACTIVE', 'COMPLETED', 'CANCELLED')),
    plan_data JSONB DEFAULT '{}'::jsonb, -- Stores periodization, phases, etc.
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_training_plans_coach ON public.training_plans(coach_id);
CREATE INDEX idx_training_plans_athlete ON public.training_plans(athlete_id);

ALTER TABLE public.training_plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Coaches can manage their own plans" ON public.training_plans
    FOR ALL USING (
        coach_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid())
    );

CREATE POLICY "Athletes can view their assigned plans" ON public.training_plans
    FOR SELECT USING (
        athlete_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid())
    );

-- ============================================
-- Training Sessions Table
-- ============================================
CREATE TABLE public.training_sessions (
    id BIGSERIAL PRIMARY KEY,
    plan_id BIGINT REFERENCES public.training_plans(id) ON DELETE CASCADE,
    athlete_id BIGINT REFERENCES public.profiles(id) ON DELETE CASCADE,
    scheduled_date DATE NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    session_type TEXT, -- 'workout', 'recovery', 'test', etc.
    planned_load INTEGER, -- Foster RPE * Duration
    actual_load INTEGER,
    duration_minutes INTEGER,
    status TEXT DEFAULT 'PLANNED' CHECK (status IN ('PLANNED', 'COMPLETED', 'SKIPPED', 'RESCHEDULED')),
    session_data JSONB DEFAULT '{}'::jsonb, -- Stores intervals, zones, feedback, etc.
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_sessions_plan ON public.training_sessions(plan_id);
CREATE INDEX idx_sessions_athlete ON public.training_sessions(athlete_id);
CREATE INDEX idx_sessions_date ON public.training_sessions(scheduled_date);

ALTER TABLE public.training_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Athletes can manage their own sessions" ON public.training_sessions
    FOR ALL USING (
        athlete_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid())
    );

CREATE POLICY "Coaches can view sessions for their athletes" ON public.training_sessions
    FOR SELECT USING (
        athlete_id IN (
            SELECT athlete_id FROM public.coach_athlete_relationships 
            WHERE coach_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid())
        )
    );

-- ============================================
-- Coach-Athlete Relationships Table
-- ============================================
CREATE TABLE public.coach_athlete_relationships (
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

CREATE INDEX idx_relationships_coach ON public.coach_athlete_relationships(coach_id);
CREATE INDEX idx_relationships_athlete ON public.coach_athlete_relationships(athlete_id);

ALTER TABLE public.coach_athlete_relationships ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Coaches can manage their relationships" ON public.coach_athlete_relationships
    FOR ALL USING (
        coach_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid())
    );

CREATE POLICY "Athletes can view their relationships" ON public.coach_athlete_relationships
    FOR SELECT USING (
        athlete_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid())
    );

-- ============================================
-- Subscriptions Table (MoovooW Model)
-- ============================================
CREATE TABLE public.subscriptions (
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

CREATE INDEX idx_subscriptions_relationship ON public.subscriptions(relationship_id);
CREATE INDEX idx_subscriptions_stripe ON public.subscriptions(stripe_subscription_id);

ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own subscriptions" ON public.subscriptions
    FOR SELECT USING (
        relationship_id IN (
            SELECT id FROM public.coach_athlete_relationships 
            WHERE coach_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid())
            OR athlete_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid())
        )
    );

-- ============================================
-- Payments Table (Stripe Connect)
-- ============================================
CREATE TABLE public.payments (
    id BIGSERIAL PRIMARY KEY,
    subscription_id BIGINT REFERENCES public.subscriptions(id) ON DELETE SET NULL,
    invoice_id BIGINT REFERENCES public.invoices(id) ON DELETE SET NULL,
    stripe_payment_intent_id TEXT UNIQUE,
    amount_cents INTEGER NOT NULL,
    currency TEXT DEFAULT 'EUR',
    status TEXT DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'SUCCEEDED', 'FAILED', 'REFUNDED')),
    payment_method TEXT, -- 'card', 'sepa_debit', etc.
    stripe_fee_cents INTEGER, -- Stripe's fee
    platform_fee_cents INTEGER DEFAULT 0, -- More Training fee (0% for MoovooW)
    coach_payout_cents INTEGER, -- Amount to coach
    paid_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_payments_subscription ON public.payments(subscription_id);
CREATE INDEX idx_payments_invoice ON public.payments(invoice_id);
CREATE INDEX idx_payments_stripe ON public.payments(stripe_payment_intent_id);

ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Coaches can view payments for their subscriptions" ON public.payments
    FOR SELECT USING (
        subscription_id IN (
            SELECT s.id FROM public.subscriptions s
            JOIN public.coach_athlete_relationships r ON s.relationship_id = r.id
            WHERE r.coach_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid())
        )
    );

CREATE POLICY "Athletes can view their own payments" ON public.payments
    FOR SELECT USING (
        subscription_id IN (
            SELECT s.id FROM public.subscriptions s
            JOIN public.coach_athlete_relationships r ON s.relationship_id = r.id
            WHERE r.athlete_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid())
        )
    );

-- ============================================
-- Coach Offerings Table (Pricing Plans)
-- ============================================
CREATE TABLE public.coach_offerings (
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

CREATE INDEX idx_offerings_coach ON public.coach_offerings(coach_id);

ALTER TABLE public.coach_offerings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active offerings" ON public.coach_offerings
    FOR SELECT USING (is_active = TRUE);

CREATE POLICY "Coaches can manage their own offerings" ON public.coach_offerings
    FOR ALL USING (
        coach_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid())
    );

-- ============================================
-- Update Invoices Table (Add seller_id)
-- ============================================
ALTER TABLE public.invoices 
ADD COLUMN IF NOT EXISTS seller_id BIGINT REFERENCES public.profiles(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS buyer_id BIGINT REFERENCES public.profiles(id) ON DELETE CASCADE,
ADD COLUMN IF NOT EXISTS invoice_number TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS line_items JSONB DEFAULT '[]'::jsonb;

-- Update RLS for invoices
DROP POLICY IF EXISTS "Users can view their own invoices" ON public.invoices;

CREATE POLICY "Users can view invoices they bought or sold" ON public.invoices
    FOR SELECT USING (
        buyer_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid())
        OR seller_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid())
    );

CREATE POLICY "Coaches can create invoices for their services" ON public.invoices
    FOR INSERT WITH CHECK (
        seller_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid() AND role = 'pro')
    );

-- ============================================
-- Triggers for updated_at
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_training_plans_updated_at BEFORE UPDATE ON public.training_plans
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_relationships_updated_at BEFORE UPDATE ON public.coach_athlete_relationships
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_subscriptions_updated_at BEFORE UPDATE ON public.subscriptions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_offerings_updated_at BEFORE UPDATE ON public.coach_offerings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
