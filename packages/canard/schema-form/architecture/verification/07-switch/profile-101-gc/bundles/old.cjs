var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// packages/aileron/benchmark-form/profile-engine-entry.ts
var profile_engine_entry_exports = {};
__export(profile_engine_entry_exports, {
  equivalentFixtures: () => equivalentFixtures,
  nodeFromJSONSchema: () => nodeFromJSONSchema
});
module.exports = __toCommonJS(profile_engine_entry_exports);

// packages/canard/schema-form/src/__legacy__/helpers/jsonSchema/extractSchemaInfo/extractSchemaInfo.ts
var import_filter = require("@winglet/common-utils/filter");
var extractSchemaInfo = (jsonSchema) => {
  if (jsonSchema === void 0) return null;
  const type = jsonSchema.type;
  if (type === void 0) return null;
  if ((0, import_filter.isArray)(type)) {
    if (type.length === 0 || type.length > 2) return null;
    if (type.length === 1)
      return { type: type[0], nullable: type[0] === "null" };
    const nullIndex = type.indexOf("null");
    if (nullIndex === -1) return null;
    return { type: type[nullIndex === 0 ? 1 : 0], nullable: true };
  }
  return {
    type,
    nullable: type === "null" || jsonSchema.nullable === true
  };
};

// packages/canard/schema-form/src/__legacy__/helpers/jsonSchema/getResolveSchema/utils/getReferenceTable.ts
var import_scanner = require("@winglet/json-schema/scanner");
var import_pointer = require("@winglet/json/pointer");
var getReferenceTable = (jsonSchema) => {
  const referenceTable = /* @__PURE__ */ new Map();
  new import_scanner.JSONSchemaScanner({
    visitor: {
      exit: ({ schema, hasReference }) => {
        if (hasReference && typeof schema.$ref === "string")
          referenceTable.set(schema.$ref, (0, import_pointer.getValue)(jsonSchema, schema.$ref));
      }
    }
  }).scan(jsonSchema);
  if (referenceTable.size === 0) return null;
  return referenceTable;
};

// packages/canard/schema-form/src/__legacy__/helpers/jsonSchema/getResolveSchema/utils/getResolveSchemaScanner.ts
var import_filter2 = require("@winglet/common-utils/filter");
var import_object = require("@winglet/common-utils/object");
var import_scanner2 = require("@winglet/json-schema/scanner");
var getResolveSchemaScanner = (referenceTable, maxDepth) => new import_scanner2.JSONSchemaScanner({
  options: {
    resolveReference: (path, entry) => {
      const { $ref: _, ...preferredSchema } = entry.schema;
      const referenceSchema = referenceTable.get(path);
      if (referenceSchema === void 0) return;
      if ((0, import_filter2.isEmptyObject)(preferredSchema)) return referenceSchema;
      return (0, import_object.merge)((0, import_object.clone)(referenceSchema), preferredSchema);
    },
    maxDepth
  }
});

// packages/canard/schema-form/src/__legacy__/helpers/jsonSchema/getResolveSchema/getResolveSchema.ts
var getResolveSchema = (jsonSchema, maxDepth = 1) => {
  const table = getReferenceTable(jsonSchema);
  const scanner = table ? getResolveSchemaScanner(table, maxDepth) : null;
  return scanner ? (schema) => schema !== void 0 ? scanner.scan(schema).getValue() : void 0 : null;
};

// packages/canard/schema-form/src/__legacy__/helpers/jsonSchema/isNullBranch/isNullBranch.ts
var isNullBranch = (schema) => extractSchemaInfo(schema)?.type === "null";

// packages/canard/schema-form/src/__legacy__/helpers/jsonSchema/stripSchemaExtensions/stripSchemaExtensions.ts
var import_object2 = require("@winglet/common-utils/object");
var import_scanner3 = require("@winglet/json-schema/scanner");

// packages/canard/schema-form/src/__legacy__/helpers/jsonSchema/stripSchemaExtensions/utils/hasExtensionKeys/hasExtensionKeys.ts
var hasExtensionKeys = (schema) => schema.FormTypeInput !== void 0 || schema.FormTypeInputProps !== void 0 || schema.FormTypeRendererProps !== void 0 || schema.errorMessages !== void 0 || schema.options !== void 0 || schema.injectTo !== void 0;

// packages/canard/schema-form/src/__legacy__/helpers/jsonSchema/stripSchemaExtensions/stripSchemaExtensions.ts
var stripSchemaExtensions = (jsonSchema) => {
  const cloned = (0, import_object2.clone)(jsonSchema);
  const result = new import_scanner3.JSONSchemaScanner({ options: { mutate } }).scan(cloned).getValue();
  return result === cloned ? jsonSchema : result;
};
var mutate = ({
  schema
}) => {
  if (schema == null || !hasExtensionKeys(schema)) return;
  const {
    FormTypeInput,
    FormTypeInputProps,
    FormTypeRendererProps,
    errorMessages,
    options,
    injectTo,
    ...stripedSchema
  } = schema;
  return stripedSchema;
};

// packages/canard/schema-form/src/__legacy__/helpers/jsonSchema/filter.ts
var isTerminalType = (type) => type === "boolean" || type === "number" || type === "integer" || type === "string" || type === "null";
var isBranchType = (type) => type === "array" || type === "object" || type === "virtual";

// packages/canard/schema-form/src/__legacy__/app/constants/bitmask.ts
var BIT_MASK_ALL = ~0;
var BIT_MASK_NONE = 0;
var BIT_FLAG_00 = 1;
var BIT_FLAG_01 = 2;
var BIT_FLAG_02 = 4;
var BIT_FLAG_03 = 8;
var BIT_FLAG_04 = 16;
var BIT_FLAG_05 = 32;
var BIT_FLAG_06 = 64;
var BIT_FLAG_07 = 128;
var BIT_FLAG_08 = 256;
var BIT_FLAG_09 = 512;
var BIT_FLAG_10 = 1024;
var BIT_FLAG_11 = 2048;
var BIT_FLAG_12 = 4096;
var BIT_FLAG_13 = 8192;
var BIT_FLAG_14 = 16384;
var BIT_FLAG_15 = 32768;
var BIT_FLAG_16 = 65536;

// packages/canard/schema-form/src/__legacy__/app/constants/control.ts
var UNIT_SEPARATOR = "";
var START_OF_TEXT = "";
var END_OF_TEXT = "";

// packages/canard/schema-form/src/__legacy__/app/constants/internal.ts
var ENHANCED_KEY = START_OF_TEXT + UNIT_SEPARATOR + END_OF_TEXT;

// packages/canard/schema-form/src/__legacy__/core/types/event.ts
var NodeEventType = /* @__PURE__ */ ((NodeEventType2) => {
  NodeEventType2[NodeEventType2["Initialized"] = BIT_FLAG_00] = "Initialized";
  NodeEventType2[NodeEventType2["UpdatePath"] = BIT_FLAG_01] = "UpdatePath";
  NodeEventType2[NodeEventType2["UpdateValue"] = BIT_FLAG_02] = "UpdateValue";
  NodeEventType2[NodeEventType2["UpdateState"] = BIT_FLAG_03] = "UpdateState";
  NodeEventType2[NodeEventType2["UpdateGlobalState"] = BIT_FLAG_04] = "UpdateGlobalState";
  NodeEventType2[NodeEventType2["UpdateError"] = BIT_FLAG_05] = "UpdateError";
  NodeEventType2[NodeEventType2["UpdateGlobalError"] = BIT_FLAG_06] = "UpdateGlobalError";
  NodeEventType2[NodeEventType2["UpdateChildren"] = BIT_FLAG_07] = "UpdateChildren";
  NodeEventType2[NodeEventType2["UpdateComputedProperties"] = BIT_FLAG_08] = "UpdateComputedProperties";
  NodeEventType2[NodeEventType2["Focused"] = BIT_FLAG_09] = "Focused";
  NodeEventType2[NodeEventType2["Blurred"] = BIT_FLAG_10] = "Blurred";
  NodeEventType2[NodeEventType2["RequestFocus"] = BIT_FLAG_11] = "RequestFocus";
  NodeEventType2[NodeEventType2["RequestSelect"] = BIT_FLAG_12] = "RequestSelect";
  NodeEventType2[NodeEventType2["RequestRefresh"] = BIT_FLAG_13] = "RequestRefresh";
  NodeEventType2[NodeEventType2["RequestRemount"] = BIT_FLAG_14] = "RequestRemount";
  NodeEventType2[NodeEventType2["RequestEmitChange"] = BIT_FLAG_15] = "RequestEmitChange";
  NodeEventType2[NodeEventType2["RequestInjection"] = BIT_FLAG_16] = "RequestInjection";
  return NodeEventType2;
})(NodeEventType || {});
var PublicNodeEventType = ((PublicNodeEventType2) => {
  PublicNodeEventType2[PublicNodeEventType2["UpdateValue"] = NodeEventType.UpdateValue] = "UpdateValue";
  PublicNodeEventType2[PublicNodeEventType2["UpdateState"] = NodeEventType.UpdateState] = "UpdateState";
  PublicNodeEventType2[PublicNodeEventType2["UpdateError"] = NodeEventType.UpdateError] = "UpdateError";
  PublicNodeEventType2[PublicNodeEventType2["RequestFocus"] = NodeEventType.RequestFocus] = "RequestFocus";
  PublicNodeEventType2[PublicNodeEventType2["RequestSelect"] = NodeEventType.RequestSelect] = "RequestSelect";
  PublicNodeEventType2[PublicNodeEventType2["RequestRemount"] = NodeEventType.RequestRemount] = "RequestRemount";
  return PublicNodeEventType2;
})(PublicNodeEventType || {});

// packages/canard/schema-form/src/__legacy__/core/types/state.ts
var ValidationMode = /* @__PURE__ */ ((ValidationMode2) => {
  ValidationMode2[ValidationMode2["None"] = BIT_MASK_NONE] = "None";
  ValidationMode2[ValidationMode2["OnChange"] = BIT_FLAG_00] = "OnChange";
  ValidationMode2[ValidationMode2["OnRequest"] = BIT_FLAG_01] = "OnRequest";
  return ValidationMode2;
})(ValidationMode || {});

// packages/canard/schema-form/src/__legacy__/core/types/value.ts
var SetValueOption = ((SetValueOption2) => {
  SetValueOption2[SetValueOption2["None"] = BIT_MASK_NONE] = "None";
  SetValueOption2[SetValueOption2["Replace"] = BIT_FLAG_00] = "Replace";
  SetValueOption2[SetValueOption2["EmitChange"] = BIT_FLAG_01] = "EmitChange";
  SetValueOption2[SetValueOption2["Propagate"] = BIT_FLAG_02] = "Propagate";
  SetValueOption2[SetValueOption2["Refresh"] = BIT_FLAG_03] = "Refresh";
  SetValueOption2[SetValueOption2["Batch"] = BIT_FLAG_04] = "Batch";
  SetValueOption2[SetValueOption2["Isolate"] = BIT_FLAG_05] = "Isolate";
  SetValueOption2[SetValueOption2["Normalize"] = BIT_FLAG_06] = "Normalize";
  SetValueOption2[SetValueOption2["PublishUpdateEvent"] = BIT_FLAG_07] = "PublishUpdateEvent";
  SetValueOption2[SetValueOption2["PreventInjection"] = BIT_FLAG_08] = "PreventInjection";
  SetValueOption2[SetValueOption2["Automatic"] = BIT_FLAG_09] = "Automatic";
  SetValueOption2[SetValueOption2["BatchedEmitChange"] = SetValueOption2.EmitChange | SetValueOption2.Batch] = "BatchedEmitChange";
  SetValueOption2[SetValueOption2["Default"] = SetValueOption2.EmitChange | SetValueOption2.PublishUpdateEvent] = "Default";
  SetValueOption2[SetValueOption2["BatchDefault"] = SetValueOption2.Batch | SetValueOption2.Default] = "BatchDefault";
  SetValueOption2[SetValueOption2["Reset"] = SetValueOption2.Replace | SetValueOption2.Propagate | SetValueOption2.BatchDefault | SetValueOption2.PreventInjection | SetValueOption2.Automatic] = "Reset";
  SetValueOption2[SetValueOption2["IsolateReset"] = SetValueOption2.Reset | SetValueOption2.Isolate] = "IsolateReset";
  SetValueOption2[SetValueOption2["StableReset"] = SetValueOption2.Reset | SetValueOption2.Refresh | SetValueOption2.Normalize] = "StableReset";
  SetValueOption2[SetValueOption2["IsolateStableReset"] = SetValueOption2.StableReset | SetValueOption2.Isolate] = "IsolateStableReset";
  SetValueOption2[SetValueOption2["Merge"] = SetValueOption2.Propagate | SetValueOption2.Refresh | SetValueOption2.Isolate | SetValueOption2.BatchDefault] = "Merge";
  SetValueOption2[SetValueOption2["Overwrite"] = SetValueOption2.Replace | SetValueOption2.Merge] = "Overwrite";
  SetValueOption2[SetValueOption2["DisableAutomaticWrites"] = BIT_FLAG_10] = "DisableAutomaticWrites";
  SetValueOption2[SetValueOption2["EnableAutomaticWrites"] = BIT_FLAG_11] = "EnableAutomaticWrites";
  return SetValueOption2;
})(SetValueOption || {});
var PublicSetValueOption = ((PublicSetValueOption2) => {
  PublicSetValueOption2[PublicSetValueOption2["Merge"] = SetValueOption.Merge] = "Merge";
  PublicSetValueOption2[PublicSetValueOption2["Overwrite"] = SetValueOption.Overwrite] = "Overwrite";
  return PublicSetValueOption2;
})(PublicSetValueOption || {});

// packages/canard/schema-form/src/__legacy__/core/nodes/schemaNodeFactory.ts
var import_array10 = require("@winglet/common-utils/array");
var import_constant7 = require("@winglet/common-utils/constant");
var import_filter42 = require("@winglet/common-utils/filter");

// packages/canard/schema-form/src/__legacy__/helpers/jsonSchema/processAllOfSchema/processAllOfSchema.ts
var import_object5 = require("@winglet/common-utils/object");

// packages/canard/schema-form/src/__legacy__/errors/JSONSchemaError.ts
var import_error = require("@winglet/common-utils/error");
var JSONSchemaError = class extends import_error.BaseError {
  constructor(code, message, details = {}) {
    super("JSON_SCHEMA_ERROR", code, message, details);
    this.name = "JSONSchemaError";
  }
};

// packages/canard/schema-form/src/__legacy__/errors/SchemaFormError.ts
var import_error2 = require("@winglet/common-utils/error");
var SchemaFormError = class extends import_error2.BaseError {
  constructor(code, message, details = {}) {
    super("SCHEMA_FORM_ERROR", code, message, details);
    this.name = "SchemaFormError";
  }
};

// packages/canard/schema-form/src/__legacy__/helpers/error/formatErrorMessage/utils/constants.ts
var DEFAULT_DIVIDER_WIDTH = 50;
var BOX_LINE_PREFIX = "  \u2502    ";

// packages/canard/schema-form/src/__legacy__/helpers/error/formatErrorMessage/utils/createDivider.ts
var createDivider = (width = DEFAULT_DIVIDER_WIDTH) => "\u2500".repeat(width);

// packages/canard/schema-form/src/__legacy__/helpers/error/formatErrorMessage/formatAllOfIgnoredKeywordWarning.ts
var formatAllOfIgnoredKeywordWarning = (keyword) => {
  const divider = createDivider();
  return `
The '${keyword}' keyword inside 'allOf' is used for JSON Schema validation,
but is not used when constructing the form.

  \u256D${divider}
  \u2502  Keyword:  ${keyword}
  \u2570${divider}

Composition and conditional keywords inside 'allOf' entries are not applied
to form construction (allOf, anyOf, oneOf, not, if, then, else,
dependencies, ...).

How to fix:
  1. Move the '${keyword}' keyword out of the 'allOf' entry
  2. Declare it on the schema that owns the 'allOf', or restructure the branch
`.trim();
};

// packages/canard/schema-form/src/__legacy__/helpers/error/formatErrorMessage/formatNestedCompositionIgnoredWarning.ts
var formatNestedCompositionIgnoredWarning = (scope, nestedScope, path) => {
  const divider = createDivider();
  return `
A nested '${nestedScope}' inside a '${scope}' branch is used for JSON Schema
validation, but is not applied when constructing the form.

  \u256D${divider}
  \u2502  Path:    ${path || "/"}
  \u2502  Nested:  '${nestedScope}' inside '${scope}'
  \u2570${divider}

Only 'oneOf'/'anyOf' declared as a sibling of 'type' drives form construction.
A composition nested directly inside another composition branch is ignored.

How to fix:
  1. Wrap it in a nested object that owns the composition:
       { type: 'object', ${nestedScope}: [ ... ] }
  2. Or lift the '${nestedScope}' onto a schema that declares its own 'type'
`.trim();
};

// packages/canard/schema-form/src/__legacy__/helpers/error/formatErrorMessage/formatNullBranchIgnoredWarning.ts
var formatNullBranchIgnoredWarning = (scope, ignored, path) => {
  const divider = createDivider();
  return `
A '${scope}' branch of type 'null' is used for JSON Schema validation only;
the form does not read its ${ignored.join(" or ")}.

  \u256D${divider}
  \u2502  Path:     ${path || "/"}
  \u2502  Ignored:  ${ignored.join(", ")}
  \u2570${divider}

A null branch has no fields and is never the active branch. Whether the
object is null is decided by its value \u2014 setValue(null), a null default \u2014
not by a branch condition.

How to fix:
  1. Keep the null branch bare:
       { type: 'null' }
  2. Put fields and conditions on the branches of type 'object'
`.trim();
};

// packages/canard/schema-form/src/__legacy__/helpers/error/formatErrorMessage/formatNullUnreachableWarning.ts
var formatNullUnreachableWarning = (path, admitting) => {
  const divider = createDivider();
  const cause = admitting === 0 ? "no branch accepts null, so null matches none of them" : `${admitting} branches accept null, so null matches more than one`;
  return `
This object is nullable, but no validator accepts null under its 'oneOf':
${cause}.

  \u256D${divider}
  \u2502  Path:                    ${path || "/"}
  \u2502  Branches accepting null: ${admitting} (exactly 1 is required)
  \u2570${divider}

A branch that declares no 'type' accepts null, because 'properties' and
'required' only apply to objects. The form keeps a null value as it is, so
validation of that value fails.

How to fix:
  1. Add one null branch and declare the type of the object branches:
       oneOf: [
         { type: 'null' },
         { type: 'object', properties: { ... } },
       ]
  2. Or use 'anyOf', which a null branch alone satisfies
`.trim();
};

// packages/canard/schema-form/src/__legacy__/helpers/error/formatErrorMessage/utils/formatBulletList.ts
var formatBulletList = (items2, prefix = BOX_LINE_PREFIX, emptyMessage = "(none)") => {
  if (items2.length === 0) return `${prefix}${emptyMessage}`;
  return items2.map((item) => `${prefix}\u2022 ${item}`).join("\n");
};

// packages/canard/schema-form/src/__legacy__/helpers/error/formatErrorMessage/formatInfiniteLoopError.ts
var formatInfiniteLoopError = (path, dependencies, batchCount, maxBatchCount) => {
  const divider = createDivider();
  const dependenciesSection = formatBulletList(dependencies);
  return `
Infinite loop detected in derived value computation.

  \u256D${divider}
  \u2502  Node:         ${path}
  \u2502  Batch Count:  ${batchCount} (exceeded maximum of ${maxBatchCount})
  \u251C${divider}
  \u2502  Dependencies:
${dependenciesSection}
  \u2570${divider}

This indicates a circular dependency where derived values reference each other
in a loop (e.g., A depends on B, B depends on A).

How to fix:
  1. Check the 'computed.derived' expression in the node above
  2. Look for circular references among the listed dependencies
  3. Break the cycle by removing or restructuring one dependency
`.trim();
};

// packages/canard/schema-form/src/__legacy__/helpers/error/formatErrorMessage/utils/formatJSONPreview.ts
var formatJSONPreview = (value, maxLines = 10, prefix = BOX_LINE_PREFIX) => {
  const lines = JSON.stringify(value, null, 2).split("\n");
  const truncated = lines.length > maxLines;
  const preview = lines.slice(0, maxLines).map((line) => `${prefix}${line}`).join("\n");
  return { preview, truncated };
};

// packages/canard/schema-form/src/__legacy__/helpers/error/formatErrorMessage/formatCircularReferenceError.ts
var formatCircularReferenceError = (originalErrorMessage, schema) => {
  const divider = createDivider();
  const { preview: schemaPreview, truncated } = formatJSONPreview(schema);
  return `
Circular reference detected in JSON Schema.

  \u256D${divider}
  \u2502  Error:     Circular reference in schema definition
  \u2502  Fallback:  Validation will use fallback mode
  \u251C${divider}
  \u2502  Schema Preview:
${schemaPreview}${truncated ? "\n  \u2502    ...(truncated)" : ""}
  \u2570${divider}

Original error: ${originalErrorMessage}

This typically occurs when a schema references itself directly or indirectly,
creating an infinite loop in the schema definition.

How to fix:
  1. Check for $ref references that point back to parent schemas
  2. Look for recursive type definitions without proper termination
  3. Consider using a $defs section with properly scoped references
`.trim();
};

// packages/canard/schema-form/src/__legacy__/helpers/error/formatErrorMessage/utils/getErrorMessage.ts
var getErrorMessage = (error) => error instanceof Error ? error.message : String(error ?? "Unknown error");

// packages/canard/schema-form/src/__legacy__/helpers/error/formatErrorMessage/formatSchemaCompileError.ts
var formatSchemaCompileError = (error, schema) => {
  const divider = createDivider();
  const { preview: schemaPreview, truncated } = formatJSONPreview(schema);
  const message = getErrorMessage(error);
  const [headline] = message.split("\n");
  const kind = error instanceof Error ? error.name : typeof error;
  return `
JSON Schema compilation failed.

  \u256D${divider}
  \u2502  Reason:    ${headline}
  \u2502  Kind:      ${kind}
  \u2502  Fallback:  Validation will use fallback mode
  \u251C${divider}
  \u2502  Schema Preview:
${schemaPreview}${truncated ? "\n  \u2502    ...(truncated)" : ""}
  \u2570${divider}

Original error: ${message}

The validator rejected this schema, so it was never compiled. Validation now
reports this failure for every value instead of checking it.

How to fix:
  1. Read the reason above \u2014 it names the keyword the validator objected to
  2. Remove contradictory keywords (e.g. 'nullable: false' with type ['string', 'null'])
  3. Make sure every $ref resolves inside this schema or its $defs
  4. Check keyword shapes against the JSON Schema spec (e.g. 'required' must be an array)
`.trim();
};

// packages/canard/schema-form/src/__legacy__/helpers/error/formatErrorMessage/formatDynamicFunctionError.ts
var import_filter4 = require("@winglet/common-utils/filter");

// packages/canard/schema-form/src/__legacy__/helpers/error/formatErrorMessage/utils/formatIndexedList.ts
var formatIndexedList = (items2, prefix = BOX_LINE_PREFIX) => items2.map((item, i) => `${prefix}[${i}] ${item}`).join("\n");

// packages/canard/schema-form/src/__legacy__/helpers/error/formatErrorMessage/utils/formatLines.ts
var formatLines = (lines, prefix = BOX_LINE_PREFIX) => lines.map((line) => `${prefix}${line}`).join("\n");

// packages/canard/schema-form/src/__legacy__/helpers/error/formatErrorMessage/utils/formatMultiLine.ts
var formatMultiLine = (text, prefix = "\n  \u2502    ") => text.replace(/\n/g, prefix);

// packages/canard/schema-form/src/__legacy__/helpers/error/formatErrorMessage/utils/formatValuePreview.ts
var formatValuePreview = (value, maxLength = 80) => {
  if (value === null) return "null";
  if (value === void 0) return "undefined";
  try {
    const str = JSON.stringify(value);
    return str.length > maxLength ? `${str.slice(0, maxLength)}...` : str;
  } catch {
    return String(value);
  }
};

// packages/canard/schema-form/src/__legacy__/helpers/error/formatErrorMessage/formatDynamicFunctionError.ts
var formatCreateDynamicFunctionError = (fieldName, expression, functionBody, error) => {
  const divider = createDivider();
  const errorMessage = getErrorMessage(error);
  return `
Failed to create dynamic function for computed property.

  \u256D${divider}
  \u2502  Field:       ${fieldName}
  \u2502  Expression:  '${expression}'
  \u251C${divider}
  \u2502  Generated Function Body:
  \u2502    ${formatMultiLine(functionBody)}
  \u251C${divider}
  \u2502  Error: ${errorMessage}
  \u2570${divider}

The expression could not be compiled into a valid JavaScript function.
This usually indicates a syntax error in the computed property expression.

How to fix:
  1. Check the expression syntax for typos or invalid JavaScript
  2. Ensure all JSONPointer paths (e.g., '../fieldName') are valid
  3. Verify that the expression returns a valid value
  4. Check for unbalanced parentheses or brackets
`.trim();
};
var formatConditionIndexError = (fieldName, expressions, lines, error) => {
  const divider = createDivider();
  const errorMessage = getErrorMessage(error);
  const expressionsSection = formatIndexedList(expressions);
  const linesSection = formatLines(lines);
  return `
Failed to create condition index function for '${fieldName}'.

  \u256D${divider}
  \u2502  Field:  ${fieldName}
  \u251C${divider}
  \u2502  Condition Expressions:
${expressionsSection}
  \u251C${divider}
  \u2502  Generated Code:
${linesSection}
  \u251C${divider}
  \u2502  Error: ${errorMessage}
  \u2570${divider}

The condition expressions could not be compiled into a valid function.
This typically occurs when '&if' expressions contain invalid syntax.

How to fix:
  1. Check each '&if' expression for valid JavaScript syntax
  2. Ensure JSONPointer paths in conditions are correct
  3. Verify that comparison operators are properly used
  4. Look for missing quotes around string comparisons
`.trim();
};
var formatObservedValuesError = (fieldName, watch, watchValueIndexes, error) => {
  const divider = createDivider();
  const errorMessage = getErrorMessage(error);
  const watchDisplay = formatValuePreview(watch);
  const watchPaths = (0, import_filter4.isArray)(watch) ? watch : [watch];
  const watchSection = watchPaths.map((path, i) => `  \u2502    [${i}] ${path} \u2192 index ${watchValueIndexes[i]}`).join("\n");
  return `
Failed to create observed values function for '${fieldName}'.

  \u256D${divider}
  \u2502  Field:  ${fieldName}
  \u2502  Watch:  ${watchDisplay}
  \u251C${divider}
  \u2502  Watch Path Mappings:
${watchSection}
  \u251C${divider}
  \u2502  Error: ${errorMessage}
  \u2570${divider}

The watch configuration could not be compiled into a valid function.
This monitors dependencies defined in 'computed.watch' or '&watch'.

How to fix:
  1. Verify that all watch paths are valid JSONPointer paths
  2. Check that watched fields exist in the schema
  3. Ensure watch values are strings or an array of strings
  4. Look for syntax errors in path expressions
`.trim();
};
var formatConditionIndicesError = (fieldName, expressions, lines, error) => {
  const divider = createDivider();
  const errorMessage = getErrorMessage(error);
  const expressionsSection = formatIndexedList(expressions);
  const linesSection = formatLines(lines);
  return `
Failed to create condition indices function for '${fieldName}'.

  \u256D${divider}
  \u2502  Field:  ${fieldName}
  \u251C${divider}
  \u2502  Condition Expressions:
${expressionsSection}
  \u251C${divider}
  \u2502  Generated Code:
${linesSection}
  \u251C${divider}
  \u2502  Error: ${errorMessage}
  \u2570${divider}

The condition expressions could not be compiled into a function that
returns all matching indices. This is used for anyOf/allOf conditions
where multiple schemas can be active simultaneously.

How to fix:
  1. Check each '&if' expression for valid JavaScript syntax
  2. Ensure JSONPointer paths in conditions are correct
  3. Verify that comparison operators are properly used
  4. Look for missing quotes around string comparisons
`.trim();
};

// packages/canard/schema-form/src/__legacy__/helpers/error/formatErrorMessage/utils/formatPrefixItemsPreview.ts
var formatPrefixItemsPreview = (jsonSchema, prefixItemsLength) => {
  const items2 = jsonSchema.prefixItems?.slice(0, 3) ?? [];
  const preview = items2.map((item) => JSON.stringify(item.type || item)).join(", ");
  return preview + (prefixItemsLength > 3 ? ", ..." : "");
};

// packages/canard/schema-form/src/__legacy__/helpers/error/formatErrorMessage/formatArraySchemaError.ts
var formatItemsFalseWithoutPrefixItemsError = (jsonSchema) => {
  const divider = createDivider();
  const { preview: schemaPreview, truncated } = formatJSONPreview(jsonSchema);
  return `
Invalid array schema: 'items: false' requires 'prefixItems' to be defined.

  \u256D${divider}
  \u2502  Schema Type:   array
  \u2502  items:         false
  \u2502  prefixItems:   undefined
  \u251C${divider}
  \u2502  Schema Preview:
${schemaPreview}${truncated ? "\n  \u2502    ...(truncated)" : ""}
  \u2570${divider}

When 'items' is set to 'false', it means no additional items are allowed
beyond those defined in 'prefixItems'. Without 'prefixItems', the array
would have no valid schema for any elements.

How to fix:
  1. Add 'prefixItems' array to define allowed tuple elements:
     {
       "type": "array",
       "items": false,
       "prefixItems": [
         { "type": "string" },
         { "type": "number" }
       ]
     }

  2. Or remove 'items: false' and use a regular items schema:
     {
       "type": "array",
       "items": { "type": "string" }
     }
`.trim();
};
var formatMissingItemsAndPrefixItemsError = (_jsonSchema) => {
  const divider = createDivider();
  return `
Invalid array schema: Array must have 'items' or 'prefixItems' defined.

  \u256D${divider}
  \u2502  Schema Type:   array
  \u2502  items:         undefined
  \u2502  prefixItems:   undefined
  \u2570${divider}

An array schema must define either 'items' (schema for all elements)
or 'prefixItems' (schemas for tuple positions) to be valid.

How to fix:
  1. Add 'items' for homogeneous arrays:
     {
       "type": "array",
       "items": { "type": "string" }
     }

  2. Add 'prefixItems' for tuple arrays:
     {
       "type": "array",
       "prefixItems": [
         { "type": "string" },
         { "type": "number" }
       ]
     }

  3. Combine both for tuples with additional items:
     {
       "type": "array",
       "prefixItems": [{ "type": "string" }],
       "items": { "type": "number" }
     }
`.trim();
};
var formatMaxItemsExceedsPrefixItemsError = (jsonSchema, maxItems, prefixItemsLength) => {
  const divider = createDivider();
  const prefixItemsPreview = formatPrefixItemsPreview(
    jsonSchema,
    prefixItemsLength
  );
  return `
Invalid array schema: 'maxItems' exceeds 'prefixItems' length without 'items' schema.

  \u256D${divider}
  \u2502  Schema Type:      array
  \u2502  maxItems:         ${maxItems}
  \u2502  prefixItems:      [${prefixItemsPreview}] (length: ${prefixItemsLength})
  \u2502  items:            undefined
  \u251C${divider}
  \u2502  Problem:  maxItems (${maxItems}) > prefixItems.length (${prefixItemsLength})
  \u2570${divider}

Without an 'items' schema, there's no definition for array indices
beyond prefixItems. Setting maxItems > prefixItems.length would allow
elements without a schema.

How to fix:
  1. Set maxItems to ${prefixItemsLength} or less:
     { "maxItems": ${prefixItemsLength} }

  2. Or add 'items' schema for additional elements:
     {
       "items": { "type": "string" },
       "maxItems": ${maxItems}
     }
`.trim();
};
var formatMinItemsExceedsPrefixItemsError = (jsonSchema, minItems, prefixItemsLength) => {
  const divider = createDivider();
  const prefixItemsPreview = formatPrefixItemsPreview(
    jsonSchema,
    prefixItemsLength
  );
  return `
Invalid array schema: 'minItems' exceeds 'prefixItems' length without 'items' schema.

  \u256D${divider}
  \u2502  Schema Type:      array
  \u2502  minItems:         ${minItems}
  \u2502  prefixItems:      [${prefixItemsPreview}] (length: ${prefixItemsLength})
  \u2502  items:            undefined
  \u251C${divider}
  \u2502  Problem:  minItems (${minItems}) > prefixItems.length (${prefixItemsLength})
  \u2570${divider}

Without an 'items' schema, there's no way to create array elements
beyond prefixItems. Setting minItems > prefixItems.length would
require elements that cannot be created.

How to fix:
  1. Set minItems to ${prefixItemsLength} or less:
     { "minItems": ${prefixItemsLength} }

  2. Or add 'items' schema for additional elements:
     {
       "items": { "type": "string" },
       "minItems": ${minItems}
     }
`.trim();
};

// packages/canard/schema-form/src/__legacy__/helpers/error/formatErrorMessage/formatUnknownJSONSchemaError.ts
var formatUnknownJSONSchemaError = (unknownType, jsonSchema) => {
  const divider = createDivider();
  const validTypes = [
    "string",
    "number",
    "integer",
    "boolean",
    "array",
    "object",
    "null"
  ];
  const { preview: schemaPreview } = formatJSONPreview(jsonSchema, 8);
  return `
Unknown JSON Schema type encountered.

  \u256D${divider}
  \u2502  Received Type:  '${String(unknownType)}'
  \u2502  Valid Types:    ${validTypes.join(", ")}
  \u251C${divider}
  \u2502  Schema:
${schemaPreview}
  \u2502    ...
  \u2570${divider}

The schema contains a type that is not recognized by the form builder.
Only standard JSON Schema types are supported.

How to fix:
  1. Change the type to one of: ${validTypes.join(", ")}
  2. If using a custom type, ensure it's properly handled
  3. Check for typos in the type name
  4. For nullable types, use: { "type": ["string", "null"] }
`.trim();
};

// packages/canard/schema-form/src/__legacy__/helpers/error/formatErrorMessage/utils/formatType.ts
var import_filter5 = require("@winglet/common-utils/filter");
var formatType = (type, fallback = "(undefined)") => {
  if (type === void 0 || type === null) return fallback;
  if ((0, import_filter5.isArray)(type)) return type.join(" | ");
  return String(type);
};

// packages/canard/schema-form/src/__legacy__/helpers/error/formatErrorMessage/formatAllOfTypeRedefinitionError.ts
var formatAllOfTypeRedefinitionError = (schema, allOfSchema) => {
  const divider = createDivider();
  const baseType = formatType(schema.type);
  const allOfType = formatType(allOfSchema.type);
  return `
Type redefinition not allowed in allOf schema.

  \u256D${divider}
  \u2502  Base Schema Type:   ${baseType}
  \u2502  allOf Schema Type:  ${allOfType}
  \u251C${divider}
  \u2502  Conflict:  allOf schema attempts to change the type
  \u2570${divider}

In JSON Schema, when using 'allOf', the type must either be omitted
in the sub-schemas or match the parent schema type exactly.
Redefining the type in allOf would create an impossible constraint.

How to fix:
  1. Remove the 'type' property from the allOf sub-schema:
     {
       "type": "${baseType}",
       "allOf": [
         { "properties": { ... } }  // No type here
       ]
     }

  2. Or ensure the types match:
     {
       "type": "${baseType}",
       "allOf": [
         { "type": "${baseType}", "properties": { ... } }
       ]
     }

  3. If different types are needed, consider using 'oneOf' instead
`.trim();
};

// packages/canard/schema-form/src/__legacy__/helpers/error/formatErrorMessage/utils/getValueType.ts
var import_filter6 = require("@winglet/common-utils/filter");
var getValueType = (value) => {
  if (value === null) return "null";
  if (value === void 0) return "undefined";
  if ((0, import_filter6.isArray)(value)) return `array with ${value.length} elements`;
  return typeof value;
};

