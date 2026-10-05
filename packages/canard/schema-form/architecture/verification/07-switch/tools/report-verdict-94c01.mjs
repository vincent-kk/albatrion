// Invoked after sequential probes; emits native-editor patches or checks the written artifacts.
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const directory = path.dirname(fileURLToPath(import.meta.url));
const output = path.resolve(directory, '..');
const repo = path.resolve(output, '../../../../../..');
const relativeOutput = path.relative(repo, output);
assert.equal(fs.realpathSync(repo), '/Users/Vincent/Workspace/albatrion/.claude/worktrees/stage-07');
const git = args => execFileSync('git', args, { cwd: repo, encoding: 'utf8', maxBuffer: 10_000_000 });
const head = git(['rev-parse', 'HEAD']).trim();
assert.equal(head, '9383abcdaf22c7dd19dd6d6ddb7e66b4a9616dd4');
const hash = value => createHash('sha256').update(value).digest('hex');
const baseSummaryText = git(['show', `${head}:${relativeOutput}/verdict-93c01-summary.json`]);
const baseMarkdown = git(['show', `${head}:${relativeOutput}/verdict-93c01.md`]);
const summary = JSON.parse(baseSummaryText);
const fmt = value => Number.isFinite(value) ? value.toFixed(4) : '보정 불가';
const median = values => values.toSorted((a, b) => a - b)[Math.ceil(values.length * .5) - 1];
const modeLabel = mode => ({ mount: '마운트', update: 'BF 갱신 열',
  'update-first': '마운트 직후 첫 갱신', 'update-later': '이후 갱신' })[mode];
const modeFromLabel = Object.fromEntries(['mount', 'update', 'update-first', 'update-later'].map(mode => [modeLabel(mode), mode]));
const branches = fixture => /oneOf|if-then/.test(fixture);
const crosses = (ratios, target) => ratios.some(value => value <= target) && ratios.some(value => value > target);
const accepted = (ratio, ratios, target) => target === 1 ? !ratios.every(value => value > 1) : ratio <= target || crosses(ratios, target);

/** Apply the bias guard and then the editor's run-level tie exception. */
function correct(row) {
  row.originalVerdict = row.verdict;
  row.originalCorrectedVerdict = row.correctedVerdict;
  row.correctedRunRatios = row.new.runs.map((run, index) => run.corrected.median / row.old.runs[index].corrected.median);
  if (row.target === null) return;
  row.rawRunTie = crosses(row.runRatios, row.target);
  row.correctedRunTie = crosses(row.correctedRunRatios, row.target);
  const rawMet = accepted(row.ratio, row.runRatios, row.target);
  const correctedMet = accepted(row.correctedRatio, row.correctedRunRatios, row.target);
  row.strictBiasCorrectedVerdict = row.ratio <= row.target && row.correctedRatio <= row.target ? '충족' : '미달';
  row.verdict = rawMet && (row.lane !== 'core' || correctedMet) ? '충족' : '미달';
  row.correctedVerdict = correctedMet ? '충족' : '미달';
  row.tie = row.verdict === '충족' && (row.lane === 'core' ? row.correctedRunTie : row.rawRunTie);
  row.verdictRule = row.lane === 'core' ? '원/보정 모두 목표 충족; 각 기준의 회차 교차는 동률 예외' : 'production Profiler; 회차 목표선 교차는 동률 예외';
}
for (const key of ['officialRows', 'updateSplitRows', 'reactPhaseDiagnostics', 'branchAxisRows']) summary[key].forEach(correct);

// The render/commit share is a separate 91-round diagnostic, with its own run ratios.
for (const criterion of summary.branchCriteria.filter(row => row.reactShare)) {
  const diagnostic = summary.reactPhaseDiagnostics.find(row => row.fixture === criterion.fixture &&
    row.mode === criterion.mode && row.validation === 'off');
  const share = criterion.reactShare;
  const perRun = key => diagnostic.new.runs.map((run, index) => {
    const old = JSON.parse(fs.readFileSync(path.join(output, diagnostic.old.runs[index].source + '-timings.json')))[criterion.mode];
    const next = JSON.parse(fs.readFileSync(path.join(output, run.source + '-timings.json')))[criterion.mode];
    return median(next.map(sample => sample[key])) / median(old.map(sample => sample[key]));
  });
  share.runRatios = perRun('renderCommit');
  share.correctedRunRatios = perRun('correctedRenderCommit');
  share.originalVerdict = share.verdict;
  share.tie = crosses(share.runRatios, 1);
  share.verdict = accepted(share.rawRatio, share.runRatios, 1) ? '충족' : '미달';
}
summary.branchReactShareCounts = { rows: summary.branchCriteria.filter(row => row.reactShare).length,
  met: summary.branchCriteria.filter(row => row.reactShare?.verdict === '충족').length,
  missed: summary.branchCriteria.filter(row => row.reactShare?.verdict === '미달').length,
  ties: summary.branchCriteria.filter(row => row.reactShare?.tie).length,
  scope: '91라운드 렌더·커밋 몫 진단; 일반 React production Profiler 그룹 수와 별도' };
