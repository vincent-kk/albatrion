# 우선순위 2 엔진 속도 행 입력 명세

[SPEED-TARGETS.md §4.1](../SPEED-TARGETS.md#41-cut-42행)의 `schema-form engine` 행 순서입니다. API 근거의 두 줄 번호는 각각 beta `1c77ced57`과 비교 커밋 `d78e45c6b`를 가리킵니다. `src/`는 `packages/canard/schema-form/src/`입니다. 엔진 보고서의 행을 로컬에 남은 계측 소스와 대조했습니다. 신뢰도는 스키마, 입력값 및 원래 호출 경계를 복원한 정도입니다. 후보 SHA는 `archive/speed-candidates-engine`에서 실행 경로를 확인하는 근거입니다.

모든 폼은 양쪽에서 같은 React 버전과 `ValidationMode.None`을 사용합니다. 7·8행과 11–14행을 제외하면 표본 밖에서 jsdom에 `<Form ref={ref} jsonSchema={schema} defaultValue={initial}><span /></Form>`을 커밋합니다. 엔진 단독 생성 대신 `ref.current.node`와 `ref.current.findNode(path)`로 공개 노드를 얻고 측정 전 대상 존재를 확인합니다. 인덱스 `i`는 0부터 시작하는 호출 번호입니다. 특별히 표본에 포함된 생성이나 이벤트를 제외하면 준비, 관측 및 해제를 타이머 밖에서 수행합니다. 구 코드와 새 호출 경계의 시간은 새로 대조합니다. `plain`과 `repaired`는 소스 기반 예상이며 계수로 확정합니다.

## 1. schema-form engine / ab-reset-pending

- **API** — `@canard/schema-form`의 `Form`, `FormHandle.findNode`, 공개 `FieldNode.batch`, `setValue`, `resetSubtree`입니다. `src/index.ts:8,12,41,53 / :8,12,41,53`, `src/components/Form/components/FormCore/types/handle.ts:23,43 / :23,43`, `src/core/surface/type.ts:133–134,174 / :137–138,178`.
- **입력과 측정** — 루트 객체에 문자열 `a,b`를 가진 객체 `obj`와 문자열 형제 `f0`부터 `f7`까지를 선언합니다. 초기값은 `{obj:{a:'x',b:'y'}}`입니다. `root.batch` 안에서 `k=0…7` 순으로 `/f{k}.setValue('v'+i+'_'+k)`를 호출한 뒤 `/obj.resetSubtree()`를 호출합니다. 배치 진입부터 반환까지 잽니다. 후보는 reset 전에 대기 중인 범위 밖 쓰기 8개를 정착시키며, 결과는 `obj`의 로드값과 형제 8개의 새 값입니다.
- **repaired · 높음** — 대기 표시는 8개이며 reset 범위 안에서 보류할 표시는 0개입니다. R3.10의 선행 정착에 닿고 R5.F의 거절 및 재생에는 닿지 않습니다. `12d6a3221`은 보류가 0개일 때 범위 수집을 생략하고 `252110dda`는 범위를 정리합니다. [엔진 보고 197–200·305·428행](../final-correction/engine-report.md#L197), [R3.10](../round-3/canard-schema-form.md#L231), `bug-bounty/tmp-recovered/final-core-engine/speed/benchmark.tsx:57–69`.

## 2. schema-form engine / virtual-merge-one

- **API** — `@canard/schema-form`의 `Form`, `FormHandle.findNode`, `FieldNode.batch`, `FieldNode.setValue(value, SetValueOption.Merge)`, `JSONSchema`의 `options.virtual`입니다. `src/index.ts:8,12,41,53,57,87 / :8,12,41,53,57,87`, `src/core/surface/type.ts:133,174 / :137,178`, `src/types/schema/jsonSchema.ts:189 / :191`.
- **입력과 측정** — 루트 객체에 `box:{type:'object',properties:{x:{type:'string'},y:{type:'string'}}}`, `hidden:{type:'string',controls:{active:'false'}}`, `f:{type:'string'}`을 선언합니다. `options.virtual={group:{fields:['box']}}`, 초기값은 `{box:{x:'a',y:'b'}}`입니다. `root.batch` 안에서 `/group.setValue([{x:String(i)}], SetValueOption.Merge)` 다음에 `/f.setValue(String(i))`를 실행합니다. 배치 전체를 재며 양쪽에서 `box.y==='b'`를 확인합니다.
- **repaired · 높음** — 한 구성원의 Merge를 실제 `/box`의 명시 키 범위로 풀어 이웃 `y`를 유지하는 경로입니다. 보고서 최종 표는 R5.F로 묶으며, 이 호출열에는 reset이 없어 거절 복구 비용은 발생하지 않습니다. `d1088a79b`의 승인된 물리 주소 재사용과 `7531414da`의 가상 주소 가지치기 경로가 근거입니다. [엔진 보고 198·212·469행](../final-correction/engine-report.md#L198), [설계의 가상 키 범위](../final-correction/engine-design.md#L25), `bug-bounty/tmp-recovered/final-core-engine/speed/benchmark.tsx:469–481`.

## 3. schema-form engine / ab-derive-disjoint

- **API** — `@canard/schema-form`의 `Form`, `FormHandle.findNode`, `FieldNode.setValue`, `JSONSchema`의 `controls.injectTo`입니다. `src/index.ts:8,12,41,53,87 / :8,12,41,53,87`, `src/core/surface/type.ts:133 / :137`, `src/core/engine/types/controls.ts:97 / :97`.
- **입력과 측정** — 루트 객체의 `src,p,q`는 문자열이고 `obj`는 문자열 `a,b`를 가진 객체입니다. `src.controls.injectTo`는 문자열 `v`에 `{'../p':v,'../q':v+'!'}`를 반환하고 나머지 값에는 `{}`를 반환합니다. 초기값은 `{}`입니다. `/src.setValue('s'+i)` 한 번을 재며 같은 정착 내 `p==='s'+i`, `q==='s'+i+'!'`를 확인합니다.
- **plain · 높음** — 자동 승자 두 개가 각각 `/p`, `/q`에 써서 직접 저장 주소가 겹치지 않습니다. `514ba284d`의 주소 비교 대상이며, R5.D의 겹침에 따른 중간 계산 파동은 0회입니다. [엔진 보고 207·313·420행](../final-correction/engine-report.md#L207), [R5.D 설계](../final-correction/engine-design.md#L24), `bug-bounty/tmp-recovered/final-core-engine/speed/benchmark.tsx:36–55`.

## 4. schema-form engine / virtual-write

- **API** — `@canard/schema-form`의 `Form`, `FormHandle.findNode`, `FieldNode.setValue`, `JSONSchema`의 `options.virtual`입니다. `src/index.ts:8,12,41,53,87 / :8,12,41,53,87`, `src/core/surface/type.ts:133 / :137`, `src/types/schema/jsonSchema.ts:189 / :191`.
- **입력과 측정** — 루트 객체의 `start,end,note`는 문자열이며 `options.virtual={period:{fields:['start','end']}}`입니다. 초기값은 `{start:'a',end:'b',note:'n'}`입니다. 미리 준비한 두 자리 배열로 `/period.setValue(['a'+i,'b'+i])` 한 번을 잽니다. 두 물리 값만 바뀌고 `note==='n'`입니다.
- **plain · 높음** — 두 자리가 모두 활성이고 새 값이 채워진 일반 쓰기입니다. R5.1의 위치 보정에 필요한 비활성·부재 자리가 없습니다. `d1088a79b`, `0615fb080`은 승인 주소와 순위를, `ee52f765b`는 정착의 중복 작업을 다룹니다. [엔진 보고 203·272·404행](../final-correction/engine-report.md#L272), [R5.1](../round-5/canard-schema-form.md#L20), `bug-bounty/tmp-recovered/final-core-engine/speed/benchmark.tsx:19,492–502`.

## 5. schema-form engine / virtual-reset

- **API** — `@canard/schema-form`의 `Form`, `FormHandle.findNode`, 가상 노드의 `resetSubtree()`입니다. `src/index.ts:8,12,41,49,53,87 / :8,12,41,49,53,87`, `src/core/surface/type.ts:134,256 / :138,260`, `src/types/schema/jsonSchema.ts:189 / :191`.
- **입력과 측정** — 4행과 같은 스키마에 초기값 `{note:'n'}`을 사용합니다. 두 구성원은 처음부터 값이 없습니다. 표본 밖 예열 reset 뒤에도 저장값이 `{note:'n'}`임을 확인합니다. `/period.resetSubtree()` 한 번을 재고 같은 저장값을 확인합니다.
- **repaired · 높음** — 보고서는 관측 결과가 같은 일반 reset으로 분류합니다. 후보는 빈 구성원에도 R4.2의 실제 구성원 주소에서 로드값을 읽는 분기를 실행하므로 이를 계수합니다. 활성값·보유값 복원과 배치 재생은 이 입력에 없습니다. `d1088a79b`는 구성원 주소를 재사용하며 `12d6a3221`은 이 행과 인접한 배치 reset만 바꿉니다. [엔진 보고 210·244·410행](../final-correction/engine-report.md#L244), [R4 원장](../final-correction/contract-ledger/canard-schema-form.md#L66), `src/core/engine/settle/utils/reset/resetFieldNodeSubtree.ts:20`, `bug-bounty/tmp-recovered/final-core-engine/speed/benchmark.tsx:553,561`.

## 6. schema-form engine / virtual-absent-undefined

- **API** — `@canard/schema-form`의 `Form`, `FormHandle.findNode`, `FieldNode.batch`, `FieldNode.setValue(value, SetValueOption.Merge)`, `JSONSchema`의 가상 구성원 및 `controls.active`입니다. `src/index.ts:8,12,41,53,57,87 / :8,12,41,53,57,87`, `src/core/surface/type.ts:133,174 / :137,178`, `src/types/schema/jsonSchema.ts:189 / :191`.
- **입력과 측정** — 2행의 스키마와 초기값에서 `group.fields`를 `['box','hidden']`으로 바꿉니다. `hidden`은 초기 로드부터 비활성이고 초기값에도 없습니다. `root.batch` 안에서 `/group.setValue([{x:String(i)},undefined], SetValueOption.Merge)` 다음에 `/f.setValue(String(i))`를 실행합니다. 두 번째 자리는 명시적 `undefined`이며 배치 전체를 잽니다. 후보는 `box.y==='b'`를 유지하고 `/hidden`을 활성 값이나 보유 값으로 만들지 않습니다.
- **repaired · 높음** — R5.1의 고정 튜플 위치와 비활성 `undefined`의 승인 제외가 실제 입력 조건입니다. `aec97b658`은 해당 행에서 불필요한 보유 후보 조회를 줄이는 경로의 근거입니다. [엔진 보고 222·315·421행](../final-correction/engine-report.md#L315), [가상 원장](../final-correction/contract-ledger/canard-schema-form.md#L88), `src/core/engine/__tests__/virtualEntryView.round-five.test.ts:35`, `bug-bounty/tmp-recovered/final-core-engine/speed/benchmark.tsx:469–481`.

## 7. schema-form engine / mount-100

- **API** — `@canard/schema-form`의 `Form`, `FormProps.jsonSchema`, `defaultValue`, `validationMode`입니다. `src/index.ts:8,15,53 / :8,15,53`, `src/components/Form/components/FormCore/types/props.ts:44,46,95 / :44,46,95`.
- **입력과 측정** — 루트 객체에 문자열 필드 `f0`부터 `f99`까지 순서대로 선언하고 원본의 `defaultValue={name:'n',age:2}`를 그대로 넘깁니다. `f0`부터 `f99`에는 로드값을 주지 않습니다. 같은 스키마 참조로 한 번 예열한 뒤 표본마다 새 DOM 컨테이너와 React root를 준비합니다. `flushSync(() => client.render(<Form … />))` 한 번을 첫 커밋까지 재고 문자열 입력 100개를 확인합니다. 엔진 행은 클라이언트에서 재고 코어의 같은 이름 행에는 원본 SSR 경계를 남깁니다.
- **plain · 높음** — 일반 필드 100개와 루트 표시 1회의 정적 로드입니다. 별칭, 이탈, 가상 및 배치 경계가 없습니다. `ee52f765b`의 루트 로드 공통부를 지나고 `403dc63a5`의 별칭 색인 대상은 없습니다. [엔진 보고 232·363·416행](../final-correction/engine-report.md#L363), [C12](../final-correction/DECISIONS.md#L159), `bug-bounty/tmp-recovered/final-core-engine/speed/benchmark.tsx:18,526–528`.

## 8. schema-form engine / aliased-mount

- **API** — `@canard/schema-form`의 `Form`, `FormHandle.getValue`, `JSONSchema`의 `$defs`, `$ref` 및 `controls.derived`입니다. `src/index.ts:8,12,53,87 / :8,12,53,87`, `src/components/Form/components/FormCore/types/handle.ts:48 / :48`, `src/core/engine/types/controls.ts:59 / :59`.
- **입력과 측정** — 루트 객체의 `$defs.entry`는 객체이며 `a:{type:'string',default:'a'}`와 `b:{type:'string',controls:{derived:'(../a) + "!"'}}`를 갖습니다. `x,y`가 각각 `{$ref:'#/$defs/entry'}`입니다. `defaultValue` 없이 같은 스키마 참조로 예열하고, 새 jsdom React root에 `<Form ref={ref} …><span /></Form>`을 `flushSync`로 첫 커밋까지 한 번 잽니다. 후보 `getValue()`의 `x,y`는 각각 `{a:'a',b:'a!'}`입니다. 공개 마운트에는 엔진 생성과 React 커밋이 함께 들어갑니다.
- **repaired · 높음** — R2.2의 재사용 참조별 실제 의존 주소 등록을 실행합니다. `403dc63a5`는 그 발생의 위상과 원래 의존 구문을 재사용합니다. [엔진 보고 233·256·261·423행](../final-correction/engine-report.md#L256), [C13](../final-correction/DECISIONS.md#L165), [R2.2](../round-2/canard-schema-form.md#L41), `bug-bounty/tmp-recovered/final-core-engine/speed/build.mjs:18–28`.

## 9. schema-form engine / reset-refused-sequential-8

- **API** — `@canard/schema-form`의 `Form`, `FormHandle.findNode`, `FieldNode.setValue`, `resetSubtree`, 사후 확인용 `inactiveValues`입니다. `src/index.ts:8,12,41,53 / :8,12,41,53`, `src/core/surface/type.ts:85,133–134 / :88,137–138`.
- **입력과 측정** — 루트에 문자열 `f0…f6`, 불리언 `on`, 문자열 `x,y`를 가진 객체 `box`를 선언합니다. `box.controls.active='/on === true'`, 초기값은 `{on:true,box:{x:'old',y:'old'}}`입니다. 타이머 안에서 `/on.setValue(true)`, `/box` 참조 획득, `box.setValue({x:'last',y:'early'})`, `/f0`부터 `/f6`까지 차례로 각각 `setValue('f'+i)`, `/on.setValue(false)`, 잡아 둔 `box.resetSubtree()`를 순서대로 실행합니다. 독립 호출마다 정착하며, 마지막에는 `/box`가 분리되고 양쪽의 루트 보유값은 `/box/x:'last'`, `/box/y:'early'`입니다.
- **plain · 높음** — 처음부터 분리된 참조에 대한 마지막 reset은 양쪽에서 거절됩니다. `252110dda`·`12d6a3221`이 바꾼 배치 정착 중 분리나 범위 재생은 실행되지 않습니다. 대상 표의 수리 표기와 달리 엔진 보고서의 순차 대조 분류를 따릅니다. [엔진 보고 295·305–307·424행](../final-correction/engine-report.md#L295), `src/__tests__/e2e/engineRefusedReset.test.tsx:145–169`, `bug-bounty/tmp-recovered/final-core-engine/speed/benchmark.tsx:444–466`.

## 10. schema-form engine / plain-merge-shallow

- **API** — `@canard/schema-form`의 `Form`, `FormHandle.setValue(value, SetValueOption.Merge)`입니다. `src/index.ts:8,12,53,57 / :8,12,53,57`, `src/components/Form/components/FormCore/types/handle.ts:48–49 / :48–49`, `src/core/engine/types/value.ts:20–28 / :20–28`.
- **입력과 측정** — 루트 객체에 숫자 `k0,k1`을 선언합니다. 처음에 `{k0:0,k1:1}`을 로드하고, 두 데이터 객체 `[{k0:0,k1:1},{k0:1,k1:2}]`를 준비합니다. 연속 표본에서 `i & 1`로 교대하여 `handle.setValue(values[i & 1], SetValueOption.Merge)` 한 번을 잽니다. 이번 객체의 두 수가 최종 저장값입니다.
- **plain · 높음** — 두 자기 데이터 키를 모두 명시한 평면 Merge입니다. 분기나 생략, 조상·자손 쓰기, 가상 경로 없이 루트 정착의 공통부에 닿습니다. `ee52f765b`의 루트 중복 작업 변경이 코드 위치의 근거입니다. [엔진 보고 245·387·437행](../final-correction/engine-report.md#L245), `bug-bounty/tmp-recovered/final-core-engine/speed/benchmark.tsx:103–115,129–130`.

## 11. schema-form engine / whole-array-client-write

- **API** — `@canard/schema-form`의 `Form`, `FormHandle.findNode`, `FieldInputProps`, `fieldInputMap`, 배열 노드의 `setValue`입니다. `src/index.ts:8,12,41,53,75–76 / :8,12,41,53,75–76`, `src/components/Form/components/FormCore/types/props.ts:70 / :70`, `src/types/field/fieldInput.ts:67–71 / :77–81`, `src/core/surface/type.ts:133 / :137`.
- **입력과 측정** — 루트 객체에 문자열 항목을 가진 분기 배열 `list`를 선언하고 `{list:['a','b']}`를 로드합니다. `fieldInputMap={{'/list':Whole}}`의 `Whole`은 `defaultValue`를 JSON으로 직렬화한 비제어 `<input>` 하나를 렌더하고, 최신 바인딩 `onChange`를 테스트에 보관합니다. 자식 입력은 렌더하지 않습니다. 마운트 후 각 표본은 `flushSync(() => list.setValue([String(i),'b']))` 한 번입니다. 양쪽 노드 값은 새 배열입니다. 후보는 DOM을 교체해 새 배열을 표시하고 beta는 처음 DOM과 표시를 유지합니다. 코어 행과 구분되는 경계는 배열 노드 직접 쓰기와 `flushSync`입니다.
- **repaired · 높음** — 같은 길이의 외부 쓰기가 비제어 배열 입력에 R2.3 Refresh를 전달합니다. `252110dda`는 배치 범위의 인접 후보이며, 원본에서 이 행은 배열 노드의 직접 쓰기입니다. [엔진 보고 95·247·333·473행](../final-correction/engine-report.md#L247), [R2.3](../round-2/canard-schema-form.md#L57), `src/__tests__/e2e/wholeArray.round-two.test.tsx:24–46`, `bug-bounty/tmp-recovered/final-core-engine/speed/build.mjs:34–62`.

## 12. schema-form engine / whole-array-client-own-write

- **API** — `@canard/schema-form`의 `Form`, `FieldInputProps.onChange`, `fieldInputMap`입니다. `src/index.ts:8,53,75–76 / :8,53,75–76`, `src/components/Form/components/FormCore/types/props.ts:70 / :70`, `src/types/field/fieldInput.ts:67–71 / :77–81`.
- **입력과 측정** — 11행과 같은 폼과 `Whole`로 준비합니다. `flushSync(() => publish([String(i),'b']))` 한 번을 재며 `publish`는 해당 입력의 최신 `onChange`입니다. 이 호출은 DOM 타이핑을 흉내 내지 않으므로 저장 배열의 변경과 기존 DOM 참조의 유지를 확인합니다. 우선순위 1 코어 행은 `Form.Render`의 입력에서 DOM `change` 이벤트를 구동합니다.
- **plain · 높음** — 입력 자체의 전달로 처리되고 양쪽의 재마운트는 0회입니다. 대상 표의 수리 표기와 달리 엔진 보고서의 최종 분류를 따릅니다. `252110dda`의 배치 범위 처리와 연결되지 않는 단일 자체 쓰기입니다. [엔진 보고 95·248·472행](../final-correction/engine-report.md#L248), [R2 원장](../final-correction/contract-ledger/canard-schema-form.md#L29), [우선순위 1의 17행](ROWS-P1.md#17-schema-form-core--whole-array-client-own-write), `bug-bounty/tmp-recovered/final-core-engine/speed/build.mjs:34–62`.

## 13. schema-form engine / whole-array-client-mixed-batch

- **API** — `@canard/schema-form`의 `Form`, `FormHandle.findNode`, `FieldInputProps.onChange`, `FieldNode.batch`, `find`, `setValue`입니다. `src/index.ts:8,12,41,53,75–76 / :8,12,41,53,75–76`, `src/core/surface/type.ts:115,133,174 / :119,137,178`, `src/types/field/fieldInput.ts:71 / :81`.
- **입력과 측정** — 11행과 같이 준비합니다. `flushSync` 안의 `list.batch`에서 `publish(['own'+i,'b'])`를 먼저 호출하고, 이어 `list.find('0').setValue('external'+i)`를 호출합니다. 두 순서와 한 번의 `flushSync` 전체를 잽니다. 양쪽 저장 배열의 첫 항목은 `'external'+i`이고 두 번째는 `'b'`입니다. 후보는 새 DOM에 최종 배열을 표시합니다. beta는 입력을 교체하지 않습니다.
- **repaired · 높음** — 동일한 배열의 자체 쓰기와 겹치는 외부 자식 쓰기입니다. 배치 마지막 승자는 외부 소스이며 R2.3 Refresh가 필요합니다. `252110dda`의 물리 범위 합성과 커밋 전달을 확인하는 행입니다. [엔진 보고 95·249·471행](../final-correction/engine-report.md#L249), `src/__tests__/e2e/wholeArray.round-two.test.tsx:137–170`, `bug-bounty/tmp-recovered/final-core-engine/speed/build.mjs:34–62`.

## 14. schema-form engine / whole-array-client-composition

- **API** — `@canard/schema-form`의 `Form`, `FormHandle.findNode`, `fieldInputMap`, `FieldInputProps`, 배열 노드의 `setValue`와 연결된 DOM의 composition 이벤트입니다. `src/index.ts:8,12,41,53,75–76 / :8,12,41,53,75–76`, `src/components/Form/components/FormCore/types/props.ts:70 / :70`, `src/core/surface/type.ts:133 / :137`.
- **입력과 측정** — 11행과 같이 준비합니다. 표본마다 현재 DOM 입력을 찾고 버블링하는 `CompositionEvent('compositionstart',{bubbles:true})`를 첫 `flushSync`에서 만들어 보냅니다. 두 번째에서 `list.setValue([String(i),'b'])`를 호출하고, 세 번째에서 같은 DOM 입력에 버블링하는 `compositionend`를 만들어 보냅니다. 입력 조회부터 마지막 커밋까지를 잽니다. 별도 관측 실행에서 후보는 두 번째 커밋까지 같은 DOM을 두고 마지막 커밋에 새 DOM과 새 배열 표시를 보입니다. beta는 같은 DOM에 초기 표시를 유지합니다.
- **repaired · 높음** — 길이가 같은 외부 쓰기가 조합 중 보류된 R2.3 Refresh를 조합 종료에 실제 적용합니다. 원본 표본은 조합 주기 1회이며 보고서의 추가 마운트 2회는 그 주기를 두 표본 실행한 진단입니다. `252110dda`의 인접 경로와 별도로 조합 종료의 실제 적용을 계수합니다. [엔진 보고 95·250·470행](../final-correction/engine-report.md#L250), `src/__tests__/e2e/wholeArray.round-two.test.tsx:118–135`, `bug-bounty/tmp-recovered/final-core-engine/speed/build.mjs:34–62`.

## 15. schema-form engine / batch-structural

- **API** — `@canard/schema-form`의 `Form`, `FormHandle.findNode`, `FieldNode.batch`, `isArrayNode`로 좁힌 배열의 `push`와 `pop`입니다. `src/index.ts:8,12,41,43,53,58 / :8,12,41,43,53,58`, `src/core/surface/type.ts:174,215–219 / :178,219–223`.
- **입력과 측정** — 루트 객체의 `list`는 객체 배열입니다. 항목 스키마는 `{type:'object',properties:{kind:{type:'string',enum:['a','b','c'],presentation:{inputType:'radio'}}}}`입니다. 초기값은 `{list:[{kind:'a'},{kind:'b'}]}`입니다. 값 구독자와 `Form.onChange` 없이 `root.batch(() => {list.push({kind:'c'}); list.pop();})` 한 번을 잽니다. 최종 배열 내용은 초기값과 같습니다.
- **repaired · 높음** — R3.9의 동사별 구조 정착을 실제 실행합니다. 이 입력은 중첩 객체 배열이며, 우선순위 3의 숫자 루트 배열 입력과 구분합니다. `252110dda`를 대조한 보고에서 beta는 1회, 후보는 2회 정착합니다. [엔진 보고 251·331–335·432행](../final-correction/engine-report.md#L251), [R3.9](../round-3/canard-schema-form.md#L220), `bug-bounty/tmp-recovered/final-core-engine/speed/benchmark.tsx:16–17,553–556`.

## 16. schema-form engine / virtual-getters

- **API** — `@canard/schema-form`의 `Form`, `FormHandle.findNode`, `isVirtualNode`, `VirtualNode.defaultValue`, `isDivergent`, `inactiveValues`입니다. `src/index.ts:8,12,49,53,66 / :8,12,49,53,66`, `src/core/surface/type.ts:85,104,114,256 / :88,108,118,260`.
- **입력과 측정** — 4행의 스키마와 초기값을 그대로 사용하고 수정 없이 `/period`를 준비합니다. `sink=[period.defaultValue,period.isDivergent,period.inactiveValues]`를 이 순서로 한 번 만드는 것이 연산 1회입니다. 미리 마운트한 독립 노드 묶음을 예열한 후 같은 순서로 반복 순회합니다. 빠른 쪽에서 약 5ms가 되도록 pilot에서 고정한 K회 전체를 재고 K로 나눕니다. beta는 `[undefined,false,[]]`, 후보는 `[['a','b'],false,[]]`를 관측합니다.
- **repaired · 높음** — R5.1 계열의 시작값 투영이 가상 주소 조회에서 실제 물리 구성원 읽기로 바뀝니다. `value`는 이 세 getter의 원본 조합에 포함되지 않습니다. [엔진 보고 252·331·467행](../final-correction/engine-report.md#L331), [가상 원장](../final-correction/contract-ledger/canard-schema-form.md#L88), `src/__tests__/e2e/engineVirtualTuple.test.tsx:133–155`, `bug-bounty/tmp-recovered/final-core-engine/speed/benchmark.tsx:492–501`.

## 17. schema-form engine / virtual-getter-divergence

- **API** — `@canard/schema-form`의 `Form`, `FormHandle.findNode`, `isVirtualNode`, `VirtualNode.isDivergent`입니다. `src/index.ts:8,12,49,53,66 / :8,12,49,53,66`, `src/core/surface/type.ts:114,256 / :118,260`, `src/core/surface/runtime/FieldNode.ts:460 / :460`.
- **입력과 측정** — 16행과 같은 변경 전 폼과 `/period`로 준비합니다. `sink=period.isDivergent`만 읽습니다. 16행과 같은 준비·예열·배치 방식으로 이 단일 읽기용 K를 고정하고 K회 전체를 K로 나눕니다. 양쪽은 `false`입니다.
- **repaired · 높음** — 보고서 최종 표는 출력이 같은 일반 진단으로 기록합니다. 후보는 R5-SF-1-B의 구성원별 현재값과 로드값 비교를 실제 수행합니다. beta는 가상 경로 자체의 값만 비교합니다. [엔진 보고 253·331·417행](../final-correction/engine-report.md#L253), [가상 원장](../final-correction/contract-ledger/canard-schema-form.md#L89), `src/core/engine/settle/utils/loadValues/readFieldNodeIsDivergent.ts:19–32`, `bug-bounty/tmp-recovered/final-core-engine/speed/benchmark.tsx:492–501`.

## 18. schema-form engine / virtual-getter-inactive

- **API** — `@canard/schema-form`의 `Form`, `FormHandle.findNode`, `isVirtualNode`, `VirtualNode.inactiveValues`입니다. `src/index.ts:8,12,49,53,66 / :8,12,49,53,66`, `src/core/surface/type.ts:85,256 / :88,260`, `src/core/surface/runtime/FieldNode.ts:369 / :369`.
- **입력과 측정** — 16행과 같은 변경 전 폼의 `/period`를 씁니다. 원본에서 이 getter의 조회 범위는 가상 그룹이고 조회 결과는 빈 배열입니다. 그룹 자체와 두 멤버가 살아 있으며 비활성 보유값을 만들지 않습니다. `sink=period.inactiveValues`만 읽습니다. 16행과 같은 예열·배치 방식으로 이 단일 읽기용 K를 고정하며 K회 전체를 K로 나눕니다. 양쪽은 `[]`입니다.
- **repaired · 높음** — 후보는 R5-SF-1-B의 가상 범위 조회에서 부모의 비활성 보유값이 비어 있는 경로를 실행합니다. 보고서 최종 표는 같은 빈 결과를 일반 진단으로 기록합니다. 비활성 구성원을 가진 양성 계수 대조에는 공개 테스트에서 `/on`을 끄고 실제 `/b`의 보유값을 읽는 사례를 사용합니다. 양성 대조는 이 행의 시간에 포함하지 않습니다. [엔진 보고 254·331·466행](../final-correction/engine-report.md#L254), [가상 원장](../final-correction/contract-ledger/canard-schema-form.md#L89), `src/core/engine/settle/utils/detached/readFieldNodeInactiveValues.ts:13–25`, `src/__tests__/e2e/engineVirtualTuple.test.tsx:133–155`, `bug-bounty/tmp-recovered/final-core-engine/speed/benchmark.tsx:492–501`.

## 확인이 필요한 행

- **공개 마운트 경계** — 7 `mount-100`은 코어의 SSR과 구분하기 위해 클라이언트 첫 커밋으로 옮겼습니다. 8 `aliased-mount`는 공개 `Form` 첫 커밋에 엔진 생성과 별칭 등록을 포함합니다. 그 외 엔진 단독 행은 나열된 공개 노드 연산을 재고 폼 마운트는 표본 밖에 둡니다.
- **입력 분류 계수** — 2 `virtual-merge-one`은 물리 키 투영, 5 `virtual-reset`은 빈 구성원의 로드 조회, 17 `virtual-getter-divergence`와 18 `virtual-getter-inactive`는 같은 결과를 내는 수정 분기를 계수합니다. 9 `reset-refused-sequential-8`과 12 `whole-array-client-own-write`는 각각 재생 및 재마운트가 0회인 대조입니다.
- **동작 차이** — 공개 서명은 양쪽에서 같습니다. 1행은 reset과 선행 쓰기의 정착 순서가 다르고, 11·13·14행은 DOM 갱신, 15행은 배치 안의 구조 정착 횟수, 16행은 가상 초기값 투영이 다릅니다. 18행은 원본의 빈 조회를 보존하며 실제 비활성 보유값 검사는 별도의 계수 대조에서 수행합니다.
