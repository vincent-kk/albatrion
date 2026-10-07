# React 노드 프록시 감사

대상은 커밋 `e59e435aa`의 고정 사본(schema-form src와 winglet src로 번들)과 0.16.0입니다. 0.16.0은 BF 별칭의 dist이며, 소스 커밋은 `6c5cb708f`입니다. 감사는 읽기 전용 Opus debugger가 했고, 저장소는 바꾸지 않았습니다. 계측 조건은 react-dom 19.2.6 profiling 빌드, jsdom, 작은 고정 장치(필드 6개, 배열 항목 3~5개)입니다. 계측 코드는 함수·클래스 컴포넌트의 렌더, beginWork 방문, 마운트, layout effect, 커밋을 노드 경로별로 셉니다. 도구와 원자료는 세션 scratchpad의 `proxy-audit/`(`ra.mjs`, `entry.tsx`, `ra-{new,old}-{ctl,unctl}-{flat,array}.json`)에 있습니다. 기준은 소유자 118·119라운드의 원칙입니다.

## 결론

**새 판은 필드마다 경계와 경로 전달을 별도 컴포넌트 층으로 쌓아, 필드당 fiber가 옛 판보다 5개 많습니다.** 필드당 fiber는 옛 판 13개, 새 판 18개이고, 배열 항목 하나를 마운트할 때는 옛 판 21개, 새 판 26개입니다. 쓰기 하나에 자기 필드가 렌더하는 횟수는 옛 판 9회, 새 판 10회입니다.

반면 갱신 격리는 옛 판보다 낫습니다.
- 형제 쓰기와 부모 쓰기가 다른 필드를 렌더하는 횟수는 0입니다. 옛 판은 부모 쓰기에서 형제를 리마운트합니다.
- 자동 Refresh는 EVENT-042·071이 정한 쓰기에만 나갑니다.
- 배열 연산에서 기존 항목의 렌더와 리마운트는 0입니다.

전역 문맥 변화(showError, context, readOnly)에 폼 전체가 한 번 렌더되는 것은 정상 동작입니다(소유자 122라운드). 폼 전체가 바뀌는 일이기 때문입니다. 이 경우의 단언은 "렌더는 필드당 한 번이며 리마운트는 없음"이고, 두 판 모두 리마운트는 0입니다.

## 한 필드의 경로

- **옛 판(필드당 13 fiber):** ChildComponent(memo) → SchemaNodeProxy[트래커 둘, 문맥 셋] → Fragment(key=version) → div → memo(EB.fn) → ErrorBoundary → 렌더러 → InputWrapperFn → SchemaNodeInput(memo)[트래커 둘, layout 구독 하나] → div → memo(EB.fn) → ErrorBoundary → 입력.
- **새 판(필드당 18 fiber):** ChildComponent(memo, 자식마다 layout effect) → SchemaNodeProxy[RootNodeContext] → **Provider** → **EB.fn(BoundedField)** → **ErrorBoundary** → **SchemaNodeField**[트래커 둘] → Fragment → div → memo(EB.fn) → ErrorBoundary → 렌더러 → InputWrapperFn → SchemaNodeInput(memo)[트래커 셋, layout 구독 하나, 의존성 없는 layout effect 하나, 문맥 아홉] → div → **EB.fn(memo 아님)** → ErrorBoundary → **Input(key=generation)** → 입력.

## 옛 구조에서 벗어난 자리

자리마다 그것이 구현하는 원장 문장과 고정 시험을 적습니다. 경로는 패키지 뿌리 기준입니다.

