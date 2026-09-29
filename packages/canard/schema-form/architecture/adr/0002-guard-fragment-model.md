# ADR 0002 — 조건부 장치를 "가드 → 조각" 단일 모델로 통합

## 상태

| 항목 | 닫은 사람 | 라운드 |
| --- | --- | --- |
| BLUEPRINT-017 | 소유자 답(`reviews/round-10-owner-answers.md:11` B-22), 소유자 답(`reviews/round-12-owner-answers.md:9` 2 `&discriminator`), 소유자 답(`reviews/round-9-spec.md:20` 축2; 판별 프로퍼티는 본체), 소유자 답(`reviews/round-15-decisions.md:13` 5; `controls` 그룹 표기), 소유자 답(`reviews/round-15-decisions.md:9` 1; 식의 기준점 `./`) | 15 |
| FRAGMENT-001 | 소유자 답(`reviews/round-10-owner-answers.md:9` A-3), 편집자 결정(10라운드, `07-conclusions.md:143` 조각 표가 ADR 0002 표를 대체), 소유자 답(`reviews/round-9-spec.md:108` 자식 집합 제어, 조각 단위 제어) | 10 |
| FRAGMENT-002 | 편집자 결정(10라운드 5차 본문, `adr/0002-guard-fragment-model.md:5`) | 10 |
| FRAGMENT-003 | 편집자 결정(ADR 0002 첫 판 `ab41d790d`, `adr/0002-guard-fragment-model.md:18` 소유자의 방향을 옮긴 편집자 기록, 소유자 원문 없음) | ADR 0002 첫 판(1라운드 전) |
| FRAGMENT-004 | 소유자 답(`reviews/round-9-spec.md:42` 읽기1), 소유자 답(`reviews/round-9-spec.md:44` 읽기1(이어서)) | 9 |
| FRAGMENT-006 | 소유자 답(`reviews/round-12-owner-answers.md:9` 2 &discriminator) | 12 |
| FRAGMENT-008 | 소유자 답(`reviews/round-10-owner-answers.md:11` B-22), 소유자 답(`reviews/round-9-spec.md:20` 축2) | 10 |
| FRAGMENT-009 | 소유자 답(`reviews/round-9-spec.md:19` 축1), 편집자 결정(10라운드 5차 본문, `adr/0002-guard-fragment-model.md:14`) | 10 |
| FRAGMENT-010 | 소유자 답(`reviews/round-10-owner-answers.md:9` A-3), 편집자 결정(10라운드, `07-conclusions.md:142`) | 10 |
| FRAGMENT-011 | 편집자 결정(4차 본문 E3, `adr/0002-guard-fragment-model.md:13`), 편집자 결정(10라운드, `07-conclusions.md:143` 전순서 정의) | 10 |
| FRAGMENT-012 | 소유자 답(`reviews/round-10-owner-answers.md:17` C-20) | 10 |
| FRAGMENT-013 | 편집자 결정(12라운드, `reviews/round-12-owner-review.md:258`) | 12 |
| FRAGMENT-014 | 소유자 답(`reviews/round-10-owner-answers.md:8` A-2), 소유자 답(`reviews/round-10-owner-answers.md:14` C-10), 소유자 답(`reviews/round-10-owner-answers.md:7` A-1) | 10 |
| FRAGMENT-015 | 소유자 답(`reviews/round-10-owner-answers.md:8` A-2), 소유자 답(`reviews/round-13-owner-answers.md:8` 2 나감 비움 기본값) | 13 |
| FRAGMENT-016 | 소유자 답(`reviews/round-1.md:177` 가드는 어떤 값을 보는가), 편집자 결정(4차 본문 E5, `adr/0002-guard-fragment-model.md:13`) | 5 |
| FRAGMENT-017 | 원리(`reviews/round-5-derivations.md:41` D-2 도출, `03-mental-model.md:162` 도출표), 편집자 결정(10라운드, `07-conclusions.md:132` 상한에 노드 게이트 수) | 10 |
| FRAGMENT-019 | 원리(`reviews/round-5-derivations.md:28-34` D-3 도출, `03-mental-model.md:150` 도출표) | 5 |
| FRAGMENT-020 | 편집자 결정(4차 본문 C-4, `adr/0002-guard-fragment-model.md:13`; 반론 `reviews/round-5-decisions.md:236`) | 5 |
| FRAGMENT-021 | 편집자 결정(4차 본문, `adr/0002-guard-fragment-model.md:13`), 소유자 답(`reviews/round-9-spec.md:23` 축5) | 9 |
| FRAGMENT-022 | 소유자 답(`reviews/round-10-owner-answers.md:9` A-3), 소유자 답(`reviews/round-10-owner-answers.md:38` E-23) | 10 |
| FRAGMENT-023 | 소유자 답(`reviews/round-10-owner-answers.md:38` E-23), 소유자 답(`reviews/round-10-owner-answers.md:40` E-19) | 10 |
| FRAGMENT-024 | 소유자 답(`reviews/round-12-owner-answers.md:14` 6 else: false 경고) | 12 |
| FRAGMENT-025 | 소유자 답(`reviews/round-9-spec.md:44` 읽기1(이어서)), 소유자 답(`reviews/round-10-owner-answers.md:9` A-3) | 10 |
| FRAGMENT-026 | 소유자 답(`reviews/round-9-spec.md:20` 축2), 소유자 답(`reviews/round-9-spec.md:21` 축3) | 10 |
| FRAGMENT-027 | 편집자 결정(4차 본문 E12, `adr/0002-guard-fragment-model.md:13`) | 5 |
| FRAGMENT-028 | 소유자 답(`reviews/round-9-spec.md:44` 읽기1(이어서)), 소유자 답(`reviews/round-10-owner-answers.md:9` A-3) | 10 |
| FRAGMENT-029 | 소유자 답(`reviews/round-10-owner-answers.md:8,9,11,38,40` A-2·A-3·B-22·E-23·E-19), 소유자 답(`reviews/round-13-owner-answers.md:8` 2 나감 비움 기본값), 소유자 답(`reviews/round-1.md:177` 가드는 방출 값) | 13 |
| FRAGMENT-032 | 소유자 답(`reviews/round-9-spec.md:20` 축2), 소유자 답(`reviews/round-10-owner-answers.md:40` E-19), 편집자 결정(14라운드, `adr/0002-guard-fragment-model.md:105` 잠복 원본) | 14 |
| FRAGMENT-035 | 소유자 답(`reviews/round-13-owner-answers.md:8` 2 나감 비움 기본값), 소유자 답(`reviews/round-13-owner-answers.md:17` 나감 정책 키 이름), 원리(`reviews/round-10-owner-answers.md:20` D-7 세부 규칙이 포괄 규칙을 덮는 관례, `03-mental-model.md:131`), 편집자 결정(13라운드, `reviews/round-13-owner-review.md:66` 네 층의 순서), 소유자 답(`reviews/round-13-owner-answers.md:16` Form 속성의 자리) | 13 |
| REACT-026 | 편집자 결정(5라운드 도출, `reviews/round-5-derivations.md:34`), 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-77) | 18 |
| SETTLE-018 | 편집자 결정(3–5라운드 반영 4차 본문, `adr/0007-settle-cycle.md:12`), 소유자 답(`reviews/round-10-owner-answers.md:8` A-2, 노드 게이트), 편집자 결정(14라운드 F-12 (b), 노드 게이트의 출발 상태, `reviews/round-14-values-check.md:76`) | 14 |
| SETTLE-020 | 편집자 결정(3–5라운드 반영 4차 본문, `adr/0007-settle-cycle.md:12`), 소유자 답(`reviews/round-10-owner-answers.md:8` A-2, 노드 게이트) | 10 |
| SETTLE-022 | 편집자 결정(3–5라운드 반영 4차 본문, `adr/0007-settle-cycle.md:12`), 편집자 결정(10라운드, 상한에 노드 게이트 수를 더함, `07-conclusions.md:115` 4.23) | 10 |
| SETTLE-023 | 소유자 답(`reviews/round-17-owner-answers.md:9` R17-1), 편집자 결정(7–8라운드 수렴 D-31, `06-conclusions.md:196`) | 17 |
| SETTLE-026 | 원리(D-2, `reviews/round-5-derivations.md:41`), 편집자 결정(7–8라운드 수렴 D-24–D-26, `06-conclusions.md:231,236,240`), 편집자 결정(10라운드, 4.15–4.21 그대로, `07-conclusions.md:100`), 편집자 결정(17라운드, 관측 이름 `degraded`, ADR 0014 4판 채택, `adr/0014-error-policy.md:201`) | 17 |
| VALIDATE-016 | 소유자 답(`adr/0004-validator-plugin-compile-guard.md:55` 가드는 동기 전용) | 1 |
| VALUE-006 | 원리(`03-mental-model.md:72` P4), 소유자 답(`reviews/round-13-owner-answers.md:8` 2 나감 비움 기본값), 소유자 답(`reviews/round-13-owner-answers.md:17` 나감 정책 키 이름), 소유자 답(`reviews/round-17-owner-answers.md:10` R17-2, 보충의 하위 트리 문장), 소유자 답(`reviews/round-13-owner-answers.md:16` Form 속성의 자리) | 17 |

