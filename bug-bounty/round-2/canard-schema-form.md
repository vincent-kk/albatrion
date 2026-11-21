# @canard/schema-form 버그 바운티 2라운드 결과

2라운드에서 새로 확인된 문제는 12건입니다. 1라운드 문서([`../round-1/canard-schema-form.md`](../round-1/canard-schema-form.md))의 8건은 고쳐진 것으로 보고 제외했습니다. 모든 항목은 실패하는 재현 테스트로 확인했고, 메인 세션에서 다시 실행해 같은 실패를 확인했습니다.

원인 파일 위치: 특별히 적지 않으면 `packages/canard/schema-form/src/`입니다. 공개 문서 `*.md`는 `docs/agents/skills/schema-form-skill/knowledge/` 아래에 있습니다.

## 재현 테스트

재현 테스트는 [`probes/canard-schema-form/`](probes/canard-schema-form/) 아래에 실행 프로젝트별로 나눠 두었습니다. 각 폴더를 `packages/canard/schema-form/src/__bounty__/<폴더 이름>/`에 복사한 뒤 아래 명령으로 실행합니다.

| 폴더 | 명령 | 해당 항목 |
| --- | --- | --- |
| `r2-engine/` | `yarn workspace @canard/schema-form test --run --project unit src/__bounty__/r2-engine/` | 1, 2, 5, 9 |
| `r2-react/` | 같은 명령에 `--project render`와 `--project react18`을 각각 지정 | 4, 6, 10, 11 |
| `r2-release/` | `--project render` | 7 |
| `r2-validation/` | `--project render` | 8, 12 |

- 3번 항목의 재현 테스트는 UI 플러그인 폴더(`probes/canard-schema-form-antd5-plugin/` 등)에 있습니다.
- `r2-engine/`에서 버그 항목이 아닌데 실패하는 테스트가 있습니다. `refGate.test.ts`의 "G diag records"는 1번의 진단 기록용이고, `depth.test.ts`의 D2와 D3은 깊이 측정용입니다. `refControls.test.ts`의 C5와 `refShared.test.ts`의 S8은 의도된 설계로 판단한 가설입니다(아래 "버그가 아니라고 확인한 가설" 참고).
- `r2-react/`의 `activity.test.tsx`, `composition.test.tsx`, `modeTransitions.test.tsx`, `unionInput.test.tsx`는 통과하는 대조 테스트입니다. `ssr.test.tsx`는 "composed layout" 사례만 실패합니다.
- `r2-engine/`의 재현은 `src/__tests__/fixtures/nodeFromJSONSchema.ts`로 노드 트리를 만듭니다. 패키지 `CLAUDE.md:58`은 `<Form>`도 같은 경로로 트리를 만든다고 적고 있지만, Form을 렌더하는 수준의 재현은 하지 않았습니다.

## 1. `$ref` 대상 스키마 자신의 `controls.active`가 경로를 읽으면, 조건이 참이어도 필드가 켜지지 않습니다

- 심각도: 높음. 필드가 아무 진단 없이 폼의 형상, 값, 제출 결과에서 빠집니다. `$defs`에 `active` 조건을 단 재사용 필드는 흔한 패턴입니다.
- 영향받는 공개 API: `$ref` 대상 안의 `controls.active`, `Form`에 넘기는 `jsonSchema`.
- 어긋난 계약:
  - `schema-reference.mdx:76`은 `active`가 존재 여부를 정하는 조건이라고 적고 있습니다. 같은 스키마를 인라인으로 쓰면 올바르게 동작하므로, `$ref`가 의미를 바꿉니다.
  - `core/engine/blueprint/DETAIL.md`의 branchless-features 절은 참조 대상이 실제 호스트에 연결된다고 적고 있습니다.
- 원인(정확한 줄의 확신도는 중간):
  - blueprint 결과는 올바릅니다. 대상은 `#/$defs/S` 위치의 overlay 선언이 되고, 조건 호스트는 `/a/s`입니다.
  - 실행 시점에 `core/engine/settle/utils/gates/getGateRegistry.ts:172`부터 190행의 `register`가 조건이 노드 자신의 `active` 조건인지 판단할 때 `gate.schemaPath`를 `node.blueprintNode.schemaPath + '/controls/active'`, 즉 참조한 위치(`#/properties/a/properties/s`)와 비교합니다.
  - 부모의 연결 등록(같은 파일 192행부터 210행)은 `declaration.schemaPath`(`#/$defs/S`)와 비교합니다. 두 연결 방식이 어긋나, 경로를 읽는 경우 조건이 거짓으로 평가됩니다.
