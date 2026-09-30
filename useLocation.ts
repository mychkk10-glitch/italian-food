import { useCallback, useEffect, useRef, useState } from 'react';
import type { LocationState } from '../types';
import { resolveLocation } from '../services/geolocation';

/**
 * 現在地（→ 料理地域）を解決するフック。
 * ensure() で「取得済みならそれを、取得中ならその完了を」待てる。
 */
export function useLocation() {
  const [location, setLocation] = useState<LocationState>({ status: 'idle' });
  const pending = useRef<Promise<LocationState> | null>(null);
  const latest = useRef<LocationState>(location);
  latest.current = location;

  const refresh = useCallback(() => {
    setLocation({ status: 'loading' });
    const p = resolveLocation()
      .catch((): LocationState => ({ status: 'unavailable', reason: 'error' }))
      .then((s) => {
        setLocation(s);
        pending.current = null;
        return s;
      });
    pending.current = p;
    return p;
  }, []);

  const ensure = useCallback(async (): Promise<LocationState> => {
    if (pending.current) return pending.current;
    const cur = latest.current;
    if (cur.status === 'ready' || cur.status === 'denied') return cur;
    return refresh();
  }, [refresh]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { location, refresh, ensure };
}
