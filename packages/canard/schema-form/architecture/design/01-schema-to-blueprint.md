# 01 스키마에서 청사진까지

이 문서는 원장의 SCHEMA·BLUEPRINT·FRAGMENT 영역을 읽는 표면이다. 정본은 `ledger/`이며, 문장 끝 괄호의 ID가 근거이고, 어긋나면 원장이 이긴다.

## 소유자 통과

| 절 | 상태 | 날짜 |
| --- | --- | --- |
| 1.1 폼이 읽는 스키마와 검증기의 경계 | 대기 | — |
| 1.2 단일 스키마와 표현 층 | 대기 | — |
| 1.3 유효 스키마와 병합표 | 대기 | — |
| 1.4 교차 결과와 필수 표시 | 대기 | — |
| 1.5 게이트 없는 분기의 병합 | 대기 | — |
| 2.1 청사진 분석과 형태 | 대기 | — |
| 2.2 전순서와 계산 준비 | 대기 | — |
| 2.3 노드 종류와 공유 | 대기 | — |
| 2.4 명시 판별 | 대기 | — |
| 2.5 union 노드의 범위와 계약 | 대기 | — |
| 2.6 허용 집합과 유효 목록 | 대기 | — |
| 2.7 형을 명시하지 않은 칸 | 대기 | — |
| 2.8 청사진 판정 절차와 사례 | 대기 | — |
| 3.1 조각과 게이트의 기본 모델 | 대기 | — |
| 3.2 형상과 노드의 상태 | 대기 | — |
| 3.3 게이트 입력과 반복 계산 | 대기 | — |
| 3.4 읽지 않는 검증 문법과 오류 | 대기 | — |
| 3.5 분기와 판별의 원리 | 대기 | — |
| 3.6 명시 판별자의 변환 | 대기 | — |
| 3.7 분기 게이트와 작성 관행 | 대기 | — |
| 3.8 분기의 동시 활성과 값 보존 | 대기 | — |

## 1. 스키마

### 1.1 폼이 읽는 스키마와 검증기의 경계

(SCHEMA-001, SCHEMA-002, SCHEMA-003, SCHEMA-004, SCHEMA-005, BLUEPRINT-030)

| 폼이 읽는 것 | 어떻게 쓰는가 |
| --- | --- |
| `type`, 튜플(다중 `type`은 BLUEPRINT-036의 설계 항목) | 노드의 종류 |
| `properties`, `items`, `prefixItems`(옛 철자 `items: [...]`도 읽는다) | 자식의 존재 |
| `if/then/else`, `allOf` 항목, `oneOf`·`anyOf`의 분기 | 조각(FRAGMENT-001) |
| `default` | 노드가 생길 때 채움의 원천(`controls.default` 다음) |
| `readOnly` | 그 노드의 잠금 |
| `$ref`, `$defs`·`definitions` | 참조를 따라 형상을 만든다. 재귀는 지연 해석으로 유한 트리(11라운드 실측). 객체 프로퍼티만의 순환은 청사진 오류, 원본 없는 사슬의 게이트 순환은 정착 오류로 한정한다 |
| 주석 키워드(`title`, `description`, `format`, `examples`, `$comment`, `writeOnly`) | 유효 스키마에 병합해 렌더 계층에 건넨다 |

읽지 않는 것: `required`, `false`, `not`, `additionalProperties`, `patternProperties`, `dependentSchemas`, 범위·패턴·`enum`·`const`(`controls.discriminator` 아래만 예외)(SCHEMA-006, FRAGMENT-047). 이것들은 검증기에 그대로 간다(SCHEMA-006). `dependentSchemas`는 읽지 않고 청사진 경고를 낸다(SCHEMA-006, FRAGMENT-047, ERROR-191).

【추론】 동적 키는 노드가 되지 않는다(SCHEMA-040). 【추론】 두 키워드(`patternProperties`, 스키마 값 `additionalProperties`)는 검증기에만 간다(SCHEMA-040). 【추론】 선언되지 않은 키의 값은 호스트의 `extras`에 받은 순서대로 남아 방출된다(SCHEMA-040). 【추론】 입력은 그려지지 않는다(SCHEMA-040). 【추론】 맵을 편집하려면 작성자가 그 객체를 터미널로 두고(`options.terminal: true` 또는 인라인 입력) 값 전체를 편집하는 입력을 쓴다(SCHEMA-040).

### 1.2 단일 스키마와 표현 층

**Form은 단일 `jsonSchema`를 받는다.**(SCHEMA-016) FE의 표현 층을 얹는 일은 소비자가 스키마를 넘기기 전에 자기 방식으로 merge해서 한다(SCHEMA-016). 직렬화할 수 없는 값(입력 컴포넌트)을 넣는 통로는 이미 있다 — `formTypeInputMap`(데이터 경로로 매칭)과 `formTypeInputDefinitions`(SCHEMA-016). 입구가 하나면 인라인 키와 오버레이 사이의 우선순위 규칙도 필요 없다(SCHEMA-016). 하나의 개념에 하나의 장치다(목표 G4(하나의 개념에는 하나의 장치))(SCHEMA-016, GOAL-006).

(2) FE가 서버 스키마에 얹는 키는 그룹 객체 셋 안에만 있다(SCHEMA-015). 셋 다 검증기 앞에서 지워진다(VALIDATE-004)(SCHEMA-015, VALIDATE-004). 15라운드에 13라운드 답 3의 경계와 14라운드 O-9의 닫힌 목록을 대체한다(SCHEMA-015).

`overlay` prop을 철회한 이유 — 그것이 주겠다던 이점이 성립하지 않았다(SCHEMA-017).

1. "검증기에 서버의 원본이 그대로 간다." strict 모드는 기본이 아니다(VALIDATE-005)(SCHEMA-017, VALIDATE-005). 검증기는 미지 키워드를 무시하므로 제어 키가 섞인 merge본과 원본을 **같게 판정한다.**(SCHEMA-017) 기본 구성에서 이 이점은 0이다(SCHEMA-017). 그룹 셋은 검증기 사본에서 늘 지운다, BE가 strict면 같은 셋을 지운다(SCHEMA-017, CONTROLS-047).
2. "오버레이의 표준 키워드를 거부한다." merge하면서 `type`이나 `required`를 건드리는 것은 작성자의 책임이다(SCHEMA-017). 스키마 선언의 책임을 작성자에게 두는 것이 이 재설계의 일관된 원칙이다(목표 G3(의미는 위임한다 — 재구현하지 않는다))(SCHEMA-017, GOAL-005).
3. "가리키는 위치가 스키마에 없으면 경고한다." 편의이고, Form의 두 번째 입구가 되어야 할 이유가 아니다(SCHEMA-017).

- 목표 C1(BE 소유 스키마 위에 FE의 표현 층을 얹는 수단)은 새 장치 없이 충족된다(SCHEMA-018, GOAL-014). 필요한 것은 문서다 — "서버 스키마에 제어 키를 merge하는 방법, 컴포넌트를 `formTypeInputMap`으로 꽂는 방법"을 이행 문서와 배포 문서에 적는다(목표 C8(이행 경로), GOAL-021)(SCHEMA-018, GOAL-021).
- merge본은 서버의 스키마와 바이트 단위로 같지는 않지만 판정은 같다(같은 설정의 검증기, VALIDATE-002)(SCHEMA-018, VALIDATE-002).
- `$ref`로 재사용되는 정의에 merge한 설정은 그 정의가 쓰이는 모든 곳에 적용된다(SCHEMA-018). 위치마다 다르게 주려면 `formTypeInputMap`처럼 데이터 경로로 매칭하는 기존 통로를 쓴다(SCHEMA-018).

【추론】 merge 안내 문서에 이 쓰임을 예로 더한다(SCHEMA-018).

【추론】 제공하지 않는다(SCHEMA-046). 【추론】 서버 스키마에 예약 층 키를 얹는 merge는 소비자가 자기 방식으로 한다(SCHEMA-046). 【추론】 패키지는 그 방법을 이주 안내와 배포 문서에 적는 것까지만 한다(PR-8)(SCHEMA-046). 【추론】 위치 불일치 경고용 helper도 두지 않는다(SCHEMA-046).

### 1.3 유효 스키마와 병합표

**병합표(축 5항(노드의 제약을 최신화해 제공한다)).**(SCHEMA-007) 노드의 유효 스키마는 켜진 조각을 전순서로 합친 것이다(SCHEMA-007). 전순서는 호스트에서 조각까지의 경로를 (키워드 순위, 배열 인덱스) 쌍의 열로 보고 사전식으로 비교한 것이다(SCHEMA-007). 키워드 순위는 본체 `properties` < `allOf` 항목 < `if/then/else` < `oneOf` 분기 < `anyOf` 분기다(SCHEMA-007, FRAGMENT-049). JSON 키 순서에 기대지 않는다(SCHEMA-007).

렌더 계층이 읽는 힌트이며 검증기에는 가지 않는다(SCHEMA-007). **메모.**(SCHEMA-007) 유효 스키마는 활성 덧씌움 집합(그 노드에 얹힌 켜진 조각들의 집합)마다 메모한다(SCHEMA-007). 같은 집합이면 같은 참조를 돌려준다(SCHEMA-007).

(SCHEMA-008, SCHEMA-009, SCHEMA-010, SCHEMA-012, SCHEMA-013, SCHEMA-039)

| 부류 | 규칙 |
| --- | --- |
| 검증 키워드(`minimum`, `enum`, `required` …) | 연언 문맥에서 교차. 게이트 없는 `oneOf`·`anyOf` 분기는 존재만 더하고 제약은 교차하지 않는다 |
| 주석 키워드(`title`, `description`, `format`, `default`·`controls.default`) | 뒤가 앞을 덮는다. 켜진 조각이 본체를, 전순서에서 나중 조각이 앞 조각을 덮는다(소유자: "세부 규칙이 포괄 규칙을 덮는 관례") |
| `writeOnly`, `$comment`, `examples` | 주석 키워드와 같다(뒤가 앞을 덮는다) |
| 상태 키(표준 `readOnly`, `controls.readOnly`·`controls.disabled`·`controls.visible`·`controls.active`) | 코어에는 글로벌이 없다(소유자 13라운드). 표준 `readOnly`·`controls`의 식은 그 노드에만 걸린다. 터미널이 아닌 객체 노드의 잠금은 입력이 없으므로 효과가 없고(표준 `readOnly`는 청사진 경고, 표준 독자의 기대와 다르므로 FRAGMENT-033에 적는다), 배열 노드의 잠금은 렌더 계층이 아이템 추가·삭제·이동 입력에 적용하며, 터미널 객체·배열은 입력이 있으므로 리프와 같다. `active`·`visible`은 구조상 하위 트리를 가린다. 자손을 거는 길은 부모의 `controls.children`(명시한 대상)과 켜진 조각의 `controls`뿐이다. 로컬 선언이 겹치면 잠금은 하나라도 참이면 잠기고 표시는 모두 참이어야 켜진다. Form 속성 `readOnly`·`disabled`는 렌더 계층이 참일 때만 거는 전체 잠금이며 코어의 상태가 아니다(원리 P5(core는 렌더러를 모른다), 12라운드 답 1) |
| 값·동작 키(`controls.derived`, `controls.injectTo`, `controls.unsetValue`, `controls.resetInteraction`) | 병합하지 않는다. 선언마다 규칙 하나이며 같은 대상은 파생 단계의 같은 대상 규칙이 푼다 |
| 선언·정책 키(`controls.children`, `controls.discriminator`, `controls.watch`, `controls.unsetOnInactive`) | 병합하지 않는다. `children`과 `unsetOnInactive`는 각 선언이 속한 층에서 그 선언을 담은 조각이 켜져 있는 동안(나감에서는 직전 커밋 기준) 각각 효력을 가진다(나감 비움 규칙과 같은 대상 규칙이 층으로 푼다). `watch`는 의존이 모든 선언의 경로 합집합(청사진, 정적)이고 입력에 가는 `watchValues`는 유효 스키마의 것(켜진 선언 가운데 전순서에서 나중 것)이다. `discriminator`는 호스트에 하나이며 선언이 여럿이면 같은 값만 허용하고 다르면 청사진 오류(14라운드 O-1, 15라운드, 17라운드 스웜 수렴(편집자 결정)) |
| `options`·`presentation`의 키(그룹 단위) | 뒤가 앞을 덮되 그룹 객체(`options`, `presentation`)는 깊은 병합이다. 작성자 스키마를 변이하지 않으며, 재귀는 두 선언이 같은 키에 모두 원자가 아닌 plain object를 줄 때만 새 객체를 만들어 하고(쓰기 시 복사) 한쪽에만 있는 값은 객체라도 복사하지 않고 참조를 옮긴다. React 요소(`$$typeof`)와 ref 모양(자기 열거 키가 `current` 하나뿐인 객체)은 원자라 나중 승이다. 원자 판정 함수는 렌더 계층이 터미널 판정 함수와 함께 청사진에 넘기며 core는 React 요소의 표식을 모른다(P5). core만 쓰는 호스트가 넘기지 않으면 원자는 없다. 선언이 하나면 그 객체를 그대로 쓴다. 함수·원시값은 나중 승, 나중 조각의 `undefined`는 앞 값을 지우지 않는다. 배열은 나중 조각의 것으로 통째 교체한다(14라운드 확정. `@winglet/common-utils`의 `merge`에 선택 인자(배열 교체, 원자 판정, 한쪽 값의 참조 이동. 양쪽에 있는 객체는 새 객체에 병합한다: 쓰기 시 복사)를 더해 쓰며 인자가 없으면 오늘 동작이다. 14라운드 O-11 되물음의 답, 17라운드 스웜 수렴(편집자 결정)) |

정적 연언(본체와 게이트 없는 `allOf`)의 교차가 공집합이면 청사진 오류(throw), 켜진 `then`과의 런타임 교차가 공집합이면 검증기가 값을 기각한다(SCHEMA-008).

**왜 게이트 없는 분기의 제약을 교차하지 않는가.**(SCHEMA-008) 분기는 "또는" 문맥이다(SCHEMA-008). 순수 분기 둘이 `kind`에 `const: 'a'`와 `const: 'b'`를 두면 교차는 공집합이 되어 검증기보다 좁은 힌트를 낸다(SCHEMA-008). 게이트가 켜진 조각은 작성자가 "이 분기가 해당한다"고 선언한 것이므로 연언으로 적용한다(SCHEMA-008). 【추론】 두 허용 집합의 교집합은 원소마다 취한다: `integer ⊂ number`이므로 `number` ∩ `integer` = `integer`이고, `'null'`은 양쪽에 있을 때만 남으며, 순서는 앞 집합의 순서를 따른다(SCHEMA-008). 【추론】 호스트의 게이트 없는 분기의 `type`은 "또는" 문맥이라 존재만 더하고 교차하지 않는다(SCHEMA-008, SCHEMA-044). U5: 유효 목록은 노드마다 유효 스키마 메모에서 파생하고, 좁히지 않으면 `schemaType`과 같은 참조이며, 병합표의 `type` 행은 교집합이다(SCHEMA-008).

**`default`의 겹침은 생성 순간에만 생긴다.**(SCHEMA-009) WRITE-090 아래에서 `default`는 생성 때만 읽힌다(SCHEMA-009, WRITE-090). `{kind:'a'}`를 로드하면 켜진 `then`의 `default`가 들어가고, 런타임에 `then`이 켜지면 본체 노드가 다시 생기지 않으므로 채우지 않는다(실행)(SCHEMA-009).

로컬 층 안에서 상태 키가 여럿 겹칠 때(표준 `readOnly`, `controls.readOnly`, 켜진 조각의 범위 제어, 부모의 `controls.children` 항목)는 선언은 합집합·제한은 교집합의 원리대로 잠금(`readOnly`·`disabled`)은 하나라도 참이면 잠기고 표시(`active`·`visible`)는 모두 참이어야 켜진다(SCHEMA-010). 코어에 글로벌은 없고, Form 속성의 전체 잠금은 렌더 계층이 그 결과 위에 OR한다(소유자 13라운드)(SCHEMA-010).

작성자 스키마와 앞 조각의 객체를 변이하지 않는다(SCHEMA-039). `options.virtual`의 항목은 가상 노드의 선언이라 병합표가 아니라 조각의 선언 규칙(조각이 선언한 노드는 그 조각과 함께 켜지고 꺼진다, FRAGMENT-001, BLUEPRINT-004)을 따른다(SCHEMA-039, FRAGMENT-001, BLUEPRINT-004). 같은 가상 이름의 `fields`는 순서까지 같아야 하고 다르면 게이트와 무관하게 청사진 오류다(SCHEMA-039, SCHEMA-042, ERROR-192). `options.propertyKeys`·`omitEmpty`·`omitTrailing`은 유효 스키마에서 읽으므로 활성 조각 집합마다 달라도 된다(17라운드 스웜 수렴(편집자 결정))(SCHEMA-039).

【추론】 한 호스트에서 같은 가상 이름의 선언이 여럿이면(본체·조각 어디든) `fields`가 순서까지 같아야 한다(SCHEMA-042). 【추론】 다르면 게이트와 무관하게 청사진 오류다(SCHEMA-042). 【추론】 가상 노드의 신원은 이름이고 값은 `fields` 순서의 튜플이라, 조각 집합에 따라 자식과 튜플 모양이 바뀌는 노드를 두지 않는다(SCHEMA-042). 【추론】 항목의 나머지 키(주석·`options`·`presentation`)는 그 가상 노드의 선언으로서 공유 노드와 같은 병합표를 따른다(SCHEMA-042).

