# G27 3단계 보충 검증 보고서: schema-form-switch(07 전환)

- 검증 엔진과 노력은 codex, high입니다.
- 검증 대상은 `{repo}`의 브랜치 `feat/schema-form-switch`, HEAD `a76ebf44a5159713e26c7c804d67b6b2f92bdb29`입니다. `git rev-parse HEAD`로 확인했으며, 시작 시 `git status --porcelain=v1`의 출력은 비어 있었습니다.
- 검증 일시는 2026-10-11, Asia/Seoul입니다.
- 범위는 2단계의 B1·B2·B4·B5·B6과 N1·N2, `6040aa3d9..HEAD`의 후속 수정, 최초 기준선·원장·실행 계획·현재 게이트의 일치 여부입니다. `9f6b4000f`, `67d7a8e42`, `ad8cbd743`, `75fc421b4`의 소스·시험·문서 차분과 그 뒤의 문서 커밋을 확인했습니다.
- 방법은 `seiri:verify`의 독립 검증입니다. 먼저 두 기존 보고서, 실행 계획, 기록, 워크트리의 게이트 원장, 메인 체크아웃의 소유자 질의 목록, 지정된 규칙과 패키지 CLAUDE.md를 읽었습니다. `gates status`에는 워크트리 `project_root`를 명시했으며 `all_met: false`를 확인했습니다. 단계 변경이나 게이트 기록 호출은 하지 않았습니다.
- 비교 ref는 로컬 `origin/1.0.0-beta`의 `715a09111f4afd09a44cef73a59cad053aa39a5e`입니다. merge-base는 `69290372ceb7367e079f6c3349d02067297541a3`입니다. 메인 체크아웃의 브랜치는 `1.0.0-beta`였습니다. 2단계 이후 로컬 ref가 이동했으므로 당시 해시를 현재 ref로 간주하지 않았습니다.
- 실행 환경은 지정 경로의 Node `v26.11.1`, V8 `14.6.202.34-node.37`, darwin arm64입니다. 설치된 Vitest는 `3.2.6`, Vite는 `7.3.5`, TypeScript는 `5.9.2`, React는 `19.2.6`과 `18.3.1`입니다.
- 네트워크·설치·yarn·npm·gh를 실행하지 않았습니다. 허용된 npx 시험에는 `--offline --no-install`과 오프라인 환경을 적용했습니다. 제품 소스·커밋된 시험·계획·원장·기록은 수정하지 않았습니다. 저장소에 작성한 파일은 이 보고서뿐입니다.
- 아래의 `S`는 `{scratch}/g27p3`입니다. 비교 설정과 시험 JSON은 모두 이 경로에 두었습니다. Vite 설정은 기존 패키지 설정을 재사용하고 캐시 위치만 S로 돌렸으며 `--configLoader runner`를 사용했습니다. 수정 전 소스 비교에서는 제품 alias만 S의 이전 소스 트리로 돌렸습니다. 각 명령은 8분 미만에 종료했으며, Vitest 호출의 제한은 450초였습니다.

## 판정

**G27의 3단계 보충 판정은 FAIL입니다. 차단 지적은 2건이며, 소유자 질의 4항을 제외한 차단 지적은 1건입니다.**

B1의 렌더 계층 수정과 B4·B5·B6의 해결은 확인했습니다. B1에는 소유자 질의 4항의 core 단언 14개에 대한 승인 대기가 남아 있습니다. B2는 G13b·G17b·G19b·G28·G29·G31의 최신 기록이 추가되었지만 G32의 근거 갱신이 남아 있습니다. 따라서 **그 밖의 차단 항목이 모두 닫혔다고 말할 수 없으며, 현재 결과를 `미충족(질의 4항 대기)`로만 적을 수 없습니다.**

G23의 소유자 브라우저 실행, G26의 의도된 수용 대기, G33의 PR 대기는 이번 FAIL의 추가 사유에 포함하지 않았습니다. N2는 비차단 상태로 남습니다. N1은 기록의 낡은 시점·사본·수정 커밋 칸이 정비되었지만 완료 상태를 과장하는 문장 하나가 남아 있습니다.

## 차단 지적

### B1. 렌더의 문제 단언은 제거되었지만 core 14개의 승인 조건은 아직 충족되지 않았습니다

`67d7a8e42`는 `formTypeInputDefinitions.ts:53`에서 integer 검사의 입력을 `readonly unknown[]`로 선언하고, `:79`에서 비교 값을 `unknown`으로 선언했습니다. 2단계가 지적한 두 `as never`는 없습니다. `useTerminalChildren.ts:9`의 빈 목록도 배열 선언 후 동결하도록 바뀌어 `as unknown as ChildNodeComponent[]`가 없습니다. 입력 정의·맵·경계 관련 재실행은 아래의 207건 통과에 포함됩니다.

