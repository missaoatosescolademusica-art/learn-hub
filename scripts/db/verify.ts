import { pool } from './client';

async function verify() {
  const client = await pool.connect();
  try {
    console.log('Verifying migration status...');
    
    // 1. Check if public tables exist
    const tables = ['profiles', 'video_progress', 'users_mock', 'profile_links', 'profile_skills'];
    let allTablesExist = true;

    for (const table of tables) {
      const res = await client.query(`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_name = $1
        );
      `, [table]);
      
      if (res.rows[0].exists) {
        console.log(`✅ Table 'public.${table}' exists.`);
      } else {
        console.error(`❌ Table 'public.${table}' MISSING.`);
        allTablesExist = false;
      }
    }

    // 2. Check functions
    const functions = ['update_updated_at_column', 'handle_new_user', 'current_session_id'];
    for (const func of functions) {
       const res = await client.query(`
        SELECT EXISTS (
          SELECT FROM information_schema.routines
          WHERE routine_schema = 'public'
          AND routine_name = $1
        );
      `, [func]);
       if (res.rows[0].exists) {
        console.log(`✅ Function '${func}' exists.`);
      } else {
        console.error(`❌ Function '${func}' MISSING.`);
      }
    }

    if (allTablesExist) {
        console.log('\nSUCCESS: Database structure appears correct.');
    } else {
        console.log('\nFAILURE: Some expected structures are missing.');
        process.exit(1);
    }
    
  } catch (err) {
    console.error('Verification failed:', err);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

verify();
