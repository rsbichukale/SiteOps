import React, { useState } from 'react';
import { Copy, Check, Share2 } from 'lucide-react';
import { generateWhatsAppReportText } from '@/lib/dbState';
import { DailyProgressReport } from '@/types';

interface WhatsAppMessagePreviewProps {
  report: DailyProgressReport;
}

export const WhatsAppMessagePreview: React.FC<WhatsAppMessagePreviewProps> = ({ report }) => {
  const [copied, setCopied] = useState(false);
  const formattedText = generateWhatsAppReportText(report);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(formattedText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy message:', err);
    }
  };

  const handleShareWhatsApp = () => {
    const encoded = encodeURIComponent(formattedText);
    window.open(`https://api.whatsapp.com/send?text=${encoded}`, '_blank');
  };

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 sm:p-6 space-y-4">
      <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
        <h3 className="text-sm font-semibold text-zinc-100 flex items-center gap-2">
          <Share2 className="w-4 h-4 text-emerald-400" />
          Live WhatsApp Message Preview
        </h3>
        <div className="flex items-center space-x-2">
          <button
            type="button"
            onClick={handleCopy}
            className="px-3 py-1.5 text-xs font-medium bg-emerald-500 text-zinc-950 font-bold rounded-lg hover:bg-emerald-400 flex items-center gap-1.5 shadow transition-all"
          >
            {copied ? <Check className="w-4 h-4 text-zinc-950" /> : <Copy className="w-4 h-4 text-zinc-950" />}
            {copied ? 'Copied!' : 'Copy Text'}
          </button>
          <button
            type="button"
            onClick={handleShareWhatsApp}
            className="px-3 py-1.5 text-xs font-medium bg-emerald-600 text-white rounded-lg hover:bg-emerald-500 flex items-center gap-1.5 shadow transition-all"
          >
            <Share2 className="w-4 h-4" /> Share WhatsApp
          </button>
        </div>
      </div>

      <div className="p-4 bg-zinc-950/80 border border-zinc-800/80 rounded-xl font-mono text-xs text-zinc-300 whitespace-pre-wrap leading-relaxed max-h-96 overflow-y-auto select-all">
        {formattedText}
      </div>
    </div>
  );
};
