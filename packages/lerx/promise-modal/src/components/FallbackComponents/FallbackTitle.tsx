import type { PropsWithChildren } from 'react';

import { fallback } from './classNames';

export const FallbackTitle = ({ children }: PropsWithChildren) => {
  return <h2 className={fallback}>{children}</h2>;
};