summary.biasFlipsBranchedReactShare = summary.branchCriteria.filter(row => row.reactShare?.biasFlip);

function countsFor(rows) {
  const result = {};
  for (const lane of ['core', 'react']) for (const group of ['branchless', 'expression']) {
    const selected = rows.filter(row => row.lane === lane && row.target !== null &&
      (row.fixture === 'computed-visible-derived') === (group === 'expression'));
    const met = selected.filter(row => row.verdict === '충족');
    const strict = selected.filter(row => row.strictBiasCorrectedVerdict === '충족');
    result[`${lane}-${group}`] = { rows: selected.length, met: met.length, missed: selected.length - met.length,
      ties: selected.filter(row => row.tie).length,
      metRows: met.map(row => `${row.fixture}/${row.mode}`),
      missedRows: selected.filter(row => row.verdict === '미달').map(row => `${row.fixture}/${row.mode}`),
      tieRows: selected.filter(row => row.tie).map(row => `${row.fixture}/${row.mode}`),
      strictCorrectedMet: strict.length, strictCorrectedMissed: selected.length - strict.length,
      originalRawMet: selected.filter(row => row.originalVerdict === '충족').length,
      correctedMet: selected.filter(row => row.correctedVerdict === '충족').length,
      correctedMissed: selected.filter(row => row.correctedVerdict === '미달').length };
  }
  return result;
}
summary.groupCounts = countsFor(summary.officialRows);
summary.updateSplitGroupCounts = countsFor(summary.updateSplitRows);
assert.equal(summary.groupCounts['core-branchless'].strictCorrectedMet, 7);
assert.equal(summary.groupCounts['core-branchless'].met, 8);
assert.equal(summary.groupCounts['react-branchless'].met, 22);
assert.equal(summary.groupCounts['react-expression'].met, 2);
const decisionText = git(['show', 'origin/1.0.0-beta:packages/canard/schema-form/architecture/reviews/round-94-closing.md']);
assert.equal(git(['rev-parse', 'origin/1.0.0-beta']).trim(), 'a223b369b08c6cb9ce6010fed4e4518b0566eebb');
summary.title = '93C-01 판정표 — 94C-01(가)·94C-02 정정';
summary.status = 'provisional-official-corrected; end-to-end replacement blocked';
summary.supersededForOfficialUse = false;
summary.supersessionCondition = '무계측 종단 공식 표가 성립할 때 공식 용도에서 대체하고 진단 자료로 유지';
summary.correction = { decisions: ['94C-01(가)', '94C-02'], baseHead: head, baseSummarySha256: hash(baseSummaryText),
  sourceCommit: 'a223b369b08c6cb9ce6010fed4e4518b0566eebb', sourceSha256: hash(decisionText),
  coreRule: '보정만으로 branchless 7/24; sample-0 mount의 보정 회차 교차를 동률로 인정하면 8/24',
  tieRule: '각 회차 중앙값 비가 목표선 양쪽이면 동률·충족; 원 회차 교차만으로 보정 실패를 덮지 않음',
  originalMeasurementsUnchanged: true };
summary.method.biasLimit = 'JIT·캐시·계측 구조 변형은 제거하지 못함. 94C-01(가)에 따라 보정도 충족해야 하며 94C-02 동률 예외를 적용';
summary.method.verdict = '코어 원/보정 목표 및 회차 동률; React production Profiler 회차 동률';
summary.sourceDocuments.push({ path: 'architecture/reviews/round-94-closing.md', ref: 'origin/1.0.0-beta',
  commit: 'a223b369b08c6cb9ce6010fed4e4518b0566eebb', sha256: hash(decisionText) });

