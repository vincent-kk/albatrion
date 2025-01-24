import type { Fn } from '@aileron/types';

import { delay } from './delay';

export async function waitAndExecute<T>(fn: Fn<[], T>, ms?: number): Promise<T>;
export async function waitAndExecute(
  fn: undefined,
  ms?: number,
): Promise<undefined>;

export async function waitAndExecute<T>(fn: Fn<[], T> | undefined, ms = 0) {
  await delay(ms);
  return typeof fn === 'function' ? fn() : undefined;
}