### 1.4 교차 결과와 필수 표시

【추론】 노드의 `required` 표시는 부모 호스트의 유효 스키마 `required`에 그 이름이 드는가로 정한다(SCHEMA-041). 【추론】 호스트의 유효 스키마 `required`는 병합표의 검증 키워드 규칙대로, 연언 문맥의 켜진 조각이 가진 `required`의 합집합이다(SCHEMA-041). 【추론】 연언 문맥은 본체, 게이트 없는 `allOf` 항목, 켜진 게이트 조각(`then`·`else`, `controls.active` 조각, 변환된 분기)이다(SCHEMA-041). 【추론】 게이트 없는 `oneOf`·`anyOf` 분기와 그 안의 `then`은 더하지 않는다(SCHEMA-041). 【추론】 표시만 할 뿐 형상(`active`)과 검증을 바꾸지 않는다(SCHEMA-041). 【추론】 `then.required`로 필드를 켜지 않는다(이주 24행, LANDING-027)(SCHEMA-041, LANDING-027). 【추론】 부모의 유효 스키마가 바뀌어 표시가 뒤집힌 자식은 유효 스키마가 바뀐 노드와 같이 배달 집합에 든다(SCHEMA-041).

【추론】 (1) `const`의 동등은 깊은 구조 비교(JSON 값 동등)다(SCHEMA-043). 【추론】 같은 계열 `intersectEnum`의 깊은 경로처럼 `@winglet/common-utils/object`의 `equals`를 쓴다(SCHEMA-043). 【추론】 원시값은 `===`다(SCHEMA-043). 【추론】 (2) `pattern`은 정규식 하나로 합치지 않는다(SCHEMA-043). 【추론】 같은 문자열은 하나로 줄인다(SCHEMA-043). 【추론】 서로 다른 패턴이 둘 이상이면 전순서의 첫 패턴을 `pattern`에 두고, 나머지는 순서대로 유효 스키마의 `allOf`에 `{ "pattern": p }` 항목으로 싣는다(표준 JSON Schema의 연언, 뜻이 정확함)(SCHEMA-043). 【추론】 패턴의 공집합은 판정하지 않으므로 청사진 오류가 생기지 않는다(SCHEMA-043). 【추론】 새 fractal에는 `intersectPattern`을 옮기지 않는다(SCHEMA-043). 【추론】 (3) 레거시의 옛 `intersect*Schema`는 옮긴 `intersectConst`(깊은 비교)를 쓰고, 옛 `intersectPattern`은 레거시에 남겨 그대로 쓴다(SCHEMA-043). 【추론】 레거시는 PR-7에서 지워진다(SCHEMA-043). 【추론】 그래서 레거시의 `const` 비교는 깊은 비교로 바뀌며(결함 수정), 이는 옛 `intersect*Schema`가 옛 동작을 PR-7까지 지킨다는 규칙(LANDING-061)의 예외다(SCHEMA-043, LANDING-061).

【추론】 런타임 교차의 공집합은 던지지 않고 표준 JSON Schema로 적는다(SCHEMA-045). 【추론】 `enum`끼리의 공집합은 `enum: []`로 적는다(SCHEMA-045). 【추론】 서로 다른 `const`의 충돌은 `const`를 빼고 `enum: []`로 적는다(SCHEMA-045). 【추론】 선택할 값이 없음을 `enum` 하나로 통일한다(SCHEMA-045). 【추론】 범위의 역전(`minimum` > `maximum` 등)은 교차한 값 그대로 둔다(SCHEMA-045). 【추론】 `const`와 `enum` 사이처럼 다른 키워드끼리의 공집합은 판정하지 않는다(각 키워드를 따로 교차)(SCHEMA-045). 【추론】 잎 함수의 공집합 표시는 정적 연언에서는 청사진 오류로, 런타임에서는 위 표현으로 바뀐다(SCHEMA-045). 【추론】 같은 활성 집합이면 같은 참조를 돌려준다(메모)(SCHEMA-045). 【추론】 PR-1 병합표 시험(TEST-014)이 이 표현을 단언한다(SCHEMA-045, TEST-014). 【추론】 기여 하나만 적은 `{ minimum: 5, maximum: 3 }`나 `{ enum: [] }`는 교차가 아니므로 그대로 두고 검증기가 기각한다(SCHEMA-006, SCHEMA-045). 범위의 하한·상한 쌍(`minimum`/`maximum`, `exclusiveMinimum`/`exclusiveMaximum`, `minLength`/`maxLength`, `minItems`/`maxItems`, `minProperties`/`maxProperties`)은 쌍마다 한 키워드로 보아, 그 기여가 그 쌍의 경계를 하나라도 적고, 그 기여 전에 target에 그 쌍의 경계가 하나라도 있으며, 합친 결과가 역전일 때만 `INVALID_RANGE`다(SCHEMA-006, SCHEMA-045). 【추론】 SCHEMA-045의 `enum: []` 표현은 `enum`·`const`의 런타임 공집합에만 쓴다(SCHEMA-045).

### 1.5 게이트 없는 분기의 병합

【추론】 (5) 병합도 같은 선언 집합: 같은 까닭으로, 게이트 없는 분기가 공유 노드에 둔 주석·표현·상태 키와 `options`는 그 노드의 유일한 선언일 때만 유효 스키마에 쓴다(SCHEMA-044). 게이트 없는 분기 안의 `if/then`도 그 분기의 선언 문맥이므로 `then`의 제약을 본체와 교차하지 않는다(SCHEMA-044). 【추론】 전략과 유효 스키마가 같은 선언 집합을 본다(SCHEMA-044). 【추론】 `options.virtual`의 항목은 선언이므로 존재를 더한다(SCHEMA-044).

## 2. 청사진

### 2.1 청사진 분석과 형태

(BLUEPRINT-001)

```
작성된 스키마 ──(순수 함수, 폼 생성 시 1회)──▶ 청사진 ──▶ 노드 트리
```

- 작성된 스키마는 변형하지 않는다(VALIDATE-004)(BLUEPRINT-001, VALIDATE-004). 분석 결과는 별도 구조에 둔다(BLUEPRINT-001).
- 분석 단계는 노드 없이 테스트할 수 있다(TEST-002)(BLUEPRINT-001, TEST-002).

폼 생성 때(그리고 스키마 교체 때) 한 번 도는 **순수 함수**다(BLUEPRINT-001).

(BLUEPRINT-002, BLUEPRINT-046, BLUEPRINT-047)

```
ObjectBlueprint {
  base:      PropertyDeclaration[]   // properties. 노드 게이트(controls.active)는 그 선언이 든다
  fragments: SchemaFragment[]        // 정적으로 열거된 모든 조각
}
SchemaFragment {
  id          // 작성된 스키마 안의 위치 (schemaPath). 에러 라우팅의 키
  guard       // 게이트: if(검증기 플러그인이 컴파일) | controls.active(표현식) | 없음(항상 참)
  context     // 연언 | 선언, 그리고 어느 oneOf/anyOf의 분기인가 (FRAGMENT-011)
  declares    // 이 조각이 새로 선언하는 property
  constrains  // 기존 property에 얹는 overlay: name → 스키마
  inherited   // 조상에서 끌어올린 조각이 이 호스트에 귀속시킨 overlay (E12, BLUEPRINT-004)
  children    // 중첩 조각 — 감싸는 조각이 활성일 때만 순회한다 (E3, FRAGMENT-011)
}
```

구현 이름은 약어 없는 풀 네임(예: `PropertyDeclaration`)이다(BLUEPRINT-002, BLUEPRINT-046). 구현의 타입 이름은 React `Fragment`와 겹치지 않는 `SchemaFragment`다(BLUEPRINT-002, BLUEPRINT-047). 【추론】 BLUEPRINT-002의 스케치(`guard`·`constrains`·`inherited`)와 BLUEPRINT-017의 "`SchemaFragment.guard`에 든 `controls.active` 식"은 뜻의 서술이며, 02의 `src/core/blueprint/type.ts`(`SchemaFragment`의 `gates`·`overlays`·`inheritedOverlays`, 숫자 `id`, 게이트 `{ kind: 'if' | 'active' | 'discriminator', condition }`)가 그 구현이다(BLUEPRINT-026)(BLUEPRINT-002, BLUEPRINT-017, BLUEPRINT-026).

`forbids` 칸은 없다(BLUEPRINT-003). 금지 구문은 폼이 읽지 않는다(FRAGMENT-019, D-3)(BLUEPRINT-003, FRAGMENT-019).

- "`properties` 밖에도 노드가 있다"는 런타임의 특수 경로가 아니라 청사진의 `declares`를 읽는 일반 경로가 된다(BLUEPRINT-004).
- 조각은 스키마에서 **정적으로 열거된다.**(BLUEPRINT-004) 그래서 "모든 분기 자식을 사전 생성하고 활성만 토글"하는 현재의 트리 모델(D2)을 유지할 수 있다(BLUEPRINT-004).
- 끌어올린 조각의 `then`이 손자를 선언하면 청사진이 그 선언을 자식 호스트의 `inherited`로 귀속시킨다(E12)(BLUEPRINT-004). 게이트는 조상의 것이므로 자식은 자기 바퀴에서 그것을 평가하지 않는다(BLUEPRINT-004).
- `allOf`의 무조건 항목은 게이트가 항상 참인 연언 조각이다(BLUEPRINT-004). 기존 `intersectSchema`는 "활성인 조각들을 SCHEMA-007의 병합표로 합치는 연산"으로 승격된다(BLUEPRINT-004, SCHEMA-007).

폼은 방언 스위치 없이 **두 철자를 모두 읽는다**: `items: [..]`와 `prefixItems`, `definitions`와 `$defs`(목표 C5(지원 방언의 범위), GOAL-018)(BLUEPRINT-005, GOAL-018).

폼은 서브스키마가 **어디에 있고 무엇을 선언하는지**(`properties`, `items`, `prefixItems`, `if`/`then`/`else`, `allOf`/`oneOf`/`anyOf`, `$ref`, `type`)를 읽는다(BLUEPRINT-006). 값이 스키마를 **만족하는지**는 평가하지 않는다(BLUEPRINT-006). 그것은 언제나 `compileGuard`가 답한다(BLUEPRINT-006). 값의 유효성 문법은 읽지 않는다(FRAGMENT-019)(BLUEPRINT-006, FRAGMENT-019). 분기의 `const`·`enum` 값도 읽지 않는다(BLUEPRINT-006). 예외는 작성자가 `controls.discriminator`를 명시한 union 하나다(BLUEPRINT-017)(BLUEPRINT-006, BLUEPRINT-017).

【추론】 규칙은 지금 정한다(BLUEPRINT-030). 【추론】 청사진은 작성 루트에서 닿는 스키마 위치마다 한 번만 만든다(BLUEPRINT-030). 【추론】 `$ref`는 작성 루트 안의 대상 위치(JSON Pointer)로 풀고, 이미 분석한 위치는 다시 분석하지 않고 그 분석을 가리킨다(BLUEPRINT-030). 【추론】 위치는 유한하므로 분석은 언제나 끝난다(BLUEPRINT-030). 【추론】 위치마다 한 번인 것은 그 위치가 스스로 선언하는 조각 표이고, 조상에서 귀속되는 `inherited`는 가리키는 쪽 청사진이 든다(BLUEPRINT-030). 【추론】 한 호스트의 조각을 열거할 때 `$ref`의 대상이 지금 열거 중인 조각 경로에 이미 있으면(조각 안의 순환) 그 자리는 더 펼치지 않는다(BLUEPRINT-030). 【추론】 펼쳐도 같은 선언이 더 깊은 중첩으로 되풀이될 뿐이어서 존재(합집합)가 바뀌지 않기 때문이다(BLUEPRINT-030). 【추론】 자식(`properties`·`items`·`prefixItems`)으로 넘어가는 참조는 그 자식 위치의 청사진을 가리킨다(BLUEPRINT-030). 【추론】 노드는 형상과 값을 따라 만들고, 배열 아이템은 값의 길이만큼만 만든다(SCHEMA-004의 지연 해석)(BLUEPRINT-030, SCHEMA-004). 【추론】 객체 프로퍼티만으로 이어진 순환에서 모든 마디가 게이트 없는 선언이고 터미널 전략인 노드가 하나도 없으면 형상이 무한하므로 청사진 오류(가칭 `JSON_SCHEMA_ERROR.RECURSIVE_SHAPE_UNBOUNDED`)다(BLUEPRINT-030, ERROR-189). 【추론】 순환을 끊는 것은 배열 아이템, 게이트(조각·노드·`children` 항목), 터미널 전략 셋이며, nullable은 끊지 않는다(비객체 호스트의 자식도 형상에 있다, VALUE-036)(BLUEPRINT-030, VALUE-036). 【추론】 게이트로 끊긴 순환은 게이트가 원본 없는 값에서 거짓일 때만 끝난다(`if`는 공허한 참일 수 있다, FRAGMENT-023)(BLUEPRINT-030, FRAGMENT-023). 【추론】 정착에서 노드를 만들 때 같은 청사진 위치가 원본 없는 조상 사슬에서 되풀이되어 앞 되풀이와 게이트 문맥이 같으면(사슬 길이가 순환 안 식·가드의 가장 긴 상대 경로 `..` 수 이상), 그 아래는 끝나지 않는 형상으로 보고 만들지 않으며 정착 오류(가칭 `SCHEMA_FORM_ERROR.RECURSIVE_SHAPE_DIVERGED`, `diagnostics.cause: 'budget'`, 새 `exceededBudget` 값 (가칭) `'recursion'`, 모든 환경 사슬 끝 throw, `degraded`)로 드러낸다(D-2 '고정점이 없는 스키마는 지원 범위 밖, degraded로 관측'과 같은 모양, R17-1)(BLUEPRINT-030, SETTLE-029, ERROR-190). 【추론】 청사진 오류와 정착 오류는 검색으로 가려지도록 이름을 달리한다(BLUEPRINT-030).

### 2.2 전순서와 계산 준비

"앞서"와 "나중"은 FRAGMENT-011의 **전순서**(감싸는 조각의 순서, 키워드 순위, 배열 인덱스)로 정의한다(BLUEPRINT-008, FRAGMENT-011). 2라운드 S13(순서가 JSON 키 순서에 기댄다)은 이것으로 닫힌다(BLUEPRINT-008). 노드 게이트는 그 노드를 선언한 조각 바로 뒤에, 같은 조각 안에서는 선언 순서로 든다(BLUEPRINT-008). 같은 호스트의 `oneOf` 분기는 모든 `anyOf` 분기보다 앞이다(BLUEPRINT-008, FRAGMENT-049).

4. **병합표 준비.**(BLUEPRINT-020) SCHEMA-007의 규칙을 적용할 준비를 한다(BLUEPRINT-020, SCHEMA-007). 적용은 정착의 계산 단계에서 켜진 조각에 대해 한다(BLUEPRINT-020).

**메모.**(BLUEPRINT-021) 유효 스키마는 활성 덧씌움 집합(그 노드에 얹힌 켜진 조각들의 집합)마다 메모한다(BLUEPRINT-021). 같은 집합이면 같은 참조를 돌려준다(BLUEPRINT-021).

**통지.**(BLUEPRINT-021) 유효 스키마가 바뀐 노드는 통지의 배달 집합에 든다(EVENT-006)(BLUEPRINT-021, EVENT-006). 게이트 조각이 켜지거나 꺼지면 그 조각이 덧씌운 노드가 여기에 해당한다(BLUEPRINT-021).

`node.jsonSchema`가 정적 값에서 메모된 유효 스키마로 바뀐다(VALUE-002, SCHEMA-007)(BLUEPRINT-021, VALUE-002, SCHEMA-007). `then`이 `enum`을 좁히면 select의 선택지가 바뀌어야 하기 때문이다(BLUEPRINT-021). 유효 스키마가 바뀌면 입력 컴포넌트의 해석 결과도 바뀔 수 있다(`format`이 달라지는 경우 등)(BLUEPRINT-021).

6. **`controls`의 식 컴파일과 역의존 표.**(BLUEPRINT-022) 식이 읽는 경로를 정적으로 뽑아 역의존 표(경로 → 그 경로를 읽는 식을 가진 노드)를 만든다(BLUEPRINT-022). 표시 단계는 쓰기 노드의 조상과 그 역의존 노드의 조상을 재계산 목록에 넣는다(BLUEPRINT-022). 뽑을 수 없는 식은 `controls.watch`로 작성자가 적는다(오늘의 의존 경로 구독과 같은 역할)(BLUEPRINT-022).

**게이트가 무엇을 읽는지는 기본적으로 뽑지 않는다.**(BLUEPRINT-007) 재계산 목록이 닿은 노드에 걸린 게이트를 전부 다시 평가한다(BLUEPRINT-007). 측정에 따르면 AJV에서는 이것으로 충분하다 — 루트에 걸린 좁은 가드 200개를 키 입력마다 전부 돌려 7.9 µs다(TEST-036)(BLUEPRINT-007, TEST-036). "게이트가 걸린 객체의 참조가 그대로면 건너뛴다"는 루트에 걸린 게이트에 대해 효과가 없다(어떤 쓰기든 루트의 참조를 바꾼다)(BLUEPRINT-007).

