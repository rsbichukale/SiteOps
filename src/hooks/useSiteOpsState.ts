import { useState, useEffect } from 'react';
import { getAppState, saveAppState, subscribeState, SiteOpsState } from '@/lib/dbState';
import { SupabaseSaveResult } from '@/lib/supabaseSync';

export function useSiteOpsState(): {
  state: SiteOpsState;
  updateState: (newState: Partial<SiteOpsState>) => Promise<SupabaseSaveResult>;
} {
  const [state, setState] = useState<SiteOpsState>(getAppState());

  useEffect(() => {
    const unsubscribe = subscribeState(() => {
      setState({ ...getAppState() });
    });
    return () => unsubscribe();
  }, []);

  const updateState = (newState: Partial<SiteOpsState>) => saveAppState(newState);

  return { state, updateState };
}
