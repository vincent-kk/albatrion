# ADR 0003 — 예약 층: 그룹 객체 셋 `controls`·`options`·`presentation`으로 값과 UI를 제어한다

상태: 일부 수락 (6차 본문, 15라운드). 두 층의 구분(소유자 축 6항(`controls`의 키는 값을 제어하는 층이다)), 그룹 객체 셋과 평면 축약의 폐지(축 9항(폼 전용 키는 그룹 객체 셋 안에만, 15라운드 개정)), 상태 키는 그 노드에만(글로벌 없음, 축 10항(글로벌과 로컬의 경합, 13라운드 개정), 소유자 답 13, 13라운드 답 1), 키 이름(`07-conclusions.md` §6.1), 단계와 같은 대상 규칙의 순위(§5.0, 13라운드 답 4), 식의 기준점(호스트, 15라운드), 그룹 이름과 렌더 계층의 이름 규칙(15라운드), `trim`의 자리와 적용(17라운드 R17-3), 나감 비움의 하위 트리 규칙(17라운드 R17-2 ㄴ)은 소유자가 확정했다. 키워드 위치에서만 제거하는 규칙은 현행 유지다. 방향은 소유자가 발의했다 — "form의 표시 제어의 자유권은 모두 & 키워드로 모으고, 이들은 FE에 귀속, 유효성 검증에 개입하지 않도록 한다." 그 `&`는 15라운드에 그룹 객체로 바뀌었고 뜻은 같다.

## 변경 이력

- 2026-09-25 — 17라운드 소유자 답(`reviews/round-17-owner-answers.md`)을 반영했다. `trim`은 `options`에 두고 포커스 아웃 때 문자열 동작 행의 `finishInput` 칸이 판단하며, 자른 값은 입력 출처 쓰기다(R17-3). 나가는 객체·분기에 켠 `unsetOnInactive`는 함께 나가는 하위 트리로 내려간다(R17-2 ㄴ). 인라인 `FormTypeInput`의 암묵 터미널을 렌더 계층의 판정으로 옮긴 것은 통보 1로 허용되었다.
- 2026-09-24 — 6차 본문. 15라운드 a-z 검토 논의(`reviews/round-15-decisions.md`)를 반영했다. 평면 `&` 축약과 `computed` 별칭을 없애고 폼 전용 키를 그룹 객체 셋 `controls`·`options`·`presentation` 안에만 둔다(소유자: "숏컷을 모두 없애고 중첩 객체로 하는 게 빼기도 편하고 나중에 서버 스키마랑 클라이언트 스키마를 병합하기도 편하겠지"). 식의 기준점을 호스트로 되돌렸다(소유자: "각 node는 그 자체로 행위의 원천이자 네임스페이스"). 제어 키를 네 부류(형용사·명사·동사·선언)와 형으로 적고 `injectTo`를 명사로 옮겼다. 13라운드 답 3의 경계와 14라운드 O-9의 닫힌 목록을 대체했다. 파일 이름을 `0003-ampersand-namespace.md`에서 바꿨다.
- 2026-09-24 — 13라운드 소유자 답(`reviews/round-13-owner-answers.md`)을 반영했다: 코어에 글로벌 잠금 없음, 나감의 비움(선택, 기본 유지), 같은 종류 규칙의 문서 순서.
- 2026-09-23 — 5차 본문. 원리 원장 5차(`03-mental-model.md`)와 10라운드 소유자 답(`reviews/round-10-owner-answers.md`)에 맞췄다. "FE 전용 키워드"를 **예약 층**(값과 UI를 제어하는 층)으로 다시 정의하고 JSON Schema 층과 나눴다. 키마다 뜻과 정착 단계를 표로 적었다. `&if`는 사라지는 것이 아니라 조각 범위의 게이트로 흡수된다. `unsetValue`(옛 이름 `clearValue`, 12라운드)·`resetInteraction`(옛 `pristine`)·`children`·`discriminator`를 더했다. 조각 범위 제어를 적었다. `open-questions.md` Q4를 닫았다.
- 2026-09-22 — 1라운드 개정에서 "폼 전용 키를 기본은 제거하지 않는다"로 적었던 것을 되돌렸다. 그 보호가 없으면 순환하는 객체를 값으로 가진 키 때문에 `ajv.compile`이 죽는다(`reviews/round-2.md` S1).

