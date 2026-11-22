# @canard/schema-form 버그 바운티 결과

확인된 문제는 8건입니다. 모든 항목은 실패하는 재현 테스트로 확인했고, 메인 세션에서 다시 실행해 같은 실패를 확인했습니다. 탐색은 값 처리, 배열과 경로, 검증, React 계층의 네 갈래로 나눠 진행했습니다.

재현 테스트 (모두 [`probes/canard-schema-form/`](probes/canard-schema-form/) 아래):

- `values.findings.test.ts`: 1번, 4번, 7번 (unit 프로젝트. 원래 위치는 `src/__bounty__/sf-values/findings.test.ts`였습니다)
- `attachedFilesActivity.test.tsx`: 2번 (render 프로젝트, React 19 전용)
- `useFormSubmitLateHandle.test.tsx`: 3번 (render와 react18 프로젝트)
- `nullableInput.test.tsx`, `nullable1.test.ts`: 5번
- `errors2.test.ts`, `errors3.test.ts`: 6번
- `registerPluginAtomicity.test.tsx`: 8번
- `rootIdUnionBranch.test.tsx`, `rootIdNotRouting.test.tsx`: AJV8 플러그인 버그가 이 패키지 화면에 나타나는 증상입니다. 아래 "다른 패키지가 원인인 증상"을 보십시오.

원인 파일 위치: `packages/canard/schema-form/src/`

## 1. `derived`와 `unsetValue` 규칙이 의존 대상이 형상에서 빠질 때 다시 평가되지 않습니다

- 심각도: 높음.
  - 잘못된 값이 `getValue`와 submit에 그대로 나갑니다.
  - 결과가 이력에 의존합니다. 같은 최종 입력이라도 처음 마운트할 때와 값을 바꿔 가며 도달했을 때 결과가 다릅니다.
  - 놓친 변화는 대상 필드의 다음 쓰기 때 뒤늦게 적용되어, 사용자가 방금 직접 입력한 값을 덮어씁니다.
- 영향받는 공개 API: `controls.derived`, `controls.unsetValue`, `controls.watch`(watch 경로도 `derived`에 들어감). `FieldNode.value`, `outputValue`, `setValue`로 관찰됩니다.
- 어긋난 계약:
  - `docs/agents/skills/schema-form-skill/knowledge/expressions.md:42`는 `derived`가 "의존 대상 중 하나가 바뀔 때마다 다시 계산된다", 그리고 "직접 쓴 값은 다음 의존 변경까지 유지된다"고 적고 있습니다.
  - `src/core/engine/derive/DETAIL.md:29`(CONTROLS-080)는 표현식이 투영된(방출된) 트리를 읽으므로, 빠진 경로는 undefined로 읽힌다고 적고 있습니다.
  - `src/core/engine/derive/evaluateDeriveRound/DETAIL.md:17`(derive-edge)은 의존 값의 변화가 규칙을 실행시킨다고 적고 있습니다.
  - 같은 트리의 `visible` 표현식은 빠짐을 제대로 보므로, 두 종류의 표현식이 같은 읽기에 대해 서로 다른 답을 냅니다.
- 원인: `src/core/engine/settle/utils/derivation/collectDeriveSourcePaths.ts:22`부터 35행.
  - derive 원본 호스트는 `changedSource`, `enteredNodes`, 컨텍스트 소유자, 선언 선택 변경에서만 모입니다.
  - `context.exitedNodes`(선언 위치 `src/core/engine/settle/types/settlement.ts:235`)는 `dependencies.affectedOwners`를 거치지 않습니다.
  - 게이트 이탈은 원본을 바꾸지 않고 방출 값만 바꾸므로, 규칙을 선언한 호스트를 다시 방문하지 않습니다.
  - 커밋된 기준선은 이전 튜플에 머물고, 다음에 그 호스트가 방문될 때(예: 사용자가 대상에 쓸 때) `evaluateDeriveRound`가 바뀐 튜플을 보고 규칙을 실행합니다.
  - 값을 유지한 채 다시 들어오는 경우는 올바르게 동작하고, 빠지는 경우만 문제입니다.
