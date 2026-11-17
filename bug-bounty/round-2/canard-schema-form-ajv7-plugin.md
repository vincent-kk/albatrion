# @canard/schema-form-ajv7-plugin 버그 바운티 2라운드 결과

2라운드에서 새로 확인된 문제는 1건입니다. 1라운드 문서([`../round-1/canard-schema-form-ajv7-plugin.md`](../round-1/canard-schema-form-ajv7-plugin.md))의 2건은 고쳐진 것으로 보고 제외했습니다. 재현 테스트는 메인 세션에서 다시 실행해 같은 실패를 확인했습니다.

재현 테스트: [`probes/canard-schema-form-ajv7-plugin/guardPercent.test.ts`](probes/canard-schema-form-ajv7-plugin/guardPercent.test.ts)

- 실행하려면 파일을 `packages/canard/schema-form-ajv7-plugin/src/__bounty__/r2-validation/`에 복사한 뒤 `yarn workspace @canard/schema-form-ajv7-plugin test --run src/__bounty__/r2-validation/`을 실행합니다.

관련 항목: schema-form 2라운드 문서 8번 항목(코어가 `*`, `.`, `..`, `@` 이름을 폼 경로 문법으로 넘기는 문제)도 이 플러그인에 영향을 줍니다.

## 1. 루트 포인터 가드가 `%`가 든 속성 이름에서 실패하고, 유효한 이스케이프가 든 이름에서는 다른 속성의 조건을 조용히 평가합니다

- 심각도: 중간. AJV8 2라운드 문서 1번 항목과 같은 버그입니다. 증상과 계약은 그 문서에 적었습니다.
- 원인: `src/validator/createGuardCompiler.ts`의 35행과 62행이 원본 포인터를 인코딩하지 않고 URI 조각에 붙입니다.
- 재현:
  - "compiles the RFC 6901 pointer /properties/100%/if and evaluates it"와 "…/properties/50%off/if…": `URIError: URI malformed`가 납니다.
  - "evaluates the guard of property "a%20b", not the guard of its sibling "a b"": 실제 `false`, 기대 `true`.
- 확신도: 높음.

## 버그가 아니라고 확인한 가설

- 같은 `$id`를 이미 가진 인스턴스를 `createValidator(instance)`에 넘기면 "already exists"로 컴파일에 실패합니다. 공유 적합성 시나리오 `lifetime.consumer-schema-kept`가 의도로 고정한 동작입니다. README에 이 제약을 적는 것만 고려하면 됩니다.
- 나머지 확인 내용은 AJV8 2라운드 문서의 같은 절과 같습니다.
