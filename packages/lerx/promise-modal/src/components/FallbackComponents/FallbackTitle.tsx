import type { PropsWithChildren } from 'react';

export const FallbackTitle = ({ children }: PropsWithChildren) => {
  return <h2 style={{ margin: 'unset' }}>{children}</h2>;
};
