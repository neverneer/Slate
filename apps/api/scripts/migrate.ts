import dotenv from 'dotenv';
import { readFileSync } from 'fs';
import { join } from 'path';
import { Pool } from 'pg';

dotenv.config();

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  database: process.env.DB_NAME || 'slate',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
});

async function migrate() {
  try {
    console.log('Running database migrations...');

    const migrationPath = join(__dirname, '../migrations/001_initial_schema.sql');
    const migrationSQL = readFileSync(migrationPath, 'utf8');

    await pool.query(migrationSQL);

    console.log('Migrations completed successfully');
    await pool.end();
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    await pool.end();
    process.exit(1);
  }
}

migrate();
