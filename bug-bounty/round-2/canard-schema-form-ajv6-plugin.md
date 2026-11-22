# @canard/schema-form-ajv6-plugin 버그 바운티 2라운드 결과

2라운드에서 새로 확인된 문제는 1건입니다. 1라운드 문서([`../round-1/canard-schema-form-ajv6-plugin.md`](../round-1/canard-schema-form-ajv6-plugin.md))의 2건은 고쳐진 것으로 보고 제외했습니다. 재현 테스트는 메인 세션에서 다시 실행해 같은 실패를 확인했습니다.

재현 테스트: [`probes/canard-schema-form-ajv6-plugin/guardPercent.test.ts`](probes/canard-schema-form-ajv6-plugin/guardPercent.test.ts)

- 실행하려면 파일을 `packages/canard/schema-form-ajv6-plugin/src/__bounty__/r2-validation/`에 복사한 뒤 `yarn workspace @canard/schema-form-ajv6-plugin test --run src/__bounty__/r2-validation/`을 실행합니다.

관련 항목: schema-form 2라운드 문서 8번 항목(코어가 `*`, `.`, `..`, `@` 이름을 폼 경로 문법으로 넘기는 문제)도 이 플러그인에 영향을 줍니다.

## 1. 루트 포인터 가드가 `%`가 든 속성 이름에서 실패하고, 유효한 이스케이프가 든 이름에서는 다른 속성의 조건을 조용히 평가합니다

- 심각도: 중간. AJV8 2라운드 문서 1번 항목과 같은 버그입니다. 증상과 계약은 그 문서에 적었습니다.
- 원인: `src/validator/createGuardCompiler.ts`의 33행과 58행이 원본 포인터를 인코딩하지 않고 URI 조각에 붙입니다.
- 재현:
  - "compiles the RFC 6901 pointer /properties/100%/if and evaluates it"와 "…/properties/50%off/if…": `URIError: URI malformed`가 납니다.
  - "evaluates the guard of property "a%20b", not the guard of its sibling "a b"": 실제 `false`, 기대 `true`.
- 확신도: 높음.

## 버그가 아니라고 확인한 가설

- 같은 `$id`를 이미 가진 인스턴스를 `createValidator(instance)`에 넘기는 경우, AJV6은 내용이 같을 때 캐시 덕분에 통과합니다(AJV7과 AJV8은 실패하며, 의도로 고정된 동작입니다).
- AJV6이 `$anchor`를 지원하지 않는 것과 format 검사가 꺼진 것은 draft-07 기준과 VALIDATE-003 기본값에 따른 정상 동작입니다.
