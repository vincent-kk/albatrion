# Portal — 위치 재배치 렌더링 시스템

## Purpose

React 컴포넌트 트리 구조를 유지하면서 children을 다른 DOM 위치에 렌더링하는 포털 시스템을 소유한다. compound export(`Portal`, `Portal.with`, `Portal.Anchor`)로 렌더·컨텍스트 제공·마운트 위치 지정 세 책임을 하나의 공개 표면에 모은다. 앵커 상태 관리는 내부 context organ이 소유한다.

## Conventions

- entry point는 `Portal.with`/`Portal.Anchor`로 조립하는 compound export만 값으로 공개한다 — `Anchor`와 `withPortal`, 조립 이전의 `Portal` 구현은 타입으로만 named export된다.
- children의 타입과 key가 같으면 부모 갱신과 Activity 숨김·표시 사이에 서브트리 상태를 유지한다.
- Portal은 소스 React 위치에서 createPortal을 반환하고 DOM 콘텐츠는 마운트된 Anchor에 둔다. 컨텍스트와 이벤트는 소스 React 조상을 따른다.

## Boundaries

### Always do

- compound export 조립(`Portal.with`, `Portal.Anchor`)과 개별 파일의 named type export를 동기화한다
- 렌더 위치·서브트리 안정성 계약을 바꾸는 변경은 DETAIL.md를 먼저 갱신한다

### Ask first

- 소스 React 소유권과 앵커 상태 전달 구조 변경
- 동일 컨텍스트에 여러 Anchor가 동시에 마운트될 때의 동작 정의

### Never do

- Portal 소스의 DOM 위치에 children을 직접 배치하는 경로 추가
- 앵커 지정 함수를 매 렌더 재생성해 하위 구독자를 불필요하게 리렌더시키는 변경
