# 우선순위 2 UI undetermined 행 입력 명세

[SPEED-TARGETS.md §4.2](../SPEED-TARGETS.md#42-undetermined-25행-모두-ui-이전-비율-없음-후보-없음)의 순서입니다. 소스 줄 번호의 두 값은 각각 beta `1c77ced57`, 후보 `d78e45c6b`입니다. 신뢰도는 구 입력의 복원 정도를 뜻합니다. 두 행에서 공통 입력을 참조하면 스키마, `defaultValue`, props와 구동법을 그대로 사용합니다.

- **공통 API** — 모든 행은 `@canard/schema-form`의 `Form`에 해당 UI 패키지의 공개 `plugin`에서 꺼낸 `fieldInputDefinitions`, `FieldRenderer`, `LabelRenderer`, `ErrorMessageRenderer`를 각각 props로 전달합니다. 아래 API 표기는 모두 패키지 루트(`.`) 진입점입니다. `packages/canard/schema-form/src/index.ts:8,53 / :8,53`. [ROWS-P1 11·22행](ROWS-P1.md#11-antd5--checkboxchangeplain)
- **공통 구동** — production React, jsdom, UTC, 동일 locale에서 `context={}`와 `ValidationMode.None`을 기본으로 둡니다. `onError`는 양쪽에 동일한 레코더를 전달해 콘솔 I/O를 피합니다. 새 마운트는 표본마다 비어 있는 컨테이너를 먼저 준비하고 `createRoot`와 첫 `flushSync(root.render(…))`를 잽니다. 상호작용은 새로 마운트하고 준비가 끝난 폼에 한 번 실행해 마지막 커밋까지 잽니다. 동일 배열 쓰기처럼 커밋이 생략되면 동기 flush가 반환될 때 끝납니다. DOM 조회, 입력 준비, 검증용 관측, 정리는 구간 밖입니다. 포털은 `document.body`에서 확인합니다. 두 arm에 동일한 `ResizeObserver` 대체 구현을 준비합니다. `antd6` 시간 피커는 이것이 없으면 jsdom 마운트 중 오류가 납니다. [측정 도구](../../benchmarks/compare/README.md)
- **모바일 5.43.0** — 설치된 5.43.0의 `SliderProps`에서 `range`, `defaultValue`, `onChange`, `onAfterChange`와 스칼라·튜플 타입을 확인했습니다. 실제 트랙 클릭은 가까운 썸을 이동시킨 뒤 `onAfterChange`를 호출합니다. `Radio.Group`과 `Checkbox.Group`도 양쪽 플러그인에서 쓰는 `defaultValue`/변경 콜백을 지원합니다. 두 arm 모두 플러그인 기준 해석 버전이 5.43.0이어야 합니다. 공통 CSS 처리도 필요합니다. 네이티브 Node import는 5.43.0의 `cjs/global/global.css`에서 실패하므로 jsdom 진단에서는 CJS CSS 로딩을 비활성화했습니다. beta 모바일은 진단에서만 임시 해석 훅으로 설치된 5.43.0 사본을 사용하고, React와 ReactDOM은 beta 런타임으로 해석했습니다. 실측 전 별도 beta 설치 변형의 의존성을 확인합니다. [이번 측정의 결정](README.md#이번-측정의-결정) · `packages/canard/schema-form-antd-mobile-plugin/node_modules/antd-mobile/es/components/slider/slider.d.ts:4–20`, `slider.js:105–126`, `cjs/components/radio/group.js`, `cjs/components/checkbox/group.js`.
- **예상 분류** — `plain`과 `repaired`는 소스에서 예상한 종류입니다. 필요하면 준비와 측정 구간의 실행 횟수를 따로 기록하고 하니스의 계수 기준으로 확정합니다. 공개 ESM 배포물에 입력을 재생해 관측값을 확인했으며 속도는 재지 않았습니다. [구 집계 125–154행](../final-correction/speed-overview.md#L125) · [이번 측정의 결정](README.md#이번-측정의-결정)

## 1. antd5 / timeRangePanel

- **API** — 공통 `Form`과 `@canard/schema-form-antd5-plugin`의 `plugin`. `packages/canard/schema-form-antd5-plugin/src/index.ts:8 / :8`.
- **입력과 측정** — `{type:'array',format:'time-range',items:{type:'string'},presentation:{FieldInputProps:{minimum:'09:00:00+00:00',maximum:'18:00:00+00:00'}}}`, `defaultValue=['10:00:00+00:00','15:00:00+00:00']`입니다. `Form → plugin FieldRenderer → DatePicker.RangePicker`를 닫힌 상태로 준비합니다. 시작 입력에 같은 flush 안에서 `mouseDown`과 `click`을 보내 한 번 열고 달력·시각 포털이 최초 커밋될 때까지 잽니다. 저장 배열은 그대로입니다.
- **repaired · 중간** — R1-ANTD5-1의 제한을 통과합니다. beta는 달력의 다른 날짜를 비활성화합니다. 후보는 달력 날짜를 허용하고 시간 열에서 09–18시 및 양 끝 분을 제한합니다. [원장 R1-ANTD5-1](../final-correction/contract-ledger/canard-schema-form-antd5-plugin.md#L11) · `packages/canard/schema-form-antd5-plugin/src/fieldInputs/__tests__/FieldInputTimeRange.panel.test.tsx:11`.

## 2. antd5 / coreFormMount

- **API** — 공통 `Form`과 `@canard/schema-form-antd5-plugin`의 `plugin`. `packages/canard/schema-form-antd5-plugin/src/index.ts:8 / :8`.
- **입력과 측정** — `{type:'object',properties:{name:{type:'string',title:'Name'},count:{type:'number',title:'Count'}}}`, `defaultValue={name:'Ada',count:3}`입니다. `Form → plugin FieldRenderer → /name Ant Design Input, /count InputNumber`의 신선한 클라이언트 마운트를 잽니다. 두 입력의 표시 값과 폼 값을 확인합니다.
- **plain · 낮음** — 정적 객체에 두 리프를 등록하는 중립 마운트입니다. 분기 이탈, 외부 쓰기, 초기 오류가 없습니다. 코어 마운트 대조 입력을 빌리되 두 리프는 Ant Design 위젯으로 렌더합니다. 분류 계수에서는 이 입력에도 적용되는 식별자 연결 변경을 확인합니다. [구 집계 126행](../final-correction/speed-overview.md#L126) · [ROWS-P1 16행](ROWS-P1.md#16-schema-form-core--mount-plain) · [엔진 보고](../final-correction/engine-report.md#L242).

## 3. antd5 / coreEqualArray

- **API** — 공통 `Form`, `@canard/schema-form-antd5-plugin`의 `plugin`, `FormHandle.setValue`. `packages/canard/schema-form-antd5-plugin/src/index.ts:8 / :8`, `packages/canard/schema-form/src/components/Form/components/FormCore/types/handle.ts:49 / :49`.
- **입력과 측정** — `{type:'object',properties:{list:{type:'array',items:{type:'string'}}}}`, `defaultValue={list:['a','b']}`입니다. `Form → plugin FieldRenderer → /list FieldInputArray → Ant Design Input 2개와 배열 조작 버튼`을 준비합니다. 리터럴은 별개 참조로 미리 만들고 `flushSync(() => ref.current.setValue({list:['a','b']}))`로 외부 쓰기 한 번을 잽니다. 값과 두 입력 DOM 참조가 유지됩니다.
- **plain · 낮음** — R2-SF-3의 비교 조건을 통과하되 동일 내용이므로 바뀐 값을 위한 재부착을 요구하지 않습니다. 인접 `coreExternalArray`의 다른 값 외부 쓰기와 구별합니다. [구 집계 127·131행](../final-correction/speed-overview.md#L127) · [코어 원장 R2-SF-3](../final-correction/contract-ledger/canard-schema-form.md#L29) · `packages/canard/schema-form/src/__tests__/e2e/wholeArray.round-two.test.tsx:24`.

## 4. antd5 / sliderMount

- **API** — 공통 `Form`과 `@canard/schema-form-antd5-plugin`의 `plugin`. `packages/canard/schema-form-antd5-plugin/src/index.ts:8 / :8`.
- **입력과 측정** — `{type:'object',properties:{level:{type:'number',title:'Level',minimum:0,maximum:10,multipleOf:1,format:'slider',presentation:{inputType:'slider'}}}}`, `defaultValue={level:4}`입니다. `Form → plugin FieldRenderer → /level Ant Design Slider(썸 1개)`의 신선한 마운트를 잽니다. 썸 값은 4입니다. `format` 힌트는 Mobile용이며 `presentation.inputType` 힌트는 antd5·6과 MUI용입니다. 네 플러그인에 같은 스키마를 전달합니다.
- **repaired · 중간** — 0–10의 정렬된 격자를 쓰며, 후보의 R1-ANTD5-5 및 R3-ANTD5-A1 핸들 포커스 대상 연결이 클라이언트 마운트에서 실행됩니다. [원장 R1-ANTD5-5](../final-correction/contract-ledger/canard-schema-form-antd5-plugin.md#L14) · `packages/canard/schema-form-antd5-plugin/src/fieldInputs/__tests__/FieldInputSlider.focus.test.tsx:12`.

## 5. antd5 / uriMount

- **API** — 공통 `Form`과 `@canard/schema-form-antd5-plugin`의 `plugin`. `packages/canard/schema-form-antd5-plugin/src/index.ts:8 / :8`.
- **입력과 측정** — `{type:'object',properties:{link:{type:'string',title:'Link',format:'uri'}}}`, `defaultValue={link:'sms:+821012345678'}`입니다. `Form → plugin FieldRenderer → /link Ant Design Select와 Input`의 신선한 마운트를 잽니다. 목록과 주소는 편집하지 않습니다. beta 표시는 `http://`와 `sms:+821012345678`, 후보는 `sms:`와 `+821012345678`입니다. 저장값은 동일합니다.
- **repaired · 중간** — R3-ANTD5-2의 기본 목록 밖 한 콜론 scheme을 마운트에서 분리하고, 후보의 R3-ANTD5-URI `Space.Compact` 구조가 렌더됩니다. [원장 R3-ANTD5-2·URI](../final-correction/contract-ledger/canard-schema-form-antd5-plugin.md#L22) · `packages/canard/schema-form-antd5-plugin/src/fieldInputs/__tests__/FieldInputUri.schemes.test.tsx`.

## 6. antd5 / multiEnumMount

- **API** — 공통 `Form`과 `@canard/schema-form-antd5-plugin`의 `plugin`. `packages/canard/schema-form-antd5-plugin/src/index.ts:8 / :8`.
- **입력과 측정** — cut의 antd6 행과 같은 `{type:'array',items:{type:'string',enum:['news','sports']}}`, `defaultValue=[{legacy:'data'},'sports']`입니다. `Form → plugin FieldRenderer → Ant Design Select(mode="multiple")`을 닫힌 상태로 새로 마운트합니다. beta는 칩이 없고 후보는 미등록 객체의 JSON 토큰과 `sports`를 표시합니다. 두 arm 모두 저장 배열을 유지하며 `/0`의 `SCHEMA_FORM_WARNING.MISFIT`을 보고합니다.
- **repaired · 중간** — 후보는 미등록 JSON 항목을 포함한 배열 전체를 Select 초기값으로 전달합니다. beta는 문자열·null 전용 검사에서 배열 전체를 거절합니다. 구 집계의 목록 밖 값과 공개 테스트의 객체 값을 사용합니다. [구 집계 130·137행](../final-correction/speed-overview.md#L130) · [동일 입력의 cut 4행](ROWS-P2-cut.md#4-antd6--multienummount) · `packages/canard/schema-form-antd5-plugin/src/__tests__/roundFour.unknownMultiSelect.table.test.tsx` · `src/fieldInputs/FieldInputStringEnum.tsx:70–80 / :59–67`.

## 7. antd5 / coreOwnArray

- **API** — 공통 `Form`, `@canard/schema-form-antd5-plugin`의 `plugin`, 공개 `fieldInputMap`. `packages/canard/schema-form-antd5-plugin/src/index.ts:8 / :8`, `packages/canard/schema-form/src/components/Form/components/FormCore/types/props.ts:70 / :70`.
- **입력과 측정** — `{type:'object',properties:{list:{type:'array',title:'List',items:{type:'string'}},note:{type:'string',title:'Note'}}}`, `defaultValue={list:['a','b'],note:'fixed'}`입니다. `Form → plugin FieldRenderer → /list 비제어 input, /note Ant Design Input`을 준비합니다. `fieldInputMap['/list']`의 입력은 `JSON.stringify(defaultValue)`를 초기 표시로 쓰며, React `onChange`에서 `onChange(event.target.value.split(','))`를 호출합니다. `/list`에 `fireEvent.change(input,{target:{value:'x,y'}})` 한 번과 flush까지 잽니다. `{list:['x','y'],note:'fixed'}`가 저장되고 입력 DOM 참조는 유지됩니다. 기본 렌더러가 이 입력을 배치하므로 P1 17행의 `Form.Render` 및 단일 원소 fixture와 구동 경계가 구별됩니다.
- **plain · 낮음** — R2-SF-3의 전체 배열 채널에 같은 길이로 자체 쓰기 한 번만 보냅니다. 두 arm에서 입력 재부착 0회를 확인할 수 있습니다. [구 집계 132행](../final-correction/speed-overview.md#L132) · [ROWS-P1 17행](ROWS-P1.md#17-schema-form-core--whole-array-client-own-write) · `packages/canard/schema-form/src/__tests__/e2e/wholeArray.round-two.test.tsx:66`.

## 8. antd5 / timeRangeMount

- **API** — 공통 `Form`과 `@canard/schema-form-antd5-plugin`의 `plugin`. `packages/canard/schema-form-antd5-plugin/src/index.ts:8 / :8`.
- **입력과 측정** — `{type:'array',format:'time-range',items:{type:'string'}}`, `defaultValue=['10:00:00z','15:00:00+00:00']`입니다. `Form → plugin FieldRenderer → DatePicker.RangePicker`의 닫힌 상태 첫 마운트를 잽니다. beta 시작 입력은 `Invalid Date`, 후보는 `10:00:00+00:00`입니다. 저장 문자열은 동일합니다.
- **repaired · 중간** — R4-ANTD5-3의 소문자 `z` 파싱을 명시적으로 실행합니다. [원장 R4-ANTD5-3](../final-correction/contract-ledger/canard-schema-form-antd5-plugin.md#L34) · `packages/canard/schema-form-antd5-plugin/src/__tests__/roundFour.timeSpelling.table.test.tsx:53`.

## 9. antd5 / timeRangePanelPlain

- **API** — 공통 `Form`과 `@canard/schema-form-antd5-plugin`의 `plugin`. `packages/canard/schema-form-antd5-plugin/src/index.ts:8 / :8`.
- **입력과 측정** — `{type:'array',format:'time-range',items:{type:'string'}}`, `defaultValue=['10:00:00+00:00','15:00:00+00:00']`입니다. `Form → plugin FieldRenderer → DatePicker.RangePicker`를 닫힌 상태로 준비하고 1행과 같이 시작 입력을 한 번 열어 포털 커밋까지 잽니다. 날짜와 시각 제한이 없는 패널입니다.
- **repaired · 중간** — `Plain` 행의 패널에는 날짜·시각 제한 및 소문자 표기 수정이 적용될 조건이 없습니다. 다만 준비 과정에서 양 끝 입력의 주소를 연결하는 R3-ANTD5-A1 경로가 실행됩니다. 계수에서는 준비의 주소 연결과 패널 열기 구간을 따로 기록합니다. [구 집계 134행](../final-correction/speed-overview.md#L134) · [원장 R3-ANTD5-A1](../final-correction/contract-ledger/canard-schema-form-antd5-plugin.md#L25) · `packages/canard/schema-form-antd5-plugin/src/fieldInputs/utils/picker/getRangePickerId.ts`.

## 10. antd6 / sliderMount

- **API** — 공통 `Form`과 `@canard/schema-form-antd6-plugin`의 `plugin`. `packages/canard/schema-form-antd6-plugin/src/index.ts:8 / :8`.
- **입력과 측정** — 4행과 같은 스키마 및 `defaultValue={level:4}`입니다. `Form → plugin FieldRenderer → /level Ant Design 6 Slider(썸 1개)`의 신선한 마운트를 잽니다. 썸 값은 4입니다.
- **repaired · 중간** — R1-ANTD6-5/R3-ANTD6-A1의 썸 포커스와 주소를 연결하는 경로를 4행과 같이 실행합니다. [원장 R1-ANTD6-5](../final-correction/contract-ledger/canard-schema-form-antd6-plugin.md#L14) · `packages/canard/schema-form-antd6-plugin/src/fieldInputs/__tests__/FieldInputSlider.focus.test.tsx:26`.

## 11. antd6 / uriMount

- **API** — 공통 `Form`과 `@canard/schema-form-antd6-plugin`의 `plugin`. `packages/canard/schema-form-antd6-plugin/src/index.ts:8 / :8`.
- **입력과 측정** — 5행과 같은 스키마 및 `defaultValue={link:'sms:+821012345678'}`입니다. `Form → plugin FieldRenderer → /link Ant Design 6 Select와 Input`의 신선한 마운트를 잽니다. 표시와 저장값도 5행과 같습니다.
- **repaired · 중간** — R3-ANTD6-2의 한 콜론 scheme을 파싱하고 R3-ANTD6-6의 접두 컨트롤을 렌더합니다. [원장 R3-ANTD6-2·6](../final-correction/contract-ledger/canard-schema-form-antd6-plugin.md#L22) · `packages/canard/schema-form-antd6-plugin/src/fieldInputs/__tests__/FieldInputUri.schemes.test.tsx`.

## 12. antd6 / checkboxChange

- **API** — 공통 `Form`과 `@canard/schema-form-antd6-plugin`의 `plugin`. `packages/canard/schema-form-antd6-plugin/src/index.ts:8 / :8`.
- **입력과 측정** — `{type:'array',items:{type:'string',enum:['news','sports']},presentation:{inputType:'checkbox'}}`, `defaultValue=['legacy','sports']`입니다. `Form → plugin FieldRenderer → Ant Design 6 Checkbox.Group → news, sports`에서 첫 체크박스 `news`의 `fireEvent.click` 한 번과 커밋을 잽니다. beta 저장값 `['news','sports']`, 후보 `['legacy','sports','news']`입니다.
- **repaired · 중간** — R4-ANTD6-S7의 미등록 문자열 보존을 테스트하는 첫 토글을 사용했습니다. [구 집계 122·138행](../final-correction/speed-overview.md#L122) · [원장 R4-ANTD6-S7](../final-correction/contract-ledger/canard-schema-form-antd6-plugin.md#L42) · `packages/canard/schema-form-antd6-plugin/src/__tests__/roundFour.unknownCheckbox.table.test.tsx:12,31–55`.

## 13. antd6 / branchError

- **API** — 공통 `Form`, `@canard/schema-form-antd6-plugin`의 `plugin`, `registerPlugin`, `ErrorVisibility.Always`, `ValidationMode.OnRequest`, `FormHandle.validate/getErrors`를 사용합니다. `packages/canard/schema-form-antd6-plugin/src/index.ts:8 / :8`, `packages/canard/schema-form/src/index.ts:4,53,70 / :4,53,70`, `src/components/Form/components/FormCore/types/handle.ts:50,52 / :50,52`.
- **입력과 측정** — `{type:'object',properties:{field:{type:'array',items:{type:'string'},minItems:2}}}`, `defaultValue={field:['a']}`입니다. cut의 antd5·MUI와 같은 검증기를 구간 밖에서 등록합니다. `validator.compile`이 반환하는 함수는 `Array.isArray(value?.field) && value.field.length < 2`이면 `[{keyword:'minItems',dataPath:'/field',message:'minItems constraint'}]`, 그 외에는 `null`을 반환합니다. `compileGuard`는 호출되지 않습니다. `Form → plugin FieldRenderer → /field 배열 입력과 자식 문자열 입력`을 에러 없이 준비합니다. `ref.current.validate()` 한 번을 호출해 Promise 완료 및 React 갱신 정착까지 잽니다. `/field`의 `minItems` 오류가 양쪽 핸들에 나오고 후보의 배열 분기에서만 `ErrorMessageRenderer`가 문구를 표시합니다. 종료 기준은 양쪽의 검증 완료 및 갱신 정착이며 DOM 문구는 표본 뒤에 확인합니다.
- **repaired · 중간** — R4-ANTD6-S6의 배열 분기 오류 표시를 재생합니다. 분기 선택은 공개 테스트의 `array minimum`입니다. 같은 검증 입력을 cut의 antd5·MUI에도 사용합니다. [cut 2·7행](ROWS-P2-cut.md#2-antd5--brancherror) · [원장 R4-ANTD6-S6](../final-correction/contract-ledger/canard-schema-form-antd6-plugin.md#L41) · `packages/canard/schema-form-antd6-plugin/src/__tests__/roundFour.branchErrors.table.test.tsx:20,61`.

## 14. antd6 / timeRangeMount

- **API** — 공통 `Form`과 `@canard/schema-form-antd6-plugin`의 `plugin`. `packages/canard/schema-form-antd6-plugin/src/index.ts:8 / :8`.
- **입력과 측정** — 8행과 같은 스키마 및 `defaultValue=['10:00:00z','15:00:00+00:00']`입니다. `Form → plugin FieldRenderer → Ant Design 6 DatePicker.RangePicker`의 닫힌 상태 첫 마운트를 잽니다. 표시와 저장값은 8행과 같습니다.
- **repaired · 중간** — R4-ANTD6-3의 소문자 `z` 처리 경로를 실행합니다. [원장 R4-ANTD6-3](../final-correction/contract-ledger/canard-schema-form-antd6-plugin.md#L34) · `packages/canard/schema-form-antd6-plugin/src/__tests__/roundFour.timeSpelling.table.test.tsx:53`.

## 15. antd6 / timeRangePanel

- **API** — 공통 `Form`과 `@canard/schema-form-antd6-plugin`의 `plugin`. `packages/canard/schema-form-antd6-plugin/src/index.ts:8 / :8`.
- **입력과 측정** — 1행과 같은 시각 제한 스키마 및 `defaultValue=['10:00:00+00:00','15:00:00+00:00']`입니다. `Form → plugin FieldRenderer → Ant Design 6 DatePicker.RangePicker`의 시작 입력을 1행과 같이 한 번 열고 포털 커밋까지 잽니다.
- **repaired · 중간** — R1-ANTD6-1의 시각 제한을 1행과 같은 입력으로 통과합니다. beta는 달력 날짜를 제한하고 후보는 시·분을 제한합니다. [원장 R1-ANTD6-1](../final-correction/contract-ledger/canard-schema-form-antd6-plugin.md#L11) · `packages/canard/schema-form-antd6-plugin/src/fieldInputs/__tests__/FieldInputTimeRange.panel.test.tsx:25`.

## 16. antd-mobile / sliderMount

- **API** — 공통 `Form`과 `@canard/schema-form-antd-mobile-plugin`의 `plugin`. `packages/canard/schema-form-antd-mobile-plugin/src/index.ts:8 / :8`.
- **입력과 측정** — 4행과 같은 스키마 및 `defaultValue={level:4}`입니다. 5.43.0의 `Form → plugin FieldRenderer → /level 그룹 → Slider(썸 1개)`의 신선한 마운트를 잽니다. 양쪽 값은 4이며 후보 썸의 접근성 이름은 `Level`입니다.
- **repaired · 중간** — R5-MOBILE-1의 접근성 이름이 후보의 `aria-label`을 통해 5.43.0 썸에 전달됩니다. beta는 라이브러리 locale 이름을 사용합니다. [원장 R5-MOBILE-1](../final-correction/contract-ledger/canard-schema-form-antd-mobile-plugin.md#L42) · `antd-mobile@5.43.0/cjs/components/slider/thumb.js:65–69`.

## 17. antd-mobile / radioMount

- **API** — 공통 `Form`과 `@canard/schema-form-antd-mobile-plugin`의 `plugin`. `packages/canard/schema-form-antd-mobile-plugin/src/index.ts:8 / :8`.
- **입력과 측정** — `{type:'object',properties:{plan:{type:'string',title:'Plan',enum:['basic','plus'],presentation:{inputType:'radio'}}}}`, `defaultValue={plan:'basic'}`입니다. `Form → plugin FieldRenderer → /plan radiogroup → Radio.Group → Radio 2개`의 신선한 마운트를 잽니다. 첫 항목이 선택되고 후보 그룹은 연결된 필드 이름을 가집니다.
- **repaired · 중간** — R5-MOBILE-1/R3-MOBILE-A1의 그룹 제목과 옵션 주소가 렌더됩니다. 5.43.0의 `Radio.Group`은 플러그인의 JSON 문자열 토큰을 값으로 받습니다. [원장 R5-MOBILE-1](../final-correction/contract-ledger/canard-schema-form-antd-mobile-plugin.md#L42) · `packages/canard/schema-form-antd-mobile-plugin/src/__tests__/roundFive.customLayoutNames.test.tsx:134` · `antd-mobile@5.43.0/cjs/components/radio/{group,radio}.js`.

## 18. antd-mobile / rangeSliderChange

- **API** — 공통 `Form`과 `@canard/schema-form-antd-mobile-plugin`의 `plugin`. `packages/canard/schema-form-antd-mobile-plugin/src/index.ts:8 / :8`.
- **입력과 측정** — `{type:'array',format:'slider',minimum:0,maximum:100,multipleOf:1,items:{type:'number',minimum:0,maximum:80,multipleOf:1},presentation:{FieldInputProps:{range:true}}}`, `defaultValue=[10,30]`입니다. beta는 공개 표현 옵션 `range:true`로 두 썸을 선택하며 후보는 배열 스키마로 선택합니다. `Form → plugin FieldRenderer → Slider(썸 2개)`를 준비합니다. `.adm-slider-track`의 `offsetWidth=100` 및 rect `{left:0,right:100,top:0,bottom:10,width:100,height:10,x:0,y:0}`을 구간 밖에 설정합니다. 그 트랙에 `click(clientX:70,clientY:5)` 한 번과 커밋을 잽니다. beta는 배열 수준 범위대로 `[10,70]`, 후보는 항목 범위대로 `[10,56]`을 저장합니다.
- **repaired · 중간** — R1-MOBILE-1의 튜플 형태 선택과 R3-MOBILE-2의 항목 제약 우선을 관측합니다. 두 arm 모두 5.43.0에서 트랙 클릭이 발생시키는 기본 lazy `onAfterChange` 경로를 사용합니다. [원장 R1-MOBILE-1·R3-MOBILE-2](../final-correction/contract-ledger/canard-schema-form-antd-mobile-plugin.md#L20) · `packages/canard/schema-form-antd-mobile-plugin/src/fieldInputs/__tests__/FieldInputSlider.itemBounds.round-three.test.tsx:39` · `antd-mobile@5.43.0/es/components/slider/slider.js:105–126`.

## 19. antd-mobile / checkboxChange

- **API** — 공통 `Form`과 `@canard/schema-form-antd-mobile-plugin`의 `plugin`. `packages/canard/schema-form-antd-mobile-plugin/src/index.ts:8 / :8`.
- **입력과 측정** — 12행과 같은 스키마 및 `defaultValue=['legacy','sports']`입니다. `Form → plugin FieldRenderer → Checkbox.Group → news, sports`를 준비합니다. 5.43.0의 첫 네이티브 체크박스 `news`에 같은 `fireEvent.click` 한 번과 커밋을 잽니다. 후보는 `['legacy','sports','news']`를 저장합니다. beta의 5.43.0 진단 관측은 `[JSON.stringify('legacy'),'sports','news']`입니다.
- **repaired · 중간** — R4-MOBILE-3의 미등록 값 역변환과 보존을 통과합니다. antd6와 동일한 입력 및 클릭이며 beta의 미등록 값 처리만 서로 다릅니다. [원장 R4-MOBILE-3](../final-correction/contract-ledger/canard-schema-form-antd-mobile-plugin.md#L33) · `packages/canard/schema-form-antd-mobile-plugin/src/__tests__/roundFour.unknownCheckbox.table.test.tsx:12,31–55` · `antd-mobile@5.43.0/cjs/components/checkbox/{group,checkbox}.js`.

## 20. antd-mobile / branchError

- **API** — 13행의 공개 폼·검증 API에 `@canard/schema-form-antd-mobile-plugin`의 `plugin`을 결합합니다. `packages/canard/schema-form-antd-mobile-plugin/src/index.ts:8 / :8`, `packages/canard/schema-form/src/index.ts:4,8,53,70 / :4,8,53,70`, `src/components/Form/components/FormCore/types/handle.ts:50,52 / :50,52`.
- **입력과 측정** — 13행과 같은 스키마, `defaultValue={field:['a']}`, 검증기 등록 및 검증 모드입니다. `Form → plugin FieldRenderer → /field 모바일 배열 조작 및 자식 문자열 입력`에 같은 `ref.current.validate()` 한 번과 갱신 경계를 적용합니다. 후보의 배열 분기에서 오류 문구가 보입니다.
- **repaired · 중간** — R4-MOBILE-1의 배열 오류 표시 경로이며 검증 결과 자체는 양쪽이 같습니다. [원장 R4-MOBILE-1](../final-correction/contract-ledger/canard-schema-form-antd-mobile-plugin.md#L31) · `packages/canard/schema-form-antd-mobile-plugin/src/__tests__/roundFour.branchErrors.table.test.tsx:20,61`.

## 21. mui / datePickerMount

- **API** — 공통 `Form`과 `@canard/schema-form-mui-plugin`의 `plugin`. `packages/canard/schema-form-mui-plugin/src/index.ts:8 / :8`.
- **입력과 측정** — `{type:'object',properties:{day:{type:'string',format:'date',title:'Day',presentation:{FieldInputProps:{minimum:'2025-05-10',maximum:'2025-05-20'}}}}}`, `defaultValue={day:'2025-05-15'}`입니다. `Form → plugin FieldRenderer → /day LocalizationProvider(AdapterDayjs) → 데스크톱 DatePicker`의 닫힌 상태 마운트를 잽니다. 두 arm 모두 포인터가 fine인 설정을 사용합니다. 선택 날짜는 5월 15일이며 포털은 닫혀 있습니다.
- **repaired · 중간** — R1-MUI-3의 표현 속성 날짜 제한 파싱이 마운트에 포함됩니다. beta는 이 제한을 읽지 않습니다. 제한의 화면 효과는 23행에서 관측합니다. [원장 R1-MUI-3](../final-correction/contract-ledger/canard-schema-form-mui-plugin.md#L12) · `packages/canard/schema-form-mui-plugin/src/fieldInputs/__tests__/FieldInputDateMonth.limits.test.tsx:32`.

## 22. mui / uriMount

- **API** — 공통 `Form`과 `@canard/schema-form-mui-plugin`의 `plugin`. `packages/canard/schema-form-mui-plugin/src/index.ts:8 / :8`.
- **입력과 측정** — 5행과 같은 스키마 및 `defaultValue={link:'sms:+821012345678'}`입니다. `Form → plugin FieldRenderer → /link MUI Select와 TextField`의 신선한 마운트를 잽니다. 표시와 저장값은 5행과 같습니다.
- **repaired · 중간** — R3-MUI-2의 한 콜론 scheme 분리 및 선택지 보존을 실행합니다. [원장 R3-MUI-2](../final-correction/contract-ledger/canard-schema-form-mui-plugin.md#L26) · `packages/canard/schema-form-mui-plugin/src/fieldInputs/__tests__/FieldInputUri.schemes.test.tsx`.

## 23. mui / datePickerPanel

- **API** — 공통 `Form`과 `@canard/schema-form-mui-plugin`의 `plugin`. `packages/canard/schema-form-mui-plugin/src/index.ts:8 / :8`.
- **입력과 측정** — 21행과 같은 스키마 및 `defaultValue={day:'2025-05-15'}`입니다. 같은 닫힌 트리에서 날짜 열기 버튼(영어 locale의 `Choose date`로 시작하는 접근성 이름)에 `click` 한 번과 데스크톱 달력 포털의 `grid` 커밋을 잽니다. 저장 날짜는 그대로입니다.
- **repaired · 중간** — R1-MUI-3의 표현 속성 제한으로 후보의 5월 9일·21일 버튼이 비활성화되고 15일은 선택 상태입니다. beta는 9일과 21일도 허용합니다. [원장 R1-MUI-3](../final-correction/contract-ledger/canard-schema-form-mui-plugin.md#L12) · `packages/canard/schema-form-mui-plugin/src/fieldInputs/FieldInputDate.tsx`의 두 커밋.

## 24. mui / sliderMount

- **API** — 공통 `Form`과 `@canard/schema-form-mui-plugin`의 `plugin`. `packages/canard/schema-form-mui-plugin/src/index.ts:8 / :8`.
- **입력과 측정** — 4행과 같은 스키마 및 `defaultValue={level:4}`입니다. `Form → plugin FieldRenderer → /level MUI Slider와 레이블·범위 캡션`의 신선한 마운트를 잽니다. 단일 range input의 값은 4입니다.
- **repaired · 중간** — R3-MUI-A1의 입력 주소와 레이블 참조를 후보가 range input 슬롯에 연결합니다. beta는 Slider 컨테이너 주소를 사용합니다. [원장 R3-MUI-A1](../final-correction/contract-ledger/canard-schema-form-mui-plugin.md#L29) · `packages/canard/schema-form-mui-plugin/src/fieldInputs/FieldInputSlider.tsx`의 두 커밋.

## 25. mui / sliderChange

- **API** — 공통 `Form`과 `@canard/schema-form-mui-plugin`의 `plugin`. `packages/canard/schema-form-mui-plugin/src/index.ts:8 / :8`.
- **입력과 측정** — `{type:'number',format:'slider',minimum:0,maximum:10,multipleOf:1,presentation:{inputType:'slider'}}`, `defaultValue=2`이며 `lazy`는 생략합니다. cut의 Mobile 스칼라 변경과 같은 숫자 스키마와 값을 사용하고 MUI 선택에 필요한 `presentation.inputType`을 추가합니다. `Form → plugin FieldRenderer → MUI Slider(썸 1개)`의 `.MuiSlider-root` rect를 `{left:0,right:100,top:0,bottom:10,width:100,height:10,x:0,y:0}`으로 준비합니다. 위젯 구동법에 맞춰 트랙의 `mouseDown`(`button:0,buttons:1,clientX:70,clientY:5`)부터 document의 `mouseUp`(`button:0,clientX:70,clientY:5`) 후 flush까지 한 제스처를 잽니다. 두 arm 모두 최종 값은 `7`입니다. [동일 입력의 Mobile cut 5행](ROWS-P2-cut.md#5-antd-mobile--sliderchange)
- **repaired · 중간** — R4-MUI-S3의 기본 저장 시점 변경을 통과합니다. beta는 누를 때 7을 저장하고 후보는 놓을 때 7을 저장합니다. 중간 상태 차이는 타이밍 밖 진단에서 확인합니다. [원장 R4-MUI-S3](../final-correction/contract-ledger/canard-schema-form-mui-plugin.md#L41) · `packages/canard/schema-form-mui-plugin/src/__tests__/roundFive.sliderPresentation.test.tsx:65–87`.

## 확인이 필요한 행

- **낮은 신뢰도** — 2·3·7행의 구 집계에는 코어 대조군 이름만 남았습니다. 2행의 필드 구성, 3행의 동등 외부 쓰기, 7행의 기본 렌더 트리에 묶인 배열 자체 쓰기는 공개 테스트와 인접 행에서 재구성했습니다.
- **폼 및 위젯 API 차이** — 4·10·16·24행은 같은 스키마에 두 종류의 공개 선택 힌트를 함께 둡니다. 18행만 beta의 두 썸을 위해 `range:true`가 필요하고 후보는 `items`의 상한을 사용합니다. 25행과 Mobile cut `sliderChange`는 위젯 선택 힌트와 트랙 이벤트가 다르며 25행은 beta와 후보의 기본 `lazy` 동작도 다릅니다. 2·3·7행의 `plain` 예상은 식별자 및 공통 바인딩 계수에 따라 확정합니다.
- **jsdom 실행 조건** — 14·15행과 다른 Ant Design 6 위젯의 observer 설정을 고정합니다. 16–20행은 공통 버전 5.43.0에서 동작을 확인했으며, 시간 측정 전 별도 beta 변형의 실제 의존성 해석과 공통 CSS 로딩 방식을 점검합니다.
