// Sequential adapter to the canonical verdict clock; generated bundles live outside the repository.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const script = fileURLToPath(import.meta.url);
const directory = path.dirname(script);
const HEAD = '4d4792307dd4f0545b2fef3c2dd7a4860588c8cd';
const [command, phase, ...args] = process.argv.slice(2);
assert(['AA', '1-d1-commit-membership', '2-e1-update-value'].includes(phase));
assert(['build', 'pair'].includes(command));
let source = fs.readFileSync(path.resolve(directory, '../profile-104-owned/measure.mjs'), 'utf8');
source = source.slice(0, source.indexOf("else if (command === 'count')"));
const replacements = [
  ["const HEAD = 'baf4cacb647ad3de7dbff7c232efddf55b0bc546';", `const HEAD = '${HEAD}';`],
  ['owned104-', `event110-${phase}-`],
  ['fileURLToPath(import.meta.url)', JSON.stringify(script)],
  ["process.once('exit', status => save", "process.once('beforeExit', status => save"],
  ["const [command, ...args] = process.argv.slice(2);",
    `const command = ${JSON.stringify(command)}; const args = ${JSON.stringify(command === 'pair'
      ? ['forced', ...args, phase === 'AA' ? 'control' : 'working'] : args)};`],
  ["const content = version === 'head' || version === 'control' ? git(['show', `${HEAD}:${relative}`]) : fs.readFileSync(file, 'utf8');",
    `const snapshot = version === 'head' && ${JSON.stringify(phase)} !== 'AA' ? JSON.parse(fs.readFileSync(path.join(directory, ${JSON.stringify(phase + '-base.json')}), 'utf8')).files : undefined;
          const content = ${JSON.stringify(phase)} === 'AA' ? git(['show', \`\${HEAD}:\${relative}\`]) : snapshot?.[relative] ?? fs.readFileSync(file, 'utf8');`],
  ["fs.writeFileSync(path.join(directory, name + '.json'), text);",
    `console.log('NATIVE_ARTIFACT ' + JSON.stringify({ file: path.join(directory, ${JSON.stringify(phase + '-')} + name + '.json'), text }));`],
];
for (const [before, after] of replacements) {
  assert(source.includes(before), before);
  source = source.split(before).join(after);
}
await import('data:text/javascript;base64,' + Buffer.from(source).toString('base64'));
