# filid digest: schema-form/src

Sources: scan artifact `a60b49e7e3b40bc653d1dd98d42f7d747e733715fd45a53219950a4271db2be7.json`, validate artifact `a19b102ef6a70ac289e1ab07ed609fd28700f83597ec5b0665b3dfd6128153fd.json` (snapshot `0d697381f2bc481be5021a765e10b72b3a01a95c997454b209d1493b49b12a1f`).

**Caveat that shapes everything below.** Neither artifact carries per-node records. The scan file has only `projectRoot, status, summary, diagnostics` (status `indeterminate`); the validate file has `data.result.violations` (65 records: `ruleId, severity, message, path, certainty, suggestion`) and the same 479 diagnostics. So the fractal and organ tables in sections 1 and 2 are **reconstructed from the filesystem** with the filid classification rules (INTENT.md, then DETAIL.md, then organ names), not read from the artifacts. Check: reconstruction gives 64 non-legacy fractals (matches the scan) but 207 organs against the scan's 211 (4 unexplained). The scan covers **no `__legacy__` path at all** (0 of 479 diagnostics), so the legacy tables are filesystem-only and outside the artifact totals. `.claude/` under src is excluded.

## 1. Fractals

### 1a. Non-legacy (64, matches scan total)

| fractal (rel. to src) | classified by | entry point | depth | child fractals | direct organ dirs |
|---|---|---|---|---|---|
| `(src root)` | INTENT.md | `index.ts` (facts unavailable) | 0 | 5 | 6 |
| `app` | INTENT.md | none found | 1 | 1 | 1 |
| `app/plugin` | INTENT.md | `index.ts` (facts unavailable) | 2 | 0 | 1 |
| `components/FallbackComponents` | INTENT.md | `index.ts` (facts unavailable) | 2 | 0 | 0 |
| `components/Form` | INTENT.md | `index.ts` (facts unavailable) | 2 | 0 | 3 |
| `components/SchemaNode` | INTENT.md | `index.ts` (facts unavailable) | 2 | 3 | 2 |
| `components/SchemaNode/DeferrableNodeProxy` | INTENT.md | `index.ts` (facts unavailable) | 3 | 0 | 1 |
| `components/SchemaNode/SchemaNodeInput` | INTENT.md | `index.ts` (facts unavailable) | 3 | 0 | 2 |
| `components/SchemaNode/SchemaNodeProxy` | INTENT.md | `index.ts` (facts unavailable) | 3 | 0 | 1 |
| `core` | INTENT.md | `index.ts` (facts unavailable) | 1 | 8 | 4 |
| `core/SchemaNode` | INTENT.md | `index.ts` (facts unavailable) | 2 | 0 | 3 |
| `core/behaviors` | INTENT.md | `index.ts` (facts unavailable) | 2 | 8 | 3 |
| `core/behaviors/arrayBehavior` | INTENT.md | `index.ts` (facts unavailable) | 3 | 0 | 4 |
| `core/behaviors/booleanBehavior` | INTENT.md | `index.ts` (facts unavailable) | 3 | 0 | 0 |
| `core/behaviors/nullBehavior` | INTENT.md | `index.ts` (facts unavailable) | 3 | 0 | 0 |
| `core/behaviors/numberBehavior` | INTENT.md | `index.ts` (facts unavailable) | 3 | 0 | 0 |
| `core/behaviors/objectBehavior` | INTENT.md | `index.ts` (facts unavailable) | 3 | 0 | 3 |
| `core/behaviors/stringBehavior` | INTENT.md | `index.ts` (facts unavailable) | 3 | 0 | 1 |
| `core/behaviors/unionBehavior` | INTENT.md | `index.ts` (facts unavailable) | 3 | 0 | 1 |
| `core/behaviors/virtualBehavior` | INTENT.md | `index.ts` (facts unavailable) | 3 | 0 | 1 |
| `core/blueprint` | INTENT.md | `index.ts` (facts unavailable) | 2 | 0 | 3 |
| `core/blueprint/utils/expressions/createDynamicFunction` | INTENT.md | `index.ts` (facts unavailable) | 5 | 0 | 2 |
| `core/blueprint/utils/expressions/getPathManager` | INTENT.md | `index.ts` (facts unavailable) | 5 | 0 | 0 |
| `core/dispatch` | INTENT.md | `index.ts` (facts unavailable) | 2 | 0 | 2 |
| `core/navigation` | INTENT.md | `index.ts` (facts unavailable) | 2 | 0 | 3 |
| `core/record` | INTENT.md | `index.ts` (facts unavailable) | 2 | 0 | 5 |
| `core/settle` | INTENT.md | `index.ts` (facts unavailable) | 2 | 1 | 3 |
| `core/settle/derive` | INTENT.md | `index.ts` (facts unavailable) | 3 | 0 | 3 |
| `core/validation` | INTENT.md | `index.ts` (facts unavailable) | 2 | 0 | 2 |
| `errors` | INTENT.md | `index.ts` (facts unavailable) | 1 | 0 | 1 |
| `formTypeDefinitions` | INTENT.md | `index.tsx` (facts unavailable) | 1 | 0 | 2 |
| `helpers/defaultValue` | INTENT.md | `index.ts` (facts unavailable) | 2 | 3 | 0 |
| `helpers/defaultValue/getDefaultValue` | INTENT.md | `index.ts` (facts unavailable) | 3 | 0 | 1 |
| `helpers/defaultValue/getEmptyValue` | INTENT.md | `index.ts` (facts unavailable) | 3 | 0 | 0 |
| `helpers/defaultValue/getObjectDefaultValue` | INTENT.md | `index.ts` (facts unavailable) | 3 | 0 | 1 |
| `helpers/dynamicExpression` | INTENT.md | `index.ts` (facts unavailable) | 2 | 2 | 0 |
| `helpers/dynamicExpression/combineConditions` | INTENT.md | `index.ts` (facts unavailable) | 3 | 0 | 0 |
| `helpers/dynamicExpression/convertExpression` | INTENT.md | `index.ts` (facts unavailable) | 3 | 0 | 1 |
| `helpers/error` | INTENT.md | `index.ts` (facts unavailable) | 2 | 2 | 1 |
| `helpers/error/formatErrorMessage` | INTENT.md | `index.ts` (facts unavailable) | 3 | 0 | 1 |
| `helpers/error/formatValidationError` | INTENT.md | `index.ts` (facts unavailable) | 3 | 0 | 1 |
| `helpers/formTypeInputDefinition` | INTENT.md | `index.ts` (facts unavailable) | 2 | 0 | 2 |
| `helpers/jsonPointer` | INTENT.md | `index.ts` (facts unavailable) | 2 | 0 | 1 |
| `helpers/jsonSchema` | INTENT.md | `index.ts` (facts unavailable) | 2 | 4 | 2 |
| `helpers/jsonSchema/extractSchemaInfo` | INTENT.md | `index.ts` (facts unavailable) | 3 | 0 | 0 |
| `helpers/jsonSchema/getResolveSchema` | INTENT.md | `index.ts` (facts unavailable) | 3 | 0 | 1 |
| `helpers/jsonSchema/isNullBranch` | INTENT.md | `index.ts` (facts unavailable) | 3 | 0 | 0 |
| `helpers/jsonSchema/stripSchemaExtensions` | INTENT.md | `index.ts` (facts unavailable) | 3 | 0 | 1 |
| `helpers/schemaIdentity` | INTENT.md | `index.ts` (facts unavailable) | 2 | 0 | 0 |
| `helpers/schemaIntersection` | INTENT.md | `index.ts` (facts unavailable) | 2 | 0 | 2 |
| `helpers/virtualization` | INTENT.md | `index.ts` (facts unavailable) | 2 | 2 | 1 |
| `helpers/virtualization/VirtualizationManager` | INTENT.md | `index.ts` (facts unavailable) | 3 | 0 | 0 |
| `helpers/virtualization/resolveVirtualizationOptions` | INTENT.md | `index.ts` (facts unavailable) | 3 | 0 | 0 |
| `helpers/warning` | INTENT.md | `index.ts` (facts unavailable) | 2 | 0 | 1 |
| `providers` | INTENT.md | `index.ts` (facts unavailable) | 1 | 8 | 0 |
| `providers/ExternalFormContext` | INTENT.md | `index.ts` (facts unavailable) | 2 | 0 | 0 |
| `providers/FormErrorContext` | INTENT.md | `index.ts` (facts unavailable) | 2 | 0 | 2 |
| `providers/FormTypeInputsContext` | INTENT.md | `index.ts` (facts unavailable) | 2 | 0 | 0 |
| `providers/FormTypeRendererContext` | INTENT.md | `index.ts` (facts unavailable) | 2 | 0 | 0 |
| `providers/InputControlContext` | INTENT.md | `index.ts` (facts unavailable) | 2 | 0 | 0 |
| `providers/RootNodeContext` | INTENT.md | `index.ts` (facts unavailable) | 2 | 0 | 2 |
| `providers/VirtualizationContext` | INTENT.md | `index.ts` (facts unavailable) | 2 | 0 | 0 |
| `providers/WorkspaceContext` | INTENT.md | `index.ts` (facts unavailable) | 2 | 0 | 0 |
| `types/rolled` | INTENT.md | `index.ts` (facts unavailable) | 2 | 0 | 0 |

### 1b. `__legacy__` subtree (64 fractals, frozen copy, not in the artifacts)

