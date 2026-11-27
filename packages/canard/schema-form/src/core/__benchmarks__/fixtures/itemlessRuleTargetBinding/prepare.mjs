import assert from 'node:assert/strict';
import cp from 'node:child_process';
import { createHash } from 'node:crypto';
import fs from 'node:fs';
import { createRequire } from 'node:module';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

// Standalone verification preparation; all raw paths and hashes are explicit caller inputs.
const root = process.cwd(),
  scope = path.join(root, '.seiri/tasks');
const options = Object.fromEntries(
  process.argv.slice(2).map((x) => {
    const i = x.indexOf('=');
    assert.ok(i > 2);
    return [x.slice(2, i), x.slice(i + 1)];
  }),
);
const gitHead = () =>
  cp
    .execFileSync('git', ['rev-parse', 'HEAD'], { cwd: root, encoding: 'utf8' })
    .trim();
const base = options.base ?? '6d7d78d32bfcd9b6822410ecec4fc769dc7aa3f5',
  head = options.head ?? gitHead();
const out = path.resolve(root, options.out ?? '');
assert.ok(out.startsWith(scope + path.sep));
assert.ok(!fs.existsSync(out), 'Fresh output directory is mandatory');
const hash = (x) => createHash('sha256').update(x).digest('hex'),
  sha = (p) => hash(fs.readFileSync(p));
const git = (...args) =>
  cp.execFileSync('git', args, {
    cwd: root,
    encoding: 'utf8',
    maxBuffer: 16 * 1024 * 1024,
  });
assert.equal(git('rev-parse', 'HEAD').trim(), head);
git(
  'diff',
  '--exit-code',
  head,
  '--',
  'packages/canard/schema-form/src/core/engine/derive/utils/rules/getDeriveRuleKey.ts',
);
const require = createRequire(path.join(root, 'package.json'));
const ts = require('typescript');
const declarations = JSON.parse(
  fs.readFileSync(path.join(root, 'package.json'), 'utf8'),
).devDependencies;
assert.equal(declarations.typescript, '5.9.2');
assert.equal(declarations.rolldown, '1.2.0');
const compilerPath = require.resolve('rolldown');
const { rolldown } = await import(pathToFileURL(compilerPath).href);
const core = path.join(root, 'packages/canard/schema-form/src/core');
const producer = fs.realpathSync(
  path.join(core, 'engine/derive/utils/rules/getDeriveRuleKey.ts'),
);
for (const name of [
  'baseline',
  'candidate',
  'baseline-sha256',
  'candidate-sha256',
])
  assert.ok(options[name], 'Required explicit input --' + name);
const originalSource = fs.readFileSync(producer, 'utf8');
assert.equal(
  originalSource,
  git(
    'show',
    head +
      ':packages/canard/schema-form/src/core/engine/derive/utils/rules/getDeriveRuleKey.ts',
  ),
);

