// CLI aggregation: 909 pooled paired differences, canonical seed/trials, and 105C-01 size floor.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';

const directory = path.dirname(fileURLToPath(import.meta.url));
const repo = path.resolve(directory, '../../../../../../..');
const bundles = '/private/tmp/claude-501/-Users-Vincent-Workspace-albatrion/c8aaf054-1ea7-43d3-b3c1-a4196f8407e1/scratchpad/bundles';
const HEAD = '9d1ea600a1916e66b0389318d81e1c3ee23ad0d3';
const started = Date.now();
const median = values => values.toSorted((a, b) => a - b)[Math.ceil(values.length / 2) - 1];
const read = name => JSON.parse(fs.readFileSync(path.join(directory, name + '.json'), 'utf8'));
const sha = value => createHash('sha256').update(value).digest('hex');
const operations = [['nested-d5-f4', 'mount'], ['flat-500', 'mount'], ['oneOf-20', 'mount'], ['sample-0', 'mount'],
  ['sample-0', 'first'], ['sample-0', 'later'], ['nested-d5-f4', 'first'], ['nested-d5-f4', 'later'],
  ['oneOf-40', 'first'], ['oneOf-40', 'later']];
const canonical = fs.readFileSync(path.resolve(directory, '../profile-104-owned/summarize.mjs'), 'utf8');
const begin = canonical.indexOf('function bootstrap(values)'), end = canonical.indexOf('\nconst builds =', begin);
assert(begin >= 0 && end > begin);
const bootstrapSource = canonical.slice(begin, end).replace('ci95: [medians[49], medians[1949]],',
  'ci95: [medians[49], medians[1949]], ci99: [medians[9], medians[1989]],');
const bootstrap = new Function('assert', 'started', 'median', bootstrapSource + '\nreturn bootstrap;')(assert, started, median);
const phase = process.argv[2];
const phases = ['AA', '1-build-own', '2-child-input-literal', '3-path-strings', '4-template-key'];
const labels = { mount: '마운트', first: '첫 갱신', later: '후속 갱신' };

