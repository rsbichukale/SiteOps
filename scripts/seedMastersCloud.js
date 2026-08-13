const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://olrctysejzdcxnntfivt.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9scmN0eXNlanpkY3hubnRmaXZ0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NjUwMTUwOCwiZXhwIjoyMTAyMDc3NTA4fQ.7LR9VIux3Bhdm3lmqoqMrak76G982NrFI0GaDwyhHFA';

const supabase = createClient(supabaseUrl, supabaseKey);

const SITES = [
  { id: 1, name: 'Site Alpha (Main Project)' },
  { id: 2, name: 'Site Beta (Phase 2)' },
];

const MATERIAL_CATEGORIES = [
  { id: 1, name: 'Cement', code: 'CEMENT', default_unit: 'bags', icon_name: 'Package', low_stock_threshold: 50 },
  { id: 2, name: 'Steel / TMT Bars', code: 'STEEL', default_unit: 'tonnes', icon_name: 'Layers', low_stock_threshold: 5 },
  { id: 3, name: 'Sand / Crush', code: 'SAND', default_unit: 'loads', icon_name: 'Truck', low_stock_threshold: 2 },
  { id: 4, name: 'Red Bricks / AAC Blocks', code: 'BRICKS', default_unit: 'nos', icon_name: 'Boxes', low_stock_threshold: 1000 },
  { id: 5, name: 'Tiles / Marble / Granite', code: 'TILES', default_unit: 'boxes', icon_name: 'Grid', low_stock_threshold: 20 },
  { id: 6, name: 'Plumbing Pipes & Fittings', code: 'PLUMBING', default_unit: 'nos', icon_name: 'Pipette', low_stock_threshold: 30 },
  { id: 7, name: 'Electrical Cables & Conduits', code: 'ELECTRICAL', default_unit: 'meters', icon_name: 'Zap', low_stock_threshold: 100 },
  { id: 8, name: 'Paint & Putty', code: 'PAINT', default_unit: 'drums', icon_name: 'Paintbrush', low_stock_threshold: 5 },
  { id: 9, name: 'Hardware & Fasteners', code: 'HARDWARE', default_unit: 'boxes', icon_name: 'Wrench', low_stock_threshold: 10 },
  { id: 10, name: 'Ready-Mix Concrete (RMC)', code: 'RMC', default_unit: 'cu.m', icon_name: 'Container', low_stock_threshold: 10 },
];

const EXPENSE_CATEGORIES = [
  { id: 1, name: 'Tea & Snacks', icon_name: 'Coffee' },
  { id: 2, name: 'Transport & Freight', icon_name: 'Truck' },
  { id: 3, name: 'Local Hardware Purchase', icon_name: 'ShoppingBag' },
  { id: 4, name: 'Fuel & Oil', icon_name: 'Fuel' },
  { id: 5, name: 'Labour Advance / Allowance', icon_name: 'Banknote' },
  { id: 6, name: 'Stationery & Xerox', icon_name: 'FileText' },
  { id: 7, name: 'First Aid & Medical', icon_name: 'Cross' },
  { id: 8, name: 'Miscellaneous Expense', icon_name: 'MoreHorizontal' },
];

const EQUIPMENT_TYPES = [
  { id: 1, name: 'JCB / Excavator', category: 'Heavy Earthmoving' },
  { id: 2, name: 'Tower Crane / Mobile Crane', category: 'Lifting' },
  { id: 3, name: 'Concrete Mixer Machine', category: 'Concreting' },
  { id: 4, name: 'Construction Lift / Passenger Hoist', category: 'Vertical Transport' },
  { id: 5, name: 'Scaffolding Sets', category: 'Staging' },
  { id: 6, name: 'Bar Bending & Cutting Machine', category: 'Steel Work' },
  { id: 7, name: 'Needle Vibrator', category: 'Concreting' },
  { id: 8, name: 'Generator / DG Set', category: 'Power' },
  { id: 9, name: 'Welding Machine', category: 'Fabrication' },
  { id: 10, name: 'De-watering Water Pump', category: 'Pumping' },
];

const SAFETY_CHECK_ITEMS = [
  { id: 1, item_text: 'All workers wearing Hard Hat Helmets', category: 'PPE' },
  { id: 2, item_text: 'Safety boots / shoes worn by workers', category: 'PPE' },
  { id: 3, item_text: 'Scaffolding tied, braced & safety platform secure', category: 'Scaffolding' },
  { id: 4, item_text: 'Safety harnesses used for work at height (>2 meters)', category: 'Height Safety' },
  { id: 5, item_text: 'Fire extinguishers checked & accessible', category: 'Fire Safety' },
  { id: 6, item_text: 'First aid box stocked & available at site office', category: 'Medical' },
  { id: 7, item_text: 'Floor openings & lift shafts barricaded / covered', category: 'Edge Protection' },
  { id: 8, item_text: 'Electrical MCB, ELCB & cables insulated properly', category: 'Electrical Safety' },
  { id: 9, item_text: 'Debris & scrap cleared from walkways & passages', category: 'Housekeeping' },
  { id: 10, item_text: 'Clean drinking water & toilet facilities accessible', category: 'Welfare' },
];

async function seed() {
  console.log('[Supabase Cloud Seeder] Seeding master data tables...');

  const { error: errSites } = await supabase.from('sites').upsert(SITES);
  if (errSites) console.error('Error seeding sites:', errSites);
  else console.log('✓ Sites seeded');

  const { error: errMat } = await supabase.from('material_categories').upsert(MATERIAL_CATEGORIES);
  if (errMat) console.error('Error seeding material categories:', errMat);
  else console.log('✓ Material categories seeded');

  const { error: errExp } = await supabase.from('expense_categories').upsert(EXPENSE_CATEGORIES);
  if (errExp) console.error('Error seeding expense categories:', errExp);
  else console.log('✓ Expense categories seeded');

  const { error: errEq } = await supabase.from('equipment_types').upsert(EQUIPMENT_TYPES);
  if (errEq) console.error('Error seeding equipment types:', errEq);
  else console.log('✓ Equipment types seeded');

  const { error: errSafe } = await supabase.from('safety_check_items').upsert(SAFETY_CHECK_ITEMS);
  if (errSafe) console.error('Error seeding safety check items:', errSafe);
  else console.log('✓ Safety check items seeded');

  console.log('[Supabase Cloud Seeder] ✅ Seeding complete!');
}

seed();
