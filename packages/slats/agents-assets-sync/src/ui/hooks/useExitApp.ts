import { useApp } from 'ink';
import { useEffect } from 'react';

import type { Fn } from '@aileron/declare';

interface UseExitAppOptions {
  readonly enabled: boolean;
  readonly exitCode: 0 | 1 | 2;
  readonly onExit: Fn<[code: 0 | 1 | 2]>;
  readonly delayMs?: number;
}

export function useExitApp({
  enabled,
  exitCode,
  onExit,
  delayMs = 0,
}: UseExitAppOptions): void {
  const { exit } = useApp();

  useEffect(() => {
    if (!enabled) return;
    const handle = setTimeout(() => {
      onExit(exitCode);
      exit();
    }, delayMs);
    return () => {
      clearTimeout(handle);
    };
  }, [enabled, exitCode, delayMs, exit, onExit]);
}
