# Input Components Feature Scenarios contract

## Requirements

184라운드 검토안의 G6 표가 이 부류의 범위를 정한다.
React 컴포넌트·정의·File 객체는 소비자가 만들고, 이 부류는 스키마·라벨·경로·기대값만 든다.
숫자 badInput·포매터 캐럿·IME는 `Scenarios/Browser gates`(G23) 스토리가 이미 실제 브라우저에서 재므로 이 부류가 다시 만들지 않는다.
장면을 가져올 때 실행을 수행하거나 엔진 의존성을 도입하지 않는다(TEST-010).

## API Contracts

`inputComponentsFeatureScenarios`는 `index.ts`를 통해 이 부류의 순서 있는 장면 목록을 내보낸다.
`LabeledDefinition`은 엔진 없는 test 부분집합(`inputType`, `path`)과 라벨이며, 소비자의 컴포넌트는 `data-winner`에 그 라벨을 그린다. `InputWinner`는 라벨, 내장 입력 `default`, 입력 없음 `none` 가운데 하나다.
`inputResolutionPluginDefinition`은 소비자가 한 번 등록하는 플러그인 정의다. 등록은 전역이고 누적되므로 test는 이 부류의 probe inputType만 맞춘다.
`trimStages`, `fileAttachStages`, `childComponentStages`, `mapEntryStages`는 소비자 상호작용의 순서와 그 뒤의 값·첨부·자식 표시를 적는다.

## Acceptance Criteria

### input-components-scene-data — Shared data boundary

- 목록의 모든 장면은 데이터 전용이며 엔진·테스트 러너 가져오기와 독립적이다.
- 장면 이름은 `input-components.` 접두사로 시작하고 모든 최상위 단계에 기대값을 둔다.
- 해석 사례는 라벨이 겹치지 않고 probe 필드 셋 모두에 승자를 적는다.

### input-components-scene-coverage — Scene evidence

| Scene file | Scene name | Behavior verified | Ledger evidence |
| --- | --- | --- | --- |
| `input-resolution.scenario.ts` | `input-components.input-resolution` | 인라인 → 맵 → Form 정의 → Provider 정의 → 플러그인 순서로 첫 일치가 이기고, 인라인 null은 노드를 두고 입력만 그리지 않는다. | FieldInputSlot INTENT, REACT-033 |
| `input-map.scenario.ts` | `input-components.input-map` | 맵 키는 정확한 포인터, 앵커 없는 정규식, 한 칸을 맞추는 `*`로 맞으며, 동적 키는 노드가 아니라 `*`도 선언된 자식만 닿는다. | CONTROLS-080, SCHEMA-040 |
| `trim-on-blur.scenario.ts` | `input-components.trim-on-blur` | `options.trim`은 입력 중에는 공백을 두고 blur에서만 자르며, trim이 없는 칸은 공백을 지킨다. | CONTROLS-004, CONTROLS-005, CONTROLS-006 |
| `file-attach.scenario.ts` | `input-components.file-attach` | 첨부는 경로별 목록으로 들고, 입력이 내려가면 그 항목이 빠지며, reset은 맵을 비운다. | LANDING-148, TEST-020, TEST-023 |
| `props-flow.scenario.ts` | `input-components.props-flow` | presentation의 입력 props와 readOnly·disabled 제어가 내장 입력의 속성으로 닿는다. | CONTROLS-023, LANDING-168 |
| `child-components.scenario.ts` | `input-components.child-components` | 사용자 객체 입력이 ChildNodeComponents로 자식을 그리고 useChildNodeErrors가 자식 상태로 showErrors를 내며, 열린 객체는 한 노드로 남아 터미널 입력이 통째로 편집한다. | LANDING-167, SCHEMA-040 |

## Last Updated

2026-10-13