function aggregate(phase) {
  const comparator = phase === 'AA' ? 'control' : 'working';
  const builds = { head: read(`${phase}-build-head`), working: read(`${phase}-build-${comparator}`) };
  for (const build of Object.values(builds)) {
    assert.equal(build.HEAD, HEAD); assert.equal(build.naturalBuildServices, 1);
  }
  if (phase === 'AA') assert.equal(builds.head.bundleSha256, builds.working.bundleSha256);
  const rows = [], processes = [];
  for (const [name, mode] of operations) {
    const deltas = [], base = [], working = [];
    for (let run = 1; run <= 9; run++) {
      const row = read(`${phase}-forced-${name}-${mode}-r${run}`);
      assert.equal(row.HEAD, HEAD); assert.equal(row.warmup, 20); assert.equal(row.samples, 101);
      assert.equal(row.freshProcess, true); assert.equal(row.forcedGCOutsideClock, true);
      assert.equal(row.comparator, comparator); assert.equal(row.windows.length, 202);
      assert.equal(row.pairedDeltasMs.length, 101); assert.equal(row.observations.head, row.observations.working);
      assert.equal(row.bundleSha256.head, builds.head.bundleSha256);
      assert.equal(row.bundleSha256.working, builds.working.bundleSha256);
      for (let index = 0; index < 101; index++) {
        assert.equal(row.pairedDeltasMs[index], row.timingsMs.head[index] - row.timingsMs.working[index]);
        const first = (index + run - 1) % 2 ? 'working' : 'head';
        assert.equal(row.windows[2 * index].version, first);
        assert.equal(row.windows[2 * index + 1].version, first === 'head' ? 'working' : 'head');
      }
      deltas.push(...row.pairedDeltasMs);
      base.push(...row.timingsMs.head.map(value => value - row.empty));
      working.push(...row.timingsMs.working.map(value => value - row.empty));
      const process = read(`${phase}-process-pair-forced-${name}-${mode}-${run}-${comparator}`);
      assert.equal(process.status, 0); assert.equal(process.signal, null); assert(process.elapsedMs < 480000);
      processes.push(process);
    }
    assert.equal(deltas.length, 909);
    const pooled = bootstrap(deltas), baseMedianMs = median(base);
    const aa = phase === 'AA' ? { pooledMedianMs: pooled.center } : read('AA-summary').rows.find(row => row.name === name && row.mode === mode);
    const aaStatisticMs = aa.pooledMedianMs, floorMs = baseMedianMs * 0.005;
    const regressionThresholdMs = Math.max(Math.abs(aaStatisticMs), floorMs);
    const improved = phase !== 'AA' && pooled.ci99[0] > 0 && pooled.center > aaStatisticMs;
    const regression = phase !== 'AA' && pooled.ci99[1] < 0 && Math.abs(pooled.center) > regressionThresholdMs;
    rows.push({ name, mode, pairs: 909, pooledMedianMs: pooled.center, ci99Ms: pooled.ci99, baseMedianMs,
      workingMedianMs: median(working), aaStatisticMs, floorMs, regressionThresholdMs, improved, regression,
      verdict: phase === 'AA' ? 'A/A 대조' : regression ? '회귀' : improved ? '개선' : '채택 조건 미충족' });
  }
  const result = { HEAD, phase, design: { runs: 9, warmup: 20, samples: 101, bootstrapTrials: 1999,
    bootstrapSeed: 101, canonicalSha256: sha(canonical), mode: 'production', difference: 'H−W' },
    builds, rows, adopted: phase !== 'AA' && rows.some(row => row.improved) && !rows.some(row => row.regression),
    processes, started: Math.min(...processes.map(row => row.started)), ended: Math.max(...processes.map(row => row.ended)) };
  const text = JSON.stringify(result, null, 2) + '\n'; assert(Buffer.byteLength(text) <= 5_000_000);
  fs.writeFileSync(path.join(directory, phase + '-summary.json'), text);
  console.log(`판정 ${phase}: ${phase === 'AA' ? '대조 완료' : result.adopted ? '채택' : '기각'}`);
  console.log('| fixture / 작업 | pooled 중앙값 ms | 99% 구간 ms | A/A 통계 ms | 기준 중앙값 ms | 0.5% 바닥 ms | 판정 |');
  console.log('| --- | ---: | --- | ---: | ---: | ---: | --- |');
  for (const row of rows) console.log(`| ${row.name} ${labels[row.mode]} | ${row.pooledMedianMs.toFixed(6)} | [${row.ci99Ms.map(value => value.toFixed(6)).join(', ')}] | ${row.aaStatisticMs.toFixed(6)} | ${row.baseMedianMs.toFixed(6)} | ${row.floorMs.toFixed(6)} | ${row.verdict} |`);
  return result;
}
if (phase === 'audit') {
  const summaries = phases.map(phase => read(phase + '-summary'));
  const processes = summaries.flatMap(summary => summary.processes).sort((a, b) => a.started - b.started);
  assert.equal(processes.length, 450);
  for (let index = 1; index < processes.length; index++) assert(processes[index].started >= processes[index - 1].ended);
  assert(processes.slice(0, 90).every(process => process.args.at(-1) === 'control'));
  let base = summaries[0].builds.head.sourceTreeSha256;
  let finalBuild = summaries[0].builds.head;
  for (const summary of summaries.slice(1)) {
    assert.equal(summary.builds.head.sourceTreeSha256, base);
    if (summary.adopted) {
      assert(fs.existsSync(path.join(directory, summary.phase + '.patch')));
      base = summary.builds.working.sourceTreeSha256;
      finalBuild = summary.builds.working;
    } else assert(!fs.existsSync(path.join(directory, summary.phase + '.patch')));
  }
  for (const [file, expected] of Object.entries(finalBuild.sources))
    assert.equal(sha(fs.readFileSync(path.join(repo, file))), expected, file);
  const buildProcesses = fs.readdirSync(directory).filter(file => /-process-build-/.test(file))
    .map(file => JSON.parse(fs.readFileSync(path.join(directory, file), 'utf8')));
  assert.equal(buildProcesses.length, 10);
  const allWorkers = [...processes, ...buildProcesses].sort((a, b) => a.started - b.started);
  for (const process of allWorkers) {
    assert.equal(process.status, 0); assert.equal(process.signal, null); assert(process.elapsedMs < 480000);
    assert.equal(process.driverSha256, sha(fs.readFileSync(path.join(directory, 'measure.mjs'))));
  }
  for (let index = 1; index < allWorkers.length; index++) assert(allWorkers[index].started >= allWorkers[index - 1].ended);
  for (const summary of summaries) for (const build of Object.values(summary.builds)) {
    const comparator = build.version;
    assert.equal(build.bundleSha256, sha(fs.readFileSync(path.join(bundles, `batch107-${summary.phase}-${comparator}.cjs`))));
  }
  const state = new Map();
  for (const summary of summaries.slice(1).filter(summary => summary.adopted)) {
    const baseline = read(summary.phase + '-base');
    for (const [file, text] of Object.entries(baseline.files)) {
      if (!state.has(file)) state.set(file, text);
      assert.equal(state.get(file), text, 'Patch measured base: ' + file);
    }
    applyPatch(state, fs.readFileSync(path.join(directory, summary.phase + '.patch'), 'utf8'));
  }
  for (const [file, text] of state) assert.equal(fs.readFileSync(path.join(repo, file), 'utf8'), text, file);
  for (const summary of summaries.slice(1).filter(summary => !summary.adopted)) {
    const baseline = read(summary.phase + '-base');
    for (const [file, text] of Object.entries(baseline.files)) {
      if (text === null) assert(!fs.existsSync(path.join(repo, file)), file);
      else if (!file.endsWith('/DETAIL.md')) assert.equal(fs.readFileSync(path.join(repo, file), 'utf8'), text, file);
    }
  }
  const rowDrivers = summaries.flatMap(summary => operations.map(([name, mode]) => read(`${summary.phase}-driver-${name}-${mode}`)));
  assert.equal(rowDrivers.length, 50);
  assert(rowDrivers.every(row => row.status === 0 && row.signal === null && row.elapsedMs < 480000));
  const gc = { totalInside: 0, majorInside: 0 };
  for (const summary of summaries) for (const [name, mode] of operations) for (let run = 1; run <= 9; run++) {
    const row = read(`${summary.phase}-forced-${name}-${mode}-r${run}`);
    for (const event of row.gc) if (row.windows.some(window => event.start >= window.begin && event.start < window.end)) {
      gc.totalInside++; if (event.kind === 4) gc.majorInside++;
    }
  }
  const audit = { HEAD, timerWorkers: 450, buildWorkers: 10, rowCommands: 50, pairedSamples: 45450,
    natural: true, sequential: true, aaFirst: true, measuredSourceMatchesFinal: true, patchChainMatchesFinal: true,
    maximumWorkerMs: Math.max(...allWorkers.map(row => row.elapsedMs)),
    maximumRowMs: Math.max(...rowDrivers.map(row => row.elapsedMs)),
    started: allWorkers[0].started, ended: allWorkers.at(-1).ended, gc };
  fs.writeFileSync(path.join(directory, 'audit.json'), JSON.stringify(audit, null, 2) + '\n');
  for (const file of fs.readdirSync(directory)) if (fs.statSync(path.join(directory, file)).isFile())
    assert(fs.statSync(path.join(directory, file)).size <= 5_000_000, file);
  console.log('BATCH107_MEASUREMENTS_OK');
} else { assert(phases.includes(phase)); aggregate(phase); }

