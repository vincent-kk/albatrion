# 28라운드 닫기 — 04(파생 + 상태 키·제어, PR-3+PR-6) 실행 계획 초안의 원장 해석 일곱 건과 후속 둘

2026-09-30. 04 작업자(브랜치 `feat/schema-form-derive-and-controls`, base `0705217d5`)가 실행 계획 초안(`plan/04-derive-and-controls/execution-plan.md` §2.3)을 쓰며 원장 해석 일곱 건을 물었다: 개발 모드 정착 기록의 자리와 읽는 이, 계산 게터 `enabled`의 뜻과 떼어진 노드의 상태 게터, `@` 맥락의 값·03의 `@` 읽기·맥락 변경 진입의 PR, 억제 비트와 `controls.resetInteraction`, `controls.unsetOnInactive` 식이 던졌을 때의 판정, TEST-071의 "값 크기"와 실패 때의 처분, `watchValues`의 PR; 뒤이어 후속 둘 — `node.context` 게터의 PR, 맥락 변경 정착의 기준점·같음·억제 비트·내보내기 자리(28C-08). 모두 현행 항목과 소유자 답에서 유도되므로 소유자 물음 없이 원장 관리자가 닫는다(PROCESS-066). 소유자가 어느 결정이든 뒤집으면 그 답이 이긴다. 원장 항목의 결정 글은 고치지 않고 보충 줄만 더한다("옛 글은 자라기만 한다").

### 28C-01 개발 모드 정착 기록은 런타임의 칸에 마지막 정착 하나만 든다 — 공개 멤버 없음, 시험이 읽는 것은 주입 자리가 아님, 판정은 `NODE_ENV`

- 닫는 항목: ERROR-159(보충), LANDING-063(보충), TEST-016(보충), NODE-004(보충)
- 결정:
  - 【추론】 ERROR-159 정착 추적 행의 기록은 트리마다 하나인 `SchemaNodeRuntime`의 칸에 들며(26C-06), 칸을 더하는 절차는 NODE-045대로 `record/`의 선언을 고치고 그 대가를 레코드 `DETAIL.md`에 적는 것이다.
  - 【추론】 그 칸은 마지막 정착의 기록 하나만 들고 정착마다 새 기록으로 바꾼다: "정착마다 기록"은 기록의 단위이고, 누적 저장은 어느 항목도 예산(NODE-018)을 주지 않았다.
  - 【추론】 프로덕션에서는 기록을 만들지 않으므로 칸은 비어 있다; 이 행은 다른 경고 행의 "개발 모드 로그"와 달리 "(기록)" 층이라 콘솔 출력이 아니다.
  - 【추론】 PR-3은 이 기록을 위한 공개 `SchemaNode` 멤버·`onError` 기록·`FormHandle` 멤버를 더하지 않는다: 원장이 정한 멤버가 없고(26C-01), 이 행은 "`onError`에 가지 않음"이다.
  - 【추론】 시험이 런타임의 칸에서 이 기록을 읽는 것은 TEST-069 (나)가 금하는 "시험만을 위한 주입 자리"가 아니다: (나)가 금하는 것은 시험만을 위해 새로 만드는 입력 자리이고, 이 기록은 ERROR-159가 설계로 요구한 산출물이다.
  - 【추론】 개발 도구를 위한 노출(`core/index.ts`의 디버그 진입 등)은 원장에 없으므로 PR-3이 만들지 않는다.
  - 【추론】 개발 모드의 판정은 `process.env.NODE_ENV !== 'production'`(정적 치환)이며 ERROR-030의 보고기 판정과 같은 기준이고, 이 기록은 `onError` 핸들러의 유무(`hasConsumer()`)는 보지 않는다.
