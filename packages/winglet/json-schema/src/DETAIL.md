# json-schema contract

## Requirements

- 순회 스캐너는 `$ref`를 가진 JSON Schema를 깊이 우선(DFS)으로 순회하며, 참조가 가리키는 정의를 원래 위치에 인라인한 최종 스키마를 만들 수 있다.
- 자기 참조를 포함한 순환 스키마를 순회해도 무한 루프 없이 종료하며, 순환 지점은 1레벨만 인라인되고 더 깊은 재귀는 `$ref`로 남는다.
- 비동기 스캐너는 방문자·필터·mutate·참조 해석 콜백이 프로미스를 반환해도 각 단계를 완료까지 기다린 뒤 다음 단계로 진행한다.
- 재수출되는 타입 판별자는 스키마의 `type` 필드만으로 nullable/non-nullable 여부를 판정한다.

## API Contracts

- `JsonSchemaScanner` / `JsonSchemaScannerAsync`: 생성자에 `visitor`(enter/exit)와 `options`를 받아 `scan(schema)` 후 `getValue()`로 최종 스키마를 얻는 두 단계 API를 제공한다. `options.cloneResolvedSchema`는 기본값 `true`로 해석된 하위 스키마를 인라인 시점에 깊은 복제하며(원본 비변형, 중복 `$ref` 별칭 공유 방지), `options.cacheResolvedReference`는 기본값 `false`로 동일 참조 문자열의 재해석 여부를 제어한다.
- `resolveReference(schema)`: 내부 `$ref`를 모두 인라인한 스키마를 동기로 반환하는 헬퍼다. 내부적으로 동기 스캐너를 두 번 구동한다.
- `filters`가 재수출하는 함수들은 각각 `schema is <Type>Schema` 형태의 타입가드다.
- 스키마 노드 타입과 값 추론 타입도 이름 그대로 재수출한다.

## Acceptance Criteria

### scanner-sync — 동기 스캐너 순회·참조 해석 계약

- exit 방문자에서 `hasReference`와 `schema.$ref` 문자열로 참조 위치를 수집하고, `resolveReference` 옵션으로 재순회하면 `getValue()`가 참조를 인라인한 최종 스키마를 반환한다.
- 중첩된 `$defs`(정의 내부에 또 다른 정의가 있는 경우)도 각각 고유한 JSON 포인터 경로로 구분되어 해석된다.
- 자기 자신 또는 상위 정의를 가리키는 순환 `$ref`가 있어도 순회는 종료하며, 순환된 지점은 1레벨만 해석되고 더 깊은 재귀 지점은 `$ref` 그대로 남는다 — 무한 루프 미발생을 별도 케이스로도 확인한다.
- `oneOf` 등 구성 키워드 내부에 중첩된 `$ref`도 탐지·해석 대상이며, 해석 후에도 `additionalProperties`처럼 관련 없는 키워드는 원본 그대로 보존된다.

### scanner-async — 비동기 스캐너 콜백·참조 해석 계약

- 동기 스캐너와 동일한 실제 데이터 시나리오(중첩 `$defs`, 순환 참조, `oneOf` 내부 참조, 무관한 키워드 보존)를 `await scan()` 경로로도 동일하게 재현한다.
- 방문자 콜백이 동기 함수여도(async로 감싸지 않아도) 정상 동작하며, `enter`가 각 노드의 경로·깊이·키워드 정보를 담아 호출된다.
- `resolveReference` 옵션이 프로미스로 스키마를 반환하면 `referenceResolved: true`와 해석된 스키마가 방문자에 전달되고, `undefined`로 해석되면 `referenceSkipped: 'unresolved'`를 남기며 원본 `$ref` 스키마를 유지한다.
- 방문자의 `enter`/`exit`가 각각 프로미스를 반환하면 `scan()`은 각 콜백이 완료될 때까지 순서대로 기다린 뒤 다음 단계로 진행한다(호출 순서로 검증).
- `scan()` 이전의 `getValue()`는 `undefined`를 반환하고, 참조가 없는 스키마를 스캔한 뒤의 `getValue()`는 원본 스키마와 동일한 값을 반환한다.

## Last Updated

2026-08-18 — 최초 계약 작성