| fractal (rel. to src) | classified by | entry point | depth | child fractals | direct organ dirs |
|---|---|---|---|---|---|
| `__legacy__/core/nodes` | INTENT.md | `index.ts` | 3 | 9 | 0 |
| `__legacy__/core/nodes/AbstractNode` | INTENT.md | `index.ts` | 4 | 0 | 1 |
| `__legacy__/core/nodes/AbstractNode/utils/EventCascadeManager` | INTENT.md | `index.ts` | 6 | 0 | 2 |
| `__legacy__/core/nodes/AbstractNode/utils/InjectionGuardManager` | INTENT.md | `index.ts` | 6 | 0 | 0 |
| `__legacy__/core/nodes/AbstractNode/utils/ValidationErrorManager` | INTENT.md | `index.ts` | 6 | 0 | 0 |
| `__legacy__/core/nodes/AbstractNode/utils/ValidationManager` | INTENT.md | `index.ts` | 6 | 0 | 2 |
| `__legacy__/core/nodes/AbstractNode/utils/afterMicrotask` | INTENT.md | `index.ts` | 6 | 0 | 0 |
| `__legacy__/core/nodes/AbstractNode/utils/applyEnhancer` | INTENT.md | `index.ts` | 6 | 0 | 0 |
| `__legacy__/core/nodes/AbstractNode/utils/checkDefinedValue` | INTENT.md | `index.ts` | 6 | 0 | 0 |
| `__legacy__/core/nodes/AbstractNode/utils/findNode` | INTENT.md | `index.ts` | 6 | 0 | 1 |
| `__legacy__/core/nodes/AbstractNode/utils/getComputedPropertiesManager` | INTENT.md | `index.ts` | 6 | 1 | 1 |
| `__legacy__/core/nodes/AbstractNode/utils/getComputedPropertiesManager/ComputedPropertiesManager` | INTENT.md | `index.ts` | 7 | 0 | 1 |
| `__legacy__/core/nodes/AbstractNode/utils/getComputedPropertiesManager/ComputedPropertiesManager/utils/checkComputedOptionFactory` | INTENT.md | `index.ts` | 9 | 0 | 0 |
| `__legacy__/core/nodes/AbstractNode/utils/getComputedPropertiesManager/ComputedPropertiesManager/utils/getConditionIndexFactory` | INTENT.md | `index.ts` | 9 | 0 | 1 |
| `__legacy__/core/nodes/AbstractNode/utils/getComputedPropertiesManager/ComputedPropertiesManager/utils/getDerivedValueFactory` | INTENT.md | `index.ts` | 9 | 0 | 0 |
| `__legacy__/core/nodes/AbstractNode/utils/getComputedPropertiesManager/ComputedPropertiesManager/utils/getObservedValuesFactory` | INTENT.md | `index.ts` | 9 | 0 | 0 |
| `__legacy__/core/nodes/AbstractNode/utils/getComputedPropertiesManager/utils/needsRealComputedManager` | INTENT.md | `index.ts` | 8 | 0 | 0 |
| `__legacy__/core/nodes/AbstractNode/utils/getComputedPropertiesManager/utils/sharedComputedSentinel` | INTENT.md | `index.ts` | 8 | 0 | 0 |
| `__legacy__/core/nodes/AbstractNode/utils/getNodeGroup` | INTENT.md | `index.ts` | 6 | 0 | 0 |
| `__legacy__/core/nodes/AbstractNode/utils/getSafeEmptyValue` | INTENT.md | `index.ts` | 6 | 0 | 0 |
| `__legacy__/core/nodes/AbstractNode/utils/getScopedSegment` | INTENT.md | `index.ts` | 6 | 0 | 0 |
| `__legacy__/core/nodes/AbstractNode/utils/shallowPatch` | INTENT.md | `index.ts` | 6 | 0 | 0 |
| `__legacy__/core/nodes/AbstractNode/utils/traversal` | INTENT.md | `index.ts` | 6 | 0 | 0 |
| `__legacy__/core/nodes/ArrayNode` | INTENT.md | `index.ts` | 4 | 1 | 1 |
| `__legacy__/core/nodes/ArrayNode/strategies` | INTENT.md | `index.ts` | 5 | 2 | 1 |
| `__legacy__/core/nodes/ArrayNode/strategies/BranchStrategy` | INTENT.md | `index.ts` | 6 | 0 | 1 |
| `__legacy__/core/nodes/ArrayNode/strategies/BranchStrategy/utils/getChildSchema` | INTENT.md | `index.ts` | 8 | 0 | 0 |
| `__legacy__/core/nodes/ArrayNode/strategies/BranchStrategy/utils/promiseAfterMicrotask` | INTENT.md | `index.ts` | 8 | 0 | 0 |
| `__legacy__/core/nodes/ArrayNode/strategies/BranchStrategy/utils/sharedResolvedPromises` | INTENT.md | `index.ts` | 8 | 0 | 0 |
| `__legacy__/core/nodes/ArrayNode/strategies/TerminalStrategy` | INTENT.md | `index.ts` | 6 | 0 | 0 |
| `__legacy__/core/nodes/ArrayNode/utils/omitEmptyArray` | INTENT.md | `index.ts` | 6 | 0 | 0 |
| `__legacy__/core/nodes/ArrayNode/utils/omitTrailingArray` | INTENT.md | `index.ts` | 6 | 0 | 0 |
| `__legacy__/core/nodes/ArrayNode/utils/resolveArrayLimits` | INTENT.md | `index.ts` | 6 | 0 | 0 |
| `__legacy__/core/nodes/ArrayNode/utils/resolveArrayValueFilter` | INTENT.md | `index.ts` | 6 | 0 | 0 |
| `__legacy__/core/nodes/BooleanNode` | INTENT.md | `index.ts` | 4 | 0 | 0 |
| `__legacy__/core/nodes/ContextNode` | INTENT.md | `index.ts` | 4 | 0 | 0 |
| `__legacy__/core/nodes/NullNode` | INTENT.md | `index.ts` | 4 | 0 | 0 |
| `__legacy__/core/nodes/NumberNode` | INTENT.md | `index.ts` | 4 | 0 | 0 |
| `__legacy__/core/nodes/ObjectNode` | INTENT.md | `index.ts` | 4 | 1 | 1 |
| `__legacy__/core/nodes/ObjectNode/strategies` | INTENT.md | `index.ts` | 5 | 2 | 1 |
| `__legacy__/core/nodes/ObjectNode/strategies/BranchStrategy` | INTENT.md | `index.ts` | 6 | 0 | 1 |
| `__legacy__/core/nodes/ObjectNode/strategies/BranchStrategy/utils/getChildNodeMap` | INTENT.md | `index.ts` | 8 | 0 | 0 |
| `__legacy__/core/nodes/ObjectNode/strategies/BranchStrategy/utils/getChildren` | INTENT.md | `index.ts` | 8 | 0 | 0 |
| `__legacy__/core/nodes/ObjectNode/strategies/BranchStrategy/utils/getCompositionKeyInfo` | INTENT.md | `index.ts` | 8 | 0 | 0 |
| `__legacy__/core/nodes/ObjectNode/strategies/BranchStrategy/utils/getCompositionNodeMapList` | INTENT.md | `index.ts` | 8 | 0 | 1 |
| `__legacy__/core/nodes/ObjectNode/strategies/BranchStrategy/utils/getConditionsMap` | INTENT.md | `index.ts` | 8 | 0 | 0 |
| `__legacy__/core/nodes/ObjectNode/strategies/BranchStrategy/utils/getFieldConditionMap` | INTENT.md | `index.ts` | 8 | 0 | 2 |
| `__legacy__/core/nodes/ObjectNode/strategies/BranchStrategy/utils/getVirtualReferencesMap` | INTENT.md | `index.ts` | 8 | 0 | 0 |
| `__legacy__/core/nodes/ObjectNode/strategies/BranchStrategy/utils/mergeShowConditions` | INTENT.md | `index.ts` | 8 | 0 | 0 |
| `__legacy__/core/nodes/ObjectNode/strategies/BranchStrategy/utils/processValueWithSchema` | INTENT.md | `index.ts` | 8 | 0 | 1 |
| `__legacy__/core/nodes/ObjectNode/strategies/BranchStrategy/utils/validateSchemaType` | INTENT.md | `index.ts` | 8 | 0 | 0 |
| `__legacy__/core/nodes/ObjectNode/strategies/TerminalStrategy` | INTENT.md | `index.ts` | 6 | 0 | 0 |
| `__legacy__/core/nodes/ObjectNode/utils/omitEmptyObject` | INTENT.md | `index.ts` | 6 | 0 | 0 |
| `__legacy__/core/nodes/StringNode` | INTENT.md | `index.ts` | 4 | 0 | 0 |
| `__legacy__/core/nodes/VirtualNode` | INTENT.md | `index.ts` | 4 | 0 | 0 |
| `__legacy__/core/parsers` | INTENT.md | `index.ts` | 3 | 0 | 1 |
| `__legacy__/helpers/jsonSchema/preprocessSchema` | INTENT.md | `index.ts` | 4 | 0 | 1 |
| `__legacy__/helpers/jsonSchema/preprocessSchema/utils/processOneOfSchema` | INTENT.md | `index.ts` | 6 | 0 | 0 |
| `__legacy__/helpers/jsonSchema/preprocessSchema/utils/processVirtualSchema` | INTENT.md | `index.ts` | 6 | 0 | 1 |
| `__legacy__/helpers/jsonSchema/processAllOfSchema` | INTENT.md | `index.ts` | 4 | 1 | 2 |
| `__legacy__/helpers/jsonSchema/processAllOfSchema/intersectSchema` | INTENT.md | `index.ts` | 5 | 0 | 2 |
| `__legacy__/helpers/jsonSchema/processAllOfSchema/utils/getCloneDepth` | INTENT.md | `index.ts` | 6 | 0 | 0 |
| `__legacy__/helpers/jsonSchema/processAllOfSchema/utils/getMergeSchemaHandler` | INTENT.md | `index.ts` | 6 | 0 | 0 |
| `__legacy__/helpers/jsonSchema/processAllOfSchema/utils/validateCompatibility` | INTENT.md | `index.ts` | 6 | 0 | 0 |

