import React from 'react';
import { Calendar, Building, FileText } from 'lucide-react';
import { DailyProgressReport } from '@/types';

interface ReportHeaderEditorProps {
  report: DailyProgressReport;
  onChange: (updated: Partial<DailyProgressReport>) => void;
}

export const ReportHeaderEditor: React.FC<ReportHeaderEditorProps> = ({ report, onChange }) => {
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 sm:p-6 space-y-4">
      <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
        <h2 className="text-base font-semibold text-zinc-100 flex items-center gap-2">
          <FileText className="w-5 h-5 text-emerald-400" />
          Report Metadata & Formatting
        </h2>
        <div className="flex items-center space-x-2 bg-zinc-950 p-1 rounded-lg border border-zinc-800">
          <button
            type="button"
            onClick={() => onChange({ formatStyle: 'PROFESSIONAL' })}
            className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${
              report.formatStyle === 'PROFESSIONAL'
                ? 'bg-emerald-500 text-zinc-950 font-bold shadow'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Professional
          </button>
          <button
            type="button"
            onClick={() => onChange({ formatStyle: 'MINIMALIST' })}
            className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${
              report.formatStyle === 'MINIMALIST'
                ? 'bg-emerald-500 text-zinc-950 font-bold shadow'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Minimalist
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-medium text-zinc-400 mb-1 flex items-center gap-1.5">
            <Building className="w-3.5 h-3.5 text-emerald-400" />
            Building / Project Name
          </label>
          <input
            type="text"
            value={report.buildingName || ''}
            onChange={e => onChange({ buildingName: e.target.value })}
            placeholder="e.g. B-Building Work Progress"
            className="w-full px-3 py-2 text-sm bg-zinc-950 border border-zinc-800 rounded-lg text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-zinc-400 mb-1 flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-emerald-400" />
            Report Date
          </label>
          <input
            type="text"
            value={report.reportDate || ''}
            onChange={e => onChange({ reportDate: e.target.value })}
            placeholder="DD/MM/YYYY"
            className="w-full px-3 py-2 text-sm bg-zinc-950 border border-zinc-800 rounded-lg text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
          />
        </div>
      </div>
    </div>
  );
};
