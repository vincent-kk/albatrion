# CLAUDE.md

`@canard/schema-form` — JSON Schema 기반 React 폼 라이브러리. 노드 트리 기반 상태 관리, 플러그인 시스템, 비동기 검증 지원.

## Commands

```bash
yarn build             # ESM + CJS 빌드 + 타입 선언 + claude-hashes.json
yarn build:types       # 타입 선언만
yarn build:hashes      # docs/claude/** 해시 매니페스트만 재생성
yarn test              # Vitest 테스트
yarn test --coverage   # 커버리지 포함
yarn test --run src/__tests__/   # 렌더 레벨(node tree + DOM) 통합 스위트만
yarn lint              # ESLint
yarn storybook         # Storybook dev (port 6006)
```

## Claude Docs Injector

`docs/claude/**` 자산을 사용자 `.claude/` 에 주입. 엔진: `@slats/claude-assets-sync` (bin: `inject-claude-settings`).

```bash
npx -p @slats/claude-assets-sync inject-claude-settings --package=@canard/schema-form --scope=user
npx -p @slats/claude-assets-sync inject-claude-settings --package=@canard/schema-form --scope=project
npx -p @slats/claude-assets-sync inject-claude-settings --package=@canard/schema-form --scope=user --dry-run
npx -p @slats/claude-assets-sync inject-claude-settings --package=@canard/schema-form --scope=user --force
```

### Isolation Guardrails

- `src/**` 는 `docs/**` 와 `@slats/claude-assets-sync` 어느 것도 import 금지.
- **절대 `exports` 에 `./docs/*` 를 추가하지 말 것.**

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

## Render-Level Test Harness (`src/__tests__/`)

버그 다수는 **node tree는 맞는데 렌더된 DOM이 어긋나는** 구간(초기 마운트 priming, 가지 전환, 배열 identity, Refresh-gated 비제어 입력)에서 발생한다. node-tree 전용 단위 테스트는 이를 못 잡는다.

- `src/__tests__/renderForm.tsx` — 공유 하니스. 실제 `<Form>`을 렌더하고 **두 레이어를 동시 검증**: 존재는 `[data-path]` 기반 `exists(path)`, 값은 `id={path}` 기반 `value/checked(path)`, 트리는 `node(path)/getValue()`. `flushOnMount:false`(동기 priming 단언), `instrument`(remount 감지), `strictMode`, `validator`(AJV), `caughtErrors`(수렴 가드), userEvent(`type/selectOption/toggle/addItem/removeItem`) 지원.
- `src/__tests__/scenarios/*.render.test.tsx` — 시나리오 패밀리별 스위트(composition/array/computed/refresh/reset/validation/...). 파일당 ≤15 케이스. 신규 시나리오는 여기에 추가한다.
- 검증된 product 버그는 `it.fails('... // BUG: ...')`로 표면화(스위트는 green 유지). src를 고쳐 통과시키지 말 것.

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