## 2. Organs by owning fractal (nearest ancestor fractal)

Rule names follow the rule order in `filid_fractal-boundaries`. `nested` marks an organ that contains subdirectories.

### 2a. Non-legacy (207 reconstructed vs 211 in scan)

**(src root)**

- `__tests__`: infrastructure name (rule 3) ; nested: `e2e`, `helpers`, `migration`, `scenarios`
- `__tests__/e2e`: known organ name `e2e` (rule 4)
- `__tests__/helpers`: known organ name `helpers` (rule 4)
- `__tests__/migration`: leaf directory, no fractal children (rule 6)
- `__tests__/scenarios`: leaf directory, no fractal children (rule 6)
- `components`: known organ name `components` (rule 4) ; nested: `FallbackComponents`, `Form`, `SchemaNode`
- `helpers`: known organ name `helpers` (rule 4) ; nested: `defaultValue`, `dynamicExpression`, `error`, `formTypeInputDefinition`, `jsonPointer`, `jsonSchema`, `schemaIdentity`, `schemaIntersection`, `virtualization`, `warning`
- `hooks`: known organ name `hooks` (rule 4) ; nested: `__tests__`
- `hooks/__tests__`: infrastructure name (rule 3)
- `types`: known organ name `types` (rule 4) ; nested: `__tests__`, `rolled`
- `types/__tests__`: infrastructure name (rule 3)

**`app`**

- `app/constants`: known organ name `constants` (rule 4)

**`app/plugin`**

- `app/plugin/__tests__`: infrastructure name (rule 3)

**`components/Form`**

- `components/Form/__tests__`: infrastructure name (rule 3)
- `components/Form/components`: known organ name `components` (rule 4)
- `components/Form/utils`: known organ name `utils` (rule 4)

**`components/SchemaNode`**

- `components/SchemaNode/__tests__`: infrastructure name (rule 3)

**`components/SchemaNode/DeferrableNodeProxy`**

- `components/SchemaNode/DeferrableNodeProxy/__tests__`: infrastructure name (rule 3)

**`components/SchemaNode/SchemaNodeInput`**

- `components/SchemaNode/SchemaNodeInput/__tests__`: infrastructure name (rule 3) ; nested: `helpers`
- `components/SchemaNode/SchemaNodeInput/__tests__/helpers`: known organ name `helpers` (rule 4)
- `components/SchemaNode/SchemaNodeInput/hooks`: known organ name `hooks` (rule 4) ; nested: `utils`
- `components/SchemaNode/SchemaNodeInput/hooks/utils`: known organ name `utils` (rule 4)

**`components/SchemaNode/SchemaNodeProxy`**

- `components/SchemaNode/SchemaNodeProxy/__tests__`: infrastructure name (rule 3) ; nested: `helpers`

**`core`**

- `core/__tests__`: infrastructure name (rule 3) ; nested: `fixtures`, `regression`, `scenarios`
- `core/__tests__/fixtures`: known organ name `fixtures` (rule 4)
- `core/__tests__/regression`: leaf directory, no fractal children (rule 6) ; nested: `.claude`
- `core/__tests__/scenarios`: leaf directory, no fractal children (rule 6) ; nested: `.claude`, `utils`
- `core/__tests__/scenarios/utils`: known organ name `utils` (rule 4) ; nested: `__tests__`, `createCoreScenarioAdapter`
- `core/__tests__/scenarios/utils/__tests__`: infrastructure name (rule 3)
- `core/types`: known organ name `types` (rule 4)
- `core/utils`: known organ name `utils` (rule 4) ; nested: `pathIndex`
- `core/utils/pathIndex`: leaf directory, no fractal children (rule 6) ; nested: `__tests__`, `utils`
- `core/utils/pathIndex/__tests__`: infrastructure name (rule 3)
- `core/utils/pathIndex/utils`: known organ name `utils` (rule 4) ; nested: `utils`
- `core/utils/pathIndex/utils/utils`: known organ name `utils` (rule 4)

**`core/SchemaNode`**

- `core/SchemaNode/__tests__`: infrastructure name (rule 3)
- `core/SchemaNode/utils`: known organ name `utils` (rule 4) ; nested: `binding`
- `core/SchemaNode/utils/binding`: leaf directory, no fractal children (rule 6) ; nested: `__tests__`
- `core/SchemaNode/utils/binding/__tests__`: infrastructure name (rule 3)

**`core/behaviors`**

- `core/behaviors/__tests__`: infrastructure name (rule 3)
- `core/behaviors/utils`: known organ name `utils` (rule 4) ; nested: `options`, `parse`, `slots`
- `core/behaviors/utils/options`: leaf directory, no fractal children (rule 6) ; nested: `__tests__`
- `core/behaviors/utils/options/__tests__`: infrastructure name (rule 3)
- `core/behaviors/utils/parse`: leaf directory, no fractal children (rule 6) ; nested: `__tests__`, `utils`
- `core/behaviors/utils/parse/__tests__`: infrastructure name (rule 3)
- `core/behaviors/utils/parse/utils`: known organ name `utils` (rule 4) ; nested: `number`
- `core/behaviors/utils/parse/utils/number`: leaf directory, no fractal children (rule 6)
- `core/behaviors/utils/slots`: leaf directory, no fractal children (rule 6)

**`core/behaviors/arrayBehavior`**

- `core/behaviors/arrayBehavior/__tests__`: infrastructure name (rule 3)
- `core/behaviors/arrayBehavior/branch`: leaf directory, no fractal children (rule 6) ; nested: `utils`
- `core/behaviors/arrayBehavior/branch/utils`: known organ name `utils` (rule 4)
- `core/behaviors/arrayBehavior/terminal`: leaf directory, no fractal children (rule 6)
- `core/behaviors/arrayBehavior/utils`: known organ name `utils` (rule 4) ; nested: `plan`, `projection`, `value`
- `core/behaviors/arrayBehavior/utils/plan`: leaf directory, no fractal children (rule 6)
- `core/behaviors/arrayBehavior/utils/projection`: leaf directory, no fractal children (rule 6)
- `core/behaviors/arrayBehavior/utils/value`: leaf directory, no fractal children (rule 6)

**`core/behaviors/objectBehavior`**

- `core/behaviors/objectBehavior/branch`: leaf directory, no fractal children (rule 6) ; nested: `utils`
- `core/behaviors/objectBehavior/branch/utils`: known organ name `utils` (rule 4) ; nested: `__tests__`
- `core/behaviors/objectBehavior/branch/utils/__tests__`: infrastructure name (rule 3)
- `core/behaviors/objectBehavior/terminal`: leaf directory, no fractal children (rule 6)
- `core/behaviors/objectBehavior/utils`: known organ name `utils` (rule 4) ; nested: `keys`
- `core/behaviors/objectBehavior/utils/keys`: leaf directory, no fractal children (rule 6)

**`core/behaviors/unionBehavior`**

- `core/behaviors/unionBehavior/__tests__`: infrastructure name (rule 3)

**`core/behaviors/virtualBehavior`**

- `core/behaviors/virtualBehavior/utils`: known organ name `utils` (rule 4) ; nested: `children`, `tuple`, `value`
- `core/behaviors/virtualBehavior/utils/tuple`: leaf directory, no fractal children (rule 6)
- `core/behaviors/virtualBehavior/utils/value`: leaf directory, no fractal children (rule 6)

**`core/blueprint`**

