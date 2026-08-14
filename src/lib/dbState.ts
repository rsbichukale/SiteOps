import {
  MaterialCategory, Supplier, MaterialInward, MaterialIssued, MaterialWastage,
  ExpenseCategory, Expense, FundRequisition,
  EquipmentTypeMaster, Equipment, EquipmentUsage, EquipmentPayment,
  Visitor, Meeting, SitePhoto,
  SafetyCheckItem, SafetyChecklistRecord, SafetyIncident, PPEIssuance,
  CubeTest, MaterialTest, NCRReport, Site, AppUser, DailyProgressReport, ContractorMaster,
  ContractorShiftRecord, ContractorMaterialAllocation, MaterialDamageDeduction
} from '../types';

import { saveStateToSupabase, fetchStateFromSupabase, SupabaseSaveResult, PersistedStateKey } from './supabaseSync';
import { createLocalId } from './ids';

export const INITIAL_CONTRACTORS_MASTER: ContractorMaster[] = [];

export interface SiteOpsState {
  sites: Site[];
  contractorsMaster: ContractorMaster[];
  materialCategories: MaterialCategory[];
  suppliers: Supplier[];
  materialInward: MaterialInward[];
  materialIssued: MaterialIssued[];
  materialWastage: MaterialWastage[];
  
  expenseCategories: ExpenseCategory[];
  expenses: Expense[];
  fundRequisitions: FundRequisition[];
  
  equipmentTypes: EquipmentTypeMaster[];
  equipment: Equipment[];
  equipmentUsage: EquipmentUsage[];
  equipmentPayments: EquipmentPayment[];
  
  visitors: Visitor[];
  meetings: Meeting[];
  sitePhotos: SitePhoto[];
  
  safetyCheckItems: SafetyCheckItem[];
  safetyChecklists: SafetyChecklistRecord[];
  safetyIncidents: SafetyIncident[];
  ppeIssuance: PPEIssuance[];
  
  cubeTests: CubeTest[];
  materialTests: MaterialTest[];
  ncrReports: NCRReport[];
  
  dailyReports: DailyProgressReport[];
  contractorShifts: ContractorShiftRecord[];
  contractorMaterialAllocations: ContractorMaterialAllocation[];
  materialDamageDeductions: MaterialDamageDeduction[];

  activeSiteId: number | null;
  currentUser: AppUser | null;
}

let currentState: SiteOpsState | null = null;
const listeners: Array<() => void> = [];
let initializationPromise: Promise<SiteOpsState> | null = null;
let initializationGeneration = 0;
let saveQueue: Promise<void> = Promise.resolve();

export function getAppState(): SiteOpsState {
  if (!currentState) {
    currentState = getInitialDefaultState();
  }
  return currentState;
}

export function initializeAppStateFromSupabase(force = false): Promise<SiteOpsState> {
  if (initializationPromise && !force) return initializationPromise;

  const generation = ++initializationGeneration;
  const preferredSiteId = getAppState().activeSiteId;
  const request = (async () => {
    const remote = await fetchStateFromSupabase(preferredSiteId);
    if (remote && generation === initializationGeneration) {
      const current = getAppState();
      currentState = {
        ...current,
        ...remote.state,
        activeSiteId: remote.activeSiteId,
        currentUser: current.currentUser,
      } as SiteOpsState;
      notifyListeners();
    }
    return getAppState();
  })();

  const trackedRequest = request.finally(() => {
    if (initializationPromise === trackedRequest) initializationPromise = null;
  });
  initializationPromise = trackedRequest;
  return initializationPromise;
}

export async function selectActiveSite(siteId: number): Promise<SiteOpsState> {
  const state = getAppState();
  if (!state.sites.some(site => site.id === siteId)) throw new Error('You do not have access to that project.');
  currentState = { ...state, activeSiteId: siteId };
  notifyListeners();
  return initializeAppStateFromSupabase(true);
}

export function setAuthenticatedUser(user: AppUser | null) {
  currentState = { ...getAppState(), currentUser: user };
  notifyListeners();
}

export function resetAppState() {
  currentState = getInitialDefaultState();
  initializationPromise = null;
  initializationGeneration += 1;
  notifyListeners();
}