function inspect(bytes, file, kind) {
  const ast = ts.createSourceFile(
    file,
    bytes,
    ts.ScriptTarget.Latest,
    true,
    kind,
  );
  assert.equal(ast.parseDiagnostics.length, 0);
  const declarations = [];
  for (const statement of ast.statements)
    if (ts.isVariableStatement(statement))
      declarations.push(...statement.declarationList.declarations);
  const keys = declarations.filter(
    (d) => ts.isIdentifier(d.name) && d.name.text === 'getDeriveRuleKey',
  );
  assert.equal(keys.length, 1);
  const fn = keys[0].initializer;
  assert.ok(ts.isArrowFunction(fn) || ts.isFunctionExpression(fn));
  const target = fn.parameters[3].name.getText(ast),
    gets = [],
    sets = [],
    locals = [];
  const visit = (n) => {
    if (ts.isVariableDeclaration(n) && ts.isIdentifier(n.name))
      locals.push(n.name.text);
    if (
      ts.isCallExpression(n) &&
      ts.isPropertyAccessExpression(n.expression) &&
      ts.isIdentifier(n.expression.expression) &&
      n.arguments[0]?.getText(ast) === target
    ) {
      if (n.expression.name.text === 'get') gets.push(n);
      if (n.expression.name.text === 'set') sets.push(n);
    }
    ts.forEachChild(n, visit);
  };
  visit(fn.body);
  assert.equal(gets.length, 1);
  assert.equal(sets.length, 1);
  const mapName = gets[0].expression.expression.text;
  assert.equal(sets[0].expression.expression.text, mapName);
  assert.ok(!locals.includes(mapName));
  assert.ok(!fn.parameters.some((p) => p.name.getText(ast) === mapName));
  const maps = declarations.filter(
    (d) => ts.isIdentifier(d.name) && d.name.text === mapName,
  );
  assert.equal(maps.length, 1);
  assert.ok(ts.isNewExpression(maps[0].initializer));
  assert.equal(maps[0].initializer.expression.getText(ast), 'WeakMap');
  const line = (n) =>
    ast.getLineAndCharacterOfPosition(n.getStart(ast)).line + 1;
  return {
    sha256: hash(bytes),
    mapName,
    lines: {
      map: line(maps[0]),
      producer: line(keys[0]),
      get: line(gets[0]),
      set: line(sets[0]),
    },
  };
}
const sourceBinding = inspect(originalSource, producer, ts.ScriptKind.TS);
const suffix = `\nexport const __readExistingRuleOwnerId = (target: object): number | undefined => ${sourceBinding.mapName}.get(target);\n`;
const virtual = '\0itemless-rule-owner-source-entry';
const entry = [
  `export {buildFieldNodeTree,mountFieldNode} from ${JSON.stringify(path.join(core, 'surface/index.ts'))};`,
  `export {dispatchSetValue,dispatchPush,dispatchInsert,dispatchRemove,dispatchPop,dispatchClear,dispatchUpdate,dispatchBatch,subscribeFieldNode} from ${JSON.stringify(path.join(core, 'engine/write/index.ts'))};`,
  `export {getItemEntries} from ${JSON.stringify(path.join(core, 'engine/blueprint/index.ts'))};`,
  `export {__readExistingRuleOwnerId} from ${JSON.stringify(producer)};`,
].join('\n');
fs.mkdirSync(out, { recursive: false });
const write = (name, data) => {
  const file = path.join(out, name);
  assert.ok(!fs.existsSync(file));
  fs.writeFileSync(
    file,
    typeof data === 'string' ? data : JSON.stringify(data, null, 2) + '\n',
  );
  return file;
};
const warnings = [],
  graph = [];
