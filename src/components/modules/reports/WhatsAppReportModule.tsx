'use client';

import React, { useState, useEffect } from 'react';
import {
  MessageSquare, Share2, Copy, Check, Calendar, Building, Users, HardHat,
  Package, Sparkles, Plus, Minus, RotateCcw, Clock, Save, History, FileText, Download, Sun, Moon, Trash2, Camera, Image as ImageIcon, AlertTriangle, ArrowRight, Layers, Zap
} from 'lucide-react';
import { DailyProgressReport, CementStockEntry, CustomTradeEntry, ContractorShiftRecord } from '@/types';
import { deleteDailyReport, saveDailyReport, generateWhatsAppReportText, DEFAULT_SAMPLE_REPORT } from '@/lib/dbState';
import { useSiteOpsState } from '@/hooks/useSiteOpsState';
import { downloadDPRPdfReport } from '@/lib/pdfReportGenerator';

import { ReportHeaderEditor } from './components/ReportHeaderEditor';
import { ContractorManpowerGrid } from './components/ContractorManpowerGrid';
import { CementStockEditor } from './components/CementStockEditor';
import { WhatsAppMessagePreview } from './components/WhatsAppMessagePreview';

export const WhatsAppReportModule: React.FC = () => {
  const { state } = useSiteOpsState();
  const latestSavedReport = state.dailyReports?.[0] || DEFAULT_SAMPLE_REPORT;

  const [report, setReport] = useState<DailyProgressReport>({
    ...latestSavedReport,
    reportDate: new Date().toLocaleDateString('en-GB'), // e.g. 13/08/2026
  });

  const [copied, setCopied] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [autoFilledSuccess, setAutoFilledSuccess] = useState(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [pdfTheme, setPdfTheme] = useState<'light' | 'dark'>('light');
  const [activeTab, setActiveTab] = useState<'editor' | 'preview' | 'history'>('editor');

  const handleSave = async () => {
    const result = await saveDailyReport(report);
    if (!result.success) return;
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const handleAutoFillFromPunchedShifts = () => {
    try {
      const normalizeDate = (value: string) => {
        const match = value.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
        return match ? `${match[3]}-${match[2]}-${match[1]}` : value.slice(0, 10);
      };
      const reportDate = normalizeDate(report.reportDate);
      const todayShifts = (state.contractorShifts || []).filter(
        shift => shift.status === 'COMPLETED' && normalizeDate(shift.reportDate) === reportDate
      );
      if (!todayShifts.length) return;

      let carpenter = 0, fitter = 0, electrical = 0, plumber = 0;
      const customTradesMap: Record<string, { count: number; tradeName: string; contractorName: string; notes: string }> = {};

      todayShifts.forEach((s: ContractorShiftRecord) => {
        const t = s.trade.toLowerCase();
        if (t.includes('carpenter')) carpenter += s.workerCount;
        else if (t.includes('fitter') || t.includes('steel')) fitter += s.workerCount;
        else if (t.includes('electric')) electrical += s.workerCount;
        else if (t.includes('plumb')) plumber += s.workerCount;
        else {
          const key = `${s.trade}_${s.contractorName}`;
          customTradesMap[key] = {
            count: (customTradesMap[key]?.count || 0) + s.workerCount,
            tradeName: s.trade,
            contractorName: s.contractorName,
            notes: s.workDescription || customTradesMap[key]?.notes || ''
          };
        }
      });

      const updatedCustomTrades: CustomTradeEntry[] = Object.values(customTradesMap).map((info, i) => ({
        id: 'auto_ct_' + i,
        tradeName: info.tradeName,
        contractorName: info.contractorName,
        count: info.count,
        notes: info.notes
      }));

      setReport(prev => ({
        ...prev,
        carpenterCount: carpenter || prev.carpenterCount,
        fitterCount: fitter || prev.fitterCount,
        electricalCount: electrical || prev.electricalCount,
        plumberCount: plumber || prev.plumberCount,
        customTrades: updatedCustomTrades.length ? updatedCustomTrades : prev.customTrades
      }));

      setAutoFilledSuccess(true);
      setTimeout(() => setAutoFilledSuccess(false), 2500);
    } catch (err) {
      console.error('[SiteOps Report] Error auto-filling report from DB:', err);
    }
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

  const handleDeleteReport = async (id: number) => {
    if (!confirm('Delete this saved report?')) return;
    await deleteDailyReport(id);
  };

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Top Banner Actions */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
        <div>
          <div className="flex items-center gap-2 text-emerald-400 font-semibold text-xs tracking-wider uppercase">
            <MessageSquare className="w-4 h-4" /> Daily Progress Report (DPR) & WhatsApp Engine
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-zinc-100 mt-1">
            Automated Site Progress Generator
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            Seamlessly auto-fill attendance & shift logs from database and export PDF / WhatsApp reports.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handleAutoFillFromPunchedShifts}
            className="px-3.5 py-2 text-xs font-bold bg-amber-500/10 text-amber-400 border border-amber-500/30 rounded-xl hover:bg-amber-500/20 flex items-center gap-1.5 transition-all"
          >
            <Zap className="w-4 h-4 fill-amber-400" />
            {autoFilledSuccess ? 'Punched Shifts Synced!' : 'Auto-Fill Today\'s Operations'}
          </button>

          <button
            type="button"
            onClick={handleSave}
            className="px-3.5 py-2 text-xs font-bold bg-emerald-500 text-zinc-950 rounded-xl hover:bg-emerald-400 flex items-center gap-1.5 shadow transition-all"
          >
            <Save className="w-4 h-4" />
            {savedSuccess ? 'Saved to DB!' : 'Save Report'}
          </button>
        </div>
      </div>

      {/* Main Tabs (Editor vs Live WhatsApp Preview) */}
      <div className="flex items-center space-x-2 border-b border-zinc-800 pb-2">
        <button
          type="button"
          onClick={() => setActiveTab('editor')}
          className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all ${
            activeTab === 'editor'
              ? 'bg-zinc-800 text-emerald-400 border border-zinc-700'
              : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          1. Edit Daily Progress Log
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('preview')}
          className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all ${
            activeTab === 'preview'
              ? 'bg-zinc-800 text-emerald-400 border border-zinc-700'
              : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          2. Live WhatsApp & PDF Export
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('history')}
          className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all ${
            activeTab === 'history'
              ? 'bg-zinc-800 text-emerald-400 border border-zinc-700'
              : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          3. Saved History ({state.dailyReports.length})
        </button>
      </div>

      {/* Editor Tab */}
      {activeTab === 'editor' && (
        <div className="space-y-6">
          <ReportHeaderEditor
            report={report}
            onChange={updated => setReport(prev => ({ ...prev, ...updated }))}
          />

          <ContractorManpowerGrid
            report={report}
            onChange={updated => setReport(prev => ({ ...prev, ...updated }))}
          />

          <CementStockEditor
            report={report}
            onChange={updated => setReport(prev => ({ ...prev, ...updated }))}
          />
        </div>
      )}

      {/* Preview Tab */}
      {activeTab === 'preview' && (
        <div className="space-y-6">
          <WhatsAppMessagePreview report={report} />

          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h3 className="text-sm font-semibold text-zinc-100">Export Formal DPR PDF Document</h3>
              <p className="text-xs text-zinc-400">Download formatted PDF with site manpower, cement stock, and trade logs.</p>
            </div>
            <button
              type="button"
              onClick={handleDownloadPdf}
              disabled={isGeneratingPdf}
              className="px-4 py-2 text-xs font-bold bg-sky-500 text-zinc-950 rounded-xl hover:bg-sky-400 flex items-center gap-2 shadow"
            >
              <Download className="w-4 h-4" />
              {isGeneratingPdf ? 'Generating PDF...' : 'Download PDF Report'}
            </button>
          </div>
        </div>
      )}

      {activeTab === 'history' && (
        <div className="space-y-3">
          {state.dailyReports.length === 0 ? (
            <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-8 text-center text-sm text-zinc-500">No saved reports for this project.</div>
          ) : state.dailyReports.map(savedReport => (
            <div key={savedReport.id} className="flex items-center justify-between rounded-xl border border-zinc-800 bg-zinc-900 p-4">
              <div>
                <div className="font-semibold text-white">{savedReport.buildingName}</div>
                <div className="text-xs text-zinc-400">{savedReport.reportDate} · {savedReport.createdByName || 'Site user'}</div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => { setReport(savedReport); setActiveTab('editor'); }} className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-bold text-zinc-950">Open</button>
                <button onClick={() => handleDeleteReport(savedReport.id)} className="rounded-lg bg-red-900 px-3 py-1.5 text-xs font-bold text-red-100">Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
