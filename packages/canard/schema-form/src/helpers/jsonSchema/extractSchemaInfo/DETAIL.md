# extractSchemaInfo

## Requirements

스키마 타입과 nullable 표현을 공통 정보로 해석합니다.

## API Contracts

- 스키마나 type이 없으면 null입니다. 단일 타입에는 null 타입 여부와 nullable 설정을 반영합니다.
- 배열 타입은 한 항목 또는 null을 포함한 두 항목을 처리하며 빈 배열·과도한 항목·null 없는 두 항목은 null입니다.

## Acceptance Criteria

### extract-schema-info-contract — 관찰 가능한 동작

- 타입 배열에서 null의 위치가 바뀌어도 같은 비-null 타입과 nullable 결과를 얻습니다.
- 해석 과정에서 원래 스키마를 복제하거나 변경하지 않습니다.

## Last Updated

2026-09-16
