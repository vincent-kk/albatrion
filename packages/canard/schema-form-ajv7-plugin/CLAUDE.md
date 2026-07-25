# CLAUDE.md

`@canard/schema-form-ajv7-plugin` — AJV 7.x validator plugin for `@canard/schema-form`. JSON Schema Draft-07 / Draft 2019-09 지원.

## Commands

```bash
yarn build             # ESM + CJS 빌드 + 타입 선언
yarn test              # Vitest 테스트
yarn test --watch      # watch 모드
yarn lint              # ESLint
yarn storybook         # Storybook dev (port 6006)
```

## Architecture

- `src/index.ts` — 플러그인 진입점
- `src/validator/validatorPlugin.ts` — `bind()` / `compile()` 구현
- `src/validator/createValidatorFactory.ts` — validator 팩토리
- `src/validator/utils/transformErrors.ts` — AJV 에러 → schema-form 포맷 변환
- `src/validator/utils/resolveAjvConstructor.ts` — `ajv` default import 에서 생성자 추출

## Key Details

- **AJV 기본 설정**: `allErrors: true`, `strict: false`, `validateFormats: false`
- **에러 변환**: `required` 에러는 missing property를 dataPath에 append, 나머지는 JSONPointer 그대로 사용
- **비동기 검증**: 모든 validator는 `$async: true`로 컴파일
- **`ajv` interop**: ajv@7 의 `module.exports` 는 클래스가 아니라 `{ __esModule: true, default: Ajv }` 네임스페이스다. default import 로 얻는 값은 로더의 interop 에 따라 달라지므로 (Node 의 CJS→ESM interop 은 `__esModule` 을 무시함) `new Ajv(...)` 를 직접 호출하지 말고 `resolveAjvConstructor` 를 거칠 것
- **빌드 타겟**: ES2022, ESM(.mjs) + CJS(.cjs), Rolldown 사용
