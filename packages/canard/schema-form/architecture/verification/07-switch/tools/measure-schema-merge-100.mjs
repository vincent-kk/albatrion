// CLI verification adapts the committed 99C-01 paired timer in memory; source bundles are disposable.
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const script = fileURLToPath(import.meta.url);
const directory = path.resolve(path.dirname(script), '..');
const pkg = path.resolve(directory, '../../..');
const repo = path.resolve(pkg, '../../..');
const results = path.join(directory, 'schema-merge-100');
const expectedHead = '371dcaa45818eb326367cb2be84640d5fbaecca1';
const operations = [['nested-d5-f4', 'mount'], ['flat-500', 'mount'], ['oneOf-20', 'mount'],
  ['sample-0', 'mount'], ['sample-0', 'later'], ['nested-d5-f4', 'later']];
assert.equal(fs.realpathSync(repo), '/Users/Vincent/Workspace/albatrion/.claude/worktrees/stage-07');
assert(['--all', '--summarize', '--finalize', '--build', '--build-worker', '--paired-worker',
  '--count-worker'].includes(process.argv[2]), 'Only the worktree-local paired workflow is supported');

/** Run one EOF-terminating worker and reject signals or nonzero natural exits. */
function child(args) {
  const result = spawnSync(process.execPath, args, { cwd: repo,
    env: { ...process.env, NODE_ENV: 'production', GIT_OPTIONAL_LOCKS: '0' },
    encoding: 'utf8', maxBuffer: 5_000_000 });
  assert.equal(result.signal, null, result.stderr);
  assert.equal(result.status, 0, result.stderr || result.stdout);
  console.log(result.stdout.trim());
}

/** Preserve exact anchors so upstream timer changes fail instead of silently changing the method. */
function replaceOnce(source, before, after) {
  assert.equal(source.split(before).length, 2, `Unique adapter anchor: ${before.slice(0, 90)}`);
  return source.replace(before, after);
}

/** Save timing arrays separately; metadata and output evidence live only in summaries. */
function saveMeasurement(file, value) {
  const write = (target, data) => {
    const serialized = JSON.stringify(data, null, 2) + '\n';
    assert(Buffer.byteLength(serialized) <= 5_000_000, `Oversize measurement: ${target}`);
    fs.mkdirSync(path.dirname(target), { recursive: true });
    fs.writeFileSync(target, serialized);
  };
  if (value.timingsMs) {
    const { timingsMs, pairedDeltasMs, emptyTimingsMs, ...summary } = value;
    write(file, { timingsMs, pairedDeltasMs, emptyTimingsMs });
    write(file.replace(/\.json$/, '.summary.json'), summary);
  } else write(file.replace(/\.json$/, '.summary.json'), value);
}

