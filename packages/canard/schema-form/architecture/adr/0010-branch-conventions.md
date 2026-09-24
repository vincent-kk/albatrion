# ADR 0010 — 작성자의 약속: 분기 관행과 폼이 검사하지 않는 것

상태: 초안(2026-09-23, 11라운드). 원장 `03-mental-model.md` §1.2의 축 1항(폼은 JSON Schema 문법을 해석하지 않는다)·축 2항(조건 프로퍼티는 `properties`에 선언한다), §5의 분기 컨벤션 행, 소유자 답 19·20·23과 13라운드 답 1에서 나왔다.

## 변경 이력

- 2026-09-24 — 15라운드(`reviews/round-15-decisions.md`): `&` 축약을 `controls` 그룹 표기로, 조각 식의 기준점을 호스트로, 맨 폼 전용 키를 `options`·`presentation` 그룹으로 바꿨다.

## 결정

폼은 `oneOf`·`anyOf`·`if`의 **내용**을 읽지 않는다(원장 P1′, 축 1항(폼은 JSON Schema 문법을 해석하지 않는다)). 분기가 뜻대로 켜지고 검증기가 뜻대로 가르려면 작성자가 아래 약속을 지켜야 한다. 폼은 이 약속을 검사하지 않고(소유자 답 23: "이건 우리가 참견할 문제는 아닙니다"), 키의 유무와 게이트의 결과만으로 아는 것을 개발 모드에서 경고한다(원장 §5의 닫힌 목록). 잘못된 스키마의 책임은 작성자에게 있고 폼은 고지 의무만 진다(소유자 답 2).

## 약속

1. **`oneOf`·`anyOf`의 분기에 `if`를 쓰면 `else: false`를 함께 둔다.** 없으면 `if`가 거짓인 분기가 공허하게 통과해 검증기가 두 분기를 모두 세고(ajv 8.17.1 실측, `spikes/round9/oneof-if.mjs`), 폼에서는 그 분기가 "게이트 가진 분기"가 아니게 되어 분기의 형제 선언은 늘 켜지고 `then`은 `if`로 켜지고 꺼진다. 누락은 개발 모드 경고 대상이다(소유자 12라운드 확인: 둔다, 원장 §5).
2. **`if`에는 조건 프로퍼티를 `required`에 넣는다.** 빈 값에서 `if`가 공허하게 참이 되지 않게 한다. 폼은 검사하지 않는다(소유자 답 23).
3. **`controls.active`(또는 `controls.discriminator`)만으로 게이트를 단 분기에도 판별 키의 `const`(또는 `enum`)와 `required`를 둔다.** `controls.active`는 검증기에게 보이지 않으므로, 이것이 없으면 검증기는 여러 분기를 함께 통과시켜 `oneOf`를 기각한다(ajv 8 실행 확인: `passingSchemas [0,1]`). 생성기 스키마(pydantic, zod, OpenAPI, TypeBox)는 이 둘을 갖고 나온다. 손으로 쓰는 스키마는 작성자가 적는다.
4. **`controls.discriminator`는 명시해야 동작한다.** 명시 없는 `oneOf`·`anyOf`는 모든 분기가 켜진다(원장 §1.1 P1′ 분기 문장). 오늘의 `const`·`enum` 자동 감지는 사라진다(소유자 12라운드 수용). 그 키의 분기 선언을 게이트 없는 선언으로도 취급해 끌어올린다(14라운드 답 O-1: 태그 키가 분기 안에만 있는 생성기 스키마도 그대로 받는다). 있는 분기끼리 종류가 다르거나 `const`·`enum` 값이 겹치면 청사진 오류다. 일부 분기에만 없는 것은 그 분기가 게이트 없음일 뿐이다.
5. **조건 프로퍼티는 호스트에 선언하는 것이 좋다**(축 2항(조건 프로퍼티는 `properties`에 선언한다)). 분기 안에서만 선언되면 모든 분기가 꺼졌을 때 게이트가 그 값을 볼 수 없으므로(잠복 원본), 호스트에 선언해야 입력란이 분기와 무관하게 보인다. 폼은 검사하지 않는다(소유자 답 19). `controls.discriminator`를 명시한 호스트의 태그 키만 약속 4대로 끌어올린다.
6. **표준 `readOnly`는 그 노드에만 걸린다.** 객체 노드에 둔 `readOnly`는 자손을 잠그지 않으며 입력이 없으므로 효과가 없다. 표준 독자의 기대(인스턴스 전체)와 다르다. 배열 노드의 `readOnly`는 렌더 계층이 아이템 추가·삭제·이동 입력에 적용하며, 터미널 객체·배열은 입력이 있으므로 리프와 같다. 자손을 잠그려면 부모의 `controls.children`이나 조각의 `controls`를 쓰고, 폼 전체를 잠그려면 Form 속성 `readOnly`·`disabled`를 쓴다(원장 §4, 13라운드 답 1). 터미널이 아닌 객체 노드의 표준 `readOnly`는 개발 모드 청사진 경고 대상이다(원장 §5).
7. **양방향 주입은 식이 `undefined`를 돌려주어 멈춘다.** 섭씨↔화씨처럼 왕복이 정확하지 않은 `controls.injectTo` 쌍은 순환이다. 폼은 오늘의 자동 차단을 두지 않고 예산으로 잡으므로, 작성자는 대상이 이미 같은 값이면 `undefined`를 돌려준다(원장 §3: `undefined`면 쓰지 않는다).

## 예

```jsonc
{
  "type": "object",
  "controls": { "discriminator": "kind" },
  "properties": { "kind": { "enum": ["card", "bank"] } },
  "oneOf": [
    { "properties": { "kind": { "const": "card" }, "cardNumber": { "type": "string" } }, "required": ["kind", "cardNumber"] },
    { "properties": { "kind": { "const": "bank" }, "account":    { "type": "string" } }, "required": ["kind", "account"] }
  ]
}
```

`if`로 쓰면:

```jsonc
{ "oneOf": [
  { "if": { "properties": { "kind": { "const": "card" } }, "required": ["kind"] },
    "then": { "properties": { "cardNumber": { "type": "string" } }, "required": ["cardNumber"] },
    "else": false },
  { "if": { "properties": { "kind": { "const": "bank" } }, "required": ["kind"] },
    "then": { "properties": { "account": { "type": "string" } }, "required": ["account"] },
    "else": false }
] }
```

## 결과

- 폼이 스키마를 고치거나 해석하지 않으므로 검증기의 판정과 폼의 형상이 같은 스키마에서 나온다(P1).
- 약속을 어긴 스키마는 검증기 쪽에서 드러난다(기각). 폼은 키 유무로 아는 것만 경고한다.
- 이주: 자동 감지에 기대던 스키마는 `controls.discriminator` 한 줄을 더한다.
