# Portal contract

## Requirements

- `Portal`에 등록된 children은 Portal 자신의 트리 위치가 아니라, 같은 `Portal.with` 범위에서 마운트된 `Portal.Anchor`의 DOM 위치에 렌더된다.
- Portal 인스턴스의 등록 id는 인스턴스 생애주기 동안 고정되어, children이 바뀌어도 서브트리가 리마운트되지 않고 갱신만 된다.
- 마운트된 Anchor가 교체되면 포털된 콘텐츠는 새 Anchor 위치로 따라가고, Portal이 언마운트되면 콘텐츠는 제거된다.
- `Portal.with`로 감싼 컴포넌트는 원본 props 전달과 렌더 결과를 변형 없이 유지하며, 동일 props로 재렌더해도 결과가 유지된다.

## API Contracts

- `Portal` — children을 등록하고 자신은 항상 `null`을 반환한다. 등록 id는 마운트 시 한 번 생성되어 고정되며, children이 바뀌면 같은 id로 재등록되고, 언마운트 시 해당 id를 해제한다.
- `Portal.Anchor` — 마운트되는 DOM 엘리먼트를 콜백 ref로 컨텍스트에 보고해 포털 렌더 위치로 지정한다. 표준 div 속성을 전달받으며, 기본 `style`은 `{ display: 'contents' }`이고 `props.style`이 있으면 병합이 아니라 대체된다.
- `Portal.with` — 컴포넌트를 포털 컨텍스트 프로바이더로 감싸 독립된 등록/해제 범위를 만든다. 반환 컴포넌트는 메모이즈된다.

## Acceptance Criteria

### render-position — Portal·Anchor 렌더 위치

- Portal은 자신의 트리 위치에는 아무것도 렌더하지 않고, children은 마운트된 Anchor의 DOM 위치에 렌더된다.
- 마운트된 Anchor가 다른 Anchor로 교체되면 포털된 콘텐츠는 새 Anchor 위치로 이동한다.
- Portal이 언마운트되면 포털된 콘텐츠는 제거된다.

### subtree-stability — 리렌더 시 서브트리 안정성

- Portal을 감싼 부모가 리렌더되어도 등록 id가 유지되는 한 포털된 서브트리는 리마운트되지 않는다.
- Portal의 children이 교체되면 포털된 콘텐츠는 새 값으로 갱신된다.

### with-portal-provider — compound export의 컨텍스트 제공

- `Portal.with`로 감싼 컴포넌트는 원본 props를 그대로 반영해 렌더되며, 동일 props로 재렌더해도 렌더 결과가 유지된다.

## Boundary Exemptions

### `*.tsx` — compound export 조립에 필요한 공개 peer 유지 (fractal root)

- **Consumers**: `entry-point`
- **Direct import**: `allowed`
- **Reason**: `withPortal.tsx`와 `Anchor.tsx`는 entry point(`index.ts`)가 `Portal.with`/`Portal.Anchor`로 조립하는 원본 구현이다 — 값은 이 조립 지점을 통해서만 공개되고 타입만 named export로 노출된다. organ으로 옮기면 조립 지점과 구현이 분리되어 compound export 계약을 읽기 어렵게 만든다. zero-peer 승인은 `.filid` 설정의 scoped exempt와 쌍이다.

## Last Updated

2026-08-18 — 최초 계약 작성
