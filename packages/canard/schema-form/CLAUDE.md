# CLAUDE.md

`@canard/schema-form` — JSON Schema 기반 React 폼 라이브러리. 노드 트리 기반 상태 관리, 플러그인 시스템, 비동기 검증 지원.

## Design Values

- Consistent, predictable behavior is the core value — where behavior could go either way, follow the consistency the public interface leads a caller to expect.
- Speed first, minimal computation, and the same value read twice returns the same reference — every change states its speed and memory cost.
- For a small, fixed set of checks known at build time, use direct `&&` or `||` conditions. Hoist a constant key array when iteration is clearer; never allocate the same fixed list on every call.
- Use `hasOwnProperty` from `@winglet/common-utils/lib` for own-key checks instead of calling `Object.prototype.hasOwnProperty` directly.
- Use `isArray` from `@winglet/common-utils/filter` for array checks instead of calling `Array.isArray` directly (`src/__legacy__` keeps its moved code as is; consumer-facing doc examples may show the native call).

## Commands

```bash
yarn build             # ESM + CJS 빌드 + 타입 선언 + agents-hashes.json
yarn build:types       # 타입 선언만
yarn build:hashes      # docs/agents/** 해시 매니페스트만 재생성
yarn test              # Vitest 테스트
yarn test --coverage   # 커버리지 포함
yarn test --run src/__tests__/   # 렌더 레벨(node tree + DOM) 통합 스위트만
yarn lint              # ESLint
yarn storybook         # Storybook dev (port 6006)
```

## Agent Docs Injector

`docs/agents/**` 자산을 선택한 에이전트 위치에 주입. 엔진: `@slats/agents-assets-sync` (bin: `inject-agents-settings`).
`--agent` 로 대상 에이전트를 고른다 — `claude` 는 `.claude/{skills,rules,commands}`, `codex`/`agents` 는 `.agents/skills` + `AGENTS.md` 마커 블록(project scope 기준).

```bash
npx -p @slats/agents-assets-sync inject-agents-settings --package=@canard/schema-form --agent=claude --scope=user
npx -p @slats/agents-assets-sync inject-agents-settings --package=@canard/schema-form --agent=codex --scope=project
npx -p @slats/agents-assets-sync inject-agents-settings --package=@canard/schema-form --agent=claude,codex --scope=user --dry-run
npx -p @slats/agents-assets-sync inject-agents-settings --package=@canard/schema-form --agent=claude --scope=user --force --yes
```

### Isolation Guardrails

- `src/**` 는 `docs/**` 와 `@slats/agents-assets-sync` 어느 것도 import 금지.
- **절대 `exports` 에 `./docs/*` 를 추가하지 말 것.**

## Architecture

### Node System

- **AbstractNode** — 모든 노드의 기반 클래스
- **Terminal Nodes**: `StringNode`, `NumberNode`, `BooleanNode`, `NullNode`
- **Branch Nodes**: `ObjectNode`, `ArrayNode` (각각 `BranchStrategy` / `TerminalStrategy`)
- **Special**: `VirtualNode` (조건부 필드, 계산 값)
- 노드 생성: `nodeFromJSONSchema()`

### Plugin System (`src/app/plugin/`)

- Validator 플러그인: AJV7/AJV8 등 JSON Schema 검증
- UI 컴포넌트 플러그인: `FormGroup`, `FormLabel`, `FormInput`, `FormError`
- FormTypeInput 플러그인: 커스텀 입력 컴포넌트

### Error Isolation (user-injected render surfaces)

사용자 주입 컴포넌트(FormTypeRenderer/FormTypeInput, virtualization `Placeholder` 등)는 반드시 `@winglet/react-utils/hoc`의 `withErrorBoundary`로 감싼다 — 하나가 렌더 중 throw해도 폼 전체가 아니라 그 서브트리만 fallback으로 격리된다. 래핑은 **컴포넌트를 해석·소유하는 지점에서 1회**만: 렌더러는 `SchemaNodeProxy`/`SchemaNodeInputWrapper`가 `memo(withErrorBoundary(...))`로, `Placeholder`는 `VirtualizationManager` 생성자가 form당 1회 래핑해 모든 지연 필드가 동일 인스턴스를 공유한다. 소비처(개별 렌더 위치)마다 반복 래핑하지 말 것. (`helpers/virtualization`는 이 `Placeholder` 방어만 React 예외로 허용 — INTENT.md 참조.)

### Key APIs