건너뛰기가 실제로 필요한 경우는 둘이다: 인터프리터형 검증기(같은 작업이 약 70배), 컬렉션을 훑는 게이트(`contains` 등 — 아이템 10,000개에 AJV 190 µs, 인터프리터 4.5 ms)(BLUEPRINT-007, TEST-036). 변경 경로 → 게이트의 역색인은 출발점 고정(SETTLE-029) 아래에서 듣지 않으므로 후보에서 뺐다(E13)(BLUEPRINT-007, SETTLE-029). 남는 최적화는 (a) 무조건 루트 키만 읽는 게이트의 건너뛰기, (b) 조각이 꺼질 때 키 제거를 `delete` 없이 하는 것, (c) 조각 토글마다 전체 리빌드 대신 그 조각이 선언한 키만 패치하는 것(F13)이다(BLUEPRINT-007). 넣을지는 TEST-026의 벤치마크로 정한다(BLUEPRINT-007, TEST-026).

### 2.3 노드 종류와 공유

【추론】 스키마에서 오는 노드의 종류는 일곱이다: string, number(`integer` 포함), boolean, null, object, array, `union`(BLUEPRINT-032, BLUEPRINT-035, WRITE-099). `node.type`의 값은 `virtual`을 포함해 여덟이다(BLUEPRINT-032, NODE-057, WRITE-099). nullable은 종류가 아니라 노드의 플래그이고, `type`이 없는 overlay(`{ const }`, `{ enum }`, `{ minimum }`)는 어느 종류와도 맞는다(BLUEPRINT-032). 【추론】 12-9가 확인한 것은 같은 종류의 접기(`number`와 `integer`, `['string','null']`과 `'string'`)이지 종류의 수가 아니다(BLUEPRINT-032). nullable(`type: ['string', 'null']`, `nullable: true`, null 분기와의 `anyOf`/`oneOf` — 현재 `helpers/jsonSchema/isNullBranch`가 알아본다)은 종류가 아니라 노드의 플래그다(BLUEPRINT-032). "같은 타입"을 타입 표기의 동일성이 아니라 **같은 노드 종류**로 다시 정의했다 — `number`와 `integer`, `['string','null']`과 `'string'`은 배타가 아니다(BLUEPRINT-032). `type`에 원시·객체·배열 가운데 둘 이상의 종류가 적힌 칸의 터미널 잎의 종류 이름은 `union`으로 확정하고 가칭을 푼다(가드 `isUnionNode`, 동작 모듈 `unionBehavior/`)(BLUEPRINT-032, BLUEPRINT-035, BLUEPRINT-036). 【추론】 A(d)의 기본은 d 자신의 `type`(문자열이나 배열)의 원소이고, `nullable: true`는 같은 객체에 `type`이 있을 때만 `'null'`을 더하며, `'null'`만 받는 분기는 `{null}`이다(BLUEPRINT-032). 【추론】 A = `{null}`이면 null 종류이고 `nullable: true`이다(BLUEPRINT-032). 【추론】 nullable은 `'null'` ∈ A와 같다(BLUEPRINT-032). 【추론】 형 있는 칸의 null 분기는 nullable을 켜지 않고, 유효 목록을 좁히지 않는다(BLUEPRINT-032).

(BLUEPRINT-010, BLUEPRINT-011, BLUEPRINT-012, BLUEPRINT-041, BLUEPRINT-044, SCHEMA-007, GOAL-015)

| 상황 | 처리 |
| ---- | ---- |
| 같은 이름 + 같은 종류 (어느 조각이든) | **노드 하나를 공유한다.** 활성인 선언이 하나라도 있으면 존재한다. 유효 스키마는 SCHEMA-007의 병합표로 정한다 |
| 같은 이름 + 다른 종류 | 정적 선언이 있는 이름은 정적 선언들의 교집합이 노드 하나를 정하고, 게이트 선언은 그 노드의 종류를 바꾸지 않고 켜진 동안 유효 목록만 좁힌다. 교집합이 비지 않은 정적 선언끼리는 충돌이 아니다. 종류별 노드는 정적 선언이 하나도 없는 이름에만 남는다. 같은 시점에 활성인 선언의 종류가 하나면 그 노드가 산다 |
| 같은 이름 + 다른 종류가 **동시에** 활성 | 충돌이다. 종류가 다른 선언이 함께 켜져도 정적 선언끼리는 허용 집합의 교집합이 비지 않으면, 호스트의 게이트 없는 분기는 fold가 정적 노드의 fold에 들면, 켜진 게이트 선언은 정적 허용 집합과의 교집합이 비지 않으면 노드 하나이고 충돌이 아니다. 충돌을 작성자에게 드러낸다(GOAL-015의 목표 C2(작성자 실수의 가시성)). 게이트 없는 선언끼리는 늘 함께 켜지므로 청사진 오류다(폼이 서지 않는다). 정적 선언(호스트 본체, 게이트 없는 `allOf`, `$ref`)끼리는 교집합으로 노드 하나를 정하고 교집합이 빌 때만 `ALL_OF_TYPE_REDEFINITION`이며, 호스트의 게이트 없는 분기는 fold가 정적 노드의 fold에 들지 않을 때만 `SHARED_NODE_KIND_CONFLICT`다. 게이트에 달린 선언이 실제로 동시에 켜지면 정착 오류다: 마운트에서는 모든 환경에서 폼이 서지 않고 폼 자리에 대체 화면을 그리며(14라운드 O-10), 마운트 뒤에는 전순서에서 앞선 종류의 노드를 살려 커밋하고 통지 뒤 사슬 끝에서 던지며 `degraded`(`cause`는 공유 충돌)가 다음 로드까지 남아 그 동안 제출을 거부한다(17라운드 소유자 답 R17-1 나, ERROR-159). 정적 노드가 있는 칸에서는 켜진 게이트 선언과 정적 허용 집합의 교집합이 빌 때만 정착 오류다. 게이트 가진 선언의 충돌은 청사진에서 판정할 수 없으므로 분석 단계에서 미리 throw하지 않는다 |

같은 종류의 필드는 분기가 바뀌어도 같은 노드이므로 값이 자연스럽게 남는다(BLUEPRINT-010). 현재의 "나가는 노드 reset → 들어오는 노드에 `fallbackValue` 복원 → `validateSchemaType`으로 타입 호환 검사"(`ObjectNode/.../BranchStrategy.ts:479-511`) 절차가 필요 없어진다(BLUEPRINT-010). 【추론】 정적 선언이 하나도 없는 이름은 fold가 같은 선언끼리 노드 하나를 둔다(BLUEPRINT-011). 【추론】 fold가 다른 게이트 선언이 동시에 켜지면 `SHARED_NODE_CONFLICT`이고, 배타이면 종류별 노드이며, 각 노드 안에서는 켜진 선언이 유효 목록을 좁힌다(BLUEPRINT-011, BLUEPRINT-012, BLUEPRINT-044). 게이트 없는 분기끼리 같은 이름·다른 종류의 필드를 두면 두 분기가 늘 함께 켜져 있으므로 위 표의 3행이 된다(BLUEPRINT-012). 【추론】 켜진 게이트 선언과 정적 허용 집합의 교집합(`'null'` 포함)이 빈 경우에는 그 게이트들이 켜진 동안 `SHARED_NODE_CONFLICT`(정착 오류, 기존 처리)로 드러난다(BLUEPRINT-012, BLUEPRINT-041, BLUEPRINT-044). 【추론】 `diagnostics`와 경고 중복 키는 폼 수준 로드(마운트, `FormHandle.reset()`)에서만 초기화한다(BLUEPRINT-012). 【추론】 `setValue(V)`와 `resetSubtree()`는 초기화하지 않는다(BLUEPRINT-012).

게이트를 가진 분기의 `value: string` / `value: number`는 흔하고 정당한 선언이다(BLUEPRINT-013). 게이트가 서로 배타이면 동시에 활성이 되지 않는다(BLUEPRINT-013). 배타인지는 작성자의 스키마가 정하며 폼은 검사하지 않는다(BLUEPRINT-013). `allOf: [{ if k=a then v:string }, { if k=b then v:number }]`도 같은 방식으로 동작한다(BLUEPRINT-013). 게이트가 동시에 참이 되는 스키마를 썼다면 그것은 작성자의 실수이고, 검증기도 그 값을 기각한다(BLUEPRINT-013).

**게이트 없는 `oneOf`·`anyOf` 분기가 노드를 공유하면 존재만 더하고 제약은 교차하지 않는다.**(BLUEPRINT-014) 분기는 선언("또는") 문맥이다(BLUEPRINT-014). 순수 분기 둘이 `kind`에 `{ const: 'a' }`와 `{ const: 'b' }`를 두면 교차는 공집합이 되어 검증기보다 좁은 힌트를 낸다(BLUEPRINT-014). 켜진 게이트 조각(게이트 가진 분기 안 `if`의 `then`, 본체·`allOf`의 `then`, `controls.active`를 가진 분기, `controls.discriminator`로 변환된 분기)은 작성자가 "이 분기가 해당한다"고 선언한 것이므로 연언으로 교차한다(FRAGMENT-001, BLUEPRINT-014).

**정적 연언(본체와 게이트 없는 `allOf`)의 교차가 공집합이면 청사진 오류로 throw하고, 켜진 `then`과의 런타임 교차가 공집합이면 throw하지 않고 검증기가 값을 기각한다.**(BLUEPRINT-016, SCHEMA-008) `type`은 켜진 게이트 선언과 정적 허용 집합의 교집합이 비면 그 게이트들이 켜진 동안의 정착 오류(`SHARED_NODE_CONFLICT`)다(BLUEPRINT-016, BLUEPRINT-041, BLUEPRINT-044). 서로소인 `enum` 둘이 켜진 조각과의 연언에서 동시에 활성이면 그 필드는 "지금 고를 수 있는 값이 없는" 상태가 되고, 폼은 막지 않으며 검증기가 값을 기각한다(BLUEPRINT-016). 필드를 비우면 값이 유효해지는 경우가 있으므로 폼 전체를 멈춰서는 안 된다(R11-e)(BLUEPRINT-016). 【추론】 청사진 오류 `INVALID_RANGE`·`EMPTY_ENUM_INTERSECTION`·`CONFLICTING_CONST_VALUES`는 정적 연언에서 둘 이상의 기여가 같은 키워드를 적어 교차한 결과가 공집합일 때만 난다(BLUEPRINT-016, SCHEMA-045). 【추론】 리터럴 `enum: []`는 공집합 표시가 아니며, 공집합은 잎 함수가 `EMPTY_INTERSECTION`을 돌려준 경우만이다(BLUEPRINT-016, FRAGMENT-048, SCHEMA-045). 이 셋은 유효 스키마의 키워드 교차에만 걸리고, 판별 키의 `const`·`enum` 모으기는 FRAGMENT-048대로 키워드를 가리지 않고 교차하며, 기여 하나의 값이 이미 비어도(`{ enum: [] }`, `{ const: 'a', enum: ['b'] }`) `EMPTY_ENUM_INTERSECTION`이다(25C-01)(BLUEPRINT-016, FRAGMENT-048, SCHEMA-045).

다음은 합의 근거의 기록이다(BLUEPRINT-025). 같은 이름 + 같은 타입이면 노드 하나를 공유한다 — 소유자: "동의합니다."(BLUEPRINT-025). 타입이 다르면 오류 — 소유자: "타입이 달라버리면 우리로서는 답이 없지만(이 경우엔 오류가 throw 되겠지)."(BLUEPRINT-025). 개정분은 이 오류를 둘로 가른다(BLUEPRINT-025). 게이트 없는 선언끼리의 충돌은 분석 단계(청사진)의 오류이고, 게이트에 달린 선언이 실제로 동시에 켜진 충돌은 정착의 오류다(BLUEPRINT-012의 표)(BLUEPRINT-025, BLUEPRINT-012). 경고가 아니라 오류로 드러내는 것은 14라운드 O-10 소유자 답("경고만 일어나고 동작하는것처럼 보이는게 더 위험합니다")이다(BLUEPRINT-025). 드러남의 환경 규칙은 17라운드 소유자 답 R17-1 나("망가진 값을 올리는게 더 위험하겠다")로 정해졌다: 모든 환경에서 던지고 `degraded` 동안 제출을 거부한다(BLUEPRINT-025). `controls.discriminator`는 예외적 허용이며 분기 스키마를 고치지 않는다 — 소유자(22): "동의합니다. 이 경우에 대한 예외적 허용을 하죠. … 우리는 "&active": 을 더하는거지 스키마를 수정하는건 아니니까"(BLUEPRINT-025). 병합표 — 소유자(7): "세부적인 규칙이 포괄적인 규칙을 덮는 기존 관례를 따릅니다"(BLUEPRINT-025). (16·17): 예(BLUEPRINT-025). (18): "깊은 병합을 했으면 합니다. … 이때는 common-utils 의 merge 를 쓰죠"(BLUEPRINT-025). (12): "props 로 전달되는 글로벌 값이 개별 값을 덮도록 하는게 맞습니다. rootJSONSchema 도 props 와 동치"(BLUEPRINT-025). (13): "글로벌과 로컬만 보고, 중간단계 상태 상속은 구현을 하지 않으려고 합니다"(BLUEPRINT-025). (13라운드 1, 12를 개정): "글로벌 readOnly 나 disabled 같은 개념은 없애고 모든 control 필드는 자체 노드만 지원. children 그룹은 예외."(BLUEPRINT-025). (13라운드 3): "제어용 필드들에 대해서만 &를 붙이는 방향으로 가자."(BLUEPRINT-025).

되돌림 가능성의 기록이다(BLUEPRINT-026). 청사진의 구체적 형태는 내부 구조여서 바꾸기 쉽다(BLUEPRINT-026). 노드 공유 규칙은 값 보존 동작을 정하므로 공개 후에는 바꾸기 어렵다(BLUEPRINT-026). `controls.discriminator`는 예약 층의 공개 키이므로 들이면 되돌리기 어렵다(BLUEPRINT-026).

### 2.4 명시 판별

GOAL-034의 축 1항("`enum`·`const` 판별식은 쓰지 않는다")의 유일한 예외다(BLUEPRINT-017, GOAL-034). 근거는 축 1항(폼은 JSON Schema 문법을 해석하지 않는다)의 예외(소유자 동의, 10라운드)와 축 7항(JSON Schema 표현은 `controls` 표현으로 대체할 수 있어야 한다)이다(BLUEPRINT-017, GOAL-034, GOAL-040).

**선언.**(BLUEPRINT-017) 작성자가 variant 호스트(`oneOf`·`anyOf`를 가진 객체 스키마)에 예약 층 키 `controls: { discriminator: '<key>' }`를 적는다(BLUEPRINT-017, BLUEPRINT-035). 적지 않은 variant 호스트의 `const`·`enum`은 읽지 않는다(BLUEPRINT-017, BLUEPRINT-035). OpenAPI의 `discriminator.propertyName`도 예약 층의 키가 아니므로 읽지 않는다(BLUEPRINT-017).

**변환.**(BLUEPRINT-017) 청사진 단계가 각 분기에서 그 키의 `const`·`enum`을 읽어, 그 분기를 `controls: { active: "./<key> === <value>" }`를 가진 조각 객체로 다룬다(BLUEPRINT-017). `enum`이면 값이 그 목록에 드는가를 본다(BLUEPRINT-017). 변환된 분기는 FRAGMENT-001 조각 표의 3행(연언)이 된다(BLUEPRINT-017, FRAGMENT-001).

**분기 스키마는 손대지 않는다.**(BLUEPRINT-017) `kind: { const }`와 `required`는 그대로 검증기에 간다(BLUEPRINT-017, SCHEMA-006). 결과는 청사진의 `SchemaFragment.guard`에 든 `controls.active` 식뿐이다(BLUEPRINT-017, BLUEPRINT-047). 소유자: "우리는 "&active": 을 더하는거지 스키마를 수정하는건 아니니까"(BLUEPRINT-017).

**청사진 단계에서 끝난다.**(BLUEPRINT-017) 상태 칸(원본과 `extras` 둘)도 작업 루프도 바꾸지 않는다(BLUEPRINT-017). 변환된 게이트는 다른 `controls.active`와 같이 호스트 바퀴에서 평가된다(BLUEPRINT-017). 【추론】 받는 조건은 뜻이 같은 것이다: 판별 게이트는 `./<key>`의 값이 `values`에 드는가로 평가되고, 분기 자신의 `controls.active`와 AND 하나로 합쳐지며, 다른 `controls.active` 게이트와 같이 호스트 바퀴에서 평가된다(BLUEPRINT-017). 【추론】 02에는 게이트 평가기가 없고 조건을 기록만 하므로(`type.ts`의 `BlueprintGate`, `gates`는 모두 성립해야 하는 조건의 목록), 평가는 PR 03이 이 뜻대로 한다(BLUEPRINT-017).

**판별 프로퍼티는 본체에 선언한다**(GOAL-035, BLUEPRINT-017). 폼이 소유하지 않고, 분기 값의 합집합 `enum`을 만들지도 않으며, 암묵 default도 없다(BLUEPRINT-017). 채움의 원천은 `controls.default` > `default` > 없음뿐이다(BLUEPRINT-017).

