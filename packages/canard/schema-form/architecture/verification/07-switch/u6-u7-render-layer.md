# U6·U7 렌더 계층 전환 검증

검증일: 2026-10-02. 최종 타입 검사 시각: 23:38:22 KST.
작업 위치: 지정된 stage-07 워크트리, 브랜치 `feat/schema-form-switch`.
이 보고서는 처음의 “71·72 문서 부재로 U6 전체 중단” 보고를 대체합니다. 문서 부재는 더 이상 중단 사유가 아닙니다. U6를 먼저 구현한 뒤 U7의 독립 항목을 구현했습니다. 아래 개별 미완료 항목과 실패 게이트가 남아 있으므로 U6·U7 전체 완료 또는 인수 가능으로 판정하지 않습니다.

## 1. 71·72라운드 검색과 적용

실제 검색한 워크트리 경로는 다음과 같습니다. 파일명뿐 아니라 `71C-01`, `72C-01`, round-71/72, 71·72라운드 결정 내용을 검색했습니다.

- `packages/canard/schema-form/architecture/**`
- `packages/canard/schema-form/architecture/reviews/**`
- `packages/canard/schema-form/architecture/plan/07-switch/**`
- 명시 경로 `packages/canard/schema-form/architecture/reviews/round-71-closing.md`
- 명시 경로 `packages/canard/schema-form/architecture/reviews/round-72-closing.md`

현재 워크트리에는 두 명시 파일도, 같은 결정 원문을 담은 다른 이름의 파일도 없습니다. 내용 검색에서 나온 `architecture/plan/07-switch/log.md`와 `architecture/verification/07-switch/bench-legacy-baseline.md`는 결정의 참조이며 원문 대체 문서가 아닙니다.

`git log -n 8 --stat`도 확인했습니다. 다음 두 Git 객체의 원래 경로에서는 원문을 읽을 수 있어 이를 적용했습니다. 파일을 복원하거나 브랜치를 바꾸지 않았습니다.

- `git show 8488b83dd:packages/canard/schema-form/architecture/reviews/round-71-closing.md`: 71C-01 원문 확인. 옛 node/constructor 타입은 legacy 보존 경로로 옮기며 새 코드의 legacy import 금지는 유지됩니다. 이번 렌더 구현은 새 core 진입점만 사용합니다.
- `git show 5758fedca:packages/canard/schema-form/architecture/reviews/round-72-closing.md`: 72C-01 원문 확인. 입력 출처 쓰기만 자기 Refresh에서 제외하고 호출자 쓰기는 바뀐 입력을 Refresh합니다. `writeSchemaNodeInput`과 호출자 `setValue`를 구분하여 구현·검증했습니다.

검증 당시 두 객체에 대한 `git merge-base --is-ancestor <hash> HEAD`는 모두 1이었습니다. 즉 객체는 이 저장소에서 읽히지만 현재 HEAD의 조상은 아닙니다. 최근 8개 로그에도 두 해시는 없었습니다. 원문을 읽는 데에는 문제가 없었습니다.

## 2. U6 구현 결과

