# getObjectDefaultValue

## Requirements

객체 스키마의 중첩 default를 수집하면서 이미 주어진 값을 우선합니다.

## API Contracts

- 입력 기본값을 우선하고 그다음 스키마 기본값을 사용하여 탐색 결과의 기반을 만듭니다.
- 중첩 경로 설정은 overwrite를 끄고 수행하며 빈 결과이면 원래 기본값을 반환합니다.

## Acceptance Criteria

### get-object-default-value-contract — 관찰 가능한 동작

- 하위 default가 상위에서 이미 정한 필드 값을 덮어쓰지 않습니다.
- 이전 호출의 스캔 결과를 캐시하여 다음 객체의 기본값에 섞지 않습니다.

## Last Updated

2026-09-16
