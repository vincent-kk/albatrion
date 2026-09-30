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

### 26C-07 재귀 참조 템플릿 안 게이트의 평가 자리 L — 청사진은 템플릿 정적 부분을, 발생마다의 L은 정착이 노드를 만들 때 한 번 계산해 메모한다

- 닫는 항목: SETTLE-045(보충), BLUEPRINT-030(보충)
- 결정:
  - 【추론】 SETTLE-045의 L(선언한 호스트와 식이 읽는 모든 경로의 자리를 함께 덮는 가장 낮은 공통 조상 호스트)은 발생의 절대 호스트 경로에 대한 함수이므로, 한 청사진 위치가 여러 깊이에서 발생하는 재귀 참조 템플릿에서는 발생마다 다를 수 있다.
  - 【추론】 그래서 SETTLE-045의 "청사진이 그 게이트의 평가 자리를 L로 옮긴다"는 템플릿에 정적인 부분까지다: 청사진은 게이트 식이 읽는 경로 목록(절대 경로는 그대로, 상대 경로는 호스트에서 오르는 단 수)을 게이트에 든다.
  - 【추론】 발생마다의 L은 정착이 그 게이트를 가진 노드를 만들 때 한 번 계산해 메모하고, 바퀴마다 다시 계산하지 않는다.
  - 【추론】 발생이 하나인 위치에서는 그 값이 곧 청사진의 정적 L과 같다(26C-04).
  - 【추론】 절대 경로를 읽는 게이트를 재귀 템플릿 안에서 청사진 오류로 거부하지 않는다.
- 근거: BLUEPRINT-030 "청사진은 작성 루트에서 닿는 스키마 위치마다 한 번만 만든다", "정착에서 노드를 만들 때 같은 청사진 위치가 원본 없는 조상 사슬에서 되풀이되어"; SETTLE-045 "L은 선언한 호스트와, 식이 읽는 모든 경로의 자리를 함께 덮는 가장 낮은 공통 조상 호스트다", "메모는 상속 overlay와 같게 한다", "이 재계산은 호스트 바퀴 예산에 함께 센다"; CONTROLS-080 "경로 토큰은 오늘 그대로 `./p`, `../p`(되풀이할 수 있다), `/p`다", "`#/p`는 `/p`와 같다"; 02의 `BlueprintExpression.hostPath`는 "템플릿 상대 호스트 원점이며 발생의 자식 에지에서 다시 묶인다"(`src/core/blueprint/type.ts:176-177`).

### 26C-08 떼어진 노드의 `active`는 거짓 — `active` 게터는 형상에 있는가를 읽는 살아 있는 트리의 멤버, NODE-044 고정 규칙의 예외

- 닫는 항목: NODE-044(보충), VALUE-006(보충), CONTROLS-021(보충)
- 결정:
  - 【추론】 `active` 게터는 그 노드가 형상에 있는가(선언한 조각이 켜져 있고 노드 자신의 `controls.active`가 거짓이 아님, VALUE-006)를 읽는 멤버이므로, 살아 있는(형상 안) 노드에서는 늘 참이다.
  - 【추론】 떼어진 노드의 `active`는 거짓이다: 떼어짐은 형상을 떠난 것이고, 이 멤버는 `rootNode`·`globalState`·`globalErrors`처럼 살아 있는 트리의 사실을 읽는 NODE-044 고정 규칙의 예외다.
  - 【추론】 조각 게이트가 꺼져 떼어진 경우도 같으며(노드 게이트 값이 아니라 형상 여부를 읽는다), 노드가 다시 형상에 들어도 옛 참조의 `active`는 거짓인 채다(새 인스턴스가 참이다).
  - 【추론】 형상에 남으면서 `active`가 거짓인 노드는 없다.
- 근거: VALUE-006 "노드가 **형상에 있다**는 것은 그 노드를 선언한 조각이 켜져 있고 노드 자신의 `controls.active`가 거짓이 아니라는 뜻이다"; CONTROLS-021 "`active` | 게이트. 거짓이면 그 노드는 형상에 없다"; NODE-044 "트리는 그 노드를 버리고", "예외로 `rootNode`는 살아 있는 루트이고, 트리 전체를 읽는 `globalState`·`globalErrors`도 살아 있는 런타임을 읽는다(18C-41)", "노드가 다시 형상에 들면 새 인스턴스를 만든다"; LANDING-062 "`active` 게터(노드 게이트)"; TEST-069 "PR-2는 노드 구조 시험 전부, 린트 설정, `active` 게터 … 를 시험한다"(늘 참인 상수라면 시험할 뜻이 없다).