## 결정

### 01-schema-to-blueprint.md §2.4 명시 판별

GOAL-034의 축 1항("`enum`·`const` 판별식은 쓰지 않는다")의 유일한 예외다(BLUEPRINT-017, GOAL-034). 근거는 축 1항(폼은 JSON Schema 문법을 해석하지 않는다)의 예외(소유자 동의, 10라운드)와 축 7항(JSON Schema 표현은 `controls` 표현으로 대체할 수 있어야 한다)이다(BLUEPRINT-017, GOAL-034, GOAL-040).

**선언.**(BLUEPRINT-017) 작성자가 variant 호스트(`oneOf`·`anyOf`를 가진 객체 스키마)에 예약 층 키 `controls: { discriminator: '<key>' }`를 적는다(BLUEPRINT-017, BLUEPRINT-035). 적지 않은 variant 호스트의 `const`·`enum`은 읽지 않는다(BLUEPRINT-017, BLUEPRINT-035). OpenAPI의 `discriminator.propertyName`도 예약 층의 키가 아니므로 읽지 않는다(BLUEPRINT-017).

**변환.**(BLUEPRINT-017) 청사진 단계가 각 분기에서 그 키의 `const`·`enum`을 읽어, 그 분기를 `controls: { active: "./<key> === <value>" }`를 가진 조각 객체로 다룬다(BLUEPRINT-017). `enum`이면 값이 그 목록에 드는가를 본다(BLUEPRINT-017). 변환된 분기는 FRAGMENT-001 조각 표의 3행(연언)이 된다(BLUEPRINT-017, FRAGMENT-001).

**분기 스키마는 손대지 않는다.**(BLUEPRINT-017) `kind: { const }`와 `required`는 그대로 검증기에 간다(BLUEPRINT-017, SCHEMA-006). 결과는 청사진의 `SchemaFragment.guard`에 든 `controls.active` 식뿐이다(BLUEPRINT-017, BLUEPRINT-047). 소유자: "우리는 "&active": 을 더하는거지 스키마를 수정하는건 아니니까"(BLUEPRINT-017).

**청사진 단계에서 끝난다.**(BLUEPRINT-017) 상태 칸(원본과 `extras` 둘)도 작업 루프도 바꾸지 않는다(BLUEPRINT-017). 변환된 게이트는 다른 `controls.active`와 같이 호스트 바퀴에서 평가된다(BLUEPRINT-017).

**판별 프로퍼티는 본체에 선언한다**(GOAL-035, BLUEPRINT-017). 폼이 소유하지 않고, 분기 값의 합집합 `enum`을 만들지도 않으며, 암묵 default도 없다(BLUEPRINT-017). 채움의 원천은 `controls.default` > `default` > 없음뿐이다(BLUEPRINT-017).

ajv의 `discriminator: true`는 pydantic 출력에도 throw하므로 플러그인이 켜지 못한다(BLUEPRINT-018). `controls.discriminator`는 검증기 옵션이 아니라 폼의 예약 층이다(BLUEPRINT-018). 이 규칙은 현재의 "`type`/`$ref`가 없는 `const`/`enum`이면 판별식"(`getCompositionKeyInfo.ts:33`, `getExpressionFromSchema.ts:35-51` — 두 파일이 서로를 언급하지 않은 채 같은 암묵 규칙에 기댄다)과 `COMPOSITION_PROPERTY_REDEFINITION` throw(`getCompositionNodeMapList.ts:95-105`)를 대체한다(BLUEPRINT-018). 명시 없이 자동 감지에 기대던 스키마는 이주 안내 대상이다(BLUEPRINT-018). 그런 스키마는 `controls.discriminator`를 더하거나 분기 안에 `if/then/else: false`를 쓴다(BLUEPRINT-018, FRAGMENT-030). `JSONSchema` 타입이 `kind: { const: 'a' }`를 받아들이게 하는 것은 목표 C4(표준 스키마의 타입 수용과 추론)다(BLUEPRINT-018, GOAL-017).

### 01-schema-to-blueprint.md §3.1 조각과 게이트의 기본 모델

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

### 01-schema-to-blueprint.md §3.2 형상과 노드의 상태

5. **존재는 선언 위치로, 필수성은 `required`로 가른다**(FRAGMENT-026). 조각 안에서만 선언된 프로퍼티는 조건부로 존재한다(FRAGMENT-026). 기본 `properties`에 선언된 프로퍼티는 조각으로 꺼지지 않는다(FRAGMENT-026). 그것을 형상에서 빼는 것은 노드 자신의 `controls.active`(노드 게이트)와 부모 `controls.children`의 `controls.active`다(FRAGMENT-026, CONTROLS-073). `required`는 말 그대로 required다(FRAGMENT-026). 조건에 쓰는 프로퍼티는 본체 `properties`에 선언한다(GOAL-035의 축 2항(조건 프로퍼티는 `properties`에 선언한다))(FRAGMENT-026, GOAL-035). 컨벤션이며 폼은 검사하지 않는다(FRAGMENT-026, GOAL-035).

로드 때 게이트가 거짓인 노드는 생기지 않으므로 채우지 않는다(FRAGMENT-014). 거짓에서 참이 되면 노드가 **생기므로**, 그때 값이 없음이면 채움(`controls.default` > `default`)이 적용된다(FRAGMENT-014, SETTLE-005). `controls.visible`의 전환은 생성이 아니다(FRAGMENT-014). 노드 게이트도 호스트 바퀴 안에서 평가된다(FRAGMENT-014). 그래서 바퀴의 상한에 노드 게이트 수가 든다(FRAGMENT-014, SETTLE-022). 한 장치의 두 범위다(FRAGMENT-014). 조각 게이트와 노드 게이트가 다르게 동작하면 목표 G4(하나의 개념에는 하나의 장치)에 걸린다(FRAGMENT-014, GOAL-006). 노드 게이트도 게이트 가진 조각처럼 꺼진 채 출발하고 전순서 안에서 평가된다(양의 순환에서 고정점이 하나로 정해진다)(FRAGMENT-014). 전순서에서 노드 게이트는 그 노드를 선언한 조각 바로 뒤에, 같은 조각 안에서는 선언 순서로 든다(FRAGMENT-014).

노드 스키마의 `controls.active`가 거짓이면 그 노드는 **형상에 없다**(FRAGMENT-015). 원본은 기본으로 남아 노드마다 getter `inactiveValues`로 읽을 수 있고 방출에서 빠진다(원리 P4(방출은 정책이다))(FRAGMENT-015, VALUE-029, GOAL-030). 잠복 원본 열거는 루트 노드의 함수이고 노드마다 getter `inactiveValues`다(FRAGMENT-015, VALUE-029). 나감 정책이 참으로 정해진 노드는 나갈 때 한 번 비운다(FRAGMENT-015, VALUE-006). 조각이 꺼졌을 때와 같다(FRAGMENT-015).

6. **다른 서브트리를 보는 조건은 `if`를 공통 조상으로 끌어올려 표현한다 — 상속 overlay**(E12)(FRAGMENT-027). 끌어올린 조각의 `then`이 손자를 선언하면 청사진이 그 선언을 자식 호스트의 **상속 overlay**로 귀속시키되 게이트는 조상의 것이다(FRAGMENT-027). 자식의 계산 입력은 (원본, 상속 overlay 집합)이고, 부모의 바퀴가 overlay 집합을 바꾸면 자식을 **그 바퀴 안에서** 재계산한다 — 부모 게이트가 자식의 방출을 읽으므로 뒤로 미룰 수 없다(FRAGMENT-027). 같은 입력이면 재계산하지 않도록 메모한다(F5)(FRAGMENT-027, SETTLE-024). 조건의 입력이 값 밖(`@` 컨텍스트, 사용자 권한)에 있으면 서버가 원리적으로 검증할 수 없으므로 `controls`로만 쓴다(FRAGMENT-027). 비용은 TEST-032에 있다(FRAGMENT-027, TEST-032).

