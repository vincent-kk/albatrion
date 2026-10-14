// CLI report renderer; JSON summaries and raw diagnostics are the canonical numerical inputs.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { directory, rawDirectory, HEAD, scratch, emitSummary } from './runtime.mjs';

const read = name => JSON.parse(fs.readFileSync(path.join(directory, name), 'utf8'));
const raw = name => JSON.parse(fs.readFileSync(path.join(rawDirectory, name), 'utf8'));
const react = read('react-summary.json');
const first = read('verdict-1b.json'), second = read('verdict-2.json');
const audit = read('audit-results.json');
const before = read('audit-before.json'), after = read('audit-after.json');
const bundles = read('bundles.json');
const diagnostic = raw('endpoint-diagnostic.json');
const sections = {};
const number = (value, digits = 3) => Number(value).toFixed(digits);
const us = value => number(value * 1000);
const interval = value => '[' + us(value.low) + ', ' + us(value.high) + ']';
const table = (headers, rows) => '\n| ' + headers.join(' | ') + ' |\n| ' + headers.map(() => '---').join(' | ') + ' |\n' + rows.map(row => '| ' + row.join(' | ') + ' |').join('\n') + '\n';
const rowName = row => row.fixture + '/' + row.validation + '/' + row.mode;
const label = mode => ({ 'axis-update': 'BF', 'axis-first': 'first', 'axis-later': 'later', update: 'BF', 'update-first': 'first', 'update-later': 'later' })[mode] || mode;
const status = (row, metric) => !row.usable ? '단언 실패로 판정 제외' : metric.timeMiss ? '미달' : metric.tied ? '충족(94C-02 동률)' : '충족';
const ratios = metric => metric.ratioRuns.map(value => number(value, 6)).join(' / ');
const aaRows = first.rows.map(row => read(row.aaAnalysis).rows.find(candidate => candidate.mode === row.mode));
assert.equal(aaRows.length, 104);

sections.overview = '# profile-119 측정 결과\n\n'
  + '변경 1b는 회귀 4개로 REJECT이며, 변경 2는 회귀 1개로 REJECT입니다. 1b가 기각되었으므로 변경 2는 b-2와 b-head를 비교했습니다. 아래 수치는 이번 세션의 측정값만 사용했습니다.\n\n'
  + '측정 대상은 커밋된 HEAD ' + HEAD + '이며, 작업 트리의 1b·2 변경은 측정 전후 그대로 보존되었습니다. 원본 src, Git 상태, 설치된 의존성을 수정하지 않았습니다. 번들·소스맵·캐시는 ' + scratch + '/bundles 아래에서만 다루었으며 cacheDir를 설정하지 않았습니다. 패키지 관리자 명령과 설치는 실행하지 않았습니다.\n\n'
  + 'Node v26.10.0, V8 14.6.202.34-node.35, Apple M1 Max, Darwin 25.6.0 arm64, 메모리 64 GiB에서 실행했습니다. React는 19.2.6의 production profiling 빌드를 사용했습니다. 측정은 진단, React, Core A/A, 1b, 2 순서로 수행했으며 모든 워커를 순차 실행하고 자연 종료를 기다렸습니다. 공식 Core 워커 621개와 React 워커 228개의 최장 단조 시계 소요 시간은 ' + number(audit.maxWorkerSeconds) + '초였습니다. 단일 명령의 8분 제한을 넘지 않았고, 준비·분석도 구간별 명령으로 나누었습니다.\n\n'
  + '95C-01의 종료점과 보정, 105C-01의 회귀 기준, 94C-02의 세 회차 동률 규칙을 적용했습니다. round-117/118의 원격 브랜치 문서는 git show로 읽었으며, [F1 진단](react-layer-diagnosis-118.md), [117 세션](profile-117-session.md), [React 기준 행](performance.md), [1b·2 정의](branch1b-2.md)를 방법의 근거로 삼았습니다. 기존 117 측정·보정·분석 스크립트와 114 React 도구를 이 세션 폴더에 복사하여 재사용했습니다.\n\n'
  + '기존 Core 번들은 40분기 fixture를 포함하지 않아 HEAD와 패치를 고정한 [준비 도구](profile-119-session/prepare-bundles.mjs)로 다시 만들었습니다. src를 쓰지 않고 Git blob과 패치를 메모리에서 적용했습니다. React의 HEAD 번들도 커밋된 blob에서 만들었으므로 작업 트리의 1b·2 변경이 React 기준 결과에 섞이지 않았습니다.\n'
  + table(['구분', 'SHA-256', '크기(bytes)'], bundles.results.map(row => [row.variant, row.sha256, row.bytes]))
  + '\nReact HEAD 번들의 SHA-256은 ' + raw('react-bundle.json').sha256 + '입니다. 각 번들 준비 서비스는 종료 코드 0으로 자연 종료했습니다.\n';

