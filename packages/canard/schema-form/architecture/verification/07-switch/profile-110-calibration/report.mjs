// CLI artifact renderer: reads completed sequential measurements; writes nothing itself.
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const work = path.dirname(fileURLToPath(import.meta.url)), D = path.dirname(work);
const repo = path.resolve(D, '../../../../../..');
const read = file => JSON.parse(fs.readFileSync(path.join(D, file), 'utf8'));
const hash = value => createHash('sha256').update(value).digest('hex');
const key = r => `${r.fixture}/${r.validation}/${r.mode}`;
const head = '61e97d3664b03010339f793d5f44741345894c96';
const historical = read('profile-110-calibration/historical-recomputed.json');
const fresh = read('profile-110-calibration/fresh-summary.json');
const resolve = ref => historical.historicalRows.find(r => r.source === ref.source && key(r) === ref.key);
const git = args => execFileSync('git', ['--no-optional-locks', ...args], { cwd: repo, encoding: 'utf8' });
assert.equal(fs.realpathSync(repo), '/Users/Vincent/Workspace/albatrion/.claude/worktrees/stage-07');
assert.equal(git(['rev-parse', 'HEAD']).trim(), head);
assert.equal(git(['diff', '--name-only', 'HEAD', '--', 'packages/canard/schema-form/src']).trim(), '');
const acceptance = row => row.fixture === 'array-100' && ['update', 'update-first'].includes(row.mode)
  ? '소유자 수용(104라운드)' : row.acceptanceStatus ?? '별도 수용 표시 없음';
const artifacts = fs.readdirSync(work).map(file => {
  const bytes = fs.readFileSync(path.join(work, file));
  assert(bytes.length <= 5_000_000);
  assert(/\.(json|mjs)$/.test(file));
  return { file: `profile-110-calibration/${file}`, bytes: bytes.length, sha256: hash(bytes) };
});
const files = ['tools/endpointDifference95c01.mjs', 'tools/measure-verdict-95c01.mjs',
  'tools/report-verdict-95c01.mjs', 'verdict-95c01.md'];
const toolFiles = files.map(file => ({ file, sha256: hash(fs.readFileSync(path.join(D, file))) }));
const officialRows = historical.latestOfficialRows.map(ref => ({ ...resolve(ref), acceptanceStatus: acceptance(resolve(ref)) }));
assert.equal(officialRows.length, 83);
assert.equal(historical.historicalRows.length, 89);
assert.equal(fresh.rows.length, 3);
const rawInputs = ['profile-108-ratios', 'profile-109-update'].flatMap(folder =>
  fs.readdirSync(path.join(D, folder)).filter(f => /^official-.+-(off|on)-r[123]-(old|new)\.json$/.test(f))
    .map(f => ({ file: `${folder}/${f}`, sha256: hash(fs.readFileSync(path.join(D, folder, f))) })));
