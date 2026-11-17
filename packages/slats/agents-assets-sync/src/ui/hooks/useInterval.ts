import { useEffect, useRef } from 'react';

import type { Fn } from '@aileron/declare';

export function useInterval(callback: Fn, delayMs: number | null): void {
  const saved = useRef(callback);

  useEffect(() => {
    saved.current = callback;
  }, [callback]);

  useEffect(() => {
    if (delayMs === null) return;
    const handle = setInterval(() => {
      saved.current();
    }, delayMs);
    return () => {
      clearInterval(handle);
    };
  }, [delayMs]);
}
