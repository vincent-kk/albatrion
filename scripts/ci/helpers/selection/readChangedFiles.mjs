import { spawnSync } from 'node:child_process';

/**
 * Reads a merge-base diff, conservatively selecting all on unavailable bases.
 * @param {string} root Checkout directory.
 * @param {string|undefined} base Base commit supplied by the event.
 * @param {string} head Head commit to compare.
 * @returns {object} Paths and an optional all-workspaces fallback reason.
 */
export function readChangedFiles(root, base, head) {
  if (!base || /^0+$/.test(base)) return { files: [], reason: 'Missing or all-zero base; selecting every workspace' };
  const commit = spawnSync('git', ['cat-file', '-e', `${base}^{commit}`], { cwd: root, encoding: 'utf8' });
  if (commit.status !== 0) return { files: [], reason: `Unreachable base ${base}; selecting every workspace` };
  const mergeBase = spawnSync('git', ['merge-base', base, head], { cwd: root, encoding: 'utf8' });
  if (mergeBase.status !== 0) return { files: [], reason: 'No merge base; selecting every workspace' };
  const diff = spawnSync('git', ['diff', '--name-only', '-z', mergeBase.stdout.trim(), head], { cwd: root, encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });
  if (diff.status !== 0) throw new Error(diff.stderr || 'git diff failed');
  return { files: diff.stdout.split('\0').filter(Boolean), reason: null };
}
