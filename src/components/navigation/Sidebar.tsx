'use client';

import React from 'react';
import {
  X, LayoutDashboard, Package, Banknote, Truck, Users, ShieldCheck, Microscope,
  HardHat, LogOut, Database, Download, RefreshCw, MessageSquare
} from 'lucide-react';
import { ModuleTab, AppUser } from '@/types';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  activeTab: ModuleTab;
  onSelectTab: (tab: ModuleTab) => void;
  currentUser: AppUser | null;
  onLogout: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  onClose,
  activeTab,
  onSelectTab,
  currentUser,
  onLogout,
}) => {
  if (!isOpen) return null;

  const menuItems = [
    { id: 'dashboard' as ModuleTab, label: 'Home Dashboard', icon: LayoutDashboard, desc: 'Overview of all site operations' },
    { id: 'whatsappReport' as ModuleTab, label: 'WhatsApp Daily DPR', icon: MessageSquare, desc: 'Generate & send daily progress report' },
    { id: 'databaseManager' as ModuleTab, label: 'Database & Master Records', icon: Database, desc: 'Add, Edit, Delete Master Data' },
    { id: 'material' as ModuleTab, label: 'Material & Inventory', icon: Package, desc: 'GRN, Stock Ledger, Material Issue' },
    { id: 'cash' as ModuleTab, label: 'Petty Cash & Expenses', icon: Banknote, desc: 'Daily Expenses, Fund Requisitions' },
    { id: 'machinery' as ModuleTab, label: 'Machinery & Equipment', icon: Truck, desc: 'Usage Logs, Rental Billing, Fuel' },
    { id: 'visitor' as ModuleTab, label: 'Visitors & Meetings', icon: Users, desc: 'Gate Register, Meeting Minutes' },
    { id: 'safety' as ModuleTab, label: 'Safety & Compliance', icon: ShieldCheck, desc: 'Daily Checklist, Incident Register' },
    { id: 'quality' as ModuleTab, label: 'Quality Control (QC)', icon: Microscope, desc: 'Cube Tests, Material Tests, NCR' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="relative flex-1 max-w-xs w-full bg-zinc-900 border-r border-zinc-800 text-zinc-100 flex flex-col z-10 shadow-2xl">
        {/* Drawer Header */}
        <div className="p-4 border-b border-zinc-800 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-zinc-950 font-bold shadow-lg shadow-emerald-500/20">
              <HardHat className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-bold text-sm text-white leading-none">ConstructTrack</h2>
              <span className="text-[10px] text-emerald-400 font-medium">SiteOps Companion v1.0</span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-zinc-800 text-zinc-400 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* User Badge */}
        {currentUser && (
          <div className="p-3 mx-3 my-3 rounded-xl bg-zinc-800/60 border border-zinc-700/60 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 flex items-center justify-center font-bold text-xs">
                {currentUser.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <div className="text-xs font-semibold text-zinc-200">{currentUser.name}</div>
                <div className="text-[10px] text-zinc-400 capitalize">{currentUser.role}</div>
              </div>
            </div>
            <button
              onClick={onLogout}
              className="p-1.5 rounded-lg bg-zinc-700/50 hover:bg-red-500/20 text-zinc-400 hover:text-red-400 transition"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Navigation Items */}
        <div className="flex-1 overflow-y-auto px-3 py-2 space-y-1">
          <div className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 px-3 py-1">
            Site Operations Modules
          </div>
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  onSelectTab(item.id);
                  onClose();
                }}
                className={`w-full text-left px-3 py-2.5 rounded-xl transition-all flex items-start space-x-3 ${
                  isActive
                    ? 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 font-semibold'
                    : 'text-zinc-300 hover:bg-zinc-800/80 hover:text-white'
                }`}
              >
                <Icon className={`w-5 h-5 mt-0.5 shrink-0 ${isActive ? 'text-emerald-400' : 'text-zinc-400'}`} />
                <div className="min-w-0">
                  <div className="text-xs font-medium leading-snug">{item.label}</div>
                  <div className="text-[10px] text-zinc-500 truncate">{item.desc}</div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-zinc-800 text-[10px] text-zinc-500 flex items-center justify-between">
          <span>ConstructTrack SiteOps</span>
          <span className="text-emerald-500/80 font-mono">Offline-First</span>
        </div>
      </div>
    </div>
  );
};
