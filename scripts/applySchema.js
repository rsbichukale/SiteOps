const fs = require('fs');
const path = require('path');
const { Client } = require('pg');

async function main() {
  const connectionString = 'postgresql://postgres:Rutuja%40987%23@db.olrctysejzdcxnntfivt.supabase.co:5432/postgres';
  const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false }
  });

  try {
    console.log('[Schema Installer] Connecting to Supabase Postgres database...');
    await client.connect();
    console.log('[Schema Installer] Connected successfully!');

    const sqlPath = path.join(__dirname, '..', 'siteops_supabase_schema.sql');
    const sqlContent = fs.readFileSync(sqlPath, 'utf8');

    console.log('[Schema Installer] Applying siteops_supabase_schema.sql...');
    await client.query(sqlContent);
    console.log('[Schema Installer] ✅ All 23 tables & policies created successfully in Supabase!');
  } catch (err) {
    console.error('[Schema Installer] ❌ Error applying SQL schema:', err);
  } finally {
    await client.end();
  }
}

main();
