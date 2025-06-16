import type { PropsWithChildren } from 'react';

export const FallbackContent = ({ children }: PropsWithChildren) => {
  return <div style={{ margin: 'unset' }}>{children}</div>;
};
