# Derivation Feature Scenarios contract

## Requirements

184라운드 검토안의 G4 표가 이 부류의 범위를 정한다.
controls·exit·derive·union 부류가 이미 가진 장면은 스토리가 가져오고, 이 부류는 기존 장면에 없는 동작만 더한다.
191라운드 공통 결정에 따라 장면 형식을 넓히지 않고, Form 속성(context)과 소비자 전용 상호작용은 사례 상수로 둔다.
장면을 가져올 때 실행을 수행하거나 엔진 의존성을 도입하지 않는다(TEST-010).

## API Contracts

`derivationFeatureScenarios`는 `index.ts`를 통해 이 부류의 순서 있는 장면 목록을 내보낸다.
`resetInteractionStages`는 `/name` 편집과 `/clear` 토글의 순서와 그 뒤 `/name`의 edited·touched, 값을 적는다.
`contextStages`는 Form `context` 값의 순서와 그 뒤 제어 상태, 값, 그 단계만의 onChange 호출 수를 적는다. 첫 단계는 마운트할 때의 맥락이다.

## Acceptance Criteria

### derivation-scene-data — Shared data boundary

- 목록의 모든 장면은 데이터 전용이며 엔진·테스트 러너 가져오기와 독립적이다.
- 장면 이름은 `derivation.` 접두사로 시작하고 모든 최상위 단계에 기대값을 둔다.

### derivation-scene-coverage — Scene evidence

| Scene file | Scene name | Behavior verified | Ledger evidence |
| --- | --- | --- | --- |
| `visible-versus-active.scenario.ts` | `derivation.visible-versus-active` | 같은 토글에서 visible은 숨기기만 하고 출력을 지키며, active는 노드와 출력을 지우고 돌아올 때 원본 값으로 다시 만든다. | CONTROLS-021, CONTROLS-022, LANDING-011 |
| `watch-dependency.scenario.ts` | `derivation.watch-dependency` | 식이 읽지 않는 경로도 watch에 적으면 derived의 의존이 되어, 수동 편집 뒤 그 경로의 변화가 다시 계산한다. | CONTROLS-026, CONTROLS-032, SETTLE-043 |
| `reset-interaction.scenario.ts` | `derivation.reset-interaction` | resetInteraction은 상승 변화에서만 edited·touched를 초기화하고 값과 derived 값은 건드리지 않는다. | CONTROLS-029, SETTLE-006 |
| `context-reference.scenario.ts` | `derivation.context-reference` | `@`가 Form 맥락을 읽고, 맥락 변경은 정착 하나로 제어와 derived를 다시 계산하며, 깊이 같은 새 맥락은 정착을 돌리지 않는다. | CONTROLS-080, 28C-08 |

## Last Updated

2026-10-13