/** Apply generated unified patches in memory, verifying every old/context line against its measured base. */
function applyPatch(state, patch) {
  const lines = patch.split('\n');
  let file, old, result, cursor;
  const finish = () => {
    if (!file) return;
    result.push(...old.slice(cursor));
    state.set(file, result.join('\n') + '\n');
  };
  for (let index = 0; index < lines.length; index++) {
    const line = lines[index];
    if (line.startsWith('diff --git ')) {
      finish(); file = line.match(/^diff --git a\/(.+) b\/(.+)$/)[1];
      const text = state.get(file);
      assert(text !== undefined, file);
      old = text === null ? [] : text.slice(0, -1).split('\n');
      result = []; cursor = 0;
    } else if (line.startsWith('@@ ')) {
      const start = Number(line.match(/^@@ -(\d+)/)[1]);
      const target = start === 0 ? 0 : start - 1;
      result.push(...old.slice(cursor, target)); cursor = target;
      while (index + 1 < lines.length && /^[ +\-]/.test(lines[index + 1]) &&
        !lines[index + 1].startsWith('--- ') && !lines[index + 1].startsWith('+++ ')) {
        const content = lines[++index];
        if (content[0] !== '+') { assert.equal(old[cursor], content.slice(1), file); cursor++; }
        if (content[0] !== '-') result.push(content.slice(1));
      }
    }
  }
  finish();
}
