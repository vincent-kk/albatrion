// Measurement CLI; loaded explicitly, all source transformations exist only in esbuild memory.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { createRequire } from 'node:module';
import { execFileSync, spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { performance, PerformanceObserver } from 'node:perf_hooks';
import inspector from 'node:inspector';

const script = fileURLToPath(import.meta.url);
const artifacts = path.dirname(script);
const directory = path.dirname(artifacts);
const pkg = path.resolve(directory, '../../..');
const repo = path.resolve(pkg, '../../..');
const head = '619798ddc6d6c70f27e1a7058421b94a4a6713b1';
const require = createRequire(path.join(repo, 'package.json'));
const ts = require('typescript');
const bundles = path.join(artifacts, 'bundles');
const fixtures = ['nested-d5-f4', 'flat-500', 'oneOf-20', 'sample-0'];
const variants = ['control', 'declarations', 'node-staging', 'child-bindings', 'effective-merge',
  'allowed-types', 'strategy-cases', 'template-keys', 'first-load-frames', 'runtime-nodes',
  'object-assembly', 'dependency-paths', 'gate-workspaces', 'selection-workspaces', 'dependency-index'];
const startedMs = Date.now(), started = new Date().toISOString();
assert.equal(fs.realpathSync(repo), '/Users/Vincent/Workspace/albatrion/.claude/worktrees/stage-07');
assert.equal(execFileSync('git', ['--no-optional-locks', 'rev-parse', 'HEAD'],
  { cwd: repo, encoding: 'utf8' }).trim(), head);

/** Save bounded artifacts only inside the requested directory. */
function save(file, value) {
  assert(path.resolve(file).startsWith(artifacts + path.sep));
  const text = JSON.stringify(value, null, 2) + '\n';
  assert(Buffer.byteLength(text) <= 5_000_000, file);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, text);
}

/** Replace one known anchor and fail before measurement when source has drifted. */
function once(source, before, after) {
  assert.equal(source.split(before).length, 2, before.slice(0, 120));
  return source.replace(before, after);
}

const helpers = `
const __allocTake = (site) => {
  const state = globalThis.__allocState;
  const at = state.cursors[site] ?? 0;
  state.cursors[site] = at + 1;
  const slot = state.slot ??= {};
  slot.tape = state.tapes[site] ??= []; slot.at = at; slot.replay = state.replay;
  return slot;
};
const __allocVector = (site) => {
  const { tape, at } = __allocTake(site);
  const result = tape[at] ??= [];
  result.length = 0;
  return result;
};
const __allocSet = (site) => {
  const { tape, at } = __allocTake(site);
  const result = tape[at] ??= new Set();
  result.clear();
  return result;
};
const __allocRecord = (site, prior) => {
  const { tape, at } = __allocTake(site);
  const result = tape[at] ??= Object.create(null);
  for (const key in result) delete result[key];
  if (prior) for (const key in prior) if (Object.hasOwn(prior, key)) result[key] = prior[key];
  return result;
};
const __allocGroup = (allowed, declarations) => {
  const { tape, at } = __allocTake('typeGroup');
  const result = tape[at] ??= [{ allowed, declarations }];
  result[0].allowed = allowed; result[0].declarations = declarations;
  return result;
};
const __allocFrame = (node, input, automatic, empty) => {
  const { tape, at } = __allocTake('loadFrame');
  const frame = tape[at] ??= {};
  frame.node = node; frame.input = input; frame.automatic = automatic;
  frame.entered = false; frame.index = 0; frame.entries = empty; frame.required = empty;
  frame.order = 0; frame.children = undefined;
  return frame;
};
`;

/** Find exactly one function using the repository's installed TypeScript parser. */
function functionBody(source, file, name, buildBody) {
  const tree = ts.createSourceFile(file, source, ts.ScriptTarget.Latest, true);
  const found = [];
  function visit(node) {
    const label = node.name?.getText(tree) ??
      ((ts.isArrowFunction(node) || ts.isFunctionExpression(node)) ? node.parent?.name?.getText(tree) : undefined);
    if (node.body && label === name) found.push(node);
    ts.forEachChild(node, visit);
  }
  visit(tree);
  assert.equal(found.length, 1, `${file}:${name}`);
  const body = found[0].body;
  const original = ts.isBlock(body) ? body.getText(tree) : `{ return ${body.getText(tree)}; }`;
  return source.slice(0, body.getStart(tree)) + buildBody(original) + source.slice(body.end);
}

