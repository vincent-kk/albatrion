// CLI artifact derivation. Writes reports only to the approved scratch directory for native publication.
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url)), D = path.dirname(here);
const pkg = path.resolve(D, '../../..'), repo = path.resolve(pkg, '../../..');
const scratch = '/private/tmp/claude-501/-Users-Vincent-Workspace-albatrion/c8aaf054-1ea7-43d3-b3c1-a4196f8407e1/scratchpad/bundles/profile-112-branch';
assert.equal(fs.realpathSync(repo), '/Users/Vincent/Workspace/albatrion/.claude/worktrees/stage-07');
const read = file => JSON.parse(fs.readFileSync(file, 'utf8'));
const hash = data => createHash('sha256').update(data).digest('hex');
const s = read(path.join(scratch, 'analysis.json'));
const interpretation = read(path.join(here, 'interpretation.json'));
const rowCheck = read(path.join(here, 'report-row-check.json'));
assert.equal(execFileSync('git', ['--no-optional-locks', 'rev-parse', 'HEAD'], { cwd: repo, encoding: 'utf8' }).trim(), s.head);
assert.equal(execFileSync('git', ['--no-optional-locks', 'diff', '--name-only', '--', 'packages/canard/schema-form/src'],
  { cwd: repo, encoding: 'utf8' }).trim(), '');
assert.equal(rowCheck.result, 'CANONICAL_ROW_END_TO_END_OK');
assert.equal(s.part1.numericalChanges.length, 103);
assert.equal(s.part1.verdictChanges.length, 2);

const arrays = read(path.join(here, 'array-manifest.json'));
const measured = [], sourceIndex = new Map();
for (const r of arrays.records) {
  assert.equal(r.workerExit.code, 0); assert.equal(r.workerExit.signal, null); assert.equal(r.workerExit.natural, true);
  assert(r.workerExit.elapsedMs < 480_000);
  assert.equal(r.toolSha256, hash(fs.readFileSync(path.join(D, 'tools/measure-verdict-95c01.mjs'))));
  assert.equal(r.environment.head, s.head); assert.equal(r.warmup, 20); assert.equal(r.sampleCount, 101);
  assert.equal(r.officialEngineInstrumentation, false); assert.equal(r.bundleEvidence[0].phaseHooks, 0);
  assert(r.serviceExits.every(e => e.code === 0 && e.signal === null));
  measured.push({ file: r.timingFile, started: r.environment.started, ended: r.environment.ended,
    elapsedMs: r.workerExit.elapsedMs, exit: r.workerExit, mode: 'array' });
}
for (const file of fs.readdirSync(here).filter(f => /^(cpu|counts)-oneOf-/.test(f))) {
  const raw = read(path.join(here, file));
  assert.equal(raw.head, s.head); assert.equal(raw.warmup, 20); assert.equal(raw.sampleCount, 101);
  assert.equal(raw.engineClocks, 0); assert(raw.elapsedMs < 480_000);
  assert(raw.serviceExits.every(e => e.code === 0 && e.signal === null));
  assert(raw.bundlePath.startsWith(scratch + '/'));
  const bundle = fs.readFileSync(raw.bundlePath);
  assert.equal(hash(bundle), raw.bundleSha256);
  if (raw.mode === 'cpu') {
    assert.equal(raw.officialEngineInstrumentation, false); assert.equal(raw.cpuSamplingIntervalUs, 50);
    assert(!/__112enter|__112hit|__phaseEnter|__phaseExit/.test(bundle.toString()));
    assert(Object.values(raw.records).every(r => r.transitions === 101));
  }
  for (const source of raw.sources) {
    const previous = sourceIndex.get(source.path);
    assert(previous === undefined || previous === source.sha256);
    sourceIndex.set(source.path, source.sha256);
  }
  measured.push({ file: 'profile-112-branch/' + file, started: raw.started, ended: raw.ended,
    elapsedMs: raw.elapsedMs, exit: { code: 0, signal: null, natural: true,
      evidence: 'exec_command의 종료 0 응답과 worker 마지막 active resources 단언' }, mode: raw.mode });
}
for (const [file, digest] of sourceIndex) assert.equal(hash(fs.readFileSync(path.join(pkg, file))), digest);
measured.sort((a, b) => Date.parse(a.started) - Date.parse(b.started));
for (let index = 1; index < measured.length; index++) assert(Date.parse(measured[index].started) > Date.parse(measured[index - 1].ended));
assert.equal(measured.length, 58);