- 재현 스키마: `on`(기본값 true), `a`(`on`일 때 활성, 기본값 'av'), `b`(`derived: '(../a) ?? "none"'`).

| 테스트 | 단계 | 실제 | 기대 |
|---|---|---|---|
| F1a | `on`을 false로 설정 | `{on:false, b:'av'}` | `b:'none'` (`c.isVisible`은 올바르게 false) |
| F1b | `{on:false}`로 마운트한 결과와, 마운트 후 `on`을 false로 바꾼 결과 비교 | 마운트는 `b:'none'`, 순차 변경은 `b:'av'` | 둘이 같음 |
| F1c | 빠진 뒤 `b.setValue('mine')` | `'none'` | `'mine'` |
| F1d | `oneOf`를 A에서 B로 전환, `label`은 `fieldA`에서 파생 | `label:'fa'` | `label:'-'` |
| F1e | `unsetValue: '(../a) === undefined'` | `t:'keep'`이 남음 | `t`가 지워짐 |

- 확신도: 높음. 이 동작을 고정한 기존 테스트는 없습니다.

## 2. React 19 `<Activity mode="hidden">`으로 파일 입력을 숨기면 첨부 파일이 사라지지만, 필드 값은 남습니다

- 심각도: 높음. 데이터가 조용히 사라집니다. 값(예: 파일 이름)은 폼에 남아 있는데 `getAttachedFilesMap()`은 비어 있으므로, 숨긴 상태에서나 다시 보인 뒤에 제출하면 파일이 없습니다. Activity로 마법사나 탭을 만드는 흔한 패턴입니다. React 18에서는 Suspense 재중단이 passive effect를 살려 두므로 React 19에서만 일어납니다.
- 영향받는 공개 API: `FormHandle.getAttachedFilesMap()`, FieldInput의 `onFileAttach` prop, `<Activity>` 안의 `Form.Input`. Form 전체를 숨긴 Activity 안에 둘 때도 같습니다.
- 어긋난 계약:
  - `src/components/FieldProxy/components/FieldInputBridge/DETAIL.md:5`는 언마운트만 브리지 자신의 토큰을 해제한다고 적고, 47행은 언마운트가 첨부 상태를 지운다고 적고 있습니다.
  - `src/providers/WorkspaceContext/DETAIL.md:15`부터 17행은 첨부 파일이 폼 인스턴스에 속하며 사라지면 안 된다고 적고 있습니다.
  - `docs/agents/skills/schema-form-skill/knowledge/validation-failures.md:60`은 숨긴 Form이 상태와 콜백을 유지하고, 다시 보여도 아무것도 재생하지 않는다고 적고 있습니다.
  - Activity로 숨기는 것은 언마운트가 아닙니다.
- 원인:
  - `src/components/FieldProxy/components/FieldInputBridge/FieldInputBridge.tsx:180`부터 183행이 `useOnUnmount` 안에서 `attachedFilesMap.detach(...)`를 호출합니다.
  - `useOnUnmount`(`@winglet/react-utils`)는 `useEffect` 정리 함수입니다.
  - React 19 Activity는 숨길 때 passive 정리를 실행하므로 첨부가 지워집니다. 다시 보여도 다시 붙이는 코드가 없고, 노드 값은 그대로입니다.
  - 브리지의 나머지 부분은 Activity를 고려하도록 만들어져 있지만(같은 DETAIL의 69, 75, 102행), 첨부 파일은 빠졌습니다.
- 재현: `attachedFilesActivity.test.tsx`의 테스트 "hiding a file input step with Activity keeps its attached files in the form"(render 프로젝트, react18에서는 건너뜀). 숨긴 뒤 값은 여전히 `{file:'a.txt'}`인데 첨부 키는 `[]`입니다. 기대값은 `['/file']`입니다.
- 확신도: 높음.

