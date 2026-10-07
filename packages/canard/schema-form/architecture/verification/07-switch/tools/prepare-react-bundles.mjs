// Loaded by prepare-branch1-bundles.mjs --react-fa; bundles are uninstrumented production fixtures.
import assert from 'node:assert/strict';
import childProcess from 'node:child_process';
import { createHash } from 'node:crypto';
import { once } from 'node:events';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, relative, resolve } from 'node:path';

/** Build the React fixture against pinned HEAD or working sources, without timing it. */
export async function prepareReactBundles(packageRoot, outputRoot, variant = 'both') {
  assert(['head', 'change', 'both'].includes(variant));
  const worktree = resolve(packageRoot, '../../..');
  const head = '087e5618e';
  const require = createRequire(resolve(packageRoot, 'package.json'));
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
        entryPoints: [resolve(packageRoot, 'architecture/verification/07-switch/tools/measure-react-render-counts.entry.tsx')],
        write: false, bundle: true, platform: 'node', format: 'cjs', jsx: 'automatic',
        packages: 'external', tsconfig: resolve(packageRoot, 'tsconfig.json'),
        define: { 'process.env.NODE_ENV': '"production"' }, logLevel: 'error',
        plugins: [{ name: 'fa-local-sources', setup(builder) {
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
          // Explicit historical resolution also covers SchemaNodeField after its removal.
          builder.onResolve({ filter: /^(\.|@\/schema-form)/ }, args => {
            if (name !== 'head' || !args.importer.startsWith(resolve(packageRoot, 'src'))) return;
            const base = args.path.startsWith('@/schema-form')
              ? resolve(packageRoot, 'src' + args.path.slice('@/schema-form'.length))
              : resolve(dirname(args.importer), args.path);
            const file = [base, base + '.ts', base + '.tsx', base + '/index.ts', base + '/index.tsx']
              .find(path => headPaths.has(relative(worktree, path)));
            if (file) return { path: file };
          });
          builder.onLoad({ filter: /\.(ts|tsx)$/ }, args => {
            if (!args.path.startsWith(resolve(worktree, 'packages')) || args.path.includes('node_modules')) return;
            const path = relative(worktree, args.path);
            const pinned = name === 'head' && !path.includes('/architecture/');
            const contents = pinned ? childProcess.execFileSync('git', ['show', `${head}:${path}`],
              { cwd: worktree, encoding: 'utf8', timeout: 10000 }) : readFileSync(args.path, 'utf8');
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
    const file = resolve(outputRoot, `fa-${name}.cjs`);
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
