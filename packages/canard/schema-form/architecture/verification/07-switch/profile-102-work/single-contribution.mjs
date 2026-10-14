// Invoked by the round-102 CLI; the committed paired driver owns clocks and natural exits.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';

const script = fileURLToPath(import.meta.url), directory = path.dirname(script);
const original = path.join(directory, 'revision-initial-empty.mjs');
const bytes = fs.readFileSync(original, 'utf8');

/** Replace a unique canonical anchor while retaining its paired sentinel clock. */
function once(source, before, after) {
  assert.equal(source.split(before).length, 2, before);
  return source.replace(before, after);
}

let source = once(bytes, '\nconst script = fileURLToPath(import.meta.url);',
  '\nconst script = ' + JSON.stringify(script) + ';');
source = once(source, "const head = '2333fd5af';", "const head = '237678927';");
source = source.replaceAll('revision102-', 'merge102-');
const hookBegin = source.indexOf("  if (variant.endsWith('-count')");
const hookEnd = source.indexOf('  return source;', hookBegin);
assert(hookBegin > 0 && hookEnd > hookBegin);
source = source.slice(0, hookBegin) + `  if (variant.endsWith('-count') && relative.endsWith('/applyConstraintKeywords.ts'))
    source = once(source, 'const target = state.schema;',
      'globalThis.__revision102Reads++; if (options.mode === "static") globalThis.__merge102StaticCount++; else globalThis.__merge102RuntimeCount++; const target = state.schema;');
` + source.slice(hookEnd);
source = once(source, "const api = await import('data:text/javascript;base64,' + Buffer.from(canonical).toString('base64'));",
  `canonical = once(canonical, 'stdin: { contents: \\u0060export {nodeFromJSONSchema}',
    'stdin: { contents: \\u0060export {blueprint} from ' + JSON.stringify(path.join(pkg, 'src/core/blueprint/blueprint.ts')) + ';\\n' +
    'export {mergeEffectiveSchema} from ' + JSON.stringify(path.join(pkg, 'src/core/blueprint/utils/effectiveSchema/mergeEffectiveSchema.ts')) + ';\\n' +
    'export {mergeSchemaContributions} from ' + JSON.stringify(path.join(pkg, 'src/core/blueprint/utils/effectiveSchema/utils/mergeSchemaContributions.ts')) + ';\\n' +
    'export {selectEffectiveDeclarations} from ' + JSON.stringify(path.join(pkg, 'src/core/blueprint/utils/effectiveSchema/utils/selectEffectiveDeclarations.ts')) + ';\\n' +
    'export {nodeFromJSONSchema}');
const api = await import('data:text/javascript;base64,' + Buffer.from(canonical).toString('base64'));`);
source = once(source, 'for (let run = 1; run <= 3; run++) {',
  'for (let run = Number(args[4] ?? 1); run < Number(args[4] ?? 1) + 3; run++) {');
source = once(source, 'const row = { head, variant, name, mode, run, regime,',
  "const row = { head, variant, name, mode, run, regime, blockOrder: run % 2 ? 'H-first' : 'W-first',");
source = once(source, 'assert.equal(reads, variant === \'head-count\' ? liveNodes * 17 : 0);',
  'assert(Number.isInteger(reads) && reads >= 0);');
source = once(source, 'globalThis.__revision102Reads = 0;',
  'globalThis.__revision102Reads = 0; globalThis.__merge102StaticCount = 0; globalThis.__merge102RuntimeCount = 0;');
source = once(source, 'rows.push({ variant, name, liveNodes, reads, readsPerNode: reads / liveNodes, observation: snapshot });',
  'rows.push({ variant, name, liveNodes, blueprintNodes: root.runtime.blueprint.nodes.length, staticTraversals: globalThis.__merge102StaticCount, runtimeTraversals: globalThis.__merge102RuntimeCount, reads, readsPerNode: reads / liveNodes, traversalsPerBlueprintNode: reads / root.runtime.blueprint.nodes.length, observation: snapshot });');
source = once(source, "if (command === '--build') {", `if (command === '--verify') {
  const engines = { head: require(bundle('head')), working: require(bundle('working')) };
  const corpus = JSON.parse(fs.readFileSync(path.join(pkg, 'src/core/blueprint/__tests__/fixtures/coldBindingHead.json'), 'utf8'));
  assert.equal(corpus.cases.length, 59);
  const normalize = value => JSON.parse(JSON.stringify(value, (key, item) => key === 'stack' ? undefined : item));
  const keyOrders = value => {
    if (!value || typeof value !== 'object') return null;
    return [Object.keys(value), Object.keys(value).map(key => keyOrders(value[key]))];
  };
  const capture = (engine, authored, collect) => {
    const diagnostics = [], schema = structuredClone(authored);
    try {
      const result = engine.blueprint(schema, collect ? { collect: value => diagnostics.push(value) } : {});
      const nodes = result.nodes.map(node => {
        const selections = [[], node.declarations.filter(entry => entry.gates.length).map(entry => entry.id),
          ...node.declarations.filter(entry => entry.gates.length).map(entry => [entry.id])];
        const effective = selections.map(ids => {
          const value = engine.mergeEffectiveSchema(node, ids);
          assert.equal(engine.mergeEffectiveSchema(node, ids), value);
          assert(Object.isFrozen(value) && Object.isFrozen(value.schema));
          return { value, keys: keyOrders(value.schema) };
        });
        const selected = engine.selectEffectiveDeclarations(node, [], node.declarations.filter(entry => entry.context === 'conjunction'));
        const staticValue = engine.mergeSchemaContributions(node, selected, { mode: 'static' });
        return { path: node.path, schemaPath: node.schemaPath, effective, staticValue, staticKeys: keyOrders(staticValue.schema) };
      });
      assert.deepEqual(schema, authored);
      return normalize({ nodes, diagnostics });
    } catch (error) { return normalize({ error: { name: error.name, message: error.message, data: error }, diagnostics }); }
  };
  let nodes = 0, errors = 0, warningCases = 0;
  const records = [];
  for (const sample of corpus.cases) for (const collect of [false, true]) {
    const expected = capture(engines.head, sample.schema, collect);
    const actual = capture(engines.working, sample.schema, collect);
    assert.deepEqual(actual, expected, sample.label + ': collect=' + collect);
    if (!collect) { nodes += expected.nodes?.length ?? 0; errors += expected.error ? 1 : 0; }
    if (collect) warningCases += expected.diagnostics.some(value => value.level === 'warning') ? 1 : 0;
    records.push({ label: sample.label, collect, result: expected });
  }
  save('equivalence', { head, schemas: 59, captures: records.length, nodes, errors, warningCases, records });
  console.log(JSON.stringify({ schemas: 59, captures: records.length, nodes, errors, warningCases, equal: true }));
} else if (command === '--build') {`);
source = once(source, 'driverSha256: createHash',
  'sourceDriverSha256: ' + JSON.stringify(createHash('sha256').update(bytes).digest('hex')) + ', driverSha256: createHash');
await import('data:text/javascript;base64,' + Buffer.from(source).toString('base64'));