const ref = s.part2.visitCounts.find(v => v.size === 40);
const positive = Object.entries(ref.bySite).filter(([, v]) => ['first', 'second', 'later'].some(m => Object.values(v[m]).some(n => n)));
interpretation.bySite = positive.map(([site, counts]) => {
  const groups = interpretation.groups.filter(g => new RegExp(g.match).test(site));
  assert.equal(groups.length, 1, site);
  return { site, group: groups[0].id,
    beforeTarget: Object.fromEntries(['first', 'second', 'later', 'bf'].map(m => [m, counts[m][1]])),
    afterTarget: Object.fromEntries(['first', 'second', 'later', 'bf'].map(m => [m, counts[m][5]])) };
});
for (const v of s.part2.visitCounts) {
  assert.deepEqual(v.steadyPatternGroups.map(g => [g.kind, g.transitions.length]).toSorted(), [['kind_0', 50], ['kind_4', 51]]);
  for (const [site, entry] of Object.entries(v.bySite)) for (const m of ['first', 'second', 'later', 'bf']) {
    assert(v.untouched.every(b => entry[m][b] === ref.bySite[site][m][b < 4 ? 1 : 5]), `${v.size} ${site} ${m}`);
  }
}
s.part2.visitAssessment = interpretation;
s.part1.canonicalRowEndToEndResult = rowCheck;
s.method.counts = '함수 진입·후보 loop 횟수를 구분; branch schemaPath/payload 문맥을 상속하며 root getter는 해당 분기 문맥의 공유 host 비용으로 표시';
s.method.steadyDirections = '계수와 CPU 모두 추가 예열 20 뒤 kind_0→kind_4 51회, kind_4→kind_0 50회';
s.method.negativeTimeDeltas = '원 V8 timeDeltas의 음수 −1µs 3건은 원자료에 보존; 겹친 구간을 단조 high-water mark로 한 번만 귀속';

const maxFile = fs.readdirSync(here).map(file => ({ file, bytes: fs.statSync(path.join(here, file)).size }))
  .toSorted((a, b) => b.bytes - a.bytes)[0];
assert(maxFile.bytes <= 5_000_000);
const audit = { head: s.head, node: arrays.records[0].environment.node, v8: arrays.records[0].environment.v8,
  cpu: arrays.records[0].environment.cpu, measuredProcesses: measured.length, sequential: true,
  sourceFilesHashVerified: sourceIndex.size, productSourceDiff: [], maxWorkerMs: Math.max(...measured.map(r => r.elapsedMs)),
  allNaturalExits: true, maxEvidenceFileBeforePublication: maxFile, measured, excluded: s.excluded,
  reconstructionProof: s.part1.reconstructionProof,
  constraint: '58개는 최종 채택 원자료의 worker 수입니다. 계수의 중간 성공 실행과 초기 실패 및 겹친 후처리 계산은 포함하지 않습니다.' };
s.audit = { ...audit, measured: undefined, file: 'profile-112-branch/audit.json' };
s.artifacts = fs.readdirSync(here).filter(f => f.endsWith('.json')).map(file => {
  const data = fs.readFileSync(path.join(here, file));
  assert(data.length <= 5_000_000);
  return { file: 'profile-112-branch/' + file, bytes: data.length, sha256: hash(data) };
});

const num = (value, places = 3) => Number(value).toFixed(places);
const modeName = { mount: '마운트', update: 'BF 갱신', 'update-first': '첫 갱신', 'update-later': '이후 갱신',
  'axis-update': '고정 축 BF', 'axis-first': '고정 축 첫', 'axis-later': '고정 축 이후' };
const table = (headers, rows) => ['| ' + headers.join(' | ') + ' |', '| ' + headers.map(() => '---').join(' | ') + ' |',
  ...rows.map(row => '| ' + row.join(' | ') + ' |')].join('\n');
