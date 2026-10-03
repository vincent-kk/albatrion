/** Verify derivation, policy observability, disabled-mode compatibility, and read-only round9 regression. */
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { readFileSync, writeFileSync, readdirSync, mkdirSync, rmSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import * as L from './proto/loop-v6.mjs';
import { buildSchema } from './proto/build-v6.mjs';
const cwd = fileURLToPath(new URL('./', import.meta.url));
const source = fileURLToPath(new URL('../round9/', import.meta.url));
const read = name => readFileSync(new URL(name, import.meta.url), 'utf8');
const save = (name, value) => writeFileSync(new URL(name, import.meta.url), value);
const run = (args, options = {}) => {
  const result = spawnSync('node', args, { cwd, encoding: 'utf8', ...options });
  assert.equal(result.status, 0, `${args.join(' ')}\n${result.stdout}\n${result.stderr}`);
  return result.stdout;
};
const sha = value => createHash('sha256').update(value).digest('hex');
const inventory = (dir, prefix = '') => Object.fromEntries(readdirSync(dir, { withFileTypes: true }).flatMap(entry => {
  const path = dir + '/' + entry.name;
  const key = prefix + entry.name;
  return entry.isDirectory() ? Object.entries(inventory(path, key + '/')) : [[key, sha(readFileSync(path))]];
}).sort(([a], [b]) => a.localeCompare(b)));
const original = inventory(source);
const generated = ['proto/loop-v6.mjs', 'proto/build-v6.mjs'].map(read);
const generation = run(['proto/make-v6.mjs']).trim();
assert.deepEqual(['proto/loop-v6.mjs', 'proto/build-v6.mjs'].map(read), generated);
for (const dir of ['.', 'proto']) for (const name of readdirSync(new URL(dir + '/', import.meta.url)))
  if (name.endsWith('.mjs')) run(['--check', `${dir}/${name}`]);
const first = run(['r10.mjs']);
const hash = sha(read('./r10-output.txt'));
const second = run(['r10.mjs']);
assert.equal(sha(read('./r10-output.txt')), hash, 'matrix is reproducible byte-for-byte');
assert.equal(first, second);

// Cross-category declaration order is independent of object-key order of schema containers.
const layers = ['body', 'allOf', 'then', 'oneOf'];
let layerChecks = 0;
for (let earlier = 0; earlier < layers.length; earlier++) for (let later = earlier + 1; later < layers.length; later++) {
  for (const reverse of [false, true]) {
    const schema = { type: 'object', properties: { b: {} } };
    const declarations = [
      { a: { '&injectTo': { to: '/t', map: () => 'I' } } },
      { t: { '&derived': { from: '/b', map: () => 'D' } } },
    ];
    for (const [category, decl] of [[layers[earlier], declarations[reverse ? 1 : 0]], [layers[later], declarations[reverse ? 0 : 1]]]) {
      if (category === 'body') Object.assign(schema.properties, decl);
      if (category === 'allOf') schema.allOf = [{ properties: decl }];
      if (category === 'then') { schema.if = true; schema.then = { properties: decl }; }
      if (category === 'oneOf') schema.oneOf = [{ properties: decl }];
    }
    L.setSwitches({ ...L.NEW_SWITCHES, EXPERIMENT: true, WRITE_CONFLICT: 'declaration-order' });
    const root = buildSchema(schema, { a: 1, b: 1, t: 'orig' });
    assert.equal(root.find('/t').raw, reverse ? 'I' : 'D'); layerChecks++;
  }
}
mkdirSync(new URL('./compat/', import.meta.url), { recursive: true });
const compatibility = {};
for (const name of ['r9', 'r9b']) {
  const code = read('../round9/' + name + '.mjs')
    .replace("'./proto/loop-v5.mjs'", "'../proto/loop-v6.mjs'")
    .replace("'./proto/build-v5.mjs'", "'../proto/build-v6.mjs'");
  save('./compat/' + name + '.mjs', code);
  run(['compat/' + name + '.mjs']);
  assert.equal(read('./compat/' + name + '-output.txt'), read('../round9/' + name + '-output.txt'));
  compatibility[name] = 'byte-identical output with EXPERIMENT=false';
}

// Execute the requested original harness exactly once; its generated files live under round10.
rmSync(new URL('./round9-run/', import.meta.url), { recursive: true, force: true });
const preload = fileURLToPath(new URL('./round9-readonly.mjs', import.meta.url));
const env = { ...process.env, NODE_OPTIONS: `${process.env.NODE_OPTIONS ?? ''} --import=${preload}` };
const baseline = run([source + 'regress/run.mjs'], { cwd: source, env });
assert.deepEqual(inventory(source), original, 'all round9 bytes and filenames are unchanged');
const facts = { generation: JSON.parse(generation), generatedByteIdentical: true,
  matrixByteIdentical: true, matrixSha256: hash, matrix: JSON.parse(first), layerChecks, compatibility,
  round9: { command: 'node ../round9/regress/run.mjs', exit: 0, invocations: 1,
    writesRedirectedTo: 'round9-run/', filesUnchanged: Object.keys(original).length,
    results: JSON.parse(baseline) } };
save('./verification.txt', JSON.stringify(facts, null, 2) + '\n');
save('./round9-manifest.txt', JSON.stringify(original, null, 2) + '\n');
console.log(JSON.stringify(facts));
