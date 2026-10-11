// Loaded directly after the paired React phase diagnosis; no primary gate is rejudged.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const directory = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const primary = JSON.parse(fs.readFileSync(path.join(directory, 'round-93i-baseline-summary.json'), 'utf8'));
const rows = [], runs = [];
function metric(times) {
  const sorted = times.toSorted((a, b) => a - b);
  assert.equal(sorted.length, 303);
  assert(sorted.every(value => Number.isFinite(value) && value >= 0));
  return { median: sorted[151], p99: sorted[299], sampleCount: 303 };
}
for (const fixture of ['flat-500', 'computed-visible-derived', 'oneOf-20']) {
  const samples = { H: { mount: [], update: [] }, W: { mount: [], update: [] } };
  let observation, previous;
  for (let run = 1; run <= 3; run++) {
    for (const side of run === 2 ? ['W', 'H'] : ['H', 'W']) {
      const stem = `round-93i-react-phases-${fixture}-r${run}-${side}`;
      const timing = JSON.parse(fs.readFileSync(path.join(directory, `${stem}-timings.json`), 'utf8'));
      const summary = JSON.parse(fs.readFileSync(path.join(directory, `${stem}-summary.json`), 'utf8'));
      assert.equal(summary.environment.warmup, 20); assert.equal(summary.environment.samples, 101);
      assert.equal(summary.environment.validation, 'off'); assert.equal(summary.environment.trace, true);
      if (previous) assert(previous.environment.endedAt <= summary.environment.startedAt);
      previous = summary;
      if (observation) assert.equal(summary.observationsSha256, observation);
      observation = summary.observationsSha256;
      assert.equal(observation, primary.runs.react.find(item => item.fixture === fixture).observationsSha256);
      runs.push(summary);
      for (const mode of ['mount', 'update']) samples[side][mode].push(timing[`${mode}Phases`]);
    }
  }
  for (const mode of ['mount', 'update']) {
    const phases = {};
    for (const side of ['H', 'W']) {
      const phaseKeys = new Set(samples[side][mode].flatMap(value => Object.keys(value)));
      phases[side] = Object.fromEntries([...phaseKeys].map(key => [key,
        metric(samples[side][mode].flatMap(value => value[key] ?? Array(101).fill(0)))]));
    }
    assert(phases.W['react-render'] && phases.W['react-commit']);
    rows.push({ fixture, mode, phases });
  }
}
const sessions = [...primary.sessions, ...runs.map(value => ({ lane: 'react-phases',
  start: value.environment.startedAt, end: value.environment.endedAt }))].sort((a, b) => a.start.localeCompare(b.start));
for (let index = 1; index < sessions.length; index++) assert(sessions[index - 1].end <= sessions[index].start);
const report = { methodology: '미달 React 갱신 세 픽스처의 별도 H→W/W→H/H→W 진단. 예열20·101×3·validation off·production profiling·fresh process. 기존 65C-01 renderRootSync/Concurrent와 commitRoot·mutation/layout/passive, core 경계의 배타 시간을 합합니다. 원 Profiler 게이트 수치는 변경하지 않습니다.',
  rows, runs, verifiedSequentialTimingProcesses: sessions.length,
  limitations: 'phase 계측은 비용을 더하고 최적화를 바꿀 수 있습니다. primary actualDuration에서 이 phase 중앙값을 빼거나 더하여 다른 phase를 추정하지 않습니다. renderer의 전체 fiber 재조정을 하나의 react-render phase로 두며 개별 컴포넌트 인과를 주장하지 않습니다.' };
const text = JSON.stringify(report, null, 2) + '\n';
assert(Buffer.byteLength(text) <= 5_000_000);
fs.writeFileSync(path.join(directory, 'round-93i-react-phase-diagnosis-summary.json'), text, { flag: 'wx' });
for (const row of rows) console.log(row.fixture, row.mode, JSON.stringify(Object.fromEntries(
  Object.entries(row.phases.W).filter(([key]) => key !== 'wait').map(([key, value]) => [key, value.median]))));
console.log(`총 ${sessions.length}개 시간 프로세스 겹침 없음; 진단 summary ${Buffer.byteLength(text)} bytes`);
