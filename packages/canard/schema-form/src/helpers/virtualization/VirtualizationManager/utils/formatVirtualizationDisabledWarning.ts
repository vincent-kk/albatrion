import { createDivider } from '@/schema-form/helpers/error';

/**
 * Formats a development warning for when `virtualization` is enabled but
 * IntersectionObserver is unavailable in the browser. Fields mount eagerly;
 * server rendering does not emit this diagnostic.
 */
export const formatVirtualizationDisabledWarning = (): string => {
  const divider = createDivider();
  return `
'virtualization' is enabled but IntersectionObserver is unavailable, so it is
disabled in this browser. Every field mounts eagerly.

  ╭${divider}
  │  Requires:  IntersectionObserver (browser only)
  │  Status:    disabled (unavailable in this browser)
  ╰${divider}

Server-rendered fields hydrate unchanged. Gating applies to branches and
children added after hydration when IntersectionObserver is available.

How to fix:
  1. Provide IntersectionObserver support to enable deferred mounting
  2. Or omit 'virtualization' to use eager mounting without this warning
`.trim();
};
