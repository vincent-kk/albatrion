# navigation 계약

## Requirements

- 의존 방향은 `record < navigation < settle < SchemaNode`입니다. 탐색은 레코드의 현재 구조만 읽고 정착이나 종류별 행을 import하지 않습니다(NODE-016·046).
- 내부 탐색 보조의 외부 직접 소비는 허용하지 않으며 경계 예외는 없습니다(NODE-016).

## API Contracts

- 진입점은 `find<Self extends SchemaNodeRecord<Self>>(origin: Self, pointer: string | readonly string[] | null): Self | null`, `findNodes<Self extends SchemaNodeRecord<Self>>(origin: Self, pointer: string | readonly string[] | null): readonly Self[]`, `walkSchemaNodes<Self extends SchemaNodeRecord<Self>>(origin: Self, visit: (node: Self) => void): void`를 이름으로 내보냅니다. 시작 노드가 `Self`이므로 빈 경로는 단언 없이 시작 노드를 돌려줍니다. 구현은 뿌리에 두지 않고 `utils/query/`(`find`·`findNodes`와 경로 해석)와 `utils/walk/`(`walkSchemaNodes`)에 둡니다. `find`는 첫 일치 노드, `findNodes`는 `*` 경로의 모든 일치 노드를 중복 인스턴스 없이 경로 순서대로 돌려줍니다. 빈 경로와 `null`은 시작 노드입니다. `walkSchemaNodes`는 부모를 먼저 방문합니다(NODE-008·043·046).
- 경로의 각 마디는 현재 형상에 있는 자식 집합을 이름으로 따라갑니다. 형상 밖 노드와 터미널 아래 경로는 `find`가 `null`, `findNodes`가 빈 결과를 돌려줍니다. `subnodes`·`variant`·`oneOfIndex` 후보 탐색은 하지 않습니다(NODE-020·043·054).
- 가상 참조 그룹의 자식 집합은 참조된 형제 노드입니다. `find('/period/startDate')`가 `/startDate`의 노드 자체를 돌려줄 수 있으며, 그때 정본 경로는 반환 노드의 `path`입니다. `@`는 식 토큰일 뿐 노드 경로가 아닙니다(NODE-048·054).
- 떼어진 참조의 상대 경로는 함께 떼어진 마지막 하위 트리를, 절대 경로는 살아 있는 루트를 봅니다. 그 참조의 구조 읽기는 마지막 커밋에 고정되고 쓰기로 바뀌지 않습니다(NODE-044).

## Acceptance Criteria

### navigation-shape — 형상과 주소

- 현재 형상만 걷고, 터미널·형상 밖 경로는 노드 없음이며, 가상 별칭으로 찾은 노드의 `path`는 실제 주소입니다(NODE-020·043·054).

### navigation-detached — 떼어진 읽기

- 떼어진 하위 트리의 상대 탐색은 마지막 커밋에 고정되고 절대 탐색은 살아 있는 루트에서 풉니다(NODE-044).

## Last Updated

2026-09-29
