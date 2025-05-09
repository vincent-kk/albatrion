import { type HTMLAttributes, memo } from 'react';

import { usePortalAnchorRef } from './PortalContext';

/**
 * Portal의 콘텐츠가 렌더될 위치를 지정하는 앵커 컴포넌트입니다.
 * @param props - div 요소에 전달될 프로퍼티를 설정합니다 (children 제외).
 * @returns Portal이 렌더될 위치를 지정하는 div 요소
 * @example
 * <Portal.Anchor className="portal-container" />
 */
export const Anchor = memo(
  (props: Omit<HTMLAttributes<HTMLDivElement>, 'children'>) => {
    const ref = usePortalAnchorRef();
    return <div {...props} ref={ref} />;
  },
);
