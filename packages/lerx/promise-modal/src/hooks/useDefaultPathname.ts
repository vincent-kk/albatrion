import { useLayoutEffect, useState } from 'react';

export const usePathname = () => {
  const [pathname, setPathname] = useState(window.location.pathname);
  useLayoutEffect(() => {
    const handleChange = () => setPathname(window.location.pathname);
    // Navigation API observes SPA pushState/replaceState without polling;
    // requestAnimationFrame polling remains as the fallback for browsers
    // (and test environments) without it.
    const navigation = (window as { navigation?: EventTarget }).navigation;
    if (navigation) {
      navigation.addEventListener('currententrychange', handleChange);
      window.addEventListener('popstate', handleChange);
      return () => {
        navigation.removeEventListener('currententrychange', handleChange);
        window.removeEventListener('popstate', handleChange);
      };
    }
    let requestId: number;
    const checkPathname = () => {
      if (pathname !== window.location.pathname)
        setPathname(window.location.pathname);
      else requestId = requestAnimationFrame(checkPathname);
    };
    requestId = requestAnimationFrame(checkPathname);
    return () => {
      cancelAnimationFrame(requestId);
    };
  }, [pathname]);
  return { pathname };
};
