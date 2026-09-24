# ADR 0003 — 예약 층: `&` 키와 `control` 컨테이너로 값과 UI를 제어한다

상태: 일부 수락 (5차 본문). 두 층의 구분(소유자 축 6항(`&` 키는 값을 제어하는 층이다)), 두 철자의 유지(축 9항(`control`과 `&`의 동시 제공)), 상태 키는 그 노드에만(글로벌 없음, 축 10항(글로벌과 로컬의 경합, 13라운드 개정) 개정, 소유자 답 13, 13라운드 답 1), 키 이름(`07-conclusions.md` §6.1), 단계와 같은 대상 규칙의 순위(§5.0, 13라운드 답 4), 접두 규칙(제어 키만 `&`, 13라운드 답 3)은 소유자가 확정했다. 키워드 위치에서만 제거하는 규칙은 현행 유지다. 방향은 소유자가 발의했다 — "form의 표시 제어의 자유권은 모두 & 키워드로 모으고, 이들은 FE에 귀속, 유효성 검증에 개입하지 않도록 한다."

## 변경 이력

- 2026-09-24 — 13라운드 소유자 답(`reviews/round-13-owner-answers.md`)을 반영했다: 코어에 글로벌 잠금 없음, 나감의 비움(선택, 기본 유지), 접두 규칙(제어 키만 `&`), 같은 종류 규칙의 문서 순서.
- 2026-09-23 — 5차 본문. 원리 원장 5차(`03-mental-model.md`)와 10라운드 소유자 답(`reviews/round-10-owner-answers.md`)에 맞췄다. "FE 전용 키워드"를 **예약 층**(값과 UI를 제어하는 층)으로 다시 정의하고 JSON Schema 층과 나눴다. `computed` 컨테이너를 없애지 않고 `control`로 이름만 바꿔 평면 `&키`와 함께 둔다. 키마다 뜻과 정착 단계를 표로 적었다. `&if`는 사라지는 것이 아니라 조각 범위의 `&active`로 흡수된다. `&unsetValue`(옛 이름 `&clearValue`, 12라운드)·`&resetInteraction`(옛 `&pristine`)·`&children`·`&discriminator`를 더했다. 조각 범위 제어와 글로벌 > 로컬 규칙을 적었다. `open-questions.md` Q4를 닫았다.
- 2026-09-22 — 1라운드 개정에서 "폼 전용 키를 기본은 제거하지 않는다"로 적었던 것을 되돌렸다. 그 보호가 없으면 순환하는 객체를 값으로 가진 키 때문에 `ajv.compile`이 죽는다(`reviews/round-2.md` S1).

## 맥락

오늘 폼 전용 키는 접두사가 제각각이다. `&if`·`&active`·`&visible` 같은 `&` 별칭, `computed.*` 컨테이너, 그리고 접두사 없는 `virtual`·`virtualRequired`·`FormTypeInput`·`FormTypeInputProps`·`FormTypeRendererProps`·`options`·`injectTo`·`errorMessages`·`formType`·`propertyKeys`가 섞여 있다.

`computed.X`와 `&X`는 같은 여덟 키(`watch`, `active`, `visible`, `readOnly`, `disabled`, `pristine`, `derived`, `if`)의 두 철자다. 불리언 키의 해석 순서는 루트 스키마의 최상위 키 > 노드 자신의 최상위 키 > `computed.X` > `&X`이다(`checkComputedOptionFactory.ts:22-26`). 분기의 `if`는 `computed.if`가 `&if`를 이긴다(`extractConditionInfo.ts:44-45`). 오늘 코드는 분기의 `const`·`enum`을 판별식으로 자동 감지해 `&if`와 결합한다(`getExpressionFromSchema.ts:35-51`).

`stripSchemaExtensions`는 이 가운데 여섯 개만 지우므로 나머지는 검증기에 도달하고, AJV는 `strictSchema: false`여야 돈다(`01-current-structure.md` §4-2).

## 결정

### 1. 두 층