const fixtures = [...new Set(summary.officialRows.filter(row => row.lane === 'core' && row.validation === 'off').map(row => row.fixture))];
const probes = fixtures.map(fixture => {
  const stem = `verdict-94c01-scheduling-${fixture}`;
  const summaryText = fs.readFileSync(path.join(output, `${stem}-summary.json`), 'utf8');
  const timingText = fs.readFileSync(path.join(output, `${stem}-timings.json`), 'utf8');
  const probe = JSON.parse(summaryText), timings = JSON.parse(timingText);
  assert.equal(probe.environment.head, head);
  assert.equal(probe.environment.node, 'v26.10.0');
  assert.equal(probe.environment.externalSubscribers, 0);
  assert.equal(probe.environment.validation, 'off');
  assert.equal(probe.toolSha256, hash(fs.readFileSync(path.join(directory, 'check-verdict-94c01-scheduling.mjs'))));
  assert.equal(probe.valueChecks.samples, 101);
  assert.equal(probe.valueChecks.distinctHashes.length, 1);
  assert(probe.environment.warmup >= 10 && probe.environment.samples >= 100);
  for (const row of probe.rows) {
    assert.equal(timings[row.mode].length, 101);
    for (const sample of timings[row.mode]) assert(Object.entries(sample).every(([key, value]) => key.endsWith('Ms') && Number.isFinite(value) && value >= 0));
    assert(row.pendingAfterMicrotasks.median > 0);
    assert.equal(row.onChangeAtMicrotaskBoundary.median, 0);
    assert(row.onChangeCalls.median > 0);
  }
  assert(Buffer.byteLength(summaryText) <= 5_000_000 && Buffer.byteLength(timingText) <= 5_000_000);
  return { ...probe, artifacts: { summary: { path: `${stem}-summary.json`, bytes: Buffer.byteLength(summaryText), sha256: hash(summaryText) },
    timings: { path: `${stem}-timings.json`, bytes: Buffer.byteLength(timingText), sha256: hash(timingText) } } };
});
assert.equal(probes.length, 18);
const started = probes.map(probe => probe.environment.started).sort()[0];
const ended = probes.map(probe => probe.environment.ended).sort().at(-1);
const allRows = probes.flatMap(probe => probe.rows.map(row => ({ fixture: probe.environment.fixture, ...row })));
const timers = ['setTimeout', 'setImmediate', 'requestAnimationFrame', 'MessageChannel'];
assert(allRows.every(row => row.primitiveCounts.setImmediate.executed.median > 0));
assert(allRows.every(row => ['setTimeout', 'requestAnimationFrame', 'MessageChannel'].every(name => row.primitiveCounts[name].scheduled.p99 === 0)));
const schedulerPath = 'packages/winglet/common-utils/src/utils/scheduler/scheduleMacrotaskSafe.ts';
const schedulerRuntime = 'packages/winglet/common-utils/dist/utils/scheduler/scheduleMacrotaskSafe.cjs';
const enginePrefix = 'packages/canard/schema-form/src/core/nodes/AbstractNode/';
const engineSites = { batch: `${enginePrefix}utils/EventCascadeManager/EventCascadeManager.ts`,
  delivery: `${enginePrefix}utils/afterMicrotask/afterMicrotask.ts`, root: `${enginePrefix}AbstractNode.ts` };
