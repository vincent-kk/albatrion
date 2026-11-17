// Explicit untimed orchestration; raw artifacts and preparation directories are caller inputs.
import assert from 'node:assert/strict';
import cp from 'node:child_process';
import { createHash } from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = process.cwd();
const dir = path.dirname(fileURLToPath(import.meta.url));
const options = Object.fromEntries(
  process.argv.slice(2).map((value) => {
    const at = value.indexOf('=');
    assert.ok(at > 2);
    return [value.slice(2, at), value.slice(at + 1)];
  }),
);
assert.ok(
  options.out && options.inputs,
  'Explicit --out and --inputs are required',
);
const out = path.resolve(root, options.out);
assert.ok(
  out.startsWith(
    path.join(root, '.seiri/tasks/observation-identity-portability') + path.sep,
  ),
);
assert.ok(
  !fs.existsSync(out),
  'Fresh preparation is mandatory; cached output is rejected',
);
const inputFile = path.resolve(root, options.inputs);
const inputs = JSON.parse(fs.readFileSync(inputFile, 'utf8'));
const sha = (file) =>
  createHash('sha256').update(fs.readFileSync(file)).digest('hex');
assert.equal(sha(path.resolve(root, inputs.baseline)), inputs.baselineSHA256);
assert.equal(sha(path.resolve(root, inputs.candidate)), inputs.candidateSHA256);
assert.ok(inputs.rawProvenance, 'Fresh raw build provenance is mandatory');
const rawProvenance = JSON.parse(
  fs.readFileSync(path.resolve(root, inputs.rawProvenance), 'utf8'),
);
for (const lane of ['A', 'B']) {
  assert.equal(
    rawProvenance.lanes[lane].rawSHA256,
    lane === 'A' ? inputs.baselineSHA256 : inputs.candidateSHA256,
  );
  for (const input of rawProvenance.lanes[lane].inputs)
    assert.equal(sha(input.path), input.sha256);
}
const records = [];
const run = (name, command, args, expected = 0) => {
  const result = cp.spawnSync(command, args, {
    cwd: root,
    encoding: 'utf8',
    maxBuffer: 64 * 1024 * 1024,
  });
  const record = {
    name,
    command,
    args,
    cwd: root,
    exit: result.status,
    expected,
    stdout: result.stdout ?? '',
    stderr: result.stderr ?? '',
  };
  records.push(record);
  if (fs.existsSync(out))
    fs.writeFileSync(
      path.join(out, 'command-' + name + '.json'),
      JSON.stringify(record, null, 2) + '\n',
      { flag: 'wx' },
    );
  assert.equal(result.status, expected, name + ': ' + record.stderr);
  if (expected === 1) assert.match(record.stderr, /AssertionError/);
  return record;
};
const prepareArgs = [
  path.join(dir, 'prepare.mjs'),
  '--out=' + out,
  '--base=' + inputs.sourceBase,
  '--head=' + inputs.sourceHead,
  '--baseline=' + inputs.baseline,
  '--baseline-sha256=' + inputs.baselineSHA256,
  '--candidate=' + inputs.candidate,
  '--candidate-sha256=' + inputs.candidateSHA256,
];
run('prepare', 'node', prepareArgs);
const manifest = JSON.parse(
  fs.readFileSync(path.join(out, 'manifest.json'), 'utf8'),
);
assert.equal(manifest.schema, 'observation-identity-portability-v1');
assert.equal(manifest.ids.length, 58);
assert.equal(manifest.prefixChecks.length, 2);
assert.ok(manifest.prefixChecks.every((row) => row.rejected));
run('cached-output-negative', 'node', prepareArgs, 1);
const badArgs = prepareArgs.map((value) =>
  value.startsWith('--out=')
    ? value + '-bad-sha'
    : value.startsWith('--baseline-sha256=')
      ? '--baseline-sha256=' + '0'.repeat(64)
      : value,
);
run('bad-sha-negative', 'node', badArgs, 1);
for (const runtime of ['node', 'bun']) {
  run(runtime, runtime, [path.join(dir, 'cases.mjs'), '--out=' + out]);
  const result = JSON.parse(
    fs.readFileSync(path.join(out, 'gate-' + runtime + '.json'), 'utf8'),
  );
  assert.deepEqual(
    result.cases.map((row) => row.id),
    ['SB1', 'SB2', 'SB3', 'SB4'],
  );
  assert.ok(result.cases.every((row) => row.passed));
}
for (const runtime of ['node', 'bun'])
  for (const id of ['SB1', 'SB2', 'SB3', 'SB4'])
    run(
      runtime + '-negative-' + id,
      runtime,
      [
        path.join(dir, 'cases.mjs'),
        '--out=' + out,
        '--negative=wrong-module',
        '--case=' + id,
      ],
      1,
    );
for (const runtime of ['node', 'bun'])
  run('compare-' + runtime, runtime, [
    path.join(dir, 'compare.mjs'),
    '--out=' + out,
  ]);
const compatibility = ['node', 'bun'].map((runtime) => {
  const result = JSON.parse(
    fs.readFileSync(path.join(out, 'strict-' + runtime + '.json'), 'utf8'),
  );
  assert.equal(result.failures.length, 0);
  assert.equal(
    result.histories.length,
    manifest.ids.length * Object.keys(manifest.lanes).length,
  );
  assert.equal(result.comparisons.length, manifest.ids.length * 3);
  return {
    runtime,
    version: result.version,
    histories: result.histories.length,
    comparisons: result.comparisons.length,
  };
});
assert.equal(sha(path.resolve(root, inputs.baseline)), inputs.baselineSHA256);
assert.equal(sha(path.resolve(root, inputs.candidate)), inputs.candidateSHA256);
const result = {
  marker: 'OBSERVATION_IDENTITY_READY',
  schema: manifest.schema,
  inputFile,
  inputFileSHA256: sha(inputFile),
  rawProvenanceSHA256: sha(path.resolve(root, inputs.rawProvenance)),
  inputFingerprint: manifest.inputFingerprint,
  original58: manifest.ids,
  standaloneCasesPerRuntime: 4,
  compatibility,
  timing: 0,
  records: records.map(({ stdout, stderr, ...record }) => record),
};
fs.writeFileSync(
  path.join(out, 'readiness.json'),
  JSON.stringify(result, null, 2) + '\n',
  { flag: 'wx' },
);
console.log(JSON.stringify(result));
