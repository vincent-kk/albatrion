# Union Scenarios contract

## Requirements

이 부류는 재사용 가능한 union 동작 데이터와 이름으로 내보내는 장면 목록을 소유한다(60C-01).
장면을 가져올 때 실행을 수행하거나 엔진 의존성을 도입하지 않는다(TEST-010).

WRITE-093과 TEST-077은 검증 계약에서 union 장면을 명시한다. WRITE-098과 WRITE-099는 두 단계 해석과 전이 되먹임도 정하며, 아래 행은 공유 데이터가 표현하는 관찰 가능한 부분만 기록한다.

## API Contracts

U9 렌더 장면은 명시 활성 분기의 왕복·중첩·공유 값과 nullable 조건 계정을 검증한다.
기대값은 LANDING-004·011·018·032·139·207·208에서 가져오며 생성 시 이미 정착한 화면을 관찰한다(TEST-021).

`unionScenarios`는 `index.ts`를 통해 부류의 순서 있는 장면 목록을 내보낸다.
소비자는 주입한 어댑터로 각 스키마와 순서 있는 단계를 실행한다.
데이터는 관찰 가능한 기대값을 기록하며, 엔진·렌더 단언은 소비자가 소유한다.
렌더 장면도 `union.` 주소와 각 최상위 단계의 값·형태 기대값을 공유하며, 분기 왕복의 준비 쓰기와 null 쓰기 직후 관찰을 생략하지 않는다.

## Acceptance Criteria

### union-scene-data — Shared data boundary

- 목록의 모든 장면은 데이터 전용이며 엔진·테스트 러너 가져오기와 독립적이다.
- 장면 이름은 실행 계층 전반에서 재사용 가능한 입력과 기대값을 식별한다.

### union-scene-coverage — Scene evidence

아래 파일 참조는 60C-01이 요구하는 근거의 위치를 명시하며, 각 장면을 그 장면이 검증하는 동작과 원장 계약에 연결한다.

| Scene file | Scene name | Behavior verified | Ledger evidence |
| --- | --- | --- | --- |
| `ambiguous.scenario.ts` | `union.ambiguous` | string/boolean 변환이 모호하면 호출자의 값 1과 0을 유지한다. | WRITE-093, TEST-077 |
| `default-fill.scenario.ts` | `union.default-fill` | 목록 밖 기본값을 값 전체로 로드하고 undefined로 편집한 뒤에는 다시 채우지 않는다. | WRITE-093, TEST-077 |
| `entry-two-step.scenario.ts` | `union.entry-two-step` | reset과 통째 쓰기에서 최종 flag 분기로 원래 값 0을 해석한다. | WRITE-093, WRITE-098, WRITE-099, TEST-077 |
| `feedback-convergent.scenario.ts` | `union.feedback-convergent` | 전이 되먹임 뒤 안정된 문자열 해석에 도달한다. | WRITE-099 |
| `feedback-nonconvergent.scenario.ts` | `union.feedback-nonconvergent` | 되먹임이 수렴하지 않으면 Source B를 커밋하고 전이 예산 초과에 따른 저하 상태를 보고한다. | WRITE-099 |
| `gated-effective-list.scenario.ts` | `union.gated-effective-list` | 같은 커밋에서 게이트가 정한 유효 형 목록으로 쓰인 값을 해석한다. | WRITE-093, TEST-077 |
| `integer.scenario.ts` | `union.integer` | integer 멤버십이 받아들이지 못하는 소수를 문자열로 변환한다. | WRITE-093, TEST-077 |
| `object-array.scenario.ts` | `union.object-array` | 객체·배열 값 전체를 자식 노드 없이 터미널 값으로 유지한다. | WRITE-093, TEST-077 |
| `omit-empty.scenario.ts` | `union.omit-empty` | 빈 문자열·객체·배열 값을 raw 상태에 유지하면서 방출에서는 뺀다. | WRITE-093, TEST-077 |
| `rule-a.scenario.ts` | `union.rule-a` | Rule A에 따라 숫자 문자열의 숫자 멤버를 고른다. | WRITE-093, TEST-077 |

## Last Updated

2026-10-03
