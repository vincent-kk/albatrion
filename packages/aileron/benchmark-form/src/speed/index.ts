// Invoked by the bench:speed package script; each slot runs in a separate Node process.
import { spawnSync } from 'node:child_process';
import { existsSync, readFileSync, unlinkSync } from 'node:fs';
import { writeFile } from 'node:fs/promises';
import { arch, cpus, platform, release } from 'node:os';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { createOutput } from './createOutput';
import { provenance } from './provenance';
import { ratios as calculateRatios } from './ratios';
import { rows } from './rows';
import { slotOrder } from './slotOrder';
import { nearestRank, verdict } from './statistics';

const args = process.argv.slice(2);
const values = new Map<string, string[]>();
for (let i = 0; i < args.length; i += 2) {
  const key = args[i];
  if (!key.startsWith('--') || !args[i + 1] || args[i + 1].startsWith('--'))
    throw new Error(`Invalid option: ${key}`);
  if (
    ![
      '--baseline-dir',
      '--baseline-ref',
      '--candidate-dir',
      '--candidate-ref',
      '--out',
      '--rounds',
      '--row',
    ].includes(key)
  )
    throw new Error(`Unknown option: ${key}`);
  values.set(key, [...(values.get(key) ?? []), args[i + 1]]);
}
const required = (key: string) => {
  const value = values.get(key);
  if (!value || value.length !== 1) throw new Error(`Expected one ${key}`);
  return value[0];
};
const baseline = resolve(required('--baseline-dir'));
const candidate = resolve(required('--candidate-dir'));
const baselineRef = required('--baseline-ref');
const candidateRef = required('--candidate-ref');
const out = resolve(required('--out'));
const rounds = Number(values.get('--rounds')?.[0] ?? 20);
if (
  !Number.isInteger(rounds) ||
  rounds < 1 ||
  (values.get('--rounds')?.length ?? 0) > 1
)
  throw new Error('Invalid rounds');
const selected = values.get('--row') ?? rows.map((row) => row.id);
if (selected.some((id) => !rows.some((row) => row.id === id)))
  throw new Error('Unknown row');
await createOutput(out);
const run: {
  status: string;
  baselineRef: string;
  candidateRef: string;
  harness: unknown;
  environment: unknown;
  rows: any[];
  error?: string;
} = {
  status: 'running',
  baselineRef,
  candidateRef,
  harness: {
    ref: spawnSync('git', ['rev-parse', 'HEAD'], {
      encoding: 'utf8',
    }).stdout.trim(),
    dirty: Boolean(
      spawnSync(
        'git',
        [
          'status',
          '--porcelain',
          '--',
          'packages/aileron/benchmark-form/src/speed',
        ],
        { encoding: 'utf8' },
      ).stdout.trim(),
    ),
  },
  environment: {
    node: process.version,
    v8: process.versions.v8,
    platform: platform(),
    release: release(),
    arch: arch(),
    cpu: cpus()[0]?.model,
    nodeEnv: 'production',
    nodeFlags: [
      '--expose-gc',
      '--experimental-import-meta-resolve',
      '--import',
      'tsx',
    ],
  },
  rows: [],
};
const report = () =>
  [
    `# Speed harness report\n\nScope: ${selected.join(', ')}\n`,
    '| package | function | input | input kind | min ratio | p10 ratio | control | verdict |',
    '|---|---|---|---|---|---|---|---|',
    ...run.rows.map(
      (item) =>
        `| ${item.packageName} | ${item.operation} | ${item.input} | — | ${item.ratios?.[0].toFixed(4) ?? '—'} | ${item.ratios?.[1].toFixed(4) ?? '—'} | ${item.control?.map((n: number) => n.toFixed(4)).join(' / ') ?? '—'} | ${item.verdict} |`,
    ),
  ].join('\n');
