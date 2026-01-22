-- ============================================
-- Security Hardening Migration V2
-- ============================================

-- 1. Refine handle_new_user to capture role safely
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (user_id, email, full_name, role, status)
    VALUES (
        new.id, 
        new.email, 
        new.raw_user_meta_data->>'full_name',
        COALESCE(new.raw_user_meta_data->>'role', 'athlete'), -- Capture role from metadata
        'PENDING_DOCS'
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Protect Profile Sensitivity (Prevent Self-Promotion)
CREATE OR REPLACE FUNCTION public.protect_profile_roles()
RETURNS TRIGGER AS $$
BEGIN
    -- Block role/status changes if the actor is the user themselves
    IF (OLD.role IS DISTINCT FROM NEW.role OR OLD.status IS DISTINCT FROM NEW.status) THEN
        IF (auth.uid() = OLD.user_id) THEN
            RAISE EXCEPTION 'Privilege escalation attempt: You cannot change your own role or status.';
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_profile_update_security ON public.profiles;
CREATE TRIGGER on_profile_update_security
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.protect_profile_roles();

-- 3. Tighten Invitation Security
DROP POLICY IF EXISTS "Coaches can manage their own invitations" ON public.invitations;
CREATE POLICY "Coaches can manage their own invitations" ON public.invitations
    FOR ALL USING (
        coach_id IN (
            SELECT id FROM public.profiles 
            WHERE user_id = auth.uid() 
            AND role = 'pro'
        )
    );

-- 4. Secure Health Data
DROP POLICY IF EXISTS "Users can manage their own health data" ON public.health_data;
CREATE POLICY "Users can manage their own health data" ON public.health_data
    FOR ALL USING (
        profile_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid())
    );

DROP POLICY IF EXISTS "Coaches can view health data of active athletes" ON public.health_data;
CREATE POLICY "Coaches can view health data of active athletes" ON public.health_data
    FOR SELECT USING (
        profile_id IN (
            SELECT athlete_id FROM public.coach_athlete_relationships
            WHERE coach_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid())
            AND status = 'ACTIVE'
        )
    );