const codeReasons = [
  { role: 'event-batch-reset', ref: '@canard/schema-form@0.16.0', path: engineSites.batch, line: 112,
    reason: '마이크로태스크 배치를 예약할 때 별도의 scheduleMacrotaskSafe에서 __idle__=true, __count__=0 초기화' },
  { role: 'onChange-delivery', ref: '@canard/schema-form@0.16.0', path: engineSites.delivery, line: 26,
    reason: 'afterMicrotask라는 이름이지만 실제 구현은 scheduleMacrotaskSafe(callback)' },
  { role: 'root-onChange', ref: '@canard/schema-form@0.16.0', path: engineSites.root, line: 1145,
    reason: '루트가 검증 OFF에서도 필수 onChange를 afterMicrotask로 감싸고 normalizedValue를 그 콜백 안에서 읽음' },
  { role: 'node-scheduler', path: schedulerRuntime, line: 6,
    reason: '실행된 CJS는 Node의 globalThis.setImmediate/clearImmediate를 선택하고 없을 때만 setTimeout으로 폴백' },
];
const question = '원장 관리자께: 검증 OFF·외부 구독 0에서도 0.16.0의 배치 초기화와 필수 noop onChange의 값 읽기·배달이 Node setImmediate를 기다립니다. 이 두 몫을 정착 범위에서 제외하도록 TEST-026/94C-01의 계약을 바꾸시겠습니까, 아니면 타이머 대기를 제외하면서 콜백의 실제 실행 몫을 포함하는 다른 공식 측정 방법을 지정하시겠습니까?';
const currentCounts = summary.groupCounts;
const report = { title: '94C-01(나) 종단 공식 판정 중단 — 마이크로태스크 전용 조건 불성립',
  status: 'blocked-macrotask-settlement', officialCoreCounts: null, officialEndToEndRows: [],
  retainedReactCounts: Object.fromEntries(Object.entries(currentCounts).filter(([key]) => key.startsWith('react'))),
  reactReuse: { source: 'verdict-93c01-summary.json', environment: summary.environment,
    measurementUnchanged: true, ruleChangeOnly: '94C-02 회차 동률' },
  diagnosticCorrectionCounts: currentCounts, environment: { head, worktree: repo, node: 'v26.10.0',
    v8: probes[0].environment.v8, cpu: probes[0].environment.cpu, sessionStarted: started, sessionEnded: ended,
    oldSource: '@canard/schema-form@0.16.0 tag source (same baseline as 93C-01)',
    oldCommit: git(['rev-parse', '@canard/schema-form@0.16.0^{commit}']).trim(),
    warmup: 12, samplesPerFixture: 101, fixtures: 18, processes: 18, sequential: true, naturalExit: true },
  microtaskCheck: { onlyMicrotasks: false, primitive: 'setImmediate',
    emptyMicrotaskTurns: 64, rows: 72, allRowsHavePendingMacrotasks: true,
    noExternalSubscribers: true, validationOff: true, noopOnChange: true,
    unavailablePrimitives: ['requestAnimationFrame'], observedUnusedPrimitives: ['setTimeout', 'MessageChannel'],
    timerCpuRangeMs: { mount: [Math.min(...allRows.filter(row => row.mode === 'mount').map(row => row.timings.timerCallbackMs.median)),
      Math.max(...allRows.filter(row => row.mode === 'mount').map(row => row.timings.timerCallbackMs.median))],
      update: [Math.min(...allRows.filter(row => row.mode === 'update').map(row => row.timings.timerCallbackMs.median)),
        Math.max(...allRows.filter(row => row.mode === 'update').map(row => row.timings.timerCallbackMs.median))] },
    limits: '스케줄링/async_hooks 계측이 포함된 진단 CPU 시간과 점유율이며 무계측 성능값이 아니다. setImmediate는 setTimeout 타이머가 아니라 check 단계의 macrotask다. 여기서는 요청의 비마이크로태스크 대기 중단 조건에 해당한다.' },
  endToEndToolValidation: { status: 'not-run-precondition-failed',
    newEndToEndAtLeastSynchronous: null, oldAsyncIncluded: null, sentinelCalibration: null,
    reason: '마이크로태스크만 배출하면 실제 콜백 작업을 누락하며 setImmediate sentinel은 엔진의 macrotask를 포함할 수 있으므로 공식 도구를 만들거나 판정하지 않음' },
  ledgerQuestion: { id: 'Q94C-01-TIMER', question, codeReasons },
  sourceDocuments: summary.sourceDocuments,
  sourceSha256: Object.fromEntries([schedulerPath, schedulerRuntime].map(file => [file, hash(fs.readFileSync(path.join(repo, file)))])),
  releaseSourceSha256: Object.fromEntries(Object.values(engineSites).map(file => [file, hash(git(['show', `@canard/schema-form@0.16.0:${file}`]))])),
  probes, verification: { timingOnly: true, maxTimingBytes: Math.max(...probes.map(probe => probe.artifacts.timings.bytes)),
    samplesPerOperation: 101, operations: 72, schedulingProbeSelfCheck: 'SCHEDULER_PROBE_OK',
    headUnchanged: true, productSourceUnchanged: true, officialTableSuperseded: false,
    g26: '미통과; 기존 일반 행 미달과 새 종단 방법의 전제 실패가 남음' },
  toolSourceSha256: Object.fromEntries(['check-verdict-94c01-scheduling.mjs', 'report-verdict-94c01.mjs']
    .map(file => [file, hash(fs.readFileSync(path.join(directory, file)))])),
};

