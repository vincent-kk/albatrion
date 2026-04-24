# inject

## Purpose

단일 컨슈머의 docs 주입을 오케스트레이션한다: 해시 매니페스트 읽기, 스코프
타겟 계산, 플랜 빌드, `--force` / non-TTY 정책 처리, 제한된 동시성 풀에서
결과 `Action[]` 적용.

## Structure

- `index.ts` — 배럴 export
- `injectDocs.ts` — 헤드리스 프로그래매틱 진입점 (`injectDocs(opts)`)
- `types.ts` — `InjectOptions`, `InjectReport`
- `utils/applyAction.ts` — 액션별 파일시스템 변경
- `utils/printPlan.ts` — 플랜 → 로거 트랜스크립트
- `utils/emitCiForceList.ts` — non-TTY `--force` 의 stderr 리스팅
- `utils/summarize.ts` — 플랜 → `InjectReport` 집계

## Boundaries

### Always do

- `confirmForce` 는 상호작용 모드(`isInteractive()` true)에서만 호출
- 모든 경로에서 올바른 `exitCode`(0 / 1 / 2)를 가진 `InjectReport` 반환

### Ask first

- 8-worker `asyncPool` 동시성 제한 변경
- `applyAction.kind` 커버리지를 `copy` / `delete` 이외로 확장

### Never do

- `prompts/` 또는 `commands/` 에서 import; 콜백은 `opts.confirmForce` 로 유입
- 레거시 `.sync-meta.json` 읽기/쓰기 재도입
