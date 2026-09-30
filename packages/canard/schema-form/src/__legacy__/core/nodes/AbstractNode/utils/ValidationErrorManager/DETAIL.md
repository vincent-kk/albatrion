# ValidationErrorManager

## Requirements

로컬·글로벌·외부 오류 저장을 분리하고 이벤트 발행은 호스트 노드에 맡깁니다.

## API Contracts

- 오류 설정 메서드는 동일하면 true, 변경되면 false를 반환합니다.
- 외부 오류는 로컬 또는 글로벌 오류 앞에 병합하며 key를 부여합니다. 외부 오류 동등성 비교에서는 key를 제외합니다.

## Acceptance Criteria

### validation-error-manager-contract — 관찰 가능한 동작

- 같은 내용의 외부 오류를 다시 넣으면 key 차이만으로 변경으로 판정하지 않습니다.
- 오류 저장 자체가 노드 이벤트나 트리 탐색을 실행하지 않습니다.

## Last Updated

2026-09-16