export const DEFAULT_SAMPLE_REPORT: DailyProgressReport = {
  id: 1,
  reportDate: new Date().toLocaleDateString('en-GB'),
  buildingName: 'Main Site Progress',
  formatStyle: 'PROFESSIONAL',
  carpenterCount: 0,
  fitterCount: 0,
  electricalCount: 0,
  plumberCount: 0,
  coreCuttingCount: 0,
  fabricationCount: 0,
  customTrades: [],
  bathkam: {
    plasterWork: 0,
    materialShifting: 0,
    brickWork: 0,
    baiLabour: 0,
    breakerWork: 0,
  },
  departmentStaffCount: 0,
  departmentLabourCount: 0,
  departmentTasksNotes: '',
  cementStock: [],
  beforePhotos: [],
  afterPhotos: [],
  createdByName: 'Site Engineer',
  createdAt: new Date().toISOString()
};

function getInitialDefaultState(): SiteOpsState {
  return {
    sites: [],
    contractorsMaster: INITIAL_CONTRACTORS_MASTER,
    materialCategories: [],
    suppliers: [],
    materialInward: [],
    materialIssued: [],
    materialWastage: [],
    expenseCategories: [],
    expenses: [],
    fundRequisitions: [],
    equipmentTypes: [],
    equipment: [],
    equipmentUsage: [],
    equipmentPayments: [],
    visitors: [],
    meetings: [],
    sitePhotos: [],
    safetyCheckItems: [],
    safetyChecklists: [],
    safetyIncidents: [],
    ppeIssuance: [],
    cubeTests: [],
    materialTests: [],
    ncrReports: [],
    dailyReports: [],
    contractorShifts: [],
    contractorMaterialAllocations: [],
    materialDamageDeductions: [],
    activeSiteId: null,
    currentUser: null
  };
}

export function saveAppState(newState: Partial<SiteOpsState>): Promise<SupabaseSaveResult> {
  const current = getAppState();
  const cleanedNewState: Partial<SiteOpsState> = {};
  const changedRecords: Partial<Record<PersistedStateKey, any[]>> = {};
  const deletedIds: Partial<Record<PersistedStateKey, Array<string | number>>> = {};
  
  // Exclude undefined keys from merging
  for (const key of Object.keys(newState) as Array<keyof SiteOpsState>) {
    if (newState[key] !== undefined) {
      (cleanedNewState as any)[key] = newState[key];
      const previousValue = current[key];
      const nextValue = newState[key];
      if (Array.isArray(previousValue) && Array.isArray(nextValue)) {
        const previousById = new Map(previousValue.map(item => [item?.id, item]));
        const changed = nextValue.filter(item => {
          const previous = previousById.get(item?.id);
          return !previous || JSON.stringify(previous) !== JSON.stringify(item);
        });
        if (changed.length > 0) {
          changedRecords[key as PersistedStateKey] = changed;
        }
        const nextIds = new Set(nextValue.map(item => item?.id));
        const removed = previousValue
          .map(item => item?.id)
          .filter((id): id is number => typeof id === 'number' && !nextIds.has(id));
        if (removed.length > 0) {
          deletedIds[key as PersistedStateKey] = removed;
        }
      }
    }
  }

  currentState = { ...current, ...cleanedNewState };
  notifyListeners();

  if (Object.keys(changedRecords).length === 0 && Object.keys(deletedIds).length === 0) {
    return Promise.resolve({ success: true, skipped: true, errors: [] });
  }

  const activeSiteId = currentState.activeSiteId;
  const operation = saveQueue.then(() => saveStateToSupabase(changedRecords, deletedIds, activeSiteId));
  saveQueue = operation.then(() => undefined, () => undefined);

  return operation.then(result => {
    if (!result.success) {
      console.error('[SiteOps Storage] Supabase save failed:', result.errors);
      const latest = getAppState();
      const rollback: Partial<SiteOpsState> = {};
      for (const key of Object.keys(cleanedNewState) as Array<keyof SiteOpsState>) {
        if (latest[key] === cleanedNewState[key]) (rollback as any)[key] = current[key];
      }
      currentState = { ...latest, ...rollback };
      notifyListeners();
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('siteops:save-error', { detail: result.errors }));
      }
    }
    return result;
  });
}

