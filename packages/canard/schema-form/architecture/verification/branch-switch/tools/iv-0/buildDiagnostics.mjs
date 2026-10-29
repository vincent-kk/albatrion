import { build } from 'esbuild';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

import { digest } from '../b9-0/files.mjs';
import { instrumentSource } from './instrumentation/instrumentSource.mjs';

/**
 * Compile immutable IV-0-only observation bundles from unchanged product sources.
 * @param {string} packageDir - Canonical package root
 * @param {string} output - Prepared external .noindex directory
 * @returns Manifest with source hashes and inserted sites per mode
 */
export async function buildDiagnostics(packageDir, output) {
  const exports = {
    'errors/index.ts': ['FormErrorCode', 'FormWarningCode'],
    'core/surface/index.ts': [
      'buildFieldNodeTree',
      'mountFieldNode',
      'fieldNodeFactory',
      'writeFieldNodeInput',
      'SetValueOption',
    ],
    'app/plugin/index.ts': ['registerPlugin'],
    'core/engine/blueprint/index.ts': ['blueprint'],
    'core/engine/write/index.ts': ['dispatchMount'],
    'core/engine/settle/index.ts': ['loadFieldNodeAtMount'],
    'core/engine/utils/pathIndex/PathKeyedMap.ts': ['PathKeyedMap'],
    'core/engine/utils/pathIndex/PathKeyedSet.ts': ['PathKeyedSet'],
    'core/engine/settle/utils/controls/getControlLayers.ts': [
      'getControlLayers',
    ],
    'core/engine/settle/utils/controls/readExitLayerPolicy.ts': [
      'readExitLayerPolicy',
    ],
    'core/engine/settle/utils/dependencies/getDependencyIndex.ts': [
      'getDependencyIndex',
    ],
    'core/engine/derive/index.ts': ['getDeriveRuleTable'],
    'core/engine/utils/paths/resolveDependencyPath.ts': [
      'resolveDependencyPath',
    ],
    'helpers/jsonPointer/index.ts': ['appendSegment', 'joinPointer'],
  };
  const source = Object.entries(exports)
    .map(
      ([file, names]) =>
        `export {${names.join(',')}} from ${JSON.stringify(path.join(packageDir, 'src', file))};`,
    )
    .join('\n');
  fs.mkdirSync(output, { recursive: false });
  fs.symlinkSync(
    path.resolve(packageDir, '../../../node_modules'),
    path.join(output, 'node_modules'),
  );
  const inputs = {},
    modes = {};
  for (const mode of /** @type {const} */ ([
    'plain',
    'details',
    'diagnostics',
  ])) {
    const sites = [];
    await build({
      stdin: { contents: source, resolveDir: packageDir, loader: 'ts' },
      absWorkingDir: packageDir,
      bundle: true,
      packages: 'external',
      format: 'esm',
      platform: 'node',
      target: 'node26',
      tsconfig: path.join(packageDir, 'tsconfig.json'),
      define: { 'process.env.NODE_ENV': '"production"' },
      outfile: path.join(output, mode + '.mjs'),
      plugins: [
        {
          name: 'iv-0-scratch-only',
          setup(builder) {
            builder.onLoad({ filter: /\.(?:ts|tsx)$/ }, (args) => {
              const file = path.relative(packageDir, args.path);
              const hash = digest(args.path);
              if (mode !== 'plain')
                assert.deepEqual(
                  hash,
                  inputs[file],
                  'Immutable source ' + file,
                );
              inputs[file] = hash;
              const source = fs.readFileSync(args.path, 'utf8');
              const result =
                mode === 'plain'
                  ? { contents: source, sites: [] }
                  : instrumentSource(source, file, mode);
              sites.push(...result.sites);
              return {
                contents: result.contents,
                loader: args.path.endsWith('.tsx') ? 'tsx' : 'ts',
              };
            });
          },
        },
      ],
    });
    modes[mode] = { hash: digest(path.join(output, mode + '.mjs')), sites };
  }
  for (const name of [
    'writeBoundary',
    'contextObject',
    'scratchObject',
    'hostRoundStart',
    'hostRoundEnd',
    'settledBoundary',
    'injectTarget',
  ])
    assert.equal(
      modes.diagnostics.sites.filter((site) => site.name === name).length,
      1,
      name,
    );
  const manifest = { inputs, modes };
  fs.writeFileSync(
    path.join(output, 'manifest.json'),
    JSON.stringify(manifest, null, 2) + '\n',
  );
  return manifest;
}
