import {
  MaterialCategory, Supplier, MaterialInward, MaterialIssued, MaterialWastage,
  ExpenseCategory, Expense, FundRequisition,
  EquipmentTypeMaster, Equipment, EquipmentUsage, EquipmentPayment,
  Visitor, Meeting, SitePhoto,
  SafetyCheckItem, SafetyChecklistRecord, SafetyIncident, PPEIssuance,
  CubeTest, MaterialTest, NCRReport, Site, AppUser, DailyProgressReport, ContractorMaster,
  ContractorShiftRecord, ContractorMaterialAllocation, MaterialDamageDeduction
} from '../types';

import {
  INITIAL_SITES, INITIAL_MATERIAL_CATEGORIES, INITIAL_EXPENSE_CATEGORIES,
  INITIAL_EQUIPMENT_TYPES, INITIAL_SAFETY_CHECK_ITEMS
} from './seedMasters';

import { saveStateToSupabase, fetchStateFromSupabase } from './supabaseSync';

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

  activeSiteId: number;
  currentUser: AppUser | null;
}

let currentState: SiteOpsState | null = null;
const listeners: Array<() => void> = [];

export function getAppState(): SiteOpsState {
  if (!currentState) {
    currentState = getInitialDefaultState();
  }
  return currentState;
}

export async function initializeAppStateFromSupabase(): Promise<SiteOpsState> {
  const remoteState = await fetchStateFromSupabase();
  if (remoteState) {
    const current = getAppState();
    currentState = {
      ...current,
      sites: remoteState.sites || current.sites,
      contractorsMaster: remoteState.contractorsMaster || current.contractorsMaster,
      materialCategories: remoteState.materialCategories || current.materialCategories,
      suppliers: remoteState.suppliers || current.suppliers,
      materialInward: remoteState.materialInward || current.materialInward,
      materialIssued: remoteState.materialIssued || current.materialIssued,
      materialWastage: remoteState.materialWastage || current.materialWastage,
      expenseCategories: remoteState.expenseCategories || current.expenseCategories,
      expenses: remoteState.expenses || current.expenses,
      fundRequisitions: remoteState.fundRequisitions || current.fundRequisitions,
      equipmentTypes: remoteState.equipmentTypes || current.equipmentTypes,
      equipment: remoteState.equipment || current.equipment,
      equipmentUsage: remoteState.equipmentUsage || current.equipmentUsage,
      equipmentPayments: remoteState.equipmentPayments || current.equipmentPayments,
      visitors: remoteState.visitors || current.visitors,
      meetings: remoteState.meetings || current.meetings,
      sitePhotos: remoteState.sitePhotos || current.sitePhotos,
      safetyCheckItems: remoteState.safetyCheckItems || current.safetyCheckItems,
      safetyChecklists: remoteState.safetyChecklists || current.safetyChecklists,
      safetyIncidents: remoteState.safetyIncidents || current.safetyIncidents,
      ppeIssuance: remoteState.ppeIssuance || current.ppeIssuance,
      cubeTests: remoteState.cubeTests || current.cubeTests,
      materialTests: remoteState.materialTests || current.materialTests,
      ncrReports: remoteState.ncrReports || current.ncrReports,
      dailyReports: remoteState.dailyReports || current.dailyReports,
      contractorShifts: remoteState.contractorShifts || current.contractorShifts,
      contractorMaterialAllocations: remoteState.contractorMaterialAllocations || current.contractorMaterialAllocations,
      materialDamageDeductions: remoteState.materialDamageDeductions || current.materialDamageDeductions,
    };
    notifyListeners();
  }
  return getAppState();
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
    sites: INITIAL_SITES,
    contractorsMaster: INITIAL_CONTRACTORS_MASTER,
    materialCategories: INITIAL_MATERIAL_CATEGORIES,
    suppliers: [],
    materialInward: [],
    materialIssued: [],
    materialWastage: [],
    expenseCategories: INITIAL_EXPENSE_CATEGORIES,
    expenses: [],
    fundRequisitions: [],
    equipmentTypes: INITIAL_EQUIPMENT_TYPES,
    equipment: [],
    equipmentUsage: [],
    equipmentPayments: [],
    visitors: [],
    meetings: [],
    sitePhotos: [],
    safetyCheckItems: INITIAL_SAFETY_CHECK_ITEMS,
    safetyChecklists: [],
    safetyIncidents: [],
    ppeIssuance: [],
    cubeTests: [],
    materialTests: [],
    ncrReports: [],
    dailyReports: [DEFAULT_SAMPLE_REPORT],
    contractorShifts: [],
    contractorMaterialAllocations: [],
    materialDamageDeductions: [],
    activeSiteId: 1,
    currentUser: {
      id: 1,
      username: 'admin',
      name: 'Site Manager',
      role: 'admin',
      email: 'admin@siteops.com'
    }
  };
}