- `core/blueprint/__tests__`: infrastructure name (rule 3) ; nested: `fixtures`
- `core/blueprint/__tests__/fixtures`: known organ name `fixtures` (rule 4)
- `core/blueprint/utils`: known organ name `utils` (rule 4) ; nested: `.claude`, `analyze`, `declarations`, `diagnostics`, `effectiveSchema`, `expressions`, `features`, `itemEntry`, `resolveArrayLimits`, `stripSchema`, `types`
- `core/blueprint/utils/analyze`: leaf directory, no fractal children (rule 6) ; nested: `__tests__`, `compileBlueprintExpressions`, `populateNodeChildren`, `validateShape`
- `core/blueprint/utils/analyze/__tests__`: infrastructure name (rule 3) ; nested: `fixtures`
- `core/blueprint/utils/analyze/__tests__/fixtures`: known organ name `fixtures` (rule 4)
- `core/blueprint/utils/analyze/compileBlueprintExpressions`: leaf directory, no fractal children (rule 6) ; nested: `utils`
- `core/blueprint/utils/analyze/compileBlueprintExpressions/utils`: known organ name `utils` (rule 4)
- `core/blueprint/utils/analyze/populateNodeChildren`: leaf directory, no fractal children (rule 6) ; nested: `utils`
- `core/blueprint/utils/analyze/populateNodeChildren/utils`: known organ name `utils` (rule 4)
- `core/blueprint/utils/analyze/validateShape`: leaf directory, no fractal children (rule 6) ; nested: `utils`
- `core/blueprint/utils/analyze/validateShape/utils`: known organ name `utils` (rule 4)
- `core/blueprint/utils/declarations`: leaf directory, no fractal children (rule 6)
- `core/blueprint/utils/diagnostics`: leaf directory, no fractal children (rule 6)
- `core/blueprint/utils/effectiveSchema`: leaf directory, no fractal children (rule 6) ; nested: `utils`
- `core/blueprint/utils/effectiveSchema/utils`: known organ name `utils` (rule 4) ; nested: `__tests__`, `applySchemaContribution`, `mergeHintGroup`, `mergeSchemaContributions`
- `core/blueprint/utils/effectiveSchema/utils/__tests__`: infrastructure name (rule 3)
- `core/blueprint/utils/effectiveSchema/utils/applySchemaContribution`: leaf directory, no fractal children (rule 6) ; nested: `utils`
- `core/blueprint/utils/effectiveSchema/utils/applySchemaContribution/utils`: known organ name `utils` (rule 4) ; nested: `__tests__`
- `core/blueprint/utils/effectiveSchema/utils/applySchemaContribution/utils/__tests__`: infrastructure name (rule 3)
- `core/blueprint/utils/effectiveSchema/utils/mergeHintGroup`: leaf directory, no fractal children (rule 6) ; nested: `utils`
- `core/blueprint/utils/effectiveSchema/utils/mergeHintGroup/utils`: known organ name `utils` (rule 4)
- `core/blueprint/utils/effectiveSchema/utils/mergeSchemaContributions`: leaf directory, no fractal children (rule 6) ; nested: `utils`
- `core/blueprint/utils/effectiveSchema/utils/mergeSchemaContributions/utils`: known organ name `utils` (rule 4) ; nested: `__tests__`
- `core/blueprint/utils/effectiveSchema/utils/mergeSchemaContributions/utils/__tests__`: infrastructure name (rule 3)
- `core/blueprint/utils/expressions`: otherwise (rule 8) ; nested: `__tests__`, `createDynamicFunction`, `getPathManager`
- `core/blueprint/utils/expressions/__tests__`: infrastructure name (rule 3)
- `core/blueprint/utils/features`: leaf directory, no fractal children (rule 6) ; nested: `getFeatureNodeIndex`
- `core/blueprint/utils/features/getFeatureNodeIndex`: leaf directory, no fractal children (rule 6) ; nested: `utils`
- `core/blueprint/utils/features/getFeatureNodeIndex/utils`: known organ name `utils` (rule 4) ; nested: `__tests__`
- `core/blueprint/utils/features/getFeatureNodeIndex/utils/__tests__`: infrastructure name (rule 3)
- `core/blueprint/utils/itemEntry`: leaf directory, no fractal children (rule 6) ; nested: `getItemEntry`
- `core/blueprint/utils/itemEntry/getItemEntry`: leaf directory, no fractal children (rule 6) ; nested: `utils`
- `core/blueprint/utils/itemEntry/getItemEntry/utils`: known organ name `utils` (rule 4)
- `core/blueprint/utils/resolveArrayLimits`: leaf directory, no fractal children (rule 6)
- `core/blueprint/utils/stripSchema`: leaf directory, no fractal children (rule 6) ; nested: `utils`
- `core/blueprint/utils/stripSchema/utils`: known organ name `utils` (rule 4)
- `core/blueprint/utils/types`: known organ name `types` (rule 4) ; nested: `__tests__`, `inferAllowedTypes`
- `core/blueprint/utils/types/__tests__`: infrastructure name (rule 3)

**`core/blueprint/utils/expressions/createDynamicFunction`**

- `core/blueprint/utils/expressions/createDynamicFunction/__tests__`: infrastructure name (rule 3)
- `core/blueprint/utils/expressions/createDynamicFunction/utils`: known organ name `utils` (rule 4)

**`core/dispatch`**

- `core/dispatch/__tests__`: infrastructure name (rule 3) ; nested: `fixtures`
- `core/dispatch/__tests__/fixtures`: known organ name `fixtures` (rule 4)
- `core/dispatch/utils`: known organ name `utils` (rule 4) ; nested: `chain`, `entry`, `read`, `report`
- `core/dispatch/utils/chain`: leaf directory, no fractal children (rule 6) ; nested: `utils`
- `core/dispatch/utils/chain/utils`: known organ name `utils` (rule 4)
- `core/dispatch/utils/entry`: leaf directory, no fractal children (rule 6) ; nested: `.claude`, `utils`
- `core/dispatch/utils/entry/utils`: known organ name `utils` (rule 4)
- `core/dispatch/utils/read`: leaf directory, no fractal children (rule 6)
- `core/dispatch/utils/report`: leaf directory, no fractal children (rule 6)

**`core/navigation`**

- `core/navigation/__tests__`: infrastructure name (rule 3) ; nested: `fixtures`
- `core/navigation/__tests__/fixtures`: known organ name `fixtures` (rule 4)
- `core/navigation/utils`: known organ name `utils` (rule 4) ; nested: `query`, `walk`
- `core/navigation/utils/query`: leaf directory, no fractal children (rule 6) ; nested: `utils`
- `core/navigation/utils/query/utils`: known organ name `utils` (rule 4)
- `core/navigation/utils/walk`: leaf directory, no fractal children (rule 6)

**`core/record`**

- `core/record/__tests__`: infrastructure name (rule 3)
- `core/record/constants`: known organ name `constants` (rule 4)
- `core/record/types`: known organ name `types` (rule 4)
- `core/record/utils`: known organ name `utils` (rule 4) ; nested: `__tests__`
- `core/record/utils/__tests__`: infrastructure name (rule 3)

**`core/settle`**

- `core/settle/__tests__`: infrastructure name (rule 3) ; nested: `.claude`, `fixtures`, `helpers`
- `core/settle/__tests__/fixtures`: known organ name `fixtures` (rule 4) ; nested: `childSelection`
- `core/settle/__tests__/fixtures/childSelection`: leaf directory, no fractal children (rule 6)
- `core/settle/__tests__/helpers`: known organ name `helpers` (rule 4)
- `core/settle/utils`: known organ name `utils` (rule 4) ; nested: `.claude`, `commit`, `compute`, `context`, `controls`, `declarations`, `derivation`, `detached`, `dispose`, `errors`, `gates`, `latent`, `load`, `pathIndex`, `paths`, `read`, `settlement`, `structure`, `transition`, `write`
- `core/settle/utils/commit`: leaf directory, no fractal children (rule 6) ; nested: `utils`
- `core/settle/utils/commit/utils`: known organ name `utils` (rule 4)
- `core/settle/utils/compute`: leaf directory, no fractal children (rule 6) ; nested: `__tests__`, `selectChildren`, `utils`
- `core/settle/utils/compute/__tests__`: infrastructure name (rule 3)
- `core/settle/utils/compute/selectChildren`: leaf directory, no fractal children (rule 6) ; nested: `utils`
- `core/settle/utils/compute/selectChildren/utils`: known organ name `utils` (rule 4)
- `core/settle/utils/compute/utils`: known organ name `utils` (rule 4)
- `core/settle/utils/context`: leaf directory, no fractal children (rule 6)
- `core/settle/utils/controls`: leaf directory, no fractal children (rule 6) ; nested: `__tests__`
- `core/settle/utils/controls/__tests__`: infrastructure name (rule 3)
- `core/settle/utils/declarations`: leaf directory, no fractal children (rule 6)
- `core/settle/utils/derivation`: leaf directory, no fractal children (rule 6) ; nested: `utils`
- `core/settle/utils/derivation/utils`: known organ name `utils` (rule 4)
- `core/settle/utils/detached`: leaf directory, no fractal children (rule 6)
- `core/settle/utils/dispose`: leaf directory, no fractal children (rule 6)
- `core/settle/utils/errors`: leaf directory, no fractal children (rule 6)
- `core/settle/utils/gates`: leaf directory, no fractal children (rule 6)
- `core/settle/utils/latent`: leaf directory, no fractal children (rule 6) ; nested: `__tests__`
- `core/settle/utils/latent/__tests__`: infrastructure name (rule 3)
- `core/settle/utils/load`: leaf directory, no fractal children (rule 6)
- `core/settle/utils/pathIndex`: leaf directory, no fractal children (rule 6)
- `core/settle/utils/paths`: leaf directory, no fractal children (rule 6)
- `core/settle/utils/settlement`: leaf directory, no fractal children (rule 6)
- `core/settle/utils/structure`: leaf directory, no fractal children (rule 6) ; nested: `__tests__`, `applyArraySlots`, `utils`
- `core/settle/utils/structure/__tests__`: infrastructure name (rule 3)
- `core/settle/utils/structure/applyArraySlots`: leaf directory, no fractal children (rule 6) ; nested: `utils`
- `core/settle/utils/structure/applyArraySlots/utils`: known organ name `utils` (rule 4)
- `core/settle/utils/structure/utils`: known organ name `utils` (rule 4)
- `core/settle/utils/transition`: leaf directory, no fractal children (rule 6)
- `core/settle/utils/write`: leaf directory, no fractal children (rule 6) ; nested: `__tests__`
- `core/settle/utils/write/__tests__`: infrastructure name (rule 3)

**`core/settle/derive`**

- `core/settle/derive/__tests__`: infrastructure name (rule 3) ; nested: `.claude`
- `core/settle/derive/utils`: known organ name `utils` (rule 4) ; nested: `.claude`, `edges`, `evaluate`, `rank`, `rules`
- `core/settle/derive/utils/edges`: leaf directory, no fractal children (rule 6)
- `core/settle/derive/utils/evaluate`: leaf directory, no fractal children (rule 6) ; nested: `utils`
- `core/settle/derive/utils/evaluate/utils`: known organ name `utils` (rule 4)
- `core/settle/derive/utils/rank`: leaf directory, no fractal children (rule 6) ; nested: `.claude`
- `core/settle/derive/utils/rules`: leaf directory, no fractal children (rule 6) ; nested: `utils`
- `core/settle/derive/utils/rules/utils`: known organ name `utils` (rule 4)

**`core/validation`**

