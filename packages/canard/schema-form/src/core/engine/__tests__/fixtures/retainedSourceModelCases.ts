export const POLICIES = ['keep', 'unset', 'declaration', 'callback'] as const;
export const SHAPES = ['scalar', 'array', 'held'] as const;
export const TIMINGS = ['same wave', 'next wave'] as const;
export const ORDERS = ['fill then name', 'name then fill'] as const;
export const ROUTES = ['own', 'parent', 'virtual'] as const;
export const CALLS = ['setter', 'merge', 'batch', 'nested'] as const;

type Policy = (typeof POLICIES)[number];
export type Shape = (typeof SHAPES)[number];
type Timing = (typeof TIMINGS)[number];
export type Order = (typeof ORDERS)[number];
export type Route = (typeof ROUTES)[number];
export type Call = (typeof CALLS)[number];
export type Step = 'fill' | 'name';
export type Channel = '/o/n/m/y' | '/o/n/m/held' | '/o/z';
export type Source = string | readonly (string | undefined)[];

export type Event =
  | { kind: 'name'; channel: Channel; value: Source }
  | { kind: 'fill'; channel: Channel }
  | { kind: 'resize'; length: number; items?: readonly (string | undefined)[] }
  | { kind: 'close'; policy: Policy; resolved: Source };

export interface Case {
  readonly shape: Shape;
  readonly timing: Timing;
  readonly order: Order;
  readonly policy: Policy;
  readonly arrayInput?: 'dense' | 'sparse' | 'empty';
  readonly groupWidth?: 2;
}

export const Y = '/o/n/m/y';
export const HELD = '/o/n/m/held';
export const Z = '/o/z';
