# ADR 0010 — 작성자의 약속: 분기 관행과 폼이 검사하지 않는 것

## 상태

| 항목 | 닫은 사람 | 라운드 |
| --- | --- | --- |
| FRAGMENT-006 | 소유자 답(`reviews/round-12-owner-answers.md:9` 2 &discriminator) | 12 |
| FRAGMENT-007 | 소유자 답(`reviews/round-14-owner-answers.md:7` O-1), 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-91) | 18 |
| FRAGMENT-022 | 소유자 답(`reviews/round-10-owner-answers.md:9` A-3), 소유자 답(`reviews/round-10-owner-answers.md:38` E-23) | 10 |
| FRAGMENT-023 | 소유자 답(`reviews/round-10-owner-answers.md:38` E-23), 소유자 답(`reviews/round-10-owner-answers.md:40` E-19) | 10 |
| FRAGMENT-024 | 소유자 답(`reviews/round-12-owner-answers.md:14` 6 else: false 경고) | 12 |
| FRAGMENT-030 | 소유자 답(`reviews/round-10-owner-answers.md:38` E-23), 소유자 답(`reviews/round-10-owner-answers.md:8` A-2), 편집자 결정(11라운드 ADR 0010 초안, `adr/0010-branch-conventions.md:3`) | 11 |
| FRAGMENT-031 | 편집자 결정(11라운드 ADR 0010 초안, `adr/0010-branch-conventions.md:3`), 소유자 답(`reviews/round-10-owner-answers.md:11` B-22, 예시에 const와 required를 둠) | 11 |
| FRAGMENT-032 | 소유자 답(`reviews/round-9-spec.md:20` 축2), 소유자 답(`reviews/round-10-owner-answers.md:40` E-19), 편집자 결정(14라운드, `adr/0002-guard-fragment-model.md:105` 잠복 원본) | 14 |
| FRAGMENT-033 | 소유자 답(`reviews/round-13-owner-answers.md:7` 1 잠금 규칙), 편집자 결정(14라운드 F-5, `reviews/round-14-values-check.md:62`) | 14 |
| FRAGMENT-034 | 소유자 답(`reviews/round-12-owner-answers.md:20` §9 undefined 반환), 소유자 답(`reviews/round-1.md:179` 순환을 분석 단계에서 금지하는가) | 12 |
| TEST-059 | 편집자 결정(9라운드 실측, `07-conclusions.md:355`) | 9 |

## 결정

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

【추론】 분기에서 판별 키의 `const`·`enum`을 찾는 범위는 그 분기의 정적 연언이다(FRAGMENT-048). 【추론】 곧 분기 본체, 게이트 없는 `allOf` 항목, 그리고 이것들이 `$ref`로 가리키는 대상이다(재귀, BLUEPRINT-030의 순환 절단을 따름)(FRAGMENT-048, BLUEPRINT-030). 【추론】 그 키 프로퍼티 스키마도 같은 정적 연언(자기 `$ref`, 게이트 없는 `allOf`)에서 모은다(FRAGMENT-048). 【추론】 `if/then`, 게이트 가진 `allOf` 항목, 중첩 `oneOf`·`anyOf`는 보지 않는다(FRAGMENT-048). 【추론】 한 분기에서 모은 `const`·`enum`은 정적 연언의 교차로 합친다(FRAGMENT-048). 【추론】 교차가 공집합이면 정적 연언의 청사진 오류다(FRAGMENT-048). 【추론】 끌어올림(O-1)도 이렇게 모은 선언을 쓴다(FRAGMENT-048). 【추론】 null 분기(`isNullBranch`)는 노드의 nullable 플래그이므로 판별 대상 분기로 세지 않는다(FRAGMENT-048). 【추론】 null 분기에 판별 키가 없는 것은 키 없음도 오류도 아니다(FRAGMENT-048). 【추론】 분기가 자기 `controls.active`도 가지면 그 분기의 게이트는 `(변환식) && (분기 식)` 하나다(FRAGMENT-048). 【추론】 판별 키가 없는 분기가 자기 `controls.active`를 가지면 그 식만이 게이트다(FRAGMENT-048). 【추론】 한 분기의 정적 연언 안에서 판별 키의 `const`·`enum` 교차가 공집합이면 오류 코드는 ERROR-164의 정적 연언 행(`EMPTY_ENUM_INTERSECTION`)이며 `DISCRIMINATOR_MISMATCH`가 아니다(FRAGMENT-048).

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

