# 설계 최적화 — 정착 계산 단계와 캐시 계층 — 개발요청서

> 원장 정본: 단계의 자리와 가지는 LANDING-211, 설계 방향은 NODE-060, 청사진 캐시는 BLUEPRINT-052, 게이트 입력 메모는 BLUEPRINT-053, 캐시 계층과 공개 API는 SURFACE-063, 단계 구성과 판정 관문은 TEST-080, 에이전트 배정은 PROCESS-069다. 게이트와 선은 TEST-027·TEST-072·TEST-073, 원칙은 TEST-029·GOAL-011·GOAL-029·GOAL-050, 비용의 상한은 SETTLE-017·SETTLE-047, 금지된 최적화는 SETTLE-044, 노드 계약은 NODE-043·NODE-044·VALUE-031이다. 성능 최적화 작업의 측정 원칙·채택 규칙·정상동작 증거(`../../verification/perf-optimization/README.md` 2절)는 그대로 물려받는다. 어긋나면 원장이 이긴다.

## 우산 안의 자리

- 8단계(검토와 성능) 뒤, 9단계(정리와 릴리스) 앞의 단계다(LANDING-211). 소유자가 8단계 뒤 코어 설계 수정을 명시적으로 허용했고(`../../reviews/round-446-owner-answers.md:11`), 이후 작업을 위임했다(같은 문서 12행). 9단계의 범위는 바뀌지 않으며 9단계 자체에는 코어 로직 수정이 없다.
- 가지는 `feat/schema-form-design-optimization`이고, 최종 PR #445가 병합되지 않았으므로 8단계 가지 `feat/schema-form-08-review-and-perf`의 끝 `6692e7f69` 위에 쌓는다. 이 단계의 PR은 그 가지를 base로 열고, #445가 `1.0.0-beta`로 병합되면 base를 `1.0.0-beta`로 옮긴다. 단계 루트 PR의 병합은 소유자 몫이고 그 밖의 PR 병합은 코디네이터 재량이다(운영 원칙 1·2).
- 가설이나 작업 하나에 PR 하나, DETAIL 커밋이 코드와 시험보다 먼저, 네 관문·전후 배달 비교 차이 0·수정 전에 실패하는 새 시험·다른 모델 가족의 독립 검토 뒤 병합(운영 원칙 3·11). 커밋 작성자는 Vincent Kelvin이고 공동 저자·세션 ID 줄은 넣지 않는다(운영 원칙 23).
- 출발점은 446라운드의 진단(`../../reviews/round-446-closing.md` 446C-02)과 CPU 프로파일(`../../verification/design-optimization/profile-446.md`)이다.

## 목적

공개 동작은 바꾸지 않고(`FormHandle.rebuild` 추가만 예외) 정착의 계산 단계와 나감 모델, 캐시 계층을 설계 수준에서 고쳐, 분기 전환·일괄 입력·마운트의 옛 판 대비 격차를 줄인다. 근거는 세 자료의 교차다.

- **최종 측정(443b, 0.16.1 대 `a63db97c2`, 코어 Node 26 production):** 마운트 oneOf-80 +344 %, nested-d6-f4 +119 %; 분기 전환 oneOf-80 +288 %(0.059 → 0.228 ms); 일괄 입력 nested-d6-f4 +254 %(2.94 → 10.44 ms); 단일 입력 flat은 −66~−93 %(`../../verification/perf-optimization/README.md` 1절).
- **CPU 프로파일(446라운드):** 분기 전환은 노드 3개만 건드리는데 정착 1회에 29 KiB를 할당하고 비용이 약 230개 함수에 평평하게 퍼져 있다(가장 큰 함수가 10 %). 형제 1,000개 호스트의 판별자 한 번은 형제 전부를 다시 고르며 형제 수에 선형이다(0.13 → 8 → 41 ms). 게이트 있는 폼의 잎 쓰기는 `preserveReferences`의 깊은 비교가 46 %다. 마운트는 청사진 포함 시 청사진이 43 %이고, 구독이 없어도 노드마다 배달 표식 2회·할당 3.8 KB다. 일괄 쓰기는 자식당 호출 68회·할당 4.5 KB의 상수다.
- **교차검토(codex·antigravity·claude opus)와 코드 감사:** 설계 수준 원인 다섯(446C-02)은 셋이 확인했고, "공개 노드 객체를 유지하는 노드 수명 분리"는 NODE-044와 `detached.test.ts:291`에 어긋나 기각, "내부 슬롯 유지와 수명별 공개 핸들"로 고쳐 설계 Ⅱ로 두었다. 첫 단계는 셋이 같은 곳을 가리켰다: 게이트 호스트의 정적 형제를 다시 고르지 않는 것.