- 1라운드와의 관계: 1라운드 6번 항목(간접 경로가 보고되는 위치를 바꾸는 문제)과 같은 종류입니다.
- 재현(`r2-engine/`):
  - `refGate.test.ts`의 "G relative ../on ref=true", "G absolute /a/on ref=true", "G toggle relative ref", 그리고 "G-order"로 시작하는 두 테스트: 실제 `{ a: { on: true } }`, 기대 `{ a: { on: true, s: 'd' } }`.
  - `refControls.test.ts`의 C4, `refShared.test.ts`의 S6도 같은 증상입니다.
  - 같은 스키마를 인라인으로 쓰면 통과하고, 경로를 읽지 않는 조건(리터럴 `true`)도 통과합니다.
- 확신도: 동작은 높음. 원인 줄은 중간.

## 2. 두 곳에서 참조한 `$defs` 템플릿의 `derived`와 `visible`이 첫 번째 위치에서만 반응합니다

- 심각도: 높음. 틀린 파생 값이 만들어져 제출되고, 표시 여부도 틀립니다. 재귀 트리에서는 두 번째 단계부터 이 문제가 생깁니다.
- 영향받는 공개 API: 두 번 이상 쓰인 `$ref` 대상 안의 `controls.derived`, `controls.visible`. 재귀 `$ref` 배열 항목도 포함됩니다.
- 어긋난 계약:
  - `schema-reference.mdx:81`은 의존 대상이 바뀌면 `derived`가 값을 덮어쓴다고 적고 있습니다.
  - `core/engine/blueprint/DETAIL.md`의 gate-evaluation-location 절은 같은 템플릿의 여러 위치를 settle이 각각 연결하며, 처음 방문한 경로를 재사용하지 않는다고 적고 있습니다.
- 원인: `core/engine/settle/utils/dependencies/trie/DependencyIndex.ts:443`부터 494행의 `affectedOwners`가 절대 읽기 경로로 만든 트라이에서 주인을 찾는데, 그 경로가 선언의 첫 위치(예: `/x/a`)에서 나옵니다. 와일드카드는 배열 인덱스에만 붙으므로 `/y/a`에 쓰면 주인을 찾지 못하고, `collectDeriveSourcePaths.ts:23`이 `/y/b`를 다시 계산하지 않습니다. 로드 시점에는 모든 호스트를 평가하므로 정상입니다.
- 1라운드와의 관계: 새로운 종류입니다(템플릿 규칙이 첫 위치에만 연결됨). json-schema 1라운드 1번(조회 순서에 따라 결과가 달라지는 색인)과 가깝습니다.
- 재현(`r2-engine/`):
  - `refShared.test.ts`의 S2: `/y/a`에 `'w'`를 쓴 뒤 `/y/b`가 `'v!'`로 남습니다. 기대값은 `'w!'`입니다.
  - `refShared.test.ts`의 S10: 두 번째 참조 위치의 `visible`이 원본이 바뀐 뒤에도 `true`로 남습니다. 같은 테스트에서 `active`와 `watch`는 올바릅니다.
  - `refControls.test.ts`의 C2(깊이가 다른 두 참조 위치)와 C6(재귀 `kids` 항목에서 `/kids/0/kids/0`의 파생 값이 `'g#'`로 남고, 기대값은 `'h#'`).
  - 참조 위치가 하나일 때(S1), 인라인 사본(S4), 재귀 없는 배열(S5)은 통과합니다.
- 확신도: 동작은 높음. 원인은 중간에서 높음.

## 3. 길이가 같은 배열 쓰기가 배열 호스트에 새로고침을 보내지 않아, 배열 전체를 편집하는 비제어 입력이 외부 값을 보여 주지 못합니다

- 심각도: 높음. 화면과 저장된 값이 어긋나고, 다음 사용자 편집이 낡은 화면 값으로 만들어져 외부에서 쓴 값을 조용히 버립니다. MUI 체크박스 그룹에서는 `['b', 'c']`가 되어야 할 값이 `['a', 'c']`로 저장되는 데이터 손실까지 재현했습니다.
- 영향받는 공개 API:
  - 자식 필드를 렌더하지 않고 배열 전체를 한 위젯으로 편집하는 모든 입력. 4개 UI 플러그인의 체크박스 그룹, antd5와 antd6의 다중 선택과 날짜, 월, 시간 범위 입력, antd-mobile의 범위 슬라이더가 확인되었습니다. 값 전체를 편집하는 사용자 정의 객체 위젯도 같은 경로를 탈 것으로 보이지만 확인하지 않았습니다.
  - 해당하는 쓰기: `FormHandle.setValue`, 배열 노드의 `setValue`, 항목 노드의 `setValue`, `controls.derived`. 배열 길이가 바뀌는 쓰기와 `reset`은 화면을 올바르게 갱신합니다.
