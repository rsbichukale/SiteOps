import { supabase, isSupabaseConfigured } from './supabaseClient';
import { getAppState, saveAppState } from './dbState';

export async function fetchStateFromSupabase() {
  if (!isSupabaseConfigured || !supabase) return null;
  try {
    console.log('[SiteOps Sync] Fetching remote state from Supabase...');
    const [
      { data: sites },
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
      { data: ncrReports }
    ] = await Promise.all([
      supabase.from('sites').select('*'),
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
    ]);

    return {
      sites: sites || undefined,
      materialCategories: materialCategories || undefined,
      suppliers: suppliers || undefined,
      materialInward: materialInward || undefined,
      materialIssued: materialIssued || undefined,
      materialWastage: materialWastage || undefined,
      expenseCategories: expenseCategories || undefined,
      expenses: expenses || undefined,
      fundRequisitions: fundRequisitions || undefined,
      equipmentTypes: equipmentTypes || undefined,
      equipment: equipment || undefined,
      equipmentUsage: equipmentUsage || undefined,
      equipmentPayments: equipmentPayments || undefined,
      visitors: visitors || undefined,
      meetings: meetings || undefined,
      sitePhotos: sitePhotos || undefined,
      safetyCheckItems: safetyCheckItems || undefined,
      safetyChecklists: safetyChecklists || undefined,
      safetyIncidents: safetyIncidents || undefined,
      ppeIssuance: ppeIssuance || undefined,
      cubeTests: cubeTests || undefined,
      materialTests: materialTests || undefined,
      ncrReports: ncrReports || undefined,
    };
  } catch (err) {
    console.error('[SiteOps Sync] Error fetching state from Supabase:', err);
    return null;
  }
}
