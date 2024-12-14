import type { PropsWithChildren } from 'react';

function DefaultSubtitle({ children }: PropsWithChildren) {
  return <h3>{children}</h3>;
}

export default DefaultSubtitle;
