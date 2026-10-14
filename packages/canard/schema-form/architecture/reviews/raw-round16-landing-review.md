# 16라운드 원자료 — 정착 검토 (verifier, 2026-09-24). 판정: 조건부 통과, 조건 여덟

경로는 `packages/canard/schema-form/` 기준. "확인"은 코드를 읽거나 실행한 것.

실행으로 확인: `yarn vitest run src/__tests__` 45파일 447건 통과. ajv 8 탐침: 떼어 낸 `if`는 `$ref`로 `MissingRefError`; `addSchema(root)` 뒤 `getSchema('root#/oneOf/0/if')`는 동작; 같은 `$id` 루트 재컴파일은 "already exists"로 실패; 가드 200개 컴파일 약 28 ms.

## 1. 정착 지도
| PR | 부딪히는 기존 파일 | 재사용 | 새 fractal 자리 |
|---|---|---|---|
| PR-1 | `helpers/jsonSchema/preprocessSchema/preprocessSchema.ts:17-39`(oneOf 자동 감지·virtual required 재작성), `processAllOfSchema.ts:29-55`(정적 평탄화, if/then/else 경고 무시), `core/nodes/schemaNodeFactory.ts:88-98,136-146`(스키마 변이), `BranchStrategy/utils/{getConditionsMap,getFieldConditionMap,mergeShowConditions,getCompositionNodeMapList}` | `stripSchemaExtensions.ts:29-53` 틀 그대로, 키 목록만 그룹 셋으로 | `src/core/blueprint/`. `core/INTENT.md:18` "새 노드는 AbstractNode 상속"을 먼저 고친다 |
| PR-2 | `AbstractNode.ts` 414-424(onChange 전파), 599-606(`__scoped__`), 1063-1094(`__reset__`), 1219-1223(루트 매크로태스크 디바운스); `ObjectNode.ts:96-109`; `BranchStrategy.ts`; `getNodeGroup.ts:16-29`(터미널 판정에 `isReactComponent`, P5 위반); `core/parsers/*`(강제 변환, ADR 0013 충돌) | `getResolveSchema`($ref 깊이 1 지연), `extractSchemaInfo`, `omitEmptyObject`, `findNode`·`traversal`(조직 안이라 옮김) | `src/core/tree/`, `src/core/settle/` |
| PR-3 | `AbstractNode.ts:516-557`(의존 경로 이벤트 구독), 967-1022와 `InjectionGuardManager`(주입 순환 차단), `getDerivedValueFactory` | `createDynamicFunction.ts:18-59`의 `dependencies[i]` 주입 형태 | `settle/derive/` |
| PR-4 | `EventCascadeManager.ts:90-125`(노드별 마이크로태스크, 100회 throw :34), `ValidationManager.ts:198-222`(루트 컴파일, 실패 삼킴), 계약이 `compile` 하나(`app/plugin/type.ts:240-249`, `types/error.ts:119-121`), ajv 셋 모두 `$async: true`(`ajv8-plugin/src/validator/createValidatorFactory.ts:19-22`) | `EventCascadeManager.ts:165-201` 비트별 배달 원장 개념, `ValidationManager.ts:124-127` 세대 번호, `helpers/error/transformErrors` | `src/core/dispatch/`, `src/core/validation/`, `app/plugin/type.ts` 개정 |
| PR-5 | `ArrayNode/strategies/*`, 비동기 `push`(`promiseAfterMicrotask`, `sharedResolvedPromises`) | `resolveArrayLimits`, `omitTrailingArray`, `omitEmptyArray` | `tree/` 종류 표 배열 항목 |
| PR-6 | `AbstractNode.ts:1202-1206`(루트 스키마 전역 상속), `checkComputedOptionFactory`, `mergeShowConditions` | 없음 | `settle/` 계산 끝 |
| PR-7 | `RootNodeContextProvider.tsx:84-107`, `Form.tsx:90-93,151,311-312`, `SchemaNodeProxy`, `SchemaNodeInput`, `useFormTypeInput`, `PluginManager.ts:25-37`, UI 플러그인 27파일, `types/jsonSchema.ts:229-302` | 가상화, `renderForm`, `providers` 대부분 | 기존 자리. `core/index.ts` 수출만 새 fractal로 |

