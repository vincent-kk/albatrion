# fieldInputs

## Requirements

사용자나 플러그인 입력 정의가 없을 때 스키마에 맞는 기본 입력을 선택합니다.

## API Contracts

- 진입점 `index.tsx`는 정의 배열 `builtinFieldInputDefinitions`를 조립해 이름으로 내보냅니다. 바깥 소비자는 `app/plugin`의 기본 정의 등록뿐이며 패키지 공개 표면에는 들어가지 않습니다.
- 기본 정의는 열한 개이고 구획 `fieldInputDefinitions/` 아래 입력마다 fractal 하나입니다. 이들은 컴포넌트가 아니라 `FieldInputDefinition`이므로 구획 이름이 그 뜻을 말합니다. 각 fractal의 진입점(`fieldInputDefinitions/<이름>/index.ts`)이 자기 정의를 만들어 내보내며, 뿌리 진입점은 그 진입점들을 직접 가리킵니다. 구획에는 진입점을 두지 않으며, filid 설정의 `structure.organNames`가 이 이름을 organ으로 등록합니다.
- 정의 배열의 앞쪽이 먼저 매칭되며 구체적인 형식 조건이 일반 타입 조건보다 우선합니다. 순서는 `FieldInputDateFormat` > `FieldInputStringCheckbox` > `FieldInputStringRadio` > `FieldInputStringEnum` > `FieldInputVirtual` > `FieldInputArray` > `FieldInputObject` > `FieldInputBoolean` > `FieldInputUnion` > `FieldInputString` > `FieldInputNumber`입니다.
- `{ type: 'union' }` 정의가 `FieldInputStringDefinition` 바로 앞에서 매칭됩니다. union 전용 우선순위 층을 더하지 않고 인라인·맵·Form·Provider·플러그인·기본 정의의 선택 순서를 유지합니다(REACT-033).
- 매칭 조건은 입력 힌트만 판정하고 실제 입력은 공통 FieldInputProps로 값과 변경을 전달합니다. 입력별 동작 계약은 각 fractal의 DETAIL에 있습니다.
- 여러 입력에 걸친 시험(`__tests__/drafts.test.tsx` 등 한 입력에 속하지 않는 것)만 뿌리 `__tests__`에 둡니다.

## Acceptance Criteria

### form-type-definitions-contract — 관찰 가능한 동작

- 특수 형식에 맞는 입력이 일반 문자열·숫자 입력에 가려지지 않습니다.
- 조건 판정은 부수 효과를 만들거나 외부 UI 라이브러리 등록을 수행하지 않습니다.

## Last Updated

2026-10-14: 소유자 구조 리뷰 넷째 손질(기본 입력을 입력마다 fractal로 분리, 입력별 계약은 각 fractal로). 계약 기준: REACT-027·033, LANDING-186, F-D′, CONTROLS-051·081, 257C-01.
