import { clone } from '@winglet/common-utils/object';

import { blueprintCacheDomain } from '@/schema-form/app/cache';
import { buildFieldNodeTree, mountFieldNode } from '@/schema-form/core';
import {
  isRenderAtomic,
  isRenderTerminal,
} from '@/schema-form/helpers/schemaIdentity';

import type { RootLoad, RootLoadProps } from '../type';

/**
 * Build a speculative root; prepared current loads deliver even while effects are disconnected.
 * @param props - Committed Form props for this load; the default value is cloned before building.
 * @param reporter - Instance reporter that receives prepared current load reports; may be absent.
 * @param mount - Mount the built tree now; `false` leaves mounting to a reset that first adopts the previous tree.
 * @returns The load; a construction or mount failure is kept in `error` instead of thrown.
 */
export const createRootLoad = (
  props: RootLoadProps,
  reporter: RootLoad['reporter'],
  mount = true,
): RootLoad => {
  const load: RootLoad = {
    props,
    records: [],
    prepared: false,
    reporter,
    warningScope: reporter?.warningScope,
  };
  try {
    load.root = buildFieldNodeTree({
      ...props,
      cache: blueprintCacheDomain.cache,
      defaultValue: clone(props.defaultValue),
      isTerminal: isRenderTerminal,
      isAtomic: isRenderAtomic,
      errorReporter: {
        hasConsumer: () =>
          !load.retired &&
          (reporter?.hasConsumer() ?? process.env.NODE_ENV !== 'production'),
        report: (record) => {
          if (load.retired) return;
          if (load.prepared) {
            if (reporter && load.root) reporter.root = load.root;
            reporter?.report(record);
          } else {
            load.records.push(record);
            (load.recordScopes ??= new WeakMap()).set(record, {
              root: load.root,
              warningScope: reporter?.warningScope,
            });
          }
        },
      },
      onChange: (value) => {
        if (load.prepared && !load.retired) load.props.onChange?.(value);
      },
      onStateChange: () => {
        if (load.prepared && !load.retired && load.root)
          load.props.onStateChange?.(load.root.globalState);
      },
    });
    if (mount)
      mountFieldNode(load.root, undefined, undefined, {
        deferValidation: true,
      });
  } catch (error) {
    load.error = error;
    if (load.root?.diagnostics.cause === 'sharedConflict')
      load.root = undefined;
  }
  return load;
};
