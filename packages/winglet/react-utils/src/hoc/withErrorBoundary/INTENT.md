# withErrorBoundary — 오류 경계 HOC

## Purpose

하위 컴포넌트 트리의 렌더링 오류를 잡아 fallback UI로 대체하는 HOC 두 종 — 일반형과 ref 전달 보존형(forwardRef) — 을 소유한다. 오류 격리의 공개 표면은 HOC뿐이며, 클래스 기반 오류 경계 구현과 기본 fallback UI는 내부 organ에 감춘다.

## Conventions

- 공개 표면은 entry point가 이름으로 재수출하는 HOC 2종뿐이다. 내부 컴포넌트는 organ에 두고 entry에 노출하지 않는다.
- fallback 계약: `undefined`일 때만 기본 메시지로 대체한다 — `null`은 "아무것도 렌더하지 않음"으로 존중한다. 두 HOC의 fallback 의미론은 동일하다.

## Boundaries

### Always do

- 포착한 오류는 `console.error`로 로깅한다 — 로깅 옵션을 추가하더라도 기본 로깅은 유지
- fallback 의미론 변경은 DETAIL.md를 먼저 갱신

### Ask first

- HOC 시그니처 확장(fallback 이외의 옵션 추가)
- 내부 오류 경계 컴포넌트의 공개 표면 승격

### Never do

- 원본 컴포넌트의 props/ref 전달을 변형하는 로직 추가
- 오류를 삼키고 fallback 없이 렌더를 계속하는 경로 추가
