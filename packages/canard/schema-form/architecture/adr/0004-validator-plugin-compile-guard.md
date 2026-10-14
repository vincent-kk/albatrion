# ADR 0004 — 검증기는 플러그인 유지, 동기 `compileGuard` 추가

## 상태

| 항목 | 닫은 사람 | 라운드 |
| --- | --- | --- |
| ERROR-039 | 17라운드 스웜 수렴(편집자 결정) | 17 |
| ERROR-041 | 17라운드 스웜 수렴(편집자 결정) | 17 |
| ERROR-143 | 소유자 답(`reviews/round-14-owner-answers.md:13` O-7) | 14 |
| ERROR-188 | 소유자 답(`reviews/round-18-owner-answers.md:14` 12-4), 편집자 결정(18라운드, `reviews/round-18-owner-answers.md:14` 반영 칸; 경고 코드는 가칭으로 §7.2 목록에 더함), 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-24) | 18 |
| LANDING-026 | 편집자 결정(14라운드, `08-design-a-to-z.md:455`) | 14 |
| TEST-064 | 편집자 결정(5라운드 ADR 0007 4차 본문의 비용 표, `adr/0007-settle-cycle.md:122`) | 5 |
| VALIDATE-002 | 소유자 답(`reviews/round-1.md:178` 계약을 검증기 프로필로 한정하는가 (R1)), 소유자 답(`reviews/round-2.md:112` C5), 소유자 답(`reviews/round-18-owner-answers.md:34` union O4; 세 옵션은 `bind`가 강제) | 18 |
| VALIDATE-003 | 소유자 답(`reviews/round-1.md:178` 계약을 검증기 프로필로 한정하는가 (R1)), 소유자 답(`reviews/round-18-owner-answers.md:34` union O4; `bind`의 거부), 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-90) | 18 |
| VALIDATE-008 | 편집자 결정(1라운드, `adr/0001-validator-input-invariant.md:11`) | 1 |
| VALIDATE-014 | 소유자 답(`00-goals.md:146` G3) | 1 |
| VALIDATE-015 | 편집자 결정(16라운드, `09-landing-and-test-strategy.md:19` 조건 1) | 16 |
| VALIDATE-016 | 소유자 답(`adr/0004-validator-plugin-compile-guard.md:55` 가드는 동기 전용) | 1 |
| VALIDATE-017 | 편집자 결정(16라운드, `09-landing-and-test-strategy.md:19` 조건 1) | 16 |
| VALIDATE-018 | 편집자 결정(16라운드, `09-landing-and-test-strategy.md:19` 조건 1), 소유자 답(`reviews/round-16-owner-answers.md:16` 10), 소유자 답(`reviews/round-18-owner-answers.md:34` union O4; 깊은 사본) | 18 |
| VALIDATE-019 | 편집자 결정(16라운드, `09-landing-and-test-strategy.md:19` 조건 1), 소유자 답(`reviews/round-16-owner-answers.md:16` 10) | 16 |
| VALIDATE-025 | 소유자 답(`adr/0004-validator-plugin-compile-guard.md:54`) | 1 |
| VALIDATE-026 | 편집자 결정(1라운드, `reviews/round-1.md:178` 반영 칸), 소유자 답(`reviews/round-18-owner-answers.md:14` 12-4) | 18 |
| VALIDATE-027 | 편집자 결정(1라운드, `adr/0004-validator-plugin-compile-guard.md:44` R18), 소유자 답(`reviews/round-18-owner-answers.md:13` 12-3), 편집자 결정(18라운드, `reviews/round-18-owner-answers.md:13` 반영 칸; 답을 가로 읽음) | 18 |
| VALIDATE-028 | 소유자 답(`00-goals.md:146` G3), 편집자 결정(1라운드, `adr/0004-validator-plugin-compile-guard.md:59-60`) | 1 |
| VALIDATE-030 | 편집자 결정(11라운드, `adr/0004-validator-plugin-compile-guard.md:3` 5차 주 (2)) | 11 |
| VALIDATE-032 | 편집자 결정(11라운드, `adr/0004-validator-plugin-compile-guard.md:3` 5차 주 (1)) | 11 |
| VALIDATE-033 | 편집자 결정(2라운드, `adr/0004-validator-plugin-compile-guard.md:71` S12) | 2 |
| VALIDATE-040 | 소유자 답(`reviews/round-14-owner-answers.md:13` O-7) | 14 |
| VALIDATE-041 | 소유자 답(`reviews/round-14-owner-answers.md:13` O-7), 편집자 결정(18라운드 안건 이관, `reviews/round-18-agenda.md:108`), 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-54) | 18 |
| VALIDATE-042 | 소유자 답(`reviews/round-14-owner-answers.md:13` O-7) | 14 |

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