ajv의 `discriminator: true`는 pydantic 출력에도 throw하므로 플러그인이 켜지 못한다(BLUEPRINT-018). `controls.discriminator`는 검증기 옵션이 아니라 폼의 예약 층이다(BLUEPRINT-018). 이 규칙은 현재의 "`type`/`$ref`가 없는 `const`/`enum`이면 판별식"(`getCompositionKeyInfo.ts:33`, `getExpressionFromSchema.ts:35-51` — 두 파일이 서로를 언급하지 않은 채 같은 암묵 규칙에 기댄다)과 `COMPOSITION_PROPERTY_REDEFINITION` throw(`getCompositionNodeMapList.ts:95-105`)를 대체한다(BLUEPRINT-018). 명시 없이 자동 감지에 기대던 스키마는 이주 안내 대상이다(BLUEPRINT-018). 그런 스키마는 `controls.discriminator`를 더하거나 분기 안에 `if/then/else: false`를 쓴다(BLUEPRINT-018, FRAGMENT-030). `JSONSchema` 타입이 `kind: { const: 'a' }`를 받아들이게 하는 것은 목표 C4(표준 스키마의 타입 수용과 추론)다(BLUEPRINT-018, GOAL-017).

### 2.5 union 노드의 범위와 계약

`type`에 원시·객체·배열 가운데 둘 이상의 종류가 적힌 칸의 터미널 잎의 종류 이름은 `union`으로 확정하고 가칭을 푼다(가드 `isUnionNode`, 동작 모듈 `unionBehavior/`)(BLUEPRINT-035, BLUEPRINT-036). `oneOf`·`anyOf` 분기를 가진 호스트는 variant 호스트라 부르고, 그 분기 하나를 variant라 부른다(합 타입의 업계 용어)(BLUEPRINT-035). 원장의 옛 글에 남은 "union 호스트"는 variant 호스트를 뜻하며, 새 설계 문서는 새 용어를 쓴다(BLUEPRINT-035).

`union`은 `type`에 원시·객체·배열 가운데 둘 이상의 종류가 적힌 칸을 받아들이는 터미널 잎 노드이며, 형을 고르는 UI가 아니다(BLUEPRINT-036). `object`·`array`도 union의 원소가 될 수 있다(BLUEPRINT-036). `union`은 행이 하나인 종류이므로 전략은 `terminal`이며, 렌더 계층의 판정을 묻지 않는다(BLUEPRINT-036). 어느 선언에든 `options.terminal: false`가 있으면 `TERMINAL_OPTION_UNSUPPORTED`(ERROR-200)이고, `true`는 허용하며, 인라인 `FormTypeInput`이 있어도 판정은 바뀌지 않는다(BLUEPRINT-036). `object`·`array`가 든 `union`은 터미널로 강제된다(BLUEPRINT-036). 이 칸의 `properties`·`items`·`prefixItems`는 자식을 만들지 않는 검증 전용이다(BLUEPRINT-036). `find('/slot/key')`는 `null`이다(BLUEPRINT-036, NODE-020). `controls.children`이 이 칸 아래를 가리키면 `CHILDREN_TARGET_NOT_FOUND`이다(BLUEPRINT-036, CONTROLS-073 (2), ERROR-193). `object`·`array`로의 변환은 없다(파싱도 문자열화도 하지 않는다)(BLUEPRINT-036). 식의 경로는 방출 트리를 JSON Pointer로 내려가되 객체의 자기 키와 배열의 색인으로만 내려가므로, 원시 값 아래는 `undefined`이다(BLUEPRINT-036). `omitEmpty`(기본 켜짐)는 union의 현재 값 전체를 보며, `''`, 키가 없는 `{}`, 빈 `[]`은 방출하지 않고 `0`·`false`·`null`은 방출한다(BLUEPRINT-036). 채움 값은 `controls.default` > `default`의 값 전체다(BLUEPRINT-036). 기본 입력은 값이 객체나 배열이면 `JSON.stringify(value)`를 읽기 전용으로 보이고 비우기 단추를 두며, 비우기는 nullable이면 `null`, 아니면 `undefined`를 보낸다(BLUEPRINT-036).

【추론】 `null`은 빼서 nullable 플래그로 두고, `integer`는 `number`로 접는다(BLUEPRINT-043, BLUEPRINT-032). 【추론】 접은 집합의 원소가 둘 이상이면 새 종류 `union`의 노드이고 행은 `terminal` 하나다(`BEHAVIORS.union.terminal`)(BLUEPRINT-043, BLUEPRINT-035). 【추론】 원소가 하나면 그 종류이며 `object`·`array`일 수 있다(`['string','null']`은 nullable string, `['integer','number']`는 number)(BLUEPRINT-043, BLUEPRINT-044, BLUEPRINT-045). 【추론】 (2) 같은 종류: `union` 노드끼리는 접은 집합이 같을 때만 같은 종류다(BLUEPRINT-043). 【추론】 다른 종류의 선언과 같은 이름이면 BLUEPRINT-011·012의 충돌 규칙을 따른다(BLUEPRINT-043, BLUEPRINT-011, BLUEPRINT-012). 【추론】 (3) `interpret`: 값이 `node.schemaType`(+`nullable`), 게이트가 켜진 동안에는 유효 목록의 한 형에 맞으면 그대로 둔다(BLUEPRINT-043, BLUEPRINT-040). 【추론】 정합은 값이 `node.schemaType`(+`nullable`), 게이트가 켜진 동안에는 유효 목록의 한 형이라는 뜻이다(BLUEPRINT-043, BLUEPRINT-040). 【추론】 다른 입력은 작성자가 `formTypeInputMap`이나 인라인 입력으로 고른다(BLUEPRINT-043). 【추론】 (7) PR 배치: 청사진이 `union` 종류를 알아보는 것은 PR-1이다(청사진이 종류를 정한다)(BLUEPRINT-043). 【추론】 `union` 동작 행(`interpret`, `terminal` 전략)은 다른 잎 행과 함께 PR-2다(LANDING-062의 행 목록)(BLUEPRINT-043). 【추론】 종류 모듈 목록에는 `unionBehavior/`가 더해진다(BLUEPRINT-043, BLUEPRINT-035). BLUEPRINT-043의 "`integer`는 `number`로 접는다"는 종류를 정할 때의 접기이고, `schemaType`은 `'integer'`를 보존한다(BLUEPRINT-043, NODE-057). 【추론】 기본 입력은 친 글에 core와 같은 `interpret`를 유효 목록으로 적용하고, 결과가 목록의 한 형일 때만 그 결과를 보낸다(BLUEPRINT-043).

`union` 노드의 목적은 `type`에 적힌 원시·객체·배열 가운데 둘 이상의 종류를 가진 필드를 폼이 받아들이는 것이며, 값의 형을 사용자가 고르게 하는 기능이 아니다(BLUEPRINT-042, BLUEPRINT-036). 형을 고르게 하는 요구는 조건부 스키마(`if`-`then`-`else`, `controls.active`)로 표현한다(BLUEPRINT-042). `union` 노드의 해석은 값이 목록의 한 형이면 그대로 두고, 아니면 변환 목록(WRITE-075)으로 받아 줄 형이 정확히 하나일 때만 그 형으로 바꾸며, 받아 줄 형이 없거나 둘 이상이면 받은 그대로 두고 경고등을 켠다(BLUEPRINT-042, BLUEPRINT-040). 이 해석은 `type`의 선언 순서도 검증기 플러그인의 규칙도 쓰지 않으며, 단일 타입 노드의 변환은 목록이 하나인 경우다(BLUEPRINT-042). 기본 입력 정의(`formTypeDefinitions`, UI 플러그인이 없을 때의 최소 구현)는 문자열 입력을 그대로 쓰고 새 입력을 두지 않으며, 친 글은 위 해석을 거친다(BLUEPRINT-042). 【추론】 코어 기본 정의에 `{type:'union'}` 항목 하나를 더해 정의가 열한 개가 된다(BLUEPRINT-042). 【추론】 그 항목은 `FormTypeInputString`을 감싸 아래의 초안·표시 규칙을 더한 것이며 새 구성 요소가 아니고, 자리는 `FormTypeInputStringDefinition` 바로 앞이다(BLUEPRINT-042).

구현 이름은 PR-1(청사진 fractal)에서 정할 때 풀 네임으로 짓는다(예: `PropertyDeclaration`)(BLUEPRINT-046). 근거 규칙은 이미 있다: 약어 금지·처음 나올 때 풀어 씀(PROCESS-023), 이름은 줄임말이 아닌 풀 네임(SURFACE-023)(BLUEPRINT-046). 구현의 타입 이름은 `SchemaFragment`로 짓는다(개념어 "조각"과 원장의 FRAGMENT 영역 이름은 그대로)(BLUEPRINT-047).

### 2.6 허용 집합과 유효 목록

가. 목록은 `node.schemaType`(+`nullable`)에서 읽는다; 유효 목록은 BLUEPRINT-041의 통합 원리 U4다(BLUEPRINT-040, BLUEPRINT-041). 규칙 A·기본 입력·경고등의 기준 목록은 `node.schemaType`과 `node.nullable`이며, 게이트가 켜진 동안에는 모든 종류에서 유효 목록을 쓴다(BLUEPRINT-040). 청사진은 계산한 `schemaType`을 유효 스키마에 써 넣지 않는다(BLUEPRINT-040). `jsonSchema.type`은 켜진 선언의 `type`을 병합표 규칙대로 교집합으로 합친 값이다(BLUEPRINT-040). 그래서 켜진 `then`이 목록을 좁히면 `jsonSchema.type`은 좁아지고, `schemaType`은 그대로다(BLUEPRINT-040). `union` 노드의 입력은 목록의 한 형의 값이나 없음을 보내며, 어떤 형을 보낼지는 입력 구현(UI 플러그인)이 정한다(BLUEPRINT-040, WRITE-099).

통합 원리 U1–U9를 채택한다(BLUEPRINT-041). U1: 한 칸의 `type` 선언들은 연언이고, 허용 집합은 교집합이며(`null` 포함, `integer ⊂ number`), 순서와 무관하다(BLUEPRINT-041). U2: 빈 교집합만이 충돌이며, 정적이면 청사진 오류, 게이트이면 그 게이트들이 켜진 동안의 정착 오류이고, `{null}`은 빈 집합이 아니라 null 노드다(BLUEPRINT-041). U3: 정적 선언(본체·게이트 없는 `allOf`·`$ref`)이 종류·`schemaType`·`nullable`을 청사진에서 정한다(BLUEPRINT-041). U4: 게이트 선언(`then`·`else`, `controls.active` 조각, 게이트 가진 분기)은 종류·`schemaType`·`nullable`·입력 선택을 바꾸지 않고, 켜진 동안 유효 목록만 좁히며, 이는 모든 종류에 적용된다(BLUEPRINT-041). U5: 유효 목록은 노드마다 유효 스키마 메모에서 파생하고, 좁히지 않으면 `schemaType`과 같은 참조이며, 병합표의 `type` 행은 교집합이다(BLUEPRINT-041). U6: 게이트만 바뀌면 값은 다시 해석하지 않고(소급 변환 없음) 경고등만 다시 정한다(BLUEPRINT-041). U7: 한 진입에서 쓰인 노드(입력 쓰기·`setValue`·로드·채움)는 그 진입의 전이 단계에서 최종 유효 목록으로 한 번 더 해석하며, 쓰이지 않은 노드는 다시 해석하지 않는다(BLUEPRINT-041). U8: 호스트의 게이트 없는 분기는 "또는" 문맥이라 유효 목록을 좁히지 않는다(BLUEPRINT-041). U9: 쓰기 없이 경고등만 바뀐 노드는 유효 스키마 변경 통지로 배달되고, 게이트가 좁혀 쓰기 없이 켜진 `SCHEMA_FORM_WARNING.TYPE_MISMATCH` 경고의 `source`는 `'gate'`이며, 기록의 `expected.effective`는 그 커밋의 유효 목록이고, 기본 입력은 유효 목록이 바뀌면 초안을 다시 판정한다(BLUEPRINT-041, SURFACE-061). 이 답은 앞선 소유자 결정의 읽기 "`then`·`allOf` 좁힘은 검증 전용"(2026-09-26, 원장 미기재)을 대체한다: 정적 좁힘은 교집합으로 종류를 정하고(U3), 게이트 좁힘은 유효 목록을 좁힌다(U4)(BLUEPRINT-041). 【추론】 켜진 게이트 선언의 `type`과 정적 허용 집합의 교집합이 비면 유효 스키마는 `enum: []`을 적지 않고 형 충돌을 결과에 드러내며, 그 게이트들이 켜진 동안의 정착 오류 `SHARED_NODE_CONFLICT`는 PR 03(정착)이 던진다(BLUEPRINT-041, SCHEMA-045). 【추론】 보정 PR은 그 신호를 `mergeEffectiveSchema`의 반환 `{ schema, typeConflict }`로 드러내고(형 충돌이면 `typeConflict: true`, `schema.type`은 정적 `schemaType`, `enum`은 적지 않음, 같은 활성 집합이면 같은 참조), 최종 모양은 PR 03이 정한다(BLUEPRINT-041).

【추론】 쓰기 경계에서는 그 노드의 정적 목록(`schemaType`, `nullable`)으로 한 번 해석한다(BLUEPRINT-041). 【추론】 이 목록은 게이트와 무관하므로 직전 상태에 기대지 않는다(BLUEPRINT-041). 【추론】 전이 단계에서는 이 진입에서 쓰인 노드마다, 최종 유효 목록이 정적 목록보다 좁으면 원래 쓰인 값(쓰기 경계에서 바뀐 값이 아니라 호출자·입력이 준 값)을 최종 유효 목록으로 다시 해석해 그 결과를 원본으로 삼는다(BLUEPRINT-041). 【추론】 그래서 결과는 "쓰인 값을 최종 유효 목록으로 한 번 해석한 것"과 같고, 직전 커밋의 게이트 상태에 기대지 않는다(BLUEPRINT-041). 【추론】 로드(마운트, `FormHandle.reset()`, `resetSubtree()`)도 같은 두 단계를 따른다(BLUEPRINT-041). 게터 `typeMismatch: boolean`, 경로 목록 `typeMismatches: readonly string[]`, 경고 코드 `SCHEMA_FORM_WARNING.TYPE_MISMATCH`다(BLUEPRINT-041, SURFACE-061). 【추론】 전이 단계의 재해석은 전이 쓰기다(BLUEPRINT-041, WRITE-099). U7의 "한 번 더"는 라운드마다이며, 한 노드는 한 라운드에 한 번만 다시 해석하고 상한을 넘기면 원본 B에는 쓰기 경계의 해석(정적 목록)만 남는다(BLUEPRINT-041, WRITE-099).

### 2.7 형을 명시하지 않은 칸

분기 b의 허용 집합 A(b)는 b 자신의 정적 연언에 정적 교집합 규칙을 적용한 결과이며, 거기서 난 오류는 그대로 낸다(BLUEPRINT-051). 한 키워드의 허용 집합 U는 분기 A(b)의 합집합이며 `'null'`을 포함하고, 순서는 분기 순서에서 처음 나온 순서다(BLUEPRINT-051). `oneOf`와 `anyOf`가 함께 있으면 둘은 연언이므로, 두 키워드의 U를 교집합한 것이 U이며(`'null'` 포함) 순서는 `oneOf` 쪽을 따른다(BLUEPRINT-051). `'null'`은 합치고 교집합한 뒤에야 떼어 낸다(BLUEPRINT-051). U가 빈 집합이면 `UNKNOWN_JSON_SCHEMA`이다(BLUEPRINT-051). U가 `{null}`이면 null 종류이고 `nullable: true`이다(BLUEPRINT-051). 그 밖에는 U가 원시 잎이나 `union` 잎을 정하고, 분기의 제약은 검증 전용이다(BLUEPRINT-051, BLUEPRINT-035). 게이트 가진 분기(분기 안의 `controls.active`, `controls.discriminator`로 변환된 분기)는 이 합치기에 넣지 않고 게이트 선언의 규칙을 따른다(BLUEPRINT-051). `nullable: true`는 같은 객체에 `type`이 있을 때만 `'null'`을 더하므로, 형 없는 칸의 `nullable`은 효과가 없다(BLUEPRINT-051).

가. 자기 `type` 없는 칸에서 허용 집합이 ⊤인 분기가 하나라도 있으면(`const`·`enum`만 있는 분기 포함) `UNKNOWN_JSON_SCHEMA`이다(BLUEPRINT-038). 오류에 그 분기의 schemaPath와 "`type`을 적으라"는 안내를 싣는다(BLUEPRINT-038).