- RootNodeContext가 새 binding-only 생성·mount·reload·adopt 경로를 사용합니다. 작성 schema 객체는 유지하고 defaultValue는 복제합니다. terminal/atomic 판정, context, validator, validationMode, 자동 쓰기 정책을 전달합니다.
- 생성 기록은 commit 전까지 버퍼에 두고 layout 준비 뒤 한 번 전달합니다. StrictMode replay에서 경고를 다시 보내지 않습니다. 준비 뒤 검증 요청과 validation root retain/release를 수행합니다.
- `nodeFromJSONSchema`를 단일 호출하면 mount가 던질 때 생성한 root를 호출자가 보유할 수 없습니다. ERROR-077–084의 “정착 실패 후에도 degraded 폼이 선다” 계약을 지키기 위해 동일 엔진의 `buildSchemaNodeTree`와 `mountSchemaNode`를 useMemo 안에서 분리 호출합니다. CORE의 공개 설명대로 binding-only 진입을 사용하며 private runtime 접근은 없습니다.
- onChange의 mount 억제, globalState 기반 onStateChange, UpdateGlobalError 기반 onValidate, UpdateDiagnostics 기반 onDiagnosticsChange를 연결했습니다. errors prop은 적용·재적용하고 reset에서도 같은 진입에 다시 적용합니다.
- Form의 전체 readOnly/disabled 잠금은 렌더 props에 결합하며 명령형 core 쓰기는 막지 않습니다. 네 renderer와 plugin render kit 이름을 바꾸고 새 validator 객체 계약을 사용합니다.
- FormHandle은 문서의 정확히 18개 멤버입니다. 선택 경로 명령, outputValue 기반 getValue/submit, readonly 오류·상태, trackable submit을 제공합니다.
- 같은 schema reset은 identity를 유지하고 다른 schema reset은 호출 안에서 새 root를 handle에 인계합니다. 같은 이벤트에서 props가 바뀌면 commit 시 재대조합니다. 새 load 정착이 실패해도 이미 인계된 handle을 유지한 채 오류를 던집니다. state·외부 오류·첨부 파일·showError 초기화를 연결했습니다.
- degraded 또는 검증 불가 제출은 거부합니다. native submit의 소유 오류는 onError 및 host sink로 보내고, 검증 결과 ValidationError와 호스트 onSubmit 예외는 onError 대상에서 제외합니다.
- Form 바깥의 instance reporter와 root/field 오류 경계를 연결했습니다. injected 입력·그룹·placeholder·특수 renderer의 소유 지점에서 HOC에 useReporter를 전달합니다. formatter 오류는 해당 필드 경계에서 격리하며 componentStack/path를 보고합니다.

U6에서 남은 범위는 §5의 B1·B2입니다. 다른 항목을 이 결함 때문에 중단하지 않았습니다.

## 3. U7 구현 결과

- 입력 쓰기·외부 오류 제거·dirty를 binding의 한 batch로 처리하고 자기 Refresh를 제외합니다. blur의 trim·finish, 지연 touched, interaction reset stamp, 동기 Refresh revision·현재 root identity 검사를 연결했습니다. 교체된 입력의 늦은 onChange/onFileAttach는 버립니다.
- 실제로 mount된 child proxy 수에 따라 컨테이너 입력을 보존합니다. 유효 schema 참조와 UpdateJsonSchema/UpdatePath가 입력 선택·props를 갱신합니다.
- Hint와 입력 props에 kind/type, schemaType, nullable, typeMismatch, watchValues를 전달합니다. 알려지지 않은 시험 키는 제외하며 integer 시험과 함께 정의당 한 번 개발 경고를 냅니다. 입력 선택 우선순위와 inline null 억제를 유지합니다.
- focus/select 명령이 지연 입력을 드러내며 공개 publish 대신 request를 사용합니다. Refresh는 지연 상태를 강제로 해제하지 않습니다.
- 터미널 ChildNodeComponents는 필요한 환경에서 읽기 감지되는 frozen empty array입니다. 커밋 뒤 code/path로 로드당 한 번 ERROR-202를 보고합니다.
- useChildNodeErrors는 새 node 배열과 UpdateChildren/UpdateState/UpdatePath/오류 통지를 구독하고 ValidationIssue를 반환합니다. revision snapshot으로 commit 사이 변화를 놓치지 않습니다.
- 숫자 입력의 빈 값은 undefined/nullable null, badInput은 미발행 후 blur 복원입니다. checkbox는 비불리언 값을 indeterminate로 표시합니다. 문자열 비우기도 nullable 규칙을 따릅니다.
- `src/types/formTypeInput.ts`의 value/onChange 주석에 입력 소유 draft, 빈 필드 undefined, nullable clear null을 REACT-027·LANDING-150과 함께 명시했습니다.
- JSONSchema 타입 전환에 필요한 helper 타입, presentation.errorMessages, 배열 입력의 새 node API, terminal/atomic 판정, virtualization reporter를 수정했습니다. 경로 matcher의 긴 private helper는 각각의 organ 파일로 분리했습니다.