### 26C-09 자기를 부정하는 게이트(`if: not required x` → `then: x default`)는 수렴하지 않고 전이 라운드를 넘긴다 — 진동의 원인은 채움이 아니라 존재 여부

- 닫는 항목: SETTLE-005(보충), SETTLE-011(보충)
- 결정:
  - 【추론】 게이트가 자기가 선언하는 노드의 존재를 읽으면(`if: { not: { required: ['x'] } }`, `then: { properties: { x: { default: 1 } } }`), 라운드마다 형상이 뒤집힌다: x 없음 → 게이트 참 → x가 생긴 노드로 채움 → 다음 라운드에 x 있음 → 게이트 거짓 → x가 형상을 떠남(원본은 잠복) → 다음 라운드에 방출에 x가 없어 다시 참 → x가 다시 들되 원본이 이미 있어 채움은 없음 → 다시 거짓.
  - 【추론】 진동의 원인은 채움이 아니라 형상 안팎의 존재 여부이므로 "노드마다 한 정착에서 한 번만 채운다"는 것으로 수렴하지 않으며, 게이트는 방출 트리를 읽고 형상 밖은 없음이다(CONTROLS-080).
  - 【추론】 그래서 이 사례는 전이 라운드 상한(게이트 가진 조각 수 + 노드 게이트 수 + 1, 여기서는 2)을 넘겨 SETTLE-011대로 채움을 뺀 원본 B를 커밋하고, `diagnostics`는 `'degraded'`·`cause: 'budget'`·`exceededBudget: 'transition'`·`iterations`는 상한값이며, 모든 환경에서 커밋·통지 뒤 사슬 끝에서 던진다.
  - 【추론】 프로토타입(`spikes/round9/regress/selfcheck-v5.mjs:215-227`)의 개발 모드에서만 던지는 기대는 옛 규칙이며 ERROR-070·071·072가 이긴다.
- 근거: SETTLE-005 "생긴 노드 — 직전 커밋의 형상에 없고 이번 최종 형상에 있는 노드 — 의 없음인 값에 채움", "채움이나 나감의 비움이 다음 라운드를 부르는 것은 그 쓰기가 게이트를 뒤집어 새 노드를 내거나 노드를 내"; SETTLE-011 "정착의 세 예산(호스트 바퀴, 파생 라운드, 전이 라운드) 가운데 하나라도 상한을 넘기면, 그 정착의 자동 쓰기 … 를 모두 뺀 원본 B를 커밋한다"; CONTROLS-080 "경로는 방출 트리를 읽음, 형상 밖은 `undefined`"; SETTLE-013 "`diagnostics.iterations`는 초과한 예산이 쓴 반복 횟수(상한값)다"; ERROR-070 "정착 오류 … 는 모든 환경에서 커밋·통지 뒤 사슬 끝에서 던진다"; ERROR-072 "끄는 스위치는 없다"; TEST-069 "(가) PR-2는 예산 다섯 가운데 호스트 바퀴와 전이 라운드를 실제 코드로 시험한다".

### 26C-10 떼어진 참조의 읽기와 쓰기 — `diagnostics`는 살아 있는 트리를 읽고, 경고등·잠복 열거·`defaultValue`는 갈무리, 쓰기는 살아 있을 때와 같은 규칙으로 잠복 원본에

- 닫는 항목: NODE-044(보충), SURFACE-007(보충), WRITE-079(보충)
- 결정:
  - 【추론】 떼어진 노드에서 `diagnostics`는 살아 있는 트리(런타임의 진단 칸)를 읽는 NODE-044 고정 규칙의 예외다: `diagnostics`는 트리 전체의 커밋을 기술하며(ERROR-131) 루트에서 관측하는 것이라(SURFACE-007) `globalErrors`와 같은 부류다.
  - 【추론】 `typeMismatch`·`typeMismatches`·`inactiveValues`·`defaultValue`는 NODE-044의 고정 읽기이며, 떼어질 때 그 노드가 형상에 있던 마지막 커밋의 값을 한 번 갈무리한다.
  - 【추론】 떼어진 참조에 쓴 값은 살아 있는 노드에 쓸 때와 같은 쓰기 규칙으로 루트의 (경로, 종류) 잠복 원본에 닿는다: 전체 교체(옵션 없음·`Overwrite`·`setValue(V)`)는 그 경로의 잠복 원본을 받은 값으로 바꾸고 그 아래 자손의 잠복 원본을 없음으로 하며, `Merge`는 WRITE-079대로 키로 합칠 수 있는 자리에서만 합치고 그 밖은 통째로 바꾼다.
  - 【추론】 규칙 평가와 방출은 없으며, 그래서 떼어지기 전과 뒤에 같은 순서로 쓴 결과의 원본이 같다.