/** Rewrite all primary timing tables without changing their diagnostic measurements. */
function correctedMarkdown() {
  const lines = baseMarkdown.split('\n');
  let lane, inTimingTable = false, originalTimingRows = 0;
  const result = [];
  for (let line of lines) {
    if (line.startsWith('#')) { inTimingTable = false; if (line.includes('코어')) lane = 'core'; else if (line.includes('React')) lane = 'react'; }
    if (line.startsWith('| 픽스처 | 작업 | old median')) {
      inTimingTable = true;
      line = line.replace('목표·원 판정', 'r1 원 / 보정 | r2 원 / 보정 | r3 원 / 보정 | 목표·94 판정');
    } else if (inTimingTable && line.startsWith('| ---')) {
      const cells = line.split('|').slice(1, -1).map(cell => cell.trim());
      cells.splice(6, 0, '---:', '---:', '---:');
      line = `| ${cells.join(' | ')} |`;
    } else if (inTimingTable && line.startsWith('| ')) {
      const cells = line.split('|').slice(1, -1).map(cell => cell.trim());
      const candidates = [...summary.officialRows, ...summary.updateSplitRows];
      const row = candidates.find(row => row.lane === lane && row.fixture === cells[0] && row.mode === modeFromLabel[cells[1]] &&
        `${fmt(row.old.metric.median)} / ${fmt(row.old.metric.p99)}` === cells[2] && `${fmt(row.new.metric.median)} / ${fmt(row.new.metric.p99)}` === cells[3]);
      assert(row, `Unmapped verdict row ${lane}: ${line}`);
      cells[6] = row.target === null ? row.verdict : `${row.target}×·${row.tie ? '동률·' : ''}${row.verdict}${row.biasFlip ? ' ★ 원→보정 경계' : ''}`;
      cells.splice(6, 0, ...row.runRatios.map((ratio, index) => `${fmt(ratio)}× / ${fmt(row.correctedRunRatios[index])}×`));
      line = `| ${cells.join(' | ')} |`;
      originalTimingRows++;
    } else if (!line.startsWith('|')) inTimingTable = false;
    result.push(line);
  }
  assert.equal(originalTimingRows, 164);
  let text = result.join('\n');
  text = text.replace('# 93C-01 공식 판정표', '# 93C-01 판정표 — 94C-01(가)·94C-02 정정\n\n정정 후 잠정 공식 판정입니다. 94C-01(나)의 종단 표는 비마이크로태스크 작업 때문에 성립하지 않았으므로 아직 superseded가 아닙니다. 종단 공식 표가 성립하면 공식 용도에서 대체하며 이 파일은 단계별 진단 자료로 유지합니다. 중단 근거와 원장 관리자용 물음은 verdict-94c01.md에 있습니다.');
  text = text.replace('보정 후 결과로 공식 raw 판정을 바꾸지 않습니다.', '94C-01(가)에 따라 코어는 원값과 보정값 모두 목표 안이어야 하며, 각 기준에 94C-02 회차 동률 예외를 적용합니다. 원 회차가 교차해도 보정 회차가 모두 미달이면 미달입니다.');
  text = text.replace('판정은 보정 전 공식값이며 ★는 보정 폭 안에서 목표 판정이 뒤집히는 행입니다.', '판정은 94C-01(가)의 보정 조건과 94C-02 회차 동률 규칙을 적용한 값입니다. 회차 열은 원/보정 배율이며 ★는 기존 원 중앙값과 보정 중앙값 판정이 달랐던 경계입니다.');
  text = text.replace('| 묶음 | 행 수 | 충족 | 미달 | 보정시 충족 / 미달 |', '| 묶음 | 행 수 | 94 규칙 충족 | 94 규칙 미달 | 보정만·동률 제외 충족 / 미달 |');
  const labels = { 'core-branchless': '코어·분기 없음', 'core-expression': '코어·식만 있음',
    'react-branchless': 'React·분기 없음', 'react-expression': 'React·식만 있음' };
  for (const [key, value] of Object.entries(currentCounts)) {
    const label = labels[key];
    const expression = new RegExp(`^\\| ${label.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')} \\|.*$`, 'm');
    assert(expression.test(text), `Missing group ${label}`);
    text = text.replace(expression, `| ${label} | ${value.rows} | ${value.met} | ${value.missed} | ${value.strictCorrectedMet} / ${value.strictCorrectedMissed} |`);
  }
  let comparison;
  text = text.split('\n').map(line => {
    if (!line.startsWith('|')) { comparison = null; return line; }
    if (line.startsWith('| 분기 수 | 판 | active')) comparison = 'axis';
    else if (line.includes('| 원 몫 배율 |')) comparison = 'share';
    else if (line.includes('| 남은 공식 배율 |')) comparison = 'reason';
    else if (line.includes('| ON 원 배율 |')) comparison = 'ajv';
    else if (!comparison) return line;
    const cells = line.split('|').slice(1, -1).map(cell => cell.trim());
    if (cells[0] === '픽스처' || cells[0] === '층' || cells[0] === '분기 수') {
      if (comparison === 'share') cells[6] = '94 동률 판정';
      cells.push('r1 원 / 보정', 'r2 원 / 보정', 'r3 원 / 보정');
    } else if (cells[0].startsWith('---')) cells.push('---:', '---:', '---:');
    else {
      let row;
      if (comparison === 'axis') row = summary.branchAxisRows.find(row => row.fixture === `oneOf-${cells[0]}` && row.mode === 'update');
      else if (comparison === 'share') {
        row = summary.branchCriteria.find(row => row.lane === 'react' && row.fixture === cells[0] && row.mode === modeFromLabel[cells[1]]).reactShare;
        cells[6] = `${row.tie ? '동률·' : ''}${row.verdict}${row.biasFlip ? ' ★ 편향 경계' : ''}`;
      } else {
        const rows = cells[0] === 'react-phases' ? summary.reactPhaseDiagnostics : summary.officialRows;
        row = rows.find(row => row.lane === cells[0] && row.fixture === cells[1] &&
          row.mode === modeFromLabel[cells[2]] && row.validation === (comparison === 'ajv' ? 'on' : 'off'));
      }
      assert(row, `Unmapped supplemental ratio row: ${line}`);
      cells.push(...row.runRatios.map((ratio, index) => `${fmt(ratio)}× / ${fmt(row.correctedRunRatios[index])}×`));
    }
    return `| ${cells.join(' | ')} |`;
  }).join('\n');
  text += '\n## 94C-01·02 재집계 설명\n\n보정만 적용하면 편집자의 코어·분기 없음 7/24가 맞습니다. sample-0 마운트의 보정 회차는 1.5137×·1.6178×·1.4670×로 1.5× 양쪽에 걸리므로 동률·충족을 더한 최종값은 8/24입니다. 코어·식만 있음은 0/2, React·분기 없음은 22/24, React·식만 있음은 2/2입니다. React·분기 없음의 갱신 미달은 sample-2와 flat-100 두 행입니다. React의 마운트 목표 1.2×에도 같은 교차 규칙을 적용했습니다.\n';
  text += '\n## 모든 진단 행의 회차 배율\n\n아래는 기존 부가 표의 단계값·분기 수 축·검증 ON 행을 포함한 대응 키입니다. 목표가 없는 분기 행에 85C-01 임계값을 새로 부여하지 않았으며 91라운드 기준 판단을 유지합니다.\n\n| 층 | 픽스처 | 검증 | 작업 | r1 원 / 보정 | r2 원 / 보정 | r3 원 / 보정 | 판정 |\n| --- | --- | --- | --- | ---: | ---: | ---: | --- |\n';
  for (const key of ['officialRows', 'updateSplitRows', 'reactPhaseDiagnostics', 'branchAxisRows']) for (const row of summary[key]) {
    text += `| ${row.lane} | ${row.fixture} | ${row.validation} | ${modeLabel(row.mode)} | ${row.runRatios.map((ratio, index) => `${fmt(ratio)}× / ${fmt(row.correctedRunRatios[index])}×`).join(' | ')} | ${row.tie ? '동률·' : ''}${row.verdict} |\n`;
  }
  return text;
}

