// Invoked after sequential round-103 measurements; forced verdicts alone decide retention.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';

const directory = path.dirname(fileURLToPath(import.meta.url));
const operations = ['oneOf-5','oneOf-20','oneOf-40'].flatMap(name => ['mount','first','later'].map(mode => [name,mode]))
  .concat([['nested-d5-f4','mount'],['flat-500','mount'],['sample-0','mount'],['sample-0','later']]);

/** Finite nearest-rank quantile shared by row and pooled summaries. */
function quantile(values, probability) {
  return values.toSorted((a,b) => a-b)[Math.ceil(values.length * probability) - 1];
}

/** Deterministic ordinary bootstrap uncertainty copied from the canonical noise rule. */
function medianError(values) {
  let state = 101;
  const medians = [];
  for (let trial = 0; trial < 1999; trial++) {
    const sample = [];
    for (let index = 0; index < values.length; index++) {
      state ^= state << 13; state ^= state >>> 17; state ^= state << 5;
      sample.push(values[(state >>> 0) % values.length]);
    }
    medians.push(quantile(sample,.5));
  }
  const center = quantile(values,.5);
  return Math.max(Math.abs(quantile(medians,.005)-center), Math.abs(quantile(medians,.995)-center));
}

const windows = [], rows = [];
const read = (variant,name,mode,regime,run) => JSON.parse(fs.readFileSync(path.join(directory,
  `gates103-${variant}-${name}-${mode}-${regime}-r${run}.json`),'utf8'));
for (const [name,mode] of operations) {
  const verdict = [], steady = [], controls = [];
  for (const regime of ['forced','steady']) {
    const runs = regime === 'forced' ? 3 : 6;
    for (let run = 1; run <= runs; run++) {
      const control = read('control',name,mode,regime,run), working = read('working',name,mode,regime,run);
      for (const row of [control,working]) {
        assert.equal(row.head,'e60490572'); assert(row.freshProcess);
        assert.equal(row.warmup,20); assert.equal(row.samples,101);
        assert.equal(row.calls.head,121); assert.equal(row.calls.variant,121);
        assert.equal(row.timingsMs.head.length,101); assert.equal(row.timingsMs.variant.length,101);
        assert.equal(row.emptyTimingsMs.before.length + row.emptyTimingsMs.after.length,202);
        assert.deepEqual(row.observation.head,row.observation.variant);
        assert.equal(row.blockOrder,run % 2 ? 'H-first' : 'W-first');
        assert(row.elapsedMs < 480000);
        assert(!row.gc.some(event => regime === 'forced' && event.kind === 4 &&
          row.windows.some(window => event.start >= window.begin && event.start < window.end)));
        windows.push([row.started,row.ended]);
      }
      (regime === 'forced' ? verdict : steady).push(working);
      if (regime === 'forced') controls.push(control);
    }
  }
  const envelope = Math.max(...controls.flatMap(row => [Math.abs(row.gainMs),Math.abs(row.pairedMedianMs)]));
  const runs = verdict.map(row => {
    const residual = quantile([...row.emptyTimingsMs.before,...row.emptyTimingsMs.after].map(value => Math.abs(value-row.empty)),.95);
    const noise = Math.max(.001,envelope,residual + medianError(row.timingsMs.head) + medianError(row.timingsMs.variant));
    const sorted = row.pairedDeltasMs.toSorted((a,b)=>a-b);
    return { run:row.run,headMs:row.headMs,workingMs:row.workingMs,gainMs:row.gainMs,pairedMedianMs:row.pairedMedianMs,
      noiseMs:noise,pairedMedianInterval:[sorted[40],sorted[60]] };
  });
  const pooled = variant => quantile(steady.flatMap(row => row.timingsMs[variant].map(value=>value-row.empty)),.5);
  rows.push({ name,mode,verdictHeadMs:quantile(runs.map(row=>row.headMs),.5),
    verdictWorkingMs:quantile(runs.map(row=>row.workingMs),.5),verdictGainMs:quantile(runs.map(row=>row.gainMs),.5),
    controlEnvelopeMs:envelope,maxNoiseMs:Math.max(...runs.map(row=>row.noiseMs)),
    improved:runs.every(row=>row.gainMs > row.noiseMs && row.pairedMedianInterval[0] > 0),
    regressed:runs.some(row=>row.gainMs < -row.noiseMs && row.pairedMedianInterval[1] < 0),runs,
    steadyPooledHeadMs:pooled('head'),steadyPooledWorkingMs:pooled('variant'),
    steadyRuns:6,steadySamplesPerEngine:606,steadyBlockOrder:{headFirst:3,workingFirst:3} });
}
windows.sort((a,b)=>a[0]-b[0]);
for(let index=1;index<windows.length;index++) assert(windows[index-1][1] <= windows[index][0]);
const builds = ['head','control','working','head-count','working-count'].map(variant=>JSON.parse(fs.readFileSync(path.join(directory,`gates103-build-${variant}.json`),'utf8')));
assert.equal(builds[0].sha256,builds[1].sha256);
const bundles = '/private/tmp/claude-501/-Users-Vincent-Workspace-albatrion/c8aaf054-1ea7-43d3-b3c1-a4196f8407e1/scratchpad/bundles';
for(const build of builds){
  assert.equal(build.naturalServiceExits,1);
  assert.equal(build.sha256,createHash('sha256').update(fs.readFileSync(path.join(bundles,`gates103-${build.variant}.cjs`))).digest('hex'));
}
const processes = fs.readdirSync(directory).filter(name=>name.startsWith('gates103-process-')).map(name=>JSON.parse(fs.readFileSync(path.join(directory,name),'utf8')));
assert(processes.every(row=>row.naturalExit && row.status === 0 && row.signal === null && row.elapsedMs < 480000));
const counts = JSON.parse(fs.readFileSync(path.join(directory,'gates103-counts.json'),'utf8'));
const result = { head:'e60490572',kept:rows.some(row=>row.improved) && rows.every(row=>!row.regressed),
  verdictRule:'All three signed improvements exceed max(1us, byte-identical A/A envelope, empty p95 residual + bootstrap 99% median errors); any signed regression beyond noise vetoes. Steady uses only six-run pooled values.',
  rows,counts,workers:windows.length,maxWorkerMs:Math.max(...windows.map(([begin,end])=>end-begin)),
  maxCommandMs:Math.max(...processes.map(row=>row.elapsedMs)),naturalExitProcesses:processes.length,builds,
  setupIssues:['The first full-test output collector timed out at 60 seconds; no time measurement was running. Its result is excluded, and the designated checks were rerun with native process monitoring.'] };
const text = JSON.stringify(result,null,2)+'\n';
assert(Buffer.byteLength(text) <= 5000000);
fs.writeFileSync(path.join(directory,'gates103-summary.json'),text);
console.log('GATE_REUSE_MEASUREMENTS_VALID');
console.log(JSON.stringify({kept:result.kept,workers:result.workers,maxCommandMs:result.maxCommandMs,rows}));
