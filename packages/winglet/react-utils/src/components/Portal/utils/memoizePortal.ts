import {
  type MemoExoticComponent,
  type PropsWithChildren,
  type ReactPortal,
  memo,
} from 'react';

/** Renderer whose result is preserved by the memo component. */
type PortalRenderer = (props: PropsWithChildren) => ReactPortal | null;

/** Memo properties with the renderer's precise result in its call signature. */
export interface PortalComponent
  extends Omit<MemoExoticComponent<PortalRenderer>, never> {
  (props: PropsWithChildren): ReactPortal | null;
}

/**
 * Memoizes a portal renderer without widening its render result to ReactNode.
 * @param render - A renderer that returns a portal or null for an unattached anchor
 * @returns The memo component, retaining its metadata and exact render result
 */
export function memoizePortal(render: PortalRenderer): PortalComponent;
export function memoizePortal(
  render: PortalRenderer,
): MemoExoticComponent<PortalRenderer> {
  return memo<PortalRenderer>(render);
}
