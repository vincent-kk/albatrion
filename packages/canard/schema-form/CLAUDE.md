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

- **런타임 클래스는 `FieldNode` 하나** (`src/core/surface/runtime/FieldNode.ts`). 종류별 노드는 클래스가 아니라 `type`으로 가르는 공개 판별 합집합 형이다(`src/core/surface/type.ts`).
- **Terminal**: `StringNode`, `NumberNode`, `BooleanNode`, `NullNode`, `UnionNode`(여러 종류를 담은 `type`)
- **Branch**: `ObjectNode`, `ArrayNode`, `VirtualNode`(`options.virtual`로 묶은 형제 필드). `object`·`array`는 `options.terminal: true`면 terminal이 된다. 판정은 스키마에서 한 번 정하고 실행 중 바뀌지 않는다.
- **판별**: `isStringNode` 등 가드와 `node.strategy`(`'branch'` | `'terminal'`)로 가른다.
- 노드 생성: `<Form>`이 `jsonSchema`·`defaultValue`로 트리를 만들고 마운트한다. 외부 접근은 `FormHandle.node`·`findNode`·`findNodes`, `children` 함수의 `node`, FieldInput의 `node` prop. 트리를 직접 만드는 통로는 공개하지 않는다(시험·벤치는 `src/__tests__/fixtures/nodeFromJSONSchema.ts`를 쓴다).

### Plugin System (`src/app/plugin/`)

- Validator 플러그인: AJV7/AJV8 등 JSON Schema 검증
- UI 컴포넌트 플러그인: `FieldRenderer`, `FormLabelRenderer`, `FormInputRenderer`, `FormErrorRenderer`
- FieldInput 플러그인: 커스텀 입력 컴포넌트

### Error Isolation (user-injected render surfaces)

사용자 주입 컴포넌트(FieldRenderer/FieldInput, virtualization `Placeholder` 등)는 반드시 오류 경계로 격리한다 — 하나가 렌더 중 throw해도 폼 전체가 아니라 그 서브트리만 fallback으로 격리된다. 경계는 **컴포넌트를 해석·소유하는 지점에서 1회**만 둔다: 렌더러는 `FieldProxy`가 `@winglet/react-utils/hoc`의 `ErrorBoundary`를 직접 쓰고(children이 렌더마다 새 엘리먼트라 memo로 감싸지 않음), 입력은 `fieldInputDefinition`의 사설 어댑터가 해석 지점에서 `ErrorBoundary`를 한 번 적용하며, `Placeholder`는 `VirtualizationManager` 생성자가 form당 1회 `withErrorBoundary`로 래핑해 모든 지연 필드가 동일 인스턴스를 공유한다. 소비처(개별 렌더 위치)마다 반복 래핑하지 말 것. (`helpers/virtualization`는 이 `Placeholder` 방어만 React 예외로 허용 — INTENT.md 참조.)

### Key APIs

- `Form` — 메인 진입점
- `Form.Render` — JSONPointer 경로로 커스텀 레이아웃
- `registerPlugin()` — 플러그인 전역 등록 (렌더 전 필수)
- `node.find('/path')` — JSONPointer 노드 탐색 (`..` 부모, `*` 와일드카드는 제한적 사용)
- `node.value` / `node.enhancedValue` (가상 필드 포함)
- `node.outputValue` — 스키마 옵션으로 정제된 값. `FormHandle.getValue`/`submit`/루트 방출/부모측 hydration 스냅샷이 이 값을 읽으며, `ArrayNode`는 `options.omitTrailing` 트림을 여기에 적용 (`omitEmpty`는 부모 전파 경로 전용)
- `node.validate()` / `node.errors`
- `node.subscribe()` — 노드 이벤트 구독 (cleanup 함수 반환). 구독 전에 전달된 이벤트는 재생되지 않음 — 상태 미러는 `useFieldNodeSubscribe`의 `onSubscribe` catch-up 사용
- `node.revision(mask?)` — 전달된 이벤트 배치의 단조 리비전 (리스너 유무 무관 집계, 늦은 구독자의 갭 감지용; `useFieldNodeTracker`가 useSyncExternalStore 스냅샷으로 사용)
- `virtualization` prop — deferred mounting for large forms. The node tree stays complete; branches at `threshold` defer children beyond `eagerCount` behind `[data-path][data-deferred]` placeholders until intersection, idle backfill, or Focus/Select reveals them once. `useChildFields` bakes gates and `VirtualizationManager` coordinates them. Style placeholders with `[data-deferred]` CSS or `Placeholder`; `estimateHeight` owns reserved space. SSR renders every field and hydrates unchanged; only branches and children added after hydration are gated. A dehydrated Suspense boundary inside a custom branch input may still switch to client rendering in React 18.

