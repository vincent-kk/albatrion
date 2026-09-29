# 26라운드 닫기 — 03(노드 트리·정착, PR-2) 착수 전의 원장 해석 여섯 건

2026-09-29. 03 작업자(브랜치 `feat/schema-form-node-and-settle`, base `85e7d01af`)가 계획을 쓰기 전에 원장 해석 여섯 건을 물었다: PR-2 겉면 멤버의 범위, 동사 진입, "렌더 시나리오" 게이트의 실행 자리, 뒤 PR 기제를 쓰는 PR-2 게이트의 나눔, 게이트 평가의 몫, `SHARED_NODE_CONFLICT`의 신호. 모두 현행 항목과 소유자 답에서 유도되므로 소유자 물음 없이 원장 관리자가 닫는다(PROCESS-066). 소유자가 어느 결정이든 뒤집으면 그 답이 이긴다. 원장이 이미 정한 것(PR-2의 동사 진입은 TEST-069 "PR-2에서 사슬은 `settle` 호출 하나다(`setValue`가 `settle` 쓰기로 직접 위임)"과 LANDING-064 "겉면의 쓰기 위임을 `dispatch` 진입으로 옮김"; `degraded` 동안의 제출 거부는 TEST-069 (다)가 PR-7로 미룸; `SHARED_NODE_CONFLICT`의 조건은 BLUEPRINT-041 U2·BLUEPRINT-044 S5, 원인 값은 ERROR-133, 던지는 자리는 ERROR-070)은 항목 번호로 답했고 여기에는 다시 적지 않는다.

### 26C-01 겉면 멤버는 그 기제를 들여오는 PR에서 겉면에 든다 — PR-2 겉면의 범위, 미리 두는 스텁 없음

- 닫는 항목: NODE-010(보충), SURFACE-058(보충), LANDING-062(보충), TEST-069(보충), TEST-070(보충)
- 결정:
  - 【추론】 `SchemaNode` 겉면의 멤버는 그 멤버가 드러내는 기제를 들여오는 PR에서 겉면에 들고, 그 PR이 `SchemaNode/`의 `DETAIL.md` 목록·멤버 목록 시험·공개 형 `SchemaNode`를 함께 고친다(EVENT-063이 명령 메서드에 정한 방식).
  - 【추론】 PR-2의 겉면은 `reviews/raw-round17-node-structure.md:74`의 PR-2 목록(식별·값 게터, `active` 게터, `find`·`findNodes`, 가드, 생성, `settle`의 쓰기로 직접 위임하는 `setValue`)과 LANDING-062와 PR-2 게이트(WRITE-093, WRITE-099, SETTLE-049, ERROR-204)가 PR-2에 둔 `raw`·`extras`·`diagnostics`·`SetValueOption`·`defaultValue`·`resetSubtree`·`typeMismatch`·`typeMismatches`다.
  - 【추론】 명령 메서드 하나와 통지·검증 멤버(`subscribe`, `validate`, 오류 읽기와 외부 오류 설정)는 PR-4(EVENT-063·EVENT-073, LANDING-064), 배열 메서드는 PR-5(NODE-014, LANDING-065), 계산 게터 `visible`·`enabled`·`readOnly`·`disabled`는 PR-6(LANDING-066)에서 겉면에 든다.
  - 【추론】 원장이 PR을 적지 않은 멤버는 같은 규칙으로 그 기제를 들여오는 PR에 들며, 하위 트리 상태 쓰기와 `validate`처럼 여러 단계를 잇는 조율은 `dispatch`의 것이므로(NODE-010) PR-4다.
  - 【추론】 뒤 PR의 멤버를 PR-2 클래스에 무해한 구현(스텁)이나 `SchemaNodeRuntime` 칸으로의 위임으로 미리 두지 않는다: PR-2의 시험 대역은 `if` 게이트 술어 하나뿐이고 시험만을 위한 주입 자리를 새로 만들지 않는다(TEST-069 (나)); LANDING-062의 "게이트는 술어 인터페이스 뒤의 스텁"은 이 술어 하나를 말한다.
  - 【추론】 그래서 PR-2의 멤버 목록 시험은 PR-2 겉면의 목록을 단언하고, SURFACE-058의 약 54개는 PR-7 전환 시점의 수다; `plan/03-node-and-settle/verification.md:26`의 "이 PR은 명령 메서드 하나를 뺀 목록을 단언한다"는 이 블록으로 바꿔 읽는다.
  - 【추론】 TEST-070의 "배열 멤버"는 배열 멤버를 들여오는 PR-5가 같은 조건(`tsc --strict`, `as`·`any` 없음)으로 단언하고, PR-2는 PR-2 공개 형으로 나머지를 단언한다(26C-03).
