export const isPromise = <T extends Promise<any>>(value: unknown): value is T =>
  value instanceof Promise;
