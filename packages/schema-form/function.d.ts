declare interface Fn<Params extends Array<any>, Return = void> {
  (...props: Params): Return;
}

declare interface AsyncFn<Params extends Array<any>, Return = void> {
  (...props: Params): Promise<Return>;
}