sections.harness = '\n## (0) F1 도구와 단언 결과\n\n'
  + '[measure-react.mjs](profile-119-session/measure-react.mjs)는 114 도구의 복사본입니다. write 직전 performance.now()와 performance.eventLoopUtilization()를 읽고, write 후 setImmediate를 네 번 차례로 await한 다음 벽시계와 ELU active 차이를 기록했습니다. update 행은 각 write의 시간을 합하며, 매 write의 벽시계·active·commit 수를 원시 JSON에 남겼습니다. mount의 벽시계 종료점은 기존 도구와 같고, active도 같은 시작·종료 구간에서 기록했습니다.\n\n'
  + '이전 drainTicks(2)의 벽시계는 별도의 record pass에서 수집했으며 새 두 판정 열과 섞지 않았습니다. 각 엔진의 mount 관측값과 업데이트 후 최종 값·렌더 경로를 digest로 비교했고, 모든 표본과 114개 엔진 쌍에서 일치했습니다.\n\n'
  + '0.16.0은 write당 commit 2개, HEAD는 1개를 엄격히 단언했습니다. 예열을 포함한 ' + react.checkedWrites + '개 write 가운데 ' + react.failedWrites + '개가 실패했으며 실패는 모두 0.16.0의 아래 5개 fixture에서 발생했습니다. HEAD는 모든 write에서 1개를 만족했습니다. 실패 시 HARNESS_ASSERTION_FAILED를 표기하고 워커가 종료 코드 2로 자연 종료하게 했습니다. 실패 행의 시간은 기록하되 update 판정에서 제외했습니다. 기대값을 완화하거나 제품 코드를 변경하지 않았습니다.\n'
  + table(['fixture', '0.16.0 관측 commit', '새 대기 실패 write', '이전 대기 실패 write', 'HEAD 실패 write'],
    react.assertions.filter(row => react.failedFixtures.includes(row.fixture)).map(row => {
      const old = row.assertions.find(value => value.version === '0.16.0');
      const head = row.assertions.find(value => value.version === 'HEAD');
      return [row.fixture, old.observedPerWrite.map(value => 'write ' + value.write + ': ' + value.counts.join('/')).join('; '), old.failures, old.recordFailures, head.failures];
    }))
  + '\n위 5개 fixture의 mount는 write 단언과 별개로 판정할 수 있습니다. oneOf-5/10/20의 두 write는 각각 3개 commit, array-replace-200의 단일 write는 1개, computed-visible-derived의 첫 write는 3개였습니다. 다른 fixture의 0.16.0 write는 모두 2개였습니다.\n';