- 근거: NODE-010 "멤버 목록은 공개 계약 목록과 같아야 하며, `SchemaNode/`의 `DETAIL.md` 목록과 프로토타입 멤버 이름을 맞대는 멤버 목록 시험으로 지킨다"; EVENT-063 "노드 메서드는 PR-4(배달 경로)에서 겉면에 더하고 멤버 목록 시험과 08 §13 행을 함께 고친다"; LANDING-066의 PR-6 내용 "겉면의 계산 게터(`visible`·`enabled`·`readOnly`·`disabled`)"; LANDING-064의 PR-4 내용 "겉면의 쓰기 위임을 `dispatch` 진입으로 옮김"; TEST-069 "각 PR이 자기가 들여오는 기제를 검증한다", "그 밖의 대역은 두지 않는다", "시험만을 위한 주입 자리(파생 단계, 디스패처)를 새로 만들지 않는다"; SURFACE-056 "새 이름의 공개 형은 PR-2의 `SchemaNode/type.ts`가 처음부터 쓰고, 소비자 이주는 PR-7이다"(PR-7 전에는 공개 형의 소비자가 없으므로 형도 PR마다 자란다).

### 26C-02 PR-2에 배정된 "렌더 시나리오" 게이트는 코어 러너가 잰다 — `FormHandle.reset()`은 루트 로드로 읽고, 렌더 실행기와 제출 거부는 PR-7, 경고 중복 키는 PR-4

- 닫는 항목: WRITE-093(보충), WRITE-098(보충), WRITE-099(보충), TEST-023(보충), ERROR-204(보충)
- 결정:
  - 【추론】 PR-2에 배정된 "렌더 시나리오" 게이트는 시나리오를 `@aileron/schema-form-scenarios`의 순수 데이터로 두고, 코어 시나리오 시험(`src/core/__tests__/scenarios/<부류>.spec.ts`)이 새 노드 트리에서 돌리는 것으로 통과를 잰다.
  - 【추론】 같은 데이터를 `<Form>`으로 그리는 시나리오 스토리와 e2e 실행기는 `<Form>`이 새 엔진을 쓰는 PR-7부터 돈다.
  - 【추론】 게이트 문장의 `FormHandle.reset()`은 코어에서 루트 노드의 폼 수준 로드(마운트와 같은 초기화 범위, 로드 스냅숏 갱신)로 읽고, `resetSubtree()`는 그 노드의 로드로 읽는다.
  - 【추론】 ERROR-204 게이트의 제출 거부 단언은 제출이 Form 바인딩이므로 PR-7이 하고, 경고 중복 키의 초기화 단언은 경고의 구조 키를 들여오는 PR-4가 하며(ERROR-032, LANDING-064), PR-2는 `diagnostics`의 초기화만 단언한다.
- 근거: TEST-023의 코어 시나리오 시험 행 "`src/core/__tests__/scenarios/<부류>.spec.ts` | 데이터 모듈을 노드 트리에서 해석 | vitest `node`"; LANDING-159 "규칙 3: `src/core/index.ts`와 `src/index.ts`는 PR-7까지 옛 엔진을 가리킨다", "새 엔진은 PR-7 전까지 `<Form>`에 닿지 않는다", "'버리고 새로 쓴다'는 레거시로 옮겨 돌다가, 그 상황 목록이 대체 PR의 데이터 모듈로 옮겨진 뒤"; WRITE-085 "루트는 로드 스냅숏 하나를 든다", "경로 P에 값 V를 싣는 로드마다 `snapshot = setIn(snapshot, P, V)`로 고친다"; WRITE-090 "로드는 마운트, `FormHandle.reset()`(커밋된 prop), `resetSubtree()`(그 하위 트리)뿐이며, 로드는 새 수명이라 형상의 모든 노드를 생긴 노드로 치고 없음인 값이 채움을 받는다"; TEST-069 "`degraded` 동안의 제출 거부는 PR-7로 미룬다"; ERROR-032의 PR-4 행 "경고의 구조 키, 정착 경고 판정의 소비자 조건"; LANDING-064의 PR-4 내용 "경고의 구조 키 중복 억제".

