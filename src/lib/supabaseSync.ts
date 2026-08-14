import { supabase, isSupabaseConfigured } from './supabaseClient';

function camelToSnakeKey(key: string): string {
  return key.replace(/([A-Z])/g, '_$1').toLowerCase();
}

function snakeToCamelKey(key: string): string {
  return key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
}

export function mapToSnakeCase(obj: unknown): any {
  if (Array.isArray(obj)) return obj.map(mapToSnakeCase);
  if (obj !== null && typeof obj === 'object' && !(obj instanceof Date)) {
    return Object.fromEntries(
      Object.entries(obj).map(([key, value]) => [camelToSnakeKey(key), mapToSnakeCase(value)])
    );
  }
  return obj;
}

export function mapToCamelCase(obj: unknown): any {
  if (Array.isArray(obj)) return obj.map(mapToCamelCase);
  if (obj !== null && typeof obj === 'object' && !(obj instanceof Date)) {
    return Object.fromEntries(
      Object.entries(obj).map(([key, value]) => [snakeToCamelKey(key), mapToCamelCase(value)])
    );
  }
  return obj;
}

const TABLES = {
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
} as const;

export type PersistedStateKey = keyof typeof TABLES;

const PROJECT_SCOPED_KEYS = (Object.keys(TABLES) as PersistedStateKey[])
  .filter(key => key !== 'sites');

export interface SupabaseSaveResult {
  success: boolean;
  skipped: boolean;
  errors: Array<{ stateKey: string; table: string; message: string }>;
}

export interface SupabaseFetchResult {
  state: Partial<Record<PersistedStateKey, any[]>>;
  activeSiteId: number | null;
}

async function requireAuthenticatedUser() {
  if (!isSupabaseConfigured || !supabase) {
    throw new Error('Supabase environment variables are not configured.');
  }

  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) {
    throw new Error('Sign in is required before SiteOps data can be accessed.');
  }

  return data.user;
}

export async function fetchStateFromSupabase(
  preferredSiteId: number | null = null
): Promise<SupabaseFetchResult | null> {
  if (!isSupabaseConfigured || !supabase) return null;
  await requireAuthenticatedUser();
  const client = supabase;

  const { data: rawSites, error: sitesError } = await client
    .from(TABLES.sites)
    .select('*')
    .order('id', { ascending: true });

  if (sitesError) {
    throw new Error(`Supabase load failed. sites: ${sitesError.message}`);
  }

  const sites = mapToCamelCase(rawSites ?? []);
  const activeSiteId = sites.some((site: { id: number }) => site.id === preferredSiteId)
    ? preferredSiteId
    : sites[0]?.id ?? null;

  const state: Partial<Record<PersistedStateKey, any[]>> = { sites };
  if (activeSiteId === null) return { state, activeSiteId };

  const results = await Promise.all(
    PROJECT_SCOPED_KEYS.map(async stateKey => {
      const table = TABLES[stateKey];
      const { data, error } = await client
        .from(table)
        .select('*')
        .eq('site_id', activeSiteId)
        .order('id', { ascending: false });
      return { stateKey, table, data, error };
    })
  );

  const failures = results.filter(result => result.error);
  if (failures.length > 0) {
    const detail = failures
      .map(({ table, error }) => `${table}: ${error?.message}${error?.hint ? ` (${error.hint})` : ''}`)
      .join('; ');
    throw new Error(`Supabase load failed. ${detail}`);
  }

  for (const { stateKey, data } of results) {
    state[stateKey] = mapToCamelCase(data ?? []);
  }

  return { state, activeSiteId };
}

