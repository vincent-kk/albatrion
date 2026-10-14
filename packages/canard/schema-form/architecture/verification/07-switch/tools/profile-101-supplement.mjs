// Attribution CLI: adapts the committed harness in memory and reuses verified production bundles.
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { createHash } from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const script = fileURLToPath(import.meta.url);
const directory = path.resolve(path.dirname(script), '..');
const repo = path.resolve(directory, '../../../../../..');
const artifacts = path.join(directory, 'profile-101-gc/supplement');
const expectedHead = 'cbb66e885f7b72c7dcc7e71d1f427f5d193626f1';
const names = ['nested-d5-f4', 'flat-500', 'oneOf-20'];
const originalDirectory = path.join(directory, 'profile-101-gc');
fs.mkdirSync(artifacts, { recursive: true });

function once(source, before, after) {
  assert.equal(source.split(before).length, 2, `Adapter anchor: ${before.slice(0, 100)}`);
  return source.replace(before, after);
}

let source = fs.readFileSync(path.join(directory, 'tools/profile-101-gc.mjs'), 'utf8');
source = source.slice(0, source.lastIndexOf('const [command, ...args] = process.argv.slice(2);'));
source = once(source, '\nconst script = fileURLToPath(import.meta.url);', `\nconst script = ${JSON.stringify(script)};`);
source = once(source, "const artifacts = path.join(directory, 'profile-101-gc');", `const artifacts = ${JSON.stringify(artifacts)};`);
source = once(source, "const bundles = path.join(artifacts, 'bundles');", `const bundles = ${JSON.stringify(path.join(originalDirectory, 'bundles'))};`);
source = once(source, "const head = 'aee63933e43e3f8da442cf3ba7e7574f2aa16679';", `const head = ${JSON.stringify(expectedHead)};`);
source = once(source, 'const samplingInterval = 2048;', 'const samplingInterval = Number(process.env.PROFILE101_INTERVAL ?? 2048);');
source = once(source, "source += '\\nexport { buildAsync, fixtureFor, drain, create, observe, metric, environment };\\n';",
  "if (process.env.PROFILE101_FIXED_PROPS === '1') source = replaceOnce(source, \"...(fixture.name === 'computed-visible-derived' ? { defaultValue: { trigger: 'on', source: 1, target: 2 } } : {}),\", \"\");\n" +
  "if (process.env.PROFILE101_TRACE_LABELS === '1') source += '\\n//# sourceURL=" + path.join(directory, 'tools/profile-99c01.mjs') + "\\n';\n" +
  "source += '\\nexport { buildAsync, fixtureFor, drain, create, observe, metric, environment };\\n';");
source = once(source, "  const cpu = mode.startsWith('cpu');", "  const cpu = mode.startsWith('cpu');\n  const heapMode = mode.startsWith('objects');");
source = source.replaceAll("mode === 'heap'", 'heapMode');
source = once(source,
  'let blueprintBytes = 0, restBytes = 0, unknownBytes = 0, unknownSamples = 0, excludedBytes = 0, totalSampleBytes = 0;',
  'let blueprintBytes = 0, restBytes = 0, unknownBytes = 0, unknownSamples = 0, excludedBytes = 0, totalSampleBytes = 0;\n  let blueprintObjects = 0, restObjects = 0, excludedObjects = 0;');
source = once(source, 'if (!engine && !timedDriver) { excludedBytes += sample.size; continue; }',
  'if (!engine && !timedDriver) { excludedBytes += sample.size; excludedObjects++; continue; }');
source = once(source, 'if (blueprint) blueprintBytes += sample.size; else restBytes += sample.size;',
  'if (blueprint) { blueprintBytes += sample.size; blueprintObjects++; } else { restBytes += sample.size; restObjects++; }');
source = once(source, 'sampledAllocations: profile.samples.length, functions:',
  'objects: blueprintObjects + restObjects + unknownSamples, blueprintObjects, restObjects, unknownObjects: unknownSamples, excludedObjects,\n    sampledAllocations: profile.samples.length, functions:');