sections.diagnosis = '\n## (1) A/A mount의 (가) 실패 원인\n\n'
  + 'sample-0, sample-1, sample-2, flat-50의 OFF mount에서 (가) 실패를 재현했습니다. 원인은 강제 GC 직후 첫 빈 호출의 FIFO sentinel tail이 후속 실제 호출의 tail보다 길어, 짝 빈 호출의 tail을 빼는 계산이 과하게 보정된 현상입니다. 엔진이 없는 noop과 CPU 계산만 하는 대조군에서도 같은 음의 차이가 나타났으며, 반복 강제 GC를 없앤 엔진 대조군에서는 차이가 +0.875~+0.999 µs로 줄었습니다.\n\n'
  + '아래 대조군은 예열 20회와 101개 표본으로 측정했습니다. tail은 sentinel 종료 시간과 microtask 종료 시간의 차이이며, 짝 차이는 실제 호출 tail에서 직전 빈 호출 tail을 뺀 표본별 값의 중앙값입니다. 중앙값끼리 뺀 값과 짝 중앙값은 다를 수 있습니다.\n'
  + table(['fixture', '대조군', '직전 빈 tail(µs)', '실제 tail(µs)', '후속 빈 tail(µs)', '짝 차이(µs)', '빈/실제 구간 GC 횟수'],
    diagnostic.summary.map(row => [row.fixture, row.control, number(row.emptyTailUs), number(row.actualTailUs), number(row.afterTailUs), number(row.pairedDifferenceUs), row.gcInEmpty + '/' + row.gcInEngine]))
  + '\n강제 GC 대조군의 빈 호출 및 실제 호출 측정 구간 안에서는 GC 이벤트가 0개였습니다. 강제 GC를 없앤 대조군에는 실제 호출 구간의 우발적 GC 이벤트가 fixture당 2개 있었으므로 전체 대조군이 GC 0개라는 주장은 하지 않습니다. 엔진 setImmediate의 예약·실행·sentinel 이후 tail은 모두 0개였습니다. 따라서 관측한 실패를 엔진의 종료점 사이 macrotask나 엔진 잔여 callback으로 설명할 근거는 없으며, GC 직후 측정 도구의 첫 빈 sentinel이 원인이라는 대조 실험의 결론을 사용했습니다.\n\n'
  + '공식 A/A에서 확인한 (가)의 차이와 잡음 폭은 다음과 같습니다. 이 4개 OFF mount는 사용자 지시에 따라 A/A·1b·2의 판정에서 제외했습니다. 별도 숫자나 fallback으로 바꾸어 통과 처리하지 않았습니다. 나머지 100개 행은 세 단계 모두 종료점 검사를 통과했습니다.\n'
  + table(['fixture', 'A/A 기준 차이(µs)', '기준 잡음(µs)', 'A/A 비교 차이(µs)', '비교 잡음(µs)', '엔진 macrotask'],
    aaRows.filter(row => !first.rows.find(candidate => rowName(candidate) === rowName(row)).eligible).map(row => [row.fixture, us(row.versions.base.endpointCheck.difference), us(row.versions.base.endpointCheck.noise), us(row.versions.candidate.endpointCheck.difference), us(row.versions.candidate.endpointCheck.noise), '0']))
  + '\n표본별 원시 대조 실험은 raw-sha256.txt의 endpoint-diagnostic.json 항목으로 검증할 수 있으며, [진단 스크립트](profile-119-session/diagnose-endpoints.mjs)에 재현 방법이 있습니다.\n';

sections.react = '\n## (2) React의 새 두 판정 열\n\n'
  + '19개 fixture의 mount와 update를 각각 새 프로세스에서 3회 측정했습니다. 예열 20회, 회차당 표본 101개이며, 엔진 순서는 1·3회차에 0.16.0→HEAD, 2회차에 HEAD→0.16.0으로 교대했습니다. GC와 schema 복사는 측정 구간 밖에서 수행했습니다. 이전 대기 pass도 독립된 새 프로세스로 같은 순서를 사용했습니다.\n\n'
  + '비율은 HEAD/0.16.0입니다. 각 행의 중앙값은 303개 표본을 모은 값이며, 판정은 회차별 중앙값 비율 3개를 사용합니다. 사용자 지정 목표는 모든 mount에서 1.2 이하, 모든 update에서 1.0 이하입니다. 94C-02에 따라 세 회차가 모두 목표를 초과할 때만 미달이며, 일부 회차만 초과하면 동률로 충족 처리했습니다. 단언 실패 update에는 시간 조건의 계산값을 보존하되 정식 충족 판정은 부여하지 않았습니다.\n\n'
  + '유효 행에서 벽시계와 active의 미달 목록은 같습니다. sample-1/2/3 update, oneOf-5/10/20 mount, array-push-100 update, array-push-remove-100 update의 8개 행이 미달입니다. 5개 단언 실패 update는 두 열 모두 판정 제외입니다.\n';
