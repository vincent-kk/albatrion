# ADR 0001 — 검증기 입력 불변

## 상태

| 항목 | 닫은 사람 | 라운드 |
| --- | --- | --- |
| VALIDATE-001 | 소유자 답(`00-goals.md:141` G1, 방향), 원리(`03-mental-model.md:13` P1) | 1 |
| VALIDATE-002 | 소유자 답(`reviews/round-1.md:178` 계약을 검증기 프로필로 한정하는가 (R1)), 소유자 답(`reviews/round-2.md:112` C5), 소유자 답(`reviews/round-18-owner-answers.md:34` union O4; 세 옵션은 `bind`가 강제) | 18 |
| VALIDATE-003 | 소유자 답(`reviews/round-1.md:178` 계약을 검증기 프로필로 한정하는가 (R1)), 소유자 답(`reviews/round-18-owner-answers.md:34` union O4; `bind`의 거부), 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-90) | 18 |
| VALIDATE-004 | 소유자 답(`reviews/round-15-decisions.md:12` 4), 소유자 답(`reviews/round-15-decisions.md:13` 5), 편집자 결정(2라운드, `adr/0001-validator-input-invariant.md:10` S1), 소유자 답(`reviews/round-18-owner-answers.md:34` union O4; 깊은 사본) | 18 |
| VALIDATE-005 | 소유자 답(`reviews/round-1.md:178` 계약을 검증기 프로필로 한정하는가 (R1)) | 1 |
| VALIDATE-006 | 편집자 결정(1라운드, `reviews/round-1.md:181` 판정의 revision 채택), 편집자 결정(11라운드, `adr/0001-validator-input-invariant.md:3` 5차 주 (3)) | 11 |
| VALIDATE-007 | 편집자 결정(1라운드, `adr/0001-validator-input-invariant.md:11`), 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-91), 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-98) | 18 |
| VALIDATE-008 | 편집자 결정(1라운드, `adr/0001-validator-input-invariant.md:11`) | 1 |
| VALIDATE-009 | 편집자 결정(1라운드, `adr/0001-validator-input-invariant.md:38`) | 1 |
| VALIDATE-010 | 원리(`03-mental-model.md:13` P1) | 1 |
| VALIDATE-011 | 원리(`03-mental-model.md:13` P1), 소유자 답(`00-goals.md:105` C2), 소유자 답(`reviews/round-2.md:112` 목표 후보 C1–C8) | 2 |
| VALIDATE-034 | 소유자 답(`reviews/round-12-owner-answers.md:16` 8 `virtual`), 소유자 답(`reviews/round-10-owner-answers.md:31` E-4) | 12 |
| VALIDATE-036 | 원리(`03-mental-model.md:13` P1) | 1 |

## 결정

### 05-validation-and-errors.md §1.1 판정 불변식과 방출 값

**폼의 판정 = `validator(작성된 스키마, 방출되는 값)`.**(VALIDATE-001)
검증기는 이 둘만 본다(VALIDATE-001). 폼이 내부에서 파생한 스키마(`allOf` 병합, 조각을 얹은 유효 스키마)는 폼 전용이며 검증기에 전달하지 않는다(VALIDATE-001). 검증용으로 값에 무엇을 더하지도 않는다(VALIDATE-001).

FE 전용으로 더 강하게 검증하고 싶으면 추가 검사를 AND로만 붙인다: `폼 판정 = validator(…) ∧ FE추가검사`(VALIDATE-001). 어떤 추가 검사를 붙여도 "폼 통과 ⇒ 서버 통과"는 유지된다(VALIDATE-001).

이 불변식은 검증기의 **입력**을 고정한다(VALIDATE-002). 검증기 **함수**는 고정하지 못한다(VALIDATE-002). 그래서 계약은 이렇게 읽는다(VALIDATE-002):

폼이 통과시킨 값은, **같은 설정의 검증기**도 통과시킨다(VALIDATE-002).

- **같은 설정**은 방언, format을 검사하는지, 커스텀 키워드·포맷, 값을 바꾸는 옵션(`coerceTypes` 등)을 쓰지 않는 것을 뜻한다(VALIDATE-002). 기본 ajv8 플러그인은 draft-07 엔트리에 `validateFormats: false`다(`schema-form-ajv8-plugin/src/default/validatorPlugin.ts:15-19`)(VALIDATE-002). 이 기본값에서 `$schema` 없는 2020-12 스키마의 `dependentRequired`·`unevaluatedProperties`는 조용히 무시되고 `format`은 항상 통과한다(VALIDATE-002). 서버와 설정을 맞추는 것은 소비자의 책임이고 수단은 이미 있다 — 플러그인의 `bind(instance)`로 Ajv 인스턴스를 주입한다(VALIDATE-002, VALIDATE-003). 기본값은 바꾸지 않는다(VALIDATE-002, VALIDATE-003).

