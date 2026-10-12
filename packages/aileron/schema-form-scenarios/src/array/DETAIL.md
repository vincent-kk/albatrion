# Array Scenarios contract

## Requirements

이 부류는 재사용 가능한 배열 동작 데이터와 이름으로 내보내는 장면 목록을 소유한다(60C-01).
장면을 가져올 때 실행을 수행하거나 엔진 의존성을 도입하지 않는다(TEST-010).

TEST-018이 배열 검증의 범위를 정한다. 장면 설명이 아래 원장 참조의 근거이며, 관련 원장 보충은 35C-03(다섯 동사), 35C-12(터미널 배열 사본), 37C-01(꼬리 방출 투영), 41C-01(같은 아이템 템플릿 사이에서만 재사용)이다.

## API Contracts

`arrayScenarios`는 `index.ts`를 통해 부류의 순서 있는 장면 목록을 내보낸다.
소비자는 주입한 어댑터로 각 스키마와 순서 있는 단계를 실행한다.
데이터는 관찰 가능한 기대값을 기록하며, 엔진·렌더 단언은 소비자가 소유한다.

일반 코어 표는 위치 재조정, 터미널 동사, Source-B 구조 장면을 제외한다. 전용 명세가 그 장면을 소비하고 상호 작용 상태, raw 사본, 이미 사용한 키의 단언을 더하며, 그 단언은 코어 소비자가 소유한다.

## Acceptance Criteria

### array-scene-data — Shared data boundary

- 목록의 모든 장면은 데이터 전용이며 엔진·테스트 러너 가져오기와 독립적이다.
- 장면 이름은 실행 계층 전반에서 재사용 가능한 입력과 기대값을 식별한다.

### array-scene-coverage — Scene evidence

아래 파일 참조는 60C-01이 요구하는 근거의 위치를 명시하며, 각 장면을 그 장면이 검증하는 동작과 원장 계약에 연결한다.

| Scene file | Scene name | Behavior verified | Ledger evidence |
| --- | --- | --- | --- |
| `clear-slots.scenario.ts` | `array.clear-slots` | 모든 아이템·스냅숏 자리를 비우고 빈 루트 배열을 방출한다. | TEST-018, NODE-051, WRITE-095, VALUE-034 |
| `empty-output.scenario.ts` | `array.empty-output` | 빈 중첩 배열 자리와 빈 배열 루트에서 배열 그릇을 방출한다. | TEST-018, VALUE-034 |
| `extra-becomes-node.scenario.ts` | `array.extra-becomes-node` | 첫 자리를 제거한 뒤 여분 값을 템플릿이 있는 튜플 자리로 옮긴다. | TEST-018, NODE-052, 41C-01 |
| `extras-tail.scenario.ts` | `array.extras-tail` | push·pop에서 템플릿이 없는 꼬리 값을 extras에 보존한다. | TEST-018, NODE-052 |
| `items-prefix.scenario.ts` | `array.items-prefix` | 선언된 자리에는 prefixItems를 쓰고 꼬리에는 반복되는 items 템플릿을 쓴다. | TEST-018, NODE-051, NODE-052 |
| `landing-202.scenario.ts` | `array.landing-202` | 통째 쓰기에서 뒤쪽에 새로 생긴 객체 아이템만 채우고 기존의 빈 아이템은 유지한다. | LANDING-202, LANDING-203 |
| `omit-trailing.scenario.ts` | `array.omit-trailing` | raw 아이템 자리를 유지하면서 방출 꼬리의 null 자리를 자른다. | TEST-018, VALUE-034, 37C-01 |
| `pop-slot.scenario.ts` | `array.pop-slot` | 마지막 아이템과 그 스냅숏 자리만 제거한다. | TEST-018, NODE-051, WRITE-095 |
| `position-reconcile.scenario.ts` | `array.position-reconcile` | 밀린 아이템의 키·노드 참조·dirty 상태·touched 상태를 새 위치에서 유지한다. | TEST-018, NODE-051, 41C-01 |
| `push-slot.scenario.ts` | `array.push-slot` | 기존 identity를 유지하고 push로 넣은 값을 스냅숏에 담으며 하위 트리 reset에서 그 값을 복원한다. | TEST-011, TEST-018, TEST-023, NODE-051, WRITE-099, 26C-02, 35C-03 |
| `remove-slot.scenario.ts` | `array.remove-slot` | 남은 참조를 밀고 제거한 스냅숏 자리를 잘라 낸다. | TEST-018, NODE-051, WRITE-095, 41C-01 |
| `source-b-structure.scenario.ts` | `array.source-b-structure` | 예산 초과 뒤 호출자의 Source B를 복원하고 생성된 아이템을 제거하며 이미 사용한 키를 보존한다. | TEST-018, NODE-051, WRITE-099 |
| `terminal-verbs.scenario.ts` | `array.terminal-verbs` | 아이템 노드를 만들거나 직전 배열을 변경하지 않고 새로운 raw 배열 사본에 다섯 동사를 모두 적용한다. | TEST-018, NODE-005, NODE-053, 35C-03, 35C-12 |
| `update-slot.scenario.ts` | `array.update-slot` | 아이템 identity와 기존 스냅숏을 보존하면서 한 자리에 쓴다. | TEST-018, NODE-051, WRITE-095 |
| `whole-write.scenario.ts` | `array.whole-write` | 기존 자리를 재사용하고 뒤쪽의 새 아이템에는 undefined 스냅숏 자리를 준다. | NODE-051, NODE-053, WRITE-095 |

## Last Updated

2026-10-02