두 종류를 가른다.

1. **계약을 어긴 비용(GOAL-011 위반) — 반드시 고친다.** 형제 N에 선형인 분기 전환(`selectChildren.ts:53`의 전역 `hasGates` 가드, `staticShape.ts:46`의 호스트 전체 거절), 게이트 있는 폼의 잎 쓰기에서 호스트 전체의 깊은 비교(`preserveReferences.ts:28-31`), 폼 어디든 잠복 값이 하나라도 있으면 모든 스칼라 쓰기가 빠른 경로를 잃는 것(`writeFieldNode.ts:59`).
2. **정착 1회의 고정 비용과 노드당 상수 — 설계로 줄인다.** 커밋의 여섯 집합 순회와 Set·revision 원장 할당, 정착마다의 유효 스키마 재선택·병합, 의존 색인 등록, 문서 순서 정렬의 비교당 배열 할당, 나감 때의 잠복 저장소 직렬화와 재진입 때의 노드 재생성, 청사진 재분석.

## 하지 않는 것

- 직전 커밋의 활성 집합에서 출발하는 정착(SETTLE-044). 설계 Ⅱ의 비활성 슬롯을 "직전 형상"으로 쓰는 것도 같다.
- 게이트 읽기 경로의 역색인(BLUEPRINT-007). 게이트 입력 메모(BLUEPRINT-053)는 허용이며 둘은 다르다.
- 공개 노드 객체를 재진입 때 되살리는 것(NODE-044). 설계 Ⅱ는 핸들을 새로 발급한다.
- 시험 기대값의 변경. 어떤 PR에서든 시험 파일의 변경은 추가만 허용한다. 기존 단언을 고쳐야 통과한다면 사양 변경이므로 멈추고 소유자에게 묻는다(운영 원칙 12).
- `FormHandle.rebuild` 밖의 공개 겉면 변경. 청사진 캐시의 전체 폐기와 `CacheManager.reset()`은 공개하지 않는다.
- 측정하지 않은 개선 주장(TEST-029). 가설의 소실험은 폐기할 작업 트리에서만 한다.
- 정착 단계의 순서 변경(SETTLE-001), 아이템 노드의 지연 실체화(NODE-053), 청사진의 직렬화 키.

## 단계 구성 (TEST-080)

### D0 측정 장치의 복원과 기준선, 결함 재현

8단계 최종 측정(443b)의 47행 장치는 소실되었다(`../../verification/perf-optimization/README.md` 3절). 같은 프로세스에서 0.16.1과 새 판을 AB/BA로 번갈아 재는 코어 장치를 `../../verification/design-optimization/tools/`에 다시 만든다.