if (process.argv[2] === '--all') {
  child([script, '--build', 'head', 'working', 'control', 'count-head', 'count-working']);
  for (const [name, mode] of operations) {
    for (let run = 1; run <= 3; run++)
      child(['--expose-gc', script, '--paired-worker', 'control', name, mode, String(run)]);
    for (let run = 1; run <= 3; run++)
      child(['--expose-gc', script, '--paired-worker', 'working', name, mode, String(run)]);
    if (mode === 'mount')
      for (const variant of ['count-head', 'count-working'])
        child([script, '--count-worker', variant, name]);
  }
  child([script, '--summarize']);
} else if (process.argv[2] === '--finalize') {
  const work = path.join(directory, '.schema-merge-100-work');
  const retained = JSON.parse(fs.readFileSync(path.join(results, 'verdict.summary.json'), 'utf8'));
  const read = file => {
    const target = path.join(work, file);
    if (fs.existsSync(target)) return fs.readFileSync(target, 'utf8');
    assert(retained.verification && retained.builds, 'Verification evidence must survive bundle cleanup');
    assert.equal(retained.verification.vitest.exitCode, 1);
    assert.equal(retained.verification.tsc.exitCode, 0);
    assert.equal(retained.verification.eslint.exitCode, 0);
    assert.equal(retained.verification.isolation.exitCode, 0);
    return {
      'verify-vitest.log': [...retained.verification.vitest.failures, ...retained.verification.vitest.summary].join('\n'),
      'verify-tsc.log': retained.verification.tsc.output,
      'verify-eslint.log': retained.verification.eslint.output,
      'verify-isolation.log': retained.verification.isolation.output,
      'builds.summary.json': JSON.stringify(retained.builds),
    }[file];
  };
  const log = read('verify-vitest.log');
  const failures = log.split('\n').filter(line => /^ FAIL /.test(line));
  assert.equal(failures.length, 4);
  assert(failures.every(line => /\|(render|react18)\|/.test(line) && line.includes('EVENT-070') &&
    /through use(Layout)?Effect/.test(line)));
  for (const project of ['render', 'react18'])
    assert.equal(failures.filter(line => line.includes(`|${project}|`)).length, 2);
  assert.match(log, /3204 passed/);
  assert.equal(read('verify-tsc.log').trim(), '');
  assert.equal(read('verify-eslint.log').trim(), '');
  assert.match(read('verify-isolation.log'), /LEGACY_ISOLATED: 1624 files checked/);
  const builds = JSON.parse(read('builds.summary.json'));
  assert(builds.records.every(record => record.naturalServiceExits === 1));
  assert.equal(builds.records.find(record => record.variant === 'head').sha256,
    builds.records.find(record => record.variant === 'control').sha256);
  const artifacts = ['schema-merge-100', 'schema-merge-100-v1'].map(name => {
    const files = fs.readdirSync(path.join(directory, name));
    let sampleBytes = 0, sampleFiles = 0, maxSampleBytes = 0, maxFileBytes = 0;
    for (const file of files) {
      const content = fs.readFileSync(path.join(directory, name, file), 'utf8');
      const bytes = Buffer.byteLength(content);
      assert(bytes <= 5_000_000);
      maxFileBytes = Math.max(maxFileBytes, bytes);
      if (file.endsWith('.summary.json')) continue;
      const data = JSON.parse(content);
      assert.deepEqual(Object.keys(data), ['timingsMs', 'pairedDeltasMs', 'emptyTimingsMs']);
      assert(Object.values(data.timingsMs).every(values => values.length === 101 && values.every(Number.isFinite)));
      sampleFiles++; sampleBytes += bytes; maxSampleBytes = Math.max(maxSampleBytes, bytes);
    }
    assert.equal(sampleFiles, 36);
    return { name, sampleFiles, sampleBytes, maxSampleBytes, maxFileBytes };
  });
  const verdict = JSON.parse(fs.readFileSync(path.join(results, 'verdict.summary.json'), 'utf8'));
  for (const source of verdict.workingSources)
    assert.equal(source.sha256, createHash('sha256').update(fs.readFileSync(path.join(pkg, source.file))).digest('hex'));
  verdict.verification = { vitest: { exitCode: 1, passed: 3204, failed: 4, todo: 1, failures,
    summary: log.split('\n').filter(line => /Test Files|Tests  |Duration /.test(line)).slice(-3) },
    tsc: { exitCode: 0, output: read('verify-tsc.log') },
    eslint: { exitCode: 0, output: read('verify-eslint.log') },
    isolation: { exitCode: 0, output: read('verify-isolation.log').trim() } };
  verdict.builds = builds;
  verdict.artifacts = artifacts;
  verdict.review = { type: 'grounded-only', independentAgent: false,
    scope: 'schema-merge only; ledger/public node shape/legacy unchanged' };
  verdict.harnessSha256 = createHash('sha256').update(fs.readFileSync(script)).digest('hex');
  for (const [name, before, after] of [['nested-d5-f4', 1365, 0], ['flat-500', 501, 0],
    ['oneOf-20', 10, 8], ['sample-0', 3, 0]]) {
    const head = verdict.counts.find(row => row.name === name && row.variant === 'count-head');
    const working = verdict.counts.find(row => row.name === name && row.variant === 'count-working');
    assert.equal(head.counts.runtime, before); assert.equal(working.counts.runtime, after);
    assert.equal(head.counts.static, working.counts.static);
    assert.deepEqual(head.observation, working.observation);
  }
  for (let index = 0; index < 3; index++)
    artifacts[0].maxFileBytes = Math.max(artifacts[0].maxFileBytes,
      Buffer.byteLength(JSON.stringify(verdict, null, 2) + '\n'));
  saveMeasurement(path.join(results, 'verdict.json'), verdict);
  console.log('SCHEMA_MERGE_VERIFIED', JSON.stringify({ adopted: verdict.adopted, artifacts,
    passed: verdict.verification.vitest.passed, allowedFailures: verdict.verification.vitest.failed }));
} else if (process.argv[2] === '--summarize') {
  const median = values => values.toSorted((a, b) => a - b)[Math.floor(values.length / 2)];
  const rows = operations.map(([name, mode]) => {
    const read = (variant, run) => JSON.parse(fs.readFileSync(path.join(results,
      `profile-99c01-paired-${variant}-${name}-${mode}-r${run}.summary.json`), 'utf8'));
    const control = [1, 2, 3].map(run => read('control', run));
    const working = [1, 2, 3].map(run => read('working', run));
    for (const row of [...control, ...working]) {
      assert.equal(row.head, expectedHead);
      assert.equal(row.warmup, 20); assert.equal(row.samples, 101);
      assert.deepEqual(row.observations.head, row.observations[row.variant]);
    }
    const noiseMs = Math.max(...control.flatMap(row => [Math.abs(row.boundMs), Math.abs(row.pairedDelta.median)]));
    const gains = working.map(row => row.boundMs);
    const medianIntervals = working.map(row => {
      const data = JSON.parse(fs.readFileSync(path.join(results,
        `profile-99c01-paired-working-${name}-${mode}-r${row.run}.json`), 'utf8'));
      const sorted = data.pairedDeltasMs.toSorted((a, b) => a - b);
      assert.equal(sorted.length, 101);
      return [sorted[40], sorted[60]];
    });
    const regressionAboveNoise = gains.every(value => value < -noiseMs) && medianIntervals.every(([, upper]) => upper < 0);
    return { name, mode, headMs: median(working.map(row => row.metrics.head.median)),
      workingMs: median(working.map(row => row.metrics.working.median)),
      medianGainMs: median(gains), pairedMedianMs: median(working.map(row => row.pairedDelta.median)),
      noiseMs, medianIntervals, aboveNoise: gains.every(value => value > noiseMs) && medianIntervals.every(([lower]) => lower > 0),
      regressionAboveNoise, noRegression: !regressionAboveNoise,
      strictEveryRunWithinNoise: gains.every(value => value >= -noiseMs),
      control, working };
  });
  const adopted = rows.some(row => row.mode === 'mount' && row.aboveNoise) && rows.every(row => row.noRegression);
  const summary = { head: expectedHead, method: '95C-01 sentinel / 99C-01 paired', warmup: 20,
    samples: 101, runs: 3, firstOrders: ['H-W', 'W-H', 'H-W'], sampleOrderAlternates: true,
    freshProcesses: true, sequential: true, adopted, rows,
    counts: fs.readdirSync(results).filter(name => name.startsWith('count-')).map(name =>
      JSON.parse(fs.readFileSync(path.join(results, name), 'utf8'))),
    decisionRule: '99C-01: 이득과 회귀 모두 3회 재현 및 paired median 구간을 요구합니다. 단일 회차 초과는 별도로 남깁니다.',
    harnessSha256: createHash('sha256').update(fs.readFileSync(script)).digest('hex'),
    workingSources: ['src/core/blueprint/utils/analyze/buildNodes.ts',
      'src/core/blueprint/utils/effectiveSchema/mergeEffectiveSchema.ts',
      'src/core/blueprint/utils/effectiveSchema/utils/constant.ts'].map(file => ({ file,
        sha256: createHash('sha256').update(fs.readFileSync(path.join(pkg, file))).digest('hex') })) };
  saveMeasurement(path.join(results, 'verdict.json'), summary);
  console.log(JSON.stringify({ adopted, rows: rows.map(({ name, mode, headMs, workingMs, medianGainMs,
    pairedMedianMs, noiseMs, aboveNoise, noRegression }) => ({ name, mode, headMs, workingMs,
    medianGainMs, pairedMedianMs, noiseMs, aboveNoise, noRegression })),
    counts: summary.counts.map(({ variant, name, counts, nodes }) => ({ variant, name, counts, nodes })) }));
} else {
  let source = fs.readFileSync(path.join(directory, 'tools/profile-99c01.mjs'), 'utf8');
  source = replaceOnce(source, 'const script = fileURLToPath(import.meta.url);', `const script = ${JSON.stringify(script)};`);
  source = replaceOnce(source, "const work = path.join(output, '.profile-99c01-work');",
    "const work = path.join(output, '.schema-merge-100-work');");
  source = replaceOnce(source, "const head = '4ae9dced58bcbc05c05ff5907fca463af024c7b6';",
    `const head = ${JSON.stringify(expectedHead)};`);
  source = replaceOnce(source, "  const edits = variant === 'head' || variant === 'old' ? [] :\n    JSON.parse(fs.readFileSync(path.join(output, 'profile-99c01/profile-99c01-ablations.json'), 'utf8')).find(item => item.id === variant)?.edits;",
    '  const edits = [];');
  source = replaceOnce(source, "ablateSource(file, fs.readFileSync(file, 'utf8'), edits)", `(() => {
    let content = variant === 'working' || variant === 'count-working' ? fs.readFileSync(file, 'utf8') :
      execFileSync('git', ['show', head + ':' + path.relative(repo, file)], { cwd: repo, encoding: 'utf8' });
    if (variant.startsWith('count-') && file.endsWith('/utils/mergeSchemaContributions.ts')) {
      const anchor = '): EffectiveSchema => {';
      assert.equal(content.split(anchor).length, 2);
      content = content.replace(anchor, anchor + '\\n  if (globalThis.__schemaMerge100Counts) globalThis.__schemaMerge100Counts[options.mode === "static" ? "static" : "runtime"]++;');
    }
    return content;
  })()`);
  const saveStart = source.indexOf('function save(file, value) {');
  const saveEnd = source.indexOf('\n}\n', saveStart) + 2;
  assert(saveStart > 0 && saveEnd > saveStart);
  source = source.slice(0, saveStart) + saveMeasurement.toString().replace('saveMeasurement', 'save') + source.slice(saveEnd);
  source = source.replaceAll("path.join(output, 'profile-99c01',", "path.join(output, 'schema-merge-100',");
  source = replaceOnce(source, 'i % 2 === 0 ? versions', '(i + run - 1) % 2 === 0 ? versions');
  source = replaceOnce(source, 'timingsMs: data, pairedDeltasMs: deltas',
    'timingsMs: data, pairedDeltasMs: deltas, emptyTimingsMs: { before: emptyBefore, after: emptyAfter }');
  source = replaceOnce(source, "} else if (command === '--paired-worker') {", `} else if (command === '--count-worker') {
    const api = require(path.join(work, args[0] + '.cjs'));
    const fixture = fixtureFor(api, args[1]);
    globalThis.__schemaMerge100Counts = { static: 0, runtime: 0 };
    const root = create(api, fixture, args[0]);
    await drain();
    const record = { variant: args[0], name: args[1], counts: globalThis.__schemaMerge100Counts,
      nodes: root.runtime.blueprint.nodes.length, observation: observe(root) };
    save(path.join(output, 'schema-merge-100', args[0] + '-' + args[1] + '.json'), record);
    console.log(JSON.stringify({ variant: args[0], name: args[1], counts: record.counts, nodes: record.nodes }));
  } else if (command === '--paired-worker') {`);
  await import('data:text/javascript;base64,' + Buffer.from(source).toString('base64'));
}