## 3. `useFormSubmit`이 구독한 뒤에 나타나거나 교체된 Form 핸들을 따라가지 않아, `pending`이 낡은 값이 됩니다

- 심각도: 중간. `pending`에 기대는 제출 버튼(비활성화, 스피너)이 제출을 추적하지 못해, 중복 클릭 재제출이 가능해지고 화면이 틀립니다.
- 영향받는 공개 API: `useFormSubmit(ref).pending`.
- 어긋난 계약:
  - `src/hooks/form/useFormSubmit.ts:20`과 21행의 JSDoc: "폼 내부 submit 처리기와 동기화된 pending 상태".
  - `src/hooks/DETAIL.md:47`: 훅은 현재 핸들의 submit을 호출합니다.
  - `docs/agents/skills/schema-form-skill/knowledge/imperative-and-layout.md:26`은 제출 흐름에 이 훅을 권장합니다.
- 원인:
  - `useFormSubmit.ts:54`부터 65행의 `subscribe`는 `[ref]`에만 메모이즈되어 `ref.current?.submit`에 한 번만 구독합니다.
  - 그때 `ref.current`가 null이면(Form이 나중에 조건부로 마운트되는 경우) 영원히 아무것도 구독하지 않습니다.
  - Form이 다시 마운트되면(`key` 변경, 루트 오류 경계의 복구) `FormRoot`가 새 추적 가능한 `submit`을 만듭니다. `getSnapshot`은 새 핸들을 읽지만, 훅은 이전 핸들에 구독한 채라 알림을 받지 못합니다.
- 재현: `useFormSubmitLateHandle.test.tsx`가 render와 react18 프로젝트 모두에서 실패합니다.
  - 테스트 "...tracks a Form that mounts after the hook subscribed": 실제 `"undefined"`, 기대 `"true"`.
  - 테스트 "...tracks the Form after it remounts with a new key": 실제 `"false"`, 기대 `"true"`.
  - 두 경우 모두 `ref.current.submit.pending`은 `true`입니다.
- 확신도: 동작이 일어난다는 점은 높음. 의도인지는 중간입니다. 이 동작을 고정한 테스트는 없고, 문서는 "ref 대입은 렌더를 일으키지 않는다"는 한계를 노드 관찰 훅에 대해서만 밝힙니다(`imperative-and-layout.md:17`).

## 4. 표현식의 경로 치환이 JavaScript 문자열 리터럴 안의 글자까지 바꿉니다

- 심각도: 중간. 올바른 표현식이 경고 없이 틀린 문자열과 비교되거나, 스키마 빌드 전체가 거부됩니다. 공백 뒤에 `@`, `/x`, `../x`, `./x`가 오는 문자열 리터럴이 필요합니다.
- 영향받는 공개 API: `controls`의 모든 표현식 키(`active`, `visible`, `readOnly`, `disabled`, `derived` 등).
- 어긋난 계약: 표현식은 경로 토큰 위의 JavaScript입니다(`docs/agents/skills/schema-form-skill/knowledge/expressions.md:3`). 경로 스캔의 문서화된 한계(`regex.ts`의 문서 주석, 문서 사이트 `api-reference.mdx` 214행 부근의 경로 절)는 문자열 리터럴을 언급하지 않습니다. 스캐너 자신도 따옴표 안의 글자를 건너뛰려 합니다. lookbehind가 `"../path"`를 막습니다.
- 원인: `src/core/engine/blueprint/utils/expressions/regex.ts:22`와 87행, 그리고 이를 쓰는 `src/core/engine/blueprint/compileBlueprintExpressions/createDynamicFunction/utils/substituteDependencyPaths.ts`.
  - 따옴표 검사는 경로 시작 바로 앞 글자만 보고, 스캔이 문자열 안인지 추적하지 않습니다.
  - `"a @ b"`에서는 홀로 선 `@`가 `dependencies[n]`이 됩니다.
  - `"km /h"`에서는 닫는 따옴표를 포함한 `/h"`가 의존 경로가 되어 문자열이 닫히지 않습니다.