export function subscribeState(fn: () => void) {
  listeners.push(fn);
  return () => {
    const idx = listeners.indexOf(fn);
    if (idx > -1) listeners.splice(idx, 1);
  };
}

function notifyListeners() {
  listeners.forEach(fn => fn());
}

// ==========================================
// HELPER CALCULATIONS
// ==========================================

export function getStockSummary() {
  const state = getAppState();
  const summary: Record<number, {
    category: MaterialCategory;
    totalInward: number;
    totalIssued: number;
    totalWastage: number;
    currentStock: number;
    unit: string;
    isLowStock: boolean;
  }> = {};

  state.materialCategories.forEach(cat => {
    const inward = state.materialInward
      .filter(i => i.materialCategoryId === cat.id)
      .reduce((sum, i) => sum + i.quantityReceived, 0);

    const grossIssued = state.materialIssued
      .filter(i => i.materialCategoryId === cat.id)
      .reduce((sum, i) => sum + i.quantityIssued, 0);

    const totalReturned = state.materialIssued
      .filter(i => i.materialCategoryId === cat.id)
      .reduce((sum, i) => sum + (i.quantityReturned || 0), 0);

    const netIssued = grossIssued - totalReturned;

    const wastage = state.materialWastage
      .filter(w => w.materialCategoryId === cat.id)
      .reduce((sum, w) => sum + w.quantity, 0);

    const currentStock = inward - netIssued - wastage;

    summary[cat.id] = {
      category: cat,
      totalInward: inward,
      totalIssued: netIssued,
      totalWastage: wastage,
      currentStock,
      unit: cat.defaultUnit,
      isLowStock: currentStock <= cat.lowStockThreshold
    };
  });

  return summary;
}

export function generateWhatsAppReportText(report: DailyProgressReport): string {
  const pad = (n: number) => (n < 10 ? `0${n}` : `${n}`);
  
  const bathkamTotal = 
    (report.bathkam?.plasterWork || 0) + 
    (report.bathkam?.materialShifting || 0) + 
    (report.bathkam?.brickWork || 0) + 
    (report.bathkam?.baiLabour || 0);

  const customTradesTotal = (report.customTrades || []).reduce((sum, ct) => sum + (ct.count || 0), 0);
  const legacyContractorsTotal = 
    (report.surajChauhanTilesCount || 0) +
    (report.mohanKhetawatWaterproofingCount || 0) +
    (report.nareshKhetawatWaterproofingCount || 0);

  const totalManpower = 
    (report.carpenterCount || 0) +
    (report.fitterCount || 0) +
    (report.electricalCount || 0) +
    legacyContractorsTotal +
    bathkamTotal +
    (report.plumberCount || 0) +
    (report.coreCuttingCount || 0) +
    (report.departmentStaffCount || 0) +
    (report.departmentLabourCount || 0) +
    (report.bathkam?.breakerWork || 0) +
    (report.fabricationCount || 0) +
    customTradesTotal;

  const cementLines = (report.cementStock || []).length > 0
    ? (report.cementStock || []).map(c => 
        `• ${c.brandName}${c.type ? ` (${c.type})` : ''} = *${pad(c.bags || 0)} Bags*`
      ).join('\n')
    : '• No stock reported';

  const getNoteLine = (note?: string) => (note ? `\n  └ _(${note})_` : '');

  const customTradeLines = (report.customTrades || []).map(ct => 
    `• ${ct.tradeName}${ct.contractorName ? ` (${ct.contractorName})` : ''} = *${pad(ct.count || 0)}*${getNoteLine(ct.notes)}`
  ).join('\n\n');

  return `🏗️ *${report.buildingName || 'Main Site Progress'}*

📅 *Date:* ${report.reportDate || new Date().toLocaleDateString('en-GB')}

━━━━━━━━━━━━━━━━━━━━━
👷‍♂️ *TOTAL MANPOWER ON SITE: ${pad(totalManpower)}*

🛠️ *Skilled Trades & Contractors:*
• Carpenter = *${pad(report.carpenterCount || 0)}*${getNoteLine(report.carpenterNotes)}
• Steel Fitter = *${pad(report.fitterCount || 0)}*${getNoteLine(report.fitterNotes)}
• Electrical = *${pad(report.electricalCount || 0)}*${getNoteLine(report.electricalNotes)}
• Plumber = *${pad(report.plumberCount || 0)}*${getNoteLine(report.plumberNotes)}
• Bathkam = *${pad(bathkamTotal)}*
  ├ ${pad(report.bathkam?.plasterWork || 0)} - Plaster Work
  ├ ${pad(report.bathkam?.materialShifting || 0)} - Material Shifting
  ├ ${pad(report.bathkam?.brickWork || 0)} - Brick Work
  └ ${pad(report.bathkam?.baiLabour || 0)} - Bai (Female Labour)
${report.coreCuttingCount ? `\n• Core Cutting = *${pad(report.coreCuttingCount)}*${getNoteLine(report.coreCuttingNotes)}` : ''}
${report.fabricationCount ? `\n• Fabrication = *${pad(report.fabricationCount)}*${getNoteLine(report.fabricationNotes)}` : ''}
${customTradeLines ? `\n${customTradeLines}` : ''}

👔 *Department & Staff:*
• Department Staff = *${pad(report.departmentStaffCount || 0)}*
• Department Labour = *${pad(report.departmentLabourCount || 0)}*${getNoteLine(report.departmentTasksNotes)}
• Bathkam (Breaker Work) = *${pad(report.bathkam?.breakerWork || 0)}*${getNoteLine(report.bathkamBreakerNotes)}

━━━━━━━━━━━━━━━━━━━━━
📦 *STOCK CEMENT*

${cementLines}

━━━━━━━━━━━━━━━━━━━━━
✅ *Reported via ConstructTrack SiteOps*`;
}

