# 04 파생 + 상태 키·제어 — 실행 구조 결정

이 문서는 04 실행 계획([execution-plan.md](execution-plan.md))이 정한 구조 결정을 계획 없이 읽히도록 적는다. 모듈 경계, 의존 방향, 계약의 소유, 오래 남을 자리만 다룬다. 설계의 정본은 원장 `ledger/`이며, 이 문서와 원장이 어긋나면 원장이 이긴다. 경로 약어는 `PKG` = `packages/canard/schema-form`이다.

## D1 derive는 판정하고, settle의 라운드 실행기가 쓴다

- 맥락: 파생 단계는 완성된 트리에서 `controls.derived`·`controls.injectTo`·`controls.unsetValue`를 평가하고 대상마다 하나를 적용하며, 쓰기가 나오면 표시와 계산으로 돌아간다(SETTLE-004). 새 fractal `PKG/src/core/settle/derive/`는 `settle`의 자식이다(LANDING-083). 쓰기 적용(`markWrite`), 재계산 목록 등록, 계산(`computeNode`), 원본 B(`restoreSourceB`)는 이미 `settle`의 organ(`utils/write`·`utils/compute`·`utils/transition`)에 있다.
- 결정:
  - `settle/derive`는 판정만 한다: 규칙 발생의 에지를 보고, 식을 평가하거나 `injectTo`를 부르고, 같은 대상 규칙으로 대상마다 승자를 고르며, 진 쓰기의 에지를 소비하고, 개발 모드 기록 항목을 낸다. 원본을 쓰지 않는다.
  - 새 organ `settle/utils/derivation/`의 라운드 실행기가 그 판정을 받아 자동 쓰기로 적용하고, 재계산 목록 등록 → 계산을 다시 부르며, 파생 라운드를 센다. 상한 상수 `DERIVE_ROUND_CAP`(25)은 derive의 진입점이 이름으로 내보낸다.
  - 실행기는 정착의 두 자리에서 불린다: 첫 계산 뒤(호스트 바퀴 예산 검사 뒤)와 전이 루프의 재계산 뒤.
  - 의존은 한 방향이다: `settle`의 organ → `settle/derive/index.ts`. derive는 `settle/type.ts`, `settle/index.ts`, `utils/write`·`utils/transition`·`utils/commit`·`utils/derivation`을 `import type`으로도 가져오지 않는다. derive가 가져오는 `settle` 안의 파일은 순수 organ 셋(`utils/compute/sameValue.ts`, `utils/paths/resolveDependencyPath.ts`, `utils/controls/`의 층 해석)뿐이다. `src/core/__tests__/dependencyDirection.test.ts`가 이 규칙을 매 실행 단언한다.
- 까닭:
  - 효과를 가장자리 한 곳에 둔다(seiri function-boundaries §2). 판정 함수는 트리를 받아 결과를 돌려주므로 시험이 쓰기 기제 없이 순위·에지를 단언할 수 있다.
  - derive가 쓰기 organ을 가져오면 `utils/write` → derive → `utils/write`의 디렉토리 순환이 생긴다(filid 경계 §6, NODE-045는 `import type`도 센다). 판정과 적용을 가르면 순환 없이 `settle`이 derive를 소비한다.
  - 자식 fractal이 소유 fractal의 organ 파일을 직접 가져오는 것은 소유 하위 트리 안이므로 허용된다(filid 경계 §5). 순수 organ으로 한정해 형 수준 순환도 막는다.
- 버린 것:
  - 라운드 루프를 derive 안에 두는 것: derive가 `markWrite`·`computeNode`를 가져와야 하고 위의 순환이 생긴다.
  - 파생을 새 fractal 없이 `settle/utils/`의 organ으로 두는 것: LANDING-083이 fractal을 정했고, 파생 규칙은 계약(순위 표·기준점 규칙)을 가진 단위다(filid 배치 §1).
  - derive가 `SettlementContext`를 직접 받는 것: `settle/type.ts`가 derive의 형을 가져오면 형 수준 순환이 된다. derive는 자기 입력 형을 `derive/type.ts`에 정하고, `SettlementContext`가 그 칸을 담는다.
- 결과: `settle/DETAIL.md`의 단계 순서가 "표시 → 계산 → 파생(쓰기가 나오면 표시로) → 전이(쓰기가 나오면 표시로) → 커밋"이 된다. 파생 라운드는 한 정착 전체에서 누적해 센다(SETTLE-017).

