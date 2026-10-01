# 05 통지와 검증 — 실행 구조 결정

이 문서는 05 실행 계획([execution-plan.md](execution-plan.md))이 정한 구조 결정을 계획 없이 읽히도록 적는다. 모듈 경계, 의존 방향, 공개 계약, 오래 남을 자리만 다룬다. 설계의 정본은 원장 `ledger/`이며 이 문서와 원장이 어긋나면 원장이 이긴다. 경로 약어는 `PKG` = `packages/canard/schema-form`, `P6`·`P7`·`P8` = 세 ajv 플러그인 패키지다. 31C-0n은 31라운드 편집자 기록(원장 질의 Q1–Q7의 답)이다.

## D1 새 fractal 둘의 자리 — `validation` < `settle` < `dispatch` < `SchemaNode`

- 맥락: 05는 루트 디스패처·진입 사슬·`onError` core 쪽과 검증기 계약·검증 실행을 들이며, 원장은 새 fractal `src/core/dispatch/`·`src/core/validation/`을 정했다(LANDING-084). 03의 순서는 `blueprint` < `record` < {`behaviors`, `navigation`} < `settle` < `SchemaNode`다(NODE-016). 정착은 `if` 게이트에서 검증기의 가드를 동기로 평가해야 하고(VALIDATE-015·044), 진입 사슬은 정착을 부른 뒤 통지·검증 요청·`onChange`를 잇는다(EVENT-027). 검증 결과의 배달은 dispatch가 validation에 넘기는 콜백이다(LANDING-084). 겉면의 쓰기 위임은 `dispatch` 진입으로 옮긴다(LANDING-064).
- 결정:
  - 순서는 `blueprint` < `record` < {`behaviors`, `navigation`} < `validation` < `settle` < `dispatch` < `SchemaNode`다.
  - `settle`은 `validation/index.ts`의 가드 읽기 하나만 가져온다. `validation`은 `settle`·`dispatch`·`SchemaNode`를 `import type`으로도 가져오지 않으며, 결과를 내보낼 때는 받은 콜백을 부른다.
  - `dispatch`는 `settle`·`validation`·`record`의 진입점을 가져온다. `SchemaNode`는 쓰기·명령·상태·검증·구독을 `dispatch`에, 읽기를 `settle`·`validation`·`navigation`에 한 문장으로 위임한다.
  - 두 fractal 모두 `__legacy__`·`app/plugin`을 가져오지 않고(LANDING-159, CONTROLS-075), React를 가져오지 않는다(GOAL-088). 경계 린트(`PKG/eslint.config.js`의 두 블록)와 `src/core/__tests__/dependencyDirection.test.ts`가 이 순서와 금지를 매 실행 단언한다.
- 까닭:
  - 가드 평가는 정착 안의 동기 호출이고 검증 실행은 커밋 뒤의 일이다. 가드 캐시와 전체 검증 함수는 같은 캐시 항목에 든다(VALIDATE-048). 그래서 두 일의 공통 소유자는 하나의 `validation`이며, 정착이 그것을 쓰려면 `validation`이 `settle` 아래에 있어야 한다.
  - 진입 사슬은 정착과 검증을 차례로 부르는 조율이다(NODE-010의 "여러 단계를 잇는 조율은 `dispatch`의 것"). 조율자가 아래 둘을 가져오면 되돌아가는 간선이 없다.
  - 결과 배달을 콜백으로 받으면 `validation` → `dispatch` 간선이 생기지 않는다(filid 경계 §6의 DAG).
- 버린 것:
  - `validation`을 `settle` 위에 두고 정착이 런타임 칸의 술어 표를 읽게 하는 것: 03의 `ifPredicates`와 같은 모양이 되어 시험이 그 칸을 채우는 주입 자리로 남는다(TEST-069 (나), 26C-01).
  - 검증 실행을 `dispatch` 안에 두는 것: 캐시 항목의 전체 검증 함수와 가드가 갈라지고, 결과 라우팅(청사진 조각 표를 읽음)이 조율자에 섞인다.
- 결과: `src/core/DETAIL.md`의 DAG 절, 두 fractal의 `INTENT.md`·`DETAIL.md`가 코드보다 먼저 든다(계획 U2, G3).