- 어긋난 계약:
  - `field-input.md:61`은 입력이 직접 쓰지 않은 값(`setValue`, reset, `derived`, 배열 연산)이 입력을 다시 마운트해 새 `defaultValue`를 준다고 적고, 66행은 `defaultValue`를 읽는 컴포넌트에 다른 요구가 없다고 적고 있습니다.
  - `components/FieldProxy/components/FieldInputBridge/DETAIL.md`의 REACT-028은 값 전체를 편집하는 가지도 "자식 프록시가 마운트되지 않았으면 다시 마운트한다" 규칙을 따른다고 적고 있습니다.
  - `.changeset/schema-form-*-plugin-controlled-declaration.md` 파일들은 제어 컴포넌트로 선언하지 않은 입력에 이 다시 마운트가 일어난다고 전제합니다.
- 원인:
  - `core/engine/settle/utils/input/markWrite.ts:153`부터 171행은 가지 호스트 자신의 `source`, `extras`, 항목 수가 바뀔 때만 그 호스트를 `context.changedSource`에 넣습니다. 길이가 같은 배열 쓰기는 항목 자식에게만 갑니다.
  - settle의 `commitSettlement.ts:85`부터 95행이 `changedSource`로 `refreshTargets`를 만들고, `markCommitDeliveries.ts:381`이 그 대상에만 `RequestRefresh`를 보냅니다. 그래서 배열 호스트는 `UpdateValue`만 받고 `RequestRefresh`는 받지 않습니다.
  - 브리지는 Refresh를 받을 때만 비제어 입력을 다시 마운트하고, 항목 노드에는 마운트된 입력이 없습니다.
- 고치는 쪽을 위한 메모: `core/engine/settle/__tests__/settle.delivery.test.ts:180`부터 218행은 "자식만 바뀌면 루트 객체 호스트에 Refresh를 보내지 않는다"를 의도적으로 고정하고 있습니다. 따라서 그 단언을 지우는 것이 아니라, 브리지(자식 프록시가 마운트되지 않은 호스트 입력이 외부 `UpdateValue`를 받으면 새로고침)나 호스트 수준의 새로고침 규칙에서 고치는 것이 맞아 보입니다.
- 1라운드와의 관계: 1라운드 UI 플러그인 문서의 "제어되지 않는 위젯의 화면이 폼 값과 어긋나는" 종류와 같은 증상이지만, 원인이 플러그인이 아니라 코어의 새로고침 누락입니다.
- 재현: 2라운드 UI 플러그인 문서들의 `arrayValueInputs.test.tsx`, `derivedAndBranches.test.tsx`, `externalWrites.test.tsx`. antd5와 antd6의 진단 테스트 "a same-length write to a non-terminal array requests a refresh of that array"에서 배열 노드가 `UpdateValue`는 받고 `RequestRefresh`는 받지 않는 것을 확인했습니다. 플러그인 테스트는 `dist` 빌드를 쓰며, 빌드 이후 바뀐 소스는 원인과 무관한 파일뿐임을 확인했습니다.
- 확신도: 동작은 높음. 고칠 위치는 중간입니다.

## 4. 내용은 같고 참조만 새로운 `errors` prop이, 사용자가 입력으로 지운 서버 오류를 되살립니다

- 심각도: 중간. 흔한 패턴에서 생깁니다. 부모가 `onChange`마다 다시 렌더하면서 `errors={...}`를 인라인이나 파생 값으로 넘기면, 지운 메시지가 다음 키 입력에 돌아옵니다. 사용자는 편집으로 메시지를 없앨 수 없고, `getErrors()`도 계속 그 오류를 보고합니다. `node.clearExternalErrors()`로 지운 오류도 같은 방식으로 돌아옵니다.
- 영향받는 공개 API: Form의 `errors` prop, `FormHandle.getErrors()`, `node.errors`, `Form.ErrorMessage`가 보여 주는 메시지.
- 어긋난 계약: `validation-ux.md:139`는 해당 필드에 입력하면 입력의 `onChange`로 서버 오류가 지워진다고 적고 있습니다. 형제 prop(`jsonSchema`, `defaultValue`, `context`)은 내용으로 비교하는데 `errors`만 참조로 비교하며, 이를 적은 문서는 없습니다.
- 원인: `providers/RootNodeContext/components/RootNodeContextProvider.tsx:289`부터 294행의 레이아웃 effect가 `lastErrors.current !== props.errors`, 즉 참조가 다를 때마다 prop을 다시 적용합니다. 이어서 `providers/RootNodeContext/utils/applyFormErrors.ts`가 각 노드의 외부 오류를 전체 목록으로 교체하므로, 사용자가 이미 편집한 필드에도 서버 오류가 돌아옵니다.
- 1라운드와의 관계: 새로운 종류입니다(prop의 참조 변화를 내용 변화로 취급).
- 재현(`r2-react/errorsPropIdentity.test.tsx`): "typing clears the server error and an unrelated parent re-render keeps it cleared (new array identity=true)". React 19와 React 18 모두 실패합니다. 입력 후 `node.errors`가 `[{ keyword: 'server', ... }]`이고, 기대값은 `[]`입니다. 참조가 같은 대조 사례는 통과합니다.
- 확신도: 높음.