### FieldInput 우선순위 (높음 → 낮음)

1. 스키마 `presentation.FieldInput` 직접 지정
2. `fieldInputMap` 경로 매핑
3. Form 레벨 `fieldInputDefinitions`
4. Provider `fieldInputDefinitions`
5. 플러그인 제공 정의

### Controls (조건·파생 속성)

```typescript
controls: {
  visible: '../category === "premium"',
  readOnly: '../locked === true',
  watch: ['../category'],   // 명시적 의존성
}
```

The closed key list is defined by `CONTROL_KEYS` in `src/core/engine/blueprint/buildNodes/utils/declarations/validateControlGroups.ts`: active, visible, readOnly, disabled, default, derived, unsetValue, resetInteraction, unsetOnInactive, inactiveValue, fields, injectTo, discriminator, watch. Unknown keys raise `UNKNOWN_GROUP_KEY`. Fields and fragment controls accept the first ten keys; `inactiveValue` is a literal or synchronous resolver and is never compiled as an expression.
값의 형과 예는 `docs/en/SPECIFICATION.md`의 controls 절을 기준으로 한다.

### Validation Modes

`OnChange` | `OnRequest` | `None`

## Fractal Contracts in This Package

Applies the root `Module Contract Principles` to this package.

- `src/index.ts` is the only public surface (`exports` has `"."` alone) and lists every export by name. Docs, README and agent skills show only names reachable from it. Adding a name is a contract change: enumerate the built `dist/index.d.ts` and compare before merging.
- Standard fractal shape: the root holds `INTENT.md`, `DETAIL.md`, `index.ts` and at most one implementation file named after the fractal (`components/Form/Form.tsx`). Child fractals sit under a role compartment (`components/Form/components/FormCore/`, `components/FieldProxy/components/FieldInputSlot/`), each with `index.ts`, its documents, and its own `components/`·`utils/` for helpers only it uses. Types live in a `types/` compartment split by concern (`src/core/engine/record/types/`), not in a root `type.ts`. Compartments are organs: no `index.ts` inside them, files are imported directly (`src/constants/bitmask`, not `src/constants`). Inside one organ, entry functions follow their siblings' shape: all files or all directories, never a mix.
- A fractal named after a role (`hooks`, `types`) keeps its files in topic compartments, never in a compartment that repeats the role name (`src/hooks/fieldNode/`·`src/hooks/form/`, `src/types/schema/`·`field/`·`error/`·`rolled/`; never `hooks/hooks/` or `types/types/`). Helpers extracted from a function go into a topic compartment beside their siblings, not into a directory named after the function with its own `utils/` (no `analyze/populateNodeChildren/utils/`). `src/hooks` stays a fractal because it composes `core`, `providers` and `components`; an organ may not import its owner's child fractals (model B1, guarded by `src/__tests__/importModel.test.ts`).
- Tests live in each fractal's `__tests__/` and import that fractal's internal files directly (`../runtime/FieldNode`, not `..` or `@/schema-form/core`). A test that needs another fractal's internals moves into that fractal; a fixture shared by two fractals sits in the `__tests__/fixtures/` of their lowest common fractal. `src/__tests__/e2e`, `scenarios` and `migration` are external consumers and import the root `index.ts`. A parent-level test that must reach a child fractal's internals (for example through `vi.mock`) is declared in the parent's `DETAIL.md` (see `src/core/engine/DETAIL.md`).
- Benchmarks live inside the nearest fractal's `__benchmarks__/` and import internals directly. The standalone legacy-comparison scripts in `bench/legacy-compare/` read internals under a scoped `.filid/config.json` exemption; `bench/` and `stories/` are ignored by filid, so reviewers check those imports by hand. A bench never justifies adding a name to an `index.ts`.
- Error codes come from one place: `FormErrorCode` and `FormWarningCode` (`src/errors/`), exported from the root. Product code emits codes through these constants, never as string literals.
- `src/__legacy__` is frozen and is deleted in stage 09. Do not extend it, and do not count its imports as consumers.