/** Reuse the seeded immutable result; every replay bypasses the original structure producer. */
function taped(source, file, name, site = name, semanticKey) {
  if (semanticKey) return functionBody(source, file, name, original => `{
    const state = globalThis.__allocState;
    const __allocSemMemo = state.semantic[${JSON.stringify(site)}] ??= new Map();
    const __allocSemKey = ${semanticKey};
    if (state.replay) { if (!__allocSemMemo.has(__allocSemKey)) throw new Error('Semantic tape miss: ${site}:' + __allocSemKey); return __allocSemMemo.get(__allocSemKey); }
    const result = (() => ${original})(); __allocSemMemo.set(__allocSemKey, result); return result;
  }`);
  return functionBody(source, file, name, original => `{
    const { tape, at, replay } = __allocTake(${JSON.stringify(site)});
    if (replay) { if (at >= tape.length) throw new Error('Tape exhausted: ${site}:' + at); return tape[at]; }
    const result = (() => ${original})(); tape[at] = result; return result;
  }`);
}

/** Create one disposal-only variant, never writing transformed TypeScript to src. */
function transform(file, source, variant, appendHelpers = true, combined = false) {
  if (variant === 'combined-analysis') {
    let result = source;
    for (const item of ['declarations', 'node-staging', 'child-bindings', 'effective-merge',
      'allowed-types', 'strategy-cases', 'template-keys'])
      result = transform(file, result, item, false, true);
    return result === source ? source : result + '\n' + helpers;
  }
  const relative = path.relative(path.join(pkg, 'src'), file);
  let changed = source;
  if (variant === 'declarations' && relative.endsWith('/collectDeclarations.ts')) {
    changed = functionBody(source, file, 'collectDeclarations', original => `{
      const state = globalThis.__allocState;
      if (state.collectDepth) return (() => ${original})();
      const { tape, at, replay } = __allocTake('declarations');
      if (replay) {
        const held = tape[at]; if (!held) throw new Error('Declaration tape exhausted');
        for (const fragment of held.fragments) context.fragments.push(fragment);
        context.declarationId = held.nextId;
        Object.assign(context.capabilities, held.capabilities);
        if (held.owners) context.declarationOwners = held.owners;
        if (held.branches) context.discriminatorBranches = held.branches;
        return held.result;
      }
      const begin = context.fragments.length; state.collectDepth = 1;
      const result = (() => ${original})(); state.collectDepth = 0;
      tape[at] = { result, fragments: context.fragments.slice(begin), nextId: context.declarationId,
        capabilities: { ...context.capabilities }, owners: context.declarationOwners,
        branches: context.discriminatorBranches };
      return result;
    }`);
  }
  if (variant === 'node-staging' && relative.endsWith('/resolveNodeTypes.ts'))
    changed = taped(source, file, 'resolveNodeTypes');
  if (variant === 'node-staging' && relative.endsWith('/buildNodes.ts')) {
    changed = once(changed, '  const declarations = [];', '  let declarations;');
    changed = once(changed, '    for (let item = 0; item < collected.length; item++) declarations.push(collected[item]);',
      '    declarations = collected;');
    changed = once(changed, '    const ownedDeclarations = [];\n    const conjunctions = [];',
      '    const ownedDeclarations = group.declarations;\n    const conjunctions = group.declarations;');
    changed = once(changed, '      ownedDeclarations.push(owned);\n      if (owned.context === \'conjunction\') conjunctions.push(owned);', '      void owned;');
    changed = once(changed, '      {\n        ...node,\n        declarations: conjunctions,\n      },', '      node,');
    changed = once(changed, '  const nodes: MutableNode[] = [];', "  const nodes: MutableNode[] = __allocVector('builtNodes');");
    const begin = changed.indexOf('    const nonNull: SchemaTypeName[] = [];');
    const end = changed.indexOf('    const schemaType:', begin);
    assert(begin >= 0 && end > begin);
    changed = changed.slice(0, begin) + "    const nonNull = __allocNonNull(group.allowed);\n    const nullable = group.allowed.includes('null');\n" + changed.slice(end);
    changed += `\nconst __allocNonNull = (allowed) => {
      const { tape, at, replay } = __allocTake('nonNull');
      if (replay) { if (!tape[at]) throw new Error('Non-null tape exhausted'); return tape[at]; }
      const result = []; for (const value of allowed) if (value !== 'null') result.push(value);
      return tape[at] = result;
    };\n`;
  }
  if (variant === 'child-bindings' && relative.endsWith('/populateNodeChildren.ts')) {
    const begin = changed.indexOf('  const properties = '), end = changed.indexOf('  const entries = ');
    assert(begin >= 0 && end > begin);
    const prefix = changed.slice(begin, end);
    const helper = `\nconst __allocChildInputs = (context, node) => {
      const { tape, at, replay } = __allocTake('childInputs');
      if (replay) {
        const held = tape[at]; if (!held) throw new Error('Child input tape exhausted');
        for (const inputs of held.properties.values()) for (const input of inputs)
          if (input.fragment) input.fragment = context.fragments[input.fragment.id];
        for (const inputs of held.tuples.values()) for (const input of inputs)
          if (input.fragment) input.fragment = context.fragments[input.fragment.id];
        for (const input of held.itemInputs)
          if (input.fragment) input.fragment = context.fragments[input.fragment.id];
        return held;
      }
      ${prefix}
      return tape[at] = { properties, itemInputs, tuples };
    };\n`;
    changed = changed.slice(0, begin) + '  const { properties, itemInputs, tuples } = __allocChildInputs(context, node);\n' + changed.slice(end);
    const a = changed.indexOf('      const declarations = child.declarations.map(');
    const b = changed.indexOf('      entries.push(', a);
    assert(a >= 0 && b > a);
    const expression = changed.slice(a, b).trim().slice('const declarations = '.length, -1);
    changed = changed.slice(0, a) + '      const declarations = __allocBoundDeclarations(child, node, name, path, inputs);\n' + changed.slice(b);
    changed += helper + `\nconst __allocBoundDeclarations = (child, node, name, path, inputs) => {
      const { tape, at, replay } = __allocTake('boundDeclarations');
      if (replay) { if (!tape[at]) throw new Error('Child binding tape exhausted'); return tape[at]; }
      return tape[at] = ${expression};
    };\n`;
  }
  if (variant === 'effective-merge' && relative.endsWith('/mergeEffectiveSchema.ts'))
    changed = taped(source, file, 'mergeEffectiveSchema', 'mergeEffectiveSchema',
      combined ? "node.id + ':' + (options.mode ?? 'runtime') + ':' + activeDeclarationIds.join(',')" : undefined);
  if (variant === 'allowed-types' && relative.endsWith('/readAllowedTypes.ts'))
    changed = taped(source, file, 'readAllowedTypes', 'readAllowedTypes',
      combined ? "(typeof schema === 'boolean' ? String(schema) : JSON.stringify(schema.type) + ':' + Boolean(schema.nullable))" : undefined);
  if (variant === 'strategy-cases' && relative.endsWith('/resolveNodeStrategy.ts'))
    changed = taped(source, file, 'resolveNodeStrategy', 'resolveNodeStrategy',
      combined ? "kind + ':' + declarations.map(item => item.id).join(',')" : undefined);
  if (variant === 'template-keys' && relative.endsWith('/buildNodes.ts')) {
    const begin = changed.indexOf('  const key = getTemplateKey('), end = changed.indexOf('  const cached =', begin);
    assert(begin >= 0 && end > begin);
    const original = changed.slice(begin, end);
    changed = changed.slice(0, begin) + '  const { key, boundKey } = __allocTemplateKeys(context, inputs);\n' + changed.slice(end);
    changed += `\nconst __allocTemplateKeys = (context, inputs) => {
      const { tape, at, replay } = __allocTake('templateKeys');
      if (replay) { if (!tape[at]) throw new Error('Template key tape exhausted'); return tape[at]; }
      ${original}
      return tape[at] = { key, boundKey };
    };\n`;
  }
  if (variant === 'first-load-frames' && relative.endsWith('/loadStaticFirstTree.ts')) {
    changed = once(changed, '[{ node: root, input: undefined, automatic: false,\n    entered: false, index: 0, entries: EMPTY, required: EMPTY, order: 0, children: undefined }]',
      '[__allocFrame(root, undefined, false, EMPTY)]');
    changed = once(changed, '{ node: child, input, automatic: frame.automatic,\n        entered: false, index: 0, entries: EMPTY, required: EMPTY, order: 0, children: undefined }',
      '__allocFrame(child, input, frame.automatic, EMPTY)');
  }
  if (variant === 'runtime-nodes' && relative.endsWith('/schemaNodeFactory.ts'))
    changed = taped(source, file, 'createSchemaNode');
  if (variant === 'object-assembly' && relative.endsWith('/assembleObject.ts'))
    changed = taped(source, file, 'assembleObject');
  if (variant === 'dependency-paths' && relative.endsWith('/resolveDependencyPath.ts'))
    changed = taped(source, file, 'resolveDependencyPath');
  if (variant === 'gate-workspaces' && relative.endsWith('/evaluateGate.ts'))
    changed = taped(source, file, 'evaluateGate');
  if (variant === 'gate-workspaces' && relative.endsWith('/flushPendingGateReads.ts'))
    changed = functionBody(source, file, 'flushPendingGateReads', () => '{ return; }');
  if (variant === 'selection-workspaces' && relative.endsWith('/selectChildren.ts')) {
    changed = once(changed, 'const next: Record<string, Self> = { ...node.structure };',
      "const next: Record<string, Self> = __allocRecord('selectionNext', node.structure);");
    changed = once(changed, 'const seen = new Set<string>();', "const seen = __allocSet('selectionSeen');");
    changed = once(changed, 'const inactiveEntries: BlueprintChildEntry[] = [];',
      "const inactiveEntries: BlueprintChildEntry[] = __allocVector('selectionInactive');");
    changed = once(changed, 'const active: typeof entry.declarations[number][] = [];',
      "const active: typeof entry.declarations[number][] = __allocVector('selectionActive');");
    changed = once(changed, 'activeIds = [];', "activeIds = __allocVector('selectionIds');");
    changed = once(changed, 'const nextChildren = Object.values(next);',
      "const nextChildren = __allocVector('selectionChildren'); for (const name in next) if (Object.hasOwn(next, name)) nextChildren.push(next[name]);");
  }
  if (variant === 'dependency-index' && relative.endsWith('/getDependencyIndex.ts'))
    changed = taped(source, file, 'getDependencyIndex');
  if (changed !== source) {
    globalThis.__allocChanged.push(relative);
    if (appendHelpers) changed += '\n' + helpers;
  }
  return changed;
}