그러나 `src/core`의 나머지 14개는 `g27-fixes.md:45`부터의 승인 대기 목록과 정확히 같습니다. 메인 체크아웃의 `architecture/reviews/owner-queue-07.md:10`은 이 14개를 여전히 질의 4항으로 둡니다. 질의 목록은 승인 답변이 아니며, `{agent-home}/CLAUDE.md:18`과 `:19`의 선언 자리 정비 및 명시적 승인 조건을 충족하지 않습니다. 이 항목은 승인 대기라는 한 건의 차단 지적으로 계산했습니다.

#### 전체 비시험 단언을 다시 센 결과입니다

`node S/assertions.cjs`는 git에 추적된 `src`의 TypeScript 파일 680개를 AST로 검사하여 종료 코드 0을 반환했습니다. `src/__legacy__`, `__tests__`, `__mocks__` 및 시험·명세 파일 이름을 제외했습니다. `AsExpression`과 `TypeAssertionExpression`을 세고 `as const` 55개를 제외했습니다. 결과는 **51개이며 core 14개와 비core 37개입니다. `as never`와 `as any`는 0개이고, 2단계 이후 새로 추가된 단언은 0개입니다.** 2단계 HEAD에는 같은 범위에 55개가 있었고 지적된 네 AST 표현이 제거되었습니다.

따라서 질문의 문자 그대로인 **남은 단언이 core 14개뿐이라는 주장은 거짓입니다.** 2단계는 일반적인 React 제네릭 보존 단언 등을 모두 결함으로 세지 않았습니다(`g27-phase2.md:25`). 아래 비core 37개는 모두 그 시점에도 존재한 표현입니다. 이 보충 검증은 해당 37개에 새로운 승인을 부여하지 않았으며, 기존 B1의 해결 여부와 전체 단언의 수를 구분했습니다.

비null `!`는 2단계 B1의 14개 계수에 포함되지 않았으므로 이번 51개에도 합산하지 않았습니다. 별도 계수는 32개입니다. 1단계 N5의 `entries!` 언급을 2단계의 승인 대기 14개에 합쳐 해석하지 않았습니다. 아래의 행 번호는 가능한 경우 AST 식의 시작 대신 실제 `as` 토큰을 가리킵니다.

#### 승인 대기 core 단언 14개는 다음과 같습니다

| 번호 | 위치 | 단언의 대상 형 |
| --- | --- | --- |
| 1 | `src/core/blueprint/utils/analyze/buildNodes.ts:69` | `BlueprintNodeKind` |
| 2 | `src/core/blueprint/utils/analyze/populateNodeChildren.ts:152` | `{ propertyName?: string }` |
| 3 | `src/core/blueprint/utils/analyze/populateVirtualNodes.ts:42` | `Record<string, unknown>` |
| 4 | `src/core/blueprint/utils/analyze/resolveReference.ts:35` | `\| BlueprintSchema \| undefined` |
| 5 | `src/core/blueprint/utils/analyze/resolveReference.ts:35` | `Record<string, unknown>` |
| 6 | `src/core/blueprint/utils/diagnostics/collectBlueprintWarnings.ts:90` | `{ propertyName: string; values: readonly unknown[]; }` |
| 7 | `src/core/blueprint/utils/diagnostics/collectInlineTerminalWarnings.ts:66` | `BlueprintSchema` |
| 8 | `src/core/blueprint/utils/effectiveSchema/utils/applySchemaContribution/utils/applyControlHints.ts:18` | `Record<string, unknown>` |
| 9 | `src/core/blueprint/utils/effectiveSchema/utils/mergeHintGroup.ts:50` | `Record<string, unknown>` |
| 10 | `src/core/blueprint/utils/effectiveSchema/utils/mergeSchemaContributions.ts:36` | `readonly SchemaTypeName[]` |
| 11 | `src/core/blueprint/utils/effectiveSchema/utils/mergeSchemaContributions/utils/mergeSingleStaticContribution.ts:74` | `Record<string, unknown>` |
| 12 | `src/core/blueprint/utils/expressions/createDynamicFunction/createDynamicFunction.ts:39` | `DynamicFunction` |
| 13 | `src/core/blueprint/utils/types/readAllowedTypes.ts:44` | `SchemaTypeName[]` |
| 14 | `src/core/nodeFromJSONSchema.ts:34` | `Parameters<typeof buildSchemaNodeTree<Schema>>[0]` |

`resolveReference.ts:35`의 두 단언은 중첩된 별개의 AST 표현입니다. `mergeSchemaContributions.ts`의 승인 목록은 식이 시작하는 34행을 적고 있으며 위 표의 36행은 같은 식의 `as` 토큰입니다.

