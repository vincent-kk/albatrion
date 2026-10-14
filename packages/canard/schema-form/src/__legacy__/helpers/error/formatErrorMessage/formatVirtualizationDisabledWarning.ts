import { createDivider } from './utils/createDivider';

/**
 * Formats a development warning for when `virtualization` is enabled but
 * IntersectionObserver is unavailable (e.g. SSR), so render-level
 * virtualization is silently disabled. Enabling it in an SSR/hydration app
 * causes a hydration mismatch.
 */
export const formatVirtualizationDisabledWarning = (): string => {
  const divider = createDivider();
  return `
'virtualization' is enabled but IntersectionObserver is unavailable, so it is
disabled. Render-level virtualization is client-side-rendering only.

  ╭${divider}
  │  Requires:  IntersectionObserver (browser only)
  │  Status:    disabled (unavailable in this environment, e.g. SSR)
  ╰${divider}

Enabling it in an SSR/hydration app causes a hydration mismatch: the server
renders every field while the client gates them behind placeholders.

How to fix:
  1. Do not set 'virtualization' in SSR/hydration apps
  2. Or enable it only on the client, after mount (client-side rendering only)
`.trim();
};
