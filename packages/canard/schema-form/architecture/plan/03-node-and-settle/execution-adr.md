# 03 노드 트리와 정착 — 실행 구조 결정

이 문서는 03 실행 계획([execution-plan.md](execution-plan.md))이 정한 구조 결정을 계획 없이 읽히도록 적는다. 설계의 정본은 원장 `ledger/`다. 26차 원장 관리자 판정(26C-01–05)을 반영한다.

## D1 PR-2의 동사 진입은 settle로 바로 간다

- 맥락: NODE-010은 쓰기 → 커밋 → 통지 → 검증 요청의 조율을 `dispatch`의 동사별 진입에 둔다. 그러나 PR-2의 새 fractal은 다섯(`record`·`behaviors`·`navigation`·`settle`·`SchemaNode`)이고 `dispatch`는 PR-4다(LANDING-082·064).
- 결정: PR-2에서 `SchemaNode`의 쓰기 동사는 `settle`의 진입 함수(표시 → 정착 → 커밋)로 문장 하나만에 위임한다. PR-4가 그 사이에 `dispatch`를 넣고 위임 대상만 바꾼다.
- 까닭: 의존 방향(NODE-016, `settle` < `SchemaNode`)을 지키고, 없는 fractal을 미리 세우지 않는다.
- 버린 것: PR-2에 빈 `dispatch`를 세우는 것. 소비자 없는 fractal이 생기고 LANDING-082의 목록을 넘는다.
- 결과: PR-4는 `setValue`의 위임 대상을 `dispatch` 진입으로 옮긴다. PR-2의 사슬은 `settle` 호출 하나다(TEST-069, LANDING-064).
- 상태: 닫힘(26차 Q2).

## D2 멤버는 기제를 들이는 PR에서 겉면에 더한다

- 맥락: PR-2의 겉면은 `reviews/raw-round17-node-structure.md:74`의 목록에 `raw`·`extras`·`diagnostics`·`defaultValue`·`resetSubtree`, 경고등 게터 `typeMismatch`·`typeMismatches`(WRITE-093)와 공개 옵션 `SetValueOption`을 더한 것이다(26C-01). 멤버 목록 시험은 클래스 멤버만 센다. SURFACE-058의 약 54개는 PR-7 전환 때의 수다.
- 결정: PR-2는 자기 멤버만 `SchemaNode/DETAIL.md`·멤버 목록 시험·공개 형에 둔다. PR-4는 명령 메서드와 통지·검증·오류 멤버, PR-5는 배열 메서드, PR-6은 계산 게터를 그 기제와 함께 세 곳에 더한다(EVENT-063, LANDING-064·066). 원장이 PR을 지정하지 않은 멤버도 같은 규칙을 따른다.
- 까닭: TEST-069 (나)의 대역은 `if` 술어 하나뿐이고 뒤 PR을 위한 시험 전용 주입 자리나 스텁을 금한다.
- 결과: `SchemaNodeRuntime`은 PR-2의 `if` 술어·진단·예산·`nodeFactory`에 필요한 최소 칸만 선언한다(NODE-045). TEST-070의 배열 멤버 형 시험은 PR-5에서 한다.
- 상태: 닫힘(26C-01).

## D3 `if`만 record의 술어 인터페이스 뒤에 있다

- 맥락: `if`의 실제 술어는 PR-4의 `compileGuard`가 넣는다. 판별 게이트와 노드·조각의 `controls.active`는 PR-2가 평가한다(26C-04).
- 결정:
  - `record/`의 런타임 칸에는 `if` 술어 인터페이스만 선언한다.
  - `settle`의 호스트 바퀴는 판별 게이트의 `./<key>` 값을 `values`로 판정하고 분기 `controls.active`와 AND한다. 노드·조각의 `controls.active`는 청사진이 컴파일한 `BlueprintExpression.evaluate`로 실제 평가한다.
  - 코어 공통 시험 유틸에는 `compileGuard` 반환값과 같은 모양의 `if` 술어 대역 하나와 던지는 변형을 둔다. 실제 식 실패와 가드 실패를 각각 `cause:'expression'`으로 단언한다.
- 까닭: TEST-069 (가)·(나), LANDING-062, 25C-06, 26C-04.
- 결과: 04(PR-3·PR-6)는 `derived`·`injectTo`·상태 키·`controls.children`·조각 `controls` 층을 맡는다.
- 상태: 닫힘(26C-04).

## D4 SETTLE-045의 평가 자리 L은 청사진이 계산한다

- 맥락: SETTLE-045는 "청사진이 그 게이트의 평가 자리를 L로 옮긴다"라고 적는다. 02의 청사진에는 그 계산이 없다.
- 결정: PR-2가 `BlueprintGate`에 L 평가 자리 칸과 계산을 더한다. `src/core/blueprint/DETAIL.md`를 먼저 고친 뒤 청사진 시험에서 `#`·`(/)`는 루트, `/p`·`#/p`는 `p`의 자리, `@`는 제외라는 세 규칙을 단언한다. `settle`은 청사진이 옮겨 둔 자리에서 게이트를 평가한다.
- 까닭: 원장 문장의 주어가 청사진이고, 청사진은 정적이며 한 번만 계산한다.
- 버린 것: 정착마다 L을 계산하는 것. 정적인 일을 런타임에 반복한다.
- 상태: 닫힘(26C-04).

## D5 새 노드 공개 형은 07까지 새 fractal 안에 있다

- 결정: 판별 합집합 `SchemaNode`, `UnionNode`, 종류별 형, 가드 열, 새 `InferSchemaNode` 사상은 `src/core/SchemaNode/type.ts`와 그 진입점에 둔다. `src/types`·`src/index.ts`의 공개 형은 07까지 옛 엔진 그대로다.
- 까닭: NODE-058의 게이트 "PR-2(노드 형)·PR-7(공개 수출)"과 LANDING-159 규칙 3(07까지 옛 엔진이 `<Form>`을 섬긴다).
- 버린 것: `src/types`의 공개 형을 지금 바꾸는 것. 옛 엔진의 공개 형 시험이 깨지고 전환 전에 공개 계약이 바뀐다.
- 결과: 07이 공개 수출을 새 형으로 옮긴다.

## D6 import type까지 센 순환 검사는 저장소 안의 시험이다

- 결정: `src/core/__tests__/dependencyDirection.test.ts`가 새 fractal 파일의 `import`·`import type`·`export … from`을 읽어 NODE-016의 전순서와 `record/`의 금지 목록(NODE-045)을 단언한다.
- 까닭: NODE-045가 "도구는 PR-2가 고른다"고 했다. 새 도구를 설치하지 않고 매 시험에서 돈다.
- 버린 것: 외부 의존 그래프 도구의 설치. 저장소에 없고, 문서에 나왔다는 이유로 설치하지 않는다.

## D7 회귀 이식은 core 뿌리의 시험이다

- 결정: 프로토타입 회귀의 PR-2 몫은 `src/core/__tests__/regression/<묶음>.test.ts`에 둔다. 시나리오 부류 러너는 `src/core/__tests__/scenarios/<부류>.spec.ts`(TEST-023)다.
- 까닭: 사례가 여러 fractal(`settle`·`behaviors`·`SchemaNode`)을 함께 건드리므로 그들의 공통 조상인 `core`가 소유한다(filid 배치 규칙 1). 시험은 `SchemaNode/` 진입점만 가져온다.