- 재현:
  - F2a: `active: '../tag === "a @ b"'`에서 `tag='a @ b'`이면 필드가 비활성으로 남습니다(`extra`가 없음). `@`가 없는 대조 사례는 통과합니다.
  - F2b: `active: '../unit === "km /h"'`이면 트리를 만드는 중에 `CREATE_DYNAMIC_FUNCTION`을 던집니다. 기대 동작은 정상 컴파일입니다.
- 확신도: 높음. 경로 추출 테스트(`regex.*.test.ts`)에는 문자열 리터럴 안 경로 사례가 없습니다.

## 5. `null`로 로드된 nullable 가지(branch) 배열이나 객체가 `node.value`와 FieldInput의 `value` prop에서 `[]` 또는 `{}`로 읽힙니다

- 심각도: 중간. 사용자 정의 FieldInput이 "목록 없음"(`null`)과 "빈 목록"(`[]`)을 구분하지 못하는데, 문서는 두 상태가 구분된다고 합니다. 같은 스키마에 `options.terminal: true`를 주면 `null`이 넘어가므로, 결과가 전략(strategy)에 따라 달라집니다. 출력(`getValue()`, `outputValue`)은 `{ f: null }`로 올바릅니다.
- 영향받는 공개 API: 가지 전략의 `ArrayNode`, `ObjectNode`의 `node.value`, `FieldInputProps.value`.
- 어긋난 계약:
  - `docs/agents/skills/schema-form-skill/knowledge/nullable-branch-nodes.md`의 7행부터 15행 "Three States" 표는 `null`이 "노드가 존재하지 않음"을 뜻하고, "폼은 한 상태를 다른 상태로 스스로 바꾸지 않는다"고 적고 있습니다.
  - `src/core/surface/type.ts`의 197행부터 213행에 있는 공개 타입은 `Optional<NullableValue<…>>`로 `null`을 허용합니다.
  - 같은 상태에 대해 가지 전략과 말단(terminal) 전략이 다른 값을 내므로, 패키지 `CLAUDE.md`의 "일관되고 예측 가능한 동작"이라는 설계 가치와 어긋납니다.
- 원인:
  - `src/core/engine/behaviors/arrayBehavior/utils/value/assembleArray.ts`의 163행부터 197행 부근이 원본이 배열인지 확인하지 않고 `itemCount`(여기서는 0)로 항상 `result: unknown[]`를 만듭니다. 그래서 `null` 원본이 `storedValue`로 `[]`를 만듭니다.
  - 객체 쪽 조립(`src/core/engine/behaviors/objectBehavior/branch/utils/assembleObject.ts`)도 같은 방식으로 `{}`를 만듭니다.
  - 투영은 `null`을 유지하지만(`arrayBehavior/DETAIL.md:15`, `objectBehavior/DETAIL.md:19`가 요구), `FieldProxy.tsx:144`와 `FieldInputBridge.tsx:211`은 `node.value`를 입력에 넘깁니다.
- 재현:
  - `nullableInput.test.tsx`(render 프로젝트)의 테스트 "branch array loaded as null reaches its FieldInput as null"과 "branch object loaded as null reaches its FieldInput as null": 실제 `{ inputValue: [], nodeValue: [] }`와 `{}`이고, 기대값은 둘 다 `null`입니다. 말단 전략 대조 사례 두 개는 통과합니다.
  - `nullable1.test.ts`(unit 프로젝트): 6가지 변형 모두 `root.value`와 `outputValue`는 `{ arr: null }`인데 노드 값은 `[]` 또는 `{}`입니다.
