// Loaded by prepare-branch1-bundles.mjs --react-fa and measure-react-pair-126.mjs --prepare; bundles are uninstrumented production fixtures.
import assert from 'node:assert/strict';
import childProcess from 'node:child_process';
import { createHash } from 'node:crypto';
import { once } from 'node:events';
import { existsSync, mkdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, relative, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

/**
 * Build the React fixture against pinned HEAD or working sources, without timing it.
 * @param packageRoot - schema-form in the authorized stage-07 worktree
 * @param outputRoot - Scratch directory that receives `<name>.cjs`
 * @param variant - `head` (pinned revision), `change` (working tree) or `both`
 * @param options - Optional `head` revision (default the F-A base `087e5618e`), `entry` file, `outputNames`
 *   per variant (default `fa-head`/`fa-change`), and `equivalentHarness`: bundle the benchmark-form equivalent
 *   harness too — `@canard/schema-form` resolves to the variant's sources, `react-dom/client` to the external
 *   production profiling build, 0.16.0 stays external, and mountEquivalentForm gains an event-loop active clock
 * @returns One record per built bundle with path, revision, hash and natural build-service exit evidence
 */
export async function prepareReactBundles(packageRoot, outputRoot, variant = 'both', options = {}) {
  assert(['head', 'change', 'both'].includes(variant));
  const worktree = resolve(packageRoot, '../../..');
  const head = options.head ?? '087e5618e';
  const require = createRequire(resolve(packageRoot, 'package.json'));
  const harness = options.equivalentHarness === true;
  const benchmarkRequire = createRequire(resolve(worktree, 'packages/aileron/benchmark-form/package.json'));
  const releaseModule = harness ? pathToFileURL(benchmarkRequire.resolve('@canard/schema-form_0.16.0').replace(/\.cjs$/, '.mjs')).href : null;
  const profilingModule = harness ? benchmarkRequire.resolve('react-dom/profiling') : null;
  const tracked = childProcess.execFileSync('git', ['ls-tree', '-r', '--name-only', head, 'packages/canard/schema-form/src'],
    { cwd: worktree, encoding: 'utf8', timeout: 10000 }).trim().split('\n');
  const headPaths = new Set(tracked);
  const results = [];
  mkdirSync(outputRoot, { recursive: true });
  for (const name of variant === 'both' ? ['head', 'change'] : [variant]) {
    delete require.cache[require.resolve('esbuild')];
    const esbuild = require('esbuild');
    const services = [];
    const spawn = childProcess.spawn;
    childProcess.spawn = function (...args) {
      const child = Reflect.apply(spawn, childProcess, args);
      if (String(args[0]).includes('esbuild') && args[1]?.some(arg => String(arg).startsWith('--service=')))
        services.push(child);
      return child;
    };
    let built;
    try {
      built = await esbuild.build({
        entryPoints: [options.entry ?? resolve(packageRoot, 'architecture/verification/07-switch/tools/measure-react-render-counts.entry.tsx')],
        write: false, bundle: true, platform: 'node', format: 'cjs', jsx: 'automatic',
        packages: 'external', tsconfig: resolve(packageRoot, 'tsconfig.json'),
        define: { 'process.env.NODE_ENV': '"production"' }, logLevel: 'error',
        plugins: [{ name: 'fa-local-sources', setup(builder) {
          if (harness) {
            builder.onResolve({ filter: /^@canard\/schema-form$/ }, () => ({ path: resolve(packageRoot, 'src/index.ts') }));
            builder.onResolve({ filter: /^@canard\/schema-form_0\.16\.0$/ }, () => ({ path: releaseModule, external: true }));
            builder.onResolve({ filter: /^react-dom\/client$/ }, () => ({ path: profilingModule, external: true }));
          }
          builder.onResolve({ filter: /^@winglet\// }, args => {
            const [, pkg, ...parts] = args.path.split('/');
            const root = resolve(worktree, 'packages/winglet', pkg);
            const manifest = JSON.parse(readFileSync(resolve(root, 'package.json'), 'utf8'));
            const entry = manifest.exports[parts.length ? './' + parts.join('/') : '.'];
            assert(entry?.source, args.path);
            return { path: resolve(root, entry.source) };
          });
          builder.onResolve({ filter: /^@\/(common-utils|json|json-schema|react-utils)(\/|$)/ }, args => {
            const [pkg, ...parts] = args.path.slice(2).split('/');
            const base = resolve(worktree, 'packages/winglet', pkg, 'src', ...parts);
            const file = [base + '.ts', base + '.tsx', base + '/index.ts', base + '/index.tsx'].find(existsSync);
            assert(file, args.path);
            return { path: file };
          });
          // Explicit historical resolution also covers SchemaNodeField after its removal. The equivalent harness
          // resolves the working tree the same way, so tree shaking treats both variants alike.
          const known = name === 'head' ? path => headPaths.has(relative(worktree, path))
            : path => statSync(path, { throwIfNoEntry: false })?.isFile() === true;
          builder.onResolve({ filter: /^(\.|@\/schema-form)/ }, args => {
            if ((name !== 'head' && !harness) || !args.importer.startsWith(resolve(packageRoot, 'src'))) return;
            const base = args.path.startsWith('@/schema-form')
              ? resolve(packageRoot, 'src' + args.path.slice('@/schema-form'.length))
              : resolve(dirname(args.importer), args.path);
            const file = [base, base + '.ts', base + '.tsx', base + '/index.ts', base + '/index.tsx']
              .find(known);
            if (file) return { path: file };
          });
          // A pinned file absent from the working tree has no directory to resolve its packages from.
          builder.onResolve({ filter: /^[^./]/ }, args => {
            if (name === 'head' && args.importer.startsWith(resolve(packageRoot, 'src')) && !existsSync(args.importer))
              return { path: args.path, external: true };
          });
          builder.onLoad({ filter: /\.(ts|tsx)$/ }, args => {
            if (!args.path.startsWith(resolve(worktree, 'packages')) || args.path.includes('node_modules')) return;
            const path = relative(worktree, args.path);
            const pinned = name === 'head' && !path.includes('/architecture/');
            let contents = pinned ? childProcess.execFileSync('git', ['show', `${head}:${path}`],
              { cwd: worktree, encoding: 'utf8', timeout: 10000 }) : readFileSync(args.path, 'utf8');
            // The verdict's mount-active column spans exactly the harness's own mountMs interval.
            if (harness && path.endsWith('/mountEquivalentForm.tsx')) {
              assert.equal(contents.split('const start = performance.now();').length, 2);
              assert.equal(contents.split('mountMs: performance.now() - start,').length, 2);
              contents = contents.replace('const start = performance.now();', 'const activeStart = performance.eventLoopUtilization(); const start = performance.now();')
                .replace('mountMs: performance.now() - start,', 'mountMs: performance.now() - start, mountActiveMs: performance.eventLoopUtilization(activeStart).active,');
            }
            return { contents, loader: args.path.endsWith('.tsx') ? 'tsx' : 'ts' };
          });
        } }],
      });
    } finally {
      childProcess.spawn = spawn;
      for (const service of services) {
        service.ref();
        const ended = service.exitCode === null ? once(service, 'exit') : Promise.resolve([service.exitCode]);
        service.stdin.end();
        const [code, signal] = await ended;
        assert.equal(code, 0, `esbuild natural exit: ${signal}`);
      }
    }
    const file = resolve(outputRoot, `${options.outputNames?.[name] ?? `fa-${name}`}.cjs`);
    const code = `require = require('node:module').createRequire(${JSON.stringify(resolve(packageRoot, 'package.json'))});\n`
      + built.outputFiles[0].text;
    writeFileSync(file, code);
    results.push({ file, revision: name === 'head' ? head : 'working', variant: name,
      NODE_ENV: 'production', instrumented: false,
      sha256: createHash('sha256').update(code).digest('hex'),
      bytes: Buffer.byteLength(code), naturalBuildServiceExits: services.length });
  }
  return results;
}
