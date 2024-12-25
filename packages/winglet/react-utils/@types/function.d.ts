declare interface Fn<Params extends Array<any> = [], Return = void> {
  (...props: Params): Return;
}

declare interface AsyncFn<Params extends Array<any>, Return = void> {
  (...props: Params): Promise<Return>;
}

declare type SetStateFn<S = unknown> = (
  value: S | ((prevState: S) => S),
) => void;

declare type Parameter<
  F extends Fn<[any]> | SetStateFn<any> | undefined,
  I extends number = 0,
> = Parameters<NonNullable<F>>[I];