function blockedMarkdown() {
  const lines = ['# 94C-01(나) 종단 공식 판정 중단', '',
    '**마이크로태스크 전용 전제가 성립하지 않습니다. 새 공식 종단 표와 충족 수를 만들지 않았습니다.** 정정된 93 표는 잠정 공식 용도로 유지하며 아직 superseded로 표시하지 않습니다.', '',
    `HEAD \`${head}\`, Node v26.10.0 / V8 ${report.environment.v8}, ${report.environment.cpu}. ${started}–${ended}에 BF 픽스처 18종을 순차 검사했습니다. 픽스처마다 새 프로세스, 예열 12회·표본 101회, 명시적 GC이며 검증 OFF·외부 subscribe 0입니다. 기존 93 표와 같은 0.16.0 배포 태그 소스를 메모리에서 번들했습니다. 필수 onChange에는 noop을 넘겼으며 별도의 제품 구독자를 붙이지 않았습니다.`, '',
    '## 검사 결과와 작업의 크기', '',
    '모든 72개 픽스처/작업 조합에서 Promise.resolve() 64턴 뒤에도 엔진의 setImmediate 콜백이 남았습니다. 이 경계의 onChange 호출 수는 모두 0이고, macrotask 완료 후에는 호출됐습니다. queueMicrotask로 이벤트·파생 정착을 진행하지만 배치 초기화와 필수 onChange의 normalizedValue 읽기·배달은 다음 macrotask에 있습니다. 이름이 afterMicrotask인 함수도 microtask 함수가 아닙니다.', '',
    '이 Node 환경에서 setTimeout·MessageChannel 예약은 0, requestAnimationFrame은 제공되지 않습니다. scheduleMacrotaskSafe의 실제 CJS가 setImmediate를 선택했습니다. setImmediate는 setTimeout 타이머가 아니라 check 단계 macrotask이며, 요청에서 명시한 비마이크로태스크 대기 중단 조건에 해당합니다.', '',
    '시간은 µs, 표본별 외곽 콜백 시간의 합입니다. 점유율은 각 표본의 콜백 CPU 합을 관측된 동기·microtask·macrotask CPU 합으로 나눈 뒤 중앙값을 구했습니다. 스택 수집·async_hooks·스케줄링 래퍼가 포함된 진단값이므로 무계측 성능 배율이 아닙니다. 대기 시간은 CPU 합과 점유율에서 제외했으며 예약부터 실행까지의 간격을 JSON에 따로 기록했습니다. 마운트 진단의 동기 구간에는 스키마 복사도 들어 있습니다. 다른 측정·검증 작업과 겹쳐 실행하지 않았으며 상주 호스트/MCP 프로세스까지 종료한 환경은 아닙니다.', '',
    '| 픽스처 | 작업 | microtask 배출 뒤 남은 macrotask | setImmediate 실행 | 콜백 CPU median / p99 µs | 관측 CPU 몫 median | 배치 초기화 median µs | onChange 배달 median µs |',
    '| --- | --- | ---: | ---: | ---: | ---: | ---: | ---: |'];
  for (const row of allRows) lines.push(`| ${row.fixture} | ${modeLabel(row.mode)} | ${row.pendingAfterMicrotasks.median} | ${row.primitiveCounts.setImmediate.executed.median} | ${fmt(row.timings.timerCallbackMs.median * 1000)} / ${fmt(row.timings.timerCallbackMs.p99 * 1000)} | ${fmt(row.timerShare.median * 100)}% | ${fmt((row.timerSites['event-batch-reset']?.ms.median ?? 0) * 1000)} | ${fmt((row.timerSites['onChange-delivery']?.ms.median ?? 0) * 1000)} |`);
  lines.push('', '## 코드 근거와 원장 관리자용 물음', '',
    '구 배포 태그의 EventCascadeManager.ts:112–115는 배치 횟수와 idle 상태를 scheduleMacrotaskSafe 콜백에서 초기화합니다. afterMicrotask.ts:26은 onChange 콜백을 같은 primitive로 예약하며, AbstractNode.ts:1145–1148은 검증 OFF에도 이 래퍼 안에서 normalizedValue를 읽고 onChange를 호출합니다. 코드 경로와 SHA-256은 JSON의 codeReasons/releaseSourceSha256에 있습니다.', '',
    `- 배치 초기화: \`@canard/schema-form@0.16.0:${engineSites.batch}:112\``,
    `- 배달 예약: \`@canard/schema-form@0.16.0:${engineSites.delivery}:26\``,
    `- 루트 값 읽기: \`@canard/schema-form@0.16.0:${engineSites.root}:1145\``,
    `- 실제 런타임 선택: \`${schedulerRuntime}:6\` (대응 TS: \`${schedulerPath}\`)`, '',
    `**Q94C-01-TIMER:** ${question}`, '',
    '## 종단 도구 검증과 공식 판정 상태', '',
    '지시된 STOP 분기를 따랐으므로 무계측 종단 도구·빈 호출 보정·새 엔진의 종단≥동기 median 검증·구 엔진의 비동기 몫 포함 검증은 실행하지 않았습니다. Promise 큐 배출은 위 콜백을 누락하고 setImmediate sentinel은 엔진의 macrotask를 포함할 수 있어 타이머 대기 제외라는 조건을 증명하지 못합니다. 스케줄링 검사 도구 자체는 합성 microtask→Promise→timer→microtask 체인을 감지해 SCHEDULER_PROBE_OK를 출력했습니다.', '',
    '새 공식 코어 그룹 수는 **미판정(null)**입니다. React production Profiler 기존 표본은 재사용하며 94C-02 적용 후 branchless 22/24, 식 전용 2/2입니다. Task 1의 잠정 코어는 branchless 8/24·식 전용 0/2입니다. 분기 행은 기존 91라운드 판단을 유지하고, 새로운 종단 비로 통과를 선언하지 않습니다. G26은 미통과입니다.', '',
    '## 재현과 산출물', '', '```sh',
    '/opt/homebrew/opt/node/bin/node --expose-gc packages/canard/schema-form/architecture/verification/07-switch/tools/check-verdict-94c01-scheduling.mjs --self-check',
    '# 아래 명령은 한 픽스처를 자연 종료한 뒤 native apply_patch에 적용할 JSON patches를 출력합니다.',
    '/opt/homebrew/opt/node/bin/node --expose-gc packages/canard/schema-form/architecture/verification/07-switch/tools/check-verdict-94c01-scheduling.mjs sample-0',
    'node packages/canard/schema-form/architecture/verification/07-switch/tools/report-verdict-94c01.mjs --check', '```', '',
    `18개 최종 검사 프로세스·36개 JSON, 72작업×101표본입니다. 측정 파일은 시간 숫자만 포함하고 최대 ${report.verification.maxTimingBytes}바이트입니다. primitive 호출 수·코드 스택·분류별 CPU·환경·해시는 summary JSON에만 있습니다. 전달 형식을 고치기 위해 최종 검사 전에 sample-0을 두 번 더 실행했고 첫 출력은 저장하지 않았으며 두 번째 파일은 최종 검사로 대체했습니다. 최종 측정에는 변경된 같은 도구 해시를 가진 18종만 사용했습니다. 제품 src·git 상태를 쓰지 않았으며 자식 esbuild는 stdin EOF 뒤 code 0으로 종료했습니다.`, '');
  return lines.join('\n');
}

