# 14라운드 — 현행 코드 서술 대조 원문 (로컬 verifier, opus)

2026-09-24. 편집자는 고치지 않았다. 판정과 반영은 `round-14-values-check.md`.

현행 코드 서술 대조 결과: 조건부 통과입니다. 핵심 주장 대부분은 맞지만 틀린 서술 둘(`merge` 의미, 검증기 앞 제거의 "현행 유지")과 부분적으로 맞는 서술 다섯이 있어 고쳐야 합니다.

근거: 소스 판독과 탐침 실행 두 번으로 확인했습니다. 탐침은 vite-node와 패키지 vite.config.ts로 돌렸고, 스크립트는 저장소 밖 $TMPDIR/probe-exit-verifier.ts와 probe2-verifier.ts에 두었습니다. 저장소는 수정하지 않았습니다.

대조 표 (번호 | 문서 위치 | 주장 | 소스 근거 | 판정 | 실제 동작)
1 | 03:191, adr/0013:87, 07:422 | "꺼지면 원본을 지우고 다시 켜지면 로드 값(없으면 `default`)으로 되돌린다" | AbstractNode.ts:564-574, 1063-1093, BranchStrategy.ts:465-520, 탐침 | 부분 맞음 | 복원 값은 노드가 생성될 때의 값입니다(AbstractNode.ts:1197, BranchStrategy.ts:362·918). 뒤의 전체 교체는 반영되지 않습니다(탐침: 'REPLACED'로 교체한 뒤 껐다 켜면 'LOAD'). `oneOf` 전환에서 복원 값도 default도 없으면 앞 분기의 같은 이름·같은 타입 터미널 값을 잇습니다(ObjectNode.oneOf.test.ts:306).
2 | 02:134, 03:130, adr/0005:99 | `merge`는 "배열은 통째 교체, 함수·원시값은 나중 승, 늘 새 객체에" | common-utils/src/utils/object/merge.ts:312-336 | 틀림 | 배열은 인덱스별로 재귀 병합합니다. target을 제자리에서 바꿔 돌려줍니다. source의 `undefined`는 기존 값을 덮지 않습니다. 함수·원시값 나중 승만 맞습니다.
3 | 03:21, 07:152, adr/0002:193, adr/0003:15 | `const`/`enum` 자동 감지로 분기를 고르고 `&if`와 결합한다 | getExpressionFromSchema.ts:35-51, extractConditionInfo.ts:43-58, combineConditions.ts:15-20, 탐침 | 맞음 | AND 결합입니다. object 타입만 해당하고(getConditionIndexFactory.ts:37), `type`/`$ref`가 없는 속성만 봅니다.
4 | 02:292, 07:156, adr/0003:76 | 루트 키 다섯의 특수 처리 | checkComputedOptionFactory.ts:22-26, ComputedPropertiesManager.ts:258-266, needsRealComputedManager.ts:38-43 | 맞음 | 루트 키가 모든 노드에 적용되고 노드 자신의 값을 덮습니다(탐침: 루트 `readOnly: true`가 자손의 `readOnly: false`를 이김).
5 | 07:292 | 조상 상속은 "오늘은 전파 없음" | 위 파일, 탐침 | 부분 맞음 | 중간 조상은 전파하지 않습니다(탐침: 부모 `readOnly: true`, 자식은 false). 루트 스키마 키는 모든 노드에 퍼집니다.
6 | 07:162·422, adr/0003:35 | `computed`가 `&`를 이기고, 표준 키가 `&`를 이긴다 | checkComputedOptionFactory.ts:23-26, 탐침 | 맞음 | 없음
7 | 07:162 | Form 속성은 OR다 | SchemaNodeInput.tsx:46·111 | 맞음 | 없음
8 | 03:174·183 | `JSONSchemaError` 클래스·인터페이스 이름 충돌, `jsonSchemaCompileFailed`, 항상 `console.error` | errors/JSONSchemaError.ts:24, types/error.ts:307, getFallbackValidator.ts:18, ValidationManager.ts:199-232 | 맞음 | 없음
9 | adr/0003:86 | "예약 층의 키는 … 키워드 위치에서만 제거한다(현행 유지)" | stripSchemaExtensions.ts의 mutate | 틀림 | 오늘 지우는 키는 `FormTypeInput`·`FormTypeInputProps`·`FormTypeRendererProps`·`errorMessages`·`options`·`injectTo` 여섯뿐입니다. `&` 키, `computed`, `virtual`, `formType`, `terminal`, `placeholder`, `propertyKeys`는 검증기까지 갑니다(01 §4.2와 일치). 현행인 것은 위치 규칙뿐입니다.
10 | adr/0001:21 | 폼 전용 키 제거는 "현재 `stripSchemaExtensions`가 하는 일" | 위와 같음 | 부분 맞음 | 기제는 맞습니다. 목록은 여섯뿐입니다.
11 | 03:53, adr/0003:86, adr/0011:3 | 오늘 `virtual`의 `required` 재작성이 있고, `virtual`은 제거 목록에 없다 | processVirtualSchema.ts, transformCondition.ts, preprocessSchema.ts | 맞음 | 없음
12 | 03:53, 02:59, adr/0003:26·55 | 표현 키(`terminal`, `FormTypeInput`, `propertyKeys`)는 "렌더 계층만 읽는다" | getNodeGroup.ts:20-31, BranchStrategy.ts:777-779 | 틀림(오늘 기준) | core가 `terminal`과 `FormTypeInput` 유무로 노드 그룹, 곧 자식 생성 여부를 정합니다. `propertyKeys`로는 방출 키 순서를 정합니다. adr/0011 §3도 새 설계에서 이 규칙을 유지합니다.
13 | adr/0011:56 | `terminal` 명시 재정의를 양방향으로 "둔다" | getNodeGroup.ts:20-21 | 틀림 | 오늘 이미 `terminal: true`와 `terminal: false`가 둘 다 동작합니다.
14 | 03:53, 02:59, 07:422 | 오늘 맨 키로 쓰는 것은 `disabled`·`visible`·`active` | checkComputedOptionFactory.ts:24, ComputedPropertiesManager/utils/type.ts:35-41 | 부분 맞음 | 맨 키 `pristine`도 오늘 읽습니다. 그런데 이주 목록에 없습니다.
15 | adr/0003:15 | `watch`·`derived`·`if`는 `computed.X`와 `&X`의 두 철자다 | getObservedValuesFactory.ts:30, getDerivedValueFactory.ts:22, extractConditionInfo.ts:44 | 맞음 | 이 셋은 맨 키로 읽지 않습니다.
16 | 01:17·73, 05:126, adr/0008:19 | 통지는 마이크로태스크 배치이고, `afterMicrotask`는 매크로태스크 디바운스이며, `onChange`는 한 번만 불린다 | EventCascadeManager.ts의 __acquireBatch__, afterMicrotask.ts:18-28, AbstractNode.ts:1219-1223, 탐침 | 맞음 | 탐침: 쓰기 두 번 뒤 마이크로태스크 두 개가 지나도 0회, 매크로태스크 뒤 1회였습니다.
17 | adr/0008:67 | 파동 중 해지한 리스너는 부르지 않는다 | EventCascadeManager.ts의 __resolve__(Set을 그대로 순회) | 맞음 | 파동 중 추가한 리스너는 같은 파동에서 불립니다. 문서가 바꾸려는 점과 일치합니다.
18 | adr/0008:142, 05:90 | `publish`는 내부 타입만 받는다 | AbstractNode.ts:30·891, src/index.ts:44 | 맞음 | 없음
19 | adr/0004:13-15 | 플러그인 `compile(schema)`가 있고, 동기 반환이 허용되며, ajv8은 `$async`를 쓴다 | app/plugin/type.ts:241-249, types/error.ts:209-212, createValidatorFactory.ts:19-25 | 맞음 | 오늘 컴파일은 루트에서 한 번, `validationMode`가 있을 때만, 전처리한 루트 스키마로 합니다(ValidationManager.ts:198-204).
20 | adr/0001:45 | `nodeFromJSONSchema` 경로와 `<Form>` 경로의 계약이 다르다 | Form.tsx:91, nodeFromJSONSchema.ts:45-55 | 맞음 | 없음
21 | 07:176·180·185·294 | `allOf`에서 주석 키는 먼저-승, 나머지는 나중-승, `if` 무시, `options` 통째 교체 | intersectSchema/utils/constants.ts:8-20, processOverwriteFields.ts:15-25, processAllOfSchema.ts:38-44 | 맞음 | `allOf` 병합에 한정됩니다.
22 | 07:208 | `findNodes.ts:89-90`의 별칭 경로 | findNodes.ts:89-90 | 맞음 | 없음
23 | 07:273 | `Merge`의 `undefined` 처리는 "확인하지 못했다" | 탐침 | 이제 확인됨 | `Merge`로 `{a: undefined}`를 쓰면 `a`가 값에서 사라집니다. 선언되지 않은 키는 남습니다.
24 | adr/0013:58·65, 02:325, 07:345 | 기본값은 `Overwrite`, `Automatic` 플래그, `oneOfIndex`·`anyOfIndices` | AbstractNode.ts:354-363·490-500, core/types/value.ts:47 | 맞음 | 없음