const save = async () => {
  await writeFile(
    resolve(out, 'run.json'),
    `${JSON.stringify(run, null, 2)}\n`,
  );
  await writeFile(resolve(out, 'report.md'), `${report()}\n`);
};
const execute = (root: string, id: string, count: number, trace = false) => {
  const loader = trace
    ? [
        '--import',
        fileURLToPath(new URL('./register-provenance.mjs', import.meta.url)),
      ]
    : [];
  const traceFile = resolve(out, 'provenance.tmp');
  const child = spawnSync(
    process.execPath,
    [
      '--expose-gc',
      '--experimental-import-meta-resolve',
      '--import',
      'tsx',
      ...loader,
      fileURLToPath(new URL('./slot.ts', import.meta.url)),
      root,
      id,
      String(count),
    ],
    {
      encoding: 'utf8',
      env: {
        ...process.env,
        NODE_ENV: 'production',
        SPEED_TRACE_FILE: traceFile,
      },
      maxBuffer: 16 * 1024 * 1024,
    },
  );
  const traceOutput =
    trace && existsSync(traceFile) ? readFileSync(traceFile, 'utf8') : '';
  if (trace && existsSync(traceFile)) unlinkSync(traceFile);
  if (child.status !== 0)
    throw new Error(child.stderr || `Slot exited ${child.status}`);
  const data = JSON.parse(child.stdout) as {
    arm: { path: string };
    count: number;
    samples: number[];
    observed: unknown;
    overhead: number;
    commonjs: string[];
  };
  return {
    ...data,
    trace: trace
      ? provenance(traceOutput, data.arm.path, root, data.commonjs)
      : undefined,
  };
};
try {
  for (const row of rows.filter((item) => selected.includes(item.id))) {
    const slots: {
      round: number;
      slot: string;
      data: ReturnType<typeof execute>;
    }[] = [];
    const resultRow: any = {
      ...row,
      slots,
      verdict: 'void',
      voidReason: 'Run incomplete',
    };
    run.rows.push(resultRow);
    const replay = [
      execute(baseline, row.id, 1, true),
      execute(candidate, row.id, 1, true),
    ];
    const [left, right] = replay.map((item) => item.trace!);
    const mismatch = Object.keys(left.packages).filter(
      (name) =>
        name !== row.packageName &&
        right.packages[name] &&
        left.packages[name].version !== right.packages[name].version,
    );
    const provenanceValid =
      left.complete &&
      right.complete &&
      !left.leaks.length &&
      !right.leaks.length &&
      !mismatch.length;
    const calibration = [
      execute(baseline, row.id, 0),
      execute(candidate, row.id, 0),
    ];
    const count = Math.max(...calibration.map((item) => item.count));
    for (let round = 0; round < rounds; round++) {
      for (const slot of slotOrder(round))
        slots.push({
          round,
          slot,
          data: execute(slot === 'B' ? candidate : baseline, row.id, count),
        });
    }
    const summary = (slot: string) => {
      const samples = slots
        .filter((item) => item.slot === slot)
        .flatMap((item) => item.data.samples);
      return {
        min: Math.min(...samples),
        p10: nearestRank(samples, 0.1),
        median: nearestRank(samples, 0.5),
      };
    };
    const a1 = summary('A1');
    const a2 = summary('A2');
    const b = summary('B');
    const minRatio = calculateRatios(a1.min, a2.min, b.min);
    const p10Ratio = calculateRatios(a1.p10, a2.p10, b.p10);
    const ratios = [minRatio.candidate, p10Ratio.candidate];
    const control = [minRatio.control, p10Ratio.control];
    const overheadValid = slots.every(
      (item) => item.data.overhead < Math.min(...item.data.samples) * 0.9,
    );
    const result =
      provenanceValid && overheadValid ? verdict(ratios, control) : 'void';
    Object.assign(resultRow, {
      count,
      replay,
      mismatch,
      calibration,
      summary: { A1: a1, A2: a2, B: b },
      ratios,
      control,
      verdict: result,
      voidReason:
        result !== 'void'
          ? undefined
          : !provenanceValid
            ? 'Dependency provenance incomplete, mismatched, or outside its tree'
            : !overheadValid
              ? 'Driver overhead dominates'
              : 'Control ratios outside the valid range',
    });
    await save();
  }
  run.status = 'complete';
} catch (error) {
  run.status = 'failed';
  run.error = String(error);
  process.exitCode = 1;
}
await save();