| 산출 | 내용 |
| --- | --- |
| 코어 쌍 장치 | canonical 행 여덟 — 마운트 oneOf-80·flat-1000·nested-d6-f4, 단일 입력 flat-1000·nested-d6-f4, 분기 전환 oneOf-80, 일괄 입력 flat-2000·nested-d6-f4. 픽스처 생성기는 `benchmark-form`의 `src/fixtures/scale-schemas.ts`와 `fixtures/equivalent/`를 따르고, 443b의 정의(oneOf는 판별자 왕복 2회, flat·nested는 잎 10회, 일괄은 루트 `setValue`로 모든 잎)를 지킨다. 프로세스마다 20회 예열 + 100표본, 세 실행 최소값의 중앙값, 폭은 최소값의 범위, Node 26 production, `dist/index.node.mjs` 대 npm `@canard/schema-form@0.16.1`의 `dist/index.mjs` |
| 탐침 | 형제 0·100·1,000·4,000의 분기 전환, 게이트 있는 폼과 없는 폼의 잎 쓰기(형제 250·1k·4k·8k), 청사진 포함 마운트(1k·2.5k·5k·10k) |
| 프로파일 도구 | `profile-446.md` 7절의 스크립트(prepare·run·analyze·tables·phases·callers·compare·count·heap·scale·leaf)를 세션 폴더에서 `tools/`로 옮기고, 저장소 밖 복사본의 맨 import를 다시 푸는 `hooks.mjs`를 포함 |
| 기준선 | 단계 시작 커밋에서 세 속도 표(마운트·단일 입력·setValue 일괄, 운영 원칙 20)와 React 표(`benchmark-form --equivalent --mode=render`)를 조용한 창에서 잰다. 표는 `../../verification/design-optimization/baseline.md`, 원본은 git 밖 실행 디렉터리(`/private/tmp/claude-501/perf-runs/<실행 ID>/`, 성능 최적화 계획의 규칙) |
| 결함 재현 시험(446C-07) | (가) 배열 splice 뒤 분리된 참조의 `setValue`가 옛 인덱스의 잠복 원본에 쓰이는지 — 게이트 필드가 있는 객체 배열에서 아이템 2의 필드를 나가게 하고 참조를 들고 `remove(0)` 뒤 `ref.setValue('x')`, 아이템 1·2의 필드를 다시 들이고 어느 아이템이 'x'를 받는지; (나) `routeValidationIssues.ts:40-45`가 나간 노드의 선언 id로 꺼진 union 분기의 이슈를 거르는지. 재현되면 이 단계의 수정 PR, 아니면 회귀 신호로 남긴다 |

### D1 국소 설계 수정 여섯 — 가설마다 PR 하나

| 가설 | 지우는 비효율 | 바꾸는 곳 | 끝났다는 것 |
| --- | --- | --- | --- |
| H1 호스트별 정적 분할 | 게이트 있는 폼에서 호스트의 정적 형제까지 매 정착 다시 고르는 것 | 청사진에 호스트별 `{ gated, staticEntries, readers }` 사이드카(`StaticFirstLoadCapability`와 같은 모양, D3의 `getHostDerived` 슬롯), `selectChildren.ts:53`의 전역 가드를 호스트 판정으로, `staticShape.ts:46`이 자식 하나의 게이트로 호스트 전체를 거절하는 것을 엔트리 단위로, `primeHost.ts:53-113`·`selectEntryStep.ts:276`에서 일치하는 정적 자식의 병합·등록·변경 캡처 생략 | 형제 0·1,000·4,000의 분기 전환이 작은 상수 배 안(선형항 제거). 처음에는 기존 인스턴스·경로·스키마가 일치하고 입력 분배·이동·virtual·동명 후보가 없는 경우로 제한한다. 고정 출발점의 정적 부분만 재사용하므로 SETTLE-044를 지킨다 |
| H2 깊은 비교 생략 | 바퀴가 돌지 않은 경로에서 `updateOutput.ts:72`가 이미 한 같음 비교를 `preserveReferences.ts:28-31`이 호스트 전체에 다시 하는 것 | `computeNode.ts:119-153`의 바퀴 없는 경로 | 게이트 있는 폼의 잎 쓰기가 없는 폼의 두 배 안. shadow 검증 뒤 적용 |
| H3 문서 순서 인덱스 | `compareDocumentOrder.ts:16-23`가 비교마다 조상 배열 둘을 할당하는 것 | 파동마다 한 번 계산하는 순서 인덱스(고정 정수가 아니라 파동별 캐시 — 순서가 부모의 현재 children에 의존한다) | 일괄 쓰기의 배달 팬아웃 비중 감소, 비교당 할당 0 |
| H4 잠복 조건의 범위 축소 | `writeFieldNode.ts:59`의 `latentRaw.size === 0`이 폼 전체의 스칼라 빠른 경로를 끄는 것 | 조건을 "대상 경로 아래에 잠복 값 없음"으로 | 잠복 값이 다른 하위 트리에 있을 때 스칼라 쓰기가 빠른 경로를 탐 |
| H5 배달 후보 큐 | 커밋이 후보 집합 여섯의 합집합을 돌고 Set과 revision 원장 객체를 새로 만드는 것 | `captureFieldNodeChange.ts:62`에 후보 큐를 붙이고 `markCommitDeliveries.ts`는 그 목록만 순회; 리스너 없는 노드는 payload를 만들지 않되 revision 비트 계수는 유지(공개 API `revision()`); 원장 객체는 재사용 | 마운트·일괄 쓰기의 배달 표식 비중 감소, 전후 배달 비교 차이 0 |
| H6 청사진 캐시 연결 | 같은 스키마 객체의 재마운트·StrictMode 이중 마운트·여러 폼에서 청사진을 다시 분석하는 것 | D3의 `src/app/cache` 청사진 도메인을 `createRootLoad.ts`가 `buildFieldNodeTree` props의 `cache`로 넘김; `BlueprintCacheEntry`가 경고 목록을 보관해 소비자마다 재생; `FormHandle.rebuild(option?)` | 같은 스키마 객체의 둘째 마운트에서 청사진 몫이 사라지고 경고는 받으며, `rebuild` 뒤 새 청사진 |

