import {
  MaterialCategory, Supplier, MaterialInward, MaterialIssued, MaterialWastage,
  ExpenseCategory, Expense, FundRequisition,
  EquipmentTypeMaster, Equipment, EquipmentUsage, EquipmentPayment,
  Visitor, Meeting, SitePhoto,
  SafetyCheckItem, SafetyChecklistRecord, SafetyIncident, PPEIssuance,
  CubeTest, MaterialTest, NCRReport, Site, AppUser, DailyProgressReport
} from '../types';

import {
  INITIAL_SITES, INITIAL_MATERIAL_CATEGORIES, INITIAL_EXPENSE_CATEGORIES,
  INITIAL_EQUIPMENT_TYPES, INITIAL_SAFETY_CHECK_ITEMS
} from './seedMasters';

import { ContractorMaster } from '../types';

const LOCAL_STORAGE_KEY = 'siteops_app_state_v1';

export const INITIAL_CONTRACTORS_MASTER: ContractorMaster[] = [
  { id: 1, name: 'Suraj Chauhan', trade: 'Tiles', phone: '+91 98220 12345', status: 'ACTIVE', notes: 'Window and door frame, kitchen bottom & top, wall tiles' },
  { id: 2, name: 'Mohan Khetawat', trade: 'Waterproofing', phone: '+91 98220 67890', status: 'ACTIVE', notes: 'Terrace & slab waterproofing' },
  { id: 3, name: 'Naresh Khetawat', trade: 'Waterproofing', phone: '+91 98220 54321', status: 'ACTIVE', notes: 'Toilet, balcony & shaft waterproofing' },
];

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

  activeSiteId: number;
  currentUser: AppUser | null;
}

let currentState: SiteOpsState | null = null;
const listeners: Array<() => void> = [];

export function getAppState(): SiteOpsState {
  if (!currentState) {
    currentState = loadInitialState();
  }
  return currentState;
}

export const DEFAULT_SAMPLE_REPORT: DailyProgressReport = {
  id: 1,
  reportDate: '13/08/2026',
  buildingName: 'B-Building Work Progress',
  formatStyle: 'PROFESSIONAL',
  carpenterCount: 0,
  fitterCount: 0,
  electricalCount: 0,
  plumberCount: 0,
  coreCuttingCount: 0,
  fabricationCount: 0,
  surajChauhanTilesCount: 0,
  surajChauhanNotes: 'Window and door frame and kitchen bottom & top laying & kitchen wall tiles laying',
  mohanKhetawatWaterproofingCount: 0,
  mohanKhetawatNotes: 'Water proofing',
  nareshKhetawatWaterproofingCount: 0,
  nareshKhetawatNotes: 'Water proofing',
  bathkam: {
    plasterWork: 0,
    materialShifting: 0,
    brickWork: 0,
    baiLabour: 0,
    breakerWork: 0,
  },
  departmentStaffCount: 0,
  departmentLabourCount: 0,
  departmentTasksNotes: 'Slab, column, brick wall & plaster curing & cleaning waste material',
  cementStock: [
    { brandName: 'Birla Super Cement', type: 'OPC', bags: 80 },
    { brandName: 'JK Super Cement', type: 'PPC', bags: 100 },
    { brandName: 'Sanla', type: '', bags: 45 },
    { brandName: 'Ambuja Cement', type: 'OPC', bags: 0 },
  ],
  beforePhotos: [],
  afterPhotos: [],
  createdByName: 'Site Engineer',
  createdAt: new Date().toISOString()
};

function loadInitialState(): SiteOpsState {
  if (typeof window !== 'undefined') {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          ...parsed,
          sites: parsed.sites?.length ? parsed.sites : INITIAL_SITES,
          contractorsMaster: parsed.contractorsMaster?.length ? parsed.contractorsMaster : INITIAL_CONTRACTORS_MASTER,
          materialCategories: parsed.materialCategories?.length ? parsed.materialCategories : INITIAL_MATERIAL_CATEGORIES,
          expenseCategories: parsed.expenseCategories?.length ? parsed.expenseCategories : INITIAL_EXPENSE_CATEGORIES,
          equipmentTypes: parsed.equipmentTypes?.length ? parsed.equipmentTypes : INITIAL_EQUIPMENT_TYPES,
          safetyCheckItems: parsed.safetyCheckItems?.length ? parsed.safetyCheckItems : INITIAL_SAFETY_CHECK_ITEMS,
          suppliers: parsed.suppliers || [],
          materialInward: parsed.materialInward || [],
          materialIssued: parsed.materialIssued || [],
          materialWastage: parsed.materialWastage || [],
          expenses: parsed.expenses || [],
          fundRequisitions: parsed.fundRequisitions || [],
          equipment: parsed.equipment || [],
          equipmentUsage: parsed.equipmentUsage || [],
          equipmentPayments: parsed.equipmentPayments || [],
          visitors: parsed.visitors || [],
          meetings: parsed.meetings || [],
          sitePhotos: parsed.sitePhotos || [],
          safetyChecklists: parsed.safetyChecklists || [],
          safetyIncidents: parsed.safetyIncidents || [],
          ppeIssuance: parsed.ppeIssuance || [],
          cubeTests: parsed.cubeTests || [],
          materialTests: parsed.materialTests || [],
          ncrReports: parsed.ncrReports || [],
          dailyReports: parsed.dailyReports?.length ? parsed.dailyReports : [DEFAULT_SAMPLE_REPORT],
          activeSiteId: parsed.activeSiteId || 1,
          currentUser: parsed.currentUser || {
            id: 1,
            username: 'admin',
            name: 'Site Manager',
            role: 'admin',
            email: 'admin@siteops.com'
          }
        };
      }
    } catch (e) {
      console.error('[SiteOps] Error loading state from localStorage:', e);
    }
  }

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
  currentState = { ...current, ...newState };
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(currentState));
    } catch (e) {
      console.error('[SiteOps] Error saving state to localStorage:', e);
    }
  }
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

    const issued = state.materialIssued
      .filter(i => i.materialCategoryId === cat.id)
      .reduce((sum, i) => sum + i.quantityIssued, 0);

    const wastage = state.materialWastage
      .filter(w => w.materialCategoryId === cat.id)
      .reduce((sum, w) => sum + w.quantity, 0);

    const currentStock = inward - issued - wastage;

    summary[cat.id] = {
      category: cat,
      totalInward: inward,
      totalIssued: issued,
      totalWastage: wastage,
      currentStock,
      unit: cat.defaultUnit,
      isLowStock: currentStock <= cat.lowStockThreshold
    };
  });

  return summary;
}