### 07-landing-and-tests.md §2.11 측정 시나리오와 실험 기록

(TEST-032, TEST-030, SETTLE-045, TEST-069)

| 상황 | 이미 있는 것 | 새로 필요한 것 |
| ---- | ------------ | -------------- |
| 대규모 쓰기 | `array-node-stress`의 applyValue, scale 벤치 | 큰 트리의 루트에 값을 통째로 쓰기 (flat 500, array 1000) |
| 배치 작업 | `event-cascade`의 K-배치 쓰기 | 표시 N번 → 계산·커밋 1번의 비용 |
| 빠른 연속 입력 | 하니스의 키 입력 단계 | **넓은 객체(키 1,000개)와 긴 배열(아이템 10,000개) 안에서의 키 입력** — 불변 갱신의 복사 비용 (VALUE-014의 위험) |
| 화면 전환 | `branch-strategy-init`, oneOf 토글, 마운트 | begin/complete 두 패스와 선택 가드는 사라졌다. 새 모델의 정착 측정은 SETTLE-045·TEST-069의 PR-2 정착 시나리오와 PR-2 벤치를 가리킨다 |
| (새 구조 고유) | — | **가드 평가** — `if`/`then`이 많은 스키마에서 쓰기당 `compileGuard` 호출 수와 시간, 검증기 구현체별(AJV, 인터프리터형) 비교. **1차 측정 완료** — TEST-036 |
| (새 구조 고유) | — | 분석 단계(스키마 → 청사진)의 1회 비용, `$ref`가 많은 스키마 |
| 메모리 | `benchmark-form`의 heap snapshot 도구(내용 미확인) | 노드당 메모리, 노드를 필요할 때 만드는 안(NODE-053)의 효과 |
| (14라운드) | — | 조건부 폼(`if` 20, 필드 200)의 마운트·키 입력·토글 |
| (14라운드) | — | `oneOf` 픽스처를 `controls.discriminator`판과 게이트 없는 판으로 나누어 잰다 |
| (14라운드) | — | 배치 없는 연속 `setValue` M회의 검증 횟수와 시간 |

측정 수치는 유효하나 시나리오 이름은 옛 모델의 것이다(TEST-032, TEST-030).

- 벤치: 루트로 옮긴 게이트가 N개일 때 키 입력 한 번의 비용을 잰다(TEST-032).
- PR: PR-2 벤치(TEST-027·TEST-032)에 "켜진 조각 N개 호스트의 무관한 키 입력" 행을 더한다(TEST-032).

- PR: PR-2 벤치(TEST-032).
- 무엇: 커밋 때 조상 경로 메모를 갱신하는 비용을 잰다(TEST-032).

다음은 기록이다(TEST-036). 수치와 방법은 `reviews/round-1.md` §2에 있다(TEST-036). 결론만 옮긴다(TEST-036).

1. **AJV에서는 가드를 몇 번 부르느냐가 문제가 아니다.**(TEST-036) 루트에 걸린 좁은 가드 200개를 키 입력마다 전부 돌려 7.9 µs다(TEST-036).
2. **걱정이 현실이 되는 곳은 둘이다**: 인터프리터형 검증기(`@cfworker/json-schema`는 같은 작업에 578 µs, 호스트 객체의 폭에 비례한다)와 컬렉션을 훑는 가드(아이템 10,000개의 `contains` 하나에 AJV 190 µs, 인터프리터 4.5 ms — 키 입력마다)(TEST-036).
3. **"호스트 참조가 그대로면 건너뛴다"는 루트에 걸린 가드에 효과가 없다.**(TEST-036) 읽는 키의 참조를 선형으로 비교하는 것도 AJV에서는 평가 비용과 같다(TEST-036). 효과가 있는 것은 변경 경로 → 가드의 역색인뿐이다(13 ns)(TEST-036).
4. **AJV의 실제 비용은 컴파일이다.**(TEST-036) 가드 하나에 70–270 µs, 200개면 폼 생성 시점에 14–54 ms(TEST-036). 늦추고, 중복을 없애고, 폼 인스턴스 사이에 공유해야 한다(TEST-036).
5. **불변 갱신의 복사 비용은 문제가 아니다.**(TEST-036) 키 1,000개 객체 1.1 µs, 아이템 10,000개 배열 2.7 µs(TEST-036). 현재 구현의 동기 쓰기 경로와 같은 수준이다(TEST-036).
6. 검증은 폼 전체 크기에 비례한다(아이템 10,000 × 6필드에 약 140 µs, 에러가 많으면 더)(TEST-036). 폼은 검증을 입력 경로에서 떼어 내는 장치를 따로 두지 않고 진입당 요청 1회와 마이크로태스크 합치기로 하며, 빈도 조절은 `OnRequest`다(TEST-036, VALIDATE-049).

