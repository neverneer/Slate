import dotenv from 'dotenv';
import bcrypt from 'bcrypt';
import { Pool } from 'pg';
import { randomUUID } from 'crypto';

dotenv.config();

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  database: process.env.DB_NAME || 'slate',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
});

async function seed() {
  try {
    console.log('Seeding database...');

    const passwordHash = await bcrypt.hash('password123', 10);

    const testUsers = [
      {
        email: 'john.doe@example.com',
        password_hash: passwordHash,
        first_name: 'John',
        last_name: 'Doe',
      },
      {
        email: 'jane.smith@example.com',
        password_hash: passwordHash,
        first_name: 'Jane',
        last_name: 'Smith',
      },
    ];

    for (const user of testUsers) {
      const result = await pool.query(
        `INSERT INTO users (email, password_hash, first_name, last_name)
         VALUES ($1, $2, $3, $4)
         ON CONFLICT (email) DO NOTHING
         RETURNING id`,
        [user.email, user.password_hash, user.first_name, user.last_name]
      );

      if (result.rows.length > 0) {
        const userId = result.rows[0].id;

        await pool.query(
          `INSERT INTO user_settings (user_id)
           VALUES ($1)
           ON CONFLICT (user_id) DO NOTHING`,
          [userId]
        );

        console.log(`Created user: ${user.email} (ID: ${userId})`);
      } else {
        console.log(`User already exists: ${user.email}`);
      }
    }

    console.log('Seeding completed successfully');
    await pool.end();
    process.exit(0);
  } catch (error) {
    console.error('Seeding failed:', error);
    await pool.end();
    process.exit(1);
  }
}

seed();
