export type ShiftStatus = 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';

export interface ContractorShiftRecord {
  id: number;
  contractorId: number;
  contractorName: string;
  trade: string;
  reportDate: string; // YYYY-MM-DD or DD/MM/YYYY
  shiftStartTime: string; // HH:MM AM/PM
  shiftEndTime?: string; // HH:MM AM/PM
  workerCount: number;
  regularHours?: number;
  overtimeHours?: number;
  workLocation?: string; // Floor / Wing / Flat
  workDescription?: string;
  status: ShiftStatus;
  loggedBy?: string;
  createdAt: string;
  completedAt?: string;
}

export interface WorkerPunchEntry {
  id: string;
  shiftRecordId: number;
  workerName: string;
  contractorName: string;
  punchInTime: string;
  punchOutTime?: string;
  overtimeHours?: number;
  notes?: string;
}