for (const [key, title] of [['wall', '판정 열 1: 네 번 setImmediate 후의 벽시계'], ['active', '판정 열 2: eventLoopUtilization active']]) {
  sections.react += '\n### ' + title + '\n'
    + table(['fixture/단계', '0.16.0 중앙값(ms)', 'HEAD 중앙값(ms)', 'pooled 비율', '회차 1 / 2 / 3 비율', '목표', '세 회차 시간 조건', '단언 적용 후 판정'],
      react.rows.map(row => {
        const metric = row.metrics[key];
        return [row.fixture + '/' + row.phase, number(metric.baseMedianMs, 6), number(metric.headMedianMs, 6), number(metric.pooledRatio, 6), ratios(metric), number(metric.target, 1), metric.timeMiss ? '미달' : metric.tied ? '충족(동률)' : '충족', status(row, metric)];
      }));
}
sections.react += '\n### 기록 열: 별도 pass의 이전 drainTicks(2) 벽시계\n\n'
  + '다음 수치는 이전 대기의 현재 재측정 기록이며 새 두 열의 판정에는 사용하지 않았습니다.\n'
  + table(['fixture/단계', '0.16.0 중앙값(ms)', 'HEAD 중앙값(ms)', 'pooled 비율', '회차 1 / 2 / 3 비율', 'update 단언'],
    react.rows.map(row => [row.fixture + '/' + row.phase, number(row.record.baseMedianMs, 6), number(row.record.headMedianMs, 6), number(row.record.pooledRatio, 6), ratios(row.record), row.usable ? '통과' : '실패']))
  + '\n집계와 원시 자료의 관계는 [react-summary.json](profile-119-session/react-summary.json)과 [analyze-react.mjs](profile-119-session/analyze-react.mjs)에서 확인할 수 있습니다.\n';