자기 `type` 없는 칸의 게이트 없는 `oneOf`·`anyOf` 분기 형을 접은 집합 F가 `{object}`이면 칸은 object 종류이고 `schemaType`은 `'object'`이며, F가 `{array}`이면 array 종류이고 `schemaType`은 `'array'`다(BLUEPRINT-048). 【추론】 S3(정적 연언 C에 `type`이 없는 칸)는 BLUEPRINT-051의 절차 그대로 칸의 게이트 없는 `oneOf`·`anyOf` 분기의 허용 집합 A(b)를 합쳐 키워드마다 U를 만들고(`'null'` 포함), `oneOf`와 `anyOf`가 함께 있으면 두 U를 교집합한 것을 U로 하며, 그 뒤에야 `'null'`을 떼어 F = fold(U \ {null})를 만든다(BLUEPRINT-048, BLUEPRINT-051). 【추론】 게이트 가진 분기(분기 안의 `controls.active`, `controls.discriminator`로 변환된 분기)는 BLUEPRINT-051과 BLUEPRINT-041의 U4대로 U에 넣지 않고 게이트 선언의 규칙을 따르며, 게이트 없는 분기가 없으면 BLUEPRINT-050을 따르고(C에 `const`·`enum`도 없으면 `UNKNOWN_JSON_SCHEMA`), U가 빈 집합이면 `UNKNOWN_JSON_SCHEMA`다(BLUEPRINT-048, BLUEPRINT-050). 【추론】 F가 `{object}`나 `{array}`인 칸의 nullable은 `'null'` ∈ U와 같다(BLUEPRINT-048). 【추론】 F가 `{array}`인 칸에서 분기의 `items`·`prefixItems`는 자기 `type:'array'`를 명시한 호스트와 같은 규칙(게이트 없는 분기끼리 fold가 같으면 노드 하나, 다르면 `SHARED_NODE_KIND_CONFLICT`)을 따른다(BLUEPRINT-048). 【추론】 종류가 정해진 칸은 그 뒤 S4의 variant 규칙과 S6의 순서(`options.terminal` → 판정 → `type`)를 자기 `type`을 명시한 칸과 똑같이 따르되, S6의 `type` 단계는 저자 스키마가 아니라 F가 정한 종류를 읽고, S4의 "형 있는 칸의 null 분기는 nullable을 켜지 않는다"는 이 칸에 적용하지 않는다(BLUEPRINT-048). 【추론】 F의 원소가 둘 이상이고 그 가운데 `object`나 `array`가 있으면 `UNKNOWN_JSON_SCHEMA`다(`object`와 `array`만 섞인 경우 포함, E15는 그대로다)(BLUEPRINT-048). 【추론】 F에 `object`나 `array`가 없으면 BLUEPRINT-051의 원시 접기를 그대로 적용한다(U가 `{null}`이면 null 종류, 그 밖에는 원시 잎이나 `union` 잎)(BLUEPRINT-048, BLUEPRINT-051, BLUEPRINT-035). 【추론】 셈에 드는 게이트 없는 분기 가운데 허용 집합이 ⊤인 분기(`const`·`enum`만 있는 분기 포함)가 있으면 F를 만들기 전에 BLUEPRINT-038대로 그 분기의 schemaPath와 `type`을 적으라는 안내를 담은 `UNKNOWN_JSON_SCHEMA`다(BLUEPRINT-048, BLUEPRINT-038). 【추론】 분기 b의 A(b)는 b의 정적 연언(b 본체, 게이트 없는 `allOf`, `$ref` 대상)에 S2를 적용한 결과이고, b의 정적 연언에 `type`이 없으면 b에 S3를 재귀 적용해 얻은 U(`'null'`을 떼기 전)이며, 재귀에서 난 오류는 그대로 낸다(BLUEPRINT-048). 【추론】 재귀가 지금 펼치는 경로에 이미 있는 스키마 위치(분기 위치나 그 `$ref` 대상)에 다시 닿으면 그 분기는 더 펼치지 않고 U에 아무것도 더하지 않으며(BLUEPRINT-030의 조각 안 순환 절단과 같다), 그 결과 U가 비면 `UNKNOWN_JSON_SCHEMA`다(BLUEPRINT-048, BLUEPRINT-030). 【추론】 이 재귀는 `properties`·`items`·`prefixItems`를 건너지 않으므로 `RECURSIVE_SHAPE_UNBOUNDED`의 판정과 겹치지 않는다(BLUEPRINT-048).

object variant 호스트(분기가 객체 스키마인 `oneOf`·`anyOf`, 깊이와 상관없는 자식 하위 트리 포함)는 이 설계가 건드리지 않는다(BLUEPRINT-049). 이 답은 자기 `type` 없는 칸의 분기가 object·array와 원시를 섞는 경우만 다룬다(BLUEPRINT-049). 그 칸을 받아들이도록 푸는 것은 뒤로 미루며, 나중에 풀어도 파괴적 변화가 아니다(BLUEPRINT-049). `object`와 `array`만 섞인 칸도 `UNKNOWN_JSON_SCHEMA`다(BLUEPRINT-049, BLUEPRINT-048). 접은 집합 F가 `{object}`나 `{array}`인 칸은 variant 호스트로 추정하고, `object`나 `array`가 다른 종류와 섞인 경우만 `UNKNOWN_JSON_SCHEMA`다(BLUEPRINT-049, BLUEPRINT-048).

가. 정적 연언 C에 `type`이 없고 게이트 없는 `oneOf`·`anyOf` 분기도 없는 칸에 C의 `const`나 `enum`이 있으면, 그 리터럴들의 JSON 종류(string·number·boolean·null, 정수 리터럴은 number)를 모아 U를 만들고 BLUEPRINT-051의 접기(`'null'`은 떼어 nullable로)를 적용해 원시 잎이나 null 잎으로 정한다(BLUEPRINT-050, BLUEPRINT-051). `'null'`을 뗀 리터럴의 종류가 둘 이상이거나 리터럴에 객체·배열이 있으면 `UNKNOWN_JSON_SCHEMA`다(BLUEPRINT-050). 이 규칙은 분기가 없는 칸에만 적용되며, 분기 안의 `const`·`enum`만 있는 분기(BLUEPRINT-038, E14)는 그대로 `UNKNOWN_JSON_SCHEMA`다(BLUEPRINT-050, BLUEPRINT-038). 【추론】 그 오류에는 그 칸의 schemaPath와 `type`을 적으라는 안내를 싣는다(BLUEPRINT-050). 【추론】 BLUEPRINT-048의 재귀가 분기 b를 볼 때 b의 정적 연언에 `type`도 분기도 없으면 b의 허용 집합은 BLUEPRINT-038대로 ⊤이다(BLUEPRINT-050, BLUEPRINT-038, BLUEPRINT-048).

【추론】 형 없는 분기(`const`·`enum`만 있는 것 포함)와 객체·원시 혼합 분기는 `never`와 `unknown`이다(NODE-058). 모든 분기가 인라인 객체(또는 배열)인 형 없는 칸은 `ObjectNode`(또는 `ArrayNode`)와 분기 값 형의 합이고, 분기 없는 `const`·`enum` 칸은 리터럴 형이며, 형 없는 분기와 혼합 분기는 그대로다(NODE-058, NODE-059).

### 2.8 청사진 판정 절차와 사례

【추론】 선언 d의 허용 집합 A(d)는 `'null'`을 포함해 d가 받는 형의 집합이다(BLUEPRINT-044). 【추론】 A(d)의 기본은 d 자신의 `type`(문자열이나 배열)의 원소이고, `nullable: true`는 같은 객체에 `type`이 있을 때만 `'null'`을 더하며, `'null'`만 받는 분기는 `{null}`이다(BLUEPRINT-044). 【추론】 `type`이 없는 선언은 A = ⊤이며 어느 종류와도 맞는다(BLUEPRINT-044). 【추론】 형 없는 칸의 분기 b는 정적 연언에 `type`이 없고 분기가 있으면 A(b)가 b에 S3를 재귀 적용한 U이며, `type`도 분기도 없을 때만 ⊤이다(BLUEPRINT-044, BLUEPRINT-048, BLUEPRINT-050). 【추론】 ⊤가 아닌 A가 빈 집합이면 종류가 없고, 그 A를 만든 단계가 오류를 정한다(BLUEPRINT-044). 【추론】 A = `{null}`이면 null 종류이고 `nullable: true`이다(BLUEPRINT-044). 【추론】 그 밖에는 F = fold(A \ {null})로 정하며(fold는 `'integer'`를 `'number'`로 바꾼다), |F| = 1이면 그 종류, |F| ≥ 2이면 `union`이다(BLUEPRINT-044, BLUEPRINT-035). 【추론】 nullable은 `'null'` ∈ A와 같다(BLUEPRINT-044). 【추론】 두 선언은 fold가 같을 때 같은 종류이며, 구현은 7비트 마스크 비교 한 번이다(BLUEPRINT-044). 【추론】 두 허용 집합의 교집합은 원소마다 취한다: `integer ⊂ number`이므로 `number` ∩ `integer` = `integer`이고, `'null'`은 양쪽에 있을 때만 남으며, 순서는 앞 집합의 순서를 따른다(BLUEPRINT-044).

【추론】 절차는 칸마다 S0부터 번호 순서로 보며, 반드시 하나의 결과로 끝난다(BLUEPRINT-044). 【추론】 S0 문법: 알려지지 않은 형 이름, 빈 배열 `[]`, 배열 안의 중복 원소는 `UNKNOWN_JSON_SCHEMA`이다(BLUEPRINT-044). 【추론】 선언 하나 안의 `['integer','number']`는 `'number'`다(BLUEPRINT-044). 【추론】 S1 정적 연언 C는 칸 본체, 게이트 없는 `allOf` 항목(재귀), 그리고 이것들의 `$ref` 대상이다(BLUEPRINT-044, FRAGMENT-048, SCHEMA-007). 【추론】 `type`을 가진 선언을 전순서로 늘어놓은 첫째를 앵커라 부르며, 앵커는 결과 원소의 순서만 정한다(BLUEPRINT-044). 【추론】 S2(C에 `type`을 가진 선언이 있는 칸)는 BLUEPRINT-041의 U1–U3을 따르며, `type`이 없는 선언(A = ⊤)은 교집합에 관여하지 않는다(BLUEPRINT-044, BLUEPRINT-041). 【추론】 S2에서 교집합이 빈 집합이면 `ALL_OF_TYPE_REDEFINITION`이다(BLUEPRINT-044). 【추론】 S3(C에 `type`이 없는 칸)은 BLUEPRINT-051·BLUEPRINT-038·BLUEPRINT-049·BLUEPRINT-048·BLUEPRINT-050을 따른다(BLUEPRINT-044, BLUEPRINT-051, BLUEPRINT-038, BLUEPRINT-049, BLUEPRINT-048, BLUEPRINT-050). 【추론】 S4: 칸의 종류가 원시나 `union`이면 게이트 없는 `oneOf`·`anyOf` 분기의 `type`은 검증 전용이며, 목록 밖 분기와 null 분기도 오류가 아니다(BLUEPRINT-044, BLUEPRINT-035). 【추론】 형 있는 칸의 null 분기는 nullable을 켜지 않고, 유효 목록을 좁히지 않는다(BLUEPRINT-044). 【추론】 칸이 object·array이면 기존 variant 규칙을 따른다(BLUEPRINT-044).

【추론】 S5: 같은 이름의 선언이 여러 조각에 있으면, 정적 선언(호스트 본체, 호스트의 게이트 없는 `allOf`, `$ref`)은 모두 그 칸의 C가 되어 노드 하나를 정한다(BLUEPRINT-044, BLUEPRINT-010). 【추론】 켜진 게이트 선언과 정적 허용 집합의 교집합(`'null'` 포함)이 빈 경우(BLUEPRINT-041의 U2)는 그 게이트들이 켜진 동안 `SHARED_NODE_CONFLICT`(정착 오류, 기존 처리)로 드러난다(BLUEPRINT-044, BLUEPRINT-041). 【추론】 호스트의 게이트 없는 분기의 `type`은 "또는" 문맥이라 존재만 더하고 교차하지 않는다(BLUEPRINT-044, SCHEMA-008, SCHEMA-044). 【추론】 그 분기의 fold가 정적 노드의 fold에 들면 검증 전용이며 목록·nullable·유효 목록을 바꾸지 않고, 그 밖에는 `SHARED_NODE_KIND_CONFLICT`이다(BLUEPRINT-044). 【추론】 정적 선언이 하나도 없는 이름은 fold가 같은 선언끼리 노드 하나를 둔다(BLUEPRINT-044). 【추론】 그 노드의 목록은 선언들 허용 집합의 합집합을 종류 규칙으로 나눈 것이며, `integer`는 모든 선언이 `integer`일 때만 남고, nullable은 OR이며, `{null}`이면 null 종류다(BLUEPRINT-044). 【추론】 그 목록의 순서는 전순서의 첫 선언을 앵커로 하고, 앵커에 없는 원소는 처음 나온 순서대로 뒤에 붙인다(BLUEPRINT-044). 【추론】 fold가 다른 게이트 선언이 동시에 켜지면 `SHARED_NODE_CONFLICT`이고, 배타이면 종류별 노드이며(BLUEPRINT-011·012 그대로), 각 노드 안에서는 켜진 선언이 유효 목록을 좁힌다(BLUEPRINT-044, BLUEPRINT-011, BLUEPRINT-012). 【추론】 정적 선언이 없는 이름에서 게이트 없는 분기끼리 fold가 다르면 게이트 없는 선언끼리의 다른 종류이므로 `SHARED_NODE_KIND_CONFLICT` 청사진 오류다(BLUEPRINT-012, 소유자 O-10)(BLUEPRINT-044, WRITE-099).

【추론】 S6: 종류가 object·array인 칸은 nullable을 포함해(`['object','null']`) 오늘 순서 `options.terminal` → 판정 → `type`을 따른다(BLUEPRINT-044, NODE-028, NODE-042). 【추론】 전략이 `terminal`인 모든 노드의 인라인 하위 스키마(깊이 1 이상, `$ref`는 따라가지 않음)에 예약 층 키 `controls`·`options`·`presentation`이 나오면, 청사진이 경고 `(가칭) SCHEMA_FORM_WARNING.TERMINAL_SUBTREE_KEY_IGNORED_FOR_FORM`을 낸다(BLUEPRINT-044). 【추론】 그 기록은 `{ schemaPath, keys, paths }`이고, `(code, schemaPath)`로 트리마다 한 번 낸다(BLUEPRINT-044). 【추론】 그 경고는 개발 모드 콘솔과 커밋된 로드의 준비 이펙트로 드러나며(ERROR-164 `NULL_BRANCH_IGNORED_FOR_FORM` 행과 같은 드러남), 핸들러가 없는 프로덕션에서는 검사하지 않는다(BLUEPRINT-044, ERROR-164). 【추론】 union 칸 인라인 하위 스키마의 `presentation.FormTypeInput`은 그릴 자리가 없으므로 이 경고의 대상이다(BLUEPRINT-044, BLUEPRINT-035). 【추론】 결과는 일곱 가지다: 원시 잎(+nullable), null 잎, 원시만의 `union` 잎, 터미널 강제 `union` 잎, object·array 노드(branch 또는 terminal, +nullable), variant 호스트, 청사진 오류(BLUEPRINT-044, BLUEPRINT-035).

PR: PR-1(청사진 판정)·PR-4(ajv8 설정)(BLUEPRINT-044). 무엇: `src/core/blueprint/__tests__/`의 `union.kind-procedure.test.ts`(E1–E42), `union.null-only.test.ts`, `union.static-intersection.test.ts`, `union.schema-type-invariant.test.ts`, `union.gated-narrowing.test.ts`, `union.terminal-subtree-warning.test.ts`와 `schema-form-ajv8-plugin/src/**/__tests__/union-types.test.ts`를 돌린다(BLUEPRINT-044). 통과: 예마다 종류·`schemaType`·nullable·전략·오류가 위대로이고, `allOf` 항목의 순서를 바꿔도 결과(원소 순서 제외)가 같으며, ajv8 컴파일에서 `console.warn`이 0회다(BLUEPRINT-044). 실패: 예와 다르면 절차를 고치고, 절차가 예를 하나로 정하지 못하면 이 블록을 고친다(BLUEPRINT-044). 【추론】 BLUEPRINT-044와 TEST-077이 든 `union.*.test.ts` 여섯 이름은 단언의 주소이며 규범이 아니다(BLUEPRINT-044). 단언이 게이트다(BLUEPRINT-044). 【추론】 E1–E42는 `src/core/blueprint/__tests__/`의 네 파일에 있다: `blueprint.type-syntax.test.ts`(E1–E10, E28), `blueprint.type-inference.test.ts`(E11–E17, E29, E32–E35), `blueprint.type-static-intersection.test.ts`(E18–E24, E30, E31, E36–E39), `blueprint.type-gated-declarations.test.ts`(E25–E27, E40–E42)(BLUEPRINT-044). 【추론】 `union.kind-procedure.test.ts`의 단언은 위 네 파일의 표 행과 `blueprint.type-gated-declarations.test.ts`의 정적 소유자 없는 분기 접기 충돌 사례에, `union.null-only.test.ts`는 위 표 행에, `union.static-intersection.test.ts`는 `blueprint.type-static-intersection.test.ts`에, `union.schema-type-invariant.test.ts`는 `blueprint.type-syntax.test.ts`의 E1–E9 불변식에, `union.gated-narrowing.test.ts`는 `blueprint.type-gated-declarations.test.ts`에, `union.terminal-subtree-warning.test.ts`는 `blueprint.diagnostics.test.ts`와 `blueprint.type-syntax.test.ts`의 E28에 있다(BLUEPRINT-044).

