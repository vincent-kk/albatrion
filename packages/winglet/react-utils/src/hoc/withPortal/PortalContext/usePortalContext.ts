import { useContext } from 'react';

import { PortalContext } from './PortalContext';

/**
 * PortalContext를 반환합니다.
 * @returns The portal context
 */
export const usePortalContext = () => {
  const context = useContext(PortalContext);
  if (!context) {
    throw new Error('PortalContext must be used within a PortalProvider');
  }
  return context;
};

/**
 * `Portal` 컴포넌트로 연결할 DOM에 반환되는 ref를 연결합니다.
 * @returns The portal anchor ref
 */
export const usePortalAnchorRef = () => {
  const { portalAnchorRef } = usePortalContext();
  return portalAnchorRef;
};
