'use client';

import React, { useState } from 'react';
import {
  Package, Plus, Search, Filter, AlertTriangle, TrendingDown, ArrowDownRight,
  ArrowUpRight, Truck, CheckCircle2, XCircle, FileText, Camera, Calendar, User, DollarSign
} from 'lucide-react';
import { MaterialCategory, Supplier, MaterialInward, MaterialIssued, MaterialWastage } from '@/types';
import { getAppState, saveAppState, getStockSummary } from '@/lib/dbState';

export const MaterialModule: React.FC = () => {
  const [activeSubTab, setActiveSubTab] = useState<'stock' | 'inward' | 'issue' | 'wastage' | 'suppliers'>('stock');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<number | 'ALL'>('ALL');

  // Modals
  const [isInwardModalOpen, setIsInwardModalOpen] = useState(false);
  const [isIssueModalOpen, setIsIssueModalOpen] = useState(false);
  const [isSupplierModalOpen, setIsSupplierModalOpen] = useState(false);
  const [isWastageModalOpen, setIsWastageModalOpen] = useState(false);

  const state = getAppState();
  const stockSummary = getStockSummary();

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
    issuedTo: '',
    issuedBy: state.currentUser?.name || 'Site Engineer',
  });

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

  const handleAddIssue = (e: React.FormEvent) => {
    e.preventDefault();
    const qty = Number(issueForm.quantityIssued);
    if (!qty || qty <= 0) return;

    const cat = state.materialCategories.find(c => c.id === Number(issueForm.materialCategoryId));

    const newIssue: MaterialIssued = {
      id: Date.now(),
      materialCategoryId: Number(issueForm.materialCategoryId),
      itemName: issueForm.itemName || (cat ? cat.name : 'Material'),
      quantityIssued: qty,
      unit: cat ? cat.defaultUnit : 'units',
      issuedTo: issueForm.issuedTo,
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
      issuedTo: '',
      issuedBy: state.currentUser?.name || 'Site Engineer',
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

    const newWastage: MaterialWastage = {
      id: Date.now(),
      materialCategoryId: Number(wastageForm.materialCategoryId),
      itemName: wastageForm.itemName || (cat ? cat.name : 'Material'),
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
            onClick={() => setIsIssueModalOpen(true)}
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
                onClick={() => setIsIssueModalOpen(true)}
                className="mt-4 px-4 py-2 rounded-xl bg-amber-500 text-zinc-950 font-bold text-xs"
              >
                + Issue Material
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              {state.materialIssued.map((item) => (
                <div key={item.id} className="p-4 rounded-xl bg-zinc-900 border border-zinc-800 space-y-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="text-sm font-bold text-white">{item.itemName}</div>
                      <div className="text-xs text-zinc-400 mt-0.5">
                        Issued To: <span className="text-amber-300 font-medium">{item.issuedTo}</span>
                      </div>
                    </div>
                    <div className="text-base font-black text-amber-400">
                      -{item.quantityIssued} {item.unit}
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-zinc-400 pt-2 border-t border-zinc-800">
                    <div>Issued By: <span className="text-zinc-300">{item.issuedBy || 'Engineer'}</span></div>
                    <div>Date: <span className="text-zinc-300">{new Date(item.dateIssued).toLocaleDateString()}</span></div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* SUB-TAB 4: WASTAGE & RETURNS */}
      {activeSubTab === 'wastage' && (
        <div className="space-y-3">
          <div className="flex justify-end">
            <button
              onClick={() => setIsWastageModalOpen(true)}
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
              {state.materialWastage.map((w) => (
                <div key={w.id} className="p-4 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-between">
                  <div>
                    <div className="text-sm font-bold text-white">{w.itemName}</div>
                    <div className="text-xs text-red-400 mt-0.5 font-medium">Reason: {w.reason}</div>
                    {w.notes && <div className="text-[11px] text-zinc-500 mt-1">{w.notes}</div>}
                  </div>
                  <div className="text-right">
                    <div className="text-base font-bold text-red-400">-{w.quantity} {w.unit}</div>
                    <div className="text-[10px] text-zinc-500">{new Date(w.dateLogged).toLocaleDateString()}</div>
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
              className="px-3 py-1.5 rounded-lg bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 text-xs font-bold border border-emerald-500/30"
            >
              + Add Supplier / Vendor
            </button>
          </div>

          {state.suppliers.length === 0 ? (
            <div className="p-8 text-center bg-zinc-900/60 rounded-2xl border border-zinc-800">
              <User className="w-10 h-10 text-zinc-600 mx-auto mb-3" />
              <h3 className="font-bold text-sm text-zinc-300">No Suppliers Added Yet</h3>
              <p className="text-xs text-zinc-500 mt-1">Add material vendors & suppliers to link with GRN deliveries.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {state.suppliers.map((s) => (
                <div key={s.id} className="p-4 rounded-xl bg-zinc-900 border border-zinc-800 space-y-2">
                  <div className="font-bold text-sm text-white">{s.name}</div>
                  {s.contactPerson && <div className="text-xs text-zinc-400">Contact: {s.contactPerson}</div>}
                  {s.phone && <div className="text-xs text-emerald-400 font-mono">{s.phone}</div>}
                  {s.gstNumber && <div className="text-[10px] text-zinc-500">GST: {s.gstNumber}</div>}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* MODAL: ADD INWARD DELIVERY (GRN) */}
      {isInwardModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl max-w-lg w-full p-6 text-zinc-100 space-y-4 my-8">
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
                <label className="block text-zinc-400 font-medium mb-1">Item Description / Brand</label>
                <input
                  type="text"
                  placeholder="e.g. Ultratech OPC 53 Grade Cement"
                  value={inwardForm.itemName}
                  onChange={(e) => setInwardForm({ ...inwardForm, itemName: e.target.value })}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-xl p-2.5 text-white"
                  required
                />
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
                  onChange={(e) => setIssueForm({ ...issueForm, materialCategoryId: Number(e.target.value) })}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-xl p-2.5 text-white"
                >
                  {state.materialCategories.map((c) => (
                    <option key={c.id} value={c.id}>{c.name} ({c.defaultUnit})</option>
                  ))}
                </select>
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

              <div>
                <label className="block text-zinc-400 font-medium mb-1">Issued To (Contractor / Floor / Wing)</label>
                <input
                  type="text"
                  placeholder="e.g. Apex Masonry Works (Wing B1, Floor 3)"
                  value={issueForm.issuedTo}
                  onChange={(e) => setIssueForm({ ...issueForm, issuedTo: e.target.value })}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-xl p-2.5 text-white"
                  required
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
    </div>
  );
};
