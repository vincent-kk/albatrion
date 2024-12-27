import type { PropsWithChildren } from 'react';

import { fallback } from './classNames.emotion';

export const FallbackContent = ({ children }: PropsWithChildren) => {
  return <div className={fallback}>{children}</div>;
};
