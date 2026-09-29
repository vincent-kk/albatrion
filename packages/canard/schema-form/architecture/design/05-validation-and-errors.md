# 05 검증과 오류

이 문서는 원장의 VALIDATE·ERROR 영역을 읽는 표면이다. 정본은 `ledger/`이며, 문장 끝 괄호의 ID가 근거이고, 어긋나면 원장이 이긴다.

## 소유자 통과

| 절 | 상태 | 날짜 |
| --- | --- | --- |
| 1.1 판정 불변식과 방출 값 | 대기 | — |
| 1.2 스키마 사본과 폼 전용 키 | 대기 | — |
| 1.3 검증기 선택과 공통 계약 | 대기 | — |
| 1.4 검증기 설정과 방언 | 대기 | — |
| 1.5 가드 컴파일과 공유 | 대기 | — |
| 1.6 등록 수명과 같은 식별자 | 대기 | — |
| 1.7 판정 요청과 오류 배정 | 대기 | — |
| 1.8 내장 대안과 성능 책임 | 대기 | — |
| 2.1 오류와 경고를 가르는 기준 | 대기 | — |
| 2.2 오류 분류표와 적용 범위 | 대기 | — |
| 2.3 기본 드러남과 환경 규칙 | 대기 | — |
| 2.4 진입 사슬과 오류 묶음 | 대기 | — |
| 2.5 마운트 정착 오류 | 대기 | — |
| 2.6 식과 가드의 실패 | 대기 | — |
| 2.7 진단 기록과 원인 | 대기 | — |
| 2.8 진단 기록의 지속과 초기화 | 대기 | — |
| 2.9 상태 저하와 제출 거부 | 대기 | — |
| 2.10 검증기 출처와 미등록 | 대기 | — |
| 2.11 조건부 스키마와 가드 컴파일 | 대기 | — |
| 2.12 검증 불가와 실행 실패 | 대기 | — |
| 2.13 오류 관찰자의 원칙 | 대기 | — |
| 2.14 관찰자 계약과 수신 범위 | 대기 | — |
| 2.15 기록의 모양과 전달 시점 | 대기 | — |
| 2.16 핸들러 예외와 비용 | 대기 | — |
| 2.17 렌더 오류와 바운더리 | 대기 | — |
| 2.18 폼과 필드 바운더리의 보고 | 대기 | — |
| 2.19 오류 경계 유틸리티 확장 | 대기 | — |
| 2.20 추가 경고의 발생 조건 | 대기 | — |
| 2.21 오류 코드의 공개 계약과 목록 | 대기 | — |
| 2.22 청사진 오류 코드의 추가 | 대기 | — |
| 2.23 정착과 호출자 오류 코드의 추가 | 대기 | — |
| 2.24 경고 코드의 추가 | 대기 | — |
| 2.25 이주와 구현 순서 | 대기 | — |
| 2.26 합의와 판정의 근거 | 대기 | — |

## 1. 검증기

### 1.1 판정 불변식과 방출 값

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

### 1.2 스키마 사본과 폼 전용 키

키워드 위치의 그룹 객체 셋 `controls`·`options`·`presentation`을 지운다(VALIDATE-004). 지우는 이유는 판정이 아니라 컴파일이다(VALIDATE-004). 작성된 스키마 자체는 변형하지 않고 검증기에 넘길 사본에서만 지운다(VALIDATE-001, VALIDATE-004). 오늘은 여섯 키(`FormTypeInput`, `FormTypeInputProps`, `FormTypeRendererProps`, `errorMessages`, `options`, `injectTo`)만 지우고 `&` 키·`computed`·`virtual`·`terminal` 등은 검증기까지 가므로, 그룹 셋으로 옮기는 것이 이주 항목이다(VALIDATE-004). 서버 스키마에 넘길 때도 같은 셋을 지우면 되고, 서버 스키마와 클라이언트 스키마를 합칠 때는 그룹 셋만 덧붙이면 된다(VALIDATE-004).

**허용되는 스키마 변형은 하나다 — 폼 전용 키를 키워드 위치에서만 제거하는 것.**(VALIDATE-004) 현재 `stripSchemaExtensions`가 하는 일이고(`JSONSchemaScanner`로 위치를 구분한다) 그대로 둔다(목록은 그룹 객체 셋으로 닫힌다)(VALIDATE-004). 제거가 필요한 이유는 판정이 아니라 **검증기의 컴파일**이다: 폼 전용 키의 값에 순환하거나 깊은 객체가 있으면(`presentation.FormTypeInputProps`의 자기 참조, 개발 빌드의 React 엘리먼트) `ajv.compile`이 스택 초과로 죽는다(실행)(VALIDATE-004).

소비자의 커스텀 키는 라이브러리가 열거할 수 없으므로 지우지 않는다 — strict 모드는 기본이 아니다(VALIDATE-005, CONTROLS-001). 맨 키 가운데 폼이 모르는 것은 지우지 않는다(VALIDATE-005). 그것은 JSON Schema 층의 것(확장 키워드)이고 검증기의 몫이다(VALIDATE-005).

`options.virtual` 처리는 12라운드에 닫혔다: `options.virtual`은 제거 목록에 들고 `required` 재작성은 버린다(VALIDATE-034).

소유자(12라운드 8)는 "우리는 투명한 jsonSchema 를 추구하므로, virtual 여부와 무관한 실제 필드 명시를 요구하는 바이다"라고 답했다(VALIDATE-034).

- `&if`만으로 분기를 구분한 기존 스키마는 폼에서도 invalid가 된다(VALIDATE-036). 의도된 파괴적 변경이다(VALIDATE-036).

- `ENHANCED_KEY`, enhancer, `preprocessSchema`의 마커 주입, `__processCompositionValue__`의 마커 기록, `transformErrors`의 마커 필터가 모두 사라진다(VALIDATE-010). 이슈 #342 §3.1·§3.3·§3.4가 함께 사라진다(VALIDATE-010).
- `nodeFromJSONSchema`를 직접 부르는 경로와 `<Form>` 경로가 같은 계약을 갖게 된다(지금은 다르다)(VALIDATE-010).

### 1.3 검증기 선택과 공통 계약

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

### 1.4 검증기 설정과 방언

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

### 1.5 가드 컴파일과 공유

- 가드 안의 `$ref`가 루트 정의를 가리킬 수 있으므로 루트 문맥에서 컴파일한다(VALIDATE-017). 떼어 낸 `if`는 `$ref` 때문에 단독 컴파일이 실패하므로 가드는 사본(작성 스키마에서 키워드 위치의 그룹 객체 셋을 지운 복사본, VALIDATE-004)의 루트와 위치를 받는다(16라운드 실행 확인)(VALIDATE-017).

`compile`은 사본을, `compileGuard`는 사본의 루트와 위치를 받는다(VALIDATE-017). 동작이 확인된 방식은 루트를 한 번 등록하고 가드를 **루트 안의 위치로** 가리키는 것이다 — `addSchema(root)` 뒤에 `compile({ $ref: 'root#/allOf/0/if' })`(VALIDATE-017). 공허한 참의 의미도 보존된다(실행)(VALIDATE-017). 가드를 떼어낸 새 객체로 컴파일하면 검증기의 객체 identity 캐시가 빗나가므로, 작성된 스키마 안의 위치로 식별한다 — `$id` 기저 URI와 `$dynamicRef`의 문맥 문제도 함께 걸려 있다(VALIDATE-017, VALIDATE-047).

캐시는 코어가 검증기 인스턴스마다 WeakMap<작성 루트, { 사본, 가드 표 }>로 든다(16라운드 편집자 결정, 답 10으로 확정)(VALIDATE-018).

캐시의 키가 작성 루트이므로 같은 검증기 인스턴스를 쓰고 같은 스키마 객체로 만든 폼 인스턴스들이 컴파일을 공유한다(`validatorFactory`로 폼마다 다른 인스턴스를 주면 공유하지 않는다)(VALIDATE-018).

플러그인의 `compileGuard`는 가드 캐시를 들지 않고, 사본 루트의 등록(루트마다 한 번의 `addSchema`와 고유 키 배정)은 플러그인의 검증기 인스턴스가 든다(ajv는 같은 키의 재등록에 실패한다)(VALIDATE-019).

【추론】 공유 단위는 (검증기 인스턴스, 작성 루트 객체의 identity) 하나다(VALIDATE-048).
【추론】 구조가 같은 다른 객체는 공유하지 않는다(VALIDATE-048).
【추론】 해시나 직렬화 비교를 하지 않는다(VALIDATE-048).
【추론】 같은 캐시 항목에 전체 검증 함수(`compile(사본)`의 결과, 실패했으면 그 실패)도 담는다(VALIDATE-048).
【추론】 그러면 같은 인스턴스·같은 작성 루트로 만든 폼들은 전체 컴파일도 한 번만 한다(VALIDATE-048).
【추론】 검증 불가 기록은 여전히 폼의 로드마다 한 번씩 낸다(ERROR 영역의 `VALIDATOR_COMPILE_FAILED` 행)(VALIDATE-048).
【추론】 `VALIDATOR_COMPILE_FAILED`는 폼 수준 기록이다(VALIDATE-048, WRITE-099). 【추론】 그 기록은 폼 수준 로드(마운트, `FormHandle.reset()`)마다 한 번 낸다(VALIDATE-048, WRITE-099). 【추론】 `resetSubtree()`는 그 기록을 다시 내지도 초기화하지도 않으며, 그 기록이 막은 `OnChange` 검증 예약은 다음 폼 수준 로드까지 막힌 채다(VALIDATE-048, WRITE-099).
【추론】 개발 모드의 "모든 가드를 한 번 컴파일해 보기"도 캐시 항목마다 한 번이다(VALIDATE-048).
【추론】 이 항목의 수명과 해제는 가드와 같다(VALIDATE-021, VALIDATE-048).
【추론】 `validatorFactory`가 폼마다 새 인스턴스를 주면 공유하지 않는다는 점은 문서에 적는다(VALIDATE-018 보충과 같다)(VALIDATE-048).
【추론】 같은 `$id` 충돌, 최근 해제 목록의 크기, `$id`·`$dynamicRef` 문맥은 이 항목이 아니다(VALIDATE-045, VALIDATE-046, VALIDATE-047, VALIDATE-048).

【추론】 `compileGuard(root, pointer)`의 함수는 같은 호스트 값에 대해, 전체 검증이 그 위치의 `if`를 평가할 때와 같은 boolean을 내야 한다(VALIDATE-047).
【추론】 `$id` 기저 URI와 `$dynamicRef`/`$recursiveRef`의 동적 범위를 포함한다(VALIDATE-047).
【추론】 이것은 플러그인 계약이며, 폼은 `if`의 내용을 읽지 않는다(VALIDATE-047).
【추론】 위치마다 가드는 하나다(VALIDATE-047).
【추론】 컴파일 실패는 가드 실패다(현행)(VALIDATE-047).
PR: PR-4, 대상 ajv7·8(ajv6은 (i)만)(VALIDATE-047).
사례 (i): 안쪽 `$id` 자원 안의 `if`와 상대 `$ref`(VALIDATE-047).
사례 (ii): 2020-12 `$dynamicRef`/`$dynamicAnchor` 확장 패턴을 지나는 `if`(VALIDATE-047).
사례 (iii): 2019-09 `$recursiveRef`(VALIDATE-047).
사례 (iv): 한 `$defs` 위치를 동적 범위가 다른 두 경로가 쓰는 경우(VALIDATE-047).
통과: 가드의 답이 전체 검증에서 관측한 `if`의 답과 모든 사례에서 같다(VALIDATE-047).
관측은 then/else 에러 유무로 판별하는 짝 스키마로 한다(VALIDATE-047).
실패 — (iv)만 어긋나면: "한 위치를 여러 동적 범위에서 쓰는 가드"를 지원 범위 밖으로 문서화하는 권고와 함께 소유자에게 올린다(VALIDATE-047).
`if` 안을 읽는 경고는 E-19·E-23과 부딪히므로 두지 않는다(VALIDATE-047).
실패 — (i)–(iii)이 어긋나면: 가드 컴파일 방식을 PR-4가 고친다(VALIDATE-047).
못 고치면 소유자에게 올린다(VALIDATE-047).

변경 경로 → 가드의 역색인은 기각되었다(E13)(VALIDATE-032, BLUEPRINT-007, VALUE-014).

### 1.6 등록 수명과 같은 식별자

살아 있는 트리는 자기 작성 루트 객체를 강하게 든다(VALIDATE-021). 사본 루트의 등록과 가드는 그 작성 루트를 쓰는 살아 있는 트리가 있는 동안 남고, 마지막 트리가 폐기되면 크기 상한이 있는 최근 해제 목록에 두었다가 밀려날 때 푼다(참조 세기 + 최근 해제 목록)(VALIDATE-021). 참조 수는 커밋(효과)에서 올리고 그 정리에서 내린다(VALIDATE-021). 렌더에서 만들어졌으나 커밋되지 않은 트리의 작성 루트는 참조 수 0으로 최근 해제 목록에 든다(VALIDATE-021). 목록에서 밀려날 때 플러그인 등록과 함께 코어 캐시의 그 작성 루트 항목도 지운다(다음 마운트는 사본·가드·등록을 함께 다시 만든다)(VALIDATE-021). 같은 스키마 객체로 다시 마운트하면 다시 컴파일하지 않고(재생성 방지), 메모리 상한은 수거 시점과 무관하게 '살아 있는 작성 루트의 수 + 목록 크기'다(메모리 안정)(VALIDATE-021). 16라운드 답 10에서 편집자 도출이며 해제 방식은 16라운드 스웜 수렴(편집자 결정)으로 정했다(`FinalizationRegistry`는 정리 콜백의 호출이 보장되지 않아 기본 경로로 쓰지 않는다)(VALIDATE-021). 코어의 캐시는 WeakMap이지만 플러그인의 등록과 컴파일 결과는 강한 참조이기 때문이다(VALIDATE-021). 같은 `$id`의 새 루트가 등록될 때 참조 수가 0인 옛 루트의 등록은 먼저 푼다(VALIDATE-021). 재생성 경로의 reset에서는 새 루트를 등록할 때 옛 트리가 아직 살아 있으므로(WRITE-046의 원자성, 참조 수는 효과 정리에서 내린다) 이 규칙이 아니라 VALIDATE-046의 충돌에 든다(VALIDATE-021).

그래서 같은 스키마 객체로 다시 마운트하거나(StrictMode의 흉내 언마운트 포함) 목록 안에서 돌아오면 다시 컴파일하지 않고(재생성 방지), 메모리 상한은 가비지 수거 시점과 무관하게 '살아 있는 작성 루트의 수 + 목록 크기'로 정해진다(메모리 안정, 모바일 경제성)(VALIDATE-021).

【추론】 최근 해제 목록은 검증기 인스턴스마다 하나이고, 크기는 8이다(내부 상수, 공개 옵션 아님)(VALIDATE-045).
【추론】 가득 차면 가장 먼저 해제된 루트부터 밀려난다(VALIDATE-045).
【추론】 목록 안의 루트가 다시 커밋되면 목록에서 빠지고 다시 컴파일하지 않는다(VALIDATE-045).
【추론】 푸는 때는 둘뿐이다: 목록에서 밀려날 때, 그리고 같은 루트 `$id`의 새 루트를 등록하기 직전의 목록 안(참조 수 0) 옛 루트(VALIDATE-021)다(VALIDATE-045).
【추론】 참조 수가 1 이상인 루트는 풀지 않는다(VALIDATE-045).
【추론】 core는 플러그인의 `release(root)`를 루트마다 한 번 부른다(VALIDATE-045).
【추론】 플러그인은 등록(ajv `removeSchema(key)`)과 컴파일 결과를 버린다(VALIDATE-045).
【추론】 이어 core는 자기 캐시의 그 작성 루트 항목을 지운다(VALIDATE-045).
【추론】 `release`가 없으면 core 캐시만 지운다(VALIDATE-045).
【추론】 이 저장소의 ajv 플러그인 셋은 `release`를 구현한다(VALIDATE-045).
【추론】 플러그인 계약에 선택 `release`를 더하는 것은 minor다(VALIDATE-045).
【추론】 메모리 상한은 검증기 인스턴스마다 '살아 있는 루트 수 + 8'이다(VALIDATE-045).
【추론】 목록이 흡수할 것은 StrictMode의 흉내 언마운트, 커밋되지 않은 렌더, 몇 개 스키마를 오가는 화면이다(VALIDATE-045).
【추론】 서버에서는 효과가 돌지 않아 모든 트리가 참조 수 0으로 목록에 든다(VALIDATE-045).
【추론】 목록이 작아야 서버 메모리가 묶인다(VALIDATE-045).
PR: PR-4 시험(VALIDATE-045).
무엇: 서로 다른 스키마로 1,000번 마운트·언마운트한 뒤 등록 수가 '살아 있는 루트 + 8' 이하인지, 같은 객체를 다시 마운트하면 컴파일이 0번인지 본다(VALIDATE-045).

【추론】 서로 다른 작성 루트 객체가 같은 `$id`(루트나 안쪽 자원)를 가진 채 동시에 살아 있을 수 있다(VALIDATE-046).
【추론】 같은 화면의 두 폼이 그렇고, 재생성 reset에서 옛 트리가 아직 살아 있을 때도 그렇다(VALIDATE-046).
【추론】 이때 두 트리는 저마다 자기 루트로 판정한다(목표 G1(스키마는 공유 계약이다 — 판정의 동치), GOAL-003)(VALIDATE-046).
【추론】 루트마다 등록을 떼어 두는 것은 플러그인 계약이다(VALIDATE-046).
【추론】 한 인스턴스에 둘 수 없으면 같은 설정의 다른 인스턴스에 등록한다(VALIDATE-046).
【추론】 core는 `$id`를 고치지 않는다(VALIDATE-046).
PR: PR-4(VALIDATE-046).
대상: ajv6·7·8 플러그인 각각, 기본 인스턴스와 `bind(instance)`로 받은 소비자 인스턴스 둘 다(VALIDATE-046).
(i) 같은 루트 `$id`의 두 루트를 동시에 살렸을 때 `compile`·`compileGuard`가 저마다 독립 ajv와 같은 판정을 내는가(VALIDATE-046).
(ii) 안쪽 `$id`가 겹치는 경우와, 절대 URI로 자기를 가리키는 `$ref`(VALIDATE-046).
(iii) 재생성 reset의 원자성(H3, `reviews/raw-round16-reset.md:42`)(VALIDATE-046).
(iv) 한쪽을 `release`한 뒤에도 다른 쪽의 늦은 가드 컴파일이 맞는가(VALIDATE-046).
통과: 넷 모두 판정이 같고 오류 기록이 없다(VALIDATE-046).
실패(특히 `bind` 인스턴스를 같은 설정으로 복제할 수 없을 때): 소유자에게 올린다(VALIDATE-046).
실패의 선택지: (가) 소비자 인스턴스의 같은 `$id` 동시 사용을 지원 밖으로 문서화하고 위의 오류로 드러냄, (나) `bind`가 인스턴스 대신 인스턴스를 만드는 함수를 받게 함(VALIDATE-046).

