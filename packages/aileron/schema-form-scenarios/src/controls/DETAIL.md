# Controls Scenarios contract

## Requirements

이 부류는 재사용 가능한 제어 동작 데이터와 이름으로 내보내는 장면 목록을 소유한다(60C-01).
장면을 가져올 때 실행을 수행하거나 엔진 의존성을 도입하지 않는다(TEST-010).

## API Contracts

U9 렌더 장면은 presentation 전달과 빈 입력의 undefined 방출, 가상 branch 자식의 전체 값 쓰기·활성 왕복을 관찰한다(LANDING-019·034·125·167·196).
캐럿·IME·focus·trim의 소비자 계측은 schema-form의 전용 e2e가 소유하며 데이터 모듈에 React나 spy를 넣지 않는다(TEST-023).

`controlsScenarios`는 `index.ts`를 통해 부류의 순서 있는 장면 목록을 내보낸다.
소비자는 주입한 어댑터로 각 스키마와 순서 있는 단계를 실행한다.
데이터는 관찰 가능한 기대값을 기록하며, 엔진·렌더 단언은 소비자가 소유한다.
렌더 장면도 `controls.` 주소와 각 최상위 단계의 기대값을 공유한다. LANDING-196의 빈 입력은 `clear`로 표현해 코어의 undefined 쓰기와 화면의 실제 입력 비우기가 같은 데이터와 기대값을 소비하게 한다. `states` 장면의 batch는 readOnly 입력 조작을 흉내 내지 않고 호출자의 직접 쓰기를 유지한다.

## Acceptance Criteria

### controls-scene-data — Shared data boundary

- 목록의 모든 장면은 데이터 전용이며 엔진·테스트 러너 가져오기와 독립적이다.
- 장면 이름은 실행 계층 전반에서 재사용 가능한 입력과 기대값을 식별한다.

### controls-scene-coverage — Scene evidence

아래 파일 참조는 60C-01이 요구하는 근거의 위치를 명시하며, 각 장면을 그 장면이 검증하는 동작과 원장 계약에 연결한다.
대시는 장면 주석, 장면을 소비하는 명세·렌더 시험, 장면 이름을 언급한 원장에서 장면별 원장 ID를 찾지 못했음을 뜻한다. 해당 장면은 ID를 추론하지 않고 동작만 기록한다.

| Scene file | Scene name | Behavior verified | Ledger evidence |
| --- | --- | --- | --- |
| `exit-layers.scenario.ts` | `controls.children-exit-policy-layer` | 대상이 나갈 때 children 항목의 나감 정책을 적용하고 보존한 raw 값을 비운다. | — |
| `exit-layers.scenario.ts` | `controls.fragment-exit-policy-layer` | 조각이 꺼질 때 나가는 조각의 나감 정책을 적용한다. | — |
| `exit-layers.scenario.ts` | `controls.expression-exit-previous-commit` | 직전의 살아 있는 커밋에서 나감 정책 식을 읽는다. | — |
| `exit-layers.scenario.ts` | `controls.visible-preserves-value` | 숨겨져 있지만 활성인 선언은 쓸 수 있게 유지하고 방출 값을 보존한다. | — |
| `scope.scenario.ts` | `controls.fragment-scope` | 조각 상태는 그 조각 안의 선언에만 적용한다. | — |
| `scope.scenario.ts` | `controls.root-keys-do-not-inherit` | 루트의 로컬 상태 키가 자식 노드로 전달되지 않게 한다. | — |
| `scope.scenario.ts` | `controls.children-value-layer` | children 항목의 기본값이 일반 선언 기본값을 덮어쓴다. | — |
| `states.scenario.ts` | `controls.lock-or-visibility-and` | 적용되는 각 층의 readOnly·disabled는 OR로, visibility는 AND로 결합한다. | — |
| `states.scenario.ts` | `controls.standard-read-only` | 표준 스키마 readOnly를 로컬 OR 결합에 포함한다. | — |
| `states.scenario.ts` | `controls.children-host-expression` | 지정한 모든 대상에 대해 호스트를 기준으로 children 항목의 식을 평가한다. | — |

## Last Updated

2026-10-03