sections.aa = '\n## (3) Core A/A\n\n'
  + 'b-head를 두 번 로드하여 같은 버전을 9회 비교했습니다. 23개 fixture·validation 조합의 104개 행에서 회차당 예열 20회와 표본 101개를 사용했으며, 각 행은 909개 짝 표본을 갖습니다. 기준과 비교 엔진의 실행 순서는 표본 및 회차마다 교대했습니다. 공식 측정에는 엔진 계측을 넣지 않았고 scheduler 검사는 공식 표본이 모두 끝난 뒤 별도로 수행했습니다.\n\n'
  + '공식 행의 BF는 재사용 fixture가 정의한 update 묶음이며 first와 later는 해당 fixture의 첫 번째 및 이후 write입니다. 추가 분기 축은 oneOf-5/10/20/40 OFF의 kind_0→kind_4→kind_0로 고정했습니다. 축의 BF는 두 write의 합, first는 kind_0→kind_4, later는 kind_4→kind_0입니다. 축 mount는 판정 행에 넣지 않았습니다. if-then은 OFF와 ON을 모두 측정했습니다.\n\n'
  + '95C-01의 microtask 종료점은 64개 Promise checkpoint이며, OFF에서는 FIFO sentinel 1회, ON에서는 2회를 기다립니다. 판정 시간은 sentinel에서 호출 수 k에 공통 보정 C를 곱해 뺀 값이며 음수를 0으로 자르지 않았습니다. micro와 동기 구간 합계도 기록했습니다. 빈 호출 보정은 각 pass 시작·끝에서 얻고 두 엔진에 같은 C를 적용했습니다. 각 실제 호출 직전에도 짝 빈 호출을 기록하여 (가)를 검사했습니다.\n\n'
  + '짝 차이는 기준−비교이므로 양수는 비교 엔진이 빠르다는 뜻입니다. 표본 909개의 짝 차이 중앙값을 사용하며, 1999회 bootstrap, seed 101, 0.5%·99.5% nearest-rank 분위수로 99% 구간을 계산했습니다. A/A 크기의 최댓값은 array-1000/OFF/mount의 |중앙값| ' + us(first.aaMaximum.magnitudeMs) + ' µs이며, 해당 구간은 ' + interval(first.aaMaximum.paired) + ' µs입니다. 회귀 기준에는 이 전역 최댓값이 아니라 해당 행의 |A/A 중앙값|을 사용했습니다.\n\n'
  + '각 단계의 보정 상수와 sentinel 대기 분산은 다음과 같습니다. C·M·대기 수치는 µs입니다.\n'
  + table(['단계', 'sentinel 횟수', '빈 호출 수', 'C', 'M', '대기 중앙값', '대기 p5', '대기 p95', '대기 중앙값으로부터 절대편차 p95'],
    ['AA', '1b', '2'].flatMap(stage => Object.values(read('calibration-' + stage + '.json').byPasses).map(row => [stage, row.passes, row.calls, us(row.C), us(row.M), us(row.waitMedian), us(row.waitP5), us(row.waitP95), us(row.p95AbsoluteDeviationMs)])))
  + '\n아래는 A/A의 모든 행입니다. 두 엔진은 모두 b-head이며, 단위는 µs입니다. 4개 제외 행도 현재 결과를 기록했습니다.\n'
  + table(['fixture/validation/행', '기준 중앙값', '비교 중앙값', 'pooled 짝 중앙값', '99% 구간', '|A/A|', '종료점/판정 사용'],
    aaRows.map(row => [rowName(row), us(row.versions.base.metric.median), us(row.versions.candidate.metric.median), us(row.paired.median), interval(row.paired), us(Math.abs(row.paired.median)), first.rows.find(candidate => rowName(candidate) === rowName(row)).eligible ? '통과/사용' : '(가) 실패/제외']))
  + '\n각 fixture의 원시 9개 실행과 종료점별 수치는 profile-119-session의 analysis-AA-*.json에 연결되어 있습니다.\n';

