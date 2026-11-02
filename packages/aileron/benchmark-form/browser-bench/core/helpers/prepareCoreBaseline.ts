import { execFileSync } from 'node:child_process';
import { mkdtempSync, rmSync } from 'node:fs';
import { join, resolve } from 'node:path';

import { buildCoreCheckout } from './buildCoreCheckout';

/**
 * Prepare the baseline without borrowing candidate installs or built products.
 * @param repository - Candidate Git checkout owning a temporary worktree.
 * @param ref - Local Git ref; mutually exclusive with preparedDirectory.
 * @param preparedDirectory - Independently installed, prebuilt checkout to use as supplied.
 * @param scratchDirectory - Output directory receiving temporary checkout files.
 * @returns Baseline root and cleanup; a failed temporary build removes its worktree.
 */
export function prepareCoreBaseline(
  repository: string,
  ref?: string,
  preparedDirectory?: string,
  scratchDirectory = '.',
) {
  if (preparedDirectory)
    return { root: resolve(preparedDirectory), cleanup() {} };
  if (!ref) return { root: undefined, cleanup() {} };
  const commit = execFileSync(
    'git',
    ['rev-parse', '--verify', '--end-of-options', `${ref}^{commit}`],
    { cwd: repository, encoding: 'utf8' },
  ).trim();
  const scratch = mkdtempSync(join(scratchDirectory, '.baseline-'));
  const root = join(scratch, 'checkout');
  execFileSync('git', ['worktree', 'add', '--detach', root, commit], {
    cwd: repository,
    stdio: 'inherit',
  });
  const cleanup = () => {
    execFileSync('git', ['worktree', 'remove', '--force', root], {
      cwd: repository,
      stdio: 'inherit',
    });
    rmSync(scratch, { recursive: true, force: true });
  };
  try {
    execFileSync('yarn', ['install', '--immutable'], {
      cwd: root,
      stdio: 'inherit',
    });
    buildCoreCheckout(root);
    return { root, cleanup };
  } catch (error) {
    cleanup();
    throw error;
  }
}
