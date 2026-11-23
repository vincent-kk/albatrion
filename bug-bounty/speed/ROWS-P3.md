# 우선순위 3 속도 행 입력 명세

두 커밋은 beta `1c77ced57`, 비교 대상 `d78e45c6b`입니다. 아래는 확인된 부분 명세이며, 미확인 항목을 측정 행으로 사용해서는 안 됩니다. `repaired`는 수정 경로에 닿는다는 예상이며 비용 귀속을 입증하는 측정 결과는 아닙니다.

## 1. ajv7 / default/rootIdCompile

- **API** — `@canard/schema-form-ajv7-plugin`의 `plugin.validator.compile(schema)`. 공개 진입점은 `packages/canard/schema-form-ajv7-plugin/src/index.ts:5 / :8`, 호출 구현은 `src/validator/validatorPlugin.ts:99 / :84`입니다. 두 커밋에서 호출 형태가 같습니다.
- **입력과 측정** — 표본마다 새 스키마 `{$id:'https://example.test/root',type:'string'}`를 준비하고 `compile(schema)` 한 번을 잽니다. 반환값은 두 커밋 모두 검증 함수이며, 측정 밖에서 이 함수에 `'ok'`를 전달하면 `null`을 얻습니다. 캐시된 재컴파일을 피하도록 표본마다 새 validator 수명을 준비해야 하며, 해당 준비가 공개 API만으로 동일하게 이루어지는지 추가 확인이 필요합니다.
- **repaired · 낮음** — I24/I29의 앱 소유 등록을 건드리지 않는 분리 컴파일이 예상됩니다. 필요한 작업은 앱 설정을 유지하면서 이 루트의 분리된 컴파일 범위를 한 번 준비하는 것입니다. 원래 측정의 정확한 스키마는 확인되지 않았습니다. [원장 R5-AJV7-OWN](../final-correction/contract-ledger/canard-schema-form-ajv7-plugin.md#L35), [집계](../final-correction/speed-overview.md#L60).

## 2. ajv7 / default/bindCompile

- **API** — 같은 패키지의 `plugin.validator.bind(ajv)`와 `plugin.validator.compile(schema)`입니다. `packages/canard/schema-form-ajv7-plugin/src/index.ts:5 / :8`, `src/validator/validatorPlugin.ts:92,99 / :81,84`. 두 커밋에서 호출 형태가 같습니다.
- **입력과 측정** — AJV 7 인스턴스와 `{type:'string'}`을 표본 밖에서 준비합니다. `bind(ajv)`와 `compile(schema)`를 순서대로 묶어 측정하고, 얻은 검증 함수가 `'ok'`에 대해 `null`을 반환하는지 표본 밖에서 확인합니다. bind 자체가 원래 측정 구간에 포함되었는지는 미확인입니다.
- **repaired · 낮음** — I24/I29 앱 범위 격리를 위한 인스턴스 분리 및 루트 컴파일을 한 번 수행하는 비용입니다. [원장 R5-AJV7-OWN](../final-correction/contract-ledger/canard-schema-form-ajv7-plugin.md#L35), [집계](../final-correction/speed-overview.md#L61).

## 3. ajv7 / default/factoryCompile

- **API** — `createValidatorFactory(ajv)(schema)`. `packages/canard/schema-form-ajv7-plugin/src/index.ts:9 / :13`, `src/validator/createValidatorFactory.ts:7 / :10`; 같은 두 단계 호출이 가능합니다.
- **입력과 측정** — AJV 7 인스턴스와 `{type:'string'}`을 준비하고 새 팩터리를 만들어 컴파일하는 한 번을 잽니다. 반환된 검증 함수가 `'ok'`에 대해 `null`을 반환하는지는 측정 밖에서 확인합니다. 원래 행의 팩터리 생성 포함 여부는 미확인입니다.
- **repaired · 낮음** — I24/I29의 분리 범위와 루트 등록을 한 번 준비하는 경로입니다. [원장 R5-AJV7-OWN](../final-correction/contract-ledger/canard-schema-form-ajv7-plugin.md#L35), [집계](../final-correction/speed-overview.md#L62).

## 4. ajv7 / default/r5/factory/fresh

- **API** — 3행의 `createValidatorFactory(ajv)(schema)`입니다. 두 커밋의 공개 호출 형태는 같습니다.
- **입력과 측정** — 표본마다 새 AJV 7 인스턴스와 `{$id:'https://example.test/fresh',type:'string'}`을 준비한 뒤 팩터리 생성과 컴파일을 잽니다. 검증 함수가 `'ok'`에 `null`을 반환하는지 측정 밖에서 확인합니다. 원래 입력과 표본 경계는 미확인입니다.
- **repaired · 낮음** — I24/I29의 앱 범위 격리와 새 루트의 분리 컴파일 준비를 한 번 수행합니다. [원장 R5-AJV7-OWN](../final-correction/contract-ledger/canard-schema-form-ajv7-plugin.md#L35), [집계](../final-correction/speed-overview.md#L74).

## 5. ajv8 / default/r5/factory/fresh

- **API** — `@canard/schema-form-ajv8-plugin`의 `createValidatorFactory(ajv)(schema)`. `packages/canard/schema-form-ajv8-plugin/src/default/index.ts:10 / :10`. 두 커밋의 공개 호출 형태는 같습니다.
- **입력과 측정** — AJV 8 인스턴스와 4행의 스키마를 매 표본 새로 준비하고 팩터리 생성과 컴파일을 잽니다. 검증 함수가 `'ok'`에 `null`을 반환하는지 측정 밖에서 확인합니다. 원래 입력과 측정 경계는 미확인입니다.
- **repaired · 낮음** — I24/I29의 앱 소유 영역 분리와 루트 등록을 한 번 준비합니다. [원장 R5-AJV8-OWN](../final-correction/contract-ledger/canard-schema-form-ajv8-plugin.md#L41), [집계](../final-correction/speed-overview.md#L90).

## 6. schema-form core / anchor-ssr-initial-errors

- **API** — `@canard/schema-form`의 `Form`과 `ValidationMode.None`. `packages/canard/schema-form/src/index.ts:8,53 / :8,53`이며 같은 props를 씁니다.
- **입력과 측정** — 공개 회귀 테스트처럼 스키마 `{type:'object',properties:{name:{type:'string',default:'taken'}}}`, errors `[{dataPath:'/name',keyword:'server',message:'This name is taken.'}]`를 준비합니다. 함수 자식이 `<output>{String(errors?.length ?? 0)}</output>`을 반환하는 `Form`의 `renderToString`을 잽니다. 두 결과 모두 `output` 요소를 포함합니다. 수정 후에는 `<output>1</output>`도 확인합니다. beta에서는 초기에 오류가 빠지는 것이 해당 결함입니다. `packages/canard/schema-form/src/__tests__/e2e/ssrErrors.round-two.test.tsx:54`.
- **repaired · 중간** — R2-SF-6의 초기 오류를 첫 렌더 전에 한 번 적용합니다. 위 스키마와 결과는 공개 테스트에 있지만 구 측정 입력과 정확히 같은지는 확인되지 않았습니다. [원장](../final-correction/contract-ledger/canard-schema-form.md#L32), [집계](../final-correction/speed-overview.md#L158).

## 7. schema-form engine / overlap-array-32-4

- **API** — `@canard/schema-form`의 `Form`, `ValidationMode.None`, `FormHandle.findNode`와 노드의 `setValue`; `packages/canard/schema-form/src/index.ts:8,12,53 / :8,12,53`, `src/components/Form/components/FormCore/types/handle.ts:43 / :43`입니다.
- **입력과 측정** — `list`는 문자열 배열, `trigger`는 문자열인 객체 스키마를 만듭니다. `trigger.controls.injectTo(v)`가 `../list`에 `Array.from({length:32},(_,i)=>v+i)`를 쓰고 `../list/0`부터 `../list/3`에는 각각 `v+':'+i`를 씁니다. 초깃값은 `list`의 `'old:'+i` 32개입니다. 마운트 후 `/trigger`에 `'version0'`를 쓰는 한 번을 잽니다. 두 버전의 최종 배열은 같은 것으로 기록되어 있습니다. 원본 측정은 내부 노드 생성기를 사용했으므로 공개 `Form` 경계의 비용은 추가됩니다. `bug-bounty/speed/sources/benchmark.tsx:168`.
- **repaired · 높음** — R5-SF-F9의 부모 배열과 네 자손 주소에 겹치는 승자를 순위대로 정착시키는 추가 파동이 필요한 작업입니다. [원장](../final-correction/contract-ledger/canard-schema-form.md#L105), [원인 비교](../final-correction/engine-report.md#L218), [같은 최종 출력](../final-correction/engine-report.md#L227).

## 8. json / getValue-fragment

- **API** — `@winglet/json`의 `getValue(value,pointer)`, `packages/winglet/json/src/index.ts:18 / :18`, `src/JSONPointer/utils/manipulator/getValue.ts:138 / :139`입니다.
- **입력과 측정** — `{ 'a b': 7, 'a%20b': 7 }`과 `#/a%20b`를 준비하고 `getValue` 한 번을 잽니다. 두 버전 모두 `7`을 반환합니다. 구 결함 입력의 인코딩된 키도 같은 값을 주도록 보완하여 beta의 미해결 결과를 피하면서 수정 후의 percent 디코드를 그대로 실행합니다.
- **repaired · 중간** — R2-JS-8의 URI 프래그먼트 디코딩 한 번이 필요한 작업입니다. 원본 행의 키와 값은 미확인입니다. [원장](../final-correction/contract-ledger/winglet-json.md#L29), [집계](../final-correction/speed-overview.md#L236); 두 버전의 `src/JSONPointer/utils/manipulator/utils/compileSegments.ts:18 / :19`.

## 9. schema-form engine / ab-derive-overlap

- **API** — 7행과 같은 `Form`, `FormHandle.findNode`, `FieldNode.setValue`입니다.
- **입력과 측정** — 스키마는 문자열 `src`, 문자열 `p`, `q`, 그리고 문자열 `a`, `b`를 가진 객체 `obj`입니다. `src.controls.injectTo(v)`는 문자열이면 `{'../obj':{a:v,b:v},'../obj/b':v+'!'}`를, 아니면 `{}`를 반환합니다. 초깃값 `{}`으로 `Form`을 마운트한 뒤 `/src`에 `'s0'`을 쓰는 한 번을 잽니다. 두 버전 모두 쓰기가 완료되고 `/src` 값이 `'s0'`인지만 공통 확인합니다. 수정 후 겹친 대상의 `obj.b`는 `'s0!'`입니다. 원본은 내부 생성기를 사용하므로 공개 `Form`으로 감싼 비용이 추가됩니다. `bug-bounty/speed/sources/benchmark.tsx:36`.
- **repaired · 중간** — R5-SF-F9의 겹친 승자를 순위대로 적용하면서 앞 계산 뒤의 값을 한 번 확인합니다. 원래 스키마는 남아 있으나 공개 재구성의 결과는 실행 검증 전입니다. [원장](../final-correction/contract-ledger/canard-schema-form.md#L105), [집계](../final-correction/speed-overview.md#L189).

## 10. schema-form engine / reset-refused-8

- **API** — 7행의 공개 API와 `SetValueOption.Merge`, 노드의 `batch` 및 `resetSubtree`입니다. `packages/canard/schema-form/src/index.ts:8,12,53,56 / :8,12,53,56`.
- **입력과 측정** — 문자열 필드 `f0`…`f6`, boolean `on`, `controls.active:'/on === true'`인 객체 `box`와 그 문자열 자식 `x`,`y`를 둡니다. 기본값은 `{on:true,box:{x:'old',y:'old'}}`입니다. 표본 전에 `/on`에 `true`를 쓰고 `/box` 참조를 얻습니다. 측정은 root의 `batch`에서 box에 `{x:'early',y:'early'}`, 일곱 필드에 `'f0'`, root에 `{on:false,box:{x:'last'}}`를 Merge로 순서대로 쓰고 box를 `resetSubtree()`하는 구간입니다. 양쪽에서 batch 호출 완료를 확인하고 수정 후 보유 값은 별도로 확인해야 합니다. 원본 `bug-bounty/speed/sources/benchmark.tsx:444`.
- **repaired · 중간** — 거절된 reset 뒤 보류 값을 복원하고 뒤 Merge가 지명하지 않은 부분을 지키는 R5-SF-F23의 작업입니다. 공통 결과의 정확한 값은 아직 확인하지 못했습니다. [원장](../final-correction/contract-ledger/canard-schema-form.md#L117), [비용 대조](../final-correction/engine-report.md#L456).

## 11. schema-form core / expr-return-regexp

- **API** — `@canard/schema-form`의 `Form`, `ValidationMode.None`, `FormHandle.findNode`를 사용합니다. 두 커밋의 `packages/canard/schema-form/src/index.ts:8,12,53 / :8,12,53`, `src/components/Form/components/FormCore/types/props.ts:44,95 / :44,95`에서 같은 호출 형태를 확인했습니다.
- **입력과 측정** — 객체 스키마의 `out:{type:'string',controls:{derived:'{ return /a/ + 0 }'}}`을 `Form`에 전달하여 마운트하는 한 번을 재는 후보 전용 절대 측정입니다. 수정 후 `/out`은 `'/a/0'`입니다. beta는 `return` 뒤 `/`를 잘못 판독해 함수 생성에 실패하므로 두 버전의 공통 결과와 비교 비율은 없습니다. 괄호로 정규식 앞 토큰을 바꾸는 대체는 `return` 바로 뒤 판정을 더 이상 검증하지 않아 같은 결함에 닿는다고 입증되지 않았습니다. 공개 재현은 `packages/canard/schema-form/src/__tests__/e2e/expressionSyntax.test.tsx:23`입니다.
- **repaired · 높음 · 비교 불가** — C14에서 `return` 뒤 정규식의 시작과 끝을 스캔해 경로와 구분하는 작업이 한 번 필요합니다. 원래 행은 내부 스캐너 단독 계측이어서 공개 Form 마운트의 절대값과 직접 같지 않습니다. [결정 C14](../final-correction/DECISIONS.md#L171), [집계](../final-correction/speed-overview.md#L157).

## 12. schema-form core / validate-writeback

- **API** — `@canard/schema-form`의 `Form`, `ValidationMode.OnRequest`, `FormHandle.validate`, `findNode`와 노드 `setValue`입니다. `packages/canard/schema-form/src/index.ts:8,12,53 / :8,12,53`, `src/components/Form/components/FormCore/types/handle.ts:43,52 / :43,52`, `src/components/Form/components/FormCore/types/props.ts:95 / :95`; 두 커밋의 호출 형태가 같습니다.
- **입력과 측정** — 스키마 `{type:'string'}`, 기본값 `'same'`, `validatorFactory`의 `compile`이 반환하는 함수는 `ref.current.findNode('')`에 `'same'`을 다시 쓰고 `[]`를 반환하며 `compileGuard`는 항상 true를 반환합니다. 초기 마운트를 완료하고 `await ref.current.validate()` 한 번을 React `act` 안에서 잽니다. 양쪽 모두 호출이 완료되고 값은 `'same'`입니다. 수정 후 같은 값 쓰기가 검증 결과를 무효화하지 않아 pending이 해제됩니다. 원본은 내부 엔진의 `root.validate`이고 Form 경계가 추가되므로 구 마이크로초와 직접 비교하지 않습니다. `bug-bounty/speed/sources/build.mjs:72`.
- **repaired · 중간 · 비교 가능** — R3-SF-12에서 같은 값의 쓰기를 검증 입력의 변경으로 오인하지 않고 진행 중인 결과를 한 번 게시합니다. [원장](../final-correction/contract-ledger/canard-schema-form.md#L52), [집계](../final-correction/speed-overview.md#L159).

## 13. schema-form engine / validate-writeback

- **API** — 12행과 같은 Form에서 `ref.current.node.validate()`를 사용합니다. `packages/canard/schema-form/src/index.ts:8,12,53 / :8,12,53`, `src/components/Form/components/FormCore/types/handle.ts:23 / :23`, `src/core/surface/type.ts:158 / :162`에서 두 커밋에 같은 호출을 확인했습니다.
- **입력과 측정** — 12행의 같은 스키마, 기본값과 동기 검증기를 사용하고 마운트 뒤 root `node.validate()`부터 반환 Promise 정착까지 잽니다. 양쪽에서 반환은 배열이며 root 값은 `'same'`입니다. 수정 후 pending이 해제되고 빈 검증 결과가 게시됩니다. `render` 행의 타이머 오버헤드와 React 준비 비용을 고려합니다.
- **repaired · 중간 · 비교 가능** — R3-SF-12의 동일 값 재진입을 받아들여 검증을 한 번 게시합니다. [원장](../final-correction/contract-ledger/canard-schema-form.md#L52), [원래 계측](../final-correction/engine-report.md#L464), `bug-bounty/speed/sources/build.mjs:72`.

## 14. schema-form engine / r2-client-array-external

- **API** — `@canard/schema-form`의 `Form`, `ValidationMode.None`, `FormHandle.findNode`와 반환 노드의 `setValue`입니다. 두 커밋의 `packages/canard/schema-form/src/index.ts:8,12,53 / :8,12,53`, `src/components/Form/components/FormCore/types/handle.ts:43 / :43`, `src/core/surface/type.ts:133 / :137`에서 확인했습니다.
- **입력과 측정** — `{type:'object',properties:{list:{type:'array',items:{type:'string'}}}}`, 기본값 `{list:['a']}`를 사용하고 `/list`의 `fieldInputMap`에 `<input defaultValue={JSON.stringify(defaultValue)} onChange={e=>onChange([e.target.value])}/>`를 등록합니다. jsdom에서 마운트를 마친 뒤 `act` 안에서 `/list.setValue(['b'])`와 커밋을 잽니다. 양쪽에서 루트 값 `list`는 `['b']`입니다. 수정 후 input 값도 `'["b"]'`가 됩니다. 이 값은 공개 회귀 테스트의 입력이며 원 역사 측정과 같은 경계인지는 미확인입니다. `packages/canard/schema-form/src/__tests__/e2e/wholeArray.round-two.test.tsx:25`.
- **repaired · 중간 · 비교 가능** — R2-SF-3은 길이가 같은 외부 쓰기에서 비제어 배열 입력의 새 기본값을 한 번 전달합니다. [원장](../final-correction/contract-ledger/canard-schema-form.md#L29), [집계](../final-correction/engine-report.md#L446).

## 15. schema-form engine / r3-batch-array

- **API** — `@canard/schema-form`의 `Form`, `ValidationMode.None`, `FormHandle.node`에서 얻은 `ArrayNode.batch`, `push`, `pop`입니다. 두 커밋의 `packages/canard/schema-form/src/index.ts:8,12,36,53 / :8,12,36,53`, `src/components/Form/components/FormCore/types/handle.ts:23 / :23`, `src/core/surface/type.ts:174,217,219 / :178,221,223`를 확인했습니다.
- **입력과 측정** — 루트 스키마 `{type:'array',items:{type:'number'}}`, 기본값 `[1,2]`를 Form으로 마운트합니다. root 배열 노드에서 `batch(()=>{root.push(3);root.pop()})` 한 번을 재고, 반환 뒤 양쪽 모두 최종 값이 `[1,2]`인지 검사합니다. 수정 후 배열 동사 사이의 정착과 항목 신원 보존도 별도 회귀 검사로 확인합니다. 이 입력은 역사 행의 숫자 루트 배열과 동사 경계를 따르되 값은 제안값입니다. 상태를 표본마다 새로 준비하는 `render` 행을 사용합니다.
- **repaired · 중간 · 비교 가능** — R3-SF-9은 배열 동사 앞의 보류 쓰기를 정착하고 각 구조 동사를 한 번씩 적용합니다. [원장](../final-correction/contract-ledger/canard-schema-form.md#L49), [역사 입력과 정착](../final-correction/engine-report.md#L269), [요인 대조](../final-correction/engine-report.md#L280).

## 16. schema-form engine / validate-writeback-errors

- **API** — 13행의 공개 `FormHandle.node.validate()`와 `FieldNode.setValue`입니다. 두 커밋 `packages/canard/schema-form/src/index.ts:8,12,53 / :8,12,53`, `src/core/surface/type.ts:133,158 / :137,162`에서 확인했습니다.
- **입력과 측정** — 13행과 같은 `{type:'string'}`, `'same'`, OnRequest 설정을 사용합니다. 검증기는 같은 값을 다시 쓰고 `[{dataPath:'',keyword:'writeback',message:'writeback'}]`와 `[]`를 호출마다 번갈아 반환합니다. 각 표본은 마운트 직후 시작해 첫 `node.validate()`를 await하고, 다음 표본은 새 상태로 준비합니다. 양쪽의 Promise가 배열로 정착하고 값이 `'same'`인지 확인하며, 수정 후 첫 결과와 노드 오류에 `keyword:'writeback'`이 있습니다. 재진입 회귀의 공개 오류 검사는 [R3-SF-12](../final-correction/contract-ledger/canard-schema-form.md#L52)에 있습니다.
- **repaired · 중간 · 비교 가능** — 같은 값을 되쓴 검증이 반환한 실제 오류를 한 번 발행하는 R3-SF-12입니다. 원본은 반복 호출 시 오류를 교대로 냅니다. [원본 구성](../speed/sources/build.mjs#L72), [비용 대조](../final-correction/engine-report.md#L465).

## 17. schema-form engine / r2-async-relay-content

- **API** — 외부 공개 호출은 `@canard/schema-form`의 `Form`, `Form.Render`, `FormHandle.findNode` 및 노드 `setValue`입니다. 두 커밋 `packages/canard/schema-form/src/index.ts:8,12,53 / :8,12,53`, `src/components/Form/components/FormCore/types/handle.ts:43 / :43`에서 같은 형태입니다. 구 행의 `relayFieldNodeInput`은 패키지 진입점에 없어 직접 가져올 수 없습니다.
- **입력과 측정** — 14행의 스키마와 기본값 `{list:['a','b']}`를 사용합니다. `/list`의 비제어 입력 컴포넌트가 전달받은 `onChange`를 외부 변수 `publish`에 보관하고 `<input defaultValue={JSON.stringify(defaultValue)}/>`를 렌더합니다. `Form.Render path='/list'` 안의 `<Input onChange={v=>ref.current.findNode('/list').setValue(v)} />`로 중계를 연결합니다. 마운트 후 `act(()=>publish(['a','b']))`와 커밋을 후보 전용으로 잽니다. 매 호출 배열은 기존 값과 내용이 같고 참조가 다릅니다. 수정 후 루트 값은 `['a','b']`이고 자기 쓰기에 의해 비제어 입력을 다시 마운트하지 않습니다. 공개 대체의 베타 결과는 검증되지 않아 동등한 beta 비교 행으로 확정하지 않습니다. 공개 테스트 예 `packages/canard/schema-form/src/__tests__/e2e/wholeArray.round-two.test.tsx:67`.
- **repaired · 낮음 · 비교 불가** — R2-SF-3의 서로 다른 참조지만 내용이 같은 배열을 한 번 비교하는 비용입니다. 원 역사 행의 내부 비동기 중계 루프를 공개 호출만으로 독립 계측할 수 없으며, Form 렌더와 이벤트 비용을 더한 절대 측정으로만 제안합니다. [원장](../final-correction/contract-ledger/canard-schema-form.md#L29), [기존 중계 대조](../final-correction/engine-report.md#L284).

## 18. json-schema / schema-alternate-lookup

- **API** — `@winglet/json-schema`의 `createReferenceResolver(root,{resources})`, 반환 객체의 `root(root)` 및 `resolve(reference,'$ref',context)`입니다. `packages/winglet/json-schema/src/index.ts:34 / :34`, `src/utils/JSONSchemaScanner/createReferenceResolver/createReferenceResolver.ts:13 / :13`, `src/utils/JSONSchemaScanner/utils/type.ts:112 / :112`에서 같은 호출을 확인했습니다.
- **입력과 측정** — 루트 `{$id:'https://ex.example/root.json',type:'object'}`와 등록 객체를 준비합니다. 등록 키 하나는 `'HTTPS://Ex.Example/types.json'`, 값은 `{type:'string'}`이며 나머지 20개는 `https://ex.example/doc-i.json`을 키와 `$id`로 하는 문자열 스키마입니다. 매 표본마다 새 리졸버와 root context를 만들고 첫 `resolve('types.json','$ref',context)` 한 번을 잽니다. 양쪽 모두 상태가 있는 결과 객체를 반환합니다. 수정 후 `status:'resolved'`이고 `target.type:'string'`입니다. beta의 미해결도 공통 shape 검사에 포함하되 수정 결과인 것처럼 취급하지 않습니다. 공개 테스트는 `packages/winglet/json-schema/src/__tests__/publicCreateReferenceResolver.registered-resources.test.ts:216`입니다.
- **repaired · 중간 · 비교 가능** — R1-JSC-1의 등록 문서 색인 한 번과 주소 정규화 대조가 필요합니다. 20개 주변 문서는 집계의 21회 대조를 바탕으로 제안한 크기입니다. [원장](../final-correction/contract-ledger/winglet-json-schema.md#L11), [집계](../final-correction/speed-overview.md#L249).

## 19. ajv6 / default/boundFirstIdResourceInvalid

- **API** — `@canard/schema-form-ajv6-plugin`의 `plugin.validator.bind(ajv)`와 `compile(schema)`가 돌려준 검증 함수입니다. `packages/canard/schema-form-ajv6-plugin/src/index.ts:7 / :9`, `src/validator/validatorPlugin.ts:52,58 / :44,47`에서 양 커밋의 동일 호출을 확인했습니다.
- **입력과 측정** — AJV 6를 `allErrors:true`로 생성해 bind합니다. 스키마는 `{definitions:{item:{$id:'https://example.test/item',type:'object',properties:{named:{type:'object',not:{required:['x']}}}}},properties:{used:{$ref:'https://example.test/item'}}}`이고 컴파일은 측정 밖입니다. `{used:{named:{x:1}}}` 검증 한 번을 await합니다. 표본마다 새 bind와 compile을 준비해 이 검증이 해당 컴파일의 첫 실패가 되게 합니다. 양쪽 모두 `not` issue를 포함한 배열을 반환하며 수정 후 issue는 `dataPath:'/used/named',rejectedKey:'x'`입니다. 공개 재현은 `packages/canard/schema-form-ajv6-plugin/src/__tests__/rejectedKey.test.ts:50`입니다.
- **repaired · 중간 · 비교 가능** — I05/R1-AJV6-2의 식별된 로컬 자원을 찾고 `not.required`의 단일 키를 한 번 해석합니다. 각 표본의 초기 자원 수집이 반복되는 render 행이며 타이머 오버헤드가 1 미만 마이크로초의 비율을 1에 가깝게 끌 수 있습니다. min과 p10 양쪽의 승인 상한은 1.46입니다. [원장](../final-correction/contract-ledger/canard-schema-form-ajv6-plugin.md#L12), [집계](../final-correction/speed-overview.md#L53).

