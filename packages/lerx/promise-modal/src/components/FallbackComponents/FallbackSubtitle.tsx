import type { PropsWithChildren } from 'react';

export const FallbackSubtitle = ({ children }: PropsWithChildren) => {
  return <h3 style={{ margin: 'unset' }}>{children}</h3>;
};