const average = values => values.reduce((a, b) => a + b, 0) / values.length;
const inline = value => '`' + value + '`';
const sourceLink = (file, line, label = file) => `[${label}](../../../${file}) ` + inline(':' + line);
const pieces = [], put = text => pieces.push(text);
put('# 112라운드 — sentinel 정정과 고정 분기 전환 귀속');
put('2026-10-07. HEAD ' + inline(s.head) + `, ${audit.node}, V8 ${audit.v8}, ${audit.cpu}. 범위는 109C-01의 측정기 정정과 귀속입니다. 편집자 결정은 ` + inline('git show origin/1.0.0-beta:packages/canard/schema-form/architecture/reviews/round-109-closing.md') + '로 읽었습니다. 현재 HEAD에는 그 파일이 없으므로 읽은 ref를 명시합니다. 제품 구현은 바꾸지 않았습니다. 설치·git 쓰기는 하지 않았으며 보고서와 측정 도구만 이 worktree 안에서 다뤘습니다.');
put('sentinel을 (가)에서 제외하면 111 원자료의 104개 고유 행이 pooled와 세 회차에서 모두 통과합니다. 수치가 바뀌는 행은 103개이며, 통과 여부가 바뀌는 행은 array-100 OFF BF·첫 갱신 둘입니다. 배열 100/500/1000을 같은 공식 설계로 다시 실행한 12행도 모두 통과합니다. 원래 성능 배율·소유자 수용은 그대로이며 분기 91 기준 ①의 미달은 해소된 것이 아닙니다.');
put('무관 분기의 방문에는 계약이 요구하는 식 평가와 반복 장부가 섞여 있습니다. 첫 전환의 실제 식 평가 16회/분기, 복귀와 이후의 8회/분기는 현행 계수 계약 그대로입니다. 추가 분기에서는 BF 경로 해석 33회·자식 후보 18회·투영 읽기 24회, 이후 11회·6회·8회가 반복됩니다. 실제 꺼진 payload 노드의 계산·생성·배달·검증은 0회입니다.');
put('## 1. 110라운드 측정기 sentinel 정정');
put('공식 측정기는 64 Promise 체크포인트 뒤 microtask 시계를 읽고 FIFO setImmediate sentinel을 기다립니다. 측정기 자신의 대기를 (가)의 엔진 작업으로 읽지 않도록 같은 microtask clock을 세 번째 열 `preSentinelCalibrationMs`로 보존했습니다. 엔진 예약·실행·sentinel 뒤 후속 작업이 0회라는 별도 경계 검증이 성립할 때에만 이 끝점을 사용합니다. (가)는 독립된 두 clock의 등가 검사가 아니라 이 독립 진단을 전제로 측정기 전용 꼬리를 제외한 검사입니다. 엔진 macrotask가 있는 행에는 이 복원이 성립하지 않으며 재측정이 필요합니다.');
put('`medianᵢ[(sentinelᵢ−kC)−(microᵢ−kM)]`에서 `[(sentinelᵢ−preSentinelᵢ)−k(C−M)]`를 표본별로 정확히 제외하므로 남는 값은 `medianᵢ[(preSentinelᵢ−kM)−(microᵢ−kM)]`입니다. 두 열의 시점이 같아 0µs가 되는 것은 이 방법의 정의입니다. 0이라는 숫자 자체로 별도의 엔진 무작업 증거를 만들지 않았습니다. 원래 두 열·공식 median/p99·배율의 C/M·보수적 잡음과 seeded bootstrap·(나)·동률·OFF 1-pass/ON 2-pass FIFO는 유지했습니다.');
put('변경은 [측정기](tools/measure-verdict-95c01.mjs)의 calibrationEnd 및 원시 열, [reporter](tools/report-verdict-95c01.mjs)의 (가) 끝점뿐입니다. 방법 문단은 [공식 검증 설명](verdict-95c01.md#검증-가나) 옆에 있습니다. reporter가 만드는 문서에도 정정 문단이 유지됩니다.');
put('### 배열 fresh 재검증');
put(`array-100/500/1000 OFF를 각 fresh 세 회차 old→new / new→old / old→new, 예열 20·101표본·명시 GC·check anchor·외부 구독 0·onChange noop로 실행했습니다. 새 엔진/공식 표본에 계측은 없습니다. scheduler wrapper는 공식 표본 뒤에만 설치했습니다. old/new의 결과 digest가 같고 새 엔진 예약 및 후속 작업은 0회입니다. 빈 제어 표본 ${s.part1.arrayCalibration.samples}개, C=${num(s.part1.arrayCalibration.C * 1000)}µs, M=${num(s.part1.arrayCalibration.M * 1000)}µs, C−M=${num(s.part1.arrayCalibration.wait * 1000)}µs입니다.`);
put(table(['배열', '작업', '112 (가) 차이 / 잡음 µs', 'pooled·r1/r2/r3', '111 배율·성능 판정', '수용'], s.part1.arrayRows.map(r =>
  [r.fixture, modeName[r.mode], `${num(r.differenceUs)} / ${num(r.noiseUs)}`, '통과 · 통/통/통',
    `${num(r.originalRatio)}× · ${r.priorVerdict}`, r.acceptance ?? '—'])));
