# G27 4단계 독립 검증 보고서: schema-form-switch(07 전환)

## 방법과 환경

- 검증 일시는 2026-10-12, Asia/Seoul입니다. 사전 작업 문맥 없이 지정된 브리프로 시작했으며 `seiri:verify`를 적용했습니다.
- W는 `{repo}`, P는 W의 `packages/canard/schema-form`입니다. 브랜치는 `feat/schema-form-switch`, 시작과 작성 직전 HEAD는 `ee3b730c0f871c3a1b839791c368f821cae2c29a`입니다. 시작 시 `git status --porcelain=v1`은 비어 있었습니다.
- S는 `{scratch}/g27p4`입니다. 검사 설정·캐시·시험 JSON은 S에 두었습니다. W에 작성한 파일은 이 보고서뿐이며 소스·시험·계획·원장·기록을 수정하지 않았습니다. commit·stash·checkout·switch·새 worktree 생성은 하지 않았습니다.
- 먼저 `g27-phase1.md`, `g27-phase2.md`, `g27-phase3.md`, `g27-fixes.md`, `g27-runtime7.md`, `g27-runtime-guards-153.md`를 순서대로 읽었습니다. 이어 실행 계획·ADR·log의 최초 기준선, W의 실제 게이트 원장, 지정된 CLAUDE.md와 seiri/filid 규칙, 142라운드 이후 소유자 답과 관리자 닫기를 읽었습니다. 두 winglet 패키지의 CLAUDE.md도 확인했습니다.
- W에는 142라운드 이후 파일이 없었습니다. 다음 파일은 모두 메인 체크아웃 `packages/canard/schema-form/architecture/reviews/`에서 읽었습니다: `round-142-owner-answers.md`, `round-143-owner-answers.md`, `round-144-owner-answers.md`, `round-145-closing.md`, `round-146-owner-answers.md`, `round-147-owner-answers.md`, `round-148-closing.md`, `round-149-owner-answers.md`, `round-150-owner-answers.md`, `round-151-closing.md`, `round-152-owner-answers.md`, `round-153-closing.md`, `round-154-closing.md`, `round-155-closing.md`, `round-156-closing.md`입니다.
- 실제 검사에는 `{node-home}/versions/node/v26.11.1/bin`을 PATH 앞에 두었습니다. Node `v26.11.1`, V8 `14.6.202.34-node.37`, darwin arm64, Vitest `3.2.6`, Vite `7.3.5`, TypeScript `5.9.2`, React `19.2.6`·`18.3.1`입니다. context-mode 분석 런타임과 이 검사 런타임을 구분했습니다.
- yarn·npm·gh 명령, 설치 및 외부 검색은 실행하지 않았습니다. G28 CHECK는 원문 그대로 실행하되 `npm_config_offline=true`, `npm_config_yes=false`, `npm_config_ignore_scripts=true`, `npm_config_cache=S/npx-cache`를 적용했습니다. 별도의 Vitest 호출에는 `npx --offline --no-install`을 사용했습니다. 모든 검사 명령은 8분 미만이며 전체 패키지 시험의 제한은 450초, 실제 시간은 85.079초였습니다.
- `head.config.mjs`와 `scn.config.mjs`는 원래 Vite 설정을 가져와 캐시 위치만 S로 바꾸고 시험 캐시를 껐습니다. `--configLoader runner`를 사용했습니다. 계수 시험을 제외하지 않았습니다. S의 `counts-scratch.cjs` preload는 진단 runner를 읽을 때 고정 scratch 문자열 하나만 `S/counts-<pid>`로 바꾸며 제품 소스와 시험 단언은 그대로 사용합니다. 이 환경 조정은 N2의 저장소 수정을 뜻하지 않습니다.
- 수정 전·오동작 비교에는 S의 `variant.config.mjs`가 Vite의 메모리상 변환만 바꾸었습니다. 수정 전 제품 파일은 `git show`로 읽었으며 W의 어떤 파일도 되돌리거나 편집하지 않았습니다. 오동작 변형은 검사 장치의 민감도를 확인하기 위한 것으로 현재 HEAD의 결함으로 세지 않았습니다.

## 판정

**FAIL — 차단 지적은 2건입니다. 두 건 모두 현재 HEAD의 게이트 증거 공백이며, 새 제품 동작 결함을 확인한 결과는 아닙니다.**

B1은 해결되었습니다. core 단언은 14개에서 3개로 줄었으며 남은 #3·#7·#12는 이유가 있고 150라운드 원칙 3이 허용합니다. 이 세 건은 열린 결함으로 세지 않았습니다. lint·typecheck·unit·render·react18·SCN·레거시 격리는 통과했습니다. 배열 단축 경로와 일반 경로의 비교 시험에서도 현재 HEAD의 값·기록·소멸 읽기·활성 상태 차이를 발견하지 못했습니다.

G23의 소유자 브라우저 실행과 G26의 배열 행 수용 대기는 추가 FAIL 사유가 아닙니다. G33은 현재 원장에서 이미 닫혀 있으며 로컬 PR 리뷰 상태 표시도 맞습니다. 이 보고서는 게이트 원장을 수정하거나 지정된 G32 담당자의 판정을 대신 기록하지 않습니다.

## 차단 지적

### B2. 이전 G32 공백은 보충되었지만 그 증거가 후속 제품 커밋을 덮지 않습니다

