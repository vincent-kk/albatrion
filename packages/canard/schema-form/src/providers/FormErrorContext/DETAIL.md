# Form error reporting

## Requirements

ERROR-026 and ERROR-110–117 require an instance reporter outside the root boundary.

## API Contracts

The context supplies the latest consumer, object-identity deduplication, per-load warning deduplication, a delivery guard, and a boundary callback carrying only componentStack. A new load clears warning keys; StrictMode cleanup does not. Core records keep their original detail references.

## Acceptance Criteria

### reporting

- A root or field render failure is reported once and remains isolated by its boundary.
- Replayed effects do not resend committed load warnings.

## Last Updated

Contract basis: ERROR-026, ERROR-110–117, 68C-08.
