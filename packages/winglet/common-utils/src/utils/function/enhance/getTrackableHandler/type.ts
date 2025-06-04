import type { Dictionary, Fn } from '@aileron/declare';

export type StateManager<State extends Dictionary> = {
  get state(): State;
  update: Fn<
    [updater: Partial<State> | Fn<[prev: State], Partial<State>>],
    void
  >;
};

export type TrackableHandlerFunction<
  Args extends any[] = [],
  Result = any,
  State extends Dictionary = {},
> = {
  (...args: Args): Promise<Result>;
  readonly subscribe: (listener: Fn) => Fn;
  readonly state: State;
} & Omit<State, 'subscribe' | 'state'>;

export type TrackableHandlerOptions<
  Args extends any[] = [],
  State extends Dictionary = {},
> = {
  preventConcurrent?: boolean;
  initialState: State;
  beforeExecute?: (args: Args, stateManager: StateManager<State>) => void;
  afterExecute?: (args: Args, stateManager: StateManager<State>) => void;
};
