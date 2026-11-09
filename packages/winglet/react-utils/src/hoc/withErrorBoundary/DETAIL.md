# withErrorBoundary contract

## Requirements

- 하위 트리의 렌더 오류를 fallback으로 격리합니다. 보고기나 fallback 자체의 예외를 이 경계가 다시 격리한다는 약속은 없으며, 보고기를 호출하는 코드에 별도 예외 포착은 없습니다.
- `withErrorBoundaryForwardRef`는 forwardRef 컴포넌트의 ref 전달을 Props/Ref 타입 안전과 함께 보존한다.
- 오류가 없을 때 원본 컴포넌트의 렌더 결과와 props 전달은 변형되지 않는다.

## API Contracts

- `ErrorBoundary`는 HOC 없이 직접 합성할 수 있는 공개 경계입니다. `onError?: (error: unknown, info: { componentStack?: string }) => void`는 HOC와 같은 보고 계약을 사용합니다.
- `withErrorBoundary(Component, fallback?, useReporter?)` → 오류 경계로 보호된 컴포넌트. fallback이 `undefined`이면 기본 메시지 컴포넌트를 렌더하고, `null`을 포함한 그 외 값은 그대로 렌더한다.
- `withErrorBoundaryForwardRef(Component, fallback?, useReporter?)` → ref 전달이 보존된 보호 컴포넌트. fallback 의미론은 일반형과 동일하다.
- 두 감싸개의 셋째 선택 인자는 `useReporter?: () => ((error: unknown, info: { componentStack?: string }) => void) | undefined`입니다. 보고기를 생성 시점에 고정하지 않고 렌더마다 읽어 모듈 수준 HOC도 현재 문맥의 인스턴스에 보고하게 합니다.
- 오류 포착 시 `console.error` 로깅이 항상 수행된다.
- 오류 상태는 경계 인스턴스에 남습니다. props나 보고기 교체만으로 자식을 재시도하지 않으므로 소비자가 복구를 원하면 경계의 재마운트를 결정합니다.

## Acceptance Criteria

### error-isolation — 오류 격리와 기본 fallback

- 자식이 던진 오류가 상위를 중단시키지 않고 기본 메시지가 렌더된다.
- 오류가 없으면 원본 컴포넌트가 그대로 렌더된다.

### custom-fallback — 사용자 fallback 계약

- 지정한 fallback이 기본 메시지 대신 렌더된다.
- `undefined`일 때만 기본값으로 대체되고 `null`은 빈 렌더로 존중된다.

### error-reporting — ERROR-115: 렌더 문맥의 선택 보고기

- 두 감싸개는 렌더에서 훅을 조건 없이 읽어 현재 보고기를 전달합니다. 보고가 필요할 때만 훅을 호출하면 훅 순서가 바뀌므로 생략 시에도 기본 훅을 사용합니다.
- 중복 억제·전달 중 표지·경고 집합은 호스트 보고기가 소유합니다. 범용 경계에 폼 인스턴스 수명과 오류 분류를 결합하지 않습니다.

### ERROR-116 — 보고기 없는 호출의 호환성

- 선택 보고기를 생략해도 기본 fallback·props/ref 전달·console 로깅을 유지합니다. 보고 기능 추가가 기존 소비자의 진단이나 격리 결과를 바꾸지 않게 합니다.

### ERROR-117 — 직접 경계와 HOC의 같은 보고 표면

- 직접 경계는 `onError`, HOC는 `useReporter`로 보고기를 받습니다. 경계 배치 지점을 바꾸거나 HOC를 매번 재생성하지 않고도 문맥을 읽기 위해 둘을 함께 제공합니다.
- 보고 정보는 React의 `componentStack`만 노출하여 React 내부 정보 전체를 공개 계약으로 굳히지 않습니다.
- 경계는 console 로깅 뒤 보고기를 호출합니다. 보고기 제공으로 기본 로그를 끄는 별도 경로를 만들지 않습니다.

## Boundary Exemptions

### `withErrorBoundaryForwardRef.tsx` — 공개 HOC flat 형제 유지 (fractal root)

- **Consumers**: `entry-point`
- **Direct import**: `allowed`
- **Reason**: ref 전달형은 일반형과 대칭인 공개 유닛이므로 root flat을 유지합니다. 둘을 단순히 organ으로 옮기면 공개 유닛의 도달 범위는 그대로인데 경로 깊이만 늘어납니다.

## Last Updated

격리·fallback·보고기·props/ref 전달이나 오류 상태의 복구 경계가 바뀔 때 갱신합니다.
