import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';

/**
 * Loads the shipped CommonJS artifact with the renderer's React runtime.
 * @returns the public API from an independently evaluated package copy
 */
export async function loadCommonJS(): Promise<
  typeof import('@lerx/promise-modal')
> {
  const require = createRequire(import.meta.url);
  if (process.env.REACT_COMPATIBILITY_MAJOR !== '18')
    return require('@lerx/promise-modal');
  const dependencies = new Map<string, unknown>([
    ['react', await import('react')],
    ['react/jsx-runtime', await import('react/jsx-runtime')],
    ['react-dom', await import('react-dom')],
    ['@winglet/react-utils/hook', await import('@winglet/react-utils/hook')],
    ['@winglet/react-utils/hoc', await import('@winglet/react-utils/hoc')],
    [
      '@winglet/react-utils/filter',
      await import('@winglet/react-utils/filter'),
    ],
    [
      '@winglet/react-utils/render',
      await import('@winglet/react-utils/render'),
    ],
  ]);
  const source = readFileSync(require.resolve('@lerx/promise-modal'), 'utf8');
  const evaluate = new Function(
    'require',
    `const module = { exports: {} }; const exports = module.exports;\n${source}\nreturn module.exports;`,
  );
  return evaluate((name: string) => dependencies.get(name) ?? require(name));
}