- 근거: ERROR-159 정착 추적 행 "| 정착 추적 | (기록) | 정착 | — | 개발 모드에서 정착마다 기록(진입, 라운드별 규칙·원천·대상·값·결과, 예산 초과 시 마지막 라운드). `onError`에 가지 않음 | 자동 쓰기 다섯의 출처(C2·P2) |"과 그 보충 "프로덕션은 기록하지 않는다. `onError`에 가지 않는다"(`_archive/2026-09-29/08-design-a-to-z.md:382`); 26C-06 "원장이 "루트가 든다"고 적은 트리 전체 자료 … 의 저장 자리는 트리마다 하나인 `SchemaNodeRuntime`의 칸이며", "NODE-004의 런타임 열거 … 는 닫힌 목록이 아니며, 칸을 더할 때는 NODE-045대로 `record/`의 선언을 고치고 그 대가를 레코드 `DETAIL.md`에 적는다"; TEST-069 "시험만을 위한 주입 자리(파생 단계, 디스패처)를 새로 만들지 않는다(seiri `public-contract` §3)"; 26C-01 "`SchemaNode` 겉면의 멤버는 그 멤버가 드러내는 기제를 들여오는 PR에서 겉면에 들고"; ERROR-030 "소비자가 있는지는 '핸들러가 있음 또는 `process.env.NODE_ENV !== 'production'`(정적 치환)'으로 판정한다"; LANDING-063 PR-3 행의 "개발 모드 정착 기록"; TEST-016 PR-3 행의 "개발 모드 정착 기록".

### 28C-02 `enabled`는 `active && visible`이다 — 떼어진 노드의 `visible`·`readOnly`·`disabled`는 고정 읽기, `enabled`는 거짓

- 닫는 항목: LANDING-066(보충), NODE-044(보충), CONTROLS-022(보충), CONTROLS-023(보충), CONTROLS-082(보충)
- 결정:
  - 【추론】 계산 게터 `enabled`는 `active && visible`이다: 원장은 이 게터를 이름만 적었고(26C-01, LANDING-066, `reviews/raw-round17-node-structure.md:136`) 뜻을 새로 정하지 않았으므로 옛 엔진 `AbstractNode.enabled`의 뜻을 유지한다(뜻을 바꾸는 이주는 LANDING 이주 항목으로 적는 것이 원장의 방식이고 `enabled`에는 그런 항목이 없다).
  - 【추론】 살아 있는(형상 안) 노드에서는 `active`가 늘 참이므로(26C-08) `enabled`는 `visible`과 같고, 잠금(`readOnly`·`disabled`)과는 무관하다.
  - 【추론】 `visible`·`readOnly`·`disabled` 게터는 CONTROLS-082의 로컬 결합 결과(잠금은 OR, 표시는 AND, 자리 넷)를 돌려주며, Form 속성의 전체 잠금은 렌더 계층이 그 위에 OR하므로 코어 게터에 들지 않는다.
  - 【추론】 떼어진 노드의 `visible`·`readOnly`·`disabled`는 NODE-044의 고정 읽기이며, 26C-10의 `typeMismatch` 등과 같이 떼어질 때 그 노드가 형상에 있던 마지막 커밋의 값을 한 번 갈무리한다; 26C-08의 예외는 `active`와 그것에서 도출되는 `enabled`에만 있다.
  - 【추론】 떼어진 노드의 `enabled`는 거짓이다: `enabled`는 `active`에서 도출되므로 26C-08의 예외를 따르며, 그래서 NODE-044 고정 읽기의 예외이고 갈무리한 `visible` 값과 무관하다.
- 근거: LANDING-066 PR-6 행의 "겉면의 계산 게터(`visible`·`enabled`·`readOnly`·`disabled`)"; 26C-01 "계산 게터 `visible`·`enabled`·`readOnly`·`disabled`는 PR-6(LANDING-066)에서 겉면에 든다"; `reviews/raw-round17-node-structure.md:136` "계산 상태 게터 6(`active`는 PR-2의 노드 게이트, `visible`·`enabled`·`readOnly`·`disabled`·`watchValues`는 PR-6)"; 옛 엔진 `src/__legacy__/core/nodes/AbstractNode/AbstractNode.ts:459-465`(`enabled = active && visible`); 26C-08 "`active` 게터는 … 살아 있는(형상 안) 노드에서는 늘 참이다", "떼어진 노드의 `active`는 거짓이다"; CONTROLS-082 "이것들이 겹치면 잠금(`readOnly`·`disabled`)은 하나라도 참이면 잠기고, 표시(`active`·`visible`)는 모두 참이어야 켜진다", "Form 속성의 전체 잠금은 렌더 계층이 이 결과 위에 OR한다(CONTROLS-045, 13라운드 답 1)"; NODE-044 "떼어진 노드의 읽기 멤버는 모두 그 노드가 형상에 있던 마지막 커밋의 값을 돌려주고, 그 뒤로 바뀌지 않는다"; 26C-10 "`typeMismatch`·`typeMismatches`·`inactiveValues`·`defaultValue`는 NODE-044의 고정 읽기이며, 떼어질 때 그 노드가 형상에 있던 마지막 커밋의 값을 한 번 갈무리한다"; CONTROLS-022(`visible`)·CONTROLS-023(`readOnly`·`disabled`)의 키 표.

