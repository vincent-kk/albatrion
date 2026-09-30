# getDerivedValueFactory

## Requirements

의존성에서 파생 값을 계산하며 임의의 결과 타입을 보존합니다.

## API Contracts

- computed.derived를 먼저 읽고 별칭을 폴백으로 사용합니다.
- 동적 함수 생성 시 boolean coercion을 사용하지 않습니다. 표현식 부재는 undefined로 전달합니다.

## Acceptance Criteria

### get-derived-value-factory-contract — 관찰 가능한 동작

- 숫자·문자열·객체 등 파생 결과가 boolean으로 바뀌지 않습니다.
- 명시적인 computed 표현식이 있으면 별칭보다 우선합니다.

## Last Updated

2026-09-16