### D2 설계 Ⅰ — 호스트별 컴파일 계획과 2단계 정착

- **계획:** 청사진이 호스트마다 (a) 정적 엔트리(게이트도, 게이트 조각의 overlay도, relocated gate도 없음), (b) 동적 엔트리와 그 게이트, (c) 독자 집합("이 노드를 읽는 게이트·파생·watch")을 계산해 `getHostDerived`에 둔다. `if` 게이트는 호스트 전체를 읽으므로(`evaluateGate.ts:47-51`) 루트 `if` 폼에서는 (c)의 "독자 없는 잎" 단계가 쓸모없음을 안다; 판별자는 키 하나만 읽고(67-83) `active` 식은 의존이 명시된다(139-153).
- **정착:** 형상 단계는 더럽혀진 독자 호스트에서 동적 엔트리만 바퀴를 돌리고, 게이트 입력은 요청이 올 때 투영한다(`pendingOutputs`·`readProjectedValue`의 일반화). 값 단계는 부모 포인터를 따라 한 번 상향 조립하고 배달 후보는 H5의 큐에 넣는다. 한 바퀴 안에서 뒤 게이트가 앞 게이트의 투영을 즉시 본다는 계약(`../../design/03-settle-and-events.md:120`)과 상속 overlay(124)를 그대로 지킨다. 전역 capability 플래그(`hasGates`·`branchless`·`hasDerive`)는 호스트별 판정으로 바뀐다.
- **게이트 입력 메모(BLUEPRINT-053):** 게이트마다 마지막 입력(투영 참조·extras·context·존재)을 기억해 같으면 술어를 부르지 않는다. 던진 평가는 메모하지 않는다. 넣을지는 벤치가 정한다.
- **끝났다는 것:** 3노드 분기 전환과 일괄 쓰기의 전후 비율이 폭 (다) 밖으로 개선되고, verify·shadow 모드가 기준 경로와의 동등성을 보이며, 즉시 반영 계약의 반례가 0이다.

### D3 캐시 계층 (SURFACE-063)

