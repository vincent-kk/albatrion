# Structure Feature Scenarios contract

## Requirements

184라운드 검토안의 G2 표와 186라운드 소유자 답(복합·중첩 동작에 무게)이 이 부류의 범위를 정한다.
장면을 가져올 때 실행을 수행하거나 엔진 의존성을 도입하지 않는다(TEST-010).

## API Contracts

`structureFeatureScenarios`는 `index.ts`를 통해 이 부류의 순서 있는 장면 목록을 내보낸다.
스토리와 e2e 실행기는 같은 장면을 등록된 검증기와 함께 실행한다(스토리는 ajv8 플러그인, e2e는 하네스 검증기).
`errors` 기대값은 부분 계약이며 소비자는 개수와 `toMatchObject`로 대조한다.

## Acceptance Criteria

### structure-scene-data — Shared data boundary

- 목록의 모든 장면은 데이터 전용이며 엔진·테스트 러너 가져오기와 독립적이다.
- 장면 이름은 `structure.` 접두사로 시작하고 모든 최상위 단계에 기대값을 둔다.

### structure-scene-coverage — Scene evidence

| Scene file | Scene name | Behavior verified | Ledger evidence |
| --- | --- | --- | --- |
| `object-properties.scenario.ts` | `structure.object-properties-extras` | 선언 프로퍼티만 노드가 되고 선언되지 않은 키는 extras로 방출되며, required 오류는 자식, 거부된 키는 호스트가 받는다. | FRAGMENT-019, SCHEMA-040, VALIDATE-043 |
| `nested-arrays.scenario.ts` | `structure.nested-array-verbs` | 바깥 배열 동사는 중첩 하위 트리를 통째로 옮기고 안쪽 배열 동사는 형제를 건드리지 않으며, 동사마다 노드 동일성과 스냅숏 자리가 따라간다. | NODE-051, WRITE-095, 18C-105, TEST-018 |
| `batch-verbs.scenario.ts` | `structure.batch-verbs-positional-identity` | batch 안의 배열 동사는 호스트의 통째 쓰기 하나로 한 번 정착하고(변경 통지 한 번), 아이템 동일성은 위치로 재조정된다. | EVENT-013, NODE-051, 62C-01, GOAL-010 |
| `array-constraints.scenario.ts` | `structure.array-constraint-errors` | 배열 수준 keyword는 배열 호스트에, 항목 keyword는 항목 노드에 붙고 동사를 따라 옮겨지며, 기본 omitEmpty에서 빈 배열은 출력에서 빠져 minItems가 판정되지 않는다. | VALIDATE-043, VALUE-034, VALIDATE-001, LANDING-116 |

## Last Updated

2026-10-13