// Reuse the committed production builder and fixture/driver functions without invoking its CLI.
let canonical = fs.readFileSync(path.join(directory, 'tools/profile-99c01.mjs'), 'utf8');
canonical = canonical.slice(0, canonical.indexOf('const [command, ...args] = process.argv.slice(2);'));
canonical = once(canonical, 'const script = fileURLToPath(import.meta.url);',
  'const script = ' + JSON.stringify(path.join(directory, 'tools/profile-99c01.mjs')) + ';');
canonical = once(canonical, "const work = path.join(output, '.profile-99c01-work');", 'const work = ' + JSON.stringify(bundles) + ';');
canonical = once(canonical, "const head = '4ae9dced58bcbc05c05ff5907fca463af024c7b6';", 'const head = ' + JSON.stringify(head) + ';');
canonical = once(canonical, "  const edits = variant === 'head' || variant === 'old' ? [] :\n    JSON.parse(fs.readFileSync(path.join(output, 'profile-99c01/profile-99c01-ablations.json'), 'utf8')).find(item => item.id === variant)?.edits;", '  const edits = [];');
canonical = once(canonical, 'ablateSource(file, fs.readFileSync(file, \'utf8\'), edits)',
  "globalThis.__allocTransform(file, fs.readFileSync(file, 'utf8'), variant)");
