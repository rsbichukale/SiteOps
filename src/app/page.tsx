'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Header } from '@/components/navigation/Header';
import { BottomNav } from '@/components/navigation/BottomNav';
import { Sidebar } from '@/components/navigation/Sidebar';

import { HomeDashboard } from '@/components/dashboard/HomeDashboard';
import { ShiftAttendanceModule } from '@/components/modules/attendance/ShiftAttendanceModule';
import { MaterialModule } from '@/components/modules/material/MaterialModule';
import { CashModule } from '@/components/modules/cash/CashModule';
import { MachineryModule } from '@/components/modules/machinery/MachineryModule';
import { VisitorModule } from '@/components/modules/visitor/VisitorModule';
import { SafetyModule } from '@/components/modules/safety/SafetyModule';
import { QualityModule } from '@/components/modules/quality/QualityModule';
import { WhatsAppReportModule } from '@/components/modules/reports/WhatsAppReportModule';
import { DatabaseManagerModule } from '@/components/modules/database/DatabaseManagerModule';

import { ModuleTab } from '@/types';
import { useSiteOpsState } from '@/hooks/useSiteOpsState';
import { syncEngine } from '@/lib/sync/SyncEngine';

const VALID_TABS: ModuleTab[] = [
  'dashboard', 'attendance', 'material', 'cash', 'machinery', 'visitor',
  'safety', 'quality', 'whatsappReport', 'databaseManager'
];

export default function SiteOpsApp() {
  const [isMounted, setIsMounted] = useState(false);
  const [activeTab, setActiveTabState] = useState<ModuleTab>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isDesktopSidebarPinned, setIsDesktopSidebarPinned] = useState(true);

  const { state, updateState } = useSiteOpsState();

  const handleSelectTab = useCallback((tab: ModuleTab) => {
    setActiveTabState(tab);
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      url.searchParams.set('tab', tab);
      window.history.pushState({}, '', url.toString());
    }
  }, []);

  useEffect(() => {
    setIsMounted(true);

    // Read initial URL tab parameter if present
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const urlTab = params.get('tab') as ModuleTab;
      if (urlTab && VALID_TABS.includes(urlTab)) {
        setActiveTabState(urlTab);
      }

      const handlePopState = () => {
        const p = new URLSearchParams(window.location.search);
        const t = p.get('tab') as ModuleTab;
        if (t && VALID_TABS.includes(t)) {
          setActiveTabState(t);
        } else {
          setActiveTabState('dashboard');
        }
      };

      window.addEventListener('popstate', handlePopState);
      return () => window.removeEventListener('popstate', handlePopState);
    }
  }, []);

  useEffect(() => {
    // Background cloud sync initialization
    syncEngine.syncWithCloud().catch(err => {
      console.error('[SiteOps] Initial sync failed:', err);
    });
  }, []);

  const handleSelectSite = (siteId: number) => {
    updateState({ activeSiteId: siteId });
  };

  const handleLogout = () => {
    updateState({ currentUser: null });
  };

  if (!isMounted) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center text-zinc-400 text-sm font-sans">
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 rounded-full bg-emerald-500 animate-ping" />
          <span>Initializing ConstructTrack SiteOps Architecture...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col font-sans">
      {/* Header */}
      <Header
        sites={state.sites}
        activeSiteId={state.activeSiteId}
        onSelectSite={handleSelectSite}
        onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        currentUser={state.currentUser}
        activeTab={activeTab}
        isDesktopSidebarPinned={isDesktopSidebarPinned}
        onToggleDesktopSidebarPinned={() => setIsDesktopSidebarPinned(!isDesktopSidebarPinned)}
      />

      {/* Main Container Layout */}
      <div className="flex-1 flex w-full max-w-[1600px] mx-auto">
        {/* Persistent Sidebar on Desktop (if pinned) */}
        {isDesktopSidebarPinned && (
          <Sidebar
            isOpen={true}
            onClose={() => {}}
            activeTab={activeTab}
            onSelectTab={handleSelectTab}
            currentUser={state.currentUser}
            onLogout={handleLogout}
            isDesktopPersistent={true}
          />
        )}

        {/* Mobile Drawer Sidebar */}
        <Sidebar
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
          activeTab={activeTab}
          onSelectTab={handleSelectTab}
          currentUser={state.currentUser}
          onLogout={handleLogout}
          isDesktopPersistent={false}
        />

        {/* Main Content View Switcher */}
        <main className="flex-1 min-w-0 pb-20 lg:pb-8">
          {activeTab === 'dashboard' && <HomeDashboard onSelectTab={handleSelectTab} />}
          {activeTab === 'attendance' && <ShiftAttendanceModule />}
          {activeTab === 'whatsappReport' && <WhatsAppReportModule />}
          {activeTab === 'databaseManager' && <DatabaseManagerModule />}
          {activeTab === 'material' && <MaterialModule />}
          {activeTab === 'cash' && <CashModule />}
          {activeTab === 'machinery' && <MachineryModule />}
          {activeTab === 'visitor' && <VisitorModule />}
          {activeTab === 'safety' && <SafetyModule />}
          {activeTab === 'quality' && <QualityModule />}
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <BottomNav
        activeTab={activeTab}
        onSelectTab={handleSelectTab}
        onOpenMoreMenu={() => setIsSidebarOpen(true)}
      />
    </div>
  );
}

