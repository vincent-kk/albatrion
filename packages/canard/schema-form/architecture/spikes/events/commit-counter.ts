/**
 * Counts React commits through the DevTools global hook. React DOM calls
 * `injectInternals` when `react-dom/client` is evaluated, so this module must
 * be imported BEFORE `@testing-library/react` (which imports react-dom/client).
 */

let commits = 0;

const hook = {
  isDisabled: false,
  supportsFiber: true,
  renderers: new Map<number, unknown>(),
  inject(internals: unknown): number {
    const id = hook.renderers.size + 1;
    hook.renderers.set(id, internals);
    return id;
  },
  checkDCE(): void {},
  onCommitFiberRoot(): void {
    commits++;
  },
  onCommitFiberUnmount(): void {},
  onPostCommitFiberRoot(): void {},
};

(globalThis as any).__REACT_DEVTOOLS_GLOBAL_HOOK__ = hook;

export const commitCount = (): number => commits;

export const hookInjected = (): boolean => hook.renderers.size > 0;
