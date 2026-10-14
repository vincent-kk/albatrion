// CLI report renderer; generated prose uses only this session and the requested G26 tie evidence.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { directory, HEAD, hash, git, emit } from './runtime.mjs';

const read = file => JSON.parse(fs.readFileSync(path.join(directory, file), 'utf8'));
const split = read('split-AB.json'), tie = read('tie-B.json'), verdict = read('verdict.json');
const audit = read('audit-measurements.json');
assert(audit.passed);
const files = fs.readdirSync(directory);
const fmt = (number, digits = 3) => Number(number).toFixed(digits);
const us = number => fmt(number * 1000);
const ci = value => us(value.median) + ' [' + us(value.low) + ', ' + us(value.high) + ']';
const code = value => String.fromCharCode(96) + value + String.fromCharCode(96);
const clean = value => String(value).replaceAll('|', '\\|').replaceAll('\n', ' ');
const table = (headers, rows) => '\n| ' + headers.map(clean).join(' | ') + ' |\n| ' +
  headers.map(() => '---').join(' | ') + ' |\n' +
  rows.map(row => '| ' + row.map(clean).join(' | ') + ' |').join('\n') + '\n';
const link = (label, file, prefix = 'profile-117-session/') => '[' + label + '](' + prefix + file + ')';
const lane = mode => ({ mount: '마운트', update: 'BF', 'update-first': '초회', 'update-later': '후속',
  'axis-update': '고정 축 BF', 'axis-first': '고정 축 초회', 'axis-later': '고정 축 후속' })[mode];
const rules = ['94', '95', '104', '105', '110', '113', '114'].map(round => {
  const name = round === '104' || round === '110' || round === '113'
    ? 'round-' + round + '-owner-answers.md' : 'round-' + round + '-closing.md';
  const ref = 'origin/1.0.0-beta:packages/canard/schema-form/architecture/reviews/' + name;
  return { round, ref, sha256: hash(git(['show', ref])) };
});
const localSources = [
  '../tools/measure-verdict-95c01.mjs', '../tools/report-verdict-95c01.mjs', '../tools/endpointDifference95c01.mjs',
  '../tools/prepare-branch1-bundles.mjs', '../profile-111-final.md', '../profile-112-branch.md',
  '../profile-113-paired.md', '../profile-114-g26/measure-react.mjs', '../profile-114-g26/summary.json',
  '../performance.md', '../branch1-child-selection.md',
].map(file => ({ file, sha256: hash(fs.readFileSync(path.join(directory, file))) }));
assert.equal(hash(fs.readFileSync(path.join(directory, tie.source))), tie.sourceSha256);

const parts = [];
parts.push('# 117 측정 세션 — React 분해, 동률 규칙, A/A와 child selection 판정\n');
parts.push('branch change 1의 현재 판정은 **' + verdict.verdict + '**입니다. 분기 축의 BF·초회·후속 기울기는 모두 줄었지만, 105C-01의 최소 크기를 넘는 회귀가 ' + verdict.regressions.length + '행에서 관측되었습니다.\n');
parts.push('측정 대상은 HEAD ' + code(HEAD) + '와 이 작업트리의 기존 미커밋 child selection 변경입니다. 측정 worker 기록의 범위는 ' + audit.firstStarted + '부터 ' + audit.lastEnded + '까지이며, 시각은 UTC입니다. 제품 소스는 수정하거나 되돌리지 않았고, git 쓰기와 설치는 실행하지 않았습니다. 소스 전체와 기존 차이의 해시는 ' + link('최초 기록', 'baseline.json') + ', ' + link('D 직전 확인', 'audit-before-D.json') + ', ' + link('최종 확인', 'audit-final.json') + '에서 대조할 수 있습니다.\n');
parts.push('Node v26.10.0, V8 14.6.202.34-node.35, Apple M1 Max에서 순차 실행했습니다. React는 19.2.6 production profiling 빌드를 사용했습니다. 기록된 측정 worker ' + audit.totalMeasuredWorkers + '개는 모두 code 0, signal null로 자연 종료했고, 실행 구간의 중첩은 0개입니다. 최장 worker는 ' + fmt(audit.largestWorker.seconds) + '초로 8분 이내였습니다.\n');
parts.push('번들은 지정된 scratchpad/bundles에만 두었습니다. ' + link('번들 준비와 해시', 'bundles.json') + '에 HEAD·working·0.16.0의 해시와 자연 종료한 빌드 서비스가 기록되어 있습니다. 기존 준비 도구는 파일을 수정하지 않고 현재 HEAD를 고정하는 메모리 어댑터로 실행했으며, BF의 분기 fixture만 40까지 확장했습니다. cacheDir은 설정하지 않았습니다.\n');