## 맥락

오늘 폼 전용 키는 접두사가 제각각이다. `&if`·`&active`·`&visible` 같은 `&` 별칭, `computed.*` 컨테이너, 그리고 접두사 없는 `virtual`·`virtualRequired`·`FormTypeInput`·`FormTypeInputProps`·`FormTypeRendererProps`·`options`·`injectTo`·`errorMessages`·`formType`·`propertyKeys`·`terminal`이 섞여 있다.

`computed.X`와 `&X`는 같은 여덟 키(`watch`, `active`, `visible`, `readOnly`, `disabled`, `pristine`, `derived`, `if`)의 두 철자다. 불리언 키의 해석 순서는 루트 스키마의 최상위 키 > 노드 자신의 최상위 키 > `computed.X` > `&X`이다(`checkComputedOptionFactory.ts:22-26`). 분기의 `if`는 `computed.if`가 `&if`를 이긴다(`extractConditionInfo.ts:44-45`). 오늘 코드는 분기의 `const`·`enum`을 판별식으로 자동 감지해 `&if`와 결합한다(`getExpressionFromSchema.ts:35-51`).

`stripSchemaExtensions`는 이 가운데 여섯 개만 지우므로 나머지는 검증기에 도달하고, AJV는 `strictSchema: false`여야 돈다(`01-current-structure.md` §4-2).

15라운드에 소유자가 물은 것은 셋이었다. 제어 키의 품사와 형이 일관된가, `virtual` 같은 맨 키도 사용자에게는 폼 제어인데 왜 접두가 없는가, 그리고 그룹으로 묶는다면 `&` 축약은 오히려 혼란을 주지 않는가. 이 문서는 그 답이다.

## 결정

### 1. 두 층

| 층 | 무엇 | 하는 일 | 하지 않는 일 |
| --- | --- | --- | --- |
| JSON Schema 층 | 표준 키워드 전부. 맨 키는 모두 이 층의 것이다 | 검증기에 그대로 간다. 폼은 노드 트리의 모양을 정하는 문법(`type`, `properties`, `items`, `prefixItems`, `if/then/else`, `allOf` 항목, `oneOf`·`anyOf`의 분기)와 표준 `readOnly`만 읽는다(P1′, 원장 §1.4). 모르는 맨 키는 확장 키워드로 보아 검증기에 넘기고 폼은 읽지 않는다 | 값을 채우지도 바꾸지도 지우지도 않는다. 표준 `default`는 노드가 생길 때 채움의 원천으로만 읽히고, 표준 `readOnly`는 잠금으로 읽힌다 |
| 예약 층 | 폼 전용 키 전부. 그룹 객체 셋 안에만 있다. `controls`(값·형상을 때에 따라 바꾸는 규칙과 정책. 정착 루프가 읽는다), `options`(값·형상의 정적 설정. 청사진과 투영이 읽는다), `presentation`(보이는 것. 렌더 계층만 읽는다(청사진은 `presentation`을 읽지 않는다. 인라인 `FormTypeInput`의 암묵 터미널은 렌더 계층이 청사진에 넘기는 판정 함수가 정한다, 17라운드 스웜 수렴(편집자 결정))). `controls`·`options` 안의 모르는 키는 청사진 오류다. `presentation`의 모르는 키는 플러그인 자유 칸이다. | 값과 UI를 제어한다(축 6항(`controls`의 키는 값을 제어하는 층이다)). 게이트, 잠금과 숨김, 값의 출처, 에지에서의 동작, 자식 집합 제어, 명시 판별, 정적 형상, 표현 | 판정에 닿지 못한다(G2). 검증기는 예약 층의 키를 보지 않는다 |

기준은 사용자가 보는 것 둘이다. 값·형상을 바꾸는가 아니면 보이는 것만 바꾸는가, 그리고 때에 따라 바뀌는가 아니면 정적인가. "코어가 읽는가"는 구현의 경계라 기준이 아니다. `trim`은 15라운드 결정 4대로 `options`의 닫힌 목록에 둔다. 포커스 아웃 때 저장값을 자르며 입력마다 자르지 않는다(입력 중에 공백을 칠 수 있어야 한다). 판단은 문자열 동작 행의 `finishInput` 칸에 두고, 어댑터는 타입을 모르는 입력 마침 신호(`finishInput`)만 보낸다. 자른 값은 사용자 입력과 같은 쓰기(입력 출처)이며 core의 자동 쓰기가 아니고, 현재 값과 같으면 쓰지 않는다(17라운드 소유자 답 R17-3, ADR 0013). 이 쓰기가 바깥 오류를 지우고 dirty를 표시하는지는 18라운드 안건이다.

