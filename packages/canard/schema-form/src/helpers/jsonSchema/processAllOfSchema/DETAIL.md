# processAllOfSchema — DETAIL

## Requirements

- 병합은 원본을 변경하지 않는다: `allOf`를 분리한 나머지를 `cloneLite`로 복제한 뒤에만 병합한다.
- `allOf` 항목은 배열 순서 그대로 순차 병합한다 — 재정렬·건너뛰기 금지.
- 타입 비호환은 `JsonSchemaError('ALL_OF_TYPE_REDEFINITION')`로 즉시 실패한다.
- 폼 렌더링에 무의미한 키워드(`IGNORE_FIELDS`)는 병합에서 제외하고 dev 환경 경고를 방출한다.

## API Contracts

`processAllOfSchema(schema: JsonSchema): JsonSchema`

| 입력 조건                                | 결과                                     |
| ---------------------------------------- | ---------------------------------------- |
| `allOf` 부재 또는 빈 배열                | 입력 스키마를 **동일 참조**로 반환       |
| 병합 핸들러 없음 (type 부재·미지원 타입) | 입력 스키마를 **동일 참조**로 반환       |
| 병합 수행                                | `allOf`가 제거된 **새 스키마 객체** 반환 |
| `validateCompatibility` 실패             | `JsonSchemaError` throw                  |

복제 깊이는 스키마 타입별로 다르며 `getCloneDepth`가 소유한다 — 직접 병합되는 층만 복제하고 그보다 깊은 중첩 스키마는 참조를 공유한다.

## Acceptance Criteria

### allof-passthrough — 병합할 것이 없으면 입력이 그대로 나온다

- `allOf` 부재·빈 배열·type 부재·미지원 타입 각각에서 반환값이 입력과 동일 참조다.

### source-protection — 병합이 원본을 오염시키지 않는다

- 병합 후 원본 스키마의 직접 병합 대상 층(object의 `properties` 개별 스키마, array의 `items`)이 변경되지 않는다.
- `allOf` 항목 스키마들도 변경되지 않는다.

### type-redefinition — 타입 재정의는 실패다

- `allOf` 항목의 타입이 기반 스키마와 비호환이면 `JsonSchemaError`가 throw된다.

### ignored-keyword-warning — 무시되는 키워드는 조용히 사라지지 않는다

- `allOf` 항목에 `IGNORE_FIELDS` 소속 키워드가 있으면 dev 환경에서 `warnDevelopmentIssue` 경고가 방출된다.

## Last Updated

2026-08-18 — 문서 신설. passthrough 동일 참조 계약, 원본 보호 범위, 실패·경고 분류를 기존 `__tests__`가 검증하는 형태로 명문화 (issue #331, FIX-050).