### 1.7 판정 요청과 오류 배정

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

### 1.8 내장 대안과 성능 책임

플러그인으로 허용하되 성능 예산은 AJV를 기준으로 잡는다(VALIDATE-027, TEST-073).

인터프리터형 검증기는 같은 작업이 약 70배 느리고 호스트 객체의 폭에 비례한다(`@cfworker/json-schema`: 가드 200개에 578 µs, 아이템 10,000개를 훑는 `contains` 가드 하나에 4.5 ms)(VALIDATE-027). `@cfworker/json-schema`는 내장 후보가 아니라 플러그인 구현체 후보 가운데 하나가 된다(VALIDATE-027). 검증기의 성능은 폼이 관여할 문제가 아니므로 폼은 아무 장치도 더하지 않는다(역색인 없음, `if` 내용 불관여 유지)(VALIDATE-027). 예산은 AJV 기준으로 적고, 인터프리터형은 "동작하되 성능은 플러그인의 몫"으로 문서화한다(VALIDATE-027).

- **작은 검증기를 내장하고 플러그인이 있으면 그것을 쓰는 안을 채택하지 않는다.**(VALIDATE-028) 같은 개념에 평가기가 둘이면 서로 다른 답을 낼 수 있다(VALIDATE-028). 현재 구조에서 이미 확인된 문제다(`requiredFactory`와 표현식 컴파일러, `01-current-structure.md` §3)(VALIDATE-028).
- **AJV를 내장하지 않는다.**(VALIDATE-028) 번들이 커지고 플러그인 분리의 장점이 없어진다(소유자의 판단)(VALIDATE-028).

ADR 0010은 분기 관행 문서다(외부 조사 항목 아님)(VALIDATE-030).

## 2. 오류와 경고

### 2.1 오류와 경고를 가르는 기준

(ERROR-001, ERROR-008, ERROR-021)

| 층 | 무엇 | 규칙 | 환경 차이 |
| --- | --- | --- | --- |
| **오류** | 폼의 약속이 깨진 사건. 형상이 서지 않거나(청사진), 작성자의 선언이나 호출자의 쓰기가 커밋에서 빠지거나 바뀌거나(정착), 검증기가 있으나 검증이 불가능하거나(검증기), 호출자·소비자 코드가 계약을 어겼다 | **드러낸다.** 기본 드러남은 throw, 프로미스 거부, 주인 없는 오류 싱크(ERROR-008) 가운데 정확히 하나다. 삼키지 않고, 끌 스위치도 없다. 마운트 뒤에는 폼이 이미 커밋한 값을 잃지 않는다 | 없음. 개발과 프로덕션이 같다(R17-1 나). 메시지도 줄이지 않는다 |
| **경고** | 약속은 지켜지나 작성자의 의도가 의심되는 것, 또는 동작을 바꾸지 않는 알림 | **개발 모드 로그**(코드+메시지로 중복 억제). 동작을 바꾸지 않는다 | 기본 출력(개발 모드 로그)은 프로덕션에서 침묵한다(경고는 결과를 바꾸지 않으므로 침묵해도 계약이 깨지지 않는다). `onError` 핸들러는 모든 환경에서 경고 기록을 받는다(ERROR-021) |
| **검증 결과** | 사용자의 값이 스키마에 맞지 않음 | 노드 `errors`(`ValidationIssue`)로 흘리고, 제출 시 `ValidationError`. `onError`에는 가지 않는다 | 없음 |

**폼의 약속**은 원장이 적은 규칙이다(ERROR-002). 스키마가 작성된 그대로 판정되는 한(원리 P1(판정은 검증기의 것이다)) **스키마의 뜻이 작성자의 의도와 다른 것은 경고**다(`else: false`가 빠져 거짓 분기가 공허하게 통과하는 것, 터미널이 아닌 객체 노드의 표준 `readOnly`가 자식 편집을 막지 않는 것)(ERROR-002). "조용한 데이터 손상"이라는 말은 **폼이 작성자의 선언이나 호출자의 쓰기를 빼거나 바꾼 커밋**에만 쓴다(ERROR-002). 가르는 물음은 하나다(ERROR-002). "이 사건 뒤에도 원장의 규칙이 지켜지는가"(ERROR-002). `onError` 기록의 `level`은 이 층을 따른다(`'error'`는 오류 층, `'warning'`은 경고 층)(ERROR-002).

**층과 level.**(ERROR-102)

`level`이 `'error'`이면 오류 층이다(ERROR-103).

폼의 약속이 깨진 사건이며, 기본 드러남은 throw, 거부, 싱크 가운데 정확히 하나다(ERROR-104).

`level`이 `'warning'`이면 경고 층이다(ERROR-105).

동작을 바꾸지 않는 사건이며, 기본 드러남은 개발 모드 콘솔이다(ERROR-106).

R17-1 나에 따라 예산 초과, 식·가드 실패, 동적 `controls.injectTo` 대상 없음, 되먹임·중첩 초과는 `'error'`다(ERROR-107).

검증기 없음은 거부하지 않으므로 `'warning'`이다(17라운드 소유자 답 (가) "(가) ㄱ warning으로.")(ERROR-108).

가르는 물음은 ERROR-002대로 '이 사건 뒤에도 원장의 규칙이 지켜지는가'다(ERROR-109, ERROR-002).

### 2.2 오류 분류표와 적용 범위

**오류와 경고의 분류(12라운드, 오늘 코드의 체계를 이어 다시 구성).**(ERROR-065) 축은 셋이다 — 언제, 누구 잘못, 어떻게 드러남(ERROR-065). 오늘의 클래스 `JSONSchemaError`(throw)·`SchemaFormError`·`ValidationError`·`UnhandledError`와 `warnDevelopmentIssue`(개발 모드 전용, 코드+메시지로 중복 억제)를 그대로 잇되, 예약 층과 분기 규칙의 항목을 더했다(ERROR-065). 이름 충돌 하나는 고친다: throw되는 클래스 `JSONSchemaError`와 노드 `errors` 항목의 인터페이스 `JSONSchemaError`가 같은 이름이므로 후자를 `ValidationIssue`로 부른다(슬라이스 4)(ERROR-065).

(ERROR-159, ERROR-164, CONTROLS-079, WRITE-078, ERROR-191, ERROR-197)

| 부류 | 층 | 언제 | 누구 잘못 | 드러남 | 항목 |
| --- | --- | --- | --- | --- | --- |
| 청사진 오류 | 오류 | 청사진 분석 | 작성자 | 마운트: 생성 자리에서 잡아 대체 화면, 커밋 뒤 `onError`와 싱크. 폼이 서지 않는다. reset 안: reset이 던짐(`JSONSchemaError`). 재대조: 지금 트리를 둔 채 싱크 | 지원하지 않는 `type`; 배열 형태 모순; 정적 연언의 `type` 재정의·`const` 충돌·불가능한 범위·공집합 `enum`; `options.virtual` 참조 오류; `controls`의 식의 컴파일 실패; 게이트 없는 선언끼리(본체·게이트 없는 `allOf` 항목·게이트 없는 분기) 같은 이름·다른 종류를 선언함(늘 함께 켜지므로 충돌이 확실하다, O-10); `controls.discriminator`의 키가 어느 분기에도 `const`·`enum`으로 없거나, 있는 분기끼리 종류가 다르거나 값이 겹치거나 선언 사이 값이 다름(O-1. 일부 분기에만 없는 것은 그 분기가 게이트 없음일 뿐 오류가 아니다); 선언 사이 터미널 전략 불일치; `controls`·`options` 안의 모르는 키(15라운드) |
| 마운트 정착 오류 | 오류 | 마운트의 첫 정착 | 작성자 스키마·호출자 데이터 | 원인별(ERROR-077). 공유 충돌은 모든 환경에서 폼이 서지 않고 대체 화면. 예산 초과·식·가드 실패·동적 대상 없음은 폼이 서고 `degraded`로 시작하며 커밋 뒤 `onError`와 싱크 | 첫 정착의 예산 초과, 식·가드 실패, 동적 `controls.injectTo` 대상 없음, 공유 충돌 |
| 청사진 경고 | 경고 | 청사진 분석 | 작성자 | 개발 모드 로그. `onError` 경고 기록(핸들러가 있으면 모든 환경) | `oneOf`·`anyOf` 분기에 `if`는 있고 `else: false`가 없음; `null` 분기 무시; `allOf` 키워드 무시; `dependentSchemas`·`dependencies` 무시; 터미널이 아닌 객체 노드의 잠금(표준 `readOnly`, `controls.readOnly`·`controls.disabled`. 효과 없음) |
| 정착 오류 | 오류 | 마운트 뒤 정착의 계산·파생·전이·커밋 | 작성자 스키마·호출자 데이터 | 커밋·통지 뒤 사슬의 끝에서 throw, 모든 환경(`SchemaFormError`, 식 예외는 `details.error`). `diagnostics`가 `degraded`로 남고 그 동안 제출을 거부한다 | 예산 초과(호스트 바퀴·파생·전이. 원본 B 커밋); 게이트에 달린 선언이 실제로 동시에 켜짐(작성자가 선언한 노드 하나가 형상에서 빠진다, P1′. 전순서에서 앞선 종류로 커밋한 뒤 throw); 어느 자리든 `controls`의 식이나 `if` 게이트 함수의 런타임 throw와 가드의 평가·컴파일 실패(ERROR-122: 게이트는 거짓, 상태 키 선언은 없음, 파생 규칙은 후보 제외, `controls.resetInteraction`은 거짓); 동적으로만 아는 `controls.injectTo` 대상이 없음 |
| 정착 경고 | 경고 | 정착의 계산 | 작성자 스키마 | 개발 모드 로그. `onError` 경고 기록(핸들러가 없는 프로덕션에서는 판정하지 않음) | 같은 `oneOf`에서 게이트 가진 분기가 둘 이상 켜짐(소유자 답 20). 같은 대상 규칙 둘은 경고가 아니다(13라운드 답 4). 켜진 `then`과의 런타임 교차가 공집합인 것은 경고도 오류도 아니다 — 검증기가 값을 기각한다(검증 결과) |
| 정착 추적 | (기록) | 정착 | — | 개발 모드에서 정착마다 기록(진입, 라운드별 규칙·원천·대상·값·결과, 예산 초과 시 마지막 라운드). `onError`에 가지 않음 | 자동 쓰기 여섯의 출처(목표 C2(작성자 실수의 가시성)·원리 P2(원본은 호출자와 작성자만 쓴다)) |
| 되먹임·중첩 오류 | 오류 | 통지 | 소비자 코드 | 그 고리 하나를 끊고(되먹임 쓰기 거부, `onChange` 하나 생략) 사슬의 끝에서 throw, 모든 환경. `diagnostics`에 남기지 않는다 | 리스너 되먹임 파동 25, `onChange` 중첩 25 |
| 리스너 오류 | 오류 | 통지 | 소비자 코드 | 배달을 끝내고 사슬의 끝에서 throw, 모든 환경. 검증 결과 파동의 리스너와 `onValidate`가 던진 것은 `onError` 뒤 싱크 | 구독 리스너, `onChange`, `onStateChange`, `onDiagnosticsChange`가 던진 예외, `batch` fn의 예외, 검증 결과 파동의 리스너와 `onValidate`의 예외 |
| 호출자 오류 | 오류 | 공개 API 호출 | 호출자 | 즉시 throw(`SchemaFormError`, 등록은 `UnhandledError`) | `FormTypeInputMap` 패턴(렌더 중 정규화에서 던져져 루트 바운더리가 가두므로 드러남은 렌더 오류 행을 따른다), 플러그인 등록 실패(폼 밖이라 `onError`에 가지 않음), `Overwrite`와 `Merge`를 함께 준 `setValue`, 재생성 reset으로 폐기된 노드에 대한 쓰기, `onError` 관찰자 안의 쓰기(`onError`에 가지 않음), 배열 아닌 노드의 배열 전용 명령(`ARRAY_METHOD_ON_NON_ARRAY`) |
| 제출 거부 | 오류 | 제출 | 작성자 스키마·호출자 데이터(폼이 `degraded`) | `FormHandle.submit`·`useFormSubmit`은 `SchemaFormError`로 거부, 네이티브 submit은 `onError` 뒤 싱크, 모든 환경. 렌더 계층의 일이며 core는 제출을 모른다 | `diagnostics.status === 'degraded'` 동안의 제출 |
| 검증기 경고 | 경고 | 트리 생성(마운트, 재생성 reset) | 호출자(검증기를 주지 않음) | 거부하지 않음. 개발 모드 로그, `onError` 경고 기록(트리마다 한 번) | 검증기 없음(검증 모드가 `None`이 아님); 검증기가 없어 `if` 조각이 꺼짐 |
| 검증기 오류 | 오류 | 검증 요청 | 플러그인·호출자 | `validate()`와 제출의 거부, `OnChange` 검증이면 `onError` 뒤 싱크, 모든 환경 | 검증기는 있으나 전체 스키마 컴파일 실패(검증 불가, 한 로드에 한 번); 검증 함수의 런타임 throw, 요청 시점의 `$ref` 순환 |
| 렌더 오류 | 오류 | 렌더 | 소비자 코드(사용자 주입 구성 요소) 또는 호출자 | 바운더리가 가두어 대체 화면을 그리고 `componentDidCatch`에서 `onError`와 싱크. 다시 던지지 않는다 | 필드 바운더리가 감싼 구성 요소(`FormTypeInput`, 렌더러, `Placeholder`)의 렌더 오류, 루트의 렌더 오류, `formTypeInputMap` 정규화 오류 |
| 렌더 계층 경고 | 경고 | 렌더 계층 | 작성자·호출자 | 개발 모드 로그. `onError` 경고 기록 | 가상화를 켰는데 `IntersectionObserver`가 없음; `presentation` 키 의심(코어 키와 대소문자만 다름, 또는 `controls`·`options`의 키 이름) |
| 검증 결과 | 검증 결과 | 검증 뒤 | 사용자 입력 | 노드 `errors`(`ValidationIssue`), 제출 시 `ValidationError`. `onError`에 가지 않는다 | 검증기가 낸 항목 |

`controls.discriminator`의 "선언 사이 값이 다름"은 한 분기의 정적 연언 안 판별 선언들의 교차가 공집합일 때로 읽는다(ERROR-159, ERROR-164, FRAGMENT-048).

정적으로 아는 `controls.injectTo` 대상은 없고, 그 경우는 모두 정착 오류 행의 동적 대상 없음이다(ERROR-159, CONTROLS-079).

동적 `controls.injectTo` 대상 없음은 대상 경로가 청사진에 없거나 터미널 아래인 것이며, 형상에 없는 노드를 가리키는 것은 오류가 아니다(ERROR-159, ERROR-124).

개발 모드 경고는 게이트 결과, 키의 유무, 선언의 `type`, 등록 상태만 보며 `if`의 내용은 읽지 않는다(ERROR-159). 검사하지 않는 것: 조건 프로퍼티가 `properties`에 있는지, `if`에 `required`가 있는지(ERROR-159).

`presentation`의 모르는 키는 플러그인 자유 칸이다(ERROR-159).

정착 추적은 개발 모드에서 정착마다 기록한다: 진입(공개 API, 옵션 비트), 라운드별 {단계, 규칙 종류, 원천 경로, 대상 경로, 이전 값, 이후 값, 결과(적용 / 누구에게 짐 / `undefined`라 후보 아님 / 억제 / 최종 형상 밖이라 철회)}, 예산 초과 시 마지막 라운드의 규칙 목록(ERROR-159). 프로덕션은 기록하지 않는다(ERROR-159). `onError`에 가지 않는다(ERROR-159).

범위 밖: 렌더 중 쓰기는 core가 감지하지 않는다(원리 P5(core는 렌더러를 모른다), ERROR-160).

`controls.discriminator`의 키가 호스트 `properties`에 없는 것은 오류가 아니다(끌어올림, O-1)(ERROR-161).

오늘의 경고 `NULLABLE_ONE_OF_NULL_UNREACHABLE`은 분기 내용을 읽으므로 폐기하고, `VIRTUALIZATION_DISABLED_FOR_FORM`은 렌더 계층 경고로 옮긴다(ERROR-162).

분류표는 ERROR-159의 것이고 03의 재록은 이를 그대로 옮긴 것이다(ERROR-171).

### 2.3 기본 드러남과 환경 규칙

(ERROR-003, EVENT-018, ERROR-155, ERROR-039)

| 언제 | 자리 | 왜 |
| --- | --- | --- |
| 청사진 오류(마운트) | 렌더 중에 던지지 않는다. 트리를 만드는 자리에서 잡아 폼 자리에 대체 화면을 그리고, 커밋 뒤 이펙트에서 `onError`와 주인 없는 오류 싱크로 드러낸다. 폼이 서지 않는다 | 형상 없이는 어떤 값도 뜻이 없다. 렌더 중에 던지면 서버 사이드 렌더링의 페이지가 실패하고, 호스트에 바운더리가 없으면 앱 전체가 내려간다 |
| 청사진 오류(reset의 스키마 교체) | reset이 던진다. 재대조(레이아웃 효과)에서 난 것은 지금 트리를 둔 채 그 레이아웃 효과에서 `onError`와 싱크로 드러낸다 | reset은 호출자가 있는 사슬이다. 재대조는 부른 쪽이 없다 |
| 마운트 정착의 오류 | 원인별(아래) | 폼이 서는지는 원인마다 소유자의 답을 따른다 |
| 호출자 오류(공개 API 오용, 관찰자 안의 쓰기, 폐기된 노드에 대한 쓰기) | 즉시, 그 호출에서 | 호출자의 코드가 원인이며 그 자리에서 고친다. 렌더 중 쓰기는 core가 감지하지 않는다(원리 P5(core는 렌더러를 모른다), EVENT-018) |
| 정착·통지 사슬의 오류 | **사슬의 가장 바깥 진입 끝에서 한 번**, 모든 환경 | 아래 |
| 검증기 오류 | `validate()`와 제출의 거부. `OnChange` 검증이면 `onError` 뒤 싱크 | ERROR-155, ERROR-039 |

청사진 오류: reset 호출 안의 재생성에서 난 것은 `reset()`이 던지고 옛 트리는 그대로 남는다(원자적)(ERROR-003).

청사진 오류는 트리를 만드는 자리(`RootNodeContextProvider`의 생성)에서 잡아 폼 자리에 오늘과 같은 대체 화면을 그리고 커밋 뒤 이펙트에서 드러낸다(17라운드 스웜 수렴(편집자 결정), ERROR-089)(ERROR-003). 오늘은 `console.error`뿐이다(ERROR-003).

작성자 스키마·호출자 데이터에서 온 정착 오류(예산 초과, `controls` 식·가드 실패, `controls.injectTo` 대상 없음)와 공유 충돌은 모든 환경에서 커밋·통지 뒤 사슬 끝에서 던진다(R17-1 나, 17라운드 소유자 답: "나 허용. 망가진 값을 올리는게 더 위험하겠다")(ERROR-070).

