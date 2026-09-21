# ADR 0003 — FE 전용 키워드를 `&` 네임스페이스로 통일

상태: 제안. 방향은 소유자가 발의했다 — "form의 표시 제어의 자유권은 모두 & 키워드로 모으고, 이들은 FE에 귀속, 유효성 검증에 개입하지 않도록 한다."

## 맥락

현재 폼 전용 키는 접두사가 제각각이다. `&if`·`&active`·`&visible` 같은 `&` 별칭, `computed.*` 컨테이너, 그리고 접두사 없는 `virtual`·`virtualRequired`·`FormTypeInput`·`FormTypeInputProps`·`FormTypeRendererProps`·`options`·`injectTo`·`errorMessages`·`formType`·`propertyKeys`.

`stripSchemaExtensions`는 이 가운데 여섯 개만 지우므로 나머지는 검증기에 도달하고, AJV는 `strictSchema: false`여야 돈다(`01-current-structure.md` §4-2).

## 결정

FE 전용 키워드는 모두 `&`로 시작한다.

- "무엇이 FE 전용인가"가 접두사 하나로 기계적으로 결정된다.
- **폼 전용 키는 검증기에 넘기기 전에 키워드 위치에서만 제거한다**(현행 유지, ADR 0001). 판정 때문이 아니라 컴파일 때문이다 — 그 키들의 값에 순환하는 객체가 있으면 `ajv.compile`이 죽는다(`reviews/round-2.md` S1). 1라운드 개정에서 "기본은 제거하지 않는다"로 적었던 것은 이 보호를 없애는 것이어서 되돌렸다.
- strict 모드는 기본이 아니다. 소유자는 `&` 외에도 커스텀 키를 많이 쓰고, 그것들은 라이브러리가 열거할 수 없어 지우지 못한다.
- 제거는 **키워드 위치에서만** 한다. 이름이 `&secret`인 프로퍼티(`properties`·`$defs`·`patternProperties`·`dependentSchemas`의 키), `const`·`enum`·`default`·`examples` 안의 데이터는 키워드가 아니라 작성자의 내용이다. 구분 없이 지우면 판정이 바뀐다(`reviews/round-1.md` R4, 세 리뷰어가 독립적으로 실행). 현재 `stripSchemaExtensions`는 `JSONSchemaScanner`로 위치를 인식하므로 이 성질을 이미 갖고 있다. 어디가 키워드 위치인지는 방언마다 다르므로 `open-questions.md` Q9(방언 범위)에 걸린다.
- BE가 같은 스키마를 자기 검증기에 넣을 때: 미지 키워드를 무시하는 검증기면 아무것도 하지 않아도 되고, strict면 같은 규칙으로 지운다.

`&` 키워드는 L2(표현)에 속한다(`02-target-overview.md` §2). 값을 바꿀 수는 있어도(`&active`, `&derived`) 판정 함수에는 닿지 못한다. `&active`로 값이 빠져 생기는 결과는 스키마 작성자의 책임이다 — 소유자: "active를 쓰면 값이 제거되는데, 그건 사용자 책임으로 생각한다. 어쨌거나 유효성 검증에 직접 개입하는 건 아니니."

## 남는 것과 사라지는 것

- **남는다:** `&` 표현식 시스템 전체 — JSON Pointer로 다른 노드의 값을 읽는 동적 함수, `visible`/`readOnly`/`disabled`/`derived`/`active`/`watch`. G2(FE 표현력 유지)의 근거다.
- **사라진다:** 표준 composition 분기(`oneOf`/`anyOf`) 위에 얹은 `&if`. 분기의 선택은 값 가드나 선택 가드가 한다(ADR 0002).

## 미결

- 기존 비접두 키(`FormTypeInput`, `options`, `virtual`, …)의 새 이름. `computed` 컨테이너를 없애고 `&` 평면 키로 갈지, `&` 하나를 컨테이너로 둘지.
- 표준 키워드 밖에서 FE 전용 조건부 필드를 선언하는 문법을 둘지 — `open-questions.md` Q4.
- `FormTypeInput`이 React 컴포넌트 참조를 스키마에 넣는 현재 방식은 스키마를 직렬화할 수 없게 하고, core가 React를 아는 유일한 런타임 지점을 만든다(`01-current-structure.md` §6). `&` 이름으로 옮기는 것과 별개로 이 결합을 유지할지 — `open-questions.md` Q8.

## 되돌림 가능성

이름은 구현 초기에는 쉽게 바꿀 수 있다. 공개 후에는 소비자 스키마 전체에 영향을 준다.
