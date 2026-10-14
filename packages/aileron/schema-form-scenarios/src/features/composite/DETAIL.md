# Composite Scenarios contract

## Requirements

복합 설계서와 검토안 3절이 사례 CX-01부터 CX-24의 범위를 정한다. 소유자 지시대로 단일 동작보다 복합·중첩 동작과 그 타이밍에 힘을 싣는다.
장면을 가져올 때 실행을 수행하거나 엔진 의존성을 도입하지 않는다(TEST-010).
제품 결함은 원장 계약을 기대값으로 적은 `composite.finding-` 장면으로 두고, 소비자가 `it.fails`와 `!test` 스토리로 고정한다.

## API Contracts

`compositeCases`는 `index.ts`를 통해 CX-01부터 CX-24까지 번호 순서의 사례 목록을 내보낸다. 사례는 공유 장면(`scenario`), 평범한 데이터의 Form 속성(`props`), 꼬리 단계(`tail`), 꼬리 시작 값(`tailStart`)을 묶는다.
`CompositeTailStep`의 `write`는 핸들 쓰기라 상호작용 상태를 바꾸지 않고, `type`은 마운트된 입력에 사용자처럼 입력한다. `merge`는 루트 Merge 쓰기, `batch`는 한 batch 안의 경로 쓰기들이다.
`mounted`의 `browserOnly`는 실제 뷰포트에서만 단언한다. jsdom의 e2e는 관찰자를 비활성 대역으로 바꾸므로 그 단계를 건너뛴다.
`reentryTail`의 197C-01 R1은 Merge 쓰기 뒤의 batch 재진입이다. 경로 쓰기는 그 경로의 통째 교체라 다른 종류의 잠복 raw를 지우므로(WRITE-094) R1의 전제가 되지 않는다(211라운드 확인).
`compositeRegressionScenarios`는 CX-08과 CX-14에서 갈라 낸 회귀 장면 목록이다. 211라운드에 결함으로 접수되고 214라운드 고침 뒤 보통 사례가 되었다: 닫히는 분기에서 배열을 늘리는 쓰기가 새 항목 값을 지키는 것, 재귀 $ref의 중첩 인스턴스마다 if/then/else 게이트가 걸리는 것.
`amountInputPlan`, `pluginFormPlan`, `imeSwitchPlan`은 스토리가 브라우저에서 수행하는 입력과 그 기대값이다.

## Acceptance Criteria

### composite-scene-data — Shared data boundary

- 사례는 번호 순서로 스물네 개이며 이름이 겹치지 않고, 모든 최상위 단계에 기대값을 둔다.
- `tailStart`를 둔 사례는 꼬리 단계를 갖고, 회귀 장면은 `composite.` 접두사를 쓰되 번호 사례와 이름이 겹치지 않으며 모든 최상위 단계에 기대값을 둔다.

### composite-scene-coverage — Scene evidence