청사진 오류, 호출자 오류, 되먹임·중첩 초과, 리스너·`batch` fn 예외(14라운드 O-5 위임), 검증기 오류도 모든 환경에서 같게 드러난다(ERROR-071).

끄는 스위치는 없다(Form 속성 `throwOnBudgetExceeded`는 없다)(ERROR-072).

12라운드 §4("프로덕션은 신호만"), 10라운드 B-1(제출 비차단), 14라운드 O-4 가(식 오류와 대상 없음은 개발 모드 경고)는 이 답으로 대체되었다(ERROR-073).

환경에 따라 다른 것은 둘뿐이다(ERROR-074).

경고의 기본 출력(개발 모드 콘솔)과, 가드 컴파일 실패를 알리는 시점(ERROR-041)이다(ERROR-075, ERROR-041).

오류 메시지는 어느 환경에서도 줄이지 않는다(번호와 해독 페이지로 바꾸지 않는다)(ERROR-076).

**기본 출력과의 관계.**(ERROR-022) 핸들러는 어떤 기본 드러남도 대신하거나 끄지 못하며, 반환값은 무시한다(ERROR-022).

- 오류의 기본 드러남: 사슬 끝 throw, 프로미스 거부, 주인 없는 오류 싱크다(ERROR-008, ERROR-022).
- 경고의 기본 드러남: 오늘의 자리와 규칙 그대로다(ERROR-022). 개발 모드 콘솔에 발견 즉시 나가고, 세션 단위로 code+message 중복을 억제한다(`src/helpers/warning/warnDevelopmentIssue.ts:25-35`)(ERROR-022). 프로덕션에서는 기본 출력이 없다(ERROR-022). ERROR-001의 '침묵'은 기본 출력에만 해당한다(ERROR-022, ERROR-001).
- 개발 모드에서 경고는 콘솔과 핸들러 둘 다에 간다(의도한 동작이다)(ERROR-022).
- `@winglet/react-utils` ErrorBoundary의 `console.error`는 그 모듈의 의도대로 남는다(`packages/winglet/react-utils/src/hoc/withErrorBoundary/INTENT.md` '기본 로깅은 유지')(ERROR-022).

### 2.4 진입 사슬과 오류 묶음

**진입 사슬.**(ERROR-004) 사슬 머리(리스너·`onChange` 밖에서 열린 동기 진입)와, 그 통지·`onChange`·리스너 안에서 열린 진입 전부가 한 사슬이다(ERROR-004). ADR 0008의 "최외곽 진입"은 사슬 머리가 아닌 진입이며, 되먹임 상한(파동 25)은 진입마다, `onChange` 중첩 상한(25)은 사슬마다 센다(ERROR-004). 사슬 안에서 난 오류 — 정착 오류, 리스너 오류, 되먹임·중첩 초과, `batch(fn)`의 fn이 던진 예외 — 는 모두 모아 두었다가 **사슬 머리가 끝날 때 한 번** 던진다(ERROR-004). 안쪽 진입과 안쪽 `batch`는 정상 반환한다(fn이 던진 예외도 모아 둔다)(ERROR-004). 안쪽에서 던지면 사슬이 끊겨 통지가 빠진다(ERROR-004). 순서는 커밋 → 통지 → 검증 요청 → `onChange` → 기록마다 `onError` → throw다(ERROR-004). 그래서 값은 커밋되고, 구독자는 통지받고(커밋된 것은 반드시 통지된다), 호출자는 한 번만 오류를 본다(ERROR-004).

**묶음.**(ERROR-005) 오류가 하나면 그대로 던진다(ERROR-005). 둘 이상이면(부른 쪽이 있는 자리에서 `onError` 핸들러가 던진 예외를 원래 오류와 합칠 때 포함) `SchemaFormError` 하나(전용 코드, 가칭 `SCHEMA_FORM_ERROR.MULTIPLE_ERRORS`)로 묶어 발생 순서대로 `details.errors`에 담는다(ERROR-005). 식이 던진 원래 예외는 `SchemaFormError`로 감싸고 `details.error`에 싣는다(오늘 `INJECT_TO`와 같은 방식)(ERROR-005). 내장 `AggregateError`와 `Error`의 `cause` 선택지는 쓰지 않는다(ERROR-005). 빌드 변환 대상이 ES2020이라 둘 다 없고, 내장 `AggregateError`로 판별하면 사용자 코드의 `Promise.any`가 낸 남의 오류까지 폼의 것으로 오인한다(ERROR-005). `BaseError.toJSON`이 `details`를 재귀 복사하므로 `details.errors`는 새 장치 없이 직렬화된다(ERROR-005).

**호출자 없는 진입.**(ERROR-007) 호출자 코드가 머리가 아닌 진입 — 마운트, 렌더 계층 자신의 이펙트, reset의 재대조 — 의 오류는 렌더 중이나 이펙트 안에서 던지지 않고, 폼이 커밋된 뒤 `onError`와 주인 없는 오류 싱크로 드러낸다(ERROR-007). 렌더 중에 던지지 않는 것은 드러남의 자리일 뿐이며, 마운트에서 폼이 서는지는 아래 원인별 규칙이 정한다(ERROR-007). 호스트나 사용자 주입 구성 요소의 이펙트에서 연 사슬은 그 코드가 호출자이므로 사슬 끝에서 던지고, 가까운 바운더리가 받는다(호스트 이펙트면 호스트의 바운더리)(ERROR-007). React 이벤트 처리기에서 시작된 쓰기의 throw는 화면과 입력을 내리지 않고 전역 오류로 보고되며, 호스트 이펙트에서 부른 쓰기의 throw는 호스트의 바운더리로 가 화면을 내릴 수 있다(ERROR-007).

**주인 없는 오류 싱크.**(ERROR-008) 부른 쪽이 없는 오류는 한 싱크로 드러낸다(ERROR-008). `window`가 있으면 `reportError`를 부르고, 없으면 `ErrorEvent`가 있을 때만 `window`에 보내며 취소되지 않으면 `console.error`를 한 번 낸다(ERROR-008). `window`가 없으면(서버 사이드 렌더링) `console.error` 한 번이다(ERROR-008). `process.emit('uncaughtException')`은 부르지 않는다(ERROR-008).

【추론】 되먹임 거부를 호출자에게 알리는 별도 표면은 두지 않는다(ERROR-194).
【추론】 거부된 리스너 되먹임 쓰기는 안쪽 진입이므로 정상 반환한다(ERROR-194).
【추론】 사슬 머리가 끝날 때 `FEEDBACK_LIMIT_EXCEEDED`를 던지고, 그 기록은 `onError`로 간다(ERROR-194).
【추론】 비객체 V의 `Merge`, `setValue(undefined)`, 되먹임 거부 표면에서는 새 오류 코드가 생기지 않는다(ERROR-194, WRITE-079, WRITE-090).

### 2.5 마운트 정착 오류

**마운트 정착의 오류 — 원인별.**(ERROR-077) 마운트 정착의 오류는 렌더 중에 던지지 않고 트리를 만드는 자리(청사진 오류와 같은 자리)에서 잡는다(ERROR-077).

공유 충돌: 모든 환경에서 폼이 서지 않는다(ERROR-078).

폼 자리에 청사진 오류와 같은 대체 화면을 그리고, 커밋 뒤 이펙트에서 `onError`와 싱크로 드러낸다(14라운드 O-10)(ERROR-079).

예산 초과, 식·가드 실패, 동적 `controls.injectTo` 대상 없음: 폼이 선다(R17-1 나)(ERROR-080).

원인마다 정의된 값(예산 초과는 원본 B, 식·가드 실패는 ERROR-122의 자리별 값, 대상 없음은 그 규칙을 후보에서 뺌)으로 정착을 마치고 커밋하며, `diagnostics`는 `degraded`로 시작한다(ERROR-134, ERROR-081).

오류는 커밋 뒤 준비 이펙트에서 `onError`와 싱크로 드러낸다(ERROR-082).

폼이 서는 원인에서는 마운트에서도 폼이 커밋한 값을 잃지 않는다(ERROR-083).

어느 경우든 생성 자리에서 잡으므로 서버 사이드 렌더링의 페이지는 실패하지 않는다(ERROR-084). 클라이언트는 하이드레이션에서 트리를 다시 만들어 같은 오류를 커밋 뒤에 드러낸다(ERROR-084). reset 재생성의 첫 로드는 호출자가 있는 사슬이므로 새 트리로 커밋하고 핸들을 바꾼 뒤 reset의 사슬 끝에서 던진다(ERROR-084).

### 2.6 식과 가드의 실패

식은 네 자리에서 평가된다(ERROR-120).

던지면 그 자리마다 정의된 값으로 정착을 마치고, 사슬의 끝에서 모든 환경에서 throw한다(R17-1 나, 가칭 코드 `SCHEMA_FORM_ERROR.EXPRESSION_THREW`, 원래 예외는 `details.error`)(ERROR-121).

(ERROR-122)

| 자리 | 던지면 |
| --- | --- |
| 게이트(`if` 게이트 함수와 그 가드, `controls.active`) | 그 게이트는 거짓이다 |
| 상태 키(`controls.visible`·`controls.readOnly`·`controls.disabled`, 조각과 `controls.children`의 `controls`) | 그 선언은 없는 것이다 |
| 파생 규칙(`controls.derived`·`controls.injectTo`·`controls.unsetValue`), 동적으로만 아는 `controls.injectTo` 대상이 없음 | 그 규칙을 그 라운드의 후보에서 빼고 에지를 소비한다 |
| `controls.resetInteraction` | 그 판정은 거짓이다 |

형상에 없는(비활성) 노드를 가리키는 것은 오류가 아니다 — 형상에 없는 노드의 규칙은 평가하지 않고 그 노드에 쓰지도 않는다(ERROR-124, WRITE-029). 【추론】 '그 노드에 쓰지도 않는다'는 형상에 없는 노드 자신의 규칙에 대한 말이며, 다른 규칙이 그 노드를 겨눈 쓰기(`controls.injectTo`)에는 적용되지 않는다(CONTROLS-053, WRITE-018과 같은 분배)(ERROR-124, CONTROLS-053, WRITE-018).

식이나 가드가 던져 거짓이 된 게이트로 나간 노드에는 나감 비움을 적용하지 않는다(작성자의 잘못으로 커밋된 값을 잃지 않는다)(ERROR-125).

어느 자리든 식이나 가드가 던지면 그 커밋은 `degraded`다(ERROR-132, ERROR-126).

가드의 평가 실패와 컴파일 실패는 가칭 `SCHEMA_FORM_ERROR.GUARD_FAILED`, 동적 대상 없음은 가칭 `SCHEMA_FORM_ERROR.INJECT_TARGET_MISSING`이다(ERROR-127).

### 2.7 진단 기록과 원인

`diagnostics`는 상태(`raw`·`extras`)도 계산 결과((스키마, 원본)의 함수)도 아니라 **작업의 기록**이다(VALUE-002의 분류. 재계산 목록·`revision`·커밋 번호와 같은 칸)(ERROR-128, VALUE-002).

`setValue(V)`는 로드가 아니라 전체 교체 쓰기이고, `diagnostics`는 폼 수준 로드인 마운트·`FormHandle.reset()`에서만 초기화하며 `setValue(V)`와 `resetSubtree()`는 초기화하지 않는다(ERROR-129, ERROR-204, WRITE-090).

모양은 `{ status: 'stable' | 'degraded', cause?: 'budget' | 'expression' | 'injectTarget' | 'sharedConflict', exceededBudget?: 'hostWheel' | 'derive' | 'transition', iterations?, commit? }`이며 모든 칸은 `commit` 번호의 커밋을 기술한다(ERROR-130, ERROR-131). 재귀 펼침의 멈춤이 `exceededBudget` 값 (가칭) `'recursion'`을 더한다(ERROR-130, ERROR-190). `cause`에 다섯째 값 (가칭) `'writeShape'`가 더해진다(ERROR-130, ERROR-195).

작성자의 선언이 빠지거나 뜻대로 평가되지 못한 커밋 — 원본 B, 어느 자리든 `controls`의 식·가드의 throw, 동적 `controls.injectTo` 대상 없음, 공유 충돌, 가상 노드에 모양이 틀린 자동 쓰기 — 이 하나라도 있으면 `status = 'degraded'`이고 `commit`은 그 첫 커밋 번호다(ERROR-132, ERROR-195).

`cause`는 예산 초과면 `'budget'`, `controls`의 식이나 `if` 가드의 평가·컴파일 실패면 `'expression'`, 동적 대상 없음이면 `'injectTarget'`, 공유 충돌이면 `'sharedConflict'`, 자동 쓰기가 대상이 받을 수 없는 모양의 값을 내면 다섯째 값 (가칭) `'writeShape'`다(R17-1 나가 식과 가드의 실패를 한 묶음으로 둔 것을 따른다)(ERROR-133, ERROR-195).

마운트 정착에서 난 것이면 `degraded`로 시작한다(ERROR-081, ERROR-134).

### 2.8 진단 기록의 지속과 초기화

**다음 로드까지 남는다.**(ERROR-135)

【추론】 `diagnostics`와 경고 중복 키는 폼 수준 로드(마운트, `FormHandle.reset()`)에서만 초기화한다(ERROR-030, ERROR-135, ERROR-164, ERROR-172, ERROR-196, ERROR-202, ERROR-204). 【추론】 `setValue(V)`와 `resetSubtree()`는 초기화하지 않는다(ERROR-030, ERROR-135, ERROR-164, ERROR-172, ERROR-196, ERROR-202, ERROR-204).

지속은 14라운드 답 O-2 가다(ERROR-136).

원인을 넷으로 넓힌 것과 그 동안의 제출 거부는 17라운드 소유자 답 R17-1 나다(10라운드 B-1의 제출 비차단을 대체한다)(ERROR-137).

【추론】 `degraded`에서 돌아오는 길은 `FormHandle.reset()`이다(ERROR-204).

- PR: PR-2(진단)(ERROR-204).
- 무엇: 한 하위 트리의 예산 초과로 `degraded`가 된 폼에서 다른 하위 트리의 `resetSubtree()`, 루트 `setValue(V)`, `FormHandle.reset()`을 차례로 부르고 `diagnostics`, 경고 중복 키, 제출 거부를 본다(ERROR-204).
- 통과: 앞의 둘 뒤에는 `degraded`, 중복 키, 제출 거부가 그대로 남고, `FormHandle.reset()` 뒤에는 `stable`이며 중복 키가 비었다(ERROR-204).
- 실패: 초기화하는 로드의 목록을 고친다(ERROR-204).

### 2.9 상태 저하와 제출 거부

그 동안 `<Form>`의 제출 경로(`FormHandle.submit`, `useFormSubmit`, 네이티브 submit — 모두 `async onSubmit` 하나로 모인다)는 `SchemaFormError`(가칭 코드 `SCHEMA_FORM_ERROR.SUBMIT_WHILE_DEGRADED`, 제출 시도마다 새 객체)로 거부한다(ERROR-138).

`FormHandle.submit`과 `useFormSubmit`은 그 프로미스를 거부하고, 부른 쪽이 기다리지 않는 네이티브 submit은 `onError` 뒤 싱크로 보낸다(ERROR-139).

core는 제출을 모르므로 거부는 렌더 계층의 일이다(원리 P5(core는 렌더러를 모른다), ERROR-140).

`getValue()`는 막지 않는다(ERROR-141).

**제출이 막힐 때 호스트가 그릴 자리.**(ERROR-142) 폼은 `degraded`를 화면에 그리지 않는다(ERROR-142). 호스트는 두 자리에서 폼 수준 표시(배너, 제출 버튼의 비활성 같은 것)를 그린다(ERROR-142). 하나는 제출 거부의 `SchemaFormError`다(`FormHandle.submit`·`useFormSubmit`의 거부, 네이티브 submit이면 `onError` 기록)(ERROR-142). 다른 하나는 `onDiagnosticsChange`(`status`와 `cause`)로, 제출 전에 막힘을 미리 알 수 있다(ERROR-142). `setValue(V)`는 로드가 아니라 전체 교체 쓰기이고, `diagnostics`는 폼 수준 로드인 마운트·`FormHandle.reset()`에서만 초기화하므로 `setValue(V)`와 `resetSubtree()`로는 돌아오지 않으며, `degraded`에서 돌아오는 길은 `FormHandle.reset()`이다(ERROR-142, ERROR-204, WRITE-090).

되먹임 파동과 `onChange` 중첩의 초과는 소비자 코드의 쓰기를 거부한 것이지 작성자의 선언을 뺀 것이 아니므로 `diagnostics`에 남기지 않고 사슬의 끝에서 던지기만 한다(`exceededBudget` 다섯 값을 셋으로 줄인다)(ERROR-142, EVENT-008, ERROR-130). 재귀 펼침의 멈춤이 (가칭) `'recursion'`을 더해 `exceededBudget`의 값은 넷이다(ERROR-142, ERROR-190).

같은 제출 거부라도 `degraded`는 기록되고 검증 실패는 기록되지 않는다(ERROR-016). 앞의 것은 폼의 약속이 깨진 사건이고 뒤의 것은 검증 결과이기 때문이다(ERROR-016).

작성자 스키마·호출자 데이터에서 온 정착 오류(예산 초과, `controls` 식·가드 실패, `controls.injectTo` 대상 없음)는 모든 환경에서 커밋·통지 뒤 사슬 끝에서 던지고, `degraded`가 다음 로드까지 남아 그 동안 폼의 제출 경로가 `SchemaFormError`로 거부한다(`getValue()`는 막지 않는다)(ERROR-172).

끄는 스위치는 없다(17라운드 소유자 답 R17-1 나. 12라운드 §4·10라운드 B-1·14라운드 O-4 가를 대체한다)(ERROR-173).

### 2.10 검증기 출처와 미등록

검증기는 플러그인(전역 기본) 또는 Form 속성 `validatorFactory`(그 폼의 인스턴스, 14라운드 답 O-7)에서 온다(ERROR-143). 어느 경우도 청사진 오류가 아니며 폼은 선다(ERROR-144). 기본 검증 모드 `OnChange | OnRequest`는 그대로 두고 '검증기가 있으면 `OnChange`, 없으면 `None`' 같은 암묵 기본값은 두지 않는다(ERROR-145).

**검증기 없음**(플러그인에도 `validatorFactory`에도 없고 검증 모드가 `None`이 아님): 거부하지 않고 검증 없이 진행한다(17라운드 소유자 답, 통보3: "오류만 내보내고 거절은 하지 마시죠. 사용자가 인지만 하면 될거고, 기본값이 있어서 사용자가 오히려 불편할겁니다")(ERROR-146). 개발 모드 콘솔과 `onError`의 경고 기록(`level: 'warning'`, 가칭 코드 `SCHEMA_FORM_WARNING.VALIDATOR_MISSING`, 17라운드 소유자 답 (가))으로 알린다(ERROR-147). 트리마다 한 번(마운트, 재생성 reset) 보내고, 값을 통째로 바꾸는 `setValue`나 같은 스키마 reset에서는 다시 보내지 않는다(ERROR-148). 전달 시점은 마운트면 준비 이펙트, 재생성 reset이면 reset 사슬 끝이다(ERROR-149). 프로덕션에는 기본 출력이 없다(ERROR-150). 검증을 쓰지 않는 폼은 검증 모드를 `None`으로 적으면 알림이 없다(ERROR-151).

