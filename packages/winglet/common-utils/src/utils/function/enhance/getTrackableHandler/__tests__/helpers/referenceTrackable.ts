import type { TrackableHandlerFunction, TrackableHandlerOptions } from '../../type';

/** Model of independent call frames, using a set of live calls for aggregate pending. */
export function referenceTrackable(
  origin: (id: number) => Promise<number>, options: TrackableHandlerOptions<[number], { writes: number }>,
): TrackableHandlerFunction<[number], number, { writes: number }> {
  const live = new Set<object>();
  const listeners = new Set<() => void>();
  let state = options.initialState ?? { writes: 0 };
  const notify = () => { for (const listener of listeners) listener(); };
  const handler = async (...args: [number]) => {
    if (options.preventConcurrent && live.size) return undefined;
    const frame = { inHook: true };
    live.add(frame);
    const manager = {
      get state() { return state; },
      update: (value: Partial<{ writes: number }> | ((previous: { writes: number }) => Partial<{ writes: number }>)) => {
        state = { ...state, ...(typeof value === 'function' ? value(state) : value) };
        if (!frame.inHook) notify();
      },
    };
    try {
      const before = options.beforeExecute?.(args, manager);
      if (before && typeof Reflect.get(Object(before), 'then') === 'function') await before;
    } catch (error) {
      frame.inHook = false; live.delete(frame); notify(); throw error;
    }
    frame.inHook = false;
    try { notify(); return await origin(...args); }
    finally {
      frame.inHook = true;
      try {
        const after = options.afterExecute?.(args, manager);
        if (after && typeof Reflect.get(Object(after), 'then') === 'function') await after;
      } finally { frame.inHook = false; live.delete(frame); notify(); }
    }
  };
  const exposed = Object.assign(handler, { pending: false, state, subscribe: (listener: () => void) => { listeners.add(listener); return () => { listeners.delete(listener); }; } });
  return Object.defineProperties(exposed, {
    pending: { get: () => live.size > 0 }, state: { get: () => state },
    subscribe: { value: (listener: () => void) => { listeners.add(listener); return () => listeners.delete(listener); } },
  });
}