| 묶음 | 내용 |
| --- | --- |
| `src/app/cache` fractal | `app/plugin`과 같은 모양: `INTENT.md`·`DETAIL.md`·`index.ts`·`type.ts`, `utils/CacheManager.ts`(static singleton, `reset()`), `utils/createCacheDomain.ts`(WeakMap 기반 도메인 — `resolve(key, build)` 멱등, 값 불변과 개발 모드 freeze, `invalidate(key)`·`clear()`는 항목 제거만, 생성 세대 번호), `utils/blueprintCacheDomain.ts`(스키마 객체 → 술어 identity별 항목 목록, 경고 목록 보관과 재생). 소비처는 Form 바인딩뿐이고 core는 app을 import하지 않는다(`src/core/INTENT.md`) |
| 엔진 파생 레코드 둘 | `getBlueprintDerived(blueprint)`(파생 규칙 표, 기능 색인, 수렴 대상, 정적 첫 로드 자격, 게이트 예산 색인, 게이트 식, 종료 정책 식, 의존 색인, 컨텍스트 소유자, 가상 참조 색인, 순환 여부, 상대 간격, 독립 잎 기본값, 분할 소유자 준비 — 14 슬롯)와 `getHostDerived(blueprintNode)`(감시 경로, 파생 자식 위치, 선언 이름, 선언 id, 객체 자식, 읽기 계획, 정적 게이트 목록, 선택 표, 직접 선택 계획, 정적 모양, 정적 id, 허용 간선 스키마, 정적 객체 항목, 아이템 항목, 배열 자식 선언, 기본 유효 스키마, 유효 스키마 메모 — 17 슬롯), 지연 계산. WeakMap 31개가 2개가 되고 조회는 프로퍼티 접근이다 |
| 값·노드 키 메모 | 전이하는 값 객체를 키로 쓰는 것(`assembleObject`·`assembleArray`의 `STABLE_SHAPES` 둘, `objectKeyCounts`, `omitTrailingArray`의 `TRIMMED`, `staticSpec`의 둘)은 모듈 범위에 두되 이름을 갈라 한 파일에 모은다. 살아 있는 노드를 키로 쓰는 것(`getCommittedDeclarationKey`의 `KEYS`, `getGateBudgetCap`의 `HOST_CAPS`, `watchValuesMemo`, `detachedReads`)은 런타임 레코드 필드로 옮긴다 |
| 모드 플래그 | `gateSelectionTable.mode`·`gateWheelEvaluation.mode`를 한 파일의 `engineModes`로 합치고 `setMode()`가 파생 레코드를 비운다. 모드를 바꾸는 벤치 fixture(`__benchmarks__/fixtures/observationIdentity/prepare.mjs:141`)는 복원까지 책임진다 |
| 공개 API | `FormHandle.rebuild(option?)`: 이 폼의 스키마 항목을 폐기한 뒤 `reset(option)`과 같이 트리를 다시 만든다. 공개 이름 추가라 `dist/index.d.ts` 대조와 `publicSurface.test.ts` 스냅숏 갱신이 따르고 LANDING 이주 항목으로 기록한다 |
| 인벤토리 | 프로세스 전역 가변 상태 약 55개의 목록과 자리(도메인·레코드·모듈 메모·런타임 필드)를 `src/app/cache/DETAIL.md`에 둔다 |

### D4 판정 관문

D0와 같은 장치·같은 창에서 세 속도 표와 React 표를 다시 잰다. **분기 전환 oneOf-80 행과 일괄 입력 nested-d6-f4 행이 0.16.1의 1.5배 안에 들고 절대 시간이 각각 1 ms와 5 ms 아래이면** D5 없이 단계를 닫고 9단계로 간다. 하나라도 넘으면 D5로 간다. 수치는 소유자가 뒤집을 수 있다(대기열 64). 그 밖의 느린 행은 TEST-027대로 이유와 수치를 적어 소유자가 수용한다.

### D5 설계 Ⅱ — 슬롯 테이블과 수명별 핸들 (조건부)

