// usage: node --import ./register.mjs count.mjs <scenario> [ops] -> per-operation call counts of engine functions (V8 precise coverage)
import fs from 'node:fs';
import { Session } from 'node:inspector/promises';

import context from './context.mjs';
import { setup } from './fixtures.mjs';

const [scenario, opsArg = '50'] = process.argv.slice(2);
const ops = Number(opsArg);
const session = new Session();
session.connect();
await session.post('Profiler.enable');
await session.post('Profiler.startPreciseCoverage', {
  callCount: true,
  detailed: false,
});
const mods = { current: await import(new URL('current.mjs', context.engines)) };
const run = setup(scenario, 'current', mods);
for (let i = 0; i < 4; i++) run();
await session.post('Profiler.takePreciseCoverage'); // resets counters
for (let i = 0; i < ops; i++) run();
const { result } = await session.post('Profiler.takePreciseCoverage');
fs.mkdirSync(new URL(`${scenario}/`, context.profiles), { recursive: true });
fs.writeFileSync(
  new URL(`${scenario}/coverage.json`, context.profiles),
  JSON.stringify({ scenario, ops, result }),
);
await session.post('Profiler.stopPreciseCoverage');
session.disconnect();
const script = result.find((s) => s.url.endsWith('/engines/current.mjs'));
const text = fs.readFileSync(new URL('current.mjs', context.engines), 'utf8');
const lineStarts = [0];
for (let i = 0; i < text.length; i++)
  if (text.charCodeAt(i) === 10) lineStarts.push(i + 1);
const regions = [];
text.split('\n').forEach((l, i) => {
  const m = l.match(/^\/\/#region (.*)$/);
  if (m) regions.push([i, m[1]]);
});
const lineOf = (off) => {
  let lo = 0,
    hi = lineStarts.length - 1;
  while (lo < hi) {
    const m = (lo + hi + 1) >> 1;
    if (lineStarts[m] <= off) lo = m;
    else hi = m - 1;
  }
  return lo;
};
const regionOf = (line) => {
  let b = null;
  for (const r of regions) {
    if (r[0] <= line) b = r;
    else break;
  }
  return b ? b[1].replace(/^src\/core\/engine\//, '') : '?';
};
const rows = script.functions
  .filter((f) => f.ranges[0].count > 0 && f.functionName)
  .map((f) => ({
    name: f.functionName,
    file: regionOf(lineOf(f.ranges[0].startOffset)),
    perOp: f.ranges[0].count / ops,
  }))
  .sort((a, b) => b.perOp - a.perOp);
console.log(
  JSON.stringify({
    scenario,
    ops,
    functionsCalled: rows.length,
    totalCallsPerOp: Math.round(rows.reduce((s, r) => s + r.perOp, 0)),
  }),
);
for (const r of rows.slice(0, Number(process.argv[4] ?? 30)))
  console.log(`${r.perOp.toFixed(1).padStart(9)}  ${r.name}  ${r.file}`);