### 05-validation-and-errors.md §1.5 가드 컴파일과 공유

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

### 05-validation-and-errors.md §1.8 내장 대안과 성능 책임

플러그인으로 허용하되 성능 예산은 AJV를 기준으로 잡는다(VALIDATE-027, TEST-073).

인터프리터형 검증기는 같은 작업이 약 70배 느리고 호스트 객체의 폭에 비례한다(`@cfworker/json-schema`: 가드 200개에 578 µs, 아이템 10,000개를 훑는 `contains` 가드 하나에 4.5 ms)(VALIDATE-027). `@cfworker/json-schema`는 내장 후보가 아니라 플러그인 구현체 후보 가운데 하나가 된다(VALIDATE-027). 검증기의 성능은 폼이 관여할 문제가 아니므로 폼은 아무 장치도 더하지 않는다(역색인 없음, `if` 내용 불관여 유지)(VALIDATE-027). 예산은 AJV 기준으로 적고, 인터프리터형은 "동작하되 성능은 플러그인의 몫"으로 문서화한다(VALIDATE-027).

- **작은 검증기를 내장하고 플러그인이 있으면 그것을 쓰는 안을 채택하지 않는다.**(VALIDATE-028) 같은 개념에 평가기가 둘이면 서로 다른 답을 낼 수 있다(VALIDATE-028). 현재 구조에서 이미 확인된 문제다(`requiredFactory`와 표현식 컴파일러, `01-current-structure.md` §3)(VALIDATE-028).
- **AJV를 내장하지 않는다.**(VALIDATE-028) 번들이 커지고 플러그인 분리의 장점이 없어진다(소유자의 판단)(VALIDATE-028).

ADR 0010은 분기 관행 문서다(외부 조사 항목 아님)(VALIDATE-030).

### 05-validation-and-errors.md §2.10 검증기 출처와 미등록

검증기는 플러그인(전역 기본) 또는 Form 속성 `validatorFactory`(그 폼의 인스턴스, 14라운드 답 O-7)에서 온다(ERROR-143). 어느 경우도 청사진 오류가 아니며 폼은 선다(ERROR-144). 기본 검증 모드 `OnChange | OnRequest`는 그대로 두고 '검증기가 있으면 `OnChange`, 없으면 `None`' 같은 암묵 기본값은 두지 않는다(ERROR-145).

**검증기 없음**(플러그인에도 `validatorFactory`에도 없고 검증 모드가 `None`이 아님): 거부하지 않고 검증 없이 진행한다(17라운드 소유자 답, 통보3: "오류만 내보내고 거절은 하지 마시죠. 사용자가 인지만 하면 될거고, 기본값이 있어서 사용자가 오히려 불편할겁니다")(ERROR-146). 개발 모드 콘솔과 `onError`의 경고 기록(`level: 'warning'`, 가칭 코드 `SCHEMA_FORM_WARNING.VALIDATOR_MISSING`, 17라운드 소유자 답 (가))으로 알린다(ERROR-147). 트리마다 한 번(마운트, 재생성 reset) 보내고, 값을 통째로 바꾸는 `setValue`나 같은 스키마 reset에서는 다시 보내지 않는다(ERROR-148). 전달 시점은 마운트면 준비 이펙트, 재생성 reset이면 reset 사슬 끝이다(ERROR-149). 프로덕션에는 기본 출력이 없다(ERROR-150). 검증을 쓰지 않는 폼은 검증 모드를 `None`으로 적으면 알림이 없다(ERROR-151).

### 05-validation-and-errors.md §2.11 조건부 스키마와 가드 컴파일

**조건부 스키마.**(ERROR-152) VALIDATE-025와 VALIDATE-042의 합의("조건부 비활성 + 경고", 소유자 동의)를 유지한다(ERROR-153, VALIDATE-025, VALIDATE-042). 검증기가 없으면 `if` 게이트의 조각은 꺼진 채 두고 경고(가칭 `SCHEMA_FORM_WARNING.CONDITIONAL_SCHEMA_WITHOUT_VALIDATOR`)를 트리마다 한 번 낸다(ERROR-154).

