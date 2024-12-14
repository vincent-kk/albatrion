import { useLayoutEffect, useState } from 'react';

export const usePathname = () => {
  const [pathname, setPathname] = useState(window.location.pathname);

  useLayoutEffect(() => {
    let requestId: number;

    const checkPathname = () => {
      cancelAnimationFrame(requestId);
      if (pathname !== window.location.pathname) {
        setPathname(window.location.pathname);
      } else {
        requestAnimationFrame(checkPathname);
      }
    };
    checkPathname();
    return () => {
      cancelAnimationFrame(requestId);
    };
  }, [pathname]);

  return { pathname };
};