#### 그 밖의 비core 단언 37개는 다음과 같습니다

| 번호 | 위치 | 단언의 대상 형 |
| --- | --- | --- |
| 1 | `src/components/Form/Form.tsx:32` | `< Schema extends JSONSchema, Value extends AllowedValue = InferValueType<Schema>, >( props: FormProps<Schema, Value> & { ref?: ForwardedRef<FormHandle<Schema, Value>>; }, ) => ReactNode` |
| 2 | `src/components/Form/components/FormChildrenRenderer.tsx:48` | `FormChildrenProps<Schema, Value>` |
| 3 | `src/components/Form/components/FormChildrenRenderer.tsx:62` | `typeof FormChildrenRendererInner` |
| 4 | `src/components/Form/components/FormGroup.tsx:126` | `<Value extends AllowedValue = AllowedValue>( props: FormGroupProps<Value>, ) => ReactNode` |
| 5 | `src/components/Form/components/FormGroup.tsx:112` | `ComponentType<FormTypeInputProps>` |
| 6 | `src/components/Form/components/FormInput.tsx:102` | `<Value extends AllowedValue = AllowedValue>( props: FormInputProps<Value>, ) => ReactNode` |
| 7 | `src/components/Form/components/FormInput.tsx:89` | `ComponentType<FormTypeInputProps>` |
| 8 | `src/components/Form/components/FormRender.tsx:139` | `<Value extends AllowedValue = AllowedValue>( props: FormRenderProps<Value>, ) => ReactNode` |
| 9 | `src/components/Form/components/FormRender.tsx:125` | `ComponentType<FormTypeInputProps>` |
| 10 | `src/components/SchemaNode/SchemaNodeInput/SchemaNodeInput.tsx:133` | `JSONSchema` |
| 11 | `src/components/SchemaNode/SchemaNodeInput/SchemaNodeInput.tsx:142` | `JSONSchema` |
| 12 | `src/components/SchemaNode/SchemaNodeInput/hooks/useChildNodeComponents.tsx:118` | `MemoExoticComponent<ChildNodeComponent> & AdditionalChildNodeProperties` |
| 13 | `src/components/SchemaNode/SchemaNodeInput/hooks/useFormTypeInput.ts:19` | `JSONSchema` |
| 14 | `src/components/SchemaNode/SchemaNodeInput/hooks/useFormTypeInputControl.ts:72` | `SelectableElement` |
| 15 | `src/components/SchemaNode/SchemaNodeProxy/SchemaNodeProxy.tsx:92` | `JSONSchema` |
| 16 | `src/helpers/error/formatErrorMessage/utils/formatPrefixItemsPreview.ts:15` | `JSONSchema` |
| 17 | `src/helpers/error/formatValidationError/formatValidationError.ts:7` | `JSONSchema` |
| 18 | `src/helpers/formTypeInputDefinition/formTypeInputDefinitions.ts:76` | `(keyof FormTypeTestObject)[]` |
| 19 | `src/helpers/jsonSchema/extractSchemaInfo/extractSchemaInfo.ts:24` | `Return` |
| 20 | `src/helpers/jsonSchema/extractSchemaInfo/extractSchemaInfo.ts:27` | `Return` |
| 21 | `src/helpers/jsonSchema/extractSchemaInfo/extractSchemaInfo.ts:32` | `Return` |
| 22 | `src/helpers/jsonSchema/getResolveSchema/utils/getResolveSchemaScanner.ts:25` | `JSONSchemaWithRef` |
| 23 | `src/helpers/jsonSchema/getResolveSchema/utils/getResolveSchemaScanner.ts:29` | `JSONSchemaWithRef` |
| 24 | `src/helpers/jsonSchema/stripSchemaExtensions/stripSchemaExtensions.ts:36` | `JSONSchema` |
| 25 | `src/helpers/schemaIdentity/isRenderTerminal.ts:12` | `JSONSchema` |
| 26 | `src/helpers/schemaIdentity/isSameSchema.ts:26` | `Record<string, unknown>` |
| 27 | `src/helpers/schemaIdentity/isSameSchema.ts:27` | `Record<string, unknown>` |
| 28 | `src/hooks/useChildNodeComponentMap.ts:22` | `keyof Value` |
| 29 | `src/hooks/useChildNodeComponentMap.ts:26` | `ChildNodeComponentMap<Required<Value>>` |
| 30 | `src/hooks/useChildNodeComponentMap.ts:30` | `keyof typeof target` |
| 31 | `src/providers/ExternalFormContext/ExternalFormContext.ts:38` | `ExternalFormContext` |
| 32 | `src/providers/FormErrorContext/utils/createFormErrorService.ts:48` | `{ code?: FormErrorRecord['code']; details?: FormErrorRecord['details']; message?: string; } \| null` |
| 33 | `src/providers/FormTypeInputsContext/FormTypeInputsContext.ts:13` | `FormTypeInputsContext` |
| 34 | `src/providers/FormTypeRendererContext/FormTypeRendererContext.ts:22` | `FormTypeRendererContext` |
| 35 | `src/providers/InputControlContext/InputControlContext.ts:11` | `InputControlContext` |
| 36 | `src/providers/RootNodeContext/RootNodeContext.ts:5` | `SchemaNode` |
| 37 | `src/providers/WorkspaceContext/WorkspaceContext.ts:15` | `WorkspaceContext` |