- 확신도: 중간. 이 동작을 고정한 기존 테스트는 없습니다. `source` getter가 "가지의 평범하지 않은 원본"으로 문서화되어 있어 의도일 수도 있는데, 그렇다면 노드가 `null`일 때 가지의 `value`가 빈 컨테이너로 읽힌다는 점이 문서 어디에도 없으므로 문서 불일치입니다.

## 6. `OnRequest`나 `None` 검증 모드에서 배열 삽입이나 삭제 뒤에 검증 issue의 `dataPath`가 낡은 경로로 남습니다

- 심각도: 낮음. `getErrors()`를 `findNode`나 `focus(dataPath)`로 필드에 연결하는 소비자는 엉뚱한 행으로 갑니다. `OnChange` 모드는 다시 검증하므로 올바릅니다.
- 동작: `validate()` 뒤에 `insert(0, …)`를 하면 issue는 올바르게 옮겨진 노드에 남지만, `node.errors[0].dataPath`는 여전히 이전 경로(`/arr/1/n`)이고 `node.path`는 `/arr/2/n`입니다. `FormHandle.getErrors()`가 반환하는 `root.globalErrors`도 여전히 `/arr/1/n`이며, 그 경로는 이제 다른 유효한 항목을 가리킵니다.
- 영향받는 공개 API: `FormHandle.getErrors()`, `node.globalErrors`, `node.errors[].dataPath`.
- 어긋난 계약: `docs/agents/skills/schema-form-skill/knowledge/validation-ux.md:10`은 "편집만으로는 이전 오류가 남을 수 있다"고 하므로 낡은 판정 자체는 문서화되어 있습니다. 그러나 이동 뒤 경로가 다른 노드를 가리키는 것은 언급되지 않으며, `arrays-and-scale.md`는 인덱스가 "오류 dataPath와 정렬된 채로 유지되어야 한다"고 적고 있습니다.
- 원인: issue는 노드 동일성 기준으로 `runtime.validationErrors`에 저장되고 `src/core/engine/validation/utils/read/readFieldNodeErrors.ts`가 읽습니다. `src/core/engine/settle/arrangeFieldNodeItems/utils/rekey/rekeyArrayRuntimePaths.ts`는 경고, 선언, 규칙, misfit은 옮기지만 issue의 `dataPath`와 루트의 `globalErrors` 목록은 다시 쓰지 않습니다.
- 재현:
  - `errors3.test.ts`의 테스트 "OnRequest insert0": 기대 전역 경로 `['/arr/2/n']`, 실제 `['/arr/1/n']`. OnChange 변형은 통과합니다.
  - `errors2.test.ts`(모드 미지정)는 insert0, remove0, insertMid에서 실패합니다.
- 확신도: 동작은 높음. 의도가 아니라는 점은 중간입니다.

## 7. `watchValues`가 관련 없는 커밋 뒤에도, 감시 대상이 바뀌지 않았는데 새 배열을 반환합니다

- 심각도: 낮음. 패키지 `CLAUDE.md`의 "같은 값을 두 번 읽으면 같은 참조를 반환한다"는 설계 가치를 깹니다.
  - `FieldInputBridge.tsx:227`이 `node.watchValues`를 그대로 `FieldInputProps`에 넘깁니다.
  - 그래서 문서가 권장하는 "FieldInput이 `watchValues[0]`을 받아 `useMemo`로 계산하는" 패턴(`expressions.md` 47행 부근)이 관련 없는 편집에도 다시 계산되고, `watchValues`에 의존하는 effect가 다시 실행됩니다.
- 영향받는 공개 API: `FieldNode.watchValues`, `FieldInputProps.watchValues`.
- 원인: `src/core/engine/settle/utils/controls/readFieldNodeWatchValues.ts:48`과 64행. `reusable`이 `memo.commit === commit`을 요구하므로, 커밋 번호가 바뀌면 `next`가 `[]`에서 시작해 항상 새로 얼린 배열을 만듭니다. 그 경우 메모와의 요소별 `Object.is` 비교가 건너뛰어집니다.
- 재현: `values.findings.test.ts`의 F3. `/z`에 쓴 뒤 `w.watchValues`를 읽으면 값은 여전히 `['x']`로 같지만 참조가 다릅니다.
- 확신도: 동작은 높음. 계약 위반인지는 중간입니다. JSDoc은 "이 커밋 동안 안정적"이라고만 약속하고, 기존 테스트(`settle.controls.test.ts:314`, `:399`)도 한 커밋 안의 동일성만 확인합니다.

