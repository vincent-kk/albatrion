# getResolveSchema

## Requirements

참조 해석은 기준 스키마의 참조 정보와 제한된 재귀 깊이를 사용합니다.

## API Contracts

- 반환된 해석 함수는 $ref 대상과 함께 지정된 로컬 필드를 병합하여 로컬 설정에 우선권을 줍니다.
- 최대 깊이는 재귀 확장을 제한하며, 참조 처리 결과는 호출자가 부재 가능성을 구분하여 소비합니다.

## Acceptance Criteria

### get-resolve-schema-contract — 관찰 가능한 동작

- 참조 해석이 원래 기준 스키마를 직접 변경하지 않습니다.
- 같은 참조라도 해당 위치의 로컬 설정이 해석 결과에 반영됩니다.

## Last Updated

2026-09-16