발견 표 (번호 | 심각도 | 설계에 미치는 영향 | 원칙만으로 고칠 수 있는가 | 고칠 문장 제안)
F1 | 높음 | `options` 깊은 병합 규칙이 인용한 유틸의 실제 동작과 반대입니다. 배열 옵션은 조각 사이에서 인덱스별로 섞여 앞 조각의 긴 꼬리가 남습니다. target을 바꾸므로 작성자 스키마 객체도 오염됩니다. | 배열을 통째 교체할지는 소유자 판단이 필요합니다. 통째 교체라면 `merge`를 그대로 쓸 수 없습니다. 변이 문제는 호출자 객체 불변 원칙(adr/0011 §3)만으로 고칠 수 있습니다. | 소유자가 `merge`를 그대로 쓴다면: "`merge`를 빈 객체에서 시작해 조각 순서대로 적용한다. 객체는 재귀 병합, 배열은 인덱스별 병합, 함수·원시값은 나중 승이며, 나중 조각의 `undefined`는 앞 값을 지우지 않는다." 통째 교체를 고른다면: "배열은 `merge`와 달리 통째 교체한다(전용 함수)."
F2 | 높음 | 제거 목록의 확대가 "현행 유지"로 적혀 있습니다. 그래서 이주 항목과 검증기 입력 변화가 가려집니다. strict 검증기를 쓰는 소비자에게는 동작 변화입니다. | 원칙만으로 고칠 수 있습니다. | adr/0003:86: "(위치 규칙은 현행 유지다. 목록은 넓어진다. 오늘 `stripSchemaExtensions`가 지우는 키는 여섯뿐이고 `&` 키·`computed`·`virtual`·`formType`·`terminal`·`placeholder`·`propertyKeys`는 검증기에 간다. 목록 확대는 이주 항목이다.)" adr/0001:21에도 "목록은 넓어진다(ADR 0003 §7)"를 붙입니다.
F3 | 중간 | `terminal`과 `FormTypeInput` 유무가 청사진의 노드 생성을 정하므로 "작업 루프 밖, 렌더 계층만"은 거짓입니다. adr/0011:56은 "ADR 0003의 미결과 함께 정한다"고 하는데 ADR 0003은 이미 표현 키로 닫아 두 문서가 모순됩니다. | 분류(제어 키인가, `&`를 붙이는가)는 소유자 판단이 필요합니다. 사실 서술은 원칙만으로 고칠 수 있습니다. | 03:53에 추가: "단 `terminal`과 `FormTypeInput`의 유무는 청사진이 노드 그룹을 정할 때 읽고, `propertyKeys`는 방출 키 순서를 정할 때 읽는다(오늘 `getNodeGroup.ts:20-31`, `BranchStrategy.ts:777-779`)." adr/0011:56: "오늘도 `terminal: true`와 `terminal: false`가 양방향으로 있다(`getNodeGroup.ts:20-21`). 유지한다."
F4 | 중간 | 이주 안내가 "로드 값으로 복원"이라고만 해서 두 가지 오늘 동작이 빠집니다. 전체 교체 뒤에도 생성 때 값으로 돌아가는 것, 그리고 `oneOf`에서 같은 이름·같은 타입 값을 잇는 것입니다. 회귀 판단이 틀어집니다. | 원칙만으로 고칠 수 있습니다. | 03:191, adr/0013:87: "오늘의 동작: 꺼지면 원본을 지우고, 다시 켜지면 노드가 생성될 때의 값(없으면 `default`)으로 되돌린다. 뒤의 전체 교체는 이 복원 값을 바꾸지 않는다. `oneOf` 전환에서 둘 다 없으면 앞 분기의 같은 이름·같은 타입 터미널 값을 잇는다."
F5 | 중간 | 설계 전제에서 한 경로가 빠졌습니다. Form 속성 `validatorFactory`(components/Form/type.ts:86)는 오늘 플러그인보다 먼저 쓰입니다(ValidationManager.ts:203). 그런데 문서 어디에도 언급이 없습니다. `compileGuard`는 플러그인 계약에만 더해지므로 이 속성만 준 폼은 "검증기 미등록"으로 처리되어 게이트가 모두 꺼집니다. | 소유자 판단이 필요합니다. 속성에 가드 팩토리를 더할지, 속성을 없앨지 정해야 합니다. | adr/0004 결정 절에 추가: "Form 속성 `validatorFactory`는 [가드 팩토리를 함께 받는다 / 없앤다]. 미등록 판정은 플러그인과 이 속성을 함께 본다."
F6 | 낮음 | 조건도 판별식도 없는 `oneOf`·`anyOf`는 오늘 어느 분기도 켜지지 않습니다(탐침: `oneOfIndex` -1, 값 {}). 새 설계에서는 모든 분기가 켜집니다. 07 §9 이주 목록에 이 항목이 없습니다. | 원칙만으로 고칠 수 있습니다. | 07:422에 추가: "조건 없는 `oneOf`·`anyOf`는 오늘 어느 분기도 켜지지 않으나 새 설계에서는 모든 분기가 켜진다."
F7 | 낮음 | 맨 키 `pristine`이 이주 목록에서 빠졌습니다. | 원칙만으로 고칠 수 있습니다. | 03:53, 02:59, 07:422, adr/0003:96: "맨 키 `disabled`·`visible`·`active`에 `&` 접두, 맨 키 `pristine`은 `&resetInteraction`으로."
F8 | 낮음 | "전파 없음"이 루트 키가 모든 노드에 퍼지는 동작을 가립니다. | 원칙만으로 고칠 수 있습니다. | 07:292: "(오늘 중간 조상은 전파하지 않고, 루트 스키마 키만 모든 노드를 덮는다)"

확인하지 못한 것:
- adr/0008:21의 "상태 계산은 쓰기마다 반복된다"는 계측하지 않았습니다. AbstractNode.ts:527의 의존 구독 경로를 보면 그럴 법하다는 데까지만 확인했습니다.
- 05-before-after.md는 표본 행(20·21·23·90·126·137)만 대조했습니다.
- `anyOf` 전환의 세부와 Form `defaultValue` 속성 변경 경로는 탐침하지 않았습니다.