- 근거: NODE-044 "떼어진 노드의 읽기 멤버는 모두 그 노드가 형상에 있던 마지막 커밋의 값을 돌려주고, 그 뒤로 바뀌지 않는다", "예외로 `rootNode`는 살아 있는 루트이고, 트리 전체를 읽는 `globalState`·`globalErrors`도 살아 있는 런타임을 읽는다(18C-41)", "그 쓰기는 루트의 그 (경로, 종류) 잠복 원본을 고치고, 규칙을 평가하지 않으며, 아무것도 내지 않는다", "그래서 순차 쓰기와 묶음 쓰기가 같은 원본에 닿는다"; ERROR-131 "모든 칸은 `commit` 번호의 커밋을 기술한다"; SURFACE-007의 인용 "노드 칸 `diagnostics` … 루트에서 관측한다"; WRITE-079 "`Merge`는 키로 합칠 수 있는 자리에서만 합친다", "바뀐 자리의 자식 원본은 없음이 되고, 호스트는 받은 값을 든다"; 26C-06(진단은 런타임의 칸).

### 26C-11 전이 라운드 안의 호스트 바퀴 초과는 그 자리에서 비수렴 — `exceededBudget`은 넘긴 예산의 이름, 26C-09의 값은 `'hostWheel'`

- 닫는 항목: SETTLE-011(보충), SETTLE-003(보충), SETTLE-005(보충), SETTLE-012(보충)
- 결정:
  - 【추론】 전이 라운드 안에서 호스트 바퀴가 상한을 넘기면 그 자리에서 정착은 비수렴이다: 뒤의 채움이 풀어 주기를 기다리지 않고 SETTLE-011대로 원본 B를 커밋하며, `exceededBudget`은 `'hostWheel'`이다.
  - 【추론】 호스트 바퀴 초과를 형상 변경으로 삼아 전이 라운드를 이어 가지 않는다: 같은 형상에 닿는 두 로드가 다른 `status`를 내는 것은 P3(형상은 상태의 순수 함수, SETTLE-029)에 어긋난다.
  - 【추론】 그래서 `exceededBudget`은 넘긴 예산의 이름이다: 한 바퀴 안에서 게이트가 진동하면 `'hostWheel'`, 채움·비움이 게이트를 뒤집어 라운드 수가 상한을 넘기면 `'transition'`.
  - 【추론】 26C-09의 사례는 라운드 2의 호스트 바퀴에서 진동하므로(x의 원본 1이 잠복해 있어 바퀴 안에서 x가 들면 있음, 나면 없음으로 게이트가 뒤집히고, 채움은 노드마다 한 번이라 전이 라운드는 넘치지 않는다) `exceededBudget`은 `'hostWheel'`이며, 26C-09 셋째 문장의 `'transition'`은 이 문장으로 바꿔 읽는다; 원본 B·`degraded`·`cause: 'budget'`·`iterations` 상한값·사슬 끝 throw는 그대로다.
- 근거: SETTLE-011 "정착의 세 예산(호스트 바퀴, 파생 라운드, 전이 라운드) 가운데 하나라도 상한을 넘기면, 그 정착의 자동 쓰기 … 를 모두 뺀 원본 B를 커밋한다"; SETTLE-003 표의 예산 칸 "호스트 바퀴 = 게이트 가진 조각 수 + 노드 게이트 수 + 1"; SETTLE-022 "참이면 켜고 거짓이면 끈다. `A`가 바뀌면 다시 돈다"; SETTLE-029 "형상은 상태의 순수 함수(P3)이므로 출발점 고정 + 비단조 재평가. 고정점이 없는 스키마는 지원 범위 밖이고 `degraded`로 관측 가능하다"; SETTLE-005 보충 "노드마다 정착 안에서 채움 한 번·비움 한 번뿐이라 같은 게이트가 다시 뒤집혀도 새 라운드를 낳지 않는다"; ERROR-130 "`exceededBudget?: 'hostWheel' | 'derive' | 'transition'`".
