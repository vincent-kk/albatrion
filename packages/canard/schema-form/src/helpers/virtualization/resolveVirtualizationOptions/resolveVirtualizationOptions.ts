import type {
  ResolvedVirtualizationOptions,
  VirtualizationOptions,
} from '../type';

const DEFAULT_OPTIONS = {
  threshold: 30,
  eagerCount: 20,
  rootMargin: '100%',
  backfill: 'idle',
  estimateHeight: 40,
  Placeholder: null,
} satisfies ResolvedVirtualizationOptions;

/**
 * Normalize the `virtualization` form prop into fully-resolved options.
 * @param input - `true` for defaults, an options object for overrides, falsy to disable
 * @returns Resolved options, or `null` when virtualization is disabled
 */
export const resolveVirtualizationOptions = (
  input: boolean | VirtualizationOptions | undefined,
): ResolvedVirtualizationOptions | null => {
  if (!input) return null;
  if (input === true) return DEFAULT_OPTIONS;
  return {
    threshold: input.threshold ?? DEFAULT_OPTIONS.threshold,
    eagerCount: input.eagerCount ?? DEFAULT_OPTIONS.eagerCount,
    rootMargin: input.rootMargin ?? DEFAULT_OPTIONS.rootMargin,
    backfill: input.backfill ?? DEFAULT_OPTIONS.backfill,
    estimateHeight: input.estimateHeight ?? DEFAULT_OPTIONS.estimateHeight,
    Placeholder: input.Placeholder ?? DEFAULT_OPTIONS.Placeholder,
  };
};
