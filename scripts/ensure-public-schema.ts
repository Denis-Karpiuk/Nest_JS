/**
 * Ensures the public schema exists (needed for Railway PostgreSQL).
 */
import { config } from 'dotenv';
import { Client } from 'pg';
import { resolve } from 'path';

config({ path: resolve(process.cwd(), '.env.development') });
config({ path: resolve(process.cwd(), '.env') });

async function ensurePublicSchema() {
  const url =
    process.env.DATABASE_URL ||
    `postgresql://${process.env.POSTGRES_USER}:${process.env.POSTGRES_PASSWORD}@${process.env.POSTGRES_HOST}:${process.env.POSTGRES_PORT}/${process.env.POSTGRES_DB}`;

  const client = new Client({ connectionString: url });
  try {
    await client.connect();
    await client.query('CREATE SCHEMA IF NOT EXISTS public;');
    await client.query('GRANT ALL ON SCHEMA public TO postgres;');
  } finally {
    await client.end();
  }
}

ensurePublicSchema().catch((err) => {
  console.error('Failed to ensure public schema:', err.message);
  process.exit(1);
});