## D2 이벤트 비트 열거와 명령 열거는 `record/`가 소유하고, 새 이름으로 처음부터 만든다

- 맥락: 원장은 공개 이벤트 형의 이름을 `SchemaNodeEventType`으로 바꾸고(SURFACE-056, LANDING-158) 안쪽 코드도 같은 이름 하나를 쓴다(SURFACE-060). 새 이름의 공개 형은 새 엔진이 처음부터 쓰고 소비자 이주는 PR-7이며, 공개 형은 기제를 들이는 PR마다 자란다(`reviews/round-26-closing.md:16`). 명령 종류 값은 요청 비트의 별칭인 공개 TS 열거이고 이름은 `SchemaNodeRequestType` 꼴이다(EVENT-073 30라운드 보충, `reviews/round-30-owner-answers.md:8`). 비트를 쓰는 쪽은 넷이다: 커밋에서 비트를 표시하는 `settle`, 배달하는 `dispatch`, 오류 갱신을 내는 `validation`, 공개 형을 내보내는 `SchemaNode`. 오늘의 `src/core/types/event.ts`는 옛 엔진과 렌더 계층이 함께 쓴다.
- 결정:
  - 두 열거를 `PKG/src/core/record/`에 둔다(`SchemaNodeEventType.ts`, `SchemaNodeRequestType.ts`). `record/index.ts`가 이름으로 내보내고 `SchemaNode/index.ts`가 공개 형으로 다시 내보낸다.
  - 남는 비트는 옛 `NodeEventType`과 같은 자리 값을 쓴다. `RequestEmitChange`·`RequestInjection`은 두지 않고(LANDING-170) `UpdateJsonSchema`(EVENT-064)·`UpdateDiagnostics`(EVENT-043)를 더한다.
  - `SchemaNodeRequestType`의 멤버 `Focus`·`Select`·`Refresh`·`Remount`는 네 요청 비트의 값을 그대로 가진다.
  - 옛 `core/types/event.ts`와 그 소비자는 05에서 건드리지 않는다.
- 까닭:
  - 네 소비자의 가장 낮은 공통 조상은 `core`다. 그런데 fractal 뿌리에는 구현을 두지 않는다(filid 경계 §4). `record`는 네 소비자가 모두 의존하는 fractal이고, 비트는 레코드의 배달 표시와 비트별 원장(D3)의 형이다. 그래서 비트 열거는 `record`의 계약을 구현한다(filid 배치 §1).
  - 같은 자리 값을 쓰면 07의 이주가 비트 변환 없이 이름만 바꾼다.
- 버린 것:
  - `src/core/types/event.ts`의 옛 열거를 05에서 개명하는 것: 렌더 계층·레거시·공개 진입점까지 바뀌는 소비자 이주이며 PR-7이다(LANDING-158).
  - 열거를 `dispatch/`에 두는 것: `settle`이 비트를 표시하려면 `dispatch`를 가져와야 해 D1의 순서가 뒤집힌다.
  - 명령 종류를 문자열 리터럴 합집합으로 두는 것: 소유자가 기각했다(30라운드).
- 결과: `record/DETAIL.md`가 두 열거와 비트 표를 먼저 적는다. 07의 이주는 옛 열거를 지우고 소비자를 이 열거로 옮긴다.

## D3 배달 집합은 커밋이 표시하고, 비트별 원장은 레코드 필드, 대기열·오류는 런타임 칸