U7의 기본 union 입력은 §5 B3 때문에 아직 추가하지 않았습니다. 다른 입력·hook·proxy 변경은 구현했습니다.

## 4. 테스트와 red-first 기록

신규 렌더 테스트는 15개 파일, 41개 사례입니다. 38개 통과, 3개는 §5 계약 결함 재현으로 실패합니다. skip/기대 실패 전환 없이 현재 실패를 그대로 남겼습니다. 각 신규 it 제목에 ledger ID가 있습니다.

| 신규 파일 (src/ 기준) | 사례 | 태그 및 핵심 단언 |
| --- | ---: | --- |
| components/Form/__tests__/Form.binding.test.tsx | 6 | REACT-007, LANDING-075, SURFACE-059, EVENT-073, WRITE-042·043·045·046, LANDING-067, ERROR-026·112: mount, handle 18, reset 두 경로, outputValue, root 경계 |
| components/Form/__tests__/Form.policies.test.tsx | 5 | LANDING-067·095, REACT-009, VALIDATE-044, ERROR-026·117: 전체 잠금, validator identity/교체, 검증 불가, renderer 우선순위, host 예외 |
| components/Form/__tests__/Form.reporting.test.tsx | 2 | ERROR-026·028: 검증 결과 제외, core observer 예외 전달 |
| components/Form/__tests__/Form.resetCommit.test.tsx | 3 | WRITE-043·046, ERROR-084, LANDING-095, REACT-002·003: 실패 후 새 handle, commit 재대조, atomic/default clone |
| components/Form/__tests__/Form.submission.test.tsx | 3 | LANDING-095, ERROR-032·110·117, WRITE-043·045: degraded/native 제출, errors 재적용 |
| providers/RootNodeContext/__tests__/RootNodeContext.binding.test.tsx | 2 | REACT-007, VALIDATE-044, ERROR-026, LANDING-075: StrictMode 준비 검증·buffer |
| providers/RootNodeContext/__tests__/mountFailures.test.tsx | 2 | LANDING-075, ERROR-077·079·026·117: degraded 보존, buffered 오류와 root boundary 순서 |
| providers/RootNodeContext/__tests__/blockedCoreContracts.test.tsx | 2 | WRITE-043, ERROR-113: explicit undefined reset, buffered observer 쓰기 금지 — 두 사례 실패 |
| components/SchemaNode/SchemaNodeInput/__tests__/inputBinding.test.tsx | 5 | REACT-009·011·024·028, ERROR-202: 입력 출처/batch, 늦은 콜백, blur/reset, terminal 읽기, child mount |
| components/SchemaNode/SchemaNodeInput/__tests__/selection.test.tsx | 2 | REACT-012·032·033: Hint, invalid 시험 키 |
| components/SchemaNode/SchemaNodeProxy/__tests__/effectiveSchema.test.tsx | 2 | REACT-012·010, ERROR-112: 유효 presentation 변경, formatter 경계 |
| components/SchemaNode/DeferrableNodeProxy/__tests__/commands.test.tsx | 2 | EVENT-063, REACT-028·023, ERROR-112: focus 노출, placeholder 경계 |
| formTypeDefinitions/__tests__/drafts.test.tsx | 3 | REACT-027, LANDING-150: 숫자 빈 칸·badInput, checkbox 미정 |
| formTypeDefinitions/__tests__/blockedUnionInput.test.tsx | 1 | REACT-033, LANDING-186: 기본 union fallback과 string 멤버 — 실패 |
| hooks/__tests__/useChildNodeErrors.binding.test.tsx | 1 | LANDING-170, REACT-019: StrictMode 자식 오류·상태·경로 |

