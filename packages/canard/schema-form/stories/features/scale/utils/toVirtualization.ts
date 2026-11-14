import { deferredMountOptions } from '@aileron/schema-form-scenarios';

import { VirtualizationBackfill, type VirtualizationOptions } from '../../../../src';

/** VirtualizationBackfill members keyed by their string values, as the scenario data names them. */
const backfillByValue: Record<(typeof deferredMountOptions)['backfill'], VirtualizationBackfill> = { none: VirtualizationBackfill.None };

/**
 * Map the plain deferred-mount options to the engine's virtualization options.
 * @returns Options for the Form virtualization prop.
 */
export const toVirtualization = (): VirtualizationOptions => ({ ...deferredMountOptions, backfill: backfillByValue[deferredMountOptions.backfill] });
