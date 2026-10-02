// Run from benchmark-form with node --expose-gc; only the generated diagnostic bundle is instrumented.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { createRequire } from 'node:module';
import { execFileSync } from 'node:child_process';

const here = path.dirname(fileURLToPath(import.meta.url));
const pkg = path.resolve(here, '../../..');
const require = createRequire(path.join(pkg, 'package.json'));
const { build } = require('esbuild');
const ts = require('typescript');
const label = process.argv[2] ?? 'before';
const names = new Map([
  ['blueprint', 'blueprint'], ['createSchemaNode', 'node-creation'],
  ['writeSchemaNode', 'settlement'], ['commitSettlement', 'commit'],
  ['markCommitDeliveries', 'delivery-marking'],
  ['requestSchemaNodeValidation', 'validation-registration'],
  ['readValidationEntry', 'validation-registration'],
  ['runSchemaNodeValidation', 'validation-run'],
  ['hasRecursiveExpansion', 'recursive-expansion'],
  ['selectChildren', 'child-selection'], ['updateOutput', 'output'],
  ['registerRecalculation', 'recalculation-registration'],
  ['flushSchemaNodeEvents', 'delivery-flush'],
  ['exitSchemaNodeChain', 'dispatch-exit'],
  ['getDependencyIndex', 'dependency-index'],
  ['getDeriveRuleTable', 'derive-rule-index'],
  ['transitionSettlement', 'transition'],
  ['evaluateGate', 'gate-evaluation'],
  ['isMissingRaw', 'source-presence'],
  ['readDefault', 'default-selection'],
  ['dirtyChildren', 'dirty-children'],
  ['dirtyIndexAdd', 'dirty-index'],
  ['dirtyIndexDelete', 'dirty-index'],
  ['dirtyIndexBegin', 'dirty-index'],
]);
const out = path.join(here, '.performance', `phases-${label}.mjs`);
const bf = process.cwd();
await build({
  stdin: { contents: `export {nodeFromJSONSchema} from ${JSON.stringify(path.join(pkg, 'src/core/index.ts'))}; export {equivalentFixtures} from ${JSON.stringify(path.join(bf, 'fixtures/equivalent/index.ts'))};`, resolveDir: bf, loader: 'ts' },
  outfile: out, bundle: true, packages: 'external', platform: 'node', format: 'esm',
  plugins: [{ name: 'phase-timers', setup(builder) {
    builder.onLoad({ filter: /\/src\/core\/.*\.ts$/ }, ({ path: sourcePath }) => {
      const source = label === 'before'
        ? execFileSync('git', ['show', `b49f53962:${path.relative(path.resolve(pkg, '../../..'), sourcePath)}`],
            { cwd: pkg, encoding: 'utf8' })
        : fs.readFileSync(sourcePath, 'utf8');
      const ast = ts.createSourceFile(sourcePath, source, ts.ScriptTarget.Latest, true);
      const edits = [];
      const visit = (node) => {
        let name, body;
        if (ts.isVariableDeclaration(node) && node.initializer && ts.isArrowFunction(node.initializer)) {
          name = node.name.getText(ast); body = node.initializer.body;
        } else if (ts.isFunctionDeclaration(node)) {
          name = node.name?.text; body = node.body;
        } else if (sourcePath.endsWith('/DirtyPathSet.ts') && ts.isMethodDeclaration(node)) {
          const method = node.name.getText(ast);
          name = method === 'add' ? 'dirtyIndexAdd' : method === 'delete' ? 'dirtyIndexDelete'
            : method === 'beginPostOrder' ? 'dirtyIndexBegin' : undefined;
          body = node.body;
        }
        if (names.has(name) && body && ts.isBlock(body)) {
          edits.push([body.getStart(ast) + 1, `\nconst __phase = globalThis.__phaseEnter(${JSON.stringify(names.get(name))}); try {\n`]);
          edits.push([body.end - 1, '\n} finally { globalThis.__phaseExit(__phase); }\n']);
        }
        ts.forEachChild(node, visit);
      };
      visit(ast);
      let contents = source;
      for (const [at, value] of edits.sort((a, b) => b[0] - a[0])) contents = contents.slice(0, at) + value + contents.slice(at);
      return { contents, loader: 'ts' };
    });
  }}],
});
let totals = {}, stack = [];
globalThis.__phaseEnter = (name) => {
  const frame = { name, start: performance.now(), child: 0 };
  stack.push(frame); return frame;
};
globalThis.__phaseExit = (frame) => {
  const elapsed = performance.now() - frame.start;
  stack.pop();
  if (stack.length) stack[stack.length - 1].child += elapsed;
  const item = totals[frame.name] ??= { ms: 0, calls: 0 };
  item.ms += elapsed - frame.child; item.calls++;
};
const { nodeFromJSONSchema, equivalentFixtures } = await import(pathToFileURL(out).href);
const median = (a) => a.toSorted((a,b) => a-b)[Math.floor(a.length / 2)];
const rows = [];
for (const fixture of equivalentFixtures.filter(f => /^(flat|nested|oneOf|array-\d)/.test(f.name) &&
  (!process.argv.includes('--focus') || /^(flat|nested|oneOf)/.test(f.name)))) {
  const samples = { mount: [], update: [] };
  let nodeCount = 0;
  let templateCount = 0;
  for (let i = -20; i < 101; i++) {
    globalThis.gc?.(); totals = {}; stack = [];
    const start = performance.now();
    const root = nodeFromJSONSchema({ jsonSchema: fixture.workspace, validationMode: 0, onChange() {} });
    const elapsed = performance.now() - start;
    nodeCount = totals['node-creation']?.calls ?? 0;
    templateCount = root.runtime.blueprint.nodes.length;
    if (i >= 0) samples.mount.push({ elapsed, phases: totals });
    totals = {}; stack = [];
    const updateStart = performance.now();
    for (const interaction of fixture.interactions) root.find(interaction.path).setValue(interaction.value);
    if (i >= 0) samples.update.push({ elapsed: performance.now() - updateStart, phases: totals });
  }
  for (const mode of ['mount', 'update']) {
    const phases = {};
    for (const name of new Set(names.values())) phases[name] = {
      ms: median(samples[mode].map(s => s.phases[name]?.ms ?? 0)),
      calls: median(samples[mode].map(s => s.phases[name]?.calls ?? 0)),
    };
    rows.push({ fixture: fixture.name, mode, nodeCount, templateCount,
      medianMs: median(samples[mode].map(s => s.elapsed)), phases, samples: samples[mode] });
  }
  console.log(`${fixture.name}: ${nodeCount} nodes measured`);
}
fs.writeFileSync(path.join(here, `phases-${label}.json`), JSON.stringify({ node: process.version, warmup: 20, samples: 101, exclusive: true, rows }, null, 2));
console.log(`Saved phases-${label}.json`);
