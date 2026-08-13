'use client';

import React, { useState } from 'react';
import {
  MessageSquare, Share2, Copy, Check, Calendar, Building, Users, HardHat,
  Package, Sparkles, Plus, Minus, RotateCcw, Clock, Save, History, FileText, Download, Sun, Moon, Trash2
} from 'lucide-react';
import { DailyProgressReport, CementStockEntry, CustomTradeEntry } from '@/types';
import { getAppState, saveDailyReport, generateWhatsAppReportText, DEFAULT_SAMPLE_REPORT } from '@/lib/dbState';
import { downloadDPRPdfReport } from '@/lib/pdfReportGenerator';

export const WhatsAppReportModule: React.FC = () => {
  const state = getAppState();
  const latestSavedReport = state.dailyReports?.[0] || DEFAULT_SAMPLE_REPORT;

  const [report, setReport] = useState<DailyProgressReport>({
    ...latestSavedReport,
    reportDate: new Date().toLocaleDateString('en-GB'), // e.g. 13/08/2026
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
                  Custom Trades Supported
                </span>
              </div>
              <p className="text-xs text-zinc-400 mt-0.5">
                Generate today's site progress update, add custom trades/contractors, and export executive PDF reports.
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
              <span>{isGeneratingPdf ? 'Generating PDF...' : 'Download PDF'}</span>
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
              <span className="text-[10px] text-zinc-400 px-1 font-medium">PDF Background:</span>
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

            {/* Skilled Trades & Contractors (With Narrations & Add Custom Trade Button!) */}
            <div className="bg-zinc-900/90 border border-zinc-800 rounded-2xl p-4 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center space-x-2">
                  <HardHat className="w-4 h-4" />
                  <span>2. Trades & Contractor Agencies</span>
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
                <div className="bg-zinc-950 border border-emerald-500/40 rounded-xl p-3.5 space-y-3 animate-fadeIn">
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
                      <label className="block text-[10px] text-zinc-400 mb-1">Contractor / Agency Name (Optional)</label>
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

                {/* Custom Trades Dynamic List */}
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

      {/* PRINTABLE HIDDEN PDF REPORT CONTAINER (DYNAMIC CUSTOM TRADES & THEME SUPPORT) */}
      <div className="overflow-hidden h-0 w-0 pointer-events-none opacity-0">
        <div
          id="printable-dpr-pdf"
          className={`w-[800px] p-8 font-sans space-y-6 ${
            pdfTheme === 'light'
              ? 'bg-white text-slate-900'
              : 'bg-zinc-950 text-zinc-100'
          }`}
        >
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
              <div className={`text-[10px] font-bold uppercase tracking-wider ${pdfTheme === 'light' ? 'text-slate-500' : 'text-zinc-400'}`}>Cement Stock</div>
              <div className="text-xl font-black text-amber-600 mt-0.5">{totalCementBags} Bags</div>
            </div>
          </div>

          {/* Main Trades Table (Default Trades + Custom Trades!) */}
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
                  <th className="p-2.5 text-left border-r border-emerald-700/40 w-56">Trade / Agency</th>
                  <th className="p-2.5 text-center border-r border-emerald-700/40 w-24">Count</th>
                  <th className="p-2.5 text-left">Work Scope & Activity Narration</th>
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
                    <td className={`p-2.5 font-bold border-r ${pdfTheme === 'light' ? 'border-slate-200 text-slate-800' : 'border-zinc-800 text-zinc-200'}`}>
                      {row.trade}
                    </td>
                    <td className={`p-2.5 text-center font-bold border-r ${pdfTheme === 'light' ? 'border-slate-200 text-emerald-800' : 'border-zinc-800 text-emerald-400'}`}>
                      <span className={`inline-block px-2.5 py-0.5 rounded-full ${pdfTheme === 'light' ? 'bg-emerald-100 border border-emerald-300' : 'bg-emerald-500/20 border border-emerald-500/30'}`}>
                        {row.count < 10 ? `0${row.count}` : row.count}
                      </span>
                    </td>
                    <td className={`p-2.5 italic ${pdfTheme === 'light' ? 'text-slate-600' : 'text-zinc-400'}`}>
                      {row.notes ? row.notes : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Bathkam & Department Dual Tables */}
          <div className="grid grid-cols-2 gap-4">
            {/* Bathkam Table */}
            <div className="space-y-2">
              <h3 className={`text-xs font-bold uppercase tracking-wider ${pdfTheme === 'light' ? 'text-emerald-900' : 'text-emerald-400'}`}>
                2. Bathkam Breakdown (Total: {bathkamTotal})
              </h3>
              <table className={`w-full border-collapse border text-xs ${pdfTheme === 'light' ? 'border-slate-200' : 'border-zinc-800'}`}>
                <thead>
                  <tr className={pdfTheme === 'light' ? 'bg-slate-100 text-slate-800 font-bold border-b border-slate-200' : 'bg-zinc-900 text-zinc-300 font-bold border-b border-zinc-800'}>
                    <th className="p-2 text-left border-r border-slate-200">Activity</th>
                    <th className="p-2 text-center w-20">Labour Count</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { label: 'Plaster Work', count: report.bathkam?.plasterWork || 0 },
                    { label: 'Material Shifting', count: report.bathkam?.materialShifting || 0 },
                    { label: 'Brick Work', count: report.bathkam?.brickWork || 0 },
                    { label: 'Bai (Female Labour)', count: report.bathkam?.baiLabour || 0 },
                  ].map((row, idx) => (
                    <tr key={idx} className={pdfTheme === 'light' ? (idx % 2 === 0 ? 'bg-white' : 'bg-slate-50') : (idx % 2 === 0 ? 'bg-zinc-950' : 'bg-zinc-900/60')}>
                      <td className={`p-2 border-r ${pdfTheme === 'light' ? 'border-slate-200 text-slate-700' : 'border-zinc-800 text-zinc-300'}`}>{row.label}</td>
                      <td className={`p-2 text-center font-bold ${pdfTheme === 'light' ? 'text-slate-900' : 'text-white'}`}>{row.count < 10 ? `0${row.count}` : row.count}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Department Table */}
            <div className="space-y-2">
              <h3 className={`text-xs font-bold uppercase tracking-wider ${pdfTheme === 'light' ? 'text-emerald-900' : 'text-emerald-400'}`}>
                3. Department & Operations
              </h3>
              <table className={`w-full border-collapse border text-xs ${pdfTheme === 'light' ? 'border-slate-200' : 'border-zinc-800'}`}>
                <thead>
                  <tr className={pdfTheme === 'light' ? 'bg-slate-100 text-slate-800 font-bold border-b border-slate-200' : 'bg-zinc-900 text-zinc-300 font-bold border-b border-zinc-800'}>
                    <th className="p-2 text-left border-r border-slate-200">Category</th>
                    <th className="p-2 text-center w-20">Count</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { label: 'Department Staff', count: report.departmentStaffCount || 0 },
                    { label: 'Department Labour', count: report.departmentLabourCount || 0 },
                    { label: 'Breaker Work (Bathkam)', count: report.bathkam?.breakerWork || 0 },
                  ].map((row, idx) => (
                    <tr key={idx} className={pdfTheme === 'light' ? (idx % 2 === 0 ? 'bg-white' : 'bg-slate-50') : (idx % 2 === 0 ? 'bg-zinc-950' : 'bg-zinc-900/60')}>
                      <td className={`p-2 border-r ${pdfTheme === 'light' ? 'border-slate-200 text-slate-700' : 'border-zinc-300 text-zinc-300'}`}>{row.label}</td>
                      <td className={`p-2 text-center font-bold ${pdfTheme === 'light' ? 'text-slate-900' : 'text-white'}`}>{row.count < 10 ? `0${row.count}` : row.count}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Cement Stock Inventory */}
          <div className="space-y-2">
            <h3 className={`text-xs font-bold uppercase tracking-wider ${pdfTheme === 'light' ? 'text-emerald-900' : 'text-emerald-400'}`}>
              4. Cement Stock Inventory (Total: {totalCementBags} Bags)
            </h3>
            <div className="grid grid-cols-4 gap-2.5 text-xs">
              {report.cementStock.map((c, idx) => (
                <div
                  key={idx}
                  className={`p-3 rounded-xl border text-center ${
                    pdfTheme === 'light'
                      ? 'bg-slate-50 border-slate-200'
                      : 'bg-zinc-900 border-zinc-800'
                  }`}
                >
                  <div className={`text-[10px] font-bold ${pdfTheme === 'light' ? 'text-slate-600' : 'text-zinc-400'}`}>
                    {c.brandName} {c.type ? `(${c.type})` : ''}
                  </div>
                  <div className="text-base font-black text-amber-600 mt-0.5">{c.bags} Bags</div>
                </div>
              ))}
            </div>
          </div>

          {/* Official Signatures Footer Block */}
          <div className={`pt-6 border-t-2 ${pdfTheme === 'light' ? 'border-slate-200 text-slate-600' : 'border-zinc-800 text-zinc-400'} flex justify-between items-end text-xs`}>
            <div className="space-y-1">
              <div className="font-bold text-slate-800">ConstructTrack SiteOps Verification</div>
              <div className="text-[10px] text-slate-400">Generated on {new Date().toLocaleString('en-GB')}</div>
            </div>

            <div className="flex space-x-12">
              <div className="text-center space-y-8">
                <div className="w-36 border-b border-slate-400" />
                <div className="text-[11px] font-bold text-slate-700">Site Engineer / Supervisor</div>
              </div>
              <div className="text-center space-y-8">
                <div className="w-36 border-b border-slate-400" />
                <div className="text-[11px] font-bold text-slate-700">Project Manager / Authorised</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
