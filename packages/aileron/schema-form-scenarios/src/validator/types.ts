/** JSON Schema dialect a scenario's schema is written for. */
export type ValidatorScenarioDraft = "07" | "2019" | "2020";

/**
 * Plugin entry a scenario runs on: `default` is the plugin's Draft-07 entry point,
 * `2019` and `2020` are the ajv8 entry points or, for ajv7, the Ajv2019 binding.
 */
export type ValidatorScenarioEntry = "default" | "2019" | "2020";

/**
 * Instance profile: `default` keeps the entry's built-in instance options, `custom`
 * binds a consumer-built instance once before first use.
 */
export type ValidatorScenarioProfile = "default" | "custom";

/** Optional plugin capability a scenario needs; a plugin without it skips the scenario. */
export type ValidatorScenarioFeature = "allowUnionTypes";

/**
 * Bundle a scenario belongs to: `conformance` asserts its expected value on every
 * plugin it applies to; `observation` records each plugin's verdict without asserting.
 */
export type ValidatorScenarioBundle = "conformance" | "observation";

/** Structural JSON Schema; the package imports no schema-form or AJV type. */
export type ValidatorScenarioSchema =
  | boolean
  | { readonly [keyword: string]: unknown };

/** Conditions under which a plugin runs a scenario, and how many rows it expands to. */
export interface ValidatorScenarioApplicability {
  /** Entries that run the scenario, further limited to entries whose dialect is in `drafts`. */
  readonly entries: readonly ValidatorScenarioEntry[];
  /** Instance profiles that run the scenario; each listed profile is one row. */
  readonly profiles: readonly ValidatorScenarioProfile[];
  /** Guard compile path; `both` runs one row with `true` and one with `false`. */
  readonly directGuardCompile: boolean | "both";
  /** Capabilities the plugin must declare; an empty list needs none. */
  readonly features: readonly ValidatorScenarioFeature[];
}

/** Fields every scenario carries. */
interface ValidatorScenarioBase {
  /** Unique row name, stable across plugins, used as the test title and the observation key. */
  readonly id: string;
  /** Contract or test label of the scenario, for the reader of a failing row. */
  readonly source: string;
  /** Dialects the schema is written for. */
  readonly drafts: readonly ValidatorScenarioDraft[];
  /** Run conditions. */
  readonly applies: ValidatorScenarioApplicability;
  /** Whether the scenario asserts or only records. */
  readonly bundle: ValidatorScenarioBundle;
}

/** Whole-validation verdict: validity and the sorted set of issue data paths. */
export interface ValidationExpectation {
  /** Whether the value passes whole validation. */
  readonly valid: boolean;
  /** Distinct issue `dataPath` values in ascending order; empty when valid. */
  readonly dataPaths: readonly string[];
}

/**
 * Guard verdict for one host value: `compileGuard(schema, pointer)(hostValue)`.
 * `expected` is the boolean verdict, `'rejects'` when `compileGuard` must throw, or
 * `null` for an observation scenario.
 */
export interface GuardScenario extends ValidatorScenarioBase {
  readonly kind: "guard";
  /** Root the engine passes as its copy. */
  readonly schema: ValidatorScenarioSchema;
  /** JSON Pointer of the `if` condition inside the root. */
  readonly pointer: string;
  /** Host value the guard evaluates. */
  readonly hostValue: unknown;
  /** Required verdict, a required compile rejection, or `null` when only observed. */
  readonly expected: boolean | "rejects" | null;
  /** Case-insensitive regular expression source matched against the compileGuard error; required when expected is 'rejects'. */
  readonly failure?: string;
}

/** Whole validation of one value: `compile(schema)(value)`. */
export interface ValidationScenario extends ValidatorScenarioBase {
  readonly kind: "validation";
  /** Root the engine passes as its copy. */
  readonly schema: ValidatorScenarioSchema;
  /** Value validated. */
  readonly value: unknown;
  /** Required verdict. */
  readonly expected: ValidationExpectation;
}

/** One guard evaluation inside a lifetime step. */
export interface GuardCheck {
  /** Host value the guard evaluates. */
  readonly hostValue: unknown;
  /** Required verdict. */
  readonly expected: boolean;
}

/** One whole-validation call inside a lifetime step. */
export interface ValidationCheck {
  /** Value validated. */
  readonly value: unknown;
  /** Required verdict. */
  readonly expected: ValidationExpectation;
}

/**
 * Closed vocabulary of registration and release sequences. Patterns in `failure`
 * are case-insensitive regular expression sources matched against the thrown message.
 */
export type LifetimeStep =
  | {
      /** `compileGuard` before `compile` on one copy, guards checked before and after `compile`. */
      readonly action: "compileGuardBeforeCompile";
      readonly schema: ValidatorScenarioSchema;
      readonly pointer: string;
      readonly guardChecks: readonly GuardCheck[];
      readonly validationChecks: readonly ValidationCheck[];
    }
  | {
      /** `release` twice before any compile, then `compile`, then `release` twice and `compile` again. */
      readonly action: "releaseTwice";
      readonly schema: ValidatorScenarioSchema;
      readonly validationChecks: readonly ValidationCheck[];
    }
  | {
      /** Two live roots with the same `$id`: each compiles, guards and validates on its own. */
      readonly action: "twoRootsSameId";
      readonly first: ValidatorScenarioSchema;
      readonly second: ValidatorScenarioSchema;
      readonly pointer: string;
      readonly hostValue: unknown;
      readonly expected: {
        readonly first: {
          readonly guard: boolean;
          readonly validation: ValidationExpectation;
        };
        readonly second: {
          readonly guard: boolean;
          readonly validation: ValidationExpectation;
        };
      };
    }
  | {
      /** A failed registration fails again for the same copy; after release a valid root with the same `$id` compiles. */
      readonly action: "recompileSameCopyAfterRegistrationFailure";
      readonly invalid: ValidatorScenarioSchema;
      readonly failure: string;
      readonly valid: ValidatorScenarioSchema;
      readonly validationChecks: readonly ValidationCheck[];
    }
  | {
      /** A consumer-registered schema survives the plugin's failed registration of the same `$id`. */
      readonly action: "keepConsumerSchemaAfterSameIdFailure";
      readonly consumer: ValidatorScenarioSchema;
      readonly clash: ValidatorScenarioSchema;
      readonly failure: string;
      readonly consumerValue: unknown;
    }
  | {
      /**
       * A consumer meta-schema and the schema using it survive the plugin's failed registration
       * of the meta-schema's `$id`, and two live copies of `sibling` still compile, the second on a
       * sibling instance built from the consumer's registrations.
       */
      readonly action: "keepConsumerMetaSchemaAfterSameIdFailure";
      readonly metaSchema: ValidatorScenarioSchema;
      readonly user: ValidatorScenarioSchema;
      readonly clash: ValidatorScenarioSchema;
      readonly failure: string;
      readonly userValue: unknown;
      readonly sibling: ValidatorScenarioSchema;
    };

/** An ordered registration and release sequence on fresh plugin state. */
export interface LifetimeScenario extends ValidatorScenarioBase {
  readonly kind: "lifetime";
  /** Steps run in order; every check inside them is asserted. */
  readonly steps: readonly LifetimeStep[];
}

/** Any validator parity scenario. */
export type ValidatorScenario =
  | GuardScenario
  | ValidationScenario
  | LifetimeScenario;