put('111 표의 array-100 BF·첫 갱신의 `보류((가) 미통과)`를 **미달**로 바꿨습니다. 3.080×라는 성능 비율이 1.5×를 넘으므로 미달이며 **소유자 수용(104라운드)**은 유지합니다. array-500 BF·첫 1.323×와 array-1000 BF·첫 0.809×는 충족입니다. 이후 갱신은 각각 4.107× 미달·수용, 1.237× 충족·수용, 0.726× 충족입니다. 112의 fresh 잡음과 111의 당시 잡음은 다른 표본이므로 분리해 적었습니다.');
put('종단간 확인 행은 array-100/off/update입니다. 수정한 canonical 측정기의 여섯 worker 원자료를 canonical reporter의 실제 validation loop에 넣어 `CANONICAL_ROW_END_TO_END_OK`를 얻었습니다. (가) pooled·세 회차 통과, 공식 새 값의 source=sentinel, old/new digest 일치, 모든 worker/esbuild 종료 0을 확인했습니다. 138개 전체 세션 전제는 한 행 확인에서 제외했으며 계산식을 별도로 베끼지 않았습니다. sentinel을 의도적으로 지연하는 [회귀 확인](profile-112-branch/check-sentinel.mjs)은 정정 전 세 번째 열 부재로 실패하고 정정 뒤 `SENTINEL_PLACEMENT_OK`입니다.');
put('### 111 원자료 전체 재계산과 변경 행');
put('104개 고유 측정 행 × 3회차 모두 새 엔진 scheduled, pendingAtSentinel, tailScheduled/tailExecuted가 0회임을 먼저 단언했습니다. 그래서 세 번째 열이 없는 111 raw에도 microtask clock에서 같은 pre-sentinel 끝점을 정확히 복원할 수 있습니다. **재측정이 필요한 111 행은 없습니다.** 108개 표시 행 중 네 개는 일반 표와 고정 축 표가 공유하는 마운트입니다. raw JSON은 고치지 않았고 [111 최종 표](profile-111-final.md)의 (가) 열만 이 복원 결과로 정정했습니다.');
put('0회 근거는 p99 요약만이 아닙니다. 101개 진단의 p99는 최대값이 아니어서 요약 수치만으로 이상치 한 건을 배제할 수 없습니다. 그러나 원 도구의 observeBoundary는 각 진단 호출에서 scheduled=0, pendingAtSentinel=0, tailScheduled+tailExecuted=0을 직접 단언한 뒤에만 기록을 저장합니다. 111의 모든 worker 도구 SHA가 ' + inline(s.part1.reconstructionProof.historicalToolSha256) + '인 원본과 같고 모든 worker가 자연 종료 0임을 대조했습니다. fresh 배열도 같은 per-observation 단언을 유지한 현재 도구의 SHA와 종료 0을 대조했습니다. 공식 표본에는 wrapper를 넣지 않으며 동일 fixture의 뒤 진단이 전제임은 그대로입니다. 원 111 HEAD와 현재 HEAD 사이 제품 src diff도 없습니다.');
put('다음은 모든 104행입니다. 103행의 pooled 수치가 바뀌었고 배열 이외에서는 91행이 바뀌었습니다. `sample-3/off/update-later`는 원래부터 0µs여서 수치가 바뀌지 않습니다. 통과 판정은 array-100 BF·첫 둘만 바뀌며 다른 102행은 통과를 유지합니다. 회차별 전후 차이·기존 잡음·통과 결과는 summary의 `part1.recalculatedRows`에 있습니다.');
put(table(['픽스처', '검증', '작업', '111 (가) µs → 정정', '111 잡음 µs', '결과 변경'], s.part1.recalculatedRows.map(r =>
  [r.fixture, r.validation, modeName[r.mode], `${num(r.beforeDifferenceUs)} → ${num(r.afterDifferenceUs)}`,
    num(r.noiseUs), !r.beforePass ? '보류 → 통과' : Math.abs(r.beforeDifferenceUs) < 1e-9 ? '0 유지·통과 유지' : '수치 변경·통과 유지'])));
put('## 2. 계수 — 각 무관 분기의 방문');
put('방문 계수에는 TypeScript AST로 함수 진입과 loop/callback 및 실제 `expression.evaluate` 호출 자리에 정수 카운터만 넣었습니다. clock/span은 없습니다. 변환 복사본 498파일과 bundle/map은 지정한 저장소 밖 scratch에만 있습니다. 분기는 `/oneOf/i` schemaPath 또는 `payload_i_*`에서 얻으며 중첩 호출은 그 문맥을 상속합니다. 따라서 root getter나 공통 `/kind` 읽기가 특정 분기를 평가하는 동안 발생하면 그 분기의 문맥 비용으로 셉니다. 공유 root 함수의 진입을 모든 분기에 나눠 곱하지 않으며 내부 후보 loop 방문을 따로 셉니다.');
put('B=5/10/20/40에서 건드리는 분기는 0과 4, 무관 분기는 3/8/18/38개입니다. 표의 P는 target=4 앞인 분기 1·2·3, Q는 4 뒤의 분기 5..B−1입니다(B=5에는 Q가 없습니다). 모든 크기의 같은 위치 그룹에서 수치가 같음을 단언했습니다. 각 칸은 **첫 kind_0→kind_4 / 복귀 kind_4→kind_0 / 이후 kind_0→kind_4**의 횟수입니다. Q의 BF=첫+복귀는 크기를 키울 때 추가되는 분기의 방문 수이며 선형 기울기와 연결할 수 있습니다.');
put('계수도 추가 예열 20 뒤 101회 연속 전환을 확인했고 CPU 파동과 같이 51회 정방향·50회 역방향의 두 동일 패턴으로 압축됩니다. 전체 branch별 카운터와 전환 번호는 summary의 `part2.visitCounts`, 원본은 `counts-oneOf-*.json`에 있습니다.');
const triple = v => ['first', 'second', 'later'].map(m => v[m]).join('/');
put(table(['방문 자리', 'P 첫/복귀/이후', 'Q 첫/복귀/이후', 'Q BF/이후', '판별 그룹'], interpretation.bySite.map(r =>
  [`\`${r.site}\``, triple(r.beforeTarget), triple(r.afterTarget), `${r.afterTarget.bf}/${r.afterTarget.later}`, r.group])));