고침 명세는 남은 core 표현을 선언 정비·실제 좁히기로 제거하거나, Vincent에게 해당 14개 표현을 특정한 명시적 승인을 받는 것입니다. 현재 질의 목록과 lint 통과만으로 B1을 닫지 않아야 합니다.

### B2. G32의 현재 범위에 대한 대조 근거가 여전히 빠져 있습니다

`.seiri/tasks/schema-form-switch/gates.md:194`는 G32를 `[x]`로 두지만 `:195`의 EVIDENCE는 여전히 `f9ae05d5e`의 대조를 인용하며 문장이 `rech…`에서 끝납니다. `architecture/verification/07-switch/g32-recheck.md:3`도 대상이 `f9ae05d5e`라고 명시하고, `:48`은 당시 G31을 인용합니다. 새 G32 대조 결과나 현재 해시를 이 문서에서 찾지 못했습니다.

`log.md:14`가 다음 행동으로 G32 차분 대조를 수행하도록 안내하는 점도 아직 완료되지 않았음을 뒷받침합니다. `git diff --name-only f9ae05d5e HEAD -- packages/canard/schema-form/src`와 `git log --oneline f9ae05d5e..HEAD -- packages/canard/schema-form/src`는 후속 소스 변경이 있음을 보여 줍니다. 2단계가 요구한 그 범위의 대조와 B4 반영을 이전 해시의 결과로 대신할 수 없습니다. 이번 codex 보충 보고서는 게이트가 지정한 대조 담당자의 판정이나 원장 기록을 자동으로 대체하지 않습니다.

다른 B2 세부 사항은 다음과 같이 정비되었습니다.

- G13b·G17b·G19b는 원장의 `:78`, `:103`, `:108`에서 닫혀 있으며 2026-10-11의 `78841d697` 재실행 근거를 각각 `:81`, `:106`, `:111`에 기록했습니다. `log.md:487`부터에도 결과가 있습니다. 현재 격리 스크립트는 종료 코드 0과 `LEGACY_ISOLATED: 1685 files checked`를 반환했습니다. G17b의 행별 빈 칸·TBD는 0개이며 스토리 행은 49개입니다. G19b의 옛 평면 스토리와 임시 제외 표식도 0개입니다. 레거시 eslint 결과는 기존의 최신 실행 기록을 재사용했습니다.
- G28·G29의 재실행과 공개 타입으로 다시 수행한 플러그인 빌드는 `log.md:490`, `:491`, `:494`부터와 원장 `:178`, `:184`에 기록되었습니다. `git diff --name-only 78841d697 HEAD --`로 패키지 src·설정·manifest, SCN, 플러그인 넷을 대조했으며 출력은 비어 있었습니다. 이번 허용 범위에서는 lint·형 검사·빌드를 반복하지 않았고 해당 결과를 기록된 범위에서 재사용했습니다.
- G31에는 원장 `:192`와 `log.md:492`에 `78841d697` 기준 facts 1,097파일 exact, 거부·미확정 0, boundaries·dag 지적 0, 통과 260, snapshot `282ab981…`가 기록되었습니다. 그 이후 패키지 소스 차분이 없어 이 최신 기록을 재사용할 수 있습니다. 이번 codex facts 환경에서의 읽기 전용 재검사는 별도로 아래의 한계를 남겼습니다.

이번 `fractal_inspect validate`의 boundaries·dag 결과는 **indeterminate**이며 snapshot은 `38b6f7ea63de16a5e5232ecc9b0e007ee12f0f7d865eb8bf47edc61bc776f133`입니다. 결과는 통과 258과 미확정 경고 2개이며, 진입점 facts 미확정 진단 69개와 검증 facts 미확정 진단 392개가 원인으로 나옵니다. 실제 새 순환이나 실제 경계 위반을 발견한 결과가 아니며, 이번 실행을 지적 0의 재통과로 바꾸지 않았습니다. `S/filid-summary.json`에 도구 응답을 보관했습니다. 새 facts bootstrap은 저장소 쓰기 제한 때문에 하지 않았습니다. G31의 재사용된 최신 기록과 이번 독립 재현의 미확정 상태를 구분합니다.

