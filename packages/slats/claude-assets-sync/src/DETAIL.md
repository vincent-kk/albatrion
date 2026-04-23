# claude-assets-sync Specification

## Requirements

- 컨슈머 패키지는 `claude-sync` bin(3줄 re-export 스텁)을 노출하여
  `package.json` 의 `claude.assetPath` 로 sibling 패키지를 발견하고
  `docs/claude/**` 를 사용자 선택 스코프(`user` / `project` / `local`)에 주입한다.
- `claude-sync` 는 `list` 와 `build-hashes` 하위 커맨드도 제공한다.
- 파일 단위 SHA-256 비교: 부재 시 복사, 일치 시 skip, 불일치 시 경고 후
  `--force` 요구 (Option A: 사용자 편집/버전 변경 구분 없음).
- TTY 에서 `--force`: `@inquirer/prompts.confirm` 으로 대화형 확인, 발산/고아
  파일 최대 3개 이름 노출; non-TTY: 발산/고아 리스트를 stderr 로 방출 후 진행.
- `--dry-run`: 쓰기 없이 플랜 출력.
- non-TTY + `--scope` 누락: exit 2 와 명시적 오류.
- `dist/claude-hashes.json` 는 빌드 타임에 `buildHashes` 가 생성; schema v1,
  `previousVersions: {}` 는 향후 Option A+ 를 위해 예약.

## API Contracts

- `runCli(argv, options?): Promise<void>` — 주 진입점. `RunCliOptions` = `{ version?, invokedFromBin? }`. discover → inject / list / build-hashes 구동.
- `discover(options?): Promise<ConsumerPackage[]>` — 상위 워크스페이스와 모든 조상 `node_modules` 를 탐색; `claude.assetPath` 선언 패키지 반환. `DiscoverOptions` = `{ cwd?, includeWorkspaces? }`.
- `injectDocs(opts: InjectOptions): Promise<InjectReport>` — 헤드리스 프로그래매틱 inject. Exit code: 0 성공/up-to-date/dry-run, 1 런타임 오류, 2 사용자/설정 오류.
- `readHashManifest(packageRoot): Promise<HashManifest>` — `packageRoot/dist/claude-hashes.json` 읽기.
- `computeNamespacePrefixes(manifest): string[]` — orphan scoping 을 위한 `skills/<name>/` prefix 파생.
- `resolveScope(scope, cwd?): ScopeResolution`
- `buildHashes(opts?): Promise<{ outPath, fileCount }>` — `./buildHashes` 서브패스 (Node ESM); 자기 실행 CLI 는 `claude-build-hashes` bin. `.omc/**`, `.DS_Store`, `*.log` 무시.

## Exported Types

- `RunCliOptions`, `ConsumerPackage`, `DiscoverOptions`
- `InjectOptions`, `InjectReport`
- `HashManifest`, `Scope`, `ScopeResolution`, `ClaudeConfig`, `PackageInfo`, `AssetType`

## Last Updated

2026-04-24
