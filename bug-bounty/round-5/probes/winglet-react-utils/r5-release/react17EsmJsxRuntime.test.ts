// @vitest-environment node
import { spawnSync } from 'node:child_process';
import {
  cpSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  symlinkSync,
  writeFileSync,
} from 'node:fs';
import { createRequire } from 'node:module';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';

import { describe, expect, it } from 'vitest';

/**
 * r5-release: the published ESM build of @winglet/react-utils under React 16.14 or 17,
 * which its peer range `>=16.14 <20` admits.
 *
 * React 16.14.0 and 17.0.2 publish no `exports` map (registry manifests checked), so a strict
 * ESM resolver cannot map the extensionless `react/jsx-runtime` that every JSX-bearing
 * `.mjs` file of the package imports. The fake React below copies only that manifest shape
 * and forwards its implementation to the installed React, so only resolution differs.
 * The package is copied (not linked) from the workspace `dist` built at the base commit,
 * with `exports` taken from `publishConfig.exports`, so `react` resolves inside the consumer.
 */
const packageDir = resolve(__dirname, '../../..');
const repositoryRoot = resolve(packageDir, '../../..');
const requireFromHere = createRequire(__filename);
const installedReact = dirname(requireFromHere.resolve('react/package.json'));
const installedReactDom = dirname(requireFromHere.resolve('react-dom/package.json'));

const makeConsumer = (reactShape: 'react17' | 'react18') => {
  const root = mkdtempSync(join(tmpdir(), `r5-release-${reactShape}-`));
  writeFileSync(join(root, 'package.json'), JSON.stringify({ name: 'consumer', private: true }));
  const modules = join(root, 'node_modules');
  // Fake React with the 16.14/17 manifest layout, or the 18 layout with an exports map.
  const react = join(modules, 'react');
  mkdirSync(react, { recursive: true });
  writeFileSync(
    join(react, 'package.json'),
    JSON.stringify({
      name: 'react',
      version: reactShape === 'react17' ? '17.0.2' : '18.3.1',
      main: 'index.js',
      ...(reactShape === 'react18' && {
        exports: {
          '.': './index.js',
          './package.json': './package.json',
          './jsx-runtime': './jsx-runtime.js',
          './jsx-dev-runtime': './jsx-dev-runtime.js',
        },
      }),
    }),
  );
  writeFileSync(join(react, 'index.js'), `module.exports = require(${JSON.stringify(installedReact)});`);
  for (const file of ['jsx-runtime', 'jsx-dev-runtime'])
    writeFileSync(
      join(react, `${file}.js`),
      `module.exports = require(${JSON.stringify(join(installedReact, file))});`,
    );
  const reactDom = join(modules, 'react-dom');
  mkdirSync(reactDom, { recursive: true });
  writeFileSync(join(reactDom, 'package.json'), JSON.stringify({ name: 'react-dom', version: '17.0.2', main: 'index.js' }));
  writeFileSync(join(reactDom, 'index.js'), `module.exports = require(${JSON.stringify(installedReactDom)});`);
  // The published @winglet/react-utils: dist plus the manifest with publishConfig.exports.
  const manifest = JSON.parse(readFileSync(join(packageDir, 'package.json'), 'utf8'));
  const packed = join(modules, '@winglet/react-utils');
  mkdirSync(packed, { recursive: true });
  cpSync(join(packageDir, 'dist'), join(packed, 'dist'), { recursive: true });
  writeFileSync(
    join(packed, 'package.json'),
    JSON.stringify({ ...manifest, exports: manifest.publishConfig.exports, publishConfig: undefined }),
  );
  symlinkSync(join(repositoryRoot, 'packages/winglet/common-utils'), join(modules, '@winglet/common-utils'), 'dir');
  return root;
};

const nodeImport = (root: string, specifier: string) => {
  const run = spawnSync(
    process.execPath,
    ['--input-type=module', '-e', `await import(${JSON.stringify(specifier)}); console.log('loaded');`],
    { cwd: root, encoding: 'utf8' },
  );
  return run.status === 0 ? 'loaded' : (/ERR_[A-Z_]+[^\n]*/.exec(run.stderr)?.[0] ?? run.stderr.slice(0, 200));
};

const nodeRequire = (root: string, specifier: string) => {
  const run = spawnSync(process.execPath, ['-e', `require(${JSON.stringify(specifier)}); console.log('loaded');`], {
    cwd: root,
    encoding: 'utf8',
  });
  return run.status === 0 ? 'loaded' : run.stderr.slice(0, 200);
};

const webpackBuild = async (root: string) => {
  const webpack = requireFromHere('webpack') as typeof import('webpack');
  writeFileSync(
    join(root, 'entry.js'),
    "import { withErrorBoundary } from '@winglet/react-utils/hoc';\nconsole.log(typeof withErrorBoundary);\n",
  );
  return new Promise<string>((done) =>
    webpack(
      {
        context: root,
        mode: 'development',
        devtool: false,
        entry: './entry.js',
        output: { path: join(root, 'out'), filename: 'bundle.js' },
        resolve: { modules: [join(root, 'node_modules')] },
        infrastructureLogging: { level: 'none' },
      },
      (error, stats) => {
        if (error) return done(`error: ${error.message}`);
        const errors = stats!.toJson({ all: false, errors: true }).errors ?? [];
        done(errors.length ? errors[0].message.split('\n')[0] : 'bundled');
      },
    ),
  );
};

describe('r5-release @winglet/react-utils ESM build with React 16.14 or 17', () => {
  it('Node ESM imports the hoc subpath with a React 17 manifest (peer range >=16.14 <20)', () => {
    const root = makeConsumer('react17');
    expect(nodeImport(root, '@winglet/react-utils/hoc')).toBe('loaded');
  });

  it('webpack 5 bundles the hoc subpath with a React 17 manifest (peer range >=16.14 <20)', async () => {
    const root = makeConsumer('react17');
    expect(await webpackBuild(root)).toBe('bundled');
  }, 120_000);

  it('control: the CommonJS build loads with the same React 17 manifest', () => {
    const root = makeConsumer('react17');
    expect(nodeRequire(root, '@winglet/react-utils/hoc')).toBe('loaded');
  });

  it('control: Node ESM and webpack 5 succeed when React has an exports map (React 18 layout)', async () => {
    const root = makeConsumer('react18');
    expect(nodeImport(root, '@winglet/react-utils/hoc')).toBe('loaded');
    expect(await webpackBuild(root)).toBe('bundled');
  }, 120_000);
});
