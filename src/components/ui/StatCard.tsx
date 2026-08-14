import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: LucideIcon;
  trend?: {
    value: string;
    isPositive: boolean;
  };
  accentColor?: 'emerald' | 'orange' | 'sky' | 'rose' | 'amber';
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  accentColor = 'emerald',
}) => {
  const accentGradients = {
    emerald: 'from-emerald-500/10 to-transparent border-emerald-500/20 text-emerald-400',
    orange: 'from-orange-500/10 to-transparent border-orange-500/20 text-orange-400',
    sky: 'from-sky-500/10 to-transparent border-sky-500/20 text-sky-400',
    rose: 'from-rose-500/10 to-transparent border-rose-500/20 text-rose-400',
    amber: 'from-amber-500/10 to-transparent border-amber-500/20 text-amber-400',
  }[accentColor];

  return (
    <div className={`p-4 rounded-xl bg-gradient-to-br ${accentGradients} bg-zinc-900 border border-zinc-800 flex flex-col justify-between`}>
      <div className="flex items-start justify-between">
        <span className="text-xs font-medium text-zinc-400 uppercase tracking-wider">{title}</span>
        {Icon && <Icon className="w-5 h-5 opacity-80" />}
      </div>
      <div className="mt-3">
        <div className="text-2xl font-bold text-zinc-100 tracking-tight">{value}</div>
        {subtitle && <div className="text-xs text-zinc-400 mt-1">{subtitle}</div>}
        {trend && (
          <div className={`text-xs font-medium mt-1 ${trend.isPositive ? 'text-emerald-400' : 'text-rose-400'}`}>
            {trend.value}
          </div>
        )}
      </div>
    </div>
  );
};
