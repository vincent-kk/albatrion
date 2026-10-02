// Run from schema-form after npx --no-install rolldown -c.
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const directory = path.join(here, '.performance');
fs.mkdirSync(directory, { recursive: true });
const common = ['--no-install', 'esbuild@0.25.9', '--bundle', '--minify', '--format=esm', '--packages=external'];
for (const [label, input] of [['dist', 'dist/index.mjs'], ['source', 'src/index.ts']]) {
  execFileSync('npx', [...common, input, `--outfile=${directory}/${label}.min.mjs`,
    `--metafile=${here}/bundle-${label}.metafile.json`], { stdio: 'pipe' });
}
const source = JSON.parse(fs.readFileSync(path.join(here, 'bundle-source.metafile.json'), 'utf8'));
const groups = {};
let attributed = 0;
for (const output of Object.values(source.outputs)) {
  for (const [input, contribution] of Object.entries(output.inputs)) {
    const relative = input.replace(/^.*?src\//, '');
    const segments = relative.split('/');
    const group = segments[0] === 'core' ? segments.slice(0, 2).join('/') : segments[0];
    groups[group] = (groups[group] ?? 0) + contribution.bytesInOutput;
    attributed += contribution.bytesInOutput;
  }
}
const sourceBytes = fs.statSync(path.join(directory, 'source.min.mjs')).size;
groups['bundle wrapper/exports'] = sourceBytes - attributed;
const result = {
  esbuild: execFileSync('npx', ['--no-install', 'esbuild@0.25.9', '--version'], { encoding: 'utf8' }).trim(),
  distBytes: fs.statSync('dist/index.mjs').size,
  distMinifiedBytes: fs.statSync(path.join(directory, 'dist.min.mjs')).size,
  distMinifiedGzipBytes: execFileSync('gzip', ['-9', '-c', path.join(directory, 'dist.min.mjs')]).length,
  distGzipBytes: execFileSync('gzip', ['-9', '-c', 'dist/index.mjs']).length,
  sourceMinifiedBytes: sourceBytes,
  sourceMinifiedGzipBytes: execFileSync('gzip', ['-9', '-c', path.join(directory, 'source.min.mjs')]).length,
  groups: Object.fromEntries(Object.entries(groups).sort((a, b) => b[1] - a[1])),
  note: 'Fractal attribution is bytesInOutput from source-entry bundling; dist-entry bundling preserves the TEST-075 budget method. Gzip bytes are not additive by source file.',
};
fs.writeFileSync(path.join(here, 'bundle-82c01.json'), JSON.stringify(result, null, 2));
console.log(JSON.stringify(result, null, 2));