export function saveDailyReport(report: DailyProgressReport): Promise<SupabaseSaveResult> {
  const state = getAppState();
  const existingIdx = state.dailyReports.findIndex(r => r.id === report.id || r.reportDate === report.reportDate);
  
  let updatedReports: DailyProgressReport[];
  if (existingIdx > -1) {
    updatedReports = [...state.dailyReports];
    updatedReports[existingIdx] = { ...report, id: state.dailyReports[existingIdx].id };
  } else {
    const newId = state.dailyReports.length > 0 ? Math.max(...state.dailyReports.map(r => r.id)) + 1 : 1;
    updatedReports = [{ ...report, id: newId }, ...state.dailyReports];
  }
  
  return saveAppState({ dailyReports: updatedReports });
}

export function deleteDailyReport(id: number): Promise<SupabaseSaveResult> {
  const state = getAppState();
  const updatedReports = state.dailyReports.filter(r => r.id !== id);
  return saveAppState({ dailyReports: updatedReports });
}

// ==========================================
// MASTER DATA MANAGEMENT HELPERS
// ==========================================

export async function saveSite(site: Site): Promise<SupabaseSaveResult> {
  const state = getAppState();
  const previousState = state;
  const existingIndex = state.sites.findIndex(item => item.id === site.id);
  const now = new Date().toISOString();
  let updatedSites: Site[];

  if (existingIndex > -1) {
    updatedSites = [...state.sites];
    updatedSites[existingIndex] = {
      ...state.sites[existingIndex],
      ...site,
      updatedAt: now,
    };
  } else {
    const newId = state.sites.length > 0 ? Math.max(...state.sites.map(item => item.id)) + 1 : 1;
    updatedSites = [{ ...site, id: newId, createdAt: now, updatedAt: now }, ...state.sites];
  }

  const result = await saveAppState({
    sites: updatedSites,
    activeSiteId: state.activeSiteId ?? updatedSites[0]?.id ?? null,
  });

  if (!result.success) {
    currentState = previousState;
    notifyListeners();
  }
  return result;
}

export async function deleteSite(id: number): Promise<SupabaseSaveResult> {
  const state = getAppState();
  const previousState = state;
  const updatedSites = state.sites.filter(site => site.id !== id);
  const activeSiteId = state.activeSiteId === id
    ? updatedSites[0]?.id ?? null
    : state.activeSiteId;
  const result = await saveAppState({ sites: updatedSites, activeSiteId });

  if (!result.success) {
    currentState = previousState;
    notifyListeners();
  }
  return result;
}

