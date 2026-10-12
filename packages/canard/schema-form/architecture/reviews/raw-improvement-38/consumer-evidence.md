# Consumer evidence: schema-form src boundaries

Scope: 690 non-test .ts/.tsx files under src (excluding __legacy__, __tests__, *.test/*.spec). Import statements resolved: 2341 (static import, export-from, dynamic import with relative or `@/schema-form` specifiers). Unresolved internal specifiers: 0.
Fractal of a file = nearest ancestor directory with INTENT.md (src root has one, so it is the fallback). Entry = index.ts/index.tsx in the fractal directory. Edges inside one fractal are excluded from the edge table. Type-only imports are counted like value imports. Deep import = importer outside target fractal subtree AND target is not that fractal entry.

## 1. Fractals (64)

| Fractal | Entry | Named exports | `export *` |
|---|---|---|---|
| . | index.ts | 71 | ./types/rolled |
| app | NONE | - | - |
| app/plugin | index.ts | 4 | - |
| components/FallbackComponents | index.ts | 4 | - |
| components/Form | index.ts | 14 | - |
| components/SchemaNode | index.ts | 3 | - |
| components/SchemaNode/DeferrableNodeProxy | index.ts | 2 | - |
| components/SchemaNode/SchemaNodeInput | index.ts | 2 | - |
| components/SchemaNode/SchemaNodeProxy | index.ts | 2 | - |
| core | index.ts | 47 | - |
| core/SchemaNode | index.ts | 39 | - |
| core/behaviors | index.ts | 4 | - |
| core/behaviors/arrayBehavior | index.ts | 1 | - |
| core/behaviors/booleanBehavior | index.ts | 1 | - |
| core/behaviors/nullBehavior | index.ts | 1 | - |
| core/behaviors/numberBehavior | index.ts | 1 | - |
| core/behaviors/objectBehavior | index.ts | 1 | - |
| core/behaviors/stringBehavior | index.ts | 1 | - |
| core/behaviors/unionBehavior | index.ts | 1 | - |
| core/behaviors/virtualBehavior | index.ts | 1 | - |
| core/blueprint | index.ts | 33 | - |
| core/blueprint/utils/expressions/createDynamicFunction | index.ts | 2 | - |
| core/blueprint/utils/expressions/getPathManager | index.ts | 2 | - |
| core/dispatch | index.ts | 27 | - |
| core/navigation | index.ts | 3 | - |
| core/record | index.ts | 24 | - |
| core/settle | index.ts | 16 | - |
| core/settle/derive | index.ts | 9 | - |
| core/validation | index.ts | 15 | - |
| errors | index.ts | 0 | ./JSONSchemaError, ./SchemaFormError, ./UnhandledError, ./ValidationError, ./formErrorCode, ./type |
| formTypeDefinitions | index.tsx | 1 | - |
| helpers/defaultValue | index.ts | 0 | ./getDefaultValue, ./getEmptyValue, ./getObjectDefaultValue |
| helpers/defaultValue/getDefaultValue | index.ts | 1 | - |
| helpers/defaultValue/getEmptyValue | index.ts | 1 | - |
| helpers/defaultValue/getObjectDefaultValue | index.ts | 1 | - |
| helpers/dynamicExpression | index.ts | 0 | ./combineConditions, ./convertExpression |
| helpers/dynamicExpression/combineConditions | index.ts | 1 | - |
| helpers/dynamicExpression/convertExpression | index.ts | 2 | - |
| helpers/error | index.ts | 0 | ./formatErrorMessage, ./formatValidationError |
| helpers/error/formatErrorMessage | index.ts | 31 | - |
| helpers/error/formatValidationError | index.ts | 1 | - |
| helpers/formTypeInputDefinition | index.ts | 5 | - |
| helpers/jsonPointer | index.ts | 1 | ./utils |
| helpers/jsonSchema | index.ts | 7 | - |
| helpers/jsonSchema/extractSchemaInfo | index.ts | 1 | - |
| helpers/jsonSchema/getResolveSchema | index.ts | 2 | - |
| helpers/jsonSchema/isNullBranch | index.ts | 1 | - |
| helpers/jsonSchema/stripSchemaExtensions | index.ts | 1 | - |
| helpers/schemaIdentity | index.ts | 3 | - |
| helpers/schemaIntersection | index.ts | 7 | - |
| helpers/virtualization | index.ts | 6 | - |
| helpers/virtualization/VirtualizationManager | index.ts | 1 | - |
| helpers/virtualization/resolveVirtualizationOptions | index.ts | 6 | - |
| helpers/warning | index.ts | 10 | - |
| providers | index.ts | 15 | - |
| providers/ExternalFormContext | index.ts | 3 | - |
| providers/FormErrorContext | index.ts | 7 | - |
| providers/FormTypeInputsContext | index.ts | 2 | - |
| providers/FormTypeRendererContext | index.ts | 2 | - |
| providers/InputControlContext | index.ts | 2 | - |
| providers/RootNodeContext | index.ts | 4 | - |
| providers/VirtualizationContext | index.ts | 2 | - |
| providers/WorkspaceContext | index.ts | 2 | - |
| types/rolled | index.ts | 0 | ./form, ./formTypeRenderer, ./jsonSchema |

## 2. Fractal edges (210 distinct, 916 import statements)

| From | To | Total | Via entry | Via internal | Deep |
|---|---|---|---|---|---|
| core/settle | core/record | 151 | 151 | 0 | 0 |
| core/dispatch | core/record | 67 | 67 | 0 | 0 |
| core/settle | core/blueprint | 61 | 61 | 0 | 0 |
| core/dispatch | errors | 23 | 23 | 0 | 0 |
| core/dispatch | core/settle | 22 | 22 | 0 | 0 |
| core/settle | core | 19 | 0 | 19 | 0 |
| core/settle | errors | 18 | 18 | 0 | 0 |
| core/dispatch | core | 17 | 0 | 17 | 0 |
| core/settle/derive | core/record | 14 | 14 | 0 | 0 |
| formTypeDefinitions | . | 12 | 0 | 12 | 0 |
| core/SchemaNode | core/dispatch | 11 | 11 | 0 | 0 |
| core/behaviors | core/record | 11 | 11 | 0 | 0 |
| core/behaviors/objectBehavior | core/behaviors | 11 | 0 | 11 | 0 |
| core/dispatch | core/validation | 11 | 11 | 0 | 0 |
| core/behaviors/arrayBehavior | core/record | 10 | 10 | 0 | 0 |
| core/settle | core/settle/derive | 10 | 10 | 0 | 0 |
| core/validation | core/blueprint | 10 | 10 | 0 | 0 |
| helpers/error/formatErrorMessage | . | 10 | 0 | 10 | 0 |
| components/Form | . | 9 | 0 | 9 | 0 |
| components/SchemaNode/SchemaNodeInput | core | 9 | 9 | 0 | 0 |
| components/SchemaNode/SchemaNodeInput | . | 8 | 0 | 8 | 0 |
| core/behaviors/arrayBehavior | core/behaviors | 8 | 0 | 8 | 0 |
| . | core | 8 | 7 | 1 | 1 |
| providers/RootNodeContext | core | 8 | 8 | 0 | 0 |
| core/SchemaNode | core/blueprint | 7 | 7 | 0 | 0 |
| core/SchemaNode | core | 7 | 0 | 7 | 0 |
| core/behaviors | core/blueprint | 7 | 7 | 0 | 0 |
| core/record | core | 7 | 0 | 7 | 0 |
| components/Form | components/SchemaNode | 6 | 6 | 0 | 0 |
| core/SchemaNode | core/record | 6 | 6 | 0 | 0 |
| core/SchemaNode | core/validation | 6 | 6 | 0 | 0 |
| core/behaviors/booleanBehavior | core/behaviors | 6 | 0 | 6 | 0 |
| core/behaviors/nullBehavior | core/behaviors | 6 | 0 | 6 | 0 |
| core/behaviors/numberBehavior | core/behaviors | 6 | 0 | 6 | 0 |
| core/behaviors/stringBehavior | core/behaviors | 6 | 0 | 6 | 0 |
| core/behaviors/unionBehavior | core/behaviors | 6 | 0 | 6 | 0 |
| core/settle/derive | core/blueprint | 6 | 6 | 0 | 0 |
| core/validation | core/record | 6 | 6 | 0 | 0 |
| helpers/formTypeInputDefinition | . | 6 | 0 | 6 | 0 |
| components/Form | providers | 5 | 5 | 0 | 0 |
| core/behaviors/objectBehavior | core/record | 5 | 5 | 0 | 0 |
| core/settle/derive | core/settle | 5 | 0 | 5 | 0 |
| app/plugin | . | 4 | 1 | 3 | 0 |
| components/FallbackComponents | . | 4 | 0 | 4 | 0 |
| components/Form | core | 4 | 4 | 0 | 0 |
| components/SchemaNode/SchemaNodeProxy | . | 4 | 0 | 4 | 0 |
| core/behaviors/arrayBehavior | core/blueprint | 4 | 4 | 0 | 0 |
| core/behaviors/virtualBehavior | core/behaviors | 4 | 0 | 4 | 0 |
| core | core/SchemaNode | 4 | 4 | 0 | 0 |
| types/rolled | . | 4 | 0 | 4 | 0 |
| components/Form | app/plugin | 3 | 3 | 0 | 0 |
| components/SchemaNode/SchemaNodeInput | providers | 3 | 3 | 0 | 0 |
| components/SchemaNode/SchemaNodeInput | helpers/formTypeInputDefinition | 3 | 3 | 0 | 0 |
| components/SchemaNode/SchemaNodeInput | components/SchemaNode/SchemaNodeProxy | 3 | 3 | 0 | 0 |
| core/behaviors/virtualBehavior | core/record | 3 | 3 | 0 | 0 |
| core/blueprint | core/blueprint/utils/expressions/createDynamicFunction | 3 | 3 | 0 | 0 |
| core/blueprint | core/blueprint/utils/expressions/getPathManager | 3 | 3 | 0 | 0 |
| core/dispatch | core/navigation | 3 | 3 | 0 | 0 |
| core | core/validation | 3 | 3 | 0 | 0 |
| core/navigation | core/record | 3 | 3 | 0 | 0 |
| core/record | core/blueprint | 3 | 3 | 0 | 0 |
| core/settle | core/navigation | 3 | 3 | 0 | 0 |
| core/validation | errors | 3 | 3 | 0 | 0 |
| helpers/error/formatValidationError | . | 3 | 0 | 3 | 0 |
| helpers/formTypeInputDefinition | helpers/jsonPointer | 3 | 3 | 0 | 0 |
| helpers/jsonSchema/getResolveSchema | . | 3 | 0 | 3 | 0 |
| . | providers | 3 | 3 | 0 | 0 |
| providers/FormErrorContext | errors | 3 | 3 | 0 | 0 |
| providers/RootNodeContext | helpers/schemaIdentity | 3 | 3 | 0 | 0 |
| providers/RootNodeContext | providers/FormErrorContext | 3 | 3 | 0 | 0 |
| . | core/validation | 3 | 3 | 0 | 0 |
| app/plugin | helpers/error | 2 | 2 | 0 | 0 |
| components/Form | providers/FormErrorContext | 2 | 2 | 0 | 0 |
| components/Form | errors | 2 | 2 | 0 | 0 |
| components/SchemaNode/DeferrableNodeProxy | core | 2 | 2 | 0 | 0 |
| components/SchemaNode/DeferrableNodeProxy | . | 2 | 0 | 2 | 0 |
| components/SchemaNode/SchemaNodeProxy | core | 2 | 2 | 0 | 0 |
| components/SchemaNode | components/SchemaNode/SchemaNodeProxy | 2 | 2 | 0 | 0 |
| core/SchemaNode | errors | 2 | 2 | 0 | 0 |
| core/SchemaNode | core/behaviors | 2 | 2 | 0 | 0 |
| core/blueprint | helpers/jsonPointer | 2 | 2 | 0 | 0 |
| core/blueprint | helpers/schemaIntersection | 2 | 2 | 0 | 0 |
| core/blueprint/utils/expressions/createDynamicFunction | core/blueprint/utils/expressions/getPathManager | 2 | 2 | 0 | 0 |
| core/blueprint | core | 2 | 0 | 2 | 0 |
| core/dispatch | core/blueprint | 2 | 2 | 0 | 0 |
| core/record | errors | 2 | 2 | 0 | 0 |
| core/settle | core/validation | 2 | 2 | 0 | 0 |
| core/settle | core/behaviors | 2 | 2 | 0 | 0 |
| core | app | 2 | 0 | 2 | 2 |
| helpers/jsonSchema/stripSchemaExtensions | . | 2 | 0 | 2 | 0 |
| helpers/virtualization | helpers/virtualization/resolveVirtualizationOptions | 2 | 2 | 0 | 0 |
| . | components/SchemaNode | 2 | 2 | 0 | 0 |
| . | components/Form | 2 | 2 | 0 | 0 |
| . | app | 2 | 0 | 2 | 2 |
| . | helpers/virtualization | 2 | 2 | 0 | 0 |
| providers/ExternalFormContext | core | 2 | 2 | 0 | 0 |
| providers/ExternalFormContext | helpers/formTypeInputDefinition | 2 | 2 | 0 | 0 |
| providers/ExternalFormContext | . | 2 | 0 | 2 | 0 |
| providers/FormErrorContext | core | 2 | 2 | 0 | 0 |
| providers/FormTypeInputsContext | helpers/formTypeInputDefinition | 2 | 2 | 0 | 0 |
| providers/FormTypeRendererContext | . | 2 | 0 | 2 | 0 |
| providers/FormTypeRendererContext | providers/ExternalFormContext | 2 | 2 | 0 | 0 |
| providers/RootNodeContext | components/Form | 2 | 2 | 0 | 0 |
| providers/VirtualizationContext | helpers/virtualization | 2 | 2 | 0 | 0 |
| providers/WorkspaceContext | . | 2 | 0 | 2 | 0 |
| providers | providers/ExternalFormContext | 2 | 2 | 0 | 0 |
| app/plugin | components/FallbackComponents | 1 | 1 | 0 | 0 |
| app/plugin | formTypeDefinitions | 1 | 1 | 0 | 0 |
| app/plugin | helpers/formTypeInputDefinition | 1 | 1 | 0 | 0 |
| app/plugin | errors | 1 | 1 | 0 | 0 |
| components/Form | providers/RootNodeContext | 1 | 1 | 0 | 0 |
| components/Form | helpers/virtualization | 1 | 1 | 0 | 0 |
| components/SchemaNode/DeferrableNodeProxy | providers/FormErrorContext | 1 | 1 | 0 | 0 |
| components/SchemaNode/DeferrableNodeProxy | helpers/virtualization | 1 | 1 | 0 | 0 |
| components/SchemaNode/DeferrableNodeProxy | components/SchemaNode/SchemaNodeProxy | 1 | 1 | 0 | 0 |
| components/SchemaNode/SchemaNodeInput | app | 1 | 0 | 1 | 1 |
| components/SchemaNode/SchemaNodeInput | providers/RootNodeContext | 1 | 1 | 0 | 0 |
| components/SchemaNode/SchemaNodeInput | components/SchemaNode/DeferrableNodeProxy | 1 | 1 | 0 | 0 |
| components/SchemaNode/SchemaNodeInput | app/plugin | 1 | 1 | 0 | 0 |
| components/SchemaNode/SchemaNodeInput | providers/FormErrorContext | 1 | 1 | 0 | 0 |
| components/SchemaNode/SchemaNodeProxy | app | 1 | 0 | 1 | 1 |
| components/SchemaNode/SchemaNodeProxy | providers | 1 | 1 | 0 | 0 |
| components/SchemaNode/SchemaNodeProxy | providers/FormErrorContext | 1 | 1 | 0 | 0 |
| components/SchemaNode/SchemaNodeProxy | components/SchemaNode/SchemaNodeInput | 1 | 1 | 0 | 0 |
| components/SchemaNode | components/SchemaNode/SchemaNodeInput | 1 | 1 | 0 | 0 |
| core/SchemaNode | core/navigation | 1 | 1 | 0 | 0 |
| core/SchemaNode | core/settle | 1 | 1 | 0 | 0 |
| core/SchemaNode | . | 1 | 0 | 1 | 0 |
| core/behaviors | core/behaviors/arrayBehavior | 1 | 1 | 0 | 0 |
| core/behaviors | core/behaviors/booleanBehavior | 1 | 1 | 0 | 0 |
| core/behaviors | core/behaviors/nullBehavior | 1 | 1 | 0 | 0 |
| core/behaviors | core/behaviors/numberBehavior | 1 | 1 | 0 | 0 |
| core/behaviors | core/behaviors/objectBehavior | 1 | 1 | 0 | 0 |
| core/behaviors | core/behaviors/stringBehavior | 1 | 1 | 0 | 0 |
| core/behaviors | core/behaviors/unionBehavior | 1 | 1 | 0 | 0 |
| core/behaviors | core/behaviors/virtualBehavior | 1 | 1 | 0 | 0 |
| core/behaviors/booleanBehavior | core/record | 1 | 1 | 0 | 0 |
| core/behaviors/nullBehavior | core/record | 1 | 1 | 0 | 0 |
| core/behaviors/numberBehavior | core/record | 1 | 1 | 0 | 0 |
| core/behaviors/stringBehavior | core/record | 1 | 1 | 0 | 0 |
| core/behaviors/unionBehavior | core/record | 1 | 1 | 0 | 0 |
| core/behaviors | errors | 1 | 1 | 0 | 0 |
| core/blueprint | errors | 1 | 1 | 0 | 0 |
| core/blueprint/utils/expressions/createDynamicFunction | errors | 1 | 1 | 0 | 0 |
| core/blueprint/utils/expressions/createDynamicFunction | helpers/error | 1 | 1 | 0 | 0 |
| core/blueprint/utils/expressions/createDynamicFunction | core/blueprint | 1 | 0 | 1 | 0 |
| core/blueprint/utils/expressions/getPathManager | helpers/jsonPointer | 1 | 1 | 0 | 0 |
| core | errors | 1 | 1 | 0 | 0 |
| core | . | 1 | 0 | 1 | 0 |
| core | core/blueprint | 1 | 1 | 0 | 0 |
| core/settle/derive | core | 1 | 0 | 1 | 0 |
| core/validation | core | 1 | 0 | 1 | 0 |
| formTypeDefinitions | core | 1 | 1 | 0 | 0 |
| helpers/defaultValue/getDefaultValue | helpers/jsonSchema | 1 | 1 | 0 | 0 |
| helpers/defaultValue/getDefaultValue | . | 1 | 0 | 1 | 0 |
| helpers/defaultValue/getDefaultValue | helpers/defaultValue/getEmptyValue | 1 | 1 | 0 | 0 |
| helpers/defaultValue/getEmptyValue | . | 1 | 0 | 1 | 0 |
| helpers/defaultValue/getObjectDefaultValue | . | 1 | 0 | 1 | 0 |
| helpers/defaultValue | helpers/defaultValue/getDefaultValue | 1 | 1 | 0 | 0 |
| helpers/defaultValue | helpers/defaultValue/getEmptyValue | 1 | 1 | 0 | 0 |
| helpers/defaultValue | helpers/defaultValue/getObjectDefaultValue | 1 | 1 | 0 | 0 |
| helpers/dynamicExpression/convertExpression | helpers/jsonPointer | 1 | 1 | 0 | 0 |
| helpers/dynamicExpression/convertExpression | . | 1 | 0 | 1 | 0 |
| helpers/dynamicExpression | helpers/dynamicExpression/combineConditions | 1 | 1 | 0 | 0 |
| helpers/dynamicExpression | helpers/dynamicExpression/convertExpression | 1 | 1 | 0 | 0 |
| helpers/error/formatErrorMessage | app/plugin | 1 | 1 | 0 | 0 |
| helpers/error | helpers/error/formatErrorMessage | 1 | 1 | 0 | 0 |
| helpers/error | helpers/error/formatValidationError | 1 | 1 | 0 | 0 |
| helpers/formTypeInputDefinition | errors | 1 | 1 | 0 | 0 |
| helpers/formTypeInputDefinition | helpers/error | 1 | 1 | 0 | 0 |
| helpers/formTypeInputDefinition | providers/FormErrorContext | 1 | 1 | 0 | 0 |
| helpers/jsonSchema/extractSchemaInfo | . | 1 | 0 | 1 | 0 |
| helpers/jsonSchema | . | 1 | 0 | 1 | 0 |
| helpers/jsonSchema | helpers/jsonSchema/extractSchemaInfo | 1 | 1 | 0 | 0 |
| helpers/jsonSchema | helpers/jsonSchema/getResolveSchema | 1 | 1 | 0 | 0 |
| helpers/jsonSchema | helpers/jsonSchema/isNullBranch | 1 | 1 | 0 | 0 |
| helpers/jsonSchema | helpers/jsonSchema/stripSchemaExtensions | 1 | 1 | 0 | 0 |
| helpers/jsonSchema/isNullBranch | helpers/jsonSchema/extractSchemaInfo | 1 | 1 | 0 | 0 |
| helpers/jsonSchema/isNullBranch | . | 1 | 0 | 1 | 0 |
| helpers/schemaIdentity | core | 1 | 1 | 0 | 0 |
| helpers/schemaIdentity | . | 1 | 0 | 1 | 0 |
| helpers/virtualization/VirtualizationManager | core | 1 | 1 | 0 | 0 |
| helpers/virtualization/VirtualizationManager | helpers/error | 1 | 1 | 0 | 0 |
| helpers/virtualization/VirtualizationManager | helpers/warning | 1 | 1 | 0 | 0 |
| helpers/virtualization/VirtualizationManager | providers/FormErrorContext | 1 | 1 | 0 | 0 |
| helpers/virtualization/VirtualizationManager | helpers/virtualization/resolveVirtualizationOptions | 1 | 1 | 0 | 0 |
| helpers/virtualization | helpers/virtualization/VirtualizationManager | 1 | 1 | 0 | 0 |
| helpers/virtualization/resolveVirtualizationOptions | core | 1 | 1 | 0 | 0 |
| . | app/plugin | 1 | 1 | 0 | 0 |
| . | errors | 1 | 1 | 0 | 0 |
| . | helpers/jsonPointer | 1 | 1 | 0 | 0 |
| . | types/rolled | 1 | 1 | 0 | 0 |
| providers/FormTypeInputsContext | components/Form | 1 | 1 | 0 | 0 |
| providers/FormTypeRendererContext | core | 1 | 1 | 0 | 0 |
| providers/FormTypeRendererContext | components/Form | 1 | 1 | 0 | 0 |
| providers/FormTypeRendererContext | app/plugin | 1 | 1 | 0 | 0 |
| providers/RootNodeContext | app/plugin | 1 | 1 | 0 | 0 |
| providers/RootNodeContext | providers/ExternalFormContext | 1 | 1 | 0 | 0 |
| providers/RootNodeContext | providers/WorkspaceContext | 1 | 1 | 0 | 0 |
| providers/RootNodeContext | errors | 1 | 1 | 0 | 0 |
| providers/VirtualizationContext | components/Form | 1 | 1 | 0 | 0 |
| providers/WorkspaceContext | components/Form | 1 | 1 | 0 | 0 |
| providers/WorkspaceContext | providers/ExternalFormContext | 1 | 1 | 0 | 0 |
| providers | providers/FormTypeInputsContext | 1 | 1 | 0 | 0 |
| providers | providers/FormTypeRendererContext | 1 | 1 | 0 | 0 |
| providers | providers/InputControlContext | 1 | 1 | 0 | 0 |
| providers | providers/RootNodeContext | 1 | 1 | 0 | 0 |
| providers | providers/VirtualizationContext | 1 | 1 | 0 | 0 |
| providers | providers/WorkspaceContext | 1 | 1 | 0 | 0 |
| types/rolled | components/Form | 1 | 1 | 0 | 0 |

### Deep imports (7 statements across 5 edges)

- **core → app** (2)
  - core/types/state.ts → app/constants/index.ts
  - core/types/value.ts → app/constants/index.ts
- **. → app** (2)
  - hooks/useSchemaNodeTracker.ts → app/constants/index.ts
  - types/error.ts → app/constants/index.ts
- **. → core** (1)
  - types/jsonSchema.ts → core/types/jsonSchema.ts
- **components/SchemaNode/SchemaNodeInput → app** (1)
  - components/SchemaNode/SchemaNodeInput/SchemaNodeInput.tsx → app/constants/index.ts
- **components/SchemaNode/SchemaNodeProxy → app** (1)
  - components/SchemaNode/SchemaNodeProxy/SchemaNodeProxy.tsx → app/constants/index.ts

## 3. core/SchemaNode

Importers outside core/SchemaNode: 4 statements from 2 files.

- core [entry]: 4 (e.g. core/index.ts → core/SchemaNode/index.ts; core/index.ts → core/SchemaNode/index.ts)

Targets imported by core/SchemaNode outside it: 44 statements, by target fractal:

- core/dispatch [entry]: 11 from 10 files (e.g. core/SchemaNode/SchemaNode.ts → core/dispatch/index.ts; core/SchemaNode/SchemaNode.ts → core/dispatch/index.ts)
- core/blueprint [entry]: 7 from 5 files (e.g. core/SchemaNode/SchemaNode.ts → core/blueprint/index.ts; core/SchemaNode/type.ts → core/blueprint/index.ts)
- core [internal]: 7 from 4 files (e.g. core/SchemaNode/SchemaNode.ts → core/types/state.ts; core/SchemaNode/type.ts → core/types/state.ts)
- core/record [entry]: 6 from 4 files (e.g. core/SchemaNode/SchemaNode.ts → core/record/index.ts; core/SchemaNode/SchemaNode.ts → core/record/index.ts)
- core/validation [entry]: 6 from 4 files (e.g. core/SchemaNode/SchemaNode.ts → core/validation/index.ts; core/SchemaNode/SchemaNode.ts → core/validation/index.ts)
- errors [entry]: 2 from 2 files (e.g. core/SchemaNode/utils/binding/buildSchemaNodeTree.ts → errors/index.ts; core/SchemaNode/utils/schemaNodeFactory.ts → errors/index.ts)
- core/behaviors [entry]: 2 from 2 files (e.g. core/SchemaNode/utils/binding/interpretSchemaNodeDraft.ts → core/behaviors/index.ts; core/SchemaNode/utils/schemaNodeFactory.ts → core/behaviors/index.ts)
- core/navigation [entry]: 1 from 1 files (e.g. core/SchemaNode/SchemaNode.ts → core/navigation/index.ts)
- core/settle [entry]: 1 from 1 files (e.g. core/SchemaNode/SchemaNode.ts → core/settle/index.ts)
- . [internal]: 1 from 1 files (e.g. core/SchemaNode/utils/binding/buildSchemaNodeTree.ts → types/value.ts)

Internal-file (non-entry) targets imported by core/SchemaNode:
- core/types/state.ts: 3
- core/types/value.ts: 1
- types/value.ts: 1
- core/types/jsonSchema.ts: 1
- core/utils/pathIndex/PathKeyedMap.ts: 1
- core/utils/pathIndex/PathKeyedSet.ts: 1

### core-internal matrix (unit = first directory under core; row imports column; statement counts)

| from \ to | (root files) | SchemaNode | behaviors | blueprint | dispatch | navigation | record | settle | types | utils | validation |
|---|---|---|---|---|---|---|---|---|---|---|---|
| (root files) |  | 4 |  | 1 |  |  |  |  | 4 |  | 3 |
| SchemaNode |  |  | 2 | 7 | 11 | 1 | 6 | 1 | 5 | 2 | 6 |
| behaviors |  |  |  | 11 |  |  | 34 |  |  |  |  |
| blueprint |  |  |  |  |  |  |  |  |  | 2 |  |
| dispatch |  |  |  | 2 |  | 3 | 67 | 22 | 17 |  | 11 |
| navigation |  |  |  |  |  |  | 3 |  |  |  |  |
| record |  |  |  | 3 |  |  |  |  | 5 | 2 |  |
| settle |  |  | 2 | 67 |  | 3 | 165 |  | 11 | 9 | 2 |
| types |  |  |  |  |  |  |  |  |  |  |  |
| utils |  |  |  |  |  |  |  |  |  |  |  |
| validation |  |  |  | 10 |  |  | 6 |  | 1 |  |  |

core-unit cycles (SCCs >1): none

## 4. Consumers of core

### components: 17 statements into core, 1 distinct targets
- ENTRY core/index.ts: 17 (16 files)

### providers: 13 statements into core, 1 distinct targets
- ENTRY core/index.ts: 13 (13 files)

### hooks: 4 statements into core, 1 distinct targets
- ENTRY core/index.ts: 4 (4 files)

### helpers: 3 statements into core, 1 distinct targets
- ENTRY core/index.ts: 3 (3 files)

### app: 0 statements into core, 0 distinct targets

## 5. Fractal cycles

Fractals with outgoing cross-fractal edges: 57. Strongly connected components with >1 member: 1.
- SCC size 45: core/settle/derive, core/behaviors/virtualBehavior, core/behaviors/unionBehavior, core/behaviors/stringBehavior, core/behaviors/objectBehavior, core/behaviors/numberBehavior, core/behaviors/nullBehavior, core/behaviors/booleanBehavior, core/behaviors/arrayBehavior, core/behaviors, core/navigation, helpers/error/formatValidationError, types/rolled, providers/VirtualizationContext, providers/FormTypeRendererContext, helpers/virtualization/VirtualizationManager, helpers/virtualization/resolveVirtualizationOptions, helpers/virtualization, components/SchemaNode/DeferrableNodeProxy, providers/WorkspaceContext, formTypeDefinitions, components/FallbackComponents, app/plugin, helpers/schemaIdentity, providers/RootNodeContext, components/SchemaNode/SchemaNodeInput, components/SchemaNode/SchemaNodeProxy, components/SchemaNode, components/Form, providers/FormTypeInputsContext, providers/FormErrorContext, helpers/formTypeInputDefinition, providers/ExternalFormContext, providers, ., helpers/error/formatErrorMessage, helpers/error, core/blueprint/utils/expressions/createDynamicFunction, core/blueprint, core/validation, core/dispatch, core/SchemaNode, core, core/record, core/settle
  - shortest cycle: core/settle/derive → core/settle → core/settle/derive

Mutual (2-cycle) pairs: 19
- core/settle <-> core/settle/derive (ancestor/descendant)
- core/behaviors <-> core/behaviors/arrayBehavior (ancestor/descendant)
- core/behaviors <-> core/behaviors/booleanBehavior (ancestor/descendant)
- core/behaviors <-> core/behaviors/nullBehavior (ancestor/descendant)
- core/behaviors <-> core/behaviors/numberBehavior (ancestor/descendant)
- core/behaviors <-> core/behaviors/objectBehavior (ancestor/descendant)
- core/behaviors <-> core/behaviors/stringBehavior (ancestor/descendant)
- core/behaviors <-> core/behaviors/unionBehavior (ancestor/descendant)
- core/behaviors <-> core/behaviors/virtualBehavior (ancestor/descendant)
- components/Form <-> providers/RootNodeContext
- components/SchemaNode/SchemaNodeInput <-> components/SchemaNode/SchemaNodeProxy
- . <-> core (ancestor/descendant)
- . <-> components/Form (ancestor/descendant)
- . <-> app/plugin (ancestor/descendant)
- . <-> types/rolled (ancestor/descendant)
- core <-> core/SchemaNode (ancestor/descendant)
- core <-> core/validation (ancestor/descendant)
- core <-> core/blueprint (ancestor/descendant)
- core/blueprint <-> core/blueprint/utils/expressions/createDynamicFunction (ancestor/descendant)

Excluding ancestor/descendant edges: SCCs >1 = 2
- SCC size 3: providers/WorkspaceContext, providers/RootNodeContext, components/Form; shortest: providers/RootNodeContext → components/Form → providers/RootNodeContext
- SCC size 3: components/SchemaNode/DeferrableNodeProxy, components/SchemaNode/SchemaNodeProxy, components/SchemaNode/SchemaNodeInput; shortest: components/SchemaNode/SchemaNodeProxy → components/SchemaNode/SchemaNodeInput → components/SchemaNode/SchemaNodeProxy

## 6. Organs imported from outside their owning fractal (2)

Organ names considered: components, utils, types, hooks, helpers, lib, styles, assets, constants, test, tests, spec, specs, fixtures, e2e, shared, common; directory without INTENT.md; owner = nearest fractal above; organ = outermost such directory under the owner.

- **app/constants** (owner app): 6 statements from 6 files
  - components/SchemaNode/SchemaNodeInput/SchemaNodeInput.tsx
  - components/SchemaNode/SchemaNodeProxy/SchemaNodeProxy.tsx
  - core/types/state.ts
  - core/types/value.ts
  - hooks/useSchemaNodeTracker.ts
  - ... 1 more
- **core/types** (owner core): 1 statements from 1 files
  - types/jsonSchema.ts

### Supplementary: organs whose outside importers' lowest common fractal is strictly below the owner (0)


## Top internal (non-entry) files

Cross-fractal statements, target not its fractal entry:
- types/index.ts: 70
- core/types/value.ts: 21
- core/types/state.ts: 17
- core/utils/pathIndex/PathKeyedMap.ts: 9
- core/behaviors/utils/slots/finishNoInput.ts: 8

Deep only (importer outside target subtree):
- app/constants/index.ts: 6
- core/types/jsonSchema.ts: 1

Any importer including same-fractal, target not an entry:
- types/index.ts: 74
- core/settle/type.ts: 71
- core/blueprint/type.ts: 52
- core/types/value.ts: 21
- core/blueprint/utils/analyze/type.ts: 21