모바일과 저사양 기기에서는 재지 않았다(TEST-036). 나노초 단위의 측정은 방법에 민감하다 — 같은 인자를 되풀이하면 JIT가 호출을 없애고, 여러 경우를 한 프로세스에서 재면 100배까지 어긋난다(PROCESS-030)(TEST-036).

다음은 기록이다(TEST-037). `reviews/round-2.md` §2에 표가 있고 전문은 `spikes/work-loop/REPORT.txt`다(TEST-037). 요점: 키 입력이 현재 구현보다 두 자릿수 배 싸지고(쓰기 뒤 첫 읽기의 재합성이 사라진다), 구현 선택이 승패를 가른다(메모 복사·패치 대 재구성 104배, dirty 목록 대 플래그 스캔 17배, 역색인 5배)(TEST-037). 재설계가 지는 유일한 지점은 조건부 폼의 생성(가드 컴파일 22 ms)이며 폼 인스턴스 사이의 컴파일 공유가 필요하다(TEST-037). V8의 자기 속성 1,020개 절벽은 현재 구현에도 같게 걸린다(TEST-037).

다음은 기록이다(TEST-059). 파일: `spikes/round9/oneof-if.mjs`, `oneof-if-output.txt`, `REPORT.txt`(TEST-059). 각 분기의 `if`는 `{ properties: { kind: { const } }, required: ['kind'] }`다(TEST-059).

| 배치 | 올바른 값 `{kind:'a', x:'s'}` | 누락 값 `{kind:'a'}` | 어느 조건에도 맞지 않는 값 `{kind:'c'}` | 조건 프로퍼티 없음 `{x:'s'}` |
| --- | --- | --- | --- | --- |
| `oneOf` 분기에 `if/then`만 | 거부 | 통과 | 거부 | 거부 |
| `oneOf` 분기에 `if/then` + `else: false` | 통과 | 거부 | 거부 | 거부 |
| `anyOf` 분기에 `if/then`만 | 통과 | 통과 | 통과 | 통과 |
| `anyOf` 분기에 `if/then` + `else: false` | 통과 | 거부 | 거부 | 거부 |
| `allOf` 항목에 `if/then`만 | 통과 | 거부 | 통과 | 통과 |
| 최상위 `if/then` 하나 | 통과 | 거부 | 통과 | 통과 |
| 오늘 방식(`const` 판별식) | 통과 | 거부 | 거부 | 거부 |

`if`에서 `required`를 빼면 `else: false`를 붙인 `oneOf`·`anyOf`가 `{x:'s'}`를 통과시키고, 빈 값에서 가드 단독 판정이 모두 참이 된다(검증 §2.3)(TEST-059). 그래서 FRAGMENT-022의 컨벤션이 "`else: false`와 `required` 함께"다(TEST-059).

다음은 기록이다(TEST-060). 8라운드 `loop-v4e.mjs`에서 59개 정확 치환(검증 뒤 수정 포함)으로 파생했고 재생성이 바이트 단위로 같다(TEST-060). 상태 칸은 원본과 `extras`뿐이며, 조각은 `if`(검증기 스텁) 또는 `&active`로 켜지고, 게이트 없는 조각은 무조건이다(TEST-060). 재실행은 `spikes/round9/`에서 `node regress/run.mjs`다(TEST-060).

프로토타입 보고서의 사실(`spikes/round9/REPORT-proto.txt`)(TEST-060). 교차 검증(`reviews/raw-round9-verification.md` §2)은 회귀·프로브의 합계 단언을 재실행해 재현했고, 채움 단위와 같은 대상 충돌은 탐침으로 하나씩 재현했다(TEST-060).

