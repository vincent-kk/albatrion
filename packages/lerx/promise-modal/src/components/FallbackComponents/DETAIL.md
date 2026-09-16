# FallbackComponents

## Requirements

사용자 컴포넌트가 없을 때 기본 모달 UI를 제공합니다.

## API Contracts

- 각 fallback은 공통 props 계약을 사용하고 독립적으로 교체할 수 있어야 합니다.
- 스타일은 모달의 스코프된 클래스 체계를 따르며 별도 UI 라이브러리를 요구하지 않습니다.

## Acceptance Criteria

### fallback-components-contract — 관찰 가능한 동작

- 한 부분의 사용자 컴포넌트 교체가 나머지 fallback 사용을 막지 않습니다.
- 기본 UI에 모달 Promise 완료 정책이나 다른 비즈니스 로직을 새로 포함하지 않습니다.

## Last Updated

2026-09-16