【추론】 예(종류 / `schemaType` / nullable / 전략 / 오류)는 아래 E1–E42와 같다(BLUEPRINT-045).
- 【추론】 E1: `{type:['string','number']}`는 union / `['string','number']` / false / terminal(BLUEPRINT-045, BLUEPRINT-035).
- 【추론】 E2: `{type:['number','string','null']}`는 union / `['number','string']` / true / terminal(BLUEPRINT-045, BLUEPRINT-035).
- 【추론】 E3: `{type:['string','number'], nullable:true}`는 union / `['string','number']` / true / terminal(BLUEPRINT-045, BLUEPRINT-035).
- 【추론】 E4: `{type:['integer','number']}`는 number / `'number'` / false / terminal(BLUEPRINT-045).
- 【추론】 E5: `{type:['integer','string']}`는 union / `['integer','string']` / false / terminal(BLUEPRINT-045, BLUEPRINT-035).
- 【추론】 E6: `{type:['integer','null']}`는 number / `'integer'` / true / terminal(BLUEPRINT-045).
- 【추론】 E7: `{type:['object','string'], properties:{…}}`는 union / `['object','string']` / false / terminal(강제)(BLUEPRINT-045, BLUEPRINT-035).
- 【추론】 E8: `{type:['object','null']}`는 object / `'object'` / true / NODE-028 순서(BLUEPRINT-045).
- 【추론】 E9: `{type:['null']}`는 null / `'null'` / true / terminal(BLUEPRINT-045).
- 【추론】 E10: `{type:['null','null']}`, `{type:[]}`, `{type:['string','foo']}`는 `UNKNOWN_JSON_SCHEMA`(BLUEPRINT-045).
- 【추론】 E11: `{anyOf:[{type:'string'},{type:'number'}]}`는 union / `['string','number']` / false / terminal(BLUEPRINT-045, BLUEPRINT-035).
- 【추론】 E12: `{anyOf:[{type:'integer'},{type:'string',minLength:1},{type:'null'}]}`는 union / `['integer','string']` / true / terminal(BLUEPRINT-045, BLUEPRINT-035).
- 【추론】 E13: `{anyOf:[{type:'string'},{type:'null'}]}`는 string / `'string'` / true / terminal(BLUEPRINT-045).
- 【추론】 E14: `{anyOf:[{const:'a'},{type:'number'}]}`는 `UNKNOWN_JSON_SCHEMA`(BLUEPRINT-045, BLUEPRINT-038).
- 【추론】 E15: `{anyOf:[{type:'object'},{type:'string'}]}`는 `UNKNOWN_JSON_SCHEMA`(BLUEPRINT-045, BLUEPRINT-048).
- 【추론】 E16: 자기 형 없는 `{oneOf:[{type:'object',…},{type:'object',…}]}`는 object / `'object'` / false / NODE-028 순서(variant 호스트)(BLUEPRINT-045, BLUEPRINT-048).
- 【추론】 E17: `{oneOf:[{type:'string'},{type:'number'}], anyOf:[{type:'number'},{type:'boolean'}]}`는 number / `'number'` / false / terminal(BLUEPRINT-045).
- 【추론】 E18: `{type:['string','number'], allOf:[{type:'string'}]}`는 string / `'string'` / false / terminal(BLUEPRINT-045).
- 【추론】 E19: `{type:['number','string'], allOf:[{type:['integer','string']}]}`는 union / `['integer','string']` / false / terminal(BLUEPRINT-045, BLUEPRINT-035).
- 【추론】 E20: `{type:'number', allOf:[{type:'integer'}]}`는 number / `'integer'` / false / terminal(BLUEPRINT-045).
- 【추론】 E21: `{type:['string','null'], allOf:[{type:'string'}]}`는 string / `'string'` / false / terminal(BLUEPRINT-045).
- 【추론】 E22: `{type:'string', anyOf:[{type:'null'},{minLength:1}]}`는 string / `'string'` / false / terminal(BLUEPRINT-045).
- 【추론】 E23: `{type:'string', allOf:[{type:'number'}]}`는 `ALL_OF_TYPE_REDEFINITION`(교집합이 빈 집합)(BLUEPRINT-045).
- 【추론】 E24: `{type:'number', allOf:[{type:['number','string']}]}`는 number / `'number'` / false / terminal(오늘은 오류)(BLUEPRINT-045).
- 【추론】 E25: 본체 `a:{type:['string','number']}` + `if/then a:{type:'number'}`는 union / `['string','number']` / false / terminal이고, 켜진 동안 유효 목록은 `['number']`다(BLUEPRINT-045, BLUEPRINT-035).
- 【추론】 E26: 본체 `a:{type:'number'}` + `if/then a:{type:['number','string']}`는 number / `'number'` / false / terminal이고, 켜진 동안 유효 목록은 `schemaType`과 같은 `'number'`다(BLUEPRINT-045, WRITE-099).
- 【추론】 E27: 본체 없이 `then a:['string','number']` / `else a:'number'`는 배타인 두 노드(union과 number)다(BLUEPRINT-045, BLUEPRINT-035).
- 【추론】 E28: `{type:['string','number'], options:{terminal:false}}`는 `TERMINAL_OPTION_UNSUPPORTED`(BLUEPRINT-045).
- 【추론】 E29: `{nullable:true, anyOf:[{type:'string'},{type:'number'}]}`는 union / `['string','number']` / false / terminal(형 없는 `nullable`은 효과 없음)(BLUEPRINT-045, BLUEPRINT-035).
- 【추론】 E30: `{type:['string','null'], allOf:[{type:['number','null']}]}`는 null / `'null'` / true / terminal(교집합 `{null}`)(BLUEPRINT-045).
- 【추론】 E31: `{type:['string','number'], allOf:[{type:['string','boolean']}]}`는 string / `'string'` / false / terminal(BLUEPRINT-045).
- 【추론】 E32: `{anyOf:[{type:'null'}]}`는 null / `'null'` / true / terminal(BLUEPRINT-045).
- 【추론】 E33: `{oneOf:[{type:'null'}], anyOf:[{type:'null'}]}`는 null / `'null'` / true / terminal(BLUEPRINT-045).
- 【추론】 E34: `{anyOf:[{type:['string','null']},{type:'number'}]}`는 union / `['string','number']` / true / terminal(BLUEPRINT-045, BLUEPRINT-035).
- 【추론】 E35: `{anyOf:[{type:'string',nullable:true},{type:'number'}]}`는 union / `['string','number']` / true / terminal(BLUEPRINT-045, BLUEPRINT-035).
- 【추론】 E36: `{type:'integer', allOf:[{type:'number'}]}`는 number / `'integer'` / false / terminal(오늘과 같음)(BLUEPRINT-045).
- 【추론】 E37: `{type:'string', allOf:[{type:['string','null']}]}`는 string / `'string'` / false / terminal(오늘과 같음)(BLUEPRINT-045).
- 【추론】 E38: `{type:['string','number','null'], allOf:[{type:['string','boolean','null']}]}`는 string / `'string'` / true / terminal(BLUEPRINT-045).
- 【추론】 E39: `{allOf:[{type:['string']},{type:['string','number']}]}`와 그 순서를 뒤집은 것은 둘 다 string / `'string'` / false / terminal(BLUEPRINT-045).
- 【추론】 E40: 본체 `a:['string','number','boolean']` + `then1 a:'string'` + `then2 a:'boolean'`은 union / `['string','number','boolean']` / false / terminal이고, 둘 다 켜지면 `SHARED_NODE_CONFLICT`다(BLUEPRINT-045, BLUEPRINT-035).
- 【추론】 E41: 본체 `a:{type:'number'}` + `if/then a:{type:'integer'}`는 number / `'number'` / false / terminal이고, 켜진 동안 유효 목록은 `['integer']`(정수 규칙)다(BLUEPRINT-045).
- 【추론】 E42: 본체 `a:['string','number']` + 호스트의 게이트 없는 `oneOf` 분기 `a:{type:'string'}`는 union / `['string','number']` / false / terminal이고, 분기는 유효 목록을 좁히지 않는다(BLUEPRINT-045, BLUEPRINT-035).

## 3. 조각과 게이트

### 3.1 조각과 게이트의 기본 모델

`if`/`then`/`else`의 기존 방식(조건부 `required`로 `active`를 조절)은 완전히 제거한다(FRAGMENT-003). `if` 블록의 스키마로 값을 검증해, 통과하면 `then` 절을 자식에 적용한다(FRAGMENT-003). 컨디션은 `if`, 적용은 `then`으로 완전히 분리하고 `else`는 반대 동작으로 허용한다(FRAGMENT-003). `allOf`의 기존 병합은 유지한다(FRAGMENT-003).

용어: 4차까지 "가드"라 부르던 것을 원장을 따라 **게이트**라 부른다(FRAGMENT-002). 제목과 파일 이름은 그대로 둔다(FRAGMENT-002).

조건부로 형상을 바꾸는 모든 구문을 하나의 내부 표현으로 환원한다(FRAGMENT-001). 표의 "연언"은 모든 조각의 제약이 함께 적용되는 "그리고" 문맥, "선언"은 분기 가운데 하나만 맞으면 되는 "또는" 문맥이다(FRAGMENT-001). 조각은 게이트가 켜고 끄는 선언 묶음이다(FRAGMENT-001). 게이트가 없는 조각은 늘 켜져 있다(FRAGMENT-001).

(FRAGMENT-001)

| 구문 | 게이트 | 조각 (게이트가 참일 때 얹는 스키마) | 문맥 |
| ---- | ------ | ----------------------------------- | ---- |
| 최상위·`allOf` 항목·분기 안의 `if`/`then`/`else` | `if`(검증기 플러그인이 컴파일) | `then` / `else` | 연언(분기 안이면 그 분기의 문맥) |
| 게이트 없는 `properties`·`allOf` 항목 | 항상 참 | 블록 전체 | 연언 |
| `controls.active`를 가진 조각 객체 | `controls.active`(예약 층 표현식) | 그 조각이 선언한 노드 집합 | 연언 |
| 게이트 없는 `oneOf`·`anyOf` 분기 | 항상 참(존재만) | 분기 전체 | 선언. 제약은 교차하지 않음 |

게이트의 종류는 둘이다(FRAGMENT-009). 둘 다 호스트 바퀴 안에서 같은 절차로 평가된다(FRAGMENT-009, SETTLE-009). **`if` 게이트.**(FRAGMENT-009) 스키마다(FRAGMENT-009). 검증기 플러그인의 `compileGuard`로 동기 평가한다(FRAGMENT-009, VALIDATE-016). 폼은 `if` 안에 무엇이 오든 그 뜻을 해석하지 않는다(GOAL-034의 축 1항(폼은 JSON Schema 문법을 해석하지 않는다))(FRAGMENT-009, GOAL-034). **`controls.active` 게이트.**(FRAGMENT-009) 예약 층의 표현식이다(FRAGMENT-009). 조각 객체에 달면 조각 게이트, 노드 스키마에 달면 노드 게이트다(FRAGMENT-009).

조각은 자기가 나온 구문의 문맥(연언인가 선언인가)과 소속(어느 `oneOf`/`anyOf`의 분기인가)을 든다(FRAGMENT-011). **중첩 조각은 감싸는 조각이 활성일 때만 순회한다**(FRAGMENT-011). 전순서 = (감싸는 조각의 순서, 키워드 순위 `properties` < `allOf[i]` < `if`/`then`/`else` < `oneOf` 분기 < `anyOf` 분기, 배열 인덱스)(FRAGMENT-011, FRAGMENT-049). 2라운드 S13("나중 선언이 이긴다"가 JSON 키 순서에 기댄다)은 이 전순서로 닫힌다(FRAGMENT-011). 같은 호스트의 `oneOf` 분기는 모든 `anyOf` 분기보다 앞이다(FRAGMENT-011, FRAGMENT-049). 호스트에서 조각까지의 경로를 (키워드 순위, 배열 인덱스) 쌍의 열로 보고 사전식으로 비교한 것이 전순서다(FRAGMENT-011). JSON 키 순서에 기대지 않는다(FRAGMENT-011). **존재(어떤 프로퍼티가 있는가)는 활성 조각의 합집합이다**(FRAGMENT-011). 문맥과 무관하다(FRAGMENT-011). **제약(기존 프로퍼티에 얹는 overlay)은 연언 문맥의 조각끼리만 교차한다**(FRAGMENT-011). 게이트 없는 분기는 존재만 더한다(FRAGMENT-011). 순수 분기 둘이 `kind`에 `const: 'a'`와 `const: 'b'`를 두면 교차는 공집합이 되어 검증기보다 좁은 힌트를 내기 때문이다(FRAGMENT-011). 게이트가 켜진 조각은 작성자가 "이 분기가 해당한다"고 선언한 것이므로 연언으로 적용한다(FRAGMENT-011). 병합의 세부는 SCHEMA-008의 병합표다(FRAGMENT-011, SCHEMA-008). 유효 스키마는 폼 전용이고 검증기에 가지 않으므로 영향은 UI 힌트(select의 선택지, min/max)에 한정된다(FRAGMENT-011, SCHEMA-007).

1. **중첩은 재귀로 다룬다**(FRAGMENT-021). 조각도 스키마다(FRAGMENT-021). `oneOf`·`anyOf` 분기 **안의** `if`/`then`/`else`도 같다(FRAGMENT-021). 순환은 생길 수 있고 비단조 재평가와 상한으로 드러난다(FRAGMENT-021, SETTLE-022). 2. **`allOf` 안의 `if`/`then`은 필수 지원이다**(FRAGMENT-021). 스키마 객체 하나에 `if`는 하나뿐이어서, 독립 조건 여럿을 쓰는 표준 관용구가 이것이다(FRAGMENT-021).

### 3.2 형상과 노드의 상태

5. **존재는 선언 위치로, 필수성은 `required`로 가른다**(FRAGMENT-026). 조각 안에서만 선언된 프로퍼티는 조건부로 존재한다(FRAGMENT-026). 기본 `properties`에 선언된 프로퍼티는 조각으로 꺼지지 않는다(FRAGMENT-026). 그것을 형상에서 빼는 것은 노드 자신의 `controls.active`(노드 게이트)와 부모 `controls.children`의 `controls.active`다(FRAGMENT-026, CONTROLS-073). `required`는 말 그대로 required다(FRAGMENT-026). 조건에 쓰는 프로퍼티는 본체 `properties`에 선언한다(GOAL-035의 축 2항(조건 프로퍼티는 `properties`에 선언한다))(FRAGMENT-026, GOAL-035). 컨벤션이며 폼은 검사하지 않는다(FRAGMENT-026, GOAL-035).

로드 때 게이트가 거짓인 노드는 생기지 않으므로 채우지 않는다(FRAGMENT-014). 거짓에서 참이 되면 노드가 **생기므로**, 그때 값이 없음이면 채움(`controls.default` > `default`)이 적용된다(FRAGMENT-014, SETTLE-005). `controls.visible`의 전환은 생성이 아니다(FRAGMENT-014). 노드 게이트도 호스트 바퀴 안에서 평가된다(FRAGMENT-014). 그래서 바퀴의 상한에 노드 게이트 수가 든다(FRAGMENT-014, SETTLE-022). 한 장치의 두 범위다(FRAGMENT-014). 조각 게이트와 노드 게이트가 다르게 동작하면 목표 G4(하나의 개념에는 하나의 장치)에 걸린다(FRAGMENT-014, GOAL-006). 노드 게이트도 게이트 가진 조각처럼 꺼진 채 출발하고 전순서 안에서 평가된다(양의 순환에서 고정점이 하나로 정해진다)(FRAGMENT-014). 전순서에서 노드 게이트는 그 노드를 선언한 조각 바로 뒤에, 같은 조각 안에서는 선언 순서로 든다(FRAGMENT-014).

노드 스키마의 `controls.active`가 거짓이면 그 노드는 **형상에 없다**(FRAGMENT-015). 원본은 기본으로 남아 노드마다 getter `inactiveValues`로 읽을 수 있고 방출에서 빠진다(원리 P4(방출은 정책이다))(FRAGMENT-015, VALUE-029, GOAL-030). 잠복 원본 열거는 루트 노드의 함수이고 노드마다 getter `inactiveValues`다(FRAGMENT-015, VALUE-029). 나감 정책이 참으로 정해진 노드는 나갈 때 한 번 비운다(FRAGMENT-015, VALUE-006). 조각이 꺼졌을 때와 같다(FRAGMENT-015).

6. **다른 서브트리를 보는 조건은 `if`를 공통 조상으로 끌어올려 표현한다 — 상속 overlay**(E12)(FRAGMENT-027). 끌어올린 조각의 `then`이 손자를 선언하면 청사진이 그 선언을 자식 호스트의 **상속 overlay**로 귀속시키되 게이트는 조상의 것이다(FRAGMENT-027). 자식의 계산 입력은 (원본, 상속 overlay 집합)이고, 부모의 바퀴가 overlay 집합을 바꾸면 자식을 **그 바퀴 안에서** 재계산한다 — 부모 게이트가 자식의 방출을 읽으므로 뒤로 미룰 수 없다(FRAGMENT-027). 같은 입력이면 재계산하지 않도록 메모한다(F5)(FRAGMENT-027, SETTLE-024). 조건의 입력이 값 밖(`@` 컨텍스트, 사용자 권한)에 있으면 서버가 원리적으로 검증할 수 없으므로 `controls`로만 쓴다(FRAGMENT-027). 비용은 TEST-032에 있다(FRAGMENT-027, TEST-032).

【추론】 예약 층에서 표준 부분이 모르는 필드를 선언하는 문법은 두지 않는다(FRAGMENT-052). 【추론】 FE 전용 조건부 필드는 소비자가 단일 스키마에 표준 `properties`로 merge하고, 노드 게이트 `controls.active`로 켜고 끈다(FRAGMENT-052). 【추론】 결과는 Q4가 그린 것과 같다(FRAGMENT-052). 【추론】 켜진 동안 방출에 든다(FRAGMENT-052). 【추론】 서버의 스키마에 없으면 서버 판정은 서버의 `additionalProperties`를 따른다(FRAGMENT-052). 【추론】 여기에 더해 FE 검증기도 그 필드를 본다(FRAGMENT-052). 【추론】 조건 표현력(목표 G2(폼의 동작은 세 층으로 나뉘고, 아래층은 위층을 모른다))은 노드 게이트로 이미 채워진다(FRAGMENT-052, GOAL-004). 【추론】 merge 안내 문서(SCHEMA-018)에 이 쓰임을 예로 더한다(FRAGMENT-052, SCHEMA-018).

