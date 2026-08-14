'use client';

import React from 'react';
import { Building2, Menu, HardHat, PanelLeft, PanelLeftClose } from 'lucide-react';
import { Site, AppUser, ModuleTab } from '@/types';

interface HeaderProps {
  sites: Site[];
  activeSiteId: number | null;
  onSelectSite: (siteId: number) => void;
  onToggleSidebar: () => void;
  currentUser: AppUser | null;
  activeTab?: ModuleTab;
  isDesktopSidebarPinned?: boolean;
  onToggleDesktopSidebarPinned?: () => void;
}

const TAB_LABELS: Record<ModuleTab, string> = {
  dashboard: 'Home Dashboard',
  attendance: 'Contractor Shifts & Punching',
  whatsappReport: 'WhatsApp Daily DPR',
  databaseManager: 'Database & Master Records',
  material: 'Material & Inventory',
  cash: 'Petty Cash & Expenses',
  machinery: 'Machinery & Equipment',
  visitor: 'Visitors & Meetings',
  safety: 'Safety & Compliance',
  quality: 'Quality Control (QC)',
};

export const Header: React.FC<HeaderProps> = ({
  sites,
  activeSiteId,
  onSelectSite,
  onToggleSidebar,
  currentUser,
  activeTab = 'dashboard',
  isDesktopSidebarPinned = true,
  onToggleDesktopSidebarPinned,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-zinc-900/95 backdrop-blur-md border-b border-zinc-800 text-zinc-100">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 h-14 flex items-center justify-between gap-2">
        {/* Left: Menu Button & Brand */}
        <div className="flex items-center space-x-2 sm:space-x-3 min-w-0">
          {/* Mobile drawer trigger */}
          <button
            onClick={onToggleSidebar}
            className="lg:hidden p-2 rounded-lg bg-zinc-800 text-zinc-300 hover:text-white hover:bg-zinc-700 transition"
            aria-label="Toggle drawer menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Desktop persistent sidebar toggle */}
          {onToggleDesktopSidebarPinned && (
            <button
              onClick={onToggleDesktopSidebarPinned}
              className="hidden lg:flex p-2 rounded-lg bg-zinc-800 text-zinc-300 hover:text-white hover:bg-zinc-700 transition"
              title={isDesktopSidebarPinned ? 'Collapse Sidebar' : 'Expand Sidebar'}
            >
              {isDesktopSidebarPinned ? <PanelLeftClose className="w-5 h-5" /> : <PanelLeft className="w-5 h-5" />}
            </button>
          )}

          <div className="flex items-center space-x-2 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-zinc-950 font-bold shadow-lg shadow-emerald-500/20 shrink-0">
              <HardHat className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center space-x-1.5">
                <span className="font-bold text-sm sm:text-base tracking-tight text-white truncate">ConstructTrack</span>
                <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 shrink-0">
                  SiteOps
                </span>
              </div>
              <div className="hidden sm:block text-[10px] text-zinc-400 font-medium truncate">
                {TAB_LABELS[activeTab] || 'Site Operations'}
              </div>
            </div>
          </div>
        </div>

        {/* Right: Site Selector & User Info */}
        <div className="flex items-center space-x-2 shrink-0">
          {/* Site Selector */}
          <div className="relative">
            <select
              value={activeSiteId ?? ''}
              onChange={(e) => onSelectSite(Number(e.target.value))}
              className="bg-zinc-800 text-zinc-200 border border-zinc-700 rounded-lg px-2.5 py-1.5 text-xs font-medium focus:outline-none focus:border-emerald-500 cursor-pointer pr-7 appearance-none"
            >
              {sites.length === 0 && <option value="">No projects configured</option>}
              {sites.map((site) => (
                <option key={site.id} value={site.id}>
                  {site.name}
                </option>
              ))}
            </select>
            <Building2 className="w-3.5 h-3.5 text-zinc-400 absolute right-2 top-2.5 pointer-events-none" />
          </div>

          {/* User Avatar Badge */}
          {currentUser && (
            <div className="hidden md:flex items-center space-x-2 px-2.5 py-1 rounded-lg bg-zinc-800/80 border border-zinc-700 text-xs">
              <div className="w-6 h-6 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center font-bold text-xs">
                {currentUser.name.charAt(0).toUpperCase()}
              </div>
              <span className="text-zinc-300 font-medium">{currentUser.name}</span>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
