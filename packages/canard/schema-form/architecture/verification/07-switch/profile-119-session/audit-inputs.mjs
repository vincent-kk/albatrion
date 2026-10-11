// Invoked by Node; hashes source bytes and read-only Git state without changing the worktree.
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { directory, pkg, repo, scratch, HEAD, hash, git } from './runtime.mjs';

const phase = process.argv[2];
assert(['before', 'after'].includes(phase));
const sourceFiles = execFileSync('rg', ['--files', '--hidden', 'src'], { cwd: pkg, encoding: 'utf8' }).trim().split('\n').sort();
const sourceHasher = createHash('sha256');
for (const file of sourceFiles) sourceHasher.update(file + '\0').update(fs.readFileSync(path.join(pkg, file)));
const sourceSha256 = sourceHasher.digest('hex');
const sourceDiffSha256 = hash(git(['diff', '--no-ext-diff', 'HEAD', '--', 'packages/canard/schema-form/src']));
const implementationChecks = [];
if (phase === 'before') {
  for (const patchName of ['branch1b.patch', 'branch2.patch']) {
    const patch = fs.readFileSync(path.join(scratch, '..', patchName), 'utf8');
    for (const section of patch.split(/(?=^diff --git )/m).filter(Boolean)) {
      const file = section.match(/^diff --git a\/(\S+) b\/(\S+)/)?.[2];
      if (!file?.includes('/src/core/settle/utils/')) continue;
      let before;
      try { before = git(['show', HEAD + ':' + file]); }
      catch { before = ''; }
      const oldLines = before ? before.split('\n').slice(0, -1) : [], output = [];
      const lines = section.split('\n');
      let cursor = 0;
      for (let index = 0; index < lines.length; index++) {
        const header = lines[index].match(/^@@ -(\d+)(?:,(\d+))? \+(\d+)(?:,(\d+))? @@/);
        if (!header) continue;
        const begin = Math.max(0, Number(header[1]) - 1);
        output.push(...oldLines.slice(cursor, begin)); cursor = begin;
        for (index++; index < lines.length && !lines[index].startsWith('@@ '); index++) {
          const line = lines[index];
          if (line.startsWith(' ') || line.startsWith('-')) {
            assert.equal(oldLines[cursor], line.slice(1), patchName + '/' + file + ' context'); cursor++;
          }
          if (line.startsWith(' ') || line.startsWith('+')) output.push(line.slice(1));
        }
        index--;
      }
      output.push(...oldLines.slice(cursor));
      const after = output.join('\n') + '\n';
      assert.equal(after, fs.readFileSync(path.join(repo, file), 'utf8'), patchName + '/' + file + ' must match working bytes');
      implementationChecks.push({ patchName, file, sha256: hash(after), matches: true });
    }
  }
}
const result = { phase, time: new Date().toISOString(), HEAD, sourceFileCount: sourceFiles.length,
  sourceSha256, sourceDiffSha256, implementationChecks,
  environment: { node: process.version, executable: process.execPath, v8: process.versions.v8 },
  patchHashes: Object.fromEntries(['branch1b.patch', 'branch2.patch'].map(file => [file, hash(fs.readFileSync(path.join(scratch, '..', file)))])) };
if (phase === 'after') {
  const before = JSON.parse(fs.readFileSync(path.join(directory, 'audit-before.json'), 'utf8'));
  assert.equal(result.sourceSha256, before.sourceSha256);
  assert.equal(result.sourceDiffSha256, before.sourceDiffSha256);
  assert.deepEqual(result.patchHashes, before.patchHashes);
}
fs.writeFileSync(path.join(directory, 'audit-' + phase + '.json'), JSON.stringify(result, null, 2) + '\n', { flag: 'wx' });
console.log('AUDIT_' + phase.toUpperCase() + '_OK: source bytes and independent patch inputs checked');