고침 명세는 게이트가 지정한 담당자가 적어도 `f9ae05d5e..a76ebf44a`의 후속 소스 차분을 현재 원장과 대조하고, B4의 로드 수명 수정 및 공개·내부 계약 변경 여부를 포함한 결과를 현재 해시와 범위로 남기는 것입니다. 결과를 `g32-recheck.md`와 G32 EVIDENCE에 연결하고, 원장 사본 및 재개 안내에도 동일한 상태를 반영해야 합니다. 소유자 질의 4항의 승인 대기는 그대로 구분하여 적어야 합니다. 이번 검증 범위에서는 이 파일들을 수정하지 않았습니다.

## 비차단 지적

### N1. 재개 지점과 사본은 갱신되었지만 모든 다른 차단 항목이 닫혔다는 문장은 정확하지 않습니다

`49d2ae3cb`는 `log.md:7`부터 재개 지점과 실제 열린 게이트를 갱신했고, `:104`와 `:105`의 수정 커밋 칸에는 `302f2f8fb`와 `fba01cbea`가 있습니다. `a76ebf44a`의 `gates-snapshot.md`는 머리의 설명 네 행을 제외하면 워크트리 원장과 바이트가 같습니다. 따라서 2단계의 낡은 시점·사본 불일치·미커밋 표시는 해결되었습니다.

다만 `log.md:11`은 질의 4항 외의 차단 항목이 모두 닫혔다고 단정하고, `:14`는 아직 G32 대조를 다음 행동으로 둡니다. 앞의 B2가 남으므로 N1 전체를 완전 해결이라고 판정하지 않았습니다. 고침 명세는 G32가 완료되기 전에는 그 근거 갱신이 남았다고 안내하고, 완료 뒤에는 실제 판정과 해당 근거를 연결하는 것입니다. 이 상태 설명 문제는 B2와 중복하여 새 차단 건수로 세지 않았습니다.

### N2. 계수 시험의 공용 스크래치 경로는 그대로 남아 있습니다

`architecture/verification/07-switch/tools/measure-react-render-counts.mjs:14`는 여전히 특정 세션의 `scratchpad/bundles`를 사용합니다. `:21`과 `:23`은 current 실행이 같은 `fa-change.cjs`를 만들고 읽게 합니다. 후속 수정에서 이 스크립트나 계수 시험 호출은 바뀌지 않았습니다.

호출 위치는 `src/components/Form/__tests__/Form.renderCounts.test.ts:7`, `src/components/SchemaNode/SchemaNodeInput/__tests__/layoutCounts.test.ts:7`, `src/components/SchemaNode/SchemaNodeProxy/__tests__/renderCounts.test.ts:18`입니다. 공통 helper `SchemaNodeProxy/__tests__/helpers/runtimeCounts.mjs:8`부터는 진단 스크립트를 읽어 계수를 추가하지만 스크래치 경로를 호출자별로 변경하지 않습니다.

따라서 **N2는 열려 있습니다.** 실제 경합 실패를 새로 관측한 것은 아니므로 비차단 분류를 유지합니다. 이 세 시험을 그대로 실행하면 지정한 S 밖의 공용 파일에 쓰므로 이번 독립 실행에서는 제외했습니다. G29의 기존 전체 실행 기록에 이 시험이 포함되었다는 사실과 경로 문제가 해결되었다는 판정은 별개입니다. 고침 명세는 출력 디렉터리를 인자로 받고 각 시험이 독립된 임시 경로를 사용하게 하는 것입니다.

## 2단계 지적의 재확인

| 항목 | HEAD의 판정 | 근거와 남은 일 |
| --- | --- | --- |
| B1 | 렌더 수정은 해결되었고 core 승인 대기는 남아 있습니다. | 제거 대상 네 AST 표현은 없어졌으며 새 단언은 0개입니다. 전체 단언은 51개이고 승인 대기 core 14개는 질의 4항과 같습니다. |
| B2 | 부분 해결되었으며 차단 상태가 남아 있습니다. | G13b·G17b·G19b·G28·G29·G31의 최신 기록은 추가되었습니다. G32는 여전히 `f9ae05d5e` 기준입니다. |
| B4 | 해결되었습니다. | 동일 root 단언이 있는 새 reset 시험은 수정 전 두 React 판에서 해당 경고 수 때문에 실패하고 HEAD에서 통과했습니다. |
| B5 | 해결되었습니다. | Form·입력 DETAIL과 `src/INTENT.md`는 현재 소유 지점과 `outputValue`를 설명합니다. 승인된 CLAUDE.md 이름 수정도 반영되었습니다. |
| B6 | 해결되었습니다. | RootLoad·RootBinding 필드와 createRootLoad의 인자·반환·실패·버퍼 수명 JSDoc이 추가되었습니다. |
| N1 | 부분 해결되었습니다. | 재개 시점·사본·수정 커밋 칸은 갱신되었습니다. G32 대조가 남았는데 모든 다른 차단 항목이 닫혔다고 적은 문장은 정비가 필요합니다. |
| N2 | 열려 있으며 비차단입니다. | 계수 시험은 같은 공용 번들 경로를 계속 사용합니다. |