## D2 규칙 표는 derive가 청사진에서 만들고, 청사진은 바뀌지 않는다

- 맥락: 청사진은 문자열 식을 `BlueprintExpression { declarationId, schemaPath, hostPath, key, dependencies, evaluate }`로 컴파일해 `Blueprint.expressions`에 두고(`blueprint/utils/analyze/compileBlueprintExpressions.ts`), `controls.injectTo`는 함수인지 검사만 한다. `controls.derived`의 의존 집합은 식이 정적으로 읽는 경로와 그 노드 모든 선언의 `controls.watch`의 합집합이다(SETTLE-043 (라)). `injectTo`의 대상은 실행해야 안다(CONTROLS-079).
- 결정: 청사진 계약에 칸을 더하지 않는다. derive가 청사진마다 한 번 규칙 발생 템플릿 표(선언 ID, 종류, 층, 조각 전순서, 식 기록 또는 `injectTo` 함수, `watch` 경로)를 만들어 청사진을 키로 하는 약한 맵에 둔다. 규칙이 없는 청사진은 빈 표 하나를 공유하고, 그 청사진의 쓰기는 파생 단계를 건너뛴다. 식은 `BlueprintExpression.evaluate(dependencies)`(`createDynamicFunction`의 의존 주입 형태, LANDING-083)로, `injectTo`는 선언 스키마의 함수를 `(value, ctx)`로 부른다.
- 까닭: 필요한 정적 자료(식 기록, 선언, 조각 표, 역의존 표)가 이미 청사진에 있다. 03의 `getDependencyIndex`·`getGateRegistry`가 같은 방식(청사진별 약한 맵)으로 정착 소유의 색인을 만든다. 청사진을 고치지 않으면 청사진 시험과 `blueprint/DETAIL.md`가 그대로다.
- 버린 것: `Blueprint`에 `rules` 칸을 더하는 것. 청사진의 정적 계약을 늘리지만 새 정보는 없고, 청사진 DETAIL·시험·캐시 키를 함께 바꿔야 한다. `injectTo`를 청사진에서 감싸 컴파일하는 것: 함수 형태 하나이고 문자열 식 형태가 없다(CONTROLS-079).
- 결과: 청사진 fractal의 문서와 코드는 04에서 바뀌지 않는다. 규칙 표의 모양은 `settle/derive/DETAIL.md`가 소유한다.

## D3 에지의 기준점과 나감 정책의 식 값은 트리 런타임의 칸에 둔다

- 맥락: 에지는 규칙마다 기준점과 지금 값을 견준다. 정착이 시작될 때의 기준점은 직전 커밋의 값이다(SETTLE-028·048, 18C-102). `unsetValue`·`resetInteraction`의 기준점은 식 값이고, `unsetOnInactive`의 식 값은 그 노드가 형상에 있던 마지막 커밋의 것을 나감에서 쓴다. 나가는 순간 새로 평가하지 않는다(WRITE-038). 트리 전체 자료의 저장 자리는 `SchemaNodeRuntime`의 칸이며 `record/`가 선언한다(26C-06).
- 결정: `SchemaNodeRuntime`에 커밋된 규칙 값의 칸(가칭 `committedRuleValues`)을 둔다. 키는 규칙 발생(규칙 템플릿과 발생 경로·종류)이고, 값은 `injectTo` 원천의 방출 값, `derived`의 의존 값 튜플, `unsetValue`·`resetInteraction`·`unsetOnInactive`의 식 값이다. 던진 `unsetOnInactive` 식은 "유지"로 적는다(ERROR-122·WRITE-031의 28C-05 보충). 커밋이 이번 정착에서 평가한 발생만 고쳐 쓴다. 로드는 그 범위의 항목을 지우고(발화), 나간 노드의 항목은 커밋에서 지운다(재탄생은 거짓→참). 정착 안에서 소비한 값은 정착 문맥의 작업 칸에 둔다(재발화 금지).
- 까닭:
  - 03의 `committedDeclarationIds`(직전 커밋의 선언 집합으로 나감 정책을 정함)와 같은 종류의 "작업의 기록"이다. 상태 둘(`raw`·`extras`)의 순수 함수라는 성질을 바꾸지 않는다(SETTLE-010, GOAL-083 "이력은 방아쇠로만").
  - 식 값을 저장해 두면 나감에서 형상 밖 노드를 평가하지 않는다는 문장을 그대로 지킨다.
  - 비용은 규칙을 가진 발생 수에 비례한다. 규칙 없는 노드에는 아무것도 붙지 않는다.
