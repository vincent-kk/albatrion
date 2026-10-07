// Builds test engines without altering product source; only esbuild's outputs use the scratch bundle directory.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const script = fileURLToPath(import.meta.url);
const directory = path.dirname(script);
const [phase, version, mode = 'production'] = process.argv.slice(2);
let source = fs.readFileSync(path.resolve(directory, '../profile-104-owned/measure.mjs'), 'utf8');
source = source.slice(0, source.indexOf("else if (command === 'count')"));
const replacements = [
  ["const HEAD = 'baf4cacb647ad3de7dbff7c232efddf55b0bc546';", "const HEAD = '4d4792307dd4f0545b2fef3c2dd7a4860588c8cd';"],
  ['owned104-', `event110-diff-${phase}-`],
  ['fileURLToPath(import.meta.url)', JSON.stringify(script)],
  ["const [command, ...args] = process.argv.slice(2);", `const command = 'build'; const args = ${JSON.stringify([version, ...(mode === 'development' ? ['dev'] : [])])};`],
  ["const entry = exports.map", "const entry = `export {markSchemaNodeEvent, SchemaNodeEventType} from ${JSON.stringify(path.join(pkg, 'src/core/record/index.ts'))};\\n` + exports.map"],
  ["fs.writeFileSync(path.join(directory, name + '.json'), text);", `console.log('NATIVE_ARTIFACT ' + JSON.stringify({ file: path.join(directory, ${JSON.stringify('diff-' + phase + '-')} + name + '.json'), text }));`],
];
for (const [before, after] of replacements) {
  assert(source.includes(before), before);
  source = source.split(before).join(after);
}
await import('data:text/javascript;base64,' + Buffer.from(source).toString('base64'));
