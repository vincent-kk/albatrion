import { type HTMLAttributes, memo } from 'react';

import { usePortalAnchorRef } from './PortalContext';

export const Anchor = memo(
  (props: Omit<HTMLAttributes<HTMLDivElement>, 'children'>) => {
    const ref = usePortalAnchorRef();
    return <div {...props} ref={ref} />;
  },
);
