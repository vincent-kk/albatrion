import { Portal as BasePortal } from './Portal';
import { usePortalAnchorRef } from './PortalContext';
import { withPortal } from './withPortal';

export const Portal = Object.assign(BasePortal, {
  useAnchorRef: usePortalAnchorRef,
  with: withPortal,
});
