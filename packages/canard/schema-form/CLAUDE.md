# CLAUDE.md

`@canard/schema-form` — JSON Schema 기반 React 폼 라이브러리. 노드 트리 기반 상태 관리, 플러그인 시스템, 비동기 검증 지원.

## Commands

```bash
yarn build             # ESM + CJS 빌드 + 타입 선언
yarn build:types       # 타입 선언만
yarn test              # Vitest 테스트 (352개)
yarn test --coverage   # 커버리지 포함
yarn lint              # ESLint
yarn storybook         # Storybook dev (port 6006)
yarn size-limit        # 번들 크기 확인 (CJS/ESM 각 20KB 제한)
```

## Architecture

### Node System
- **AbstractNode** — 모든 노드의 기반 클래스
- **Terminal Nodes**: `StringNode`, `NumberNode`, `BooleanNode`, `NullNode`
- **Branch Nodes**: `ObjectNode`, `ArrayNode` (각각 `BranchStrategy` / `TerminalStrategy`)
- **Special**: `VirtualNode` (조건부 필드, 계산 값)
- 노드 생성: `nodeFromJsonSchema()`

### Plugin System (`src/app/plugin/`)
- Validator 플러그인: AJV7/AJV8 등 JSON Schema 검증
- UI 컴포넌트 플러그인: `FormGroup`, `FormLabel`, `FormInput`, `FormError`
- FormTypeInput 플러그인: 커스텀 입력 컴포넌트

### Key APIs
- `Form` — 메인 진입점
- `Form.Render` — JSONPointer 경로로 커스텀 레이아웃
- `registerPlugin()` — 플러그인 전역 등록 (렌더 전 필수)
- `node.find('/path')` — JSONPointer 노드 탐색 (`..` 부모, `*` 와일드카드는 제한적 사용)
- `node.value` / `node.enhancedValue` (가상 필드 포함)
- `node.validate()` / `node.errors`
- `node.subscribe()` — 노드 이벤트 구독 (cleanup 함수 반환)

### FormTypeInput 우선순위 (높음 → 낮음)
1. 스키마 내 `FormTypeInput` 직접 지정
2. `formTypeInputMap` 경로 매핑
3. Form 레벨 `formTypeInputDefinitions`
4. Provider `formTypeInputDefinitions`
5. 플러그인 제공 정의

### Computed Properties
```typescript
computed: {
  visible: '../category === "premium"',
  readOnly: '../locked === true',
  watch: ['../category'],   // 명시적 의존성
}
```

### Validation Modes
`OnChange` | `OnRequest` | `None`

## Class Member Ordering (Domain-First)
Identity → Tree Structure → Value Management → Computed Properties → State → Validation → Events → Injection → Lifecycle → Constructor

## Key Hooks
- `useSchemaNode`, `useSchemaNodeSubscribe`, `useFormSubmit`

## Key Type Utilities
- `InferValueType<Schema>`, `InferSchemaNode<Schema>`, `FormHandle<Schema, Value>`

## Dependencies
`@winglet/common-utils`, `@winglet/json`, `@winglet/json-schema`, `@winglet/react-utils`, React 18-19 (peer)

## Build Output
`dist/index.cjs` + `dist/index.mjs` + `dist/index.d.ts`, 각 20KB 이하
