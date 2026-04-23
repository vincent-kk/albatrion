# CLAUDE.md

`@lerx/promise-modal` — Promise 기반 React 모달 유틸리티. `alert`, `confirm`, `prompt`를 React 컴포넌트 내외부에서 모두 사용 가능.

## Commands

```bash
yarn build             # ESM + CJS 빌드 + 타입 선언
yarn test              # Vitest 테스트 (jsdom)
yarn lint              # ESLint
yarn storybook         # Storybook dev (port 6006)
yarn size-limit        # 번들 크기 확인
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
npx -p @lerx/promise-modal claude-sync --scope=user
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

- `src/**` 는 `bin/**`, `docs/**`, `@slats/claude-assets-sync` 어느 것도 import 금지.
- **절대 `exports` 에 `./bin/*` 를 추가하지 말 것.** subpath 미노출로 consumer 번들러가 실수로 CLI 자산을 끌어들이는 경로를 원천 차단.

## Architecture

```
src/
├── index.ts                      # Public API
├── core/handle/                  # alert / confirm / prompt 함수
├── core/node/                    # AbstractNode, AlertNode, ConfirmNode, PromptNode
├── app/ModalManager.ts           # 싱글톤 — 모달 생명주기, DOM 앵커, 스타일 주입
├── bootstrap/BootstrapProvider/  # ModalProvider 컴포넌트
├── providers/                    # Context 분리 (설정, 모달 관리, 사용자 데이터)
└── components/                   # Anchor, Background, Foreground 등 UI
```

## Key Design
- **Promise API**: 모달 함수가 Promise 반환 → 사용자 인터랙션으로 resolve
- **Singleton**: `ModalManager`가 전역 상태 관리
- **Styling**: `@winglet/style-utils`로 런타임 CSS 주입 (polynomial hashing 스코핑)

## Dependencies
`@winglet/common-utils`, `@winglet/react-utils`, `@winglet/style-utils`, React 18-19 (peer)
