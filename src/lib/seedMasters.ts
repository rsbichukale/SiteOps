import { MaterialCategory, ExpenseCategory, EquipmentTypeMaster, SafetyCheckItem, Site } from '../types';

export const INITIAL_SITES: Site[] = [
  { id: 1, name: 'Site Alpha (Main Project)' },
  { id: 2, name: 'Site Beta (Phase 2)' },
];

export const INITIAL_MATERIAL_CATEGORIES: MaterialCategory[] = [
  { id: 1, name: 'Cement', code: 'CEMENT', defaultUnit: 'bags', iconName: 'Package', lowStockThreshold: 50 },
  { id: 2, name: 'Steel / TMT Bars', code: 'STEEL', defaultUnit: 'tonnes', iconName: 'Layers', lowStockThreshold: 5 },
  { id: 3, name: 'Sand / Crush', code: 'SAND', defaultUnit: 'loads', iconName: 'Truck', lowStockThreshold: 2 },
  { id: 4, name: 'Red Bricks / AAC Blocks', code: 'BRICKS', defaultUnit: 'nos', iconName: 'Boxes', lowStockThreshold: 1000 },
  { id: 5, name: 'Tiles / Marble / Granite', code: 'TILES', defaultUnit: 'boxes', iconName: 'Grid', lowStockThreshold: 20 },
  { id: 6, name: 'Plumbing Pipes & Fittings', code: 'PLUMBING', defaultUnit: 'nos', iconName: 'Pipette', lowStockThreshold: 30 },
  { id: 7, name: 'Electrical Cables & Conduits', code: 'ELECTRICAL', defaultUnit: 'meters', iconName: 'Zap', lowStockThreshold: 100 },
  { id: 8, name: 'Paint & Putty', code: 'PAINT', defaultUnit: 'drums', iconName: 'Paintbrush', lowStockThreshold: 5 },
  { id: 9, name: 'Hardware & Fasteners', code: 'HARDWARE', defaultUnit: 'boxes', iconName: 'Wrench', lowStockThreshold: 10 },
  { id: 10, name: 'Ready-Mix Concrete (RMC)', code: 'RMC', defaultUnit: 'cu.m', iconName: 'Container', lowStockThreshold: 10 },
];

export const INITIAL_EXPENSE_CATEGORIES: ExpenseCategory[] = [
  { id: 1, name: 'Tea & Snacks', iconName: 'Coffee' },
  { id: 2, name: 'Transport & Freight', iconName: 'Truck' },
  { id: 3, name: 'Local Hardware Purchase', iconName: 'ShoppingBag' },
  { id: 4, name: 'Fuel & Oil', iconName: 'Fuel' },
  { id: 5, name: 'Labour Advance / Allowance', iconName: 'Banknote' },
  { id: 6, name: 'Stationery & Xerox', iconName: 'FileText' },
  { id: 7, name: 'First Aid & Medical', iconName: 'Cross' },
  { id: 8, name: 'Miscellaneous Expense', iconName: 'MoreHorizontal' },
];

export const INITIAL_EQUIPMENT_TYPES: EquipmentTypeMaster[] = [
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

export const INITIAL_SAFETY_CHECK_ITEMS: SafetyCheckItem[] = [
  { id: 1, itemText: 'All workers wearing Hard Hat Helmets', category: 'PPE' },
  { id: 2, itemText: 'Safety boots / shoes worn by workers', category: 'PPE' },
  { id: 3, itemText: 'Scaffolding tied, braced & safety platform secure', category: 'Scaffolding' },
  { id: 4, itemText: 'Safety harnesses used for work at height (>2 meters)', category: 'Height Safety' },
  { id: 5, itemText: 'Fire extinguishers checked & accessible', category: 'Fire Safety' },
  { id: 6, itemText: 'First aid box stocked & available at site office', category: 'Medical' },
  { id: 7, itemText: 'Floor openings & lift shafts barricaded / covered', category: 'Edge Protection' },
  { id: 8, itemText: 'Electrical MCB, ELCB & cables insulated properly', category: 'Electrical Safety' },
  { id: 9, itemText: 'Debris & scrap cleared from walkways & passages', category: 'Housekeeping' },
  { id: 10, itemText: 'Clean drinking water & toilet facilities accessible', category: 'Welfare' },
];
