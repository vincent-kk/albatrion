import { useRef } from 'react';

export const useRenderCount = (prefix = '') => {
  const renderCount = useRef(0);
  renderCount.current += 1;
  return <div>{`${prefix} ${renderCount.current}`}</div>;
};
