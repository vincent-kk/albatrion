# evaluateDeriveRound 계약

## Requirements

- 한 파생 라운드에서 `unsetValue`, `derived`, `injectTo` 규칙의 에지를 판정하고, 대상마다 승자 하나만 남긴 쓰기 후보와 소비할 에지, 개발 모드 기록 항목을 `DeriveRoundDecision`으로 돌려준다. 원본은 바꾸지 않는다(SETTLE-004·028·048·049, ERROR-159).
- 의존은 부모 derive의 `utils/rules/`·`utils/evaluate/`·`types/`와, `blueprint`·`record` 진입점, engine organ의 `sameValue`·경로 해석으로만 향한다. 상호작용 초기화 판정은 가져오지 않는다(NODE-016).

## API Contracts

- `index.ts`는 `evaluateDeriveRound<Self>(root: FieldNodeRecord<Self>, state: DeriveState<Self>): DeriveRoundDecision<Self>`를 이름으로 내보낸다. 부모 derive의 진입점이 이를 다시 내보내고, settle의 파생 라운드 실행기가 쓴다(SETTLE-004·017).

| 종류 순위    |  값 | 판정                                                                                 |
| ------------ | --: | ------------------------------------------------------------------------------------ |
| `unsetValue` |   4 | 참으로 바뀌면 없음 쓰기 후보가 된다(SETTLE-004·028).                                 |
| `derived`    |   3 | 의존 값 튜플이 바뀌고 평가 결과가 `undefined`가 아니면 후보가 된다(SETTLE-004·043).  |
| `injectTo`   |   2 | 원천 방출 값이 바뀌면 함수 결과에 따른 대상별 후보가 된다(SETTLE-004·028, CONTROLS-079). |
| 채움         |   1 | 전이 단계의 후보이며, 새로 생긴 노드의 참인 `unsetValue`보다 순위가 낮다(SETTLE-004·005). |

| 선언 층 순위                |  값 | 판정                                                     |
| --------------------------- | --: | -------------------------------------------------------- |
| 조각 `controls`             |   1 | 그 조각이 직접 선언한 노드에 걸린다(CONTROLS-073·077).   |
| 부모 `controls.fields` 항목 |   2 | 항목이 가리키는 자식에 걸린다(CONTROLS-073·077).         |
| 노드 자신                   |   3 | 그 노드의 선언이 가장 세부적인 층이다(CONTROLS-073·077). |

- 같은 대상에서는 종류 순위가 높은 규칙이 이기고, 종류가 같으면 원천 선언 노드가 트리 전위 문서 순서에서 뒤에 오는 쪽이 이긴다. 같은 노드의 선언끼리는 층이 높은 쪽이 이긴다. 층도 같으면 조각 전순서가 뒤인 쪽이, 같은 `fields` 배열 안에서는 뒤 항목이, 한 `injectTo`가 반환한 대상 중에서는 뒤 대상(객체 키 삽입 순서, 배열 차례)이 이긴다. 순위는 정착 전체에 걸쳐 유지되므로, 앞 라운드에서 높은 순위로 적용된 값을 뒤 라운드의 낮은 순위가 덮어쓰지 못한다. 진 규칙의 에지도 소비하며 충돌 경고는 내지 않는다(SETTLE-004·005, FRAGMENT-049, CONTROLS-073·079).

- `unsetValue`는 거짓에서 참이 될 때 값을 지우고, 참에서 거짓이 될 때는 쓰지 않으며, 이미 참인 새 노드는 채우지 않는다. 식이나 `injectTo` 함수가 예외를 던지거나, 동적으로만 알 수 있는 `injectTo` 대상이 없으면 그 규칙을 해당 라운드의 후보에서 빼고 에지를 소비한다. 이때 정착은 `degraded`이고 `cause: 'expression'`이며, 대상이 없는 경우에는 `cause: 'injectTarget'`이다(SETTLE-004·005·028, CONTROLS-079, ERROR-122·132).

## Acceptance Criteria

### derive-edge — 기준점과 에지 소비

- 로드는 범위 안의 규칙을 발화시키고, 같은 값을 쓰는 일반 쓰기는 발화시키지 않는다. 진 규칙은 다음 라운드에 다시 발화하지 않는다(SETTLE-004·028·046·048·049).

### derive-rank — 대상별 승자

- 한 대상의 승자는 종류, 문서 순서, 선언 층, 조각 순서로 이루어진 표에 따라 정해지며, 정착 안에서 순위가 더 낮은 후속 후보는 적용되지 않는다(SETTLE-004·005, CONTROLS-073·079).

## Last Updated

정돈-3 derive 재구성(2026-10-15).
