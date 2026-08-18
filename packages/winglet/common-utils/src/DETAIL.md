# src contract

## Requirements

- `index.ts`는 하위 fractal·organ에서 이미 정의된 이름을 그대로 재수출한다 — 로컬 선언이나 이름 변경(별칭) 없이 그대로 전달한다.
- 재수출은 named export만 사용한다 — `export *` 와일드카드 재수출은 없다.
- 패키지 런타임 의존성은 0이다.

## API Contracts

- `index.ts`의 모든 export 문은 `export { A, B, ... } from '<모듈>'` 형태이며, 각 심볼 이름은 원본 모듈의 export 이름과 동일하다.
- 재수출 대상은 `constant`·`errors`·`libs`와 `utils` 하위 각 organ이다 — 개별 대상의 동작 계약은 해당 fractal 자신의 문서가 소유한다.

## Acceptance Criteria

### root-barrel-surface — 진입점 재수출 구조

- 모든 export 절은 이름 재수출(`export { ... } from ...`)이며 와일드카드 재수출은 없다.
- `index.ts`에는 로컬에서 선언되는 값·함수·클래스·타입이 없다 — 모든 심볼은 하위 모듈에서 그대로 전달된다.
- 재수출되는 이름은 원본 모듈의 export 이름과 항상 동일하다(별칭 없음).

## Last Updated

2026-08-18 — 최초 계약 작성