- 이식한 8라운드 회귀 63개 단언이 두 모드에서 모두 통과했다(TEST-060). v4e 자신의 기존 실패 셋 가운데 A4c와 A4-cap은 "같은 값을 다시 써도 에지를 발화하지 않는다"는 규칙으로, A4b는 "최종 형상에 없는 노드의 중간 채움은 남기지 않는다"는 규칙으로 기대가 바뀌어 통과한다(`regress/CHANGES.txt`)(TEST-060).
- Q8 프로브 108개 단언과 경계 26개가 통과했다(TEST-060).
- 로드에서는 `&default`가 `default`를 이겼고, 나중에 켜진 조각의 새 노드도 채워졌다(TEST-060).
- `&unsetValue`는 값을 지우고 입력을 남겼으며, 그 뒤 다시 채워지지 않았다(TEST-060). 자기 삭제로 조건이 거짓이 되어도 삭제를 철회하지 않는다(TEST-060).
- `else: false`가 없는 분기 둘에서 개발 모드 경고 둘이 났다(TEST-060). 게이트 없는 순수 `oneOf`·`anyOf`는 두 분기를 모두 켰다(TEST-060).
- 자식 집합 결합에서 AND/OR와 "가장 가까운 선언이 이김"은 정반대 결과를 냈다(TEST-060).
- `&derived`와 `&injectTo`의 같은 대상 충돌은 대상별로 하나만 적용해 2라운드에 수렴했다(TEST-060). 순위는 스위치다(TEST-060).
- `disableAutomaticWrites`는 채움·`&derived`·`&injectTo`·`&unsetValue`를 모두 막고 로드 값은 그대로 두었으며, 그 뒤 사용자 입력에서는 자동 쓰기가 다시 일어났다(TEST-060). 호출 단위 지정이 Form 속성을 덮었다(TEST-060).
- 비수렴 `&derived`·`&injectTo` 쌍은 라운드 상한 5·6·25 모두에서 예산 초과이고, 원본 B 커밋이면 `{a:0, b:0}`, 마지막 라운드 커밋이면 상한 직전의 값(상한 25에서 `{a:24, b:24}`, 상한 5에서 `{a:4, b:4}`)이다(TEST-060).

교차 검증이 첫 판에서 명세와 어긋나는 곳 셋을 찾았고 같은 codex 세션에서 고쳤다(TEST-060). 채움 단위(본체에만 노드 단위였고 공유 노드와 게이트 없는 `allOf` 항목은 조각 단위로 다시 채움), 노드 게이트(로드 때 꺼진 노드를 채우고 켜질 때 채우지 않음), 게이트 없는 분기의 공유 노드에 첫 선언 스키마를 힌트로 남김(TEST-060). 고치는 과정에서 넷째 빈틈이 재현으로 드러났다(`{seed:1, on:1}`, `REPORT-proto.txt` 325행)(TEST-060). 중간 라운드에 채운 값이 뒤 라운드에서 형상에서 빠진 노드의 원본에 남는 문제로, "생김"을 정착이 수렴한 뒤의 최종 형상으로 판정하고 최종 형상에 없는 노드의 채움 후보는 철회하도록 고쳤다("중간 라운드의 주입은 커밋 전에 버린다"(SETTLE-005)의 실행 확인)(TEST-060). 고친 뒤의 결과는 `spikes/round9/REPORT-proto.txt`의 "5. 검증 뒤 수정" 절과 `spikes/round9/r9b-output.txt`(단언 52개, 탐침 13개, 실패 0)에 있다(TEST-060).

고친 뒤 달라진 회귀 기대는 "이미 있던 노드는 다시 채우지 않는다", "최종 형상에 없는 노드의 중간 채움은 남기지 않는다", "게이트가 거짓인 노드는 생기지 않는다(FRAGMENT-014)"에서 온다(TEST-060). 8라운드 회귀 이식의 바뀐 요약은 17행이다(TEST-060). 7라운드 사례 X16(자기 주입으로 자기 조각을 끄는 스키마)은 에지 모드의 두 구성에서, 이전에 중간 원본 보존으로 `stable`이던 것이 예산 초과가 된다(TEST-060). 레벨 모드는 `t='from-undefined'`로 2라운드에 수렴한다(TEST-060). 에지 모드의 결과는 SETTLE-026(자기 가드를 끄는 자동 쓰기는 예산 초과)과 같은 판정이다(TEST-060).

(TEST-061, GOAL-015)