## 5. 재귀 `$ref` 트리가 약 200단계에서 300단계 사이 깊이에서 스택 오버플로를 냅니다

- 심각도: 중간. `RECURSIVE_SHAPE_DIVERGED`로 보고하거나 로드하지 않고, 처리되지 않은 `RangeError: Maximum call stack size exceeded`를 던집니다.
- 영향받는 공개 API: 재귀 스키마에 값을 로드하는 경우(Form `defaultValue`), 깊은 값의 `setValue`.
- 어긋난 계약: settle `DETAIL.md:103`(SETTLE-005)은 호출자의 값이 이끄는 유한한 재귀를 허용한다고 적고 있고, 오류 참조 문서는 `RECURSIVE_SHAPE_DIVERGED`를 정해진 실패로 문서화합니다.
- 원인: `core/engine/settle/utils/compute/` 아래 `computeNode.ts`(227행, 334행), `selectChildren.ts:261`, `selectEntryStep.ts:410`이 서로 재귀합니다. 노드 한 단계마다 큰 프레임이 약 5개 쌓이고, 트리 한 단계는 노드 두 단계입니다. 같은 실행기에서 단순 재귀는 9,972단계까지 가므로 스택 크기는 보통입니다.
- 1라운드와의 관계: 새로운 종류입니다(깊이).
- 재현(`r2-engine/depth.test.ts`): D1(300단계, 1000단계)이 `RangeError`를 던집니다. D4에서는 얕게 마운트한 뒤 250단계 값을 `setValue`해도 넘칩니다. 넘치는 깊이는 실행마다 다르며, 탐색 에이전트 실행에서는 196단계에서 200단계 사이, 메인 세션 실행에서는 296단계에서 300단계 사이였습니다.
- 확신도: 높음.

## 6. 서버 렌더링에 `errors` prop이 나타나지 않습니다

- 심각도: 낮음에서 중간. Form의 초기 오류로 넘긴 서버 issue가 서버가 보내는 HTML에 없고, `ErrorVisibility.Always`에서도 마찬가지입니다. hydration 뒤에야 나타나므로 JavaScript 없이 보는 페이지에는 끝내 나오지 않습니다. 함수형 children은 서버에서 `errors.length === 0`을, hydration 뒤에는 `1`을 받습니다.
- 영향받는 공개 API: `renderToString`과 `hydrateRoot`를 쓰는 Form의 `errors` prop, 함수형 children이 받는 `errors`, `Form.ErrorMessage`.
- 어긋난 계약:
  - `FormProps.errors`는 "Initial validation errors"로 문서화되어 있습니다(`components/Form/components/FormCore/types/props.ts:79`, 80행).
  - 패키지 `CLAUDE.md:81`과 `arrays-and-scale.md:144`는 SSR이 모든 필드를 렌더하고 hydration이 결과를 바꾸지 않는다고 약속합니다.
  - `validation-ux.md:127`은 서버 오류를 이 prop으로 전달하라고 안내합니다.
- 원인: `RootNodeContextProvider.tsx:279`의 `applyFormErrors(root, load.props.errors, undefined, 'load')`가 서버에서 실행되지 않는 `useLayoutEffect` 안에서만 실행됩니다. `context`를 포함한 나머지는 렌더 중 트리를 만들 때(`createRootLoad`) 적용됩니다.
- 1라운드와의 관계: 새로운 종류입니다(effect에서만 적용되는 상태가 서버 출력에서 빠짐).
- 재현(`r2-react/ssrErrorsProp.test.tsx`, React 19와 React 18 모두 실패):
  - "server rendering shows the errors prop message under ErrorVisibility.Always": HTML에 메시지 대신 빈 `<em></em>`이 있습니다.
  - "server rendering passes the errors prop to function children": 실제 `<output>0</output>`, 기대 `1`.
  - "first client render (before effects) already sees the errors prop": 서버 텍스트는 빈 문자열이고, 정착한 클라이언트 텍스트는 메시지입니다.
  - `ssr.test.tsx`의 "composed layout" 사례도 같은 이유로 실패합니다(서버 `<i>0</i>`, hydration 뒤 `<i>1</i>`).