- `.seiri/tasks/schema-form-switch/gates.md:194`는 G32를 닫힌 것으로 표시합니다. `:195`의 범위는 명시적으로 `f9ae05d5e..a76ebf44a`입니다. `architecture/verification/07-switch/g32-recheck.md:50`, `:52`, `:56`도 같은 범위의 antigravity PASS를 기록합니다. 따라서 3단계 당시 빠졌던 대조가 나중에 작성되었다는 사실은 확인했습니다.
- 그러나 그 뒤 제품을 바꾼 `34b370eed`, `62e140d8d`, `0eb8e3ada`, `e1d3a8914`, `e9c408980`은 그 범위에 없습니다. 예를 들어 현재의 `src/core/blueprint/utils/analyze/resolveReference.ts:48`, `src/core/settle/utils/structure/applyArraySlots.ts:35`, `src/core/settle/utils/compute/selectChildren.ts:81`은 이후 변경입니다.
- 153·154·155의 성능 채택과 배열 구현 리뷰 기록은 확인했습니다. 다만 이것들은 G32가 지정한 담당자의 **후속 범위 전체 원장 대 구현 대조** 기록과 동일한 산출물이 아닙니다. 현재 보고서의 독립 코드 검토도 그 담당자의 판정을 자동 대체하지 않습니다. 이전 범위의 PASS를 현재 HEAD 전체의 PASS로 확대할 수 없습니다.
- 필요한 증거는 위 다섯 제품 커밋과 연결 문서를 현재 원장·146/149/150/153/154/155라운드 결정과 대조한 G32 담당자의 결과입니다. 기존 결과의 유효한 범위는 보존하고 새 범위·HEAD·차단 건수를 연결해야 합니다. 여기서는 재대조를 위임하거나 기록을 고치지 않았습니다.

### B3. G31의 과거 통과는 현재 소스에 재사용할 수 없으며 현재 재현은 미확정입니다

- `.seiri/tasks/schema-form-switch/gates.md:191`은 G31을 닫혀 있다고 표시하지만 `:192`의 증거는 `f8a39d65e`와 당시 snapshot `282ab981…`입니다. 해당 커밋의 P/src tree는 `fc6685b6baf5452eb838ef4bfa40e26cbaea2158`, 현재 tree는 `8b2586417a850450c32c23b0dd2b278725007811`입니다. 두 tree는 같지 않습니다.
- 새 의존 경로의 실제 예는 `src/core/settle/utils/structure/applyArraySlots.ts:21`, `src/core/settle/utils/compute/selectChildren.ts:27`, `src/core/blueprint/utils/analyze/resolveReference.ts:6`입니다. 새 함수와 시험 fixture도 들어왔으므로 과거 파일 집합·snapshot의 통과를 그대로 재사용할 조건이 충족되지 않습니다.
- 현재 `fractal_inspect validate`, path P/src, scopes `boundaries`·`dag`는 **status `indeterminate`, passed 264, failed 2, skipped 0**을 반환했습니다. 두 결과는 실제 순환이나 실제 organ 외부 소비를 특정한 결함이 아니라, 경계와 DAG 분석이 미확정이라는 경고입니다. snapshot은 `ba4883230164fc94c582cbf55cf2c630ba1a09b6cb9169df990fddca56046805`입니다.
- 도구 artifact의 진단에는 `entry-point-facts-unavailable` 69개와 `verification-facts-unavailable` 400개가 있습니다. artifact는 `{agent-home}/plugins/filid/artifacts/fractal_inspect/469c1874821f40fd917ab374243e91d7224da12e619d91dffd60d951ad3d1da1.json`입니다. 이 실행을 지적 0의 PASS로 바꾸지 않았습니다.
- 필요한 것은 현재 소스와 일치하는 exact facts에 근거한 boundaries·dag 검증 결과입니다. facts bootstrap이나 저장소 메타데이터 작성은 읽기 전용 범위에 없으므로 수행하지 않았습니다. 이 지적은 실제 구조 결함의 발견과 구분한 **현재 게이트 증거의 차단**입니다.

## 비차단 지적

### N1. 재개 안내와 사본이 다시 현재 상태보다 뒤처졌습니다

`architecture/plan/07-switch/log.md:12`는 G27을 여전히 core 단언 14개 승인 대기로 설명하고, `:14`는 완료된 배열 1단계 측정과 단언 재검토를 다음 행동으로 안내하며, `:15`의 다음 라운드는 144입니다. 실제 기록은 156까지 진행되었습니다. `gates-snapshot.md:177`은 G27을 질의 4항 대기로 두며 실제 원장 `gates.md:173`의 제거 11·허용 잔존 3과 다릅니다. G26 사본의 증거도 실제 원장과 다릅니다.

실제 원장 `gates.md:168`도 최종 세 행 재측정을 Remaining으로 적지만 `profile-156-final.md:3`, `:292`부터에는 이미 결과가 있습니다. `gates.md:173`은 B2·N1이 3단계 보고서에서 해결된 듯 적지만 그 보고서 `g27-phase3.md:104`, `:124`는 당시 미해결이라고 판정합니다. 이후 G32 보충과 당시 판정을 구분하여 기록해야 합니다. B2와 중복하는 설명 문제를 추가 차단 건수로 세지 않았습니다.

`src/core/blueprint/DETAIL.md:9`의 isTerminal 승인 대기 설명도 메인 `round-146-owner-answers.md:8`의 승인과 현재 구현보다 뒤처져 있습니다. 남은 core 단언의 허용 자체를 취소하는 문제는 아닙니다.

### N2. 계수 시험의 고정 공용 scratch 경로는 남아 있습니다

`tools/measure-react-render-counts.mjs:14`는 특정 세션의 `scratchpad/bundles`를 고정하고 `:21`, `:23`은 current 실행에서 공용 `fa-change.cjs`를 만들고 읽습니다. 호출은 `Form.renderCounts.test.ts:7`, `layoutCounts.test.ts:7`, `renderCounts.test.ts:18`입니다. 이번에는 preload로 출력 경로만 프로세스별 S로 돌려 전부 실행했습니다. 저장소의 경합 가능성은 해결되지 않았으며 비차단으로 남습니다.

### N3. selectChildren의 기존 helper 예산 이탈은 그대로입니다