렌더 전환 테스트를 먼저 작성하여 구형 factory/입력 진입에서 실패를 확인한 뒤 구현했습니다. 후속 입력 선택·child error, placeholder, mount failure, 정책·보고, formatter, reset 실패 경로도 각각 재현 테스트의 실패 뒤 수정했습니다. 기존 동작을 보존하는 characterization 사례 중에는 최초 실행부터 통과한 것도 있으며 이를 신규 실패 관측으로 세지 않습니다. B1·B2·B3는 현재도 실패합니다.

필수 render 태그 REACT-007·009·011·012, LANDING-075, REACT-024·027·028·033, ERROR-202, EVENT-073가 모두 존재합니다. `src/types/__tests__/switchSurface.type-test.ts`의 SURFACE-059·NODE-058 타입 단언은 유지했습니다.

기존 nested 테스트는 새 core import·event 이름·Hint 필수값·renderer 명칭·mock 입력 진입만 맞췄습니다. 이를 새 계약의 독립적인 증거로 대신 세지 않습니다. 기존 PropsFlow 23사례는 통과하지만 처분표의 U8/U9 재작성 결정은 여전히 유효합니다.

## 5. 개별 중단 항목과 core 결함

후속 B1–B3 닫기 검증은 아래의 해결 기록입니다. §1–4·6–8의 수치와 중단 설명은 최초 렌더 전환 구현 당시의 증거로 남깁니다. 원장의 ERROR-113은 보고기 수명, LANDING-186은 모르는 시험 키 항목이므로 요청의 테스트 태그는 유지하되 observer 쓰기 거부는 error 원장의 WRITE_IN_OBSERVER 정책, union 초안은 REACT-033에 대조했습니다. 동작 충돌은 없습니다.

### B1 — explicit undefined reset (core 결함)

- **해결됨.** `dispatchResetForm`과 `reloadSchemaNodeForm`의 로드 값은 필수 인자이며 명시한 `undefined`를 그대로 로드합니다. 이전 snapshot을 다시 읽는 기존 호출자는 해당 값을 명시합니다.
- core: `core/SchemaNode/utils/binding/__tests__/reloadSchemaNodeForm.test.ts`의 `WRITE-043 WRITE-045 same-tree reset to explicit undefined preserves root identity`가 값·로드 snapshot·오류·상호작용 초기화를 검증합니다.
- render: `providers/RootNodeContext/__tests__/blockedCoreContracts.test.tsx`의 `WRITE-043 preserves explicit undefined when resetting a same-schema form`이 root identity와 undefined를 검증합니다.
- 두 테스트는 수정 전 각각 `previous`·`before`가 남아 실패했고 수정 뒤 통과했습니다.

### B2 — 커밋 뒤 버퍼/React 경계 보고 중 core 쓰기 거부 (binding/core 연결 결함)

- **해결됨.** `observeSchemaNodeReports(root, deliver)`가 core의 `runtime.reportingErrors` 범위에서 전달하고 `finally`로 이전 값을 복원합니다. 생성·commit·reset 로드의 현재 root를 instance reporter에 연결하여 buffered 전달과 field/root 경계의 `onError`가 이 범위에 들어갑니다. 두 binding 함수는 SchemaNode/core에서 이름으로만 내보내며 `src/index.ts`는 내보내지 않습니다(69C-01).
- core: `core/SchemaNode/utils/binding/__tests__/observeSchemaNodeReports.test.ts`의 `ERROR-113 rejects writes throughout nested report scopes and restores them afterwards`, `ERROR-113 restores the previous report scope when delivery throws`, `ERROR-113 retains the core reporter scope after a nested binding delivery`가 통과합니다.
- render: 기존 `ERROR-113 refuses core writes during committed buffered onError delivery`와 `providers/FormErrorContext/__tests__/observerScopes.test.tsx`의 `ERROR-113 rejects writes in the field boundary reporter after commit`, `ERROR-113 rejects writes in the root boundary reporter while retaining its root`, `ERROR-113 scopes reports to a replacement root after schema reset`, `ERROR-113 guards an initial field boundary report under StrictMode`이 통과합니다. 마지막 사례는 실제 선택한 load의 root·pendingLoad를 Provider에서 연결하도록 고치기 전에는 observer 거부가 없어 실패했습니다.
- 새 함수 부재의 수정 전 실패와 buffered 재현 실패를 확인했습니다. observer 연결만 제거한 대조 실행에서는 buffered·field·root 세 사례가 모두 거부 오류가 없어 실패했고, 연결 복원 뒤 지정 render 전체에서도 통과했습니다.