### 28C-03 `@`의 값은 런타임의 맥락 칸이다 — 03의 `@`=extras 읽기는 결함, 맥락 변경 진입과 그 에지는 PR-3

- 닫는 항목: CONTROLS-080(보충), SURFACE-055(보충), NODE-004(보충), LANDING-063(보충)
- 결정:
  - 【추론】 식과 `controls.injectTo`의 `ctx.context`가 보는 `@`의 값은 트리마다 하나인 `SchemaNodeRuntime`의 맥락 칸이다(26C-06, NODE-045의 절차): 트리 생성 때 바인딩이 준 맥락 객체 하나를 받고, 없으면 `{}`다.
  - 【추론】 `FormProvider`의 맥락과 Form 속성 `context`를 얕게 병합하는 것은 바인딩의 일이며, 코어는 병합된 객체 하나만 받는다.
  - 【추론】 로드는 로드 시점의 맥락으로 평가한다(CONTROLS-080 (8)).
  - 【추론】 03(PR-2)이 `@`를 호스트의 `extras`로 읽은 것(`src/core/settle/utils/paths/resolveDependencyPath.ts:5-11`, `src/core/settle/utils/gates/evaluateGate.ts:80`, `src/core/settle/utils/gates/getGateRegistry.ts:155`의 호스트 경로 치환, `src/core/settle/utils/write/getDependencyIndex.ts:32,42`의 역의존 표 제외, 시험 `src/core/settle/__tests__/settle.gates.test.ts:72-84`)은 CONTROLS-080 (3) "`@`는 맥락이다"와 (6) "선언되지 않은 키면 `extras`의 값"(경로로 읽는다)에 어긋나는 결함이며 원장에 근거가 없다(03의 기록에 있는 `@` 관련 결정은 평가 자리 L의 계산에서 `@`를 세지 않는다는 것뿐이다).
  - 【추론】 04가 이를 고치고 `plan/04-derive-and-controls/log.md` §4에 03의 이탈로 적는다; `@`가 `extras`임을 단언하는 PR-2 시험도 고친다.
  - 【추론】 맥락 변경의 진입은 바인딩 전용 내부 통로 `setContext`(가칭, SURFACE-055·NODE-010)이고, 그것이 도는 정착(역의존 표의 `@` 항목이 가리키는 노드와 그 조상의 재계산, `@`를 읽는 `derived`·`unsetValue`·`resetInteraction`에게의 에지)은 PR-3의 기제다: 에지 소비와 파생이 PR-3이고(LANDING-063), 원장이 PR을 적지 않은 것은 그 기제를 들여오는 PR에 든다(26C-01).
  - 【추론】 PR-7은 `FormProvider`·Form 속성을 병합해 이 통로를 부르는 바인딩만 붙인다.
  - 【추론】 `controls.injectTo`는 맥락 변경으로 발화하지 않는다(CONTROLS-080 (8)).