put('`registerRecalculation:20/27/44`의 6/3/3은 함수 호출 수가 아닌 내부 선언/경로 후보 방문입니다. `getGateRegistry.register`의 16/8/8은 이미 등록된 root의 fast return이고 무관 분기에 새 watchPaths/resolveGateOccurrence 등록은 0회입니다. `getLatentOrder`는 target 앞 세 분기에서만 복귀 시 9회씩 확인하므로 B를 늘릴 때의 기울기에 넣지 않습니다. 경로 해석의 Q 22/11/11과 P 16/11/8 차이는 게이트 거절 이전의 후보 읽기 공표 처리입니다.');
put('무관 분기에 `SchemaNodeRecord` 생성, `computeNode`의 실제 꺼진 자식 진입, `writeSchemaNode`, 배달과 validation, `resolveRelativeTokens`, `watchPaths`, `resolveGateOccurrence`, `readsChanged`는 각각 0회입니다. `find(/kind)`와 root의 표시·커밋·배달 및 0/4 교체 작업은 고정 폭에서 실행됩니다. CPU 배달 그룹에 작은 기울기가 보이더라도 이를 꺼진 분기를 배달한 횟수로 해석하지 않습니다.');
put('## 3. 계측 없는 CPU profile과 선형 분해');
put('크기당 fresh process 9개, 총 36개에서 변환하지 않은 제품 소스를 bundle했습니다. 엔진 clock·카운터·span 및 no-inline 강제 옵션은 없습니다. Node inspector의 표본 간격은 50µs입니다. 각 프로세스의 예열은 20개의 root에서 고정 전환 세 번이며, 그 뒤 101개 root를 마운트해 clock 밖에 둡니다. 첫 전환 101개를 연속으로, 같은 root들의 복귀 101개를 연속으로 프로파일합니다. 이후에는 root 하나에서 20전환을 더 예열한 뒤 101전환을 연속 왕복합니다. GC·결과 검사·bundle·마운트는 각 파동 밖입니다. 모든 파동에서 kind와 세 활성 payload의 결과를 확인했습니다.');
put('이것은 111의 각 표본 사이 GC/await/FIFO가 있는 공식 종단 측정과 조건이 다른, 정상 상태의 연속 CPU 관측입니다. 첫/복귀와 이후 세 파동은 같은 크기의 한 fresh 프로세스에서 순서대로 실행됩니다. BF는 **같은 실행의 첫+복귀 산술합**, 평균은 9개 실행의 산술평균이며 주변 중앙값의 합이 아닙니다.');
put(table(['B / 무관 분기', '111 BF / 첫 / 이후 µs', 'CPU 첫 / 복귀 µs', 'CPU BF / 이후 µs'], [5, 10, 20, 40].map(size => {
  const r = s.part2.cpuRecords.filter(r => r.size === size), mean = m => average(r.map(r => r.modes[m].totalUs));
  return [`${size} / ${size - 2}`, ['bf', 'first', 'later'].map(m => num(s.part2.referenceTimes[size][m])).join(' / '),
    `${num(mean('first'))} / ${num(mean('second'))}`, `${num(mean('first') + mean('second'))} / ${num(mean('later'))}`];
})));
put('회귀는 x=무관 분기 수 3/8/18/38, y=파동 µs/전환의 OLS입니다. 36개 fresh 실행을 동일 가중치로 넣습니다. 각 함수의 self와 self+children 및 배타적 그룹별 기울기·절편·R²·크기별 평균을 보존했습니다.');
put(table(['시간 축', 'CPU 기울기 µs/분기', 'CPU 절편 µs', 'R²', '111 원 중앙값 기울기'], ['first', 'second', 'bf', 'later'].map(m => {
  const f = s.part2.cpuFits[m].total;
  return [{ first: '첫', second: '복귀', bf: 'BF=첫+복귀', later: '이후' }[m], num(f.slopeUsPerBranch, 6),
    num(f.interceptUs), num(f.r2, 6), s.part2.officialFits[m] ? num(s.part2.officialFits[m].slopeUsPerBranch, 6) : '별도 원행 없음'];
})));
put('**직접 측정한 합은 BF 30.764278, 이후 9.060841µs/분기**이며 원 111의 33.484219/10.961318과 동일하지 않습니다. 두 조건 차이를 임의의 특정 함수 비용으로 단정하지 않았습니다. 원 수치의 구성도 요구되어 각 크기·실행의 CPU 배타 비중에 그 크기의 111 중앙값을 곱하고 다시 OLS한 열을 별도로 적었습니다: `추정_f(B)=CPU_self_f(B)/CPU_total(B) × 111_total(B)`. 이 **111 비중 환산 추정**은 원 세션 내부 함수를 직접 잰 값이 아니며 같은 CPU 비중이 유지된다는 가정을 둡니다. 그 합이 33.484219/10.961318이 되는 것은 분할의 대수적 성질이며 독립 검증 결과가 아닙니다.');
put('### 함수별 self와 children');
put('아래는 BF self 기울기 상위 12개입니다. S는 self, I는 self+children입니다. I에는 호출한 다른 함수가 들어 있으므로 I를 더하면 중복됩니다. 모든 262개 함수/V8 frame/경계 잔차의 크기별 S/I 시간과 첫·복귀·BF·이후 회귀는 [전체 함수 CSV](profile-112-branch/cpu-functions.csv)와 summary의 `part2.cpuFits.*.functions`에 있습니다. 0회/0표본인 함수는 시간 0으로 남기며 0표본이 무호출의 증거는 아닙니다.');
const laterFunctions = new Map(s.part2.cpuFits.later.functions.map(f => [f.function, f]));
const functions = s.part2.cpuFits.bf.functions.toSorted((a, b) => b.self.slopeUsPerBranch - a.self.slopeUsPerBranch).slice(0, 12);
put(table(['함수', 'BF S/I 기울기', '이후 S/I 기울기', '111 S 비중 환산 BF/이후', '추가 분기 방문 BF/이후'], functions.map(f => {
  const later = laterFunctions.get(f.function), name = f.function.split(':').at(-1);
  const visits = { resolveDependencyPath: '33/11', selectChildren: '후보 18/6; 공유 진입 별도', readProjectedValue: '24/8',
    computeNode: '공유 진입; 선언 후보 9/3', hasOwnProperty: '78/26', evaluateGate: '24/8', flushRead: '9/3',
    registerRecalculation: '후보 9/3; 공유 진입 별도', getGateExpression: '33/11', assembleObject: '후보 39/12', locate: '24/8' };
  return [`\`${f.function}\``, `${num(f.self.slopeUsPerBranch)}/${num(f.selfAndChildren.slopeUsPerBranch)}`,
    `${num(later.self.slopeUsPerBranch)}/${num(later.selfAndChildren.slopeUsPerBranch)}`,
    `${num(f.official111SelfShareEstimate.slopeUsPerBranch)}/${num(later.official111SelfShareEstimate.slopeUsPerBranch)}`,
    visits[name] ?? 'V8 frame; 분기 호출 아님'];
})));
put('경로 해석의 self 4.919/1.451, 자식 선택의 self 4.772/1.621, 투영 읽기의 self 3.339/1.039µs/분기가 큰 항목입니다. evaluateGate I에는 경로·투영·registry 등이 이미 들어 있습니다. 이를 순수 Boolean 비교식의 비용으로 읽지 않습니다. 조각과 후보는 고정 깊이·필드 세 개인 한 무관 분기에서 각각 상수 횟수의 일을 하지만 그것이 모든 무관 분기에 반복되어 전체는 O(B)입니다.');
put('### 중복 없이 합산되는 이름 있는 비용 그룹');
put('각 CPU 표본은 leaf에서 거슬러 올라가 가장 가까운 이름 있는 함수 그룹 하나에만 배정합니다. 예를 들어 evaluateGate 아래의 경로 해석은 경로 그룹이고 식 드라이버 그룹에 다시 더하지 않습니다. @winglet primitive·anonymous helper는 가장 가까운 소유 함수의 그룹에 포함되며 주인이 없으면 V8/기타 잔차로 보존합니다. GC, harness, 미포착 경계도 숨기지 않았습니다.');
const groupOrder = s.part2.cpuFits.bf.partition.toSorted((a, b) => b.raw.slopeUsPerBranch - a.raw.slopeUsPerBranch);
put(table(['배타 소유 함수 그룹', 'CPU BF', 'CPU 이후', '111 BF 비중 환산 추정', '111 이후 비중 환산 추정'], groupOrder.map(g => {
  const l = s.part2.cpuFits.later.partition.find(p => p.group === g.group);
  return [g.group, num(g.raw.slopeUsPerBranch, 6), num(l.raw.slopeUsPerBranch, 6),
    num(g.official111ShareEstimate.slopeUsPerBranch, 6), num(l.official111ShareEstimate.slopeUsPerBranch, 6)];
}).concat([['합계', num(s.part2.cpuFits.bf.total.slopeUsPerBranch, 6), num(s.part2.cpuFits.later.total.slopeUsPerBranch, 6),
  num(s.part2.officialFits.bf.slopeUsPerBranch, 6), num(s.part2.officialFits.later.slopeUsPerBranch, 6)]])));
