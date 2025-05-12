import { Anchor } from './Anchor';
import { Portal as BasePortal } from './Portal';
import { withPortal } from './withPortal';

export const Portal = Object.assign(BasePortal, {
  with: withPortal,
  Anchor,
});