소유자(2라운드)는 "C5는 질문이 부정확했음(검증의 방언은 플러그인의 영역, 폼은 두 철자를 모두 읽는다)"고 답했다(VALIDATE-002).

- **방출 값은 JSON으로 직렬화했을 때와 같은 값이어야 한다.**(VALIDATE-007) 값이 `undefined`인 키, 배열 중간의 `undefined`는 메모리에서의 판정과 전송 후의 판정을 갈라놓는다(`{minProperties:3}`에 `{a:1,b:2,c:undefined}`)(VALIDATE-007).

【추론】 터미널 object·array 노드와, 객체·배열을 받는 union이 통째로 든 값의 안쪽은 폼이 정규화하지 않는다(VALIDATE-007). 【추론】 그 안쪽의 JSON 부정합(`undefined`인 키, 배열 중간의 `undefined`·빈 자리, 비유한 수, `Date`·함수·bigint)은 VALIDATE-007을 어길 수 있다(예: `{type:['object','string'], minProperties:1}`의 `{a: undefined}`는 메모리 판정을 통과하고 직렬화 뒤 판정에서 실패한다)(VALIDATE-007). 【추론】 개발 모드에서는 그런 값의 참조가 바뀐 커밋마다 깊이 점검하고, 부정합이 있으면 `(가칭) SCHEMA_FORM_WARNING.NON_JSON_WHOLE_VALUE`를 내며, 기록은 `{ path, innerPaths }`(앞의 N개)다(VALIDATE-007). 경고 중복 키는 폼 수준 로드(마운트, `FormHandle.reset()`)에서만 비우므로 `NON_JSON_WHOLE_VALUE`는 폼 수준 로드 사이에 `(code, path)`마다 한 번이고, `setValue(V)`와 `resetSubtree()` 뒤에는 다시 내지 않는다(VALIDATE-007, ERROR-204).

- **`ValidationMode.None`은 "판정을 제공하지 않음"이다.**(VALIDATE-008) 통과가 아니다(VALIDATE-008).

`ValidationMode.None`인 폼도 조건부를 쓰려면 플러그인 등록이 필요하다(VALIDATE-008).

- **판정은 값의 revision에 묶인다.**(VALIDATE-006) 비동기 검증의 결과가 도착했을 때 값이 이미 바뀌었으면 그 결과는 버린다(VALIDATE-006). `isValid`는 판정의 revision이 현재와 같을 때만 참이다(VALIDATE-006). 제출은 캐시된 판정이 아니라 **실제로 보내는 스냅숏**을 검증한다(VALIDATE-006).

"판정의 revision"은 커밋 번호다(VALIDATE-006).

### 05-validation-and-errors.md §1.2 스키마 사본과 폼 전용 키

키워드 위치의 그룹 객체 셋 `controls`·`options`·`presentation`을 지운다(VALIDATE-004). 지우는 이유는 판정이 아니라 컴파일이다(VALIDATE-004). 작성된 스키마 자체는 변형하지 않고 검증기에 넘길 사본에서만 지운다(VALIDATE-001, VALIDATE-004). 오늘은 여섯 키(`FormTypeInput`, `FormTypeInputProps`, `FormTypeRendererProps`, `errorMessages`, `options`, `injectTo`)만 지우고 `&` 키·`computed`·`virtual`·`terminal` 등은 검증기까지 가므로, 그룹 셋으로 옮기는 것이 이주 항목이다(VALIDATE-004). 서버 스키마에 넘길 때도 같은 셋을 지우면 되고, 서버 스키마와 클라이언트 스키마를 합칠 때는 그룹 셋만 덧붙이면 된다(VALIDATE-004).

