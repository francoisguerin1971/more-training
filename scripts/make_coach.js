import pg from 'pg';
import fs from 'fs';
import path from 'path';

const { Client } = pg;

const envPath = path.resolve(process.cwd(), '.env');
const env = fs.existsSync(envPath)
    ? Object.fromEntries(fs.readFileSync(envPath, 'utf8').split('\n').filter(l => l.includes('=')).map(l => l.split('=')))
    : {};

const connectionString = env.DATABASE_URL;

async function makeCoach(email) {
    if (!email) {
        console.error('Please provide an email.');
        return;
    }
    const client = new Client({
        connectionString,
        ssl: { rejectUnauthorized: false }
    });
    try {
        await client.connect();
        const res = await client.query("UPDATE public.profiles SET role = 'pro', onboarded = TRUE, status = 'ACTIVE' WHERE email = $1 RETURNING id", [email]);
        if (res.rowCount > 0) {
            console.log(`User ${email} is now a Coach (pro).`);
        } else {
            console.log(`User ${email} not found in profiles.`);
        }
    } catch (err) {
        console.error('Failed:', err);
    } finally {
        await client.end();
    }
}

makeCoach(process.argv[2]);