### B4의 전후 동작 증거입니다

`terminalChildren.test.tsx:56`의 새 사례는 공개 Form handle을 사용합니다. `:66`에서 첫 로드 경고 1건을 확인하고, `:67`에서 root를 붙잡은 뒤 `:68`에서 reset합니다. `:70`은 reset 뒤 node identity가 같은지 단언하고, `:71`은 누적 경고 2건을 요구합니다. `:72`부터 일반 값 쓰기 뒤에도 2건을 유지하는지 확인합니다. 따라서 새 root 교체를 reset 검증으로 오인하거나 같은 로드의 중복 보고를 허용하는 시험이 아닙니다.

`resetRootLoad.ts:32`는 beginLoad를 호출하고 `:35`부터 작성 스키마가 같으면 root를 유지합니다. `createFormErrorService.ts:15`부터 로드 번호를 관리하고 beginLoad에서 번호 증가와 경고 집합 비우기를 함께 수행합니다. `useTerminalChildren.ts:29`부터 getter가 번호 차이를 보고 ACCESSED만 지웁니다. COMMITTED 상태와 같은 의존성의 layout effect를 유지하므로 다음 로드의 첫 읽기만 다시 전달하는 변경입니다.

`git worktree add --detach S/before 9f6b4000f^`로 비교 트리를 만들었으며 해당 HEAD는 `6040aa3d9d0c02eae4b679ed9d6ba93bd593ca52`였습니다. 동일한 현재 시험 파일과 설치된 의존성을 사용하여 제품 alias만 이전 트리로 바꾸었습니다. 처음에는 의존성 경로 오류로 시험 0건이었으므로 그 결과를 증거에서 제외했습니다. 이전 트리에 같은 node_modules를 연결한 후의 유효한 결과만 아래에 적었습니다. 검증 후 `git worktree remove S/before`는 종료 코드 0을 반환했으며 트리 삭제도 확인했습니다.

| 실행 | 결과 | 증거 |
| --- | --- | --- |
| HEAD의 render와 react18입니다. | 종료 코드 0이며 8건이 모두 통과했습니다. | `S/head-terminal.json`의 success는 true이고 failed는 0입니다. 새 reset 사례가 두 판에서 각각 통과했습니다. |
| 수정 전의 render와 react18입니다. | 종료 코드 1이며 6건 통과와 2건 실패입니다. | `S/before-terminal.json`의 두 실패는 새 reset 사례의 `:71`에서 `expected 1 to be 2`입니다. 같은 root 단언까지는 통과했으며 나머지 기존 사례는 모두 통과했습니다. |

패키지 디렉터리에서 수행한 두 유효한 실행의 명령 인자는 다음과 같습니다. PATH는 지정 Node의 bin을 우선하도록 구성했습니다.

```sh
npx --offline --no-install vitest run --config "$S/head.config.mjs" --configLoader runner --project render --project react18 --reporter=json --outputFile "$S/head-terminal.json" src/components/SchemaNode/SchemaNodeInput/__tests__/terminalChildren.test.tsx
npx --offline --no-install vitest run --config "$S/before.config.mjs" --configLoader runner --project render --project react18 --reporter=json --outputFile "$S/before-terminal.json" src/components/SchemaNode/SchemaNodeInput/__tests__/terminalChildren.test.tsx
```

### 후속 수정의 결함·계약·규칙 대조 결과입니다

확인한 후속 수정에서 새 동작 결함이나 원장에 없는 공개 계약 변경을 발견하지 못했습니다. B4는 기존 ERROR-202의 로드마다 한 번 보고하는 계약을 복구하며 FormErrorService의 번호는 내부 보고 서비스의 상태입니다. `src/index.ts`·`src/core/index.ts`·`src/types`·`src/errors`의 후속 차분은 비어 있습니다. B1의 타입 선언 정비는 입력 매칭의 비교 규칙과 공개 소비 형을 유지합니다.