### B3 — 기본 union 입력의 pure interpret 연결 (경계 계약 미비)

- **해결됨.** `interpretSchemaNodeDraft(node, draft)`는 작성·유효 타입의 교집합에 기존 `behaviors`의 순수 `interpret`·`isMember`를 적용하고 `{ value, isMember }`를 쓰기 없이 돌려줍니다. 하위 parser는 이름 붙은 behaviors 경계로 재사용합니다.
- 열한 번째 기본 정의 `{ type: 'union' }`를 `FormTypeInputStringDefinition` 바로 앞에 넣었습니다. 기존 String 입력을 감싸 초안·IME·유효 목록 재평가·undefined 비우기·nullable null 표시·객체/배열 읽기 전용 표시와 참조별 문자열화 메모·무효 표지를 제공합니다. 새 공개 preview는 없습니다.
- core: `core/SchemaNode/utils/binding/__tests__/interpretSchemaNodeDraft.test.ts`의 `REACT-033 preserves the string member 42 without writing or notifying`, `REACT-033 interprets drafts using the current effective type list`가 통과합니다.
- render: `formTypeDefinitions/__tests__/blockedUnionInput.test.tsx`의 `REACT-033 LANDING-186 renders the default union input and retains string members`, `REACT-033 retains invalid drafts until blur and clears nullable unions to undefined`, `REACT-033 keeps IME composition entirely in the input draft`, `REACT-033 re-evaluates the retained draft when the effective list changes`, `REACT-033 defers effective-list draft re-evaluation until composition ends`, `REACT-033 displays containers read-only and marks mismatched primitives`, `REACT-033 renders an empty read-only display when no primitive kind is effective`, `REACT-033 marks container serialization failures without replacing them with an editable draft`가 모두 통과합니다.
- 수정 전 새 pure 함수가 없고 union textbox가 없어 실패한 것을 관측했습니다. 수정 뒤 `['number','string']`의 `'42'`는 문자열로 남고, number-only 유효 목록에서는 숫자로 발행됩니다.

B1–B3 후속 최종 명령 결과(PKG 기준): unit 종료 0, 404파일/4,616 pass/기존 todo 1; 지정 render 종료 1, 21파일/114 pass/15 fail이며 실패 파일은 B4의 `src/components/__tests__/SchemaNodeProxy.refresh.test.tsx` 하나입니다. 지정 core/components/formTypeDefinitions/providers lint는 종료 0입니다. tsc는 종료 2이며 `src/__tests__/**` 40, `stories/**` 262, `src/__legacy__/**` 0, `bench/**` 1, 네 영역 밖 0입니다. 이 수치는 동시 작업이 있는 최종 검사 시점의 결과입니다. 설치와 Git 쓰기는 수행하지 않았습니다.

시작 HEAD는 `a77b8cc25`였고 마지막 확인에서는 외부 legacy 격리 커밋 `9bfc068e7`이 관측됐습니다. 해당 커밋은 동시 작업자의 legacy/eslint와 관련 architecture 기록을 바꾸었고 B1–B3 변경과 겹치지 않습니다. 아래 B4 본문은 시작 HEAD와 바이트 단위로 동일함을 확인했습니다.

### B4 — 범위 지정 render 게이트에 포함된 구형 의미 테스트