- 맥락: 노드는 이번 정착의 비트 마스크·비트별 페이로드·`revision` 원장만 들고 일정을 잡지 않는다(EVENT-004). `revision`은 커밋 때 배달 집합 전체를 한 번에 올리고(EVENT-007), `revision(mask)`는 리스너 유무와 무관한 단조 카운터로 `useSyncExternalStore` 스냅숏이 된다(EVENT-001, REACT-006). 겉면 멤버 `revision`은 원장이 유지하는 이름이다(`reviews/raw-round17-node-structure.md:136`). 그런데 03의 레코드 필드 `revision: number`(커밋마다 바뀐 노드 +1, `settle/utils/commit/commitSettlement.ts:48`)가 같은 이름이다. 노드마다 할당과 루트 전용 필드는 금지되고(NODE-004, 26C-06), 트리 전체 자료는 런타임 칸이다. 06이 병렬로 레코드에 칸을 더한다.
- 결정:
  - 정착의 커밋이 `record/`의 표시 함수로 노드마다 이번 비트와 페이로드를 런타임 배달 표에 합친다(값·경로·자식 형상·계산 상태·유효 스키마·상호작용 상태·Refresh 대상·활성 변화, 루트의 진단). `dispatch`는 그 표를 문서 순서로 한 번 순회해 배달한다.
  - 레코드 필드 `revision`을 비트별 배달 원장 필드(가칭 `revisionLedger`)로 바꾼다. 생성자는 공유 동결 빈 상수를 대입하고 첫 배달에서 노드의 원장을 할당한다. 커밋이 배달 집합의 해당 비트를 한 번에 올린다. 겉면 `revision(mask?)`는 비트들의 합을 읽는 dispatch 함수에 위임한다.
  - 진입 깊이·예산·정착 밖 사건 대기열·보고기·검증기·검증 모드·`onChange`·`onStateChange`·전달 중 깃발·경고 키 집합·검증 스탬프·노드 오류(검증 결과와 외부 오류)는 `SchemaNodeRuntime`의 칸이다. 노드 오류는 레코드 필드가 아니라 런타임 맵에 둔다.
  - `settle`은 커밋 뒤 자기 호출 끝에서 던지는 03의 계약을 유지하고, `dispatch`가 그 예외를 잡아 사슬 끝까지 모은다.
- 까닭:
  - 무엇이 바뀌었는지는 커밋이 이미 안다(`changedNodes`, 유효 스키마 원본 표, `refreshTargets`). 표시를 커밋에 두면 배달 집합을 다시 계산하지 않는다.
  - 원장을 필드로 두면 `revision(mask)`(렌더마다 불리는 스냅숏)가 단형 필드 읽기다. 필드 개수는 03과 같다.
  - 오류를 런타임 맵에 두면 오류가 없는 노드에 비용이 없고, 06과 레코드 필드 배치에서 부딪히지 않는다.
  - settle의 throw를 그대로 두면 03·04 정착 시험의 계약이 바뀌지 않는다.
- 버린 것:
  - 레코드 필드 `revision`을 두고 겉면 이름을 바꾸는 것: 원장이 유지한 겉면 이름(`revision`)과 훅의 호출(`node.revision(tracking)`)을 어긴다.
  - 원장을 런타임 `WeakMap<노드, 원장>`에 두는 것: 렌더마다 조회가 든다.
  - dispatch가 커밋 뒤 트리를 비교해 배달 집합을 만드는 것: 정착 범위 밖 순회가 생긴다(SETTLE-017).
- 결과: `record/DETAIL.md`(필드 개명·칸·대가), `settle/DETAIL.md`(커밋의 표시)를 먼저 고친다. 03·04 시험의 `node.revision` 단언 8파일이 메서드 호출로 바뀐다.

## D4 진입 사슬은 `dispatch`의 동사별 진입 파일이 소유하고, 정착 밖 사건도 같은 디스패처가 배달한다

- 맥락: 진입 사슬의 소유는 `dispatch`(쓰기 동사마다 진입 함수)다(LANDING-064·084). 진입은 공개 쓰기 호출이고 읽기·`subscribe`·상태 칸 쓰기·명령은 진입이 아니다(EVENT-027). 상태·외부 오류·명령은 정착을 거치지 않지만 같은 루트 디스패처가 같은 비트 공간으로 배달한다(EVENT-045·067, 31C-01). 맥락 변경 통로 `setContext`(04)는 정착을 일으키고 커밋한다.
- 결정:
  - `PKG/src/core/dispatch/utils/entry/`에 동사마다 파일 하나: `dispatchSetValue`, `dispatchResetSubtree`, `dispatchResetForm`, `dispatchMount`, `dispatchBatch`, `dispatchContextChange`, `dispatchValidate`, `dispatchSetState`, `dispatchSetSubtreeState`, `dispatchClearSubtreeState`, `dispatchSetExternalErrors`, `dispatchClearExternalErrors`, `dispatchRequest`. 진입이 아닌 동사(상태·외부 오류·명령)도 같은 자리에 둔다.
  - 진입 사슬의 공용 부분(깊이, 파동, 예산, 사슬 끝)은 `dispatch/utils/chain/`, 기록 전달은 `dispatch/utils/report/`, 읽기(`subscribe`·`revision`)는 `dispatch/utils/read/`다.
  - 정착 밖 사건: 깊이 > 0이면 노드마다 비트를 합쳐 대기하고 깊이가 0이 될 때 한 번, 깊이 0이면 호출 안에서 동기로 배달한다. 검증 요청과 `onChange`를 내지 않는다.
  - `setContext`는 `dispatchContextChange`에 위임한다.
  - 재생성 reset의 사슬 넘김은 `dispatch`가 이름 붙여 내보내는 함수이고, 부르는 쪽은 07의 폼 수준 재생성이다(EVENT-030).
