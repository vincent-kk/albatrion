# core

## Purpose

Claude docs 주입용 헤드리스·UI 없는 엔진. 5개 leaf fractal(`hash`,
`hashManifest`, `scope`, `injectPlan`, `inject`)을 구성하며, `commands/`
레이어가 이를 구동한다. 이 트리의 모든 런타임 사이드 이펙트는 이 리프들에서
종료된다.

## Structure

- `INTENT.md`, `DETAIL.md`
- `index.ts` — 모든 public 심볼을 재-export 하는 집계 배럴
- `hash/` — SHA-256 콘텐츠 프리미티브
- `hashManifest/` — `dist/claude-hashes.json` IO + 네임스페이스 prefix
- `scope/` — `user | project` → 타겟 경로 해석
- `buildPlan/` — 플랜 빌더 (copy / skip / diverged / orphan / delete)
- `injectDocs/` — 동시성 풀로 플랜을 적용하는 오케스트레이터 (`injectDocs`)

## Boundaries

### Always do

- 각 sub-fractal 은 자신의 `index.ts` 배럴을 통해서만 도달 가능하도록 유지
- exit code 를 `InjectReport.exitCode`(0 / 1 / 2)로 전파

### Ask first

- 기존 5개 외에 새로운 sub-fractal 추가
- `commands/` 와 루트 배럴이 현재 소비하는 범위 이상으로 `core/` 공개 API 확장

### Never do

- 이 트리 전역에서 `commands/` 또는 `prompts/` 로부터 import
- `core/` 에서 TTY 프롬프트 수행 — 콜백은 `injectDocs` 로만 유입
- GitHub 페치, `.sync-meta.json`, 그 외 레거시 동기화 상태 재도입
