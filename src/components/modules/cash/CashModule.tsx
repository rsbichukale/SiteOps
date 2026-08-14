'use client';

import React, { useState } from 'react';
import { Banknote, Plus, Coffee, Truck, ShoppingBag, Fuel, FileText, Cross, MoreHorizontal, DollarSign, Calendar, ArrowUpRight } from 'lucide-react';
import { Expense, FundRequisition } from '@/types';
import { getAppState, saveAppState } from '@/lib/dbState';
import { createLocalId } from '@/lib/ids';

import { useSiteOpsState } from '@/hooks/useSiteOpsState';

export const CashModule: React.FC = () => {
  const { state, updateState } = useSiteOpsState();
  const [activeSubTab, setActiveSubTab] = useState<'expenses' | 'requisitions' | 'summary'>('expenses');
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [isRequisitionModalOpen, setIsRequisitionModalOpen] = useState(false);

  // Expense Form State
  const [expenseForm, setExpenseForm] = useState({
    category: state.expenseCategories[0]?.name || 'Tea & Snacks',
    description: '',
    amount: '',
    paidTo: '',
    paymentMode: 'CASH' as const,
  });

  // Requisition Form State
  const [reqForm, setReqForm] = useState({
    amountRequested: '',
    purpose: '',
  });

  const handleAddExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    const amt = Number(expenseForm.amount);
    if (!amt || amt <= 0) return;

    const newExpense: Expense = {
      id: createLocalId(),
      category: expenseForm.category,
      description: expenseForm.description || expenseForm.category,
      amount: amt,
      paidTo: expenseForm.paidTo,
      paymentMode: expenseForm.paymentMode,
      dateLogged: new Date().toISOString().split('T')[0],
      status: 'APPROVED',
    };

    const result = await saveAppState({
      expenses: [newExpense, ...state.expenses],
    });
    if (!result.success) return;

    setIsExpenseModalOpen(false);
    setExpenseForm({
      category: state.expenseCategories[0]?.name || 'Tea & Snacks',
      description: '',
      amount: '',
      paidTo: '',
      paymentMode: 'CASH',
    });
  };

  const handleAddRequisition = async (e: React.FormEvent) => {
    e.preventDefault();
    const amt = Number(reqForm.amountRequested);
    if (!amt || amt <= 0) return;

    const newReq: FundRequisition = {
      id: createLocalId(),
      amountRequested: amt,
      purpose: reqForm.purpose,
      status: 'PENDING',
      dateRequested: new Date().toISOString().split('T')[0],
    };

    const result = await saveAppState({
      fundRequisitions: [newReq, ...state.fundRequisitions],
    });
    if (!result.success) return;

    setIsRequisitionModalOpen(false);
    setReqForm({ amountRequested: '', purpose: '' });
  };

  const handleApproveExpense = async (id: number) => {
    const updated = state.expenses.map(e => {
      if (e.id === id) {
        return {
          ...e,
          status: 'APPROVED' as const,
        };
      }
      return e;
    });
    await saveAppState({ expenses: updated });
  };

  const handleRequisitionStatus = async (id: number, status: FundRequisition['status']) => {
    await saveAppState({
      fundRequisitions: state.fundRequisitions.map(requisition => requisition.id === id ? {
        ...requisition,
        status,
        amountReceived: status === 'RECEIVED' ? requisition.amountRequested : requisition.amountReceived,
        dateReceived: status === 'RECEIVED' ? new Date().toISOString().slice(0, 10) : requisition.dateReceived,
      } : requisition),
    });
  };

  const totalSpent = state.expenses.reduce((sum, e) => sum + e.amount, 0);
  const totalRequisitions = state.fundRequisitions.reduce((sum, r) => sum + r.amountRequested, 0);

  return (
    <div className="space-y-4 max-w-7xl mx-auto p-3 sm:p-6 pb-24">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-zinc-900/80 p-4 rounded-2xl border border-zinc-800">
        <div className="flex items-center space-x-3">
          <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
            <Banknote className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-white">Petty Cash & Expense Tracker</h1>
            <p className="text-xs text-zinc-400">Log Daily Site Expenses, Tea/Snacks, Freight & Fund Requisitions</p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setIsExpenseModalOpen(true)}
            className="flex-1 sm:flex-initial px-3 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-zinc-950 font-bold text-xs flex items-center justify-center space-x-1.5 transition shadow-lg shadow-emerald-500/20"
          >
            <Plus className="w-4 h-4" />
            <span>+ Log Expense</span>
          </button>
          <button
            onClick={() => setIsRequisitionModalOpen(true)}
            className="px-3 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-semibold text-xs flex items-center space-x-1.5 transition border border-zinc-700"
          >
            <ArrowUpRight className="w-4 h-4 text-emerald-400" />
            <span>Request Funds</span>
          </button>
        </div>
      </div>

      {/* Summary KPI Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <div className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800">
          <div className="text-[10px] uppercase font-bold text-zinc-500">Total Expenses Logged</div>
          <div className="text-2xl font-black text-emerald-400 mt-1">₹{totalSpent.toLocaleString()}</div>
        </div>
        <div className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800">
          <div className="text-[10px] uppercase font-bold text-zinc-500">Fund Requisitions</div>
          <div className="text-2xl font-black text-amber-400 mt-1">₹{totalRequisitions.toLocaleString()}</div>
        </div>
      </div>

      {/* Sub Tab Switcher */}
      <div className="flex items-center space-x-1 bg-zinc-900 p-1 rounded-xl border border-zinc-800 text-xs">
        <button
          onClick={() => setActiveSubTab('expenses')}
          className={`px-3 py-2 rounded-lg font-medium transition ${
            activeSubTab === 'expenses'
              ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-bold'
              : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          🧾 Daily Expenses ({state.expenses.length})
        </button>
        <button
          onClick={() => setActiveSubTab('requisitions')}
          className={`px-3 py-2 rounded-lg font-medium transition ${
            activeSubTab === 'requisitions'
              ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-bold'
              : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          💵 Fund Requisitions ({state.fundRequisitions.length})
        </button>
      </div>

      {/* SUB-TAB: DAILY EXPENSES */}
      {activeSubTab === 'expenses' && (
        <div className="space-y-2">
          {state.expenses.length === 0 ? (
            <div className="p-8 text-center bg-zinc-900/60 rounded-2xl border border-zinc-800">
              <Banknote className="w-10 h-10 text-zinc-600 mx-auto mb-3" />
              <h3 className="font-bold text-sm text-zinc-300">No Expenses Logged Yet</h3>
            </div>
          ) : (
            <div className="space-y-2">
              {state.expenses.map((e) => {
                const isDraft = e.status === 'PENDING_APPROVAL' || (!e.status && e.description.includes('[DRAFT Expense'));
                return (
                  <div key={e.id} className={`p-4 rounded-xl border flex items-center justify-between transition ${
                    isDraft ? 'bg-amber-950/20 border-amber-500/30' : 'bg-zinc-900 border-zinc-800'
                  }`}>
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-bold text-white">{e.description}</span>
                        <span className="px-2 py-0.5 rounded bg-zinc-800 text-zinc-400 text-[10px] font-medium border border-zinc-700">
                          {e.category}
                        </span>
                        {isDraft && (
                          <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 text-[10px] font-bold border border-amber-500/30">
                            Draft (Pending Approval)
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-zinc-400">
                        Paid To: <span className="text-zinc-200">{e.paidTo || 'N/A'}</span> • Mode: <span className="text-emerald-400 font-mono">{e.paymentMode}</span>
                      </div>
                    </div>
                    <div className="text-right space-y-1">
                      <div className="text-lg font-black text-emerald-400">₹{e.amount.toLocaleString()}</div>
                      {isDraft ? (
                        <button
                          onClick={() => handleApproveExpense(e.id)}
                          className="px-2.5 py-1 text-[11px] font-bold bg-amber-500 text-zinc-950 rounded-lg hover:bg-amber-400 shadow"
                        >
                          Approve Expense
                        </button>
                      ) : (
                        <div className="text-[10px] text-zinc-500">{e.dateLogged}</div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* SUB-TAB: FUND REQUISITIONS */}
      {activeSubTab === 'requisitions' && (
        <div className="space-y-2">
          {state.fundRequisitions.length === 0 ? (
            <div className="p-8 text-center bg-zinc-900/60 rounded-2xl border border-zinc-800">
              <DollarSign className="w-10 h-10 text-zinc-600 mx-auto mb-3" />
              <h3 className="font-bold text-sm text-zinc-300">No Fund Requisitions Submitted</h3>
            </div>
          ) : (
            <div className="space-y-2">
              {state.fundRequisitions.map((r) => (
                <div key={r.id} className="p-4 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-between">
                  <div>
                    <div className="text-sm font-bold text-white">{r.purpose}</div>
                    <div className="text-xs text-zinc-400 mt-0.5">Requested on: {r.dateRequested}</div>
                  </div>
                  <div className="text-right space-y-1">
                    <div className="text-lg font-black text-amber-400">₹{r.amountRequested.toLocaleString()}</div>
                    <span className="inline-block px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 text-[10px] font-bold border border-amber-500/30">
                      {r.status}
                    </span>
                    <div className="flex justify-end gap-1">
                      {r.status === 'PENDING' && (
                        <>
                          <button onClick={() => handleRequisitionStatus(r.id, 'APPROVED')} className="rounded bg-emerald-600 px-2 py-1 text-[10px] font-bold text-zinc-950">Approve</button>
                          <button onClick={() => handleRequisitionStatus(r.id, 'REJECTED')} className="rounded bg-red-700 px-2 py-1 text-[10px] font-bold text-white">Reject</button>
                        </>
                      )}
                      {r.status === 'APPROVED' && <button onClick={() => handleRequisitionStatus(r.id, 'RECEIVED')} className="rounded bg-sky-600 px-2 py-1 text-[10px] font-bold text-white">Mark received</button>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* MODAL: LOG EXPENSE */}
      {isExpenseModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl max-w-md w-full p-6 text-zinc-100 space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <h3 className="font-bold text-base text-white">+ Log Daily Site Expense</h3>
              <button onClick={() => setIsExpenseModalOpen(false)} className="text-zinc-500">✕</button>
            </div>
            <form onSubmit={handleAddExpense} className="space-y-3 text-xs">
              <div>
                <label className="block text-zinc-400 font-medium mb-1">Expense Category</label>
                <select
                  value={expenseForm.category}
                  onChange={(e) => setExpenseForm({ ...expenseForm, category: e.target.value })}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-xl p-2.5 text-white"
                >
                  {state.expenseCategories.map((c) => (
                    <option key={c.id} value={c.name}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-zinc-400 font-medium mb-1">Description / Notes</label>
                <input
                  type="text"
                  placeholder="e.g. Tea & Samosa for 15 workers"
                  value={expenseForm.description}
                  onChange={(e) => setExpenseForm({ ...expenseForm, description: e.target.value })}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-xl p-2.5 text-white"
                  required
                />
              </div>

              <div>
                <label className="block text-zinc-400 font-medium mb-1">Amount (₹)</label>
                <input
                  type="number"
                  placeholder="e.g. 450"
                  value={expenseForm.amount}
                  onChange={(e) => setExpenseForm({ ...expenseForm, amount: e.target.value })}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-xl p-2.5 text-white"
                  required
                />
              </div>

              <div>
                <label className="block text-zinc-400 font-medium mb-1">Paid To (Vendor / Stall / Person)</label>
                <input
                  type="text"
                  placeholder="e.g. Raju Tea Stall"
                  value={expenseForm.paidTo}
                  onChange={(e) => setExpenseForm({ ...expenseForm, paidTo: e.target.value })}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-xl p-2.5 text-white"
                />
              </div>

              <div>
                <label className="block text-zinc-400 font-medium mb-1">Payment Mode</label>
                <select
                  value={expenseForm.paymentMode}
                  onChange={(e) => setExpenseForm({ ...expenseForm, paymentMode: e.target.value as any })}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-xl p-2.5 text-white"
                >
                  <option value="CASH">Cash</option>
                  <option value="UPI">UPI / GPay / PhonePe</option>
                  <option value="BANK_TRANSFER">Bank Transfer</option>
                </select>
              </div>

              <div className="pt-2 flex justify-end space-x-2">
                <button type="button" onClick={() => setIsExpenseModalOpen(false)} className="px-4 py-2 rounded-xl bg-zinc-800">Cancel</button>
                <button type="submit" className="px-5 py-2 rounded-xl bg-emerald-500 text-zinc-950 font-bold">Save Expense</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: REQUEST FUNDS */}
      {isRequisitionModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl max-w-md w-full p-6 text-zinc-100 space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <h3 className="font-bold text-base text-white">Request Petty Cash Funds</h3>
              <button onClick={() => setIsRequisitionModalOpen(false)} className="text-zinc-500">✕</button>
            </div>
            <form onSubmit={handleAddRequisition} className="space-y-3 text-xs">
              <input
                type="number"
                placeholder="Amount Requested (₹)"
                value={reqForm.amountRequested}
                onChange={(e) => setReqForm({ ...reqForm, amountRequested: e.target.value })}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-xl p-2.5 text-white"
                required
              />
              <textarea
                placeholder="Purpose of fund requirement..."
                value={reqForm.purpose}
                onChange={(e) => setReqForm({ ...reqForm, purpose: e.target.value })}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-xl p-2.5 text-white h-24"
                required
              />
              <div className="pt-2 flex justify-end space-x-2">
                <button type="button" onClick={() => setIsRequisitionModalOpen(false)} className="px-4 py-2 rounded-xl bg-zinc-800">Cancel</button>
                <button type="submit" className="px-5 py-2 rounded-xl bg-amber-500 text-zinc-950 font-bold">Submit Request</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
