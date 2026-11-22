# 우선순위 1 속도 행 입력 명세

[SPEED-TARGETS.md §3](../SPEED-TARGETS.md#3-우선순위-1-기준을-넘은-일반-입력-24행) 순서입니다. API 근거의 두 줄 번호는 각각 beta `1c77ced57`, 비교 커밋 `d78e45c6b`를 가리킵니다. 파일 경로 앞에 커밋을 붙여 `git show <commit>:<path>`로 확인할 수 있습니다. 아래 리터럴과 크기는 재측정에 사용할 고정 입력입니다. 신뢰도는 구 측정 입력의 복원 정도를 뜻합니다. 동작과 크기까지 출처에 있으면 높음, 호출이나 모양을 추론할 수 있으면 중간, 호출 경계나 입력 구성이 불분명하면 낮음으로 표시했습니다.

측정 구간은 각 행의 한 표본 기준입니다. 명시된 호출에 소비되는 입력은 미리 만들고, 결과 확인·DOM 정리·비동기 스타일 적용은 측정 밖에서 수행합니다. 클라이언트 행은 jsdom에서 같은 React 버전으로 마운트하고 상호작용을 커밋까지 마칩니다. SSR 행은 같은 React 버전의 `react-dom/server`로 처리합니다. `plain`과 `repaired`는 아래 고정 입력이 결함 조건에 닿는지에 대한 소스 기반 예상입니다. 측정 시 호출 계수로 확인합니다.

## 1. json-schema / schema-first-miss

- **API** — `@winglet/json-schema`의 `createReferenceResolver(root, options?)`, 이어서 반환 객체의 `root(rootSchema)`와 `resolve(reference, keyword, context)`를 사용합니다. 두 커밋에서 호출 형태가 같습니다. `packages/winglet/json-schema/src/index.ts:34 / :34`, `src/utils/JSONSchemaScanner/createReferenceResolver/createReferenceResolver.ts:13 / :13`, `src/utils/JSONSchemaScanner/utils/type.ts:112–128 / :112–128`.
- **입력과 측정** — 루트는 `{$id:'https://ex.example/root.json',type:'object'}`입니다. `resources`는 i=0…19에 대해 키 `https://ex.example/doc-i.json`, 값 `{$id:해당 키,type:'string'}`인 문서 20개입니다. 매 표본 앞에서 같은 입력으로 새 리졸버를 만들고 같은 루트 스키마를 넘겨 `host=resolver.root(rootSchema)`를 얻습니다. 첫 `resolver.resolve('missing.json','$ref',host)` 한 번을 잽니다. 결과 상태는 `skipped`, 사유는 `Unresolved`입니다.
- **plain · 중간** — R1-JSC-1/4의 등록 주소 정규화 및 지연 색인은 실행되지만, 찾을 내장 ID나 중복 주소가 없어 두 버전 모두 미해결입니다. 문서 20개는 인접 내장 ID 행의 루트 포함 21개를 적용한 추론입니다. [집계 250–251행](../final-correction/speed-overview.md#L250), [R1 판정 15행](../round-1/winglet-json-schema.md#L15), `packages/winglet/json-schema/src/utils/JSONSchemaScanner/createReferenceResolver/utils/ResolverStore/ResolverStore.ts:418`, `packages/winglet/json-schema/src/__tests__/publicCreateReferenceResolver.registered-resources.test.ts:60`.

## 2. react-utils / rest-changed

- **API** — `@winglet/react-utils`의 `useRestProperties<T>(props:T):T`입니다. `packages/winglet/react-utils/src/index.ts:23 / :23`, `src/hooks/useRestProperties.ts:55 / :59`.
- **입력과 측정** — `renderHook`의 콜백에서 `useRestProperties(props)`를 호출합니다. `{id:'row',disabled:false,count:1}`을 먼저 커밋하고 같은 키 순서의 별도 객체 `{id:'row',disabled:false,count:2}`로 `rerender` 한 번을 수행합니다. 재렌더 콜백 안에서 훅 호출 한 번을 잽니다. 결과 참조는 두 번째 객체입니다. 커밋을 끝낸 뒤 표본마다 첫 상태를 다시 준비합니다. 구 집계의 수백 ns는 이 호출 경계를 추정하는 근거이고 원래 계측 위치는 미확인입니다.
- **plain · 중간** — R4-RU-2의 게시를 등록하고 표본 밖 커밋에서 게시합니다. 중단이나 폐기 렌더가 없으며, 마지막 문자열 키의 값에서 다르다고 판정하므로 R6-RU-1의 심볼 비교까지 가지 않습니다. R1-RU-2의 `undefined` 키 변경도 없습니다. 키 수와 값은 제안값입니다. [집계 255행](../final-correction/speed-overview.md#L255), [R4 판정 52행](../round-4/winglet-react-utils.md#L52), [R6 판정 13행](../round-6/winglet-react-utils.md#L13), `packages/winglet/react-utils/src/__tests__/publicPropertyReferences.test.tsx:6`.

## 3. react-utils / rest-equal

- **API** — `@winglet/react-utils`의 `useRestProperties<T>(props:T):T`입니다. `packages/winglet/react-utils/src/index.ts:23 / :23`, `src/hooks/useRestProperties.ts:55 / :59`.
- **입력과 측정** — 2행과 같은 트리에서 `{id:'row',disabled:false,count:1}`을 먼저 커밋합니다. 같은 세 값이 든 별도 객체로 `rerender` 한 번을 수행하고 콜백 안에서 훅 호출 한 번을 잽니다. 최초 객체 참조가 유지됩니다. 커밋을 끝낸 뒤 표본마다 첫 상태를 다시 준비합니다.
- **plain · 중간** — R4-RU-2의 커밋 경로와 R6-RU-1의 심볼 열거 검사는 실행되지만 폐기 렌더와 심볼 키가 없습니다. R1-RU-2에서 고친 `undefined` 키 차이도 없습니다. 키 수와 값은 제안값입니다. [집계 254행](../final-correction/speed-overview.md#L254), [R4 판정 15·52행](../round-4/winglet-react-utils.md#L15), [R6 원장 34행](../final-correction/contract-ledger/winglet-react-utils.md#L34), `packages/winglet/react-utils/src/__tests__/publicUseRestProperties.symbols.test.tsx:43`.

## 4. common-utils / equals-deep

- **API** — `@winglet/common-utils`의 `equals(left,right,omit?)`입니다. `packages/winglet/common-utils/src/index.ts:200 / :200`, `src/utils/object/equals/equals.ts:250 / :246`.
- **입력과 측정** — 정수 `1`을 `{child:이전 값}`으로 128번 감싼 체인 두 개를 독립적으로 만듭니다. `equals(left,right)` 한 번을 재며 결과는 `true`입니다.
- **plain · 중간** — R4-CU-4와 V4가 유지한 활성 쌍 추적은 실행되지만 같은 활성 쌍에 다시 닿지 않습니다. R2-CU-A1의 256단계 초과 입력도 피합니다. 깊이 128은 제안값입니다. [집계 238행](../final-correction/speed-overview.md#L238), [R4 판정 89–102행](../round-4/winglet-common-utils.md#L89), [R2 원장 26행](../final-correction/contract-ledger/winglet-common-utils.md#L26), [V4 69행](../final-correction/DECISIONS.md#L69), `packages/winglet/common-utils/src/__tests__/publicEquals.depth.round2.test.ts:5`.

## 5. common-utils / isEmpty-general

- **API** — `@winglet/common-utils`의 `isEmpty(value:unknown):boolean`입니다. `packages/winglet/common-utils/src/index.ts:123 / :123`, `src/utils/filter/isEmpty.ts:435 / :435`.
- **입력과 측정** — `[undefined,null,false,true,0,1,'','x',[],[1],{},{x:1}]`를 한 번 생성합니다. 표본마다 이 순서대로 `isEmpty`를 12회 호출하고 빈 값 개수를 누적합니다. 호출당 수치에는 12로 나눈 시간을 사용합니다.
- **plain · 낮음** — 집계가 밝힌 것은 일반 혼합이라는 점입니다. 위 12개와 배합비는 제안값입니다. R2 7번 및 R5-CU-6은 외부 realm 컬렉션의 한계이며 V4에서 태그 기반 변경을 철회했습니다. 두 커밋의 `isEmpty` 본체 차이는 해당 한계 주석이고 컬렉션 분기는 둘 다 로컬 `instanceof`를 사용합니다. 이 입력에는 컬렉션이 없습니다. [집계 228·294행](../final-correction/speed-overview.md#L228), [R2 판정 74행](../round-2/winglet-common-utils.md#L74), [R5 원장 68행](../final-correction/contract-ledger/winglet-common-utils.md#L68), [V4 69행](../final-correction/DECISIONS.md#L69), `packages/winglet/common-utils/src/__tests__/publicObjectLimits.test.ts:49`.

## 6. json / getValue-tokens

- **API** — `@winglet/json`의 `getValue(value,pointer)`입니다. 두 버전 모두 문자열 또는 `(string|number)[]`를 받습니다. `packages/winglet/json/src/index.ts:18 / :18`, `src/JSONPointer/utils/manipulator/getValue.ts:138 / :139`.
- **입력과 측정** — `{user:{profile:{name:'Ada'}}}`와 토큰 배열 `['user','profile','name']`를 재사용합니다. `getValue(data,tokens)` 한 번의 결과는 `'Ada'`입니다.
- **plain · 중간** — C8의 자기 멤버 검사는 세 토큰에서 실행되지만 상속 키, 배열 인덱스, 빈 토큰, 퍼센트 인코딩이 없습니다. 토큰 개수와 키는 제안값입니다. [집계 234행](../final-correction/speed-overview.md#L234), [C8 135–139행](../final-correction/DECISIONS.md#L135), `packages/winglet/json/src/JSONPointer/utils/manipulator/utils/getValueByPointer.ts:15`, `packages/winglet/json/src/__tests__/publicGetValue.inheritedMembers.test.ts:6`.

## 7. style-utils / document-fresh-add

- **API** — `@winglet/style-utils`의 `styleManagerFactory(scopeId)`가 반환하는 `inject(id,css,compressed?)`와 정리용 `destroyScope(scopeId)`입니다. `packages/winglet/style-utils/src/index.ts:1 / :1`, `src/styleManager/styleManagerFactory.ts:59 / :63`. 내부 `StyleManager.get/add`를 게시 루트에서 직접 가져올 수 없습니다.
- **입력과 측정** — 단일 jsdom `document`를 준비합니다. 아직 등록되지 않은 스코프 `p1-fresh`에서 `styleManagerFactory('p1-fresh')('sheet','.a{color:red}',true)` 한 번을 잽니다. 첫 매니저 획득과 한 규칙 추가를 포함합니다. 스코프 삭제와 예약 프레임 처리는 표본 밖에서 끝냅니다.
- **plain · 낮음** — R2 2번 및 V4가 남긴 새 매니저 조회, R1-ST-A1의 파서 공통부는 실행됩니다. 이미 파괴된 주입기나 정리 함수를 재사용하지 않고 ShadowRoot도 사용하지 않습니다. 구 호출이 팩토리를 포함했는지 또는 내부 매니저에서 시작했는지는 남아 있지 않습니다. [집계 221행](../final-correction/speed-overview.md#L221), [R2 수정 68행](../round-2/FIXES.md#L68), [V4 69행](../final-correction/DECISIONS.md#L69), `packages/winglet/style-utils/src/__tests__/publicLifecycle.round2.test.ts:18`.

## 8. style-utils / flat-combinator

- **API** — 공개 재구성은 `@winglet/style-utils`의 `compressCss(css:string):string`입니다. `packages/winglet/style-utils/src/index.ts:2 / :2`, `src/utils/compressCss/compressCss.ts:43 / :45`.
- **입력과 측정** — CSS 문자열 `'.list>.item+.item{border-top:1px solid #ddd}'` 하나를 준비하고 `compressCss(css)` 한 번을 잽니다. 선택자 한 개와 선언 한 개입니다.
- **plain · 낮음** — R1-ST-3의 `+` 처리와 R1의 토큰 경계 판독이 닿는 평면 규칙입니다. 괄호 안 `+`, 목록, escape, 문자열, 열린 구문 같은 결함 조건을 피합니다. 일치하는 평면 규칙을 상시 벤치에서 가져왔으나 원래 행이 순수 압축인지 문서 스코핑까지 포함했는지는 확인되지 않습니다. [집계 213행](../final-correction/speed-overview.md#L213), [R1 수정 187–191행](../round-1/FIXES.md#L187), `packages/winglet/style-utils/src/__benchmarks__/ordinaryCss.bench.ts:48`, `packages/winglet/style-utils/src/__tests__/publicCssScoping.test.ts:1`.

## 9. style-utils / inject-add

- **API** — `@winglet/style-utils`의 `styleManagerFactory(scopeId)` → `inject(id,css,compressed?)`입니다. 두 버전의 호출 형태가 같고 매니저 조회 시점이 다릅니다. `packages/winglet/style-utils/src/index.ts:1 / :1`, `src/styleManager/styleManagerFactory.ts:59 / :63`.
- **입력과 측정** — jsdom의 문서에 `inject=styleManagerFactory('p1-inject')`를 만들고 `inject('seed','.seed{color:blue}',true)` 한 번을 적용합니다. 표본마다 활성 매니저에 `inject('sheet','.a{color:red}',true)` 한 번을 재고 반환된 정리 함수는 표본 밖에서 호출합니다. `seed`는 전 표본에서 유지하고 예약 프레임 처리는 표본 밖에서 끝냅니다.
- **plain · 중간** — R2 2번/V4의 조회 경로를 지나지만 이미 존재하는 같은 세대의 매니저를 사용합니다. 파괴 뒤 재사용이나 오래된 정리 콜백과의 충돌이 없습니다. CSS 문자열과 사전 주입은 제안값입니다. [집계 222행](../final-correction/speed-overview.md#L222), [R2 수정 68행](../round-2/FIXES.md#L68), [R5 원장 42행](../final-correction/contract-ledger/winglet-style-utils.md#L42), [V4 69행](../final-correction/DECISIONS.md#L69), `packages/winglet/style-utils/src/__tests__/publicLifecycle.round2.test.ts:38`.

## 10. style-utils / plain-multiple

- **API** — 공개 재구성은 `@winglet/style-utils`의 `compressCss(css:string):string`입니다. `packages/winglet/style-utils/src/index.ts:2 / :2`, `src/utils/compressCss/compressCss.ts:43 / :45`.
- **입력과 측정** — i=0…199에 대해 `'.r'+i+'{color:red;margin:0}'`를 순서대로 만들고 개행 없이 이어 붙입니다. 평면 규칙 200개, 규칙당 선택자 1개와 선언 2개입니다. 완성된 문자열로 `compressCss(css)` 한 번을 잽니다.
- **plain · 낮음** — R1-ST-3~5와 R5-ST-1/2 이후의 공통 구문 처리에 닿습니다. 네임스페이스나 묶음 at-rule, 특수 구분자, 열린 조각이 없습니다. 200개는 남아 있는 벤치의 크기이며 구 행의 규칙 개수 및 압축과 스코핑의 경계는 미확인입니다. [집계 214행](../final-correction/speed-overview.md#L214), [R1 수정 187–191행](../round-1/FIXES.md#L187), [R5 원장 39–40행](../final-correction/contract-ledger/winglet-style-utils.md#L39), `packages/winglet/style-utils/src/__benchmarks__/ordinaryCss.bench.ts:8,74,101`.

## 11. antd5 / checkboxChangePlain

- **API** — `@canard/schema-form`의 `Form`과 `@canard/schema-form-antd5-plugin`의 `plugin`입니다. 두 커밋에서 같은 폼 props와 플러그인 멤버로 연결합니다. `packages/canard/schema-form/src/index.ts:8 / :8`, `packages/canard/schema-form-antd5-plugin/src/index.ts:8 / :8`의 `fieldInputDefinitions`, `FieldRenderer`, `LabelRenderer`, `ErrorMessageRenderer`를 개별 props로 전달합니다.
- **입력과 측정** — 루트 스키마는 `{type:'array',items:{type:'string',enum:['news','sports']},presentation:{inputType:'checkbox'}}`이며 `defaultValue=['news']`, `ValidationMode.None`입니다. 표본 밖에서 `Form → plugin FieldRenderer → Ant Design Checkbox.Group → Checkbox 2개`를 마운트하고 두 번째 체크박스의 DOM 참조를 얻습니다. 측정은 그 `sports` 체크박스의 `fireEvent.click` 한 번과 업데이트 커밋입니다. 저장 배열 `['news','sports']`의 순서는 위젯의 옵션 순서와 헤드의 기존 선택 우선 순서에서 일치합니다.
- **plain · 중간** — R4-ANTD5-S7의 enum 정체성 및 보존 코드가 호출될 수 있지만 기존 값과 클릭 값이 모두 열거의 문자열이라 미등록 값이나 `null`과 문자열의 충돌을 다루지 않습니다. 구 집계에서 수리 행은 같은 Checkbox.Group 계열입니다. 공개 테스트의 열거와 순서를 유지하고 미등록 값만 제거했습니다. [집계 122–124행](../final-correction/speed-overview.md#L122), [R4 원장 43행](../final-correction/contract-ledger/canard-schema-form-antd5-plugin.md#L43), `packages/canard/schema-form-antd5-plugin/src/__tests__/roundFour.unknownCheckbox.table.test.tsx:18,39`.

## 12. common-utils / clone-builtins

- **API** — `@winglet/common-utils`의 `clone<T>(target,maxDepth?):T`입니다. `packages/winglet/common-utils/src/index.ts:195 / :195`, `src/utils/object/clone.ts:216 / :261`.
- **입력과 측정** — 같은 realm의 배열 `[[1,2],new Date(0),/ab/gi,new Map([['x',1],['y',2]]),new Set([1,2])]`를 미리 한 번 만듭니다. RegExp의 `lastIndex`는 생성 직후 값 0입니다. `clone(input)` 한 번을 잽니다.
- **plain · 중간** — R4-CU-1의 원형 확인과 R6-CU-2의 내장 컬렉션 복사가 수행됩니다. 표준 인스턴스만 있으므로 하위 클래스 원형 복구, 재정의 반복자, Error의 `cause`를 처리할 조건이 없습니다. 다섯 계열은 R4 기록을 따르고 각 값과 크기는 제안값입니다. [집계 239행](../final-correction/speed-overview.md#L239), [R4 수정 21–22·230행](../round-4/FIXES.md#L21), [R6 원장 71행](../final-correction/contract-ledger/winglet-common-utils.md#L71), `packages/winglet/common-utils/src/__tests__/publicClone.round4.test.ts:1`.

## 13. common-utils / cloneLite-deep

- **API** — `@winglet/common-utils`의 `cloneLite<T>(target,maxDepth?):T`입니다. `packages/winglet/common-utils/src/index.ts:196 / :196`, `src/utils/object/cloneLite.ts:206 / :208`.
- **입력과 측정** — 숫자 `1`을 `{child:이전 값}`으로 300번 감싼 객체 한 개를 미리 만듭니다. `cloneLite(input)` 한 번을 잽니다. `maxDepth`는 생략합니다.
- **plain · 낮음** — R2-CU-A1의 256 깊이에서 시작하는 반복 처리와 R4-CU-4/V4의 활성 객체 추적을 실행합니다. 300단계의 단일 체인에는 순환이 없고 beta의 재귀도 끝나는 일반 입력으로 예상합니다. 집계 자체가 패키지 귀속을 추정으로 표시하며, 깊이 300은 인접 깊은 복제 행에서 가져온 제안값입니다. [집계 242–244행](../final-correction/speed-overview.md#L242), [R2 원장 26행](../final-correction/contract-ledger/winglet-common-utils.md#L26), [R4 판정 89–102행](../round-4/winglet-common-utils.md#L89), [V4 69행](../final-correction/DECISIONS.md#L69), `packages/winglet/common-utils/src/__tests__/publicCloneLite.depth.round2.test.ts:5`.

## 14. common-utils / clone-deep

- **API** — `@winglet/common-utils`의 `clone<T>(target,maxDepth?):T`입니다. `packages/winglet/common-utils/src/index.ts:195 / :195`, `src/utils/object/clone.ts:216 / :261`.
- **입력과 측정** — 숫자 `1`을 `{next:이전 값}`으로 정확히 300번 감싼 무공유 체인을 준비하고 `clone(input)` 한 번을 잽니다. `maxDepth`는 생략합니다.
- **plain · 중간** — 구 집계가 300단계를 명시하고 12,000단계 회귀와 구분합니다. R5-CU-3의 반복 복제와 R6-CU-1의 깊은 방문 순서가 실행됩니다. 이 입력은 beta의 스택 초과 범위를 의도하지 않으며, 방문 순서에 따라 달라질 공유 참조, 읽기 부작용 또는 깊이 제한이 없습니다. 래퍼 키와 값은 공개 테스트를 바탕으로 고정했습니다. [집계 242행](../final-correction/speed-overview.md#L242), [R5/R6 원장 65·70행](../final-correction/contract-ledger/winglet-common-utils.md#L65), `packages/winglet/common-utils/src/__tests__/publicClone-deep-traversal.test.ts:5,17,28`.

## 15. json / getValue-array

- **API** — `@winglet/json`의 `getValue(value,pointer)`입니다. `packages/winglet/json/src/index.ts:18 / :18`, `src/JSONPointer/utils/manipulator/getValue.ts:138 / :139`.
- **입력과 측정** — 루트 배열 `[{value:10},{value:20},{value:30}]`과 문자열 포인터 `'/1/value'`를 준비합니다. `getValue(data,'/1/value')` 한 번의 결과는 `20`입니다.
- **plain · 중간** — C8의 정규 배열 인덱스 판정 1회와 자기 멤버 확인 2회를 실행합니다. 두 키가 실제로 존재하고 배열은 조밀하므로 비정규 인덱스·hole·상속 멤버 거절은 실행되지 않습니다. 여기서 배열은 대상 값이며 토큰 배열 입력은 6행에서 따로 다룹니다. 루트 모양과 크기는 제안값입니다. [집계 233행](../final-correction/speed-overview.md#L233), [C8 135–139행](../final-correction/DECISIONS.md#L135), `packages/winglet/json/src/__tests__/publicGetValue.inheritedMembers.test.ts:13`.

## 16. schema-form core / mount-plain

- **API** — `@canard/schema-form`의 `Form`과 `ValidationMode.None`입니다. `packages/canard/schema-form/src/index.ts:8,53 / :8,53`, `src/components/Form/components/FormCore/types/props.ts:44,46,95 / :44,46,95`.
- **입력과 측정** — 스키마 `{type:'object',properties:{name:{type:'string'},count:{type:'number'}}}`와 값 `{name:'Ada',count:3}`을 미리 만듭니다. 같은 참조로 `renderToString(<Form jsonSchema={schema} defaultValue={value} validationMode={ValidationMode.None}/>)`를 한 번 예열하고, 표본별 같은 호출 한 번을 잽니다. 트리는 `Form → 기본 객체 렌더러 → 문자열 입력 1개와 숫자 입력 1개`입니다. 첫 HTML 생성이 측정의 끝입니다.
- **plain · 중간** — C12와 엔진 보고서가 밝힌 정적 로드 및 표시 3회(루트 포함)를 따릅니다. R5-SF-F15/F22가 바꾼 이탈·Merge 판정과 공통 준비 코드를 지나지만, 모두 활성이고 자기 데이터 키가 모두 있어 이탈 값·생략·Merge가 없습니다. R2-SF-6의 초기 오류도 전달하지 않습니다. 두 리프 타입과 값은 제안값입니다. [집계 162행](../final-correction/speed-overview.md#L162), [엔진 보고 242·283·363행](../final-correction/engine-report.md#L242), [C12 159행](../final-correction/DECISIONS.md#L159), [코어 원장 32·109·116행](../final-correction/contract-ledger/canard-schema-form.md#L109), `packages/canard/schema-form/src/__tests__/e2e/ssrErrors.round-two.test.tsx:39`.

## 17. schema-form core / whole-array-client-own-write

- **API** — `@canard/schema-form`의 `Form`, `Form.Render`, `ValidationMode.None`입니다. 두 커밋에서 `fieldInputMap`과 `Form.Render`의 `Input onChange`를 같은 방식으로 사용할 수 있습니다. `packages/canard/schema-form/src/index.ts:8,53 / :8,53`, `src/components/Form/Form.tsx:89 / :89`, `src/components/Form/components/FormCore/types/props.ts:70 / :70`.
- **입력과 측정** — 공개 테스트의 `relay=false`를 사용합니다. 스키마는 `{type:'object',properties:{list:{type:'array',items:{type:'string'}}}}`, 초기 값은 `{list:['a']}`입니다. `Form` 아래 `Form.Render path="/list"`에서 `({Input}) => <Input />`을 렌더합니다. `fieldInputMap['/list']`는 배열을 문자열로 직렬화한 `defaultValue`를 쓰는 비제어 `input`이며 자체 변경 핸들러가 `onChange([event.target.value])`를 호출합니다. 표본 밖에서 DOM을 마운트하고 그 입력에 `fireEvent.change(input,{target:{value:'own'}})` 한 번과 업데이트 커밋을 잽니다. 결과는 `{list:['own']}`이고 DOM 입력 참조가 유지됩니다.
- **plain · 중간** — R2-SF-3의 배열 전달·세대 판정 중 동일 입력의 자체 쓰기를 통과합니다. 외부 쓰기, 중계, 파생 쓰기가 없고 재부착 횟수는 0입니다. 공개 테스트에 이 입력이 명시돼 있으며 구 측정의 글자값은 확인되지 않습니다. 엔진 쪽 같은 이름은 별도 표 행입니다. [집계 165–166·200행](../final-correction/speed-overview.md#L165), [엔진 보고 248·472행](../final-correction/engine-report.md#L472), [R2 원장 29행](../final-correction/contract-ledger/canard-schema-form.md#L29), `packages/canard/schema-form/src/__tests__/e2e/wholeArray.round-two.test.tsx:14,66`.

## 18. json / getValue-fragment-plain

- **API** — `@winglet/json`의 `getValue(value,pointer)`입니다. `packages/winglet/json/src/index.ts:18 / :18`, `src/JSONPointer/utils/manipulator/getValue.ts:138 / :139`.
- **입력과 측정** — 객체 `{user:{profile:{name:'Ada'}}}`를 미리 만들고 `getValue(data,'#/user/profile/name')` 한 번을 잽니다. 결과는 `'Ada'`입니다.
- **plain · 중간** — R2-JS-8의 URI fragment 분기는 실행하지만 `%`가 없어 native decode 호출은 0회를 예상합니다. C8의 세 자기 키 확인은 모두 성공합니다. 집계가 인코딩 없는 fragment를 명시하고 정확한 경로는 제안값입니다. [집계 235–236행](../final-correction/speed-overview.md#L235), [R2 수정 49–51행](../round-2/FIXES.md#L49), [C8 135행](../final-correction/DECISIONS.md#L135), `packages/winglet/json/src/__tests__/publicFragments.round2.test.ts:1`.

## 19. schema-form core / context-update

- **API** — 공개 진입은 `@canard/schema-form`의 `Form`과 `context` prop입니다. `packages/canard/schema-form/src/index.ts:8 / :8`, `src/components/Form/components/FormCore/types/props.ts:114 / :114`. 비교 전용 경계는 beta의 `WorkspaceContextProvider → useSnapshot → equals`와 비교 커밋의 `WorkspaceContextProvider → useContextSnapshot → areContextsEqual`입니다. 후자는 비공개이며 beta에 없습니다. `packages/canard/schema-form/src/providers/WorkspaceContext/components/WorkspaceContextProvider.tsx:24 / :30`, beta `packages/winglet/react-utils/src/hooks/useSnapshotReference.ts:69`, 비교 커밋 `packages/canard/schema-form/src/providers/hooks/contextSnapshot/utils/areContextsEqual.ts:30`.
- **입력과 측정** — 스키마 `{type:'object',properties:{name:{type:'string'}}}`, 값 `{name:'Ada'}`, `ValidationMode.None`을 유지합니다. `Form → 기본 객체 렌더러 → 문자열 입력 1개`를 `context={left}`로 마운트합니다. `left={session:{role:'viewer'},locale:'ko'}`, `right={session:{role:'editor'},locale:'ko'}`입니다. 구 집계와 같은 비교 전용 표본은 마운트 밖에서 beta `equals(left,right)` 또는 비교 커밋 `areContextsEqual(left,right)` 한 번이며 결과는 `false`입니다. 공개 경로만 사용하는 표본은 `context={right}`를 전달하는 동일 `Form`의 `rerender` 한 번과 커밋을 재며 전체 업데이트가 포함됩니다.
- **plain · 중간** — R3-SF-7의 스냅숏 교체와 R4-SF-7의 쌍 추적에 닿습니다. 두 객체는 비순환 평면 데이터의 얕은 중첩이고 Error, cause, 불투명 클래스가 없어 R5-SF-F5의 슬롯 처리는 없습니다. 비교 도달 여부를 확인할 스키마와 데이터는 제안값입니다. [집계 160–161행](../final-correction/speed-overview.md#L160), [R3 수정 347행](../round-3/FIXES.md#L347), [R4/R5 원장 71·102행](../final-correction/contract-ledger/canard-schema-form.md#L71), `packages/canard/schema-form/src/__tests__/e2e/contextContent.round-three.test.tsx:122`.

## 20. common-utils / isEmpty-local-map

- **API** — `@winglet/common-utils`의 `isEmpty(value:unknown):boolean`입니다. `packages/winglet/common-utils/src/index.ts:123 / :123`, `src/utils/filter/isEmpty.ts:435 / :435`.
- **입력과 측정** — 같은 realm에서 `new Map([['a',1]])` 한 개를 만들어 재사용합니다. `isEmpty(map)` 한 번의 결과는 `false`입니다.
- **plain · 중간** — 두 버전에서 로컬 `instanceof Map` 뒤 `size`를 읽습니다. R2 7번과 R5-CU-6의 외부 realm에는 닿지 않고 V4가 태그 기반 확대를 철회했습니다. 집계는 일반 로컬 컬렉션을 확인하며 항목 수와 값은 제안값입니다. [집계 230·296행](../final-correction/speed-overview.md#L230), [R2 판정 74행](../round-2/winglet-common-utils.md#L74), [V4 69행](../final-correction/DECISIONS.md#L69), `packages/winglet/common-utils/src/__tests__/publicObjectLimits.test.ts:49`.

## 21. schema-form engine / mount-plain

- **API** — 공개 진입은 두 커밋의 `@canard/schema-form` `Form`과 `ValidationMode.None`입니다. `packages/canard/schema-form/src/index.ts:8,41,53 / :8,41,53`. `FieldNode`는 타입만 게시됩니다. 내부 `buildFieldNodeTree`와 `mountFieldNode`는 양쪽 `packages/canard/schema-form/src/core/index.ts:18–19`에 있고 패키지는 양쪽 `packages/canard/schema-form/package.json:30–31`에서 루트 진입점만 제공합니다.
- **입력과 측정** — 16행과 같은 스키마 `{type:'object',properties:{name:{type:'string'},count:{type:'number'}}}`, 값 `{name:'Ada',count:3}`, `ValidationMode.None`을 사용합니다. `Form → 기본 객체 렌더러 → 문자열 입력과 숫자 입력`의 SSR을 같은 스키마 참조로 한 번 예열하고 표본마다 `renderToString` 한 번을 잽니다. 엔진 지점은 그 호출 속의 최초 루트 빌드와 로드입니다. 보고서의 7µs대 `r3-mount-plain`은 별도 엔진 단독 입력입니다.
- **plain · 중간** — R5-SF-F15/F22에 관련된 주소 및 정착 준비가 실행되지만 미지명 주소, 이탈, Merge, 별칭은 없습니다. 보고서가 SSR P14와 엔진 단독 행을 명시적으로 구분하며 3개 입력 표시를 기록합니다. 스키마의 필드명과 리프 값은 제안값입니다. [집계 194행](../final-correction/speed-overview.md#L194), [엔진 보고 242·283·287·347·363행](../final-correction/engine-report.md#L283), [설계 220행](../final-correction/engine-design.md#L220), `packages/canard/schema-form/src/providers/RootNodeContext/utils/createRootLoad.ts:36,69`, `packages/canard/schema-form/src/__tests__/fixtures/nodeFromJSONSchema.ts:18`.

## 22. mui / stringSwitchMount

- **API** — `@canard/schema-form`의 `Form`과 `@canard/schema-form-mui-plugin`의 `plugin`입니다. `packages/canard/schema-form/src/index.ts:8 / :8`, `packages/canard/schema-form-mui-plugin/src/index.ts:8 / :8`. 두 버전에서 같은 플러그인 부품을 폼에 전달할 수 있으나, 문자열 스위치의 enum 극성과 상태 이름 처리에는 차이가 있습니다.
- **입력과 측정** — 루트 `{type:'object',properties:{mode:{type:'string',enum:['on','off'],presentation:{inputType:'switch',FieldInputProps:{alias:{on:'Alias on',off:'Alias off'}}}}}}`, `defaultValue={mode:'on'}`, `context={}`, `ValidationMode.None`을 사용합니다. `Form → plugin FieldRenderer/LabelRenderer → /mode 문자열 입력 → MUI Switch와 상태 이름`을 `plugin.fieldInputDefinitions`, `FieldRenderer`, `LabelRenderer`, `ErrorMessageRenderer`로 조립합니다. 측정은 신규 클라이언트 마운트 한 번이며 클릭은 없고 언마운트는 측정 밖입니다.
- **repaired · 중간** — 구 집계에는 plain이면서 enum 상태와 alias 표시라고 적혀 있습니다. 이 입력은 두 기능을 실제로 실행합니다. R4-MUI-2로 같은 `'on'`이 beta에서는 해제, 비교 커밋에서는 선택으로 표시되고 R4-MUI-6으로 비교 커밋만 `Alias on`을 표시합니다. 공개 테스트에서 alias만 적용하는 첫 상태를 사용했습니다. [집계 151행](../final-correction/speed-overview.md#L151), [R4 원장 34·38행](../final-correction/contract-ledger/canard-schema-form-mui-plugin.md#L34), `packages/canard/schema-form-mui-plugin/src/__tests__/roundFour.switchParity.table.test.tsx:113,133`, `src/fieldInputs/FieldInputStringSwitch.tsx:51 / :62`.

## 23. json / patch-array-test-mutable

- **API** — `@winglet/json`의 `applyPatch(source,patches,options?)`입니다. `packages/winglet/json/src/index.ts:8 / :8`, `src/JSONPointer/utils/patch/applyPatch/applyPatch.ts:88 / :94`. 양쪽 옵션 타입에 `strict`가 있지만 비교 커밋에서는 deprecated이며 실행 시 읽지 않습니다. `src/JSONPointer/utils/patch/applyPatch/type.ts:11–22 / :11–22`.
- **입력과 측정** — 조밀한 루트 배열 `[10,20,30]`, 패치 배열 `[{op:'test',path:'/1',value:20}]`, 옵션 `{immutable:false,strict:true}`를 미리 만듭니다. `applyPatch(source,patches,options)` 한 번을 잽니다. 값과 원본 배열 참조가 유지되므로 표본 사이에 그대로 재사용합니다.
- **plain · 중간** — R1-JS-3은 `strict`와 무관하게 test를 검사하도록 바꿨습니다. 두 버전이 정수 비교를 한 번 수행하도록 beta에도 `strict:true`를 넘깁니다. 현재는 같은 정수에서 직접 비교로 끝납니다. R1-JS-A1의 인덱스 파서는 실행하지만 `'1'`은 32비트 범위 안의 유효한 인덱스입니다. 구 집계가 정수 비교 1회를 명시하고 숫자와 자리는 제안값입니다. [집계 245행](../final-correction/speed-overview.md#L245), [R1 원장 13·18행](../final-correction/contract-ledger/winglet-json.md#L13), `packages/winglet/json/src/JSONPointer/utils/patch/applyPatch/utils/handleArray.ts:106`, `packages/winglet/json/src/__tests__/publicPatchTransfers.test.ts:41`.

## 24. schema-form core / react-bridges

- **API** — `@canard/schema-form`의 `Form`, `Form.Render`, `ValidationMode.None`으로 내부 `FieldProxy/FieldInputBridge`를 구동합니다. `packages/canard/schema-form/src/index.ts:8,53 / :8,53`, `src/components/Form/Form.tsx:89 / :89`. 내부 브리지는 양쪽 패키지 루트에서 직접 내보내지 않습니다.
- **입력과 측정** — 스키마 `{type:'object',properties:{email:{type:'string',title:'Email'}}}`, 고정 값 `{email:'a@example.test'}`, `ValidationMode.None`입니다. `Form`의 자식 `Form.Render path="/email"`에서 `({Label,Input}) => <div><Label/><Input/></div>`를 반환합니다. 표본 밖에서 스키마와 값을 만들고 동일 트리를 한 번 예열합니다. 표본당 `renderToString` 한 번으로 `Form → Form.Render → bound Label/Input → FieldInputBridge → 기본 텍스트 입력`을 그립니다. DOM 이벤트, hydration, errors prop은 생략합니다.
- **plain · 낮음** — SSR 배선과 FieldProxy는 확인되며 원래 자식 수와 레이아웃은 미확인입니다. 이 트리는 R4-SF-8의 기본 식별자 바인딩을 실행합니다. Form이 하나라 교차 폼 충돌이 없고, R2-SF-6의 초기 오류 적용 조건도 없습니다. 같은 스키마로 여러 Form을 그리는 공개 테스트는 스키마 및 레이블 결합의 근거입니다. [집계 163행](../final-correction/speed-overview.md#L163), [R1 수정 311행](../round-1/FIXES.md#L311), [R3 수정 262행](../round-3/FIXES.md#L262), [코어 원장 32·72행](../final-correction/contract-ledger/canard-schema-form.md#L72), `packages/canard/schema-form/src/__tests__/e2e/formIdsHydration.round-three.test.tsx:11,38`, `packages/canard/schema-form/src/components/FieldProxy/FieldProxy.tsx:55`.

## 조정자 결정

아래 결정이 위 각 행의 설명보다 우선합니다.

- **2·3 `rest-changed`, `rest-equal`** — 렌더 한 번 안의 훅 호출 한 번은 수백 ns라서 타이머 해상도에 묻힙니다. 그래서 고정 횟수 K번 `useRestProperties`를 반복 호출하는 컴포넌트를 쓰고, 렌더 함수 안에서 그 반복 전체를 잽니다. 호출마다 미리 만든 별도의 props 객체를 씁니다. 반복 횟수가 렌더마다 같으므로 훅 순서 규칙을 지킵니다. K는 실행기의 배치 보정과 같은 기준(빠른 쪽 약 5ms)으로 정하고, 호출당 시간은 K로 나눈 값입니다.
- **19 `context-update`** — 비교 전용 표본은 두 커밋에서 다른 비공개 함수를 부르므로 쓰지 않습니다. 공개 경로 표본만 씁니다. 그 표본은 `context={right}`를 넘기는 `rerender` 한 번과 그 커밋까지입니다.
- **21 엔진 `mount-plain`** — 공개 진입점만으로는 엔진 단독 구간을 떼어 낼 수 없고, SSR로 재면 16행과 같은 측정이 됩니다. 그래서 같은 스키마와 값의 `Form`을 jsdom에서 클라이언트로 새로 마운트(`createRoot` + `flushSync`)하는 한 번을 잽니다. 16행은 SSR 경로, 21행은 클라이언트 마운트 경로를 맡습니다.
- **22 `stringSwitchMount`** — 문자열 enum 스위치는 수정된 enum 극성 경로를 반드시 지나므로, 이 행은 `repaired` 행으로 잽니다. 초과하면 수정 비용 조건을 확인합니다.
- **신뢰도가 낮은 행(5, 7, 8, 10, 13, 24)** — 제안된 입력을 그대로 확정합니다. 이 행들은 옛 수치와 비교하지 않고 베타와 새로 비교하므로, 입력이 평범한 입력 조건만 지키면 판정에 충분합니다.

## 확인이 필요한 행

- **낮은 신뢰도** — 5 `isEmpty-general`(배합), 7 `document-fresh-add`(팩토리 포함 범위), 8 `flat-combinator`와 10 `plain-multiple`(압축/스코핑 경계), 13 `cloneLite-deep`(귀속·깊이), 24 `react-bridges`(SSR 하위 트리).
- **API 및 동작 차이** — 19 `context-update`는 공개 prop이 같고 비교 전용 API가 다릅니다. 21 `mount-plain`의 엔진 단독 생성과 24 `react-bridges`의 내부 브리지는 양쪽 모두 비공개입니다. 22 `stringSwitchMount`는 같은 공개 조립 방식으로 R4의 상태/표시 차이를 실행합니다. 23 `patch-array-test-mutable`의 `strict`는 beta에서 비교를 활성화하고 비교 커밋에서는 무시됩니다. 7·9의 스타일 주입기 서명은 같고 매니저 획득 시점이 다릅니다.
