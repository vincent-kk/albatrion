/*
 * 사용법(stage-07 루트):
 *   node <이 파일> --input=<디렉터리|파일>[,…] [--out=<S 안의 파일>]
 *   node <이 파일> --input=<…> --aa=<A/A 보고.json> [--confirm-input=<…>] [--counts=<계수.json>] [--axis-from=<코어 보고.json>] [--out=…]
 * 입력은 measure-core-pair-129·measure-react-pair-129의 cluster-pair-129 기록이며, measure-core-pair-126의 { workers: [...] }와
 * measure-verdict-121 --pair의 최상위 summary·timings도 읽습니다(블록 하나씩으로 셈). 행마다 ABBA 블록의 짝 차이
 * median(기준 표본) − median(변경 표본)을 하나씩 내고, 블록을 재표집하는 클러스터 bootstrap(1,999회, nearest-rank 99%)으로
 * 구간을 냅니다(127C-01). 시드는 행 키(fixture/validation/mode)의 32비트 해시입니다.
 * A/A 입력이면 행마다 |통계량|과 0을 제외한 행의 비율을 냅니다. 변경 입력이면 105C-01의 하한 max(|A/A|, 기준 중앙값 0.5%)으로
 * 회귀와 이득을 가르고, 회귀 행은 --confirm-input의 독립 확인 측정에서도 회귀일 때만 회귀로 셉니다(128C-01 (2)).
 * 센 회귀에는 124C-01의 네 조건을 128C-01 (1)대로 적용합니다. 이름은 "측정 조건 소음(기록)"이고, gc 없는 기록 열은 모든 행에서
 * 쓰며, 면제되는 행에는 --counts의 작업 계수가 있어야 합니다(없으면 "계수 없음"으로 면제하지 않음).
 * --out이 없으면 전체 JSON을 stdout에 냅니다.
 */
// CLI report and library: `reportCluster129` is also driven by self-test-129.mjs with synthetic records.
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { clusterBootstrap129 } from './cluster-bootstrap-129.mjs';
import { median129 } from './median-129.mjs';
import { rowSeed129 } from './row-seed-129.mjs';

/** Verdict modes of the branch-count axis named by the owner (round 113); their significant gains feed condition (1). */
const AXIS_MODES = ['axis-update', 'axis-first', 'axis-later'];
/** 127C-01 block count; fewer blocks (smoke runs) give intervals that are not judgments. */
const DESIGN_BLOCKS = 24;
/** 128C-01 name of the 124C-01 exemption. */
const EXEMPTION_LABEL = '측정 조건 소음(기록)';

/**
 * Turn one input record of any accepted shape into per-row block contributions and empty-call pools.
 * @param record - cluster-pair-129 record, a `{ workers }` record of measure-core-pair-126, or a measure-verdict-121
 *   `--pair` stdout object with top-level `summary` and `timings`
 * @param source - File name used to make legacy block ids unique
 * @returns `{ stage, lane, confirmModes, contributions: [{ key, lane, fixture, validation, mode, record, callCount, blockId,
 *   order, base, candidate }], empty: [{ lane, validation, values }], corrected }`
 */