6. **표준 `readOnly`는 그 노드에만 걸린다**(FRAGMENT-033). 객체 노드에 둔 `readOnly`는 자손을 잠그지 않으며 입력이 없으므로 효과가 없다(FRAGMENT-033). 표준 독자의 기대(인스턴스 전체)와 다르다(FRAGMENT-033). 배열 노드의 `readOnly`는 렌더 계층이 아이템 추가·삭제·이동 입력에 적용하며, 터미널 객체·배열은 입력이 있으므로 리프와 같다(FRAGMENT-033). 자손을 잠그려면 부모의 `controls.children`이나 조각의 `controls`를 쓰고, 폼 전체를 잠그려면 Form 속성 `readOnly`·`disabled`를 쓴다(FRAGMENT-033, CONTROLS-045). 터미널이 아닌 객체 노드의 표준 `readOnly`는 개발 모드 청사진 경고 대상이다(FRAGMENT-033, ERROR-164). 개발 모드 로그와 `onError` 경고 기록(핸들러가 있으면 모든 환경)으로 드러난다(FRAGMENT-033, ERROR-164).

### 3.3 게이트 입력과 반복 계산

게이트의 입력 `G`는 **검증기가 볼 값**이다 — 현재의 활성 집합으로 합성한 로컬에 투영(`omitEmpty`·`omitTrailing`·null)을 적용한 것(FRAGMENT-016). `if`와 `controls.active`가 같다(FRAGMENT-016). 원리 P1(판정은 검증기의 것이다)에 따라 형상과 판정이 어긋나지 않게 하는 조건이다(FRAGMENT-016, GOAL-025). `extras`(선언되지 않은 키의 값)도 그 값에 든다(FRAGMENT-016). 예외는 하나다: 호스트 자신의 원본이 객체가 아니면 `G = {}`(FRAGMENT-016). 2라운드 S8(`properties`·`required`가 `null`·`undefined`에서 공허하게 참)은 이 예외로 닫힌다(FRAGMENT-016). 빈 중첩 호스트도 자기 `{}`로 자기 게이트를 평가한다(FRAGMENT-016). 분기 안 `if`에 조건 프로퍼티의 `required`가 있으면 `{}`에서 그 분기들의 `then`은 모두 꺼진다(FRAGMENT-022의 컨벤션)(FRAGMENT-016, FRAGMENT-022). 끌어올린 게이트가 `{addr: null}`에서 참인 것은 검증기도 같으므로 계약 위반이 아니다(목표 G1(판정의 동치))(FRAGMENT-016, GOAL-003). 빈 문자열을 "있다"로 다루고 싶은 작성자는 `omitEmpty`를 끈다(FRAGMENT-016).

1. 출발점 `A := 게이트 없는 조각 ∪ 조상에서 상속된 overlay`(FRAGMENT-017). **직전 커밋의 활성 집합은 읽지 않는다** — 형상이 이력을 읽으면 같은 원본이 다른 형상이 된다(원리 P3(형상은 상태의 순수 함수다))(FRAGMENT-017, GOAL-029). 직전 커밋의 활성 집합은 생긴 노드의 판정(전이)에만 쓰고 평가 순서 힌트로 쓰지 않으며, 바퀴의 평가 순서는 청사진 전순서다(FRAGMENT-017, SETTLE-050).
2. 한 바퀴에 **모든** 게이트(조각 게이트와 노드 게이트)를 평가한다(FRAGMENT-017). 참이면 켜고 거짓이면 **끈다**(FRAGMENT-017). 한 바퀴 안의 켜짐·꺼짐은 뒤의 게이트에 즉시 반영된다(가우스-자이델, F3)(FRAGMENT-017).

`A`가 바뀌면 다시 돈다(FRAGMENT-017). 상한 = 게이트 가진 조각 수 + 노드 게이트 수 + 1(FRAGMENT-017). 넘으면 정착은 SETTLE-011의 예산 규칙을 따른다(FRAGMENT-017, SETTLE-011).

4. 지원 범위 밖은 "자기 부정 스키마"가 아니라 그 일반형이다: **게이트 의존 관계에 부정을 포함한 순환**이 있으면 고정점이 없을 수 있고, 결과는 상한에서 결정적이되 임의적이다(F3)(FRAGMENT-017). 1라운드 R6이 철회한 "순환이 없다"의 자리가 이것이다(FRAGMENT-017).
5. 직전 커밋의 활성 집합은 출발점을 바꾸지 않고, 평가 순서 힌트로 쓰지 않는다(FRAGMENT-017, SETTLE-050). 출발점 자체를 바꾸는 최적화는 채택하지 않는다(FRAGMENT-017, SETTLE-044). 비용: 정순 의존 체인은 2바퀴, 역순 N단은 N+1바퀴다(E4)(FRAGMENT-017). 이 셈은 원본이 이미 있는 계산에 한정되며, 채움으로 이어지는 체인은 링크마다 전이 라운드를 쓴다(F2, SETTLE-005)(FRAGMENT-017, SETTLE-005).

**3.6 원본으로만 지탱되는 조각과 `default`로만 지탱되는 조각은 다르다.**(FRAGMENT-046) 원본은 상태이고 `default` 주입은 사건이다(FRAGMENT-046). 그래서 TEST-061의 실험(D-15)이 S2(최소 고정점 뒤, 선언 키가 원본에 있는 꺼진 조각을 검증기 가드로 한 번 켜 봄)를 채택하더라도, "`default`만으로 자기 가드를 켜는 조각"은 켜지지 않는다(FRAGMENT-046, TEST-061). `default`는 "조각이 꺼짐에서 켜짐으로 바뀐 직후"의 사건이므로 자기 조각을 켜는 원인이 될 수 없고, 자기 지지 `default`는 상태에서 오지 않아 P3가 배제한다(FRAGMENT-046).

【추론】 조각의 `controls`에 둔 에지 규칙(`unsetValue`·`derived`·`resetInteraction`·`injectTo`)은 그 조각이 켜져 있는 동안만 후보다(FRAGMENT-050). 【추론】 (1) 나감은 이 규칙들의 에지가 아니다(FRAGMENT-050). 【추론】 조각이 꺼지는 정착에서 그 규칙은 평가하지도 발화하지도 않는다(FRAGMENT-050). 【추론】 꺼짐이 값에 닿는 장치는 나감 정책 `unsetOnInactive` 하나다(FRAGMENT-050). 【추론】 그 정책은 조각 층의 값으로, 직전 커밋의 값을 쓴다(FRAGMENT-050). 【추론】 (2) 조각이 켜지는 정착에서 그 조각이 새로 들인 노드의 규칙 에지는 거짓→참이다(WRITE-029)(FRAGMENT-050, WRITE-029). 【추론】 그래서 `unsetValue`·`resetInteraction`은 식이 참이면 발화하고, `derived`·`injectTo`는 발화한다(FRAGMENT-050). 【추론】 형상에 남아 있던 공유 노드는 그 규칙의 기준점만 그 정착의 값으로 잡고 발화하지 않는다(CONTROLS-026, VALUE-025)(FRAGMENT-050, CONTROLS-026, VALUE-025). 【추론】 (3) 후보 여부는 그 라운드의 완성된 트리에서 조각이 켜져 있는지로 정한다(FRAGMENT-050). 【추론】 앞 라운드에 적용된 파생 쓰기는 뒤 라운드에서 조각이 꺼져도 되돌리지 않는다(FRAGMENT-050). 【추론】 철회는 채움만 한다(FRAGMENT-050). 【추론】 (4) 조각의 `controls.default`는 에지 규칙이 아니라 채움이며, 노드가 생길 때만 쓴다(FRAGMENT-050).

7. **양방향 주입은 식이 `undefined`를 돌려주어 멈춘다.**(FRAGMENT-034) 섭씨↔화씨처럼 왕복이 정확하지 않은 `controls.injectTo` 쌍은 순환이다(FRAGMENT-034). 폼은 오늘의 자동 차단을 두지 않고 예산으로 잡으므로, 작성자는 대상이 이미 같은 값이면 `undefined`를 돌려준다(`undefined`면 쓰지 않는다, CONTROLS-079)(FRAGMENT-034, CONTROLS-079).

### 3.4 읽지 않는 검증 문법과 오류

원리 P1′(폼이 스키마에서 읽는 것은 노드 트리의 모양을 정하는 문법뿐)에 따라 `properties: { x: false }`, `not: { required: [...] }`, `additionalProperties: false`는 값의 유효성을 정하는 문법이므로 **폼이 읽지 않는다**(FRAGMENT-019, GOAL-026). `false`는 아무것도 선언하지 않으므로 "x라는 자식이 존재한다"는 선언도, 값을 빼는 명령도 아니다(FRAGMENT-019). 분기 컨벤션의 `else: false`도 같다(FRAGMENT-019). 그 `else` 조각은 아무 노드도 선언하지 않는다(FRAGMENT-019).

(FRAGMENT-019)

| 상황 | 폼의 동작 |
| ---- | -------- |
| x가 본체(`properties`)에 선언돼 있다 | 보통 필드로 보이고 검증기의 에러가 붙는다 |
| x가 본체에 없다 | 입력 노드가 없는 **잔여 키**다 (아래) |
| 작성자가 숨기려 한다 | `controls.active`를 쓴다 (CONTROLS-021) |

2라운드 S5(금지 조각의 순환 — `if required a → properties a: false`에 고정점이 없다)는 읽지 않으므로 사라진다(FRAGMENT-019). 3라운드 D-3의 (i)("비활성화와 같다")도 폐기된다 — BE가 거부하려던 값을 폼이 조용히 지우는 것은 원리 P2(원본은 호출자와 작성자만 쓴다) 위반이다(FRAGMENT-019, GOAL-028).

**잔여 키의 표시는 검증기 플러그인의 계약이다**(C-4)(FRAGMENT-020). 정규화된 에러에 선택 필드 `rejectedKey?: string`을 두고 플러그인이 채운다(FRAGMENT-020). core는 `rejectedKey`가 있는 호스트 에러만 모으므로 형상 규칙을 갖지 않는다(FRAGMENT-020).

(FRAGMENT-020)

| 기각 형태 | 누가 키를 대는가 |
| -------- | --------------- |
| `false` 스키마 (`properties`·`patternProperties`·분기 안) | 에러만으로 — `instancePath`가 곧 키 |
| `additionalProperties`·`unevaluatedProperties`·`propertyNames` | 에러만으로 — `params` |
| 단일 이름 `not: { required: ['x'] }` | 플러그인이 자기 스키마를 읽는다 |
| 두 이름 이상의 `not: { required: [...] }` | 아무도 못 댄다 — 호스트 에러로 남는다(F8) |

【추론】 폼은 `dependentSchemas`·`dependentRequired`·`dependencies`를 게이트·조각 모델로 옮기지 않고 읽지 않는다(FRAGMENT-047). 【추론】 셋은 검증기에 그대로 간다(FRAGMENT-047). 【추론】 그 안에만 선언된 프로퍼티는 노드가 되지 않고, 값이 오면 `extras`로 남는다(FRAGMENT-047). 【추론】 조건부 필드를 보이려는 작성자는 `allOf: [{ "if": { "required": ["k"] }, "then": S }]`로 적는다(FRAGMENT-022의 분기 관행)(FRAGMENT-047, FRAGMENT-022). 【추론】 두 철자 규칙(C5(지원 방언의 범위))에서 `dependencies`·`dependentSchemas` 쌍은 들지 않는다(FRAGMENT-047, GOAL-018).

ㄷ `contains`(`minContains`·`maxContains` 포함)는 폼이 읽지 않는다(FRAGMENT-051). 이 키는 값의 유효성 문법이므로 검증기가 판정한다(FRAGMENT-051). `if` 안의 `contains`는 `compileGuard`가 답하는 게이트일 뿐이다(FRAGMENT-051). 그 비용은 BLUEPRINT-007의 "컬렉션을 훑는 게이트"로 벤치가 다룬다(FRAGMENT-051, BLUEPRINT-007).

【추론】 루트의 정규 `dataPath`는 `''`다(RFC 6901)(FRAGMENT-053). 【추론】 core는 검증 결과를 받아들이는 자리에서 `'/'`를 루트의 별칭으로 받아 `''`로 정규화한 뒤 `ValidationIssue.dataPath`에 담는다(FRAGMENT-053). 【추론】 잔여 목록은 정규화된 값에 키를 이어 포인터를 만든다(FRAGMENT-053). 【추론】 저장소의 ajv 플러그인 셋과 core의 폴백 검증기(`src/core/nodes/AbstractNode/utils/ValidationManager/utils/getFallbackValidator.ts:19`)는 PR-4(동기 `compileGuard`를 구현하는 그 PR)에서 함께 루트에 `''`를 내도록 고친다(FRAGMENT-053).

### 3.5 분기와 판별의 원리

`oneOf`/`anyOf`는 형상 선언이 아니라 진짜 검증 조건이다(GOAL-046의 읽기 1)(FRAGMENT-004, GOAL-046). 분기의 필드는 노드의 `controls.active`·`controls.visible`이나 부모의 자식 집합 제어로 다루고, JSON만으로 다루려면 분기 안에 `if/then/else`를 넣는다(FRAGMENT-004). 순수한 `oneOf`·`anyOf`도 허용하되 그때는 작성자가 `controls`로 제어할 책임을 진다(FRAGMENT-004).

4차의 **선택 가드**(`selection === i`)는 없다(FRAGMENT-010). 폼이 분기를 고르지 않으므로 상태 칸 `selection`, `setSelectedBranch`, 초기 분기 추론이 함께 사라졌다(FRAGMENT-010). 상태는 원본과 `extras` 둘뿐이다(FRAGMENT-010, VALUE-002).

4. **선언 문맥은 형상을 고르지 않는다.**(FRAGMENT-025) 연언은 "전부 적용"이어서 형상이 결정된다(FRAGMENT-025). 게이트 없는 분기는 존재만 더하므로 분기의 필드가 모두 노드로 있다(FRAGMENT-025). 분기의 형상을 좁히는 것은 게이트 둘뿐이다 — 분기 안의 `if`와 조각 객체의 `controls.active`(작성자가 적었거나 `controls.discriminator`가 적어 준 것)(FRAGMENT-025). 둘 다 없으면 작성자가 `controls`로 제어할 책임을 진다(읽기 1)(FRAGMENT-025).

폼에는 분기를 고르는 상태도 API도 UI도 없다(FRAGMENT-028). 사용자가 분기를 고르게 하려면 작성자가 판별 프로퍼티(예: `kind`)를 본체 `properties`에 선언하고, 분기가 그 값을 `if`(분기 안의 `if/then/else`)나 `controls.active`(또는 `controls.discriminator`)로 읽게 한다(FRAGMENT-028). 사용자의 선택은 그 프로퍼티에 대한 보통의 입력이다(FRAGMENT-028). 판정은 `validator(작성된 스키마, 방출 값)`으로 고정되어 있다(FRAGMENT-028, VALIDATE-001). 사용자가 채운 값이 두 분기에 맞아 검증기가 "2개 매치"라고 하면 폼은 그 에러를 객체 노드 수준에 그대로 보인다(FRAGMENT-028). 그것은 스키마 작성자의 문제다(FRAGMENT-028).

**기록.**(FRAGMENT-029)

- 조각이 `properties` 밖에서 새 노드를 선언할 수 있다(FRAGMENT-029). 소유자: "then / else에서 신규 노드를 선언할 수 있어. object 노드를 기준으로 한다면 properties 외에도 노드가 있을 수 있는거지."(FRAGMENT-029)
- 비판별 분기의 수동 선택이 필요하다(FRAGMENT-029). 소유자: "분기를 수동으로 고르는 기능이 아예 없는 건 애매하다. 서버에서는 oneOf anyOf를 실제로 많이 쓴다."(FRAGMENT-029) **이 발언은 읽기 1(2026-09-23)이 대체했다.**(FRAGMENT-029) 폼은 분기를 고르지 않는다(FRAGMENT-029). 수동 선택은 작성자가 `properties`에 선언한 판별 프로퍼티로 표현하고 분기가 그 값을 `if`나 `controls.active`로 읽는다(FRAGMENT-028의 "수동 선택")(FRAGMENT-029, FRAGMENT-028).
- 폼은 `oneOf`·`anyOf`로 분기를 고르지 않는다(FRAGMENT-029). 소유자(A-3): "분기를 고르지 않으나, if-then-else 문법은 예외적으로 분기를 결정하는 것에 쓰인다. … 즉, &를 제외하고 schema 만으로 form 을 제어하는 방법이 if-then-else 인 것이다."(FRAGMENT-029)
- `controls.discriminator`는 예외적 허용이다(FRAGMENT-029). 소유자(22): "동의합니다. 이 경우에 대한 예외적 허용을 하죠. … 우리는 "&active": 을 더하는거지 스키마를 수정하는건 아니니까"(FRAGMENT-029).
- 노드 게이트와 조각 게이트는 한 장치다(FRAGMENT-029). 소유자(A-2): "기존과 달리 의미를 통일했으니 이렇게 해도 무방하다. 단, 이는 검증과 무관하므로, 잘못된 스키마에 대한 책임은 사용자에게 있고, form은 고지 의무만 진다."(FRAGMENT-029)
- 분기 컨벤션의 `required`를 폼이 검사하지 않는다(FRAGMENT-029). 소유자(23): "이건 우리가 참견할 문제는 아닙니다. 평가하지 않습니다."(FRAGMENT-029) 소유자(19): "if 문 내에 anyOf 나 oneOf, 아니면 다른 또 복잡한 스키마가 올 수도 있는거라 우리는 그걸 관여하기로 하면 끝이 없을거에요"(FRAGMENT-029).
- 게이트는 동기로 평가하고 방출 값을 본다(FRAGMENT-029). 소유자: "가드는 동기로 해도 될 것 같다." / "가드는 방출 값을 보는 게 맞다."(FRAGMENT-029)
- 스키마 선언의 책임은 작성자에게 있다(FRAGMENT-029). 소유자: "JSON Schema 스펙을 잘 따르는 구현체를 쓰면 되는 거고, 실제 스키마 선언 책임은 사용자에게 있다."(FRAGMENT-029)
- 조각이 꺼지면 방출 값에서 빠지고 노드의 원본은 기본으로 남는다(VALUE-025)(FRAGMENT-029, VALUE-025). 소유자(13라운드): "onChange 로 넘어가는 값(방출 표현값)에서 지워지는게 기본값이면 된다."(FRAGMENT-029) 원본까지 지우는 것은 나감 정책 키를 켤 때다(FRAGMENT-029).
- 폼이 읽는 것은 형상 문법뿐이다 — GOAL-026 "합의 근거"의 원문(2026-09-23)(FRAGMENT-029, GOAL-026).