**가드.**(ERROR-041) 프로덕션에서 가드는 처음 필요할 때 늦게 컴파일한다(작성 루트 기준 캐시. TEST-036의 '늦추고'는 프로덕션의 규칙으로 유지한다)(ERROR-041, TEST-036). 개발 모드에서는 청사진에서 모든 가드를 한 번 컴파일해 본다(ERROR-041). 어느 환경이든 컴파일 실패는 그 게이트의 가드 실패다(게이트는 거짓, R17-1 나에 따라 정착 오류)(ERROR-041, ERROR-121, ERROR-122). 청사진 오류가 아니므로 두 환경의 형상이 같고(목표 G5(한 장으로 설명되는 라이프사이클)), 개발 모드가 앞당기는 것은 `onError` 기록의 시점(마운트의 커밋 뒤)뿐이다(ERROR-041, GOAL-009). 프로덕션에서 한 번도 평가되지 않은 가드의 실패는 기록이 없다(ERROR-041).

AJV에서 가드의 호출은 싸고(좁은 가드 5–58 ns, 루트에 걸린 가드 200개를 키 입력마다 전부 돌려 7.9 µs) 비싼 것은 **컴파일**이다(가드 하나에 70–270 µs, 200개면 폼 생성 시점에 14–54 ms)(ERROR-041, TEST-036). 컴파일의 실패(지원하지 않는 정규식 등)를 폼 생성의 실패로 둘 것인가(ERROR-041). Python 정규식 `(?i)…`은 Ajv 컴파일이 throw한다(ERROR-041). 17라운드에 닫혔다: 가드 컴파일의 실패는 폼 생성의 실패가 아니라 그 게이트의 가드 실패(정착 오류)이고, 전체 스키마 컴파일의 실패는 검증 불가다(ERROR-041, ERROR-155).

### 05-validation-and-errors.md §2.12 검증 불가와 실행 실패

**검증 불가**(검증기는 있으나 전체 스키마 컴파일이 실패함): 한 로드에 오류 객체 하나(가칭 `SCHEMA_FORM_ERROR.VALIDATOR_COMPILE_FAILED`)로 커밋 뒤 첫 `OnChange` 검증, `validate()`, 제출을 모든 환경에서 거부하고(R17-1 나), `onError`와 (부른 쪽이 없으면) 싱크로 한 번 드러낸다(ERROR-155). 그 로드에서 `OnChange` 검증을 다시 예약하지 않는다(ERROR-156). 노드 `errors`에는 넣지 않는다(사용자의 잘못이 아니다)(ERROR-157). 통보3의 근거(검증 없이 폼만 그리는 사용예, 기본 모드의 불편)는 검증기를 준 이 경우에 닿지 않는다(ERROR-158).

**검증 실행 실패**(검증 함수의 런타임 throw, 요청 시점의 `$ref` 순환, 가칭 `SCHEMA_FORM_ERROR.VALIDATOR_THREW`): 호출자가 기다리는 `validate()`와 제출은 그 프로미스의 거부로 드러낸다(ERROR-039). `OnChange` 검증이면 `onError`에 한 번, 이어 싱크로 한 번 드러내며, core가 소유한 프로미스를 미처리 거부로 남기지 않는다(ERROR-039). 모든 환경에서 같다(ERROR-039). 입력의 판정과의 경계는 `ValidateFunction`의 문서 주석 "입력의 판정은 돌려주고 던지지 않는다. 던지면 실행 실패다"로 못박는다(ERROR-039). 그래서 실행 실패는 검증 결과가 아니며 `onValidate`로 가지 않는다(ERROR-039). 폼 쪽 타입은 이미 동기 반환을 허용한다: `Promise<JSONSchemaError[] | null> | JSONSchemaError[] | null`(`src/types/error.ts:209-212`)(ERROR-039).

**로드 검증의 자리.**(ERROR-040) 마운트 로드는 검증을 요청하지 않고, 렌더 계층이 준비 시점(폼이 커밋된 뒤, 오늘 `handleReady`의 자리)에 `OnChange` 비트가 켜져 있으면 한 번 요청한다(ERROR-040). reset의 로드는 진입 끝에서 요청한다(ERROR-040). 규칙은 '로드 뒤 `OnChange` 비트면 한 번'으로 같다(ERROR-040). 그래서 서버 사이드 렌더링에서는 검증이 돌지 않는다(ERROR-040). core만 쓰는 호스트(목표 C3(프레임워크 독립적인 core))는 마운트 검증을 직접 요청한다(ERROR-040, GOAL-016). 【추론】 로드 뒤 `OnChange` 비트면 한 번 하는 검증(LANDING-041, ERROR-040, EVENT-032)은 `resetSubtree()`에는 그 하위 트리에만 적용한다(ERROR-040).

