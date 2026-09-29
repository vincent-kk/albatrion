# 03 노드 트리와 정착 — 실행 구조 결정

이 문서는 03 실행 계획([execution-plan.md](execution-plan.md))이 정한 구조 결정을 계획 없이 읽히도록 적는다. 설계의 정본은 원장 `ledger/`다. 여기 적는 것은 원장이 열어 둔 구현 선택과 원장의 해석이며, 새 소유자 결정이 아니다. 원장 관리 세션의 확인을 기다리는 결정은 상태 칸에 적는다.

## D1 PR-2의 동사 진입은 settle로 바로 간다

- 맥락: NODE-010은 쓰기 → 커밋 → 통지 → 검증 요청의 조율을 `dispatch`의 동사별 진입에 둔다. 그러나 PR-2의 새 fractal은 다섯(`record`·`behaviors`·`navigation`·`settle`·`SchemaNode`)이고 `dispatch`는 PR-4다(LANDING-082·064).
- 결정: PR-2에서 `SchemaNode`의 쓰기 동사는 `settle`의 진입 함수(표시 → 정착 → 커밋)로 문장 하나만에 위임한다. PR-4가 그 사이에 `dispatch`를 넣고 위임 대상만 바꾼다.
- 까닭: 의존 방향(NODE-016, `settle` < `SchemaNode`)을 지키고, 없는 fractal을 미리 세우지 않는다.
- 버린 것: PR-2에 빈 `dispatch`를 세우는 것. 소비자 없는 fractal이 생기고 LANDING-082의 목록을 넘는다.
- 결과: PR-4는 겉면의 위임 대상 몇 줄과 `settle` 진입의 호출자를 바꾼다. 겉면 서명은 바뀌지 않는다.
- 상태: 원장 관리 세션 확인 대기(Q2).

## D2 겉면은 처음부터 온전하고, 뒤 PR의 기제는 런타임 칸 뒤의 스텁이다

- 맥락: `verification.md`는 명령 메서드 하나를 뺀 멤버 목록(약 53개, SURFACE-058 충돌 줄)을 PR-2가 단언하라고 한다. 그 가운데 구독·검증·배열 연산·상태 키의 기제는 PR-4·5·6이 들인다.
- 결정: 모든 멤버를 PR-2 클래스에 둔다. 뒤 PR 기제의 멤버는 `record/`가 최소 인터페이스로 선언한 `SchemaNodeRuntime` 칸(NODE-045)이나 행의 공유 칸(NODE-014)에 위임한다. PR-2의 `schemaNodeFactory`가 그 칸에 무해한 구현을 넣는다. 각 PR은 칸의 구현을 바꾸고 겉면은 바꾸지 않는다. 멤버마다의 PR 배정은 `SchemaNode/DETAIL.md`의 멤버 목록이 든다.
- 까닭: LANDING-062의 "게이트는 술어 인터페이스 뒤의 스텁"과 같은 방식이고, NODE-010의 겉면 규칙(문장 하나짜리 위임)을 지킨다.
- 버린 것: PR마다 멤버를 더하는 것. `verification.md`의 멤버 목록 단언과 어긋나고, 멤버 목록 시험이 PR마다 흔들린다.
- 결과: PR-2 트리에서 스텁 멤버는 무해한 기본값을 돌려준다. `SchemaNode/DETAIL.md`의 목록이 그 사실과 채울 PR을 적는다.
- 상태: 원장 관리 세션 확인 대기(Q1).

## D3 게이트는 record가 선언한 술어 인터페이스 뒤에 있다

- 맥락: `if`는 검증기 플러그인이 컴파일하고(PR-4 `compileGuard`), `controls.active`는 식이다(PR-3 제어). 판별 게이트는 25C-06이 PR 03에 평가를 맡겼다.
- 결정:
  - `record/`의 런타임 칸에 게이트 술어 인터페이스를 선언한다.
  - `settle`의 호스트 바퀴는 판별 게이트를 직접 평가하고 분기의 `controls.active`와 AND 하나로 묶는다.
  - `if`·`active`는 술어를 부른다. PR-2의 기본 술어는 주입된 평가가 없으면 꺼짐을 돌려준다.
  - 시험은 대역 하나를 쓴다(실행 계획 §6.2).
- 까닭: LANDING-062, TEST-069("게이트 술어 대역 하나"), 25C-06, NODE-045(의존 역전).
- 버린 것: PR-2가 청사진의 `BlueprintExpression.evaluate`로 `controls.active`를 제품 경로에서 평가하는 것. 제어(PR-3)의 몫을 앞당긴다.
- 상태: 원장 관리 세션 확인 대기(Q5).

## D4 SETTLE-045의 평가 자리 L은 청사진이 계산한다

- 맥락: SETTLE-045는 "청사진이 그 게이트의 평가 자리를 L로 옮긴다"라고 적는다. 02의 청사진에는 그 계산이 없다.
- 결정: PR-2가 청사진에 L 계산을 더한다. `src/core/blueprint/DETAIL.md`를 먼저 고친다. `settle`은 청사진이 옮겨 둔 자리에서 게이트를 평가한다.
- 까닭: 원장 문장의 주어가 청사진이고, 청사진은 정적이며 한 번만 계산한다.
- 버린 것: 정착마다 L을 계산하는 것. 정적인 일을 런타임에 반복한다.
- 상태: 원장 관리 세션 확인 대기(Q5).

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
