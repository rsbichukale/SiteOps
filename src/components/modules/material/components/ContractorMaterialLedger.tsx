import React, { useState, useEffect } from 'react';
import { Users, Package, AlertTriangle, ArrowRight, Shield, Layers } from 'lucide-react';
import { ContractorMaterialAllocation, MaterialDamageDeduction, ContractorMaster } from '@/types';
import { useSiteOpsState } from '@/hooks/useSiteOpsState';
import { Badge } from '@/components/ui/Badge';

export const ContractorMaterialLedger: React.FC = () => {
  const { state } = useSiteOpsState();
  const contractors = state.contractorsMaster || [];
  const allocations = state.contractorMaterialAllocations || [];
  const deductions = state.materialDamageDeductions || [];

  const [selectedContractorId, setSelectedContractorId] = useState<number | 'ALL'>('ALL');

  const filteredAllocations = selectedContractorId === 'ALL'
    ? allocations
    : allocations.filter(a => a.contractorId === Number(selectedContractorId));

  const filteredDeductions = selectedContractorId === 'ALL'
    ? deductions
    : deductions.filter(d => d.contractorId === Number(selectedContractorId));

  return (
    <div className="space-y-6">
      {/* Filter Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-zinc-900 border border-zinc-800 rounded-xl p-4">
        <div className="flex items-center gap-2">
          <Users className="w-5 h-5 text-emerald-400" />
          <div>
            <h3 className="text-sm font-semibold text-zinc-100">Contractor Department Material Ledger</h3>
            <p className="text-xs text-zinc-400">Track site materials issued to each contractor team and damage deductions.</p>
          </div>
        </div>

        <select
          value={selectedContractorId}
          onChange={e => setSelectedContractorId(e.target.value === 'ALL' ? 'ALL' : Number(e.target.value))}
          className="px-3 py-1.5 text-xs bg-zinc-950 border border-zinc-800 rounded-lg text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
        >
          <option value="ALL">All Contractors</option>
          {contractors.map(c => (
            <option key={c.id} value={c.id}>
              {c.name} ({c.trade})
            </option>
          ))}
        </select>
      </div>

      {/* Materials Issued Table */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
          <h4 className="text-xs font-semibold text-zinc-200 flex items-center gap-2 uppercase tracking-wider">
            <Package className="w-4 h-4 text-emerald-400" />
            Materials Allocated to Contractor
          </h4>
          <Badge variant="emerald">{filteredAllocations.length} Allocations</Badge>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-zinc-300">
            <thead className="bg-zinc-950 text-zinc-400 uppercase tracking-wider text-[10px] border-b border-zinc-800">
              <tr>
                <th className="px-4 py-3">Contractor</th>
                <th className="px-4 py-3">Material Item</th>
                <th className="px-4 py-3">Quantity Issued</th>
                <th className="px-4 py-3">Floor / Area</th>
                <th className="px-4 py-3">Issued By</th>
                <th className="px-4 py-3">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60">
              {filteredAllocations.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-6 text-zinc-500">
                    No material allocations logged for this contractor.
                  </td>
                </tr>
              ) : (
                filteredAllocations.map(a => (
                  <tr key={a.id} className="hover:bg-zinc-950/50">
                    <td className="px-4 py-3 font-semibold text-zinc-100">{a.contractorName}</td>
                    <td className="px-4 py-3 font-medium text-emerald-400">{a.itemName}</td>
                    <td className="px-4 py-3 font-bold text-zinc-100">{a.quantityIssued} {a.unit}</td>
                    <td className="px-4 py-3 text-zinc-400">{a.floorLocation}</td>
                    <td className="px-4 py-3 text-zinc-400">{a.issuedBy}</td>
                    <td className="px-4 py-3 font-mono text-zinc-400">
                      {new Date(a.dateIssued).toLocaleDateString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Material Damage & Bill Deductions */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
          <h4 className="text-xs font-semibold text-zinc-200 flex items-center gap-2 uppercase tracking-wider">
            <AlertTriangle className="w-4 h-4 text-rose-400" />
            Contractor Damage & Bill Deductions Ledger
          </h4>
          <Badge variant="rose">{filteredDeductions.length} Incidents</Badge>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-zinc-300">
            <thead className="bg-zinc-950 text-zinc-400 uppercase tracking-wider text-[10px] border-b border-zinc-800">
              <tr>
                <th className="px-4 py-3">Contractor / Trade</th>
                <th className="px-4 py-3">Damaged Material</th>
                <th className="px-4 py-3">Quantity</th>
                <th className="px-4 py-3">Deduction Amount</th>
                <th className="px-4 py-3">Reason</th>
                <th className="px-4 py-3">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60">
              {filteredDeductions.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-6 text-zinc-500">
                    No damage deductions logged.
                  </td>
                </tr>
              ) : (
                filteredDeductions.map(d => (
                  <tr key={d.id} className="hover:bg-zinc-950/50">
                    <td className="px-4 py-3 font-semibold text-zinc-100">{d.contractorName}</td>
                    <td className="px-4 py-3 text-rose-400 font-medium">{d.materialName}</td>
                    <td className="px-4 py-3 font-bold text-zinc-200">{d.quantity} {d.unit}</td>
                    <td className="px-4 py-3 font-bold text-rose-400">₹{d.deductionAmount.toLocaleString('en-IN')}</td>
                    <td className="px-4 py-3 text-zinc-400">{d.reason}</td>
                    <td className="px-4 py-3 font-mono text-zinc-400">
                      {new Date(d.dateLogged).toLocaleDateString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
