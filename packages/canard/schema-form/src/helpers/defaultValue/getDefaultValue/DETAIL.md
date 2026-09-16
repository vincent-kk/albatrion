# getDefaultValue

## Requirements

스키마의 명시적 default를 최우선으로 초기값에 사용합니다.

## API Contracts

- default가 undefined가 아니면 그대로 반환하며, virtual은 타입 정보 해석 전에 빈 배열을 반환합니다.
- 그 밖에는 스키마 정보에서 타입을 추출해 빈 값을 얻고, 정보 해석 실패는 undefined입니다.

## Acceptance Criteria

### get-default-value-contract — 관찰 가능한 동작

- false, 0, 빈 문자열과 null 기본값이 폴백에 의해 사라지지 않습니다.
- 이 함수에서 참조 해석이나 스키마 유효성 검사를 추가로 수행하지 않습니다.

## Last Updated

2026-09-16
