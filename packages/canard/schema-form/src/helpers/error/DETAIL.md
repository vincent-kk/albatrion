# error

## Requirements

개발자 진단 상자의 공유 원소와 사용자 검증 메시지의 책임을 구분합니다. 개별 진단 문자열 포맷터는 소비자 fractal이 소유합니다.

## API Contracts

- `createDivider(width = 50): string`은 너비만큼 `'─'`를 반복하여 진단 상자의 구분선을 만듭니다.
- `getErrorMessage(error: unknown): string`은 `Error`이면 `message`, 아니면 `String(error ?? 'Unknown error')`를 반환합니다.
- `formatValidationError(error: JSONSchemaError, node: FieldNode, context: Dictionary): ReactNode`는 `FormatError` 계약에 따라 스키마의 메시지 설정을 반영한 검증 메시지를 반환합니다.

## Acceptance Criteria

### error-contract — 관찰 가능한 동작

- 공유 원소와 검증 메시지 포맷터는 외부 상태를 변경하지 않습니다.

## Last Updated

2026-10-14 — 정돈-1; VALIDATE-010, LANDING-115; 정돈-2(2026-10-14).
