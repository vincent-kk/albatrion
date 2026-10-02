# Validation Scenarios contract

## Requirements

이 부류는 재사용 가능한 검증 동작 데이터와 이름으로 내보내는 장면 목록을 소유한다(60C-01).
장면을 가져올 때 실행을 수행하거나 엔진 의존성을 도입하지 않는다(TEST-010).

코어 소비자의 `scenario-validation` 계약(VALIDATE-043, TEST-019·023)이 이 목록 전체를 관찰 어댑터로 실행하고, 코어의 같은 ajv 경로 비교도 이 목록 전체를 사례로 읽는다.
ajv 플러그인은 이 패키지에 개발 의존을 두지 않는다는 소유자 결정에 따라 비교 사례를 자기 시험 안에 둔다(05 실행 기록 U12b).

## API Contracts

`validationScenarios`는 `index.ts`를 통해 부류의 순서 있는 장면 목록을 내보낸다.
소비자는 주입한 어댑터로 각 스키마와 순서 있는 단계를 실행한다.
데이터는 방출 값·형상·노드별 `errors`를 관찰 가능한 기대값으로 기록하며, 엔진·렌더 단언과 독립 검증기와의 판정 비교는 소비자가 소유한다.

## Acceptance Criteria

### validation-scene-data — Shared data boundary

- 목록의 모든 장면은 데이터 전용이며 엔진·테스트 러너 가져오기와 독립적이다.
- 장면 이름은 실행 계층 전반에서 재사용 가능한 입력과 기대값을 식별한다.

### validation-scene-coverage — Scene evidence

아래 파일 참조는 60C-01이 요구하는 근거의 위치를 명시하며, 각 장면을 그 장면이 검증하는 동작과 원장 계약에 연결한다.

| Scene file | Scene name | Behavior verified | Ledger evidence |
| --- | --- | --- | --- |
| `if-only.scenario.ts` | `validation.if-only-oneof-invalid` | `if`만으로 가르는 `oneOf`의 두 분기가 함께 통과하면 폼 출력도 작성 스키마의 무효 판정을 유지해 루트에 `oneOf` 오류를 둔다. | VALIDATE-036 |
| `union-type.scenario.ts` | `validation.union-type-error-on-node` | union 형 자리에 어느 형에도 맞지 않는 값을 쓰면 그 자리가 남고 형 오류가 그 union 노드에 귀속된다. | VALIDATE-051 |

## Last Updated

2026-10-02
