'use client';

import React, { useState } from 'react';
import { Users, Plus, Camera, Calendar, UserCheck, MessageSquare, Image, CheckCircle, Clock } from 'lucide-react';
import { Visitor, Meeting, SitePhoto } from '@/types';
import { getAppState, saveAppState } from '@/lib/dbState';
import { createLocalId } from '@/lib/ids';
import { isTrustedAssetUrl } from '@/lib/supabaseClient';

import { useSiteOpsState } from '@/hooks/useSiteOpsState';

export const VisitorModule: React.FC = () => {
  const { state, updateState } = useSiteOpsState();
  const [activeSubTab, setActiveSubTab] = useState<'visitors' | 'meetings' | 'photos'>('visitors');
  const [isVisitorModalOpen, setIsVisitorModalOpen] = useState(false);
  const [isMeetingModalOpen, setIsMeetingModalOpen] = useState(false);
  const [isPhotoModalOpen, setIsPhotoModalOpen] = useState(false);

  // Visitor Form State
  const [visitorForm, setVisitorForm] = useState({
    visitorName: '',
    companyRole: '',
    purpose: 'Site Inspection' as const,
    accompaniedBy: '',
    notes: '',
  });

  // Meeting Form State
  const [meetingForm, setMeetingForm] = useState({
    title: '',
    attendees: '',
    agenda: '',
    decisions: '',
  });

  // Photo Form State
  const [photoForm, setPhotoForm] = useState({
    caption: '',
    photoUrl: '',
    category: 'PROGRESS' as const,
  });

  const handleAddVisitor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!visitorForm.visitorName.trim()) return;

    const newVisitor: Visitor = {
      id: createLocalId(),
      visitorName: visitorForm.visitorName.trim(),
      companyRole: visitorForm.companyRole,
      purpose: visitorForm.purpose,
      entryTime: new Date().toISOString(),
      accompaniedBy: visitorForm.accompaniedBy,
      notes: visitorForm.notes,
    };

    const result = await saveAppState({
      visitors: [newVisitor, ...state.visitors],
    });
    if (!result.success) return;

    setIsVisitorModalOpen(false);
    setVisitorForm({
      visitorName: '',
      companyRole: '',
      purpose: 'Site Inspection',
      accompaniedBy: '',
      notes: '',
    });
  };

  const handleAddMeeting = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!meetingForm.title.trim()) return;

    const newMeeting: Meeting = {
      id: createLocalId(),
      title: meetingForm.title.trim(),
      meetingDate: new Date().toISOString(),
      attendees: meetingForm.attendees.split(',').map(s => s.trim()).filter(Boolean),
      agenda: meetingForm.agenda,
      decisions: meetingForm.decisions,
      actionItems: [],
    };

    const result = await saveAppState({
      meetings: [newMeeting, ...state.meetings],
    });
    if (!result.success) return;

    setIsMeetingModalOpen(false);
    setMeetingForm({ title: '', attendees: '', agenda: '', decisions: '' });
  };

  const handleAddPhoto = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!photoForm.caption.trim() || !isTrustedAssetUrl(photoForm.photoUrl)) {
      alert('Enter a valid photo URL from this project\'s Supabase Storage.');
      return;
    }

    const newPhoto: SitePhoto = {
      id: createLocalId(),
      caption: photoForm.caption.trim(),
      photoUrl: photoForm.photoUrl,
      category: photoForm.category,
      dateTaken: new Date().toISOString(),
    };

    const result = await saveAppState({
      sitePhotos: [newPhoto, ...state.sitePhotos],
    });
    if (!result.success) return;

    setIsPhotoModalOpen(false);
    setPhotoForm({ caption: '', photoUrl: '', category: 'PROGRESS' });
  };

  const handleVisitorCheckout = async (visitorId: number) => {
    await saveAppState({
      visitors: state.visitors.map(visitor => visitor.id === visitorId
        ? { ...visitor, exitTime: new Date().toISOString() }
        : visitor),
    });
  };

  return (
    <div className="space-y-4 max-w-7xl mx-auto p-3 sm:p-6 pb-24">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-zinc-900/80 p-4 rounded-2xl border border-zinc-800">
        <div className="flex items-center space-x-3">
          <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-white">Visitor Register & Meeting Minutes</h1>
            <p className="text-xs text-zinc-400">Log Architect Visits, Client Inspection Notes & Site Meeting Decisions</p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setIsVisitorModalOpen(true)}
            className="flex-1 sm:flex-initial px-3 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-zinc-950 font-bold text-xs flex items-center justify-center space-x-1.5 transition shadow-lg shadow-emerald-500/20"
          >
            <Plus className="w-4 h-4" />
            <span>+ Log Visitor Entry</span>
          </button>
          <button
            onClick={() => setIsMeetingModalOpen(true)}
            className="px-3 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-semibold text-xs flex items-center space-x-1.5 transition border border-zinc-700"
          >
            <MessageSquare className="w-4 h-4 text-emerald-400" />
            <span>Record Meeting</span>
          </button>
        </div>
      </div>

      {/* Sub Tab Switcher */}
      <div className="flex items-center space-x-1 bg-zinc-900 p-1 rounded-xl border border-zinc-800 text-xs">
        <button
          onClick={() => setActiveSubTab('visitors')}
          className={`px-3 py-2 rounded-lg font-medium transition ${
            activeSubTab === 'visitors'
              ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-bold'
              : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          👤 Visitor Entry Log ({state.visitors.length})
        </button>
        <button
          onClick={() => setActiveSubTab('meetings')}
          className={`px-3 py-2 rounded-lg font-medium transition ${
            activeSubTab === 'meetings'
              ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-bold'
              : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          📝 Meeting Minutes ({state.meetings.length})
        </button>
        <button
          onClick={() => setActiveSubTab('photos')}
          className={`px-3 py-2 rounded-lg font-medium transition ${
            activeSubTab === 'photos'
              ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-bold'
              : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          📸 Photo Timeline ({state.sitePhotos.length})
        </button>
      </div>

      {/* SUB-TAB 1: VISITORS */}
      {activeSubTab === 'visitors' && (
        <div className="space-y-2">
          {state.visitors.length === 0 ? (
            <div className="p-8 text-center bg-zinc-900/60 rounded-2xl border border-zinc-800">
              <Users className="w-10 h-10 text-zinc-600 mx-auto mb-3" />
              <h3 className="font-bold text-sm text-zinc-300">No Visitors Registered Today</h3>
              <p className="text-xs text-zinc-500 mt-1">Log flat owners, architects, structural consultants, and government inspectors.</p>
              <button
                onClick={() => setIsVisitorModalOpen(true)}
                className="mt-4 px-4 py-2 rounded-xl bg-emerald-500 text-zinc-950 font-bold text-xs"
              >
                + Check In First Visitor
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              {state.visitors.map((v) => (
                <div key={v.id} className="p-4 rounded-xl bg-zinc-900 border border-zinc-800 flex items-start justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-bold text-white">{v.visitorName}</span>
                      <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 text-[10px] font-semibold">
                        {v.purpose}
                      </span>
                    </div>
                    {v.companyRole && <div className="text-xs text-zinc-400">{v.companyRole}</div>}
                    {v.notes && <div className="text-xs text-zinc-500 italic mt-1 font-sans">"{v.notes}"</div>}
                  </div>
                  <div className="text-right text-[11px] text-zinc-500">
                    <div>{new Date(v.entryTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                    <div className="text-zinc-400">{new Date(v.entryTime).toLocaleDateString()}</div>
                    {v.exitTime ? (
                      <div className="mt-1 text-emerald-400">Checked out {new Date(v.exitTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                    ) : (
                      <button onClick={() => handleVisitorCheckout(v.id)} className="mt-2 rounded-lg bg-emerald-600 px-2 py-1 font-semibold text-zinc-950">Check out</button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* SUB-TAB 2: MEETINGS */}
      {activeSubTab === 'meetings' && (
        <div className="space-y-2">
          {state.meetings.length === 0 ? (
            <div className="p-8 text-center bg-zinc-900/60 rounded-2xl border border-zinc-800">
              <MessageSquare className="w-10 h-10 text-zinc-600 mx-auto mb-3" />
              <h3 className="font-bold text-sm text-zinc-300">No Meeting Minutes Recorded</h3>
            </div>
          ) : (
            <div className="space-y-3">
              {state.meetings.map((m) => (
                <div key={m.id} className="p-4 rounded-xl bg-zinc-900 border border-zinc-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-white">{m.title}</h3>
                    <span className="text-[10px] text-zinc-500">{new Date(m.meetingDate).toLocaleDateString()}</span>
                  </div>
                  {m.agenda && (
                    <div className="text-xs text-zinc-400">
                      <span className="font-semibold text-zinc-300">Agenda: </span>{m.agenda}
                    </div>
                  )}
                  {m.decisions && (
                    <div className="text-xs text-emerald-400/90 bg-emerald-500/10 p-2 rounded-lg border border-emerald-500/20">
                      <span className="font-bold text-emerald-300">Decisions: </span>{m.decisions}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* SUB-TAB 3: PHOTO TIMELINE */}
      {activeSubTab === 'photos' && (
        <div className="space-y-3">
          <div className="flex justify-end">
            <button
              onClick={() => setIsPhotoModalOpen(true)}
              className="px-3 py-1.5 rounded-lg bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-500/30"
            >
              + Add Progress Photo
            </button>
          </div>

          {state.sitePhotos.length === 0 ? (
            <div className="p-8 text-center bg-zinc-900/60 rounded-2xl border border-zinc-800">
              <Camera className="w-10 h-10 text-zinc-600 mx-auto mb-3" />
              <h3 className="font-bold text-sm text-zinc-300">No Site Photos Uploaded</h3>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {state.sitePhotos.map((p) => (
                <div key={p.id} className="rounded-xl bg-zinc-900 border border-zinc-800 overflow-hidden">
                  {isTrustedAssetUrl(p.photoUrl) ? (
                    <img src={p.photoUrl} alt={p.caption} referrerPolicy="no-referrer" className="w-full h-48 object-cover" />
                  ) : (
                    <div className="grid h-48 place-items-center bg-zinc-950 text-xs text-zinc-500">Untrusted photo URL blocked</div>
                  )}
                  <div className="p-3 space-y-1">
                    <span className="text-[10px] font-bold text-emerald-400 uppercase">{p.category}</span>
                    <div className="text-xs font-semibold text-white">{p.caption}</div>
                    <div className="text-[10px] text-zinc-500">{new Date(p.dateTaken).toLocaleDateString()}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* MODAL: ADD VISITOR */}
      {isVisitorModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl max-w-md w-full p-6 text-zinc-100 space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <h3 className="font-bold text-base text-white">+ Check In Visitor</h3>
              <button onClick={() => setIsVisitorModalOpen(false)} className="text-zinc-500">✕</button>
            </div>
            <form onSubmit={handleAddVisitor} className="space-y-3 text-xs">
              <input
                type="text"
                placeholder="Visitor Name"
                value={visitorForm.visitorName}
                onChange={(e) => setVisitorForm({ ...visitorForm, visitorName: e.target.value })}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-xl p-2.5 text-white"
                required
              />
              <input
                type="text"
                placeholder="Company / Firm (e.g. Architect, Flat Owner 402)"
                value={visitorForm.companyRole}
                onChange={(e) => setVisitorForm({ ...visitorForm, companyRole: e.target.value })}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-xl p-2.5 text-white"
              />
              <select
                value={visitorForm.purpose}
                onChange={(e) => setVisitorForm({ ...visitorForm, purpose: e.target.value as any })}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-xl p-2.5 text-white"
              >
                <option value="Site Inspection">Site Inspection</option>
                <option value="Client Visit">Client Visit</option>
                <option value="Vendor Meeting">Vendor Meeting</option>
                <option value="Government Inspector">Government Inspector</option>
                <option value="Consultant">Structural / MEP Consultant</option>
                <option value="Other">Other</option>
              </select>
              <textarea
                placeholder="Observations / Notes..."
                value={visitorForm.notes}
                onChange={(e) => setVisitorForm({ ...visitorForm, notes: e.target.value })}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-xl p-2.5 text-white h-20"
              />
              <div className="pt-2 flex justify-end space-x-2">
                <button type="button" onClick={() => setIsVisitorModalOpen(false)} className="px-4 py-2 rounded-xl bg-zinc-800">Cancel</button>
                <button type="submit" className="px-5 py-2 rounded-xl bg-emerald-500 text-zinc-950 font-bold">Check In</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ADD MEETING */}
      {isMeetingModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl max-w-md w-full p-6 text-zinc-100 space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <h3 className="font-bold text-base text-white">Record Meeting Minutes</h3>
              <button onClick={() => setIsMeetingModalOpen(false)} className="text-zinc-500">✕</button>
            </div>
            <form onSubmit={handleAddMeeting} className="space-y-3 text-xs">
              <input
                type="text"
                placeholder="Meeting Title"
                value={meetingForm.title}
                onChange={(e) => setMeetingForm({ ...meetingForm, title: e.target.value })}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-xl p-2.5 text-white"
                required
              />
              <textarea
                placeholder="Key Decisions Taken..."
                value={meetingForm.decisions}
                onChange={(e) => setMeetingForm({ ...meetingForm, decisions: e.target.value })}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-xl p-2.5 text-white h-24"
              />
              <div className="pt-2 flex justify-end space-x-2">
                <button type="button" onClick={() => setIsMeetingModalOpen(false)} className="px-4 py-2 rounded-xl bg-zinc-800">Cancel</button>
                <button type="submit" className="px-5 py-2 rounded-xl bg-emerald-500 text-zinc-950 font-bold">Save Meeting</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ADD PHOTO */}
      {isPhotoModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl max-w-md w-full p-6 text-zinc-100 space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <h3 className="font-bold text-base text-white">Upload Progress Photo</h3>
              <button onClick={() => setIsPhotoModalOpen(false)} className="text-zinc-500">✕</button>
            </div>
            <form onSubmit={handleAddPhoto} className="space-y-3 text-xs">
              <input
                type="text"
                placeholder="Caption / Location"
                value={photoForm.caption}
                onChange={(e) => setPhotoForm({ ...photoForm, caption: e.target.value })}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-xl p-2.5 text-white"
                required
              />
              <select
                value={photoForm.category}
                onChange={(e) => setPhotoForm({ ...photoForm, category: e.target.value as any })}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-xl p-2.5 text-white"
              >
                <option value="PROGRESS">Daily Progress</option>
                <option value="MILESTONE">Slab Pouring / Milestone</option>
                <option value="DRONE">Drone Shot</option>
                <option value="BEFORE_AFTER">Before & After</option>
              </select>
              <input
                type="text"
                placeholder="Supabase Storage photo URL"
                value={photoForm.photoUrl}
                onChange={(e) => setPhotoForm({ ...photoForm, photoUrl: e.target.value })}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-xl p-2.5 text-white"
              />
              <div className="pt-2 flex justify-end space-x-2">
                <button type="button" onClick={() => setIsPhotoModalOpen(false)} className="px-4 py-2 rounded-xl bg-zinc-800">Cancel</button>
                <button type="submit" className="px-5 py-2 rounded-xl bg-emerald-500 text-zinc-950 font-bold">Save Photo</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