| 그룹 | 뜻 | 읽는 이 | 키 |
| --- | --- | --- | --- |
| `controls` | 값·형상을 **때에 따라** 바꾸는 규칙과 정책 | 정착 루프 | `active` `visible` `readOnly` `disabled` `default` `derived` `injectTo` `unsetValue` `resetInteraction` `unsetOnInactive` `children` `discriminator` `watch` |
| `options` | 값·형상의 **정적** 설정 | 청사진과 투영 | `terminal` `virtual` `propertyKeys` `omitEmpty` `omitTrailing` `trim`(포커스 아웃 때 문자열 동작 행이 자른다, 17라운드 소유자 답 R17-3) |
| `presentation` | 보이는 것 | 렌더 계층만(청사진은 `presentation`을 읽지 않는다. 인라인 `FormTypeInput`의 암묵 터미널은 렌더 계층의 판정 함수가 정한다) | `formType` `FormTypeInput` `FormTypeInputProps` `FormTypeRendererProps` `errorMessages`, 플러그인 자유 칸(`trim`은 `options`의 키다. `presentation`에 적은 `trim`은 `controls`·`options`의 키 이름이라 개발 모드 경고 `PRESENTATION_KEY_SUSPECT`(가칭)의 대상이다, ADR 0014 4판) |

그룹 이름은 명사이고 수는 뜻을 따른다. 셀 수 있는 항목의 지도는 복수(`controls`, `options`. JSON Schema가 `properties`·`$defs`처럼 이름 붙은 항목의 지도를 복수로 쓰는 관례와 같다), 하나의 면은 단수(`presentation`).

병합은 그룹 단위로 원장 §4의 병합표를 적용한다(ADR 0005 §5, 15라운드).

JSON Schema 층의 표현은 예약 층의 표현으로 대체할 수 있어야 한다(축 7항(JSON Schema 표현은 `controls` 표현으로 대체할 수 있어야 한다)). `if/then/else`의 조각은 조각 객체의 `controls.active`로, 표준 `default`는 `controls.default`로, 표준 `readOnly`는 `controls.readOnly`로, `oneOf`·`anyOf` 분기의 `const`·`enum`은 `controls.discriminator`로 옮길 수 있다.

`controls.active`가 거짓이어서 값이 방출에서 빠진 결과를 검증기가 어떻게 판정하는지는 스키마 작성자의 책임이다 — 소유자: "active를 쓰면 값이 제거되는데, 그건 사용자 책임으로 생각한다. 어쨌거나 유효성 검증에 직접 개입하는 건 아니니." 잘못된 스키마에 대해 폼은 개발 모드에서 고지할 의무만 진다(소유자 답 A-2).

### 2. 철자 하나 — 그룹 객체만

- 제어 키는 `controls` 안에만 적는다. 평면 `&키` 축약과 `computed` 별칭은 없다(15라운드). 그룹이 "이 키는 폼의 것"이라는 표시를 하므로 `&`가 하던 둘째 일은 사라졌고, 남은 평평한 철자 하나를 위해 우선순위 규칙·이중 타입·이중 문서를 치르는 것은 G4(하나의 개념에 하나의 장치)에 걸린다. 서버 스키마에 넘길 때는 그룹 셋을 지우면 끝이고, 서버 스키마와 클라이언트 스키마를 합칠 때는 그룹 셋만 덧붙이면 된다.
- 표준 키워드와 `controls`의 키는 다른 층의 두 선언이다. `controls.readOnly`는 표준 `readOnly`의 표현식 판이고, `controls.default`는 표준 `default`보다 앞서는 채움의 원천(값)이다. 그룹 아래라 이름이 같아도 구별된다.
- 형용사·동사 키와 `controls.derived`의 문자열 값은 언제나 식이다. 문자열 상수는 `"'KRW'"`처럼 따옴표 안에 적는다. `controls.default`는 값이고, 선언 부류의 문자열은 식이 아니다(`discriminator`는 키 이름, `watch`는 경로)(§3).

