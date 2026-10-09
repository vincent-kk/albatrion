# Form error reporting

## Requirements

ERROR-026 and ERROR-110–117 require an instance reporter outside the root boundary.

## API Contracts

The context supplies the latest consumer, object-identity deduplication, per-load warning deduplication, a delivery guard, and a boundary callback carrying only componentStack. The provider binds its selected load root before child boundaries commit, including StrictMode's initial render; speculative construction does not select the observer root. Buffered and boundary onError callbacks enter the core observer scope and restore its preceding state even on throw. A new load clears warning keys; StrictMode cleanup does not. Core records keep their original detail references.

필드 보고 훅은 path를 인자로 받고 렌더 때 현재 보고기를 읽습니다. undefined는 루트 경계이며 pendingLoad 처리도 유지합니다. 경로 문맥은 DeferrableNodeProxy의 Placeholder만 사용하고 전용 훅이 이를 명시적 path 보고 훅에 연결합니다(ERROR-044·114, 121C-01). 필드마다 문맥 구독과 Provider를 보유하지 않으며 콜백은 보고기와 path가 같으면 같은 참조입니다.

## Acceptance Criteria

### reporting — Single isolated error report

- A root or field render failure is reported once and remains isolated by its boundary.
- Replayed effects do not resend committed load warnings.
- 렌더러·formatError·입력·Placeholder의 오류는 현재 path와 원래 오류 identity를 유지합니다.

## Last Updated

2026-10-08 — ERROR-026·044·090·110–117, 68C-08, 121C-01.
