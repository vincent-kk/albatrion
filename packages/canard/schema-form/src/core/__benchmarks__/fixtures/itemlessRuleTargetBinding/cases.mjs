import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import fs from 'node:fs';
import { createRequire } from 'node:module';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = process.cwd(),
  require = createRequire(import.meta.url);
const options = Object.fromEntries(
  process.argv.slice(2).map((x) => {
    const i = x.indexOf('=');
    return [x.slice(2, i), x.slice(i + 1)];
  }),
);
const out = path.resolve(root, options.out ?? '');
assert.ok(out.startsWith(path.join(root, '.seiri/tasks') + path.sep));
const manifest = JSON.parse(
  fs.readFileSync(path.join(out, 'manifest.json'), 'utf8'),
);
const hash = (x) => createHash('sha256').update(x).digest('hex'),
  sha = (p) => hash(fs.readFileSync(p));
for (const tool of manifest.tools) assert.equal(sha(tool.path), tool.sha256);
for (const input of manifest.lanes.source.inputs)
  assert.equal(sha(input.realPath), input.sha256);
for (const [label, lane] of Object.entries(manifest.lanes)) {
  assert.equal(sha(path.join(out, lane.path)), lane.sha256);
  if (label !== 'source') {
    const raw = fs.readFileSync(lane.inputPath, 'utf8');
    assert.equal(hash(raw), lane.rawSHA256);
    assert.equal(
      fs.readFileSync(path.join(out, lane.path), 'utf8'),
      raw + lane.executionFooter + lane.getter,
    );
  }
}
process.env.NODE_ENV = 'production';
const engines = {
  source: require(path.join(out, manifest.lanes.source.path)),
  A: await import(pathToFileURL(path.join(out, manifest.lanes.A.path)).href),
  B: await import(pathToFileURL(path.join(out, manifest.lanes.B.path)).href),
};
const fixture = await import(
  pathToFileURL(path.join(out, manifest.fixture.path)).href
);
for (const f of manifest.fixture.inputs) assert.equal(sha(f.path), f.sha256);
assert.equal(
  sha(path.join(out, manifest.fixture.path)),
  manifest.fixture.sha256,
);
const ts = require('typescript');
const getterAST = [];
for (const [label, lane] of Object.entries(manifest.lanes)) {
  const ast = ts.createSourceFile(
      lane.path,
      fs.readFileSync(path.join(out, lane.path), 'utf8'),
      ts.ScriptTarget.Latest,
      true,
      ts.ScriptKind.JS,
    ),
    declarations = [];
  for (const statement of ast.statements)
    if (ts.isVariableStatement(statement))
      declarations.push(...statement.declarationList.declarations);
  const found = declarations.filter(
    (d) =>
      ts.isIdentifier(d.name) && d.name.text === '__readExistingRuleOwnerId',
  );
  assert.equal(found.length, 1);
  const fn = found[0].initializer;
  assert.ok(ts.isArrowFunction(fn));
  assert.ok(ts.isCallExpression(fn.body));
  assert.ok(ts.isPropertyAccessExpression(fn.body.expression));
  assert.equal(fn.body.expression.name.text, 'get');
  assert.equal(fn.body.arguments.length, 1);
  assert.equal(
    fn.body.arguments[0].getText(ast),
    fn.parameters[0].name.getText(ast),
  );
  const mapName = fn.body.expression.expression.getText(ast);
  assert.equal(
    mapName,
    (label === 'source' ? lane.compiledBinding : lane.binding).mapName,
  );
  assert.equal(
    declarations.filter(
      (d) => ts.isIdentifier(d.name) && d.name.text === mapName,
    ).length,
    1,
  );
  getterAST.push({
    lane: label,
    mapName,
    getterLine:
      ast.getLineAndCharacterOfPosition(found[0].getStart(ast)).line + 1,
  });
}
const live = (rootNode) => {
  const nodes = [],
    stack = [rootNode];
  while (stack.length) {
    const n = stack.pop();
    if (nodes.includes(n)) continue;
    nodes.push(n);
    for (const c of n.children ?? []) stack.push(c);
  }
  return nodes;
};
function snapshotter() {
  const ids = new WeakMap();
  let next = 0;
  const id = (o) => {
    let n = ids.get(o);
    if (n === undefined) {
      n = ++next;
      ids.set(o, n);
    }
    return n;
  };
  return (rootValue) => {
    const seen = [];
    const enc = (v) => {
      if (v === undefined) return ['undefined'];
      if (typeof v === 'number' && !Number.isFinite(v))
        return ['number', String(v)];
      if (Object.is(v, -0)) return ['number', '-0'];
      if (typeof v === 'bigint' || typeof v === 'symbol')
        return [typeof v, String(v)];
      if (typeof v === 'function') return ['function', id(v)];
      if (v === null || typeof v !== 'object') return v;
      const n = id(v);
      if (seen.includes(v)) return ['ref', n];
      seen.push(v);
      if (v instanceof Map)
        return ['Map', n, [...v].map(([a, b]) => [enc(a), enc(b)])];
      if (v instanceof Set) return ['Set', n, [...v].map(enc)];
      if (v instanceof WeakMap || v instanceof WeakSet)
        return [v.constructor.name, n, 'opaque'];
      const d = Object.getOwnPropertyDescriptors(v);
      return [
        Array.isArray(v) ? 'array' : 'object',
        n,
        Reflect.ownKeys(d).map((k) => [
          String(k),
          'value' in d[k]
            ? enc(d[k].value)
            : [
                'accessor',
                d[k].get ? id(d[k].get) : null,
                d[k].set ? id(d[k].set) : null,
              ],
        ]),
      ];
    };
    return JSON.stringify(enc(rootValue));
  };
}
function ownerOf(key, known, getter) {
  const nodes = new WeakMap(known.map((n, i) => [n, i + 1]));
  const normalize = fixture.createRuleTargetIdentity(
    () => known,
    getter,
    nodes,
  );
  const local = JSON.parse(normalize(key))[7][1];
  return known[local - 1];
}
function form(engine) {
  const tree = engine.buildFieldNodeTree({
      jsonSchema: {
        type: 'object',
        properties: {
          source: {
            type: 'number',
            controls: { injectTo: (value) => ({ '../target': value }) },
          },
          target: { type: 'number' },
        },
      },
      defaultValue: { source: 1, target: 0 },
    }),
    events = [];
  engine.subscribeFieldNode(tree, (e) => events.push(e));
  engine.mountFieldNode(tree);
  const known = live(tree),
    owner = known.find((n) => n.path === '/source'),
    destination = known.find((n) => n.path === '/target');
  const keys = [...tree.runtime.committedRuleValues.keys()].filter(
    (k) => JSON.parse(k).length === 8,
  );
  assert.equal(keys.length, 1);
  return {
    tree,
    known,
    owner,
    destination,
    key: keys[0],
    parts: JSON.parse(keys[0]),
    events,
  };
}
const runtime = process.versions.bun ? 'bun' : 'node',
  result = {
    runtime,
    version: process.versions.bun ?? process.version,
    caseRole: '4 explicit standalone cases; not Vitest cases',
    cases: [],
    getterAST,
    inputFingerprint: manifest.inputFingerprint,
    gateToolSHA256: sha(fileURLToPath(import.meta.url)),
  },
  forms = {};