`ad8cbd743`는 여섯 childSelection 시험 도우미를 같은 settle 소유자의 `__tests__/fixtures/`로 옮겼습니다. 이름·구현은 유지하고 소비 시험의 import와 번들 진입 문자열을 새 위치로 맞췄습니다. `buildChildSelectionRuntime.ts:61`의 문자열은 새 fixtures 경로를 사용하며 `observeChildSelectionPlans.ts:3`은 해당 소유자의 구체 구현을 읽습니다. 기존 helpers 경로를 유지하는 후속 소비자는 찾지 못했습니다. 이동된 도우미를 소비하는 네 시험의 실제 실행도 통과했습니다. 이 좁은 이동 확인을 전체 프로젝트 DAG의 독립 증명으로 확대하지 않았습니다.

B5의 `components/Form/DETAIL.md:31`은 렌더러·입력·Placeholder를 구분합니다. 구현은 `SchemaNodeProxy.tsx:44`와 `:90`, `withFormTypeInputErrorBoundary.tsx:23`부터, `VirtualizationManager.ts:212`부터의 소유 지점과 같습니다. 입력 DETAIL `:10`은 사설 어댑터와 Refresh 동안의 경계 수명을 설명합니다. `src/INTENT.md:11`의 공개 값 이름은 `outputValue`이며 현재 `SchemaNode.ts:168`의 getter와 같습니다. 패키지 `CLAUDE.md:70`의 이름도 같습니다. 메인 소유자 목록 `owner-queue-07.md:14`는 그 CLAUDE.md 이름 변경의 소유자 승인을 기록합니다.

B6의 `providers/RootNodeContext/type.ts:26`부터는 root·props·records·error·ready·prepared·reporter의 사용 수명을 각각 문서 주석으로 밝힙니다. RootBinding의 root와 reset도 `:46`부터 설명합니다. `createRootLoad.ts:12`부터는 props·reporter·mount와 반환 load의 버퍼링·실패 보관 조건을 적습니다. 실제 `:39`부터는 ready 전 보고를 records에 보관하고 `:59`부터 오류를 load.error에 보관합니다. 새 FormErrorService.load에도 `type.ts:10`의 JSDoc이 있습니다. 일정이나 수정 이력을 새 제품 주석으로 넣지 않았습니다.

139a·139b는 같은 후보 번들에 대한 문서 기록이며 둘 다 ADOPT, 표시·확인·차단 회귀 0행을 적습니다(`profile-139a-session.md:3`, `profile-139b-session.md:3`). 139a의 `:21`, `:49`부터와 보관된 번들 차분은 후보의 빌드 근거와 B4·B1 변경 범위를 구분합니다. `git diff 75fc421b4 HEAD -- packages/canard/schema-form/src`가 비어 있어 이후 문서 커밋이 제품을 다시 바꾸지 않았습니다. 성능 수치를 이번에 다시 측정하거나 기존 G26의 소유자 수용을 새로 인정하지는 않았습니다.

후속 커밋의 `git diff --check 6040aa3d9 HEAD`는 종료 코드 0이었습니다. 커밋 메시지에서 co-author·Claude 세션 표식·UUID 표식은 0개였습니다. 주석·이름·공개 경계와 관련하여 후속 수정이 새로 만든 위반은 확인하지 못했습니다. 이미 2단계에서 남긴 단언 승인 문제와 전체 FCA 검사 한계는 앞에서 별도로 유지했습니다.

관련 회귀 검사는 `S/head.config.mjs`의 unit·render·react18 프로젝트로 다음 12파일을 실행했습니다. `S/head-related.json`은 18개 프로젝트별 파일 결과와 207건 통과, 실패·보류 0, success true를 기록합니다. 실행 시간은 8.364초였고 종료 코드는 0입니다. 터미널 읽기의 별도 8건과 합하면 이번 HEAD 동작 확인은 215건입니다.

```sh
npx --offline --no-install vitest run --config "$S/head.config.mjs" --configLoader runner --project unit --project render --project react18 --reporter=json --outputFile "$S/head-related.json" \
  src/helpers/formTypeInputDefinition/__tests__/formTypeInputDefinitions.test.ts \
  src/helpers/formTypeInputDefinition/__tests__/formTypeInputMap.test.ts \
  src/helpers/formTypeInputDefinition/__tests__/inputBoundaryLayer.test.tsx \
  src/components/SchemaNode/SchemaNodeInput/__tests__/refreshBoundary.test.tsx \
  src/components/SchemaNode/SchemaNodeInput/__tests__/refreshGeneration.test.tsx \
  src/providers/FormErrorContext/__tests__/observerScopes.test.tsx \
  src/providers/RootNodeContext/__tests__/RootNodeContext.binding.test.tsx \
  src/providers/RootNodeContext/__tests__/RootNodeContext.errors.test.tsx \
  src/core/settle/__tests__/evaluateGate.path-counts.test.ts \
  src/core/settle/__tests__/selectChildren.head-differential.test.ts \
  src/core/settle/__tests__/selectChildren.metadata-counts.test.ts \
  src/core/settle/__tests__/selectChildren.plan-lookup-counts.test.ts
```