parts.push('## 공통 계측 방법\n');
parts.push('공식 코어 열은 95C-01의 종단 시간에서 공통 빈 호출 상수 C를 쓰기 수만큼 뺀 값입니다. 각 실제 호출 바로 앞에서 같은 64 Promise checkpoint와 FIFO setImmediate sentinel을 실행하는 별도 빈 호출을 측정하고, 빈 호출의 종단−microtask 꼬리를 세 번째 원시 열 pairedEmptyTailMs로 보존했습니다. OFF는 1-pass, ON은 2-pass이며 음수값을 잘라내지 않았습니다.\n');
parts.push('검증 (가)는 종단에서 짝 빈 꼬리를 독립적으로 보정한 값과 microtask 값의 표본별 차이 중앙값을 각 회차와 pooled에서 비교합니다. 기존 p95 빈 대기 편차, 1000회 bootstrap, C/M 불확실성과 1µs 하한을 유지했습니다. 별도 경계 검증에서 엔진 예약·실행·microtask 및 sentinel의 pending·sentinel 뒤 후속 작업이 모두 0이어야 합니다. 시간과 경계 조건을 모두 충족해야 통과로 표시했습니다.\n');
parts.push('0.16.0의 검증 (나)가 어느 회차나 pooled에서 벗어나면 해당 행의 모든 회차에 microtask+별도 callback 실행 합계를 사용했습니다. A의 세 BF 코어 행은 fallback이 없었으며, B의 array-replace-200은 이 규칙에 따라 구 판의 합계 열을 사용했습니다. 이 선택을 새 엔진에 확장하지 않았습니다.\n');
parts.push('A·B의 wall과 코어는 버전당 3회×101표본을 합한 중앙값이며, 예열은 20회였습니다. 같은 BF 상호작용을 React와 코어 단독에서 각각 실행했습니다. 코어에서는 React를 로드하지 않았고 schema clone·강제 GC·validator 준비는 clock 밖에 두었습니다. React 계층 몫은 wall−코어로 정의했으며, BF drainTicks(2) 대기와 React 연결 비용을 포함하는 잔여값입니다. 순수 렌더 CPU 시간과 동일하게 해석하지 않습니다.\n');
parts.push('일량은 시간 측정과 분리한 계수 전용 3표본에서 실제 component 호출, commit, node listener 호출, root computeNode 호출을 셌습니다. 0.16.0에는 새 settle pipeline이 없으므로 settle pass 0은 해당 단계의 부재를 뜻합니다. 공식 시간 번들에는 이 계수 instrumentation을 넣지 않았습니다.\n');

parts.push('## (A) 배열 BF 업데이트의 코어와 React 계층 분해\n');
parts.push('세 배열 행 모두 HEAD의 코어 비중이 5% 미만이며 React 잔여 몫이 지배적입니다. 코어 지배 조건에 해당하지 않아 추가 core 표 행은 없습니다. 아래 단위는 ms이며, R/C/L/S는 render 호출·commit·listener delivery·settle pass입니다.\n');
const countValue = record => record.min === record.max ? String(record.median) :
  record.median + ' [' + record.min + ', ' + record.max + ']';
const work = version => ['renders', 'commits', 'listenerDeliveries', 'settlePasses']
  .map(field => countValue(version.work[field])).join('/');
const coreWork = version => ['renders', 'commits', 'listenerDeliveries', 'settlePasses']
  .map(field => version.coreWork[0][field]).join('/');
parts.push(table(['fixture', '버전', 'wall ms', '코어 ms', 'React 잔여 ms', '코어/React %', 'React R/C/L/S', '코어 단독 R/C/L/S'],
  split.A.flatMap(row => ['0.16.0', 'HEAD'].map(version => {
    const item = row.versions[version];
    return [row.fixture, version, fmt(item.wall), fmt(item.core), fmt(item.layer),
      fmt(item.corePercent, 2) + '/' + fmt(100 - item.corePercent, 2), work(item), coreWork(item)];
  }))));
parts.push('배열 행의 raw wall·core·계수 자료는 ' + link('원자료 목록의 A·B 항목', 'raw-evidence.md') + '에 있으며, 분해 수치와 공식 열 선택은 ' + link('A·B 분해 JSON', 'split-AB.json') + '에서 확인할 수 있습니다.\n');

