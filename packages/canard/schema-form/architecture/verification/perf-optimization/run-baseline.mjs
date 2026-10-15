// Temporary measure (round 358): internals not exported by dist are reached by copying the built bundle and appending an export; the canonical speed comparison will be whole-form e2e (Form mount and update, like benchmark-form's render lane) from M3, and internal-symbol benches stay as regression signals only.
/**
 * From the schema-form package directory:
 * /Users/Vincent/.nvm/versions/node/v26.11.1/bin/node architecture/verification/perf-optimization/run-baseline.mjs --label=before-dist --quiet-since=<ISO>
 * Builds the JS bundles directly with this Node executable and rolldown -c before running rows.
 * Raw results stay outside the repository under /private/tmp/claude-501/perf-runs/.
 * --only=<row,row> selects the row IDs below, retaining their original order.
 */
import { execFileSync, spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const packageDir = fileURLToPath(new URL('../../../', import.meta.url));
const repoDir = path.resolve(packageDir, '../../..');
const benchmarkDir = path.join(repoDir, 'packages/aileron/benchmark-form');
const toolPath = 'architecture/verification/perf-optimization';
const args = process.argv.slice(2);
if (args.some((arg) => !/^--(label|quiet-since|only)=.+$/.test(arg)))
  throw new Error('Use --label=<label> --quiet-since=<ISO> [--only=<row,row>]');
for (const key of ['label', 'quiet-since', 'only'])
  if (args.filter((arg) => arg.startsWith(`--${key}=`)).length > 1)
    throw new Error(`Duplicate --${key}`);
const label = args.find((arg) => arg.startsWith('--label='))?.slice(8);
const quietSince = args
  .find((arg) => arg.startsWith('--quiet-since='))
  ?.slice(14);
const only = args
  .find((arg) => arg.startsWith('--only='))
  ?.slice(7)
  .split(',');
const startedAt = new Date().toISOString();
if (!label || !/^(before|before-dist|after-[a-zA-Z0-9-]+|final)$/.test(label))
  throw new Error(
    'Label must be before, before-dist, after-<group-or-PR>, or final',
  );
if (
  !quietSince ||
  !/^\d{4}-\d{2}-\d{2}T.+(?:Z|[+-]\d{2}:\d{2})$/.test(quietSince) ||
  !Number.isFinite(Date.parse(quietSince)) ||
  Date.parse(quietSince) > Date.parse(startedAt)
)
  throw new Error('--quiet-since must be an ISO timestamp in the past');
if (process.version !== 'v26.11.1')
  throw new Error('Launch with Node v26.11.1');
const setupCommands = [];
/** Capture a short environment query before any measurement starts. */
function inspect(executable, argv) {
  const start = new Date().toISOString();
  const output = execFileSync(executable, argv, {
    cwd: packageDir,
    encoding: 'utf8',
  }).trim();
  setupCommands.push({
    executable,
    argv,
    cwd: packageDir,
    startedAt: start,
    endedAt: new Date().toISOString(),
    output,
  });
  return output;
}
/** Find the installed CLI entry the same way package scripts find node_modules/.bin. */
function findBin(from, name) {
  for (let dir = from; ; dir = path.dirname(dir)) {
    const candidate = path.join(dir, 'node_modules/.bin', name);
    if (fs.existsSync(candidate)) return fs.realpathSync(candidate);
    if (dir === path.dirname(dir)) throw new Error(`${name} bin not found`);
  }
}
const rolldownBin = findBin(packageDir, 'rolldown');
inspect(process.execPath, [rolldownBin, '-c']);
const distPath = path.join(packageDir, 'dist/index.mjs');
const dist = {
  path: distPath,
  sha256: createHash('sha256').update(fs.readFileSync(distPath)).digest('hex'),
  builtBy: {
    executable: process.execPath,
    argv: [rolldownBin, '-c'],
    cwd: packageDir,
  },
  mtime: fs.statSync(distPath).mtime.toISOString(),
};
const legacyPath = fileURLToPath(
  import.meta.resolve('@canard/schema-form_0.16.0'),
);
const legacy = {
  version: '0.16.0',
  path: legacyPath,
  sha256: createHash('sha256')
    .update(fs.readFileSync(legacyPath))
    .digest('hex'),
};
const commit = inspect('git', ['rev-parse', 'HEAD']);
const shortCommit = inspect('git', ['rev-parse', '--short=7', 'HEAD']);
if (!/^[0-9a-f]{7}$/.test(shortCommit))
  throw new Error('Expected a seven-character commit ID');
const nodeVersion = inspect(process.execPath, ['-v']);
const bunVersion = inspect('bun', ['-v']);
const buildNodeVersion = inspect(process.execPath, ['-v']);
if (bunVersion !== '1.4.3') throw new Error('Bun 1.4.3 is required');
const minute = startedAt.slice(0, 16).replace(/[-:]/g, '');
const runId = `${minute}-${shortCommit}-${label}`;
const runRoot = '/private/tmp/claude-501/perf-runs';
const runDir = path.join(runRoot, runId);

/**
 * Build a child environment; null removes NODE_ENV so the tool keeps its own default.
 * @param {string | null} nodeEnv - Mode for the row, or null for the package-script default
 * @returns {NodeJS.ProcessEnv} Environment passed to the child process
 */
function childEnvironment(nodeEnv) {
  const env = { ...process.env, FORCE_COLOR: '0' };
  if (nodeEnv === null) delete env.NODE_ENV;
  else env.NODE_ENV = nodeEnv;
  return env;
}

/**
 * Describe a single fixed command; it is never executed through a shell.
 * nodeEnv null leaves NODE_ENV unset, as the package script for that row does.
 */
function row(id, executable, argv, cwd = packageDir, nodeEnv = 'production') {
  return { id, executable, argv, cwd, nodeEnv };
}

const rows = [];
for (const name of ['node-and-settle', 'derive-and-controls'])
  for (const runtime of ['node', 'bun'])
    rows.push(
      row(
        `standalone-${name}-${runtime}-production`,
        runtime === 'node' ? process.execPath : 'bun',
        [
          ...(runtime === 'node' ? ['--import', 'tsx'] : []),
          `bench/legacy-compare/${name}.bench.ts`,
        ],
      ),
    );
const vitestBin = findBin(packageDir, 'vitest');

// Equivalent to bench:baseline / bench:compare package scripts, invoked directly with process.execPath.
rows.push(
  row(
    'vitest-bench-baseline',
    process.execPath,
    [
      vitestBin,
      'bench',
      '--config',
      'vitest.bench.config.ts',
      '--run',
      '--outputJson',
      'bench/.results/baseline.json',
    ],
    packageDir,
    null,
  ),
  row(
    'vitest-bench-compare',
    process.execPath,
    [
      vitestBin,
      'bench',
      '--config',
      'vitest.bench.config.ts',
      '--run',
      '--compare',
      'bench/.results/baseline.json',
    ],
    packageDir,
    null,
  ),
);
for (const mode of ['core', 'render'])
  rows.push(
    row(
      `equivalent-${mode}`,
      process.execPath,
      [
        '--expose-gc',
        '--import',
        'tsx',
        'src/index.ts',
        '--equivalent',
        `--mode=${mode}`,
        '--min-samples=100',
        `--out=${runDir}/equivalent-${mode}.json`,
      ],
      benchmarkDir,
      null,
    ),
  );
for (const name of [
  'gate-siblings',
  'fragment-toggle',
  'if-host-siblings',
  'array-verbs',
])
  for (const runtime of ['node', 'bun'])
    rows.push(
      row(
        `probe-${name}-${runtime}`,
        runtime === 'node' ? process.execPath : 'bun',
        [
          ...(runtime === 'node' ? ['--import', 'tsx'] : []),
          `${toolPath}/probe-${name}.ts`,
        ],
      ),
    );
// heap-snapshot hard-codes cwd/results; change only the child's cwd after tsx resolves.
const snapshotScript = path.join(benchmarkDir, 'src/utils/heap-snapshot.tsx');
const heapBootstrap = `process.chdir(${JSON.stringify(runDir)}); process.argv = [process.execPath, ${JSON.stringify(snapshotScript)}, '--scenario=array-1000', '--snapshot']; await import(${JSON.stringify(pathToFileURL(snapshotScript).href)});`;
rows.push(
  row(
    'heap',
    process.execPath,
    [
      '--expose-gc',
      '--import',
      'tsx',
      '--input-type=module',
      '--eval',
      heapBootstrap,
    ],
    benchmarkDir,
    null,
  ),
);
if (only?.some((id) => !rows.some((entry) => entry.id === id)))
  throw new Error(
    `Unknown --only row; choose from: ${rows.map((entry) => entry.id).join(',')}`,
  );
if (only?.some((id, index) => only.indexOf(id) !== index))
  throw new Error('Duplicate --only row');

fs.mkdirSync(runRoot, { recursive: true });
fs.mkdirSync(runDir);
const environment = {
  runId,
  label,
  clock: 'UTC',
  machine: {
    cpuModel: os.cpus()[0]?.model,
    coreCount: os.cpus().length,
    totalMemoryBytes: os.totalmem(),
    architecture: os.arch(),
  },
  os: { type: os.type(), release: os.release() },
  node: { executable: process.execPath, version: nodeVersion },
  bun: { executable: 'bun', version: bunVersion },
  buildNode: {
    label: 'build node',
    executable: process.execPath,
    version: buildNodeVersion,
  },
  commit: { full: commit, short: shortCommit },
  dist,
  legacy,
  invocation: [process.execPath, ...process.argv.slice(1)],
  startedAt,
  endedAt: null,
  quietWindowNotifiedAt: quietSince,
  setupCommands,
  selectedRows: only ?? rows.map((entry) => entry.id),
  status: 'running',
  rows: [],
};
const envPath = path.join(runDir, 'env.json');
/** Persist the run ledger after each command and on the first failure. */
function saveEnvironment() {
  fs.writeFileSync(envPath, `${JSON.stringify(environment, null, 2)}\n`);
}

/** Render exact argv for human review, never for shell execution. */
function commandLine(executable, argv) {
  return [executable, ...argv]
    .map((part) => `'${part.replaceAll("'", "'\\''")}'`)
    .join(' ');
}

/** Stream a row's output to external files, and stop on any failed child. */
function execute(entry, owner, stdoutPath) {
  const record = {
    executable: entry.executable,
    argv: entry.argv,
    commandLine: commandLine(entry.executable, entry.argv),
    cwd: entry.cwd,
    nodeEnv: entry.nodeEnv,
    startedAt: new Date().toISOString(),
    stdout: stdoutPath,
    stderr: `${stdoutPath}.stderr.txt`,
  };
  owner.commands.push(record);
  saveEnvironment();
  const stdout = fs.openSync(stdoutPath, 'wx');
  const stderr = fs.openSync(record.stderr, 'wx');
  let result;
  try {
    result = spawnSync(entry.executable, entry.argv, {
      cwd: entry.cwd,
      env: childEnvironment(entry.nodeEnv),
      stdio: ['ignore', stdout, stderr],
    });
  } finally {
    fs.closeSync(stdout);
    fs.closeSync(stderr);
    record.endedAt = new Date().toISOString();
  }
  record.exitCode = result.status;
  record.signal = result.signal;
  saveEnvironment();
  if (result.error || result.status !== 0)
    throw new Error(
      `${owner.id} failed: ${result.error?.message ?? `exit ${result.status}, signal ${result.signal}`}`,
    );
}

/** Parse an artifact, failing rather than copying a stale or invalid vitest result. */
function copyVitest(name, destination, start) {
  const source = path.join(packageDir, 'bench/.results', name);
  if (fs.statSync(source).mtimeMs < Date.parse(start) - 1000)
    throw new Error(`Vitest did not refresh ${source}`);
  JSON.parse(fs.readFileSync(source, 'utf8'));
  fs.copyFileSync(
    source,
    path.join(runDir, destination),
    fs.constants.COPYFILE_EXCL,
  );
}

saveEnvironment();
try {
  for (const entry of rows.filter(
    (candidate) => !only || only.includes(candidate.id),
  )) {
    const record = {
      id: entry.id,
      nodeEnv: entry.nodeEnv,
      engine: {
        source: 'dist',
        distSha256: dist.sha256,
        ...(entry.id.startsWith('standalone-') ||
        entry.id.startsWith('equivalent-')
          ? { legacy: '0.16.0', legacySha256: legacy.sha256 }
          : {}),
      },
      startedAt: new Date().toISOString(),
      endedAt: null,
      status: 'running',
      commands: [],
    };
    environment.rows.push(record);
    saveEnvironment();
    try {
      const jsonProbe = entry.id.startsWith('probe-');
      const stdout = path.join(
        runDir,
        `${entry.id}${jsonProbe ? '.json' : '.txt'}`,
      );
      execute(entry, record, stdout);
      if (jsonProbe || entry.id.startsWith('standalone-')) {
        const measured = JSON.parse(fs.readFileSync(stdout, 'utf8'));
        if (
          measured.engine?.source !== 'dist' ||
          measured.engine.distSha256 !== dist.sha256 ||
          (entry.id.startsWith('standalone-') &&
            measured.engine.legacySha256 !== legacy.sha256)
        )
          throw new Error(`Engine digest mismatch in ${entry.id}`);
        record.engine = measured.engine;
      }
      if (entry.id.startsWith('standalone-node-and-settle-')) {
        const measured = JSON.parse(fs.readFileSync(stdout, 'utf8'));
        if (!measured.rows?.B2)
          throw new Error('Standalone output has no B2 row');
        const heapFile = path.join(runDir, 'heap-b2.json');
        const heap = fs.existsSync(heapFile)
          ? JSON.parse(fs.readFileSync(heapFile, 'utf8'))
          : {};
        if (!['node', 'bun'].includes(measured.runtime))
          throw new Error('Unknown standalone runtime');
        heap[measured.runtime] = {
          source: path.basename(stdout),
          nodeEnv: entry.nodeEnv,
          B2: measured.rows.B2,
        };
        fs.writeFileSync(heapFile, `${JSON.stringify(heap, null, 2)}\n`);
      }
      if (entry.id === 'vitest-bench-baseline')
        copyVitest(
          'baseline.json',
          'vitest-bench-baseline.json',
          record.startedAt,
        );
      if (entry.id === 'vitest-bench-compare') {
        copyVitest('latest.json', 'vitest-bench-latest.json', record.startedAt);
        if (!fs.existsSync(path.join(runDir, 'vitest-bench-baseline.json'))) {
          const source = path.join(packageDir, 'bench/.results/baseline.json');
          JSON.parse(fs.readFileSync(source, 'utf8'));
          fs.copyFileSync(
            source,
            path.join(runDir, 'vitest-bench-baseline.json'),
            fs.constants.COPYFILE_EXCL,
          );
          record.comparisonBaseline = {
            source,
            mtime: fs.statSync(source).mtime.toISOString(),
            fromPreviousRun: true,
          };
        }
      }
      if (entry.id.startsWith('equivalent-')) {
        for (const suffix of ['.json', '-summary.json'])
          JSON.parse(
            fs.readFileSync(path.join(runDir, `${entry.id}${suffix}`), 'utf8'),
          );
        const summary = JSON.parse(
          fs.readFileSync(
            path.join(runDir, `${entry.id}-summary.json`),
            'utf8',
          ),
        );
        if (
          summary.coreBundleDigests?.workspace !== dist.sha256 ||
          summary.coreBundleDigests?.legacy !== legacy.sha256
        )
          throw new Error(`Core bundle digest mismatch in ${entry.id}`);
      }
      if (entry.id === 'heap') {
        const resultDir = path.join(runDir, 'results');
        const snapshots = fs
          .readdirSync(resultDir)
          .filter((name) => name.endsWith('.heapsnapshot'));
        if (snapshots.length !== 1)
          throw new Error('Expected exactly one heap snapshot');
        const snapshot = path.join(resultDir, snapshots[0]);
        const parseOutput = path.join(runDir, 'heap-parse-array-1000.txt');
        execute(
          row(
            'heap-parse',
            process.execPath,
            ['--import', 'tsx', 'src/utils/parse-heapsnapshot.ts', snapshot],
            benchmarkDir,
            null,
          ),
          record,
          parseOutput,
        );
        const appFiles = fs
          .readdirSync(resultDir)
          .filter((name) => /^heap-.*\.json$/.test(name));
        if (appFiles.length !== 1)
          throw new Error('Expected one app-level heap artifact');
        fs.writeFileSync(
          path.join(runDir, 'heap-snapshot-array-1000.json'),
          `${JSON.stringify(
            {
              scenario: 'array-1000',
              snapshot,
              appLevel: JSON.parse(
                fs.readFileSync(path.join(resultDir, appFiles[0]), 'utf8'),
              ),
              constructorBreakdown: fs.readFileSync(parseOutput, 'utf8'),
              limitations:
                'App delta includes React/JSDOM. Parser reports shallow sizes, not dominator retained paths; its highlighted classes describe the legacy engine. New-engine retained-path isolation remains unclassified.',
            },
            null,
            2,
          )}\n`,
          { flag: 'wx' },
        );
        record.status = 'partial';
        record.omissions = [
          'New-engine retained-path classification: existing parser only provides shallow constructor totals and highlights legacy node classes.',
        ];
      }
      if (record.status === 'running') record.status = 'complete';
    } catch (error) {
      record.status = 'failed';
      record.error = error.message;
      throw error;
    } finally {
      record.endedAt = new Date().toISOString();
      saveEnvironment();
    }
  }
  environment.status = environment.rows.some((row) => row.status === 'partial')
    ? 'partial'
    : 'complete';
} catch (error) {
  environment.status = 'failed';
  environment.error = error.message;
  process.exitCode = 1;
} finally {
  environment.endedAt = new Date().toISOString();
  saveEnvironment();
  console.log(
    JSON.stringify({
      runId,
      runDir,
      status: environment.status,
      error: environment.error,
    }),
  );
}
