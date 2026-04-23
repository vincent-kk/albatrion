# CLAUDE.md

`@canard/schema-form` — JSON Schema 기반 React 폼 라이브러리. 노드 트리 기반 상태 관리, 플러그인 시스템, 비동기 검증 지원.

## Commands

```bash
yarn build             # ESM + CJS 빌드 + 타입 선언 + claude-hashes.json
yarn build:types       # 타입 선언만
yarn build:hashes      # docs/claude/** 해시 매니페스트만 재생성
yarn test              # Vitest 테스트 (352개)
yarn test --coverage   # 커버리지 포함
yarn lint              # ESLint
yarn storybook         # Storybook dev (port 6006)
yarn size-limit        # 번들 크기 확인 (CJS/ESM 각 20KB 제한)
```

## Claude Docs Injector

`docs/claude/` 의 자산(rules/skills)을 사용자 환경의 `.claude` 디렉터리로 주입하는 얇은 CLI 스텁이 번들됩니다. 실제 주입 로직은 `@slats/claude-assets-sync` 가 제공하고, 이 패키지의 bin 은 자신의 `package.json` 을 파싱해 라이브러리에 메타데이터를 전달합니다.

```bash
npx claude-sync --scope=user                 # ~/.claude
npx claude-sync --scope=project              # cwd 에서 위로 탐색해 첫 기존 .claude (없으면 cwd/.claude)
npx claude-sync --scope=local                # 동일 규칙, gitignored 영역
npx claude-sync --scope=user --dry-run       # 미리보기
npx claude-sync --scope=user --force         # 수정 덮어쓰기 (TTY 확인 프롬프트)

# transitive-dep 환경에서도 호출
npx -p @canard/schema-form claude-sync --scope=user
```

> `--scope=project` 와 `--scope=local` 은 터미널 `process.cwd()` 에서 상위로 거슬러 올라가며 처음 만나는 기존 `.claude` 를 타겟으로 재사용합니다. 로그에 `(auto-located)` 가 찍히면 그 경로가 재사용된 것입니다.
>
> `@slats/claude-assets-sync` 는 호출한 패키지 하나에만 주입합니다. 다른 패키지 자산을 주입하려면 그 패키지의 고유 bin (`npx -p <pkg> claude-sync`) 을 사용하세요.

구조:
- `bin/claude-sync.mjs` — 자기 `package.json` 을 파싱해 `runCli` 에 `{ packageRoot, packageName, packageVersion, assetPath }` 전달
- `scripts/build-hashes.mjs` — `yarn build` 체인에서 `dist/claude-hashes.json` 생성 (동일한 패턴으로 `buildHashes` 호출)
- `docs/claude/` — 주입 대상 자산 (사람이 저작, publish tarball 포함)
- `claude.assetPath: "docs/claude"` — 소비자 측 convention; 라이브러리는 이 필드 이름을 모르며 bin 스텁이 읽어서 전달함

### Isolation Guardrails

- `src/**` 는 `bin/**`, `docs/**`, `@slats/claude-assets-sync` 어느 것도 import 금지. `.dependency-cruiser.cjs` 3룰 + `sideEffects: false` + import 그래프 단절로 3중 방어.
- **절대 `exports` 에 `./bin/*` 를 추가하지 말 것.** subpath 미노출로 consumer 번들러가 실수로 CLI 자산을 끌어들이는 경로를 원천 차단.
- `yarn depcheck` 로 CI 에서 격리 회귀 확인.


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