put('합계는 표본 단위 self 합과 파동 시간, 모든 함수의 self 기울기 합과 total 기울기, 모든 배타 그룹 기울기 합과 total 기울기를 각각 1e−8µs/분기 이내에서 단언했습니다. 음의 작은 회귀 기울기는 잡음·상수항의 회귀 결과로 그대로 보존하며 음의 실제 실행시간이나 최적화 효과라고 해석하지 않습니다. V8 timeDeltas에 −1µs가 세 건(oneOf-10 r2 첫, oneOf-10 r7 복귀, oneOf-40 r3 복귀) 있어 원자료를 보존하고 단조 high-water mark로 각 겹치는 1µs를 한 번만 귀속했습니다. 파동 경계 밖 Profiler.start/stop은 제외했습니다.');
put('## 4. 각 방문의 필요성과 고침 범위');
put('필요한 것은 결과·평가 순서/계수·실제 최신 입력·예외/공표 위치·키/선언/배달 순서·참조입니다. 아래의 “상수 작업”은 같은 무관 분기에서 같은 사실을 반복 확인하는 이 픽스처의 비평가 장부입니다. 생략의 동등성 증명이 필요하며, 모든 입력에서 제거해도 된다는 결론을 내리지 않습니다. 구현 방법이나 수정안은 제안하지 않습니다.');
put(table(['그룹', '방문 판별', '결과에 필요한가 / 상수 작업인가', '고침 범위', '계약'], interpretation.groups.map(g =>
  [g.id + ' ' + g.name, g.needed, g.assessment, g.scope, g.contracts.join('·')])));