| 층 | 무엇 | 하는 일 | 하지 않는 일 |
| --- | --- | --- | --- |
| JSON Schema 층 | 표준 키워드 전부 | 검증기에 그대로 간다. 폼은 노드 트리의 모양을 정하는 문법(`type`, `properties`, `items`, `prefixItems`, `if/then/else`, `allOf` 항목, `oneOf`·`anyOf`의 분기)와 표준 `readOnly`만 읽는다(P1′, 원장 §1.4) | 값을 채우지도 바꾸지도 지우지도 않는다. 표준 `default`는 노드가 생길 때 채움의 원천으로만 읽히고, 표준 `readOnly`는 잠금으로 읽힌다 |
| 예약 층 | `&`로 시작하는 제어 키와 그 객체 표기 `control.*`. 접두 없는 폼 전용 키(형상·투영 키와 표현 키, 닫힌 목록은 원장 §1.4)는 접두 없이 두며 정착 루프의 제어가 읽지 않는다. 접두 없는 키 가운데 코어가 읽는 것이 있다(`terminal`·`FormTypeInput`의 유무, `virtual`, `propertyKeys`, `options.omitEmpty`·`omitTrailing`) — 정착 루프의 제어가 아니므로 `&`는 붙이지 않는다(14라운드 확정. 형상·투영 키는 `terminal`, `FormTypeInput`의 유무, `virtual`, `propertyKeys`, `options.omitEmpty`·`omitTrailing`. 표현 키는 `FormTypeInputProps`, `FormTypeRendererProps`, `formType`, `errorMessages`, 그 밖의 `options`. `placeholder`는 오늘 최상위 키가 아니므로 목록에 없다) | 값과 UI를 제어한다(소유자의 축 6항(`&` 키는 값을 제어하는 층이다)). 게이트, 잠금과 숨김, 값의 출처, 에지에서의 동작, 자식 집합 제어, 명시 판별 | 판정에 닿지 못한다(G2). 검증기는 예약 층의 키를 보지 않는다 |

JSON Schema 층의 표현은 예약 층의 표현으로 대체할 수 있어야 한다(축 7항(JSON Schema 표현은 `&`로 대체할 수 있어야 한다)). `if/then/else`의 조각은 조각 객체의 `&active`로, 표준 `default`는 `&default`로, 표준 `readOnly`는 `&readOnly`로, `oneOf`·`anyOf` 분기의 `const`·`enum`은 `&discriminator`로 옮길 수 있다.

`&active`가 거짓이어서 값이 방출에서 빠진 결과를 검증기가 어떻게 판정하는지는 스키마 작성자의 책임이다 — 소유자: "active를 쓰면 값이 제거되는데, 그건 사용자 책임으로 생각한다. 어쨌거나 유효성 검증에 직접 개입하는 건 아니니." 잘못된 스키마에 대해 폼은 개발 모드에서 고지할 의무만 진다(소유자 답 A-2).

### 2. 두 철자 — 평면 `&키`와 컨테이너 `control`

- 예약 층의 키는 평면 `&키`와 객체 컨테이너 `control.키`의 두 철자로 쓸 수 있다(소유자의 축 9항(`control`과 `&`의 동시 제공)). `control`은 오늘의 `computed`를 대신하는 이름이다(`07-conclusions.md` §6.1).
- `control.readOnly`와 `&readOnly`는 **한 선언의 두 철자**다. 한 노드에 둘 다 있으면 `control`이 이긴다. 오늘 `computed`가 `&`를 이기던 규칙(`checkComputedOptionFactory.ts:25-26`) 그대로다.
- 표준 키워드와 `&키`는 다른 층의 두 선언이다. `&키`는 표준 키워드의 표현식 판이다(`default`와 `&default`, `readOnly`와 `&readOnly`).
- `&` 키의 문자열 값은 언제나 식이다. 문자열 상수는 `"'KRW'"`처럼 따옴표 안에 적는다.

### 3. 키 목록 — 뜻과 정착 단계

단계는 ADR 0007의 작업 루프(표시 → 계산 → 파생 → 전이 → 커밋 → 통지 → 검증)의 이름이다.

