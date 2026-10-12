# Values Feature Scenarios contract

## Requirements

184라운드 검토안의 G1 표가 이 부류의 범위를 정한다.
장면을 가져올 때 실행을 수행하거나 엔진 의존성을 도입하지 않는다(TEST-010).

## API Contracts

`valuesFeatureScenarios`는 `index.ts`를 통해 이 부류의 순서 있는 장면 목록을 내보낸다.
스토리와 e2e 실행기는 같은 장면을 등록된 검증기와 함께 실행한다(스토리는 ajv8 플러그인, e2e는 하네스 검증기).
`errors` 기대값은 부분 계약이며 소비자는 개수와 `toMatchObject`로 대조한다.
`valuesFindingScenarios`는 원장이 정하지 않은 사용성 간극을 소유자 질문으로 적은 장면이다. 기대값은 화면이 보여야 할 값이며 지금 기본 입력에서 실패하므로, 스토리는 시험 실행에서 빼고 e2e는 입력 요소를 직접 대조하는 `it.fails`로 고정한다.

## Acceptance Criteria

### values-scene-data — Shared data boundary

- 목록의 모든 장면은 데이터 전용이며 엔진·테스트 러너 가져오기와 독립적이다.
- 장면 이름은 `values.` 접두사로 시작하고 모든 최상위 단계에 기대값을 둔다.

### values-scene-coverage — Scene evidence

| Scene file | Scene name | Behavior verified | Ledger evidence |
| --- | --- | --- | --- |
| `primitive-inputs.scenario.ts` | `values.primitive-inputs` | 원시 다섯 종류의 기본 입력이 노드 값과 출력에 닿고, 비운 nullable 아닌 입력은 undefined를 보내며, 통째 쓰기는 수·정수 노드의 숫자 문자열을 변환한다. | TEST-025, REACT-027, LANDING-196, WRITE-075 |
| `literal-and-format.scenario.ts` | `values.literal-and-format` | enum·수 enum·형 없는 const가 리터럴 종류를 지키고 위반은 그 노드가 받으며, 기본 설정의 검증기는 format을 검사하지 않는다. | LANDING-208, BLUEPRINT-050, SCHEMA-002, VALIDATE-043 |
| `default-layers.scenario.ts` | `values.default-layers` | `controls.default`가 `default`보다 앞서고, 로드된 `{}`가 호스트 default를 막지 않으며, 채움은 로드·reset·resetSubtree에서만 일어난다. | CONTROLS-025, SCHEMA-002, LANDING-144, WRITE-090, SETTLE-049 |
| `recursive-tree.scenario.ts` | `values.recursive-tree` | 재귀 `$ref` 트리가 값의 깊이만큼 펼쳐지고, 깊은 곳에서도 경로·순차 배열 동사의 동일성·오류 귀속이 유지된다. | TEST-025, 62C-01, VALIDATE-043 |

### values-open-questions — Usability gaps the ledger does not decide

| Scene file | Scene name | Gap observed | Why the ledger does not decide it |
| --- | --- | --- | --- |
| `finding-restricted-input.scenario.ts` | `values.finding-restricted-input-out-of-domain` | 문자열 enum 선택 상자는 빈 선택지가 없어 집합 밖 값을 첫 선택지로 그리고, 날짜 입력은 형식에 맞지 않는 문자열을 빈 칸으로 그린다. | REACT-027은 형이 어긋난 값만 다루고(여기서 typeMismatch는 거짓), REACT-033은 기본 입력이 enum·format의 뜻을 약속하지 않는다고 적는다. |

## Last Updated

2026-10-13