- 확신도: 동작은 높음. 소유자가 버그로 볼지, 문서화할 한계로 볼지는 중간입니다.

## 7. 한 빌드로 호출한 `registerPlugin`이 다른 빌드로 불러온 `Form`에 닿지 않습니다

- 심각도: 낮음에서 중간. Node에서 `import`는 `dist/index.node.mjs`로, `require`는 `dist/index.cjs`로 해석됩니다. 두 방식이 섞인 서버 렌더링(예: 앱은 ESM으로 플러그인을 등록하고, CommonJS 의존성이 `Form`을 렌더)에서는 조용히 기본 렌더러로 돌아갑니다.
- 영향받는 공개 API: `registerPlugin`, `Form`.
- 어긋난 계약: UI 플러그인 README는 플러그인이 전역으로 등록된다고 적고 있습니다(`packages/canard/schema-form-antd5-plugin/README.md:57`, `packages/canard/schema-form-mui-plugin/README.md:39`). promise-modal은 같은 위험을 공유 레지스트리로 일부러 해결했지만, schema-form은 그렇지 않습니다.
- 원인: 레지스트리가 클래스 자체의 정적 상태(`app/plugin/utils/PluginManager.ts:46`, 47행의 `private static __renderKit__`)이고, `package.json` `exports`의 `node` 조건이 형식마다 사본을 하나씩 불러옵니다.
- 1라운드와의 관계: 새로운 종류입니다(배포 산출물 검사에서 발견). promise-modal 2라운드 7번 항목과 같은 이중 패키지 문제입니다.
- 재현(`r2-release/dualPackageRegistry.test.tsx`): "a plugin registered through the Node ESM entry reaches a Form loaded through the CommonJS entry". 플러그인 렌더러가 0개이고, 기대는 플러그인의 `FieldRenderer`가 쓰이는 것입니다.
- 확신도: 원리는 높음. 실제 앱에서 얼마나 자주 생길지는 중간입니다.

## 8. 코어가 `compileGuard`에 RFC 6901 포인터가 아닌 폼 경로 문법을 넘겨, 이름이 `*`, `.`, `..`, `@`인 속성 아래의 `if`가 모든 검증기에서 실패합니다

- 심각도: 낮음. 이런 이름은 드물지만, 생기면 조건부 필드가 조용히 꺼지고 GUARD 실패가 보고됩니다.
- 영향받는 공개 API: 검증기 계약의 `Validator.compileGuard`, 조건부 필드.
- 어긋난 계약: `core/engine/validation/types/validator.ts`의 `compileGuard`는 `pointer`를 "Authored schema location preserved in the copy"로 정의하고, 플러그인은 이 값을 RFC 6901 포인터로 읽습니다(AJV8 `createGuardCompiler.ts:23`, AJV8 README의 `GuardPointerNotSchemaError` 설명). RFC 6901에서 `/properties/%40`은 키 `"%40"`을 가리킵니다.
- 원인: `core/engine/validation/utils/guard/readFieldNodeGuard.ts:25`와 `guard/compileEntryGuards.ts:31`이 `stripFragment(gate.schemaPath)`를 그대로 넘깁니다. `gate.schemaPath`는 폼 경로 문법이고, `formatSegment`가 이 네 이름을 `%2A`, `%2E`, `%2E%2E`, `%40`으로 바꿉니다. 그래서 플러그인의 `resolveGuardSchema`가 그 키를 찾지 못하고 `GuardPointerNotSchemaError`를 던집니다.
- 1라운드와의 관계: 1라운드 AJV8 문서 1번(경로를 다시 쓰는 래퍼)과 같은 종류입니다. AJV 플러그인 2라운드 1번 항목(`%`가 든 이름)과는 원인이 다릅니다.
- 재현(`r2-validation/guardPointer.test.tsx`, AJV8 사용): `"@"` 행에서 "guard pointer does not locate a schema: /properties/%40/allOf/0/if"가 나고 email 필드가 비활성입니다. `"*"` 행도 `/properties/%2A/...`로 실패합니다. `ab`, `a b` 대조 행은 통과합니다. AJV6과 AJV7도 같은 메시지로 실패하는 것을 탐색 에이전트가 배포본을 직접 호출해 확인했습니다(vitest 재현 없음).
- 확신도: 동작은 높음. 코어와 플러그인 중 어느 쪽을 고칠지는 유지보수자가 판단할 문제입니다.

