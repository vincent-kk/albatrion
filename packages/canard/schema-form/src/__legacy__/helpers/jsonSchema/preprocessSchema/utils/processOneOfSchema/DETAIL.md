# processOneOfSchema

## Requirements

oneOf 분기의 원래 variant 인덱스를 내부 추적용 프로퍼티로 표현합니다.

## API Contracts

- 기존 properties와 내부 강화 키의 const 값을 입력 스키마에 깊게 병합하고 같은 스키마 참조를 반환합니다.
- 호출 맥락은 전처리의 oneOf 변환 단계이며 내부 키에는 variant 인덱스만 기록합니다.

## Acceptance Criteria

### process-one-of-schema-contract — 관찰 가능한 동작

- 원래 프로퍼티와 스키마 제약이 병합 결과에서 사라지지 않습니다.
- 전달된 variant는 입력 스키마의 properties에 직접 기록되며, 기존 강화 키가 있으면 그 const 값을 교체합니다.

## Last Updated

2026-09-16
