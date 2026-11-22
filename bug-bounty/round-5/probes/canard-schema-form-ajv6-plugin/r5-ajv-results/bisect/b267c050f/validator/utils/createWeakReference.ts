/// <reference lib="es2021.weakref" preserve="true" />

/**
 * Retain a weak reference where supported, with explicit-release ownership on older hosts.
 * @param value - Registration whose lifetime is otherwise managed by its root.
 * @returns A dereferenceable registration; without WeakRef it remains live until release.
 */
export const createWeakReference = <T extends object>(value: T): Pick<WeakRef<T>, 'deref'> =>
  typeof WeakRef === 'function' ? new WeakRef(value) : { deref: () => value };