### 2.11 조건부 스키마와 가드 컴파일

**조건부 스키마.**(ERROR-152) VALIDATE-025와 VALIDATE-042의 합의("조건부 비활성 + 경고", 소유자 동의)를 유지한다(ERROR-153, VALIDATE-025, VALIDATE-042). 검증기가 없으면 `if` 게이트의 조각은 꺼진 채 두고 경고(가칭 `SCHEMA_FORM_WARNING.CONDITIONAL_SCHEMA_WITHOUT_VALIDATOR`)를 트리마다 한 번 낸다(ERROR-154).

**가드.**(ERROR-041) 프로덕션에서 가드는 처음 필요할 때 늦게 컴파일한다(작성 루트 기준 캐시. TEST-036의 '늦추고'는 프로덕션의 규칙으로 유지한다)(ERROR-041, TEST-036). 개발 모드에서는 청사진에서 모든 가드를 한 번 컴파일해 본다(ERROR-041). 어느 환경이든 컴파일 실패는 그 게이트의 가드 실패다(게이트는 거짓, R17-1 나에 따라 정착 오류)(ERROR-041, ERROR-121, ERROR-122). 청사진 오류가 아니므로 두 환경의 형상이 같고(목표 G5(한 장으로 설명되는 라이프사이클)), 개발 모드가 앞당기는 것은 `onError` 기록의 시점(마운트의 커밋 뒤)뿐이다(ERROR-041, GOAL-009). 프로덕션에서 한 번도 평가되지 않은 가드의 실패는 기록이 없다(ERROR-041).

AJV에서 가드의 호출은 싸고(좁은 가드 5–58 ns, 루트에 걸린 가드 200개를 키 입력마다 전부 돌려 7.9 µs) 비싼 것은 **컴파일**이다(가드 하나에 70–270 µs, 200개면 폼 생성 시점에 14–54 ms)(ERROR-041, TEST-036). 컴파일의 실패(지원하지 않는 정규식 등)를 폼 생성의 실패로 둘 것인가(ERROR-041). Python 정규식 `(?i)…`은 Ajv 컴파일이 throw한다(ERROR-041). 17라운드에 닫혔다: 가드 컴파일의 실패는 폼 생성의 실패가 아니라 그 게이트의 가드 실패(정착 오류)이고, 전체 스키마 컴파일의 실패는 검증 불가다(ERROR-041, ERROR-155).

### 2.12 검증 불가와 실행 실패

**검증 불가**(검증기는 있으나 전체 스키마 컴파일이 실패함): 한 로드에 오류 객체 하나(가칭 `SCHEMA_FORM_ERROR.VALIDATOR_COMPILE_FAILED`)로 커밋 뒤 첫 `OnChange` 검증, `validate()`, 제출을 모든 환경에서 거부하고(R17-1 나), `onError`와 (부른 쪽이 없으면) 싱크로 한 번 드러낸다(ERROR-155). 그 로드에서 `OnChange` 검증을 다시 예약하지 않는다(ERROR-156). 노드 `errors`에는 넣지 않는다(사용자의 잘못이 아니다)(ERROR-157). 통보3의 근거(검증 없이 폼만 그리는 사용예, 기본 모드의 불편)는 검증기를 준 이 경우에 닿지 않는다(ERROR-158).

**검증 실행 실패**(검증 함수의 런타임 throw, 요청 시점의 `$ref` 순환, 가칭 `SCHEMA_FORM_ERROR.VALIDATOR_THREW`): 호출자가 기다리는 `validate()`와 제출은 그 프로미스의 거부로 드러낸다(ERROR-039). `OnChange` 검증이면 `onError`에 한 번, 이어 싱크로 한 번 드러내며, core가 소유한 프로미스를 미처리 거부로 남기지 않는다(ERROR-039). 모든 환경에서 같다(ERROR-039). 입력의 판정과의 경계는 `ValidateFunction`의 문서 주석 "입력의 판정은 돌려주고 던지지 않는다. 던지면 실행 실패다"로 못박는다(ERROR-039). 그래서 실행 실패는 검증 결과가 아니며 `onValidate`로 가지 않는다(ERROR-039). 폼 쪽 타입은 이미 동기 반환을 허용한다: `Promise<JSONSchemaError[] | null> | JSONSchemaError[] | null`(`src/types/error.ts:209-212`)(ERROR-039).

**로드 검증의 자리.**(ERROR-040) 마운트 로드는 검증을 요청하지 않고, 렌더 계층이 준비 시점(폼이 커밋된 뒤, 오늘 `handleReady`의 자리)에 `OnChange` 비트가 켜져 있으면 한 번 요청한다(ERROR-040). reset의 로드는 진입 끝에서 요청한다(ERROR-040). 규칙은 '로드 뒤 `OnChange` 비트면 한 번'으로 같다(ERROR-040). 그래서 서버 사이드 렌더링에서는 검증이 돌지 않는다(ERROR-040). core만 쓰는 호스트(목표 C3(프레임워크 독립적인 core))는 마운트 검증을 직접 요청한다(ERROR-040, GOAL-016). 【추론】 로드 뒤 `OnChange` 비트면 한 번 하는 검증(LANDING-041, ERROR-040, EVENT-032)은 `resetSubtree()`에는 그 하위 트리에만 적용한다(ERROR-040).

【추론】 이 경우는 오류도 경고도 아니다(ERROR-201). 【추론】 재생성 reset은 원자적으로 성공한다(ERROR-201). 【추론】 플러그인이 떼어 두지 못해 등록이 실패하면 새 코드 없이 있는 부류로 드러낸다(ERROR-201). 【추론】 전체 컴파일은 `SCHEMA_FORM_ERROR.VALIDATOR_COMPILE_FAILED`, 가드는 `SCHEMA_FORM_ERROR.GUARD_FAILED`이며, `details`에 가칭 `reason: 'duplicateSchemaId'`와 `$id`를 싣는다(ERROR-201). 【추론】 (미정) 행(ERROR-198)의 이 줄은 "코드 없음"으로 닫는다(ERROR-201, ERROR-198).

### 2.13 오류 관찰자의 원칙

Form 속성 `onError(record)`는 검증 결과를 뺀 폼 내부의 오류와 경고를 같은 모양의 기록으로 받는 **관찰자**다(17라운드 4번 수렴의 안 B, 17라운드 스웜 수렴(편집자 결정), 소유자의 "validate error 가 걸러진 에러 로깅용 전용 채널")(ERROR-094, ERROR-095). 핸들러는 흐름을 바꾸지 못한다(ERROR-096). 반환값은 무시되고, 어떤 기본 드러남(사슬 끝 throw, 프로미스 거부, 주인 없는 오류 싱크, 개발 모드 콘솔)도 대신하거나 끄지 못하므로, 핸들러가 던지지 않는 한 핸들러가 있든 없든 폼의 동작은 같다(핸들러가 던지면 그 예외도 원래 오류와 함께 드러난다)(ERROR-097). 핸들러가 없으면 비용도 없다(ERROR-098). `throwOnBudgetExceeded`는 없고(R17-1 나), 가칭 `onListenerError`는 `onError`에 흡수된다(ERROR-099).

Form 속성 `onError(record)`는 검증 결과를 뺀 폼 내부의 오류와 경고를 같은 모양의 기록으로 받는 관찰자다(17라운드 스웜 수렴(편집자 결정), 안 B. 받는 것·받지 않는 것·기록 모양·시점은 ERROR-014·ERROR-100·ERROR-101·ERROR-017·ERROR-019)(ERROR-174). 핸들러는 흐름을 바꾸지 못하며(던질 것은 던지고 기본 출력도 그대로), 핸들러가 없으면 비용이 없다(ERROR-175). "프로덕션은 기본 출력 없음"은 기본 출력에만 해당하며, `onError` 핸들러는 모든 환경에서 경고를 받는다(ERROR-176). 가칭 `onListenerError`는 두지 않는다(`onError`에 흡수)(ERROR-177).

### 2.14 관찰자 계약과 수신 범위

아래가 계약이다(17라운드 4번 수렴의 계약 열아홉 항목에 게이트 R17G-1–R17G-11의 고침을 모두 적용한 것)(ERROR-013). **이름과 자리.**(ERROR-013) Form 속성은 `onError?: (record: FormErrorRecord) => void`다(ERROR-013). 기록 형 `FormErrorRecord`와 코드 형 `FormErrorCode`(문자열 리터럴 합집합)는 가칭이며 PR-4에서 확정한다(ERROR-013). 렌더 계층(React 바인딩)이 이 속성을 소유하고 `useHandle`로 최신 속성을 부른다(`Form.tsx:110`과 같은 방식)(ERROR-013). 그래서 인라인 함수를 넘겨도 트리와 캐시를 다시 만들지 않는다(ERROR-013). core는 React를 모르므로(목표 C3(프레임워크 독립적인 core)) 트리를 만들 때 보고기 `{ report(record): void; hasConsumer(): boolean }`(가칭) 하나를 인자로 받고, 트리마다 하나인 `SchemaNodeRuntime`이 그것을 든다(ERROR-013, GOAL-016). 렌더 계층의 `hasConsumer`는 부를 때마다 '최신 `onError` 속성이 함수임 또는 `process.env.NODE_ENV !== 'production'`'을 돌려주고, core는 기록·서식·경고 판정 전에 매번 이것을 묻는다(ERROR-013). 마운트 뒤에 핸들러를 새로 단 폼은 그 뒤의 사건부터 받고, 이미 지난 로드의 청사진·마운트 기록은 받지 않는다(ERROR-013). core만 쓰는 호스트는 자기 보고기를 넘긴다(ERROR-013). 선언의 문서 주석 첫 줄은 "폼 내부의 오류와 경고를 받는 관찰자. 검증 결과는 오지 않는다(onValidate). 반환값은 무시되고 오류를 막지 못한다"이다(이름이 검증 오류로 읽히는 함정을 푼다)(ERROR-013).

**받는 것.**(ERROR-014) 폼 인스턴스에 묶인 오류 층과 경고 층의 사건 전부다(ERROR-014).

- 청사진 오류와 경고(ERROR-014).
- 마운트 정착의 오류와 경고(ERROR-014).
- 정착 오류와 경고: 예산 초과, 식·가드 실패, 동적 대상 없음, 공유 충돌, 게이트 가진 분기 둘 이상 켜짐(ERROR-014).
- 되먹임·중첩 초과(ERROR-014).
- 리스너 오류: 구독 리스너, `onChange`, `onStateChange`, `onDiagnosticsChange`, `batch` fn, 검증 결과 파동의 리스너와 `onValidate`(ERROR-014).
- 호출자 오류: `Overwrite`와 `Merge`를 함께 준 `setValue`, 재생성 reset으로 폐기된 노드에 대한 쓰기, `FormTypeInputMap` 패턴(ERROR-014).
- `degraded` 동안의 제출 거부(ERROR-014).
- 검증 불가(검증기는 있으나 컴파일 실패)(ERROR-014).
- 검증기 실행 실패(ERROR-014).
- 바운더리가 잡은 렌더 오류(ERROR-014).
- 검증기 없음과 조건부 스키마 경고(ERROR-014).
- 렌더 계층 경고: 가상화 꺼짐, `presentation` 키 의심(ERROR-014).

**받지 않는 것.**(ERROR-100)

- 정착 추적(개발 모드 기록)(ERROR-100).
- `diagnostics`의 상태 변화(원인 오류는 기록된다)(ERROR-100).
- 묶음 `SchemaFormError` 자체(구성 오류마다 기록한다)(ERROR-100).
- 핸들러 자신의 예외와 핸들러 안 쓰기의 거부(ERROR-100).
- 호스트 `onSubmit`이 던지거나 거부한 것(호스트 자신의 코드이며 제출 프로미스로 부른 쪽에 간다)(ERROR-100).
- 폼 인스턴스 밖의 사건: `registerPlugin`의 `UNHANDLED_ERROR.REGISTER_PLUGIN`(ERROR-100).
- React 자신의 경고와, core가 감지하지 않는 렌더 중 쓰기(원리 P5(core는 렌더러를 모른다))(ERROR-100, GOAL-031).
- 검증 결과 전부: 노드 `errors`의 `ValidationIssue`, `onValidate`, `errors` 속성과 `setExternalErrors`·`clearExternalErrors`, 제출의 `VALIDATION_ERROR.SCHEMA_VALIDATION_FAILED`(17라운드 소유자 답, 통보4 둘째 답)(ERROR-101).

### 2.15 기록의 모양과 전달 시점

**기록 모양.**(ERROR-017) `{ level: 'error' | 'warning'; code: FormErrorCode; message: string; path?: string; schemaPath?: string; details?: ErrorDetails; error?: unknown; aggregate?: SchemaFormError; surface?: 'thrown' | 'rejected' | 'sink'; componentStack?: string }`(ERROR-017).

- `code`: `BaseError.code`와 같은 `<GROUP>.<SPECIFIC>` 형식이다(`packages/winglet/common-utils/src/errors/BaseError.ts:29-32`)(ERROR-017). 경고는 `SCHEMA_FORM_WARNING.<SPECIFIC>`이다(ERROR-017). 소비자 코드의 예외에는 폼이 부류 코드(가칭 `SCHEMA_FORM_ERROR.LISTENER_THREW`, `SCHEMA_FORM_ERROR.RENDER_FAILED`)를 붙인다(ERROR-017).
- `message`: 프로덕션에서도 줄이지 않으며, 전달할 때 한 번 서식한다(ERROR-017).
- `path`: 데이터 경로(JSON Pointer)이며, 노드에 묶인 사건에만 있다(ERROR-017).
- `schemaPath`: 작성된 스키마 안의 위치(JSON Pointer)이며, 청사진 사건에 있다(ERROR-017).
- `details`: 오류면 `error.details`와 같은 참조이고, 경고면 경고의 세부다(ERROR-017).
- `error`(`level`이 `'error'`일 때만): 폼이 드러내는 바로 그 값이다(ERROR-017). 폼이 감싸는 식·가드 예외는 `SchemaFormError`이고 원래 예외는 `details.error`에 있다(ERROR-017). 감싸지 않는 소비자 예외 하나와 사용자 렌더 오류는 원래 값 그대로다(ERROR-017).
- `aggregate`: 둘 이상이 묶여 던져졌을 때 실제로 던진 묶음이다(ERROR-017).
- `surface`(`level`이 `'error'`일 때만): 그 오류가 핸들러 밖에서 드러나는 길이다(ERROR-017).
- `componentStack`: 바운더리가 잡은 오류에만 있으며, `errorInfo.componentStack`이다(ERROR-017).

호스트는 `aggregate ?? error`의 동일성으로 전역 처리기와의 중복을 거를 수 있다(ERROR-017). 다만 핸들러가 던져 부른 쪽이 있는 자리에서 새 묶음이 생기면, 이미 전달된 기록의 `aggregate ?? error`와 실제로 던진 값은 다르다(핸들러 결함의 경우다)(ERROR-017). 경고는 `BaseError` 인스턴스가 아닌 평범한 기록이다(ERROR-017).

**시점.**(ERROR-019) 한 사건에 기록 하나이며, 발생 순서대로 부른다(ERROR-019).

1. 렌더 중에 트리를 만드는 자리가 하는 일(청사진, 마운트 정착)의 기록은 그 로드 객체(`useMemo`의 결과)에 모은다(ERROR-019). 폼이 커밋된 뒤 준비 이펙트에서 초기 `onChange` 다음에 부른다(ERROR-019). 청사진 오류로 폼이 서지 않으면, 생성 자리가 돌려준 실패 로드가 그 오류와 그 전에 모인 경고를 들고 대체 화면의 이펙트가 부른다(ERROR-019). 커밋되지 않은 로드의 기록은 부르지 않는다(ERROR-019). 다만 루트 바운더리가 하위 트리를 버리고 대체 화면을 그리면, 바깥 감싸개의 보고기가 가장 최근에 만든 로드를 들고 있다가 루트 바운더리의 `componentDidCatch`가 그 로드의 오류 층 기록을 렌더 실패 기록보다 먼저 `onError`와 싱크로 보낸다(ERROR-019). 경고 기록은 버린다(청사진 경고는 캐시에 남는다)(ERROR-019). 입력 맵 정규화의 오류는 트리보다 먼저 던져져 루트 바운더리가 잡으므로 여섯째를 따르고, 가상화 관리자 생성의 경고는 일곱째를 따른다(ERROR-019).
2. 마운트 뒤의 사슬은 커밋 → 통지 → 검증 요청 → `onChange` → 기록마다 `onError`(경고 포함) → throw의 순서다(ERROR-019). 정착 도중에는 부르지 않는다(ERROR-019). reset의 재생성과 첫 로드도 reset 사슬의 끝에서 부른다(ERROR-019).
3. `validate()`와 제출은 오류 층의 원인(검증기 실행 실패, 검증 불가, `degraded`)일 때만 거부 직전에 부른다(ERROR-019). 부른 쪽이 기다리지 않는 네이티브 submit 경로에서는 거부 대신 `onError` 뒤 싱크로 보낸다(ERROR-019).
4. 호출자 오류는 throw 직전에 부른다(ERROR-019).
5. `OnChange` 검증의 실행 실패와 검증 결과 파동의 리스너 예외는 그것을 알게 된 마이크로태스크에서 `onError` 뒤 싱크로 보낸다(ERROR-019).
6. 바운더리가 잡은 오류는 `componentDidCatch`에서 `onError` 뒤 싱크로 보낸다(ERROR-019).
7. 렌더 계층 경고는 그 필드나 폼의 커밋 뒤 이펙트에서 부른다(ERROR-019). 지연 마운트된 필드면 그 필드가 커밋된 뒤다(ERROR-019).
8. 재대조(레이아웃 효과)의 기록은 그 레이아웃 효과에서 부른다(ERROR-019).

청사진 경고는 청사진 캐시에 남아 다음 커밋된 로드에서 간다(ERROR-019).

**렌더 중 보증의 범위.**(ERROR-020) 폼이 여는 렌더 단계 작업(청사진, 마운트 정착, 입력 맵 정규화)에서는 부르지 않는다(ERROR-020). 호출자가 렌더 중에 연 사슬(core가 감지하지 않는 사용자 코드의 쓰기, 원리 P5(core는 렌더러를 모른다))은 호출자의 오용이므로 그 안의 전달 시점은 보증하지 않는다(REACT-013의 문서화 항목 '렌더 중 사용자 코드의 쓰기는 React의 렌더 중 갱신 경고를 받는다'와 같은 자리에 적는다)(ERROR-020, GOAL-031, REACT-013).

