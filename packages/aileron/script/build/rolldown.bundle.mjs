/**
 * Rolldown option factory for the **bundle** build shape: the package's own
 * source collapsed into a single output file per format.
 *
 * Imported by each package's `rolldown.config.mjs`; the caller passes
 * `import.meta.url` so paths resolve against the package directory rather than
 * this file. TypeScript is handled by rolldown's built-in oxc transform driven
 * by the package's `tsconfig.json`, and module resolution plus CommonJS interop
 * are built in — there are no resolve/commonjs/TypeScript plugins.
 *
 * Declarations (.d.ts) are NOT produced here; `buildTypes.mjs` runs tsc for
 * that as a separate step.
 */
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { createClearDir } from './utils/createClearDir.mjs';
import { createCopyDeclarations } from './utils/createCopyDeclarations.mjs';
import {
  TRANSFORM_TARGET,
  getCodegenOptions,
} from './utils/getCodegenOptions.mjs';
import { isExternalModule } from './utils/isExternalModule.mjs';
import { validateBundleOptions } from './utils/validateBuildOptions.mjs';

export const getBundleBuildOptions = (callerUrl) => ({
  /**
   * @type {(options: {
   *   entry?: string;
   *   entrypoints?: string[];
   *   format: 'esm' | 'cjs' | 'umd' | 'iife';
   *   outFile?: string;
   *   outDir?: string;
   *   name?: string;
   *   sourcemap?: boolean;
   *   minify?: boolean | import('rolldown').MinifyOptions;
   *   external?: (id: string) => boolean;
   *   tsconfig?: string;
   * }) => Promise<import('rolldown').RolldownOptions>}
   */
  bundleBuildOptions: createBundleBuildOptions(callerUrl),
  /**
   * @type {(dir: string) => void}
   */
  clearDir: createClearDir(callerUrl),
});

const createBundleBuildOptions = (callerUrl) => async (options) => {
  validateBundleOptions(options);

  const {
    entry,
    entrypoints,
    format,
    outFile,
    outDir,
    name,
    sourcemap = false,
    minify = false,
    external,
    tsconfig,
  } = options;

  const callerDir = dirname(fileURLToPath(callerUrl));
  const packagesRoot = resolve(callerDir, '../../');

  const isSingleBundle = !!entry;
  const inputConfig = isSingleBundle
    ? resolve(callerDir, entry)
    : mapInputs(callerDir, entrypoints);

  if (isSingleBundle && !outFile) {
    throw new Error('outFile is required when using single entry');
  }
  if (!isSingleBundle && !outDir) {
    throw new Error('outDir is required when using multiple entrypoints');
  }

  const declarationsTargetDir = isSingleBundle
    ? resolve(callerDir, dirname(outFile), '@aileron/declare')
    : resolve(callerDir, outDir, '@aileron/declare');

  const codegen = { ...getCodegenOptions(sourcemap), minify };
  // ESM output reads external bindings once instead of through live getters,
  // which is safe here because nothing in this repo re-exports a binding an
  // external package mutates after load. There is deliberately no interop or
  // namespace-freeze setting: rolldown picks CJS interop per output format and
  // never freezes namespace objects.
  const esmOnly =
    format === 'esm' ? { externalLiveBindings: false } : undefined;

  return {
    input: inputConfig,
    external: external || isExternalModule,
    tsconfig: tsconfig || join(callerDir, 'tsconfig.json'),
    transform: { target: TRANSFORM_TARGET },
    plugins: [
      createCopyDeclarations({
        sourceDir: resolve(packagesRoot, 'aileron/common'),
        targetDir: declarationsTargetDir,
      }),
    ],
    output: isSingleBundle
      ? {
          file: resolve(callerDir, outFile),
          format,
          name: format === 'umd' || format === 'iife' ? name : undefined,
          sourcemap,
          ...codegen,
          ...esmOnly,
        }
      : {
          format,
          dir: outDir,
          name: format === 'umd' || format === 'iife' ? name : undefined,
          sourcemap,
          preserveModules: true,
          preserveModulesRoot: 'src',
          ...codegen,
          ...esmOnly,
        },
  };
};

/** @type {(dirName: string, srcFiles: string[]) => Record<string, string>} */
const mapInputs = (dirName, srcFiles) => {
  if (!srcFiles || srcFiles.length === 0) {
    throw new Error('No source files provided');
  }

  return Object.fromEntries(
    srcFiles.map((file) => [
      file.replace(/^(\.\/)?src\//, '').replace(/\.[cm]?(js|ts)$/, ''),
      join(dirName, file),
    ]),
  );
};
