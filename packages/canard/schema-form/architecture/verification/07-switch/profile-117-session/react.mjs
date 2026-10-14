// CLI adapter for the G26 React harness; HEAD sources and evidence destinations are explicit.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { directory, pkg, repo, scratch, HEAD, hash } from './runtime.mjs';

const [stage, fixture, run, version, flag] = process.argv.slice(2);
assert(['A', 'B'].includes(stage));
assert(['HEAD', '0.16.0'].includes(version));
const counts = flag === '--counts';
const prepare = flag === '--prepare' || flag === '--prepare-counts';
const countLane = counts || flag === '--prepare-counts';
const original = fs.readFileSync(path.join(directory, '../profile-114-g26/measure-react.mjs'), 'utf8');
const replace = (source, before, after) => {
  assert.equal(source.split(before).length, 2, before);
  return source.replace(before, after);
};
let source = original;
source = replace(source, "import { instrumentRound93i } from '../tools/instrument-round-93i.mjs';",
  `import { instrumentRound93i } from ${JSON.stringify(pathToFileURL(path.join(directory, '../tools/instrument-round-93i.mjs')).href)};`);
source = replace(source, "import { instrumentCore } from './instrument-core.mjs';",
  `import { instrumentCore } from ${JSON.stringify(pathToFileURL(path.join(directory, '../profile-114-g26/instrument-core.mjs')).href)};\nimport { instrumentWork } from ${JSON.stringify(pathToFileURL(path.join(directory, 'count-work.mjs')).href)};`);
source = replace(source, 'const directory = path.dirname(fileURLToPath(import.meta.url));', `const directory = ${JSON.stringify(directory)};`);
source = replace(source, "assert.equal(head, 'af3cd579b892393de3693f737afe68cfce3993f8');", `assert.equal(head, '${HEAD}');`);
source = replace(source, "const lane = process.argv.includes('--phases') ? 'phases' : 'plain';", `const lane = '${countLane ? 'counts' : 'plain'}';`);
source = replace(source, "fs.writeFileSync(path.join(directory, name), contents, { flag: 'wx' });",
  `console.log('ARTIFACT ' + JSON.stringify({ name: ${JSON.stringify(stage + '-')} + name, value }));`);
const loadAnchor = "if (lane === 'phases') builder.onLoad({ filter: /\\.(ts|tsx)$/ }, args => {";
source = replace(source, "builder.onResolve({ filter: /^@canard\\/schema-form$/ }, () => ({ path: path.join(pkg, 'src/index.ts') }));",
  "builder.onResolve({ filter: /^@canard\\/schema-form_0\\.16\\.0$/ }, () => ({ path: pathToFileURL(oldEsmEntry).href, external: true }));\n        builder.onResolve({ filter: /^@canard\\/schema-form$/ }, () => ({ path: path.join(pkg, 'src/index.ts') }));");
