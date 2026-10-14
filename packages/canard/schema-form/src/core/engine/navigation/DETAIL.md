# navigation 계약

## Requirements

- 의존 방향은 `record < navigation < settle < FieldNode`이다. 탐색은 레코드의 현재 구조만 읽으며, 정착이나 종류별 행을 import하지 않는다(NODE-016·046).
- 내부 탐색 보조를 외부에서 직접 소비하는 것은 허용하지 않으며, 경계 예외도 없다(NODE-016).

## API Contracts

- 진입점은 `find<Self extends FieldNodeRecord<Self>>(origin: Self, pointer?: string | readonly string[] | null): Self | null`과 `findNodes<Self extends FieldNodeRecord<Self>>(origin: Self, pointer?: string | readonly string[] | null): readonly Self[]`, `visitFieldNodes<Self extends FieldNodeRecord<Self>>(origin: Self, visit: (node: Self) => boolean | void, options?: { readonly owned?: boolean }): void`를 이름으로 내보낸다. 시작 노드의 타입이 `Self`이므로 빈 경로는 타입 단언 없이 시작 노드를 돌려준다. 구현은 뿌리에 두지 않고 `utils/query/`(`find`, `findNodes`, 경로 해석)와 `utils/visit/`(`visitFieldNodes`)에 둔다. `find`는 처음 일치하는 노드를 돌려주고, `findNodes`는 `*` 경로에 일치하는 모든 노드를 중복 인스턴스 없이 경로 순서대로 돌려준다. 빈 경로, `null`, 생략은 모두 시작 노드를 뜻한다. `visitFieldNodes`는 시작 노드부터 전위로 방문하고 형제는 `children` 순서를 따른다. `visit`이 `false`를 돌려주면 그 노드의 하위만 건너뛰고 형제는 계속한다. 기본 범위는 현재 형상이며 참조로 다시 닿는 같은 인스턴스는 한 번만 방문한다. `owned: true`는 `child.parent === node`인 소유 간선만 따라가고 떼어진 가지도 걸으며, settle이 이탈·재배치·폐기하는 가지를 정리할 때 쓴다. 자식은 `visit`이 돌아온 뒤 읽으므로 걷는 중 생긴 노드는 방문을 보장하지 않는다(NODE-008·043·046, SURFACE-062).
- 경로의 각 마디는 현재 형상에 있는 자식 집합을 이름으로 따라간다. 형상 밖 노드나 터미널 아래 경로는 `find`가 `null`을, `findNodes`가 빈 결과를 돌려준다. `subnodes`, `variant`, `oneOfIndex` 후보는 탐색하지 않는다(NODE-020·043·054).
- 가상 참조 그룹의 자식 집합은 참조된 형제 노드이다. `find('/period/startDate')`가 `/startDate`의 노드 자체를 돌려줄 수 있으며, 이때 정본 경로는 반환된 노드의 `path`이다. `@`는 식에서 쓰는 토큰일 뿐 노드 경로가 아니다(NODE-048·054).
- 떼어진 참조의 상대 경로는 함께 떼어진 마지막 하위 트리를 보고, 절대 경로는 살아 있는 루트를 본다. 그 참조의 구조 읽기는 마지막 커밋에 고정되며, 쓰기가 일어나도 바뀌지 않는다(NODE-044).

## Acceptance Criteria

### navigation-shape — 형상과 주소

- 현재 형상만 걷는다. 터미널 아래 경로와 형상 밖 경로는 노드가 없는 것으로 처리하고, 가상 별칭으로 찾은 노드의 `path`는 실제 주소이다(NODE-020·043·054).

### navigation-detached — 떼어진 읽기

- 떼어진 하위 트리의 상대 탐색은 마지막 커밋에 고정되고, 절대 탐색은 살아 있는 루트에서 푼다(NODE-044).

## Last Updated

2026-09-29; 정돈-2(2026-10-14).