// ==========================================
// WHATSAPP REPORT GENERATOR HELPER (Format 1)
// ==========================================
export function generateWhatsAppReportText(report: DailyProgressReport): string {
  const pad = (n: number) => (n < 10 ? `0${n}` : `${n}`);
  
  const bathkamTotal = 
    (report.bathkam?.plasterWork || 0) + 
    (report.bathkam?.materialShifting || 0) + 
    (report.bathkam?.brickWork || 0) + 
    (report.bathkam?.baiLabour || 0);

  const customTradesTotal = (report.customTrades || []).reduce((sum, ct) => sum + (ct.count || 0), 0);

  const totalManpower = 
    (report.carpenterCount || 0) +
    (report.fitterCount || 0) +
    (report.electricalCount || 0) +
    (report.surajChauhanTilesCount || 0) +
    (report.mohanKhetawatWaterproofingCount || 0) +
    (report.nareshKhetawatWaterproofingCount || 0) +
    bathkamTotal +
    (report.plumberCount || 0) +
    (report.coreCuttingCount || 0) +
    (report.departmentStaffCount || 0) +
    (report.departmentLabourCount || 0) +
    (report.bathkam?.breakerWork || 0) +
    (report.fabricationCount || 0) +
    customTradesTotal;

  const cementLines = (report.cementStock || []).map(c => 
    `• ${c.brandName}${c.type ? ` (${c.type})` : ''} = *${pad(c.bags || 0)} Bags*`
  ).join('\n');

  const getNoteLine = (note?: string) => (note ? `\n  └ _(${note})_` : '');

  const customTradeLines = (report.customTrades || []).map(ct => 
    `• ${ct.tradeName}${ct.contractorName ? ` (${ct.contractorName})` : ''} = *${pad(ct.count || 0)}*${getNoteLine(ct.notes)}`
  ).join('\n\n');

  return `🏗️ *${report.buildingName || 'B-Building Work Progress'}*

📅 *Date:* ${report.reportDate || '13/08/2026'}

━━━━━━━━━━━━━━━━━━━━━
👷‍♂️ *TOTAL MANPOWER ON SITE: ${pad(totalManpower)}*

🛠️ *Skilled Trades & Contractors:*
• Carpenter = *${pad(report.carpenterCount || 0)}*${getNoteLine(report.carpenterNotes)}
• Fitter = *${pad(report.fitterCount || 0)}*${getNoteLine(report.fitterNotes)}

• Electrical = *${pad(report.electricalCount || 0)}*${getNoteLine(report.electricalNotes)}

• Tiles (Suraj Chauhan) = *${pad(report.surajChauhanTilesCount || 0)}*${getNoteLine(report.surajChauhanNotes || 'window and door frame and kitchen bottom & top laying & kitchen wall tiles laying')}

• Waterproofing (Mohan Khetawat) = *${pad(report.mohanKhetawatWaterproofingCount || 0)}*${getNoteLine(report.mohanKhetawatNotes || 'water proofing')}

• Bathkam = *${pad(bathkamTotal)}*
  ├ ${pad(report.bathkam?.plasterWork || 0)} - Plaster Work
  ├ ${pad(report.bathkam?.materialShifting || 0)} - Material Shifting
  ├ ${pad(report.bathkam?.brickWork || 0)} - Brick Work
  └ ${pad(report.bathkam?.baiLabour || 0)} - Bai (Female Labour)

• Plumber = *${pad(report.plumberCount || 0)}*${getNoteLine(report.plumberNotes)}
• Waterproofing (Naresh Khetawat) = *${pad(report.nareshKhetawatWaterproofingCount || 0)}*${getNoteLine(report.nareshKhetawatNotes || 'water proofing')}
• Core Cutting = *${pad(report.coreCuttingCount || 0)}*${getNoteLine(report.coreCuttingNotes)}

• Fabrication = *${pad(report.fabricationCount || 0)}*${getNoteLine(report.fabricationNotes)}
${customTradeLines ? `\n${customTradeLines}` : ''}

👔 *Department & Staff:*
• Department Staff = *${pad(report.departmentStaffCount || 0)}*

• Department Labour = *${pad(report.departmentLabourCount || 0)}*${getNoteLine(report.departmentTasksNotes || 'slab, column, brick wall & plaster curing & cleaning waste material')}
• Bathkam (Breaker Work) = *${pad(report.bathkam?.breakerWork || 0)}*${getNoteLine(report.bathkamBreakerNotes || 'breaker work')}

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

