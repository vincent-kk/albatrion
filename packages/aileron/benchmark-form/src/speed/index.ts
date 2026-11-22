// Invoked by the bench:speed package script; each slot runs in a separate Node process.
import { spawnSync } from 'node:child_process';
import { writeFile } from 'node:fs/promises';
import { arch, cpus, platform, release } from 'node:os';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { createOutput } from './createOutput';
import { ratios as calculateRatios } from './ratios';
import { resolveRef } from './resolveRef';
import { rows } from './rows';
import { runSafely } from './runSafely';
import { slotOrder } from './slotOrder';
import { nearestRank } from './statistics';
import { verdict } from './verdict';

type Slot = { round: number; slot: string; data: ReturnType<typeof execute> };
type ResultRow = (typeof rows)[number] & {
  slots: Slot[];
  verdict: 'pass' | 'over' | 'void';
  voidReason?: string;
  ratios?: number[];
  control?: number[];
};

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
const baselineRef = await resolveRef(baseline, required('--baseline-ref'));
const candidateRef = await resolveRef(candidate, required('--candidate-ref'));
const out = resolve(required('--out'));
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
  rows: ResultRow[];
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
        `| ${item.packageName} | ${item.operation} | ${item.input} | — | ${item.ratios?.[0].toFixed(4) ?? '—'} | ${item.ratios?.[1].toFixed(4) ?? '—'} | ${item.control?.map((n: number) => n.toFixed(4)).join(' / ') ?? '—'} | ${item.verdict}${item.voidReason ? `: ${item.voidReason.replace(/\|/g, '\\|').replace(/\n/g, ' ')}` : ''} |`,
    ),
  ].join('\n');
const save = async () => {
  await writeFile(
    resolve(out, 'run.json'),
    `${JSON.stringify(run, null, 2)}\n`,
  );
  await writeFile(resolve(out, 'report.md'), `${report()}\n`);
};
const execute = (root: string, id: string, count: number) => {
  const child = spawnSync(
    process.execPath,
    [
      '--expose-gc',
      '--experimental-import-meta-resolve',
      '--import',
      fileURLToPath(new URL('./capture-provenance.mjs', import.meta.url)),
      '--import',
      'tsx',
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
      },
      maxBuffer: 16 * 1024 * 1024,
    },
  );
  if (child.status !== 0)
    throw new Error(child.stderr || `Slot exited ${child.status}`);
  const data = JSON.parse(child.stdout) as {
    arm: { path: string };
    count: number;
    samples: number[];
    observed: unknown;
    overhead: number;
    provenance: {
      urls: string[];
      packages: { name: string; version: string; path: string }[];
      leaks: string[];
    };
  };
  return data;
};
for (const row of rows.filter((item) => selected.includes(item.id))) {
  const slots: Slot[] = [];
  const resultRow: ResultRow = {
    ...row,
    slots,
    verdict: 'void',
    voidReason: 'Run incomplete',
  };
  run.rows.push(resultRow);
  let phase = 'replay slot probe arm baseline';
  await runSafely(
    resultRow,
    () => phase,
    async () => {
      const replay = [
        execute(baseline, row.id, 1),
        ((phase = 'replay slot probe arm candidate'),
        execute(candidate, row.id, 1)),
      ];
      const [left, right] = replay.map((item) => item.provenance);
      const thirdParty = (value: typeof left) =>
        value.packages
          .filter(
            (item) =>
              !/^@(canard|winglet|lerx|slats)\//.test(item.name) &&
              !((row as import('./rows').SpeedRow).allowedVariants ?? []).some(
                (variant) =>
                  variant.name === item.name &&
                  variant.version === item.version,
              ),
          )
          .map((item) => JSON.stringify(item));
      const mismatch = thirdParty(left)
        .filter((item) => !thirdParty(right).includes(item))
        .concat(
          thirdParty(right).filter((item) => !thirdParty(left).includes(item)),
        );
      const provenanceValid =
        !left.leaks.length && !right.leaks.length && !mismatch.length;
      phase = 'calibration slot pilot arm baseline';
      const calibration = [
        execute(baseline, row.id, 0),
        ((phase = 'calibration slot pilot arm candidate'),
        execute(candidate, row.id, 0)),
      ];
      const count = Math.max(...calibration.map((item) => item.count));
      for (let round = 0; round < (row.rounds ?? 20); round++) {
        for (const slot of slotOrder(round)) {
          phase = `round ${round + 1} slot ${slot} arm ${slot === 'B' ? 'candidate' : 'baseline'}`;
          slots.push({
            round,
            slot,
            data: execute(slot === 'B' ? candidate : baseline, row.id, count),
          });
        }
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
      const invalidSlots = slots.filter((item) => {
        const actual = item.data.provenance;
        const expected = item.slot === 'B' ? right : left;
        const a = thirdParty(actual);
        const b = thirdParty(expected);
        return !(
          actual.leaks.length === 0 &&
          a.length === b.length &&
          a.every((entry) => b.includes(entry))
        );
      });
      const slotProvenanceValid = invalidSlots.length === 0;
      const result =
        provenanceValid && overheadValid && slotProvenanceValid
          ? verdict(ratios, control)
          : 'void';
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
            : !provenanceValid || !slotProvenanceValid
              ? `Dependency provenance violation: ${[...left.leaks, ...right.leaks, ...mismatch, ...invalidSlots.map((item) => `round ${item.round + 1} slot ${item.slot}: ${item.data.provenance.leaks.join(', ') || 'dependency set changed'}`)].join('; ')}`
              : !overheadValid
                ? 'Driver overhead dominates'
                : 'Control ratios outside the valid range',
      });
    },
  );
  await save();
}
run.status = 'complete';
await save();
