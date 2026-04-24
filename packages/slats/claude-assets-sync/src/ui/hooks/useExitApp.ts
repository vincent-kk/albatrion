import { useApp } from 'ink';
import { useEffect } from 'react';

interface UseExitAppOptions {
  readonly enabled: boolean;
  readonly exitCode: 0 | 1 | 2;
  readonly onExit: (code: 0 | 1 | 2) => void;
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