canonical += '\nexport { buildAsync, fixtureFor, create, observe, environment };\n';
const api = await import('data:text/javascript;base64,' + Buffer.from(canonical).toString('base64'));

/** Fresh sequential worker, required to exit naturally; no timeout signal or forced process exit. */
function child(args) {
  assert(Date.now() - startedMs < 410_000, 'Split this command before eight minutes');
  const result = spawnSync(process.execPath, args, { cwd: repo,
    env: { ...process.env, NODE_ENV: 'production', GIT_OPTIONAL_LOCKS: '0' },
    encoding: 'utf8', maxBuffer: 5_000_000 });
  assert.equal(result.signal, null, result.stderr);
  assert.equal(result.status, 0, result.stderr || result.stdout);
  console.log(result.stdout.trim());
}

/** Nearest-rank statistics match the official regime; timing raw samples are retained. */
function metric(values) {
  const sorted = values.toSorted((a, b) => a - b);
  return { count: values.length, median: sorted[Math.ceil(sorted.length * .5) - 1],
    p5: sorted[Math.ceil(sorted.length * .05) - 1], p95: sorted[Math.ceil(sorted.length * .95) - 1],
    p99: sorted[Math.ceil(sorted.length * .99) - 1], mean: values.reduce((a, b) => a + b, 0) / values.length };
}

