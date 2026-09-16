# getVirtualReferencesMap

## Requirements

가상 필드 정의의 참조 유효성을 확인하고 양방향 조회 맵을 만듭니다.

## API Contracts

- 가상 정의가 없으면 빈 결과를 반환합니다.
- fields가 배열이 아니거나 선언된 프로퍼티에 없는 이름을 참조하면 각각의 JsonSchemaError로 실패합니다.

## Acceptance Criteria

### get-virtual-references-map-contract — 관찰 가능한 동작

- 각 유효한 참조는 가상 키에서 필드 목록으로, 필드에서 가상 키 목록으로 조회됩니다.
- 존재하지 않는 필드를 조용히 제거해 유효한 정의처럼 처리하지 않습니다.

## Last Updated

2026-09-16