/** Render the complete verdict table and branch slopes from one stage summary. */
function changeSection(verdict, title) {
  const regressionRows = verdict.rows.filter(row => row.eligible && row.regression);
  let text = '\n## ' + title + '\n\n'
    + (verdict.stage === '1b' ? 'b-1b와 b-head를 9회 비교했습니다.' : '1b의 REJECT 판정에 따라 b-2와 b-head를 9회 비교했습니다. b-1b2는 이번 2 판정에 사용하지 않았습니다.')
    + ' 회귀는 99% 구간 전체가 0보다 작고, |짝 중앙값|이 max(해당 행의 |A/A|, 기준 중앙값 절댓값의 0.5%)보다 클 때로 정의했습니다. 각 행에는 회귀 floor와 그 두 성분을 모두 표시했습니다.\n\n'
    + '최종 판정은 ' + verdict.verdict + '입니다. 분기 축 BF·first·later의 기울기는 모두 감소했으나 유효 행에서 회귀가 ' + regressionRows.length + '개 확인되었습니다. 유효 100개 행의 종료점은 모두 통과했으며, 지정된 4개 OFF mount는 제외했습니다.\n'
    + table(['회귀 행', '짝 중앙값(µs)', '99% 구간(µs)', '|A/A|(µs)', '기준 0.5%(µs)', '회귀 floor(µs)'],
      regressionRows.map(row => [rowName(row), us(row.paired.median), interval(row.paired), us(row.aaMagnitudeMs), us(row.halfPercentMs), us(row.regressionFloorMs)]))
    + '\n기울기는 5·10·20·40 분기의 pooled 중앙값에 대한 최소제곱 직선이며 단위는 µs/branch입니다. 아래에 계산에 사용한 네 점도 함께 기록했습니다. 각 점의 시간 단위는 µs입니다.\n'
    + table(['축', '기준 기울기', '변경 후 기울기', '감소율(%)'], verdict.slopes.map(row => [label(row.mode), number(row.headUsPerBranch, 6), number(row.workingUsPerBranch, 6), number(row.reductionPercent, 3)]))
    + table(['축', '분기 수', '기준 중앙값(µs)', '변경 후 중앙값(µs)'], verdict.slopes.flatMap(row => row.points.map(point => [label(row.mode), point.branches, us(point.headMs), us(point.workingMs)])))
    + '\n다음 표는 ' + verdict.stage + '의 모든 ' + verdict.rowCount + '개 행의 pooled 짝 중앙값과 99% 구간입니다. 기준·변경 중앙값과 차이·floor의 단위는 µs입니다. 구간만 음수여도 floor를 넘지 않으면 회귀로 판정하지 않았습니다.\n'
    + table(['fixture/validation/행', '기준 중앙값', '변경 중앙값', '짝 중앙값', '99% 구간', '|A/A|', '기준 0.5%', 'floor', '판정'],
      verdict.rows.map(row => [rowName(row), us(row.baseMedianMs), us(row.workingMedianMs), us(row.paired.median), interval(row.paired), us(row.aaMagnitudeMs), us(row.halfPercentMs), us(row.regressionFloorMs), !row.eligible ? '(가) 실패로 제외' : row.regression ? '회귀' : row.meaningfulGain ? '유의한 이득' : '회귀 조건 없음']))
    + '\n정밀 수치는 [verdict-' + verdict.stage + '.json](profile-119-session/verdict-' + verdict.stage + '.json)에 있으며 각 행에서 해당 단계와 A/A의 분석 파일을 참조합니다. REJECT는 성능 판정이며 작업 트리의 변경을 되돌리지 않았습니다.\n';
  return text;
}
sections.first = changeSection(first, '(4) 변경 1b');
sections.second = changeSection(second, '(5) 변경 2');

