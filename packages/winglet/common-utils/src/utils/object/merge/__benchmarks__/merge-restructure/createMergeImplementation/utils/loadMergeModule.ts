import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { ModuleKind, ScriptTarget, transpileModule } from 'typescript';

/**
 * Compile either local source snapshot through the same benchmark loading path.
 * @param revision - Pinned local source commit, or workspace for the candidate
 * @param path - Path inside the common-utils object module at that commit
 * @param modules - Explicit permitted local imports supplied by the benchmark
 * @returns The source module's named exports with no package discovery or installation
 */
export const loadMergeModule = (
  revision: string,
  path: string,
  modules: Record<string, unknown>,
): Record<string, unknown> => {
  const source =
    revision === 'workspace'
      ? readFileSync(resolve('src/utils/object', path), 'utf8')
      : execFileSync(
          'git',
          [
            'show',
            `${revision}:packages/winglet/common-utils/src/utils/object/${path}`,
          ],
          { encoding: 'utf8' },
        );
  const compiled = transpileModule(source, {
    compilerOptions: {
      module: ModuleKind.CommonJS,
      target: ScriptTarget.ES2022,
    },
  }).outputText;
  const exports: Record<string, unknown> = {};
  new Function('exports', 'require', compiled)(exports, (name: string) => {
    if (!(name in modules))
      throw new Error(`Unexpected baseline import: ${name}`);
    return modules[name];
  });
  return exports;
};
