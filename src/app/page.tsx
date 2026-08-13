'use client';

import React, { useState, useEffect } from 'react';
import { Header } from '@/components/navigation/Header';
import { BottomNav } from '@/components/navigation/BottomNav';
import { Sidebar } from '@/components/navigation/Sidebar';

import { HomeDashboard } from '@/components/dashboard/HomeDashboard';
import { MaterialModule } from '@/components/modules/material/MaterialModule';
import { CashModule } from '@/components/modules/cash/CashModule';
import { MachineryModule } from '@/components/modules/machinery/MachineryModule';
import { VisitorModule } from '@/components/modules/visitor/VisitorModule';
import { SafetyModule } from '@/components/modules/safety/SafetyModule';
import { QualityModule } from '@/components/modules/quality/QualityModule';
import { WhatsAppReportModule } from '@/components/modules/reports/WhatsAppReportModule';

import { ModuleTab, AppUser } from '@/types';
import { getAppState, saveAppState, subscribeState } from '@/lib/dbState';

export default function SiteOpsApp() {
  const [isMounted, setIsMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<ModuleTab>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [, setRerender] = useState(0);

  const state = getAppState();

  useEffect(() => {
    setIsMounted(true);
    const unsubscribe = subscribeState(() => {
      setRerender(n => n + 1);
    });
    return () => unsubscribe();
  }, []);

  const handleSelectSite = (siteId: number) => {
    saveAppState({ activeSiteId: siteId });
  };

  const handleLogout = () => {
    saveAppState({ currentUser: null });
  };

  if (!isMounted) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center text-zinc-400 text-sm font-sans">
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 rounded-full bg-emerald-500 animate-ping" />
          <span>Initializing ConstructTrack SiteOps...</span>
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
      />

      {/* Sidebar Drawer */}
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        currentUser={state.currentUser}
        onLogout={handleLogout}
      />

      {/* Main Content View Switcher */}
      <main className="flex-1">
        {activeTab === 'dashboard' && <HomeDashboard onSelectTab={setActiveTab} />}
        {activeTab === 'whatsappReport' && <WhatsAppReportModule />}
        {activeTab === 'material' && <MaterialModule />}
        {activeTab === 'cash' && <CashModule />}
        {activeTab === 'machinery' && <MachineryModule />}
        {activeTab === 'visitor' && <VisitorModule />}
        {activeTab === 'safety' && <SafetyModule />}
        {activeTab === 'quality' && <QualityModule />}
      </main>

      {/* Mobile Bottom Navigation */}
      <BottomNav activeTab={activeTab} onSelectTab={setActiveTab} />
    </div>
  );
}
