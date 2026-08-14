import { useState, useEffect } from 'react';
import { getAppState, saveAppState, subscribeState, initializeAppStateFromSupabase, SiteOpsState } from '@/lib/dbState';

export function useSiteOpsState(): {
  state: SiteOpsState;
  updateState: (newState: Partial<SiteOpsState>) => void;
} {
  const [state, setState] = useState<SiteOpsState>(getAppState());

  useEffect(() => {
    // Initial async sync from Supabase
    initializeAppStateFromSupabase().then(latest => {
      setState({ ...latest });
    }).catch(err => {
      console.error('[SiteOps State] Error syncing initial state from Supabase:', err);
    });

    const unsubscribe = subscribeState(() => {
      setState({ ...getAppState() });
    });
    return () => unsubscribe();
  }, []);

  const updateState = (newState: Partial<SiteOpsState>) => {
    saveAppState(newState);
  };

  return { state, updateState };
}