const correctedText = correctedMarkdown();
const blockedText = blockedMarkdown();
const files = { 'verdict-93c01.md': correctedText, 'verdict-93c01-summary.json': JSON.stringify(summary) + '\n',
  'verdict-94c01.md': blockedText, 'verdict-94c01-summary.json': JSON.stringify(report) + '\n' };
for (const text of Object.values(files)) assert(Buffer.byteLength(text) <= 5_000_000);
if (process.argv.includes('--check')) {
  for (const [name, expected] of Object.entries(files)) assert.equal(fs.readFileSync(path.join(output, name), 'utf8'), expected, `Artifact ${name} differs from re-derived output`);
  const sourceChanges = git(['diff', '--name-only', 'HEAD', '--', 'packages/canard/schema-form/src']);
  assert.equal(sourceChanges.trim(), '');
  console.log('RECOUNT_OK ' + JSON.stringify(Object.fromEntries(Object.entries(currentCounts).map(([key, value]) => [key, `${value.met}/${value.rows}`]))));
  console.log('SCHEDULING_REPORT_OK 18 fixtures; 72 rows; no end-to-end verdict');
  console.log('ARTIFACTS_OK timing-only; <=5MB; HEAD and product src unchanged');
} else {
  const patch = '*** Begin Patch\n' + Object.entries(files).map(([name, text]) =>
    `*** Add File: ${path.join(output, name)}\n${text.trimEnd().split('\n').map(line => '+' + line).join('\n')}\n`).join('') + '*** End Patch';
  const chunkSize = 35_000;
  if (process.argv.includes('--manifest')) console.log(JSON.stringify({ chunks: Math.ceil(patch.length / chunkSize),
    bytes: Object.fromEntries(Object.entries(files).map(([name, text]) => [name, Buffer.byteLength(text)])), counts: currentCounts,
    timerRangeMs: report.microtaskCheck.timerCpuRangeMs }));
  else {
    const index = Number(process.argv.find(arg => arg.startsWith('--chunk='))?.slice(8));
    assert(Number.isInteger(index) && index >= 0 && index < Math.ceil(patch.length / chunkSize));
    console.log(JSON.stringify(patch.slice(index * chunkSize, (index + 1) * chunkSize)));
  }
}
