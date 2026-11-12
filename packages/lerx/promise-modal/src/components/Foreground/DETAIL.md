# Foreground

## Requirements

모달 종류와 사용자 컴포넌트에 맞춰 내용을 조합하며 노드 변경은 조작 인터페이스를 거칩니다.

## API Contracts

- prompt 함수형 변경은 최신 값에서 순서대로 누적되고 확인은 동기적으로 노드의 현재 값을 확정합니다. Input 오류는 모달 단위 오류 경계로 전달합니다.

## Acceptance Criteria

### foreground-contract — 관찰 가능한 동작

- 한 이벤트 안의 함수형 입력 변경과 확인은 누적된 최신 값을 반환합니다.

## Last Updated

결과 확정, 자원 소유권 또는 표시 계약이 바뀔 때 갱신합니다.