`src/core/settle/utils/compute/selectChildren.ts:41`의 `staticShape`는 구현 몸통 21줄입니다. `.claude/rules/seiri_function-boundaries.md`의 helper 몸통 8줄 상한을 넘습니다. `e1d3a8914`의 같은 함수도 21줄이어서 고침 ②가 새로 만든 이탈은 아닙니다. 새 배열 함수들은 각각 export 하나, 모듈 내부 helper 0개, 형 단언 0개입니다. 현재 파일 전체가 helper 예산까지 충족한다고는 판정하지 않았습니다.

### N4. 시험 민감도의 범위를 과장하지 않아야 합니다

고침 ②의 `reuseArrayChildren.ts:28` callback을 생략하거나 `:25`의 선언 ID 목록을 빈 배열로 바꾼 메모리상 변형은 13건 모두 통과했습니다. 해당 줄 각각의 필요성을 이 시험이 독립적으로 증명한다고는 말할 수 없습니다. `computeNode.ts:118`부터는 선택 전에 dirty 자식을 계산하고 `:128`부터는 선택 뒤에도 계산합니다. callback 생략의 통과를 현재 출력 회귀로 해석하지 않았습니다.

반면 활성 상태를 잘못 공표한 변형은 5건 실패했고, 꼬리 적용을 생략한 변형은 12건 실패했습니다. 출력·반환·소멸 관측을 비교하는 시험은 실제 오동작을 감지합니다. 두 배열 고침의 작업량 계약도 수정 전 코드에서 각각 실패했습니다. 검사 장치의 이 한계는 제품 결함과 구분했습니다.

### N5. 후속 보고서 차분에 공백 오류가 있습니다

`git diff --check f8a39d65e HEAD`는 종료 코드 2이며 `profile-156-final.md:72`, `:78`, `:132`의 trailing whitespace를 보고했습니다. `a76ebf44a..HEAD` 대조에는 `g27-phase3.md:221`의 EOF 빈 줄도 포함됩니다. 실행 예시의 빈 context 줄과 문서 공백이며 동작 차단으로 세지 않았습니다.

## 3단계 지적의 현재 상태

| 항목 | 현재 판정 | 근거 |
| --- | --- | --- |
| B1 | 해결되었습니다. | 제거 11개, 150라운드가 허용하는 이유 있는 잔존 3개입니다. |
| B2 | 이전 누락 범위는 보충되었습니다. 현재 범위의 증거 공백은 남습니다. | G32의 보충은 a76ebf44a까지이며 이후 다섯 제품 커밋은 새 대조가 필요합니다. |
| N1 | 비차단으로 남습니다. | log와 사본이 142/144라운드 및 core 승인 대기를 안내합니다. |
| N2 | 비차단으로 남습니다. | 공용 scratch 상수는 그대로이며 이번의 환경 조정은 코드 수정이 아닙니다. |

## 비시험 형 단언 재계수

git 추적된 P/src의 TypeScript·TSX 파일에서 `src/__legacy__`, `__tests__`, `__mocks__`와 test/spec/type-test 파일을 제외했습니다. TypeScript AST의 `AsExpression`과 `TypeAssertionExpression`을 검사하고 `as const`는 별도로 셌습니다. 검사 파일은 687개, 비const 단언은 **40개(core 3·비core 37)**, `as const`는 55개, 비null `!`는 32개입니다. `as any`·`as never`는 각각 0개입니다. 비core 37개는 3단계 목록과 같으며 새 단언은 없습니다.

### 기존 core 14개의 처리

| 기존 번호 | 현재 처리 | 현재 증거 |
| --- | --- | --- |
| #1 | 62e140d8d에서 제거했습니다. | buildNodes의 readonly 배열 좁히기입니다. |
| #2 | 34b370eed에서 제거했습니다. | populateNodeChildren의 discriminator 선언 형입니다. |
| #3 | 허용된 잔존입니다. | populateVirtualNodes.ts:41–42의 작성 값 수락 집합 유지 이유입니다. |
| #4 | 0eb8e3ada에서 제거했습니다. | resolveReference.ts:48의 isBlueprintSchema입니다. |
| #5 | 34b370eed에서 제거했습니다. | getValue의 unknown overload입니다. |
| #6 | 34b370eed에서 제거했습니다. | BlueprintGate의 kind별 선언 형입니다. |
| #7 | 허용된 잔존입니다. | collectInlineTerminalWarnings.ts:55–66의 미검증 작성 값 순회 이유입니다. |
| #8 | 0eb8e3ada에서 제거했습니다. | applyControlHints.ts:15의 isObjectRecord입니다. |
| #9 | 0eb8e3ada에서 제거했습니다. | mergeHintGroup.ts:48과 freezeCreatedHintObjects의 가드입니다. |
| #10 | 62e140d8d에서 제거했습니다. | mergeSchemaContributions의 readonly 배열 선언입니다. |
| #11 | 0eb8e3ada에서 제거했습니다. | mergeSingleStaticContribution.ts:73이 같은 controls 적용 함수를 사용합니다. |
| #12 | 허용된 잔존입니다. | createDynamicFunction.ts:38–39의 Function 호출 서명과 신뢰 이전 이유입니다. |
| #13 | 0eb8e3ada에서 제거했습니다. | readAllowedTypes.ts:27, :58의 기존 검사를 담은 predicate입니다. |
| #14 | 34b370eed에서 제거했습니다. | nodeFromJSONSchema의 종단 판정 선언 정비입니다. |

메인 `round-150-owner-answers.md:7`의 원칙 3은 이유를 적은 내부 단언이 G27 조건을 만족한다고 명시합니다. 메인 `round-146-owner-answers.md:15`의 덧붙임도 #3·#7과 #12의 처리 이유를 구분합니다. 세 잔존은 이 허용 범위에 들어갑니다. 34b370eed와 62e140d8d의 모든 변경 TS/TSX를 이전 blob과 비교한 esbuild 정규화 출력은 동일했습니다. 이는 형 정비의 독립 진단이며 전체 번들을 새로 빌드해 바이트 동일성을 재측정했다는 주장은 아닙니다.

