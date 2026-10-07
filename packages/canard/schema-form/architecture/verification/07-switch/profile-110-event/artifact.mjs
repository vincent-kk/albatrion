// Per-candidate cumulative-base patches; the host persists stdout through native file tools.
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const directory = path.dirname(fileURLToPath(import.meta.url));
const repo = path.resolve(directory, '../../../../../../..');
const [command, phase] = process.argv.slice(2);
const baseline = JSON.parse(fs.readFileSync(path.join(directory, phase + '-base.json'), 'utf8'));
if (command === 'restore') {
  for (const [file, text] of Object.entries(baseline.files)) {
    if (text === null) console.log('NATIVE_DELETE ' + path.join(repo, file));
    else console.log('NATIVE_ARTIFACT ' + JSON.stringify({ file: path.join(repo, file), text }));
  }
  console.log(`${phase}: 기반 복원`);
} else {
  assert.equal(command, 'patch');
  const summary = JSON.parse(fs.readFileSync(path.join(directory, phase + '-summary.json'), 'utf8'));
  const pairs = Object.entries(baseline.files).map(([file, before]) => ({ file, before,
    after: fs.existsSync(path.join(repo, file)) ? fs.readFileSync(path.join(repo, file), 'utf8') : null }));
  const python = `import sys,json,difflib
for pair in json.load(sys.stdin):
 if pair['before']==pair['after']: continue
 p=pair['file']
 print('diff --git a/'+p+' b/'+p)
 if pair['before'] is None: print('new file mode 100644')
 if pair['after'] is None: print('deleted file mode 100644')
 sys.stdout.writelines(difflib.unified_diff((pair['before'] or '').splitlines(True),(pair['after'] or '').splitlines(True),fromfile='/dev/null' if pair['before'] is None else 'a/'+p,tofile='/dev/null' if pair['after'] is None else 'b/'+p))
`;
  const result = spawnSync('python3', ['-c', python], { input: JSON.stringify(pairs), encoding: 'utf8', maxBuffer: 5_000_000 });
  assert.equal(result.status, 0, result.stderr); assert.equal(result.signal, null);
  const patch = phase + (summary.adopted ? '.patch' : '-rejected.patch');
  const manifest = { phase, adopted: summary.adopted, measuredBase: phase + '-build-head.json',
    baseBundleSha256: summary.builds.head.bundleSha256, candidateBundleSha256: summary.builds.working.bundleSha256,
    patch, files: pairs.filter(pair => pair.before !== pair.after).map(pair => ({ file: pair.file,
      detailLines: pair.file.endsWith('/DETAIL.md') ? (pair.after ?? '').split('\n').flatMap((line, index) =>
        line.trim() && !(pair.before ?? '').split('\n').includes(line) ? [index + 1] : []) : undefined })) };
  for (const [file, text] of [[patch, result.stdout], [phase + '-files.json', JSON.stringify(manifest, null, 2) + '\n']]) {
    assert(Buffer.byteLength(text) <= 5_000_000);
    console.log('NATIVE_ARTIFACT ' + JSON.stringify({ file: path.join(directory, file), text }));
  }
  console.log(JSON.stringify(manifest));
}
