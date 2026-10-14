# Plugins Feature Scenarios contract

## Requirements

184라운드 검토안의 G8 표가 이 부류의 범위를 정한다. 표의 넷째 행(플러그인 패키지가 코어 시나리오를 자기 렌더러로 `composeStories`로 다시 쓰는 일)은 08 단계의 몫이라 이 부류에 두지 않는다.
검증기 출처, 렌더러, 던지는 입력은 장면 형식에 없으므로 사례 상수로 두고 소비자가 수행한다(191라운드 공통 결정).
장면을 가져올 때 실행을 수행하거나 엔진 의존성을 도입하지 않는다(TEST-010).

## API Contracts

`pluginsFeatureScenarios`는 `index.ts`를 통해 이 부류의 순서 있는 장면 목록을 내보낸다.
`validatorSourceCases`의 `'none'` 사례는 검증기 플러그인이 등록되지 않은 실행에서만 뜻이 있다. 스토리북은 미리보기가 ajv8 플러그인을 전역으로 등록하므로 이 사례를 e2e에서만 돌린다.
`rendererCases`의 표식은 `<출처>-<자리>` 문자열이고, 소비자 렌더러가 같은 표식을 `data-renderer`로 그린다. 라벨과 오류 렌더러는 합성 API에서만 불리므로 그 사례는 `composed`를 켠다.
`isolationTrigger`는 소비자가 `/broken`에 매핑한 입력이 렌더 중 던지게 하는 값이다.

## Acceptance Criteria

### plugins-scene-data — Shared data boundary

- 목록의 모든 장면은 데이터 전용이며 엔진·테스트 러너 가져오기와 독립적이다.
- 장면 이름은 `plugins.` 접두사로 시작하고 모든 최상위 단계에 기대값을 둔다.
- 사례 라벨은 겹치지 않고, 검증기 팩터리 사례는 보고할 keyword를 가진다.

### plugins-scene-coverage — Scene evidence

| Scene file | Scene name | Behavior verified | Ledger evidence |
| --- | --- | --- | --- |
| `validator-sources.scenario.ts` | `plugins.validator-sources` | Form `validatorFactory`가 등록된 플러그인보다 앞서고, 둘 다 없으면 경고 하나를 받으며, 검증 모드 None은 그 경고를 없앤다. | ERROR-143, VALIDATE-041, VALIDATE-042, ERROR-024 |
| `renderer-replacement.scenario.ts` | `plugins.renderer-replacement` | Form 렌더러 속성이 플러그인 렌더러를 대신하고, Form이 정하지 않은 그룹 렌더러는 FormProvider의 것을 쓰며, 라벨·오류 렌더러는 합성 API가 부른다. | SURFACE-002, SURFACE-003, LANDING-035 |
| `error-isolation.scenario.ts` | `plugins.error-isolation` | 렌더 중 던지는 매핑 입력은 필드 경계가 가두어 대체 화면을 그리고 RENDER_FAILED를 한 번 보고하며, 노드 값과 형제 입력은 그대로 동작한다. | GOAL-059, ERROR-089, ERROR-090 |

## Last Updated

2026-10-13