- (호스트 슬롯, 엔트리) 쌍을 내부 식별자로 두고 raw·extras·parent·전순서를 슬롯이 든다. 슬롯은 비활성일 때도 자기 raw를 들어 `latentRaw`·`latentRawMetadata`·`pendingExits`·`revived`·잠복 재분배가 사라진다. 한 번도 생기지 않은 자리는 분배할 때 슬롯만 싸게 만든다(값이 이끄는 지연 생성; 스키마에서 미리 전부 만드는 것은 재귀 템플릿에서 무한이라 금지). 공개 `FieldNode`는 수명마다 발급하는 핸들이라 NODE-044가 유지된다. 더티 집합은 노드가 생긴 뒤의 식별자에 한해 참조로 바뀐다 — 게이트 읽기·의존 표식·changedRaw는 아직 없는 노드를 가리켜야 하므로 경로 키로 남는다.
- 다시 정의할 것(코드 감사 19행 표): 잠복 값과 `inactiveValues`의 읽기 경로, 나감 정책(`unsetOnInactive`는 슬롯 raw 비우기, 정책 상속은 평면 경로 목록 대신 트리 걷기), 재활성화는 `entered`에 넣어 채움과 `resetInteraction`을 받음, 전체 교체 쓰기는 비활성 슬롯 걷기로 V에 없는 경로의 raw를 지움, 같은 이름·다른 종류는 청사진 노드별 슬롯, 중첩 게이트는 비활성 동안 평가하지 않고 재활성화 때 하위 호스트를 모두 형상 더티로, 배열 아이템의 소멸(perished)은 그대로, `.detached`를 읽는 82곳을 "비활성"과 "파괴됨"으로 가름, 메모리 상한은 호스트당 K·M.
- **끝났다는 것:** 여섯 의미 시험(`verification.md`)이 초록이고, 다른 키 분기 전환과 일괄 쓰기가 폭 (다) 밖으로 개선되며, 메모리 상한이 적힌다.

## 부딪히는 코드 · 그대로 쓰는 것 · 새 fractal

| 부딪히는 코드 | 그대로 쓰는 것 | 새 fractal |
| --- | --- | --- |
| `src/core/engine/settle/utils/compute/childSelection/{selectChildren,selectEntryStep,staticShape,getDirectChildSelectionPlan}.ts`, `compute/{computeNode,primeHost,preserveReferences}.ts`, `settle/utils/write/writeFieldNode.ts`, `settle/utils/commit/{markCommitDeliveries,commitSettlement}.ts`, `record/utils/captureFieldNodeChange.ts`, `write/utils/chain/{deliverWave,utils/compareDocumentOrder}.ts`, `blueprint/{blueprint,types/blueprint}.ts`와 청사진 사이드카 자리, `settle/utils/gates/{evaluateGate,gateSelectionTable,gateWheelEvaluation}.ts`, 캐시 인벤토리의 WeakMap 31개 파일, `providers/RootNodeContext/utils/createRootLoad.ts`, `core/surface/utils/binding/buildFieldNodeTree.ts`, `components/Form/components/FormCore/types/handle.ts`(D5: `settle/utils/{latentStore,latent,transition,detached}/*`, `arrangeFieldNodeItems/*`) | 공개 겉면 전부(`rebuild` 추가 제외), 시험 전부, `bench/legacy-compare/*.bench.ts`와 `src/**/__benchmarks__/*.bench.ts`의 기존 행, `verification/perf-optimization/first-batch/` 러너 | `src/app/cache`(D3). 측정 도구는 `verification/design-optimization/tools/`에 두며 제품 코드가 아니다 |

## 레거시 (LANDING-205)

없다. 레거시 삭제는 09다. `src/__legacy__`는 0.16.x 비교의 참고일 뿐이고 측정은 npm 공개판 0.16.1 번들로 한다.

## 착수 전 확인

- 8단계 가지 끝 `6692e7f69`이 작업 트리와 같고 깨끗하다. #445는 열려 있고 병합은 소유자 몫이다.
- `benchmark-form`에 0.16.1 별칭(`@canard/schema-form_0.16.1`)과 `--equivalent` 모드가 있다(443b가 썼다).
- 446라운드 원장 항목 일곱이 들어가 있고 검사가 기준값과 같다.

## 산출물과 완료 기준

