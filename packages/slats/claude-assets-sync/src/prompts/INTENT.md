## Purpose

레거시 ink 기반 `src/components/inject/` 를 대체한 헤드리스 프롬프트 래퍼.
`@inquirer/prompts` 위에서 `selectScopeAsync` 와 `confirmForceAsync` 를 제공한다.

## Structure

- `selectScope.ts` — scope picker (user / project / local)
- `confirmForce.ts` — 발산/고아 파일 리스트를 포함한 Y/N 확인
- `index.ts` — 배럴 export

## Conventions

- 모든 프롬프트는 `@inquirer/prompts`(`select`, `confirm`) 사용 — ink 없음, react 없음
- 색상과 bold 강조는 프롬프트 메시지 또는 stderr 프리-프린트에 `picocolors` 를 직접 적용
- 파일 리스트 프리뷰와 설명 서문은 stderr 로 출력하여 프로그래매틱 stdout 과 충돌 방지
- 각 함수는 타입 프리미티브(`Scope` 또는 `boolean`)를 반환; 콜백 스타일, 공유 상태 없음

## Boundaries

### Always do

- 프롬프트는 UI 전용: fs, network, 비즈니스 로직 없음
- stderr 는 컨텍스트 프리뷰 용도, stdout 은 프롬프트 라이브러리 자체에만 사용
- 사용자 중요 메시지에는 `picocolors`(bold, red, cyan, dim) 적용으로 가시성 유지

### Ask first

- 새 프롬프트 추가: `src/commands/` 에서만 호출되고 `src/core/**` 에서 도달하지 않는지 확인
- `@inquirer/prompts` 이외 백엔드로 전환: `docs/bundle-size-decision.md` 의 Phase 0 번들 크기 게이트 재실행 필요

### Never do

- `src/core/**` 에서 import
- 프롬프트 라이브러리 예외를 삼킴; 호출자가 취소(`ExitPromptError`) 를 처리할 수 있도록 전파

## Dependencies

- `@inquirer/prompts` (런타임)
- `picocolors` (런타임)
- `../core/scope/` (`Scope` type-only import)