【추론】 예약 층에서 표준 부분이 모르는 필드를 선언하는 문법은 두지 않는다(FRAGMENT-052). 【추론】 FE 전용 조건부 필드는 소비자가 단일 스키마에 표준 `properties`로 merge하고, 노드 게이트 `controls.active`로 켜고 끈다(FRAGMENT-052). 【추론】 결과는 Q4가 그린 것과 같다(FRAGMENT-052). 【추론】 켜진 동안 방출에 든다(FRAGMENT-052). 【추론】 서버의 스키마에 없으면 서버 판정은 서버의 `additionalProperties`를 따른다(FRAGMENT-052). 【추론】 여기에 더해 FE 검증기도 그 필드를 본다(FRAGMENT-052). 【추론】 조건 표현력(목표 G2(폼의 동작은 세 층으로 나뉘고, 아래층은 위층을 모른다))은 노드 게이트로 이미 채워진다(FRAGMENT-052, GOAL-004). 【추론】 merge 안내 문서(SCHEMA-018)에 이 쓰임을 예로 더한다(FRAGMENT-052, SCHEMA-018).

6. **표준 `readOnly`는 그 노드에만 걸린다**(FRAGMENT-033). 객체 노드에 둔 `readOnly`는 자손을 잠그지 않으며 입력이 없으므로 효과가 없다(FRAGMENT-033). 표준 독자의 기대(인스턴스 전체)와 다르다(FRAGMENT-033). 배열 노드의 `readOnly`는 렌더 계층이 아이템 추가·삭제·이동 입력에 적용하며, 터미널 객체·배열은 입력이 있으므로 리프와 같다(FRAGMENT-033). 자손을 잠그려면 부모의 `controls.children`이나 조각의 `controls`를 쓰고, 폼 전체를 잠그려면 Form 속성 `readOnly`·`disabled`를 쓴다(FRAGMENT-033, CONTROLS-045). 터미널이 아닌 객체 노드의 표준 `readOnly`는 개발 모드 청사진 경고 대상이다(FRAGMENT-033, ERROR-164). 개발 모드 로그와 `onError` 경고 기록(핸들러가 있으면 모든 환경)으로 드러난다(FRAGMENT-033, ERROR-164).

### 01-schema-to-blueprint.md §3.3 게이트 입력과 반복 계산

게이트의 입력 `G`는 **검증기가 볼 값**이다 — 현재의 활성 집합으로 합성한 로컬에 투영(`omitEmpty`·`omitTrailing`·null)을 적용한 것(FRAGMENT-016). `if`와 `controls.active`가 같다(FRAGMENT-016). 원리 P1(판정은 검증기의 것이다)에 따라 형상과 판정이 어긋나지 않게 하는 조건이다(FRAGMENT-016, GOAL-025). `extras`(선언되지 않은 키의 값)도 그 값에 든다(FRAGMENT-016). 예외는 하나다: 호스트 자신의 원본이 객체가 아니면 `G = {}`(FRAGMENT-016). 2라운드 S8(`properties`·`required`가 `null`·`undefined`에서 공허하게 참)은 이 예외로 닫힌다(FRAGMENT-016). 빈 중첩 호스트도 자기 `{}`로 자기 게이트를 평가한다(FRAGMENT-016). 분기 안 `if`에 조건 프로퍼티의 `required`가 있으면 `{}`에서 그 분기들의 `then`은 모두 꺼진다(FRAGMENT-022의 컨벤션)(FRAGMENT-016, FRAGMENT-022). 끌어올린 게이트가 `{addr: null}`에서 참인 것은 검증기도 같으므로 계약 위반이 아니다(목표 G1(판정의 동치))(FRAGMENT-016, GOAL-003). 빈 문자열을 "있다"로 다루고 싶은 작성자는 `omitEmpty`를 끈다(FRAGMENT-016).

1. 출발점 `A := 게이트 없는 조각 ∪ 조상에서 상속된 overlay`(FRAGMENT-017). **직전 커밋의 활성 집합은 읽지 않는다** — 형상이 이력을 읽으면 같은 원본이 다른 형상이 된다(원리 P3(형상은 상태의 순수 함수다))(FRAGMENT-017, GOAL-029). 직전 커밋의 활성 집합은 생긴 노드의 판정(전이)에만 쓰고 평가 순서 힌트로 쓰지 않으며, 바퀴의 평가 순서는 청사진 전순서다(FRAGMENT-017, SETTLE-050).
2. 한 바퀴에 **모든** 게이트(조각 게이트와 노드 게이트)를 평가한다(FRAGMENT-017). 참이면 켜고 거짓이면 **끈다**(FRAGMENT-017). 한 바퀴 안의 켜짐·꺼짐은 뒤의 게이트에 즉시 반영된다(가우스-자이델, F3)(FRAGMENT-017).

`A`가 바뀌면 다시 돈다(FRAGMENT-017). 상한 = 게이트 가진 조각 수 + 노드 게이트 수 + 1(FRAGMENT-017). 넘으면 정착은 SETTLE-011의 예산 규칙을 따른다(FRAGMENT-017, SETTLE-011).

4. 지원 범위 밖은 "자기 부정 스키마"가 아니라 그 일반형이다: **게이트 의존 관계에 부정을 포함한 순환**이 있으면 고정점이 없을 수 있고, 결과는 상한에서 결정적이되 임의적이다(F3)(FRAGMENT-017). 1라운드 R6이 철회한 "순환이 없다"의 자리가 이것이다(FRAGMENT-017).
5. 직전 커밋의 활성 집합은 출발점을 바꾸지 않고, 평가 순서 힌트로 쓰지 않는다(FRAGMENT-017, SETTLE-050). 출발점 자체를 바꾸는 최적화는 채택하지 않는다(FRAGMENT-017, SETTLE-044). 비용: 정순 의존 체인은 2바퀴, 역순 N단은 N+1바퀴다(E4)(FRAGMENT-017). 이 셈은 원본이 이미 있는 계산에 한정되며, 채움으로 이어지는 체인은 링크마다 전이 라운드를 쓴다(F2, SETTLE-005)(FRAGMENT-017, SETTLE-005).

**3.6 원본으로만 지탱되는 조각과 `default`로만 지탱되는 조각은 다르다.**(FRAGMENT-046) 원본은 상태이고 `default` 주입은 사건이다(FRAGMENT-046). 그래서 TEST-061의 실험(D-15)이 S2(최소 고정점 뒤, 선언 키가 원본에 있는 꺼진 조각을 검증기 가드로 한 번 켜 봄)를 채택하더라도, "`default`만으로 자기 가드를 켜는 조각"은 켜지지 않는다(FRAGMENT-046, TEST-061). `default`는 "조각이 꺼짐에서 켜짐으로 바뀐 직후"의 사건이므로 자기 조각을 켜는 원인이 될 수 없고, 자기 지지 `default`는 상태에서 오지 않아 P3가 배제한다(FRAGMENT-046).

【추론】 조각의 `controls`에 둔 에지 규칙(`unsetValue`·`derived`·`resetInteraction`·`injectTo`)은 그 조각이 켜져 있는 동안만 후보다(FRAGMENT-050). 【추론】 (1) 나감은 이 규칙들의 에지가 아니다(FRAGMENT-050). 【추론】 조각이 꺼지는 정착에서 그 규칙은 평가하지도 발화하지도 않는다(FRAGMENT-050). 【추론】 꺼짐이 값에 닿는 장치는 나감 정책 `unsetOnInactive` 하나다(FRAGMENT-050). 【추론】 그 정책은 조각 층의 값으로, 직전 커밋의 값을 쓴다(FRAGMENT-050). 【추론】 (2) 조각이 켜지는 정착에서 그 조각이 새로 들인 노드의 규칙 에지는 거짓→참이다(WRITE-029)(FRAGMENT-050, WRITE-029). 【추론】 그래서 `unsetValue`·`resetInteraction`은 식이 참이면 발화하고, `derived`·`injectTo`는 발화한다(FRAGMENT-050). 【추론】 형상에 남아 있던 공유 노드는 그 규칙의 기준점만 그 정착의 값으로 잡고 발화하지 않는다(CONTROLS-026, VALUE-025)(FRAGMENT-050, CONTROLS-026, VALUE-025). 【추론】 (3) 후보 여부는 그 라운드의 완성된 트리에서 조각이 켜져 있는지로 정한다(FRAGMENT-050). 【추론】 앞 라운드에 적용된 파생 쓰기는 뒤 라운드에서 조각이 꺼져도 되돌리지 않는다(FRAGMENT-050). 【추론】 철회는 채움만 한다(FRAGMENT-050). 【추론】 (4) 조각의 `controls.default`는 에지 규칙이 아니라 채움이며, 노드가 생길 때만 쓴다(FRAGMENT-050).