08이 "재사용"이라 적은 다섯: 교차 연산은 잎 함수만(`FIRST_WIN_FIELDS`가 먼저 승, `processOverwriteFields` 얕은 덮어쓰기, `intersectEnum:36`·`intersectConst:24`·`validateRange` 무조건 throw, `distributeSubSchema:55-61` 변이, 진입점이 `processAllOfSchema`만 내보냄) → 잎 교차 함수만 새 fractal로 이름 내보내기. `helpers/dynamicExpression`은 조건 사전→식 문자열 생성기뿐, 실제 컴파일러·경로 추출은 `ComputedPropertiesManager/utils/{createDynamicFunction,regex,getPathManager}`(삭제 대상 조직 안) → PR-1에서 `helpers/dynamicExpression/`으로 옮김(시험 8개 포함). `helpers/jsonPointer` 그대로(`getAbsolutePointer.ts:26-84`, DETAIL.md 없음). 가상화 그대로(WeakSet identity). `renderForm` 그대로 + `setupValidatorPlugin`(80-128)에 동기 `compileGuard`.

## 2. React 바인딩
- `useSchemaNodeTracker`(`useSyncExternalStore` + revision mask) 모양 유지. `useSchemaNodeSubscribe` 유지. `SchemaNodeProxy`는 유효 스키마 변경 비트 구독과 `presentation.FormTypeRendererProps`. `SchemaNodeInput.handleChange`(49-59)가 `setValue`·`clearExternalErrors`·`setState(Dirty)` 세 진입을 차례로 → 사슬 끝 throw면 dirty 누락, `batch`로 묶거나 값 쓰기를 마지막에; 공개 비트 넷에 Refresh 없음 → 입력 출처 표식이 내부 통로로 필요. `useFormTypeInput`(29-66) 메모 의존이 `node`뿐 → 유효 스키마 참조 추가. `useChildNodeComponents`·`useChildNodeErrors`: 상태·오류 변경 배달 통로가 설계에 없음(설계 공백). `DeferrableNodeProxy` 즉시 재발행 통로 유지. `RootNodeContextProvider`(84-107) 렌더 중 `useMemo`로 트리 생성 → 마운트 로드 정착이 렌더 중 동기, 콜백은 준비 뒤로 미루는 계약; `Form.tsx:90-93` `clone`은 가드 공유를 깸; `reset`(151)은 재마운트; `ErrorBoundary.tsx:40-60`에 다시 던지기 판정 인자 없음.
- React: StrictMode가 `useMemo` 두 번 → 가드 캐시를 작성 객체 키로. 동기 통지로 "Cannot update a component while rendering" 경고 범위 확대(문서화). `startTransition` 안 쓰기는 동기 차선 강등(문서화). 사슬 끝 throw의 머리가 React 이벤트 처리기라 바운더리에 닿지 않고 전역 오류. 검증 결과 도착 파동을 설계에 적을 것. React 18 미검증(설치 19.2.6).