- `Form` — 메인 진입점
- `Form.Render` — JSONPointer 경로로 커스텀 레이아웃
- `registerPlugin()` — 플러그인 전역 등록 (렌더 전 필수)
- `node.find('/path')` — JSONPointer 노드 탐색 (`..` 부모, `*` 와일드카드는 제한적 사용)
- `node.value` / `node.enhancedValue` (가상 필드 포함)
- `node.normalizedValue` — 스키마 옵션으로 정제된 값. `FormHandle.getValue`/`submit`/루트 방출/부모측 hydration 스냅샷이 이 값을 읽으며, `ArrayNode`는 `options.omitTrailing` 트림을 여기에 적용 (`omitEmpty`는 부모 전파 경로 전용)
- `node.validate()` / `node.errors`
- `node.subscribe()` — 노드 이벤트 구독 (cleanup 함수 반환). 구독 전에 전달된 이벤트는 재생되지 않음 — 상태 미러는 `useSchemaNodeSubscribe`의 `onSubscribe` catch-up 사용
- `node.revision(mask?)` — 전달된 이벤트 배치의 단조 리비전 (리스너 유무 무관 집계, 늦은 구독자의 갭 감지용; `useSchemaNodeTracker`가 useSyncExternalStore 스냅샷으로 사용)
- `virtualization` prop — 초대형 폼 렌더 가상화(지연 마운트). node tree는 전량 생성 유지, branch 자식 수 ≥ `threshold`면 `eagerCount` 이후 필드를 placeholder(`[data-path][data-deferred]` — identity는 `data-path`로 통일, 마커가 상태 구분)로 지연 → IO 교차·idle backfill·RequestFocus/Select 시 마운트(defer-once). 게이트는 `useChildNodeComponents`에서 bake, 조율은 `VirtualizationManager`(helpers/virtualization). placeholder 시각은 CSS `[data-deferred]` 셀렉터 또는 `Placeholder` 컴포넌트 옵션(공간 예약은 `estimateHeight` 소유, 컴포넌트는 시각 채움만). CSR 전용 — SSR 하이드레이션에서 켜지 말 것

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

Vitest uses three projects: `unit` runs TypeScript core tests in Node, `render`
runs React tests and DOM-dependent TypeScript tests in jsdom, and `storybook`
runs portable stories through addon-vitest in headless Chromium. Source globs
include `src/__legacy__/**`; architecture spike tests remain outside these
product projects. Run `yarn test --run --project <name>` to select a project.

- `src/__tests__/renderForm.tsx` remains the legacy Form regression harness.
  It observes both DOM (`data-path`, input values, deferred placeholders) and
  node state, with StrictMode, validators, caught errors, and user interactions.
- Existing render scenarios keep their location and assertions until the engine
  switch. Known legacy defects retain their explicit `it.fails` records.
- New shared scenarios belong to private `@aileron/schema-form-scenarios` as pure
  data. The package cannot import schema-form, including types; inject forms,
  handles, and adapters through structural contracts.
- Core scenario runners consume the shared families. New Form e2e runners belong
  to `src/__tests__/e2e/<family>.test.tsx`, with at most 15 cases per file.
  A scenario needing consumer-only spies or boundary assertions gets its own
  file. Shared screen steps run through `playScenario(scenario, element)`.
- The renderer registers its handle on the wrapper root or render container.
  `playScenario` searches the received element and descendants, so story and
  render contexts share the same call shape.
- Scenario stories render the current public Form entry, mirror the same data,
  and call `playScenario` from `play`; usage stories are documentation-only.
- Final observable behavior needs a render scenario; a core test alone does not
  verify DOM behavior. Harness skeleton tests and empty families claim no engine
  behavior coverage.

## Class Member Ordering (Domain-First)

Identity → Tree Structure → Value Management → Computed Properties → State → Validation → Events → Injection → Lifecycle → Constructor

## Key Hooks

- `useSchemaNodeTracker`, `useSchemaNodeSubscribe`, `useChildNodeComponentMap`, `useChildNodeErrors`, `useFormSubmit` (`useSchemaNode` 는 내부 전용, 공개 index 미노출)

## Key Type Utilities

- `InferValueType<Schema>`, `InferSchemaNode<Schema>`, `FormHandle<Schema, Value>` (모두 공개 index 노출 — README `TypeScript Support` 절이 문서화)
- `InferValueType` 은 `as const` 스키마에서만 의미 있음(없으면 `type` 이 `string` 으로 넓어져 `any`). `properties`/`items` 를 재귀하되 **모든 키를 optional** 로 내고 `Record<string, any>` 와 교차한다 — `computed.active` false·`options.omitEmpty` 가 런타임에 키를 제거하므로 required 표기는 지킬 수 없는 약속이고, 열린 타입이라야 `oneOf` 분기 키가 초과 속성으로 거부되지 않는다(`additionalProperties: false` 면 닫힘). 정확한 형태가 필요하면 `Form<Schema, Value>` / `FormHandle<Schema, Value>` 2번째 인자로 직접 주입할 것 — `defaultValue` 에 구체 객체를 넘기면 `Value` 가 그 리터럴에서 required 키로 추론돼 `FormHandle` 의 기본 `Value` 와 어긋나므로, ref 를 함께 쓸 때는 주입이 필수다
- nullable 스키마는 `type: [..., 'null']` 과 deprecated `nullable: true` 둘 다 값 타입에 `| null` 을 붙인다 — 런타임(`BranchStrategy`·`validateSchemaType`)이 null 을 허용하므로 타입도 같은 계약을 따른다

## Dependencies

`@winglet/common-utils`, `@winglet/json`, `@winglet/json-schema`, `@winglet/react-utils`, React 18-19 (peer)

## Build Output

`dist/index.cjs` + `dist/index.mjs` + `dist/index.d.ts` — ESM raw 577,590 B / minify gzip 80,390 B (측정: `architecture/verification/07-switch/performance.md`). 비압축 배포는 의도된 선택(최종 minify 는 소비자 번들러에 위임)
