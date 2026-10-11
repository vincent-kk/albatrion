// Observe cache files without configuring or creating a Vite cache directory.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const directory = path.dirname(fileURLToPath(import.meta.url));
const pkg = path.resolve(directory, '../../../..'), repo = path.resolve(pkg, '../../..');
const mode = process.argv[2];
const files = [];
const pending = [path.join(pkg, 'node_modules/.vite'), path.join(pkg, 'node_modules/.cache'),
  path.join(repo, 'node_modules/.vite'), path.join(repo, 'node_modules/.cache')];
while (pending.length) {
  const file = pending.pop();
  if (!fs.existsSync(file)) continue;
  const stat = fs.statSync(file);
  if (stat.isDirectory()) for (const name of fs.readdirSync(file)) pending.push(path.join(file, name));
  else files.push({ file, bytes: stat.size, mtimeMs: stat.mtimeMs });
}
files.sort((a, b) => a.file.localeCompare(b.file));
if (mode === 'after') {
  const before = JSON.parse(fs.readFileSync(path.join(directory, 'cache-before.json'), 'utf8'));
  assert.deepEqual(files, before, 'No cache file may be written inside the repository');
  console.log('CACHE_UNCHANGED');
} else assert.equal(mode, 'before');
const text = JSON.stringify(files, null, 2) + '\n'; assert(Buffer.byteLength(text) <= 5_000_000);
console.log('NATIVE_ARTIFACT ' + JSON.stringify({ file: path.join(directory, `cache-${mode}.json`), text }));
console.log(`CACHE_AUDIT ${mode}: ${files.length} existing files`);