// packages/canard/schema-form/src/__legacy__/helpers/error/formatErrorMessage/formatInvalidVirtualNodeValuesError.ts
var formatInvalidVirtualNodeValuesError = (expectedLength, actualLength, providedValues) => {
  const divider = createDivider();
  const lengthMismatch = actualLength !== void 0 ? `Expected ${expectedLength}, got ${actualLength}` : `Expected ${expectedLength}-element array`;
  return `
Invalid values for virtual node.

  \u256D${divider}
  \u2502  Expected:   ${expectedLength}-element array
  \u2502  Received:   ${getValueType(providedValues)}
  \u2502  Mismatch:   ${lengthMismatch}
  \u251C${divider}
  \u2502  Value Preview:  ${formatValuePreview(providedValues, 50)}
  \u2570${divider}

Virtual nodes expect an array with a specific number of elements
matching the number of reference fields defined in 'virtual.fields'.

How to fix:
  1. Provide an array with exactly ${expectedLength} element(s):
     virtualNode.setValue([value1${expectedLength > 1 ? ", value2" : ""}${expectedLength > 2 ? ", ..." : ""}])

  2. Use 'undefined' to reset all reference values:
     virtualNode.setValue(undefined)

  3. Check that virtual.fields configuration matches your data structure
`.trim();
};

// packages/canard/schema-form/src/__legacy__/helpers/error/formatErrorMessage/utils/formatPropertyKeysPreview.ts
var formatPropertyKeysPreview = (properties = {}) => {
  const propertyKeys = Object.keys(properties);
  const slicedPropertyKeys = propertyKeys.slice(0, 5);
  return slicedPropertyKeys.length > 0 ? slicedPropertyKeys.join(", ") + (propertyKeys.length > 5 ? ", ..." : "") : "(none)";
};

// packages/canard/schema-form/src/__legacy__/helpers/error/formatErrorMessage/formatCompositionSchemaError.ts
var formatCompositionTypeRedefinitionError = (scope, jsonSchema, path, parentType, subSchemaType) => {
  const divider = createDivider();
  const parentTypeDisplay = formatType(parentType);
  const subTypeDisplay = formatType(subSchemaType);
  const propertiesPreview = formatPropertyKeysPreview(jsonSchema.properties);
  return `
Type redefinition not allowed in '${scope}' schema.

  \u256D${divider}
  \u2502  Path:              ${path}
  \u2502  Composition:       ${scope}
  \u2502  Parent Type:       ${parentTypeDisplay}
  \u2502  Sub-schema Type:   ${subTypeDisplay}
  \u2502  Properties:        ${propertiesPreview}
  \u251C${divider}
  \u2502  Conflict:  ${scope} sub-schema attempts to change the type
  \u2570${divider}

In composition schemas (oneOf/anyOf), sub-schemas cannot redefine
the type of the parent schema. The type must either be omitted
or match exactly. Under a nullable parent a sub-schema may also
narrow the type to 'object' or to 'null'.

How to fix:
  1. Remove the 'type' from the ${scope} sub-schema:
     {
       "type": "${parentType}",
       "${scope}": [
         { "properties": { ... } }  // No type here
       ]
     }

  2. Or ensure types match:
     {
       "type": "${parentType}",
       "${scope}": [
         { "type": "${parentType}", "properties": { ... } }
       ]
     }
`.trim();
};
var formatCompositionPropertyExclusivenessError = (scope, path, property) => {
  const divider = createDivider();
  return `
Property exclusiveness violation in '${scope}' schema.

  \u256D${divider}
  \u2502  Path:         ${path}
  \u2502  Composition:  ${scope}
  \u2502  Property:     '${property}'
  \u251C${divider}
  \u2502  Conflict:  Property already defined in another ${scope} branch
  \u2570${divider}

In '${scope}' composition, each property can only be defined in one branch.
The property '${property}' appears in multiple ${scope} branches, which
would create ambiguity about which schema definition to use.

How to fix:
  1. Ensure '${property}' is only defined in one ${scope} branch:
     {
       "${scope}": [
         { "properties": { "${property}": { ... } } },
         { "properties": { "otherProp": { ... } } }  // Different property
       ]
     }

  2. Or move the common property to the parent schema:
     {
       "properties": { "${property}": { ... } },
       "${scope}": [
         { "properties": { "branch1Prop": { ... } } },
         { "properties": { "branch2Prop": { ... } } }
       ]
     }
`.trim();
};
var formatCompositionPropertyRedefinitionError = (scope, path, property) => {
  const divider = createDivider();
  return `
Property redefinition not allowed in '${scope}' schema.

  \u256D${divider}
  \u2502  Path:         ${path}
  \u2502  Composition:  ${scope}
  \u2502  Property:     '${property}'
  \u251C${divider}
  \u2502  Conflict:  Property already defined in parent schema
  \u2570${divider}

A property defined in the parent schema's 'properties' cannot be
redefined in a '${scope}' sub-schema. The property '${property}'
exists in the parent and cannot be overridden.

How to fix:
  1. Remove '${property}' from the ${scope} sub-schema:
     {
       "properties": { "${property}": { ... } },
       "${scope}": [
         { "properties": { "newProp": { ... } } }  // Only new properties
       ]
     }

  2. Or move '${property}' to ${scope} branches if it should vary:
     {
       "properties": { "commonProp": { ... } },
       "${scope}": [
         { "properties": { "${property}": { "type": "string" } } },
         { "properties": { "${property}": { "type": "number" } } }
       ]
     }
`.trim();
};

// packages/canard/schema-form/src/__legacy__/helpers/error/formatErrorMessage/utils/formatArrayPreview.ts
var formatArrayPreview = (arr, maxItems = 4) => {
  if (arr.length <= maxItems) {
    return JSON.stringify(arr);
  }
  const preview = arr.slice(0, maxItems - 1).map((v) => JSON.stringify(v));
  return `[${preview.join(", ")}, ... +${arr.length - (maxItems - 1)} more]`;
};

// packages/canard/schema-form/src/__legacy__/helpers/error/formatErrorMessage/formatSchemaIntersectionError.ts
var formatInvalidRangeError = (min, max, errorMessage) => {
  const divider = createDivider();
  return `
Invalid range constraint in schema intersection.

  \u256D${divider}
  \u2502  Minimum:  ${min}
  \u2502  Maximum:  ${max}
  \u251C${divider}
  \u2502  Error:  ${errorMessage}
  \u2570${divider}

When merging schemas with 'allOf', the intersection of range constraints
resulted in an impossible range where minimum exceeds maximum.

How to fix:
  1. Adjust the allOf schemas so their ranges overlap:
     {
       "allOf": [
         { "minimum": 0, "maximum": 100 },
         { "minimum": 50, "maximum": 150 }  // Overlapping range
       ]
     }
     // Results in: minimum: 50, maximum: 100

  2. Remove conflicting constraints from one of the allOf schemas

  3. Use separate validation rules instead of allOf for exclusive ranges
`.trim();
};
var formatConflictingConstValuesError = (baseConst, sourceConst) => {
  const divider = createDivider();
  const baseConstPreview = formatValuePreview(baseConst);
  const sourceConstPreview = formatValuePreview(sourceConst);
  return `
Conflicting const values in schema intersection.

  \u256D${divider}
  \u2502  Base const:    ${baseConstPreview}
  \u2502  Source const:  ${sourceConstPreview}
  \u251C${divider}
  \u2502  Conflict:  Two different const values cannot be merged
  \u2570${divider}

When merging schemas with 'allOf', each schema has a 'const' constraint
with different values. A value cannot equal two different constants
simultaneously.

How to fix:
  1. Use the same const value in both schemas:
     {
       "allOf": [
         { "const": ${baseConstPreview} },
         { "const": ${baseConstPreview} }  // Same value
       ]
     }

  2. Remove 'const' from one of the allOf schemas

  3. Use 'enum' instead if multiple values are acceptable:
     { "enum": [${baseConstPreview}, ${sourceConstPreview}] }
`.trim();
};
var formatEmptyEnumIntersectionError = (baseEnum, sourceEnum) => {
  const divider = createDivider();
  const baseEnumPreview = formatArrayPreview(baseEnum);
  const sourceEnumPreview = formatArrayPreview(sourceEnum);
  return `
Empty enum intersection in schema merge.

  \u256D${divider}
  \u2502  Base enum:    ${baseEnumPreview}
  \u2502  Source enum:  ${sourceEnumPreview}
  \u251C${divider}
  \u2502  Problem:  No common values between enum arrays
  \u2570${divider}

When merging schemas with 'allOf', the enum arrays from different
schemas must have at least one value in common. An empty intersection
means no valid value exists.

How to fix:
  1. Ensure enum arrays have at least one common value:
     {
       "allOf": [
         { "enum": ["a", "b", "c"] },
         { "enum": ["b", "c", "d"] }  // "b" and "c" are common
       ]
     }
     // Results in: enum: ["b", "c"]

  2. Remove 'enum' from one of the allOf schemas

  3. Use 'oneOf' instead if values should be exclusive:
     {
       "oneOf": [
         { "enum": ["a", "b"] },
         { "enum": ["c", "d"] }
       ]
     }
`.trim();
};

// packages/canard/schema-form/src/__legacy__/helpers/error/formatErrorMessage/formatVirtualFieldsError.ts
var formatVirtualFieldsNotValidError = (nodeKey, nodeValue, nodeName) => {
  const divider = createDivider();
  const receivedType = getValueType(nodeValue.fields);
  return `
Invalid virtual.fields configuration.

  \u256D${divider}
  \u2502  Node:      ${nodeName}
  \u2502  Virtual:   '${nodeKey}'
  \u2502  Expected:  array of field names
  \u2502  Received:  ${receivedType}
  \u2570${divider}

The 'virtual.fields' property must be an array containing the names
of properties that this virtual node references.

How to fix:
  1. Provide an array of field names:
     {
       "virtual": {
         "${nodeKey}": {
           "fields": ["field1", "field2"]
         }
       }
     }

  2. If only one field, still use an array:
     {
       "virtual": {
         "${nodeKey}": {
           "fields": ["singleField"]
         }
       }
     }
`.trim();
};
var formatVirtualFieldsNotInPropertiesError = (nodeKey, nodeValue, notFoundFields) => {
  const divider = createDivider();
  const declaredFields = nodeValue.fields.join(", ");
  const missingFieldsList = formatBulletList(
    notFoundFields.map((f) => `'${f}'`)
  );
  return `
Virtual fields reference non-existent properties.

  \u256D${divider}
  \u2502  Virtual:          '${nodeKey}'
  \u2502  Declared Fields:  [${declaredFields}]
  \u251C${divider}
  \u2502  Missing Properties:
${missingFieldsList}
  \u2570${divider}

Virtual nodes can only reference fields that are defined in the
schema's 'properties'. The listed fields were not found.

How to fix:
  1. Add the missing properties to the schema:
     {
       "properties": {
${notFoundFields.map((f) => `         "${f}": { "type": "string" }`).join(",\n")}
       },
       "virtual": {
         "${nodeKey}": {
           "fields": [${notFoundFields.map((f) => `"${f}"`).join(", ")}]
         }
       }
     }

  2. Or correct the field names in virtual.fields:
     {
       "virtual": {
         "${nodeKey}": {
           "fields": ["existingField1", "existingField2"]
         }
       }
     }

  3. Check for typos in field names
`.trim();
};

// packages/canard/schema-form/src/__legacy__/helpers/error/formatErrorMessage/formatInjectToError.ts
var formatInjectToError = ({
  value,
  dataPath,
  schemaPath,
  jsonSchema,
  rootValue,
  context,
  error
}) => {
  const divider = createDivider();
  const errorMessage = getErrorMessage(error);
  const { preview: schemaPreview, truncated: schemaTruncated } = formatJSONPreview(jsonSchema);
  const valuePreview = formatValuePreview(value);
  const rootValuePreview = formatValuePreview(rootValue);
  const contextValuePreview = formatValuePreview(context);
  return `
An error occurred while executing injectTo.

  \u256D${divider}
  \u2502  Schema Path:   ${schemaPath}
  \u2502  Data Path:     ${dataPath}
  \u251C${divider}
  \u2502  Current Value:   ${valuePreview}
  \u2502  Root Value:      ${rootValuePreview}
  \u2502  Context Value:   ${contextValuePreview}
  \u251C${divider}
  \u2502  Schema Preview:
${schemaPreview}${schemaTruncated ? "\n  \u2502    ...(truncated)" : ""}
  \u251C${divider}
  \u2502  Error: ${errorMessage}
  \u2570${divider}

The injectTo function threw an error during execution.
This function is called when the node's value changes to inject values
into other nodes based on the current value.

How to fix:
  1. Check the injectTo function in your schema for runtime errors
  2. Verify that all target paths returned by injectTo are valid
  3. Ensure the function handles edge cases (null, undefined values)
  4. Check for type mismatches in the injected values
  5. Review any conditional logic that may fail with certain inputs
`.trim();
};

// packages/canard/schema-form/src/__legacy__/helpers/error/transformErrors/transformErrors.ts
var import_filter7 = require("@winglet/common-utils/filter");
var transformErrors = (errors, key) => {
  if (!(0, import_filter7.isArray)(errors)) return [];
  const result = new Array();
  for (let i = 0, l = errors.length; i < l; i++) {
    const error = errors[i];
    if (error.dataPath.indexOf(ENHANCED_KEY) !== -1) continue;
    error.key = key ? ++sequence : void 0;
    result[result.length] = error;
  }
  return result;
};
var sequence = 0;

// packages/canard/schema-form/src/__legacy__/helpers/warning/warnDevelopmentIssue.ts
var import_console = require("@winglet/common-utils/console");
var import_filter8 = require("@winglet/common-utils/filter");
var emittedWarnings = /* @__PURE__ */ new Set();
var warnDevelopmentIssue = (issue) => {
  if (true) return;
  const signature = `${issue.code}
${issue.message}`;
  if (emittedWarnings.has(signature)) return;
  emittedWarnings.add(signature);
  const details = issue.details ?? {};
  (0, import_console.printWarning)(
    `[@canard/schema-form] ${issue.code}`,
    issue.message.split("\n"),
    (0, import_filter8.isEmptyObject)(details) ? void 0 : { details }
  );
};

// packages/canard/schema-form/src/__legacy__/helpers/warning/warningCode.ts
var SCHEMA_FORM_WARNING = "SCHEMA_FORM_WARNING";
var ALL_OF_KEYWORD_IGNORED_FOR_FORM = `${SCHEMA_FORM_WARNING}.ALL_OF_KEYWORD_IGNORED_FOR_FORM`;
var NESTED_COMPOSITION_IGNORED_FOR_FORM = `${SCHEMA_FORM_WARNING}.NESTED_COMPOSITION_IGNORED_FOR_FORM`;
var NULLABLE_ONE_OF_NULL_UNREACHABLE = `${SCHEMA_FORM_WARNING}.NULLABLE_ONE_OF_NULL_UNREACHABLE`;
var NULL_BRANCH_IGNORED_FOR_FORM = `${SCHEMA_FORM_WARNING}.NULL_BRANCH_IGNORED_FOR_FORM`;
var VIRTUALIZATION_DISABLED_FOR_FORM = `${SCHEMA_FORM_WARNING}.VIRTUALIZATION_DISABLED_FOR_FORM`;
var TYPE_MISMATCH = `${SCHEMA_FORM_WARNING}.TYPE_MISMATCH`;
var NON_JSON_WHOLE_VALUE = `${SCHEMA_FORM_WARNING}.NON_JSON_WHOLE_VALUE`;

// packages/canard/schema-form/src/__legacy__/helpers/jsonSchema/processAllOfSchema/utils/getCloneDepth/getCloneDepth.ts
var import_filter9 = require("@winglet/json-schema/filter");
var getCloneDepth = (schema) => (0, import_filter9.isObjectSchema)(schema) ? 3 : (0, import_filter9.isArraySchema)(schema) ? 2 : 1;

// packages/canard/schema-form/src/__legacy__/helpers/jsonSchema/processAllOfSchema/intersectSchema/utils/constants.ts
var FIRST_WIN_FIELDS = [
  "title",
  "description",
  "$comment",
  "examples",
  "default",
  "readOnly",
  "writeOnly",
  "format",
  "additionalProperties",
  "patternProperties",
  "prefixItems"
];
var SPECIAL_FIELDS = [
  "type",
  "enum",
  "const",
  "required",
  "nullable",
  "pattern",
  "multipleOf",
  "minimum",
  "maximum",
  "exclusiveMinimum",
  "exclusiveMaximum",
  "minLength",
  "maxLength",
  "minItems",
  "maxItems",
  "minProperties",
  "maxProperties",
  "minContains",
  "maxContains",
  "uniqueItems",
  "propertyNames",
  "properties",
  "items"
];
var IGNORE_FIELDS = [
  "allOf",
  "anyOf",
  "oneOf",
  "not",
  "if",
  "then",
  "else",
  "dependencies",
  "dependentRequired",
  "dependentSchemas",
  "unevaluatedProperties",
  "unevaluatedItems",
  "contains"
];
var EXCLUDE_FIELDS = /* @__PURE__ */ new Set([
  ...FIRST_WIN_FIELDS,
  ...SPECIAL_FIELDS,
  ...IGNORE_FIELDS
]);

// packages/canard/schema-form/src/__legacy__/helpers/jsonSchema/processAllOfSchema/intersectSchema/utils/distributeSubSchema.ts
var import_filter10 = require("@winglet/common-utils/filter");
var distributeAllOfProperties = (base, source) => {
  if (source.properties === void 0) return;
  if (base.properties === void 0) base.properties = source.properties;
  else {
    const properties = base.properties;
    const keys = Object.keys(source.properties);
    for (let i = 0, k = keys[0], l = keys.length; i < l; i++, k = keys[i]) {
      const subSchema = source.properties[k];
      if (properties[k] === void 0) properties[k] = subSchema;
      else distributeSchema(properties[k], subSchema);
    }
  }
};
var distributeAllOfItems = (base, source) => {
  if (base.items === false || source.items === void 0) return;
  else if (source.items === false) base.items = false;
  else if (base.items === void 0) base.items = source.items;
  else distributeSchema(base.items, source.items);
};
var distributeSchema = (base, source) => {
  if ((0, import_filter10.isArray)(base.allOf)) base.allOf.push(source);
  else base.allOf = [source];
};

// packages/canard/schema-form/src/__legacy__/helpers/jsonSchema/processAllOfSchema/intersectSchema/utils/intersectBooleanOr.ts
var intersectBooleanOr = (baseBool, sourceBool) => {
  if (baseBool === void 0 && sourceBool === void 0) return void 0;
  if (baseBool === void 0) return sourceBool;
  if (sourceBool === void 0) return baseBool;
  return baseBool || sourceBool;
};

// packages/canard/schema-form/src/__legacy__/helpers/schemaIntersection/utils/constant.ts
var EMPTY_INTERSECTION = Symbol("EMPTY_INTERSECTION");

// packages/canard/schema-form/src/__legacy__/helpers/schemaIntersection/utils/intersectConst.ts
var import_object3 = require("@winglet/common-utils/object");
var intersectConst = (baseConst, sourceConst) => {
  if (baseConst === void 0) return sourceConst;
  if (sourceConst === void 0) return baseConst;
  return (0, import_object3.equals)(baseConst, sourceConst) ? baseConst : EMPTY_INTERSECTION;
};

// packages/canard/schema-form/src/__legacy__/helpers/schemaIntersection/utils/intersectEnum.ts
var import_array = require("@winglet/common-utils/array");
var import_object4 = require("@winglet/common-utils/object");
var intersectEnum = (baseEnum, sourceEnum, deepEqual) => {
  if (!baseEnum) return sourceEnum;
  if (!sourceEnum) return baseEnum;
  const values = deepEqual ? (0, import_array.intersectionWith)(baseEnum, sourceEnum, import_object4.equals) : (0, import_array.intersectionLite)(baseEnum, sourceEnum);
  return values.length ? values : EMPTY_INTERSECTION;
};

// packages/canard/schema-form/src/__legacy__/helpers/schemaIntersection/utils/intersectMaximum.ts
var import_math = require("@winglet/common-utils/math");
var intersectMaximum = (baseMax, sourceMax) => {
  if (baseMax === void 0) return sourceMax;
  if (sourceMax === void 0) return baseMax;
  return (0, import_math.minLite)(baseMax, sourceMax);
};

// packages/canard/schema-form/src/__legacy__/helpers/schemaIntersection/utils/intersectMinimum.ts
var import_math2 = require("@winglet/common-utils/math");
var intersectMinimum = (baseMin, sourceMin) => {
  if (baseMin === void 0) return sourceMin;
  if (sourceMin === void 0) return baseMin;
  return (0, import_math2.maxLite)(baseMin, sourceMin);
};

// packages/canard/schema-form/src/__legacy__/helpers/schemaIntersection/utils/intersectMultipleOf.ts
var import_math3 = require("@winglet/common-utils/math");
var intersectMultipleOf = (baseMultiple, sourceMultiple) => {
  const base = Number.isFinite(baseMultiple) ? baseMultiple : void 0;
  const source = Number.isFinite(sourceMultiple) ? sourceMultiple : void 0;
  if (base === void 0) return source;
  if (source === void 0) return base;
  return (0, import_math3.lcm)(base, source);
};

// packages/canard/schema-form/src/__legacy__/helpers/schemaIntersection/utils/validateRange.ts
var validateRange = (min, max) => min !== void 0 && max !== void 0 && min > max ? EMPTY_INTERSECTION : void 0;

// packages/canard/schema-form/src/__legacy__/helpers/jsonSchema/processAllOfSchema/intersectSchema/utils/intersectConst.ts
var intersectConst2 = (baseConst, sourceConst) => {
  const result = intersectConst(baseConst, sourceConst);
  if (result === EMPTY_INTERSECTION)
    throw new JSONSchemaError(
      "CONFLICTING_CONST_VALUES",
      formatConflictingConstValuesError(baseConst, sourceConst)
    );
  return result;
};

// packages/canard/schema-form/src/__legacy__/helpers/jsonSchema/processAllOfSchema/intersectSchema/utils/intersectEnum.ts
var intersectEnum2 = (baseEnum, sourceEnum, deepEqual) => {
  if (!baseEnum) return sourceEnum;
  if (!sourceEnum) return baseEnum;
  const result = intersectEnum(baseEnum, sourceEnum, deepEqual);
  if (result === EMPTY_INTERSECTION)
    throw new JSONSchemaError(
      "EMPTY_ENUM_INTERSECTION",
      formatEmptyEnumIntersectionError(baseEnum, sourceEnum)
    );
  return result;
};

// packages/canard/schema-form/src/__legacy__/helpers/jsonSchema/processAllOfSchema/intersectSchema/utils/intersectMaximum.ts
var intersectMaximum2 = (baseMax, sourceMax) => intersectMaximum(baseMax, sourceMax);

// packages/canard/schema-form/src/__legacy__/helpers/jsonSchema/processAllOfSchema/intersectSchema/utils/intersectMinimum.ts
var intersectMinimum2 = (baseMin, sourceMin) => intersectMinimum(baseMin, sourceMin);

// packages/canard/schema-form/src/__legacy__/helpers/jsonSchema/processAllOfSchema/intersectSchema/utils/processFirstWinFields.ts
var processFirstWinFields = (base, source) => {
  for (let i = 0, l = FIRST_WIN_FIELDS.length; i < l; i++) {
    const field = FIRST_WIN_FIELDS[i];
    const baseValue = base[field];
    const sourceValue = source[field];
    if (baseValue !== void 0) base[field] = baseValue;
    else if (sourceValue !== void 0) base[field] = sourceValue;
  }
};

// packages/canard/schema-form/src/__legacy__/helpers/jsonSchema/processAllOfSchema/intersectSchema/utils/processOverwriteFields.ts
var processOverwriteFields = (base, source) => {
  const keys = Object.keys(source);
  for (let i = 0, k = keys[0], l = keys.length; i < l; i++, k = keys[i]) {
    const value = source[k];
    if (EXCLUDE_FIELDS.has(k) || value === void 0) continue;
    base[k] = value;
  }
};

// packages/canard/schema-form/src/__legacy__/helpers/jsonSchema/processAllOfSchema/intersectSchema/utils/processSchemaType.ts
var processSchemaType = (base, source) => {
  const baseInfo = extractSchemaInfo(base);
  if (baseInfo === null) return;
  const sourceInfo = extractSchemaInfo(source);
  const sourceNullable = (sourceInfo?.nullable ?? source.nullable) !== false;
  const schemaType = sourceInfo !== null ? intersectSchemaType(baseInfo.type, sourceInfo.type) : baseInfo.type;
  if (base.nullable !== void 0) base.nullable = void 0;
  if (baseInfo.nullable && sourceNullable)
    base.type = schemaType !== "null" ? [schemaType, "null"] : "null";
  else base.type = schemaType;
};
var intersectSchemaType = (baseType, sourceType) => baseType === "number" && sourceType === "integer" ? "integer" : baseType;

// packages/canard/schema-form/src/__legacy__/helpers/jsonSchema/processAllOfSchema/intersectSchema/utils/unionRequired.ts
var import_array2 = require("@winglet/common-utils/array");
var unionRequired = (baseRequired, sourceRequired) => {
  if (!baseRequired && !sourceRequired) return void 0;
  if (!baseRequired) return sourceRequired;
  if (!sourceRequired) return baseRequired;
  return (0, import_array2.unique)([...baseRequired, ...sourceRequired]);
};

// packages/canard/schema-form/src/__legacy__/helpers/jsonSchema/processAllOfSchema/intersectSchema/utils/validateRange.ts
var validateRange2 = (min, max, errorMessage = "Invalid range: min > max") => {
  if (min === void 0 || max === void 0) return;
  if (validateRange(min, max) === EMPTY_INTERSECTION)
    throw new JSONSchemaError(
      "INVALID_RANGE",
      formatInvalidRangeError(min, max, errorMessage)
    );
};

// packages/canard/schema-form/src/__legacy__/helpers/jsonSchema/processAllOfSchema/intersectSchema/intersectArraySchema.ts
var intersectArraySchema = (base, source) => {
  processSchemaType(base, source);
  processFirstWinFields(base, source);
  processOverwriteFields(base, source);
  distributeAllOfItems(base, source);
  const enumResult = intersectEnum2(base.enum, source.enum, true);
  const constResult = intersectConst2(base.const, source.const);
  const requiredResult = unionRequired(base.required, source.required);
  const minItems = intersectMinimum2(base.minItems, source.minItems);
  const maxItems = intersectMaximum2(base.maxItems, source.maxItems);
  const minContains = intersectMinimum2(base.minContains, source.minContains);
  const maxContains = intersectMaximum2(base.maxContains, source.maxContains);
  const uniqueItems = intersectBooleanOr(base.uniqueItems, source.uniqueItems);
  validateRange2(minItems, maxItems, "Invalid array constraints: minItems");
  validateRange2(
    minContains,
    maxContains,
    "Invalid array constraints: minContains"
  );
  if (enumResult !== void 0) base.enum = enumResult;
  if (constResult !== void 0) base.const = constResult;
  if (requiredResult !== void 0) base.required = requiredResult;
  if (minItems !== void 0) base.minItems = minItems;
  if (maxItems !== void 0) base.maxItems = maxItems;
  if (minContains !== void 0) base.minContains = minContains;
  if (maxContains !== void 0) base.maxContains = maxContains;
  if (uniqueItems !== void 0) base.uniqueItems = uniqueItems;
  return base;
};

// packages/canard/schema-form/src/__legacy__/helpers/jsonSchema/processAllOfSchema/intersectSchema/intersectBooleanSchema.ts
var intersectBooleanSchema = (base, source) => {
  processSchemaType(base, source);
  processFirstWinFields(base, source);
  processOverwriteFields(base, source);
  const enumResult = intersectEnum2(base.enum, source.enum);
  const constResult = intersectConst2(base.const, source.const);
  const requiredResult = unionRequired(base.required, source.required);
  if (enumResult !== void 0) base.enum = enumResult;
  if (constResult !== void 0) base.const = constResult;
  if (requiredResult !== void 0) base.required = requiredResult;
  return base;
};

// packages/canard/schema-form/src/__legacy__/helpers/jsonSchema/processAllOfSchema/intersectSchema/intersectNullSchema.ts
var intersectNullSchema = (base, source) => {
  processSchemaType(base, source);
  processFirstWinFields(base, source);
  processOverwriteFields(base, source);
  const enumResult = intersectEnum2(base.enum, source.enum);
  const constResult = intersectConst2(base.const, source.const);
  const requiredResult = unionRequired(base.required, source.required);
  if (enumResult !== void 0) base.enum = enumResult;
  if (constResult !== void 0) base.const = constResult;
  if (requiredResult !== void 0) base.required = requiredResult;
  return base;
};

// packages/canard/schema-form/src/__legacy__/helpers/jsonSchema/processAllOfSchema/intersectSchema/utils/intersectMultipleOf.ts
var intersectMultipleOf2 = (baseMultiple, sourceMultiple) => intersectMultipleOf(baseMultiple, sourceMultiple);

// packages/canard/schema-form/src/__legacy__/helpers/jsonSchema/processAllOfSchema/intersectSchema/intersectNumberSchema.ts
var intersectNumberSchema = (base, source) => {
  processSchemaType(base, source);
  processFirstWinFields(base, source);
  processOverwriteFields(base, source);
  const enumResult = intersectEnum2(base.enum, source.enum);
  const constResult = intersectConst2(base.const, source.const);
  const requiredResult = unionRequired(base.required, source.required);
  const minimum = intersectMinimum2(base.minimum, source.minimum);
  const maximum = intersectMaximum2(base.maximum, source.maximum);
  const exclusiveMinimum = intersectMinimum2(
    base.exclusiveMinimum,
    source.exclusiveMinimum
  );
  const exclusiveMaximum = intersectMaximum2(
    base.exclusiveMaximum,
    source.exclusiveMaximum
  );
  const multipleOf = intersectMultipleOf2(base.multipleOf, source.multipleOf);
  validateRange2(minimum, maximum, "Invalid number constraints: minimum");
  validateRange2(
    exclusiveMinimum,
    exclusiveMaximum,
    "Invalid number constraints: exclusiveMinimum"
  );
  if (enumResult !== void 0) base.enum = enumResult;
  if (constResult !== void 0) base.const = constResult;
  if (requiredResult !== void 0) base.required = requiredResult;
  if (minimum !== void 0) base.minimum = minimum;
  if (maximum !== void 0) base.maximum = maximum;
  if (exclusiveMinimum !== void 0) base.exclusiveMinimum = exclusiveMinimum;
  if (exclusiveMaximum !== void 0) base.exclusiveMaximum = exclusiveMaximum;
  if (multipleOf !== void 0) base.multipleOf = multipleOf;
  return base;
};

// packages/canard/schema-form/src/__legacy__/helpers/jsonSchema/processAllOfSchema/intersectSchema/utils/intersectPattern.ts
var intersectPattern = (basePattern, sourcePattern) => {
  if (!basePattern && !sourcePattern) return void 0;
  if (!basePattern) return sourcePattern;
  if (!sourcePattern) return basePattern;
  return "(?=" + basePattern + ")(?=" + sourcePattern + ")";
};

// packages/canard/schema-form/src/__legacy__/helpers/jsonSchema/processAllOfSchema/intersectSchema/intersectStringSchema.ts
var intersectStringSchema = (base, source) => {
  processSchemaType(base, source);
  processFirstWinFields(base, source);
  processOverwriteFields(base, source);
  const enumResult = intersectEnum2(base.enum, source.enum);
  const constResult = intersectConst2(base.const, source.const);
  const requiredResult = unionRequired(base.required, source.required);
  const pattern = intersectPattern(base.pattern, source.pattern);
  const minLength = intersectMinimum2(base.minLength, source.minLength);
  const maxLength = intersectMaximum2(base.maxLength, source.maxLength);
  validateRange2(minLength, maxLength, "Invalid string constraints: minLength");
  if (enumResult !== void 0) base.enum = enumResult;
  if (constResult !== void 0) base.const = constResult;
  if (requiredResult !== void 0) base.required = requiredResult;
  if (pattern !== void 0) base.pattern = pattern;
  if (minLength !== void 0) base.minLength = minLength;
  if (maxLength !== void 0) base.maxLength = maxLength;
  return base;
};

// packages/canard/schema-form/src/__legacy__/helpers/jsonSchema/processAllOfSchema/intersectSchema/intersectObjectSchema.ts
var intersectObjectSchema = (base, source) => {
  processSchemaType(base, source);
  processFirstWinFields(base, source);
  processOverwriteFields(base, source);
  distributeAllOfProperties(base, source);
  const enumResult = intersectEnum2(base.enum, source.enum, true);
  const constResult = intersectConst2(base.const, source.const);
  const requiredResult = unionRequired(base.required, source.required);
  const propertyNames = base.propertyNames && source.propertyNames ? intersectStringSchema(
    base.propertyNames,
    source.propertyNames
  ) : base.propertyNames || source.propertyNames;
  const minProperties = intersectMinimum2(
    base.minProperties,
    source.minProperties
  );
  const maxProperties = intersectMaximum2(
    base.maxProperties,
    source.maxProperties
  );
  validateRange2(
    minProperties,
    maxProperties,
    "Invalid object constraints: minProperties"
  );
  if (enumResult !== void 0) base.enum = enumResult;
  if (constResult !== void 0) base.const = constResult;
  if (requiredResult !== void 0) base.required = requiredResult;
  if (propertyNames !== void 0) base.propertyNames = propertyNames;
  if (minProperties !== void 0) base.minProperties = minProperties;
  if (maxProperties !== void 0) base.maxProperties = maxProperties;
  return base;
};

// packages/canard/schema-form/src/__legacy__/helpers/jsonSchema/processAllOfSchema/utils/getMergeSchemaHandler/getMergeSchemaHandler.ts
var getMergeSchemaHandler = (schema) => {
  const schemaInfo = extractSchemaInfo(schema);
  switch (schemaInfo?.type) {
    case "array":
      return intersectArraySchema;
    case "boolean":
      return intersectBooleanSchema;
    case "null":
      return intersectNullSchema;
    case "number":
    case "integer":
      return intersectNumberSchema;
    case "object":
      return intersectObjectSchema;
    case "string":
      return intersectStringSchema;
  }
  return null;
};

// packages/canard/schema-form/src/__legacy__/helpers/jsonSchema/processAllOfSchema/utils/validateCompatibility/validateCompatibility.ts
var import_filter11 = require("@winglet/json-schema/filter");
var validateCompatibility = (schema, allOfSchema) => allOfSchema.type === void 0 || (0, import_filter11.isCompatibleSchemaType)(schema, allOfSchema);

// packages/canard/schema-form/src/__legacy__/helpers/jsonSchema/processAllOfSchema/processAllOfSchema.ts
var processAllOfSchema = (schema) => {
  if (!schema.allOf?.length) return schema;
  const mergeHandler = getMergeSchemaHandler(schema);
  if (!mergeHandler) return schema;
  const { allOf, ...rest } = schema;
  schema = (0, import_object5.cloneLite)(rest, getCloneDepth(schema));
  for (let i = 0, l = allOf.length; i < l; i++) {
    const allOfSchema = allOf[i];
    for (let j = 0, jl = IGNORE_FIELDS.length; j < jl; j++)
      if (IGNORE_FIELDS[j] in allOfSchema)
        warnDevelopmentIssue({
          code: ALL_OF_KEYWORD_IGNORED_FOR_FORM,
          message: formatAllOfIgnoredKeywordWarning(IGNORE_FIELDS[j]),
          details: { keyword: IGNORE_FIELDS[j], allOfSchema }
        });
    if (validateCompatibility(schema, allOfSchema) === false)
      throw new JSONSchemaError(
        "ALL_OF_TYPE_REDEFINITION",
        formatAllOfTypeRedefinitionError(schema, allOfSchema),
        { schema, allOfSchema }
      );
    schema = mergeHandler(schema, allOfSchema);
  }
  return schema;
};

