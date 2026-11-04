# 하위 노드 방문의 공개 기능 — `visitSubtree` 설계(342라운드 확정판)

> 2026-10-15, 원장 관리자. 341라운드 초안을 소유자 342라운드 답으로 확정했다. 원장 항목은 SURFACE-062(근거 SURFACE-009·NODE-043·NODE-020·EVENT-020).

## 1. 이름과 서명

- `NodeSurface.visitSubtree(visitor: (node: FieldNode) => void | boolean): void`, `find`·`findNodes` 옆.
- 이름의 근거: 주체는 호출자가 넘긴 함수이고 그 함수가 노드를 방문한다(visit). `Subtree`는 `setSubtreeState`·`clearSubtreeState`·`resetSubtree`와 같은 가족이라 자기 포함이 이름에서 따라온다. 옵션 객체와 새 공개 형 이름은 두지 않는다(표면 이름 수 그대로).
- 내부 함수는 `walkFieldNodes` → `visitFieldNodes`로 개명해 한 낱말 가족으로 둔다.

## 2. 동작

- 자기 자신부터 전위 순서(부모 먼저, 형제는 `children` 순). visitor가 `false`를 돌려주면 그 노드의 하위만 건너뛰고 형제는 계속한다. 전체 중단·후위 순서는 없다(첫 일치는 `find`·`findNodes`; 후위가 필요해지면 `{ enter, leave }`로 따로).
- 형상에 있는 노드만(NODE-043). 터미널은 잎(NODE-020). 참조로 두 번 닿는 같은 인스턴스는 한 번만. 걷는 중 생긴 노드는 방문을 보장하지 않는다.
- **지연 batch.** 순회 자체는 chain에 들어가지 않는다(읽기 전용 순회는 비용 0이고 전달 중에도 된다). 순회 안에서 첫 쓰기가 chain 진입 지점에 닿는 순간 batch가 열리고(`runtime.batchDepth`), 그 뒤 쓰기는 표시만 되며, 순회가 끝날 때 루트에서 한 번 정착한다(`batch`의 규칙 그대로: 읽기는 직전 커밋 값, 교체 범위는 쓰인 경로의 합, 191C-01). 바깥 batch가 열려 있으면 합류한다. 전달 중(리스너 안)의 쓰기는 평소 규칙대로 리스너 되먹임으로 세어진다(EVENT-016·EVENT-020, 346C-04). visitor가 던지면 `batch`와 같은 규칙(표시된 작업 커밋 뒤 재던짐).
- **떼어진 시작 노드와 정착 밖 진입(346라운드).** 떼어진 노드에서 부르면 NODE-044의 구조 읽기 규칙대로 함께 떼어진 하위 트리를 걷는다(346C-01). 순회 안의 정착 밖 진입 여섯은 순회 끝에 한 번 전달한다(346C-02). 떼어진 노드에 대한 쓰기는 순회·`batch` 안에서도 표시하지 않고 잠복 원본만 고치며, 떼어짐의 판정은 쓰는 시점의 직전 커밋 형상이다(346C-03).
- `FormHandle`에는 두지 않는다(`handle.node?.visitSubtree(fn)`).

## 3. 자리

- 공개 메서드 → write 엔진의 `dispatchVisitSubtree`(순회 중 표시와 지연 batch 열고 닫기) → navigation의 `visitFieldNodes`. 엔진 방향(blueprint ← record ← {navigation, derive} ← settle ← write) 유지.
- 내부 합치기(340라운드): write의 `dispatchSetSubtreeState`·`dispatchClearSubtreeState`, settle의 `walkOwnedFieldNodes` 소비처 열 곳이 `visitFieldNodes(origin, visit, { owned?: boolean })`를 쓴다. `owned`는 `child.parent === node` 간선만(이탈 가지 정리용), 공개하지 않는다. 형제 순서는 정순 통일(SURFACE-062; `deliverWave`가 문서 순서로 정렬하므로 전달 순서는 그대로, 346C-05).

## 4. 기록·문서·시험

- 원장: SURFACE-062(신설), NODE-043 보충. 표면 이름 수 94 그대로, d.ts 표기만 바뀜.
- 문서(fairy08): SPECIFICATION en·ko, README 둘, api-reference, QUICK_REFERENCE의 노드 메서드 표; "순회 안의 쓰기는 끝나고 한 번에 반영된다" 한 줄. write DETAIL에 지연 batch 분기를 적는다.
- 시험(fixy08): 전위 순서·가지치기·자기 포함·형상 한정(가려진 분기 제외)·터미널 잎·참조 중복 없음; 쓰기 없으면 chain 미진입, 첫 쓰기에 batch가 열려 끝에 한 번 정착, 바깥 batch 합류, 전달 중 읽기 순회, visitor 던짐. 내부 합치기의 동작 불변은 subtree state·global-state·settle 시험 전부 통과로.