```json
{
  "type": "object",
  "properties": { "kind": { "type": "string", "enum": ["card", "bank"] }, "mode": { "type": "string" }, "locked": { "type": "boolean" } },
  "controls": {
    "active": "./mode !== 'hidden'",
    "children": [{ "targets": ["kind"], "controls": { "readOnly": "./locked" } }]
  },
  "options": { "propertyKeys": ["kind"], "omitEmpty": true },
  "presentation": { "formType": "card", "FormTypeRendererProps": { "label": "결제" } }
}
```

### 3. `controls`의 키 — 부류·형·정착 단계

부류가 형과 동작을 예측하게 한다. 형용사는 참인 동안 유지되는 상태, 명사는 값의 출처, 동사는 참이 되는 순간의 동작, 선언은 구조다.

| 부류 | 형 | 키 |
| --- | --- | --- |
| 형용사 | `boolean` 또는 식→`boolean`. 참인 동안 | `active` `visible` `readOnly` `disabled` `unsetOnInactive` |
| 명사 | 값의 출처 | `default`(값), `derived`(식→값), `injectTo`(함수→`{ 경로: 값 }`. 남에게 주는 값의 출처) |
| 동사 | `boolean` 또는 식→`boolean`. 참이 되는 순간 | `unsetValue` `resetInteraction` |
| 선언 | 구조 | `children`(배열), `discriminator`(문자열), `watch`(문자열 배열) |

단계는 ADR 0007의 작업 루프(표시 → 계산 → 파생 → 전이 → 커밋 → 통지 → 검증)의 이름이다.

| 키 | 뜻 | 단계 | 부류 |
| --- | --- | --- | --- |
| `active` | 게이트. 거짓이면 그 노드는 형상에 없다 — 숨겨지고 방출에서 빠진다. 원본은 기본으로 남아 `getInactiveValues`로 읽는다. 나감 정책 키를 켜면 나갈 때 한 번 비운다(원장 §3). 노드 스키마에 쓰면 노드 게이트, 조각 객체에 쓰면 조각 게이트이며, 두 범위는 한 장치다. 거짓에서 참이 되면 노드가 생기므로 그때 없음이면 채운다 | 계산 — 호스트 바퀴 안에서 `if` 가드와 같이 평가 | 형용사 |
| `visible` | 거짓이면 숨기기만 한다. 방출은 그대로다. 전환은 노드 생성이 아니다 | 계산의 끝 | 형용사 |
| `readOnly`, `disabled` | 잠금. 그 노드에만 걸린다. 값·형상·방출을 바꾸지 않는다 | 계산의 끝에서 한 번(코어에 글로벌 없음) | 형용사 |
| `unsetOnInactive` | 나감 정책이 참으로 정해진 노드가 나갈 때 원본을 한 번 비운다. 기본 꺼짐. 네 층(노드 > `children` 항목의 `controls` > 조각의 `controls` > Form 속성), 같은 층은 하나라도 유지면 유지. 나가는 객체·분기에 켠 정책은 함께 나가는 하위 트리로 내려가고, 자손이 스스로 적은 선언이 가까운 순서로 이긴다(17라운드 소유자 답 R17-2 ㄴ, 08 §8.4) | 전이 | 형용사(어느 선언이 걸리는가도, 걸린 선언이 식일 때의 값도 직전 커밋의 것이며 나가는 순간 새로 평가하지 않는다. Form 속성은 `boolean`만) |
| `default` | 노드가 생길 때 값이 없음이면 채우는 원천. 표준 `default`보다 앞선다(`controls.default` > `default` > 없음). 이미 있던 노드는 다시 채우지 않는다 | 전이 | 명사(값) |
| `derived` | 의존 값이 바뀌는 에지에서 자기 값을 다시 계산해 원본을 덮는다. 사용자가 쓴 값은 다음 의존 변화 또는 그 노드가 다시 생길 때까지 남는다 | 파생 | 명사(식) |
| `injectTo` | 자기 방출 값이 직전 커밋과 다를 때(에지) 다른 노드를 덮는다. 로드에는 직전 값이 없으므로 발화한다. 이름은 원천에 적고 대상을 가리키므로 방향을 남긴다(`inject`만 남기면 방향이 읽히지 않는다. 15라운드) | 파생 | 명사(함수) |
| `unsetValue` | 식이 거짓에서 참이 되는 에지에서 자기 값을 없음으로 만든다. 로드에서는 로드된 값으로 평가해 참이면 지운다. 지운 뒤의 입력은 남는다. 참에서 거짓이 되면 아무 일도 하지 않는다(값을 되살리지 않는다). 둘째 발화원은 정책이 참으로 정해진 노드의 나감이다(원장 §3) | 파생(식), 전이(나감) | 동사 |
| `resetInteraction` | 식이 참이 되면 `dirty`·`touched`를 초기화한다. 값은 건드리지 않는다. 옛 이름 `pristine` | 커밋 | 동사 |
| `children` | 부모가 이름으로 가리킨 직계 자식에 제어를 건다. 형태는 `[{ targets: [...], controls: { readOnly, disabled, visible, active, default, derived, unsetValue, resetInteraction, unsetOnInactive } }]`이다. `targets`와 `controls`를 나누고, `controls`에는 상태 키뿐 아니라 값 키도 둔다(소유자 답 14·15). 안쪽 `controls`는 닫힌 목록이며 `children`·`injectTo`·`discriminator`·`watch`는 들지 않는다. 한 홉짜리 장치라 손자에 걸려면 자식 스키마에 `controls.children`을 적는다 | 안쪽 `controls`의 각 키가 위 행의 단계를 따른다 | 선언 |
| `discriminator` | 작성자가 union 호스트에 적은 판별 키 이름(`"discriminator": "kind"`). 청사진이 각 분기의 그 키의 `const`·`enum`을 읽어 분기별 `active: "./kind === 값"`으로 바꾸고 그 키의 분기 선언을 게이트 없는 선언으로도 취급해 끌어올린다(14라운드 O-1). 분기 스키마(`kind: { const }`, `required`)는 고치지 않는다(ADR 0005 §4) | 청사진 — 상태와 작업 루프를 바꾸지 않는다 | 선언 |
| `watch` | 의존 경로 선언. 값과 형상을 바꾸지 않는다. 경로의 값은 공개 prop `watchValues`(위치 배열)로 입력에 전달된다. 선언이 여럿이면 의존은 합집합, `watchValues`는 유효 스키마의 것(나중 승) | 청사진과 표시 | 선언 |