- `core/validation/__tests__`: infrastructure name (rule 3)
- `core/validation/utils`: known organ name `utils` (rule 4) ; nested: `cache`, `copy`, `guard`, `lifetime`, `read`, `route`, `run`
- `core/validation/utils/cache`: leaf directory, no fractal children (rule 6)
- `core/validation/utils/copy`: leaf directory, no fractal children (rule 6)
- `core/validation/utils/guard`: leaf directory, no fractal children (rule 6)
- `core/validation/utils/lifetime`: leaf directory, no fractal children (rule 6)
- `core/validation/utils/read`: leaf directory, no fractal children (rule 6)
- `core/validation/utils/route`: leaf directory, no fractal children (rule 6)
- `core/validation/utils/run`: leaf directory, no fractal children (rule 6)

**`errors`**

- `errors/__tests__`: infrastructure name (rule 3)

**`formTypeDefinitions`**

- `formTypeDefinitions/FormTypeInputUnion`: leaf directory, no fractal children (rule 6) ; nested: `utils`
- `formTypeDefinitions/FormTypeInputUnion/utils`: known organ name `utils` (rule 4)
- `formTypeDefinitions/__tests__`: infrastructure name (rule 3)

**`helpers/defaultValue/getDefaultValue`**

- `helpers/defaultValue/getDefaultValue/__tests__`: infrastructure name (rule 3)

**`helpers/defaultValue/getObjectDefaultValue`**

- `helpers/defaultValue/getObjectDefaultValue/__tests__`: infrastructure name (rule 3)

**`helpers/dynamicExpression/convertExpression`**

- `helpers/dynamicExpression/convertExpression/__tests__`: infrastructure name (rule 3)

**`helpers/error`**

- `helpers/error/__tests__`: infrastructure name (rule 3) ; nested: `__snapshots__`

**`helpers/error/formatErrorMessage`**

- `helpers/error/formatErrorMessage/utils`: known organ name `utils` (rule 4)

**`helpers/error/formatValidationError`**

- `helpers/error/formatValidationError/utils`: known organ name `utils` (rule 4) ; nested: `__tests__`
- `helpers/error/formatValidationError/utils/__tests__`: infrastructure name (rule 3)

**`helpers/formTypeInputDefinition`**

- `helpers/formTypeInputDefinition/__tests__`: infrastructure name (rule 3)
- `helpers/formTypeInputDefinition/utils`: known organ name `utils` (rule 4)

**`helpers/jsonPointer`**

- `helpers/jsonPointer/utils`: known organ name `utils` (rule 4) ; nested: `__tests__`
- `helpers/jsonPointer/utils/__tests__`: infrastructure name (rule 3)

**`helpers/jsonSchema`**

- `helpers/jsonSchema/__tests__`: infrastructure name (rule 3)

**`helpers/jsonSchema/getResolveSchema`**

- `helpers/jsonSchema/getResolveSchema/utils`: known organ name `utils` (rule 4)

**`helpers/jsonSchema/stripSchemaExtensions`**

- `helpers/jsonSchema/stripSchemaExtensions/utils`: known organ name `utils` (rule 4)

**`helpers/schemaIntersection`**

- `helpers/schemaIntersection/__tests__`: infrastructure name (rule 3)
- `helpers/schemaIntersection/utils`: known organ name `utils` (rule 4)

**`helpers/virtualization`**

- `helpers/virtualization/__tests__`: infrastructure name (rule 3)

**`helpers/warning`**

- `helpers/warning/__tests__`: infrastructure name (rule 3)

**`providers/FormErrorContext`**

- `providers/FormErrorContext/__tests__`: infrastructure name (rule 3)
- `providers/FormErrorContext/utils`: known organ name `utils` (rule 4)

**`providers/RootNodeContext`**

- `providers/RootNodeContext/__tests__`: infrastructure name (rule 3)
- `providers/RootNodeContext/utils`: known organ name `utils` (rule 4) ; nested: `__tests__`
- `providers/RootNodeContext/utils/__tests__`: infrastructure name (rule 3)

### 2b. `__legacy__` (112, filesystem only)

**(src root)**

- `__legacy__`: infrastructure name (rule 3) ; nested: `app`, `core`, `errors`, `helpers`, `types`
- `__legacy__/app`: leaf directory, no fractal children (rule 6) ; nested: `constants`
- `__legacy__/app/constants`: known organ name `constants` (rule 4)
- `__legacy__/core`: otherwise (rule 8) ; nested: `__tests__`, `blueprint`, `nodes`, `parsers`, `record`, `types`, `utils`, `validation`
- `__legacy__/core/__tests__`: infrastructure name (rule 3) ; nested: `utils`
- `__legacy__/core/__tests__/utils`: known organ name `utils` (rule 4)
- `__legacy__/core/blueprint`: leaf directory, no fractal children (rule 6) ; nested: `utils`
- `__legacy__/core/blueprint/utils`: known organ name `utils` (rule 4) ; nested: `analyze`, `diagnostics`, `effectiveSchema`, `expressions`, `features`, `itemEntry`, `resolveArrayLimits`, `stripSchema`, `types`
- `__legacy__/core/blueprint/utils/analyze`: leaf directory, no fractal children (rule 6) ; nested: `compileBlueprintExpressions`, `validateShape`
- `__legacy__/core/blueprint/utils/analyze/compileBlueprintExpressions`: leaf directory, no fractal children (rule 6) ; nested: `utils`
- `__legacy__/core/blueprint/utils/analyze/compileBlueprintExpressions/utils`: known organ name `utils` (rule 4)
- `__legacy__/core/blueprint/utils/analyze/validateShape`: leaf directory, no fractal children (rule 6) ; nested: `utils`
- `__legacy__/core/blueprint/utils/analyze/validateShape/utils`: known organ name `utils` (rule 4)
- `__legacy__/core/blueprint/utils/diagnostics`: leaf directory, no fractal children (rule 6)
- `__legacy__/core/blueprint/utils/effectiveSchema`: leaf directory, no fractal children (rule 6) ; nested: `utils`
- `__legacy__/core/blueprint/utils/effectiveSchema/utils`: known organ name `utils` (rule 4)
- `__legacy__/core/blueprint/utils/expressions`: leaf directory, no fractal children (rule 6) ; nested: `createDynamicFunction`, `getPathManager`
- `__legacy__/core/blueprint/utils/expressions/createDynamicFunction`: leaf directory, no fractal children (rule 6) ; nested: `utils`
- `__legacy__/core/blueprint/utils/expressions/createDynamicFunction/utils`: known organ name `utils` (rule 4)
- `__legacy__/core/blueprint/utils/expressions/getPathManager`: leaf directory, no fractal children (rule 6)
- `__legacy__/core/blueprint/utils/features`: leaf directory, no fractal children (rule 6) ; nested: `getFeatureNodeIndex`
- `__legacy__/core/blueprint/utils/features/getFeatureNodeIndex`: leaf directory, no fractal children (rule 6) ; nested: `utils`
- `__legacy__/core/blueprint/utils/features/getFeatureNodeIndex/utils`: known organ name `utils` (rule 4)
- `__legacy__/core/blueprint/utils/itemEntry`: leaf directory, no fractal children (rule 6) ; nested: `getItemEntry`
- `__legacy__/core/blueprint/utils/itemEntry/getItemEntry`: leaf directory, no fractal children (rule 6) ; nested: `utils`
- `__legacy__/core/blueprint/utils/itemEntry/getItemEntry/utils`: known organ name `utils` (rule 4)
- `__legacy__/core/blueprint/utils/resolveArrayLimits`: leaf directory, no fractal children (rule 6)
- `__legacy__/core/blueprint/utils/stripSchema`: leaf directory, no fractal children (rule 6) ; nested: `utils`
- `__legacy__/core/blueprint/utils/stripSchema/utils`: known organ name `utils` (rule 4)
- `__legacy__/core/blueprint/utils/types`: known organ name `types` (rule 4)
- `__legacy__/core/record`: leaf directory, no fractal children (rule 6) ; nested: `utils`
- `__legacy__/core/record/utils`: known organ name `utils` (rule 4)
- `__legacy__/core/types`: known organ name `types` (rule 4)
- `__legacy__/core/utils`: known organ name `utils` (rule 4) ; nested: `pathIndex`
- `__legacy__/core/utils/pathIndex`: leaf directory, no fractal children (rule 6) ; nested: `utils`
- `__legacy__/core/utils/pathIndex/utils`: known organ name `utils` (rule 4) ; nested: `utils`
- `__legacy__/core/utils/pathIndex/utils/utils`: known organ name `utils` (rule 4)
- `__legacy__/core/validation`: leaf directory, no fractal children (rule 6) ; nested: `utils`
- `__legacy__/core/validation/utils`: known organ name `utils` (rule 4) ; nested: `cache`, `copy`, `guard`, `lifetime`, `read`, `route`, `run`
- `__legacy__/core/validation/utils/cache`: leaf directory, no fractal children (rule 6)
- `__legacy__/core/validation/utils/copy`: leaf directory, no fractal children (rule 6)
- `__legacy__/core/validation/utils/guard`: leaf directory, no fractal children (rule 6)
- `__legacy__/core/validation/utils/lifetime`: leaf directory, no fractal children (rule 6)
- `__legacy__/core/validation/utils/read`: leaf directory, no fractal children (rule 6)
- `__legacy__/core/validation/utils/route`: leaf directory, no fractal children (rule 6)
- `__legacy__/core/validation/utils/run`: leaf directory, no fractal children (rule 6)
- `__legacy__/errors`: leaf directory, no fractal children (rule 6)
- `__legacy__/helpers`: known organ name `helpers` (rule 4) ; nested: `defaultValue`, `dynamicExpression`, `error`, `jsonPointer`, `jsonSchema`, `schemaIntersection`, `warning`
- `__legacy__/helpers/defaultValue`: leaf directory, no fractal children (rule 6) ; nested: `getDefaultValue`, `getEmptyValue`, `getObjectDefaultValue`
- `__legacy__/helpers/defaultValue/getDefaultValue`: leaf directory, no fractal children (rule 6)
- `__legacy__/helpers/defaultValue/getEmptyValue`: leaf directory, no fractal children (rule 6)
- `__legacy__/helpers/defaultValue/getObjectDefaultValue`: leaf directory, no fractal children (rule 6)
- `__legacy__/helpers/dynamicExpression`: leaf directory, no fractal children (rule 6) ; nested: `combineConditions`, `convertExpression`
- `__legacy__/helpers/dynamicExpression/combineConditions`: leaf directory, no fractal children (rule 6)
- `__legacy__/helpers/dynamicExpression/convertExpression`: leaf directory, no fractal children (rule 6)
- `__legacy__/helpers/error`: leaf directory, no fractal children (rule 6) ; nested: `formatErrorMessage`, `formatValidationError`, `transformErrors`
- `__legacy__/helpers/error/formatErrorMessage`: leaf directory, no fractal children (rule 6) ; nested: `utils`
- `__legacy__/helpers/error/formatErrorMessage/utils`: known organ name `utils` (rule 4)
- `__legacy__/helpers/error/formatValidationError`: leaf directory, no fractal children (rule 6) ; nested: `utils`
- `__legacy__/helpers/error/formatValidationError/utils`: known organ name `utils` (rule 4)
- `__legacy__/helpers/error/transformErrors`: leaf directory, no fractal children (rule 6)
- `__legacy__/helpers/jsonPointer`: leaf directory, no fractal children (rule 6) ; nested: `utils`
- `__legacy__/helpers/jsonPointer/utils`: known organ name `utils` (rule 4)
- `__legacy__/helpers/jsonSchema`: otherwise (rule 8) ; nested: `__tests__`, `extractSchemaInfo`, `getResolveSchema`, `isNullBranch`, `preprocessSchema`, `processAllOfSchema`, `stripSchemaExtensions`
- `__legacy__/helpers/jsonSchema/__tests__`: infrastructure name (rule 3)
- `__legacy__/helpers/jsonSchema/extractSchemaInfo`: leaf directory, no fractal children (rule 6)
- `__legacy__/helpers/jsonSchema/getResolveSchema`: leaf directory, no fractal children (rule 6) ; nested: `utils`
- `__legacy__/helpers/jsonSchema/getResolveSchema/utils`: known organ name `utils` (rule 4)
- `__legacy__/helpers/jsonSchema/isNullBranch`: leaf directory, no fractal children (rule 6)
- `__legacy__/helpers/jsonSchema/stripSchemaExtensions`: leaf directory, no fractal children (rule 6) ; nested: `utils`
- `__legacy__/helpers/jsonSchema/stripSchemaExtensions/utils`: known organ name `utils` (rule 4) ; nested: `hasExtensionKeys`
- `__legacy__/helpers/jsonSchema/stripSchemaExtensions/utils/hasExtensionKeys`: leaf directory, no fractal children (rule 6)
- `__legacy__/helpers/schemaIntersection`: leaf directory, no fractal children (rule 6) ; nested: `utils`
- `__legacy__/helpers/schemaIntersection/utils`: known organ name `utils` (rule 4)
- `__legacy__/helpers/warning`: leaf directory, no fractal children (rule 6)
- `__legacy__/types`: known organ name `types` (rule 4)

