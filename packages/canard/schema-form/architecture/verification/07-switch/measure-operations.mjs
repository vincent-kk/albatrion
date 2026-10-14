// Run from benchmark-form; this counts work and does not record timing.
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath, pathToFileURL } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const pkg = path.resolve(here, '../../..');
const { build } = createRequire(path.join(pkg, 'package.json'))('esbuild');
const outfile = path.join(here, '.performance/operation-counts.mjs');
const bump = (key) => `globalThis.__operations.${key}++;`;
await build({
  stdin: { contents: `export {nodeFromJSONSchema} from ${JSON.stringify(path.join(pkg, 'src/core/index.ts'))}; export {equivalentFixtures} from ${JSON.stringify(path.join(process.cwd(), 'fixtures/equivalent/index.ts'))};`, resolveDir: process.cwd(), loader: 'ts' },
  outfile, bundle: true, packages: 'external', platform: 'node', format: 'esm',
  plugins: [{ name: 'work-counters', setup(builder) {
    builder.onLoad({ filter: /\/(DirtyPathSet|isMissingRaw|getDeriveRuleTable|withdrawDetachedFills)\.ts$/ }, ({ path: sourcePath }) => {
      let source = fs.readFileSync(sourcePath, 'utf8');
      if (sourcePath.endsWith('/DirtyPathSet.ts')) source = source
        .replaceAll('children.set(current, current.slice(slash + 1));', `${bump('directLinks')} children.set(current, current.slice(slash + 1));`)
        .replace('children.set(path, name);', `${bump('prefixLinks')} children.set(path, name);`);
      if (sourcePath.endsWith('/isMissingRaw.ts')) source = source
        .replace('if (node.raw !== undefined)', `${bump('sourceVisits')} if (node.raw !== undefined)`);
      if (sourcePath.endsWith('/getDeriveRuleTable.ts')) source = source
        .replace('const schema = declaration.schema;', `${bump('deriveDeclarations')} const schema = declaration.schema;`);
      if (sourcePath.endsWith('/withdrawDetachedFills.ts')) source = source
        .replace('if (!node.detached) continue;', `if (!node.detached) continue; ${bump('detachedFills')}`)
        .replace('const entry = context.automaticLog[index];', `${bump('withdrawLogEntries')} const entry = context.automaticLog[index];`);
      return { contents: source, loader: 'ts' };
    });
  } }],
});
const { nodeFromJSONSchema, equivalentFixtures } = await import(pathToFileURL(outfile).href);
const reset = () => globalThis.__operations = {
  directLinks: 0, prefixLinks: 0, sourceVisits: 0, deriveDeclarations: 0,
  detachedFills: 0, withdrawLogEntries: 0,
};
const rows = [];
for (const fixture of equivalentFixtures) {
  reset();
  const root = nodeFromJSONSchema({ jsonSchema: fixture.workspace, validationMode: 0, onChange() {} });
  rows.push({ fixture: fixture.name, mode: 'mount', ...globalThis.__operations });
  reset();
  for (const interaction of fixture.interactions) root.find(interaction.path).setValue(interaction.value);
  rows.push({ fixture: fixture.name, mode: 'update', ...globalThis.__operations });
}
fs.writeFileSync(path.join(here, 'operation-counts.json'), JSON.stringify({ node: process.version, rows }, null, 2));
console.log(JSON.stringify(rows, null, 2));
