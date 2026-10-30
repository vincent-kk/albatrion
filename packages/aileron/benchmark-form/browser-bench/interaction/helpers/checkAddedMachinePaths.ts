import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { gunzipSync } from 'node:zlib';

/**
 * Audit additions independently of frozen browser-result reproduction.
 * @param repository - Git checkout containing the reviewed changes.
 * @param base - Commit SHA defining the reviewed additions, including pending files.
 * @returns Nothing; throws for invalid bases or new machine paths. Compressed
 * evidence and untracked files are inspected in full; retained text uses added lines.
 */
export function checkAddedMachinePaths(repository: string, base: string): void {
  assert.match(base, /^[a-f0-9]{7,40}$/i, 'Audit requires a commit SHA');
  const changed = execFileSync(
    'git',
    ['diff', '--name-only', '-z', base],
    { cwd: repository, encoding: 'utf8' },
  )
    .split('\0')
    .filter(Boolean);
  const untracked = execFileSync(
    'git',
    ['ls-files', '--others', '--exclude-standard', '-z'],
    { cwd: repository, encoding: 'utf8' },
  )
    .split('\0')
    .filter(Boolean);
  const machinePath = new RegExp('/' + '(?:Users|private/tmp|home)/');
  for (const file of [...changed, ...untracked]) {
    const location = path.join(repository, file);
    if (!fs.existsSync(location) || !fs.statSync(location).isFile()) continue;
    let additions: string;
    if (file.endsWith('.gz')) {
      additions = gunzipSync(fs.readFileSync(location)).toString();
    } else if (untracked.indexOf(file) !== -1) {
      additions = fs.readFileSync(location, 'utf8');
    } else {
      const diff = execFileSync(
        'git',
        ['diff', '--no-ext-diff', '--no-textconv', '--unified=0', base, '--', file],
        { cwd: repository, encoding: 'utf8' },
      );
      const lines: string[] = [];
      let inHunk = false;
      for (const line of diff.split('\n')) {
        if (line.startsWith('diff --git ')) inHunk = false;
        else if (line.startsWith('@@ ')) inHunk = true;
        else if (inHunk && line.startsWith('+')) lines.push(line.slice(1));
      }
      additions = lines.join('\n');
    }
    assert.ok(!machinePath.test(additions), file + ' contains a new machine path');
  }
  console.log(`BROWSER_CHANGES_AUDIT_OK base=${base} newMachinePaths=0`);
}