7. **양방향 주입은 식이 `undefined`를 돌려주어 멈춘다.**(FRAGMENT-034) 섭씨↔화씨처럼 왕복이 정확하지 않은 `controls.injectTo` 쌍은 순환이다(FRAGMENT-034). 폼은 오늘의 자동 차단을 두지 않고 예산으로 잡으므로, 작성자는 대상이 이미 같은 값이면 `undefined`를 돌려준다(`undefined`면 쓰지 않는다, CONTROLS-079)(FRAGMENT-034, CONTROLS-079).

### 01-schema-to-blueprint.md §3.4 읽지 않는 검증 문법과 오류

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

### 01-schema-to-blueprint.md §3.5 분기와 판별의 원리

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

### 01-schema-to-blueprint.md §3.6 명시 판별자의 변환

작성자가 union 호스트에 예약 층 키 `controls.discriminator`를 적으면, 청사진이 각 분기에서 그 키의 `const`·`enum`을 읽어 그 분기를 `controls: { active: "./<key> === <value>" }`를 가진 조각 객체처럼 다룬다(`enum`이면 값이 그 목록에 드는가)(FRAGMENT-008). 변환된 분기는 FRAGMENT-001의 표 3행이 된다(FRAGMENT-008, FRAGMENT-001). **분기 스키마는 손대지 않는다.**(FRAGMENT-008) `kind: { const }`와 `required`는 그대로 검증기에 간다(FRAGMENT-008, SCHEMA-006). 소유자: "우리는 "&active": 을 더하는거지 스키마를 수정하는건 아니니까"(FRAGMENT-008). 변환은 청사진 단계에서 끝난다(FRAGMENT-008). 상태 칸과 작업 루프를 바꾸지 않는다(FRAGMENT-008, BLUEPRINT-017). 판별 프로퍼티는 작성자가 본체 `properties`에 선언한다(GOAL-035의 축 2항(조건 프로퍼티는 `properties`에 선언한다), 컨벤션)(FRAGMENT-008, GOAL-035). 폼이 소유하지 않는다(FRAGMENT-008). 암묵 default는 없다(FRAGMENT-008). 채움의 원천은 `controls.default` > `default` > 없음뿐이다(WRITE-090)(FRAGMENT-008, WRITE-090). 값이 비어 있으면 `===` 비교가 모두 거짓이므로 어느 분기도 켜지지 않는다(FRAGMENT-008).

【추론】 분기에서 판별 키의 `const`·`enum`을 찾는 범위는 그 분기의 정적 연언이다(FRAGMENT-048). 【추론】 곧 분기 본체, 게이트 없는 `allOf` 항목, 그리고 이것들이 `$ref`로 가리키는 대상이다(재귀, BLUEPRINT-030의 순환 절단을 따름)(FRAGMENT-048, BLUEPRINT-030). 【추론】 그 키 프로퍼티 스키마도 같은 정적 연언(자기 `$ref`, 게이트 없는 `allOf`)에서 모은다(FRAGMENT-048). 【추론】 `if/then`, 게이트 가진 `allOf` 항목, 중첩 `oneOf`·`anyOf`는 보지 않는다(FRAGMENT-048). 【추론】 한 분기에서 모은 `const`·`enum`은 정적 연언의 교차로 합친다(FRAGMENT-048). 【추론】 교차가 공집합이면 정적 연언의 청사진 오류다(FRAGMENT-048). 【추론】 끌어올림(O-1)도 이렇게 모은 선언을 쓴다(FRAGMENT-048). 【추론】 null 분기(`isNullBranch`)는 노드의 nullable 플래그이므로 판별 대상 분기로 세지 않는다(FRAGMENT-048). 【추론】 null 분기에 판별 키가 없는 것은 키 없음도 오류도 아니다(FRAGMENT-048). 【추론】 분기가 자기 `controls.active`도 가지면 그 분기의 게이트는 `(변환식) && (분기 식)` 하나다(FRAGMENT-048). 【추론】 판별 키가 없는 분기가 자기 `controls.active`를 가지면 그 식만이 게이트다(FRAGMENT-048).

그 키의 분기 선언을 게이트 없는 선언으로도 취급해 끌어올린다(14라운드 답 O-1: 태그 키가 분기 안에만 있는 생성기 스키마도 그대로 받는다)(FRAGMENT-007). 있는 분기끼리 종류가 다르거나 `const`·`enum` 값이 겹치면 청사진 오류다(FRAGMENT-007). 일부 분기에만 없는 것은 그 분기가 게이트 없음일 뿐이다(FRAGMENT-007). 소유자(14라운드 O-1): "가 로 하죠. 다만, discriminator 를 서로 다르게 선언했거나 discriminator 이 분기마다 다른 타입이나 성질을 가지면 오류로 알려줘야 합니다."(FRAGMENT-007) `controls.discriminator`의 키가 어느 분기에도 `const`·`enum`으로 없거나, 있는 분기끼리 종류가 다르거나 값이 겹침(O-1. 일부 분기에만 없는 것은 그 분기가 게이트 없음일 뿐 오류가 아니다)(FRAGMENT-007). 청사진 분석: `controls.discriminator` 키가 어느 분기에도 없거나, 분기끼리 종류가 다르거나 값이 겹치거나, 선언 사이 값이 다름(FRAGMENT-007). 한 분기의 정적 연언에 판별 선언이 여럿이면 그 교차가 공집합일 때만 청사진 오류이고, 겹치면 교차를 쓴다(FRAGMENT-007, FRAGMENT-048).

【추론】 판별 키가 union이어도 FRAGMENT-007의 분기 규칙은 그대로다(BLUEPRINT-017)(FRAGMENT-007, FRAGMENT-055, BLUEPRINT-017). 【추론】 분기의 `const`·`enum` 리터럴의 JSON 종류가 판별 키의 목록(`schemaType`, 원소 하나인 경우 포함)과 nullable 어디에도 없으면, 청사진이 개발 모드 경고 `(가칭) SCHEMA_FORM_WARNING.DISCRIMINATOR_BRANCH_UNREACHABLE`을 낸다(FRAGMENT-007, FRAGMENT-055).

### 01-schema-to-blueprint.md §3.7 분기 게이트와 작성 관행

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

### 01-schema-to-blueprint.md §3.8 분기의 동시 활성과 값 보존

같은 `oneOf`에서 게이트를 가진 분기가 둘 이상 동시에 켜지는 것을 폼은 막지 않는다(FRAGMENT-012). 켜진 분기의 제약은 모두 연언으로 적용되고, 개발 모드에서 경고한다(FRAGMENT-012). 경고의 드러남은 ERROR-001과 ERROR-159가 정한다(FRAGMENT-012, ERROR-001, ERROR-159). 기본 출력(개발 모드 로그)은 프로덕션에서 침묵한다(경고는 결과를 바꾸지 않으므로 침묵해도 계약이 깨지지 않는다)(FRAGMENT-012, ERROR-001, ERROR-159). `onError` 핸들러가 있으면 모든 환경에서 경고 기록을 받는다(FRAGMENT-012, ERROR-001, ERROR-159). 게이트의 결과만 세고 분기의 내용은 읽지 않으므로 축 1항(폼은 JSON Schema 문법을 해석하지 않는다) 안이다(소유자 답 20)(FRAGMENT-012, GOAL-034). `onError` 경고 기록은 핸들러가 없는 프로덕션에서는 판정하지 않는다(FRAGMENT-012).

분기가 꺼질 때 이전 분기의 값(FRAGMENT-035). 닫혔다(FRAGMENT-035). 원리 P4(방출은 정책이다)에 따라 기본은 원본을 두고 방출에서 뺀다(FRAGMENT-035, GOAL-030). 비움은 나감 정책 키(`unsetOnInactive`)로 켜며, 노드 > `controls.children`의 `controls` > 조각의 `controls` > Form 속성 순으로 세부가 포괄을 덮는다(FRAGMENT-035, CONTROLS-040).

ㄴ 다시 켜진 노드의 값은 꺼지기 전의 원본이다(VALUE-025)(FRAGMENT-054, VALUE-025). #338의 "null로 버린 데이터는 되살아나지 않는다"와 부딪히지 않는다(FRAGMENT-054). `setValue(null)`은 키 없는 전체 교체라 자식 원본을 없음으로 만들고, 숨겨 둔 원본이 없기 때문이다(VALUE-036·WRITE-092)(FRAGMENT-054, VALUE-036, WRITE-092). 초기값을 되살리는 연산은 `FormHandle.reset`(커밋된 prop의 로드, WRITE-044)과 `resetSubtree`가 맡는다(FRAGMENT-054, WRITE-044). `resetSubtree`는 유지하며, 루트가 든 로드 스냅숏에서 그 경로의 값을 서브트리에 로드한다(WRITE-085)(FRAGMENT-054, WRITE-085). ㄷ 공유 노드의 서로소 `enum`에서 값은 그대로 남는다(FRAGMENT-054). 새 조각이 켜져도 공유 노드는 새로 생기지 않으므로 다시 채우지 않는다(FRAGMENT-054). 검증기가 기각하고, 폼은 막지 않는다(FRAGMENT-054). 비우고 싶은 작성자는 조각 범위 `controls.unsetValue`(CONTROLS-077)를 쓰거나 이름을 가른다(FRAGMENT-054, CONTROLS-077).

