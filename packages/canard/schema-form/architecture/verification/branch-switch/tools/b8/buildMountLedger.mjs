// Invoked by preparation; esbuild receives transformed text, never modified product files.
import { build } from 'esbuild';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

import { instrumentMountSource } from './helpers/instrumentMountSource.mjs';
import { mountStages } from './helpers/mountStages.mjs';

/** Build immutable coarse, detailed and unwrapped inputs for one confirmed head. */
export async function buildMountLedger(
  packageDir,
  outputDir,
  modulesDir,
  repository,
  revision,
) {
  fs.mkdirSync(outputDir, { recursive: true });
  fs.symlinkSync(modulesDir, path.join(outputDir, 'node_modules'));
  const source = `export { buildFieldNodeTree, mountFieldNode } from ${JSON.stringify(path.join(packageDir, 'src/core/surface/index.ts'))};`;
  const inputs = {},
    bundles = {},
    manifests = {};
  for (const mode of ['unwrapped', 'wrapped', 'detailed']) {
    const sites = [];
    const outfile = path.join(outputDir, mode + '.mjs');
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
      outfile,
      plugins: [
        {
          name: 'b8-mount-ledger',
          setup(builder) {
            builder.onLoad({ filter: /\.(?:ts|tsx)$/ }, (args) => {
              const text = fs.readFileSync(args.path, 'utf8');
              const file = path.relative(packageDir, args.path);
              assert.ok(
                !file.startsWith('..'),
                'Only package-local TypeScript is bundled',
              );
              const digest = createHash('sha256').update(text).digest('hex');
              if (mode === 'unwrapped') {
                const expected = execFileSync(
                  'git',
                  ['show', revision + ':packages/canard/schema-form/' + file],
                  { cwd: repository },
                );
                assert.equal(
                  digest,
                  createHash('sha256').update(expected).digest('hex'),
                  revision + ': ' + file,
                );
                inputs[file] = digest;
              } else
                assert.equal(
                  inputs[file],
                  digest,
                  'Source changed during preparation: ' + file,
                );
              const result =
                mode === 'unwrapped'
                  ? { contents: text, sites: [] }
                  : instrumentMountSource(text, file, mode === 'detailed');
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
    if (mode !== 'unwrapped') {
      for (const stage of mountStages.filter((stage) => stage.required))
        assert.equal(
          sites.filter((site) => site.name === stage.name).length,
          1,
          mode + ': one ' + stage.name,
        );
      manifests[mode] = {
        sites,
        absent: mountStages
          .filter(
            (stage) =>
              (mode === 'detailed' || !stage.detail) &&
              !sites.some((site) => site.name === stage.name),
          )
          .map((stage) => stage.name),
      };
    }
    const bytes = fs.readFileSync(outfile);
    bundles[mode + '.mjs'] = {
      bytes: bytes.length,
      sha256: createHash('sha256').update(bytes).digest('hex'),
    };
  }
  const manifest = { revision, inputs, bundles, manifests };
  fs.writeFileSync(
    path.join(outputDir, 'instrumentation.json'),
    JSON.stringify(manifest, null, 2) + '\n',
  );
  return manifest;
}