【추론】 이 경우는 오류도 경고도 아니다(ERROR-201). 【추론】 재생성 reset은 원자적으로 성공한다(ERROR-201). 【추론】 플러그인이 떼어 두지 못해 등록이 실패하면 새 코드 없이 있는 부류로 드러낸다(ERROR-201). 【추론】 전체 컴파일은 `SCHEMA_FORM_ERROR.VALIDATOR_COMPILE_FAILED`, 가드는 `SCHEMA_FORM_ERROR.GUARD_FAILED`이며, `details`에 가칭 `reason: 'duplicateSchemaId'`와 `$id`를 싣는다(ERROR-201). 【추론】 (미정) 행(ERROR-198)의 이 줄은 "코드 없음"으로 닫는다(ERROR-201, ERROR-198).

### 05-validation-and-errors.md §2.20 추가 경고의 발생 조건

변환에러는 onError 로 전달하죠(ERROR-184).

편집자 결정: `onError` 기록의 level은 `warning`이다(ERROR-186). 값을 보존하므로 폼의 약속은 지켜진다(ERROR-186). error 층은 throw·거부·싱크로 드러나야 해 통보 3과 부딪힌다(ERROR-186). `SCHEMA_FORM_WARNING.TYPE_MISMATCH`를 노드의 정합 상태가 켜질 때마다 한 번 보낸다(path, 기대 형, 받은 값의 종류, 쓰기 출처)(ERROR-186, SURFACE-061). level은 `warning`이다(개발 모드 콘솔, 프로덕션은 핸들러가 있을 때만)(ERROR-186). 【추론】 `SCHEMA_FORM_WARNING.TYPE_MISMATCH` 기록은 `{ level: 'warning', code, path, expected: { schemaType, nullable, effective }, received, reason, candidates?, source }`이다(ERROR-186, EVENT-060, SURFACE-061). 【추론】 `expected.schemaType`은 `node.schemaType`이고, `expected.effective`는 그 커밋의 유효 목록이다(ERROR-186). 【추론】 `source`는 EVENT-060의 쓰기 출처 값에 `'gate'`를 더한 것이다(ERROR-186, EVENT-060). 게터 `typeMismatch: boolean`, 경로 목록 `typeMismatches: readonly string[]`, 경고 코드 `SCHEMA_FORM_WARNING.TYPE_MISMATCH`다(ERROR-186, SURFACE-061).

검증기가 있든 없든 보낸다(core의 parse가 찾는 것이라 검증 결과가 아니다)(ERROR-187). 제출은 검증기가 있으면 검증이 막고 없으면 막지 않는다(통보 3)(ERROR-187).

터미널이 된 노드의 입력이 비어 있는 `ChildNodeComponents`를 읽으면 개발 모드에서 경고한다(목표 C2(작성자 실수의 가시성))(ERROR-185, GOAL-015). 【추론】 가상은 `branch`이므로 ERROR-185의 경고(터미널 노드의 입력이 빈 `ChildNodeComponents`를 읽을 때의 개발 모드 경고)는 가상 노드에 적용되지 않는다(ERROR-185).

플러그인이 자기 방언을 선택적으로 선언하고, 스키마의 `$schema`와 어긋나면 개발 모드에서 경고만 낸다(프로덕션 출력 없음, `onError` 핸들러가 있으면 경고 기록)(ERROR-188). 경고 코드는 ERROR-164의 목록에 더한다(가칭, 편집자)(ERROR-188, ERROR-164).

### 07-landing-and-tests.md §1.2 기존 기능과 공개 계약의 이주

(LANDING-004, LANDING-005, LANDING-006, LANDING-007, LANDING-008, LANDING-009, LANDING-010, LANDING-011, LANDING-012, LANDING-013, LANDING-014, LANDING-015, LANDING-016, LANDING-017, LANDING-018, LANDING-019, LANDING-020, LANDING-021, LANDING-022, LANDING-023, LANDING-024, LANDING-025, LANDING-026, LANDING-027, LANDING-028, LANDING-029, LANDING-030, LANDING-031, LANDING-032, LANDING-033, LANDING-034, LANDING-035, LANDING-036, LANDING-037, LANDING-038, LANDING-039, LANDING-040, LANDING-041, LANDING-042, LANDING-043, LANDING-044, LANDING-045, LANDING-046, LANDING-048, LANDING-049, EVENT-071, LANDING-199, ERROR-195, ERROR-190, LANDING-188, LANDING-149)