### 26C-03 PR-2 게이트가 뒤 PR의 기제를 쓰면 — PR-2는 자기 기제로 관찰할 수 있는 신호까지, 발화·배달 단언은 그 기제의 PR

- 닫는 항목: SETTLE-048(보충), SETTLE-049(보충), EVENT-071(보충), WRITE-096(보충), TEST-069(보충)
- 결정:
  - 【추론】 게이트에 "PR: PR-2"라 적혀도 그 단언이 뒤 PR의 기제(`controls.derived`·`controls.injectTo`는 PR-3, 통지·사건 배달은 PR-4)를 요구하면, 그 단언은 그 기제가 모두 있는 가장 이른 PR에서 하고 PR-2는 자기 기제로 관찰할 수 있는 신호를 단언한다(TEST-069 (라)).
  - 【추론】 SETTLE-048: PR-2는 로드가 에지·생김의 기준을 비우고 로드가 아닌 쓰기(`setValue(V)` 포함)가 직전 커밋을 기준으로 삼는 것을 생김과 채움으로 단언하고, `derived`·`injectTo`의 발화 유무는 PR-3이 같은 시나리오로 단언한다.
  - 【추론】 SETTLE-049: PR-2는 `resetSubtree()`의 채움과 비움의 범위가 그 하위 트리임을 단언하고, `injectTo` 발화의 범위와 대상 값은 PR-3이 단언한다.
  - 【추론】 EVENT-071: PR-2는 커밋이 모으는 Refresh 대상 집합(원본이 실제로 바뀐 노드, 쓴 입력 제외; `setValue(getValue())`는 빈 집합)을 단언하고, 리스너 안의 `setValue`와 `RequestRefresh` 배달 횟수는 PR-4, 캐럿·IME 상태는 PR-7이 단언한다.
  - 【추론】 WRITE-096: PR-2는 표시 단계가 기록하는 쓰기 종류('호출자 전체 교체')를 표시 단계의 기록(VALUE-032)으로 단언하고, `UpdateValue`의 출처 칸은 PR-4가 단언한다.
  - 【추론】 미룬 단언은 PR-2의 `log.md`와 PR 본문에 사례마다 PR 번호를 단다(TEST-069가 처분 목록에 정한 방식).
- 근거: TEST-069 "뒤 PR의 기제가 있어야 하는 사례는 그 기제를 들여오는 PR의 시험으로 넘기며, 잃지 않도록 PR-0의 처분 목록이 사례마다 PR 번호를 단다", "(라) 프로토타입 회귀의 배분: 한 사례는 그것이 건드리는 기제가 모두 있는 가장 이른 PR로 간다"; LANDING-063의 PR-3 내용 "`controls.derived`·`controls.injectTo`·`controls.unsetValue`"; LANDING-064의 PR-4 내용 "상태·오류·명령 사건과 검증 결과의 배달 경로"; EVENT-071의 PR 줄 "PR-2(정착의 Refresh 대상)·PR-7(입력의 다시 마운트)"; WRITE-096 "쓰기 종류의 목록(VALUE-032)과 `UpdateValue` 출처 칸의 값(EVENT-060)에 '호출자 전체 교체'(`setValue(V)`)를 더한다".

### 26C-04 PR-2의 게이트 평가 — 판별과 `controls.active`는 PR-2가 실제로 평가, `if`만 술어 대역, 평가 자리 L은 PR-2가 청사진에 더한다