source = once(source,
  'const file = path.join(raw, `101-heap-${name}-${version}-vs-${variant}-r${run}-s${String(index).padStart(3, \'0\')}.heapprofile`);',
  'const file = path.join(raw, `101-${mode}-${name}-${version}-vs-${variant}-r${run}-s${String(index).padStart(3, \'0\')}.heapprofile`);');
source = once(source, '        save(file, profile);', '        saveSplitHeap(file, profile);');
source = once(source, 'summary.samplingIntervalBytes = samplingInterval;',
  'summary.samplingIntervalBytes = samplingInterval;\n    summary.objectCountMethod = "1-byte sampling; each retained or GC-collected allocation sample counts as one object. Not bytes divided by mean size.";');
source = once(source, 'summary.heap[version] = { bytesPerMount:',
  'summary.heap[version] = { objectsPerMount: average(heaps[version].map(mount => mount.objects)),\n        blueprintObjectsPerMount: average(heaps[version].map(mount => mount.blueprintObjects)),\n        restObjectsPerMount: average(heaps[version].map(mount => mount.restObjects)),\n        unknownObjectsPerMount: average(heaps[version].map(mount => mount.unknownObjects)),\n        excludedObjectsPerMount: average(heaps[version].map(mount => mount.excludedObjects)),\n        objectMetrics: metric(heaps[version].map(mount => mount.objects)), bytesPerMount:');
source = once(source, 'percent: row.bytes / heaps[version].reduce', 'objectsPerMount: row.samples / 101,\n          percent: row.bytes / heaps[version].reduce');
source = once(source, 'environment: environment(), emptyBefore:', 'environment: environment(), execArgv: process.execArgv, emptyBefore:');
source = once(source, '      const schema = structuredClone(',
  '      if (index >= 0 && mode.startsWith("trace")) console.log(`101_PREP_BEGIN ${version} ${index}`);\n      const schema = structuredClone(');
source = once(source, '      if (forcedGC) globalThis.gc();',
  '      if (forcedGC) {\n        if (index >= 0 && mode.startsWith("trace")) console.log(`101_GC_BEGIN ${version} ${index}`);\n        globalThis.gc();\n        if (index >= 0 && mode.startsWith("trace")) console.log(`101_GC_END ${version} ${index}`);\n      }');
source += `\nfunction saveSplitHeap(file, profile) {\n  const files = [];\n  for (let offset = 0; offset < profile.samples.length; offset += 30000) {\n    const part = file.replace(/\\.heapprofile$/, '-samples-' + String(files.length).padStart(3, '0') + '.json');\n    save(part, profile.samples.slice(offset, offset + 30000)); files.push(part);\n  }\n  save(file, { head: profile.head, sampleFiles: files, samples: profile.samples.length });\n}\nexport { paired, save, environment, mappedFrame, mapsFor };\n`;
if (process.env.PROFILE101_TRACE_LABELS === '1') source += '\n//# sourceURL=profile101-adapted-driver.mjs\n';
const adapted = await import('data:text/javascript;base64,' + Buffer.from(source).toString('base64'));
const { paired, save } = adapted;

for (const version of ['head', 'old']) {
  const record = JSON.parse(fs.readFileSync(path.join(originalDirectory, `build-${version}.summary.json`), 'utf8'));
  const sha = createHash('sha256').update(fs.readFileSync(path.join(originalDirectory, `bundles/${version}.cjs`))).digest('hex');
  assert.equal(sha, record.sha256, 'Production bundle must match the committed measurement');
}

function rotatingSink(prefix) {
  let number = 0, size = 0, fd, totalBytes = 0;
  const files = [];
  return {
    write(buffer) {
      let offset = 0;
      while (offset < buffer.length) {
        if (fd === undefined) {
          const file = path.join(artifacts, `${prefix}.part-${String(number++).padStart(4, '0')}.log`);
          files.push(file); fd = fs.openSync(file, 'w'); size = 0;
        }
        const length = Math.min(4_000_000 - size, buffer.length - offset);
        fs.writeSync(fd, buffer, offset, length); size += length; totalBytes += length; offset += length;
        if (size === 4_000_000) { fs.closeSync(fd); fd = undefined; }
      }
    },
    close() { if (fd !== undefined) fs.closeSync(fd); return { files, totalBytes }; },
  };
}