- 버린 것:
  - 정착 시작 때 루트 방출 값의 참조를 잡아 경로를 다시 읽는 것만으로 기준점을 만드는 것. 경로 값(`injectTo`·`derived`)에는 되지만 식 값의 기준점은 직전 트리에서 식을 다시 평가해야 하며, `unsetOnInactive`에서는 WRITE-038의 "새로 평가하지 않는다"와 어긋난다.
  - 노드마다 레코드 필드로 두는 것: 규칙 없는 노드에도 칸이 생기고 한 노드에 규칙이 여럿일 수 있다.
- 결과: `record/DETAIL.md`가 칸과 그 대가를 먼저 적는다(NODE-045). 레코드에 루트 전용 필드는 두지 않는다(26C-06).

## D4 상태 키 결과는 레코드 필드이며, 겉면 게터 다섯이 한 문장으로 읽는다

- 맥락: 계산의 끝, 최종 트리에서 `controls.visible`·`controls.readOnly`·`controls.disabled`·표준 `readOnly`를 한 번 정한다(SETTLE-003). 겉면 계산 게터 `visible`·`enabled`·`readOnly`·`disabled`·`watchValues`는 PR-6에서 DETAIL 목록·멤버 목록 시험·공개 형과 함께 든다(26C-01, LANDING-066·CONTROLS-032의 28C-07 보충). 03은 노드 게이트의 결과를 레코드 필드 `active`에 두고 게터가 읽으며, 떼어진 노드의 고정 읽기는 떼어질 때 `settle/utils/detached/captureDetachedSchemaNodeReads.ts`가 한 번 잡는다(26C-10).
- 결정: 레코드에 `visible`·`readOnly`·`disabled` 세 필드를 `active` 옆 고정 배치로 더한다. 생성자는 대입만 하고, 계산의 끝에서 `settle/utils/controls/`가 재계산 목록의 노드만 다시 쓴다. `SchemaNode`의 게터는 필드를 읽거나 settle의 이름 붙은 읽기 함수에 한 문장으로 위임한다(NODE-010).
  - `visible`·`readOnly`·`disabled`는 CONTROLS-082의 로컬 결합 결과다. Form 속성의 전체 잠금은 렌더 계층이 그 위에 OR하므로 게터에 들지 않는다(CONTROLS-082의 28C-02 보충).
  - `enabled`는 `active && visible`이다. 살아 있는 노드에서는 `visible`과 같고 잠금과 무관하다(LANDING-066의 28C-02 보충).
  - 떼어진 노드: `visible`·`readOnly`·`disabled`는 `captureDetachedSchemaNodeReads`가 `typeMismatch`와 함께 떼어질 때 한 번 잡은 값이다(NODE-044의 28C-02 보충). `enabled`는 `active`가 거짓이라 거짓이다(26C-08).
  - `watchValues`는 레코드 필드가 아니다. 유효 스키마의 `controls.watch`(나중 승)의 경로를 방출 트리에서 읽는 함수 하나를 `settle/utils/controls/`에 두고 게터가 위임한다(CONTROLS-080 (5)). 같은 커밋 안에서는 같은 참조를 돌려주도록 커밋 번호로 메모한다(03의 `typeMismatchesMemo` 선례).
- 까닭: `active`의 선례와 같은 모양이라 읽는 자가 추측할 것이 없다(seiri naming §1). 레코드 필드는 한 숨은 클래스를 유지하고 읽기가 단형이다(`reviews/raw-round17-node-structure.md:144`). 떼어진 노드의 마지막 커밋 읽기(NODE-044)도 필드면 그대로 남는다.
- 버린 것:
  - 비트마스크 필드 하나: 노드당 두 칸을 아끼지만 게터에 해석이 들고 `active`의 모양과 달라진다.
  - 런타임 맵: 읽을 때마다 조회가 들고 노드별 할당이 생긴다(노드마다 할당 금지 규칙에도 어긋남).
- 범위: 04가 겉면에 더하는 멤버는 이 다섯과 D9의 `context`(맥락 칸의 같은 참조, SURFACE-055의 28C-08 보충)로 여섯이다. `context`는 상태 키 결과가 아니라서 레코드 필드를 두지 않는다.
- 결과: `record/DETAIL.md`의 필드 목록과 대가(필드 셋의 메모리, 떼어진 노드의 고정 읽기 세 칸, `watchValues` 메모)를 먼저 고친다. 03 벤치 B2(노드당 메모리)의 04 뒤 값을 기록한다(판정 아님, `reviews/round-27-owner-answers.md:7-11`).

