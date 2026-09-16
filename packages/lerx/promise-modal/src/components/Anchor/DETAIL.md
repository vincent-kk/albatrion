# Anchor

## Requirements

모달 렌더링의 앵커 영역을 매니저가 소유한 DOM 배치와 연결합니다.

## API Contracts

- 앵커의 스타일과 backdrop 표현은 현재 모달 상태 및 설정을 반영합니다.
- DOM 앵커 생성과 전역 배치는 매니저·부트스트랩의 책임으로 유지합니다.

## Acceptance Criteria

### anchor-contract — 관찰 가능한 동작

- 앵커 컴포넌트가 독립적인 전역 DOM 앵커를 중복 생성하지 않습니다.
- 상태 구독과 효과는 React 마운트·정리 생명주기를 따릅니다.

## Last Updated

2026-09-16