| 번호 | 자리 | 하는 일 | 원장 문장 | 고정 시험 |
| --- | --- | --- | --- | --- |
| 1 | `src/components/SchemaNode/SchemaNodeProxy/SchemaNodeProxy.tsx:13-17, 24-26` | 필드마다 Provider, 감싸개 함수, ErrorBoundary를 붙임(+3 fiber) | ERROR-044 RENDER_FAILED 행(렌더러 안의 formatError를 필드 바운더리 대상에 넣음), ERROR-114(필드 바운더리는 감싸기를 두고 렌더 때 문맥에서 보고기를 읽음). ERROR-090은 필드 전체를 감싸라고 하지 않고 렌더러를 감싸라고 함 | `SchemaNodeProxy/__tests__/effectiveSchema.test.tsx:49`, `SchemaNodeInput/__tests__/refreshGeneration.test.tsx:74` |
| 2 | `SchemaNodeProxy/components/SchemaNodeField.tsx:29` | SchemaNodeProxy에서 떼어 낸 별도 컴포넌트(+1 fiber) | 없음 | 없음 |
| 3 | `src/helpers/formTypeInputDefinition/utils/withFormTypeInputErrorBoundary.tsx:19-22`, `SchemaNodeInput/hooks/useFormTypeInput.ts:53` | 입력 경계가 세 층이고 memo가 아님(+1 fiber, 쓰기마다 +1 렌더). 정의와 맵에서 고른 입력을 memo 없이 돌려줌(옛 판은 memo로 감쌈) | 112C-01, EVENT-039, ERROR-090 | `refreshBoundary.test.tsx`의 EVENT-070·EVENT-040 시험 셋, `refreshGeneration.test.tsx:17, 50, 77` |
| 4 | `SchemaNodeInput/hooks/useFormTypeInputControl.ts:40-54, 66-77` | 입력 하나가 노드를 두 번 구독함(Refresh를 읽는 uSES 구독, 포커스·선택을 받는 layout 구독). 옛 판은 하나 | REACT-024 | `inputBinding.test.tsx:15, 99`, `DeferrableNodeProxy/__tests__/commands.test.tsx` |
| 5 | `SchemaNodeInput/hooks/useChildNodeComponents.tsx:88-93` | 자식마다 layout effect로 마운트된 자식을 셈 | REACT-019, REACT-028 | `inputBinding.test.tsx:167`, `refreshGeneration.test.tsx:77` |
| 6 | `SchemaNodeInput/hooks/useTerminalChildren.ts:27-35` | 의존성 배열 없는 layout effect라 렌더마다 돎(쓰기 하나에 2회, 옛 판 0회) | ERROR-202 | `inputBinding.test.tsx:145, 196` |
| 7 | `src/components/Form/components/FormContents.tsx:121-128` | onSubmit을 인라인 화살표로 넘겨 FormRootProxy의 memo(`FormRootProxy.tsx:11`)를 깸. Form이 다시 렌더될 때마다 루트 필드의 사슬이 함께 렌더됨 | 없음 | 없음 |
| 8 | `src/components/Form/Form.tsx:26-31` | 폼마다 익명 forwardRef 층과 FormErrorContextProvider(폼 하나에 +2 렌더) | ERROR-112 | 필드 단위가 아니라 우선순위 낮음 |
| 9 | `SchemaNodeField.tsx:64-68, 82`, `SchemaNodeInput.tsx:46-50`, `useTerminalChildren.ts:10` | FormTypeRendererContext, WorkspaceContext, InputControlContext를 읽어 전역 변화가 필드마다 렌더됨(옛 판과 같음). 새로 더한 RootBindingContext·RootNodeContext·FormErrorContext·FormErrorPathContext는 값이 안정적이라 렌더를 일으키지 않음 | REACT-024, REACT-010 | — |

노드 리스너는 필드마다 6개이고, 옛 판은 5개입니다. 이 수는 코드를 읽어 얻었고, 실행 중에 세지는 않았습니다.

## 렌더 계수

제어 입력(value·onChange)과 비제어 입력(defaultValue)의 수치는 모든 행에서 두 판 모두 같았습니다. 칸은 "새 HEAD ; 0.16.0"입니다.

