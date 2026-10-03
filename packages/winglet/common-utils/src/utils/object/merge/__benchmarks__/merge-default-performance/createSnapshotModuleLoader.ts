import { execFileSync } from 'node:child_process';
import { resolve } from 'node:path';

import type { SnapshotModuleState } from './createSnapshotModuleLoader/type';
import { loadSnapshotModule } from './createSnapshotModuleLoader/utils/loadSnapshotModule';

/**
 * Create a source-only benchmark loader without external packages or builtin access.
 * @param revision - Immutable git source revision or the current workspace source.
 * @param packageRoot - Common-utils package root supplied by the benchmark harness.
 * @returns An isolated module loader plus hashes for the source graph it actually read.
 */
export const createSnapshotModuleLoader = (
  revision: string,
  packageRoot: string,
) => {
  const root = resolve(packageRoot);
  const prefix = 'packages/winglet/common-utils/';
  const listing =
    revision === 'workspace'
      ? execFileSync(
          'rg',
          ['--files', 'src', '-g', '*.ts', '-g', '*.tsx', '-g', '*.js'],
          { cwd: root, encoding: 'utf8' },
        )
      : execFileSync(
          'git',
          [
            'ls-tree',
            '--full-tree',
            '-r',
            '--name-only',
            revision,
            '--',
            `${prefix}src`,
          ],
          { cwd: root, encoding: 'utf8' },
        );
  const paths = new Set(
    listing
      .split('\n')
      .map((path) =>
        path.startsWith(prefix) ? path.slice(prefix.length) : path,
      )
      .filter(
        (path) => path.startsWith('src/') && /\.(?:ts|tsx|js)$/.test(path),
      ),
  );
  const state: SnapshotModuleState = {
    revision,
    packageRoot: root,
    paths,
    modules: new Map(),
    sourceHashes: new Map(),
  };
  return {
    load: (path: string) => loadSnapshotModule(path, state),
    sourceHashes: state.sourceHashes,
  };
};
