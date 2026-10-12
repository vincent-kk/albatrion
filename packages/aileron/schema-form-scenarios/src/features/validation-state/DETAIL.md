# Validation State Feature Scenarios contract

## Requirements

184라운드 검토안의 G5 표가 이 부류의 범위를 정한다.
191라운드 공통 결정에 따라 장면 형식을 넓히지 않고, Form 속성은 데이터 상수로, 소비자 전용 단언은 소비자의 play와 e2e에 둔다.
장면을 가져올 때 실행을 수행하거나 엔진 의존성을 도입하지 않는다(TEST-010).

## API Contracts

`validationStateFeatureScenarios`는 `index.ts`를 통해 이 부류의 순서 있는 장면 목록을 내보낸다.
사례 상수(`validationModeCases`, `externalErrorStages`, `nodeExternalError`, `showErrorCases`, `forcedShowErrorCase`, `formatErrorCases`, `interactionStateStages`, `submitOutcomes`)는 장면 하나에 대한 Form 속성과 소비자 상호작용의 기대값이다.
검증 모드·표시 정책·상태 칸은 이름(`ValidationModeName`, `ShowErrorName`, `InteractionStateNames`)으로 적고, 소비자가 엔진 열거형으로 바꾼다.
`externalErrorStages`의 `errors`는 형이 금하는 값(null, 객체)도 담으며, 소비자는 형 검사를 거치지 않는 JavaScript 호출자처럼 그대로 넘긴다.
오류 문구 사례의 `catalog`는 keyword별 틀이고 `{이름}`은 issue `details`의 같은 이름 값으로 채우며, 없는 keyword는 null로 바꿔 다음 issue로 넘긴다.

## Acceptance Criteria

### validation-state-scene-data — Shared data boundary

- 목록의 모든 장면은 데이터 전용이며 엔진·테스트 러너 가져오기와 독립적이다.
- 장면 이름은 `validation-state.` 접두사로 시작하고 모든 최상위 단계에 기대값을 둔다.
- 검증 모드와 표시 정책은 사례마다 정확히 한 번 나온다.

### validation-state-scene-coverage — Scene evidence

| Scene file | Scene name | Behavior verified | Ledger evidence |
| --- | --- | --- | --- |
| `validation-modes.scenario.ts` | `validation-state.mode-timing` | OnChange는 입력마다 판정하고 OnRequest는 요청을 기다리며 None은 요청에도 판정이 없다. | VALIDATE-049, VALIDATE-008 |
| `external-errors.scenario.ts` | `validation-state.external-errors` | 루트가 목록 전체를 들고 각 issue는 dataPath로 가며, 다음 목록에서 빠진 경로는 비워지고 배열이 아닌 값은 빈 목록으로 읽는다. 노드의 setExternalErrors와 clearExternalErrors는 그 노드만 바꾼다. | LANDING-210, 79C-01, 178C-01 |
| `show-error.scenario.ts` | `validation-state.show-error` | 표시 정책은 노드가 든 issue의 표시만 정하고, touched는 blur 뒤에 붙으며, 핸들의 showError가 정책보다 앞선다. | GOAL-061, VALUE-022 |
| `format-error.scenario.ts` | `validation-state.format-error` | formatError가 문구를 바꾸고, null이면 다음 issue로 넘어가며, 없으면 검증기 문구를 그린다. | REACT-026 |
| `interaction-state.scenario.ts` | `validation-state.interaction-state` | globalState는 참인 키만 들고, onStateChange는 노드 상태를 바꾼 진입마다 한 번 부른다(전역 키가 0을 넘지 않아도). | VALUE-022, EVENT-062, EVENT-067, LANDING-152, LANDING-153 |
| `submit-rejected.scenario.ts` | `validation-state.submit-rejected` | 핸들 제출은 거부로 돌아오고 싱크에 가지 않으며, Enter 제출의 거부는 호스트 싱크로 가고 onSubmit은 불리지 않는다. | VALIDATE-006, ERROR-139, ERROR-016 |
| `error-routing.scenario.ts` | `validation-state.error-routing` | required issue는 빠진 자식이, 항목 issue는 항목이 받고, 값을 고치면 그 issue만 지워진다. | VALIDATE-043, VALUE-034, VALIDATE-001 |

## Last Updated

2026-10-13
