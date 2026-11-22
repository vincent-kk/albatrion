# 우선순위 2 cut 입력 명세

[SPEED-TARGETS.md §4.1](../SPEED-TARGETS.md#41-cut-42행)에서 `schema-form engine`을 제외한 표 순서입니다. API 근거의 줄 번호는 beta `1c77ced57`, 비교 커밋 `d78e45c6b` 순서입니다. 입력과 크기는 재측정에서 사용할 고정값입니다. 신뢰도는 구 입력이 얼마나 확인되는지를 나타냅니다. `plain`과 `repaired`는 지정 커밋의 코드에서 예상한 분류이며, 호출 계수는 후속 측정에서 확인합니다.

클라이언트 행은 같은 React와 위젯 버전의 jsdom을 사용합니다. 플러그인 부품을 전달한다고 명시한 행은 공개 `plugin`의 `fieldInputDefinitions`, `FieldRenderer`, `LabelRenderer`, `ErrorMessageRenderer`를 같은 이름의 개별 `Form` props로 넘깁니다. 상호작용 행의 초기 마운트, DOM 조회, 결과 확인, 언마운트는 측정 밖입니다. 초기 마운트 행에서도 입력 구성과 정리는 측정 밖입니다.

## 1. antd5 / checkboxChange

- **API** — `@canard/schema-form`의 `Form`, `ValidationMode.None`과 `@canard/schema-form-antd5-plugin`의 `plugin`입니다. 조립 방식은 두 커밋에서 같습니다. `packages/canard/schema-form/src/index.ts:8,53 / :8,53`, `packages/canard/schema-form-antd5-plugin/src/index.ts:8–13 / :8–13`.
- **입력과 측정** — 루트 `{type:'array',items:{type:'string',enum:['news','sports']},presentation:{inputType:'checkbox'}}`, `defaultValue=['legacy','sports']`, `ValidationMode.None`입니다. 플러그인 부품을 전달해 `Form → FieldRenderer → Ant Checkbox.Group → Checkbox 2개`를 준비하고 첫 체크박스인 `news`에 `fireEvent.click` 한 번과 업데이트 커밋을 잽니다.
- **repaired · 중간** — R4-ANTD5-S7의 열거 외 값 보존을 실행합니다. beta의 옵션 역조회는 `legacy`를 전달하지 않고 비교 커밋은 `['legacy','sports','news']`를 저장합니다. 구 집계가 보존 경로를 명시하며 값은 공개 테스트의 첫 토글에서 가져왔습니다. P1의 `checkboxChangePlain`은 열거에 있는 값만 씁니다. [집계 122행](../final-correction/speed-overview.md#L122), [R4 원장 43행](../final-correction/contract-ledger/canard-schema-form-antd5-plugin.md#L43), `packages/canard/schema-form-antd5-plugin/src/__tests__/roundFour.unknownCheckbox.table.test.tsx:11–50`, `src/fieldInputs/FieldInputStringCheckbox.tsx:60–64 / :59–69`.

## 2. antd5 / branchError

- **API** — `@canard/schema-form`의 `Form`, `registerPlugin`, `ValidationMode.OnRequest`, `ErrorVisibility.Always`, `FormHandle.validate():Promise<…>`와 `@canard/schema-form-antd5-plugin`의 `plugin`입니다. `packages/canard/schema-form/src/index.ts:4,8,12,53,70 / :4,8,12,53,70`, `src/components/Form/components/FormCore/types/handle.ts:52 / :52`, `packages/canard/schema-form-antd5-plugin/src/index.ts:8–13 / :8–13`.
- **입력과 측정** — 스키마는 `{type:'object',properties:{field:{type:'array',minItems:2,items:{type:'string'}}}}`, 값은 `{field:['a']}`입니다. 같은 공개 검증기 플러그인 구조를 두 커밋에 등록합니다. `validator.compile`이 반환하는 검증 함수는 이 값의 배열 길이가 2 미만이면 `[{keyword:'minItems',dataPath:'/field',message:'minItems constraint'}]`를, 그 외에는 `null`을 반환합니다. `compileGuard`는 이 스키마에서 호출되지 않습니다. `ValidationMode.OnRequest`, `ErrorVisibility.Always`와 플러그인 부품으로 `Form → 객체 → 배열 FieldRenderer → 문자열 입력 1개와 bound ErrorMessage`를 마운트합니다. `await act(async () => { await ref.current.validate() })` 한 번과 오류 커밋을 잽니다.
- **repaired · 중간** — R4-ANTD5-S6의 배열 분기 오류 표시에 닿습니다. 비교 커밋의 분기 렌더러는 배열 자체의 메시지를 표시합니다. 구 집계 T22가 분기와 bound ErrorMessage를 명시하며, 정확한 값은 공용 테스트의 배열 최솟값 사례에서 가져왔습니다. [집계 123행](../final-correction/speed-overview.md#L123), [R4 원장 42행](../final-correction/contract-ledger/canard-schema-form-antd5-plugin.md#L42), `packages/canard/schema-form-antd5-plugin/src/__tests__/roundFour.branchErrors.table.test.tsx:20–25,63–95`, `src/__tests__/fixtures/constraintValidator.ts:15–22,38–43`.

## 3. antd5 / coreExternalArray

- **API** — `@canard/schema-form`의 `Form`, `ValidationMode.None`, `FormHandle.findNode('/value/0')`와 반환 노드의 `setValue`, `@canard/schema-form-antd5-plugin`의 `plugin`을 씁니다. `packages/canard/schema-form/src/index.ts:8,12,41,53 / :8,12,41,53`, `src/components/Form/components/FormCore/types/handle.ts:43 / :43`, `packages/canard/schema-form-antd5-plugin/src/index.ts:8–13 / :8–13`.
- **입력과 측정** — `{type:'object',properties:{value:{type:'array',items:{type:'string',enum:['a','b','c']},presentation:{inputType:'checkbox'}}}}`, `defaultValue={value:['a']}`입니다. 플러그인 부품으로 `Form → 객체 → /value Checkbox.Group 1개 → 선택지 3개`를 준비합니다. 자식 노드 참조는 밖에서 찾고, `await act(async () => { item.setValue('b') })` 한 번을 잽니다. 목표 상태는 `{value:['b']}`이고 비교 커밋에서는 체크 표시도 `b`로 바뀝니다.
- **repaired · 중간** — T37의 외부 행 갱신에 대응해 R2-ANTD5-1 및 R2-SF-3의 동일 길이 배열 표시 동기화를 실행합니다. 공개 테스트의 `item` 쓰기를 택했습니다. 10행의 루트 쓰기와 다른 진입이며 여기서는 실제 Ant 위젯을 사용합니다. [집계 131행](../final-correction/speed-overview.md#L131), [R2 플러그인 원장 18행](../final-correction/contract-ledger/canard-schema-form-antd5-plugin.md#L18), [R2 코어 원장 29행](../final-correction/contract-ledger/canard-schema-form.md#L29), `packages/canard/schema-form-antd5-plugin/src/__tests__/arrayValueInputs.test.tsx:36–47,89–129`.

## 4. antd6 / multiEnumMount

- **API** — `@canard/schema-form`의 `Form`, `ValidationMode.None`과 `@canard/schema-form-antd6-plugin`의 `plugin`을 같은 방식으로 연결합니다. `packages/canard/schema-form/src/index.ts:8,53 / :8,53`, `packages/canard/schema-form-antd6-plugin/src/index.ts:8–13 / :8–13`.
- **입력과 측정** — 루트 `{type:'array',items:{type:'string',enum:['news','sports']}}`에 `defaultValue=[{legacy:'data'},'sports']`를 전달합니다. 플러그인 부품과 `ValidationMode.None`을 사용해 `Form → FieldRenderer → Ant 6 Select multiple`의 최초 클라이언트 마운트와 커밋 한 번을 잽니다. 선택지는 2개, 시작 저장 항목은 2개이며 메뉴는 열지 않습니다.
- **repaired · 중간** — R4-ANTD6-S7이 다룬 열거 외 JSON 값을 표시 경로에 전달합니다. beta는 객체가 섞이면 `defaultValue` 길이 전체를 Select에 넘기지 않고, 비교 커밋은 두 값을 각각 JSON 토큰으로 전달합니다. 구 집계가 목록 외 표시를 명시하고 객체 리터럴은 공개 테스트에서 가져왔습니다. [집계 137행](../final-correction/speed-overview.md#L137), [R4 원장 42행](../final-correction/contract-ledger/canard-schema-form-antd6-plugin.md#L42), `packages/canard/schema-form-antd6-plugin/src/__tests__/roundFour.unknownMultiSelect.table.test.tsx:30–45`, `src/fieldInputs/FieldInputStringEnum.tsx:70–80 / :59–67`.

## 5. antd-mobile / sliderChange

- **API** — `@canard/schema-form`의 `Form`, `ValidationMode.None`과 `@canard/schema-form-antd-mobile-plugin`의 `plugin`입니다. 두 커밋에서 `antd-mobile 5.43.0`을 고정합니다. `packages/canard/schema-form/src/index.ts:8,53 / :8,53`, `packages/canard/schema-form-antd-mobile-plugin/src/index.ts:8–13 / :8–13`.
- **입력과 측정** — 루트 `{type:'number',format:'slider',minimum:0,maximum:10,multipleOf:1}`, `defaultValue=2`, `ValidationMode.None`입니다. 플러그인 부품으로 `Form → FieldRenderer → 단일 손잡이 Slider`를 마운트합니다. `.adm-slider-track`에서 `getBoundingClientRect()`는 왼쪽 0, 위 0, 폭 100, 높이 10을 반환하게 하고 `offsetWidth=100`을 준비합니다. `fireEvent.click(track,{clientX:70,clientY:5})` 한 번과 커밋을 잽니다. 기본 lazy의 완료 콜백을 통해 저장값은 `7`입니다.
- **plain · 중간** — R5-MOBILE-P2/P3의 경계 및 표시 분기를 공유하지만 이 값은 잠기지 않은 포함 범위의 일반 정수 격자 값입니다. D3에서 철회된 키보드 경로도 사용하지 않습니다. 구 집계는 스칼라 변경을 명시하며 좌표와 값은 공개 트랙 테스트의 구성으로 고정했습니다. [집계 145행](../final-correction/speed-overview.md#L145), [R5 원장 51–52행](../final-correction/contract-ledger/canard-schema-form-antd-mobile-plugin.md#L51), [D3 278–286행](../final-correction/DECISIONS.md#L278), `packages/canard/schema-form-antd-mobile-plugin/src/__tests__/sliderConstraints.public.test.tsx:20–51`, `src/fieldInputs/FieldInputSlider.tsx:53–74 / :90–104,116–128`.

## 6. mui / checkboxChange

- **API** — `@canard/schema-form`의 `Form`, `ValidationMode.None`과 `@canard/schema-form-mui-plugin`의 `plugin`입니다. `packages/canard/schema-form/src/index.ts:8,53 / :8,53`, `packages/canard/schema-form-mui-plugin/src/index.ts:8–13 / :8–13`.
- **입력과 측정** — 루트 `{type:'array',items:{type:'string',enum:['news','sports']},presentation:{inputType:'checkbox'}}`, `defaultValue=['legacy','sports']`, `ValidationMode.None`입니다. 플러그인 부품으로 `Form → MUI FieldRenderer → checkbox 그룹과 체크박스 2개`를 마운트합니다. 첫 `news` 체크박스에 `fireEvent.click` 한 번과 업데이트 커밋을 잽니다.
- **repaired · 중간** — R4-MUI-8의 열거 외 값을 포함한 저장 배열 갱신에 닿습니다. 비교 커밋의 결과는 `['legacy','sports','news']`입니다. 구 집계의 그룹 변경을 공개 테스트의 첫 토글로 구체화했습니다. 1행은 Ant, 이 행은 MUI 입력을 구동합니다. [집계 155행](../final-correction/speed-overview.md#L155), [R4 원장 40행](../final-correction/contract-ledger/canard-schema-form-mui-plugin.md#L40), `packages/canard/schema-form-mui-plugin/src/__tests__/roundFour.unknownCheckbox.table.test.tsx:11–50`.

## 7. mui / branchError

- **API** — `@canard/schema-form`의 `Form`, `registerPlugin`, `ErrorVisibility.Always`, `ValidationMode.OnRequest`, `FormHandle.validate()`와 `@canard/schema-form-mui-plugin`의 `plugin`입니다. `packages/canard/schema-form/src/index.ts:4,8,12,53,70 / :4,8,12,53,70`, `src/components/Form/components/FormCore/types/handle.ts:52 / :52`, `packages/canard/schema-form-mui-plugin/src/index.ts:8–13 / :8–13`.
- **입력과 측정** — 2행과 같은 고정 스키마 `{type:'object',properties:{field:{type:'array',minItems:2,items:{type:'string'}}}}`, 값 `{field:['a']}`, 검증기와 검증 모드를 사용합니다. `Form → MUI FieldRenderer → /field 배열 분기 → 문자열 입력 1개와 bound ErrorMessage`를 먼저 마운트하고 `await act(async () => { await ref.current.validate() })` 한 번과 오류 커밋을 잽니다.
- **repaired · 중간** — R4-MUI-1이 복원한 배열 자체의 오류를 분기에서 표시합니다. 구 집계의 T22 작업을 같은 스키마로 비교하되 2행과 다른 공개 플러그인 렌더러를 사용합니다. [집계 156행](../final-correction/speed-overview.md#L156), [R4 원장 33행](../final-correction/contract-ledger/canard-schema-form-mui-plugin.md#L33), `packages/canard/schema-form-mui-plugin/src/__tests__/roundFour.branchErrors.table.test.tsx:20–25,63–95`.

## 8. schema-form core / context-error-cause

- **API** — `@canard/schema-form`의 `Form`, `context` 및 `fieldInputMap`입니다. `packages/canard/schema-form/src/index.ts:8 / :8`, `src/components/Form/components/FormCore/types/props.ts:70,114 / :70,114`. beta는 `useSnapshot`, 비교 커밋은 전용 비교기를 내부에서 사용합니다. 측정은 양쪽의 공개 재렌더 경계입니다.
- **입력과 측정** — `{type:'object',properties:{field:{type:'string',controls:{watch:['@']}}}}`와 `defaultValue={field:'a'}`, `ValidationMode.None`입니다. 같은 메시지 `'fail'`을 가진 두 `Error`를 만들고 각각 비열거 자기 `cause`를 `'one'`, `'two'`로 정의합니다. `Form → 객체 → /field Probe`를 사용하며 `fieldInputMap['/field']`의 Probe는 `node.watchValues?.[0]?.error`를 관찰하고 `null`을 반환합니다. 첫 Error를 담은 `left={error:first}`를 `context`로 전달해 마운트합니다. 둘째 Error를 담은 `right={error:second}`를 새 `context`로 전달하는 `rerender` 한 번과 커밋을 잽니다.
- **repaired · 중간** — R5.P4/R5-SF-F5의 `cause` 비교를 직접 실행합니다. 공개 테스트는 cause만 바뀐 새 Error가 관찰자에게 전달됨을 고정합니다. 구 집계의 비교기 단독 시간 대신 공개 폼 갱신 비용을 측정합니다. P1의 `context-update`는 Error 없는 일반 객체입니다. [집계 160–161행](../final-correction/speed-overview.md#L160), [C16 183–187행](../final-correction/DECISIONS.md#L183), [R5 원장 102행](../final-correction/contract-ledger/canard-schema-form.md#L102), `packages/canard/schema-form/src/__tests__/e2e/contextErrorSlots.test.tsx:8–19,27–55`.

## 9. schema-form core / mount-100

- **API** — `@canard/schema-form`의 `Form`과 `ValidationMode.None`입니다. `packages/canard/schema-form/src/index.ts:8,53 / :8,53`, `src/components/Form/components/FormCore/types/props.ts:44,46,95 / :44,46,95`.
- **입력과 측정** — i=0…99에 키 `'field'+i`, 순서대로 `{type:'string'}` 스키마와 `'value'+i`를 붙인 기본값으로 루트 객체를 만듭니다. `Form → 기본 객체 렌더러 → 문자열 입력 100개`를 같은 스키마 및 값 참조로 한 번 예열하고, `renderToString` 한 번으로 HTML을 만드는 구간을 잽니다. 코어 행은 SSR 경로를 사용합니다.
- **plain · 중간** — 보고서의 일반 필드 100개, 루트 포함 표시 101개를 따릅니다. R5-SF-F15/F22 관련 정착 준비에 닿지만 별칭, 이탈, 비활성 값, Merge가 없습니다. R2-SF-6의 초기 오류도 전달하지 않습니다. 리프 타입과 리터럴은 제안값입니다. [집계 164행](../final-correction/speed-overview.md#L164), [엔진 보고 243·363행](../final-correction/engine-report.md#L243), [설계 220행](../final-correction/engine-design.md#L220), [C12 159–163행](../final-correction/DECISIONS.md#L159), `packages/canard/schema-form/src/__tests__/e2e/formIdsHydration.round-three.test.tsx:11–25`.

## 10. schema-form core / whole-array-client-write

- **API** — `@canard/schema-form`의 `Form`, `ValidationMode.None`, `fieldInputMap`, `FormHandle.setValue(value)`입니다. `packages/canard/schema-form/src/index.ts:8,12,53 / :8,12,53`, `src/components/Form/components/FormCore/types/handle.ts:49 / :49`, `src/components/Form/components/FormCore/types/props.ts:70 / :70`.
- **입력과 측정** — 스키마 `{type:'object',properties:{list:{type:'array',items:{type:'string'}}}}`, `defaultValue={list:['a']}`입니다. `fieldInputMap['/list']`는 자식 프록시를 만들지 않는 비제어 `input`으로, `defaultValue={JSON.stringify(defaultValue)}`와 변경 시 `onChange([event.target.value])`를 연결합니다. `Form → 기본 객체 → /list 사용자 입력`을 먼저 마운트하고 `await act(async () => { ref.current.setValue({list:['b']}) })` 한 번과 커밋을 잽니다. 비교 커밋에서 새 DOM 입력이 `["b"]`를 표시합니다.
- **repaired · 중간** — R2-SF-3의 동일 길이 외부 쓰기 재부착을 실행합니다. P1 자체 쓰기의 DOM 유지와 달리 이 행은 폼 루트에 외부 값을 씁니다. 엔진 보고서가 별도 배열 노드 직접 쓰기와 구분한 역사 `act` 경계를 택했습니다. [집계 165–166행](../final-correction/speed-overview.md#L165), [엔진 보고 247행](../final-correction/engine-report.md#L247), [R2 원장 29행](../final-correction/contract-ledger/canard-schema-form.md#L29), `packages/canard/schema-form/src/__tests__/e2e/wholeArray.round-two.test.tsx:14–45`.

## 11. schema-form core / anchor-slider6-gate

- **API** — `@canard/schema-form`의 `Form`, `ValidationMode.None`, `FormHandle.findNode`, `FormHandle.focus(path?)`와 `@canard/schema-form-antd6-plugin`의 `plugin`입니다. `packages/canard/schema-form/src/index.ts:8,12,53 / :8,12,53`, `src/components/Form/components/FormCore/types/handle.ts:29,43 / :29,43`, `packages/canard/schema-form-antd6-plugin/src/index.ts:8–13 / :8–13`.
- **입력과 측정** — 루트 객체에 `enabled:{type:'boolean'}`과 `level:{type:'number',minimum:0,maximum:10,multipleOf:1,presentation:{inputType:'slider'},controls:{active:'../enabled === true'}}`를 둡니다. 플러그인 부품과 `ValidationMode.None`으로 `defaultValue={enabled:false,level:4}`를 먼저 마운트합니다. `Form → Ant 6 FieldRenderer → enabled Checkbox 및 조건부 level Slider` 트리에서 `/enabled` 노드를 미리 얻습니다. 측정은 `await act(async () => { enabled.setValue(true) })` 한 번으로 Slider를 만들고 별도 `await act(async () => { ref.current.focus('/level') })`로 포커스 요청이 처리될 때까지입니다. DOM 포커스 확인은 측정 밖입니다.
- **repaired · 낮음** — 구 집계가 확인한 것은 설치된 Ant Slider의 ref 등록까지입니다. 공개 포커스 테스트를 결합한 제안은 D1의 등록과 앵커 선택을 실행합니다. beta에는 선택적 `focusRef`가 없지만 공개 `focus(path)`는 호출할 수 있습니다. gate 표현식과 정확한 측정 경계는 미확인입니다. [집계 167행](../final-correction/speed-overview.md#L167), [D1 244–253행](../final-correction/DECISIONS.md#L244), `packages/canard/schema-form-antd6-plugin/src/__tests__/sliderFocus.public.test.tsx:12–39`, `src/fieldInputs/FieldInputSlider.tsx:24,65`.

## 12. style-utils / lists

- **API** — `@winglet/style-utils`의 `styleManagerFactory(scopeId)`가 반환하는 `inject(id,css,compressed?)`와 정리용 `destroyScope(scopeId)`입니다. 문서 대상의 호출 형태는 같습니다. `packages/winglet/style-utils/src/index.ts:1 / :1`, `src/styleManager/styleManagerFactory.ts:59 / :63`.
- **입력과 측정** — 문서 스코프 `p2-lists`를 사용합니다. i=0…199에 `.a{i},.b{i}>.c,.d{i}:hover{color:red;margin:0}`를 만들고 순서대로 붙입니다. 본문의 `{i}`는 10진 인덱스를 삽입하는 자리입니다. 같은 시트를 `inject('sheet',css,true)`로 한 번 적용하고 예약 프레임을 처리한 뒤, 표본당 같은 호출 한 번을 잽니다. 12–16행은 이 방식으로 스코핑을 비교합니다. 프레임 처리와 스코프 제거는 측정 밖입니다.
- **repaired · 중간** — R1-ST-2는 최상위 쉼표에서 나눠 600개 선택자 모두에 접두사를 붙입니다. beta는 규칙 전체 앞에 한 번 붙입니다. 남아 있는 `scope/lists` 벤치의 200개 규칙은 동일한 형태이며 두 버전에 같은 축약 문자열을 전달하도록 고정했습니다. [집계 215행](../final-correction/speed-overview.md#L215), [R1 원장 11–12행](../final-correction/contract-ledger/winglet-style-utils.md#L11), `packages/winglet/style-utils/src/__benchmarks__/ordinaryCss.bench.ts:8,56–60,88–92,111`, beta `src/styleManager/StyleManager/StyleManager.ts:303–313`.

## 13. style-utils / opaque

- **API** — `@winglet/style-utils`의 `styleManagerFactory(scopeId)` → `inject(id,css,compressed?)`입니다. `packages/winglet/style-utils/src/index.ts:1 / :1`, `src/styleManager/styleManagerFactory.ts:59 / :63`.
- **입력과 측정** — `p2-opaque` 문서 스코프에 i=0…199의 `.x{i}:is(.p,.q),a[title="t,{i}"],.y{i}:not(.r,.s){color:red}`를 이어 붙인 시트를 준비합니다. `{i}`는 인덱스입니다. 12행의 예열 방식으로 `inject('sheet',css,true)` 한 번을 잽니다. 200개 규칙마다 최상위 선택자 3개와 내부 쉼표 3개입니다.
- **repaired · 중간** — R1-ST-2/A1의 최상위 선택자 분리와 따옴표·함수 경계를 함께 실행합니다. 구 집계의 추가 400개는 규칙마다 실제 최상위 선택자가 3개인 남은 `scope/isLists` 자료와 부합합니다. [집계 216행](../final-correction/speed-overview.md#L216), [R1 원장 12·16행](../final-correction/contract-ledger/winglet-style-utils.md#L12), `packages/winglet/style-utils/src/__benchmarks__/ordinaryCss.bench.ts:62–66,112`, `src/__tests__/publicCssScoping.test.ts:42–45`.

## 14. style-utils / media

- **API** — `@winglet/style-utils`의 `styleManagerFactory(scopeId)` → `inject(id,css,compressed?)`입니다. `packages/winglet/style-utils/src/index.ts:1 / :1`, `src/styleManager/styleManagerFactory.ts:59 / :63`.
- **입력과 측정** — `p2-media` 문서 스코프입니다. i=0…199의 `@media (min-width:{i}px){.m{i}{color:red}.n{i}>.o{margin:0}}`를 붙입니다. `{i}`는 인덱스입니다. 중첩 그룹 200개, 그룹마다 일반 규칙 2개입니다. 12행과 같이 예열한 후 `inject('sheet',css,true)` 한 번을 잽니다.
- **repaired · 중간** — R1-ST-1의 묶음 내부 스코핑을 실행합니다. 비교 커밋은 두 자식 규칙을 모두 스코핑합니다. 입력은 남아 있는 `scope/media`의 생성 규칙을 두 버전 공통 축약 문자열로 옮겼습니다. [집계 217행](../final-correction/speed-overview.md#L217), [R1 원장 11행](../final-correction/contract-ledger/winglet-style-utils.md#L11), `packages/winglet/style-utils/src/__benchmarks__/ordinaryCss.bench.ts:68–72,113`, `src/__tests__/publicCssScoping.test.ts:23–35`.

## 15. style-utils / escapes

- **API** — `@winglet/style-utils`의 `styleManagerFactory(scopeId)` → `inject(id,css,compressed?)`입니다. `packages/winglet/style-utils/src/index.ts:1 / :1`, `src/styleManager/styleManagerFactory.ts:59 / :63`.
- **입력과 측정** — `p2-escapes` 문서 스코프입니다. i=0…199마다 `.e{i}` 뒤에 백슬래시 한 개와 공백 한 개를 두고, 이어 `,.q{i}` 뒤에 백슬래시 한 개와 작은따옴표 한 개를 둔 다음 `x{color:red}`를 붙입니다. `{i}`는 인덱스입니다. 규칙 200개와 규칙당 escape 두 개를 가진 한 시트로 12행과 같이 `inject('sheet',css,true)` 한 번을 잽니다.
- **repaired · 낮음** — R3-ST-1의 escape된 따옴표와 R3-ST-6의 선택자 끝 escape 공백을 실행합니다. 공개 테스트의 두 철자를 한 시트에 고정했습니다. 구 집계의 escape 문자 종류, 반복 크기, 압축 설정은 미확인입니다. [집계 218행](../final-correction/speed-overview.md#L218), [R3 원장 26·31행](../final-correction/contract-ledger/winglet-style-utils.md#L26), `packages/winglet/style-utils/src/__tests__/publicEscapes.round3.test.ts:5–17,69–79`, `src/__tests__/publicCssScoping.test.ts:63–66`.

## 16. style-utils / pseudo

- **API** — `@winglet/style-utils`의 `styleManagerFactory(scopeId)` → `inject(id,css,compressed?)`입니다. `packages/winglet/style-utils/src/index.ts:1 / :1`, `src/styleManager/styleManagerFactory.ts:59 / :63`.
- **입력과 측정** — `p2-pseudo` 문서 스코프에 i=0…199의 `.card{i}:is(.open,.busy),.card{i}:not(.idle,.closed){color:red}`를 붙입니다. `{i}`는 인덱스입니다. 200개 규칙마다 함수형 의사 클래스 두 개를 가진 시트를 12행과 같이 예열하고 `inject('sheet',css,true)` 한 번을 잽니다.
- **repaired · 낮음** — R1-ST-2가 두 최상위 선택자를 분리하고 함수 내부의 쉼표는 보존합니다. `:root`와 `:host`의 R3 특수 처리는 이 입력에 없습니다. `opaque`에서 사용한 속성 선택자를 빼고 의사 클래스에 집중한 제안입니다. 구 전용 시트는 미확인입니다. [집계 219행](../final-correction/speed-overview.md#L219), [R1/R3 원장 12·30행](../final-correction/contract-ledger/winglet-style-utils.md#L12), `packages/winglet/style-utils/src/__tests__/publicCssScoping.test.ts:42–45,59–62`.

## 17. style-utils / mixed

- **API** — `@winglet/style-utils`의 `styleManagerFactory(scopeId)` → `inject(id,css,compressed?)`입니다. `packages/winglet/style-utils/src/index.ts:1 / :1`, `src/styleManager/styleManagerFactory.ts:59 / :63`.
- **입력과 측정** — 저장소 상시 벤치의 `ordinaryCss.bench.ts`에서 `large`, `lists`, `isLists`, `media`, `colonSpaces`, `quoted` 템플릿을 그대로 사용합니다. 각각 i=0…199의 템플릿 반복을 개행으로 연결하고, 여섯 시트를 위 순서대로 개행 하나씩 넣어 연결한 `mixed` 원문을 두 버전에 동일하게 전달합니다. `p2-mixed` 문서 스코프에서 `inject('sheet',css)`를 예열한 뒤 표본당 한 번 잽니다. 압축과 스코핑이 모두 포함됩니다.
- **repaired · 중간** — R1-ST-1/2의 중첩 그룹 및 실제 목록 처리를 실행합니다. R1-ST-5의 선언 콜론 처리와 R3 escape 구문도 함께 지나갑니다. 상시 벤치가 같은 이름의 정확한 새 측정 시트를 제공하며 구 집계가 압축 준비와 복합 스코핑을 명시합니다. [집계 220행](../final-correction/speed-overview.md#L220), [R1 수정 185–191행](../round-1/FIXES.md#L185), `packages/winglet/style-utils/src/__benchmarks__/ordinaryCss.bench.ts:8–10,31–86,95–99,116–118`.

## 18. agents-assets-sync / installer-new

- **API** — `@slats/agents-assets-sync`의 공개 ESM `runCli(argv?:readonly string[]):Promise<void>`입니다. 두 버전이 아래 CLI 인자를 지원합니다. `packages/slats/agents-assets-sync/src/index.ts:2 / :2`, `src/commands/runCli/runCli.ts:40,51–89 / :42,62–100`.
- **입력과 측정** — 표본별 임시 프로젝트 루트에 빈 `.git` 디렉터리와 `node_modules/@probe/p2`를 만들고, 그 패키지의 `package.json`을 `{name:'@probe/p2',version:'1.0.0',agents:{assetPath:'agents'}}`로 둡니다. i=0…15에 이름 `p2-s{i}`를 써서 `agents/skills/p2-s{i}/SKILL.md` 16개를 만듭니다. 각 UTF-8 문서는 LF를 사용하고, 줄은 순서대로 `---`, `name: p2-s{i}`, `description: Fixture p2-s{i}.`, `---`, 빈 줄, `# Fixture p2-s{i}`이며 마지막 LF를 포함합니다. 사전 manifest와 설치 대상 파일은 없습니다. argv는 `['node','inject-agents-settings','--package=@probe/p2','--agent=claude','--scope=project','--asset-path=agents','--root='+root,'--no-interactive']`입니다. 비대화형 출력의 수집을 미리 설정하고 `await runCli(argv)` 한 번을 잽니다. `.claude/skills` 아래 16개 파일을 생성합니다.
- **plain · 낮음** — R1-AS-1의 목적지 검사와 런타임 해시 준비를 지나지만 모든 상대 경로가 정상이고 기존 파일 충돌, 낡은 manifest, 실패 단위가 없습니다. 구 집계의 파일 쓰기 및 런타임 소스 읽기를 재현하며 파일 수와 본문은 제안값입니다. [집계 224행](../final-correction/speed-overview.md#L224), [R1 원장 11행](../final-correction/contract-ledger/slats-agents-assets-sync.md#L11), `packages/slats/agents-assets-sync/src/__tests__/applySafety.test.ts:20–45,53–63`, `src/core/hashManifest/utils/computeHashManifest.ts:24–41`.

## 19. agents-assets-sync / installer-unchanged

- **API** — `@slats/agents-assets-sync`의 공개 `runCli(argv?)`입니다. `packages/slats/agents-assets-sync/src/index.ts:2 / :2`, `src/commands/runCli/runCli.ts:40,51–89 / :42,62–100`.
- **입력과 측정** — 각 표본의 임시 프로젝트에 18행의 원본 16개와 같은 argv를 준비합니다. 같은 버전의 `runCli(argv)`로 한 차례 설치해 목적지 파일 내용과 설치에 필요한 기록을 마련합니다. 이 준비 호출 뒤 아무 파일도 바꾸지 않고 `await runCli(argv)` 두 번째 호출 한 번을 잽니다. 생성, 변경, 삭제가 모두 0건인지 측정 밖에서 확인합니다.
- **plain · 낮음** — 런타임 해시, 기존 대상 및 소유권 준비를 거치지만 R1-AS-4의 CRLF 변환, R1-AS-5의 잡음 파일, R3-AS-5의 낡은 manifest가 없습니다. 원본 규모와 파일 배치는 제안값입니다. [집계 225행](../final-correction/speed-overview.md#L225), [원장 14–15·32행](../final-correction/contract-ledger/slats-agents-assets-sync.md#L14), `packages/slats/agents-assets-sync/src/__tests__/applySafety.test.ts:143–151`.

## 20. agents-assets-sync / installer-force

- **API** — `@slats/agents-assets-sync`의 `runCli(argv?)`와 양쪽의 `--force --yes`입니다. `packages/slats/agents-assets-sync/src/index.ts:2 / :2`, `src/commands/runCli/runCli.ts:40,78–84 / :42,89–95`.
- **입력과 측정** — 표본별로 18행의 원본에 `agents/skills/p2-s0/extra.md`의 UTF-8 본문 `'# Extra\n'`을 더해 17개를 만든 상태에서 일반 argv로 먼저 설치합니다. 준비 단계에서 원본 `extra.md`를 삭제하고 목적지 `.claude/skills/p2-s1/SKILL.md`의 끝에 `'\nLocal edit.\n'`을 붙입니다. `await runCli([...argv,'--force','--yes'])` 한 번을 잽니다. 목적지 고아 1개 삭제와 수정 파일 1개 복원을 확인합니다. 비교 커밋의 stderr 삭제 목록도 측정 밖에서 확인합니다.
- **repaired · 낮음** — R1-AS-2/3의 고아 처리와 삭제 알림, R3-AS-8의 덮어쓰기 보고를 실행합니다. 구 행의 강제 적용 경로와 공개 테스트 두 건을 결합했습니다. 두 종류 변경의 동시 발생 여부와 규모는 미확인입니다. [집계 226행](../final-correction/speed-overview.md#L226), [R1/R3 원장 12–13·35행](../final-correction/contract-ledger/slats-agents-assets-sync.md#L12), `packages/slats/agents-assets-sync/src/__tests__/applySafety.test.ts:112–125`, `src/__tests__/roundThree/forceReport.test.ts:52–82`.

## 21. common-utils / isEmpty-foreign-map

- **API** — `@winglet/common-utils`의 `isEmpty(value:unknown):boolean`입니다. `packages/winglet/common-utils/src/index.ts:123 / :123`, `src/utils/filter/isEmpty.ts:435 / :435`.
- **입력과 측정** — 미리 만든 단일 `node:vm` 컨텍스트에 호스트 `Map`을 주입하지 않고, 그 안에서 각각 `new Map([[1,2]])`인 서로 다른 Map K개를 생성합니다. 배치에서 고정 순서로 각 Map에 `isEmpty(map)` 한 번을 호출해 반환값을 누적하고, 배치 시간을 K로 나눕니다. K는 양쪽에 공통으로 적용하며 빠른 쪽 배치가 약 5ms가 되도록 정합니다. 두 커밋에서 호출 결과는 모두 `true`입니다.
- **plain · 중간** — 구 집계가 R2 7번 수리로 분류한 외부 Map을 그대로 사용합니다. V4가 태그 기반 수리를 취소했으며 지정된 두 커밋은 로컬 `instanceof`를 쓰므로 외부 Map의 자기 열거 키 검사로 내려갑니다. 이 입력에서 현재 수리 비용은 예상하지 않습니다. [집계 229·299행](../final-correction/speed-overview.md#L229), [R2 7번 29행](../round-2/FIXES.md#L29), [R5 원장 68행](../final-correction/contract-ledger/winglet-common-utils.md#L68), [V4 66–69행](../final-correction/DECISIONS.md#L66), `packages/winglet/common-utils/src/__tests__/publicObjectLimits.test.ts:46–51`.

## 22. json-schema / schema-known-noncanonical

- **API** — `@winglet/json-schema`의 `createReferenceResolver(rootSchema,{resources})`, 반환 객체의 `root(rootSchema)`와 `resolve(reference,keyword,context)`입니다. `packages/winglet/json-schema/src/index.ts:34 / :34`, `src/utils/JSONSchemaScanner/createReferenceResolver/createReferenceResolver.ts:13 / :13`, `src/utils/JSONSchemaScanner/utils/type.ts:112–128 / :112–128`.
- **입력과 측정** — 루트를 `{$id:'https://ex.example/root.json',$defs:{T:{$id:'https://ex.example/known.json',type:'string'}}}`로 만듭니다. i=0…19에 `'HTTPS://EX.example/doc-'+i+'.json'`을 키로, 각각 `{type:'number'}`를 값으로 등록합니다. 매 표본에서 리졸버와 루트 context를 미리 만들고 첫 `resolve('HTTPS://EX.example/known.json','$ref',context)` 한 번만 잽니다. 두 버전에서 루트 안의 이미 색인된 `T`로 해소됩니다.
- **plain · 중간** — R1-JSC-1/4로 추가된 이미 알려진 내장 주소의 등록 키 대조를 수행합니다. 비정규 키들은 모두 다른 주소이고 충돌이 없습니다. 별도 `schema-alternate-lookup`처럼 등록 철자 정규화가 있어야만 찾을 수 있는 대상과 구별합니다. 집계의 알려진 비정규 조회를 코드 경로에 맞췄으며 등록 수는 제안값입니다. [집계 248–249행](../final-correction/speed-overview.md#L248), [R1 원장 11·14행](../final-correction/contract-ledger/winglet-json-schema.md#L11), `packages/winglet/json-schema/src/utils/JSONSchemaScanner/createReferenceResolver/utils/ResolverStore/ResolverStore.ts:352 / :418–443,453–471`, `src/__tests__/publicCreateReferenceResolver.registered-resources.test.ts:216–230`.

## 23. json-schema / schema-first-embedded

- **API** — `@winglet/json-schema`의 `createReferenceResolver(rootSchema,{resources})`, `root(rootSchema)`, `resolve(reference,keyword,context)`입니다. `packages/winglet/json-schema/src/index.ts:34 / :34`, `src/utils/JSONSchemaScanner/createReferenceResolver/createReferenceResolver.ts:13 / :13`, `src/utils/JSONSchemaScanner/utils/type.ts:112–128 / :112–128`.
- **입력과 측정** — 루트 `{$id:'https://ex.example/root.json',type:'object'}`를 쓰고, i=0…19마다 `https://ex.example/doc-{i}.json` 키와 같은 `$id`를 가진 `{type:'object'}` 문서를 등록합니다. 마지막 문서에만 `$defs:{T:{$id:'https://ex.example/nested.json',type:'string'}}`을 추가합니다. `{i}`는 인덱스입니다. 표본별 새 리졸버와 context를 미리 만들고 첫 `resolve('nested.json','$ref',context)` 한 번을 잽니다. beta는 미해결, 비교 커밋은 `nested.json#`의 문자열 스키마로 해소됩니다.
- **repaired · 중간** — R1-JSC-1이 첫 미등록 주소 조회 시 등록 문서 전체를 색인하여 등록 키 없이 내장된 ID를 발견합니다. 구 집계의 루트 포함 21개 문서와 공개 테스트의 내장 ID를 적용했습니다. P1 `schema-first-miss`는 실제 내장 대상이 없습니다. [집계 250–251행](../final-correction/speed-overview.md#L250), [R1 원장 11행](../final-correction/contract-ledger/winglet-json-schema.md#L11), [R1 판정 15행](../round-1/winglet-json-schema.md#L15), `packages/winglet/json-schema/src/__tests__/publicCreateReferenceResolver.registered-resources.test.ts:9–40`.

## 24. json-schema / schema-key-collision

- **API** — `@winglet/json-schema`의 `createReferenceResolver(rootSchema,{resources})`, `root(rootSchema)`, `resolve(reference,keyword,context)`입니다. 두 커밋의 서명은 같으며 충돌 결과가 다릅니다. `packages/winglet/json-schema/src/index.ts:34 / :34`, `src/utils/JSONSchemaScanner/createReferenceResolver/createReferenceResolver.ts:13 / :13`, `src/utils/JSONSchemaScanner/utils/type.ts:112–128 / :112–128`.
- **입력과 측정** — 루트 `{$id:'https://ex.example/root.json'}`와 등록 문서 두 개를 둡니다. `https://ex.example/a.json`은 동일 `$id`와 `$defs:{B:{$id:'https://ex.example/b.json',type:'string'}}`을 갖습니다. `https://ex.example/b.json`은 별도 `{$id:'https://ex.example/b.json',type:'number'}`입니다. 매 표본에서 리졸버를 새로 만들고 `resolve('a.json','$ref',context)`로 먼저 내장 자원을 색인합니다. 이후 `resolve('b.json','$ref',context)` 한 번을 공통 `try/catch`로 잽니다. 비교 커밋은 중복 식별자 오류, beta는 먼저 색인된 내장 스키마 해소를 예상합니다.
- **repaired · 중간** — R1-JSC-1의 이미 알려진 내장 주소와 등록 키 충돌이 실행됩니다. 이름과 R1 귀속은 구 집계를, 사전 조회 순서와 정규 키 사례는 공개 테스트를 따릅니다. 22행은 같은 종류의 등록 대조가 다른 주소만 만나므로 충돌하지 않습니다. [집계 252행](../final-correction/speed-overview.md#L252), [R1 원장 11행](../final-correction/contract-ledger/winglet-json-schema.md#L11), `packages/winglet/json-schema/src/__tests__/publicRegistrationRetry.test.ts:7–11,39–66`.

## 확인이 필요한 행

- **낮은 신뢰도** — 11 `anchor-slider6-gate`의 게이트와 포커스 구간, 15 `escapes`와 16 `pseudo`의 원래 시트, 18–20 설치 행의 원래 파일 수와 대상 상태.
- **공개 경계와 동작 차이** — 8 `context-error-cause`는 공개 `Form` 갱신 전체를 잽니다. 11 `anchor-slider6-gate`는 양쪽의 공개 `focus(path)`를 사용하며 비교 커밋에서 D1의 선택적 앵커가 연결됩니다. 21 `isEmpty-foreign-map`은 V4의 철회가 적용된 두 커밋에서 일반 행입니다. 23 `schema-first-embedded`와 24 `schema-key-collision`은 같은 공개 호출로 해소 여부 및 예외가 달라집니다.
