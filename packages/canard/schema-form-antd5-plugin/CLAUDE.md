# CLAUDE.md

`@canard/schema-form-antd5-plugin` — Ant Design 5.x UI 컴포넌트를 `@canard/schema-form`에 연결하는 플러그인.

## Commands

```bash
yarn build             # ESM + CJS 빌드 + 타입 선언
yarn test              # Vitest 테스트
yarn lint              # ESLint
yarn storybook         # Storybook dev (port 6006)
```

## Architecture

플러그인은 `SchemaFormPlugin` 객체를 export:
- `FormGroup` / `FormLabel` / `FormInput` / `FormError` — 기본 레이아웃 컴포넌트
- `formTypeInputDefinitions` — 18개 입력 컴포넌트 정의 (우선순위 순)

**입력 컴포넌트 카테고리**:
- String: text, password, textarea, URI
- Number: input, slider
- Boolean: checkbox, switch
- Date/Time: date, time, month, range
- Array: dynamic list
- Selection: radio, checkbox group, dropdown

## Schema → Component 매핑 기준

`type`, `format`, `formType`, `enum` JSON Schema 속성으로 컴포넌트 자동 선택.

## Peer Dependencies

`@canard/schema-form`, `antd`, `dayjs`, React
