# FallbackComponents

## Requirements

사용자 렌더러가 없어도 기본 HTML로 입력과 오류를 표시할 수 있어야 합니다.

## API Contracts

- 그룹 렌더러는 루트에서 Input만 렌더하고, 하위에서는 노드 그룹에 맞는 래퍼를 제공합니다.
- 입력 컴포넌트의 동작은 전달받은 Input에 위임하며, 배열 항목의 레이블은 숨깁니다.

## Acceptance Criteria

### fallback-components-contract — 관찰 가능한 동작

- 루트 렌더링에 불필요한 그룹 래퍼가 추가되지 않습니다.
- 기본 렌더러는 플러그인 등록이나 자체 폼 상태 없이 전달된 props만으로 동작합니다.

## Last Updated

2026-09-16
