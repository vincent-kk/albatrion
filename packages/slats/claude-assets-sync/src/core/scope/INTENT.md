# scope

## Purpose

`user | project | local` 스코프 토큰을 절대 경로 타겟 디렉토리(`targetRoot`)와
사용자 대상 메타데이터로 변환한다. `project` / `local` 은 `cwd` 에서 위로 올라가며
가장 가까운 기존 `.claude` 조상을 재사용한다.

## Structure

- `index.ts` — 배럴 export
- `scope.ts` — 4개의 peer export (`resolveScope`, `isValidScope`, `isInteractive`, `findNearestDotClaudeAncestor`) + 타입
- `utils/isDirectory.ts` — 동기 stat 기반 디렉토리 체크 (유일한 헬퍼)

## Boundaries

### Always do

- 조상 `.claude` 를 재사용할 때 설명에 `auto-located` 마커 부착
- `isInteractive` 는 `stdin.isTTY && stdout.isTTY` 공식 고정

### Ask first

- `user | project | local` 이외의 스코프 추가
- walk-up 정책 변경 (예: repo 루트에서 중단, `.git` 경계 존중)

### Never do

- `injectDocs/`, `buildPlan/`, `commands/`, `prompts/` 에서 import
- 네트워크 혹은 비동기 IO 사용; scope 는 동기·결정론적
