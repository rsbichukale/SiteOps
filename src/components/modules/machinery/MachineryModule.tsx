'use client';

import React, { useState } from 'react';
import { Truck, Plus, Clock, Fuel, Wrench, DollarSign, Calendar, AlertCircle } from 'lucide-react';
import { Equipment, EquipmentUsage, EquipmentPayment } from '@/types';
import { getAppState, saveAppState } from '@/lib/dbState';

export const MachineryModule: React.FC = () => {
  const [activeSubTab, setActiveSubTab] = useState<'register' | 'usage' | 'billing'>('register');
  const [isEquipModalOpen, setIsEquipModalOpen] = useState(false);
  const [isUsageModalOpen, setIsUsageModalOpen] = useState(false);

  const state = getAppState();

  // Equip Form State
  const [equipForm, setEquipForm] = useState({
    equipmentType: state.equipmentTypes[0]?.name || 'JCB / Excavator',
    name: '',
    isRented: true,
    rentalCompany: '',
    dailyRate: '',
    hourlyRate: '',
    operatorName: '',
  });

  // Usage Form State
  const [usageForm, setUsageForm] = useState({
    equipmentId: state.equipment[0]?.id || 0,
    hoursOperated: '',
    fuelLiters: '',
    workDescription: '',
    operator: '',
    breakdownNotes: '',
  });

  const handleAddEquipment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!equipForm.name.trim()) return;

    const newEquip: Equipment = {
      id: Date.now(),
      equipmentType: equipForm.equipmentType,
      name: equipForm.name.trim(),
      isRented: equipForm.isRented,
      rentalCompany: equipForm.rentalCompany,
      dailyRate: Number(equipForm.dailyRate) || 0,
      hourlyRate: Number(equipForm.hourlyRate) || 0,
      operatorName: equipForm.operatorName,
      startDate: new Date().toISOString().split('T')[0],
      status: 'ACTIVE',
    };

    saveAppState({
      equipment: [newEquip, ...state.equipment],
    });

    setIsEquipModalOpen(false);
    setEquipForm({
      equipmentType: state.equipmentTypes[0]?.name || 'JCB / Excavator',
      name: '',
      isRented: true,
      rentalCompany: '',
      dailyRate: '',
      hourlyRate: '',
      operatorName: '',
    });
  };

  const handleAddUsage = (e: React.FormEvent) => {
    e.preventDefault();
    const equipId = Number(usageForm.equipmentId);
    if (!equipId) return;

    const newUsage: EquipmentUsage = {
      id: Date.now(),
      equipmentId: equipId,
      dateLogged: new Date().toISOString().split('T')[0],
      hoursOperated: Number(usageForm.hoursOperated) || 0,
      fuelLiters: Number(usageForm.fuelLiters) || 0,
      workDescription: usageForm.workDescription,
      operator: usageForm.operator,
      breakdownNotes: usageForm.breakdownNotes,
    };

    saveAppState({
      equipmentUsage: [newUsage, ...state.equipmentUsage],
    });

    setIsUsageModalOpen(false);
    setUsageForm({
      equipmentId: state.equipment[0]?.id || 0,
      hoursOperated: '',
      fuelLiters: '',
      workDescription: '',
      operator: '',
      breakdownNotes: '',
    });
  };

  return (
    <div className="space-y-4 max-w-7xl mx-auto p-3 sm:p-6 pb-24">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-zinc-900/80 p-4 rounded-2xl border border-zinc-800">
        <div className="flex items-center space-x-3">
          <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
            <Truck className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-white">Machinery & Equipment Log</h1>
            <p className="text-xs text-zinc-400">Track JCBs, Cranes, Mixers, Fuel Consumption & Rental Billing</p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setIsEquipModalOpen(true)}
            className="flex-1 sm:flex-initial px-3 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-zinc-950 font-bold text-xs flex items-center justify-center space-x-1.5 transition shadow-lg shadow-emerald-500/20"
          >
            <Plus className="w-4 h-4" />
            <span>+ Add Machine</span>
          </button>
          <button
            onClick={() => setIsUsageModalOpen(true)}
            className="px-3 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-semibold text-xs flex items-center space-x-1.5 transition border border-zinc-700"
          >
            <Clock className="w-4 h-4 text-emerald-400" />
            <span>Log Daily Usage</span>
          </button>
        </div>
      </div>

      {/* Sub Tab Switcher */}
      <div className="flex items-center space-x-1 bg-zinc-900 p-1 rounded-xl border border-zinc-800 text-xs">
        <button
          onClick={() => setActiveSubTab('register')}
          className={`px-3 py-2 rounded-lg font-medium transition ${
            activeSubTab === 'register'
              ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-bold'
              : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          🚜 Equipment Register ({state.equipment.length})
        </button>
        <button
          onClick={() => setActiveSubTab('usage')}
          className={`px-3 py-2 rounded-lg font-medium transition ${
            activeSubTab === 'usage'
              ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-bold'
              : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          ⏱️ Daily Usage Logs ({state.equipmentUsage.length})
        </button>
      </div>

      {/* SUB-TAB 1: EQUIPMENT REGISTER */}
      {activeSubTab === 'register' && (
        <div className="space-y-3">
          {state.equipment.length === 0 ? (
            <div className="p-8 text-center bg-zinc-900/60 rounded-2xl border border-zinc-800">
              <Truck className="w-10 h-10 text-zinc-600 mx-auto mb-3" />
              <h3 className="font-bold text-sm text-zinc-300">No Equipment Registered</h3>
              <p className="text-xs text-zinc-500 mt-1">Add JCBs, cranes, mixers, and hoists operating on-site.</p>
              <button
                onClick={() => setIsEquipModalOpen(true)}
                className="mt-4 px-4 py-2 rounded-xl bg-emerald-500 text-zinc-950 font-bold text-xs"
              >
                + Register Machine
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {state.equipment.map((eq) => (
                <div key={eq.id} className="p-4 rounded-xl bg-zinc-900 border border-zinc-800 space-y-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[10px] font-bold uppercase text-emerald-400 tracking-wider">
                        {eq.equipmentType}
                      </span>
                      <h3 className="text-sm font-bold text-white mt-0.5">{eq.name}</h3>
                    </div>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      eq.isRented ? 'bg-amber-500/20 text-amber-300' : 'bg-emerald-500/20 text-emerald-300'
                    }`}>
                      {eq.isRented ? 'Rented' : 'Owned'}
                    </span>
                  </div>

                  {eq.isRented && (
                    <div className="text-xs text-zinc-400">
                      Company: <span className="text-zinc-200">{eq.rentalCompany || 'Vendor'}</span>
                    </div>
                  )}
                  {eq.dailyRate ? (
                    <div className="text-xs text-zinc-400">
                      Rate: <span className="text-emerald-400 font-bold">₹{eq.dailyRate}/day</span>
                    </div>
                  ) : null}
                  {eq.operatorName && (
                    <div className="text-xs text-zinc-400">
                      Operator: <span className="text-zinc-300">{eq.operatorName}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* SUB-TAB 2: DAILY USAGE LOGS */}
      {activeSubTab === 'usage' && (
        <div className="space-y-2">
          {state.equipmentUsage.length === 0 ? (
            <div className="p-8 text-center bg-zinc-900/60 rounded-2xl border border-zinc-800">
              <Clock className="w-10 h-10 text-zinc-600 mx-auto mb-3" />
              <h3 className="font-bold text-sm text-zinc-300">No Daily Usage Logged</h3>
            </div>
          ) : (
            <div className="space-y-2">
              {state.equipmentUsage.map((u) => {
                const eq = state.equipment.find(e => e.id === u.equipmentId);
                return (
                  <div key={u.id} className="p-4 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-between">
                    <div>
                      <div className="text-sm font-bold text-white">{eq ? eq.name : 'Machine'}</div>
                      <div className="text-xs text-zinc-400 mt-0.5">{u.workDescription}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-base font-bold text-emerald-400">{u.hoursOperated} hrs</div>
                      {u.fuelLiters > 0 && (
                        <div className="text-xs text-amber-400">⛽ {u.fuelLiters} L Diesel</div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* MODAL: ADD EQUIPMENT */}
      {isEquipModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl max-w-md w-full p-6 text-zinc-100 space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <h3 className="font-bold text-base text-white">+ Register Equipment</h3>
              <button onClick={() => setIsEquipModalOpen(false)} className="text-zinc-500">✕</button>
            </div>
            <form onSubmit={handleAddEquipment} className="space-y-3 text-xs">
              <select
                value={equipForm.equipmentType}
                onChange={(e) => setEquipForm({ ...equipForm, equipmentType: e.target.value })}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-xl p-2.5 text-white"
              >
                {state.equipmentTypes.map((t) => (
                  <option key={t.id} value={t.name}>{t.name}</option>
                ))}
              </select>
              <input
                type="text"
                placeholder="Machine Identification / Name (e.g. JCB #1)"
                value={equipForm.name}
                onChange={(e) => setEquipForm({ ...equipForm, name: e.target.value })}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-xl p-2.5 text-white"
                required
              />
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="rentedCheck"
                  checked={equipForm.isRented}
                  onChange={(e) => setEquipForm({ ...equipForm, isRented: e.target.checked })}
                  className="rounded bg-zinc-800 border-zinc-700 text-emerald-500"
                />
                <label htmlFor="rentedCheck" className="text-zinc-300 font-medium">This machine is Rented</label>
              </div>
              {equipForm.isRented && (
                <>
                  <input
                    type="text"
                    placeholder="Rental Agency / Vendor Name"
                    value={equipForm.rentalCompany}
                    onChange={(e) => setEquipForm({ ...equipForm, rentalCompany: e.target.value })}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-xl p-2.5 text-white"
                  />
                  <input
                    type="number"
                    placeholder="Daily Rental Rate (₹)"
                    value={equipForm.dailyRate}
                    onChange={(e) => setEquipForm({ ...equipForm, dailyRate: e.target.value })}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-xl p-2.5 text-white"
                  />
                </>
              )}
              <input
                type="text"
                placeholder="Operator Name"
                value={equipForm.operatorName}
                onChange={(e) => setEquipForm({ ...equipForm, operatorName: e.target.value })}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-xl p-2.5 text-white"
              />
              <div className="pt-2 flex justify-end space-x-2">
                <button type="button" onClick={() => setIsEquipModalOpen(false)} className="px-4 py-2 rounded-xl bg-zinc-800">Cancel</button>
                <button type="submit" className="px-5 py-2 rounded-xl bg-emerald-500 text-zinc-950 font-bold">Register Machine</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: DAILY USAGE */}
      {isUsageModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl max-w-md w-full p-6 text-zinc-100 space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <h3 className="font-bold text-base text-white">Log Daily Usage & Fuel</h3>
              <button onClick={() => setIsUsageModalOpen(false)} className="text-zinc-500">✕</button>
            </div>
            <form onSubmit={handleAddUsage} className="space-y-3 text-xs">
              <select
                value={usageForm.equipmentId}
                onChange={(e) => setUsageForm({ ...usageForm, equipmentId: Number(e.target.value) })}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-xl p-2.5 text-white"
              >
                {state.equipment.map((e) => (
                  <option key={e.id} value={e.id}>{e.name} ({e.equipmentType})</option>
                ))}
              </select>
              <input
                type="number"
                placeholder="Hours Operated"
                value={usageForm.hoursOperated}
                onChange={(e) => setUsageForm({ ...usageForm, hoursOperated: e.target.value })}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-xl p-2.5 text-white"
                required
              />
              <input
                type="number"
                placeholder="Diesel / Fuel Added (Liters)"
                value={usageForm.fuelLiters}
                onChange={(e) => setUsageForm({ ...usageForm, fuelLiters: e.target.value })}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-xl p-2.5 text-white"
              />
              <textarea
                placeholder="Work description / area executed..."
                value={usageForm.workDescription}
                onChange={(e) => setUsageForm({ ...usageForm, workDescription: e.target.value })}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-xl p-2.5 text-white h-20"
                required
              />
              <div className="pt-2 flex justify-end space-x-2">
                <button type="button" onClick={() => setIsUsageModalOpen(false)} className="px-4 py-2 rounded-xl bg-zinc-800">Cancel</button>
                <button type="submit" className="px-5 py-2 rounded-xl bg-emerald-500 text-zinc-950 font-bold">Save Usage Log</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
