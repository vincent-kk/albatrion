# CLAUDE.md

`@canard/schema-form-antd-mobile-plugin` — Ant Design Mobile UI 컴포넌트를 `@canard/schema-form`에 연결하는 모바일 최적화 플러그인.

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
- `formTypeInputDefinitions` — 10개 모바일 입력 컴포넌트 정의 (우선순위 순)

**FormTypeInput 우선순위**: BooleanSwitch → StringCheckbox → StringSwitch → RadioGroup → Array → Slider → Textarea → String → Number → Boolean

## Schema → Component 매핑

| 조건 | 컴포넌트 |
|------|---------|
| `type: boolean`, `formType: switch` | Switch |
| `type: string`, `formType: checkbox` | Checkbox Group |
| `type: string`, `formType: switch` | String Switch |
| `type: string/integer`, `formType: radiogroup` | Radio Group |
| `type: array` | Dynamic List |
| `format: slider` | Slider |
| `format: textarea` | Textarea |
| `format: password` | Password Input |
| `type: number/integer` | Stepper |
| `type: boolean` | Checkbox |

## Peer Dependencies

`@canard/schema-form`, `antd-mobile`, `dayjs`, React
