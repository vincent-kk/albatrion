// CLI report generation formats audited statistics without changing product or measurement bytes.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const directory = path.dirname(fileURLToPath(import.meta.url));
const read = name => JSON.parse(fs.readFileSync(path.join(directory, name + '.json'), 'utf8'));
const audit = read('audit');
const f = number => number.toFixed(6);
const label = row => row.name + ' ' + ({ mount: '마운트', first: '첫 갱신', later: '후속 갱신' }[row.mode]);
const table = rows => [
  '| 행 | 기준 pooled ms | H−W pooled ms | 99% 구간 ms | A/A 통계 ms | 기준 0.5% ms | 판정 |',
  '| --- | ---: | ---: | --- | ---: | ---: | --- |',
  ...rows.map(row => `| ${label(row)} | ${f(row.baseMedianMs)} | ${f(row.pooledMedianMs)} | [${row.ci99Ms.map(f).join(', ')}] | ${f(row.aaMedianMs)} | ${f(row.floorMs)} | ${row.verdict} |`),
].join('\n');
const aa = read('summary-AA');
const chunks = [
  '## 106라운드 작은 마운트 손질',
  '**1 게이트 읽기와 3 빈 조각은 채택, 2 단일 선택과 4 첫 배달 counter는 기각입니다.** 시작 HEAD `552a975abd8afa6ef914e218832bd8bfddf03d5b`의 stage-07 작업 트리에서 A/A → 1 → 2 → 3 → 4를 한 세션에 순차 실행했습니다. 최종 제품은 HEAD+1+3이며 기각 항목의 코드·문서·시험은 각각의 측정 기준과 바이트 단위로 같게 복원했습니다. 정착 설계·공개 계약 확장은 없으며 STOP은 없습니다.',
  '각 행은 fresh-process 9회, 예열 20회·표본 101쌍으로 909개 H−W 짝 차이를 pooled했습니다. 표본마다 H/W 순서 교대, 회차 시작 순서 교대, clock 밖 강제 GC·schema 복제·첫 갱신 fresh root·후속 갱신 retained root를 유지했습니다. clock은 operation부터 64 Promise checkpoint와 setImmediate sentinel 안까지입니다. validation off·빈 onChange·리스너 없음이며 계수 시험은 시간 번들과 분리했습니다. 전후 empty drain의 공통 중앙값 보정은 짝 차이에서 상쇄됩니다.',
  '기존 104/95C-01 deterministic bootstrap(seed 101, 1,999회, 정렬된 중앙값의 0-based 9·1989)을 그대로 재사용했습니다. 양수는 후보가 빠른 쪽입니다. 개선은 99% 하한 > 0이고 중앙값 > 같은 행의 부호 있는 A/A 통계입니다. 회귀는 99% 상한 < 0이고 |중앙값| > max(|A/A 통계|, 해당 후보의 현재 기준 pooled 중앙값×0.005)를 모두 만족할 때입니다. 개선 행이 하나 이상이고 회귀 행이 없으면 채택했습니다. 표시만 소수 6자리이고 판정은 원값으로 했으며 회차·표본 제외나 사후 재측정은 없습니다.',
  '### A/A 대조 — HEAD 대 HEAD 아홉 회',
  'HEAD/control은 독립 module instance이며 소스 및 실행 번들 SHA-256이 같습니다(`c1a7e8b1ac5bce44cfad02ba791152dc5dc89b95f03e3954cf9f14aea5c1dab8`). 아래 A/A 통계는 이후 네 후보에 고정했습니다.',
  table(aa.rows),
];
const definitions = [
  { stage: '1-gate-reads', title: '1 — 게이트 읽기: 채택', base: 'HEAD', site: 'settle/utils/gates/evaluateGate.ts',
    cost: '같은 순서의 고정 길이 classic loop로 dependencies.map만 바꿨습니다. 속도 비용은 O(의존 수) 읽기와 기존 경로 해석·식 호출이며 callback 호출을 제거합니다. 메모리 비용은 기존 길이 입력 배열 하나를 유지하고 평가별 callback closure를 제거합니다. 새 보유 색인·캐시·노드 칸은 없습니다.',
    tests: '수정 전 `1-red-scoped`는 map 12회 때문에 실패했고 `1-green`은 map 0회, projected read 24회·식 평가 12회를 유지하며 통과했습니다. gate differential/shadow·읽기/선택 순서·반복 throw·static-first differential을 포함한 7파일 52개가 통과했습니다.',
    judgment: 'nested 마운트가 A/A 통계를 넘는 양수 구간입니다. oneOf-40 첫 갱신의 음수 중앙값 0.006000 ms는 기준 0.5% 0.006959 ms보다 작아 회귀가 아닙니다. 회귀 0행으로 채택했습니다. 게이트 없는 행의 종단 변화도 요청된 판정에 포함하며 그 값을 게이트 callback 자체의 회수 시간으로 귀속하지 않습니다.', patch: '1-gate-reads.patch' },
  { stage: '2-selection', title: '2 — 단일 ID 목록 재사용: 기각', base: 'HEAD+1', site: 'settle/utils/compute/selectChildren.ts',
    cost: '성공한 단일 declaration edge에서 기존 STATIC_IDS의 불변 ID 목록만 재사용했습니다. 활성 선언 배열·다중 선언 경로와 gate/flush/throw 순서를 유지했습니다. 속도 비용은 O(1) 자격 검사·첫 ID 구성·기존 평가이며 반복 ID 배열 생성·push를 제거합니다. 메모리 비용은 기존 약한 색인에 entry당 ID 한 목록을 보유하는 대신 반복 임시 ID 배열을 제거합니다. 별도 색인·노드 칸은 없습니다.',
    tests: '`2-red-valid`는 ID 목록 참조 4개 때문에 실패했습니다. `2-green-valid`에서 1개·해당 Map.set 1회로 줄었고 식 평가 8회는 같았습니다. 관련 differential/shadow·순서·throw·static-first 7파일 52개가 통과했습니다.',
    judgment: 'sample-0·nested 후속 갱신은 개선이지만 oneOf-40 후속 갱신이 −0.007500 ms [−0.010917, −0.003583]이고 회귀 바닥 max(0.005583, 0.004568)=0.005583 ms를 초과했습니다. 회귀 한 행으로 기각했습니다. 코드·DETAIL·신규 시험을 `base-2-files.json`과 동일하게 복원했습니다. `rejected-2-selection.patch`는 기각 근거 보존용이며 채택 패치가 아닙니다.' },
  { stage: '3-empty-fragments', title: '3 — 빈 조각 keyword loop 생략: 채택', base: 'HEAD+1 (2 완전 복원)', site: 'blueprint/utils/analyze/collectDeclarations.ts',
    cost: 'control·type 검사, capability·ID·fragment·소유자·discriminator 기록 뒤 조각 확장 키가 없는 경우에만 반환합니다. 속도 비용은 O(1) 고정 검사로 5개 keyword 반복과 배열 모양 검사 3회를 제거합니다. 메모리 비용은 적격 호출의 visiting 복사 배열을 제거하고 기존 declaration·fragment·소속 배열을 유지합니다. 새 보유 색인·캐시는 없습니다.',
    tests: '`3-red`에서 빈 선언의 keyword 배열 검사 3회로 실패했고 `3-green`·`3-green-production`에서는 0회로 통과했습니다. 59-schema fixture의 collect off/on 118개 비교를 개발·운영 모드 각각 실행해 그래프·유효 schema·키/자식 순서·오류·진단·capability·작성 schema 불변을 확인했습니다. 원본 fixture는 갱신하지 않았습니다.',
    judgment: '마운트 네 행과 sample-0·nested 후속 갱신이 개선이며 회귀는 0행입니다. nested 0.882750 ms [0.838084, 0.919084], flat 0.246417 ms [0.238083, 0.256042]로 채택했습니다.', patch: '3-empty-fragments.patch' },
  { stage: '4-first-delivery', title: '4 — 첫 mask counter 직접 초기화: 기각', base: 'HEAD+1+3', site: 'record/utils/SchemaNodeRevisionLedger.ts',
    cost: 'EMPTY previous와 정확한 UpdateValue|RequestRefresh 첫 mask만 새 private literal로 초기화하고 다른 mask·후속 previous는 기존 루프를 유지했습니다. 속도 비용은 O(1) mask 검사로 두 bit 탐색·증가를 제거합니다. 메모리 비용은 기존 배열·원장 하나를 유지하되 14개 슬롯 중 hole 12개를 명시적 undefined로 바꿉니다. 원장별 배열 소유·새 참조·직접 bit getter의 undefined·후속 증가·unknown bit 처리는 같습니다.',
    tests: '`4-red`는 첫 원장 8개의 bit index 계산 16회로 실패했고 `4-green`에서 0회가 됐습니다. 일반 후속 mask의 계산 2회·17개 bit 읽기·이전 원장 불변을 확인했습니다. revision·배달·settle differential/shadow를 포함한 27파일 209개가 통과했습니다.',
    judgment: '개선 행이 없고 nested 마운트 −0.158249 ms [−0.215708, −0.089791]가 회귀 바닥 0.059416 ms를 초과했습니다. sample-0 첫 갱신 −0.000917 ms [−0.001667, −0.000208]도 바닥 0.000415 ms를 초과합니다. 두 회귀로 기각하고 코드·DETAIL·신규 시험을 `base-4-files.json`과 동일하게 복원했습니다. `rejected-4-first-delivery.patch`는 기각 근거 보존용입니다.' },
];
for (const item of definitions) {
  const summary = read('summary-' + item.stage);
  chunks.push('### ' + item.title, `측정 기준: **${item.base}**. 변경 위치: \`src/core/${item.site}\`.`,
    table(summary.rows), item.judgment, item.cost, item.tests);
  if (item.patch) {
    const patch = audit.patches.find(row => row.name === item.patch);
    chunks.push(`독립 채택 패치: [${item.patch}](profile-106-batch/${item.patch}). 측정 당시 기준에 메모리에서 독립 적용해 현재 파일과 바이트가 같음을 확인했습니다. 포함 파일(PKG 기준):\n\n` +
      patch.files.map(file => '- `' + file.replace('packages/canard/schema-form/', '') + '`').join('\n'));
  }
}
chunks.push('### 최종 검증과 실행 감사',
  '| package cwd 검증 명령 | 결과 | 자연 종료 ms |\n| --- | --- | ---: |\n' +
  '| `npx vitest run --project unit --project render --project react18 --reporter=dot` | 3,247 통과·1 todo, 허용 EVENT-070만 4실패 | 300433 |\n' +
  '| `NODE_ENV=production npx vitest run --project production --reporter=dot` | 6파일·16개 통과 | 6028 |\n' +
  '| `npx tsc --noEmit --composite false --rootDir . -p tsconfig.json` | exit 0 | 8131 |\n' +
  '| `npx eslint "src/**/*.{ts,tsx}"` | exit 0 | 5493 |\n' +
  '| `node architecture/verification/07-switch/tools/check-legacy-isolation.mjs` | LEGACY_ISOLATED, 1,649파일 | 423 |',
  'Vitest 명령에는 설치 방지 `--no-install`·offline env, `--configLoader runner --cache false --maxWorkers=1 --no-file-parallelism`을 추가했습니다. 기존 `.vite` 심볼릭 링크가 지정 외부 bundles 하위로 향함을 확인했으며 cacheDir는 설정하지 않았습니다. 운영 명령의 자식 환경에 NODE_ENV=production을 명시했습니다. EVENT-070 실패는 `Form.effectFeedback.test.tsx`의 useLayoutEffect·useEffect 두 사례가 render·react18 각각에서 발생한 것뿐입니다.',
  '개발 전체 검증은 context-mode RPC의 300초 응답 대기에 걸렸지만 실제 명령은 300.433초에 signal 없이 자연 종료했고 저장된 로그·종료 JSON으로 확인했습니다. 재실행하지 않았습니다. 처음 두 A/A 행의 Bun 실행기 18회는 `invalid-bun/`에 전체 행 단위로 격리한 뒤 Node로 다시 실행했습니다. 그 외 회차 재선택은 없고 공식 판정은 Node의 450 worker입니다. `ps` 조회는 sandbox에서 거부됐으며 종료 기록으로 확인했습니다. 기존 utils/__tests__에 파일을 추가할 때 나온 organ 경고는 새 디렉터리 생성에 관한 일반 경고였고 실제로는 기존 시험 디렉터리를 사용했습니다. 기각 원복 후 해당 파일도 없습니다.',
  `환경: ${audit.environment.node}, V8 ${audit.environment.v8}, ${audit.environment.platform}/${audit.environment.arch}, ${audit.environment.cpu}. 판정 worker ${audit.audit.workers}개·45,450쌍, 행 명령 ${audit.audit.rowCommands}개를 순차 실행했으며 빌드·시험과의 겹침도 없습니다. worker 최대 ${audit.audit.maximumWorkerMs} ms, 행 최대 ${audit.audit.maximumRowMs} ms, 기록된 명령 최대 ${audit.audit.maximumRecordedCommandMs} ms로 480,000 ms 미만입니다. clock 내부 GC ${audit.audit.gcInside}회입니다. 개별 산출물 최대 ${audit.audit.artifactMaxBytes} bytes이며 모든 파일은 5 MB 이하입니다.`,
  '번들·소스맵·optimizer cache는 `/private/tmp/claude-501/-Users-Vincent-Workspace-albatrion/c8aaf054-1ea7-43d3-b3c1-a4196f8407e1/scratchpad/bundles` 아래에만 있습니다. git 쓰기·설치·버전 변경은 실행하지 않았고 HEAD는 동일합니다. 각 후보의 실행 번들 입력은 해당 위치 한 파일만 기준과 달랐습니다. 기준 2·3은 후보 1, 기준 4는 후보 3과 소스·번들 해시가 같습니다. 최종 runtime 소스는 후보 3의 측정 바이트와 같습니다.',
  '근거는 `profile-106-batch/summary-{AA,1-gate-reads,2-selection,3-empty-fragments,4-first-delivery}.json`, `audit.json`, `check-*.json`·`.txt`, `build-*.json`, `base-*-files.json`, 개별 `*-forced-*.json` 및 `driver-*.json`입니다. 채택 패치 1·3은 각각 DETAIL·구현·새 계수 시험 세 파일만 포함하고 측정 산출물과 이 종합 보고서는 포함하지 않습니다. 패치 적용 시 새 계수 시험의 수정 전 실패·수정 후 통과와 관련 differential 결과는 이 보고서를 함께 확인하십시오.',
);
const output = chunks.join('\n\n') + '\n';
assert(Buffer.byteLength(output) < 5_000_000);
fs.writeFileSync(path.join(directory, 'section.md'), output);
console.log(JSON.stringify({ path: path.join(directory, 'section.md'), bytes: Buffer.byteLength(output), rows: 50 }));
