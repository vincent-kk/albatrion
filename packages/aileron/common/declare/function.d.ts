export interface Fn<Params extends Array<any> = [], Return = void> {
  (...props: Params): Return;
}

export interface AsyncFn<Params extends Array<any> = [], Return = void> {
  (...props: Params): Promise<Return>;
}

export type SetStateFn<S = unknown> = (
  value: S | ((prevState: S) => S),
) => void;

export type Parameter<
  F extends Fn<[any]> | SetStateFn<any> | undefined,
  I extends number = 0,
> = Parameters<NonNullable<F>>[I];
