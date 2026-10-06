// CLI-only checks expose an existing bundled function in memory; measurement bundles are not modified.
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import fs from 'node:fs';
import Module from 'node:module';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const directory = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const pkg = path.resolve(directory, '../../..');
const artifacts = path.join(directory, 'profile-101-gc');
const candidates = ['head', 'nodes-empty-hosts', 'nodes-empty-hosts-guarded', 'declarations-empty-arrays', 'load-frame-pool'];
const apis = Object.fromEntries(candidates.map(candidate => {
  const file = path.join(artifacts, 'bundles', candidate + '.cjs');
  const loaded = new Module(file);
  loaded.filename = file;
  loaded.paths = Module._nodeModulePaths(path.dirname(file));
  loaded._compile(fs.readFileSync(file, 'utf8') + '\nmodule.exports.checkBlueprint = blueprint;\n', file);
  return [candidate, loaded.exports];
}));
const normalize = value => JSON.parse(JSON.stringify(value, (key, item) => key === 'stack' ? undefined :
  typeof item === 'function' ? item.toString() : item));

function graph(schema, api, predicates) {
  const diagnostics = [];
  try {
    const blueprint = api.checkBlueprint(schema, { ...predicates, collect: diagnostic => diagnostics.push(diagnostic) });
    assert.equal(blueprint.schema, schema);
    assert.equal(blueprint.isAtomic, predicates.isAtomic);
    assert.equal(blueprint.isTerminal, predicates.isTerminal);
    assert(Object.isFrozen(blueprint));
    assert(blueprint.nodes.every(node => Object.isFrozen(node) && Object.isFrozen(node.childEntries)));
    assert(blueprint.fragments.every(fragment => Object.isFrozen(fragment) && Object.isFrozen(fragment.declares) &&
      Object.isFrozen(fragment.overlays) && Object.isFrozen(fragment.inheritedOverlays) && Object.isFrozen(fragment.children)));
    return normalize({ ok: true, capabilities: blueprint.capabilities, root: blueprint.root.id,
      nodes: blueprint.nodes.map(node => ({ ...node,
        childEntries: node.childEntries.map(entry => ({ ...entry, node: entry.node.id })),
        item: node.item?.id, prefixItems: node.prefixItems?.map(item => item.id) })),
      fragments: blueprint.fragments, dependencies: blueprint.dependencies, expressions: blueprint.expressions, diagnostics });
  } catch (error) {
    if (error.code === 'ERR_ASSERTION') throw error;
    return normalize({ ok: false, error: { name: error.name, message: error.message, ...error }, diagnostics });
  }
}

const corpusFile = path.join(pkg, 'src/core/blueprint/__tests__/fixtures/coldBindingHead.json');
const corpus = JSON.parse(fs.readFileSync(corpusFile, 'utf8')).cases;
assert.equal(corpus.length, 59);
const predicates = [{}, { isAtomic: schema => typeof schema === 'object' && schema?.type === 'object' },
  { isTerminal: schema => typeof schema === 'object' && schema?.type === 'string' },
  { isAtomic: schema => typeof schema === 'object' && schema?.type === 'array',
    isTerminal: schema => typeof schema === 'object' && schema?.type === 'boolean' }];
const results = [];
for (let option = 0; option < predicates.length; option++) for (const entry of corpus) {
  const authored = JSON.stringify(entry.schema);
  const expected = graph(entry.schema, apis.head, predicates[option]);
  for (const candidate of candidates.slice(1)) {
    const actual = graph(entry.schema, apis[candidate], predicates[option]);
    assert.deepEqual(actual, expected, `${candidate}: ${entry.label}, predicates=${option}`);
    assert.equal(JSON.stringify(entry.schema), authored, 'Authored schema remains unchanged');
  }
  results.push({ label: entry.label, predicates: option, ok: expected.ok,
    diagnostics: expected.diagnostics.length, sha256: createHash('sha256').update(JSON.stringify(expected)).digest('hex') });
}

const drain = async () => {
  for (let index = 0; index < 64; index++) await Promise.resolve();
  await new Promise(resolve => setImmediate(resolve));
};
function observeNode(node) {
  return normalize({ path: node.path, type: node.type, schemaType: node.schemaType, nullable: node.nullable,
    required: node.required, active: node.active, visible: node.visible, enabled: node.enabled,
    readOnly: node.readOnly, value: node.getValue?.() ?? node.value,
    children: node.children?.map(observeNode) });
}
const mounts = [];
for (const name of ['nested-d5-f4', 'flat-500', 'oneOf-20']) {
  const fixture = apis.head.equivalentFixtures.find(row => row.name === name);
  assert(fixture, name);
  let expected;
  for (const candidate of candidates) {
    const deliveries = [];
    const root = apis[candidate].nodeFromJSONSchema({ jsonSchema: structuredClone(fixture.workspace), validationMode: 0,
      onChange: (...args) => deliveries.push(normalize(args)) });
    await drain();
    const actual = { tree: observeNode(root), deliveries };
    if (candidate === 'head') expected = actual;
    else assert.deepEqual(actual, expected, `${candidate}: complete mount ${name}`);
  }
  mounts.push({ name, sha256: createHash('sha256').update(JSON.stringify(expected)).digest('hex') });
}
const summary = { corpusFile, corpusSha256: createHash('sha256').update(fs.readFileSync(corpusFile)).digest('hex'),
  candidates: candidates.slice(1), schemas: 59, predicateConfigurations: 4, comparisons: results.length * (candidates.length - 1),
  successfulAnalyses: results.filter(row => row.ok).length, rejectedAnalyses: results.filter(row => !row.ok).length,
  warnings: results.reduce((sum, row) => sum + row.diagnostics, 0), results, mounts,
  scope: 'Measurement-only graph/diagnostic and complete mount equivalence; not a product change or full regression approval.' };
const text = JSON.stringify(summary) + '\n';
assert(Buffer.byteLength(text) <= 5_000_000);
fs.writeFileSync(path.join(artifacts, 'content-check.summary.json'), text);
console.log(JSON.stringify({ comparisons: summary.comparisons, successfulAnalyses: summary.successfulAnalyses,
  rejectedAnalyses: summary.rejectedAnalyses, warnings: summary.warnings, mounts: mounts.length }));
