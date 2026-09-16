# stripSchemaExtensions

## Requirements

검증기에 전달하기 전에 폼 확장 필드를 스키마 트리에서 제거합니다.

## API Contracts

- 대상 확장 필드가 있는 노드만 변환하고 표준 JSON Schema 필드는 보존합니다.
- 변경이 없는 경우 원래 스키마를 반환하며 입력 객체를 직접 변경하지 않습니다.

## Acceptance Criteria

### strip-schema-extensions-contract — 관찰 가능한 동작

- 중첩된 스키마의 폼 확장도 제거 대상에 포함됩니다.
- 정리 과정에서 properties나 required 같은 검증 의미를 삭제하지 않습니다.

## Last Updated

2026-09-16
