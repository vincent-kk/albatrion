# virtualBehavior 계약

## Requirements

가상 노드는 실제 형제 노드의 참조 그룹이며 별도 데이터 소유자가 아닙니다. 표시 묶음을 데이터 트리에도 복제하면 같은 값에 두 쓰기 주소와 검증 위치가 생깁니다.

## API Contracts

자식 참조의 확정과 쓰기 분배는 [settle 계약](../../settle/DETAIL.md), 탐색과 공개 값 읽기는 [navigation 계약](../../navigation/DETAIL.md)과 [surface 계약](../../../surface/DETAIL.md)이 소유합니다. 이 행은 선언과 로컬 튜플만 계산합니다.

## Acceptance Criteria

### virtual-row — 튜플은 참조한 형제의 값입니다

가상 그룹의 local은 fields 선언 순서로 실제 형제의 value를 읽은 튜플입니다. emit이나 별도 원본으로 바꾸면 투영 전 편집 값을 묶는 의미가 달라집니다. 자체 방출은 만들지 않아 가상 이름이 실제 데이터와 검증의 키로 나타나지 않게 합니다.

기존 길이와 각 형제 값이 엄격 동등하면 이전 튜플을 재사용합니다. 이 비교를 깊은 복사나 또 다른 소유 원본으로 대체하지 않습니다. 가상 그룹을 통째 값을 보관하는 terminal로 바꾸면 참조 그룹이라는 경계가 사라집니다.

## Last Updated

참조 그룹의 값 채널·선언 순서·튜플 재사용 또는 자체 방출 부재가 바뀔 때 갱신합니다.
