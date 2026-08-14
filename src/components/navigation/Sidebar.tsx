'use client';

import React from 'react';
import {
  X, LayoutDashboard, Package, Banknote, Truck, Users, ShieldCheck, Microscope,
  HardHat, LogOut, Database, MessageSquare, ChevronRight, Layers, Sparkles
} from 'lucide-react';
import { ModuleTab, AppUser } from '@/types';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  activeTab: ModuleTab;
  onSelectTab: (tab: ModuleTab) => void;
  currentUser: AppUser | null;
  onLogout: () => void;
  isDesktopPersistent?: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  onClose,
  activeTab,
  onSelectTab,
  currentUser,
  onLogout,
  isDesktopPersistent = false,
}) => {
  if (!isOpen && !isDesktopPersistent) return null;

  const menuSections = [
    {
      title: 'Main Operations',
      items: [
        { id: 'dashboard' as ModuleTab, label: 'Home Dashboard', icon: LayoutDashboard, desc: 'Overview of all site operations', badge: 'Live' },
        { id: 'attendance' as ModuleTab, label: 'Contractor Shifts & Punching', icon: HardHat, desc: 'Shift Punch-In/Out, Hours, OT' },
        { id: 'whatsappReport' as ModuleTab, label: 'WhatsApp Daily DPR', icon: MessageSquare, desc: 'Generate & send daily progress report', badge: 'Auto' },
      ],
    },
    {
      title: 'Logistics & Masters',
      items: [
        { id: 'databaseManager' as ModuleTab, label: 'Database & Master Records', icon: Database, desc: 'Add, Edit, Delete Master Data' },
        { id: 'material' as ModuleTab, label: 'Material & Inventory', icon: Package, desc: 'GRN, Stock Ledger, Material Issue' },
        { id: 'cash' as ModuleTab, label: 'Petty Cash & Expenses', icon: Banknote, desc: 'Daily Expenses, Fund Requisitions' },
      ],
    },
    {
      title: 'Site Assets & Activity',
      items: [
        { id: 'machinery' as ModuleTab, label: 'Machinery & Equipment', icon: Truck, desc: 'Usage Logs, Rental Billing, Fuel' },
        { id: 'visitor' as ModuleTab, label: 'Visitors & Meetings', icon: Users, desc: 'Gate Register, Meeting Minutes' },
      ],
    },
    {
      title: 'HSE & Quality Control',
      items: [
        { id: 'safety' as ModuleTab, label: 'Safety & Compliance', icon: ShieldCheck, desc: 'Daily Checklist, Incident Register' },
        { id: 'quality' as ModuleTab, label: 'Quality Control (QC)', icon: Microscope, desc: 'Cube Tests, Material Tests, NCR' },
      ],
    },
  ];

  const sidebarContent = (
    <div className="flex flex-col h-full bg-zinc-900 border-r border-zinc-800 text-zinc-100 shadow-2xl">
      {/* Header */}
      <div className="p-4 border-b border-zinc-800 flex items-center justify-between">
        <div className="flex items-center space-x-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-zinc-950 font-bold shadow-lg shadow-emerald-500/20">
            <HardHat className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-bold text-sm text-white leading-none tracking-tight">ConstructTrack</h2>
            <span className="text-[10px] text-emerald-400 font-semibold tracking-wide">SiteOps Companion v1.2</span>
          </div>
        </div>
        {!isDesktopPersistent && (
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-zinc-800 text-zinc-400 hover:text-white transition"
            aria-label="Close menu"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* User Badge */}
      {currentUser && (
        <div className="p-3 mx-3 my-3 rounded-xl bg-gradient-to-r from-zinc-800/80 to-zinc-800/40 border border-zinc-700/60 flex items-center justify-between">
          <div className="flex items-center space-x-3 min-w-0">
            <div className="w-8 h-8 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 flex items-center justify-center font-bold text-xs shrink-0">
              {currentUser.name.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <div className="text-xs font-semibold text-zinc-200 truncate">{currentUser.name}</div>
              <div className="text-[10px] text-emerald-400 font-medium capitalize">{currentUser.role}</div>
            </div>
          </div>
          <button
            onClick={onLogout}
            className="p-1.5 rounded-lg bg-zinc-700/50 hover:bg-rose-500/20 text-zinc-400 hover:text-rose-400 transition"
            title="Logout"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Navigation Sections */}
      <div className="flex-1 overflow-y-auto px-3 py-2 space-y-4 custom-scrollbar">
        {menuSections.map((section) => (
          <div key={section.title} className="space-y-1">
            <div className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 px-3 py-1 flex items-center justify-between">
              <span>{section.title}</span>
              <span className="text-[9px] text-zinc-600 font-mono">{section.items.length}</span>
            </div>
            {section.items.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onSelectTab(item.id);
                    if (!isDesktopPersistent) onClose();
                  }}
                  className={`w-full text-left px-3 py-2.5 rounded-xl transition-all flex items-start space-x-3 group relative ${
                    isActive
                      ? 'bg-gradient-to-r from-emerald-500/20 to-emerald-500/5 border border-emerald-500/30 text-emerald-400 font-semibold shadow-md shadow-emerald-500/5'
                      : 'text-zinc-300 hover:bg-zinc-800/80 hover:text-white'
                  }`}
                >
                  <Icon className={`w-5 h-5 mt-0.5 shrink-0 transition-transform group-hover:scale-110 ${isActive ? 'text-emerald-400' : 'text-zinc-400 group-hover:text-zinc-200'}`} />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium leading-snug truncate">{item.label}</span>
                      {item.badge && (
                        <span className="ml-1.5 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                          {item.badge}
                        </span>
                      )}
                    </div>
                    <div className="text-[10px] text-zinc-500 truncate mt-0.5">{item.desc}</div>
                  </div>
                </button>
              );
            })}
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="p-3 border-t border-zinc-800 text-[10px] text-zinc-500 flex items-center justify-between">
        <span className="flex items-center space-x-1">
          <Sparkles className="w-3 h-3 text-emerald-400" />
          <span>SiteOps Mobile & Desktop</span>
        </span>
        <span className="text-emerald-400/90 font-mono font-bold">Offline-First</span>
      </div>
    </div>
  );

  // If persistent desktop sidebar, render direct wrapper
  if (isDesktopPersistent) {
    return <aside className="hidden lg:block w-72 shrink-0 h-[calc(100vh-3.5rem)] sticky top-14">{sidebarContent}</aside>;
  }

  // Mobile Overlay Drawer
  return (
    <div className="fixed inset-0 z-50 flex lg:hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />
      <div className="relative flex-1 max-w-xs w-full z-10">
        {sidebarContent}
      </div>
    </div>
  );
};

