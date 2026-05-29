import { forceGc } from '../../utils/setup-env';

/**
 * Cross-library form benchmark harness.
 *
 * Every adapter exposes the SAME three operations so the comparison is fair:
 *   - mount(container, fieldCount): build a form of N flat string fields
 *   - fireChange: simulate a USER keystroke on one field (the library's own
 *     onChange path — controlled libs go through React state, RHF goes
 *     through its ref/DOM path)
 *   - setValueProgrammatic: inject a value via the library's imperative API
 *     (RHF `setValue`, Formik `setFieldValue`, schema-form `node.setValue`,
 *     rjsf controlled `formData`, tanstack `setFieldValue`)
 *
 * Each adapter counts how many times its FIELD components actually commit,
 * via a shared render counter. The count is the library's real React work —
 * memo-skipped fields are not counted.
 *
 * Only flat string-field schemas are used: every library expresses them
 * identically, so no library is handicapped by an unsupported construct.
 * schema-form's exclusive features (computed / &ref / if-then-else /
 * oneOf / anyOf) are deliberately OUT of this comparison.
 */

export interface MountedForm {
  /** Simulate a user keystroke on field `index` (library's onChange path). */
  fireChange(index: number, value: string): Promise<void>;
  /** Inject a value through the library's imperative/programmatic API. */
  setValueProgrammatic(index: number, value: string): Promise<void>;
  /** Total field-component commits since the last reset. */
  renderCount(): number;
  /** Reset the commit counter to zero. */
  resetRenderCount(): void;
  /** Tear down the form and free the root. */
  unmount(): void;
}

export interface CompetitorAdapter {
  readonly name: string;
  mount(container: HTMLElement, fieldCount: number): Promise<MountedForm>;
}

export interface BenchResult {
  name: string;
  fieldCount: number;
  mountMs: number;
  mountRenders: number;
  keystrokeMs: number;
  keystrokeRenders: number;
  setValueMs: number;
  setValueRenders: number;
}

const ITERATIONS = 40;

/**
 * Runs the three-phase measurement for one adapter at one field count.
 * Field 0 is always the mutation target so the per-op cost is comparable
 * across libraries regardless of total field count.
 */
export async function benchAdapter(
  adapter: CompetitorAdapter,
  fieldCount: number,
): Promise<BenchResult> {
  // Warmup — one full throwaway cycle so JIT/allocation costs do not land on
  // whichever adapter happens to run first at each size (fairness).
  const warmContainer = document.createElement('div');
  document.body.appendChild(warmContainer);
  try {
    const warm = await adapter.mount(warmContainer, fieldCount);
    await warm.fireChange(0, 'warmup');
    await warm.setValueProgrammatic(0, 'warmup');
    warm.unmount();
  } finally {
    warmContainer.remove();
  }

  const container = document.createElement('div');
  document.body.appendChild(container);

  try {
    // (1) mount
    forceGc();
    const t0 = performance.now();
    const form = await adapter.mount(container, fieldCount);
    const mountMs = performance.now() - t0;
    const mountRenders = form.renderCount();

    // (2) keystroke — user input path
    form.resetRenderCount();
    forceGc();
    const t1 = performance.now();
    for (let i = 0; i < ITERATIONS; i++) await form.fireChange(0, `k_${i}`);
    const keystrokeMs = (performance.now() - t1) / ITERATIONS;
    const keystrokeRenders = form.renderCount() / ITERATIONS;

    // (3) setValue — programmatic value injection
    form.resetRenderCount();
    forceGc();
    const t2 = performance.now();
    for (let i = 0; i < ITERATIONS; i++)
      await form.setValueProgrammatic(0, `s_${i}`);
    const setValueMs = (performance.now() - t2) / ITERATIONS;
    const setValueRenders = form.renderCount() / ITERATIONS;

    form.unmount();
    return {
      name: adapter.name,
      fieldCount,
      mountMs,
      mountRenders,
      keystrokeMs,
      keystrokeRenders,
      setValueMs,
      setValueRenders,
    };
  } finally {
    container.remove();
  }
}
