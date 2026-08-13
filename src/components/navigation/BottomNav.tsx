'use client';

import React from 'react';
import { LayoutDashboard, Package, Banknote, Truck, Users, ShieldCheck, Microscope, MessageSquare } from 'lucide-react';
import { ModuleTab } from '@/types';

interface BottomNavProps {
  activeTab: ModuleTab;
  onSelectTab: (tab: ModuleTab) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ activeTab, onSelectTab }) => {
  const tabs = [
    { id: 'dashboard' as ModuleTab, label: 'Dashboard', icon: LayoutDashboard },
    { id: 'whatsappReport' as ModuleTab, label: 'DPR', icon: MessageSquare },
    { id: 'material' as ModuleTab, label: 'Material', icon: Package },
    { id: 'cash' as ModuleTab, label: 'Expenses', icon: Banknote },
    { id: 'machinery' as ModuleTab, label: 'Machinery', icon: Truck },
    { id: 'visitor' as ModuleTab, label: 'Visitors', icon: Users },
    { id: 'safety' as ModuleTab, label: 'Safety', icon: ShieldCheck },
    { id: 'quality' as ModuleTab, label: 'Quality', icon: Microscope },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-zinc-900/95 backdrop-blur-md border-t border-zinc-800 px-1 py-1 sm:hidden">
      <div className="flex items-center justify-around">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onSelectTab(tab.id)}
              className={`flex flex-col items-center py-1 px-1.5 rounded-lg transition-all text-[10px] font-medium ${
                isActive
                  ? 'text-emerald-400 font-bold bg-emerald-500/10 border border-emerald-500/20'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <Icon className={`w-4 h-4 mb-0.5 ${isActive ? 'text-emerald-400 scale-110' : 'text-zinc-400'}`} />
              <span className="truncate max-w-[48px]">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