export function saveContractor(contractor: ContractorMaster): Promise<SupabaseSaveResult> {
  const state = getAppState();
  const existingIdx = state.contractorsMaster.findIndex(c => c.id === contractor.id);
  
  let updated: ContractorMaster[];
  if (existingIdx > -1) {
    updated = [...state.contractorsMaster];
    updated[existingIdx] = contractor;
  } else {
    const newId = state.contractorsMaster.length > 0 ? Math.max(...state.contractorsMaster.map(c => c.id)) + 1 : 1;
    updated = [{ ...contractor, id: newId }, ...state.contractorsMaster];
  }
  
  return saveAppState({ contractorsMaster: updated });
}

export function deleteContractor(id: number): Promise<SupabaseSaveResult> {
  const state = getAppState();
  const updated = state.contractorsMaster.filter(c => c.id !== id);
  return saveAppState({ contractorsMaster: updated });
}

export function saveMaterialCategory(cat: MaterialCategory): Promise<SupabaseSaveResult> {
  const state = getAppState();
  const existingIdx = state.materialCategories.findIndex(c => c.id === cat.id);
  let updated: MaterialCategory[];
  if (existingIdx > -1) {
    updated = [...state.materialCategories];
    updated[existingIdx] = cat;
  } else {
    const newId = state.materialCategories.length > 0 ? Math.max(...state.materialCategories.map(c => c.id)) + 1 : 1;
    updated = [{ ...cat, id: newId }, ...state.materialCategories];
  }
  return saveAppState({ materialCategories: updated });
}

export function deleteMaterialCategory(id: number): Promise<SupabaseSaveResult> {
  const state = getAppState();
  const updated = state.materialCategories.filter(c => c.id !== id);
  return saveAppState({ materialCategories: updated });
}

export function saveExpenseCategory(cat: ExpenseCategory): Promise<SupabaseSaveResult> {
  const state = getAppState();
  const existingIdx = state.expenseCategories.findIndex(c => c.id === cat.id);
  let updated: ExpenseCategory[];
  if (existingIdx > -1) {
    updated = [...state.expenseCategories];
    updated[existingIdx] = cat;
  } else {
    const newId = state.expenseCategories.length > 0 ? Math.max(...state.expenseCategories.map(c => c.id)) + 1 : 1;
    updated = [{ ...cat, id: newId }, ...state.expenseCategories];
  }
  return saveAppState({ expenseCategories: updated });
}

export function deleteExpenseCategory(id: number): Promise<SupabaseSaveResult> {
  const state = getAppState();
  const updated = state.expenseCategories.filter(c => c.id !== id);
  return saveAppState({ expenseCategories: updated });
}

export function saveEquipmentType(eq: EquipmentTypeMaster): Promise<SupabaseSaveResult> {
  const state = getAppState();
  const existingIdx = state.equipmentTypes.findIndex(e => e.id === eq.id);
  let updated: EquipmentTypeMaster[];
  if (existingIdx > -1) {
    updated = [...state.equipmentTypes];
    updated[existingIdx] = eq;
  } else {
    const newId = state.equipmentTypes.length > 0 ? Math.max(...state.equipmentTypes.map(e => e.id)) + 1 : 1;
    updated = [{ ...eq, id: newId }, ...state.equipmentTypes];
  }
  return saveAppState({ equipmentTypes: updated });
}

export function deleteEquipmentType(id: number): Promise<SupabaseSaveResult> {
  const state = getAppState();
  const updated = state.equipmentTypes.filter(e => e.id !== id);
  return saveAppState({ equipmentTypes: updated });
}

export function saveSupplier(supplier: Supplier): Promise<SupabaseSaveResult> {
  const state = getAppState();
  const existingIdx = state.suppliers.findIndex(s => s.id === supplier.id);
  let updated: Supplier[];
  if (existingIdx > -1) {
    updated = [...state.suppliers];
    updated[existingIdx] = supplier;
  } else {
    const newId = state.suppliers.length > 0 ? Math.max(...state.suppliers.map(s => s.id)) + 1 : 1;
    updated = [{ ...supplier, id: newId }, ...state.suppliers];
  }
  return saveAppState({ suppliers: updated });
}