**허용되는 스키마 변형은 하나다 — 폼 전용 키를 키워드 위치에서만 제거하는 것.**(VALIDATE-004) 현재 `stripSchemaExtensions`가 하는 일이고(`JSONSchemaScanner`로 위치를 구분한다) 그대로 둔다(목록은 그룹 객체 셋으로 닫힌다)(VALIDATE-004). 제거가 필요한 이유는 판정이 아니라 **검증기의 컴파일**이다: 폼 전용 키의 값에 순환하거나 깊은 객체가 있으면(`presentation.FormTypeInputProps`의 자기 참조, 개발 빌드의 React 엘리먼트) `ajv.compile`이 스택 초과로 죽는다(실행)(VALIDATE-004).

소비자의 커스텀 키는 라이브러리가 열거할 수 없으므로 지우지 않는다 — strict 모드는 기본이 아니다(VALIDATE-005, CONTROLS-001). 맨 키 가운데 폼이 모르는 것은 지우지 않는다(VALIDATE-005). 그것은 JSON Schema 층의 것(확장 키워드)이고 검증기의 몫이다(VALIDATE-005).

`options.virtual` 처리는 12라운드에 닫혔다: `options.virtual`은 제거 목록에 들고 `required` 재작성은 버린다(VALIDATE-034).

소유자(12라운드 8)는 "우리는 투명한 jsonSchema 를 추구하므로, virtual 여부와 무관한 실제 필드 명시를 요구하는 바이다"라고 답했다(VALIDATE-034).

- `&if`만으로 분기를 구분한 기존 스키마는 폼에서도 invalid가 된다(VALIDATE-036). 의도된 파괴적 변경이다(VALIDATE-036).

- `ENHANCED_KEY`, enhancer, `preprocessSchema`의 마커 주입, `__processCompositionValue__`의 마커 기록, `transformErrors`의 마커 필터가 모두 사라진다(VALIDATE-010). 이슈 #342 §3.1·§3.3·§3.4가 함께 사라진다(VALIDATE-010).
- `nodeFromJSONSchema`를 직접 부르는 경로와 `<Form>` 경로가 같은 계약을 갖게 된다(지금은 다르다)(VALIDATE-010).

### 05-validation-and-errors.md §1.4 검증기 설정과 방언

- 서버와 검증기 설정(방언, format 검사, 커스텀 키워드)을 맞추는 것은 소비자의 책임이다(VALIDATE-003). 수단은 이미 있는 `bind(instance)`다(VALIDATE-003). 기본값(`allErrors`, `strictSchema: false`, `validateFormats: false`)은 바꾸지 않는다(VALIDATE-003). format 검사는 소비자가 의지적으로 켠다(VALIDATE-003).

`Validator` 문서 주석에 계약 문장을 넣는다: "core는 `compile` 결과와 가드에 방출 트리를 참조로 넘긴다. 검증기와 가드는 받은 값과 받은 스키마를 바꾸지 않는다. 값을 바꾸는 사용자 정의 키워드(ajv `modifying: true` 등)를 쓰지 않는 것은 소비자의 책임이다."(VALIDATE-044, VALIDATE-050).
ajv 플러그인 셋(ajv6·7·8)의 `bind(instance)`는 `coerceTypes`·`useDefaults`·`removeAdditional` 가운데 하나라도 켜진 인스턴스를 거부하며, 옵션은 ajv7·8이면 `instance.opts`, ajv6이면 `instance._opts`에서 읽는다(VALIDATE-003, VALIDATE-050).
켜져 있으면 `(가칭) UNHANDLED_ERROR.VALIDATOR_BIND_REFUSED`를 부른 쪽에 즉시 던지고, 인스턴스를 붙이지 않는다(VALIDATE-050, ERROR-100, ERROR-164).
폼 인스턴스가 없으므로 `onError`는 받지 않으며, `UNHANDLED_ERROR.REGISTER_PLUGIN` 행과 같은 부류다(VALIDATE-050, ERROR-100, ERROR-164).
사본 경로는 두지 않는다(VALIDATE-050).
사용자 정의 키워드의 `modifying`은 옵션으로 알아낼 수 없으므로 판별하지 않고, 런타임 감지도 약속하지 않으며, 소비자 책임으로 둔다(VALIDATE-050).
VALIDATE-002의 "같은 설정"은 값을 바꾸는 옵션을 쓰지 않는 것을 포함하며, 이 가운데 세 옵션은 이제 `bind`가 강제한다(VALIDATE-002, VALIDATE-050).
검증기에 넘기는 스키마 사본은 (검증기 인스턴스, 작성 루트)마다 한 번 깊이 복사한다(VALIDATE-004, VALIDATE-018, VALIDATE-050).