| 항목 | 질문 | 실험 | 결정 기준 |
| ---- | ---- | ---- | --------- |
| D-15 순환 스키마의 출발점 | `if`가 `x`를 요구하고 `then`이 `x`를 선언하는 부정 없는 순환에서 `{x: 'v'}`를 로드하면 조건부 조각이 꺼진 채 출발해 `x`가 방출에서 빠지고 상태는 `stable`이다. 로드한 유효 값이 조용히 사라진다. 원인은 신호의 부재가 아니라 출발점(SETTLE-029)이다 | 프로토타입 `loop-v4d` 사본에 출발점 스위치 셋을 더한다. `minimal`(지금), `S1`(선언 키가 원본에 있는 조건부 조각을 출발점에 더함), `S2`(최소 고정점 뒤 그런 꺼진 조각을 검증기 가드로 한 번 켜 봄). 사례 E8(자기 순환 `{x:'v'}`), E8b(상호 순환 `{a:1,b:2}`), E9(선언 순서에 따라 다른 고정점에 닿던 사례), E1, E12–E14, X15, X16, 독립 모델 N1·N2·N9. 회귀 전부. 비용은 케이스마다 새 프로세스 5회 | 채택: E8 → `{x:'v'}`, E8b → `{a:1,b:2}`, E9 불변 `{a:1}`, 회귀 0, 바퀴 상한 안, 비용 5회 폭 안. 실패 기준은 회귀, 사용자가 끈 조각이 잠복 원본만으로 되살아남, E9 변화다. 실패하면 최소 출발점 유지, 개발 모드 경고(목표 C2(작성자 실수의 가시성)), 프로덕션 신호는 SURFACE-007의 새 상태 값, WRITE-018과 SETTLE-026 수정. 편집자의 손 계산으로는 S1은 E9를 바꾸고 S2는 유지한다 |

D-15 순환 스키마의 출발점: 2항(조건에 쓰는 프로퍼티는 `properties`에 선언되어야 한다) 아래에서 `if`가 요구하는 `x`를 `then`이 선언하는 스키마는 컨벤션 위반이 되므로 우선순위를 낮춘다(TEST-061, GOAL-035). 실험 명세는 그대로 남긴다(TEST-061). 열린 부분은 "D-15: 컨벤션을 어긴 양의 순환 스키마에서 로드한 값이 알림 없이 빠지고 상태가 `stable`로 남는 것을 받아들이는가."였고, 소유자 답(12-10)은 "받아들입니다"다(TEST-061). 받아들인다(TEST-061). 컨벤션 문서에만 적고 경고 코드는 두지 않는다(TEST-061). A-2의 고지 의무는 이 경우에 적용하지 않는다(답 19가 이긴다)(TEST-061).

다음은 기록이다(TEST-064).

| 시나리오 | 3.1판 | 대조 | 출처 |
| -------- | ----- | ---- | ---- |
| 키 입력, 평면 1,000 | 1.39 µs | 3차안 1.35 µs | `reviews/round-4.md` §2.1 |
| 분기 전환(4라운드 측정 시나리오) | 108 µs | 3차안 89 µs | `reviews/round-4.md` §2.1 |
| 루트 통째 쓰기 10,000 × 5 | 12.0 ms | 현재 217 ms | `reviews/round-4.md` §2.1, `reviews/round-2.md` §2 |
| 조건부 폼 생성 (가드 200개) | 23.0 ms (트리 585 µs + AJV 컴파일 22.4 ms) | 현재 13.4 ms | `reviews/round-2.md` §2 |
| 진입 깊이 카운터 | 측정 스프레드 안 (3–4%) | — | `spikes/work-loop/REPORT-v4c.txt` |

노드별 장부가 루트 통째 쓰기를 3차안보다 58% 늦춘다(TEST-064). 조건부 폼 생성은 재설계가 지는 유일한 지점이다(TEST-064). 조건부 폼의 생성은 현재 구현보다 1.7배 느리다 — 가드 200개에 22.4 ms(TEST-064).

**인터프리터형 검증기를 어느 수준까지 지원하는가.**(TEST-065) 성능 예산을 AJV 기준으로 잡으면 인터프리터형은 "동작하지만 큰 폼에서는 느리다"가 된다(TEST-065). 역색인은 기각되었다(TEST-065, TEST-030). 소유자 답(12-3): "검증기의 성능은 우리가 관여할 문제가 아닙니다만. 뭘 말하는건지요?"(TEST-065).

