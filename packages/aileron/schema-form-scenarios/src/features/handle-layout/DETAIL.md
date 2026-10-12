# Handle Layout Feature Scenarios contract

## Requirements

184라운드 검토안의 G7 표가 이 부류의 범위를 정한다.
핸들 명령, 레이아웃, Provider 계층, prop 교체는 장면 형식에 없으므로 사례 상수로 두고 소비자가 수행한다(191라운드 공통 결정).
장면을 가져올 때 실행을 수행하거나 엔진 의존성을 도입하지 않는다(TEST-010).

## API Contracts

`handleLayoutFeatureScenarios`는 `index.ts`를 통해 이 부류의 순서 있는 장면 목록을 내보낸다.
`handleCommandStages`의 포커스와 선택 범위는 Chromium의 사실이다. jsdom의 `select()`는 포커스를 옮기지 않으므로 e2e는 대상 입력의 선택 범위만 대조한다.
`layoutPlan`은 소비자 레이아웃의 경로 배치와 입력 뒤 두 복사본의 값을 적는다.
`providerLayers`는 FormProvider와 Form의 props, 병합 뒤의 제어 상태와 메시지 표시를 적는다.
`propReplacementStages`는 누적되는 prop 교체와 reset 여부, 그 뒤의 출력과 노드 동일성을 적는다.

## Acceptance Criteria

### handle-layout-scene-data — Shared data boundary

- 목록의 모든 장면은 데이터 전용이며 엔진·테스트 러너 가져오기와 독립적이다.
- 장면 이름은 `handle-layout.` 접두사로 시작하고 모든 최상위 단계에 기대값을 둔다.
- prop 교체 단계는 라벨이 겹치지 않고 마운트 단계에서 시작한다.

### handle-layout-scene-coverage — Scene evidence

| Scene file | Scene name | Behavior verified | Ledger evidence |
| --- | --- | --- | --- |
| `handle-round-trip.scenario.ts` | `handle-layout.handle-round-trip` | 핸들 setValue가 값 전체를 쓰고 validate가 노드의 issue를 돌려주며, reset은 커밋된 props를 다시 로드하고 판정을 비운다. | WRITE-044 |
| `handle-commands.scenario.ts` | `handle-layout.handle-commands` | focus·select·refresh는 값을 쓰지 않는 노드 명령이고, 없는 경로는 아무것도 하지 않으며, refresh는 노드와 값을 두고 그 입력만 다시 마운트한다. | EVENT-063, EVENT-041, LANDING-209 |
| `layout-composition.scenario.ts` | `handle-layout.layout-composition` | children 함수가 경로별 Label·Input·Error·Render를 배치하고, 빠진 필드는 그리지 않아도 출력에 남으며, 한 경로의 두 입력은 타이핑 중 각자의 초안을 든다. | REACT-027, EVENT-042, LANDING-039 |
| `provider-layers.scenario.ts` | `handle-layout.provider-layers` | Form 맥락이 Provider 맥락을 키별로 덮고, Form이 정하지 않은 Provider 설정은 그 아래에 적용된다. | CONTROLS-080 |
| `prop-replacement.scenario.ts` | `handle-layout.prop-replacement` | prop 교체만으로는 다시 로드하지 않고 reset이 커밋된 props를 로드하며, 같은 스키마는 노드를 두고 다른 스키마는 트리를 새로 만든다. | WRITE-043, WRITE-044 |

## Last Updated

2026-10-13