parts.push('## (B) 94C-02 동률 규칙과 남은 React 업데이트 행\n');
parts.push('소유자 판단 필요로 표시된 업데이트 24행을 요청하신 G26의 기존 세 회차에만 대조했습니다. 목표 초과가 세 회차 모두에서 성립할 때만 미달로 남겼습니다. array-500 wall의 회차 배율은 1.023359/1.001867/0.988247이고 sample-2 profiler는 0.916161/1.066653/0.938916이므로 두 행은 동률·충족으로 처리했습니다. 남은 행은 wall ' + split.B.remainingWall + '개와 profiler ' + split.B.remainingProfiler + '개입니다. 새 분해 표본을 사용해 G26 판정을 다시 바꾸지 않았습니다.\n');
parts.push(table(['fixture', 'G26 업데이트 지표', '목표 ×', '회차 1 ×', '회차 2 ×', '회차 3 ×', '동률 적용 결과'],
  tie.rows.map(row => [row.fixture, row.metric === 'render-update-wall' ? 'wall' : 'profiler',
    fmt(row.target, 1), ...row.ratios.map(value => fmt(value, 6)), row.remains ? '미달로 남습니다.' : '동률·충족입니다.'])));
parts.push('세 회차의 구 판·HEAD 중앙값과 source SHA-256은 ' + link('동률 규칙 원자료', 'tie-B.json') +
  '에 기록되어 있으며, 입력은 ' + '[G26 summary](profile-114-g26/summary.json)' + '입니다.\n');
parts.push('남은 각 fixture의 wall을 같은 BF 쓰기 수로 분해한 현재 값은 다음과 같습니다. 단위는 ms이며, 코어/React 비중은 HEAD wall 기준입니다.\n');
parts.push(table(['fixture', 'BF 쓰기 수', '0.16 wall/코어/React ms', 'HEAD wall/코어/React ms', 'HEAD 코어/React %', 'React 잔여 증가 ms'],
  split.B.rows.map(row => {
    const old = row.versions['0.16.0'], head = row.versions.HEAD;
    return [row.fixture, row.interactions, [old.wall, old.core, old.layer].map(value => fmt(value)).join('/'),
      [head.wall, head.core, head.layer].map(value => fmt(value)).join('/'),
      fmt(head.corePercent, 2) + '/' + fmt(100 - head.corePercent, 2), fmt(row.gaps.layer, 6)];
  })));
parts.push('104차에서는 sample·nested·array·computed의 쓰기당 고정 pipeline 비용을 약 0.06ms로 수용했고, 110차에서는 flat-50·100의 초회 비용 0.07–0.1ms만 수용했습니다. 아래 비교는 같은 fixture와 초회·후속 구분, 시간 규모를 대조한 결과입니다. 본 세션은 pipeline 단계별 제거 실험을 하지 않았으므로, 크기가 양립하는 경우에도 특정 단계가 유일한 원인이라는 재확정은 아닙니다. 기존 수용 범위는 넓히지 않았습니다.\n');
parts.push(table(['fixture', '코어 초회 증가 µs', '코어 후속 증가 µs', '104·110차 원인과의 비교'],
  split.B.rows.map(row => [row.fixture, us(row.gaps.first), us(row.gaps.later), row.cause.replace('7단계 코드 수준 대상', 'stage 07의 코드 수준 대상')])));
parts.push('flat-50·100의 초회 차이 90.750/73.333µs는 110차의 동일 두 행과 같은 규모입니다. sample·nested·array-100·computed의 후속 차이는 14.751–57.541µs로 104차 고정비와 크기 비교상 양립하지만, 초회 85.958–131.332µs를 전부 기존 약 60µs 수용에 포함하지 않았습니다. flat-500의 코어는 구 판보다 빨라 wall 증가를 기존 코어 수용 원인으로 설명할 수 없습니다. push·remove·replace의 큰 코어 증가도 기존 동일 행·규모의 수용에 포함하지 않았습니다.\n');
const positiveLayer = split.B.rows.filter(row => row.gaps.layer > 0);
parts.push('양의 React 잔여 증가가 관측된 ' + positiveLayer.map(row => row.fixture).join(', ') +
  '은 stage 07의 코드 수준 개선 대상입니다. sample-0·2·3은 이번 잔여 중앙값 차이가 음수이므로 새로운 양의 잔여 증가로 표시하지 않았습니다.\n');