### 02-node-and-value.md §2.3 형상과 잠복 원본

**5. 노드는 형상에 있거나 없다(VALUE-006).**

- 노드가 **형상에 있다**는 것은 그 노드를 선언한 조각이 켜져 있고 노드 자신의 `controls.active`가 거짓이 아니라는 뜻이다(VALUE-006). 노드 게이트와 조각 게이트는 한 장치의 두 범위다(VALUE-006, CONTROLS-021).
- 형상에 없는 노드의 원본은 기본으로 남는다(VALUE-006). 방출에서 빠지며, 잠복 원본 열거는 루트 노드의 함수이고 노드마다 getter `inactiveValues`다(VALUE-006, VALUE-029). 작성자나 호출자(Form 속성)가 나감 정책이 참으로 정해진 노드는 나갈 때 한 번 비운다(VALUE-006). 나감은 직전 커밋의 형상에 있었고 이번 최종 형상에 없는 것이며, 하위 트리를 포함하고 공유 노드는 제외한다(VALUE-006). 로드에는 나감이 없다(13라운드 답 2, VALUE-006, WRITE-037).

작성자나 호출자(Form 속성)가 나감 정책(`unsetOnInactive`, 소유자 13라운드 확정)이 참으로 정해진 노드가 나갈 때 한 번 원본을 비운다(VALUE-006). 형상에 없는 노드의 규칙(`controls.derived` 등)은 평가하지 않는다(VALUE-006). 나가는 객체·분기에 켠 정책은 함께 나가는 하위 트리로 내려가고, 자손이 스스로 적은 선언이 가까운 순서로 이긴다(17라운드 소유자 답 R17-2 ㄴ, VALUE-006, WRITE-033).

노드가 **생긴다**는 것은 그 노드가 직전 커밋의 형상에 없고 이번 정착의 최종 형상에 있다는 뜻이다(VALUE-035). 채움(`controls.default` > `default`)은 이 사건에만 일어난다(VALUE-035, SETTLE-005, WRITE-090). 본체나 다른 켜진 조각이 이미 두고 있던 노드는 새 조각이 켜져도 생기지 않는다(VALUE-035). `controls.visible`의 전환은 생성이 아니다(VALUE-035).

**6. 형상에서 빠지는 것은 쓰기가 아니다(VALUE-008). `null`을 포함한 전체 교체는 V에 없는 원본을 지운다(VALUE-008).** 조각이 꺼지거나 노드 게이트가 거짓이 되는 것은 **쓰기가 아니라 방출에서의 제외**이며(P4. 나감의 비움은 형상 변화가 아니라 작성자가 켠 정책의 자동 쓰기다), `omitEmpty`·`omitTrailing`도 원본을 건드리지 않는 투영 규칙이다(VALUE-008).

형상에 없는 노드의 원본은 방출되지 않으므로 검증기가 기각하지 않고 잔여 목록에도 없다 — 설계상 잠복이다(P4, VALUE-017).

- 기본 정책에서 분기 필드의 복원, `controls.active` 재활성화, null 계약이 "원본은 남고 방출에서만 빠진다" 하나로 설명된다(VALUE-025). 나가는 노드를 reset하고 들어오는 노드에 값을 복원하며 타입 호환을 검사하는 절차가 없어진다(R8, 제약 T-23(분기 복원은 자식의 원본 배열 상태를 합성 값보다 우선한다), VALUE-025, GOAL-074).
- 기본 정책에서는 입력 도중 조각이나 노드 게이트가 잠깐 꺼져도 데이터가 지워지지 않고, 다시 켜지면 마지막 입력이 돌아온다(그 노드에 `controls.derived`·`controls.unsetValue`가 없을 때. 있으면 재탄생 에지로 발화한다, VALUE-025). 나감 정책이 참으로 정해진 노드는 나갈 때 비워지므로, 다시 켜지면 생긴 노드로서 채움(`controls.default` > `default`)을 받는다(VALUE-025).

잠복 원본 열거는 **루트 노드의 함수**다(루트가 형상에 없는 노드의 원본을 들고 있으므로 저장 자리와 같다, VALUE-029). 모든 노드는 getter `node.inactiveValues`를 두고, 자기 경로로 루트의 함수를 불러 그 아래의 잠복 원본을 돌려준다(VALUE-029). `FormHandle`에는 더하지 않는다(VALUE-029). 【추론】 `node.inactiveValues`(와 그것이 부르는 루트 노드의 함수)는 읽기 전용 배열 `ReadonlyArray<{ readonly path: string; readonly value: unknown }>`을 돌려준다(VALUE-029, WRITE-087).

【추론】 ㄱ core가 스스로 잠복 원본을 파기하는 시점은 더하지 않는다(VALUE-031). `setValue(V)`는 로드가 아니지만 전체 교체 쓰기로서 V에 없는 경로의 원본(잠복 원본 포함)을 없음으로 만든다(VALUE-031, WRITE-094). 잠복 원본이 지워지는 길은 나감 정책, 로드(마운트·`FormHandle.reset()`·`resetSubtree()`), V가 그 경로를 담지 않은 전체 교체 쓰기다(VALUE-031, WRITE-090, WRITE-094). 【추론】 로드와 전체 교체 쓰기에서는 V에 없는 원본이 없음이 되므로, 잠복 원본도 V의 값으로 바뀌거나 지워진다(VALUE-031, WRITE-090, WRITE-094). 【추론】 이 밖에는 ㅁ의 쓰기가 그 경로에 없음을 쓸 때뿐이다(VALUE-031). 【추론】 형상에 없는 노드의 규칙은 평가하지 않으므로 `controls.unsetValue`는 잠복 원본을 지우지 못한다(VALUE-031).

【추론】 제출 후 파기는 두지 않는다(VALUE-031). 【추론】 core는 제출을 모르고, 파기는 폼이 스스로 값을 지우는 일이 되기 때문이다(VALUE-031). 【추론】 민감한 값을 남기지 않는 기본 권고는 나감 정책 `unsetOnInactive`를 켜는 것이다(VALUE-031). 【추론】 호출자가 한 번에 비우려면 `setValue(form.getValue(), SetValueOption.DisableAutomaticWrites)`를 쓴다(VALUE-031). 【추론】 이때 투영으로 빠진 값도 없음이 된다(VALUE-031). 【추론】 열거는 루트 노드의 함수와 getter `node.inactiveValues`다(VALUE-029, VALUE-031).

ㄹ 손대지 않고 저장한 방출 값은 로드 값과 다를 수 있다(VALUE-031). 그 차이는 다섯으로 닫힌다(VALUE-031).

- (a) 형상에 없는 노드의 값(잠복으로 남고 `inactiveValues`로 열거된다, VALUE-031)
- (b) 작성자가 켠 투영(`omitEmpty`·`omitTrailing`, VALUE-031)
- (c) S1의 형 정규화(VALUE-031)
- (d) 로드의 자동 쓰기(없음인 키의 채움, 로드 때 발화하는 `injectTo`·`derived`, 로드된 값으로 평가한 `unsetValue`, VALUE-031)
- (e) 키 순서(미선언 키는 `extras`로 보존되지만 선언 키 뒤에 온다, Q14, VALUE-031)

따로 알리는 경고는 두지 않는다(VALUE-031).

【추론】 ㅁ 비활성 경로에 닿는 쓰기는 거부도 오류도 아니다(VALUE-031). 【추론】 그 쓰기는 루트가 드는 그 경로의 잠복 원본에 반영된다(VALUE-031). 【추론】 노드는 만들지 않고, 규칙도 평가하지 않으며, 방출되지 않는다(VALUE-031). 【추론】 이런 쓰기가 닿는 길은 넷이다: 조상의 `Merge`·전체 교체 쓰기·로드가 그 경로를 담을 때(WRITE-018의 분배), 형상에 없는 대상을 가리킨 `controls.injectTo`(CONTROLS-053), `batch`에서 표시할 때는 형상에 있었으나 정착 뒤 떠난 노드에 표시된 쓰기, 형상을 떠나기 전에 얻은 노드 참조로 한 쓰기(VALUE-031, WRITE-090, WRITE-094). `setValue(V)`와 `Overwrite`를 준 입력 쓰기는 로드가 아니라 전체 교체 쓰기이며, V가 그 경로를 담으면 이 쓰기도 WRITE-018의 분배로 그 경로의 잠복 원본에 닿는다(VALUE-031, WRITE-090, WRITE-094). 【추론】 형상을 떠난 노드와 그 옛 참조의 읽기·쓰기·재진입은 NODE-044가 정하며, 그래서 순차 쓰기와 배치 쓰기가 같은 원본에 닿는다(VALUE-031).

