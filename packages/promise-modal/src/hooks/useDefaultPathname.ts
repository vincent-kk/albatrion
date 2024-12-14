import { useLayoutEffect, useState } from 'react';

export const usePathname = () => {
  const [pathname, setPathname] = useState(window.location.pathname);

  useLayoutEffect(() => {
    let requestId: number;

    const checkPathname = () => {
      if (requestId) cancelAnimationFrame(requestId);
      if (pathname !== window.location.pathname) {
        setPathname(window.location.pathname);
      } else {
        requestId = requestAnimationFrame(checkPathname);
      }
    };

    requestId = requestAnimationFrame(checkPathname);

    return () => {
      if (requestId) cancelAnimationFrame(requestId);
    };
  }, [pathname]);

  return { pathname };
};
