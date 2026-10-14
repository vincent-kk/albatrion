# Settle Scenarios contract

## Requirements

이 부류는 재사용 가능한 정착 동작 데이터와 이름으로 내보내는 장면 목록을 소유한다(60C-01).
장면을 가져올 때 실행을 수행하거나 엔진 의존성을 도입하지 않는다(TEST-010).

## API Contracts

렌더 장면은 LANDING-010의 allOf 조건 병합과 TEST-020의 마운트 통지 억제를 검증합니다. 소비자 계측은 e2e 실행기가 소유합니다.

`settleScenarios`는 `index.ts`를 통해 부류의 순서 있는 장면 목록을 내보낸다.
소비자는 주입한 어댑터로 각 스키마와 순서 있는 단계를 실행한다.
데이터는 관찰 가능한 기대값을 기록하며, 엔진·렌더 단언은 소비자가 소유한다.

## Acceptance Criteria

### settle-scene-data — Shared data boundary

- 목록의 모든 장면은 데이터 전용이며 엔진·테스트 러너 가져오기와 독립적이다.
- 장면 이름은 실행 계층 전반에서 재사용 가능한 입력과 기대값을 식별한다.

### settle-scene-coverage — Scene evidence

아래 파일 참조는 60C-01이 요구하는 근거의 위치를 명시하며, 각 장면을 그 장면이 검증하는 동작과 원장 계약에 연결한다.
대시는 장면 주석, 장면을 소비하는 명세·렌더 시험, 장면 이름을 언급한 원장에서 장면별 원장 ID를 찾지 못했음을 뜻한다. 해당 장면은 ID를 추론하지 않고 동작만 기록한다.

| Scene file | Scene name | Behavior verified | Ledger evidence |
| --- | --- | --- | --- |
| `form-reset.scenario.ts` | `settle.form-reset-load` | reset에서 편집 값을 커밋된 초기 폼 값으로 복원하고 안정된 정착을 보고한다. | — |
| `gated-shape.scenario.ts` | `settle.gated-shape` | 형제 게이트가 정한 생김·방출·나감을 그 계기가 된 쓰기 안에서 커밋한다. | — |

## Last Updated

2026-10-03