플러그인이 자기 방언을 선택적으로 선언하고, 스키마의 `$schema`와 어긋나면 개발 모드에서 경고만 낸다(프로덕션 출력 없음, `onError` 핸들러가 있으면 경고 기록)(확정 근거: 소유자 답, `reviews/round-18-owner-answers.md:14` 12-4)(VALIDATE-026). `$schema` 없는 2020-12 스키마의 `dependentRequired`가 draft-07 엔트리에서 조용히 무시되는 부류의 사고를 싸게 잡는다(VALIDATE-026).

- 가드용 인스턴스는 첫 실패에서 멈춰야 하는데(`allErrors: false`) Ajv에서 그것은 인스턴스 옵션이다(VALIDATE-033). 검증용과 가드용 인스턴스의 나머지 설정(format, 커스텀 키워드, 방언)을 같게 유지하는 규칙을 플러그인이 가져야 한다(VALIDATE-033). `bind`는 모듈 전역이어서 설정의 단위가 폼이 아니라 프로세스다(VALIDATE-033).

### 05-validation-and-errors.md §1.7 판정 요청과 오류 배정

【추론】 폼은 검증을 입력 경로에서 떼어 내는 장치를 따로 두지 않는다(VALIDATE-049).
【추론】 진입당 요청 1회와 마이크로태스크 합치기(O-6, EVENT-028)로 빈도만 줄이며, 큰 폼의 키 입력당 검증 비용은 남는다(VALIDATE-049).
【추론】 디바운스·유휴·워커는 폼에 두지 않는다(D-10, 12-3)(VALIDATE-049).
【추론】 요청은 최외곽 진입당 한 번 하고, 실행은 마이크로태스크에 모아 최신 커밋 번호 하나만 돌린다(EVENT-028, VALIDATE-049).
【추론】 워커나 인터프리터 쪽 최적화는 검증기 플러그인의 몫이며, `compile`은 비동기 검증 함수를 돌려줄 수 있다(VALIDATE-049).
【추론】 검증 빈도를 줄이려는 호스트는 `ValidationMode`의 `OnRequest`를 쓴다(VALIDATE-049).
【추론】 제출은 캐시된 판정이 아니라 보내는 스냅숏을 새로 검증한다(VALIDATE-049).

- 에러 라우팅이 실제 실패를 숨기는지로 공격받았으나 살아남았다(VALIDATE-009). 라우팅은 에러가 어디에 보일지만 정하고 판정을 바꾸지 않는다(VALIDATE-009).

- 검증기 에러 가운데 `instancePath`에 해당하는 노드가 없는 것이 생긴다(꺼진 조각의 필드가 기본 `required`에 걸린 경우 등)(VALIDATE-011). **주인 없는 에러를 모으는 폼 수준 sink**가 필요하다(VALIDATE-011). 작성자의 실수를 폼이 가리지 않는다(VALIDATE-011).

