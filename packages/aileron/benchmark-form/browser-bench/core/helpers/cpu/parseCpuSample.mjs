// Canonical cumulative CPU parser used by browser sampling helpers.
import path from 'node:path';

/**
 * Parse ps cumulative CPU counters, retaining executable names without exposing command arguments.
 * @param {string} text Raw output from ps -axo pid,ppid,%cpu,time,comm.
 * @returns {Map<number, { name: string, seconds: number }>} Process counters keyed by PID; malformed lines are omitted.
 */
export function parseCpuSample(text) {
  const rows = new Map();
  for (const line of text.split('\n')) {
    const match = /^\s*(\d+)\s+(\d+)\s+([\d.]+)\s+([\d:.]+)\s+(.+)$/.exec(line);
    if (!match) continue;
    const seconds = match[4]
      .split(':')
      .reduce((sum, part) => sum * 60 + Number(part), 0);
    rows.set(Number(match[1]), { name: path.basename(match[5]), seconds });
  }
  return rows;
}
