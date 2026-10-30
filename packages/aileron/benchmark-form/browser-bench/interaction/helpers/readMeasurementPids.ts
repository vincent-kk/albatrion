import { execFileSync } from 'node:child_process';

import { readAncestorPids } from './readAncestorPids';

/** Return runner/agent ancestors and current browser descendants, excluded from external CPU. */
export function readMeasurementPids() {
  const parents = execFileSync('ps', ['-axo', 'pid,ppid'], { encoding: 'utf8' })
    .trim()
    .split('\n')
    .slice(1)
    .map((line) => line.trim().split(/\s+/).map(Number));
  const descendants = [process.pid];
  for (let index = 0; index < descendants.length; index++)
    for (const [pid, parent] of parents)
      if (parent === descendants[index] && !descendants.includes(pid))
        descendants.push(pid);
  return [...readAncestorPids(), ...descendants];
}