## 게이트 대조

G27에는 자동 CHECK가 없습니다. 원장 `:172`의 조건은 새 컨텍스트 verifier가 최초 기준선·원장·계획 대비 통과 판정을 내리는 것입니다. 아래의 증거와 남은 B1·B2 때문에 그 조건을 충족했다고 기록할 수 없습니다.

최초 기준선 네 문서는 `log.md:23`부터의 SHA-256 앞 12자와 같습니다. request는 `2d18c8e8f6ec`, ADR은 `3a0de74015f6`, verification은 `03921fe0fb80`, round-68-closing은 `eb4076c56b01`입니다. 현재 로컬 `origin/1.0.0-beta`의 동일 문서와 바이트도 같습니다. 기준선을 후속 구현에 맞춰 고친 것으로 해석할 근거는 없습니다.

| 게이트 | 원장 표시 | 이번 대조 결과 |
| --- | --- | --- |
| G13b | 닫혀 있습니다. | 최신 기록이 있으며 격리 스크립트도 현재 트리에서 1,685파일 통과입니다. 레거시 lint는 최신 기록을 재사용했습니다. |
| G17b | 닫혀 있습니다. | 행별 빈 칸·TBD가 0개이며 스토리 49행을 확인했습니다. 최신 기록과 같습니다. |
| G19b | 닫혀 있습니다. | 옛 평면 스토리와 임시 제외 표식이 0개이며 최신 기록과 같습니다. |
| G20 | 닫혀 있습니다. | `node verification/07-switch/tools/extract-migration-rows.mjs --check-complete verification/07-switch/migration-check.md`는 종료 코드 0과 130행 완료를 반환했습니다. |
| G23 | 열려 있습니다. | 소유자의 브라우저 확인 대기이며 이번 FAIL의 추가 사유로 세지 않았습니다. |
| G26 | 열려 있습니다. | 기존 수용 대기를 유지합니다. 139a·139b의 ADOPT가 이를 대신 충족하지 않습니다. |
| G27 | 열려 있습니다. | 이번 판정은 FAIL이며 질의 4항 외에도 B2가 남습니다. |
| G28 | 닫혀 있습니다. | `78841d697`의 최신 lint·형 검사 기록 뒤 대상 소스와 설정 차분이 없어 해당 기록을 재사용했습니다. |
| G29 | 닫혀 있습니다. | 최신 전체 시험·SCN·플러그인 단독 빌드 기록을 재사용했습니다. 이번 직접 실행 215건의 통과를 전체 묶음 재실행으로 확대하지 않았습니다. |
| G30 | 닫혀 있습니다. | `node ledger/checks/plan-links.mjs plan/README.md plan/*/*.md -- ledger/*.md`의 인자를 Node에서 같은 파일 집합으로 펼쳤으며 종료 코드 0과 `plan docs 56, cited ids 596, PR-defining LANDING items 36, problems 0`을 확인했습니다. |
| G31 | 닫혀 있습니다. | 변경 없는 소스의 최신 기록은 재사용했습니다. 이번 facts 환경의 재현은 indeterminate이며 통과로 바꾸지 않았습니다. |
| G32 | 닫힌 표시의 근거가 불충분합니다. | `f9ae05d5e`의 이전 결과만 남아 있어 B2를 닫지 못합니다. 현재 범위의 지정 담당자 대조와 근거 갱신이 필요합니다. |
| G33 | 열려 있습니다. | PR 생성 대기이며 이번 FAIL의 추가 사유로 세지 않았습니다. |

현재 원장은 G23·G26·G27·G33의 네 게이트를 열린 상태로 표시합니다. 그러나 G32의 닫힌 표시가 현재 범위를 입증하지 않으므로 네 개의 표시만 보고 다른 완료 조건이 모두 충족되었다고 판단하지 않았습니다. 이 보고서는 원장·계획·기록을 수정하거나 병합을 승인하는 문서가 아닙니다.

464라운드 가지 정리 보충: 이 문서가 인용한 미병합 후보 `302f2f8fb7b6`, `67d7a8e42993`, `75fc421b418c`, `9f6b4000fc5f`, `ad8cbd743f13`, `f9ae05d5ea5e`, `fba01cbeac90`의 필요한 내용은 [본선 보존물](../../_archive/branches/README.md)에 있습니다. 원래 SHA는 자료 식별자이며 가지 유지에 의존하지 않습니다.
