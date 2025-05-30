export const Operation = {
  ADD: 'add',
  REMOVE: 'remove',
  REPLACE: 'replace',
} as const;

export type Operation = (typeof Operation)[keyof typeof Operation];

interface BaseFetch {
  operation: Operation;
  path: string;
}

export interface AddFetch<Value> extends BaseFetch {
  operation: typeof Operation.ADD;
  value: Value;
}

export interface UpdateFetch<Value> extends BaseFetch {
  operation: typeof Operation.REPLACE;
  value: Value;
}

export interface RemoveFetch extends BaseFetch {
  operation: typeof Operation.REMOVE;
}

export type Fetch = AddFetch<any> | UpdateFetch<any> | RemoveFetch;
