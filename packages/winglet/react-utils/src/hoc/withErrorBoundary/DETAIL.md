# withErrorBoundary contract

## Requirements

- 하위 트리 렌더링 중 던져진 오류는 상위로 전파되지 않고 fallback UI로 대체된다.
- `withErrorBoundaryForwardRef`는 forwardRef 컴포넌트의 ref 전달을 Props/Ref 타입 안전과 함께 보존한다.
- 오류가 없을 때 원본 컴포넌트의 렌더 결과와 props 전달은 변형되지 않는다.

## API Contracts

- `withErrorBoundary(Component, fallback?)` → 오류 경계로 보호된 컴포넌트. fallback이 `undefined`이면 기본 메시지 컴포넌트를 렌더하고, `null`을 포함한 그 외 값은 그대로 렌더한다.
- `withErrorBoundaryForwardRef(Component, fallback?)` → ref 전달이 보존된 보호 컴포넌트. fallback 의미론은 일반형과 동일하다.
- 오류 포착 시 `console.error` 로깅이 항상 수행된다.

## Acceptance Criteria

### error-isolation — 오류 격리와 기본 fallback

- 자식이 던진 오류가 상위를 중단시키지 않고 기본 메시지가 렌더된다.
- 오류가 없으면 원본 컴포넌트가 그대로 렌더된다.

### custom-fallback — 사용자 fallback 계약

- 지정한 fallback이 기본 메시지 대신 렌더된다.
- `undefined`일 때만 기본값으로 대체되고 `null`은 빈 렌더로 존중된다.

## Boundary Exemptions

### `withErrorBoundaryForwardRef.tsx` — 공개 HOC flat 형제 유지 (fractal root)

- **Consumers**: `entry-point`
- **Direct import**: `allowed`
- **Reason**: entry가 이름으로 재수출하는 공개 유닛은 root flat이 정본 형태다(같은 이름 파일 `withErrorBoundary.tsx`와 대칭). organ 재배치는 배럴 깊이만 늘린다. zero-peer 승인은 `.filid` 설정의 scoped exempt와 쌍으로 관리한다.

## Last Updated

2026-08-18 — 최초 계약 작성. 내부 컴포넌트(오류 경계 클래스·기본 메시지)를 organ으로 이동한 #330 구조 정리와 동시 수립.
