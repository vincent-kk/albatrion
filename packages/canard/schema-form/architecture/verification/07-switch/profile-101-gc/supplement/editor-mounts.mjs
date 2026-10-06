// Measurement artifact: reuses the attribution harness in memory; invoked once per fresh paired process.
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const script = fileURLToPath(import.meta.url);
const artifacts = path.dirname(script);
const directory = path.resolve(artifacts, '../..');
const tool = path.join(directory, 'tools/profile-101-supplement.mjs');
const [name, runString, regime] = process.argv.slice(2);
assert(['nested-d5-f4', 'flat-500', 'oneOf-20', 'sample-0'].includes(name));
const run = Number(runString);
assert([1, 2, 3].includes(run));
assert(['forced', 'steady'].includes(regime));
assert(globalThis.gc);
const mode = `editor-timer-${regime}`;
const tag = `${mode}-${name}-old-w20-r${run}`;
const started = new Date().toISOString();
const startedMs = Date.now();

let adapter = fs.readFileSync(tool, 'utf8');
adapter = adapter.slice(0, adapter.lastIndexOf('const [command, ...args] = process.argv.slice(2);'));
const scriptAnchor = '\nconst script = fileURLToPath(import.meta.url);';
assert.equal(adapter.split(scriptAnchor).length, 2);
adapter = adapter.replace(scriptAnchor, `\nconst script = ${JSON.stringify(tool)};`);
const insertion = `
source = once(source, source.match(/^const raw = .+;$/m)[0], 'const raw = ' + JSON.stringify(path.join(artifacts, 'editor-raw')) + ';');
source = once(source, "const forcedGC = mode !== 'cpu-no-forced-gc' && mode !== 'trace-no-forced-gc';",
  "const forcedGC = mode !== 'editor-timer-steady' && mode !== 'cpu-no-forced-gc' && mode !== 'trace-no-forced-gc';");
source = once(source, '  const beginUs = clockUs();\\n  const beginMs = performance.now();\\n  const result = operation();\\n  await drain();\\n  const endMs = performance.now();\\n  const endUs = clockUs();',
  '  const beginUs = clockUs();\\n  const beginMs = performance.now();\\n  const result = operation();\\n  for (let turn = 0; turn < 64; turn++) await Promise.resolve();\\n  const endMs = await new Promise(resolve => setImmediate(() => resolve(performance.now())));\\n  const endUs = clockUs();');
source = once(source, "      if (index >= 0 && heapMode) await post('HeapProfiler.startSampling', {",
  "      if (forcedGC) await new Promise(resolve => setImmediate(resolve));\\n      if (index >= 0 && heapMode) await post('HeapProfiler.startSampling', {");
source = once(source, '  for (let index = -warmup; index < 101; index++) {',
  '  const selfDeadlineMs = Date.now() + 420000;\\n  for (let index = -warmup; index < 101; index++) {\\n    assert(Date.now() < selfDeadlineMs, "Measurement must finish naturally before eight minutes");');
source = once(source, 'const empty = (metric(emptyBefore).median + metric(emptyAfter).median) / 2;',
  'const controls = [...emptyBefore, ...emptyAfter].toSorted((a, b) => a - b);\\n  const empty = controls[Math.ceil(controls.length * .5) - 1];');
source = once(source, '{ timingsMs: data, pairedDeltasMs: deltas, windows, gc, gcEntries: events }',
  '{ emptyTimingsMs: { before: emptyBefore, after: emptyAfter }, timingsMs: data, pairedDeltasMs: deltas, windows, gc, gcEntries: events }');
`;
const importAnchor = "const adapted = await import('data:text/javascript;base64,' + Buffer.from(source).toString('base64'));";
assert.equal(adapter.split(importAnchor).length, 2);
adapter = adapter.replace(importAnchor, insertion + '\n' + importAnchor);
adapter += '\nexport { paired, save };\n';
const { paired, save } = await import('data:text/javascript;base64,' + Buffer.from(adapter).toString('base64'));
process.once('exit', status => {
  save(path.join(artifacts, tag + '.process.json'), {
    tag, args: process.execArgv.concat([script, name, runString, regime]),
    started, ended: new Date().toISOString(), elapsedMs: Date.now() - startedMs,
    status, signal: null, freshProcess: true, pid: process.pid,
    driverSha256: createHash('sha256').update(fs.readFileSync(script)).digest('hex'),
    method: '95C-01 validation-off: 64 microtask checkpoints, clock captured inside one setImmediate sentinel; pooled 202 empty controls, one common correction for both engines; forced GC and its check anchor outside clock.'
  });
});
await paired('old', name, run, mode, 20);
assert(Date.now() - startedMs < 480000);