**값 조작 셋의 대응.** 없는 값 채우기는 채움(`controls.default`·`default`)이다. 있는 값 바꾸기는 `controls.derived`(자기)와 `controls.injectTo`(남)다. 있는 값 지우기는 `controls.unsetValue`(원본에서)와 `controls.active: false`(방출에서)다. 런타임에 "없음일 때만 채우는" 별도 키는 두지 않는다(소유자 답 11). 없음으로 만드는 장치는 `controls.unsetValue` 하나이고 발화원이 둘이다. 하나는 식의 거짓→참이고, 다른 하나는 정책이 참으로 정해진 노드의 나감이다. 정책 키(`unsetOnInactive`, 이름은 소유자 13라운드 확정)는 형용사 형(`boolean` 또는 식→`boolean`, 15라운드 결정 2)이며 Form 속성은 `boolean`만이다. 노드 자신 > `children` 항목의 `controls` > 조각 객체의 `controls` > Form 속성 순으로 세부가 포괄을 덮고, 같은 층에 여럿이면 하나라도 유지면 유지한다. 기본은 유지다(13라운드 답 2).

### 4. 조각 범위 제어와 식의 기준점

조각 객체(예: `allOf` 항목)에 둔 제어 키는 그 조각이 켜져 있는 동안 그 조각이 직접 선언한 호스트의 직계 자식에 걸린다(더 깊은 자손에는 그 자손을 직접 선언한 안쪽 조각의 `controls`가 걸린다). 조각 객체의 `controls.active`는 조각 게이트다. 거짓이면 그 조각의 선언과 제약이 빠지지만, 다른 켜진 조각이 선언한 같은 노드는 존재한다.