- 까닭: 동사와 파일의 1:1이 `dispatch`가 무게 중심이 되는 것을 막는다(`reviews/raw-round17-node-structure.md` §6 규칙 7, `request.md:50`). 사건마다 같은 디스패처를 거치면 "최외곽 진입 끝에 한 번"과 "노드마다 비트를 합침"을 한 곳에서 지킨다.
- 버린 것: 명령이 자기 진입을 여는 것(31C-01이 정정 — 진입은 공개 쓰기뿐). 상태·명령을 노드가 바로 리스너에 보내는 것(노드는 일정을 잡지 않음, EVENT-004).
- 결과: `SchemaNode`의 `setValue`·`resetSubtree`가 settle 대신 dispatch 진입에 위임한다. 06의 배열 동사도 같은 자리의 진입 파일을 거친다(계획 O2).

## D5 `onError`의 core 쪽 — 코드 표와 기록 형은 `src/errors/`, 보고기는 트리 생성 인자, 전달 규칙은 `dispatch`

- 맥락: PR-4는 기록 형 `FormErrorRecord`·코드 형 `FormErrorCode`, core가 인자로 받는 보고기(`report`, `hasConsumer`), 사슬 끝 기록마다 전달, 핸들러 예외 규칙, 전달 중 쓰기 거부, 경고 구조 키를 넣는다(ERROR-032). 코드 목록은 공개 계약이고 이름으로 내보내며(ERROR-031), 렌더 계층 코드(`RENDER_FAILED` 등)까지 한 표다(ERROR-164). 오류 코드 상수는 코드 표의 순서를 따르고 문서 주석에 level·부류·언제를 적는다(`request.md:50`). 03·04는 정착 코드를 `settle/utils/errors/settleErrorCode.ts`에 두었다.
- 결정:
  - 코드 표 상수와 형 셋(`FormErrorRecord`, `FormErrorCode`, `FormErrorReporter`)을 기존 fractal `PKG/src/errors/`에 둔다. `settleErrorCode.ts`는 표의 상수를 이름으로 가져와 쓴다.
  - 보고기는 트리 생성 인자로 받아 런타임 칸에 둔다. core는 사건마다 `hasConsumer()`를 먼저 묻는다.
  - 기록 만들기·사슬 끝 전달·묶음(`SchemaFormError` `MULTIPLE_ERRORS`)·주인 없는 싱크·전달 중 쓰기 거부·경고 구조 키는 `dispatch/utils/report/`가 한다. `src/errors/`에는 데이터만 둔다(그 fractal의 INTENT "비즈니스 로직 금지").
  - 시험이 원장 `error.md`의 표를 파일로 읽어 상수 목록·순서·level을 기계 대조한다.
- 까닭: 코드 표는 패키지 전체의 공개 계약이라 core 안의 fractal 하나가 소유하면 렌더 계층 코드가 core에 들어온다. `src/errors/`는 이미 오류 클래스의 소유자이고 core가 가져오는 자리다. 전달은 사슬 끝의 순서 규칙이라 진입 사슬의 소유자에 둔다.
- 버린 것: 코드 표를 `dispatch/`에 두는 것(렌더·청사진 코드까지 core 조율자에 묶임). 정착 코드를 `settleErrorCode.ts`에만 두는 것(표가 두 곳으로 갈라져 기계 대조가 불가능).
- 결과: `src/errors/DETAIL.md`가 표와 순서 규칙을 먼저 적는다. 코드 이름의 확정 목록은 `log.md`와 PR 본문이 기록하고 원장 관리자가 보충을 단다(31C-05). 코드 표 문서는 08이다.

