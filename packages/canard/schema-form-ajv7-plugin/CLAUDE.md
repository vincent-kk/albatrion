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

## Key Details

- **AJV 기본 설정**: `allErrors: true`, `strict: false`, `validateFormats: false`
- **에러 변환**: `required` 에러는 missing property를 dataPath에 append, 나머지는 JSONPointer 그대로 사용
- **비동기 검증**: 모든 validator는 `$async: true`로 컴파일
- **빌드 타겟**: ES2022, ESM(.mjs) + CJS(.cjs), Rollup 사용
