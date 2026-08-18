# resolveReference contract

## Requirements

- 스키마 안의 모든 `$ref`(legacy `definitions` 표기, `$defs` 표기 모두)를 가리키는 정의로 치환한 스키마를 동기로 반환한다.
- 자기 자신 또는 조상 정의를 가리키는 순환 `$ref`가 있어도 무한 루프 없이 종료하며, 순환 지점은 1레벨만 인라인하고 더 깊은 재귀 지점은 `$ref`로 남긴다.
- 참조 대상을 찾지 못한 `$ref`가 있어도 예외를 던지지 않는다.

## API Contracts

- `resolveReference(jsonSchema)`: 1차로 동기 스캐너를 돌려 exit 시점에 `hasReference`와 문자열 `$ref`를 가진 노드의 참조 경로를 원본 위치의 값과 함께 Map에 모으고, 2차로 그 Map 조회 함수를 `resolveReference` 옵션에 넘겨 다시 스캔해 `getValue()`로 최종 스키마를 반환한다.

## Acceptance Criteria

### legacy-definitions — legacy definitions 표기 해석

- `definitions`(draft-07 방식) 아래 정의를 가리키는 `$ref`가 여러 개 있는 스키마에서, 모든 `$ref`가 각각의 정의 내용으로 치환된 스키마를 반환함을 검증한다.

### cyclic-definitions — 순환 정의 안전 해석

- 자기 자신을 가리키는 `$ref`를 가진 `definitions` 엔트리(트리형 재귀 구조)를 해석해도 종료하며, 1레벨은 인라인되고 더 깊은 재귀 지점은 `$ref`가 그대로 남음을 검증한다.

## Last Updated

2026-08-18 — 최초 계약 작성