## D6 검증기 계약 형은 `validation/`이 선언하고, `src/types`와 `app/plugin`이 그것을 쓴다

- 맥락: 계약 형은 하나(가칭 `Validator`: `compile`, `compileGuard`, 선택 `release`, 선택 방언, 에러 정규화)이고 플러그인은 `bind?`만 더한다(VALIDATE-044). 검증 결과 형은 `ValidationIssue`로 개명하며 PR-4에 든다(ERROR-032, LANDING-024·070). core의 형 파일은 React를 가져오지 않는다(GOAL-088). 오늘의 `src/types/error.ts`는 React 형을 끄는 `./jsonSchema`를 가져오고, 플러그인 셋은 공개 진입점에서 형을 가져온다.
- 결정:
  - `Validator`, `GuardFunction`, `ValidateFunction`, `ValidationIssue`를 `PKG/src/core/validation/type.ts`에 선언한다(스키마 매개변수는 청사진의 React 없는 스키마 형, 메서드 문법이라 플러그인이 공개 `JSONSchema`로 구현해도 맞음).
  - `src/types/error.ts`는 세 이름을 다시 내보내고, 옛 `PublicJSONSchemaError`는 `ValidationIssue`로 바뀐다. 공개 `src/index.ts`는 `ValidationIssue`를 내보내고 인터페이스 별칭 `JSONSchemaError`를 뺀다. 레거시 전용 안쪽 `JSONSchemaError`(`key` 칸)는 레거시 삭제까지 남아 `ValidationIssue`를 확장한다.
  - `app/plugin/type.ts`의 `ValidatorPlugin`은 `Validator & { bind?(instance: unknown): void }`다.
  - 공개 Form·`FormProvider` 속성 `validatorFactory`의 형 전환은 바인딩의 선택과 함께 07에 둔다(계획 I14, O1 대기).
- 까닭: 계약 형을 소비하는 쪽(core의 검증)이 React 없이 선언할 수 있는 자리는 core 안이다. 한 선언을 여러 경로로 다시 내보내면 별칭 없이 한 이름이다(SURFACE-060의 원칙과 같음).
- 버린 것: 형을 `src/types`에 두고 core가 가져오는 것(React 형이 core 형 그래프에 들어옴). 형을 `app/plugin`에 두는 것(core가 `app/plugin`을 가져오게 됨, CONTROLS-075).
- 결과: 플러그인 셋은 `ValidationIssue`·`ValidatorPlugin`을 공개 진입점에서 가져온다. 공개 형의 개명은 PR 본문의 이주 목록에 든다(문서는 08).

## D7 가드 캐시·검증 실행·수명은 `validation/`이 소유하고, 바인딩이 부를 수명 함수는 `core/index.ts`가 이름으로 내보낸다

- 맥락: 사본과 가드 캐시는 core가 (검증기 인스턴스, 작성 루트 정체)마다 들고 같은 항목에 전체 검증 함수를 둔다(VALIDATE-018·048). 프로덕션은 늦게, 개발 모드는 캐시 항목마다 한 번 모든 가드를 컴파일한다(ERROR-041, Q5 답). 수명은 살아 있는 트리의 참조 세기와 인스턴스마다 크기 8의 최근 해제 목록이고, 해제는 밀려날 때와 같은 `$id` 재등록 직전에만 `release(root)`를 부른다(VALIDATE-021·045). 증감은 커밋 이펙트와 그 정리에서 일어나며 그 이펙트는 07의 렌더 계층이다. core만 쓰는 호스트는 검증기를 인자로 넘긴다(CONTROLS-075).
- 결정:
  - `validation/utils/cache/`가 검증기 인스턴스마다 `WeakMap<작성 루트, 항목>`을 든다. 항목은 사본, 가드 표(작성 위치 키), 전체 검증 함수 또는 그 실패다. 실패도 캐시에 남고 소비하는 트리마다 자기 기록을 낸다.
  - 정착은 `validation`의 가드 읽기를 부른다. 검증기가 없으면 `if` 조각은 꺼지고 경고를 트리마다 한 번 낸다.
  - 수명 함수 `retainValidationRoot`·`releaseValidationRoot`(가칭)를 `validation/index.ts`가 내보내고 `src/core/index.ts`가 이름으로 다시 내보낸다. 07의 바인딩 이펙트가 부르며 05는 함수와 시험까지다.
  - 검증 실행은 최외곽 진입마다 요청 한 번, 마이크로태스크 합치기, 최신 커밋 번호만 실행, 스탬프가 최신일 때만 dispatch의 콜백으로 결과 파동을 낸다(EVENT-046, VALIDATE-049).
