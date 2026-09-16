# core

## Requirements

모달 요청과 타입별 완료 결과를 React 표현 계층과 분리합니다.

## API Contracts

- 핸들러는 매니저의 open 경로를 통해 요청하며 노드 팩토리는 모달 타입에 맞는 구현을 선택합니다.
- 노드는 공통 구독·완료 생명주기를 따르고 core는 React 컴포넌트를 직접 렌더하지 않습니다.

## Acceptance Criteria

### core-contract — 관찰 가능한 동작

- 각 공개 요청은 대응하는 노드 타입의 Promise 결과 의미를 유지합니다.
- 매니저를 우회한 별도 모달 열기 경로를 만들지 않습니다.

## Last Updated

2026-09-16