【추론】 (1) 라우팅은 판정을 바꾸지 않는다(VALIDATE-043).
【추론】 모든 에러는 순서대로 폼 수준 목록에 남는다(VALIDATE-043).
【추론】 폼 수준 목록은 루트의 `globalErrors`다(VALIDATE-043, SURFACE-053).
【추론】 아래 규칙으로 어느 노드에도 싣지 않은 에러가 주인 없는 에러다(VALIDATE-043).
【추론】 (2) 배정은 플러그인이 정규화한 `dataPath`로 한다(VALIDATE-043).
【추론】 `required`는 빠진 자식의 경로다(오늘 ajv 플러그인과 같음, `schema-form-ajv8-plugin/src/validator/utils/transformErrors.ts:42-53`)(VALIDATE-043).
【추론】 (3) `rejectedKey`가 있는 에러는 그 키를 든 호스트 노드(형상 안)의 `errors`에 그대로 싣는다(VALIDATE-043).
【추론】 잔여 키의 목록·문구·UI는 렌더 계층의 일이다(REACT-026, REACT-031, VALIDATE-043).
【추론】 (4) `dataPath`와 경로가 같은 형상 안의 노드가 받는다(VALIDATE-043).
【추론】 그 경로가 터미널 노드 아래면 그 터미널 노드가 받고, `dataPath`는 그대로 둔다(VALIDATE-043).
【추론】 형상 안에 그런 노드가 없으면 노드에 싣지 않는다(꺼진 조각에만 선언된 필드 등)(VALIDATE-043).
【추론】 (5) 꺼진 분기 거르기(표시 필터): `schemaPath`가 `oneOf`·`anyOf`의 한 분기 안으로 풀리고, 그 분기가 꺼져 있고, 같은 union에 켜진 분기가 있으면 그 에러는 노드에 싣지 않고 폼 수준 목록에만 남는다(VALIDATE-043).
【추론】 켜진 분기가 없거나 귀속을 가를 수 없으면 거르지 않는다(`$ref`로 여러 분기가 같은 위치를 쓰는 경우, 원격 `$id`)(VALIDATE-043).
【추론】 게이트 없는 분기는 늘 켜져 있으므로 걸리지 않는다(VALIDATE-043).
【추론】 `allOf` 항목·`if`/`then`/`else`·`controls.active` 조각은 거르지 않는다(VALIDATE-043).
【추론】 그 에러는 저마다 판정을 막기 때문이다(VALIDATE-043).
【추론】 귀속은 청사진의 조각 표(분기 위치와 `$ref` 대상)로 한다(VALIDATE-043).
【추론】 `if`의 내용은 읽지 않는다(VALIDATE-043).
【추론】 (6) `oneOf`·`anyOf` 자체의 에러는 (4)대로 호스트 노드가 받는다(VALIDATE-043).
【추론】 판별 노드로 옮기는 특례는 두지 않는다(VALIDATE-043).
【추론】 판별 값이 어느 분기와도 맞지 않으면 켜진 분기가 없어 (5)가 거르지 않는다(VALIDATE-043).
【추론】 그래서 분기별 `const` × N과 판별 키의 `required`는 `dataPath`대로 판별 노드가 받는다(VALIDATE-043).
【추론】 판별 노드는 `controls.discriminator`가 끌어올려 늘 형상에 있다(VALIDATE-043).
【추론】 같은 문구의 중복 표시와 번역은 렌더 계층(`formatError`)의 몫이다(VALIDATE-043).
【추론】 새 코드는 없다(검증 결과는 `onError` 밖)(VALIDATE-043).
PR: PR-4 시험(VALIDATE-043).
무엇: 규칙 (5)의 귀속이 플러그인마다 다른 `$ref` 아래 `schemaPath` 모양에서 맞는지 ajv6·7·8 사례로 본다(VALIDATE-043).

【추론】 ajv8 플러그인의 세 진입점(`default`·`2019`·`2020`) 기본 설정에 `allowUnionTypes: true`를 더한다(VALIDATE-003, VALIDATE-051).
【추론】 `allowUnionTypes`는 판정을 바꾸지 않고, `strictTypes`의 기본값 `"log"`가 union `type`마다 내는 `console.warn`만 없앤다(VALIDATE-003, VALIDATE-051).
【추론】 ajv7은 이미 `strict: false`이고, ajv6에는 strict 모드가 없으므로 둘은 바꾸지 않는다(VALIDATE-051).
【추론】 core는 검증에 넘기는 값을 복사하지 않는다(VALIDATE-049, VALIDATE-051).
【추론】 어긋난 union 값의 형 에러와 union 객체·배열 값 안쪽의 에러는 union 노드가 받고, `dataPath`는 그대로 둔다(VALIDATE-043 (4))(VALIDATE-051).
【추론】 규칙 A와 경고등은 검증기를 쓰지 않으며, 형 밖의 제약(`enum`, `properties`·`items`, 그 밖의 키워드)과 게이트가 뺀 `null`은 검증기가 판정한다(원리 P1′(폼이 스키마에서 읽는 것은 노드 트리의 모양을 정하는 문법뿐))(VALIDATE-051, BLUEPRINT-042, GOAL-026).
【추론】 멤버십은 얕게만 보며, 통째로 든 값 안의 JSON 부정합은 `NON_JSON_WHOLE_VALUE` 개발 모드 경고로만 드러내고 폼은 값을 정규화하지 않는다(VALIDATE-007, VALIDATE-051).

## 설계문서

- `design/05-validation-and-errors.md` §1.1 (VALIDATE-001, VALIDATE-002, VALIDATE-007, VALIDATE-008, VALIDATE-006)
- `design/05-validation-and-errors.md` §1.2 (VALIDATE-004, VALIDATE-005, VALIDATE-034, VALIDATE-036, VALIDATE-010)
- `design/05-validation-and-errors.md` §1.4 (VALIDATE-003)
- `design/05-validation-and-errors.md` §1.7 (VALIDATE-009, VALIDATE-011)
