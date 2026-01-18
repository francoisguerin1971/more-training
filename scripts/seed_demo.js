import pg from 'pg';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

const { Client } = pg;

const envPath = path.resolve(process.cwd(), '.env');
const env = fs.existsSync(envPath)
    ? Object.fromEntries(fs.readFileSync(envPath, 'utf8').split('\n').filter(l => l.includes('=')).map(l => l.split('=')))
    : {};

const connectionString = env.DATABASE_URL;

if (!connectionString) {
    console.error('DATABASE_URL not found in .env');
    process.exit(1);
}

const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false }
});

async function seed() {
    try {
        await client.connect();
        console.log('Connected to Supabase via Pooler');

        // 1. Identify the current coach (you)
        const coachRes = await client.query("SELECT id, user_id FROM public.profiles WHERE role = 'pro' ORDER BY created_at DESC LIMIT 1");

        if (coachRes.rows.length === 0) {
            console.error('No coach profile found. Please create a coach account first.');
            return;
        }

        const coach = coachRes.rows[0];
        console.log(`Seeding data for Coach ID: ${coach.id}`);

        // 2. Athletes to create
        const athletes = [
            { name: 'Marc Dupont', email: 'marc.dupont@example.com', sport: 'Cyclisme' },
            { name: 'Julie Martin', email: 'julie.martin@example.com', sport: 'Triathlon' },
            { name: 'Thomas Bernard', email: 'thomas.bernard@example.com', sport: 'Trail Running' },
            { name: 'Sophie Petit', email: 'sophie.petit@example.com', sport: 'Natation' },
            { name: 'Lucas Morel', email: 'lucas.morel@example.com', sport: 'CrossFit' }
        ];

        for (const meta of athletes) {
            const athleteUserId = crypto.randomUUID();

            // Insert into auth.users (dummy entry)
            await client.query(`
                INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, aud, role)
                VALUES ($1, $2, 'dummy-password', NOW(), '{"provider":"email","providers":["email"]}', $3, 'authenticated', 'authenticated')
                ON CONFLICT (email) DO NOTHING
            `, [athleteUserId, meta.email, JSON.stringify({ full_name: meta.name })]);

            // Get profile
            let profileRes = await client.query("SELECT id FROM public.profiles WHERE email = $1", [meta.email]);
            let profileId;

            if (profileRes.rows.length === 0) {
                const insertProfile = await client.query(`
                    INSERT INTO public.profiles (user_id, email, full_name, role, status, onboarded)
                    VALUES ($1, $2, $3, 'athlete', 'ACTIVE', TRUE)
                    RETURNING id
                `, [athleteUserId, meta.email, meta.name]);
                profileId = insertProfile.rows[0].id;
            } else {
                profileId = profileRes.rows[0].id;
                await client.query("UPDATE public.profiles SET status = 'ACTIVE', onboarded = TRUE, role = 'athlete' WHERE id = $1", [profileId]);
            }

            console.log(`- Created Athlete: ${meta.name} (ID: ${profileId})`);

            // 3. Relationship
            await client.query(`
                INSERT INTO public.coach_athlete_relationships (coach_id, athlete_id, status, subscription_plan, monthly_price_cents, start_date)
                VALUES ($1, $2, 'ACTIVE', 'premium', 8900, CURRENT_DATE - INTERVAL '30 days')
                ON CONFLICT (coach_id, athlete_id) DO UPDATE SET status = 'ACTIVE'
            `, [coach.id, profileId]);

            // 4. Health Data
            console.log(`  - Generating health data for ${meta.name}...`);
            for (let i = 0; i < 14; i++) {
                const date = new Date();
                date.setDate(date.getDate() - i);
                const hrv = Math.floor(Math.random() * (80 - 45 + 1) + 45);
                const rhr = Math.floor(Math.random() * (65 - 48 + 1) + 48);
                const sleep = (Math.random() * (9 - 6) + 6).toFixed(1);

                await client.query(`
                    INSERT INTO public.health_data (profile_id, data_type, encrypted_payload, created_at)
                    VALUES ($1, 'daily_metrics', $2, $3)
                `, [profileId, JSON.stringify({ hrv, rhr, sleep_hours: parseFloat(sleep) }), date]);
            }

            // 5. Training Sessions
            console.log(`  - Creating training sessions for ${meta.name}...`);
            const planRes = await client.query(`
                INSERT INTO public.training_plans (coach_id, athlete_id, name, sport, status, start_date)
                VALUES ($1, $2, $3, $4, 'ACTIVE', CURRENT_DATE - INTERVAL '7 days')
                RETURNING id
            `, [coach.id, profileId, `Plan Préparation ${meta.sport}`, meta.sport]);

            const planId = planRes.rows[0].id;

            // Past
            for (let i = 1; i <= 7; i++) {
                await client.query(`
                    INSERT INTO public.training_sessions (plan_id, athlete_id, scheduled_date, title, status, session_type, duration_minutes, planned_load, actual_load, completed_at)
                    VALUES ($1, $2, CURRENT_DATE - $3 * INTERVAL '1 day', $4, 'COMPLETED', 'workout', 60, 300, 320, CURRENT_TIMESTAMP - $3 * INTERVAL '1 day')
                `, [planId, profileId, i, `Séance Endurance ${i}`]);
            }

            // Future
            for (let i = 0; i < 7; i++) {
                await client.query(`
                    INSERT INTO public.training_sessions (plan_id, athlete_id, scheduled_date, title, status, session_type, duration_minutes, planned_load)
                    VALUES ($1, $2, CURRENT_DATE + $3 * INTERVAL '1 day', $4, 'PLANNED', 'workout', 75, 400)
                `, [planId, profileId, i, `Prochaine Séance ${i + 1}`]);
            }

            // 6. Invoices
            await client.query(`
                INSERT INTO public.invoices (buyer_id, seller_id, amount_cents, status, issued_at)
                VALUES ($1, $2, 8900, 'PAID', CURRENT_TIMESTAMP - INTERVAL '15 days')
            `, [profileId, coach.id]);
        }

        // 7. Appointments
        console.log('Creating upcoming appointments...');
        const athleteIdsRes = await client.query("SELECT athlete_id FROM public.coach_athlete_relationships WHERE coach_id = $1 LIMIT 3", [coach.id]);

        for (let i = 0; i < athleteIdsRes.rows.length; i++) {
            const athleteId = athleteIdsRes.rows[i].athlete_id;
            const startTime = new Date();
            startTime.setDate(startTime.getDate() + i + 1);
            startTime.setHours(10 + i, 0, 0, 0);
            const endTime = new Date(startTime.getTime() + 45 * 60000);

            await client.query(`
                INSERT INTO public.appointments (coach_id, athlete_id, title, start_time, end_time, status)
                VALUES ($1, $2, $3, $4, $5, 'SCHEDULED')
            `, [coach.id, athleteId, 'Suivi hebdomadaire', startTime, endTime]);
        }

        console.log('\n✅ Seeding completed! Your dashboard should now be full of life.');

    } catch (err) {
        console.error('Seeding failed:', err);
        console.error(err.stack);
    } finally {
        await client.end();
    }
}

seed();