- 닫는 항목: TEST-069(보충), SETTLE-045(보충), LANDING-062(보충), FRAGMENT-009(보충)
- 결정:
  - 【추론】 판별 게이트(`{ kind: 'discriminator' }`)는 PR-2가 `./<key>`의 값이 `values`에 드는가로 평가하고 분기의 `controls.active`와 AND 하나로 묶는다(25C-06).
  - 【추론】 `controls.active` 게이트(노드 게이트·조각 게이트)는 PR-2가 청사진이 컴파일한 식(`BlueprintExpression.evaluate`)으로 호스트 바퀴에서 실제로 평가하며, 술어 인터페이스 뒤의 대역으로 두지 않는다.
  - 【추론】 `if` 게이트만 `record/`가 선언한 술어 인터페이스 뒤에 두고 시험은 대역 하나를 쓰며, 실제 술어는 PR-4의 `compileGuard`가 넣는다.
  - 【추론】 04(PR-3·PR-6)의 몫은 `controls.derived`·`injectTo`·`unsetValue`와 상태 키·`controls.children`·조각 `controls` 층·`unsetOnInactive`이고(LANDING-063, LANDING-066), `controls.active` 게이트의 평가는 정착(PR-2)의 몫이다.
  - 【추론】 SETTLE-045의 평가 자리 L은 청사진의 일이지만 02의 `BlueprintGate`(`src/core/blueprint/type.ts:27-40`)에는 그 칸이 없으므로, PR-2가 청사진에 L의 계산과 그 칸을 더한다: 청사진 구조체는 내부 구조이고(BLUEPRINT-026, 25C-06), SETTLE-045의 (a)–(c)는 PR-2의 게이트이며(TEST-069 보충), 뒤 PR이 청사진을 고치는 선례는 PR-5의 `resolveArrayLimits` 이동이다(LANDING-094).
  - 【추론】 그 변경은 `src/core/blueprint/__tests__/`에 L 계산의 세 규칙(`#` 단독과 `(/)`는 루트, `/p`·`#/p`는 `p`의 자리, `@`는 셈하지 않음)의 사례를 더한다.
- 근거: TEST-069 "PR-2는 식·가드 실패의 자리별 값과 `cause: 'expression'`을 시험하며, 식은 PR-1의 실제 컴파일러를 쓴다", "(나) 시험 대역은 게이트 술어 하나다", "대역의 계약은 PR-4의 `compileGuard`가 돌려주는 술어와 같은 모양이다"; LANDING-062의 PR-2 내용 "공개 `type`·`strategy` 게터와 `active` 게터(노드 게이트)", "표시·계산(호스트 바퀴, 노드 게이트, 투영)"; FRAGMENT-009 "`if` 게이트: … 검증기 플러그인의 `compileGuard`로 동기 평가한다", "`controls.active` 게이트: 예약 층의 표현식이다"; WRITE-099의 PR-2 게이트(전이 라운드 상한 "게이트 가진 조각 수 + 노드 게이트 수 + 1")는 조각 게이트의 평가를 전제한다; SETTLE-045 "청사진이 그 게이트의 평가 자리를 L로 옮긴다", "PR: PR-2 정착 시나리오(18C-25의 PR-2 시험)와 PR-2 벤치"; 02의 `BlueprintExpression.evaluate`는 "순수 컴파일된 호출 가능 값이며 실행은 정착의 것이다"(`src/core/blueprint/type.ts:180-181`).

### 26C-05 `SHARED_NODE_CONFLICT`의 형 충돌 신호 — `EffectiveSchema { schema, typeConflict }`가 최종 모양, 정착이 읽어 사슬 끝에서 던진다

- 닫는 항목: BLUEPRINT-041(보충), BLUEPRINT-044(보충), SCHEMA-045(보충), ERROR-070(보충), ERROR-133(보충)
- 결정:
  - 【추론】 25C-04의 "최종 모양은 PR 03이 정한다"를 닫는다: 형 충돌 신호의 최종 모양은 `EffectiveSchema { schema, typeConflict }` 그대로이며(`src/core/blueprint/type.ts:229`), PR-2는 그 모양을 바꾸지 않는다.
  - 【추론】 정착은 활성 집합의 유효 스키마를 계산한 뒤 `typeConflict`가 참인 노드마다 정착 오류 `SHARED_NODE_CONFLICT`를 내고, `diagnostics.cause`는 `'sharedConflict'`이며, 드러남은 정착 오류 규칙대로 모든 환경에서 커밋·통지 뒤 사슬 끝이다(PR-2에서 사슬은 `settle` 호출 하나).
  - 【추론】 오류의 조건은 그 게이트들이 켜진 동안이고(BLUEPRINT-041 U2), 그로 인한 `degraded`는 ERROR-204대로 폼 수준 로드에서만 비운다.
  - 【추론】 BLUEPRINT-044 S5의 다른 조건(정적 선언이 없는 이름에서 fold가 다른 게이트 선언이 동시에 켜짐)은 유효 스키마의 신호가 아니며, 정착이 켜진 선언 집합에서 판정해 같은 코드 `SHARED_NODE_CONFLICT`와 `cause: 'sharedConflict'`로 낸다.
