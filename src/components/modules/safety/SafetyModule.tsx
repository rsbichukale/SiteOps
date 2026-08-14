'use client';

import React, { useEffect, useState } from 'react';
import { ShieldCheck, AlertOctagon, CheckCircle2, XCircle, Plus, Camera, User, FileText, HardHat } from 'lucide-react';
import { SafetyChecklistRecord, SafetyIncident, PPEIssuance } from '@/types';
import { getAppState, saveAppState } from '@/lib/dbState';
import { createLocalId } from '@/lib/ids';

import { useSiteOpsState } from '@/hooks/useSiteOpsState';

export const SafetyModule: React.FC = () => {
  const { state, updateState } = useSiteOpsState();
  const [activeSubTab, setActiveSubTab] = useState<'checklist' | 'incidents' | 'ppe'>('checklist');
  const [isIncidentModalOpen, setIsIncidentModalOpen] = useState(false);
  const [isPpeModalOpen, setIsPpeModalOpen] = useState(false);

  // Daily Safety Checklist State
  const [todayChecks, setTodayChecks] = useState<Record<number, boolean>>(() => {
    const initial: Record<number, boolean> = {};
    state.safetyCheckItems.forEach(item => {
      initial[item.id] = true;
    });
    return initial;
  });

  useEffect(() => {
    setTodayChecks(previous => {
      const next = { ...previous };
      for (const item of state.safetyCheckItems) {
        if (!(item.id in next)) next[item.id] = true;
      }
      return next;
    });
  }, [state.safetyCheckItems]);

  // Incident Form State
  const [incidentForm, setIncidentForm] = useState({
    severity: 'MINOR' as const,
    description: '',
    injuredPerson: '',
    contractorName: '',
    firstAidGiven: true,
    hospitalRequired: false,
    correctiveAction: '',
  });

  // PPE Form State
  const [ppeForm, setPpeForm] = useState({
    workerName: '',
    contractorName: '',
    item: 'HELMET' as const,
    quantity: '1',
  });

  const handleToggleCheck = (itemId: number) => {
    setTodayChecks(prev => ({
      ...prev,
      [itemId]: !prev[itemId]
    }));
  };

  const handleSaveChecklist = async () => {
    const total = state.safetyCheckItems.length;
    const passedCount = state.safetyCheckItems.filter(item => todayChecks[item.id] === true).length;

    const record: SafetyChecklistRecord = {
      id: createLocalId(),
      dateLogged: new Date().toISOString().split('T')[0],
      checks: state.safetyCheckItems.map(item => ({
        checkItemId: item.id,
        itemText: item.itemText,
        passed: todayChecks[item.id] === true,
      })),
      overallScore: passedCount,
      totalChecks: total,
      inspectorName: state.currentUser?.name || 'Site Engineer',
    };

    const result = await saveAppState({
      safetyChecklists: [record, ...state.safetyChecklists.filter(c => c.dateLogged !== record.dateLogged)],
    });
    if (!result.success) return;
    alert(`Daily Safety Audit Saved! Score: ${passedCount}/${total}`);
  };

  const handleAddIncident = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!incidentForm.description.trim()) return;

    const newIncident: SafetyIncident = {
      id: createLocalId(),
      dateTime: new Date().toISOString(),
      severity: incidentForm.severity,
      description: incidentForm.description.trim(),
      injuredPerson: incidentForm.injuredPerson,
      contractorName: incidentForm.contractorName,
      firstAidGiven: incidentForm.firstAidGiven,
      hospitalRequired: incidentForm.hospitalRequired,
      correctiveAction: incidentForm.correctiveAction,
      status: 'OPEN',
    };

    const result = await saveAppState({
      safetyIncidents: [newIncident, ...state.safetyIncidents],
    });
    if (!result.success) return;

    setIsIncidentModalOpen(false);
    setIncidentForm({
      severity: 'MINOR',
      description: '',
      injuredPerson: '',
      contractorName: '',
      firstAidGiven: true,
      hospitalRequired: false,
      correctiveAction: '',
    });
  };

  const handleAddPpe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ppeForm.workerName.trim()) return;

    const newPpe: PPEIssuance = {
      id: createLocalId(),
      workerName: ppeForm.workerName.trim(),
      contractorName: ppeForm.contractorName,
      item: ppeForm.item,
      quantity: Number(ppeForm.quantity) || 1,
      dateIssued: new Date().toISOString().split('T')[0],
      returned: false,
    };

    const result = await saveAppState({
      ppeIssuance: [newPpe, ...state.ppeIssuance],
    });
    if (!result.success) return;

    setIsPpeModalOpen(false);
    setPpeForm({ workerName: '', contractorName: '', item: 'HELMET', quantity: '1' });
  };

  const passedCount = Object.values(todayChecks).filter(Boolean).length;
  const totalCount = state.safetyCheckItems.length;

  return (
    <div className="space-y-4 max-w-7xl mx-auto p-3 sm:p-6 pb-24">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-zinc-900/80 p-4 rounded-2xl border border-zinc-800">
        <div className="flex items-center space-x-3">
          <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-white">Safety & Incident Compliance</h1>
            <p className="text-xs text-zinc-400">Daily Safety Audit Checklist, PPE Gear Issuance & Accident Register</p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setIsIncidentModalOpen(true)}
            className="flex-1 sm:flex-initial px-3 py-2 rounded-xl bg-red-500 hover:bg-red-600 text-white font-bold text-xs flex items-center justify-center space-x-1.5 transition shadow-lg shadow-red-500/20"
          >
            <AlertOctagon className="w-4 h-4" />
            <span>+ Report Incident</span>
          </button>
        </div>
      </div>

      {/* Sub Tab Switcher */}
      <div className="flex items-center space-x-1 bg-zinc-900 p-1 rounded-xl border border-zinc-800 text-xs">
        <button
          onClick={() => setActiveSubTab('checklist')}
          className={`px-3 py-2 rounded-lg font-medium transition ${
            activeSubTab === 'checklist'
              ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-bold'
              : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          ✅ Daily Safety Audit
        </button>
        <button
          onClick={() => setActiveSubTab('incidents')}
          className={`px-3 py-2 rounded-lg font-medium transition ${
            activeSubTab === 'incidents'
              ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-bold'
              : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          🚨 Incident Register ({state.safetyIncidents.length})
        </button>
        <button
          onClick={() => setActiveSubTab('ppe')}
          className={`px-3 py-2 rounded-lg font-medium transition ${
            activeSubTab === 'ppe'
              ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-bold'
              : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          🪖 PPE Gear Issuance ({state.ppeIssuance.length})
        </button>
      </div>

      {/* SUB-TAB 1: DAILY SAFETY CHECKLIST */}
      {activeSubTab === 'checklist' && (
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-between">
            <div>
              <div className="text-xs font-bold text-zinc-400 uppercase">Today's Safety Score</div>
              <div className="text-2xl font-black text-emerald-400 mt-0.5">
                {passedCount} / {totalCount} Passed
              </div>
            </div>
            <button
              onClick={handleSaveChecklist}
              className="px-4 py-2 rounded-xl bg-emerald-500 text-zinc-950 font-bold text-xs"
            >
              Save Daily Audit
            </button>
          </div>

          <div className="space-y-2">
            {state.safetyCheckItems.map((item) => {
              const isPassed = todayChecks[item.id] ?? true;
              return (
                <div
                  key={item.id}
                  onClick={() => handleToggleCheck(item.id)}
                  className={`p-4 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                    isPassed
                      ? 'bg-zinc-900/90 border-zinc-800 text-zinc-200'
                      : 'bg-red-500/10 border-red-500/30 text-red-200'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    {isPassed ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                    ) : (
                      <XCircle className="w-5 h-5 text-red-400 shrink-0" />
                    )}
                    <div>
                      <span className="text-xs font-bold text-zinc-500 uppercase mr-2">[{item.category}]</span>
                      <span className="text-sm font-semibold">{item.itemText}</span>
                    </div>
                  </div>
                  <span className={`text-xs font-bold px-2 py-1 rounded ${
                    isPassed ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'
                  }`}>
                    {isPassed ? 'PASS' : 'FAIL'}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* SUB-TAB 2: INCIDENT REGISTER */}
      {activeSubTab === 'incidents' && (
        <div className="space-y-2">
          {state.safetyIncidents.length === 0 ? (
            <div className="p-8 text-center bg-zinc-900/60 rounded-2xl border border-zinc-800">
              <ShieldCheck className="w-10 h-10 text-emerald-500 mx-auto mb-3" />
              <h3 className="font-bold text-sm text-zinc-300">Zero Incidents Reported</h3>
              <p className="text-xs text-zinc-500 mt-1">No accidents or near-misses logged on-site.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {state.safetyIncidents.map((inc) => (
                <div key={inc.id} className="p-4 rounded-xl bg-zinc-900 border border-red-500/30 space-y-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="px-2 py-0.5 rounded bg-red-500/20 text-red-400 text-[10px] font-bold">
                        {inc.severity}
                      </span>
                      <h3 className="text-sm font-bold text-white mt-1">{inc.description}</h3>
                    </div>
                    <span className="text-[10px] text-zinc-500">{new Date(inc.dateTime).toLocaleDateString()}</span>
                  </div>
                  {inc.injuredPerson && (
                    <div className="text-xs text-zinc-400">
                      Injured Person: <span className="text-zinc-200">{inc.injuredPerson}</span> ({inc.contractorName || 'N/A'})
                    </div>
                  )}
                  {inc.correctiveAction && (
                    <div className="text-xs text-amber-300/90 bg-amber-500/10 p-2 rounded-lg border border-amber-500/20">
                      Action Taken: {inc.correctiveAction}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* SUB-TAB 3: PPE ISSUANCE */}
      {activeSubTab === 'ppe' && (
        <div className="space-y-3">
          <div className="flex justify-end">
            <button
              onClick={() => setIsPpeModalOpen(true)}
              className="px-3 py-1.5 rounded-lg bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-500/30"
            >
              + Issue PPE Gear
            </button>
          </div>

          {state.ppeIssuance.length === 0 ? (
            <div className="p-8 text-center bg-zinc-900/60 rounded-2xl border border-zinc-800">
              <HardHat className="w-10 h-10 text-zinc-600 mx-auto mb-3" />
              <h3 className="font-bold text-sm text-zinc-300">No PPE Issuance Logged</h3>
            </div>
          ) : (
            <div className="space-y-2">
              {state.ppeIssuance.map((p) => (
                <div key={p.id} className="p-4 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-between">
                  <div>
                    <div className="text-sm font-bold text-white">{p.workerName}</div>
                    <div className="text-xs text-zinc-400">Gear: <span className="text-emerald-400 font-semibold">{p.item}</span> (Qty: {p.quantity})</div>
                  </div>
                  <div className="text-right text-[10px] text-zinc-500">
                    Issued: {p.dateIssued}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* MODAL: REPORT INCIDENT */}
      {isIncidentModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl max-w-md w-full p-6 text-zinc-100 space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <h3 className="font-bold text-base text-white flex items-center space-x-2">
                <AlertOctagon className="w-5 h-5 text-red-500" />
                <span>Report Safety Incident</span>
              </h3>
              <button onClick={() => setIsIncidentModalOpen(false)} className="text-zinc-500">✕</button>
            </div>
            <form onSubmit={handleAddIncident} className="space-y-3 text-xs">
              <select
                value={incidentForm.severity}
                onChange={(e) => setIncidentForm({ ...incidentForm, severity: e.target.value as any })}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-xl p-2.5 text-white"
              >
                <option value="MINOR">Minor Injury / First Aid</option>
                <option value="MAJOR">Major Injury / Hospital Visit</option>
                <option value="NEAR_MISS">Near-Miss Event</option>
                <option value="FATAL">Fatal Incident</option>
              </select>
              <textarea
                placeholder="Describe what happened..."
                value={incidentForm.description}
                onChange={(e) => setIncidentForm({ ...incidentForm, description: e.target.value })}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-xl p-2.5 text-white h-20"
                required
              />
              <input
                type="text"
                placeholder="Injured Person Name"
                value={incidentForm.injuredPerson}
                onChange={(e) => setIncidentForm({ ...incidentForm, injuredPerson: e.target.value })}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-xl p-2.5 text-white"
              />
              <select
                value={incidentForm.contractorName}
                onChange={(e) => setIncidentForm({ ...incidentForm, contractorName: e.target.value })}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-xl p-2.5 text-white"
              >
                <option value="">-- Select Contractor Agency (Optional) --</option>
                {state.contractorsMaster.map(c => (
                  <option key={c.id} value={`${c.name} (${c.trade})`}>{c.name} ({c.trade})</option>
                ))}
              </select>
              <textarea
                placeholder="Corrective Action Taken..."
                value={incidentForm.correctiveAction}
                onChange={(e) => setIncidentForm({ ...incidentForm, correctiveAction: e.target.value })}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-xl p-2.5 text-white h-20"
              />
              <div className="pt-2 flex justify-end space-x-2">
                <button type="button" onClick={() => setIsIncidentModalOpen(false)} className="px-4 py-2 rounded-xl bg-zinc-800">Cancel</button>
                <button type="submit" className="px-5 py-2 rounded-xl bg-red-500 text-white font-bold">Submit Report</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ISSUE PPE */}
      {isPpeModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl max-w-md w-full p-6 text-zinc-100 space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <h3 className="font-bold text-base text-white">Issue PPE Safety Gear</h3>
              <button onClick={() => setIsPpeModalOpen(false)} className="text-zinc-500">✕</button>
            </div>
            <form onSubmit={handleAddPpe} className="space-y-3 text-xs">
              <input
                type="text"
                placeholder="Worker Name"
                value={ppeForm.workerName}
                onChange={(e) => setPpeForm({ ...ppeForm, workerName: e.target.value })}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-xl p-2.5 text-white"
                required
              />
              <select
                value={ppeForm.contractorName}
                onChange={(e) => setPpeForm({ ...ppeForm, contractorName: e.target.value })}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-xl p-2.5 text-white"
              >
                <option value="">-- Select Contractor Agency (Optional) --</option>
                {state.contractorsMaster.map(c => (
                  <option key={c.id} value={`${c.name} (${c.trade})`}>{c.name} ({c.trade})</option>
                ))}
              </select>
              <select
                value={ppeForm.item}
                onChange={(e) => setPpeForm({ ...ppeForm, item: e.target.value as any })}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-xl p-2.5 text-white"
              >
                <option value="HELMET">Safety Helmet</option>
                <option value="BOOTS">Safety Boots</option>
                <option value="HARNESS">Full Body Harness</option>
                <option value="GLOVES">Work Gloves</option>
                <option value="VEST">Reflective High-Vis Vest</option>
                <option value="SAFETY_GLASSES">Safety Glasses</option>
              </select>
              <div className="pt-2 flex justify-end space-x-2">
                <button type="button" onClick={() => setIsPpeModalOpen(false)} className="px-4 py-2 rounded-xl bg-zinc-800">Cancel</button>
                <button type="submit" className="px-5 py-2 rounded-xl bg-emerald-500 text-zinc-950 font-bold">Issue Gear</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
