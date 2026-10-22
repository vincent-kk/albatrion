/** Public writes interpreted by the two verification runners. */
export interface RemountWrite {
  action:
    | 'setValue'
    | 'bulk'
    | 'merge'
    | 'same'
    | 'push'
    | 'pop'
    | 'remove'
    | 'update'
    | 'insert'
    | 'clear'
    | 'reset'
    | 'resetSubtree'
    | 'context'
    | 'retain'
    | 'retained'
    | 'batch';
  path?: string;
  value?: unknown;
  index?: number;
  option?: number;
  key?: string;
  writes?: readonly RemountWrite[];
}

/** An allowed difference fixed before either observation is compared. */
export interface ObservationMask {
  path: string;
  fresh: unknown;
  category: 'omitEmpty' | 'omitTrailing' | 'fill' | 'lifecycle';
  clause: string;
}

/** Pure schema and write data; no engine or React implementation is retained. */
export interface RemountScene {
  id: string;
  seed: number;
  schema: object;
  initialValue?: unknown;
  context?: Readonly<Record<string, unknown>>;
  writes: readonly RemountWrite[];
  group: string;
  features?: readonly string[];
  masks?: readonly { prefix: number; entries: readonly ObservationMask[] }[];
}

/** Raw values are encoded only when a diagnostic is printed. */
export interface ObservationDifference {
  path: string;
  updated: unknown;
  fresh: unknown;
}

/** One comparison carries the exact scene prefix needed for reproduction. */
export interface RemountMismatch {
  scene: string;
  seed: number;
  prefix: number;
  differences: readonly ObservationDifference[];
}
