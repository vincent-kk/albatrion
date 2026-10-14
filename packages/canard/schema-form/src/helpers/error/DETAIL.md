# error

## Requirements

개발자 진단 상자에서 함께 쓰는 원소와 사용자에게 보이는 검증 메시지의 책임을 나눕니다. 진단 문자열을 만드는 개별 포맷터는 이를 쓰는 fractal이 소유합니다.

## API Contracts

- `createDivider(width = 50): string`은 `'─'`를 너비만큼 반복해 진단 상자의 구분선을 만듭니다.
- `getErrorMessage(error: unknown): string`은 `Error`이면 `message`를, 아니면 `String(error ?? 'Unknown error')`를 반환합니다.
- `formatValidationError(error: JSONSchemaError, node: FieldNode, context: Dictionary): ReactNode`는 `FormatError` 계약에 따라 스키마의 메시지 설정을 반영한 검증 메시지를 반환합니다.

## Acceptance Criteria

### error-contract — 관찰 가능한 동작

- 공유 원소와 검증 메시지 포맷터는 외부 상태를 변경하지 않습니다.

## Last Updated

2026-10-14 — 정돈-1; VALIDATE-010, LANDING-115; 정돈-2(2026-10-14).
