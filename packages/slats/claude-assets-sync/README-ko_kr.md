# @slats/claude-assets-sync

임의의 npm 패키지가 자신의 Claude Code 문서(skills, rules, commands)를 배포하고, 얇은 `claude-sync` bin 스텁을 통해 사용자의 `.claude/` 디렉토리에 주입할 수 있게 해주는 공용 CLI 엔진입니다.

## 개요

컨슈머 패키지는 자신의 `package.json` 을 읽어 `runCli(argv, { packageRoot, packageName, packageVersion, assetPath })` 를 호출하는 얇은 `bin/claude-sync.mjs` 스텁을 배포합니다. 사용자는 `npx claude-sync` (또는 컨슈머 고유의 bin 별칭)를 실행하고, 이 엔진은 파일별 SHA-256 매니페스트를 대상 `.claude/` 와 비교하여 변경이 필요한 파일만 복사합니다. 라이브러리는 호출 1회당 정확히 1개의 컨슈머만 처리합니다 — 호출자가 명시적으로 전달한 그 컨슈머입니다. `node_modules` 나 yarn workspace 를 탐색하지 않습니다.

GitHub fetch 없음, `.sync-meta.json` 없음, 마이그레이션 없음 — 컨슈머의 `dist/claude-hashes.json` 이 유일한 진실의 원천입니다.

## 설치

```bash
npm install -D @slats/claude-assets-sync
# or
yarn add -D @slats/claude-assets-sync
```

## CLI 표면

```
claude-sync [--scope=user|project] [--dry-run] [--force]
```

각 컨슈머 패키지는 자신의 `claude-sync` bin 엔트리를 노출합니다 (아래 [컨슈머 통합](#컨슈머-통합-3단계) 참조). 호출 시 엔진은 스텁이 전달한 메타데이터가 가리키는 컨슈머 1개만 처리합니다. 교차 패키지 탐색은 없습니다.

| 플래그 | 의미 |
|---|---|
| `--scope=user` | `~/.claude` (모든 프로젝트에 전역 적용) |
| `--scope=project` | 가장 가까운 조상 `.claude` 디렉토리, 없으면 `<cwd>/.claude` |
| `--dry-run` | copy / skip / warn 플랜만 출력, 쓰기 없음 |
| `--force` | 발산 파일 덮어쓰기 & 고아 파일 삭제 (TTY 에서는 대화형 확인) |

**Exit code**: `0` 성공 / up-to-date / dry-run, `1` 런타임 오류, `2` 사용자 / 설정 오류 (예: 비-TTY 환경에서 `--scope` 누락, 잘못된 `assetPath`).

`--scope=project` 의 경우 대상 `.claude` 디렉토리는 `process.cwd()` 에서 위로 올라가며 가장 가까운 기존 `.claude` 조상을 찾아 해석됩니다. 자동 탐지된 경우 CLI 가 `(auto-located)` 로 로그에 표시합니다.

## 컨슈머 통합 (3단계)

### 1. `package.json`

```jsonc
{
  "name": "@your-scope/your-package",
  "bin": { "claude-sync": "./bin/claude-sync.mjs" },
  "files": ["dist", "docs", "dist/claude-hashes.json", "bin", "README.md"],
  "scripts": {
    "build": "… && yarn build:hashes",
    "build:hashes": "node scripts/build-hashes.mjs"
  },
  "dependencies": {
    "@slats/claude-assets-sync": "workspace:^"
  },
  "claude": { "assetPath": "docs/claude" }
}
```

`exports` 에 `./bin/*` 를 **절대** 노출하지 마세요 — 컨슈머 번들러가 CLI 코드를 앱 번들로 끌어올 수 있습니다.

### 2. `bin/claude-sync.mjs`

```javascript
#!/usr/bin/env node
import { runCli } from '@slats/claude-assets-sync';
import { readFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const packageRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const pkg = JSON.parse(
  await readFile(resolve(packageRoot, 'package.json'), 'utf-8'),
);

if (typeof pkg.claude?.assetPath !== 'string') {
  process.stderr.write(
    `[claude-sync] missing or invalid "claude.assetPath" in ${resolve(packageRoot, 'package.json')}\n`,
  );
  process.exit(2);
}

await runCli(process.argv, {
  packageRoot,
  packageName: pkg.name,
  packageVersion: pkg.version,
  assetPath: pkg.claude.assetPath,
}).catch((err) => {
  process.stderr.write(
    `[${pkg.name}] claude-sync failed: ${err instanceof Error ? err.message : String(err)}\n`,
  );
  process.exit(1);
});
```

컨슈머의 `package.json` 의 `claude.assetPath` 필드는 **컨슈머 측 컨벤션** 입니다. 라이브러리가 강제하거나 읽지 않습니다. 컨슈머는 원하는 방식으로 `assetPath` 를 해석하고 그 결과를 `runCli` 에 전달할 수 있습니다.

### 3. `scripts/build-hashes.mjs`

```javascript
#!/usr/bin/env node
import { buildHashes } from '@slats/claude-assets-sync/buildHashes';

try {
  const { outPath, fileCount } = await buildHashes();
  console.log(`✓ claude-hashes.json written: ${fileCount} file(s) → ${outPath}`);
} catch (err) {
  console.error('❌ buildHashes failed:', err?.message ?? err);
  process.exit(1);
}
```

`buildHashes` 는 현재 `package.json` 의 `claude.assetPath` 를 읽고, 그 하위의 모든 파일을 해싱 (`.omc/**`, `*.log`, `.DS_Store` 제외)하여 `dist/claude-hashes.json` 에 기록합니다.

## `docs/claude/` 작성

어떤 트리 구조든 동작하지만, Claude Code 컨벤션에 맞춘 권장 레이아웃은 다음과 같습니다:

```
docs/claude/
├── skills/
│   └── <skill-name>/
│       ├── SKILL.md
│       └── knowledge/...
├── rules/...
└── commands/...
```

asset 루트 하위의 모든 파일은 해시되어 `dist/claude-hashes.json` 에 추적됩니다.

## 해시 기반 동기화 전략 (Option A)

- `dist/claude-hashes.json` (schema v1) 이 유일한 진실의 원천.
- 파일별 SHA-256 비교:
  - **로컬에 없음** → 복사
  - **해시 일치** → 건너뜀
  - **해시 불일치** → 경고 + `--force` 요구 (설계상 사용자 편집 vs 원본 업데이트를 구분하지 않음)
  - **매니페스트 밖이지만 관리 대상 prefix(`skills/<name>/`) 하위에 있는 파일** → 고아; 삭제하려면 `--force` 필요

- TTY 에서의 `--force`: `@inquirer/prompts.confirm` 으로 대화형 확인, 발산/고아 경로 최대 3개 표시.
- 비-TTY 에서의 `--force`: 발산 목록을 stderr 로 출력한 뒤 진행.

## 프로그래매틱 API

```ts
import {
  runCli,
  injectDocs,
  readHashManifest,
  resolveScope,
  isInteractive,
  isValidScope,
  computeNamespacePrefixes,
} from '@slats/claude-assets-sync';
```

전체 export 범위는 `src/index.ts` 와 `src/DETAIL.md` 를 참조하세요.

## 추가 문서

- `docs/consumer-integration.md` — 컨슈머 체크리스트 전체 (dep-cruiser 규칙, 검증 단계, 최종 사용자 설치 토폴로지)
- `docs/bundle-size-decision.md` — 왜 ink 대신 `@inquirer/prompts` 를 선택했는가

## 라이선스

MIT — [LICENSE](./LICENSE) 참조.