- 근거: CONTROLS-080 "`@`는 맥락이다", "`@/p`는 경로가 아니다", "선언되지 않은 키면 `extras`의 값, 아니면 `undefined`다", "(8) `@` 맥락: `@`의 값은 폼의 맥락 객체다", "`FormProvider`의 맥락과 Form 속성 `context`를 얕게 병합하고 같은 키는 Form 속성이 이긴다", "둘 다 없으면 `{}`다", "맥락이 바뀌는 것은 입력이 바뀌는 것이다", "바인딩이 바뀐 맥락을 루트에 전하면 정착 하나가 돈다", "원본은 표시하지 않고, 역의존 표의 `@` 항목이 가리키는 노드와 그 조상을 재계산 목록에 넣는다", "`@`를 읽는 `derived`·`unsetValue`·`resetInteraction`에게 이 변경은 에지다", "`injectTo`는 자기 방출 값의 에지에만 발화하므로 맥락 변경으로는 발화하지 않는다", "로드 때는 로드 시점의 맥락으로 평가한다"; SURFACE-055 "맥락의 갱신은 `finishInput`처럼 바인딩 전용 내부 통로(NODE-010)이며, 가칭 `setContext`다"; 26C-06 "NODE-004의 런타임 열거 … 는 닫힌 목록이 아니며"; 26C-01 "원장이 PR을 적지 않은 멤버는 같은 규칙으로 그 기제를 들여오는 PR에 들며"; LANDING-063 PR-3 행의 "에지 소비"; `plan/03-node-and-settle/log.md:52` "`@`는 세지 않음"(L 계산에 대한 것).

### 28C-04 억제 비트는 `controls.resetInteraction`의 판정에 닿지 않는다

- 닫는 항목: CONTROLS-029(보충), WRITE-097(보충)
- 결정:
  - 【추론】 `DisableAutomaticWrites`로 억제한 로드(`FormHandle.reset(DisableAutomaticWrites)` 등)에서도 `controls.resetInteraction`은 커밋 단계에서 로드된 값으로 판정하고 참이면 `dirty`·`touched`를 비운다.
  - 【추론】 억제 비트의 범위는 그 호출이 일으킨 예약 층의 자동 쓰기(채움, `controls.derived`, `controls.injectTo`, `controls.unsetValue`, 나감의 비움)이고, `controls.resetInteraction`은 원본 쓰기도 예약 층의 자동 쓰기도 아니므로(EVENT-012) 그 범위 밖이다; 포커스 아웃 `trim`은 호출 비트가 아니라 Form 속성 `disableAutomaticWrites`만이 억제한다(21C-01, WRITE-100).
- 근거: WRITE-015 범위 행 "억제는 그 호출이 일으킨 예약 층의 자동 쓰기 전부를 막는다 — 채움, `controls.derived`, `controls.injectTo`, `controls.unsetValue`, 나감의 비움"; WRITE-097 "억제 비트 `DisableAutomaticWrites`의 범위는 그 호출(로드와 전체 교체 쓰기, `Merge`)이 일으킨 예약 층의 쓰기 전부다"; EVENT-012 "`setState`형 쓰기(`dirty`·`touched`)와 명령 시그널은 원본을 바꾸지 않으므로 정착의 입력도, §5의 진입도, 예약 층의 자동 쓰기(채움·`controls.derived`·`controls.injectTo`·`controls.unsetValue`·나감의 비움)도 아니다"; SETTLE-006 "`controls.resetInteraction`(옛 `&pristine`, `dirty`·`touched` 초기화)을 최종 트리의 식 값으로 판정한다"와 그 보충 "(로드는 로드된 값으로, 런타임은 거짓→참 에지)"; 21C-01 "【추론】 호출 옵션의 억제 비트(`DisableAutomaticWrites`·`EnableAutomaticWrites`)는 그 호출이 일으킨 자동 쓰기에만 들며, 뒤이은 포커스 아웃이 일으키는 `options.trim`의 자동 쓰기는 그 호출이 일으킨 것이 아니므로 듣지 않는다."(`reviews/round-21-closing.md:9`); CONTROLS-029 "식이 참이 되면 `dirty`·`touched`를 초기화한다. 값은 건드리지 않는다".

### 28C-05 `controls.unsetOnInactive`의 식이 던지면 그 선언은 "유지"다

