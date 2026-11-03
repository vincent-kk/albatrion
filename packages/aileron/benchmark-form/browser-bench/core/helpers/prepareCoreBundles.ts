import { build } from 'esbuild';
import { createHash } from 'node:crypto';
import { cpSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

/**
 * Freeze the same candidate-owned harness against independently built products.
 * @param repository - Checkout providing the canonical harness and browser dependencies.
 * @param output - Empty generated bundle directory, outside tracked source files.
 * @param baseline - Optional independently built product checkout.
 * @returns Path-free bundle hashes; control is copied byte for byte from baseline.
 */
export async function prepareCoreBundles(
  repository: string,
  output: string,
  baseline?: string,
) {
  const roots: Record<string, string> = { candidate: repository };
  if (baseline) roots.baseline = baseline;
  const hashes: Record<string, string> = {};
  for (const [variant, root] of Object.entries(roots)) {
    const directory = join(output, variant);
    mkdirSync(directory, { recursive: true });
    await build({
      entryPoints: [
        join(
          repository,
          'packages/aileron/benchmark-form/browser-bench/core/harness.tsx',
        ),
      ],
      bundle: true,
      format: 'iife',
      platform: 'browser',
      jsx: 'automatic',
      outfile: join(directory, 'bundle.js'),
      define: { 'process.env.NODE_ENV': '"production"' },
      alias: {
        react: join(repository, 'node_modules/react'),
        'react-dom': join(repository, 'node_modules/react-dom'),
        '@canard/schema-form': join(
          root,
          'packages/canard/schema-form/dist/index.mjs',
        ),
        '@canard/schema-form-ajv8-plugin': join(
          root,
          'packages/canard/schema-form-ajv8-plugin/dist/default/index.mjs',
        ),
      },
      nodePaths: [join(repository, 'node_modules')],
      logLevel: 'warning',
    });
    writeFileSync(
      join(directory, 'index.html'),
      '<!doctype html><html><head><meta charset="utf-8"></head><body><div id="root" style="width:800px"></div><script src="bundle.js"></script></body></html>',
    );
    hashes[variant] = createHash('sha256')
      .update(readFileSync(join(directory, 'bundle.js')))
      .digest('hex');
  }
  if (baseline) {
    cpSync(join(output, 'baseline'), join(output, 'control'), {
      recursive: true,
    });
    hashes.control = createHash('sha256')
      .update(readFileSync(join(output, 'control/bundle.js')))
      .digest('hex');
    if (hashes.control !== hashes.baseline)
      throw new Error('Control must be byte-identical to baseline');
  }
  return hashes;
}
