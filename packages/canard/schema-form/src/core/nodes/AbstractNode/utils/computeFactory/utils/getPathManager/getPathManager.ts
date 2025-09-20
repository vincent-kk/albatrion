import type { Fn } from '@aileron/declare';

import { JSONPointer as $ } from '@/schema-form/helpers/jsonPointer';

export interface PathManager {
  get: Fn<[], string[]>;
  set: Fn<[path: string]>;
  findIndex: Fn<[path: string], number>;
}

export const getPathManager = (): PathManager => {
  const paths = new Array<string>();
  return {
    get: () => paths,
    set: (path: string) => {
      if (path[0] === $.Fragment) path = path.slice(1);
      if (!paths.includes(path)) paths.push(path);
    },
    findIndex: (path: string) => {
      if (path[0] === $.Fragment) path = path.slice(1);
      return paths.indexOf(path);
    },
  };
};
