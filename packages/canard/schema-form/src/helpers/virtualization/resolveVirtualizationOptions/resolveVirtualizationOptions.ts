import type {
  ResolvedVirtualizationOptions,
  VirtualizationOptions,
} from '../type';

const DEFAULT_THRESHOLD = 30;
const DEFAULT_EAGER_COUNT = 20;
const DEFAULT_ROOT_MARGIN = '100%';
const DEFAULT_BACKFILL = 'idle';
const DEFAULT_ESTIMATE_HEIGHT = 40;

/**
 * Normalize the `virtualization` form prop into fully-resolved options.
 * @param input - `true` for defaults, an options object for overrides, falsy to disable
 * @returns Resolved options, or `null` when virtualization is disabled
 */
export const resolveVirtualizationOptions = (
  input: boolean | VirtualizationOptions | undefined,
): ResolvedVirtualizationOptions | null => {
  if (!input) return null;
  if (input === true)
    return {
      threshold: DEFAULT_THRESHOLD,
      eagerCount: DEFAULT_EAGER_COUNT,
      rootMargin: DEFAULT_ROOT_MARGIN,
      backfill: DEFAULT_BACKFILL,
      estimateHeight: DEFAULT_ESTIMATE_HEIGHT,
    };
  return {
    threshold: input.threshold ?? DEFAULT_THRESHOLD,
    eagerCount: input.eagerCount ?? DEFAULT_EAGER_COUNT,
    rootMargin: input.rootMargin ?? DEFAULT_ROOT_MARGIN,
    backfill: input.backfill ?? DEFAULT_BACKFILL,
    estimateHeight: input.estimateHeight ?? DEFAULT_ESTIMATE_HEIGHT,
  };
};
