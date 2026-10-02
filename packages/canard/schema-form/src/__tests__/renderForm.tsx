import {
  type FC,
  type ReactElement,
  StrictMode,
  createRef,
  useState,
} from 'react';

import { act, render, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { registerScenarioHandle } from '@aileron/schema-form-scenarios';

import { createRenderValidator } from './helpers/createRenderValidator';
import { observeErrorSink } from './helpers/observeErrorSink';
import { createRenderScenarioAdapter } from './helpers/createRenderScenarioAdapter';

import {
  Form,
  type FormHandle,
  type FormProps,
  type FormTypeInputDefinition,
  type FormTypeInputProps,
  type JSONSchema,
  type ValidationIssue,
  type SchemaNode,
  registerPlugin,
} from '@/schema-form';
import type { FormErrorRecord } from '@/schema-form/errors';

/** The shared harness observes settled node state and committed React DOM. */
export const setupValidatorPlugin = (): void => {
  registerPlugin({ validator: createRenderValidator() });
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
   * Wait for pending React work before returning (default true).
   * False skips this extra wait; the engine is already synchronously settled.
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
  /** Ownerless host errors since mount, formatted for existing assertions. */
  caughtErrors: () => string[];
  /** Original ownerless error values from reportError, window, or console. */
  sinkErrors: () => unknown[];
  /** Form-owned records delivered through onError, separate from host failures. */
  errorRecords: () => FormErrorRecord[];
  unmount: () => void;

  // ---- DOM presence (by JSONPointer path; canonical [data-path] hook) ----
  /** The `[data-path]` element for an enabled node (mounted wrapper OR deferred placeholder), or null. */
  wrapper: (path: string) => HTMLElement | null;
  /** Whether a node's subtree is actually mounted (placeholders excluded). */
  exists: (path: string) => boolean;
  /** All node paths with a mounted subtree, in document order. */
  renderedPaths: () => string[];
  /** Whether a node currently renders as a virtualization placeholder (`data-deferred`). */
  deferred: (path: string) => boolean;
  /** All node paths currently deferred as placeholders, in document order. */
  deferredPaths: () => string[];

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
  getErrors: () => readonly ValidationIssue[];
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
   * Set the whole form value synchronously and wait for the React commit.
   */
  setValue: (value: any, option?: number) => Promise<void>;
  /** Load current Form props synchronously, then wait for commit reconciliation. */
  reset: () => Promise<void>;
  validate: () => Promise<readonly ValidationIssue[]>;

  // ---- async draining ----
  /** Wait for pending React effects, validation, or virtualization work. */
  flush: (ms?: number) => Promise<void>;
}

const byId = (
  container: HTMLElement,
  path: string,
): HTMLInputElement | HTMLSelectElement | null =>
  Array.from(container.querySelectorAll<HTMLInputElement | HTMLSelectElement>('input[id], select[id], textarea[id]')).find((element) => element.id === path) ?? null;

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
  jsonSchema: JSONSchema,
  options: RenderFormOptions = {},
): Promise<FormHarness> => {
  const {
    validator,
    strictMode,
    instrument,
    flushOnMount = true,
    initialFlushMs = 0,
    onChange,
    onError,
    formTypeInputDefinitions,
    ...formProps
  } = options;
  if (validator) setupValidatorPlugin();

  const ref = createRef<FormHandle>();
  const user = userEvent.setup();
  const changes: any[] = [];
  const sink = observeErrorSink();
  const records: FormErrorRecord[] = [];
  const mountMap = new Map<string, number>();

  const defs: FormTypeInputDefinition[] = [
    ...(formTypeInputDefinitions ?? []),
    ...(instrument ? buildInstrumentedDefinitions(mountMap) : []),
  ];

  const form = (
    <Form
      ref={ref}
      jsonSchema={jsonSchema}
      onChange={(value: any) => {
        changes.push(value);
        onChange?.(value);
      }}
      onError={(record) => {
        records.push(record);
        onError?.(record);
      }}
      formTypeInputDefinitions={defs.length ? defs : undefined}
      {...formProps}
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
    // Engine settlement is synchronous; this wait drains React and host work.
    await act(async () => {
      await new Promise((r) => setTimeout(r, initialFlushMs));
    });
  } else {
    // Skip the extra host wait while retaining the settled engine snapshot.
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

  let unregister = () => {};
  const harness: FormHarness = {
    handle: ref.current as FormHandle,
    container,
    user,
    lastValue: () => changes[changes.length - 1],
    changeLog: () => changes.slice(),
    caughtErrors: () => sink.errors().map((error) => error instanceof Error ? error.message : String(error)),
    sinkErrors: sink.errors,
    errorRecords: () => records.slice(),
    unmount: () => {
      utils.unmount();
      unregister();
      sink.cleanup();
    },

    wrapper: (path) => byPath(container, path),
    exists: (path) =>
      container.querySelector(`[data-path="${path}"]:not([data-deferred])`) !==
      null,
    renderedPaths: () =>
      Array.from(
        container.querySelectorAll('[data-path]:not([data-deferred])'),
      ).map((el) => (el as HTMLElement).dataset.path ?? ''),
    deferred: (path) =>
      container.querySelector(`[data-path="${path}"][data-deferred]`) !== null,
    deferredPaths: () =>
      Array.from(container.querySelectorAll('[data-path][data-deferred]')).map(
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
      let result: readonly ValidationIssue[] = [];
      await act(async () => {
        result = (await ref.current?.validate()) ?? [];
      });
      return result;
    },

    flush,
  };
  unregister = registerScenarioHandle(container, harness.handle, createRenderScenarioAdapter(harness));
  return harness;
};
