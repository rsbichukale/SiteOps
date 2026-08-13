export type ModuleTab = 'dashboard' | 'material' | 'cash' | 'machinery' | 'visitor' | 'safety' | 'quality' | 'whatsappReport';

// ==========================================
// 1. MATERIAL & INVENTORY MANAGEMENT
// ==========================================
export interface MaterialCategory {
  id: number;
  name: string;
  code: string;
  defaultUnit: string;
  iconName?: string;
  lowStockThreshold: number;
}

export interface Supplier {
  id: number;
  name: string;
  contactPerson?: string;
  phone?: string;
  email?: string;
  materialCategories?: string[];
  gstNumber?: string;
  address?: string;
  status: 'ACTIVE' | 'INACTIVE';
}

export interface MaterialInward {
  id: number;
  materialCategoryId: number;
  itemName: string;
  supplierId?: number;
  supplierName?: string;
  quantityReceived: number;
  quantityOrdered?: number;
  unit: string;
  ratePerUnit: number;
  totalAmount: number;
  challanNumber?: string;
  challanPhotoUrl?: string;
  vehicleNumber?: string;
  qualityCheckPassed: boolean;
  qualityNotes?: string;
  receivedBy?: string;
  extraExpenses: number; // Hamali, unloading, etc.
  extraExpensesDescription?: string;
  dateReceived: string;
}

export interface MaterialIssued {
  id: number;
  materialCategoryId: number;
  itemName: string;
  quantityIssued: number;
  unit: string;
  issuedTo: string; // Contractor / Floor / Purpose
  issuedBy?: string;
  dateIssued: string;
}

export interface MaterialWastage {
  id: number;
  materialCategoryId: number;
  itemName: string;
  quantity: number;
  unit: string;
  reason: 'DAMAGED' | 'RETURNED_TO_SUPPLIER' | 'EXCESS' | 'THEFT' | 'OTHER';
  notes?: string;
  dateLogged: string;
}

// ==========================================
// 2. PETTY CASH & EXPENSE TRACKER
// ==========================================
export interface ExpenseCategory {
  id: number;
  name: string;
  iconName?: string;
}

export interface Expense {
  id: number;
  category: string;
  description: string;
  amount: number;
  paidTo?: string;
  paymentMode: 'CASH' | 'UPI' | 'BANK_TRANSFER' | 'OTHER';
  receiptPhotoUrl?: string;
  dateLogged: string;
}

export interface FundRequisition {
  id: number;
  amountRequested: number;
  purpose: string;
  status: 'PENDING' | 'APPROVED' | 'RECEIVED' | 'REJECTED';
  amountReceived?: number;
  dateRequested: string;
  dateReceived?: string;
}

// ==========================================
// 3. MACHINERY & EQUIPMENT LOG
// ==========================================
export interface EquipmentTypeMaster {
  id: number;
  name: string;
  category: string;
}

export interface Equipment {
  id: number;
  equipmentType: string;
  name: string;
  isRented: boolean;
  rentalCompany?: string;
  dailyRate?: number;
  hourlyRate?: number;
  operatorName?: string;
  startDate?: string;
  status: 'ACTIVE' | 'IDLE' | 'UNDER_REPAIR' | 'REMOVED';
}

export interface EquipmentUsage {
  id: number;
  equipmentId: number;
  dateLogged: string;
  hoursOperated: number;
  fuelLiters: number;
  workDescription: string;
  operator?: string;
  breakdownNotes?: string;
}

export interface EquipmentPayment {
  id: number;
  equipmentId: number;
  amountPaid: number;
  paymentDate: string;
  paymentMode: string;
  receiptPhotoUrl?: string;
  notes?: string;
}

// ==========================================
// 4. VISITOR & MEETING LOG
// ==========================================
export interface Visitor {
  id: number;
  visitorName: string;
  companyRole?: string;
  purpose: 'Site Inspection' | 'Client Visit' | 'Vendor Meeting' | 'Government Inspector' | 'Consultant' | 'Other';
  entryTime: string;
  exitTime?: string;
  accompaniedBy?: string;
  photoUrl?: string;
  notes?: string;
}

export interface ActionItem {
  id: string;
  task: string;
  assignedTo: string;
  deadline: string;
  completed: boolean;
}

export interface Meeting {
  id: number;
  title: string;
  meetingDate: string;
  attendees: string[];
  agenda: string;
  decisions: string;
  actionItems: ActionItem[];
  photos?: string[];
}

export interface SitePhoto {
  id: number;
  caption: string;
  photoUrl: string;
  category: 'MILESTONE' | 'PROGRESS' | 'DRONE' | 'BEFORE_AFTER';
  dateTaken: string;
}

// ==========================================
// 5. SAFETY & COMPLIANCE
// ==========================================
export interface SafetyCheckItem {
  id: number;
  itemText: string;
  category: string;
}

export interface SafetyChecklistRecord {
  id: number;
  dateLogged: string;
  checks: {
    checkItemId: number;
    itemText: string;
    passed: boolean;
    notes?: string;
    photoUrl?: string;
  }[];
  overallScore: number;
  totalChecks: number;
  inspectorName: string;
}

export interface SafetyIncident {
  id: number;
  dateTime: string;
  severity: 'MINOR' | 'MAJOR' | 'FATAL' | 'NEAR_MISS';
  injuredPerson?: string;
  injuredAge?: number;
  contractorName?: string;
  description: string;
  bodyPart?: string;
  firstAidGiven: boolean;
  firstAidDescription?: string;
  hospitalRequired: boolean;
  photos?: string[];
  correctiveAction?: string;
  reportedTo?: string;
  status: 'OPEN' | 'INVESTIGATING' | 'CLOSED';
}

