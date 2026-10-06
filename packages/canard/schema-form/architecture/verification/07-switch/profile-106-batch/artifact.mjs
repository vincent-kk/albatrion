// CLI snapshots and patches retain only the files belonging to one measured change.
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const directory = path.dirname(fileURLToPath(import.meta.url));
const repo = path.resolve(directory, '../../../../../../..');
const [command, number, ...args] = process.argv.slice(2);
const snapshot = path.join(directory, `base-${number}-files.json`);
if (command === 'snapshot') {
  const files = {};
  for (const file of args) {
    assert(file.startsWith('packages/canard/schema-form/src/'));
    const target = path.join(repo, file);
    files[file] = fs.existsSync(target) ? fs.readFileSync(target, 'utf8') : null;
  }
  const text = JSON.stringify(files, null, 2) + '\n';
  assert(Buffer.byteLength(text) < 5_000_000);
  fs.writeFileSync(snapshot, text);
  console.log(JSON.stringify({ number, files: Object.keys(files) }));
} else if (command === 'patch') {
  const files = JSON.parse(fs.readFileSync(snapshot, 'utf8'));
  const changes = [];
  for (const [file, before] of Object.entries(files)) {
    const target = path.join(repo, file);
    const after = fs.existsSync(target) ? fs.readFileSync(target, 'utf8') : null;
    if (before !== after) changes.push({ file, before, after });
  }
  const code = "import sys,json,difflib\nfor x in json.load(sys.stdin):\n p=x['file']; a=x['before']; b=x['after']; sys.stdout.write('diff --git a/'+p+' b/'+p+'\\n');\n if a is None: sys.stdout.write('new file mode 100644\\n')\n if b is None: sys.stdout.write('deleted file mode 100644\\n')\n sys.stdout.writelines(difflib.unified_diff((a or '').splitlines(keepends=True),(b or '').splitlines(keepends=True),fromfile='/dev/null' if a is None else 'a/'+p,tofile='/dev/null' if b is None else 'b/'+p))\n";
  const patch = execFileSync('python3', ['-c', code], { input: JSON.stringify(changes), encoding: 'utf8', maxBuffer: 5_000_000 });
  assert(Buffer.byteLength(patch) < 5_000_000);
  assert(args[0].endsWith('.patch') && !args[0].includes('/'));
  fs.writeFileSync(path.join(directory, args[0]), patch);
  console.log(JSON.stringify({ number, patch: args[0], bytes: Buffer.byteLength(patch), files: changes.map(x => x.file) }));
} else throw new Error(command);