| Scene file | Scene name | Behavior verified | Ledger evidence |
| --- | --- | --- | --- |
| `cx01-order-form.scenario.ts` | `composite.cx01-order-form` | 판별자가 카드와 계좌 분기를 가르고, 행마다 파생 소계가 따라오며, 배열 동사와 분기 전환이 한 폼에서 겹친다. 꼬리는 제출 거부와 통과를 확인한다. | FRAGMENT-006, NODE-051, VALIDATE-043 |
| `cx02-org-chart.scenario.ts` | `composite.cx02-org-chart` | 가상화 아래 재귀 $ref 조직도에서 미룬 구성원이 마운트 전에 핸들 쓰기를 받고, focus 명령이 그를 드러내며, 입력이 dirty를 만들고 reset이 지운다. | TEST-020, GOAL-061, CONTROLS-029 |
| `cx03-profile.scenario.ts` | `composite.cx03-profile` | null 주소가 고정 자식을 형상에 남긴 채 출력은 null이고, 객체 쓰기가 주소를 승격하며 분기 전환이 비활성 raw를 지킨다. | VALUE-015, LANDING-018, VALIDATE-043 |
| `cx04-amount-input.scenario.ts` | `composite.cx04-amount-input` | 필수 금액의 required와 minimum이 쓰기를 따라 바뀌고, 스토리는 천 단위 서식 입력, 네이티브 숫자 badInput 초안, Enter 제출을 수행한다. | REACT-027, EVENT-003 |
| `cx05-permissions.scenario.ts` | `composite.cx05-permissions` | context 속성이 필드를 읽기 전용으로 만들고 관리자 필드를 숨기되 값은 남기며, 주입이 감사 줄을 쓴다. | CONTROLS-080, CONTROLS-022 |
| `cx06-plugin-form.scenario.ts` | `composite.cx06-plugin-form` | 소비자 그룹 렌더러가 모든 필드를 그리고, 파일 입력의 첨부가 첨부 맵에 들며, 던지는 입력은 그 필드만 격리된다. | GOAL-059, TEST-023 |
| `cx07-setup-wizard.scenario.ts` | `composite.cx07-setup-wizard` | anyOf 항목마다 제 필드를 가르고, 두 항목이 선언한 필드는 어느 하나가 켜진 동안 남으며, prefixItems 튜플이 함께 움직인다. | FRAGMENT-009, WRITE-044 |
| `cx08-switch-with-array-verbs.scenario.ts` | `composite.cx08-switch-with-array-verbs` | 분기가 닫힌 동안 배열 행을 보존하고 돌아올 때 되살리며, 197C-01 R2와 Merge 쓰기 뒤 R1 재진입을 꼬리로 확인한다. | LANDING-018, NODE-051 |
| `cx09-reset-during-validation.scenario.ts` | `composite.cx09-reset-during-validation` | 보류한 검증 결과가 reset 뒤에 도착하면 버려지고, reset은 다시 적재하고 상호작용 상태를 지운다. | EVENT-046, WRITE-044 |
| `cx10-inject-chain-in-batch.scenario.ts` | `composite.cx10-inject-chain-in-batch` | injectTo 사슬이 한 정착 안에서 끝나고, 중간 편집은 뒤쪽만 다시 주입하며, 되먹임이 예산을 넘으면 degraded로 보고하고 폼은 계속 동작한다. | EVENT-013, EVENT-020, EVENT-026, ERROR-080 |
| `cx11-ime-during-switch.scenario.ts` | `composite.cx11-ime-during-switch` | 조합 중인 입력이 분기 전환으로 사라지면 조합 끝이 닫힌 분기에 아무것도 쓰지 않고, 돌아오면 조합 전 raw가 돌아온다. | LANDING-018, REACT-027 |
| `cx12-deferred-dirty-touched.scenario.ts` | `composite.cx12-deferred-dirty-touched` | 필드 백 개의 가상화에서 미룬 필드가 핸들 쓰기를 받고, focus로 마운트된 뒤 입력이 dirty를, blur가 touched를 만들며 reset이 둘을 지운다. | TEST-020, GOAL-061, CONTROLS-029 |
| `cx13-nested-oneof-anyof.scenario.ts` | `composite.cx13-nested-oneof-anyof` | 세 겹으로 중첩된 분기에서 안쪽 전환과 부가 가드는 제 값을 지키고 바깥 전환은 하위 트리 전체를 내렸다가 되살린다. | FRAGMENT-021, LANDING-018 |
| `cx14-recursive-conditions.scenario.ts` | `composite.cx14-recursive-conditions` | 이스케이프한 포인터 키 아래 재귀 if/then/else 트리에서 최상위 토글이 하위 트리를 내렸다가 raw로 되살리고, 깊은 오류는 그 노드에 붙는다. | LANDING-018, SCHEMA-040 |
| `cx15-external-and-validation-errors.scenario.ts` | `composite.cx15-external-and-validation-errors` | 외부 오류가 검증 이슈보다 앞에 오고, 값 수정은 검증 이슈만, 빈 errors 속성은 외부 오류만 지우며, 배열이 아닌 errors는 빈 목록이다. | VALIDATE-043 |
| `cx16-rapid-mixed-toggles.scenario.ts` | `composite.cx16-rapid-mixed-toggles` | controls.active와 if/then/else를 빠르게 섞어 토글해도 active는 값을 지우고 조건 분기는 비활성 raw를 지킨다. | CONTROLS-021, LANDING-018 |
| `cx17-branch-array-item-errors.scenario.ts` | `composite.cx17-branch-array-item-errors` | 항목 경로마다 패턴 이슈가 붙고, 분기 전환이 그 목록을 방출에서 빼며, 가운데 항목 제거가 이슈와 함께 마지막 항목을 당긴다. | LANDING-018, NODE-051, VALIDATE-043 |
| `cx18-switch-recomputes-derived.scenario.ts` | `composite.cx18-switch-recomputes-derived` | 분기 전환은 새로 들어온 노드의 파생 규칙만 즉시 발화하고, 두 분기가 공유하는 노드는 의존 값이 바뀔 때까지 기준값만 받는다. | FRAGMENT-050, CONTROLS-026 |
| `cx19-branch-defaults-and-reset.scenario.ts` | `composite.cx19-branch-defaults-and-reset` | 분기 노드가 생길 때 기본값이 한 번 채워지고, 닫힌 분기의 편집은 보존되며, reset은 새 적재로 모두 지운다. | LANDING-011, LANDING-018, WRITE-044 |
| `cx20-array-of-oneof-items.scenario.ts` | `composite.cx20-array-of-oneof-items` | 배열 항목마다 제 분기를 풀고, 가운데 제거가 마지막 항목을 분기·값·노드 정체성과 함께 당긴다. | NODE-051 |
| `cx21-guard-inside-array-items.scenario.ts` | `composite.cx21-guard-inside-array-items` | 항목 가드가 제 가격을 읽어 승인 필드와 required 이슈를 드러내고, 항목 갱신과 제거가 그 가드를 따라간다. | FRAGMENT-009, NODE-051 |
| `cx22-visible-versus-active-in-branch.scenario.ts` | `composite.cx22-visible-versus-active-in-branch` | 분기 안에서 visible false는 숨기기만 해 값과 검증이 남고, active false는 노드와 값을 지운다. | CONTROLS-021, CONTROLS-022 |
| `cx23-nullable-branch-object.scenario.ts` | `composite.cx23-nullable-branch-object` | null 연락처에서는 채널 분기가 꺼져 있고, 객체 쓰기가 승격하며, 안쪽 채널 전환이 비활성 raw를 지키고 null 쓰기가 다시 내린다. | VALUE-015, LANDING-018 |
| `cx24-enter-submit-and-branch.scenario.ts` | `composite.cx24-enter-submit-and-branch` | 제출은 활성 분기만 판정해 필수 값이 빠진 분기는 거부되고 전환 뒤에는 통과하며, 스토리는 Enter로 제출한다. | VALIDATE-043, ERROR-139 |
| `batch-push-into-closing-branch.scenario.ts` | `composite.batch-push-into-closing-branch` | 닫히는 분기에서 배열을 늘리는 한 쓰기와 그 같은 값의 전체 쓰기가, 분기가 돌아올 때 새 항목까지 되살린다. | EVENT-013, LANDING-018 |
| `recursive-nested-gate.scenario.ts` | `composite.recursive-nested-gate` | 재귀 $ref의 중첩 인스턴스도 제 if/then/else 게이트를 따라 children과 size 가운데 하나만 그린다. | FRAGMENT-009, FRAGMENT-003, LANDING-018 |

## Last Updated

2026-10-13
