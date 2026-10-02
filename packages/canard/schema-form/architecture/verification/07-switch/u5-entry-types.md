# U5 진입점·형 전환 검증

- 시작 HEAD: `a0d30bb36`; 검증 HEAD: `2275edead`. 작업 도중 다른 작업의 HEAD 이동을 확인했으며, 이 작업에서는 commit/push/stash/reset/checkout/install을 실행하지 않았습니다.
- 범위: 실행 계획 U5. 렌더 구현 변경은 FormGroupProps의 형 이름 변경 1건뿐입니다.
- 기존 사용자 변경은 보존했습니다.

## 변경 그룹

- core: 새 엔진 named re-export, D3 호스트 생성·마운트 진입, React 독립 JSONSchema 형, INTENT 경계, 레거시 node/constructor 형 제거.
- 공개 형: src/index.ts 노드·가드·이벤트 전환, JSONSchema.presentation 바인딩, Hint/FormTypeInputProps 메타데이터, FormTypeTestObject.schemaType, Validator 객체 계약.
- 렌더 형: ChildNodeComponentProps·FormGroupProps의 FormTypeGroupRenderer 이름.
- 린트: core 전체의 app/plugin 금지, src 전체의 __legacy__ 금지(레거시 자신 제외).
- 시험: NODE-058·SURFACE-059·REACT-032·GOAL-088 타입 검사, 호스트 마운트·검증 미룸 시험, 기존 입력 형 시험의 새 필수 메타데이터.

## 레거시 보존

- core/types/node.ts·constructor.ts → src/__legacy__/core/types/. event/state/value는 core에 유지하고 레거시 형 진입점에서 재사용합니다.
- 기존 nodeFromJSONSchema와 contextNodeFactory 내보내기 → src/__legacy__/core/nodeFromJSONSchema.ts 및 core/index.ts.
- 기존 JSONSchema·ValidateFunction·ValidatorFactory → src/__legacy__/types/. 기존 스키마 해석·확장 제거 helpers/jsonSchema도 보존해 레거시 소비자를 연결했습니다.
- 레거시 구현과 시험의 import만 보존된 경로로 전환했습니다.

## 검증

- `npx vitest run --project unit --reporter=dot src/core`: 218파일, 1,619건 통과, 기존 TODO 1건.
- `npx vitest run --project unit --reporter=dot src/types`: 5파일, 47건 통과.
- 변경 전 새 호스트 시험 2건과 공개 타입 시험이 실패했고, 변경 후 통과했습니다.
- 독립 검토의 표준 스키마 키워드·재귀 presentation 타입 지적 2건을 수정한 뒤 동일 probe 재검토를 통과했습니다.
- `grep -rn "__legacy__" src/core/index.ts src/core/nodeFromJSONSchema.ts src/index.ts`: 출력 없음.
- `npx tsc --noEmit --composite false --rootDir . -p tsconfig.json`: 종료 2; 536건. core/types/index.ts/__legacy__ 오류 0건.
- 현행 tsconfig는 stories와 bench도 검사합니다. 해당 경로 오류는 U5 범위 밖으로 별도 기록했으며, 검사에서 제외하거나 호환 별칭으로 숨기지 않았습니다.

## 디렉터리별 TypeScript 오류

| 디렉터리 | 오류 수 |
| --- | ---: |
| `bench` | 3 |
| `src/__tests__` | 33 |
| `src/app` | 5 |
| `src/components` | 145 |
| `src/formTypeDefinitions` | 23 |
| `src/helpers` | 173 |
| `src/hooks` | 12 |
| `src/providers` | 11 |
| `stories` | 131 |

## 파일별 TypeScript 오류