assert.equal(rawInputs.length, 150);
const decision = 'e8f9cf393:packages/canard/schema-form/architecture/reviews/round-107-closing.md';
const source = git(['show', decision]);
const originSource = git(['show', 'origin/1.0.0-beta:packages/canard/schema-form/architecture/reviews/round-107-closing.md']);
assert.equal(source, originSource);
const summary = {
  title: '110 — 95C-01 검증 (가)의 끝점 꼬리 통계량 수정', HEAD: head,
  decision: { source: decision, sha256: hash(source), scope: 'Q109 (a)' },
  method: { before: 'median(corrected end) - median(corrected microtask)',
    after: 'median_i[(end_i - k*C) - (microtask_i - k*M)]',
    reason: '서로 다른 표본을 선택하는 주변 중앙값의 비가산 합성을 제거하고 같은 호출의 꼬리를 보존',
    unchanged: 'C/M, 잡음 폭·seeded bootstrap, (나), 배율·94C-02 동률 규칙, FIFO 종단',
    protocol: 'development; fresh process; old→new / new→old / old→new; warmup 20; 101 samples/run; forced GC/schema clone/check anchor outside clock; 64 checkpoints; OFF one FIFO sentinel; zero external subscribers; noop onChange',
    scope: '108 공식 83행(마운트 14·갱신 69) 전부와 109 재측정 6행; 최신 표는 해당 6행을 109 원시 자료로 대체',
    residual: '통계량 수정은 호출 위치별 실제 tail 대기 잔차를 제거하지 않으며 미통과 표본을 재선택하지 않음' },
  historical: { rows: historical.historicalRows, officialRows, calibration108: historical.calibration108,
    calibration109: historical.calibration109, numericDifferenceChangedRows: historical.numericDifferenceChangedRows,
    oldStatisticReproducedAgainstSavedSummaries: historical.oldStatisticReproducedAgainstSavedSummaries,
    unchangedRatioAndOldColumn: historical.unchangedRatioAndOldColumn,
    changedRows: historical.historicalChanges.map(resolve), latestOfficialChangedRows: historical.latestOfficialChanges.map(resolve) },
  remeasurement: fresh,
  audit: { measurementProcesses: 12, concurrency: 1, allWorkerAndEsbuildExitsNatural: true,
    maxWorkerElapsedMs: Math.max(...fresh.records.map(r => r.workerExit.elapsedMs)),
    historicalReporterElapsedMs: historical.elapsedMs, freshReporterElapsedMs: fresh.elapsedMs,
    measurementRepeatsOrDiscardedSamples: 0, reporterTransportRetries: 2,
    transportNote: '최초 historical/fresh stdout 전송이 잘려 요약 중복 필드를 줄이고 reporter만 재실행; 원시 측정은 반복·폐기하지 않음',
    endToEnd: '정식 worker → 101개 원시 endpoint 쌍 → 공통 C/M 보정 → 공유 표본별 차 함수 → pooled/회차별 (가) → (나) 선택·배율·판정 → 보고서',
    regression: 'check.mjs: 수정 전 새 함수 부재로 실패; 수정 후 비가산 예제·보정·길이 불일치 검사 통과',
    productSourceDiff: false, gitWrites: false, installs: false, bundlesAndMapsWritten: false,
    compileCacheDisabled: true,
    scratch: '/private/tmp/claude-501/-Users-Vincent-Workspace-albatrion/c8aaf054-1ea7-43d3-b3c1-a4196f8407e1/scratchpad/bundles',
    maxArtifactBytes: Math.max(...artifacts.map(a => a.bytes)), artifacts, toolFiles, rawInputs }
};

const us = x => (x * 1000).toFixed(3), f = x => x.toFixed(6);
const passed = a => a.withinNoise && a.allRunsWithinNoise ? '통과' : '미통과';
const runs = a => a.runs.map(r => r.withinNoise ? '통과' : '미통과').join('/');

function historicalTable(rows) {
  return ['| 원시 출처 / 행 | 구 (가) 차이 µs | 새 (가) 차이 µs | 잡음 µs | pooled 구→새 | 회차 1·2·3 구→새 | 공식 판정 구→새 | 배율 |',
    '| --- | ---: | ---: | ---: | --- | --- | --- | ---: |',
    ...rows.map(r => `| ${r.source} / ${key(r)} | ${us(r.aBefore.differenceMs)} | ${us(r.aAfter.differenceMs)} | ${us(r.aAfter.noiseMs)} | ${r.aBefore.withinNoise ? '통과' : '미통과'}→${r.aAfter.withinNoise ? '통과' : '미통과'} | ${runs(r.aBefore)}→${runs(r.aAfter)} | ${r.verdictBefore}→${r.verdictAfter} | ${f(r.ratio)}× |`)].join('\n');
}

