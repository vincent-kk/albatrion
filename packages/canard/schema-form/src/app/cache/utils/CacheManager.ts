import type { CacheDomain } from '../type';

/** Static registry of application-owned domains; bindings and tests own resets. */
export class CacheManager {
  /** Registered domain owners, never individual schema keys or runtime nodes. */
  private static readonly domains = new Set<
    Pick<CacheDomain<object, unknown>, 'clear'>
  >();

  /** Register a process-lifetime domain whose storage participates in reset. */
  static register(domain: Pick<CacheDomain<object, unknown>, 'clear'>): void {
    CacheManager.domains.add(domain);
  }

  /** Clear each domain for future resolutions without altering live values. */
  static reset(): void {
    for (const domain of CacheManager.domains) domain.clear();
  }
}
