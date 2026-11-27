# virtualBehavior 계약

## Requirements

가상 노드는 실제 형제 노드의 참조 그룹이며 별도 데이터 소유자가 아닙니다. 표시 묶음을 데이터 트리에도 복제하면 같은 값에 두 쓰기 주소와 검증 위치가 생깁니다.

## API Contracts

자식 참조의 확정과 쓰기 분배는 [settle 계약](../../settle/DETAIL.md), 탐색과 공개 값 읽기는 [navigation 계약](../../navigation/DETAIL.md)과 [surface 계약](../../../surface/DETAIL.md)이 소유합니다. 이 행은 선언과 로컬 튜플만 계산합니다.

## Acceptance Criteria

### virtual-row — 튜플은 참조한 형제의 값입니다

가상 그룹의 `__value__`는 fields 선언 순서로 실제 형제의 value를 읽은 튜플입니다. `__outputValue__`나 별도 원본으로 바꾸면 투영 전 편집 값을 묶는 의미가 달라집니다. 자체 방출은 만들지 않아 가상 이름이 실제 데이터와 검증의 키로 나타나지 않게 합니다.

기존 길이와 각 형제 값이 엄격 동등하면 이전 튜플을 재사용합니다. 이 비교를 깊은 복사나 또 다른 소유 원본으로 대체하지 않습니다. 가상 그룹을 통째 값을 보관하는 terminal로 바꾸면 참조 그룹이라는 경계가 사라집니다.

### virtual-edges — 간선 사본은 그룹 바퀴의 입력입니다

가상 행은 청사진의 가상 노드가 가진 constituent 간선 사본을 자식 선언으로 돌려줍니다. 정착은 사본의 gate를 그룹의 gate로 세어 constituent의 gate가 있는 그룹을 gate 호스트로 다루고, 그 바퀴의 고정 출발점이 투영을 gate 없는 선언을 가진 constituent로 다시 세운 뒤 자식 계산을 시작합니다. 빈 목록으로 바꾸면 그룹은 gate 없는 호스트가 되어 이전 투영을 그대로 둔 채 자식을 계산하므로, 같은 정착에서 떠나는 constituent를 그룹을 거쳐 계산하고 그 주소에 들어온 쓰기를 잃습니다. 사본은 부모가 소유한 선언이므로 출발점은 빌린 constituent를 바꾸지 않습니다([settle SETTLE-044](../../settle/DETAIL.md#settle-044--고정-출발점과-이력-없는-형상)).

## Last Updated

참조 그룹의 값 채널·선언 순서·튜플 재사용·간선 사본 선언 또는 자체 방출 부재가 바뀔 때 갱신합니다.
