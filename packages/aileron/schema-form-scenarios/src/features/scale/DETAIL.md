# Scale Feature Scenarios contract

## Requirements

184라운드 검토안의 G10 표가 이 부류의 범위를 정한다. 시간이나 처리량은 단언하지 않는다.
실제 화면에서의 노출은 장면 형식에 없으므로 사례 상수로 두고 소비자가 수행한다(191라운드 공통 결정).
장면을 가져올 때 실행을 수행하거나 엔진 의존성을 도입하지 않는다(TEST-010).

## API Contracts

`scaleFeatureScenarios`는 `index.ts`를 통해 이 부류의 순서 있는 장면 목록을 내보낸다.
`deferredMountOptions`는 가상화 옵션을 평범한 데이터로 적고, `backfill`은 `VirtualizationBackfill`의 문자열 값이다.
`deferredMountStages`의 보기 노출은 실제 뷰포트가 있는 스토리의 사실이다. jsdom의 e2e는 관찰자를 비활성 대역으로 바꾸고, 노출은 focus 명령으로만 확인한다.
`largeArrayTyped`는 스토리가 마지막 항목을 스크롤로 드러낸 뒤 입력하는 글자다.

## Acceptance Criteria

### scale-scene-data — Shared data boundary

- 목록의 모든 장면은 데이터 전용이며 엔진·테스트 러너 가져오기와 독립적이다.
- 장면 이름은 `scale.` 접두사로 시작하고 모든 최상위 단계에 기대값을 둔다.
- 노출 단계는 로드에서 시작하고, 옵션의 backfill은 열거형의 값 하나다.

### scale-scene-coverage — Scene evidence

| Scene file | Scene name | Behavior verified | Ledger evidence |
| --- | --- | --- | --- |
| `deferred-mount.scenario.ts` | `scale.deferred-mount` | 가상화는 모든 노드를 만들고 먼 필드를 자리표시로 미루며, 값 읽기와 검증은 미룬 필드를 포함하고, focus 명령과 화면 노출이 그 필드를 마운트한다. | TEST-020, TEST-021, LANDING-087 |
| `large-array.scenario.ts` | `scale.large-array` | 천 개 항목 배열이 가상화 아래에서 끝 항목 편집, push, remove를 작은 배열과 같게 수행한다. | TEST-020, EVENT-002 |
| `expression-cost.scenario.ts` | `scale.expression-cost` | 한 원천을 읽는 계산 필드 이백 개가 정착 한 번에 따라오고, visible 식은 값을 바꾸지 않고 입력만 숨긴다. | SETTLE-001, CONTROLS-022 |

## Last Updated

2026-10-13
