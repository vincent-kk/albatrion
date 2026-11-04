# Derive Scenarios contract

## Requirements

이 부류는 재사용 가능한 파생 동작 데이터와 이름으로 내보내는 장면 목록을 소유한다(60C-01).
장면을 가져올 때 실행을 수행하거나 엔진 의존성을 도입하지 않는다(TEST-010).

## API Contracts

U9 렌더 장면은 의존 에지의 파생 사슬, 형제·부모·배열 주입과 명시 분기 활성의 동기 정착을 관찰한다(LANDING-004·014·022·030).
null 조상 아래 자동 쓰기는 자식 화면의 값을 갱신해도 조상 null을 승격하지 않는다(LANDING-139·166).

`deriveScenarios`는 `index.ts`를 통해 부류의 순서 있는 장면 목록을 내보낸다.
소비자는 주입한 어댑터로 각 스키마와 순서 있는 단계를 실행한다.
데이터는 관찰 가능한 기대값을 기록하며, 엔진·렌더 단언은 소비자가 소유한다.
렌더 장면도 `derive.` 주소와 각 최상위 단계의 기대값을 공유하며, 의존하지 않는 에지 변경 전에 수동 편집 값이 저장됐는지 관찰한다(LANDING-014·163).

## Acceptance Criteria

### derive-scene-data — Shared data boundary

- 목록의 모든 장면은 데이터 전용이며 엔진·테스트 러너 가져오기와 독립적이다.
- 장면 이름은 실행 계층 전반에서 재사용 가능한 입력과 기대값을 식별한다.

### derive-scene-coverage — Scene evidence

아래 파일 참조는 60C-01이 요구하는 근거의 위치를 명시하며, 각 장면을 그 장면이 검증하는 동작과 원장 계약에 연결한다.
대시는 장면 주석, 장면을 소비하는 명세·렌더 시험, 장면 이름을 언급한 원장에서 장면별 원장 ID를 찾지 못했음을 뜻한다. 해당 장면은 ID를 추론하지 않고 동작만 기록한다.

| Scene file | Scene name | Behavior verified | Ledger evidence |
| --- | --- | --- | --- |
| `budget.scenario.ts` | `derive.feedback-budget` | 상한이 있는 되먹임 라운드 뒤 파생 예산 초과에 따른 저하 상태를 보고한다. | — |
| `edges.scenario.ts` | `derive.derived-edge-and-reset` | 새 원천 에지나 로드가 파생 값을 줄 때까지 호출자의 편집을 보존한다. | — |
| `edges.scenario.ts` | `derive.unset-load-and-runtime-edge` | 로드를 포함한 각 상승 에지에서 참인 unset 조건을 소비한다. | — |
| `edges.scenario.ts` | `derive.same-target-rank` | 같은 대상에서는 파생 값이 주입 후보보다 우선한다. | — |
| `edges.scenario.ts` | `derive.inject-to-on-source-edge` | 원천 입력을 대체하지 않고 방출된 원천 에지에서 주입하며, reset은 로드 에지를 발화한다. | — |
| `edges.scenario.ts` | `derive.disable-automatic-writes-load` | 자동 쓰기를 억제한 로드에서는 호출자 데이터를 유지하고 이후 원천 에지에서 자동 쓰기를 재개한다. | — |
| `injection.scenario.ts` | `derive.reset-subtree-inject-scope` | 주입 대상이 바깥에 있어도 로드한 하위 트리 안의 원천만 발화한다. | — |
| `injection.scenario.ts` | `derive.undefined-injection-stops` | undefined 주입 후보는 대상에 쓰지 않고 소비한 뒤 다음 에지에서 재개한다. | — |

## Last Updated

2026-10-03