export async function saveStateToSupabase(
  partialState: Record<string, unknown>,
  deletedIds: Partial<Record<PersistedStateKey, Array<string | number>>> = {},
  activeSiteId: number | null = null
): Promise<SupabaseSaveResult> {
  if (!isSupabaseConfigured || !supabase) {
    return {
      success: false,
      skipped: true,
      errors: [{ stateKey: 'configuration', table: '-', message: 'Supabase environment variables are not configured.' }],
    };
  }

  try {
    await requireAuthenticatedUser();
  } catch (error) {
    return {
      success: false,
      skipped: false,
      errors: [{ stateKey: 'authentication', table: '-', message: error instanceof Error ? error.message : String(error) }],
    };
  }

  const errors: SupabaseSaveResult['errors'] = [];
  const pendingState: Record<string, unknown> = Object.fromEntries(
    Object.entries(partialState).map(([key, value]) => [key, Array.isArray(value) ? [...value] : value])
  );

  if (activeSiteId !== null) {
    const atomicPairs = [
      {
        firstKey: 'equipmentPayments', secondKey: 'expenses', sourceKey: 'sourceEquipmentPaymentId',
        rpc: 'save_machinery_payment_with_expense', firstArg: 'p_payment', secondArg: 'p_expense',
      },
      {
        firstKey: 'materialInward', secondKey: 'ncrReports', sourceKey: 'sourceMaterialInwardId',
        rpc: 'save_material_inward_with_ncr', firstArg: 'p_inward', secondArg: 'p_ncr',
      },
      {
        firstKey: 'materialIssued', secondKey: 'contractorMaterialAllocations', sourceKey: 'sourceMaterialIssueId',
        rpc: 'save_material_issue_with_allocation', firstArg: 'p_issue', secondArg: 'p_allocation',
      },
    ] as const;

    for (const pair of atomicPairs) {
      const firstItems = Array.isArray(pendingState[pair.firstKey])
        ? pendingState[pair.firstKey] as Array<Record<string, unknown>> : [];
      const secondItems = Array.isArray(pendingState[pair.secondKey])
        ? pendingState[pair.secondKey] as Array<Record<string, unknown>> : [];

      for (const first of [...firstItems]) {
        const second = secondItems.find(item => item[pair.sourceKey] === first.id);
        if (!second) continue;
        const { error } = await supabase.rpc(pair.rpc, {
          p_site_id: activeSiteId,
          [pair.firstArg]: mapToSnakeCase(first),
          [pair.secondArg]: mapToSnakeCase(second),
        });
        if (error) {
          return { success: false, skipped: false, errors: [{ stateKey: `${pair.firstKey},${pair.secondKey}`, table: pair.rpc, message: error.message }] };
        }
        pendingState[pair.firstKey] = (pendingState[pair.firstKey] as Array<Record<string, unknown>>).filter(item => item.id !== first.id);
        pendingState[pair.secondKey] = (pendingState[pair.secondKey] as Array<Record<string, unknown>>).filter(item => item.id !== second.id);
      }
    }
  }

  const stateKeys = new Set<PersistedStateKey>();
  for (const key of Object.keys(pendingState)) {
    if (key in TABLES) stateKeys.add(key as PersistedStateKey);
  }
  for (const key of Object.keys(deletedIds)) stateKeys.add(key as PersistedStateKey);

  for (const stateKey of Array.from(stateKeys)) {
    const table = TABLES[stateKey];
    const isProjectScoped = stateKey !== 'sites';
    if (isProjectScoped && activeSiteId === null) {
      errors.push({ stateKey, table, message: 'Select a project before saving operational data.' });
      continue;
    }

    const value = pendingState[stateKey];
    const items = Array.isArray(value) ? value as Array<Record<string, unknown>> : [];
    if (items.length > 0) {
      const payload = mapToSnakeCase(
        isProjectScoped
          ? items.map(item => ({ ...item, siteId: activeSiteId }))
          : items
      );
      const { error } = await supabase.from(table).upsert(payload, { onConflict: 'id' });
      if (error) {
        errors.push({ stateKey, table, message: error.message });
        continue;
      }
    }

    const idsToDelete = deletedIds[stateKey] ?? [];
    if (idsToDelete.length > 0) {
      let deleteQuery = supabase.from(table).delete().in('id', idsToDelete);
      if (isProjectScoped) deleteQuery = deleteQuery.eq('site_id', activeSiteId!);
      const { error } = await deleteQuery;
      if (error) errors.push({ stateKey, table, message: error.message });
    }
  }

  return { success: errors.length === 0, skipped: false, errors };
}
