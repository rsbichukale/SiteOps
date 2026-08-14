'use client';

import React, { useState } from 'react';
import {
  Package, Plus, Search, Filter, AlertTriangle, TrendingDown, ArrowDownRight,
  ArrowUpRight, Truck, CheckCircle2, XCircle, FileText, Camera, Calendar, User, DollarSign, RotateCcw, Undo2
} from 'lucide-react';
import { MaterialCategory, Supplier, MaterialInward, MaterialIssued, MaterialWastage, MaterialReturnLog } from '@/types';
import { getAppState, saveAppState, getStockSummary, autoCreateDraftNcrFromMaterialInward } from '@/lib/dbState';

import { useSiteOpsState } from '@/hooks/useSiteOpsState';

export const MaterialModule: React.FC = () => {
  const { state, updateState } = useSiteOpsState();
  const stockSummary = getStockSummary();
  const [activeSubTab, setActiveSubTab] = useState<'stock' | 'inward' | 'issue' | 'wastage' | 'suppliers'>('stock');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<number | 'ALL'>('ALL');

  // Modals
  const [isInwardModalOpen, setIsInwardModalOpen] = useState(false);
  const [isIssueModalOpen, setIsIssueModalOpen] = useState(false);
  const [isSupplierModalOpen, setIsSupplierModalOpen] = useState(false);
  const [isWastageModalOpen, setIsWastageModalOpen] = useState(false);
  const [isReturnModalOpen, setIsReturnModalOpen] = useState(false);
  const [selectedIssueForReturn, setSelectedIssueForReturn] = useState<MaterialIssued | null>(null);
  const [returnForm, setReturnForm] = useState({
    quantityReturned: '',
    returnedBy: '',
    remarks: '',
  });

  // Helper to compute item/grade-wise stock breakdown for a category
  const getAvailableItemsForCategory = (catId: number) => {
    const categoryInwards = state.materialInward.filter(i => i.materialCategoryId === Number(catId));
    const uniqueNames = Array.from(new Set(categoryInwards.map(i => i.itemName))).filter(Boolean);
    const cat = state.materialCategories.find(c => c.id === Number(catId));
    const unit = cat ? cat.defaultUnit : 'units';

    return uniqueNames.map(name => {
      const totalInward = categoryInwards.filter(i => i.itemName === name).reduce((s, i) => s + i.quantityReceived, 0);
      const grossIssued = state.materialIssued.filter(i => i.materialCategoryId === Number(catId) && i.itemName === name).reduce((s, i) => s + i.quantityIssued, 0);
      const totalReturned = state.materialIssued.filter(i => i.materialCategoryId === Number(catId) && i.itemName === name).reduce((s, i) => s + (i.quantityReturned || 0), 0);
      const totalIssued = grossIssued - totalReturned;
      const totalWastage = state.materialWastage.filter(w => w.materialCategoryId === Number(catId) && w.itemName === name).reduce((s, w) => s + w.quantity, 0);
      const currentStock = totalInward - totalIssued - totalWastage;
      return { name, currentStock, unit, totalInward, totalIssued, totalWastage };
    });
  };

  // Helper chips for popular cement/steel/sand grades during Inward Entry
  const getPresetItemChips = (catId: number) => {
    const cat = state.materialCategories.find(c => c.id === Number(catId));
    const name = cat?.name?.toLowerCase() || '';
    if (name.includes('cement')) {
      return ['Birla Super Cement (OPC)', 'JK Super Cement (PPC)', 'Ambuja Cement (OPC)', 'UltraTech Cement (OPC 53)', 'ACC Gold Cement (PPC)'];
    }
    if (name.includes('steel') || name.includes('tmt')) {
      return ['Fe-500D TMT 12mm', 'Fe-500D TMT 10mm', 'Fe-500D TMT 16mm', 'Fe-500D TMT 8mm', 'Tata Tiscon 12mm'];
    }
    if (name.includes('sand')) {
      return ['Crushed M-Sand', 'P-Sand (Plastering)', 'River Sand'];
    }
    return [];
  };

  // Inward Form State
  const [inwardForm, setInwardForm] = useState({
    materialCategoryId: state.materialCategories[0]?.id || 1,
    itemName: '',
    supplierId: state.suppliers[0]?.id || 0,
    supplierName: '',
    quantityReceived: '',
    quantityOrdered: '',
    ratePerUnit: '',
    challanNumber: '',
    vehicleNumber: '',
    qualityCheckPassed: true,
    qualityNotes: '',
    receivedBy: state.currentUser?.name || 'Site Engineer',
    extraExpenses: '0',
    extraExpensesDescription: '',
  });

  // Issue Form State
  const [issueForm, setIssueForm] = useState({
    materialCategoryId: state.materialCategories[0]?.id || 1,
    itemName: '',
    quantityIssued: '',
    contractorId: state.contractorsMaster[0]?.id || 0,
    contractorName: state.contractorsMaster[0] ? `${state.contractorsMaster[0].name} (${state.contractorsMaster[0].trade})` : '__CUSTOM__',
    customContractorName: '',
    location: '',
    engineerRemarks: '',
    issuedBy: state.currentUser?.name || 'Site Engineer',
  });

  const handleAddIssue = (e: React.FormEvent) => {
    e.preventDefault();
    const qty = Number(issueForm.quantityIssued);
    if (!qty || qty <= 0) return;

    const cat = state.materialCategories.find(c => c.id === Number(issueForm.materialCategoryId));
    const availableItems = getAvailableItemsForCategory(issueForm.materialCategoryId);

    let finalItemName = issueForm.itemName.trim();
    if (!finalItemName || finalItemName === '__CUSTOM__') {
      finalItemName = availableItems[0]?.name || (cat ? cat.name : 'Material');
    }

    let finalContractorName = issueForm.contractorName;
    if (issueForm.contractorId === 0 || issueForm.contractorName === '__CUSTOM__') {
      finalContractorName = issueForm.customContractorName.trim() || 'Direct Site Work';
    } else {
      const match = state.contractorsMaster.find(c => c.id === Number(issueForm.contractorId));
      if (match) {
        finalContractorName = `${match.name} (${match.trade})`;
      }
    }

    const locationText = issueForm.location.trim();
    const finalIssuedTo = locationText
      ? `${finalContractorName} - ${locationText}`
      : finalContractorName;

    const newIssue: MaterialIssued = {
      id: Date.now(),
      materialCategoryId: Number(issueForm.materialCategoryId),
      itemName: finalItemName,
      quantityIssued: qty,
      unit: cat ? cat.defaultUnit : 'units',
      issuedTo: finalIssuedTo,
      contractorId: Number(issueForm.contractorId) || undefined,
      contractorName: finalContractorName,
      location: locationText || undefined,
      engineerRemarks: issueForm.engineerRemarks.trim() || undefined,
      issuedBy: issueForm.issuedBy,
      dateIssued: new Date().toISOString(),
    };

    saveAppState({
      materialIssued: [newIssue, ...state.materialIssued],
    });

    setIsIssueModalOpen(false);
    setIssueForm({
      materialCategoryId: state.materialCategories[0]?.id || 1,
      itemName: '',
      quantityIssued: '',
      contractorId: state.contractorsMaster[0]?.id || 0,
      contractorName: state.contractorsMaster[0] ? `${state.contractorsMaster[0].name} (${state.contractorsMaster[0].trade})` : '__CUSTOM__',
      customContractorName: '',
      location: '',
      engineerRemarks: '',
      issuedBy: state.currentUser?.name || 'Site Engineer',
    });
  };

  // Supplier Form State
  const [supplierForm, setSupplierForm] = useState({
    name: '',
    contactPerson: '',
    phone: '',
    email: '',
    gstNumber: '',
    address: '',
  });

  // Wastage Form State
  const [wastageForm, setWastageForm] = useState({
    materialCategoryId: state.materialCategories[0]?.id || 1,
    itemName: '',
    quantity: '',
    reason: 'DAMAGED' as const,
    notes: '',
  });

  // Handlers
  const handleAddInward = (e: React.FormEvent) => {
    e.preventDefault();
    const qty = Number(inwardForm.quantityReceived);
    if (!qty || qty <= 0) return;

    const cat = state.materialCategories.find(c => c.id === Number(inwardForm.materialCategoryId));
    const supp = state.suppliers.find(s => s.id === Number(inwardForm.supplierId));
    const rate = Number(inwardForm.ratePerUnit) || 0;

    const newInward: MaterialInward = {
      id: Date.now(),
      materialCategoryId: Number(inwardForm.materialCategoryId),
      itemName: inwardForm.itemName || (cat ? cat.name : 'Material'),
      supplierId: supp ? supp.id : undefined,
      supplierName: supp ? supp.name : inwardForm.supplierName || 'Direct Vendor',
      quantityReceived: qty,
      quantityOrdered: Number(inwardForm.quantityOrdered) || qty,
      unit: cat ? cat.defaultUnit : 'units',
      ratePerUnit: rate,
      totalAmount: qty * rate,
      challanNumber: inwardForm.challanNumber,
      vehicleNumber: inwardForm.vehicleNumber,
      qualityCheckPassed: inwardForm.qualityCheckPassed,
      qualityNotes: inwardForm.qualityNotes,
      receivedBy: inwardForm.receivedBy,
      extraExpenses: Number(inwardForm.extraExpenses) || 0,
      extraExpensesDescription: inwardForm.extraExpensesDescription,
      dateReceived: new Date().toISOString(),
    };

    saveAppState({
      materialInward: [newInward, ...state.materialInward],
    });

    if (!newInward.qualityCheckPassed) {
      autoCreateDraftNcrFromMaterialInward(newInward);
    }

    setIsInwardModalOpen(false);
    setInwardForm({
      materialCategoryId: state.materialCategories[0]?.id || 1,
      itemName: '',
      supplierId: state.suppliers[0]?.id || 0,
      supplierName: '',
      quantityReceived: '',
      quantityOrdered: '',
      ratePerUnit: '',
      challanNumber: '',
      vehicleNumber: '',
      qualityCheckPassed: true,
      qualityNotes: '',
      receivedBy: state.currentUser?.name || 'Site Engineer',
      extraExpenses: '0',
      extraExpensesDescription: '',
    });
  };



  const handleAddSupplier = (e: React.FormEvent) => {
    e.preventDefault();
    if (!supplierForm.name.trim()) return;

    const newSupplier: Supplier = {
      id: Date.now(),
      name: supplierForm.name.trim(),
      contactPerson: supplierForm.contactPerson,
      phone: supplierForm.phone,
      email: supplierForm.email,
      gstNumber: supplierForm.gstNumber,
      address: supplierForm.address,
      status: 'ACTIVE',
    };

    saveAppState({
      suppliers: [newSupplier, ...state.suppliers],
    });

    setIsSupplierModalOpen(false);
    setSupplierForm({
      name: '',
      contactPerson: '',
      phone: '',
      email: '',
      gstNumber: '',
      address: '',
    });
  };

  const handleAddWastage = (e: React.FormEvent) => {
    e.preventDefault();
    const qty = Number(wastageForm.quantity);
    if (!qty || qty <= 0) return;

    const cat = state.materialCategories.find(c => c.id === Number(wastageForm.materialCategoryId));
    const availableItems = getAvailableItemsForCategory(wastageForm.materialCategoryId);

    let finalItemName = wastageForm.itemName.trim();
    if (!finalItemName || finalItemName === '__CUSTOM__') {
      finalItemName = availableItems[0]?.name || (cat ? cat.name : 'Material');
    }

    const newWastage: MaterialWastage = {
      id: Date.now(),
      materialCategoryId: Number(wastageForm.materialCategoryId),
      itemName: finalItemName,
      quantity: qty,
      unit: cat ? cat.defaultUnit : 'units',
      reason: wastageForm.reason,
      notes: wastageForm.notes,
      dateLogged: new Date().toISOString(),
    };

    saveAppState({
      materialWastage: [newWastage, ...state.materialWastage],
    });

    setIsWastageModalOpen(false);
    setWastageForm({
      materialCategoryId: state.materialCategories[0]?.id || 1,
      itemName: '',
      quantity: '',
      reason: 'DAMAGED',
      notes: '',
    });
  };

  const handleReturnMaterial = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedIssueForReturn) return;

    const returnQty = Number(returnForm.quantityReturned);
    if (!returnQty || returnQty <= 0) return;

    const currentReturned = selectedIssueForReturn.quantityReturned || 0;
    const remainingToReturn = selectedIssueForReturn.quantityIssued - currentReturned;

    if (returnQty > remainingToReturn) {
      alert(`Cannot return more than remaining issued quantity (${remainingToReturn} ${selectedIssueForReturn.unit})`);
      return;
    }

    const newTotalReturned = currentReturned + returnQty;
    const newStatus: 'NOT_RETURNED' | 'PARTIALLY_RETURNED' | 'FULLY_RETURNED' =
      newTotalReturned >= selectedIssueForReturn.quantityIssued ? 'FULLY_RETURNED' : 'PARTIALLY_RETURNED';

    const newLog: MaterialReturnLog = {
      id: Date.now(),
      quantityReturned: returnQty,
      returnedBy: returnForm.returnedBy.trim() || state.currentUser?.name || 'Site Engineer',
      dateReturned: new Date().toISOString(),
      remarks: returnForm.remarks.trim() || undefined,
    };

    const updatedMaterialIssued = state.materialIssued.map(item => {
      if (item.id === selectedIssueForReturn.id) {
        return {
          ...item,
          quantityReturned: newTotalReturned,
          returnStatus: newStatus,
          returnLogs: [newLog, ...(item.returnLogs || [])],
        };
      }
      return item;
    });

    saveAppState({
      materialIssued: updatedMaterialIssued,
    });

    setIsReturnModalOpen(false);
    setSelectedIssueForReturn(null);
    setReturnForm({
      quantityReturned: '',
      returnedBy: state.currentUser?.name || 'Site Engineer',
      remarks: '',
    });
  };

  return (
    <div className="space-y-4 max-w-7xl mx-auto p-3 sm:p-6 pb-24">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-zinc-900/80 p-4 rounded-2xl border border-zinc-800">
        <div className="flex items-center space-x-3">
          <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
            <Package className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-white">Material & Inventory Management</h1>
            <p className="text-xs text-zinc-400">Track Inward Deliveries (GRN), Stock Ledger, Issues & Suppliers</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setIsInwardModalOpen(true)}
            className="flex-1 sm:flex-initial px-3 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-zinc-950 font-bold text-xs flex items-center justify-center space-x-1.5 transition shadow-lg shadow-emerald-500/20"
          >
            <Plus className="w-4 h-4" />
            <span>+ Inward Delivery (GRN)</span>
          </button>
          <button
            onClick={() => {
              const defaultCatId = state.materialCategories[0]?.id || 1;
              const available = getAvailableItemsForCategory(defaultCatId);
              setIssueForm({
                materialCategoryId: defaultCatId,
                itemName: available[0]?.name || '',
                quantityIssued: '',
                contractorId: state.contractorsMaster[0]?.id || 0,
                contractorName: state.contractorsMaster[0] ? `${state.contractorsMaster[0].name} (${state.contractorsMaster[0].trade})` : '__CUSTOM__',
                customContractorName: '',
                location: '',
                engineerRemarks: '',
                issuedBy: state.currentUser?.name || 'Site Engineer',
              });
              setIsIssueModalOpen(true);
            }}
            className="px-3 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-semibold text-xs flex items-center space-x-1.5 transition border border-zinc-700"
          >
            <ArrowUpRight className="w-4 h-4 text-amber-400" />
            <span>Issue Material</span>
          </button>
        </div>
      </div>

      {/* Sub Tab Switcher */}
      <div className="flex items-center space-x-1 bg-zinc-900 p-1 rounded-xl border border-zinc-800 overflow-x-auto text-xs">
        <button
          onClick={() => setActiveSubTab('stock')}
          className={`px-3 py-2 rounded-lg font-medium transition whitespace-nowrap ${
            activeSubTab === 'stock'
              ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-bold'
              : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          📦 Stock Ledger
        </button>
        <button
          onClick={() => setActiveSubTab('inward')}
          className={`px-3 py-2 rounded-lg font-medium transition whitespace-nowrap ${
            activeSubTab === 'inward'
              ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-bold'
              : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          🚚 Inward Register ({state.materialInward.length})
        </button>
        <button
          onClick={() => setActiveSubTab('issue')}
          className={`px-3 py-2 rounded-lg font-medium transition whitespace-nowrap ${
            activeSubTab === 'issue'
              ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-bold'
              : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          📋 Material Issue ({state.materialIssued.length})
        </button>
        <button
          onClick={() => setActiveSubTab('wastage')}
          className={`px-3 py-2 rounded-lg font-medium transition whitespace-nowrap ${
            activeSubTab === 'wastage'
              ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-bold'
              : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          ⚠️ Wastage / Returns ({state.materialWastage.length})
        </button>
        <button
          onClick={() => setActiveSubTab('suppliers')}
          className={`px-3 py-2 rounded-lg font-medium transition whitespace-nowrap ${
            activeSubTab === 'suppliers'
              ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-bold'
              : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          🏢 Suppliers ({state.suppliers.length})
        </button>
      </div>

      {/* SUB-TAB 1: STOCK LEDGER DASHBOARD */}
      {activeSubTab === 'stock' && (
        <div className="space-y-4">
          {/* Category Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {state.materialCategories.map((cat) => {
              const info = stockSummary[cat.id] || {
                totalInward: 0,
                totalIssued: 0,
                totalWastage: 0,
                currentStock: 0,
                unit: cat.defaultUnit,
                isLowStock: false,
              };

              const gradeBreakdown = getAvailableItemsForCategory(cat.id);

              return (
                <div
                  key={cat.id}
                  className={`p-4 rounded-2xl border transition-all ${
                    info.isLowStock
                      ? 'bg-red-500/10 border-red-500/30 text-red-200'
                      : 'bg-zinc-900/90 border-zinc-800 text-zinc-100 hover:border-zinc-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
                      {cat.code}
                    </span>
                    {info.isLowStock && (
                      <span className="px-2 py-0.5 rounded-full bg-red-500/20 text-red-400 text-[10px] font-bold flex items-center space-x-1 animate-pulse">
                        <AlertTriangle className="w-3 h-3" />
                        <span>Low Stock</span>
                      </span>
                    )}
                  </div>

                  <h3 className="font-bold text-sm text-white mb-2 leading-snug">{cat.name}</h3>

                  <div className="flex items-baseline space-x-2 my-2">
                    <span className="text-2xl font-black tracking-tight text-emerald-400">
                      {info.currentStock.toLocaleString()}
                    </span>
                    <span className="text-xs text-zinc-400 font-medium">{info.unit}</span>
                  </div>

                  {/* Grade / Brand Stock Breakdown */}
                  {gradeBreakdown.length > 0 && (
                    <div className="my-2.5 p-2 bg-zinc-950/80 rounded-xl border border-zinc-800/80 space-y-1.5 text-[11px]">
                      <span className="text-[10px] uppercase font-bold text-zinc-400 block tracking-wider">Grade & Brand Stock</span>
                      {gradeBreakdown.map((item, idx) => (
                        <div key={idx} className="flex items-center justify-between border-b border-zinc-900 last:border-0 pb-1 last:pb-0">
                          <span className="text-zinc-200 font-medium truncate max-w-[140px]" title={item.name}>
                            {item.name}
                          </span>
                          <span className="font-bold text-emerald-400 shrink-0">
                            {item.currentStock} {item.unit}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="grid grid-cols-3 gap-1 pt-3 border-t border-zinc-800/80 text-[10px] text-zinc-400">
                    <div>
                      <div className="text-zinc-500">Inward</div>
                      <div className="font-semibold text-emerald-400">+{info.totalInward}</div>
                    </div>
                    <div>
                      <div className="text-zinc-500">Issued</div>
                      <div className="font-semibold text-amber-400">-{info.totalIssued}</div>
                    </div>
                    <div>
                      <div className="text-zinc-500">Wastage</div>
                      <div className="font-semibold text-red-400">-{info.totalWastage}</div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* SUB-TAB 2: INWARD REGISTER */}
      {activeSubTab === 'inward' && (
        <div className="space-y-3">
          {state.materialInward.length === 0 ? (
            <div className="p-8 text-center bg-zinc-900/60 rounded-2xl border border-zinc-800">
              <Truck className="w-10 h-10 text-zinc-600 mx-auto mb-3" />
              <h3 className="font-bold text-sm text-zinc-300">No Inward Deliveries Logged</h3>
              <p className="text-xs text-zinc-500 mt-1 max-w-sm mx-auto">
                Log every truck delivery arriving at the site gate with challan photos, vehicle number & rate details.
              </p>
              <button
                onClick={() => setIsInwardModalOpen(true)}
                className="mt-4 px-4 py-2 rounded-xl bg-emerald-500 text-zinc-950 font-bold text-xs"
              >
                + Log First Delivery
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              {state.materialInward.map((item) => (
                <div key={item.id} className="p-4 rounded-xl bg-zinc-900 border border-zinc-800 space-y-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-bold text-white">{item.itemName}</span>
                        {item.qualityCheckPassed ? (
                          <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 text-[10px] font-semibold">
                            ✓ QC Pass
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded bg-red-500/20 text-red-400 text-[10px] font-semibold">
                            ✗ QC Fail
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-zinc-400 mt-0.5">
                        Supplier: <span className="text-zinc-200 font-medium">{item.supplierName}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-base font-black text-emerald-400">
                        +{item.quantityReceived} {item.unit}
                      </div>
                      <div className="text-[10px] text-zinc-500">₹{item.ratePerUnit}/{item.unit}</div>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-zinc-400 pt-2 border-t border-zinc-800">
                    {item.challanNumber && (
                      <div>Challan #: <span className="text-zinc-300 font-mono">{item.challanNumber}</span></div>
                    )}
                    {item.vehicleNumber && (
                      <div>Vehicle #: <span className="text-zinc-300 font-mono">{item.vehicleNumber}</span></div>
                    )}
                    {item.receivedBy && (
                      <div>Received By: <span className="text-zinc-300">{item.receivedBy}</span></div>
                    )}
                    <div>Date: <span className="text-zinc-300">{new Date(item.dateReceived).toLocaleDateString()}</span></div>
                    {item.totalAmount > 0 && (
                      <div className="ml-auto font-bold text-zinc-200">Total: ₹{item.totalAmount.toLocaleString()}</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* SUB-TAB 3: MATERIAL ISSUE REGISTER */}
      {activeSubTab === 'issue' && (
        <div className="space-y-3">
          {state.materialIssued.length === 0 ? (
            <div className="p-8 text-center bg-zinc-900/60 rounded-2xl border border-zinc-800">
              <ArrowUpRight className="w-10 h-10 text-zinc-600 mx-auto mb-3" />
              <h3 className="font-bold text-sm text-zinc-300">No Material Issues Logged</h3>
              <p className="text-xs text-zinc-500 mt-1 max-w-sm mx-auto">
                Record material issued to contractors or specific floors to automatically update stock balances.
              </p>
              <button
                onClick={() => {
                  const defaultCatId = state.materialCategories[0]?.id || 1;
                  const available = getAvailableItemsForCategory(defaultCatId);
                  setIssueForm({
                    materialCategoryId: defaultCatId,
                    itemName: available[0]?.name || '',
                    quantityIssued: '',
                    contractorId: state.contractorsMaster[0]?.id || 0,
                    contractorName: state.contractorsMaster[0] ? `${state.contractorsMaster[0].name} (${state.contractorsMaster[0].trade})` : '__CUSTOM__',
                    customContractorName: '',
                    location: '',
                    engineerRemarks: '',
                    issuedBy: state.currentUser?.name || 'Site Engineer',
                  });
                  setIsIssueModalOpen(true);
                }}
                className="mt-4 px-4 py-2 rounded-xl bg-amber-500 text-zinc-950 font-bold text-xs"
              >
                + Issue Material
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              {state.materialIssued.map((item) => {
                const returnedQty = item.quantityReturned || 0;
                const isFullyReturned = returnedQty >= item.quantityIssued;
                const isPartiallyReturned = returnedQty > 0 && returnedQty < item.quantityIssued;
                const netConsumed = item.quantityIssued - returnedQty;

                return (
                  <div key={item.id} className="p-4 rounded-xl bg-zinc-900 border border-zinc-800 space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-sm font-bold text-white">{item.itemName}</span>
                          {item.contractorName && (
                            <span className="px-2 py-0.5 rounded-md bg-amber-500/15 text-amber-300 border border-amber-500/30 text-[10px] font-semibold">
                              👷 {item.contractorName}
                            </span>
                          )}
                          {isFullyReturned ? (
                            <span className="px-2 py-0.5 rounded-md bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold flex items-center space-x-1">
                              <CheckCircle2 className="w-3 h-3" />
                              <span>Fully Returned ({returnedQty} {item.unit})</span>
                            </span>
                          ) : isPartiallyReturned ? (
                            <span className="px-2 py-0.5 rounded-md bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 text-[10px] font-bold flex items-center space-x-1">
                              <RotateCcw className="w-3 h-3" />
                              <span>Partially Returned ({returnedQty}/{item.quantityIssued} {item.unit})</span>
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[10px] font-semibold">
                              Issued (Active)
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-zinc-400">
                          Issued To: <span className="text-amber-300 font-medium">{item.contractorName || item.issuedTo}</span>
                          {item.location && <span className="text-zinc-300 ml-2">📍 {item.location}</span>}
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <div className="text-base font-black text-amber-400">
                          -{item.quantityIssued} {item.unit}
                        </div>
                        {returnedQty > 0 && (
                          <div className="text-[11px] font-bold text-cyan-400">
                            +{returnedQty} Returned to Yard
                          </div>
                        )}
                        {isPartiallyReturned && (
                          <div className="text-[10px] font-semibold text-zinc-400">
                            Net Consumed: {netConsumed} {item.unit}
                          </div>
                        )}
                      </div>
                    </div>

                    {item.engineerRemarks && (
                      <div className="text-xs text-zinc-300 bg-zinc-950 p-2.5 rounded-xl border border-zinc-800 flex items-start space-x-1.5">
                        <span className="text-amber-400 font-bold shrink-0">📝 Remark:</span>
                        <span className="italic text-zinc-300">"{item.engineerRemarks}"</span>
                      </div>
                    )}

                    {/* Return History Logs */}
                    {item.returnLogs && item.returnLogs.length > 0 && (
                      <div className="bg-zinc-950/80 p-2.5 rounded-xl border border-zinc-800 space-y-1.5 text-xs">
                        <div className="text-[10px] font-bold text-cyan-400 uppercase tracking-wider flex items-center space-x-1">
                          <RotateCcw className="w-3 h-3" />
                          <span>Return Log History ({item.returnLogs.length})</span>
                        </div>
                        {item.returnLogs.map((log) => (
                          <div key={log.id} className="flex flex-col sm:flex-row sm:items-center justify-between text-[11px] text-zinc-300 border-b border-zinc-900 last:border-0 pb-1 last:pb-0 gap-1">
                            <div>
                              <span className="font-bold text-emerald-400">+{log.quantityReturned} {item.unit}</span>
                              <span className="text-zinc-400 ml-2">by {log.returnedBy}</span>
                              {log.remarks && <span className="text-zinc-400 italic ml-1 font-normal">("{log.remarks}")</span>}
                            </div>
                            <span className="text-[10px] text-zinc-500">{new Date(log.dateReturned).toLocaleDateString()} {new Date(log.dateReturned).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-zinc-400 pt-2 border-t border-zinc-800">
                      <div className="flex items-center space-x-3">
                        <div>Issued By: <span className="text-zinc-300">{item.issuedBy || 'Engineer'}</span></div>
                        <div>Date: <span className="text-zinc-300">{new Date(item.dateIssued).toLocaleDateString()}</span></div>
                      </div>

                      {!isFullyReturned && (
                        <button
                          onClick={() => {
                            setSelectedIssueForReturn(item);
                            setReturnForm({
                              quantityReturned: '',
                              returnedBy: state.currentUser?.name || 'Site Engineer',
                              remarks: '',
                            });
                            setIsReturnModalOpen(true);
                          }}
                          className="px-3 py-1.5 rounded-xl bg-cyan-500/15 hover:bg-cyan-500/25 text-cyan-300 font-bold text-xs border border-cyan-500/30 flex items-center space-x-1.5 transition active:scale-95"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                          <span>↩️ Return Material to Storage</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* SUB-TAB 4: WASTAGE & RETURNS */}
      {activeSubTab === 'wastage' && (
        <div className="space-y-3">
          <div className="flex justify-end">
            <button
              onClick={() => {
                const defaultCatId = state.materialCategories[0]?.id || 1;
                const available = getAvailableItemsForCategory(defaultCatId);
                setWastageForm({
                  materialCategoryId: defaultCatId,
                  itemName: available[0]?.name || '',
                  quantity: '',
                  reason: 'DAMAGED',
                  notes: '',
                });
                setIsWastageModalOpen(true);
              }}
              className="px-3 py-1.5 rounded-lg bg-red-500/20 text-red-300 hover:bg-red-500/30 text-xs font-bold border border-red-500/30"
            >
              + Log Wastage / Return
            </button>
          </div>

          {state.materialWastage.length === 0 ? (
            <div className="p-8 text-center bg-zinc-900/60 rounded-2xl border border-zinc-800">
              <TrendingDown className="w-10 h-10 text-zinc-600 mx-auto mb-3" />
              <h3 className="font-bold text-sm text-zinc-300">No Wastage or Returns Recorded</h3>
            </div>
          ) : (
            <div className="space-y-2">
              {state.materialWastage.map((item) => (
                <div key={item.id} className="p-4 rounded-xl bg-zinc-900 border border-zinc-800 space-y-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="text-sm font-bold text-white">{item.itemName}</div>
                      <div className="text-xs text-zinc-400 capitalize mt-0.5">
                        Reason: <span className="text-red-400 font-semibold">{item.reason.replace(/_/g, ' ')}</span>
                      </div>
                    </div>
                    <div className="text-base font-black text-red-400">
                      -{item.quantity} {item.unit}
                    </div>
                  </div>
                  {item.notes && (
                    <div className="text-xs text-zinc-400 italic bg-zinc-950 p-2 rounded-lg border border-zinc-800">
                      "{item.notes}"
                    </div>
                  )}
                  <div className="text-[11px] text-zinc-500 pt-1">
                    Date Logged: {new Date(item.dateLogged).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* SUB-TAB 5: SUPPLIERS */}
      {activeSubTab === 'suppliers' && (
        <div className="space-y-3">
          <div className="flex justify-end">
            <button
              onClick={() => setIsSupplierModalOpen(true)}
              className="px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-zinc-950 font-bold text-xs shadow"
            >
              + Add New Supplier
            </button>
          </div>

          {state.suppliers.length === 0 ? (
            <div className="p-8 text-center bg-zinc-900/60 rounded-2xl border border-zinc-800">
              <Truck className="w-10 h-10 text-zinc-600 mx-auto mb-3" />
              <h3 className="font-bold text-sm text-zinc-300">No Suppliers Registered</h3>
              <p className="text-xs text-zinc-500 mt-1 max-w-sm mx-auto">
                Add vendor directory details, contact persons, phone numbers & GST numbers.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {state.suppliers.map((s) => (
                <div key={s.id} className="p-4 rounded-xl bg-zinc-900 border border-zinc-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm text-white">{s.name}</span>
                    <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 text-[10px] font-bold">
                      ACTIVE
                    </span>
                  </div>
                  {s.contactPerson && (
                    <div className="text-xs text-zinc-400">Contact: <span className="text-zinc-200">{s.contactPerson}</span></div>
                  )}
                  {s.phone && (
                    <div className="text-xs text-zinc-400">Phone: <span className="text-zinc-200">{s.phone}</span></div>
                  )}
                  {s.gstNumber && (
                    <div className="text-[10px] text-zinc-500 font-mono">GST: {s.gstNumber}</div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* MODAL: ADD INWARD DELIVERY (GRN) */}
      {isInwardModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl max-w-lg w-full p-6 text-zinc-100 space-y-4 my-8 max-h-[90vh] overflow-y-auto custom-scrollbar">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <h3 className="font-bold text-base text-white flex items-center space-x-2">
                <Truck className="w-5 h-5 text-emerald-400" />
                <span>+ Material Inward Register (GRN)</span>
              </h3>
              <button onClick={() => setIsInwardModalOpen(false)} className="text-zinc-500 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleAddInward} className="space-y-3 text-xs">
              <div>
                <label className="block text-zinc-400 font-medium mb-1">Material Category</label>
                <select
                  value={inwardForm.materialCategoryId}
                  onChange={(e) => setInwardForm({ ...inwardForm, materialCategoryId: Number(e.target.value) })}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-xl p-2.5 text-white"
                >
                  {state.materialCategories.map((c) => (
                    <option key={c.id} value={c.id}>{c.name} ({c.defaultUnit})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-zinc-400 font-medium mb-1">Item Description / Brand & Grade</label>
                <input
                  type="text"
                  placeholder="e.g. Birla Super Cement (OPC)"
                  value={inwardForm.itemName}
                  onChange={(e) => setInwardForm({ ...inwardForm, itemName: e.target.value })}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-xl p-2.5 text-white"
                  required
                />
                {/* Preset Grade / Brand Quick Chips */}
                {getPresetItemChips(inwardForm.materialCategoryId).length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-1.5">
                    {getPresetItemChips(inwardForm.materialCategoryId).map((chip) => (
                      <button
                        key={chip}
                        type="button"
                        onClick={() => setInwardForm({ ...inwardForm, itemName: chip })}
                        className={`px-2 py-0.5 text-[10px] font-semibold rounded-md border transition ${
                          inwardForm.itemName === chip
                            ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                            : 'bg-zinc-800 text-zinc-400 border-zinc-700 hover:text-zinc-200'
                        }`}
                      >
                        {chip}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-400 font-medium mb-1">Quantity Received</label>
                  <input
                    type="number"
                    placeholder="e.g. 200"
                    value={inwardForm.quantityReceived}
                    onChange={(e) => setInwardForm({ ...inwardForm, quantityReceived: e.target.value })}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-xl p-2.5 text-white"
                    required
                  />
                </div>
                <div>
                  <label className="block text-zinc-400 font-medium mb-1">Rate per Unit (₹)</label>
                  <input
                    type="number"
                    placeholder="e.g. 380"
                    value={inwardForm.ratePerUnit}
                    onChange={(e) => setInwardForm({ ...inwardForm, ratePerUnit: e.target.value })}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-xl p-2.5 text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-400 font-medium mb-1">Challan Number</label>
                  <input
                    type="text"
                    placeholder="DC-9921"
                    value={inwardForm.challanNumber}
                    onChange={(e) => setInwardForm({ ...inwardForm, challanNumber: e.target.value })}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-xl p-2.5 text-white"
                  />
                </div>
                <div>
                  <label className="block text-zinc-400 font-medium mb-1">Vehicle Number</label>
                  <input
                    type="text"
                    placeholder="MH-12-AB-1234"
                    value={inwardForm.vehicleNumber}
                    onChange={(e) => setInwardForm({ ...inwardForm, vehicleNumber: e.target.value })}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-xl p-2.5 text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-zinc-400 font-medium mb-1">Supplier / Vendor</label>
                <input
                  type="text"
                  placeholder="Supplier Company Name"
                  value={inwardForm.supplierName}
                  onChange={(e) => setInwardForm({ ...inwardForm, supplierName: e.target.value })}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-xl p-2.5 text-white"
                />
              </div>

              <div className="pt-2 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsInwardModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-zinc-800 text-zinc-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-500 text-zinc-950 font-bold"
                >
                  Save Inward Entry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ISSUE MATERIAL */}
      {isIssueModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl max-w-md w-full p-6 text-zinc-100 space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <h3 className="font-bold text-base text-white flex items-center space-x-2">
                <ArrowUpRight className="w-5 h-5 text-amber-400" />
                <span>+ Issue Material</span>
              </h3>
              <button onClick={() => setIsIssueModalOpen(false)} className="text-zinc-500 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleAddIssue} className="space-y-3 text-xs">
              <div>
                <label className="block text-zinc-400 font-medium mb-1">Material Category</label>
                <select
                  value={issueForm.materialCategoryId}
                  onChange={(e) => {
                    const newCatId = Number(e.target.value);
                    const available = getAvailableItemsForCategory(newCatId);
                    setIssueForm({
                      ...issueForm,
                      materialCategoryId: newCatId,
                      itemName: available[0]?.name || '',
                    });
                  }}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-xl p-2.5 text-white"
                >
                  {state.materialCategories.map((c) => (
                    <option key={c.id} value={c.id}>{c.name} ({c.defaultUnit})</option>
                  ))}
                </select>
              </div>

              {/* Specific Item / Grade / Brand Dropdown Selector */}
              <div>
                <label className="block text-zinc-400 font-medium mb-1">Specific Item Grade & Brand in Stock</label>
                {getAvailableItemsForCategory(issueForm.materialCategoryId).length > 0 ? (
                  <select
                    value={issueForm.itemName}
                    onChange={(e) => setIssueForm({ ...issueForm, itemName: e.target.value })}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-xl p-2.5 text-white font-semibold"
                  >
                    {getAvailableItemsForCategory(issueForm.materialCategoryId).map((item, idx) => (
                      <option key={idx} value={item.name}>
                        {item.name} — Stock: {item.currentStock} {item.unit}
                      </option>
                    ))}
                    <option value="__CUSTOM__">+ Enter Custom Grade / Brand Name...</option>
                  </select>
                ) : (
                  <div className="text-[11px] text-amber-400 font-medium mb-1">
                    ⚠️ No specific inward delivery logged yet for this category. Enter custom grade below:
                  </div>
                )}

                {(getAvailableItemsForCategory(issueForm.materialCategoryId).length === 0 || issueForm.itemName === '__CUSTOM__') && (
                  <input
                    type="text"
                    placeholder="e.g. Birla Super Cement (OPC)"
                    value={issueForm.itemName === '__CUSTOM__' ? '' : issueForm.itemName}
                    onChange={(e) => setIssueForm({ ...issueForm, itemName: e.target.value })}
                    className="w-full mt-2 bg-zinc-800 border border-zinc-700 rounded-xl p-2.5 text-white"
                    required
                  />
                )}
              </div>

              <div>
                <label className="block text-zinc-400 font-medium mb-1">Quantity Issued</label>
                <input
                  type="number"
                  placeholder="e.g. 25"
                  value={issueForm.quantityIssued}
                  onChange={(e) => setIssueForm({ ...issueForm, quantityIssued: e.target.value })}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-xl p-2.5 text-white"
                  required
                />
              </div>

              {/* Contractor Selector */}
              <div>
                <label className="block text-zinc-400 font-medium mb-1">Contractor / Sub-contractor</label>
                {state.contractorsMaster.length > 0 ? (
                  <select
                    value={issueForm.contractorId}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (val === '__CUSTOM__') {
                        setIssueForm({ ...issueForm, contractorId: 0, contractorName: '__CUSTOM__' });
                      } else {
                        const id = Number(val);
                        const match = state.contractorsMaster.find(c => c.id === id);
                        setIssueForm({
                          ...issueForm,
                          contractorId: id,
                          contractorName: match ? `${match.name} (${match.trade})` : '',
                        });
                      }
                    }}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-xl p-2.5 text-white font-semibold"
                  >
                    {state.contractorsMaster.map((c) => (
                      <option key={c.id} value={c.id}>{c.name} — {c.trade}</option>
                    ))}
                    <option value="__CUSTOM__">+ Other / Direct Site Work...</option>
                  </select>
                ) : (
                  <div className="text-[11px] text-zinc-400 mb-1">Enter agency / contractor name below:</div>
                )}

                {(state.contractorsMaster.length === 0 || issueForm.contractorName === '__CUSTOM__') && (
                  <input
                    type="text"
                    placeholder="e.g. Apex Masonry Works"
                    value={issueForm.customContractorName}
                    onChange={(e) => setIssueForm({ ...issueForm, customContractorName: e.target.value })}
                    className="w-full mt-2 bg-zinc-800 border border-zinc-700 rounded-xl p-2.5 text-white"
                    required
                  />
                )}
              </div>

              <div>
                <label className="block text-zinc-400 font-medium mb-1">Issue Location / Floor / Wing</label>
                <input
                  type="text"
                  placeholder="e.g. Wing B1, Floor 3 (Flat 302 Tile Work)"
                  value={issueForm.location}
                  onChange={(e) => setIssueForm({ ...issueForm, location: e.target.value })}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-xl p-2.5 text-white"
                />
              </div>

              <div>
                <label className="block text-zinc-400 font-medium mb-1">Engineer's Remark / Work Notes</label>
                <textarea
                  placeholder="e.g. Approved for tile fixing after 24hr curing inspection"
                  value={issueForm.engineerRemarks}
                  onChange={(e) => setIssueForm({ ...issueForm, engineerRemarks: e.target.value })}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-xl p-2.5 text-white h-16 resize-none"
                />
              </div>

              <div className="pt-2 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsIssueModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-zinc-800 text-zinc-400"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-500 text-zinc-950 font-bold"
                >
                  Save Issue Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ADD SUPPLIER */}
      {isSupplierModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl max-w-md w-full p-6 text-zinc-100 space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <h3 className="font-bold text-base text-white">Add Supplier / Vendor</h3>
              <button onClick={() => setIsSupplierModalOpen(false)} className="text-zinc-500">✕</button>
            </div>
            <form onSubmit={handleAddSupplier} className="space-y-3 text-xs">
              <input
                type="text"
                placeholder="Company / Vendor Name"
                value={supplierForm.name}
                onChange={(e) => setSupplierForm({ ...supplierForm, name: e.target.value })}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-xl p-2.5 text-white"
                required
              />
              <input
                type="text"
                placeholder="Contact Person Name"
                value={supplierForm.contactPerson}
                onChange={(e) => setSupplierForm({ ...supplierForm, contactPerson: e.target.value })}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-xl p-2.5 text-white"
              />
              <input
                type="text"
                placeholder="Phone Number"
                value={supplierForm.phone}
                onChange={(e) => setSupplierForm({ ...supplierForm, phone: e.target.value })}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-xl p-2.5 text-white"
              />
              <input
                type="text"
                placeholder="GST Number (optional)"
                value={supplierForm.gstNumber}
                onChange={(e) => setSupplierForm({ ...supplierForm, gstNumber: e.target.value })}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-xl p-2.5 text-white"
              />
              <div className="pt-2 flex justify-end space-x-2">
                <button type="button" onClick={() => setIsSupplierModalOpen(false)} className="px-4 py-2 rounded-xl bg-zinc-800">Cancel</button>
                <button type="submit" className="px-5 py-2 rounded-xl bg-emerald-500 text-zinc-950 font-bold">Save Supplier</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ADD WASTAGE */}
      {isWastageModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl max-w-md w-full p-6 text-zinc-100 space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <h3 className="font-bold text-base text-white">Log Material Wastage / Return</h3>
              <button onClick={() => setIsWastageModalOpen(false)} className="text-zinc-500">✕</button>
            </div>
            <form onSubmit={handleAddWastage} className="space-y-3 text-xs">
              <select
                value={wastageForm.materialCategoryId}
                onChange={(e) => setWastageForm({ ...wastageForm, materialCategoryId: Number(e.target.value) })}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-xl p-2.5 text-white"
              >
                {state.materialCategories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
              <input
                type="number"
                placeholder="Quantity"
                value={wastageForm.quantity}
                onChange={(e) => setWastageForm({ ...wastageForm, quantity: e.target.value })}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-xl p-2.5 text-white"
                required
              />
              <select
                value={wastageForm.reason}
                onChange={(e) => setWastageForm({ ...wastageForm, reason: e.target.value as any })}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-xl p-2.5 text-white"
              >
                <option value="DAMAGED">Damaged in Transit / Storage</option>
                <option value="RETURNED_TO_SUPPLIER">Returned to Supplier</option>
                <option value="EXCESS">Excess / Expired</option>
                <option value="THEFT">Stolen / Missing</option>
              </select>
              <div className="pt-2 flex justify-end space-x-2">
                <button type="button" onClick={() => setIsWastageModalOpen(false)} className="px-4 py-2 rounded-xl bg-zinc-800">Cancel</button>
                <button type="submit" className="px-5 py-2 rounded-xl bg-red-500 text-white font-bold">Log Wastage</button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* MODAL: RETURN MATERIAL TO INVENTORY STORAGE */}
      {isReturnModalOpen && selectedIssueForReturn && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl max-w-md w-full p-6 text-zinc-100 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <div>
                <h3 className="font-bold text-base text-white flex items-center space-x-2">
                  <RotateCcw className="w-5 h-5 text-cyan-400" />
                  <span>Return Material to Yard/Storage</span>
                </h3>
                <p className="text-[11px] text-zinc-400 mt-0.5">
                  Restores stock in Inventory Storage for item: <span className="text-white font-medium">{selectedIssueForReturn.itemName}</span>
                </p>
              </div>
              <button onClick={() => setIsReturnModalOpen(false)} className="text-zinc-500 hover:text-zinc-300 text-lg leading-none">✕</button>
            </div>

            <div className="bg-zinc-950 p-3 rounded-xl border border-zinc-800 space-y-1.5 text-xs">
              <div className="flex justify-between">
                <span className="text-zinc-400">Originally Issued:</span>
                <span className="font-bold text-amber-400">{selectedIssueForReturn.quantityIssued} {selectedIssueForReturn.unit}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-400">Already Returned:</span>
                <span className="font-bold text-cyan-400">{selectedIssueForReturn.quantityReturned || 0} {selectedIssueForReturn.unit}</span>
              </div>
              <div className="flex justify-between pt-1.5 border-t border-zinc-800">
                <span className="text-zinc-300 font-medium">Max Returnable Remaining:</span>
                <span className="font-extrabold text-emerald-400">
                  {selectedIssueForReturn.quantityIssued - (selectedIssueForReturn.quantityReturned || 0)} {selectedIssueForReturn.unit}
                </span>
              </div>
            </div>

            <form onSubmit={handleReturnMaterial} className="space-y-3 text-xs">
              <div>
                <label className="block text-zinc-400 font-medium mb-1">
                  Quantity Returning to Storage ({selectedIssueForReturn.unit}) *
                </label>
                <input
                  type="number"
                  step="any"
                  placeholder={`Max: ${selectedIssueForReturn.quantityIssued - (selectedIssueForReturn.quantityReturned || 0)}`}
                  max={selectedIssueForReturn.quantityIssued - (selectedIssueForReturn.quantityReturned || 0)}
                  min="0.01"
                  value={returnForm.quantityReturned}
                  onChange={(e) => setReturnForm({ ...returnForm, quantityReturned: e.target.value })}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-xl p-2.5 text-white font-bold"
                  required
                />
              </div>

              <div>
                <label className="block text-zinc-400 font-medium mb-1">Returned By / Received By</label>
                <input
                  type="text"
                  placeholder="e.g. Site Engineer / Yard Supervisor"
                  value={returnForm.returnedBy}
                  onChange={(e) => setReturnForm({ ...returnForm, returnedBy: e.target.value })}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-xl p-2.5 text-white"
                />
              </div>

              <div>
                <label className="block text-zinc-400 font-medium mb-1">Reason / Remarks (Optional)</label>
                <textarea
                  placeholder="e.g. Unused excess cement returned after slab completion"
                  value={returnForm.remarks}
                  onChange={(e) => setReturnForm({ ...returnForm, remarks: e.target.value })}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-xl p-2.5 text-white h-16 resize-none"
                />
              </div>

              <div className="pt-2 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsReturnModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-zinc-800 text-zinc-400 hover:bg-zinc-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-zinc-950 font-bold transition flex items-center space-x-1.5"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Confirm & Restore Stock</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