**식의 기준점(15라운드).** 모든 JSON Pointer는 그것을 선언한 노드를 기준으로 푼다. 노드는 그 자체로 행위의 원천이자 네임스페이스다. `oneOf`·`allOf`·`then` 조각, `controls.children` 항목, `controls.discriminator`가 만드는 게이트는 모두 호스트 스키마 안의 선언이므로 호스트가 기준이다. 조각은 같은 네임스페이스의 다른 표현 위치이지 다른 네임스페이스가 아니다(소유자). `if` 부속 스키마가 검증기에 의해 호스트 인스턴스에 대고 평가되는 것과 같은 자리다. 5차 본문이 조각 식의 기준을 "호스트의 직계 자식 자리"로 두었던 것은 편집자의 도출이었고 이 판에서 되돌렸다. `.`·`..`는 폼의 확장 표기이므로 폼이 정당하고 일관되게 처리한다(소유자 12라운드). 자식에 적던 식을 `controls.children`으로 옮기면 `../x`를 `./x`로 고친다.

```ts
{
  properties: { kind: { type: 'string' } },
  allOf: [{ controls: { readOnly: './locked' }, properties: { name: {}, email: {} } }],
  oneOf: [{ controls: { active: "./kind === 'card'" }, properties: { kind: { const: 'card' }, cardNumber: {} }, required: ['kind', 'cardNumber'] }],
}
```

조각 범위 제어와 `controls.children`은 조상에서 내려오는 상속이 아니라 명시한 대상에 거는 제어다.

### 5. 상태 키는 그 노드에만

코어에는 글로벌이 없다(소유자 13라운드 답 1: "글로벌 readOnly 나 disabled 같은 개념은 없애고 모든 control 필드는 자체 노드만 지원. children 그룹은 예외."). 표준 `readOnly`와 `controls`의 키는 그 노드에만 걸린다. 루트 스키마의 키는 루트 노드의 로컬 키이며, 오늘 루트 키 다섯(`readOnly`·`disabled`·`active`·`visible`·`pristine`)의 특수 처리는 사라진다(이주). 조상의 상태는 자손에 상속되지 않는다(소유자 답 13). 그래서 터미널이 아닌 객체 노드를 대상으로 한 잠금은 입력이 없으므로 효과가 없고(표준 `readOnly`는 청사진 경고), 배열 노드의 잠금은 렌더 계층이 아이템 추가·삭제·이동 입력에 적용하며, 터미널 객체·배열은 입력이 있으므로 리프와 같다. `active`·`visible`은 구조상 하위 트리를 가린다(원장 §4). 자손을 거는 길은 부모의 `controls.children`과 켜진 조각의 `controls`뿐이다(§4). Form 속성 `readOnly`·`disabled`는 렌더 계층이 참일 때만 거는 전체 잠금이며 코어의 상태가 아니다(P5).

### 6. 같은 대상 규칙과 로드 스위치

- 파생 단계에서 여러 자동 쓰기가 한 노드에 쓰려 하면 라운드마다 대상 노드마다 하나만 적용한다. 순위는 `unsetValue` > `derived` > `injectTo` > 채움, 같은 순위끼리는 원천(선언) 노드의 문서 순서에서 나중이 이기고, 같은 노드에 걸린 선언끼리는 층(조각의 `controls` < `children` 항목 < 노드 자신)에서 세부가 이기며, 같은 층이면 조각의 전순서에서 나중이 이긴다(소유자 답 7·16·17 "뒤가 앞을 덮는다"). 경고는 없다(13라운드 답 4). 진 쓰기는 버리고 그 에지도 소비한다. 생긴 노드의 `unsetValue`가 참이면 채우지 않는다. 한 규칙은 원천 값의 한 번의 변화에 대해 한 정착 안에서 한 번만 쓴다. 규칙의 전문은 ADR 0007에 있다.
- 호출이 일으킨 예약 층의 자동 쓰기 전부(채움, `derived`, `injectTo`, `unsetValue`, 나감의 비움)는 `SetValueOption.DisableAutomaticWrites`로 끄고 `SetValueOption.EnableAutomaticWrites`로 켠다. 로드 값 자체는 막지 않는다. 로드뿐 아니라 `Merge`에 준 비트도 듣는다(원장 §3). `active`의 방출 제외는 쓰기가 아니라 투영이므로 범위 밖이고, 정책이 참으로 정해진 노드의 나감 비움은 범위 안이다. 둘 다 없으면 Form 속성 `disableAutomaticWrites`를 따르고, 둘 다 주면 억제가 이긴다. 전문은 ADR 0013에 있다.
- 예약 층은 순환을 금지하지 않는다. 상한을 넘기면 오류를 알린다(ADR 0007의 예산). 소유자: "구태여 막지 않을 뿐이지 루프를 만드는 걸 권하는 설계는 절대 아니다."