function normalizeRecord(record, source) {
  const contributions = [], empty = [];
  const add = (lane, fixture, validation, mode, recordColumn, callCount, blockId, order, base, candidate) => {
    assert(base.length > 0 && candidate.length > 0, `${source}: empty samples for ${fixture}/${validation}/${mode}`);
    contributions.push({ key: `${fixture}/${validation}/${mode}`, lane, fixture, validation, mode, record: recordColumn, callCount, blockId, order, base, candidate });
  };
  const legacyCallCount = (summary, mode) => {
    const plain = mode.replace(/-nogc$/, '');
    return plain === 'update' ? summary.interactionCount : plain === 'axis-update' ? 2 : 1;
  };
  if (record.format === 'cluster-pair-129') {
    for (const block of record.blocks) {
      for (const column of [...record.verdictColumns, ...record.recordColumns])
        add(record.lane, record.fixture, record.validation, column, record.recordColumns.includes(column), record.callCounts?.[column] ?? 1,
          String(block.block), block.order, block.base.samples[column], block.candidate.samples[column]);
      if (record.lane === 'core' && record.coreEmptyPool131 !== false) empty.push({ lane: 'core', validation: record.validation, values: [...block.base.emptyEndMs, ...block.candidate.emptyEndMs] });
    }
    return { stage: record.stage, lane: record.lane, confirmModes: record.confirm?.modes ?? null, contributions, empty, corrected: record.lane === 'core' };
  }
  const workers = Array.isArray(record.workers) ? record.workers : record.summary && record.timings ? [record] : null;
  assert(workers, `${source}: neither cluster-pair-129, { workers: [...] } nor top-level summary/timings`);
  for (const worker of workers) {
    const { summary, timings } = worker;
    assert(timings.base && timings.candidate, `${source}: a legacy record must hold both sides; single-side worker output cannot be paired alone`);
    const blockId = `${path.basename(source)}#r${summary.run}b${summary.block ?? 0}`;
    for (const mode of [...summary.verdictColumns, ...summary.recordColumns])
      add('core', summary.fixture, summary.validation, mode, summary.recordColumns.includes(mode), legacyCallCount(summary, mode), blockId,
        summary.order ?? null, timings.base[mode].map(row => row[1]), timings.candidate[mode].map(row => row[1]));
    if (worker.empty) empty.push({ lane: 'core', validation: summary.validation, values: [...worker.empty.before, ...worker.empty.after].map(row => row[1]) });
  }
  return { stage: workers[0].summary.stage, lane: 'core', confirmModes: null, contributions, empty, corrected: workers.every(worker => worker.empty) };
}

/**
 * Compute the cluster statistic of every row from normalized records.
 * @param normalized - normalizeRecord outputs of one stage
 * @param seedSuffix - Appended to each row key before hashing; `#confirm` keeps a confirmation pass on its own stream
 * @returns Map from row key to `{ key, lane, fixture, validation, mode, column, blocks, blockDifferencesMs, statistic,
 *   baseMedianMs, candidateMedianMs, correctionMs, byOrderMs }`
 */
function buildRows(normalized, seedSuffix = '') {
  const emptyByPath = new Map();
  for (const { empty } of normalized) for (const pool of empty) {
    const id = `${pool.lane}/${pool.validation}`;
    emptyByPath.set(id, [...(emptyByPath.get(id) ?? []), ...pool.values]);
  }
  const groups = new Map();
  for (const { contributions } of normalized) for (const item of contributions) {
    const group = groups.get(item.key) ?? { ...item, blocks: new Map() };
    assert(!group.blocks.has(item.blockId), `${item.key}: block ${item.blockId} appears twice`);
    group.blocks.set(item.blockId, item);
    groups.set(item.key, group);
  }
  const rows = new Map();
  for (const [key, group] of groups) {
    const blocks = [...group.blocks.values()].sort((a, b) => a.blockId.localeCompare(b.blockId, 'en', { numeric: true }));
    const differences = blocks.map(block => median129(block.base) - median129(block.candidate));
    const pool = emptyByPath.get(`${group.lane}/${group.validation}`);
    const correctionMs = group.lane === 'core' && pool?.length ? group.callCount * median129(pool) : 0;
    const orderMedian = first => {
      const selected = differences.filter((_, index) => blocks[index].order?.[0] === first);
      return selected.length ? median129(selected) : null;
    };
    rows.set(key, { key, lane: group.lane, fixture: group.fixture, validation: group.validation, mode: group.mode,
      column: group.record ? 'record' : 'verdict', blocks: blocks.length, blockDifferencesMs: differences,
      statistic: clusterBootstrap129(differences, rowSeed129(key + seedSuffix)),
      baseMedianMs: median129(blocks.flatMap(block => block.base)) - correctionMs,
      candidateMedianMs: median129(blocks.flatMap(block => block.candidate)) - correctionMs, correctionMs,
      byOrderMs: { baseFirst: orderMedian('base'), candidateFirst: orderMedian('candidate') } });
  }
  return rows;
}