### 전체 잔존 단언 목록

아래 위치는 P 기준이며 가능한 경우 실제 `as` 토큰의 행입니다. 세 core 행은 허용된 잔존이고 나머지 행은 이전 보고서부터 있던 비core 표현입니다.

| 번호 | 위치 | 대상 형 |
| --- | --- | --- |
| 1 | src/components/Form/Form.tsx:32 | 제네릭 Form 함수 서명 |
| 2 | src/components/Form/components/FormChildrenRenderer.tsx:48 | FormChildrenProps<Schema, Value> |
| 3 | src/components/Form/components/FormChildrenRenderer.tsx:62 | typeof FormChildrenRendererInner |
| 4 | src/components/Form/components/FormGroup.tsx:126 | 제네릭 FormGroup 함수 서명 |
| 5 | src/components/Form/components/FormGroup.tsx:112 | ComponentType<FormTypeInputProps> |
| 6 | src/components/Form/components/FormInput.tsx:102 | 제네릭 FormInput 함수 서명 |
| 7 | src/components/Form/components/FormInput.tsx:89 | ComponentType<FormTypeInputProps> |
| 8 | src/components/Form/components/FormRender.tsx:139 | 제네릭 FormRender 함수 서명 |
| 9 | src/components/Form/components/FormRender.tsx:125 | ComponentType<FormTypeInputProps> |
| 10 | src/components/SchemaNode/SchemaNodeInput/SchemaNodeInput.tsx:133 | JSONSchema |
| 11 | src/components/SchemaNode/SchemaNodeInput/SchemaNodeInput.tsx:142 | JSONSchema |
| 12 | src/components/SchemaNode/SchemaNodeInput/hooks/useChildNodeComponents.tsx:118 | MemoExoticComponent<ChildNodeComponent> & AdditionalChildNodeProperties |
| 13 | src/components/SchemaNode/SchemaNodeInput/hooks/useFormTypeInput.ts:19 | JSONSchema |
| 14 | src/components/SchemaNode/SchemaNodeInput/hooks/useFormTypeInputControl.ts:72 | SelectableElement |
| 15 | src/components/SchemaNode/SchemaNodeProxy/SchemaNodeProxy.tsx:92 | JSONSchema |
| 16 | src/core/blueprint/utils/analyze/populateVirtualNodes.ts:42 | Record<string, unknown> — 허용 |
| 17 | src/core/blueprint/utils/diagnostics/collectInlineTerminalWarnings.ts:66 | BlueprintSchema — 허용 |
| 18 | src/core/blueprint/utils/expressions/createDynamicFunction/createDynamicFunction.ts:39 | DynamicFunction — 허용 |
| 19 | src/helpers/error/formatErrorMessage/utils/formatPrefixItemsPreview.ts:15 | JSONSchema |
| 20 | src/helpers/error/formatValidationError/formatValidationError.ts:7 | JSONSchema |
| 21 | src/helpers/formTypeInputDefinition/formTypeInputDefinitions.ts:76 | (keyof FormTypeTestObject)[] |
| 22 | src/helpers/jsonSchema/extractSchemaInfo/extractSchemaInfo.ts:24 | Return |
| 23 | src/helpers/jsonSchema/extractSchemaInfo/extractSchemaInfo.ts:27 | Return |
| 24 | src/helpers/jsonSchema/extractSchemaInfo/extractSchemaInfo.ts:32 | Return |
| 25 | src/helpers/jsonSchema/getResolveSchema/utils/getResolveSchemaScanner.ts:25 | JSONSchemaWithRef |
| 26 | src/helpers/jsonSchema/getResolveSchema/utils/getResolveSchemaScanner.ts:29 | JSONSchemaWithRef |
| 27 | src/helpers/jsonSchema/stripSchemaExtensions/stripSchemaExtensions.ts:36 | JSONSchema |
| 28 | src/helpers/schemaIdentity/isRenderTerminal.ts:12 | JSONSchema |
| 29 | src/helpers/schemaIdentity/isSameSchema.ts:26 | Record<string, unknown> |
| 30 | src/helpers/schemaIdentity/isSameSchema.ts:27 | Record<string, unknown> |
| 31 | src/hooks/useChildNodeComponentMap.ts:22 | keyof Value |
| 32 | src/hooks/useChildNodeComponentMap.ts:26 | ChildNodeComponentMap<Required<Value>> |
| 33 | src/hooks/useChildNodeComponentMap.ts:30 | keyof typeof target |
| 34 | src/providers/ExternalFormContext/ExternalFormContext.ts:38 | ExternalFormContext |
| 35 | src/providers/FormErrorContext/utils/createFormErrorService.ts:48 | 오류 선택 필드 봉투 또는 null |
| 36 | src/providers/FormTypeInputsContext/FormTypeInputsContext.ts:13 | FormTypeInputsContext |
| 37 | src/providers/FormTypeRendererContext/FormTypeRendererContext.ts:22 | FormTypeRendererContext |
| 38 | src/providers/InputControlContext/InputControlContext.ts:11 | InputControlContext |
| 39 | src/providers/RootNodeContext/RootNodeContext.ts:5 | SchemaNode |
| 40 | src/providers/WorkspaceContext/WorkspaceContext.ts:15 | WorkspaceContext |

## 후속 커밋과 배열 경로 대조