## 9. 가지(branch)가 `$ref`이면 가지 관련 경고가 나오지 않습니다

- 심각도: 낮음. 권고용 진단이며 폼 형상은 올바릅니다.
- 영향받는 경고: `FormWarningCode.AllOfKeywordIgnoredForForm`, `IfWithoutElseFalse`, `NullBranchIgnoredForForm`.
- 어긋난 계약: `error-reference.mdx:106`부터 109행의 경고 코드 표는 가지의 조건을 기준으로 설명하며, 가지를 어디에 썼는지는 조건이 아닙니다.
- 원인: `collectBlueprintWarnings.ts:116`과 130행이 `endsWithBranchIndex(declaration.schemaPath, ...)`로 가지를 판별하는데, `$ref` 대상의 선언 경로는 `#/$defs/X`라서 `/allOf/n`이나 `/oneOf/n`으로 끝나지 않습니다.
- 1라운드와의 관계: 1번 항목과 마찬가지로, 간접 경로가 판단 기준 위치를 바꾸는 종류입니다.
- 재현(`r2-engine/warnings.test.ts`): W1, W2, W3 모두 경고가 없습니다. 기대는 인라인 가지와 같은 코드입니다. 내부 `blueprint(schema, { collect })`로 확인했고, Form의 `onError`에서도 같은지는 확인하지 않았습니다.
- 확신도: 높음.

## 10. 와일드카드나 `..`가 든 경로를 받은 `Form.Label`이 질의 문자열을 그대로 `htmlFor`에 써서, 레이블이 입력과 연결되지 않습니다

- 심각도: 낮음. 접근성 결함입니다. 레이블을 눌러도 입력에 포커스가 가지 않고, 화면 낭독기가 레이블을 잃습니다.
- 영향받는 공개 API: `Form.Label`(그 `id="label:…"`도 같은 문제).
- 어긋난 계약: `imperative-and-layout.md:81`은 레이블과 입력을 연결하려면 절대 경로를 넘기라고 적고 있고, `/list/*`와 `/obj/../name`은 절대 경로입니다. 같은 문서는 레이아웃 경로에 같은 확장 질의를 허용하며 "와일드카드는 처음 일치하는 노드를 렌더한다"고 적고 있습니다.
- 원인: `components/Form/components/FormLabel/FormLabel.tsx:59`부터 64행이 prop에서 받은 `path`로 `htmlFor: path`와 `id: 'label:' + path`를 정합니다. 이것이 부품의 기본값인 `node.path`를 덮어쓰는데, `Form.Input`은 입력 id로 `node.path`를 씁니다.
- 1라운드와의 관계: 새로운 종류입니다.
- 재현(`r2-react/labelAssociation.test.tsx`): `/list/*`에서 실제 `htmlFor`는 `/list/*`, 기대 `/list/0`. `/obj/../name`에서 실제 `/obj/../name`, 기대 `/name`. `/name`과 `/list/0` 대조는 통과합니다.
- 확신도: 동작은 높음. 같은 파일의 JSDoc(13행부터 16행)이 "주어진 `path`로 만든다"고 적고 있어 문서 불일치로 볼 수도 있으므로, 계약 위반 여부는 중간입니다.

## 11. React 18에서 Form을 서버 렌더링할 때마다 "useLayoutEffect does nothing on the server" 경고가 약 11개 나옵니다

- 심각도: 낮음. 개발 모드에서 SSR 요청마다 생기는 콘솔 소음이며, 렌더 결과에는 영향이 없습니다.
- 영향받는 공개 API: React 18.3.1 `react-dom/server`(`renderToString`)로 렌더한 `<Form>`.
- 어긋난 계약: `CLAUDE.md:81`은 React 18과 19의 SSR 지원을 약속합니다. 저장소의 hydration 테스트는 `renderToString` 직후 콘솔 기록을 지우므로 이 소음이 검사되지 않습니다.
- 원인: `FormRoot.tsx`, `RootNodeContextProvider.tsx`, `FieldInputsContextProvider.tsx`, 필드 브리지의 레이아웃 effect가 조건 없이 실행되고, 서버용 대체(isomorphic layout effect)가 없습니다.
- 1라운드와의 관계: 새로운 종류입니다.
- 재현(`r2-react/ssrErrorsProp.test.tsx`): "server rendering a Form logs no React warnings (useLayoutEffect on the server)". `react18` 프로젝트에서만 11개 경고로 실패하고, React 19에서는 통과합니다.
- 확신도: 높음.

