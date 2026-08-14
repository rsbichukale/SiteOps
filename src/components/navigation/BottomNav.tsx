'use client';

import React from 'react';
import { LayoutDashboard, HardHat, Package, MessageSquare, MoreHorizontal } from 'lucide-react';
import { ModuleTab } from '@/types';

interface BottomNavProps {
  activeTab: ModuleTab;
  onSelectTab: (tab: ModuleTab) => void;
  onOpenMoreMenu?: () => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ activeTab, onSelectTab, onOpenMoreMenu }) => {
  const tabs = [
    { id: 'dashboard' as ModuleTab, label: 'Dashboard', icon: LayoutDashboard },
    { id: 'attendance' as ModuleTab, label: 'Shifts', icon: HardHat },
    { id: 'material' as ModuleTab, label: 'Material', icon: Package },
    { id: 'whatsappReport' as ModuleTab, label: 'DPR', icon: MessageSquare },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-zinc-900/95 backdrop-blur-md border-t border-zinc-800 px-2 py-1.5 lg:hidden">
      <div className="flex items-center justify-around max-w-md mx-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onSelectTab(tab.id)}
              className={`flex flex-col items-center py-1 px-2 rounded-xl transition-all text-[11px] font-medium ${
                isActive
                  ? 'text-emerald-400 font-bold bg-emerald-500/10 border border-emerald-500/20'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <Icon className={`w-4 h-4 mb-0.5 ${isActive ? 'text-emerald-400 scale-110' : 'text-zinc-400'}`} />
              <span className="truncate">{tab.label}</span>
            </button>
          );
        })}

        {/* More Button to trigger drawer */}
        <button
          onClick={onOpenMoreMenu}
          className="flex flex-col items-center py-1 px-2 rounded-xl text-zinc-400 hover:text-zinc-200 transition-all text-[11px] font-medium"
        >
          <MoreHorizontal className="w-4 h-4 mb-0.5 text-zinc-400" />
          <span>More</span>
        </button>
      </div>
    </nav>
  );
};

