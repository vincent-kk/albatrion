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

// packages/canard/schema-form/src/core/blueprint/utils/analyze/buildNodes.ts
var import_filter16 = require("@winglet/common-utils/filter");

// packages/canard/schema-form/src/core/blueprint/utils/effectiveSchema/utils/constant.ts
var DEFAULT_NO_ACTIVE = /* @__PURE__ */ new WeakMap();

// packages/canard/schema-form/src/core/blueprint/utils/effectiveSchema/utils/ensureEffectiveSchemaCache.ts
var ensureEffectiveSchemaCache = (memo, node, options) => {
  const mode = options.mode ?? "runtime";
  const entries = memo.get(node) ?? [];
  const found = entries.find(
    (entry) => entry.mode === mode && entry.isAtomic === options.isAtomic
  );
  if (found) return found.schemas;
  const schemas = /* @__PURE__ */ new Map();
  entries.push({ mode, isAtomic: options.isAtomic, schemas });
  memo.set(node, entries);
  return schemas;
};

// packages/canard/schema-form/src/core/blueprint/utils/effectiveSchema/utils/mergeSchemaContributions.ts
var import_filter5 = require("@winglet/common-utils/filter");

// packages/canard/schema-form/src/core/blueprint/utils/effectiveSchema/utils/applySchemaContribution.ts
var import_filter3 = require("@winglet/common-utils/filter");

// packages/canard/schema-form/src/core/blueprint/utils/effectiveSchema/utils/applyConstraintKeywords.ts
var import_filter = require("@winglet/common-utils/filter");

// packages/canard/schema-form/src/helpers/schemaIntersection/utils/constant.ts
var EMPTY_INTERSECTION = Symbol("EMPTY_INTERSECTION");

// packages/canard/schema-form/src/helpers/schemaIntersection/utils/intersectConst.ts
var import_object = require("@winglet/common-utils/object");
var intersectConst = (baseConst, sourceConst) => {
  if (baseConst === void 0) return sourceConst;
  if (sourceConst === void 0) return baseConst;
  return (0, import_object.equals)(baseConst, sourceConst) ? baseConst : EMPTY_INTERSECTION;
};

// packages/canard/schema-form/src/helpers/schemaIntersection/utils/intersectEnum.ts
var import_array = require("@winglet/common-utils/array");
var import_object2 = require("@winglet/common-utils/object");
var intersectEnum = (baseEnum, sourceEnum, deepEqual) => {
  if (!baseEnum) return sourceEnum;
  if (!sourceEnum) return baseEnum;
  const values = deepEqual ? (0, import_array.intersectionWith)(baseEnum, sourceEnum, import_object2.equals) : (0, import_array.intersectionLite)(baseEnum, sourceEnum);
  return values.length ? values : EMPTY_INTERSECTION;
};

// packages/canard/schema-form/src/helpers/schemaIntersection/utils/intersectMaximum.ts
var import_math = require("@winglet/common-utils/math");
var intersectMaximum = (baseMax, sourceMax) => {
  if (baseMax === void 0) return sourceMax;
  if (sourceMax === void 0) return baseMax;
  return (0, import_math.minLite)(baseMax, sourceMax);
};

// packages/canard/schema-form/src/helpers/schemaIntersection/utils/intersectMinimum.ts
var import_math2 = require("@winglet/common-utils/math");
var intersectMinimum = (baseMin, sourceMin) => {
  if (baseMin === void 0) return sourceMin;
  if (sourceMin === void 0) return baseMin;
  return (0, import_math2.maxLite)(baseMin, sourceMin);
};

// packages/canard/schema-form/src/helpers/schemaIntersection/utils/intersectMultipleOf.ts
var import_math3 = require("@winglet/common-utils/math");
var intersectMultipleOf = (baseMultiple, sourceMultiple) => {
  const base = Number.isFinite(baseMultiple) ? baseMultiple : void 0;
  const source = Number.isFinite(sourceMultiple) ? sourceMultiple : void 0;
  if (base === void 0) return source;
  if (source === void 0) return base;
  return (0, import_math3.lcm)(base, source);
};

// packages/canard/schema-form/src/helpers/schemaIntersection/utils/validateRange.ts
var validateRange = (min, max) => min !== void 0 && max !== void 0 && min > max ? EMPTY_INTERSECTION : void 0;

// packages/canard/schema-form/src/core/blueprint/utils/diagnostics/constant.ts
var BlueprintErrorCode = {
  UnknownJsonSchema: "UNKNOWN_JSON_SCHEMA",
  UnexpectedArraySchema: "UNEXPECTED_ARRAY_SCHEMA",
  AllOfTypeRedefinition: "ALL_OF_TYPE_REDEFINITION",
  ConflictingConstValues: "CONFLICTING_CONST_VALUES",
  InvalidRange: "INVALID_RANGE",
  EmptyEnumIntersection: "EMPTY_ENUM_INTERSECTION",
  VirtualFieldsNotValid: "VIRTUAL_FIELDS_NOT_VALID",
  VirtualFieldsNotInProperties: "VIRTUAL_FIELDS_NOT_IN_PROPERTIES",
  CreateDynamicFunction: "CREATE_DYNAMIC_FUNCTION",
  ObservedValues: "OBSERVED_VALUES",
  ConditionIndex: "CONDITION_INDEX",
  ConditionIndices: "CONDITION_INDICES",
  UnknownGroupKey: "UNKNOWN_GROUP_KEY",
  InvalidControlShape: "INVALID_CONTROL_SHAPE",
  DiscriminatorMismatch: "DISCRIMINATOR_MISMATCH",
  SharedNodeKindConflict: "SHARED_NODE_KIND_CONFLICT",
  TerminalStrategyMismatch: "TERMINAL_STRATEGY_MISMATCH",
  RecursiveShapeUnbounded: "RECURSIVE_SHAPE_UNBOUNDED",
  VirtualFieldsMismatch: "VIRTUAL_FIELDS_MISMATCH",
  ChildrenTargetNotFound: "CHILDREN_TARGET_NOT_FOUND",
  TerminalOptionUnsupported: "TERMINAL_OPTION_UNSUPPORTED"
};
var BlueprintWarningCode = {
  AllOfKeywordIgnoredForForm: "ALL_OF_KEYWORD_IGNORED_FOR_FORM",
  NullBranchIgnoredForForm: "NULL_BRANCH_IGNORED_FOR_FORM",
  IfWithoutElseFalse: "IF_WITHOUT_ELSE_FALSE",
  LockOnNonTerminalObject: "LOCK_ON_NON_TERMINAL_OBJECT",
  DependentSchemasIgnoredForForm: "DEPENDENT_SCHEMAS_IGNORED_FOR_FORM",
  TerminalSubtreeKeyIgnoredForForm: "TERMINAL_SUBTREE_KEY_IGNORED_FOR_FORM",
  DiscriminatorBranchUnreachable: "DISCRIMINATOR_BRANCH_UNREACHABLE"
};

// packages/canard/schema-form/src/errors/JSONSchemaError.ts
var import_error = require("@winglet/common-utils/error");
var JSONSchemaError = class extends import_error.BaseError {
  constructor(code, message, details = {}) {
    super("JSON_SCHEMA_ERROR", code, message, details);
    this.name = "JSONSchemaError";
  }
};

// packages/canard/schema-form/src/errors/SchemaFormError.ts
var import_error2 = require("@winglet/common-utils/error");
var SchemaFormError = class extends import_error2.BaseError {
  constructor(code, message, details = {}) {
    super("SCHEMA_FORM_ERROR", code, message, details);
    this.name = "SchemaFormError";
  }
};

// packages/canard/schema-form/src/errors/formErrorCode.ts
var UNKNOWN_JSON_SCHEMA = "UNKNOWN_JSON_SCHEMA";
var UNEXPECTED_ARRAY_SCHEMA = "UNEXPECTED_ARRAY_SCHEMA";
var ALL_OF_TYPE_REDEFINITION = "ALL_OF_TYPE_REDEFINITION";
var CONFLICTING_CONST_VALUES = "CONFLICTING_CONST_VALUES";
var INVALID_RANGE = "INVALID_RANGE";
var EMPTY_ENUM_INTERSECTION = "EMPTY_ENUM_INTERSECTION";
var VIRTUAL_FIELDS_NOT_VALID = "VIRTUAL_FIELDS_NOT_VALID";
var VIRTUAL_FIELDS_NOT_IN_PROPERTIES = "VIRTUAL_FIELDS_NOT_IN_PROPERTIES";
var CREATE_DYNAMIC_FUNCTION = "CREATE_DYNAMIC_FUNCTION";
var OBSERVED_VALUES = "OBSERVED_VALUES";
var CONDITION_INDEX = "CONDITION_INDEX";
var CONDITION_INDICES = "CONDITION_INDICES";
var UNKNOWN_GROUP_KEY = "UNKNOWN_GROUP_KEY";
var DISCRIMINATOR_MISMATCH = "DISCRIMINATOR_MISMATCH";
var SHARED_NODE_KIND_CONFLICT = "SHARED_NODE_KIND_CONFLICT";
var TERMINAL_STRATEGY_MISMATCH = "TERMINAL_STRATEGY_MISMATCH";
var SHARED_NODE_CONFLICT = "SHARED_NODE_CONFLICT";
var BUDGET_EXCEEDED = "BUDGET_EXCEEDED";
var EXPRESSION_THREW = "EXPRESSION_THREW";
var GUARD_FAILED = "GUARD_FAILED";
var INJECT_TARGET_MISSING = "INJECT_TARGET_MISSING";
var FEEDBACK_LIMIT_EXCEEDED = "FEEDBACK_LIMIT_EXCEEDED";
var LISTENER_THREW = "LISTENER_THREW";
var MULTIPLE_ERRORS = "MULTIPLE_ERRORS";
var FORM_TYPE_INPUT_MAP = "FORM_TYPE_INPUT_MAP";
var REGISTER_PLUGIN = "REGISTER_PLUGIN";
var INVALID_WRITE_OPTION = "INVALID_WRITE_OPTION";
var DISPOSED_NODE_WRITE = "DISPOSED_NODE_WRITE";
var WRITE_IN_OBSERVER = "WRITE_IN_OBSERVER";
var SUBMIT_WHILE_DEGRADED = "SUBMIT_WHILE_DEGRADED";
var VALIDATOR_COMPILE_FAILED = "VALIDATOR_COMPILE_FAILED";
var VALIDATOR_THREW = "VALIDATOR_THREW";
var RENDER_FAILED = "RENDER_FAILED";
var ALL_OF_KEYWORD_IGNORED_FOR_FORM = "ALL_OF_KEYWORD_IGNORED_FOR_FORM";
var NULL_BRANCH_IGNORED_FOR_FORM = "NULL_BRANCH_IGNORED_FOR_FORM";
var VIRTUALIZATION_DISABLED_FOR_FORM = "VIRTUALIZATION_DISABLED_FOR_FORM";
var IF_WITHOUT_ELSE_FALSE = "IF_WITHOUT_ELSE_FALSE";
var LOCK_ON_NON_TERMINAL_OBJECT = "LOCK_ON_NON_TERMINAL_OBJECT";
var CONDITIONAL_SCHEMA_WITHOUT_VALIDATOR = "CONDITIONAL_SCHEMA_WITHOUT_VALIDATOR";
var VALIDATOR_MISSING = "VALIDATOR_MISSING";
var MULTIPLE_GATED_BRANCHES_ACTIVE = "MULTIPLE_GATED_BRANCHES_ACTIVE";
var PRESENTATION_KEY_SUSPECT = "PRESENTATION_KEY_SUSPECT";
var INVALID_VIRTUAL_NODE_VALUES = "INVALID_VIRTUAL_NODE_VALUES";
var RESET_REBUILT_BY_REFERENCE = "RESET_REBUILT_BY_REFERENCE";
var ARRAY_METHOD_ON_NON_ARRAY = "ARRAY_METHOD_ON_NON_ARRAY";
var RECURSIVE_SHAPE_UNBOUNDED = "RECURSIVE_SHAPE_UNBOUNDED";
var RECURSIVE_SHAPE_DIVERGED = "RECURSIVE_SHAPE_DIVERGED";
var DEPENDENT_SCHEMAS_IGNORED_FOR_FORM = "DEPENDENT_SCHEMAS_IGNORED_FOR_FORM";
var VIRTUAL_FIELDS_MISMATCH = "VIRTUAL_FIELDS_MISMATCH";
var CHILDREN_TARGET_NOT_FOUND = "CHILDREN_TARGET_NOT_FOUND";
var TERMINAL_OPTION_UNSUPPORTED = "TERMINAL_OPTION_UNSUPPORTED";
var CHILD_NODE_COMPONENTS_ON_TERMINAL = "CHILD_NODE_COMPONENTS_ON_TERMINAL";
var TERMINAL_SUBTREE_KEY_IGNORED_FOR_FORM = "TERMINAL_SUBTREE_KEY_IGNORED_FOR_FORM";
var DISCRIMINATOR_BRANCH_UNREACHABLE = "DISCRIMINATOR_BRANCH_UNREACHABLE";
var NON_JSON_WHOLE_VALUE = "NON_JSON_WHOLE_VALUE";
var FORM_TYPE_TEST_INVALID = "FORM_TYPE_TEST_INVALID";
var VALIDATOR_BIND_REFUSED = "VALIDATOR_BIND_REFUSED";
var TYPE_MISMATCH = "TYPE_MISMATCH";
var INVALID_CONTROL_SHAPE = "INVALID_CONTROL_SHAPE";
var DIALECT_MISMATCH = "DIALECT_MISMATCH";
var FORM_ERROR_CODE_TABLE = [
  [`JSON_SCHEMA_ERROR.${UNKNOWN_JSON_SCHEMA}`, "error"],
  [`JSON_SCHEMA_ERROR.${UNEXPECTED_ARRAY_SCHEMA}`, "error"],
  [`JSON_SCHEMA_ERROR.${ALL_OF_TYPE_REDEFINITION}`, "error"],
  [`JSON_SCHEMA_ERROR.${CONFLICTING_CONST_VALUES}`, "error"],
  [`JSON_SCHEMA_ERROR.${INVALID_RANGE}`, "error"],
  [`JSON_SCHEMA_ERROR.${EMPTY_ENUM_INTERSECTION}`, "error"],
  [`JSON_SCHEMA_ERROR.${VIRTUAL_FIELDS_NOT_VALID}`, "error"],
  [`JSON_SCHEMA_ERROR.${VIRTUAL_FIELDS_NOT_IN_PROPERTIES}`, "error"],
  [`JSON_SCHEMA_ERROR.${CREATE_DYNAMIC_FUNCTION}`, "error"],
  [`JSON_SCHEMA_ERROR.${OBSERVED_VALUES}`, "error"],
  [`JSON_SCHEMA_ERROR.${CONDITION_INDEX}`, "error"],
  [`JSON_SCHEMA_ERROR.${CONDITION_INDICES}`, "error"],
  [`JSON_SCHEMA_ERROR.${UNKNOWN_GROUP_KEY}`, "error"],
  [`JSON_SCHEMA_ERROR.${DISCRIMINATOR_MISMATCH}`, "error"],
  [`JSON_SCHEMA_ERROR.${SHARED_NODE_KIND_CONFLICT}`, "error"],
  [`JSON_SCHEMA_ERROR.${TERMINAL_STRATEGY_MISMATCH}`, "error"],
  [`SCHEMA_FORM_ERROR.${SHARED_NODE_CONFLICT}`, "error"],
  [`SCHEMA_FORM_ERROR.${BUDGET_EXCEEDED}`, "error"],
  [`SCHEMA_FORM_ERROR.${EXPRESSION_THREW}`, "error"],
  [`SCHEMA_FORM_ERROR.${GUARD_FAILED}`, "error"],
  [`SCHEMA_FORM_ERROR.${INJECT_TARGET_MISSING}`, "error"],
  [`SCHEMA_FORM_ERROR.${FEEDBACK_LIMIT_EXCEEDED}`, "error"],
  [`SCHEMA_FORM_ERROR.${LISTENER_THREW}`, "error"],
  [`SCHEMA_FORM_ERROR.${MULTIPLE_ERRORS}`, "error"],
  [`SCHEMA_FORM_ERROR.${FORM_TYPE_INPUT_MAP}`, "error"],
  [`UNHANDLED_ERROR.${REGISTER_PLUGIN}`, "error"],
  [`SCHEMA_FORM_ERROR.${INVALID_WRITE_OPTION}`, "error"],
  [`SCHEMA_FORM_ERROR.${DISPOSED_NODE_WRITE}`, "error"],
  [`SCHEMA_FORM_ERROR.${WRITE_IN_OBSERVER}`, "error"],
  [`SCHEMA_FORM_ERROR.${SUBMIT_WHILE_DEGRADED}`, "error"],
  [`SCHEMA_FORM_ERROR.${VALIDATOR_COMPILE_FAILED}`, "error"],
  [`SCHEMA_FORM_ERROR.${VALIDATOR_THREW}`, "error"],
  [`SCHEMA_FORM_ERROR.${RENDER_FAILED}`, "error"],
  [`SCHEMA_FORM_WARNING.${ALL_OF_KEYWORD_IGNORED_FOR_FORM}`, "warning"],
  [`SCHEMA_FORM_WARNING.${NULL_BRANCH_IGNORED_FOR_FORM}`, "warning"],
  [`SCHEMA_FORM_WARNING.${VIRTUALIZATION_DISABLED_FOR_FORM}`, "warning"],
  [`SCHEMA_FORM_WARNING.${IF_WITHOUT_ELSE_FALSE}`, "warning"],
  [`SCHEMA_FORM_WARNING.${LOCK_ON_NON_TERMINAL_OBJECT}`, "warning"],
  [`SCHEMA_FORM_WARNING.${CONDITIONAL_SCHEMA_WITHOUT_VALIDATOR}`, "warning"],
  [`SCHEMA_FORM_WARNING.${VALIDATOR_MISSING}`, "warning"],
  [`SCHEMA_FORM_WARNING.${MULTIPLE_GATED_BRANCHES_ACTIVE}`, "warning"],
  [`SCHEMA_FORM_WARNING.${PRESENTATION_KEY_SUSPECT}`, "warning"],
  [`SCHEMA_FORM_ERROR.${INVALID_VIRTUAL_NODE_VALUES}`, "error"],
  [`SCHEMA_FORM_WARNING.${RESET_REBUILT_BY_REFERENCE}`, "warning"],
  [`SCHEMA_FORM_ERROR.${ARRAY_METHOD_ON_NON_ARRAY}`, "error"],
  [`JSON_SCHEMA_ERROR.${RECURSIVE_SHAPE_UNBOUNDED}`, "error"],
  [`SCHEMA_FORM_ERROR.${RECURSIVE_SHAPE_DIVERGED}`, "error"],
  [`SCHEMA_FORM_WARNING.${DEPENDENT_SCHEMAS_IGNORED_FOR_FORM}`, "warning"],
  [`JSON_SCHEMA_ERROR.${VIRTUAL_FIELDS_MISMATCH}`, "error"],
  [`JSON_SCHEMA_ERROR.${CHILDREN_TARGET_NOT_FOUND}`, "error"],
  [`JSON_SCHEMA_ERROR.${TERMINAL_OPTION_UNSUPPORTED}`, "error"],
  [`SCHEMA_FORM_WARNING.${CHILD_NODE_COMPONENTS_ON_TERMINAL}`, "warning"],
  [`SCHEMA_FORM_WARNING.${TERMINAL_SUBTREE_KEY_IGNORED_FOR_FORM}`, "warning"],
  [`SCHEMA_FORM_WARNING.${DISCRIMINATOR_BRANCH_UNREACHABLE}`, "warning"],
  [`SCHEMA_FORM_WARNING.${NON_JSON_WHOLE_VALUE}`, "warning"],
  [`SCHEMA_FORM_WARNING.${FORM_TYPE_TEST_INVALID}`, "warning"],
  [`UNHANDLED_ERROR.${VALIDATOR_BIND_REFUSED}`, "error"],
  [`SCHEMA_FORM_WARNING.${TYPE_MISMATCH}`, "warning"],
  [`JSON_SCHEMA_ERROR.${INVALID_CONTROL_SHAPE}`, "error"],
  [`SCHEMA_FORM_WARNING.${DIALECT_MISMATCH}`, "warning"]
];

// packages/canard/schema-form/src/core/blueprint/utils/diagnostics/throwBlueprintError.ts
var throwBlueprintError = (code, schemaPath, details = {}, options) => {
  options?.collect?.({ code, level: "error", schemaPath, details });
  throw new JSONSchemaError(
    code,
    `${code} at ${schemaPath || "#"}; ${details.guidance ?? "check the authored schema"}`,
    { schemaPath, ...details }
  );
};

// packages/canard/schema-form/src/core/blueprint/utils/effectiveSchema/utils/applyConstraintKeywords.ts
var RANGES = [
  ["minimum", "maximum"],
  ["exclusiveMinimum", "exclusiveMaximum"],
  ["minLength", "maxLength"],
  ["minItems", "maxItems"],
  ["minProperties", "maxProperties"]
];
var applyConstraintKeywords = (state, source, schemaPath, options) => {
  const target = state.schema;
  for (const [bound, exclusive] of [
    ["minimum", "exclusiveMinimum"],
    ["maximum", "exclusiveMaximum"]
  ]) {
    if (typeof source[exclusive] !== "boolean") continue;
    const clause = {
      [exclusive]: source[exclusive],
      ...source[bound] === void 0 ? {} : { [bound]: source[bound] }
    };
    target.allOf = [
      ...(0, import_filter.isArray)(target.allOf) ? target.allOf : [],
      clause
    ];
  }
  for (const [lower, upper] of RANGES) {
    const crossing = (numberValue(source[lower]) !== void 0 || numberValue(source[upper]) !== void 0) && (target[lower] !== void 0 || target[upper] !== void 0);
    const minimum = intersectMinimum(
      numberValue(target[lower]),
      numberValue(source[lower])
    );
    const maximum = intersectMaximum(
      numberValue(target[upper]),
      numberValue(source[upper])
    );
    if (minimum !== void 0) target[lower] = minimum;
    if (maximum !== void 0) target[upper] = maximum;
    if (options.mode === "static" && crossing && validateRange(minimum, maximum) === EMPTY_INTERSECTION)
      throwBlueprintError(
        BlueprintErrorCode.InvalidRange,
        schemaPath,
        { lower, upper, minimum, maximum },
        options
      );
  }
  const multipleOf = intersectMultipleOf(
    numberValue(target.multipleOf),
    numberValue(source.multipleOf)
  );
  if (multipleOf !== void 0) target.multipleOf = multipleOf;
  const enumeration = intersectEnum(
    (0, import_filter.isArray)(target.enum) ? target.enum : void 0,
    (0, import_filter.isArray)(source.enum) ? source.enum : void 0,
    true
  );
  if (enumeration === EMPTY_INTERSECTION) {
    if (options.mode === "static")
      throwBlueprintError(
        BlueprintErrorCode.EmptyEnumIntersection,
        schemaPath,
        {},
        options
      );
    target.enum = [];
  } else if (enumeration !== void 0) target.enum = enumeration;
  const constant = intersectConst(target.const, source.const);
  if (constant === EMPTY_INTERSECTION) {
    if (options.mode === "static")
      throwBlueprintError(
        BlueprintErrorCode.ConflictingConstValues,
        schemaPath,
        {},
        options
      );
    state.conflictingConst = true;
  } else if (constant !== void 0 && !state.conflictingConst)
    target.const = constant;
  if (state.conflictingConst) {
    delete target.const;
    target.enum = [];
  }
};
function numberValue(value) {
  return typeof value === "number" ? value : void 0;
}

// packages/canard/schema-form/src/core/blueprint/utils/types/intersectAllowedTypes.ts
var intersectAllowedTypes = (left, right) => {
  if (!left) return right;
  if (!right) return left;
  const result = [];
  for (const type of left) {
    const matched = right.includes(type) ? type : type === "number" && right.includes("integer") ? "integer" : type === "integer" && right.includes("number") ? "integer" : void 0;
    if (matched && !result.includes(matched)) result.push(matched);
  }
  return result;
};

// packages/canard/schema-form/src/core/blueprint/utils/types/readAllowedTypes.ts
var import_filter2 = require("@winglet/common-utils/filter");

// packages/canard/schema-form/src/core/blueprint/utils/types/unionAllowedTypes.ts
var unionAllowedTypes = (sets) => {
  const result = [];
  for (const set of sets)
    for (const type of set) {
      if (type === "integer" && result.includes("number")) continue;
      if (type === "number" && result.includes("integer")) {
        result[result.indexOf("integer")] = "number";
        continue;
      }
      if (!result.includes(type)) result.push(type);
    }
  return result;
};

// packages/canard/schema-form/src/core/blueprint/utils/types/readAllowedTypes.ts
var readAllowedTypes = (schema, schemaPath, options) => {
  if (typeof schema === "boolean" || schema.type === void 0)
    return void 0;
  const values = (0, import_filter2.isArray)(schema.type) ? schema.type : [schema.type];
  if (!values.length || values.some(
    (value, index) => !TYPE_NAMES.includes(value) || values.indexOf(value) !== index
  ))
    return throwBlueprintError(
      BlueprintErrorCode.UnknownJsonSchema,
      schemaPath,
      {
        type: schema.type,
        guidance: "Specify a nonempty type without duplicate or unknown names."
      },
      options
    );
  const result = [...values];
  if (schema.nullable === true && !result.includes("null")) result.push("null");
  return unionAllowedTypes([result]);
};
var TYPE_NAMES = [
  "string",
  "number",
  "integer",
  "boolean",
  "null",
  "object",
  "array"
];

// packages/canard/schema-form/src/core/blueprint/utils/effectiveSchema/utils/applyTypeContribution.ts
var applyTypeContribution = (state, schema, schemaPath, options) => {
  if (!state.allowedTypes) return;
  state.allowedTypes = intersectAllowedTypes(
    state.allowedTypes,
    readAllowedTypes(schema, schemaPath, options)
  );
  if (state.allowedTypes?.length !== 0) return;
  if (options.mode === "static")
    throwBlueprintError(
      BlueprintErrorCode.AllOfTypeRedefinition,
      schemaPath,
      {
        guidance: "Static type declarations must have a nonempty intersection."
      },
      options
    );
  state.conflictingType = true;
};

// packages/canard/schema-form/src/core/blueprint/utils/effectiveSchema/utils/mergeHintGroup.ts
var import_lib = require("@winglet/common-utils/lib");
var import_object3 = require("@winglet/common-utils/object");
var mergeHintGroup = (earlier, later, omitVirtual, isAtomic) => {
  const source = omitVirtual && later && typeof later === "object" && (0, import_lib.hasOwnProperty)(later, "virtual") ? Object.fromEntries(
    Object.entries(later).filter(([key]) => key !== "virtual")
  ) : later;
  if (source === void 0) return earlier;
  if (earlier === void 0) return source;
  if (!earlier || !source || typeof earlier !== "object" || typeof source !== "object")
    return source;
  return (0, import_object3.merge)(earlier, source, {
    immutable: true,
    preserveReferences: true,
    arrayStrategy: "replace",
    isAtomic
  });
};

// packages/canard/schema-form/src/core/blueprint/utils/effectiveSchema/utils/applySchemaContribution.ts
var CONSTRAINT_KEYS = [
  "enum",
  "const",
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
  "maxProperties"
];
var applySchemaContribution = (state, declaration, options) => {
  const schema = declaration.schema;
  if (typeof schema === "boolean") return;
  applyTypeContribution(state, schema, declaration.schemaPath, options);
  for (const key of Object.keys(schema)) {
    const value = schema[key];
    if (value === void 0 || key === "type" || key === "nullable" || CONSTRAINT_KEYS.includes(key))
      continue;
    if (key === "options" || key === "presentation")
      state.schema[key] = mergeHintGroup(
        state.schema[key],
        value,
        key === "options",
        options.isAtomic
      );
    else if (key === "controls") {
      if (declaration.scope === "node") applyControlHints(state.schema, value);
    } else if (key === "readOnly")
      state.schema.readOnly = state.schema.readOnly === true || value === true;
    else if (key === "required" && (0, import_filter3.isArray)(value)) {
      const earlier = (0, import_filter3.isArray)(state.schema.required) ? state.schema.required : [];
      state.schema.required = [
        ...earlier,
        ...value.filter(
          (entry, index) => !earlier.includes(entry) && value.indexOf(entry) === index
        )
      ];
    } else if (key === "pattern" && typeof value === "string") {
      if (!state.patterns.includes(value)) state.patterns.push(value);
    } else if (key === "allOf" && (0, import_filter3.isArray)(value))
      state.schema.allOf = [
        ...(0, import_filter3.isArray)(state.schema.allOf) ? state.schema.allOf : [],
        ...value
      ];
    else state.schema[key] = value;
  }
  applyConstraintKeywords(state, schema, declaration.schemaPath, options);
};
function applyControlHints(target, source) {
  if (!source || typeof source !== "object") return;
  const previous = target.controls;
  const controls = { ...previous };
  for (const key of ["watch", "default"])
    if (source[key] !== void 0)
      controls[key] = source[key];
  if (Object.keys(controls).length) target.controls = controls;
}

// packages/canard/schema-form/src/core/blueprint/utils/effectiveSchema/utils/finalizeEffectiveSchema.ts
var import_filter4 = require("@winglet/common-utils/filter");
var finalizeEffectiveSchema = (state, node) => {
  const schema = state.schema;
  if (state.patterns.length) {
    schema.pattern = state.patterns[0];
    if (state.patterns.length > 1)
      schema.allOf = [
        ...(0, import_filter4.isArray)(schema.allOf) ? schema.allOf : [],
        ...state.patterns.slice(1).map((pattern) => ({ pattern }))
      ];
  }
  const types = state.allowedTypes?.filter((type) => type !== "null");
  const staticTypes = (0, import_filter4.isArray)(node.schemaType) ? node.schemaType : [node.schemaType];
  const unchanged = types?.length === staticTypes.length && types.every((type, index) => type === staticTypes[index]);
  schema.type = state.conflictingType || unchanged || node.kind === "virtual" ? node.schemaType : types?.length === 0 ? "null" : Object.freeze(types);
  if (state.conflictingType) {
    if (node.nullable) schema.nullable = true;
  } else if (node.nullable || state.allowedTypes?.includes("null"))
    schema.nullable = state.allowedTypes?.includes("null") ?? node.nullable;
  if (state.conflictingConst) schema.enum = [];
  return Object.freeze({
    schema: Object.freeze(schema),
    typeConflict: state.conflictingType
  });
};

// packages/canard/schema-form/src/core/blueprint/utils/effectiveSchema/utils/mergeSchemaContributions.ts
var FALSE_EFFECTIVE_SCHEMA = Object.freeze({
  schema: false,
  typeConflict: false
});
var mergeSchemaContributions = (node, declarations, options) => {
  const staticTypes = node.schemaType === "virtual" ? void 0 : (0, import_filter5.isArray)(node.schemaType) ? node.schemaType : [node.schemaType];
  const state = {
    schema: {},
    patterns: [],
    conflictingConst: false,
    conflictingType: false,
    allowedTypes: staticTypes && node.nullable && !staticTypes.includes("null") ? [...staticTypes, "null"] : staticTypes
  };
  for (const declaration of declarations) {
    if (declaration.schema === false) return FALSE_EFFECTIVE_SCHEMA;
    if (declaration.schema === true) continue;
    applySchemaContribution(state, declaration, options);
  }
  return finalizeEffectiveSchema(state, node);
};

// packages/canard/schema-form/src/core/blueprint/utils/effectiveSchema/utils/selectEffectiveDeclarations.ts
var selectEffectiveDeclarations = (node, activeIds) => {
  const active = node.declarations.filter(
    (entry) => !entry.validationOnly && (entry.gates.length === 0 || activeIds.includes(entry.id))
  );
  const declarations = active.filter((entry) => entry.role === "declaration");
  return active.filter(
    (entry) => entry.context === "conjunction" || declarations.length === 1 && declarations[0].context === "declaration" && entry === declarations[0]
  ).sort(compareDeclarations);
};
function compareDeclarations(left, right) {
  const length = Math.min(left.order.length, right.order.length);
  for (let index = 0; index < length; index++) {
    const difference = left.order[index] - right.order[index];
    if (difference) return difference;
  }
  return left.order.length - right.order.length || left.id - right.id;
}

// packages/canard/schema-form/src/core/blueprint/utils/effectiveSchema/mergeEffectiveSchema.ts
var DEFAULT_MEMO = /* @__PURE__ */ new WeakMap();
var mergeEffectiveSchema = (node, activeDeclarationIds, options = {}, memo = DEFAULT_MEMO) => {
  const defaultNoActive = activeDeclarationIds.length === 0 && (options.mode === void 0 || options.mode === "runtime") && options.isAtomic === void 0 && options.collect === void 0 && memo === DEFAULT_MEMO;
  if (defaultNoActive) {
    const cached2 = DEFAULT_NO_ACTIVE.get(node);
    if (cached2 !== void 0) return cached2;
  }
  const declarations = selectEffectiveDeclarations(node, activeDeclarationIds);
  const schemas = ensureEffectiveSchemaCache(memo, node, options);
  const key = declarations.map((declaration) => declaration.id).join(",");
  const cached = schemas.get(key);
  if (cached !== void 0) return cached;
  if (memo === DEFAULT_MEMO && options.collect === void 0 && options.isAtomic === void 0 && (options.mode === void 0 || options.mode === "runtime") && node.declarations.length === 1 && node.declarations[0].gates.length === 0) {
    const normalized = DEFAULT_NO_ACTIVE.get(node);
    if (normalized !== void 0) {
      schemas.set(key, normalized);
      return normalized;
    }
  }
  const effective = mergeSchemaContributions(node, declarations, options);
  schemas.set(key, effective);
  if (defaultNoActive) DEFAULT_NO_ACTIVE.set(node, effective);
  return effective;
};

// packages/canard/schema-form/src/core/blueprint/utils/analyze/readSchemaObject.ts
var readSchemaObject = (schema) => typeof schema === "boolean" ? {} : schema;

// packages/canard/schema-form/src/core/blueprint/utils/types/resolveNodeStrategy.ts
var resolveNodeStrategy = (context, kind, declarations) => {
  const count = declarations.filter(
    (declaration) => declaration.role === "declaration"
  ).length;
  const relevant = declarations.filter(
    (declaration) => !declaration.validationOnly && (declaration.context === "conjunction" || count === 1 && declaration.role === "declaration")
  );
  if (kind !== "object" && kind !== "array") {
    const terminal = kind !== "virtual";
    for (const declaration of relevant) {
      const value = readSchemaObject(declaration.schema).options?.terminal;
      if (value !== void 0 && value !== terminal)
        throwBlueprintError(
          BlueprintErrorCode.TerminalOptionUnsupported,
          declaration.schemaPath,
          { type: kind, value },
          context.options
        );
    }
    return terminal ? "terminal" : "branch";
  }
  const root = { children: /* @__PURE__ */ new Map(), hasDeclaration: false };
  relevant.forEach((declaration, index) => {
    let current = root;
    for (const gate of declaration.gates) {
      const key = JSON.stringify([
        gate.kind,
        gate.schemaPath,
        gate.hostPath,
        gate.negated
      ]);
      let child = current.children.get(key);
      if (!child) {
        child = { children: /* @__PURE__ */ new Map(), hasDeclaration: false };
        current.children.set(key, child);
      }
      current = child;
    }
    const explicit = readSchemaObject(declaration.schema).options?.terminal;
    const renderer = context.options.isTerminal?.(declaration.schema);
    if (explicit !== void 0) current.explicit = { index, value: explicit };
    if (renderer !== void 0) current.renderer = { index, value: renderer };
    current.hasDeclaration ||= declaration.role === "declaration";
    current.schemaPath = declaration.schemaPath;
  });
  let strategy;
  const pending = [root];
  while (pending.length) {
    const current = pending.pop();
    if (current.hasDeclaration && current.schemaPath !== void 0) {
      const terminal = current.explicit?.value ?? current.renderer?.value ?? false;
      if (strategy !== void 0 && strategy !== terminal)
        throwBlueprintError(
          BlueprintErrorCode.TerminalStrategyMismatch,
          current.schemaPath,
          { type: kind },
          context.options
        );
      strategy = terminal;
    }
    for (const child of current.children.values()) {
      child.hasDeclaration ||= current.hasDeclaration;
      if ((current.explicit?.index ?? -1) > (child.explicit?.index ?? -1))
        child.explicit = current.explicit;
      if ((current.renderer?.index ?? -1) > (child.renderer?.index ?? -1))
        child.renderer = current.renderer;
      pending.push(child);
    }
  }
  return strategy ? "terminal" : "branch";
};

// packages/canard/schema-form/src/core/blueprint/utils/types/foldAllowedTypes.ts
var foldAllowedTypes = (types) => {
  let mask = 0;
  for (const type of types) if (type !== "null") mask |= TYPE_MASK[type];
  return mask || TYPE_MASK.null;
};
var TYPE_MASK = {
  string: 1,
  number: 2,
  integer: 2,
  boolean: 4,
  object: 8,
  array: 16,
  null: 32
};

// packages/canard/schema-form/src/core/blueprint/utils/types/inferAllowedTypes.ts
var import_filter8 = require("@winglet/common-utils/filter");

// packages/canard/schema-form/src/core/blueprint/utils/analyze/collectStaticSchemas.ts
var import_filter6 = require("@winglet/common-utils/filter");

// packages/canard/schema-form/src/core/blueprint/utils/analyze/resolveReference.ts
var import_pointer = require("@winglet/json/pointer");
var resolveReference = (context, reference, schemaPath) => {
  if (!reference.startsWith("#"))
    return throwBlueprintError(
      BlueprintErrorCode.UnknownJsonSchema,
      schemaPath,
      {
        reference,
        guidance: "References must resolve within the authored root."
      },
      context.options
    );
  let pointer;
  let schema;
  try {
    pointer = decodeURIComponent(reference.slice(1));
    schema = (0, import_pointer.getValue)(context.schema, pointer);
  } catch (cause) {
    return throwBlueprintError(
      BlueprintErrorCode.UnknownJsonSchema,
      schemaPath,
      {
        reference,
        cause,
        guidance: "The reference must be a valid local schema pointer."
      },
      context.options
    );
  }
  if (schema === void 0 || typeof schema !== "boolean" && (schema === null || typeof schema !== "object"))
    return throwBlueprintError(
      BlueprintErrorCode.UnknownJsonSchema,
      schemaPath,
      { reference, guidance: "The reference must identify a schema." },
      context.options
    );
  return { schema, schemaPath: `#${pointer}` };
};

// packages/canard/schema-form/src/core/blueprint/utils/analyze/collectStaticSchemas.ts
var collectStaticSchemas = (context, schema, schemaPath, visiting = [], cycle) => {
  if (visiting.includes(schemaPath)) {
    if (cycle) cycle.found = true;
    return [];
  }
  const result = [{ schema, schemaPath }];
  if (typeof schema === "boolean") return result;
  const stack = [...visiting, schemaPath];
  if (typeof schema.$ref === "string") {
    const target = resolveReference(context, schema.$ref, schemaPath);
    result.push(
      ...collectStaticSchemas(context, target.schema, target.schemaPath, stack, cycle)
    );
  }
  if ((0, import_filter6.isArray)(schema.allOf))
    schema.allOf.forEach((part, index) => {
      const controls = typeof part === "object" && part !== null ? part.controls : void 0;
      if (controls?.active === void 0)
        result.push(
          ...collectStaticSchemas(
            context,
            part,
            `${schemaPath}/allOf/${index}`,
            stack,
            cycle
          )
        );
    });
  return result;
};

// packages/canard/schema-form/src/core/blueprint/utils/types/inferLiteralTypes.ts
var import_filter7 = require("@winglet/common-utils/filter");
var import_lib2 = require("@winglet/common-utils/lib");
var inferLiteralTypes = (context, parts, schemaPath) => {
  const values = [];
  let hasLiteral = false;
  for (const part of parts) {
    if (typeof part.schema === "boolean") continue;
    if ((0, import_lib2.hasOwnProperty)(part.schema, "const")) {
      values.push(part.schema.const);
      hasLiteral = true;
    }
    if ((0, import_lib2.hasOwnProperty)(part.schema, "enum")) {
      hasLiteral = true;
      if (!(0, import_filter7.isArray)(part.schema.enum))
        return throwBlueprintError(
          BlueprintErrorCode.UnknownJsonSchema,
          part.schemaPath,
          { guidance: "Specify type explicitly for an invalid enum literal." },
          context.options
        );
      values.push(...part.schema.enum);
    }
  }
  if (!hasLiteral) return void 0;
  const types = [];
  for (const value of values) {
    const type = value === null ? "null" : typeof value;
    if (type !== "string" && type !== "number" && type !== "boolean" && type !== "null")
      return throwBlueprintError(
        BlueprintErrorCode.UnknownJsonSchema,
        schemaPath,
        { guidance: "Specify type explicitly for an object or array literal." },
        context.options
      );
    if (!types.includes(type))
      types.push(type);
  }
  if (types.filter((type) => type !== "null").length === 1 && types.length > 0)
    return types;
  if (types.length === 1 && types[0] === "null") return types;
  return throwBlueprintError(
    BlueprintErrorCode.UnknownJsonSchema,
    schemaPath,
    { guidance: "Specify type explicitly for mixed or empty literals." },
    context.options
  );
};

// packages/canard/schema-form/src/core/blueprint/utils/types/inferAllowedTypes.ts
var BRANCH_KEYWORDS = ["oneOf", "anyOf"];
var inferAllowedTypes = (context, schema, schemaPath, allowTop = false, visiting = [], isBranch = false) => {
  if (visiting.includes(schemaPath)) return [];
  const cycle = isBranch ? { found: false } : void 0;
  const parts = collectStaticSchemas(context, schema, schemaPath, [], cycle);
  if (isBranch && cycle?.found || parts.some((part) => visiting.includes(part.schemaPath)))
    return [];
  const stack = [...visiting, ...parts.map((part) => part.schemaPath)];
  let allowed;
  for (const part of parts) {
    allowed = intersectAllowedTypes(
      allowed,
      readAllowedTypes(part.schema, part.schemaPath, context.options)
    );
    if (allowed?.length === 0)
      return throwBlueprintError(
        BlueprintErrorCode.AllOfTypeRedefinition,
        part.schemaPath,
        { schema },
        context.options
      );
  }
  if (allowed) return allowed;
  let inferred;
  let hasUngatedBranch = false;
  for (const keyword of BRANCH_KEYWORDS) {
    const groups = [];
    let hasKeywordBranch = false;
    for (const part of parts) {
      if (typeof part.schema === "boolean") continue;
      const branches = part.schema[keyword];
      if (!(0, import_filter8.isArray)(branches)) continue;
      branches.forEach((branch, index) => {
        const path = `${part.schemaPath}/${keyword}/${index}`;
        if (branch?.controls?.active !== void 0 || context.discriminatorBranches?.has(path))
          return;
        hasKeywordBranch = true;
        const types = inferAllowedTypes(context, branch, path, true, stack, true);
        if (!types)
          return throwBlueprintError(
            BlueprintErrorCode.UnknownJsonSchema,
            path,
            {
              guidance: "Specify type explicitly for an unconstrained branch."
            },
            context.options
          );
        if (types.length) groups.push(types);
      });
    }
    if (hasKeywordBranch) {
      hasUngatedBranch = true;
      inferred = intersectAllowedTypes(inferred, unionAllowedTypes(groups));
    }
  }
  if (inferred?.length) {
    const kindMask = foldAllowedTypes(inferred);
    if ((kindMask & 24) !== 0 && kindMask !== 8 && kindMask !== 16)
      return throwBlueprintError(
        BlueprintErrorCode.UnknownJsonSchema,
        schemaPath,
        {
          guidance: "Specify type explicitly for object or array branches mixed with another kind."
        },
        context.options
      );
    return inferred;
  }
  if (!hasUngatedBranch && !isBranch) {
    const literals = inferLiteralTypes(context, parts, schemaPath);
    if (literals) return literals;
  }
  if (allowTop && inferred === void 0) return void 0;
  return throwBlueprintError(
    BlueprintErrorCode.UnknownJsonSchema,
    schemaPath,
    {
      guidance: "Specify type explicitly; no nonempty branch union or primitive literal determines this slot."
    },
    context.options
  );
};

// packages/canard/schema-form/src/core/blueprint/utils/types/resolveNodeTypes.ts
var resolveNodeTypes = (context, declarations) => {
  const fixed = context.capabilities.branchless ? declarations : declarations.filter(
    (declaration) => declaration.context === "conjunction" && !declaration.gates.length
  );
  const staticOwner = fixed.some(
    (declaration) => declaration.role === "declaration"
  );
  if (staticOwner) {
    let allowed;
    for (const declaration of fixed) {
      allowed = intersectAllowedTypes(
        allowed,
        readAllowedTypes(
          declaration.schema,
          declaration.schemaPath,
          context.options
        )
      );
      if (allowed?.length === 0)
        return throwBlueprintError(
          BlueprintErrorCode.AllOfTypeRedefinition,
          declaration.schemaPath,
          { declarations: fixed.map((item) => item.schemaPath) },
          context.options
        );
    }
    if (!allowed)
      allowed = inferAllowedTypes(
        context,
        fixed[0].schema,
        fixed[0].schemaPath
      );
    if (context.capabilities.branchless) return [{ allowed, declarations }];
    const mask = foldAllowedTypes(allowed);
    for (const declaration of declarations) {
      if (declaration.context !== "declaration" || declaration.gates.length || declaration.role !== "declaration")
        continue;
      const types = inferAllowedTypes(
        context,
        declaration.schema,
        declaration.schemaPath,
        true
      );
      if (types && (foldAllowedTypes(types) & mask) !== foldAllowedTypes(types))
        throwBlueprintError(
          BlueprintErrorCode.SharedNodeKindConflict,
          declaration.schemaPath,
          { staticTypes: allowed, branchTypes: types },
          context.options
        );
    }
    return [{ allowed, declarations }];
  }
  const groups = /* @__PURE__ */ new Map();
  let ungatedMask;
  for (const declaration of declarations.filter(
    (item) => item.role === "declaration"
  )) {
    const allowed = inferAllowedTypes(
      context,
      declaration.schema,
      declaration.schemaPath
    );
    const mask = foldAllowedTypes(allowed);
    if (!declaration.gates.length) {
      if (ungatedMask !== void 0 && ungatedMask !== mask)
        throwBlueprintError(
          BlueprintErrorCode.SharedNodeKindConflict,
          declaration.schemaPath,
          { types: allowed },
          context.options
        );
      ungatedMask = mask;
    }
    const group = groups.get(mask);
    if (group) {
      group.allowed = unionAllowedTypes([group.allowed, allowed]);
      group.declarations.push(declaration);
    } else groups.set(mask, { allowed, declarations: [declaration] });
  }
  return [...groups.values()].map((group) => ({
    ...group,
    declarations: declarations.filter(
      (declaration) => group.declarations.includes(declaration) || declaration.role === "overlay" && group.declarations.some(
        (owner) => context.declarationOwners?.get(declaration.id) === owner.id
      )
    )
  }));
};

// packages/canard/schema-form/src/core/blueprint/utils/analyze/collectDeclarations.ts
var import_filter13 = require("@winglet/common-utils/filter");

// packages/canard/schema-form/src/core/blueprint/utils/diagnostics/validateControlGroups.ts
var import_filter9 = require("@winglet/common-utils/filter");
var validateControlGroups = (context, schema, schemaPath, fragment) => {
  const record = readSchemaObject(schema);
  for (const group of ["controls", "options"]) {
    const value = record[group];
    if (value === void 0) continue;
    const allowed = group === "options" ? OPTION_KEYS : fragment ? CHILD_CONTROL_KEYS : CONTROL_KEYS;
    if (!value || typeof value !== "object" || (0, import_filter9.isArray)(value))
      throwBlueprintError(
        BlueprintErrorCode.InvalidControlShape,
        `${schemaPath}/${group}`,
        { group, key: group, expected: "object" },
        context.options
      );
    for (const key of Object.keys(value))
      if (!allowed.includes(key))
        throwBlueprintError(
          BlueprintErrorCode.UnknownGroupKey,
          `${schemaPath}/${group}/${key}`,
          { group, key },
          context.options
        );
  }
  const controls = record.controls;
  if (controls?.injectTo !== void 0 && typeof controls.injectTo !== "function")
    throwBlueprintError(
      BlueprintErrorCode.InvalidControlShape,
      `${schemaPath}/controls/injectTo`,
      { group: "controls", key: "injectTo", expected: "function" },
      context.options
    );
  if (controls?.children !== void 0) {
    if (!(0, import_filter9.isArray)(controls.children))
      throwBlueprintError(
        BlueprintErrorCode.InvalidControlShape,
        `${schemaPath}/controls/children`,
        { group: "controls", key: "children", expected: "array" },
        context.options
      );
    controls.children.forEach((entry, index) => {
      const path = `${schemaPath}/controls/children/${index}`;
      if (!entry || typeof entry !== "object" || Object.keys(entry).some(
        (key) => key !== "targets" && key !== "controls"
      ) || !(0, import_filter9.isArray)(entry.targets) || entry.targets.some((name) => typeof name !== "string"))
        throwBlueprintError(
          BlueprintErrorCode.InvalidControlShape,
          path,
          {
            group: "controls",
            key: "children",
            expected: "{ targets: string[], controls? }"
          },
          context.options
        );
      validateControlGroups(context, { controls: entry.controls }, path, true);
    });
  }
};
var CHILD_CONTROL_KEYS = [
  "active",
  "visible",
  "readOnly",
  "disabled",
  "default",
  "derived",
  "unsetValue",
  "resetInteraction",
  "unsetOnInactive"
];
var CONTROL_KEYS = [
  ...CHILD_CONTROL_KEYS,
  "children",
  "injectTo",
  "discriminator",
  "watch"
];
var OPTION_KEYS = [
  "terminal",
  "virtual",
  "propertyKeys",
  "omitEmpty",
  "omitTrailing",
  "trim"
];

// packages/canard/schema-form/src/helpers/jsonPointer/enum.ts
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

// packages/canard/schema-form/src/helpers/jsonPointer/utils/isAbsolutePath.ts
var isAbsolutePath = (pointer) => pointer[0] === JSONPointer.Separator || pointer[0] === JSONPointer.Fragment && pointer[1] === JSONPointer.Separator;

// packages/canard/schema-form/src/helpers/jsonPointer/utils/getAbsolutePointer.ts
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

// packages/canard/schema-form/src/helpers/jsonPointer/utils/stripFragment.ts
var stripFragment = (path) => path[0] === JSONPointer.Fragment ? path[2] !== void 0 ? path.slice(1) : JSONPointer.Root : path === JSONPointer.Separator ? JSONPointer.Root : path;

// packages/canard/schema-form/src/core/blueprint/utils/expressions/regex.ts
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

// packages/canard/schema-form/src/core/blueprint/utils/analyze/collectGateEvaluationReads.ts
var collectGateEvaluationReads = (condition) => {
  if (typeof condition !== "string") return Object.freeze([]);
  const reads = [];
  for (const match of condition.matchAll(JSON_POINTER_PATH_REGEX)) {
    const path = match[0];
    if (path === "@") continue;
    if (path === "#" || path === "/") reads.push("");
    else if (path.startsWith("#/")) reads.push(path.slice(1));
    else if (path.startsWith("/")) reads.push(path);
    else {
      let levels = 0;
      let relative = path;
      while (relative.startsWith("../")) {
        levels++;
        relative = relative.slice(3);
      }
      reads.push(levels);
    }
  }
  return Object.freeze(reads);
};

// packages/canard/schema-form/src/core/blueprint/utils/analyze/createBlueprintGate.ts
var createBlueprintGate = (gate) => Object.freeze({
  ...gate,
  evaluationReads: gate.kind === "active" ? collectGateEvaluationReads(gate.condition) : Object.freeze([])
});

// packages/canard/schema-form/src/core/blueprint/utils/analyze/collectSchemaCapabilities.ts
var import_filter11 = require("@winglet/common-utils/filter");
var import_lib3 = require("@winglet/common-utils/lib");

// packages/canard/schema-form/src/core/blueprint/utils/analyze/isLiteralDefault.ts
var import_filter10 = require("@winglet/common-utils/filter");
var isLiteralDefault = (value, active) => {
  if (value === null || typeof value === "string" || typeof value === "boolean") return true;
  if (typeof value === "number") return Number.isFinite(value);
  if (typeof value !== "object") return false;
  const prototype = Object.getPrototypeOf(value);
  if (!(0, import_filter10.isArray)(value) && prototype !== Object.prototype && prototype !== null) return false;
  active ??= /* @__PURE__ */ new WeakSet();
  if (active.has(value)) return false;
  active.add(value);
  const keys = Object.keys(value);
  for (let index = 0; index < keys.length; index++) {
    const descriptor = Object.getOwnPropertyDescriptor(value, keys[index]);
    if (!descriptor || !("value" in descriptor) || !isLiteralDefault(descriptor.value, active))
      return false;
  }
  active.delete(value);
  return true;
};

// packages/canard/schema-form/src/core/blueprint/utils/analyze/collectSchemaCapabilities.ts
var EXPRESSION_KEYS = [
  "active",
  "visible",
  "readOnly",
  "disabled",
  "unsetOnInactive",
  "derived",
  "unsetValue",
  "resetInteraction"
];
var collectSchemaCapabilities = (context, schema) => {
  const record = readSchemaObject(schema);
  const capabilities = context.capabilities;
  if (context.staticFirstLoad) {
    const fallback = Object.getOwnPropertyDescriptor(record, "default");
    if (fallback && (!("value" in fallback) || fallback.value !== void 0 && !isLiteralDefault(fallback.value))) context.staticFirstLoad = false;
  }
  if (record.oneOf !== void 0 || record.anyOf !== void 0 || record.if !== void 0 || record.then !== void 0 || record.else !== void 0)
    capabilities.branchless = false;
  if (record.readOnly !== void 0) capabilities.hasState = true;
  const controls = record.controls;
  if (!controls) return;
  if (controls.discriminator !== void 0) capabilities.branchless = false;
  const children = controls.children;
  for (let index = -1; index < ((0, import_filter11.isArray)(children) ? children.length : 0); index++) {
    const group = index < 0 ? controls : children[index].controls;
    if (!group) continue;
    if ((0, import_lib3.hasOwnProperty)(group, "default") || group.unsetValue !== void 0 || group.injectTo !== void 0) context.staticFirstLoad = false;
    if (group.active !== void 0) capabilities.branchless = false;
    if (group.watch !== void 0) capabilities.hasWatch = true;
    if (group.visible !== void 0 || group.readOnly !== void 0 || group.disabled !== void 0)
      capabilities.hasState = true;
    if (group.derived !== void 0 || group.unsetValue !== void 0 || group.resetInteraction !== void 0 || group.injectTo !== void 0)
      capabilities.hasDerive = true;
    if (!capabilities.hasExpressions) {
      for (let key = 0; key < EXPRESSION_KEYS.length; key++)
        if (typeof group[EXPRESSION_KEYS[key]] === "string") {
          capabilities.hasExpressions = true;
          break;
        }
    }
  }
};

// packages/canard/schema-form/src/core/blueprint/utils/analyze/readDiscriminatorBranches.ts
var import_filter12 = require("@winglet/common-utils/filter");
var import_lib4 = require("@winglet/common-utils/lib");
var import_object4 = require("@winglet/common-utils/object");
var import_pointer3 = require("@winglet/json/pointer");
var readDiscriminatorBranches = (context, schema, schemaPath) => {
  const host = readSchemaObject(schema);
  const propertyName = host.controls?.discriminator;
  const result = /* @__PURE__ */ new Map();
  if (propertyName === void 0) return result;
  if (typeof propertyName !== "string" || !propertyName.length)
    return throwBlueprintError(
      BlueprintErrorCode.InvalidControlShape,
      `${schemaPath}/controls/discriminator`,
      { group: "controls", key: "discriminator", expected: "string" },
      context.options
    );
  for (const keyword of ["oneOf", "anyOf"]) {
    if (!(0, import_filter12.isArray)(host[keyword])) continue;
    let previousMask;
    const previousValues = [];
    for (let index = 0; index < host[keyword].length; index++) {
      const branch = host[keyword][index];
      const branchPath = `${schemaPath}/${keyword}/${index}`;
      const parts = collectStaticSchemas(context, branch, branchPath);
      let branchTypes;
      for (const part of parts)
        branchTypes = intersectAllowedTypes(
          branchTypes,
          readAllowedTypes(part.schema, part.schemaPath, context.options)
        );
      if (branchTypes?.every((type) => type === "null")) continue;
      let values;
      let mask;
      for (const part of parts) {
        const property = readSchemaObject(part.schema).properties?.[propertyName];
        if (property === void 0) continue;
        const propertyPath = `${part.schemaPath}/properties/${(0, import_pointer3.escapeSegment)(propertyName)}`;
        const types = inferAllowedTypes(context, property, propertyPath, true);
        if (types) mask = foldAllowedTypes(types);
        for (const tag of collectStaticSchemas(
          context,
          property,
          propertyPath
        )) {
          const record = readSchemaObject(tag.schema);
          const restrictions = [
            record.enum,
            (0, import_lib4.hasOwnProperty)(record, "const") ? [record.const] : void 0
          ];
          for (const restriction of restrictions) {
            if (!(0, import_filter12.isArray)(restriction)) continue;
            const intersection = intersectEnum(values, restriction, true);
            if (intersection === EMPTY_INTERSECTION || intersection?.length === 0)
              return throwBlueprintError(
                BlueprintErrorCode.EmptyEnumIntersection,
                tag.schemaPath,
                { propertyName },
                context.options
              );
            values = intersection;
          }
        }
      }
      if (values === void 0) continue;
      if (mask !== void 0 && previousMask !== void 0 && mask !== previousMask)
        return throwBlueprintError(
          BlueprintErrorCode.DiscriminatorMismatch,
          branchPath,
          { propertyName, reason: "kind" },
          context.options
        );
      if (values.some(
        (value) => previousValues.some((previous) => (0, import_object4.equals)(previous, value))
      ))
        return throwBlueprintError(
          BlueprintErrorCode.DiscriminatorMismatch,
          branchPath,
          { propertyName, reason: "overlap" },
          context.options
        );
      previousMask = mask ?? previousMask;
      previousValues.push(...values);
      result.set(
        branchPath,
        Object.freeze({ propertyName, values: Object.freeze([...values]) })
      );
    }
  }
  if (!result.size)
    return throwBlueprintError(
      BlueprintErrorCode.DiscriminatorMismatch,
      schemaPath,
      { propertyName, reason: "missing" },
      context.options
    );
  return result;
};

// packages/canard/schema-form/src/core/blueprint/utils/analyze/collectDeclarations.ts
var FRAGMENT_KEYWORDS = [
  ["allOf", 1],
  ["then", 2],
  ["else", 2],
  ["oneOf", 3],
  ["anyOf", 4]
];
var collectDeclarations = (context, input, path, visiting = [], ownerId) => {
  const state = globalThis.__allocState;
  if (state.collectDepth) return (() => {
    if (visiting.includes(input.schemaPath)) return [];
    const schema = readSchemaObject(input.schema);
    validateControlGroups(
      context,
      input.schema,
      input.schemaPath,
      input.isFragment ?? false
    );
    readAllowedTypes(input.schema, input.schemaPath, context.options);
    collectSchemaCapabilities(context, input.schema);
    if (input.gates.length || input.context === "declaration")
      context.capabilities.branchless = false;
    const gates = [...input.gates];
    if (schema.controls?.active !== void 0 && !gates.some(
      (gate) => gate.schemaPath === `${input.schemaPath}/controls/active`
    ))
      gates.push(
        createBlueprintGate({
          kind: "active",
          schemaPath: `${input.schemaPath}/controls/active`,
          hostPath: path,
          condition: schema.controls.active
        })
      );
    const fragment = {
      id: context.fragments.length,
      hostPath: path,
      schemaPath: input.schemaPath,
      schema: input.schema,
      context: input.context,
      order: Object.freeze([...input.order]),
      gates: Object.freeze(gates),
      declares: [],
      overlays: [],
      inheritedOverlays: [],
      children: []
    };
    context.fragments.push(fragment);
    input.fragment?.children.push(fragment.id);
    const declaration = Object.freeze({
      id: context.declarationId++,
      name: path.slice(path.lastIndexOf("/") + 1),
      path,
      schemaPath: input.schemaPath,
      schema: input.schema,
      fragmentId: fragment.id,
      role: input.role,
      scope: input.isFragment ? "fragment" : "node",
      validationOnly: false,
      context: input.context,
      gates: fragment.gates,
      order: fragment.order,
      inherited: input.inherited,
      hostPath: input.hostPath
    });
    fragment[input.role === "declaration" ? "declares" : "overlays"].push(
      declaration.id
    );
    if (input.inherited) fragment.inheritedOverlays.push(declaration.id);
    const result2 = [declaration];
    const owner = ownerId ?? declaration.id;
    if (!context.capabilities.branchless)
      (context.declarationOwners ??= /* @__PURE__ */ new Map()).set(declaration.id, owner);
    const discriminators = schema.controls?.discriminator === void 0 ? void 0 : readDiscriminatorBranches(
      context,
      input.schema,
      input.schemaPath
    );
    if (discriminators?.size) {
      context.discriminatorBranches ??= /* @__PURE__ */ new Set();
      for (const branchPath of discriminators.keys())
        context.discriminatorBranches.add(branchPath);
    }
    const stack = [...visiting, input.schemaPath];
    if (typeof schema.$ref === "string") {
      const target = resolveReference(context, schema.$ref, input.schemaPath);
      result2.push(
        ...collectDeclarations(
          context,
          {
            ...input,
            ...target,
            gates,
            fragment,
            role: "overlay",
            inherited: true
          },
          path,
          stack,
          owner
        )
      );
    }
    for (let keywordIndex = 0; keywordIndex < FRAGMENT_KEYWORDS.length; keywordIndex++) {
      const [keyword, rank] = FRAGMENT_KEYWORDS[keywordIndex];
      if ((keyword === "then" || keyword === "else") && schema.if === void 0)
        continue;
      const values = keyword === "then" || keyword === "else" ? [schema[keyword]] : schema[keyword];
      if (!(0, import_filter13.isArray)(values)) continue;
      for (let index = 0; index < values.length; index++) {
        const child = values[index];
        if (child === void 0 || child === false) continue;
        const childPath = `${input.schemaPath}/${keyword}${keyword === "then" || keyword === "else" ? "" : `/${index}`}`;
        const nestedGates = [...gates];
        const discriminator = discriminators?.get(childPath);
        if (discriminator)
          nestedGates.push(
            createBlueprintGate({
              kind: "discriminator",
              schemaPath: childPath,
              hostPath: path,
              condition: discriminator
            })
          );
        if (keyword === "then" || keyword === "else")
          nestedGates.push(
            createBlueprintGate({
              kind: "if",
              schemaPath: `${input.schemaPath}/if`,
              hostPath: path,
              condition: schema.if,
              negated: keyword === "else"
            })
          );
        const branch = keyword === "oneOf" || keyword === "anyOf";
        const active = readSchemaObject(child).controls?.active;
        const declarationOnly = input.context === "declaration" || branch && active === void 0 && discriminator === void 0;
        result2.push(
          ...collectDeclarations(
            context,
            {
              schema: child,
              schemaPath: childPath,
              role: "overlay",
              gates: nestedGates,
              context: declarationOnly ? "declaration" : "conjunction",
              order: [...input.order, rank, keyword === "else" ? 1 : index],
              inherited: input.inherited,
              hostPath: path,
              fragment,
              isFragment: true
            },
            path,
            stack,
            owner
          )
        );
      }
    }
    return result2;
  })();
  const { tape, at, replay } = __allocTake("declarations");
  if (replay) {
    const held = tape[at];
    if (!held) throw new Error("Declaration tape exhausted");
    for (const fragment of held.fragments) context.fragments.push(fragment);
    context.declarationId = held.nextId;
    Object.assign(context.capabilities, held.capabilities);
    if (held.owners) context.declarationOwners = held.owners;
    if (held.branches) context.discriminatorBranches = held.branches;
    return held.result;
  }
  const begin = context.fragments.length;
  state.collectDepth = 1;
  const result = (() => {
    if (visiting.includes(input.schemaPath)) return [];
    const schema = readSchemaObject(input.schema);
    validateControlGroups(
      context,
      input.schema,
      input.schemaPath,
      input.isFragment ?? false
    );
    readAllowedTypes(input.schema, input.schemaPath, context.options);
    collectSchemaCapabilities(context, input.schema);
    if (input.gates.length || input.context === "declaration")
      context.capabilities.branchless = false;
    const gates = [...input.gates];
    if (schema.controls?.active !== void 0 && !gates.some(
      (gate) => gate.schemaPath === `${input.schemaPath}/controls/active`
    ))
      gates.push(
        createBlueprintGate({
          kind: "active",
          schemaPath: `${input.schemaPath}/controls/active`,
          hostPath: path,
          condition: schema.controls.active
        })
      );
    const fragment = {
      id: context.fragments.length,
      hostPath: path,
      schemaPath: input.schemaPath,
      schema: input.schema,
      context: input.context,
      order: Object.freeze([...input.order]),
      gates: Object.freeze(gates),
      declares: [],
      overlays: [],
      inheritedOverlays: [],
      children: []
    };
    context.fragments.push(fragment);
    input.fragment?.children.push(fragment.id);
    const declaration = Object.freeze({
      id: context.declarationId++,
      name: path.slice(path.lastIndexOf("/") + 1),
      path,
      schemaPath: input.schemaPath,
      schema: input.schema,
      fragmentId: fragment.id,
      role: input.role,
      scope: input.isFragment ? "fragment" : "node",
      validationOnly: false,
      context: input.context,
      gates: fragment.gates,
      order: fragment.order,
      inherited: input.inherited,
      hostPath: input.hostPath
    });
    fragment[input.role === "declaration" ? "declares" : "overlays"].push(
      declaration.id
    );
    if (input.inherited) fragment.inheritedOverlays.push(declaration.id);
    const result2 = [declaration];
    const owner = ownerId ?? declaration.id;
    if (!context.capabilities.branchless)
      (context.declarationOwners ??= /* @__PURE__ */ new Map()).set(declaration.id, owner);
    const discriminators = schema.controls?.discriminator === void 0 ? void 0 : readDiscriminatorBranches(
      context,
      input.schema,
      input.schemaPath
    );
    if (discriminators?.size) {
      context.discriminatorBranches ??= /* @__PURE__ */ new Set();
      for (const branchPath of discriminators.keys())
        context.discriminatorBranches.add(branchPath);
    }
    const stack = [...visiting, input.schemaPath];
    if (typeof schema.$ref === "string") {
      const target = resolveReference(context, schema.$ref, input.schemaPath);
      result2.push(
        ...collectDeclarations(
          context,
          {
            ...input,
            ...target,
            gates,
            fragment,
            role: "overlay",
            inherited: true
          },
          path,
          stack,
          owner
        )
      );
    }
    for (let keywordIndex = 0; keywordIndex < FRAGMENT_KEYWORDS.length; keywordIndex++) {
      const [keyword, rank] = FRAGMENT_KEYWORDS[keywordIndex];
      if ((keyword === "then" || keyword === "else") && schema.if === void 0)
        continue;
      const values = keyword === "then" || keyword === "else" ? [schema[keyword]] : schema[keyword];
      if (!(0, import_filter13.isArray)(values)) continue;
      for (let index = 0; index < values.length; index++) {
        const child = values[index];
        if (child === void 0 || child === false) continue;
        const childPath = `${input.schemaPath}/${keyword}${keyword === "then" || keyword === "else" ? "" : `/${index}`}`;
        const nestedGates = [...gates];
        const discriminator = discriminators?.get(childPath);
        if (discriminator)
          nestedGates.push(
            createBlueprintGate({
              kind: "discriminator",
              schemaPath: childPath,
              hostPath: path,
              condition: discriminator
            })
          );
        if (keyword === "then" || keyword === "else")
          nestedGates.push(
            createBlueprintGate({
              kind: "if",
              schemaPath: `${input.schemaPath}/if`,
              hostPath: path,
              condition: schema.if,
              negated: keyword === "else"
            })
          );
        const branch = keyword === "oneOf" || keyword === "anyOf";
        const active = readSchemaObject(child).controls?.active;
        const declarationOnly = input.context === "declaration" || branch && active === void 0 && discriminator === void 0;
        result2.push(
          ...collectDeclarations(
            context,
            {
              schema: child,
              schemaPath: childPath,
              role: "overlay",
              gates: nestedGates,
              context: declarationOnly ? "declaration" : "conjunction",
              order: [...input.order, rank, keyword === "else" ? 1 : index],
              inherited: input.inherited,
              hostPath: path,
              fragment,
              isFragment: true
            },
            path,
            stack,
            owner
          )
        );
      }
    }
    return result2;
  })();
  state.collectDepth = 0;
  tape[at] = {
    result,
    fragments: context.fragments.slice(begin),
    nextId: context.declarationId,
    capabilities: { ...context.capabilities },
    owners: context.declarationOwners,
    branches: context.discriminatorBranches
  };
  return result;
};
var __allocTake = (site) => {
  const state = globalThis.__allocState;
  const at = state.cursors[site] ?? 0;
  state.cursors[site] = at + 1;
  const slot = state.slot ??= {};
  slot.tape = state.tapes[site] ??= [];
  slot.at = at;
  slot.replay = state.replay;
  return slot;
};

// packages/canard/schema-form/src/core/blueprint/utils/analyze/getTemplateKey.ts
var getTemplateKey = (context, inputs) => JSON.stringify(
  inputs.map((input) => {
    const schema = readSchemaObject(input.schema);
    const location = typeof schema.$ref === "string" && Object.keys(schema).length === 1 ? resolveReference(context, schema.$ref, input.schemaPath).schemaPath : input.schemaPath;
    const gates = input.gates.map(
      (gate) => `${gate.kind}:${gate.schemaPath}:${Boolean(gate.negated)}:${gate.appliesWhen?.map((owner) => owner.schemaPath).filter((path, index, paths) => paths.indexOf(path) === index).join(",") ?? ""}`
    );
    return [
      location,
      input.context,
      gates.filter((gate, index) => gates.indexOf(gate) === index)
    ];
  })
);

// packages/canard/schema-form/src/core/blueprint/utils/analyze/populateNodeChildren.ts
var import_filter15 = require("@winglet/common-utils/filter");
var import_pointer5 = require("@winglet/json/pointer");

// packages/canard/schema-form/src/core/blueprint/utils/analyze/populateVirtualNodes.ts
var import_filter14 = require("@winglet/common-utils/filter");
var import_pointer4 = require("@winglet/json/pointer");
var populateVirtualNodes = (context, host) => {
  const groups = /* @__PURE__ */ new Map();
  for (const declaration of host.declarations) {
    const virtual = readSchemaObject(declaration.schema).options?.virtual;
    if (virtual === void 0) continue;
    if (!virtual || typeof virtual !== "object" || (0, import_filter14.isArray)(virtual))
      throwBlueprintError(
        BlueprintErrorCode.VirtualFieldsNotValid,
        `${declaration.schemaPath}/options/virtual`,
        {},
        context.options
      );
    for (const [name, value] of Object.entries(virtual)) {
      const schema = readSchemaObject(value);
      const schemaPath = `${declaration.schemaPath}/options/virtual/${(0, import_pointer4.escapeSegment)(name)}`;
      const fields = schema.fields;
      if (!(0, import_filter14.isArray)(fields) || fields.some((field) => typeof field !== "string") || fields.some((field, index) => fields.indexOf(field) !== index))
        throwBlueprintError(
          BlueprintErrorCode.VirtualFieldsNotValid,
          schemaPath,
          { fields },
          context.options
        );
      for (const field of fields)
        if (!host.childEntries.some(
          (edge) => edge.name === field && edge.node.kind !== "virtual"
        ))
          throwBlueprintError(
            BlueprintErrorCode.VirtualFieldsNotInProperties,
            schemaPath,
            { field },
            context.options
          );
      const group = groups.get(name);
      if (group && (group.fields.length !== fields.length || group.fields.some((field, index) => field !== fields[index])))
        throwBlueprintError(
          BlueprintErrorCode.VirtualFieldsMismatch,
          schemaPath,
          { name, fields, previous: group.fields },
          context.options
        );
      const declarations = collectDeclarations(
        context,
        {
          schema,
          schemaPath,
          context: declaration.context,
          gates: declaration.gates,
          order: [
            ...declaration.order,
            0,
            host.childEntries.length + groups.size
          ],
          role: "declaration",
          inherited: declaration.inherited,
          hostPath: host.path,
          fragment: context.fragments[declaration.fragmentId]
        },
        `${host.path}/${(0, import_pointer4.escapeSegment)(name)}`
      );
      if (group) group.declarations.push(...declarations);
      else
        groups.set(name, { fields: Object.freeze([...fields]), declarations });
    }
  }
  for (const [name, group] of groups) {
    const node = {
      id: context.nodes.length,
      path: `${host.path}/${(0, import_pointer4.escapeSegment)(name)}`,
      schemaPath: group.declarations[0].schemaPath,
      kind: "virtual",
      schemaType: "virtual",
      nullable: false,
      strategy: resolveNodeStrategy(context, "virtual", group.declarations),
      declarations: Object.freeze(group.declarations),
      childEntries: group.fields.flatMap(
        (field) => host.childEntries.filter((edge) => edge.name === field)
      ),
      fields: group.fields
    };
    context.nodes.push(node);
    host.childEntries.push(
      Object.freeze({
        name,
        node,
        declarations: node.declarations,
        hostPath: host.path
      })
    );
  }
};

// packages/canard/schema-form/src/core/blueprint/utils/analyze/populateNodeChildren.ts
var populateNodeChildren = (context, node, build) => {
  const properties = /* @__PURE__ */ new Map();
  const itemInputs = [];
  const tuples = /* @__PURE__ */ new Map();
  const childrenControls = node.declarations.flatMap(
    (owner) => (readSchemaObject(owner.schema).controls?.children ?? []).map(
      (entry, index) => ({
        entry,
        gate: entry.controls?.active === void 0 ? void 0 : createBlueprintGate({
          kind: "active",
          schemaPath: `${owner.schemaPath}/controls/children/${index}/controls/active`,
          hostPath: node.path,
          condition: entry.controls.active,
          ...owner.gates.length ? { appliesWhen: owner.gates } : {}
        })
      })
    )
  );
  for (const declaration of node.declarations) {
    const schema = readSchemaObject(declaration.schema);
    if (schema.type === "null" || (0, import_filter15.isArray)(schema.type) && schema.type.length === 1 && schema.type[0] === "null")
      continue;
    const base = {
      context: declaration.context,
      gates: declaration.gates,
      inherited: declaration.inherited,
      hostPath: node.path,
      fragment: context.fragments[declaration.fragmentId],
      role: "declaration"
    };
    if (node.kind === "object" && schema.properties && typeof schema.properties === "object")
      Object.entries(schema.properties).forEach(([name, child], index) => {
        const input = {
          ...base,
          schema: child,
          schemaPath: `${declaration.schemaPath}/properties/${(0, import_pointer5.escapeSegment)(name)}`,
          order: [...declaration.order, 0, index]
        };
        const entryGates = childrenControls.filter(
          ({ entry, gate }) => entry.targets.includes(name) && gate !== void 0
        ).map(({ gate }) => gate);
        input.gates = [...input.gates, ...entryGates];
        const existing = properties.get(name);
        if (existing) existing.push(input);
        else properties.set(name, [input]);
        const discriminatorIndex = input.gates.findIndex(
          (gate) => gate.kind === "discriminator" && gate.condition.propertyName === name
        );
        if (discriminatorIndex >= 0)
          properties.get(name).push({
            ...input,
            gates: input.gates.slice(0, discriminatorIndex),
            context: "declaration"
          });
      });
    if (node.kind !== "array") continue;
    const tuple = schema.prefixItems ?? ((0, import_filter15.isArray)(schema.items) ? schema.items : void 0);
    if (schema.prefixItems !== void 0 && !(0, import_filter15.isArray)(schema.prefixItems))
      throwBlueprintError(
        BlueprintErrorCode.UnexpectedArraySchema,
        declaration.schemaPath,
        { prefixItems: schema.prefixItems },
        context.options
      );
    if (tuple)
      tuple.forEach((child, index) => {
        const input = {
          ...base,
          schema: child,
          schemaPath: `${declaration.schemaPath}/${schema.prefixItems ? "prefixItems" : "items"}/${index}`,
          order: [...declaration.order, 0, index]
        };
        const existing = tuples.get(index);
        if (existing) existing.push(input);
        else tuples.set(index, [input]);
      });
    if (schema.items !== void 0 && typeof schema.items !== "boolean" && !(0, import_filter15.isArray)(schema.items)) {
      if (schema.items === null || typeof schema.items !== "object")
        throwBlueprintError(
          BlueprintErrorCode.UnexpectedArraySchema,
          declaration.schemaPath,
          { items: schema.items },
          context.options
        );
      itemInputs.push({
        ...base,
        schema: schema.items,
        schemaPath: `${declaration.schemaPath}/items`,
        order: [...declaration.order, 0, 0]
      });
    }
    const additionalItems = (0, import_filter15.isArray)(schema.items) && schema.prefixItems === void 0 ? schema.additionalItems : void 0;
    if (additionalItems !== null && typeof additionalItems === "object" && !(0, import_filter15.isArray)(additionalItems))
      itemInputs.push({
        ...base,
        schema: additionalItems,
        schemaPath: `${declaration.schemaPath}/additionalItems`,
        order: [...declaration.order, 0, schema.items.length]
      });
  }
  const entries = node.childEntries;
  for (const [name, inputs] of properties) {
    const path = `${node.path}/${(0, import_pointer5.escapeSegment)(name)}`;
    for (const child of build(context, inputs, path)) {
      const declarations = child.declarations.map(
        (declaration) => Object.freeze({
          ...declaration,
          name,
          path,
          hostPath: node.path,
          schemaPath: declaration.schemaPath === child.schemaPath ? inputs[0].schemaPath : declaration.schemaPath,
          gates: Object.freeze(
            declaration.gates.map(
              (gate) => gate.hostPath === child.path ? createBlueprintGate({ ...gate, hostPath: path }) : gate
            )
          )
        })
      );
      entries.push(
        Object.freeze({
          name,
          node: child,
          hostPath: node.path,
          declarations: Object.freeze(declarations)
        })
      );
    }
  }
  if (itemInputs.length)
    node.item = build(context, itemInputs, `${node.path}/*`)[0];
  if (tuples.size)
    node.prefixItems = Object.freeze(
      [...tuples].sort(([a], [b]) => a - b).map(
        ([index, inputs]) => build(context, inputs, `${node.path}/${index}`)[0]
      )
    );
  if (node.kind === "object") populateVirtualNodes(context, node);
};

// packages/canard/schema-form/src/core/blueprint/utils/analyze/buildNodes.ts
var buildNodes = (context, inputs, path) => {
  const key = getTemplateKey(context, inputs);
  const hostPaths = [];
  for (let index = 0; index < inputs.length; index++) {
    const gates = inputs[index].gates;
    const paths = [];
    for (let gate = 0; gate < gates.length; gate++) paths.push(gates[gate].hostPath);
    hostPaths.push(paths);
  }
  const boundKey = JSON.stringify([key, hostPaths]);
  const cached = context.templates.get(boundKey) ?? context.constructing.get(key);
  if (context.constructing.has(key)) context.staticFirstLoad = false;
  if (cached) return cached;
  const declarations = [];
  for (let index = 0; index < inputs.length; index++) {
    const collected = collectDeclarations(context, inputs[index], path);
    for (let item = 0; item < collected.length; item++) declarations.push(collected[item]);
  }
  const groups = resolveNodeTypes(context, declarations);
  const nodes = [];
  for (let index = 0; index < groups.length; index++) {
    const group = groups[index];
    const nonNull = [];
    let nullable = false;
    for (let type = 0; type < group.allowed.length; type++) {
      const allowed = group.allowed[type];
      if (allowed === "null") nullable = true;
      else nonNull.push(allowed);
    }
    const schemaType = nonNull.length > 1 ? Object.freeze(nonNull) : nonNull[0] ?? "null";
    const kind = (0, import_filter16.isArray)(schemaType) ? "union" : schemaType === "integer" ? "number" : schemaType;
    const ownedDeclarations = [];
    const conjunctions = [];
    for (let item = 0; item < group.declarations.length; item++) {
      const declaration = group.declarations[item];
      const owned = declaration.scope === "fragment" && declaration.context === "declaration" && kind !== "object" && kind !== "array" ? Object.freeze({ ...declaration, validationOnly: true }) : declaration;
      ownedDeclarations.push(owned);
      if (owned.context === "conjunction") conjunctions.push(owned);
    }
    const node = {
      id: context.nodes.length,
      path,
      schemaPath: inputs[0].schemaPath,
      kind,
      schemaType,
      nullable,
      strategy: resolveNodeStrategy(context, kind, group.declarations),
      declarations: Object.freeze(ownedDeclarations),
      childEntries: []
    };
    context.nodes.push(node);
    const effective = mergeEffectiveSchema(
      {
        ...node,
        declarations: conjunctions
      },
      [],
      {
        mode: "static",
        isAtomic: context.options.isAtomic,
        collect: context.options.collect
      }
    );
    if (ownedDeclarations.length === 1 && ownedDeclarations[0].gates.length === 0 && !node.nullable && context.options.isAtomic === void 0 && context.options.collect === void 0) {
      const declaration = ownedDeclarations[0];
      const schema = declaration.schema;
      if (declaration.context === "conjunction" && declaration.role === "declaration" && declaration.scope === "node" && !declaration.validationOnly && (typeof schema === "boolean" || schema.nullable === void 0 && schema.pattern === void 0 && !(0, import_filter16.isArray)(schema.type)))
        DEFAULT_NO_ACTIVE.set(node, effective);
    }
    nodes.push(node);
  }
  context.templates.set(boundKey, nodes);
  context.constructing.set(key, nodes);
  for (let index = 0; index < nodes.length; index++) {
    const node = nodes[index];
    if (node.strategy === "branch")
      populateNodeChildren(context, node, buildNodes);
  }
  context.constructing.delete(key);
  return nodes;
};

// packages/canard/schema-form/src/core/blueprint/utils/analyze/compileBlueprintExpressions.ts
var import_filter18 = require("@winglet/common-utils/filter");

// packages/canard/schema-form/src/helpers/error/formatErrorMessage/utils/constants.ts
var DEFAULT_DIVIDER_WIDTH = 50;

// packages/canard/schema-form/src/helpers/error/formatErrorMessage/utils/createDivider.ts
var createDivider = (width = DEFAULT_DIVIDER_WIDTH) => "\u2500".repeat(width);

// packages/canard/schema-form/src/helpers/error/formatErrorMessage/utils/getErrorMessage.ts
var getErrorMessage = (error) => error instanceof Error ? error.message : String(error ?? "Unknown error");

// packages/canard/schema-form/src/helpers/error/formatErrorMessage/formatDynamicFunctionError.ts
var import_filter17 = require("@winglet/common-utils/filter");

// packages/canard/schema-form/src/helpers/error/formatErrorMessage/utils/formatMultiLine.ts
var formatMultiLine = (text, prefix = "\n  \u2502    ") => text.replace(/\n/g, prefix);

// packages/canard/schema-form/src/helpers/error/formatErrorMessage/formatDynamicFunctionError.ts
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

// packages/canard/schema-form/src/app/constants/bitmask.ts
var BIT_MASK_ALL = ~0;
var BIT_MASK_NONE = 0;
var BIT_FLAG_00 = 1;
var BIT_FLAG_01 = 2;
var BIT_FLAG_02 = 4;
var BIT_FLAG_03 = 8;

// packages/canard/schema-form/src/core/blueprint/utils/expressions/createDynamicFunction/utils/wrapReturnStatements.ts
var wrapReturnStatements = (body) => body.replace(
  RETURN_PATTERN,
  (_, __, ___, expression) => expression ? `return !!(${expression.trim()})` : "return false"
);
var RETURN_PATTERN = /\breturn([ \t]*)(?:([ \t]+)(.+?))?(?=;|\n|$)/g;

// packages/canard/schema-form/src/core/blueprint/utils/expressions/createDynamicFunction/utils/getFunctionBody.ts
var getFunctionBody = (expression, coerceToBoolean) => {
  if (expression.startsWith("{") && expression.endsWith("}")) {
    const functionBody = expression.slice(1, -1).trim();
    if (coerceToBoolean) return wrapReturnStatements(functionBody);
    return functionBody;
  }
  return coerceToBoolean ? `return !!(${expression})` : `return ${expression}`;
};

// packages/canard/schema-form/src/core/blueprint/utils/expressions/createDynamicFunction/createDynamicFunction.ts
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

// packages/canard/schema-form/src/core/blueprint/utils/expressions/getPathManager/getPathManager.ts
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

// packages/canard/schema-form/src/core/blueprint/utils/analyze/compileBlueprintExpressions/utils/registerBlueprintDependency.ts
var registerBlueprintDependency = (context, path, declaration, schemaPath) => {
  if (typeof path !== "string" || path.split("/").includes("*"))
    throwBlueprintError(
      BlueprintErrorCode.ObservedValues,
      schemaPath,
      {
        path,
        guidance: "Dependencies must be strings without wildcard path segments."
      },
      context.options
    );
  const dependencies = context.dependencies ??= /* @__PURE__ */ Object.create(null);
  context.capabilities.hasDependencies = true;
  const ids = dependencies[path] ?? (dependencies[path] = []);
  if (!ids.includes(declaration.id)) ids.push(declaration.id);
};

// packages/canard/schema-form/src/core/blueprint/utils/analyze/compileBlueprintExpressions/utils/hasCompleteExpressionReads.ts
var hasCompleteExpressionReads = (source) => {
  const expression = source.replace(JSON_POINTER_PATH_REGEX, "0").replace(/"(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'/g, "0").replace(/\b(?:true|false|null|undefined)\b/g, "0");
  return !/(?:[\d.)]\s*\(|\+\+|--|\/\/|\/\*|(^|[^=!<>])=([^=]|$))/.test(expression) && /^[\s\d.()+\-*/%<>=!&|?:~]*$/.test(expression);
};

// packages/canard/schema-form/src/core/blueprint/utils/analyze/compileBlueprintExpressions/utils/CompleteExpressionReads.ts
var CompleteExpressionReads = /* @__PURE__ */ new WeakSet();

// packages/canard/schema-form/src/core/blueprint/utils/analyze/compileBlueprintExpressions.ts
var EXPRESSION_KEYS2 = [
  "active",
  "visible",
  "readOnly",
  "disabled",
  "unsetOnInactive",
  "derived",
  "unsetValue",
  "resetInteraction"
];
var compileBlueprintExpressions = (context) => {
  const expressions = [];
  const visited = /* @__PURE__ */ new Set();
  for (let nodeIndex = 0; nodeIndex < context.nodes.length; nodeIndex++) {
    const declarations = context.nodes[nodeIndex].declarations;
    for (let declarationIndex = 0; declarationIndex < declarations.length; declarationIndex++) {
      const declaration = declarations[declarationIndex];
      if (visited.has(declaration.id) || declaration.validationOnly) continue;
      visited.add(declaration.id);
      const controls = readSchemaObject(declaration.schema).controls;
      if (!controls) continue;
      const children = controls.children;
      for (let groupIndex = -1; groupIndex < (children?.length ?? 0); groupIndex++) {
        const groupControls = groupIndex < 0 ? controls : children[groupIndex].controls;
        if (!groupControls) continue;
        const groupPath = groupIndex < 0 ? `${declaration.schemaPath}/controls` : `${declaration.schemaPath}/controls/children/${groupIndex}/controls`;
        const watch = groupControls.watch;
        if (watch !== void 0) {
          const paths = (0, import_filter18.isArray)(watch) ? watch : [watch];
          for (let path = 0; path < paths.length; path++)
            registerBlueprintDependency(
              context,
              paths[path],
              declaration,
              `${groupPath}/watch`
            );
        }
        for (let keyIndex = 0; keyIndex < EXPRESSION_KEYS2.length; keyIndex++) {
          const key = EXPRESSION_KEYS2[keyIndex];
          const source = groupControls[key];
          if (typeof source !== "string") continue;
          const schemaPath = `${groupPath}/${key}`;
          const manager = getPathManager();
          let evaluate;
          try {
            evaluate = key === "derived" ? createDynamicFunction(manager, key, source) : createDynamicFunction(manager, key, source, true);
          } catch (cause) {
            throwBlueprintError(
              BlueprintErrorCode.CreateDynamicFunction,
              schemaPath,
              { cause, expression: source },
              context.options
            );
          }
          if (!evaluate) continue;
          const dependencies = Object.freeze([...manager.get()]);
          for (let path = 0; path < dependencies.length; path++)
            registerBlueprintDependency(context, dependencies[path], declaration, schemaPath);
          const compiled = Object.freeze({
            declarationId: declaration.id,
            schemaPath,
            hostPath: declaration.path,
            key,
            dependencies,
            evaluate
          });
          if (context.capabilities.hasDerive && hasCompleteExpressionReads(source))
            CompleteExpressionReads.add(compiled);
          expressions.push(compiled);
        }
      }
    }
  }
  if (context.dependencies)
    for (const ids of Object.values(context.dependencies)) Object.freeze(ids);
  return Object.freeze(expressions);
};

// packages/canard/schema-form/src/core/blueprint/utils/analyze/validateShape/utils/visitShape.ts
var visitShape = (context, node, complete, active) => {
  if (node.strategy === "terminal" || node.kind === "array" || complete.has(node))
    return;
  if (active.has(node))
    throwBlueprintError(
      BlueprintErrorCode.RecursiveShapeUnbounded,
      node.schemaPath,
      { path: node.path },
      context.options
    );
  active.add(node);
  for (const edge of node.childEntries)
    if (edge.declarations.some(
      (declaration) => declaration.role === "declaration" && !declaration.gates.length
    ))
      visitShape(context, edge.node, complete, active);
  active.delete(node);
  complete.add(node);
};

// packages/canard/schema-form/src/core/blueprint/utils/analyze/validateShape.ts
var validateShape = (context) => {
  const complete = /* @__PURE__ */ new Set();
  const active = /* @__PURE__ */ new Set();
  for (const node of context.nodes) visitShape(context, node, complete, active);
};

// packages/canard/schema-form/src/core/blueprint/utils/diagnostics/collectBlueprintWarnings.ts
var import_filter20 = require("@winglet/common-utils/filter");

// packages/canard/schema-form/src/core/blueprint/utils/diagnostics/collectInlineTerminalWarnings.ts
var import_filter19 = require("@winglet/common-utils/filter");
var import_pointer6 = require("@winglet/json/pointer");
var collectInlineTerminalWarnings = (node, emit) => {
  const pending = node.declarations.filter((declaration) => declaration.role === "declaration").map(({ schema, schemaPath }) => ({
    schema,
    schemaPath,
    root: true,
    ancestors: []
  }));
  const keys = [];
  const paths = [];
  while (pending.length) {
    const entry = pending.pop();
    if (typeof entry.schema === "boolean" || entry.ancestors.includes(entry.schema))
      continue;
    const ancestors = [...entry.ancestors, entry.schema];
    const record = readSchemaObject(entry.schema);
    if (!entry.root) {
      for (const keyword of ["controls", "options", "presentation"])
        if (record[keyword] !== void 0) {
          if (!keys.includes(keyword)) keys.push(keyword);
          if (!paths.includes(entry.schemaPath)) paths.push(entry.schemaPath);
        }
    }
    for (const keyword of [
      "properties",
      "patternProperties",
      "$defs",
      "definitions",
      "dependentSchemas"
    ])
      if (record[keyword] && typeof record[keyword] === "object")
        for (const [name, child] of Object.entries(record[keyword]))
          pending.push({
            schema: child,
            schemaPath: `${entry.schemaPath}/${keyword}/${(0, import_pointer6.escapeSegment)(name)}`,
            root: false,
            ancestors
          });
    for (const keyword of ["allOf", "oneOf", "anyOf", "prefixItems"])
      if ((0, import_filter19.isArray)(record[keyword]))
        record[keyword].forEach(
          (child, index) => pending.push({
            schema: child,
            schemaPath: `${entry.schemaPath}/${keyword}/${index}`,
            root: false,
            ancestors
          })
        );
    for (const keyword of [
      "items",
      "additionalItems",
      "additionalProperties",
      "contains",
      "not",
      "if",
      "then",
      "else",
      "unevaluatedProperties",
      "unevaluatedItems"
    ]) {
      const child = record[keyword];
      if ((0, import_filter19.isArray)(child))
        child.forEach(
          (item, index) => pending.push({
            schema: item,
            schemaPath: `${entry.schemaPath}/${keyword}/${index}`,
            root: false,
            ancestors
          })
        );
      else if (typeof child === "boolean" || child && typeof child === "object")
        pending.push({
          schema: child,
          schemaPath: `${entry.schemaPath}/${keyword}`,
          root: false,
          ancestors
        });
    }
  }
  if (keys.length)
    emit({
      code: BlueprintWarningCode.TerminalSubtreeKeyIgnoredForForm,
      level: "warning",
      schemaPath: node.schemaPath,
      details: {
        keys: Object.freeze(keys.sort()),
        paths: Object.freeze(paths.sort())
      }
    });
};

// packages/canard/schema-form/src/core/blueprint/utils/diagnostics/collectBlueprintWarnings.ts
var collectBlueprintWarnings = (blueprint2, collect) => {
  if (!collect) return;
  const seen = /* @__PURE__ */ new Set();
  const emit = (diagnostic) => {
    const key = `${diagnostic.code}:${diagnostic.schemaPath}:${diagnostic.details.keyword ?? ""}`;
    if (seen.has(key)) return;
    seen.add(key);
    collect(Object.freeze(diagnostic));
  };
  for (const node of blueprint2.nodes) {
    if (node.strategy === "terminal") collectInlineTerminalWarnings(node, emit);
    for (const declaration of node.declarations) {
      const schema = readSchemaObject(declaration.schema);
      const warning = (code, details = {}) => emit({
        code,
        level: "warning",
        schemaPath: declaration.schemaPath,
        details
      });
      for (const keyword of ["dependentSchemas", "dependencies"])
        if (schema[keyword] !== void 0)
          warning(BlueprintWarningCode.DependentSchemasIgnoredForForm, {
            keyword
          });
      if (/\/allOf\/\d+$/.test(declaration.schemaPath)) {
        for (const keyword of [
          "not",
          "dependencies",
          "dependentRequired",
          "dependentSchemas",
          "unevaluatedProperties",
          "unevaluatedItems",
          "contains"
        ])
          if (schema[keyword] !== void 0)
            warning(BlueprintWarningCode.AllOfKeywordIgnoredForForm, {
              keyword
            });
      }
      if (node.kind === "object" && node.strategy === "branch" && (schema.readOnly !== void 0 || schema.controls?.readOnly !== void 0 || schema.controls?.disabled !== void 0))
        warning(BlueprintWarningCode.LockOnNonTerminalObject);
      if (/\/(oneOf|anyOf)\/\d+$/.test(declaration.schemaPath)) {
        if (schema.if !== void 0 && schema.else !== false)
          warning(BlueprintWarningCode.IfWithoutElseFalse);
        if ((schema.type === "null" || (0, import_filter20.isArray)(schema.type) && schema.type.length === 1 && schema.type[0] === "null") && (schema.properties !== void 0 || schema.controls?.active !== void 0))
          warning(BlueprintWarningCode.NullBranchIgnoredForForm);
      }
      for (const gate of declaration.gates) {
        if (gate.kind !== "discriminator") continue;
        const descriptor = gate.condition;
        const tag = node.childEntries.find(
          (entry) => entry.name === descriptor.propertyName
        )?.node;
        if (!tag) continue;
        const allowed = (0, import_filter20.isArray)(tag.schemaType) ? tag.schemaType : [tag.schemaType];
        if (descriptor.values.some(
          (value) => value === null ? !tag.nullable : !allowed.includes(
            (0, import_filter20.isArray)(value) ? "array" : typeof value === "number" && Number.isInteger(value) && allowed.includes("integer") ? "integer" : typeof value
          )
        ))
          emit({
            code: BlueprintWarningCode.DiscriminatorBranchUnreachable,
            level: "warning",
            schemaPath: gate.schemaPath,
            details: { propertyName: descriptor.propertyName }
          });
      }
    }
  }
};

// packages/canard/schema-form/src/core/blueprint/utils/diagnostics/validateChildTargets.ts
var validateChildTargets = (context) => {
  for (const node of context.nodes) {
    let discriminator;
    for (const declaration of node.declarations) {
      const controls = readSchemaObject(declaration.schema).controls;
      if (controls?.discriminator !== void 0) {
        if (discriminator !== void 0 && discriminator !== controls.discriminator)
          throwBlueprintError(
            BlueprintErrorCode.DiscriminatorMismatch,
            declaration.schemaPath,
            {
              propertyName: discriminator,
              other: controls.discriminator,
              reason: "key"
            },
            context.options
          );
        discriminator = controls.discriminator;
      }
      controls?.children?.forEach(
        (entry, index) => {
          for (const target of entry.targets)
            if (node.strategy === "terminal" || !node.childEntries.some((edge) => edge.name === target))
              throwBlueprintError(
                BlueprintErrorCode.ChildrenTargetNotFound,
                `${declaration.schemaPath}/controls/children/${index}`,
                { target },
                context.options
              );
        }
      );
    }
  }
};

// packages/canard/schema-form/src/core/blueprint/utils/features/StaticFirstLoadCapability.ts
var StaticFirstLoadCapability = class {
  static {
    this.eligibility = /* @__PURE__ */ new WeakMap();
  }
  /** Retain the completed declaration/shape proof for one immutable blueprint. */
  static set(blueprint2, eligible) {
    this.eligibility.set(blueprint2, eligible);
  }
  /** Read compiler evidence without scanning declarations at load time. */
  static has(blueprint2) {
    return this.eligibility.get(blueprint2) === true;
  }
};

// packages/canard/schema-form/src/core/blueprint/blueprint.ts
var EMPTY_EXPRESSIONS = Object.freeze([]);
var EMPTY_DEPENDENCIES = Object.freeze(/* @__PURE__ */ Object.create(null));
var blueprint = (schema, options = {}) => {
  const entries = typeof schema === "object" ? options.cache?.get(schema) : void 0;
  const cached = entries?.find(
    (entry) => entry.isTerminal === options.isTerminal && entry.isAtomic === options.isAtomic
  );
  if (cached) {
    if (options.collect && !cached.warningsCollected) {
      collectBlueprintWarnings(cached.blueprint, options.collect);
      cached.warningsCollected = true;
    }
    return cached.blueprint;
  }
  const context = {
    staticFirstLoad: true,
    capabilities: {
      branchless: true,
      hasExpressions: false,
      hasDerive: false,
      hasWatch: false,
      hasState: false,
      hasDependencies: false
    },
    schema,
    options,
    nodes: [],
    fragments: [],
    declarationId: 0,
    declarationOwners: void 0,
    templates: /* @__PURE__ */ new Map(),
    constructing: /* @__PURE__ */ new Map(),
    dependencies: void 0
  };
  const [root] = buildNodes(
    context,
    [
      {
        schema,
        schemaPath: "#",
        context: "conjunction",
        role: "declaration",
        gates: [],
        order: [],
        inherited: false,
        hostPath: ""
      }
    ],
    ""
  );
  validateShape(context);
  validateChildTargets(context);
  const expressions = context.capabilities.hasExpressions || context.capabilities.hasWatch ? compileBlueprintExpressions(context) : EMPTY_EXPRESSIONS;
  for (let index = 0; index < context.nodes.length; index++) {
    const node = context.nodes[index];
    if (node.kind === "virtual" || node.kind === "union" || (node.kind === "object" || node.kind === "array") && node.strategy !== "branch")
      context.staticFirstLoad = false;
    Object.freeze(node.childEntries);
    Object.freeze(node);
  }
  for (let index = 0; index < context.fragments.length; index++) {
    const fragment = context.fragments[index];
    Object.freeze(fragment.declares);
    Object.freeze(fragment.overlays);
    Object.freeze(fragment.inheritedOverlays);
    Object.freeze(fragment.children);
    Object.freeze(fragment);
  }
  const result = Object.freeze({
    capabilities: Object.freeze(context.capabilities),
    isAtomic: options.isAtomic,
    isTerminal: options.isTerminal,
    schema,
    root,
    nodes: Object.freeze(context.nodes),
    fragments: Object.freeze(context.fragments),
    dependencies: context.dependencies ? Object.freeze(context.dependencies) : EMPTY_DEPENDENCIES,
    expressions
  });
  const capabilities = result.capabilities;
  StaticFirstLoadCapability.set(result, context.staticFirstLoad && capabilities.branchless && !capabilities.hasExpressions && !capabilities.hasDerive && !capabilities.hasWatch && !capabilities.hasState && !capabilities.hasDependencies);
  collectBlueprintWarnings(result, options.collect);
  if (typeof schema === "object" && options.cache) {
    const entry = {
      blueprint: result,
      isTerminal: options.isTerminal,
      isAtomic: options.isAtomic,
      warningsCollected: options.collect !== void 0
    };
    if (entries) entries.push(entry);
    else options.cache.set(schema, [entry]);
  }
  return result;
};

// packages/canard/schema-form/src/core/blueprint/utils/analyze/collectDeriveConvergenceTargets.ts
var import_filter21 = require("@winglet/common-utils/filter");
var import_pointer7 = require("@winglet/json/pointer");
var resolveRead = (host, dependency) => stripFragment(getAbsolutePath(host, dependency[0] === "/" || dependency[0] === "#" || dependency[0] === "." ? dependency : `./${dependency}`));
var hasWildcardSegment = (path) => path === "*" || path.startsWith("*/") || path.endsWith("/*") || path.includes("/*/");
var collectDeriveConvergenceTargets = (blueprint2) => {
  if (!blueprint2.capabilities.hasDerive) return void 0;
  const nodes = blueprint2.nodes;
  const declarations = /* @__PURE__ */ new Map();
  const hosts = /* @__PURE__ */ new Set();
  for (let index = 0; index < nodes.length; index++) {
    const node = nodes[index];
    if (node.item || hasWildcardSegment(node.path)) return void 0;
    if (node.kind === "object" || node.kind === "array" || node.kind === "virtual" || node.kind === "union")
      hosts.add(node.path);
    for (let child = 0; child < node.childEntries.length; child++) {
      const entry = node.childEntries[child];
      if (entry.node.path !== `${node.path}/${(0, import_pointer7.escapeSegment)(entry.name)}`)
        return void 0;
    }
    for (let declaration = 0; declaration < node.declarations.length; declaration++) {
      const entry = node.declarations[declaration];
      if (entry.path !== node.path) return void 0;
      declarations.set(entry.id, entry);
    }
  }
  const reads = /* @__PURE__ */ new Set();
  const expressions = blueprint2.expressions;
  const gateExpressions = blueprint2.capabilities.branchless ? void 0 : /* @__PURE__ */ new Map();
  for (let index = 0; index < expressions.length; index++) {
    const expression = expressions[index];
    if (!CompleteExpressionReads.has(expression)) return void 0;
    if (expression.key === "active" && gateExpressions && !gateExpressions.has(expression.schemaPath))
      gateExpressions.set(expression.schemaPath, expression);
    for (let dependency = 0; dependency < expression.dependencies.length; dependency++) {
      const path = expression.dependencies[dependency];
      if (path === "@") return void 0;
      const read = resolveRead(expression.hostPath, path);
      if (!read || hosts.has(read)) return void 0;
      reads.add(read);
    }
  }
  const dependencies = Object.keys(blueprint2.dependencies);
  for (let index = 0; index < dependencies.length; index++) {
    const dependency = dependencies[index];
    if (dependency === "@") return void 0;
    const owners = blueprint2.dependencies[dependency];
    for (let owner = 0; owner < owners.length; owner++) {
      const declaration = declarations.get(owners[owner]);
      if (!declaration) return void 0;
      reads.add(resolveRead(declaration.path, dependency));
    }
  }
  for (let index = 0; index < nodes.length; index++) {
    const node = nodes[index];
    for (let declaration = 0; declaration < node.declarations.length; declaration++) {
      const entry = node.declarations[declaration];
      const controls = typeof entry.schema === "object" ? entry.schema.controls : void 0;
      if (controls && typeof controls === "object") {
        if (typeof Reflect.get(controls, "injectTo") === "function") reads.add(node.path);
        const children = Reflect.get(controls, "children");
        if ((0, import_filter21.isArray)(children)) for (let child = 0; child < children.length; child++) {
          const childControls = children[child]?.controls;
          if (!childControls || typeof childControls !== "object") continue;
          if (typeof childControls.injectTo === "function") reads.add(node.path);
          const watches = childControls.watch;
          if (watches === void 0) continue;
          const paths = (0, import_filter21.isArray)(watches) ? watches : [watches];
          const targets2 = children[child].targets;
          if (!(0, import_filter21.isArray)(targets2)) return void 0;
          for (let target = 0; target < targets2.length; target++) {
            const targetPath = `${node.path}/${(0, import_pointer7.escapeSegment)(targets2[target])}`;
            for (let watch = 0; watch < paths.length; watch++) {
              if (typeof paths[watch] !== "string" || paths[watch] === "@") return void 0;
              reads.add(resolveRead(targetPath, paths[watch]));
            }
          }
        }
      }
      for (let gateIndex = 0; gateIndex < entry.gates.length; gateIndex++) {
        const gate = entry.gates[gateIndex];
        if (gate.kind !== "active") {
          reads.add(gate.hostPath);
          continue;
        }
        if (typeof gate.condition !== "string") continue;
        const expression = gateExpressions?.get(gate.schemaPath);
        if (!expression && gate.condition.trim()) return void 0;
        if (expression) for (let path = 0; path < expression.dependencies.length; path++)
          reads.add(resolveRead(gate.hostPath, expression.dependencies[path]));
      }
    }
  }
  const readPaths = [...reads];
  const targets = /* @__PURE__ */ new Set();
  for (let index = 0; index < nodes.length; index++) {
    const node = nodes[index];
    if (hosts.has(node.path)) continue;
    let terminal = true;
    for (let read = 0; read < readPaths.length; read++) {
      const path = readPaths[read];
      if (!path || path === node.path || path.startsWith(`${node.path}/`) || node.path.startsWith(`${path}/`)) {
        terminal = false;
        break;
      }
    }
    if (terminal) targets.add(node.path);
  }
  return targets.size ? targets : void 0;
};

// packages/canard/schema-form/src/core/blueprint/utils/features/DeriveConvergenceTargets.ts
var DeriveConvergenceTargets = class {
  static {
    /** Null memoizes conservative fallback for the immutable analysis lifetime. */
    this.targets = /* @__PURE__ */ new WeakMap();
  }
  /**
   * Retain proven targets, or disable skipping for a reference run.
   * @param blueprint - Immutable analysis owning this proof
   * @param targets - Static disjoint paths; undefined restores normal confirmation
   * @returns Nothing; updates the weak compiler sidecar
   */
  static set(blueprint2, targets) {
    this.targets.set(blueprint2, targets ?? null);
  }
  /**
   * Observe the proof without triggering its first-write collection.
   * @param blueprint - Immutable analysis used by the current form
   * @returns Proven paths, or undefined for conservative fallback
   */
  static get(blueprint2) {
    return this.targets.get(blueprint2) ?? void 0;
  }
  /**
   * Collect once when a derive round first needs a proof, including fallback.
   * @param blueprint - Immutable analysis shared by forms of the same schema
   * @returns Proven paths, or undefined for conservative fallback
   */
  static getOrCollect(blueprint2) {
    const cached = this.targets.get(blueprint2);
    if (cached !== void 0) return cached ?? void 0;
    const targets = collectDeriveConvergenceTargets(blueprint2);
    this.set(blueprint2, targets);
    return targets;
  }
};

// packages/canard/schema-form/src/core/utils/emptyReadonlyMap.ts
var EMPTY_ENTRIES = Object.freeze([]);
var emptyReadonlyMap = Object.freeze({
  size: 0,
  get: () => void 0,
  has: () => false,
  forEach: () => void 0,
  entries: () => EMPTY_ENTRIES.values(),
  keys: () => EMPTY_ENTRIES.values(),
  values: () => EMPTY_ENTRIES.values(),
  [Symbol.iterator]: () => EMPTY_ENTRIES.values()
});

// packages/canard/schema-form/src/core/utils/emptyReadonlySet.ts
var EMPTY_ENTRIES2 = Object.freeze([]);
var emptyReadonlySet = Object.freeze({
  size: 0,
  has: () => false,
  forEach: () => void 0,
  entries: () => EMPTY_ENTRIES2.values(),
  keys: () => EMPTY_ENTRIES2.values(),
  values: () => EMPTY_ENTRIES2.values(),
  [Symbol.iterator]: () => EMPTY_ENTRIES2.values()
});

// packages/canard/schema-form/src/core/blueprint/utils/features/getFeatureNodeIndex/utils/buildFeatureNodeIndex.ts
var import_filter22 = require("@winglet/common-utils/filter");
var hasStateKeys = (controls) => controls !== null && typeof controls === "object" && !(0, import_filter22.isArray)(controls) && (Reflect.get(controls, "visible") !== void 0 || Reflect.get(controls, "readOnly") !== void 0 || Reflect.get(controls, "disabled") !== void 0);
var buildFeatureNodeIndex = (blueprint2) => {
  const stateKeyNodes = /* @__PURE__ */ new Set();
  const stateKeyChildren = /* @__PURE__ */ new Map();
  const watchNodes = /* @__PURE__ */ new Set();
  for (const node of blueprint2.nodes) {
    const targets = /* @__PURE__ */ new Set();
    const children = [
      ...node.childEntries,
      ...(node.prefixItems ?? []).map((child, index) => ({ name: String(index), node: child, declarations: child.declarations })),
      ...node.item ? [{
        name: "*",
        node: node.item,
        declarations: node.item.declarations
      }] : []
    ];
    for (const declaration of node.declarations) {
      if (declaration.validationOnly || typeof declaration.schema !== "object") continue;
      const schema = declaration.schema;
      const controls = schema.controls;
      if (schema.readOnly === true || declaration.scope === "node" && hasStateKeys(controls)) stateKeyNodes.add(node.id);
      if (!controls || typeof controls !== "object" || (0, import_filter22.isArray)(controls)) continue;
      if (declaration.scope === "node" && Reflect.get(controls, "watch") !== void 0)
        watchNodes.add(node.id);
      if (declaration.scope === "fragment" && hasStateKeys(controls)) {
        for (const child of children)
          if (child.node.declarations.some((entry) => entry.schemaPath.startsWith(`${declaration.schemaPath}/properties/`) || entry.schemaPath.startsWith(`${declaration.schemaPath}/items/`) || entry.schemaPath.startsWith(`${declaration.schemaPath}/prefixItems/`)))
            targets.add(child.name);
      }
      const groups = Reflect.get(controls, "children");
      if ((0, import_filter22.isArray)(groups)) for (const group of groups) {
        if (!group || typeof group !== "object" || !hasStateKeys(Reflect.get(group, "controls"))) continue;
        const names = Reflect.get(group, "targets");
        if ((0, import_filter22.isArray)(names)) {
          for (const name of names)
            if (typeof name === "string") targets.add(name);
        }
      }
    }
    for (const child of children)
      for (const declaration of child.declarations) {
        if (declaration.validationOnly || declaration.scope !== "node" || typeof declaration.schema !== "object") continue;
        const controls = declaration.schema.controls;
        if (declaration.schema.readOnly === true || hasStateKeys(controls))
          stateKeyNodes.add(child.node.id);
        if (controls && typeof controls === "object" && Reflect.get(controls, "watch") !== void 0) watchNodes.add(child.node.id);
      }
    if (targets.size) stateKeyChildren.set(node.id, targets);
  }
  return { stateKeyNodes, stateKeyChildren, watchNodes };
};

// packages/canard/schema-form/src/core/blueprint/utils/features/getFeatureNodeIndex/getFeatureNodeIndex.ts
var INDICES = /* @__PURE__ */ new WeakMap();
var EMPTY_INDEX = Object.freeze({
  stateKeyNodes: emptyReadonlySet,
  stateKeyChildren: emptyReadonlyMap,
  watchNodes: emptyReadonlySet
});
var getFeatureNodeIndex = (blueprint2) => {
  if (!blueprint2.capabilities.hasState && !blueprint2.capabilities.hasWatch) return EMPTY_INDEX;
  let index = INDICES.get(blueprint2);
  if (!index) {
    index = buildFeatureNodeIndex(blueprint2);
    INDICES.set(blueprint2, index);
  }
  return index;
};

// packages/canard/schema-form/src/core/blueprint/utils/itemEntry/getItemEntry/utils/getItemSchemaPath.ts
var import_filter23 = require("@winglet/common-utils/filter");
var getItemSchemaPath = (template, index, node) => {
  const prefix = template.prefixItems?.[index] === node;
  for (const declaration of template.declarations) {
    const schema = declaration.schema;
    if (typeof schema !== "object") continue;
    if (prefix) {
      if ((0, import_filter23.isArray)(schema.prefixItems) && index < schema.prefixItems.length)
        return `${declaration.schemaPath}/prefixItems/${index}`;
      if ((0, import_filter23.isArray)(schema.items) && index < schema.items.length)
        return `${declaration.schemaPath}/items/${index}`;
    } else {
      if (schema.items !== null && typeof schema.items === "object" && !(0, import_filter23.isArray)(schema.items))
        return `${declaration.schemaPath}/items`;
      if ((0, import_filter23.isArray)(schema.items) && schema.prefixItems === void 0 && schema.additionalItems !== null && typeof schema.additionalItems === "object" && !(0, import_filter23.isArray)(schema.additionalItems))
        return `${declaration.schemaPath}/additionalItems`;
    }
  }
  return node.schemaPath;
};

// packages/canard/schema-form/src/core/blueprint/utils/itemEntry/getItemEntry.ts
var ENTRIES = /* @__PURE__ */ new WeakMap();
var getItemEntry = (template, index) => {
  let entries = ENTRIES.get(template);
  if (!entries) {
    entries = [];
    ENTRIES.set(template, entries);
  }
  if (index in entries) return entries[index];
  const node = template.prefixItems?.[index] ?? template.item;
  if (!node) {
    entries[index] = void 0;
    return void 0;
  }
  const name = String(index);
  const schemaPath = getItemSchemaPath(template, index, node);
  const declarations = Object.freeze(
    node.declarations.map(
      (declaration) => Object.freeze({
        ...declaration,
        name,
        path: node.path,
        hostPath: template.path,
        schemaPath: declaration.schemaPath === node.schemaPath ? schemaPath : declaration.schemaPath
      })
    )
  );
  const entry = Object.freeze({
    name,
    node,
    hostPath: template.path,
    declarations
  });
  entries[index] = entry;
  return entry;
};

// packages/canard/schema-form/src/core/settle/utils/write/writeSchemaNode.ts
var import_filter78 = require("@winglet/common-utils/filter");

// packages/canard/schema-form/src/core/settle/utils/compute/dirtyChildren.ts
var import_pointer8 = require("@winglet/json/pointer");
var import_lib5 = require("@winglet/common-utils/lib");
var dirtyChildren = (node, context) => {
  const children = [];
  const seen = /* @__PURE__ */ new Set();
  for (const encoded of context.dirtyChildrenByParent.get(node.path)?.values() ?? []) {
    const name = (0, import_pointer8.unescapeSegment)(encoded);
    const child = node.structure && (0, import_lib5.hasOwnProperty)(node.structure, name) ? node.structure[name] : void 0;
    if (child && !seen.has(child)) {
      seen.add(child);
      children.push(child);
    }
  }
  return children;
};

// packages/canard/schema-form/src/core/record/type.ts
var EMPTY_REVISION_LEDGER = Object.freeze({});

// packages/canard/schema-form/src/core/record/utils/SchemaNodeRevisionLedger.ts
var KNOWN_BITS = (65536 /* UpdateDiagnostics */ << 1) - 1;
var SchemaNodeRevisionLedger = class _SchemaNodeRevisionLedger {
  /**
   * Copy the previous counters and raise each marked known bit once.
   * @param previous - Last committed ledger, including the shared empty object
   * @param mask - Delivery bits committed together before listener invocation
   */
  constructor(previous, mask) {
    const counts = previous instanceof _SchemaNodeRevisionLedger ? previous.counts.slice() : Array.from({ length: 17 }, (_, index) => previous[1 << index]);
    let remaining = mask & KNOWN_BITS;
    while (remaining) {
      const bit = remaining & -remaining;
      const index = 31 - Math.clz32(bit);
      counts[index] = (counts[index] ?? 0) + 1;
      remaining &= remaining - 1;
    }
    this.counts = counts;
  }
  /**
   * Sum selected known counters without sparse bit-key lookups.
   * @param mask - Event bits requested by revision(mask)
   * @returns Sum with unknown bits ignored
   */
  read(mask) {
    let revision = 0;
    let remaining = mask & KNOWN_BITS;
    while (remaining) {
      const bit = remaining & -remaining;
      revision += this.counts[31 - Math.clz32(bit)] ?? 0;
      remaining &= remaining - 1;
    }
    return revision;
  }
  /** Initialization counter. */
  get [1 /* Initialized */]() {
    return this.counts[0];
  }
  /** Path counter. */
  get [2 /* UpdatePath */]() {
    return this.counts[1];
  }
  /** Value counter. */
  get [4 /* UpdateValue */]() {
    return this.counts[2];
  }
  /** Interaction counter. */
  get [8 /* UpdateState */]() {
    return this.counts[3];
  }
  /** Global interaction counter. */
  get [16 /* UpdateGlobalState */]() {
    return this.counts[4];
  }
  /** Validation counter. */
  get [32 /* UpdateError */]() {
    return this.counts[5];
  }
  /** Aggregate validation counter. */
  get [64 /* UpdateGlobalError */]() {
    return this.counts[6];
  }
  /** Child shape counter. */
  get [128 /* UpdateChildren */]() {
    return this.counts[7];
  }
  /** Computed state counter. */
  get [256 /* UpdateComputedProperties */]() {
    return this.counts[8];
  }
  /** Focus entry counter. */
  get [512 /* Focused */]() {
    return this.counts[9];
  }
  /** Focus exit counter. */
  get [1024 /* Blurred */]() {
    return this.counts[10];
  }
  /** Focus request counter. */
  get [2048 /* RequestFocus */]() {
    return this.counts[11];
  }
  /** Selection request counter. */
  get [4096 /* RequestSelect */]() {
    return this.counts[12];
  }
  /** Refresh request counter. */
  get [8192 /* RequestRefresh */]() {
    return this.counts[13];
  }
  /** Remount request counter. */
  get [16384 /* RequestRemount */]() {
    return this.counts[14];
  }
  /** Effective schema counter. */
  get [32768 /* UpdateJsonSchema */]() {
    return this.counts[15];
  }
  /** Settlement diagnostics counter. */
  get [65536 /* UpdateDiagnostics */]() {
    return this.counts[16];
  }
};

// packages/canard/schema-form/src/core/record/SchemaNodeRequestType.ts
var SchemaNodeRequestType = ((SchemaNodeRequestType2) => {
  SchemaNodeRequestType2[SchemaNodeRequestType2["Focus"] = 2048 /* RequestFocus */] = "Focus";
  SchemaNodeRequestType2[SchemaNodeRequestType2["Select"] = 4096 /* RequestSelect */] = "Select";
  SchemaNodeRequestType2[SchemaNodeRequestType2["Refresh"] = 8192 /* RequestRefresh */] = "Refresh";
  SchemaNodeRequestType2[SchemaNodeRequestType2["Remount"] = 16384 /* RequestRemount */] = "Remount";
  return SchemaNodeRequestType2;
})(SchemaNodeRequestType || {});

// packages/canard/schema-form/src/core/record/utils/markSchemaNodeEvent.ts
var markSchemaNodeEvent = (node, bit, payload, options) => {
  const deliveries = node.runtime.deliveries ??= /* @__PURE__ */ new Set();
  const previous = node.pendingDelivery;
  if (previous) {
    previous.type |= bit;
    if (payload !== void 0) (previous.payload ??= {})[bit] = payload;
    if (options !== void 0) (previous.options ??= {})[bit] = options;
  } else node.pendingDelivery = {
    type: bit,
    payload: payload === void 0 ? void 0 : { [bit]: payload },
    options: options === void 0 ? void 0 : { [bit]: options }
  };
  deliveries.add(node);
  node.pendingRevision |= bit;
  (node.runtime.revisionNodes ??= /* @__PURE__ */ new Set()).add(node);
};

// packages/canard/schema-form/src/core/record/utils/indexSchemaNodeWarning.ts
var indexSchemaNodeWarning = (runtime, key, path, record, remove = false) => {
  if (remove) {
    runtime.warningKeys?.delete(key);
    runtime.pendingWarningRecords?.delete(key);
  } else if (record) (runtime.pendingWarningRecords ??= /* @__PURE__ */ new Map()).set(key, record);
  if (path === void 0) return;
  const index = remove ? runtime.warningKeysByPath : runtime.warningKeysByPath ??= /* @__PURE__ */ new Map();
  if (!index) return;
  let ancestor = path;
  while (true) {
    if (remove) {
      const keys = index.get(ancestor);
      keys?.delete(key);
      if (keys?.size === 0) index.delete(ancestor);
    } else {
      let keys = index.get(ancestor);
      if (!keys) index.set(ancestor, keys = /* @__PURE__ */ new Set());
      keys.add(key);
    }
    if (!ancestor) break;
    ancestor = ancestor.slice(0, ancestor.lastIndexOf("/"));
  }
};

// packages/canard/schema-form/src/core/record/utils/captureSchemaNodeChange.ts
var CHANGE_BITS = {
  local: 4 /* UpdateValue */,
  emit: 4 /* UpdateValue */,
  path: 2 /* UpdatePath */,
  children: 128 /* UpdateChildren */,
  active: 256 /* UpdateComputedProperties */,
  visible: 256 /* UpdateComputedProperties */,
  readOnly: 256 /* UpdateComputedProperties */,
  disabled: 256 /* UpdateComputedProperties */,
  schema: 32768 /* UpdateJsonSchema */,
  interactionState: 8 /* UpdateState */
};
var captureSchemaNodeChange = (node, field, value) => {
  if (node[field] === value || !node.deliveryInitialized || node.detached) return value;
  const bit = CHANGE_BITS[field];
  if (!(node.deliveryChanges & bit)) {
    switch (bit) {
      case 4 /* UpdateValue */:
        node.deliveryPreviousLocal = node.local;
        node.deliveryPreviousEmit = node.emit;
        break;
      case 2 /* UpdatePath */:
        node.deliveryPreviousPath = node.path;
        break;
      case 128 /* UpdateChildren */:
        node.deliveryPreviousChildren = node.children;
        break;
      case 256 /* UpdateComputedProperties */:
        node.deliveryPreviousComputed = +node.active | +node.visible << 1 | +node.readOnly << 2 | +node.disabled << 3;
        break;
      case 32768 /* UpdateJsonSchema */:
        node.deliveryPreviousSchema = node.schema;
        break;
      case 8 /* UpdateState */:
        node.deliveryPreviousState = node.interactionState;
    }
    node.deliveryChanges |= bit;
  }
  if (node.runtime.deliveryWatchIndex?.allNodes.size && (bit === 4 /* UpdateValue */ || bit === 8 /* UpdateState */ || bit === 256 /* UpdateComputedProperties */))
    (node.runtime.deliveryAffectedPaths ??= /* @__PURE__ */ new Set()).add(node.path);
  return value;
};

// packages/canard/schema-form/src/core/record/utils/updateSchemaNodeNameAndPath.ts
var updateSchemaNodeNameAndPath = (node, name, parent) => {
  node.parent = parent;
  node.name = name;
  node.escapedName = name.replace(/~/g, "~0").replace(/\//g, "~1");
  node.path = captureSchemaNodeChange(
    node,
    "path",
    parent === null ? "" : `${parent.path}/${node.escapedName}`
  );
  node.depth = parent === null ? 0 : parent.depth + 1;
};

// packages/canard/schema-form/src/core/record/utils/shallowPatch.ts
var import_lib6 = require("@winglet/common-utils/lib");
var shallowPatch = (previous, patch) => {
  let result = previous;
  for (const key of Object.keys(patch)) {
    const value = Reflect.get(patch, key);
    const present = (0, import_lib6.hasOwnProperty)(previous, key);
    if (value === void 0 ? !present : present && Object.is(Reflect.get(previous, key), value))
      continue;
    if (result === previous) result = { ...previous };
    if (value === void 0) Reflect.deleteProperty(result, key);
    else Reflect.set(result, key, value);
  }
  return result;
};

// packages/canard/schema-form/src/core/record/utils/patchSchemaNodeInteractionState.ts
var patchSchemaNodeInteractionState = (node, patch) => {
  if (node.detached) return;
  node.interactionState = shallowPatch(node.interactionState, patch);
};

// packages/canard/schema-form/src/core/record/utils/accumulateGlobalStateDeltas.ts
var import_lib7 = require("@winglet/common-utils/lib");
var accumulateGlobalStateDeltas = (deltas, previous, next, changedKeys) => {
  if (changedKeys) {
    for (const key in changedKeys) {
      if (!(0, import_lib7.hasOwnProperty)(changedKeys, key)) continue;
      const before = Boolean(previous[key]);
      const after = Boolean(next[key]);
      if (before !== after)
        deltas.set(key, (deltas.get(key) ?? 0) + (after ? 1 : -1));
    }
    return;
  }
  for (const [key, value] of Object.entries(previous))
    if (value && !next[key]) deltas.set(key, (deltas.get(key) ?? 0) - 1);
  for (const [key, value] of Object.entries(next))
    if (value && !previous[key]) deltas.set(key, (deltas.get(key) ?? 0) + 1);
};

// packages/canard/schema-form/src/core/record/utils/publishGlobalStateDeltas.ts
var publishGlobalStateDeltas = (root, deltas) => {
  const runtime = root.runtime;
  let nextState;
  for (const [key, delta] of deltas) {
    if (!delta) continue;
    const previous2 = runtime.globalStateCounts.get(key) ?? 0;
    const count = previous2 + delta;
    if (count < 0) throw new Error(`Negative global state count for ${key}`);
    if (count) runtime.globalStateCounts.set(key, count);
    else runtime.globalStateCounts.delete(key);
    if (previous2 === 0 === (count === 0)) continue;
    nextState ??= { ...runtime.globalState };
    if (count) nextState[key] = true;
    else delete nextState[key];
  }
  if (!nextState) return;
  runtime.globalState = nextState;
  const queued = runtime.queuedNonSettleEvents ?? /* @__PURE__ */ new Set();
  const previous = root.pendingNonSettleDelivery;
  root.pendingNonSettleDelivery = {
    type: (previous?.type ?? 0) | 16 /* UpdateGlobalState */,
    payload: {
      ...previous?.payload,
      [16 /* UpdateGlobalState */]: nextState
    }
  };
  queued.add(root);
  runtime.queuedNonSettleEvents = queued;
};

// packages/canard/schema-form/src/core/record/utils/clearSchemaNodeChanges.ts
var clearSchemaNodeChanges = (node) => {
  const changes = node.deliveryChanges;
  if (changes & 4 /* UpdateValue */) {
    node.deliveryPreviousLocal = void 0;
    node.deliveryPreviousEmit = void 0;
  }
  if (changes & 2 /* UpdatePath */) node.deliveryPreviousPath = void 0;
  if (changes & 128 /* UpdateChildren */) node.deliveryPreviousChildren = void 0;
  if (changes & 256 /* UpdateComputedProperties */) node.deliveryPreviousComputed = void 0;
  if (changes & 32768 /* UpdateJsonSchema */) node.deliveryPreviousSchema = void 0;
  if (changes & 8 /* UpdateState */) node.deliveryPreviousState = void 0;
  node.deliveryChanges = 0;
};

// packages/canard/schema-form/src/core/settle/utils/gates/getGateRegistry.ts
var import_pointer9 = require("@winglet/json/pointer");

// packages/canard/schema-form/src/core/settle/utils/paths/bindTemplatePath.ts
var bindTemplatePath = (templatePath, occurrencePath) => {
  if (!templatePath.includes("/*")) return templatePath;
  let templateStart = 0;
  let occurrenceStart = 0;
  let copiedThrough = 0;
  let bound = "";
  while (templateStart < templatePath.length) {
    const templateSlash = templatePath.indexOf("/", templateStart + 1);
    const templateEnd = templateSlash < 0 ? templatePath.length : templateSlash;
    const occurrenceSlash = occurrencePath.indexOf("/", occurrenceStart + 1);
    const occurrenceEnd = occurrenceSlash < 0 ? occurrencePath.length : occurrenceSlash;
    if (templatePath.slice(templateStart + 1, templateEnd) === "*" && occurrenceStart < occurrencePath.length) {
      bound += templatePath.slice(copiedThrough, templateStart + 1);
      bound += occurrencePath.slice(occurrenceStart + 1, occurrenceEnd);
      copiedThrough = templateEnd;
    }
    templateStart = templateEnd;
    occurrenceStart = occurrenceEnd;
  }
  return bound ? bound + templatePath.slice(copiedThrough) : templatePath;
};

// packages/canard/schema-form/src/core/settle/utils/gates/bindGateHostPath.ts
var bindGateHostPath = (gate, templatePath, occurrencePath, childHostPath) => {
  const suffix = gate.hostPath === templatePath ? "" : gate.hostPath.startsWith(`${templatePath}/`) ? gate.hostPath.slice(templatePath.length) : void 0;
  return childHostPath ?? bindTemplatePath(
    suffix === void 0 ? gate.hostPath : `${occurrencePath}${suffix}`,
    occurrencePath
  );
};

// packages/canard/schema-form/src/core/settle/utils/gates/resolveGateOccurrence.ts
var resolveGateOccurrence = (gate, templatePath, occurrencePath, childHostPath) => {
  const hostPath = bindGateHostPath(gate, templatePath, occurrencePath, childHostPath);
  let common = hostPath.split("/").filter(Boolean);
  for (const read of gate.evaluationReads) {
    if (typeof read === "number") {
      common = common.slice(0, Math.max(0, common.length - read));
      continue;
    }
    const target = bindTemplatePath(read, childHostPath ?? occurrencePath).split("/").filter(Boolean);
    let index = 0;
    while (index < common.length && index < target.length && common[index] === target[index]) index++;
    common = common.slice(0, index);
  }
  return {
    gate,
    hostPath,
    evaluationHostPath: common.length ? `/${common.join("/")}` : ""
  };
};

// packages/canard/schema-form/src/core/settle/utils/paths/resolveDependencyPath.ts
var resolveDependencyPath = (hostPath, dependency) => {
  if (dependency === "@") return "@";
  if (dependency === "#" || dependency === "/") return "";
  if (dependency.startsWith("#/")) return dependency.slice(1);
  if (dependency.startsWith("/")) return dependency;
  const parts = hostPath.split("/").filter(Boolean);
  let remaining = dependency;
  while (remaining.startsWith("../")) {
    parts.pop();
    remaining = remaining.slice(3);
  }
  if (remaining.startsWith("./")) remaining = remaining.slice(2);
  if (remaining) parts.push(...remaining.split("/"));
  return parts.length ? `/${parts.join("/")}` : "";
};

// packages/canard/schema-form/src/core/settle/utils/gates/getGateExpression.ts
var GATE_EXPRESSIONS = /* @__PURE__ */ new WeakMap();
var getGateExpression = (blueprint2, schemaPath) => {
  if (blueprint2.capabilities.branchless) return void 0;
  let expressions = GATE_EXPRESSIONS.get(blueprint2);
  if (!expressions) {
    const indexed = /* @__PURE__ */ new Map();
    for (const expression of blueprint2.expressions)
      if (expression.key === "active" && !indexed.has(expression.schemaPath))
        indexed.set(expression.schemaPath, expression);
    expressions = indexed;
    GATE_EXPRESSIONS.set(blueprint2, expressions);
  }
  return expressions.get(schemaPath);
};

// packages/canard/schema-form/src/core/settle/utils/gates/getGateRegistry.ts
var GateRegistry = class {
  /** Bind exact expression dependencies from this tree's analyzed blueprint. */
  constructor(blueprint2) {
    this.blueprint = blueprint2;
    /** Gates bound to a live node's own template and inherited declarations. */
    this.byNode = /* @__PURE__ */ new WeakMap();
    /** Direct child gate bindings distinguished from the owner's same gate. */
    this.byEdge = /* @__PURE__ */ new WeakMap();
    /** Current node identity and gate entries at each absolute path. */
    this.byPath = /* @__PURE__ */ new Map();
    /** Relocated gates keyed by their memoized evaluation host. */
    this.byLocation = /* @__PURE__ */ new Map();
  }
  /** Compare a path and kind in the current indexed shape, if indexed. */
  hasRegisteredPathKind(path, kind) {
    if (this.byPath.size === 0) return void 0;
    return this.byPath.get(path)?.kind === kind;
  }
  /** Register template and direct-edge gates when an occurrence is created. */
  register(node) {
    if (this.byPath.get(node.path)?.node === node) return;
    this.removePath(node.path);
    const memo = /* @__PURE__ */ new Map();
    const edges = /* @__PURE__ */ new Map();
    for (const declaration of node.blueprintNode.declarations)
      for (const gate of declaration.gates)
        this.add(
          node,
          gate,
          memo,
          gate.schemaPath === `${node.blueprintNode.schemaPath}/controls/active` ? node.path : void 0
        );
    const ownOccurrences = [...memo.values()];
    for (const entry of node.blueprintNode.childEntries) {
      let edgeMemo = edges.get(entry.name);
      if (!edgeMemo) {
        edgeMemo = /* @__PURE__ */ new Map();
        edges.set(entry.name, edgeMemo);
      }
      for (const declaration of entry.declarations)
        for (const gate of declaration.gates)
          if (gate.schemaPath === `${declaration.schemaPath}/controls/active`)
            this.add(
              node,
              gate,
              edgeMemo,
              `${node.path}/${(0, import_pointer9.escapeSegment)(entry.name)}`
            );
          else this.add(node, gate, memo);
    }
    this.byNode.set(node, memo);
    this.byEdge.set(node, edges);
    this.byPath.set(node.path, {
      node,
      kind: node.blueprintNode.kind,
      ownOccurrences,
      occurrences: [
        ...memo.values(),
        ...[...edges.values()].flatMap((edge) => [...edge.values()])
      ]
    });
  }
  /** Find or bind a gate inherited indirectly by a declaration. */
  locate(node, gate, edgeName) {
    this.register(node);
    const edge = edgeName ? this.byEdge.get(node)?.get(edgeName)?.get(gate) : void 0;
    if (edge) return edge;
    const existing = this.byNode.get(node)?.get(gate);
    if (existing) return existing;
    const memo = this.byNode.get(node);
    if (!memo) throw new Error(`Missing gate memo at ${node.path}`);
    this.add(node, gate, memo);
    const edges = this.byEdge.get(node);
    this.byPath.set(node.path, {
      node,
      kind: node.blueprintNode.kind,
      ownOccurrences: this.byPath.get(node.path)?.ownOccurrences ?? [],
      occurrences: [
        ...memo.values(),
        ...[...edges?.values() ?? []].flatMap((edgeMemo) => [...edgeMemo.values()])
      ]
    });
    const occurrence = memo.get(gate);
    if (!occurrence) throw new Error(`Missing gate at ${node.path}`);
    return occurrence;
  }
  /** Read relocated gates at one host without scanning other templates. */
  relocated(path) {
    return [...this.byLocation.get(path) ?? []].filter((entry) => entry.hostPath !== path);
  }
  /** Whether changed raw intersects any read that can affect this host's wheel. */
  mayChangeAt(path, changedRaw, changedAncestors) {
    for (const occurrence of this.byLocation.get(path) ?? [])
      if (this.readsChanged(occurrence, changedRaw, changedAncestors)) return true;
    return false;
  }
  /** Whether a changed read can reselect this live node's own declarations. */
  mayChangeOwnDeclarationAt(path, changedRaw, changedAncestors) {
    for (const occurrence of this.byPath.get(path)?.ownOccurrences ?? [])
      if (this.readsChanged(occurrence, changedRaw, changedAncestors)) return true;
    return false;
  }
  /** Forget a detached subtree's location entries; a virtual node's referenced siblings stay. */
  remove(node) {
    for (const child of node.children ?? [])
      if (child.parent === node) this.remove(child);
    if (this.byPath.get(node.path)?.node === node) this.removePath(node.path);
  }
  /** Index one gate only once for this occurrence. */
  add(node, gate, memo, childHostPath) {
    if (memo.has(gate)) return;
    const location = resolveGateOccurrence(
      gate,
      node.blueprintNode.path,
      node.path,
      childHostPath
    );
    const occurrence = {
      ...location,
      watchPaths: this.watchPaths(location)
    };
    memo.set(gate, occurrence);
    let entries = this.byLocation.get(occurrence.evaluationHostPath);
    if (!entries) {
      entries = /* @__PURE__ */ new Set();
      this.byLocation.set(occurrence.evaluationHostPath, entries);
    }
    entries.add(occurrence);
  }
  /** Resolve expression reads once at occurrence registration. */
  watchPaths(location) {
    const gate = location.gate;
    if (gate.kind === "if") return [location.hostPath];
    if (gate.kind === "discriminator" && gate.condition !== null && typeof gate.condition === "object" && "propertyName" in gate.condition && typeof gate.condition.propertyName === "string")
      return [`${location.hostPath}/${(0, import_pointer9.escapeSegment)(gate.condition.propertyName)}`];
    const expression = getGateExpression(this.blueprint, gate.schemaPath);
    return expression ? expression.dependencies.map((dependency) => {
      const path = resolveDependencyPath(location.hostPath, dependency);
      return path;
    }) : [location.hostPath];
  }
  /** Check whether a bound gate reads a changed raw path. */
  readsChanged(occurrence, changedRaw, changedAncestors) {
    if (changedRaw.size === 0) return false;
    for (const watched of occurrence.watchPaths) {
      if (watched === "" || changedRaw.has(watched) || changedAncestors.has(watched)) return true;
      if (watched.startsWith("/"))
        for (let prefix = watched; prefix; ) {
          prefix = prefix.slice(0, prefix.lastIndexOf("/"));
          if (changedRaw.has(prefix)) return true;
        }
    }
    return false;
  }
  /** Remove a replaced path from its L buckets. */
  removePath(path) {
    const previous = this.byPath.get(path);
    if (!previous) return;
    for (const occurrence of previous.occurrences)
      this.byLocation.get(occurrence.evaluationHostPath)?.delete(occurrence);
    this.byPath.delete(path);
  }
};
var REGISTRIES = /* @__PURE__ */ new WeakMap();
var EMPTY_REGISTRY = Object.freeze({
  hasRegisteredPathKind: () => void 0,
  register: () => void 0,
  locate: () => {
    throw new Error("A branchless blueprint has no gate occurrences");
  },
  relocated: () => EMPTY_OCCURRENCES,
  mayChangeAt: () => false,
  mayChangeOwnDeclarationAt: () => false,
  remove: () => void 0
});
var EMPTY_OCCURRENCES = Object.freeze([]);
var getGateRegistry = (runtime) => {
  if (runtime.blueprint.capabilities.branchless) return EMPTY_REGISTRY;
  let registry = REGISTRIES.get(runtime);
  if (!registry) {
    registry = new GateRegistry(runtime.blueprint);
    REGISTRIES.set(runtime, registry);
  }
  return registry;
};

// packages/canard/schema-form/src/core/settle/utils/compute/primeHost.ts
var import_lib9 = require("@winglet/common-utils/lib");
var import_pointer11 = require("@winglet/json/pointer");

// packages/canard/schema-form/src/core/settle/utils/write/hasDistributedChildInput.ts
var import_filter25 = require("@winglet/common-utils/filter");
var import_lib8 = require("@winglet/common-utils/lib");

// packages/canard/schema-form/src/core/settle/utils/write/isPlain.ts
var import_filter24 = require("@winglet/common-utils/filter");
var isPlain = (value) => value !== null && typeof value === "object" && !(0, import_filter24.isArray)(value);

// packages/canard/schema-form/src/core/settle/utils/write/hasDistributedChildInput.ts
var hasDistributedChildInput = (input, name, arrayHost) => {
  if ((0, import_filter25.isArray)(input)) {
    if (!arrayHost) return false;
    const index = Number(name);
    return Number.isInteger(index) && index >= 0 && String(index) === name && index < input.length;
  }
  return !arrayHost && isPlain(input) && (0, import_lib8.hasOwnProperty)(input, name);
};

// packages/canard/schema-form/src/core/settle/utils/write/markWrite.ts
var import_filter33 = require("@winglet/common-utils/filter");

// packages/canard/schema-form/src/core/settle/utils/write/assertVirtualWriteShape.ts
var import_filter26 = require("@winglet/common-utils/filter");
var assertVirtualWriteShape = (node, input) => {
  const fields = node.blueprintNode.fields ?? [];
  if (input !== void 0 && (!(0, import_filter26.isArray)(input) || input.length !== fields.length))
    throw new SchemaFormError(
      INVALID_VIRTUAL_NODE_VALUES,
      `Invalid virtual node values at ${node.path}`,
      { path: node.path, expected: fields.length, received: input }
    );
};

// packages/canard/schema-form/src/core/settle/utils/compute/sameValue.ts
var import_filter27 = require("@winglet/common-utils/filter");
var sameValue = (left, right) => {
  if (left === right || Number.isNaN(left) && Number.isNaN(right)) return true;
  if (left === null || right === null || typeof left !== "object" || typeof right !== "object" || (0, import_filter27.isArray)(left) !== (0, import_filter27.isArray)(right)) return false;
  if ((0, import_filter27.isArray)(left) && (0, import_filter27.isArray)(right)) {
    if (left.length !== right.length) return false;
    for (let index = 0; index < left.length; index++)
      if (!sameValue(left[index], right[index])) return false;
    return true;
  }
  if (!(0, import_filter27.isArray)(left)) {
    const prototype = Object.getPrototypeOf(left);
    if (prototype !== Object.getPrototypeOf(right) || prototype !== Object.prototype && prototype !== null) return false;
  }
  const leftKeys = Object.keys(left);
  const rightKeys = Object.keys(right);
  if (leftKeys.length !== rightKeys.length) return false;
  for (let index = 0; index < leftKeys.length; index++) {
    const key = leftKeys[index];
    if (key !== rightKeys[index] || !sameValue(Reflect.get(left, key), Reflect.get(right, key))) return false;
  }
  return true;
};

// packages/canard/schema-form/src/core/settle/utils/write/nextExtras.ts
var nextExtras = (previous, input, declared, merge2) => {
  const result = {};
  if (merge2 && previous !== null && typeof previous === "object")
    for (const name of Object.keys(previous))
      Object.defineProperty(result, name, {
        value: Reflect.get(previous, name),
        enumerable: true,
        configurable: true,
        writable: true
      });
  for (const name of Object.keys(input)) {
    if (declared.has(name)) continue;
    Object.defineProperty(result, name, {
      value: Reflect.get(input, name),
      enumerable: true,
      configurable: true,
      writable: true
    });
  }
  const next = Object.keys(result).length ? result : void 0;
  return sameValue(previous, next) ? previous : next;
};

// packages/canard/schema-form/src/core/settle/utils/write/pruneLatentRaw.ts
var import_filter31 = require("@winglet/common-utils/filter");
var import_pointer10 = require("@winglet/json/pointer");

// packages/canard/schema-form/src/core/settle/utils/latent/getLatentPathIndex.ts
var import_filter28 = require("@winglet/common-utils/filter");

// packages/canard/schema-form/src/core/settle/utils/latent/indexLatentDescendant.ts
var indexLatentDescendant = (index, key, path, present) => {
  let ancestor = path;
  while (true) {
    if (present) {
      const descendants = index.get(ancestor) ?? /* @__PURE__ */ new Set();
      descendants.add(key);
      index.set(ancestor, descendants);
    } else {
      const descendants = index.get(ancestor);
      descendants?.delete(key);
      if (descendants?.size === 0) index.delete(ancestor);
    }
    if (!ancestor) break;
    ancestor = ancestor.slice(0, ancestor.lastIndexOf("/"));
  }
};

// packages/canard/schema-form/src/core/settle/utils/latent/getLatentPathIndex.ts
var getLatentPathIndex = (context) => {
  let index = context.latentDescendantKeys;
  if (index) return index;
  index = /* @__PURE__ */ new Map();
  for (const key of context.root.runtime.latentRaw.keys()) {
    const identity = JSON.parse(key);
    if ((0, import_filter28.isArray)(identity) && typeof identity[0] === "string")
      indexLatentDescendant(index, key, identity[0], true);
  }
  context.latentDescendantKeys = index;
  return index;
};

// packages/canard/schema-form/src/core/utils/pathIndex/utils/utils/NumericPathIndex.ts
var NumericPathIndex = class {
  constructor() {
    this.lengths = /* @__PURE__ */ new Map();
  }
  /** Whether no slots remain registered. */
  get empty() {
    return this.lengths.size === 0;
  }
  /** Register one slot prefix. */
  add(segment, path) {
    const root = this.lengths.get(segment.length) ?? { children: /* @__PURE__ */ new Map() };
    this.lengths.set(segment.length, root);
    let node = root;
    for (const digit of segment) {
      let child = node.children.get(digit);
      if (!child) {
        child = { children: /* @__PURE__ */ new Map() };
        node.children.set(digit, child);
      }
      node = child;
    }
    node.path = path;
  }
  /** Remove the slot and its now empty radix nodes. */
  delete(segment) {
    const root = this.lengths.get(segment.length);
    if (!root) return;
    const parents = [root];
    for (const digit of segment) {
      const child = parents[parents.length - 1].children.get(digit);
      if (!child) return;
      parents.push(child);
    }
    delete parents[parents.length - 1].path;
    for (let i = segment.length - 1; i >= 0; i--) {
      const child = parents[i + 1];
      if (child.path !== void 0 || child.children.size) break;
      parents[i].children.delete(segment[i]);
    }
    if (root.children.size === 0) this.lengths.delete(segment.length);
  }
  /** Visit only slots at or above the new array length. */
  *tail(count) {
    const lower = String(count);
    for (const [length, root] of this.lengths) {
      if (length < lower.length) continue;
      const pending = [{ node: root, prefix: "" }];
      while (pending.length) {
        const { node, prefix } = pending.pop();
        if (node.path !== void 0) yield node.path;
        for (const [digit, child] of node.children) {
          const next = prefix + digit;
          if (length === lower.length && next < lower.slice(0, next.length)) continue;
          pending.push({ node: child, prefix: next });
        }
      }
    }
  }
};

// packages/canard/schema-form/src/core/utils/pathIndex/utils/utils/isCanonicalArraySlot.ts
var isCanonicalArraySlot = (segment) => {
  if (!segment.length || segment.length > 16 || segment.length > 1 && segment.charCodeAt(0) === 48) return false;
  for (let i = 0; i < segment.length; i++) {
    const digit = segment.charCodeAt(i);
    if (digit < 48 || digit > 57) return false;
  }
  return Number.isSafeInteger(Number(segment));
};

// packages/canard/schema-form/src/core/utils/pathIndex/utils/PathStoreIndex.ts
var PathStoreIndex = class {
  constructor() {
    /** Full occurrence prefixes for each serialized key. */
    this.pathsByKey = /* @__PURE__ */ new Map();
    /** Unique prefixes referenced by at least one key, or retained by an open batch. */
    this.prefixes = /* @__PURE__ */ new Map();
    /** Numeric slot radix for each indexed host. */
    this.slots = /* @__PURE__ */ new Map();
    /** Empty prefixes to discard only after all destinations have been inserted. */
    this.pending = /* @__PURE__ */ new Set();
    /** Nested batches defer prefix cleanup until the outer batch closes. */
    this.batchDepth = 0;
  }
  /** Add a new key using decoded paths; ancestors share cached prefix objects. */
  add(key, paths) {
    if (this.pathsByKey.has(key)) return;
    const own = paths.map((path) => this.getPrefix(path));
    this.pathsByKey.set(key, own);
    for (const prefix of own) {
      prefix.exact.add(key);
      let ancestor = prefix;
      while (ancestor) {
        ancestor.keys.add(key);
        ancestor = ancestor.parent;
      }
    }
  }
  /** Remove one key without decoding its identity or re-slicing its ancestors. */
  delete(key) {
    const paths = this.pathsByKey.get(key);
    if (!paths) return;
    this.pathsByKey.delete(key);
    for (const prefix of paths) {
      prefix.exact.delete(key);
      let ancestor = prefix;
      while (ancestor) {
        ancestor.keys.delete(key);
        if (!ancestor.keys.size) {
          if (this.batchDepth) this.pending.add(ancestor);
          else this.dropPrefix(ancestor);
        }
        ancestor = ancestor.parent;
      }
    }
  }
  /** Retain emptied prefixes while chained destinations are assembled. */
  beginBatch() {
    this.batchDepth++;
  }
  /** Discard only prefixes still empty after the outer batch. */
  endBatch() {
    if (--this.batchDepth) return;
    for (const prefix of this.pending)
      if (!prefix.keys.size) this.dropPrefix(prefix);
    this.pending.clear();
  }
  /** Drop all indexed references. */
  clear() {
    this.pathsByKey.clear();
    this.prefixes.clear();
    this.slots.clear();
    this.pending.clear();
    this.batchDepth = 0;
  }
  /** Query subtree keys without visiting unrelated entries. */
  under(path) {
    return this.prefixes.get(path)?.keys ?? EMPTY_KEYS;
  }
  /** Query only indexed numeric positions at or beyond the supplied length. */
  tail(host, count) {
    return this.slots.get(host)?.tail(count) ?? EMPTY_KEYS;
  }
  /** Include cached projections at every ancestor of an affected subtree. */
  intersecting(path) {
    const keys = new Set(this.under(path));
    let ancestor = path;
    while (ancestor) {
      ancestor = ancestor.slice(0, ancestor.lastIndexOf("/"));
      for (const key of this.prefixes.get(ancestor)?.exact ?? []) keys.add(key);
    }
    return keys;
  }
  /** Create only missing prefixes, starting at the nearest cached ancestor. */
  getPrefix(path) {
    const held = this.prefixes.get(path);
    if (held) return held;
    const missing = [];
    let cursor = path;
    let parent = this.prefixes.get(cursor);
    while (!parent) {
      missing.push(cursor);
      if (!cursor) break;
      cursor = cursor.slice(0, cursor.lastIndexOf("/"));
      parent = this.prefixes.get(cursor);
    }
    for (let i = missing.length - 1; i >= 0; i--) {
      const current = missing[i];
      const segment = current.slice(current.lastIndexOf("/") + 1);
      const prefix = {
        path: current,
        parent,
        segment,
        numeric: current !== "" && isCanonicalArraySlot(segment),
        keys: /* @__PURE__ */ new Set(),
        exact: /* @__PURE__ */ new Set()
      };
      this.prefixes.set(current, prefix);
      if (prefix.numeric && parent) {
        let slots = this.slots.get(parent.path);
        if (!slots) this.slots.set(parent.path, slots = new NumericPathIndex());
        slots.add(segment, current);
      }
      parent = prefix;
    }
    return parent;
  }
  /** Release an unreferenced prefix and its numeric slot registration. */
  dropPrefix(prefix) {
    this.prefixes.delete(prefix.path);
    if (!prefix.numeric || !prefix.parent) return;
    const slots = this.slots.get(prefix.parent.path);
    slots?.delete(prefix.segment);
    if (slots?.empty) this.slots.delete(prefix.parent.path);
  }
};
var EMPTY_KEYS = /* @__PURE__ */ new Set();

// packages/canard/schema-form/src/core/utils/pathIndex/utils/getStoreKeyPaths.ts
var import_filter29 = require("@winglet/common-utils/filter");
var getStoreKeyPaths = (key, mode) => {
  if (mode === "path") return [key];
  const parts = JSON.parse(key);
  if (!(0, import_filter29.isArray)(parts) || typeof parts[0] !== "string") return [];
  return mode === "rule" && typeof parts[5] === "string" && parts[5] !== parts[0] ? [parts[0], parts[5]] : [parts[0]];
};

// packages/canard/schema-form/src/core/utils/pathIndex/PathKeyedMap.ts
var PathKeyedMap = class extends Map {
  /** Construct an empty indexed store, then insert any explicitly supplied entries. */
  constructor(mode, entries) {
    super();
    this.mode = mode;
    /** Exact, ancestor and numeric-slot lookups updated by this class. */
    this.pathIndex = new PathStoreIndex();
    if (entries) for (const [key, value] of entries) this.set(key, value);
  }
  /** Index newly inserted identities; value-only writes do not touch the index. */
  set(key, value) {
    if (!this.has(key)) this.pathIndex.add(key, getStoreKeyPaths(key, this.mode));
    return super.set(key, value);
  }
  /** Remove an identity and every reference in its path index. */
  delete(key) {
    this.pathIndex.delete(key);
    return super.delete(key);
  }
  /** Clear values and all lookup metadata together. */
  clear() {
    this.pathIndex.clear();
    super.clear();
  }
  /**
   * Replace affected identities in two phases without rebuilding surviving prefixes.
   * @param moves - Distinct existing keys and their decoded destinations
   * @returns Nothing; values retain identity unless the caller transformed them
   */
  replaceEntries(moves) {
    this.pathIndex.beginBatch();
    try {
      for (const move of moves) {
        this.pathIndex.delete(move.previous);
        super.delete(move.previous);
      }
      for (const move of moves) if (move.key !== void 0) {
        this.pathIndex.add(move.key, move.paths);
        super.set(move.key, move.value);
      }
    } finally {
      this.pathIndex.endBatch();
    }
  }
};

// packages/canard/schema-form/src/core/settle/utils/latent/setLatentRaw.ts
var import_filter30 = require("@winglet/common-utils/filter");
var setLatentRaw = (runtime, log, key, present, value, template, order, context) => {
  const latent = runtime.latentRaw;
  const had = latent.has(key);
  const prior = latent.get(key);
  const index = context?.latentDescendantKeys;
  const identity = index ? JSON.parse(key) : void 0;
  const path = (0, import_filter30.isArray)(identity) && typeof identity[0] === "string" ? identity[0] : void 0;
  const missingMetadata = present && template !== void 0 && !runtime.latentRawMetadata?.has(key);
  if (log && !log.has(key)) log.set(key, { present: had, value: prior });
  if (present) latent.set(key, value);
  else latent.delete(key);
  if (template && order) {
    const metadata = runtime.latentRawMetadata ??= new PathKeyedMap("pair");
    runtime.latentRawMetadata = metadata;
    const identity2 = JSON.parse(key);
    if ((0, import_filter30.isArray)(identity2) && typeof identity2[0] === "string")
      metadata.set(key, { path: identity2[0], blueprintNode: template, order });
  }
  if (index && path !== void 0 && had && !present)
    indexLatentDescendant(index, key, path, false);
  if (index && path !== void 0 && present && !had)
    indexLatentDescendant(index, key, path, true);
  if (had !== present || present && !Object.is(prior, value) || missingMetadata) {
    runtime.latentRawDirty = true;
    if (context) context.latentPrefixes = void 0;
  }
};

// packages/canard/schema-form/src/core/settle/utils/write/pruneLatentRaw.ts
var pruneLatentRaw = (runtime, path, names, context) => {
  const childPaths = names?.map((name) => `${path}/${(0, import_pointer10.escapeSegment)(name)}`);
  if (context) {
    const index = getLatentPathIndex(context);
    const paths = childPaths ?? [path];
    for (const childPath of paths)
      for (const key of [...index.get(childPath) ?? []])
        setLatentRaw(
          runtime,
          context.inTransition ? context.latentAutomaticLog : void 0,
          key,
          false,
          void 0,
          void 0,
          void 0,
          context
        );
    return;
  }
  for (const key of runtime.latentRaw.keys()) {
    const identity = JSON.parse(key);
    if (!(0, import_filter31.isArray)(identity) || typeof identity[0] !== "string") continue;
    if (childPaths ? childPaths.some((childPath) => identity[0] === childPath || identity[0].startsWith(`${childPath}/`)) : !path || identity[0] === path || identity[0].startsWith(`${path}/`))
      setLatentRaw(runtime, void 0, key, false, void 0);
  }
};

// packages/canard/schema-form/src/core/settle/utils/write/staticSpec.ts
var SCALAR_SPECS = [/* @__PURE__ */ new Map(), /* @__PURE__ */ new Map()];
var UNION_SPECS = [
  /* @__PURE__ */ new WeakMap(),
  /* @__PURE__ */ new WeakMap()
];
var NO_KINDS = Object.freeze([]);
var staticSpec = (schemaType, nullable) => {
  const index = nullable ? 1 : 0;
  if (typeof schemaType === "string") {
    const cached2 = SCALAR_SPECS[index].get(schemaType);
    if (cached2) return cached2;
    const kinds2 = schemaType === "virtual" || schemaType === "null" ? NO_KINDS : schemaType;
    const spec2 = { kinds: kinds2, mask: 0, nullable };
    SCALAR_SPECS[index].set(schemaType, spec2);
    return spec2;
  }
  const cached = UNION_SPECS[index].get(schemaType);
  if (cached) return cached;
  const kinds = schemaType.filter(
    (kind) => kind !== "null"
  );
  const spec = {
    kinds: kinds.length === 1 ? kinds[0] : kinds,
    mask: 0,
    nullable
  };
  UNION_SPECS[index].set(schemaType, spec);
  return spec;
};

// packages/canard/schema-form/src/core/settle/utils/write/arrayExtras.ts
var import_filter32 = require("@winglet/common-utils/filter");
var arrayExtras = (node, value) => {
  if (node.blueprintNode.item) return void 0;
  const start = (0, import_filter32.isArray)(node.blueprintNode.prefixItems) ? node.blueprintNode.prefixItems.length : 0;
  return value.length > start ? value.slice(start) : void 0;
};

// packages/canard/schema-form/src/core/settle/utils/latent/indexEnteredLatentKey.ts
var indexEnteredLatentKey = (context, node) => {
  const index = context.enteredLatentKeys;
  if (!index) return;
  const key = JSON.stringify([node.path, node.blueprintNode.kind]);
  const occurrences = index.get(key);
  if (occurrences) occurrences.push(node);
  else index.set(key, [node]);
};

// packages/canard/schema-form/src/core/settle/utils/declarations/getDeclaredChildNames.ts
var DECLARED_NAMES = /* @__PURE__ */ new WeakMap();
var getDeclaredChildNames = (template) => {
  let names = DECLARED_NAMES.get(template);
  if (!names) {
    names = new Set(template.childEntries.map((entry) => entry.name));
    DECLARED_NAMES.set(template, names);
  }
  return names;
};

// packages/canard/schema-form/src/core/settle/utils/write/markWrite.ts
var markWrite = (node, input, context, spec = staticSpec(node.schemaType, node.nullable)) => {
  if (node.behavior.type === "virtual" && !context.automatic && context.kind !== "load") assertVirtualWriteShape(node, input);
  if (context.loadScope) {
    context.entered.add(node);
    indexEnteredLatentKey(context, node);
  }
  if (context.kind === "load") context.changedNodes.add(node);
  if (context.kind === "load" && node.behavior.strategy === "branch")
    context.shapeDirtyPaths.add(node.path);
  const isMerge = context.kind === "callerPartial" && !context.automatic;
  if (!context.automatic) context.writtenInputs.set(node, input);
  else context.automaticLog.push({
    node,
    previousRaw: node.raw,
    previousExtras: node.extras,
    previousDistributed: context.distributedInputs.get(node)
  });
  const value = node.behavior.interpret(input, spec);
  if (node.behavior.strategy !== "branch") {
    if (!sameValue(node.raw, value)) {
      node.raw = value;
      context.changedRaw.add(node.path);
      context.changedNodes.add(node);
      if (context.automatic) context.automaticChanged = true;
    }
    context.dirtyPaths.add(node.path);
    return;
  }
  if (node.behavior.type === "virtual") {
    context.dirtyPaths.add(node.path);
    const fields = node.blueprintNode.fields ?? [];
    const values = (0, import_filter33.isArray)(value) ? value : void 0;
    for (let index = 0; index < fields.length; index++) {
      const sibling = node.parent?.structure?.[fields[index]];
      if (!sibling) continue;
      if (!context.automatic && context.kind !== "load" && !isMerge) {
        (context.virtualReplacePaths ??= []).push(sibling.path);
        pruneLatentRaw(sibling.runtime, sibling.path, void 0, context);
      }
      markWrite(sibling, values?.[index], context);
    }
    return;
  }
  let nextRaw;
  let extras;
  let whole;
  let countChanged = false;
  if (node.behavior.type === "array") {
    const previousItemCount = node.itemCount;
    if (context.automatic) context.arrayStructureLog.push({
      host: node,
      previousItems: [...node.children ?? []],
      previousItemCount,
      previousExtras: node.extras
    });
    if (!context.arrayCounts.has(node))
      context.arrayCounts.set(node, previousItemCount);
    node.itemCount = (0, import_filter33.isArray)(value) ? value.length : 0;
    countChanged = node.itemCount !== previousItemCount;
    nextRaw = (0, import_filter33.isArray)(value) ? void 0 : value;
    extras = (0, import_filter33.isArray)(value) ? arrayExtras(node, value) : void 0;
    whole = true;
    if (isMerge && node !== context.replaceScope)
      pruneLatentRaw(node.runtime, node.path, void 0, context);
  } else if (!isPlain(value)) {
    nextRaw = value;
    extras = void 0;
    whole = true;
    if (isMerge && node !== context.replaceScope)
      pruneLatentRaw(node.runtime, node.path, void 0, context);
  } else {
    const declared = getDeclaredChildNames(node.blueprintNode);
    whole = !isMerge;
    nextRaw = isMerge ? node.raw : void 0;
    if (isMerge && nextRaw !== void 0) context.wrongKindHosts.add(node);
    extras = nextExtras(node.extras, value, declared, isMerge);
  }
  const rawChanged = !sameValue(node.raw, nextRaw);
  const extrasChanged = !sameValue(node.extras, extras);
  if (rawChanged || extrasChanged || countChanged) {
    node.raw = nextRaw;
    node.extras = extras;
    context.changedRaw.add(node.path);
    context.changedNodes.add(node);
    if (context.automatic) context.automaticChanged = true;
  }
  context.distributedInputs.set(node, {
    input: value,
    whole,
    automatic: context.automatic
  });
  context.dirtyPaths.add(node.path);
  context.shapeDirtyPaths.add(node.path);
  if (node.structure === null) return;
  for (const name of Object.keys(node.structure)) {
    if (node.behavior.type === "array" && Number(name) >= node.itemCount) continue;
    if (!whole && !hasDistributedChildInput(
      value,
      name,
      node.behavior.type === "array"
    )) continue;
    const child = node.structure[name];
    if (child.behavior.type === "virtual") continue;
    const childInput = hasDistributedChildInput(
      value,
      name,
      node.behavior.type === "array"
    ) ? Reflect.get(value, name) : void 0;
    if (context.automatic) {
      context.writtenInputs.set(child, childInput);
      context.filledNodes.add(child);
    }
    markWrite(child, childInput, context);
  }
};

// packages/canard/schema-form/src/core/settle/utils/latent/HostLatent.ts
var HostLatent = class {
  /**
   * Freeze one host source so later distribution cannot mutate its history.
   * @param raw - Non-plain host value, when present
   * @param extras - Undeclared keys owned by this host
   */
  constructor(raw, extras) {
    this.raw = raw;
    this.extras = extras;
    Object.freeze(this);
  }
};

// packages/canard/schema-form/src/core/settle/utils/latent/restoreLatentState.ts
var import_filter34 = require("@winglet/common-utils/filter");
var restoreLatentState = (node, value, context) => {
  if (node.behavior.strategy === "terminal") {
    markWrite(node, value, context);
    return;
  }
  const raw = value instanceof HostLatent ? value.raw : void 0;
  const extras = value instanceof HostLatent ? value.extras : void 0;
  if (node.behavior.type === "array" && (0, import_filter34.isArray)(raw)) {
    markWrite(node, raw, context);
    return;
  }
  if (!Object.is(node.raw, raw) || !Object.is(node.extras, extras)) {
    node.raw = raw;
    node.extras = extras;
    context.changedRaw.add(node.path);
    context.changedNodes.add(node);
  }
  context.dirtyPaths.add(node.path);
  context.shapeDirtyPaths.add(node.path);
};

// packages/canard/schema-form/src/core/settle/utils/compute/enterSchemaNode.ts
var enterSchemaNode = (host, child, name, context) => {
  const distribution = context.distributedInputs.get(host);
  const latent = context.root.runtime.latentRaw;
  const key = latent.size > 0 ? JSON.stringify([child.path, child.blueprintNode.kind]) : void 0;
  const own = key === void 0 ? void 0 : latent.get(key);
  const write = distribution && hasDistributedChildInput(
    distribution.input,
    name,
    host.behavior.type === "array"
  );
  if (write || distribution?.whole) {
    if (write && !distribution.whole && key !== void 0 && latent.has(key))
      restoreLatentState(child, own, context);
    const value = write ? Reflect.get(distribution.input, name) : void 0;
    if (distribution.automatic) {
      context.automatic = true;
      context.writtenInputs.set(child, value);
      context.filledNodes.add(child);
    }
    markWrite(child, value, context);
    if (distribution.automatic) context.automatic = false;
  } else restoreLatentState(child, own, context);
};

// packages/canard/schema-form/src/core/settle/utils/compute/createChildNode.ts
var createChildNode = (host, entry) => {
  const child = host.runtime.nodeFactory(entry, host, host.runtime);
  if (host.behavior.type === "array" && host.behavior.strategy === "branch")
    child.itemKey = host.nextItemKey++;
  return child;
};

// packages/canard/schema-form/src/core/settle/utils/compute/primeHost.ts
var primeHost = (node, prior, context) => {
  const baseline = {};
  Object.setPrototypeOf(baseline, null);
  for (const entry of node.behavior.declareChildren(node)) {
    if (baseline[entry.name] || !entry.declarations.some((declaration) => declaration.gates.length === 0)) continue;
    const priorChild = (0, import_lib9.hasOwnProperty)(prior, entry.name) ? prior[entry.name] : void 0;
    const key = JSON.stringify([
      `${node.path}/${(0, import_pointer11.escapeSegment)(entry.name)}`,
      entry.node.kind
    ]);
    const pending = context.pendingExits.get(key);
    const child = priorChild ?? pending ?? createChildNode(node, entry);
    context.perished.delete(child);
    context.pendingExits.delete(key);
    if (pending && child === pending) {
      context.revived.add(child);
      indexEnteredLatentKey(context, child);
    }
    if (context.hasGates) getGateRegistry(child.runtime).register(child);
    if (!priorChild && !pending) {
      context.entered.add(child);
      indexEnteredLatentKey(context, child);
      if (child.behavior.type === "virtual") context.dirtyPaths.add(child.path);
      else enterSchemaNode(node, child, entry.name, context);
      if (child.behavior.strategy === "branch")
        context.shapeDirtyPaths.add(child.path);
    }
    const schema = mergeEffectiveSchema(
      child.blueprintNode,
      [],
      { mode: "runtime", isAtomic: node.runtime.blueprint?.isAtomic }
    );
    if (child.schema !== schema) {
      if (!context.originalSchemas.has(child.path))
        context.originalSchemas.set(child.path, child.schema);
      child.schema = captureSchemaNodeChange(child, "schema", schema);
      context.dirtyPaths.add(child.path);
      context.changedNodes.add(child);
    }
    child.active = captureSchemaNodeChange(child, "active", true);
    child.detached = false;
    baseline[entry.name] = child;
  }
  node.structure = baseline;
  node.children = captureSchemaNodeChange(node, "children", Object.values(baseline));
};

// packages/canard/schema-form/src/core/settle/utils/compute/preserveReferences.ts
var preserveReferences = (node, previous, context) => {
  if (sameValue(previous.local, node.local)) node.local = captureSchemaNodeChange(node, "local", previous.local);
  if (sameValue(previous.emit, node.emit)) node.emit = captureSchemaNodeChange(node, "emit", previous.emit);
  if (previous.children && node.children && previous.children.length === node.children.length && previous.children.every((child, index) => child === node.children?.[index]))
    node.children = captureSchemaNodeChange(node, "children", previous.children);
  if (node.local === previous.local && node.emit === previous.emit && node.children === previous.children && node.schema === (context.originalSchemas.get(node.path) ?? previous.schema) && node.active === previous.active && !context.changedRaw.has(node.path) && !context.entered.has(node))
    context.changedNodes.delete(node);
};

// packages/canard/schema-form/src/core/settle/utils/errors/recordSettlementFailure.ts
var recordSettlementFailure = (context, failure, cause, identity = [
  failure.code,
  String(failure.details.path),
  String(failure.details.schemaPath),
  failure.message
].join("\0")) => {
  const keys = context.failureKeys ??= /* @__PURE__ */ new Set();
  if (keys.has(identity)) return;
  keys.add(identity);
  const failures = context.failures ??= [];
  failures.push(failure);
  context.cause ??= cause;
  const runtime = context.root.runtime;
  if (!runtime.entryDepth) return;
  runtime.chainErrors?.push(failure);
  if (runtime.errorReporter?.hasConsumer())
    runtime.chainOccurrences?.push({ kind: "error", error: failure });
};

// packages/canard/schema-form/src/core/settle/utils/compute/selectChildren.ts
var import_lib15 = require("@winglet/common-utils/lib");
var import_pointer15 = require("@winglet/json/pointer");

// packages/canard/schema-form/src/core/settle/utils/gates/evaluateGate.ts
var import_filter36 = require("@winglet/common-utils/filter");
var import_pointer12 = require("@winglet/json/pointer");
var import_lib12 = require("@winglet/common-utils/lib");

// packages/canard/schema-form/src/core/settle/utils/gates/readProjectedValue.ts
var import_lib10 = require("@winglet/common-utils/lib");

// packages/canard/schema-form/src/core/settle/utils/compute/updateOutput.ts
var updateOutput = (node, context, recalculated) => {
  context.pendingOutputs?.delete(node);
  const hint = recalculated && (node.behavior.type === "array" || node.behavior.type === "object") && node.behavior.strategy === "branch" ? { incremental: false } : void 0;
  const assembled = node.behavior.assemble(
    node,
    node.children ?? [],
    recalculated,
    hint
  );
  const previousLocal = node.local;
  const same = hint?.incremental ? node.behavior.type === "object" && previousLocal !== null && typeof previousLocal === "object" && assembled !== null && typeof assembled === "object" && recalculated?.every((child) => sameValue(
    Reflect.get(previousLocal, child.name),
    Reflect.get(assembled, child.name)
  )) : sameValue(node.local, assembled);
  const local = same ? node.local : assembled;
  let projected = node.behavior.project(node, local);
  if (node.parent === null && projected === void 0 && (node.behavior.type === "object" || node.behavior.type === "array"))
    projected = local;
  const emit = node.emit === node.local && projected === local ? local : sameValue(node.emit, projected) ? node.emit : projected;
  const changed = local !== node.local || emit !== node.emit;
  node.local = captureSchemaNodeChange(node, "local", local);
  node.emit = captureSchemaNodeChange(node, "emit", emit);
  if (changed) {
    context.changedNodes.add(node);
    const parent = node.parent;
    const index = context.virtualReferenceIndex;
    if (node.behavior.type !== "virtual" && parent && index) {
      const names = index.get(parent.blueprintNode)?.get(node.name);
      if (names)
        for (const name of names) {
          const virtual = parent.structure?.[name];
          if (virtual?.behavior.type === "virtual" && !virtual.detached)
            updateOutput(virtual, context);
        }
    }
  }
  return changed;
};

// packages/canard/schema-form/src/core/settle/utils/compute/flushPendingOutput.ts
var flushPendingOutput = (node, context) => {
  if (!context.pendingOutputs?.delete(node)) return false;
  node.children = captureSchemaNodeChange(node, "children", Object.values(node.structure ?? {}));
  updateOutput(node, context);
  return true;
};

// packages/canard/schema-form/src/core/settle/utils/gates/readProjectedValue.ts
var projectedEmission = (node, context) => node.emit === void 0 || context.changedRaw.has(node.path) && !context.changedNodes.has(node) ? void 0 : node.emit;
var readProjectedValue = (context, path) => {
  let node = context.root;
  if (!path) flushPendingOutput(node, context);
  let value = projectedEmission(node, context);
  if (!path) return value;
  let atNode = true;
  for (const encoded of path.slice(1).split("/")) {
    const name = encoded.replace(/~1/g, "/").replace(/~0/g, "~");
    if (node.behavior.strategy === "branch" && node.raw !== void 0 && flushPendingOutput(node, context)) value = projectedEmission(node, context);
    if (node.behavior.strategy === "branch" && node.raw !== void 0 && (node.parent !== null || value === null || typeof value !== "object" || !(0, import_lib10.hasOwnProperty)(value, name))) return void 0;
    const child = node.structure && (0, import_lib10.hasOwnProperty)(node.structure, name) ? node.structure[name] : void 0;
    if (child) {
      node = child;
      atNode = true;
      value = projectedEmission(node, context);
    } else {
      if (flushPendingOutput(node, context)) value = projectedEmission(node, context);
      atNode = false;
      if (value !== null && typeof value === "object" && (0, import_lib10.hasOwnProperty)(value, name))
        value = Reflect.get(value, name);
      else {
        const declared = getDeclaredChildNames(node.blueprintNode);
        if (!declared.has(name) && node.extras !== null && typeof node.extras === "object" && (0, import_lib10.hasOwnProperty)(node.extras, name))
          value = Reflect.get(node.extras, name);
        else return void 0;
      }
    }
  }
  if (atNode && flushPendingOutput(node, context)) value = projectedEmission(node, context);
  return value;
};

// packages/canard/schema-form/src/core/validation/utils/copy/createValidatorCopy.ts
var import_filter35 = require("@winglet/common-utils/filter");
var SCHEMA_KEYS = /* @__PURE__ */ new Set([
  "additionalProperties",
  "unevaluatedProperties",
  "propertyNames",
  "contains",
  "items",
  "not",
  "if",
  "then",
  "else",
  "additionalItems",
  "unevaluatedItems",
  "contentSchema"
]);
var SCHEMA_MAP_KEYS = /* @__PURE__ */ new Set([
  "properties",
  "patternProperties",
  "$defs",
  "definitions",
  "dependentSchemas",
  "dependencies"
]);
var SCHEMA_ARRAY_KEYS = /* @__PURE__ */ new Set(["allOf", "anyOf", "oneOf", "prefixItems"]);
var createValidatorCopy = (authored) => {
  if (typeof authored !== "object" || authored === null) return authored;
  const copy = {};
  const seen = new WeakMap([[authored, copy]]);
  const pending = [
    { source: authored, target: copy, kind: "schema" }
  ];
  while (pending.length) {
    const current = pending.pop();
    if (!current) continue;
    for (const [key, value] of Object.entries(current.source)) {
      if (current.kind === "schema" && (key === "controls" || key === "options" || key === "presentation"))
        continue;
      const childKind = current.kind === "schema" ? SCHEMA_KEYS.has(key) ? (0, import_filter35.isArray)(value) ? "array" : "schema" : SCHEMA_MAP_KEYS.has(key) ? "map" : SCHEMA_ARRAY_KEYS.has(key) ? "array" : "data" : current.kind === "map" || current.kind === "array" ? "schema" : "data";
      if (value === null || typeof value !== "object") {
        Object.defineProperty(current.target, key, {
          value,
          enumerable: true,
          configurable: true,
          writable: true
        });
        continue;
      }
      let child = seen.get(value);
      if (!child) {
        child = (0, import_filter35.isArray)(value) ? [] : {};
        seen.set(value, child);
        pending.push({ source: value, target: child, kind: childKind });
      }
      Object.defineProperty(current.target, key, {
        value: child,
        enumerable: true,
        configurable: true,
        writable: true
      });
    }
  }
  return copy;
};

// packages/canard/schema-form/src/core/validation/utils/cache/validationEntries.ts
var validationEntries = /* @__PURE__ */ new WeakMap();

// packages/canard/schema-form/src/core/validation/utils/lifetime/recentReleaseList.ts
var lists = /* @__PURE__ */ new WeakMap();
var recentReleaseList = (validator) => {
  let list = lists.get(validator);
  if (!list) {
    list = { counts: /* @__PURE__ */ new Map(), recent: [] };
    lists.set(validator, list);
  }
  return list;
};

// packages/canard/schema-form/src/core/validation/utils/lifetime/evictValidationRoot.ts
var evictValidationRoot = (validator, authoredRoot) => {
  const list = recentReleaseList(validator);
  if ((list.counts.get(authoredRoot) ?? 0) > 0) return;
  const index = list.recent.indexOf(authoredRoot);
  if (index >= 0) list.recent.splice(index, 1);
  list.counts.delete(authoredRoot);
  const roots = validationEntries.get(validator);
  const entry = typeof authoredRoot === "object" && authoredRoot !== null ? roots?.get(authoredRoot) : void 0;
  try {
    if (entry) validator.release?.(entry.copy);
  } finally {
    if (typeof authoredRoot === "object" && authoredRoot !== null)
      roots?.delete(authoredRoot);
  }
};

// packages/canard/schema-form/src/core/validation/utils/cache/readValidationEntry.ts
var readValidationEntry = (validator, authoredRoot) => {
  let roots = validationEntries.get(validator);
  if (!roots) {
    roots = /* @__PURE__ */ new WeakMap();
    validationEntries.set(validator, roots);
  }
  if (typeof authoredRoot !== "object" || authoredRoot === null)
    throw new TypeError("Validation cache requires an authored root object");
  const existing = roots.get(authoredRoot);
  if (existing) return existing;
  const list = recentReleaseList(validator);
  if (typeof authoredRoot.$id === "string") {
    for (const oldRoot of [...list.recent])
      if (oldRoot !== authoredRoot && typeof oldRoot === "object" && oldRoot !== null && oldRoot.$id === authoredRoot.$id)
        evictValidationRoot(validator, oldRoot);
  }
  list.counts.set(authoredRoot, 0);
  list.recent.push(authoredRoot);
  if (list.recent.length > 8) evictValidationRoot(validator, list.recent[0]);
  const copy = createValidatorCopy(authoredRoot);
  let validate;
  let failure;
  try {
    validate = validator.compile(copy);
  } catch (error) {
    failure = error;
  }
  const entry = {
    copy,
    guards: /* @__PURE__ */ new Map(),
    validate,
    failure,
    eagerCompiled: false
  };
  roots.set(authoredRoot, entry);
  return entry;
};

// packages/canard/schema-form/src/core/validation/utils/guard/isValidator.ts
var isValidator = (candidate) => candidate !== null && typeof candidate === "object" && "compile" in candidate && typeof candidate.compile === "function" && "compileGuard" in candidate && typeof candidate.compileGuard === "function";

// packages/canard/schema-form/src/core/validation/utils/guard/readSchemaNodeGuard.ts
var readSchemaNodeGuard = (runtime, gate) => {
  const validator = runtime.validator;
  if (!isValidator(validator)) return void 0;
  const root = runtime.blueprint.schema;
  const entry = readValidationEntry(validator, root);
  const pointer = gate.schemaPath.startsWith("#") ? gate.schemaPath.slice(1) : gate.schemaPath;
  const cached = entry.guards.get(pointer);
  if (cached) {
    if ("failure" in cached) throw cached.failure;
    return cached.guard;
  }
  try {
    const guard = validator.compileGuard(entry.copy, pointer);
    entry.guards.set(pointer, { guard });
    return guard;
  } catch (failure) {
    entry.guards.set(pointer, { failure });
    throw failure;
  }
};

// packages/canard/schema-form/src/core/types/state.ts
var ValidationMode = /* @__PURE__ */ ((ValidationMode2) => {
  ValidationMode2[ValidationMode2["None"] = BIT_MASK_NONE] = "None";
  ValidationMode2[ValidationMode2["OnChange"] = BIT_FLAG_00] = "OnChange";
  ValidationMode2[ValidationMode2["OnRequest"] = BIT_FLAG_01] = "OnRequest";
  return ValidationMode2;
})(ValidationMode || {});
var SchemaNodeState = /* @__PURE__ */ ((SchemaNodeState2) => {
  SchemaNodeState2[SchemaNodeState2["Dirty"] = BIT_FLAG_00] = "Dirty";
  SchemaNodeState2[SchemaNodeState2["Touched"] = BIT_FLAG_01] = "Touched";
  SchemaNodeState2[SchemaNodeState2["ShowError"] = BIT_FLAG_02] = "ShowError";
  return SchemaNodeState2;
})(SchemaNodeState || {});

// packages/canard/schema-form/src/core/validation/utils/route/routeValidationIssues.ts
var import_lib11 = require("@winglet/common-utils/lib");

// packages/canard/schema-form/src/core/validation/utils/route/isOffUnionBranchIssue.ts
var isOffUnionBranchIssue = (issue, blueprint2, activeIds) => {
  if (!issue.schemaPath || !activeIds) return false;
  const matches = blueprint2.fragments.filter((fragment) => issue.schemaPath === fragment.schemaPath || issue.schemaPath?.startsWith(`${fragment.schemaPath}/`));
  if (!matches.length) return false;
  const longest = Math.max(...matches.map((fragment) => fragment.schemaPath.length));
  const owners = matches.filter((fragment) => fragment.schemaPath.length === longest);
  const branches = [];
  for (const fragment of blueprint2.fragments) {
    if (!/^.*\/(?:oneOf|anyOf)\/\d+$/.test(fragment.schemaPath)) continue;
    const pending = [fragment.id];
    const visited = /* @__PURE__ */ new Set();
    while (pending.length) {
      const id = pending.pop();
      if (id === void 0 || visited.has(id)) continue;
      visited.add(id);
      pending.push(...blueprint2.fragments[id].children);
    }
    if (owners.some((owner2) => visited.has(owner2.id))) branches.push(fragment);
  }
  if (!branches.length) return false;
  const nearest = Math.max(...branches.map((fragment) => fragment.schemaPath.length));
  const candidates = branches.filter((fragment) => fragment.schemaPath.length === nearest);
  if (candidates.length !== 1) return false;
  const owner = candidates[0];
  if (!owner.gates.length) return false;
  const unionPath = owner.schemaPath.slice(0, owner.schemaPath.lastIndexOf("/"));
  const siblings = blueprint2.fragments.filter((fragment) => fragment.id !== owner.id && /^\d+$/.test(fragment.schemaPath.slice(unionPath.length + 1)) && fragment.schemaPath.startsWith(`${unionPath}/`));
  const isActive = (fragment) => fragment.declares.some((id) => activeIds.has(id)) || fragment.overlays.some((id) => activeIds.has(id));
  return !isActive(owner) && siblings.some(isActive);
};

// packages/canard/schema-form/src/core/validation/utils/route/normalizeIssueDataPath.ts
var normalizeIssueDataPath = (dataPath) => dataPath === "/" ? "" : dataPath;

// packages/canard/schema-form/src/core/validation/utils/route/updateSchemaNodeGlobalErrors.ts
var EMPTY_GLOBAL_ERRORS = Object.freeze([]);
var updateSchemaNodeGlobalErrors = (root) => {
  const runtime = root.runtime;
  const external = runtime.nodeErrors?.get(root);
  const validation = runtime.routedValidationErrors;
  runtime.globalErrors = external?.length ? validation?.length ? [...external, ...validation] : external : validation ?? EMPTY_GLOBAL_ERRORS;
};

// packages/canard/schema-form/src/core/validation/utils/route/routeValidationIssues.ts
var isOwnedNode = (candidate, runtime) => candidate !== null && typeof candidate === "object" && Reflect.get(candidate, "runtime") === runtime;
var routeValidationIssues = (target, issues) => {
  const root = target.rootNode;
  const runtime = root.runtime;
  const before = runtime.validationErrors ?? /* @__PURE__ */ new Map();
  const next = new Map(before);
  let activeIds;
  if (issues.length > 0 && runtime.committedDeclarationIds?.size) {
    activeIds = /* @__PURE__ */ new Set();
    for (const ids of runtime.committedDeclarationIds.values())
      for (let index = 0; index < ids.length; index++) activeIds.add(ids[index]);
  }
  const inScope = (node) => node === target || node.path.startsWith(`${target.path}/`);
  for (const node of before.keys())
    if (isOwnedNode(node, runtime) && inScope(node)) next.delete(node);
  for (let index = 0; index < issues.length; index++) {
    const issue = issues[index];
    if (isOffUnionBranchIssue(issue, runtime.blueprint, activeIds)) continue;
    const path = normalizeIssueDataPath(issue.dataPath);
    let node = root;
    if (path) {
      if (!path.startsWith("/")) continue;
      const segments = path.slice(1).split("/");
      for (let segmentIndex = 0; segmentIndex < segments.length; segmentIndex++) {
        const encoded = segments[segmentIndex];
        if (node.structure === null) break;
        const key = encoded.replace(/~1/g, "/").replace(/~0/g, "~");
        if (!(0, import_lib11.hasOwnProperty)(node.structure, key)) {
          node = root;
          break;
        }
        const child = node.structure[key];
        if (!child) {
          node = root;
          break;
        }
        node = child;
      }
      if (node === root && path !== "") continue;
    }
    if (issue.rejectedKey) {
      while (node.parent && node.structure === null) node = node.parent;
    }
    if (!inScope(node)) continue;
    const previous = next.get(node) ?? [];
    next.set(node, [...previous, issue]);
  }
  const changed = /* @__PURE__ */ new Set();
  const candidates = new Set(before.keys());
  for (const node of next.keys()) candidates.add(node);
  for (const node of candidates) {
    if (!isOwnedNode(node, runtime) || !inScope(node)) continue;
    const current = node;
    const oldIssues = before.get(node) ?? [];
    const newIssues = next.get(node) ?? [];
    if (oldIssues.length !== newIssues.length) changed.add(current);
    else for (let index = 0; index < oldIssues.length; index++)
      if (oldIssues[index] !== newIssues[index]) {
        changed.add(current);
        break;
      }
  }
  runtime.validationErrors = next;
  if (runtime.validationChangedNodes)
    for (const node of changed) runtime.validationChangedNodes.add(node);
  else runtime.validationChangedNodes = changed;
  if (runtime.routedValidationErrors !== issues) {
    runtime.routedValidationErrors = issues;
    updateSchemaNodeGlobalErrors(root);
  }
  runtime.combinedErrors?.clear();
  return changed;
};

// packages/canard/schema-form/src/core/validation/utils/run/assertValidationRootReady.ts
var assertValidationRootReady = (node) => {
  const root = node.rootNode;
  const validator = root.runtime.validator;
  if (!isValidator(validator)) return null;
  const authoredRoot = root.runtime.blueprint.schema;
  const entry = readValidationEntry(validator, authoredRoot);
  if (entry.validate && !entry.failure) return entry.validate;
  const id = typeof authoredRoot === "object" && authoredRoot !== null && typeof authoredRoot.$id === "string" ? authoredRoot.$id : void 0;
  const duplicate = !!id && entry.failure instanceof Error && /already exists|duplicate/i.test(entry.failure.message) && [...recentReleaseList(validator).counts].some(([other, count]) => other !== authoredRoot && count > 0 && typeof other === "object" && other !== null && other.$id === id);
  throw new SchemaFormError(
    VALIDATOR_COMPILE_FAILED,
    "Whole-schema validation could not be compiled",
    { error: entry.failure, ...duplicate ? { reason: "duplicateSchemaId", $id: id } : {} }
  );
};

// packages/canard/schema-form/src/core/validation/utils/run/runSchemaNodeValidation.ts
var runSchemaNodeValidation = async (node) => {
  const validate = assertValidationRootReady(node);
  if (!validate) return null;
  try {
    return await validate(node.rootNode.emit) ?? [];
  } catch (error) {
    throw new SchemaFormError(
      VALIDATOR_THREW,
      "Whole-schema validator threw while checking the emitted value",
      { error }
    );
  }
};

// packages/canard/schema-form/src/core/validation/utils/run/requestSchemaNodeValidation.ts
var requestSchemaNodeValidation = (node, deliver) => {
  const runtime = node.rootNode.runtime;
  if (runtime.validationMode === ValidationMode.None || runtime.validationUnavailable) return;
  runtime.validationStamp = (runtime.validationStamp ?? 0) + 1;
  runtime.validationRequestStamp = runtime.validationStamp;
  (runtime.validationPendingTargets ??= /* @__PURE__ */ new Set()).add(node);
  if (runtime.validationQueued) return;
  runtime.validationQueued = true;
  queueMicrotask(() => {
    runtime.validationQueued = false;
    if (runtime.validationStamp !== runtime.validationRequestStamp) {
      runtime.validationPendingTargets = void 0;
      return;
    }
    const targets = runtime.validationPendingTargets ?? /* @__PURE__ */ new Set([node]);
    runtime.validationPendingTargets = void 0;
    const stamp = runtime.validationStamp;
    const commit = runtime.commitNumber ?? 0;
    void runSchemaNodeValidation(node).then((issues) => {
      if (issues === null) return;
      if (runtime.validationStamp !== stamp || (runtime.commitNumber ?? 0) !== commit)
        return;
      for (const target of targets) routeValidationIssues(target, issues);
      runtime.validationResult = { commit, issues };
      deliver(issues, commit);
    }).catch((failure) => {
      if (runtime.validationStamp !== stamp) return;
      if (failure !== null && typeof failure === "object" && "code" in failure && failure.code === `SCHEMA_FORM_ERROR.${VALIDATOR_COMPILE_FAILED}`) {
        runtime.validationUnavailable = true;
        if (runtime.validationCompileReported) return;
        runtime.validationCompileReported = true;
      }
      runtime.reportValidationFailure?.(failure);
    });
  });
};

// packages/canard/schema-form/src/core/validation/utils/read/readSchemaNodeErrors.ts
var EMPTY_ISSUES = Object.freeze([]);
var readSchemaNodeErrors = (node) => {
  const runtime = node.rootNode.runtime;
  if (node.detached) return runtime.detachedReads?.get(node)?.errors ?? EMPTY_ISSUES;
  const external = runtime.nodeErrors?.get(node);
  const validation = runtime.validationErrors?.get(node);
  const isIssues = (items2) => !!items2 && items2.every((item) => item !== null && typeof item === "object" && "dataPath" in item && typeof item.dataPath === "string");
  if (!isIssues(external)) return isIssues(validation) ? validation : EMPTY_ISSUES;
  if (!isIssues(validation)) return external;
  const cached = runtime.combinedErrors?.get(node);
  if (cached?.external === external && cached.validation === validation && isIssues(cached.errors)) return cached.errors;
  const errors = [...external, ...validation];
  (runtime.combinedErrors ??= /* @__PURE__ */ new Map()).set(node, { external, validation, errors });
  return errors;
};

// packages/canard/schema-form/src/core/settle/utils/gates/evaluateGate.ts
var evaluateGate = (gate, context, owner, edgeName) => {
  if (gate.appliesWhen?.some((parentGate) => !evaluateGate(parentGate, context, owner)))
    return false;
  const hostPath = getGateRegistry(owner.runtime).locate(owner, gate, edgeName).hostPath;
  const raw = gate.kind === "active" ? void 0 : readProjectedValue(context, hostPath);
  const host = raw !== null && typeof raw === "object" && !(0, import_filter36.isArray)(raw) ? raw : {};
  let input = { ...host };
  const hostNode = gate.kind === "active" ? void 0 : hostPath === "" ? context.root : hostPath.split("/").slice(1).reduce((node, encoded) => {
    const structure = node?.structure;
    const name = (0, import_pointer12.unescapeSegment)(encoded);
    return structure && (0, import_lib12.hasOwnProperty)(structure, name) ? structure[name] : void 0;
  }, context.root);
  const extra = hostNode?.extras;
  let projectedHost = hostNode !== void 0;
  for (let ancestor = hostNode; ancestor; ancestor = ancestor.parent)
    if (ancestor.behavior.strategy === "branch" && ancestor.raw !== void 0 && (ancestor.parent !== null || raw === null || typeof raw !== "object" || (0, import_filter36.isArray)(raw))) {
      projectedHost = false;
      break;
    }
  const projectedExtra = projectedHost ? extra : void 0;
  if (projectedExtra !== null && typeof projectedExtra === "object" && !(0, import_filter36.isArray)(projectedExtra))
    input = { ...input, ...projectedExtra };
  try {
    if (gate.kind === "discriminator") {
      const condition = gate.condition;
      if (condition === null || typeof condition !== "object" || !("propertyName" in condition) || typeof condition.propertyName !== "string" || !("values" in condition) || !(0, import_filter36.isArray)(condition.values)) return false;
      const value = (0, import_lib12.hasOwnProperty)(input, condition.propertyName) ? input[condition.propertyName] : void 0;
      for (let index = 0; index < condition.values.length; index++)
        if (condition.values[index] === value) return true;
      return false;
    }
    if (gate.kind === "if") {
      const runtime = context.root.runtime;
      const guard = readSchemaNodeGuard(runtime, gate);
      if (!guard) {
        const keys = runtime.errorReporter?.hasConsumer() ? runtime.warningKeys ??= /* @__PURE__ */ new Set() : void 0;
        if (runtime.validationMode !== ValidationMode.None && keys && !keys.has(VALIDATOR_MISSING)) {
          keys.add(VALIDATOR_MISSING);
          const record = {
            level: "warning",
            code: `SCHEMA_FORM_WARNING.${VALIDATOR_MISSING}`,
            message: "Validation is disabled because no validator was selected"
          };
          (runtime.pendingWarningRecords ??= /* @__PURE__ */ new Map()).set(
            VALIDATOR_MISSING,
            record
          );
          runtime.chainOccurrences?.push({ kind: "record", record });
        }
        if (keys && !keys.has(CONDITIONAL_SCHEMA_WITHOUT_VALIDATOR)) {
          keys.add(CONDITIONAL_SCHEMA_WITHOUT_VALIDATOR);
          const record = {
            level: "warning",
            code: `SCHEMA_FORM_WARNING.${CONDITIONAL_SCHEMA_WITHOUT_VALIDATOR}`,
            message: "Conditional schema is inactive without a validator",
            schemaPath: gate.schemaPath
          };
          (runtime.pendingWarningRecords ??= /* @__PURE__ */ new Map()).set(
            CONDITIONAL_SCHEMA_WITHOUT_VALIDATOR,
            record
          );
          runtime.chainOccurrences?.push({ kind: "record", record });
        }
        return false;
      }
      const result = guard(input);
      if (typeof result !== "boolean")
        throw new TypeError(`Guard at ${gate.schemaPath} did not return a boolean`);
      return gate.negated ? !result : result;
    }
    const blueprint2 = context.root.runtime.blueprint;
    const expression = blueprint2 ? getGateExpression(blueprint2, gate.schemaPath) : void 0;
    if (expression) {
      const dependencies = expression.dependencies.map((dependency) => {
        const path = resolveDependencyPath(hostPath, dependency);
        return path === "@" ? context.root.runtime.context ?? {} : readProjectedValue(context, path);
      });
      return Boolean(expression.evaluate(dependencies));
    }
    return gate.condition === true;
  } catch (cause) {
    const runtime = context.root.runtime;
    context.gateThrowVersion = (context.gateThrowVersion ?? 0) + 1;
    const code = gate.kind === "if" ? GUARD_FAILED : EXPRESSION_THREW;
    const repeated = context.failures?.some((error) => error.code === `SCHEMA_FORM_ERROR.${code}` && error.details.path === hostPath && error.details.schemaPath === gate.schemaPath);
    const failure = runtime.mountingGuardPass || repeated ? void 0 : new SchemaFormError(
      code,
      `Gate evaluation failed at ${gate.schemaPath}`,
      { path: hostPath, schemaPath: gate.schemaPath, cause }
    );
    if (gate.kind === "if" && runtime.errorReporter?.hasConsumer() && !runtime.reportedGuardFailures?.has(gate.schemaPath) && !runtime.guardFailureRecords?.has(gate.schemaPath)) {
      const record = {
        level: "error",
        code: "SCHEMA_FORM_ERROR.GUARD_FAILED",
        message: `Gate evaluation failed at ${gate.schemaPath}`,
        schemaPath: gate.schemaPath,
        path: hostPath,
        details: { cause },
        surface: runtime.mountingGuardPass ? "sink" : "thrown"
      };
      (runtime.guardFailureRecords ??= /* @__PURE__ */ new Map()).set(gate.schemaPath, record);
      runtime.chainOccurrences?.push({ kind: "record", record });
    }
    if (failure) recordSettlementFailure(context, failure, "expression");
    return false;
  }
};

// packages/canard/schema-form/src/core/settle/utils/compute/hasSharedConflict.ts
var import_filter37 = require("@winglet/common-utils/filter");
var hasSharedConflict = (entry, active) => {
  if (active.some((declaration) => declaration.role === "declaration" && declaration.gates.length === 0))
    return false;
  const kinds = active.filter((declaration) => declaration.role === "declaration" && declaration.gates.length > 0).map((declaration) => {
    const schema = declaration.schema;
    const type = typeof schema === "object" && schema !== null ? schema.type : void 0;
    const first = (0, import_filter37.isArray)(type) ? type[0] : type;
    return first === "integer" ? "number" : first ?? entry.node.kind;
  });
  return kinds.length > 1 && kinds.some((kind) => kind !== kinds[0]);
};

// packages/canard/schema-form/src/core/settle/utils/gates/flushPendingGateReads.ts
var import_lib13 = require("@winglet/common-utils/lib");
var import_pointer13 = require("@winglet/json/pointer");
var READ_PLANS = /* @__PURE__ */ new WeakMap();
var flushPendingGateReads = (template, path, context) => {
  if (context.root.runtime.blueprint.capabilities.branchless) return;
  if (!context.pendingOutputs?.size) return;
  let plan = READ_PLANS.get(template);
  if (!plan) {
    const built = { occurrences: [], recursive: false };
    const ancestors = /* @__PURE__ */ new Set();
    const visit = (node, suffix) => {
      if (ancestors.has(node)) {
        built.recursive = true;
        return;
      }
      ancestors.add(node);
      for (const declaration of node.declarations)
        for (const gate of declaration.gates)
          built.occurrences.push({
            gate,
            node,
            suffix,
            childSuffix: gate.schemaPath === `${node.schemaPath}/controls/active` ? suffix : void 0
          });
      for (const entry of node.childEntries) {
        const childSuffix = `${suffix}/${(0, import_pointer13.escapeSegment)(entry.name)}`;
        for (const declaration of entry.declarations)
          for (const gate of declaration.gates)
            built.occurrences.push({
              gate,
              node,
              suffix,
              childSuffix: gate.schemaPath === `${declaration.schemaPath}/controls/active` ? childSuffix : void 0
            });
        visit(entry.node, childSuffix);
      }
      for (const [index, item] of (node.prefixItems ?? []).entries())
        visit(item, `${suffix}/${index}`);
      if (node.item) visit(node.item, `${suffix}/${node.prefixItems?.length ?? 0}`);
      ancestors.delete(node);
    };
    visit(template, "");
    plan = built;
    READ_PLANS.set(template, plan);
  }
  if (plan.recursive) {
    for (const host of context.pendingOutputs) flushPendingOutput(host, context);
    return;
  }
  const flushRead = (read) => {
    if (read === "@") return;
    const local = read === path || read.startsWith(`${path}/`);
    for (const host of context.pendingOutputs ?? []) {
      if (local && host.raw === void 0) continue;
      if (read === host.path) flushPendingOutput(host, context);
      else if (read.startsWith(`${host.path}/`)) {
        const name = (0, import_pointer13.unescapeSegment)(read.slice(host.path.length + 1).split("/")[0]);
        if (host.raw !== void 0 || !host.structure || !(0, import_lib13.hasOwnProperty)(host.structure, name)) flushPendingOutput(host, context);
      }
    }
  };
  const blueprint2 = context.root.runtime.blueprint;
  const flushGate = (gate, node, occurrencePath, childHostPath) => {
    for (const parent of gate.appliesWhen ?? []) flushGate(parent, node, occurrencePath);
    const hostPath = bindGateHostPath(
      gate,
      node.path,
      occurrencePath,
      childHostPath
    );
    if (gate.kind !== "active") flushRead(hostPath);
    else {
      const expression = getGateExpression(blueprint2, gate.schemaPath);
      for (const dependency of expression?.dependencies ?? [])
        flushRead(resolveDependencyPath(hostPath, dependency));
    }
  };
  for (const occurrence of plan.occurrences) {
    flushGate(
      occurrence.gate,
      occurrence.node,
      `${path}${occurrence.suffix}`,
      occurrence.childSuffix === void 0 ? void 0 : `${path}${occurrence.childSuffix}`
    );
  }
};

// packages/canard/schema-form/src/core/settle/utils/latent/hasLatentUnder.ts
var import_filter38 = require("@winglet/common-utils/filter");
var hasLatentUnder = (context, path) => {
  if (!context.latentPrefixes) {
    const ignored = /* @__PURE__ */ new Set();
    for (const node of [...context.entered, ...context.revived])
      if (!node.detached && (!node.parent || node.parent.structure?.[node.name] === node))
        ignored.add(JSON.stringify([node.path, node.blueprintNode.kind]));
    const prefixes = /* @__PURE__ */ new Set();
    for (const key of context.root.runtime.latentRaw.keys()) {
      if (ignored.has(key)) continue;
      const identity = JSON.parse(key);
      if (!(0, import_filter38.isArray)(identity) || typeof identity[0] !== "string") continue;
      let ancestor = identity[0];
      while (ancestor) {
        ancestor = ancestor.slice(0, ancestor.lastIndexOf("/"));
        prefixes.add(ancestor);
      }
    }
    context.latentPrefixes = prefixes;
  }
  return context.latentPrefixes.has(path);
};

// packages/canard/schema-form/src/core/settle/utils/compute/utils/getRecursiveRelativeSpan.ts
var RELATIVE_SPANS = /* @__PURE__ */ new WeakMap();
var getRecursiveRelativeSpan = (blueprint2) => {
  let span = RELATIVE_SPANS.get(blueprint2);
  if (span !== void 0) return span;
  span = 0;
  const templates = blueprint2.nodes;
  for (let index = 0; index < templates.length; index++) {
    const declarations = templates[index].declarations;
    for (let declarationIndex = 0; declarationIndex < declarations.length; declarationIndex++) {
      const gates = declarations[declarationIndex].gates;
      for (let gateIndex = 0; gateIndex < gates.length; gateIndex++) {
        const reads = gates[gateIndex].evaluationReads;
        for (let readIndex = 0; readIndex < reads.length; readIndex++) {
          const read = reads[readIndex];
          if (typeof read === "number" && read > span) span = read;
        }
      }
    }
  }
  RELATIVE_SPANS.set(blueprint2, span);
  return span;
};

// packages/canard/schema-form/src/core/settle/utils/compute/hasRecursiveExpansion.ts
var CYCLIC_BLUEPRINTS = /* @__PURE__ */ new WeakMap();
var hasTemplateCycle = (node, visiting, visited) => {
  if (visiting.has(node)) return true;
  if (visited.has(node)) return false;
  visiting.add(node);
  for (let index = 0; index < node.childEntries.length; index++)
    if (hasTemplateCycle(node.childEntries[index].node, visiting, visited)) return true;
  if (node.item && hasTemplateCycle(node.item, visiting, visited)) return true;
  const prefixItems = node.prefixItems;
  for (let index = 0; prefixItems && index < prefixItems.length; index++)
    if (hasTemplateCycle(prefixItems[index], visiting, visited)) return true;
  visiting.delete(node);
  visited.add(node);
  return false;
};
var hasOriginalInput = (node, context) => {
  const distribution = context.distributedInputs.get(node);
  if (distribution && !distribution.automatic && distribution.input !== void 0)
    return true;
  if (node.behavior.type === "array" && node.itemCount > 0 && !distribution?.automatic && !context.filledNodes.has(node)) return true;
  if (!context.filledNodes.has(node) && (node.raw !== void 0 || node.extras !== void 0)) return true;
  if (hasLatentUnder(context, node.path)) {
    if (context.latentAutomaticLog.size === 0) return true;
    for (const [key, value] of context.root.runtime.latentRaw) {
      const previous = context.latentAutomaticLog.get(key);
      if (previous && !previous.present || value === void 0) continue;
      const path = JSON.parse(key)[0];
      if (path.startsWith(`${node.path}/`)) return true;
    }
  }
  const children = node.children;
  for (let index = 0; children && index < children.length; index++)
    if (hasOriginalInput(children[index], context)) return true;
  return false;
};
var hasRecursiveExpansion = (parent, template, input, context, schema, hosts) => {
  if (input !== void 0) return false;
  const analysis = parent.runtime.blueprint;
  let cyclic = CYCLIC_BLUEPRINTS.get(analysis);
  if (cyclic === void 0) {
    cyclic = hasTemplateCycle(analysis.root, /* @__PURE__ */ new Set(), /* @__PURE__ */ new Set());
    CYCLIC_BLUEPRINTS.set(analysis, cyclic);
  }
  if (!cyclic) return false;
  let relativeSpan;
  const depth = parent.depth + 1;
  let ancestor = parent;
  while (ancestor) {
    if (ancestor.blueprintNode === template && (!schema || ancestor.schema === schema) && (!hosts || hosts.has(ancestor)) && !hasOriginalInput(ancestor, context)) {
      relativeSpan ??= getRecursiveRelativeSpan(analysis);
      if (depth - ancestor.depth >= relativeSpan) return true;
    }
    ancestor = ancestor.parent;
  }
  return false;
};

// packages/canard/schema-form/src/core/settle/utils/latent/getLatentOrder.ts
var getLatentOrder = (parent, name, template) => {
  const order = [];
  let host = parent;
  let childName = name;
  let childTemplate = template;
  while (host) {
    const entries = host.blueprintNode.childEntries;
    const exact = entries.findIndex((entry) => entry.name === childName && entry.node === childTemplate);
    const sameKind = exact < 0 ? entries.findIndex((entry) => entry.name === childName && entry.node.kind === childTemplate.kind) : exact;
    const arrayIndex = Number(childName);
    order.unshift(sameKind >= 0 ? sameKind : Number.isInteger(arrayIndex) && arrayIndex >= 0 ? arrayIndex : 0);
    childName = host.name;
    childTemplate = host.blueprintNode;
    host = host.parent;
  }
  return order;
};

// packages/canard/schema-form/src/core/settle/utils/latent/distributeLatentValue.ts
var import_pointer14 = require("@winglet/json/pointer");

// packages/canard/schema-form/src/core/behaviors/utils/slots/finishNoInput.ts
var finishNoInput = () => void 0;

// packages/canard/schema-form/src/core/behaviors/utils/slots/interpretIdentity.ts
var interpretIdentity = (input) => input;

// packages/canard/schema-form/src/core/behaviors/arrayBehavior/utils/plan/copyArraySlots.ts
var copyArraySlots = (count, removedIndex = -1) => {
  const slots = [];
  for (let index = 0; index < count; index++)
    if (index !== removedIndex) slots.push({ from: index });
  return slots;
};

// packages/canard/schema-form/src/core/behaviors/arrayBehavior/utils/plan/isValidArrayIndex.ts
var isValidArrayIndex = (index, length) => Number.isInteger(index) && index >= 0 && index < length;

// packages/canard/schema-form/src/core/behaviors/arrayBehavior/utils/plan/arrangeBranchArray.ts
var arrangeBranchArray = (node, operation) => {
  if (node.raw === null && operation.kind !== "push") return { kind: "noop" };
  const count = node.itemCount;
  switch (operation.kind) {
    case "push":
      return {
        kind: "slots",
        slots: [...copyArraySlots(count), { value: operation.value }],
        result: { source: "length" }
      };
    case "pop":
      return count === 0 ? { kind: "noop" } : {
        kind: "slots",
        slots: copyArraySlots(count - 1),
        result: { source: "removed", index: count - 1 }
      };
    case "remove":
      return isValidArrayIndex(operation.index, count) ? {
        kind: "slots",
        slots: copyArraySlots(count, operation.index),
        result: { source: "removed", index: operation.index }
      } : { kind: "noop" };
    case "update":
      return isValidArrayIndex(operation.index, count) ? {
        kind: "update",
        index: operation.index,
        value: operation.value
      } : { kind: "noop" };
    case "clear":
      return count === 0 ? { kind: "noop" } : {
        kind: "slots",
        slots: [],
        result: { source: "void" }
      };
  }
};

// packages/canard/schema-form/src/core/behaviors/arrayBehavior/utils/projection/projectBranchArray.ts
var import_filter40 = require("@winglet/common-utils/filter");

// packages/canard/schema-form/src/core/behaviors/utils/options/getStaticChoices.ts
var import_filter39 = require("@winglet/common-utils/filter");
var CHOICES = /* @__PURE__ */ new WeakMap();
var NO_KEYS = Object.freeze([]);
var getStaticChoices = (effective) => {
  const cached = CHOICES.get(effective);
  if (cached) return cached;
  const schema = effective.schema;
  const options = typeof schema === "object" && schema !== null ? schema.options : void 0;
  const hints = typeof options === "object" && options !== null && !(0, import_filter39.isArray)(options) ? options : void 0;
  const propertyKeys = hints && "propertyKeys" in hints ? hints.propertyKeys : void 0;
  const choices = Object.freeze({
    omitEmpty: !hints || !("omitEmpty" in hints) || hints.omitEmpty !== false,
    omitTrailing: !!hints && "omitTrailing" in hints && hints.omitTrailing === true,
    trim: !!hints && "trim" in hints && hints.trim === true,
    propertyKeys: (0, import_filter39.isArray)(propertyKeys) ? Object.freeze(propertyKeys.filter((key) => typeof key === "string")) : NO_KEYS
  });
  CHOICES.set(effective, choices);
  return choices;
};

// packages/canard/schema-form/src/core/behaviors/arrayBehavior/utils/projection/omitEmptyArray.ts
var omitEmptyArray = (value) => value.length === 0 ? void 0 : value;

// packages/canard/schema-form/src/core/behaviors/arrayBehavior/utils/projection/omitTrailingArray.ts
var TRIMMED = /* @__PURE__ */ new WeakMap();
var omitTrailingArray = (value, node) => {
  let end = value.length;
  while (end > 0) {
    const index = end - 1;
    if (!node) {
      if (value[index] != null) break;
    } else {
      const entry = getItemEntry(node.blueprintNode, index);
      if (!entry) {
        if (value[index] != null) break;
      } else {
        const child = node.structure?.[String(index)];
        const emission = child !== null && typeof child === "object" && "emit" in child ? child.emit : void 0;
        if (emission !== void 0 && !(emission === null && entry.node.kind !== "object" && entry.node.kind !== "array")) break;
      }
    }
    end--;
  }
  if (end === value.length) return value;
  const cached = TRIMMED.get(value);
  if (cached?.end === end && cached.result.every((item, index) => Object.is(item, value[index]))) return cached.result;
  const result = value.slice(0, end);
  TRIMMED.set(value, { end, result });
  return result;
};

// packages/canard/schema-form/src/core/behaviors/arrayBehavior/utils/projection/projectBranchArray.ts
var projectBranchArray = (node, local) => {
  if (node.raw !== void 0 && !(0, import_filter40.isArray)(node.raw)) return node.raw;
  if (!(0, import_filter40.isArray)(local)) return void 0;
  const choices = getStaticChoices(node.schema);
  const projected = choices.omitTrailing ? omitTrailingArray(local, node) : local;
  return choices.omitEmpty ? omitEmptyArray(projected) : projected;
};

// packages/canard/schema-form/src/core/behaviors/arrayBehavior/utils/value/assembleArray.ts
var import_filter42 = require("@winglet/common-utils/filter");

// packages/canard/schema-form/src/core/behaviors/arrayBehavior/utils/value/holeValue.ts
var import_filter41 = require("@winglet/common-utils/filter");
var holeValue = (kind, previous) => {
  if (kind === "array") return (0, import_filter41.isArray)(previous) && previous.length === 0 && !Object.isFrozen(previous) ? previous : [];
  if (kind === "object") {
    if (previous !== null && typeof previous === "object" && !(0, import_filter41.isArray)(previous) && !Object.isFrozen(previous)) {
      const prototype = Object.getPrototypeOf(previous);
      if ((prototype === Object.prototype || prototype === null) && Object.keys(previous).length === 0) return previous;
    }
    return {};
  }
  return null;
};

// packages/canard/schema-form/src/core/behaviors/arrayBehavior/utils/value/assembleArray.ts
var STABLE_SHAPES = /* @__PURE__ */ new WeakMap();
var assembleArray = (node, children, recalculated, hint) => {
  const previous = (0, import_filter42.isArray)(node.local) ? node.local : void 0;
  const stable = STABLE_SHAPES.get(node);
  if (recalculated && previous?.length === node.itemCount && stable?.children === children && stable.schema === node.schema && stable.extras === node.extras && stable.raw === node.raw && stable.itemCount === node.itemCount) {
    let patch;
    let valid = true;
    for (const child of recalculated) {
      if (child === null || typeof child !== "object" || !("name" in child) || typeof child.name !== "string" || !("emit" in child)) {
        valid = false;
        break;
      }
      const index = Number(child.name);
      if (!Number.isInteger(index) || index < 0 || index >= node.itemCount || node.structure?.[child.name] !== child) {
        valid = false;
        break;
      }
      const template = node.blueprintNode.prefixItems?.[index] ?? node.blueprintNode.item;
      if (!template) {
        valid = false;
        break;
      }
      const emission = child.emit;
      const value = emission === void 0 ? holeValue(template.kind, previous[index]) : emission;
      if (!Object.is(value, previous[index])) {
        if (!patch) patch = previous.slice();
        patch[index] = value;
      }
    }
    if (valid) {
      if (hint) hint.incremental = true;
      return patch ?? previous;
    }
  }
  const extras = (0, import_filter42.isArray)(node.extras) ? node.extras : [];
  const result = [];
  let tailStart = 0;
  for (let index = 0; index < node.itemCount; index++) {
    const template = node.blueprintNode.prefixItems?.[index] ?? node.blueprintNode.item;
    if (!template) {
      result.push(extras[index - tailStart]);
      continue;
    }
    tailStart++;
    const child = node.structure?.[String(index)];
    const emission = child !== null && typeof child === "object" && "emit" in child ? child.emit : void 0;
    result.push(emission === void 0 ? holeValue(template.kind, previous?.[index]) : emission);
  }
  STABLE_SHAPES.set(node, {
    children,
    schema: node.schema,
    extras: node.extras,
    raw: node.raw,
    itemCount: node.itemCount
  });
  if (previous?.length === result.length && result.every((value, index) => Object.is(value, previous[index]))) return previous;
  return result;
};

// packages/canard/schema-form/src/core/behaviors/arrayBehavior/branch/utils/declareArrayChildren.ts
var LAST = /* @__PURE__ */ new WeakMap();
var EMPTY = Object.freeze([]);
var declareArrayChildren = (node) => {
  const template = node.blueprintNode;
  const count = node.itemCount;
  const cached = LAST.get(template);
  if (cached?.count === count) return cached.result;
  const entries = [];
  for (let index = 0; index < count; index++) {
    const entry = getItemEntry(template, index);
    if (entry) entries.push(entry);
  }
  const result = entries.length === 0 ? EMPTY : Object.freeze(entries);
  LAST.set(template, { count, result });
  return result;
};

// packages/canard/schema-form/src/core/behaviors/arrayBehavior/branch/arrayBranchBehavior.ts
var arrayBranchBehavior = Object.freeze({
  interpret: interpretIdentity,
  assemble: assembleArray,
  project: projectBranchArray,
  finishInput: finishNoInput,
  declareChildren: declareArrayChildren,
  arrange: arrangeBranchArray,
  type: "array",
  strategy: "branch"
});

// packages/canard/schema-form/src/core/behaviors/utils/slots/assembleRaw.ts
var assembleRaw = (node) => node.raw;

// packages/canard/schema-form/src/core/behaviors/utils/slots/declareNoChildren.ts
var NO_CHILDREN = Object.freeze([]);
var declareNoChildren = () => NO_CHILDREN;

// packages/canard/schema-form/src/core/behaviors/arrayBehavior/utils/plan/arrangeTerminalArray.ts
var import_filter43 = require("@winglet/common-utils/filter");
var arrangeTerminalArray = (node, operation) => {
  const raw = node.raw;
  if (!(0, import_filter43.isArray)(raw) && raw !== void 0 && operation.kind !== "push")
    return { kind: "noop" };
  const source = (0, import_filter43.isArray)(raw) ? raw : [];
  const length = source.length;
  if (operation.kind === "push") return {
    kind: "raw",
    raw: [...source, operation.value],
    result: { source: "length" }
  };
  if (operation.kind === "clear") return length === 0 ? { kind: "noop" } : {
    kind: "raw",
    raw: [],
    result: { source: "void" }
  };
  if (operation.kind === "pop") return length === 0 ? { kind: "noop" } : {
    kind: "raw",
    raw: source.slice(0, -1),
    result: { source: "removed", index: length - 1 }
  };
  if (!isValidArrayIndex(operation.index, length)) return { kind: "noop" };
  const copy = source.slice();
  if (operation.kind === "remove") {
    copy.splice(operation.index, 1);
    return {
      kind: "raw",
      raw: copy,
      result: { source: "removed", index: operation.index }
    };
  }
  copy[operation.index] = operation.value;
  return {
    kind: "raw",
    raw: copy,
    result: { source: "updated", index: operation.index }
  };
};

// packages/canard/schema-form/src/core/behaviors/arrayBehavior/utils/projection/projectTerminalArray.ts
var import_filter44 = require("@winglet/common-utils/filter");
var projectTerminalArray = (node, local) => {
  if (node.raw !== void 0 && !(0, import_filter44.isArray)(node.raw)) return node.raw;
  if (!(0, import_filter44.isArray)(local)) return void 0;
  const choices = getStaticChoices(node.schema);
  const projected = choices.omitTrailing ? omitTrailingArray(local) : local;
  return choices.omitEmpty ? omitEmptyArray(projected) : projected;
};

// packages/canard/schema-form/src/core/behaviors/arrayBehavior/terminal/arrayTerminalBehavior.ts
var arrayTerminalBehavior = Object.freeze({
  interpret: interpretIdentity,
  assemble: assembleRaw,
  project: projectTerminalArray,
  finishInput: finishNoInput,
  declareChildren: declareNoChildren,
  arrange: arrangeTerminalArray,
  type: "array",
  strategy: "terminal"
});

// packages/canard/schema-form/src/core/behaviors/arrayBehavior/arrayBehavior.ts
var arrayBehavior = Object.freeze({ branch: arrayBranchBehavior, terminal: arrayTerminalBehavior });

// packages/canard/schema-form/src/core/behaviors/utils/parse/utils/number/parseNumber.ts
var JSON_NUMBER = /^-?(0|[1-9]\d*)(\.\d+)?([eE][+-]?\d+)?$/;
var parseNumber = (value) => {
  const text = value.trim();
  if (!JSON_NUMBER.test(text)) return void 0;
  const parsed = Number(text);
  if (!Number.isFinite(parsed)) return void 0;
  if (!/[.eE]/.test(text) && !Number.isSafeInteger(parsed)) return void 0;
  return parsed;
};

// packages/canard/schema-form/src/core/behaviors/utils/parse/convert.ts
var convert = (value, kind) => {
  switch (kind) {
    case "number":
    case "integer": {
      if (typeof value !== "string") return value;
      const parsed = parseNumber(value);
      return parsed !== void 0 && (kind === "number" || Number.isSafeInteger(parsed)) ? parsed : value;
    }
    case "string":
      return typeof value === "number" && Number.isFinite(value) || typeof value === "boolean" ? String(value) : value;
    case "boolean":
      if (value === "true" || value === 1) return true;
      if (value === "false" || value === 0) return false;
      return value;
    default:
      return value;
  }
};

// packages/canard/schema-form/src/core/behaviors/utils/parse/isMember.ts
var import_filter45 = require("@winglet/common-utils/filter");
var isMember = (value, kind) => {
  switch (kind) {
    case "string":
      return typeof value === "string";
    case "number":
      return typeof value === "number" && Number.isFinite(value);
    case "integer":
      return typeof value === "number" && Number.isInteger(value);
    case "boolean":
      return typeof value === "boolean";
    case "object":
    case "array":
      try {
        const array = (0, import_filter45.isArray)(value);
        return kind === "array" ? array : value !== null && typeof value === "object" && !array;
      } catch {
        return false;
      }
  }
};

// packages/canard/schema-form/src/core/behaviors/utils/parse/interpret.ts
var interpret = (value, spec) => {
  if (value === void 0 || value === null) return value;
  const kinds = spec.kinds;
  if (typeof kinds === "string") {
    if (isMember(value, kinds)) return value;
    const converted = convert(value, kinds);
    return isMember(converted, kinds) ? converted : value;
  }
  for (const kind of kinds) if (isMember(value, kind)) return value;
  let candidate;
  let found = false;
  for (const kind of kinds) {
    const converted = convert(value, kind);
    if (!isMember(converted, kind)) continue;
    if (!found) {
      candidate = converted;
      found = true;
    } else if (candidate !== converted) return value;
  }
  return found ? candidate : value;
};

// packages/canard/schema-form/src/core/behaviors/utils/slots/projectIdentity.ts
var projectIdentity = (_node, local) => local;

// packages/canard/schema-form/src/core/behaviors/utils/slots/rejectArrayOperation.ts
var rejectArrayOperation = (node, operation) => {
  throw new SchemaFormError(
    ARRAY_METHOD_ON_NON_ARRAY,
    `Cannot ${operation.kind} non-array node at ${node.path}`,
    { path: node.path, method: operation.kind }
  );
};

// packages/canard/schema-form/src/core/behaviors/booleanBehavior/booleanBehavior.ts
var booleanBehavior = Object.freeze({
  interpret,
  assemble: assembleRaw,
  project: projectIdentity,
  finishInput: finishNoInput,
  declareChildren: declareNoChildren,
  arrange: rejectArrayOperation,
  type: "boolean",
  strategy: "terminal"
});

// packages/canard/schema-form/src/core/behaviors/nullBehavior/nullBehavior.ts
var nullBehavior = Object.freeze({
  interpret: interpretIdentity,
  assemble: assembleRaw,
  project: projectIdentity,
  finishInput: finishNoInput,
  declareChildren: declareNoChildren,
  arrange: rejectArrayOperation,
  type: "null",
  strategy: "terminal"
});

// packages/canard/schema-form/src/core/behaviors/numberBehavior/numberBehavior.ts
var numberBehavior = Object.freeze({
  interpret,
  assemble: assembleRaw,
  project: projectIdentity,
  finishInput: finishNoInput,
  declareChildren: declareNoChildren,
  arrange: rejectArrayOperation,
  type: "number",
  strategy: "terminal"
});

// packages/canard/schema-form/src/core/behaviors/utils/slots/declareBlueprintChildren.ts
var declareBlueprintChildren = (node) => node.blueprintNode.childEntries;

// packages/canard/schema-form/src/core/behaviors/objectBehavior/utils/projectObject.ts
var import_filter47 = require("@winglet/common-utils/filter");

// packages/canard/schema-form/src/core/behaviors/objectBehavior/utils/omitEmptyObject.ts
var import_filter46 = require("@winglet/common-utils/filter");

// packages/canard/schema-form/src/core/behaviors/objectBehavior/utils/objectKeyCounts.ts
var objectKeyCounts = /* @__PURE__ */ new WeakMap();

// packages/canard/schema-form/src/core/behaviors/objectBehavior/utils/omitEmptyObject.ts
var omitEmptyObject = (value) => {
  const count = value !== null && typeof value === "object" ? objectKeyCounts.get(value) : void 0;
  return (count === void 0 ? (0, import_filter46.isEmptyObject)(value) : count === 0) ? void 0 : value;
};

// packages/canard/schema-form/src/core/behaviors/objectBehavior/utils/projectObject.ts
var projectObject = (node, local) => {
  if (node.raw !== void 0 && (node.raw === null || typeof node.raw !== "object" || (0, import_filter47.isArray)(node.raw))) return node.raw;
  return getStaticChoices(node.schema).omitEmpty ? omitEmptyObject(local) : local;
};

// packages/canard/schema-form/src/core/behaviors/objectBehavior/branch/utils/assembleObject.ts
var import_filter48 = require("@winglet/common-utils/filter");
var import_lib14 = require("@winglet/common-utils/lib");

// packages/canard/schema-form/src/core/behaviors/objectBehavior/utils/keys/writeObjectKey.ts
var writeObjectKey = (target, name, value) => {
  if (name === "__proto__")
    Object.defineProperty(target, name, {
      value,
      enumerable: true,
      configurable: true,
      writable: true
    });
  else target[name] = value;
};

// packages/canard/schema-form/src/core/behaviors/objectBehavior/branch/utils/assembleObject.ts
var STABLE_SHAPES2 = /* @__PURE__ */ new WeakMap();
var assembleObject = (node, children, recalculated, hint) => {
  const previous = node.local;
  const stable = STABLE_SHAPES2.get(node);
  if (recalculated && hint && stable?.children === children && stable.schema === node.schema && stable.extras === node.extras && previous !== null && typeof previous === "object" && objectKeyCounts.get(previous) === stable.names.length) {
    let patch;
    let sameKeys = true;
    for (const child of recalculated) {
      if (child === null || typeof child !== "object" || !("name" in child) || typeof child.name !== "string" || !("emit" in child)) {
        sameKeys = false;
        break;
      }
      const oldHasKey = (0, import_lib14.hasOwnProperty)(previous, child.name);
      if (child.emit === void 0 === oldHasKey) {
        sameKeys = false;
        break;
      }
      if (oldHasKey && !Object.is(child.emit, Reflect.get(previous, child.name))) {
        if (!patch) patch = { ...previous };
        writeObjectKey(patch, child.name, child.emit);
      }
    }
    if (sameKeys) {
      hint.incremental = true;
      if (patch) objectKeyCounts.set(patch, stable.names.length);
      return patch ?? previous;
    }
  }
  if (stable?.children === children && stable.schema === node.schema && stable.extras === void 0 && node.extras === void 0 && previous !== null && typeof previous === "object" && !(0, import_filter48.isArray)(previous)) {
    let patch;
    let sameKeys = true;
    const oldNames = Object.keys(previous);
    if (oldNames.length !== stable.names.length) sameKeys = false;
    else for (let index = 0; index < oldNames.length; index++)
      if (oldNames[index] !== stable.names[index]) {
        sameKeys = false;
        break;
      }
    if (sameKeys) {
      for (const child of children) {
        if (child === null || typeof child !== "object" || !("name" in child) || typeof child.name !== "string" || !("emit" in child)) {
          sameKeys = false;
          break;
        }
        const oldHasKey = (0, import_lib14.hasOwnProperty)(previous, child.name);
        if (child.emit === void 0 === oldHasKey) {
          sameKeys = false;
          break;
        }
        if (oldHasKey && !Object.is(child.emit, Reflect.get(previous, child.name))) {
          if (!patch) patch = { ...previous };
          writeObjectKey(patch, child.name, child.emit);
        }
      }
    }
    if (sameKeys) {
      objectKeyCounts.set(patch ?? previous, stable.names.length);
      return patch ?? previous;
    }
  }
  const childValues = /* @__PURE__ */ new Map();
  for (const child of children)
    if (child !== null && typeof child === "object" && "name" in child && typeof child.name === "string" && "emit" in child)
      childValues.set(child.name, child.emit);
  const extra = node.extras;
  const extras = extra !== null && typeof extra === "object" && !(0, import_filter48.isArray)(extra) ? extra : void 0;
  const names = [];
  const seen = /* @__PURE__ */ new Set();
  const preferred = getStaticChoices(node.schema).propertyKeys;
  for (const name of preferred) {
    if (childValues.has(name)) {
      if (childValues.get(name) !== void 0 && !seen.has(name)) {
        names.push(name);
        seen.add(name);
      }
    } else if (extras && (0, import_lib14.hasOwnProperty)(extras, name) && !seen.has(name)) {
      names.push(name);
      seen.add(name);
    }
  }
  for (const entry of node.blueprintNode.childEntries) {
    const name = entry.name;
    if (childValues.has(name) && childValues.get(name) !== void 0 && !seen.has(name)) {
      names.push(name);
      seen.add(name);
    }
  }
  if (extras) {
    for (const name of Object.keys(extras))
      if (!childValues.has(name) && !seen.has(name)) {
        names.push(name);
        seen.add(name);
      }
  }
  if (previous !== null && typeof previous === "object" && !(0, import_filter48.isArray)(previous)) {
    const oldNames = Object.keys(previous);
    if (names.length === oldNames.length && names.every((name, index) => name === oldNames[index])) {
      let patch;
      for (const name of names) {
        const value = childValues.has(name) ? childValues.get(name) : extras ? Reflect.get(extras, name) : void 0;
        if (!Object.is(value, Reflect.get(previous, name))) {
          if (!patch) patch = { ...previous };
          writeObjectKey(patch, name, value);
        }
      }
      STABLE_SHAPES2.set(node, {
        children,
        schema: node.schema,
        extras: node.extras,
        names
      });
      objectKeyCounts.set(patch ?? previous, names.length);
      return patch ?? previous;
    }
  }
  const result = {};
  for (const name of names)
    writeObjectKey(result, name, childValues.has(name) ? childValues.get(name) : extras ? Reflect.get(extras, name) : void 0);
  STABLE_SHAPES2.set(node, {
    children,
    schema: node.schema,
    extras: node.extras,
    names
  });
  objectKeyCounts.set(result, names.length);
  return result;
};

// packages/canard/schema-form/src/core/behaviors/objectBehavior/branch/objectBranchBehavior.ts
var objectBranchBehavior = Object.freeze({
  interpret: interpretIdentity,
  assemble: assembleObject,
  project: projectObject,
  finishInput: finishNoInput,
  declareChildren: declareBlueprintChildren,
  arrange: rejectArrayOperation,
  type: "object",
  strategy: "branch"
});

// packages/canard/schema-form/src/core/behaviors/objectBehavior/terminal/objectTerminalBehavior.ts
var objectTerminalBehavior = Object.freeze({
  interpret: interpretIdentity,
  assemble: assembleRaw,
  project: projectObject,
  finishInput: finishNoInput,
  declareChildren: declareNoChildren,
  arrange: rejectArrayOperation,
  type: "object",
  strategy: "terminal"
});

// packages/canard/schema-form/src/core/behaviors/objectBehavior/objectBehavior.ts
var objectBehavior = Object.freeze({
  branch: objectBranchBehavior,
  terminal: objectTerminalBehavior
});

// packages/canard/schema-form/src/core/behaviors/utils/slots/finishStringInput.ts
var finishStringInput = (node) => {
  if (!getStaticChoices(node.schema).trim || typeof node.raw !== "string")
    return void 0;
  const trimmed = node.raw.trim();
  return trimmed === node.raw ? void 0 : trimmed;
};

// packages/canard/schema-form/src/core/behaviors/utils/slots/projectEmpty.ts
var import_filter49 = require("@winglet/common-utils/filter");
var projectEmpty = (node, local) => {
  if (!getStaticChoices(node.schema).omitEmpty) return local;
  if (local === "" || (0, import_filter49.isArray)(local) && local.length === 0 || local !== null && typeof local === "object" && !(0, import_filter49.isArray)(local) && (0, import_filter49.isEmptyObject)(local)) return void 0;
  return local;
};

// packages/canard/schema-form/src/core/behaviors/stringBehavior/stringBehavior.ts
var stringBehavior = Object.freeze({
  interpret,
  assemble: assembleRaw,
  project: projectEmpty,
  finishInput: finishStringInput,
  declareChildren: declareNoChildren,
  arrange: rejectArrayOperation,
  type: "string",
  strategy: "terminal"
});

// packages/canard/schema-form/src/core/behaviors/unionBehavior/unionBehavior.ts
var unionBehavior = Object.freeze({
  interpret,
  assemble: assembleRaw,
  project: projectEmpty,
  finishInput: finishStringInput,
  declareChildren: declareNoChildren,
  arrange: rejectArrayOperation,
  type: "union",
  strategy: "terminal"
});

// packages/canard/schema-form/src/core/behaviors/virtualBehavior/utils/tuple/assembleVirtualTuple.ts
var import_filter50 = require("@winglet/common-utils/filter");

// packages/canard/schema-form/src/core/behaviors/virtualBehavior/utils/tuple/readVirtualValue.ts
var readVirtualValue = (child) => child !== null && typeof child === "object" && "value" in child ? child.value : void 0;

// packages/canard/schema-form/src/core/behaviors/virtualBehavior/utils/tuple/assembleVirtualTuple.ts
var assembleVirtualTuple = (node, children) => {
  const previous = node.local;
  if ((0, import_filter50.isArray)(previous) && previous.length === children.length) {
    let unchanged = true;
    for (let index = 0; index < children.length; index++)
      if (previous[index] !== readVirtualValue(children[index])) {
        unchanged = false;
        break;
      }
    if (unchanged) return previous;
  }
  const values = [];
  for (const child of children) values.push(readVirtualValue(child));
  return values;
};

// packages/canard/schema-form/src/core/behaviors/virtualBehavior/utils/value/projectNoEmit.ts
var projectNoEmit = () => void 0;

// packages/canard/schema-form/src/core/behaviors/virtualBehavior/virtualBehavior.ts
var virtualBehavior = Object.freeze({
  interpret: interpretIdentity,
  assemble: assembleVirtualTuple,
  project: projectNoEmit,
  finishInput: finishNoInput,
  declareChildren: declareBlueprintChildren,
  arrange: rejectArrayOperation,
  type: "virtual",
  strategy: "branch"
});

// packages/canard/schema-form/src/core/behaviors/behaviors.ts
var BEHAVIORS = Object.freeze({
  string: Object.freeze({ terminal: stringBehavior }),
  number: Object.freeze({ terminal: numberBehavior }),
  boolean: Object.freeze({ terminal: booleanBehavior }),
  null: Object.freeze({ terminal: nullBehavior }),
  union: Object.freeze({ terminal: unionBehavior }),
  virtual: Object.freeze({ branch: virtualBehavior }),
  object: objectBehavior,
  array: arrayBehavior
});

// packages/canard/schema-form/src/core/behaviors/utils/options/isOmittedEmpty.ts
var import_filter51 = require("@winglet/common-utils/filter");
var isOmittedEmpty = (template, value) => {
  if (!getStaticChoices(mergeEffectiveSchema(
    template,
    [],
    { mode: "runtime" }
  )).omitEmpty) return false;
  if (value === "") return true;
  if ((0, import_filter51.isArray)(value)) return value.length === 0;
  if (value === null || typeof value !== "object") return false;
  const prototype = Object.getPrototypeOf(value);
  return (prototype === Object.prototype || prototype === null) && Object.keys(value).length === 0;
};

// packages/canard/schema-form/src/core/settle/utils/latent/distributeLatentValue.ts
var distributeLatentValue = (runtime, context, path, template, value, order, whole, siblings, automatic = false, seen = /* @__PURE__ */ new WeakSet()) => {
  if (template.kind === "virtual") return false;
  const key = JSON.stringify([path, template.kind]);
  const log = context?.inTransition ? context.latentAutomaticLog : void 0;
  const name = (0, import_pointer14.unescapeSegment)(path.slice(path.lastIndexOf("/") + 1));
  const clearOtherKinds = () => {
    for (const entry of siblings)
      if (entry.name === name && entry.node.kind !== template.kind)
        setLatentRaw(
          runtime,
          log,
          JSON.stringify([path, entry.node.kind]),
          false,
          void 0,
          void 0,
          void 0,
          context
        );
  };
  if (template.strategy === "terminal") {
    const row = BEHAVIORS[template.kind]?.[template.strategy];
    const interpreted = row ? row.interpret(
      value,
      staticSpec(template.schemaType, template.nullable)
    ) : value;
    setLatentRaw(
      runtime,
      log,
      key,
      interpreted !== void 0,
      interpreted,
      template,
      order,
      context
    );
    clearOtherKinds();
    return interpreted !== void 0 && !isOmittedEmpty(template, interpreted);
  }
  if (!isPlain(value)) {
    pruneLatentRaw(runtime, path, void 0, context);
    setLatentRaw(
      runtime,
      log,
      key,
      value !== void 0,
      value === void 0 ? void 0 : new HostLatent(value, void 0),
      template,
      order,
      context
    );
    clearOtherKinds();
    return false;
  }
  if (seen.has(value)) return false;
  seen.add(value);
  if (whole) pruneLatentRaw(runtime, path, void 0, context);
  const prior = runtime.latentRaw.get(key);
  const previous = prior instanceof HostLatent ? prior : void 0;
  const declared = getDeclaredChildNames(template);
  const extras = nextExtras(
    whole ? void 0 : previous?.extras,
    value,
    declared,
    !whole
  );
  let wrote = false;
  const names = Object.keys(value);
  for (const name2 of names) {
    const index = template.childEntries.findIndex((entry2) => entry2.name === name2);
    if (index < 0) continue;
    const entry = template.childEntries[index];
    if (distributeLatentValue(
      runtime,
      context,
      `${path}/${(0, import_pointer14.escapeSegment)(name2)}`,
      entry.node,
      Reflect.get(value, name2),
      [...order, index],
      whole,
      template.childEntries,
      automatic,
      seen
    ))
      wrote = true;
  }
  const raw = whole || wrote && !automatic ? void 0 : previous?.raw;
  const host = raw === void 0 && extras === void 0 ? void 0 : previous && Object.is(previous.raw, raw) && Object.is(previous.extras, extras) ? previous : new HostLatent(raw, extras);
  setLatentRaw(runtime, log, key, host !== void 0, host, template, order, context);
  clearOtherKinds();
  seen.delete(value);
  return wrote;
};

// packages/canard/schema-form/src/core/settle/utils/compute/selectChildren.ts
var NO_ACTIVE_IDS = Object.freeze([]);
var STATIC_IDS = /* @__PURE__ */ new WeakMap();
var STATIC_SHAPES = /* @__PURE__ */ new WeakMap();
var staticIds = (entry) => {
  let ids = STATIC_IDS.get(entry);
  if (!ids) {
    const collected = [];
    for (let index = 0; index < entry.declarations.length; index++)
      collected.push(entry.declarations[index].id);
    ids = Object.freeze(collected);
    STATIC_IDS.set(entry, ids);
  }
  return ids;
};
var staticShape = (host, isAtomic) => {
  if (STATIC_SHAPES.has(host)) return STATIC_SHAPES.get(host);
  const selected = /* @__PURE__ */ Object.create(null);
  for (let index = 0; index < host.childEntries.length; index++) {
    const entry = host.childEntries[index];
    const schema = mergeEffectiveSchema(entry.node, NO_ACTIVE_IDS, { mode: "runtime", isAtomic });
    let hasGate = false;
    for (let declarationIndex = 0; declarationIndex < entry.declarations.length; declarationIndex++)
      if (entry.declarations[declarationIndex].gates.length > 0) {
        hasGate = true;
        break;
      }
    if ((0, import_lib15.hasOwnProperty)(selected, entry.name) || entry.node.kind === "virtual" || !entry.declarations.length || schema.typeConflict || hasGate) {
      STATIC_SHAPES.set(host, null);
      return null;
    }
    selected[entry.name] = { entry, ids: staticIds(entry), schema };
  }
  const shape = Object.values(selected);
  STATIC_SHAPES.set(host, shape);
  return shape;
};
var selectChildren = (node, context, prior, computeChild, immediate) => {
  if (!context.hasGates && node.behavior.type === "object") {
    const shape = staticShape(node.blueprintNode, node.runtime.blueprint?.isAtomic);
    const children = node.children;
    let matches = !!shape && !!children && children.length === shape.length;
    if (matches && shape && children)
      for (let index = 0; index < shape.length; index++) {
        const { entry, schema } = shape[index];
        const child = children[index];
        if (child.name !== entry.name || child.blueprintNode !== entry.node || child.schema !== schema || !child.active || child.detached || node.structure?.[entry.name] !== child) {
          matches = false;
          break;
        }
      }
    if (matches && shape && children) {
      for (let index = 0; index < shape.length; index++) {
        const child = children[index];
        if (context.selectedDeclarationIds.get(child) !== shape[index].ids)
          context.selectedDeclarationIds.set(child, shape[index].ids);
        if (context.dirtyPaths.has(child.path)) computeChild(child);
      }
      return false;
    }
  }
  if (node.behavior.type === "virtual") {
    const before2 = node.children ?? [];
    const next2 = /* @__PURE__ */ Object.create(null);
    const children = [];
    const fields = node.blueprintNode.fields;
    for (let index = 0; fields && index < fields.length; index++) {
      const field = fields[index];
      const sibling = node.parent?.structure?.[field];
      if (!sibling) continue;
      next2[field] = sibling;
      children.push(sibling);
    }
    let changed2 = children.length !== before2.length;
    for (let index = 0; !changed2 && index < children.length; index++)
      if (children[index] !== before2[index]) changed2 = true;
    node.structure = next2;
    node.children = captureSchemaNodeChange(node, "children", changed2 ? children : before2);
    if (changed2) context.changedNodes.add(node);
    return changed2;
  }
  const before = node.children ?? [];
  const next = { ...node.structure };
  Object.setPrototypeOf(next, null);
  if (node.behavior.type === "array") {
    const names = Object.keys(next);
    for (let index = 0; index < names.length; index++) {
      const name = names[index];
      if (Number(name) >= node.itemCount) delete next[name];
    }
  }
  node.structure = next;
  const seen = /* @__PURE__ */ new Set();
  const inactiveEntries = [];
  let changed = false;
  const entries = node.behavior.declareChildren(node);
  for (let entryIndex = 0; entryIndex < entries.length; entryIndex++) {
    const entry = entries[entryIndex];
    if (immediate) flushPendingGateReads(
      entry.node,
      `${node.path}/${(0, import_pointer15.escapeSegment)(entry.name)}`,
      context
    );
    let threw = false;
    let declarations = entry.declarations;
    let activeIds;
    if (context.hasGates) {
      const active = [];
      activeIds = [];
      for (let index = 0; index < entry.declarations.length; index++) {
        const declaration = entry.declarations[index];
        const version = context.gateThrowVersion;
        let admitted = true;
        for (let gateIndex = 0; gateIndex < declaration.gates.length; gateIndex++) {
          const gate = declaration.gates[gateIndex];
          if (!evaluateGate(
            gate,
            context,
            node,
            gate.schemaPath === `${declaration.schemaPath}/controls/active` ? entry.name : void 0
          )) {
            admitted = false;
            break;
          }
        }
        if (admitted) {
          active.push(declaration);
          activeIds.push(declaration.id);
        } else if (context.gateThrowVersion !== version) threw = true;
      }
      declarations = active;
    }
    if (declarations.length === 0) {
      const priorChild2 = (0, import_lib15.hasOwnProperty)(prior, entry.name) ? prior[entry.name] : void 0;
      const exiting = priorChild2?.blueprintNode.kind === entry.node.kind ? priorChild2 : context.pendingExits.get(JSON.stringify([
        `${node.path}/${(0, import_pointer15.escapeSegment)(entry.name)}`,
        entry.node.kind
      ]));
      if (exiting) {
        if (threw) (context.throwingGateExits ??= /* @__PURE__ */ new Set()).add(exiting);
        else context.throwingGateExits?.delete(exiting);
      }
      if (context.distributedInputs.has(node) || next[entry.name]) inactiveEntries.push(entry);
      if (next[entry.name] && !seen.has(entry.name) && next[entry.name].blueprintNode.kind === entry.node.kind) {
        delete next[entry.name];
        changed = true;
        if (immediate) {
          (context.pendingOutputs ??= /* @__PURE__ */ new Set()).add(node);
        }
      }
      continue;
    }
    const retained = (0, import_lib15.hasOwnProperty)(prior, entry.name) ? prior[entry.name] : void 0;
    if (retained?.blueprintNode.kind === entry.node.kind)
      context.throwingGateExits?.delete(retained);
    if (seen.has(entry.name)) {
      if (next[entry.name]?.blueprintNode.kind !== entry.node.kind) {
        recordSettlementFailure(context, new SchemaFormError(
          SHARED_NODE_CONFLICT,
          `Active declarations conflict at ${node.path}/${entry.name}`,
          { path: `${node.path}/${entry.name}` }
        ), "sharedConflict");
      }
      continue;
    }
    seen.add(entry.name);
    const priorChild = (0, import_lib15.hasOwnProperty)(prior, entry.name) && prior[entry.name].blueprintNode.kind === entry.node.kind ? prior[entry.name] : void 0;
    const currentChild = next[entry.name]?.blueprintNode.kind === entry.node.kind ? next[entry.name] : void 0;
    const distribution = context.distributedInputs.get(node);
    const ownsInput = distribution && hasDistributedChildInput(
      distribution.input,
      entry.name,
      node.behavior.type === "array"
    );
    const latent = context.root.runtime.latentRaw;
    const latentKey = latent.size > 0 && !priorChild ? JSON.stringify([
      `${node.path}/${(0, import_pointer15.escapeSegment)(entry.name)}`,
      entry.node.kind
    ]) : void 0;
    const input = ownsInput ? Reflect.get(distribution.input, entry.name) : distribution?.whole ? void 0 : latentKey !== void 0 && latent.has(latentKey) ? latent.get(latentKey) : void 0;
    if (!priorChild && !currentChild && hasRecursiveExpansion(node, entry.node, input, context)) {
      if (!context.exceededBudget) {
        recordSettlementFailure(context, new SchemaFormError(
          RECURSIVE_SHAPE_DIVERGED,
          `Recursive shape diverged at ${node.path}/${entry.name}`,
          { path: `${node.path}/${entry.name}` }
        ), "budget");
        context.exceededBudget = "recursion";
      }
      continue;
    }
    const key = context.pendingExits.size > 0 ? JSON.stringify([
      `${node.path}/${(0, import_pointer15.escapeSegment)(entry.name)}`,
      entry.node.kind
    ]) : void 0;
    const pending = key === void 0 ? void 0 : context.pendingExits.get(key);
    const child = currentChild ?? priorChild ?? pending ?? createChildNode(node, entry);
    context.perished.delete(child);
    if (key !== void 0) context.pendingExits.delete(key);
    if (pending && child === pending) {
      context.revived.add(child);
      indexEnteredLatentKey(context, child);
    }
    if (context.hasGates) getGateRegistry(child.runtime).register(child);
    let entryChanged = false;
    if (!priorChild && !currentChild && !pending) {
      context.entered.add(child);
      indexEnteredLatentKey(context, child);
      if (child.behavior.type === "virtual") context.dirtyPaths.add(child.path);
      else enterSchemaNode(node, child, entry.name, context);
      if (child.behavior.strategy === "branch")
        context.shapeDirtyPaths.add(child.path);
      changed = true;
      entryChanged = true;
    }
    const ids = activeIds ?? staticIds(entry);
    if (context.selectedDeclarationIds.get(child) !== ids)
      context.selectedDeclarationIds.set(child, ids);
    const effective = mergeEffectiveSchema(
      child.blueprintNode,
      context.hasGates ? ids : NO_ACTIVE_IDS,
      { mode: "runtime", isAtomic: node.runtime.blueprint?.isAtomic }
    );
    if (child.schema !== effective) {
      if (!context.originalSchemas.has(child.path))
        context.originalSchemas.set(child.path, child.schema);
      child.schema = captureSchemaNodeChange(child, "schema", effective);
      context.dirtyPaths.add(child.path);
      if (child.behavior.strategy === "branch")
        context.shapeDirtyPaths.add(child.path);
      context.changedNodes.add(child);
      changed = true;
      entryChanged = true;
    }
    if (effective.typeConflict || hasSharedConflict(entry, declarations)) {
      recordSettlementFailure(context, new SchemaFormError(
        SHARED_NODE_CONFLICT,
        `Active declarations conflict at ${child.path}`,
        { path: child.path }
      ), "sharedConflict");
    }
    child.active = captureSchemaNodeChange(child, "active", true);
    child.detached = false;
    if (next[entry.name] !== child) {
      changed = true;
      entryChanged = true;
    }
    next[entry.name] = child;
    if (child.behavior.type === "virtual") {
      context.dirtyPaths.add(child.path);
      context.shapeDirtyPaths.add(child.path);
    }
    if (context.dirtyPaths.has(child.path)) {
      computeChild(child);
      entryChanged = true;
    }
    if (immediate && entryChanged) {
      (context.pendingOutputs ??= /* @__PURE__ */ new Set()).add(node);
    }
  }
  flushPendingOutput(node, context);
  for (let index = 0; index < inactiveEntries.length; index++) {
    const entry = inactiveEntries[index];
    if (next[entry.name] || seen.has(entry.name) || context.kind !== "load" && (0, import_lib15.hasOwnProperty)(prior, entry.name)) continue;
    seen.add(entry.name);
    const distribution = context.distributedInputs.get(node);
    if (!distribution || !hasDistributedChildInput(
      distribution.input,
      entry.name,
      node.behavior.type === "array"
    )) continue;
    distributeLatentValue(
      node.runtime,
      context,
      `${node.path}/${(0, import_pointer15.escapeSegment)(entry.name)}`,
      entry.node,
      Reflect.get(distribution.input, entry.name),
      getLatentOrder(node, entry.name, entry.node),
      distribution.whole,
      node.blueprintNode.childEntries,
      distribution.automatic
    );
  }
  const priorNames = Object.keys(prior);
  for (let index = 0; index < priorNames.length; index++) {
    const name = priorNames[index];
    const child = prior[name];
    if (next[name] !== child) {
      if (node.behavior.type === "array" && Number(name) >= node.itemCount)
        context.perished.add(child);
      else {
        const key = JSON.stringify([child.path, child.blueprintNode.kind]);
        context.pendingExits.set(key, child);
      }
    }
  }
  const nextChildren = Object.values(next);
  if (nextChildren.length !== before.length) changed = true;
  for (let index = 0; !changed && index < nextChildren.length; index++)
    if (nextChildren[index] !== before[index]) changed = true;
  node.children = captureSchemaNodeChange(node, "children", nextChildren);
  if (changed) context.changedNodes.add(node);
  return changed;
};

// packages/canard/schema-form/src/core/settle/utils/compute/selectNodeSchema.ts
var selectNodeSchema = (node, context) => {
  const active = node.blueprintNode.declarations.filter((declaration) => declaration.gates.every((gate) => evaluateGate(gate, context, node)));
  if (node.runtime.errorReporter?.hasConsumer()) {
    const branches = /* @__PURE__ */ new Map();
    for (const declaration of active) {
      const match = /^(.*\/oneOf)\/(\d+)(?:\/|$)/.exec(declaration.schemaPath);
      if (!match || !declaration.gates.some((gate) => gate.schemaPath.startsWith(`${match[1]}/${match[2]}/`))) continue;
      const branch = Number(match[2]);
      const selected = branches.get(match[1]) ?? [];
      if (!selected.includes(branch)) selected.push(branch);
      branches.set(match[1], selected);
    }
    for (const [schemaPath, selected] of branches) {
      if (selected.length < 2) continue;
      const code = `SCHEMA_FORM_WARNING.${MULTIPLE_GATED_BRANCHES_ACTIVE}`;
      const key = JSON.stringify([code, node.path, schemaPath]);
      if (node.runtime.warningKeys?.has(key)) continue;
      (node.runtime.warningKeys ??= /* @__PURE__ */ new Set()).add(key);
      const record = {
        level: "warning",
        code,
        path: node.path,
        schemaPath,
        message: `Multiple gated oneOf branches are active at ${schemaPath}`,
        details: { branches: selected }
      };
      indexSchemaNodeWarning(node.runtime, key, node.path, record);
      node.runtime.chainOccurrences?.push({ kind: "record", record });
    }
  }
  context.selectedDeclarationIds.set(node, active.map((declaration) => declaration.id));
  const effective = mergeEffectiveSchema(
    node.blueprintNode,
    active.map((declaration) => declaration.id),
    { mode: "runtime", isAtomic: node.runtime.blueprint?.isAtomic }
  );
  if (effective.typeConflict) {
    recordSettlementFailure(context, new SchemaFormError(
      SHARED_NODE_CONFLICT,
      `Active declarations conflict at ${node.path}`,
      { path: node.path }
    ), "sharedConflict");
  }
  if (node.parent === null)
    node.active = captureSchemaNodeChange(node, "active", active.some((declaration) => declaration.role === "declaration"));
  if (node.schema === effective) return false;
  node.schema = captureSchemaNodeChange(node, "schema", effective);
  context.changedNodes.add(node);
  return true;
};

// packages/canard/schema-form/src/core/settle/utils/compute/relocatedGates.ts
var relocatedGates = (node) => getGateRegistry(node.runtime).relocated(node.path);

// packages/canard/schema-form/src/core/settle/utils/compute/scheduleRelocatedGates.ts
var scheduleRelocatedGates = (gates, context) => {
  for (const gate of gates) {
    let path = gate.hostPath;
    while (path !== gate.evaluationHostPath) {
      context.dirtyPaths.add(path);
      path = path.slice(0, path.lastIndexOf("/"));
    }
    context.dirtyPaths.add(gate.evaluationHostPath);
  }
};

// packages/canard/schema-form/src/core/settle/utils/gates/getGateBudgetCap.ts
var INDICES2 = /* @__PURE__ */ new WeakMap();
var HOST_CAPS = /* @__PURE__ */ new WeakMap();
var getIndex = (blueprint2) => {
  const cached = INDICES2.get(blueprint2);
  if (cached) return cached;
  const decisionsByGate = /* @__PURE__ */ new Map();
  const decisions = /* @__PURE__ */ new Set();
  const add = (gate, key) => {
    let keys = decisionsByGate.get(gate);
    if (!keys) {
      keys = /* @__PURE__ */ new Set();
      decisionsByGate.set(gate, keys);
    }
    keys.add(key);
    decisions.add(key);
  };
  const collect = (declaration) => {
    if (declaration.scope === "fragment" && declaration.gates.length > 0)
      for (const gate of declaration.gates)
        add(gate, `fragment:${declaration.fragmentId}`);
    for (const gate of declaration.gates) {
      if (gate.kind !== "active") continue;
      if (gate.schemaPath.includes("/controls/children/") && gate.schemaPath.endsWith("/controls/active"))
        add(gate, `node:${gate.schemaPath}`);
      else if (declaration.scope === "node" && gate.schemaPath === `${declaration.schemaPath}/controls/active`)
        add(gate, `node:${gate.schemaPath}`);
    }
  };
  for (const node of blueprint2.nodes) {
    for (const declaration of node.declarations) collect(declaration);
    for (const entry of node.childEntries)
      for (const declaration of entry.declarations) collect(declaration);
  }
  const index = { decisionsByGate, transitionCap: decisions.size + 1 };
  INDICES2.set(blueprint2, index);
  return index;
};
var getTransitionBudgetCap = (blueprint2) => blueprint2.capabilities.branchless ? 1 : getIndex(blueprint2).transitionCap;
var getHostWheelBudgetCap = (host, blueprint2, gates) => {
  if (blueprint2.capabilities.branchless) return 1;
  const cached = HOST_CAPS.get(host);
  if (cached && cached.gates.length === gates.length && cached.gates.every((gate, index2) => gate === gates[index2])) return cached.cap;
  const index = getIndex(blueprint2);
  const decisions = /* @__PURE__ */ new Set();
  for (const gate of gates)
    for (const key of index.decisionsByGate.get(gate) ?? []) decisions.add(key);
  const cap = decisions.size + 1;
  HOST_CAPS.set(host, { gates: [...gates], cap });
  return cap;
};

// packages/canard/schema-form/src/core/settle/utils/compute/utils/hasIndependentLeafDefaults.ts
var INDEPENDENT = /* @__PURE__ */ new WeakMap();
var hasIndependentLeafDefaults = (blueprint2) => {
  const cached = INDEPENDENT.get(blueprint2);
  if (cached !== void 0) return cached;
  let hasDefault = false;
  let independent = blueprint2.expressions.length === 0;
  for (let index = 0; independent && index < blueprint2.nodes.length; index++) {
    const node = blueprint2.nodes[index];
    if (node.kind !== "object" && node.kind !== "string" && node.kind !== "number" && node.kind !== "boolean" && node.kind !== "null" || node.kind === "object" && node.strategy !== "branch") {
      independent = false;
      break;
    }
    for (let declarationIndex = 0; declarationIndex < node.declarations.length; declarationIndex++) {
      const declaration = node.declarations[declarationIndex];
      if (declaration.gates.length) {
        independent = false;
        break;
      }
      const schema = declaration.schema;
      if (!schema || typeof schema !== "object") continue;
      if (schema.controls !== void 0) {
        independent = false;
        break;
      }
      const value = schema.default;
      if (value === void 0) continue;
      if (node.kind === "object" || value !== null && typeof value !== "string" && typeof value !== "number" && typeof value !== "boolean") {
        independent = false;
        break;
      }
      hasDefault = true;
    }
  }
  independent = independent && hasDefault;
  INDEPENDENT.set(blueprint2, independent);
  return independent;
};

// packages/canard/schema-form/src/core/settle/utils/compute/computeNode.ts
var computeNode = (node, context) => {
  if (!context.dirtyPaths.has(node.path)) return;
  if (node === context.root && context.kind === "load" && node.behavior.type === "object" && node.behavior.strategy === "branch" && !node.deliveryInitialized && !context.suppressAutomaticWrites && !context.hasGates && context.writtenInputs.get(node) === void 0 && node.runtime.latentRaw.size === 0 && hasIndependentLeafDefaults(node.runtime.blueprint)) context.initialOutputs = [];
  context.stateDirtyNodes.add(node);
  if (!context.hasGates && node.parent !== null && node.behavior.strategy === "terminal" && context.entered.has(node)) {
    if (context.initialOutputs) context.initialOutputs.push(node);
    else updateOutput(node, context);
    context.dirtyPaths.delete(node.path);
    return;
  }
  if (!context.hasGates && !context.shapeDirtyPaths.has(node.path)) {
    if (node.behavior.strategy === "branch") {
      const recalculated = dirtyChildren(node, context);
      for (let index = 0; index < recalculated.length; index++)
        computeNode(recalculated[index], context);
      updateOutput(node, context, recalculated);
    } else {
      if (node.parent === null) selectNodeSchema(node, context);
      updateOutput(node, context);
    }
    context.dirtyPaths.delete(node.path);
    return;
  }
  if (!context.originalSchemas.has(node.path))
    context.originalSchemas.set(node.path, node.schema);
  const previous = {
    local: node.local,
    emit: node.emit,
    children: node.children,
    schema: node.schema,
    active: node.active
  };
  if (node.behavior.strategy !== "branch") {
    if (node.parent === null) selectNodeSchema(node, context);
    updateOutput(node, context);
    preserveReferences(node, previous, context);
    context.dirtyPaths.delete(node.path);
    return;
  }
  if (!context.shapeDirtyPaths.has(node.path)) {
    const recalculated = dirtyChildren(node, context);
    for (let index = 0; index < recalculated.length; index++)
      computeNode(recalculated[index], context);
    updateOutput(node, context, recalculated);
    preserveReferences(node, previous, context);
    context.dirtyPaths.delete(node.path);
    return;
  }
  const prior = node.structure ?? {};
  const gates = [];
  const seenGates = /* @__PURE__ */ new Set();
  if (context.hasGates) {
    const entries = node.behavior.declareChildren(node);
    for (let entryIndex = 0; entryIndex < entries.length; entryIndex++) {
      const declarations2 = entries[entryIndex].declarations;
      for (let declarationIndex = 0; declarationIndex < declarations2.length; declarationIndex++) {
        const declaredGates = declarations2[declarationIndex].gates;
        for (let gateIndex = 0; gateIndex < declaredGates.length; gateIndex++) {
          const gate = declaredGates[gateIndex];
          if (!seenGates.has(gate)) {
            seenGates.add(gate);
            gates.push(gate);
          }
        }
      }
    }
    const declarations = node.blueprintNode.declarations;
    for (let declarationIndex = 0; declarationIndex < declarations.length; declarationIndex++) {
      const declaredGates = declarations[declarationIndex].gates;
      for (let gateIndex = 0; gateIndex < declaredGates.length; gateIndex++) {
        const gate = declaredGates[gateIndex];
        if (!seenGates.has(gate)) {
          seenGates.add(gate);
          gates.push(gate);
        }
      }
    }
    const relocated = relocatedGates(node);
    for (let index = 0; index < relocated.length; index++) {
      const occurrence = relocated[index];
      if (!seenGates.has(occurrence.gate)) {
        seenGates.add(occurrence.gate);
        gates.push(occurrence.gate);
      }
    }
  }
  if (gates.length > 0) primeHost(node, prior, context);
  const initialDirty = dirtyChildren(node, context);
  for (let index = 0; index < initialDirty.length; index++)
    computeNode(initialDirty[index], context);
  if (gates.length > 0 && updateOutput(node, context))
    scheduleRelocatedGates(relocatedGates(node), context);
  let cap = getHostWheelBudgetCap(node, node.runtime.blueprint, gates);
  for (let round = 0; round < cap; round++) {
    const schemaChanged = node.parent === null && selectNodeSchema(node, context);
    const changed = selectChildren(
      node,
      context,
      prior,
      (child) => computeNode(child, context),
      gates.length > 0
    );
    const dirty = dirtyChildren(node, context);
    for (let index = 0; index < dirty.length; index++) computeNode(dirty[index], context);
    let outputChanged = false;
    if (context.initialOutputs) context.initialOutputs.push(node);
    else outputChanged = updateOutput(node, context);
    const currentRelocated = context.hasGates ? relocatedGates(node) : [];
    for (let index = 0; index < currentRelocated.length; index++) {
      const occurrence = currentRelocated[index];
      if (!seenGates.has(occurrence.gate)) {
        seenGates.add(occurrence.gate);
        gates.push(occurrence.gate);
      }
    }
    cap = getHostWheelBudgetCap(node, node.runtime.blueprint, gates);
    if (outputChanged) scheduleRelocatedGates(currentRelocated, context);
    if (!schemaChanged && !changed && !outputChanged) {
      preserveReferences(node, previous, context);
      context.dirtyPaths.delete(node.path);
      return;
    }
  }
  if (gates.length > 0) context.hostWheelExceeded = cap;
  preserveReferences(node, previous, context);
  context.dirtyPaths.delete(node.path);
};

// packages/canard/schema-form/src/core/settle/utils/write/getDependencyIndex.ts
var import_pointer20 = require("@winglet/json/pointer");

// packages/canard/schema-form/src/core/settle/derive/utils/rules/getDeriveRuleTable.ts
var import_filter53 = require("@winglet/common-utils/filter");

// packages/canard/schema-form/src/core/settle/utils/controls/getControlExpression.ts
var CONTROL_EXPRESSIONS = /* @__PURE__ */ new WeakMap();
var getControlExpression = (blueprint2, declarationId, schemaPath, key) => {
  let expressions = CONTROL_EXPRESSIONS.get(blueprint2);
  if (!expressions) {
    expressions = new Map(blueprint2.expressions.map((expression) => [
      JSON.stringify([
        expression.declarationId,
        expression.schemaPath,
        expression.key
      ]),
      expression
    ]));
    CONTROL_EXPRESSIONS.set(blueprint2, expressions);
  }
  return expressions.get(JSON.stringify([declarationId, schemaPath, key]));
};

// packages/canard/schema-form/src/core/settle/derive/utils/rules/utils/getWatchPaths.ts
var import_filter52 = require("@winglet/common-utils/filter");
var WATCH_PATHS = /* @__PURE__ */ new WeakMap();
var getWatchPaths = (node) => {
  const cached = WATCH_PATHS.get(node);
  if (cached) return cached;
  const watches = [];
  for (const declaration of node.declarations) {
    const schema = declaration.schema;
    const controls = schema && typeof schema === "object" ? Reflect.get(schema, "controls") : void 0;
    const watch = controls && typeof controls === "object" ? Reflect.get(controls, "watch") : void 0;
    for (const path of (0, import_filter52.isArray)(watch) ? watch : [])
      if (typeof path === "string" && !watches.includes(path)) watches.push(path);
  }
  WATCH_PATHS.set(node, watches);
  return watches;
};

// packages/canard/schema-form/src/core/settle/derive/utils/rules/getDeriveRuleTable.ts
var TABLES = /* @__PURE__ */ new WeakMap();
var EMPTY_TABLE = Object.freeze({
  rules: Object.freeze([]),
  byDeclaration: emptyReadonlyMap
});
var RULE_KEYS = ["derived", "unsetValue", "resetInteraction", "injectTo"];
var getDeriveRuleTable = (blueprint2) => {
  if (!blueprint2.capabilities.hasDerive) return EMPTY_TABLE;
  const cached = TABLES.get(blueprint2);
  if (cached) return cached;
  const rules = [];
  const byDeclaration = /* @__PURE__ */ new Map();
  for (const node of blueprint2.nodes)
    for (const declaration of node.declarations) {
      const schema = declaration.schema;
      const controls = schema && typeof schema === "object" ? Reflect.get(schema, "controls") : void 0;
      if (!controls || typeof controls !== "object" || (0, import_filter53.isArray)(controls)) continue;
      const groups = [];
      const hasOwnRules = Reflect.get(controls, "derived") !== void 0 || Reflect.get(controls, "unsetValue") !== void 0 || Reflect.get(controls, "resetInteraction") !== void 0 || Reflect.get(controls, "injectTo") !== void 0;
      if (hasOwnRules && declaration.scope === "fragment") {
        for (const entry of node.childEntries) {
          const selected = entry.declarations.filter((child) => child.schemaPath.startsWith(`${declaration.schemaPath}/properties/`) || child.schemaPath.startsWith(`${declaration.schemaPath}/items/`) || child.schemaPath.startsWith(`${declaration.schemaPath}/prefixItems/`));
          if (selected.length) groups.push({
            controls,
            schemaPath: `${declaration.schemaPath}/controls`,
            layer: "fragment",
            targetName: entry.name,
            targetDeclarationIds: selected.map((child) => child.id),
            targetNodes: [entry.node]
          });
        }
      } else if (hasOwnRules) groups.push({
        controls,
        schemaPath: `${declaration.schemaPath}/controls`,
        layer: "node",
        targetNodes: [node]
      });
      const children = Reflect.get(controls, "children");
      if ((0, import_filter53.isArray)(children))
        for (let index = 0; index < children.length; index++) {
          const item = children[index];
          if (!item || typeof item !== "object") continue;
          const itemControls = Reflect.get(item, "controls");
          const names = Reflect.get(item, "targets");
          if (!itemControls || typeof itemControls !== "object" || !(0, import_filter53.isArray)(names))
            continue;
          for (const name of names) {
            if (typeof name !== "string") continue;
            const targets = node.childEntries.filter((entry) => entry.name === name);
            if (targets.length) groups.push({
              controls: itemControls,
              schemaPath: `${declaration.schemaPath}/controls/children/${index}/controls`,
              layer: "children",
              targetName: name,
              targetNodes: targets.map((target) => target.node)
            });
          }
        }
      for (const group of groups)
        for (const kind of RULE_KEYS) {
          const literal = Reflect.get(group.controls, kind);
          if (literal === void 0) continue;
          const schemaPath = `${group.schemaPath}/${kind}`;
          const expression = getControlExpression(
            blueprint2,
            declaration.id,
            schemaPath,
            kind
          );
          if (typeof literal === "string" && !expression) continue;
          if (kind === "injectTo" && typeof literal !== "function") continue;
          const dependencies = [...expression?.dependencies ?? []];
          const watchDependencies = [];
          if (kind === "derived")
            for (const targetNode of group.targetNodes)
              for (const watch of getWatchPaths(targetNode)) {
                if (!watchDependencies.includes(watch)) watchDependencies.push(watch);
                if (!dependencies.includes(watch)) dependencies.push(watch);
              }
          const rule = {
            declarationId: declaration.id,
            kind,
            schemaPath,
            layer: group.layer,
            targetName: group.targetName,
            targetDeclarationIds: group.targetDeclarationIds,
            dependencies,
            watchDependencies,
            expression,
            literal,
            order: rules.length
          };
          rules.push(rule);
          const owned = byDeclaration.get(declaration.id) ?? [];
          owned.push(rule);
          byDeclaration.set(declaration.id, owned);
        }
    }
  const table = { rules, byDeclaration };
  TABLES.set(blueprint2, table);
  return table;
};

// packages/canard/schema-form/src/core/settle/derive/utils/edges/getDeriveRuleKey.ts
var TARGET_IDS = /* @__PURE__ */ new WeakMap();
var nextTargetId = 0;
var getDeriveRuleKey = (path, kind, rule, target) => {
  let targetId = TARGET_IDS.get(target);
  if (targetId === void 0) {
    targetId = ++nextTargetId;
    TARGET_IDS.set(target, targetId);
  }
  return JSON.stringify([
    path,
    kind,
    rule.declarationId,
    rule.schemaPath,
    rule.targetName,
    target.path,
    target.blueprintNode.kind,
    targetId
  ]);
};

// packages/canard/schema-form/src/core/settle/derive/utils/evaluate/utils/readDeriveDependency.ts
var import_lib16 = require("@winglet/common-utils/lib");
var import_pointer16 = require("@winglet/json/pointer");
var readDeriveDependency = (root, hostPath, dependency) => {
  const path = resolveDependencyPath(hostPath, dependency);
  if (path === "@") return root.runtime.context ?? {};
  let value = root.emit;
  for (const encoded of path.split("/").slice(1)) {
    if (value === null || typeof value !== "object") return void 0;
    const name = (0, import_pointer16.unescapeSegment)(encoded);
    if (!(0, import_lib16.hasOwnProperty)(value, name)) return void 0;
    value = Reflect.get(value, name);
  }
  return value;
};

// packages/canard/schema-form/src/core/settle/derive/utils/evaluate/utils/getRuleTargets.ts
var import_lib17 = require("@winglet/common-utils/lib");

// packages/canard/schema-form/src/core/settle/utils/controls/getCommittedDeclarationKey.ts
var KEYS = /* @__PURE__ */ new WeakMap();
var getCommittedDeclarationKey = (node) => {
  const path = node.path;
  const kind = node.blueprintNode.kind;
  const cached = KEYS.get(node);
  if (cached?.path === path && cached.kind === kind) return cached.key;
  const key = JSON.stringify([path, kind]);
  KEYS.set(node, { path, kind, key });
  return key;
};

// packages/canard/schema-form/src/core/settle/derive/utils/evaluate/utils/getSelectedDeclarationIds.ts
var getSelectedDeclarationIds = (node, state) => state.selectedDeclarationIds.get(node) ?? node.runtime.committedDeclarationIds?.get(getCommittedDeclarationKey(node)) ?? node.blueprintNode.declarations.map((declaration) => declaration.id);

// packages/canard/schema-form/src/core/settle/derive/utils/evaluate/utils/getRuleTargets.ts
var getRuleTargets = (source, rule, state) => {
  if (!rule.targetName) return [source];
  const children = source.structure;
  if (!children || !(0, import_lib17.hasOwnProperty)(children, rule.targetName)) return [];
  const target = children[rule.targetName];
  if (target.detached) return [];
  if (rule.layer === "fragment" && rule.targetDeclarationIds && !rule.targetDeclarationIds.some((id) => getSelectedDeclarationIds(target, state).includes(id))) return [];
  return [target];
};

// packages/canard/schema-form/src/core/settle/derive/utils/evaluate/utils/getDeriveSourceNodes.ts
var import_lib18 = require("@winglet/common-utils/lib");
var import_pointer17 = require("@winglet/json/pointer");
var getDeriveSourceNodes = (root, state) => {
  if (!state.sourcePaths) return [root];
  const nodes = [];
  const seen = /* @__PURE__ */ new Set();
  for (const path of state.sourcePaths) {
    let node = root;
    for (const encoded of path.split("/").slice(1)) {
      const name = (0, import_pointer17.unescapeSegment)(encoded);
      const children = node?.structure ?? null;
      node = children && (0, import_lib18.hasOwnProperty)(children, name) ? children[name] : void 0;
      if (!node) break;
    }
    if (node && !seen.has(node)) {
      seen.add(node);
      nodes.push(node);
    }
  }
  return nodes;
};

// packages/canard/schema-form/src/core/settle/derive/utils/rank/kindRank.ts
var KIND_RANK = { unsetValue: 4, derived: 3, injectTo: 2, fill: 1 };

// packages/canard/schema-form/src/core/settle/derive/utils/rank/layerRank.ts
var LAYER_RANK = { fragment: 1, children: 2, node: 3 };

// packages/canard/schema-form/src/core/settle/derive/utils/rank/getDeriveChildEntry.ts
var CHILDREN = /* @__PURE__ */ new WeakMap();
var getDeriveChildEntry = (parent, name, kind) => {
  let index = CHILDREN.get(parent);
  if (!index) {
    const built = /* @__PURE__ */ new Map();
    parent.childEntries.forEach((entry, position2) => {
      const positions2 = built.get(entry.name) ?? [];
      positions2.push(position2);
      built.set(entry.name, positions2);
    });
    index = built;
    CHILDREN.set(parent, index);
  }
  const positions = index.get(name);
  const position = kind ? positions?.find((candidate) => parent.childEntries[candidate].node.kind === kind) : positions?.[0];
  return position === void 0 ? void 0 : { entry: parent.childEntries[position], position };
};

// packages/canard/schema-form/src/core/settle/derive/utils/rank/getDeriveSourceOrder.ts
var getDeriveSourceOrder = (source) => {
  const order = [];
  let node = source;
  while (node?.parent) {
    const current = node;
    const parent = current.parent;
    if (!parent) break;
    const found = getDeriveChildEntry(
      parent.blueprintNode,
      current.name,
      current.blueprintNode.kind
    );
    order.unshift(found?.position ?? (Number(current.name) || 0));
    node = parent;
  }
  return order;
};

// packages/canard/schema-form/src/core/settle/derive/utils/evaluate/utils/getInjectEntries.ts
var import_filter54 = require("@winglet/common-utils/filter");
var getInjectEntries = (result) => {
  if (result === null || result === void 0) return [];
  if (!(0, import_filter54.isArray)(result)) return typeof result === "object" ? Object.entries(result) : [];
  const entries = [];
  for (const row of result)
    if ((0, import_filter54.isArray)(row) && typeof row[0] === "string")
      entries.push([row[0], row[1]]);
  return entries;
};

// packages/canard/schema-form/src/core/settle/derive/utils/evaluate/utils/getInjectTarget.ts
var import_lib19 = require("@winglet/common-utils/lib");
var import_pointer18 = require("@winglet/json/pointer");
var getInjectTarget = (root, path) => {
  if (path === "@") return void 0;
  let template = root.blueprintNode;
  let live = root;
  let siblings = template.childEntries;
  const order = [];
  for (const encoded of path.split("/").slice(1)) {
    if (template.strategy !== "branch") return void 0;
    const name = (0, import_pointer18.unescapeSegment)(encoded);
    siblings = template.childEntries;
    const index = Number(name);
    const item = template.kind === "array" && Number.isInteger(index) && index >= 0 && String(index) === name ? getItemEntry(template, index) : void 0;
    const found = item ? { entry: item, position: index } : getDeriveChildEntry(template, name);
    if (!found) return void 0;
    order.push(found.position);
    const structure = live?.structure ?? null;
    live = structure && (0, import_lib19.hasOwnProperty)(structure, name) ? structure[name] : void 0;
    template = live?.blueprintNode ?? found.entry.node;
  }
  return { target: live, template: live?.blueprintNode ?? template, siblings, order };
};

// packages/canard/schema-form/src/core/settle/derive/utils/evaluate/utils/getInjectToContext.ts
var getInjectToContext = (source, root) => ({
  dataPath: source.path,
  schemaPath: source.blueprintNode.schemaPath,
  jsonSchema: source.schema.schema,
  parentValue: source.parent ? source.parent.emit : null,
  parentJSONSchema: source.parent ? source.parent.schema.schema : null,
  rootValue: root.emit,
  rootJSONSchema: root.schema.schema,
  context: root.runtime.context ?? {}
});

// packages/canard/schema-form/src/core/settle/derive/utils/evaluate/utils/getVirtualWriteFailure.ts
var import_filter55 = require("@winglet/common-utils/filter");
var getVirtualWriteFailure = (sourcePath, schemaPath, targetPath, template, value) => {
  if (template.kind !== "virtual" || value === void 0 || (0, import_filter55.isArray)(value) && value.length === template.fields?.length) return void 0;
  return {
    sourcePath,
    schemaPath,
    targetPath,
    cause: value,
    kind: "writeShape",
    expectedLength: template.fields?.length
  };
};

// packages/canard/schema-form/src/core/settle/derive/utils/evaluate/utils/evaluateInjectTo.ts
var evaluateInjectTo = (source, root, rule) => {
  if (typeof rule.literal !== "function") return { writes: [] };
  let result;
  try {
    result = rule.literal(source.emit, getInjectToContext(source, root));
  } catch (cause) {
    return { writes: [], failure: {
      sourcePath: source.path,
      schemaPath: rule.schemaPath,
      cause,
      kind: "expression"
    } };
  }
  const writes = [];
  const entries = getInjectEntries(result);
  for (let index = 0; index < entries.length; index++) {
    const [relative, value] = entries[index];
    if (value === void 0) continue;
    const targetPath = resolveDependencyPath(source.path, relative);
    const resolved = getInjectTarget(root, targetPath);
    if (!resolved) return { writes: [], failure: {
      sourcePath: source.path,
      schemaPath: rule.schemaPath,
      cause: relative,
      kind: "injectTarget",
      targetPath
    } };
    const invalid = getVirtualWriteFailure(
      source.path,
      rule.schemaPath,
      targetPath,
      resolved.template,
      value
    );
    if (invalid) return { writes: [], failure: invalid };
    writes.push({
      target: resolved.target,
      targetPath,
      template: resolved.template,
      siblings: resolved.siblings,
      targetOrder: resolved.order,
      value,
      kind: "injectTo",
      rank: KIND_RANK.injectTo,
      layer: LAYER_RANK[rule.layer],
      sourceOrder: getDeriveSourceOrder(source),
      ruleOrder: rule.order,
      returnOrder: index
    });
  }
  return { writes };
};

// packages/canard/schema-form/src/core/settle/derive/utils/rank/compareDeriveWrites.ts
var compareDeriveWrites = (left, right) => {
  const kind = KIND_RANK[left.kind] - KIND_RANK[right.kind];
  if (kind) return kind;
  const limit = Math.min(left.sourceOrder.length, right.sourceOrder.length);
  for (let index = 0; index < limit; index++) {
    const difference = left.sourceOrder[index] - right.sourceOrder[index];
    if (difference) return difference;
  }
  const source = left.sourceOrder.length - right.sourceOrder.length;
  if (source) return source;
  return left.layer - right.layer || left.ruleOrder - right.ruleOrder || left.returnOrder - right.returnOrder;
};

// packages/canard/schema-form/src/core/settle/derive/utils/evaluate/utils/chooseDeriveWrite.ts
var chooseDeriveWrite = (candidate, sourcePath, state, winners, trace, traceWinners) => {
  const path = candidate.targetPath;
  const prior = winners.get(path);
  const wins = !state.suppressAutomaticWrites && candidate.rank >= (state.appliedRanks.get(path) ?? 0) && (!prior || compareDeriveWrites(candidate, prior) >= 0);
  if (wins) {
    const previousIndex = traceWinners.get(path);
    if (previousIndex !== void 0)
      trace[previousIndex] = { ...trace[previousIndex], result: "lost" };
    winners.set(path, candidate);
    if (state.trace) traceWinners.set(path, trace.length);
  }
  if (state.trace) trace.push({
    phase: "derive",
    kind: candidate.kind,
    sourcePath,
    targetPath: path,
    previousValue: candidate.target?.emit,
    nextValue: candidate.value,
    result: state.suppressAutomaticWrites ? "suppressed" : wins ? "applied" : "lost"
  });
};

// packages/canard/schema-form/src/core/settle/derive/utils/evaluate/utils/evaluateScopedExpression.ts
var evaluateScopedExpression = (root, host, rule, cache) => {
  if (!rule.expression) return { value: rule.literal, threw: false };
  const key = JSON.stringify([host.path, rule.schemaPath]);
  const cached = cache.get(key);
  if (cached) return cached;
  let result;
  try {
    result = {
      value: rule.expression.evaluate(rule.expression.dependencies.map(
        (dependency) => readDeriveDependency(root, host.path, dependency)
      )),
      threw: false
    };
  } catch (cause) {
    result = { value: void 0, threw: true, cause };
  }
  cache.set(key, result);
  return result;
};

// packages/canard/schema-form/src/core/settle/derive/utils/evaluate/utils/addActiveRuleKey.ts
var addActiveRuleKey = (state, sourcePath, key) => {
  state.activeRuleKeys.add(key);
  let sourceKeys = state.activeRuleKeysBySource.get(sourcePath);
  if (!sourceKeys) {
    sourceKeys = /* @__PURE__ */ new Set();
    state.activeRuleKeysBySource.set(sourcePath, sourceKeys);
  }
  sourceKeys.add(key);
};

// packages/canard/schema-form/src/core/settle/derive/utils/evaluate/evaluateDeriveRound.ts
var NO_FAILURES = Object.freeze([]);
var evaluateDeriveRound = (root, state) => {
  const table = getDeriveRuleTable(root.runtime.blueprint);
  if (table.rules.length === 0) return { writes: [], trace: [], failures: NO_FAILURES };
  const pending = getDeriveSourceNodes(root, state);
  const winners = /* @__PURE__ */ new Map();
  const trace = [];
  const traceWinners = /* @__PURE__ */ new Map();
  const evaluatedExpressions = /* @__PURE__ */ new Map();
  let failures;
  if (!state.sourcePaths) {
    state.activeRuleKeys.clear();
    state.activeRuleKeysBySource.clear();
  }
  state.activeUnsetTargets.clear();
  while (pending.length) {
    const node = pending.pop();
    if (!node || node.detached) continue;
    state.visitedSourcePaths.add(node.path);
    if (state.sourcePaths) {
      const sourceKeys = state.activeRuleKeysBySource.get(node.path);
      if (sourceKeys) {
        for (const key of sourceKeys) state.activeRuleKeys.delete(key);
        state.activeRuleKeysBySource.delete(node.path);
      }
    }
    const selected = getSelectedDeclarationIds(node, state);
    for (const id of selected)
      for (const rule of table.byDeclaration.get(id) ?? []) {
        if (rule.kind === "resetInteraction") continue;
        const target = rule.kind === "injectTo" ? node : getRuleTargets(node, rule, state)[0];
        if (!target) continue;
        const key = getDeriveRuleKey(
          node.path,
          node.blueprintNode.kind,
          rule,
          target
        );
        addActiveRuleKey(state, node.path, key);
        const consumed = state.consumedRuleValues.has(key);
        const priorExists = consumed || state.committedRuleValues.has(key);
        const prior = consumed ? state.consumedRuleValues.get(key) : state.committedRuleValues.get(key);
        const load = !consumed && Boolean(state.loadScope && (node.path === state.loadScope.path || node.path.startsWith(`${state.loadScope.path}/`)));
        const appeared = !consumed && (load || state.entered.has(target) || state.revived.has(target));
        if (rule.kind === "injectTo") {
          const current2 = node.emit;
          state.consumedRuleValues.set(key, current2);
          if (state.loadScope && node.path !== state.loadScope.path && !node.path.startsWith(`${state.loadScope.path}/`)) continue;
          if (!appeared && (!priorExists || sameValue(prior, current2))) continue;
          const evaluated = evaluateInjectTo(node, root, rule);
          if (evaluated.failure) {
            (failures ??= []).push(evaluated.failure);
            continue;
          }
          for (const candidate2 of evaluated.writes)
            chooseDeriveWrite(candidate2, node.path, state, winners, trace, traceWinners);
          if (evaluated.writes.length === 0 && state.trace)
            trace.push({
              phase: "derive",
              kind: "injectTo",
              sourcePath: node.path,
              targetPath: node.path,
              previousValue: current2,
              nextValue: void 0,
              result: "undefined"
            });
          continue;
        }
        let current;
        let value;
        try {
          if (rule.kind === "derived") {
            const watchDependencies = getWatchPaths(target.blueprintNode);
            current = [
              ...rule.expression?.dependencies.map((dependency) => readDeriveDependency(root, node.path, dependency)) ?? [],
              ...watchDependencies.filter((dependency) => target !== node || !rule.expression?.dependencies.includes(dependency)).map((dependency) => readDeriveDependency(root, target.path, dependency))
            ];
            if (appeared || priorExists && !sameValue(prior, current)) {
              const evaluated = evaluateScopedExpression(
                root,
                node,
                rule,
                evaluatedExpressions
              );
              if (evaluated.threw) throw evaluated.cause;
              value = evaluated.value;
            }
          } else {
            const evaluated = evaluateScopedExpression(
              root,
              node,
              rule,
              evaluatedExpressions
            );
            if (evaluated.threw) throw evaluated.cause;
            current = Boolean(evaluated.value);
            if (!(current && (appeared || priorExists && !prior)))
              value = void 0;
          }
        } catch (cause) {
          (failures ??= []).push({
            sourcePath: node.path,
            schemaPath: rule.schemaPath,
            cause,
            kind: "expression"
          });
          state.consumedRuleValues.set(key, current);
          continue;
        }
        state.consumedRuleValues.set(key, current);
        if (rule.kind === "unsetValue" && current)
          state.activeUnsetTargets.add(target);
        const fired = rule.kind === "derived" ? Boolean(appeared || priorExists && !sameValue(prior, current)) : current === true && Boolean(appeared || priorExists && !prior);
        if (!fired) continue;
        if (rule.kind === "derived" && value === void 0) {
          if (state.trace) trace.push({
            phase: "derive",
            kind: rule.kind,
            sourcePath: node.path,
            targetPath: target.path,
            previousValue: target.emit,
            nextValue: value,
            result: "undefined"
          });
          continue;
        }
        const candidate = {
          target,
          targetPath: target.path,
          value: rule.kind === "unsetValue" ? void 0 : value,
          kind: rule.kind,
          rank: KIND_RANK[rule.kind],
          layer: LAYER_RANK[rule.layer],
          sourceOrder: getDeriveSourceOrder(node),
          ruleOrder: rule.order,
          returnOrder: 0
        };
        const invalid = getVirtualWriteFailure(
          node.path,
          rule.schemaPath,
          target.path,
          target.blueprintNode,
          candidate.value
        );
        if (invalid) {
          (failures ??= []).push(invalid);
          continue;
        }
        chooseDeriveWrite(candidate, node.path, state, winners, trace, traceWinners);
      }
    if (!state.sourcePaths)
      for (let index = (node.children?.length ?? 0) - 1; index >= 0; index--)
        pending.push(node.children[index]);
  }
  return { writes: [...winners.values()], trace, failures: failures ?? NO_FAILURES };
};

// packages/canard/schema-form/src/core/settle/derive/utils/evaluate/evaluateResetInteraction.ts
var NO_FAILURES2 = Object.freeze([]);
var evaluateResetInteraction = (root, state) => {
  const table = getDeriveRuleTable(root.runtime.blueprint);
  const pending = getDeriveSourceNodes(root, state);
  const nodes = [];
  const trace = [];
  const evaluatedExpressions = /* @__PURE__ */ new Map();
  let failures;
  while (pending.length) {
    const node = pending.pop();
    if (!node || node.detached) continue;
    state.visitedSourcePaths.add(node.path);
    const selected = getSelectedDeclarationIds(node, state);
    for (const id of selected)
      for (const rule of table.byDeclaration.get(id) ?? []) {
        if (rule.kind !== "resetInteraction") continue;
        const target = getRuleTargets(node, rule, state)[0];
        if (!target) continue;
        const key = getDeriveRuleKey(
          node.path,
          node.blueprintNode.kind,
          rule,
          target
        );
        addActiveRuleKey(state, node.path, key);
        const previous = state.committedRuleValues.get(key);
        const previousExists = state.committedRuleValues.has(key);
        let current;
        try {
          const evaluated = evaluateScopedExpression(
            root,
            node,
            rule,
            evaluatedExpressions
          );
          if (evaluated.threw) throw evaluated.cause;
          current = Boolean(evaluated.value);
        } catch (cause) {
          (failures ??= []).push({
            sourcePath: node.path,
            schemaPath: rule.schemaPath,
            cause
          });
          state.consumedRuleValues.set(key, false);
          continue;
        }
        state.consumedRuleValues.set(key, current);
        const load = state.loadScope && (node.path === state.loadScope.path || node.path.startsWith(`${state.loadScope.path}/`));
        if (!current || !(load || state.entered.has(target) || state.revived.has(target) || previousExists && !previous)) continue;
        if (!nodes.includes(target)) nodes.push(target);
        if (state.trace) trace.push({
          phase: "commit",
          kind: rule.kind,
          sourcePath: node.path,
          targetPath: target.path,
          previousValue: previous,
          nextValue: current,
          result: "applied"
        });
      }
    if (!state.sourcePaths)
      for (let index = (node.children?.length ?? 0) - 1; index >= 0; index--)
        pending.push(node.children[index]);
  }
  return { nodes, trace, failures: failures ?? NO_FAILURES2 };
};

// packages/canard/schema-form/src/core/settle/derive/utils/deriveRoundCap.ts
var DERIVE_ROUND_CAP = 25;

// packages/canard/schema-form/src/core/settle/utils/paths/expandTemplatePaths.ts
var import_lib20 = require("@winglet/common-utils/lib");
var import_pointer19 = require("@winglet/json/pointer");
var expandTemplatePaths = (root, templatePath) => {
  if (!templatePath.includes("/*")) return [templatePath];
  const segments = templatePath.split("/").slice(1);
  const paths = [];
  const pending = [
    { node: root, depth: 0, path: "" }
  ];
  while (pending.length) {
    const current = pending.pop();
    if (!current) continue;
    const { node, depth, path } = current;
    if (depth === segments.length) {
      paths.push(path);
      continue;
    }
    if (!node) continue;
    const segment = segments[depth];
    if (segment === "*") {
      for (let index = node.itemCount - 1; index >= 0; index--) {
        const name2 = String(index);
        const child2 = node.structure?.[name2];
        if (depth + 1 === segments.length || child2)
          pending.push({ node: child2, depth: depth + 1, path: `${path}/${name2}` });
      }
      continue;
    }
    const name = (0, import_pointer19.unescapeSegment)(segment);
    const structure = node.structure;
    const child = structure && (0, import_lib20.hasOwnProperty)(structure, name) ? structure[name] : void 0;
    if (depth + 1 === segments.length || child)
      pending.push({
        node: child,
        depth: depth + 1,
        path: `${path}/${segment}`
      });
  }
  return paths;
};

// packages/canard/schema-form/src/core/settle/utils/paths/isCanonicalArrayIndex.ts
var CANONICAL_ARRAY_INDEX = /^(0|[1-9]\d*)$/;
var isCanonicalArrayIndex = (segment) => CANONICAL_ARRAY_INDEX.test(segment);

// packages/canard/schema-form/src/core/settle/utils/context/getContextOwners.ts
var OWNERS = /* @__PURE__ */ new WeakMap();
var EMPTY_OWNERS = Object.freeze([]);
var getContextOwners = (blueprint2) => {
  if (!blueprint2.capabilities.hasDependencies) return EMPTY_OWNERS;
  const cached = OWNERS.get(blueprint2);
  if (cached) return cached;
  const ids = blueprint2.dependencies["@"];
  if (!ids?.length) {
    OWNERS.set(blueprint2, EMPTY_OWNERS);
    return EMPTY_OWNERS;
  }
  const owners = [];
  const rules = getDeriveRuleTable(blueprint2);
  for (const node of blueprint2.nodes)
    for (const declaration of node.declarations)
      if ((ids.includes(declaration.id) || rules.byDeclaration.get(declaration.id)?.some((rule) => rule.kind === "derived" && rule.targetName && rule.watchDependencies.includes("@"))) && !owners.includes(declaration.path))
        owners.push(declaration.path);
  OWNERS.set(blueprint2, owners);
  return owners;
};

// packages/canard/schema-form/src/core/settle/utils/write/getDependencyIndex.ts
var NO_OWNERS = Object.freeze([]);
var DependencyIndex = class {
  /** Build absolute watch paths from authored reverse dependency IDs. */
  constructor(blueprint2) {
    this.root = void 0;
    if (!blueprint2) return;
    this.root = { owners: [], ownerPaths: /* @__PURE__ */ new Set(), children: /* @__PURE__ */ new Map() };
    getContextOwners(blueprint2);
    const dependencies = Object.entries(blueprint2.dependencies);
    if (dependencies.length === 0 && blueprint2.expressions.length === 0) return;
    const declarations = new Map(blueprint2.nodes.flatMap((node) => node.declarations.map((declaration) => [declaration.id, declaration])));
    for (const [dependency, ids] of dependencies)
      for (const id of ids) {
        const declaration = declarations.get(id);
        if (!declaration) continue;
        const watched = resolveDependencyPath(declaration.path, dependency);
        if (watched === "@") continue;
        this.add(watched, declaration.path);
      }
    const rules = getDeriveRuleTable(blueprint2);
    for (const node of blueprint2.nodes)
      for (const declaration of node.declarations)
        for (const rule of rules.byDeclaration.get(declaration.id) ?? []) {
          if (rule.kind !== "derived" || !rule.targetName) continue;
          const targetPath = `${declaration.path}/${(0, import_pointer20.escapeSegment)(rule.targetName)}`;
          for (const watch of rule.watchDependencies) {
            const watched = resolveDependencyPath(targetPath, watch);
            if (watched !== "@") this.add(watched, declaration.path);
          }
        }
    for (const node of blueprint2.nodes)
      for (const declaration of node.declarations)
        for (const gate of declaration.gates) {
          const expression = getGateExpression(blueprint2, gate.schemaPath);
          if (!expression) continue;
          for (const dependency of expression.dependencies) {
            const watched = resolveDependencyPath(gate.hostPath, dependency);
            if (watched === "@") continue;
            this.add(watched, declaration.path);
          }
        }
  }
  /** Return owners whose reads intersect a changed path in either direction. */
  affected(changedPath, root) {
    const rootIndex = this.root;
    if (!rootIndex || rootIndex.owners.length === 0 && rootIndex.children.size === 0)
      return NO_OWNERS;
    const owners = /* @__PURE__ */ new Set();
    let current = [rootIndex];
    const collect = (node) => {
      for (const entry of node.owners) {
        const path = entry.bindable ? bindTemplatePath(entry.path, changedPath) : entry.path;
        if (path.includes("/*"))
          for (const expanded of expandTemplatePaths(root, path))
            owners.add(expanded);
        else owners.add(path);
      }
    };
    collect(rootIndex);
    for (const segment of changedPath.split("/").filter(Boolean)) {
      const next = [];
      for (const node of current) {
        const exact = node.children.get(segment);
        if (exact) next.push(exact);
        if (isCanonicalArrayIndex(segment)) {
          const wildcard = node.children.get("*");
          if (wildcard) next.push(wildcard);
        }
      }
      if (next.length === 0) return [...owners];
      current = next;
      for (const node of current) collect(node);
    }
    const pending = current.flatMap((node) => [...node.children.values()]);
    while (pending.length) {
      const child = pending.pop();
      if (!child) continue;
      collect(child);
      pending.push(...child.children.values());
    }
    return [...owners];
  }
  /** Insert one exact watched location into the pointer trie. */
  add(watchedPath, owner) {
    const ownerParts = owner.split("/");
    const watchedParts = watchedPath.split("/");
    for (let index = 1; index < ownerParts.length; index++) {
      if (ownerParts[index] === "*" && watchedParts[index] !== "*" && ownerParts.slice(1, index).every((part, position) => part === watchedParts[position + 1]) && watchedParts[index]) {
        watchedPath = ownerParts.slice(0, index).join("/");
        break;
      }
    }
    let current = this.root;
    for (const segment of watchedPath.split("/").filter(Boolean)) {
      let child = current.children.get(segment);
      if (!child) {
        child = { owners: [], ownerPaths: /* @__PURE__ */ new Set(), children: /* @__PURE__ */ new Map() };
        current.children.set(segment, child);
      }
      current = child;
    }
    const indexedParts = watchedPath.split("/");
    if (!current.ownerPaths.has(owner)) {
      current.ownerPaths.add(owner);
      current.owners.push({
        path: owner,
        bindable: ownerParts.every((part, index) => part !== "*" || indexedParts[index] === "*")
      });
    }
  }
};
var INDEXES = /* @__PURE__ */ new WeakMap();
var EMPTY_INDEX2 = new DependencyIndex();
Object.freeze(EMPTY_INDEX2);
var getDependencyIndex = (blueprint2) => {
  if (!blueprint2.capabilities.hasDependencies && !blueprint2.capabilities.hasExpressions)
    return EMPTY_INDEX2;
  let index = INDEXES.get(blueprint2);
  if (!index) {
    index = new DependencyIndex(blueprint2);
    INDEXES.set(blueprint2, index);
  }
  return index;
};

// packages/canard/schema-form/src/core/settle/utils/write/DirtyPathSet.ts
var DirtyPathSet = class extends Set {
  /**
   * @param childrenByParent - Scratch index cleared with this set
   */
  constructor(childrenByParent) {
    super();
    /** Ungated computation consumes live nodes only after their children. */
    this.postOrder = false;
    this.childrenByParent = childrenByParent;
  }
  /**
   * Close the scheduled frontier at the start of an ungated computation.
   * Registration must still repair ancestors of unresolved paths each round.
   * @returns Nothing; indexes each unique prefix once in first-descendant order
   */
  beginPostOrder() {
    if (this.postOrder) return;
    this.postOrder = true;
    this.childrenByParent.clear();
    const linked = /* @__PURE__ */ new Set();
    for (const path of this) {
      let current = path;
      while (current && !linked.has(current)) {
        linked.add(current);
        const slash = current.lastIndexOf("/");
        const parent = current.slice(0, slash);
        super.add(parent);
        let children = this.childrenByParent.get(parent);
        if (!children) {
          children = /* @__PURE__ */ new Map();
          this.childrenByParent.set(parent, children);
        }
        children.set(current, current.slice(slash + 1));
        current = parent;
      }
    }
  }
  add(path) {
    if (this.has(path)) return this;
    if (this.postOrder) {
      let current = path;
      while (!this.has(current)) {
        super.add(current);
        if (!current) break;
        const slash = current.lastIndexOf("/");
        const parent = current.slice(0, slash);
        let children = this.childrenByParent.get(parent);
        if (!children) {
          children = /* @__PURE__ */ new Map();
          this.childrenByParent.set(parent, children);
        }
        children.set(current, current.slice(slash + 1));
        current = parent;
      }
      return this;
    }
    super.add(path);
    let start = 1;
    while (start <= path.length) {
      const slash = path.indexOf("/", start);
      const end = slash < 0 ? path.length : slash;
      const parent = path.slice(0, start - 1);
      const name = path.slice(start, end);
      let children = this.childrenByParent.get(parent);
      if (!children) {
        children = /* @__PURE__ */ new Map();
        this.childrenByParent.set(parent, children);
      }
      children.set(path, name);
      if (slash < 0) break;
      start = slash + 1;
    }
    return this;
  }
  delete(path) {
    if (!super.delete(path)) return false;
    if (this.postOrder) {
      if (path) {
        const parent = path.slice(0, path.lastIndexOf("/"));
        const children = this.childrenByParent.get(parent);
        children?.delete(path);
        if (children?.size === 0) this.childrenByParent.delete(parent);
      }
      return true;
    }
    let start = 1;
    while (start <= path.length) {
      const slash = path.indexOf("/", start);
      const parent = path.slice(0, start - 1);
      const children = this.childrenByParent.get(parent);
      children.delete(path);
      if (children.size === 0) this.childrenByParent.delete(parent);
      if (slash < 0) break;
      start = slash + 1;
    }
    return true;
  }
  clear() {
    super.clear();
    this.childrenByParent.clear();
    this.postOrder = false;
  }
};

// packages/canard/schema-form/src/core/settle/utils/write/registerRecalculation.ts
var registerRecalculation = (context) => {
  if (!context.hasGates && context.dirtyPaths instanceof DirtyPathSet)
    context.dirtyPaths.beginPostOrder();
  const blueprint2 = context.root.runtime.blueprint;
  const dependencies = getDependencyIndex(blueprint2);
  for (const changed of context.changedRaw)
    for (const declarationPath of dependencies.affected(changed, context.root)) {
      context.dirtyPaths.add(declarationPath);
      context.dependencyOwnerPaths.add(declarationPath);
      context.shapeDirtyPaths.add(declarationPath.slice(
        0,
        declarationPath.lastIndexOf("/")
      ));
    }
  const expanded = /* @__PURE__ */ new Set();
  for (const path of context.dirtyPaths) {
    let ancestor = path;
    while (ancestor && !expanded.has(ancestor)) {
      expanded.add(ancestor);
      ancestor = ancestor.slice(0, ancestor.lastIndexOf("/"));
      context.dirtyPaths.add(ancestor);
    }
  }
  if (context.hasGates) {
    const changedAncestors = /* @__PURE__ */ new Set();
    for (const changed of context.changedRaw)
      for (let prefix = changed; prefix; ) {
        prefix = prefix.slice(0, prefix.lastIndexOf("/"));
        if (changedAncestors.has(prefix)) break;
        changedAncestors.add(prefix);
      }
    const registry = getGateRegistry(context.root.runtime);
    for (const path of context.dirtyPaths) {
      if (registry.mayChangeAt(path, context.changedRaw, changedAncestors))
        context.shapeDirtyPaths.add(path);
      if (path && registry.mayChangeOwnDeclarationAt(path, context.changedRaw, changedAncestors))
        context.shapeDirtyPaths.add(path.slice(0, path.lastIndexOf("/")));
    }
  }
};

// packages/canard/schema-form/src/core/settle/utils/write/markWrongKindAncestors.ts
var markWrongKindAncestors = (node, context) => {
  let parent = node.parent;
  while (parent) {
    if (parent.behavior.type === "object" && parent.behavior.strategy === "branch" && parent.raw !== void 0 && !isPlain(parent.raw))
      context.wrongKindHosts.add(parent);
    parent = parent.parent;
  }
};

// packages/canard/schema-form/src/core/settle/utils/write/releaseWrongKindHosts.ts
var releaseWrongKindHosts = (context) => {
  let cleared;
  do {
    cleared = false;
    const hosts = [...context.wrongKindHosts].sort(
      (left, right) => right.depth - left.depth
    );
    for (const host of hosts) {
      if (host.detached || host.raw === void 0 || isPlain(host.raw)) continue;
      if (!(host.children ?? []).some((child) => child.emit !== void 0)) continue;
      host.raw = void 0;
      context.changedRaw.add(host.path);
      context.changedNodes.add(host);
      context.dirtyPaths.add(host.path);
      context.shapeDirtyPaths.add(host.path);
      cleared = true;
    }
    if (cleared) {
      registerRecalculation(context);
      computeNode(context.root, context);
    }
  } while (cleared);
};

// packages/canard/schema-form/src/core/settle/utils/write/getSettlementScratch.ts
var getSettlementScratch = (runtime) => {
  const cached = runtime.settlementScratch;
  const dirtyChildrenByParent = cached && !cached.inUse ? cached.dirtyChildrenByParent : /* @__PURE__ */ new Map();
  const scratch = cached && !cached.inUse ? cached : {
    inUse: false,
    entered: /* @__PURE__ */ new Set(),
    revived: /* @__PURE__ */ new Set(),
    exited: /* @__PURE__ */ new Set(),
    pendingExits: /* @__PURE__ */ new Map(),
    perished: /* @__PURE__ */ new Set(),
    selectedDeclarationIds: /* @__PURE__ */ new Map(),
    writtenInputs: /* @__PURE__ */ new Map(),
    distributedInputs: /* @__PURE__ */ new Map(),
    wrongKindHosts: /* @__PURE__ */ new Set(),
    automaticLog: [],
    arrayStructureLog: [],
    arrayCounts: /* @__PURE__ */ new Map(),
    pathChanges: [],
    filledNodes: /* @__PURE__ */ new Set(),
    latentAutomaticLog: /* @__PURE__ */ new Map(),
    dirtyPaths: new DirtyPathSet(dirtyChildrenByParent),
    dirtyChildrenByParent,
    dependencyOwnerPaths: /* @__PURE__ */ new Set(),
    shapeDirtyPaths: /* @__PURE__ */ new Set(),
    changedRaw: /* @__PURE__ */ new Set(),
    explicitRaw: /* @__PURE__ */ new Set(),
    changedNodes: /* @__PURE__ */ new Set(),
    stateDirtyNodes: /* @__PURE__ */ new Set(),
    originalSchemas: /* @__PURE__ */ new Map()
  };
  if (!cached) runtime.settlementScratch = scratch;
  scratch.inUse = true;
  return scratch;
};

// packages/canard/schema-form/src/core/settle/utils/write/releaseSettlementScratch.ts
var releaseSettlementScratch = (scratch) => {
  if (scratch.entered.size) scratch.entered.clear();
  if (scratch.revived.size) scratch.revived.clear();
  if (scratch.exited.size) scratch.exited.clear();
  if (scratch.pendingExits.size) scratch.pendingExits.clear();
  if (scratch.perished.size) scratch.perished.clear();
  if (scratch.selectedDeclarationIds.size) scratch.selectedDeclarationIds.clear();
  if (scratch.writtenInputs.size) scratch.writtenInputs.clear();
  if (scratch.distributedInputs.size) scratch.distributedInputs.clear();
  if (scratch.wrongKindHosts.size) scratch.wrongKindHosts.clear();
  if (scratch.automaticLog.length) scratch.automaticLog.length = 0;
  if (scratch.arrayStructureLog.length) scratch.arrayStructureLog.length = 0;
  if (scratch.arrayCounts.size) scratch.arrayCounts.clear();
  if (scratch.pathChanges.length) scratch.pathChanges.length = 0;
  if (scratch.filledNodes.size) scratch.filledNodes.clear();
  if (scratch.latentAutomaticLog.size) scratch.latentAutomaticLog.clear();
  scratch.dirtyPaths.clear();
  if (scratch.dependencyOwnerPaths.size) scratch.dependencyOwnerPaths.clear();
  if (scratch.shapeDirtyPaths.size) scratch.shapeDirtyPaths.clear();
  if (scratch.changedRaw.size) scratch.changedRaw.clear();
  if (scratch.explicitRaw.size) scratch.explicitRaw.clear();
  if (scratch.changedNodes.size) scratch.changedNodes.clear();
  if (scratch.stateDirtyNodes.size) scratch.stateDirtyNodes.clear();
  if (scratch.originalSchemas.size) scratch.originalSchemas.clear();
  scratch.inUse = false;
};

// packages/canard/schema-form/src/core/navigation/utils/query/findNodes.ts
var import_lib21 = require("@winglet/common-utils/lib");

// packages/canard/schema-form/src/core/navigation/utils/query/utils/getSchemaNodePath.ts
var getSchemaNodePath = (pointer) => {
  if (pointer == null || pointer === "") return { absolute: false, segments: [] };
  if (typeof pointer !== "string") {
    const absolute = pointer[0] === "#";
    return { absolute, segments: absolute ? pointer.slice(1) : pointer };
  }
  if (pointer === "#") return { absolute: true, segments: [] };
  if (pointer.startsWith("#/"))
    return { absolute: true, segments: pointer.slice(2).split("/") };
  if (pointer.startsWith("/"))
    return { absolute: true, segments: pointer.slice(1).split("/") };
  return { absolute: false, segments: pointer.split("/") };
};

// packages/canard/schema-form/src/core/navigation/utils/query/findNodes.ts
var findNodes = (origin, pointer) => {
  const path = getSchemaNodePath(pointer);
  let cursors = [path.absolute ? origin.rootNode : origin];
  for (const token of path.segments) {
    const next = [];
    if (token === "@") return [];
    for (const cursor of cursors) {
      if (token === ".") {
        if (!next.includes(cursor)) next.push(cursor);
      } else if (token === "..") {
        const parent = cursor.parent;
        if (parent !== null && (!cursor.detached || parent.detached) && !next.includes(parent))
          next.push(parent);
      } else if (cursor.structure !== null) {
        if (token === "*") {
          for (const child of Object.values(cursor.structure))
            if (!next.includes(child)) next.push(child);
        } else {
          const name = token.replace(/~1/g, "/").replace(/~0/g, "~");
          if ((0, import_lib21.hasOwnProperty)(cursor.structure, name)) {
            const child = cursor.structure[name];
            if (child !== void 0 && !next.includes(child)) next.push(child);
          }
        }
      }
    }
    if (next.length === 0) return [];
    cursors = next;
  }
  return cursors;
};

// packages/canard/schema-form/src/core/navigation/utils/query/find.ts
var find = (origin, pointer) => findNodes(origin, pointer)[0] ?? null;

// packages/canard/schema-form/src/core/settle/utils/detached/hasLivePathKind.ts
var hasLivePathKind = (node) => {
  const indexed = getGateRegistry(node.runtime).hasRegisteredPathKind(
    node.path,
    node.blueprintNode.kind
  );
  if (indexed !== void 0) return indexed;
  const current = find(node.rootNode, node.path);
  return current !== null && !current.detached && current.blueprintNode.kind === node.blueprintNode.kind;
};

// packages/canard/schema-form/src/core/types/value.ts
var SetValueOption = /* @__PURE__ */ ((SetValueOption3) => {
  SetValueOption3[SetValueOption3["None"] = BIT_MASK_NONE] = "None";
  SetValueOption3[SetValueOption3["Replace"] = BIT_FLAG_00] = "Replace";
  SetValueOption3[SetValueOption3["Overwrite"] = BIT_FLAG_00] = "Overwrite";
  SetValueOption3[SetValueOption3["Merge"] = BIT_FLAG_01] = "Merge";
  SetValueOption3[SetValueOption3["DisableAutomaticWrites"] = BIT_FLAG_02] = "DisableAutomaticWrites";
  SetValueOption3[SetValueOption3["EnableAutomaticWrites"] = BIT_FLAG_03] = "EnableAutomaticWrites";
  return SetValueOption3;
})(SetValueOption || {});
var PublicSetValueOption = ((PublicSetValueOption2) => {
  PublicSetValueOption2[PublicSetValueOption2["Merge"] = SetValueOption.Merge] = "Merge";
  PublicSetValueOption2[PublicSetValueOption2["Overwrite"] = SetValueOption.Overwrite] = "Overwrite";
  return PublicSetValueOption2;
})(PublicSetValueOption || {});

// packages/canard/schema-form/src/core/settle/utils/transition/getTransitionCap.ts
var getTransitionCap = (blueprint2) => {
  return getTransitionBudgetCap(blueprint2);
};

// packages/canard/schema-form/src/core/settle/utils/compute/getVirtualReferenceIndex.ts
var REFERENCES = /* @__PURE__ */ new WeakMap();
var getVirtualReferenceIndex = (blueprint2) => {
  let index = REFERENCES.get(blueprint2);
  if (index !== void 0) return index;
  if (StaticFirstLoadCapability.has(blueprint2)) {
    REFERENCES.set(blueprint2, null);
    return null;
  }
  let hosts;
  for (const host of blueprint2.nodes) {
    let fields;
    for (const entry of host.childEntries) {
      if (entry.node.kind !== "virtual") continue;
      fields ??= /* @__PURE__ */ new Map();
      for (const field of entry.node.fields ?? []) {
        const names = fields.get(field) ?? [];
        names.push(entry.name);
        fields.set(field, names);
      }
    }
    if (fields) {
      hosts ??= /* @__PURE__ */ new Map();
      hosts.set(host, fields);
    }
  }
  index = hosts ?? null;
  REFERENCES.set(blueprint2, index);
  return index;
};

// packages/canard/schema-form/src/core/settle/utils/settlement/createSettlementContext.ts
var createSettlementContext = (node, kind, option, scratch, replaces = false) => {
  const root = node.rootNode;
  const runtime = root.runtime;
  const blueprint2 = runtime.blueprint;
  const disable = (option & SetValueOption.DisableAutomaticWrites) !== 0;
  const enable = (option & SetValueOption.EnableAutomaticWrites) !== 0;
  return {
    root,
    previousEmit: root.emit,
    previousContext: runtime.context,
    target: node,
    kind,
    option,
    hasGates: !blueprint2.capabilities.branchless && getTransitionCap(blueprint2) > 1,
    virtualReferenceIndex: StaticFirstLoadCapability.has(blueprint2) ? null : getVirtualReferenceIndex(blueprint2),
    suppressAutomaticWrites: disable || !enable && runtime.disableAutomaticWrites === true,
    loadScope: kind === "load" ? node : void 0,
    replaceScope: replaces ? node : void 0,
    entered: scratch.entered,
    revived: scratch.revived,
    exited: scratch.exited,
    pendingExits: scratch.pendingExits,
    perished: scratch.perished,
    selectedDeclarationIds: scratch.selectedDeclarationIds,
    writtenInputs: scratch.writtenInputs,
    distributedInputs: scratch.distributedInputs,
    wrongKindHosts: scratch.wrongKindHosts,
    automaticLog: scratch.automaticLog,
    arrayStructureLog: scratch.arrayStructureLog,
    arrayCounts: scratch.arrayCounts,
    pathChanges: scratch.pathChanges,
    filledNodes: scratch.filledNodes,
    inTransition: false,
    latentAutomaticLog: scratch.latentAutomaticLog,
    automatic: false,
    automaticChanged: false,
    dirtyPaths: scratch.dirtyPaths,
    dirtyChildrenByParent: scratch.dirtyChildrenByParent,
    dependencyOwnerPaths: scratch.dependencyOwnerPaths,
    shapeDirtyPaths: scratch.shapeDirtyPaths,
    changedRaw: scratch.changedRaw,
    changedNodes: scratch.changedNodes,
    stateDirtyNodes: scratch.stateDirtyNodes,
    originalSchemas: scratch.originalSchemas
  };
};

// packages/canard/schema-form/src/core/settle/utils/commit/utils/readSettlementSource.ts
var readSettlementSource = (context, path, exact = false) => {
  const origins = context.writeOrigins;
  for (let index = (origins?.length ?? 0) - 1; index >= 0; index--) {
    const origin = origins[index];
    if (origin.keys && path !== origin.path && !origin.keys.includes(path.slice(origin.path.length + 1).split("/")[0].replace(/~1/g, "/").replace(/~0/g, "~"))) continue;
    if (path === origin.path || path.startsWith(`${origin.path}/`))
      return !exact || path === origin.path ? origin.source : void 0;
  }
  return !exact || path === context.target.path ? context.source ?? context.kind : void 0;
};

// packages/canard/schema-form/src/core/settle/utils/commit/collectNonJsonPaths.ts
var import_filter56 = require("@winglet/common-utils/filter");
var collectNonJsonPaths = (value, path) => {
  const found = [];
  const active = /* @__PURE__ */ new WeakSet();
  const pending = [
    { value, path }
  ];
  while (pending.length && found.length < 8) {
    const frame = pending.pop();
    if (!frame) continue;
    if ("leave" in frame) {
      active.delete(frame.leave);
      continue;
    }
    const current = frame.value;
    const currentPath = frame.path;
    if (current === void 0 || typeof current === "function" || typeof current === "symbol" || typeof current === "bigint" || typeof current === "number" && !Number.isFinite(current)) {
      found.push(currentPath);
      continue;
    }
    if (current === null || typeof current !== "object") continue;
    if (current instanceof Date || active.has(current)) {
      found.push(currentPath);
      continue;
    }
    active.add(current);
    pending.push({ leave: current });
    if ((0, import_filter56.isArray)(current)) {
      for (let index = current.length - 1; index >= 0; index--)
        pending.push({ value: current[index], path: `${currentPath}/${index}` });
    } else {
      const keys = Object.keys(current);
      for (let index = keys.length - 1; index >= 0; index--) {
        const key = keys[index];
        pending.push({
          value: Reflect.get(current, key),
          path: `${currentPath}/${key.replace(/~/g, "~0").replace(/\//g, "~1")}`
        });
      }
    }
  }
  return found;
};

// packages/canard/schema-form/src/core/settle/utils/commit/isTypeMismatch.ts
var import_filter57 = require("@winglet/common-utils/filter");
var isTypeMismatch = (value, effective, nullable) => {
  if (value === void 0 || effective === "virtual") return false;
  if (value === null) return !nullable;
  const kinds = typeof effective === "string" ? [effective] : effective;
  return !kinds.some((kind) => {
    switch (kind) {
      case "string":
        return typeof value === "string";
      case "boolean":
        return typeof value === "boolean";
      case "integer":
        return typeof value === "number" && Number.isInteger(value);
      case "number":
        return typeof value === "number" && Number.isFinite(value);
      case "array":
        return (0, import_filter57.isArray)(value);
      case "object":
        return value !== null && typeof value === "object" && !(0, import_filter57.isArray)(value);
      case "null":
        return false;
    }
  });
};

// packages/canard/schema-form/src/core/settle/utils/commit/conversionCandidates.ts
var conversionCandidates = (node, effective) => {
  const kinds = typeof effective === "string" ? [effective] : effective;
  const candidates = [];
  for (const kind of kinds) {
    if (kind === "null" || kind === "virtual") continue;
    const converted = node.behavior.interpret(
      node.raw,
      { kinds: kind, mask: 0, nullable: node.nullable }
    );
    if (!Object.is(converted, node.raw) && !isTypeMismatch(converted, kind, node.nullable))
      candidates.push(kind);
  }
  return candidates;
};

// packages/canard/schema-form/src/core/settle/utils/commit/effectiveType.ts
var import_filter58 = require("@winglet/common-utils/filter");
var effectiveType = (node) => {
  const schema = node.schema.schema;
  const candidate = typeof schema === "object" && schema !== null ? schema.type : void 0;
  if (typeof candidate === "string" && isTypeName(candidate)) return candidate;
  if ((0, import_filter58.isArray)(candidate) && candidate.every(isTypeName))
    return candidate;
  return node.schemaType;
};
function isTypeName(value) {
  return value === "string" || value === "number" || value === "integer" || value === "boolean" || value === "null" || value === "object" || value === "array";
}

// packages/canard/schema-form/src/core/settle/utils/commit/receivedType.ts
var import_filter59 = require("@winglet/common-utils/filter");
var receivedType = (value) => {
  if (value === null) return "null";
  if (typeof value === "number")
    return !Number.isFinite(value) ? "nonFinite" : Number.isInteger(value) ? "integer" : "number";
  if (typeof value === "string") return "string";
  if (typeof value === "boolean") return "boolean";
  if ((0, import_filter59.isArray)(value)) return "array";
  if (typeof value === "object") return "object";
  return "other";
};

// packages/canard/schema-form/src/core/settle/utils/detached/emptyDetachedReads.ts
var EMPTY_PATHS = Object.freeze([]);
var EMPTY_VALUES = Object.freeze([]);

// packages/canard/schema-form/src/core/settle/utils/commit/updateInactiveValuesMemo.ts
var import_filter60 = require("@winglet/common-utils/filter");
var compareOrder = (left, right) => {
  for (let index = 0; index < Math.min(left.length, right.length); index++) {
    const difference = left[index] - right[index];
    if (difference) return difference;
  }
  return left.length - right.length;
};
var updateInactiveValuesMemo = (root) => {
  const runtime = root.runtime;
  if (!runtime.latentRawDirty && runtime.inactiveValuesMemo.has("")) return;
  const metadata = runtime.latentRawMetadata;
  const entries = runtime.inactiveValueEntries ??= new PathKeyedMap("pair");
  const changedPaths = [];
  const candidates = /* @__PURE__ */ new Map();
  for (const [key, source] of runtime.latentRaw) {
    const info = metadata?.get(key);
    if (!info || find(root, info.path)) continue;
    const template = info.blueprintNode;
    const value = template.strategy === "terminal" ? source : source instanceof HostLatent && source.raw !== void 0 && (template.kind === "array" && template.strategy === "branch" && (0, import_filter60.isArray)(source.raw) || isTypeMismatch(source.raw, template.schemaType, template.nullable)) ? source.raw : void 0;
    if (value !== void 0)
      candidates.set(key, { path: info.path, value, order: info.order });
  }
  const chosen = /* @__PURE__ */ new Map();
  for (const [key, candidate] of candidates) {
    const held = candidates.get(chosen.get(candidate.path) ?? "");
    if (!held || compareOrder(candidate.order, held.order) < 0)
      chosen.set(candidate.path, key);
  }
  for (const [key, candidate] of candidates)
    if (chosen.get(candidate.path) !== key) candidates.delete(key);
  for (const [key, candidate] of candidates) {
    const previous = entries.get(key);
    if (previous && Object.is(previous.value, candidate.value) && compareOrder(previous.order, candidate.order) === 0) continue;
    entries.set(key, {
      value: candidate.value,
      order: candidate.order,
      entry: previous && Object.is(previous.value, candidate.value) ? previous.entry : Object.freeze({ path: candidate.path, value: candidate.value })
    });
    changedPaths.push(candidate.path);
  }
  for (const [key, previous] of entries)
    if (!candidates.has(key)) {
      entries.delete(key);
      changedPaths.push(previous.entry.path);
    }
  if (metadata) {
    for (const key of metadata.keys())
      if (!runtime.latentRaw.has(key)) metadata.delete(key);
  }
  runtime.inactiveValueEntries = entries;
  runtime.latentRawDirty = false;
  if (changedPaths.length === 0 && runtime.inactiveValuesMemo.has("")) return;
  const ordered = [...entries.values()].sort((left, right) => compareOrder(left.order, right.order) || (left.entry.path < right.entry.path ? -1 : left.entry.path > right.entry.path ? 1 : 0));
  const affected = /* @__PURE__ */ new Set([""]);
  for (const path of changedPaths) {
    let ancestor = path;
    while (ancestor) {
      affected.add(ancestor);
      ancestor = ancestor.slice(0, ancestor.lastIndexOf("/"));
    }
  }
  const entriesByHost = /* @__PURE__ */ new Map();
  for (const { entry } of ordered) {
    let ancestor = entry.path;
    while (true) {
      if (affected.has(ancestor)) {
        const descendants = entriesByHost.get(ancestor) ?? [];
        descendants.push(entry);
        entriesByHost.set(ancestor, descendants);
      }
      if (!ancestor) break;
      ancestor = ancestor.slice(0, ancestor.lastIndexOf("/"));
    }
  }
  for (const host of affected) {
    const next = entriesByHost.get(host) ?? [];
    const previous = runtime.inactiveValuesMemo.get(host);
    if (previous && previous.length === next.length && previous.every((entry, index) => entry === next[index])) continue;
    if (next.length) runtime.inactiveValuesMemo.set(host, Object.freeze(next));
    else if (!host) runtime.inactiveValuesMemo.set("", EMPTY_VALUES);
    else runtime.inactiveValuesMemo.delete(host);
  }
};

// packages/canard/schema-form/src/core/settle/utils/derivation/getDeriveState.ts
var getDeriveState = (context) => {
  if (context.deriveState) return context.deriveState;
  if (getDeriveRuleTable(context.root.runtime.blueprint).rules.length === 0)
    return void 0;
  const state = {
    root: context.root,
    selectedDeclarationIds: context.selectedDeclarationIds,
    committedRuleValues: context.root.runtime.committedRuleValues ?? /* @__PURE__ */ new Map(),
    consumedRuleValues: /* @__PURE__ */ new Map(),
    activeRuleKeys: /* @__PURE__ */ new Set(),
    activeRuleKeysBySource: /* @__PURE__ */ new Map(),
    activeUnsetTargets: /* @__PURE__ */ new Set(),
    appliedRanks: /* @__PURE__ */ new Map(),
    visitedSourcePaths: /* @__PURE__ */ new Set(),
    loadScope: context.loadScope,
    entered: context.entered,
    revived: context.revived,
    suppressAutomaticWrites: context.suppressAutomaticWrites,
    trace: false
  };
  context.deriveState = state;
  return state;
};

// packages/canard/schema-form/src/core/settle/utils/walkOwnedSchemaNodes.ts
var walkOwnedSchemaNodes = (origin, visit) => {
  const pending = [origin];
  while (pending.length > 0) {
    const node = pending.pop();
    if (!node) continue;
    visit(node);
    const children = node.children ?? [];
    for (let index = children.length - 1; index >= 0; index--)
      if (children[index].parent === node) pending.push(children[index]);
  }
};

// packages/canard/schema-form/src/core/settle/utils/commit/pruneCommittedRuleKeys.ts
var import_filter62 = require("@winglet/common-utils/filter");

// packages/canard/schema-form/src/core/settle/utils/commit/updateCommittedRuleValue.ts
var import_filter61 = require("@winglet/common-utils/filter");
var updateCommittedRuleValue = (runtime, key, operation, value) => {
  if (operation === "delete" && !runtime.committedRuleValues?.has(key)) return;
  const parts = JSON.parse(key);
  if (!(0, import_filter61.isArray)(parts) || typeof parts[0] !== "string") return;
  const source = parts[0];
  const target = typeof parts[5] === "string" ? parts[5] : void 0;
  if (operation === "delete") {
    runtime.committedRuleValues?.delete(key);
    const sourceKeys2 = runtime.committedRuleKeysBySource?.get(source);
    sourceKeys2?.delete(key);
    if (sourceKeys2?.size === 0) runtime.committedRuleKeysBySource?.delete(source);
    if (target !== void 0) {
      const targetKeys2 = runtime.committedRuleKeysByTarget?.get(target);
      targetKeys2?.delete(key);
      if (targetKeys2?.size === 0) runtime.committedRuleKeysByTarget?.delete(target);
    }
    return;
  }
  (runtime.committedRuleValues ??= new PathKeyedMap("rule")).set(key, value);
  let sourceKeys = runtime.committedRuleKeysBySource?.get(source);
  if (!sourceKeys) {
    sourceKeys = /* @__PURE__ */ new Set();
    (runtime.committedRuleKeysBySource ??= /* @__PURE__ */ new Map()).set(source, sourceKeys);
  }
  sourceKeys.add(key);
  if (target === void 0) return;
  let targetKeys = runtime.committedRuleKeysByTarget?.get(target);
  if (!targetKeys) {
    targetKeys = /* @__PURE__ */ new Set();
    (runtime.committedRuleKeysByTarget ??= /* @__PURE__ */ new Map()).set(target, targetKeys);
  }
  targetKeys.add(key);
};

// packages/canard/schema-form/src/core/settle/utils/commit/pruneCommittedRuleKeys.ts
var pruneCommittedRuleKeys = (runtime, path, scope) => {
  for (const key of runtime.committedRuleKeysBySource?.get(path) ?? []) {
    if (scope === "exitPolicy") {
      const parts = JSON.parse(key);
      if (!(0, import_filter62.isArray)(parts) || typeof parts[3] !== "string" || !parts[3].endsWith("/unsetOnInactive")) continue;
    }
    updateCommittedRuleValue(runtime, key, "delete");
  }
  if (scope !== "occurrence") return;
  for (const key of runtime.committedRuleKeysByTarget?.get(path) ?? [])
    updateCommittedRuleValue(runtime, key, "delete");
};

// packages/canard/schema-form/src/core/settle/utils/commit/commitDeriveRules.ts
var commitDeriveRules = (context) => {
  const state = getDeriveState(context);
  if (!state) return;
  const decision = evaluateResetInteraction(context.root, state);
  if (state.trace && decision.trace.length)
    (context.traceRounds ??= []).push([...decision.trace]);
  for (const failure of decision.failures) {
    recordSettlementFailure(context, new SchemaFormError(
      EXPRESSION_THREW,
      `Reset interaction expression failed at ${failure.schemaPath}`,
      {
        path: failure.sourcePath,
        schemaPath: failure.schemaPath,
        cause: failure.cause
      }
    ), "expression");
  }
  for (const node of decision.nodes) {
    node.interactionReset += 1;
    const previous = node.interactionState;
    node.interactionState = captureSchemaNodeChange(
      node,
      "interactionState",
      shallowPatch(node.interactionState, {
        [SchemaNodeState.Dirty]: false,
        [SchemaNodeState.Touched]: false
      })
    );
    if (node.interactionState !== previous) context.changedNodes.add(node);
  }
  const runtime = context.root.runtime;
  for (const path of state.visitedSourcePaths)
    pruneCommittedRuleKeys(runtime, path, "source");
  for (const exited of context.exited)
    walkOwnedSchemaNodes(exited, (node) => pruneCommittedRuleKeys(runtime, node.path, "occurrence"));
  for (const key of state.activeRuleKeys)
    if (state.consumedRuleValues.has(key))
      updateCommittedRuleValue(
        runtime,
        key,
        "set",
        state.consumedRuleValues.get(key)
      );
};

// packages/canard/schema-form/src/core/settle/utils/commit/commitExitPolicyValues.ts
var import_filter64 = require("@winglet/common-utils/filter");
var import_lib23 = require("@winglet/common-utils/lib");

// packages/canard/schema-form/src/core/settle/utils/controls/getControlLayers.ts
var import_filter63 = require("@winglet/common-utils/filter");
var DECLARATION_IDS = /* @__PURE__ */ new WeakMap();
var declarationIds = (node) => {
  let ids = DECLARATION_IDS.get(node);
  if (!ids) {
    const collected = [];
    for (let index = 0; index < node.declarations.length; index++)
      collected.push(node.declarations[index].id);
    ids = Object.freeze(collected);
    DECLARATION_IDS.set(node, ids);
  }
  return ids;
};
var getControlLayers = (node, selectedDeclarationIds) => {
  const selected = (current) => selectedDeclarationIds.get(current) ?? current.runtime.committedDeclarationIds?.get(getCommittedDeclarationKey(current)) ?? declarationIds(current.blueprintNode);
  const nodeIds = selected(node);
  const groups = [];
  const declarations = node.blueprintNode.declarations;
  for (let index = 0; index < declarations.length; index++) {
    const declaration = declarations[index];
    if (!nodeIds.includes(declaration.id) || declaration.scope !== "node" || !declaration.schema || typeof declaration.schema !== "object") continue;
    const controls = Reflect.get(declaration.schema, "controls");
    if (controls && typeof controls === "object" && !(0, import_filter63.isArray)(controls))
      groups.push({
        layer: "node",
        declarationId: declaration.id,
        schemaPath: `${declaration.schemaPath}/controls`,
        controls,
        host: node
      });
  }
  const parent = node.parent;
  if (!parent) return groups;
  const parentIds = selected(parent);
  const parentDeclarations = parent.blueprintNode.declarations;
  for (let index = 0; index < parentDeclarations.length; index++) {
    const declaration = parentDeclarations[index];
    if (!parentIds.includes(declaration.id) || !declaration.schema || typeof declaration.schema !== "object") continue;
    const controls = Reflect.get(declaration.schema, "controls");
    if (!controls || typeof controls !== "object" || (0, import_filter63.isArray)(controls)) continue;
    let ownsFragment = false;
    if (declaration.scope === "fragment")
      for (let childIndex = 0; childIndex < declarations.length; childIndex++) {
        const child = declarations[childIndex];
        if (nodeIds.includes(child.id) && (child.schemaPath.startsWith(`${declaration.schemaPath}/properties/`) || child.schemaPath.startsWith(`${declaration.schemaPath}/items/`) || child.schemaPath.startsWith(`${declaration.schemaPath}/prefixItems/`))) {
          ownsFragment = true;
          break;
        }
      }
    if (ownsFragment)
      groups.push({
        layer: "fragment",
        declarationId: declaration.id,
        schemaPath: `${declaration.schemaPath}/controls`,
        controls,
        host: parent
      });
    const children = Reflect.get(controls, "children");
    if (!(0, import_filter63.isArray)(children)) continue;
    for (let index2 = 0; index2 < children.length; index2++) {
      const item = children[index2];
      if (!item || typeof item !== "object") continue;
      const targets = Reflect.get(item, "targets");
      if (!(0, import_filter63.isArray)(targets) || !targets.includes(node.name)) continue;
      const itemControls = Reflect.get(item, "controls");
      if (itemControls && typeof itemControls === "object" && !(0, import_filter63.isArray)(itemControls))
        groups.push({
          layer: "children",
          declarationId: declaration.id,
          schemaPath: `${declaration.schemaPath}/controls/children/${index2}/controls`,
          controls: itemControls,
          host: parent
        });
    }
  }
  return groups;
};

// packages/canard/schema-form/src/core/settle/utils/controls/getExitPolicyKey.ts
var getExitPolicyKey = (group) => JSON.stringify([
  group.host.path,
  group.host.blueprintNode.kind,
  group.declarationId,
  `${group.schemaPath}/unsetOnInactive`,
  void 0
]);

// packages/canard/schema-form/src/core/settle/utils/controls/readStateDependency.ts
var import_lib22 = require("@winglet/common-utils/lib");
var import_pointer21 = require("@winglet/json/pointer");
var readStateDependency = (root, hostPath, dependency, snapshot) => {
  const path = resolveDependencyPath(hostPath, dependency);
  if (path === "@") return (snapshot ? snapshot.context : root.runtime.context) ?? {};
  let value = snapshot ? snapshot.emit : root.emit;
  for (const encoded of path.split("/").slice(1)) {
    if (value === null || typeof value !== "object") return void 0;
    const name = (0, import_pointer21.unescapeSegment)(encoded);
    if (!(0, import_lib22.hasOwnProperty)(value, name)) return void 0;
    value = Reflect.get(value, name);
  }
  return value;
};

// packages/canard/schema-form/src/core/settle/utils/commit/commitExitPolicyValues.ts
var EXIT_EXPRESSIONS = /* @__PURE__ */ new WeakMap();
var getExitExpressions = (blueprint2) => {
  let indexed = EXIT_EXPRESSIONS.get(blueprint2);
  if (indexed) return indexed;
  indexed = new Map(blueprint2.expressions.filter((expression) => expression.key === "unsetOnInactive").map((expression) => [JSON.stringify([expression.declarationId, expression.schemaPath]), expression]));
  EXIT_EXPRESSIONS.set(blueprint2, indexed);
  return indexed;
};
var commitExitPolicyValues = (context) => {
  const expressions = getExitExpressions(context.root.runtime.blueprint);
  if (expressions.size === 0) return;
  const runtime = context.root.runtime;
  for (const exited of context.exited)
    walkOwnedSchemaNodes(exited, (node) => pruneCommittedRuleKeys(runtime, node.path, "exitPolicy"));
  if (context.kind === "load" && context.loadScope)
    walkOwnedSchemaNodes(context.loadScope, (node) => pruneCommittedRuleKeys(runtime, node.path, "exitPolicy"));
  const candidates = new Set(context.stateDirtyNodes);
  for (const source of context.stateDirtyNodes) {
    if (source.detached || !source.structure) continue;
    if (context.kind !== "load" && !context.dependencyOwnerPaths.has(source.path) && !context.shapeDirtyPaths.has(source.path)) continue;
    const sourceKey = JSON.stringify([source.path, source.blueprintNode.kind]);
    const selected = context.selectedDeclarationIds.get(source) ?? source.runtime.committedDeclarationIds?.get(sourceKey);
    for (const declaration of source.blueprintNode.declarations) {
      if (selected && !selected.includes(declaration.id)) continue;
      const schema = declaration.schema;
      if (!schema || typeof schema !== "object") continue;
      const controls = Reflect.get(schema, "controls");
      if (!controls || typeof controls !== "object" || (0, import_filter64.isArray)(controls)) continue;
      if (declaration.scope === "fragment" && typeof Reflect.get(controls, "unsetOnInactive") === "string")
        for (const child of source.children ?? []) {
          if (!getControlLayers(child, context.selectedDeclarationIds).some((group) => group.layer === "fragment" && group.host === source && group.declarationId === declaration.id)) continue;
          candidates.add(child);
          break;
        }
      const children = Reflect.get(controls, "children");
      if (!(0, import_filter64.isArray)(children)) continue;
      for (const item of children) {
        if (!item || typeof item !== "object") continue;
        const itemControls = Reflect.get(item, "controls");
        if (!itemControls || typeof itemControls !== "object" || typeof Reflect.get(itemControls, "unsetOnInactive") !== "string") continue;
        const targets = Reflect.get(item, "targets");
        if (!(0, import_filter64.isArray)(targets)) continue;
        for (const name of targets) {
          if (typeof name !== "string" || !(0, import_lib23.hasOwnProperty)(source.structure, name))
            continue;
          candidates.add(source.structure[name]);
          break;
        }
      }
    }
  }
  const evaluated = /* @__PURE__ */ new Set();
  for (const node of candidates) {
    if (node.detached) continue;
    for (const group of getControlLayers(node, context.selectedDeclarationIds)) {
      if (!(0, import_lib23.hasOwnProperty)(group.controls, "unsetOnInactive") || typeof Reflect.get(group.controls, "unsetOnInactive") !== "string") continue;
      const schemaPath = `${group.schemaPath}/unsetOnInactive`;
      const key = getExitPolicyKey(group);
      if (evaluated.has(key)) continue;
      evaluated.add(key);
      const expression = expressions.get(JSON.stringify([
        group.declarationId,
        schemaPath
      ]));
      if (!expression) continue;
      try {
        updateCommittedRuleValue(runtime, key, "set", Boolean(
          expression.evaluate(expression.dependencies.map(
            (dependency) => readStateDependency(
              context.root,
              group.host.path,
              dependency
            )
          ))
        ));
      } catch (cause) {
        updateCommittedRuleValue(runtime, key, "set", false);
        recordSettlementFailure(context, new SchemaFormError(
          EXPRESSION_THREW,
          `Exit policy expression failed at ${schemaPath}`,
          { path: group.host.path, schemaPath, cause }
        ), "expression");
      }
    }
  }
};

// packages/canard/schema-form/src/core/settle/utils/commit/snapshotExitedPolicies.ts
var import_lib25 = require("@winglet/common-utils/lib");

// packages/canard/schema-form/src/core/settle/utils/controls/readExitLayerPolicy.ts
var import_lib24 = require("@winglet/common-utils/lib");
var EXIT_LAYERS = ["node", "children", "fragment"];
var readExitLayerPolicy = (groups, committedRuleValues, inherited) => {
  for (const layer of EXIT_LAYERS) {
    let declared = false;
    let keep = false;
    for (const group of groups) {
      if (group.layer !== layer || !(0, import_lib24.hasOwnProperty)(group.controls, "unsetOnInactive")) continue;
      declared = true;
      const literal = Reflect.get(group.controls, "unsetOnInactive");
      const key = getExitPolicyKey(group);
      const value = typeof literal === "string" ? committedRuleValues?.get(key) : literal;
      if (value !== true) keep = true;
    }
    if (declared) return !keep;
  }
  return inherited;
};

// packages/canard/schema-form/src/core/settle/utils/commit/snapshotExitedPolicies.ts
var snapshotExitedPolicies = (context) => {
  const runtime = context.root.runtime;
  for (const exited of context.exited)
    walkOwnedSchemaNodes(exited, (node) => {
      const key = JSON.stringify([node.path, node.blueprintNode.kind]);
      if (!runtime.latentRaw.has(key)) return;
      const metadata = runtime.latentRawMetadata?.get(key);
      if (!metadata) return;
      const exitLayers = getControlLayers(node, /* @__PURE__ */ new Map()).filter((group) => (0, import_lib25.hasOwnProperty)(group.controls, "unsetOnInactive")).map((group) => ({
        layer: group.layer,
        clear: readExitLayerPolicy([group], runtime.committedRuleValues, false)
      }));
      runtime.latentRawMetadata?.set(key, { ...metadata, exitLayers });
      context.latentDescendantKeys = void 0;
    });
};

// packages/canard/schema-form/src/core/settle/utils/commit/finalizeDeriveTrace.ts
var import_lib26 = require("@winglet/common-utils/lib");
var import_pointer22 = require("@winglet/json/pointer");
var finalizeDeriveTrace = (context) => {
  if (!context.traceRounds?.length) return;
  const live = /* @__PURE__ */ new Map();
  for (const round of context.traceRounds)
    for (let index = 0; index < round.length; index++) {
      const entry = round[index];
      if (entry.result !== "applied") continue;
      let exists = live.get(entry.targetPath);
      if (exists === void 0) {
        let node = context.root;
        for (const encoded of entry.targetPath.split("/").slice(1)) {
          const name = (0, import_pointer22.unescapeSegment)(encoded);
          const children = node?.structure ?? null;
          node = children && (0, import_lib26.hasOwnProperty)(children, name) ? children[name] : void 0;
          if (!node) break;
        }
        exists = Boolean(node && !node.detached);
        live.set(entry.targetPath, exists);
      }
      if (!exists)
        round[index] = { ...entry, result: "withdrawn" };
    }
};

// packages/canard/schema-form/src/core/settle/utils/controls/readSchemaNodeWatchValues.ts
var import_filter65 = require("@winglet/common-utils/filter");
var EMPTY_WATCH_VALUES = Object.freeze([]);
var readSchemaNodeWatchValues = (node, snapshot) => {
  const runtime = node.runtime;
  const commit = runtime.commitNumber ?? 0;
  const memo = runtime.watchValuesMemo?.get(node);
  if (!snapshot && memo && (node.detached || memo.commit === commit)) return memo.values;
  if (node.detached) return EMPTY_WATCH_VALUES;
  const schema = snapshot?.schema ?? node.schema.schema;
  const controls = typeof schema === "object" ? schema.controls : void 0;
  const watch = controls && typeof controls === "object" ? Reflect.get(controls, "watch") : void 0;
  const paths = (0, import_filter65.isArray)(watch) ? watch : [];
  const values = paths.length ? Object.freeze(paths.map((path) => typeof path === "string" ? readStateDependency(
    node.rootNode,
    node.path,
    path,
    snapshot
  ) : void 0)) : EMPTY_WATCH_VALUES;
  const cache = runtime.watchValuesMemo ?? /* @__PURE__ */ new WeakMap();
  cache.set(node, { commit, values });
  runtime.watchValuesMemo = cache;
  return values;
};

// packages/canard/schema-form/src/core/settle/utils/commit/utils/createWatchDeliveryIndex.ts
var WatchDeliveryIndex = class {
  constructor() {
    /** Every node with at least one effective watch path. */
    this.allNodes = /* @__PURE__ */ new Set();
    /** Nodes watching the tree context reference. */
    this.contextNodes = /* @__PURE__ */ new Set();
    /** Resolved paths retained for each live watcher. */
    this.pathsByNode = /* @__PURE__ */ new Map();
    /** Root of the resolved path prefix tree. */
    this.root = {
      watchers: /* @__PURE__ */ new Set(),
      children: /* @__PURE__ */ new Map()
    };
  }
  /** Replace one node's effective watch paths in the live index. */
  update(node, paths) {
    const previous = this.pathsByNode.get(node);
    if (previous?.length === paths.length && previous.every((path, index) => path === paths[index])) return;
    this.remove(node);
    const unique = [];
    for (const path of paths) if (!unique.includes(path)) unique.push(path);
    if (unique.length === 0) return;
    this.pathsByNode.set(node, unique);
    this.allNodes.add(node);
    for (const path of unique) {
      if (path === "@") {
        this.contextNodes.add(node);
        continue;
      }
      let current = this.root;
      for (const segment of path.split("/").filter(Boolean)) {
        let child = current.children.get(segment);
        if (!child) {
          child = { watchers: /* @__PURE__ */ new Set(), children: /* @__PURE__ */ new Map() };
          current.children.set(segment, child);
        }
        current = child;
      }
      current.watchers.add(node);
    }
  }
  /** Remove a detached or no longer watching node and prune empty paths. */
  remove(node) {
    const paths = this.pathsByNode.get(node);
    if (!paths) return;
    this.pathsByNode.delete(node);
    this.allNodes.delete(node);
    this.contextNodes.delete(node);
    for (const path of paths) {
      if (path === "@") continue;
      const segments = path.split("/").filter(Boolean);
      const parents = [this.root];
      for (const segment of segments) {
        const child = parents[parents.length - 1].children.get(segment);
        if (!child) break;
        parents.push(child);
      }
      if (parents.length !== segments.length + 1) continue;
      parents[parents.length - 1].watchers.delete(node);
      for (let index = segments.length - 1; index >= 0; index--) {
        const child = parents[index + 1];
        if (child.watchers.size || child.children.size) break;
        parents[index].children.delete(segments[index]);
      }
    }
  }
  /** Add watchers whose paths contain or descend from a changed path. */
  affected(path, candidates) {
    let current = this.root;
    for (const watcher of current.watchers) candidates.add(watcher);
    for (const segment of path.split("/").filter(Boolean)) {
      current = current.children.get(segment);
      if (!current) return;
      for (const watcher of current.watchers) candidates.add(watcher);
    }
    const pending = [...current.children.values()];
    while (pending.length) {
      const child = pending.pop();
      if (!child) continue;
      for (const watcher of child.watchers) candidates.add(watcher);
      for (const next of child.children.values()) pending.push(next);
    }
  }
};
var createWatchDeliveryIndex = () => new WatchDeliveryIndex();

// packages/canard/schema-form/src/core/settle/utils/commit/commitGlobalState.ts
var import_lib27 = require("@winglet/common-utils/lib");
var commitGlobalState = (context) => {
  const runtime = context.root.runtime;
  const hadGlobalState = runtime.globalStateCounts.size > 0;
  const deltas = /* @__PURE__ */ new Map();
  const departing = /* @__PURE__ */ new Set();
  const pending = [...context.exited];
  for (const node of context.perished) if (node.detached) pending.push(node);
  while (pending.length) {
    const node = pending.pop();
    if (!node || departing.has(node)) continue;
    departing.add(node);
    for (const child of node.children ?? []) pending.push(child);
  }
  const nodes = new Set(departing);
  for (const node of context.entered) nodes.add(node);
  for (const node of context.changedNodes) nodes.add(node);
  for (const node of context.stateDirtyNodes) nodes.add(node);
  if (context.kind === "load" && context.loadScope && !context.loadScope.detached) {
    const pending2 = [context.loadScope];
    const visited = /* @__PURE__ */ new Set();
    while (pending2.length) {
      const node = pending2.pop();
      if (!node || node.detached || visited.has(node)) continue;
      visited.add(node);
      nodes.add(node);
      for (const child of node.children ?? []) pending2.push(child);
    }
  }
  return {
    nodes,
    visit(node) {
      const previousState = node.deliveryChanges & 8 /* UpdateState */ ? node.deliveryPreviousState ?? node.interactionState : node.interactionState;
      if (departing.has(node)) {
        if (!context.entered.has(node) || node.deliveryInitialized)
          accumulateGlobalStateDeltas(
            deltas,
            previousState,
            {}
          );
        if (node.detached) return;
      }
      if (node.detached) return;
      if (context.entered.has(node)) {
        accumulateGlobalStateDeltas(
          deltas,
          node.deliveryInitialized ? previousState : {},
          node.interactionState
        );
        return;
      }
      if (!nodes.has(node)) return;
      if (!hadGlobalState) {
        for (const key in node.interactionState)
          if ((0, import_lib27.hasOwnProperty)(node.interactionState, key) && node.interactionState[key])
            deltas.set(key, (deltas.get(key) ?? 0) + 1);
        return;
      }
      const previous = previousState;
      if (previous !== node.interactionState)
        accumulateGlobalStateDeltas(deltas, previous, node.interactionState);
    },
    finish() {
      publishGlobalStateDeltas(context.root, deltas);
    }
  };
};

// packages/canard/schema-form/src/core/settle/utils/commit/utils/getWatchDeliveryPaths.ts
var import_filter66 = require("@winglet/common-utils/filter");
var getWatchDeliveryPaths = (node) => {
  const schema = node.schema.schema;
  const controls = typeof schema === "object" ? schema.controls : void 0;
  const watch = controls && typeof controls === "object" ? Reflect.get(controls, "watch") : void 0;
  if (!(0, import_filter66.isArray)(watch)) return [];
  const paths = [];
  for (const path of watch)
    if (typeof path === "string")
      paths.push(resolveDependencyPath(node.path, path));
  return paths;
};

// packages/canard/schema-form/src/core/settle/utils/commit/utils/isSameDeliveryValue.ts
var isSameDeliveryValue = (previous, current) => previous === current || Number.isNaN(previous) && Number.isNaN(current);

// packages/canard/schema-form/src/core/settle/utils/commit/markCommitDeliveries.ts
var import_filter67 = require("@winglet/common-utils/filter");
var DEVELOPMENT = false;
var EMPTY_WATCH_VALUES2 = Object.freeze([]);
var markCommitDeliveries = (context, visit) => {
  const runtime = context.root.runtime;
  const refreshTargets = runtime.refreshTargets;
  const loadScope = context.kind === "load" ? context.loadScope : void 0;
  const loadPrefix = loadScope ? `${loadScope.path}/` : "";
  const automaticNodes = /* @__PURE__ */ new Set();
  for (let index = 0; index < context.automaticLog.length; index++)
    automaticNodes.add(context.automaticLog[index].node);
  const watchIndex = runtime.deliveryWatchIndex;
  const watchNodes = getFeatureNodeIndex(runtime.blueprint).watchNodes;
  const fullWatchScan = context.exited.size > 0;
  let affectedPaths;
  if (watchIndex?.allNodes.size && !fullWatchScan) {
    affectedPaths = runtime.deliveryAffectedPaths ?? /* @__PURE__ */ new Set();
    for (const node of context.entered) affectedPaths.add(node.path);
    for (const node of context.perished)
      affectedPaths.add(node.deliveryPreviousPath ?? node.path);
    for (const change of context.pathChanges) {
      affectedPaths.add(change.previous);
      affectedPaths.add(change.current);
    }
    for (const path of affectedPaths) {
      let ancestor = path;
      while (ancestor) {
        ancestor = ancestor.slice(0, ancestor.lastIndexOf("/"));
        if (!context.changedRaw.has(ancestor)) affectedPaths.delete(ancestor);
      }
    }
  }
  const candidates = /* @__PURE__ */ new Set();
  for (const host of context.changedNodes) {
    if (host.detached || host.blueprintNode.kind !== "object" || !host.children)
      continue;
    if (host.deliveryInitialized && host.deliveryPreviousSchema === void 0 && !(host.deliveryChanges & 128 /* UpdateChildren */)) continue;
    const schema = host.schema.schema;
    const required = typeof schema === "object" ? schema.required : void 0;
    for (let index = 0; index < host.children.length; index++) {
      const child = host.children[index];
      if (child.parent !== host || child.blueprintNode.kind === "virtual") continue;
      const next = (0, import_filter67.isArray)(required) && required.includes(child.name);
      if (child.required === next) continue;
      child.required = next;
      candidates.add(child);
      if (child.deliveryInitialized)
        markSchemaNodeEvent(child, 256 /* UpdateComputedProperties */);
    }
  }
  for (const node of context.changedNodes) candidates.add(node);
  for (const node of context.entered) candidates.add(node);
  for (const node of context.stateDirtyNodes) candidates.add(node);
  candidates.add(context.root);
  for (const change of context.pathChanges) candidates.add(change.node);
  if (watchIndex) {
    if (fullWatchScan)
      for (const watcher of watchIndex.allNodes) candidates.add(watcher);
    else if (runtime.deliveredContext !== runtime.context)
      for (const watcher of watchIndex.contextNodes) candidates.add(watcher);
    if (affectedPaths)
      for (const path of affectedPaths) watchIndex.affected(path, candidates);
  }
  const isTreeNode = (value) => value !== null && typeof value === "object" && Reflect.get(value, "runtime") === runtime;
  const mark = (node, bit, payload, options) => {
    markSchemaNodeEvent(node, bit, payload, options);
  };
  for (const node of runtime.revisionNodes ?? []) candidates.add(node);
  if (runtime.deliveredDiagnostics && runtime.deliveredDiagnostics !== runtime.diagnostics)
    mark(context.root, 65536 /* UpdateDiagnostics */);
  runtime.deliveredDiagnostics = runtime.diagnostics;
  const globalState = commitGlobalState(context);
  const ordered = new Set(globalState.nodes);
  for (const node of candidates) ordered.add(node);
  for (const candidate of ordered) {
    if (!isTreeNode(candidate)) continue;
    const node = candidate;
    visit?.(node);
    globalState.visit(node);
    if (!candidates.has(node)) {
      clearSchemaNodeChanges(node);
      continue;
    }
    if (node.detached) {
      clearSchemaNodeChanges(node);
      node.deliveryWatchValues = void 0;
      watchIndex?.remove(node);
      continue;
    }
    const initialized = node.deliveryInitialized;
    const changes = node.deliveryChanges;
    const previousWatchValues = node.deliveryWatchValues ?? EMPTY_WATCH_VALUES2;
    const pending = node.pendingDelivery?.payload;
    const hasWatch = watchNodes.has(node.blueprintNode.id);
    const watched = hasWatch ? readSchemaNodeWatchValues(node) : EMPTY_WATCH_VALUES2;
    if (hasWatch) {
      if (watched.length) {
        const index = runtime.deliveryWatchIndex ??= createWatchDeliveryIndex();
        index.update(node, getWatchDeliveryPaths(node));
      } else runtime.deliveryWatchIndex?.remove(node);
    }
    let watchChanged = initialized && watched.length !== previousWatchValues.length;
    for (let index = 0; initialized && !watchChanged && index < watched.length; index++)
      if (!isSameDeliveryValue(watched[index], previousWatchValues[index])) watchChanged = true;
    if (initialized) {
      if (changes & 4 /* UpdateValue */ && (!isSameDeliveryValue(node.deliveryPreviousLocal, node.local) || !isSameDeliveryValue(node.deliveryPreviousEmit, node.emit))) {
        const pendingValue = pending?.[4 /* UpdateValue */];
        const oldValue = pendingValue !== null && typeof pendingValue === "object" ? Reflect.get(pendingValue, "previous") : node.behavior.strategy === "branch" ? { local: node.deliveryPreviousLocal, emit: node.deliveryPreviousEmit } : node.deliveryPreviousLocal;
        const current = node.behavior.strategy === "branch" ? { local: node.local, emit: node.emit } : node.local;
        const payload = { previous: oldValue, current };
        const source = automaticNodes.has(node) || context.filledNodes.has(node) ? "automatic" : readSettlementSource(context, node.path);
        mark(
          node,
          4 /* UpdateValue */,
          DEVELOPMENT ? Object.freeze(payload) : payload,
          { source }
        );
      }
      if (changes & 2 /* UpdatePath */ && node.deliveryPreviousPath !== node.path) {
        const pendingPath = pending?.[2 /* UpdatePath */];
        const oldPath = pendingPath !== null && typeof pendingPath === "object" ? Reflect.get(pendingPath, "previous") : node.deliveryPreviousPath;
        const payload = { previous: oldPath, current: node.path };
        mark(
          node,
          2 /* UpdatePath */,
          DEVELOPMENT ? Object.freeze(payload) : payload
        );
      }
      if (changes & 128 /* UpdateChildren */ && node.deliveryPreviousChildren !== node.children)
        mark(node, 128 /* UpdateChildren */);
      if (changes & 8 /* UpdateState */ && node.deliveryPreviousState !== node.interactionState) {
        runtime.stateChanged = true;
        if (!((node.pendingNonSettleDelivery?.type ?? 0) & 8 /* UpdateState */))
          mark(node, 8 /* UpdateState */);
      }
      if (changes & 256 /* UpdateComputedProperties */ && node.deliveryPreviousComputed !== (+node.active | +node.visible << 1 | +node.readOnly << 2 | +node.disabled << 3) || watchChanged)
        mark(node, 256 /* UpdateComputedProperties */);
      if (changes & 32768 /* UpdateJsonSchema */ && node.deliveryPreviousSchema !== node.schema) {
        const pendingSchema = pending?.[32768 /* UpdateJsonSchema */];
        const oldSchema = pendingSchema !== null && typeof pendingSchema === "object" ? Reflect.get(pendingSchema, "previous") : node.deliveryPreviousSchema?.schema;
        const payload = { previous: oldSchema, current: node.schema.schema };
        mark(
          node,
          32768 /* UpdateJsonSchema */,
          DEVELOPMENT ? Object.freeze(payload) : payload
        );
      }
    } else if (context.changedNodes.has(node)) {
      const current = node.behavior.strategy === "branch" ? { local: node.local, emit: node.emit } : node.local;
      const payload = { previous: void 0, current };
      const source = automaticNodes.has(node) || context.filledNodes.has(node) ? "automatic" : readSettlementSource(context, node.path);
      mark(
        node,
        4 /* UpdateValue */,
        DEVELOPMENT ? Object.freeze(payload) : payload,
        { source }
      );
    }
    if (loadScope && (node === loadScope || node.path.startsWith(loadPrefix)))
      mark(node, 8192 /* RequestRefresh */);
    else if (refreshTargets?.has(node.path))
      mark(node, 8192 /* RequestRefresh */);
    node.deliveryInitialized = true;
    if (hasWatch) node.deliveryWatchValues = watched;
    clearSchemaNodeChanges(node);
    if (node.pendingRevision) {
      node.revisionLedger = new SchemaNodeRevisionLedger(node.revisionLedger, node.pendingRevision);
      node.pendingRevision = 0;
    }
  }
  globalState.finish();
  runtime.revisionNodes?.clear();
  const departing = [];
  for (const node of context.exited) departing.push(node);
  for (const node of context.perished) departing.push(node);
  const seenDeparting = /* @__PURE__ */ new Set();
  while (departing.length) {
    const node = departing.pop();
    if (!node || !node.detached || seenDeparting.has(node)) continue;
    seenDeparting.add(node);
    clearSchemaNodeChanges(node);
    node.deliveryWatchValues = void 0;
    node.pendingDelivery = void 0;
    node.pendingRevision = 0;
    node.pendingNonSettleDelivery = void 0;
    runtime.deliveryWatchIndex?.remove(node);
    runtime.deliveries?.delete(node);
    runtime.revisionNodes?.delete(node);
    runtime.queuedNonSettleEvents?.delete(node);
    runtime.validationErrors?.delete(node);
    runtime.nodeErrors?.delete(node);
    runtime.combinedErrors?.delete(node);
    runtime.validationChangedNodes?.delete(node);
    runtime.validationTargets?.delete(node);
    runtime.validationPendingTargets?.delete(node);
    const children = node.children;
    for (let index = 0; children && index < children.length; index++)
      departing.push(children[index]);
  }
  runtime.deliveredContext = runtime.context;
  runtime.deliveryAffectedPaths = void 0;
};

// packages/canard/schema-form/src/core/settle/utils/commit/commitSettlement.ts
var EMPTY_PATHS2 = Object.freeze([]);
var EMPTY_WARNINGS = Object.freeze([]);
var commitSettlement = (context) => {
  const runtime = context.root.runtime;
  const development = false;
  if (context.exited.size > 0) snapshotExitedPolicies(context);
  if (runtime.blueprint.capabilities.hasDerive) commitDeriveRules(context);
  if (runtime.blueprint.capabilities.hasExpressions) commitExitPolicyValues(context);
  if (development) {
    if (context.traceRounds?.length) finalizeDeriveTrace(context);
    runtime.settlementTrace = {
      entry: {
        api: context.entryApi ?? context.kind,
        option: context.option
      },
      rounds: context.traceRounds ?? [],
      ...context.deriveBudgetRules ? { budget: context.deriveBudgetRules } : {}
    };
  } else delete runtime.settlementTrace;
  const commit = (runtime.commitNumber ?? 0) + 1;
  runtime.commitNumber = commit;
  if (context.hasGates) {
    const declarations = runtime.committedDeclarationIds ??= new PathKeyedMap("pair");
    for (const [node, ids] of context.selectedDeclarationIds)
      if (!node.detached)
        declarations.set(getCommittedDeclarationKey(node), ids);
  }
  if (context.failures?.length && runtime.diagnostics.status !== "degraded")
    runtime.diagnostics = {
      status: "degraded",
      cause: context.cause,
      ...context.exceededBudget ? {
        exceededBudget: context.exceededBudget,
        iterations: context.iterations
      } : {},
      commit
    };
  const refreshTargets = runtime.refreshTargets ?? /* @__PURE__ */ new Set();
  refreshTargets.clear();
  const loadScope = context.kind === "load" ? context.loadScope : void 0;
  const loadPrefix = loadScope ? `${loadScope.path}/` : "";
  for (const path of context.changedRaw) {
    if (loadScope && (path === loadScope.path || path.startsWith(loadPrefix)))
      continue;
    if (readSettlementSource(context, path, true) !== "input")
      refreshTargets.add(path);
  }
  runtime.refreshTargets = refreshTargets;
  let warnings;
  let warningTasks;
  markCommitDeliveries(context, (node) => {
    if (!context.changedNodes.has(node) || node.detached || node.blueprintNode.kind === "virtual") return;
    const effective = effectiveType(node);
    const mismatch = isTypeMismatch(node.raw, effective, node.nullable);
    const wasOn = runtime.typeMismatchPaths.has(node.path);
    if (mismatch) runtime.typeMismatchPaths.add(node.path);
    else runtime.typeMismatchPaths.delete(node.path);
    if (!(mismatch && !wasOn) && !(development && node.behavior.strategy === "terminal" && node.raw !== null && typeof node.raw === "object" && context.changedRaw.has(node.path))) return;
    (warningTasks ??= /* @__PURE__ */ new Map()).set(node, () => {
      if (mismatch && !wasOn) {
        const candidates = conversionCandidates(node, effective);
        const ambiguous = candidates.length > 1;
        const warning = {
          level: "warning",
          code: TYPE_MISMATCH,
          path: node.path,
          expected: { schemaType: node.schemaType, nullable: node.nullable, effective },
          received: receivedType(node.raw),
          reason: ambiguous ? "ambiguous" : "unconvertible",
          ...ambiguous ? { candidates } : {},
          source: context.filledNodes.has(node) ? "fill" : context.kind === "load" && context.entered.has(node) ? "load" : context.changedRaw.has(node.path) ? context.kind : "gate"
        };
        if (!warnings) warnings = [];
        warnings.push(warning);
        if (runtime.errorReporter?.hasConsumer()) {
          const code = `SCHEMA_FORM_WARNING.${TYPE_MISMATCH}`;
          const record = {
            level: "warning",
            code,
            path: node.path,
            message: `Type mismatch at ${node.path} (commit ${commit})`,
            details: {
              path: node.path,
              expected: warning.expected,
              received: warning.received,
              reason: warning.reason,
              ...warning.candidates ? { candidates: warning.candidates } : {},
              source: warning.source
            }
          };
          indexSchemaNodeWarning(
            runtime,
            JSON.stringify([code, node.path, commit]),
            node.path,
            record
          );
          runtime.chainOccurrences?.push({ kind: "record", record });
        }
      }
      if (development && node.behavior.strategy === "terminal" && node.raw !== null && typeof node.raw === "object" && context.changedRaw.has(node.path)) {
        const innerPaths = collectNonJsonPaths(node.raw, node.path);
        if (innerPaths.length) {
          const code = `SCHEMA_FORM_WARNING.${NON_JSON_WHOLE_VALUE}`;
          const key = JSON.stringify([code, node.path]);
          if (!runtime.warningKeys?.has(key)) {
            (runtime.warningKeys ??= /* @__PURE__ */ new Set()).add(key);
            const record = {
              level: "warning",
              code,
              path: node.path,
              message: `Whole value at ${node.path} contains non-JSON data`,
              details: { path: node.path, innerPaths }
            };
            indexSchemaNodeWarning(runtime, key, node.path, record);
            runtime.chainOccurrences?.push({ kind: "record", record });
          }
        }
      }
    });
  });
  if (warningTasks)
    for (const node of context.changedNodes) warningTasks.get(node)?.();
  runtime.typeMismatchRecords = warnings ? Object.freeze(warnings) : EMPTY_WARNINGS;
  const mismatchMemo = runtime.typeMismatchesMemo ?? new PathKeyedMap("path");
  mismatchMemo.clear();
  if (runtime.typeMismatchPaths.size === 0)
    mismatchMemo.set("", { commit, paths: EMPTY_PATHS2 });
  else {
    const allPaths = [...runtime.typeMismatchPaths].sort();
    mismatchMemo.set("", { commit, paths: Object.freeze(allPaths) });
    const byAncestor = /* @__PURE__ */ new Map();
    for (let index = 0; index < allPaths.length; index++) {
      const path = allPaths[index];
      let ancestor = path;
      while (ancestor) {
        let paths = byAncestor.get(ancestor);
        if (!paths) {
          paths = [];
          byAncestor.set(ancestor, paths);
        }
        paths.push(path);
        ancestor = ancestor.slice(0, ancestor.lastIndexOf("/"));
      }
    }
    for (const [ancestor, paths] of byAncestor)
      mismatchMemo.set(ancestor, { commit, paths: Object.freeze(paths) });
  }
  runtime.typeMismatchesMemo = mismatchMemo;
  if (runtime.latentRaw.size > 0 && (context.entered.size > 0 || context.exited.size > 0))
    runtime.latentRawDirty = true;
  updateInactiveValuesMemo(context.root);
};

// packages/canard/schema-form/src/core/settle/utils/derivation/captureDeriveBaseline.ts
var captureDeriveBaseline = (context) => {
  const state = getDeriveState(context);
  if (!state) return;
  state.consumedRuleValues.clear();
  evaluateDeriveRound(context.root, {
    ...state,
    loadScope: void 0,
    suppressAutomaticWrites: true,
    trace: false
  });
};

// packages/canard/schema-form/src/core/settle/utils/derivation/collectDeriveSourcePaths.ts
var collectDeriveSourcePaths = (context) => {
  const paths = /* @__PURE__ */ new Set();
  for (const owner of context.contextOwners ?? []) paths.add(owner);
  const dependencies = getDependencyIndex(context.root.runtime.blueprint);
  for (const changed of context.changedRaw) {
    for (const owner of dependencies.affected(changed, context.root)) paths.add(owner);
    let path = changed;
    while (true) {
      paths.add(path);
      if (!path) break;
      path = path.slice(0, path.lastIndexOf("/"));
    }
  }
  for (const node of context.entered) {
    paths.add(node.path);
    if (node.parent) paths.add(node.parent.path);
  }
  for (const [node, ids] of context.selectedDeclarationIds) {
    const previous = node.runtime.committedDeclarationIds?.get(
      JSON.stringify([node.path, node.blueprintNode.kind])
    );
    if (!previous || previous.length !== ids.length || previous.some((id, index) => id !== ids[index])) paths.add(node.path);
  }
  return paths;
};

// packages/canard/schema-form/src/core/settle/utils/derivation/utils/applyDeriveWrite.ts
var import_filter68 = require("@winglet/common-utils/filter");
var applyDeriveWrite = (write, context) => {
  if (!write.target) {
    if (write.template && write.siblings && write.targetOrder)
      distributeLatentValue(
        context.root.runtime,
        context,
        write.targetPath,
        write.template,
        write.value,
        write.targetOrder,
        true,
        write.siblings,
        true
      );
    return;
  }
  if (write.target.blueprintNode.kind !== "virtual") {
    markWrite(write.target, write.value, context);
    return;
  }
  const values = (0, import_filter68.isArray)(write.value) ? write.value : [];
  const fields = write.target.blueprintNode.fields ?? [];
  for (let index = 0; index < fields.length; index++) {
    const sibling = write.target.parent?.structure?.[fields[index]];
    if (sibling) markWrite(sibling, values[index], context);
  }
};

// packages/canard/schema-form/src/core/settle/utils/derivation/runDeriveRounds.ts
var ERROR_CODES = {
  expression: EXPRESSION_THREW,
  injectTarget: INJECT_TARGET_MISSING,
  writeShape: INVALID_VIRTUAL_NODE_VALUES
};
var ERROR_LABELS = {
  expression: "Derive expression failed",
  injectTarget: "Injection target missing",
  writeShape: "Invalid virtual node values"
};
var runDeriveRounds = (context) => {
  const state = getDeriveState(context);
  if (!state || context.exceededBudget) return;
  const previousTransition = context.inTransition;
  try {
    while (true) {
      state.sourcePaths = context.loadScope ? void 0 : collectDeriveSourcePaths(context);
      const decision = evaluateDeriveRound(context.root, state);
      if (state.trace) (context.traceRounds ??= []).push([...decision.trace]);
      for (const failure of decision.failures) {
        recordSettlementFailure(context, new SchemaFormError(
          ERROR_CODES[failure.kind],
          `${ERROR_LABELS[failure.kind]} at ${failure.schemaPath}`,
          {
            path: failure.targetPath ?? failure.sourcePath,
            schemaPath: failure.schemaPath,
            cause: failure.cause,
            ...failure.kind === "injectTarget" || failure.kind === "writeShape" ? { sourcePath: failure.sourcePath } : {},
            ...failure.expectedLength === void 0 ? {} : { expectedLength: failure.expectedLength, received: failure.cause }
          }
        ), failure.kind, [
          failure.kind,
          failure.sourcePath,
          failure.targetPath ?? "",
          failure.schemaPath
        ].join("\0"));
      }
      const changed = [];
      for (let index = 0; index < decision.writes.length; index++) {
        const write = decision.writes[index];
        if (!write.target || write.target.blueprintNode.kind === "virtual" || !sameValue(write.target.emit, write.value)) changed.push(write);
      }
      if (changed.length === 0) return;
      if ((context.deriveRounds ?? 0) >= DERIVE_ROUND_CAP) {
        recordSettlementFailure(context, new SchemaFormError(
          BUDGET_EXCEEDED,
          `Derive budget exceeded at ${context.target.path}`,
          { path: context.target.path }
        ), "budget");
        context.exceededBudget = "derive";
        context.iterations = DERIVE_ROUND_CAP;
        context.deriveBudgetRules = decision.trace;
        return;
      }
      context.deriveRounds = (context.deriveRounds ?? 0) + 1;
      context.automaticChanged = false;
      context.automatic = true;
      context.inTransition = true;
      const terminalTargets = DeriveConvergenceTargets.getOrCollect(context.root.runtime.blueprint);
      let skipConfirmation = terminalTargets !== void 0 && decision.failures.length === 0;
      for (let index = 0; index < changed.length; index++) {
        const write = changed[index];
        if (skipConfirmation && !terminalTargets.has(write.targetPath)) skipConfirmation = false;
        applyDeriveWrite(write, context);
        state.appliedRanks.set(
          write.targetPath,
          Math.max(state.appliedRanks.get(write.targetPath) ?? 0, write.rank)
        );
      }
      context.automatic = false;
      registerRecalculation(context);
      context.hostWheelExceeded = void 0;
      computeNode(context.root, context);
      if (context.hostWheelExceeded !== void 0 && !context.exceededBudget) {
        recordSettlementFailure(context, new SchemaFormError(
          BUDGET_EXCEEDED,
          `Host wheel budget exceeded at ${context.target.path}`,
          { path: context.target.path }
        ), "budget");
        context.exceededBudget = "hostWheel";
        context.iterations = context.hostWheelExceeded;
        return;
      }
      if (context.exceededBudget) return;
      if (skipConfirmation) {
        if (false) {
          state.sourcePaths = context.loadScope ? void 0 : collectDeriveSourcePaths(context);
          const confirmation = evaluateDeriveRound(context.root, state);
          if (confirmation.writes.length !== 0 || confirmation.failures.length !== 0)
            throw new Error("Derive convergence proof failed: confirmation was not empty");
        }
        if (state.trace) (context.traceRounds ??= []).push([]);
        return;
      }
    }
  } finally {
    context.automatic = false;
    context.inTransition = previousTransition;
  }
};

// packages/canard/schema-form/src/core/settle/utils/load/getLoadValue.ts
var import_pointer23 = require("@winglet/json/pointer");
var getLoadValue = (snapshot, path) => {
  if (!path) return snapshot;
  let value = snapshot;
  for (const encoded of path.slice(1).split("/")) {
    if (value === null || typeof value !== "object") return void 0;
    value = Reflect.get(value, (0, import_pointer23.unescapeSegment)(encoded));
  }
  return value;
};

// packages/canard/schema-form/src/core/settle/utils/load/readSchemaNodeDefaultValue.ts
var readSchemaNodeDefaultValue = (node) => node.detached ? node.runtime.detachedReads?.get(node)?.defaultValue : getLoadValue(node.runtime.loadSnapshot, node.path);

// packages/canard/schema-form/src/core/settle/utils/detached/captureDetachedSchemaNodeReads.ts
var captureDetachedSchemaNodeReads = (node, watchSnapshot) => {
  const runtime = node.runtime;
  runtime.watchValuesMemo?.delete(node);
  readSchemaNodeWatchValues(node, watchSnapshot);
  const reads = Object.freeze({
    errors: readSchemaNodeErrors(node),
    typeMismatch: runtime.typeMismatchPaths.has(node.path),
    typeMismatches: runtime.typeMismatchesMemo?.get(node.path)?.paths ?? EMPTY_PATHS,
    inactiveValues: runtime.inactiveValuesMemo.get(node.path) ?? EMPTY_VALUES,
    defaultValue: readSchemaNodeDefaultValue(node),
    visible: node.visible,
    readOnly: node.readOnly,
    disabled: node.disabled
  });
  const detachedReads = runtime.detachedReads ?? /* @__PURE__ */ new WeakMap();
  runtime.detachedReads = detachedReads;
  detachedReads.set(node, reads);
};

// packages/canard/schema-form/src/core/settle/utils/latent/captureOwnLatent.ts
var captureOwnLatent = (node, previous) => {
  if (node.behavior.type === "virtual") return void 0;
  if (node.behavior.strategy === "terminal") return node.raw;
  if (node.raw === void 0 && node.extras === void 0) return void 0;
  if (previous instanceof HostLatent && Object.is(previous.raw, node.raw) && Object.is(previous.extras, node.extras)) return previous;
  return new HostLatent(node.raw, node.extras);
};

// packages/canard/schema-form/src/core/settle/utils/transition/readUnsetPolicy.ts
var readUnsetPolicy = (node, inherited) => readExitLayerPolicy(
  getControlLayers(node, /* @__PURE__ */ new Map()),
  node.runtime.committedRuleValues,
  inherited
);

// packages/canard/schema-form/src/core/settle/utils/transition/writeLatentRaw.ts
var writeLatentRaw = (context, key, present, value, template, order) => setLatentRaw(
  context.root.runtime,
  context.inTransition ? context.latentAutomaticLog : void 0,
  key,
  present,
  value,
  template,
  order,
  context
);

// packages/canard/schema-form/src/core/settle/utils/transition/isReplacedLivePath.ts
var isReplacedLivePath = (context, path) => {
  const scope = context.replaceScope;
  const withinScope = scope !== void 0 && (!scope.path || path === scope.path || path.startsWith(`${scope.path}/`));
  const withinVirtual = context.virtualReplacePaths?.some((replaced) => path === replaced || path.startsWith(`${replaced}/`)) ?? false;
  if (!withinScope && !withinVirtual)
    return false;
  const live = find(context.root, path);
  return live !== null && !live.detached;
};

// packages/canard/schema-form/src/core/settle/utils/latent/captureArrayLatent.ts
var import_filter70 = require("@winglet/common-utils/filter");

// packages/canard/schema-form/src/core/settle/utils/latent/readLatentSlotSource.ts
var import_lib28 = require("@winglet/common-utils/lib");
var import_pointer24 = require("@winglet/json/pointer");

// packages/canard/schema-form/src/core/settle/utils/latent/getEnteredLatentKeys.ts
var getEnteredLatentKeys = (context) => {
  if (context.enteredLatentKeys) return context.enteredLatentKeys;
  context.enteredLatentKeys = /* @__PURE__ */ new Map();
  for (const node of context.entered) indexEnteredLatentKey(context, node);
  for (const node of context.revived) indexEnteredLatentKey(context, node);
  return context.enteredLatentKeys;
};

// packages/canard/schema-form/src/core/settle/utils/latent/readLatentSlotSource.ts
var readLatentSlotSource = (context, path, template) => {
  const runtime = context.root.runtime;
  const own = runtime.latentRaw.get(JSON.stringify([path, template.kind]));
  if (own !== void 0 && !(own instanceof HostLatent)) return own;
  if (own instanceof HostLatent && own.raw !== void 0) return own.raw;
  if (template.kind !== "object" || template.strategy !== "branch")
    return void 0;
  if (own === void 0) {
    const entered = getEnteredLatentKeys(context);
    let hasDescendant = false;
    for (const key of getLatentPathIndex(context).get(path) ?? []) {
      if (JSON.parse(key)[0] === path) continue;
      if (entered.get(key)?.some((node) => !node.detached && (!node.parent || node.parent.structure?.[node.name] === node))) continue;
      hasDescendant = true;
      break;
    }
    if (!hasDescendant) return void 0;
  }
  const value = own instanceof HostLatent && isPlain(own.extras) ? { ...own.extras } : {};
  let found = Object.keys(value).length > 0;
  for (const entry of template.childEntries) {
    if ((0, import_lib28.hasOwnProperty)(value, entry.name)) continue;
    const child = readLatentSlotSource(
      context,
      `${path}/${(0, import_pointer24.escapeSegment)(entry.name)}`,
      entry.node
    );
    if (child === void 0) continue;
    Object.defineProperty(value, entry.name, {
      value: child,
      enumerable: true,
      configurable: true,
      writable: true
    });
    found = true;
  }
  return found ? value : void 0;
};

// packages/canard/schema-form/src/core/settle/utils/latent/readRawTree.ts
var import_filter69 = require("@winglet/common-utils/filter");
var import_lib29 = require("@winglet/common-utils/lib");
var import_pointer25 = require("@winglet/json/pointer");
var readRawTree = (node, context) => {
  if (node.raw !== void 0 || node.behavior.strategy === "terminal")
    return node.raw;
  if (node.behavior.type === "array") {
    const slots = [];
    let tailStart = 0;
    for (let index = 0; index < node.itemCount; index++) {
      const entry = getItemEntry(node.blueprintNode, index);
      let value2;
      if (!entry) value2 = (0, import_filter69.isArray)(node.extras) ? node.extras[index - tailStart] : void 0;
      else {
        tailStart++;
        const item = node.structure?.[String(index)];
        value2 = item ? readRawTree(item, context) : readLatentSlotSource(
          context,
          `${node.path}/${index}`,
          entry.node
        );
      }
      slots.push(value2);
    }
    return slots;
  }
  const value = isPlain(node.extras) ? { ...node.extras } : {};
  let found = Object.keys(value).length > 0;
  for (const entry of node.blueprintNode.childEntries) {
    if ((0, import_lib29.hasOwnProperty)(value, entry.name)) continue;
    const child = node.structure?.[entry.name];
    const source = child ? readRawTree(child, context) : readLatentSlotSource(
      context,
      `${node.path}/${(0, import_pointer25.escapeSegment)(entry.name)}`,
      entry.node
    );
    if (source === void 0) continue;
    Object.defineProperty(value, entry.name, {
      value: source,
      enumerable: true,
      configurable: true,
      writable: true
    });
    found = true;
  }
  return found ? value : void 0;
};

// packages/canard/schema-form/src/core/settle/utils/latent/captureArrayLatent.ts
var captureArrayLatent = (node, context) => {
  const slots = [];
  let tailStart = 0;
  for (let index = 0; index < node.itemCount; index++) {
    const entry = getItemEntry(node.blueprintNode, index);
    if (!entry) {
      slots.push((0, import_filter70.isArray)(node.extras) ? node.extras[index - tailStart] : void 0);
      continue;
    }
    tailStart++;
    const item = node.structure?.[String(index)];
    if (item) {
      slots.push(readRawTree(item, context));
      continue;
    }
    slots.push(readLatentSlotSource(
      context,
      `${node.path}/${index}`,
      entry.node
    ));
  }
  return new HostLatent(Object.freeze(slots), void 0);
};

// packages/canard/schema-form/src/core/settle/utils/transition/captureExitedRaw.ts
var captureExitedRaw = (node, inherited, context, policy, order) => {
  const clear = policy && readUnsetPolicy(node, inherited);
  for (const child of node.behavior.type === "array" ? [] : node.children ?? []) {
    if (child.parent !== node) continue;
    const entries = node.blueprintNode.childEntries;
    const exact = entries.findIndex((entry) => entry.name === child.name && entry.node === child.blueprintNode);
    const index = exact >= 0 ? exact : entries.findIndex((entry) => entry.name === child.name && entry.node.kind === child.blueprintNode.kind);
    captureExitedRaw(
      child,
      clear,
      context,
      policy,
      [...order, index >= 0 ? index : 0]
    );
  }
  const key = JSON.stringify([node.path, node.blueprintNode.kind]);
  const value = clear ? void 0 : node.behavior.type === "array" && node.behavior.strategy === "branch" && node.raw === void 0 ? captureArrayLatent(node, context) : captureOwnLatent(node, context.root.runtime.latentRaw.get(key));
  if (node.behavior.type === "array" && node.behavior.strategy === "branch")
    pruneLatentRaw(node.runtime, node.path, void 0, context);
  writeLatentRaw(context, key, value !== void 0 && !isReplacedLivePath(context, node.path), value, node.blueprintNode, order);
};

// packages/canard/schema-form/src/core/settle/utils/transition/captureLatentDescendants.ts
var import_filter71 = require("@winglet/common-utils/filter");

// packages/canard/schema-form/src/core/settle/utils/controls/readLatentExitPolicy.ts
var EXIT_LAYERS2 = ["node", "children", "fragment"];
var readLatentExitPolicy = (decisions, inherited) => {
  for (const layer of EXIT_LAYERS2) {
    const matching = decisions?.filter((decision) => decision.layer === layer);
    if (matching?.length) return matching.every((decision) => decision.clear);
  }
  return inherited;
};

// packages/canard/schema-form/src/core/settle/utils/transition/captureLatentDescendants.ts
var captureLatentDescendants = (context, node, inherited) => {
  const runtime = context.root.runtime;
  const index = getLatentPathIndex(context);
  const entries = [];
  for (const key of index.get(node.path) ?? []) {
    const identity = JSON.parse(key);
    if (!(0, import_filter71.isArray)(identity) || typeof identity[0] !== "string") continue;
    const path = identity[0];
    if (path === node.path) continue;
    const info = runtime.latentRawMetadata?.get(key);
    if (info)
      entries.push({
        key,
        path,
        order: info.order,
        exitLayers: info.exitLayers
      });
  }
  entries.sort((left, right) => left.path.length - right.path.length);
  const live = /* @__PURE__ */ new Map();
  walkOwnedSchemaNodes(node, (current) => live.set(JSON.stringify([
    current.path,
    current.blueprintNode.kind
  ]), current));
  const resolved = /* @__PURE__ */ new Map([[node.path, [
    { path: node.path, order: [], clear: inherited }
  ]]]);
  for (const entry of entries) {
    let parentPath = entry.path.slice(0, entry.path.lastIndexOf("/"));
    let parent;
    while (!parent && parentPath.length >= node.path.length) {
      parent = resolved.get(parentPath)?.find((candidate) => candidate.order.every((position, index2) => position === entry.order[index2]));
      if (parentPath === node.path) break;
      parentPath = parentPath.slice(0, parentPath.lastIndexOf("/"));
    }
    const inheritedPolicy = parent?.clear ?? inherited;
    const current = live.get(entry.key);
    const clear = current ? readExitLayerPolicy(
      getControlLayers(current, /* @__PURE__ */ new Map()),
      context.root.runtime.committedRuleValues,
      inheritedPolicy
    ) : readLatentExitPolicy(entry.exitLayers, inheritedPolicy);
    const samePath = resolved.get(entry.path) ?? [];
    samePath.push({ path: entry.path, order: entry.order, clear });
    resolved.set(entry.path, samePath);
    if (clear) writeLatentRaw(context, entry.key, false, void 0);
  }
};

// packages/canard/schema-form/src/core/settle/utils/transition/readDepartingAncestorPolicy.ts
var import_lib30 = require("@winglet/common-utils/lib");
var readDepartingAncestorPolicy = (context, node) => {
  for (let ancestor = node.parent; ancestor; ancestor = ancestor.parent) {
    if (ancestor.detached) continue;
    const previous = getControlLayers(ancestor, /* @__PURE__ */ new Map());
    const departed = previous.filter((group) => {
      if (!(0, import_lib30.hasOwnProperty)(group.controls, "unsetOnInactive")) return false;
      const key = JSON.stringify([group.host.path, group.host.blueprintNode.kind]);
      const selected = context.selectedDeclarationIds.get(group.host) ?? context.root.runtime.committedDeclarationIds?.get(key);
      return !selected?.includes(group.declarationId);
    });
    if (departed.length)
      return readExitLayerPolicy(
        departed,
        context.root.runtime.committedRuleValues,
        context.root.runtime.unsetOnInactive === true
      );
  }
  return context.root.runtime.unsetOnInactive === true;
};

// packages/canard/schema-form/src/core/settle/utils/transition/applyExitClearing.ts
var applyExitClearing = (context, skip = () => false) => {
  for (const node of context.exited) {
    if (skip(node) || context.entered.has(node) || !node.detached) continue;
    const inherited = readDepartingAncestorPolicy(context, node);
    captureExitedRaw(
      node,
      inherited,
      context,
      true,
      getLatentOrder(node.parent, node.name, node.blueprintNode)
    );
    captureLatentDescendants(context, node, readUnsetPolicy(node, inherited));
  }
};

// packages/canard/schema-form/src/core/settle/utils/transition/withdrawDetachedFills.ts
var import_filter72 = require("@winglet/common-utils/filter");

// packages/canard/schema-form/src/core/settle/utils/transition/restoreArrayStructure.ts
var restoreArrayStructure = (context, within) => {
  for (let index = context.arrayStructureLog.length - 1; index >= 0; index--) {
    const entry = context.arrayStructureLog[index];
    if (entry.restored) continue;
    const { host, previousItems, previousItemCount, previousExtras } = entry;
    if (within) {
      let ancestor = host;
      while (ancestor && ancestor !== within) ancestor = ancestor.parent;
      if (!ancestor) continue;
    }
    const prior = new Set(previousItems);
    for (const item of host.children ?? []) if (!prior.has(item)) {
      getGateRegistry(item.runtime).remove(item);
      walkOwnedSchemaNodes(item, (current) => {
        current.detached = true;
        current.active = captureSchemaNodeChange(current, "active", false);
        context.entered.delete(current);
        context.perished.delete(current);
      });
    }
    const structure = /* @__PURE__ */ Object.create(null);
    for (const item of previousItems) {
      structure[item.name] = item;
      item.detached = false;
      item.active = captureSchemaNodeChange(item, "active", true);
      context.perished.delete(item);
    }
    host.structure = structure;
    host.children = captureSchemaNodeChange(host, "children", previousItems);
    host.itemCount = previousItemCount;
    host.extras = previousExtras;
    context.dirtyPaths.add(host.path);
    context.shapeDirtyPaths.add(host.path);
    entry.restored = true;
  }
};

// packages/canard/schema-form/src/core/settle/utils/transition/withdrawDetachedFills.ts
var withdrawDetachedFills = (context) => {
  for (const node of context.filledNodes) {
    if (!node.detached) continue;
    restoreArrayStructure(context, node);
    for (let index = context.automaticLog.length - 1; index >= 0; index--) {
      const entry = context.automaticLog[index];
      let ancestor = entry.node;
      while (ancestor && ancestor !== node) ancestor = ancestor.parent;
      if (!ancestor) continue;
      entry.node.raw = entry.previousRaw;
      entry.node.extras = entry.previousExtras;
      if (entry.previousDistributed)
        context.distributedInputs.set(entry.node, entry.previousDistributed);
      else context.distributedInputs.delete(entry.node);
      context.changedRaw.delete(entry.node.path);
    }
    for (const [key, previous] of context.latentAutomaticLog) {
      const identity = JSON.parse(key);
      if (!(0, import_filter72.isArray)(identity) || typeof identity[0] !== "string" || identity[0] !== node.path && !identity[0].startsWith(`${node.path}/`)) continue;
      setLatentRaw(
        context.root.runtime,
        void 0,
        key,
        previous.present,
        previous.value,
        void 0,
        void 0,
        context
      );
    }
    context.writtenInputs.delete(node);
  }
};

// packages/canard/schema-form/src/core/settle/utils/transition/prunePerishedPaths.ts
var import_filter73 = require("@winglet/common-utils/filter");

// packages/canard/schema-form/src/core/settle/utils/pathIndex/getRuntimePathStores.ts
var getRuntimePathStores = (runtime) => ({
  latent: runtime.latentRaw,
  metadata: runtime.latentRawMetadata ??= new PathKeyedMap("pair"),
  declarations: runtime.committedDeclarationIds ??= new PathKeyedMap("pair"),
  rules: runtime.committedRuleValues ??= new PathKeyedMap("rule"),
  mismatches: runtime.typeMismatchPaths,
  mismatchMemo: runtime.typeMismatchesMemo ??= new PathKeyedMap("path"),
  inactiveMemo: runtime.inactiveValuesMemo,
  inactiveEntries: runtime.inactiveValueEntries ??= new PathKeyedMap("pair")
});

// packages/canard/schema-form/src/core/settle/utils/transition/prunePerishedPaths.ts
var prunePerishedPaths = (runtime, paths) => {
  if (paths.size === 0) return;
  const stores = getRuntimePathStores(runtime);
  const warningKeys = /* @__PURE__ */ new Set();
  for (const path of paths)
    for (const key of runtime.warningKeysByPath?.get(path) ?? []) warningKeys.add(key);
  for (const key of warningKeys) {
    const parts = JSON.parse(key);
    if ((0, import_filter73.isArray)(parts) && typeof parts[1] === "string")
      indexSchemaNodeWarning(runtime, key, parts[1], void 0, true);
  }
  for (const path of paths) {
    for (const key of stores.latent.pathIndex.under(path)) {
      stores.latent.delete(key);
      runtime.latentRawDirty = true;
    }
    for (const store of [
      stores.metadata,
      stores.mismatches,
      stores.inactiveMemo,
      stores.declarations
    ])
      for (const key of store.pathIndex.under(path)) store.delete(key);
    for (const key of stores.rules.pathIndex.under(path))
      updateCommittedRuleValue(runtime, key, "delete");
  }
};

// packages/canard/schema-form/src/core/settle/utils/transition/pruneArrayTailPaths.ts
var import_filter74 = require("@winglet/common-utils/filter");
var pruneArrayTailPaths = (runtime, hosts) => {
  if (hosts.size === 0) return;
  const stores = getRuntimePathStores(runtime);
  const removed = /* @__PURE__ */ new Set();
  for (const [host, count] of hosts) {
    for (const store of [
      stores.latent,
      stores.metadata,
      stores.declarations,
      stores.mismatches,
      stores.rules
    ])
      for (const path of store.pathIndex.tail(host, count)) removed.add(path);
    for (const key of runtime.warningKeysByPath?.get(host) ?? []) {
      const parts = JSON.parse(key);
      if (!(0, import_filter74.isArray)(parts) || typeof parts[1] !== "string") continue;
      const prefix = `${host}/`;
      const segment = parts[1].slice(prefix.length).split("/")[0];
      const index = Number(segment);
      if (parts[1].startsWith(prefix) && Number.isInteger(index) && index >= count && index >= 0 && String(index) === segment)
        removed.add(prefix + segment);
    }
  }
  prunePerishedPaths(runtime, removed);
};

// packages/canard/schema-form/src/core/settle/utils/transition/finalizePerished.ts
var finalizePerished = (context) => {
  let perishedPaths;
  for (const node of context.perished) {
    if (node.parent?.structure?.[node.name] === node) continue;
    walkOwnedSchemaNodes(node, (departing) => {
      if (!departing.runtime.detachedReads?.has(departing))
        captureDetachedSchemaNodeReads(departing, {
          emit: context.previousEmit,
          context: context.previousContext,
          schema: context.originalSchemas.get(departing.path)?.schema ?? departing.schema.schema
        });
      departing.detached = true;
      departing.active = captureSchemaNodeChange(departing, "active", false);
    });
    getGateRegistry(node.runtime).remove(node);
    for (const [key, pending] of context.pendingExits)
      if (pending.path === node.path || pending.path.startsWith(`${node.path}/`))
        context.pendingExits.delete(key);
    if (!node.parent?.structure?.[node.name])
      (perishedPaths ??= /* @__PURE__ */ new Set()).add(node.path);
  }
  if (perishedPaths) {
    prunePerishedPaths(context.root.runtime, perishedPaths);
    context.latentDescendantKeys = void 0;
  }
  const resizedHosts = /* @__PURE__ */ new Map();
  for (const [host, previousCount] of context.arrayCounts)
    if (!host.detached && host.itemCount !== previousCount)
      resizedHosts.set(host.path, host.itemCount);
  if (resizedHosts.size) {
    pruneArrayTailPaths(context.root.runtime, resizedHosts);
    context.latentDescendantKeys = void 0;
  }
};

// packages/canard/schema-form/src/core/settle/utils/transition/finalizeExits.ts
var finalizeExits = (context) => {
  finalizePerished(context);
  let mismatchIndex;
  for (const node of context.pendingExits.values()) {
    if (node.detached) continue;
    const parent = node.parent;
    if (parent?.structure?.[node.name] === node) continue;
    context.exited.add(node);
    walkOwnedSchemaNodes(node, (departing) => {
      if (!departing.runtime.detachedReads?.has(departing))
        captureDetachedSchemaNodeReads(departing, {
          emit: context.previousEmit,
          context: context.previousContext,
          schema: context.originalSchemas.get(departing.path)?.schema ?? departing.schema.schema
        });
      departing.detached = true;
      departing.active = captureSchemaNodeChange(departing, "active", false);
    });
    getGateRegistry(node.runtime).remove(node);
    if (!mismatchIndex) {
      mismatchIndex = /* @__PURE__ */ new Map();
      for (const path of context.root.runtime.typeMismatchPaths) {
        let ancestor = path;
        while (true) {
          let paths = mismatchIndex.get(ancestor);
          if (!paths) {
            paths = /* @__PURE__ */ new Set();
            mismatchIndex.set(ancestor, paths);
          }
          paths.add(path);
          if (!ancestor) break;
          ancestor = ancestor.slice(0, ancestor.lastIndexOf("/"));
        }
      }
    }
    for (const path of [...mismatchIndex.get(node.path) ?? []]) {
      context.root.runtime.typeMismatchPaths.delete(path);
      let ancestor = path;
      while (true) {
        mismatchIndex.get(ancestor)?.delete(path);
        if (!ancestor) break;
        ancestor = ancestor.slice(0, ancestor.lastIndexOf("/"));
      }
    }
  }
  withdrawDetachedFills(context);
  const scope = context.kind === "load" ? context.loadScope : void 0;
  const inLoadScope = (node) => scope !== void 0 && (!scope.path || node.path === scope.path || node.path.startsWith(`${scope.path}/`));
  const applyPolicy = !context.suppressAutomaticWrites && !context.exceededBudget;
  if (applyPolicy) applyExitClearing(context, (node) => inLoadScope(node) || context.throwingGateExits?.has(node) === true);
  for (const node of context.exited)
    if (!inLoadScope(node) && node.detached && (context.entered.has(node) || !applyPolicy || context.throwingGateExits?.has(node)))
      captureExitedRaw(
        node,
        false,
        context,
        false,
        getLatentOrder(node.parent, node.name, node.blueprintNode)
      );
  if (context.root.runtime.latentRaw.size > 0)
    for (const node of [...context.entered, ...context.revived]) {
      if (node.detached) continue;
      let live = true;
      for (let current = node; current?.parent; current = current.parent)
        if (current.parent.structure?.[current.name] !== current) {
          live = false;
          break;
        }
      if (live) writeLatentRaw(
        context,
        JSON.stringify([node.path, node.blueprintNode.kind]),
        false,
        void 0
      );
    }
  const affectedAncestors = /* @__PURE__ */ new Set();
  for (const node of context.exited)
    for (let ancestor = node.parent; ancestor; ancestor = ancestor.parent)
      if (!ancestor.detached) affectedAncestors.add(ancestor);
  for (const ancestor of [...affectedAncestors].sort((left, right) => right.path.length - left.path.length)) updateOutput(ancestor, context);
};

// packages/canard/schema-form/src/core/settle/utils/transition/restoreSourceB.ts
var restoreSourceB = (context, explicitRaw) => {
  for (let index = context.automaticLog.length - 1; index >= 0; index--) {
    const entry = context.automaticLog[index];
    entry.node.raw = entry.previousRaw;
    entry.node.extras = entry.previousExtras;
    if (entry.previousDistributed)
      context.distributedInputs.set(entry.node, entry.previousDistributed);
    else context.distributedInputs.delete(entry.node);
    context.dirtyPaths.add(entry.node.path);
    if (entry.node.behavior.strategy === "branch")
      context.shapeDirtyPaths.add(entry.node.path);
  }
  restoreArrayStructure(context);
  for (const [key, previous] of context.latentAutomaticLog)
    setLatentRaw(
      context.root.runtime,
      void 0,
      key,
      previous.present,
      previous.value,
      void 0,
      void 0,
      context
    );
  withdrawDetachedFills(context);
  for (const node of context.filledNodes) context.writtenInputs.delete(node);
  context.selectedDeclarationIds.clear();
  context.changedRaw.clear();
  for (const path of explicitRaw) context.changedRaw.add(path);
  context.dirtyPaths.add("");
  context.shapeDirtyPaths.add("");
  registerRecalculation(context);
  computeNode(context.root, context);
};

// packages/canard/schema-form/src/core/settle/utils/transition/isMissingRaw.ts
var isMissingRaw = (node, context) => {
  if (node.raw !== void 0) return false;
  if (node.behavior.strategy !== "branch") return true;
  if (node.extras !== void 0 || hasLatentUnder(context, node.path)) return false;
  return (node.children ?? []).every((child) => isMissingRaw(child, context));
};

// packages/canard/schema-form/src/core/settle/utils/transition/readDefault.ts
var import_lib31 = require("@winglet/common-utils/lib");
var DEFAULT_LAYERS = ["node", "children", "fragment"];
var readDefault = (node, selectedDeclarationIds) => {
  const groups = getControlLayers(node, selectedDeclarationIds);
  for (const layer of DEFAULT_LAYERS)
    for (let index = groups.length - 1; index >= 0; index--) {
      const group = groups[index];
      if (group.layer === layer && (0, import_lib31.hasOwnProperty)(group.controls, "default"))
        return Reflect.get(group.controls, "default");
    }
  const schema = node.schema.schema;
  if (schema === null || typeof schema !== "object") return void 0;
  return (0, import_lib31.hasOwnProperty)(schema, "default") ? schema.default : void 0;
};

// packages/canard/schema-form/src/core/settle/utils/transition/hasWrongKindBranchAncestor.ts
var import_filter75 = require("@winglet/common-utils/filter");
var hasWrongKindBranchAncestor = (node) => {
  let parent = node.parent;
  while (parent) {
    if (parent.behavior.type === "object" && parent.behavior.strategy === "branch" && parent.raw !== void 0 && (parent.raw === null || typeof parent.raw !== "object" || (0, import_filter75.isArray)(parent.raw))) return true;
    if (parent.behavior.type === "array" && parent.behavior.strategy === "branch" && parent.raw !== void 0 && !(0, import_filter75.isArray)(parent.raw)) return true;
    parent = parent.parent;
  }
  return false;
};

// packages/canard/schema-form/src/core/settle/utils/transition/collectFillDescendants.ts
var collectFillDescendants = (context, appearances, count, ancestors, newArrayHosts) => {
  let byDepth;
  const firstEvaluations = context.hasGates ? /* @__PURE__ */ new Set() : void 0;
  for (let index = 0; index < count; index++) {
    const node = appearances.next().value;
    if (node.detached || !node.parent) continue;
    const parentOrigin = ancestors.get(node.parent);
    if (parentOrigin === void 0 && !context.distributedInputs.get(node.parent)?.automatic) continue;
    const newItem = node.parent.behavior.type === "array" && newArrayHosts?.has(node.parent) && parentOrigin !== void 0 && parentOrigin >= 0 && Number(node.name) >= parentOrigin;
    const firstEvaluation = parentOrigin === -1 && firstEvaluations?.has(node.parent);
    if (context.hasGates && !firstEvaluation && !newItem) {
      const declarations = node.blueprintNode.declarations;
      let ungated = false;
      for (let declarationIndex = 0; declarationIndex < declarations.length; declarationIndex++)
        if (declarations[declarationIndex].role === "declaration" && declarations[declarationIndex].gates.length === 0) {
          ungated = true;
          break;
        }
      if (!ungated) continue;
    }
    if (node.behavior.strategy === "branch") {
      ancestors.set(node, -1);
      firstEvaluations?.add(node);
    }
    byDepth ??= [];
    (byDepth[node.depth] ??= []).push(node);
  }
  return byDepth;
};

// packages/canard/schema-form/src/core/settle/utils/transition/hasRecursiveFill.ts
var hasRecursiveFill = (node, hosts, context) => node.parent !== null && hasRecursiveExpansion(
  node.parent,
  node.blueprintNode,
  void 0,
  context,
  node.schema,
  hosts
);

// packages/canard/schema-form/src/core/settle/utils/transition/transitionSettlement.ts
var transitionSettlement = (context) => {
  if (context.suppressAutomaticWrites || context.exceededBudget) return;
  if (!context.hasGates && context.entered.size === 0 && context.exited.size === 0) {
    let narrowed = false;
    for (const node of context.writtenInputs.keys())
      if (!node.detached && effectiveType(node) !== node.schemaType) {
        narrowed = true;
        break;
      }
    if (!narrowed) return;
  }
  context.inTransition = true;
  const cap = getTransitionCap(context.root.runtime.blueprint);
  const filled = context.hasGates ? /* @__PURE__ */ new Set() : void 0;
  const filledNodes = context.hasGates ? void 0 : /* @__PURE__ */ new Set();
  let fillHosts;
  let fillAncestors;
  let newArrayHosts;
  let descendantsByDepth;
  let appearances;
  let appearanceCount = 0;
  let rounds = 0;
  while (true) {
    context.automaticChanged = false;
    newArrayHosts?.clear();
    const continuingFill = descendantsByDepth !== void 0;
    const enteredByDepth = descendantsByDepth ?? [];
    descendantsByDepth = void 0;
    if (!continuingFill) {
      appearances = context.entered.values();
      appearanceCount = context.entered.size;
      for (let index = 0; index < appearanceCount; index++) {
        const node = appearances.next().value;
        (enteredByDepth[node.depth] ??= []).push(node);
      }
    }
    for (let depth = 0; depth < enteredByDepth.length; depth++) {
      const entered = enteredByDepth[depth];
      if (!entered) continue;
      for (let index = 0; index < entered.length; index++) {
        const node = entered[index];
        if (node.detached || context.pendingExits.size !== 0 && context.pendingExits.has(JSON.stringify([
          node.path,
          node.blueprintNode.kind
        ]))) continue;
        if (filledNodes) {
          if (filledNodes.has(node)) continue;
          filledNodes.add(node);
        } else if (filled) {
          const key = JSON.stringify([node.path, node.blueprintNode.kind]);
          if (filled.has(key)) continue;
          filled.add(key);
        }
        if (context.kind !== "load" && hasWrongKindBranchAncestor(node)) continue;
        if (context.deriveState?.activeUnsetTargets.has(node)) continue;
        if (node.raw !== void 0) continue;
        if (node.behavior.type === "array" && context.distributedInputs.get(node)?.input !== void 0) continue;
        const value = readDefault(node, context.selectedDeclarationIds);
        if (value === void 0 || !isMissingRaw(node, context)) continue;
        if (node.behavior.strategy === "branch") {
          if (fillHosts && hasRecursiveFill(node, fillHosts, context)) {
            recordSettlementFailure(context, new SchemaFormError(
              RECURSIVE_SHAPE_DIVERGED,
              `Recursive shape diverged at ${node.path}`,
              { path: node.path }
            ), "budget");
            context.exceededBudget = "recursion";
            context.inTransition = false;
            return;
          }
          (fillHosts ??= /* @__PURE__ */ new Set()).add(node);
          fillAncestors ??= /* @__PURE__ */ new Map();
          if (!fillAncestors.has(node) || fillAncestors.get(node) === -1)
            fillAncestors.set(node, node.itemCount);
        }
        context.filledNodes.add(node);
        context.automatic = true;
        context.writtenInputs.set(node, value);
        const logsStructure = node.behavior.strategy === "branch" || node.behavior.type === "array";
        const arrayLogStart = logsStructure ? context.arrayStructureLog.length : 0;
        markWrite(node, value, context);
        context.automatic = false;
        if (logsStructure) for (let logIndex = arrayLogStart; logIndex < context.arrayStructureLog.length; logIndex++) {
          const entry = context.arrayStructureLog[logIndex];
          if (fillAncestors && (!fillAncestors.has(entry.host) || fillAncestors.get(entry.host) === -1))
            fillAncestors.set(entry.host, entry.previousItemCount);
          if (context.hasGates && entry.host.itemCount > entry.previousItemCount)
            (newArrayHosts ??= /* @__PURE__ */ new Set()).add(entry.host);
        }
      }
    }
    for (const [node, original] of context.writtenInputs) {
      if (node.detached || context.pendingExits.size !== 0 && context.pendingExits.has(JSON.stringify([
        node.path,
        node.blueprintNode.kind
      ]))) continue;
      const effective = effectiveType(node);
      if (effective === node.schemaType) continue;
      context.automatic = true;
      markWrite(node, original, context, staticSpec(effective, node.nullable));
      context.automatic = false;
    }
    if (context.initialOutputs) {
      const outputs = context.initialOutputs;
      context.initialOutputs = void 0;
      for (let index = 0; index < outputs.length; index++)
        updateOutput(outputs[index], context);
      context.dirtyPaths.clear();
      context.inTransition = false;
      return;
    }
    if (!context.automaticChanged) {
      if (continuingFill && context.hasGates) continue;
      withdrawDetachedFills(context);
      context.inTransition = false;
      return;
    }
    if (!continuingFill) rounds++;
    if (rounds > cap) {
      recordSettlementFailure(context, new SchemaFormError(
        BUDGET_EXCEEDED,
        `Transition budget exceeded at ${context.target.path}`,
        { path: context.target.path }
      ), "budget");
      context.exceededBudget = "transition";
      context.iterations = cap;
      context.inTransition = false;
      return;
    }
    registerRecalculation(context);
    context.hostWheelExceeded = void 0;
    computeNode(context.root, context);
    if (context.hostWheelExceeded !== void 0 && !context.exceededBudget) {
      recordSettlementFailure(context, new SchemaFormError(
        BUDGET_EXCEEDED,
        `Host wheel budget exceeded at ${context.target.path}`,
        { path: context.target.path }
      ), "budget");
      context.exceededBudget = "hostWheel";
      context.iterations = context.hostWheelExceeded;
    }
    if (context.exceededBudget) {
      context.inTransition = false;
      return;
    }
    if (context.root.runtime.blueprint.capabilities.hasDerive)
      runDeriveRounds(context);
    if (context.exceededBudget) {
      context.inTransition = false;
      return;
    }
    if (fillAncestors && context.entered.size > appearanceCount) {
      const count = context.entered.size;
      descendantsByDepth = collectFillDescendants(
        context,
        appearances,
        count - appearanceCount,
        fillAncestors,
        newArrayHosts
      );
      appearanceCount = count;
    }
  }
};

// packages/canard/schema-form/src/core/settle/utils/controls/calculateStateKeys.ts
var NO_FAILURES3 = Object.freeze([]);
var STATE_KEYS = {
  visible: { initial: true, combine: (left, right) => left && right },
  readOnly: { initial: false, combine: (left, right) => left || right },
  disabled: { initial: false, combine: (left, right) => left || right }
};
var KEY_NAMES = ["visible", "readOnly", "disabled"];
var calculateStateKeys = (root, stateDirtyNodes, selectedDeclarationIds, expandFrom) => {
  const blueprint2 = root.runtime.blueprint;
  const index = getFeatureNodeIndex(blueprint2);
  const isTarget = (node) => index.stateKeyNodes.has(node.blueprintNode.id) || !!node.parent && !!(index.stateKeyChildren.get(node.parent.blueprintNode.id)?.has(node.name) || node.parent.blueprintNode.kind === "array" && index.stateKeyChildren.get(node.parent.blueprintNode.id)?.has("*"));
  const candidates = /* @__PURE__ */ new Set();
  for (const node of stateDirtyNodes) if (isTarget(node)) candidates.add(node);
  for (const source of stateDirtyNodes) {
    const targets = index.stateKeyChildren.get(source.blueprintNode.id);
    if (!targets) continue;
    if (source.detached || !source.children?.length) continue;
    if (!expandFrom(source)) continue;
    for (const child of source.children)
      if (targets.has(child.name) || source.blueprintNode.kind === "array" && targets.has("*"))
        candidates.add(child);
  }
  const evaluated = /* @__PURE__ */ new Map();
  const entries = [];
  let failures;
  for (const node of candidates) {
    if (node.detached || node.parent && node.parent.structure?.[node.name] !== node)
      continue;
    const schema = node.schema.schema;
    const next = {
      visible: STATE_KEYS.visible.initial,
      readOnly: typeof schema === "object" && schema.readOnly === true,
      disabled: STATE_KEYS.disabled.initial
    };
    for (const group of getControlLayers(node, selectedDeclarationIds))
      for (const key of KEY_NAMES) {
        const literal = Reflect.get(group.controls, key);
        if (literal === void 0) continue;
        let value;
        if (typeof literal === "boolean") value = literal;
        else if (typeof literal === "string") {
          const schemaPath = `${group.schemaPath}/${key}`;
          const cacheKey = JSON.stringify([group.host.path, schemaPath]);
          if (evaluated.has(cacheKey)) value = evaluated.get(cacheKey);
          else {
            const expression = getControlExpression(
              blueprint2,
              group.declarationId,
              schemaPath,
              key
            );
            if (expression) try {
              value = Boolean(expression.evaluate(expression.dependencies.map(
                (dependency) => readStateDependency(
                  root,
                  group.host.path,
                  dependency
                )
              )));
            } catch (cause) {
              (failures ??= []).push({ path: group.host.path, schemaPath, cause });
            }
            evaluated.set(cacheKey, value);
          }
        }
        if (value !== void 0) next[key] = STATE_KEYS[key].combine(next[key], value);
      }
    entries.push({ node, ...next });
  }
  return { entries, failures: failures ?? NO_FAILURES3 };
};

// packages/canard/schema-form/src/core/settle/utils/compute/publishStateKeys.ts
var publishStateKeys = (context) => {
  const index = getFeatureNodeIndex(context.root.runtime.blueprint);
  if (!index.stateKeyNodes.size && !index.stateKeyChildren.size) return;
  const result = calculateStateKeys(
    context.root,
    context.stateDirtyNodes,
    context.selectedDeclarationIds,
    (source) => context.kind === "load" || context.dependencyOwnerPaths.has(source.path) || context.shapeDirtyPaths.has(source.path)
  );
  for (const { node, visible, readOnly, disabled } of result.entries) {
    if (node.visible !== visible || node.readOnly !== readOnly || node.disabled !== disabled) context.changedNodes.add(node);
    node.visible = captureSchemaNodeChange(node, "visible", visible);
    node.readOnly = captureSchemaNodeChange(node, "readOnly", readOnly);
    node.disabled = captureSchemaNodeChange(node, "disabled", disabled);
  }
  for (const failure of result.failures) {
    const { path, schemaPath, cause } = failure;
    recordSettlementFailure(context, new SchemaFormError(
      EXPRESSION_THREW,
      `State key expression failed at ${schemaPath}`,
      { path, schemaPath, cause }
    ), "expression");
  }
};

// packages/canard/schema-form/src/core/settle/utils/load/alignArraySnapshotSlots.ts
var import_filter77 = require("@winglet/common-utils/filter");
var import_pointer27 = require("@winglet/json/pointer");

// packages/canard/schema-form/src/core/settle/utils/load/setLoadValue.ts
var import_filter76 = require("@winglet/common-utils/filter");
var import_pointer26 = require("@winglet/json/pointer");
var setLoadValue = (snapshot, path, value) => {
  if (sameValue(getLoadValue(snapshot, path), value)) return snapshot;
  if (!path) return value;
  const segments = path.slice(1).split("/").map(import_pointer26.unescapeSegment);
  const ancestors = [snapshot];
  let source = snapshot;
  for (const segment of segments) {
    source = source !== null && typeof source === "object" ? Reflect.get(source, segment) : void 0;
    ancestors.push(source);
  }
  let next = value;
  for (let index = segments.length - 1; index >= 0; index--) {
    const parent = ancestors[index];
    const copy = (0, import_filter76.isArray)(parent) ? [...parent] : parent !== null && typeof parent === "object" ? { ...parent } : {};
    Reflect.set(copy, segments[index], next);
    next = copy;
  }
  return next;
};

// packages/canard/schema-form/src/core/settle/utils/load/alignArraySnapshotSlots.ts
var alignArraySnapshotSlots = (hosts) => {
  if (!hosts.length) return;
  const runtime = hosts[0].runtime;
  let draft = runtime.loadSnapshot;
  const copies = /* @__PURE__ */ new WeakMap();
  const draftContainers = /* @__PURE__ */ new WeakSet();
  const holey = /* @__PURE__ */ new WeakSet();
  const draftCopy = (source, path) => {
    if (source !== null && typeof source === "object") {
      if (draftContainers.has(source)) {
        if ((0, import_filter77.isArray)(source) && holey.has(source)) {
          for (let index = 0; index < source.length; index++)
            if (!(index in source)) source[index] = void 0;
          holey.delete(source);
        }
        return source;
      }
      let byPath = copies.get(source);
      const existing = byPath?.get(path);
      if (existing) return existing;
      const clone2 = (0, import_filter77.isArray)(source) ? [...source] : { ...source };
      if (!byPath) {
        byPath = /* @__PURE__ */ new Map();
        copies.set(source, byPath);
      }
      byPath.set(path, clone2);
      draftContainers.add(clone2);
      return clone2;
    }
    const clone = {};
    draftContainers.add(clone);
    return clone;
  };
  for (const host of hosts) {
    const previous = getLoadValue(draft, host.path);
    if (!(0, import_filter77.isArray)(previous) && host.itemCount === 0) continue;
    const slots = (0, import_filter77.isArray)(previous) ? previous.slice(0, host.itemCount) : [];
    while (slots.length < host.itemCount) slots.push(void 0);
    if (sameValue(previous, slots)) continue;
    draftContainers.add(slots);
    holey.add(slots);
    if (!host.path) {
      draft = slots;
      continue;
    }
    const encoded = host.path.slice(1).split("/");
    const segments = encoded.map(import_pointer27.unescapeSegment);
    let probe = draft;
    let byName = false;
    for (const segment2 of segments) {
      if ((0, import_filter77.isArray)(probe) && !isCanonicalArrayIndex(segment2)) {
        byName = true;
        break;
      }
      probe = probe !== null && typeof probe === "object" ? Reflect.get(probe, segment2) : void 0;
    }
    if (byName) {
      draft = setLoadValue(draft, host.path, slots);
      continue;
    }
    let parent = draftCopy(draft, "");
    draft = parent;
    let parentPath = "";
    for (let index = 0; index < segments.length - 1; index++) {
      const segment2 = segments[index];
      parentPath += `/${encoded[index]}`;
      const child = draftCopy(Reflect.get(parent, segment2), parentPath);
      if ((0, import_filter77.isArray)(parent) && Number(segment2) > parent.length) holey.add(parent);
      Reflect.set(parent, segment2, child);
      parent = child;
    }
    const segment = segments[segments.length - 1];
    if ((0, import_filter77.isArray)(parent) && Number(segment) > parent.length) holey.add(parent);
    Reflect.set(parent, segment, slots);
  }
  runtime.loadSnapshot = draft;
};

// packages/canard/schema-form/src/core/settle/utils/settlement/finishSettlement.ts
var finishSettlement = (context, scratch) => {
  for (const path of context.changedRaw) scratch.explicitRaw.add(path);
  if (context.hostWheelExceeded && !context.exceededBudget) {
    recordSettlementFailure(context, new SchemaFormError(
      BUDGET_EXCEEDED,
      `Host wheel budget exceeded at ${context.target.path}`,
      { path: context.target.path }
    ), "budget");
    context.exceededBudget = "hostWheel";
    context.iterations = context.hostWheelExceeded;
  }
  if (!context.exceededBudget && context.root.runtime.blueprint.capabilities.hasDerive)
    runDeriveRounds(context);
  if (!context.exceededBudget && (context.hasGates || context.entered.size > 0 || context.exited.size > 0 || context.writtenInputs.size > 1 || context.writtenInputs.size === 1 && (!context.writtenInputs.has(context.target) || effectiveType(context.target) !== context.target.schemaType)))
    transitionSettlement(context);
  if (context.exceededBudget) {
    restoreSourceB(context, scratch.explicitRaw);
    captureDeriveBaseline(context);
  }
  publishStateKeys(context);
  if (context.pendingExits.size > 0 || context.perished.size > 0 || context.entered.size > 0 || context.revived.size > 0 || context.exited.size > 0 || context.filledNodes.size > 0 || context.arrayCounts.size > 0)
    finalizeExits(context);
  if (context.kind !== "load" && context.arrayCounts.size > 0) {
    const resized = [...context.arrayCounts].filter(([host, previousCount]) => !host.detached && host.itemCount !== previousCount).map(([host]) => host);
    alignArraySnapshotSlots(resized);
  }
  if (context.kind === "load") {
    for (const path of context.target.runtime.typeMismatchPaths)
      if (!context.target.path || path === context.target.path || path.startsWith(`${context.target.path}/`))
        context.target.runtime.typeMismatchPaths.delete(path);
  }
  commitSettlement(context);
  const failures = context.failures;
  if (!failures?.length) return;
  const runtime = context.root.runtime;
  if (runtime.entryDepth && runtime.chainErrors) return;
  throw failures.length === 1 ? failures[0] : new SchemaFormError(
    MULTIPLE_ERRORS,
    "Multiple settlement errors",
    { errors: failures }
  );
};

// packages/canard/schema-form/src/core/settle/utils/dispose/assertSchemaNodeWritable.ts
var assertSchemaNodeWritable = (node) => {
  if (node.disposed || node.rootNode.disposed)
    throw new SchemaFormError(
      DISPOSED_NODE_WRITE,
      `Cannot write disposed node at ${node.path}`,
      { path: node.path }
    );
};

// packages/canard/schema-form/src/core/settle/utils/write/writeSchemaNode.ts
var writeSchemaNode = (node, input, kind, option, source = kind, writeOrigins) => {
  if (source === "input" && (node.disposed || node.rootNode.disposed)) return;
  assertSchemaNodeWritable(node);
  if (node.behavior.type === "virtual" && kind !== "load" && kind !== "automatic")
    assertVirtualWriteShape(node, input);
  if (node.detached) {
    if (hasLivePathKind(node)) return;
    const whole = kind !== "callerPartial" || !isPlain(input) || node.behavior.strategy !== "branch";
    if (whole) pruneLatentRaw(node.rootNode.runtime, node.path);
    distributeLatentValue(
      node.rootNode.runtime,
      void 0,
      node.path,
      node.blueprintNode,
      input,
      getLatentOrder(node.parent, node.name, node.blueprintNode),
      whole,
      node.parent?.blueprintNode.childEntries ?? []
    );
    return;
  }
  const scratch = getSettlementScratch(node.rootNode.runtime);
  const replaces = kind === "callerReplace" || kind === "input" && node.behavior.strategy === "branch" || kind === "callerPartial" && (input === null || typeof input !== "object" || (0, import_filter78.isArray)(input) || node.behavior.strategy !== "branch");
  const context = createSettlementContext(node, kind, option, scratch, replaces);
  context.source = source;
  context.writeOrigins = writeOrigins;
  try {
    if (context.hasGates) getGateRegistry(context.root.runtime).register(context.root);
    if (replaces || kind === "load")
      pruneLatentRaw(node.runtime, node.path, void 0, context);
    markWrite(node, input, context);
    if (kind !== "load" && kind !== "automatic")
      markWrongKindAncestors(node, context);
    registerRecalculation(context);
    computeNode(context.root, context);
    releaseWrongKindHosts(context);
    finishSettlement(context, scratch);
  } finally {
    releaseSettlementScratch(scratch);
  }
};

// packages/canard/schema-form/src/core/settle/utils/structure/arrangeSchemaNodeItems.ts
var import_filter83 = require("@winglet/common-utils/filter");

// packages/canard/schema-form/src/core/settle/utils/structure/applyArraySlots.ts
var import_filter82 = require("@winglet/common-utils/filter");

// packages/canard/schema-form/src/core/settle/utils/structure/rekeyArrayRuntimePaths.ts
var import_filter81 = require("@winglet/common-utils/filter");

// packages/canard/schema-form/src/core/settle/utils/structure/utils/rekeyPairedPathStore.ts
var import_filter79 = require("@winglet/common-utils/filter");
var rekeyPairedPathStore = (store, moves, mapPath, transform) => {
  const keys = /* @__PURE__ */ new Set();
  for (const move of moves)
    for (const key of store.pathIndex.under(move.previous)) keys.add(key);
  const replacements = [];
  for (const key of keys) {
    const parts = JSON.parse(key);
    if (!(0, import_filter79.isArray)(parts) || typeof parts[0] !== "string") continue;
    const value = store.get(key);
    const previous = parts[0];
    const path = mapPath(previous);
    if (path === void 0) {
      replacements.push({ previous: key, value, paths: [] });
      continue;
    }
    parts[0] = path;
    replacements.push({
      previous: key,
      key: JSON.stringify(parts),
      value: transform ? transform(value, path, previous) : value,
      paths: [path]
    });
  }
  store.replaceEntries(replacements);
};

// packages/canard/schema-form/src/core/settle/utils/structure/utils/rekeyCommittedRules.ts
var import_filter80 = require("@winglet/common-utils/filter");
var rekeyCommittedRules = (runtime, moves, mapPath) => {
  const { rules } = getRuntimePathStores(runtime);
  const keys = /* @__PURE__ */ new Set();
  for (const move of moves)
    for (const key of rules.pathIndex.under(move.previous)) keys.add(key);
  if (!keys.size) return;
  rules.pathIndex.beginBatch();
  try {
    const inserts = [];
    for (const key of keys) {
      const parts = JSON.parse(key);
      if (!(0, import_filter80.isArray)(parts) || typeof parts[0] !== "string") continue;
      const value = rules.get(key);
      updateCommittedRuleValue(runtime, key, "delete");
      const source = mapPath(parts[0]);
      const target = typeof parts[5] === "string" ? mapPath(parts[5]) : void 0;
      if (source === void 0 || typeof parts[5] === "string" && target === void 0) continue;
      parts[0] = source;
      if (target !== void 0) parts[5] = target;
      inserts.push([JSON.stringify(parts), value]);
    }
    for (const [key, value] of inserts) updateCommittedRuleValue(runtime, key, "set", value);
  } finally {
    rules.pathIndex.endBatch();
  }
};

// packages/canard/schema-form/src/core/settle/utils/structure/utils/rekeyLatentMetadata.ts
var rekeyLatentMetadata = (metadata, path, previous, hostPath) => {
  const position = hostPath === "" ? 0 : hostPath.split("/").length - 1;
  const order = [...metadata.order];
  if (previous !== path && order.length > position)
    order[position] = Number(path.slice(hostPath.length + 1).split("/")[0]);
  return { ...metadata, path, order };
};

// packages/canard/schema-form/src/core/settle/utils/structure/rekeyArrayRuntimePaths.ts
var rekeyArrayRuntimePaths = (runtime, hostPath, moves) => {
  const stores = getRuntimePathStores(runtime);
  const unaddressed = /* @__PURE__ */ new Set();
  for (const store of [
    stores.latent,
    stores.metadata,
    stores.declarations,
    stores.rules,
    stores.mismatches
  ])
    for (const path of store.pathIndex.tail(hostPath, moves.length)) unaddressed.add(path);
  prunePerishedPaths(runtime, unaddressed);
  const changed = moves.filter((move) => move.previous !== move.current);
  const prefix = `${hostPath}/`;
  const moveByPath = new Map(moves.map((move) => [move.previous, move.current]));
  const mapPath = (path) => {
    if (!path.startsWith(prefix)) return path;
    const slash = path.indexOf("/", prefix.length);
    const itemPath = slash < 0 ? path : path.slice(0, slash);
    const destination = moveByPath.get(itemPath);
    return destination === void 0 ? void 0 : destination + path.slice(itemPath.length);
  };
  const warningKeys = /* @__PURE__ */ new Set();
  for (const move of changed)
    for (const key of runtime.warningKeysByPath?.get(move.previous) ?? [])
      warningKeys.add(key);
  const warningMoves = [];
  for (const key of warningKeys) {
    const parts = JSON.parse(key);
    if (!(0, import_filter81.isArray)(parts) || typeof parts[1] !== "string") continue;
    const path = mapPath(parts[1]);
    const record = runtime.pendingWarningRecords?.get(key);
    const remembered = runtime.warningKeys?.has(key) === true;
    indexSchemaNodeWarning(runtime, key, parts[1], void 0, true);
    if (path === void 0) continue;
    parts[1] = path;
    warningMoves.push({ key: JSON.stringify(parts), path, record, remembered });
  }
  for (const move of warningMoves) {
    if (move.remembered) (runtime.warningKeys ??= /* @__PURE__ */ new Set()).add(move.key);
    indexSchemaNodeWarning(runtime, move.key, move.path, move.record);
  }
  const latentChanged = changed.some((move) => stores.latent.pathIndex.under(move.previous).size > 0 || stores.metadata.pathIndex.under(move.previous).size > 0);
  rekeyPairedPathStore(stores.latent, changed, mapPath);
  rekeyPairedPathStore(
    stores.metadata,
    changed,
    mapPath,
    (metadata, path, previous) => rekeyLatentMetadata(metadata, path, previous, hostPath)
  );
  rekeyPairedPathStore(stores.declarations, changed, mapPath);
  if (latentChanged) runtime.latentRawDirty = true;
  rekeyCommittedRules(runtime, changed, mapPath);
  const mismatchKeys = /* @__PURE__ */ new Set();
  for (const move of changed)
    for (const path of stores.mismatches.pathIndex.under(move.previous)) mismatchKeys.add(path);
  const mismatches = [];
  for (const path of mismatchKeys) {
    const current = mapPath(path);
    mismatches.push({ previous: path, current });
  }
  stores.mismatches.replacePaths(mismatches);
  for (const store of [stores.mismatchMemo, stores.inactiveMemo, stores.inactiveEntries]) {
    if (store !== stores.mismatchMemo && !latentChanged && !runtime.latentRawDirty) continue;
    const keys = /* @__PURE__ */ new Set();
    for (const move of changed)
      for (const key of store.pathIndex.intersecting(move.previous)) keys.add(key);
    for (const key of keys) store.delete(key);
  }
};

// packages/canard/schema-form/src/core/settle/utils/structure/applyArraySlots.ts
var applyArraySlots = (host, plan, context) => {
  const oldCount = host.itemCount;
  const oldItems = host.structure ?? {};
  const oldRaw = readRawTree(host, context);
  const rawSlots = (0, import_filter82.isArray)(oldRaw) ? oldRaw : [];
  const snapshot = getLoadValue(host.runtime.loadSnapshot, host.path);
  const oldSnapshot = (0, import_filter82.isArray)(snapshot) ? snapshot : [];
  const removedIndex = plan.result.source === "removed" ? plan.result.index : -1;
  const removedItem = oldItems[String(removedIndex)];
  const removed = removedIndex < 0 ? void 0 : removedItem ? removedItem.local : rawSlots[removedIndex];
  const registry = getGateRegistry(host.runtime);
  if (context.hasGates)
    for (const item of host.children ?? []) registry.remove(item);
  const nextItems = /* @__PURE__ */ Object.create(null);
  const nextRaw = [];
  const nextSnapshot = [];
  const reused = /* @__PURE__ */ new Set();
  const created = [];
  const destinations = /* @__PURE__ */ new Map();
  for (let index = 0; index < plan.slots.length; index++) {
    const slot = plan.slots[index];
    const from = "from" in slot ? slot.from : void 0;
    const value = "value" in slot ? slot.value : rawSlots[slot.from];
    nextRaw.push(value);
    nextSnapshot.push("value" in slot ? slot.value : oldSnapshot[slot.from]);
    const entry = getItemEntry(host.blueprintNode, index);
    if (!entry) continue;
    const old = from === void 0 ? void 0 : oldItems[String(from)];
    if (old && old.blueprintNode === entry.node) {
      nextItems[String(index)] = old;
      reused.add(old);
      destinations.set(from, index);
      continue;
    }
    const node = createChildNode(host, entry);
    nextItems[String(index)] = node;
    created.push({ node, value });
  }
  const moves = [];
  let perishedPaths;
  for (let index = 0; index < oldCount; index++) {
    const item = oldItems[String(index)];
    const current = destinations.get(index);
    moves.push({
      previous: `${host.path}/${index}`,
      current: current === void 0 ? void 0 : `${host.path}/${current}`
    });
    if (!item || reused.has(item)) continue;
    context.perished.add(item);
    walkOwnedSchemaNodes(item, (departing) => {
      if (!departing.runtime.detachedReads?.has(departing))
        captureDetachedSchemaNodeReads(departing, {
          emit: context.previousEmit,
          context: context.previousContext,
          schema: departing.schema.schema
        });
    });
    (perishedPaths ??= /* @__PURE__ */ new Set()).add(item.path);
  }
  if (perishedPaths) prunePerishedPaths(host.runtime, perishedPaths);
  rekeyArrayRuntimePaths(host.runtime, host.path, moves);
  context.latentDescendantKeys = void 0;
  context.enteredLatentKeys = void 0;
  for (const [name, item] of Object.entries(nextItems)) {
    if (!reused.has(item) || item.name === name) continue;
    walkOwnedSchemaNodes(item, (descendant) => {
      const previous = descendant.path;
      updateSchemaNodeNameAndPath(
        descendant,
        descendant === item ? name : descendant.name,
        descendant === item ? host : descendant.parent
      );
      context.pathChanges.push({
        node: descendant,
        previous,
        current: descendant.path
      });
      context.dirtyPaths.add(descendant.path);
      if (descendant.behavior.strategy === "branch")
        context.shapeDirtyPaths.add(descendant.path);
      context.changedNodes.add(descendant);
    });
  }
  host.itemCount = plan.slots.length;
  host.raw = void 0;
  host.extras = arrayExtras(host, nextRaw);
  host.structure = nextItems;
  host.children = captureSchemaNodeChange(host, "children", Object.values(nextItems));
  context.arrayCounts.set(host, oldCount);
  context.changedRaw.add(host.path);
  context.changedNodes.add(host);
  context.dirtyPaths.add(host.path);
  context.shapeDirtyPaths.add(host.path);
  for (const { node, value } of created) {
    context.entered.add(node);
    indexEnteredLatentKey(context, node);
    markWrite(node, value, context);
  }
  if (context.hasGates)
    for (const item of host.children)
      walkOwnedSchemaNodes(item, (node) => registry.register(node));
  host.runtime.loadSnapshot = setLoadValue(
    host.runtime.loadSnapshot,
    host.path,
    nextSnapshot
  );
  return removed;
};

// packages/canard/schema-form/src/core/settle/utils/structure/arrangeSchemaNodeItems.ts
var resultOf = (node, plan, removed) => {
  if (plan.kind === "update") return void 0;
  if (plan.result.source === "removed") return removed;
  if (plan.result.source === "length")
    return plan.kind === "slots" ? node.itemCount : (0, import_filter83.isArray)(node.raw) ? node.raw.length : 0;
  if (plan.result.source === "updated")
    return (0, import_filter83.isArray)(node.local) ? node.local[plan.result.index] : void 0;
  return void 0;
};
var arrangeSchemaNodeItems = (node, operation) => {
  const plan = node.behavior.arrange(node, operation);
  if (plan.kind === "noop")
    return operation.kind === "push" ? node.behavior.strategy === "branch" ? node.itemCount : (0, import_filter83.isArray)(node.raw) ? node.raw.length : 0 : void 0;
  if (plan.kind === "raw") {
    const previous = (0, import_filter83.isArray)(node.raw) && plan.result.source === "removed" ? node.raw[plan.result.index] : void 0;
    writeSchemaNode(node, plan.raw, "callerReplace", SetValueOption.Overwrite);
    return resultOf(node, plan, previous);
  }
  if (node.detached || plan.kind === "update" && !node.structure?.[String(plan.index)]) {
    const scratch2 = getSettlementScratch(node.rootNode.runtime);
    const context2 = createSettlementContext(
      node,
      "callerReplace",
      SetValueOption.Overwrite,
      scratch2
    );
    let oldRaw;
    try {
      oldRaw = readRawTree(node, context2);
    } finally {
      releaseSettlementScratch(scratch2);
    }
    const source = (0, import_filter83.isArray)(oldRaw) ? oldRaw : [];
    const copy = source.slice();
    if (plan.kind === "update") copy[plan.index] = plan.value;
    else {
      copy.length = 0;
      for (const slot of plan.slots)
        copy.push("from" in slot ? source[slot.from] : slot.value);
    }
    const removed = plan.kind === "slots" && plan.result.source === "removed" ? node.structure?.[String(plan.result.index)]?.local ?? source[plan.result.index] : void 0;
    writeSchemaNode(node, copy, "callerReplace", SetValueOption.Overwrite);
    if (plan.kind === "update") {
      if (node.detached) return copy[plan.index];
      const item = node.structure?.[String(plan.index)];
      if (item) return item.local;
      const readScratch = getSettlementScratch(node.rootNode.runtime);
      try {
        const readContext = createSettlementContext(
          node,
          "callerReplace",
          SetValueOption.Overwrite,
          readScratch
        );
        const current = readRawTree(node, readContext);
        return (0, import_filter83.isArray)(current) ? current[plan.index] : void 0;
      } finally {
        releaseSettlementScratch(readScratch);
      }
    }
    return node.detached ? plan.result.source === "length" ? copy.length : removed : resultOf(node, plan, removed);
  }
  if (plan.kind === "update") {
    const item = node.structure?.[String(plan.index)];
    if (!item) return void 0;
    writeSchemaNode(item, plan.value, "callerReplace", SetValueOption.Overwrite);
    return item.local;
  }
  const scratch = getSettlementScratch(node.rootNode.runtime);
  const context = createSettlementContext(
    node,
    "callerReplace",
    SetValueOption.Overwrite,
    scratch
  );
  try {
    if (context.hasGates) getGateRegistry(context.root.runtime).register(context.root);
    const removed = applyArraySlots(node, plan, context);
    registerRecalculation(context);
    computeNode(context.root, context);
    finishSettlement(context, scratch);
    return resultOf(node, plan, removed);
  } finally {
    releaseSettlementScratch(scratch);
  }
};

// packages/canard/schema-form/src/core/settle/utils/load/canLoadStaticFirstTree.ts
var canLoadStaticFirstTree = (root, value) => value === void 0 && root.parent === null && !root.disposed && !root.detached && !root.deliveryInitialized && !root.runtime.commitNumber && !root.children?.length && !root.pendingDelivery && !root.pendingRevision && root.raw === void 0 && root.extras === void 0 && !root.runtime.deliveries?.size && root.runtime.latentRaw.size === 0 && root.runtime.globalStateCounts.size === 0 && StaticFirstLoadCapability.has(root.runtime.blueprint);

// packages/canard/schema-form/src/core/settle/utils/load/loadStaticFirstTree.ts
var import_filter85 = require("@winglet/common-utils/filter");
var import_lib33 = require("@winglet/common-utils/lib");

// packages/canard/schema-form/src/core/settle/utils/load/assembleStaticFirstNode.ts
var NO_CHILDREN2 = Object.freeze([]);
var assembleStaticFirstNode = (node) => {
  const children = node.children ?? NO_CHILDREN2;
  let local;
  let emit;
  switch (node.behavior.type) {
    case "object":
      local = node.behavior.assemble(node, children);
      emit = node.behavior.project(node, local);
      break;
    case "array":
      local = node.behavior.assemble(node, children);
      emit = node.behavior.project(node, local);
      break;
    case "string":
      local = node.behavior.assemble(node, children);
      emit = node.behavior.project(node, local);
      break;
    case "number":
      local = node.behavior.assemble(node, children);
      emit = node.behavior.project(node, local);
      break;
    case "boolean":
      local = node.behavior.assemble(node, children);
      emit = node.behavior.project(node, local);
      break;
    case "null":
      local = node.behavior.assemble(node, children);
      emit = node.behavior.project(node, local);
  }
  node.local = local;
  node.emit = node.parent === null && emit === void 0 && (node.behavior.type === "object" || node.behavior.type === "array") ? local : emit;
};

// packages/canard/schema-form/src/core/settle/utils/load/commitStaticFirstNode.ts
var DEVELOPMENT2 = false;
var commitStaticFirstNode = (node, automatic) => {
  const current = node.behavior.strategy === "branch" ? { local: node.local, emit: node.emit } : node.local;
  const payload = { previous: void 0, current };
  const type = 4 /* UpdateValue */ | 8192 /* RequestRefresh */;
  node.pendingDelivery = {
    type,
    payload: { [4 /* UpdateValue */]: DEVELOPMENT2 ? Object.freeze(payload) : payload },
    options: { [4 /* UpdateValue */]: { source: automatic ? "automatic" : "load" } }
  };
  node.deliveryInitialized = true;
  node.revisionLedger = new SchemaNodeRevisionLedger(node.revisionLedger, type);
  node.pendingRevision = 0;
};

// packages/canard/schema-form/src/core/settle/utils/load/getStaticObjectEntries.ts
var ENTRIES2 = /* @__PURE__ */ new WeakMap();
var getStaticObjectEntries = (template) => {
  const cached = ENTRIES2.get(template);
  if (cached) return cached;
  const byName = /* @__PURE__ */ Object.create(null);
  const entries = template.childEntries;
  for (let index = 0; index < entries.length; index++) byName[entries[index].name] = entries[index];
  const result = Object.freeze(Object.values(byName));
  ENTRIES2.set(template, result);
  return result;
};

// packages/canard/schema-form/src/core/settle/utils/load/isMissingStaticInput.ts
var import_filter84 = require("@winglet/common-utils/filter");
var import_lib32 = require("@winglet/common-utils/lib");
var isMissingStaticInput = (template, value) => {
  if (value === void 0) return true;
  if (template.strategy !== "branch") return false;
  if (template.kind === "array") {
    if (!(0, import_filter84.isArray)(value)) return false;
    for (let index = 0; index < value.length; index++) {
      const entry = getItemEntry(template, index);
      if (!entry || !isMissingStaticInput(entry.node, value[index])) return false;
    }
    return true;
  }
  if (!isPlain(value)) return false;
  const names = Object.keys(value);
  const declared = getDeclaredChildNames(template);
  for (let index = 0; index < names.length; index++)
    if (!declared.has(names[index])) return false;
  const entries = template.childEntries;
  for (let index = 0; index < entries.length; index++) {
    const entry = entries[index];
    if ((0, import_lib32.hasOwnProperty)(value, entry.name) && !isMissingStaticInput(entry.node, Reflect.get(value, entry.name))) return false;
  }
  return true;
};

// packages/canard/schema-form/src/core/settle/utils/load/finishStaticFirstLoad.ts
var EMPTY_WARNINGS2 = Object.freeze([]);
var EMPTY_PATHS3 = Object.freeze([]);
var finishStaticFirstLoad = (root, option, warnings) => {
  const runtime = root.runtime;
  const commit = runtime.commitNumber;
  if (false)
    runtime.settlementTrace = { entry: { api: "load", option }, rounds: [] };
  else delete runtime.settlementTrace;
  runtime.refreshTargets ??= /* @__PURE__ */ new Set();
  runtime.refreshTargets.clear();
  const records = warnings ? [] : void 0;
  if (warnings) {
    warnings.sort((left, right) => left.order - right.order);
    for (let index = 0; index < warnings.length; index++) {
      const warning = warnings[index].warning;
      records.push(warning);
      runtime.typeMismatchPaths.add(warning.path);
      if (!runtime.errorReporter?.hasConsumer()) continue;
      const code = `SCHEMA_FORM_WARNING.${TYPE_MISMATCH}`;
      const record = {
        level: "warning",
        code,
        path: warning.path,
        message: `Type mismatch at ${warning.path} (commit ${commit})`,
        details: {
          path: warning.path,
          expected: warning.expected,
          received: warning.received,
          reason: warning.reason,
          ...warning.candidates ? { candidates: warning.candidates } : {},
          source: warning.source
        }
      };
      indexSchemaNodeWarning(runtime, JSON.stringify([code, warning.path, commit]), warning.path, record);
      runtime.chainOccurrences?.push({ kind: "record", record });
    }
  }
  runtime.typeMismatchRecords = records ? Object.freeze(records) : EMPTY_WARNINGS2;
  const memo = runtime.typeMismatchesMemo ??= new PathKeyedMap("path");
  memo.clear();
  if (!runtime.typeMismatchPaths.size) memo.set("", { commit, paths: EMPTY_PATHS3 });
  else {
    const paths = [...runtime.typeMismatchPaths].sort();
    memo.set("", { commit, paths: Object.freeze(paths) });
    const byAncestor = /* @__PURE__ */ new Map();
    for (let index = 0; index < paths.length; index++) {
      const path = paths[index];
      let ancestor = path;
      while (ancestor) {
        let children = byAncestor.get(ancestor);
        if (!children) {
          children = [];
          byAncestor.set(ancestor, children);
        }
        children.push(path);
        ancestor = ancestor.slice(0, ancestor.lastIndexOf("/"));
      }
    }
    for (const [ancestor, children] of byAncestor)
      memo.set(ancestor, { commit, paths: Object.freeze(children) });
  }
  runtime.inactiveValueEntries ??= new PathKeyedMap("pair");
  runtime.inactiveValuesMemo.set("", EMPTY_VALUES);
  runtime.latentRawDirty = false;
  runtime.deliveredDiagnostics = runtime.diagnostics;
  runtime.deliveredContext = runtime.context;
  runtime.deliveryAffectedPaths = void 0;
};

// packages/canard/schema-form/src/core/settle/utils/load/readStaticFirstWarning.ts
var readStaticFirstWarning = (node, automatic) => {
  const effective = effectiveType(node);
  if (!isTypeMismatch(node.raw, effective, node.nullable)) return void 0;
  const candidates = conversionCandidates(node, effective);
  const ambiguous = candidates.length > 1;
  return {
    level: "warning",
    code: TYPE_MISMATCH,
    path: node.path,
    expected: { schemaType: node.schemaType, nullable: node.nullable, effective },
    received: receivedType(node.raw),
    reason: ambiguous ? "ambiguous" : "unconvertible",
    ...ambiguous ? { candidates } : {},
    source: automatic ? "fill" : "load"
  };
};

// packages/canard/schema-form/src/core/settle/utils/load/loadStaticFirstTree.ts
var EMPTY2 = Object.freeze([]);
var loadStaticFirstTree = (root, option) => {
  const runtime = root.runtime;
  const commit = (runtime.commitNumber ?? 0) + 1;
  const disable = (option & SetValueOption.DisableAutomaticWrites) !== 0;
  const enable = (option & SetValueOption.EnableAutomaticWrites) !== 0;
  const suppress = disable || !enable && runtime.disableAutomaticWrites === true;
  const deliveries = runtime.deliveries ??= /* @__PURE__ */ new Set();
  const stack = [{
    node: root,
    input: void 0,
    automatic: false,
    entered: false,
    index: 0,
    entries: EMPTY2,
    required: EMPTY2,
    order: 0,
    children: void 0
  }];
  let deltas;
  let warnings;
  let order = 0;
  while (stack.length) {
    const frame = stack[stack.length - 1];
    const node = frame.node;
    if (!frame.entered) {
      frame.entered = true;
      frame.order = order++;
      deliveries.add(node);
      const schema = node.schema.schema;
      const authored = typeof schema === "object" && schema !== null ? schema : void 0;
      const fallback = authored && (0, import_lib33.hasOwnProperty)(authored, "default") ? authored.default : void 0;
      let input = frame.input;
      if (!suppress && fallback !== void 0 && !(node.behavior.type === "array" && node.behavior.strategy === "branch" && input !== void 0) && isMissingStaticInput(node.blueprintNode, input)) {
        input = fallback;
        frame.automatic = true;
      }
      const value = node.behavior.interpret(input, staticSpec(node.schemaType, node.nullable));
      frame.input = value;
      if (node.behavior.strategy === "branch") {
        node.structure = /* @__PURE__ */ Object.create(null);
        node.children = frame.children = [];
        if (node.behavior.type === "array") {
          const array = (0, import_filter85.isArray)(value);
          node.itemCount = array ? value.length : 0;
          node.raw = array ? void 0 : value;
          node.extras = array ? arrayExtras(node, value) : void 0;
          frame.entries = node.behavior.declareChildren(node);
        } else {
          const object = isPlain(value);
          node.raw = object ? void 0 : value;
          node.extras = object ? nextExtras(
            void 0,
            value,
            getDeclaredChildNames(node.blueprintNode),
            false
          ) : void 0;
          frame.entries = getStaticObjectEntries(node.blueprintNode);
          frame.required = (0, import_filter85.isArray)(authored?.required) ? authored.required : EMPTY2;
        }
      } else node.raw = value;
      const state = node.interactionState;
      for (const key in state)
        if ((0, import_lib33.hasOwnProperty)(state, key) && state[key]) {
          deltas ??= /* @__PURE__ */ new Map();
          deltas.set(key, (deltas.get(key) ?? 0) + 1);
        }
    }
    if (frame.index < frame.entries.length) {
      const entry = frame.entries[frame.index++];
      const child = createChildNode(node, entry);
      node.structure[entry.name] = child;
      frame.children.push(child);
      child.required = frame.required.includes(entry.name);
      const input = frame.input !== null && typeof frame.input === "object" && (0, import_lib33.hasOwnProperty)(frame.input, entry.name) ? Reflect.get(frame.input, entry.name) : void 0;
      stack.push({
        node: child,
        input,
        automatic: frame.automatic,
        entered: false,
        index: 0,
        entries: EMPTY2,
        required: EMPTY2,
        order: 0,
        children: void 0
      });
      continue;
    }
    assembleStaticFirstNode(node);
    commitStaticFirstNode(node, frame.automatic);
    const warning = readStaticFirstWarning(node, frame.automatic);
    if (warning) (warnings ??= []).push({ order: frame.order, warning });
    stack.pop();
  }
  runtime.commitNumber = commit;
  if (deltas) publishGlobalStateDeltas(root, deltas);
  finishStaticFirstLoad(root, option, warnings);
};

// packages/canard/schema-form/src/core/settle/utils/load/loadSchemaNodeAtMount.ts
var loadSchemaNodeAtMount = (root, value, option) => {
  const nextSnapshot = setLoadValue(root.runtime.loadSnapshot, "", value);
  root.runtime.diagnostics = { status: "stable" };
  try {
    if (canLoadStaticFirstTree(root, value)) loadStaticFirstTree(root, option);
    else writeSchemaNode(root, value, "load", option);
  } finally {
    root.runtime.loadSnapshot = nextSnapshot;
  }
};

// packages/canard/schema-form/src/core/settle/utils/load/clearSubtreeState.ts
var clearSubtreeState = (node) => {
  const pending = [node];
  const visited = /* @__PURE__ */ new Set();
  while (pending.length) {
    const current = pending.pop();
    if (!current || visited.has(current)) continue;
    visited.add(current);
    current.interactionReset += 1;
    current.interactionState = captureSchemaNodeChange(current, "interactionState", {});
    for (const child of current.children ?? []) pending.push(child);
  }
};

// packages/canard/schema-form/src/core/settle/utils/load/resetSchemaNodeSubtree.ts
var resetSchemaNodeSubtree = (node, option) => {
  if (node.detached && hasLivePathKind(node)) return;
  const value = getLoadValue(node.runtime.loadSnapshot, node.path);
  node.runtime.loadSnapshot = setLoadValue(node.runtime.loadSnapshot, node.path, value);
  clearSubtreeState(node);
  writeSchemaNode(node, value, "load", option);
};

// packages/canard/schema-form/src/core/settle/utils/detached/readSchemaNodeInactiveValues.ts
var readSchemaNodeInactiveValues = (node) => node.detached ? node.runtime.detachedReads?.get(node)?.inactiveValues ?? EMPTY_VALUES : node.runtime.inactiveValuesMemo.get(node.path) ?? EMPTY_VALUES;

// packages/canard/schema-form/src/core/settle/utils/detached/readSchemaNodeTypeMismatch.ts
var readSchemaNodeTypeMismatch = (node) => node.detached ? node.runtime.detachedReads?.get(node)?.typeMismatch ?? false : node.runtime.typeMismatchPaths.has(node.path);

// packages/canard/schema-form/src/core/settle/utils/detached/readSchemaNodeTypeMismatches.ts
var readSchemaNodeTypeMismatches = (node) => node.detached ? node.runtime.detachedReads?.get(node)?.typeMismatches ?? EMPTY_PATHS : node.runtime.typeMismatchesMemo?.get(node.path)?.paths ?? EMPTY_PATHS;

// packages/canard/schema-form/src/core/settle/utils/write/interpretSchemaNodeInput.ts
var import_filter86 = require("@winglet/common-utils/filter");
var OBJECT_CHILDREN = /* @__PURE__ */ new WeakMap();
var interpretSchemaNodeInput = (template, input, seen = /* @__PURE__ */ new WeakSet()) => {
  const row = BEHAVIORS[template.kind]?.[template.strategy];
  const value = row ? row.interpret(
    input,
    staticSpec(template.schemaType, template.nullable)
  ) : input;
  if (template.strategy !== "branch" || value === null || typeof value !== "object" || seen.has(value)) return value;
  seen.add(value);
  try {
    if (template.kind === "array" && (0, import_filter86.isArray)(value)) {
      let copy;
      for (let index = 0; index < value.length; index++) {
        const child = getItemEntry(template, index);
        if (!child) continue;
        const next = interpretSchemaNodeInput(child.node, value[index], seen);
        if (next !== value[index]) (copy ??= value.slice())[index] = next;
      }
      return copy ?? value;
    }
    if (template.kind === "object" && isPlain(value)) {
      let children = OBJECT_CHILDREN.get(template);
      if (!children) {
        const bindings = /* @__PURE__ */ new Map();
        for (const entry of template.childEntries)
          if (!bindings.has(entry.name)) bindings.set(entry.name, entry.node);
        OBJECT_CHILDREN.set(template, children = bindings);
      }
      let copy;
      for (const name of Object.keys(value)) {
        const child = children.get(name);
        if (!child) continue;
        const next = interpretSchemaNodeInput(child, value[name], seen);
        if (next !== value[name]) (copy ??= { ...value })[name] = next;
      }
      return copy ?? value;
    }
    return value;
  } finally {
    seen.delete(value);
  }
};

// packages/canard/schema-form/src/core/dispatch/utils/report/assertNotInDelivery.ts
var assertNotInDelivery = (runtime) => {
  if (runtime.reportingErrors)
    throw new SchemaFormError(
      WRITE_IN_OBSERVER,
      "A form cannot be written while its error observer is running"
    );
};

// packages/canard/schema-form/src/core/dispatch/utils/chain/captureChainError.ts
var captureChainError = (runtime, error) => {
  runtime.chainErrors?.push(error);
  if (runtime.errorReporter?.hasConsumer())
    runtime.chainOccurrences?.push({ kind: "error", error });
};

// packages/canard/schema-form/src/core/dispatch/utils/chain/refuseListenerFeedback.ts
var refuseListenerFeedback = (runtime) => {
  if (!runtime.entryDepth || !runtime.currentListener || (runtime.feedbackBudget ?? 0) < 25) return false;
  (runtime.feedbackBlockedListeners ??= /* @__PURE__ */ new Set()).add(runtime.currentListener);
  if (!runtime.feedbackLimitReported) {
    captureChainError(runtime, new SchemaFormError(
      FEEDBACK_LIMIT_EXCEEDED,
      "Listener feedback exceeded 25 waves"
    ));
    runtime.feedbackLimitReported = true;
  }
  return true;
};

// packages/canard/schema-form/src/core/dispatch/utils/chain/enterSchemaNodeChain.ts
var enterSchemaNodeChain = (node) => {
  assertSchemaNodeWritable(node);
  const runtime = node.rootNode.runtime;
  assertNotInDelivery(runtime);
  if (!runtime.entryDepth) {
    runtime.enclosingChain = runtime.chainErrors && runtime.chainOccurrences ? {
      errors: runtime.chainErrors,
      occurrences: runtime.chainOccurrences,
      outer: runtime.enclosingChain
    } : void 0;
    runtime.chainRoot = node.rootNode;
    runtime.chainInitialEmit = node.rootNode.emit;
    runtime.chainErrors = [];
    runtime.chainOccurrences = [];
    runtime.feedbackBudget = 0;
    runtime.feedbackBlockedListeners = void 0;
    runtime.feedbackLimitReported = false;
  }
  if (refuseListenerFeedback(runtime)) return false;
  runtime.entryDepth = (runtime.entryDepth ?? 0) + 1;
  return true;
};

// packages/canard/schema-form/src/core/dispatch/utils/chain/exitSchemaNodeChain.ts
var import_filter87 = require("@winglet/common-utils/filter");

// packages/canard/schema-form/src/core/dispatch/utils/chain/utils/compareDocumentOrder.ts
var compareDocumentOrder = (left, right, siblingIndexes) => {
  if (left === right) return 0;
  const leftLine = [];
  const rightLine = [];
  for (let node = left; node; node = node.parent) leftLine.push(node);
  for (let node = right; node; node = node.parent) rightLine.push(node);
  leftLine.reverse();
  rightLine.reverse();
  let index = 0;
  while (index < leftLine.length && index < rightLine.length && leftLine[index] === rightLine[index]) index += 1;
  if (index === leftLine.length) return -1;
  if (index === rightLine.length) return 1;
  const parent = leftLine[index - 1];
  let positions = siblingIndexes.get(parent);
  if (!positions) {
    positions = /* @__PURE__ */ new Map();
    for (const [position, child] of (parent.children ?? []).entries())
      positions.set(child, position);
    siblingIndexes.set(parent, positions);
  }
  return (positions.get(leftLine[index]) ?? -1) - (positions.get(rightLine[index]) ?? -1);
};

// packages/canard/schema-form/src/core/dispatch/utils/chain/deliverWave.ts
var isWaveNode = (value, runtime) => value !== null && typeof value === "object" && Reflect.get(value, "runtime") === runtime;
var deliverWave = (root, pending) => {
  const runtime = root.runtime;
  const fixed = [];
  for (const [candidate, event] of pending) {
    if (!isWaveNode(candidate, runtime)) continue;
    const listeners = runtime.listeners?.get(candidate);
    if (listeners?.size) fixed.push({ node: candidate, event, listeners: [...listeners] });
  }
  const siblingIndexes = /* @__PURE__ */ new Map();
  fixed.sort((left, right) => compareDocumentOrder(left.node, right.node, siblingIndexes));
  for (const { node, event, listeners } of fixed) {
    if (node.detached) continue;
    for (const listener of listeners) {
      if (!runtime.listeners?.get(node)?.has(listener) || runtime.feedbackBlockedListeners?.has(listener)) continue;
      runtime.currentListener = listener;
      try {
        listener(event);
      } catch (error) {
        captureChainError(runtime, error);
      } finally {
        runtime.currentListener = void 0;
      }
    }
  }
};

// packages/canard/schema-form/src/core/dispatch/utils/chain/runDeliveryWaves.ts
var runDeliveryWaves = (root) => {
  const runtime = root.runtime;
  let waves = 0;
  while (runtime.deliveries?.size) {
    const pending = [];
    for (const node of runtime.deliveries) {
      if (node.pendingDelivery) pending.push([node, node.pendingDelivery]);
      node.pendingDelivery = void 0;
    }
    runtime.deliveries = /* @__PURE__ */ new Set();
    waves += 1;
    runtime.feedbackBudget = waves - 1;
    deliverWave(root, pending);
  }
};

// packages/canard/schema-form/src/core/dispatch/utils/report/bundleChainErrors.ts
var bundleChainErrors = (errors) => errors.length < 2 ? errors[0] : new SchemaFormError(
  MULTIPLE_ERRORS,
  "Multiple dispatch errors",
  { errors }
);

// packages/canard/schema-form/src/core/dispatch/utils/report/createFormErrorRecord.ts
function createFormErrorRecord(consumed, code, levelOrError, format, fields) {
  if (!consumed) return void 0;
  if (typeof code === "string") {
    if (levelOrError !== "error" && levelOrError !== "warning" || !format)
      return void 0;
    return { level: levelOrError, code, message: format(), ...fields };
  }
  const fullCode = FORM_ERROR_CODE_TABLE.find(([candidate]) => candidate === `${code.level === "error" ? "JSON_SCHEMA_ERROR" : "SCHEMA_FORM_WARNING"}.${code.code}`)?.[0];
  if (!fullCode) return void 0;
  const error = levelOrError;
  const message = error instanceof Error ? error.message : `${code.code} at ${code.schemaPath}`;
  const details = error instanceof JSONSchemaError ? error.details : { ...code.details };
  if (code.level === "error")
    return {
      level: "error",
      code: fullCode,
      message,
      schemaPath: code.schemaPath,
      details,
      error,
      surface: "sink"
    };
  return {
    level: "warning",
    code: fullCode,
    message,
    schemaPath: code.schemaPath,
    details
  };
}

// packages/canard/schema-form/src/core/dispatch/utils/report/readFormErrorCode.ts
var readFormErrorCode = (error) => error instanceof SchemaFormError || error instanceof JSONSchemaError ? FORM_ERROR_CODE_TABLE.find(([code]) => code === error.code)?.[0] ?? `SCHEMA_FORM_ERROR.${LISTENER_THREW}` : `SCHEMA_FORM_ERROR.${LISTENER_THREW}`;

// packages/canard/schema-form/src/core/dispatch/utils/report/collectChainRecords.ts
var collectChainRecords = (pending, occurrences, aggregate, surface, reported) => {
  const created = /* @__PURE__ */ new Set();
  for (const occurrence of occurrences) {
    if (occurrence.kind === "record") {
      pending.push(occurrence.record);
      continue;
    }
    const error = occurrence.error;
    const existing = pending.find((record2) => !created.has(record2) && record2.level === "error" && record2.code === readFormErrorCode(error) && error instanceof SchemaFormError && record2.schemaPath === error.details.schemaPath);
    if (existing && error instanceof SchemaFormError) {
      if (!aggregate || existing.aggregate !== aggregate) {
        existing.error = error;
        existing.details = error.details;
      }
      existing.surface = surface;
      if (aggregate) existing.aggregate = aggregate;
      continue;
    }
    if (error instanceof SchemaFormError && readFormErrorCode(error) === "SCHEMA_FORM_ERROR.GUARD_FAILED" && typeof error.details.schemaPath === "string" && reported?.has(error.details.schemaPath)) continue;
    const record = createFormErrorRecord(
      true,
      readFormErrorCode(error),
      "error",
      () => error instanceof Error ? error.message : String(error),
      {
        error,
        ...error instanceof SchemaFormError || error instanceof JSONSchemaError ? { details: error.details } : {},
        ...error instanceof SchemaFormError && typeof error.details.path === "string" ? { path: error.details.path } : {},
        ...error instanceof SchemaFormError && typeof error.details.schemaPath === "string" ? { schemaPath: error.details.schemaPath } : {},
        ...aggregate ? { aggregate } : {},
        surface
      }
    );
    if (record) {
      pending.push(record);
      created.add(record);
    }
  }
};

// packages/canard/schema-form/src/core/dispatch/utils/report/reportOwnerlessError.ts
var reportOwnerlessError = (error) => {
  if (typeof window !== "undefined") {
    if ("reportError" in window && typeof window.reportError === "function") {
      window.reportError(error);
      return;
    }
    if (typeof ErrorEvent !== "undefined") {
      if (!window.dispatchEvent(new ErrorEvent("error", { error, message: String(error) })))
        return;
    }
  }
  console.error(error);
};

// packages/canard/schema-form/src/core/dispatch/utils/report/deliverChainRecords.ts
var deliverChainRecords = (runtime, records, original, caller) => {
  const failures = [];
  const reporter = runtime.errorReporter;
  for (const record of records) {
    if (!reporter?.hasConsumer()) {
      if (false)
        console.warn(record.code, record.message, record.details);
      continue;
    }
    runtime.reportingErrors = true;
    try {
      reporter.report(record);
    } catch (error) {
      if (caller) failures.push(error);
      else reportOwnerlessError(error);
    } finally {
      runtime.reportingErrors = false;
    }
  }
  if (!caller && original !== void 0) reportOwnerlessError(original);
  return failures;
};

// packages/canard/schema-form/src/core/dispatch/utils/report/finishQueuedErrors.ts
var finishQueuedErrors = (runtime, errors, occurrences, caller) => {
  const original = bundleChainErrors(errors);
  const aggregate = errors.length > 1 && original instanceof SchemaFormError ? original : void 0;
  const pending = [];
  collectChainRecords(
    pending,
    occurrences,
    aggregate,
    caller ? "thrown" : "sink",
    runtime.reportedGuardFailures
  );
  const handlerErrors = deliverChainRecords(runtime, pending, original, caller);
  if (caller && (errors.length || handlerErrors.length))
    throw errors.length && handlerErrors.length ? bundleChainErrors([original, ...handlerErrors]) : errors.length ? original : bundleChainErrors(handlerErrors);
};

// packages/canard/schema-form/src/core/dispatch/utils/chain/flushQueuedEvents.ts
var isQueuedNode = (candidate, runtime) => candidate !== null && typeof candidate === "object" && Reflect.get(candidate, "runtime") === runtime && Reflect.get(candidate, "detached") === false;
var flushQueuedEvents = (root, caller = true) => {
  const runtime = root.runtime;
  if (runtime.flushingQueuedEvents) return;
  runtime.flushingQueuedEvents = true;
  const standalone = !runtime.entryDepth && !runtime.chainErrors;
  const previousErrors = runtime.chainErrors;
  const previousOccurrences = runtime.chainOccurrences;
  let waves = 0;
  let budgetReported = false;
  if (standalone) {
    runtime.chainErrors = [];
    runtime.chainOccurrences = [];
  }
  try {
    while (runtime.queuedNonSettleEvents?.size || runtime.deliveries?.size || !runtime.entryDepth && runtime.stateChanged) {
      if (runtime.deliveries?.size) {
        runDeliveryWaves(root);
        continue;
      }
      if (runtime.queuedNonSettleEvents?.size) {
        waves += 1;
        if (waves > 25) {
          for (const node of runtime.queuedNonSettleEvents)
            node.pendingNonSettleDelivery = void 0;
          runtime.queuedNonSettleEvents = void 0;
          if (!budgetReported)
            captureChainError(runtime, new SchemaFormError(
              FEEDBACK_LIMIT_EXCEEDED,
              "Non-settlement feedback exceeded 25 waves"
            ));
          budgetReported = true;
          continue;
        }
        const pending = [];
        for (const candidate of runtime.queuedNonSettleEvents) {
          const delivery = candidate.pendingNonSettleDelivery;
          candidate.pendingNonSettleDelivery = void 0;
          if (!delivery) continue;
          if (!isQueuedNode(candidate, runtime)) continue;
          const node = candidate;
          pending.push([node, delivery]);
          node.revisionLedger = new SchemaNodeRevisionLedger(
            node.revisionLedger,
            delivery.type
          );
        }
        runtime.queuedNonSettleEvents = void 0;
        deliverWave(root, pending);
        continue;
      }
      runtime.stateChanged = false;
      try {
        runtime.onStateChange?.();
      } catch (error) {
        captureChainError(runtime, error);
      }
    }
    if (standalone) finishQueuedErrors(
      runtime,
      runtime.chainErrors ?? [],
      runtime.chainOccurrences ?? [],
      caller
    );
  } finally {
    runtime.flushingQueuedEvents = false;
    if (standalone) {
      runtime.chainErrors = previousErrors;
      runtime.chainOccurrences = previousOccurrences;
    }
  }
};

// packages/canard/schema-form/src/core/dispatch/utils/chain/queueNonSettleEvent.ts
var queueNonSettleEvent = (node, bit, payload) => {
  const runtime = node.rootNode.runtime;
  const queued = runtime.queuedNonSettleEvents ?? /* @__PURE__ */ new Set();
  const previous = node.pendingNonSettleDelivery;
  node.pendingNonSettleDelivery = {
    type: (previous?.type ?? 0) | bit,
    payload: payload === void 0 ? previous?.payload : { ...previous?.payload, [bit]: payload }
  };
  queued.add(node);
  runtime.queuedNonSettleEvents = queued;
};

// packages/canard/schema-form/src/core/dispatch/utils/chain/deliverValidationWave.ts
var deliverValidationWave = (node, issues, commit) => {
  const runtime = node.rootNode.runtime;
  if ((runtime.commitNumber ?? 0) !== commit) return;
  for (const changed of runtime.validationChangedNodes ?? [])
    queueNonSettleEvent(
      changed,
      32 /* UpdateError */,
      runtime.validationErrors?.get(changed) ?? []
    );
  runtime.validationChangedNodes = void 0;
  queueNonSettleEvent(node.rootNode, 64 /* UpdateGlobalError */, issues);
  flushQueuedEvents(node.rootNode, false);
};

// packages/canard/schema-form/src/core/dispatch/utils/report/reportValidationFailure.ts
var reportValidationFailure = (runtime, failure) => {
  if (runtime.errorReporter?.hasConsumer()) {
    const wasReporting = runtime.reportingErrors;
    runtime.reportingErrors = true;
    try {
      runtime.errorReporter.report({
        level: "error",
        code: readFormErrorCode(failure),
        message: failure instanceof Error ? failure.message : String(failure),
        ...failure instanceof SchemaFormError ? { details: failure.details } : {},
        error: failure,
        surface: "sink"
      });
    } catch (reporterFailure) {
      reportOwnerlessError(reporterFailure);
    } finally {
      runtime.reportingErrors = wasReporting;
    }
  }
  reportOwnerlessError(failure);
};

// packages/canard/schema-form/src/core/dispatch/utils/chain/resolveSchemaNodeChainRoot.ts
var isSchemaNodeChainRoot = (value) => value !== null && typeof value === "object" && "runtime" in value && "rootNode" in value;
var resolveSchemaNodeChainRoot = (root) => {
  let active = root;
  while (isSchemaNodeChainRoot(active.runtime.adoptedRoot))
    active = active.runtime.adoptedRoot;
  return active;
};

// packages/canard/schema-form/src/core/dispatch/utils/chain/exitSchemaNodeChain.ts
var exitSchemaNodeChain = (node, failure) => {
  const activeRoot = resolveSchemaNodeChainRoot(node.rootNode);
  const runtime = activeRoot.runtime;
  if (failure !== void 0) captureChainError(runtime, failure);
  if ((runtime.entryDepth ?? 0) > 1) {
    runtime.entryDepth = (runtime.entryDepth ?? 0) - 1;
    return;
  }
  const root = runtime.chainRoot ?? activeRoot;
  runDeliveryWaves(root);
  flushQueuedEvents(root);
  const occurrences = runtime.chainOccurrences ?? [];
  const pending = [];
  const warnings = runtime.pendingWarningRecords;
  if (warnings?.size) {
    for (const [key, record] of warnings) {
      if (!occurrences.some((item) => item.kind === "record" && item.record === record))
        pending.push(record);
      if (!runtime.warningKeys?.has(key)) {
        const parts = JSON.parse(key.startsWith("[") ? key : "null");
        const path = (0, import_filter87.isArray)(parts) ? parts[1] : void 0;
        indexSchemaNodeWarning(
          runtime,
          key,
          typeof path === "string" ? path : void 0,
          void 0,
          true
        );
      }
    }
    warnings.clear();
  }
  const guardRecords = runtime.guardFailureRecords;
  if (guardRecords?.size) {
    for (const [key, record] of guardRecords) {
      if (!occurrences.some((item) => item.kind === "record" && item.record === record))
        pending.push(record);
      (runtime.reportedGuardFailures ??= /* @__PURE__ */ new Set()).add(key);
    }
    guardRecords.clear();
  }
  const changed = runtime.chainInitialEmit !== root.emit;
  const requests = runtime.validationTargets;
  if (!runtime.deferMountValidation && runtime.validationMode && runtime.validationMode & ValidationMode.OnChange) {
    runtime.reportValidationFailure ??= (error) => reportValidationFailure(runtime, error);
    if (changed && !requests?.has(root)) {
      requestSchemaNodeValidation(root, (issues, commit) => deliverValidationWave(root, issues, commit));
    }
    for (const target of requests ?? []) {
      requestSchemaNodeValidation(target, (issues, commit) => deliverValidationWave(target, issues, commit));
    }
  }
  runtime.validationTargets = void 0;
  runtime.deferMountValidation = void 0;
  runtime.entryDepth = 0;
  const errors = runtime.chainErrors ?? [];
  if (runtime.stateChanged) {
    runtime.stateChanged = false;
    try {
      runtime.onStateChange?.();
    } catch (error) {
      errors.push(error);
      if (runtime.errorReporter?.hasConsumer())
        occurrences.push({ kind: "error", error });
    }
    runtime.chainErrors = errors;
    runtime.chainOccurrences = occurrences;
  }
  if (changed && runtime.onChange) {
    if ((runtime.onChangeBudget ?? 0) >= 25) {
      const error = new SchemaFormError(
        FEEDBACK_LIMIT_EXCEEDED,
        "onChange nesting exceeded 25 callbacks"
      );
      errors.push(error);
      if (runtime.errorReporter?.hasConsumer())
        occurrences.push({ kind: "error", error });
    } else {
      runtime.onChangeBudget = (runtime.onChangeBudget ?? 0) + 1;
      try {
        runtime.onChange(root.emit);
      } catch (error) {
        errors.push(error);
        if (runtime.errorReporter?.hasConsumer())
          occurrences.push({ kind: "error", error });
      } finally {
        runtime.onChangeBudget -= 1;
      }
    }
  }
  const enclosing = runtime.enclosingChain;
  runtime.enclosingChain = enclosing?.outer;
  runtime.chainErrors = enclosing?.errors;
  runtime.chainRoot = void 0;
  runtime.feedbackBudget = 0;
  runtime.feedbackBlockedListeners = void 0;
  runtime.feedbackLimitReported = false;
  runtime.chainOccurrences = enclosing?.occurrences;
  if (enclosing) {
    enclosing.errors.push(...errors);
    for (const record of pending) enclosing.occurrences.push({ kind: "record", record });
    enclosing.occurrences.push(...occurrences);
    return;
  }
  const original = bundleChainErrors(errors);
  const aggregate = errors.length > 1 && original instanceof SchemaFormError ? original : void 0;
  collectChainRecords(
    pending,
    occurrences,
    aggregate,
    "thrown",
    runtime.reportedGuardFailures
  );
  const handlerErrors = deliverChainRecords(runtime, pending, original, true);
  const exposed = !errors.length ? bundleChainErrors(handlerErrors) : handlerErrors.length ? bundleChainErrors([original, ...handlerErrors]) : original;
  if (!errors.length && !handlerErrors.length) return;
  throw exposed;
};

// packages/canard/schema-form/src/core/dispatch/utils/chain/utils/replaceAtPath.ts
var import_filter88 = require("@winglet/common-utils/filter");
var markedValue = (previous, incoming, option) => (option & SetValueOption.Merge) === SetValueOption.Merge && !(option & SetValueOption.Replace) && previous !== null && incoming !== null && typeof previous === "object" && typeof incoming === "object" && !(0, import_filter88.isArray)(previous) && !(0, import_filter88.isArray)(incoming) ? { ...previous, ...incoming } : incoming;
var replaceAtPath = (current, names, incoming, option) => {
  if (!names.length) return markedValue(current, incoming, option);
  const [name, ...rest] = names;
  if ((0, import_filter88.isArray)(current)) {
    const next2 = [...current];
    next2[Number(name)] = replaceAtPath(next2[Number(name)], rest, incoming, option);
    return next2;
  }
  const next = current !== null && typeof current === "object" ? { ...current } : {};
  return { ...next, [name]: replaceAtPath(Reflect.get(next, name), rest, incoming, option) };
};

// packages/canard/schema-form/src/core/dispatch/utils/chain/composeBatchValue.ts
var composeBatchValue = (root, writes) => {
  let value = root.local;
  for (const write of writes) {
    const names = write.node.path ? write.node.path.slice(1).split("/").map((name) => name.replace(/~1/g, "/").replace(/~0/g, "~")) : [];
    value = replaceAtPath(value, names, write.value, write.option);
  }
  return value;
};

// packages/canard/schema-form/src/core/dispatch/utils/chain/readBatchValue.ts
var readBatchValue = (node) => {
  const root = node.rootNode;
  const names = [];
  for (let cursor = node; cursor && cursor !== root; cursor = cursor.parent)
    names.unshift(cursor.name);
  let value = composeBatchValue(root, root.runtime.batchWrites ?? []);
  for (const name of names)
    value = value !== null && typeof value === "object" ? Reflect.get(value, name) : void 0;
  return value;
};

// packages/canard/schema-form/src/core/dispatch/utils/entry/dispatchSetValue.ts
var dispatchSetValue = (node, value, option = SetValueOption.Overwrite, source) => {
  if (source === "input" && (node.disposed || node.rootNode.disposed)) return;
  if (!enterSchemaNodeChain(node)) return;
  try {
    if (option & SetValueOption.Overwrite && option & SetValueOption.Merge)
      throw new SchemaFormError(
        INVALID_WRITE_OPTION,
        "Overwrite and Merge cannot be combined",
        { path: node.path, option }
      );
    const runtime = node.rootNode.runtime;
    const input = typeof value === "function" ? value(runtime.batchDepth ? readBatchValue(node) : node.local) : value;
    if (runtime.batchDepth) {
      (runtime.batchWrites ??= []).push({ node, value: input, option, source });
    } else {
      const merge2 = (option & SetValueOption.Merge) === SetValueOption.Merge && !(option & SetValueOption.Replace);
      writeSchemaNode(node, input, merge2 ? "callerPartial" : "callerReplace", option, source);
    }
  } catch (error) {
    if (node.rootNode.runtime.batchDepth) throw error;
    captureChainError(node.rootNode.runtime, error);
  } finally {
    exitSchemaNodeChain(node);
  }
};

// packages/canard/schema-form/src/core/dispatch/utils/chain/flushBatchWrites.ts
var import_filter89 = require("@winglet/common-utils/filter");
var flushBatchWrites = (root) => {
  const runtime = root.runtime;
  const writes = runtime.batchWrites ?? [];
  runtime.batchWrites = void 0;
  if (!writes.length) return;
  const option = writes.reduce(
    (flags, write) => flags | write.option,
    SetValueOption.None
  );
  const target = writes.length === 1 ? find(root, writes[0].node.path) : root;
  if (!target) return;
  const input = writes.length === 1 ? writes[0].value : composeBatchValue(root, writes);
  const merge2 = writes.length === 1 && (option & SetValueOption.Merge) === SetValueOption.Merge && !(option & SetValueOption.Replace);
  const source = writes.every((write) => write.source === "input") ? "input" : writes.every((write) => write.source === "automatic") ? "automatic" : void 0;
  const origins = writes.map((write) => {
    const partial = (write.option & SetValueOption.Merge) === SetValueOption.Merge && !(write.option & SetValueOption.Replace);
    return {
      path: write.node.path,
      source: write.source ?? (partial ? "callerPartial" : "callerReplace"),
      keys: partial && write.value !== null && typeof write.value === "object" && !(0, import_filter89.isArray)(write.value) ? Object.keys(write.value) : void 0
    };
  });
  try {
    writeSchemaNode(target, input, source === "automatic" ? "automatic" : merge2 ? "callerPartial" : "callerReplace", option, source, origins);
  } catch (error) {
    captureChainError(runtime, error);
  }
};

// packages/canard/schema-form/src/core/dispatch/utils/entry/dispatchBatch.ts
var dispatchBatch = (node, fn) => {
  if (!enterSchemaNodeChain(node)) return;
  const runtime = node.rootNode.runtime;
  runtime.batchDepth = (runtime.batchDepth ?? 0) + 1;
  try {
    fn();
  } catch (error) {
    if ((runtime.batchDepth ?? 0) > 1) throw error;
    captureChainError(runtime, error);
  } finally {
    const activeRoot = resolveSchemaNodeChainRoot(node.rootNode);
    const active = activeRoot.runtime;
    active.batchDepth = (active.batchDepth ?? 1) - 1;
    if (!active.batchDepth) flushBatchWrites(activeRoot);
    exitSchemaNodeChain(node);
  }
};

// packages/canard/schema-form/src/core/dispatch/utils/entry/dispatchClearExternalErrors.ts
var dispatchClearExternalErrors = (node) => {
  assertSchemaNodeWritable(node);
  if (node.detached) return;
  const runtime = node.rootNode.runtime;
  assertNotInDelivery(runtime);
  if (refuseListenerFeedback(runtime)) return;
  if (!runtime.nodeErrors?.delete(node)) return;
  if (node === node.rootNode) updateSchemaNodeGlobalErrors(node);
  queueNonSettleEvent(node, 32 /* UpdateError */, []);
  if (!runtime.entryDepth) flushQueuedEvents(node.rootNode);
};

// packages/canard/schema-form/src/core/dispatch/utils/entry/dispatchSetState.ts
var dispatchSetState = (node, state) => {
  assertSchemaNodeWritable(node);
  if (node.detached) return;
  const runtime = node.rootNode.runtime;
  assertNotInDelivery(runtime);
  if (refuseListenerFeedback(runtime)) return;
  const previous = node.interactionState;
  patchSchemaNodeInteractionState(node, state);
  if (previous === node.interactionState) return;
  const deltas = /* @__PURE__ */ new Map();
  accumulateGlobalStateDeltas(deltas, previous, node.interactionState, state);
  publishGlobalStateDeltas(node.rootNode, deltas);
  if (node.deliveryChanges & 8 /* UpdateState */)
    node.deliveryPreviousState = node.interactionState;
  runtime.stateChanged = true;
  queueNonSettleEvent(node, 8 /* UpdateState */, node.interactionState);
  if (!runtime.entryDepth) flushQueuedEvents(node.rootNode);
};

// packages/canard/schema-form/src/core/dispatch/utils/chain/markBatchArrayOperation.ts
var import_filter90 = require("@winglet/common-utils/filter");
var markBatchArrayOperation = (node, operation) => {
  const value = readBatchValue(node);
  const source = (0, import_filter90.isArray)(value) ? value : [];
  const view = Object.create(node, {
    raw: { value },
    itemCount: { value: source.length }
  });
  const plan = node.behavior.arrange(view, operation);
  if (plan.kind === "noop") return void 0;
  let raw;
  if (plan.kind === "update") {
    const copy = source.slice();
    copy[plan.index] = plan.value;
    raw = copy;
  } else raw = plan.kind === "raw" ? plan.raw : plan.slots.map((slot) => "from" in slot ? source[slot.from] : slot.value);
  (node.rootNode.runtime.batchWrites ??= []).push({
    node,
    value: raw,
    option: SetValueOption.Replace
  });
  if (plan.kind === "update" || plan.result.source === "updated") {
    const index = plan.kind === "update" ? plan.index : plan.result.source === "updated" ? plan.result.index : -1;
    const item = getItemEntry(node.blueprintNode, index);
    return item ? interpretSchemaNodeInput(item.node, raw[index]) : raw[index];
  }
  if (plan.result.source === "removed") {
    const index = plan.result.index;
    const item = getItemEntry(node.blueprintNode, index);
    return item ? interpretSchemaNodeInput(item.node, source[index]) : source[index];
  }
  return plan.result.source === "length" ? raw.length : void 0;
};

// packages/canard/schema-form/src/core/dispatch/utils/entry/dispatchPush.ts
var dispatchPush = (node, value) => {
  if (!enterSchemaNodeChain(node)) return;
  try {
    return node.rootNode.runtime.batchDepth ? markBatchArrayOperation(node, { kind: "push", value }) : arrangeSchemaNodeItems(node, { kind: "push", value });
  } catch (error) {
    if (node.rootNode.runtime.batchDepth) throw error;
    captureChainError(node.rootNode.runtime, error);
  } finally {
    exitSchemaNodeChain(node);
  }
  return void 0;
};

// packages/canard/schema-form/src/core/dispatch/utils/entry/dispatchPop.ts
var dispatchPop = (node) => {
  if (!enterSchemaNodeChain(node)) return;
  try {
    return node.rootNode.runtime.batchDepth ? markBatchArrayOperation(node, { kind: "pop" }) : arrangeSchemaNodeItems(node, { kind: "pop" });
  } catch (error) {
    if (node.rootNode.runtime.batchDepth) throw error;
    captureChainError(node.rootNode.runtime, error);
  } finally {
    exitSchemaNodeChain(node);
  }
  return void 0;
};

// packages/canard/schema-form/src/core/dispatch/utils/entry/dispatchUpdate.ts
var dispatchUpdate = (node, index, value) => {
  if (!enterSchemaNodeChain(node)) return;
  try {
    return node.rootNode.runtime.batchDepth ? markBatchArrayOperation(node, { kind: "update", index, value }) : arrangeSchemaNodeItems(node, { kind: "update", index, value });
  } catch (error) {
    if (node.rootNode.runtime.batchDepth) throw error;
    captureChainError(node.rootNode.runtime, error);
  } finally {
    exitSchemaNodeChain(node);
  }
  return void 0;
};

// packages/canard/schema-form/src/core/dispatch/utils/entry/dispatchRemove.ts
var dispatchRemove = (node, index) => {
  if (!enterSchemaNodeChain(node)) return;
  try {
    return node.rootNode.runtime.batchDepth ? markBatchArrayOperation(node, { kind: "remove", index }) : arrangeSchemaNodeItems(node, { kind: "remove", index });
  } catch (error) {
    if (node.rootNode.runtime.batchDepth) throw error;
    captureChainError(node.rootNode.runtime, error);
  } finally {
    exitSchemaNodeChain(node);
  }
  return void 0;
};

// packages/canard/schema-form/src/core/dispatch/utils/entry/dispatchClear.ts
var dispatchClear = (node) => {
  if (!enterSchemaNodeChain(node)) return;
  try {
    return node.rootNode.runtime.batchDepth ? markBatchArrayOperation(node, { kind: "clear" }) : arrangeSchemaNodeItems(node, { kind: "clear" });
  } catch (error) {
    if (node.rootNode.runtime.batchDepth) throw error;
    captureChainError(node.rootNode.runtime, error);
  } finally {
    exitSchemaNodeChain(node);
  }
  return void 0;
};

// packages/canard/schema-form/src/core/dispatch/utils/entry/dispatchResetSubtree.ts
var dispatchResetSubtree = (node, option = SetValueOption.Overwrite) => {
  if (!enterSchemaNodeChain(node)) return;
  const runtime = node.rootNode.runtime;
  if (runtime.batchWrites)
    runtime.batchWrites = runtime.batchWrites.filter((write) => write.node !== node && !write.node.path.startsWith(`${node.path}/`));
  (runtime.validationTargets ??= /* @__PURE__ */ new Set()).add(node);
  try {
    resetSchemaNodeSubtree(node, option);
  } catch (error) {
    captureChainError(runtime, error);
  } finally {
    exitSchemaNodeChain(node);
  }
};

// packages/canard/schema-form/src/core/dispatch/utils/report/clearWarningKeys.ts
var import_filter91 = require("@winglet/common-utils/filter");
var clearWarningKeys = (runtime) => {
  runtime.warningKeys?.clear();
  runtime.warningKeysByPath?.clear();
  for (const [key, record] of runtime.pendingWarningRecords ?? []) {
    if (record.path === void 0) continue;
    const parts = JSON.parse(key);
    if ((0, import_filter91.isArray)(parts) && typeof parts[1] === "string")
      indexSchemaNodeWarning(runtime, key, parts[1]);
  }
};

// packages/canard/schema-form/src/core/dispatch/utils/chain/restoreAdoptedExternalErrors.ts
var restoreAdoptedExternalErrors = (root) => {
  const runtime = root.runtime;
  for (const [path, errors] of runtime.adoptedExternalErrors ?? []) {
    const node = find(root, path);
    if (!node) continue;
    (runtime.nodeErrors ??= /* @__PURE__ */ new Map()).set(node, errors);
    if (node === root) updateSchemaNodeGlobalErrors(root);
    runtime.adoptedExternalErrors?.delete(path);
    queueNonSettleEvent(node, 32 /* UpdateError */, errors);
  }
  if (!runtime.adoptedExternalErrors?.size) runtime.adoptedExternalErrors = void 0;
};

// packages/canard/schema-form/src/core/dispatch/utils/entry/dispatchMount.ts
var dispatchMount = (root, value = root.runtime.loadSnapshot, option = SetValueOption.Overwrite, settings = {}) => {
  if (!enterSchemaNodeChain(root)) return;
  clearWarningKeys(root.runtime);
  root.runtime.validationUnavailable = false;
  root.runtime.validationCompileReported = false;
  root.runtime.deferMountValidation = settings.deferValidation === true;
  if (!settings.deferValidation)
    (root.runtime.validationTargets ??= /* @__PURE__ */ new Set()).add(root);
  root.runtime.mountingGuardPass = false;
  try {
    loadSchemaNodeAtMount(root, value, option);
  } catch (error) {
    captureChainError(root.runtime, error);
  } finally {
    restoreAdoptedExternalErrors(root);
    root.runtime.adoptedExternalErrors = void 0;
    const runtime = root.runtime;
    if (runtime.errorReporter?.hasConsumer() && !runtime.validator && runtime.validationMode !== ValidationMode.None && !runtime.warningKeys?.has(VALIDATOR_MISSING)) {
      (runtime.warningKeys ??= /* @__PURE__ */ new Set()).add(VALIDATOR_MISSING);
      const record = {
        level: "warning",
        code: "SCHEMA_FORM_WARNING.VALIDATOR_MISSING",
        message: "Validation is disabled because no validator was selected"
      };
      (runtime.pendingWarningRecords ??= /* @__PURE__ */ new Map()).set(VALIDATOR_MISSING, record);
      runtime.chainOccurrences?.push({ kind: "record", record });
    }
    root.runtime.mountingGuardPass = false;
    exitSchemaNodeChain(root);
  }
};

// packages/canard/schema-form/src/core/dispatch/utils/entry/dispatchSetSubtreeState.ts
var dispatchSetSubtreeState = (node, state) => {
  assertSchemaNodeWritable(node);
  if (node.detached) return;
  const runtime = node.rootNode.runtime;
  assertNotInDelivery(runtime);
  if (refuseListenerFeedback(runtime)) return;
  const deltas = /* @__PURE__ */ new Map();
  const pending = [node];
  while (pending.length) {
    const current = pending.pop();
    if (!current || current.detached) continue;
    const previous = current.interactionState;
    patchSchemaNodeInteractionState(current, state);
    if (previous !== current.interactionState) {
      accumulateGlobalStateDeltas(deltas, previous, current.interactionState, state);
      if (current.deliveryChanges & 8 /* UpdateState */)
        current.deliveryPreviousState = current.interactionState;
      runtime.stateChanged = true;
      queueNonSettleEvent(
        current,
        8 /* UpdateState */,
        current.interactionState
      );
    }
    for (const child of current.children ?? []) pending.push(child);
  }
  publishGlobalStateDeltas(node.rootNode, deltas);
  if (!runtime.entryDepth) flushQueuedEvents(node.rootNode);
};

// packages/canard/schema-form/src/core/dispatch/utils/entry/dispatchClearSubtreeState.ts
var dispatchClearSubtreeState = (node) => {
  assertSchemaNodeWritable(node);
  if (node.detached) return;
  const runtime = node.rootNode.runtime;
  assertNotInDelivery(runtime);
  if (refuseListenerFeedback(runtime)) return;
  const deltas = /* @__PURE__ */ new Map();
  const pending = [node];
  const visited = /* @__PURE__ */ new Set();
  while (pending.length) {
    const current = pending.pop();
    if (!current || current.detached || visited.has(current)) continue;
    visited.add(current);
    current.interactionReset += 1;
    if (Object.keys(current.interactionState).length) {
      const previous = current.interactionState;
      current.interactionState = {};
      accumulateGlobalStateDeltas(deltas, previous, current.interactionState, previous);
      if (current.deliveryChanges & 8 /* UpdateState */)
        current.deliveryPreviousState = current.interactionState;
      runtime.stateChanged = true;
      queueNonSettleEvent(
        current,
        8 /* UpdateState */,
        current.interactionState
      );
    }
    for (const child of current.children ?? []) pending.push(child);
  }
  publishGlobalStateDeltas(node.rootNode, deltas);
  if (!runtime.entryDepth) flushQueuedEvents(node.rootNode);
};

// packages/canard/schema-form/src/core/dispatch/utils/entry/dispatchSetExternalErrors.ts
var dispatchSetExternalErrors = (node, errors) => {
  assertSchemaNodeWritable(node);
  if (node.detached) return;
  const runtime = node.rootNode.runtime;
  assertNotInDelivery(runtime);
  if (refuseListenerFeedback(runtime)) return;
  if (runtime.nodeErrors?.get(node) === errors) return;
  (runtime.nodeErrors ??= /* @__PURE__ */ new Map()).set(node, errors);
  if (node === node.rootNode) updateSchemaNodeGlobalErrors(node);
  queueNonSettleEvent(node, 32 /* UpdateError */, errors);
  if (!runtime.entryDepth) flushQueuedEvents(node.rootNode);
};

// packages/canard/schema-form/src/core/dispatch/utils/entry/dispatchRequest.ts
var dispatchRequest = (node, kind) => {
  assertSchemaNodeWritable(node);
  if (node.detached) return;
  const runtime = node.rootNode.runtime;
  assertNotInDelivery(runtime);
  if (kind !== SchemaNodeRequestType.Focus && kind !== SchemaNodeRequestType.Select && kind !== SchemaNodeRequestType.Refresh && kind !== SchemaNodeRequestType.Remount) return;
  if (refuseListenerFeedback(runtime)) return;
  queueNonSettleEvent(node, kind);
  if (!runtime.entryDepth) flushQueuedEvents(node.rootNode);
};

// packages/canard/schema-form/src/core/dispatch/utils/entry/dispatchValidate.ts
var dispatchValidate = async (node) => {
  const runtime = node.rootNode.runtime;
  if (runtime.validationMode === ValidationMode.None) return [];
  if (node.disposed || node.rootNode.disposed)
    return await runSchemaNodeValidation(node) ?? [];
  runtime.validationStamp = (runtime.validationStamp ?? 0) + 1;
  runtime.validationPendingTargets = void 0;
  const stamp = runtime.validationStamp;
  const commit = runtime.commitNumber ?? 0;
  let issues;
  try {
    issues = await runSchemaNodeValidation(node);
  } catch (failure) {
    if (node.disposed || node.rootNode.disposed) throw failure;
    const compileFailure = failure instanceof SchemaFormError && failure.code === `SCHEMA_FORM_ERROR.${VALIDATOR_COMPILE_FAILED}`;
    if (compileFailure) runtime.validationUnavailable = true;
    const firstReport = !compileFailure || !runtime.validationCompileReported;
    if (compileFailure) runtime.validationCompileReported = true;
    if (firstReport && runtime.errorReporter?.hasConsumer()) {
      const details = failure instanceof SchemaFormError || failure instanceof JSONSchemaError ? failure.details : void 0;
      const record = createFormErrorRecord(
        true,
        readFormErrorCode(failure),
        "error",
        () => failure instanceof Error ? failure.message : String(failure),
        { error: failure, ...details ? { details } : {}, surface: "rejected" }
      );
      const handlerErrors = deliverChainRecords(
        runtime,
        record ? [record] : [],
        failure,
        true
      );
      if (handlerErrors.length) throw bundleChainErrors([failure, ...handlerErrors]);
    }
    throw failure;
  }
  if (issues === null) return [];
  if (runtime.validationStamp === stamp && (runtime.commitNumber ?? 0) === commit) {
    routeValidationIssues(node, issues);
    runtime.validationResult = { commit, issues };
    deliverValidationWave(node, issues, commit);
  }
  return issues;
};

// packages/canard/schema-form/src/core/dispatch/utils/read/readSchemaNodeRevision.ts
var readSchemaNodeRevision = (node, mask = Number.MAX_SAFE_INTEGER) => {
  const ledger = node.revisionLedger;
  if (ledger === EMPTY_REVISION_LEDGER) return 0;
  if (ledger instanceof SchemaNodeRevisionLedger) return ledger.read(mask);
  let revision = 0;
  for (let bit = 1; bit <= 65536 /* UpdateDiagnostics */; bit *= 2)
    if (mask & bit) revision += ledger[bit] ?? 0;
  return revision;
};

// packages/canard/schema-form/src/core/dispatch/utils/read/subscribeSchemaNode.ts
var subscribeSchemaNode = (node, listener) => {
  if (node.disposed || node.rootNode.disposed) return () => {
  };
  const runtime = node.rootNode.runtime;
  const listeners = runtime.listeners ?? /* @__PURE__ */ new Map();
  const subscriptions = listeners.get(node) ?? /* @__PURE__ */ new Set();
  subscriptions.add(listener);
  listeners.set(node, subscriptions);
  runtime.listeners = listeners;
  return () => {
    subscriptions.delete(listener);
    if (!subscriptions.size) listeners.delete(node);
  };
};

// packages/canard/schema-form/src/core/SchemaNode/type.ts
var SetValueOption2 = Object.freeze({
  Overwrite: SetValueOption.Overwrite,
  Merge: SetValueOption.Merge,
  DisableAutomaticWrites: SetValueOption.DisableAutomaticWrites,
  EnableAutomaticWrites: SetValueOption.EnableAutomaticWrites
});

// packages/canard/schema-form/src/core/SchemaNode/SchemaNode.ts
var EMPTY_GLOBAL_ERRORS2 = Object.freeze([]);
var SchemaNode = class {
  constructor(behavior, runtime, blueprintNode, parent, name, escapedName, path, depth, structure, children, schema, state) {
    this.behavior = behavior;
    this.runtime = runtime;
    this.blueprintNode = blueprintNode;
    this.parent = parent;
    this.root = parent?.rootNode ?? this;
    this.storedName = name;
    this.storedEscapedName = escapedName;
    this.storedPath = path;
    this.storedDepth = depth;
    this.storedRequired = false;
    this.storedNullable = blueprintNode.nullable;
    this.storedSchemaType = blueprintNode.schemaType;
    this.structure = structure;
    this.storedChildren = children;
    this.itemKey = null;
    this.itemCount = 0;
    this.nextItemKey = 0;
    this.storedRaw = void 0;
    this.storedExtras = void 0;
    this.storedActive = true;
    this.storedVisible = true;
    this.storedReadOnly = false;
    this.storedDisabled = false;
    this.local = void 0;
    this.emit = void 0;
    this.schema = schema;
    this.interactionState = state;
    this.revisionLedger = EMPTY_REVISION_LEDGER;
    this.deliveryInitialized = false;
    this.deliveryChanges = 0;
    this.deliveryPreviousLocal = void 0;
    this.deliveryPreviousEmit = void 0;
    this.deliveryPreviousPath = void 0;
    this.deliveryPreviousChildren = void 0;
    this.deliveryPreviousComputed = void 0;
    this.deliveryPreviousSchema = void 0;
    this.deliveryPreviousState = void 0;
    this.deliveryWatchValues = void 0;
    this.pendingDelivery = void 0;
    this.pendingRevision = 0;
    this.pendingNonSettleDelivery = void 0;
    this.detached = false;
    this.disposed = false;
    this.interactionReset = 0;
  }
  /** {@inheritDoc NodeSurface.type} */
  get type() {
    return this.behavior.type;
  }
  /** {@inheritDoc NodeSurface.strategy} */
  get strategy() {
    return this.behavior.strategy;
  }
  /** {@inheritDoc NodeSurface.schemaType} */
  get schemaType() {
    return this.storedSchemaType;
  }
  /** {@inheritDoc NodeSurface.jsonSchema} */
  get jsonSchema() {
    return this.schema.schema;
  }
  /** {@inheritDoc NodeSurface.required} */
  get required() {
    return this.storedRequired;
  }
  set required(value) {
    this.storedRequired = value;
  }
  /** {@inheritDoc NodeSurface.nullable} */
  get nullable() {
    return this.storedNullable;
  }
  /** {@inheritDoc NodeSurface.depth} */
  get depth() {
    return this.storedDepth;
  }
  set depth(value) {
    this.storedDepth = value;
  }
  /** {@inheritDoc NodeSurface.isRoot} */
  get isRoot() {
    return this.parent === null;
  }
  /** {@inheritDoc NodeSurface.rootNode} */
  get rootNode() {
    return this.root;
  }
  /** {@inheritDoc NodeSurface.parentNode} */
  get parentNode() {
    return this.parent;
  }
  /** {@inheritDoc NodeSurface.name} */
  get name() {
    return this.storedName;
  }
  set name(value) {
    this.storedName = value;
  }
  /** {@inheritDoc NodeSurface.escapedName} */
  get escapedName() {
    return this.storedEscapedName;
  }
  set escapedName(value) {
    this.storedEscapedName = value;
  }
  /** {@inheritDoc NodeSurface.path} */
  get path() {
    return this.storedPath;
  }
  set path(value) {
    this.storedPath = value;
  }
  /** {@inheritDoc NodeSurface.children} */
  get children() {
    return this.storedChildren;
  }
  set children(value) {
    this.storedChildren = value;
  }
  /** {@inheritDoc NodeSurface.raw} */
  get raw() {
    return this.storedRaw;
  }
  set raw(value) {
    this.storedRaw = value;
  }
  /** {@inheritDoc NodeSurface.extras} */
  get extras() {
    return this.storedExtras;
  }
  set extras(value) {
    this.storedExtras = value;
  }
  /** {@inheritDoc NodeSurface.value} */
  get value() {
    return this.local;
  }
  /** {@inheritDoc NodeSurface.outputValue} */
  get outputValue() {
    return this.emit;
  }
  /** {@inheritDoc NodeSurface.inactiveValues} */
  get inactiveValues() {
    return readSchemaNodeInactiveValues(this);
  }
  /** {@inheritDoc NodeSurface.active} */
  get active() {
    return this.storedActive;
  }
  set active(value) {
    this.storedActive = value;
  }
  /** {@inheritDoc NodeSurface.visible} */
  get visible() {
    return this.storedVisible;
  }
  set visible(value) {
    this.storedVisible = value;
  }
  /** {@inheritDoc NodeSurface.enabled} */
  get enabled() {
    return this.active && this.visible;
  }
  /** {@inheritDoc NodeSurface.readOnly} */
  get readOnly() {
    return this.storedReadOnly;
  }
  set readOnly(value) {
    this.storedReadOnly = value;
  }
  /** {@inheritDoc NodeSurface.disabled} */
  get disabled() {
    return this.storedDisabled;
  }
  set disabled(value) {
    this.storedDisabled = value;
  }
  /** {@inheritDoc NodeSurface.watchValues} */
  get watchValues() {
    return readSchemaNodeWatchValues(this);
  }
  /** {@inheritDoc NodeSurface.context} */
  get context() {
    return this.runtime.context;
  }
  /** {@inheritDoc NodeSurface.typeMismatch} */
  get typeMismatch() {
    return readSchemaNodeTypeMismatch(this);
  }
  /** {@inheritDoc NodeSurface.typeMismatches} */
  get typeMismatches() {
    return readSchemaNodeTypeMismatches(this);
  }
  /** {@inheritDoc NodeSurface.diagnostics} */
  get diagnostics() {
    return this.runtime.diagnostics;
  }
  /** {@inheritDoc NodeSurface.defaultValue} */
  get defaultValue() {
    return readSchemaNodeDefaultValue(this);
  }
  /** {@inheritDoc NodeSurface.find} */
  find(pointer) {
    return find(this, pointer);
  }
  /** {@inheritDoc NodeSurface.findNodes} */
  findNodes(pointer) {
    return findNodes(this, pointer);
  }
  /** {@inheritDoc NodeSurface.setValue} */
  setValue(value, option = SetValueOption2.Overwrite) {
    return dispatchSetValue(this, value, option);
  }
  /** {@inheritDoc ArrayNode.push} */
  push(value) {
    return dispatchPush(this, value);
  }
  /** {@inheritDoc ArrayNode.pop} */
  pop() {
    return dispatchPop(this);
  }
  /** {@inheritDoc ArrayNode.update} */
  update(index, value) {
    return dispatchUpdate(this, index, value);
  }
  /** {@inheritDoc ArrayNode.remove} */
  remove(index) {
    return dispatchRemove(this, index);
  }
  /** {@inheritDoc ArrayNode.clear} */
  clear() {
    return dispatchClear(this);
  }
  /** {@inheritDoc NodeSurface.resetSubtree} */
  resetSubtree(option = SetValueOption2.Overwrite) {
    return dispatchResetSubtree(this, option);
  }
  /** {@inheritDoc NodeSurface.state} */
  get state() {
    return this.interactionState;
  }
  /** {@inheritDoc NodeSurface.state} */
  set state(value) {
    dispatchSetState(this, value);
  }
  /** {@inheritDoc NodeSurface.setState} */
  setState(state) {
    return dispatchSetState(this, state);
  }
  /** {@inheritDoc NodeSurface.globalState} */
  get globalState() {
    return this.runtime.globalState;
  }
  /** {@inheritDoc NodeSurface.setSubtreeState} */
  setSubtreeState(state) {
    return dispatchSetSubtreeState(this, state);
  }
  /** {@inheritDoc NodeSurface.clearSubtreeState} */
  clearSubtreeState() {
    return dispatchClearSubtreeState(this);
  }
  /** {@inheritDoc NodeSurface.errors} */
  get errors() {
    return readSchemaNodeErrors(this);
  }
  /** {@inheritDoc NodeSurface.globalErrors} */
  get globalErrors() {
    return this.runtime.globalErrors ?? EMPTY_GLOBAL_ERRORS2;
  }
  /** {@inheritDoc NodeSurface.setExternalErrors} */
  setExternalErrors(errors) {
    return dispatchSetExternalErrors(this, errors);
  }
  /** {@inheritDoc NodeSurface.clearExternalErrors} */
  clearExternalErrors() {
    return dispatchClearExternalErrors(this);
  }
  /** {@inheritDoc NodeSurface.validate} */
  validate() {
    return dispatchValidate(this);
  }
  /** {@inheritDoc NodeSurface.subscribe} */
  subscribe(listener) {
    return subscribeSchemaNode(this, listener);
  }
  /** {@inheritDoc NodeSurface.revision} */
  revision(mask) {
    return readSchemaNodeRevision(this, mask);
  }
  /** {@inheritDoc NodeSurface.request} */
  request(kind) {
    return dispatchRequest(this, kind);
  }
  /** {@inheritDoc NodeSurface.batch} */
  batch(fn) {
    return dispatchBatch(this, fn);
  }
};

// packages/canard/schema-form/src/core/utils/pathIndex/PathKeyedSet.ts
var PathKeyedSet = class extends Set {
  /** Create an empty indexed set before inserting optional initial paths. */
  constructor(paths) {
    super();
    /** Persistent lookup metadata owned from construction. */
    this.pathIndex = new PathStoreIndex();
    if (paths) for (const path of paths) this.add(path);
  }
  /** Register a new path once. */
  add(path) {
    if (!this.has(path)) this.pathIndex.add(path, [path]);
    return super.add(path);
  }
  /** Remove a path from values and lookup metadata. */
  delete(path) {
    this.pathIndex.delete(path);
    return super.delete(path);
  }
  /** Clear both surfaces. */
  clear() {
    this.pathIndex.clear();
    super.clear();
  }
  /** Replace distinct affected paths with surviving destinations in two phases. */
  replacePaths(moves) {
    this.pathIndex.beginBatch();
    try {
      for (const move of moves) {
        this.pathIndex.delete(move.previous);
        super.delete(move.previous);
      }
      for (const move of moves) if (move.current !== void 0) {
        this.pathIndex.add(move.current, [move.current]);
        super.add(move.current);
      }
    } finally {
      this.pathIndex.endBatch();
    }
  }
};

// packages/canard/schema-form/src/core/SchemaNode/utils/schemaNodeFactory.ts
var createSchemaNode = (entry, parent, runtime) => {
  const template = "node" in entry ? entry.node : entry;
  const name = "node" in entry ? entry.name : "";
  const escapedName = name.replace(/~/g, "~0").replace(/\//g, "~1");
  const path = parent ? `${parent.path}/${escapedName}` : "";
  const depth = parent ? parent.depth + 1 : 0;
  const row = BEHAVIORS[template.kind]?.[template.strategy];
  if (!row) throw new Error(`Missing behavior for ${template.kind}/${template.strategy}`);
  const behavior = row;
  return new SchemaNode(
    behavior,
    runtime,
    template,
    parent,
    name,
    escapedName,
    path,
    depth,
    template.strategy === "branch" ? {} : null,
    template.strategy === "branch" ? [] : null,
    mergeEffectiveSchema(
      template,
      [],
      { mode: "runtime", isAtomic: runtime.blueprint?.isAtomic }
    ),
    {}
  );
};
function schemaNodeFactory(analysis, runtimeSeed, validator) {
  const runtime = {
    ...runtimeSeed,
    latentRaw: runtimeSeed.latentRaw ?? new PathKeyedMap("pair"),
    typeMismatchPaths: runtimeSeed.typeMismatchPaths ?? new PathKeyedSet(),
    inactiveValuesMemo: runtimeSeed.inactiveValuesMemo ?? new PathKeyedMap("path"),
    globalStateCounts: /* @__PURE__ */ new Map(),
    globalState: {},
    validator,
    context: runtimeSeed.context ?? {},
    blueprint: analysis,
    nodeFactory: createSchemaNode,
    settlementScratch: void 0,
    entryDepth: 0,
    feedbackBudget: 0,
    onChangeBudget: 0,
    batchDepth: 0
  };
  if (runtime.errorReporter?.hasConsumer())
    collectBlueprintWarnings(analysis, (diagnostic) => {
      const record = createFormErrorRecord(true, diagnostic);
      if (record) (runtime.pendingWarningRecords ??= /* @__PURE__ */ new Map()).set(
        JSON.stringify([
          record.code,
          diagnostic.schemaPath,
          diagnostic.details.keyword ?? diagnostic.details.propertyName ?? ""
        ]),
        record
      );
    });
  const authoredSchema = analysis.schema;
  if (false) {
    const record = createFormErrorRecord(
      true,
      `SCHEMA_FORM_WARNING.${DIALECT_MISMATCH}`,
      "warning",
      () => `Validator dialect ${validator.dialect} differs from schema ${authoredSchema.$schema}`,
      { schemaPath: "#/$schema", details: {
        dialect: validator.dialect,
        $schema: authoredSchema.$schema
      } }
    );
    if (record) {
      if (runtime.errorReporter?.hasConsumer()) runtime.errorReporter.report(record);
      else console.warn(record.code, record.message, record.details);
    }
  }
  if (validator && false)
    compileEntryGuards(
      readValidationEntry(validator, analysis.schema),
      validator,
      analysis
    );
  return createSchemaNode(analysis.root, null, runtime);
}

// packages/canard/schema-form/src/core/SchemaNode/utils/binding/buildSchemaNodeTree.ts
function buildSchemaNodeTree(props) {
  return schemaNodeFactory(blueprint(props.jsonSchema, props), {
    diagnostics: { status: "stable" },
    loadSnapshot: props.defaultValue,
    context: props.context,
    validationMode: props.validationMode,
    onChange: props.onChange,
    onStateChange: props.onStateChange,
    errorReporter: props.errorReporter,
    unsetOnInactive: props.unsetOnInactive,
    disableAutomaticWrites: props.disableAutomaticWrites
  }, props.validator);
}

// packages/canard/schema-form/src/core/SchemaNode/utils/requireRuntimeSchemaNode.ts
var requireRuntimeSchemaNode = (node, rootOnly = false) => {
  if (node instanceof SchemaNode && (!rootOnly || node.isRoot && !node.detached)) return node;
  throw new TypeError("Binding requires a schema-form node with the requested root shape");
};

// packages/canard/schema-form/src/core/SchemaNode/utils/binding/mountSchemaNode.ts
var mountSchemaNode = (root, value, option, settings) => dispatchMount(requireRuntimeSchemaNode(root, true), value, option, settings);

// packages/canard/schema-form/src/core/nodeFromJSONSchema.ts
function nodeFromJSONSchema(props) {
  const root = buildSchemaNodeTree(
    props
  );
  mountSchemaNode(root, void 0, void 0, {
    deferValidation: props.deferMountValidation ?? false
  });
  return root;
}

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