// packages/canard/schema-form/src/__legacy__/helpers/jsonPointer/enum.ts
var import_pointer2 = require("@winglet/json/pointer");
var JSONPointer = {
  /**
   * Root pointer representing the entire document (empty string `''`)
   * @note In JSON String representation, `''` refers to the whole document.
   * @note In URI Fragment representation, `#` alone refers to the whole document.
   * @note `/` alone does NOT represent root - it references an empty string key `""`.
   * @see https://datatracker.ietf.org/doc/html/rfc6901#section-5
   */
  Root: import_pointer2.JSONPointer.Root,
  /**
   * Starting character of URI fragment identifier (`#`)
   * @note `#` or `''` can be used as a root pointer.
   * @notice if you not want to use `#` as a root pointer, just start with `/`.
   * @see https://datatracker.ietf.org/doc/html/rfc6901#section-6
   */
  Fragment: import_pointer2.JSONPointer.Fragment,
  /**
   * Path separator character (`/`)
   * @see https://datatracker.ietf.org/doc/html/rfc6901#section-3
   */
  Separator: import_pointer2.JSONPointer.Separator,
  /**
   * Parent node (`..`)
   * @note This is not a official JSONPointer syntax, but it is used in some implementations.
   */
  Parent: "..",
  /**
   * Current node (`.`)
   * @note This is not a official JSONPointer syntax, but it is used in some implementations.
   */
  Current: ".",
  /**
   * Wildcard operator (`*`)
   * @note This is not a official JSONPointer syntax, but it is used in some implementations.
   */
  Wildcard: "*",
  /**
   * Index operator (`*`)
   * @deprecated Use `Wildcard` instead. This will be removed in next version.
   * */
  Index: "*",
  /**
   * Special symbol for Context (`@`)
   * @note This is not a official JSONPointer syntax, but it is used in some implementations.
   */
  Context: "@"
};

// packages/canard/schema-form/src/__legacy__/helpers/jsonPointer/utils/isAbsolutePath.ts
var isAbsolutePath = (pointer) => pointer[0] === JSONPointer.Separator || pointer[0] === JSONPointer.Fragment && pointer[1] === JSONPointer.Separator;

// packages/canard/schema-form/src/__legacy__/helpers/jsonPointer/utils/getAbsolutePointer.ts
var getAbsolutePath = (basePath, currentPath) => {
  if (isAbsolutePath(currentPath)) return currentPath;
  const baseEndIndex = basePath.length > 1 && basePath[basePath.length - 1] === JSONPointer.Separator ? basePath.length - 1 : basePath.length;
  if (currentPath[0] === JSONPointer.Current && currentPath[1] === JSONPointer.Separator) {
    if (currentPath.length === 2)
      return baseEndIndex > 0 ? basePath.slice(0, baseEndIndex) : JSONPointer.Separator;
    return baseEndIndex === 1 ? JSONPointer.Separator + currentPath.slice(2) : basePath.slice(0, baseEndIndex) + JSONPointer.Separator + currentPath.slice(2);
  }
  if (currentPath[0] === JSONPointer.Current && currentPath[1] === JSONPointer.Current && currentPath[2] === JSONPointer.Separator) {
    let scanIndex = 0;
    let cutIndex = baseEndIndex;
    while (currentPath[scanIndex] === JSONPointer.Current && currentPath[scanIndex + 1] === JSONPointer.Current && currentPath[scanIndex + 2] === JSONPointer.Separator) {
      scanIndex += 3;
      if (cutIndex > 0) {
        cutIndex = basePath.lastIndexOf(JSONPointer.Separator, cutIndex - 1);
        if (cutIndex < 0) cutIndex = 0;
      }
    }
    if (scanIndex < currentPath.length)
      return cutIndex > 0 ? basePath.slice(0, cutIndex) + JSONPointer.Separator + currentPath.slice(scanIndex) : JSONPointer.Separator + currentPath.slice(scanIndex);
    return cutIndex > 0 ? basePath.slice(0, cutIndex) : JSONPointer.Separator;
  }
  return currentPath;
};

// packages/canard/schema-form/src/__legacy__/helpers/jsonPointer/utils/joinSegment.ts
var joinSegment = (basePath = JSONPointer.Root, segment) => segment !== "" ? basePath + JSONPointer.Separator + segment : basePath;

// packages/canard/schema-form/src/__legacy__/core/nodes/ArrayNode/ArrayNode.ts
var import_object9 = require("@winglet/common-utils/object");

// packages/canard/schema-form/src/__legacy__/core/nodes/AbstractNode/AbstractNode.ts
var import_array4 = require("@winglet/common-utils/array");
var import_filter23 = require("@winglet/common-utils/filter");
var import_pointer4 = require("@winglet/json/pointer");

// packages/canard/schema-form/src/__legacy__/helpers/defaultValue/getEmptyValue/getEmptyValue.ts
var getEmptyValue = (type) => {
  if (type === "array") return [];
  if (type === "object") return {};
  return void 0;
};

// packages/canard/schema-form/src/__legacy__/helpers/defaultValue/getDefaultValue/getDefaultValue.ts
var getDefaultValue = (jsonSchema) => {
  if (jsonSchema.default !== void 0) return jsonSchema.default;
  if (jsonSchema.type === "virtual") return [];
  const schemaInfo = extractSchemaInfo(jsonSchema);
  if (schemaInfo === null) return void 0;
  return getEmptyValue(schemaInfo.type);
};

// packages/canard/schema-form/src/__legacy__/helpers/defaultValue/getObjectDefaultValue/getObjectDefaultValue.ts
var import_filter12 = require("@winglet/common-utils/filter");
var import_lib = require("@winglet/common-utils/lib");
var import_scanner4 = require("@winglet/json-schema/scanner");
var import_pointer3 = require("@winglet/json/pointer");
var getObjectDefaultValue = (jsonSchema, inputDefault) => {
  const defaultValue = inputDefault !== void 0 ? inputDefault : jsonSchema.default;
  const result = defaultValue || {};
  new import_scanner4.JSONSchemaScanner({
    visitor: {
      enter: ({ schema, dataPath }) => {
        if ((0, import_lib.hasOwnProperty)(schema, "default"))
          (0, import_pointer3.setValue)(result, dataPath, schema.default, SET_VALUE_OPTIONS);
      }
    }
  }).scan(jsonSchema);
  if ((0, import_filter12.isEmptyObject)(result)) return defaultValue;
  return result;
};
var SET_VALUE_OPTIONS = {
  overwrite: false,
  preserveNull: false
};

// packages/canard/schema-form/src/__legacy__/core/nodes/AbstractNode/utils/EventCascadeManager/EventCascadeManager.ts
var import_scheduler = require("@winglet/common-utils/scheduler");

// packages/canard/schema-form/src/__legacy__/core/nodes/AbstractNode/utils/EventCascadeManager/utils/getEventCollection.ts
var getEventCollection = (nodeEventType, payload, options) => ({
  type: nodeEventType,
  payload: { [nodeEventType]: payload },
  options: { [nodeEventType]: options }
});

// packages/canard/schema-form/src/__legacy__/core/nodes/AbstractNode/utils/EventCascadeManager/utils/mergeEventEntries.ts
var mergeEventEntries = (eventEntities) => {
  const merged = {
    type: BIT_MASK_NONE,
    payload: {},
    options: {}
  };
  for (let i = 0, l = eventEntities.length; i < l; i++) {
    const eventEntity = eventEntities[i];
    merged.type |= eventEntity[0];
    if (eventEntity[1] !== void 0)
      merged.payload[eventEntity[0]] = eventEntity[1];
    if (eventEntity[2] !== void 0)
      merged.options[eventEntity[0]] = eventEntity[2];
  }
  return merged;
};

// packages/canard/schema-form/src/__legacy__/core/nodes/AbstractNode/utils/EventCascadeManager/EventCascadeManager.ts
var MAX_LOOP_COUNT = 100;
var LEDGER_SIZE = 32;
var EventCascadeManager = class {
  /**
   * Creates an EventCascadeManager instance.
   * @param getInfo - Function to get the node's JSON pointer path and dependencies for error reporting
   */
  constructor(getInfo) {
    this.__currentBatch__ = null;
    this.__idle__ = true;
    this.__count__ = 0;
    /**
     * Set of registered event listeners for this node.
     * @note Listeners receive batched events for performance optimization.
     */
    this.__listeners__ = /* @__PURE__ */ new Set();
    /**
     * Monotonic delivery counters indexed by event-type bit position.
     * @note Incremented at the single delivery point (`__resolve__`) whether or
     *       not any listener is attached. Subscriptions that attach after a
     *       delivery (e.g. React commits detached from the render phase under
     *       concurrent rendering) compare revisions to detect what they missed.
     */
    this.__ledger__ = new Array(LEDGER_SIZE).fill(0);
    /**
     * Array of cleanup functions for subscriptions to other nodes.
     * @note Stores unsubscribe functions from dependency subscriptions.
     *       Called during cleanUp() to prevent memory leaks.
     */
    this.__unsubscribes__ = [];
    this.__getInfo__ = getInfo;
  }
  /**
   * Acquires the current event batch. If there is no batch, create a new one.
   * @returns Current event batch
   * @throws {SchemaFormError} When batch count exceeds MAX_LOOP_COUNT (infinite loop detected)
   */
  __acquireBatch__() {
    const batch = this.__currentBatch__;
    if (batch && !batch.resolved) return batch;
    if (++this.__count__ > MAX_LOOP_COUNT) {
      const { path, dependencies } = this.__getInfo__();
      throw new SchemaFormError(
        "INFINITE_LOOP_DETECTED",
        formatInfiniteLoopError(
          path,
          dependencies,
          this.__count__,
          MAX_LOOP_COUNT
        ),
        { path, dependencies, batchCount: this.__count__ }
      );
    }
    if (this.__idle__) {
      this.__idle__ = false;
      (0, import_scheduler.scheduleMacrotaskSafe)(() => {
        this.__idle__ = true;
        this.__count__ = 0;
      });
    }
    const nextBatch = { eventEntities: [] };
    this.__currentBatch__ = nextBatch;
    (0, import_scheduler.scheduleMicrotask)(() => {
      nextBatch.resolved = true;
      this.__resolve__(mergeEventEntries(nextBatch.eventEntities));
    });
    return nextBatch;
  }
  /**
   * Publishes an event to the node's listeners.
   * @param type - Event type (see NodeEventType)
   * @param payload - Data for the event (see NodeEventPayload)
   * @param options - Options for the event (see NodeEventOptions)
   * @param immediate - If true, executes listeners synchronously; if false, batches event
   */
  publish(type, payload, options) {
    this.__acquireBatch__().eventEntities.push([type, payload, options]);
  }
  dispatch(type, payload, options) {
    this.__resolve__(getEventCollection(type, payload, options));
  }
  /**
   * Records a delivery in the ledger, one increment per event-type bit.
   * @param type - Merged event-type bitmask of the delivered collection
   */
  __recordDelivery__(type) {
    let bits = type;
    while (bits !== 0) {
      const flag = bits & -bits;
      this.__ledger__[31 - Math.clz32(flag)]++;
      bits ^= flag;
    }
  }
  /**
   * Monotonic revision of deliveries matching the given event-type mask.
   * @param mask - Bitmask of event types to count
   * @returns Sum of delivery counts for every set bit; strictly increases
   *          whenever a matching collection is delivered
   * @remarks Counted at delivery time regardless of listener presence, so a
   *          late subscriber can compare a captured revision against the
   *          current one to detect (and re-pull) notifications it missed.
   */
  revision(mask) {
    let revision = 0;
    let bits = mask;
    while (bits !== 0) {
      const flag = bits & -bits;
      revision += this.__ledger__[31 - Math.clz32(flag)];
      bits ^= flag;
    }
    return revision;
  }
  /**
   * Dispatches an event collection to all listeners.
   * @param eventCollection - Merged event collection to dispatch
   */
  __resolve__(eventCollection) {
    this.__recordDelivery__(eventCollection.type);
    for (const listener of this.__listeners__) listener(eventCollection);
  }
  /**
   * Registers a node event listener.
   * @param listener - Event listener callback
   * @returns Event listener removal function
   */
  subscribe(listener) {
    this.__listeners__.add(listener);
    return () => {
      this.__listeners__.delete(listener);
    };
  }
  /**
   * Saves an event unsubscribe function for later cleanup.
   * @param unsubscribe - The unsubscribe function to save
   */
  saveUnsubscribe(unsubscribe) {
    this.__unsubscribes__.push(unsubscribe);
  }
  /**
   * Clears all subscriptions and listeners.
   * @description Executes all saved unsubscribe functions and clears the listener set.
   */
  cleanUp() {
    for (let i = 0, l = this.__unsubscribes__.length; i < l; i++)
      this.__unsubscribes__[i]();
    this.__unsubscribes__ = [];
    this.__listeners__.clear();
  }
};

// packages/canard/schema-form/src/__legacy__/core/nodes/AbstractNode/utils/InjectionGuardManager/InjectionGuardManager.ts
var import_scheduler2 = require("@winglet/common-utils/scheduler");
var InjectionGuardManager = class {
  constructor() {
    /**
     * Set of data paths currently being injected.
     * @description Tracks which nodes are currently being injected to prevent circular injection loops.
     */
    this.__injectedPaths__ = /* @__PURE__ */ new Set();
    /**
     * Scheduled macrotask ID for clearing injected node flags.
     * @description Used to batch clear injected flags after all synchronous injection
     *              operations complete. The ID prevents duplicate scheduling.
     */
    this.__scheduledClearInjectedPathsId__ = null;
  }
  /**
   * Marks a node path as currently being injected.
   * @param path - The data path of the node to mark as injected
   */
  add(path) {
    this.__injectedPaths__.add(path);
  }
  /**
   * Checks if a node path is currently being injected.
   * @param path - The data path of the node to check
   * @returns `true` if the node is currently being injected, `false` otherwise
   */
  has(path) {
    return this.__injectedPaths__.has(path);
  }
  /**
   * Clears all injection marks immediately.
   */
  clear() {
    this.__injectedPaths__.clear();
  }
  /**
   * Schedules clearing of all injection marks in a macrotask.
   * @description Uses macrotask scheduling to ensure all synchronous injection operations
   *              complete before clearing flags. Prevents duplicate scheduling if already scheduled.
   */
  scheduleClearInjectedPaths() {
    if (this.__scheduledClearInjectedPathsId__ !== null) return;
    this.__scheduledClearInjectedPathsId__ = (0, import_scheduler2.scheduleMacrotaskSafe)(() => {
      this.__scheduledClearInjectedPathsId__ = null;
      this.__injectedPaths__.clear();
    });
  }
};

// packages/canard/schema-form/src/__legacy__/core/nodes/AbstractNode/utils/ValidationErrorManager/ValidationErrorManager.ts
var import_object6 = require("@winglet/common-utils/object");
var RECURSIVE_ERROR_OMITTED_KEYS = /* @__PURE__ */ new Set(["key"]);
var ValidationErrorManager = class {
  constructor() {
    /**
     * Combined array of internal schema errors and external errors.
     * @note Only used by root node. Represents all errors across the entire form.
     */
    this.mergedGlobalErrors = [];
    /**
     * Combined array of local validation errors and external errors for this node.
     * @note This is the primary error array exposed via the `errors` getter.
     */
    this.mergedLocalErrors = [];
    /**
     * Errors provided externally (e.g., from server-side validation).
     * @note External errors are merged with local errors but tracked separately
     *       for independent clearing via clearExternalErrors().
     */
    this.externalErrors = [];
  }
  /**
   * Sets global errors and merges with external errors.
   * @param errors - List of errors to set
   * @returns true if errors changed, false otherwise
   */
  setGlobalErrors(errors) {
    if ((0, import_object6.equals)(this.__globalErrors__, errors)) return true;
    this.__globalErrors__ = errors;
    this.mergedGlobalErrors = [
      ...this.externalErrors,
      ...this.__globalErrors__
    ];
    return false;
  }
  /**
   * Sets local errors and merges with external errors.
   * @param errors - List of errors to set
   * @returns true if errors changed, false otherwise
   */
  setLocalErrors(errors) {
    if ((0, import_object6.equals)(this.__localErrors__, errors)) return true;
    this.__localErrors__ = errors;
    this.mergedLocalErrors = [...this.externalErrors, ...this.__localErrors__];
    return false;
  }
  /**
   * Sets external errors and merges with local/global errors.
   * @param errors - List of received errors
   * @returns true if errors changed, false otherwise
   */
  setExternalErrors(errors = [], isRoot) {
    if ((0, import_object6.equals)(this.externalErrors, errors, RECURSIVE_ERROR_OMITTED_KEYS))
      return true;
    this.externalErrors = new Array(errors.length);
    for (let i = 0, l = errors.length; i < l; i++)
      this.externalErrors[i] = { ...errors[i], key: i };
    this.mergedLocalErrors = this.__localErrors__ ? [...this.externalErrors, ...this.__localErrors__] : this.externalErrors;
    if (isRoot)
      this.mergedGlobalErrors = this.__globalErrors__ ? [...this.externalErrors, ...this.__globalErrors__] : this.externalErrors;
    return false;
  }
  /**
   * Filters out specific errors from external errors.
   * @param errors - List of errors to remove
   * @returns The filtered errors array if changed, null otherwise
   */
  filterExternalErrors(errors) {
    const deleteKeys = [];
    for (let i = 0, l = errors.length; i < l; i++) {
      const error = errors[i];
      if (typeof error.key === "number") deleteKeys.push(error.key);
    }
    const currentErrors = this.externalErrors;
    const nextErrors = [];
    for (let i = 0, l = currentErrors.length; i < l; i++) {
      const error = currentErrors[i];
      if (!error.key || !deleteKeys.includes(error.key)) nextErrors.push(error);
    }
    if (currentErrors.length !== nextErrors.length) return nextErrors;
    return null;
  }
};

// packages/canard/schema-form/src/__legacy__/core/nodes/AbstractNode/utils/ValidationManager/utils/getFallbackValidator.ts
var getFallbackValidator = (error, jsonSchema) => () => [
  {
    keyword: "jsonSchemaCompileFailed",
    dataPath: "",
    message: error.message,
    source: error,
    details: {
      jsonSchema
    }
  }
];

// packages/canard/schema-form/src/__legacy__/core/nodes/AbstractNode/utils/ValidationManager/utils/isCircularReferenceError.ts
var isCircularReferenceError = (error) => {
  if (error instanceof RangeError) return true;
  if (!(error instanceof Error)) return false;
  return /maximum call stack|too much recursion|circular/i.test(error.message);
};

// packages/canard/schema-form/src/__legacy__/core/nodes/AbstractNode/utils/ValidationManager/utils/matchesSchemaPath.ts
var matchesSchemaPath = (source, target) => {
  if (source.indexOf(target) !== 0) return false;
  const endCode = source[target.length];
  return endCode === JSONPointer.Separator || endCode === void 0;
};

// packages/canard/schema-form/src/__legacy__/core/nodes/AbstractNode/utils/ValidationManager/ValidationManager.ts
var ValidationManager = class {
  /**
   * Creates a ValidationManager instance.
   *
   * @param host - The AbstractNode that owns this validation manager
   * @param validatorFactory - Optional factory function to create custom validators
   * @param validationMode - The validation mode (OnChange, OnRequest, None). If undefined, validation is disabled.
   *
   * @description
   * The constructor performs the following:
   * 1. If `validationMode` is falsy, validation remains disabled
   * 2. Strips schema extensions (computed, formType, etc.) before compilation
   * 3. Attempts to compile the schema using the provided factory
   * 4. On circular reference errors, creates a fallback validator that returns the error
   *
   * @example
   * ```typescript
   * // With custom validator factory
   * const manager = new ValidationManager(
   *   node,
   *   (schema) => ajv.compile(schema),
   *   'OnChange'
   * );
   *
   * ```
   */
  constructor(host, validatorFactory, validationMode) {
    /**
     * @internal Monotonic token incremented on every `validate()` call.
     * An async validation whose token is no longer the latest is dropped, so a
     * slow validation of a now-obsolete value cannot clobber a newer result.
     */
    this.__generation__ = 0;
    /**
     * Indicates whether validation is enabled for this manager.
     * @description `true` if a validator was successfully compiled, `false` otherwise.
     * @readonly
     */
    this.enabled = false;
    this.__host__ = host;
    if (!validationMode) return;
    const jsonSchema = host.jsonSchema;
    const schema = stripSchemaExtensions(jsonSchema);
    try {
      this.__validator__ = validatorFactory?.(schema);
      this.enabled = this.__validator__ !== void 0;
    } catch (error) {
      const jsonSchemaError = isCircularReferenceError(error) ? new JSONSchemaError(
        "CIRCULAR_REFERENCE",
        formatCircularReferenceError(error.message, jsonSchema),
        { error, schema: jsonSchema }
      ) : new JSONSchemaError(
        "SCHEMA_COMPILE_FAILED",
        formatSchemaCompileError(error, jsonSchema),
        { error, schema: jsonSchema }
      );
      this.__validator__ = getFallbackValidator(jsonSchemaError, jsonSchema);
      console.error(jsonSchemaError);
    }
  }
  /**
   * Executes the validator against the provided value.
   *
   * @param value - The value to validate
   * @returns A promise that resolves to an array of validation errors, or empty array if valid
   *
   * @internal
   */
  async __validate__(value) {
    if (this.__validator__ === void 0) return [];
    const errors = await this.__validator__(value);
    if (errors === null) return [];
    else return transformErrors(errors);
  }
  /**
   * Validates the form value and distributes errors to child nodes.
   *
   * @param value - The form value to validate (typically the root node's enhancedValue)
   *
   * @description
   * This method performs full form validation and error distribution:
   *
   * 1. **Guard checks**: Only runs on root nodes with validation enabled
   * 2. **Validation execution**: Runs the compiled validator against the value
   * 3. **Global error handling**: Delegates to host's global error handler first
   * 4. **Error grouping**: Groups errors by their data path (JSONPointer)
   * 5. **Stale error cleanup**: Clears errors from nodes that no longer have issues
   * 6. **Error distribution**: Sets errors on each child node matching the data path
   * 7. **Schema path filtering**: For variant nodes, filters errors by schema path match
   *
   * @example
   * ```typescript
   * // Trigger validation on form submit
   * const rootNode = form.getNode();
   * await rootNode.validationManager.validate(rootNode.enhancedValue);
   *
   * // Check for errors after validation
   * const hasErrors = rootNode.errors.length > 0;
   * ```
   *
   * @remarks
   * - This method is async and should be awaited
   * - Errors are distributed to nodes found via `host.find(dataPath)`
   * - Nodes not found in the tree will have their errors silently ignored
   * - Previous error paths are tracked to clear stale errors on re-validation
   */
  async validate(value) {
    if (this.__host__.isRoot === false || this.enabled === false) return;
    const generation = ++this.__generation__;
    const internalErrors = await this.__validate__(value);
    if (generation !== this.__generation__) return;
    if (this.__host__.__setGlobalErrors__(internalErrors)) return;
    const errorsByDataPath = /* @__PURE__ */ new Map();
    for (const error of internalErrors) {
      const errors = errorsByDataPath.get(error.dataPath);
      if (errors) errors.push(error);
      else errorsByDataPath.set(error.dataPath, [error]);
    }
    const errorDataPaths = Array.from(errorsByDataPath.keys());
    if (this.__errorDataPaths__)
      for (const dataPath of this.__errorDataPaths__) {
        if (errorDataPaths.includes(dataPath)) continue;
        this.__host__.find(dataPath)?.clearErrors();
      }
    for (const [dataPath, errors] of errorsByDataPath) {
      const childNode = this.__host__.find(dataPath);
      if (childNode === null) continue;
      childNode.setErrors(
        childNode.variant !== void 0 ? errors.filter(
          (error) => error.schemaPath === void 0 || matchesSchemaPath(error.schemaPath, childNode.schemaPath)
        ) : errors
      );
    }
    this.__errorDataPaths__ = errorDataPaths;
  }
};

// packages/canard/schema-form/src/__legacy__/core/nodes/AbstractNode/utils/afterMicrotask/afterMicrotask.ts
var import_scheduler3 = require("@winglet/common-utils/scheduler");
var afterMicrotask = (handler) => {
  let macrotaskId;
  const callback = () => {
    handler();
    macrotaskId = void 0;
  };
  return () => {
    if (macrotaskId) (0, import_scheduler3.cancelMacrotaskSafe)(macrotaskId);
    macrotaskId = (0, import_scheduler3.scheduleMacrotaskSafe)(callback);
  };
};

// packages/canard/schema-form/src/__legacy__/core/nodes/AbstractNode/utils/applyEnhancer/applyEnhancer.ts
var import_filter13 = require("@winglet/common-utils/filter");
var applyEnhancer = (value, enhancer) => {
  if (!(0, import_filter13.isArray)(enhancer) && !(0, import_filter13.isPlainObject)(enhancer)) return value;
  if ((0, import_filter13.isArray)(value)) return overlayArray(value, Object.entries(enhancer));
  if ((0, import_filter13.isPlainObject)(value))
    return overlayObject(value, Object.entries(enhancer));
  return value;
};
var overlayObject = (value, entries) => {
  const result = { ...value };
  for (const [key, entry] of entries)
    if (!(0, import_filter13.isArray)(entry) && !(0, import_filter13.isPlainObject)(entry)) result[key] = entry;
    else if (key in value) result[key] = applyEnhancer(value[key], entry);
  return result;
};
var overlayArray = (value, entries) => {
  const result = [...value];
  for (const [key, entry] of entries) {
    const index = Number(key);
    if (index in value) result[index] = applyEnhancer(value[index], entry);
  }
  return result;
};

// packages/canard/schema-form/src/__legacy__/core/nodes/AbstractNode/utils/checkDefinedValue/checkDefinedValue.ts
var import_lib2 = require("@winglet/common-utils/lib");
var checkDefinedValue = (value) => {
  if (value === null) return true;
  if (typeof value === "object") {
    for (const key in value) if ((0, import_lib2.hasOwnProperty)(value, key)) return true;
    return false;
  }
  return value !== void 0;
};

// packages/canard/schema-form/src/__legacy__/core/nodes/AbstractNode/utils/findNode/utils/detectsCandidate.ts
var detectsCandidate = (source, candidate) => candidate.variant === void 0 || candidate.variant === candidate.parentNode?.oneOfIndex || source.variant === candidate.variant && source.parentNode === candidate.parentNode;

// packages/canard/schema-form/src/__legacy__/core/nodes/AbstractNode/utils/findNode/utils/getSegments.ts
var getSegments = (pointer) => pointer.split(JSONPointer.Separator).filter(validate);
var validate = (segment) => segment && segment !== JSONPointer.Current;

// packages/canard/schema-form/src/__legacy__/core/nodes/AbstractNode/utils/findNode/findNode.ts
var findNode = (source, pointer) => {
  if (!source) return null;
  if (pointer === null) return source;
  const segments = typeof pointer === "string" ? getSegments(pointer) : pointer;
  if (segments.length === 0) return source;
  let cursor = source;
  for (let i = 0, il = segments.length; i < il; i++) {
    const segment = segments[i];
    if (segment === JSONPointer.Fragment) {
      cursor = cursor.rootNode;
      if (!cursor) return null;
    } else if (segment === JSONPointer.Parent) {
      cursor = cursor.parentNode;
      if (!cursor) return null;
    } else if (segment === JSONPointer.Current) {
    } else {
      if (cursor.group === "terminal") return null;
      const subnodes = cursor.subnodes;
      if (!subnodes?.length) return null;
      let tentative = true;
      let fallback = null;
      for (let j = 0, jl = subnodes.length; j < jl; j++) {
        const node = subnodes[j].node;
        if (node.escapedName !== segment) continue;
        if (fallback === null) fallback = node;
        if (detectsCandidate(source, node)) {
          tentative = false;
          cursor = node;
          break;
        }
      }
      if (tentative)
        if (fallback) cursor = fallback;
        else return null;
      if (cursor.group === "terminal") return cursor;
    }
  }
  return cursor;
};

// packages/canard/schema-form/src/__legacy__/core/nodes/AbstractNode/utils/findNode/findNodes.ts
var findNodes = (source, pointer) => {
  if (!source) return [];
  if (pointer === null) return [source];
  const segments = typeof pointer === "string" ? getSegments(pointer) : pointer;
  if (segments.length === 0) return [source];
  let cursors = [source];
  let nextCursors = [];
  for (let i = 0, il = segments.length; i < il; i++) {
    const segment = segments[i];
    if (segment === JSONPointer.Fragment) {
      const rootNode = cursors[0]?.rootNode;
      if (rootNode) nextCursors = [rootNode];
    } else if (segment === JSONPointer.Parent) {
      nextCursors = [];
      for (let j = 0, jl = cursors.length; j < jl; j++) {
        const parentNode = cursors[j].parentNode;
        if (parentNode && nextCursors.indexOf(parentNode) === -1)
          nextCursors.push(parentNode);
      }
    } else if (segment === JSONPointer.Current) {
      nextCursors = cursors;
    } else {
      nextCursors = [];
      const isWildcard = segment === JSONPointer.Wildcard;
      for (let j = 0, jl = cursors.length; j < jl; j++) {
        const cursor = cursors[j];
        if (cursor.group === "terminal") {
          if (nextCursors.indexOf(cursor) === -1) nextCursors.push(cursor);
        } else {
          const subnodes = cursor.subnodes;
          if (!subnodes?.length) continue;
          for (let k = 0, kl = subnodes.length; k < kl; k++) {
            const node = subnodes[k].node;
            if ((isWildcard || node.escapedName === segment) && nextCursors.indexOf(node) === -1)
              nextCursors.push(node);
          }
        }
      }
    }
    if (nextCursors.length === 0) return [];
    cursors = nextCursors;
  }
  return cursors;
};

// packages/canard/schema-form/src/__legacy__/core/blueprint/utils/expressions/regex.ts
var IDENTIFIER_CHARS = "a-zA-Z0-9_";
var PATH_PREFIX_CHARS = `${JSONPointer.Fragment}${JSONPointer.Current}${JSONPointer.Separator}${JSONPointer.Context}`;
var NOT_PRECEDED_BY_IDENTIFIER_OR_PATH_CHAR = `(?<![${IDENTIFIER_CHARS}${PATH_PREFIX_CHARS}"'\`\\\\])`;
var FOLLOWED_BY_VALID_JS_TOKEN = `(?=\\${JSONPointer.Current}(?![\\${JSONPointer.Separator}\\${JSONPointer.Current}])|[\\[\\]\\)\\}\\s,;:?=!<>&|+\\-*%~^]|$)`;
var BALANCED_BRACKETS = `\\[[^\\s\\(\\)\\[\\]\\{\\}]*\\]`;
var BALANCED_BRACES = `\\{[^\\s\\(\\)\\[\\]\\{\\}]*\\}`;
var CONTINUING_BRACKET = `[\\[\\]\\{\\}](?=[^\\s\\(\\)\\[\\]\\{\\}\\${JSONPointer.Separator}~])`;
var SINGLE_PATH_SEGMENT = `(?:[^\\s\\(\\)\\[\\]\\{\\}\\${JSONPointer.Separator}~]|~[01]|${BALANCED_BRACKETS}|${BALANCED_BRACES}|${CONTINUING_BRACKET})+`;
var MULTI_LEVEL_PATH = `${SINGLE_PATH_SEGMENT}(?:\\${JSONPointer.Separator}${SINGLE_PATH_SEGMENT})*`;
var OPTIONAL_PATH = `(?:${MULTI_LEVEL_PATH})?(?!\\${JSONPointer.Separator})`;
var PARENT_REFERENCES = `(?:\\${JSONPointer.Parent}\\${JSONPointer.Separator})+`;
var FRAGMENT_OR_CURRENT_PREFIX = `(?:\\${JSONPointer.Fragment}|\\${JSONPointer.Current})`;
var CONTEXT_INVALID_PRECEDING_CHARS = `${IDENTIFIER_CHARS}${PATH_PREFIX_CHARS}"'\`\\\\`;
var JSON_POINTER_PATH_REGEX = new RegExp(
  `${NOT_PRECEDED_BY_IDENTIFIER_OR_PATH_CHAR}(?:${FRAGMENT_OR_CURRENT_PREFIX}\\${JSONPointer.Separator}${OPTIONAL_PATH}|${PARENT_REFERENCES}${OPTIONAL_PATH}|\\${JSONPointer.Separator}${MULTI_LEVEL_PATH}|(?:(?<![${CONTEXT_INVALID_PRECEDING_CHARS}])\\${JSONPointer.Context}|^\\${JSONPointer.Context})${FOLLOWED_BY_VALID_JS_TOKEN}|(?<=\\()\\${JSONPointer.Separator}(?=\\))|(?:(?<![${CONTEXT_INVALID_PRECEDING_CHARS}])\\${JSONPointer.Fragment}|^\\${JSONPointer.Fragment})${FOLLOWED_BY_VALID_JS_TOKEN})`,
  "g"
);

// packages/canard/schema-form/src/__legacy__/core/blueprint/utils/expressions/createDynamicFunction/utils/wrapReturnStatements.ts
var wrapReturnStatements = (body) => body.replace(
  RETURN_PATTERN,
  (_, __, ___, expression) => expression ? `return !!(${expression.trim()})` : "return false"
);
var RETURN_PATTERN = /\breturn([ \t]*)(?:([ \t]+)(.+?))?(?=;|\n|$)/g;

// packages/canard/schema-form/src/__legacy__/core/blueprint/utils/expressions/createDynamicFunction/utils/getFunctionBody.ts
var getFunctionBody = (expression, coerceToBoolean) => {
  if (expression.startsWith("{") && expression.endsWith("}")) {
    const functionBody = expression.slice(1, -1).trim();
    if (coerceToBoolean) return wrapReturnStatements(functionBody);
    return functionBody;
  }
  return coerceToBoolean ? `return !!(${expression})` : `return ${expression}`;
};

// packages/canard/schema-form/src/__legacy__/core/blueprint/utils/expressions/createDynamicFunction/createDynamicFunction.ts
var createDynamicFunction = (pathManager, fieldName, expression, coerceToBoolean = false) => {
  if (typeof expression !== "string") return;
  const processedExpression = expression.replace(JSON_POINTER_PATH_REGEX, (path) => {
    pathManager.set(path);
    return `dependencies[${pathManager.findIndex(path)}]`;
  }).trim().replace(/;$/, "");
  if (processedExpression.length === 0) return;
  const functionBody = getFunctionBody(processedExpression, coerceToBoolean);
  try {
    return new Function("dependencies", functionBody);
  } catch (error) {
    throw new JSONSchemaError(
      "CREATE_DYNAMIC_FUNCTION",
      formatCreateDynamicFunctionError(
        fieldName,
        expression,
        functionBody,
        error
      ),
      {
        fieldName,
        expression,
        functionBody,
        error
      }
    );
  }
};

// packages/canard/schema-form/src/__legacy__/core/blueprint/utils/expressions/getPathManager/getPathManager.ts
var getPathManager = () => {
  const paths = new Array();
  return {
    get: () => paths,
    set: (path) => {
      if (path[0] === JSONPointer.Fragment) path = path.slice(1);
      if (!paths.includes(path)) paths.push(path);
    },
    findIndex: (path) => {
      if (path[0] === JSONPointer.Fragment) path = path.slice(1);
      return paths.indexOf(path);
    }
  };
};

// packages/canard/schema-form/src/__legacy__/core/nodes/AbstractNode/utils/getComputedPropertiesManager/ComputedPropertiesManager/utils/type.ts
var ALIAS = "&";
var STATE_FIELD_NAMES = [
  "active",
  "visible",
  "readOnly",
  "disabled",
  "pristine"
];
var COMPUTED_FIELD_NAMES = [
  ...STATE_FIELD_NAMES,
  "watch",
  "derived",
  "if"
];

