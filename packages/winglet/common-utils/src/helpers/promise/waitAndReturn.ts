import { delay } from './delay';

export async function waitAndReturn<T>(fn: () => T, ms?: number): Promise<T>;
export async function waitAndReturn(
  fn: undefined,
  ms?: number,
): Promise<undefined>;

export async function waitAndReturn<T>(fn: (() => T) | undefined, ms = 0) {
  const result = typeof fn === 'function' ? fn() : undefined;
  await delay(ms);
  return result;
}
