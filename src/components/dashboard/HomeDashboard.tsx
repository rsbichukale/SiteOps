'use client';

import React from 'react';
import {
  Package, Banknote, Truck, Users, ShieldCheck, Microscope,
  ArrowRight, AlertTriangle, CheckCircle2, DollarSign, Activity, MessageSquare, Share2
} from 'lucide-react';
import { ModuleTab } from '@/types';
import { getAppState, getStockSummary } from '@/lib/dbState';

interface HomeDashboardProps {
  onSelectTab: (tab: ModuleTab) => void;
}

export const HomeDashboard: React.FC<HomeDashboardProps> = ({ onSelectTab }) => {
  const state = getAppState();
  const stockSummary = getStockSummary();

  const lowStockItems = Object.values(stockSummary).filter(s => s.isLowStock);
  const totalSpent = state.expenses.reduce((sum, e) => sum + e.amount, 0);
  const activeEquipCount = state.equipment.filter(e => e.status === 'ACTIVE').length;
  const todayVisitorsCount = state.visitors.length;
  const safetyPassCount = state.safetyChecklists[0]?.overallScore || 10;
  const pendingCubesCount = state.cubeTests.filter(c => c.status === 'PENDING').length;

  return (
    <div className="space-y-4 max-w-7xl mx-auto p-3 sm:p-6 pb-24">
      {/* Hero Welcome Card */}
      <div className="p-5 sm:p-6 rounded-2xl bg-gradient-to-br from-zinc-900 via-zinc-900 to-emerald-950/60 border border-emerald-500/20 shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-4 -translate-y-4 opacity-10 pointer-events-none">
          <Activity className="w-64 h-64 text-emerald-400" />
        </div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2">
            <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-bold uppercase tracking-wider border border-emerald-500/30">
              ConstructTrack SiteOps
            </span>
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              Site Operations Executive Dashboard
            </h1>
            <p className="text-xs text-zinc-400 max-w-xl">
              Live operations status across Materials, Petty Cash, Rented Machinery, Site Visitors, Safety Compliance & Quality Tests.
            </p>
          </div>

          <button
            onClick={() => onSelectTab('whatsappReport')}
            className="flex items-center space-x-2.5 px-5 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-400 hover:from-emerald-400 hover:to-emerald-300 text-zinc-950 font-bold text-xs shadow-xl shadow-emerald-500/20 active:scale-95 transition-all self-start md:self-auto"
          >
            <MessageSquare className="w-4 h-4" />
            <span>Generate Today's WhatsApp DPR</span>
            <Share2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* 6 Module Overview Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {/* Module 1: Material */}
        <div
          onClick={() => onSelectTab('material')}
          className="p-5 rounded-2xl bg-zinc-900 border border-zinc-800 hover:border-emerald-500/40 transition-all cursor-pointer group space-y-3"
        >
          <div className="flex items-center justify-between">
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
              <Package className="w-5 h-5" />
            </div>
            <ArrowRight className="w-4 h-4 text-zinc-500 group-hover:text-emerald-400 group-hover:translate-x-1 transition" />
          </div>
          <div>
            <h3 className="font-bold text-base text-white">1. Material & Inventory</h3>
            <p className="text-xs text-zinc-400">Stock Ledger, Inward GRN, Material Issues</p>
          </div>
          <div className="pt-2 border-t border-zinc-800/80 flex items-center justify-between text-xs">
            <span className="text-zinc-500">Stock Alerts:</span>
            {lowStockItems.length > 0 ? (
              <span className="text-red-400 font-bold flex items-center space-x-1">
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>{lowStockItems.length} Low Stock</span>
              </span>
            ) : (
              <span className="text-emerald-400 font-bold">✓ Optimal Stock</span>
            )}
          </div>
        </div>

        {/* Module 2: Cash */}
        <div
          onClick={() => onSelectTab('cash')}
          className="p-5 rounded-2xl bg-zinc-900 border border-zinc-800 hover:border-emerald-500/40 transition-all cursor-pointer group space-y-3"
        >
          <div className="flex items-center justify-between">
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
              <Banknote className="w-5 h-5" />
            </div>
            <ArrowRight className="w-4 h-4 text-zinc-500 group-hover:text-emerald-400 group-hover:translate-x-1 transition" />
          </div>
          <div>
            <h3 className="font-bold text-base text-white">2. Petty Cash & Expenses</h3>
            <p className="text-xs text-zinc-400">Daily Site Expenses, Fund Requisitions</p>
          </div>
          <div className="pt-2 border-t border-zinc-800/80 flex items-center justify-between text-xs">
            <span className="text-zinc-500">Total Spent:</span>
            <span className="text-emerald-400 font-bold">₹{totalSpent.toLocaleString()}</span>
          </div>
        </div>

        {/* Module 3: Machinery */}
        <div
          onClick={() => onSelectTab('machinery')}
          className="p-5 rounded-2xl bg-zinc-900 border border-zinc-800 hover:border-emerald-500/40 transition-all cursor-pointer group space-y-3"
        >
          <div className="flex items-center justify-between">
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
              <Truck className="w-5 h-5" />
            </div>
            <ArrowRight className="w-4 h-4 text-zinc-500 group-hover:text-emerald-400 group-hover:translate-x-1 transition" />
          </div>
          <div>
            <h3 className="font-bold text-base text-white">3. Machinery & Equipment</h3>
            <p className="text-xs text-zinc-400">JCBs, Cranes, Fuel & Rental Billing</p>
          </div>
          <div className="pt-2 border-t border-zinc-800/80 flex items-center justify-between text-xs">
            <span className="text-zinc-500">Active Machines:</span>
            <span className="text-emerald-400 font-bold">{activeEquipCount} On-Site</span>
          </div>
        </div>

        {/* Module 4: Visitors */}
        <div
          onClick={() => onSelectTab('visitor')}
          className="p-5 rounded-2xl bg-zinc-900 border border-zinc-800 hover:border-emerald-500/40 transition-all cursor-pointer group space-y-3"
        >
          <div className="flex items-center justify-between">
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
              <Users className="w-5 h-5" />
            </div>
            <ArrowRight className="w-4 h-4 text-zinc-500 group-hover:text-emerald-400 group-hover:translate-x-1 transition" />
          </div>
          <div>
            <h3 className="font-bold text-base text-white">4. Visitors & Meetings</h3>
            <p className="text-xs text-zinc-400">Gate Check-in, Meeting Decisions, Photos</p>
          </div>
          <div className="pt-2 border-t border-zinc-800/80 flex items-center justify-between text-xs">
            <span className="text-zinc-500">Today's Visitors:</span>
            <span className="text-emerald-400 font-bold">{todayVisitorsCount} Checked In</span>
          </div>
        </div>

        {/* Module 5: Safety */}
        <div
          onClick={() => onSelectTab('safety')}
          className="p-5 rounded-2xl bg-zinc-900 border border-zinc-800 hover:border-emerald-500/40 transition-all cursor-pointer group space-y-3"
        >
          <div className="flex items-center justify-between">
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <ArrowRight className="w-4 h-4 text-zinc-500 group-hover:text-emerald-400 group-hover:translate-x-1 transition" />
          </div>
          <div>
            <h3 className="font-bold text-base text-white">5. Safety & Compliance</h3>
            <p className="text-xs text-zinc-400">Daily Safety Checklist, Incidents & PPE</p>
          </div>
          <div className="pt-2 border-t border-zinc-800/80 flex items-center justify-between text-xs">
            <span className="text-zinc-500">Daily Safety Score:</span>
            <span className="text-emerald-400 font-bold">{safetyPassCount}/10 Passed</span>
          </div>
        </div>

        {/* Module 6: Quality */}
        <div
          onClick={() => onSelectTab('quality')}
          className="p-5 rounded-2xl bg-zinc-900 border border-zinc-800 hover:border-emerald-500/40 transition-all cursor-pointer group space-y-3"
        >
          <div className="flex items-center justify-between">
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
              <Microscope className="w-5 h-5" />
            </div>
            <ArrowRight className="w-4 h-4 text-zinc-500 group-hover:text-emerald-400 group-hover:translate-x-1 transition" />
          </div>
          <div>
            <h3 className="font-bold text-base text-white">6. Quality Control (QC)</h3>
            <p className="text-xs text-zinc-400">Concrete Cube Tests, Material Tests & NCR</p>
          </div>
          <div className="pt-2 border-t border-zinc-800/80 flex items-center justify-between text-xs">
            <span className="text-zinc-500">Cube Test Status:</span>
            <span className="text-amber-400 font-bold">{pendingCubesCount} Pending 28-Day</span>
          </div>
        </div>
      </div>
    </div>
  );
};