- 근거: `architecture/verification/07-switch/render-disposition.md:121–122`, TEST-023 및 LANDING-004·021·022·042·158·199는 기존 PropsFlow/Proxy.refresh를 “버리고 새로 쓴다”로 처분하고 top-level e2e 목적지를 지정합니다. 해당 이관은 U8/U9이며 이번 요청에서 top-level src/__tests__는 편집 금지입니다.
- 기존 Proxy.refresh의 15개 실패는 구형 computed, top-level injectTo, 조합별 field 존재 의미를 사용합니다. 기계적 API 전환은 했지만 새 schema 의미로 fixtures/기대값을 재작성하거나 테스트를 제외·삭제하지 않았습니다.
- 이 때문에 요청된 scoped render 명령 자체는 실패합니다. 이를 “예상 red 제외이므로 green”으로 처리하지 않습니다.

현재 원장 원문이 없어서 단위 전체를 중단한 항목은 없습니다. B1·B2는 재현된 core/binding 결함, B3는 요구된 pure 해석 접근 경계의 미비, B4는 명시된 U8/U9 처분 범위와 게이트의 충돌입니다.

## 6. 여섯 명령의 최종 결과

모든 명령은 PKG에서 실행했습니다. 설치·commit·push·stash·reset·checkout은 수행하지 않았습니다.

| 명령 | 종료 | 결과 |
| --- | ---: | --- |
| `npx tsc --noEmit --composite false --rootDir . -p tsconfig.json` | 2 | 총 304개: src/__tests__ 40, stories 262, __legacy__ 1, bench 1, 그 외 0. 따라서 요청의 두 제외 경로 밖 0 조건은 미충족입니다. |
| `npx vitest run --project unit --reporter=dot` | 0 | 401파일, 4,610 pass, 기존 todo 1. |
| `npx vitest run --project render --reporter=dot src/components src/providers src/hooks src/formTypeDefinitions src/helpers src/app src/types` | 1 | 20파일 중 17 pass/3 fail. 118사례 중 100 pass/18 fail = 신규 계약 재현 3 + 기존 U8 처분 대상 15. |
| `npx eslint "src/**/*.{ts,tsx}"` | 0 | 오류 0, 경고 0. |
| FormTypeRenderer 필드 grep (아래 명령) | 1 | 출력 0건. 일치 없음은 grep 종료 1이며 요구 충족입니다. |
| legacy import grep (아래 명령) | 1 | 출력 0건. 새 코드에서 legacy import 없음, 요구 충족입니다. |

두 grep의 실제 실행 명령은 다음과 같습니다.

```sh
grep -rnE --include='*.ts' --include='*.tsx' '(^|[^A-Za-z])FormTypeRenderer[?]?:' src --exclude-dir=__legacy__
grep -rnE --include='*.ts' --include='*.tsx' "from ['\"][^'\"]*__legacy__" src --exclude-dir=__legacy__
```

제외 대상 old render 모음도 별도 실행했습니다. 파일 49개 중 45 실패/4 통과, 실행된 사례 466개 중 281 실패/185 통과였습니다. 개별 파일 목록은 요청에 따라 적지 않습니다.

## 7. 동시 변경과 증거의 범위

작업 중 HEAD가 최초 `1def2cc4f`에서 `12d5b44dc`, 이어 `b20358843`로 바뀌었습니다. 이 세션은 commit을 실행하지 않았습니다. 마지막 해시는 74·75라운드 legacy 격리 결정의 참조를 추가한 문서 커밋입니다.

또한 이 세션이 편집하지 않은 `src/__legacy__/**`의 다수 수정·추가와 ESLint 설정 변경이 검증 중 관측됐습니다. 해당 파일을 되돌리거나 수정하지 않았습니다. 최종 타입 검사에서 그 영역 1개와 bench 1개가 남았습니다. 같은 작업 중 legacy 진단 수가 121 → 24 → 1로 변했으므로 수치는 위 시각의 작업 트리 snapshot이며 동시 작업 종료를 뜻하지 않습니다. 제 렌더 변경 범위의 타입 오류는 0입니다.

이 세션은 CORE, src/__legacy__, top-level src/__tests__, stories, bench, UI plugin 코드를 편집하지 않았습니다. 아래 목록은 이 세션의 렌더 변경이며, 전체 git diff에 보이는 동시 legacy 변경을 이 구현의 결과로 포함하지 않습니다.

