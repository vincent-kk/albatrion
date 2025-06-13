import tsPlugin from '@rollup/plugin-typescript';
import fs from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import copy from 'rollup-plugin-copy';

const __dirname = dirname(fileURLToPath(import.meta.url));
const packagesRoot = resolve(__dirname, '../../');
/**
 * @type {{
 *   exports: Record<string, string>;
 *   publishConfig: { browser: string };
 * }}
 */
const packageJson = createRequire(import.meta.url)('./package.json');

const baseExternal = (path) => {
  if (path.startsWith('@aileron')) return false;
  if (path.startsWith('@winglet') && path !== '@winglet/react-utils')
    return true;
  return /node_modules/.test(path);
};
export default () => {
  clearDir('dist');
  const entrypoints = Object.values(packageJson.exports).filter(
    (f) => /^(\.\/)?src\//.test(f) && f.endsWith('.ts'),
  );

  return [
    libBuildOptions({
      format: 'esm',
      extension: 'mjs',
      entrypoints,
      outDir: 'dist',
      sourcemap: false,
    }),
    libBuildOptions({
      format: 'cjs',
      extension: 'cjs',
      entrypoints,
      outDir: 'dist',
      sourcemap: false,
    }),
  ];
};

/**
 * @type {(options: {
 *   entrypoints: string[];
 *   format: 'esm' | 'cjs';
 *   extension: 'js' | 'cjs' | 'mjs';
 *   outDir: string;
 *   sourcemap: boolean;
 * }) => import('rollup').RollupOptions}
 */
function libBuildOptions({
  entrypoints,
  extension,
  format,
  outDir,
  sourcemap,
}) {
  return {
    input: mapInputs(entrypoints),
    plugins: [
      tsPlugin({
        tsconfig: join(__dirname, 'tsconfig.json'),
        compilerOptions: {
          sourceMap: sourcemap,
          inlineSources: sourcemap || undefined,
          removeComments: !sourcemap,
          declarationMap: false,
          declaration: false,
          composite: false,
        },
        include: ['src/**/*'],
        exclude: [
          'node_modules',
          'coverage',
          '**/__tests__/**',
          '**/*.test.ts',
          '**/*.spec.ts',
        ],
      }),
      copy({
        targets: [
          {
            src: resolve(packagesRoot, 'aileron/common/**/*.d.ts'),
            dest: 'dist/@aileron/declare',
          },
        ],
        copyOnce: true,
        flatten: true,
      }),
    ],
    external: baseExternal,
    output: {
      format,
      dir: outDir,
      ...fileNames(extension),
      // Using preserveModules disables bundling and the creation of chunks,
      // leading to a result that is a mirror of the input module graph.
      preserveModules: true,
      preserveModulesRoot: 'src',
      sourcemap,
      // Hoisting transitive imports adds bare imports in modules,
      // which can make imports by JS runtimes slightly faster,
      // but makes the generated code harder to follow.
      hoistTransitiveImports: false,
    },
  };
}

/** @type {(srcFiles: string[]) => Record<string, string>} */
function mapInputs(srcFiles) {
  return Object.fromEntries(
    srcFiles.map((file) => [
      file.replace(/^(\.\/)?src\//, '').replace(/\.[cm]?(js|ts)$/, ''),
      join(__dirname, file),
    ]),
  );
}

function fileNames(extension = 'js') {
  return {
    entryFileNames: `[name].${extension}`,
    chunkFileNames: `chunk/[name]-[hash:6].${extension}`,
  };
}

/** @type {(dir: string) => void} */
function clearDir(dir) {
  const dirPath = join(__dirname, dir);
  if (dir && fs.existsSync(dirPath)) {
    fs.rmSync(dirPath, { recursive: true, force: true });
    console.log(`cleared: ${dir}`);
  }
}