/** 105C-01 per row: regression below the floor max(|A/A|, 0.5% of the corrected base median), gain above |A/A|. */
const judge = (row, aaMagnitudeMs) => {
  const floorMs = Math.max(aaMagnitudeMs, row.baseMedianMs * .005);
  const { median, low, high } = row.statistic;
  return { aaMagnitudeMs, floorMs, regression: high < 0 && Math.abs(median) > floorMs, gain: low > 0 && median > aaMagnitudeMs };
};

/** Read a work count: a bare non-negative integer or `{ calls }`; anything else counts as missing. */
const workCount = (counts, key) => {
  const entry = counts?.[key];
  const calls = typeof entry === 'number' ? entry : entry?.calls;
  return Number.isInteger(calls) && calls >= 0 ? { calls, changedCodeExecutes: calls > 0, probe: entry?.probe ?? null } : null;
};

/**
 * Judge one stage from cluster statistics: A/A magnitudes, or 105C-01 verdicts with the 128C-01 confirmation and the
 * 124C-01 exemption as 128C-01 reads it.
 * @param input - `{ records: [{ record, source }], confirmRecords?: [{ record, source }], aa?: cluster-report-129 A/A report,
 *   counts?: { [rowKey]: number | { calls, probe } }, axisGainMs?: number }`
 * @returns cluster-report-129 object; for a change stage `decision` is ADOPT, REJECT or CONFIRMATION_PENDING by the rules only
 */
