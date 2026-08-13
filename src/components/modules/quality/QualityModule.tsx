'use client';

import React, { useState } from 'react';
import { Microscope, Plus, CheckCircle2, XCircle, AlertTriangle, FileText, Calendar } from 'lucide-react';
import { CubeTest, MaterialTest, NCRReport } from '@/types';
import { getAppState, saveAppState } from '@/lib/dbState';

export const QualityModule: React.FC = () => {
  const [activeSubTab, setActiveSubTab] = useState<'cube' | 'material' | 'ncr'>('cube');
  const [isCubeModalOpen, setIsCubeModalOpen] = useState(false);
  const [isNcrModalOpen, setIsNcrModalOpen] = useState(false);

  const state = getAppState();

  // Cube Test Form State
  const [cubeForm, setCubeForm] = useState({
    castingDate: new Date().toISOString().split('T')[0],
    grade: 'M25' as const,
    location: '',
    numCubes: '6',
    result7Day: '',
    result28Day: '',
    status: 'PENDING' as const,
    labName: '',
  });

  // NCR Form State
  const [ncrForm, setNcrForm] = useState({
    location: '',
    description: '',
    isCodeReference: '',
    assignedTo: '',
  });

  const handleAddCubeTest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cubeForm.location.trim()) return;

    const newTest: CubeTest = {
      id: Date.now(),
      castingDate: cubeForm.castingDate,
      grade: cubeForm.grade,
      location: cubeForm.location.trim(),
      numCubes: Number(cubeForm.numCubes) || 6,
      result7Day: Number(cubeForm.result7Day) || undefined,
      result28Day: Number(cubeForm.result28Day) || undefined,
      status: cubeForm.status,
      labName: cubeForm.labName,
    };

    saveAppState({
      cubeTests: [newTest, ...state.cubeTests],
    });

    setIsCubeModalOpen(false);
    setCubeForm({
      castingDate: new Date().toISOString().split('T')[0],
      grade: 'M25',
      location: '',
      numCubes: '6',
      result7Day: '',
      result28Day: '',
      status: 'PENDING',
      labName: '',
    });
  };

  const handleAddNcr = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ncrForm.description.trim()) return;

    const newNcr: NCRReport = {
      id: Date.now(),
      location: ncrForm.location,
      description: ncrForm.description.trim(),
      isCodeReference: ncrForm.isCodeReference,
      assignedTo: ncrForm.assignedTo,
      status: 'OPEN',
      createdAt: new Date().toISOString(),
    };

    saveAppState({
      ncrReports: [newNcr, ...state.ncrReports],
    });

    setIsNcrModalOpen(false);
    setNcrForm({ location: '', description: '', isCodeReference: '', assignedTo: '' });
  };

  return (
    <div className="space-y-4 max-w-7xl mx-auto p-3 sm:p-6 pb-24">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-zinc-900/80 p-4 rounded-2xl border border-zinc-800">
        <div className="flex items-center space-x-3">
          <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
            <Microscope className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-white">Quality Control & Lab Testing</h1>
            <p className="text-xs text-zinc-400">Concrete Cube Strength Register, Material Lab Certificates & Non-Conformance (NCR)</p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setIsCubeModalOpen(true)}
            className="flex-1 sm:flex-initial px-3 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-zinc-950 font-bold text-xs flex items-center justify-center space-x-1.5 transition shadow-lg shadow-emerald-500/20"
          >
            <Plus className="w-4 h-4" />
            <span>+ Log Cube Test</span>
          </button>
          <button
            onClick={() => setIsNcrModalOpen(true)}
            className="px-3 py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 font-semibold text-xs flex items-center space-x-1.5 transition border border-amber-500/30"
          >
            <AlertTriangle className="w-4 h-4 text-amber-400" />
            <span>Raise NCR</span>
          </button>
        </div>
      </div>

      {/* Sub Tab Switcher */}
      <div className="flex items-center space-x-1 bg-zinc-900 p-1 rounded-xl border border-zinc-800 text-xs">
        <button
          onClick={() => setActiveSubTab('cube')}
          className={`px-3 py-2 rounded-lg font-medium transition ${
            activeSubTab === 'cube'
              ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-bold'
              : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          🧪 Concrete Cube Tests ({state.cubeTests.length})
        </button>
        <button
          onClick={() => setActiveSubTab('ncr')}
          className={`px-3 py-2 rounded-lg font-medium transition ${
            activeSubTab === 'ncr'
              ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-bold'
              : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          ⚠️ Non-Conformance (NCR) ({state.ncrReports.length})
        </button>
      </div>

      {/* SUB-TAB 1: CUBE TESTS */}
      {activeSubTab === 'cube' && (
        <div className="space-y-3">
          {state.cubeTests.length === 0 ? (
            <div className="p-8 text-center bg-zinc-900/60 rounded-2xl border border-zinc-800">
              <Microscope className="w-10 h-10 text-zinc-600 mx-auto mb-3" />
              <h3 className="font-bold text-sm text-zinc-300">No Concrete Cube Tests Registered</h3>
              <p className="text-xs text-zinc-500 mt-1">Track 7-day and 28-day compressive strength results for columns, slabs & beams.</p>
              <button
                onClick={() => setIsCubeModalOpen(true)}
                className="mt-4 px-4 py-2 rounded-xl bg-emerald-500 text-zinc-950 font-bold text-xs"
              >
                + Register Cube Sample
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {state.cubeTests.map((t) => (
                <div key={t.id} className="p-4 rounded-xl bg-zinc-900 border border-zinc-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 text-xs font-black">
                      {t.grade}
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                      t.status === 'PASS' ? 'bg-emerald-500/20 text-emerald-400' :
                      t.status === 'FAIL' ? 'bg-red-500/20 text-red-400' : 'bg-amber-500/20 text-amber-400'
                    }`}>
                      {t.status}
                    </span>
                  </div>

                  <h3 className="font-bold text-sm text-white">{t.location}</h3>

                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-zinc-800 text-xs">
                    <div>
                      <div className="text-[10px] text-zinc-500">7-Day Result</div>
                      <div className="font-bold text-zinc-200">{t.result7Day ? `${t.result7Day} N/mm²` : 'Pending'}</div>
                    </div>
                    <div>
                      <div className="text-[10px] text-zinc-500">28-Day Result</div>
                      <div className="font-bold text-emerald-400">{t.result28Day ? `${t.result28Day} N/mm²` : 'Pending'}</div>
                    </div>
                  </div>

                  <div className="text-[10px] text-zinc-500 pt-1">
                    Casted: {t.castingDate} • {t.numCubes} Cubes
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* SUB-TAB 2: NCR REPORTS */}
      {activeSubTab === 'ncr' && (
        <div className="space-y-3">
          {state.ncrReports.length === 0 ? (
            <div className="p-8 text-center bg-zinc-900/60 rounded-2xl border border-zinc-800">
              <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-3" />
              <h3 className="font-bold text-sm text-zinc-300">No Non-Conformance Reports (NCR) Raised</h3>
            </div>
          ) : (
            <div className="space-y-2">
              {state.ncrReports.map((ncr) => (
                <div key={ncr.id} className="p-4 rounded-xl bg-zinc-900 border border-amber-500/30 space-y-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-xs font-bold text-amber-400">{ncr.location}</span>
                      <h3 className="text-sm font-semibold text-white mt-0.5">{ncr.description}</h3>
                    </div>
                    <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-400 text-[10px] font-bold">
                      {ncr.status}
                    </span>
                  </div>
                  {ncr.assignedTo && <div className="text-xs text-zinc-400">Assigned To: {ncr.assignedTo}</div>}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* MODAL: ADD CUBE TEST */}
      {isCubeModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl max-w-md w-full p-6 text-zinc-100 space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <h3 className="font-bold text-base text-white">+ Register Concrete Cube Sample</h3>
              <button onClick={() => setIsCubeModalOpen(false)} className="text-zinc-500">✕</button>
            </div>
            <form onSubmit={handleAddCubeTest} className="space-y-3 text-xs">
              <select
                value={cubeForm.grade}
                onChange={(e) => setCubeForm({ ...cubeForm, grade: e.target.value as any })}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-xl p-2.5 text-white font-bold"
              >
                <option value="M20">M20 Grade</option>
                <option value="M25">M25 Grade</option>
                <option value="M30">M30 Grade</option>
                <option value="M35">M35 Grade</option>
                <option value="M40">M40 Grade</option>
              </select>
              <input
                type="text"
                placeholder="Pouring Location (e.g. Column C3-C7, Floor 4)"
                value={cubeForm.location}
                onChange={(e) => setCubeForm({ ...cubeForm, location: e.target.value })}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-xl p-2.5 text-white"
                required
              />
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="number"
                  placeholder="7-Day Result (N/mm²)"
                  value={cubeForm.result7Day}
                  onChange={(e) => setCubeForm({ ...cubeForm, result7Day: e.target.value })}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-xl p-2.5 text-white"
                />
                <input
                  type="number"
                  placeholder="28-Day Result (N/mm²)"
                  value={cubeForm.result28Day}
                  onChange={(e) => setCubeForm({ ...cubeForm, result28Day: e.target.value })}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-xl p-2.5 text-white"
                />
              </div>
              <div className="pt-2 flex justify-end space-x-2">
                <button type="button" onClick={() => setIsCubeModalOpen(false)} className="px-4 py-2 rounded-xl bg-zinc-800">Cancel</button>
                <button type="submit" className="px-5 py-2 rounded-xl bg-emerald-500 text-zinc-950 font-bold">Save Test</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: RAISE NCR */}
      {isNcrModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl max-w-md w-full p-6 text-zinc-100 space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <h3 className="font-bold text-base text-white">Raise Non-Conformance Report (NCR)</h3>
              <button onClick={() => setIsNcrModalOpen(false)} className="text-zinc-500">✕</button>
            </div>
            <form onSubmit={handleAddNcr} className="space-y-3 text-xs">
              <input
                type="text"
                placeholder="Location / Area"
                value={ncrForm.location}
                onChange={(e) => setNcrForm({ ...ncrForm, location: e.target.value })}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-xl p-2.5 text-white"
                required
              />
              <textarea
                placeholder="Defect Description..."
                value={ncrForm.description}
                onChange={(e) => setNcrForm({ ...ncrForm, description: e.target.value })}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-xl p-2.5 text-white h-24"
                required
              />
              <div className="pt-2 flex justify-end space-x-2">
                <button type="button" onClick={() => setIsNcrModalOpen(false)} className="px-4 py-2 rounded-xl bg-zinc-800">Cancel</button>
                <button type="submit" className="px-5 py-2 rounded-xl bg-amber-500 text-zinc-950 font-bold">Raise NCR</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