### 03-settle-and-events.md §1.1 정착의 원리와 결정성

쓰기(또는 쓰기의 묶음)마다 **한 곳에서, 고정된 순서로** 다음을 돈다(SETTLE-001).
**표시부터 커밋까지는 동기·단방향이다.**(SETTLE-001) 비동기는 경계(검증·React·`onChange`)에만 있고 이벤트는 출력 전용이다(SETTLE-001). 배치는 표시 N번에 계산·커밋 1번, 통지 1번이다(SETTLE-001).

통지도 동기다(SETTLE-001, EVENT-002).

**`if/then/else`, 분기 조각의 게이트, `controls.active`(노드·조각)는 같은 계산을 탄다.**(SETTLE-009) 라이프사이클이 하나다(SETTLE-009).

원본을 쓰는 것은 파생과 전이뿐이고 둘 다 표시로 돌아간다(SETTLE-010). 그래서 커밋된 트리는 (스키마, 트리 전체의 `raw`·`extras`)의 순수 함수다(F9, 원리 P3(형상은 상태의 순수 함수다))(SETTLE-010). 상태는 이 둘뿐이다(SETTLE-010).

(SETTLE-029)

| # | 도출 |
| - | ---- |
| D-2 | 형상은 상태의 순수 함수(P3)이므로 출발점 고정 + 비단조 재평가. 고정점이 없는 스키마는 지원 범위 밖이고 `degraded`로 관측 가능하다 |

**고정점이 없는 스키마는 지원 범위 밖이다.**(SETTLE-026) 게이트 의존 관계에 부정을 포함한 순환이 있으면 결과는 상한에서 결정적이되 임의적이고 `degraded`(`cause`는 예산)로 표시된다(F3)(SETTLE-026). 대표적인 진동은 `if: { not: { required: ['x'] } }, then: { properties: { x: { default: 1 } } }`다(SETTLE-026). 채움이 노드가 생길 때 한 번이 된 뒤로 이런 자기 게이트 순환은 런타임에는 사라지고 로드에만 남는다(SETTLE-026). 고정점이 둘 이상이면(R7) 선언 순서에 대해 결정적인 하나로 정착하며, 어느 경우에도 원본은 기본으로 남는다(SETTLE-026).

SETTLE-026 "고정점이 없는 스키마는 지원 범위 밖"과 D-2에 따라 예산 초과다(SETTLE-026). SETTLE-011에 따라 원본 B를 커밋한다(SETTLE-026).
결과는 명시적 쓰기를 표시한 원본 B에서 시작한 반복의 극한, 곧 `{}`다(SETTLE-026).
유일한 해가 자기 지지 `default`라면 FRAGMENT-046에서 허용되지 않으므로 SETTLE-026의 경우가 된다(SETTLE-026, FRAGMENT-046).

【추론】 정착의 출발점은 고정이다(SETTLE-018, SETTLE-044).
【추론】 직전 커밋의 `active`에서 출발하는 최적화는 채택하지 않는다(SETTLE-044).
【추론】 까닭 하나: 양의 순환에서 결과가 달라진다(SETTLE-044).
【추론】 소유자가 받아들인 최소 고정점 동작(12-10)이 이력에 의존하게 바뀌어 P3·D-2(형상은 상태의 순수 함수)를 깬다(SETTLE-044).
【추론】 예: 조각 C가 켜진 동안 서로를 켜 준 A·B가 있을 때, C가 꺼지면 고정 출발에서는 A·B도 꺼지지만 이어 출발에서는 켜진 채 남는다(SETTLE-044).
【추론】 까닭 둘: 같은 결과를 보장하려면 가드 사이의 의존을 알아야 하는데, 폼은 `if`의 내용을 읽지 않는다(SETTLE-044).
【추론】 U19 비용(켜진 조각 N개인 호스트의 무관한 키 입력)은 기존 최적화 (a)(b)(c)(BLUEPRINT-007, F13 키 패치)로 다룬다(SETTLE-044).
PR: PR-2 벤치(TEST-027·TEST-032)에 "켜진 조각 N개 호스트의 무관한 키 입력" 행을 더한다(SETTLE-044).
통과: TEST-027 게이트(옛 판 대비, Vincent의 수용)(SETTLE-044).
실패: P3 대 속도의 맞바꿈이므로 소유자에게 올린다(SETTLE-044).

**기록.**(SETTLE-031)

```text
라이프사이클 — 소유자: "마이크로태스크와 매크로태스크 기반의 라이프사이클을 노드 내부에서만큼은 원칙에 맞는 직관적인 데이터 흐름을 가졌으면 한다. 지금은 서로 막 주고받는 게 많다." / "react 파이버처럼 node가 동작하도록."
가드가 보는 값 — 소유자: "가드는 방출 값을 보는 게 맞다. 빈 문자열을 '있다'고 보는 게 오히려 이상하다. 그렇게 처리할 거면 omitEmpty를 끄면 되고, 그럼 방출값으로 통일해도 일정하다."
순환 — 소유자: "injectTo의 무한루프나 derived 무한루프 방어처럼 했으면 한다. 미리 알고 처리한다기보단, 몇 회 루프를 돌면 경고하고 error를 throw하도록. react의 hook처럼. 추가적인 방어를 해도 되는데 애드훅하게 하는 것보단 돌려보고 터지는 걸 개발 단계에서 알려주는 게 낫다."
순환(10라운드) — 소유자: "루프의 가능성을 제한하지는 않는다. … 그 상한값을 초과하면 적절한 error를 표시한다. 이는 react의 hook과 동일한 설계를 갖는다." / "구태여 막지 않을 뿐이지 루프를 만드는 걸 권하는 설계는 절대 아닙니다."
```

**기록.**(SETTLE-030)
잠금용 불린들과 마이크로태스크 flush가 필요 없어지고, 두 단계 하네스는 단일 단계가 된다(제약 T-5(두 단계 단언 — 동기 단계와 정착 단계), F23)(SETTLE-030).
"한 번의 쓰기가 두 번 배달된다", "결과가 원인보다 먼저 배달된다"가 구조적으로 사라진다(SETTLE-030).
라이프사이클을 SETTLE-002–SETTLE-008의 표 한 장으로 읽는다(목표 G5(한 장으로 설명되는 라이프사이클))(SETTLE-030). Q3(편집 중 상태와 가드가 보는 값)이 닫혔다(SETTLE-030).
되돌림 가능성은 낮다(SETTLE-030). VALUE-001과 함께 노드 코어의 기반이다(SETTLE-030).

### 03-settle-and-events.md §1.3 호스트 평가와 값 합성

(SETTLE-018, SETTLE-050, SETTLE-019, FRAGMENT-049, SETTLE-020, SETTLE-021, SETTLE-022, SETTLE-023, SETTLE-024, SETTLE-025, SETTLE-042)

