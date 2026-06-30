import {
  type FC,
  type ReactElement,
  StrictMode,
  createRef,
  useState,
} from 'react';

import { act, render, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Ajv from 'ajv/dist/2020';

import { JSONPointer as $ } from '@winglet/json/pointer';

import {
  Form,
  type FormHandle,
  type FormProps,
  type FormTypeInputDefinition,
  type FormTypeInputProps,
  type JsonSchema,
  type JsonSchemaError,
  type SchemaNode,
  type ValidatorFactory,
  type ValidatorPlugin,
  registerPlugin,
} from '@/schema-form';

/**
 * Shared render-test harness for @canard/schema-form.
 *
 * Why this exists
 * ---------------
 * The library converts a JSON Schema into a node tree and then renders React
 * inputs from it. A whole class of bugs lives in the gap between the two — the
 * node tree settles correctly (often via a microtask cascade) but the rendered
 * DOM diverges (fields missing on initial mount, stale values after a branch
 * switch, ghost array rows after reorder, etc.). Node-tree-only unit tests
 * cannot see those regressions.
 *
 * This harness renders a real <Form> through the public API and exposes BOTH
 * layers so a single test can assert the node tree AND the rendered DOM at once.
 *
 * Load-bearing DOM facts (verified against src/):
 *   - `SchemaNodeProxy` wraps every ENABLED node in
 *     `<div data-path={node.path} role="none" style="display:contents">`, and
 *     renders `null` when `!node.enabled` (scoped && active && visible).
 *     → `[data-path="/x"]` presence is the canonical "is this node rendered"
 *       hook for ALL node types (object / array / terminal), not just inputs.
 *   - Every built-in terminal input renders with `id={node.path}` (the
 *     JSONPointer) and is UNCONTROLLED (defaultValue / defaultChecked). After a
 *     programmatic setValue the DOM only updates when the input re-mounts via
 *     the RequestRefresh cascade — so DOM value assertions double as regression
 *     checks for that refresh path.
 *   - Arrays render add/remove buttons via `title="add item"` / "remove item".
 *
 * Two-phase assertions
 * --------------------
 * Pass `{ flushOnMount: false }` to assert the SYNCHRONOUS post-render snapshot
 * (before the microtask cascade drains) — this is what distinguishes a priming
 * regression (branch fields absent at first paint) from a settled-tree test.
 * Then call `await form.flush()` and assert the post-cascade DOM.
 */

// ---------------------------------------------------------------------------
// Validator plugin (opt-in)
// ---------------------------------------------------------------------------

let validatorRegistered = false;

/**
 * Register a minimal AJV (draft 2020-12) validator plugin once per test run.
 * Validation relies on a registered validator plugin, so any suite that asserts
 * on AJV errors must call this (or pass `{ validator: true }` to `renderForm`).
 */
export const setupValidatorPlugin = (): void => {
  if (validatorRegistered) return;
  validatorRegistered = true;
  const ajv = new Ajv({
    allErrors: true,
    strictSchema: false,
    validateFormats: false,
  });
  const transform = (errors: any[]): JsonSchemaError[] => {
    if (!Array.isArray(errors)) return [];
    return errors.map((error) => {
      const hasMissing =
        error.keyword === 'required' && error.params?.missingProperty;
      const instancePath: string = error.instancePath ?? '';
      const dataPath = !instancePath
        ? hasMissing
          ? $.Separator + error.params.missingProperty
          : ''
        : hasMissing
          ? instancePath + $.Separator + error.params.missingProperty
          : instancePath;
      return {
        dataPath,
        schemaPath: error.schemaPath,
        keyword: error.keyword,
        message: error.message,
        details: error.params,
        source: error,
      } as JsonSchemaError;
    });
  };
  // `as ValidatorFactory` reconciles the harness's `@winglet/json-schema`
  // JsonSchema with the library's own JsonSchema (the factory param is
  // contravariant); the function body is contract-correct.
  const compile = ((jsonSchema: JsonSchema) => {
    const validate = ajv.compile({ ...jsonSchema, $async: true });
    return async (data: unknown) => {
      try {
        await validate(data);
        return null;
      } catch (thrown: any) {
        if (Array.isArray(thrown?.errors)) return transform(thrown.errors);
        throw thrown;
      }
    };
  }) as ValidatorFactory;
  const plugin: ValidatorPlugin = { bind: () => {}, compile };
  registerPlugin({ validator: plugin });
};

// ---------------------------------------------------------------------------
// Optional instrumented inputs (mount/identity tracking)
// ---------------------------------------------------------------------------

/**
 * Build type-aware instrumented FormTypeInput definitions that close over a
 * per-render mount map. Each input renders `data-mount={ordinal}` so tests can
 * detect a re-mount (ordinal increases) versus a re-render/reuse (unchanged).
 * Run instrument tests WITHOUT strictMode (StrictMode double-invokes mounts).
 */
const buildInstrumentedDefinitions = (
  mountMap: Map<string, number>,
): FormTypeInputDefinition[] => {
  const bump = (path: string) => {
    const next = (mountMap.get(path) ?? 0) + 1;
    mountMap.set(path, next);
    return next;
  };
  const Text: FC<FormTypeInputProps<any>> = (props) => {
    const [ordinal] = useState(() => bump(props.path));
    return (
      <input
        id={props.path}
        data-mount={ordinal}
        defaultValue={props.value?.toString() ?? ''}
        onChange={(e) => props.onChange?.(e.target.value)}
      />
    );
  };
  const Numeric: FC<FormTypeInputProps<any>> = (props) => {
    const [ordinal] = useState(() => bump(props.path));
    return (
      <input
        id={props.path}
        type="number"
        data-mount={ordinal}
        defaultValue={props.value ?? undefined}
        onChange={(e) => props.onChange?.(e.target.valueAsNumber)}
      />
    );
  };
  const Check: FC<FormTypeInputProps<any>> = (props) => {
    const [ordinal] = useState(() => bump(props.path));
    return (
      <input
        id={props.path}
        type="checkbox"
        data-mount={ordinal}
        defaultChecked={props.value ?? undefined}
        onChange={(e) => props.onChange?.(e.target.checked)}
      />
    );
  };
  return [
    { test: { type: 'number' }, Component: Numeric },
    { test: { type: 'integer' }, Component: Numeric },
    { test: { type: 'boolean' }, Component: Check },
    { test: { type: 'string' }, Component: Text },
  ];
};

// ---------------------------------------------------------------------------
// Harness
// ---------------------------------------------------------------------------

export interface RenderFormOptions extends Omit<FormProps, 'jsonSchema'> {
  /** Register the AJV validator plugin before rendering. */
  validator?: boolean;
  /** Wrap the form in `<React.StrictMode>` to surface subscribe-window races. */
  strictMode?: boolean;
  /**
   * Replace built-in inputs with instrumented ones exposing `data-mount`
   * ordinals (enables `mountOrdinal` / re-mount detection). String, number,
   * integer and boolean terminals are covered.
   */
  instrument?: boolean;
  /**
   * Drain the initial composition cascade before returning (default true).
   * Set false to assert the synchronous post-render snapshot (priming gaps),
   * then call `await form.flush()` for the settled state.
   */
  flushOnMount?: boolean;
  /** Milliseconds to drain on the initial mount flush (default 0). */
  initialFlushMs?: number;
}

export interface FormHarness {
  /** Imperative form handle (getValue / setValue / reset / validate / ...). */
  handle: FormHandle;
  /** Root DOM element of the rendered form. */
  container: HTMLElement;
  /** userEvent instance bound to this render. */
  user: ReturnType<typeof userEvent.setup>;
  /** Latest value reported through `onChange`. */
  lastValue: () => any;
  /** Every value `onChange` has reported, in order. */
  changeLog: () => any[];
  /** Errors caught on `window` (error / unhandledrejection) since mount. */
  caughtErrors: () => string[];
  unmount: () => void;

  // ---- DOM presence (by JSONPointer path; canonical [data-path] hook) ----
  /** The `[data-path]` wrapper element for an enabled node, or null. */
  wrapper: (path: string) => HTMLElement | null;
  /** Whether a node is currently rendered (enabled) in the DOM. */
  exists: (path: string) => boolean;
  /** All node paths currently rendered (enabled), in document order. */
  renderedPaths: () => string[];

  // ---- DOM input values (terminal fields, by id={path}) ----
  /** The input/select element rendered for `path`, or null. */
  field: (path: string) => HTMLInputElement | HTMLSelectElement | null;
  /** `.value` of the field (empty string if absent). */
  value: (path: string) => string;
  /** `.checked` of a checkbox field. */
  checked: (path: string) => boolean;
  /** `data-mount` ordinal of an instrumented field (NaN if absent/uninstrumented). */
  mountOrdinal: (path: string) => number;
  /** Error text(s) currently shown in the DOM. */
  errorTexts: () => string[];

  // ---- node-tree queries ----
  /** Node at `path` via the form handle (null if not found). */
  node: (path: string) => SchemaNode | null;
  /** Current root value from the handle. */
  getValue: () => any;
  /** Current errors from the handle. */
  getErrors: () => JsonSchemaError[];
  /** Attached files map (for file-upload scenarios). */
  attachedFilesMap: () => ReturnType<FormHandle['getAttachedFilesMap']>;

  // ---- user interactions (real DOM events via userEvent) ----
  /** Clear then type `text` into a text/number field. */
  type: (path: string, text: string) => Promise<void>;
  /** Clear a field. */
  clear: (path: string) => Promise<void>;
  /** Select an option in a <select> field. */
  selectOption: (path: string, value: string) => Promise<void>;
  /** Toggle a checkbox field. */
  toggle: (path: string) => Promise<void>;
  /** Click the "add item" button of the array at `arrayPath`. */
  addItem: (arrayPath: string) => Promise<void>;
  /** Click the "remove item" button for item `index` of the array. */
  removeItem: (arrayPath: string, index: number) => Promise<void>;

  // ---- programmatic ----
  /**
   * Set the whole form value and let the cascade settle (wrapped in act +
   * flushed). For mid-cascade assertions use `handle.setValue` directly.
   */
  setValue: (value: any, option?: number) => Promise<void>;
  reset: () => Promise<void>;
  validate: () => Promise<JsonSchemaError[]>;

  // ---- async draining ----
  /** Flush microtasks + a macrotask so the event cascade settles. */
  flush: (ms?: number) => Promise<void>;
}

const byId = (
  container: HTMLElement,
  path: string,
): HTMLInputElement | HTMLSelectElement | null =>
  container.querySelector(`#${CSS.escape(path)}`);

const byPath = (container: HTMLElement, path: string): HTMLElement | null =>
  container.querySelector(`[data-path="${path}"]`);

/**
 * Find the rendered container of an array node so add/remove buttons can be
 * scoped to it. Climbs from the array's `[data-path]` wrapper to its fieldset,
 * falling back to the wrapper (or whole container) for a single-array form.
 */
const arrayScope = (container: HTMLElement, arrayPath: string): HTMLElement => {
  const wrap = byPath(container, arrayPath);
  if (!wrap) return container;
  return (wrap.querySelector('fieldset') as HTMLElement | null) ?? wrap;
};

export const renderForm = async (
  jsonSchema: JsonSchema,
  options: RenderFormOptions = {},
): Promise<FormHarness> => {
  const {
    validator,
    strictMode,
    instrument,
    flushOnMount = true,
    initialFlushMs = 0,
    onChange,
    formTypeInputDefinitions,
    ...formProps
  } = options;
  if (validator) setupValidatorPlugin();

  const ref = createRef<FormHandle>();
  const user = userEvent.setup();
  const changes: any[] = [];
  const errors: string[] = [];
  const mountMap = new Map<string, number>();

  const onError = (e: ErrorEvent) => errors.push(e.message ?? String(e.error));
  const onRejection = (e: PromiseRejectionEvent) =>
    errors.push(String(e.reason?.message ?? e.reason));
  window.addEventListener('error', onError);
  window.addEventListener('unhandledrejection', onRejection);

  const defs: FormTypeInputDefinition[] = [
    ...(formTypeInputDefinitions ?? []),
    ...(instrument ? buildInstrumentedDefinitions(mountMap) : []),
  ];

  const form = (
    <Form
      ref={ref as any}
      jsonSchema={jsonSchema as any}
      onChange={(value: any) => {
        changes.push(value);
        onChange?.(value);
      }}
      formTypeInputDefinitions={defs.length ? defs : undefined}
      {...(formProps as any)}
    />
  );
  const element: ReactElement = strictMode ? (
    <StrictMode>{form}</StrictMode>
  ) : (
    form
  );

  let utils!: ReturnType<typeof render>;
  if (flushOnMount) {
    await act(async () => {
      utils = render(element);
    });
    // Drain the initial composition cascade (oneOf/anyOf branch attach,
    // defaults, computed visibility) so the first assertion sees settled DOM.
    await act(async () => {
      await new Promise((r) => setTimeout(r, initialFlushMs));
    });
  } else {
    // Synchronous commit only — microtask cascade NOT drained, so the caller
    // can assert the priming snapshot before calling `flush()`.
    act(() => {
      utils = render(element);
    });
  }

  const container = utils.container;

  const flush = async (ms = 0) => {
    await act(async () => {
      await new Promise((r) => setTimeout(r, ms));
    });
  };

  return {
    handle: ref.current as FormHandle,
    container,
    user,
    lastValue: () => changes[changes.length - 1],
    changeLog: () => changes.slice(),
    caughtErrors: () => errors.slice(),
    unmount: () => {
      window.removeEventListener('error', onError);
      window.removeEventListener('unhandledrejection', onRejection);
      utils.unmount();
    },

    wrapper: (path) => byPath(container, path),
    exists: (path) => byPath(container, path) !== null,
    renderedPaths: () =>
      Array.from(container.querySelectorAll('[data-path]')).map(
        (el) => (el as HTMLElement).dataset.path ?? '',
      ),

    field: (path) => byId(container, path),
    value: (path) => {
      const el = byId(container, path);
      return el ? ((el as HTMLInputElement).value ?? '') : '';
    },
    checked: (path) => {
      const el = byId(container, path) as HTMLInputElement | null;
      return el ? el.checked : false;
    },
    mountOrdinal: (path) => {
      const el = byId(container, path);
      const raw = el?.getAttribute('data-mount');
      return raw == null ? NaN : Number(raw);
    },
    errorTexts: () =>
      Array.from(container.querySelectorAll('em'))
        .map((el) => el.textContent?.trim() ?? '')
        .filter(Boolean),

    node: (path) => ref.current?.findNode(path) ?? null,
    getValue: () => ref.current?.getValue(),
    getErrors: () => ref.current?.getErrors() ?? [],
    attachedFilesMap: () => ref.current!.getAttachedFilesMap(),

    type: async (path, text) => {
      const el = byId(container, path);
      if (!el) throw new Error(`type: no field at "${path}"`);
      await user.clear(el);
      if (text !== '') await user.type(el, text);
      await flush();
    },
    clear: async (path) => {
      const el = byId(container, path);
      if (!el) throw new Error(`clear: no field at "${path}"`);
      await user.clear(el);
      await flush();
    },
    selectOption: async (path, optionValue) => {
      const el = byId(container, path);
      if (!el) throw new Error(`selectOption: no field at "${path}"`);
      await user.selectOptions(el, optionValue);
      await flush();
    },
    toggle: async (path) => {
      const el = byId(container, path);
      if (!el) throw new Error(`toggle: no field at "${path}"`);
      await user.click(el);
      await flush();
    },
    addItem: async (arrayPath) => {
      const scope = arrayScope(container, arrayPath);
      const button = within(scope).getAllByTitle('add item')[0];
      await user.click(button);
      await flush();
    },
    removeItem: async (arrayPath, index) => {
      const scope = arrayScope(container, arrayPath);
      const button = within(scope).getAllByTitle('remove item')[index];
      if (!button)
        throw new Error(
          `removeItem: no remove button #${index} in "${arrayPath}"`,
        );
      await user.click(button);
      await flush();
    },

    setValue: async (value, option) => {
      await act(async () => {
        ref.current!.setValue(value, option as any);
        await new Promise((r) => setTimeout(r, 0));
      });
    },
    reset: async () => {
      await act(async () => {
        ref.current?.reset();
        await new Promise((r) => setTimeout(r, 0));
      });
    },
    validate: async () => {
      let result: JsonSchemaError[] = [];
      await act(async () => {
        result = (await ref.current?.validate()) ?? [];
      });
      return result;
    },

    flush,
  };
};
