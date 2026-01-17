-- ============================================
-- Supabase Edge Functions for Server-Side Validation
-- ============================================

-- Function to encrypt health data using pgcrypto
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Function to encrypt sensitive data
CREATE OR REPLACE FUNCTION encrypt_health_data(data_text TEXT, encryption_key TEXT)
RETURNS TEXT AS $$
BEGIN
    RETURN encode(
        encrypt(
            data_text::bytea,
            encryption_key::bytea,
            'aes'
        ),
        'base64'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to decrypt sensitive data
CREATE OR REPLACE FUNCTION decrypt_health_data(encrypted_data TEXT, encryption_key TEXT)
RETURNS TEXT AS $$
BEGIN
    RETURN convert_from(
        decrypt(
            decode(encrypted_data, 'base64'),
            encryption_key::bytea,
            'aes'
        ),
        'utf8'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- RPC Function: Get Coach Subscriptions
-- ============================================
CREATE OR REPLACE FUNCTION get_coach_subscriptions(coach_id_param BIGINT)
RETURNS TABLE (subscription_id BIGINT) AS $$
BEGIN
    RETURN QUERY
    SELECT s.id
    FROM subscriptions s
    JOIN coach_athlete_relationships r ON s.relationship_id = r.id
    WHERE r.coach_id = coach_id_param;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- RPC Function: Validate Fiscal Data
-- ============================================
CREATE OR REPLACE FUNCTION validate_fiscal_data(
    legal_name_param TEXT,
    tax_id_param TEXT
)
RETURNS JSONB AS $$
DECLARE
    errors JSONB := '{}'::jsonb;
    is_valid BOOLEAN := TRUE;
BEGIN
    -- Validate legal name
    IF legal_name_param IS NULL OR LENGTH(TRIM(legal_name_param)) < 2 THEN
        errors := errors || jsonb_build_object('legalName', 'Le nom légal doit contenir au moins 2 caractères');
        is_valid := FALSE;
    END IF;

    -- Validate tax ID
    IF tax_id_param IS NULL OR LENGTH(TRIM(tax_id_param)) < 5 THEN
        errors := errors || jsonb_build_object('taxId', 'Le numéro fiscal est invalide');
        is_valid := FALSE;
    END IF;

    -- European VAT format validation (basic)
    IF tax_id_param IS NOT NULL AND tax_id_param !~ '^[A-Z]{2}[0-9A-Z]{2,13}$' THEN
        errors := errors || jsonb_build_object('taxId', 'Format de TVA invalide (ex: FR12345678901)');
        is_valid := FALSE;
    END IF;

    RETURN jsonb_build_object(
        'isValid', is_valid,
        'errors', errors
    );
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- RPC Function: Rate Limit Check
-- ============================================
CREATE TABLE IF NOT EXISTS rate_limits (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID NOT NULL,
    action TEXT NOT NULL,
    count INTEGER DEFAULT 1,
    window_start TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, action)
);

CREATE OR REPLACE FUNCTION check_rate_limit(
    user_id_param UUID,
    action_param TEXT,
    max_attempts INTEGER DEFAULT 10,
    window_minutes INTEGER DEFAULT 60
)
RETURNS JSONB AS $$
DECLARE
    current_record RECORD;
    window_end TIMESTAMPTZ;
BEGIN
    window_end := NOW() - (window_minutes || ' minutes')::INTERVAL;

    -- Get or create rate limit record
    SELECT * INTO current_record
    FROM rate_limits
    WHERE user_id = user_id_param AND action = action_param;

    IF current_record IS NULL THEN
        -- First attempt
        INSERT INTO rate_limits (user_id, action, count, window_start)
        VALUES (user_id_param, action_param, 1, NOW());
        
        RETURN jsonb_build_object(
            'allowed', TRUE,
            'remaining', max_attempts - 1,
            'resetAt', NOW() + (window_minutes || ' minutes')::INTERVAL
        );
    END IF;

    -- Check if window has expired
    IF current_record.window_start < window_end THEN
        -- Reset counter
        UPDATE rate_limits
        SET count = 1, window_start = NOW()
        WHERE user_id = user_id_param AND action = action_param;
        
        RETURN jsonb_build_object(
            'allowed', TRUE,
            'remaining', max_attempts - 1,
            'resetAt', NOW() + (window_minutes || ' minutes')::INTERVAL
        );
    END IF;

    -- Check if limit exceeded
    IF current_record.count >= max_attempts THEN
        RETURN jsonb_build_object(
            'allowed', FALSE,
            'remaining', 0,
            'resetAt', current_record.window_start + (window_minutes || ' minutes')::INTERVAL
        );
    END IF;

    -- Increment counter
    UPDATE rate_limits
    SET count = count + 1
    WHERE user_id = user_id_param AND action = action_param;

    RETURN jsonb_build_object(
        'allowed', TRUE,
        'remaining', max_attempts - (current_record.count + 1),
        'resetAt', current_record.window_start + (window_minutes || ' minutes')::INTERVAL
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- Trigger: Auto-update updated_at
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to profiles table
DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- Trigger: Validate Profile Data Before Insert/Update
-- ============================================
CREATE OR REPLACE FUNCTION validate_profile_data()
RETURNS TRIGGER AS $$
DECLARE
    validation_result JSONB;
BEGIN
    -- Validate Pro users
    IF NEW.role = 'pro' THEN
        -- Check fiscal data
        IF NEW.profile_data->'fiscal' IS NULL THEN
            RAISE EXCEPTION 'Les informations fiscales sont requises pour les professionnels';
        END IF;

        -- Validate fiscal data
        validation_result := validate_fiscal_data(
            NEW.profile_data->'fiscal'->>'legalName',
            NEW.profile_data->'fiscal'->>'taxId'
        );

        IF NOT (validation_result->>'isValid')::BOOLEAN THEN
            RAISE EXCEPTION 'Données fiscales invalides: %', validation_result->'errors';
        END IF;

        -- Check specialties
        IF NEW.profile_data->'specialties' IS NULL OR 
           jsonb_array_length(NEW.profile_data->'specialties') = 0 THEN
            RAISE EXCEPTION 'Au moins une spécialité est requise';
        END IF;

        -- Check bio
        IF NEW.profile_data->>'bio' IS NULL OR 
           LENGTH(TRIM(NEW.profile_data->>'bio')) < 50 THEN
            RAISE EXCEPTION 'La bio doit contenir au moins 50 caractères';
        END IF;
    END IF;

    -- Validate Athlete users
    IF NEW.role = 'athlete' THEN
        IF NEW.profile_data->'athletic'->>'primarySport' IS NULL THEN
            RAISE EXCEPTION 'Le sport principal est requis';
        END IF;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger (only on UPDATE to avoid blocking initial profile creation)
DROP TRIGGER IF EXISTS validate_profile_before_update ON public.profiles;
CREATE TRIGGER validate_profile_before_update
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW
    WHEN (NEW.onboarded = TRUE)
    EXECUTE FUNCTION validate_profile_data();

-- ============================================
-- Function: Generate Invoice Number
-- ============================================
CREATE OR REPLACE FUNCTION generate_invoice_number()
RETURNS TEXT AS $$
DECLARE
    year_prefix TEXT;
    sequence_num INTEGER;
BEGIN
    year_prefix := TO_CHAR(NOW(), 'YYYY');
    
    -- Get next sequence number for this year
    SELECT COALESCE(MAX(
        CAST(SUBSTRING(invoice_number FROM '[0-9]+$') AS INTEGER)
    ), 0) + 1
    INTO sequence_num
    FROM invoices
    WHERE invoice_number LIKE year_prefix || '-%';

    RETURN year_prefix || '-' || LPAD(sequence_num::TEXT, 6, '0');
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-generate invoice numbers
CREATE OR REPLACE FUNCTION set_invoice_number()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.invoice_number IS NULL THEN
        NEW.invoice_number := generate_invoice_number();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_invoice_number_trigger ON public.invoices;
CREATE TRIGGER set_invoice_number_trigger
    BEFORE INSERT ON public.invoices
    FOR EACH ROW
    EXECUTE FUNCTION set_invoice_number();

-- ============================================
-- Indexes for Performance
-- ============================================
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_status ON public.profiles(status);
CREATE INDEX IF NOT EXISTS idx_profiles_onboarded ON public.profiles(onboarded);

CREATE INDEX IF NOT EXISTS idx_relationships_status ON public.coach_athlete_relationships(status);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON public.subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_payments_status ON public.payments(status);
CREATE INDEX IF NOT EXISTS idx_payments_paid_at ON public.payments(paid_at);

CREATE INDEX IF NOT EXISTS idx_sessions_status ON public.training_sessions(status);
CREATE INDEX IF NOT EXISTS idx_sessions_scheduled_date ON public.training_sessions(scheduled_date);

-- GIN index for JSONB profile_data searches
CREATE INDEX IF NOT EXISTS idx_profiles_profile_data_gin ON public.profiles USING GIN (profile_data);

-- ============================================
-- Grant Permissions
-- ============================================
GRANT EXECUTE ON FUNCTION get_coach_subscriptions TO authenticated;
GRANT EXECUTE ON FUNCTION validate_fiscal_data TO authenticated;
GRANT EXECUTE ON FUNCTION check_rate_limit TO authenticated;
GRANT EXECUTE ON FUNCTION encrypt_health_data TO authenticated;
GRANT EXECUTE ON FUNCTION decrypt_health_data TO authenticated;