`a76ebf44a`는 현재 HEAD의 조상이 아닙니다(`merge-base --is-ancestor` 종료 1). 140라운드의 rebase 때문에 단순 `a76ebf44a..HEAD` log에는 이미 검증했던 기반 커밋과 원자료 보관 이동도 들어옵니다. 따라서 이전 HEAD 대 현재 blob의 순변경과 `f8a39d65e..HEAD`의 후속 커밋을 함께 확인했습니다. 현재 로컬 origin/1.0.0-beta는 `e9b6b455fe5cf53b843f80aa5f688dd06a9005a2`, merge-base는 `351ece24e2789c55e137fe69235cf776f902a468`입니다. fetch는 하지 않았습니다.

- 34b370eed와 62e140d8d는 선언 형·readonly overload 및 그 영향 아래의 레거시/union 형 정비입니다. 두 changeset 문서도 범위에 들어 있습니다. 형 검사와 정규화 JS 비교에서 새 런타임 동작 변경을 발견하지 못했습니다.
- 0eb8e3ada는 boolean/비null 객체 및 비null 객체 봉투 가드를 사용합니다. isBlueprintSchema.ts:8과 isObjectRecord.ts:6에는 단언이 없고 배열·인스턴스를 배제하는 plain-object 검사를 추가하지 않습니다. readAllowedTypes는 기존 some/indexOf의 희소 슬롯 건너뛰기를 유지합니다. controls의 watch/default 직접 읽기와 단일 정적 기여의 키 순서도 대조했습니다. 새 가드 시험 5파일·10건이 실제 전체 unit 결과에서 통과했습니다. 153의 React·Core ADOPT를 현재 독립 성능 재측정으로 확대하지 않았습니다.
- e1d3a8914의 canApplyArrayTail.ts:13–24는 통째 raw, 실제 길이 변경, 제자리 from 슬롯, 같은 blueprint/name, 값 꼬리를 검사합니다. applyArrayTail.ts:39–44의 반환값, :75–91의 소멸 읽기·prune·경로 정리, :95–113의 children·snapshot·dirty·gate 등록을 일반 applyArraySlots 경로와 대조했습니다. 접두 children과 snapshot은 별도 배열이며 retained structure의 항목만 유지합니다.
- e9c408980의 canReuseArrayChildren.ts:27–32는 전체 blueprint의 gate/식/derive, previousEmit의 배열 여부, 통째 raw·분배 입력·경로 이동·pending exit·prior identity를 검사합니다. :35–51은 슬롯·children 순서·정적 유효 schema·active·detached·parent·path·새로 생성된 접두를 확인합니다. reuseArrayChildren.ts:21–28은 선언 ID를 공표하고 dirty 계산 callback을 유지합니다. 일반 선택이 필요한 gate throw·derive·inject·visible 식·중간 삭제·통째 교체·잘못된 종류의 경우를 시험이 대조합니다.
- compareArrayTail.ts:43–56은 같은 입력의 일반 경로를 oracle로 만들고 실제 꼬리 호출·반환·정착·소멸 읽기를 비교합니다. compareArraySelection.ts:43–63은 같은 공개 쓰기 이력의 일반 경로와 결과·배달·오류 기록·선택 관측·소멸 읽기를 비교합니다. 현재 세 배열 시험 파일의 27건은 전체 unit 검사에 포함되어 모두 통과했습니다.
- 두 DETAIL 업데이트는 src/core/settle/DETAIL.md:5–9, :240–249에 현재 조건과 동일성 계약을 기록합니다. 두 구현 보고서는 코드보다 먼저 수정했다고 기록합니다. 단일 커밋 내부 편집 순서는 git만으로 독립 입증할 수 없으며, 현재 문서가 구현과 맞고 같은 커밋에 포함되었다는 점을 확인했습니다.
- 0ff52e57b·372fa0b96·f8bf0d85b·b1035b73b·035da3fb4·ee3b730c0의 문서 변경은 보관 원자료, PR 리뷰 상태, 142 수용과 143 철회, 배열 1단계/07b 감사, 최종 156 수치를 각각 기록합니다. 후속 제품 커밋 메시지의 co-author·Claude 세션·UUID 표식은 0개입니다. 생성한 runtime bundle은 S에만 있으며 새 후속 커밋의 제품 산출물 추가는 발견하지 못했습니다.

## 기준선과 현재 게이트

최초 기준선의 SHA-256 앞 12자는 log.md:21–24와 같습니다: request `2d18c8e8f6ec`, ADR `3a0de74015f6`, verification `03921fe0fb80`, round-68-closing `eb4076c56b01`입니다. 계획서 세 파일은 현재 로컬 origin/1.0.0-beta의 blob과도 같습니다. 기준선을 후속 코드에 맞춰 바꾸었다는 증거는 없습니다.

G32가 인용한 원장 ID 19개는 현재 원장에서도 모두 실재합니다. ERROR-044/090/114/117/202/204, SETTLE-004/017/045, CONTROLS-080, REACT-027/028/033, EVENT-039/040/042/070, LANDING-087/186입니다. 인용 경로의 기존 formType.ts 오기는 g32-recheck.md:63에 정정되어 있습니다. 이것이 후속 범위의 G32 증거를 새로 만드는 것은 아닙니다.

실제 체크박스는 **36개 중 33개 닫힘**, 열린 것은 G23·G26·G27입니다. `gates status`는 G13b·G17b·G19b를 집계하지 않아 33개 중 30개, `all_met: false`를 반환합니다. 보고서에서는 실제 파일의 36개 계수를 사용했습니다.