| # | 오늘 | 새 설계 |
| --- | --- | --- |
| 1 | `oneOf`·`anyOf`의 `const`·`enum` 자동 감지로 분기를 고른다 | 폼은 분기를 고르지 않는다. 명시 `controls.discriminator` 또는 분기 안 `if/then/else: false` 또는 `controls.active` |
| 2 | `oneOfIndex`·`anyOfIndices`, 분기 선택 API | 대체물 없이 사라진다. 분기의 필드는 노드이고 활성 여부는 노드의 `active` |
| 3 | `&if`(분기의 조건) | `controls.active`로 흡수 |
| 4 | `computed` 컨테이너 | `controls`로 이름 변경. 별칭 없음(15라운드) |
| 5 | `&pristine` | `controls.resetInteraction` |
| 6 | 없음 | `controls.unsetValue`, `controls.default`, `controls.children`, `controls.discriminator`, `controls.unsetOnInactive` 신설 |
| 7 | `allOf` 항목 안의 `if/then/else`는 병합되지 않고 경고만 | 병합된다 |
| 8 | 분기 전환 때 공유 노드를 다시 채운다 | 이미 있던 노드는 다시 채우지 않는다 |
| 9 | 표준 `readOnly`와 `&readOnly`는 택일(표준이 이김) | OR |
| 10 | `allOf` 항목끼리 겹친 표준 `readOnly`는 먼저 승 | OR |
| 11 | 공개 문서의 `derived` 레벨 약속 | 에지(의존 값이 바뀔 때만) |
| 12 | 루트 키 다섯(`readOnly`·`disabled`·`active`·`visible`·`pristine`)의 특수 처리, README "Priority System" | 사라진다. 루트 키는 루트 노드의 로컬 키. 전체 잠금은 Form 속성 |
| 13 | 로컬 순위 사슬(노드 `readOnly: false`가 `&readOnly`를 이김) | OR |
| 14 | 맨 키 `disabled`·`visible`·`active` | `controls.disabled`·`controls.visible`·`controls.active` |
| 15 | 조각이 꺼지면 원본을 지우고 켜지면 노드가 생성될 때의 값(없으면 `default`)으로 복원 | 기본 유지(방출에서만 빠짐). 비움은 `unsetOnInactive` |
| 16 | `virtual`의 `required` 재작성(가상 이름 → 실제 자식) | 하지 않는다. 작성자가 실제 필드를 적는다 |
| 17 | `find`·`findNodes`가 터미널 아래 경로에 터미널 노드를 별칭으로 돌려줌 | 노드 없음 |
| 18 | 10비트 `SetValueOption` | 비트 넷 |
| 19 | 루트 `onChange` 매크로태스크 디바운스 | 최외곽 동기 진입당 1회 |
| 20 | `normalizedValue` | `outputValue` |
| 21 | 인터페이스 `JSONSchemaError`(노드 오류 항목) | `ValidationIssue` |
| 22 | `INFINITE_LOOP_DETECTED`는 배치 도중 throw해 커밋을 남기지 않음. 검증기 컴파일 실패는 `console.error` + 노드 오류. `Form`의 자기 바운더리가 마운트 오류를 삼킴. 검증기 없이도 조용히 동작 | 원본 B를 커밋·통지한 뒤 사슬의 끝에서 모든 환경에서 throw(17라운드 소유자 답 R17-1 나). 전체 스키마 컴파일 실패는 검증 불가, 가드 컴파일 실패는 그 게이트의 가드 실패, 요청 시점 실패는 `validate()`의 거부. 루트 바운더리는 다시 던지지 않고 가두어 `onError`와 주인 없는 오류 싱크로 보고한다. 검증기가 없어도 폼은 서며 `if` 게이트의 조각은 꺼진 채 경고를 낸다. 검증기가 없으면 거부하지 않고 개발 모드 콘솔과 `onError`의 경고 기록으로 트리마다 한 번 알리며, 검증기는 있으나 전체 스키마 컴파일이 실패하면 검증 모드가 `None`이 아닐 때 검증 요청·`validate()`·제출이 모든 환경에서 거부된다(소유자 통보 3 답, R17-1 나, 17라운드 스웜 수렴(편집자 결정)) |
| 23 | 조건부 폼 생성 시 가드 컴파일 비용 없음 | `compileGuard` 컴파일이 생긴다(가드 200개에 14–54 ms, 위치당 1회·인스턴스 사이 공유) |
| 24 | `then`·`else`의 `required`로 필드를 켜고 끔(`then.required`가 `computed.active`가 됨) | 읽지 않는다. 그 필드를 `then.properties`로 옮기거나 `controls.active`를 적는다 |
| 25 | 조건도 판별식도 없는 `oneOf`·`anyOf`는 어느 분기도 켜지지 않음 | 모든 분기가 켜진다 |
| 26 | `&if`의 경로 기준점은 호스트(`./kind`) | 바뀌지 않는다. 조각·`children`·`discriminator`의 식도 호스트 기준(15라운드). 자식에 적던 식을 `controls.children`으로 옮길 때만 `../x`를 `./x`로 고친다 |
| 27 | `injectTo` 순환 자동 차단 | 없다. 예산이 잡는다. 왕복이 정확하지 않은 양방향 주입은 식이 `undefined`를 돌려주어 멈춘다(FRAGMENT-034) |
| 28 | 검증기 앞 제거 키 여섯 | 키워드 위치의 그룹 객체 셋(VALIDATE-004). strict 검증기에는 동작 변화 |
| 29 | 꺼졌다 켜질 때 노드 생성 시점의 값으로 복원, `oneOf` 전환에서 같은 이름·같은 타입 값을 이음 | 원본은 그대로 남는다(기본). 잇기 장치는 없고 노드 공유가 대신한다 |
| 30 | 평면 `&키` 축약 | 사라진다. 제어 키는 `controls` 안에만(15라운드) |
| 31 | 맨 키 `terminal`·`virtual`·`propertyKeys`, `formType`·`FormTypeInput`·`FormTypeInputProps`·`FormTypeRendererProps`·`errorMessages`, `options.trim`, `options`의 플러그인 자유 칸 | `options.terminal`·`options.virtual`·`options.propertyKeys`, `presentation`의 다섯 키, 자유 칸. `options.trim`은 `options`에 그대로 두고 적용 자리만 바뀐다(LANDING-145, 17라운드 소유자 답 R17-3) |
| 32 | 플러그인 키 `FormGroup`·`FormLabel`·`FormInput`·`FormError`, Form 속성 `CustomFormTypeRenderer`, 타입 `FormTypeRenderer` | `FormTypeGroupRenderer`·`FormTypeLabelRenderer`·`FormTypeInputRenderer`·`FormTypeErrorRenderer`. Form 속성 `CustomFormTypeRenderer`는 `FormTypeGroupRenderer`가 되고 같은 이름의 Form 속성 `FormTypeLabelRenderer`·`FormTypeInputRenderer`·`FormTypeErrorRenderer`가 새로 생긴다. `ChildNodeComponentProps`와 `FormGroupProps`의 공개 prop `FormTypeRenderer`(와 `OverridableFormTypeInputProps`의 Omit 목록)도 `FormTypeGroupRenderer`로 바꾼다. `FormInputProps`·`FormRenderProps`도 `ChildNodeComponentProps`와 교차하므로 같은 이름 변경을 받는다(17라운드 스웜 수렴(편집자 결정), 사실 정정). 합성 API `Form.*`의 이름과 `…Props` 형 이름은 그대로(그 안의 prop `FormTypeRenderer`는 위대로 바뀐다) |
| 33 | Form 속성 `validatorFactory`는 함수 하나 | `{ compile, compileGuard }` 객체. 플러그인과 같은 계약(VALIDATE-041) |
| 34 | 검증기 플러그인 계약은 `compile`뿐 | `compileGuard(root, pointer)`와 `rejectedKey`가 더해진다. ajv6·7·8 플러그인이 동기 가드 경로를 구현한다 |
| 35 | `node.jsonSchema`는 마운트 때 고정된 값 | 켜진 조각을 병합한 유효 스키마. 활성 조각 집합마다 메모되어 같은 집합이면 같은 참조, 바뀌면 통지의 배달 집합에 든다(VALUE-002, SETTLE-007, SCHEMA-007) |
| 36 | `FormHandle.reset`은 `<Form>` 안의 `RootNodeContextProvider` 아래를 다시 마운트하고(`showError`·첨부 파일 맵 인스턴스·provider는 남고 맵의 내용은 비운다) 그때 새 `jsonSchema`·`defaultValue` prop을 반영 | 로드다(WRITE-042, 16라운드 스웜 수렴(편집자 결정)). 같은 스키마(같은 객체이거나, JSON 부분이 키 순서까지 깊게 같고 함수·컴포넌트 칸이 참조로 같음)면 루트의 로드 한 번이고 트리·캐시·노드 참조가 남는다. 다르면 reset 호출 안에서 트리와 캐시를 새로 만들고(비용은 `<Form key>`의 재생성과 같다) 돌아오기 전에 핸들을 새 트리로 바꾼다. 값은 호출 시점에 커밋된 prop이며, 같은 처리기에서 prop을 바꾼 reset은 그 커밋에서 한 번 더 반영한다(끝에서 새 prop이 반영된다. 그 경로에서는 `onChange`가 두 번이고, `startTransition` 안에서는 첫 로드의 옛 값이 한 번 그려진다). 입력은 자식 프록시를 그리지 않는 입력만 다시 마운트하고(오늘은 provider 아래 전부), 대체된 입력의 늦은 쓰기는 버린다. 어느 경로든 `showError`는 prop 값으로 돌아가고(오늘은 유지), `onStateChange`는 상태가 바뀐 때만 내며, 검증 결과는 비운 뒤 `OnChange` 비트가 켜져 있을 때만 한 번 검증한다(오늘은 모드와 무관하게 늘). `onChange`는 방출 값의 참조가 바뀐 때만 낸다(오늘은 늘 낸다). 스키마 객체를 제자리에서 고친 뒤의 reset은 그 변경을 반영하지 않는다(오늘은 reset마다 `clone`해 다시 읽는다). 노드 참조가 reset을 넘어 이어지는 것은 같은 스키마일 때뿐이다. `FormHandle.reset(option?)`은 억제 비트 둘만 받는다 |
| 37 | 플러그인이 `options.*`에 자유 키를 둠(`protocols`·`lazy`·`minimum`·`maximum` 등)과 맨 키(`lazy`·`radioLabels`·`switchLabels`·`switchSize`·`ampm`·`minRows`·`maxRows`) | `presentation.*`로 옮긴다. `options`는 닫힌 목록(`terminal`·`virtual`·`propertyKeys`·`omitEmpty`·`omitTrailing`·`trim`)이라 남겨 두면 청사진 오류 |
| 38 | 마운트 때 검증 모드와 무관하게 한 번 검증한다(`Form.tsx:139`) | 로드(마운트·reset) 뒤의 검증은 `ValidationMode`의 `OnChange` 비트가 켜져 있을 때만 한 번이다. `OnRequest`만 켠 폼은 마운트 때 검증하지 않는다(EVENT-032, 16라운드 스웜 수렴(편집자 결정)). 마운트의 검증 요청은 렌더 계층의 준비 시점(폼이 커밋된 뒤, 오늘 `handleReady`의 자리), reset은 진입 끝에서 내며 규칙은 "로드 뒤 `OnChange` 비트면 한 번"이다. core만 쓰는 호스트(추가 목표 C3(프레임워크 독립적인 core))는 마운트 검증을 직접 요청한다(ERROR-040, 17라운드 스웜 수렴(편집자 결정)) |
| 39 | 호출자의 전체 교체 `setValue(V)`는 브랜치에도 Refresh를 내어 객체·배열 입력 아래 서브트리 전체를 다시 마운트한다 | 로드가 아닌 쓰기(`setValue(V)` 포함)는 원본이 실제로 바뀐 노드에만 Refresh를 내고 쓴 입력 자신은 제외하며, "값이 같아도 낸다"는 로드의 새 수명에만 해당한다(EVENT-071, LANDING-199). 자식 프록시를 그리지 않는 입력만 다시 마운트하고(로드가 아닌 `setValue(V)`는 원본이 실제로 바뀐 노드에만 Refresh를 내고 그 노드만 다시 마운트하므로, 값 전체를 그리는 브랜치 입력도 그 노드의 원본이 바뀐 때만 다시 마운트된다, EVENT-071, LANDING-199), 대체된 입력의 늦은 쓰기는 버린다(REACT-019, REACT-024, 16라운드 스웜 수렴(편집자 결정)) |
| 40 | 공개 `node.group`(`'branch'` 또는 `'terminal'`) | `node.strategy`(값은 그대로, 17라운드 소유자 확정). 가드 `isBranchNode`·`isTerminalNode`는 이름을 유지한다. 소비자는 `FallbackComponents/FormGroupRenderer.tsx:18`, UI 플러그인 넷의 `FormGroup`, 스토리와 시나리오 시험이다 |
| 41 | 오류를 받는 Form 속성이 없다. 오류는 throw·`console.error`·노드 오류로 흩어지고 경고는 개발 모드 콘솔뿐이다 | Form 속성 `onError` 신설. 검증 결과를 뺀 폼 내부의 오류와 경고를 같은 모양의 기록으로 받는 관찰자이며 흐름을 바꾸지 못한다(17라운드 4번 수렴의 안 B, ERROR-094, ERROR-096). 오류·경고 코드 목록이 공개 계약이 된다 |
| 42 | 진단 신호가 없다(`INFINITE_LOOP_DETECTED`를 던질 뿐). 앞 판 설계의 `diagnostics.status`는 `'budgetExceeded'`, `exceededBudget`은 예산 다섯이었다 | `status`는 `'stable'` 또는 `'degraded'`, 원인 `cause`(예산, 식, 대상, 공유 충돌), `exceededBudget`은 정착 예산 셋, `commit`. `cause`에 다섯째 값 (가칭) `'writeShape'`가 더해지고(ERROR-195), `exceededBudget`에 재귀 펼침의 멈춤을 뜻하는 (가칭) `'recursion'`이 더해져 값이 넷이다(ERROR-190). 다음 로드까지 남고 그 동안 폼의 제출 경로가 거부한다(R17-1 나, ERROR-135, ERROR-138) |
| 43 | 필드 바운더리와 `Form`의 자기 바운더리는 렌더 오류를 가두어 대체 화면을 그리고 `console.error`만 한다 | 가두고 대체 화면을 그리는 것은 같다. 다시 던지지 않고 `componentDidCatch`에서 `onError`와 주인 없는 오류 싱크로 보고한다(ERROR-089). `@winglet/react-utils`의 바운더리 감싸개에 렌더 때 보고 함수를 얻는 선택 인자가 더해진다(소유자 허용, `minor`) |
| 45 | `isTerminalNode`는 `node.group === 'terminal'`로 판정하면서 형을 잎 넷으로 좁힌다(`src/core/nodes/filter.ts:195-198`) | `node.strategy`로 판정하고, 형의 좁히기를 터미널 객체·배열까지 포함하도록 바로잡는다(공개 형 변경). `isTerminalNode`의 반환 형 합집합에 `UnionNode`가 들어가고(LANDING-188), 가상 노드는 전략이 `branch`라 `isTerminalNode(가상)`은 거짓이다(LANDING-149) |
| 46 | 노드 메서드 `findAll` | `findNodes`(`FormHandle`은 이미 `findNodes`다) |

