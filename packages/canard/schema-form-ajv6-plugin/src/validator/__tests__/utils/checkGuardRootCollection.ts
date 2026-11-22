import { execFileSync } from 'node:child_process';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

/**
 * Exercise the actual compiler in an isolated process with garbage collection.
 * @param directGuardCompile - The compilation path whose weak ownership is checked.
 * @param dialect - The AJV8 entry point; older plugins use the default dialect.
 * @param pointer - The original root or its nested conditional guard.
 * @returns The success marker only after an abandoned original root is collected.
 */
export const checkGuardRootCollection = (
  directGuardCompile: boolean,
  dialect = 'default',
  pointer = '',
): string => {
  const packageRoot = resolve(dirname(fileURLToPath(import.meta.url)), '../../../..');
  const worktreeRoot = resolve(packageRoot, '../../..');
  const script = `
    const fs = require('node:fs');
    const path = require('node:path');
    const ts = require('typescript');
    const [packageRoot, direct, dialect, pointer] = process.argv.slice(1);
    require.extensions['.ts'] = (module, filename) => {
      const output = ts.transpileModule(fs.readFileSync(filename, 'utf8'), {
        compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true },
      }).outputText;
      module._compile(output, filename);
    };
    const version = Number(packageRoot.match(/ajv([678])-plugin/)[1]);
    const moduleName = dialect === 'default' ? 'ajv' : 'ajv/dist/' + dialect + '.js';
    const imported = require(require.resolve(moduleName, { paths: [packageRoot] }));
    const Constructor = typeof imported === 'function' ? imported : imported.default;
    const instance = new Constructor(version === 6 ? { format: false } : { strict: false });
    const entry = version === 8 ? dialect + '/index.ts' : 'index.ts';
    const { createValidator } = require(path.join(packageRoot, 'src', entry));
    const adapter = createValidator(instance, { directGuardCompile: direct === 'true' });
    const makeRoot = () => {
      const root = pointer === '/if' ? { type: 'object', if: { type: 'string' } } : { type: 'string' };
      const reference = new WeakRef(root);
      adapter.compileGuard(root, pointer);
      return reference;
    };
    const reference = makeRoot();
    (async () => {
      for (let attempt = 0; attempt < 20; attempt++) {
        await new Promise((resolve) => setImmediate(resolve));
        global.gc();
        if (reference.deref() === undefined) {
          console.log('GUARD_ROOT_COLLECTED');
          return;
        }
      }
      throw new Error('Original guard root remains retained');
    })().catch((error) => { console.error(error.message); process.exitCode = 1; });
  `;
  return execFileSync(process.execPath, [
    '--expose-gc', '-e', script, packageRoot, String(directGuardCompile), dialect, pointer,
  ], { cwd: worktreeRoot, encoding: 'utf8' }).trim();
};