function markdown() {
  const lines = ['# 110 — 95C-01 보정 검증 (가) 수정', '',
    `HEAD \`${head}\`. 편집자 Q109 (a), \`${decision}\`에 따라 측정 도구와 방법 문단을 수정했습니다.`, '',
    '같은 호출의 표본별 차 `medianᵢ[(endᵢ−kC)−(microᵢ−kM)]`로 (가)를 계산합니다. 기존 `median(end−kC)−median(micro−kM)`의 주변 중앙값 비가산 항을 제거했습니다. k는 BF의 interactionCount, 다른 작업은 1입니다. C/M과 잡음 폭, seeded bootstrap 99% 오차, 구 엔진 (나)의 선택, 공식 배율과 동률 규칙은 유지했습니다. 새 통계량은 pooled 303개와 각 회차 101개에 모두 적용합니다.', '',
    '## 기존 공식 원시 표본 재계산', '',
    '108 공식 83행 전체와 109의 flat-100·array-100 갱신 6행을 다시 계산했습니다. 구 통계량·잡음·회차 결과·배율이 저장된 기존 요약과 1e−12 ms 이내로 일치함을 단언했습니다. 수치 차이는 89/89행에서 달라졌으나 아래의 변경 행은 pooled/회차별 통과 여부 또는 공식 판정이 바뀐 행입니다. (나)의 구 값 선택과 배율은 모든 행에서 같습니다. 전체 회차별 반올림 전 수치는 summary JSON에 있습니다.', '',
    '- 108 flat-100/off/update-first: pooled (가) 미통과→통과, 차이 9.917→3.291 µs / 잡음 8.793 µs. 세 회차는 모두 통과 유지. 공식 보류→미달(1.795699×).',
    '- 108 array-100/off/update 및 update-first: 2회차만 미통과→통과(새 차이 5.416 µs / 잡음 14.083 µs). pooled와 1·3회차는 미통과 유지, 공식 보류 유지. 두 행의 101개 표본은 interactionCount=1로 동일합니다.',
    '- 109의 6행은 pooled/회차별 (가)와 공식 판정의 변경이 없습니다. 최신 공식 83행에서 해당 6행을 109 자료로 대체하면 변경 행은 0개입니다. 이는 108 flat-100 첫 갱신의 통계량 수정 효과를 생략한다는 뜻이 아닙니다.', '',
    '### 최신 공식 83행 — 각 행의 최신 원시 자료', '', historicalTable(officialRows), '',
    '### 대체된 108의 여섯 갱신 행도 포함한 비교', '',
    historicalTable(historical.historicalRows.filter(r => r.source === 'profile-108-ratios' &&
      ['flat-100', 'array-100'].includes(r.fixture) && r.mode !== 'mount')), '',
    '## HEAD 공식 설계 재측정', '',
    `Node ${fresh.records[0].environment.node}, V8 ${fresh.records[0].environment.v8}, ${fresh.records[0].environment.cpu}. ${fresh.started}–${fresh.ended}. development 빌드, fresh process 12개를 순차 실행했습니다. fixture마다 세 회차는 old→new / new→old / old→new, 예열 20·101표본, 판마다 pooled 303개입니다. 강제 GC·schema clone·check anchor는 clock 밖이며, 공식 측정 후에만 scheduler 진단을 설치했습니다. 외부 구독자 0·onChange noop, 엔진 내부 계측 없음, 음수 clipping 없음입니다.`, '',
    `같은 세션 OFF 빈 호출 ${fresh.calibration.emptyCalls}개: C=${us(fresh.calibration.C)} µs, M=${us(fresh.calibration.M)} µs, C−M=${us(fresh.calibration.wait)} µs, empty tail 잔차 p95=${us(fresh.calibration.emptyNoise)} µs. 두 fixture·두 판에 동일 보정을 적용했습니다.`, '',
    '| 행 | 새/구 median ms | 배율 | 회차 1 / 2 / 3 배율 | 수정 (가) 차이/잡음 µs | pooled / 모든 회차 | 공식 판정 / 수용 표시 |',
    '| --- | --- | ---: | --- | --- | --- | --- |'];
  for (const r of fresh.rows) lines.push(`| ${key(r)} | ${f(r.new.metric.median)} / ${f(r.old.metric.median)} | ${f(r.ratio)}× | ${r.runRatios.map(f).join(' / ')} | ${us(r.aAfter.differenceMs)} / ${us(r.aAfter.noiseMs)} | ${r.aAfter.withinNoise ? '통과' : '미통과'} / ${r.aAfter.allRunsWithinNoise ? '통과' : '미통과'} | ${r.verdictAfter} / ${r.acceptanceStatus} |`);
  lines.push('', '| 행 / 회차 | 수정 (가) 차이 µs | 잡음 µs | 판정 |', '| --- | ---: | ---: | --- |');
  for (const r of fresh.rows) for (const run of r.aAfter.runs) lines.push(`| ${key(r)} / ${run.run} | ${us(run.differenceMs)} | ${us(run.noiseMs)} | ${run.withinNoise ? '통과' : '미통과'} |`);
  lines.push('', 'array-100 BF와 첫 갱신은 같은 표본이며, 통계량을 고쳐도 호출 위치에 따른 실제 tail 잔차는 남습니다. (가)가 미통과이므로 수치 배율을 공식 통과·미달로 승격하지 않고 보류합니다. 두 행의 **소유자 수용(104라운드)** 표시는 유지합니다. flat-100 첫 갱신은 비수용 행이며 (가) pooled와 세 회차가 통과했으므로 **1.729821×, 1.5× 미달**입니다. 성능 개선이나 신규 수용 처분은 수행하지 않았습니다.', '',
    '## 도구·실행 검증과 재현', '',
    '공유 함수는 `tools/endpointDifference95c01.mjs`입니다. canonical worker는 보정 전 same-call tail 중앙값을 기록하고 reporter는 보정 후 표본별 차를 사용합니다. HEAD/warmup 인자는 정식 worker의 source override 없이 실행 환경만 지정하며 기존 역사 재현용 기본값을 보존합니다. 회귀 검사는 주변 중앙값 차가 99인데 표본별 차의 중앙값은 1인 예제와 상수 보정·길이 불일치를 검사합니다. 수정 전 새 함수 부재로 실패했고 수정 후 통과했습니다.', '',
    `12개 worker와 각 esbuild 서비스가 code=0·signal=null로 자연 종료했습니다. scheduler의 sentinel pending=0, 이후 추가 예약/실행=0, 새 엔진 예약=0 및 old/new 결과 digest 동일, worker timeline 무겹침과 순서 교대를 단언했습니다. 최대 worker ${summary.audit.maxWorkerElapsedMs} ms, 기존 자료 reporter ${historical.elapsedMs} ms, 새 자료 reporter ${fresh.elapsedMs} ms입니다. 강제 종료·상주 프로세스·병렬 측정·8분 초과 명령은 없습니다. 원시 측정은 반복·폐기하지 않았으며 stdout 전송 잘림 후 reporter만 두 차례 재실행했습니다.`, '',
    `산출물은 이 보고서·summary와 \`profile-110-calibration/\`의 JSON/mjs입니다. 디렉터리 내 최대 파일 ${summary.audit.maxArtifactBytes} bytes로 모두 5 MB 이하입니다. 번들과 map은 write:false로 메모리에만 존재하고 TMPDIR는 요청하신 저장소 밖 bundles입니다. compile cache는 비활성화했습니다. 설치·git 쓰기·제품 src 변경·추가 제품 test/build는 없습니다. 모든 raw 파일과 도구 해시는 summary JSON에 있습니다.`, '',
    '```sh',
    "TMPDIR='/private/tmp/claude-501/-Users-Vincent-Workspace-albatrion/c8aaf054-1ea7-43d3-b3c1-a4196f8407e1/scratchpad/bundles' NODE_DISABLE_COMPILE_CACHE=1 GIT_OPTIONAL_LOCKS=0 yarn exec /opt/homebrew/Cellar/node/26.10.0_2/bin/node packages/canard/schema-form/architecture/verification/07-switch/profile-110-calibration/measure.mjs array-100 off 1 old",
    '```', '',
    'fixture마다 같은 prefix로 r1 old/new, r2 new/old, r3 old/new를 한 worker씩 실행합니다. stdout은 native 파일 도구로 official-<fixture>-off-r<run>-<version>.json에 저장합니다. `stats.mjs --historical`, `stats.mjs --fresh`의 JSON도 같은 방식으로 보존합니다. `report.mjs --summary`와 `--markdown`은 최종 산출물을 출력하고 `report.mjs --check`는 저장된 최종 파일을 검사합니다. `check.mjs`는 통계량 회귀 probe입니다.', '');
  return lines.join('\n');
}

const command = process.argv[2];
if (command === '--summary') console.log(JSON.stringify(summary));
else if (command === '--markdown') console.log(markdown());
else if (command === '--check') {
  assert.deepEqual(read('profile-110-calibration-summary.json'), summary);
  assert.equal(fs.readFileSync(path.join(D, 'profile-110-calibration.md'), 'utf8'), markdown() + '\n');
  assert.equal(git(['rev-parse', 'HEAD']).trim(), head);
  console.log('PROFILE_110_ARTIFACTS_OK: 83 latest rows, 89 historical comparisons, 3 remeasured rows, 12 natural workers');
} else assert.fail('Use --summary, --markdown or --check');
