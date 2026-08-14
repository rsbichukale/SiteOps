'use client';

import React, { useState, useEffect } from 'react';
import {
  Clock, Users, Play, Square, CheckCircle, AlertCircle, Plus, Calendar,
  Building, Check, X, Shield, MapPin, UserCheck, HardHat
} from 'lucide-react';
import { ContractorShiftRecord, ContractorMaster } from '@/types';
import { saveAppState } from '@/lib/dbState';
import { createLocalId } from '@/lib/ids';
import { Modal } from '@/components/ui/Modal';
import { StatCard } from '@/components/ui/StatCard';
import { Badge } from '@/components/ui/Badge';
import { FormInput } from '@/components/ui/FormInput';

import { useSiteOpsState } from '@/hooks/useSiteOpsState';

export const ShiftAttendanceModule: React.FC = () => {
  const { state } = useSiteOpsState();
  const contractors = state.contractorsMaster;
  const shifts = state.contractorShifts;

  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().slice(0, 10)
  );

  // Modals state
  const [isPunchInOpen, setIsPunchInOpen] = useState(false);
  const [isPunchOutOpen, setIsPunchOutOpen] = useState(false);
  const [activeShiftToPunchOut, setActiveShiftToPunchOut] = useState<ContractorShiftRecord | null>(null);

  // Form State - Punch In
  const [selectedContractorId, setSelectedContractorId] = useState<number>(contractors[0]?.id || 1);
  const [workerCount, setWorkerCount] = useState<number>(1);
  const [punchInTime, setPunchInTime] = useState<string>('');
  const [workLocation, setWorkLocation] = useState<string>('');
  const [workDescription, setWorkDescription] = useState<string>('');

  // Form State - Punch Out
  const [punchOutTime, setPunchOutTime] = useState<string>('');
  const [overtimeHours, setOvertimeHours] = useState<number>(0);
  const [punchOutNotes, setPunchOutNotes] = useState<string>('');

  useEffect(() => {
    if (contractors.length > 0 && !contractors.some(contractor => contractor.id === selectedContractorId)) {
      setSelectedContractorId(contractors[0].id);
    }
  }, [contractors, selectedContractorId]);

  const openPunchInModal = () => {
    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setPunchInTime(timeStr);
    setIsPunchInOpen(true);
  };

  const handlePunchInSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const contractor = contractors.find(c => c.id === Number(selectedContractorId));
    if (!contractor) return;

    const now = new Date();
    const currentTimeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const newShift: ContractorShiftRecord = {
      id: createLocalId(),
      contractorId: contractor.id,
      contractorName: contractor.name,
      trade: contractor.trade,
      reportDate: selectedDate,
      shiftStartTime: punchInTime || currentTimeStr,
      workerCount: Number(workerCount) || 1,
      workLocation,
      workDescription,
      loggedBy: state.currentUser?.name || 'Site User',
      status: 'IN_PROGRESS',
      createdAt: new Date().toISOString(),
    };

    const result = await saveAppState({
      contractorShifts: [newShift, ...shifts],
    });
    if (!result.success) return;

    setIsPunchInOpen(false);
  };

  const openPunchOutModal = (shift: ContractorShiftRecord) => {
    setActiveShiftToPunchOut(shift);
    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setPunchOutTime(timeStr);
    setPunchOutNotes(shift.workDescription || '');
    setIsPunchOutOpen(true);
  };

  const handlePunchOutSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeShiftToPunchOut) return;

    const updatedShifts = shifts.map(s => {
      if (s.id === activeShiftToPunchOut.id) {
        return {
          ...s,
          shiftEndTime: punchOutTime || '06:30 PM',
          overtimeHours: Number(overtimeHours) || 0,
          workDescription: punchOutNotes || s.workDescription,
          status: 'COMPLETED' as const,
          completedAt: new Date().toISOString(),
        };
      }
      return s;
    });

    const result = await saveAppState({
      contractorShifts: updatedShifts,
    });
    if (!result.success) return;

    setIsPunchOutOpen(false);
    setActiveShiftToPunchOut(null);
  };

  const dateShifts = shifts.filter(s => s.reportDate === selectedDate);
  const activeShifts = dateShifts.filter(s => s.status === 'IN_PROGRESS');
  const completedShifts = dateShifts.filter(s => s.status === 'COMPLETED');
  const totalPunchedInManpower = activeShifts.reduce((sum, s) => sum + s.workerCount, 0);

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
        <div>
          <div className="flex items-center gap-2 text-emerald-400 font-semibold text-xs tracking-wider uppercase">
            <Clock className="w-4 h-4" /> Contractor Attendance & Shift Register
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-zinc-100 mt-1">
            Site Punching & Shift Management
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            Record contractor start-of-day punch-in, end-of-shift hours, overtime, and work locations.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 rounded-xl border border-zinc-700 bg-zinc-950 px-3 py-2 text-xs text-zinc-300">
            <Calendar className="h-4 w-4" />
            <input type="date" value={selectedDate} onChange={event => setSelectedDate(event.target.value)} className="bg-transparent outline-none" />
          </label>
          <button
            onClick={openPunchInModal}
            className="px-4 py-2 text-xs font-bold bg-emerald-500 text-zinc-950 rounded-xl hover:bg-emerald-400 flex items-center gap-2 shadow-lg shadow-emerald-500/10 transition-all"
          >
            <Play className="w-4 h-4 fill-zinc-950" /> Punch In Shift (Morning)
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Active Workers On Site"
          value={totalPunchedInManpower}
          subtitle={`${activeShifts.length} Contractor Teams Active`}
          icon={Users}
          accentColor="emerald"
        />
        <StatCard
          title="Active Contractor Teams"
          value={activeShifts.length}
          subtitle="Currently working"
          icon={HardHat}
          accentColor="orange"
        />
        <StatCard
          title="Completed Shifts Today"
          value={completedShifts.length}
          subtitle="Punched Out"
          icon={CheckCircle}
          accentColor="sky"
        />
        <StatCard
          title="Logged Overtime (OT)"
          value={`${dateShifts.reduce((sum, s) => sum + (s.overtimeHours || 0), 0)} Hours`}
          subtitle="Total OT logged"
          icon={Clock}
          accentColor="amber"
        />
      </div>

      {/* Active Shifts Section */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
          <h2 className="text-sm font-semibold text-zinc-100 flex items-center gap-2">
            <UserCheck className="w-4 h-4 text-emerald-400" />
            Active Contractor Shifts (Working Right Now)
          </h2>
          <Badge variant="emerald">{activeShifts.length} Active Teams</Badge>
        </div>

        {activeShifts.length === 0 ? (
          <div className="text-center py-8 text-zinc-500 text-xs">
            No active contractor shifts. Tap <span className="text-emerald-400 font-semibold">Punch In Shift</span> to start a new crew.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {activeShifts.map(shift => (
              <div
                key={shift.id}
                className="p-4 bg-zinc-950 border border-emerald-500/20 rounded-xl space-y-3 relative overflow-hidden group hover:border-emerald-500/40 transition-all"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-zinc-100">{shift.contractorName}</h3>
                    <span className="text-xs text-emerald-400 font-medium">{shift.trade}</span>
                  </div>
                  <Badge variant="emerald">Punched In</Badge>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs bg-zinc-900/80 p-2.5 rounded-lg text-zinc-300">
                  <div>
                    <span className="text-zinc-500 block text-[10px]">Headcount</span>
                    <span className="font-bold text-zinc-100">{shift.workerCount} Workers</span>
                  </div>
                  <div>
                    <span className="text-zinc-500 block text-[10px]">Start Time</span>
                    <span className="font-bold text-emerald-400">{shift.shiftStartTime}</span>
                  </div>
                </div>

                {shift.workLocation && (
                  <div className="flex items-center gap-1.5 text-xs text-zinc-400">
                    <MapPin className="w-3.5 h-3.5 text-orange-400" />
                    <span>{shift.workLocation}</span>
                  </div>
                )}

                {shift.workDescription && (
                  <p className="text-xs text-zinc-400 italic line-clamp-2">
                    "{shift.workDescription}"
                  </p>
                )}

                <button
                  onClick={() => openPunchOutModal(shift)}
                  className="w-full mt-2 py-2 text-xs font-bold bg-rose-500/10 text-rose-400 border border-rose-500/20 rounded-lg hover:bg-rose-500/20 flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Square className="w-3.5 h-3.5 fill-rose-400" /> Punch Out (End Shift)
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Completed Shift History */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
          <h2 className="text-sm font-semibold text-zinc-100 flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-400" />
            Completed Shift History
          </h2>
          <Badge variant="zinc">{completedShifts.length} Records</Badge>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-zinc-300">
            <thead className="bg-zinc-950 text-zinc-400 uppercase tracking-wider text-[10px] border-b border-zinc-800">
              <tr>
                <th className="px-4 py-3">Contractor / Trade</th>
                <th className="px-4 py-3">Workers</th>
                <th className="px-4 py-3">In-Time</th>
                <th className="px-4 py-3">Out-Time</th>
                <th className="px-4 py-3">OT Hours</th>
                <th className="px-4 py-3">Location & Work Done</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60">
              {completedShifts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-6 text-zinc-500">
                    No completed shift records found.
                  </td>
                </tr>
              ) : (
                completedShifts.map(s => (
                  <tr key={s.id} className="hover:bg-zinc-950/50">
                    <td className="px-4 py-3 font-medium text-zinc-100">
                      <div>{s.contractorName}</div>
                      <div className="text-[10px] text-emerald-400">{s.trade}</div>
                    </td>
                    <td className="px-4 py-3 font-bold text-zinc-200">{s.workerCount}</td>
                    <td className="px-4 py-3 text-emerald-400 font-mono">{s.shiftStartTime}</td>
                    <td className="px-4 py-3 text-rose-400 font-mono">{s.shiftEndTime || '-'}</td>
                    <td className="px-4 py-3 text-amber-400 font-bold">{s.overtimeHours ? `${s.overtimeHours} hrs` : '-'}</td>
                    <td className="px-4 py-3 text-zinc-400">
                      <div className="font-medium text-zinc-300">{s.workLocation}</div>
                      <div className="text-[10px] truncate max-w-xs">{s.workDescription}</div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Punch In Modal */}
      <Modal isOpen={isPunchInOpen} onClose={() => setIsPunchInOpen(false)} title="Punch In Shift (Morning Start)">
        <form onSubmit={handlePunchInSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-1">Select Contractor</label>
            <select
              value={selectedContractorId}
              onChange={e => setSelectedContractorId(Number(e.target.value))}
              className="w-full px-3 py-2 text-sm bg-zinc-950 border border-zinc-800 rounded-lg text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              {contractors.map(c => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.trade})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <FormInput
              label="Worker Headcount"
              type="number"
              min="1"
              value={workerCount}
              onChange={e => setWorkerCount(Number(e.target.value))}
            />
            <FormInput
              label="Punch In Time"
              type="text"
              value={punchInTime}
              onChange={e => setPunchInTime(e.target.value)}
              placeholder="e.g. 08:30 AM"
            />
          </div>

          <FormInput
            label="Work Location / Area"
            type="text"
            value={workLocation}
            onChange={e => setWorkLocation(e.target.value)}
            placeholder="e.g. 4th Floor B-Building Flat 401-404"
          />

          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-1">Planned Tasks / Notes</label>
            <textarea
              rows={3}
              value={workDescription}
              onChange={e => setWorkDescription(e.target.value)}
              placeholder="e.g. Tile laying in master bedroom & kitchen balcony"
              className="w-full px-3 py-2 text-sm bg-zinc-950 border border-zinc-800 rounded-lg text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3">
            <button
              type="button"
              onClick={() => setIsPunchInOpen(false)}
              className="px-4 py-2 text-xs font-medium bg-zinc-800 text-zinc-300 rounded-lg hover:bg-zinc-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-bold bg-emerald-500 text-zinc-950 rounded-lg hover:bg-emerald-400 shadow"
            >
              Confirm Punch In
            </button>
          </div>
        </form>
      </Modal>

      {/* Punch Out Modal */}
      <Modal isOpen={isPunchOutOpen} onClose={() => setIsPunchOutOpen(false)} title="Punch Out Shift (End of Day)">
        <form onSubmit={handlePunchOutSubmit} className="space-y-4">
          <div className="p-3 bg-zinc-950 border border-zinc-800 rounded-lg space-y-1">
            <div className="text-xs font-bold text-zinc-100">{activeShiftToPunchOut?.contractorName}</div>
            <div className="text-xs text-emerald-400">{activeShiftToPunchOut?.trade} • {activeShiftToPunchOut?.workerCount} Workers</div>
            <div className="text-[10px] text-zinc-500">Punched In: {activeShiftToPunchOut?.shiftStartTime}</div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <FormInput
              label="Punch Out Time"
              type="text"
              value={punchOutTime}
              onChange={e => setPunchOutTime(e.target.value)}
              placeholder="e.g. 06:30 PM"
            />
            <FormInput
              label="Overtime (OT) Hours"
              type="number"
              step="0.5"
              min="0"
              value={overtimeHours}
              onChange={e => setOvertimeHours(Number(e.target.value))}
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-1">Completed Work Notes</label>
            <textarea
              rows={3}
              value={punchOutNotes}
              onChange={e => setPunchOutNotes(e.target.value)}
              placeholder="Summary of work completed by end of shift..."
              className="w-full px-3 py-2 text-sm bg-zinc-950 border border-zinc-800 rounded-lg text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3">
            <button
              type="button"
              onClick={() => setIsPunchOutOpen(false)}
              className="px-4 py-2 text-xs font-medium bg-zinc-800 text-zinc-300 rounded-lg hover:bg-zinc-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-bold bg-rose-500 text-white rounded-lg hover:bg-rose-600 shadow"
            >
              Confirm Punch Out
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
