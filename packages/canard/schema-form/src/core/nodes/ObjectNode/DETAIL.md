# ObjectNode

## Requirements

객체 노드는 선택한 전략에 값과 자식 관리를 위임합니다.

## API Contracts

- terminal 여부로 전략을 생성 시 선택합니다. children은 활성 자식, subnodes는 비활성 분기를 포함한 전체 자식입니다.
- 빈 객체 생략은 omitEmpty 설정에 따라 onChange 경계에서 적용합니다.

## Acceptance Criteria

### object-node-contract — 관찰 가능한 동작

- 비활성 조건 분기도 subnodes를 통한 전체 트리 처리에는 남아 있습니다.
- terminal 객체는 branch 방식의 자식 트리 관리에 섞이지 않습니다.

## Last Updated

2026-09-16
