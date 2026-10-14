# withErrorBoundary contract

## Requirements

- 하위 트리 렌더링 중 던져진 오류는 상위로 전파되지 않고 fallback UI로 대체된다.
- `withErrorBoundaryForwardRef`는 forwardRef 컴포넌트의 ref 전달을 Props/Ref 타입 안전과 함께 보존한다.
- 오류가 없을 때 원본 컴포넌트의 렌더 결과와 props 전달은 변형되지 않는다.

## API Contracts

- `ErrorBoundary`의 공개 선택 속성은 `onError?: (error: unknown, info: { componentStack?: string }) => void`이다. 렌더 오류를 포착하면 이 보고기를 호출하며 `info`에는 React의 `componentStack`만 전달한다(68C-08, ERROR-117·119).
- `withErrorBoundary(Component, fallback?, useReporter?)` → 오류 경계로 보호된 컴포넌트. fallback이 `undefined`이면 기본 메시지 컴포넌트를 렌더하고, `null`을 포함한 그 외 값은 그대로 렌더한다.
- `withErrorBoundaryForwardRef(Component, fallback?, useReporter?)` → ref 전달이 보존된 보호 컴포넌트. fallback 의미론은 일반형과 동일하다.
- 두 감싸개의 셋째 선택 인자는 `useReporter?: () => ((error: unknown, info: { componentStack?: string }) => void) | undefined`이다. 감싸개는 렌더 때 조건 없이 훅을 호출하고 결과를 경계의 `onError`로 전달한다. 인자가 없으면 항상 `undefined`를 반환하는 기본 훅을 호출하여 훅 호출 수를 유지한다(68C-08, TEST-055).
- `onError`와 `useReporter`를 모두 주지 않으면 fallback·props/ref 전달·로깅 계약을 유지한다. 경계의 보고 책임은 보고기 호출뿐이며, 전달 중 표지·오류 중복 억제·경고 집합은 보고기가 소유한다(ERROR-110–117, 68C-08).
- 오류 포착 시 `console.error` 로깅이 항상 수행된다.
- 선택 인자의 릴리스 단위는 `@winglet/react-utils`의 `minor` changeset이며 `package.json`의 version은 변경하지 않는다(68C-06, TEST-055).

## Acceptance Criteria

### error-isolation — 오류 격리와 기본 fallback

- 자식이 던진 오류가 상위를 중단시키지 않고 기본 메시지가 렌더된다.
- 오류가 없으면 원본 컴포넌트가 그대로 렌더된다.

### custom-fallback — 사용자 fallback 계약

- 지정한 fallback이 기본 메시지 대신 렌더된다.
- `undefined`일 때만 기본값으로 대체되고 `null`은 빈 렌더로 존중된다.

### error-reporting — 선택 보고기 계약

- 렌더 오류는 `(error, { componentStack })`로 보고되며 다른 React 정보 필드를 노출하지 않는다. 두 감싸개는 문맥을 읽는 훅의 결과를 같은 경계 속성으로 전달한다(68C-08, TEST-055).
- 보고기 인자가 없어도 렌더의 훅 호출 수와 기본 격리·fallback 동작이 유지된다(ERROR-117·119, TEST-055).

## Boundary Exemptions

### `withErrorBoundaryForwardRef.tsx` — 공개 HOC flat 형제 유지 (fractal root)

- **Consumers**: `entry-point`
- **Direct import**: `allowed`
- **Reason**: entry가 이름으로 재수출하는 공개 유닛은 root flat이 정본 형태다(같은 이름 파일 `withErrorBoundary.tsx`와 대칭). organ 재배치는 배럴 깊이만 늘린다. zero-peer 승인은 `.filid` 설정의 scoped exempt와 쌍으로 관리한다.

## Last Updated

계약 기준: 68C-06·08, ERROR-117·119, TEST-055.
