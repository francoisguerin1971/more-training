import pg from 'pg';
const { Client } = pg;

const connectionString = 'postgresql://postgres:5eiB6SOZlagu9c6Q@db.nnjjpczvmgoxupwfkluw.supabase.co:5432/postgres';

const sql = `
CREATE TABLE IF NOT EXISTS public.health_data (
    id BIGSERIAL PRIMARY KEY,
    athlete_id BIGINT REFERENCES public.profiles(id) ON DELETE CASCADE,
    type TEXT NOT NULL,
    value FLOAT NOT NULL,
    recorded_at TIMESTAMPTZ DEFAULT NOW(),
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.health_data ENABLE ROW LEVEL SECURITY;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Athletes manage their own health data') THEN
        CREATE POLICY "Athletes manage their own health data" ON public.health_data
            FOR ALL USING (athlete_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()));
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Coaches view athlete health data') THEN
        CREATE POLICY "Coaches view athlete health data" ON public.health_data
            FOR SELECT USING (
                athlete_id IN (
                    SELECT athlete_id FROM public.coach_athlete_relationships 
                    WHERE coach_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid())
                )
            );
    END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_health_athlete ON public.health_data(athlete_id);
CREATE INDEX IF NOT EXISTS idx_health_recorded ON public.health_data(recorded_at);

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

-- Policies (using DO blocks to avoid duplicate policy errors)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can view their own appointments') THEN
        CREATE POLICY "Users can view their own appointments" ON public.appointments
            FOR SELECT USING (
                coach_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()) OR
                athlete_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid())
            );
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Coaches can manage their own appointments') THEN
        CREATE POLICY "Coaches can manage their own appointments" ON public.appointments
            FOR ALL USING (coach_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()));
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Coaches can manage their invitations') THEN
        CREATE POLICY "Coaches can manage their invitations" ON public.invitations
            FOR ALL USING (coach_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()));
    END IF;
END $$;

-- Indexing
CREATE INDEX IF NOT EXISTS idx_appointments_coach ON public.appointments(coach_id);
CREATE INDEX IF NOT EXISTS idx_appointments_athlete ON public.appointments(athlete_id);
CREATE INDEX IF NOT EXISTS idx_invitations_coach ON public.invitations(coach_id);
CREATE INDEX IF NOT EXISTS idx_invitations_email ON public.invitations(email);
`;

async function runMigration() {
    const client = new Client({ connectionString });
    try {
        await client.connect();
        console.log('Connected to Supabase');
        await client.query(sql);
        console.log('Migration applied successfully');
    } catch (err) {
        console.error('Migration failed:', err);
    } finally {
        await client.end();
    }
}

runMigration();