export function reportCluster129(input) {
  const normalized = input.records.map(({ record, source }) => normalizeRecord(record, source));
  const stage = normalized[0].stage;
  assert(normalized.every(item => item.stage === stage && item.confirmModes === null), 'First-measurement inputs must share one stage and hold no confirmation records');
  const rows = buildRows(normalized);
  const method = { unit: 'one paired difference per ABBA block: median(base samples) − median(candidate samples)',
    statistic: 'median of block differences (mean of the two middle values for an even count)',
    interval: 'cluster bootstrap over blocks, xorshift32, 1,999 trials, nearest-rank 0.5% and 99.5%',
    seed: '32-bit FNV-1a of "fixture/validation/mode" (confirmation passes append "#confirm")',
    correction: 'core: call count × pooled empty end-to-end median of the validation path, both sides; React: none',
    sign: 'base − candidate; negative means the candidate is slower',
    correctedBaseMedian: normalized.every(item => item.corrected) };
  const list = [...rows.values()].sort((a, b) => a.key.localeCompare(b.key));
  const excludesZero = row => row.statistic.low > 0 || row.statistic.high < 0;
  const blockCoverage = { designBlocks: DESIGN_BLOCKS, rowsBelowDesignBlocks: list.filter(row => row.blocks < DESIGN_BLOCKS).length };
  if (stage === 'AA') {
    const verdictRows = list.filter(row => row.column === 'verdict'), recordRows = list.filter(row => row.column === 'record');
    const magnitudes = verdictRows.map(row => Math.abs(row.statistic.median));
    return { format: 'cluster-report-129', stage, method, blockCoverage,
      rows: list.map(row => ({ ...row, aaMagnitudeMs: Math.abs(row.statistic.median), excludesZero: excludesZero(row) })),
      aaSummary: { verdictRows: verdictRows.length, verdictExcludingZero: verdictRows.filter(excludesZero).map(row => row.key),
        verdictExcludingZeroRate: verdictRows.filter(excludesZero).length / Math.max(1, verdictRows.length),
        recordRows: recordRows.length, recordExcludingZero: recordRows.filter(excludesZero).map(row => row.key),
        magnitudeMedianMs: magnitudes.length ? median129(magnitudes) : null, magnitudeMaxMs: magnitudes.length ? Math.max(...magnitudes) : null } };
  }
  assert(input.aa?.format === 'cluster-report-129' && input.aa.stage === 'AA', 'A change stage needs a cluster-report-129 A/A report (--aa)');
  const aaByKey = new Map(input.aa.rows.map(row => [row.key, row.aaMagnitudeMs]));
  const judged = list.map(row => row.column === 'record' ? { ...row, verdict: null }
    : aaByKey.has(row.key) ? { ...row, verdict: judge(row, aaByKey.get(row.key)) } : { ...row, verdict: null, aaMissing: true });
  const flagged = judged.filter(row => row.verdict?.regression);
  const describe = row => ({ key: row.key, lane: row.lane, fixture: row.fixture, validation: row.validation, mode: row.mode,
    statisticMs: row.statistic.median, low: row.statistic.low, high: row.statistic.high, floorMs: row.verdict?.floorMs ?? null });

  let confirmation = null, counted = flagged;
  if (input.confirmRecords?.length) {
    const confirmNormalized = input.confirmRecords.map(({ record, source }) => normalizeRecord(record, source));
    assert(confirmNormalized.every(item => item.stage === stage && item.confirmModes), 'Confirmation records must come from confirm mode of the same stage');
    const confirmRows = buildRows(confirmNormalized, '#confirm');
    const allowed = new Set(confirmNormalized.flatMap(item => item.contributions.filter(contribution => item.confirmModes.includes(contribution.mode))
      .map(contribution => contribution.key)));
    const rowsOut = flagged.map(row => {
      const second = allowed.has(row.key) ? confirmRows.get(row.key) : undefined;
      if (!second) return { key: row.key, status: '확인 측정 없음', confirmed: null };
      const verdict = judge(second, row.verdict.aaMagnitudeMs);
      return { key: row.key, status: verdict.regression ? '확인됨' : '확인되지 않음', confirmed: verdict.regression,
        second: { blocks: second.blocks, statistic: second.statistic, baseMedianMs: second.baseMedianMs, verdict } };
    });
    confirmation = { inputs: input.confirmRecords.map(({ source }) => source), rows: rowsOut };
    counted = flagged.filter(row => rowsOut.find(item => item.key === row.key).confirmed === true);
  }
  const pending = flagged.length > 0 && (!confirmation || confirmation.rows.some(row => row.confirmed === null));

  const axisGainMs = input.axisGainMs ?? judged.filter(row => row.lane === 'core' && AXIS_MODES.includes(row.mode) && row.verdict?.gain)
    .reduce((total, row) => total + row.statistic.median, 0);
  const evaluated = confirmation ? counted : flagged;
  const regressionTotalMs = evaluated.reduce((total, row) => total + Math.abs(row.statistic.median), 0);
  const exemptionRows = evaluated.map(row => {
    const lossMs = Math.abs(row.statistic.median);
    const noGc = rows.get(`${row.fixture}/${row.validation}/${row.mode}-nogc`);
    const count = workCount(input.counts, row.key);
    const conditions = { axisGainOverTenfoldLoss: axisGainMs > 10 * regressionTotalMs,
      withinTwoPercentAndFiveUs: lossMs <= .02 * row.baseMedianMs && lossMs <= .005,
      noGcColumnMeasured: Boolean(noGc), noGcIntervalContainsZero: noGc ? noGc.statistic.low <= 0 && noGc.statistic.high >= 0 : null,
      workCountPresent: Boolean(count) };
    const exempted = Object.values(conditions).every(value => value === true);
    const reasons = [!conditions.axisGainOverTenfoldLoss && '조건 (1) 축 이득이 회귀 합계의 열 배 이하',
      !conditions.withinTwoPercentAndFiveUs && '조건 (2) 2%·5 µs 초과', !noGc && '조건 (4) gc 없는 열 없음(먼저 잼)',
      noGc && !conditions.noGcIntervalContainsZero && '조건 (3) gc 없는 열 구간이 0을 품지 않음', !count && '계수 없음'].filter(Boolean);
    return { key: row.key, lossMs, lossPercent: lossMs / row.baseMedianMs * 100, conditions,
      noGc: noGc ? { statistic: noGc.statistic, blocks: noGc.blocks } : null, workCount: count ?? '계수 없음',
      exempted, label: exempted ? EXEMPTION_LABEL : null, reasons };
  });
  const blocking = confirmation ? exemptionRows.filter(row => !row.exempted).map(row => row.key) : [];
  return { format: 'cluster-report-129', stage, method, blockCoverage, aa: { rows: aaByKey.size },
    rows: judged, gains: judged.filter(row => row.verdict?.gain).map(row => row.key),
    aaMissing: judged.filter(row => row.aaMissing).map(row => row.key),
    flaggedRegressions: flagged.map(describe), confirmation,
    exemption: { label: EXEMPTION_LABEL, axisGainMs, regressionTotalMs, provisional: !confirmation, rows: exemptionRows },
    blockingRegressions: blocking,
    decision: pending ? 'CONFIRMATION_PENDING' : blocking.length ? 'REJECT' : 'ADOPT' };
}

