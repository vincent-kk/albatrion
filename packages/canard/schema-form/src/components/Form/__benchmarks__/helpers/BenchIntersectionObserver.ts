/** Deterministic viewport driver; no idle or geometry work enters the samples. */
export class BenchIntersectionObserver implements IntersectionObserver {
  /** The latest per-form observer receives manually chosen intersections. */
  static current: BenchIntersectionObserver;
  /** Browser-compatible observer metadata is inert in the deterministic driver. */
  readonly root = null;
  /** No viewport margins are evaluated by this driver. */
  readonly rootMargin = '0px';
  /** No scroll margins are evaluated by this driver. */
  readonly scrollMargin = '0px';
  /** Intersecting entries always cross this threshold. */
  readonly thresholds = [0];
  /** Targets retained in registration order. */
  readonly elements = new Set<Element>();
  /** Callback supplied by the real source manager. */
  readonly callback: IntersectionObserverCallback;

  /** Keep the real callback so natural reveal exercises the manager's IO path. */
  constructor(callback: IntersectionObserverCallback) {
    this.callback = callback;
    BenchIntersectionObserver.current = this;
  }
  /** Retain a newly observed target. */
  observe(element: Element) {
    this.elements.add(element);
  }
  /** Drop a revealed or unmounted target. */
  unobserve(element: Element) {
    this.elements.delete(element);
  }
  /** Release the form's targets at teardown. */
  disconnect() {
    this.elements.clear();
  }
  /** There are no asynchronous records. */
  takeRecords(): IntersectionObserverEntry[] {
    return [];
  }
  /** Reveal exactly the supplied targets through the registered IO callback. */
  reveal(elements: Element[]) {
    const bounds = new DOMRect();
    this.callback(
      elements.map((target) => ({
        target,
        isIntersecting: true,
        intersectionRatio: 1,
        time: 0,
        boundingClientRect: bounds,
        intersectionRect: bounds,
        rootBounds: null,
      })),
      this,
    );
  }
}
