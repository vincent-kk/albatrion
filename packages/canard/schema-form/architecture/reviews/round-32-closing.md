# 32라운드 닫기 — 05 실행 계획의 원장 해석 둘: `validatorFactory` 계약 통일의 공개 겉면 시점, `VALIDATOR_BIND_REFUSED`가 던지는 객체

2026-10-01. 05 작업자(브랜치 `feat/schema-form-dispatch-and-validation`)가 실행 계획의 남은 항목 둘을 물었다. 둘 다 현행 항목에서 유도되나 원장이 문장으로 적지 않아 편집자 결정으로 닫는다. 소유자에게 물을 것은 없다.

### 32C-01 검증기 계약 통일은 PR-4에서 코어 쪽 계약 형과 ajv 플러그인 셋을 바꾸고, Form 속성 `validatorFactory`의 공개 형은 PR-7의 전환에서 바뀐다

- 닫는 항목: LANDING-064(보충), LANDING-036(보충), LANDING-159(보충), VALIDATE-040(보충)
- 결정:
  - 【추론】 LANDING-064의 PR-4 행 "검증기 계약(`compileGuard`, `rejectedKey`)의 플러그인·`validatorFactory` 통일과 ajv6·7·8 플러그인 구현"은 코어가 받는 검증기 계약 형 하나를 정하고 플러그인 셋과 코어의 트리 생성 인자가 그 형을 쓰게 하는 일이다; Form 속성 `validatorFactory`의 공개 형을 바꾸는 일은 아니다.
  - 【추론】 Form 속성 `validatorFactory`가 함수 하나에서 `{ compile, compileGuard }` 객체로 바뀌는 것(LANDING-036 이주 33)은 공개 겉면의 변경이고, LANDING-159 규칙 3대로 `src/index.ts`는 PR-7까지 옛 엔진을 가리키며 LANDING-064의 PR-7 행이 Form 속성 `validatorFactory`의 연결을 전환 PR에 두므로, 공개 속성의 형과 동작은 PR-7에서 바뀐다; PR-4 전에는 공개 동작 변경이 없다.
  - 【추론】 그래서 PR-4의 새 계약 형은 공개 index가 아닌 새 엔진 쪽 모듈에서 내보내고, ajv 플러그인 셋은 그 형을 구현한다; 플러그인 패키지의 공개 겉면이 PR-4에서 바뀌는 것은 LANDING-093·LANDING-192(이주)대로이며 소비자용 Form 속성은 전환 뒤에 따른다.
- 근거: LANDING-064 PR-4 행 "검증기 계약(`compileGuard`, `rejectedKey`)의 플러그인·`validatorFactory` 통일과 ajv6·7·8 플러그인 구현"; LANDING-064 PR-7 행 "Form 속성(`readOnly`·`disabled` 전체 잠금, `unsetOnInactive`, `disableAutomaticWrites`, `onError`, `onDiagnosticsChange`, `validatorFactory`"; LANDING-036 "| 33 | Form 속성 `validatorFactory`는 함수 하나 | `{ compile, compileGuard }` 객체. 플러그인과 같은 계약(§11) |"; LANDING-159 "규칙 3: `src/core/index.ts`와 `src/index.ts`는 PR-7까지 옛 엔진을 가리킨다."; LANDING-093 개발계획 P1 "ajv6·ajv7·ajv8의 `compileGuard`·`rejectedKey`·같은 `$id` 처리는 원장대로 PR-4에서 셋 다 구현한다(LANDING-064·093 그대로)."

### 32C-02 `VALIDATOR_BIND_REFUSED`는 플러그인이 던지는 `@winglet/common-utils`의 `BaseError`(그룹 `UNHANDLED_ERROR`, 코드 `VALIDATOR_BIND_REFUSED`)다 — 코어의 `UnhandledError` 클래스를 요구하는 항목은 없다

- 닫는 항목: VALIDATE-050(보충), LANDING-192(보충), SURFACE-014(보충)
- 결정:
  - 【추론】 VALIDATE-050과 ERROR-164가 `VALIDATOR_BIND_REFUSED`에 요구하는 것은 코드 `UNHANDLED_ERROR.VALIDATOR_BIND_REFUSED`, 부른 쪽에 즉시 던짐, 인스턴스를 붙이지 않음, `onError`에 가지 않음(`REGISTER_PLUGIN`과 같은 부류)이며, 던지는 객체가 코어의 `UnhandledError` 클래스여야 한다는 문장은 어느 항목에도 없다.
  - 【추론】 ajv 플러그인 셋은 `@canard/schema-form`을 런타임 의존성으로 갖지 않으므로(형만 가져온다) 코어 클래스를 던지려면 새 런타임 의존성이 필요한데, 원장은 그런 의존을 정하지 않았다; 플러그인이 이미 런타임 의존성으로 가진 `@winglet/common-utils`의 `BaseError`를 그룹 `'UNHANDLED_ERROR'`·코드 `'VALIDATOR_BIND_REFUSED'`로 던진다(코어 `UnhandledError`와 같은 기반 클래스·같은 그룹·코드 모양). 플러그인 안의 하위 클래스로 감싸도 되나 `name`은 자기 이름을 적고 코어 클래스를 사칭하지 않는다.
  - 【추론】 코어의 `isUnhandledError`는 `instanceof` 가드라 이 객체를 알아보지 못하며 이는 받아들인다: 이 사건은 폼 밖에서 플러그인의 `bind` 호출자에게 가는 것이라 코어의 가드로 거를 자리가 없고, 호출자는 `group`과 `code`로 가른다. 플러그인 문서에 이 한 줄을 적는다.
- 근거: VALIDATE-050 "켜져 있으면 `(가칭) UNHANDLED_ERROR.VALIDATOR_BIND_REFUSED`를 부른 쪽에 즉시 던지고, 인스턴스를 붙이지 않는다.", "폼 인스턴스가 없으므로 `onError`는 받지 않으며, `UNHANDLED_ERROR.REGISTER_PLUGIN` 행과 같은 부류다."; ERROR-164 "| `UNHANDLED_ERROR.REGISTER_PLUGIN` | `error` | registerPlugin 호출(전역) | src/app/plugin/registerPlugin.ts:215 | 부른 쪽에 즉시 throw | 받지 않음(폼 인스턴스가 없음) | 오늘과 새 설계 모두 |"; 오늘 코드 `src/errors/UnhandledError.ts:17-22`(`BaseError`를 그룹 `'UNHANDLED_ERROR'`로 확장), `src/index.ts`(가드 `isUnhandledError`만 공개), `schema-form-ajv8-plugin/package.json`(`@canard/schema-form`은 개발 의존성, `@winglet/common-utils`는 런타임 의존성).