parts.push('profiler-update의 남은 8행은 React render 영역 자체의 관측입니다. 코어 단독 setValue clock은 actualDuration 밖에 있으므로 profiler 값에서 이를 빼서 가짜 부분합을 만들지 않았습니다. 같은 fixture의 위 wall 분해를 연결하고, profiler 미달은 React render 영역의 stage 07 코드 수준 대상으로 남겼습니다.\n');
parts.push('남은 fixture의 실제 일량은 아래와 같습니다. 튜플 순서는 A와 같은 R/C/L/S이며, 단독 코어의 render·commit은 모두 0입니다.\n');
parts.push(table(['fixture', '0.16 React R/C/L/S', 'HEAD React R/C/L/S', '0.16 코어 R/C/L/S', 'HEAD 코어 R/C/L/S'],
  split.B.rows.map(row => [row.fixture, work(row.versions['0.16.0']), work(row.versions.HEAD),
    coreWork(row.versions['0.16.0']), coreWork(row.versions.HEAD)])));

parts.push('## (C) HEAD 대 HEAD 9회 A/A 대조\n');
parts.push('공식 core의 마운트·BF·초회·후속 92행과 OFF 고정 분기 축의 BF·초회·후속 12행을 측정했습니다. 축 마운트의 4개 중복을 포함한 기존 표시 방식은 108행이며, 계산은 104개 고유 행을 사용했습니다. 각 행은 9회×101개, 총 909개의 ordinal 대응 차이를 합쳤습니다. 표본마다 두 독립 HEAD 인스턴스의 순서를 교대했으며, 강제 GC는 clock 밖에 두었습니다.\n');
parts.push('차이는 첫 HEAD−둘째 HEAD이며, 99% 구간은 기존 1999회·seed 101 bootstrap으로 구했습니다. A/A 차이 중앙값 절댓값의 최댓값은 ' +
  verdict.aaMaximum.fixture + ' ' + lane(verdict.aaMaximum.mode) + '의 ' + us(verdict.aaMaximum.magnitudeMs) +
  'µs이며, 대응 차이 중앙값과 구간은 ' + ci(verdict.aaMaximum.paired) + 'µs입니다. D의 잡음 바닥에는 이 최댓값을 일괄 적용하지 않고 같은 행의 절댓값을 사용했습니다.\n');
parts.push(table(['fixture', '검증', '모드', 'A/A 대응 중앙값 [99%] µs', '절댓값 µs', '행별 자료'],
  verdict.rows.map(row => [row.fixture, row.validation.toUpperCase(), lane(row.mode), ci(row.aaPaired),
    us(row.aaMagnitudeMs), link('통계·raw 경로', row.aaAnalysis)])));
parts.push('C의 시간 검증 (가)는 sample-0·1·2와 flat-50의 마운트에서 완전히 충족되지 않았습니다. 아래 통합 검증 표에 실패를 그대로 기록했으며, 경계가 0이라는 사실로 시간 실패를 통과로 바꾸지 않았습니다.\n');

parts.push('## (D) branch change 1의 9회 판정\n');
parts.push('HEAD 번들 branch1-head.cjs와 working 번들 branch1-working.cjs를 같은 104개 고유 행에서 9회 대조했습니다. 양수 대응 차이는 working이 빠르다는 뜻이며, 표의 중앙값은 버전별 중앙값을 뺀 값이 아니라 909개 표본별 HEAD−working 차이의 중앙값입니다. 모든 행의 99% 구간과 A/A 바닥을 아래에 제시했습니다.\n');
parts.push('회귀는 99% 구간 전체가 0 아래이고, 대응 차이 중앙값 절댓값이 max(같은 행 A/A 중앙값 절댓값, HEAD 중앙값의 0.5%)보다 클 때입니다. 유의한 이득은 구간 전체가 0 위이고 대응 차이 중앙값이 같은 행 A/A 크기보다 클 때로 계산했습니다. 유의한 이득은 ' +
  verdict.meaningfulGains + '행이며, 그중 고정 분기 축은 ' + verdict.meaningfulBranchGains + '행입니다.\n');
parts.push('현재 판정은 **' + verdict.verdict + '**입니다. ' + verdict.reason + ' 회귀 4행의 기준값은 다음과 같습니다.\n');
const regressionRows = verdict.rows.filter(row => row.regression);
parts.push(table(['fixture', '검증', '모드', 'HEAD µs', '대응 중앙값 [99%] µs', '|A/A| µs', '0.5% µs', '최소 크기 µs'],
  regressionRows.map(row => [row.fixture, row.validation.toUpperCase(), lane(row.mode), us(row.baseMedianMs),
    ci(row.paired), us(row.aaMagnitudeMs), us(row.halfPercentMs), us(row.regressionFloorMs)])));
