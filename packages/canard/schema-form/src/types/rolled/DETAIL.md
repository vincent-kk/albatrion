# rolled

## Requirements

내부 타입을 공개 소비자가 사용할 수 있는 Roll 표현으로 제공합니다.

## API Contracts

- 기반 타입과 공개 타입을 구분하며 import와 export는 타입 전용입니다.
- 런타임 값이나 초기화 동작을 추가하지 않습니다.

## Acceptance Criteria

### rolled-contract — 관찰 가능한 동작

- 공개 타입이 내부 기반 타입의 변경을 반영하면서 Roll 변환을 유지합니다.
- 이 모듈을 타입으로 참조해도 런타임 초기화나 상태가 생기지 않습니다.

## Last Updated

2026-09-16
