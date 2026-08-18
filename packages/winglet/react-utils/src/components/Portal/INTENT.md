# Portal — 위치 재배치 렌더링 시스템

## Purpose

React 컴포넌트 트리 구조를 유지하면서 children을 다른 DOM 위치에 렌더링하는 포털 시스템을 소유한다. compound export(`Portal`, `Portal.with`, `Portal.Anchor`)로 등록·컨텍스트 제공·마운트 위치 지정 세 책임을 하나의 공개 표면에 모은다. 등록/해제 상태 관리는 내부 context organ이 소유한다.

## Conventions

- entry point는 `Portal.with`/`Portal.Anchor`로 조립하는 compound export만 값으로 공개한다 — `Anchor`와 `withPortal`, 조립 이전의 `Portal` 구현은 타입으로만 named export된다.
- Portal 인스턴스의 등록 id는 인스턴스 생애주기 동안 고정된다 — children이 바뀌어도 같은 id로 갱신되어 서브트리가 불필요하게 리마운트되지 않는다.
- Portal은 자신의 트리 위치에는 아무것도 렌더하지 않는다(항상 null 반환); 실제 렌더는 마운트된 Anchor의 DOM 위치에서 일어난다.

## Boundaries

### Always do

- compound export 조립(`Portal.with`, `Portal.Anchor`)과 개별 파일의 named type export를 동기화한다
- 렌더 위치·등록 id 안정성 계약을 바꾸는 변경은 DETAIL.md를 먼저 갱신한다

### Ask first

- 등록/해제 저장 구조(현재 Map 기반) 변경
- 동일 컨텍스트에 여러 Anchor가 동시에 마운트될 때의 동작 정의

### Never do

- Portal 자신의 트리 위치에 children을 직접 렌더하는 경로 추가(null 반환 계약 파기)
- 컨텍스트 값(등록·해제·앵커 지정 함수)을 매 렌더 재생성해 하위 구독자를 불필요하게 리렌더시키는 변경