parts.push('분기 기울기는 OFF 고정 축 kind_0→kind_4→kind_0의 5·10·20·40분기 pooled 중앙값에 절편을 포함한 최소제곱 직선을 맞춰 구했습니다. BF는 두 쓰기의 합계이고 초회는 첫 kind_4 쓰기, 후속은 왕복 뒤 다시 kind_4로 바꾸는 한 쓰기입니다. 단위는 µs/분기입니다.\n');
parts.push(table(['모드', 'HEAD 기울기 µs/분기', 'working 기울기 µs/분기', '감소 %'],
  verdict.slopes.map(row => [lane(row.mode), fmt(row.headUsPerBranch), fmt(row.workingUsPerBranch), fmt(row.reductionPercent, 2)])));
parts.push(table(['모드', '분기 수', 'HEAD 중앙값 µs', 'working 중앙값 µs'],
  verdict.slopes.flatMap(slope => slope.points.map(point => [lane(slope.mode), point.branches, us(point.headMs), us(point.workingMs)]))));
parts.push('아래의 최소 크기 미만 음수 행은 회귀로 계산하지 않았습니다. 구간이 0을 포함하는 행도 회귀로 계산하지 않았습니다. 분기 기울기 감소가 관측되어도 다른 행의 회귀를 상쇄하지 않았습니다.\n');
parts.push(table(['fixture', '검증', '모드', 'HEAD µs', 'working µs', '대응 중앙값 [99%] µs', '|A/A| µs', '회귀 최소 µs', '행별 결과', '행별 자료'],
  verdict.rows.map(row => [row.fixture, row.validation.toUpperCase(), lane(row.mode), us(row.baseMedianMs), us(row.workingMedianMs),
    ci(row.paired), us(row.aaMagnitudeMs), us(row.regressionFloorMs),
    row.regression ? '회귀입니다.' : row.meaningfulGain ? '이득입니다.' : row.paired.high < 0 ? '음수이나 최소 크기 이내입니다.' : '회귀가 아닙니다.',
    link('통계·raw 경로', row.analysis)])));
parts.push('성능 회귀만으로 이미 REJECT이며, 독립 종단 검증 (가)에도 미충족 행이 남아 있습니다. 이 세션을 모든 행이 검증된 공식 통과 표로 표시하지 않습니다. branch change 1의 판정과 stage 07 전체 수용은 별개이며, 기존 성능 수용 표시나 목표를 수정하지 않았습니다.\n');

parts.push('## 종단 검증과 원자료 확인\n');
parts.push('C·D의 새 엔진 경계에서는 모든 진단 호출의 예약·실행·pending·후속 작업이 0이었습니다. 아래 실패는 독립된 짝 빈 꼬리 보정 시간 조건의 실패입니다. 회차 목록이 비어 있어도 pooled 조건을 넘으면 실패로 남겼습니다. 차이와 잡음의 단위는 µs입니다.\n');
parts.push(table(['단계', 'fixture', '검증', '모드', '버전', 'pooled 차이/잡음 µs', '미충족 회차', 'pooled 시간 조건', '경계'],
  verdict.endpointFailures.map(row => [row.stage, row.fixture, row.validation.toUpperCase(), lane(row.mode), row.version,
    us(row.differenceMs) + '/' + us(row.noiseMs), row.failingRuns.map(run => run.run).join(', ') || '없습니다.',
    row.pooledWithinNoise ? '충족합니다.' : '미충족입니다.', row.zeroEngineMacrotasks ? '0회입니다.' : '미충족입니다.'])));
parts.push('각 미충족 회차의 차이와 잡음은 ' + link('판정 JSON', 'verdict.json') +
  '의 endpointFailures와 각 행 analysis 파일에서 확인할 수 있습니다. 빈 호출 C/M과 경로별 bootstrap은 ' +
  ['A','B','C','D'].map(stage => link(stage + ' 보정', 'calibration-' + stage + '.json')).join(', ') + '에 있습니다.\n');