| 쓰기 | 커밋 | 자기 필드 / 조상 / 그 밖의 렌더 | 입력 리마운트 |
| --- | --- | --- | --- |
| 입력 onChange(/a, 두 번째부터) | 1 ; 1 | 10 / 10 / 0 ; 9 / 9 / 0 | 0 ; 0 |
| 호출자 setValue /b(값이 바뀜) | 1 ; 2 | 10 / 10 / 0 ; 13 / 9 / 0 | /b ; /b |
| 같은 값으로 setValue /b | 0 ; 2 | 0 ; 6 / 9 | 0 ; 1 |
| 부모 /o.setValue(x만 바뀜) | 1 ; 3 | /o 10, x 10, y 0 ; x 22, y 11 | x ; x 두 번과 y |
| handle.setValue(전체, a만 바뀜) | 1 ; 2 | a 10, 다른 필드 0 ; 모든 필드 11-18 | a ; 넷 모두 |
| showError(true) | 1 ; 1 | 71(필드당 10) ; 61(필드당 9) | 0 |
| context 속성 변경 | 1 ; 1 | 76 ; 64 | 0 |
| readOnly 속성 | 1 ; 1 | 47(필드당 5) ; 34(필드당 4) | 0 |
| Form 재렌더(새 인라인 onChange) | 1 ; 1 | 17(루트 필드 사슬 포함) ; 10 | 0 |
| reset() | 1 ; 2 | fiber 생성 8 ; 114(트리 전체 재마운트) | 리프 넷 ; 넷 |

단언 다섯의 결과입니다.

1. **쓰기 하나는 그 필드의 사슬만 렌더합니다.** 값이 함께 바뀐 조상의 사슬은 함께 렌더됩니다. 두 판 모두 그렇고, 제어·비제어 입력의 수치가 같습니다. 새 판의 자기 필드 렌더 10회는 SchemaNodeField, memo(EB.fn), ErrorBoundary 둘, FormGroupRenderer, InputWrapperFn, SchemaNodeInput, EB.fn, Input, 입력입니다.
2. **형제 쓰기와 부모 쓰기에서 다른 필드의 렌더는 새 판에서 0입니다.** 전역 문맥 변화의 단언은 "렌더는 필드당 한 번이며 리마운트는 없음"입니다(소유자 122라운드). 리마운트는 두 판 모두 0입니다. 필드당 렌더 10·10·5회가 필드 사슬의 컴포넌트마다 한 번씩인지는 F-A·F-B 판정과 함께 컴포넌트 수로 나누어 확인합니다.
3. **자동 Refresh는 EVENT-042·071, REACT-019와 맞습니다.** 입력 쓰기 0, 바뀐 리프 1, 같은 값 0입니다. 부모 쓰기와 전체 setValue는 바뀐 노드만 리프레시하고, reset은 리프 전부(컨테이너 0)입니다. 배열의 push·remove·항목 하나 더한 replace는 0이고, 모든 값을 바꾼 replace는 4입니다.
4. **배열 연산의 새 fiber는 추가된 항목에만 생깁니다.** push 한 번에 새 판 26개, 옛 판 21개이고, 기존 항목의 렌더와 리마운트는 두 판 모두 0입니다. remove(0)은 새 판에서 리마운트 0이고, 자리가 당겨진 항목 넷이 UpdatePath로 10회씩 렌더됩니다. 옛 판은 넷을 리마운트합니다(fiber 84개).
5. **118 진단의 Button 재렌더는 배열 템플릿에서 나옵니다.** 벤치마크 쪽 구성 요소가 아닙니다. `src/formTypeDefinitions/FormTypeInputArray.tsx:44-45`의 `onClick={() => handleRemoveClick(index)}`가 렌더마다 새 참조이고, `:78`의 Button은 memo가 아닙니다. 그래서 push 한 번에 기존 항목의 삭제 버튼과 추가 버튼이 모두 렌더됩니다. 옛 판도 같은 코드입니다(`FormTypeInputArray.tsx:35-40`). BF는 자기 구성 요소를 주지 않습니다(`mountEquivalentForm.tsx`).

## 고침 명세(효과가 큰 것부터)

`@winglet/react-utils/hoc`가 ErrorBoundary를 공개하므로(bd1807be2), 118라운드 F2의 전제가 된 결정은 더 필요하지 않습니다. 절감량은 모두 추정이며, 고친 판에서 같은 도구로 다시 세어 확인해야 합니다.