## 12. `$schema` 끝의 빈 조각 `#` 유무만으로 `DIALECT_MISMATCH` 경고가 잘못 나옵니다

- 심각도: 낮음. 개발 모드 경고 한 건입니다. 두 표기는 같은 draft-07 메타 스키마를 가리키며, AJV도 정상 검증합니다.
- 영향받는 공개 API: `onError`의 `SCHEMA_FORM_WARNING.DIALECT_MISMATCH`, 개발 모드 콘솔.
- 어긋난 계약: `core/engine/validation/DETAIL.md`의 75행부터 77행(VALIDATE-026)과 157행부터 159행(ERROR-188). 이 경고는 실제로 선언된 방언이 다를 때를 위한 것입니다.
- 원인: `core/surface/utils/fieldNodeFactory.ts:192`가 `validator.dialect !== authoredSchema.$schema`로 문자열을 그대로 비교합니다. 플러그인은 `'http://json-schema.org/draft-07/schema#'`를 선언하는데, 흔히 쓰는 `'…/draft-07/schema'` 표기는 불일치로 판정됩니다.
- 1라운드와의 관계: 새로운 종류입니다. json-schema 1라운드 4번(정규화된 철자로만 찾음)과 비슷한 모양입니다.
- 재현(`r2-validation/dialectSpelling.test.tsx`): `#`가 없는 행에서 `["SCHEMA_FORM_WARNING.DIALECT_MISMATCH"]`가 나오고, 기대값은 `[]`입니다. 검증 결과(`minLength`)는 정상입니다. `#`가 있는 대조 행은 통과합니다. 이 동작을 고정한 기존 테스트는 없습니다.
- 확신도: 높음.

## 버그가 아니라고 확인한 가설

컴파일과 엔진:

- 형상에서 빠진 노드의 소비자(`active` 연쇄, 중첩 객체의 퇴장, `watchValues`, `readOnly`, `disabled`, `visible`과 그 `UpdateControlledProperties` 이벤트)는 올바르게 알림을 받습니다. 부모의 `UpdateChildren`과 `UpdateValue`, 그리고 편집된 노드가 하나뿐일 때를 포함한 `UpdateGlobalState`도 올바릅니다. `resetInteraction`이 퇴장을 놓치는 것(B4)은 1라운드 1번과 같은 메커니즘이라 이미 알려진 문제입니다.
- 관련 없는 커밋 뒤에도 `value`, `outputValue`, `children`, `errors`, `globalErrors`, `inactiveValues`, `misfits`, `jsonSchema`, `defaultValue`, `source`, `extras`와 상태 getter의 참조가 유지되며, 가상 노드도 마찬가지입니다.
- `resetSubtree`는 원본에서 `derived`를 다시 실행하고, 대상에서는 `derived`를 유지합니다. 루트나 객체에서는 보관된 비활성 값을 버립니다. `unsetValue`는 로드 시점에 적용되고, batch 안에서 즉시 정착하며, 옮긴 배열 항목에서는 자기 로드 원본을 씁니다.
- 판별자(discriminator)는 nullable 객체 호스트, `$ref` 가지, `enum` 태그, 가지에만 있는 태그의 승격, 겹치는 `oneOf` 태그 거부, 반복되는 `anyOf` 태그, 가지 안 `allOf`의 태그, "빈 태그" 경고에서 모두 올바릅니다.
- 최상위와 `allOf` 안의 `if`/`then`/`else`가 양방향으로 전환되고, `else` 가지로 로드하는 경우도 올바릅니다.
- `allOf`의 `enum` 교집합, `required` 합집합, 최솟값과 최댓값 좁히기가 올바르고, 모순은 예외를 던집니다. `['integer', 'null']`은 nullable 숫자 노드가 됩니다. `items`와 `prefixItems`로의 `$ref`, `~0`, `~1`, `%20` 이스케이프, `definitions`가 해석됩니다. `options`는 `$ref`를 거쳐 깊게 병합됩니다.
- 의도된 설계로 판단한 것:
  - `$ref`의 형제 주석(`default`, `title`, `presentation.inputType`)이 대상에게 지는 것(A3, A11)은 "뒤에 오는 쪽이 이기고 대상이 뒤로 친다"는 문서화된 순서와 일치합니다.
  - 노드 자신의 `allOf` 안의 조각 `controls.default`가 그 노드의 기본값이 되지 않는 것(C5, S8)은 조각 제어가 자식 범위라는 SCHEMA-012 때문입니다.
  - 속성을 통해 재귀하는 객체가 `RECURSIVE_SHAPE_UNBOUNDED`를 던지는 것(A1)은 BLUEPRINT-030입니다.
  - `type`이 없는 `true` 스키마가 인라인이든 `$ref`든 `UNKNOWN_JSON_SCHEMA`를 던지는 것(A2)은 같은 규칙입니다.