- 근거: BLUEPRINT-044 "fold가 다른 게이트 선언이 동시에 켜지면 `SHARED_NODE_CONFLICT`이고, 배타이면 종류별 노드이며"; BLUEPRINT-041 "U2: 빈 교집합만이 충돌이며, 정적이면 청사진 오류, 게이트이면 그 게이트들이 켜진 동안의 정착 오류"; BLUEPRINT-044 "켜진 게이트 선언과 정적 허용 집합의 교집합(`'null'` 포함)이 빈 경우 … 그 게이트들이 켜진 동안 `SHARED_NODE_CONFLICT`(정착 오류, 기존 처리)로 드러난다"; ERROR-133 "공유 충돌이면 `'sharedConflict'`다"; ERROR-070 "정착 오류 … 와 공유 충돌은 모든 환경에서 커밋·통지 뒤 사슬 끝에서 던진다"; TEST-069 "PR-2에서 사슬은 `settle` 호출 하나다"; 25C-04 "보정 PR은 그 신호를 `mergeEffectiveSchema`의 반환 `{ schema, typeConflict }`로 드러내고 … 최종 모양은 PR 03이 정한다".

### 26C-06 루트가 드는 트리 전체 자료의 저장 자리 — `SchemaNodeRuntime`의 칸이며 `record/`가 선언한다, 루트 전용 레코드 필드 없음

- 닫는 항목: NODE-004(보충), NODE-045(보충), NODE-043(보충), WRITE-085(보충), VALUE-030(보충)
- 결정:
  - 【추론】 원장이 "루트가 든다"고 적은 트리 전체 자료(로드 스냅숏, 잠복 원본, 경고등 경로 집합, 잠복 원본 열거의 메모)의 저장 자리는 트리마다 하나인 `SchemaNodeRuntime`의 칸이며, 루트는 자기 `runtime` 필드를 통해 그것을 든다.
  - 【추론】 NODE-004의 런타임 열거(통지 대기열, 검증기, 진단, 진입 깊이와 예산, `nodeFactory`, `onError` 보고기)는 닫힌 목록이 아니며, 칸을 더할 때는 NODE-045대로 `record/`의 선언을 고치고 그 대가를 레코드 `DETAIL.md`에 적는다.
  - 【추론】 레코드에 루트 전용 필드를 두지 않는다: 공통 필드는 고정 배치다(NODE-004).
  - 【추론】 진입 깊이와 예산 가운데 중첩 진입의 칸은 그 기제를 들여오는 PR-4가 더하고(26C-01, TEST-069), 런타임은 루트 참조를 따로 들지 않는다(레코드 필드로 닿는다).
- 근거: NODE-004 "노드 필드 `runtime`은 트리마다 하나인 `SchemaNodeRuntime`(통지 대기열, 검증기, 진단, 진입 깊이와 예산, `nodeFactory`, `onError` 보고기)을 가리킨다", "공통 필드는 고정 배치하고"; NODE-045 "칸을 하나 더하면 `record/`의 선언을 고친다", "그 대가를 레코드 `DETAIL.md`에 적는다(`Behavior`와 같은 방식)"; NODE-044 "트리 전체를 읽는 `globalState`·`globalErrors`도 살아 있는 런타임을 읽는다(18C-41)"; WRITE-085 "루트는 로드 스냅숏 하나를 든다"; NODE-043 "그 원본은 루트가 잠복 원본으로 (절대 경로, 종류)를 키로 든다"; VALUE-029 "루트가 형상에 없는 노드의 원본을 들고 있으므로 저장 자리와 같다"; VALUE-030 "루트 노드가 켜진 노드의 경로 집합을 든다"; TEST-069 "진입 사슬의 사슬 끝 throw(중첩 진입, …)는 PR-4로 미룬다".