- 닫는 항목: ERROR-122(보충), ERROR-125(보충), ERROR-126(보충), WRITE-031(보충), CONTROLS-024(보충)
- 결정:
  - 【추론】 ERROR-122의 자리별 값 표에 행 하나를 더해 읽는다: `controls.unsetOnInactive`의 식(노드 자신, `controls.children` 항목의 `controls`, 조각의 `controls`)이 직전 커밋의 방출 트리에서 던지면 그 선언은 "유지"다.
  - 【추론】 "선언 없음"(아래 층으로 떨어짐)이 아니다: 되돌릴 수 없는 쓰기는 만장일치이고(WRITE-031) 던진 식은 비움에 찬성한 표가 아니며, 아래 층(Form 속성)이 참일 때 작성자의 잘못으로 커밋된 값을 잃게 되어 ERROR-125의 원칙(작성자의 잘못으로 커밋된 값을 잃지 않는다)에 어긋난다.
  - 【추론】 층 규칙은 그대로다: 그 층의 유지가 아래 층의 비움을 덮는다(세부가 포괄을 덮는다).
  - 【추론】 던진 사실은 다른 자리와 같이 `EXPRESSION_THREW`로 사슬 끝에서 throw하고, 그 식을 평가한 정착의 커밋은 `degraded`다(ERROR-126).
- 근거: ERROR-122 표 "| 상태 키(`controls.visible`·`controls.readOnly`·`controls.disabled`, 조각과 `controls.children`의 `controls`) | 그 선언은 없는 것이다 |"(이 표에 `unsetOnInactive` 행이 없다); ERROR-125 "식이나 가드가 던져 거짓이 된 게이트로 나간 노드에는 나감 비움을 적용하지 않는다(작성자의 잘못으로 커밋된 값을 잃지 않는다)"; ERROR-126 "어느 자리든 식이나 가드가 던지면 그 커밋은 `degraded`다(§5)"; WRITE-031 "같은 층에 여럿이면 하나라도 유지면 유지한다(되돌릴 수 없는 쓰기는 만장일치)"; CONTROLS-040 "노드 자신 > `children` 항목의 `controls` > 조각 객체의 `controls` > Form 속성 순으로 세부가 포괄을 덮고"; CONTROLS-080 "`controls.unsetOnInactive`의 식은 직전 커밋의 방출 트리를 읽는다(CONTROLS-024, WRITE-038, 17라운드 통보 2)"; ERROR-159 정착 오류 행 "어느 자리든 `controls`의 식이나 `if` 게이트 함수의 런타임 throw와 가드의 평가·컴파일 실패".

### 28C-06 TEST-071의 "값 크기"는 바뀌지 않은 원소들의 깊은 크기다 — 지름길이 없어 실패하면 구현의 결함, 선만 넘으면 27라운드 답

- 닫는 항목: TEST-071(보충), SETTLE-043(보충)
- 결정:
  - 【추론】 TEST-071의 "한 원소 쓰기의 비교 비용이 값 크기와 무관"은 18C-50 (다)의 뜻이다: 비교는 이번 정착에서 새로 만들어진 부분에만 내려가므로, 통째 교체된 컨테이너의 원소 N개는 참조로만 견주고 바뀌지 않은 원소들의 깊은 크기(내용)에는 내려가지 않는다.
  - 【추론】 그래서 원소 수 N에 비례하는 참조 비교는 지름길이 요구하는 비용이고, "값 크기"는 원소 수가 아니라 바뀌지 않은 원소들의 깊은 크기다; "통째 교체가 선형"은 새로 만들어진 값 전체의 크기에 선형이라는 뜻이다.
  - 【추론】 합격선은 04의 검증 문서에 TEST-027의 절차로 적고 원장은 뜻만 보충한다: 원소 크기를 바꿔도 한 원소 쓰기의 비교 시간이 같은 수준인지, 통째 교체의 시간이 새 값의 크기에 선형인지를 잰다.
  - 【추론】 실패의 처분은 둘로 나눈다: 지름길이 없어서(비교가 새로 만들어진 부분 밖으로 내려가서) 실패하면 18C-50·SETTLE-043이 정한 기제의 결함이므로 고치는 것이 구현이고 최적화가 아니다 — 27라운드 소유자 답의 범위 밖이다; 지름길이 있는데 선만 넘으면 27라운드 답대로 고치지 않고 TEST-027의 절차(이유 기록, 소유자 수용)를 따르며 `verification/`의 성능 문서에 남긴다.