| 키 | 뜻 | 단계 | 부류 |
| --- | --- | --- | --- |
| `&active` | 게이트. 거짓이면 그 노드는 형상에 없다 — 숨겨지고 방출에서 빠진다. 원본은 기본으로 남아 `getInactiveValues`로 읽는다. 나감 정책 키를 켜면 나갈 때 한 번 비운다(원장 §3). 노드 스키마에 쓰면 노드 게이트, 조각 객체에 쓰면 조각 게이트이며, 두 범위는 한 장치다. 거짓에서 참이 되면 노드가 생기므로 그때 없음이면 채운다 | 계산 — 호스트 바퀴 안에서 `if` 가드와 같이 평가 | 형용사(상태) |
| `&visible` | 거짓이면 숨기기만 한다. 방출은 그대로다. 전환은 노드 생성이 아니다 | 계산의 끝 | 형용사(상태) |
| `&readOnly`, `&disabled` | 잠금. 그 노드에만 걸린다. 값·형상·방출을 바꾸지 않는다 | 계산의 끝에서 한 번(코어에 글로벌 없음) | 형용사(상태) |
| `&watch` | 의존 경로 선언. 값도 표시도 바꾸지 않는다 | 청사진과 표시 | 보조 |
| `&default` | 노드가 생길 때 값이 없음이면 채우는 원천. 표준 `default`보다 앞선다(`&default` > `default` > 없음). 이미 있던 노드는 다시 채우지 않는다 | 전이 | 명사(값의 출처) |
| `&derived` | 의존 값이 바뀌는 에지에서 자기 값을 다시 계산해 원본을 덮는다. 사용자가 쓴 값은 다음 의존 변화 또는 그 노드가 다시 생길 때까지 남는다 | 파생 | 명사(값의 출처) |
| `&injectTo` | 자기 방출 값이 직전 커밋과 다를 때(에지) 다른 노드를 덮는다. 로드에는 직전 값이 없으므로 발화한다 | 파생 | 동사(동작) |
| `&unsetValue` | 식이 거짓에서 참이 되는 에지에서 자기 값을 없음으로 만든다. 로드에서는 로드된 값으로 평가해 참이면 지운다. 지운 뒤의 입력은 남는다. 참에서 거짓이 되면 아무 일도 하지 않는다(값을 되살리지 않는다). 둘째 발화원은 정책이 참으로 정해진 노드의 나감이다(원장 §3) | 파생(식), 전이(나감) | 동사(동작) |
| `&resetInteraction` | 식이 참이 되면 `dirty`·`touched`를 초기화한다. 값은 건드리지 않는다. 옛 이름 `&pristine` | 커밋 | 동사(동작) |
| `&unsetOnInactive` | 나감 정책이 참으로 정해진 노드가 나갈 때 원본을 한 번 비운다. 기본 꺼짐. 네 층(노드 > `&children` 항목의 `control` > 조각의 `control` > Form 속성), 같은 층은 하나라도 유지면 유지 | 전이 | 형용사(불리언) |
| `&children` | 부모가 이름으로 가리킨 직계 자식에 제어를 건다. 형태는 `'&children': [{ targets: [...], control: { readOnly, disabled, visible, active, default, derived, unsetValue, resetInteraction, unsetOnInactive } }]`이다. `targets`와 `control`을 나누고, `control`에는 상태 키뿐 아니라 값 키도 둔다(소유자 답 14·15) | `control` 블록 안의 각 키가 위 행의 단계를 따른다 | 범위 |
| `&discriminator` | 작성자가 union 호스트에 적은 판별 키 이름(`'&discriminator': 'kind'`). 청사진이 각 분기의 그 키의 `const`·`enum`을 읽어 분기별 `&active`로 바꾼다. 분기 스키마(`kind: { const }`, `required`)는 고치지 않는다(ADR 0005 §4) | 청사진 — 상태와 작업 루프를 바꾸지 않는다 | 선언 |
| 접두 없는 폼 전용 키(형상·투영 키와 표현 키, 닫힌 목록은 원장 §1.4) | 표현 키. 정착 루프의 제어가 읽지 않고 `&`를 붙이지 않는다(소유자 13라운드 답 3: "제어용 필드들에 대해서만 &"). 접두 없는 키 가운데 코어가 읽는 것이 있다. `terminal`과 `FormTypeInput`의 유무는 청사진이 노드 종류(터미널인가)를 정할 때, `virtual`은 형상을 만들 때, `propertyKeys`는 방출 키 순서를 정할 때, `options.omitEmpty`·`omitTrailing`은 방출 투영이 읽는다. 어느 것도 정착 루프의 제어(게이트·잠금·값 규칙)가 읽지 않으므로 `&`를 붙이지 않는다(14라운드 확정. 형상·투영 키는 `terminal`, `FormTypeInput`의 유무, `virtual`, `propertyKeys`, `options.omitEmpty`·`omitTrailing`. 표현 키는 `FormTypeInputProps`, `FormTypeRendererProps`, `formType`, `errorMessages`, 그 밖의 `options`. `placeholder`는 오늘 최상위 키가 아니므로 목록에 없다). 컴포넌트 키는 PascalCase를 유지한다. `options`는 사용자 정의 키를 담는 열린 컨테이너로 두며, 조각끼리 병합할 때 깊은 병합(`@winglet/common-utils`의 `merge`)을 한다(소유자 답 18). 검증기에 넘기기 전 제거 목록에 든다(§7) | 없음 — 작업 루프 밖 | 표현 |