### 7. 검증기에 넘기기 전의 제거

- **키워드 위치의 그룹 객체 셋 `controls`·`options`·`presentation`을 지운다.** 규칙 하나다. 위치 규칙은 현행 유지이고 목록은 그룹 셋으로 닫힌다. 오늘 `stripSchemaExtensions`가 지우는 키는 `FormTypeInput`·`FormTypeInputProps`·`FormTypeRendererProps`·`errorMessages`·`options`·`injectTo` 여섯뿐이고 `&` 키·`computed`·`virtual`·`formType`·`terminal`·`placeholder`·`propertyKeys`는 검증기에 간다. 그룹 셋으로 옮기는 것이 이주 항목이다(ADR 0001). 지우는 이유는 판정 때문이 아니라 컴파일 때문이다 — 그 키들의 값에 순환하는 객체가 있으면 `ajv.compile`이 죽는다(`reviews/round-2.md` S1).
- 맨 키 가운데 폼이 모르는 것은 지우지 않는다. 그것은 JSON Schema 층의 것(확장 키워드)이고 검증기의 몫이다. strict 모드는 기본이 아니다. 소유자는 그룹 셋 외에도 커스텀 키를 많이 쓰고, 그것들은 라이브러리가 열거할 수 없어 지우지 못한다.
- 제거는 **키워드 위치에서만** 한다. 이름이 `controls`인 프로퍼티(`properties`·`$defs`·`patternProperties`·`dependentSchemas`의 키), `const`·`enum`·`default`·`examples` 안의 데이터는 키워드가 아니라 작성자의 내용이다. 구분 없이 지우면 판정이 바뀐다(`reviews/round-1.md` R4, 세 리뷰어가 독립적으로 실행). 현재 `stripSchemaExtensions`는 `JSONSchemaScanner`로 위치를 인식하므로 이 성질을 이미 갖고 있다. 어디가 키워드 위치인지는 방언마다 다르므로 `open-questions.md` Q9(방언 범위)에 걸린다.
- BE가 같은 스키마를 자기 검증기에 넣을 때: 미지 키워드를 무시하는 검증기면 아무것도 하지 않아도 되고, strict면 같은 그룹 셋을 지운다.

### 8. 이름 규칙 — 그룹과 렌더 계층

스키마의 그룹 이름 규칙은 §1이다. 렌더 계층의 이름은 같은 논의에서 정했고 전문은 `08-design-a-to-z.md` §13에 있다. 규칙 셋이다. `FormType…`은 노드 단위 조각과 그것을 그리는 것이고 플러그인이 등록하며 Form 속성이 덮고 `presentation`이 노드별로 고르거나 props를 준다. `…Renderer` 접미는 그리는 것이다. `Form.X`는 `path`를 받는 합성 API이고 props는 `FormXProps`이며 안에서 `FormTypeXRenderer`를 부른다(`Form.Render`는 소비자가 직접 그린다). 그래서 `presentation`의 여섯 키는 모두 노드 단위로 렌더 계층이 읽는다.

## 남는 것과 사라지는 것