put(interpretation.zeroVisits.assessment + ' 근거는 ' + interpretation.zeroVisits.contracts.join('·') + '입니다. ' + interpretation.zeroVisits.scope + '입니다. OFF validation은 requestSchemaNodeValidation의 mode 조건에서 예약 전에 돌아갑니다. 동기 gate와 예약 validation을 같은 비용으로 묶지 않았습니다.');
put('### 인용 계약 문장');
for (const [id, c] of Object.entries(interpretation.contractBasis)) put(`- **${id}** ${sourceLink(c.file, c.line)}: “${c.sentence}”`);
put(interpretation.decisionBoundary);
put('## 5. 원자료·재현·범위 검증');
put(`채택된 원자료는 배열 18 worker, CPU 36 worker, 최종 계수 4 worker로 총 58개입니다. 모두 종료 0·signal null이며 최대 worker ${num(audit.maxWorkerMs)}ms, 시작·종료 시각을 정렬한 겹침 검사는 통과했습니다. CPU/계수에서 읽은 제품 소스 ${audit.sourceFilesHashVerified}개의 SHA-256을 현재 HEAD 소스와 대조했고 src diff는 0입니다. [감사 기록](profile-112-branch/audit.json)에 실행별 시각·종료와 파일 제한 근거를 보존합니다. 모든 원시 및 도구 파일은 5,000,000바이트 이하입니다. bundle/map/변환 소스/cache는 저장소 안에 만들지 않았습니다.`);
put('계수 최초 빌드는 빈 함수의 AST 삽입 충돌로 실패하여 버렸고 정정 뒤 다시 실행했습니다. 실제 식 호출 hook을 추가한 최종 계수 및 CPU와 왕복 방향을 맞춘 최종 계수만 채택했습니다. 후처리에서 report-row 확인 종료 응답을 받기 전에 analyze를 시작해 두 계산이 잠깐 겹친 실수가 있었습니다. 두 결과를 버리고 종료를 확인한 뒤 순차 재실행했습니다. 측정 worker는 겹치지 않았습니다. CPU 원자료는 이 후처리보다 먼저 수집됐습니다.');
put('측정 구간과 최종 계수 구간은 audit의 UTC 시각에 있습니다. 재현 명령은 기존 설치 Node v26.10.0과 esbuild/typescript만 사용합니다. 다음 명령은 한 줄씩 종료를 확인하고 실행하며 각 worker는 자체 420초 제한과 종료 직전 active resources 검사를 둡니다. 생성 결과는 외부 scratch에만 쓰므로 원자료를 바꾸지 않고 별도로 비교할 수 있습니다.');
put('```sh\n/opt/homebrew/bin/node --expose-gc packages/canard/schema-form/architecture/verification/07-switch/tools/measure-verdict-95c01.mjs array-100 off 1 new --head=bef81f4d747d028b05082d594138148520e4d992 --warmup=20\n/opt/homebrew/bin/node --expose-gc packages/canard/schema-form/architecture/verification/07-switch/profile-112-branch/branch-worker.mjs counts 5 1\n/opt/homebrew/bin/node --expose-gc packages/canard/schema-form/architecture/verification/07-switch/profile-112-branch/branch-worker.mjs cpu 5 1\n/opt/homebrew/bin/node packages/canard/schema-form/architecture/verification/07-switch/profile-112-branch/check-sentinel.mjs\n/opt/homebrew/bin/node packages/canard/schema-form/architecture/verification/07-switch/profile-112-branch/check-report-row.mjs\n/opt/homebrew/bin/node packages/canard/schema-form/architecture/verification/07-switch/profile-112-branch/analyze.mjs\n/opt/homebrew/bin/node packages/canard/schema-form/architecture/verification/07-switch/profile-112-branch/render-report.mjs\n```');
put('위 예시는 크기 5·회차 1입니다. 실제 CPU는 크기 5/10/20/40 × 회차 1..9를 순차 실행했습니다. 공식 array 명령은 timing-only JSON 및 메타데이터를 stdout으로 내보내는 기존 도구이며 native 도구로 `profile-112-branch/`의 정해진 파일에 보존했습니다. 기본 stdout을 shell 변수로 재해석하거나 추가 설치하지 않습니다. 전체 monorepo test/build는 제품 코드를 바꾸지 않은 이 측정 작업의 검증 범위에 포함하지 않았습니다.');

const csvCell = value => '"' + String(value ?? '').replaceAll('"', '""') + '"';
const csvHeaders = ['mode', 'function', 'self_slope_us_per_untouched_branch', 'inclusive_slope_us_per_untouched_branch',
  'self_intercept_us', 'inclusive_intercept_us', 'self_r2', 'inclusive_r2', '111_self_share_estimate_slope', '111_inclusive_share_estimate_slope',
  ...[5, 10, 20, 40].flatMap(b => [`B${b}_self_us`, `B${b}_inclusive_us`])];