## D5 한 노드에 걸리는 층의 해석은 settle의 organ 하나가 맡는다

- 맥락: 같은 층 해석(노드 자신 선언, 부모의 `controls.children` 항목, 그 노드를 직접 선언한 조각의 `controls`)이 세 곳에 필요하다: 계산 끝의 상태 키 결합(CONTROLS-082), 전이의 채움 층(CONTROLS-077)과 나감 정책의 층(WRITE-031–034, 직전 커밋 기준), derive의 값 키 층(SETTLE-004의 층 순위, CONTROLS-073 (7)).
- 결정: 층 해석을 `PKG/src/core/settle/utils/controls/`에 한 번 둔다. 입력은 레코드와 청사진, 기준(이번 최종 형상의 선언 집합 또는 직전 커밋의 선언 집합)이고, 출력은 층별 선언 목록이다. 이 organ은 `settle/type.ts`를 가져오지 않는 순수 함수만 둔다. 상태 키 결합도 같은 organ에 둔다.
- 까닭: 세 소비자의 가장 낮은 공통 fractal은 `settle`이다(filid 배치 §1). derive는 `settle`의 하위 트리 안이므로 이 organ 파일을 직접 가져올 수 있다(filid 경계 §5). 한 곳에 두면 상태 키와 나감과 값 키가 층을 다르게 읽는 일이 없다.
- 버린 것: derive의 진입점에서 층 해석을 내보내는 것. derive의 계약(파생 판정)이 아닌 기능을 내보내게 되고, 전이·계산이 derive에 기대게 된다.
- 결과: 03의 `settle/utils/transition/readUnsetPolicy.ts`·`settle/utils/transition/readDepartingAncestorPolicy.ts`·`settle/utils/transition/readDefault.ts`는 이 organ의 층 해석을 소비하도록 바뀐다.

## D6 04에서 처음 나는 정착 오류의 코드는 settle이 소유한다

- 맥락: 동적 `injectTo` 대상 없음과 가상 노드에 모양이 틀린 자동 쓰기는 04에서 처음 난다(CONTROLS-079, ERROR-195). 오류 이름은 가칭이고 PR-4에서 확정한다(ERROR-164). 03은 정착 전용 코드를 `settle/utils/errors/settleErrorCode.ts`에 모았다.
- 결정: 가칭 `INJECT_TARGET_MISSING`과 `INVALID_VIRTUAL_NODE_VALUES`의 자동 쓰기 경로를 같은 파일에 두고 03의 `SchemaFormError`를 재사용한다. `SchemaNodeDiagnostics.cause`에 `'writeShape'`를 더한다(`record/`의 형, SCN의 `ScenarioExpectation.diagnostics`).
- 까닭: 커밋 뒤 사슬 끝에서 던지는 정착 오류는 settle의 시점이고, 청사진 오류 상수와 섞지 않는 03의 결정과 같다.
- 결과: 05가 이름을 확정하면 이 파일만 고친다.

## D7 회귀와 시나리오는 core 뿌리의 시험이며, 원천마다 04 몫의 파일을 따로 둔다

- 결정: 프로토타입 회귀의 04 몫은 `PKG/src/core/__tests__/regression/<원천>-derive.test.ts`(PR-3 몫)와 `<원천>-controls.test.ts`(PR-6 몫)에 둔다. 시나리오 부류는 `derive`·`controls`이며 데이터는 `packages/aileron/schema-form-scenarios/src/<부류>/`, 러너는 `PKG/src/core/__tests__/scenarios/<부류>.spec.ts`다(TEST-023).
- 까닭: 사례가 여러 fractal(`settle`·`settle/derive`·`SchemaNode`)을 함께 건드리므로 공통 조상 `core`가 소유한다(03 ADR D7과 같은 까닭). 03 파일에 사례를 섞지 않으면 03의 원천별 수 검사와 04의 수 검사가 서로를 흔들지 않는다.
- 결과: 파일 이름이 원천을 따르므로(seiri naming §4) 원천을 옮기거나 지울 때 함께 움직인다.

## D8 개발 모드 정착 기록은 런타임 칸 하나에 마지막 정착만 둔다

