'use client';

import React, { useState } from 'react';
import { AlertCircle, Building2, Loader2, LockKeyhole } from 'lucide-react';
import { isSupabaseConfigured, supabase } from '@/lib/supabaseClient';

export function AuthScreen() {
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!supabase) return;
    setBusy(true);
    setMessage(null);

    const result = mode === 'signin'
      ? await supabase.auth.signInWithPassword({ email: email.trim(), password })
      : await supabase.auth.signUp({ email: email.trim(), password });

    setBusy(false);
    if (result.error) {
      setMessage(result.error.message);
    } else if (mode === 'signup' && !result.data.session) {
      setMessage('Account created. Confirm your email, then sign in.');
    }
  };

  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-100 grid place-items-center p-4">
      <section className="w-full max-w-md rounded-2xl border border-zinc-800 bg-zinc-900 p-6 shadow-2xl">
        <div className="flex items-center gap-3 mb-6">
          <div className="rounded-xl bg-emerald-500/15 p-3 text-emerald-400"><Building2 size={26} /></div>
          <div>
            <h1 className="text-xl font-bold">ConstructTrack SiteOps</h1>
            <p className="text-sm text-zinc-400">Secure project workspace</p>
          </div>
        </div>

        {!isSupabaseConfigured ? (
          <div className="flex gap-3 rounded-xl border border-amber-800/60 bg-amber-950/30 p-4 text-sm text-amber-200">
            <AlertCircle className="shrink-0" size={20} />
            Configure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in your local .env file.
          </div>
        ) : (
          <form onSubmit={submit} className="space-y-4">
            <label className="block text-sm text-zinc-300">
              Email
              <input className="mt-1 w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2.5 outline-none focus:border-emerald-500" type="email" autoComplete="email" required value={email} onChange={e => setEmail(e.target.value)} />
            </label>
            <label className="block text-sm text-zinc-300">
              Password
              <input className="mt-1 w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2.5 outline-none focus:border-emerald-500" type="password" autoComplete={mode === 'signin' ? 'current-password' : 'new-password'} minLength={8} required value={password} onChange={e => setPassword(e.target.value)} />
            </label>
            {message && <div className="rounded-lg bg-zinc-800 px-3 py-2 text-sm text-zinc-200">{message}</div>}
            <button disabled={busy} className="flex w-full items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 py-2.5 font-semibold hover:bg-emerald-500 disabled:opacity-60">
              {busy ? <Loader2 className="animate-spin" size={18} /> : <LockKeyhole size={18} />}
              {mode === 'signin' ? 'Sign in' : 'Create account'}
            </button>
            <button type="button" onClick={() => { setMode(mode === 'signin' ? 'signup' : 'signin'); setMessage(null); }} className="w-full text-sm text-emerald-400 hover:text-emerald-300">
              {mode === 'signin' ? 'Need an account? Sign up' : 'Already have an account? Sign in'}
            </button>
          </form>
        )}
      </section>
    </main>
  );
}
