# 36라운드 닫기 — 06 문서 선행 작성의 원장 해석 둘: 배열 연산의 여덟째 행 칸, 옛 튜플 표기의 `additionalItems` 컴파일

2026-10-01. 06 작업자(브랜치 `feat/schema-form-array`)가 모듈 문서를 먼저 쓰며 둘을 물었다. 둘 다 현행 항목(NODE-006·NODE-014·LANDING-056, NODE-052)에서 유도되므로 편집자 결정으로 닫는다. 소유자에게 물을 것은 없다.

### 36C-01 NODE-014의 "행의 공유 칸"은 배열 구조 연산의 여덟째 행 칸이다 — 모든 행이 같은 자리에 가지며, 배열 행은 계획(순수)을 돌려주고 비배열 행은 하나의 공유 거부 함수를 둔다

- 닫는 항목: NODE-006(보충), NODE-014(보충), LANDING-056(보충)
- 결정:
  - 【추론】 NODE-014가 "비배열에서 부르면 행의 공유 칸이 `SchemaFormError`를 던지므로 겉면과 `dispatch`는 종류를 묻지 않는다"고 적은 그 칸은 NODE-006·LANDING-056의 일곱 칸(`interpret`·`assemble`·`project`·`finishInput`·`declareChildren`·`type`·`strategy`)에 들어 있지 않으므로, 배열 구조 연산을 받는 여덟째 칸으로 모든 행이 같은 자리에 갖는다; 일곱 칸 목록은 모순되지 않고 늘어난다. 칸 이름(06 제안 `arrange`)과 자리(`declareChildren` 뒤, `type` 앞)는 06의 실행 결정 기록이 정하고 모듈 DETAIL은 이 라운드와 그 기록을 함께 인용한다.
  - 【추론】 NODE-006의 "행은 계산만 한다"대로 이 칸은 순수하다: 배열 행은 연산 계획(가지 행은 새 자리마다 옛 색인 또는 생성 값, 터미널 행은 사본 위에 만든 새 원본)을 돌려주고, 원본 쓰기·되돌림 기록·자식 연결과 폐기의 확정·통지는 `settle`과 `dispatch`가 한다; 비배열 행은 "없는 동작은 공유 칸으로 채우고, 뜻이 같은 칸은 함수 객체 하나를 여러 행이 함께 쓴다"대로 `ARRAY_METHOD_ON_NON_ARRAY`를 던지는 거부 함수 하나를 모두 함께 쓴다(ERROR-197, 35C-01).
- 근거: NODE-014 "비배열에서 부르면 행의 공유 칸이 `SchemaFormError`를 던지므로 겉면과 `dispatch`는 종류를 묻지 않는다."; NODE-006 "모든 행은 칸을 모두 같은 순서로 가지며 없는 동작은 공유 칸으로 채우고, 뜻이 같은 칸은 함수 객체 하나를 여러 행이 함께 쓴다", "행은 계산만 한다: 원본 쓰기, 되돌림 기록, 자식 연결과 폐기의 확정, 통지는 `settle`과 `dispatch`가 한다."; LANDING-056 "행의 칸은 `interpret`(입력 해석), `assemble`(합성), `project`(투영), `finishInput`(입력 마침), `declareChildren`(자식 선언 목록만 돌려준다. 생성은 `settle`이 런타임의 `nodeFactory`로 한다. 행은 계산만 한다), `type`, `strategy`이고".

### 36C-02 옛 튜플 표기 `items: [..]`의 꼬리 자리 청사진 `additionalItems`는 PR-5가 청사진에 더한다 — 스키마 값만 컴파일하고, `false`·불리언 `true`·없음은 청사진 없는 자리(`extras`)이며 닫힘 여부는 검증기의 몫이다

- 닫는 항목: NODE-052(보충), LANDING-085(보충)
- 결정:
  - 【추론】 NODE-052는 자리 i의 청사진을 `prefixItems[i]`, 아니면 스키마인 `items`, 옛 철자 `items: [..]`이면 `additionalItems`로 정했는데 02 청사진은 `items: [..]`를 튜플로 컴파일하되 `additionalItems`를 컴파일하지 않으므로, 그 꼬리 자리의 아이템 템플릿 컴파일은 PR-5가 청사진에 더한다(아이템은 PR-5의 기제다, TEST-069 (라); LANDING-085가 `resolveArrayLimits`의 청사진 이동을 PR-5에 둔 것과 같은 결의 변경); 청사진 fractal의 DETAIL을 먼저 고치고 02의 기존 시험은 바꾸지 않는다.
  - 【추론】 컴파일하는 것은 `additionalItems`가 스키마 객체일 때뿐이다: `false`·불리언 `true`·없음은 NODE-052대로 "청사진이 없는 자리"라 노드를 만들지 않고 값은 호스트 `extras`로 가며 버리지도 막지도 않는다; 꼬리가 닫혔는지의 판정(`false`)과 열린 꼬리의 허용(`true`·없음)은 검증기의 몫이고 형상은 둘을 가르지 않는다. 새 철자 `items`가 스키마이고 `prefixItems`가 있을 때의 꼬리는 이미 `items`다.
- 근거: NODE-052 "아니면 `items`가 스키마일 때 `items`이고, 옛 철자 `items: [..]`이면 `additionalItems`다.", "청사진이 없는 자리의 아이템은 노드를 만들지 않는다.", "닫힌 튜플의 뒤와 `items`가 없거나 `false`인 자리가 여기에 든다.", "배열 호스트의 `extras`는 아이템 청사진이 없는 자리의 값이다.", "버리지도 막지도 않는다.", "판정은 검증기가 하고, 표시는 잔여 키처럼 렌더 계층이 맡는다."; 02 코드 `src/core/blueprint/utils/analyze/populateNodeChildren.ts:102-139`(튜플 컴파일, `additionalItems` 없음).
