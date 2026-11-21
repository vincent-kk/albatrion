/** Abort cancellation surface when the consumer has no DOM or Node global declarations. */
export type AbortSignalValue = typeof globalThis extends {
  AbortSignal: { prototype: infer Signal };
} ? Signal : {
  readonly aborted: boolean;
  addEventListener(type: 'abort', listener: () => void, options?: { once?: boolean }): void;
  removeEventListener(type: 'abort', listener: () => void): void;
};