## 8. 영역별 변경 파일

### U6 — Form

- `src/components/Form/Form.tsx`
- `src/components/Form/components/FormChildrenRenderer.tsx`
- `src/components/Form/components/FormError.tsx`
- `src/components/Form/components/FormGroup.tsx`
- `src/components/Form/components/FormInput.tsx`
- `src/components/Form/components/FormLabel.tsx`
- `src/components/Form/components/FormRender.tsx`
- `src/components/Form/index.ts`
- `src/components/Form/type.ts`
- `src/components/Form/util.ts`
- `src/components/Form/__tests__/Form.binding.test.tsx`
- `src/components/Form/__tests__/Form.policies.test.tsx`
- `src/components/Form/__tests__/Form.reporting.test.tsx`
- `src/components/Form/__tests__/Form.resetCommit.test.tsx`
- `src/components/Form/__tests__/Form.submission.test.tsx`
- `src/components/Form/components/FormContents.tsx`
- `src/components/Form/utils/submitForm.ts`

### U6 — providers

- `src/providers/ExternalFormContext/ExternalFormContext.ts`
- `src/providers/ExternalFormContext/ExternalFormContextProvider.tsx`
- `src/providers/FormTypeRendererContext/FormTypeRendererContext.ts`
- `src/providers/FormTypeRendererContext/FormTypeRendererProvider.tsx`
- `src/providers/FormTypeRendererContext/useFormTypeRendererContext.ts`
- `src/providers/RootNodeContext/RootNodeContextProvider.tsx`
- `src/providers/RootNodeContext/index.ts`
- `src/providers/FormErrorContext/FormErrorContext.ts`
- `src/providers/FormErrorContext/FormErrorContextProvider.tsx`
- `src/providers/FormErrorContext/FormErrorPathContext.ts`
- `src/providers/FormErrorContext/index.ts`
- `src/providers/FormErrorContext/reportErrorToHost.ts`
- `src/providers/FormErrorContext/type.ts`
- `src/providers/FormErrorContext/useBoundaryReporter.ts`
- `src/providers/FormErrorContext/useFormErrorContext.ts`
- `src/providers/FormErrorContext/utils/createFormErrorService.ts`
- `src/providers/RootNodeContext/RootBindingContext.ts`
- `src/providers/RootNodeContext/__tests__/RootNodeContext.binding.test.tsx`
- `src/providers/RootNodeContext/__tests__/blockedCoreContracts.test.tsx`
- `src/providers/RootNodeContext/__tests__/mountFailures.test.tsx`
- `src/providers/RootNodeContext/type.ts`
- `src/providers/RootNodeContext/useLiveNode.ts`
- `src/providers/RootNodeContext/utils/applyFormErrors.ts`
- `src/providers/RootNodeContext/utils/createRootLoad.ts`
- `src/providers/RootNodeContext/utils/flushRootLoad.ts`
- `src/providers/RootNodeContext/utils/resetRootLoad.ts`
- `src/providers/RootNodeContext/utils/subscribeRootLoad.ts`

### U6 — app

- `src/app/plugin/PluginManager.ts`
- `src/app/plugin/__tests__/registerPlugin.test.ts`
- `src/app/plugin/registerPlugin.ts`
- `src/app/plugin/type.ts`

### U7 — SchemaNode 및 기본 렌더러

