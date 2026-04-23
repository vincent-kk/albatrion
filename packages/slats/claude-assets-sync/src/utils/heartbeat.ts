import pc from 'picocolors';

export interface HeartbeatOptions {
  intervalMs?: number;
  emit?: (line: string) => void;
  label?: string;
}

export type StopHeartbeat = () => void;

/**
 * Wall-clock heartbeat ticker for long-running async operations.
 *
 * Wraps operations at the command layer (NOT core) to provide in-flight
 * visibility when stdout is quiet for several hundred milliseconds.
 *
 * The emitted line is written via the provided `emit` (default: stderr) so
 * it never interferes with programmatic stdout output.
 */
export function startHeartbeat(options: HeartbeatOptions = {}): StopHeartbeat {
  const intervalMs = options.intervalMs ?? 500;
  const label = options.label ?? 'working';
  const emit =
    options.emit ??
    ((line: string) => {
      process.stderr.write(line);
    });

  const startedAt = Date.now();
  const timer = setInterval(() => {
    const elapsedMs = Date.now() - startedAt;
    const seconds = (elapsedMs / 1000).toFixed(1);
    emit(`${pc.dim(`[${seconds}s]`)} ${pc.cyan(`${label}...`)}\n`);
  }, intervalMs);

  if (typeof timer.unref === 'function') timer.unref();

  return () => {
    clearInterval(timer);
  };
}
