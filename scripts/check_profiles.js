import pg from 'pg';
import fs from 'fs';
import path from 'path';

const { Client } = pg;

const envPath = path.resolve(process.cwd(), '.env');
const env = fs.existsSync(envPath)
    ? Object.fromEntries(fs.readFileSync(envPath, 'utf8').split('\n').filter(l => l.includes('=')).map(l => {
        const firstEq = l.indexOf('=');
        return [l.substring(0, firstEq), l.substring(firstEq + 1).replace(/"/g, '').trim()];
    }))
    : {};

const connectionString = env.DATABASE_URL;

async function checkProfiles() {
    const client = new Client({
        connectionString,
        ssl: { rejectUnauthorized: false }
    });
    try {
        await client.connect();
        const res = await client.query('SELECT id, email, full_name FROM public.profiles WHERE email = $1', ['francois.guerin.1971@gmail.com']);
        if (res.rowCount > 0) {
            console.log('Profile still exists:', res.rows[0]);
            console.log('Attempting to delete profile...');
            await client.query('DELETE FROM public.profiles WHERE email = $1', ['francois.guerin.1971@gmail.com']);
            console.log('Profile deleted.');
        } else {
            console.log('No profile found for this email.');
        }
    } catch (err) {
        console.error('Failed:', err);
    } finally {
        await client.end();
    }
}

checkProfiles();