const cases = [
  {
    id: 'SB1',
    name: 'known rule owner versus injection destination',
    run() {
      const rows = [];
      for (const [label, engine] of Object.entries(engines)) {
        const f = form(engine);
        forms[label] = f;
        const getter =
          options.negative === 'wrong-module' && label === 'source'
            ? engines.A.__readExistingRuleOwnerId
            : engine.__readExistingRuleOwnerId;
        assert.notEqual(f.owner, f.destination);
        assert.equal(getter(f.owner), f.parts[7]);
        assert.equal(getter(f.destination), undefined);
        assert.equal(ownerOf(f.key, f.known, getter), f.owner);
        assert.equal(f.parts[0], f.owner.path);
        assert.equal(f.parts[5], f.owner.path);
        assert.equal(f.owner.value, f.destination.value);
        assert.ok(
          f.tree.runtime.committedRuleKeysBySource.get(f.parts[0]).has(f.key),
        );
        assert.ok(
          f.tree.runtime.committedRuleKeysByTarget.get(f.parts[5]).has(f.key),
        );
        assert.ok(
          !f.tree.runtime.committedRuleKeysByTarget.get('/target')?.has(f.key),
        );
        rows.push({
          lane: label,
          id: f.parts[7],
          ownerPath: f.owner.path,
          destinationPath: f.destination.path,
          firstSevenUnchanged: true,
          forwardReverseMembership: true,
        });
      }
      return rows;
    },
  },
  {
    id: 'SB2',
    name: 'unknown object without ID allocation or state mutation',
    run() {
      const rows = [];
      for (const [label, engine] of Object.entries(engines)) {
        const f = forms[label],
          getter =
            options.negative === 'wrong-module' && label === 'source'
              ? engines.A.__readExistingRuleOwnerId
              : engine.__readExistingRuleOwnerId,
          graph = [f.tree, f.known, f.events],
          snapshot = snapshotter(),
          before = snapshot(graph),
          unknown = {};
        for (let i = 0; i < 128; i++) {
          assert.equal(getter(unknown), undefined);
          assert.equal(getter(f.owner), f.parts[7]);
        }
        assert.equal(snapshot(graph), before);
        const next = form(engine);
        assert.equal(next.parts[7] - f.parts[7], 1);
        rows.push({
          lane: label,
          knownReads: 128,
          unknownReads: 128,
          firstID: f.parts[7],
          nextID: next.parts[7],
          delta: 1,
          stateUnchanged: true,
        });
      }
      return rows;
    },
  },
  {
    id: 'SB3',
    name: 'retained and reborn same-path actual objects',
    run() {
      const rows = [];
      for (const [label, engine] of Object.entries(engines)) {
        const tree = engine.buildFieldNodeTree({
          jsonSchema: {
            type: 'object',
            properties: {
              source: { type: 'number' },
              list: {
                type: 'array',
                items: {
                  type: 'number',
                  controls: { derived: '../../source' },
                },
              },
            },
          },
          defaultValue: { source: 1, list: [1] },
        });
        engine.mountFieldNode(tree);
        const list = tree.structure.list,
          old = list.children[0],
          getter =
            options.negative === 'wrong-module' && label === 'source'
              ? engines.A.__readExistingRuleOwnerId
              : engine.__readExistingRuleOwnerId,
          oldID = getter(old),
          oldKey = [...tree.runtime.committedRuleValues.keys()].find(
            (k) => JSON.parse(k)[7] === oldID,
          );
        assert.equal(typeof oldID, 'number');
        engine.dispatchRemove(list, 0);
        assert.equal(old.detached, true);
        assert.equal(getter(old), oldID);
        engine.dispatchPush(list, 9);
        const current = list.children[0],
          currentID = getter(current);
        assert.notEqual(old, current);
        assert.equal(old.path, current.path);
        assert.equal(old.blueprintNode.kind, current.blueprintNode.kind);
        assert.notEqual(oldID, currentID);
        assert.equal(getter(old), oldID);
        const keys = [...tree.runtime.committedRuleValues.keys()].filter(
          (k) => JSON.parse(k).length === 8,
        );
        assert.ok(keys.every((k) => JSON.parse(k)[7] === currentID));
        assert.ok(!tree.runtime.committedRuleValues.has(oldKey));
        for (const key of keys)
          assert.equal(ownerOf(key, [...live(tree), old], getter), current);
        rows.push({
          lane: label,
          path: current.path,
          oldID,
          currentID,
          oldDetached: true,
          actualObjectsDistinct: true,
          activeUsesCurrent: true,
        });
      }
      return rows;
    },
  },
  {
    id: 'SB4',
    name: 'wrong-module and invalid owner identity rejection',
    run() {
      const rows = [];
      for (const [label, f] of Object.entries(forms)) {
        for (const [other, engine] of Object.entries(engines))
          if (other !== label) {
            assert.equal(
              (options.negative === 'wrong-module'
                ? engines[label]
                : engine
              ).__readExistingRuleOwnerId(f.owner),
              undefined,
            );
            assert.throws(() =>
              ownerOf(f.key, f.known, engine.__readExistingRuleOwnerId),
            );
            rows.push({ nodeLane: label, readerLane: other, rejected: true });
          }
        const getter = engines[label].__readExistingRuleOwnerId;
        assert.throws(() => ownerOf(f.key, [], getter));
        assert.throws(() => ownerOf(f.key, [f.owner, f.owner], getter));
        const unknown = [...f.parts];
        unknown[7] = 900000000;
        assert.throws(() => ownerOf(JSON.stringify(unknown), f.known, getter));
        const conflict = [...f.parts];
        conflict[5] = '/other';
        assert.throws(() => ownerOf(JSON.stringify(conflict), f.known, getter));
      }
      return { wrongModuleDirections: rows, invalidKnownSetChecks: 12 };
    },
  },
];
if (options.case)
  for (const [label, engine] of Object.entries(engines))
    forms[label] = form(engine);
