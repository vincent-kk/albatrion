import type { ComponentType, Ref } from 'react';

/** Observable assertions interpreted by the consumer's assertion runtime. */
export interface ScenarioExpectation {
  /** Presence of rendered fields or nodes, indexed by JSON Pointer. */
  readonly shape?: Readonly<Record<string, 'present' | 'absent'>>;
  /** Expected whole-form output after the step settles. */
  readonly outputValue?: unknown;
  /** Expected values at individual JSON Pointer paths. */
  readonly values?: Readonly<Record<string, unknown>>;
  /** Local state keys observed on nodes at JSON Pointer paths. */
  readonly states?: Readonly<Record<string, Readonly<{
    visible?: boolean;
    readOnly?: boolean;
    disabled?: boolean;
    enabled?: boolean;
  }>>>;
  /** Expected validation errors, indexed by JSON Pointer. */
  readonly errors?: Readonly<Record<string, readonly unknown[]>>;
  /** Synchronous result of the action, including undefined when present. */
  readonly result?: unknown;
  /** New path to the path of the same node before this step. */
  readonly identity?: Readonly<Record<string, string>>;
  /** Load-snapshot values observed through each node's defaultValue. */
  readonly defaultValues?: Readonly<Record<string, unknown>>;
  /** Blueprint schema types selected for array positions. */
  readonly schemaTypes?: Readonly<Record<string, unknown>>;
  /** Untemplated array tail values retained by a host. */
  readonly extras?: Readonly<Record<string, unknown>>;
  /** Paths receiving value deliveries, in document order for this step. */
  readonly deliveryOrder?: readonly string[];
  /** Whole-form change callbacks made by this step. */
  readonly onChangeCount?: number;
  /** Validation requests made by this step before any explicit verdict check. */
  readonly validationRequestCount?: number;
  /** Structured error and warning codes reported during this step. */
  readonly onErrorCodes?: readonly string[];
  /** Expected settlement health fields on the form root. */
  readonly diagnostics?: Readonly<{
    status: 'stable' | 'degraded';
    cause?: 'budget' | 'expression' | 'injectTarget' | 'sharedConflict';
    exceededBudget?: 'hostWheel' | 'derive' | 'transition' | 'recursion';
    iterations?: number;
    commit?: number;
  }>;
}

/** Closed ledger vocabulary; batch interpretation belongs to the injected engine. */
export type FormScenarioStep = (
  | { readonly action: 'setValue'; readonly path: string; readonly value: unknown }
  | { readonly action: 'clear'; readonly path: string }
  | { readonly action: 'push'; readonly path: string; readonly value?: unknown }
  | { readonly action: 'pop'; readonly path: string }
  | { readonly action: 'remove'; readonly path: string; readonly index: number }
  | { readonly action: 'update'; readonly path: string; readonly index: number; readonly value: unknown }
  | { readonly action: 'submit' }
  | { readonly action: 'reset'; readonly automaticWrites?: 'disabled' }
  | { readonly action: 'resetSubtree'; readonly path: string }
  | { readonly action: 'batch'; readonly steps: readonly FormScenarioStep[] }
) & { readonly expect?: ScenarioExpectation };

/** Pure scenario data; generic schema and value types retain consumer inference. */
export interface FormScenario<Schema = object, Value = unknown> {
  /** Human-readable behavior used as the test and story label. */
  readonly name: string;
  /** Ledger IDs and the behavior this scene checks. */
  readonly description?: string;
  /** Schema interpreted by the injected form engine. */
  readonly schema: Schema;
  /** Optional initial value passed to the consumer's form. */
  readonly initialValue?: Value;
  /** Ordered operations and observations shared by every execution layer. */
  readonly steps: readonly FormScenarioStep[];
}

/** Engine or screen adapter supplied by the consumer, with no engine import. */
export interface ScenarioAdapter {
  /** Execute one operation; rejection stops the scenario. */
  execute(step: FormScenarioStep): void | Promise<void>;
  /** Wait for engine or render work before observing the result. */
  settle?(): void | Promise<void>;
  /** Assert every requested observation using the consumer's test runtime. */
  assert(expectation: ScenarioExpectation): void | Promise<void>;
}

/** Execution count, including zero for an intentionally empty scaffold. */
export interface ScenarioResult {
  /** Number of top-level steps completed successfully. */
  readonly executedSteps: number;
}

/** DOM-owned handoff; adapter closures interpret the accompanying handle. */
export interface ScenarioRegistration {
  /** Structural consumer-owned handle retained for its registration lifetime. */
  readonly handle: object;
  /** Screen adapter bound to this handle and element. */
  readonly adapter: ScenarioAdapter;
}

/** Consumer-injected form component and screen adapter factory. */
export interface ScenarioFormProps<Schema, Value, Handle extends object> {
  /** Shared data to render without copying schema or initial value. */
  readonly scenario: FormScenario<Schema, Value>;
  /** Form implementation injected by a renderer or Storybook consumer. */
  readonly Form: ComponentType<{
    jsonSchema: Schema;
    defaultValue?: Value;
    ref?: Ref<Handle>;
  }>;
  /** Bind user-event interaction, handle-only actions, and screen assertions. */
  readonly createAdapter: (handle: Handle, element: HTMLElement) => ScenarioAdapter;
}