**환경.**(ERROR-021) 클라이언트의 모든 환경에서 같은 사건은 같은 `code`, `level`, `details`, `surface`로 한 번 간다(목표 G5(한 장으로 설명되는 라이프사이클))(ERROR-021, GOAL-009). 핸들러가 있으면 프로덕션에서도 경고를 받는다(ERROR-021). 예외는 하나다(ERROR-021). 가드 컴파일 실패는 개발 모드가 시점을 앞당겨 마운트의 커밋 뒤에 보낸다(`surface`는 `'sink'`)(ERROR-021). 프로덕션에서는 그 가드를 처음 평가하는 사슬 끝에서 보내며(`surface`는 `'thrown'`), 한 번도 평가되지 않은 가드의 실패는 기록이 없다(ERROR-021, ERROR-041). 오류 메시지는 어느 환경에서도 줄이지 않는다(ERROR-021).

**중복 막기 — 오류.**(ERROR-023)

- 원점 경로(사슬 끝, 거부, 호출자 오류, 마이크로태스크, 로드 전달)는 사건마다 부른다(ERROR-023). 그래서 소비자가 같은 객체를 되풀이해 던져도 사건마다 기록된다(ERROR-023).
- 폼이 던진 객체 값(원래 값 그대로 던진 소비자 예외와 묶음 포함)은 폼 인스턴스의 `WeakSet`에 넣는다(ERROR-023). `componentDidCatch`는 잡은 값이 그 집합에 있으면 집합에서 한 번 빼고 핸들러 전달만 건너뛴다(ERROR-023). 싱크는 그 경로가 처음이므로 부른다(ERROR-023). 집합에 남은 값(폼 밖 바운더리가 잡아 빠지지 않은 것)을 폼 안의 다른 렌더가 같은 값을 또 던지면, 그 렌더 실패의 핸들러 전달이 한 번 빠질 수 있다(싱크는 간다)(ERROR-023).
- 원시값(문자열, 숫자)은 `WeakSet`에 넣을 수 없으므로 표지 없이 사건마다 보낸다(ERROR-023). 이펙트에서 연 사슬의 원시값 throw가 필드 바운더리에 다시 잡히면 두 번 갈 수 있다(ERROR-023).
- 검증 불가는 한 로드에 오류 객체 하나이며, 그 로드에서 처음 드러날 때 한 번 보낸다(ERROR-023).
- 묶음은 구성 오류마다 기록하고, 묶음 자체는 `aggregate` 칸으로만 싣는다(ERROR-023).

**중복 막기 — 경고.**(ERROR-024) 키는 서식 전의 구조 키다(ERROR-024). code, 위치(`path`, 없으면 `schemaPath`, 둘 다 없으면 폼 수준), 코드마다 정한 판별 칸(예: `ALL_OF_KEYWORD_IGNORED_FOR_FORM`의 `keyword`, `PRESENTATION_KEY_SUSPECT`의 키 이름)으로 이룬다(ERROR-024). 메시지는 이 키를 통과한 첫 번에만 서식한다(ERROR-024). 키는 폼 인스턴스의 폼 수준 로드인 마운트·`FormHandle.reset()`에서만 비우며, `diagnostics`와 같은 단위다(ERROR-024, ERROR-204). 루트 전체 교체(`setValue(V)`)는 로드가 아니라 전체 교체 쓰기이고, `setValue(V)`와 `resetSubtree()`는 경고 중복 키와 `diagnostics`를 비우지 않는다(ERROR-024, ERROR-204, WRITE-090). 집합은 핸들러가 있을 때만, 처음 경고가 날 때 만든다(ERROR-024). 청사진 경고는 청사진의 목록이 이미 발생마다 하나씩이라 따로 거르지 않는다(ERROR-024). 검증기 없이 쓰는 폼은 트리마다 `VALIDATOR_MISSING` 하나를 받으며, 검증 모드를 `None`으로 적으면 사라진다(ERROR-024, ERROR-148, ERROR-151).

**서버.**(ERROR-025) 서버에서는 부르지 않는다(ERROR-025). 이펙트, `componentDidCatch`, 사슬, 검증이 서버 렌더에서 돌지 않기 때문이다(ERROR-025). 서버에서 생성 자리에 잡힌 오류는 싱크의 서버 가지(`console.error` 한 번)로만 남는다(ERROR-025). 서버의 기록을 클라이언트로 옮기지 않는다(ERROR-025). 하이드레이션이 트리를 다시 만들 때 같은 기록이 클라이언트 준비 이펙트에서 한 번 간다(ERROR-025). 서버 개발 모드의 콘솔 경고는 오늘처럼 남는다(ERROR-025).

**StrictMode.**(ERROR-026) 로드 기록은 커밋된 로드 객체에 붙으므로, 버려진 이중 렌더의 기록은 가지 않는다(ERROR-026). 로드 객체의 '전달함' 표지는 이펙트 정리에서 되돌리지 않으므로, 이펙트가 두 번 돌아도 한 번 간다(ERROR-026). StrictMode의 흉내 언마운트·재마운트는 로드가 아니므로 경고 집합을 비우지 않는다(ERROR-026). React 18 개발 모드가 바운더리 오류를 전역 오류로 한 번 더 재생하는 것은 싱크 쪽의 사실이며, 핸들러는 `componentDidCatch`에서 한 번만 불린다(ERROR-026). 실행 확인은 PR-7의 React 18 시험에서 한다(ERROR-026).

### 2.16 핸들러 예외와 비용

외부 조사의 안 B("`onError` 하나로 보내고 없으면 throw", 17라운드 4번 수렴의 안 B와 다르다)는 소비자가 오류를 삼킬 수 있어 완결성이 깨지므로 택하지 않는다(ERROR-012). 핸들러가 받은 항목의 기본 출력을 대신하는 안도 같은 이유로 택하지 않는다(ERROR-012). 빈 핸들러 하나가 주인 없는 오류 싱크를 끄는 스위치가 되기 때문이다(ERROR-012). 버린 안의 나머지(안 A, 이름 `onLog`, 경고를 개발 모드에서만 보내는 안, 검증기 없음을 `'error'`로 두는 안, 모든 경로의 `WeakSet`, 앱 수준 기본 `onError` 등)와 근거는 `reviews/raw-round17-onerror.md`에 있다(ERROR-012).

**핸들러가 던질 때.**(ERROR-028) 모든 전달은 try/catch 안에서 한다(ERROR-028). 핸들러의 예외는 원래 사건의 기본 드러남을 건너뛰게 하거나 바꾸지 못한다(ERROR-028).

- 부른 쪽이 있는 자리(사슬 끝, `validate()`·제출의 거부, 호출자 오류의 즉시 throw): 남은 기록의 전달을 마친다(ERROR-028). 그다음 원래 드러날 값(오류 하나 또는 이미 만든 묶음)을 펼치지 않고 앞에, 핸들러 예외들을 뒤에 두고 발생 순서대로 `SchemaFormError` 하나(`details.errors`)로 묶어 던지거나 거부한다(ERROR-028). 원래 오류 객체는 `details.errors`에 그대로 남는다(ERROR-028). 경고만 있던 사슬이면 핸들러 예외(둘 이상이면 묶음)를 사슬 끝에서 던진다(ERROR-028).
- 부른 쪽이 없는 자리(커밋 뒤 이펙트, 마이크로태스크, `componentDidCatch`, 네이티브 submit): 원래 사건의 싱크는 그대로 부르고, 핸들러의 예외는 싱크로 한 번 보내며, 남은 기록의 전달은 계속한다(ERROR-028). `componentDidCatch` 밖으로 예외를 내보내지 않으므로 호스트의 바운더리가 화면을 내리지 않는다(ERROR-028).
- 핸들러 자신의 예외는 `onError`에 다시 보내지 않는다(재귀가 없다)(ERROR-028).
- async 핸들러가 거부하면, 반환값을 무시한다는 규칙에 따라 그것은 호스트 자신의 프로미스이므로 폼이 잡지 않는다(ERROR-028).

**핸들러 안의 쓰기.**(ERROR-029) 전달하는 동안 폼 인스턴스의 '전달 중' 표지를 켠다(ERROR-029). 그 사이 이 폼에 대한 쓰기(`setValue`, `reset`, `batch`, 배열 `push`·`remove`·`update`, 상태 쓰기, `setExternalErrors`·`clearExternalErrors`)는 호출자 오류(`SchemaFormError`, 가칭 `WRITE_IN_OBSERVER`)로 즉시 던지며 `onError`에 보내지 않는다(ERROR-029). 그 예외가 핸들러 밖으로 새어 나가면 '핸들러가 던질 때'의 규칙을 따른다(ERROR-029). `validate()`는 허용한다(ERROR-029). 동기 진입을 열지 않고 결과는 자기 파동으로 오기 때문이다(ERROR-029). 다만 실패 기록(`VALIDATOR_THREW`) 안에서 `validate()`를 다시 부르면 실패가 되풀이될 수 있으므로 그렇게 하지 말라고 문서에 적는다(ERROR-029). 호스트의 setState와 다른 폼에 대한 쓰기는 막지 않는다(ERROR-029). 비용은 불리언 하나다(ERROR-029).

**비용.**(ERROR-030) 소비자가 있는지는 '핸들러가 있음 또는 `process.env.NODE_ENV !== 'production'`(정적 치환)'으로 판정한다(판정은 보고기의 `hasConsumer()`로 사건마다 한다)(ERROR-030).

- 소비자가 없을 때(핸들러 없는 프로덕션): 기록 객체, 메시지 서식, 경고 집합, 정착 경고 판정, 청사진 경고 데이터를 만들지 않는다(ERROR-030). 오늘 프로덕션에서 돌다 버려지는 경고 검출과 서식(`warnIfNullUnreachable.ts:25-38`, `processAllOfSchema.ts:38-44`)도 건너뛰므로 오늘보다 싸다(ERROR-030).
- 청사진: 소비자가 있을 때 수집기 인자로 경고를 데이터(code, 위치, details, 서식 없음)로 모아 캐시에 담는다(ERROR-030). 소비자 없이 만들어진 캐시 청사진을 핸들러를 가진 폼이 처음 쓰면, 그 작성 루트에 경고 수집을 한 번 돌려 캐시 항목에 붙인다(ERROR-030). 작성 루트마다 한 번이며, 캐시와 함께 해제된다(ERROR-030).
- 핸들러가 있을 때: 사건마다 작은 객체 하나를 만든다(ERROR-030). 정착 경고는 그 정착이 다룬 `oneOf` 호스트에서 이미 계산한 게이트 결과를 세는 것이라 분기 수에 비례하고, 추가 순회가 없다(ERROR-030). 경고 집합은 서로 다른 경고 수 이하이고 폼 수준 로드(마운트, `FormHandle.reset()`)에서만 비우며, `setValue(V)`와 `resetSubtree()`는 비우지 않는다(ERROR-030, ERROR-204). `WeakSet`은 약한 참조다(ERROR-030).
- 노드 수에 비례하는 칸은 없다(ERROR-030). 오류 객체를 새로 만들지 않고 경고는 평범한 기록이므로 스택 수집 비용도 없다(ERROR-030). 고속성 대 투명성의 '프로덕션 비용 없이 추적성'을 지킨다(ERROR-030, GOAL-086).

### 2.17 렌더 오류와 바운더리

**React에서 보이는 것.**(ERROR-085) 이벤트 핸들러 안에서 던져진 예외는 에러 바운더리를 발화시키지 않는다(ERROR-086). 화면은 백지가 되지 않고 직전 커밋 상태로 남으며, 브라우저 전역 오류와 모니터링 도구에 잡힌다(ERROR-087). 폼의 바운더리(루트 바운더리와 사용자 주입 구성 요소의 필드 바운더리)는 **다시 던지지 않고 삼키지도 않는다.**(ERROR-088) 오늘처럼 가두어 대체 화면을 그리되, 잡은 오류를 `componentDidCatch`에서 `onError`와 싱크로 넘긴다(오늘은 `console.error`뿐이다)(ERROR-089).

필드 바운더리는 오늘처럼 인라인 입력(`useFormTypeInput.ts:36-37`), 덮어쓴 입력(`SchemaNodeInputWrapper.tsx:56-57`), 정의·맵의 입력(`formTypeInputDefinitions.ts:32`·`:37`, `formTypeInputMap.ts:32`·`:37`), 렌더러(`SchemaNodeProxy.tsx:59`), `Placeholder`(`VirtualizationManager.ts:214`)를 감싼다(ERROR-090). 바운더리가 다시 던지지 않으므로 오류 부류 판별(`instanceof`, `group`)에 기대지 않고, 중첩 `<Form>`의 청사진 오류는 안쪽 폼 자리에서 멈춘다(ERROR-091). 공개 동작(대체 화면)은 바뀌지 않는다(ERROR-092). 바운더리가 오류를 호스트로 올려 보내지 않는 것은 17라운드 소유자 답(통보4)이고, 핸들러의 예외를 바운더리 밖으로 내보내지 않는 것은 스웜 수렴(편집자 결정)이다(ERROR-093). 바운더리는 렌더 오류를 다시 던지지 않고 가두어 대체 화면을 그린다(ERROR-178, ERROR-088, ERROR-089).

### 2.18 폼과 필드 바운더리의 보고

**바운더리 경로.**(ERROR-110) `Form.tsx:311-312`의 범용 `withErrorBoundaryForwardRef`를 schema-form의 바깥 감싸개로 바꾼다(ERROR-111). 바깥 감싸개는 인스턴스 보고기(최신 핸들러, `WeakSet`, 경고 집합, 전달 중 표지)를 `useRef`로 들고 문맥으로 내려 주며, 그 안에 보고를 받는 루트 바운더리를 둔다(ERROR-112). 보고기가 루트 바운더리 바깥에 있으므로 대체 화면으로 바뀐 뒤에도 살아 있다(ERROR-113). 감싸는 자리가 모듈 수준(`PluginManager.ts:39-40`·`:78`), `FormProvider`(`ExternalFormContextProvider.tsx:222`), 폼마다(`FormTypeInputsContextProvider.tsx:31-36`)로 갈리는 필드 바운더리(`formTypeInputDefinitions.ts:32`·`:37`, `formTypeInputMap.ts:32`·`:37`)는 감싸기를 그대로 두고, 렌더 때 문맥에서 보고기를 읽는다(ERROR-114). 사용자 주입 구성 요소를 격리하는 필드 바운더리(`withErrorBoundary`, 패키지 규칙)는 그대로이며, 그 바운더리가 잡은 렌더 오류가 `onError`에 가는 것만 새롭다(ERROR-163).

### 2.19 오류 경계 유틸리티 확장

`@winglet/react-utils`의 `withErrorBoundary`·`withErrorBoundaryForwardRef`에는 렌더 때 보고 함수를 얻는 선택 인자를 더한다(ERROR-115). 주지 않으면 오늘 동작이고 판은 minor다(ERROR-116). 인자의 모양(ErrorBoundary 보고 콜백 속성과 그 공개, 또는 감싸개의 보고기 읽기 인자)은 PR-7에서 고른다(ERROR-117). 그 모듈 INTENT의 'Ask first' 두 항목(고차 구성 요소의 시그니처 확장, 내부 오류 경계 구성 요소의 공개 표면 승격)에 해당하며, 소유자가 확장을 허용했다(17라운드 소유자 답 (나) "(나) 확장 허용합니다")(ERROR-118). PR-7에서 그 모듈의 `DETAIL.md`를 먼저 갱신한 뒤 코드를 고친다(ERROR-119).

### 2.20 추가 경고의 발생 조건

변환에러는 onError 로 전달하죠(ERROR-184).

편집자 결정: `onError` 기록의 level은 `warning`이다(ERROR-186). 값을 보존하므로 폼의 약속은 지켜진다(ERROR-186). error 층은 throw·거부·싱크로 드러나야 해 통보 3과 부딪힌다(ERROR-186). `SCHEMA_FORM_WARNING.TYPE_MISMATCH`를 노드의 정합 상태가 켜질 때마다 한 번 보낸다(path, 기대 형, 받은 값의 종류, 쓰기 출처)(ERROR-186, SURFACE-061). level은 `warning`이다(개발 모드 콘솔, 프로덕션은 핸들러가 있을 때만)(ERROR-186). 【추론】 `SCHEMA_FORM_WARNING.TYPE_MISMATCH` 기록은 `{ level: 'warning', code, path, expected: { schemaType, nullable, effective }, received, reason, candidates?, source }`이다(ERROR-186, EVENT-060, SURFACE-061). 【추론】 `expected.schemaType`은 `node.schemaType`이고, `expected.effective`는 그 커밋의 유효 목록이다(ERROR-186). 【추론】 `source`는 EVENT-060의 쓰기 출처 값에 `'gate'`를 더한 것이다(ERROR-186, EVENT-060). 게터 `typeMismatch: boolean`, 경로 목록 `typeMismatches: readonly string[]`, 경고 코드 `SCHEMA_FORM_WARNING.TYPE_MISMATCH`다(ERROR-186, SURFACE-061).

검증기가 있든 없든 보낸다(core의 parse가 찾는 것이라 검증 결과가 아니다)(ERROR-187). 제출은 검증기가 있으면 검증이 막고 없으면 막지 않는다(통보 3)(ERROR-187).

터미널이 된 노드의 입력이 비어 있는 `ChildNodeComponents`를 읽으면 개발 모드에서 경고한다(목표 C2(작성자 실수의 가시성))(ERROR-185, GOAL-015). 【추론】 가상은 `branch`이므로 ERROR-185의 경고(터미널 노드의 입력이 빈 `ChildNodeComponents`를 읽을 때의 개발 모드 경고)는 가상 노드에 적용되지 않는다(ERROR-185).

플러그인이 자기 방언을 선택적으로 선언하고, 스키마의 `$schema`와 어긋나면 개발 모드에서 경고만 낸다(프로덕션 출력 없음, `onError` 핸들러가 있으면 경고 기록)(ERROR-188). 경고 코드는 ERROR-164의 목록에 더한다(가칭, 편집자)(ERROR-188, ERROR-164).

### 2.21 오류 코드의 공개 계약과 목록

**공개 계약과 판 규칙.**(ERROR-031) 오늘 오류·경고 코드는 공개 계약이 아니다(ERROR-031). `package.json`의 `exports`는 '.'뿐이고, `src/index.ts`는 판별 함수만 내보내며, 경고 상수는 내부 배럴 `src/helpers/warning`에 있다(ERROR-031). 이 결정은 코드 문자열 목록을 새로 공개한다(공개 표면이 넓어지는 대가다)(ERROR-031). 형 `FormErrorCode`는 이름으로 내보내고, 런타임 상수 묶음은 소비자가 드러날 때 더한다(ERROR-031). README와 docs에 코드 표(코드, level, 부류, 언제, 누구 잘못, 기본 드러남)를 싣는다(ERROR-031). 코드를 더하면 minor, 이름을 바꾸거나 없애면 major다(ERROR-031).

