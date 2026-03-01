# claude-assets-sync Specification

## Requirements

- npm 패키지의 Claude 에셋(commands, skills)을 GitHub API를 통해 로컬로 동기화
- 대화형 CLI로 에셋 추가/제거/목록/상태 확인 지원
- 버전 기반 스킵 및 --force, --dry-run 옵션 지원
- 레거시 nested 구조에서 flat 구조로 마이그레이션 지원

## API Contracts

- `syncPackage(pkg, options): Promise<SyncResult>` — 단일 패키지 에셋 동기화
- `syncPackages(packages, options): Promise<SyncResult[]>` — 복수 패키지 동기화
- `createProgram(): Command` — Commander.js 프로그램 인스턴스 생성
- `run(): Promise<void>` — CLI 실행 엔트리
- `migrateToFlat(dir): Promise<MigrationResult>` — flat 구조 마이그레이션
- `needsMigration(dir): Promise<boolean>` — 마이그레이션 필요 여부 확인

## Exported Types

- `AssetType`, `CliOptions`, `ClaudeConfig`, `GitHubRepoInfo`
- `PackageInfo`, `SyncMeta`, `SyncResult`, `UnifiedSyncMeta`
- `PackageSyncInfo`, `FileMapping`, `MigrationResult`

## Last Updated

2026-03-02