- 근거: TEST-071 "무엇: 객체 원천 `injectTo`(1만 원소의 터미널 객체·배열)에서 한 원소 쓰기의 비교 비용이 값 크기와 무관한지, 통째 교체가 선형인지 잰다", "실패: 값 비교를 되돌리지 않고 지름길 구현을 고친다"; 18C-50 "(다) 지름길 때문에 비교는 이번 정착에서 새로 만들어진 부분에만 내려간다", "그래서 비용은 쓰기가 바꾼 크기에 비례한다(G6)"(`reviews/round-18-closing.md:1391-1392`); 27라운드 소유자 답 "현재 구현단계에서 최적화를 하는 것은 전체 원장을 흔들 수 있는 문제라, 구현 완료 후, 최적화를 시도할 예정입니다"(`reviews/round-27-owner-answers.md:11`); TEST-027의 절차(느린 행은 이유를 적고 소유자가 받아들여야 병합).

### 28C-07 `watchValues` 게터는 PR-6(04)의 멤버다 — LANDING-137도 게터의 것, prop 전달은 PR-7

- 닫는 항목: CONTROLS-032(보충), LANDING-066(보충), LANDING-137(보충)
- 결정:
  - 【추론】 코어 게터 `watchValues`(CONTROLS-032)는 PR-6, 곧 04의 겉면 멤버다: `reviews/raw-round17-node-structure.md:136`이 계산 상태 게터 여섯 가운데 `active`를 뺀 다섯을 PR-6으로 적었고, 26C-01이 LANDING-066의 넷만 인용한 것은 그 목록을 닫은 것이 아니다.
  - 【추론】 26C-01의 규칙("기제를 들여오는 PR")으로도 같다: `watchValues`의 기제 — 유효 스키마의 `controls.watch` 선택(나중 승)과 방출 트리의 경로 읽기(CONTROLS-080 (5)) — 는 상태 키·제어 단계의 것이다.
  - 【추론】 `FormTypeInputProps.watchValues`로 넘기는 일은 PR-7 렌더 계층이고, LANDING-137(`omitEmpty` 아래 빈 문자열이 `undefined`)은 게터가 방출 트리를 읽는 결과이므로 PR-6의 게터에 든다; EVENT-064의 계산 상태 비트에 `watchValues`가 드는 것은 PR-4 배달의 몫이다.
- 근거: `reviews/raw-round17-node-structure.md:136` "계산 상태 게터 6(`active`는 PR-2의 노드 게이트, `visible`·`enabled`·`readOnly`·`disabled`·`watchValues`는 PR-6)"; 26C-01 "계산 게터 `visible`·`enabled`·`readOnly`·`disabled`는 PR-6(LANDING-066)에서 겉면에 든다", "원장이 PR을 적지 않은 멤버는 같은 규칙으로 그 기제를 들여오는 PR에 들며"; CONTROLS-032 "경로의 값은 공개 prop `watchValues`(위치 배열)로 입력에 전달된다. 선언이 여럿이면 의존은 합집합, `watchValues`는 유효 스키마의 것(나중 승)"; CONTROLS-080 "게이트, 상태 키, `derived`, `unsetValue`, `resetInteraction`, `watch`의 `watchValues`가 모두 이 규칙 하나를 따른다"; EVENT-064 "계산 상태(`active`·`visible`·`readOnly`·`disabled`·`watchValues`)의 비트와는 따로 둔다"; LANDING-137 "`controls.watch`의 `watchValues`도 `omitEmpty` 아래에서 빈 문자열을 `undefined`로 받는다(입력 구성 요소가 보는 변화)".

### 28C-08 `node.context` 게터는 PR-3(04)의 멤버다 — 맥락 변경 정착의 기준점·같음·억제·내보내기 자리