17라운드 4번 수렴의 목록 50행을 게이트 R17G-9와 R17G-2대로 고친 것이다(ERROR-164). `(조건부) SCHEMA_FORM_WARNING.UNSET_ON_INACTIVE_ON_OBJECT` 행은 R17-2가 ㄴ으로 확정되어 지웠고, `presentation.trim`은 `PRESENTATION_KEY_SUSPECT`의 둘째 경우에 들며, `FormProvider`를 폼 인스턴스 밖으로 제외한 문구는 사실과 달라(`FormProvider`는 맵을 받지 않고 정의 정규화에는 던지는 자리가 없다) 지웠다(ERROR-164). 검증기 없음과 조건부 스키마 경고는 트리마다 한 번이다(ERROR-164). 끝에 설계 항목에서 생길 수 있는 코드의 행을 더했다(ERROR-164). '(가칭)'인 코드 이름은 PR-4에서 확정한다(ERROR-164). '(제외)' 행은 `onError`가 받지 않는 것이다(ERROR-164). '자리'는 오늘 코드의 위치(`src/` 아래) 또는 이 목록의 규칙을 든 원장 ID다(ERROR-164). `surface`의 값은 `'thrown'`(사슬 끝이나 호출에서 던짐), `'rejected'`(프로미스 거부), `'sink'`(주인 없는 오류 싱크)다(ERROR-164).

(ERROR-164, ERROR-185, ERROR-202, ERROR-195, CONTROLS-079, BLUEPRINT-044)

| 코드 | level | 언제 | 자리 | 기본 드러남 | 핸들러 전달 | 오늘과 새 설계 |
| --- | --- | --- | --- | --- | --- | --- |
| `JSON_SCHEMA_ERROR.UNKNOWN_JSON_SCHEMA` | `error` | 청사진 분석(마운트, reset의 스키마 교체) | src/core/nodes/schemaNodeFactory.ts:116. 기록에 schemaPath | 마운트: 생성 자리에서 잡아 폼 자리에 대체 화면을 그리고 커밋 뒤 싱크(ERROR-003). reset 안: reset이 던짐. 재대조(레이아웃 효과): 지금 트리를 둔 채 그 레이아웃 효과에서 싱크(ERROR-003) | 받음. 마운트는 대체 화면의 이펙트(surface 'sink'), reset은 throw 직전('thrown'). 재대조는 그 레이아웃 효과('sink') | 오늘과 새 설계 모두 |
| `JSON_SCHEMA_ERROR.UNEXPECTED_ARRAY_SCHEMA` | `error` | 청사진 분석 | src/core/nodes/ArrayNode/validate.ts:26, :40, :53, :72. 기록에 schemaPath | 청사진 오류와 같음 | 청사진 오류와 같음 | 오늘과 새 설계 모두 |
| `JSON_SCHEMA_ERROR.ALL_OF_TYPE_REDEFINITION` 또는 CONFLICTING_CONST_VALUES 또는 INVALID_RANGE 또는 EMPTY_ENUM_INTERSECTION | `error` | 청사진 분석(정적 연언의 교차). 오늘은 노드 생성 때(src/core/nodes/schemaNodeFactory.ts:133의 processAllOfSchema)이며 Form 전처리가 아님 | src/helpers/jsonSchema/processAllOfSchema/processAllOfSchema.ts:46, intersectSchema/utils/intersectConst.ts:24, validateRange.ts:22, intersectEnum.ts:36. 오늘은 details에 경로가 없고, 새 설계는 schemaPath를 실음 | 청사진 오류와 같음. PR-1부터 교차 함수는 공집합 표시를 돌려주고 청사진만 던짐(LANDING-061) | 청사진 오류와 같음 | 오늘과 새 설계 모두 |
| `JSON_SCHEMA_ERROR.COMPOSITION_TYPE_REDEFINITION` 또는 COMPOSITION_PROPERTY_REDEFINITION 또는 COMPOSITION_PROPERTY_EXCLUSIVENESS_REDEFINITION | `error` | 오늘: 합성 노드 표를 구성할 때 | src/core/nodes/ObjectNode/strategies/BranchStrategy/utils/getCompositionNodeMapList/getCompositionNodeMapList.ts:81, :96; utils/throwIfTypeRedefinition.ts:29 | 오늘: throw를 Form 자기 바운더리가 console.error로 가둠 | 새 설계에서 없어짐. 노드 공유와 SHARED_NODE_KIND_CONFLICT(청사진), SHARED_NODE_CONFLICT(정착)로 대체 | 오늘에만 |
| `JSON_SCHEMA_ERROR.VIRTUAL_FIELDS_NOT_VALID` 또는 VIRTUAL_FIELDS_NOT_IN_PROPERTIES | `error` | 청사진 분석(options.virtual 참조) | src/core/nodes/ObjectNode/strategies/BranchStrategy/utils/getVirtualReferencesMap/getVirtualReferencesMap.ts:41, :55 | 청사진 오류와 같음 | 청사진 오류와 같음 | 오늘과 새 설계 모두 |
| (가칭) `SCHEMA_FORM_ERROR.INVALID_VIRTUAL_NODE_VALUES` | `error` | 가상 노드에 길이가 다른 배열을 쓰는 쓰기 | src/core/nodes/VirtualNode/VirtualNode.ts:46(__emitChange__). 기록에 path | 오늘: 즉시 throw. 새 설계: 쓰기의 출처로 가름. 공개 API에서 오면 호출자 오류(즉시 throw), 자동 쓰기(controls.injectTo 등)에서 오면 정착 오류(그 규칙을 후보에서 빼고 사슬 끝 throw, degraded). 분류는 확정되었다 — 공개 API에서 오면 호출자 오류, 자동 쓰기에서 오면 정착 오류(`cause` (가칭) `'writeShape'`) | 받음(호출자 오류면 throw 직전, 정착 오류면 사슬 끝) | 새 설계에도 있으며 코드는 `SCHEMA_FORM_ERROR.INVALID_VIRTUAL_NODE_VALUES`(가칭)이고, 공개 API에서 오면 호출자 오류, 자동 쓰기에서 오면 정착 오류(`cause` (가칭) `'writeShape'`)다 |
| `JSON_SCHEMA_ERROR.CREATE_DYNAMIC_FUNCTION` 또는 OBSERVED_VALUES 또는 CONDITION_INDEX 또는 CONDITION_INDICES | `error` | 청사진 분석(controls 식 컴파일 실패) | src/core/nodes/AbstractNode/utils/getComputedPropertiesManager/ComputedPropertiesManager/utils/createDynamicFunction/createDynamicFunction.ts:43, getObservedValuesFactory.ts:58, getConditionIndexFactory.ts:65, getConditionIndicesFactory.ts:76 | 청사진 오류와 같음. 컴파일러는 PR-1에서 청사진으로 옮김 | 청사진 오류와 같음 | 오늘과 새 설계 모두 |
| (가칭) `JSON_SCHEMA_ERROR.UNKNOWN_GROUP_KEY` | `error` | 청사진 분석: controls·options·children[].controls의 닫힌 목록 밖 키 | R15-4. 기록에 schemaPath | 청사진 오류와 같음 | 청사진 오류와 같음 | 새 설계에만 |
| (가칭) `JSON_SCHEMA_ERROR.DISCRIMINATOR_MISMATCH` | `error` | 청사진 분석: controls.discriminator 키가 어느 분기에도 없거나, 분기끼리 종류가 다르거나 값이 겹치거나, 선언 사이 값이 다름 | ERROR-159의 청사진 오류 행, R15-7 | 청사진 오류와 같음 | 청사진 오류와 같음 | 새 설계에만 |
| (가칭) `JSON_SCHEMA_ERROR.SHARED_NODE_KIND_CONFLICT` | `error` | 청사진 분석: 정적 선언끼리는 교집합으로 노드 하나를 정하고 비면 `ALL_OF_TYPE_REDEFINITION`이며, 이 코드는 호스트의 게이트 없는 분기의 fold가 정적 노드의 fold에 들지 않을 때 | ERROR-159의 청사진 오류 행(14라운드 O-10) | 청사진 오류와 같음(폼이 서지 않음) | 청사진 오류와 같음 | 새 설계에만(오늘의 COMPOSITION_*_REDEFINITION을 대체) |
| (가칭) `JSON_SCHEMA_ERROR.TERMINAL_STRATEGY_MISMATCH` | `error` | 청사진 분석: 노드가 형상에 있는 경우마다 정한 터미널 전략이 서로 다름 | R15-10 | 청사진 오류와 같음 | 청사진 오류와 같음 | 새 설계에만 |
| `JSON_SCHEMA_ERROR.INJECT_TO` | `error` | 오늘: injectTo 실행 중 아무 예외 | src/core/nodes/AbstractNode/AbstractNode.ts:1010-1016 | 오늘: 커밋 없이 배치 도중 throw해 이벤트 처리기를 뚫고 나감 | 새 설계에서 둘로 나뉨: 동적 대상 없음은 INJECT_TARGET_MISSING, 식 예외는 EXPRESSION_THREW. 정적으로 아는 `injectTo` 대상은 없고, 대상 경로가 청사진에 없거나 터미널 아래인 경우는 모두 동적 대상 없음(`INJECT_TARGET_MISSING`)이다 | 오늘에만 |
| `SCHEMA_FORM_ERROR.INFINITE_LOOP_DETECTED` | `error` | 오늘: 배치 수가 상한을 넘음 | src/core/nodes/AbstractNode/utils/EventCascadeManager/EventCascadeManager.ts:97 | 오늘: 커밋 없이 throw | 새 설계에서 BUDGET_EXCEEDED와 FEEDBACK_LIMIT_EXCEEDED로 대체 | 오늘에만 |
| (가칭) `SCHEMA_FORM_ERROR.SHARED_NODE_CONFLICT` | `error` | 정착: 게이트에 달린 같은 이름·다른 종류 선언이 실제로 동시에 켜짐 | ERROR-078, ERROR-079, ERROR-159의 정착 오류 행. 기록에 path | 마운트: 모든 환경에서 폼이 서지 않고 대체 화면을 그린 뒤 커밋 뒤 싱크. 마운트 뒤: 앞선 종류로 커밋, 통지 뒤 사슬 끝 throw, degraded | 마운트는 대체 화면의 이펙트('sink'), 마운트 뒤는 throw 직전('thrown') | 새 설계에만 |
| (가칭) `SCHEMA_FORM_ERROR.BUDGET_EXCEEDED`(details.exceededBudget: hostWheel·derive·transition) | `error` | 정착의 예산 초과 | ERROR-159의 정착 오류 행. 기록에 path(마지막 라운드의 규칙 대상) | 원본 B 커밋과 통지 뒤 사슬 끝 throw, 모든 환경(R17-1 나). degraded가 다음 로드까지 남고 그 동안 제출을 거부. 마운트에서는 폼이 서고 커밋 뒤 싱크 | 마운트는 준비 이펙트('sink'), 마운트 뒤는 throw 직전('thrown') | 새 설계에만(오늘의 INFINITE_LOOP_DETECTED를 대체) |
| (가칭) `SCHEMA_FORM_ERROR.EXPRESSION_THREW` | `error` | 정착: controls 식이나 if 게이트 함수의 런타임 throw(게이트, 상태 키, 파생 규칙, resetInteraction) | ERROR-121. 기록에 path | 자리마다 정의된 값으로 정착을 마치고 커밋, 통지 뒤 사슬 끝 throw, degraded, 모든 환경(R17-1 나). 마운트에서는 폼이 서고 싱크 | 받음. error는 SchemaFormError이고 원래 예외는 details.error | 부류는 새 설계에만(오늘은 식의 런타임 예외를 잡지 않아 원래 예외가 그대로 전파됨. 잡는 자리는 컴파일 시점뿐) |
| (가칭) `SCHEMA_FORM_ERROR.GUARD_FAILED` | `error` | 정착: 가드 평가 실패 또는 가드 컴파일 실패 | ERROR-041. 기록에 path(게이트의 호스트) | 게이트는 거짓, 사슬 끝 throw, degraded, 모든 환경(R17-1 나) | 받음. 컴파일 실패만 개발 모드가 시점을 앞당겨 마운트의 커밋 뒤에 보냄('sink'). 프로덕션은 처음 평가하는 사슬 끝('thrown')에 보내고, 평가되지 않은 가드는 기록이 없음. 가드 표가 실패한 컴파일의 오류를 캐시하므로 그 가드를 쓰는 폼 인스턴스마다 자기 사건으로 받음 | 새 설계에만 |
| (가칭) `SCHEMA_FORM_ERROR.INJECT_TARGET_MISSING` | `error` | 정착: 동적으로만 아는 controls.injectTo 대상이 없음 | ERROR-122, ERROR-127, ERROR-159의 정착 오류 행 | 그 규칙을 후보에서 빼고 커밋, 사슬 끝 throw, degraded, 모든 환경(R17-1 나) | 받음(마운트는 준비 이펙트, 마운트 뒤는 throw 직전) | 새 설계에만 |
| (가칭) `SCHEMA_FORM_ERROR.FEEDBACK_LIMIT_EXCEEDED` | `error` | 통지: 리스너 되먹임 파동 25, onChange 중첩 25 초과 | ERROR-159의 되먹임·중첩 오류 행 | 고리 하나를 끊고 사슬 끝 throw, 모든 환경(R17-1 나). diagnostics에는 남기지 않음 | throw 직전('thrown') | 새 설계에만 |
| (가칭) `SCHEMA_FORM_ERROR.LISTENER_THREW` | `error` | 통지: 구독 리스너, onChange, onStateChange, onDiagnosticsChange, batch fn이 던짐. 검증 결과 파동의 리스너와 onValidate가 던짐 | src/core/nodes/AbstractNode/utils/EventCascadeManager/EventCascadeManager.ts:211-212(오늘은 잡지 않음), src/components/Form/Form.tsx:139(onValidate, catch 없음), EVENT-046의 검증 결과 행 | 사슬: 배달을 끝내고 사슬 끝 throw(하나면 원래 값 그대로). 검증 결과 파동: 싱크로 보내고 미처리 거부로 남기지 않음(ERROR-019의 다섯째). 모든 환경 | 사슬은 throw 직전('thrown'), 파동은 그 마이크로태스크('sink'). error는 소비자의 원래 값이고 code는 폼이 붙임 | 오늘은 잡지 않고 전파(onValidate는 미처리 거부). 부류는 새 설계에만 |
| (가칭) `SCHEMA_FORM_ERROR.MULTIPLE_ERRORS`(묶음) | `error` | 한 사슬에서 오류가 둘 이상이거나, 부른 쪽이 있는 자리에서 핸들러가 던짐 | ERROR-005 | SchemaFormError 하나로 묶어 details.errors에 발생 순서대로 담아 throw 또는 거부 | 따로 기록하지 않음. 구성 기록마다 aggregate 칸에 이 객체를 실음 | 새 설계에만 |
| `SCHEMA_FORM_ERROR.FORM_TYPE_INPUT_MAP` | `error` | 렌더: Form 속성 formTypeInputMap 정규화(src/providers/FormTypeInputsContext/FormTypeInputsContextProvider.tsx:29-34의 useMemo) | src/helpers/formTypeInputDefinition/formTypeInputMap.ts:53. 기록에 맵의 키 | 오늘: 루트 바운더리가 console.error로 가둠. 새 설계: 루트 바운더리가 가두어 대체 화면을 그리고 componentDidCatch에서 싱크 | componentDidCatch('sink', componentStack 포함) | 오늘과 새 설계 모두 |
| `UNHANDLED_ERROR.REGISTER_PLUGIN` | `error` | registerPlugin 호출(전역) | src/app/plugin/registerPlugin.ts:215 | 부른 쪽에 즉시 throw | 받지 않음(폼 인스턴스가 없음) | 오늘과 새 설계 모두 |
| (가칭) `SCHEMA_FORM_ERROR.INVALID_WRITE_OPTION` | `error` | 공개 API: Overwrite와 Merge를 함께 준 setValue | ERROR-159의 호출자 오류 행. 기록에 path | 즉시 throw(호출자 오류) | throw 직전('thrown') | 새 설계에만 |
| (가칭) `SCHEMA_FORM_ERROR.DISPOSED_NODE_WRITE` | `error` | 재생성 reset으로 폐기된 노드에 호출자가 옛 참조로 한 쓰기 | WRITE-046. 기록에 path | 적용하지 않고 즉시 throw, 모든 환경. 입력 출처 표식이 있는 늦은 입력 쓰기는 오류가 아니며 조용히 버림 | throw 직전('thrown') | 새 설계에만 |
| (가칭) `SCHEMA_FORM_ERROR.WRITE_IN_OBSERVER` | `error` | onError 전달 중 이 폼에 대한 쓰기 | ERROR-029 | 핸들러 안으로 즉시 throw | 받지 않음(재귀 없음). 핸들러 밖으로 새면 핸들러 예외의 규칙을 따름 | 새 설계에만 |
| (가칭) `SCHEMA_FORM_ERROR.SUBMIT_WHILE_DEGRADED` | `error` | diagnostics.status가 degraded인 동안의 제출 | ERROR-138, ERROR-139, ERROR-159의 제출 거부 행, R17-1 나 | FormHandle.submit과 useFormSubmit은 거부. 네이티브 submit(src/components/Form/Form.tsx:127-133, 부른 쪽 없음)은 싱크 | 거부 직전('rejected') 또는 싱크 직전('sink'). 제출 시도마다 새 객체 | 새 설계에만 |
| `JSON_SCHEMA_ERROR.CIRCULAR_REFERENCE` 또는 SCHEMA_COMPILE_FAILED(+ 노드 errors의 jsonSchemaCompileFailed) | `error` | 오늘: 노드 생성 때 전체 스키마 컴파일 실패 | src/core/nodes/AbstractNode/utils/ValidationManager/ValidationManager.ts:205-222, utils/getFallbackValidator.ts:14-26 | 오늘: 모든 환경에서 console.error를 내고, 이어 대체 검증기가 노드 errors에 항목을 넣음 | 새 설계에서 없어짐. VALIDATOR_COMPILE_FAILED로 대체되며 노드 errors에는 넣지 않음 | 오늘에만 |
| (가칭) `SCHEMA_FORM_ERROR.VALIDATOR_COMPILE_FAILED` | `error` | 로드 뒤 첫 검증 요청: 검증기는 있으나 전체 스키마 컴파일이 실패하고 검증 모드가 None이 아님 | ERROR-155 | 한 로드에 오류 객체 하나로 첫 OnChange 검증, validate(), 제출을 모든 환경에서 거부(R17-1 나). 그 로드에서 OnChange 검증을 다시 예약하지 않음 | 한 로드에 한 번, 처음 드러날 때(OnChange면 'sink', validate()·제출이면 'rejected') | 새 설계에만. 통보3의 답은 검증기가 있는 이 경우에 닿지 않음 |
| (가칭) `SCHEMA_FORM_ERROR.VALIDATOR_THREW` | `error` | 검증 요청: 검증 함수의 런타임 throw, 요청 시점의 $ref 순환 | src/core/nodes/AbstractNode/AbstractNode.ts:1215-1222(오늘 OnChange는 잡지 않음), src/components/Form/Form.tsx:139, ERROR-159의 검증기 오류 행 | validate()와 제출은 거부. OnChange는 싱크로 보내며 미처리 거부로 남기지 않음(ERROR-039). 모든 환경 | validate()는 거부 직전('rejected'), OnChange는 마이크로태스크에서 핸들러 뒤 싱크('sink'). ValidateFunction 문서 주석에 '입력의 판정은 돌려주고 던지지 않는다'를 적어 검증 결과와의 경계를 못박음 | 새 설계에만(오늘은 미처리 거부) |
| (가칭) `SCHEMA_FORM_ERROR.RENDER_FAILED` | `error` | 렌더: 사용자 주입 구성 요소(FormTypeInput, 렌더러 넷, Placeholder, 렌더러 안의 formatError)와 루트의 렌더 오류 | 필드 바운더리 src/components/SchemaNode/SchemaNodeInput/hooks/useFormTypeInput.ts:36-37, SchemaNodeInputWrapper.tsx:56-57, src/components/SchemaNode/SchemaNodeProxy/SchemaNodeProxy.tsx:59, src/helpers/virtualization/VirtualizationManager/VirtualizationManager.ts:214. 루트 src/components/Form/Form.tsx:311-312 | 가두어 대체 화면을 그리고 componentDidCatch에서 싱크(ERROR-089). ErrorBoundary의 console.error는 남음(packages/winglet/react-utils/src/hoc/withErrorBoundary/components/ErrorBoundary.tsx:52-54) | componentDidCatch('sink'). error는 원래 값이고 componentStack을 실으며, 필드 바운더리면 path가 있음. 폼이 이미 던진 값이면 핸들러를 한 번 건너뜀 | 오늘은 console.error뿐. 부류는 새 설계에만 |
| (코드 없음) onError 핸들러 자신의 예외 | `error` | 핸들러를 호출할 때(동기 throw) | ERROR-028 | 부른 쪽이 있으면 원래 오류를 앞에 두고 묶어 던지거나 거부함. 부른 쪽이 없으면 싱크로 한 번 보냄. async 핸들러의 거부는 호스트 자신의 프로미스 | 받지 않음(재귀 없음) | 새 설계에만 |
| `SCHEMA_FORM_WARNING.ALL_OF_KEYWORD_IGNORED_FOR_FORM` | `warning` | 청사진 분석(노드 생성의 allOf 처리) | src/helpers/jsonSchema/processAllOfSchema/processAllOfSchema.ts:40-44. 판별 칸은 keyword. 새 설계에서 schemaPath를 붙임 | 개발 모드 콘솔(세션 단위 code+message 중복 억제), 프로덕션 기본 출력 없음 | 커밋된 로드의 준비 이펙트. 무시한 키워드마다 기록 하나 | 오늘과 새 설계 모두 |
| `SCHEMA_FORM_WARNING.NULL_BRANCH_IGNORED_FOR_FORM` | `warning` | 청사진 분석 | src/core/nodes/ObjectNode/strategies/BranchStrategy/utils/getCompositionNodeMapList/utils/warnIfNullBranchIgnored.ts:25 | 개발 모드 콘솔 | 커밋된 로드의 준비 이펙트 | 오늘과 새 설계 모두 |
| `SCHEMA_FORM_WARNING.NESTED_COMPOSITION_IGNORED_FOR_FORM` | `warning` | 오늘: 청사진 분석 | src/core/nodes/ObjectNode/strategies/BranchStrategy/utils/getCompositionNodeMapList/utils/warnIfNestedComposition.ts:24 | 오늘: 개발 모드 콘솔 | 없음(폐기. 중첩 합성은 재귀로 다룸, FRAGMENT-021) | 오늘에만 |
| `SCHEMA_FORM_WARNING.NULLABLE_ONE_OF_NULL_UNREACHABLE` | `warning` | 오늘: 청사진 분석 | src/core/nodes/ObjectNode/strategies/BranchStrategy/utils/getCompositionNodeMapList/utils/warnIfNullUnreachable.ts:34 | 오늘: 개발 모드 콘솔 | 없음(폐기. 분기 내용을 읽음, ERROR-162) | 오늘에만 |
| `SCHEMA_FORM_WARNING.VIRTUALIZATION_DISABLED_FOR_FORM` | `warning` | 렌더 계층: virtualization을 켰는데 IntersectionObserver가 없음 | src/helpers/virtualization/VirtualizationManager/VirtualizationManager.ts:199-205(인스턴스 없는 정적 메서드이므로 보고기를 인자로 넘김). 폼 수준 | 개발 모드 콘솔 | 커밋 뒤 이펙트 | 오늘과 새 설계 모두(렌더 계층 경고로 옮김, ERROR-162) |
| (가칭) `SCHEMA_FORM_WARNING.IF_WITHOUT_ELSE_FALSE` | `warning` | 청사진 분석: oneOf·anyOf 분기에 if는 있고 else: false가 없음 | FRAGMENT-024, ERROR-159의 청사진 경고 행 | 개발 모드 콘솔 | 커밋된 로드의 준비 이펙트 | 새 설계에만 |
| (가칭) `SCHEMA_FORM_WARNING.LOCK_ON_NON_TERMINAL_OBJECT` | `warning` | 청사진 분석: 터미널이 아닌 객체 노드의 표준 readOnly, controls.readOnly, controls.disabled | ERROR-159의 청사진 경고 행 | 개발 모드 콘솔 | 커밋된 로드의 준비 이펙트 | 새 설계에만 |
| (가칭) `SCHEMA_FORM_WARNING.CONDITIONAL_SCHEMA_WITHOUT_VALIDATOR` | `warning` | 트리 생성(마운트, 재생성 reset): 검증기가 없는데 if 게이트가 있어 조각이 꺼짐 | ERROR-154, ERROR-153 | 개발 모드 콘솔 | 트리마다 한 번(마운트는 준비 이펙트, 재생성 reset은 reset 사슬 끝) | 새 설계에만(오늘은 조용함) |
| (가칭) `SCHEMA_FORM_WARNING.VALIDATOR_MISSING` | `warning` | 트리 생성(마운트, 재생성 reset): 플러그인에도 validatorFactory에도 검증기가 없고 검증 모드가 None이 아님 | src/core/nodes/AbstractNode/utils/ValidationManager/ValidationManager.ts:198-204(오늘은 조용히 건너뜀). 소유자 통보3 답 | 거부하지 않음(17라운드 소유자 답, 통보3). 개발 모드 콘솔, 프로덕션 기본 출력 없음 | 모든 환경, 트리마다 한 번(마운트는 준비 이펙트, 재생성 reset은 reset 사슬 끝). 값을 통째로 바꾸는 setValue나 같은 스키마 reset에서는 다시 보내지 않음. level은 17라운드 소유자 답 (가). 검증 모드를 None으로 적으면 사라짐 | 새 설계에만 |
| (가칭) `SCHEMA_FORM_WARNING.MULTIPLE_GATED_BRANCHES_ACTIVE` | `warning` | 정착: 같은 oneOf에서 게이트 가진 분기가 둘 이상 켜짐 | ERROR-159의 정착 경고 행. 기록에 호스트의 path | 개발 모드 콘솔 | 마운트면 준비 이펙트, 그 뒤면 사슬 끝(발생 순서). 로드마다 구조 키(code, path)로 한 번. 핸들러가 없는 프로덕션에서는 판정하지 않음 | 새 설계에만 |
| (가칭) `SCHEMA_FORM_WARNING.PRESENTATION_KEY_SUSPECT` | `warning` | 렌더 계층이 한 노드의 presentation을 처음 읽을 때: 코어 키 다섯과 대소문자만 다른 키, 또는 controls·options의 키 이름(R17-3이 `options.trim`으로 확정되어 `presentation.trim`도 둘째 경우에 든다) | R15-9. 판별 칸은 키 이름 | 개발 모드 콘솔 | 그 필드가 커밋된 뒤의 이펙트(지연 마운트 필드 포함) | 새 설계에만 |
| 【추론】 (가칭) `SCHEMA_FORM_WARNING.CHILD_NODE_COMPONENTS_ON_TERMINAL` | 【추론】 `warning` | 【추론】 렌더 계층에서, 터미널 전략인 노드의 입력 구성 요소가 받은 빈 `ChildNodeComponents`를 처음 읽을 때(색인·`length`·순회) | 【추론】 ERROR-185와 ERROR-159의 렌더 계층 경고 행. 기록에 path | 【추론】 개발 모드 콘솔, 프로덕션 기본 출력 없음. 개발 모드와 핸들러가 있는 프로덕션에서는 빈 배열 대신 읽기를 감지하는 얼린 빈 배열을 넘기고, 핸들러가 없는 프로덕션에서는 판정하지 않고 보통의 빈 배열을 넘김 | 【추론】 그 필드가 커밋된 뒤의 이펙트에서 전달, 로드마다 구조 키(code, path)로 한 번 | 【추론】 새 설계에만 |
| (제외) 검증 결과: ValidationIssue(오늘 이름 JSONSchemaError), onValidate, errors 속성, setExternalErrors·clearExternalErrors, `VALIDATION_ERROR.SCHEMA_VALIDATION_FAILED` | `error` | 검증 뒤, 제출 | src/components/Form/type.ts:54, :66; src/core/nodes/AbstractNode/AbstractNode.ts:816-839; src/components/Form/Form.tsx:117-123 | 노드 errors, onValidate, 필드 오류 표시, 제출 거부. 네이티브 submit에서는 오늘 미처리 거부(Form.tsx:127-133, packages/winglet/common-utils/src/utils/function/enhance/getTrackableHandler/getTrackableHandler.ts:429-431)이며 PR-7 설계 항목 | 받지 않음(둘째 답 고정) | 오늘과 새 설계 모두 |
| (제외) 정착 추적 | `warning` | 개발 모드에서 정착마다 | ERROR-159의 정착 추적 행 | 개발 모드 기록, 프로덕션은 없음 | 받지 않음(사건이 아니라 추적이며 양이 정착 수에 비례함) | 새 설계에만 |
| (제외) diagnostics의 상태 변화 | `error` | degraded로 바뀌는 커밋, 로드 | ERROR-129, ERROR-132 | UpdateDiagnostics, onDiagnosticsChange | 받지 않음(상태이며, 그 원인 오류가 따로 기록됨) | 새 설계에만 |
| (제외) 호스트 onSubmit이 던지거나 거부한 것 | `error` | 제출 | src/components/Form/Form.tsx:124 | 제출 프로미스의 거부로 부른 쪽에 감(네이티브 submit이면 호스트 자신의 미처리 거부) | 받지 않음(호스트 자신의 코드) | 오늘과 새 설계 모두 |
| (제외) React 자신의 경고와 렌더 중 쓰기 | `warning` | 렌더 중 사용자 코드의 쓰기 | ERROR-003의 호출자 오류 행(P5), REACT-013의 문서화 항목 | React의 렌더 중 갱신 경고(문서화 항목) | 받지 않음(core가 감지하지 않음). 그 사슬에서 난 폼 사건의 전달 시점은 보증하지 않음 | 오늘과 새 설계 모두 |

