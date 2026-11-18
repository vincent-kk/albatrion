# Portal contract

## Requirements

- `Portal`의 children은 Portal 자신의 트리 위치가 아니라, 같은 `Portal.with` 범위에서 마운트된 `Portal.Anchor`의 DOM 위치에 렌더된다.
- Portal은 자신의 React 위치에서 createPortal을 반환한다. children의 타입과 key가 같으면 갱신과 Activity 숨김·표시 사이에 상태를 유지한다.
- 컨텍스트와 이벤트 버블링은 Portal 소스 위치의 React 조상을 따른다. Portal.with 아래에서 소스만 감싸는 프로바이더와 이벤트 핸들러도 적용된다.
- 마운트된 Anchor가 교체되면 포털된 콘텐츠는 새 Anchor 위치로 따라가고, Portal이 언마운트되면 콘텐츠는 제거된다.
- `Portal.with`로 감싼 컴포넌트는 원본 props 전달과 렌더 결과를 변형 없이 유지하며, 동일 props로 재렌더해도 결과가 유지된다.

## API Contracts

- `Portal` — 앵커가 있으면 해당 DOM에 children을 넣는 createPortal 결과를 반환하고, 없으면 null을 반환한다. 서버와 첫 hydration 렌더에는 앵커가 없고 내용은 ref 연결 후 나타난다.
- `Portal.Anchor` — 마운트되는 DOM 엘리먼트를 콜백 ref로 컨텍스트에 보고해 포털 렌더 위치로 지정한다. 표준 div 속성을 전달받으며, 기본 `style`은 `{ display: 'contents' }`이고 `props.style`이 있으면 병합이 아니라 대체된다.
- `Portal.with` — 컴포넌트를 포털 컨텍스트 프로바이더로 감싸 독립된 앵커 범위를 만든다. 반환 컴포넌트는 메모이즈된다.

## Acceptance Criteria

### render-position — Portal·Anchor 렌더 위치

- Portal은 자신의 트리 위치에는 아무것도 렌더하지 않고, children은 마운트된 Anchor의 DOM 위치에 렌더된다.
- 마운트된 Anchor가 다른 Anchor로 교체되면 포털된 콘텐츠는 새 Anchor 위치로 이동한다.
- Portal이 언마운트되면 포털된 콘텐츠는 제거된다.

### subtree-stability — 리렌더 시 서브트리 안정성

- Portal을 감싼 부모가 리렌더되어도 children의 타입과 key가 유지되는 한 포털된 서브트리는 리마운트되지 않는다.
- 소스 전용 프로바이더와 소스 조상 클릭 핸들러는 원시 createPortal과 같은 결과를 낸다.
- 동일 앵커의 독립 포털은 최초 마운트 순서를 유지한다.
- Portal의 children이 교체되면 포털된 콘텐츠는 새 값으로 갱신된다.

### with-portal-provider — compound export의 컨텍스트 제공

- `Portal.with`로 감싼 컴포넌트는 원본 props를 그대로 반영해 렌더되며, 동일 props로 재렌더해도 렌더 결과가 유지된다.

## Boundary Exemptions

### `*.tsx` — compound export 조립에 필요한 공개 peer 유지 (fractal root)

- **Consumers**: `entry-point`
- **Direct import**: `allowed`
- **Reason**: `withPortal.tsx`와 `Anchor.tsx`는 entry point(`index.ts`)가 `Portal.with`/`Portal.Anchor`로 조립하는 원본 구현이다 — 값은 이 조립 지점을 통해서만 공개되고 타입만 named export로 노출된다. organ으로 옮기면 조립 지점과 구현이 분리되어 compound export 계약을 읽기 어렵게 만든다. zero-peer 승인은 `.filid` 설정의 scoped exempt와 쌍이다.

## Last Updated

Portal의 공개 경계·입력 해석·반환값 또는 실패 처리 계약이 바뀔 때 갱신합니다.
