// CLI-only adapter of the committed 99C-01 profiler and 100 paired measurement method.
import assert from 'node:assert/strict';
import { execFileSync, spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import fs from 'node:fs';
import { createRequire } from 'node:module';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const script = fileURLToPath(import.meta.url);
const directory = path.resolve(path.dirname(script), '..');
const pkg = path.resolve(directory, '../../..');
const repo = path.resolve(pkg, '../../..');
const results = path.join(directory, 'profile-100c01');
const work = path.join(results, '.work');
const raw = '/private/tmp/claude-501/-Users-Vincent-Workspace-albatrion/c8aaf054-1ea7-43d3-b3c1-a4196f8407e1/scratchpad/prof';
const head = '0fdb6660ba07b94bafe3ff20e95b0025154ca490';
const require = createRequire(path.join(repo, 'package.json'));
const { TraceMap, originalPositionFor } = require('@jridgewell/trace-mapping');
const ts = require('typescript');
const fixtures = ['nested-d5-f4', 'flat-500', 'oneOf-20', 'sample-0'];
const operations = [...fixtures.map(name => [name, 'mount']), ['sample-0', 'later'], ['nested-d5-f4', 'later']];
assert.equal(fs.realpathSync(repo), '/Users/Vincent/Workspace/albatrion/.claude/worktrees/stage-07');
assert.equal(execFileSync('git', ['rev-parse', 'HEAD'], { cwd: repo, encoding: 'utf8' }).trim(), head);

/** Serialize bounded artifacts; timing arrays remain independent of report metadata. */
function save(file, value) {
  const write = (target, data) => {
    const text = JSON.stringify(data, null, 2) + '\n';
    assert(Buffer.byteLength(text) <= 5_000_000, target);
    fs.mkdirSync(path.dirname(target), { recursive: true });
    fs.writeFileSync(target, text);
  };
  if (value.timingsMs) {
    const { timingsMs, pairedDeltasMs, emptyTimingsMs, ...summary } = value;
    write(file, { timingsMs, pairedDeltasMs, emptyTimingsMs });
    write(file.replace(/\.json$/, '.summary.json'), summary);
  } else write(file, value);
}

/** Spawn exactly one worker; every subprocess and esbuild service exits naturally. */
function child(args) {
  const row = spawnSync(process.execPath, args, { cwd: repo,
    env: { ...process.env, NODE_ENV: 'production', GIT_OPTIONAL_LOCKS: '0' },
    encoding: 'utf8', maxBuffer: 5_000_000 });
  assert.equal(row.signal, null, row.stderr);
  assert.equal(row.status, 0, row.stderr || row.stdout);
  if (args.includes('--build-worker')) {
    const record = JSON.parse(row.stdout);
    save(path.join(results, 'build-' + record.variant + '.summary.json'), record);
    console.log(JSON.stringify({ variant: record.variant, bytes: record.bytes,
      sha256: record.sha256, naturalServiceExits: record.naturalServiceExits }));
  } else console.log(row.stdout.trim());
  return row.stdout.trim();
}

/** Preserve upstream timer anchors so changes cannot silently change the method. */
function replaceOnce(source, before, after) {
  assert.equal(source.split(before).length, 2, before.slice(0, 100));
  return source.replace(before, after);
}

/** Prepare fresh schemas outside analysis; only blueprint descendants are attributed. */
async function analysisWorker(name, targetMs) {
  const api = require(path.join(work, 'head.cjs'));
  const fixture = api.equivalentFixtures.find(row => row.name === name);
  assert(fixture, name);
  for (let i = 0; i < 20; i++) api.blueprint(structuredClone(fixture.workspace));
  globalThis.gc();
  const now = () => Number(process.hrtime.bigint() / 1000n);
  const beginUs = now();
  let operations = 0, last;
  while ((now() - beginUs) / 1000 < targetMs) {
    const schema = structuredClone(fixture.workspace);
    last = api.blueprint(schema);
    operations++;
  }
  const endUs = now();
  const meta = { head, name, beginUs, endUs, operations, targetMs, warmup: 20,
    intervalUs: 100, nodes: last.nodes.length, fragments: last.fragments.length,
    freshSchemaEachIteration: true, cacheProvided: false };
  save(path.join(results, `analysis-${name}.meta.json`), meta);
  console.log(JSON.stringify(meta));
}

/** Assign the closest stage boundary; recursive parent stages never double-count. */
function stageFor(stack) {
  for (const frame of stack) {
    const name = frame.function;
    if (/collectGateEvaluationReads/.test(name)) return 'gate read analysis';
    if (/collectDeclarations|collectSchemaCapabilities|readDiscriminatorBranches|createBlueprintGate|validateControlGroups/.test(name)) return 'declaration collection';
    if (/compileBlueprintExpressions|createDynamicFunction|getPathManager|registerBlueprintDependency|hasCompleteExpressionReads/.test(name)) return 'expression compilation';
    if (/validateShape|visitShape|validateChildTargets/.test(name)) return 'shape validation';
    if (/getTemplateKey|FeatureNodeIndex|DependencyIndex/.test(name)) return 'indexes';
    if (/freeze/i.test(name)) return 'freezing';
    if (/mergeEffectiveSchema|mergeSchemaContributions|mergeSchemaFragment/.test(name)) return 'static schema merge';
    if (/resolveNodeTypes|readAllowedTypes|intersectTypes|resolveNodeStrategy/.test(name)) return 'type and strategy';
    if (/populateNodeChildren|populateVirtualNodes/.test(name)) return 'child binding';
    if (/buildNodes/.test(name)) return 'buildNodes other';
    if (/collectBlueprintWarnings/.test(name)) return 'warning collection';
    if (frame.file?.includes('/utils/effectiveSchema/')) return 'static schema merge';
    if (frame.file?.includes('/utils/types/')) return 'type and strategy';
    if (frame.file?.includes('/utils/analyze/populateNodeChildren')) return 'child binding';
    if (frame.file?.includes('/utils/expressions/')) return 'expression compilation';
  }
  return 'blueprint orchestration / inlined freezing';
}

/** Map unchanged sampling frames; count recursive inclusive frames once per sample. */
function summarizeAnalysis(name) {
  const file = path.join(raw, `100c01-${name}-analysis.cpuprofile`);
  assert(fs.statSync(file).size <= 5_000_000, file);
  const profile = JSON.parse(fs.readFileSync(file, 'utf8'));
  const meta = JSON.parse(fs.readFileSync(path.join(results, `analysis-${name}.meta.json`), 'utf8'));
  const map = new TraceMap(JSON.parse(fs.readFileSync(path.join(work, 'head.cjs.map'), 'utf8')));
  const nodes = new Map(profile.nodes.map(node => [node.id, node]));
  const parents = new Map(), frames = new Map(), functions = new Map();
  for (const node of profile.nodes) for (const child of node.children ?? []) parents.set(child, node.id);
  for (const node of profile.nodes) {
    const cf = node.callFrame;
    let file = cf.url || '(V8)', line = cf.lineNumber + 1;
    if (file.endsWith('/head.cjs')) {
      const original = originalPositionFor(map, { line: Math.max(1, line), column: Math.max(0, cf.columnNumber) });
      if (original.source) { file = path.relative(repo, path.resolve(work, original.source)); line = original.line; }
    } else if (file.startsWith('file://')) file = path.relative(repo, fileURLToPath(file));
    const fn = cf.functionName || '(anonymous)';
    const key = `${fn}|${file}:${line}`;
    if (!functions.has(key)) functions.set(key, { function: fn, file, line, selfUs: 0, totalUs: 0, selfSamples: 0, totalSamples: 0 });
    frames.set(node.id, functions.get(key));
  }
  const stacks = new Map();
  for (const node of profile.nodes) {
    const stack = [];
    for (let id = node.id; id !== undefined; id = parents.get(id)) stack.push(frames.get(id));
    stacks.set(node.id, stack);
  }
  let timestamp = profile.startTime, selectedUs = 0, selectedSamples = 0, outsideUs = 0;
  const stages = new Map(), stageTotals = new Map();
  for (let i = 0; i < profile.samples.length; i++) {
    const delta = profile.timeDeltas[i]; timestamp += delta;
    if (timestamp < meta.beginUs || timestamp > meta.endUs) continue;
    const stack = stacks.get(profile.samples[i]);
    const boundary = stack.findIndex(frame => frame.function === 'blueprint');
    if (boundary < 0) { outsideUs += delta; continue; }
    const inside = stack.slice(0, boundary + 1);
    selectedUs += delta; selectedSamples++;
    inside[0].selfUs += delta; inside[0].selfSamples++;
    const visited = [];
    for (const frame of inside) if (!visited.includes(frame)) {
      visited.push(frame); frame.totalUs += delta; frame.totalSamples++;
    }
    const stage = stageFor(inside);
    stages.set(stage, (stages.get(stage) ?? 0) + delta);
    const seenStages = [];
    for (const frame of inside) {
      const owner = stageFor([frame]);
      if (!seenStages.includes(owner)) {
        seenStages.push(owner);
        stageTotals.set(owner, (stageTotals.get(owner) ?? 0) + delta);
      }
    }
  }
  assert(selectedSamples > 1000, `${name}: insufficient analysis samples`);
  const rows = [...functions.values()].filter(row => row.totalSamples).map(row => ({ ...row,
    selfMs: row.selfUs / 1000, totalMs: row.totalUs / 1000,
    selfPercent: row.selfUs / selectedUs * 100, totalPercent: row.totalUs / selectedUs * 100,
    stage: stageFor([row]), selfUsPerOperation: row.selfUs / meta.operations,
    totalUsPerOperation: row.totalUs / meta.operations })).sort((a, b) => b.selfUs - a.selfUs);
  const summary = { ...meta, rawProfile: file, rawBytes: fs.statSync(file).size,
    selectedMs: selectedUs / 1000, selectedSamples, outsideMs: outsideUs / 1000,
    denominator: 'blueprint descendant non-idle samples only; driver, cloning and orphan GC excluded',
    stagePolicy: 'nearest named stage, exclusive; native/inlined freezing cannot be separated from caller self',
    stages: [...stages].map(([stage, us]) => ({ stage, selfMs: us / 1000,
      selfPercent: us / selectedUs * 100, totalMs: (stageTotals.get(stage) ?? 0) / 1000,
      totalPercent: (stageTotals.get(stage) ?? 0) / selectedUs * 100 })).sort((a, b) => b.selfMs - a.selfMs),
    functions: rows, top25AndAtLeast2Percent: rows.filter((row, i) => i < 25 || row.selfPercent >= 2 || row.totalPercent >= 2) };
  save(path.join(results, `analysis-${name}.summary.json`), summary);
  console.log(JSON.stringify({ name, selectedSamples, selectedMs: summary.selectedMs, stages: summary.stages,
    top: rows.slice(0, 12).map(row => ({ fn: row.function, self: row.selfPercent, total: row.totalPercent, file: row.file, line: row.line })) }));
}

const [command, ...args] = process.argv.slice(2);
if (command === '--profiles') {
  fs.mkdirSync(raw, { recursive: true });
  for (const name of args.length ? args : fixtures) {
    child(['--expose-gc', '--cpu-prof', '--cpu-prof-interval=100', `--cpu-prof-dir=${raw}`,
      `--cpu-prof-name=100c01-${name}-analysis.cpuprofile`, script, '--analysis-worker', name, '3500']);
    summarizeAnalysis(name);
  }
} else if (command === '--analysis-worker') {
  await analysisWorker(args[0], Number(args[1]));
} else if (command === '--summarize-analysis') {
  for (const name of fixtures) summarizeAnalysis(name);
} else if (command === '--emit-fixture') {
  const canonical = path.join(pkg, 'src/core/__tests__/blueprint.branchless-differential.test.ts');
  const content = fs.readFileSync(canonical, 'utf8');
  const tree = ts.createSourceFile(canonical, content, ts.ScriptTarget.Latest, true);
  const tables = [];
  const visit = node => {
    if (ts.isVariableDeclaration(node) && node.name.getText(tree) === 'schemas' && ts.isArrayLiteralExpression(node.initializer))
      tables.push(node.initializer.getText(tree));
    ts.forEachChild(node, visit);
  };
  visit(tree); assert.equal(tables.length, 1);
  const compiled = ts.transpileModule('exports.schemas = ' + tables[0], {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
  const exports = {};
  new Function('exports', compiled)(exports);
  const { corpus } = await import(new URL('../../../spikes/guard-cost/redteam3/corpus.mjs', import.meta.url));
  const schemas = [...corpus.map(row => ({ label: row.id, schema: row.root })),
    ...exports.schemas.map((schema, index) => ({ label: '89C-03-edge-' + index, schema }))];
  assert.equal(corpus.length, 14); assert.equal(exports.schemas.length, 45); assert.equal(schemas.length, 59);
  const api = require(path.join(work, 'head.cjs'));
  const cases = schemas.map(({ label, schema }) => {
    const diagnostics = [];
    let expected;
    try {
      const b = api.blueprint(schema, { collect: d => diagnostics.push(d) });
      expected = { graph: { nodes: b.nodes.map(node => ({ ...node,
        childEntries: node.childEntries.map(entry => ({ ...entry, node: entry.node.id })),
        item: node.item?.id, prefixItems: node.prefixItems?.map(item => item.id) })),
        fragments: b.fragments, dependencies: b.dependencies,
        expressions: b.expressions.map(e => ({ ...e, evaluate: e.evaluate.toString() })) }, diagnostics };
    } catch (error) { expected = { error: { name: error.name, message: error.message,
      data: JSON.parse(JSON.stringify(error)) }, diagnostics }; }
    return { label, schema, expected };
  });
  const value = { head, canonical: path.relative(repo, canonical),
    canonicalSha256: createHash('sha256').update(content).digest('hex'), corpus: 14, edges: 45, cases };
  const json = JSON.stringify(value, (key, value) => key === 'stack' ? undefined : value, 2) + '\n';
  assert(Buffer.byteLength(json) <= 5_000_000);
  const target = path.join(pkg, 'src/core/blueprint/__tests__/fixtures/coldBindingHead.json');
  if (fs.existsSync(target)) {
    assert.deepEqual(JSON.parse(fs.readFileSync(target, 'utf8')), JSON.parse(json));
    console.log('HEAD_FIXTURE_IDENTICAL');
  } else console.log('*** Begin Patch\n*** Add File: ' + target + '\n+' +
    json.trimEnd().split('\n').join('\n+') + '\n*** End Patch');
} else if (command.startsWith('--check-')) {
  const read = name => JSON.parse(fs.readFileSync(path.join(directory, name), 'utf8'));
  const ab = read('profile-100c01-summary.json');
  const verdict = read('profile-100c01/verdict.summary.json');
  if (command === '--check-ab') {
    assert.equal(ab.head, head); assert.equal(ab.profiles.length, 4);
    assert.equal(ab.bounds.length, ab.artifactCounts.ablationJobs * 4);
    assert(ab.coverage.every(row => row.ids.length));
    for (const row of ab.bounds) for (const run of row.runs) {
      const data = read('profile-100c01/' + run.artifact);
      for (const values of [...Object.values(data.timingsMs), data.pairedDeltasMs,
        data.emptyTimingsMs.before, data.emptyTimingsMs.after])
        assert.equal(values.length, 101);
    }
    for (const profile of ab.profiles) {
      assert(profile.freshSchemaEachIteration && !profile.cacheProvided);
      assert(profile.selectedSamples > 1000 && fs.statSync(profile.rawProfile).size <= 5_000_000);
    }
    for (const name of fs.readdirSync(results)) {
      const file = path.join(results, name);
      if (fs.statSync(file).isFile()) assert(fs.statSync(file).size <= 5_000_000);
    }
    for (const name of ['profile-100c01.md', 'profile-100c01-summary.json'])
      assert(fs.statSync(path.join(directory, name)).size <= 5_000_000);
    assert(fs.readFileSync(path.join(directory, 'profile-100c01.md'), 'utf8').includes('5% coverage'));
    console.log('COLD_BLUEPRINT_AB_OK');
  } else if (command === '--check-tests') {
    const red = fs.readFileSync(path.join(results, 'tests-red.log'), 'utf8');
    assert(red.includes('length of 26 but got 51') && red.includes('1 failed | 2 passed'));
    for (const name of ['green', 'head']) assert(fs.readFileSync(path.join(results, 'tests-' + name + '.log'), 'utf8').includes('8 passed'));
    const fixture = JSON.parse(fs.readFileSync(path.join(pkg, 'src/core/blueprint/__tests__/fixtures/coldBindingHead.json'), 'utf8'));
    assert.equal(fixture.cases.length, 59); assert.equal(fixture.head, head);
    assert.equal(verdict.differential.cases, 59);
    assert(verdict.counts.some(row => row.variant === 'working' && row.name === 'nested-d5-f4' && row.declarationRecords === 1365));
    console.log('COLD_BLUEPRINT_TESTS_OK');
  } else if (command === '--check-c') {
    assert.equal(verdict.adopted, false); assert(verdict.productRestored);
    assert.equal(verdict.comparisons.length, 6);
    assert(verdict.comparisons.every(row => !row.aboveNoise && !row.resultChanged));
    for (const row of verdict.restored)
      assert.equal(createHash('sha256').update(fs.readFileSync(path.join(pkg, row.file))).digest('hex'), row.headSha256);
    const report = fs.readFileSync(path.join(directory, 'remeasure-86c02.md'), 'utf8');
    assert(report.includes('## 101라운드 콜드 청사진 자식 바인딩') && report.includes('**복구했습니다.**'));
    console.log('COLD_BLUEPRINT_C_OK');
  } else if (command === '--check-verification') {
    const checks = verdict.verification.checks;
    const vitest = checks.find(row => row.id === 'vitest');
    assert.equal(vitest.exitCode, 1); assert.equal(vitest.failures.length, 4);
    for (const project of ['render', 'react18'])
      assert.equal(vitest.failures.filter(line => line.includes('|' + project + '|') && line.includes('EVENT-070') && /through use(Layout)?Effect/.test(line)).length, 2);
    assert(vitest.summary.some(line => line.includes('3207 passed')));
    for (const id of ['tsc', 'eslint', 'isolation']) assert.equal(checks.find(row => row.id === id).exitCode, 0);
    assert(checks.every(row => row.signal === null && row.sourceRestored));
    assert(checks.find(row => row.id === 'isolation').summary.some(line => line.includes('LEGACY_ISOLATED: 1625 files checked')));
    console.log('COLD_BLUEPRINT_VERIFIED');
  } else throw new Error('Unknown check');
} else if (command === '--verify') {
  const commands = [
    ['vitest', 'npx', ['vitest', 'run', '--project', 'unit', '--project', 'render', '--project', 'react18', '--reporter=dot']],
    ['tsc', 'npx', ['tsc', '--noEmit', '--composite', 'false', '--rootDir', '.', '-p', 'tsconfig.json']],
    ['eslint', 'npx', ['eslint', 'src/**/*.{ts,tsx}']],
    ['isolation', 'node', ['architecture/verification/07-switch/tools/check-legacy-isolation.mjs']],
  ];
  const checks = [];
  for (const [id, executable, args] of commands) {
    const row = spawnSync(executable, args, { cwd: pkg,
      env: { ...process.env, npm_config_offline: 'true', npm_config_yes: 'false', GIT_OPTIONAL_LOCKS: '0' },
      encoding: 'utf8', maxBuffer: 50_000_000 });
    assert.equal(row.signal, null, id + ' must exit naturally');
    const log = (row.stdout ?? '') + (row.stderr ?? '');
    assert(Buffer.byteLength(log) <= 5_000_000, id + ' log size');
    fs.writeFileSync(path.join(results, 'verify-' + id + '.log'), log);
    const failures = log.split('\n').filter(line => /^ FAIL /.test(line));
    const summary = log.split('\n').filter(line => /Test Files|Tests\s+[0-9]|Duration|LEGACY_ISOLATED|error TS/.test(line));
    checks.push({ id, command: executable + ' ' + args.map(x => x.includes('*') ? JSON.stringify(x) : x).join(' '),
      exitCode: row.status, signal: row.signal, bytes: Buffer.byteLength(log), failures, summary,
      sourceRestored: ['src/core/blueprint/DETAIL.md', 'src/core/blueprint/utils/analyze/populateNodeChildren.ts'].every(file =>
        fs.readFileSync(path.join(pkg, file), 'utf8') === execFileSync('git', ['show', head + ':' + path.relative(repo, path.join(pkg, file))], { cwd: repo, encoding: 'utf8' })) });
    console.log(JSON.stringify(checks[checks.length - 1]));
  }
  save(path.join(results, 'verification.summary.json'), { head, sequential: true, noInstalls: true, checks });
} else if (command === '--build') {
  for (const variant of args) child([script, '--build-worker', variant]);
} else if (command === '--counts') {
  for (const variant of ['head', 'working']) for (const name of fixtures)
    child([script, '--count-worker', variant, name]);
} else if (command === '--count-worker') {
  const api = require(path.join(work, args[0] + '.cjs'));
  const fixture = api.equivalentFixtures.find(row => row.name === args[1]);
  assert(fixture);
  const freeze = Object.freeze;
  let declarationRecords = 0, freezeCalls = 0, analysis;
  Object.freeze = value => {
    freezeCalls++;
    if (value !== null && typeof value === 'object' && 'fragmentId' in value) declarationRecords++;
    return freeze(value);
  };
  try { analysis = api.blueprint(structuredClone(fixture.workspace)); }
  finally { Object.freeze = freeze; }
  const record = { head, variant: args[0], name: args[1], nodes: analysis.nodes.length,
    declarationRecords, freezeCalls, reusedEntryArrays: analysis.nodes.reduce((n, node) =>
      n + node.childEntries.filter(entry => entry.declarations === entry.node.declarations).length, 0),
    scope: 'separate count-only worker, never used for CPU sampling or timing' };
  save(path.join(results, 'count-' + args[0] + '-' + args[1] + '.summary.json'), record);
  console.log(JSON.stringify(record));
} else if (command === '--matrix') {
  const configs = JSON.parse(fs.readFileSync(path.join(results, 'ablations.json'), 'utf8'));
  for (const config of configs.filter(row => !args.length || args.includes(row.id))) {
    if (config.id !== 'control') child([script, '--build-worker', config.id]);
    for (const name of config.fixtures) for (let run = 1; run <= 3; run++)
      child(['--expose-gc', script, '--paired-worker', config.id, name, 'mount', String(run)]);
  }
} else if (command === '--compare') {
  child([script, '--build', 'working']);
  for (const [name, mode] of operations) {
    if (mode === 'later') for (let run = 1; run <= 3; run++)
      child(['--expose-gc', script, '--paired-worker', 'control', name, mode, String(run)]);
    for (let run = 1; run <= 3; run++)
      child(['--expose-gc', script, '--paired-worker', 'working', name, mode, String(run)]);
  }
} else if (command === '--build' || command === '--build-worker' || command === '--paired' || command === '--paired-worker') {
  let source = fs.readFileSync(path.join(directory, 'tools/profile-99c01.mjs'), 'utf8');
  source = replaceOnce(source, 'const script = fileURLToPath(import.meta.url);', `const script = ${JSON.stringify(script)};`);
  source = replaceOnce(source, "const work = path.join(output, '.profile-99c01-work');", `const work = ${JSON.stringify(work)};`);
  source = replaceOnce(source, "const head = '4ae9dced58bcbc05c05ff5907fca463af024c7b6';", `const head = ${JSON.stringify(head)};`);
  source = replaceOnce(source, "const edits = variant === 'head' || variant === 'old' ? [] :", "const edits = ['head', 'working', 'control'].includes(variant) ? [] :");
  source = source.replaceAll("profile-99c01/profile-99c01-ablations.json", 'profile-100c01/ablations.json');
  source = replaceOnce(source, "ablateSource(file, fs.readFileSync(file, 'utf8'), edits)", `(() => {
    const content = variant === 'working' ? fs.readFileSync(file, 'utf8') :
      execFileSync('git', ['show', head + ':' + path.relative(repo, file)], { cwd: repo, encoding: 'utf8' });
    let changed = ablateSource(file, content, edits);
    if (variant === 'freezing' && file.includes('/core/blueprint/')) {
      const tree = ts.createSourceFile(file, changed, ts.ScriptTarget.Latest, true);
      const transformed = ts.transform(tree, [context => {
        const visit = node => {
          const next = ts.visitEachChild(node, visit, context);
          if (!ts.isCallExpression(node) || node.expression.getText(tree) !== 'Object.freeze') return next;
          return ts.factory.createParenthesizedExpression(ts.factory.createConditionalExpression(
            ts.factory.createPropertyAccessExpression(ts.factory.createIdentifier('globalThis'), '__analysisFreezing'),
            undefined, next.arguments[0], undefined, next));
        };
        return root => ts.visitNode(root, visit);
      }]);
      changed = ts.createPrinter().printFile(transformed.transformed[0]);
      transformed.dispose();
      if (file.endsWith('/blueprint/blueprint.ts')) {
        const anchor = '): Blueprint => {';
        changed = changed.replace(anchor, anchor + '\\n const previous = globalThis.__analysisFreezing; globalThis.__analysisFreezing = globalThis.__profile99Ablating; try {');
        const last = changed.lastIndexOf('};');
        changed = changed.slice(0,last) + '} finally { globalThis.__analysisFreezing = previous; }' + changed.slice(last);
      }
    }
    return changed;
  })()`);
  source = replaceOnce(source, 'if (!globalThis.__profile99Ablating) return',
    "if (!globalThis.__profile99Ablating${edit.when ? ' || !(' + edit.when + ')' : ''}) return");
  source = replaceOnce(source, 'if (index < held.length) return held[index];',
    'if (index < held.length) { ${edit.replay ?? ""} return held[index]; }');
  source = replaceOnce(source, ': edit.body;', ": edit.body?.replaceAll('__ORIGINAL_BODY__', originalBody);");
  source = replaceOnce(source, '  const roots = {};', `  if (!['head', 'working', 'control'].includes(variant)) {
    globalThis.__profile99Ablating = false;
    globalThis.__analysisSeed = apis[variant].blueprint(structuredClone(fixtures[variant].workspace));
    if (variant === 'static-normalization') globalThis.__analysisEffective = globalThis.__analysisSeed.nodes.map(node =>
      apis[variant].mergeEffectiveSchema({ ...node, declarations: node.declarations.filter(d => d.context === 'conjunction') }, [], { mode: 'static' }));
  }
  const roots = {};`);
  source = replaceOnce(source, '`export {nodeFromJSONSchema} from', '`export {blueprint} from ' + path.join(pkg, 'src/core/blueprint/blueprint.ts') + ';\\nexport {nodeFromJSONSchema} from');
  // The upstream stdin uses a quoted path expression; keep the additional export independent.
  source = source.replace('export {blueprint} from ' + path.join(pkg, 'src/core/blueprint/blueprint.ts') + ';',
    'export {blueprint} from ' + JSON.stringify(path.join(pkg, 'src/core/blueprint/blueprint.ts')) + ';\\nexport {mergeEffectiveSchema} from ' + JSON.stringify(path.join(pkg, 'src/core/blueprint/utils/effectiveSchema/mergeEffectiveSchema.ts')) + ';');
  const begin = source.indexOf('function save(file, value) {');
  const end = source.indexOf('\n}\n', begin) + 2;
  source = source.slice(0, begin) + save.toString() + source.slice(end);
  source = source.replaceAll("path.join(output, 'profile-99c01',", "path.join(output, 'profile-100c01',");
  source = replaceOnce(source, 'i % 2 === 0 ? versions', '(i + run - 1) % 2 === 0 ? versions');
  source = replaceOnce(source, 'timingsMs: data, pairedDeltasMs: deltas',
    'timingsMs: data, pairedDeltasMs: deltas, emptyTimingsMs: { before: emptyBefore, after: emptyAfter }');
  await import('data:text/javascript;base64,' + Buffer.from(source).toString('base64'));
} else {
  throw new Error('Use --build, --profiles, --paired, --summarize-analysis');
}
