/**
 * Allocate native slots with the original prototype without executing its constructor body.
 * @param base Native built-in constructor whose slots are required.
 * @param args Arguments accepted by that native constructor.
 * @param prototype Prototype of the original built-in value.
 * @returns A native shell retaining the supplied prototype.
 */
export function constructBuiltin<T extends object>(
  base: new (...args: any[]) => T,
  args: any[],
  prototype: object | null,
): T {
  const constructor =
    prototype === null
      ? undefined
      : Object.getOwnPropertyDescriptor(prototype, 'constructor')?.value;
  if (
    typeof constructor === 'function' &&
    Object.getOwnPropertyDescriptor(constructor, 'prototype')?.value ===
      prototype
  ) {
    try {
      return Reflect.construct(base, args, constructor);
    } catch {
      /* A forged function prototype need not be constructable. */
    }
  }
  return Object.setPrototypeOf(Reflect.construct(base, args), prototype);
}