| 게이트 | 원장 표시 | 이번 결과 |
| --- | --- | --- |
| G4 | 닫힘 | CHECK 종료 0, 130행 일치입니다. |
| G13b | 닫힘 | CHECK 종료 0, 격리 1,705파일·레거시 eslint·표지 모두 통과입니다. |
| G17b | 닫힘 | CHECK 종료 0, 처분표 49행·빈 칸/TBD 없음입니다. |
| G19b | 닫힘 | CHECK 종료 0, 옛 평면 스토리와 임시 제외 표식이 없습니다. |
| G20 | 닫힘 | CHECK 종료 0, 130행 완료입니다. |
| G23 | 열림 | 142라운드의 소유자 별도 지시 대기와 일치합니다. 브라우저 프로젝트는 실행하지 않았습니다. |
| G26 | 열림 | 수용 대기는 정확합니다. 최종 재측정이 남았다는 설명은 N1처럼 낡았습니다. |
| G27 | 열림 | 현재 보고서는 FAIL이며 원장을 갱신하지 않았습니다. |
| G28 | 닫힘 | 원문 CHECK에서 LINT_TYPECHECK_OK를 확인했습니다. |
| G29 | 닫힘 | 지정 세 프로젝트·SCN 재실행은 통과했습니다. 플러그인 build는 명령 금지 때문에 재실행하지 않았습니다. |
| G30 | 닫힘 | 원문 CHECK 종료 0, LEDGER_LINKS_OK입니다. |
| G31 | 닫힘 | 현재 결과는 indeterminate이며 B3의 증거 공백이 있습니다. |
| G32 | 닫힘 | 이전 보충 범위는 확인했으나 후속 범위는 B2의 증거 공백이 있습니다. |
| G33 | 닫힘 | 원문 CHECK 종료 0, BOARD_IN_REVIEW입니다. PR #354·base 기록은 log의 기존 증거를 읽었고 원격 상태는 조회하지 않았습니다. |

`performance.md:401`, `:405`, `:409` 등의 `143라운드 재판정 중` 표시는 156C-01대로 유지되어야 하며 현재도 있습니다. 156 최종 결과는 `profile-156-final.md:308–310`에 push-100 +1.529666 ms(1.018311×), replace-200 +9.959042 ms(1.095379×), push-remove-100 −2.668696 ms(0.977904×)로 기록되어 관리자 닫기와 맞습니다. 재판정 표시를 지우거나 이 수치를 새 수용으로 인정하지 않았습니다.

## 명령 결과와 시험 수

파일 수는 Vitest JSON의 `testResults` 수이며 describe suite 수와 구분했습니다. 전체 패키지 결과의 물리 파일은 400개, 프로젝트별 파일 결과는 480개입니다. 동일한 80개 렌더 파일은 두 React 프로젝트에서 각각 실행되었고 파일별 사례 수가 같음을 JSON으로 확인했습니다.

| 실행 | 파일 | 통과 | 실패 | todo | 종료/시간 |
| --- | ---: | ---: | ---: | ---: | --- |
| unit | 320 | 2,451 | 0 | 1 | 전체 호출 종료 0 |
| render | 80 | 512 | 0 | 0 | 전체 호출 종료 0 |
| react18 | 80 | 512 | 0 | 0 | 전체 호출 종료 0 |
| 지정 세 프로젝트 합계 | 480 | 3,475 | 0 | 1 | 0 / 85.079초 |
| SCN | 4 | 21 | 0 | 0 | 0 / 1.368초 |
| 수정 전 고침 ① | 2 | 2 | 12 | 0 | 1 / 2.982초 |
| 수정 전 고침 ② | 1 | 7 | 6 | 0 | 1 / JSON 실행 구간 1.563초 |
| 꼬리 적용 생략 변형 | 2 | 2 | 12 | 0 | 1 / JSON 실행 구간 1.314초 |
| 재사용 callback 생략 변형 | 1 | 13 | 0 | 0 | 0 / 3.079초 |
| 재사용 선언 ID 비움 변형 | 1 | 13 | 0 | 0 | 0 / 3.188초 |
| 재사용 active 훼손 변형 | 1 | 8 | 5 | 0 | 1 / 3.205초 |

unit의 기존 todo는 `src/core/behaviors/unionBehavior/__tests__/union.write-paths.test.ts`의 `TEST-077 stage 07 (PR-7): finished string input applies trim`입니다. todo를 통과 사례에 합산하지 않았습니다. 별도 production 프로젝트는 브리프의 세 프로젝트에 포함하지 않았으며 이전 yarn 전체 suite의 504파일·3,548통과·todo 1과 이번 480파일·3,475통과·todo 1을 같은 범위의 계수로 표시하지 않았습니다.

G28의 실제 명령은 W에서 다음 CHECK 원문입니다. 종료 0, 14.588초, `LINT_TYPECHECK_OK`입니다.

```sh
(cd packages/canard/schema-form && npx eslint "src/**/*.{ts,tsx}" && npx tsc --noEmit --composite false --rootDir . -p tsconfig.json) && echo LINT_TYPECHECK_OK
```

P에서 실행한 시험과 격리 명령은 다음과 같습니다. 첫 Vitest 호출에는 `NODE_OPTIONS=--require=S/counts-scratch.cjs`도 적용했습니다.

```sh
npx --offline --no-install vitest run --config "$S/head.config.mjs" --configLoader runner --project unit --project render --project react18 --reporter=json --outputFile "$S/head-all.json"
node architecture/verification/07-switch/tools/check-legacy-isolation.mjs
```

격리 단독 실행은 종료 0이며 **`LEGACY_ISOLATED: 1705 files checked`**입니다. G13b의 원문 CHECK도 같은 줄과 `LEGACY_BOTH_WAYS_ZERO`를 반환했습니다. SCN에서는 다음을 실행했습니다.

```sh
npx --offline --no-install vitest run --config "$S/scn.config.mjs" --configLoader runner --reporter=json --outputFile "$S/scn-all.json"
```

변형 비교는 `G27_VARIANT=<variant>`로 설정하고 P에서 아래 인자를 사용했습니다. fix1 변형은 `settle.array-prefix.test.ts`와 `applyArraySlots.prefix-work.test.ts`, fix2 변형은 `settle.array-selection-reuse.test.ts`를 지정했습니다. 수정 전 fix1은 0eb8e3ada의 applyArraySlots.ts, 수정 전 fix2는 e1d3a8914의 selectChildren.ts를 읽었습니다.