export function saveAppState(newState: Partial<SiteOpsState>) {
  const current = getAppState();
  const cleanedNewState: Partial<SiteOpsState> = {};
  
  // Exclude undefined keys from merging
  for (const key of Object.keys(newState) as Array<keyof SiteOpsState>) {
    if (newState[key] !== undefined) {
      (cleanedNewState as any)[key] = newState[key];
    }
  }

  currentState = { ...current, ...cleanedNewState };

  // Direct save & sync to Supabase Postgres Cloud
  saveStateToSupabase(cleanedNewState).catch(e =>
    console.error('[SiteOps Storage] Direct Supabase save error:', e)
  );

  notifyListeners();
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

export function saveDailyReport(report: DailyProgressReport) {
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
  
  saveAppState({ dailyReports: updatedReports });
}

export function deleteDailyReport(id: number) {
  const state = getAppState();
  const updatedReports = state.dailyReports.filter(r => r.id !== id);
  saveAppState({ dailyReports: updatedReports });
}

// ==========================================
// MASTER DATA MANAGEMENT HELPERS
// ==========================================

export function saveContractor(contractor: ContractorMaster) {
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
  
  saveAppState({ contractorsMaster: updated });
}

export function deleteContractor(id: number) {
  const state = getAppState();
  const updated = state.contractorsMaster.filter(c => c.id !== id);
  saveAppState({ contractorsMaster: updated });
}

export function saveMaterialCategory(cat: MaterialCategory) {
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
  saveAppState({ materialCategories: updated });
}

export function deleteMaterialCategory(id: number) {
  const state = getAppState();
  const updated = state.materialCategories.filter(c => c.id !== id);
  saveAppState({ materialCategories: updated });
}

export function saveExpenseCategory(cat: ExpenseCategory) {
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
  saveAppState({ expenseCategories: updated });
}

export function deleteExpenseCategory(id: number) {
  const state = getAppState();
  const updated = state.expenseCategories.filter(c => c.id !== id);
  saveAppState({ expenseCategories: updated });
}

export function saveEquipmentType(eq: EquipmentTypeMaster) {
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
  saveAppState({ equipmentTypes: updated });
}

export function deleteEquipmentType(id: number) {
  const state = getAppState();
  const updated = state.equipmentTypes.filter(e => e.id !== id);
  saveAppState({ equipmentTypes: updated });
}

export function saveSupplier(supplier: Supplier) {
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
  saveAppState({ suppliers: updated });
}

export function deleteSupplier(id: number) {
  const state = getAppState();
  const updated = state.suppliers.filter(s => s.id !== id);
  saveAppState({ suppliers: updated });
}

export function exportDatabaseBackup(): string {
  const state = getAppState();
  return JSON.stringify(state, null, 2);
}

export function importDatabaseBackup(jsonContent: string): boolean {
  try {
    const parsed = JSON.parse(jsonContent);
    if (typeof parsed === 'object' && parsed !== null) {
      saveAppState(parsed);
      return true;
    }
    return false;
  } catch (err) {
    console.error('Failed to import database backup', err);
    return false;
  }
}

// ==========================================
// CROSS-MODULE AUTOMATION HELPERS
// ==========================================

export function autoCreateDraftNcrFromMaterialInward(inward: MaterialInward) {
  const state = getAppState();
  const newNcr: NCRReport = {
    id: Date.now(),
    location: inward.supplierName ? `GRN Inward - ${inward.supplierName}` : 'Material Receiving Bay',
    description: `[DRAFT NCR - QC Failed] ${inward.itemName} (${inward.quantityReceived} ${inward.unit}). Notes: ${inward.qualityNotes || 'Rejected during receiving inspection.'}`,
    assignedTo: inward.receivedBy || 'Quality Inspector',
    status: 'OPEN',
    createdAt: new Date().toISOString(),
  };

  saveAppState({
    ncrReports: [newNcr, ...(state.ncrReports || [])],
  });
}

export function createDraftExpenseFromMachineryPayment(payment: EquipmentPayment, equipmentName?: string) {
  const state = getAppState();
  let mappedMode: 'CASH' | 'UPI' | 'BANK_TRANSFER' | 'OTHER' = 'CASH';
  if (payment.paymentMode === 'BANK_TRANSFER') mappedMode = 'BANK_TRANSFER';
  else if (payment.paymentMode === 'CHEQUE') mappedMode = 'OTHER';

  const newExpense: Expense = {
    id: Date.now(),
    category: 'Transport & Freight',
    description: `[DRAFT Expense - Pending Approval] Machinery Payment for ${equipmentName || 'Equipment'}. Notes: ${payment.notes || 'Rental Payment'}`,
    amount: payment.amountPaid,
    paidTo: payment.notes || 'Equipment Vendor',
    paymentMode: mappedMode,
    receiptPhotoUrl: payment.receiptPhotoUrl,
    dateLogged: payment.paymentDate || new Date().toISOString().split('T')[0],
  };

  saveAppState({
    expenses: [newExpense, ...(state.expenses || [])],
  });
}