## 8. 예외를 던진 `registerPlugin` 호출이 플러그인의 일부를 적용된 채로 남깁니다

- 심각도: 낮음. 선언된 타입 밖의 잘못된 플러그인(예: `fieldInputDefinitions`의 `null` 항목)이 필요합니다. 그 뒤 앱은 `UnhandledError`를 받았는데도 반쯤 적용된 설정으로 실행됩니다.
- 영향받는 공개 API: `registerPlugin`.
- 어긋난 계약: `src/app/plugin/DETAIL.md`의 59행부터 61행(plugin-contract)은 등록 실패를 던져 성공한 설정으로 오인되지 않게 한다고 적고 있습니다. `registerPlugin.ts:24`의 `@throws`도 있습니다.
- 원인: `src/app/plugin/utils/registerPlugin.ts`의 209행부터 216행이 렌더 키트, 입력 정의, 검증기, 포매터를 차례로 적용하면서 `PluginManager`를 바로 바꿉니다. 뒤 단계가 예외를 던져도(예: `normalizeFieldInputDefinitions`가 `null`을 구조 분해) 앞 단계를 되돌리지 않습니다.
- 재현: `registerPluginAtomicity.test.tsx`의 테스트 "a registerPlugin call that throws leaves no part of that plugin applied". 예외 뒤에도 플러그인의 `FieldRenderer`가 렌더됩니다. 기대 동작은 기본 렌더러입니다.
- 확신도: 동작은 높음. 유지보수자가 버그로 볼지는 낮음에서 중간입니다.

## 다른 패키지가 원인인 증상

- 루트 스키마에 `$id`가 있고 AJV8 플러그인을 쓰면, 이 패키지 화면에서 비활성 `oneOf` 분기 오류가 필드에 표시되고(`rootIdUnionBranch.test.tsx`), 필드의 `not` 오류가 루트로 옮겨집니다(`rootIdNotRouting.test.tsx`). 원인은 플러그인 쪽이며 [`canard-schema-form-ajv8-plugin.md`](canard-schema-form-ajv8-plugin.md)의 1번과 2번에 있습니다.

## 버그가 아니라고 확인한 가설

값 처리:

- `oneOf`를 A에서 B로, 다시 A로 바꾸면 입력해 둔 `fieldA`가 복원되고, `anyOf` 비활성화 뒤 재활성화도 입력값을 복원합니다.
- 같은 값을 다시 쓰면 `root.value`와 `outputValue`의 동일성이 유지되고, 건드리지 않은 형제 하위 트리와 파생 객체 결과도 동일성을 유지합니다.
- `derived`는 의존 대상이 원본 쓰기로 바뀌는 경우에는 직접 쓴 값을 다음 의존 변경까지 유지합니다.
- 루트 reset과 하위 트리 reset 모두 `defaultValue` prop을 스키마 기본값보다 우선합니다. `setValue(undefined)`는 객체의 자식을 기본값으로 되돌리지 않고 지웁니다.
- 알림 중에 다른 노드에 쓰거나 자기 노드를 정규화하는 리스너도 올바르게 정착합니다.
- `unsetValue`는 false에서 true로 바뀔 때 지우고, true에서 false로 바뀔 때 복원하지 않습니다.
- `['string','number']` 유니언은 종류를 바꾸고, `null`은 misfit으로 보고됩니다.
- `~0`, `~1`로 이스케이프한 경로가 표현식에서 동작합니다. 비활성 노드에 대한 참조를 통한 쓰기는 아무 일도 하지 않습니다.
- `inactiveValue` 리터럴, 기본값 재충전이 있는 `unsetOnInactive`, `inactiveValues` 내용, 한 배치 안에서 나갔다 들어오는 경우는 스키마 기준과 일치합니다.
- 스키마 `const`는 값을 채우지 않는데, 문서도 그렇다고 하지 않으므로 버그가 아닙니다.
- 공백 없이 연산자에 붙은 경로(`../a==="x"`)를 하나의 이름으로 읽는 것은 문서가 이름에 `.` 등을 허용하고 괄호를 쓰라고 안내하므로 의도된 동작입니다.