## Render-Level Test Harness (`src/__tests__/`)

Vitest uses five projects: `unit` runs TypeScript core tests in Node, `render`
runs React tests and DOM-dependent TypeScript tests in jsdom, and `storybook`
runs portable stories through addon-vitest in headless Chromium, `react18` repeats the render project on React 18, and `production` checks the built bundles. Source globs
include `src/__legacy__/**`; architecture spike tests remain outside these
product projects. Run `yarn test --run --project <name>` to select a project.
The dedicated `verify-unit` and `verify-render` bundle runs shadow wheel, verify table, and derive shadow checks via `yarn workspace @canard/schema-form test:verify --run`; default `unit`, `render`, and `react18` projects exercise the shipped skip/table configuration with derive shadow disabled.

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
  and call `playScenario` from `play`; usage stories may assert their own readouts (the handle call log and what the story itself renders); behavior contracts stay in shared scenarios.
- Final observable behavior needs a render scenario; a core test alone does not
  verify DOM behavior. Harness skeleton tests and empty families claim no engine
  behavior coverage.

## Class Member Ordering (Domain-First)

Identity → Tree Structure → Value Management → Computed Properties → State → Validation → Events → Injection → Lifecycle → Constructor

## Key Hooks

- `useFieldNodeTracker`, `useFieldNodeSubscribe`, `useChildFieldMap`, `useChildFieldErrors`, `useFormSubmit` (`useFieldNode` 는 내부 전용, 공개 index 미노출)

## Key Type Utilities

- `InferValueType<Schema>`, `InferFieldNode<Schema>`, `FormHandle<Schema, Value>` (모두 공개 index 노출 — README `TypeScript Support` 절이 문서화)
- `InferValueType` 은 `as const` 스키마에서만 의미 있음(없으면 `type` 이 `string` 으로 넓어져 `any`). `properties`/`items` 를 재귀하되 **모든 키를 optional** 로 내고 `Record<string, any>` 와 교차한다 — `controls.active` false·`options.omitEmpty` 가 런타임에 키를 제거하므로 required 표기는 지킬 수 없는 약속이고, 열린 타입이라야 `oneOf` 분기 키가 초과 속성으로 거부되지 않는다(`additionalProperties: false` 면 닫힘). 정확한 형태가 필요하면 `Form<Schema, Value>` / `FormHandle<Schema, Value>` 2번째 인자로 직접 주입할 것 — `defaultValue` 에 구체 객체를 넘기면 `Value` 가 그 리터럴에서 required 키로 추론돼 `FormHandle` 의 기본 `Value` 와 어긋나므로, ref 를 함께 쓸 때는 주입이 필수다
- nullable 스키마는 `type: [..., 'null']` 과 `nullable: true` 둘 다 값 타입에 `| null` 을 붙인다 — 런타임(`BranchStrategy`·`validateSchemaType`)이 null 을 허용하므로 타입도 같은 계약을 따른다. `nullable: true` 는 공식 지원 표기로 `type` 배열에 `'null'` 을 더한 것과 같으며 오류·경고가 없다

## Dependencies

`@winglet/common-utils`, `@winglet/json`, `@winglet/json-schema`, `@winglet/react-utils`, React 18-19 (peer)

## Build Output

Runtime bundles are `dist/index.mjs`, `dist/index.node.mjs`, and `dist/index.cjs`; declarations remain in `dist/index.d.ts`. The `node` export condition selects `index.node.mjs` for imports and `index.cjs` for require. Both Node outputs read `NODE_ENV` once at load and retain that decision after later environment changes. The default ESM keeps call-site comparisons. All runtime outputs intentionally remain unminified so consumer bundlers perform final minification.
