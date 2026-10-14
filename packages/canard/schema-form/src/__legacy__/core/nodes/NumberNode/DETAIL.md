# NumberNode

## Requirements

number와 integer 스키마의 파싱 및 수치 비교 의미를 유지합니다.

## API Contracts

- 정수 파싱 여부는 정규화된 type이 아니라 원래 schemaType으로 결정합니다.
- 일반 값 비교는 부동소수점 근접성을 사용하고, fullPrecision 비교는 엄격한 동등성을 사용합니다.

## Acceptance Criteria

### number-node-contract — 관찰 가능한 동작

- 기본 omitEmpty 경로에서는 NaN이나 undefined가 외부 값으로 남지 않습니다.
- nullable이면 null을 보존하고 integer 스키마는 정수 모드로 파싱합니다.

## Last Updated

2026-09-16
