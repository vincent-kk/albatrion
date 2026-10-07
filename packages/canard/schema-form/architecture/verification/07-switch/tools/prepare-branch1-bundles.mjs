// Invoked directly from PKG; writes only the requested scratch production bundles.
import assert from 'node:assert/strict';
import childProcess from 'node:child_process';
import { createHash } from 'node:crypto';
import { once } from 'node:events';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { preparePatchBundles } from './prepare-patch-bundles.mjs';
import { prepareReactBundles } from './prepare-react-bundles.mjs';

/**
 * Prepare uninstrumented production runtimes without running timing measurements.
 * @param packageRoot - schema-form in the authorized stage-07 worktree
 * @param outputRoot - The caller-authorized scratch bundle directory
 * @returns Bundle paths, hashes and natural build-service exit evidence
 */
export async function prepareBranch1Bundles(packageRoot, outputRoot, reactVariant) {
  if (reactVariant) return prepareReactBundles(packageRoot, outputRoot, reactVariant);
  const worktree = resolve(packageRoot, '../../..');
  const head = '3a637c4cd';
  const selectionFiles = [
    'src/core/settle/utils/compute/primeHost.ts',
    'src/core/settle/utils/compute/selectChildren.ts',
    'src/core/settle/utils/compute/selectChildren/utils/getDirectChildSelectionPlan.ts',
  ];
  const pathFiles = [
    'src/core/settle/utils/gates/evaluateGate.ts',
    'src/core/settle/utils/gates/getGateRegistry.ts',
    'src/core/settle/utils/gates/flushPendingGateReads.ts',
    'src/core/settle/utils/gates/readProjectedValue.ts',
  ];
  const require = createRequire(resolve(packageRoot, 'package.json'));
  const results = [];
  mkdirSync(outputRoot, { recursive: true });
  for (const variant of ['head', '1b', '2', '1b2']) {
    const workingFiles = [
      ...(variant === '1b' || variant === '1b2' ? selectionFiles : []),
      ...(variant === '2' || variant === '1b2' ? pathFiles : []),
    ].map(path => `packages/canard/schema-form/${path}`);
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
    let result;
    try {
      result = await esbuild.build({ stdin: { contents: `
        export { nodeFromJSONSchema } from './src/core/nodeFromJSONSchema';
        export { blueprint } from './src/core/blueprint';
        export { equivalentFixtures } from '../../aileron/benchmark-form/fixtures/equivalent';`,
        loader: 'ts', resolveDir: packageRoot }, write: false, bundle: true,
        packages: 'external', platform: 'node', format: 'cjs',
        define: { 'process.env.NODE_ENV': '"production"' },
        plugins: [{ name: 'pinned-local-revision', setup(builder) {
          builder.onLoad({ filter: /\.(ts|tsx)$/ }, args => {
            const path = relative(worktree, args.path);
            if (!path.startsWith('packages/') || path.includes('node_modules')) return;
            const contents = workingFiles.includes(path) ? readFileSync(args.path, 'utf8') :
              childProcess.execFileSync('git', ['show', `${head}:${path}`],
                { cwd: worktree, encoding: 'utf8', timeout: 10000 });
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
    const file = resolve(outputRoot, `b-${variant}.cjs`);
    const code = `require = require('node:module').createRequire(${JSON.stringify(resolve(packageRoot, 'package.json'))});\n` +
      result.outputFiles[0].text;
    const module = { exports: {} };
    new Function('require', 'module', 'exports', code)(require, module, module.exports);
    const root = module.exports.nodeFromJSONSchema({ jsonSchema: { type: 'string' },
      defaultValue: 'bundle-check', validationMode: 0, deferMountValidation: true });
    assert.equal(root.value, 'bundle-check');
    writeFileSync(file, code);
    results.push({ file, revision: head, variant, NODE_ENV: 'production',
      instrumented: false, sha256: createHash('sha256').update(code).digest('hex'),
      bytes: Buffer.byteLength(code), naturalBuildServiceExits: services.length });
  }
  return results;
}

const packageRoot = resolve(dirname(fileURLToPath(import.meta.url)), '../../../..');
const scratch = '/private/tmp/claude-501/-Users-Vincent-Workspace-albatrion/c8aaf054-1ea7-43d3-b3c1-a4196f8407e1/scratchpad/bundles';
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const reactVariant = process.argv[2] === '--react-fa' ? (process.argv[3] ?? 'both') : undefined;
  // --patch-variants builds c-*.cjs from current HEAD plus the scratch patches (c-head, c-headx, 1c, 2, F3 and their unions).
  const results = process.argv[2] === '--patch-variants' ? await preparePatchBundles(packageRoot, scratch)
    : await prepareBranch1Bundles(packageRoot, scratch, reactVariant);
  console.log(JSON.stringify(results, null, 2));
}