/** Capture the clock in the sentinel, after 64 microtask checkpoints, not after awaiting it. */
async function measured(operation) {
  const begin = performance.now();
  const root = operation();
  for (let i = 0; i < 64; i++) await Promise.resolve();
  const end = await new Promise(resolve => setImmediate(() => resolve(performance.now())));
  return { root, ms: end - begin, begin, end };
}

/** Seed a reuse tape outside all timing, then reset only its cursors for each fresh mount. */
async function load(variant, name, seedNow = true) {
  const engines = { head: require(path.join(bundles, 'head.cjs')), variant: require(path.join(bundles, variant + '.cjs')) };
  const fixture = api.fixtureFor(engines.head, name);
  globalThis.__allocState = { tapes: {}, semantic: {}, cursors: {}, replay: false, collectDepth: 0 };
  if (!seedNow) return { engines, fixture };
  const seed = await measured(() => api.create(engines.variant, fixture, variant, structuredClone(fixture.workspace)));
  globalThis.__allocSeed = seed.root;
  globalThis.__allocState.replay = true;
  return { engines, fixture, seed: api.observe(seed.root) };
}

/** One fresh pair process: warmup 20, 101 alternating pairs; clone and optional GC/check outside clock. */
async function timing(variant, name, run, regime) {
  assert(globalThis.gc);
  const { engines, fixture } = await load(variant, name, false);
  let seed;
  const actualMounts = { head: 0, variant: 0 };
  const data = { head: [], variant: [] }, last = {}, windows = [], gc = [], emptyBefore = [], emptyAfter = [];
  const observer = new PerformanceObserver(list => {
    for (const entry of list.getEntries()) gc.push({ start: entry.startTime, ms: entry.duration, kind: entry.detail.kind });
  });
  observer.observe({ entryTypes: ['gc'] });
  for (let i = 0; i < 101; i++) emptyBefore.push((await measured(() => {})).ms);
  for (let i = -20; i < 101; i++) {
    assert(Date.now() - startedMs < 420_000, 'Worker must finish before eight minutes');
    const order = i % 2 === (run % 2 ? 0 : 1) ? ['head', 'variant'] : ['variant', 'head'];
    for (const version of order) {
      const schema = structuredClone(fixture.workspace);
      globalThis.__allocState.cursors = {};
      if (regime === 'forced') { globalThis.gc(); await new Promise(resolve => setImmediate(resolve)); }
      actualMounts[version]++;
      const sample = await measured(() => api.create(engines[version], fixture, version === 'head' ? 'head' : variant, schema));
      if (version === 'variant' && !globalThis.__allocState.replay) {
        assert.equal(i, -20, 'Seed must be the first of exactly twenty warmups');
        globalThis.__allocSeed = sample.root;
        seed = api.observe(sample.root);
        globalThis.__allocState.replay = true;
      }
      last[version] = sample.root;
      if (i >= 0) { data[version].push(sample.ms); windows.push({ version, index: i, begin: sample.begin, end: sample.end }); }
    }
  }
  for (let i = 0; i < 101; i++) emptyAfter.push((await measured(() => {})).ms);
  await new Promise(resolve => setImmediate(resolve));
  observer.disconnect();
  const correction = metric([...emptyBefore, ...emptyAfter]).median;
  const metrics = Object.fromEntries(Object.entries(data).map(([k, v]) => [k, metric(v.map(ms => ms - correction))]));
  const tag = `${variant}-${name}-${regime}-r${run}`;
  assert.equal(actualMounts.head, 121); assert.equal(actualMounts.variant, 121);
  save(path.join(artifacts, tag + '.json'), { head, variant, name, run, regime, warmup: 20, samples: 101,
    started, ended: new Date().toISOString(), elapsedMs: Date.now() - startedMs,
    actualMounts, seedIsFirstWarmup: true,
    environment: api.environment(), execArgv: process.execArgv, forcedGC: regime === 'forced',
    correction, metrics, boundMs: metrics.head.median - metrics.variant.median,
    pairedDeltasMs: data.head.map((ms, i) => ms - data.variant[i]), timingsMs: data,
    emptyTimingsMs: { before: emptyBefore, after: emptyAfter }, windows, gc,
    seed, observations: Object.fromEntries(Object.entries(last).map(([k, v]) => [k, api.observe(v)])),
    tapeLengths: Object.fromEntries(Object.entries(globalThis.__allocState.tapes).map(([k, v]) => [k, v.length])) });
  console.log(JSON.stringify({ tag, headMs: metrics.head.median, variantMs: metrics.variant.median,
    boundMs: metrics.head.median - metrics.variant.median, seconds: (Date.now() - startedMs) / 1000 }));
}

