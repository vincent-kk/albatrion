# preprocessSchema

## Requirements

폼이 소비할 스키마에 가상 필드와 oneOf 추적 정보를 전처리합니다.

## API Contracts

- 객체 스키마에는 가상 필드 변환을 적용하고 oneOf 항목에는 variant 정보를 반영합니다.
- 스캐너 변환 콜백은 변경이 없으면 undefined를 반환하지만, oneOf 병합과 일부 virtual 조건 처리는 전달된 스키마 객체를 직접 갱신할 수 있습니다.

## Acceptance Criteria

### preprocess-schema-contract — 관찰 가능한 동작

- 전처리의 가상 필드 처리와 oneOf 처리 순서를 유지합니다.
- oneOf 분기는 원래 분기 객체에 추적 프로퍼티를 병합하며, 루트 required 없이 then·else만 처리하는 virtual 스키마는 원래 조건 프로퍼티를 교체할 수 있습니다.

## Last Updated

2026-09-16
