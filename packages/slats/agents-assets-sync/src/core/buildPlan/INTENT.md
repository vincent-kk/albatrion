# buildPlan

## Purpose

적용기가 실행하는 선언적 액션 목록을 만듭니다. 각 매니페스트 항목을 호출자가 해석한 목적지에 설치된 내용과 비교하고, 이 패키지가 이전에 설치했지만 더 이상 제공하지 않는 내용을 보고합니다. 파일시스템을 읽으며 쓰기는 수행하지 않습니다.

## Structure

파일 순회와 POSIX 정규화는 해시 계산에서도 필요하므로 공통 소유자인 core의 내부 유틸리티를 재사용합니다. 계획 모듈 안에 별도의 구현을 두지 않습니다.

## Conventions

- `ActionKind`와 `ActionTarget`은 독립적입니다. 내용이 파일인지 공유 문서 안의 블록인지에 따라 판정이 달라지지 않습니다. 소비자는 `kind`로 먼저 분기한 뒤 `target.kind`로 분기합니다.
- 형제 프랙탈 `agentTarget/`(`Destination`, `OrphanScan`)와 `markerBlock/`(블록 본문 판정)에 각각의 `index.ts`를 통해 의존합니다. 두 의존 방향은 단방향이며 그래프에 순환을 만들지 않습니다.

## Boundaries

### Always do

- 매니페스트 항목과 발견한 orphan 각각에 대해 액션을 최대 하나만 만듭니다.
- warn-diverged와 force 없이 발견한 orphan은 requiresForce를 설정합니다.
- 목적지가 없는 매니페스트 항목은 건너뜁니다. 목적지 부재는 종류 필터에 의해 제외되었다는 신호입니다.

### Ask first

- ActionKind 추가 — 모든 렌더러와 적용기가 같은 의미를 처리해야 합니다.
- 호출자가 제공한 orphan 탐색 범위 밖을 검사하도록 확장

### Never do

- 계획을 실제로 적용 — 이 모듈은 읽기 전용이며 적용 책임은 injectDocs에 있습니다.
- 적용·명령·UI 계층에 역으로 의존
