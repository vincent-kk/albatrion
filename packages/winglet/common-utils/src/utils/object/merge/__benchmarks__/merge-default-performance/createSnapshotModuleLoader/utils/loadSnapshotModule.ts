import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { readFileSync, realpathSync } from 'node:fs';
import { resolve, sep } from 'node:path';
import { ModuleKind, ScriptTarget, transpileModule } from 'typescript';

import type { SnapshotModuleState } from '../type';
import { resolveSnapshotModulePath } from './resolveSnapshotModulePath';

/**
 * Execute the actual local module graph with CommonJS export and getter semantics.
 * @param path - Canonical allowed source path within common-utils.
 * @param state - Isolated snapshot cache and provenance collector.
 * @returns The cached module exports; dependencies use the same snapshot and compiler.
 */
export const loadSnapshotModule = (
  path: string,
  state: SnapshotModuleState,
): Record<string, unknown> => {
  if (!state.paths.has(path))
    throw new Error(`Unlisted snapshot source: ${path}`);
  const cached = state.modules.get(path);
  if (cached) return cached.exports;
  const absolute = resolve(state.packageRoot, path);
  if (
    state.revision === 'workspace' &&
    !realpathSync(absolute).startsWith(
      realpathSync(resolve(state.packageRoot, 'src')) + sep,
    )
  )
    throw new Error(`Source symlink escape rejected: ${path}`);
  const source =
    state.revision === 'workspace'
      ? readFileSync(absolute, 'utf8')
      : execFileSync(
          'git',
          ['show', `${state.revision}:packages/winglet/common-utils/${path}`],
          { cwd: state.packageRoot, encoding: 'utf8' },
        );
  state.sourceHashes.set(
    path,
    createHash('sha256').update(source).digest('hex'),
  );
  const compiled = transpileModule(source, {
    compilerOptions: {
      module: ModuleKind.CommonJS,
      target: ScriptTarget.ES2022,
    },
  }).outputText;
  const module = { exports: {} as Record<string, unknown> };
  state.modules.set(path, module);
  const requireLocal = (name: string) =>
    loadSnapshotModule(
      resolveSnapshotModulePath(name, path, state.paths),
      state,
    );
  new Function('exports', 'require', 'module', compiled)(
    module.exports,
    requireLocal,
    module,
  );
  return module.exports;
};
