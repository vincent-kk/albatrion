# FieldInputObject 계약

## Requirements

객체 입력은 자식 UI를 배치하며, 객체의 값 소유권이나 투영을 다시 구현하지 않습니다.

## API Contracts

- 자식은 전달된 ChildFields를 사용합니다. 입력이 스키마를 다시 순회하여 자식을 만들면 현재 게이트·자식 수명과 다른 트리가 생길 수 있습니다.
- 기본 union의 객체 값은 이 입력으로 재귀 편집하지 않으며, [union 입력 계약](../FieldInputUnion/DETAIL.md)의 읽기 전용 표시를 따릅니다.

## Acceptance Criteria

### object-children — 자식 순서와 소유권

- 전달된 자식 순서를 보존하고 입력 렌더가 객체 값을 조립하거나 발행하지 않습니다. 화면 배치가 저장값을 정규화하는 두 번째 통로가 되지 않게 합니다.

## Last Updated

자식 배치와 값 소유권의 경계 또는 union 객체의 편집 책임이 바뀔 때 갱신합니다.
