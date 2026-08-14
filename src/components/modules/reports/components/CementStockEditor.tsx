import React from 'react';
import { Package, Plus, Trash2 } from 'lucide-react';
import { DailyProgressReport, CementStockEntry } from '@/types';

interface CementStockEditorProps {
  report: DailyProgressReport;
  onChange: (updated: Partial<DailyProgressReport>) => void;
}

export const CementStockEditor: React.FC<CementStockEditorProps> = ({ report, onChange }) => {
  const handleCementChange = (idx: number, field: keyof CementStockEntry, value: any) => {
    const updated = (report.cementStock || []).map((c, i) => (i === idx ? { ...c, [field]: value } : c));
    onChange({ cementStock: updated });
  };

  const addCementBrand = () => {
    const newEntry: CementStockEntry = { brandName: 'New Cement', type: 'OPC', bags: 0 };
    onChange({ cementStock: [...(report.cementStock || []), newEntry] });
  };

  const removeCementBrand = (idx: number) => {
    const updated = (report.cementStock || []).filter((_, i) => i !== idx);
    onChange({ cementStock: updated });
  };

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 sm:p-6 space-y-4">
      <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
        <h3 className="text-sm font-semibold text-zinc-100 flex items-center gap-2">
          <Package className="w-4 h-4 text-emerald-400" />
          On-Site Cement Stock Inventory
        </h3>
        <button
          type="button"
          onClick={addCementBrand}
          className="px-2.5 py-1 text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-lg hover:bg-emerald-500/20 flex items-center gap-1 transition-colors"
        >
          <Plus className="w-3.5 h-3.5" /> Add Brand
        </button>
      </div>

      <div className="space-y-2">
        {(report.cementStock || []).map((c, idx) => (
          <div key={idx} className="flex items-center justify-between gap-2 p-2 bg-zinc-950 border border-zinc-800 rounded-lg">
            <input
              type="text"
              value={c.brandName}
              onChange={e => handleCementChange(idx, 'brandName', e.target.value)}
              placeholder="Brand Name (e.g. Birla Super)"
              className="flex-1 px-2 py-1 text-xs bg-zinc-900 border border-zinc-800 rounded text-zinc-100"
            />
            <input
              type="text"
              value={c.type}
              onChange={e => handleCementChange(idx, 'type', e.target.value)}
              placeholder="Type (e.g. OPC)"
              className="w-20 px-2 py-1 text-xs bg-zinc-900 border border-zinc-800 rounded text-zinc-100"
            />
            <div className="flex items-center gap-1">
              <input
                type="number"
                min="0"
                value={c.bags}
                onChange={e => handleCementChange(idx, 'bags', parseInt(e.target.value) || 0)}
                className="w-16 px-2 py-1 text-xs bg-zinc-900 border border-zinc-700 rounded text-center text-emerald-400 font-bold"
              />
              <span className="text-xs text-zinc-400 font-medium">Bags</span>
            </div>
            <button
              type="button"
              onClick={() => removeCementBrand(idx)}
              className="p-1 text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
