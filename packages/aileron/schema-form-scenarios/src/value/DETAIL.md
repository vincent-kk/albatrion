# Value Scenarios contract

## Requirements

이 부류는 재사용 가능한 값 동작 데이터와 이름으로 내보내는 장면 목록을 소유한다(60C-01).
장면을 가져올 때 실행을 수행하거나 엔진 의존성을 도입하지 않는다(TEST-010).

## API Contracts

`valueScenarios`는 `index.ts`를 통해 부류의 순서 있는 장면 목록을 내보낸다.
소비자는 주입한 어댑터로 각 스키마와 순서 있는 단계를 실행한다.
데이터는 관찰 가능한 기대값을 기록하며, 엔진·렌더 단언은 소비자가 소유한다.

## Acceptance Criteria

### value-scene-data — Shared data boundary

- 목록의 모든 장면은 데이터 전용이며 엔진·테스트 러너 가져오기와 독립적이다.
- 장면 이름은 실행 계층 전반에서 재사용 가능한 입력과 기대값을 식별한다.

### value-scene-coverage — Scene evidence

아래 파일 참조는 60C-01이 요구하는 근거의 위치를 명시하며, 각 장면을 그 장면이 검증하는 동작과 원장 계약에 연결한다.
대시는 장면 주석, 장면을 소비하는 명세·렌더 시험, 장면 이름을 언급한 원장에서 장면별 원장 ID를 찾지 못했음을 뜻한다. 해당 장면은 ID를 추론하지 않고 동작만 기록한다.

| Scene file | Scene name | Behavior verified | Ledger evidence |
| --- | --- | --- | --- |
| `omit-empty.scenario.ts` | `value.omit-empty-object` | 기본 설정에서는 빈 객체 자식을 방출에서 빼고 omitEmpty를 끈 빈 자식은 방출한다. | — |
| `root-output.scenario.ts` | `value.root-output` | 폼 전체 쓰기에서 자식 값을 해석하고 이후의 자식 편집을 루트 방출에 반영한다. | — |

## Last Updated

2026-10-02