sections.audit = '\n## 검증과 재현 자료\n\n'
  + '측정 전후 src의 ' + before.sourceFileCount + '개 파일 집계 SHA-256은 ' + before.sourceSha256 + '로 같았습니다. src Git diff의 SHA-256도 ' + before.sourceDiffSha256 + '로 같았습니다. 두 패치의 구현 파일 7개는 HEAD에 패치를 메모리로 적용한 결과와 현재 작업 파일이 일치했습니다. [측정 전 감사](profile-119-session/audit-before.json)와 [측정 후 감사](profile-119-session/audit-after.json)에 확인 결과가 있습니다.\n'
  + table(['입력 패치', 'SHA-256'], Object.entries(before.patchHashes))
  + '\n[결과 감사](profile-119-session/audit-results.json)는 원시 자료로 312개 행의 중앙값을 다시 계산하고, 회귀 5개 및 변경 1b·2의 분기 축 24개 구간을 독립 quickselect 구현으로 재계산했습니다. 이 29개 99% 구간과 6개 기울기가 모두 일치했습니다. 고정 축의 BF=first+later 합은 원시 열별 ' + audit.axisSumChecks + '회 검사에서 일치했습니다. 모든 Core 비교의 관측 digest도 같고, scheduler pending·tail·잔여 자원 검사도 통과했습니다.\n\n'
  + '워커의 시각 기록에서는 2/sample-2/OFF/3 실행 중 시스템 시각이 약 4.082초 뒤로 이동했습니다. 원시 시작 시각은 2026-10-07T15:03:08.042Z, 종료 시각은 2026-10-07T15:03:06.017Z였지만 performance.now() 소요 시간은 2.056794667초였습니다. 순차 실행 로그에서는 3회차 종료를 기다린 뒤 4회차를 시작했습니다. 따라서 시각 문자열만 정렬해 겹침을 판정하지 않고 실행 로그 순서와 단조 시계로 확인했으며, 이 한 번의 시각 이동만 감사용 경계에서 보정했습니다. 849개 워커의 실행 겹침은 0개였습니다. 통계 계산은 performance.now() 기반이므로 이 시각 이동을 사용하지 않았고 원시 파일도 고치지 않았습니다.\n\n'
  + 'A/A의 첫 if-then/OFF 실행은 fixture 파일 복사 누락으로 표본을 만들기 전에 ENOENT와 종료 코드 1로 자연 종료했습니다. 기존 117의 if-then.json을 그대로 복사한 뒤 해당 18개 OFF/ON 실행을 수행했습니다. 실패 실행은 실행 로그에 보존했고 측정 표본에는 포함하지 않았습니다. 초기 React 도구 확인용 smoke 원시 파일도 공식 결과와 구분하여 보존했습니다.\n\n'
  + '모든 원시 JSON ' + audit.rawFiles + '개는 ' + rawDirectory + '에 있으며 [raw-sha256.txt](profile-119-session/raw-sha256.txt)에 각 절대 경로와 SHA-256을 기록했습니다. 공식 per-run 원시는 Core 621개, React 워커 228개이며 나머지는 엔진 쌍 기록·진단·준비·smoke 자료입니다. 저장소 안에는 요약·스크립트·실행 로그만 두었습니다. 최종 감사에서 모든 커밋 대상 파일이 5,000,000 bytes 이하인지 검사했습니다. 번들과 원시 파일은 커밋 대상에 포함하지 않았습니다.\n\n'
  + '재현 시 [core.mjs](profile-119-session/core.mjs), [calibrate.mjs](profile-119-session/calibrate.mjs), [analyze-row.mjs](profile-119-session/analyze-row.mjs), [verdict.mjs](profile-119-session/verdict.mjs), [verify-results.mjs](profile-119-session/verify-results.mjs)를 이 순서로 사용합니다. 아래 예시는 한 회차 또는 한 분석 단계의 명령이며 모두 순차 실행해야 합니다.\n\n'
  + '\`\`\`sh\n'
  + '/opt/homebrew/bin/node --expose-gc packages/canard/schema-form/architecture/verification/07-switch/profile-119-session/measure-react.mjs --pair sample-0 1\n'
  + '/opt/homebrew/bin/node --expose-gc packages/canard/schema-form/architecture/verification/07-switch/profile-119-session/measure-react.mjs --pair sample-0 1 --old-wait\n'
  + '/opt/homebrew/bin/node --expose-gc packages/canard/schema-form/architecture/verification/07-switch/profile-119-session/core.mjs AA sample-0 off 1\n'
  + '/opt/homebrew/bin/node --expose-gc packages/canard/schema-form/architecture/verification/07-switch/profile-119-session/core.mjs 1b sample-0 off 1\n'
  + '/opt/homebrew/bin/node --expose-gc packages/canard/schema-form/architecture/verification/07-switch/profile-119-session/core.mjs 2 sample-0 off 1 rejected\n'
  + '/opt/homebrew/bin/node packages/canard/schema-form/architecture/verification/07-switch/profile-119-session/verify-results.mjs\n'
  + '\`\`\`\n\n'
  + 'React·Core의 실제 실행 명령과 자연 종료 코드는 execution-react.json 및 execution-core-AA/1b/2.json에 있습니다. 이 보고서는 [render-report.mjs](profile-119-session/render-report.mjs)가 현재 요약 JSON에서 생성한 내용입니다.\n';
assert.equal(before.sourceSha256, after.sourceSha256);
assert.equal(before.sourceDiffSha256, after.sourceDiffSha256);
const section = process.argv[2];
assert(Object.hasOwn(sections, section), 'Specify overview, harness, diagnosis, react, aa, first, second or audit');
emitSummary('report-' + section + '.md', sections[section]);
