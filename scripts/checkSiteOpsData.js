const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://olrctysejzdcxnntfivt.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9scmN0eXNlanpkY3hubnRmaXZ0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NjUwMTUwOCwiZXhwIjoyMTAyMDc3NTA4fQ.7LR9VIux3Bhdm3lmqoqMrak76G982NrFI0GaDwyhHFA';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkSiteOps() {
  console.log('----------------------------------------------------');
  console.log('🔍 CONSTRUCTTRACK-SITEOPS SUPABASE DATA CHECK');
  console.log('----------------------------------------------------');

  const tables = [
    'sites',
    'material_categories',
    'suppliers',
    'material_inward',
    'material_issued',
    'material_wastage',
    'expense_categories',
    'expenses',
    'fund_requisitions',
    'equipment_types',
    'equipment',
    'equipment_usage',
    'equipment_payments',
    'visitors',
    'meetings',
    'site_photos',
    'safety_check_items',
    'safety_checklists',
    'safety_incidents',
    'ppe_issuance',
    'cube_tests',
    'material_tests',
    'ncr_reports'
  ];

  for (const table of tables) {
    try {
      const { data, count, error } = await supabase
        .from(table)
        .select('*', { count: 'exact' });

      if (error) {
        console.log(`❌ Table '${table}': Error -> ${error.message}`);
      } else {
        console.log(`✅ Table '${table.padEnd(23, ' ')}': ${count || (data ? data.length : 0)} recorded rows`);
      }
    } catch (err) {
      console.log(`❌ Table '${table}': Exception -> ${err.message}`);
    }
  }

  console.log('----------------------------------------------------');
}

checkSiteOps();