## 3. 서지 못하는 자리
| 설계 | 판정 | 권고 |
|---|---|---|
| `compileGuard(schema)` 동기 호출 | 불가(실행 확인): 떼어 낸 `if`의 `$ref` 실패, ajv 셋 `$async`, 같은 `$id` 재컴파일 throw. ADR 0004:70은 이미 (루트, 위치) | `compileGuard(root, pointer)`, 캐시 (검증기 인스턴스, 작성 루트 객체) WeakMap, `Form`의 `clone` 제거 |
| `extras` 정적 규칙 | 가능. 스캐너 항목 `keyword`·`variant`·`dataPath`; `$ref` 순환은 `referenceSkipped:'cycle'` | 조각 표 만드는 걸음에서 함께 뽑음 |
| 유효 스키마 메모 | 가능(추정). 활성 부분집합을 비트 정수로 키, 위치별 메모. 후보에 `controls.children` 항목과 조각 `controls`까지 넣어야 "같은 집합 = 같은 참조" | 새 집합마다 한 번 병합 |
| 되돌림 기록 원본 B | 가능하나 범위 확대: `extras`, 배열 아이템 구조 생성·폐기, 중간 채움 철회 순서 | 기록 항목 = {노드, 이전 raw, 이전 extras, 구조 변경} |
| `presentation.FormTypeInput` 유무로 터미널 | 모순 아님. `getNodeGroup.ts:27-29` React 판정을 "있고 null 아님"으로. UI 플러그인이 `options.protocols·minimum·maximum·lazy`를 읽음 | 플러그인 자유 칸은 `presentation`으로 |
| UI 플러그인 넷은 타입·등록 키만(08:530) | 틀림: `FormTypeInputDefinition` 11–19회, `FormTypeInputPropsWithSchema` 8–15회, 27파일이 `jsonSchema.options.*`·맨 키(`formType`·`radioLabels`·`switchLabels`·`lazy`·`ampm`·`minRows`·`maxRows`) 읽음(mui 7/19, antd5 9/22, antd6 9/22, antd-mobile 2/14), 노드 표면 `push`·`remove`·`maxItems`·`length` | PR-7 규모 재산정 |
| §14 누락 행 | `validatorFactory` 모양, `ValidatorPlugin.compileGuard`, 동적 `node.jsonSchema`, `FormHandle.reset` 의미, 플러그인 `options` 자유 칸 | 행 추가 |
| 08:530 "ajv는 타입만" | 505행과 모순 | 동기 `compileGuard`·루트 등록 구현 |

## 4. 노드 합성 형태
단일 클래스 하나(하위 클래스 없음), 공통 필드 고정 배치 + 종류별 데이터 `branch` 한 칸, 종류별 동작 `KIND[kind]` 표(합성·투영·입력 해석·자식 구성), 정착은 `settle`의 자유 함수. 클래스를 없앨 수 없는 이유: `setValue`·`find`·`subscribe`·`push`·`remove`가 공개 계약, 클로저는 노드 수만큼 메모리. 배열 메서드는 클래스에 두되 `ArrayNode` 인터페이스에만 타입, 비배열 호출은 `SchemaFormError`. 공개 타입 `SchemaNode`는 판별 합집합 인터페이스, `InferSchemaNode` 유지(`core/types/node.ts:26-51`). `index.ts:32-55`가 노드 타입을 `type`으로만 내보내므로 클래스→인터페이스 무해. `isSchemaNode`는 `instanceof AbstractNode`(`filter.ts:54-55`) → 단일 클래스 `instanceof`나 `Symbol.for` 상표. 유지 이유: 공개 가드 아홉, `InferSchemaNode`로 `push` 타입 검사(`types/formTypeInput.ts:102-106`), 가상화 WeakSet, `useChildNodeComponents.tsx:56`의 `isTerminalNode`, antd5 `FormGroup.tsx:18`의 `node.group`. 의존 방향: `tree` → (`settle`에 의존 안 함); 겉면은 `tree`·`settle`·`dispatch`·`validation`을 합성하는 상위 fractal.

