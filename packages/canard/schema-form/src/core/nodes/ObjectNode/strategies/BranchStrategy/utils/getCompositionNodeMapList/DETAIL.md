# getCompositionNodeMapList

## Requirements

조합 분기의 자식 맵을 만들 때 타입과 필드 소유권 충돌을 드러냅니다.

## API Contracts

- 자식 맵은 공통 `ChildNode` 계약으로 표현하며 소비자인 BranchStrategy의 타입 별칭에 의존하지 않습니다.
- 허용 키와 제외 키를 반영해 노드를 만들며 기본 자식 맵을 직접 변경하지 않습니다.
- 타입 재정의와 허용되지 않는 프로퍼티 충돌은 JSONSchemaError로 전달합니다. 직접 중첩된 조합은 필드로 확장하지 않습니다.

## Acceptance Criteria

### get-composition-node-map-list-contract — 관찰 가능한 동작

- 각 결과 맵은 원래 조합 분기와 대응합니다.
- 중첩 조합을 무시하는 경우 개발 환경에서 진단을 제공하며 프로덕션에서는 같은 경고를 출력하지 않습니다.

## Last Updated

2026-09-16
