import { supabase, isSupabaseConfigured } from './supabaseClient';

function camelToSnakeKey(key: string): string {
  return key.replace(/([A-Z])/g, '_$1').toLowerCase();
}

function snakeToCamelKey(key: string): string {
  return key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
}

export function mapToSnakeCase(obj: any): any {
  if (Array.isArray(obj)) return obj.map(mapToSnakeCase);
  if (obj !== null && typeof obj === 'object' && !(obj instanceof Date)) {
    const n: any = {};
    for (const k of Object.keys(obj)) {
      n[camelToSnakeKey(k)] = mapToSnakeCase(obj[k]);
    }
    return n;
  }
  return obj;
}

export function mapToCamelCase(obj: any): any {
  if (Array.isArray(obj)) return obj.map(mapToCamelCase);
  if (obj !== null && typeof obj === 'object' && !(obj instanceof Date)) {
    const n: any = {};
    for (const k of Object.keys(obj)) {
      n[snakeToCamelKey(k)] = mapToCamelCase(obj[k]);
    }
    return n;
  }
  return obj;
}

export async function fetchStateFromSupabase() {
  if (!isSupabaseConfigured || !supabase) return null;
  try {
    console.log('[SiteOps Sync] Fetching remote state from Supabase...');
    const [
      { data: sites },
      { data: contractorsMaster },
      { data: materialCategories },
      { data: suppliers },
      { data: materialInward },
      { data: materialIssued },
      { data: materialWastage },
      { data: expenseCategories },
      { data: expenses },
      { data: fundRequisitions },
      { data: equipmentTypes },
      { data: equipment },
      { data: equipmentUsage },
      { data: equipmentPayments },
      { data: visitors },
      { data: meetings },
      { data: sitePhotos },
      { data: safetyCheckItems },
      { data: safetyChecklists },
      { data: safetyIncidents },
      { data: ppeIssuance },
      { data: cubeTests },
      { data: materialTests },
      { data: ncrReports },
      { data: dailyReports },
      { data: contractorShifts },
      { data: contractorMaterialAllocations },
      { data: materialDamageDeductions }
    ] = await Promise.all([
      supabase.from('sites').select('*'),
      supabase.from('contractors_master').select('*'),
      supabase.from('material_categories').select('*'),
      supabase.from('suppliers').select('*'),
      supabase.from('material_inward').select('*'),
      supabase.from('material_issued').select('*'),
      supabase.from('material_wastage').select('*'),
      supabase.from('expense_categories').select('*'),
      supabase.from('expenses').select('*'),
      supabase.from('fund_requisitions').select('*'),
      supabase.from('equipment_types').select('*'),
      supabase.from('equipment').select('*'),
      supabase.from('equipment_usage').select('*'),
      supabase.from('equipment_payments').select('*'),
      supabase.from('visitors').select('*'),
      supabase.from('meetings').select('*'),
      supabase.from('site_photos').select('*'),
      supabase.from('safety_check_items').select('*'),
      supabase.from('safety_checklists').select('*'),
      supabase.from('safety_incidents').select('*'),
      supabase.from('ppe_issuance').select('*'),
      supabase.from('cube_tests').select('*'),
      supabase.from('material_tests').select('*'),
      supabase.from('ncr_reports').select('*'),
      supabase.from('daily_progress_reports').select('*'),
      supabase.from('contractor_shifts').select('*'),
      supabase.from('contractor_material_allocations').select('*'),
      supabase.from('material_damage_deductions').select('*'),
    ]);

    return {
      sites: sites?.length ? mapToCamelCase(sites) : undefined,
      contractorsMaster: contractorsMaster?.length ? mapToCamelCase(contractorsMaster) : undefined,
      materialCategories: materialCategories?.length ? mapToCamelCase(materialCategories) : undefined,
      suppliers: suppliers?.length ? mapToCamelCase(suppliers) : undefined,
      materialInward: materialInward?.length ? mapToCamelCase(materialInward) : undefined,
      materialIssued: materialIssued?.length ? mapToCamelCase(materialIssued) : undefined,
      materialWastage: materialWastage?.length ? mapToCamelCase(materialWastage) : undefined,
      expenseCategories: expenseCategories?.length ? mapToCamelCase(expenseCategories) : undefined,
      expenses: expenses?.length ? mapToCamelCase(expenses) : undefined,
      fundRequisitions: fundRequisitions?.length ? mapToCamelCase(fundRequisitions) : undefined,
      equipmentTypes: equipmentTypes?.length ? mapToCamelCase(equipmentTypes) : undefined,
      equipment: equipment?.length ? mapToCamelCase(equipment) : undefined,
      equipmentUsage: equipmentUsage?.length ? mapToCamelCase(equipmentUsage) : undefined,
      equipmentPayments: equipmentPayments?.length ? mapToCamelCase(equipmentPayments) : undefined,
      visitors: visitors?.length ? mapToCamelCase(visitors) : undefined,
      meetings: meetings?.length ? mapToCamelCase(meetings) : undefined,
      sitePhotos: sitePhotos?.length ? mapToCamelCase(sitePhotos) : undefined,
      safetyCheckItems: safetyCheckItems?.length ? mapToCamelCase(safetyCheckItems) : undefined,
      safetyChecklists: safetyChecklists?.length ? mapToCamelCase(safetyChecklists) : undefined,
      safetyIncidents: safetyIncidents?.length ? mapToCamelCase(safetyIncidents) : undefined,
      ppeIssuance: ppeIssuance?.length ? mapToCamelCase(ppeIssuance) : undefined,
      cubeTests: cubeTests?.length ? mapToCamelCase(cubeTests) : undefined,
      materialTests: materialTests?.length ? mapToCamelCase(materialTests) : undefined,
      ncrReports: ncrReports?.length ? mapToCamelCase(ncrReports) : undefined,
      dailyReports: dailyReports?.length ? mapToCamelCase(dailyReports) : undefined,
      contractorShifts: contractorShifts?.length ? mapToCamelCase(contractorShifts) : undefined,
      contractorMaterialAllocations: contractorMaterialAllocations?.length ? mapToCamelCase(contractorMaterialAllocations) : undefined,
      materialDamageDeductions: materialDamageDeductions?.length ? mapToCamelCase(materialDamageDeductions) : undefined,
    };
  } catch (err) {
    console.error('[SiteOps Sync] Error fetching state from Supabase:', err);
    return null;
  }
}