## 5. 테스트
| 부류 | 기준 | 대표 | 규모 |
|---|---|---|---|
| 그대로 산다 | 순수 함수·타입 사상, 새 엔진에 시그니처·의미 그대로, 타이머 없음, §14 어느 행에도 안 걸림 | `helpers/jsonPointer/utils/__tests__/*`, regex 시험(옮김), 잎 교차 시험(FIRST_WIN 제외), `ArrayNode/utils/__tests__`, `InferSchemaNode.type.test.ts` | 약 30 |
| 표면만 고친다 | 기대값이 08 규칙에서 그대로 나오고 이름만 바뀜(`computed`→`controls`, `normalizedValue`→`outputValue`, `FormGroup`→`FormTypeGroupRenderer`, `JSONSchemaError`→`ValidationIssue`) | 조합·옛 키 없는 시나리오 17파일(`array.mutation-identity`, `controlled-interaction`, `default-value`, `formType-resolution`, `state-management`, `validation.errors`…). 반례 `terminal-mode.render.test.tsx:251,294`(§14 17행) | 약 25 |
| 버리고 새로 쓴다 | 기대값이 §14 이주 행이나 삭제될 내부를 단언 | `core/__tests__` 87 중 옛 표면 52, 타이머 의존 78; `oneOfSchemaPath`(`schemaPath` 106회), `AbstractNode.injectTo`(52건), `core/parsers/__tests__`, 시나리오 `composition.*`·`computed.*` | 약 150 |
| 새로 있어야 한다 | 청사진 표, 정착 루프(프로토타입 63+108+26+52 이식, 예산, 원본 B), 디스패처, 검증(커밋 스탬프, (루트,위치) 가드, 중복 `$id`), 차등, 훅(오늘 0), 바인딩(렌더 중 onChange 없음, StrictMode, 다시 던지기, degraded 제출 거부, 입력 출처·Refresh), React 18 | — |
- `renderForm`은 실제 React 렌더(act, userEvent, StrictMode, 재마운트 계측) → e2e 뼈대 가능. 고칠 것: `setupValidatorPlugin`에 동기 `compileGuard`·루트 등록, `caughtErrors`(335-339) 창 이벤트만, `reset`(490-495) 의미, `flushOnMount:false`(26회)의 뜻 소멸. 44 시나리오 중 27파일 재작성, 17파일 단언별 대조. PR-4에 훅 수준 바인딩 시험.

## 조건 여덟
1 가드 계약 (루트, 위치) + ajv 셋 동기 가드 경로 + 작성 루트 캐시. 2 "재사용" 두 문장 사실대로. 3 바인딩 넷 명세(마운트 콜백 억제, 입력 출처 표식, handleChange 순서, 바운더리 다시 던지기 인자). 4 상태·오류·명령 사건과 검증 결과의 배달 경로. 5 되돌림 기록에 extras·배열 구조. 6 UI 플러그인 규모와 `options` 충돌 반영. 7 공개 노드 타입·가드는 단일 클래스 겉면 + 판별 인터페이스. 8 훅·바인딩 시험과 React 18. 1·2·6은 문서 사실 오류라 PR-1 전에.

## 08 수정 명세(verifier)
1 08:530 UI 플러그인 문장 교체(가져오기 목록, 27파일 `options.*`·맨 키, 노드 표면), "ajv는 타입만" → "동기 `compileGuard`와 루트 등록 구현". 2 08:502 `dynamicExpression` → "`createDynamicFunction`·`JSON_POINTER_PATH_REGEX`·`getPathManager`를 `helpers/dynamicExpression`으로 옮겨 재사용", 교차 → "잎 교차 함수만 재사용하고 병합표는 새로 쓴다". 3 08:179·343, ADR 0004:27 `compileGuard(root, pointer)`(근거 ADR 0004:70). 4 §14 행 다섯 추가. 5 08:503 되돌림 기록에 `extras`·배열 구조. 6 08:505 훅 수준 바인딩 시험·중복 `$id`. 7 08:508 PR-7에 다섯(handleChange 순서, 입력 출처 표식, 마운트 콜백 억제, ErrorBoundary 다시 던지기 인자, React 18 실행).

## 확인하지 못한 것
React 18 실행, ajv 6·7의 `getSchema(위치)`, `<Form>` 경유 같은 `$id` 실패, 44 시나리오 단언별, 유효 스키마 메모 실제 비용, CI 명령, 객체 호스트 `default` 분배 규칙(08 미명시, `spikes/round9/REPORT-proto.txt:228`).
