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
import { AuthScreen } from '@/components/auth/AuthScreen';

import { ModuleTab } from '@/types';
import { useSiteOpsState } from '@/hooks/useSiteOpsState';
import { initializeAppStateFromSupabase, resetAppState, selectActiveSite, setAuthenticatedUser } from '@/lib/dbState';
import { isSupabaseConfigured, supabase } from '@/lib/supabaseClient';

const VALID_TABS: ModuleTab[] = [
  'dashboard', 'attendance', 'material', 'cash', 'machinery', 'visitor',
  'safety', 'quality', 'whatsappReport', 'databaseManager'
];

export default function SiteOpsApp() {
  const [isMounted, setIsMounted] = useState(false);
  const [activeTab, setActiveTabState] = useState<ModuleTab>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isDesktopSidebarPinned, setIsDesktopSidebarPinned] = useState(true);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);

  const { state } = useSiteOpsState();

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
    if (!supabase || !isSupabaseConfigured) {
      setIsAuthLoading(false);
      return;
    }

    let active = true;
    const loadAuthenticatedUser = async (user: { id: string; email?: string; app_metadata?: Record<string, unknown> } | null) => {
      if (!active) return;
      if (!user) {
        resetAppState();
        setIsAuthenticated(false);
        setIsAuthLoading(false);
        return;
      }

      const email = user.email ?? '';
      setAuthenticatedUser({
        id: user.id,
        username: email.split('@')[0] || 'user',
        name: typeof user.app_metadata?.display_name === 'string' ? user.app_metadata.display_name : email.split('@')[0] || 'Site User',
        role: 'engineer',
        email,
      });
      setIsAuthenticated(true);
      setLoadError(null);
      try {
        await initializeAppStateFromSupabase();
      } catch (error) {
        setLoadError(error instanceof Error ? error.message : String(error));
      } finally {
        if (active) setIsAuthLoading(false);
      }
    };

    supabase.auth.getUser().then(({ data }) => loadAuthenticatedUser(data.user));
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      void loadAuthenticatedUser(session?.user ?? null);
    });
    return () => {
      active = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    const onSaveError = (event: Event) => {
      const details = (event as CustomEvent<Array<{ message: string }>>).detail;
      setSaveError(details?.map(item => item.message).join('; ') || 'The database rejected the save.');
    };
    window.addEventListener('siteops:save-error', onSaveError);
    return () => window.removeEventListener('siteops:save-error', onSaveError);
  }, []);

  const handleSelectSite = async (siteId: number) => {
    setLoadError(null);
    try {
      await selectActiveSite(siteId);
    } catch (error) {
      setLoadError(error instanceof Error ? error.message : String(error));
    }
  };

  const handleLogout = async () => {
    await supabase?.auth.signOut();
    resetAppState();
  };

  if (!isMounted || isAuthLoading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center text-zinc-400 text-sm font-sans">
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 rounded-full bg-emerald-500 animate-ping" />
          <span>Initializing ConstructTrack SiteOps Architecture...</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) return <AuthScreen />;

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col font-sans">
      {(loadError || saveError) && (
        <div className="sticky top-0 z-[100] flex items-center justify-between gap-3 bg-red-950 px-4 py-2 text-sm text-red-100">
          <span>{loadError || saveError}</span>
          <button className="font-bold" onClick={() => { setLoadError(null); setSaveError(null); }}>Dismiss</button>
        </div>
      )}
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
