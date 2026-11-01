import path from 'node:path';

/** Parse macOS ps cumulative CPU counters, retaining executable names without exposing command arguments. */
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
