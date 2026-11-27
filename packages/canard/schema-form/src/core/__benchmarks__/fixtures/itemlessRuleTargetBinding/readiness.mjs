import assert from 'node:assert/strict';
import cp from 'node:child_process';
import { createHash } from 'node:crypto';
import fs from 'node:fs';
import { createRequire } from 'node:module';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = process.cwd(),
  dir = path.dirname(fileURLToPath(import.meta.url)),
  require = createRequire(path.join(root, 'package.json')),
  ts = require('typescript');
const options = Object.fromEntries(
  process.argv.slice(2).map((x) => {
    const i = x.indexOf('=');
    return [x.slice(2, i), x.slice(i + 1)];
  }),
);
const out = path.resolve(root, options.out ?? '');
assert.ok(out.startsWith(path.join(root, '.seiri/tasks') + path.sep));
assert.ok(
  !fs.existsSync(out),
  'Fresh preparation is mandatory; cached output is rejected',
);
const inputFile = path.resolve(root, options.inputs ?? ''),
  inputs = JSON.parse(fs.readFileSync(inputFile, 'utf8'));
const hash = (x) => createHash('sha256').update(x).digest('hex'),
  sha = (p) => hash(fs.readFileSync(p));
assert.equal(sha(path.resolve(root, inputs.baseline)), inputs.baselineSHA256);
assert.equal(sha(path.resolve(root, inputs.candidate)), inputs.candidateSHA256);
const records = [];
const run = (name, command, args, expected = 0) => {
  const r = cp.spawnSync(command, args, {
    cwd: root,
    encoding: 'utf8',
    maxBuffer: 32 * 1024 * 1024,
  });
  const row = {
    name,
    command,
    args,
    cwd: root,
    exit: r.status,
    expected,
    stdout: r.stdout ?? '',
    stderr: r.stderr ?? '',
  };
  records.push(row);
  if (fs.existsSync(out))
    fs.writeFileSync(
      path.join(out, 'command-' + name + '.json'),
      JSON.stringify(row, null, 2) + '\n',
      { flag: 'wx' },
    );
  assert.equal(r.status, expected, name + ' failed: ' + row.stderr);
  if (expected === 1) assert.match(row.stderr, /AssertionError/);
  return row;
};
const core = path.join(root, 'packages/canard/schema-form/src/core');
const existingInputs = [
  path.join(root, 'package.json'),
  path.join(root, 'tsconfig.base.json'),
  path.join(root, 'packages/canard/schema-form/tsconfig.json'),
  path.join(core, 'engine/__tests__/fixtures/itemlessDeclarationsSource.ts'),
];
const sourceCounts = [];
for (const [name, expected] of [
  ['mount-cost', 8],
  ['observations', 21],
  ['operations', 13],
  ['fallback', 24],
]) {
  const file = path.join(
    core,
    'engine/__tests__/itemless-declarations.' + name + '.test.ts',
  );
  existingInputs.push(file);
  const bytes = fs.readFileSync(file, 'utf8'),
    ast = ts.createSourceFile(file, bytes, ts.ScriptTarget.Latest, true);
  const sizes = [];
  const visit = (n) => {
    if (
      ts.isCallExpression(n) &&
      ts.isPropertyAccessExpression(n.expression) &&
      n.expression.name.text === 'each'
    ) {
      let table = n.arguments[0];
      while (table && ts.isAsExpression(table)) table = table.expression;
      assert.ok(ts.isArrayLiteralExpression(table));
      sizes.push(table.elements.length);
    }
    ts.forEachChild(n, visit);
  };
  visit(ast);
  assert.deepEqual(sizes, [expected]);
  sourceCounts.push({ name, cases: expected, sha256: sha(file) });
}
const inputEpoch = existingInputs.map((file) => ({
  path: file,
  sha256: sha(file),
}));
run('prepare', 'node', [
  path.join(dir, 'prepare.mjs'),
  '--out=' + out,
  '--base=' + inputs.sourceBase,
  '--head=' + inputs.sourceHead,
  '--baseline=' + inputs.baseline,
  '--baseline-sha256=' + inputs.baselineSHA256,
  '--candidate=' + inputs.candidate,
  '--candidate-sha256=' + inputs.candidateSHA256,
]);
const manifest = JSON.parse(
  fs.readFileSync(path.join(out, 'manifest.json'), 'utf8'),
);
assert.equal(manifest.ids.length, 58);
assert.equal(manifest.prefixChecks.length, 2);
assert.ok(manifest.prefixChecks.every((c) => c.rejected));
for (const runtime of ['node', 'bun']) {
  run(runtime, runtime, [path.join(dir, 'cases.mjs'), '--out=' + out]);
  const result = JSON.parse(
    fs.readFileSync(path.join(out, 'gate-' + runtime + '.json'), 'utf8'),
  );
  assert.equal(result.marker, 'STANDALONE_BINDING_4_CASES_PASSED');
  assert.deepEqual(
    result.cases.map((c) => c.id),
    ['SB1', 'SB2', 'SB3', 'SB4'],
  );
  assert.ok(result.cases.every((c) => c.passed));
  assert.equal(result.version, runtime === 'node' ? 'v24.20.0' : '1.4.3');
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
for (const input of inputEpoch) assert.equal(sha(input.path), input.sha256);
assert.equal(sha(path.resolve(root, inputs.baseline)), inputs.baselineSHA256);
assert.equal(sha(path.resolve(root, inputs.candidate)), inputs.candidateSHA256);
const result = {
  marker: 'STANDALONE_BINDING_READY',
  inputFile,
  inputFileSHA256: sha(inputFile),
  inputFingerprint: manifest.inputFingerprint,
  inputEpoch,
  inputEpochSHA256: hash(JSON.stringify(inputEpoch)),
  sourceCounts,
  originalSourceCases: 66,
  sourceCasesExecuted: 0,
  plannedHelperVitestCases: 12,
  plannedVitestTotal: 78,
  standaloneCasesPerRuntime: 4,
  runtimes: ['node', 'bun'],
  runtimeCaseExecutions: 8,
  hiddenPrototypeDependencies: 0,
  explicitFrozenRawInputs: 2,
  readinessToolSHA256: sha(fileURLToPath(import.meta.url)),
  packageBuilds: 0,
  packageGates: 0,
  timing: 0,
  records: records.map(({ stdout, stderr, ...r }) => r),
};
fs.writeFileSync(
  path.join(out, 'readiness.json'),
  JSON.stringify(result, null, 2) + '\n',
  { flag: 'wx' },
);
console.log(
  JSON.stringify({
    marker: result.marker,
    out,
    inputFingerprint: result.inputFingerprint,
    inputEpochSHA256: result.inputEpochSHA256,
    standaloneCasesPerRuntime: 4,
    runtimeCaseExecutions: 8,
    originalSourceCases: 66,
    sourceCasesExecuted: 0,
    plannedHelperVitestCases: 12,
    plannedVitestTotal: 78,
    declaredTools: manifest.toolDeclarations,
    hiddenPrototypeDependencies: 0,
    explicitFrozenRawInputs: 2,
  }),
);
