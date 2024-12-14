import type { PropsWithChildren } from 'react';

function DefaultContent({ children }: PropsWithChildren) {
  return <div>{children}</div>;
}

export default DefaultContent;