**문법 규칙.** 이름의 품사가 동작을 예측하게 한다. 형용사(`active`, `visible`, `readOnly`, `disabled`)는 참인 동안 유지되는 상태다. 명사(`default`, `derived`)는 값의 출처다. 동사(`unsetValue`, `injectTo`, `resetInteraction`)는 에지에서 한 번 일어나는 동작이다.

**값 조작 셋의 대응.** 없는 값 채우기는 채움(`&default`·`default`)이다. 있는 값 바꾸기는 `&derived`(자기)와 `&injectTo`(남)다. 있는 값 지우기는 `&unsetValue`(원본에서)와 `&active: false`(방출에서)다. 런타임에 "없음일 때만 채우는" 별도 키는 두지 않는다(소유자 답 11). 없음으로 만드는 장치는 `&unsetValue` 하나이고 발화원이 둘이다. 하나는 식의 거짓→참이고, 다른 하나는 정책이 참으로 정해진 노드의 나감이다. 정책 키(`unsetOnInactive`, 소유자 13라운드 확정)는 불리언이다. 노드 자신 > `&children` 항목의 `control` > 조각 객체의 `control` > Form 속성 순으로 세부가 포괄을 덮고, 같은 층에 여럿이면 하나라도 유지면 유지한다. 기본은 유지다(13라운드 답 2).

### 4. 조각 범위 제어

조각 객체(예: `allOf` 항목)에 둔 제어 키는 그 조각이 켜져 있는 동안 그 조각이 직접 선언한 호스트의 직계 자식에 걸린다(더 깊은 자손에는 그 자손을 직접 선언한 안쪽 조각의 `control`이 걸린다). 조각 객체의 `&active`는 조각 게이트다. 거짓이면 그 조각의 선언과 제약이 빠지지만, 다른 켜진 조각이 선언한 같은 노드는 존재한다.

```ts
{
  allOf: [{ '&readOnly': '../locked', properties: { name: {}, email: {} } }],
  oneOf: [{ '&active': "../kind === 'card'", properties: { kind: { const: 'card' }, cardNumber: {} }, required: ['kind', 'cardNumber'] }],
}
```

조각 범위 제어와 `&children`은 조상에서 내려오는 상속이 아니라 명시한 대상에 거는 제어다.

### 5. 상태 키는 그 노드에만

코어에는 글로벌이 없다(소유자 13라운드 답 1: "글로벌 readOnly 나 disabled 같은 개념은 없애고 모든 control 필드는 자체 노드만 지원. children 그룹은 예외."). 표준 `readOnly`, `&` 식, `control.*`는 그 노드에만 걸린다. 루트 스키마의 키는 루트 노드의 로컬 키이며, 오늘 루트 키 다섯(`readOnly`·`disabled`·`active`·`visible`·`pristine`)의 특수 처리는 사라진다(이주). 조상의 상태는 자손에 상속되지 않는다(소유자 답 13). 그래서 터미널이 아닌 객체 노드를 대상으로 한 잠금은 입력이 없으므로 효과가 없고(표준 `readOnly`는 청사진 경고), 배열 노드의 잠금은 렌더 계층이 아이템 추가·삭제·이동 입력에 적용하며, 터미널 객체·배열은 입력이 있으므로 리프와 같다. `active`·`visible`은 구조상 하위 트리를 가린다(원장 §4). 자손을 거는 길은 부모의 `&children`과 켜진 조각의 `control`뿐이다(§4). Form 속성 `readOnly`·`disabled`는 렌더 계층이 참일 때만 거는 전체 잠금이며 코어의 상태가 아니다(P5).

