# Composition Feature Scenarios contract

## Requirements

184라운드 검토안의 G3 표와 186라운드 소유자 답(검증기 기반 분기 제어 추가)이 이 부류의 범위를 정한다.
장면을 가져올 때 실행을 수행하거나 엔진 의존성을 도입하지 않는다(TEST-010).

## API Contracts

`compositionFeatureScenarios`는 `index.ts`를 통해 이 부류의 순서 있는 장면 목록을 내보낸다.
스토리와 e2e 실행기는 같은 장면을 등록된 검증기와 함께 실행한다(스토리는 ajv8 플러그인, e2e는 하네스 검증기).
`errors` 기대값은 부분 계약이며 소비자는 개수와 `toMatchObject`로 대조한다.
`batch-retention.scenario.ts`의 두 장면은 쓰기 여럿을 담은 batch가 쓴 경로 밖의 꺼진 raw 값을 지우지 않는다는 회귀 계약이다.

## Acceptance Criteria

### composition-scene-data — Shared data boundary

- 목록의 모든 장면은 데이터 전용이며 엔진·테스트 러너 가져오기와 독립적이다.
- 장면 이름은 `composition.` 접두사로 시작하고 모든 최상위 단계에 기대값을 둔다.

### composition-scene-coverage — Scene evidence

| Scene file | Scene name | Behavior verified | Ledger evidence |
| --- | --- | --- | --- |
| `discriminator.scenario.ts` | `composition.discriminator-tag-switch` | 명시 판별 분기 전환이 raw 값을 지키고, 맞는 분기가 없는 판별 값은 분기마다 const 오류를 판별 노드에 남긴다. | FRAGMENT-006, FRAGMENT-048, LANDING-011, VALIDATE-043 |
| `nested-three-levels.scenario.ts` | `composition.nested-oneof-three-levels` | 세 겹 oneOf에서 안쪽 전환은 바깥을 건드리지 않고, 바깥 왕복은 안쪽 raw 값을 모두 되살린다. | FRAGMENT-021, LANDING-011, LANDING-018, LANDING-032 |
| `oneof-anyof.scenario.ts` | `composition.oneof-with-anyof-addons` | oneOf 분기 안 anyOf의 공유 필드가 어느 한 분기라도 켜져 있는 동안 유지되고 바깥 왕복 뒤에도 돌아온다. | LANDING-018, LANDING-032, FRAGMENT-021 |
| `all-of.scenario.ts` | `composition.allof-merged-required` | allOf 항목이 선언·기본값·required를 더하고 required 오류는 빠진 자식이 받는다. | BLUEPRINT-004, LANDING-010, VALIDATE-043 |
| `all-of.scenario.ts` | `composition.allof-constraint-conjunction` | 여러 allOf 항목의 제약이 한 노드에 함께 걸리고, 한 항목이 적은 모순 범위는 검증기로 넘어가 노드를 계속 무효로 둔다. | BLUEPRINT-004, SCHEMA-045, VALIDATE-043 |
| `if-then-else.scenario.ts` | `composition.if-then-else-guard` | 검증기 guard가 수 범위로 then과 else를 고르고 경계값과 비우기를 따른다. | FRAGMENT-003, FRAGMENT-009, GOAL-034, LANDING-018 |
| `if-then-else.scenario.ts` | `composition.if-nested-guard` | allOf 항목마다 둔 독립 guard가 중첩 객체 값을 읽는다. | FRAGMENT-009, FRAGMENT-021, LANDING-018 |
| `if-then-else.scenario.ts` | `composition.if-else-screen-rapid-toggle` | 화면 토글 네 번과 쓰기 하나짜리 batch 뒤에도 then·else 양쪽 raw 값이 남는다. | FRAGMENT-009, LANDING-011, LANDING-018 |
| `validator-branch.scenario.ts` | `composition.oneof-active-without-const` | `controls.active`만 둔 분기는 검증기에 보이지 않아 oneOf가 기각되고, 그 오류는 호스트가 받는다. | FRAGMENT-031, VALIDATE-043 |
| `validator-branch.scenario.ts` | `composition.oneof-active-with-const-required` | 판별 키의 const와 required가 분기 하나만 통과시키고, 맞지 않는 값은 판별 노드에 const 오류를 둘 남긴다. | FRAGMENT-031, VALIDATE-043 |
| `validator-branch.scenario.ts` | `composition.off-branch-error-filter` | 꺼진 oneOf 분기 안의 오류는 노드에 실리지 않고, 전환 뒤에는 새로 켜진 분기를 따라 거른다. | VALIDATE-043 |
| `validator-branch.scenario.ts` | `composition.guard-pattern-reveal` | 입력마다 검증기 guard가 pattern을 판정해 의존 필드를 드러내고, 숨은 동안 그 raw 값을 지킨다. | FRAGMENT-009, GOAL-034, LANDING-018 |
| `batch-retention.scenario.ts` | `composition.batch-keeps-inactive-raw` | 관계없는 필드에 쓰기 둘을 담은 batch 뒤에도 꺼진 then 분기의 raw 값이 남고, 분기를 다시 열면 돌아온다. | LANDING-018, LANDING-032, 26C-10, EVENT-013 |
| `batch-retention.scenario.ts` | `composition.batched-toggle-keeps-edit` | 숨은 then 분기를 한 batch 안의 세 번 토글로 다시 열어도 편집한 값이 돌아오고 기본값으로 다시 채워지지 않는다. | LANDING-011, LANDING-018, EVENT-013 |

## Last Updated

2026-10-13