| 규칙 | 내용 | 근거 |
| ---- | ---- | ---- |
| 출발점 고정 | `A := 게이트 없는 조각 ∪ 상속 overlay`. 게이트 없는 조각은 본체 `properties`, 게이트 없는 `allOf` 항목, 게이트 없는 `oneOf`·`anyOf` 분기다. 직전 커밋의 `active`는 **읽지 않는다** — 직전 커밋의 활성 집합은 생긴 노드의 판정(전이)에만 쓰고 평가 순서 힌트로 쓰지 않는다. 노드 게이트도 게이트 가진 조각처럼 꺼진 채 출발한다 | E1·E6 |
| 조각은 트리 | 중첩 조각은 감싸는 조각이 활성일 때만 순회한다. 전순서(호스트에서 조각까지의 경로를 (키워드 순위, 배열 인덱스) 쌍의 열로 보고 사전식으로 비교한 것. 키워드 순위는 본체 `properties` < `allOf` 항목 < `if/then/else` < `oneOf` 분기 < `anyOf` 분기. 같은 호스트의 `oneOf` 분기는 모든 `anyOf` 분기보다 앞이다. JSON 키 순서에 기대지 않는다). 노드 게이트는 그 노드를 선언한 조각 바로 뒤에, 같은 조각 안에서는 선언 순서로 든다 | E3 |
| 매 바퀴 전부 | 한 바퀴에 **모든** 게이트(조각 게이트와 노드 게이트, 켜진 것과 꺼진 것 모두)를 평가한다. 한 바퀴 안의 켜짐·꺼짐은 뒤의 게이트에 즉시 반영된다(가우스-자이델) | E4, F3 |
| 게이트 입력 | 게이트는 **검증기가 볼 값**을 본다 — `A`로 합성한 local에 투영(`omitEmpty`·`omitTrailing`·null)을 적용한 것. `if`는 검증기 플러그인이 컴파일한 것으로, `controls.active`는 표현식으로 평가한다. `extras`(선언되지 않은 키의 값)도 게이트 입력에 든다(FRAGMENT-016). 폼은 `if`의 내용에 관여하지 않는다. 예외는 하나: 호스트 자신의 `raw`가 비객체이면 `G = {}` | E5, 원리 P1(판정은 검증기의 것이다) |
| 비단조 재평가 | 참이면 켜고 거짓이면 끈다. `A`가 바뀌면 다시 돈다. 상한 = **게이트 가진 조각 수 + 노드 게이트 수 + 1** | E6, F3, SETTLE-022 |
| 상한 초과 | 원본 B를 커밋하고(SETTLE-011), 형상은 원본 B로 한 번 더 계산하며 그 바퀴도 상한에 걸리면 마지막 바퀴의 `A`로 고정한다. 결과는 `diagnostics.status = 'degraded'`(`cause`는 예산)로 둔다. 자식 호스트의 초과도 루트의 `diagnostics`에서 관측된다. 모든 환경에서 사슬 끝에서 throw한다(17라운드 소유자 답 R17-1 나) | E6, F12, 5.0의 1, ERROR-130, ERROR-070 |
| 상속 overlay | 끌어올린 조각의 `then`이 손자를 선언하면 청사진이 그 선언을 자식 호스트의 overlay로 귀속시킨다. 부모의 바퀴가 overlay 집합을 바꾸면 자식을 **바퀴 안에서** 재계산하되 (`raw`, overlay 집합)으로 메모한다 | E12, F5 |
| 합성 | `local := compose(A)`, `emit := project(local)`. 다시 계산하는 키는 그 조각이 선언한 키뿐이고, 키 집합이 바뀌면 그 호스트의 `local`을 선언 순서로 O(키 수) 새로 지으며 `delete`는 없다. 첫째 유효 스키마 `options.propertyKeys`에 적힌 키가 그 순서로, 둘째 나머지 선언된 자식 키는 청사진 전순서에서 그 이름의 첫 선언 자리 순으로, 셋째 `extras`는 원본에 들어온 순서로 온다 | E10, F13, VALUE-010 |

【추론】 직전 커밋의 활성 집합은 바퀴의 평가 순서 힌트(F13)로 쓰지 않는다: 호스트 바퀴의 게이트 평가 순서는 청사진 전순서(BLUEPRINT-008, FRAGMENT-049)이며 이력과 무관하다(SETTLE-050).
【추론】 직전 커밋의 활성 집합은 생긴 노드의 판정(전이)에만 쓴다(SETTLE-050).
【추론】 고정점이 둘 이상인 스키마(R7)는 선언 순서에 대해 결정적인 하나로 정착해야 하는데(SETTLE-026), 이력을 따르는 평가 순서는 같은 원본에서 다른 고정점을 고를 수 있어 P3(형상은 상태의 순수 함수, SETTLE-029)에 어긋난다(SETTLE-050).
PR: PR-2(정착)(SETTLE-050).
무엇: 고정점이 둘인 스키마(서로 배타인 게이트 둘이 각자 자기를 켜는 순환)에서 이력 둘(첫 게이트를 먼저 켰던 폼과 둘째 게이트를 먼저 켰던 폼)을 같은 원본으로 이끌고 형상을 비교한다(SETTLE-050).
통과: 두 폼의 형상이 같고, 그 형상은 청사진 전순서에서 앞선 게이트의 고정점이다(SETTLE-050).
실패: 이 블록을 고친다(SETTLE-050).

【추론】 branch 객체 노드의 `local`과 `emit`의 키 순서는 결정적이다(SETTLE-042, SETTLE-025).
【추론】 쓰기의 순서나 이력과 무관하다(SETTLE-042, SETTLE-025).
【추론】 첫째, 그 호스트의 유효 스키마 `options.propertyKeys`에 적힌 키가 그 순서로 먼저 온다(SETTLE-042, SETTLE-025).
【추론】 둘째, 나머지 선언된 자식 키는 청사진 전순서(FRAGMENT-049)에서 그 이름의 첫 선언 자리 순이다(SETTLE-042, SETTLE-025).
【추론】 조각에서만 선언된 키와 공유 노드의 키도 같다(SETTLE-042, SETTLE-025).
【추론】 셋째, `extras`는 그 뒤에 원본에 들어온 순서(삽입 순서)로 온다(SETTLE-042, SETTLE-025).
【추론】 형상에 없는 키는 없다(SETTLE-042, SETTLE-025).
【추론】 순서표는 호스트의 유효 스키마 메모가 바뀔 때 한 번 계산해 메모와 함께 둔다(SETTLE-042).
【추론】 키 집합이 같은 커밋(값만 바뀐 쓰기, 키 입력)은 바뀐 자식만 직전 `local`의 사본에 같은 자리로 패치한다(SETTLE-042).
【추론】 그 비용은 O(재계산 목록)이고 순서가 유지된다(SETTLE-042).
【추론】 키 집합이 바뀌는 커밋(조각이나 노드 게이트의 토글, 자식이 생기거나 빠짐, `extras` 추가, `propertyKeys` 변경)은 그 호스트의 `local`을 위 순서로 새로 짓는다(SETTLE-042).
【추론】 그 비용은 O(그 호스트의 키 수)이고 `delete`는 없다(SETTLE-042).
【추론】 F13의 "조각이 선언한 키만 패치"는 다시 계산하는 키의 범위로 읽는다(SETTLE-042, SETTLE-025).
【추론】 토글 때 다시 계산하는 것은 그 조각이 선언한 키뿐이고, 나머지 값은 직전 `local`에서 옮겨 선언 순서로 새 객체를 짓는다(SETTLE-042).
【추론】 `emit := project(local)`은 순서를 그대로 둔다(SETTLE-042).
【추론】 터미널 객체와 비객체 원본은 받은 값을 그대로 든다(순서를 바꾸지 않음)(SETTLE-042).
【추론】 배열은 인덱스 순이다(SETTLE-042).
【추론】 오늘의 선언 순서 정렬(`BranchStrategy.ts:246,777-803`, `sortWithReference`: 참조 목록의 키가 먼저, 나머지는 원래 순서)과 같은 결과를 내므로 이주 행은 두지 않는다(SETTLE-042).
PR: PR-2 시험(SETTLE-042).
무엇: 조각 키의 자리가 오늘의 `oneOf`/`anyOf` 키 합집합 순서와 어긋나는 스키마가 있는지 본다(SETTLE-042).
실패: 어긋나면 이주 행을 더한다(SETTLE-042).

