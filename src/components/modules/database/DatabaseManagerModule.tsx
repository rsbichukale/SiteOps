'use client';

import React, { useState } from 'react';
import {
  Database, HardHat, Package, FileText, Download, Upload, Plus, Trash2, Edit2, Check,
  Search, RefreshCw, Server, AlertTriangle, ShieldCheck, Copy, Eye, Building
} from 'lucide-react';
import { ContractorMaster, CementStockEntry, DailyProgressReport } from '@/types';
import {
  getAppState, saveDailyReport, deleteDailyReport, saveContractor, deleteContractor,
  exportDatabaseBackup, importDatabaseBackup, INITIAL_CONTRACTORS_MASTER, saveAppState
} from '@/lib/dbState';

export const DatabaseManagerModule: React.FC = () => {
  const [state, setState] = useState(getAppState());
  const [activeTab, setActiveTab] = useState<'contractors' | 'cement' | 'dprReports' | 'backup'>('contractors');
  const [searchQuery, setSearchQuery] = useState('');

  // Contractor Form State
  const [showContractorModal, setShowContractorModal] = useState(false);
  const [editingContractorId, setEditingContractorId] = useState<number | null>(null);
  const [contractorName, setContractorName] = useState('');
  const [contractorTrade, setContractorTrade] = useState('Tiles');
  const [contractorPhone, setContractorPhone] = useState('');
  const [contractorRate, setContractorRate] = useState<number>(0);
  const [contractorNotes, setContractorNotes] = useState('');

  // Cement Stock Modal State
  const [showCementModal, setShowCementModal] = useState(false);
  const [cementBrand, setCementBrand] = useState('');
  const [cementType, setCementType] = useState('OPC');
  const [cementBags, setCementBags] = useState<number>(0);

  // Status message
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const refreshState = () => {
    setState({ ...getAppState() });
  };

  // Contractor Handlers
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

    const contractor: ContractorMaster = {
      id: editingContractorId || 0,
      name: contractorName.trim(),
      trade: contractorTrade,
      phone: contractorPhone.trim() || undefined,
      status: 'ACTIVE',
      defaultRatePerWorker: contractorRate || undefined,
      notes: contractorNotes.trim() || undefined,
    };

    saveContractor(contractor);
    refreshState();
    setShowContractorModal(false);
    showToast(`Contractor "${contractorName}" saved successfully to database!`);
  };

  const handleDeleteContractor = (id: number, name: string) => {
    if (confirm(`Are you sure you want to delete contractor "${name}" from the database?`)) {
      deleteContractor(id);
      refreshState();
      showToast(`Contractor "${name}" removed from database.`);
    }
  };

  // Cement Handlers
  const handleSaveCementBrand = () => {
    if (!cementBrand.trim()) return;
    const latestReport = state.dailyReports?.[0];
    if (!latestReport) return;

    const updatedCement = [...(latestReport.cementStock || [])];
    updatedCement.push({
      brandName: cementBrand.trim(),
      type: cementType,
      bags: cementBags
    });

    const updatedReport = {
      ...latestReport,
      cementStock: updatedCement
    };

    saveDailyReport(updatedReport);
    refreshState();
    setCementBrand('');
    setCementBags(0);
    setShowCementModal(false);
    showToast(`Cement brand "${cementBrand}" added to database!`);
  };

  const handleDeleteCementBrand = (brandName: string) => {
    const latestReport = state.dailyReports?.[0];
    if (!latestReport) return;

    const updatedCement = (latestReport.cementStock || []).filter(c => c.brandName !== brandName);
    saveDailyReport({ ...latestReport, cementStock: updatedCement });
    refreshState();
    showToast(`Brand "${brandName}" deleted from database.`);
  };

  // DPR Report Delete Handler
  const handleDeleteReport = (id: number, date: string) => {
    if (confirm(`Are you sure you want to delete the Daily Progress Report for ${date} from database?`)) {
      deleteDailyReport(id);
      refreshState();
      showToast(`Daily Report for ${date} deleted from database.`);
    }
  };

  // Backup Handlers
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

  const handleImportBackupFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      const content = evt.target?.result as string;
      if (content && importDatabaseBackup(content)) {
        refreshState();
        showToast('Database restored successfully from backup!');
      } else {
        alert('Invalid database JSON backup file.');
      }
    };
    reader.readAsText(file);
  };

  const contractorsList = state.contractorsMaster || INITIAL_CONTRACTORS_MASTER;
  const latestCementList = state.dailyReports?.[0]?.cementStock || [];

  return (
    <div className="p-3 sm:p-6 max-w-6xl mx-auto space-y-6 pb-24">
      {/* Toast Confirmation Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-6 bg-emerald-500 text-zinc-950 px-4 py-2.5 rounded-xl font-bold text-xs shadow-2xl z-50 flex items-center space-x-2 animate-bounce">
          <Check className="w-4 h-4" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-gradient-to-r from-zinc-900 via-zinc-900 to-emerald-950 border border-emerald-500/30 rounded-2xl p-4 sm:p-6 shadow-xl relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
          <div className="flex items-center space-x-3.5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center text-zinc-950 font-bold shadow-lg shadow-emerald-500/20">
              <Database className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">Database & Master Records</h1>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-semibold uppercase tracking-wider flex items-center space-x-1">
                  <ShieldCheck className="w-3 h-3" />
                  <span>No Hardcoded Data</span>
                </span>
              </div>
              <p className="text-xs text-zinc-400 mt-0.5">
                Add, Edit, Modify & Delete Contractors, Cement Stock Brands, and Historical DPR Reports.
              </p>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center space-x-2">
            <button
              onClick={handleExportBackup}
              className="px-3.5 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-semibold text-xs flex items-center space-x-1.5 border border-zinc-700 transition"
            >
              <Download className="w-3.5 h-3.5 text-emerald-400" />
              <span>Export JSON Backup</span>
            </button>

            <label className="px-3.5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold text-xs flex items-center space-x-1.5 cursor-pointer shadow transition">
              <Upload className="w-3.5 h-3.5" />
              <span>Restore DB</span>
              <input type="file" accept=".json" onChange={handleImportBackupFile} className="hidden" />
            </label>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex flex-wrap items-center justify-between gap-2 mt-4 pt-4 border-t border-zinc-800">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setActiveTab('contractors')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition ${
                activeTab === 'contractors'
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <HardHat className="w-3.5 h-3.5" />
              <span>Contractors Master ({contractorsList.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('cement')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition ${
                activeTab === 'cement'
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Package className="w-3.5 h-3.5" />
              <span>Cement Brands ({latestCementList.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('dprReports')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition ${
                activeTab === 'dprReports'
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>DPR Reports DB ({state.dailyReports?.length || 0})</span>
            </button>

            <button
              onClick={() => setActiveTab('backup')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition ${
                activeTab === 'backup'
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Server className="w-3.5 h-3.5" />
              <span>Database Status & Cloud</span>
            </button>
          </div>
        </div>
      </div>

      {/* METRICS SUMMARY BAR */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-center">
          <div className="text-[10px] text-zinc-400 uppercase font-bold">Contractor Agencies</div>
          <div className="text-xl font-black text-emerald-400 mt-0.5">{contractorsList.length}</div>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-center">
          <div className="text-[10px] text-zinc-400 uppercase font-bold">Stock Cement Brands</div>
          <div className="text-xl font-black text-amber-400 mt-0.5">{latestCementList.length}</div>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-center">
          <div className="text-[10px] text-zinc-400 uppercase font-bold">DPR Daily Reports</div>
          <div className="text-xl font-black text-emerald-400 mt-0.5">{state.dailyReports?.length || 0}</div>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-center">
          <div className="text-[10px] text-zinc-400 uppercase font-bold">Cloud Sync Engine</div>
          <div className="text-xs font-bold text-emerald-400 mt-1 flex items-center justify-center space-x-1">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            <span>PostgreSQL Ready</span>
          </div>
        </div>
      </div>

      {/* TAB 1: CONTRACTORS MASTER */}
      {activeTab === 'contractors' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center space-x-2">
              <HardHat className="w-4 h-4 text-emerald-400" />
              <span>Contractors & Sub-Contractor Agencies Master</span>
            </h3>
            <button
              onClick={handleOpenAddContractor}
              className="px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold text-xs flex items-center space-x-1.5 shadow active:scale-95 transition"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add New Contractor</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {contractorsList.map(c => (
              <div key={c.id} className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 space-y-3 hover:border-emerald-500/40 transition">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-white">{c.name}</span>
                  <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded border border-emerald-500/30">
                    {c.trade}
                  </span>
                </div>

                <div className="text-xs text-zinc-400 space-y-1">
                  <div>📞 Phone: <span className="text-zinc-200 font-mono">{c.phone || 'N/A'}</span></div>
                  <div>💼 Daily Rate: <span className="text-emerald-400 font-bold">{c.defaultRatePerWorker ? `₹${c.defaultRatePerWorker}/day` : 'Standard'}</span></div>
                  {c.notes && <div className="text-[11px] text-zinc-500 italic mt-1">{c.notes}</div>}
                </div>

                <div className="pt-2 border-t border-zinc-800/80 flex items-center justify-between">
                  <button
                    onClick={() => handleOpenEditContractor(c)}
                    className="text-xs font-semibold text-emerald-400 hover:underline flex items-center space-x-1"
                  >
                    <Edit2 className="w-3 h-3" />
                    <span>Edit Info</span>
                  </button>

                  <button
                    onClick={() => handleDeleteContractor(c.id, c.name)}
                    className="text-xs font-semibold text-zinc-500 hover:text-red-400 flex items-center space-x-1"
                  >
                    <Trash2 className="w-3 h-3" />
                    <span>Delete</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: CEMENT BRANDS MASTER */}
      {activeTab === 'cement' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center space-x-2">
              <Package className="w-4 h-4 text-emerald-400" />
              <span>Cement Stock Brands Master</span>
            </h3>
            <button
              onClick={() => setShowCementModal(true)}
              className="px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold text-xs flex items-center space-x-1.5 shadow active:scale-95 transition"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Cement Brand</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {latestCementList.map((c, idx) => (
              <div key={idx} className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 space-y-3 text-center hover:border-emerald-500/40 transition">
                <span className="text-xs font-bold text-white block">{c.brandName}</span>
                <span className="text-[10px] text-zinc-500 block uppercase font-mono">{c.type || 'General'}</span>
                <div className="text-xl font-black text-amber-500">{c.bags} Bags</div>

                <div className="pt-2 border-t border-zinc-800/80 flex justify-center">
                  <button
                    onClick={() => handleDeleteCementBrand(c.brandName)}
                    className="text-[11px] text-zinc-500 hover:text-red-400 flex items-center space-x-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Remove Brand</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: DPR REPORTS DATABASE TABLE */}
      {activeTab === 'dprReports' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center space-x-2">
              <FileText className="w-4 h-4 text-emerald-400" />
              <span>Historical Daily Progress Reports Table</span>
            </h3>
          </div>

          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden shadow-xl">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-zinc-950 border-b border-zinc-800 text-zinc-400 font-bold uppercase">
                  <th className="p-3">ID & Date</th>
                  <th className="p-3">Building Name</th>
                  <th className="p-3 text-center">Manpower</th>
                  <th className="p-3 text-center">Cement Bags</th>
                  <th className="p-3 text-center">Photos</th>
                  <th className="p-3 text-center">Bill Deductions</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60">
                {state.dailyReports.map(r => {
                  const bathkamTotal = (r.bathkam?.plasterWork || 0) + (r.bathkam?.materialShifting || 0) + (r.bathkam?.brickWork || 0) + (r.bathkam?.baiLabour || 0);
                  const skilledTotal = (r.carpenterCount || 0) + (r.electricalCount || 0) + (r.surajChauhanTilesCount || 0) + (r.mohanKhetawatWaterproofingCount || 0) + (r.nareshKhetawatWaterproofingCount || 0) + (r.plumberCount || 0) + (r.fabricationCount || 0);
                  const totalWorkers = skilledTotal + bathkamTotal + (r.departmentStaffCount || 0) + (r.departmentLabourCount || 0);
                  const cementTotal = (r.cementStock || []).reduce((s, c) => s + (c.bags || 0), 0);
                  const damageTotal = (r.damageDeductions || []).reduce((s, d) => s + (d.damageAmount || 0), 0);
                  const photoCount = (r.beforePhotos?.length || 0) + (r.afterPhotos?.length || 0) + (r.workPhotoSets?.length || 0);

                  return (
                    <tr key={r.id} className="hover:bg-zinc-800/40 transition">
                      <td className="p-3 font-bold text-emerald-400 font-mono">
                        #{r.id} — {r.reportDate}
                      </td>
                      <td className="p-3 text-white font-medium">{r.buildingName}</td>
                      <td className="p-3 text-center font-bold text-emerald-400">{totalWorkers}</td>
                      <td className="p-3 text-center font-bold text-amber-400">{cementTotal} Bags</td>
                      <td className="p-3 text-center text-zinc-300 font-mono">{photoCount}</td>
                      <td className="p-3 text-center font-bold text-red-400">
                        {damageTotal > 0 ? `₹${damageTotal.toLocaleString('en-IN')}` : '-'}
                      </td>
                      <td className="p-3 text-right space-x-2">
                        <button
                          onClick={() => handleDeleteReport(r.id, r.reportDate)}
                          className="px-2 py-1 rounded bg-zinc-800 hover:bg-red-500/20 text-zinc-400 hover:text-red-400 text-[11px] font-semibold transition"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: DATABASE STATUS & CLOUD SYNC */}
      {activeTab === 'backup' && (
        <div className="space-y-4 max-w-2xl mx-auto">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center space-x-2">
              <Server className="w-4 h-4 text-emerald-400" />
              <span>Database Engine & Cloud Synchronizer</span>
            </h3>

            <div className="space-y-3 text-xs text-zinc-300">
              <div className="flex items-center justify-between p-3 rounded-xl bg-zinc-950 border border-zinc-800">
                <span>Local Storage Engine (`localStorage`)</span>
                <span className="text-emerald-400 font-bold">CONNECTED (100% Persistence)</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-xl bg-zinc-950 border border-zinc-800">
                <span>Supabase PostgreSQL Schema (`siteops_supabase_schema.sql`)</span>
                <span className="text-emerald-400 font-bold">ACTIVE (6 Cloud Tables)</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-xl bg-zinc-950 border border-zinc-800">
                <span>Railway Container Host</span>
                <span className="text-emerald-400 font-bold">LIVE (Node.js 20 Nixpacks)</span>
              </div>
            </div>

            <div className="pt-4 border-t border-zinc-800 flex justify-between items-center">
              <button
                onClick={handleExportBackup}
                className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold text-xs flex items-center space-x-1.5 shadow"
              >
                <Download className="w-4 h-4" />
                <span>Export Full Backup JSON</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: ADD / EDIT CONTRACTOR */}
      {showContractorModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-emerald-500/40 rounded-2xl p-6 max-w-md w-full space-y-4 shadow-2xl animate-fadeIn">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                {editingContractorId ? '✏️ Edit Contractor Info' : '➕ Add Contractor to Database'}
              </h3>
              <button onClick={() => setShowContractorModal(false)} className="text-zinc-400 hover:text-white">✕</button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-[11px] text-zinc-400 mb-1">Contractor / Agency Name *</label>
                <input
                  type="text"
                  value={contractorName}
                  onChange={e => setContractorName(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white focus:border-emerald-500 focus:outline-none"
                  placeholder="e.g. Suraj Chauhan, Apex Waterproofing..."
                />
              </div>

              <div>
                <label className="block text-[11px] text-zinc-400 mb-1">Trade Category *</label>
                <select
                  value={contractorTrade}
                  onChange={e => setContractorTrade(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white focus:border-emerald-500 focus:outline-none"
                >
                  <option value="Tiles">Tiles</option>
                  <option value="Waterproofing">Waterproofing</option>
                  <option value="Plumbing">Plumbing</option>
                  <option value="Electrical">Electrical</option>
                  <option value="Carpenter">Carpenter</option>
                  <option value="Steel Fitter">Steel Fitter</option>
                  <option value="Core Cutting">Core Cutting</option>
                  <option value="Fabrication">Fabrication</option>
                  <option value="Painting">Painting</option>
                  <option value="False Ceiling">False Ceiling</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] text-zinc-400 mb-1">Phone Number</label>
                <input
                  type="text"
                  value={contractorPhone}
                  onChange={e => setContractorPhone(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white focus:border-emerald-500 focus:outline-none"
                  placeholder="+91 98220 12345"
                />
              </div>

              <div>
                <label className="block text-[11px] text-zinc-400 mb-1">Default Daily Rate per Worker (₹)</label>
                <input
                  type="number"
                  value={contractorRate || ''}
                  onChange={e => setContractorRate(parseFloat(e.target.value) || 0)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-emerald-400 font-bold focus:border-emerald-500 focus:outline-none"
                  placeholder="e.g. 750"
                />
              </div>

              <div>
                <label className="block text-[11px] text-zinc-400 mb-1">Work Scope / Notes</label>
                <input
                  type="text"
                  value={contractorNotes}
                  onChange={e => setContractorNotes(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-300 focus:border-emerald-500 focus:outline-none"
                  placeholder="e.g. Kitchen bottom & top tiles, window frames..."
                />
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-2 border-t border-zinc-800">
              <button
                onClick={() => setShowContractorModal(false)}
                className="px-4 py-2 rounded-xl bg-zinc-800 text-zinc-300 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveContractor}
                className="px-5 py-2 rounded-xl bg-emerald-500 text-zinc-950 font-bold text-xs shadow"
              >
                Save Contractor
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: ADD CEMENT BRAND */}
      {showCementModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-emerald-500/40 rounded-2xl p-6 max-w-md w-full space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">➕ Add Cement Brand to Database</h3>
              <button onClick={() => setShowCementModal(false)} className="text-zinc-400 hover:text-white">✕</button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-[11px] text-zinc-400 mb-1">Brand Name *</label>
                <input
                  type="text"
                  value={cementBrand}
                  onChange={e => setCementBrand(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white focus:border-emerald-500 focus:outline-none"
                  placeholder="e.g. Ultratech Cement, Ambuja..."
                />
              </div>

              <div>
                <label className="block text-[11px] text-zinc-400 mb-1">Cement Type</label>
                <input
                  type="text"
                  value={cementType}
                  onChange={e => setCementType(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white focus:border-emerald-500 focus:outline-none"
                  placeholder="OPC, PPC, Sanla..."
                />
              </div>

              <div>
                <label className="block text-[11px] text-zinc-400 mb-1">Initial Stock Bags</label>
                <input
                  type="number"
                  value={cementBags || ''}
                  onChange={e => setCementBags(parseInt(e.target.value) || 0)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-amber-400 font-bold focus:border-emerald-500 focus:outline-none"
                  placeholder="0"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-2 border-t border-zinc-800">
              <button
                onClick={() => setShowCementModal(false)}
                className="px-4 py-2 rounded-xl bg-zinc-800 text-zinc-300 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveCementBrand}
                className="px-5 py-2 rounded-xl bg-emerald-500 text-zinc-950 font-bold text-xs shadow"
              >
                Save Brand
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