- 타입 수준(`InferValueType`)은 코드를 읽었을 뿐 타입 검사 재현은 하지 않았습니다.

React 계층:

- 1라운드 2번(Activity)과 3번(`ref.current`)의 형제를 찾는 재현은 모두 통과했습니다.
  - React 19 `<Activity>` 숨김과 표시(StrictMode 포함)에서 편집과 blur 뒤 보이는 오류가 유지되고 `getState()`도 그대로입니다. 지연된 가상화 자리 표시자는 숨김 중 `disconnect()`가 호출되어도 교차 시 다시 나타나고, `focus()`도 지연 필드와 즉시 필드에 닿습니다. 숨겨진 하위 트리 안의 `useChildFieldErrors`와 `useChildFieldMap`은 숨김 중의 쓰기와 추가된 자식을 따라잡습니다.
  - `useFormSubmit`(1라운드에서 알려짐) 외에 `RefObject<FormHandle>`을 받는 공개 hook은 없습니다. 내부 ref prop(`overridePropsRef`, `onChangeRef`)은 호출이나 렌더 시점에 읽힙니다.
- 기본 union 입력(`type: ['string', 'number']`)은 사용자가 입력한 뒤의 `setValue`를 따라갑니다.
- 풍부한 자동 렌더 폼과 조합 레이아웃(`Form.Label`, `Form.Input`, `Form.ErrorMessage`, `Form.Render`, `Form.Field`, 함수형 children, `FormProvider`)이 React 18과 19, StrictMode, `readOnly`와 `disabled`에서 불일치 없이 hydration됩니다. hydration 뒤 입력, `onChange`, 배열 항목 추가가 동작하고, 콜백 순서도 클라이언트 마운트와 같습니다.
- 검증 모드 전환이 문서화된 규칙과 일치합니다.
- 다섯 단계 FieldInput 우선순위가 지켜집니다. `Form.Input`, `Form.Label`, `Form.Render`는 바뀐 `path` prop을 따라갑니다.
- 의도된 동작: 브리지에서 덮어쓴 `readOnly`가 쓰기를 막지 않는 것(`FieldInputBridge/DETAIL.md:37`, CONTROLS-083), 루트 구독이 해제되지 않는 것(`RootNodeContext/DETAIL.md:33`), 포커스 대상 선택(`field-input.md:79`).

검증:

- 느린 명시적 검증이 `reset()`에 추월되면 그 결과는 새 로드에 반영되지 않습니다. 언마운트 뒤 도착한 결과는 `onError` 없이 Promise로만 정착합니다. 검증 함수가 동기 예외를 던지면 `validate()`가 거부되고 이후 정상 판정으로 회복합니다.
- 잘못된 issue 경로: `#/name`은 정규화되어 필드에 배정되고, 중복 issue는 둘 다 유지되며, 존재하지 않는 경로와 상대 경로는 `getErrors()` 전체 목록에만 남고, 말단 노드 아래 경로는 그 말단 노드에 배정됩니다.
- React 19 Activity로 숨긴 Form 12개 때문에 등록이 최근 해제 목록에서 밀려나도, 다시 보이면 재컴파일되어 조건부 필드와 검증이 정상입니다.
- 공백, 한글, `%`, `~`가 든 속성 아래 배열 항목의 비활성 `oneOf` 가지 오류는 올바르게 숨겨집니다.
- 포매터가 반환한 `undefined`를 null로 취급하지 않는 것(`selectFieldErrorMessage`)은 JSDoc대로입니다. `ErrorVisibility` 검증은 정확한 열거값 switch라 프로토타입 키 우회가 없습니다.

배포:

- `yarn workspace @canard/schema-form test:production`은 파일 11개, 테스트 28개가 통과합니다. 배포본의 개발 전용 분기는 객체 동결이나 경고만 합니다. 예외로, `DetachedNodeWrite`와 `WriteInInactiveResolver` 기록은 프로덕션에서 `onError`로 전달되지 않는데 `FormWarningCode` JSDoc(`errors/constants/FormWarningCode.ts:44`부터 49행)은 "개발 전용"이라고 적지 않습니다. 다만 `core/surface/__tests__/detached.production.test.ts`가 이 동작을 의도적으로 고정하고 있어, 기껏해야 낮은 수준의 계약 충돌입니다(재현 없음).
- 모든 하위 경로에서 ESM과 CommonJS가 같은 이름을 내보냅니다.
