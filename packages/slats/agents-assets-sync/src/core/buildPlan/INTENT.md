# buildPlan

## Purpose

Produce the declarative action list an applier executes. Compares every manifest entry against what is already installed at the destination the caller resolved, and reports content this package installed earlier but no longer ships. Reads the filesystem; writes nothing.

## Structure

파일 순회와 POSIX 정규화는 해시 계산에서도 필요하므로 공통 소유자인 core의 내부 유틸리티를 재사용합니다. 계획 모듈 안에 별도의 구현을 두지 않습니다.

## Conventions

- `ActionKind` and `ActionTarget` are orthogonal: the verdict does not depend on whether content is a file or a block inside a shared document. Consumers switch on `kind` first, then on `target.kind`.
- Depends on sibling fractals `agentTarget/` (`Destination`, `OrphanScan`) and `markerBlock/` (block-body verdict), both through their `index.ts`. Both edges run one way; the graph stays acyclic.

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
