import type { PropsWithChildren } from 'react';

function DefaultTitle({ children }: PropsWithChildren) {
  return <h2>{children}</h2>;
}

export default DefaultTitle;
