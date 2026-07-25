/**
 * Rolldown option factory for the **transpile** build shape: one output file
 * per source module, mirroring the `src/` tree.
 *
 * Imported by each package's `rolldown.config.mjs`; the caller passes
 * `import.meta.url` so paths resolve against the package directory rather than
 * this file. TypeScript is handled by rolldown's built-in oxc transform driven
 * by the package's `tsconfig.json` — there is no TypeScript plugin.
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
import { validateBuildOptions } from './utils/validateBuildOptions.mjs';

export { getEntrypoints } from './utils/getEntrypoints.mjs';
export { fixDtsExtensions } from './utils/fixDtsExtensions.mjs';

export const getLibBuildOptions = (callerUrl) => ({
  /**
   * @type {(options: {
   *   entrypoints: string[];
   *   format: 'esm' | 'cjs';
   *   extension: 'js' | 'cjs' | 'mjs';
   *   outDir: string;
   *   sourcemap?: boolean;
   *   external?: (id: string) => boolean;
   *   tsconfig?: string;
   * }) => Promise<import('rolldown').RolldownOptions>}
   */
  libBuildOptions: createLibBuildOptions(callerUrl),
  /**
   * @type {(dir: string) => void}
   */
  clearDir: createClearDir(callerUrl),
});

const createLibBuildOptions = (callerUrl) => async (options) => {
  validateBuildOptions(options);

  const {
    entrypoints,
    extension,
    format,
    outDir,
    sourcemap = false,
    external,
    tsconfig,
  } = options;

  const callerDir = dirname(fileURLToPath(callerUrl));
  const packagesRoot = resolve(callerDir, '../../');

  return {
    input: mapInputs(callerDir, entrypoints),
    external: external || isExternalModule,
    tsconfig: tsconfig || join(callerDir, 'tsconfig.json'),
    transform: { target: TRANSFORM_TARGET },
    // Cross-module constant inlining (rolldown default: `{ mode: 'smart' }`)
    // defeats the point of this build shape: a module whose exports are all
    // inlined away stops being emitted at all, so `src/**/constant.ts` would
    // have no `dist/**/constant.mjs` counterpart. One file in, one file out.
    optimization: { inlineConst: false },
    plugins: [
      createCopyDeclarations({
        sourceDir: resolve(packagesRoot, 'aileron/common'),
        targetDir: resolve(callerDir, outDir, '@aileron/declare'),
      }),
    ],
    output: {
      format,
      dir: outDir,
      ...fileNames(extension),
      preserveModules: true,
      preserveModulesRoot: 'src',
      sourcemap,
      ...getCodegenOptions(sourcemap),
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

/** @type {(extension?: string) => {entryFileNames: string, chunkFileNames: string}} */
const fileNames = (extension = 'js') => ({
  entryFileNames: `[name].${extension}`,
  chunkFileNames: `chunk/[name]-[hash:6].${extension}`,
});
