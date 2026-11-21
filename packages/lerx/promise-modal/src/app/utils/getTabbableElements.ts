import { isUnslotted } from './isUnslotted';

/** Elements that can enter sequential focus navigation without being editing hosts. */
const CONTROL_SELECTOR =
  'a[href], area[href], button, input, select, textarea, iframe, object, embed, [tabindex], audio[controls], video[controls], summary';
/**
 * Adds every contenteditable element; the filter keeps only editing-host values.
 * Attribute presence keeps jsdom's selector matching as cheap as an exact value.
 */
const CANDIDATE_SELECTOR = `${CONTROL_SELECTOR}, [contenteditable]`;
/** Lowercased contenteditable values that make an element an editing host. */
const EDITABLE_VALUES = ['', 'true', 'plaintext-only'];

/** `NodeFilter.SHOW_ELEMENT`, inlined so collection needs no `NodeFilter` global. */
const SHOW_ELEMENT = 1;

/**
 * Lists candidates in tree order, splicing open shadow roots in at their hosts and
 * skipping host children that no slot renders.
 */
const collectCandidates = (root: Element | ShadowRoot): HTMLElement[] => {
  const walker = root.ownerDocument.createTreeWalker(root, SHOW_ELEMENT);
  let node = walker.nextNode();
  while (node && !('shadowRoot' in node && node.shadowRoot)) node = walker.nextNode();
  if (!node) return [...root.querySelectorAll<HTMLElement>(CANDIDATE_SELECTOR)];
  return [...root.querySelectorAll<HTMLElement>('*')].flatMap((element) =>
    isUnslotted(element, root)
      ? []
      : [
          ...(element.matches(CANDIDATE_SELECTOR) ? [element] : []),
          ...(element.shadowRoot ? collectCandidates(element.shadowRoot) : []),
        ],
  );
};

/** Steps to the parent element, crossing from a shadow root to its host. */
const parentOf = (element: HTMLElement): HTMLElement | null => {
  if (element.parentElement) return element.parentElement;
  const root = element.parentNode;
  return root && 'host' in root && root.host instanceof HTMLElement
    ? root.host
    : null;
};

/**
 * Finds sequential keyboard targets without layout metrics, including in jsdom.
 * @param frame - The library-owned wrapper containing a modal's rendered UI.
 * @param reverse - Whether an unchecked radio group is entered by Shift+Tab.
 * @returns Enabled nonnegative-tabindex controls in browser tab order, including
 * controls inside open shadow roots at their host's position.
 */
export const getTabbableElements = (frame: HTMLElement, reverse = false): HTMLElement[] => {
  const stylesByElement = new Map<HTMLElement, CSSStyleDeclaration>();
  return collectCandidates(frame)
    .filter((element) => {
      if (
        element.tabIndex < 0 ||
        element.matches(':disabled, input[type="hidden"]')
      )
        return false;
      const editable = element.getAttribute('contenteditable');
      if (
        editable !== null &&
        !EDITABLE_VALUES.includes(editable.toLowerCase()) &&
        !element.matches(CONTROL_SELECTOR)
      )
        return false;
      for (
        let current: HTMLElement | null = element;
        current;
        current = parentOf(current)
      ) {
        if (current.hidden || current.hasAttribute('inert')) return false;
        if (
          current !== element &&
          current.matches('details:not([open])') &&
          !current.querySelector(':scope > summary')?.contains(element)
        )
          return false;
        let style = stylesByElement.get(current);
        if (!style) {
          style = current.ownerDocument.defaultView?.getComputedStyle(current);
          if (style) stylesByElement.set(current, style);
        }
        if (
          style?.display === 'none' ||
          (current === element &&
            (style?.visibility === 'hidden' || style?.visibility === 'collapse'))
        )
          return false;
        if (current === frame) break;
      }
      return true;
    })
    .sort((left, right) => {
      const leftRank = left.tabIndex > 0 ? left.tabIndex : Infinity;
      const rightRank = right.tabIndex > 0 ? right.tabIndex : Infinity;
      return leftRank === rightRank ? 0 : leftRank - rightRank;
    })
    .filter((element, _, elements) => {
      if (!(element instanceof HTMLInputElement) || element.type !== 'radio' || !element.name)
        return true;
      const group = elements.filter((candidate): candidate is HTMLInputElement =>
        candidate instanceof HTMLInputElement && candidate.type === 'radio' &&
        candidate.name === element.name && candidate.form === element.form &&
        candidate.getRootNode() === element.getRootNode());
      const target = group.find((radio) => radio.checked) ?? (reverse ? group[group.length - 1] : group[0]);
      return element === target;
    });
};