【추론】 (가) "값이 바뀌었다"는 하나의 판정(가칭 `sameValue`, 내부)으로 본다(SETTLE-043).
【추론】 원시 값은 SameValueZero로 본다(SETTLE-043).
【추론】 `NaN`은 `NaN`과 같고 `-0`은 `0`과 같다(SETTLE-043).
【추론】 배열은 길이와 차례대로의 원소를 본다(SETTLE-043).
【추론】 평범한 객체는 자기 열거 키의 목록(순서 포함)과 키마다의 값을 본다(SETTLE-043).
【추론】 그 밖의 객체(함수, `Date`, 클래스 인스턴스, `File` 등)는 참조로 본다(SETTLE-043).
【추론】 두 값의 참조가 같으면 더 내려가지 않는다(지름길)(SETTLE-043).
【추론】 (나) 커밋 단계에서, 이번 정착에 쓰인 잎의 `raw`·`extras`가 직전 커밋의 것과 (가)로 같으면 직전 참조를 둔다(SETTLE-043).
【추론】 쓰기 경계에서 지금 값과 같으면 쓰지 않는 것은 오늘과 같다(SETTLE-043).
【추론】 호스트의 `emit`은 VALUE-012대로 만든다(SETTLE-043).
【추론】 새로 만든 것이 직전 커밋의 것과 키 목록(순서 포함)도 같고 키마다의 자식 `emit` 참조도 같으면 직전 참조를 둔다(얕은 비교, 재계산 목록의 호스트만)(SETTLE-043).
【추론】 그래서 EVENT-031·EVENT-006의 "emit 참조가 바뀜"은 "방출 값이 바뀜"과 같아진다(SETTLE-043).
【추론】 `onChange`·배달·검증 요청은 참조 비교만으로 값 비교를 따른다(SETTLE-043).
【추론】 에지는 원천이나 의존의 값을 기준점(SETTLE-004·SETTLE-028)과 (가)로 견준다(SETTLE-043).
【추론】 대상은 `injectTo`의 원천 방출 값, `derived`의 의존 값, `unsetValue`·`resetInteraction`의 식 값이다(SETTLE-043).
【추론】 (다) 지름길 때문에 비교는 이번 정착에서 새로 만들어진 부분에만 내려간다(SETTLE-043).
【추론】 그래서 비용은 쓰기가 바꾼 크기에 비례한다(목표 G6(정밀한 고속 제어))(SETTLE-043).
【추론】 12-3은 검증기 성능에 관한 답이므로 폼 자신의 이 비용에는 닿지 않는다(SETTLE-043).
【추론】 (라) `controls.derived` 규칙의 의존 집합은 두 경로의 합집합이다: 청사진이 그 식에서 정적으로 뽑은 경로, 그리고 그 노드의 `controls.watch` 경로(모든 선언의 합집합)(SETTLE-043).
【추론】 역의존 표와 같은 표에서 나온다(SETTLE-043).
【추론】 같은 노드의 다른 식(`active`·`visible`·`readOnly`·`disabled`·`unsetValue`)이 읽는 경로는 들지 않는다(SETTLE-043).
【추론】 에지는 이 집합의 값 튜플이 기준점과 (가)로 다를 때다(SETTLE-043).
【추론】 경로가 읽는 값의 종류, 그리고 `@` 맥락의 변경이 에지인지는 CONTROLS-080이 정한다(SETTLE-043).

### 05-validation-and-errors.md §1.3 검증기 선택과 공통 계약

검증기를 내장하지 않는다(VALIDATE-014).

Form 속성 `validatorFactory`는 유지하고 넓힌다(14라운드 답 O-7: '플러그인을 통한 전역 속성이 아니라 특정 커스텀 검증기 등을 추가한 커스텀 인스턴스 주입기')(VALIDATE-040).

플러그인은 전역 기본이고 속성은 그 폼의 검증기 인스턴스이며, 같은 계약(`compile` + `compileGuard`)을 받고 플러그인보다 앞선다(VALIDATE-041). 미등록 판정은 둘을 함께 본다(VALIDATE-042).

【추론】 (1) 계약 형은 하나다(가칭 `Validator`)(VALIDATE-041, VALIDATE-044).
【추론】 `Validator`는 `compile(copy)`, `compileGuard(root, pointer)`, 선택 `release(root)`(VALIDATE-045), 선택 방언 선언(VALIDATE-026), 그리고 `compile` 결과 함수의 에러 정규화(`dataPath`, 루트 경로 표기, `rejectedKey`)를 담는다(VALIDATE-044).
【추론】 플러그인은 여기에 소비자 훅 `bind?`만 더 가진다(VALIDATE-044).
【추론】 core는 `bind`를 부르지 않는다(VALIDATE-044).
【추론】 `<Form validatorFactory>`(이름 유지, O-7)와 오늘의 `FormProvider` 속성 `validatorFactory`는 이 형을 그대로 받는다(VALIDATE-044).
【추론】 (2) 고르는 순서는 Form 속성 > `FormProvider` > 등록한 플러그인이다(VALIDATE-044).
【추론】 오늘의 순서다(`RootNodeContextProvider.tsx:94`, `ValidationManager.ts:203`)(VALIDATE-044).
【추론】 바인딩 계층이 트리를 만들 때 한 번 고르고, 그 결과나 없음을 core에 인자로 넘긴다(VALIDATE-044, CONTROLS-075).
【추론】 미등록 판정은 고른 결과가 없음인 것이다(VALIDATE-042와 같은 뜻)(VALIDATE-044).
【추론】 (3) 고른 검증기의 참조가 트리 생성 뒤 바뀌면 다른 스키마와 같이 재생성한다(VALIDATE-044).
【추론】 캐시와 등록이 검증기 인스턴스마다이기 때문이다(VALIDATE-044).
【추론】 오늘도 `useMemo` 의존으로 트리를 다시 만든다(`RootNodeContextProvider.tsx:85-104`)(VALIDATE-044).
【추론】 매 렌더 새 객체를 주지 말라고 문서화한다(VALIDATE-044).
【추론】 (4) 가드 함수는 같은 값에 같은 boolean을 동기로 돌려준다(VALIDATE-044).
【추론】 던지거나 boolean이 아닌 값(비동기 스키마의 Promise 등)을 내면 그 평가는 가드 실패(`GUARD_FAILED`, 정착 오류)다(VALIDATE-044).

(VALIDATE-015)

```ts
compile(schema):      (value) => Promise<Errors | null> | Errors | null  // 전체 검증, 에러 수집
compileGuard(root, pointer): (value) => boolean                           // 동기, 첫 실패에서 중단
```

- 가드는 **동기 전용**이다(VALIDATE-016). 비동기 포맷·키워드는 가드에서 지원하지 않는다고 계약에 명시한다(VALIDATE-016).

- 플러그인 패키지들이 변경 범위에 들어간다(VALIDATE-025).

검증기 미등록 시 "조건부 비활성 + 경고"에 대해 소유자는 "동의. 단, 그럼 플러그인도 변경 범위에 포함해서, error 처리를 생략한 단순 검증 기능도 제공하도록 하자."고 답했다(VALIDATE-025).

### 06-react-and-surface.md §1.7 잔여 키 오류 표시

잔여 키의 표시 규칙과 기본 문구, `formatError`의 `false schema` 번역, 잔여 키 UI를 기본 렌더러가 제공하는지 — 모두 렌더 계층의 일이다(REACT-026).

【추론】 기본 렌더러는 잔여 키 전용 UI를 두지 않는다(REACT-026, REACT-031).
【추론】 잔여 키 오류(`rejectedKey`가 있는 오류)는 `dataPath`가 가리키는 호스트의 오류로 오늘처럼 호스트의 오류 렌더러에 그려진다(REACT-026, REACT-031).
【추론】 `not.required` 오류를 호스트에서 자식으로 옮기지 않는다(REACT-026, REACT-031).
【추론】 기본 문구는 오늘의 기본 `formatError`를 그대로 따른다(REACT-026, REACT-031).
【추론】 `presentation.errorMessages[keyword]`가 있으면 그것을, 없으면 검증기의 `message`를 쓴다(`src/helpers/error/formatValidationError/formatValidationError.ts`)(REACT-026, REACT-031).
【추론】 `false schema` 번역은 따로 두지 않는다(REACT-026, REACT-031).
【추론】 작성자가 `errorMessages`의 `'false schema'` 키나 자기 `formatError`로 번역한다(REACT-026, REACT-031).
【추론】 `rejectedKey`는 사용자 정의 렌더러와 `formatError`가 읽을 수 있는 칸으로 남는다(REACT-026, REACT-031).

## 설계문서

- `design/01-schema-to-blueprint.md` §2.4 (BLUEPRINT-017)
- `design/01-schema-to-blueprint.md` §3.1 (FRAGMENT-003, FRAGMENT-002, FRAGMENT-001, FRAGMENT-009, FRAGMENT-011, FRAGMENT-021)
- `design/01-schema-to-blueprint.md` §3.2 (FRAGMENT-026, FRAGMENT-014, FRAGMENT-015, FRAGMENT-027)
- `design/01-schema-to-blueprint.md` §3.3 (FRAGMENT-016, FRAGMENT-017)
- `design/01-schema-to-blueprint.md` §3.4 (FRAGMENT-019, FRAGMENT-020)
- `design/01-schema-to-blueprint.md` §3.5 (FRAGMENT-004, FRAGMENT-010, FRAGMENT-025, FRAGMENT-028, FRAGMENT-029, FRAGMENT-006)
- `design/01-schema-to-blueprint.md` §3.6 (FRAGMENT-008)
- `design/01-schema-to-blueprint.md` §3.7 (FRAGMENT-013, FRAGMENT-022, FRAGMENT-023, FRAGMENT-024, FRAGMENT-032)
- `design/01-schema-to-blueprint.md` §3.8 (FRAGMENT-012, FRAGMENT-035)
- `design/02-node-and-value.md` §2.3 (VALUE-006)
- `design/03-settle-and-events.md` §1.1 (SETTLE-026)
- `design/03-settle-and-events.md` §1.3 (SETTLE-018, SETTLE-020, SETTLE-022, SETTLE-023)
- `design/05-validation-and-errors.md` §1.3 (VALIDATE-016)
- `design/06-react-and-surface.md` §1.7 (REACT-026)