const csvRows = Object.entries(s.part2.cpuFits).flatMap(([mode, v]) => v.functions.map(f => [mode, f.function,
  f.self.slopeUsPerBranch, f.selfAndChildren.slopeUsPerBranch, f.self.interceptUs, f.selfAndChildren.interceptUs,
  f.self.r2, f.selfAndChildren.r2, f.official111SelfShareEstimate?.slopeUsPerBranch,
  f.official111InclusiveShareEstimate?.slopeUsPerBranch, ...f.bySize.flatMap(r => [r.selfUs, r.selfAndChildrenUs])]));
const write = (file, text) => { assert(Buffer.byteLength(text) <= 5_000_000); fs.writeFileSync(path.join(scratch, file), text); };
write('cpu-functions.csv', [csvHeaders, ...csvRows].map(row => row.map(csvCell).join(',')).join('\n') + '\n');
write('audit.json', JSON.stringify(audit, null, 2) + '\n');
write('profile-112-branch.md', pieces.join('\n\n') + '\n');
write('profile-112-branch-summary.json', JSON.stringify(s));

const old111 = fs.readFileSync(path.join(D, 'profile-111-final.md'), 'utf8');
let axis = false, changedTableRows = 0;
const originalIntro = '공식 설계 표의 108행을 수집했습니다(마운트/BF 46행, 첫/이후 46행, 분기 수 축 16행). (가)는 104개 고유 측정 행 중 102행에서 pooled와 세 회차 모두 성립합니다. **array-100 OFF BF·첫 갱신은 12.667 / 8.541µs로 보류**하며 소유자 수용 표시를 유지합니다. 수용 표시와 성능 충족 판정은 별도입니다. 표 전체에 대한 (가) 성립을 선언하지 않습니다.';
const newIntro = '공식 설계 표의 108행을 수집했습니다(마운트/BF 46행, 첫/이후 46행, 분기 수 축 16행). **112라운드 sentinel 정정으로 원자료의 (가)를 재계산한 결과 104개 고유 행 모두 pooled·세 회차에서 통과**합니다. 이 표의 (가) 차이는 정정 값 0µs이고 잡음은 111 당시 값입니다. array-100 OFF BF·첫 갱신의 보류는 3.080× 성능 **미달**로 바꾸며 **소유자 수용(104라운드)**은 유지합니다. 공식 성능 수치·배율·다른 판정은 그대로입니다. fresh 배열 12행 재검증과 수치가 바뀌는 103행 목록은 [112라운드 보고](profile-112-branch.md)에 있습니다. 아래 끝점 귀속은 정정 전 관측의 기록입니다.';
assert(old111.includes(originalIntro) || old111.includes(newIntro));
const reverseMode = { '마운트': 'mount', 'BF 갱신': 'update', '첫 갱신': 'update-first', '이후 갱신': 'update-later' };
const new111 = old111.replace(originalIntro, newIntro).split('\n').map(line => {
  if (line.startsWith('## 고정 두 분기 전환 축')) axis = true;
  const columns = line.split('|').map(c => c.trim());
  if (columns.length !== 12 || !['off', 'on'].includes(columns[2]) || !(columns[3] in reverseMode)) return line;
  let mode = reverseMode[columns[3]];
  if (axis && mode !== 'mount') mode = { update: 'axis-update', 'update-first': 'axis-first', 'update-later': 'axis-later' }[mode];
  const row = s.part1.recalculatedRows.find(r => r.fixture === columns[1] && r.validation === columns[2] && r.mode === mode);
  assert(row, line);
  columns[6] = '통과 · 통/통/통'; columns[7] = '0.000 / ' + num(row.noiseUs);
  if (columns[9] === '보류((가) 미통과)') columns[9] = '미달';
  changedTableRows++;
  return '| ' + columns.slice(1, -1).join(' | ') + ' |';
}).join('\n');
assert.equal(changedTableRows, 108);
const oldLines = old111.split('\n'), newLines = new111.split('\n');
assert.equal(oldLines.length, newLines.length);
const indices = oldLines.map((line, index) => line === newLines[index] ? -1 : index).filter(i => i >= 0);
const begin = indices[0], end = indices.at(-1) + 1;
if (indices.length) write('profile111.patch', '*** Begin Patch\n*** Update File: ' + path.join(D, 'profile-111-final.md') + '\n@@\n' +
  oldLines.slice(begin, end).map(l => '-' + l).join('\n') + '\n' + newLines.slice(begin, end).map(l => '+' + l).join('\n') + '\n*** End Patch\n');
console.log(JSON.stringify({ report: path.join(scratch, 'profile-112-branch.md'), bytes: Buffer.byteLength(pieces.join('\n\n')),
  summaryBytes: Buffer.byteLength(JSON.stringify(s)), csvRows: csvRows.length, positiveSites: positive.length,
  measuredProcesses: measured.length, changedTableRows, profile111NeedsPatch: indices.length > 0, sourceFilesHashVerified: sourceIndex.size }));