export async function saveStateToSupabase(partialState: Record<string, any>) {
  if (!isSupabaseConfigured || !supabase) return;

  const keyToTableMap: Record<string, string> = {
    sites: 'sites',
    contractorsMaster: 'contractors_master',
    materialCategories: 'material_categories',
    suppliers: 'suppliers',
    materialInward: 'material_inward',
    materialIssued: 'material_issued',
    materialWastage: 'material_wastage',
    expenseCategories: 'expense_categories',
    expenses: 'expenses',
    fundRequisitions: 'fund_requisitions',
    equipmentTypes: 'equipment_types',
    equipment: 'equipment',
    equipmentUsage: 'equipment_usage',
    equipmentPayments: 'equipment_payments',
    visitors: 'visitors',
    meetings: 'meetings',
    sitePhotos: 'site_photos',
    safetyCheckItems: 'safety_check_items',
    safetyChecklists: 'safety_checklists',
    safetyIncidents: 'safety_incidents',
    ppeIssuance: 'ppe_issuance',
    cubeTests: 'cube_tests',
    materialTests: 'material_tests',
    ncrReports: 'ncr_reports',
    dailyReports: 'daily_progress_reports',
    contractorShifts: 'contractor_shifts',
    contractorMaterialAllocations: 'contractor_material_allocations',
    materialDamageDeductions: 'material_damage_deductions',
  };

  for (const [stateKey, items] of Object.entries(partialState)) {
    const tableName = keyToTableMap[stateKey];
    if (tableName && Array.isArray(items) && items.length > 0) {
      try {
        const payload = mapToSnakeCase(items);
        const { error } = await supabase.from(tableName).upsert(payload, { onConflict: 'id' });
        if (error) {
          console.error(`[Supabase Sync] Direct save error for ${tableName}:`, error.message);
        } else {
          console.log(`[Supabase Sync] Successfully saved ${items.length} records to table '${tableName}'`);
        }
      } catch (err) {
        console.error(`[Supabase Sync] Exception saving to ${tableName}:`, err);
      }
    }
  }
}