- `src/components/FallbackComponents/FormGroupRenderer.tsx`
- `src/components/SchemaNode/DeferrableNodeProxy/DeferrableNodeProxy.tsx`
- `src/components/SchemaNode/SchemaNodeInput/SchemaNodeInput.tsx`
- `src/components/SchemaNode/SchemaNodeInput/SchemaNodeInputWrapper.tsx`
- `src/components/SchemaNode/SchemaNodeInput/hooks/useChildNodeComponents.tsx`
- `src/components/SchemaNode/SchemaNodeInput/hooks/useFormTypeInput.ts`
- `src/components/SchemaNode/SchemaNodeInput/hooks/useFormTypeInputControl.ts`
- `src/components/SchemaNode/SchemaNodeInput/type.ts`
- `src/components/SchemaNode/SchemaNodeProxy/SchemaNodeProxy.tsx`
- `src/components/SchemaNode/SchemaNodeProxyProps/SchemaNodeProxyProps.ts`
- `src/components/SchemaNode/__tests__/SchemaNodePropsFlow.fixtures.tsx`
- `src/components/SchemaNode/__tests__/SchemaNodePropsFlow.helpers.tsx`
- `src/components/SchemaNode/__tests__/SchemaNodePropsFlow.test.tsx`
- `src/components/__tests__/SchemaNodeProxy.refresh.test.tsx`
- `src/components/SchemaNode/DeferrableNodeProxy/__tests__/commands.test.tsx`
- `src/components/SchemaNode/SchemaNodeInput/__tests__/inputBinding.test.tsx`
- `src/components/SchemaNode/SchemaNodeInput/__tests__/selection.test.tsx`
- `src/components/SchemaNode/SchemaNodeInput/hooks/useTerminalChildren.ts`
- `src/components/SchemaNode/SchemaNodeProxy/__tests__/effectiveSchema.test.tsx`
- `src/components/SchemaNode/SchemaNodeProxy/components/SchemaNodeField.tsx`

### U7 — 기본 입력

- `src/formTypeDefinitions/FormTypeInputArray.tsx`
- `src/formTypeDefinitions/FormTypeInputBoolean.tsx`
- `src/formTypeDefinitions/FormTypeInputNumber.tsx`
- `src/formTypeDefinitions/FormTypeInputString.tsx`
- `src/formTypeDefinitions/__tests__/blockedUnionInput.test.tsx`
- `src/formTypeDefinitions/__tests__/drafts.test.tsx`

### U7 — hooks

- `src/hooks/__tests__/useSchemaNodeTracker.test.tsx`
- `src/hooks/useChildNodeErrors.ts`
- `src/hooks/useSchemaNodeSubscribe.ts`
- `src/hooks/useSchemaNodeTracker.ts`
- `src/hooks/__tests__/useChildNodeErrors.binding.test.tsx`

### 공유 helpers와 타입

- `src/helpers/error/__tests__/formatErrorMessage.test.ts`
- `src/helpers/error/formatErrorMessage/formatRegisterPluginError.ts`
- `src/helpers/error/formatValidationError/formatValidationError.ts`
- `src/helpers/formTypeInputDefinition/__tests__/formTypeInputDefinitions.test.ts`
- `src/helpers/formTypeInputDefinition/__tests__/formTypeInputMap.test.ts`
- `src/helpers/formTypeInputDefinition/formTypeInputDefinitions.ts`
- `src/helpers/formTypeInputDefinition/formTypeInputMap.ts`
- `src/helpers/jsonSchema/__tests__/extractSchemaInfo.test.ts`
- `src/helpers/jsonSchema/extractSchemaInfo/extractSchemaInfo.ts`
- `src/helpers/jsonSchema/getResolveSchema/utils/getResolveSchemaScanner.ts`
- `src/helpers/virtualization/VirtualizationManager/VirtualizationManager.ts`
- `src/types/formTypeInput.ts`
- `src/helpers/schemaIdentity/index.ts`
- `src/helpers/schemaIdentity/isRenderAtomic.ts`
- `src/helpers/schemaIdentity/isRenderTerminal.ts`
- `src/helpers/schemaIdentity/isSameSchema.ts`
- `src/helpers/formTypeInputDefinition/utils/pathExactMatchFnFactory.ts`
- `src/helpers/formTypeInputDefinition/utils/formTypeTestFnFactory.ts`

추가 모듈 계약 문서: `src/providers/FormErrorContext/INTENT.md`, `DETAIL.md`, `src/helpers/schemaIdentity/INTENT.md`, `DETAIL.md`. 이 보고서 외 기존 architecture 계약은 변경하지 않았습니다.
