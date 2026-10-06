// Explicit round-103 driver; the committed round-102 adapter owns paired clocks and natural exits.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const script = fileURLToPath(import.meta.url), directory = path.dirname(script);
let source = fs.readFileSync(path.join(directory, 'single-contribution.mjs'), 'utf8');

/** Retain the committed adapter in memory; no fetched or committed runner is changed. */
function once(before, after) {
  assert.equal(source.split(before).length, 2, before);
  source = source.replace(before, after);
}

once('const script = fileURLToPath(import.meta.url), directory = path.dirname(script);',
  'const script = ' + JSON.stringify(script) + ', directory = ' + JSON.stringify(directory) + ';');
once('const head = \'237678927\';', 'const head = \'a21a8003f\';');
once("'merge102-'", "'freeze103-'");
const development = process.argv.includes('--development');
const developmentPatch = "canonical = canonical.replaceAll('\"production\"', '\"development\"'); const api = await import(";
const countCommand = `if (command === '--freeze-counts') {
  const nativeFreeze = Object.freeze, rows = [];
  Error.stackTraceLimit = 100;
  for (const variant of ['head', 'working']) {
    const engine = require(bundle(variant));
    for (const name of ['nested-d5-f4', 'flat-500', 'oneOf-20', 'sample-0']) {
      const fixture = api.fixtureFor(engine, name), values = new Map();
      let calls = 0, primitiveCalls = 0;
      Object.freeze = value => {
        calls++;
        if (value && (typeof value === 'object' || typeof value === 'function')) {
          const stack = new Error().stack;
          const phase = stack.includes('freezeBlueprintValues') ? 'completion' :
            /at (?:Object\\.)?blueprint[ (]/.test(stack) ? 'analysis' : 'runtime';
          const entry = values.get(value);
          if (entry) entry.calls++;
          else values.set(value, { phase, calls: 1 });
        } else primitiveCalls++;
        return nativeFreeze(value);
      };
      let root;
      try { root = api.create(engine, fixture, 'head', structuredClone(fixture.workspace));
        await measured(() => {}); } finally { Object.freeze = nativeFreeze; }
      const phases = { analysis: 0, completion: 0, runtime: 0 };
      let aliasCalls = 0;
      for (const item of values.values()) { phases[item.phase]++; aliasCalls += item.calls - 1; }
      const nodes = root.runtime.blueprint.nodes.length;
      const row = { head, variant, name, development: ${development}, nodes, calls,
        distinct: values.size, freezesPerNode: values.size / nodes, phases, aliasCalls, primitiveCalls };
      rows.push(row); console.log(JSON.stringify(row));
    }
  }
  save('freeze-counts', { head, rows });
}`;
process.argv = process.argv.filter(value => value !== '--development');
once("await import('data:text/javascript;base64,' + Buffer.from(source).toString('base64'));",
  `source = source.replaceAll('revision102-', 'freeze103-');
  source = source.replaceAll("['sample-0', 'later'],", "['sample-0', 'later'], ['oneOf-40', 'first'], ['oneOf-40', 'later'],");
  source = source.replace("if (command === '--verify') {", ${JSON.stringify(countCommand)} + " else if (command === '--verify') {");
  if (${development}) {
    source = source.replace('const api = await import(',
      ${JSON.stringify(developmentPatch)});
    source = source.replaceAll('freeze103-', 'freeze103-dev-');
  }
  await import('data:text/javascript;base64,' + Buffer.from(source).toString('base64'));`);
await import('data:text/javascript;base64,' + Buffer.from(source).toString('base64'));