- 맥락: 원장은 기록의 모양(진입, 라운드별 규칙·원천·대상·값·결과, 예산 초과 때 마지막 라운드)을 정했고(ERROR-159 보충), 28C-01이 자리와 읽는 자를 정했다(ERROR-159·LANDING-063·TEST-016·NODE-004의 보충).
- 결정:
  - 자리는 `record/type.ts`가 선언하는 `SchemaNodeRuntime`의 선택 칸 하나(가칭 `settlementTrace`)다. 마지막 정착의 기록 하나만 들고 정착마다 새 기록으로 바꾼다. 누적하지 않는다.
  - 개발 모드 판정은 `process.env.NODE_ENV !== 'production'`(정적 치환)이며 ERROR-030과 같은 기준이다. `onError` 핸들러 유무(`hasConsumer()`)는 보지 않는다. 프로덕션에서는 항목을 만들지 않고 칸도 비어 있다.
  - 항목은 derive(`derive/utils/trace/`)가 판정과 함께 만들고, 라운드 실행기가 정착 문맥에 모으며, 커밋이 칸을 바꾼다. 억제된 호출의 규칙도 결과 "억제"로 적는다.
  - 공개 `SchemaNode` 멤버, `onError` 기록, `FormHandle` 멤버, 개발 도구 노출(`core/index.ts`의 디버그 진입 등)은 두지 않는다. 콘솔에도 쓰지 않는다("(기록)" 층).
  - 시험은 런타임 칸을 직접 읽는다. 이것은 TEST-069 (나)가 금하는 "시험만을 위한 주입 자리"가 아니다(설계가 요구한 산출물).
- 까닭: 트리 전체 자료는 런타임 칸이다(26C-06). 누적 저장에는 예산을 준 항목이 없다(NODE-018). 프로덕션 비용이 없어야 한다(GOAL-086).
- 버린 것: 누적 버퍼(예산 없음), 공개 게터(원장이 정한 멤버 없음, 26C-01), 콘솔 출력(이 행은 로그가 아니라 기록).
- 결과: `record/DETAIL.md`가 칸과 그 대가(개발 모드에서 정착마다 기록 하나의 할당, 프로덕션 0)를 먼저 적는다(NODE-045).

## D9 맥락은 런타임 칸이고, 갱신은 바인딩 전용 통로 `setContext`가 settle의 맥락 변경 진입을 부르며, 겉면 게터 `context`가 칸을 읽는다