/**
 * Read every `pair-*.json` record under the given directories and files.
 * @param list - Comma-separated paths
 * @returns `[{ record, source, sha256 }]` in a stable order
 */
function readRecords(list) {
  return list.split(',').flatMap(entry => fs.statSync(entry).isDirectory()
    ? fs.readdirSync(entry).filter(name => /^pair-.*\.json$/.test(name)).sort().map(name => path.join(entry, name)) : [entry])
    .map(file => { const text = fs.readFileSync(file, 'utf8'); return { record: JSON.parse(text), source: file, sha256: createHash('sha256').update(text).digest('hex') }; });
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const flag = name => process.argv.find(value => value.startsWith(`--${name}=`))?.slice(name.length + 3);
  const scratch = '/private/tmp/claude-501/-Users-Vincent-Workspace-albatrion/c8aaf054-1ea7-43d3-b3c1-a4196f8407e1/scratchpad';
  assert(flag('input'), '--input=<directory|file>[,…] is required');
  const records = readRecords(flag('input'));
  const confirmRecords = flag('confirm-input') ? readRecords(flag('confirm-input')) : [];
  const json = file => file ? JSON.parse(fs.readFileSync(file, 'utf8')) : undefined;
  const counts = json(flag('counts'));
  const report = reportCluster129({ records, confirmRecords, aa: json(flag('aa')), counts: counts?.rows ?? counts,
    axisGainMs: flag('axis-from') ? json(flag('axis-from')).exemption.axisGainMs : undefined });
  report.inputs = { records: records.map(({ source, sha256 }) => ({ source, sha256 })),
    confirmRecords: confirmRecords.map(({ source, sha256 }) => ({ source, sha256 })),
    aa: flag('aa') ?? null, counts: flag('counts') ?? null, axisFrom: flag('axis-from') ?? null,
    toolSha256: createHash('sha256').update(fs.readFileSync(fileURLToPath(import.meta.url))).digest('hex') };
  const out = flag('out');
  if (out) {
    assert(path.resolve(out).startsWith(scratch + '/'), '--out must be under the scratch root');
    fs.writeFileSync(out, JSON.stringify(report) + '\n');
  } else console.log(JSON.stringify(report));
  console.log(`CLUSTER_REPORT_129_OK: stage ${report.stage}; ${report.rows.length} rows; ` + (report.stage === 'AA'
    ? `verdict rows excluding 0: ${report.aaSummary.verdictExcludingZero.length}/${report.aaSummary.verdictRows}`
    : `flagged ${report.flaggedRegressions.length}; gains ${report.gains.length}; decision ${report.decision}`));
}