let transformed = 0;
try {
  const bundle = await rolldown({
    input: virtual,
    cwd: root,
    platform: 'node',
    tsconfig: path.join(root, 'packages/canard/schema-form/tsconfig.json'),
    external: (id) =>
      !id.startsWith('@/') &&
      !id.startsWith('.') &&
      !path.isAbsolute(id) &&
      id !== virtual,
    plugins: [
      {
        name: 'observation-only-existing-owner-map',
        resolveId(id) {
          if (id === virtual) return virtual;
        },
        load(id) {
          if (id === virtual) return entry;
          if (path.isAbsolute(id) && fs.realpathSync(id) === producer) {
            transformed++;
            return originalSource + suffix;
          }
        },
        buildEnd() {
          for (const id of this.getModuleIds()) {
            const info = this.getModuleInfo(id);
            graph.push({
              id,
              imports: info?.importedIds ?? [],
              external: info?.isExternal ?? false,
            });
          }
        },
      },
    ],
    onLog(level, log, defaultHandler) {
      if (level === 'warn')
        warnings.push({ code: log.code, message: log.message });
      else defaultHandler(level, log);
    },
  });
  const output = await bundle.generate({
    format: 'cjs',
    exports: 'named',
    codeSplitting: false,
    entryFileNames: 'source-engine.cjs',
  });
  await bundle.close();
  assert.equal(transformed, 1);
  assert.equal(output.output.length, 1);
  assert.equal(output.output[0].type, 'chunk');
  const sourceFile = write('source-engine.cjs', output.output[0].code);
  const sourceCompiled = inspect(
    output.output[0].code,
    sourceFile,
    ts.ScriptKind.JS,
  );
  const physical = graph
    .filter((x) => path.isAbsolute(x.id) && fs.existsSync(x.id))
    .map((x) => ({ ...x, realPath: fs.realpathSync(x.id), sha256: sha(x.id) }));
  assert.equal(physical.filter((x) => x.realPath === producer).length, 1);
  const incoming = graph.flatMap((x) =>
    x.imports
      .filter((id) => id === producer)
      .map((id) => ({ from: x.id, to: id })),
  );
  assert.equal(incoming.length, 3);
  const engine = require(sourceFile);
  for (const name of [
    'buildFieldNodeTree',
    'mountFieldNode',
    'dispatchSetValue',
    'dispatchPush',
    'dispatchRemove',
    'subscribeFieldNode',
    '__readExistingRuleOwnerId',
  ])
    assert.equal(typeof engine[name], 'function', name);
  write('source-transformed-producer.ts', originalSource + suffix);
  write('source-graph.json', graph);
  const lanes = {
    source: {
      path: 'source-engine.cjs',
      sha256: sha(sourceFile),
      sourceBinding,
      compiledBinding: sourceCompiled,
      originalProducer: producer,
      sourceSuffix: suffix,
      inputs: physical,
      incoming,
    },
  };
  const executionFooter =
    '\nexport { buildFieldNodeTree, mountFieldNode, dispatchSetValue, dispatchPush, dispatchInsert, dispatchRemove, dispatchPop, dispatchClear, dispatchUpdate, dispatchBatch, subscribeFieldNode, getItemEntries };\n';
  const prefixChecks = [];
  for (const [label, inputName, commit] of [
    ['A', 'baseline', base],
    ['B', 'candidate', head],
  ]) {
    const inputPath = fs.realpathSync(path.resolve(root, options[inputName])),
      raw = fs.readFileSync(inputPath, 'utf8');
    assert.match(options[inputName + '-sha256'], /^[a-f0-9]{64}$/);
    assert.equal(
      hash(raw),
      options[inputName + '-sha256'],
      'Explicit raw input identity changed',
    );
    const binding = inspect(raw, inputPath, ts.ScriptKind.JS);
    const getter = `\nexport const __readExistingRuleOwnerId = target => ${binding.mapName}.get(target);\n`,
      executed = raw + executionFooter,
      copy = executed + getter;
    const rawFile = write(`dist-${label}-raw.mjs`, raw),
      file = write(`dist-${label}-observation.mjs`, copy);
    const check = (bytes) =>
      assert.equal(
        bytes === raw + executionFooter + getter,
        true,
        'Exact original prefix/footers changed',
      );
    check(copy);
    const mutant = write(
      `dist-${label}-prefix-negative.mjs`,
      '/* wrong prefix */\n' + copy,
    );
    let error;
    try {
      check(fs.readFileSync(mutant, 'utf8'));
    } catch (e) {
      error = e.message;
    }
    assert.ok(error);
    prefixChecks.push({ label, rejected: true, error });
    lanes[label] = {
      path: path.basename(file),
      sha256: sha(file),
      inputPath,
      sourceCommitContext: commit,
      inputKind: 'Caller-supplied immutable raw artifact; not a Git blob',
      rawPath: path.basename(rawFile),
      rawSHA256: hash(raw),
      executionFooter,
      getter,
      binding,
    };
  }

  // Preserve preparation for the unchanged count/measure branches; no counted or timed command runs here.
  const compatibilityBundles = {};
  for (const [laneName, name] of [
    ['A', 'base'],
    ['B', 'candidate'],
  ]) {
    const lane = lanes[laneName],
      raw = fs.readFileSync(lane.inputPath, 'utf8');
    const anchor = 'const getItemEntries = (template, index) => {';
    assert.equal(raw.split(anchor).length, 2);
    const executedPath = write(name + '-execution.mjs', raw + executionFooter);
    const countedPath = write(
      name + '-counted.mjs',
      raw.replace(anchor, anchor + '\n globalThis.__itemlessCalls++;') +
        executionFooter,
    );
    compatibilityBundles[name] = {
      source: lane.inputPath,
      rawPath: path.join(out, lane.rawPath),
      rawSHA256: lane.rawSHA256,
      executedPath,
      executedSHA256: sha(executedPath),
      countedPath,
      countedSHA256: sha(countedPath),
    };
  }
  const legacySource = path.join(
    root,
    'node_modules/@canard/schema-form_0.16.1/dist/index.mjs',
  );
  const legacyBytes = fs.readFileSync(legacySource, 'utf8');
  const legacyPath = write(
    'legacy-execution.mjs',
    legacyBytes + '\nexport { nodeFromJSONSchema };\n',
  );

  const fixtureEntry = '\0itemless-strict-fixture-entry',
    fixtureGraph = [];
  const fixtureRoot = path.join(core, '__tests__/fixtures');
  const fixtureSource = [
    `export {runItemlessScene,createStrictItemlessObserver} from ${JSON.stringify(path.join(fixtureRoot, 'itemlessDeclarations/observe.ts'))};`,
    `export {createRuleTargetIdentity,assertRuleIndexes} from ${JSON.stringify(path.join(fixtureRoot, 'itemlessDeclarations/ruleTargetIdentity.ts'))};`,
    `export {makeItemlessScene} from ${JSON.stringify(path.join(fixtureRoot, 'itemlessDeclarations/scenes.ts'))};`,
    `export {createTestValidator} from ${JSON.stringify(path.join(fixtureRoot, 'createTestValidator.ts'))};`,
  ].join('\n');
  const fixtureBundle = await rolldown({
    input: fixtureEntry,
    cwd: root,
    platform: 'node',
    tsconfig: path.join(root, 'packages/canard/schema-form/tsconfig.json'),
    external: (id) =>
      !id.startsWith('@/') &&
      !id.startsWith('.') &&
      !path.isAbsolute(id) &&
      id !== fixtureEntry,
    plugins: [
      {
        name: 'private-observation-fixture',
        resolveId(id) {
          if (id === fixtureEntry) return fixtureEntry;
        },
        load(id) {
          if (id === fixtureEntry) return fixtureSource;
        },
        buildEnd() {
          for (const id of this.getModuleIds()) {
            const info = this.getModuleInfo(id);
            fixtureGraph.push({
              id,
              imports: info?.importedIds ?? [],
              external: info?.isExternal ?? false,
            });
          }
        },
      },
    ],
    onLog(level, log, handler) {
      if (level === 'warn')
        warnings.push({ code: log.code, message: log.message });
      else handler(level, log);
    },
  });
  const fixtureOutput = await fixtureBundle.generate({
    format: 'esm',
    codeSplitting: false,
    entryFileNames: 'fixtures.mjs',
  });
  await fixtureBundle.close();
  assert.equal(fixtureOutput.output.length, 1);
  // Bun prints leading tabs in function source as two spaces; emit the same private-fixture text in both runtimes.
  // Token equality rejects changes inside literals; raw engines and authored source are never reformatted.
  const generatedFixture = fixtureOutput.output[0].code;
  const fixtureText = generatedFixture.replace(/^\t+/gm, (tabs) =>
    '  '.repeat(tabs.length),
  );
  const tokens = (text) => {
    const ast = ts.createSourceFile(
      'private-fixture.mjs',
      text,
      ts.ScriptTarget.Latest,
      true,
      ts.ScriptKind.JS,
    );
    assert.equal(ast.parseDiagnostics.length, 0);
    const result = [];
    const visit = (node) => {
      const children = node.getChildren(ast);
      if (children.length) for (const child of children) visit(child);
      else if (node.kind !== ts.SyntaxKind.EndOfFileToken)
        result.push([node.kind, node.getText(ast)]);
    };
    visit(ast);
    return result;
  };
  assert.deepEqual(tokens(generatedFixture), tokens(fixtureText));
  write('fixtures-generated.mjs', generatedFixture);
  const fixtureFile = write('fixtures.mjs', fixtureText);
  const fixtureInputs = fixtureGraph
    .filter((x) => path.isAbsolute(x.id))
    .map((x) => ({ path: fs.realpathSync(x.id), sha256: sha(x.id) }));
  assert.ok(fixtureInputs.length > 0);
  assert.ok(
    fixtureInputs.every((x) => !x.path.includes('/engine/')),
    'Private fixture must not bundle a second producer/engine',
  );
  write('fixture-graph.json', fixtureGraph);
  const fixture = {
    path: path.basename(fixtureFile),
    sha256: sha(fixtureFile),
    generatedSHA256: hash(generatedFixture),
    formatting:
      'Leading tabs to two spaces in private fixture only; parsed leaf tokens identical',
    inputs: fixtureInputs,
    producerInstances: 0,
  };

  const measurementFixture = path.join(
    core,
    '__tests__/fixtures/itemlessDeclarations/measurements.mjs',
  );
  write((options.label ?? 'candidate') + '.bundles.json', {
    bundles: compatibilityBundles,
    fixturePath: fixtureFile,
    fixtureSHA256: sha(fixtureFile),
    fixtureInputs,
    legacy: {
      source: legacySource,
      sourceSHA256: hash(legacyBytes),
      executedPath: legacyPath,
      executedSHA256: sha(legacyPath),
    },
    tool: {
      path: path.join(core, '__benchmarks__/itemless-declarations.mjs'),
      sha256: sha(path.join(core, '__benchmarks__/itemless-declarations.mjs')),
    },
    measurementFixture: {
      path: measurementFixture,
      sha256: sha(measurementFixture),
    },
  });

  const filesUnder = (dir) => {
    const found = [];
    for (const d of fs.readdirSync(dir, { withFileTypes: true })) {
      const p = path.join(dir, d.name);
      if (d.isDirectory()) found.push(...filesUnder(p));
      else if (d.isFile()) found.push({ path: p, sha256: sha(p) });
    }
    return found;
  };
  const toolRoots = [
    path.dirname(require.resolve('typescript/package.json')),
    path.dirname(require.resolve('rolldown/package.json')),
  ];
  const scoped = path.join(root, 'node_modules/@rolldown');
  if (fs.existsSync(scoped))
    for (const n of fs.readdirSync(scoped))
      if (n.startsWith('binding-')) toolRoots.push(path.join(scoped, n));
  const tools = toolRoots
    .flatMap(filesUnder)
    .sort((a, b) => a.path.localeCompare(b.path));
  const sourceTestFiles = [
    'itemless-declarations.observations.test.ts',
    'itemless-declarations.operations.test.ts',
    'itemless-declarations.fallback.test.ts',
  ];
  const ids = [];
  for (const name of sourceTestFiles) {
    const bytes = fs.readFileSync(
      path.join(core, 'engine/__tests__', name),
      'utf8',
    );
    const ast = ts.createSourceFile(name, bytes, ts.ScriptTarget.Latest, true);
    let found = 0;
    const visit = (n) => {
      if (
        ts.isCallExpression(n) &&
        ts.isPropertyAccessExpression(n.expression) &&
        n.expression.name.text === 'each' &&
        n.arguments.length === 1 &&
        ts.isArrayLiteralExpression(n.arguments[0])
      ) {
        found++;
        for (const x of n.arguments[0].elements) {
          assert.ok(ts.isStringLiteral(x));
          ids.push(x.text);
        }
      }
      ts.forEachChild(n, visit);
    };
    visit(ast);
    assert.equal(found, 1);
  }
  assert.equal(ids.length, 58);
  assert.equal(new Set(ids).size, 58);
  const inputFingerprint = hash(
    JSON.stringify({
      head,
      base,
      source: physical
        .map(({ id, sha256 }) => ({ id, sha256 }))
        .sort((a, b) => a.id.localeCompare(b.id)),
      raw: Object.fromEntries(['A', 'B'].map((k) => [k, lanes[k].rawSHA256])),
      tools,
      ids,
    }),
  );
  const manifest = {
    base,
    head,
    fixture,
    lanes,
    ids,
    prefixChecks,
    warnings,
    toolDeclarations: {
      typescript: declarations.typescript,
      rolldown: declarations.rolldown,
    },
    tools,
    inputFingerprint,
    prepareTool: {
      path: fileURLToPath(import.meta.url),
      sha256: sha(fileURLToPath(import.meta.url)),
    },
    hiddenPrototypeDependencies: 0,
    explicitFrozenRawInputs: 2,
    configurationEdits: 0,
  };
  write('manifest.json', manifest);
  console.log(
    JSON.stringify({
      marker: 'STANDALONE_BINDING_PREPARED',
      out,
      inputFingerprint,
      sourceInputs: physical.length,
      producerInstances: 1,
      prefixChecks: prefixChecks.length,
      warnings,
      artifactHashes: Object.fromEntries(
        Object.entries(lanes).map(([k, v]) => [k, v.sha256]),
      ),
      ids: ids.length,
      declaredTools: manifest.toolDeclarations,
    }),
  );
} catch (e) {
  write('preparation-failure.json', {
    name: e.name,
    message: e.message,
    stack: e.stack,
    warnings,
  });
  throw e;
}
