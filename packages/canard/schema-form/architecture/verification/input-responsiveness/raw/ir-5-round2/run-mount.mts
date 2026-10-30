// Loaded by node --import tsx from benchmark-form; argv selects frozen local bundles.
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { createRequire } from 'node:module';
import { pathToFileURL } from 'node:url';
const require = createRequire(path.resolve('package.json'));
const { chromium } = require('playwright');
const base = path.resolve('browser-bench/interaction/helpers');
const { samplePageWithCpu } = await import(pathToFileURL(path.join(base, 'samplePageWithCpu.ts')).href);
const { observeCpu } = await import(pathToFileURL(path.join(base, 'observeCpu.ts')).href);
const { readMeasurementPids } = await import(pathToFileURL(path.join(base, 'readMeasurementPids.ts')).href);
const root = process.argv[2];
const smoke = process.argv.includes('--smoke');
const warmup = smoke ? 0 : 3;
const count = smoke ? 1 : 10;
assert.ok(root && root.endsWith('.noindex'));
assert.ok(!fs.existsSync(path.join(root, 'round2-formal-start.json')), 'Never rerun a started window');
const inputs = JSON.parse(fs.readFileSync(path.join(root, 'inputs.json'), 'utf8'));
assert.deepEqual(inputs.lanes, ['E4', 'E5']);
const hash = file => createHash('sha256').update(fs.readFileSync(file)).digest('hex');
for (const lane of inputs.lanes) assert.equal(hash(path.join(root, lane, 'bundle.js')), inputs.bundles[lane].browser.sha256);
const cases = ['mount-flat-500-off','mount-flat-500-on','mount-nested-d5-f4-off','mount-nested-d5-f4-on','mount-array-1000-off','mount-array-1000-on'];
const startedAt = new Date().toISOString();
if (!smoke) fs.writeFileSync(path.join(root, 'round2-formal-start.json'), JSON.stringify({ startedAt, cases, warmup: 3, count: 10, mode: 'paired-relative', maximumMedianRatio: 1.02, offMetric: 'wallMs', onMetric: 'eagerPaintedMs' }, null, 2));
console.log(smoke ? 'IR5_MOUNT_SMOKE_START' : 'IR5_MOUNT_WINDOW_START quiet-observation=30000ms');
const quiet = smoke ? null : await observeCpu(30000, readMeasurementPids());
fs.writeFileSync(path.join(root, 'round2-start-cpu.json'), JSON.stringify(quiet, null, 2));
const browser = await chromium.launch({ headless: true });
const samples = [];
const warmups = [];
const out = path.join(root, smoke ? 'round2-smoke-raw' : 'round2-raw');
fs.mkdirSync(out);
try {
 for (const id of cases) {
  for (let index = -warmup; index < count; index++) {
   const lanes = index % 2 === 0 ? ['E4','E5'] : ['E5','E4'];
   for (const lane of lanes) {
    const record = await samplePageWithCpu(browser, root, lane, id);
    const filename = `${id}-${lane}-${index}.json`;
    const cleaned = JSON.stringify(record, (_key, value) => typeof value === 'string' ? value.replaceAll(root, '[frozen-root]') : value, 2);
    fs.writeFileSync(path.join(out, filename), cleaned);
    const row = { id, lane, index, file: filename, wallMs: record.mount.wallMs, eagerPaintedMs: record.mount.eagerPaintedMs, eagerDeferred: record.mount.eagerDeferred, allDeferred: record.mount.allDeferred };
    (index < 0 ? warmups : samples).push(row);
   }
  }
  console.log(`IR5_MOUNT_CASE_DONE ${id} ${warmup}warmup+${count}fresh/lane`);
 }
 const median = values => { const sorted = values.toSorted((a,b)=>a-b); const mid = sorted.length / 2; return sorted.length % 2 ? sorted[Math.floor(mid)] : (sorted[mid-1]+sorted[mid])/2; };
 const rows = cases.map(id => {
  const metric = id.endsWith('-off') ? 'wallMs' : 'eagerPaintedMs';
  const e4 = median(samples.filter(row=>row.id===id && row.lane==='E4').map(row=>row[metric]));
  const e5 = median(samples.filter(row=>row.id===id && row.lane==='E5').map(row=>row[metric]));
  return { id, metric, E4: e4, E5: e5, ratio: e5/e4, pass: e5/e4 <= 1.02 };
 });
 for (const lane of inputs.lanes) assert.equal(hash(path.join(root, lane, 'bundle.js')), inputs.bundles[lane].browser.sha256);
 const result = { smoke, startedAt, endedAt: new Date().toISOString(), mode: 'paired-relative-authorized-round2', warmup, count, chromium:browser.version(), inputs, quiet, samples, warmups, rows };
 fs.writeFileSync(path.join(root, smoke ? 'round2-smoke-complete.json' : 'round2-complete.json'), JSON.stringify(result,null,2));
 console.log('IR5_MOUNT_WINDOW_COMPLETE '+JSON.stringify(rows));
} catch (error) {
 fs.writeFileSync(path.join(root,'round2-failure.json'),JSON.stringify({ samples: samples.length, warmups: warmups.length, error:String(error) }));
 throw error;
} finally { await browser.close(); }
