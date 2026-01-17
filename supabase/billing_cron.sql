-- Simulation of Automated Billing Cycle
-- This logic should run periodically (e.g., via Supabase Edge Function or pg_cron)

-- 1. Function to generate monthly invoices for all Pros
CREATE OR REPLACE FUNCTION public.generate_monthly_invoices()
RETURNS void AS $$
DECLARE
    pro_record RECORD;
    plan_price INTEGER;
BEGIN
    FOR pro_record IN 
        SELECT id, current_plan, billing_day 
        FROM public.profiles 
        WHERE role = 'pro' AND status = 'ACTIVE'
    LOOP
        -- Determine price based on plan
        CASE pro_record.current_plan
            WHEN 'starter' THEN plan_price := 1900; -- 19.00€
            WHEN 'pro' THEN plan_price := 4900;     -- 49.00€
            WHEN 'elite' THEN plan_price := 9900;    -- 99.00€
            ELSE plan_price := 0;
        END CASE;

        IF plan_price > 0 THEN
            -- Insert Invoice
            INSERT INTO public.invoices (profile_id, amount_cents, status, issued_at)
            VALUES (pro_record.id, plan_price, 'PAID', NOW());
            
            -- In a real scenario, we would trigger the payment gateway here
        END IF;
    END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Trigger or Schedule (Pseudo-code as pg_cron might not be enabled by default)
-- SELECT cron.schedule('0 0 1 * *', 'SELECT generate_monthly_invoices()');

-- For now, Pros can see their status in the UI thanks to the simulated Invoices.jsx