- 닫는 항목: SURFACE-055(보충), CONTROLS-080(보충), NODE-010(보충), WRITE-015(보충)
- 결정:
  - 【추론】 `node.context` 게터(SURFACE-055)는 PR-3, 곧 04의 겉면 멤버다: 그 기제(런타임의 맥락 칸, 28C-03)가 04에 들어오고 게터는 그 칸의 같은 참조를 돌려줄 뿐이며(26C-01의 규칙), `FormTypeInputProps.context`는 PR-7 렌더 계층이다.
  - 【추론】 맥락 변경의 정착은 로드가 아니므로 에지의 기준점은 직전 커밋이다(CONTROLS-080 (8) "기준점은 SETTLE-004대로 따르고, 같음 판정은 18C-50을 따른다").
  - 【추론】 같은 참조가 오면 바뀜이 없어 정착이 돌지 않고, 내용이 같은 새 객체도 "깊이 같은 값은 같은 참조로 본다"에 따라 바뀜이 아니어서 정착이 돌지 않는다(같음은 18C-50 (가)로 판정한다).
  - 【추론】 바뀌었으면 역의존 표의 `@` 항목이 가리키는 노드와 그 조상을 재계산 목록에 넣고, `@`를 읽는 게이트·상태 키는 그 재계산에서 다시 판정하며, `@`를 읽는 `derived`·`unsetValue`·`resetInteraction`에게는 에지이고 `injectTo`는 발화하지 않는다.
  - 【추론】 `setContext`는 억제 비트를 받지 않는다(옵션의 자리는 WRITE-015가 `setValue(V, option)`·`reset(option)`·마운트로, WRITE-091이 입력 `onChange`로 정한 것뿐이다); 호출 옵션이 없으므로 Form 속성 `disableAutomaticWrites`가 그 정착의 자동 쓰기에 기본값으로 든다(21C-01의 포커스 아웃 `trim`과 같은 모양).
  - 【추론】 내보내기 자리는 NODE-010대로다: `SchemaNode/` 진입점이 바인딩 전용으로 이름을 붙여 내보내고, `core/index.ts`는 이름으로 다시 내보내며(`finishInput`과 같은 취급), `src/index.ts`는 내보내지 않는다.
  - 【추론】 내용이 같은 새 객체가 오면 맥락 칸은 옛 참조를 그대로 둔다: 정착이 돌지 않는데 칸만 바뀌면 `node.context`의 참조가 통지 없이 바뀌기 때문이다(SETTLE-043 (나)와 같은 모양).
- 근거: SURFACE-055 "`node.context`는 루트의 맥락 객체(같은 참조)를 돌려주는 getter로 남긴다", "맥락의 갱신은 `finishInput`처럼 바인딩 전용 내부 통로(NODE-010)이며, 가칭 `setContext`다"; 26C-01 "원장이 PR을 적지 않은 멤버는 같은 규칙으로 그 기제를 들여오는 PR에 들며"; `reviews/raw-round17-node-structure.md:136`의 "설계 항목에 걸린 것 … `context`"; CONTROLS-080 "맥락이 바뀌는 것은 입력이 바뀌는 것이다", "바인딩이 바뀐 맥락을 루트에 전하면 정착 하나가 돈다", "원본은 표시하지 않고, 역의존 표의 `@` 항목이 가리키는 노드와 그 조상을 재계산 목록에 넣는다", "바뀜의 기준은 오늘처럼 스냅숏이라, 깊이 같은 값은 같은 참조로 본다", "`@`를 읽는 `derived`·`unsetValue`·`resetInteraction`에게 이 변경은 에지다", "기준점은 SETTLE-004대로 따르고, 같음 판정은 18C-50을 따른다", "`injectTo`는 자기 방출 값의 에지에만 발화하므로 맥락 변경으로는 발화하지 않는다"; WRITE-015 자리 행 "`setValue(V, option)`뿐 아니라 **`reset(option)`과 마운트**에도 둔다"와 우선순위 행 "호출에 둘 다 없으면 Form 속성을 따르고, 둘 다 주면 억제가 이긴다"; NODE-010 "내부 통로(입력 마침 신호 `finishInput`, 입력 출처 표식이 붙은 쓰기)는 클래스 멤버가 아니며 `SchemaNode/` 진입점이 바인딩 전용으로 이름을 붙여 내보낸다. `core/index.ts`는 이들을 이름으로 다시 내보내고 `src/index.ts`는 내보내지 않는다(공개 index의 키 목록 시험)".
