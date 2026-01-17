-- Enable pgcrypto for encryption if needed
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Profiles Table (Pro/Orga/Moover)
-- Primary Key is BIGINT for scalability (INT64), linked to auth.users via uuid_ref
CREATE TABLE public.profiles (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID REFERENCES auth.users ON DELETE CASCADE UNIQUE,
    email TEXT,
    full_name TEXT,
    first_name TEXT,
    last_name TEXT,
    pseudo TEXT,
    avatar_url TEXT,
    role TEXT DEFAULT 'athlete' CHECK (role IN ('athlete', 'pro')),
    -- MoovooW State Machine for Profiles
    status TEXT DEFAULT 'PENDING_DOCS' CHECK (status IN ('PENDING_DOCS', 'UNDER_REVIEW', 'ACTIVE', 'SUSPENDED_BILLING', 'INACTIVE')),
    onboarded BOOLEAN DEFAULT FALSE,
    profile_data JSONB DEFAULT '{}'::jsonb,
    current_plan TEXT DEFAULT 'free', -- 'free', 'starter', 'pro', 'elite'
    billing_day INTEGER DEFAULT 1,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for auth lookup
CREATE INDEX idx_profiles_user_id ON public.profiles(user_id);

-- Index for username/pseudo lookups
CREATE INDEX idx_profiles_pseudo ON public.profiles(pseudo);

-- Index for avatar URLs (partial index for non-null values)
CREATE INDEX idx_profiles_avatar_url ON public.profiles(avatar_url) WHERE avatar_url IS NOT NULL;

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = user_id);

-- Moovs Table (Events)
CREATE TABLE public.moovs (
    id BIGSERIAL PRIMARY KEY,
    pro_id BIGINT REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    status TEXT DEFAULT 'DRAFT' CHECK (status IN ('DRAFT', 'PUBLISHED', 'CANCELLED', 'COMPLETED')),
    price_cents INTEGER DEFAULT 0,
    start_at TIMESTAMPTZ,
    end_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Moovs RLS
ALTER TABLE public.moovs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view published moovs" ON public.moovs
    FOR SELECT USING (status = 'PUBLISHED');

CREATE POLICY "Coaches can manage their own moovs" ON public.moovs
    FOR ALL USING (
        pro_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid() AND role = 'pro')
    );

-- Participants Table (MoovooW State Machine)
CREATE TABLE public.participants (
    id BIGSERIAL PRIMARY KEY,
    moov_id BIGINT REFERENCES public.moovs(id) ON DELETE CASCADE,
    profile_id BIGINT REFERENCES public.profiles(id) ON DELETE CASCADE,
    -- Participant State Machine
    status TEXT DEFAULT 'RESERVED' CHECK (status IN ('RESERVED', 'HONORED', 'NO_SHOW', 'VALIDATED_BILLABLE')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(moov_id, profile_id)
);

-- Participants RLS
ALTER TABLE public.participants ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own participations" ON public.participants
    FOR SELECT USING (
        profile_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid())
    );

CREATE POLICY "Coaches can view participants for their moovs" ON public.participants
    FOR SELECT USING (
        moov_id IN (SELECT id FROM public.moovs WHERE pro_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()))
    );

CREATE POLICY "Users can join published moovs" ON public.participants
    FOR INSERT WITH CHECK (
        moov_id IN (SELECT id FROM public.moovs WHERE status = 'PUBLISHED')
        AND profile_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid())
    );

-- Health Data (Encrypted storage layer)
CREATE TABLE public.health_data (
    id BIGSERIAL PRIMARY KEY,
    profile_id BIGINT REFERENCES public.profiles(id) ON DELETE CASCADE,
    data_type TEXT,
    encrypted_payload TEXT, -- Chiffré au repos via app logic ou pgcrypto
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Health Data RLS
ALTER TABLE public.health_data ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own health data" ON public.health_data
    FOR ALL USING (
        profile_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid())
    );

-- Invoices Table (Billing system)
CREATE TABLE public.invoices (
    id BIGSERIAL PRIMARY KEY,
    profile_id BIGINT REFERENCES public.profiles(id) ON DELETE CASCADE,
    amount_cents INTEGER NOT NULL,
    status TEXT DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'PAID', 'FAILED')),
    pdf_url TEXT,
    issued_at TIMESTAMPTZ DEFAULT NOW(),
    paid_at TIMESTAMPTZ
);

-- Invoices RLS
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own invoices" ON public.invoices
    FOR SELECT USING (
        profile_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid())
    );

-- Index for invoice lookups
CREATE INDEX idx_invoices_profile_id ON public.invoices(profile_id);

-- Logic: Automatically create a profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (user_id, email, full_name, status)
    VALUES (new.id, new.email, new.raw_user_meta_data->>'full_name', 'PENDING_DOCS');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
