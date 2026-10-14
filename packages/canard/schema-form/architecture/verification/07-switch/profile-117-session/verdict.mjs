// CLI verdict calculation; every row uses its own pooled A/A median as the noise floor.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { directory, HEAD, emit } from './runtime.mjs';

const settings = [
  ...[0, 1, 2, 3].map(size => ['sample-' + size, 'off']),
  ...[50, 100, 500].map(size => ['flat-' + size, 'off']),
  ['nested-d3-f4', 'off'], ['nested-d5-f4', 'off'],
  ...[100, 500, 1000].map(size => ['array-' + size, 'off']),
  ['computed-visible-derived', 'off'],
  ...[5, 10, 20, 40].flatMap(size => [['oneOf-' + size, 'off'], ['oneOf-' + size, 'on']]),
  ['if-then', 'off'], ['if-then', 'on'],
];
const rows = stage => settings.flatMap(([fixture, validation]) =>
  JSON.parse(fs.readFileSync(path.join(directory, 'analysis-' + stage + '-' + fixture + '-' + validation + '.json'), 'utf8')).rows);
const aa = rows('C'), measured = rows('D');
const key = row => [row.fixture, row.validation, row.mode].join('/');
assert.equal(aa.length, 104);
assert.equal(measured.length, 104);
const aaRows = new Map(aa.map(row => [key(row), row]));
const verdictRows = measured.map(row => {
  const control = aaRows.get(key(row));
  assert(control);
  assert.equal(row.versions.head.metric.samples, 909);
  assert.equal(row.versions.working.metric.samples, 909);
  const aaMagnitudeMs = Math.abs(control.paired.median);
  const baseMedianMs = row.versions.head.metric.median;
  const halfPercentMs = Math.abs(baseMedianMs) * .005;
  const regressionFloorMs = Math.max(aaMagnitudeMs, halfPercentMs);
  const regression = row.paired.high < 0 && Math.abs(row.paired.median) > regressionFloorMs;
  const meaningfulGain = row.paired.low > 0 && row.paired.median > aaMagnitudeMs;
  return { fixture: row.fixture, validation: row.validation, mode: row.mode,
    lane: row.mode.startsWith('axis-') ? 'fixed-branch-axis' : 'official-core',
    callCount: row.callCount, baseMedianMs, workingMedianMs: row.versions.working.metric.median,
    paired: row.paired, aaPaired: control.paired, aaMagnitudeMs, halfPercentMs, regressionFloorMs,
    regression, meaningfulGain,
    endpointPassed: Object.values(row.versions).every(version => version.endpointCheck.passed),
    analysis: 'analysis-D-' + row.fixture + '-' + row.validation + '.json',
    aaAnalysis: 'analysis-C-' + row.fixture + '-' + row.validation + '.json' };
});
const endpointFailures = (stage, source) => source.flatMap(row =>
  Object.entries(row.versions).filter(([, version]) => !version.endpointCheck.passed).map(([version, result]) => ({
    stage, fixture: row.fixture, validation: row.validation, mode: row.mode, version,
    differenceMs: result.endpointCheck.difference, noiseMs: result.endpointCheck.noise,
    pooledWithinNoise: result.endpointCheck.withinNoise,
    zeroEngineMacrotasks: result.endpointCheck.zeroEngineMacrotasks,
    failingRuns: result.endpointCheck.runs.filter(run => !run.withinNoise || !run.zeroEngineMacrotasks)
      .map(run => ({ run: run.run, differenceMs: run.difference, noiseMs: run.noise,
        withinNoise: run.withinNoise, zeroEngineMacrotasks: run.zeroEngineMacrotasks })),
  })));
const failures = [...endpointFailures('C', aa), ...endpointFailures('D', measured)];
const slopes = ['axis-update', 'axis-first', 'axis-later'].map(mode => {
  const points = [5, 10, 20, 40].map(branches => {
    const row = verdictRows.find(item => item.fixture === 'oneOf-' + branches && item.validation === 'off' && item.mode === mode);
    assert(row);
    return { branches, headMs: row.baseMedianMs, workingMs: row.workingMedianMs };
  });
  const meanX = points.reduce((sum, point) => sum + point.branches, 0) / points.length;
  const denominator = points.reduce((sum, point) => sum + (point.branches - meanX) ** 2, 0);
  const slope = field => points.reduce((sum, point) => sum + (point.branches - meanX) * point[field], 0) / denominator * 1000;
  const headUsPerBranch = slope('headMs'), workingUsPerBranch = slope('workingMs');
  return { mode, points, method: 'ordinary least squares over pooled medians; x=5,10,20,40',
    headUsPerBranch, workingUsPerBranch,
    reductionPercent: (headUsPerBranch - workingUsPerBranch) / headUsPerBranch * 100,
    reduced: workingUsPerBranch < headUsPerBranch };
});
const regressions = verdictRows.filter(row => row.regression);
const gains = verdictRows.filter(row => row.meaningfulGain);
const branchGains = gains.filter(row => row.lane === 'fixed-branch-axis');
const maximumAa = aa.slice().sort((left, right) => Math.abs(right.paired.median) - Math.abs(left.paired.median))[0];
const performanceCriteria105 = regressions.length === 0 && branchGains.length > 0 && slopes.every(slope => slope.reduced);
const endpointValidated = failures.length === 0;
const adopted = performanceCriteria105 && endpointValidated;
emit('verdict.json', { HEAD, calculated: new Date().toISOString(), runs: 9, samplesPerRun: 101,
  pooledPairedSamples: 909, bootstrapTrials: 1999, bootstrapSeed: 101, confidence: .99,
  differenceSign: 'head-minus-working; positive is faster working',
  regressionRule: 'high99 < 0 AND abs(paired median) > max(abs(same-row A/A median), .005 * abs(HEAD base median))',
  gainRule: 'low99 > 0 AND paired median > abs(same-row A/A median)',
  verdict: adopted ? 'ADOPT' : 'REJECT', performanceCriteria105, endpointValidated,
  formal95Status: endpointValidated ? 'validated' : 'validation-a-failed',
  reason: regressions.length ? '105C-01의 최소 크기를 넘는 회귀가 ' + regressions.length + '행에서 관측되었습니다. 분기 기울기 감소만으로 채택할 수 없습니다.' :
    !endpointValidated ? '95C-01의 독립 종단 검증을 모두 충족하지 못하여 채택 근거가 완성되지 않았습니다.' :
    !performanceCriteria105 ? '분기 축 이득과 기울기 감소 조건을 모두 충족하지 못했습니다.' : '분기 축 이득과 기울기 감소가 확인되었으며 회귀가 없습니다.',
  rowCount: verdictRows.length, rows: verdictRows, regressions: regressions.map(key),
  meaningfulGains: gains.length, meaningfulBranchGains: branchGains.length, slopes,
  aaMaximum: { fixture: maximumAa.fixture, validation: maximumAa.validation, mode: maximumAa.mode,
    magnitudeMs: Math.abs(maximumAa.paired.median), paired: maximumAa.paired },
  endpointFailures: failures,
});
console.log('104개 고유 행의 105C-01 판정과 분기 기울기를 계산했습니다.');

