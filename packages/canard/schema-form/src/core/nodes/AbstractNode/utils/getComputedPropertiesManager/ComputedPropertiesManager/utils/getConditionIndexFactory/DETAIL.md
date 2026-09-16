# getConditionIndexFactory

## Requirements

객체 조합 스키마의 조건 결과를 원래 브랜치 인덱스에 연결합니다.

## API Contracts

- 비객체 타입이나 적용할 조건이 없으면 계산 함수를 만들지 않습니다.
- 단일 선택은 매칭이 없을 때 -1, 다중 선택은 빈 배열을 반환합니다. 조건 컴파일 실패는 CONDITION_INDEX 오류입니다.

## Acceptance Criteria

### get-condition-index-factory-contract — 관찰 가능한 동작

- 조건이 있는 항목만 추려도 결과 인덱스는 원본 스키마 배열을 가리킵니다.
- 단순 등호 최적화와 일반 표현식 경로는 같은 선택 결과를 제공합니다.

## Last Updated

2026-09-16