배열과 경로 (약 150개 사례):

- `insert`, `remove`, `pop`, `update`, `clear`는 경로, `find`, 항목 키, 상호작용 상태, 외부 오류, misfit, `defaultValue`, `resetSubtree` 원본, derived/visible/injectTo 규칙, UpdatePath 이벤트를 일관되게 유지합니다. 객체, 중첩 배열, 재귀 `$ref` 항목, `prefixItems`와 나머지 `items` 경계를 넘는 튜플, extras 영역을 포함합니다.
- `batch` 안의 모든 동사 순서가 batch 없이와 같은 결과, 값, 경로를 냈습니다.
- 범위 밖, 음수, 소수, NaN 인덱스 규칙이 지켜지고, `null`에 대한 insert는 인덱스 0에서만 배열로 승격합니다.
- 제거된 항목의 오류나 touched 상태가 같은 경로의 새 항목에 되살아나지 않고, 그 리스너도 다시 실행되지 않습니다.
- 리스너가 가득 찰 때까지 push하거나, 항목 리스너가 자기 항목을 제거하는 재진입도 정상입니다.
- `find`와 `findNodes`는 특이한 키(`''`, `~`, `/`, `..`, `.`, `*`, `@`, `#`, `0`, `constructor`, `%25`, `~1`)를 왕복하고, `__proto__`는 자기 키로 남으며 프로토타입이 오염되지 않습니다.
- 가상 그룹의 값 튜플, 쓰기, 배열 항목 안의 경로 재지정, 한 필드의 두 그룹 소속, 이스케이프된 그룹 이름이 동작합니다.
- 문서화된 `omitTrailingEmpty`와 `omitEmpty` 주장이 모두 지켜졌습니다.

검증:

- 순서가 뒤바뀐 비동기 결과 방지와 대상 인계(`requestFieldNodeValidation`, `dispatchValidate`)는 코드 읽기로만 추적했고, 순서 빈틈을 찾지 못했습니다.
- `retainEqualValidationIssues`의 깊은 동등 issue 재사용은 경로로 다시 라우팅하므로, 배열 재정렬 뒤에도 오류가 항목을 따라갑니다.
- 로케일 객체 메시지에 현재 로케일이 없을 때 `errorMessages.default`를 쓰지 않는 것은 REACT-031에 문서화되어 있습니다.

React 계층:

- `onChange`에서 `handle.setValue`로 정규화하는 경우, StrictMode의 키 입력 한 번에 `onChange` 한 번, 중간에 바뀐 `onChange` prop, `readOnly` 토글, 새 `context`, `onChange` 안의 `reset()`이 모두 올바르게 동작합니다.
- 언마운트 중에 이미 시작된 submit이 `onSubmit`을 호출하는 것과, 대기 중인 submit이 있을 때 두 번째 `submit()`이 `undefined`로 끝나는 것(`preventConcurrent` 기본값)은 의도입니다.
- `jsonSchema`나 `defaultValue`를 바꿔도 `reset()` 전까지 트리가 유지되는 것은 문서화되어 있습니다.
- 같은 플러그인의 재등록은 문서대로 아무 일도 하지 않습니다.
- `useChildFieldErrors`, `useFieldNode`, `useFieldNodeTracker`, `useErrorVisibility`는 부착될 때 상태를 따라잡습니다.