【추론】 이주 안내에는 한 줄만 두고 README를 가리킨다(LANDING-022). 【추론】 그 한 줄은, 오늘 매크로태스크 디바운스가 가리던 "이펙트 쓰기면 키 입력당 `onChange` 2회"가 새 설계에서 드러난다는 점이다(LANDING-022).

조건부 폼의 생성은 현재 구현보다 1.7배 느리다 — 가드 200개에 22.4 ms(LANDING-026, TEST-064). AJV에서 가드의 호출은 싸고(좁은 가드 5–58 ns, 루트에 걸린 가드 200개를 키 입력마다 전부 돌려 7.9 µs) 비싼 것은 **컴파일**이다(가드 하나에 70–270 µs, 200개면 폼 생성 시점에 14–54 ms)(LANDING-026).

소유자(16라운드 답 2): "기본적으로 값에 대한 리셋이긴 한데요, 기존 사용방식을 참고해서 로드로 충분한지 검토해보세요. 불필요한 캐시 리빌드를 원하진 않습니다만, 사용자가 key를 사용한 리셋보다 효율적이고 안전한 방법을 얻길 바라긴 합니다"(LANDING-039)

【추론】 로드 뒤 `OnChange` 비트면 한 번 하는 검증(LANDING-041, ERROR-040, EVENT-032)은 `resetSubtree()`에는 그 하위 트리에만 적용한다(LANDING-041).