| 파일 | 오류 수 |
| --- | ---: |
| `bench/dispatch-and-validation.bench.ts` | 2 |
| `bench/node-and-settle.bench.ts` | 1 |
| `src/__tests__/renderForm.tsx` | 7 |
| `src/__tests__/scenarios/controlled-interaction.render.test.tsx` | 7 |
| `src/__tests__/scenarios/formType-resolution.render.test.tsx` | 4 |
| `src/__tests__/scenarios/nullable.object-pending-read-readers.render.test.tsx` | 2 |
| `src/__tests__/scenarios/nullable.object-pending-read.render.test.tsx` | 1 |
| `src/__tests__/scenarios/refSchema-context-provider.render.test.tsx` | 2 |
| `src/__tests__/scenarios/refresh.uncontrolled-value.render.test.tsx` | 2 |
| `src/__tests__/scenarios/reset.pristine.render.test.tsx` | 1 |
| `src/__tests__/scenarios/schema-props-renderer.render.test.tsx` | 2 |
| `src/__tests__/scenarios/state-management.render.test.tsx` | 2 |
| `src/__tests__/scenarios/validation.async-race.render.test.tsx` | 3 |
| `src/app/plugin/PluginManager.ts` | 1 |
| `src/app/plugin/__tests__/registerPlugin.test.ts` | 2 |
| `src/app/plugin/__tests__/validatorConformance.test.ts` | 2 |
| `src/components/FallbackComponents/FormGroupRenderer.tsx` | 1 |
| `src/components/Form/Form.tsx` | 14 |
| `src/components/Form/components/FormChildrenRenderer.tsx` | 1 |
| `src/components/SchemaNode/DeferrableNodeProxy/DeferrableNodeProxy.tsx` | 4 |
| `src/components/SchemaNode/SchemaNodeInput/SchemaNodeInput.tsx` | 5 |
| `src/components/SchemaNode/SchemaNodeInput/hooks/useChildNodeComponents.tsx` | 5 |
| `src/components/SchemaNode/SchemaNodeInput/hooks/useFormTypeInput.ts` | 5 |
| `src/components/SchemaNode/SchemaNodeInput/hooks/useFormTypeInputControl.ts` | 1 |
| `src/components/SchemaNode/SchemaNodeInput/type.ts` | 5 |
| `src/components/SchemaNode/SchemaNodeProxy/SchemaNodeProxy.tsx` | 2 |
| `src/components/SchemaNode/__tests__/SchemaNodePropsFlow.fixtures.tsx` | 14 |
| `src/components/SchemaNode/__tests__/SchemaNodePropsFlow.test.tsx` | 1 |
| `src/components/__tests__/SchemaNodeProxy.refresh.test.tsx` | 87 |
| `src/formTypeDefinitions/FormTypeInputArray.tsx` | 3 |
| `src/formTypeDefinitions/FormTypeInputBoolean.tsx` | 1 |
| `src/formTypeDefinitions/FormTypeInputDateFormat.tsx` | 1 |
| `src/formTypeDefinitions/FormTypeInputNumber.tsx` | 2 |
| `src/formTypeDefinitions/FormTypeInputObject.tsx` | 1 |
| `src/formTypeDefinitions/FormTypeInputString.tsx` | 1 |
| `src/formTypeDefinitions/FormTypeInputStringCheckbox.tsx` | 1 |
| `src/formTypeDefinitions/FormTypeInputStringEnum.tsx` | 1 |
| `src/formTypeDefinitions/FormTypeInputStringRadio.tsx` | 1 |
| `src/formTypeDefinitions/FormTypeInputVirtual.tsx` | 1 |
| `src/formTypeDefinitions/index.tsx` | 10 |
| `src/helpers/error/__tests__/formatErrorMessage.test.ts` | 1 |
| `src/helpers/error/formatValidationError/formatValidationError.ts` | 1 |
| `src/helpers/formTypeInputDefinition/__tests__/formTypeInputDefinitions.test.ts` | 1 |
| `src/helpers/formTypeInputDefinition/__tests__/formTypeInputMap.test.ts` | 121 |
| `src/helpers/jsonSchema/__tests__/extractSchemaInfo.test.ts` | 48 |
| `src/helpers/jsonSchema/getResolveSchema/utils/getResolveSchemaScanner.ts` | 1 |
| `src/hooks/__tests__/useSchemaNodeTracker.test.tsx` | 1 |
| `src/hooks/useChildNodeErrors.ts` | 7 |
| `src/hooks/useSchemaNodeSubscribe.ts` | 1 |
| `src/hooks/useSchemaNodeTracker.ts` | 3 |
| `src/providers/FormTypeRendererContext/FormTypeRendererProvider.tsx` | 1 |
| `src/providers/RootNodeContext/RootNodeContextProvider.tsx` | 10 |
| `stories/02.TerminalMode.stories.tsx` | 11 |
| `stories/03.FormTypeInput.stories.tsx` | 6 |
| `stories/05.WatchValues.stories.tsx` | 2 |
| `stories/06.IfThenElse.stories.tsx` | 3 |
| `stories/07.FormRefHandle.stories.tsx` | 9 |
| `stories/08.VirtualSchema.stories.tsx` | 7 |
| `stories/09.NullSchema.stories.tsx` | 3 |
| `stories/10.DefaultValue.stories.tsx` | 1 |
| `stories/13.FormError.stories.tsx` | 3 |
| `stories/14.ExternalProvider.stories.tsx` | 3 |
| `stories/15.NodeState.stories.tsx` | 2 |
| `stories/17.OneOf.stories.tsx` | 14 |
| `stories/19.SubmitUsecase.stories.tsx` | 2 |
| `stories/21.Validation.stories.tsx` | 18 |
| `stories/21.ValidationExtended.stories.tsx` | 11 |
| `stories/26.UploadFileUsecase.stories.tsx` | 1 |
| `stories/28.NullableUsecase.stories.tsx` | 2 |
| `stories/29.VisibleUsecase.stories.tsx` | 1 |
| `stories/30.AllOfSchemaUsecase.stories.tsx` | 2 |
| `stories/31.AnyOf.stories.tsx` | 3 |
| `stories/32.DynamicObjectFormType.stories.tsx` | 1 |
| `stories/33.FormTypeRendererPropsWithReactNode.stories.tsx` | 3 |
| `stories/35.PrefixItems.stories.tsx` | 2 |
| `stories/37.Pristine.stories.tsx` | 11 |
| `stories/38.StateManagement.stories.tsx` | 3 |
| `stories/41.OmitTrailing.stories.tsx` | 2 |
| `stories/42.NullableContract.stories.tsx` | 1 |
| `stories/43.NullBranchPattern.stories.tsx` | 2 |
| `stories/FormTypeInput.DefaultFormTypeInput.stories.tsx` | 1 |
| `stories/components/validator/index.ts` | 1 |
