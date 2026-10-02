import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

// Run from the repository root after BF measurements; commands below execute strictly sequentially.
const root = process.cwd();
const pkg = path.join(root, 'packages/canard/schema-form');
const bf = path.join(root, 'packages/aileron/benchmark-form');
const verification = path.join(pkg, 'architecture/verification/07-switch');
const scratch = path.join(verification, '.performance');
fs.mkdirSync(scratch, { recursive: true });
const output = {};

/** Executes and records one command, keeping raw output in a local ignored log. */
function run(name, command, args, cwd = pkg) {
  const start = performance.now();
  const result = spawnSync(command, args, {
    cwd,
    encoding: 'utf8',
    maxBuffer: 64 * 1024 * 1024,
    env: { ...process.env, NO_COLOR: '1' },
  });
  const seconds = (performance.now() - start) / 1000;
  const log = `${result.stdout ?? ''}${result.stderr ?? ''}`;
  fs.writeFileSync(path.join(scratch, `${name}.log`), log);
  const summary = log
    .split('\n')
    .filter((line) =>
      /Test Files|Tests\s+|Duration|error TS|FAIL\s/.test(line),
    );
  console.log(
    `${name}: ${seconds.toFixed(3)} s, exit ${result.status}\n${summary.slice(0, 12).join('\n')}`,
  );
  return { seconds, exit: result.status, summary: summary.join('; ') };
}

output.build = run('build', 'npx', ['--no-install', 'rolldown', '-c']);
if (output.build.exit !== 0) throw new Error('dist build failed');
output.minify = run('minify', 'npx', [
  '--no-install',
  'esbuild@0.25.9',
  'dist/index.mjs',
  '--bundle',
  '--minify',
  '--format=esm',
  '--packages=external',
  '--outfile=architecture/verification/07-switch/.performance/index.min.mjs',
]);
if (output.minify.exit !== 0) throw new Error('minify failed');
for (const [key, file] of [
  ['minifiedGzip', path.join(scratch, 'index.min.mjs')],
  ['plainGzip', path.join(pkg, 'dist/index.mjs')],
]) {
  const compressed = spawnSync('gzip', ['-9', '-c', file], {
    maxBuffer: 8 * 1024 * 1024,
  });
  if (compressed.status !== 0) throw new Error(`gzip failed: ${file}`);
  output[key] = compressed.stdout.length;
}
console.log(
  `bundle: minified ${output.minifiedGzip}, plain ${output.plainGzip} bytes`,
);
output.typecheck = [1, 2, 3].map((index) =>
  run(`typecheck-${index}`, 'npx', [
    '--no-install',
    'tsc',
    '--noEmit',
    '--composite',
    'false',
    '--rootDir',
    '.',
    '-p',
    'tsconfig.json',
  ]),
);
output.typecheckMedianSeconds = output.typecheck
  .map((result) => result.seconds)
  .sort((a, b) => a - b)[1];
fs.writeFileSync(
  path.join(verification, 'performance-costs.json'),
  JSON.stringify(output, null, 2),
);
output.packageBench = run('package-bench', 'npx', [
  '--no-install',
  'vitest',
  'bench',
  '--config',
  'vitest.bench.config.ts',
  '--run',
  '--outputJson',
  'architecture/verification/07-switch/bench-workspace-baseline.json',
]);
const render = run('render', 'npx', [
  '--no-install',
  'vitest',
  'run',
  '--project',
  'render',
  '--reporter=dot',
]);
output.renderSeconds = render.seconds;
output.renderSummary = render.summary;
output.renderExit = render.exit;
const final = run('unit-render', 'npx', [
  '--no-install',
  'vitest',
  'run',
  '--project',
  'unit',
  '--project',
  'render',
  '--reporter=dot',
]);
output.finalSummary = final.summary;
output.finalExit = final.exit;
const equivalent = run(
  'equivalent',
  'npx',
  ['--no-install', 'vitest', 'run', '--reporter=dot', 'equivalent'],
  bf,
);
output.equivalentSummary = equivalent.summary;
output.equivalentExit = equivalent.exit;
fs.writeFileSync(
  path.join(verification, 'performance-costs.json'),
  JSON.stringify(output, null, 2),
);
console.log('COSTS_RECORDED');
