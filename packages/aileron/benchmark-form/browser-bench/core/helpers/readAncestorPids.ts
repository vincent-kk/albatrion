import { execFileSync } from 'node:child_process';

/**
 * Read ancestors of this runner for explicit exclusion of its agent and shell from the start gate.
 * @returns Existing parent PID chain, including the runner; does not exclude unrelated applications
 */
export function readAncestorPids() {
  const pids = [process.pid];
  for (let current = process.ppid; current > 1 && !pids.includes(current); ) {
    pids.push(current);
    current = Number(
      execFileSync('ps', ['-p', String(current), '-o', 'ppid='], {
        encoding: 'utf8',
      }).trim(),
    );
  }
  return pids;
}