/** A profiler-only check: one cold mount after warmup, never used as performance evidence. */
async function allocation(variant, name, run) {
  const { engines, fixture } = await load(variant, name);
  for (let i = 0; i < 20; i++) {
    globalThis.__allocState.cursors = {};
    await measured(() => api.create(engines.variant, fixture, variant, structuredClone(fixture.workspace)));
  }
  const schema = structuredClone(fixture.workspace);
  globalThis.__allocState.cursors = {};
  globalThis.gc(); await new Promise(resolve => setImmediate(resolve));
  const session = new inspector.Session(); session.connect();
  const post = (method, params = {}) => new Promise((resolve, reject) => session.post(method, params,
    (error, result) => error ? reject(error) : resolve(result)));
  await post('HeapProfiler.enable');
  await post('HeapProfiler.startSampling', { samplingInterval: 1,
    includeObjectsCollectedByMajorGC: true, includeObjectsCollectedByMinorGC: true });
  const sample = await measured(() => api.create(engines.variant, fixture, variant, schema));
  const { profile } = await post('HeapProfiler.stopSampling'); session.disconnect();
  const { TraceMap, originalPositionFor } = require('@jridgewell/trace-mapping');
  const sourceMap = new TraceMap(JSON.parse(fs.readFileSync(path.join(bundles, variant + '.cjs.map'), 'utf8')));
  const stacks = new Map();
  function visit(node, parents) {
    let { functionName: name, url, lineNumber: line, columnNumber: column } = node.callFrame;
    let file = url, sourceLine = line + 1;
    if (url.endsWith(variant + '.cjs')) {
      const mapped = originalPositionFor(sourceMap, { line: Math.max(1, line + 1), column: Math.max(0, column) });
      if (mapped.source) { file = path.relative(repo, path.resolve(bundles, mapped.source)); sourceLine = mapped.line; }
    }
    const stack = [{ name: name || '(anonymous)', file, line: sourceLine }, ...parents];
    stacks.set(node.id, stack);
    for (const child of node.children ?? []) visit(child, stack);
  }
  visit(profile.head, []);
  const rows = new Map(); let objects = 0, bytes = 0, blueprintObjects = 0, blueprintBytes = 0, unknown = 0;
  for (const s of profile.samples) {
    const stack = stacks.get(s.nodeId);
    if (!stack) { unknown++; continue; }
    const owner = stack.find(frame => frame.file.startsWith('packages/canard/schema-form/src/'));
    if (!owner && !stack.some(frame => frame.name === 'measured')) continue;
    const blueprint = stack.some(frame => frame.name === 'blueprint' && frame.file.endsWith('/blueprint/blueprint.ts'));
    objects++; bytes += s.size;
    if (blueprint) { blueprintObjects++; blueprintBytes += s.size; }
    const key = `${owner?.name ?? stack[0].name}|${owner?.file ?? stack[0].file}:${owner?.line ?? stack[0].line}`;
    const row = rows.get(key) ?? { owner, objects: 0, bytes: 0, blueprint };
    row.objects++; row.bytes += s.size; rows.set(key, row);
  }
  save(path.join(artifacts, `allocation-${variant}-${name}-r${run}.json`), {
    head, variant, name, run, warmup: 20, samplingIntervalBytes: 1,
    allocationFolding: true, includeCollected: true, objects, bytes, blueprintObjects, blueprintBytes, unknown,
    rows: [...rows.values()].toSorted((a, b) => b.objects - a.objects), observation: api.observe(sample.root),
    tapeLengths: Object.fromEntries(Object.entries(globalThis.__allocState.tapes).map(([k, v]) => [k, v.length])) });
  console.log(JSON.stringify({ variant, name, run, allocationObjects: objects, blueprintObjects,
    seconds: (Date.now() - startedMs) / 1000 }));
}