export function deleteSupplier(id: number): Promise<SupabaseSaveResult> {
  const state = getAppState();
  const updated = state.suppliers.filter(s => s.id !== id);
  return saveAppState({ suppliers: updated });
}

export function exportDatabaseBackup(): string {
  const state = getAppState();
  const { currentUser: _currentUser, sites, activeSiteId, ...projectData } = state;
  return JSON.stringify({
    format: 'constructtrack-siteops',
    version: 1,
    exportedAt: new Date().toISOString(),
    project: sites.find(site => site.id === activeSiteId) ?? null,
    data: projectData,
  }, null, 2);
}

export async function importDatabaseBackup(jsonContent: string): Promise<boolean> {
  try {
    const parsed = JSON.parse(jsonContent);
    if (parsed?.format !== 'constructtrack-siteops' || parsed?.version !== 1 || typeof parsed.data !== 'object' || parsed.data === null) return false;
    const allowedKeys = new Set<PersistedStateKey>([
      'contractorsMaster', 'materialCategories', 'suppliers', 'materialInward', 'materialIssued',
      'materialWastage', 'expenseCategories', 'expenses', 'fundRequisitions', 'equipmentTypes',
      'equipment', 'equipmentUsage', 'equipmentPayments', 'visitors', 'meetings', 'sitePhotos',
      'safetyCheckItems', 'safetyChecklists', 'safetyIncidents', 'ppeIssuance', 'cubeTests',
      'materialTests', 'ncrReports', 'dailyReports', 'contractorShifts',
      'contractorMaterialAllocations', 'materialDamageDeductions',
    ]);
    const safeData: Partial<SiteOpsState> = {};
    for (const [key, value] of Object.entries(parsed.data)) {
      if (!allowedKeys.has(key as PersistedStateKey) || !Array.isArray(value) || value.length > 10_000) return false;
      if (!value.every(item => item && typeof item === 'object' && Number.isSafeInteger(item.id) && item.id > 0)) return false;
      (safeData as any)[key] = value;
    }
    const result = await saveAppState(safeData);
    return result.success;
  } catch (err) {
    console.error('Failed to import database backup', err);
    return false;
  }
}

// ==========================================
// CROSS-MODULE AUTOMATION HELPERS
// ==========================================

export function buildDraftNcrFromMaterialInward(inward: MaterialInward): NCRReport {
  return {
    id: createLocalId(),
    location: inward.supplierName ? `GRN Inward - ${inward.supplierName}` : 'Material Receiving Bay',
    description: `${inward.itemName} (${inward.quantityReceived} ${inward.unit}) failed receiving inspection. Notes: ${inward.qualityNotes || 'Rejected during receiving inspection.'}`,
    assignedTo: inward.receivedBy || 'Quality Inspector',
    status: 'OPEN',
    createdAt: new Date().toISOString(),
    sourceMaterialInwardId: inward.id,
  };
}

export function buildDraftExpenseFromMachineryPayment(payment: EquipmentPayment, equipmentName?: string): Expense {
  let mappedMode: 'CASH' | 'UPI' | 'BANK_TRANSFER' | 'OTHER' = 'CASH';
  if (payment.paymentMode === 'BANK_TRANSFER') mappedMode = 'BANK_TRANSFER';
  else if (payment.paymentMode === 'CHEQUE') mappedMode = 'OTHER';

  return {
    id: createLocalId(),
    category: 'Transport & Freight',
    description: `Machinery payment for ${equipmentName || 'Equipment'}. Notes: ${payment.notes || 'Rental Payment'}`,
    amount: payment.amountPaid,
    paidTo: payment.notes || 'Equipment Vendor',
    paymentMode: mappedMode,
    receiptPhotoUrl: payment.receiptPhotoUrl,
    dateLogged: payment.paymentDate || new Date().toISOString().split('T')[0],
    status: 'PENDING_APPROVAL',
    sourceEquipmentPaymentId: payment.id,
  };
}
