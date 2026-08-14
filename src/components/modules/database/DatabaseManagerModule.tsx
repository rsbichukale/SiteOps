'use client';

import React, { useState } from 'react';
import {
  Database, HardHat, Package, FileText, Download, Upload, Plus, Trash2, Edit2, Check,
  Search, RefreshCw, Server, AlertTriangle, ShieldCheck, Copy, Eye, Building, Truck, Banknote, Users
} from 'lucide-react';
import { ContractorMaster, MaterialCategory, ExpenseCategory, EquipmentTypeMaster, Supplier } from '@/types';
import {
  getAppState, saveContractor, deleteContractor, saveMaterialCategory, deleteMaterialCategory,
  saveExpenseCategory, deleteExpenseCategory, saveEquipmentType, deleteEquipmentType,
  saveSupplier, deleteSupplier, exportDatabaseBackup, importDatabaseBackup
} from '@/lib/dbState';
import { Modal } from '@/components/ui/Modal';
import { Badge } from '@/components/ui/Badge';
import { FormInput } from '@/components/ui/FormInput';

import { useSiteOpsState } from '@/hooks/useSiteOpsState';

export const DatabaseManagerModule: React.FC = () => {
  const { state, updateState } = useSiteOpsState();
  const [activeTab, setActiveTab] = useState<'contractors' | 'materialCategories' | 'expenseCategories' | 'equipmentTypes' | 'suppliers'>('contractors');
  const [searchQuery, setSearchQuery] = useState('');

  // Contractor Form State
  const [showContractorModal, setShowContractorModal] = useState(false);
  const [editingContractorId, setEditingContractorId] = useState<number | null>(null);
  const [contractorName, setContractorName] = useState('');
  const [contractorTrade, setContractorTrade] = useState('Tiles');
  const [contractorPhone, setContractorPhone] = useState('');
  const [contractorRate, setContractorRate] = useState<number>(0);
  const [contractorNotes, setContractorNotes] = useState('');

  // Material Category Form State
  const [showCatModal, setShowCatModal] = useState(false);
  const [editingCatId, setEditingCatId] = useState<number | null>(null);
  const [catName, setCatName] = useState('');
  const [catCode, setCatCode] = useState('');
  const [catUnit, setCatUnit] = useState('bags');
  const [catThreshold, setCatThreshold] = useState<number>(10);

  // Expense Category Form State
  const [showExpModal, setShowExpModal] = useState(false);
  const [editingExpId, setEditingExpId] = useState<number | null>(null);
  const [expName, setExpName] = useState('');

  // Equipment Type Form State
  const [showEqModal, setShowEqModal] = useState(false);
  const [editingEqId, setEditingEqId] = useState<number | null>(null);
  const [eqName, setEqName] = useState('');
  const [eqCategory, setEqCategory] = useState('HEAVY_EARTHMOVING');

  // Supplier Form State
  const [showSupplierModal, setShowSupplierModal] = useState(false);
  const [editingSupplierId, setEditingSupplierId] = useState<number | null>(null);
  const [supplierName, setSupplierName] = useState('');
  const [supplierContact, setSupplierContact] = useState('');
  const [supplierPhone, setSupplierPhone] = useState('');
  const [supplierGst, setSupplierGst] = useState('');

  // Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const refreshState = () => {
    // State is automatically synced via useSiteOpsState listener
  };

  // --- Contractor Handlers ---
  const handleOpenAddContractor = () => {
    setEditingContractorId(null);
    setContractorName('');
    setContractorTrade('Tiles');
    setContractorPhone('');
    setContractorRate(0);
    setContractorNotes('');
    setShowContractorModal(true);
  };

  const handleOpenEditContractor = (c: ContractorMaster) => {
    setEditingContractorId(c.id);
    setContractorName(c.name);
    setContractorTrade(c.trade);
    setContractorPhone(c.phone || '');
    setContractorRate(c.defaultRatePerWorker || 0);
    setContractorNotes(c.notes || '');
    setShowContractorModal(true);
  };

  const handleSaveContractor = () => {
    if (!contractorName.trim()) return;
    saveContractor({
      id: editingContractorId || 0,
      name: contractorName.trim(),
      trade: contractorTrade,
      phone: contractorPhone.trim() || undefined,
      status: 'ACTIVE',
      defaultRatePerWorker: contractorRate || undefined,
      notes: contractorNotes.trim() || undefined,
    });
    refreshState();
    setShowContractorModal(false);
    showToast(`Contractor "${contractorName}" saved successfully!`);
  };

  const handleDeleteContractor = (id: number, name: string) => {
    if (confirm(`Delete contractor "${name}"?`)) {
      deleteContractor(id);
      refreshState();
      showToast(`Contractor "${name}" deleted.`);
    }
  };

  // --- Material Category Handlers ---
  const handleOpenAddCat = () => {
    setEditingCatId(null);
    setCatName('');
    setCatCode('');
    setCatUnit('bags');
    setCatThreshold(10);
    setShowCatModal(true);
  };

  const handleOpenEditCat = (c: MaterialCategory) => {
    setEditingCatId(c.id);
    setCatName(c.name);
    setCatCode(c.code);
    setCatUnit(c.defaultUnit);
    setCatThreshold(c.lowStockThreshold);
    setShowCatModal(true);
  };

  const handleSaveCat = () => {
    if (!catName.trim()) return;
    saveMaterialCategory({
      id: editingCatId || 0,
      name: catName.trim(),
      code: catCode.trim() || catName.toUpperCase().replace(/\s+/g, '_'),
      defaultUnit: catUnit.trim() || 'units',
      lowStockThreshold: Number(catThreshold) || 10
    });
    refreshState();
    setShowCatModal(false);
    showToast(`Material Category "${catName}" saved!`);
  };

  const handleDeleteCat = (id: number, name: string) => {
    if (confirm(`Delete Material Category "${name}"?`)) {
      deleteMaterialCategory(id);
      refreshState();
      showToast(`Category "${name}" deleted.`);
    }
  };

  // --- Expense Category Handlers ---
  const handleOpenAddExp = () => {
    setEditingExpId(null);
    setExpName('');
    setShowExpModal(true);
  };

  const handleSaveExp = () => {
    if (!expName.trim()) return;
    saveExpenseCategory({
      id: editingExpId || 0,
      name: expName.trim()
    });
    refreshState();
    setShowExpModal(false);
    showToast(`Expense Category "${expName}" saved!`);
  };

  const handleDeleteExp = (id: number, name: string) => {
    if (confirm(`Delete Expense Category "${name}"?`)) {
      deleteExpenseCategory(id);
      refreshState();
      showToast(`Expense Category "${name}" deleted.`);
    }
  };

  // --- Equipment Type Handlers ---
  const handleOpenAddEq = () => {
    setEditingEqId(null);
    setEqName('');
    setEqCategory('HEAVY_EARTHMOVING');
    setShowEqModal(true);
  };

  const handleSaveEq = () => {
    if (!eqName.trim()) return;
    saveEquipmentType({
      id: editingEqId || 0,
      name: eqName.trim(),
      category: eqCategory
    });
    refreshState();
    setShowEqModal(false);
    showToast(`Equipment Type "${eqName}" saved!`);
  };

  const handleDeleteEq = (id: number, name: string) => {
    if (confirm(`Delete Equipment Type "${name}"?`)) {
      deleteEquipmentType(id);
      refreshState();
      showToast(`Equipment Type "${name}" deleted.`);
    }
  };

  // --- Backup Handlers ---
  const handleExportBackup = () => {
    const jsonStr = exportDatabaseBackup();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `SiteOps_Database_Backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    showToast('Database backup JSON exported successfully!');
  };

  const handleImportBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = event => {
      const content = event.target?.result as string;
      if (content && importDatabaseBackup(content)) {
        refreshState();
        showToast('Database restored successfully from backup JSON!');
      } else {
        alert('Invalid database backup JSON file format.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-emerald-500 text-zinc-950 font-bold px-4 py-2.5 rounded-xl shadow-2xl flex items-center gap-2 animate-bounce">
          <Check className="w-5 h-5" /> {toastMessage}
        </div>
      )}

      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
        <div>
          <div className="flex items-center gap-2 text-emerald-400 font-semibold text-xs tracking-wider uppercase">
            <Database className="w-4 h-4" /> Master Data Management Center
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-zinc-100 mt-1">
            Create & Alter Master Records
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            Add, Edit, and Delete Core Master Records across Contractors, Material Categories, Expense Types, Equipment, and Suppliers.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportBackup}
            className="px-3.5 py-2 text-xs font-bold bg-zinc-800 text-zinc-200 border border-zinc-700 rounded-xl hover:bg-zinc-700 flex items-center gap-1.5 transition-all"
          >
            <Download className="w-4 h-4 text-emerald-400" /> Export JSON
          </button>
        </div>
      </div>

      {/* Master Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-zinc-800 pb-2">
        <button
          onClick={() => setActiveTab('contractors')}
          className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 ${
            activeTab === 'contractors'
              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold'
              : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <HardHat className="w-4 h-4" /> Contractors Master
        </button>

        <button
          onClick={() => setActiveTab('materialCategories')}
          className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 ${
            activeTab === 'materialCategories'
              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold'
              : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <Package className="w-4 h-4" /> Material Categories
        </button>

        <button
          onClick={() => setActiveTab('expenseCategories')}
          className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 ${
            activeTab === 'expenseCategories'
              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold'
              : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <Banknote className="w-4 h-4" /> Expense Categories
        </button>

        <button
          onClick={() => setActiveTab('equipmentTypes')}
          className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 ${
            activeTab === 'equipmentTypes'
              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold'
              : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <Truck className="w-4 h-4" /> Machinery Types
        </button>

      </div>

      {/* 1. CONTRACTORS MASTER */}
      {activeTab === 'contractors' && (
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
            <h2 className="text-sm font-semibold text-zinc-100 flex items-center gap-2">
              <HardHat className="w-4 h-4 text-emerald-400" />
              Contractors Master Register ({state.contractorsMaster.length})
            </h2>
            <button
              onClick={handleOpenAddContractor}
              className="px-3 py-1.5 text-xs font-bold bg-emerald-500 text-zinc-950 rounded-lg hover:bg-emerald-400 flex items-center gap-1 shadow"
            >
              <Plus className="w-4 h-4" /> Add Contractor
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-zinc-300">
              <thead className="bg-zinc-950 text-zinc-400 uppercase tracking-wider text-[10px] border-b border-zinc-800">
                <tr>
                  <th className="px-4 py-3">Contractor Name</th>
                  <th className="px-4 py-3">Trade / Specialty</th>
                  <th className="px-4 py-3">Phone</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60">
                {state.contractorsMaster.map(c => (
                  <tr key={c.id} className="hover:bg-zinc-950/50">
                    <td className="px-4 py-3 font-semibold text-zinc-100">{c.name}</td>
                    <td className="px-4 py-3 text-emerald-400 font-medium">{c.trade}</td>
                    <td className="px-4 py-3 font-mono text-zinc-400">{c.phone || '-'}</td>
                    <td className="px-4 py-3"><Badge variant="emerald">{c.status}</Badge></td>
                    <td className="px-4 py-3 text-right space-x-2">
                      <button
                        onClick={() => handleOpenEditContractor(c)}
                        className="p-1 text-zinc-400 hover:text-emerald-400"
                        title="Edit Contractor"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteContractor(c.id, c.name)}
                        className="p-1 text-zinc-400 hover:text-rose-400"
                        title="Delete Contractor"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 2. MATERIAL CATEGORIES MASTER */}
      {activeTab === 'materialCategories' && (
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
            <h2 className="text-sm font-semibold text-zinc-100 flex items-center gap-2">
              <Package className="w-4 h-4 text-emerald-400" />
              Stock Item Categories Master ({state.materialCategories.length})
            </h2>
            <button
              onClick={handleOpenAddCat}
              className="px-3 py-1.5 text-xs font-bold bg-emerald-500 text-zinc-950 rounded-lg hover:bg-emerald-400 flex items-center gap-1 shadow"
            >
              <Plus className="w-4 h-4" /> Add Category
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-zinc-300">
              <thead className="bg-zinc-950 text-zinc-400 uppercase tracking-wider text-[10px] border-b border-zinc-800">
                <tr>
                  <th className="px-4 py-3">Category Name</th>
                  <th className="px-4 py-3">Code</th>
                  <th className="px-4 py-3">Default Unit</th>
                  <th className="px-4 py-3">Low Stock Threshold</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60">
                {state.materialCategories.map(cat => (
                  <tr key={cat.id} className="hover:bg-zinc-950/50">
                    <td className="px-4 py-3 font-semibold text-zinc-100">{cat.name}</td>
                    <td className="px-4 py-3 font-mono text-emerald-400">{cat.code}</td>
                    <td className="px-4 py-3 text-zinc-300 font-medium">{cat.defaultUnit}</td>
                    <td className="px-4 py-3 text-amber-400 font-bold">{cat.lowStockThreshold} {cat.defaultUnit}</td>
                    <td className="px-4 py-3 text-right space-x-2">
                      <button onClick={() => handleOpenEditCat(cat)} className="p-1 text-zinc-400 hover:text-emerald-400">
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDeleteCat(cat.id, cat.name)} className="p-1 text-zinc-400 hover:text-rose-400">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 3. EXPENSE CATEGORIES MASTER */}
      {activeTab === 'expenseCategories' && (
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
            <h2 className="text-sm font-semibold text-zinc-100 flex items-center gap-2">
              <Banknote className="w-4 h-4 text-emerald-400" />
              Petty Cash Expense Categories ({state.expenseCategories.length})
            </h2>
            <button
              onClick={handleOpenAddExp}
              className="px-3 py-1.5 text-xs font-bold bg-emerald-500 text-zinc-950 rounded-lg hover:bg-emerald-400 flex items-center gap-1 shadow"
            >
              <Plus className="w-4 h-4" /> Add Category
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {state.expenseCategories.map(exp => (
              <div key={exp.id} className="p-3 bg-zinc-950 border border-zinc-800 rounded-lg flex items-center justify-between">
                <span className="text-xs font-semibold text-zinc-100">{exp.name}</span>
                <button onClick={() => handleDeleteExp(exp.id, exp.name)} className="p-1 text-zinc-400 hover:text-rose-400">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 4. MACHINERY TYPES MASTER */}
      {activeTab === 'equipmentTypes' && (
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
            <h2 className="text-sm font-semibold text-zinc-100 flex items-center gap-2">
              <Truck className="w-4 h-4 text-emerald-400" />
              Machinery & Equipment Types Master ({state.equipmentTypes.length})
            </h2>
            <button
              onClick={handleOpenAddEq}
              className="px-3 py-1.5 text-xs font-bold bg-emerald-500 text-zinc-950 rounded-lg hover:bg-emerald-400 flex items-center gap-1 shadow"
            >
              <Plus className="w-4 h-4" /> Add Equipment Type
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {state.equipmentTypes.map(eq => (
              <div key={eq.id} className="p-3 bg-zinc-950 border border-zinc-800 rounded-lg flex items-center justify-between">
                <div>
                  <div className="text-xs font-semibold text-zinc-100">{eq.name}</div>
                  <div className="text-[10px] text-emerald-400 font-mono">{eq.category}</div>
                </div>
                <button onClick={() => handleDeleteEq(eq.id, eq.name)} className="p-1 text-zinc-400 hover:text-rose-400">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}



      {/* Contractor Modal */}
      <Modal isOpen={showContractorModal} onClose={() => setShowContractorModal(false)} title={editingContractorId ? 'Alter Contractor Record' : 'Create New Contractor'}>
        <div className="space-y-4">
          <FormInput label="Contractor / Agency Name" value={contractorName} onChange={e => setContractorName(e.target.value)} placeholder="e.g. Suraj Chauhan" />
          
          <div className="space-y-1.5">
            <FormInput label="Trade / Work Specialty" value={contractorTrade} onChange={e => setContractorTrade(e.target.value)} placeholder="e.g. Tiles & Granite" />
            <div className="flex flex-wrap gap-1.5 pt-1">
              {['Tiles', 'Waterproofing', 'Plumbing', 'Electrical', 'Steel Fitter', 'Carpenter', 'Civil & Masonry', 'Painting', 'Fabrication', 'False Ceiling'].map(t => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setContractorTrade(t)}
                  className={`px-2 py-0.5 text-[10px] font-semibold rounded-md border transition ${
                    contractorTrade === t
                      ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                      : 'bg-zinc-800/80 text-zinc-400 border-zinc-700 hover:text-white'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          <FormInput label="Phone Number" value={contractorPhone} onChange={e => setContractorPhone(e.target.value)} placeholder="+91 98220 12345" />
          <FormInput label="Default Daily Rate (₹)" type="number" value={contractorRate} onChange={e => setContractorRate(Number(e.target.value))} placeholder="Optional rate per worker" />
          <FormInput label="Notes / Scope of Work" value={contractorNotes} onChange={e => setContractorNotes(e.target.value)} placeholder="e.g. Window and door frame, kitchen wall tiles laying" />

          <div className="flex justify-end gap-2 pt-3">
            <button onClick={() => setShowContractorModal(false)} className="px-4 py-2 text-xs font-medium bg-zinc-800 text-zinc-300 rounded-lg">Cancel</button>
            <button onClick={handleSaveContractor} className="px-4 py-2 text-xs font-bold bg-emerald-500 text-zinc-950 rounded-lg">Save Record</button>
          </div>
        </div>
      </Modal>

      {/* Material Category Modal */}
      <Modal isOpen={showCatModal} onClose={() => setShowCatModal(false)} title={editingCatId ? 'Alter Stock Category' : 'Create New Stock Category'}>
        <div className="space-y-4">
          <FormInput label="Category Name" value={catName} onChange={e => setCatName(e.target.value)} placeholder="e.g. OPC 53 Grade Cement" />
          <FormInput label="Code" value={catCode} onChange={e => setCatCode(e.target.value)} placeholder="e.g. CEMENT_OPC" />
          <FormInput label="Default Unit" value={catUnit} onChange={e => setCatUnit(e.target.value)} placeholder="e.g. bags / tonnes / loads" />
          <FormInput label="Low Stock Threshold Alert" type="number" value={catThreshold} onChange={e => setCatThreshold(Number(e.target.value))} />
          <div className="flex justify-end gap-2 pt-3">
            <button onClick={() => setShowCatModal(false)} className="px-4 py-2 text-xs font-medium bg-zinc-800 text-zinc-300 rounded-lg">Cancel</button>
            <button onClick={handleSaveCat} className="px-4 py-2 text-xs font-bold bg-emerald-500 text-zinc-950 rounded-lg">Save Category</button>
          </div>
        </div>
      </Modal>

      {/* Expense Category Modal */}
      <Modal isOpen={showExpModal} onClose={() => setShowExpModal(false)} title="Create New Expense Category">
        <div className="space-y-4">
          <FormInput label="Category Name" value={expName} onChange={e => setExpName(e.target.value)} placeholder="e.g. Tea & Snacks" />
          <div className="flex justify-end gap-2 pt-3">
            <button onClick={() => setShowExpModal(false)} className="px-4 py-2 text-xs font-medium bg-zinc-800 text-zinc-300 rounded-lg">Cancel</button>
            <button onClick={handleSaveExp} className="px-4 py-2 text-xs font-bold bg-emerald-500 text-zinc-950 rounded-lg">Save Category</button>
          </div>
        </div>
      </Modal>

      {/* Equipment Type Modal */}
      <Modal isOpen={showEqModal} onClose={() => setShowEqModal(false)} title="Create New Equipment Type">
        <div className="space-y-4">
          <FormInput label="Equipment Type Name" value={eqName} onChange={e => setEqName(e.target.value)} placeholder="e.g. Concrete Mixer Machine 10/7" />
          <FormInput label="Category" value={eqCategory} onChange={e => setEqCategory(e.target.value)} placeholder="e.g. CONCRETE_EQUIPMENT" />
          <div className="flex justify-end gap-2 pt-3">
            <button onClick={() => setShowEqModal(false)} className="px-4 py-2 text-xs font-medium bg-zinc-800 text-zinc-300 rounded-lg">Cancel</button>
            <button onClick={handleSaveEq} className="px-4 py-2 text-xs font-bold bg-emerald-500 text-zinc-950 rounded-lg">Save Type</button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
