# preprocessSchema

## Requirements

폼이 소비할 스키마에 가상 필드와 oneOf 추적 정보를 전처리합니다.

## API Contracts

- 객체 스키마에는 가상 필드 변환을 적용하고 oneOf 항목에는 variant 정보를 반영합니다.
- 스캐너 변환 콜백은 변경이 없으면 undefined를 반환하여 불필요한 교체를 피합니다.

## Acceptance Criteria

### preprocess-schema-contract — 관찰 가능한 동작

- 전처리의 가상 필드 처리와 oneOf 처리 순서를 유지합니다.
- 호출자가 가진 원래 스키마 객체에 전처리 변경을 직접 기록하지 않습니다.

## Last Updated

2026-09-16