const [command, ...args] = process.argv.slice(2);
const tag = [command, ...args].join('_').replaceAll('/', '_');
process.once('exit', status => save(path.join(artifacts, 'process-' + tag + '.json'), {
  args: process.execArgv.concat([script, command, ...args]), started, ended: new Date().toISOString(),
  elapsedMs: Date.now() - startedMs, status, signal: null, pid: process.pid, freshProcess: true,
  driverSha256: createHash('sha256').update(fs.readFileSync(script)).digest('hex') }));
if (command === '--build-worker') {
  const variant = args[0]; assert(variant === 'head' || variant === 'combined-analysis' || variants.includes(variant));
  globalThis.__allocChanged = []; globalThis.__allocTransform = transform;
  const record = await api.buildAsync(variant);
  if (variant !== 'head' && variant !== 'control') assert(globalThis.__allocChanged.length > 0, variant);
  record.changedFiles = globalThis.__allocChanged;
  save(path.join(artifacts, 'build-' + variant + '.json'), record);
  console.log(JSON.stringify({ variant, changedFiles: record.changedFiles, bytes: record.bytes,
    naturalServiceExits: record.naturalServiceExits }));
} else if (command === '--build') {
  for (const variant of args.length ? args : ['head', ...variants]) child([script, '--build-worker', variant]);
} else if (command === '--timer-worker') {
  await timing(args[0], args[1], Number(args[2]), args[3]);
} else if (command === '--timers') {
  const variant = args[0], run = Number(args[1]);
  for (const name of args.length > 2 ? args.slice(2) : fixtures)
    for (const regime of run % 2 ? ['forced', 'steady'] : ['steady', 'forced'])
      child(['--expose-gc', script, '--timer-worker', variant, name, String(run), regime]);
} else if (command === '--matrix') {
  for (const run of args.length > 1 ? args.slice(1).map(Number) : [1, 2, 3])
    child([script, '--timers', args[0], String(run)]);
} else if (command === '--allocation-worker') {
  await allocation(args[0], args[1], Number(args[2] ?? 1));
} else if (command === '--allocations') {
  for (const name of args.length > 1 ? args.slice(1) : fixtures.slice(0, 3))
    child(['--expose-gc', '--sampling-heap-profiler-suppress-randomness', script,
      '--allocation-worker', args[0], name, '1']);
} else if (command === '--smokes') {
  for (const variant of args.length ? args : variants)
    for (const name of fixtures) child([script, '--smoke', variant, name]);
} else if (command === '--smoke') {
  const { engines, fixture, seed } = await load(args[0], args[1] ?? fixtures[0]);
  globalThis.__allocState.cursors = {};
  const first = await measured(() => api.create(engines.variant, fixture, args[0], structuredClone(fixture.workspace)));
  const observation = api.observe(first.root);
  console.log(JSON.stringify({ variant: args[0], name: fixture.name, seedHash: seed.sha256,
    observedHash: observation.sha256, liveWidth: observation.liveWidth,
    nodes: first.root.runtime.blueprint.nodes.length,
    tapeLengths: Object.fromEntries(Object.entries(globalThis.__allocState.tapes).map(([k, v]) => [k, v.length])) }));
} else throw new Error('Use --build, --timers variant run [fixtures], --allocations variant, --smoke variant fixture');
assert(Date.now() - startedMs < 480_000, 'Every command must finish within eight minutes');