- **남는다:** `controls` 식 시스템 전체 — JSON Pointer로 다른 노드의 값을 읽는 동적 함수와 §3의 키. G2(FE 표현력 유지)의 근거다. 오늘의 `computed` 컨테이너는 `controls`라는 이름으로 남는다.
- **흡수된다:** `&if`와 `computed.if`는 조각 범위의 `controls.active`로 흡수된다. 분기 객체에 `&if`를 쓰던 스키마는 같은 식을 그 분기 객체의 `controls.active`로 옮긴다. 기준점은 둘 다 호스트라 식은 그대로다. JSON의 `if`가 이미 조각 게이트이므로 `&if`를 두면 같은 게이트의 셋째 철자가 되어 G4에 걸린다.
- **사라진다:** 평면 `&키` 축약 전부. 분기의 `const`·`enum`을 판별식으로 자동 감지하는 것(`getExpressionFromSchema.ts:35-51`). 폼은 `oneOf`·`anyOf`로 분기를 고르지 않는다(P1′). 판별이 필요하면 작성자가 `controls.discriminator`나 분기별 `controls.active`를 적는다.
- **이주 항목:** `computed` → `controls`(별칭 없음), `&X` → `controls.X`, `&if`·`computed.if` → 분기 객체의 `controls.active`, 판별식 자동 감지 → `controls.discriminator` 또는 분기별 `controls.active`, `&pristine`·맨 키 `pristine` → `controls.resetInteraction`, `injectTo` → `controls.injectTo`, 맨 키 `disabled`·`visible`·`active` → `controls.*`, 루트 스키마 키 다섯의 특수 처리 제거, 맨 키 `terminal`·`virtual`·`propertyKeys` → `options.*`, 맨 키 `formType`·`FormTypeInput`·`FormTypeInputProps`·`FormTypeRendererProps`·`errorMessages`와 `options`의 플러그인 자유 칸 → `presentation.*`, `options.trim`은 `options`에 남고 포커스 아웃 때 문자열 동작 행이 자른다(17라운드 소유자 답 R17-3), 자식의 식을 `controls.children`으로 옮길 때 `../x` → `./x`, 플러그인 키 `FormGroup`·`FormLabel`·`FormInput`·`FormError` → `FormTypeGroupRenderer`·`FormTypeLabelRenderer`·`FormTypeInputRenderer`·`FormTypeErrorRenderer`, Form 속성 `CustomFormTypeRenderer` → `FormTypeGroupRenderer`(같은 이름의 Form 속성 셋이 새로 생긴다), `ChildNodeComponentProps`와 `FormGroupProps`의 prop `FormTypeRenderer`(와 `OverridableFormTypeInputProps`의 Omit 목록) → `FormTypeGroupRenderer`.

## 미결

- `controls.children`의 대상별 식과 값 키의 세부, 조각에서만 선언된 자식을 `targets`로 가리킬 수 있는지(`03-mental-model.md` §6). 조각 객체에 값 키(`unsetValue`, `default`, `resetInteraction`)를 둘 때의 세부도 같이 정한다. 조각의 `controls`에 둔 식 규칙이 나감 에지에서 발화하는 세부도 남는다(원장 §6).
- 로컬 선언끼리의 결합의 소유자 확인. 원장 §4는 노드 자신의 표준 `readOnly`, `controls.readOnly`, 켜진 조각의 범위 제어, 부모의 `controls.children` 항목이 겹치면 잠금(`readOnly`·`disabled`)은 하나라도 참이면 잠기고 표시(`active`·`visible`)는 모두 참이어야 켜진다고 정했다. 코어에 글로벌은 없고, Form 속성의 전체 잠금은 렌더 계층이 그 결과 위에 OR한다(13라운드 답 1). 편집자 판정이며 소유자 확인 대상이다(원장 §7).
- `controls.active` 표현식이 다른 호스트를 읽을 때의 평가 순서(`03-mental-model.md` §6, ADR 0007).
- `virtualRequired`는 `options`의 키 목록에 없어 그룹 안에 둘 수 없다. 오늘 `required` 재작성이 만드는 키이므로(`transformCondition.ts:40-52`) 재작성을 버리면 함께 사라지는지 확인한다.
- `presentation.FormTypeInput`이 React 컴포넌트 참조를 스키마에 넣는 현재 방식은 스키마를 직렬화할 수 없게 한다. 터미널 판정은 렌더 계층의 판정 함수로 옮겨 core는 React 구성 요소를 판정하지 않는다(17라운드 스웜 수렴(편집자 결정), 통보 1은 17라운드 소유자 답으로 허용). 남는 것은 스키마를 직렬화할 수 없다는 점과, 오늘 core가 `ValidationManager` → `app/plugin`의 `PluginManager`를 거쳐 React 구성 요소 모듈을 런타임에 가져오는 import의 분리다(PR-4 전 설계 항목, `01-current-structure.md` §6) — `open-questions.md` Q8.
- `controls.injectTo` 함수의 `ctx` 인자와 반환 모양의 세부는 식 언어 명세(원장 §6)에 걸려 있다.

## 되돌림 가능성

이름은 구현 초기에는 쉽게 바꿀 수 있다. 공개 후에는 소비자 스키마 전체에 영향을 준다.