try {
  for (const c of cases.filter((c) => !options.case || c.id === options.case))
    result.cases.push({
      id: c.id,
      name: c.name,
      passed: true,
      evidence: c.run(),
    });
  assert.equal(result.cases.length, options.case ? 1 : 4);
  result.marker = 'STANDALONE_BINDING_4_CASES_PASSED';
  const p = path.join(out, `gate-${runtime}.json`);
  assert.ok(!fs.existsSync(p));
  fs.writeFileSync(p, JSON.stringify(result, null, 2) + '\n');
  console.log(
    JSON.stringify({
      marker: result.marker,
      runtime,
      version: result.version,
      standaloneCases: 4,
      vitestCasesAdded: 0,
      laneRowsPerFirstThreeCases: 3,
      wrongModuleDirections: 6,
      invalidKnownSetChecks: 12,
      inputFingerprint: result.inputFingerprint,
      caseSummary: result.cases.map((c) => ({
        id: c.id,
        name: c.name,
        passed: c.passed,
      })),
    }),
  );
} catch (e) {
  result.failed = { name: e.name, message: e.message, stack: e.stack };
  const p = path.join(
    out,
    `gate-${runtime}-failure-${(options.negative ?? 'unexpected') + '-' + (options.case ?? 'all')}.json`,
  );
  assert.ok(!fs.existsSync(p));
  fs.writeFileSync(p, JSON.stringify(result, null, 2) + '\n');
  throw e;
}