**`controls.discriminator`는 명시해야 동작한다.**(FRAGMENT-006) 명시 없는 `oneOf`·`anyOf`는 모든 분기가 켜진다(GOAL-027의 P1′ 분기 문장)(FRAGMENT-006, GOAL-027). 오늘의 `const`·`enum` 자동 감지는 사라진다(소유자 12라운드 수용)(FRAGMENT-006). 그런 스키마는 `controls.discriminator`를 더하거나 분기 안에 `if/then/else: false`를 쓴다(FRAGMENT-006).

### 3.6 명시 판별자의 변환

작성자가 union 호스트에 예약 층 키 `controls.discriminator`를 적으면, 청사진이 각 분기에서 그 키의 `const`·`enum`을 읽어 그 분기를 `controls: { active: "./<key> === <value>" }`를 가진 조각 객체처럼 다룬다(`enum`이면 값이 그 목록에 드는가)(FRAGMENT-008). 변환된 분기는 FRAGMENT-001의 표 3행이 된다(FRAGMENT-008, FRAGMENT-001). **분기 스키마는 손대지 않는다.**(FRAGMENT-008) `kind: { const }`와 `required`는 그대로 검증기에 간다(FRAGMENT-008, SCHEMA-006). 소유자: "우리는 "&active": 을 더하는거지 스키마를 수정하는건 아니니까"(FRAGMENT-008). 변환은 청사진 단계에서 끝난다(FRAGMENT-008). 상태 칸과 작업 루프를 바꾸지 않는다(FRAGMENT-008, BLUEPRINT-017). 판별 프로퍼티는 작성자가 본체 `properties`에 선언한다(GOAL-035의 축 2항(조건 프로퍼티는 `properties`에 선언한다), 컨벤션)(FRAGMENT-008, GOAL-035). 폼이 소유하지 않는다(FRAGMENT-008). 암묵 default는 없다(FRAGMENT-008). 채움의 원천은 `controls.default` > `default` > 없음뿐이다(WRITE-090)(FRAGMENT-008, WRITE-090). 값이 비어 있으면 `===` 비교가 모두 거짓이므로 어느 분기도 켜지지 않는다(FRAGMENT-008).

【추론】 분기에서 판별 키의 `const`·`enum`을 찾는 범위는 그 분기의 정적 연언이다(FRAGMENT-048). 【추론】 곧 분기 본체, 게이트 없는 `allOf` 항목, 그리고 이것들이 `$ref`로 가리키는 대상이다(재귀, BLUEPRINT-030의 순환 절단을 따름)(FRAGMENT-048, BLUEPRINT-030). 【추론】 그 키 프로퍼티 스키마도 같은 정적 연언(자기 `$ref`, 게이트 없는 `allOf`)에서 모은다(FRAGMENT-048). 【추론】 `if/then`, 게이트 가진 `allOf` 항목, 중첩 `oneOf`·`anyOf`는 보지 않는다(FRAGMENT-048). 【추론】 한 분기에서 모은 `const`·`enum`은 정적 연언의 교차로 합친다(FRAGMENT-048). 【추론】 교차가 공집합이면 정적 연언의 청사진 오류다(FRAGMENT-048). 【추론】 끌어올림(O-1)도 이렇게 모은 선언을 쓴다(FRAGMENT-048). 【추론】 null 분기(`isNullBranch`)는 노드의 nullable 플래그이므로 판별 대상 분기로 세지 않는다(FRAGMENT-048). 【추론】 null 분기에 판별 키가 없는 것은 키 없음도 오류도 아니다(FRAGMENT-048). 【추론】 분기가 자기 `controls.active`도 가지면 그 분기의 게이트는 `(변환식) && (분기 식)` 하나다(FRAGMENT-048). 【추론】 판별 키가 없는 분기가 자기 `controls.active`를 가지면 그 식만이 게이트다(FRAGMENT-048). 【추론】 한 분기의 정적 연언 안에서 판별 키의 `const`·`enum` 교차가 공집합이면 오류 코드는 ERROR-164의 정적 연언 행(`EMPTY_ENUM_INTERSECTION`)이며 `DISCRIMINATOR_MISMATCH`가 아니다(FRAGMENT-048).

그 키의 분기 선언을 게이트 없는 선언으로도 취급해 끌어올린다(14라운드 답 O-1: 태그 키가 분기 안에만 있는 생성기 스키마도 그대로 받는다)(FRAGMENT-007). 있는 분기끼리 종류가 다르거나 `const`·`enum` 값이 겹치면 청사진 오류다(FRAGMENT-007). 일부 분기에만 없는 것은 그 분기가 게이트 없음일 뿐이다(FRAGMENT-007). 소유자(14라운드 O-1): "가 로 하죠. 다만, discriminator 를 서로 다르게 선언했거나 discriminator 이 분기마다 다른 타입이나 성질을 가지면 오류로 알려줘야 합니다."(FRAGMENT-007) `controls.discriminator`의 키가 어느 분기에도 `const`·`enum`으로 없거나, 있는 분기끼리 종류가 다르거나 값이 겹침(O-1. 일부 분기에만 없는 것은 그 분기가 게이트 없음일 뿐 오류가 아니다)(FRAGMENT-007). 청사진 분석: `controls.discriminator` 키가 어느 분기에도 없거나, 분기끼리 종류가 다르거나 값이 겹치거나, 선언 사이 값이 다름(FRAGMENT-007). 한 분기의 정적 연언에 판별 선언이 여럿이면 그 교차가 공집합일 때만 청사진 오류이고, 겹치면 교차를 쓴다(FRAGMENT-007, FRAGMENT-048).

【추론】 판별 키가 union이어도 FRAGMENT-007의 분기 규칙은 그대로다(BLUEPRINT-017)(FRAGMENT-007, FRAGMENT-055, BLUEPRINT-017). 【추론】 분기의 `const`·`enum` 리터럴의 JSON 종류가 판별 키의 목록(`schemaType`, 원소 하나인 경우 포함)과 nullable 어디에도 없으면, 청사진이 개발 모드 경고 `(가칭) SCHEMA_FORM_WARNING.DISCRIMINATOR_BRANCH_UNREACHABLE`을 낸다(FRAGMENT-007, FRAGMENT-055).

### 3.7 분기 게이트와 작성 관행

폼은 `oneOf`·`anyOf`·`if`의 **내용**을 읽지 않는다(GOAL-026의 P1′, 축 1항(폼은 JSON Schema 문법을 해석하지 않는다))(FRAGMENT-030, GOAL-026, GOAL-034). 분기가 뜻대로 켜지고 검증기가 뜻대로 가르려면 작성자가 아래 약속을 지켜야 한다(FRAGMENT-030). 폼은 이 약속을 검사하지 않고(소유자 답 23: "이건 우리가 참견할 문제는 아닙니다"), 키의 유무와 게이트의 결과만으로 아는 것을 개발 모드에서 경고한다(ERROR-159의 닫힌 목록)(FRAGMENT-030, ERROR-159). 잘못된 스키마의 책임은 작성자에게 있고 폼은 고지 의무만 진다(소유자 답 2)(FRAGMENT-030). 기본 출력(개발 모드 로그)은 프로덕션에서 침묵한다(경고는 결과를 바꾸지 않으므로 침묵해도 계약이 깨지지 않는다)(FRAGMENT-030). `onError` 핸들러는 모든 환경에서 경고 기록을 받는다(ERROR-021)(FRAGMENT-030, ERROR-021). 컨벤션을 어긴 양의 순환 스키마에는 A-2의 고지 의무를 적용하지 않는다(답 19가 이긴다)(FRAGMENT-030, TEST-061).

게이트 가진 분기는 `controls.active`를 가진 분기(`controls.discriminator`로 변환된 분기 포함)이거나, 분기에 `else: false`인 `if`가 있어(키 유무로 판정, 형제 키가 있어도 같다) `if`가 분기 전체를 켜고 끄는 분기다(FRAGMENT-013). 경고는 이 분기만 센다(FRAGMENT-013).

3. **분기 컨벤션: `oneOf`·`anyOf`의 분기에 `if`를 쓸 때는 `else: false`와 `if`의 `required: [조건 프로퍼티]`가 함께 필수다.**(FRAGMENT-022) ajv 8.17.1의 실측이다(draft-07과 2020-12 판정 동일, TEST-059)(FRAGMENT-022, TEST-059). 각 분기의 `if`는 `{ properties: { kind: { const } }, required: ['kind'] }`다(FRAGMENT-022).

(FRAGMENT-022)

| 배치 | 올바른 값 `{kind:'a', x:'s'}` | 누락 값 `{kind:'a'}` | 어느 조건에도 맞지 않는 값 `{kind:'c'}` | 조건 프로퍼티 없음 `{x:'s'}` |
| --- | --- | --- | --- | --- |
| `oneOf` 분기에 `if/then`만 | 거부 | 통과 | 거부 | 거부 |
| `oneOf` 분기에 `if/then` + `else: false` | 통과 | 거부 | 거부 | 거부 |
| `anyOf` 분기에 `if/then`만 | 통과 | 통과 | 통과 | 통과 |
| `anyOf` 분기에 `if/then` + `else: false` | 통과 | 거부 | 거부 | 거부 |

`else: false`가 없으면 `if`가 거짓인 분기가 공허하게 통과해 분기로 세어진다(FRAGMENT-022). 그래서 `oneOf`는 올바른 값을 거부하고 `anyOf`는 모든 값을 통과시킨다(FRAGMENT-022). `if`에서 `required`를 빼면 `else: false`를 붙여도 `{x:'s'}`가 통과하고, 빈 값에서 모든 `if`가 참이 되어 폼이 모든 분기의 `then`을 켠다(FRAGMENT-022). `allOf` 항목과 최상위 `if/then`은 `else` 없이 되지만 어느 조건에도 맞지 않는 값을 거르지 못한다(FRAGMENT-022). 그 제약이 필요하면 작성자가 `enum`이나 `oneOf` + `else: false`를 쓴다(FRAGMENT-022). 이것은 검증기의 뜻이지 폼의 일이 아니다(FRAGMENT-022). `else: false`가 없으면 `if`가 거짓인 분기가 공허하게 통과해 검증기가 두 분기를 모두 세고(ajv 8.17.1 실측), 폼에서는 그 분기가 "게이트 가진 분기"가 아니게 되어 분기의 형제 선언은 늘 켜지고 `then`은 `if`로 켜지고 꺼진다(FRAGMENT-022, TEST-059).

누락은 개발 모드 경고 대상이다(소유자 12라운드 확인: 둔다, ERROR-159)(FRAGMENT-024, ERROR-159). 개발 모드 로그(FRAGMENT-024). `onError` 경고 기록(핸들러가 있으면 모든 환경)(FRAGMENT-024).

**폼은 `if`의 `required`와 축 2항(조건 프로퍼티는 `properties`에 선언한다)을 검사하지 않는다.**(FRAGMENT-023) 폼은 `if`의 내용에 관여하지 않는다(축 1항(폼은 JSON Schema 문법을 해석하지 않는다), FRAGMENT-023, GOAL-034). 소유자: "이건 우리가 참견할 문제는 아닙니다. 평가하지 않습니다."(FRAGMENT-023).

3. **`controls.active`(또는 `controls.discriminator`)만으로 게이트를 단 분기에도 판별 키의 `const`(또는 `enum`)와 `required`를 둔다.**(FRAGMENT-031) `controls.active`는 검증기에게 보이지 않으므로, 이것이 없으면 검증기는 여러 분기를 함께 통과시켜 `oneOf`를 기각한다(ajv 8 실행 확인: `passingSchemas [0,1]`)(FRAGMENT-031). 생성기 스키마(pydantic, zod, OpenAPI, TypeBox)는 이 둘을 갖고 나온다(FRAGMENT-031). 손으로 쓰는 스키마는 작성자가 적는다(FRAGMENT-031).

축 2항(조건 프로퍼티는 `properties`에 선언한다)에 따라 **조건 프로퍼티는 호스트에 선언하는 것이 좋다**(FRAGMENT-032, GOAL-035). 분기 안에서만 선언되면 모든 분기가 꺼졌을 때 게이트가 그 값을 볼 수 없으므로(잠복 원본), 호스트에 선언해야 입력란이 분기와 무관하게 보인다(FRAGMENT-032). 폼은 검사하지 않는다(소유자 답 19)(FRAGMENT-032). 분기 안에서만 선언된 판별 키는 모든 분기가 꺼지면 잠복 원본이라 게이트가 볼 수 없다(VALUE-002·FRAGMENT-016, 14라운드)(FRAGMENT-032, VALUE-002, FRAGMENT-016).

【추론】 키워드 순위를 본체 `properties` < `allOf` 항목 < `if/then/else` < `oneOf` 분기 < `anyOf` 분기로 가른다(FRAGMENT-049). 【추론】 같은 호스트에서 `oneOf[i]`는 모든 `anyOf[j]`보다 앞이다(FRAGMENT-049). 【추론】 주석 키의 나중 승, 같은 대상 규칙의 같은 층 동점, 공유 충돌의 '앞선 종류', 터미널 전략의 '나중 것', 호스트 바퀴의 평가 순서가 모두 이 순서를 쓴다(FRAGMENT-049). 【추론】 JSON 키 순서는 여전히 쓰지 않는다(FRAGMENT-049).

### 3.8 분기의 동시 활성과 값 보존

같은 `oneOf`에서 게이트를 가진 분기가 둘 이상 동시에 켜지는 것을 폼은 막지 않는다(FRAGMENT-012). 켜진 분기의 제약은 모두 연언으로 적용되고, 개발 모드에서 경고한다(FRAGMENT-012). 경고의 드러남은 ERROR-001과 ERROR-159가 정한다(FRAGMENT-012, ERROR-001, ERROR-159). 기본 출력(개발 모드 로그)은 프로덕션에서 침묵한다(경고는 결과를 바꾸지 않으므로 침묵해도 계약이 깨지지 않는다)(FRAGMENT-012, ERROR-001, ERROR-159). `onError` 핸들러가 있으면 모든 환경에서 경고 기록을 받는다(FRAGMENT-012, ERROR-001, ERROR-159). 게이트의 결과만 세고 분기의 내용은 읽지 않으므로 축 1항(폼은 JSON Schema 문법을 해석하지 않는다) 안이다(소유자 답 20)(FRAGMENT-012, GOAL-034). `onError` 경고 기록은 핸들러가 없는 프로덕션에서는 판정하지 않는다(FRAGMENT-012).

분기가 꺼질 때 이전 분기의 값(FRAGMENT-035). 닫혔다(FRAGMENT-035). 원리 P4(방출은 정책이다)에 따라 기본은 원본을 두고 방출에서 뺀다(FRAGMENT-035, GOAL-030). 비움은 나감 정책 키(`unsetOnInactive`)로 켜며, 노드 > `controls.children`의 `controls` > 조각의 `controls` > Form 속성 순으로 세부가 포괄을 덮는다(FRAGMENT-035, CONTROLS-040).

ㄴ 다시 켜진 노드의 값은 꺼지기 전의 원본이다(VALUE-025)(FRAGMENT-054, VALUE-025). #338의 "null로 버린 데이터는 되살아나지 않는다"와 부딪히지 않는다(FRAGMENT-054). `setValue(null)`은 키 없는 전체 교체라 자식 원본을 없음으로 만들고, 숨겨 둔 원본이 없기 때문이다(VALUE-036·WRITE-092)(FRAGMENT-054, VALUE-036, WRITE-092). 초기값을 되살리는 연산은 `FormHandle.reset`(커밋된 prop의 로드, WRITE-044)과 `resetSubtree`가 맡는다(FRAGMENT-054, WRITE-044). `resetSubtree`는 유지하며, 루트가 든 로드 스냅숏에서 그 경로의 값을 서브트리에 로드한다(WRITE-085)(FRAGMENT-054, WRITE-085). ㄷ 공유 노드의 서로소 `enum`에서 값은 그대로 남는다(FRAGMENT-054). 새 조각이 켜져도 공유 노드는 새로 생기지 않으므로 다시 채우지 않는다(FRAGMENT-054). 검증기가 기각하고, 폼은 막지 않는다(FRAGMENT-054). 비우고 싶은 작성자는 조각 범위 `controls.unsetValue`(CONTROLS-077)를 쓰거나 이름을 가른다(FRAGMENT-054, CONTROLS-077).