source = replace(source, loadAnchor, `builder.onLoad({ filter: /\\.(ts|tsx)$/ }, args => {
  if (!args.path.startsWith(path.join(repo, 'packages/')) || args.path.includes('/node_modules/')) return undefined;
  const relative = path.relative(repo, args.path);
  let contents = execFileSync('git', ['--no-optional-locks', 'show', head + ':' + relative], { cwd: repo, encoding: 'utf8', timeout: 10000 });
  if (lane === 'counts') contents = instrumentWork(contents, args.path, ts);
  return { contents, loader: args.path.endsWith('.tsx') ? 'tsx' : 'ts' };
});
${loadAnchor}`);
if (countLane) {
  source = replace(source, 'const warmup = 20;', 'const warmup = 0;');
  source = replace(source, 'const samples = 101;', 'const samples = 3;');
  source = replace(source, "const moduleHooks = lane === 'phases' ?", "const moduleHooks = lane === 'counts' ?");
  source = replace(source, "instrumentCore(fs.readFileSync(oldEsmEntry, 'utf8'), oldEsmEntry, ts, true)",
    "instrumentWork(fs.readFileSync(oldEsmEntry, 'utf8'), oldEsmEntry, ts)");
  const begin = source.indexOf("  if (lane === 'phases') Module._extensions['.js'] =");
  const end = source.indexOf("  const childProcess =", begin);
  assert(begin > 0 && end > begin);
  source = source.slice(0, begin) + `  Module._extensions['.js'] = (module, filename) => {
    if (/react-dom-profiling\\.profiling\\.js$/.test(filename) || filename === oldEntry)
      module._compile(instrumentWork(fs.readFileSync(filename, 'utf8'), filename, ts), filename);
    else originalLoader(module, filename);
  };
  globalThis.__counting117 = false;
  globalThis.__counts117 = {};
  globalThis.__work117 = key => { if (globalThis.__counting117) globalThis.__counts117[key] = (globalThis.__counts117[key] ?? 0) + 1; };
` + source.slice(end);
  source = source.replaceAll('collecting = false;', 'collecting = false; globalThis.__counting117 = false;');
  source = source.replaceAll("totals = {}; stack = []; collecting = lane === 'phases';",
    "totals = {}; stack = []; globalThis.__counts117 = { renders: 0, listenerDeliveries: 0, settlePasses: 0 }; globalThis.__counting117 = true; collecting = lane === 'phases';");
  source = replace(source, 'const mountPhases = { ...totals };', 'const mountPhases = { ...totals }; const mountWork = { ...globalThis.__counts117 };');
  source = replace(source, 'const phases = { mount: [], update: [] };', 'const phases = { mount: [], update: [] }; const work = { mount: [], update: [] };');
  source = replace(source, "timing['commits-update'].push(mounted.commits.length);",
    "timing['commits-update'].push(mounted.commits.length); work.mount.push({ ...mountWork, commits: mountCommits }); work.update.push({ ...globalThis.__counts117, commits: mounted.commits.length });");
  source = replace(source, "phases: lane === 'phases' ? phases : undefined, observations });",
    "phases: lane === 'phases' ? phases : undefined, work, countDefinitions: { renders: 'actual function/class component invocations', listenerDeliveries: 'actual node listener calls', settlePasses: 'root computeNode invocations; legacy has no settle pipeline' }, observations });");
}
source = replace(source, "bundleSha256: createHash('sha256').update(bundleText).digest('hex'),",
  `bundleSha256: createHash('sha256').update(bundleText).digest('hex'), adapterSha256: ${JSON.stringify(hash(source))}, measurementSource: 'HEAD pinned git blobs; working src is not consumed',`);
const preparedBundle = path.join(scratch, `react-117-${countLane ? 'counts' : 'plain'}.cjs`);
if (prepare) {
  const begin = source.indexOf('    const loaded = { exports: {} };');
  const end = source.indexOf('\n  } finally {', begin) + 1;
  assert(begin > 0 && end > begin);
  source = source.slice(0, begin) + `    fs.writeFileSync(${JSON.stringify(preparedBundle)}, bundleText);
    console.log('ARTIFACT ' + JSON.stringify({ name: 'react-bundle-${countLane ? 'counts' : 'plain'}.json', value: { head, file: ${JSON.stringify(preparedBundle)}, bytes: Buffer.byteLength(bundleText), sha256: createHash('sha256').update(bundleText).digest('hex'), serviceExit, startedAt: new Date(Date.now() - performance.now() + started).toISOString(), endedAt: new Date().toISOString() } }));
` + source.slice(end);
} else if (stage === 'B') {
  source = replace(source, "const { build } = pkgRequire('esbuild');",
    `pkgRequire('esbuild'); const build = async () => ({ outputFiles: [{ text: fs.readFileSync(${JSON.stringify(preparedBundle)}, 'utf8') }] });`);
  const begin = source.indexOf("    assert(service, 'The esbuild child must be audited');");
  const end = source.indexOf('    const bundleText =', begin);
  assert(begin > 0 && end > begin);
  source = source.slice(0, begin) + '    childProcess.spawn = originalSpawn;\n' + source.slice(end);
  source = replace(source, 'esbuildExit: serviceExit,', `esbuildExit: serviceExit, reusedPreparedBundle: ${JSON.stringify(preparedBundle)},`);
}
process.argv = [process.argv[0], process.argv[1], '--worker', fixture, run, version];
await import('data:text/javascript;base64,' + Buffer.from(source).toString('base64'));