// packages/canard/schema-form/src/__legacy__/core/nodes/AbstractNode/utils/getComputedPropertiesManager/ComputedPropertiesManager/utils/checkComputedOptionFactory/checkComputedOptionFactory.ts
var checkComputedOptionFactory = (jsonSchema, rootJSONSchema) => (
  /**
   * Returns a condition check function for the given dependency paths and field name.
   * @param dependencyPaths - Dependency path array
   * @param fieldName - Field name to check
   * @returns Computed option check function or undefined
   */
  (pathManager, fieldName) => {
    const expression = rootJSONSchema[fieldName] ?? jsonSchema[fieldName] ?? jsonSchema.computed?.[fieldName] ?? jsonSchema[ALIAS + fieldName];
    if (typeof expression === "boolean") return () => expression;
    return createDynamicFunction(pathManager, fieldName, expression, true);
  }
);

// packages/canard/schema-form/src/__legacy__/core/nodes/AbstractNode/utils/getComputedPropertiesManager/ComputedPropertiesManager/utils/getConditionIndexFactory/getConditionIndexFactory.ts
var import_filter17 = require("@winglet/common-utils/filter");

// packages/canard/schema-form/src/__legacy__/helpers/dynamicExpression/combineConditions/combineConditions.ts
var import_array3 = require("@winglet/common-utils/array");
var import_filter14 = require("@winglet/common-utils/filter");
var combineConditions = (conditions, operator = "&&") => {
  const filtered = conditions.filter(import_filter14.isTruthy);
  if (filtered.length === 0) return null;
  if (filtered.length === 1) return filtered[0];
  return (0, import_array3.map)(filtered, (item) => "(" + item + ")").join(operator);
};

// packages/canard/schema-form/src/__legacy__/helpers/dynamicExpression/convertExpression/convertExpression.ts
var import_filter15 = require("@winglet/common-utils/filter");
var convertExpression = (condition, inverse = false, source = JSONPointer.Parent) => {
  const operations = [];
  for (const key in condition) {
    const value = condition[key];
    if ((0, import_filter15.isArray)(value)) {
      operations.push(
        `${inverse ? "!" : ""}${JSON.stringify(value)}.includes((${source}${JSONPointer.Separator}${key}))`
      );
    } else {
      if (typeof value === "boolean")
        operations.push(
          `(${source}${JSONPointer.Separator}${key})${inverse ? "!==" : "==="}${value}`
        );
      else
        operations.push(
          `(${source}${JSONPointer.Separator}${key})${inverse ? "!==" : "==="}${JSON.stringify(value)}`
        );
    }
  }
  if (operations.length === 0) return null;
  if (operations.length === 1) return operations[0];
  const operator = inverse ? "||" : "&&";
  return operations.map((operation) => "(" + operation + ")").join(operator);
};

// packages/canard/schema-form/src/__legacy__/core/nodes/AbstractNode/utils/getComputedPropertiesManager/ComputedPropertiesManager/utils/getConditionIndexFactory/utils/getExpressionFromSchema.ts
var import_filter16 = require("@winglet/common-utils/filter");
var import_lib3 = require("@winglet/common-utils/lib");
var import_object7 = require("@winglet/common-utils/object");
var getExpressionFromSchema = (schema) => {
  const properties = schema.properties;
  if (!(0, import_filter16.isPlainObject)(properties)) return null;
  const condition = (0, import_object7.getEmptyObject)();
  const keys = Object.keys(properties);
  for (let i = 0, k = keys[0], l = keys.length; i < l; i++, k = keys[i]) {
    const subSchema = properties[k];
    if (k === ENHANCED_KEY) continue;
    if (subSchema.type !== void 0 || subSchema.$ref !== void 0) continue;
    if ((0, import_lib3.hasOwnProperty)(subSchema, "const")) condition[k] = subSchema.const;
    else if ((0, import_lib3.hasOwnProperty)(subSchema, "enum") && (0, import_filter16.isArray)(subSchema.enum)) {
      if (subSchema.enum.length === 1) condition[k] = subSchema.enum[0];
      else if (subSchema.enum.length > 1) condition[k] = subSchema.enum;
    }
  }
  return convertExpression(condition, false, JSONPointer.Current);
};

// packages/canard/schema-form/src/__legacy__/core/nodes/AbstractNode/utils/getComputedPropertiesManager/ComputedPropertiesManager/utils/getConditionIndexFactory/utils/extractConditionInfo.ts
var extractConditionInfo = (conditionSchemas, conditionField, pathManager) => {
  const expressions = [];
  const schemaIndices = [];
  for (let i = 0, l = conditionSchemas.length; i < l; i++) {
    const oneOfSchema = conditionSchemas[i];
    if (!oneOfSchema) continue;
    if (isNullBranch(oneOfSchema)) continue;
    const condition = oneOfSchema.computed?.[conditionField] ?? oneOfSchema[ALIAS + conditionField];
    if (typeof condition === "boolean") {
      if (condition === true) {
        expressions.push("true");
        schemaIndices.push(i);
      }
      continue;
    }
    const expression = combineConditions([
      typeof condition === "string" ? condition.trim() : null,
      getExpressionFromSchema(oneOfSchema)
    ]);
    if (expression === null) continue;
    expressions.push(
      expression.replace(JSON_POINTER_PATH_REGEX, (path) => {
        pathManager.set(path);
        return `dependencies[${pathManager.findIndex(path)}]`;
      }).replace(/;$/, "")
    );
    schemaIndices.push(i);
  }
  return { expressions, schemaIndices };
};

// packages/canard/schema-form/src/__legacy__/core/nodes/AbstractNode/utils/getComputedPropertiesManager/ComputedPropertiesManager/utils/getConditionIndexFactory/utils/getSimpleEquality.ts
var import_object8 = require("@winglet/common-utils/object");

