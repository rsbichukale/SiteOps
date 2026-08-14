import React from 'react';
import { Users, Plus, Trash2, HardHat, Building } from 'lucide-react';
import { DailyProgressReport, CustomTradeEntry } from '@/types';
import { getAppState } from '@/lib/dbState';

interface ContractorManpowerGridProps {
  report: DailyProgressReport;
  onChange: (updated: Partial<DailyProgressReport>) => void;
}

export const ContractorManpowerGrid: React.FC<ContractorManpowerGridProps> = ({ report, onChange }) => {
  const state = getAppState();
  const contractorsMaster = state.contractorsMaster || [];

  const handleCustomTradeChange = (id: string, field: keyof CustomTradeEntry, value: any) => {
    const updated = (report.customTrades || []).map(ct => (ct.id === id ? { ...ct, [field]: value } : ct));
    onChange({ customTrades: updated });
  };

  const addCustomTrade = () => {
    const newTrade: CustomTradeEntry = {
      id: Date.now().toString(),
      tradeName: 'New Specialized Work',
      contractorName: '',
      count: 0,
      notes: ''
    };
    onChange({ customTrades: [...(report.customTrades || []), newTrade] });
  };

  const removeCustomTrade = (id: string) => {
    onChange({ customTrades: (report.customTrades || []).filter(ct => ct.id !== id) });
  };

  // Helper to get or set count/notes for dynamic master contractors
  const getContractorValues = (cName: string, cTrade: string) => {
    const lowerName = cName.toLowerCase();
    const lowerTrade = cTrade.toLowerCase();

    // Check if contractor exists in customTrades
    const foundCustom = (report.customTrades || []).find(
      ct => ct.contractorName?.toLowerCase() === lowerName || (ct.tradeName?.toLowerCase() === lowerTrade && !ct.contractorName)
    );

    if (foundCustom) {
      return {
        count: foundCustom.count || 0,
        notes: foundCustom.notes || '',
        setCount: (count: number) => handleCustomTradeChange(foundCustom.id, 'count', count),
        setNotes: (notes: string) => handleCustomTradeChange(foundCustom.id, 'notes', notes)
      };
    }

    // Fallback creator for dynamic master contractors
    return {
      count: 0,
      notes: '',
      setCount: (count: number) => {
        const newCt: CustomTradeEntry = {
          id: `ct_master_${cName.replace(/\s+/g, '_')}_${Date.now()}`,
          tradeName: cTrade,
          contractorName: cName,
          count,
          notes: ''
        };
        onChange({ customTrades: [...(report.customTrades || []), newCt] });
      },
      setNotes: (notes: string) => {
        const newCt: CustomTradeEntry = {
          id: `ct_master_${cName.replace(/\s+/g, '_')}_${Date.now()}`,
          tradeName: cTrade,
          contractorName: cName,
          count: 0,
          notes
        };
        onChange({ customTrades: [...(report.customTrades || []), newCt] });
      }
    };
  };

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 sm:p-6 space-y-4">
      <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
        <div>
          <h3 className="text-sm font-bold text-zinc-100 flex items-center gap-2">
            <Users className="w-4 h-4 text-emerald-400" />
            Skilled Trades & Master Contractors Manpower Log
          </h3>
          <p className="text-xs text-zinc-400 mt-0.5">
            Record headcount and daily narration for site contractors and specialized teams.
          </p>
        </div>
        <button
          type="button"
          onClick={addCustomTrade}
          className="px-3 py-1.5 text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-xl hover:bg-emerald-500/20 flex items-center gap-1.5 transition-all shrink-0"
        >
          <Plus className="w-3.5 h-3.5" /> Add Trade Card
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {/* Core Trade: Carpenter */}
        <div className="p-3 bg-zinc-950/60 border border-zinc-800/80 rounded-xl space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-zinc-200 flex items-center gap-1.5">
              <HardHat className="w-3.5 h-3.5 text-amber-400" /> Carpenter
            </span>
            <input
              type="number"
              min="0"
              value={report.carpenterCount || 0}
              onChange={e => onChange({ carpenterCount: parseInt(e.target.value) || 0 })}
              className="w-16 px-2 py-1 text-xs bg-zinc-900 border border-zinc-700 rounded-lg text-center text-emerald-400 font-bold focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </div>
          <input
            type="text"
            placeholder="Shuttering / Work notes..."
            value={report.carpenterNotes || ''}
            onChange={e => onChange({ carpenterNotes: e.target.value })}
            className="w-full px-2.5 py-1 text-xs bg-zinc-900 border border-zinc-800 rounded-lg text-zinc-300 placeholder-zinc-600 focus:outline-none"
          />
        </div>

        {/* Core Trade: Fitter */}
        <div className="p-3 bg-zinc-950/60 border border-zinc-800/80 rounded-xl space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-zinc-200 flex items-center gap-1.5">
              <HardHat className="w-3.5 h-3.5 text-sky-400" /> Steel Fitter
            </span>
            <input
              type="number"
              min="0"
              value={report.fitterCount || 0}
              onChange={e => onChange({ fitterCount: parseInt(e.target.value) || 0 })}
              className="w-16 px-2 py-1 text-xs bg-zinc-900 border border-zinc-700 rounded-lg text-center text-emerald-400 font-bold focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </div>
          <input
            type="text"
            placeholder="Slab/Beam rebar notes..."
            value={report.fitterNotes || ''}
            onChange={e => onChange({ fitterNotes: e.target.value })}
            className="w-full px-2.5 py-1 text-xs bg-zinc-900 border border-zinc-800 rounded-lg text-zinc-300 placeholder-zinc-600 focus:outline-none"
          />
        </div>

        {/* Core Trade: Electrical */}
        <div className="p-3 bg-zinc-950/60 border border-zinc-800/80 rounded-xl space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-zinc-200 flex items-center gap-1.5">
              <HardHat className="w-3.5 h-3.5 text-yellow-400" /> Electrical
            </span>
            <input
              type="number"
              min="0"
              value={report.electricalCount || 0}
              onChange={e => onChange({ electricalCount: parseInt(e.target.value) || 0 })}
              className="w-16 px-2 py-1 text-xs bg-zinc-900 border border-zinc-700 rounded-lg text-center text-emerald-400 font-bold focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </div>
          <input
            type="text"
            placeholder="Conduiting / Wiring notes..."
            value={report.electricalNotes || ''}
            onChange={e => onChange({ electricalNotes: e.target.value })}
            className="w-full px-2.5 py-1 text-xs bg-zinc-900 border border-zinc-800 rounded-lg text-zinc-300 placeholder-zinc-600 focus:outline-none"
          />
        </div>

        {/* Core Trade: Plumber */}
        <div className="p-3 bg-zinc-950/60 border border-zinc-800/80 rounded-xl space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-zinc-200 flex items-center gap-1.5">
              <HardHat className="w-3.5 h-3.5 text-blue-400" /> Plumber
            </span>
            <input
              type="number"
              min="0"
              value={report.plumberCount || 0}
              onChange={e => onChange({ plumberCount: parseInt(e.target.value) || 0 })}
              className="w-16 px-2 py-1 text-xs bg-zinc-900 border border-zinc-700 rounded-lg text-center text-emerald-400 font-bold focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </div>
          <input
            type="text"
            placeholder="Piping / Shaft work notes..."
            value={report.plumberNotes || ''}
            onChange={e => onChange({ plumberNotes: e.target.value })}
            className="w-full px-2.5 py-1 text-xs bg-zinc-900 border border-zinc-800 rounded-lg text-zinc-300 placeholder-zinc-600 focus:outline-none"
          />
        </div>

        {/* Dynamic Master Contractors from Database */}
        {contractorsMaster.map(c => {
          const val = getContractorValues(c.name, c.trade);
          return (
            <div key={c.id} className="p-3 bg-zinc-950/80 border border-emerald-500/20 rounded-xl space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-zinc-100 flex items-center gap-1.5">
                    <Building className="w-3.5 h-3.5 text-emerald-400" /> {c.trade}
                  </span>
                  <span className="text-[10px] text-zinc-400 block font-medium">({c.name})</span>
                </div>
                <input
                  type="number"
                  min="0"
                  value={val.count}
                  onChange={e => val.setCount(parseInt(e.target.value) || 0)}
                  className="w-16 px-2 py-1 text-xs bg-zinc-900 border border-zinc-700 rounded-lg text-center text-emerald-400 font-bold focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>
              <input
                type="text"
                placeholder={`${c.name} work notes...`}
                value={val.notes}
                onChange={e => val.setNotes(e.target.value)}
                className="w-full px-2.5 py-1 text-xs bg-zinc-900 border border-zinc-800 rounded-lg text-zinc-300 placeholder-zinc-600 focus:outline-none"
              />
            </div>
          );
        })}
      </div>

      {/* Dynamic Custom Trades */}
      {report.customTrades && report.customTrades.length > 0 && (
        <div className="pt-3 border-t border-zinc-800/80 space-y-2">
          <span className="text-xs font-bold text-zinc-400">Additional Custom Work Cards</span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {report.customTrades.map(ct => (
              <div key={ct.id} className="p-3 bg-zinc-950 border border-zinc-800 rounded-xl space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <input
                    type="text"
                    value={ct.tradeName}
                    onChange={e => handleCustomTradeChange(ct.id, 'tradeName', e.target.value)}
                    placeholder="Trade Name (e.g. False Ceiling)"
                    className="flex-1 px-2.5 py-1 text-xs bg-zinc-900 border border-zinc-800 rounded-lg text-zinc-100 font-semibold"
                  />
                  <input
                    type="number"
                    min="0"
                    value={ct.count}
                    onChange={e => handleCustomTradeChange(ct.id, 'count', parseInt(e.target.value) || 0)}
                    className="w-16 px-2 py-1 text-xs bg-zinc-900 border border-zinc-700 rounded-lg text-center text-emerald-400 font-bold"
                  />
                  <button
                    type="button"
                    onClick={() => removeCustomTrade(ct.id)}
                    className="p-1 text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded-lg transition"
                    title="Remove trade"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    placeholder="Contractor name..."
                    value={ct.contractorName || ''}
                    onChange={e => handleCustomTradeChange(ct.id, 'contractorName', e.target.value)}
                    className="px-2.5 py-1 text-xs bg-zinc-900 border border-zinc-800 rounded-lg text-zinc-300 placeholder-zinc-600 focus:outline-none"
                  />
                  <input
                    type="text"
                    placeholder="Work description..."
                    value={ct.notes || ''}
                    onChange={e => handleCustomTradeChange(ct.id, 'notes', e.target.value)}
                    className="px-2.5 py-1 text-xs bg-zinc-900 border border-zinc-800 rounded-lg text-zinc-300 placeholder-zinc-600 focus:outline-none"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

