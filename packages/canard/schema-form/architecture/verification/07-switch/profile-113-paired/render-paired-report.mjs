// CLI report: renders the fresh paired-clock summary without changing the preserved official table.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url)), D = path.dirname(here);
const summary = JSON.parse(fs.readFileSync(path.join(here, 'summary.json'), 'utf8'));
const injected = JSON.parse(fs.readFileSync(path.join(here, 'injected-summary.json'), 'utf8'));
const official = fs.readFileSync(path.join(D, 'profile-111-final.md'), 'utf8');
const preservedArrays = official.split('\n').filter(line => /^\| array-/.test(line))
  .map(line => line.split('|').slice(1, -1).map(value => value.trim())).filter(cells => cells[1] === 'off');
const labels = { mount: '마운트', update: 'BF 갱신', 'update-first': '첫 갱신', 'update-later': '이후 갱신' };
const f = value => (Math.abs(value) < 1e-9 ? 0 : value).toFixed(3);
const arrayTable = [
  '| 행 | pooled 차이 / 잡음 µs | 회차 1 / 2 / 3 차이·잡음 µs | 경계 | (가) | 기존 배율·판정·수용 |',
  '| --- | ---: | --- | --- | --- | --- |',
  ...summary.arrays.map(row => {
    const preserved = preservedArrays.find(cells => cells[0] === row.fixture && cells[2] === labels[row.mode]);
    return `| ${row.key} | ${f(row.differenceUs)} / ${f(row.noiseUs)} | ${row.runs.map(run => f(run.differenceUs) + '/' + f(run.noiseUs) + (run.withinNoise ? ' 통' : ' 실')).join(' · ')} | ${row.checkA.zeroEngineMacrotasks ? '0회 통과' : '실패'} | ${row.checkA.passed ? '통과' : '실패'} | ${preserved[4]} · ${preserved[8]} · ${preserved[9]} |`;
  }),
].join('\n');
const otherTable = [
  '| 행 | 기각된 정정 차이 → 짝 보정 차이 µs | 새 잡음 µs | 통과 여부 |',
  '| --- | ---: | ---: | --- |',
  ...summary.otherNumericalChanges.map(row => `| ${row.key} | ${f(row.beforeDifferenceUs)} → ${f(row.afterDifferenceUs)} | ${f(row.noiseUs)} | ${row.beforePass ? '통' : '실'} → ${row.afterPass ? '통' : '실'} |`),
].join('\n');
const proof = injected.canonicalRowEndToEnd;
const markdown = `# 짝 빈 호출로 독립된 종단 시계 검증

## 112라운드 짝 sentinel 꼬리

HEAD \`1130bd2f9ff104401cb41bd28c03ab37ffd93d1c\`. 111C-01의 결정에 따라 표본 자체의 microtask 값을 종단 끝점으로 쓰던 형태를 제거했습니다. 공식 설계의 표시 108행(104개 고유 행)을 모두 다시 측정했습니다. 기존 원자료에는 독립된 짝 빈 꼬리가 없어 재계산만으로 복원할 수 없습니다.

각 실제 호출 바로 앞의 별도 빈 호출에서 같은 64 Promise checkpoint와 OFF 1-pass/ON 2-pass FIFO sentinel을 실행하고, 엔진 작업 없이 얻은 종단−microtask 꼬리를 세 번째 원시 열 \`pairedEmptyTailMs\`에 저장합니다. (가)의 종단 보정은 \`(endᵢ−kC)−[pairedEmptyTailᵢ−k(C−M)]\`, microtask 보정은 \`microᵢ−kM\`이며, 두 독립된 값의 표본별 차이를 먼저 구한 중앙값을 pooled와 각 회차에서 비교합니다. BF는 실제 쓰기별 짝 꼬리를 합하고 고정 분기 축의 왕복은 k=2입니다. 기존 빈 대기 p95·bootstrap 1000회와 seed·C/M 불확실성·하한 1µs를 유지했습니다. 공식 성능의 공통 C/M·(나)·배율·동률 규칙은 그대로이며 이번 표본으로 기존 성능 판정이나 수용 표시를 갱신하지 않았습니다.

각 fixture/validation/version/run은 fresh worker입니다. old→new / new→old / old→new 세 회차, 예열 20회·101표본·판마다 pooled 303개, 강제 GC·schema clone·GC 뒤 check anchor는 clock 밖입니다. 공식 worker 138개를 순차 실행했고 worker/esbuild 모두 code 0·signal null로 자연 종료했습니다. 최장 worker는 ${f(summary.audit.maxWorkerMs / 1000)}초입니다. 시간 수집 후에만 scheduler 경계를 감싸며, 모든 진단 호출에서 새 엔진 예약·실행·두 끝점 사이 pending·후속 예약/실행이 0회입니다. 수치 검사와 이 경계 검사가 모두 성립해야 통과합니다.

### 배열 12행

**10/12행 통과**입니다. array-100 OFF BF·첫 갱신은 pooled −2.625/6.125µs로 잡음 안이지만 2회차의 −14.542/8.625µs가 범위를 넘어 실패했습니다. 두 행은 같은 실제 첫 쓰기 표본을 공유합니다. 표본을 교체하거나 재측정하여 통과시키지 않았습니다. 마운트·이후 갱신 및 나머지 배열 8행은 pooled와 세 회차 및 경계가 모두 통과합니다. 기존 array-100 BF·첫의 3.080× 미달과 소유자 수용(104라운드)을 포함한 판정·수용 표시는 유지합니다.

${arrayTable}

### 그 밖의 (가)가 바뀐 모든 행

기각된 정정의 0µs/통과를 비교 기준으로 하면 수치가 바뀌는 행은 ${summary.numericalChanges.length}개입니다. 배열 이외 ${summary.otherNumericalChanges.length}개 행을 아래에 전부 나열했습니다. 배열 이외 통과 여부가 바뀐 행은 없습니다. 전체 통과 여부 변경은 array-100/off/update와 array-100/off/update-first의 통과→실패 두 행뿐입니다. 수치가 그대로인 고유 행은 array-100/off/update-later입니다. 최초 111의 수치·통과 여부도 summary JSON의 각 행에 별도로 기록했습니다. 축 마운트 네 표시 행은 일반 마운트와 같은 관측을 공유합니다.

${otherTable}

### 정본 도구의 한 행 종단 검증

\`array-500/off/update\`에서 정본 reporter의 보정·bootstrap·validation 루프를 실행하여 \`CANONICAL_ROW_END_TO_END_OK\`를 확인했습니다. pooled 차이/잡음은 −1.043/5.291µs이며 세 회차와 독립 경계가 모두 통과합니다. old/new 최종 값 digest, 101표본, 20회 예열, 자연 종료, 공식 성능 source=sentinel도 함께 확인했습니다.

짝 빈 호출이 없던 원 도구에서는 \`check-paired-sentinel.mjs\`가 기대 sentinel 2회 대신 1회로 실패했습니다. 수정 후 1-pass·2-pass 짝 보정 회귀 검사와 중첩 FIFO self-check가 통과했습니다.

### 5ms 엔진 setImmediate 고장 주입

저장소 밖 scratch 복사본의 실제 \`write()\` 경로에서 새 엔진의 \`scheduleMacrotaskSafe\`로 5ms busy callback을 예약했습니다. 짝 빈 호출에는 예약하지 않았습니다. 별도 array-100 old/new fresh 6개 worker를 같은 세 회차·예열 20·101표본·순차·clock 밖 GC로 실행했습니다. scratch의 진단 단언만 주입 작업의 정상 실행을 허용했으며 공식 도구의 zero-macrotask 조건은 그대로입니다.

BF/첫 갱신의 pooled 차이 ${f(proof.checkA.differenceMs * 1000)}µs는 잡음 ${f(proof.checkA.noiseMs * 1000)}µs를 넘어 수치 검사 (가)가 실패했습니다. 회차별 차이/잡음은 ${proof.runs.map(run => f(run.differenceUs) + '/' + f(run.noiseUs) + 'µs').join(' · ')}이고 전부 실패입니다. 경계도 호출당 엔진 예약·실행 1회로 별도로 실패했습니다. 이후 갱신도 수치·경계 모두 실패합니다. 마운트에는 주입하지 않아 수치·경계가 통과합니다. \`INJECTED_CHECK_A_FAILED\`이며 이 표본은 공식 결과에 넣지 않았습니다.

### 재현·파일·범위 감사

- [요약 JSON](profile-113-paired/summary.json), [공식 manifest](profile-113-paired/manifest.json), [주입 요약](profile-113-paired/injected-summary.json), [주입 manifest](profile-113-paired/injected-manifest.json).
- \`yarn node packages/canard/schema-form/architecture/verification/07-switch/profile-113-paired/analyze-paired.mjs\`는 저장된 원자료로 정본 계산을 재현합니다. \`--injected --manifest=packages/canard/schema-form/architecture/verification/07-switch/profile-113-paired/injected-manifest.json\`은 5ms 실패를 다시 확인합니다.
- 번들은 메모리에서만 구성하며 source map은 쓰지 않았습니다. Node compile cache와 주입 복사본은 지정된 \`/private/tmp/claude-501/-Users-Vincent-Workspace-albatrion/c8aaf054-1ea7-43d3-b3c1-a4196f8407e1/scratchpad/bundles/profile-113-paired\`에만 있습니다. 원자료·기록·요약 파일은 각각 5MB 이내입니다.
- 제품 소스·설치·git 쓰기는 수행하지 않았습니다. releaseSources 전송 비교의 객체 키 순서 오류로 미저장·미사용된 worker 한 개를 감사 기록에 명시했습니다. 키 정렬 후 같은 worker를 재실행했고 다른 표본은 교체하지 않았습니다.
`;
console.log(markdown);
