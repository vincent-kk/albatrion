# @canard/schema-form-ajv8-plugin 버그 바운티 2라운드 결과

2라운드에서 새로 확인된 문제는 2건입니다. 1라운드 문서([`../round-1/canard-schema-form-ajv8-plugin.md`](../round-1/canard-schema-form-ajv8-plugin.md))의 5건은 고쳐진 것으로 보고 제외했습니다. 모든 항목은 실패하는 재현 테스트로 확인했고, 메인 세션에서 다시 실행해 같은 실패를 확인했습니다.

재현 테스트: [`probes/canard-schema-form-ajv8-plugin/`](probes/canard-schema-form-ajv8-plugin/)

- 실행하려면 파일을 `packages/canard/schema-form-ajv8-plugin/src/__bounty__/r2-validation/`에 복사한 뒤 `yarn workspace @canard/schema-form-ajv8-plugin test --run src/__bounty__/r2-validation/`을 실행합니다.

관련 항목: schema-form 2라운드 문서 8번 항목(코어가 `*`, `.`, `..`, `@` 이름을 폼 경로 문법으로 넘기는 문제)도 이 플러그인의 조건부 필드에 영향을 줍니다. 원인이 코어 쪽이라 그 문서에 적었습니다.

## 1. 루트 포인터 가드가 `%`가 든 속성 이름에서 실패하고, 유효한 이스케이프가 든 이름에서는 다른 속성의 조건을 조용히 평가합니다

- 심각도: 중간. 이름에 `%`가 있는 속성(예: `discount%`, `100%`) 아래의 `if` 안에 `$ref`가 있으면 오류가 나고, 그 조건이 거짓이 되어 `then` 필드가 영영 켜지지 않습니다. `"a%20b"`처럼 유효한 퍼센트 이스케이프가 든 이름에서는 예외도 나지 않고, 형제 속성 `"a b"`의 `if`를 평가하므로 필드 참여가 틀립니다.
- 영향받는 공개 API: 세 진입점 모두의 `plugin.validator.compileGuard`와 `createValidator(...).compileGuard`, 그리고 Form의 조건부 필드.
- 어긋난 계약:
  - `src/validator/createGuardCompiler.ts:23`은 `pointer`를 조각(fragment) 표기가 아닌 JSON Pointer로 정의합니다. RFC 6901에서 `%`는 평범한 글자입니다.
  - RFC 6901 6절은 포인터를 URI 조각에 넣을 때 퍼센트 인코딩을 하라고 요구합니다. 같은 플러그인의 `utils/dynamicScope/collectGuardDynamicAnchors.ts:55`는 조각을 만들 때 이미 `encodeURIComponent`를 씁니다.
- 원인: `createGuardCompiler.ts:66`(`$ref: \`${registration.key}#${pointer}\``)이 원본 포인터를 인코딩하지 않고 URI 조각에 붙입니다. AJV가 조각을 디코딩할 때 `%`에서 예외를 던지거나 `%20`을 공백으로 바꿔 다른 키를 찾습니다. `$ref`가 없는 자기완결 가드는 디코딩하지 않는 `resolveGuardSchema`를 쓰므로 정상입니다.
- 1라운드와의 관계: 1라운드 4번(URI 인코딩된 속성 이름 조회)과 같은 종류입니다. AJV6, AJV7 플러그인에도 같은 문제가 있습니다.
- 재현(`guardPercent.test.ts`):
  - "compiles the RFC 6901 pointer /properties/100%/if and evaluates it"와 "…/properties/50%off/if…": `URI contains malformed percent-encoding.` 오류가 납니다. 기대 결과는 `[true, false]`입니다.
  - "evaluates the guard of property "a%20b", not the guard of its sibling "a b"": 실제 `false`, 기대 `true`.
  - Form 수준 재현: schema-form 2라운드 재현 `r2-validation/guardPointer.test.tsx`의 `"100%"`와 `$ref` 행에서 email 필드가 비활성입니다.
- 확신도: 높음.

## 2. 기본 설정이 문서가 올바르다고 소개하는 스키마에 strict mode 콘솔 경고를 냅니다

- 심각도: 낮음. `console.warn` 소음입니다. AJV 로거는 `NODE_ENV`와 무관하게 출력하므로 프로덕션에서도 나오고, 마운트되는 루트마다, `if`마다 두 줄씩 나옵니다. schema-form 렌더 테스트를 실행하는 동안에도 이 경고가 계속 출력되는 것을 확인했습니다.
- 영향받는 공개 API: `plugin.validator`(기본 진입점과 2020 진입점), Form.
- 어긋난 계약: README 176행과 패키지 `CLAUDE.md`는 strict mode가 플러그인 기본값이 아니라고 적고 있습니다. schema-form `core/engine/validation/DETAIL.md:45`(VALIDATE-003)는 플러그인이 엄격 검사를 끈 기본값을 유지한다고 적고 있습니다. AJV7 플러그인은 `strict: false`라서 경고가 나지 않습니다.
- 원인:
  - `src/default/validatorPlugin.ts`(2019와 2020 진입점도 같음)의 `defaultSettings`가 `strictSchema: false`만 지정하므로, `strictTypes`와 `strictTuples`는 AJV 기본값 `'log'`로 남습니다.
  - `createGuardCompiler.ts:56`부터 66행은 `if` 부분 스키마를 부모의 `type: 'object'` 문맥 없이 단독으로 컴파일합니다. 그래서 `validation-ux.md`의 영수증 예제(`if: { properties, required }`)가 `missing type "object" for keyword …` 경고를 냅니다. 같은 스키마를 전체 컴파일하면 경고가 없습니다.
  - `prefixItems` 튜플은 2020 진입점의 전체 컴파일에서도 strictTuples 경고를 냅니다.
- 1라운드와의 관계: 새로운 종류입니다.
- 재현(`strictWarnings.test.ts`):
  - "the if guard of the documented conditional schema compiles without strict-mode console warnings (default settings)": 실제 경고 2건, 기대 `[]`.
  - "a prefixItems tuple field compiles without strict-mode console warnings on the 2020 entry (default settings)": 실제 경고 1건, 기대 `[]`.
- 확신도: 동작은 높음. 의도가 아니라는 판단은 중간입니다.

## 버그가 아니라고 확인한 가설

- 5개 진입점(AJV6, AJV7, AJV8의 각 진입점)에서 18가지 스키마 모양의 판정이 순수 AJV와 일치했습니다. 대상은 `$defs`와 `definitions` 참조, 중첩 `$id`, 상대 `$id`, `unevaluatedProperties`, `dependentSchemas`, `$async` 루트, `$recursiveRef`와 `$dynamicRef`, `$anchor`, `$ref` 형제 키워드, 루트 `$ref`입니다.
- 가드와 전체 검증의 `if` 판정이 중첩 `$id`, `$defs`, 상대 `$id`, 앵커, 형제 자원 참조에서 일치했습니다.
- 특이한 속성 이름 18개(`a.b`, `0`, `[`, `']`, 따옴표, 역슬래시, 줄바꿈 등)에 대한 `dataPath`와 `required` 경로 변환이 세 플러그인에서 같았습니다.
- `createValidator(instance)`에 넘긴 인스턴스가 같은 `$id`를 이미 가지고 있으면 "already exists"로 컴파일에 실패합니다. 이는 공유 적합성 시나리오 `lifetime.consumer-schema-kept`가 의도로 고정한 동작입니다. README에는 이 제약이 적혀 있지 않으므로 문서 보강만 고려하면 됩니다.