parts.push('산출물 검증은 ' + link('측정 자료 검증', 'audit-measurements.json') +
  '에 기록했습니다. 208개 C·D 행의 pooled 대응 중앙값과 같은 호출의 종단 차이를 원시 열에서 다시 계산했고, 분기 축 12행·회귀 4행의 99% 구간은 quickselect 중앙값으로 독립 재계산했습니다. 기울기 여섯 값도 별도의 합계식으로 대조했습니다. React 분해 산술, 세 회차 표본 수, 자연 종료, 순차 실행 구간과 5MB 파일 상한을 확인했습니다.\n');
parts.push('원자료의 직접 링크는 ' + link('전체 raw evidence 목록', 'raw-evidence.md') +
  '에 있습니다. 측정과 분석 스크립트, 지정 규칙의 git ref·SHA-256, 입력 파일의 SHA-256은 ' +
  link('재현 자료와 source 기록', 'report-sources.json') + '에 있습니다. source 보존과 보고서 링크의 최종 검증은 ' +
  link('소스 최종 검증', 'audit-final.json') + ', ' + link('보고서 검증', 'audit-report.json') + '에 있습니다.\n');
const markdown = parts.join('\n').trimEnd() + '\n';

const rawParts = ['# 117 세션 원자료 목록\n', '모든 링크는 이번 세션의 현재 원자료입니다. A·B의 계수 표본은 시간 판정에 합치지 않았고, C·D는 각각 같은 행의 9회 raw 파일을 유지했습니다.\n'];
rawParts.push('## A·B React 분해 자료\n');
for (const row of split.B.rows) {
  rawParts.push('### ' + row.fixture + '\n');
  rawParts.push('이 fixture의 ' + row.stage + ' 단계 자료를 다음 파일에서 확인할 수 있습니다.\n');
  rawParts.push(table(['자료', '직접 링크'], [
    ['코어 3회', row.raw.core.map((name, index) => link('회차 ' + (index + 1), name, '')).join(', ')],
    ['React wall 3회씩', row.raw.react.map(name => link(name.replace('.json', ''), name, '')).join(', ')],
    ['계수 전용 3표본씩', row.raw.counts.map(name => link(name.replace('.json', ''), name, '')).join(', ')],
  ]));
}
for (const stage of ['C','D']) {
  rawParts.push('## ' + stage + ' 9회 대응 자료\n');
  const settings = [...new Map(verdict.rows.map(row => [row.fixture + '/' + row.validation, [row.fixture, row.validation]])).values()];
  rawParts.push(table(['fixture', '검증', '회차 1–9의 직접 링크'],
    settings.map(([fixture, validation]) => [fixture, validation.toUpperCase(),
      Array.from({ length: 9 }, (_, index) => {
        const name = stage + '-core-' + fixture + '-' + validation + '-r' + (index + 1) + '.json';
        assert(fs.existsSync(path.join(directory, name)));
        return link(String(index + 1), name, '');
      }).join(', ')])));
}
rawParts.push('## 계측기와 분석 재현 자료\n');
rawParts.push('아래 파일은 측정 원자료를 생성하거나 현재 통계와 검증을 계산하는 세션 도구입니다.\n');
rawParts.push(files.filter(name => name.endsWith('.mjs')).map(name => '- ' + link(name, name, '') + '에서 해당 단계의 실행 내용을 확인할 수 있습니다.').join('\n') + '\n');
rawParts.push('G26 동률 입력의 직접 링크는 ' + link('G26 summary', '../profile-114-g26/summary.json', '') +
  '이며, 현재 결과를 담은 ' + link('verdict JSON', 'verdict.json', '') + ', ' +
  link('split JSON', 'split-AB.json', '') + '에도 각각 raw 파일명이 연결되어 있습니다.\n');
const evidenceMarkdown = rawParts.join('\n').trimEnd() + '\n';
assert(Buffer.byteLength(markdown) < 5_000_000);
assert(Buffer.byteLength(evidenceMarkdown) < 5_000_000);
emit('report-sources.json', { HEAD, generated: new Date().toISOString(), rules, localSources,
  reportSha256: hash(markdown), rawEvidenceSha256: hash(evidenceMarkdown),
  currentMeasurementInterval: [audit.firstStarted, audit.lastEnded], sourcePreservationAudit: 'audit-final.json',
  rawWorkers: audit.totalMeasuredWorkers, verdict: verdict.verdict, regressionRows: verdict.regressions });
emit('report-rendering.json', { markdown, evidenceMarkdown });
console.log('현재 네 결과와 모든 원자료 링크의 한국어 보고서를 생성했습니다.');
