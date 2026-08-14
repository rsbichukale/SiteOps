export interface ContractorMaterialAllocation {
  id: number;
  contractorId: number;
  contractorName: string;
  materialCategoryId: number;
  itemName: string;
  quantityIssued: number;
  unit: string;
  floorLocation: string; // e.g. B-Building 4th Floor Flat 402
  purpose: string;
  issuedBy: string;
  dateIssued: string;
  createdAt: string;
}

export interface MaterialDamageDeduction {
  id: number;
  contractorId: number;
  contractorName: string;
  trade: string;
  materialName: string;
  quantity: number;
  unit: string;
  deductionAmount: number; // Amount in ₹
  reason: string;
  photoUrl?: string;
  dateLogged: string;
  createdAt: string;
}

export interface ContractorProgressRecord {
  id: number;
  contractorId: number;
  contractorName: string;
  trade: string;
  workLocation: string;
  targetQuantity: number;
  actualQuantity: number;
  unit: string;
  notes?: string;
  dateLogged: string;
  createdAt: string;
}
