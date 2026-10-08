// Loaded by prepare-branch1-bundles.mjs --patch-variants; bundles are uninstrumented production runtimes.
import assert from 'node:assert/strict';
import childProcess from 'node:child_process';
import { createHash } from 'node:crypto';
import { once } from 'node:events';
import { existsSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { join, relative, resolve } from 'node:path';

/** Patch files under the scratch root; each applies to the base revision alone except the delta that composes F3 with 2. */
const PATCHES = { '1c': 'branch1c.patch', '2': 'branch2.patch', F3: 'branchF3.patch', F3on2: 'branchF3-on-2.patch' };
/** Variant name and the ordered patches applied to the base revision, in build order; headx reuses the head build. */
const VARIANTS = [['head', []], ['headx', []], ['1c', ['1c']], ['2', ['2']], ['F3', ['F3']], ['1c2', ['1c', '2']],
  ['1cF3', ['1c', 'F3']], ['2F3', ['2', 'F3on2']], ['1c2F3', ['1c', '2', 'F3on2']]];
/** The only byte difference between c-head and c-headx. */
const HEADX_COMMENT = '// headx: the HEAD bundle plus this one trailing comment line\n';

/**
 * Collect every overlay file as a worktree-relative path and its patched contents.
 * @param directory - Overlay root that mirrors worktree paths
 * @returns Map from worktree-relative path to file text
 */
const readOverlay = (directory, prefix = '') => {
  const files = new Map();
  for (const entry of readdirSync(join(directory, prefix), { withFileTypes: true })) {
    const path = prefix ? `${prefix}/${entry.name}` : entry.name;
    if (entry.isDirectory()) for (const [key, value] of readOverlay(directory, path)) files.set(key, value);
    else files.set(path, readFileSync(join(directory, path), 'utf8'));
  }
  return files;
};

/**
 * Apply a variant's product-source hunks to base-revision copies outside the repository.
 * @param worktree - stage-07 worktree used only for `git show <base>:<path>` reads
 * @param overlayRoot - Scratch directory recreated for this variant
 * @param patchFiles - Ordered patch paths; tests and documents are excluded from the overlay
 * @param base - Full commit the patches apply to
 * @returns Patched product files keyed by worktree-relative path
 */
const buildOverlay = (worktree, overlayRoot, patchFiles, base) => {
  rmSync(overlayRoot, { recursive: true, force: true });
  mkdirSync(overlayRoot, { recursive: true });
  for (const patchFile of patchFiles) {
    const text = readFileSync(patchFile, 'utf8');
    for (const match of text.matchAll(/^--- a\/(\S+)$/gm)) {
      const path = match[1];
      if (path.includes('/__tests__/') || path.endsWith('.md')) continue;
      const target = join(overlayRoot, path);
      try { readFileSync(target); continue; } catch { /* First patch touching this file seeds the base revision's copy. */ }
      mkdirSync(resolve(target, '..'), { recursive: true });
      writeFileSync(target, childProcess.execFileSync('git', ['show', `${base}:${path}`],
        { cwd: worktree, encoding: 'utf8', timeout: 10000 }));
    }
    childProcess.execFileSync('git', ['apply', '--exclude=*/__tests__/*', '--exclude=*.md', patchFile],
      { cwd: overlayRoot, encoding: 'utf8', timeout: 10000 });
  }
  return readOverlay(overlayRoot);
};

/**
 * Build base-revision and patch-composed production runtimes for paired measurement, without timing them.
 * @param packageRoot - schema-form in the authorized stage-07 worktree
 * @param outputRoot - The caller-authorized scratch bundle directory; patches are read from its parent
 * @param base - Commit the patches apply to; defaults to HEAD, and a fixed commit keeps a rebuild valid after the
 *   patches have landed on HEAD
 * @returns Bundle paths, hashes, overlay files and natural build-service exit evidence; `revision` is the resolved base
 */
export async function preparePatchBundles(packageRoot, outputRoot, base = 'HEAD') {
  const worktree = resolve(packageRoot, '../../..');
  const head = childProcess.execFileSync('git', ['rev-parse', `${base}^{commit}`], { cwd: worktree, encoding: 'utf8', timeout: 10000 }).trim();
  const patchRoot = resolve(outputRoot, '..');
  const require = createRequire(resolve(packageRoot, 'package.json'));
  const hash = text => createHash('sha256').update(text).digest('hex');
  const results = [];
  let headCode;
  mkdirSync(outputRoot, { recursive: true });
  for (const [variant, names] of VARIANTS) {
    if (variant === 'headx') {
      assert(headCode.endsWith('\n'));
      const code = headCode + HEADX_COMMENT;
      writeFileSync(resolve(outputRoot, 'c-headx.cjs'), code);
      results.push({ file: resolve(outputRoot, 'c-headx.cjs'), revision: head, variant, patches: [],
        derivedFrom: 'c-head.cjs + one trailing comment line', NODE_ENV: 'production', instrumented: false,
        sha256: hash(code), bytes: Buffer.byteLength(code), naturalBuildServiceExits: 0 });
      continue;
    }
    const patchFiles = names.map(name => resolve(patchRoot, PATCHES[name]));
    const overlayRoot = resolve(outputRoot, `.overlay-c-${variant}`);
    const overlay = buildOverlay(worktree, overlayRoot, patchFiles, head);
    assert.equal(overlay.size > 0, names.length > 0, `${variant} overlay`);
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
    const loaded = new Set();
    let result;
    try {
      result = await esbuild.build({ stdin: { contents: `
        export { nodeFromJSONSchema } from './src/core/nodeFromJSONSchema';
        export { blueprint } from './src/core/blueprint';
        export { equivalentFixtures } from '../../aileron/benchmark-form/fixtures/equivalent';`,
        loader: 'ts', resolveDir: packageRoot }, write: false, bundle: true,
        packages: 'external', platform: 'node', format: 'cjs',
        define: { 'process.env.NODE_ENV': '"production"' },
        plugins: [{ name: 'head-plus-patches', setup(builder) {
          builder.onResolve({ filter: /.*/ }, args => {
            // A file new in the overlay has no directory on disk, so its own imports resolve here.
            const fromNewFile = args.importer !== '' && !existsSync(args.importer);
            if (!args.path.startsWith('.')) return fromNewFile ? { path: args.path, external: true } : undefined;
            for (const suffix of ['.ts', '.tsx', '/index.ts']) {
              const absolute = resolve(args.resolveDir, args.path) + suffix;
              if (overlay.has(relative(worktree, absolute)) || (fromNewFile && existsSync(absolute))) return { path: absolute };
            }
            return undefined;
          });
          builder.onLoad({ filter: /\.(ts|tsx)$/ }, args => {
            const path = relative(worktree, args.path);
            if (!path.startsWith('packages/') || path.includes('node_modules')) return undefined;
            let contents = overlay.has(path) ? overlay.get(path) : childProcess.execFileSync('git', ['show', `${head}:${path}`],
              { cwd: worktree, encoding: 'utf8', timeout: 10000 });
            if (overlay.has(path)) loaded.add(path);
            // The 121 verdict adapter measures oneOf-40 by the same one-token fixture widening.
            if (path === 'packages/aileron/benchmark-form/fixtures/equivalent/branches.ts') {
              assert.equal(contents.split('[5, 10, 20].map').length, 2);
              contents = contents.replace('[5, 10, 20].map', '[5, 10, 20, 40].map');
            }
            return { contents, loader: args.path.endsWith('.tsx') ? 'tsx' : 'ts' };
          });
        } }] });
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
    assert.deepEqual([...loaded].sort(), [...overlay.keys()].sort(), `${variant}: every patched file is bundled`);
    const file = resolve(outputRoot, `c-${variant}.cjs`);
    const code = `require = require('node:module').createRequire(${JSON.stringify(resolve(packageRoot, 'package.json'))});\n` +
      result.outputFiles[0].text;
    const module = { exports: {} };
    new Function('require', 'module', 'exports', code)(require, module, module.exports);
    const root = module.exports.nodeFromJSONSchema({ jsonSchema: { type: 'string' },
      defaultValue: 'bundle-check', validationMode: 0, deferMountValidation: true });
    assert.equal(root.value, 'bundle-check');
    assert(module.exports.equivalentFixtures.some(fixture => fixture.name === 'oneOf-40'));
    if (variant === 'head') headCode = code;
    writeFileSync(file, code);
    rmSync(overlayRoot, { recursive: true, force: true });
    results.push({ file, revision: head, variant,
      patches: patchFiles.map(patch => ({ file: patch, sha256: hash(readFileSync(patch)) })),
      overlayFiles: [...overlay.keys()].sort(), NODE_ENV: 'production', instrumented: false,
      sha256: hash(code), bytes: Buffer.byteLength(code), naturalBuildServiceExits: services.length });
  }
  return results;
}
