// Run from benchmark-form with node --expose-gc; timing bundles have no counters or phase timers.
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { execFileSync } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const pkg = path.resolve(here, '../../..');
const require = createRequire(path.join(pkg, 'package.json'));
const { build } = require('esbuild');
const helper = path.join(pkg, 'src/core/settle/utils/compute/hasRecursiveExpansion.ts');
const old = execFileSync('git', ['show', 'b49f53962:packages/canard/schema-form/src/core/settle/utils/compute/hasRecursiveExpansion.ts'], { cwd: pkg, encoding: 'utf8' });
const current = fs.readFileSync(helper, 'utf8');
const modules = {};
for (const version of ['original', 'current']) {
  for (const counted of [false, true]) {
    const label = `${version}-${counted ? 'count' : 'time'}`;
    const outfile = path.join(here, '.performance', `recursion-${label}.mjs`);
    await build({
      stdin: { contents: `export {blueprint} from ${JSON.stringify(path.join(pkg, 'src/core/blueprint/index.ts'))}; export {nodeFromJSONSchema} from ${JSON.stringify(path.join(pkg, 'src/core/index.ts'))}; export {hasRecursiveExpansion} from ${JSON.stringify(helper)}; export {equivalentFixtures} from ${JSON.stringify(path.join(process.cwd(), 'fixtures/equivalent/index.ts'))};`, resolveDir: process.cwd(), loader: 'ts' },
      outfile, bundle: true, packages: 'external', platform: 'node', format: 'esm',
      plugins: [{ name: 'recursion-variant', setup(builder) {
        builder.onLoad({ filter: /hasRecursiveExpansion\.ts$/ }, () => {
          let source = version === 'original' ? old : current;
          if (counted) source = source
            .replace('while (ancestor) {', 'while (ancestor) { globalThis.__recursion.ancestors++;')
            .replace('if (input !== undefined)', 'globalThis.__recursion.calls++; if (input !== undefined)')
            .replace('if (visiting.has(node))', 'globalThis.__recursion.dfs++; if (visiting.has(node))');
          return { contents: source, loader: 'ts' };
        });
      } }],
    });
    modules[label] = await import(pathToFileURL(outfile).href);
  }
}

const median = (values) => values.toSorted((a, b) => a - b)[Math.floor(values.length / 2)];
const rows = [];
for (const fixture of modules['current-time'].equivalentFixtures.filter(f => /^nested/.test(f.name))) {
  for (const version of ['original', 'current']) {
    const timed = modules[`${version}-time`];
    const counted = modules[`${version}-count`];
    globalThis.__recursion = { calls: 0, ancestors: 0, dfs: 0 };
    counted.nodeFromJSONSchema({ jsonSchema: fixture.workspace, validationMode: 0, onChange() {} });
    const mountCounts = { ...globalThis.__recursion };
    const analysis = timed.blueprint(fixture.workspace);
    const runtime = { blueprint: analysis };
    const pairs = [];
    const walk = (template, parent) => {
      const record = { parent, blueprintNode: template, runtime, behavior: { type: 'object' } };
      if (parent) pairs.push([parent, template]);
      for (const child of template.childEntries) walk(child.node, record);
    };
    walk(analysis.root, null);
    const context = { distributedInputs: new Map() };
    const samples = { cold: [], warm: [] };
    for (let iteration = -30; iteration < 201; iteration++) {
      globalThis.gc?.();
      runtime.blueprint = { ...analysis };
      for (const mode of ['cold', 'warm']) {
        const start = performance.now();
        for (const [parent, template] of pairs)
          if (timed.hasRecursiveExpansion(parent, template, undefined, context))
            throw new Error('Acyclic graph unexpectedly rejected');
        const elapsed = performance.now() - start;
        if (iteration >= 0) samples[mode].push(elapsed);
      }
    }
    rows.push({ fixture: fixture.name, version, nodes: analysis.nodes.length,
      probes: pairs.length, mountCounts,
      coldMedianMs: median(samples.cold), warmMedianMs: median(samples.warm), samples });
  }
}
fs.writeFileSync(path.join(here, 'recursion-cost.json'), JSON.stringify({
  node: process.version, warmup: 30, samples: 201,
  method: 'Isolated guard passes over the real fixture template tree, no phase timer or counter in timed modules. Cold creates a fresh blueprint identity outside timing; warm reuses its cycle verdict. Separate counted bundles measure actual nodeFromJSONSchema mount operations.',
  rows,
}, null, 2));
console.log(JSON.stringify(rows.map(({ samples, ...row }) => row), null, 2));
