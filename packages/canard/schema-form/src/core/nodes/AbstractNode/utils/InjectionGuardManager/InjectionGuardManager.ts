import { scheduleMacrotaskSafe } from '@winglet/common-utils/scheduler';

import type { AbstractNode } from '../../AbstractNode';

/**
 * Manages injection guard state to prevent circular injection loops.
 * @description Tracks which node paths are currently being injected and provides
 *              deferred cleanup via macrotask scheduling. This ensures that multiple
 *              `injectTo` operations within the same synchronous execution context
 *              can complete before the guard state is cleared.
 */
export class InjectionGuardManager {
  /**
   * Set of data paths currently being injected.
   * @description Tracks which nodes are currently being injected to prevent circular injection loops.
   */
  private __injectedPaths__: Set<AbstractNode['path']>;

  /**
   * Scheduled macrotask ID for clearing injected node flags.
   * @description Used to batch clear injected flags after all synchronous injection
   *              operations complete. The ID prevents duplicate scheduling.
   */
  private __scheduledClearInjectedPathsId__: number | null = null;

  constructor() {
    this.__injectedPaths__ = new Set();
  }

  /**
   * Marks a node path as currently being injected.
   * @param path - The data path of the node to mark as injected
   */
  public add(this: InjectionGuardManager, path: AbstractNode['path']) {
    this.__injectedPaths__.add(path);
  }

  /**
   * Removes the injection mark from a node path.
   * @param path - The data path of the node to unmark
   */
  public remove(this: InjectionGuardManager, path: AbstractNode['path']) {
    this.__injectedPaths__.delete(path);
  }

  /**
   * Checks if a node path is currently being injected.
   * @param path - The data path of the node to check
   * @returns `true` if the node is currently being injected, `false` otherwise
   */
  public has(this: InjectionGuardManager, path: AbstractNode['path']) {
    return this.__injectedPaths__.has(path);
  }

  /**
   * Clears all injection marks immediately.
   */
  public clear(this: InjectionGuardManager) {
    this.__injectedPaths__.clear();
  }

  /**
   * Schedules clearing of all injection marks in a macrotask.
   * @description Uses macrotask scheduling to ensure all synchronous injection operations
   *              complete before clearing flags. Prevents duplicate scheduling if already scheduled.
   */
  public scheduleClearInjectedPaths(this: InjectionGuardManager) {
    if (this.__scheduledClearInjectedPathsId__ !== null) return;
    this.__scheduledClearInjectedPathsId__ = scheduleMacrotaskSafe(() => {
      this.__scheduledClearInjectedPathsId__ = null;
      this.__injectedPaths__.clear();
    });
  }
}