【추론】 `diagnostics`와 경고 중복 키는 폼 수준 로드(마운트, `FormHandle.reset()`)에서만 초기화한다(LANDING-045). 【추론】 `setValue(V)`와 `resetSubtree()`는 초기화하지 않는다(LANDING-045).

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

- `design/05-validation-and-errors.md` §1.1 (VALIDATE-002, VALIDATE-008)
- `design/05-validation-and-errors.md` §1.3 (VALIDATE-014, VALIDATE-040, VALIDATE-041, VALIDATE-042, VALIDATE-015, VALIDATE-016, VALIDATE-025)
- `design/05-validation-and-errors.md` §1.4 (VALIDATE-003, VALIDATE-026, VALIDATE-033)
- `design/05-validation-and-errors.md` §1.5 (VALIDATE-017, VALIDATE-018, VALIDATE-019, VALIDATE-032)
- `design/05-validation-and-errors.md` §1.8 (VALIDATE-027, VALIDATE-028, VALIDATE-030)
- `design/05-validation-and-errors.md` §2.10 (ERROR-143)
- `design/05-validation-and-errors.md` §2.11 (ERROR-041)
- `design/05-validation-and-errors.md` §2.12 (ERROR-039)
- `design/05-validation-and-errors.md` §2.20 (ERROR-188)
- `design/07-landing-and-tests.md` §1.2 (LANDING-026)
- `design/07-landing-and-tests.md` §2.11 (TEST-064)