- [ ] D0: `verification/design-optimization/tools/`(코어 쌍 장치·탐침·프로파일 도구), `baseline.md`(단계 시작 판의 세 표와 React 표, 실행 ID), 결함 재현 시험 둘의 결과
- [ ] D1: H1~H6의 PR(각각 가설·예측·측정·비용이 적힌 본문, 수정 전에 실패하는 시험, 전후 배달 비교 차이 0, 독립 검토 판정 파일). 폐기한 가설은 수치와 함께 기록
- [ ] D2: 설계 Ⅰ의 DETAIL(비용 모델·불변식)과 PR, verify·shadow 동등성, 즉시 반영 반례 0
- [ ] D3: `src/app/cache` fractal과 파생 레코드 둘, `engineModes`, 인벤토리 목록, `FormHandle.rebuild`
- [ ] 결함 후보 둘: 수정 PR 또는 회귀 신호
- [ ] D4: 세 표와 React 표의 재측정, 관문 판정, 남은 느린 행의 이유·수치·소유자 수용
- [ ] (조건부) D5: 설계 Ⅱ의 DETAIL과 PR, 여섯 의미 시험, 메모리 상한
- [ ] 단계 루트 PR(가지 → base)의 본문에 세 표·React 표·바뀐 설계·공개 겉면 차분(`rebuild`)·원장 라운드 링크, 소유자 병합 대기
- [ ] `verification.md`의 게이트 전부 통과

## 절차 (seiri·filid, PROCESS-067)

- seiri: D1·D2·D3는 "동작 보존 리팩터"이며 특성화 시험(기존 시험 전체)과 전후 배달 비교가 오라클이다. 새 시험은 바뀐 규칙 한 문장과 호출 수 상한을 고정한다. 한 파일 한 함수, 보조 함수는 한 층 아래로.
- filid: 바꾼 fractal의 `DETAIL.md`에 비용 모델과 불변식을 코드보다 먼저 적는다. 새 fractal `src/app/cache`는 `INTENT.md`(공개 경계: 소비처는 바인딩, core는 import하지 않음)와 `DETAIL.md`(도메인 계약, 인벤토리)가 먼저다. 스캔은 PR 경계에서 한 번.
- 에이전트(PROCESS-069): 구현·게이트·측정·PR은 codex gpt-6.1-sol high(Orca `worker-start --spec`), 독립 검토는 antigravity gemini-3.8-flash-high(D4 종합은 argon), 원장 마감·단발 문서는 cursor, 읽기·검증 보조는 Claude 하위 에이전트, 설계·판단·원장·커밋은 오케스트레이터. 동시 워커는 둘까지, 전체 시험과 측정은 한 번에 하나만(운영 원칙 24). 모든 브리프에 "run-use와 코디네이터 명령 금지, check는 --terminal로"와 한도 중지 규칙을 적는다.

## 원장 항목 색인

- BLUEPRINT-007 게이트가 읽는 것은 뽑지 않는다 — 전부 다시 평가, 건너뛰기가 필요한 경우와 남는 최적화
- BLUEPRINT-052 청사진 캐시 — 스키마 객체 identity와 술어 identity, 경고 재생, 재생성 유지의 대체
- BLUEPRINT-053 게이트 입력 메모의 허용
- GOAL-011 G6 정밀한 고속 제어 — 비용은 변경에 비례한다
- GOAL-029 P3 형상은 상태의 순수 함수
- GOAL-050 다섯 가치 — 고속성
- LANDING-204 우산 `1.0.0-beta`와 개발 PR 여섯
- LANDING-205 `src/__legacy__/`의 보존과 삭제 시점
- LANDING-211 설계 최적화 단계
- NODE-043 탐색은 형상에 있는 노드만
- NODE-044 형상을 떠난 노드는 떼어진다
- NODE-053 아이템 노드는 모두 실체화한다
- NODE-060 설계 최적화의 방향
- PROCESS-067 개발 PR마다 계획서 셋
- PROCESS-069 설계 최적화 단계의 에이전트 배정
- SETTLE-017 비용의 상한(G6)
- SETTLE-044 직전 커밋의 활성 집합에서 출발하는 최적화는 채택하지 않는다
- SETTLE-047 트리 전체 순회의 예산
- SURFACE-063 캐시 계층과 `FormHandle.rebuild`
- TEST-027 벤치 게이트
- TEST-029 원칙(G6)
- TEST-072 '일정 수준'은 같은 실행에서 옛 판에 견주어 잰다
- TEST-073 예산의 수치는 기존 `guard:check`
- TEST-080 설계 최적화 단계의 구성과 판정 관문
- VALUE-031 잠복 원본의 수명과 비활성 경로에 닿는 쓰기
