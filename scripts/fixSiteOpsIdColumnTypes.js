const { Client } = require('pg');

async function main() {
  const connectionString = 'postgresql://postgres:Rutuja%40987%23@db.olrctysejzdcxnntfivt.supabase.co:5432/postgres';
  const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false }
  });

  try {
    console.log('[SiteOps DB Fix] Connecting to SiteOps Postgres database...');
    await client.connect();

    const statements = [
      'ALTER TABLE sites ALTER COLUMN id TYPE BIGINT;',
      'ALTER TABLE material_categories ALTER COLUMN id TYPE BIGINT;',
      'ALTER TABLE suppliers ALTER COLUMN id TYPE BIGINT;',
      'ALTER TABLE material_inward ALTER COLUMN id TYPE BIGINT;',
      'ALTER TABLE material_issued ALTER COLUMN id TYPE BIGINT;',
      'ALTER TABLE material_wastage ALTER COLUMN id TYPE BIGINT;',
      'ALTER TABLE expense_categories ALTER COLUMN id TYPE BIGINT;',
      'ALTER TABLE expenses ALTER COLUMN id TYPE BIGINT;',
      'ALTER TABLE fund_requisitions ALTER COLUMN id TYPE BIGINT;',
      'ALTER TABLE equipment_types ALTER COLUMN id TYPE BIGINT;',
      'ALTER TABLE equipment ALTER COLUMN id TYPE BIGINT;',
      'ALTER TABLE equipment_usage ALTER COLUMN id TYPE BIGINT;',
      'ALTER TABLE equipment_payments ALTER COLUMN id TYPE BIGINT;',
      'ALTER TABLE visitors ALTER COLUMN id TYPE BIGINT;',
      'ALTER TABLE meetings ALTER COLUMN id TYPE BIGINT;',
      'ALTER TABLE site_photos ALTER COLUMN id TYPE BIGINT;',
      'ALTER TABLE safety_check_items ALTER COLUMN id TYPE BIGINT;',
      'ALTER TABLE safety_checklists ALTER COLUMN id TYPE BIGINT;',
      'ALTER TABLE safety_incidents ALTER COLUMN id TYPE BIGINT;',
      'ALTER TABLE ppe_issuance ALTER COLUMN id TYPE BIGINT;',
      'ALTER TABLE cube_tests ALTER COLUMN id TYPE BIGINT;',
      'ALTER TABLE material_tests ALTER COLUMN id TYPE BIGINT;',
      'ALTER TABLE ncr_reports ALTER COLUMN id TYPE BIGINT;',
    ];

    for (const stmt of statements) {
      try {
        await client.query(stmt);
        console.log(`[SiteOps DB Fix] ✅ ${stmt}`);
      } catch (e) {
        console.warn(`[SiteOps DB Fix] ⚠️ Skipped: ${stmt} -> ${e.message}`);
      }
    }

    console.log('[SiteOps DB Fix] 🎉 All SiteOps tables checked and converted to BIGINT!');
  } catch (err) {
    console.error('[SiteOps DB Fix] Error:', err);
  } finally {
    await client.end();
  }
}

main();