(가칭) `JSON_SCHEMA_ERROR.INJECT_TARGET_NOT_FOUND`는 낼 자리가 없어 PR-4의 코드 확정에서 빠진다(ERROR-164, CONTROLS-079).

입력 컴포넌트가 래퍼를 거치지 않고 `FormTypeInputProps`의 `node`로 한 쓰기도 표식이 없으므로 이 옛 노드 참조에 들며, 재생성 reset 뒤 타이머나 언마운트 정리에서 하면 던진다(문서화, LANDING-121)(ERROR-164). 입력 컴포넌트의 늦은 쓰기는 `node`가 아니라 `onChange`로 한다는 것(재생성 reset 뒤 `node`로 한 늦은 쓰기는 `SchemaFormError`)(ERROR-164).

【추론】 '(미정)' 행은 없앤다(ERROR-198). 【추론】 설계 항목이 정한 코드는 그 항목의 원장 번호와 함께 ERROR-164의 목록에 정식 행으로 더한다(ERROR-198). 【추론】 이름은 가칭이고 PR-4에서 확정한다(ERROR-164 머리 문단)(ERROR-198). 【추론】 코드를 두지 않기로 한 항목은 행 없이 그 항목에 '코드 없음'을 적는다(ERROR-198). 【추론】 (미정) 행의 넷 가운데 같은 `$id` 사본 루트의 중복 등록(PR-4)은 코드 없음이다(ERROR-198, ERROR-201). 【추론】 같은 가상 이름의 다른 `fields`(슬라이스 1)는 청사진 오류 (가칭) `JSON_SCHEMA_ERROR.VIRTUAL_FIELDS_MISMATCH`다(ERROR-198, ERROR-192). 【추론】 비객체 V의 `Merge`와 되먹임 거부 표면(슬라이스 2)은 코드 없음이며, 되먹임은 기존 `FEEDBACK_LIMIT_EXCEEDED`가 드러내고, `Overwrite`로 온 `undefined`도 코드가 생기지 않는다(ERROR-198, ERROR-194). 【추론】 `controls.children` 대상이 형상에 없을 때(슬라이스 6)는 코드 없음이고, 청사진에 없는 이름만 청사진 오류 (가칭) `JSON_SCHEMA_ERROR.CHILDREN_TARGET_NOT_FOUND`다(ERROR-198, ERROR-193). 【추론】 쓰기 쪽이 ERROR-164의 목록에 더하는 행은 `SCHEMA_FORM_ERROR.INVALID_VIRTUAL_NODE_VALUES`(무리 이동, ERROR-195), `SCHEMA_FORM_WARNING.RESET_REBUILT_BY_REFERENCE`(ERROR-196), `SCHEMA_FORM_ERROR.ARRAY_METHOD_ON_NON_ARRAY`(ERROR-197)다(ERROR-198, ERROR-164). 【추론】 청사진 쪽이 ERROR-164의 목록에 더하는 행은 `JSON_SCHEMA_ERROR.RECURSIVE_SHAPE_UNBOUNDED`·`SCHEMA_FORM_ERROR.RECURSIVE_SHAPE_DIVERGED`(ERROR-189, ERROR-190), `SCHEMA_FORM_WARNING.DEPENDENT_SCHEMAS_IGNORED_FOR_FORM`(ERROR-191), `JSON_SCHEMA_ERROR.VIRTUAL_FIELDS_MISMATCH`(ERROR-192), `JSON_SCHEMA_ERROR.CHILDREN_TARGET_NOT_FOUND`(ERROR-193), `JSON_SCHEMA_ERROR.TERMINAL_OPTION_UNSUPPORTED`(ERROR-200)다(ERROR-198, ERROR-164). 【추론】 렌더 계층의 빈 `ChildNodeComponents` 경고는 `SCHEMA_FORM_WARNING.CHILD_NODE_COMPONENTS_ON_TERMINAL`(ERROR-202)이다(ERROR-198, ERROR-164, ERROR-185, ERROR-202). 【추론】 S1 변환 실패의 `SCHEMA_FORM_WARNING.TYPE_MISMATCH`(ERROR-186)는 이미 있다(ERROR-198, SURFACE-061). 【추론】 안건 `reviews/round-18-agenda.md:108`의 `if` 공허한 참 경고(Q10)는 두지 않으며 경고 코드도 없다(ERROR-198). 【추론】 `JSON_SCHEMA_ERROR.INJECT_TARGET_NOT_FOUND`는 목록에서 빠진다(ERROR-198, CONTROLS-079). 게터 `typeMismatch: boolean`, 경로 목록 `typeMismatches: readonly string[]`, 경고 코드 `SCHEMA_FORM_WARNING.TYPE_MISMATCH`(ERROR-198, ERROR-164, SURFACE-061).

### 2.22 청사진 오류 코드의 추가

【추론】 코드는 (가칭) `JSON_SCHEMA_ERROR.CHILDREN_TARGET_NOT_FOUND`이고, 청사진 분석에서 나며, 기록에 schemaPath와 이름을 싣고, 새 설계에만 있는 단독 청사진 오류 코드다(ERROR-193).

【추론】 객체 프로퍼티만으로 이어진 순환에서 모든 마디가 게이트 없는 선언이고 터미널 전략인 노드가 하나도 없으면 형상이 무한하므로 청사진 오류(가칭 `JSON_SCHEMA_ERROR.RECURSIVE_SHAPE_UNBOUNDED`)다(ERROR-189). 【추론】 청사진 오류 코드 `JSON_SCHEMA_ERROR.RECURSIVE_SHAPE_UNBOUNDED`(가칭)는 청사진 분석에서 나며, 기록에 schemaPath와 순환 경로를 싣는다(ERROR-189).

【추론】 행이 하나인 종류에 그 행과 다른 `options.terminal`을 적으면 청사진 오류다(잎의 `false`, 가상의 `true`)(ERROR-200). 【추론】 코드는 (가칭) `JSON_SCHEMA_ERROR.TERMINAL_OPTION_UNSUPPORTED`이고, 청사진 분석에서 나며, 기록에 schemaPath·type·값을 싣고, 새 설계에만 있다(ERROR-200).

【추론】 코드는 (가칭) `JSON_SCHEMA_ERROR.VIRTUAL_FIELDS_MISMATCH`이고, 청사진 분석에서 나며, 기록에 schemaPath와 두 `fields`를 싣고, 새 설계에만 있다(ERROR-192).

### 2.23 정착과 호출자 오류 코드의 추가

【추론】 코드는 `(가칭) SCHEMA_FORM_ERROR.ARRAY_METHOD_ON_NON_ARRAY`, `level`은 `'error'`이고 호출자 오류다(ERROR-197). 【추론】 `type`이 배열이 아닌 노드에서 `push`·`pop`·`update`·`remove`·`clear`를 부르면, 행의 공유 칸이 모든 환경에서 즉시 `SchemaFormError`를 던진다(ERROR-197). 【추론】 throw 직전에 `onError`로 보낸다(surface `'thrown'`)(ERROR-197). 【추론】 기록에는 `path`와 `details.method`를 싣는다(ERROR-197). 【추론】 호출자 오류 행의 항목 목록(ERROR-159)과 받는 것 목록(ERROR-014)에 더한다(ERROR-159, ERROR-197).