async function runChild(name, run, mode, semi, flags = []) {
  const tag = `${mode}-${name}-old-w20-r${run}`;
  const stdout = rotatingSink(tag + '-stdout'), stderr = rotatingSink(tag + '-stderr');
  const args = ['--expose-gc', ...(semi ? [`--max-semi-space-size=${semi}`] : []), ...flags,
    script, '--worker', name, String(run), mode];
  const started = new Date().toISOString();
  const child = spawn(process.execPath, args, { cwd: repo, env: { ...process.env, NODE_ENV: 'production',
    GIT_OPTIONAL_LOCKS: '0', PROFILE101_INTERVAL: mode.startsWith('objects') ? '1' : '2048',
    PROFILE101_TRACE_LABELS: mode.startsWith('trace') ? '1' : '0',
    PROFILE101_FIXED_PROPS: mode.includes('fixed-props') ? '1' : '0' },
    stdio: ['ignore', 'pipe', 'pipe'] });
  child.stdout.on('data', buffer => stdout.write(buffer));
  child.stderr.on('data', buffer => stderr.write(buffer));
  const [status, signal] = await new Promise((resolve, reject) => {
    child.once('error', reject); child.once('close', (code, signal) => resolve([code, signal]));
  });
  const record = { tag, args, started, ended: new Date().toISOString(), status, signal,
    stdout: stdout.close(), stderr: stderr.close() };
  save(path.join(artifacts, tag + '.process.json'), record);
  assert.equal(signal, null, `Child ended by signal: ${tag}`);
  assert.equal(status, 0, `Child failed naturally: ${tag}; inspect recorded stderr`);
  const row = JSON.parse(fs.readFileSync(path.join(artifacts, tag + '.summary.json'), 'utf8'));
  console.log(JSON.stringify({ tag, headMs: row.metrics.head.median, oldMs: row.metrics.old.median,
    blueprintMs: row.cpu?.head.phases.blueprint.msPerMount,
    headObjects: row.heap?.head.objectsPerMount, oldObjects: row.heap?.old.objectsPerMount,
    loggedBytes: record.stdout.totalBytes }));
}

const [command, ...args] = process.argv.slice(2);
if (command === '--worker') {
  await paired('old', args[0], Number(args[1]), args[2], 20);
} else if (command === '--matrix') {
  const mode = args[0] ?? 'supp-timer';
  for (const name of names) for (let run = 1; run <= 3; run++) {
    for (const semi of run === 2 ? [64, 0] : [0, 64])
      await runChild(name, run, `${mode}-${semi ? 'ss64' : 'default'}`, semi);
  }
} else if (command === '--objects') {
  for (const name of args.length ? args : names) for (let run = 1; run <= 3; run++)
    await runChild(name, run, 'objects-supp-default', 0, ['--sampling-heap-profiler-suppress-randomness']);
} else if (command === '--objects-nofold') {
  await runChild(args[0] ?? names[0], 1, 'objects-supp-nofold', 0, ['--sampling-heap-profiler-suppress-randomness',
    '--no-enable-allocation-folding', '--maglev-allocation-folding=0', '--no-turbo-allocation-folding']);
} else if (command === '--fixed-props') {
  for (const name of names) for (let run = 1; run <= 3; run++)
    await runChild(name, run, 'cpu-supp-fixed-props', 0);
} else if (command === '--trace') {
  const selected = args[0] ? [args[0]] : names, repetitions = Number(args[1] ?? 3), firstRun = Number(args[2] ?? 1);
  for (const name of selected) for (let run = firstRun; run <= repetitions; run++)
    await runChild(name, run, 'trace-supp-maps', 0, ['--trace-gc', '--trace-opt', '--trace-deopt',
      '--trace-deopt-verbose', '--trace-generalization', '--trace-compilation-dependencies',
      '--trace-file-names', '--log-maps', '--log-maps-details', '--log-code', '--log-source-position',
      '--log-deopt', '--no-logfile-per-isolate', '--logfile=-', '--print-maglev-code', '--print-opt-code']);
} else {
  throw new Error('Use --matrix [supp-timer|cpu-supp], --objects [fixture], or --trace [fixture] [repetitions].');
}
