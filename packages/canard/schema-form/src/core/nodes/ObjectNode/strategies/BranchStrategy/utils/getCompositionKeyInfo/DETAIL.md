# getCompositionKeyInfo

## Requirements

조합 분기의 실제 필드 키와 전체 합집합을 구분하여 제공합니다.

## API Contracts

- oneOf 또는 anyOf가 없거나 비어 있으면 undefined입니다.
- type 또는 $ref가 있는 프로퍼티만 포함하며, 분기별 키 집합은 원래 분기 인덱스에 대응합니다.

## Acceptance Criteria

### get-composition-key-info-contract — 관찰 가능한 동작

- 순수 논리 조건만 담긴 프로퍼티는 필드 키 집합에 포함하지 않습니다.
- properties가 없는 분기 위치를 임의로 압축하여 다른 분기의 인덱스를 바꾸지 않습니다.
- properties가 없는 분기는 빈 키 집합에 대응하며, 분기별 키 집합 배열에는 빈 자리가 없습니다.
- `type`이 `null`인 분기는 `properties`가 있어도 빈 키 집합에 대응하며 그 키는 합집합에 들어가지 않습니다.

## Last Updated

2026-09-20