- 까닭: 캐시·가드·전체 검증·수명은 같은 항목의 생애라 한 fractal이 소유해야 해제가 캐시를 정확히 지운다. 증감 함수를 core가 내보내면 07은 부르는 자리만 더한다.
- 버린 것: 플러그인이 가드 캐시를 드는 것(VALIDATE-019가 core에 둠). `FinalizationRegistry`로 해제하는 것(VALIDATE-021이 기본 경로에서 뺌). 트리 생성이 참조 세기를 올리는 것(커밋되지 않은 렌더의 루트가 목록에 남아야 함, VALIDATE-021).
- 결과: `validation/DETAIL.md`가 캐시 단위·수명·시점을 먼저 적는다. `src/core/DETAIL.md`의 진입점 표면 절에 두 이름이 든다. 공개 `src/index.ts`는 07까지 이 이름을 내보내지 않는다.

## D8 레거시 `ValidationManager`의 플러그인 폴백은 바인딩 계층으로 옮긴다

- 맥락: core가 레거시 `ValidationManager` → `app/plugin`의 `PluginManager`를 거쳐 React 구성 요소 모듈을 가져오는 import를 05에서 분리한다(LANDING-064의 착수 전 칸, REACT-002). 레거시 코드는 09까지 보존하고 동작을 지킨다(LANDING-205). 오늘 순서는 Form 속성 > `FormProvider` > 등록 플러그인이고(`RootNodeContextProvider.tsx:94`, `ValidationManager.ts:203`), 레거시 시험에서 플러그인을 등록하는 자리는 렌더 하네스(`src/__tests__/renderForm.tsx`)뿐이다.
- 결정: `ValidationManager.ts`에서 `PluginManager` import와 `:203`의 폴백을 지우고, `providers/RootNodeContext/RootNodeContextProvider.tsx`가 `(schema) => factory?.(schema) || PluginManager.validator?.compile(schema)`를 만들어 넘긴다.
- 까닭: 고르는 일은 바인딩 계층의 것이다(VALIDATE-044 (2), CONTROLS-075). 같은 식을 같은 시점에 만들므로 레거시 `<Form>`의 동작은 같다.
- 버린 것: `src/core/nodeFromJSONSchema.ts`에서 조합하는 것(core가 `app/plugin`을 가져옴).
- 결과: core만 쓰는 호스트는 등록 플러그인으로 떨어지지 않고 인자로 넘겨야 한다. 원장이 정한 바뀜이며 PR 본문의 이주 메모에 든다.

## D9 ajv 플러그인 — 루트 등록 하나를 `compile`과 `compileGuard`가 공유하고, 같은 `$id`는 같은 설정의 다른 인스턴스로 떼어 둔다