- 【추론】 비용 — 청사진 판정: 로드마다 한 번이며, 비 union 칸에도 드는 로드 비용은 선언마다 `type` 파싱 O(원소 ≤ 7)과 마스크 교집합 O(1)이고, 분기 합치기는 O(분기 × 정적 연언 깊이)다; 메모리는 union 칸마다 얼린 배열 하나와 기본 spec 하나, 노드마다 0이다; 구현은 허용 집합 도우미 약 60줄(`extractSchemaInfo`와 `processSchemaType`의 형 부분 대체), 분기 합치기 약 50줄, 조각 공유 확장 약 40줄이다(TEST-078).
- 【추론】 비용 — 유효 목록: 좁히는 게이트가 없으면 0(같은 참조)이고, 게이트 선언을 가진 노드는 유효 스키마 메모가 바뀔 때 O(k)의 교집합 한 번, 경고등 재계산은 O(1)이다; 메모리는 좁혀진 메모 항목마다 작은 배열 하나와 spec 하나다; 구현은 약 40줄(병합표 `type` 행 포함)이다(TEST-078).
- 【추론】 비용 — 두 번 해석: 비용은 쓰인 노드 가운데 유효 목록이 정적 목록보다 좁은 노드에 한해 `interpret` 한 번과 쓰인 값의 참조 보관이다; 전이 단계 약 20줄이다(TEST-078, WRITE-098).
- 【추론】 비용 — 새 경고 넷(`TERMINAL_SUBTREE_KEY_IGNORED_FOR_FORM`, `NON_JSON_WHOLE_VALUE`, `DISCRIMINATOR_BRANCH_UNREACHABLE`, `FORM_TYPE_TEST_INVALID`): 개발 모드나 핸들러가 있을 때만 돌며(다만 `NON_JSON_WHOLE_VALUE`의 깊이 점검은 VALUE-037대로 개발 모드에서만 돌며, 핸들러가 있어도 프로덕션에서는 돌지 않는다), 비용은 터미널 하위 스키마 크기, 통째 값 크기(참조가 바뀐 커밋마다), 등록 때의 키 수에 비례한다; 메모리는 중복 억제 키이고; 각 30–40줄이다(TEST-078, WRITE-099).
- 【추론】 비용 — 쓰기(`interpret`): 멤버이면 `classBits` 한 번과 AND 한 번으로 O(1)이고, 문자열 해석은 정규식 한 번과 `Number` 한 번이며, 후보를 세기만 하는 무할당 구현이 조건이다; 메모리 0; `parse/` 약 80–100줄, `unionBehavior/` 행 약 40줄이다(TEST-078).
- 【추론】 비용 — 경고등: 원본이나 유효 스키마가 바뀐 노드만 커밋 때 O(1)이고 경고는 켜질 때만 보낸다; 메모리는 얼린 빈 배열 공유; 게터 두 개다(TEST-078).
- 【추론】 비용 — 방출·채움: 추가 비교와 복사가 없고, 메모리와 구현이 0이다(TEST-078).
- 【추론】 비용 — Hint·props: `useMemo` 안에서 필드 하나를 더 읽고(비 union에도 듦), 시험은 정의 수에 선형(오늘과 같음)이다; 메모리 0; 형 셋과 `getHint` 한 줄이다(TEST-078).
- 【추론】 비용 — 기본 union 입력: 키 입력마다 O(k ≤ 6)이고, 유효 목록은 `jsonSchema` 참조가 바뀔 때만 O(k), `JSON.stringify`는 값 참조가 바뀔 때만 O(값 크기)다; 메모리는 `useState` 하나와 표시 중인 객체 값마다 출력 문자열 크기의 메모다; 감싸개 약 60–80줄이다(TEST-078).
- 【추론】 비용 — 검증기: 기본 경로 0, `bind` 때 옵션 셋 검사 O(1)이다; 메모리는 스키마 깊은 사본을 (인스턴스, 루트)마다 한 번이다; 플러그인마다 약 10줄, ajv8 설정 세 줄이다(TEST-078).
- 【추론】 비용 — 공개 형: 컴파일 시간은 재지 않았다(모름); `value.ts`·`jsonSchema.ts`·노드 형·props 형 약 90줄과 가드 하나다(TEST-078).
- 【추론】 비용 — 플러그인 이주: 객체 시험 일곱 곳(코어 포함), 함수 시험 여섯 곳, mui 수 입력(빈 칸·초안·정수), 플러그인마다 union 항목 하나(권장)다(TEST-078).

## 설계문서

- `design/01-schema-to-blueprint.md` §3.2 (FRAGMENT-033)
- `design/01-schema-to-blueprint.md` §3.3 (FRAGMENT-034)
- `design/01-schema-to-blueprint.md` §3.5 (FRAGMENT-006)
- `design/01-schema-to-blueprint.md` §3.6 (FRAGMENT-007)
- `design/01-schema-to-blueprint.md` §3.7 (FRAGMENT-030, FRAGMENT-022, FRAGMENT-023, FRAGMENT-024, FRAGMENT-031, FRAGMENT-032)
- `design/07-landing-and-tests.md` §2.11 (TEST-059)
