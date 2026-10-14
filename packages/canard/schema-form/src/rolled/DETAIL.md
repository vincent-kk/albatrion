# rolled

## Requirements

내부 타입을 공개 소비자가 사용할 수 있는 Roll 표현으로 제공합니다.

## API Contracts

- 기반 타입과 공개 타입을 구분하며 import와 export는 타입 전용입니다.
- 런타임 값이나 초기화 동작을 추가하지 않습니다.
- 이 fractal은 `src`의 자식이며 기반 형을 형제 `types`의 관문에서, Form 조각 형을 `components/Form`의 관문에서 가져옵니다. 공개 이름이 기반 형과 같아 `types`의 자식으로 두면 그 관문이 두 형을 한 이름으로 실어야 하므로 형제로 둡니다.

## Acceptance Criteria

### rolled-contract — 관찰 가능한 동작

- 공개 타입이 내부 기반 타입의 변경을 반영하면서 Roll 변환을 유지합니다.
- 이 모듈을 타입으로 참조해도 런타임 초기화나 상태가 생기지 않습니다.

## Last Updated

2026-09-16