// packages/canard/schema-form/src/__legacy__/core/nodes/AbstractNode/utils/getComputedPropertiesManager/ComputedPropertiesManager/utils/regex.ts
var SIMPLE_EQUALITY_REGEX = /^\s*\(?\s*dependencies\[(\d+)\]\s*\)?\s*===\s*(['"])([^'"]+)\2\s*$/;

// packages/canard/schema-form/src/__legacy__/core/nodes/AbstractNode/utils/getComputedPropertiesManager/ComputedPropertiesManager/utils/getConditionIndexFactory/utils/getSimpleEquality.ts
var getSimpleEquality = (expressions, schemaIndices) => {
  const equalityDictionary = (0, import_object8.getEmptyObject)();
  let invalid = false;
  for (let i = 0, l = expressions.length; i < l; i++) {
    if (expressions[i] === "true") {
      invalid = true;
      break;
    }
    const matches = expressions[i].match(SIMPLE_EQUALITY_REGEX);
    if (matches === null) {
      invalid = true;
      break;
    }
    const index = matches[1];
    const value = matches[3];
    if (equalityDictionary[index] === void 0)
      equalityDictionary[index] = (0, import_object8.getEmptyObject)();
    if (value in equalityDictionary[index]) continue;
    equalityDictionary[index][value] = schemaIndices[i];
  }
  if (invalid || (0, import_object8.countKey)(equalityDictionary) > 1) return null;
  const dependencyIndex = Number((0, import_object8.getFirstKey)(equalityDictionary));
  const valueMap = equalityDictionary[dependencyIndex];
  return (dependencies) => {
    const value = dependencies[dependencyIndex];
    return typeof value === "string" && value in valueMap ? valueMap[value] : -1;
  };
};

// packages/canard/schema-form/src/__legacy__/core/nodes/AbstractNode/utils/getComputedPropertiesManager/ComputedPropertiesManager/utils/getConditionIndexFactory/getConditionIndexFactory.ts
var getConditionIndexFactory = (type, jsonSchema) => (
  /**
   * Returns a condition index calculation function for the given dependency paths and field name.
   * @param dependencyPaths - Dependency path array
   * @param fieldName - Field name to calculate index for (oneOf, anyOf, etc.)
   * @param conditionField - Field name where condition is specified (if, ifNot, ifAny, ifAll)
   * @returns Condition index calculation function or undefined
   */
  (pathManager, fieldName, conditionField) => {
    if (type !== "object") return void 0;
    const conditionSchemas = jsonSchema[fieldName];
    if (!(0, import_filter17.isArray)(conditionSchemas)) return void 0;
    const { expressions, schemaIndices } = extractConditionInfo(
      conditionSchemas,
      conditionField,
      pathManager
    );
    const length = expressions.length;
    if (length === 0) return void 0;
    const simpleEquality = getSimpleEquality(expressions, schemaIndices);
    if (simpleEquality) return simpleEquality;
    const lines = new Array(length);
    for (let i = 0, exp = expressions[0]; i < length; i++, exp = expressions[i])
      lines[i] = `if(${exp}) return ${schemaIndices[i]};`;
    try {
      return new Function(
        "dependencies",
        `${lines.join("\n")}
return -1;`
      );
    } catch (error) {
      throw new JSONSchemaError(
        "CONDITION_INDEX",
        formatConditionIndexError(fieldName, expressions, lines, error),
        { fieldName, expressions, lines, error }
      );
    }
  }
);

// packages/canard/schema-form/src/__legacy__/core/nodes/AbstractNode/utils/getComputedPropertiesManager/ComputedPropertiesManager/utils/getConditionIndexFactory/getConditionIndicesFactory.ts
var import_filter18 = require("@winglet/common-utils/filter");
var getConditionIndicesFactory = (type, jsonSchema) => (
  /**
   * Creates a condition index calculation function for the specified field and condition type.
   * The returned function evaluates all conditions and returns an array of indices
   * where conditions are satisfied.
   *
   * @param pathManager - Path manager for resolving dependency paths
   * @param fieldName - Schema field containing conditional schemas (e.g., 'oneOf', 'anyOf', 'allOf')
   * @param conditionField - Condition type to evaluate ('if', 'ifNot', 'ifAny', 'ifAll')
   * @returns A function that returns all matching schema indices, or undefined if no conditions exist
   *
   * @example
   * // For a schema with multiple oneOf conditions:
   * const getIndices = factory(pathManager, 'oneOf', 'if');
   * // If conditions at indices 0, 2, and 3 are satisfied:
   * getIndices(dependencies); // Returns [0, 2, 3]
   */
  (pathManager, fieldName, conditionField) => {
    if (type !== "object") return void 0;
    const conditionSchemas = jsonSchema[fieldName];
    if (!(0, import_filter18.isArray)(conditionSchemas)) return void 0;
    const { expressions, schemaIndices } = extractConditionInfo(
      conditionSchemas,
      conditionField,
      pathManager
    );
    const length = expressions.length;
    if (length === 0) return void 0;
    const lines = new Array(length);
    for (let i = 0, exp = expressions[0]; i < length; i++, exp = expressions[i])
      lines[i] = `if(${exp}) indices[indices.length] = ${schemaIndices[i]};`;
    try {
      return new Function(
        "dependencies",
        `const indices = [];
${lines.join("\n")}
return indices;`
      );
    } catch (error) {
      throw new JSONSchemaError(
        "CONDITION_INDICES",
        formatConditionIndicesError(fieldName, expressions, lines, error),
        { fieldName, expressions, lines, error }
      );
    }
  }
);

// packages/canard/schema-form/src/__legacy__/core/nodes/AbstractNode/utils/getComputedPropertiesManager/ComputedPropertiesManager/utils/getDerivedValueFactory/getDerivedValueFactory.ts
var getDerivedValueFactory = (jsonSchema) => (
  /**
   * Returns a derived value factory function for the given dependency paths and field name.
   * @param dependencyPaths - Dependency path array
   * @param fieldName - Field name to get
   * @returns Derived value getter factory function or undefined
   */
  (pathManager, fieldName) => {
    const expression = jsonSchema.computed?.[fieldName] ?? jsonSchema[ALIAS + fieldName];
    return createDynamicFunction(pathManager, fieldName, expression);
  }
);

// packages/canard/schema-form/src/__legacy__/core/nodes/AbstractNode/utils/getComputedPropertiesManager/ComputedPropertiesManager/utils/getObservedValuesFactory/getObservedValuesFactory.ts
var import_filter19 = require("@winglet/common-utils/filter");
var getObservedValuesFactory = (schema) => (
  /**
   * Returns an observed values calculation function for the given dependency paths and field name.
   * @param dependencyPaths - Dependency path array
   * @param fieldName - Field name to observe
   * @returns Function that returns observed values array from dependency array, or undefined
   */
  (pathManager, fieldName) => {
    const watch = schema?.computed?.[fieldName] ?? schema?.[ALIAS + fieldName];
    if (!watch || !((0, import_filter19.isString)(watch) || (0, import_filter19.isArray)(watch))) return;
    const watchValues = (0, import_filter19.isArray)(watch) ? watch : [watch];
    const watchValueIndexes = [];
    for (let i = 0, l = watchValues.length; i < l; i++) {
      const path = watchValues[i];
      pathManager.set(path);
      watchValueIndexes.push(pathManager.findIndex(path));
    }
    if (watchValueIndexes.length === 0) return;
    try {
      return new Function(
        "dependencies",
        `const indexes = [${watchValueIndexes.join(",")}];
         const result = new Array(indexes.length);
         for (let i = 0, l = indexes.length; i < l; i++)
           result[i] = dependencies[indexes[i]];
         return result;`
      );
    } catch (error) {
      throw new JSONSchemaError(
        "OBSERVED_VALUES",
        formatObservedValuesError(fieldName, watch, watchValueIndexes, error),
        { fieldName, watch, watchValueIndexes, error }
      );
    }
  }
);

// packages/canard/schema-form/src/__legacy__/core/nodes/AbstractNode/utils/getComputedPropertiesManager/ComputedPropertiesManager/ComputedPropertiesManager.ts
var ComputedPropertiesManager = class {
  /**
   * Creates a ComputedPropertiesManager instance.
   *
   * @param type - The JSON Schema type of the node (string, number, object, etc.)
   * @param schema - The JSON Schema containing computed property definitions
   * @param rootSchema - The root schema (used for reference resolution)
   *
   * @description
   * The constructor performs the following operations:
   * 1. Parses the schema's computed properties to create dynamic functions for each
   * 2. Collects all dependency paths and stores them in `dependencyPaths`
   * 3. Processes `&if` conditions in oneOf/anyOf to support conditional schemas
   *
   * @example
   * ```typescript
   * const manager = new ComputedPropertiesManager(
   *   'string',
   *   {
   *     type: 'string',
   *     computed: {
   *       visible: '../showField === true',
   *       disabled: '../isLocked',
   *     }
   *   },
   *   rootSchema
   * );
   * ```
   */
  constructor(type, schema, rootSchema) {
    /**
     * The active state of the node.
     * @description Result of evaluating the `computed.active` expression. When `false`, the node is treated as inactive.
     * @default true
     */
    this.active = true;
    /**
     * The visibility state of the node.
     * @description Result of evaluating the `computed.visible` expression. When `false`, the node is hidden in the UI.
     * @default true
     */
    this.visible = true;
    /**
     * The read-only state of the node.
     * @description Result of evaluating the `computed.readOnly` expression. When `true`, the node value cannot be modified.
     * @default false
     */
    this.readOnly = false;
    /**
     * The disabled state of the node.
     * @description Result of evaluating the `computed.disabled` expression. When `true`, the node is disabled in the UI.
     * @default false
     */
    this.disabled = false;
    /**
     * The currently selected index in oneOf conditions.
     * @description The index of the first `oneOf[n]['&if']` condition that evaluates to `true`.
     * @default -1 (no matching condition)
     */
    this.oneOfIndex = -1;
    /**
     * List of matching indices in anyOf conditions.
     * @description An array of all indices where `anyOf[n]['&if']` conditions evaluate to `true`.
     * @default []
     */
    this.anyOfIndices = [];
    /**
     * Array of watched dependency values.
     * @description Current values of paths specified in the `computed.watch` array.
     * @default []
     */
    this.watchValues = [];
    /**
     * Whether computed properties has pristine function.
     * @description Indicates that a pristine function is defined.
     * @readonly
     */
    this.isPristineDefined = false;
    /**
     * Whether computed properties has derived function.
     * @description Indicates that a derived function is defined.
     * @readonly
     */
    this.isDerivedDefined = false;
    /**
     * Whether the node has a post-processor.
     * @description Indicates that a post-process function (derivedValue or pristine) is defined.
     * @readonly
     */
    this.hasPostProcessor = false;
    /**
     * Whether computed properties are configured.
     * @description Set during initialization based on whether `dependencyPaths` is non-empty.
     * @readonly
     */
    this.isEnabled = false;
    const pathManager = getPathManager();
    const checkComputedOption = checkComputedOptionFactory(schema, rootSchema);
    const getConditionIndex = getConditionIndexFactory(type, schema);
    const getConditionIndices = getConditionIndicesFactory(type, schema);
    const getObservedValues = getObservedValuesFactory(schema);
    const getDerivedValue = getDerivedValueFactory(schema);
    this.__active__ = checkComputedOption(pathManager, "active");
    this.__visible__ = checkComputedOption(pathManager, "visible");
    this.__readOnly__ = checkComputedOption(pathManager, "readOnly");
    this.__disabled__ = checkComputedOption(pathManager, "disabled");
    this.__oneOfIndex__ = getConditionIndex(pathManager, "oneOf", "if");
    this.__anyOfIndices__ = getConditionIndices(pathManager, "anyOf", "if");
    this.__watchValues__ = getObservedValues(pathManager, "watch");
    this.__derivedValue__ = getDerivedValue(pathManager, "derived");
    this.__pristine__ = checkComputedOption(pathManager, "pristine");
    this.dependencyPaths = pathManager.get();
    this.dependencies = new Array(this.dependencyPaths.length);
    this.isEnabled = this.dependencyPaths.length > 0;
    this.isPristineDefined = this.__pristine__ !== void 0;
    this.isDerivedDefined = this.__derivedValue__ !== void 0;
    this.hasPostProcessor = this.isDerivedDefined || this.isPristineDefined;
  }
  /**
   * Calculates and returns the derived value.
   * @description Evaluates the `computed.derived` expression using current dependency values.
   * @returns The derived value, or `undefined` if no derived function is defined.
   */
  getDerivedValue() {
    return this.__derivedValue__?.(this.dependencies);
  }
  /**
   * Calculates and returns the pristine state.
   * @description Evaluates the `computed.pristine` expression using current dependency values.
   * @returns The pristine state (`true`/`false`), or `undefined` if no pristine function is defined.
   */
  getPristine() {
    return this.__pristine__?.(this.dependencies);
  }
  /**
   * Recalculates all computed properties based on dependency values.
   *
   * @description
   * This method is called when dependency values change and updates the following properties:
   * - `active`, `visible`, `readOnly`, `disabled`: Boolean state values
   * - `oneOfIndex`: Index of the matching oneOf condition
   * - `anyOfIndices`: Array of indices for all matching anyOf conditions
   * - `watchValues`: Current values of watched paths
   *
   * @example
   * ```typescript
   * // Dependency paths: ['../category', '../locked']
   * // Set dependency values directly
   * manager.dependencies[0] = 'premium';
   * manager.dependencies[1] = true;
   * manager.recalculate();
   *
   * console.log(manager.visible); // Result of computed.visible expression
   * console.log(manager.readOnly); // Result of computed.readOnly expression
   * ```
   */
  recalculate() {
    const dependencies = this.dependencies;
    if (this.__active__) this.active = this.__active__(dependencies);
    if (this.__visible__) this.visible = this.__visible__(dependencies);
    if (this.__readOnly__) this.readOnly = this.__readOnly__(dependencies);
    if (this.__disabled__) this.disabled = this.__disabled__(dependencies);
    if (this.__oneOfIndex__)
      this.oneOfIndex = this.__oneOfIndex__(dependencies);
    if (this.__anyOfIndices__)
      this.anyOfIndices = this.__anyOfIndices__(dependencies);
    if (this.__watchValues__)
      this.watchValues = this.__watchValues__(dependencies);
  }
};

// packages/canard/schema-form/src/__legacy__/core/nodes/AbstractNode/utils/getComputedPropertiesManager/utils/needsRealComputedManager/needsRealComputedManager.ts
var import_filter20 = require("@winglet/common-utils/filter");
var needsRealComputedManager = (type, jsonSchema, rootSchema) => {
  const computed = jsonSchema.computed;
  if (computed != null) {
    for (const field of COMPUTED_FIELD_NAMES)
      if (computed[field] !== void 0) return true;
  }
  for (const field of STATE_FIELD_NAMES) {
    if (jsonSchema[field] !== void 0) return true;
    if (rootSchema[field] !== void 0) return true;
  }
  for (const field of COMPUTED_FIELD_NAMES)
    if (jsonSchema[ALIAS + field] !== void 0) return true;
  if (type === "object" && ((0, import_filter20.isArray)(jsonSchema.oneOf) || (0, import_filter20.isArray)(jsonSchema.anyOf)))
    return true;
  return false;
};

// packages/canard/schema-form/src/__legacy__/core/nodes/AbstractNode/utils/getComputedPropertiesManager/utils/sharedComputedSentinel/sharedComputedSentinel.ts
var import_constant5 = require("@winglet/common-utils/constant");
var SENTINEL_NUMBERS = Object.freeze([]);
var SENTINEL_VALUES = Object.freeze([]);
var SENTINEL_PATHS = Object.freeze([]);
var sharedComputedSentinel = Object.freeze({
  active: true,
  visible: true,
  readOnly: false,
  disabled: false,
  oneOfIndex: -1,
  anyOfIndices: SENTINEL_NUMBERS,
  watchValues: SENTINEL_VALUES,
  dependencyPaths: SENTINEL_PATHS,
  dependencies: SENTINEL_VALUES,
  isPristineDefined: false,
  isDerivedDefined: false,
  hasPostProcessor: false,
  isEnabled: false,
  getDerivedValue: import_constant5.VOID_FUNCTION,
  getPristine: import_constant5.VOID_FUNCTION,
  recalculate: import_constant5.VOID_FUNCTION
});

// packages/canard/schema-form/src/__legacy__/core/nodes/AbstractNode/utils/getComputedPropertiesManager/getComputedPropertiesManager.ts
var getComputedPropertiesManager = (schemaType, jsonSchema, rootJSONSchema) => needsRealComputedManager(schemaType, jsonSchema, rootJSONSchema) ? new ComputedPropertiesManager(schemaType, jsonSchema, rootJSONSchema) : sharedComputedSentinel;

// packages/canard/schema-form/src/__legacy__/core/nodes/AbstractNode/utils/getNodeGroup/getNodeGroup.ts
var import_lib4 = require("@winglet/common-utils/lib");
var import_filter21 = require("@winglet/react-utils/filter");
var getNodeGroup = (type, schema) => {
  if (typeof schema.terminal === "boolean")
    return schema.terminal ? "terminal" : "branch";
  if (isBranchType(type))
    return isTerminalFormTypeInput(schema) ? "terminal" : "branch";
  return "terminal";
};
var isTerminalFormTypeInput = (schema) => (0, import_lib4.hasOwnProperty)(schema, "FormTypeInput") && (0, import_filter21.isReactComponent)(schema.FormTypeInput);

// packages/canard/schema-form/src/__legacy__/core/nodes/AbstractNode/utils/getSafeEmptyValue/getSafeEmptyValue.ts
var getSafeEmptyValue = (value, schemaType) => {
  if (value !== void 0) return value;
  return getEmptyValue(schemaType);
};

// packages/canard/schema-form/src/__legacy__/core/nodes/AbstractNode/utils/getScopedSegment/getScopedSegment.ts
var getScopedSegment = (name, scope, parentType, variant) => {
  if (!scope) return name;
  const index = variant !== void 0 ? JSONPointer.Separator + variant : "";
  if (scope === "oneOf" || scope === "anyOf" || scope === "allOf") {
    switch (parentType) {
      case "object":
        return scope + index + JSONPointer.Separator + "properties" + JSONPointer.Separator + name;
      case "array":
        return scope + index + JSONPointer.Separator + "items";
      default:
        return scope + index + JSONPointer.Separator + name;
    }
  }
  if (scope === "properties") return "properties" + JSONPointer.Separator + name;
  if (scope === "items") return "items" + index;
  if (variant !== void 0)
    return scope + JSONPointer.Separator + variant + JSONPointer.Separator + name;
  return scope + JSONPointer.Separator + name;
};

// packages/canard/schema-form/src/__legacy__/core/nodes/AbstractNode/utils/shallowPatch/shallowPatch.ts
var import_filter22 = require("@winglet/common-utils/filter");
var shallowPatch = (base, input, additive = false) => {
  const patch = typeof input === "function" ? input({ ...base }) : input;
  if (patch === void 0) return (0, import_filter22.isEmptyObject)(base) ? void 0 : {};
  if (patch === null || typeof patch !== "object") return void 0;
  let idle = true;
  const result = { ...base };
  const keys = Object.keys(patch);
  for (let i = 0, k = keys[0], l = keys.length; i < l; i++, k = keys[i]) {
    const value = patch[k];
    if (additive) {
      if (value && result[k] !== value) {
        result[k] = value;
        if (idle) idle = false;
      }
    } else {
      if (value === void 0) {
        if (k in result) {
          delete result[k];
          if (idle) idle = false;
        }
      } else if (result[k] !== value) {
        result[k] = value;
        if (idle) idle = false;
      }
    }
  }
  if (idle) return;
  return result;
};

// packages/canard/schema-form/src/__legacy__/core/nodes/AbstractNode/utils/traversal/depthFirstSearch.ts
var depthFirstSearch = (node, visitor, postOrder = true) => {
  if (postOrder === false) visitor(node);
  const nodes = node.subnodes;
  if (nodes?.length)
    for (let i = 0, e = nodes[0], l = nodes.length; i < l; i++, e = nodes[i])
      depthFirstSearch(e.node, visitor, postOrder);
  if (postOrder === true) visitor(node);
};

// packages/canard/schema-form/src/__legacy__/core/nodes/AbstractNode/AbstractNode.ts
var AbstractNode = class {
  constructor({
    name,
    scope,
    variant,
    jsonSchema,
    schemaType,
    required,
    nullable,
    defaultValue,
    onChange,
    parentNode,
    validationMode,
    validatorFactory,
    contextNode
  }) {
    /** @internal Flag indicating whether the restore value is explicitly defined. */
    this.__isDefinedRestoreValue__ = false;
    /** @internal Whether a write from outside the form's own machinery reached this node since its last injection. */
    this.__intendedWrite__ = false;
    /**
     * @internal Whether this node belongs to the active `oneOf`/`anyOf` branch.
     * @remarks Separate from `active` which is controlled by computed properties.
     *          Nodes outside the active branch are excluded from value propagation.
     */
    this.__scoped__ = true;
    /**
     * @internal Global state flags aggregated from all nodes in the form tree.
     * @remarks Only meaningful on root nodes. Aggregates truthy state values from descendants.
     *          Useful for form-wide indicators like `hasErrors` or `isDirty`.
     */
    this.__globalState__ = {};
    /**
     * @internal Local state flags specific to this node.
     * @remarks Stores custom state like `touched`, `dirty`, `focused`, etc.
     *          Changes are published via `UpdateState` event and propagated to `globalState`.
     */
    this.__state__ = {};
    /** @internal Error manager for this node. */
    this.__errorManager__ = new ValidationErrorManager();
    /**
     * @internal Event manager handling publishing, subscription, and batching.
     * @remarks Encapsulates listener registration, event batching to prevent recursion,
     *          and dependency subscription cleanup.
     */
    this.__eventManager__ = new EventCascadeManager(() => ({
      path: this.path,
      dependencies: this.__computeManager__.dependencyPaths
    }));
    /** @internal Flag indicating initialization completion. */
    this.__initialized__ = false;
    this.scope = scope;
    this.variant = variant;
    this.jsonSchema = jsonSchema;
    this.schemaType = schemaType;
    this.nullable = nullable;
    this.required = required ?? false;
    this.isRoot = !parentNode;
    this.rootNode = parentNode?.rootNode || this;
    this.parentNode = parentNode || null;
    this.group = getNodeGroup(this.schemaType, this.jsonSchema);
    this.depth = this.parentNode ? this.parentNode.depth + 1 : 0;
    this.__name__ = name || "";
    this.__escapedName__ = (0, import_pointer4.escapeSegment)(this.__name__);
    this.__path__ = joinSegment(this.parentNode?.path, this.__escapedName__);
    this.__schemaPath__ = this.scope ? joinSegment(
      this.parentNode?.schemaPath || JSONPointer.Fragment,
      getScopedSegment(
        this.__escapedName__,
        this.scope,
        this.parentNode?.type,
        this.variant
      )
    ) : joinSegment(
      this.parentNode?.schemaPath || JSONPointer.Fragment,
      this.__escapedName__
    );
    this.__contextNode__ = this.isRoot ? contextNode || null : this.rootNode.__contextNode__;
    this.__updateScoped__();
    this.__setDefaultValue__(
      defaultValue !== void 0 ? defaultValue : getDefaultValue(jsonSchema)
    );
    this.__computeManager__ = getComputedPropertiesManager(
      this.schemaType,
      this.jsonSchema,
      this.rootNode.jsonSchema
    );
    if (this.isRoot) {
      this.__injectionGuardManager__ = new InjectionGuardManager();
      this.__validationManager__ = new ValidationManager(
        this,
        validatorFactory,
        validationMode
      );
      const validateEnabled = this.__validationManager__?.enabled === true;
      const validateOnChange = validationMode ? (validationMode & ValidationMode.OnChange) > 0 : false;
      this.__handleChange__ = afterMicrotask(() => {
        if (validateEnabled && validateOnChange)
          this.__validationManager__?.validate(this.__enhancedValue__);
        onChange(getSafeEmptyValue(this.normalizedValue, this.schemaType));
      });
      if (validateEnabled)
        this.__enhancer__ = getEmptyValue(this.schemaType);
    } else this.__handleChange__ = onChange;
  }
  /**
   * Context object for accessing form-wide shared data.
   * @remarks Root nodes return their own context value, child nodes delegate to `rootNode.context`.
   */
  get context() {
    return this.__contextNode__?.value || {};
  }
  /**
   * Active child nodes within the current scope.
   * @remarks For branch nodes (object/array), returns children matching the active `oneOf`/`anyOf` branch.
   *          For terminal nodes, always returns `null`.
   */
  get children() {
    return null;
  }
  /**
   * All child nodes regardless of scope or active state.
   * @remarks Unlike `children`, this includes nodes from all `oneOf`/`anyOf` variants.
   *          Useful for operations that need to traverse the complete node tree.
   */
  get subnodes() {
    return this.children;
  }
  /**
   * Node's name (property key or array index).
   * @remarks Readonly externally, but can be changed via `__setName__` by the parent node.
   */
  get name() {
    return this.__name__;
  }
  /**
   * Node's escaped name for use in JSON Pointer paths.
   * @remarks Escapes special characters (`~` → `~0`, `/` → `~1`) per RFC 6901.
   *          May be identical to `name` if no escaping is needed.
   */
  get escapedName() {
    return this.__escapedName__;
  }
  /**
   * Sets the node's name.
   * @param name - The new name to set
   * @param actor - The node requesting the change (must be parent or self)
   * @internal Only the parent node or self can change the name.
   */
  __setName__(name, actor) {
    if (actor !== this.parentNode && actor !== this) return;
    this.__name__ = name;
    this.__escapedName__ = (0, import_pointer4.escapeSegment)(name);
    this.__updatePath__();
  }
  /**
   * Node's JSON Pointer path to its data location.
   * @remarks Readonly externally, updated automatically when parent path changes.
   * @example '/users/0/name'
   */
  get path() {
    return this.__path__;
  }
  /**
   * Node's path within the JSON Schema structure.
   * @remarks Includes scope segments for `oneOf`/`anyOf` branches.
   *          Readonly externally, updated automatically when parent path changes.
   */
  get schemaPath() {
    return this.__schemaPath__;
  }
  /**
   * Unique identifier combining schema path and data path.
   * @remarks Used for React keys and node identification across the tree.
   */
  get key() {
    return this.__schemaPath__ + UNIT_SEPARATOR + this.__path__;
  }
  /**
   * Updates the node's path based on parent node's path.
   * @returns `true` if the path was changed, `false` otherwise
   * @internal Recursively updates all subnode paths when changed.
   */
  __updatePath__() {
    const previous = this.__path__;
    const parent = this.parentNode;
    const escapedName = this.__escapedName__;
    const current = joinSegment(parent?.path, escapedName);
    if (previous === current) return false;
    this.__path__ = current;
    this.__schemaPath__ = this.scope ? joinSegment(
      parent?.schemaPath || JSONPointer.Fragment,
      getScopedSegment(escapedName, this.scope, parent?.type, this.variant)
    ) : joinSegment(parent?.schemaPath || JSONPointer.Fragment, escapedName);
    const subnodes = this.subnodes;
    if (subnodes?.length)
      for (const subnode of subnodes) subnode.node.__updatePath__();
    this.publish(NodeEventType.UpdatePath, current, { previous, current });
    return true;
  }
  /**
   * Finds a node in the tree by JSON Pointer path.
   * @param pointer - JSON Pointer path (e.g., `/foo/0/bar`), or `undefined` to return self
   * @returns The found node, or `null` if not found
   * @example
   * ```ts
   * node.find('/users/0/name');  // Absolute path from root
   * node.find('./child');        // Relative path from current node
   * node.find();                 // Returns self
   * ```
   */
  find(pointer) {
    if (pointer === void 0) return this;
    if (pointer === JSONPointer.Context) return this.__contextNode__;
    if (pointer === JSONPointer.Root) return this.rootNode;
    const absolute = isAbsolutePath(pointer);
    if (absolute && pointer.length === 1) return this.rootNode;
    return findNode(absolute ? this.rootNode : this, pointer);
  }
  /**
   * Finds all nodes in the tree matching the given JSON Pointer path.
   * @param pointer - JSON Pointer path, or `undefined` to return self in array
   * @returns Array of matching nodes, or empty array if none found
   * @remarks Useful when path may match multiple nodes (e.g., with wildcards).
   */
  findAll(pointer) {
    if (pointer === void 0) return [this];
    if (pointer === JSONPointer.Context)
      return this.__contextNode__ ? [this.__contextNode__] : [];
    if (pointer === JSONPointer.Root) return [this.rootNode];
    const absolute = isAbsolutePath(pointer);
    if (absolute && pointer.length === 1) return [this.rootNode];
    return findNodes(absolute ? this.rootNode : this, pointer);
  }
  /**
   * Node's default value from schema or initialization.
   * @remarks It does not change after initialization; `resetSubtree()` returns the node to it.
   */
  get defaultValue() {
    return this.__initialValue__;
  }
  /**
   * Sets the value the node is restored to.
   * @param defaultValue - The value to restore to
   * @internal Until the node is initialized this is also its initial value; afterwards only the restore value moves.
   */
  __setDefaultValue__(defaultValue) {
    if (!this.__initialized__) this.__initialValue__ = defaultValue;
    this.__restoreValue__ = defaultValue;
    this.__isDefinedRestoreValue__ = checkDefinedValue(defaultValue);
  }
  /**
   * Sets the node's value with configurable update behavior.
   * @param input - The value to set, or a function receiving the previous value
   * @param option - Bitwise options (default: `Overwrite`)
   *   - `Overwrite`: `Replace | Merge` — replace the current value entirely (default)
   *   - `Merge`: `Propagate | Refresh | Isolate | BatchDefault` — merge into the existing value; an array has nothing to merge into, so it behaves as `Overwrite`
   *   - `Replace`: Replace the current value instead of merging into it
   *   - `Propagate`: Propagate the update to child nodes
   *   - `Refresh`: Publish `RequestRefresh` so uncontrolled inputs re-read the value
   *   - `Isolate`: Update computed properties at once and publish `UpdateValue` as unsettled
   *   - `BatchDefault`: `Batch | EmitChange | PublishUpdateEvent` — report to the parent in batch mode and publish `UpdateValue`
   * @example
   * ```ts
   * node.setValue('new value');
   * node.setValue(prev => prev + ' updated');
   * node.setValue({ key: 'value' }, SetValueOption.Merge);
   * ```
   */
  setValue(input, option = SetValueOption.Overwrite) {
    this.applyValue(
      typeof input === "function" ? input(this.value) : input,
      option
    );
  }
  /**
   * Records that a write from outside the form's own machinery changed this node.
   * @internal Called where a value is actually committed — a `setValue` that changes nothing records nothing — and ignored before initialization, when every commit is the node building itself.
   */
  __markIntendedWrite__() {
    if (this.__initialized__) this.__intendedWrite__ = true;
  }
  /**
   * Compares two values for equality.
   * @param left - First value to compare
   * @param right - Second value to compare
   * @returns `true` if values are considered equal
   * @internal Can be overridden by subclasses for deep comparison.
   */
  __equals__(left, right) {
    return left === right;
  }
  /**
   * Normalized (refined) view of this node's value — schema output filters applied.
   * @remarks Defaults to `value`; subclasses override to refine the exposed value (e.g. `ArrayNode` `options.omitTrailing`).
   *          Read by root validation, root emission, `FormHandle.getValue`, and parent-side hydration snapshots.
   */
  get normalizedValue() {
    return this.value;
  }
  /**
   * Notifies the parent of a value change.
   * @param input - The new value
   * @param batch - Whether to batch the change notification
   * @param automatic - Whether the form produced this value by itself
   * @internal Only propagates if node is active and scoped.
   */
  onChange(input, batch, automatic) {
    if (this.__computeManager__.active && this.__scoped__)
      this.__handleChange__(input, batch, automatic);
    else if (input === void 0)
      this.__handleChange__(void 0, batch, automatic);
  }
  /**
   * Whether this node is active and participates in value updates.
   * @remarks `true` if both computed `active` property and branch scope conditions are met.
   *          Inactive node values are excluded from parent value composition.
   */
  get active() {
    return this.__computeManager__.active && this.__scoped__;
  }
  /**
   * Whether this node should be displayed in the UI.
   * @remarks Based on computed `visible` property. Defaults to `true` if not defined.
   *          Invisible nodes still hold values; only rendering is affected.
   */
  get visible() {
    return this.__computeManager__.visible;
  }
  /**
   * Whether this node is fully enabled for rendering and interaction.
   * @remarks `true` if the node is active, scoped, and visible.
   *          Use this to determine if a form field should be rendered.
   */
  get enabled() {
    return this.__scoped__ && this.__computeManager__.active && this.__computeManager__.visible;
  }
  /**
   * Whether this node's value is read-only for user interaction.
   * @remarks Based on computed `readOnly` property.
   *          Value can still be changed programmatically via `setValue()`.
   */
  get readOnly() {
    return this.__computeManager__.readOnly;
  }
  /**
   * Whether this node is disabled for user interaction.
   * @remarks Based on computed `disabled` property.
   *          Unlike `readOnly`, typically affects visual appearance more significantly.
   */
  get disabled() {
    return this.__computeManager__.disabled;
  }
  /**
   * Index of the currently active `oneOf` schema branch.
   * @remarks 0-based index, or `-1` if no branch is active.
   *          Used by child nodes to determine their scoped state.
   */
  get oneOfIndex() {
    return this.__computeManager__.oneOfIndex;
  }
  /**
   * Indices of currently active `anyOf` schema branches.
   * @remarks Array of 0-based indices. Multiple branches can be active simultaneously.
   *          Empty array if none are active.
   */
  get anyOfIndices() {
    return this.__computeManager__.anyOfIndices;
  }
  /**
   * Computed values from dependencies for reactive UI updates.
   * @remarks Useful for React `useMemo`/`useEffect` dependencies.
   *          Values correspond to paths defined in `computed.watch`.
   */
  get watchValues() {
    return this.__computeManager__.watchValues;
  }
  /**
   * Initializes dependency subscriptions for computed properties.
   * @internal Called during node initialization.
   */
  __prepareUpdateDependencies__() {
    if (this.__initialized__) return;
    const manager = this.__computeManager__;
    const dependencyPaths = manager.dependencyPaths;
    if (manager.isEnabled) {
      for (let i = 0, l = dependencyPaths.length; i < l; i++) {
        const targetNodes = this.findAll(dependencyPaths[i]);
        if (targetNodes.length === 0) continue;
        manager.dependencies[i] = this.find(dependencyPaths[i])?.value;
        const unsubscribes = (0, import_array4.map)(
          targetNodes,
          (node) => node.subscribe(({ type, payload }) => {
            if (type & NodeEventType.UpdateValue) {
              if (manager.dependencies[i] !== payload?.[NodeEventType.UpdateValue]) {
                manager.dependencies[i] = payload?.[NodeEventType.UpdateValue];
                this.__updateComputedProperties__();
              }
            }
          })
        );
        for (const unsubscribe of unsubscribes)
          this.saveUnsubscribe(unsubscribe);
      }
    }
    if (manager.hasPostProcessor)
      this.subscribe(({ type }) => {
        if (type & NodeEventType.UpdateComputedProperties) {
          if (manager.isDerivedDefined) {
            const derivedValue = manager.getDerivedValue();
            if (this.active && !this.__equals__(this.value, derivedValue))
              this.setValue(
                derivedValue,
                SetValueOption.Overwrite | SetValueOption.Automatic
              );
          }
          if (manager.isPristineDefined) {
            if (manager.getPristine()) this.setState();
          }
        }
      });
    this.__updateComputedProperties__();
  }
  /**
   * Recalculates computed properties based on current dependencies.
   * @param reset - Whether to reset the node when `active` state changes (default: `true`)
   * @internal Publishes `UpdateComputedProperties` event after recalculation.
   */
  __updateComputedProperties__(reset = true) {
    const computeManager = this.__computeManager__;
    const previous = computeManager.active;
    computeManager.recalculate();
    if (reset && previous !== computeManager.active)
      this.__reset__({ preferLatest: true });
    this.publish(NodeEventType.UpdateComputedProperties);
  }
  /**
   * Recursively updates computed properties for this node and all descendants.
   * @param includeSelf - Whether to include the current node (default: `false`)
   * @param includeInactive - Whether to include inactive child nodes (default: `true`)
   * @internal Used for bulk computed property recalculation.
   */
  __updateComputedPropertiesRecursively__(includeSelf = false, includeInactive = true) {
    if (includeSelf) this.__updateComputedProperties__(false);
    const list = includeInactive ? this.subnodes : this.children;
    if (!list?.length) return;
    for (let i = 0, e = list[0], l = list.length; i < l; i++, e = list[i]) {
      e.node.__updateComputedPropertiesRecursively__(true, includeInactive);
    }
  }
  /**
   * Updates the node's scoped state based on parent's `oneOf`/`anyOf` index.
   * @internal Called when parent's active branch changes.
   */
  __updateScoped__() {
    if (this.variant === void 0 || this.parentNode === null) return;
    if (this.scope === "oneOf")
      this.__scoped__ = this.parentNode.oneOfIndex === this.variant;
    else if (this.scope === "anyOf")
      this.__scoped__ = this.parentNode.anyOfIndices.indexOf(this.variant) !== -1;
  }
  /**
   * Aggregated state flags from all nodes in the form tree.
   * @remarks On root nodes, returns own `__globalState__`.
   *          On child nodes, delegates to `rootNode.globalState`.
   */
  get globalState() {
    return this.isRoot ? this.__globalState__ : this.rootNode.__globalState__;
  }
  /**
   * Node's local state flags.
   * @remarks Use `setState()` method to modify.
   */
  get state() {
    return this.__state__;
  }
  /**
   * Sets the global state flags for the form tree.
   * @param input - State to set, or `undefined` to clear all flags
   * @internal On root nodes, updates directly. On child nodes, delegates to root.
   *           Only truthy values are accumulated (falsy values are ignored).
   */
  __setGlobalState__(input) {
    if (this.isRoot) {
      const state = shallowPatch(this.__globalState__, input, true);
      if (state === void 0) return;
      this.__globalState__ = state;
      this.publish(NodeEventType.UpdateGlobalState, state);
    } else this.rootNode.__setGlobalState__(input);
  }
  /**
   * Sets the node's local state flags.
   * @param input - State object to merge, or function receiving previous state.
   *                Pass `undefined` to clear all state.
   * @param silent - If `true`, skip propagating to `globalState` (default: `false`)
   * @example
   * ```ts
   * node.setState({ touched: true });
   * node.setState(prev => ({ ...prev, dirty: true }));
   * node.setState(); // Clear all state
   * ```
   */
  setState(input, silent) {
    const state = shallowPatch(this.__state__, input);
    if (state === void 0) return;
    this.__state__ = state;
    this.publish(NodeEventType.UpdateState, state);
    if (silent !== true) this.__setGlobalState__(state);
  }
  /**
   * Sets state flags for all nodes in the subtree.
   * @param state - State flags to apply to all descendant nodes
   * @remarks Traverses all descendants using depth-first search.
   *          Updates `globalState` after all nodes are updated.
   */
  setSubtreeState(state) {
    depthFirstSearch(this, (node) => node.setState(state, true));
    this.__setGlobalState__(state);
  }
  /**
   * Clears state flags for all nodes in the subtree.
   * @remarks If called on root node, also clears `globalState`.
   */
  clearSubtreeState() {
    depthFirstSearch(this, (node) => node.setState(void 0, true));
    if (this.isRoot) this.__setGlobalState__();
  }
  /**
   * @internal Whether validation is enabled for this form.
   * @remarks Delegates to root node for child nodes.
   */
  get __validationEnabled__() {
    if (this.isRoot) return this.__validationManager__?.enabled === true;
    else return this.rootNode.__validationManager__?.enabled === true;
  }
  /**
   * Validates the node's current value against the JSON Schema.
   * @returns Promise resolving to array of validation errors
   * @remarks For child nodes, delegates to `rootNode.validate()`.
   *          Returns empty array if `ValidationMode.None` is configured.
   */
  async validate() {
    if (this.isRoot)
      await this.__validationManager__?.validate(this.__enhancedValue__);
    else await this.rootNode.validate();
    return this.globalErrors;
  }
  /**
   * @internal Value used for validation, merging actual value with enhancer.
   * @remarks An enhancer entry reaches the value only where the value holds the object it belongs to, so validation never sees a node the value leaves out.
   */
  get __enhancedValue__() {
    const value = this.normalizedValue;
    if (this.group === "terminal" || value == null) return value;
    const enhancer = this.__enhancer__;
    if (enhancer === void 0 || (0, import_filter23.isEmptyObject)(enhancer)) return value;
    return applyEnhancer(value, enhancer);
  }
  /**
   * Adds or updates a value in the enhancer for validation.
   * @param pointer - JSON Pointer path to the value location
   * @param value - Value to set (typically from virtual/computed fields)
   * @internal Delegates to root node for child nodes.
   */
  __adjustEnhancer__(pointer, value) {
    if (this.isRoot) (0, import_pointer4.setValue)(this.__enhancer__, pointer, value);
    else this.rootNode.__adjustEnhancer__(pointer, value);
  }
  /**
   * All validation errors from the entire form tree.
   * @remarks Merges internal validation errors with externally set errors.
   *          Delegates to root node for child nodes.
   */
  get globalErrors() {
    if (this.isRoot) return this.__errorManager__.mergedGlobalErrors;
    else return this.rootNode.__errorManager__.mergedGlobalErrors;
  }
  /**
   * Validation errors specific to this node.
   * @remarks Merges local errors with externally set errors for this node.
   */
  get errors() {
    return this.__errorManager__.mergedLocalErrors;
  }
  /**
   * Sets global errors from validation results.
   * @param errors - Array of validation errors
   * @returns `true` if unchanged (no publish needed), `false` if changed
   * @internal Publishes `UpdateGlobalError` event when errors change.
   */
  __setGlobalErrors__(errors) {
    if (this.__errorManager__.setGlobalErrors(errors)) return true;
    this.publish(
      NodeEventType.UpdateGlobalError,
      this.__errorManager__.mergedGlobalErrors
    );
    return false;
  }
  /**
   * Sets validation errors for this node.
   * @param errors - Array of validation errors to set
   * @remarks Publishes `UpdateError` event when errors change.
   */
  setErrors(errors) {
    if (this.__errorManager__.setLocalErrors(errors)) return;
    this.publish(
      NodeEventType.UpdateError,
      this.__errorManager__.mergedLocalErrors
    );
  }
  /**
   * Clears validation errors for this node.
   * @remarks Does not clear externally set errors. Use `clearExternalErrors()` for those.
   */
  clearErrors() {
    this.setErrors([]);
  }
  /**
   * Sets external validation errors (e.g., from server-side validation).
   * @param errors - Array of external errors to set (default: empty array)
   * @remarks For root nodes, also updates `globalErrors`.
   *          Publishes `UpdateError` and optionally `UpdateGlobalError` events.
   */
  setExternalErrors(errors = []) {
    if (this.__errorManager__.setExternalErrors(errors, this.isRoot)) return;
    this.publish(
      NodeEventType.UpdateError,
      this.__errorManager__.mergedLocalErrors
    );
    if (this.isRoot)
      this.publish(
        NodeEventType.UpdateGlobalError,
        this.__errorManager__.mergedGlobalErrors
      );
  }
  /**
   * Clears external validation errors for this node.
   * @remarks Does not clear local or internal validation errors.
   */
  clearExternalErrors() {
    if (this.__errorManager__.externalErrors.length === 0) return;
    if (this.isRoot === false)
      this.rootNode.__removeExternalErrors__(
        this.__errorManager__.externalErrors
      );
    this.setExternalErrors([]);
  }
  /**
   * Removes specific errors from external errors.
   * @param errors - Errors to filter out
   * @internal Used when child nodes clear their external errors.
   */
  __removeExternalErrors__(errors) {
    const filteredErrors = this.__errorManager__.filterExternalErrors(errors);
    if (filteredErrors !== null) this.setExternalErrors(filteredErrors);
  }
  /**
   * Saves an unsubscribe function for cleanup during node destruction.
   * @param unsubscribe - Function to call when cleaning up subscriptions
   * @internal Used by computed property dependency subscriptions.
   */
  saveUnsubscribe(unsubscribe) {
    this.__eventManager__.saveUnsubscribe(unsubscribe);
  }
  /**
   * Cleans up event subscriptions and listeners.
   * @param actor - The node requesting cleanup (must be parent or self if root)
   * @internal Called during node destruction or reinitialization.
   */
  __cleanUp__(actor) {
    if (!this.isRoot && actor !== this.parentNode) return;
    this.__eventManager__.cleanUp();
  }
  /**
   * Publishes an event to all subscribed listeners.
   * @param type - Event type from `NodeEventType` enum
   * @param payload - Event-specific data
   * @param options - Event-specific options
   * @param immediate - If `true`, dispatch synchronously; otherwise batch via microtask
   */
  publish(type, payload, options, immediate) {
    if (immediate) this.__eventManager__.dispatch(type, payload, options);
    else this.__eventManager__.publish(type, payload, options);
  }
  /**
   * Subscribes to node events.
   * @param listener - Callback function receiving event data
   * @returns Unsubscribe function to remove the listener
   * @example
   * ```ts
   * const unsubscribe = node.subscribe(({ type, payload }) => {
   *   if (type & NodeEventType.UpdateValue) {
   *     console.log('Value changed:', payload);
   *   }
   * });
   * // Later: unsubscribe();
   * ```
   */
  subscribe(listener) {
    return this.__eventManager__.subscribe(listener);
  }
  /**
   * Monotonic revision of events this node has delivered, filtered by mask.
   * @param mask - Bitmask of `NodeEventType`s to count (defaults to all events)
   * @returns Number that strictly increases whenever a matching event batch
   *          is delivered to this node's listeners
   * @remarks Deliveries are counted even while no listener is attached. A
   *          subscriber that attaches late (e.g. a React commit detached from
   *          its render phase under concurrent rendering) can therefore
   *          compare a previously captured revision against the current one
   *          to detect notifications it missed and re-read the node state.
   * @example
   * ```ts
   * const seen = node.revision(NodeEventType.UpdateChildren);
   * const unsubscribe = node.subscribe(listener);
   * // catch up on anything delivered before the subscription attached
   * if (node.revision(NodeEventType.UpdateChildren) !== seen) resync();
   * ```
   */
  revision(mask = BIT_MASK_ALL) {
    return this.__eventManager__.revision(mask);
  }
  /**
   * @internal Accessor for injection guard manager from any node.
   * @remarks Root nodes return their own instance; child nodes delegate to root.
   */
  get __injectionGuard__() {
    if (this.isRoot) return this.__injectionGuardManager__;
    return this.rootNode.__injectionGuardManager__;
  }
  /**
   * Sets up the `injectTo` schema property handler.
   * @internal Subscribes to value updates and propagates values to target nodes.
   *           Implements circular injection prevention using guard flags.
   * @remarks An injection inherits the provenance of the update that triggered it: one caused only by values the form produced itself (a default, a derived value) is written as `Automatic`, so it cannot turn a `null` ancestor of the target into an object.
   */
  __prepareInjectHandler__() {
    if (this.__initialized__) return;
    const injectHandler = this.jsonSchema.injectTo;
    if (typeof injectHandler !== "function") return;
    this.subscribe(({ type, options }) => {
      if (type & NodeEventType.UpdateValue) {
        if (options?.[NodeEventType.UpdateValue]?.inject)
          this.publish(NodeEventType.RequestInjection);
        return;
      }
      if (type & NodeEventType.RequestInjection) {
        const injectionGuard = this.__injectionGuard__;
        if (injectionGuard == null) return;
        const automatic = !this.__intendedWrite__;
        this.__intendedWrite__ = false;
        const value = this.value;
        const dataPath = this.path;
        const context = {
          dataPath,
          schemaPath: this.schemaPath,
          jsonSchema: this.jsonSchema,
          parentValue: this.parentNode?.value || null,
          parentJSONSchema: this.parentNode?.jsonSchema || null,
          rootValue: this.rootNode.value,
          rootJSONSchema: this.rootNode.jsonSchema,
          context: this.context
        };
        try {
          injectionGuard.add(dataPath);
          const affect = injectHandler(value, context);
          if (affect == null) return;
          const operations = (0, import_filter23.isArray)(affect) ? affect : Object.entries(affect);
          for (let i = 0, l = operations.length; i < l; i++) {
            const path = getAbsolutePath(dataPath, operations[i][0]);
            if (injectionGuard.has(path)) continue;
            injectionGuard.add(path);
            this.find(path)?.setValue(
              operations[i][1],
              automatic ? SetValueOption.Overwrite | SetValueOption.Automatic : SetValueOption.Overwrite
            );
          }
        } catch (error) {
          const errorContext = { ...context, value, error };
          throw new JSONSchemaError(
            "INJECT_TO",
            formatInjectToError(errorContext),
            errorContext
          );
        } finally {
          injectionGuard.scheduleClearInjectedPaths();
        }
      }
    });
  }
  /**
   * Whether the node has completed initialization.
   * @remarks Initialization sets up dependency subscriptions and `injectTo` handlers.
   */
  get initialized() {
    return this.__initialized__;
  }
  /**
   * Initializes the node's reactive features.
   * @param actor - Node requesting initialization (must be parent or self if root)
   * @returns `true` if initialization occurred, `false` if skipped
   * @internal Sets up dependency subscriptions, `injectTo` handlers, and publishes `Initialized` event.
   */
  __initialize__(actor) {
    if (this.__initialized__ || !this.isRoot && actor !== this.parentNode)
      return false;
    this.__prepareUpdateDependencies__();
    this.__prepareInjectHandler__();
    this.publish(NodeEventType.Initialized);
    this.__initialized__ = true;
    return true;
  }
  /**
   * Resets the node to its initial or derived value.
   * @param options - Reset configuration
   * @param options.updateScoped - Update scoped state for `oneOf`/`anyOf` branches
   * @param options.isolate - Force composition processing while resetting
   * @param options.preferLatest - Prefer current value over default
   * @param options.checkDefaultValueFirst - Check default value before current value
   * @param options.inputValue - Explicit value with highest priority
   * @param options.fallbackValue - Fallback when no other value available
   * @param options.applyDerivedValue - Apply computed derived value if available
   * @internal Value priority: `inputValue` > `derivedValue` > `fallbackValue`/`defaultValue`
   */
  __reset__(options = {}) {
    if (options.updateScoped) this.__updateScoped__();
    let value;
    if ("inputValue" in options) value = options.inputValue;
    else if (options.preferLatest) {
      if (options.checkDefaultValueFirst && this.__isDefinedRestoreValue__)
        value = this.__restoreValue__;
      else
        value = options.fallbackValue !== void 0 ? options.fallbackValue : this.value !== void 0 ? this.value : this.__restoreValue__;
    } else value = this.__restoreValue__;
    if (options.applyDerivedValue && this.active && this.__computeManager__.isDerivedDefined)
      value = this.__computeManager__.getDerivedValue() ?? value;
    this.setValue(
      this.__computeManager__.active ? value : void 0,
      options.isolate ? SetValueOption.IsolateStableReset : SetValueOption.StableReset
    );
    this.setState();
  }
  /**
   * Whether any ancestor currently holds `null`.
   * @internal A branch node that absorbs an outside write as "no change" still forwards it when this is `true` — the null ancestor has to learn that a value was written into it.
   */
  get __hasNullAncestor__() {
    for (let node = this.parentNode; node; node = node.parentNode)
      if (node.value === null) return true;
    return false;
  }
  /**
   * Hands a write that changed nothing on to the parent, when an ancestor holds `null`.
   * @param value - The value this node holds, which the write repeated
   * @param option - Options of the absorbed write; an `Automatic` one is not forwarded
   * @internal The write carried a value, so a `null` ancestor has to learn of it; without such an ancestor nothing is reported.
   */
  __forwardUnchangedWrite__(value, option) {
    if (option & SetValueOption.Automatic || !this.__hasNullAncestor__) return;
    this.onChange(value, (option & SetValueOption.Batch) > 0, false);
  }
  /**
   * Returns the node to what a form without a default value builds for it.
   * @param input - Value the parent's schema default assigns to this node; the node's own schema default when `undefined`
   * @internal A parent that became `null` calls this on its children, so the blank form it shows does not depend on how it became `null`.
   *           The blank value also becomes the node's restore value, which is what a later branch restore returns the node to.
   */
  __resetToBlank__(input) {
    const blank = input !== void 0 ? input : getDefaultValue(this.jsonSchema);
    this.__setDefaultValue__(blank);
    this.__reset__({ inputValue: blank, applyDerivedValue: true });
  }
  /**
   * Resets this node and all descendants to their initial values.
   * @remarks Clears all state flags in the subtree and returns every restore value in it to the initial one before resetting values.
   */
  resetSubtree() {
    this.clearSubtreeState();
    depthFirstSearch(
      this,
      (node) => node.__setDefaultValue__(node.defaultValue)
    );
    this.__reset__();
  }
};

// packages/canard/schema-form/src/__legacy__/core/nodes/ArrayNode/strategies/BranchStrategy/BranchStrategy.ts
var import_filter27 = require("@winglet/common-utils/filter");

// packages/canard/schema-form/src/__legacy__/core/nodes/ArrayNode/utils/omitEmptyArray/omitEmptyArray.ts
var import_filter24 = require("@winglet/common-utils/filter");
var omitEmptyArray = (value) => (0, import_filter24.isEmptyArray)(value) ? void 0 : value;

// packages/canard/schema-form/src/__legacy__/core/nodes/ArrayNode/utils/omitTrailingArray/omitTrailingArray.ts
var import_filter25 = require("@winglet/common-utils/filter");
var omitTrailingArray = (value) => {
  if (!(0, import_filter25.isArray)(value)) return value;
  let length = value.length;
  while (length > 0 && value[length - 1] === void 0) length--;
  return length === value.length ? value : value.slice(0, length);
};

// packages/canard/schema-form/src/__legacy__/core/nodes/ArrayNode/utils/resolveArrayLimits/resolveArrayLimits.ts
var import_filter26 = require("@winglet/common-utils/filter");
var import_math4 = require("@winglet/common-utils/math");
var resolveArrayLimits = (jsonSchema) => {
  const minItems = jsonSchema.minItems ?? 0;
  const explicitMax = jsonSchema.maxItems ?? Infinity;
  const tupleLimit = !jsonSchema.items && (0, import_filter26.isArray)(jsonSchema.prefixItems) ? jsonSchema.prefixItems.length : Infinity;
  return {
    min: minItems,
    max: (0, import_math4.minLite)(explicitMax, tupleLimit)
  };
};

// packages/canard/schema-form/src/__legacy__/core/nodes/ArrayNode/utils/resolveArrayValueFilter/resolveArrayValueFilter.ts
var resolveArrayValueFilter = (options) => {
  const omitTrailing = options?.omitTrailing === true;
  const omitEmpty = options?.omitEmpty !== false;
  if (omitTrailing && omitEmpty)
    return (value) => omitEmptyArray(omitTrailingArray(value));
  if (omitTrailing) return omitTrailingArray;
  if (omitEmpty) return omitEmptyArray;
  return (value) => value;
};

// packages/canard/schema-form/src/__legacy__/core/nodes/ArrayNode/strategies/BranchStrategy/utils/getChildSchema/getChildSchema.ts
var getChildSchema = (schema, index) => {
  const itemSchema = schema.items || null;
  const prefixItemSchemas = schema.prefixItems;
  if (prefixItemSchemas === void 0) return itemSchema;
  if (prefixItemSchemas.length > index) return prefixItemSchemas[index] || null;
  return itemSchema;
};

// packages/canard/schema-form/src/__legacy__/core/nodes/ArrayNode/strategies/BranchStrategy/utils/promiseAfterMicrotask/promiseAfterMicrotask.ts
var import_scheduler4 = require("@winglet/common-utils/scheduler");
var promiseAfterMicrotask = (value) => new Promise((resolve) => (0, import_scheduler4.scheduleMacrotask)(() => resolve(value)));

// packages/canard/schema-form/src/__legacy__/core/nodes/ArrayNode/strategies/BranchStrategy/utils/sharedResolvedPromises/sharedResolvedPromises.ts
var RESOLVED_LENGTH = Promise.resolve(0);
var RESOLVED_VOID = Promise.resolve();

// packages/canard/schema-form/src/__legacy__/core/nodes/ArrayNode/strategies/BranchStrategy/BranchStrategy.ts
var BranchStrategy = class {
  /**
   * Initializes the BranchStrategy object.
   * @param host - Host ArrayNode object
   * @param handleChange - Value change handler
   * @param handleRefresh - Refresh handler
   * @param handleSetDefaultValue - Default value setting handler
   * @param nodeFactory - Node creation factory
   */
  constructor(host, hasDefault, handleChange, nodeFactory) {
    /** Flag indicating whether the strategy is locked to prevent recursive updates */
    this.__locked__ = true;
    /** Flag indicating whether the strategy is already processing a batch */
    this.__batched__ = false;
    /** Whether an item write from outside the form's own machinery is waiting for the next commit */
    this.__intended__ = false;
    /** Flag indicating whether the array value is not changed */
    this.__idle__ = false;
    /** Flag indicating whether the array value is nullish */
    this.__nullish__ = false;
    /** Flag indicating whether the array edges are expired */
    this.__expired__ = true;
    /** Revision counter for generating unique keys for array elements */
    this.__revision__ = 0;
    /** Array of unique keys for each element in the array, maintaining order */
    this.__keys__ = [];
    /** Map storing each element's raw state (`data`), its outgoing filtered contribution (`output`), and the schema node */
    this.__sourceMap__ = /* @__PURE__ */ new Map();
    /** Current value of the array node */
    this.__value__ = [];
    /** Cached normalized composition; rebuilt lazily while `__normalizedExpired__` is set */
    this.__normalized__ = [];
    /** Flag indicating whether the cached normalized composition is stale */
    this.__normalizedExpired__ = true;
    /** Array of child nodes */
    this.__children__ = [];
    this.__host__ = host;
    this.__handleChange__ = handleChange;
    this.__nodeFactory__ = nodeFactory;
    const limit = resolveArrayLimits(host.jsonSchema);
    this.__minItems__ = limit.min;
    this.__maxItems__ = limit.max;
    if (host.defaultValue === null) this.__nullish__ = null;
    if (hasDefault) {
      const defaultValue = host.defaultValue;
      if (defaultValue != null && defaultValue.length > 0)
        for (const value of defaultValue) this.push(value, true);
    } else while (this.length < this.__minItems__) this.push(void 0, true);
    host.subscribe(({ type, payload, options }) => {
      if (type & NodeEventType.RequestEmitChange) {
        this.__handleEmitChange__(
          payload?.[NodeEventType.RequestEmitChange],
          options?.[NodeEventType.RequestEmitChange]
        );
        this.__batched__ = false;
      }
    });
    this.__locked__ = false;
    this.__emitChange__(SetValueOption.Default, false);
    host.__setDefaultValue__(this.value);
    this.__publishUpdateChildren__();
  }
  /** Expire the array node's value and edges */
  __expire__() {
    this.__idle__ = false;
    this.__nullish__ = false;
    this.__expired__ = true;
    this.__normalizedExpired__ = true;
  }
  /**
   * Gets information about child nodes.
   * @returns Array containing key and node information
   * @private
   */
  get __edges__() {
    const edges = new Array(this.__keys__.length);
    for (let i = 0, l = this.__keys__.length; i < l; i++) {
      const key = this.__keys__[i];
      edges[i] = { nonce: key, node: this.__sourceMap__.get(key).node };
    }
    return edges;
  }
  /**
   * Converts internal array state to an object array.
   * @returns Array containing the raw values of the array
   * @private
   */
  __toArray__() {
    const values = new Array(this.__keys__.length);
    for (let i = 0, l = this.__keys__.length; i < l; i++) {
      const edge = this.__sourceMap__.get(this.__keys__[i]);
      if (edge) values[i] = edge.data;
    }
    return values;
  }
  /**
   * Composes the outgoing view of the array from each element's `output` slot.
   * @returns Array whose items carry the children's filtered contributions
   * @private
   */
  __toNormalized__() {
    const values = new Array(this.__keys__.length);
    for (let i = 0, l = this.__keys__.length; i < l; i++) {
      const edge = this.__sourceMap__.get(this.__keys__[i]);
      if (edge) values[i] = edge.output;
    }
    return values;
  }
  /**
   * Determines whether to queue or immediately process value changes.
   *
   * In batch mode: Publishes RequestEmitChange event for deferred processing
   * In sync mode: Immediately calls handleEmitChange for instant updates
   *
   * @param option - Change options (optional)
   * @private
   */
  __emitChange__(option = SetValueOption.BatchDefault, batched = true, updateChildren = true) {
    if (this.__locked__) return;
    if (batched) {
      if (this.__batched__) return;
      this.__batched__ = true;
      this.__host__.publish(
        NodeEventType.RequestEmitChange,
        option,
        updateChildren
      );
    } else this.__handleEmitChange__(option, updateChildren);
  }
  /**
   * Emits a value change event.
   * @param option - Option settings (default: SetValueOption.Default)
   * @private
   */
  __handleEmitChange__(option = SetValueOption.Default, updateChildren = false) {
    if (this.__locked__ || this.__idle__) return;
    const host = this.__host__;
    const settled = (option & SetValueOption.Isolate) === 0;
    const inject = (option & SetValueOption.PreventInjection) === 0;
    const automatic = (option & SetValueOption.Automatic) > 0 && !this.__intended__;
    this.__intended__ = false;
    if (!automatic) host.__markIntendedWrite__();
    const previous = [...this.__value__];
    this.__value__ = this.__toArray__();
    const current = this.value;
    if (option & SetValueOption.EmitChange)
      this.__handleChange__(
        this.normalizedValue,
        (option & SetValueOption.Batch) > 0,
        automatic
      );
    if (option & SetValueOption.Refresh)
      host.publish(NodeEventType.RequestRefresh);
    if (option & SetValueOption.PublishUpdateEvent)
      host.publish(
        NodeEventType.UpdateValue,
        current,
        { previous, current, inject },
        settled && host.initialized
      );
    this.__idle__ = true;
    if (updateChildren) this.__publishUpdateChildren__();
  }
  /**
   * Creates a function to handle value changes for a specific element.
   * @param key - Child node Key
   * @returns {HandleChange} Value change handler
   * @private
   */
  __handleChangeFactory__(key) {
    return (input, batched, automatic) => {
      const source = this.__sourceMap__.get(key);
      if (!source) return;
      const next = source.node.value;
      if (source.data === next && source.output === input) {
        if (!automatic && !this.__locked__ && this.__host__.__hasNullAncestor__)
          this.__handleChange__(this.normalizedValue, batched, false);
        return;
      }
      source.data = next;
      source.output = input;
      this.__idle__ = false;
      this.__nullish__ = false;
      this.__normalizedExpired__ = true;
      if (!automatic && !this.__locked__) this.__intended__ = true;
      this.__emitChange__(
        automatic ? SetValueOption.Default | SetValueOption.Automatic : SetValueOption.Default,
        batched,
        false
      );
    };
  }
  /**
   * Updates the names of array elements.
   * @private
   */
  __updateChildName__() {
    for (let i = 0, l = this.__keys__.length; i < l; i++) {
      const key = this.__keys__[i];
      if (this.__sourceMap__.has(key)) {
        const node = this.__sourceMap__.get(key).node;
        const name = "" + i;
        if (node.name !== name) node.__setName__(name, this.__host__);
      }
    }
  }
  /**
   * Publishes a child node update event.
   * @private
   */
  __publishUpdateChildren__() {
    if (this.__locked__) return;
    this.__host__.publish(NodeEventType.UpdateChildren);
  }
  /**
   * Gets the current value of the array.
   * @returns Current value of the array node or undefined (if empty) or null (if nullable)
   */
  get value() {
    if (this.__nullish__ == null) return this.__nullish__;
    else return this.__value__;
  }
  /**
   * Gets the normalized composition of the array.
   * @returns Array of the children's normalized values, or null/undefined mirroring `value`
   * @remarks Cached between structural/output changes so hot readers (upward emission, `__propagate__` echo guard) get a stable reference without re-allocating.
   */
  get normalizedValue() {
    if (this.__nullish__ == null) return this.__nullish__;
    if (this.__normalizedExpired__) {
      this.__normalized__ = this.__toNormalized__();
      this.__normalizedExpired__ = false;
    }
    return this.__normalized__;
  }
  /**
   * Gets the child nodes of the array node.
   * @returns List of child nodes
   */
  get children() {
    if (this.__expired__) {
      this.__children__ = this.__edges__;
      this.__expired__ = false;
    }
    return this.__children__;
  }
  /**
   * Gets the current length of the array.
   * @returns Length of the array
   */
  get length() {
    return this.__keys__.length;
  }
  /** Minimum number of items required in the array (from JSON Schema minItems) */
  get minItems() {
    return this.__minItems__;
  }
  /** Maximum number of items allowed in the array (from JSON Schema maxItems) */
  get maxItems() {
    return this.__maxItems__;
  }
  /**
   * Applies input value to the array node.
   * @param input - Array value to set
   * @param option - Setting options
   * @remarks A `Reset`-flagged `undefined` application re-establishes the construction-time
   *          `minItems` fill, so empty item nodes survive branch restores and form resets;
   *          a plain `setValue(undefined)` still clears every item.
   */
  applyValue(input, option) {
    if (input == null) {
      const restore = input === void 0 && this.__minItems__ > 0 && (option & SetValueOption.Reset) === SetValueOption.Reset;
      this.__locked__ = true;
      this.clear(option);
      if (restore)
        while (this.length < this.__minItems__) this.push(void 0, true, option);
      this.__locked__ = false;
      this.__nullish__ = restore ? false : input === null ? this.__host__.nullable ? input : false : void 0;
      this.__emitChange__(option, false);
    } else if ((0, import_filter27.isArray)(input)) {
      this.__locked__ = true;
      this.clear(option);
      for (const value of input) this.push(value, true, option);
      this.__locked__ = false;
      this.__emitChange__(option, false);
    }
  }
  /**
   * Propagates activation to all child nodes.
   * @internal Internal implementation method. Do not call directly.
   */
  initialize() {
    for (let i = 0, l = this.__keys__.length; i < l; i++)
      this.__sourceMap__.get(this.__keys__[i])?.node?.__initialize__(this.__host__);
  }
  /**
   * Adds a new element to the array.
   * @param data - Value to add (optional)
   * @returns Returns itself (this) for method chaining
   */
  push(data, unlimited, option) {
    const host = this.__host__;
    const wants = !this.__locked__;
    if (unlimited !== true && this.__maxItems__ <= this.length)
      return wants ? promiseAfterMicrotask(this.length) : RESOLVED_LENGTH;
    const index = this.__keys__.length;
    const childSchema = getChildSchema(host.jsonSchema, index);
    if (childSchema === null)
      return wants ? promiseAfterMicrotask(this.length) : RESOLVED_LENGTH;
    const key = "#" + this.__revision__++;
    this.__keys__.push(key);
    const defaultValue = data !== void 0 ? data : childSchema?.default;
    const childNode = this.__nodeFactory__({
      name: "" + index,
      scope: "items",
      jsonSchema: childSchema,
      parentNode: host,
      defaultValue,
      onChange: this.__handleChangeFactory__(key),
      nodeFactory: this.__nodeFactory__
    });
    this.__sourceMap__.set(key, {
      node: childNode,
      data: childNode.value,
      output: childNode.normalizedValue
    });
    if (host.initialized) childNode.__initialize__(host);
    this.__expire__();
    this.__emitChange__(option);
    return wants ? promiseAfterMicrotask(this.length) : RESOLVED_LENGTH;
  }
  /**
   * Updates the value of a specific element.
   * @param index - Index of the element to update
   * @param data - New value
   * @returns Returns itself (this) for method chaining
   */
  update(index, data, option) {
    const node = this.__sourceMap__.get(this.__keys__[index])?.node;
    if (!node) return promiseAfterMicrotask(void 0);
    node.setValue(data, option);
    return promiseAfterMicrotask(node.value);
  }
  /**
   * Removes a specific element.
   * @param index - Index of the element to remove
   * @returns Returns itself (this) for method chaining
   */
  remove(index, option) {
    const targetId = this.__keys__[index];
    const removed = this.__sourceMap__.get(targetId);
    if (!removed) return promiseAfterMicrotask(void 0);
    this.__keys__ = this.__keys__.filter((key) => key !== targetId);
    this.__sourceMap__.delete(targetId);
    this.__updateChildName__();
    this.__expire__();
    this.__emitChange__(option);
    return promiseAfterMicrotask(removed.data);
  }
  /** Removes the last element from the array. */
  pop() {
    if (this.length === 0) return promiseAfterMicrotask(void 0);
    return this.remove(this.length - 1);
  }
  /**
   * Clears all elements to initialize the array.
   * @remarks A `null` array has no elements to clear and stays `null` — only a write that carries a value turns it into an array. The locked call is `applyValue` rebuilding the items, which sets the null state itself.
   */
  clear(option) {
    const wants = !this.__locked__;
    if (wants && this.__nullish__ === null) return promiseAfterMicrotask(void 0);
    for (let i = 0, l = this.__keys__.length; i < l; i++)
      this.__sourceMap__.get(this.__keys__[i])?.node?.__cleanUp__(this.__host__);
    this.__keys__ = [];
    this.__sourceMap__.clear();
    this.__expire__();
    this.__emitChange__(option);
    return wants ? promiseAfterMicrotask(void 0) : RESOLVED_VOID;
  }
};

// packages/canard/schema-form/src/__legacy__/core/nodes/ArrayNode/strategies/TerminalStrategy/TerminalStrategy.ts
var import_array5 = require("@winglet/common-utils/array");
var import_filter30 = require("@winglet/common-utils/filter");
var import_filter31 = require("@winglet/json-schema/filter");

// packages/canard/schema-form/src/__legacy__/core/parsers/parseArray.ts
var import_filter28 = require("@winglet/common-utils/filter");
var parseArray = (value) => {
  return (0, import_filter28.isArray)(value) ? value : [];
};

// packages/canard/schema-form/src/__legacy__/core/parsers/parseBoolean.ts
var parseBoolean = (value) => {
  if (typeof value === "string") {
    const normalizedValue = value.trim().toLowerCase();
    if (normalizedValue === "true") return true;
    if (normalizedValue === "false") return false;
  }
  return !!value;
};

// packages/canard/schema-form/src/__legacy__/core/parsers/parseNumber.ts
var parseNumber = (value, isInteger = false) => {
  if (typeof value === "number")
    return isNaN(value) ? NaN : isInteger ? Math.trunc(value) : value;
  if (typeof value === "string") {
    const parsedValue = parseFloat(value.replace(NON_NUMERIC_CHARS, ""));
    if (isNaN(parsedValue)) return NaN;
    return isInteger ? Math.trunc(parsedValue) : parsedValue;
  }
  return NaN;
};
var NON_NUMERIC_CHARS = /[^\d.-]/g;

// packages/canard/schema-form/src/__legacy__/core/parsers/parseObject.ts
var import_filter29 = require("@winglet/common-utils/filter");
var parseObject = (value) => {
  return (0, import_filter29.isPlainObject)(value) ? value : {};
};

// packages/canard/schema-form/src/__legacy__/core/parsers/parseString.ts
var parseString = (value) => {
  if (typeof value === "string") return value;
  if (typeof value === "number") return "" + value;
  return "";
};

// packages/canard/schema-form/src/__legacy__/core/nodes/ArrayNode/strategies/TerminalStrategy/TerminalStrategy.ts
var FIRST_EMIT_CHANGE_OPTION = SetValueOption.Replace | SetValueOption.Default;
var TerminalStrategy = class {
  /**
   * Initializes the TerminalStrategy object.
   * @param host - Host ArrayNode object
   * @param handleChange - Value change handler
   * @param handleRefresh - Refresh handler
   * @param handleSetDefaultValue - Default value setting handler
   */
  constructor(host, hasDefault, handleChange) {
    /** Flag indicating whether the strategy is locked to prevent recursive updates */
    this.__locked__ = true;
    /** Current value of the array node, initialized as empty array */
    this.__value__ = [];
    this.__host__ = host;
    this.__handleChange__ = handleChange;
    const jsonSchema = host.jsonSchema;
    const limit = resolveArrayLimits(jsonSchema);
    this.__minItems__ = limit.min;
    this.__maxItems__ = limit.max;
    if (jsonSchema.items)
      this.__defaultItemValue__ = (0, import_filter31.isObjectSchema)(jsonSchema.items) ? getObjectDefaultValue(jsonSchema.items) : jsonSchema.items.default;
    if ((0, import_filter30.isArray)(jsonSchema.prefixItems))
      this.__defaultPrefixItemValues__ = (0, import_array5.map)(
        jsonSchema.prefixItems,
        (schema) => (0, import_filter31.isObjectSchema)(schema) ? getObjectDefaultValue(schema) : schema.default
      );
    if (hasDefault) {
      const defaultValue = host.defaultValue;
      if (defaultValue === null) this.__value__ = this.__parseValue__(null);
      else if (defaultValue != null && defaultValue.length > 0)
        for (const value of defaultValue) this.push(value, true);
    } else while (this.length < this.__minItems__) this.push(void 0, true);
    this.__locked__ = false;
    this.__emitChange__(this.__value__, FIRST_EMIT_CHANGE_OPTION);
    host.__setDefaultValue__(this.__value__);
  }
  /**
   * Gets the default value for a new array item based on its position.
   *
   * Returns the appropriate default value considering `prefixItems`:
   * - If `prefixItems` is defined and the current length is within its range,
   *   returns the default value from the corresponding prefixItems schema
   * - Otherwise, returns the default value from the `items` schema
   *
   * @returns The default value to use when adding a new item at the current position
   */
  get __defaultValue__() {
    const index = this.length;
    if (this.__defaultPrefixItemValues__ !== void 0 && this.__defaultPrefixItemValues__.length > index)
      return this.__defaultPrefixItemValues__[index];
    return this.__defaultItemValue__;
  }
  /**
   * Emits a value change event.
   * @param input - New array value
   * @param option - Option settings (default: SetValueOption.Default)
   * @private
   */
  __emitChange__(input, option = SetValueOption.Default) {
    const host = this.__host__;
    const retain = (option & SetValueOption.Replace) === 0;
    const inject = (option & SetValueOption.PreventInjection) === 0;
    const previous = this.__value__ ? [...this.__value__] : this.__value__;
    const current = this.__parseValue__(input);
    if (retain && host.__equals__(previous, current))
      return host.__forwardUnchangedWrite__(current, option);
    this.__value__ = current;
    if ((option & SetValueOption.Automatic) === 0)
      this.__host__.__markIntendedWrite__();
    if (this.__locked__) return;
    if (option & SetValueOption.EmitChange)
      this.__handleChange__(
        current,
        (option & SetValueOption.Batch) > 0,
        (option & SetValueOption.Automatic) > 0
      );
    if (option & SetValueOption.Refresh)
      host.publish(NodeEventType.RequestRefresh);
    if (option & SetValueOption.PublishUpdateEvent)
      host.publish(
        NodeEventType.UpdateValue,
        current,
        { previous, current, inject },
        host.initialized
      );
  }
  /**
   * Parses input value into appropriate array format.
   * @param input - Value to parse
   * @returns {ArrayValue|null|undefined} Parsed array value or undefined or null
   * @private
   */
  __parseValue__(input) {
    if (input === void 0) return void 0;
    if (input === null && this.__host__.nullable) return null;
    return parseArray(input);
  }
  /**
   * Gets the current value of the array.
   * @returns Current value of the array node or undefined or null
   */
  get value() {
    return this.__value__;
  }
  /**
   * Gets the normalized composition of the array.
   * @returns The value itself — a terminal array has no children to normalize
   */
  get normalizedValue() {
    return this.__value__;
  }
  /**
   * Gets the list of child nodes.
   * @returns Empty array (Terminal strategy does not manage child nodes)
   */
  get children() {
    return null;
  }
  /**
   * Gets the current length of the array.
   * @returns Length of the array (0 if value is undefined or null)
   */
  get length() {
    return this.__value__?.length ?? 0;
  }
  /** Minimum number of items required in the array (from JSON Schema minItems) */
  get minItems() {
    return this.__minItems__;
  }
  /** Maximum number of items allowed in the array (from JSON Schema maxItems) */
  get maxItems() {
    return this.__maxItems__;
  }
  /**
   * Applies input value to the array node.
   * @param input - Array value to set
   * @param option - Setting options
   */
  applyValue(input, option) {
    this.__emitChange__(input, option);
  }
  /**
   * Adds a new element to the array.
   * @param input - Value to add (optional)
   */
  push(input, unlimited, option) {
    if (unlimited !== true && this.__maxItems__ <= this.length)
      return Promise.resolve(this.length);
    const data = input ?? this.__defaultValue__;
    const value = this.__value__ == null ? [data] : [...this.__value__, data];
    this.__emitChange__(value, option);
    return Promise.resolve(this.length);
  }
  /**
   * Updates the value of a specific element.
   * @param index - Index of the element to update
   * @param data - New value
   */
  update(index, data) {
    if (this.__value__ == null) return Promise.resolve(void 0);
    if (index < 0 || index >= this.__value__.length)
      return Promise.resolve(void 0);
    const value = [...this.__value__];
    value[index] = data;
    this.__emitChange__(value);
    return Promise.resolve(value[index]);
  }
  /**
   * Removes a specific element.
   * @param index - Index of the element to remove
   */
  remove(index) {
    if (this.__value__ == null) return Promise.resolve(void 0);
    if (index < 0 || index >= this.__value__.length)
      return Promise.resolve(void 0);
    const removed = this.__value__[index];
    const value = this.__value__.filter((_, i) => i !== index);
    this.__emitChange__(value);
    return Promise.resolve(removed);
  }
  /** Removes the last element from the array. */
  pop() {
    if (this.__value__ == null || this.length === 0)
      return Promise.resolve(void 0);
    return this.remove(this.length - 1);
  }
  /**
   * Clears all elements to initialize the array.
   * @remarks A `null` array has no elements to clear and stays `null` — only a write that carries a value turns it into an array.
   */
  clear() {
    if (this.__value__ === null) return Promise.resolve(void 0);
    this.__emitChange__([]);
    return Promise.resolve(void 0);
  }
};

// packages/canard/schema-form/src/__legacy__/core/nodes/ArrayNode/ArrayNode.ts
var ArrayNode = class extends AbstractNode {
  constructor(properties) {
    super(properties);
    this.type = "array";
    const hasDefault = properties.defaultValue !== void 0 || properties.jsonSchema.default !== void 0;
    this.__omitTrailing__ = this.jsonSchema.options?.omitTrailing === true;
    const filterValue = resolveArrayValueFilter(this.jsonSchema.options);
    const handleChange = (value, batch, automatic) => super.onChange(filterValue(value), batch, automatic);
    this.onChange = handleChange;
    this.__strategy__ = this.group === "terminal" ? new TerminalStrategy(this, hasDefault, handleChange) : new BranchStrategy(
      this,
      hasDefault,
      handleChange,
      properties.nodeFactory
    );
    this.__initialize__();
  }
  /** Active child nodes within the current scope. */
  get children() {
    return this.__strategy__.children;
  }
  /** Current length of the array. */
  get length() {
    return this.__strategy__.length;
  }
  /** Minimum number of items required in the array (from JSON Schema minItems) */
  get minItems() {
    return this.__strategy__.minItems;
  }
  /** Maximum number of items allowed in the array (from JSON Schema maxItems) */
  get maxItems() {
    return this.__strategy__.maxItems;
  }
  /** @internal */
  __equals__(left, right) {
    return (0, import_object9.equals)(left, right);
  }
  /** Current array value or `undefined`. */
  get value() {
    return this.__strategy__.value;
  }
  set value(input) {
    this.setValue(input);
  }
  /** Normalized value: children contribute their own `normalizedValue`, then `options.omitTrailing` trims the tail; `options.omitEmpty` stays on the parent-propagation path, and child nodes and the `value` getter keep the raw array. */
  get normalizedValue() {
    const normalized = this.__strategy__.normalizedValue;
    return this.__omitTrailing__ ? omitTrailingArray(normalized) : normalized;
  }
  applyValue(input, option) {
    this.__strategy__.applyValue(input, option);
  }
  /**
   * @internal Mirrors the constructor: a given value or the schema default wins; otherwise the array is emptied and filled up to `minItems` with item defaults.
   * @remarks The fill carries the `Reset` preset without `Replace`/`Propagate`: `Automatic` keeps a `null` ancestor recording it instead of promoting it, and `PreventInjection` keeps the fill from firing this array's own `injectTo`, which would write into other nodes. A derived value is the final winner, so the fill is skipped whenever `derived` applies.
   * @remarks An inactive node cannot hold `base` — `__reset__` applies `undefined` instead — so `base` is recorded as the restore value directly, and the `minItems` filler that the branch strategy's refill produced is cleared so it cannot outrank that restore value on reactivation.
   */
  __resetToBlank__(input) {
    const base = input !== void 0 ? input : this.jsonSchema.default;
    this.__reset__({
      inputValue: base !== void 0 ? base : [],
      applyDerivedValue: true
    });
    if (base === void 0 && !(this.active && this.__computeManager__.isDerivedDefined))
      while (this.length < this.minItems)
        this.__strategy__.push(
          void 0,
          true,
          SetValueOption.Reset & ~(SetValueOption.Replace | SetValueOption.Propagate)
        );
    this.__setDefaultValue__(
      this.__computeManager__.active || base === void 0 ? this.__blankValue__ : base
    );
    if (!this.__computeManager__.active && base !== void 0 && this.length)
      this.applyValue(
        void 0,
        SetValueOption.BatchDefault | SetValueOption.Automatic
      );
  }
  /**
   * The array as it stands right after a blank reset.
   * @internal A strategy with item nodes reports its value on the next batch, so the items are read directly.
   */
  get __blankValue__() {
    const children = this.children;
    if (children === null || this.value == null) return this.value;
    return children.map((child) => child.node.value);
  }
  /**
   * Adds a new element to the array.
   * @param data - Value to add (optional, uses default if not provided)
   * @param unlimited - If `true`, ignores `maxItems` constraint
   * @returns The length of the array after the push operation
   */
  push(data, unlimited) {
    return this.__strategy__.push(data, unlimited);
  }
  /**
   * Removes the last element from the array.
   * @returns The removed value, or `undefined` if array was empty
   */
  pop() {
    return this.__strategy__.pop();
  }
  /**
   * Updates the value of an element at the specified index.
   * @param index - Index of the element to update
   * @param data - New value
   * @returns The updated value, or `undefined` if index was out of bounds
   */
  update(index, data) {
    return this.__strategy__.update(index, data);
  }
  /**
   * Removes an element at the specified index.
   * @param index - Index of the element to remove
   * @returns The removed value, or `undefined` if index was out of bounds
   */
  remove(index) {
    return this.__strategy__.remove(index);
  }
  /**
   * Clears all elements from the array.
   * @remarks Removes every item whatever `minItems` says — the constraint is left to validation, and a reset restores the fill. A `null` array stays `null`.
   */
  clear() {
    return this.__strategy__.clear();
  }
  /** @internal */
  __initialize__(actor) {
    if (super.__initialize__(actor)) {
      this.__strategy__.initialize?.();
      return true;
    }
    return false;
  }
};

// packages/canard/schema-form/src/__legacy__/core/nodes/ArrayNode/validate.ts
var validateArraySchema = (jsonSchema) => {
  const itemsSchema = jsonSchema.items;
  const prefixItemsSchema = jsonSchema.prefixItems;
  const minItems = jsonSchema.minItems;
  const maxItems = jsonSchema.maxItems;
  const prefixItemsLength = prefixItemsSchema?.length ?? 0;
  if (itemsSchema === false && !prefixItemsSchema)
    throw new JSONSchemaError(
      "UNEXPECTED_ARRAY_SCHEMA",
      formatItemsFalseWithoutPrefixItemsError(jsonSchema),
      {
        jsonSchema,
        items: itemsSchema,
        prefixItems: prefixItemsSchema
      }
    );
  if (itemsSchema === void 0) {
    if (!prefixItemsSchema)
      throw new JSONSchemaError(
        "UNEXPECTED_ARRAY_SCHEMA",
        formatMissingItemsAndPrefixItemsError(jsonSchema),
        {
          jsonSchema,
          items: itemsSchema,
          prefixItems: prefixItemsSchema
        }
      );
    if (maxItems !== void 0 && prefixItemsLength < maxItems)
      throw new JSONSchemaError(
        "UNEXPECTED_ARRAY_SCHEMA",
        formatMaxItemsExceedsPrefixItemsError(
          jsonSchema,
          maxItems,
          prefixItemsLength
        ),
        {
          jsonSchema,
          items: itemsSchema,
          prefixItems: prefixItemsSchema,
          maxItems,
          prefixItemsLength
        }
      );
    if (minItems !== void 0 && prefixItemsLength < minItems)
      throw new JSONSchemaError(
        "UNEXPECTED_ARRAY_SCHEMA",
        formatMinItemsExceedsPrefixItemsError(
          jsonSchema,
          minItems,
          prefixItemsLength
        ),
        {
          jsonSchema,
          items: itemsSchema,
          prefixItems: prefixItemsSchema,
          minItems,
          prefixItemsLength
        }
      );
  }
  return true;
};

// packages/canard/schema-form/src/__legacy__/core/nodes/BooleanNode/BooleanNode.ts
var BooleanNode = class extends AbstractNode {
  constructor(properties) {
    super(properties);
    this.type = "boolean";
    /** @internal Current value of the boolean node. */
    this.__value__ = void 0;
    if (this.defaultValue !== void 0) this.__emitChange__(this.defaultValue);
    this.__initialize__();
  }
  /**
   * @internal Parses the input value as a boolean.
   * @param input - The value to parse
   */
  __parseValue__(input) {
    if (input === void 0) return void 0;
    if (input === null && this.nullable) return null;
    return parseBoolean(input);
  }
  /**
   * @internal Reflects value changes and publishes related events.
   * @param input - The value to set
   * @param option - Set value options
   */
  __emitChange__(input, option = SetValueOption.Default) {
    const retain = (option & SetValueOption.Replace) === 0;
    const inject = (option & SetValueOption.PreventInjection) === 0;
    const previous = this.__value__;
    const current = this.__parseValue__(input);
    if (retain && this.__equals__(previous, current))
      return this.__forwardUnchangedWrite__(current, option);
    this.__value__ = current;
    if ((option & SetValueOption.Automatic) === 0) this.__markIntendedWrite__();
    if (option & SetValueOption.EmitChange)
      this.onChange(
        current,
        (option & SetValueOption.Batch) > 0,
        (option & SetValueOption.Automatic) > 0
      );
    if (option & SetValueOption.Refresh)
      this.publish(NodeEventType.RequestRefresh);
    if (option & SetValueOption.PublishUpdateEvent)
      this.publish(
        NodeEventType.UpdateValue,
        current,
        { previous, current, inject },
        this.initialized
      );
  }
  applyValue(input, option) {
    this.__emitChange__(input, option);
  }
  /** Current boolean value or `undefined`. */
  get value() {
    return this.__value__;
  }
  set value(input) {
    this.setValue(input);
  }
};

// packages/canard/schema-form/src/__legacy__/core/nodes/NullNode/NullNode.ts
var NullNode = class extends AbstractNode {
  constructor(properties) {
    super(properties);
    this.type = "null";
    if (this.defaultValue !== void 0) this.__emitChange__(this.defaultValue);
    this.__initialize__();
  }
  /**
   * @internal Reflects value changes and publishes related events.
   * @param input - The value to set
   * @param option - Set value options
   */
  __emitChange__(input, option = SetValueOption.Default) {
    const retain = (option & SetValueOption.Replace) === 0;
    const inject = (option & SetValueOption.PreventInjection) === 0;
    const previous = this.__value__;
    const current = this.__parseValue__(input);
    if (retain && this.__equals__(previous, current))
      return this.__forwardUnchangedWrite__(current, option);
    this.__value__ = current;
    if ((option & SetValueOption.Automatic) === 0) this.__markIntendedWrite__();
    if (option & SetValueOption.EmitChange)
      this.onChange(
        current,
        (option & SetValueOption.Batch) > 0,
        (option & SetValueOption.Automatic) > 0
      );
    if (option & SetValueOption.Refresh)
      this.publish(NodeEventType.RequestRefresh);
    if (option & SetValueOption.PublishUpdateEvent)
      this.publish(
        NodeEventType.UpdateValue,
        current,
        { previous, current, inject },
        this.initialized
      );
  }
  /**
   * @internal Parses the input value.
   * @param input - The value to parse
   */
  __parseValue__(input) {
    if (input === void 0) return void 0;
    return input;
  }
  applyValue(input, option) {
    this.__emitChange__(input, option);
  }
  /** Current value (`null` or `undefined`). */
  get value() {
    return this.__value__;
  }
  set value(input) {
    this.setValue(input);
  }
};

// packages/canard/schema-form/src/__legacy__/core/nodes/NumberNode/NumberNode.ts
var import_math5 = require("@winglet/common-utils/math");
var NumberNode = class extends AbstractNode {
  constructor(properties) {
    super(properties);
    this.type = "number";
    /** @internal Current value of the number node. */
    this.__value__ = void 0;
    this.onChange = this.jsonSchema.options?.omitEmpty !== false ? this.__onChangeWithOmitEmpty__ : super.onChange;
    if (this.defaultValue !== void 0) this.__emitChange__(this.defaultValue);
    this.__initialize__();
  }
  /** @internal */
  __equals__(left, right, fullPrecision) {
    if (fullPrecision) return left === right;
    if (left == null || right == null) return left === right;
    return (0, import_math5.isClose)(left, right);
  }
  applyValue(input, option) {
    this.__emitChange__(input, option);
  }
  /** Current number value or `undefined`. */
  get value() {
    return this.__value__;
  }
  set value(input) {
    this.setValue(input);
  }
  /**
   * @internal Reflects value changes and publishes related events.
   * @param input - The value to set
   * @param option - Set value options
   */
  __emitChange__(input, option = SetValueOption.Default) {
    const retain = (option & SetValueOption.Replace) === 0;
    const inject = (option & SetValueOption.PreventInjection) === 0;
    const previous = this.__value__;
    const current = this.__parseValue__(input);
    if (retain && this.__equals__(previous, current, true))
      return this.__forwardUnchangedWrite__(current, option);
    this.__value__ = current;
    if ((option & SetValueOption.Automatic) === 0) this.__markIntendedWrite__();
    if (option & SetValueOption.EmitChange)
      this.onChange(
        current,
        (option & SetValueOption.Batch) > 0,
        (option & SetValueOption.Automatic) > 0
      );
    if (option & SetValueOption.Refresh)
      this.publish(NodeEventType.RequestRefresh);
    if (option & SetValueOption.PublishUpdateEvent)
      this.publish(
        NodeEventType.UpdateValue,
        current,
        { previous, current, inject },
        this.initialized
      );
  }
  /**
   * @internal Parses the input value as a number.
   * @param input - The value to parse
   */
  __parseValue__(input) {
    if (input === void 0) return void 0;
    if (input === null && this.nullable) return null;
    return parseNumber(input, this.schemaType === "integer");
  }
  /**
   * @internal Reflects value changes excluding empty values.
   * @param input - The value to set
   * @param batch - Whether the change should be batched
   * @param automatic - Whether the form produced this value by itself
   */
  __onChangeWithOmitEmpty__(input, batch, automatic) {
    if (input === null) super.onChange(null, batch, automatic);
    else if (input === void 0 || isNaN(input))
      super.onChange(void 0, batch, automatic);
    else super.onChange(input, batch, automatic);
  }
};

// packages/canard/schema-form/src/__legacy__/core/nodes/ObjectNode/ObjectNode.ts
var import_object14 = require("@winglet/common-utils/object");

// packages/canard/schema-form/src/__legacy__/core/nodes/ObjectNode/strategies/BranchStrategy/BranchStrategy.ts
var import_array7 = require("@winglet/common-utils/array");
var import_filter40 = require("@winglet/common-utils/filter");
var import_object12 = require("@winglet/common-utils/object");

// packages/canard/schema-form/src/__legacy__/core/nodes/ObjectNode/strategies/BranchStrategy/utils/getChildNodeMap/getChildNodeMap.ts
var import_array6 = require("@winglet/common-utils/array");

// packages/canard/schema-form/src/__legacy__/core/nodes/ObjectNode/strategies/BranchStrategy/utils/mergeShowConditions/mergeShowConditions.ts
var import_object10 = require("@winglet/common-utils/object");
var mergeShowConditions = (jsonSchema, conditions) => {
  if (conditions) {
    const active = jsonSchema.computed?.active ?? jsonSchema["&active"];
    if (typeof active === "boolean") return jsonSchema;
    const expression = combineConditions([
      active,
      combineConditions(conditions, "||")
    ]);
    if (expression === null) return jsonSchema;
    return (0, import_object10.merge)(jsonSchema, {
      computed: {
        active: expression
      }
    });
  } else return jsonSchema;
};

// packages/canard/schema-form/src/__legacy__/core/nodes/ObjectNode/strategies/BranchStrategy/utils/getChildNodeMap/getChildNodeMap.ts
var getChildNodeMap = (parentNode, jsonSchema, propertyKeys, defaultValue, conditionsMap, virtualReferencesMap, virtualReferenceFieldsMap, handelChangeFactory, nodeFactory) => {
  const childNodeMap = /* @__PURE__ */ new Map();
  const properties = jsonSchema.properties;
  if (!properties) return childNodeMap;
  const required = jsonSchema.required;
  for (let i = 0, l = propertyKeys.length; i < l; i++) {
    const propertyKey = propertyKeys[i];
    const schema = properties[propertyKey];
    const inputDefault = defaultValue?.[propertyKey];
    const conditions = conditionsMap?.get(propertyKey);
    const virtualReferenceFields = virtualReferenceFieldsMap?.get(propertyKey);
    const virtualReferenceConditions = getVirtualReferenceConditions(
      virtualReferenceFields,
      virtualReferencesMap
    );
    const mergedConditions = conditions && virtualReferenceConditions ? (0, import_array6.unique)([...conditions, ...virtualReferenceConditions]) : conditions || virtualReferenceConditions;
    childNodeMap.set(propertyKey, {
      virtual: !!virtualReferenceFields?.length,
      node: nodeFactory({
        name: propertyKey,
        scope: "properties",
        jsonSchema: mergeShowConditions(schema, mergedConditions),
        defaultValue: inputDefault !== void 0 ? inputDefault : schema.default,
        onChange: handelChangeFactory(propertyKey),
        nodeFactory,
        parentNode,
        required: required?.includes(propertyKey) || conditions !== void 0
      })
    });
  }
  return childNodeMap;
};
var getVirtualReferenceConditions = (virtualReferenceFields, virtualReferencesMap) => {
  if (!virtualReferenceFields || !virtualReferencesMap) return void 0;
  const conditions = [];
  for (let i = 0, l = virtualReferenceFields.length; i < l; i++) {
    const virtualReferenceField = virtualReferenceFields[i];
    const virtualReference = virtualReferencesMap.get(virtualReferenceField);
    if (!virtualReference) continue;
    const condition = virtualReference.computed?.active ?? virtualReference["&active"];
    if (condition !== void 0) conditions.push("" + condition);
  }
  return conditions.length ? conditions : void 0;
};

// packages/canard/schema-form/src/__legacy__/core/nodes/ObjectNode/strategies/BranchStrategy/utils/getChildren/getChildren.ts
var import_constant6 = require("@winglet/common-utils/constant");
var import_filter32 = require("@winglet/common-utils/filter");
var getChildren = (parentNode, propertyKeys, childNodeMap, conditionsMap, virtualReferencesMap, virtualReferenceFieldsMap, nodeFactory) => {
  const children = [];
  const hasVirtualReference = !!(virtualReferencesMap && virtualReferenceFieldsMap);
  for (const name of propertyKeys) {
    const childNode = childNodeMap.get(name);
    const virtualReferenceFields = virtualReferenceFieldsMap?.get(name);
    if (hasVirtualReference && (0, import_filter32.isArray)(virtualReferenceFields)) {
      for (const fieldName of virtualReferenceFields) {
        if (virtualReferencesMap.has(fieldName)) {
          const reference = virtualReferencesMap.get(fieldName);
          const conditions = conditionsMap?.get(fieldName);
          const { refNodes, defaultValue } = getRefNodes(
            reference,
            childNodeMap
          );
          children.push({
            node: nodeFactory({
              name: fieldName,
              scope: "properties",
              jsonSchema: mergeShowConditions(
                { type: "virtual", ...reference },
                conditions
              ),
              defaultValue,
              onChange: import_constant6.NOOP_FUNCTION,
              parentNode,
              nodeFactory,
              refNodes
            })
          });
          virtualReferencesMap.delete(fieldName);
        }
      }
    }
    children.push(childNode);
  }
  return children;
};
var getRefNodes = (reference, childNodeMap) => {
  const refNodes = [];
  const defaultValue = [];
  for (const field of reference.fields) {
    const refNode = childNodeMap.get(field);
    if (!refNode) continue;
    refNodes.push(refNode.node);
    defaultValue.push(refNode.node.defaultValue);
  }
  return { refNodes, defaultValue };
};

// packages/canard/schema-form/src/__legacy__/core/nodes/ObjectNode/strategies/BranchStrategy/utils/getCompositionKeyInfo/getCompositionKeyInfo.ts
var getCompositionKeyInfo = (scope, schema) => {
  if (!schema[scope]?.length) return void 0;
  const length = schema[scope].length;
  const unionKeySet = /* @__PURE__ */ new Set();
  const schemaKeySets = new Array(length);
  for (let i = 0; i < length; i++) {
    const schemaProperties = schema[scope][i]?.properties;
    schemaKeySets[i] = /* @__PURE__ */ new Set();
    if (schemaProperties === void 0) continue;
    if (isNullBranch(schema[scope][i])) continue;
    const keys = Object.keys(schemaProperties);
    for (let j = 0, k = keys[0], jl = keys.length; j < jl; j++, k = keys[j]) {
      const schema2 = schemaProperties[k];
      if (schema2.type === void 0 && schema2.$ref === void 0) continue;
      unionKeySet.add(k);
      schemaKeySets[i].add(k);
    }
  }
  return { unionKeySet, schemaKeySets };
};

// packages/canard/schema-form/src/__legacy__/core/nodes/ObjectNode/strategies/BranchStrategy/utils/getCompositionNodeMapList/getCompositionNodeMapList.ts
var import_filter35 = require("@winglet/common-utils/filter");

// packages/canard/schema-form/src/__legacy__/core/nodes/ObjectNode/strategies/BranchStrategy/utils/getCompositionNodeMapList/utils/throwIfTypeRedefinition.ts
var import_filter33 = require("@winglet/json-schema/filter");
var throwIfTypeRedefinition = (parentNode, scope, jsonSchema, subSchema) => {
  if (subSchema.type === void 0) return;
  if ((0, import_filter33.isIdenticalSchemaType)(jsonSchema, subSchema)) return;
  const branchType = extractSchemaInfo(subSchema)?.type;
  if (parentNode.nullable && (branchType === "object" || branchType === "null"))
    return;
  throw new JSONSchemaError(
    "COMPOSITION_TYPE_REDEFINITION",
    formatCompositionTypeRedefinitionError(
      scope,
      jsonSchema,
      parentNode.path,
      jsonSchema.type,
      subSchema.type
    ),
    {
      jsonSchema,
      type: jsonSchema.type,
      path: parentNode.path,
      compositionType: scope,
      subSchemaType: subSchema.type
    }
  );
};

// packages/canard/schema-form/src/__legacy__/core/nodes/ObjectNode/strategies/BranchStrategy/utils/getCompositionNodeMapList/utils/warnIfNestedComposition.ts
var warnIfNestedComposition = (subSchema, scope, parentPath) => {
  const nestedScope = subSchema.oneOf !== void 0 ? "oneOf" : subSchema.anyOf !== void 0 ? "anyOf" : void 0;
  if (nestedScope === void 0) return;
  warnDevelopmentIssue({
    code: NESTED_COMPOSITION_IGNORED_FOR_FORM,
    message: formatNestedCompositionIgnoredWarning(
      scope,
      nestedScope,
      parentPath
    ),
    details: { path: parentPath, scope, nestedScope }
  });
};

// packages/canard/schema-form/src/__legacy__/core/nodes/ObjectNode/strategies/BranchStrategy/utils/getCompositionNodeMapList/utils/warnIfNullBranchIgnored.ts
var warnIfNullBranchIgnored = (subSchema, scope, parentPath) => {
  const ignored = [];
  if (subSchema["&if"] !== void 0 || subSchema.computed?.if !== void 0)
    ignored.push("condition");
  if (subSchema.properties !== void 0) ignored.push("properties");
  if (ignored.length === 0) return;
  warnDevelopmentIssue({
    code: NULL_BRANCH_IGNORED_FOR_FORM,
    message: formatNullBranchIgnoredWarning(scope, ignored, parentPath),
    details: { path: parentPath, scope, ignored }
  });
};

// packages/canard/schema-form/src/__legacy__/core/nodes/ObjectNode/strategies/BranchStrategy/utils/getCompositionNodeMapList/utils/warnIfNullUnreachable.ts
var import_filter34 = require("@winglet/common-utils/filter");
var import_lib5 = require("@winglet/common-utils/lib");
var warnIfNullUnreachable = (parentNode, scope, branches) => {
  if (scope !== "oneOf" || parentNode.nullable === false) return;
  let admitting = 0;
  for (const branch of branches) {
    if (branch.$ref !== void 0) return;
    if (admitsNull(branch) === false) continue;
    if (hasUncountedKeyword(branch)) return;
    admitting++;
  }
  if (admitting === 1) return;
  warnDevelopmentIssue({
    code: NULLABLE_ONE_OF_NULL_UNREACHABLE,
    message: formatNullUnreachableWarning(parentNode.path, admitting),
    details: { path: parentNode.path, admitting }
  });
};
var UNCOUNTED_KEYWORDS = ["not", "allOf", "anyOf", "oneOf", "if"];
var hasUncountedKeyword = (branch) => {
  for (const keyword of UNCOUNTED_KEYWORDS)
    if ((0, import_lib5.hasOwnProperty)(branch, keyword)) return true;
  return false;
};
var admitsNull = (branch) => {
  if (branch.type !== void 0 && extractSchemaInfo(branch)?.nullable !== true)
    return false;
  if ((0, import_lib5.hasOwnProperty)(branch, "const") && branch.const !== null) return false;
  if ((0, import_filter34.isArray)(branch.enum) && branch.enum.indexOf(null) === -1) return false;
  return true;
};

// packages/canard/schema-form/src/__legacy__/core/nodes/ObjectNode/strategies/BranchStrategy/utils/getCompositionNodeMapList/getCompositionNodeMapList.ts
var getCompositionNodeMapList = (parentNode, scope, jsonSchema, defaultValue, childNodeMap, keySetList, excludeKeySet, handleChangeFactory, nodeFactory) => {
  const compositionSchemas = jsonSchema[scope];
  if (!compositionSchemas || !(0, import_filter35.isArray)(compositionSchemas)) return void 0;
  warnIfNullUnreachable(parentNode, scope, compositionSchemas);
  const propertyKeySet = scope === "anyOf" ? /* @__PURE__ */ new Set() : null;
  const compositionLength = compositionSchemas.length;
  const childNodeMapList = new Array(compositionLength);
  for (let index = 0; index < compositionLength; index++) {
    const subSchema = compositionSchemas[index];
    warnIfNestedComposition(subSchema, scope, parentNode.path);
    throwIfTypeRedefinition(parentNode, scope, jsonSchema, subSchema);
    const compositionChildNodeMap = /* @__PURE__ */ new Map();
    childNodeMapList[index] = compositionChildNodeMap;
    if (isNullBranch(subSchema)) {
      warnIfNullBranchIgnored(subSchema, scope, parentNode.path);
      continue;
    }
    const properties = subSchema.properties;
    if (!(0, import_filter35.isPlainObject)(properties)) continue;
    const keys = Object.keys(properties);
    const required = subSchema.required;
    for (let i = 0, k = keys[0], l = keys.length; i < l; i++, k = keys[i]) {
      if (keySetList && !keySetList[index].has(k)) continue;
      if (excludeKeySet?.has(k) || propertyKeySet?.has(k))
        throw new JSONSchemaError(
          "COMPOSITION_PROPERTY_EXCLUSIVENESS_REDEFINITION",
          formatCompositionPropertyExclusivenessError(
            scope,
            parentNode.path,
            k
          ),
          {
            jsonSchema,
            compositionType: scope,
            path: parentNode.path,
            property: k
          }
        );
      if (childNodeMap.has(k))
        throw new JSONSchemaError(
          "COMPOSITION_PROPERTY_REDEFINITION",
          formatCompositionPropertyRedefinitionError(scope, parentNode.path, k),
          {
            jsonSchema,
            compositionType: scope,
            path: parentNode.path,
            property: k
          }
        );
      const childSchema = properties[k];
      const inputDefault = defaultValue?.[k];
      compositionChildNodeMap.set(k, {
        node: nodeFactory({
          name: k,
          scope,
          variant: index,
          jsonSchema: childSchema,
          defaultValue: inputDefault !== void 0 ? inputDefault : childSchema.default,
          onChange: handleChangeFactory(k),
          nodeFactory,
          parentNode,
          required: required?.includes(k)
        })
      });
      propertyKeySet?.add(k);
    }
  }
  return childNodeMapList;
};

// packages/canard/schema-form/src/__legacy__/core/nodes/ObjectNode/strategies/BranchStrategy/utils/getConditionsMap/getConditionsMap.ts
var getConditionsMap = (fieldConditionMap) => {
  if (!fieldConditionMap) return void 0;
  const oneOfConditionsMap = /* @__PURE__ */ new Map();
  for (const [field, conditions] of fieldConditionMap) {
    if (conditions === true) continue;
    const operations = [];
    for (let i = 0, l = conditions.length; i < l; i++) {
      const source = conditions[i];
      const operation = convertExpression(source.condition, source.inverse);
      if (operation) operations.push(operation);
    }
    oneOfConditionsMap.set(field, operations);
  }
  return oneOfConditionsMap;
};

// packages/canard/schema-form/src/__legacy__/core/nodes/ObjectNode/strategies/BranchStrategy/utils/getFieldConditionMap/utils/flattenConditions.ts
var import_filter36 = require("@winglet/common-utils/filter");
var import_object11 = require("@winglet/common-utils/object");
var flattenConditions = (schema) => {
  const conditions = [];
  flattenConditionsInto(schema, conditions);
  return conditions.length > 0 ? conditions : void 0;
};
var flattenConditionsInto = (schema, conditions, accumulator = (0, import_object11.getEmptyObject)()) => {
  if (!schema.if || !schema.then) return;
  const ifCondition = schema.if.properties ? extractCondition(schema.if.properties) : null;
  if (ifCondition === null) return;
  for (const key in ifCondition) {
    if (accumulator[key]) accumulator[key].push(ifCondition[key]);
    else accumulator[key] = [ifCondition[key]];
  }
  const thenRequired = schema.then?.required;
  if (thenRequired?.length) {
    const thenVirtualRequired = schema.then.virtualRequired;
    conditions[conditions.length] = {
      condition: ifCondition,
      required: thenVirtualRequired?.length ? [...thenRequired, ...thenVirtualRequired] : thenRequired
    };
  }
  if (schema.else) {
    if (schema.else.if && schema.else.then)
      flattenConditionsInto(schema.else, conditions, accumulator);
    else {
      const elseRequired = schema.else.required;
      if (elseRequired?.length) {
        const inverseCondition = (0, import_object11.getEmptyObject)();
        for (const key in accumulator) {
          const values = accumulator[key];
          if (values.length === 1) {
            inverseCondition[key] = values[0];
          } else {
            const merged = [];
            for (let i = 0, il = values.length; i < il; i++) {
              const value = values[i];
              if ((0, import_filter36.isArray)(value)) {
                for (let j = 0, jl = value.length; j < jl; j++)
                  merged.push(value[j]);
              } else merged.push(value);
            }
            inverseCondition[key] = merged;
          }
        }
        const elseVirtualRequired = schema.else.virtualRequired;
        conditions[conditions.length] = {
          condition: inverseCondition,
          required: elseVirtualRequired?.length ? [...elseRequired, ...elseVirtualRequired] : elseRequired,
          inverse: true
        };
      }
    }
  }
};
var extractCondition = (properties) => {
  const condition = (0, import_object11.getEmptyObject)();
  const keys = Object.keys(properties);
  for (let i = 0, k = keys[0], l = keys.length; i < l; i++, k = keys[i]) {
    const propSchema = properties[k];
    if (!propSchema || typeof propSchema !== "object") continue;
    if (isValidConst(propSchema)) condition[k] = propSchema.const;
    else if (isValidEnum(propSchema)) {
      const enumValues = propSchema.enum;
      if (enumValues.length === 1) condition[k] = enumValues[0];
      else condition[k] = enumValues;
    }
  }
  return (0, import_filter36.isEmptyObject)(condition) ? null : condition;
};
var isValidEnum = (schema) => !!schema.enum?.length;
var isValidConst = (schema) => schema.const !== void 0;

// packages/canard/schema-form/src/__legacy__/core/nodes/ObjectNode/strategies/BranchStrategy/utils/getFieldConditionMap/getFieldConditionMap.ts
var getFieldConditionMap = (jsonSchema) => {
  const conditions = flattenConditions(jsonSchema);
  if (!conditions) return void 0;
  const fieldConditionMap = /* @__PURE__ */ new Map();
  for (let i = 0, il = conditions.length; i < il; i++) {
    const { condition, required, inverse } = conditions[i];
    for (let j = 0, jl = required.length; j < jl; j++) {
      const field = required[j];
      const previous = fieldConditionMap.get(field);
      if (previous === true) continue;
      if (!previous) fieldConditionMap.set(field, [{ condition, inverse }]);
      else previous.push({ condition, inverse });
    }
    for (const key of Object.keys(condition))
      if (!required.includes(key)) fieldConditionMap.set(key, true);
  }
  return fieldConditionMap;
};

// packages/canard/schema-form/src/__legacy__/core/nodes/ObjectNode/strategies/BranchStrategy/utils/getVirtualReferencesMap/getVirtualReferencesMap.ts
var import_filter37 = require("@winglet/common-utils/filter");
var getVirtualReferencesMap = (nodeName, propertyKeys, virtualReferences) => {
  if (!virtualReferences) return {};
  const virtualReferenceFieldsMap = /* @__PURE__ */ new Map();
  const virtualReferencesMap = /* @__PURE__ */ new Map();
  const keys = Object.keys(virtualReferences);
  for (let i = 0, k = keys[0], l = keys.length; i < l; i++, k = keys[i]) {
    const value = virtualReferences[k];
    if (!(0, import_filter37.isArray)(value.fields))
      throw new JSONSchemaError(
        "VIRTUAL_FIELDS_NOT_VALID",
        formatVirtualFieldsNotValidError(k, value, nodeName || "root"),
        {
          nodeKey: k,
          nodeValue: value,
          name: nodeName || "root"
        }
      );
    const notFoundFields = value.fields.filter(
      (field) => !propertyKeys.includes(field)
    );
    if (notFoundFields.length)
      throw new JSONSchemaError(
        "VIRTUAL_FIELDS_NOT_IN_PROPERTIES",
        formatVirtualFieldsNotInPropertiesError(k, value, notFoundFields),
        {
          nodeKey: k,
          nodeValue: value,
          notFoundFields
        }
      );
    for (const field of value.fields) {
      const virtualReferenceFields = virtualReferenceFieldsMap.get(field) || [];
      virtualReferenceFields.push(k);
      virtualReferenceFieldsMap.set(field, virtualReferenceFields);
    }
    virtualReferencesMap.set(k, value);
  }
  return {
    virtualReferencesMap,
    virtualReferenceFieldsMap
  };
};

// packages/canard/schema-form/src/__legacy__/core/nodes/ObjectNode/strategies/BranchStrategy/utils/hasCompositionSchema/hasCompositionSchema.ts
var hasCompositionSchema = (node) => node.type === "object" && (node.jsonSchema.oneOf !== void 0 || node.jsonSchema.anyOf !== void 0);

// packages/canard/schema-form/src/__legacy__/core/nodes/ObjectNode/strategies/BranchStrategy/utils/processValueWithSchema/utils/requiredFactory.ts
var import_filter38 = require("@winglet/common-utils/filter");
var requiredFactory = (value, fieldConditionMap) => {
  return (key) => {
    const conditions = fieldConditionMap.get(key);
    if (conditions === void 0 || conditions === true) return true;
    for (let i = 0, l = conditions.length; i < l; i++) {
      const condition = conditions[i].condition;
      let matches = true;
      const keys = Object.keys(condition);
      if (keys.length === 1) {
        const condValue = condition[keys[0]];
        const currentValue = value[keys[0]];
        if ((0, import_filter38.isArray)(condValue)) matches = condValue.includes(currentValue);
        else matches = condValue === currentValue;
      } else {
        for (let i2 = 0, k = keys[0], l2 = keys.length; i2 < l2; i2++, k = keys[i2]) {
          const condValue = condition[k];
          const currentValue = value[k];
          if ((0, import_filter38.isArray)(condValue)) matches = condValue.includes(currentValue);
          else matches = condValue === currentValue;
          if (!matches) break;
        }
      }
      if (conditions[i].inverse) matches = !matches;
      if (matches) return true;
    }
    return false;
  };
};

// packages/canard/schema-form/src/__legacy__/core/nodes/ObjectNode/strategies/BranchStrategy/utils/processValueWithSchema/processValueWithCondition.ts
var processValueWithCondition = (value, fieldConditionMap) => {
  if (value == null || !fieldConditionMap) return value;
  const keys = Object.keys(value);
  if (keys.length === 0) return value;
  const isRequired = requiredFactory(value, fieldConditionMap);
  const filteredValue = {};
  for (let i = 0, k = keys[0], l = keys.length; i < l; i++, k = keys[i])
    if (isRequired(k)) filteredValue[k] = value[k];
  return filteredValue;
};

// packages/canard/schema-form/src/__legacy__/core/nodes/ObjectNode/strategies/BranchStrategy/utils/processValueWithSchema/processValueWithValidate.ts
function processValueWithValidate(value, validate2) {
  if (value == null || validate2 === void 0) return value;
  const keys = Object.keys(value);
  if (keys.length === 0) return value;
  const result = {};
  for (let i = 0, k = keys[0], l = keys.length; i < l; i++, k = keys[i])
    if (validate2(k)) result[k] = value[k];
  return result;
}

// packages/canard/schema-form/src/__legacy__/core/nodes/ObjectNode/strategies/BranchStrategy/utils/validateSchemaType/validateSchemaType.ts
var import_filter39 = require("@winglet/common-utils/filter");
var validateSchemaType = (value, type, nullable) => {
  if (value === void 0) return false;
  if (value === null) return nullable || type === "null";
  if ((0, import_filter39.isArray)(value)) return type === "array";
  return typeof value === type;
};

// packages/canard/schema-form/src/__legacy__/core/nodes/ObjectNode/strategies/BranchStrategy/BranchStrategy.ts
var BranchStrategy2 = class {
  /**
   * Initializes the BranchStrategy object.
   * @param host - Host ObjectNode object
   * @param handleChange - Value change handler
   * @param handleRefresh - Refresh handler
   * @param handleSetDefaultValue - Default value setting handler
   * @param handleUpdateComputedProperties - Computed properties update handler
   * @param nodeFactory - Node creation factory
   */
  constructor(host, handleChange, nodeFactory) {
    /** Flag indicating whether the node is in isolation mode (affects condition processing) */
    this.__isolated__ = false;
    /** Flag indicating whether the strategy is already processing a batch */
    this.__batched__ = false;
    /** Whether a child write from outside the form's own machinery is waiting for the next commit */
    this.__intended__ = false;
    /** Flag indicating whether the strategy is locked to prevent recursive updates */
    this.__locked__ = true;
    /**
     * What the children hold while the object is `null` — the object it becomes on its first outside write.
     * @remarks Meaningful only while `__isNull__`. It starts from the node's own object `default` and takes child emits on top — the way the constructor merges child emits into its base — and is rebuilt each time the object becomes `null`, because a child whose blank reset changes nothing emits nothing and would keep its old entry.
     */
    this.__blank__ = {};
    /** Flag indicating whether the object value is expired */
    this.__expired__ = true;
    /** Whether `__composed__` still matches the pending draft: a child write and every commit clear it. */
    this.__composedValid__ = false;
    /** Current active children nodes (combination of property and oneOf children) */
    this.__children__ = [];
    /** Previously active oneOf index for tracking oneOf branch changes */
    this.__oneOfIndex__ = -1;
    /** Active oneOf child node map */
    this.__oneOfChildNodeMap__ = null;
    /** Previously active anyOf index for tracking anyOf branch changes */
    this.__anyOfIndices__ = [];
    /** Active anyOf child node maps */
    this.__anyOfChildNodeMaps__ = null;
    this.__host__ = host;
    this.__handleChange__ = handleChange;
    this.__value__ = host.defaultValue;
    this.__draft__ = host.defaultValue === null ? null : {};
    const jsonSchema = host.jsonSchema;
    this.__ignoreAdditionalProperties__ = jsonSchema.additionalProperties === false;
    const propertyKeys = (0, import_array7.sortWithReference)(
      (0, import_object12.getObjectKeys)(jsonSchema.properties),
      jsonSchema.propertyKeys
    );
    const oneOfKeyInfo = getCompositionKeyInfo("oneOf", jsonSchema);
    if (oneOfKeyInfo) {
      this.__oneOfKeySet__ = oneOfKeyInfo.unionKeySet;
      this.__oneOfKeySetList__ = oneOfKeyInfo.schemaKeySets;
    }
    const anyOfKeyInfo = getCompositionKeyInfo("anyOf", jsonSchema);
    if (anyOfKeyInfo) {
      this.__anyOfKeySet__ = anyOfKeyInfo.unionKeySet;
      this.__anyOfKeySetList__ = anyOfKeyInfo.schemaKeySets;
    }
    if (this.__oneOfKeySet__ || this.__anyOfKeySet__) {
      this.__propertyKeys__ = (0, import_array7.sortWithReference)(
        [
          ...propertyKeys,
          ...this.__oneOfKeySet__ ? Array.from(this.__oneOfKeySet__) : [],
          ...this.__anyOfKeySet__ ? Array.from(this.__anyOfKeySet__) : []
        ],
        jsonSchema.propertyKeys
      );
    } else this.__propertyKeys__ = propertyKeys;
    const handleChangeFactory = (property) => (input, batched, automatic) => {
      if (this.__isNull__) {
        if (automatic || this.__locked__ || input === void 0) {
          this.__blank__[property] = input;
          return;
        }
        this.__draft__ = { ...this.__blank__ };
      } else {
        if (this.__draft__ == null) this.__draft__ = {};
        if (input === void 0 && this.__value__?.[property] === input)
          return;
        if (input !== void 0 && this.__draft__[property] === input) {
          if (automatic || this.__locked__) return;
          this.__intended__ = true;
          return this.__emitChange__(SetValueOption.Default, batched);
        }
      }
      this.__draft__[property] = input;
      this.__composedValid__ = false;
      this.__expired__ = true;
      if (this.__isolated__ && this.__isPristine__) this.__isolated__ = false;
      if (!automatic && !this.__locked__) this.__intended__ = true;
      this.__emitChange__(
        automatic ? SetValueOption.Default | SetValueOption.Automatic : SetValueOption.Default,
        batched
      );
    };
    host.subscribe(({ type, payload }) => {
      if (type & NodeEventType.RequestEmitChange) {
        this.__handleEmitChange__(
          payload?.[NodeEventType.RequestEmitChange],
          true
        );
        this.__batched__ = false;
      }
    });
    const childDefaults = host.defaultValue === null ? this.__blankBase__ : host.defaultValue;
    if (host.defaultValue === null) this.__blank__ = { ...this.__blankBase__ };
    const { virtualReferencesMap, virtualReferenceFieldsMap } = getVirtualReferencesMap(host.name, propertyKeys, host.jsonSchema.virtual);
    this.__fieldConditionMap__ = getFieldConditionMap(jsonSchema);
    const conditionsMap = getConditionsMap(this.__fieldConditionMap__);
    this.__childNodeMap__ = getChildNodeMap(
      host,
      jsonSchema,
      propertyKeys,
      childDefaults,
      conditionsMap,
      virtualReferencesMap,
      virtualReferenceFieldsMap,
      handleChangeFactory,
      nodeFactory
    );
    this.__propertyChildren__ = getChildren(
      host,
      propertyKeys,
      this.__childNodeMap__,
      conditionsMap,
      virtualReferencesMap,
      virtualReferenceFieldsMap,
      nodeFactory
    );
    this.__oneOfChildNodeMapList__ = getCompositionNodeMapList(
      host,
      "oneOf",
      jsonSchema,
      childDefaults,
      this.__childNodeMap__,
      this.__oneOfKeySetList__,
      this.__anyOfKeySet__,
      handleChangeFactory,
      nodeFactory
    );
    this.__anyOfChildNodeMapList__ = getCompositionNodeMapList(
      host,
      "anyOf",
      jsonSchema,
      childDefaults,
      this.__childNodeMap__,
      this.__anyOfKeySetList__,
      this.__oneOfKeySet__,
      handleChangeFactory,
      nodeFactory
    );
    const subnodes = [...this.__propertyChildren__];
    if (this.__oneOfChildNodeMapList__)
      for (const childNodeMap of this.__oneOfChildNodeMapList__)
        for (const child of childNodeMap.values()) subnodes.push(child);
    if (this.__anyOfChildNodeMapList__)
      for (const childNodeMap of this.__anyOfChildNodeMapList__)
        for (const child of childNodeMap.values()) subnodes.push(child);
    this.__subnodes__ = subnodes;
    this.__locked__ = false;
    this.__emitChange__(SetValueOption.Default);
    this.__host__.__setDefaultValue__(this.__value__);
    this.__prepareCompositionChildren__();
  }
  /**
   * Whether an activating child already carries live array state of its own.
   * @param node - Child node being restored by a branch switch
   * @returns `true` for an array child holding items — a same-batch hydration or an inactive-branch injection whose raw item nodes (incl. trailing empties) must survive the restore
   * @remarks Deliberately array-only: defaulted objects legitimately hold content right after a reset, so content cannot distinguish their pristine state and they keep the composed/defaults restoration chain. The type check runs before the `value` read, so non-array getters (which may recompose) are never touched.
   */
  __hasArrayState__(node) {
    if (node.type !== "array") return false;
    const value = node.value;
    return (0, import_filter40.isArray)(value) && value.length > 0;
  }
  /**
   * The object this node's own schema `default` gives its children while the node is `null`.
   * @remarks A form without a default value builds the children from it, so the blank form of a null node does too; `undefined` when the schema default is absent or `null`.
   */
  get __blankBase__() {
    return this.__host__.jsonSchema.default ?? void 0;
  }
  /** Whether the object is `null` with no child write pending in the draft. */
  get __isNull__() {
    return this.__value__ === null && (this.__draft__ === null || (0, import_filter40.isEmptyObject)(this.__draft__));
  }
  /**
   * Determines whether to queue or immediately process value changes.
   *
   * In batch mode: Publishes RequestEmitChange event for deferred processing
   * In sync mode: Immediately calls handleEmitChange for instant updates
   *
   * @param option - Change options (optional)
   * @private
   */
  __emitChange__(option, batched = false) {
    if (this.__locked__) return;
    if (batched) {
      if (this.__batched__) return;
      this.__batched__ = true;
      this.__host__.publish(NodeEventType.RequestEmitChange, option);
    } else this.__handleEmitChange__(option);
  }
  /**
   * Reflects value changes and publishes related events.
   * @param option - Setting options
   * @param pending - Whether this is the batched commit a pending window was waiting for; only that commit may use what a read composed in the window
   * @private
   */
  __handleEmitChange__(option = SetValueOption.Default, pending = false) {
    if (this.__locked__) return;
    const host = this.__host__;
    const replace = (option & SetValueOption.Replace) > 0;
    const normalize = (option & SetValueOption.Normalize) > 0;
    const settled = (option & SetValueOption.Isolate) === 0;
    const inject = (option & SetValueOption.PreventInjection) === 0;
    const base = this.__value__;
    const draft = this.__draft__;
    const previous = base ? { ...base } : base;
    const current = pending && this.__composedValid__ ? this.__composed__ : this.__parseValue__(base, draft, replace, normalize, host.nullable);
    this.__composedValid__ = false;
    const intended = this.__intended__;
    const automatic = (option & SetValueOption.Automatic) > 0 && !intended;
    this.__intended__ = false;
    if (current === false) {
      if (intended && host.__hasNullAncestor__)
        this.__handleChange__(base, (option & SetValueOption.Batch) > 0, false);
      return;
    }
    if (!automatic) host.__markIntendedWrite__();
    this.__value__ = current;
    this.__draft__ = {};
    if (this.__expired__) this.__expired__ = false;
    if (option & SetValueOption.EmitChange)
      this.__handleChange__(
        current,
        (option & SetValueOption.Batch) > 0,
        automatic
      );
    if (option & SetValueOption.Propagate)
      this.__propagate__(current, draft, replace, option);
    if (option & SetValueOption.Refresh)
      host.publish(NodeEventType.RequestRefresh);
    if (option & SetValueOption.Isolate) host.__updateComputedProperties__();
    if (option & SetValueOption.PublishUpdateEvent)
      host.publish(
        NodeEventType.UpdateValue,
        current,
        { previous, current, settled, inject },
        settled && host.initialized
      );
  }
  /**
   * Parses input value and processes it as an object.
   * @param base - Base object to parse
   * @param draft - Draft object to parse
   * @param nullable - Whether the object is nullable
   * @param replace - Whether to replace the existing value
   * @returns {ObjectValue} Processed object, or `false` when the draft changes nothing
   * @remarks An empty draft merged into a `null` base changes nothing — only a replace (an explicit `{}`) or a child write may promote `null`. Keys merged into a `null` base land on the blank form, as a child write does.
   * @private
   */
  __parseValue__(base, draft, replace, normalize, nullable) {
    if (draft === void 0) return void 0;
    if (draft === null) return nullable ? null : {};
    if (!replace && base === null && (0, import_filter40.isEmptyObject)(draft)) return false;
    if (replace || base === void 0)
      return this.__processValue__(draft, normalize);
    if (base === null)
      return this.__processValue__({ ...this.__blank__, ...draft }, normalize);
    if ((0, import_filter40.isEmptyObject)(draft) || this.__host__.__equals__(base, draft))
      return false;
    return this.__processValue__({ ...base, ...draft }, normalize);
  }
  /**
   * Processes input value and processes it as an object.
   * @param input - Object to parse
   * @returns {ObjectValue} Parsed object
   * @private
   */
  __processValue__(input, normalize) {
    const value = (0, import_object12.sortObjectKeys)(input, this.__propertyKeys__, {
      ignoreUndefinedKey: this.__ignoreAdditionalProperties__ || normalize,
      ignoreUndefinedValue: true
    });
    if (this.__isolated__)
      return processValueWithCondition(value, this.__fieldConditionMap__);
    return value;
  }
  /**
   * Propagates value changes to child nodes.
   * @param replace - Whether to replace existing values
   * @param option - Setting options
   * @remarks Skips a filtering child (raw ≠ normalized) when the incoming slice equals its own normalized output — echoing it back would erase raw-only state such as trailing empty array items.
   *          Becoming `null` blanks the children of every branch, not only the one in use: a branch restore returns a child to its default, and a child left out would bring its old value back.
   * @private
   */
  __propagate__(source, target, replace, option) {
    const current = source || {};
    const committed = target || {};
    const nullify = target === null;
    if (nullify) this.__blank__ = { ...this.__blankBase__ };
    const propagateOption = target == null ? option & ~SetValueOption.EmitChange : option;
    this.__locked__ = true;
    const nodes = source === null ? this.__subnodes__ : this.__children__;
    for (let i = 0, l = nodes.length; i < l; i++) {
      const node = nodes[i].node;
      if (node.type === "virtual") continue;
      const name = node.name;
      if (source === null) {
        node.__resetToBlank__(this.__blankBase__?.[name]);
        continue;
      }
      if (replace || nullify || name in committed && name in current) {
        const nextValue = nullify ? null : current[name];
        if (!nullify && node.normalizedValue !== node.value && node.__equals__(node.normalizedValue, nextValue))
          continue;
        node.setValue(nextValue, propagateOption);
      }
    }
    this.__locked__ = false;
  }
  /**
   * Gets the current value of the object.
   * @returns The committed value, with a child write whose commit is still pending laid over it
   * @remarks A read commits nothing: the pending commit still runs once, on its own path and with its own options. While locked the committed value is returned as it stands.
   */
  get value() {
    if (!this.__expired__ || this.__locked__) return this.__value__;
    if (!this.__composedValid__) {
      this.__composed__ = this.__parseValue__(
        this.__value__,
        this.__draft__,
        false,
        false,
        this.__host__.nullable
      );
      this.__composedValid__ = true;
    }
    return this.__composed__ === false ? this.__value__ : this.__composed__;
  }
  /**
   * Applies input value to the object node.
   * @param input - Object value to set
   * @param option - Setting options
   */
  applyValue(input, option) {
    this.__draft__ = input;
    if ((option & SetValueOption.Automatic) === 0 && !(0, import_filter40.isEmptyObject)(input))
      this.__intended__ = true;
    this.__expired__ = true;
    this.__isolated__ = (option & SetValueOption.Isolate) > 0 || !this.__isPristine__ && this.__isolated__;
    this.__emitChange__(option);
  }
  /**
   * Rebuilds the subtree the way a form without a default value builds it.
   * @param input - Value the parent's schema default assigns to this object, if any
   * @remarks Mirrors the constructor: the base becomes the value, children take their slice of it or their own schema default, and what they emit is merged in — so a base the children merely repeat is, as at construction, not reported to the parent — the parent already holds that slice in its own base.
   */
  resetToBlank(input) {
    const host = this.__host__;
    const base = input !== void 0 ? input : getDefaultValue(host.jsonSchema);
    if (base === null) {
      host.__setDefaultValue__(null);
      return host.setValue(null, SetValueOption.StableReset);
    }
    this.__value__ = base;
    this.__draft__ = {};
    this.__locked__ = true;
    for (let i = 0, l = this.__subnodes__.length; i < l; i++) {
      const node = this.__subnodes__[i].node;
      if (node.type === "virtual") continue;
      node.__resetToBlank__(base?.[node.name]);
    }
    this.__locked__ = false;
    this.__expired__ = true;
    this.__emitChange__(
      SetValueOption.StableReset & ~(SetValueOption.Propagate | SetValueOption.Replace)
    );
    host.__setDefaultValue__(this.__value__);
  }
  /**
   * Publishes a child node change event.
   * @private
   */
  __publishChildrenChange__() {
    if (this.__locked__) return;
    this.__host__.publish(NodeEventType.UpdateChildren);
  }
  /**
   * Gets the child nodes of the object node.
   * @returns List of child nodes
   */
  get children() {
    return this.__children__;
  }
  /**
   * Gets all of the child nodes of the object node.
   * @returns List of child nodes
   */
  get subnodes() {
    return this.__subnodes__;
  }
  /** Whether the object node has no oneOf and anyOf schema */
  get __isPristine__() {
    return this.__oneOfChildNodeMapList__ === void 0 && this.__anyOfChildNodeMapList__ === void 0;
  }
  /**
   * Updates child nodes when oneOf index changes, if oneOf schema exists.
   * @private
   */
  __prepareCompositionChildren__() {
    if (this.__isPristine__) return;
    this.__validateAllowedKey__ = this.__createAllowedKeyValidator__();
    this.__host__.subscribe(({ type }) => {
      if (type & NodeEventType.UpdateComputedProperties) {
        const isolation = this.__isolated__;
        const skipOneOfUpdate = this.__processOneOfChildren__(isolation);
        const skipAnyOfUpdate = this.__processAnyOfChildren__(isolation);
        if (skipOneOfUpdate && skipAnyOfUpdate) return;
        if (isolation) this.__isolated__ = false;
        this.__processChildren__();
        this.__processCompositionValue__(isolation);
      }
    });
  }
  /**
   * Updates child nodes when oneOf index changes, if oneOf schema exists.
   * @remarks Restore input prefers a child's own live array state (`__hasArrayState__`) over the composed value; only that case widens the preferLatest/default gates, so every other path keeps the restore-defaults contract.
   * @private
   */
  __processOneOfChildren__(isolation) {
    if (this.__oneOfChildNodeMapList__ === void 0) return true;
    const current = this.__host__.oneOfIndex;
    const previous = this.__oneOfIndex__;
    if (!isolation && current === previous) return true;
    const oneOfChildNodeMap = current > -1 ? this.__oneOfChildNodeMapList__[current] : null;
    const preserveInitial = previous === -1 && this.__oneOfChildNodeMap__ === oneOfChildNodeMap;
    this.__locked__ = true;
    const previousOneOfChildNodeMap = previous > -1 ? this.__oneOfChildNodeMapList__[previous] : null;
    if (previousOneOfChildNodeMap)
      for (const child of previousOneOfChildNodeMap.values()) {
        child.node.__reset__({ updateScoped: true });
      }
    if (oneOfChildNodeMap)
      for (const child of oneOfChildNodeMap.values()) {
        const node = child.node;
        const previousNode = previousOneOfChildNodeMap?.get(node.name)?.node;
        const hasArrayState = this.__hasArrayState__(node);
        const candidate = hasArrayState ? node.value : this.__value__?.[node.name];
        const restoreValue = candidate !== void 0 && validateSchemaType(candidate, node.type, node.nullable) ? candidate : void 0;
        const preserveArrayState = hasArrayState && restoreValue !== void 0;
        node.__reset__({
          updateScoped: true,
          isolate: !preserveInitial && hasCompositionSchema(node),
          preferLatest: isolation || preserveInitial || preserveArrayState || node.type === previousNode?.type && isTerminalType(node.type),
          applyDerivedValue: true,
          checkDefaultValueFirst: isolation === false && !preserveInitial && !preserveArrayState,
          fallbackValue: restoreValue
        });
        node.__updateComputedPropertiesRecursively__();
      }
    this.__locked__ = false;
    this.__oneOfIndex__ = current;
    this.__oneOfChildNodeMap__ = oneOfChildNodeMap;
    return false;
  }
  /**
   * Updates child nodes when anyOf indices change, if anyOf schema exists.
   * @param isolation - Whether the operation is in isolation mode
   * @returns Array of active anyOf child node maps, null if no change needed, or undefined if no active anyOf branches
   * @private
   */
  __processAnyOfChildren__(isolation) {
    if (this.__anyOfChildNodeMapList__ === void 0) return true;
    const current = this.__host__.anyOfIndices;
    const previous = this.__anyOfIndices__;
    if (!isolation && (0, import_array7.primitiveArrayEqual)(current, previous)) return true;
    const anyOfChildNodeMaps = new Array(current.length);
    for (let i = 0, l = current.length; i < l; i++)
      anyOfChildNodeMaps[i] = this.__anyOfChildNodeMapList__[current[i]];
    const primedAnyOfMaps = this.__anyOfChildNodeMaps__;
    const preserveInitial = previous.length === 0 && primedAnyOfMaps !== null && (0, import_array7.primitiveArrayEqual)(primedAnyOfMaps, anyOfChildNodeMaps);
    this.__locked__ = true;
    const disables = isolation ? previous : (0, import_array7.differenceLite)(previous, current);
    if (disables.length > 0)
      for (let i = 0, l = disables.length; i < l; i++) {
        const anyOfChildNodes = this.__anyOfChildNodeMapList__[disables[i]].values();
        for (const child of anyOfChildNodes) {
          child.node.__reset__({ updateScoped: true });
        }
      }
    const enables = isolation ? current : (0, import_array7.differenceLite)(current, previous);
    if (enables.length > 0)
      for (let i = 0, l = enables.length; i < l; i++) {
        const anyOfChildNodes = this.__anyOfChildNodeMapList__[enables[i]].values();
        for (const child of anyOfChildNodes) {
          const node = child.node;
          const hasArrayState = this.__hasArrayState__(node);
          const restoreValue = hasArrayState ? node.value : this.__value__?.[node.name];
          node.__reset__({
            updateScoped: true,
            isolate: !preserveInitial && hasCompositionSchema(node),
            preferLatest: isolation || preserveInitial || hasArrayState && validateSchemaType(restoreValue, node.type, node.nullable),
            applyDerivedValue: true,
            fallbackValue: restoreValue
          });
          node.__updateComputedPropertiesRecursively__();
        }
      }
    this.__locked__ = false;
    this.__anyOfIndices__ = current;
    this.__anyOfChildNodeMaps__ = anyOfChildNodeMaps.length > 0 ? anyOfChildNodeMaps : null;
    return false;
  }
  /**
   * Updates the active children array based on current oneOf and anyOf selections.
   * @param oneOfChildNodeMap - Active oneOf child node map (null if no oneOf or none selected)
   * @param anyOfChildNodeMaps - Array of active anyOf child node maps (null if no anyOf or none selected)
   * @private
   */
  __processChildren__() {
    const oneOfChildNodeMap = this.__oneOfChildNodeMap__;
    const anyOfChildNodeMaps = this.__anyOfChildNodeMaps__;
    if (oneOfChildNodeMap === null && anyOfChildNodeMaps === null)
      this.__children__ = this.__propertyChildren__;
    else {
      const keys = this.__propertyKeys__;
      const children = [];
      for (let i = 0, k = keys[0], l = keys.length; i < l; i++, k = keys[i]) {
        const childNode = this.__childNodeMap__.get(k) || oneOfChildNodeMap?.get(k) || anyOfChildNodeMaps?.find((map6) => map6.has(k))?.get(k);
        if (childNode) children.push(childNode);
      }
      this.__children__ = children;
    }
    this.__publishChildrenChange__();
  }
  /**
   * Processes and validates the object value according to active composition branches.
   * Filters out properties that are not allowed by current oneOf/anyOf selections.
   * @param isolation - Whether the operation is in isolation mode
   * @remarks A `null` value with no pending child write has no keys to filter; recomposing it would commit `{}` in its place, so only the enhancer is adjusted.
   * @private
   */
  __processCompositionValue__(isolation) {
    if (this.__host__.__validationEnabled__)
      this.__host__.__adjustEnhancer__(
        joinSegment(this.__host__.path, ENHANCED_KEY),
        this.__oneOfIndex__
      );
    if (this.__isNull__) {
      this.__blank__ = processValueWithValidate(
        this.__blank__,
        this.__validateAllowedKey__
      );
      return;
    }
    this.__draft__ = processValueWithValidate(
      this.__processValue__({ ...this.__value__, ...this.__draft__ }),
      this.__validateAllowedKey__
    );
    this.__expired__ = false;
    this.__processComputedProperties__(this.__draft__);
    this.__emitChange__(
      isolation ? SetValueOption.IsolateReset : SetValueOption.Reset
    );
  }
  /**
   * Creates a validator function that determines whether a property key is allowed
   * based on the current oneOf and anyOf selections.
   * @returns Function that validates if a property key should be included in the object value
   * @private
   */
  __createAllowedKeyValidator__() {
    return (key) => {
      if (this.__oneOfKeySet__?.has(key) && this.__oneOfKeySetList__ !== void 0)
        if (this.__oneOfIndex__ > -1)
          return this.__oneOfKeySetList__[this.__oneOfIndex__].has(key);
        else return false;
      if (this.__anyOfKeySet__?.has(key) && this.__anyOfKeySetList__ !== void 0)
        if (this.__anyOfIndices__.length > 0) {
          for (let i = 0, l = this.__anyOfIndices__.length; i < l; i++)
            if (this.__anyOfKeySetList__[this.__anyOfIndices__[i]].has(key))
              return true;
          return false;
        } else return false;
      return true;
    };
  }
  /**
   * Prepares the process computed properties.
   * @private
   */
  __prepareProcessComputedProperties__() {
    this.__host__.subscribe(({ type, options }) => {
      if (type & NodeEventType.UpdateValue) {
        if (options?.[NodeEventType.UpdateValue]?.settled) return;
        if (this.__processComputedProperties__(this.__value__)) return;
        this.__emitChange__(
          SetValueOption.BatchedEmitChange | SetValueOption.Automatic
        );
      }
    });
  }
  /**
   * Excludes values of invisible child elements from the computed value.
   * @param source - Source object to check
   * @returns Whether the computed properties were processed
   * @private
   */
  __processComputedProperties__(source) {
    if (!source || !this.__draft__) return false;
    let noop = true;
    for (let i = 0, l = this.__children__.length; i < l; i++) {
      const node = this.__children__[i].node;
      if (node.type === "virtual") continue;
      if (node.active) continue;
      const name = node.name;
      if (source[name] === void 0) continue;
      this.__draft__[name] = void 0;
      if (noop) noop = false;
    }
    return noop;
  }
  /**
   * Propagates activation to all child nodes.
   * @internal Internal implementation method. Do not call directly.
   */
  initialize() {
    let enabled = false;
    for (let i = 0, l = this.__subnodes__.length; i < l; i++) {
      const childNode = this.__subnodes__[i].node;
      childNode.__initialize__(this.__host__);
      if (!enabled && childNode.__computeManager__.isEnabled) enabled = true;
    }
    if (enabled) this.__prepareProcessComputedProperties__();
    this.__primeInitialBranch__();
    this.__processChildren__();
  }
  /**
   * Snaps active oneOf/anyOf maps once at init,
   * ahead of the UpdateComputedProperties cascade,
   * so React's first `useState(node.children)` reads the complete list.
   * @private
   */
  __primeInitialBranch__() {
    if (this.__oneOfChildNodeMapList__) {
      const index = this.__host__.oneOfIndex;
      if (index > -1)
        this.__oneOfChildNodeMap__ = this.__oneOfChildNodeMapList__[index];
    }
    if (this.__anyOfChildNodeMapList__) {
      const indices = this.__host__.anyOfIndices;
      if (indices.length > 0) {
        const maps = new Array(indices.length);
        for (let i = 0, l = indices.length; i < l; i++)
          maps[i] = this.__anyOfChildNodeMapList__[indices[i]];
        this.__anyOfChildNodeMaps__ = maps;
      }
    }
  }
};

// packages/canard/schema-form/src/__legacy__/core/nodes/ObjectNode/strategies/TerminalStrategy/TerminalStrategy.ts
var import_array8 = require("@winglet/common-utils/array");
var import_object13 = require("@winglet/common-utils/object");
var TerminalStrategy2 = class {
  /**
   * Emits a value change event.
   * @param input - New object value
   * @param option - Option settings (default: SetValueOption.Default)
   * @private
   */
  __emitChange__(input, option = SetValueOption.Default) {
    const host = this.__host__;
    const normalize = (option & SetValueOption.Normalize) > 0;
    const retain = (option & SetValueOption.Replace) === 0;
    const inject = (option & SetValueOption.PreventInjection) === 0;
    const previous = this.__value__ ? { ...this.__value__ } : this.__value__;
    const current = this.__parseValue__(input, normalize);
    if (retain && host.__equals__(previous, current))
      return host.__forwardUnchangedWrite__(current, option);
    this.__value__ = current;
    if ((option & SetValueOption.Automatic) === 0)
      this.__host__.__markIntendedWrite__();
    if (option & SetValueOption.EmitChange)
      this.__handleChange__(
        current,
        (option & SetValueOption.Batch) > 0,
        (option & SetValueOption.Automatic) > 0
      );
    if (option & SetValueOption.Refresh)
      host.publish(NodeEventType.RequestRefresh);
    if (option & SetValueOption.PublishUpdateEvent)
      host.publish(
        NodeEventType.UpdateValue,
        current,
        { previous, current, inject },
        host.initialized
      );
  }
  /**
   * Parses input value into appropriate object format.
   * @param input - Value to parse
   * @returns {ObjectValue|undefined} Parsed object value or undefined
   * @private
   */
  __parseValue__(input, normalize) {
    if (input === void 0) return void 0;
    if (input === null && this.__host__.nullable) return null;
    return (0, import_object13.sortObjectKeys)(parseObject(input), this.__propertyKeys__, {
      ignoreUndefinedKey: this.__ignoreAdditionalProperties__ || normalize,
      ignoreUndefinedValue: true
    });
  }
  /**
   * Gets the current value of the object.
   * @returns Current value of the object node or undefined (if empty) or null (if nullable)
   */
  get value() {
    return this.__value__;
  }
  /**
   * Applies input value to the object node.
   * @param input - Object value to set
   * @param option - Setting options
   */
  applyValue(input, option) {
    this.__emitChange__(input, option);
  }
  /**
   * Gets the list of child nodes.
   * @returns Empty array (Terminal strategy does not manage child nodes)
   */
  get children() {
    return null;
  }
  /**
   * Gets the list of subnodes.
   * @returns Empty array (Terminal strategy does not manage subnodes)
   */
  get subnodes() {
    return null;
  }
  /**
   * Initializes the TerminalStrategy object.
   * @param host - Host ObjectNode object
   * @param handleChange - Value change handler
   * @param handleRefresh - Refresh handler
   * @param handleSetDefaultValue - Default value setting handler
   */
  constructor(host, handleChange) {
    this.__host__ = host;
    this.__handleChange__ = handleChange;
    const jsonSchema = host.jsonSchema;
    this.__ignoreAdditionalProperties__ = jsonSchema.additionalProperties === false;
    this.__propertyKeys__ = (0, import_array8.sortWithReference)(
      (0, import_object13.getObjectKeys)(jsonSchema.properties),
      jsonSchema.propertyKeys
    );
    const defaultValue = this.__parseValue__(
      getObjectDefaultValue(jsonSchema, host.defaultValue)
    );
    host.__setDefaultValue__(defaultValue);
    this.__emitChange__(defaultValue);
  }
};

// packages/canard/schema-form/src/__legacy__/core/nodes/ObjectNode/utils/omitEmptyObject/omitEmptyObject.ts
var import_filter41 = require("@winglet/common-utils/filter");
var omitEmptyObject = (value) => (0, import_filter41.isEmptyObject)(value) ? void 0 : value;

// packages/canard/schema-form/src/__legacy__/core/nodes/ObjectNode/ObjectNode.ts
var ObjectNode = class extends AbstractNode {
  constructor(properties) {
    super(properties);
    this.type = "object";
    const handleChange = this.jsonSchema.options?.omitEmpty === false ? (value, batch, automatic) => super.onChange(value, batch, automatic) : (value, batch, automatic) => super.onChange(omitEmptyObject(value), batch, automatic);
    this.onChange = handleChange;
    this.__strategy__ = this.group === "terminal" ? new TerminalStrategy2(this, handleChange) : new BranchStrategy2(this, handleChange, properties.nodeFactory);
    this.__initialize__();
  }
  /** Active child nodes within the current scope. */
  get children() {
    return this.__strategy__.children;
  }
  /** All child nodes regardless of scope or active state. */
  get subnodes() {
    return this.__strategy__.subnodes;
  }
  /** @internal */
  __equals__(left, right) {
    return (0, import_object14.equals)(left, right);
  }
  applyValue(input, option) {
    this.__strategy__.applyValue(input, option);
  }
  /** Current object value or `undefined`. */
  get value() {
    return this.__strategy__.value;
  }
  set value(input) {
    this.setValue(input);
  }
  /** @internal */
  __initialize__(actor) {
    if (super.__initialize__(actor)) {
      this.__strategy__.initialize?.();
      return true;
    }
    return false;
  }
  /**
   * Rebuilds the object the way a form without a default value builds it.
   * @param input - Value the parent's schema default assigns to this object; its own schema default when `undefined`
   * @internal A strategy with child nodes rebuilds its subtree; one without falls back to the node-level reset.
   */
  __resetToBlank__(input) {
    if (this.__strategy__.resetToBlank) this.__strategy__.resetToBlank(input);
    else super.__resetToBlank__(input);
  }
};

// packages/canard/schema-form/src/__legacy__/core/nodes/StringNode/StringNode.ts
var StringNode = class extends AbstractNode {
  constructor(properties) {
    super(properties);
    this.type = "string";
    /** @internal Current value of the string node. */
    this.__value__ = void 0;
    this.onChange = this.jsonSchema.options?.omitEmpty !== false ? this.__onChangeWithOmitEmpty__ : super.onChange;
    if (this.defaultValue !== void 0) this.__emitChange__(this.defaultValue);
    if (this.jsonSchema.options?.trim === true)
      this.subscribe(({ type }) => {
        if (type & NodeEventType.Blurred)
          this.__value__ != null && this.__emitChange__(this.__value__.trim());
      });
    this.__initialize__();
  }
  /**
   * @internal Parses the input value as a string.
   * @param input - The value to parse
   */
  __parseValue__(input) {
    if (input === void 0) return void 0;
    if (input === null && this.nullable) return null;
    return parseString(input);
  }
  /**
   * @internal Reflects value changes and publishes related events.
   * @param input - The value to set
   * @param option - Set value options
   */
  __emitChange__(input, option = SetValueOption.Default) {
    const retain = (option & SetValueOption.Replace) === 0;
    const inject = (option & SetValueOption.PreventInjection) === 0;
    const previous = this.__value__;
    const current = this.__parseValue__(input);
    if (retain && this.__equals__(previous, current))
      return this.__forwardUnchangedWrite__(current, option);
    this.__value__ = current;
    if ((option & SetValueOption.Automatic) === 0) this.__markIntendedWrite__();
    if (option & SetValueOption.EmitChange)
      this.onChange(
        current,
        (option & SetValueOption.Batch) > 0,
        (option & SetValueOption.Automatic) > 0
      );
    if (option & SetValueOption.Refresh)
      this.publish(NodeEventType.RequestRefresh);
    if (option & SetValueOption.PublishUpdateEvent)
      this.publish(
        NodeEventType.UpdateValue,
        current,
        { previous, current, inject },
        this.initialized
      );
  }
  /**
   * @internal Reflects value changes excluding empty values.
   * @param input - The value to set
   * @param batch - Whether the change should be batched
   * @param automatic - Whether the form produced this value by itself
   */
  __onChangeWithOmitEmpty__(input, batch, automatic) {
    if (input === null) super.onChange(null, batch, automatic);
    else if (input === void 0 || input.length === 0)
      super.onChange(void 0, batch, automatic);
    else super.onChange(input, batch, automatic);
  }
  applyValue(input, option) {
    this.__emitChange__(input, option);
  }
  /** Current string value or `undefined`. */
  get value() {
    return this.__value__;
  }
  set value(input) {
    this.setValue(input);
  }
};

// packages/canard/schema-form/src/__legacy__/core/nodes/VirtualNode/VirtualNode.ts
var import_array9 = require("@winglet/common-utils/array");
var VirtualNode = class extends AbstractNode {
  constructor(properties) {
    super(properties);
    this.type = "virtual";
    /** @internal Current value of the virtual node. */
    this.__value__ = [];
    /** @internal List of reference nodes. */
    this.__refNodes__ = [];
    this.__refNodes__ = properties.refNodes || [];
    if (this.defaultValue != null) this.__value__ = this.defaultValue;
    for (let i = 0, l = this.__refNodes__.length; i < l; i++) {
      const node = this.__refNodes__[i];
      const unsubscribe = node.subscribe(({ type, payload }) => {
        if (type & NodeEventType.UpdateValue) {
          const value = payload?.[NodeEventType.UpdateValue];
          const previous = this.__value__;
          if (previous[i] === value) return;
          const current = [...previous];
          current[i] = value;
          this.__value__ = current;
          this.publish(
            NodeEventType.UpdateValue,
            current,
            { previous, current, inject: true },
            true
          );
        }
      });
      this.saveUnsubscribe(unsubscribe);
    }
    this.__children__ = (0, import_array9.map)(this.__refNodes__, (node) => ({ node }));
    this.publish(NodeEventType.UpdateChildren);
    this.__initialize__();
  }
  /**
   * @internal Propagates value changes to reference nodes and publishes related events.
   * @param values - The values to set
   * @param option - Set value options
   */
  __emitChange__(values, option = SetValueOption.Default) {
    const refNodesLength = this.__refNodes__.length;
    if (values !== void 0 && values?.length !== refNodesLength)
      throw new JSONSchemaError(
        "INVALID_VIRTUAL_NODE_VALUES",
        formatInvalidVirtualNodeValuesError(
          refNodesLength,
          values?.length,
          values
        ),
        {
          expectedValuesLength: refNodesLength,
          actualValuesLength: values?.length,
          providedValues: values
        }
      );
    const inject = (option & SetValueOption.PreventInjection) === 0;
    const refNodes = this.__refNodes__;
    const previous = this.__value__;
    const current = [...previous];
    if (values === void 0)
      for (let i = 0; i < refNodesLength; i++) {
        refNodes[i].setValue(void 0, option);
        current[i] = void 0;
      }
    else
      for (let i = 0; i < refNodesLength; i++) {
        const node = refNodes[i];
        const value = values[i];
        if (node.value === value) continue;
        node.setValue(value, option);
        current[i] = node.value;
      }
    this.__value__ = current;
    if (option & SetValueOption.Refresh)
      this.publish(NodeEventType.RequestRefresh);
    if (option & SetValueOption.PublishUpdateEvent)
      this.publish(
        NodeEventType.UpdateValue,
        current,
        { previous, current, inject },
        this.initialized
      );
  }
  applyValue(input, option) {
    this.__emitChange__(input, option);
  }
  /** Array of values from all referenced nodes. */
  get value() {
    return this.__value__;
  }
  set value(input) {
    this.setValue(input);
  }
  /** Child nodes representing the referenced nodes. */
  get children() {
    return this.__children__;
  }
};

// packages/canard/schema-form/src/__legacy__/core/nodes/schemaNodeFactory.ts
var createSchemaNodeFactory = (resolveSchema) => (props) => {
  const nodeProps = resolveReferences(props, resolveSchema);
  switch (nodeProps.schemaType) {
    case "boolean":
      return new BooleanNode(
        nodeProps
      );
    case "number":
    case "integer":
      return new NumberNode(
        nodeProps
      );
    case "string":
      return new StringNode(
        nodeProps
      );
    case "array":
      if (nodeProps.jsonSchema.items)
        nodeProps.jsonSchema.items = processSchema(
          nodeProps.jsonSchema.items,
          resolveSchema
        );
      if ((0, import_filter42.isArray)(nodeProps.jsonSchema.prefixItems))
        nodeProps.jsonSchema.prefixItems = (0, import_array10.map)(
          nodeProps.jsonSchema.prefixItems,
          (schema) => processSchema(schema, resolveSchema)
        );
      validateArraySchema(nodeProps.jsonSchema);
      return new ArrayNode(
        nodeProps
      );
    case "object":
      return new ObjectNode(
        nodeProps
      );
    case "null":
      return new NullNode(
        nodeProps
      );
    case "virtual":
      return new VirtualNode(
        nodeProps
      );
  }
  throw new JSONSchemaError(
    "UNKNOWN_JSON_SCHEMA",
    formatUnknownJSONSchemaError(
      nodeProps.jsonSchema.type,
      nodeProps.jsonSchema
    ),
    {
      jsonSchema: nodeProps.jsonSchema
    }
  );
};
var processSchema = (schema, resolve) => {
  if (resolve) schema = resolve(schema) || schema;
  return processAllOfSchema(schema);
};
var resolveReferences = (nodeProps, resolve) => {
  nodeProps.jsonSchema = processSchema(nodeProps.jsonSchema, resolve);
  const schemaInfo = extractSchemaInfo(nodeProps.jsonSchema);
  if (schemaInfo === null) return nodeProps;
  nodeProps.schemaType = schemaInfo.type;
  nodeProps.nullable = schemaInfo.nullable;
  return nodeProps;
};

// packages/canard/schema-form/src/__legacy__/core/nodeFromJSONSchema.ts
var nodeFromJSONSchema = ({
  jsonSchema,
  defaultValue,
  onChange,
  validationMode,
  validatorFactory,
  contextNode
}) => {
  const resolveSchema = getResolveSchema(jsonSchema);
  const nodeFactory = createSchemaNodeFactory(resolveSchema);
  return nodeFactory({
    jsonSchema,
    defaultValue,
    nodeFactory,
    onChange,
    validationMode,
    validatorFactory,
    contextNode
  });
};

// packages/aileron/benchmark-form/src/fixtures/scale-schemas.ts
function buildFlatSchema(fieldCount) {
  const properties = {};
  for (let i = 0; i < fieldCount; i++) {
    const key = `field_${String(i).padStart(3, "0")}`;
    properties[key] = { type: "string", default: `value_${i}` };
  }
  return {
    type: "object",
    properties
  };
}
function buildNestedSchema(depth, fanout) {
  function buildLevel(currentDepth) {
    if (currentDepth === 0) {
      return { type: "string", default: "leaf" };
    }
    const properties = {};
    for (let i = 0; i < fanout; i++) {
      properties[`n${i}`] = buildLevel(currentDepth - 1);
    }
    return { type: "object", properties };
  }
  return buildLevel(depth);
}
function buildArraySchema(itemCount) {
  const defaultItems = Array.from({ length: itemCount }, (_, i) => ({
    id: `id-${i}`,
    name: `name-${i}`,
    active: i % 2 === 0
  }));
  return {
    type: "object",
    properties: {
      items: {
        type: "array",
        default: defaultItems,
        items: {
          type: "object",
          properties: {
            id: { type: "string" },
            name: { type: "string" },
            active: { type: "boolean" }
          }
        }
      }
    }
  };
}
function buildOneOfHeavySchema(branchCount) {
  const oneOf = [];
  for (let i = 0; i < branchCount; i++) {
    oneOf.push({
      type: "object",
      properties: {
        kind: { type: "string", enum: [`kind_${i}`], default: `kind_${i}` },
        [`payload_${i}_a`]: { type: "string", default: `a_${i}` },
        [`payload_${i}_b`]: { type: "number", default: i },
        [`payload_${i}_c`]: { type: "boolean", default: i % 2 === 0 }
      },
      required: ["kind"]
    });
  }
  return {
    type: "object",
    properties: {
      common: { type: "string", default: "shared" }
    },
    oneOf
  };
}
var FLAT_CASES = [
  { label: "flat-50", schema: buildFlatSchema(50) },
  { label: "flat-100", schema: buildFlatSchema(100) },
  { label: "flat-500", schema: buildFlatSchema(500) }
];
var NESTED_CASES = [
  { label: "nested-d3-f4", schema: buildNestedSchema(3, 4) },
  { label: "nested-d5-f4", schema: buildNestedSchema(5, 4) }
];
var ARRAY_CASES = [
  { label: "array-100", schema: buildArraySchema(100) },
  { label: "array-500", schema: buildArraySchema(500) },
  { label: "array-1000", schema: buildArraySchema(1e3) }
];
var ONEOF_HEAVY_CASES = [
  { label: "oneOf-5", schema: buildOneOfHeavySchema(5) },
  { label: "oneOf-10", schema: buildOneOfHeavySchema(10) },
  { label: "oneOf-20", schema: buildOneOfHeavySchema(20) }
];

// packages/aileron/benchmark-form/fixtures/equivalent/arrays.ts
var items = Array.from({ length: 200 }, (_, index) => ({
  id: `s-${index}`,
  name: `item-${index}`,
  active: index % 2 === 0
}));
var pushes = items.slice(0, 100).map((value) => ({
  kind: "push",
  path: "/items",
  value
}));
var arrayFixtures = [
  {
    name: "array-push-100",
    legacy: buildArraySchema(0),
    workspace: buildArraySchema(0),
    interactions: pushes
  },
  {
    name: "array-replace-200",
    legacy: buildArraySchema(0),
    workspace: buildArraySchema(0),
    interactions: [{ kind: "set", path: "/items", value: items }]
  },
  {
    name: "array-push-remove-100",
    legacy: buildArraySchema(0),
    workspace: buildArraySchema(0),
    interactions: [
      ...pushes,
      ...Array.from({ length: 100 }, (_, index) => ({
        kind: "remove",
        path: "/items",
        index: 99 - index
      }))
    ]
  }
];

// packages/aileron/benchmark-form/fixtures/equivalent/branches.ts
var branchFixtures = [5, 10, 20].map((count) => ({
  name: `oneOf-${count}`,
  legacy: {
    type: "object",
    properties: {
      common: { type: "string", default: "shared" },
      kind: { type: "string", default: "kind_0" }
    },
    oneOf: Array.from({ length: count }, (_, index) => ({
      "&if": `./kind === 'kind_${index}'`,
      properties: {
        [`payload_${index}_a`]: { type: "string", default: `a_${index}` },
        [`payload_${index}_b`]: { type: "number", default: index },
        [`payload_${index}_c`]: { type: "boolean", default: index % 2 === 0 }
      }
    }))
  },
  workspace: {
    type: "object",
    properties: {
      common: { type: "string", default: "shared" },
      kind: { type: "string", default: "kind_0" }
    },
    oneOf: Array.from({ length: count }, (_, index) => ({
      controls: { active: `./kind === 'kind_${index}'` },
      properties: {
        [`payload_${index}_a`]: { type: "string", default: `a_${index}` },
        [`payload_${index}_b`]: { type: "number", default: index },
        [`payload_${index}_c`]: { type: "boolean", default: index % 2 === 0 }
      }
    }))
  },
  interactions: [
    { kind: "set", path: "/kind", value: `kind_${count - 1}` },
    { kind: "set", path: "/kind", value: "kind_0" }
  ]
}));

// packages/aileron/benchmark-form/fixtures/equivalent/derived.ts
var derivedFixture = {
  name: "computed-visible-derived",
  legacy: {
    type: "object",
    properties: {
      trigger: { type: "string", default: "on" },
      source: { type: "number", default: 1 },
      target: { type: "number", computed: { derived: "../source * 2" } },
      detail: { type: "string", computed: { visible: '../trigger === "on"' } }
    }
  },
  workspace: {
    type: "object",
    properties: {
      trigger: { type: "string", default: "on" },
      source: { type: "number", default: 1 },
      target: { type: "number", controls: { derived: "../source * 2" } },
      detail: { type: "string", controls: { visible: '../trigger === "on"' } }
    }
  },
  interactions: [
    { kind: "set", path: "/source", value: 3 },
    { kind: "set", path: "/trigger", value: "off" },
    { kind: "set", path: "/trigger", value: "on" }
  ]
};

// packages/aileron/benchmark-form/src/fixtures/schemas.ts
var sampleSchemas = [
  // 간단한 폼
  {
    type: "object",
    properties: {
      name: {
        type: "string",
        default: "John Doe"
      },
      email: {
        type: "string",
        format: "email",
        default: "john.doe@example.com"
      }
    },
    required: ["name", "email"]
  },
  // 중간 크기 폼
  {
    type: "object",
    properties: {
      personalInfo: {
        type: "object",
        properties: {
          firstName: { type: "string", default: "John" },
          lastName: { type: "string", default: "Doe" },
          age: { type: "number", default: 30 },
          email: {
            type: "string",
            format: "email",
            default: "john.doe@example.com"
          }
        },
        required: ["firstName", "lastName", "email"]
      },
      address: {
        type: "object",
        properties: {
          street: { type: "string", default: "123 Main St" },
          city: { type: "string", default: "Anytown" },
          country: { type: "string", default: "USA" }
        },
        required: ["street", "city"]
      }
    },
    required: ["personalInfo"]
  },
  // 복잡한 폼
  {
    type: "object",
    properties: {
      users: {
        type: "array",
        items: {
          type: "object",
          properties: {
            id: { type: "string", default: "1234567890" },
            name: { type: "string", default: "John Doe" },
            roles: {
              type: "array",
              items: {
                type: "string",
                enum: ["admin", "user", "guest"],
                default: "user"
              }
            },
            settings: {
              type: "object",
              properties: {
                theme: {
                  type: "string",
                  enum: ["light", "dark"],
                  default: "light"
                },
                notifications: { type: "boolean", default: true },
                language: { type: "string", default: "en" }
              }
            }
          },
          required: ["id", "name", "roles"]
        }
      },
      metadata: {
        type: "object",
        properties: {
          created: {
            type: "string",
            format: "date-time",
            default: "2021-01-01"
          },
          modified: {
            type: "string",
            format: "date-time",
            default: "2021-01-01"
          },
          tags: {
            type: "array",
            items: { type: "string", default: "tag1" }
          }
        }
      }
    },
    required: ["users"]
  },
  // 매우 복잡한 폼
  {
    title: "Application Data Schema",
    description: "\uC0AC\uC6A9\uC790 \uC815\uBCF4, \uBA54\uD0C0\uB370\uC774\uD130, \uD398\uC774\uC9D5 \uBC0F \uB9C1\uD06C\uB97C \uD3EC\uD568\uD55C \uBCF5\uD569 \uB3C4\uBA54\uC778 \uC2A4\uD0A4\uB9C8",
    type: "object",
    additionalProperties: false,
    required: ["users", "metadata"],
    properties: {
      users: {
        type: "array",
        description: "\uC2DC\uC2A4\uD15C\uC5D0 \uB4F1\uB85D\uB41C \uC0AC\uC6A9\uC790 \uBAA9\uB85D",
        minItems: 1,
        uniqueItems: true,
        items: {
          type: "object",
          description: "\uAC1C\uBCC4 \uC0AC\uC6A9\uC790 \uC815\uBCF4",
          additionalProperties: false,
          required: ["id", "username", "email", "roles"],
          properties: {
            id: {
              type: "string",
              format: "uuid",
              default: "123e4567-e89b-12d3-a456-426614174000"
            },
            username: {
              type: "string",
              pattern: "^[A-Za-z0-9_]{3,30}$",
              description: "3~30\uC790\uC758 \uC601\uBB38, \uC22B\uC790, \uC5B8\uB354\uC2A4\uCF54\uC5B4",
              default: "john_doe"
            },
            email: {
              type: "string",
              format: "email",
              default: "john.doe@example.com"
            },
            roles: {
              type: "array",
              description: "\uC0AC\uC6A9\uC790 \uAD8C\uD55C",
              minItems: 1,
              uniqueItems: true,
              items: {
                type: "string",
                enum: ["admin", "user", "guest", "moderator"],
                default: "user"
              }
            },
            settings: {
              type: "object",
              description: "UI \uBC0F \uC54C\uB9BC \uC124\uC815",
              additionalProperties: false,
              properties: {
                theme: {
                  type: "string",
                  enum: ["light", "dark", "system"],
                  default: "light"
                },
                notifications: {
                  type: "object",
                  description: "\uC54C\uB9BC \uCC44\uB110\uBCC4 \uD5C8\uC6A9 \uC5EC\uBD80",
                  additionalProperties: false,
                  properties: {
                    email: { type: "boolean", default: true },
                    sms: { type: "boolean", default: true },
                    push: { type: "boolean", default: true }
                  }
                },
                language: {
                  type: "string",
                  pattern: "^[a-z]{2}(-[A-Z]{2})?$",
                  description: "ISO \uC5B8\uC5B4 \uCF54\uB4DC (\uC608: en, ko-KR)",
                  default: "en"
                }
              }
            },
            profile: {
              type: "object",
              description: "\uD504\uB85C\uD544 \uC815\uBCF4",
              additionalProperties: false,
              required: ["firstName", "lastName"],
              properties: {
                firstName: { type: "string", minLength: 1, default: "John" },
                lastName: { type: "string", minLength: 1, default: "Doe" },
                birthDate: {
                  type: "string",
                  format: "date",
                  default: "1990-01-01"
                },
                gender: {
                  type: "string",
                  enum: ["male", "female", "other"],
                  default: "male"
                }
              }
            },
            addresses: {
              type: "array",
              description: "\uC8FC\uC18C \uBAA9\uB85D",
              minItems: 0,
              items: {
                type: "object",
                description: "\uC8FC\uC18C \uC815\uBCF4",
                additionalProperties: false,
                required: ["type", "line1", "city", "country"],
                properties: {
                  type: {
                    type: "string",
                    enum: ["home", "work", "other"],
                    default: "home"
                  },
                  line1: { type: "string", default: "123 Main St" },
                  line2: { type: "string", default: "Apt 1" },
                  city: { type: "string", default: "Anytown" },
                  state: { type: "string", default: "CA" },
                  postalCode: {
                    type: "string",
                    pattern: "^[0-9A-Za-z \\-]+$",
                    default: "12345"
                  },
                  country: {
                    type: "string",
                    default: "USA",
                    description: "ISO \uAD6D\uAC00 \uCF54\uB4DC"
                  }
                }
              }
            },
            friends: {
              type: "array",
              description: "\uCE5C\uAD6C \uC0AC\uC6A9\uC790 ID \uBAA9\uB85D",
              uniqueItems: true,
              items: {
                type: "string",
                format: "uuid",
                default: "123e4567-e89b-12d3-a456-426614174000"
              }
            },
            createdAt: {
              type: "string",
              format: "date-time",
              default: "2021-01-01"
            },
            updatedAt: {
              type: "string",
              format: "date-time",
              default: "2021-01-01"
            },
            preferences: {
              type: "object",
              description: "\uC0AC\uC6A9\uC790 \uC120\uD638 \uC124\uC815",
              additionalProperties: false,
              properties: {
                newsletter: { type: "boolean", default: true },
                targetedAds: { type: "boolean", default: true }
              }
            }
          }
        }
      },
      metadata: {
        type: "object",
        description: "\uC804\uCCB4 \uB370\uC774\uD130 \uC0DD\uC131 \uBC0F \uC218\uC815 \uC815\uBCF4",
        additionalProperties: false,
        required: ["created", "modified"],
        properties: {
          created: {
            type: "string",
            format: "date-time",
            default: "2021-01-01"
          },
          modified: {
            type: "string",
            format: "date-time",
            default: "2021-01-01"
          },
          version: {
            type: "string",
            pattern: "^\\d+\\.\\d+\\.\\d+$",
            default: "1.0.0"
          },
          tags: {
            type: "array",
            items: { type: "string", default: "tag1" },
            uniqueItems: true
          }
        }
      },
      pagination: {
        type: "object",
        description: "\uD398\uC774\uC9D5 \uC815\uBCF4",
        additionalProperties: false,
        required: ["page", "pageSize", "totalItems", "totalPages"],
        properties: {
          page: { type: "integer", minimum: 1, default: 1 },
          pageSize: { type: "integer", minimum: 1, default: 10 },
          totalItems: { type: "integer", minimum: 0, default: 100 },
          totalPages: { type: "integer", minimum: 1, default: 10 }
        }
      },
      links: {
        type: "object",
        description: "\uAD00\uB828 \uB9AC\uC18C\uC2A4 \uB9C1\uD06C",
        additionalProperties: false,
        properties: {
          self: {
            type: "string",
            format: "uri",
            default: "https://example.com/self"
          },
          next: {
            type: "string",
            format: "uri",
            default: "https://example.com/next"
          },
          prev: {
            type: "string",
            format: "uri",
            default: "https://example.com/prev"
          }
        }
      }
    }
  }
];

// packages/aileron/benchmark-form/fixtures/equivalent/mounts.ts
var mountFixtures = [
  ...sampleSchemas.map((schema, index) => ({
    name: `sample-${index}`,
    legacy: schema,
    workspace: index === 3 ? {
      ...structuredClone(schema),
      properties: {
        ...structuredClone(schema.properties),
        // The workspace core preserves empty arrays; seed the legacy minItems view explicitly.
        users: {
          ...structuredClone(schema.properties.users),
          default: [
            {
              id: "123e4567-e89b-12d3-a456-426614174000",
              username: "john_doe",
              email: "john.doe@example.com",
              roles: ["user"],
              settings: {
                theme: "light",
                notifications: { email: true, sms: true, push: true },
                language: "en"
              },
              profile: {
                firstName: "John",
                lastName: "Doe",
                birthDate: "1990-01-01",
                gender: "male"
              },
              addresses: [],
              friends: [],
              createdAt: "2021-01-01",
              updatedAt: "2021-01-01",
              preferences: { newsletter: true, targetedAds: true }
            }
          ]
        }
      }
    } : structuredClone(schema),
    interactions: [
      {
        kind: "set",
        path: [
          "/name",
          "/personalInfo/firstName",
          "/metadata/created",
          "/metadata/version"
        ][index],
        value: index === 3 ? "2.0.0" : "changed"
      }
    ]
  })),
  ...[...FLAT_CASES, ...NESTED_CASES, ...ARRAY_CASES].map(
    ({ label, schema }) => ({
      name: label,
      legacy: schema,
      workspace: structuredClone(schema),
      interactions: label.startsWith("flat") ? Array.from({ length: 10 }, (_, index) => ({
        kind: "set",
        path: `/field_${String(index).padStart(3, "0")}`,
        value: `changed-${index}`
      })) : label.startsWith("nested") ? Array.from({ length: 10 }, (_, index) => ({
        kind: "set",
        path: `${"/n0".repeat(label.includes("d5") ? 3 : 1)}/n${Math.floor(index / 4)}/n${index % 4}`,
        value: `changed-${index}`
      })) : [{ kind: "set", path: "/items/0/name", value: "changed" }]
    })
  )
];

// packages/aileron/benchmark-form/fixtures/equivalent/index.ts
var equivalentFixtures = [
  ...mountFixtures,
  ...branchFixtures,
  ...arrayFixtures,
  derivedFixture
];
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  equivalentFixtures,
  nodeFromJSONSchema
});
