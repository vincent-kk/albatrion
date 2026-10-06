// Invoked explicitly for round 103; the committed production adapter owns clocks and natural exits.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';

const script = fileURLToPath(import.meta.url), directory = path.dirname(script);
const original = path.join(directory, 'revision-initial-empty.mjs');
const bytes = fs.readFileSync(original, 'utf8');

/** Preserve the canonical clock while replacing one uniquely identified adapter anchor. */
function once(source, before, after) {
  assert.equal(source.split(before).length, 2, before);
  return source.replace(before, after);
}

let source = once(bytes, '\nconst script = fileURLToPath(import.meta.url);',
  '\nconst script = ' + JSON.stringify(script) + ';');
source = once(source, "const head = '2333fd5af';", "const head = 'e60490572';");
source = source.replaceAll('revision102-', 'gates103-');
source = source.replaceAll('__revision102', '__gates103');
source = once(source, "const operations = [['nested-d5-f4', 'mount'], ['flat-500', 'mount'], ['oneOf-20', 'mount'],\n  ['sample-0', 'mount'], ['sample-0', 'first'], ['sample-0', 'later'],\n  ['nested-d5-f4', 'first'], ['nested-d5-f4', 'later']];",
  "const operations = ['oneOf-5','oneOf-20','oneOf-40'].flatMap(name => ['mount','first','later'].map(mode => [name,mode])).concat([['nested-d5-f4','mount'],['flat-500','mount'],['sample-0','mount'],['sample-0','later']]);");
source = once(source, "const values = typeof input === 'string' ? [input + '-later', input + '-again'] :",
  "const values = name.startsWith('oneOf-') ? ['kind_4','kind_0'] : typeof input === 'string' ? [input + '-later', input + '-again'] :");
source = once(source, 'for (let run = 1; run <= 3; run++) {',
  "for (let run = 1; run <= (args[3] === 'steady' ? 6 : 3); run++) {");
source = once(source, 'const row = { head, variant, name, mode, run, regime,',
  "const row = { head, variant, name, mode, run, regime, blockOrder: run % 2 ? 'H-first' : 'W-first',");
source = once(source, 'driverSha256: createHash',
  'sourceDriverSha256: ' + JSON.stringify(createHash('sha256').update(bytes).digest('hex')) + ', driverSha256: createHash');

const hookStart = source.indexOf("  if (variant.endsWith('-count')");
const hookEnd = source.indexOf('  return source;', hookStart);
assert(hookStart > 0 && hookEnd > hookStart);
source = source.slice(0, hookStart) + `  if (variant.endsWith('-count')) {
    if (relative.endsWith('/compileBlueprintExpressions.ts'))
      source = once(source, '            evaluate,',
        "            evaluate: (dependencies) => { if (key === 'active') globalThis.__gates103Evaluations++; return evaluate(dependencies); },");
    if (relative.endsWith('/evaluateGate.ts'))
      source = once(source, '): boolean => {', '): boolean => { globalThis.__gates103Sites++;');
    if (relative.endsWith('/getGateBudgetCap.ts'))
      source = once(source, '): number => {', '): number => { globalThis.__gates103CapQueries++;');
    if (relative.endsWith('/getGateResultMemo.ts'))
      source = once(source, '    work.passes.set(node,', '    globalThis.__gates103Passes++; work.passes.set(node,');
  }
` + source.slice(hookEnd);

const countsStart = source.indexOf("} else if (command === '--counts') {");
const countsEnd = source.indexOf("} else if (command === '--summarize')", countsStart);
assert(countsStart > 0 && countsEnd > countsStart);
source = source.slice(0, countsStart) + `} else if (command === '--counts') {
  const rows = [];
  for (const variant of ['head-count', 'working-count']) {
    const engine = require(bundle(variant));
    for (const count of [5,10,20,40]) {
      const fixture = api.fixtureFor(engine, 'oneOf-' + count);
      const reset = () => { globalThis.__gates103Evaluations = 0; globalThis.__gates103Sites = 0; globalThis.__gates103CapQueries = 0; globalThis.__gates103Passes = 0; };
      const capture = (mode, root) => ({ variant, count, mode, evaluations: globalThis.__gates103Evaluations,
        sites: globalThis.__gates103Sites, capQueries: globalThis.__gates103CapQueries, passes: globalThis.__gates103Passes,
        observation: observe(root) });
      reset();
      const root = (await measured(() => api.create(engine, fixture, 'head', structuredClone(fixture.workspace)))).root;
      rows.push(capture('mount', root));
      for (const [index, kind] of ['kind_4','kind_0','kind_4','kind_0'].entries()) {
        reset();
        await measured(() => root.find('/kind').setValue(kind));
        rows.push(capture(index === 0 ? 'first' : 'later-' + index, root));
      }
    }
  }
  for (let index = 0; index < 20; index++) assert.deepEqual(rows[index].observation, rows[index + 20].observation);
  save('counts', { head, rows });
  console.log(JSON.stringify(rows.map(({ observation, ...row }) => row)));
` + source.slice(countsEnd);

assert(['--build','--counts','--pairs','--worker'].includes(process.argv[2]));
await import('data:text/javascript;base64,' + Buffer.from(source).toString('base64'));
