# CLAUDE.md

`@canard/schema-form-mui-plugin` — Material-UI(MUI) 컴포넌트를 `@canard/schema-form`에 연결하는 플러그인. MUI X DatePickers 포함.

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
- `formTypeInputDefinitions` — 15개 입력 컴포넌트 정의 (우선순위 순)

**FormTypeInput 우선순위**: BooleanSwitch → StringCheckbox → StringSwitch → Uri → Month → Date → Time → RadioGroup → StringEnum → Array → Slider → Textarea → String → Number → Boolean

## Context

`MuiContext`로 일관된 스타일 적용: `size` (`small`|`medium`), `variant` (`outlined`|`filled`|`standard`), `fullWidth`.

## Schema → Component 매핑 기준

`type`, `format`, `formType`, `enum` JSON Schema 속성으로 컴포넌트 자동 선택.

## Peer Dependencies

`@canard/schema-form`, `@mui/material ^7`, `@mui/x-date-pickers ^8`, `@mui/icons-material ^7`, `@emotion/react`, `@emotion/styled`, `dayjs`, React
