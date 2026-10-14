# 하위 노드 방문의 공개 기능 — 설계 초안(341라운드 소유자 요청)

> 2026-10-15, 원장 관리자. 소유자 340·341라운드(순회 한 벌로 합침, 공개 표면 추가)에 대한 설계 초안. 판정이 필요한 곳은 §5에 물음으로 두었고 소유자 답으로 확정한다.

## 1. 근거로 삼은 원장

- SURFACE-009: 경로 조회는 `find(path)`·`findNodes(path)`, 옛 `findAll`은 `findNodes`로. 공개 메서드 이름은 동사 하나이거나 동사+대상이다.
- NODE-043: `find`·`findNodes`·트리 걷기는 형상에 있는 노드만 돌려준다. 형상에 없는 노드는 인스턴스가 없다.
- NODE-020: 터미널 아래 경로는 노드 없음(터미널은 자식이 없다).
- 표면의 "하위 전체" 어휘는 `setSubtreeState`·`clearSubtreeState`·`resetSubtree`로 이미 "subtree"이며, 셋 다 자기 자신을 포함한다(옛 판 `depthFirstSearch(this, …)`, 새 판 `dispatchSetSubtreeState`의 스택이 `node`부터 시작).
- 읽기 조회(`find`·`findNodes`)는 전달 경계 검사를 하지 않는다(navigation에는 `assertNotInDelivery`가 없음). 쓰기는 각 명령의 디스패치가 검사한다.

## 2. 이름

권고 `walkSubtree`. 까닭: 표면의 하위 전체 어휘가 subtree이고, 내부 구현 이름이 `walkFieldNodes`라 동사가 같다. 다른 후보는 `visitSubtree`(방문자 패턴 어휘), `forEachNode`(배열 어휘라 순서·중단 의미가 약함).

## 3. 자리와 동작

- 자리: `NodeSurface`의 메서드(`find`·`findNodes` 옆). 런타임 `FieldNode`는 `find`처럼 navigation 관문의 `walkFieldNodes`에 위임한다. `FormHandle`에는 두지 않는다(루트 노드를 얻어 부르면 된다).
- 서명(초안): `walkSubtree(visit: (node: FieldNode) => void | false, option?: { order?: 'pre' | 'post' }): void`.
  - 자기 자신부터 방문한다(subtree 어휘와 같음).
  - 기본은 전위(부모 먼저, 형제는 `children` 순서). `visit`가 `false`를 돌려주면 그 노드의 하위는 건너뛴다(가지치기).
  - 형상에 있는 노드만(NODE-043). 터미널은 잎. 참조로 두 번 닿는 같은 인스턴스는 한 번만 방문한다(내부 `seen`).
  - 읽기 조회이므로 전달 중에도 부를 수 있다. `visit` 안의 쓰기는 평소 명령과 같은 디스패치 규칙을 따른다(여러 노드에 쓰면 `batch` 권장). 걷는 중 형상이 바뀌면 각 노드의 자식은 그 노드를 방문하는 시점의 목록을 따른다 — 걷는 중 생긴 노드는 방문을 보장하지 않는다.
- 내부 합치기(340라운드): write의 subtree state 디스패치 둘과 settle의 `walkOwnedFieldNodes` 소비처 열 곳이 같은 `walkFieldNodes(origin, visit, { owned?: boolean })`를 쓴다. `owned`는 `child.parent === node`인 간선만 따라가며(이탈 가지 정리용) 공개 메서드에는 노출하지 않는다.

## 4. 기록과 문서

- 원장: SURFACE 새 항목(이름·서명·순서·가지치기·형상 한정), NODE-043 보충(공개 트리 걷기가 그 규칙을 따름). 표면 이름 수 94는 그대로(메서드 추가는 최상위 이름이 아님), d.ts 표기만 바뀐다.
- 문서: SPECIFICATION en·ko, README 둘, api-reference, QUICK_REFERENCE의 노드 메서드 표(fairy08). 플러그인 영향 없음.
- 시험: 전위 순서·가지치기·자기 포함·형상 한정(가려진 분기 제외)·터미널 잎·참조 중복 방문 없음·걷는 중 쓰기. 내부 합치기의 동작 불변은 기존 subtree state·settle 시험 전부 통과로.

## 5. 소유자 판정이 필요한 것

1. 이름: `walkSubtree`(권고) / `visitSubtree` / 다른 이름.
2. 자기 자신 포함: 포함(권고, subtree 어휘와 일치) / 하위만.
3. 가지치기: `visit`의 `false` 반환으로 하위 건너뛰기(권고, 내부 구현이 이미 씀) / 없음.
4. 순서 옵션: 전위만(권고, 단순) / `order: 'pre' | 'post'`(옛 `depthFirstSearch`는 후위가 기본이었음).
5. `FormHandle` 편의 메서드: 두지 않음(권고) / 둠.
6. 내부 합치기의 형제 순서(fixy08 보고): 지금 `setSubtreeState`·`clearSubtreeState`는 스택 때문에 형제를 역순으로 방문해, 한 파동 안에서 서로 다른 노드의 `UpdateState` 리스너가 듣는 순서가 마지막 자식부터다. 어느 문서에도 적히지 않은 부수 효과다. (가) 정순으로 통일(권고; find·findNodes·공개 walk와 같은 순서, 전체 시험 통과로 보임) / (나) 역순 유지를 위한 `order` 옵션을 내부에 둠(바이트 동일, 옵션의 존재 이유가 부수 효과 보존뿐).