```sh
npx --offline --no-install vitest run --config "$S/variant.config.mjs" --configLoader runner --project unit --reporter=json --outputFile "$S/<variant>.json" <target-files>
```

수정 전 ①의 작업량 시험은 `applyArraySlots.prefix-work.test.ts:18`에서 readRawTree 호출 2회 때문에 실패했습니다. 수정 전 ②는 `settle.array-selection-reuse.test.ts:145`부터의 접두 active capture/방문 0회 조건 때문에 실패했습니다. 꼬리 생략 변형은 compareArrayTail.ts:54의 실제 반환 차이로 실패했고, active 훼손 변형은 compareArraySelection.ts:63의 일반 경로 관측 차이로 실패했습니다. setup 오류나 시험 0건의 결과를 변경 증거로 사용하지 않았습니다.

G4·G13b·G17b·G19b·G20·G30·G33도 원장 CHECK 원문을 실행했습니다. 각각 종료 0이며 시간은 0.045·3.669·0.019·0.011·0.056·0.070·0.010초였습니다. 기대 표지는 모두 출력되었습니다. 전체 시험 stderr에는 module.register deprecation과 Storybook annotation 안내가 있었지만 실패 시험이나 미처리 오류 실패는 없었습니다.

## 범위 밖 결정과 종료 상태

증거 공백을 메우기 위한 facts 작성, G32 재위임, 원장/사본/계획 변경 및 소유자 수용 결정은 이번 읽기 전용 검증에 포함하지 않았습니다. 그 조치를 선택하거나 실행하지 않았으며 브리프 밖의 새 결정을 내려야 하는 질문은 추가하지 않았습니다. 현재 증거가 부족한 두 게이트를 PASS라고 기록하지 않는 것으로 검증을 마칩니다.

보고서 작성 직전 `git status --porcelain=v1`은 비어 있었고 HEAD는 시작과 같았습니다. 작성 후 실제 재확인에서도 HEAD는 `ee3b730c0f871c3a1b839791c368f821cae2c29a`이며 상태 출력은 다음 한 줄뿐입니다. 소스·시험·문서의 다른 변경은 없습니다.

```text
?? packages/canard/schema-form/architecture/verification/07-switch/g27-phase4.md
```

## 범위 재확인(2026-10-12, HEAD `940b7e792`)

### 방법과 범위

- 검증 엔진은 Codex(GPT-6)입니다. 이전 검증에 참여하지 않은 새 세션에서 이 보고서를 먼저 읽고, `seiri:verify`를 적용하여 B2·B3·N1만 재확인했습니다. 새로운 전체 리뷰나 제품 시험은 수행하지 않았습니다.
- 작업 자리는 `{repo}`, 브랜치는 `feat/schema-form-switch`입니다. 시작 및 추가 작성 직전 HEAD는 `940b7e792ae6d50c56c64cf28f6f085594cc71a6`이며 `git status --porcelain=v1` 출력은 비어 있었습니다.
- `git diff ee3b730c0 940b7e792 -- packages/canard/schema-form/src` 출력은 비어 있습니다. 두 커밋의 src tree는 모두 `8b2586417a850450c32c23b0dd2b278725007811`이며, 후속 커밋의 변경 파일 다섯은 모두 architecture 문서입니다. 따라서 `ee3b730c0`의 소스에 대한 새 증거를 현재 HEAD에 재사용할 수 있습니다.
- gitignored 원장은 워크트리의 `.seiri/tasks/schema-form-switch/gates.md`를 직접 읽었습니다. 이 절만 추가하며 소스·시험·다른 문서를 수정하지 않았고, commit·stash·checkout·switch 및 yarn·npm·gh를 실행하지 않았습니다.

### B2 — 해소

`g32-recheck.md:72`의 새 절은 대상 HEAD `ee3b730c0`, 범위 `a76ebf44a..ee3b730c0`, 제품 커밋 `34b370eed`, `62e140d8d`, `0eb8e3ada`, `e1d3a8914`, `e9c408980`을 명시하고 담당을 antigravity(티어 high)로 기록합니다(`:74`). 원장 `gates.md:194`의 담당은 `antigravity(멈추면 Claude verifier)`이며, `:195`의 범위·담당·G32 PASS·차단 0건은 이 새 절과 일치합니다. 커밋별 원장·소유자 라운드·구현 대조가 `g32-recheck.md:94`부터 `:98`까지 다섯 행으로 존재하고, 판정은 `:80`과 `:82`에 기록되어 있습니다. 이전 범위의 PASS를 확대하거나 이번 검증자가 지정 담당자의 대조를 대신한 기록이 아닙니다.

다음 인용 8곳을 해당 파일에서 직접 열어 확인했습니다. 경로는 `packages/canard/schema-form/` 기준입니다.

| 인용 | 직접 확인한 내용 |
| --- | --- |
| `src/core/blueprint/type.ts:48` | `BlueprintGate`의 kind별 판별 합집합 선언이 49–69행에 있습니다. |
| `src/core/blueprint/utils/analyze/buildNodes.ts:64` | `isArray(schemaType)`를 통한 종류 좁히기가 64–68행에 있습니다. |
| `src/core/blueprint/utils/analyze/resolveReference.ts:48` | `isBlueprintSchema` 가드와 `UnknownJsonSchema` 오류 반환이 있습니다. |
| `src/core/settle/utils/structure/applyArraySlots.ts:35` | `canApplyArrayTail` 검사 후 `applyArrayTail`을 호출합니다. |
| `src/core/settle/utils/compute/selectChildren.ts:81` | 배열 재사용 자격 검사 후 `reuseArrayChildren`을 호출하고 반환합니다. |
| `architecture/ledger/test.md:548` | `TEST-027` 표제와 벤치 소유자 수용 계약이 있습니다. |
| `architecture/ledger/test.md:1276` | `TEST-070` 표제가 있습니다. |
| `architecture/ledger/node.md:782` | `NODE-046` 표제와 형 단언 없는 공개 판별 합집합 계약이 있습니다. |