**`__legacy__/core/nodes/AbstractNode`**

- `__legacy__/core/nodes/AbstractNode/utils`: known organ name `utils` (rule 4) ; nested: `EventCascadeManager`, `InjectionGuardManager`, `ValidationErrorManager`, `ValidationManager`, `__tests__`, `afterMicrotask`, `applyEnhancer`, `checkDefinedValue`, `findNode`, `getComputedPropertiesManager`, `getNodeGroup`, `getSafeEmptyValue`, `getScopedSegment`, `shallowPatch`, `traversal`
- `__legacy__/core/nodes/AbstractNode/utils/__tests__`: infrastructure name (rule 3)

**`__legacy__/core/nodes/AbstractNode/utils/EventCascadeManager`**

- `__legacy__/core/nodes/AbstractNode/utils/EventCascadeManager/__tests__`: infrastructure name (rule 3)
- `__legacy__/core/nodes/AbstractNode/utils/EventCascadeManager/utils`: known organ name `utils` (rule 4)

**`__legacy__/core/nodes/AbstractNode/utils/ValidationManager`**

- `__legacy__/core/nodes/AbstractNode/utils/ValidationManager/__tests__`: infrastructure name (rule 3)
- `__legacy__/core/nodes/AbstractNode/utils/ValidationManager/utils`: known organ name `utils` (rule 4)

**`__legacy__/core/nodes/AbstractNode/utils/findNode`**

- `__legacy__/core/nodes/AbstractNode/utils/findNode/utils`: known organ name `utils` (rule 4) ; nested: `__tests__`
- `__legacy__/core/nodes/AbstractNode/utils/findNode/utils/__tests__`: infrastructure name (rule 3)

**`__legacy__/core/nodes/AbstractNode/utils/getComputedPropertiesManager`**

- `__legacy__/core/nodes/AbstractNode/utils/getComputedPropertiesManager/utils`: known organ name `utils` (rule 4) ; nested: `needsRealComputedManager`, `sharedComputedSentinel`

**`__legacy__/core/nodes/AbstractNode/utils/getComputedPropertiesManager/ComputedPropertiesManager`**

- `__legacy__/core/nodes/AbstractNode/utils/getComputedPropertiesManager/ComputedPropertiesManager/utils`: known organ name `utils` (rule 4) ; nested: `__tests__`, `checkComputedOptionFactory`, `getConditionIndexFactory`, `getDerivedValueFactory`, `getObservedValuesFactory`
- `__legacy__/core/nodes/AbstractNode/utils/getComputedPropertiesManager/ComputedPropertiesManager/utils/__tests__`: infrastructure name (rule 3)

**`__legacy__/core/nodes/AbstractNode/utils/getComputedPropertiesManager/ComputedPropertiesManager/utils/getConditionIndexFactory`**

- `__legacy__/core/nodes/AbstractNode/utils/getComputedPropertiesManager/ComputedPropertiesManager/utils/getConditionIndexFactory/utils`: known organ name `utils` (rule 4)

**`__legacy__/core/nodes/ArrayNode`**

- `__legacy__/core/nodes/ArrayNode/utils`: known organ name `utils` (rule 4) ; nested: `__tests__`, `omitEmptyArray`, `omitTrailingArray`, `resolveArrayLimits`, `resolveArrayValueFilter`
- `__legacy__/core/nodes/ArrayNode/utils/__tests__`: infrastructure name (rule 3)

**`__legacy__/core/nodes/ArrayNode/strategies`**

- `__legacy__/core/nodes/ArrayNode/strategies/types`: known organ name `types` (rule 4)

**`__legacy__/core/nodes/ArrayNode/strategies/BranchStrategy`**

- `__legacy__/core/nodes/ArrayNode/strategies/BranchStrategy/utils`: known organ name `utils` (rule 4) ; nested: `getChildSchema`, `promiseAfterMicrotask`, `sharedResolvedPromises`

**`__legacy__/core/nodes/ObjectNode`**

- `__legacy__/core/nodes/ObjectNode/utils`: known organ name `utils` (rule 4) ; nested: `__tests__`, `omitEmptyObject`
- `__legacy__/core/nodes/ObjectNode/utils/__tests__`: infrastructure name (rule 3)

**`__legacy__/core/nodes/ObjectNode/strategies`**

- `__legacy__/core/nodes/ObjectNode/strategies/types`: known organ name `types` (rule 4)

**`__legacy__/core/nodes/ObjectNode/strategies/BranchStrategy`**

- `__legacy__/core/nodes/ObjectNode/strategies/BranchStrategy/utils`: known organ name `utils` (rule 4) ; nested: `__tests__`, `getChildNodeMap`, `getChildren`, `getCompositionKeyInfo`, `getCompositionNodeMapList`, `getConditionsMap`, `getFieldConditionMap`, `getVirtualReferencesMap`, `hasCompositionSchema`, `mergeShowConditions`, `processValueWithSchema`, `validateSchemaType`
- `__legacy__/core/nodes/ObjectNode/strategies/BranchStrategy/utils/__tests__`: infrastructure name (rule 3)
- `__legacy__/core/nodes/ObjectNode/strategies/BranchStrategy/utils/hasCompositionSchema`: leaf directory, no fractal children (rule 6)

**`__legacy__/core/nodes/ObjectNode/strategies/BranchStrategy/utils/getCompositionNodeMapList`**

- `__legacy__/core/nodes/ObjectNode/strategies/BranchStrategy/utils/getCompositionNodeMapList/utils`: known organ name `utils` (rule 4)

**`__legacy__/core/nodes/ObjectNode/strategies/BranchStrategy/utils/getFieldConditionMap`**

- `__legacy__/core/nodes/ObjectNode/strategies/BranchStrategy/utils/getFieldConditionMap/__tests__`: infrastructure name (rule 3)
- `__legacy__/core/nodes/ObjectNode/strategies/BranchStrategy/utils/getFieldConditionMap/utils`: known organ name `utils` (rule 4)

**`__legacy__/core/nodes/ObjectNode/strategies/BranchStrategy/utils/processValueWithSchema`**