- 맥락: `@`와 `ctx.context`의 값은 트리마다 하나인 맥락 객체다(CONTROLS-080 (8)과 그 28C-03 보충). 갱신은 `finishInput`처럼 바인딩 전용 내부 통로(NODE-010)이며 가칭 `setContext`다(SURFACE-055). 맥락 변경의 정착(역의존 표의 `@` 항목이 가리키는 노드와 조상의 재계산, `@`를 읽는 `derived`·`unsetValue`·`resetInteraction`의 에지)은 PR-3의 기제이고, PR-7은 병합해 부르는 바인딩만 붙인다(28C-03). `node.context` 게터도 PR-3 멤버다(28C-08). NODE-010은 내부 통로를 "`SchemaNode/` 진입점이 이름 붙여 내보내고 `core/index.ts`는 이름으로 다시 내보내며 `src/index.ts`는 내보내지 않는다"로 정했다. 03은 `@`를 호스트의 `extras`로 읽었고(`settle/utils/gates/evaluateGate.ts:80`, `settle/utils/paths/resolveDependencyPath.ts:5-11`), `@` 의존을 호스트 경로로 치환했으며(`settle/utils/gates/getGateRegistry.ts:155`), 역의존 색인에서 `@`를 뺐고(`settle/utils/write/getDependencyIndex.ts:32,42`), 시험이 그것을 단언했다(`settle/__tests__/settle.gates.test.ts:72-84`). 모두 원장 근거가 없는 03 이탈이다(28C-03, `reviews/round-28-closing.md:36`). `src/core/index.ts`는 07까지 옛 엔진을 가리킨다(LANDING-159 규칙 3).
- 결정:
  - 맥락 칸: `record/type.ts`의 `SchemaNodeRuntime`에 맥락 칸(가칭 `context`)을 선언한다. 트리 생성 때 `schemaNodeFactory`의 인자로 받은 병합된 객체 하나를 두고, 없으면 `{}`다. 식·게이트·`injectTo`의 `ctx.context`가 모두 이 칸을 읽는다. 병합은 코어의 일이 아니다.
  - 게터: `SchemaNode`의 `context`는 칸의 같은 참조를 돌려주는 한 문장 위임이다. `FormTypeInputProps.context`는 07이다.
  - 통로: `setContext(root, context)`는 `SchemaNode/`의 함수로, 클래스 멤버가 아니다. `SchemaNode/index.ts`가 이름으로 내보내고, `src/core/index.ts`가 이름으로 다시 내보낸다. 공개 `src/index.ts`는 내보내지 않는다. `src/index.ts`는 `./core`에서 이름을 골라 가져오므로(`src/index.ts:32-55`) 새지 않는다.
  - 정착 진입: settle의 새 organ `settle/utils/context/`에 `@` 소유자 목록(청사진마다 한 번, `Blueprint.dependencies['@']`와 `@`를 읽는 `active` 게이트에서)과 맥락 변경 진입 함수를 둔다. `settle/index.ts`가 진입 함수를 이름으로 내보내고 `setContext`가 그것을 부른다.
  - 같음: 맥락 칸과 받은 객체를 18C-50 (가)의 `sameValue`로 견준다. 같은 참조와 깊이 같은 새 객체는 바뀜이 아니라서 정착이 없고 칸도 그대로다(CONTROLS-080 (8)의 "깊이 같은 값은 같은 참조로 본다", 28C-08).
  - 바뀌었으면: 칸을 바꾸고, 원본을 표시하지 않은 채 소유자와 조상을 재계산 목록에 넣어 표시 → 계산 → 파생 → 전이 → 커밋을 한 번 돈다. 기준은 직전 커밋의 식 값이다(로드가 아님). `injectTo`는 원천 방출 값이 그대로라 발화하지 않는다.
  - 억제: `setContext`는 옵션을 받지 않는다(옵션 자리는 WRITE-015가 `setValue(V, option)`·`reset(option)`·마운트로, WRITE-091이 입력 `onChange`로 정한 것뿐). Form 속성 `disableAutomaticWrites`(런타임 기본값)가 그 정착의 자동 쓰기에 기본값으로 든다(WRITE-015의 28C-08 보충).
- 까닭:
  - 트리 전체 자료는 런타임 칸이다(26C-06, NODE-045의 절차).
  - 통로 자리는 NODE-010이 정했고 `finishInput`과 같은 모양이라 다음 통로도 같은 모양이 된다(seiri naming §1). 정착 기제는 settle이 소유하고(NODE-016의 `settle` < `SchemaNode`), `SchemaNode`는 위임만 한다.
  - `@` 소유자 목록을 03의 `DependencyIndex`에 섞지 않으면 경로 트라이의 뜻(절대 경로의 교차)이 그대로 남고, 맥락 변경만이 그 목록을 읽는다.
- 버린 것:
  - `SchemaNode` 클래스 메서드 `setContext`: 겉면 멤버가 되어 공개 계약이 넓어진다(SURFACE-055는 바인딩 전용).
  - `src/core/index.ts`가 07까지 `setContext`를 내보내지 않는 것: NODE-010의 자리와 어긋난다(28C-08). 대신 새 엔진 코드가 번들에 끌려오지 않음을 dist로 확인한다(계획 G30).
  - `@`를 `DependencyIndex`의 가짜 경로 `'@'`로 넣는 것: `affected(path)`가 접두 교차로 읽으므로 경로 아닌 키가 섞인다.
  - 맥락 변경을 로드로 다루는 것: 기준을 비우면 `@`를 읽지 않는 규칙까지 발화한다.
  - 깊이 같은 새 객체에 재계산만 도는 것: CONTROLS-080 (8)은 그것을 바뀜으로 보지 않는다.
- 결과: 위 다섯 자리는 04에서 고치고(`settle/utils/gates/getGateRegistry.ts:155`의 치환은 없애고 `settle/utils/write/getDependencyIndex.ts:32,42`가 뺀 `@` 항목은 `@` 소유자 목록이 받음, 시험은 맥락 칸 기준으로 다시 씀) `log.md` §4에 03 이탈(M8)로 적는다(28C-03). `record/DETAIL.md`(맥락 칸), `settle/DETAIL.md`(맥락 변경 진입, `@`의 값), `SchemaNode/DETAIL.md`(`:51`의 내부 통로 줄, 멤버 표의 `context`), `src/core/DETAIL.md`(진입점 표면)를 코드보다 먼저 고친다.