지정 담당자의 후속 다섯 제품 커밋 전체 대조가 보충되었으므로 B2의 증거 공백은 닫혔습니다. 그 담당자가 기록한 typecheck·시험 결과를 이번 세션에서 다시 실행했다고 주장하지 않습니다.

### B3 — 기록 근거로 해소, 직접 재현에는 한계

원장 `gates.md:191`–`:192`와 `log.md:519`의 「2026-10-12 G27 4단계와 G31·G32 재확인」 절(`:526`–`:528`)은 현재 src tree에서 facts를 새로 추출·제출한 결과 **1,108 files accepted, 0 rejected**, 이어 `fractal_inspect validate`의 scopes `boundaries`·`dag` 결과 **status `ok`, 0 findings, 266 passed, 0 failed, snapshot `26c2268d…`**를 일치하게 기록합니다. 문서 계약 진단 10건은 이 게이트의 범위 밖으로 구분되어 있습니다. 위에서 확인한 src tree 동일성으로 이 증거의 소스 범위는 현재 HEAD와 일치합니다.

이번 세션에서도 filid 도구를 직접 호출했습니다. 인자는 action `validate`, path `packages/canard/schema-form/src`, scopes `["boundaries", "dag"]`입니다. 제 실행 결과는 **status `indeterminate`, 2 findings, 264 passed, 2 failed, 0 skipped, snapshot `ba4883230164fc94c582cbf55cf2c630ba1a09b6cb9169df990fddca56046805`**입니다. 이 실행은 기록의 `ok` 결과를 재현하지 못했으며, PASS로 바꾸어 적지 않습니다.

기록 당시 저장 facts의 유효한 로딩을 현재 도구 환경에서 확인할 수 없었습니다. 도구가 상세 진단을 외부 artifact로 돌렸고, 해당 artifact 읽기도 context-mode의 workspace 경계 제한으로 거부되어 이번 실행의 상세 사유를 직접 확인하지 못했습니다. facts 추출·제출이나 설정 변경은 수행하지 않았습니다. 따라서 B3 해소 판단은 **이번 직접 실행의 통과가 아니라, 동일한 현재 소스에 대한 원장·log의 새 facts 및 통과 기록**에 근거합니다. 현재의 `indeterminate`를 실제 경계 위반이나 순환 발견으로 해석하지 않았습니다.

### N1 — 사본 일치, 재개 안내에 비차단 문구 잔존

`gates-snapshot.md`와 실제 원장의 G1–G33 블록을 비교한 결과 33개 모두 내용이 일치했습니다. G26 닫힘, G27 범위 재확인 대기, G31·G32의 새 증거도 일치합니다(`gates-snapshot.md:169`, `:176`–`:177`, `:195`–`:199`; `gates.md:165`, `:172`–`:173`, `:191`–`:195`).

`log.md` §0의 `:12`–`:15`는 157라운드, 단언 11개 제거·이유 있는 잔존 3개, G26 수용, G31·G32 보충, 다음 행동인 G27 범위 재확인, 다음 라운드 158을 반영합니다. 이전의 core 단언 승인 대기 및 144라운드 안내는 사라졌습니다. 다만 `:12`의 「열린 것은 소유자의 브라우저 실행을 기다리는 G23입니다」는 작성 전 원장에서 G23(`gates.md:145`)과 G27(`:172`)이 모두 미체크인 상태를 완전히 표현하지 않습니다. `log.md:14`는 G27 후속 행동을 올바르게 안내하므로 이 잔존 문구는 비차단이며, 재개 지점이 원장과 완전히 일치한다고 판정하지 않습니다.

B2·B3의 차단 증거 공백은 위 근거와 재현 한계를 명시하여 해소로 판정했습니다. N1의 잔존 문구 및 이 재확인 범위 밖의 기존 비차단 지적은 차단 건수에 추가하지 않았습니다. 원장의 G27 상태를 변경하지 않았으며, 이번 판정은 보고서에만 기록합니다.

G27 최종 판정: PASS

### 주 세션 보충: B3 실행 차이

범위 재확인 뒤 주 세션이 같은 HEAD `940b7e792`에서 같은 인자(path `packages/canard/schema-form/src`, scopes `boundaries`·`dag`)로 `fractal_inspect validate`를 다시 실행했습니다. 결과는 status `ok`, 지적 0건, 통과 266, 실패 0, snapshot `26c2268dab3d9c593e4c5a86f66b81c890fa85610c99dea298d8ce084f10de63`이며 기록과 같습니다.

Codex 세션의 결과(`indeterminate`, 통과 264·실패 2, snapshot `ba4883230164…`)는 4단계 본 검증의 실행과 snapshot이 같습니다. 그 실행의 진단은 `entry-point-facts-unavailable` 69개와 `verification-facts-unavailable` 400개였습니다(위 B3). Codex 쪽 filid는 별도의 facts 저장소(`~/.codex/plugins/filid/`)를 읽으며, 그곳에는 이번 추출이 제출되지 않았습니다. 두 결과의 차이는 facts 저장소의 차이이며, 같은 src tree에 대해 exact facts로 판정한 결과는 `ok`입니다.

464라운드 가지 정리 보충: 이 문서가 인용한 미병합 후보 `f9ae05d5ea5e`의 필요한 내용은 [본선 보존물](../../_archive/branches/README.md)에 있습니다. 원래 SHA는 자료 식별자이며 가지 유지에 의존하지 않습니다.
