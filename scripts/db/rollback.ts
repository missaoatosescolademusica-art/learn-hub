import fs from 'fs';
import path from 'path';
import { pool } from './client';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function rollback() {
  const client = await pool.connect();

  try {
    console.log('Starting rollback process...');

    // 1. Check if migrations table exists
    const checkTable = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = '_migrations'
      );
    `);

    if (!checkTable.rows[0].exists) {
      console.log('No migrations table found. Nothing to rollback.');
      return;
    }

    // 2. Get the last applied migration
    const { rows } = await client.query('SELECT name FROM _migrations ORDER BY id DESC LIMIT 1');
    
    if (rows.length === 0) {
      console.log('No migrations applied. Nothing to rollback.');
      return;
    }

    const lastMigrationName = rows[0].name;
    console.log(`Rolling back ${lastMigrationName}...`);

    // 3. Find the corresponding down file
    const downFileName = lastMigrationName.replace('.sql', '_down.sql');
    const downFilePath = path.join(__dirname, 'migrations', downFileName);

    if (!fs.existsSync(downFilePath)) {
      throw new Error(`Down migration file not found: ${downFileName}`);
    }

    const sql = fs.readFileSync(downFilePath, 'utf-8');

    // 4. Execute rollback
    try {
      await client.query('BEGIN');
      await client.query(sql);
      await client.query('DELETE FROM _migrations WHERE name = $1', [lastMigrationName]);
      await client.query('COMMIT');
      console.log(`Successfully rolled back ${lastMigrationName}`);
    } catch (err) {
      await client.query('ROLLBACK');
      console.error(`Error rolling back ${lastMigrationName}:`, err);
      throw err;
    }

  } catch (error) {
    console.error('Rollback failed:', error);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

rollback();
