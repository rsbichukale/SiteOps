'use client';

import React, { useState } from 'react';
import { Microscope, Plus, CheckCircle2, XCircle, AlertTriangle, FileText, Calendar } from 'lucide-react';
import { CubeTest, MaterialTest, NCRReport } from '@/types';
import { getAppState, saveAppState } from '@/lib/dbState';
import { createLocalId } from '@/lib/ids';

import { useSiteOpsState } from '@/hooks/useSiteOpsState';

export const QualityModule: React.FC = () => {
  const { state, updateState } = useSiteOpsState();
  const [activeSubTab, setActiveSubTab] = useState<'cube' | 'material' | 'ncr'>('cube');
  const [isCubeModalOpen, setIsCubeModalOpen] = useState(false);
  const [isMaterialModalOpen, setIsMaterialModalOpen] = useState(false);
  const [isNcrModalOpen, setIsNcrModalOpen] = useState(false);

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
  const [materialForm, setMaterialForm] = useState<{
    material: string; testType: string; sampleSource: string; testResult: string; passFail: 'PASS' | 'FAIL';
  }>({ material: '', testType: '', sampleSource: '', testResult: '', passFail: 'PASS' });

  const handleAddCubeTest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cubeForm.location.trim()) return;

    const newTest: CubeTest = {
      id: createLocalId(),
      castingDate: cubeForm.castingDate,
      grade: cubeForm.grade,
      location: cubeForm.location.trim(),
      numCubes: Number(cubeForm.numCubes) || 6,
      result7Day: Number(cubeForm.result7Day) || undefined,
      result28Day: Number(cubeForm.result28Day) || undefined,
      status: cubeForm.status,
      labName: cubeForm.labName,
    };

    const result = await saveAppState({
      cubeTests: [newTest, ...state.cubeTests],
    });
    if (!result.success) return;

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

  const handleAddNcr = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ncrForm.description.trim()) return;

    const newNcr: NCRReport = {
      id: createLocalId(),
      location: ncrForm.location,
      description: ncrForm.description.trim(),
      isCodeReference: ncrForm.isCodeReference,
      assignedTo: ncrForm.assignedTo,
      status: 'OPEN',
      createdAt: new Date().toISOString(),
    };

    const result = await saveAppState({
      ncrReports: [newNcr, ...state.ncrReports],
    });
    if (!result.success) return;

    setIsNcrModalOpen(false);
    setNcrForm({ location: '', description: '', isCodeReference: '', assignedTo: '' });
  };

  const handleAddMaterialTest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!materialForm.material.trim() || !materialForm.testType.trim()) return;
    const materialTest: MaterialTest = {
      id: createLocalId(),
      material: materialForm.material.trim(),
      testType: materialForm.testType.trim(),
      sampleSource: materialForm.sampleSource.trim(),
      testResult: materialForm.testResult.trim(),
      passFail: materialForm.passFail,
      dateTested: new Date().toISOString().slice(0, 10),
    };
    const result = await saveAppState({ materialTests: [materialTest, ...state.materialTests] });
    if (!result.success) return;
    setIsMaterialModalOpen(false);
    setMaterialForm({ material: '', testType: '', sampleSource: '', testResult: '', passFail: 'PASS' });
  };

  const handleApproveNcr = async (id: number) => {
    const updated = state.ncrReports.map(ncr => {
      if (ncr.id === id) {
        return {
          ...ncr,
          status: 'IN_RECTIFICATION' as const,
        };
      }
      return ncr;
    });
    await saveAppState({ ncrReports: updated });
  };

  const handleCloseNcr = async (id: number) => {
    await saveAppState({
      ncrReports: state.ncrReports.map(ncr => ncr.id === id
        ? { ...ncr, status: 'CLOSED' as const, closedAt: new Date().toISOString() }
        : ncr),
    });
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
            <h1 className="text-lg font-bold text-white">Quality Control & NCR Register</h1>
            <p className="text-xs text-zinc-400">Track Concrete Cube Strength (7/28 Days), Material Testing & Non-Conformance</p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setIsMaterialModalOpen(true)}
            className="px-3 py-2 rounded-xl bg-sky-500/10 hover:bg-sky-500/20 text-sky-400 font-semibold text-xs flex items-center space-x-1.5 border border-sky-500/30"
          >
            <Plus className="w-4 h-4" /><span>Material Test</span>
          </button>
          <button
            onClick={() => setIsCubeModalOpen(true)}
            className="flex-1 sm:flex-initial px-3 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-zinc-950 font-bold text-xs flex items-center justify-center space-x-1.5 transition shadow-lg shadow-emerald-500/20"
          >
            <Plus className="w-4 h-4" />
            <span>+ Cast Cube Sample</span>
          </button>
          <button
            onClick={() => setIsNcrModalOpen(true)}
            className="px-3 py-2 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 font-semibold text-xs flex items-center space-x-1.5 transition border border-amber-500/30"
          >
            <AlertTriangle className="w-4 h-4 text-amber-400" />
            <span>Raise Manual NCR</span>
          </button>
        </div>
      </div>

      {/* Sub Tab Switcher */}
      <div className="flex items-center space-x-1 bg-zinc-900 p-1 rounded-xl border border-zinc-800 text-xs">
        <button
          onClick={() => setActiveSubTab('material')}
          className={`px-3 py-2 rounded-lg font-medium transition ${activeSubTab === 'material' ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-bold' : 'text-zinc-400 hover:text-zinc-200'}`}
        >
          Material Tests ({state.materialTests.length})
        </button>
        <button
          onClick={() => setActiveSubTab('cube')}
          className={`px-3 py-2 rounded-lg font-medium transition ${
            activeSubTab === 'cube'
              ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-bold'
              : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          🧊 Cube Testing ({state.cubeTests.length})
        </button>
        <button
          onClick={() => setActiveSubTab('ncr')}
          className={`px-3 py-2 rounded-lg font-medium transition ${
            activeSubTab === 'ncr'
              ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-bold'
              : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          ⚠️ Non-Conformance Reports ({state.ncrReports.length})
        </button>
      </div>

      {/* SUB-TAB 1: CUBE TESTS */}
      {activeSubTab === 'cube' && (
        <div className="space-y-3">
          {state.cubeTests.length === 0 ? (
            <div className="p-8 text-center bg-zinc-900/60 rounded-2xl border border-zinc-800">
              <Microscope className="w-10 h-10 text-zinc-600 mx-auto mb-3" />
              <h3 className="font-bold text-sm text-zinc-300">No Concrete Cube Tests Registered</h3>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {state.cubeTests.map((t) => (
                <div key={t.id} className="p-4 rounded-xl bg-zinc-900 border border-zinc-800 space-y-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-xs font-bold text-emerald-400">{t.grade} Concrete</span>
                      <h3 className="text-sm font-semibold text-white mt-0.5">{t.location}</h3>
                    </div>
                    <span className="px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 text-[10px] font-bold">
                      {t.status}
                    </span>
                  </div>

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

      {activeSubTab === 'material' && (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {state.materialTests.length === 0 ? (
            <div className="col-span-full rounded-xl border border-zinc-800 bg-zinc-900 p-8 text-center text-sm text-zinc-500">No material tests recorded.</div>
          ) : state.materialTests.map(test => (
            <div key={test.id} className="rounded-xl border border-zinc-800 bg-zinc-900 p-4">
              <div className="flex items-center justify-between"><strong>{test.material}</strong><span className={test.passFail === 'PASS' ? 'text-emerald-400' : 'text-red-400'}>{test.passFail}</span></div>
              <div className="mt-1 text-xs text-zinc-400">{test.testType} · {test.dateTested}</div>
              <div className="mt-2 text-sm text-zinc-200">{test.testResult || 'Result not entered'}</div>
              {test.sampleSource && <div className="mt-1 text-xs text-zinc-500">Source: {test.sampleSource}</div>}
            </div>
          ))}
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
              {state.ncrReports.map((ncr) => {
                const isDraft = Boolean(ncr.sourceMaterialInwardId) && ncr.status === 'OPEN';
                return (
                  <div key={ncr.id} className={`p-4 rounded-xl border flex items-center justify-between transition ${
                    isDraft ? 'bg-amber-950/20 border-amber-500/40' : 'bg-zinc-900 border-zinc-800'
                  }`}>
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <span className="text-xs font-bold text-amber-400">{ncr.location}</span>
                        {isDraft && (
                          <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 text-[10px] font-bold border border-amber-500/30">
                            Draft (Origin: Failed Material QC)
                          </span>
                        )}
                      </div>
                      <h3 className="text-sm font-semibold text-white mt-0.5">{ncr.description}</h3>
                      {ncr.assignedTo && <div className="text-xs text-zinc-400">Assigned Inspector: {ncr.assignedTo}</div>}
                    </div>

                    <div className="text-right space-y-1">
                      <span className="inline-block px-2 py-0.5 rounded bg-amber-500/20 text-amber-400 text-[10px] font-bold">
                        {ncr.status}
                      </span>
                      {isDraft && (
                        <div>
                          <button
                            onClick={() => handleApproveNcr(ncr.id)}
                            className="px-3 py-1 text-xs font-bold bg-amber-500 text-zinc-950 rounded-lg hover:bg-amber-400 shadow"
                          >
                            Confirm NCR
                          </button>
                        </div>
                      )}
                      {ncr.status === 'OPEN' && !isDraft && (
                        <button onClick={() => handleApproveNcr(ncr.id)} className="rounded-lg bg-amber-500 px-3 py-1 text-xs font-bold text-zinc-950">Start rectification</button>
                      )}
                      {ncr.status === 'IN_RECTIFICATION' && (
                        <button onClick={() => handleCloseNcr(ncr.id)} className="rounded-lg bg-emerald-600 px-3 py-1 text-xs font-bold text-zinc-950">Close NCR</button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* MODAL: ADD CUBE TEST */}
      {isMaterialModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md space-y-4 rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
            <h3 className="font-bold">Record Material Test</h3>
            <form onSubmit={handleAddMaterialTest} className="space-y-3 text-xs">
              <input required placeholder="Material" value={materialForm.material} onChange={e => setMaterialForm({ ...materialForm, material: e.target.value })} className="w-full rounded-xl border border-zinc-700 bg-zinc-800 p-2.5" />
              <input required placeholder="Test type" value={materialForm.testType} onChange={e => setMaterialForm({ ...materialForm, testType: e.target.value })} className="w-full rounded-xl border border-zinc-700 bg-zinc-800 p-2.5" />
              <input placeholder="Sample source" value={materialForm.sampleSource} onChange={e => setMaterialForm({ ...materialForm, sampleSource: e.target.value })} className="w-full rounded-xl border border-zinc-700 bg-zinc-800 p-2.5" />
              <input placeholder="Test result" value={materialForm.testResult} onChange={e => setMaterialForm({ ...materialForm, testResult: e.target.value })} className="w-full rounded-xl border border-zinc-700 bg-zinc-800 p-2.5" />
              <select value={materialForm.passFail} onChange={e => setMaterialForm({ ...materialForm, passFail: e.target.value as 'PASS' | 'FAIL' })} className="w-full rounded-xl border border-zinc-700 bg-zinc-800 p-2.5"><option>PASS</option><option>FAIL</option></select>
              <div className="flex justify-end gap-2"><button type="button" onClick={() => setIsMaterialModalOpen(false)} className="rounded-lg bg-zinc-800 px-3 py-2">Cancel</button><button className="rounded-lg bg-emerald-600 px-3 py-2 font-bold text-zinc-950">Save test</button></div>
            </form>
          </div>
        </div>
      )}

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
