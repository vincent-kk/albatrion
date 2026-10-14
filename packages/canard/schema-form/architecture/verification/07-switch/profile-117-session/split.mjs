// CLI synthesis of A/B wall shares; Profiler clocks are retained separately from core engine clocks.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { directory, HEAD, median, emit } from './runtime.mjs';
const read = name => JSON.parse(fs.readFileSync(path.join(directory, name), 'utf8'));
const tie = read('tie-B.json');
const arrayNames = ['array-push-100', 'array-push-remove-100', 'array-100'];
const names = [...arrayNames, ...tie.remaining.map(row => row.fixture).filter((name, index, list) => !arrayNames.includes(name) && list.indexOf(name) === index)];
const rows = names.map(fixture => {
  const stage = arrayNames.includes(fixture) ? 'A' : 'B';
  const analysis = read(`analysis-${stage}-${fixture}-off.json`);
  const update = analysis.rows.find(row => row.mode === 'update');
  const first = analysis.rows.find(row => row.mode === 'update-first');
  const later = analysis.rows.find(row => row.mode === 'update-later');
  const versions = {};
  for (const version of ['0.16.0', 'HEAD']) {
    const react = [1, 2, 3].map(run => read(`${stage}-react-plain-${fixture}-r${run}-${version}.json`));
    const wall = median(react.flatMap(record => record.timing['render-update-wall']));
    const core = update.versions[version].metric.median;
    const work = read(`${stage}-react-counts-${fixture}-r1-${version}.json`).work.update;
    const coreRecords = [1, 2, 3].map(run => read(`${stage}-core-${fixture}-off-r${run}.json`));
    assert(coreRecords.every(record => record.interactionCount === update.callCount));
    versions[version] = { wall, core, layer: wall - core, corePercent: core / wall * 100,
      profiler: median(react.flatMap(record => record.timing['profiler-update'])),
      commits: median(react.flatMap(record => record.timing['commits-update'])),
      first: first.versions[version].metric.median, later: later.versions[version].metric.median,
      work: Object.fromEntries(Object.keys(work[0]).map(key => [key, {
        median: median(work.map(row => row[key])), min: Math.min(...work.map(row => row[key])), max: Math.max(...work.map(row => row[key])) }])),
      coreWork: coreRecords[0].counts[version], coreSource: update.versions[version].selected,
      ga: version === 'HEAD' ? update.versions[version].endpointCheck : undefined };
  }
  const old = versions['0.16.0'], current = versions.HEAD;
  const gaps = { wall: current.wall - old.wall, core: current.core - old.core, layer: current.layer - old.layer,
    first: current.first - old.first, later: current.later - old.later };
  const accepted104Rows = ['sample-0', 'sample-1', 'sample-2', 'sample-3', 'nested-d3-f4', 'nested-d5-f4', 'array-100', 'array-500', 'computed-visible-derived'];
  const matches104Row = accepted104Rows.includes(fixture), matches110Row = ['flat-50', 'flat-100'].includes(fixture);
  const cause = matches110Row
    ? '첫 갱신 차이는 110라운드의 동일 두 행에서 수용한 0.07–0.1 ms 규모와 맞습니다. 양의 React 잔여 차이는 별도 7단계 코드 수준 대상입니다.'
    : matches104Row
      ? '이후 갱신 차이는 104라운드의 동일 행에 남은 쓰기당 고정비와 같은 규모입니다. 첫 갱신 차이는 그 기록의 약 0.06 ms보다 크므로 동일 크기로 확대하지 않습니다.'
      : fixture === 'flat-500'
        ? '코어는 구 판보다 빠릅니다. 양의 wall 차이는 코어 수용 원인으로 설명되지 않으며 React 잔여 몫이 증가했습니다.'
        : '104·110라운드에서 수용한 동일 행과 같은 규모가 아닙니다. 기존 수용으로 포함하지 않습니다.';
  return { fixture, stage, interactions: update.callCount, versions, gaps,
    coreDominates: current.core > current.layer, cause, matches104Row, matches110Row,
    positiveLayerGapCodeTarget: gaps.layer > 0, ownerRows: tie.remaining.filter(row => row.fixture === fixture),
    raw: { core: [1, 2, 3].map(run => `${stage}-core-${fixture}-off-r${run}.json`),
      react: ['0.16.0', 'HEAD'].flatMap(version => [1, 2, 3].map(run => `${stage}-react-plain-${fixture}-r${run}-${version}.json`)),
      counts: ['0.16.0', 'HEAD'].map(version => `${stage}-react-counts-${fixture}-r1-${version}.json`) } };
});
emit('split-AB.json', { HEAD, method: 'React wall minus independently measured 95C-01 core; paired empty tails validate endpoints only; residual includes BF drainTicks(2) waits',
  countMethod: 'three separate instrumented samples; actual component/listener/root-compute calls; old engine has no settle pipeline',
  A: rows.filter(row => row.stage === 'A'), B: { tie: 'tie-B.json', remainingWall: 14, remainingProfiler: 8, rows },
  acceptanceWidened: false, profilerScope: 'actualDuration measures React render; core setValue occurs before that clock, so wall shares are shown for the same fixture instead of subtracting a non-overlapping core clock from Profiler',
  addCoreRows: rows.filter(row => row.stage === 'A' && row.coreDominates).map(row => row.fixture) });
console.log('A와 B의 비중·횟수·수용 원인 비교를 기록했습니다.');
