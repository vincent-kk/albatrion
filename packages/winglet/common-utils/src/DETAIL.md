# src contract

## Requirements

- `index.ts`는 하위 fractal·organ에서 이미 정의된 이름을 그대로 재수출한다 — 로컬 선언이나 이름 변경(별칭) 없이 그대로 전달한다.
- 재수출은 named export만 사용한다 — `export *` 와일드카드 재수출은 없다.
- 패키지 런타임 의존성은 0이다.

## API Contracts

- `index.ts`는 값에는 `export { ... } from`, 타입 전용 심볼에는 `export type { ... } from` 형태의 이름 재수출을 사용한다. 어느 경우에도 심볼 이름은 원본 모듈의 export 이름과 동일하다.
- 재수출 대상의 동작 계약은 해당 소유 모듈이 책임진다. 루트 계약은 이름과 공개 경계의 일관성만 다룬다.

## Acceptance Criteria

### root-barrel-surface — 진입점 재수출 구조

- 모든 export 절은 값 또는 타입 전용 이름 재수출이며 와일드카드 재수출은 없다.
- `index.ts`에는 로컬에서 선언되는 값·함수·클래스·타입이 없다 — 모든 심볼은 하위 모듈에서 그대로 전달된다.
- 재수출되는 이름은 원본 모듈의 export 이름과 항상 동일하다(별칭 없음).

## History

- 2026-09-19 — 0.16.0: object 경계에서 종료한 범용 serializer 네 개의 루트 재수출도 함께 제거했다(breaking).

## Last Updated

2026-09-27 — 타입 전용 이름 재수출도 허용하도록 현재 경계 명시
