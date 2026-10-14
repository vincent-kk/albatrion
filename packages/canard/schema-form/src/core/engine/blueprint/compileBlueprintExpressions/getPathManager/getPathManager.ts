import type { Fn } from '@aileron/declare';

import { JSONPointer as $ } from '@/schema-form/helpers/jsonPointer';

/** Ordered dependency paths local to one compilation pass. */
export interface PathManager {
  /** Return the paths without transferring mutation ownership. */
  get: Fn<[], string[]>;
  /** Register a normalized path once, preserving first occurrence order. */
  set: Fn<[path: string]>;
  /** Find a normalized path, or -1 when it was not registered. */
  findIndex: Fn<[path: string], number>;
}

/**
 * Create an isolated registry for expression dependency paths.
 * @returns Registry normalizing fragment prefixes on registration and lookup.
 */
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