export interface PPEIssuance {
  id: number;
  workerName: string;
  contractorName?: string;
  item: 'HELMET' | 'BOOTS' | 'HARNESS' | 'GLOVES' | 'VEST' | 'SAFETY_GLASSES';
  quantity: number;
  dateIssued: string;
  returned: boolean;
  dateReturned?: string;
}

// ==========================================
// 6. QUALITY CONTROL & TESTING
// ==========================================
export interface CubeTest {
  id: number;
  castingDate: string;
  grade: 'M20' | 'M25' | 'M30' | 'M35' | 'M40';
  location: string;
  numCubes: number;
  result7Day?: number; // N/mm²
  result28Day?: number; // N/mm²
  status: 'PASS' | 'FAIL' | 'PENDING';
  labName?: string;
  reportPhotoUrl?: string;
}

export interface MaterialTest {
  id: number;
  material: string;
  testType: string;
  sampleSource: string;
  testResult: string;
  passFail: 'PASS' | 'FAIL';
  certificatePhotoUrl?: string;
  dateTested: string;
}

export interface NCRReport {
  id: number;
  location: string;
  description: string;
  isCodeReference?: string;
  photos?: string[];
  assignedTo?: string;
  status: 'OPEN' | 'IN_RECTIFICATION' | 'CLOSED';
  rectificationPhotoUrl?: string;
  createdAt: string;
  closedAt?: string;
}

// ==========================================
// SITE & APP USERS
// ==========================================
export interface Site {
  id: number;
  name: string;
}

export interface AppUser {
  id: number | string;
  username: string;
  name: string;
  role: 'admin' | 'engineer' | 'supervisor';
  email?: string;
  phone?: string;
}

// ==========================================
// 7. DAILY WHATSAPP PROGRESS REPORT (DPR)
// ==========================================
export interface BathkamBreakdown {
  plasterWork: number;
  materialShifting: number;
  brickWork: number;
  baiLabour: number;
  breakerWork: number;
  otherNotes?: string;
}

export interface TradeManpowerEntry {
  id: string;
  title: string;
  category: 'SKILLED' | 'SPECIALIZED' | 'DEPARTMENT';
  count: number;
  workDescription?: string;
}

export interface CementStockEntry {
  brandName: string;
  type: string; // e.g. OPC, PPC
  bags: number;
}

export interface CustomTradeEntry {
  id: string;
  tradeName: string;
  contractorName?: string;
  count: number;
  notes?: string;
}

export interface ReportWorkPhoto {
  id: string;
  url: string; // Base64 data URL or uploaded URL
  caption: string;
  category: 'BEFORE' | 'AFTER';
  tradeOrArea?: string;
  createdAt: string;
}

export interface WorkProgressPhotoSet {
  id: string;
  workTypeOrTrade: string; // e.g. "Tiles (Suraj Chauhan)", "Waterproofing (Mohan Khetawat)", "Painting", "Additional Work: False Ceiling"
  workAreaLocation?: string; // e.g. "4th Floor Flat 402 Bathroom", "Terrace Slab"
  beforePhotoUrl?: string;
  beforeCaption?: string;
  afterPhotoUrl?: string;
  afterCaption?: string;
  createdAt: string;
}

export interface MaterialDamageEntry {
  id: string;
  contractorOrWorkerName: string;
  tradeOrAgency: string;
  materialName: string;
  damageAmount: number; // Deduction amount in Rupees (₹)
  description: string;
  photos: string[]; // Base64 image URLs
  createdAt: string;
}

export interface WorkerAttendanceRecord {
  id: string;
  workerName: string;
  tradeOrRole: string;
  contractorName?: string;
  status: 'PRESENT' | 'HALF_DAY' | 'ABSENT' | 'OVERTIME';
  hoursWorked?: number;
  dailyWageRate?: number;
}

export interface DailyProgressReport {
  id: number;
  reportDate: string; // YYYY-MM-DD or DD/MM/YYYY
  buildingName: string;
  formatStyle: 'PROFESSIONAL' | 'MINIMALIST';
  
  // Trades & Narrations
  carpenterCount: number;
  carpenterNotes?: string;
  fitterCount: number;
  fitterNotes?: string;
  electricalCount: number;
  electricalNotes?: string;
  plumberCount: number;
  plumberNotes?: string;
  coreCuttingCount: number;
  coreCuttingNotes?: string;
  fabricationCount: number;
  fabricationNotes?: string;
  
  // Specialized Agencies
  surajChauhanTilesCount: number;
  surajChauhanNotes?: string;
  mohanKhetawatWaterproofingCount: number;
  mohanKhetawatNotes?: string;
  nareshKhetawatWaterproofingCount: number;
  nareshKhetawatNotes?: string;
  
  // Dynamic Custom Trades
  customTrades?: CustomTradeEntry[];
  
  // Bathkam Breakdown
  bathkam: BathkamBreakdown;
  bathkamBreakerNotes?: string;
  
  // Department
  departmentStaffCount: number;
  departmentLabourCount: number;
  departmentTasksNotes?: string;
  
  // Cement Stock
  cementStock: CementStockEntry[];
  
  // Work Progress Photos (Before & After)
  beforePhotos?: ReportWorkPhoto[];
  afterPhotos?: ReportWorkPhoto[];

  // Trade-wise & Additional Work Photo Sets
  workPhotoSets?: WorkProgressPhotoSet[];

  // Material Damage & Bill Deductions
  damageDeductions?: MaterialDamageEntry[];

  // Individual Worker Attendance Logs
  workerAttendanceLogs?: WorkerAttendanceRecord[];

  createdByName?: string;
  createdAt?: string;
}