### 6. 같은 대상 규칙과 로드 스위치

- 파생 단계에서 여러 자동 쓰기가 한 노드에 쓰려 하면 라운드마다 대상 노드마다 하나만 적용한다. 순위는 `&unsetValue` > `&derived` > `&injectTo` > 채움, 같은 순위끼리는 원천(선언) 노드의 문서 순서에서 나중이 이기고, 같은 노드에 걸린 선언끼리는 층(조각의 `control` < `&children` 항목 < 노드 자신)에서 세부가 이기며, 같은 층이면 조각의 전순서에서 나중이 이긴다(소유자 답 7·16·17 "뒤가 앞을 덮는다"). 경고는 없다(13라운드 답 4). 진 쓰기는 버리고 그 에지도 소비한다. 생긴 노드의 `&unsetValue`가 참이면 채우지 않는다. 한 규칙은 원천 값의 한 번의 변화에 대해 한 정착 안에서 한 번만 쓴다. 규칙의 전문은 ADR 0007에 있다.
- 호출이 일으킨 예약 층의 자동 쓰기 전부(채움, `&derived`, `&injectTo`, `&unsetValue`, 나감의 비움)는 `SetValueOption.DisableAutomaticWrites`로 끄고 `SetValueOption.EnableAutomaticWrites`로 켠다. 로드 값 자체는 막지 않는다. 로드뿐 아니라 `Merge`에 준 비트도 듣는다(원장 §3). `&active`의 방출 제외는 쓰기가 아니라 투영이므로 범위 밖이고, 정책이 참으로 정해진 노드의 나감 비움은 범위 안이다. 둘 다 없으면 Form 속성 `disableAutomaticWrites`를 따르고, 둘 다 주면 억제가 이긴다. 전문은 ADR 0013에 있다.
- 예약 층은 순환을 금지하지 않는다. 상한을 넘기면 오류를 알린다(ADR 0007의 예산). 소유자: "구태여 막지 않을 뿐이지 루프를 만드는 걸 권하는 설계는 절대 아니다."

### 7. 검증기에 넘기기 전의 제거

- **예약 층의 키는 검증기에 넘기기 전에 키워드 위치에서만 제거한다**(위치 규칙은 현행 유지다. 목록은 넓어진다. 오늘 `stripSchemaExtensions`가 지우는 키는 `FormTypeInput`·`FormTypeInputProps`·`FormTypeRendererProps`·`errorMessages`·`options`·`injectTo` 여섯뿐이고 `&` 키·`computed`·`virtual`·`formType`·`terminal`·`placeholder`·`propertyKeys`는 검증기에 간다. 목록 확대는 이주 항목이다. ADR 0001). 판정 때문이 아니라 컴파일 때문이다 — 그 키들의 값에 순환하는 객체가 있으면 `ajv.compile`이 죽는다(`reviews/round-2.md` S1). 제거 규칙은 둘이다. 하나는 키워드 위치의 `&` 접두 키 전부, `control` 컨테이너, `virtual`이다. 다른 하나는 형상·투영 키·표현 키의 닫힌 목록(§1)이다(원장 §1.4, 13라운드 답 3). `virtual`은 현행대로 `&` 없이 두되 이 목록에 넣는다(소유자 답 4, 원장 §1.4). 오늘의 제거 목록에는 없으므로 이주 항목이며, 넣는 이유는 검증기가 모르는 키워드를 거부할 수 있기 때문이다.
- strict 모드는 기본이 아니다. 소유자는 `&` 외에도 커스텀 키를 많이 쓰고, 그것들은 라이브러리가 열거할 수 없어 지우지 못한다.
- 제거는 **키워드 위치에서만** 한다. 이름이 `&secret`인 프로퍼티(`properties`·`$defs`·`patternProperties`·`dependentSchemas`의 키), `const`·`enum`·`default`·`examples` 안의 데이터는 키워드가 아니라 작성자의 내용이다. 구분 없이 지우면 판정이 바뀐다(`reviews/round-1.md` R4, 세 리뷰어가 독립적으로 실행). 현재 `stripSchemaExtensions`는 `JSONSchemaScanner`로 위치를 인식하므로 이 성질을 이미 갖고 있다. 어디가 키워드 위치인지는 방언마다 다르므로 `open-questions.md` Q9(방언 범위)에 걸린다.
- BE가 같은 스키마를 자기 검증기에 넣을 때: 미지 키워드를 무시하는 검증기면 아무것도 하지 않아도 되고, strict면 같은 규칙으로 지운다.

