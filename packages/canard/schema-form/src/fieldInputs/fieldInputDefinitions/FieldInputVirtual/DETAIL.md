# FieldInputVirtual 계약

## Requirements

가상 입력은 참조 자식의 UI를 묶으며, 실제 저장 경로나 별도의 값 컨테이너를 만들지 않습니다.

## API Contracts

- 전달된 ChildFields를 사용하여 참조 자식의 입력과 수명을 유지합니다. 가상 이름으로 값을 다시 감싸면 같은 실제 필드가 별도의 데이터로 저장될 수 있습니다.

## Acceptance Criteria

### virtual-children — 표시 묶음과 데이터 경로를 구별합니다

- 참조 자식의 전달 순서를 보존하고 직접 값을 조립하거나 발행하지 않습니다. UI 그룹을 값 트리의 추가 부모로 해석하지 않습니다.

## Last Updated

가상 그룹의 자식 배치와 실제 데이터 소유권의 경계가 바뀔 때 갱신합니다.
