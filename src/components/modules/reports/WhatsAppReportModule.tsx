'use client';

import React, { useState } from 'react';
import {
  MessageSquare, Share2, Copy, Check, Calendar, Building, Users, HardHat,
  Package, Sparkles, Plus, Minus, RotateCcw, Clock, Save, History, FileText, Download, Sun, Moon, Trash2, Camera, Image as ImageIcon, AlertTriangle, ArrowRight, Layers
} from 'lucide-react';
import { DailyProgressReport, CementStockEntry, CustomTradeEntry, ReportWorkPhoto, MaterialDamageEntry, WorkProgressPhotoSet } from '@/types';
import { getAppState, saveDailyReport, generateWhatsAppReportText, DEFAULT_SAMPLE_REPORT } from '@/lib/dbState';
import { downloadDPRPdfReport } from '@/lib/pdfReportGenerator';

export const WhatsAppReportModule: React.FC = () => {
  const state = getAppState();
  const latestSavedReport = state.dailyReports?.[0] || DEFAULT_SAMPLE_REPORT;

  const [report, setReport] = useState<DailyProgressReport>({
    ...latestSavedReport,
    reportDate: new Date().toLocaleDateString('en-GB'), // e.g. 13/08/2026
    carpenterCount: 0,
    fitterCount: 0,
    electricalCount: 0,
    plumberCount: 0,
    coreCuttingCount: 0,
    fabricationCount: 0,
    surajChauhanTilesCount: 0,
    mohanKhetawatWaterproofingCount: 0,
    nareshKhetawatWaterproofingCount: 0,
    bathkam: {
      plasterWork: 0,
      materialShifting: 0,
      brickWork: 0,
      baiLabour: 0,
      breakerWork: 0,
    },
    departmentStaffCount: 0,
    departmentLabourCount: 0,
    beforePhotos: latestSavedReport.beforePhotos || [],
    afterPhotos: latestSavedReport.afterPhotos || [],
    workPhotoSets: latestSavedReport.workPhotoSets || [],
    damageDeductions: latestSavedReport.damageDeductions || [],
  });

  const [copied, setCopied] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [pdfTheme, setPdfTheme] = useState<'light' | 'dark'>('light');
  const [activeTab, setActiveTab] = useState<'editor' | 'preview' | 'history'>('editor');

  // Custom Trade Form State
  const [showAddTradeForm, setShowAddTradeForm] = useState(false);
  const [newTradeName, setNewTradeName] = useState('');
  const [newContractorName, setNewContractorName] = useState('');
  const [newTradeCount, setNewTradeCount] = useState(1);
  const [newTradeNotes, setNewTradeNotes] = useState('');

  // Material Damage Form State
  const [showAddDamageForm, setShowAddDamageForm] = useState(false);
  const [damageContractor, setDamageContractor] = useState('');
  const [damageTrade, setDamageTrade] = useState('Tiles');
  const [damageMaterial, setDamageMaterial] = useState('');
  const [damageAmount, setDamageAmount] = useState<number>(0);
  const [damageDescription, setDamageDescription] = useState('');
  const [damagePhotos, setDamagePhotos] = useState<string[]>([]);

  // Trade-wise Photo Set Form State
  const [showAddPhotoSetForm, setShowAddPhotoSetForm] = useState(false);
  const [selectedPhotoTrade, setSelectedPhotoTrade] = useState('Tiles (Suraj Chauhan)');
  const [customWorkTypeName, setCustomWorkTypeName] = useState('');
  const [photoLocation, setPhotoLocation] = useState('');
  const [beforePhotoUrl, setBeforePhotoUrl] = useState('');
  const [beforePhotoCaption, setBeforePhotoCaption] = useState('');
  const [afterPhotoUrl, setAfterPhotoUrl] = useState('');
  const [afterPhotoCaption, setAfterPhotoCaption] = useState('');

  const formattedText = generateWhatsAppReportText(report);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(formattedText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (err) {
      console.error('Failed to copy report text', err);
    }
  };

  const handleShareWhatsApp = () => {
    const encoded = encodeURIComponent(formattedText);
    const url = `https://api.whatsapp.com/send?text=${encoded}`;
    window.open(url, '_blank');
  };

  const handleSave = () => {
    saveDailyReport(report);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const handleDownloadPdf = async () => {
    setIsGeneratingPdf(true);
    try {
      const filename = `DPR_${report.buildingName.replace(/[^a-zA-Z0-9]/g, '_')}_${report.reportDate.replace(/\//g, '-')}.pdf`;
      const bg = pdfTheme === 'light' ? '#ffffff' : '#09090b';
      await downloadDPRPdfReport('printable-dpr-pdf', filename, bg);
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const handleResetToSample = () => {
    setReport({
      ...DEFAULT_SAMPLE_REPORT,
      reportDate: new Date().toLocaleDateString('en-GB')
    });
  };

  const handleAddCustomTrade = () => {
    if (!newTradeName.trim()) return;
    const newEntry: CustomTradeEntry = {
      id: 'ct_' + Date.now(),
      tradeName: newTradeName.trim(),
      contractorName: newContractorName.trim() || undefined,
      count: newTradeCount,
      notes: newTradeNotes.trim() || undefined,
    };
    setReport(prev => ({
      ...prev,
      customTrades: [...(prev.customTrades || []), newEntry]
    }));
    setNewTradeName('');
    setNewContractorName('');
    setNewTradeCount(1);
    setNewTradeNotes('');
    setShowAddTradeForm(false);
  };

  const handleRemoveCustomTrade = (id: string) => {
    setReport(prev => ({
      ...prev,
      customTrades: (prev.customTrades || []).filter(ct => ct.id !== id)
    }));
  };

  const updateCustomTradeCount = (id: string, delta: number) => {
    setReport(prev => ({
      ...prev,
      customTrades: (prev.customTrades || []).map(ct => 
        ct.id === id ? { ...ct, count: Math.max(0, ct.count + delta) } : ct
      )
    }));
  };

  const updateCustomTradeNotes = (id: string, notes: string) => {
    setReport(prev => ({
      ...prev,
      customTrades: (prev.customTrades || []).map(ct => 
        ct.id === id ? { ...ct, notes } : ct
      )
    }));
  };

  // Trade-wise Photo Set Upload Handlers
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, setter: (url: string) => void) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setter(event.target.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSavePhotoSet = () => {
    const tradeTitle = selectedPhotoTrade === 'OTHER' ? customWorkTypeName.trim() : selectedPhotoTrade;
    if (!tradeTitle) return;

    const newPhotoSet: WorkProgressPhotoSet = {
      id: 'pset_' + Date.now(),
      workTypeOrTrade: tradeTitle,
      workAreaLocation: photoLocation.trim() || undefined,
      beforePhotoUrl: beforePhotoUrl || undefined,
      beforeCaption: beforePhotoCaption.trim() || undefined,
      afterPhotoUrl: afterPhotoUrl || undefined,
      afterCaption: afterPhotoCaption.trim() || undefined,
      createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setReport(prev => ({
      ...prev,
      workPhotoSets: [...(prev.workPhotoSets || []), newPhotoSet]
    }));

    // Reset Form
    setSelectedPhotoTrade('Tiles (Suraj Chauhan)');
    setCustomWorkTypeName('');
    setPhotoLocation('');
    setBeforePhotoUrl('');
    setBeforePhotoCaption('');
    setAfterPhotoUrl('');
    setAfterPhotoCaption('');
    setShowAddPhotoSetForm(false);
  };

  const handleRemovePhotoSet = (id: string) => {
    setReport(prev => ({
      ...prev,
      workPhotoSets: (prev.workPhotoSets || []).filter(ps => ps.id !== id)
    }));
  };

  // Damage Photos Upload Handler
  const handleAddDamagePhotoFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach(file => {
      const reader = new FileReader();
      reader.onload = (uploadEvent) => {
        const url = uploadEvent.target?.result as string;
        if (url) {
          setDamagePhotos(prev => [...prev, url]);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const handleAddDamageClaim = () => {
    if (!damageContractor.trim() || !damageMaterial.trim() || damageAmount <= 0) return;

    const newClaim: MaterialDamageEntry = {
      id: 'dmg_' + Date.now(),
      contractorOrWorkerName: damageContractor.trim(),
      tradeOrAgency: damageTrade,
      materialName: damageMaterial.trim(),
      damageAmount: damageAmount,
      description: damageDescription.trim() || 'Material damage on site',
      photos: damagePhotos,
      createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setReport(prev => ({
      ...prev,
      damageDeductions: [...(prev.damageDeductions || []), newClaim]
    }));

    setDamageContractor('');
    setDamageTrade('Tiles');
    setDamageMaterial('');
    setDamageAmount(0);
    setDamageDescription('');
    setDamagePhotos([]);
    setShowAddDamageForm(false);
  };

  const handleRemoveDamageClaim = (id: string) => {
    setReport(prev => ({
      ...prev,
      damageDeductions: (prev.damageDeductions || []).filter(d => d.id !== id)
    }));
  };

  const updateNumber = (field: keyof DailyProgressReport, delta: number) => {
    setReport(prev => {
      const currentVal = (prev[field] as number) || 0;
      const newVal = Math.max(0, currentVal + delta);
      return { ...prev, [field]: newVal };
    });
  };

  const updateNote = (field: keyof DailyProgressReport, note: string) => {
    setReport(prev => ({ ...prev, [field]: note }));
  };

  const updateBathkamNumber = (field: keyof DailyProgressReport['bathkam'], delta: number) => {
    setReport(prev => {
      const currentVal = (prev.bathkam?.[field] as number) || 0;
      const newVal = Math.max(0, currentVal + delta);
      return {
        ...prev,
        bathkam: {
          ...prev.bathkam,
          [field]: newVal
        }
      };
    });
  };

  const updateCementBag = (index: number, delta: number) => {
    setReport(prev => {
      const updatedCement = [...(prev.cementStock || [])];
      if (updatedCement[index]) {
        updatedCement[index] = {
          ...updatedCement[index],
          bags: Math.max(0, updatedCement[index].bags + delta)
        };
      }
      return { ...prev, cementStock: updatedCement };
    });
  };

  const updateCementBagsDirect = (index: number, bags: number) => {
    setReport(prev => {
      const updatedCement = [...(prev.cementStock || [])];
      if (updatedCement[index]) {
        updatedCement[index] = {
          ...updatedCement[index],
          bags: Math.max(0, bags)
        };
      }
      return { ...prev, cementStock: updatedCement };
    });
  };

  const bathkamTotal = 
    (report.bathkam?.plasterWork || 0) + 
    (report.bathkam?.materialShifting || 0) + 
    (report.bathkam?.brickWork || 0) + 
    (report.bathkam?.baiLabour || 0);

  const customTradesTotal = (report.customTrades || []).reduce((sum, ct) => sum + (ct.count || 0), 0);

  const skilledTradesTotal = 
    (report.carpenterCount || 0) +
    (report.fitterCount || 0) +
    (report.electricalCount || 0) +
    (report.surajChauhanTilesCount || 0) +
    (report.mohanKhetawatWaterproofingCount || 0) +
    (report.nareshKhetawatWaterproofingCount || 0) +
    (report.plumberCount || 0) +
    (report.coreCuttingCount || 0) +
    (report.fabricationCount || 0) +
    customTradesTotal;

  const totalManpower = 
    skilledTradesTotal +
    bathkamTotal +
    (report.departmentStaffCount || 0) +
    (report.departmentLabourCount || 0) +
    (report.bathkam?.breakerWork || 0);

  const totalCementBags = (report.cementStock || []).reduce((sum, c) => sum + (c.bags || 0), 0);
  const totalDamageDeduction = (report.damageDeductions || []).reduce((sum, d) => sum + (d.damageAmount || 0), 0);

  // Available Trade Options for Photo Sets
  const tradeOptions = [
    'Tiles (Suraj Chauhan)',
    'Waterproofing (Mohan Khetawat)',
    'Waterproofing (Naresh Khetawat)',
    'Carpenter',
    'Steel Fitter',
    'Electrical',
    'Plumber',
    'Core Cutting',
    'Fabrication',
    ...(report.customTrades || []).map(ct => ct.contractorName ? `${ct.tradeName} (${ct.contractorName})` : ct.tradeName),
    'OTHER'
  ];

  return (
    <div className="p-3 sm:p-6 max-w-5xl mx-auto space-y-6 pb-24">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-emerald-950 via-zinc-900 to-zinc-900 border border-emerald-500/30 rounded-2xl p-4 sm:p-6 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl -z-0 pointer-events-none" />
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
          <div className="flex items-center space-x-3.5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-zinc-950 font-bold shadow-lg shadow-emerald-500/20">
              <MessageSquare className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">WhatsApp Daily Report</h1>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-semibold uppercase tracking-wider">
                  Trade-wise Work Photos
                </span>
              </div>
              <p className="text-xs text-zinc-400 mt-0.5">
                Mark attendance, narrations, trade-wise before/after photos, damage deductions, and export PDF.
              </p>
            </div>
          </div>

          {/* Action Bar */}
          <div className="flex items-center space-x-2">
            <button
              onClick={handleShareWhatsApp}
              className="flex-1 sm:flex-none flex items-center justify-center space-x-2 px-3.5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold text-xs shadow-lg shadow-emerald-500/20 active:scale-95 transition-all"
            >
              <Share2 className="w-4 h-4" />
              <span>Share to WhatsApp</span>
            </button>

            <button
              onClick={handleDownloadPdf}
              disabled={isGeneratingPdf}
              className="px-3.5 py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-400 hover:to-amber-400 text-zinc-950 font-bold text-xs flex items-center space-x-1.5 transition-all shadow-lg active:scale-95 disabled:opacity-50"
            >
              <FileText className="w-4 h-4" />
              <span>{isGeneratingPdf ? 'Generating PDF...' : 'Download PDF Report'}</span>
            </button>

            <button
              onClick={handleCopy}
              className={`px-3 py-2.5 rounded-xl border text-xs font-semibold flex items-center space-x-1 transition-all ${
                copied
                  ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300'
                  : 'bg-zinc-800 border-zinc-700 text-zinc-200 hover:bg-zinc-700'
              }`}
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              <span className="hidden sm:inline">{copied ? 'Copied!' : 'Copy'}</span>
            </button>

            <button
              onClick={handleSave}
              className={`p-2.5 rounded-xl border text-xs font-semibold flex items-center transition-all ${
                savedSuccess
                  ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300'
                  : 'bg-zinc-800 border-zinc-700 text-zinc-300 hover:bg-zinc-700'
              }`}
              title="Save Report Snapshot"
            >
              {savedSuccess ? <Check className="w-4 h-4 text-emerald-400" /> : <Save className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Tab & PDF Theme Selector Bar */}
        <div className="flex flex-wrap items-center justify-between gap-2 mt-4 pt-4 border-t border-zinc-800/80">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setActiveTab('editor')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                activeTab === 'editor'
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              ✏️ Form Editor
            </button>
            <button
              onClick={() => setActiveTab('preview')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                activeTab === 'preview'
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              👁️ WhatsApp Preview
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                activeTab === 'history'
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              📜 Saved Reports ({state.dailyReports?.length || 0})
            </button>
          </div>

          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-1.5 bg-zinc-950/80 border border-zinc-800 rounded-lg p-1">
              <span className="text-[10px] text-zinc-400 px-1 font-medium">PDF Theme:</span>
              <button
                onClick={() => setPdfTheme('light')}
                className={`px-2 py-0.5 rounded text-[10px] font-bold flex items-center space-x-1 transition ${
                  pdfTheme === 'light'
                    ? 'bg-white text-zinc-950 shadow-sm'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                <Sun className="w-3 h-3 text-amber-500" />
                <span>Executive Print</span>
              </button>
              <button
                onClick={() => setPdfTheme('dark')}
                className={`px-2 py-0.5 rounded text-[10px] font-bold flex items-center space-x-1 transition ${
                  pdfTheme === 'dark'
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                <Moon className="w-3 h-3 text-emerald-400" />
                <span>Modern Dark</span>
              </button>
            </div>

            <button
              onClick={handleResetToSample}
              className="text-[11px] text-zinc-500 hover:text-zinc-300 flex items-center space-x-1"
              title="Reset to sample values"
            >
              <RotateCcw className="w-3 h-3" />
              <span className="hidden sm:inline">Reset Defaults</span>
            </button>
          </div>
        </div>
      </div>

      {/* VIEW 1: EDITOR */}
      {activeTab === 'editor' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Main Form Fields (7 Cols) */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Report Metadata */}
            <div className="bg-zinc-900/90 border border-zinc-800 rounded-2xl p-4 space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center space-x-2">
                <Building className="w-4 h-4" />
                <span>1. Report Header Info</span>
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] text-zinc-400 mb-1">Building Name / Title</label>
                  <input
                    type="text"
                    value={report.buildingName}
                    onChange={e => setReport(r => ({ ...r, buildingName: e.target.value }))}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white focus:border-emerald-500 focus:outline-none"
                    placeholder="B-Building Work Progress"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-zinc-400 mb-1">Date</label>
                  <input
                    type="text"
                    value={report.reportDate}
                    onChange={e => setReport(r => ({ ...r, reportDate: e.target.value }))}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white focus:border-emerald-500 focus:outline-none"
                    placeholder="13/08/2026"
                  />
                </div>
              </div>
            </div>

            {/* Skilled Trades & Contractors */}
            <div className="bg-zinc-900/90 border border-zinc-800 rounded-2xl p-4 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center space-x-2">
                  <HardHat className="w-4 h-4" />
                  <span>2. Mark Attendance & Narrations</span>
                </h3>
                <button
                  onClick={() => setShowAddTradeForm(!showAddTradeForm)}
                  className="px-2.5 py-1 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-center space-x-1.5 active:scale-95 transition"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Custom Trade</span>
                </button>
              </div>

              {/* Add Custom Trade Form Drawer */}
              {showAddTradeForm && (
                <div className="bg-zinc-950 border border-emerald-500/40 rounded-xl p-3.5 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">➕ Add New Custom Trade / Contractor</span>
                    <button onClick={() => setShowAddTradeForm(false)} className="text-xs text-zinc-400 hover:text-white">✕</button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <div>
                      <label className="block text-[10px] text-zinc-400 mb-1">Trade / Work Name *</label>
                      <input
                        type="text"
                        value={newTradeName}
                        onChange={e => setNewTradeName(e.target.value)}
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs text-white focus:border-emerald-500 focus:outline-none"
                        placeholder="e.g. Painting, False Ceiling, Flooring..."
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-zinc-400 mb-1">Contractor Name (Optional)</label>
                      <input
                        type="text"
                        value={newContractorName}
                        onChange={e => setNewContractorName(e.target.value)}
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs text-white focus:border-emerald-500 focus:outline-none"
                        placeholder="e.g. Raju, Apex Agency..."
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    <div>
                      <label className="block text-[10px] text-zinc-400 mb-1">Worker Count</label>
                      <input
                        type="number"
                        min="1"
                        value={newTradeCount}
                        onChange={e => setNewTradeCount(parseInt(e.target.value) || 1)}
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs text-emerald-400 font-bold focus:border-emerald-500 focus:outline-none"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-[10px] text-zinc-400 mb-1">Work Scope Narration (Optional)</label>
                      <input
                        type="text"
                        value={newTradeNotes}
                        onChange={e => setNewTradeNotes(e.target.value)}
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs text-zinc-300 focus:border-emerald-500 focus:outline-none"
                        placeholder="e.g. 2nd coat wall putty on 4th floor..."
                      />
                    </div>
                  </div>

                  <div className="flex justify-end space-x-2 pt-1">
                    <button
                      onClick={() => setShowAddTradeForm(false)}
                      className="px-3 py-1.5 rounded-lg bg-zinc-800 text-zinc-300 text-xs font-semibold"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleAddCustomTrade}
                      className="px-4 py-1.5 rounded-lg bg-emerald-500 text-zinc-950 text-xs font-bold shadow"
                    >
                      Save Trade
                    </button>
                  </div>
                </div>
              )}
              
              {/* Default Trades List */}
              <div className="space-y-3">
                {[
                  { label: 'Carpenter', countKey: 'carpenterCount' as const, noteKey: 'carpenterNotes' as const, placeholder: 'e.g. shuttering & framing work...' },
                  { label: 'Steel Fitter', countKey: 'fitterCount' as const, noteKey: 'fitterNotes' as const, placeholder: 'e.g. beam & column steel binding...' },
                  { label: 'Electrical', countKey: 'electricalCount' as const, noteKey: 'electricalNotes' as const, placeholder: 'e.g. slab conduit piping & DB dressing...' },
                  { label: 'Tiles (Suraj Chauhan)', countKey: 'surajChauhanTilesCount' as const, noteKey: 'surajChauhanNotes' as const, placeholder: 'e.g. window and door frame and kitchen bottom & top laying...' },
                  { label: 'Waterproofing (Mohan Khetawat)', countKey: 'mohanKhetawatWaterproofingCount' as const, noteKey: 'mohanKhetawatNotes' as const, placeholder: 'e.g. terrace waterproofing coat...' },
                  { label: 'Waterproofing (Naresh Khetawat)', countKey: 'nareshKhetawatWaterproofingCount' as const, noteKey: 'nareshKhetawatNotes' as const, placeholder: 'e.g. toilet & balcony waterproofing...' },
                  { label: 'Plumber', countKey: 'plumberCount' as const, noteKey: 'plumberNotes' as const, placeholder: 'e.g. drainage & CPVC line fitting...' },
                  { label: 'Core Cutting', countKey: 'coreCuttingCount' as const, noteKey: 'coreCuttingNotes' as const, placeholder: 'e.g. core drilling for plumbing shafts...' },
                  { label: 'Fabrication', countKey: 'fabricationCount' as const, noteKey: 'fabricationNotes' as const, placeholder: 'e.g. safety railing & window grill welding...' },
                ].map(item => (
                  <div key={item.countKey} className="bg-zinc-950 border border-zinc-800 rounded-xl p-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-white">{item.label}</span>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => updateNumber(item.countKey, -1)}
                          className="w-6 h-6 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 flex items-center justify-center"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="text-sm font-bold text-emerald-400 w-8 text-center">
                          {((report[item.countKey] as number) || 0) < 10 ? `0${report[item.countKey] || 0}` : report[item.countKey]}
                        </span>
                        <button
                          onClick={() => updateNumber(item.countKey, 1)}
                          className="w-6 h-6 rounded bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 flex items-center justify-center"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                    <input
                      type="text"
                      value={(report[item.noteKey] as string) || ''}
                      onChange={e => updateNote(item.noteKey, e.target.value)}
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-[11px] text-zinc-300 focus:border-emerald-500 focus:outline-none"
                      placeholder={`Work Narration for ${item.label} (${item.placeholder})`}
                    />
                  </div>
                ))}

                {/* Custom Trades List */}
                {report.customTrades && report.customTrades.length > 0 && (
                  <div className="pt-2 border-t border-zinc-800 space-y-3">
                    <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider block">Custom Added Trades ({report.customTrades.length})</span>
                    {report.customTrades.map(ct => (
                      <div key={ct.id} className="bg-zinc-950 border border-emerald-500/30 rounded-xl p-3 space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <span className="text-xs font-bold text-emerald-300">{ct.tradeName}</span>
                            {ct.contractorName && (
                              <span className="text-[10px] text-zinc-400 bg-zinc-900 px-1.5 py-0.5 rounded border border-zinc-800">
                                ({ct.contractorName})
                              </span>
                            )}
                          </div>

                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => updateCustomTradeCount(ct.id, -1)}
                              className="w-6 h-6 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 flex items-center justify-center"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="text-sm font-bold text-emerald-400 w-8 text-center">
                              {ct.count < 10 ? `0${ct.count}` : ct.count}
                            </span>
                            <button
                              onClick={() => updateCustomTradeCount(ct.id, 1)}
                              className="w-6 h-6 rounded bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 flex items-center justify-center"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                            <button
                              onClick={() => handleRemoveCustomTrade(ct.id)}
                              className="p-1 rounded text-zinc-500 hover:text-red-400 hover:bg-red-500/10 ml-1 transition"
                              title="Remove Custom Trade"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>

                        <input
                          type="text"
                          value={ct.notes || ''}
                          onChange={e => updateCustomTradeNotes(ct.id, e.target.value)}
                          className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-[11px] text-zinc-300 focus:border-emerald-500 focus:outline-none"
                          placeholder={`Work Narration for ${ct.tradeName}...`}
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Bathkam Breakdown Section */}
            <div className="bg-zinc-900/90 border border-zinc-800 rounded-2xl p-4 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center space-x-2">
                  <Sparkles className="w-4 h-4" />
                  <span>3. Bathkam Breakdown</span>
                </h3>
                <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                  Sub-Total: {bathkamTotal} Labour
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: 'Plaster Work', key: 'plasterWork' as const },
                  { label: 'Material Shifting', key: 'materialShifting' as const },
                  { label: 'Brick Work', key: 'brickWork' as const },
                  { label: 'Bai (Female Labour)', key: 'baiLabour' as const },
                ].map(item => (
                  <div key={item.key} className="bg-zinc-950 border border-zinc-800 rounded-xl p-2.5 flex items-center justify-between">
                    <span className="text-xs text-zinc-300 font-medium">{item.label}</span>
                    <div className="flex items-center space-x-1.5">
                      <button
                        onClick={() => updateBathkamNumber(item.key, -1)}
                        className="w-5 h-5 rounded bg-zinc-800 text-zinc-300 flex items-center justify-center text-xs"
                      >
                        -
                      </button>
                      <span className="text-xs font-bold text-white w-6 text-center">
                        {(report.bathkam?.[item.key] || 0) < 10 ? `0${report.bathkam?.[item.key] || 0}` : report.bathkam?.[item.key]}
                      </span>
                      <button
                        onClick={() => updateBathkamNumber(item.key, 1)}
                        className="w-5 h-5 rounded bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-xs"
                      >
                        +
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Department & Breaker Work Section */}
            <div className="bg-zinc-900/90 border border-zinc-800 rounded-2xl p-4 space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center space-x-2">
                <Users className="w-4 h-4" />
                <span>4. Department Staff & Breaker Work</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-3">
                  <span className="text-xs text-zinc-400 block mb-1">Department Staff</span>
                  <div className="flex items-center justify-between">
                    <button onClick={() => updateNumber('departmentStaffCount', -1)} className="w-6 h-6 bg-zinc-800 text-zinc-300 rounded">-</button>
                    <span className="text-sm font-bold text-white">{report.departmentStaffCount < 10 ? `0${report.departmentStaffCount}` : report.departmentStaffCount}</span>
                    <button onClick={() => updateNumber('departmentStaffCount', 1)} className="w-6 h-6 bg-emerald-500/20 text-emerald-400 rounded">+</button>
                  </div>
                </div>

                <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-3">
                  <span className="text-xs text-zinc-400 block mb-1">Department Labour</span>
                  <div className="flex items-center justify-between">
                    <button onClick={() => updateNumber('departmentLabourCount', -1)} className="w-6 h-6 bg-zinc-800 text-zinc-300 rounded">-</button>
                    <span className="text-sm font-bold text-white">{report.departmentLabourCount < 10 ? `0${report.departmentLabourCount}` : report.departmentLabourCount}</span>
                    <button onClick={() => updateNumber('departmentLabourCount', 1)} className="w-6 h-6 bg-emerald-500/20 text-emerald-400 rounded">+</button>
                  </div>
                </div>

                <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-3">
                  <span className="text-xs text-zinc-400 block mb-1">Breaker Work (Bathkam)</span>
                  <div className="flex items-center justify-between">
                    <button onClick={() => updateBathkamNumber('breakerWork', -1)} className="w-6 h-6 bg-zinc-800 text-zinc-300 rounded">-</button>
                    <span className="text-sm font-bold text-white">{report.bathkam?.breakerWork < 10 ? `0${report.bathkam?.breakerWork}` : report.bathkam?.breakerWork}</span>
                    <button onClick={() => updateBathkamNumber('breakerWork', 1)} className="w-6 h-6 bg-emerald-500/20 text-emerald-400 rounded">+</button>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <div>
                  <label className="block text-[11px] text-zinc-400 mb-1">Department Labour Work Narration</label>
                  <input
                    type="text"
                    value={report.departmentTasksNotes || ''}
                    onChange={e => setReport(r => ({ ...r, departmentTasksNotes: e.target.value }))}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs text-zinc-300 focus:border-emerald-500 focus:outline-none"
                    placeholder="e.g. slab, column, brick wall & plaster curing & cleaning waste material"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-zinc-400 mb-1">Breaker Work Narration</label>
                  <input
                    type="text"
                    value={report.bathkamBreakerNotes || ''}
                    onChange={e => setReport(r => ({ ...r, bathkamBreakerNotes: e.target.value }))}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs text-zinc-300 focus:border-emerald-500 focus:outline-none"
                    placeholder="e.g. concrete wall breaking & chipping..."
                  />
                </div>
              </div>
            </div>

            {/* Cement Stock Section */}
            <div className="bg-zinc-900/90 border border-zinc-800 rounded-2xl p-4 space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center space-x-2">
                <Package className="w-4 h-4" />
                <span>5. Stock Cement (Bags)</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {report.cementStock.map((c, idx) => (
                  <div key={idx} className="bg-zinc-950 border border-zinc-800 rounded-xl p-3 flex items-center justify-between">
                    <div>
                      <span className="text-xs font-medium text-white block">{c.brandName}</span>
                      <span className="text-[10px] text-zinc-500">{c.type || 'General'}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => updateCementBag(idx, -5)}
                        className="px-1.5 py-0.5 rounded bg-zinc-800 text-[10px] text-zinc-400 hover:text-white"
                        title="-5 Bags"
                      >
                        -5
                      </button>
                      <button
                        onClick={() => updateCementBag(idx, -1)}
                        className="w-6 h-6 rounded bg-zinc-800 text-zinc-300 flex items-center justify-center font-bold text-xs"
                      >
                        -
                      </button>
                      <input
                        type="number"
                        value={c.bags}
                        onChange={e => updateCementBagsDirect(idx, parseInt(e.target.value) || 0)}
                        className="w-12 bg-zinc-900 border border-zinc-700 text-center font-bold text-xs text-emerald-400 py-1 rounded"
                      />
                      <button
                        onClick={() => updateCementBag(idx, 1)}
                        className="w-6 h-6 rounded bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-xs"
                      >
                        +
                      </button>
                      <button
                        onClick={() => updateCementBag(idx, 5)}
                        className="px-1.5 py-0.5 rounded bg-emerald-500/10 text-[10px] text-emerald-400 hover:bg-emerald-500/20"
                        title="+5 Bags"
                      >
                        +5
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* UPGRADED SECTION 6: TRADE-WISE & ADDITIONAL WORK PHOTO SETS */}
            <div className="bg-zinc-900/90 border border-emerald-500/30 rounded-2xl p-4 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Camera className="w-4 h-4 text-emerald-400" />
                  <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                    6. Work-wise Before & After Photo Sets (All Trades & Additional Works)
                  </h3>
                </div>
                <button
                  onClick={() => setShowAddPhotoSetForm(!showAddPhotoSetForm)}
                  className="px-2.5 py-1 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-center space-x-1.5 active:scale-95 transition"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>+ Add Work Photo Set</span>
                </button>
              </div>

              {/* Add Trade Photo Set Drawer */}
              {showAddPhotoSetForm && (
                <div className="bg-zinc-950 border border-emerald-500/40 rounded-xl p-4 space-y-4">
                  <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
                    <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">📷 New Before & After Work Photo Comparison</span>
                    <button onClick={() => setShowAddPhotoSetForm(false)} className="text-xs text-zinc-400 hover:text-white">✕</button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] text-zinc-400 mb-1">Select Trade / Work Type *</label>
                      <select
                        value={selectedPhotoTrade}
                        onChange={e => setSelectedPhotoTrade(e.target.value)}
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-2.5 py-2 text-xs text-white focus:border-emerald-500 focus:outline-none"
                      >
                        {tradeOptions.map((opt, i) => (
                          <option key={i} value={opt}>{opt === 'OTHER' ? '➕ Type Custom Additional Work...' : opt}</option>
                        ))}
                      </select>
                    </div>

                    {selectedPhotoTrade === 'OTHER' && (
                      <div>
                        <label className="block text-[10px] text-zinc-400 mb-1">Custom Work Name *</label>
                        <input
                          type="text"
                          value={customWorkTypeName}
                          onChange={e => setCustomWorkTypeName(e.target.value)}
                          className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-2.5 py-2 text-xs text-white focus:border-emerald-500 focus:outline-none"
                          placeholder="e.g. Painting, False Ceiling, Granite Fitting..."
                        />
                      </div>
                    )}

                    <div>
                      <label className="block text-[10px] text-zinc-400 mb-1">Work Location / Area (Optional)</label>
                      <input
                        type="text"
                        value={photoLocation}
                        onChange={e => setPhotoLocation(e.target.value)}
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-2.5 py-2 text-xs text-white focus:border-emerald-500 focus:outline-none"
                        placeholder="e.g. 4th Floor Flat 402 Bathroom / Terrace Slab"
                      />
                    </div>
                  </div>

                  {/* Dual Upload Box: BEFORE PHOTO vs AFTER PHOTO */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                    {/* BEFORE PHOTO UPLOAD */}
                    <div className="bg-zinc-900 border border-amber-500/30 rounded-xl p-3 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-amber-400">1. BEFORE WORK PHOTO</span>
                        <label className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 text-[10px] font-bold cursor-pointer hover:bg-amber-500/30">
                          {beforePhotoUrl ? 'Change' : '+ Upload'}
                          <input type="file" accept="image/*" onChange={e => handleFileUpload(e, setBeforePhotoUrl)} className="hidden" />
                        </label>
                      </div>

                      {beforePhotoUrl ? (
                        <div className="space-y-2">
                          <img src={beforePhotoUrl} alt="Before" className="w-full h-32 object-cover rounded-lg border border-amber-500/40" />
                          <input
                            type="text"
                            value={beforePhotoCaption}
                            onChange={e => setBeforePhotoCaption(e.target.value)}
                            className="w-full bg-zinc-950 border border-zinc-800 rounded px-2 py-1 text-[11px] text-zinc-200 focus:border-amber-500 focus:outline-none"
                            placeholder="Before caption (e.g. Before waterproofing coat)..."
                          />
                        </div>
                      ) : (
                        <div className="h-32 border-2 border-dashed border-zinc-800 rounded-lg flex flex-col items-center justify-center text-zinc-500 text-xs">
                          <span>No Before Photo Selected</span>
                        </div>
                      )}
                    </div>

                    {/* AFTER PHOTO UPLOAD */}
                    <div className="bg-zinc-900 border border-emerald-500/30 rounded-xl p-3 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-emerald-400">2. AFTER WORK PHOTO</span>
                        <label className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[10px] font-bold cursor-pointer hover:bg-emerald-500/30">
                          {afterPhotoUrl ? 'Change' : '+ Upload'}
                          <input type="file" accept="image/*" onChange={e => handleFileUpload(e, setAfterPhotoUrl)} className="hidden" />
                        </label>
                      </div>

                      {afterPhotoUrl ? (
                        <div className="space-y-2">
                          <img src={afterPhotoUrl} alt="After" className="w-full h-32 object-cover rounded-lg border border-emerald-500/40" />
                          <input
                            type="text"
                            value={afterPhotoCaption}
                            onChange={e => setAfterPhotoCaption(e.target.value)}
                            className="w-full bg-zinc-950 border border-zinc-800 rounded px-2 py-1 text-[11px] text-zinc-200 focus:border-emerald-500 focus:outline-none"
                            placeholder="After caption (e.g. After 2nd coat tile laying)..."
                          />
                        </div>
                      ) : (
                        <div className="h-32 border-2 border-dashed border-zinc-800 rounded-lg flex flex-col items-center justify-center text-zinc-500 text-xs">
                          <span>No After Photo Selected</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex justify-end space-x-2 pt-2 border-t border-zinc-800">
                    <button onClick={() => setShowAddPhotoSetForm(false)} className="px-3 py-1.5 rounded-lg bg-zinc-800 text-zinc-300 text-xs font-semibold">
                      Cancel
                    </button>
                    <button onClick={handleSavePhotoSet} className="px-4 py-1.5 rounded-lg bg-emerald-500 text-zinc-950 text-xs font-bold shadow">
                      Save Photo Comparison
                    </button>
                  </div>
                </div>
              )}

              {/* List of Saved Trade Photo Comparison Sets */}
              {report.workPhotoSets && report.workPhotoSets.length > 0 ? (
                <div className="space-y-3">
                  {report.workPhotoSets.map(pSet => (
                    <div key={pSet.id} className="bg-zinc-950 border border-zinc-800 rounded-xl p-3 space-y-2">
                      <div className="flex items-center justify-between border-b border-zinc-900 pb-2">
                        <div className="flex items-center space-x-2">
                          <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                            {pSet.workTypeOrTrade}
                          </span>
                          {pSet.workAreaLocation && (
                            <span className="text-[10px] text-zinc-400 bg-zinc-900 px-2 py-0.5 rounded border border-zinc-800">
                              📍 {pSet.workAreaLocation}
                            </span>
                          )}
                        </div>
                        <button
                          onClick={() => handleRemovePhotoSet(pSet.id)}
                          className="p-1 rounded text-zinc-500 hover:text-red-400 hover:bg-red-500/10 transition"
                          title="Remove Photo Set"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        {/* BEFORE PHOTO DISPLAY */}
                        <div className="bg-zinc-900 rounded-lg p-2 space-y-1">
                          <span className="text-[9px] font-bold text-amber-400 uppercase tracking-wider block">BEFORE WORK</span>
                          {pSet.beforePhotoUrl ? (
                            <>
                              <img src={pSet.beforePhotoUrl} alt="Before" className="w-full h-24 object-cover rounded border border-amber-500/30" />
                              <div className="text-[10px] text-zinc-300 truncate">{pSet.beforeCaption || 'Before execution'}</div>
                            </>
                          ) : (
                            <div className="h-24 bg-zinc-950 rounded flex items-center justify-center text-[10px] text-zinc-600 italic">No Before Photo</div>
                          )}
                        </div>

                        {/* AFTER PHOTO DISPLAY */}
                        <div className="bg-zinc-900 rounded-lg p-2 space-y-1">
                          <span className="text-[9px] font-bold text-emerald-400 uppercase tracking-wider block">AFTER COMPLETED</span>
                          {pSet.afterPhotoUrl ? (
                            <>
                              <img src={pSet.afterPhotoUrl} alt="After" className="w-full h-24 object-cover rounded border border-emerald-500/30" />
                              <div className="text-[10px] text-zinc-300 truncate">{pSet.afterCaption || 'After completion'}</div>
                            </>
                          ) : (
                            <div className="h-24 bg-zinc-950 rounded flex items-center justify-center text-[10px] text-zinc-600 italic">No After Photo</div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 border-2 border-dashed border-zinc-800 rounded-xl text-zinc-500 text-xs">
                  No trade-wise Before & After photo sets added yet. Click <b>"+ Add Work Photo Set"</b> above to attach photos per trade or additional work!
                </div>
              )}
            </div>

            {/* SECTION 7: MATERIAL DAMAGE & CONTRACTOR BILL DEDUCTIONS */}
            <div className="bg-zinc-900/90 border border-red-500/30 rounded-2xl p-4 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <AlertTriangle className="w-4 h-4 text-red-400" />
                  <h3 className="text-xs font-bold uppercase tracking-wider text-red-400">
                    7. Material Damage & Contractor Bill Deductions
                  </h3>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-bold text-red-400 bg-red-500/10 px-2.5 py-0.5 rounded-full border border-red-500/30">
                    Total Deduction: ₹{totalDamageDeduction.toLocaleString('en-IN')}
                  </span>
                  <button
                    onClick={() => setShowAddDamageForm(!showAddDamageForm)}
                    className="px-2.5 py-1 rounded-lg bg-red-500/20 hover:bg-red-500/30 border border-red-500/40 text-red-300 text-xs font-bold flex items-center space-x-1.5 active:scale-95 transition"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Record Damage Claim</span>
                  </button>
                </div>
              </div>

              {/* Add Material Damage Claim Form */}
              {showAddDamageForm && (
                <div className="bg-zinc-950 border border-red-500/40 rounded-xl p-3.5 space-y-3">
                  <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
                    <span className="text-xs font-bold text-red-400 uppercase tracking-wider">⚠️ New Material Damage & Bill Penalty Record</span>
                    <button onClick={() => setShowAddDamageForm(false)} className="text-xs text-zinc-400 hover:text-white">✕</button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    <div>
                      <label className="block text-[10px] text-zinc-400 mb-1">Contractor / Worker Responsible *</label>
                      <input
                        type="text"
                        value={damageContractor}
                        onChange={e => setDamageContractor(e.target.value)}
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs text-white focus:border-red-500 focus:outline-none"
                        placeholder="e.g. Suraj Chauhan (Tiles)"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-zinc-400 mb-1">Trade / Agency Category</label>
                      <select
                        value={damageTrade}
                        onChange={e => setDamageTrade(e.target.value)}
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs text-white focus:border-red-500 focus:outline-none"
                      >
                        <option value="Tiles">Tiles</option>
                        <option value="Waterproofing">Waterproofing</option>
                        <option value="Plumbing">Plumbing</option>
                        <option value="Electrical">Electrical</option>
                        <option value="Carpenter">Carpenter</option>
                        <option value="Fitter">Steel Fitter</option>
                        <option value="Fabrication">Fabrication</option>
                        <option value="General Labour">General Labour</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] text-zinc-400 mb-1">Deduction Amount (₹) *</label>
                      <input
                        type="number"
                        min="0"
                        value={damageAmount || ''}
                        onChange={e => setDamageAmount(parseFloat(e.target.value) || 0)}
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs text-red-400 font-bold focus:border-red-500 focus:outline-none"
                        placeholder="e.g. 2400"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <div>
                      <label className="block text-[10px] text-zinc-400 mb-1">Material Damaged Details *</label>
                      <input
                        type="text"
                        value={damageMaterial}
                        onChange={e => setDamageMaterial(e.target.value)}
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs text-zinc-200 focus:border-red-500 focus:outline-none"
                        placeholder="e.g. 600x600 Vitrified Tiles - 3 Boxes broken"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-zinc-400 mb-1">Reason / Description</label>
                      <input
                        type="text"
                        value={damageDescription}
                        onChange={e => setDamageDescription(e.target.value)}
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs text-zinc-300 focus:border-red-500 focus:outline-none"
                        placeholder="e.g. Careless handling during material shifting..."
                      />
                    </div>
                  </div>

                  {/* Damage Evidence Photos Upload */}
                  <div className="space-y-2 pt-1 border-t border-zinc-900">
                    <div className="flex items-center justify-between">
                      <label className="text-[10px] text-zinc-400">Attach Damage Evidence Photos</label>
                      <label className="px-2 py-0.5 rounded bg-zinc-800 hover:bg-zinc-700 text-xs text-zinc-300 cursor-pointer">
                        + Upload Damage Photo
                        <input
                          type="file"
                          accept="image/*"
                          multiple
                          onChange={handleAddDamagePhotoFiles}
                          className="hidden"
                        />
                      </label>
                    </div>

                    {damagePhotos.length > 0 && (
                      <div className="flex items-center space-x-2 overflow-x-auto py-1">
                        {damagePhotos.map((url, pIdx) => (
                          <div key={pIdx} className="relative group flex-shrink-0">
                            <img src={url} alt="Damage" className="w-12 h-12 object-cover rounded border border-red-500/50" />
                            <button
                              onClick={() => setDamagePhotos(prev => prev.filter((_, idx) => idx !== pIdx))}
                              className="absolute -top-1 -right-1 bg-red-600 text-white rounded-full w-4 h-4 flex items-center justify-center text-[10px]"
                            >
                              ✕
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="flex justify-end space-x-2 pt-2">
                    <button
                      onClick={() => setShowAddDamageForm(false)}
                      className="px-3 py-1.5 rounded-lg bg-zinc-800 text-zinc-300 text-xs font-semibold"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleAddDamageClaim}
                      className="px-4 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-white text-xs font-bold shadow"
                    >
                      Save Bill Deduction
                    </button>
                  </div>
                </div>
              )}

              {/* Recorded Damage Claims List */}
              {report.damageDeductions && report.damageDeductions.length > 0 ? (
                <div className="space-y-2">
                  {report.damageDeductions.map(item => (
                    <div key={item.id} className="bg-zinc-950 border border-red-500/30 rounded-xl p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <span className="text-xs font-bold text-white">{item.contractorOrWorkerName}</span>
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-zinc-400">
                            {item.tradeOrAgency}
                          </span>
                          <span className="text-xs font-black text-red-400 bg-red-500/10 px-2 py-0.5 rounded border border-red-500/20">
                            -₹{item.damageAmount.toLocaleString('en-IN')} Deducted
                          </span>
                        </div>
                        <div className="text-[11px] text-zinc-300 font-medium">Material: {item.materialName}</div>
                        <div className="text-[10px] text-zinc-400 italic">Reason: {item.description}</div>
                      </div>

                      <div className="flex items-center space-x-3">
                        {item.photos && item.photos.length > 0 && (
                          <div className="flex items-center space-x-1">
                            {item.photos.map((pUrl, pIdx) => (
                              <img key={pIdx} src={pUrl} alt="Damage evidence" className="w-10 h-10 object-cover rounded border border-red-500/30" />
                            ))}
                          </div>
                        )}
                        <button
                          onClick={() => handleRemoveDamageClaim(item.id)}
                          className="p-1.5 rounded bg-zinc-900 hover:bg-red-500/20 text-zinc-500 hover:text-red-400 transition"
                          title="Remove Damage Claim"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4 border border-dashed border-zinc-800 rounded-xl text-zinc-500 text-xs">
                  No material damage deductions recorded for today.
                </div>
              )}
            </div>

          </div>

          {/* Right Column: Live WhatsApp Markdown Card & Actions (5 Cols) */}
          <div className="lg:col-span-5 space-y-4">
            <div className="sticky top-20 bg-zinc-900 border border-emerald-500/30 rounded-2xl p-4 shadow-2xl space-y-4">
              <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-xs font-bold text-white uppercase tracking-wider">Live WhatsApp Preview</span>
                </div>
                <span className="text-[10px] text-emerald-400 font-mono">Format 1 Clean</span>
              </div>

              {/* Simulated WhatsApp Chat Bubble */}
              <div className="bg-[#0b141a] border border-emerald-900/40 rounded-xl p-4 font-mono text-xs text-zinc-200 leading-relaxed overflow-x-auto select-all shadow-inner max-h-[550px] overflow-y-auto whitespace-pre-wrap">
                {formattedText}
              </div>

              {/* Action Toolbar */}
              <div className="space-y-2 pt-2">
                <button
                  onClick={handleShareWhatsApp}
                  className="w-full flex items-center justify-center space-x-2 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-400 hover:from-emerald-400 hover:to-emerald-300 text-zinc-950 font-bold text-xs shadow-lg shadow-emerald-500/20 active:scale-98 transition-all"
                >
                  <Share2 className="w-4 h-4" />
                  <span>Send to WhatsApp Group</span>
                </button>

                <button
                  onClick={handleDownloadPdf}
                  disabled={isGeneratingPdf}
                  className="w-full flex items-center justify-center space-x-2 py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-400 hover:to-amber-400 text-zinc-950 font-bold text-xs transition active:scale-98 disabled:opacity-50"
                >
                  <Download className="w-4 h-4" />
                  <span>{isGeneratingPdf ? 'Generating PDF...' : `Download ${pdfTheme === 'light' ? 'Executive Print' : 'Modern Dark'} PDF`}</span>
                </button>

                <button
                  onClick={handleCopy}
                  className="w-full flex items-center justify-center space-x-2 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-semibold text-xs transition"
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  <span>{copied ? 'Copied to Clipboard!' : 'Copy Formatted Text'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 2: FULL PREVIEW */}
      {activeTab === 'preview' && (
        <div className="max-w-2xl mx-auto space-y-4">
          <div className="bg-[#0b141a] border border-emerald-800/40 rounded-2xl p-6 font-mono text-sm text-zinc-100 whitespace-pre-wrap leading-relaxed shadow-2xl select-all">
            {formattedText}
          </div>

          <div className="flex space-x-3">
            <button
              onClick={handleShareWhatsApp}
              className="flex-1 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold text-xs flex items-center justify-center space-x-2"
            >
              <Share2 className="w-4 h-4" />
              <span>Share to WhatsApp</span>
            </button>
            <button
              onClick={handleDownloadPdf}
              disabled={isGeneratingPdf}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-400 text-zinc-950 font-bold text-xs flex items-center space-x-2"
            >
              <Download className="w-4 h-4" />
              <span>{isGeneratingPdf ? 'PDF...' : 'Download PDF Report'}</span>
            </button>
          </div>
        </div>
      )}

      {/* VIEW 3: HISTORY */}
      {activeTab === 'history' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center space-x-2">
              <History className="w-4 h-4 text-emerald-400" />
              <span>Saved Daily Progress Reports</span>
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {state.dailyReports.map(r => (
              <div key={r.id} className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 space-y-3 hover:border-emerald-500/40 transition">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-emerald-400">{r.reportDate}</span>
                  <span className="text-[10px] text-zinc-500">{r.buildingName}</span>
                </div>
                <div className="text-[11px] text-zinc-400 space-y-1">
                  <div>Trades: Carpenter ({r.carpenterCount}), Electrical ({r.electricalCount}), Plumber ({r.plumberCount})</div>
                  <div>Bathkam Total: {(r.bathkam?.plasterWork || 0) + (r.bathkam?.materialShifting || 0) + (r.bathkam?.brickWork || 0) + (r.bathkam?.baiLabour || 0)} Labour</div>
                </div>
                <div className="pt-2 border-t border-zinc-800 flex items-center justify-between">
                  <button
                    onClick={() => {
                      setReport(r);
                      setActiveTab('editor');
                    }}
                    className="text-xs font-semibold text-emerald-400 hover:underline"
                  >
                    Load into Editor
                  </button>
                  <button
                    onClick={async () => {
                      await navigator.clipboard.writeText(generateWhatsAppReportText(r));
                      alert('Copied report text!');
                    }}
                    className="text-[11px] text-zinc-400 hover:text-white flex items-center space-x-1"
                  >
                    <Copy className="w-3 h-3" />
                    <span>Copy</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* PRINTABLE HIDDEN PDF REPORT CONTAINER */}
      <div className="overflow-hidden h-0 w-0 pointer-events-none opacity-0">
        <div
          id="printable-dpr-pdf"
          className={`w-[800px] font-sans ${
            pdfTheme === 'light'
              ? 'bg-white text-slate-900'
              : 'bg-zinc-950 text-zinc-100'
          }`}
        >
          {/* PAGE 1: MANPOWER & STOCK REPORT */}
          <div className="p-8 space-y-6 min-h-[1100px] flex flex-col justify-between">
            <div className="space-y-6">
              {/* Header Banner */}
              <div
                className={`p-6 rounded-2xl flex items-center justify-between ${
                  pdfTheme === 'light'
                    ? 'bg-gradient-to-r from-emerald-800 via-emerald-700 to-teal-800 text-white shadow-md'
                    : 'bg-gradient-to-r from-zinc-900 via-emerald-950 to-zinc-900 text-white border border-emerald-500/30'
                }`}
              >
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="text-[10px] font-bold uppercase tracking-widest bg-emerald-500/20 text-emerald-200 border border-emerald-400/30 px-2 py-0.5 rounded-full">
                      CONSTRUCTTRACK SITEOPS
                    </span>
                    <span className="text-[10px] text-emerald-200 font-mono">DPR-OFFICIAL</span>
                  </div>
                  <h1 className="text-2xl font-black tracking-tight">{report.buildingName || 'B-Building Work Progress'}</h1>
                  <div className="text-xs text-emerald-100 font-medium">Daily Site Operations & Manpower Progress Report</div>
                </div>

                <div className="text-right space-y-1">
                  <div className="text-xs text-emerald-200 font-medium">Report Date</div>
                  <div className="text-lg font-bold text-white font-mono">{report.reportDate}</div>
                  <div className="inline-block bg-white/20 backdrop-blur-md px-3 py-1 rounded-lg text-xs font-bold text-white border border-white/30">
                    {totalManpower} TOTAL WORKERS
                  </div>
                </div>
              </div>

              {/* Metric Cards Summary Bar */}
              <div className="grid grid-cols-4 gap-3">
                <div className={`p-3 rounded-xl border text-center ${pdfTheme === 'light' ? 'bg-slate-50 border-slate-200' : 'bg-zinc-900 border-zinc-800'}`}>
                  <div className={`text-[10px] font-bold uppercase tracking-wider ${pdfTheme === 'light' ? 'text-slate-500' : 'text-zinc-400'}`}>Total Manpower</div>
                  <div className="text-xl font-black text-emerald-600 mt-0.5">{totalManpower}</div>
                </div>

                <div className={`p-3 rounded-xl border text-center ${pdfTheme === 'light' ? 'bg-slate-50 border-slate-200' : 'bg-zinc-900 border-zinc-800'}`}>
                  <div className={`text-[10px] font-bold uppercase tracking-wider ${pdfTheme === 'light' ? 'text-slate-500' : 'text-zinc-400'}`}>Skilled Trades</div>
                  <div className="text-xl font-black text-emerald-600 mt-0.5">{skilledTradesTotal}</div>
                </div>

                <div className={`p-3 rounded-xl border text-center ${pdfTheme === 'light' ? 'bg-slate-50 border-slate-200' : 'bg-zinc-900 border-zinc-800'}`}>
                  <div className={`text-[10px] font-bold uppercase tracking-wider ${pdfTheme === 'light' ? 'text-slate-500' : 'text-zinc-400'}`}>Bathkam Labour</div>
                  <div className="text-xl font-black text-emerald-600 mt-0.5">{bathkamTotal}</div>
                </div>

                <div className={`p-3 rounded-xl border text-center ${pdfTheme === 'light' ? 'bg-slate-50 border-slate-200' : 'bg-zinc-900 border-zinc-800'}`}>
                  <div className={`text-[10px] font-bold uppercase tracking-wider ${pdfTheme === 'light' ? 'text-slate-500' : 'text-zinc-400'}`}>Bill Deductions</div>
                  <div className="text-xl font-black text-red-600 mt-0.5">₹{totalDamageDeduction.toLocaleString('en-IN')}</div>
                </div>
              </div>

              {/* Main Trades Table */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className={`text-xs font-bold uppercase tracking-wider ${pdfTheme === 'light' ? 'text-emerald-900' : 'text-emerald-400'}`}>
                    1. Skilled Trades & Contractor Activities
                  </h3>
                  <span className={`text-[10px] ${pdfTheme === 'light' ? 'text-slate-500' : 'text-zinc-500'}`}>
                    Sub-Total: {skilledTradesTotal} Skilled Workers
                  </span>
                </div>

                <table className={`w-full border-collapse border text-xs ${pdfTheme === 'light' ? 'border-slate-200' : 'border-zinc-800'}`}>
                  <thead>
                    <tr className={pdfTheme === 'light' ? 'bg-emerald-800 text-white font-bold' : 'bg-zinc-900 text-zinc-300 font-bold border-b border-zinc-800'}>
                      <th className="p-2 text-left border-r border-emerald-700/40 w-56">Trade / Agency</th>
                      <th className="p-2 text-center border-r border-emerald-700/40 w-24">Count</th>
                      <th className="p-2 text-left">Work Scope & Activity Narration</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { trade: 'Carpenter', count: report.carpenterCount, notes: report.carpenterNotes },
                      { trade: 'Steel Fitter', count: report.fitterCount, notes: report.fitterNotes },
                      { trade: 'Electrical', count: report.electricalCount, notes: report.electricalNotes },
                      { trade: 'Tiles (Suraj Chauhan)', count: report.surajChauhanTilesCount, notes: report.surajChauhanNotes || 'window and door frame and kitchen bottom & top laying & kitchen wall tiles laying' },
                      { trade: 'Waterproofing (Mohan Khetawat)', count: report.mohanKhetawatWaterproofingCount, notes: report.mohanKhetawatNotes || 'water proofing' },
                      { trade: 'Waterproofing (Naresh Khetawat)', count: report.nareshKhetawatWaterproofingCount, notes: report.nareshKhetawatNotes || 'water proofing' },
                      { trade: 'Plumber', count: report.plumberCount, notes: report.plumberNotes },
                      { trade: 'Core Cutting', count: report.coreCuttingCount, notes: report.coreCuttingNotes },
                      { trade: 'Fabrication', count: report.fabricationCount, notes: report.fabricationNotes },
                      ...(report.customTrades || []).map(ct => ({
                        trade: ct.contractorName ? `${ct.tradeName} (${ct.contractorName})` : ct.tradeName,
                        count: ct.count,
                        notes: ct.notes || '-'
                      }))
                    ].map((row, idx) => (
                      <tr
                        key={idx}
                        className={
                          pdfTheme === 'light'
                            ? idx % 2 === 0 ? 'bg-white' : 'bg-slate-50'
                            : idx % 2 === 0 ? 'bg-zinc-950' : 'bg-zinc-900/60'
                        }
                      >
                        <td className={`p-2 font-bold border-r ${pdfTheme === 'light' ? 'border-slate-200 text-slate-800' : 'border-zinc-800 text-zinc-200'}`}>
                          {row.trade}
                        </td>
                        <td className={`p-2 text-center font-bold border-r ${pdfTheme === 'light' ? 'border-slate-200 text-emerald-800' : 'border-zinc-800 text-emerald-400'}`}>
                          <span className={`inline-block px-2.5 py-0.5 rounded-full ${pdfTheme === 'light' ? 'bg-emerald-100 border border-emerald-300' : 'bg-emerald-500/20 border border-emerald-500/30'}`}>
                            {row.count < 10 ? `0${row.count}` : row.count}
                          </span>
                        </td>
                        <td className={`p-2 italic ${pdfTheme === 'light' ? 'text-slate-600' : 'text-zinc-400'}`}>
                          {row.notes ? row.notes : '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* MATERIAL DAMAGE & BILL DEDUCTIONS TABLE IN PDF */}
              {report.damageDeductions && report.damageDeductions.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-red-700 flex items-center space-x-1.5">
                      <span>⚠️ Material Damage & Contractor Bill Deductions</span>
                    </h3>
                    <span className="text-[10px] font-bold text-red-700 bg-red-100 border border-red-300 px-2 py-0.5 rounded">
                      Total Bill Penalty: ₹{totalDamageDeduction.toLocaleString('en-IN')}
                    </span>
                  </div>

                  <table className="w-full border-collapse border border-slate-300 text-xs">
                    <thead>
                      <tr className="bg-red-800 text-white font-bold">
                        <th className="p-2 text-left w-44">Contractor / Worker</th>
                        <th className="p-2 text-left w-56">Damaged Material</th>
                        <th className="p-2 text-center w-28">Deduction (₹)</th>
                        <th className="p-2 text-left">Damage Description & Reason</th>
                      </tr>
                    </thead>
                    <tbody>
                      {report.damageDeductions.map((dmg, idx) => (
                        <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-red-50/40'}>
                          <td className="p-2 font-bold text-slate-900 border-r border-slate-200">
                            {dmg.contractorOrWorkerName} <span className="text-[10px] text-slate-500 font-normal">({dmg.tradeOrAgency})</span>
                          </td>
                          <td className="p-2 text-slate-800 border-r border-slate-200 font-medium">{dmg.materialName}</td>
                          <td className="p-2 text-center font-bold text-red-700 border-r border-slate-200">
                            -₹{dmg.damageAmount.toLocaleString('en-IN')}
                          </td>
                          <td className="p-2 text-slate-600 italic">{dmg.description}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Cement Stock Inventory */}
              <div className="space-y-2">
                <h3 className={`text-xs font-bold uppercase tracking-wider ${pdfTheme === 'light' ? 'text-emerald-900' : 'text-emerald-400'}`}>
                  2. Cement Stock Inventory (Total: {totalCementBags} Bags)
                </h3>
                <div className="grid grid-cols-4 gap-2 text-xs">
                  {report.cementStock.map((c, idx) => (
                    <div
                      key={idx}
                      className={`p-2.5 rounded-xl border text-center ${
                        pdfTheme === 'light'
                          ? 'bg-slate-50 border-slate-200'
                          : 'bg-zinc-900 border-zinc-800'
                      }`}
                    >
                      <div className={`text-[10px] font-bold ${pdfTheme === 'light' ? 'text-slate-600' : 'text-zinc-400'}`}>
                        {c.brandName} {c.type ? `(${c.type})` : ''}
                      </div>
                      <div className="text-sm font-black text-amber-600 mt-0.5">{c.bags} Bags</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Official Signatures Footer Block */}
            <div className={`pt-4 border-t-2 ${pdfTheme === 'light' ? 'border-slate-200 text-slate-600' : 'border-zinc-800 text-zinc-400'} flex justify-between items-end text-xs`}>
              <div className="space-y-1">
                <div className="font-bold text-slate-800">ConstructTrack SiteOps Verification</div>
                <div className="text-[10px] text-slate-400">Generated on {new Date().toLocaleString('en-GB')}</div>
              </div>

              <div className="flex space-x-12">
                <div className="text-center space-y-6">
                  <div className="w-32 border-b border-slate-400" />
                  <div className="text-[10px] font-bold text-slate-700">Site Engineer Signature</div>
                </div>
                <div className="text-center space-y-6">
                  <div className="w-32 border-b border-slate-400" />
                  <div className="text-[10px] font-bold text-slate-700">Project Manager Signature</div>
                </div>
              </div>
            </div>
          </div>

          {/* PAGE 2: TRADE-WISE BEFORE & AFTER WORK PROGRESS COMPARISON GRID */}
          <div className="p-8 space-y-6 min-h-[1100px] flex flex-col justify-between border-t-4 border-dashed border-emerald-500">
            <div className="space-y-6">
              {/* Page 2 Header Banner */}
              <div
                className={`p-5 rounded-2xl flex items-center justify-between ${
                  pdfTheme === 'light'
                    ? 'bg-gradient-to-r from-emerald-800 via-emerald-700 to-teal-800 text-white shadow-md'
                    : 'bg-gradient-to-r from-zinc-900 via-emerald-950 to-zinc-900 text-white border border-emerald-500/30'
                }`}
              >
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-widest bg-emerald-500/20 text-emerald-200 border border-emerald-400/30 px-2 py-0.5 rounded-full inline-block mb-1">
                    PAGE 2 OF 2 — TRADE-WISE WORK AUDIT
                  </div>
                  <h2 className="text-xl font-black">{report.buildingName || 'B-Building Work Progress'}</h2>
                  <div className="text-xs text-emerald-100 font-medium">Trade-wise & Additional Works Before/After Progress Photos</div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-bold text-white">{report.reportDate}</div>
                  <div className="text-xs text-emerald-200">
                    Photo Sets: {report.workPhotoSets?.length || 0} Sets Attached
                  </div>
                </div>
              </div>

              {/* TRADE-WISE PHOTO COMPARISON GRID */}
              <div className="space-y-4">
                {report.workPhotoSets && report.workPhotoSets.length > 0 ? (
                  report.workPhotoSets.map((pSet, idx) => (
                    <div
                      key={idx}
                      className={`p-4 rounded-2xl border space-y-3 ${
                        pdfTheme === 'light'
                          ? 'bg-slate-50/80 border-slate-200'
                          : 'bg-zinc-900 border-zinc-800'
                      }`}
                    >
                      <div className="flex items-center justify-between border-b pb-2">
                        <div className="flex items-center space-x-2">
                          <span className={`text-xs font-black uppercase tracking-wider px-3 py-1 rounded-lg ${
                            pdfTheme === 'light'
                              ? 'bg-emerald-800 text-white'
                              : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          }`}>
                            {pSet.workTypeOrTrade}
                          </span>
                          {pSet.workAreaLocation && (
                            <span className="text-xs text-slate-600 font-semibold">
                              📍 {pSet.workAreaLocation}
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] font-mono text-slate-400">Photo Set #{idx + 1}</span>
                      </div>

                      {/* Side-by-Side Before vs After Comparison Cards */}
                      <div className="grid grid-cols-2 gap-4">
                        {/* BEFORE PHOTO CARD */}
                        <div className={`p-3 rounded-xl border space-y-2 ${pdfTheme === 'light' ? 'bg-amber-50/60 border-amber-200' : 'bg-zinc-950 border-zinc-800'}`}>
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-bold text-amber-800 uppercase tracking-wider">BEFORE WORK</span>
                            <span className="text-[9px] text-amber-600 font-mono">STATUS: INITIAL</span>
                          </div>
                          {pSet.beforePhotoUrl ? (
                            <div className="space-y-1.5">
                              <div className="relative aspect-video rounded-lg overflow-hidden border border-amber-300">
                                <img src={pSet.beforePhotoUrl} alt="Before" className="w-full h-full object-cover" />
                              </div>
                              <div className="text-xs text-slate-800 font-medium">{pSet.beforeCaption || 'Before work photo'}</div>
                            </div>
                          ) : (
                            <div className="h-32 rounded-lg border-2 border-dashed border-amber-200 flex items-center justify-center text-xs italic text-amber-700/60">
                              No Before Photo
                            </div>
                          )}
                        </div>

                        {/* AFTER PHOTO CARD */}
                        <div className={`p-3 rounded-xl border space-y-2 ${pdfTheme === 'light' ? 'bg-emerald-50/60 border-emerald-200' : 'bg-zinc-950 border-zinc-800'}`}>
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider">AFTER COMPLETED</span>
                            <span className="text-[9px] text-emerald-600 font-mono">STATUS: EXECUTED</span>
                          </div>
                          {pSet.afterPhotoUrl ? (
                            <div className="space-y-1.5">
                              <div className="relative aspect-video rounded-lg overflow-hidden border border-emerald-300">
                                <img src={pSet.afterPhotoUrl} alt="After" className="w-full h-full object-cover" />
                              </div>
                              <div className="text-xs text-slate-800 font-medium">{pSet.afterCaption || 'After completion photo'}</div>
                            </div>
                          ) : (
                            <div className="h-32 rounded-lg border-2 border-dashed border-emerald-200 flex items-center justify-center text-xs italic text-emerald-700/60">
                              No After Photo
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className={`p-6 rounded-2xl border text-center text-xs italic ${pdfTheme === 'light' ? 'bg-slate-50 border-slate-200 text-slate-500' : 'bg-zinc-900 border-zinc-800 text-zinc-500'}`}>
                    No trade-wise Before & After photo sets attached for this report date.
                  </div>
                )}
              </div>
            </div>

            {/* Page 2 Signatures Footer */}
            <div className={`pt-4 border-t-2 ${pdfTheme === 'light' ? 'border-slate-200 text-slate-600' : 'border-zinc-800 text-zinc-400'} flex justify-between items-end text-xs`}>
              <div className="space-y-1">
                <div className="font-bold text-slate-800">ConstructTrack SiteOps Photo Verification</div>
                <div className="text-[10px] text-slate-400">Page 2 of 2 — Site Visual Progress Audit</div>
              </div>

              <div className="flex space-x-12">
                <div className="text-center space-y-6">
                  <div className="w-32 border-b border-slate-400" />
                  <div className="text-[10px] font-bold text-slate-700">Site Engineer Signature</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
