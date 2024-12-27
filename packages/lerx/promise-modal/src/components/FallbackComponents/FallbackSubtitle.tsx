import type { PropsWithChildren } from 'react';

import { fallback } from './classNames';

export const FallbackSubtitle = ({ children }: PropsWithChildren) => {
  return <h3 className={fallback}>{children}</h3>;
};