- **F-A, 필드 층 합치기(1·2번).**
  - SchemaNodeField의 본문을 SchemaNodeProxy로 옮겨, 옛 판 `SchemaNodeProxy.tsx:26-114`의 모양으로 되돌립니다. BoundedField와 Provider는 지웁니다.
  - formatError의 격리는 렌더러 경계로 옮깁니다. 렌더러를 감싼 memo 경계 안에서 errorMessage를 계산합니다.
  - `useBoundaryReporter`(`src/providers/FormErrorContext/useBoundaryReporter.ts:7-16`)가 경로를 인자로 받게 하고, FormErrorPathContext는 DeferrableNodeProxy의 Placeholder에만 남깁니다.
  - 기대 효과는 필드당 fiber −3입니다. 쓰기 경로의 방문과 Form 재렌더·전역 문맥 변화의 루트 렌더도 각각 −3입니다. ERROR-044·090·114의 문장과 맞는지는 판정 전에 원장과 대조합니다.
- **F-D, 배열 템플릿.** `FormTypeInputArray.tsx`의 삭제 버튼을 `index`와 안정된 `onRemove`를 받는 memo 구성 요소로 하고, Button도 memo로 감쌉니다. 기대 효과는 push 한 번의 Button 렌더가 n+1회에서 1회로 줄어드는 것이고, BF array-push-100에서는 쓰기당 약 −50회입니다. 바인딩 계약 밖의 변경입니다.
- **F-B, 입력 경계를 한 층으로(3번).** `withFormTypeInputErrorBoundary`가 `memo(({ inputGeneration, ...props }) => <ErrorBoundary onError={...}><Component {...props} key={inputGeneration} /></ErrorBoundary>)`를 반환하게 합니다. 경계는 key 바깥에 고정되므로 112C-01, EVENT-039, ERROR-090·114·117을 지킵니다. 기대 효과는 필드당 fiber −1, 쓰기당 자기 필드 렌더 10회에서 9회, 전역 변화 때 필드당 −1입니다. F-A와 함께 하면 필드당 22 fiber로 옛 판(21)과 거의 같아집니다.
- **F-C(7번).** `FormContents.tsx:121-128`의 함수를 `useCallback`으로 옮깁니다. 기대 효과는 Form 재렌더 17회에서 12회(F-A 뒤에는 11회)입니다.
- **F-F(6번).** `useTerminalChildren`이 terminal 전략일 때만 일하고 effect에 의존성 배열을 줍니다. 기대 효과는 쓰기 하나의 layout effect 2회에서 0회입니다. 마운트 뒤에야 ChildNodeComponents를 처음 읽는 터미널 입력의 경고를 놓치지 않는지 확인해야 합니다(ERROR-202).
- **F-E(4번).** SchemaNodeInput의 uSES 트래커 셋을 마스크를 합친 하나로 묶고, generation은 렌더 때 `node.revision(RequestRefresh)`로 읽습니다. 셋의 자리는 `SchemaNodeInput.tsx:116`, `useChildNodeComponents.tsx:51`, `useFormTypeInputControl.ts:51`입니다. 포커스·선택 구독은 layout 단계에 남깁니다. `DeferrableNodeProxy.tsx:56-61`이 자식의 layout 구독을 전제로 다시 발행하기 때문입니다. 기대 효과는 필드당 리스너 6개에서 4개이고, 렌더 수는 그대로입니다.
- **5번은 유지합니다.** REACT-028이 정한 일이고, 비용은 자식이 마운트될 때 1회뿐입니다.
- **9번(전역 문맥)은 고치지 않습니다.** 폼 전체 단위의 변화에 전체가 한 번 렌더되는 것은 정상 동작이고 성능 목표의 대상이 아닙니다(소유자 122라운드). selector 스냅샷이나 문맥의 노드 이벤트화는 열지 않습니다.

## 확인하지 못한 것

- F-A부터 F-F까지의 절감량은 추정입니다.
- 리스너 수(6개와 5개)는 코드를 읽어 얻었습니다.
- 옛 dist가 `6c5cb708f`의 소스와 같다는 것은 일부 줄만 맞춰 보고 판단했습니다.
- BF 규모에서는 다시 세지 않았습니다.