- `__legacy__/core/nodes/ObjectNode/strategies/BranchStrategy/utils/processValueWithSchema/utils`: known organ name `utils` (rule 4)

**`__legacy__/core/parsers`**

- `__legacy__/core/parsers/__tests__`: infrastructure name (rule 3)

**`__legacy__/helpers/jsonSchema/preprocessSchema`**

- `__legacy__/helpers/jsonSchema/preprocessSchema/utils`: known organ name `utils` (rule 4) ; nested: `__tests__`, `processOneOfSchema`, `processVirtualSchema`
- `__legacy__/helpers/jsonSchema/preprocessSchema/utils/__tests__`: infrastructure name (rule 3)

**`__legacy__/helpers/jsonSchema/preprocessSchema/utils/processVirtualSchema`**

- `__legacy__/helpers/jsonSchema/preprocessSchema/utils/processVirtualSchema/utils`: known organ name `utils` (rule 4)

**`__legacy__/helpers/jsonSchema/processAllOfSchema`**

- `__legacy__/helpers/jsonSchema/processAllOfSchema/__tests__`: infrastructure name (rule 3)
- `__legacy__/helpers/jsonSchema/processAllOfSchema/utils`: known organ name `utils` (rule 4) ; nested: `__tests__`, `getCloneDepth`, `getMergeSchemaHandler`, `validateCompatibility`
- `__legacy__/helpers/jsonSchema/processAllOfSchema/utils/__tests__`: infrastructure name (rule 3)

**`__legacy__/helpers/jsonSchema/processAllOfSchema/intersectSchema`**

- `__legacy__/helpers/jsonSchema/processAllOfSchema/intersectSchema/__test__`: infrastructure name (rule 3)
- `__legacy__/helpers/jsonSchema/processAllOfSchema/intersectSchema/utils`: known organ name `utils` (rule 4) ; nested: `__tests__`
- `__legacy__/helpers/jsonSchema/processAllOfSchema/intersectSchema/utils/__tests__`: infrastructure name (rule 3)

Organs with nested directories (126): `__legacy__`, `__legacy__/app`, `__legacy__/core`, `__legacy__/core/__tests__`, `__legacy__/core/blueprint`, `__legacy__/core/blueprint/utils`, `__legacy__/core/blueprint/utils/analyze`, `__legacy__/core/blueprint/utils/analyze/compileBlueprintExpressions`, `__legacy__/core/blueprint/utils/analyze/validateShape`, `__legacy__/core/blueprint/utils/effectiveSchema`, `__legacy__/core/blueprint/utils/expressions`, `__legacy__/core/blueprint/utils/expressions/createDynamicFunction`, `__legacy__/core/blueprint/utils/features`, `__legacy__/core/blueprint/utils/features/getFeatureNodeIndex`, `__legacy__/core/blueprint/utils/itemEntry`, `__legacy__/core/blueprint/utils/itemEntry/getItemEntry`, `__legacy__/core/blueprint/utils/stripSchema`, `__legacy__/core/nodes/AbstractNode/utils`, `__legacy__/core/nodes/AbstractNode/utils/findNode/utils`, `__legacy__/core/nodes/AbstractNode/utils/getComputedPropertiesManager/ComputedPropertiesManager/utils`, `__legacy__/core/nodes/AbstractNode/utils/getComputedPropertiesManager/utils`, `__legacy__/core/nodes/ArrayNode/strategies/BranchStrategy/utils`, `__legacy__/core/nodes/ArrayNode/utils`, `__legacy__/core/nodes/ObjectNode/strategies/BranchStrategy/utils`, `__legacy__/core/nodes/ObjectNode/utils`, `__legacy__/core/record`, `__legacy__/core/utils`, `__legacy__/core/utils/pathIndex`, `__legacy__/core/utils/pathIndex/utils`, `__legacy__/core/validation`, `__legacy__/core/validation/utils`, `__legacy__/helpers`, `__legacy__/helpers/defaultValue`, `__legacy__/helpers/dynamicExpression`, `__legacy__/helpers/error`, `__legacy__/helpers/error/formatErrorMessage`, `__legacy__/helpers/error/formatValidationError`, `__legacy__/helpers/jsonPointer`, `__legacy__/helpers/jsonSchema`, `__legacy__/helpers/jsonSchema/getResolveSchema`, `__legacy__/helpers/jsonSchema/preprocessSchema/utils`, `__legacy__/helpers/jsonSchema/processAllOfSchema/intersectSchema/utils`, `__legacy__/helpers/jsonSchema/processAllOfSchema/utils`, `__legacy__/helpers/jsonSchema/stripSchemaExtensions`, `__legacy__/helpers/jsonSchema/stripSchemaExtensions/utils`, `__legacy__/helpers/schemaIntersection`, `__tests__`, `components`, `components/SchemaNode/SchemaNodeInput/__tests__`, `components/SchemaNode/SchemaNodeInput/hooks`, `components/SchemaNode/SchemaNodeProxy/__tests__`, `core/SchemaNode/utils`, `core/SchemaNode/utils/binding`, `core/__tests__`, `core/__tests__/regression`, `core/__tests__/scenarios`, `core/__tests__/scenarios/utils`, `core/behaviors/arrayBehavior/branch`, `core/behaviors/arrayBehavior/utils`, `core/behaviors/objectBehavior/branch`, `core/behaviors/objectBehavior/branch/utils`, `core/behaviors/objectBehavior/utils`, `core/behaviors/utils`, `core/behaviors/utils/options`, `core/behaviors/utils/parse`, `core/behaviors/utils/parse/utils`, `core/behaviors/virtualBehavior/utils`, `core/blueprint/__tests__`, `core/blueprint/utils`, `core/blueprint/utils/analyze`, `core/blueprint/utils/analyze/__tests__`, `core/blueprint/utils/analyze/compileBlueprintExpressions`, `core/blueprint/utils/analyze/populateNodeChildren`, `core/blueprint/utils/analyze/validateShape`, `core/blueprint/utils/effectiveSchema`, `core/blueprint/utils/effectiveSchema/utils`, `core/blueprint/utils/effectiveSchema/utils/applySchemaContribution`, `core/blueprint/utils/effectiveSchema/utils/applySchemaContribution/utils`, `core/blueprint/utils/effectiveSchema/utils/mergeHintGroup`, `core/blueprint/utils/effectiveSchema/utils/mergeSchemaContributions`, `core/blueprint/utils/effectiveSchema/utils/mergeSchemaContributions/utils`, `core/blueprint/utils/expressions`, `core/blueprint/utils/features`, `core/blueprint/utils/features/getFeatureNodeIndex`, `core/blueprint/utils/features/getFeatureNodeIndex/utils`, `core/blueprint/utils/itemEntry`, `core/blueprint/utils/itemEntry/getItemEntry`, `core/blueprint/utils/stripSchema`, `core/blueprint/utils/types`, `core/dispatch/__tests__`, `core/dispatch/utils`, `core/dispatch/utils/chain`, `core/dispatch/utils/entry`, `core/navigation/__tests__`, `core/navigation/utils`, `core/navigation/utils/query`, `core/record/utils`, `core/settle/__tests__`, `core/settle/__tests__/fixtures`, `core/settle/derive/__tests__`, `core/settle/derive/utils`, `core/settle/derive/utils/evaluate`, `core/settle/derive/utils/rank`, `core/settle/derive/utils/rules`, `core/settle/utils`, `core/settle/utils/commit`, `core/settle/utils/compute`, `core/settle/utils/compute/selectChildren`, `core/settle/utils/controls`, `core/settle/utils/derivation`, `core/settle/utils/latent`, `core/settle/utils/structure`, `core/settle/utils/structure/applyArraySlots`, `core/settle/utils/write`, `core/utils`, `core/utils/pathIndex`, `core/utils/pathIndex/utils`, `core/validation/utils`, `formTypeDefinitions/FormTypeInputUnion`, `helpers`, `helpers/error/__tests__`, `helpers/error/formatValidationError/utils`, `helpers/jsonPointer/utils`, `hooks`, `providers/RootNodeContext/utils`, `types`

## 3. Findings

Totals: scan summary says `violationCount` 79 but lists none of them. Validate lists 65 (`findingCount` 65, passed 1587, failed 65). Both artifacts contain the identical 479 diagnostics. The 14-record gap between 79 and 65 cannot be itemized from the files. Every finding is `certainty: indeterminate` or a warning; no `error` severity exists ({'warning': 65}).

None of these findings carries consumer paths, cycle members, or a missing-entry-point field. The only evidence fields are `path`, `message`, `suggestion`, and on diagnostics `affects` and `nextAction`.

### 3a. Validate artifact violations by rule

| rule | count | certainty | severity |
|---|---|---|---|
| `entry-point-surface` | 63 | indeterminate | warning |
| `circular-dependency` | 1 | indeterminate | warning |
| `external-import-boundary` | 1 | indeterminate | warning |

**`circular-dependency`** (validate only): path `(src root)`. "Dependency-cycle analysis is indeterminate." Cycle members: none given. Suggestion: follow each dependency diagnostic's nextAction; DAG unproven until graph is exact.

**`external-import-boundary`** (validate only): path `(src root)`. "Import-boundary analysis is indeterminate; unresolved evidence may hide additional boundary crossings." Consumer paths: none given.

**`entry-point-surface`** (validate only, 63): message "Public surface evidence is indeterminate for \"<file>\"", suggestion: write the surface as named exports or named re-exports. Entry points flagged:

- `app/plugin/index.ts`
- `components/FallbackComponents/index.ts`
- `components/Form/index.ts`
- `components/SchemaNode/DeferrableNodeProxy/index.ts`
- `components/SchemaNode/SchemaNodeInput/index.ts`
- `components/SchemaNode/SchemaNodeProxy/index.ts`
- `components/SchemaNode/index.ts`
- `core/SchemaNode/index.ts`
- `core/behaviors/arrayBehavior/index.ts`
- `core/behaviors/booleanBehavior/index.ts`
- `core/behaviors/index.ts`
- `core/behaviors/nullBehavior/index.ts`
- `core/behaviors/numberBehavior/index.ts`
- `core/behaviors/objectBehavior/index.ts`
- `core/behaviors/stringBehavior/index.ts`
- `core/behaviors/unionBehavior/index.ts`
- `core/behaviors/virtualBehavior/index.ts`
- `core/blueprint/index.ts`
- `core/blueprint/utils/expressions/createDynamicFunction/index.ts`
- `core/blueprint/utils/expressions/getPathManager/index.ts`
- `core/dispatch/index.ts`
- `core/index.ts`
- `core/navigation/index.ts`
- `core/record/index.ts`
- `core/settle/derive/index.ts`
- `core/settle/index.ts`
- `core/validation/index.ts`
- `errors/index.ts`
- `formTypeDefinitions/index.tsx`
- `helpers/defaultValue/getDefaultValue/index.ts`
- `helpers/defaultValue/getEmptyValue/index.ts`
- `helpers/defaultValue/getObjectDefaultValue/index.ts`
- `helpers/defaultValue/index.ts`
- `helpers/dynamicExpression/combineConditions/index.ts`
- `helpers/dynamicExpression/convertExpression/index.ts`
- `helpers/dynamicExpression/index.ts`
- `helpers/error/formatErrorMessage/index.ts`
- `helpers/error/formatValidationError/index.ts`
- `helpers/error/index.ts`
- `helpers/formTypeInputDefinition/index.ts`
- `helpers/jsonPointer/index.ts`
- `helpers/jsonSchema/extractSchemaInfo/index.ts`
- `helpers/jsonSchema/getResolveSchema/index.ts`
- `helpers/jsonSchema/index.ts`
- `helpers/jsonSchema/isNullBranch/index.ts`
- `helpers/jsonSchema/stripSchemaExtensions/index.ts`
- `helpers/schemaIdentity/index.ts`
- `helpers/schemaIntersection/index.ts`
- `helpers/virtualization/VirtualizationManager/index.ts`
- `helpers/virtualization/index.ts`
- `helpers/virtualization/resolveVirtualizationOptions/index.ts`
- `helpers/warning/index.ts`
- `index.ts`
- `providers/ExternalFormContext/index.ts`
- `providers/FormErrorContext/index.ts`
- `providers/FormTypeInputsContext/index.ts`
- `providers/FormTypeRendererContext/index.ts`
- `providers/InputControlContext/index.ts`
- `providers/RootNodeContext/index.ts`
- `providers/VirtualizationContext/index.ts`
- `providers/WorkspaceContext/index.ts`
- `providers/index.ts`
- `types/rolled/index.ts`

### 3b. Diagnostics (both artifacts, identical)

| code | count | affects |
|---|---|---|
| `verification-facts-unavailable` | 402 | [('verification',)] |
| `entry-point-facts-unavailable` | 67 | [('boundaries',)] |
| `detail-document-contract` | 9 | [()] |
| `intent-document-contract` | 1 | [()] |

**`entry-point-facts-unavailable`** (67): "facts store holds no usable entry surface ... the file is missing". Same files as the 63 entry-point-surface violations, so deduplicated; the 4 diagnostics with no matching violation: `app/constants/index.ts`, `components/Form/components/index.ts`, `helpers/jsonPointer/utils/index.ts`, `types/index.ts`. Distinct messages: 1.

**`verification-facts-unavailable`** (402, affects verification only): test/verification files whose facts record is missing. By directory:

- `__tests__`: 3
- `__tests__/e2e`: 27
- `__tests__/migration`: 6
- `__tests__/scenarios`: 11
- `app/plugin/__tests__`: 2
- `components/Form/__tests__`: 10
- `components/SchemaNode/DeferrableNodeProxy/__tests__`: 1
- `components/SchemaNode/SchemaNodeInput/__tests__`: 7
- `components/SchemaNode/SchemaNodeProxy/__tests__`: 3
- `components/SchemaNode/__tests__`: 1
- `core/SchemaNode/__tests__`: 6
- `core/SchemaNode/utils/binding/__tests__`: 3
- `core/__tests__`: 9
- `core/__tests__/regression`: 24
- `core/__tests__/scenarios`: 16
- `core/__tests__/scenarios/utils/__tests__`: 1
- `core/behaviors/__tests__`: 2
- `core/behaviors/arrayBehavior/__tests__`: 1
- `core/behaviors/objectBehavior/branch/utils/__tests__`: 2
- `core/behaviors/unionBehavior/__tests__`: 2
- `core/behaviors/utils/options/__tests__`: 1
- `core/behaviors/utils/parse/__tests__`: 2
- `core/blueprint/__tests__`: 33
- `core/blueprint/utils/analyze/__tests__`: 2
- `core/blueprint/utils/effectiveSchema/utils/__tests__`: 1
- `core/blueprint/utils/effectiveSchema/utils/applySchemaContribution/utils/__tests__`: 1
- `core/blueprint/utils/effectiveSchema/utils/mergeSchemaContributions/utils/__tests__`: 1
- `core/blueprint/utils/expressions/__tests__`: 23
- `core/blueprint/utils/expressions/createDynamicFunction/__tests__`: 23
- `core/blueprint/utils/features/getFeatureNodeIndex/utils/__tests__`: 1
- `core/blueprint/utils/types/__tests__`: 1
- `core/dispatch/__tests__`: 22
- `core/navigation/__tests__`: 1
- `core/record/__tests__`: 1
- `core/record/utils/__tests__`: 2
- `core/settle/__tests__`: 85
- `core/settle/derive/__tests__`: 5
- `core/settle/utils/compute/__tests__`: 1
- `core/settle/utils/controls/__tests__`: 1
- `core/settle/utils/latent/__tests__`: 1
- `core/settle/utils/structure/__tests__`: 1
- `core/settle/utils/write/__tests__`: 2
- `core/utils/pathIndex/__tests__`: 1
- `core/validation/__tests__`: 12
- `errors/__tests__`: 1
- `formTypeDefinitions/__tests__`: 4
- `helpers/defaultValue/getDefaultValue/__tests__`: 1
- `helpers/defaultValue/getObjectDefaultValue/__tests__`: 1
- `helpers/dynamicExpression/convertExpression/__tests__`: 1
- `helpers/error/__tests__`: 1
- `helpers/error/formatValidationError/utils/__tests__`: 2
- `helpers/formTypeInputDefinition/__tests__`: 4
- `helpers/jsonPointer/utils/__tests__`: 4
- `helpers/jsonSchema/__tests__`: 3
- `helpers/schemaIntersection/__tests__`: 1
- `helpers/virtualization/__tests__`: 2
- `helpers/warning/__tests__`: 1
- `hooks/__tests__`: 3
- `providers/FormErrorContext/__tests__`: 1
- `providers/RootNodeContext/__tests__`: 4
- `providers/RootNodeContext/utils/__tests__`: 1
- `types/__tests__`: 6

**Document-contract diagnostics** (10, empty `affects`): a path token in a DETAIL.md or INTENT.md resolves to nothing.

- `DETAIL.md` (detail-document-contract): token `src/__legacy__/` in section "Requirements"
- `core/DETAIL.md` (detail-document-contract): token `src/__legacy__/core/` in section "Requirements"
- `core/DETAIL.md` (detail-document-contract): token `src/index.ts` in section "Requirements"
- `core/DETAIL.md` (detail-document-contract): token `src/__legacy__/` in section "Requirements"
- `core/DETAIL.md` (detail-document-contract): token `src/index.ts` in section "API Contracts"
- `core/settle/DETAIL.md` (detail-document-contract): token `src/errors/` in section "API Contracts"
- `core/SchemaNode/DETAIL.md` (detail-document-contract): token `src/core/__tests__/scenarios/utils/` in section "Requirements"
- `core/SchemaNode/DETAIL.md` (detail-document-contract): token `src/index.ts` in section "API Contracts"
- `core/validation/INTENT.md` (intent-document-contract): token `src/index.ts` in section "Conventions"
- `core/validation/DETAIL.md` (detail-document-contract): token `src/index.ts` in section "API Contracts"

### 3c. Legacy findings

None. No violation or diagnostic path is under `__legacy__`; only the DETAIL.md tokens `src/__legacy__/` and `src/__legacy__/core/` are mentioned as drifted references (listed in 3b).

## 4. Counts per top-level directory

Fractals and organs are the reconstruction (non-legacy organs total 207, scan says 211). Findings count validate violations plus all diagnostics by path.

| top-level | fractals | organs | violations | diagnostics |
|---|---|---|---|---|
| (src root, incl. root index.ts and DETAIL.md) | 1 | 0 | 3 | 2 |
| __legacy__ | 64 | 112 | 0 | 0 |
| __tests__ | 0 | 5 | 0 | 47 |
| app | 2 | 2 | 1 | 4 |
| components | 6 | 11 | 6 | 29 |
| core | 20 | 157 | 20 | 319 |
| errors | 1 | 1 | 1 | 2 |
| formTypeDefinitions | 1 | 3 | 1 | 5 |
| helpers | 23 | 19 | 23 | 45 |
| hooks | 0 | 2 | 0 | 3 |
| providers | 9 | 5 | 9 | 15 |
| types | 1 | 2 | 1 | 8 |