- 맥락: 세 플러그인은 모듈 전역 인스턴스 하나와 `$async: true` 감쌈의 `compile`만 가진다. 가드는 등록한 사본 루트 안의 위치로 주소를 잡고(`addSchema(root)` 뒤 `{ $ref: 'root#/…' }` 컴파일), 루트 등록은 플러그인의 검증기 인스턴스가 든다(VALIDATE-017·019). 같은 `$id`의 살아 있는 두 루트는 저마다 판정하며, 떼어 두기는 플러그인 계약이고 한 인스턴스가 둘을 못 들면 같은 설정의 다른 인스턴스에 등록한다(VALIDATE-046). 가드 인스턴스는 `allErrors: false`, 다른 설정은 같다(VALIDATE-033). `bind`는 값을 바꾸는 옵션을 거부한다(VALIDATE-050).
- 결정:
  - 패키지마다 `src/validator/utils/registerSchemaRoot.ts`가 루트마다 `addSchema`를 한 번(고유 키) 하고, 같은 `$id`가 이미 살아 있으면 같은 설정의 다른 인스턴스에 등록한다. `compile`과 `compileGuard`는 이 등록을 공유하고, `release(root)`가 `removeSchema(key)`와 컴파일 결과를 지운다.
  - `bind`는 `assertBindableInstance`(ajv7·8은 `opts`, ajv6은 `_opts`)를 먼저 부르고, 거부면 던지고 앞 인스턴스를 남긴다. 던지는 오류는 플러그인 안의 클래스이며 `code`가 `UNHANDLED_ERROR.VALIDATOR_BIND_REFUSED`다(계획 I19, O3 대기).
  - ajv8의 세 진입점 기본 설정에 `allowUnionTypes: true`를 더한다(VALIDATE-051).
  - 루트 `dataPath`는 `''`, 정규화된 에러에 `rejectedKey`(FRAGMENT-020·053).
- 까닭: 한 루트를 두 번 등록하면 같은 `$id` 충돌이 생기므로 등록은 하나여야 한다. 같은 설정의 인스턴스로 떼어 두면 core가 `$id`를 고치지 않는다(VALIDATE-046).
- 버린 것: core가 `$id`를 바꿔 등록하는 것(VALIDATE-046이 금함). `compile`이 사본을 따로 컴파일하는 것(등록과 충돌).
- 결과: `bind` 인스턴스의 복제가 사용자 정의 키워드까지 같음을 보장하지 못하면 VALIDATE-046의 실패 줄대로 소유자에게 올린다. 플러그인 계약 게이트 넷은 각 패키지의 시험이다.

## D10 시험 대역은 공개 계약 인자로만 — 술어 칸을 없애고, 차등 시험의 오라클은 ajv가 아닌 구현

- 맥락: PR-2의 시험 대역은 `if` 게이트 술어 하나였고(`runtime.ifPredicates`, `src/core/__tests__/ifPredicate.ts`), PR-4가 같은 시나리오를 실제 가드로 다시 돌리며 시험만을 위한 주입 자리를 만들지 않는다(TEST-069 (나)). 던지는 대역으로 가드 평가 실패를 시험한다. 차등 시험의 독립 검증기는 폼이 쓰는 플러그인과 다른 구현이어야 한다(TEST-001, 31C-04). `PKG`는 개발 의존 `ajv` 8을 갖고, 저장소에는 ajv 아닌 구현이 없다. 플러그인 패키지는 공개 진입점만 가져올 수 있고 그것은 07까지 옛 엔진이다.
- 결정:
  - `runtime.ifPredicates`를 레코드 계약에서 지운다. core 시험은 `Validator` 계약을 구현한 시험용 검증기(`PKG/src/core/__tests__/fixtures/createTestValidator.ts`, ajv 8)를 트리 생성 인자로 넘긴다. 던지는 가드·boolean 아닌 가드도 같은 계약의 변형이다.
  - 차등 시험은 `@cfworker/json-schema`를 오라클로 두 자리에 둔다: core 시나리오(새 엔진 `validate()`의 판정, 시험용 검증기)와 플러그인 패키지마다(그 플러그인의 판정). 개발 의존 추가는 소유자 확인 뒤다.
- 까닭: 공개 계약의 인자는 사용자도 쓰는 자리라 시험만을 위한 주입 자리가 아니다. 두 자리의 차등은 각각 "폼의 판정 파이프라인"과 "플러그인의 판정"을 독립 구현에 견준다.
- 버린 것: 같은 major의 새 Ajv를 오라클로 쓰는 것(31C-04가 기각, 덧붙인 회귀 검사로만 허용). core 시험이 플러그인 패키지를 가져오는 것(작업 공간 순환 의존과 설치가 필요).
- 결과: 03·04의 술어 사례는 같은 뜻의 `if` 스키마로 옮겨지고 기대값은 그대로다. 어긋나는 사례는 TEST-069 (나)가 찾으려던 차이이므로 원장과 대조해 기록한다.