【추론】 가상 노드가 받는 값은 둘뿐이다(ERROR-195). 【추론】 하나는 `undefined`이고, 참조한 잎 모두에 그 쓰기 종류로 `undefined`를 쓴다(ERROR-195). 【추론】 다른 하나는 길이가 참조 수와 같은 배열이다(ERROR-195). 【추론】 배열인지를 길이보다 먼저 본다(ERROR-195). 【추론】 그 밖의 값(`null`, 문자열을 포함한 배열 아닌 값, 길이가 다른 배열)은 거부한다(ERROR-195). 【추론】 가상 노드의 유일한 예외이며, 까닭은 자기 원본이 없어 받은 그대로 들 자리가 없기 때문이다(ERROR-195). 【추론】 나뉜 값은 잎마다 `interpret`를 지난다(ERROR-195). 【추론】 분류는 출처로 가른다(ERROR-195). 【추론】 공개 API(`setValue`, 그것을 부르는 입력의 `onChange` 포함)에서 오면 호출자 오류다(ERROR-195). 【추론】 즉시 throw하고, throw 직전에 `onError`로 보낸다(ERROR-195). 【추론】 자동 쓰기(`controls.injectTo` 등)에서 오면 정착 오류다(ERROR-195). 【추론】 그 규칙을 후보에서 빼고, 사슬 끝에서 throw하며, `degraded`가 된다(ERROR-195). 【추론】 `diagnostics.cause`에 다섯째 값 `(가칭) 'writeShape'`를 둔다(자동 쓰기가 대상이 받을 수 없는 모양의 값을 냄)(ERROR-133, ERROR-195). 【추론】 `'injectTarget'`은 "동적 대상 없음"이라는 한 뜻으로 남는다(ERROR-133, ERROR-195). 【추론】 한 값이 한 뜻을 가져야 예측할 수 있기 때문이다(ERROR-133, ERROR-195). 【추론】 `degraded`를 일으키는 경우에 '가상 노드에 모양이 틀린 자동 쓰기'가 더해진다(ERROR-132, ERROR-195). 【추론】 코드는 오류 클래스와 무리를 옮겨 `SCHEMA_FORM_ERROR.INVALID_VIRTUAL_NODE_VALUES`(가칭)로 한다(ERROR-195). 【추론】 `JSON_SCHEMA_ERROR`는 청사진 오류의 무리이고, 이 사건은 쓰기의 오류이기 때문이다(ERROR-195). 【추론】 기록에는 `path`와 `details`(기대 길이, 받은 값)를 싣는다(ERROR-195).

【추론】 재귀 펼침의 멈춤은 예산 부류의 정착 오류이므로 예산 초과의 기존 규칙을 그대로 따른다 — 원본 B를 커밋하고, `diagnostics`를 `cause: 'budget'`, `exceededBudget: 'recursion'`(가칭)인 `'degraded'`로 두며, 사슬 끝에서 던진다(ERROR-132, ERROR-133, ERROR-190). 【추론】 형상이 수렴하지 않아도 값은 받아들인다(ERROR-190, WRITE-004). 【추론】 정착 오류 코드 `SCHEMA_FORM_ERROR.RECURSIVE_SHAPE_DIVERGED`(가칭)는 정착에서 나며, `cause: 'budget'`, `exceededBudget: 'recursion'`(가칭), 모든 환경의 사슬 끝 throw, `degraded`를 따른다(ERROR-190).

### 2.24 경고 코드의 추가

【추론】 ERROR-164의 목록에 행 하나를 더한다(ERROR-202). 【추론】 코드는 (가칭) `SCHEMA_FORM_WARNING.CHILD_NODE_COMPONENTS_ON_TERMINAL`이고 `level`은 `warning`이다(ERROR-185, ERROR-202). 【추론】 렌더 계층에서, 터미널 전략인 노드의 입력 구성 요소가 받은 빈 `ChildNodeComponents`를 처음 읽을 때(색인·`length`·순회) 낸다(ERROR-202). 【추론】 자리는 NODE-031과 렌더 계층 경고 행(ERROR-159)이며, 기록에 path를 싣는다(ERROR-202, NODE-031). 【추론】 기본 드러남은 개발 모드 콘솔이고, 프로덕션 기본 출력은 없다(ERROR-202). 【추론】 핸들러 전달은 그 필드가 커밋된 뒤의 이펙트에서 하고, 로드마다 구조 키(code, path)로 한 번이다(ERROR-202). 【추론】 개발 모드와 핸들러가 있는 프로덕션에서는 빈 배열 대신 읽기를 감지하는 얼린 빈 배열을 넘긴다(ERROR-202). 【추론】 핸들러가 없는 프로덕션에서는 판정하지 않고 보통의 빈 배열을 넘긴다(ERROR-202). 【추론】 새 설계에만 있다(ERROR-202). 【추론】 더하면 minor다(ERROR-031의 판 규칙)(ERROR-202).

- PR: PR-7(ERROR-202).
- 무엇: 감지 방식(읽기를 감지하는 얼린 빈 배열)의 비용을 PR-7 구현에서 확인한다(ERROR-202).

【추론】 스키마에 `dependentSchemas`나 `dependencies` 키가 있으면 청사진 경고(가칭 `SCHEMA_FORM_WARNING.DEPENDENT_SCHEMAS_IGNORED_FOR_FORM`, 개발 모드, 키의 유무만 봄, 기록에 schemaPath와 키)를 낸다(ERROR-191). 【추론】 이 경고는 청사진 경고 행(ERROR-159)의 조건 목록에 "`dependentSchemas`·`dependencies` 무시"로 더해지고, 기본 드러남은 개발 모드 콘솔이며, 새 설계에만 있다(ERROR-159, ERROR-191).

【추론】 12-4의 방언 불일치 경고(ERROR-188)의 코드는 (가칭) `SCHEMA_FORM_WARNING.DIALECT_MISMATCH`다(ERROR-188, ERROR-199).

【추론】 코드는 `(가칭) SCHEMA_FORM_WARNING.RESET_REBUILT_BY_REFERENCE`, `level`은 `'warning'`이다(ERROR-196). 【추론】 `reset`의 같은 스키마 판정에서 JSON 부분은 깊게 같은데 함수·구성 요소 칸의 참조가 달라 재생성 경로를 탔을 때 낸다(ERROR-196). 【추론】 같은 스키마 판정은 처음 다른 곳에서 멈추는 비교다(ERROR-196). 【추론】 '참조만 다르다'를 알려면 JSON 부분을 끝까지 비교해야 해서, 재생성 경로에서 순회가 한 번 더 든다(ERROR-196). 【추론】 그래서 개발 모드이거나 `onError` 핸들러가 있을 때만 판정한다(ERROR-196). 【추론】 핸들러가 없는 프로덕션에서는 판정하지 않는다(`MULTIPLE_GATED_BRANCHES_ACTIVE`와 같은 관례)(ERROR-196). 【추론】 기록에는 위치(폼 수준)와 `details`(참조가 달라진 칸의 `schemaPath` 목록)를 싣는다(ERROR-196). 【추론】 드러남은 경고 층의 일반 규칙을 따른다(ERROR-196). 【추론】 기본 출력은 개발 모드 콘솔이다(ERROR-196). 【추론】 `onError` 핸들러가 있으면 모든 환경에서 경고 기록을 보내고, 전달 시점은 reset 사슬 끝이다(`VALIDATOR_MISSING`의 재생성 reset과 같다)(ERROR-196). 【추론】 중복 막기는 경고 규칙(ERROR-024: 코드와 위치, 로드마다 비움)을 따른다(ERROR-196). 【추론】 그래서 그런 reset마다 한 번 간다(ERROR-196). 【추론】 reset을 부르지 않는 인라인 스키마에는 보내지 않는다(ERROR-196). 【추론】 이 코드는 새 설계에만 있어 이주 행이 없다(ERROR-196).

【추론】 ERROR-164의 `UNKNOWN_JSON_SCHEMA` 행의 "언제"에 S0의 문법 오류, 형 없는 분기(BLUEPRINT-038), 형 없는 칸의 빈 U와 객체·배열이 다른 종류와 섞인 분기, 분기도 `const`·`enum`도 없는 형 없는 칸, 리터럴의 종류가 섞이거나 객체·배열인 `const`·`enum`을 적는다(ERROR-164, ERROR-203, BLUEPRINT-048, BLUEPRINT-050). 【추론】 ERROR-164의 `ALL_OF_TYPE_REDEFINITION` 행은 정적 연언의 교집합이 빈 경우만이며, `{null}`은 여기에 들지 않는다(ERROR-164, ERROR-203). 【추론】 ERROR-164의 `SHARED_NODE_CONFLICT` 행에 "켜진 게이트 선언과 정적 허용 집합의 교집합이 빔"을 더한다(ERROR-164, ERROR-203). 【추론】 ERROR-164에 경고 행 `(가칭) SCHEMA_FORM_WARNING.TERMINAL_SUBTREE_KEY_IGNORED_FOR_FORM`(`warning`, 새 설계에만)을 더한다(ERROR-164, ERROR-203). 【추론】 ERROR-164에 경고 행 `DISCRIMINATOR_BRANCH_UNREACHABLE`과 `NON_JSON_WHOLE_VALUE`(둘 다 `warning`, 새 설계에만)를 더한다(ERROR-164, ERROR-203). 【추론】 ERROR-164에 경고 행 `FORM_TYPE_TEST_INVALID`(`warning`, 새 설계에만)를 더한다(ERROR-164, ERROR-203).

### 2.25 이주와 구현 순서

이주: 검증기 없이 쓰던 폼은 그대로 동작하며 경고를 받는다(ERROR-042). 알림을 없애려면 검증 모드를 `None`으로 적는다(ERROR-042). 서버 사이드 렌더링을 쓰면 검증기 등록은 서버와 클라이언트 모두에서 한다(ERROR-042).

**기록.**(ERROR-045, ERROR-190, CONTROLS-079)

| 5차 문서와 오늘 | 이 ADR |
| --- | --- |
| 정착 예산 초과: 개발 모드 throw, 프로덕션은 신호만(12라운드 §4) | 모든 환경에서 throw(커밋·통지 뒤, 사슬의 끝). `diagnostics`는 다음 로드까지 `degraded`로 남고 그 동안 제출을 거부한다(R17-1 나. 10라운드 B-1의 제출 비차단을 대체한다) |
| Form 속성 `throwOnBudgetExceeded`(가칭) | 없다. 끄는 스위치가 없다 |
| 리스너 오류: `onListenerError`(가칭)로 보고, 없으면 개발 모드 `console.error` | 배달 뒤 사슬의 끝에서 모든 환경에서 throw. `onError`가 기록으로 먼저 본다 |
| 노드 공유 충돌: 청사진 경고 + 프로덕션 폼 수준 경고(ADR 0005 §3 "명시 없는 생성기 union이 마운트마다 터지면 안 된다") | 확실한 충돌은 청사진 오류, 실제 동시 활성은 정착 오류(O-10). 마운트에서 나면 모든 환경에서 폼이 서지 않고 대체 화면을 그린다. 생성기 union은 `controls.discriminator`를 더한다(이주) |
| `controls`의 식 런타임 오류·풀리지 않는 `controls.injectTo` 대상: 14라운드 O-4 가(개발 모드 경고) | 정적이면 청사진 오류, 동적이면 정착 오류(R17-1 나). 정적으로 아는 `injectTo` 대상은 없고, 대상 경로가 청사진에 없거나 터미널 아래인 경우는 모두 동적 대상 없음(`INJECT_TARGET_MISSING`)이다. 마운트에서 나면 폼이 서고 커밋 뒤 보고한다 |
| 검증기 미등록: 조용히 검증을 건너뜀(`enabled = false`), `if` 게이트는 조각 없음(ERROR-154) | 거부하지 않고 개발 모드 콘솔과 `onError` 경고 기록으로 트리마다 한 번 알린다(통보3). `if` 조각이 꺼지는 것과 그 경고는 ERROR-153의 합의대로다 |
| 검증기 오류: 전체 스키마 컴파일 실패는 노드 `errors`에 `jsonSchemaCompileFailed` + 모든 환경 `console.error`. `OnChange` 검증의 실행 실패는 미처리 거부 | 컴파일 실패는 검증 불가로 첫 검증 요청·`validate()`·제출을 모든 환경에서 거부하고, 실행 실패는 `validate()`의 거부 또는 `onError` 뒤 싱크다. 노드 `errors`에는 넣지 않는다(사용자의 잘못이 아니다) |
| `Form`이 자기 바운더리로 마운트 오류를 삼킴(`console.error`뿐) | 바운더리는 다시 던지지 않고 가두어 대체 화면을 그리며, `componentDidCatch`에서 `onError`와 싱크로 보고한다. 청사진 오류는 트리를 만드는 자리에서 잡는다 |
| `onError` 없음. 경고는 개발 모드 콘솔뿐이며 프로덕션에서도 검출과 서식을 돌린 뒤 버림 | Form 속성 `onError`: 검증 결과를 뺀 폼 내부의 오류와 경고를 같은 모양의 기록으로 받는 관찰자. 핸들러가 없는 프로덕션은 기록·서식·경고 판정을 만들지 않는다 |
| 오류 둘 이상의 묶음: 없음 | `SchemaFormError` 하나의 `details.errors`(발생 순서). `AggregateError`와 `cause`는 쓰지 않는다 |
| `diagnostics.status`: `'stable'` 또는 `'budgetExceeded'`, 이번 정착만, `exceededBudget` 다섯 값 | `'stable'` 또는 `'degraded'`와 `cause`·`commit`, 마지막 로드 이후의 작업 기록. `exceededBudget`은 정착 예산 셋만. 재귀 펼침의 멈춤을 뜻하는 (가칭) `'recursion'`이 더해져 값이 넷이다 |
| 가드 컴파일은 늦춘다(ERROR-041) | 프로덕션은 늦게(유지), 개발 모드는 청사진에서 일괄. 실패는 그 게이트의 가드 실패이며 정착 오류다 |
| 오류·경고 코드는 공개 계약이 아님 | 형 `FormErrorCode`와 README·docs의 코드 표를 공개한다. 더하면 minor, 바꾸거나 없애면 major |

**기록.**(ERROR-046) 이주 항목: 검증기 없이 쓰던 폼은 그대로 동작하며 경고를 받는다(검증 모드를 `None`으로 적으면 사라진다)(ERROR-046). `INFINITE_LOOP_DETECTED`가 배치 도중 throw해 커밋을 남기지 않던 것이 원본 B 커밋 뒤 throw(`BUDGET_EXCEEDED`, 되먹임·중첩이면 `FEEDBACK_LIMIT_EXCEEDED`)로 바뀌고, 프로덕션에서도 던지며, 그 뒤 다음 로드까지 제출이 거부된다(ERROR-046). `ValidationManager.ts:221`의 `console.error`와 `jsonSchemaCompileFailed`가 사라진다(ERROR-046). `oneOfIndex`·자동 감지 없이 같은 이름·다른 종류를 둔 생성기 union은 `controls.discriminator` 없이는 마운트에 실패한다(ERROR-046). 검증 결과 형은 `ValidationIssue`로 이름이 바뀐다(`onError`의 공개보다 먼저)(ERROR-046). `@winglet/react-utils`의 감싸개에는 선택 인자가 더해질 뿐 기존 호출은 그대로다(ERROR-046).

**착수 조건과 PR 배치.**(ERROR-032)

- PR-1: 청사진 오류와 경고를 수집기 인자로 데이터화한다(code, `schemaPath`·`path`, details, 판별 칸)(ERROR-032). 캐시 청사진의 늦은 경고 수집을 넣고, `warnDevelopmentIssue` 호출 자리를 수집기 뒤로 정리한다(ERROR-032).
- PR-4: 기록 형과 코드 형, core가 인자로 받는 보고기(`report`, `hasConsumer`), 사슬 끝의 기록마다 전달, core 경로의 핸들러 예외 규칙, 전달 중 쓰기 거부, 경고의 구조 키, 정착 경고 판정의 소비자 조건, `ValidationIssue` 개명, `ValidateFunction`의 문서 주석("입력의 판정은 돌려주고 던지지 않는다. 던지면 실행 실패다")을 넣는다(ERROR-032).
- PR-7: Form 속성, 바깥 감싸개와 보고기 문맥, 로드 기록의 준비 이펙트 전달, 바운더리의 렌더 때 보고기 읽기와 `componentStack`, 네이티브 submit 경로의 오류 층 거부 처리, `@winglet/react-utils`의 minor 변경(그 모듈의 `DETAIL.md`를 먼저 갱신)을 넣는다(ERROR-032).
- PR-8: 코드 표와 이주 안내를 넣는다(ERROR-032).
- 착수 조건: 검증 결과 형의 `ValidationIssue` 개명(LANDING-024)이 `onError`의 공개보다 먼저(또는 같은 PR에) 선다(ERROR-032). 오늘은 `onValidate`가 공개 형 `JSONSchemaError[]`를 받는다(ERROR-032).

### 2.26 합의와 판정의 근거

**기록.**(ERROR-166)

- 소유자 10라운드 답 B-1: "권고를 따릅니다만, 기본적으론 form을 터트려서(error를 throw해서) 알려주는게 좋지 않을까 싶네요."(ERROR-166)

**기록.**(ERROR-167)

- 소유자 14라운드 답 O-4: "전반적으로 '오류가 나도 동작하는' 형태보다는 안되면 오류를 터트려서 인지시키는 방향이 좋지 않을까 싶네요." O-10: "경고만 일어나고 동작하는것처럼 보이는게 더 위험합니다." O-2: "이런 예산초과된 상태로 동작하는건 되도록 막는 방향을 원하긴 해요."(ERROR-167)

**기록.**(ERROR-168)

- 소유자 17라운드 답(ERROR-168). R17-1: "나 허용. 망가진 값을 올리는게 더 위험하겠다." 통보3: "오류만 내보내고 거절은 하지 마시죠. 사용자가 인지만 하면 될거고, 기본값이 있어서 사용자가 오히려 불편할겁니다. 저는 jsonSchema 로 form 만 그리고, 유효성검증은 따로 하지 않는 사용예도 알고있어서요." 통보4: "아 이게, onError 와 onValidate 를 섞는건 사용자 입장에서 엄청 햇갈립니다", "모든 form 내부 error를 정리해서 출력할 수만 있다면, (warning / error 모두) onError 핸들러를 넣어도 괜찮을 것 같기도 해. 오히려, validate error 가 걸러진 에러 로깅용 전용 채널로 쓸 수 있겠어. 이거 에이전트들로 수렴을 시켜봐. 어떤게 나을지". 4번 수렴 뒤의 확인 (가): "(가) ㄱ warning으로." (나): "(나) 확장 허용합니다"(ERROR-168).

**기록.**(ERROR-169)

- 17라운드 4번 수렴(ERROR-169): 안 B를 17라운드 스웜 수렴(편집자 결정)으로 택했다(ERROR-169). 답이 이름과 방향을 주었고, 투명성·C2·10라운드 A-2("form은 고지 의무만 진다")·O-10이 같은 쪽이며, 비용이 핸들러가 있을 때만 생겨 가치끼리 맞바꾸지 않는다(ERROR-169). 게이트는 조건부 통과였고 R17G-1–R17G-11을 모두 적용했다(R17G-3은 소유자 답 (가), R17G-4는 소유자 답 (나)로 닫혔다)(ERROR-169).

**기록.**(ERROR-170)

- 외부 조사(antigravity) 최종 판정: "안 A(커밋 보존 후 최외곽 진입 끝 예외 발생)를 기본 원칙으로 채택 … 안 B는 소비자가 오류를 고의로 삼킬 수 있어 조기 실패의 완결성을 파괴합니다." 여기의 안 B는 외부 조사의 안('`onError` 하나로 보내고 없으면 throw')이며 17라운드 4번 수렴의 안 B(흐름을 바꾸지 못하는 관찰자)와 다르다(ERROR-170). 사슬 끝 throw는 이 판정대로 두었다(ERROR-170).