## 남는 것과 사라지는 것

- **남는다:** `&` 표현식 시스템 전체 — JSON Pointer로 다른 노드의 값을 읽는 동적 함수와 §3의 키. G2(FE 표현력 유지)의 근거다. `computed` 컨테이너도 `control`이라는 이름으로 남는다.
- **흡수된다:** `&if`와 `computed.if`는 조각 범위의 `&active`로 흡수된다. 분기 객체에 `&if`를 쓰던 스키마는 같은 식을 그 분기 객체의 `&active`로 옮긴다. JSON의 `if`가 이미 조각 게이트이므로 `&if`를 두면 같은 게이트의 셋째 철자가 되어 G4에 걸린다.
- **사라진다:** 분기의 `const`·`enum`을 판별식으로 자동 감지하는 것(`getExpressionFromSchema.ts:35-51`). 폼은 `oneOf`·`anyOf`로 분기를 고르지 않는다(P1′). 판별이 필요하면 작성자가 `&discriminator`나 분기별 `&active`를 적는다.
- **이주 항목:** `computed.*` → `control.*`, `&if`·`computed.if` → 분기 객체의 `&active`(기준점이 호스트에서 호스트의 직계 자식 자리로 바뀌므로 `./x`를 `../x`로 고친다), 판별식 자동 감지 → `&discriminator` 또는 분기별 `&active`, `&pristine`·맨 키 `pristine` → `&resetInteraction`, `injectTo` → `&injectTo`, 맨 키 `disabled`·`visible`·`active` → `&disabled`·`&visible`·`&active`, 루트 스키마 키 다섯의 특수 처리 제거, 표현 키는 접두 없이 유지하고 검증기 앞 제거 목록에 추가, `virtual` → 검증기 앞 제거 목록에 추가.

## 미결

- `control` 컨테이너의 타입 표면(`watch`·`children`·`default`·`unsetValue`가 드는지, `computed` 철자를 별칭으로 남기는지, `03-mental-model.md` §6). 표현 키는 제어 키가 아니므로 `control`에 들지 않는다(원장 §1.4).
- `&children`의 대상별 식과 값 키의 세부, 조각에서만 선언된 자식을 `targets`로 가리킬 수 있는지(`03-mental-model.md` §6). 조각 객체에 값 키(`&unsetValue`, `&default`, `&resetInteraction`)를 둘 때의 세부도 같이 정한다. 조각의 `control`에 둔 식 규칙이 나감 에지에서 발화하는 세부도 남는다(원장 §6).
- 로컬 선언끼리의 결합의 소유자 확인. 원장 §4는 노드 자신의 표준 `readOnly`, `&readOnly`·`control.readOnly`, 켜진 조각의 범위 제어, 부모의 `&children` 항목이 겹치면 잠금(`readOnly`·`disabled`)은 하나라도 참이면 잠기고 표시(`active`·`visible`)는 모두 참이어야 켜진다고 정했다. 코어에 글로벌은 없고, Form 속성의 전체 잠금은 렌더 계층이 그 결과 위에 OR한다(13라운드 답 1). 편집자 판정이며 소유자 확인 대상이다(원장 §7).
- `&active` 표현식이 다른 호스트를 읽을 때의 평가 순서(`03-mental-model.md` §6, ADR 0007).
- `virtualRequired`가 `virtual`과 같은 제거 규칙을 따르는지는 정하지 않았다.
- `FormTypeInput`이 React 컴포넌트 참조를 스키마에 넣는 현재 방식은 스키마를 직렬화할 수 없게 하고, core가 React를 아는 유일한 런타임 지점을 만든다(`01-current-structure.md` §6). 이 결합을 유지할지(`FormTypeInput`은 표현 키로 접두 없이 남는다, 13라운드 답 3) — `open-questions.md` Q8.

## 되돌림 가능성

이름은 구현 초기에는 쉽게 바꿀 수 있다. 공개 후에는 소비자 스키마 전체에 영향을 준다.
