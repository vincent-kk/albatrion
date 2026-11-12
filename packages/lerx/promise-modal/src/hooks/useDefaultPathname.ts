import { useLayoutEffect, useState, useSyncExternalStore } from 'react';

import { ModalManager } from '@/promise-modal/app';

/** The store removes dead nodes, including manually destroyed exit frames. */
const getHasAliveNodes = () => ModalManager.ids.length > 0;
/** Server rendering has no browser polling work. */
const getServerSnapshot = () => false;

/**
 * Observes the browser pathname for the default router integration.
 * Navigation API events are preferred; fallback polling runs only with alive nodes.
 * @returns The latest observed pathname; callers stamp new requests at opening time.
 */
export const usePathname = () => {
  const [pathname, setPathname] = useState(window.location.pathname);
  const hasAliveNodes = useSyncExternalStore(
    ModalManager.subscribe,
    getHasAliveNodes,
    getServerSnapshot,
  );
  useLayoutEffect(() => {
    const handleChange = () => setPathname(window.location.pathname);
    const navigation = (window as { navigation?: EventTarget }).navigation;
    if (navigation) {
      navigation.addEventListener('currententrychange', handleChange);
      window.addEventListener('popstate', handleChange);
      return () => {
        navigation.removeEventListener('currententrychange', handleChange);
        window.removeEventListener('popstate', handleChange);
      };
    }
    if (!hasAliveNodes) return;
    handleChange();
    let requestId: number;
    const checkPathname = () => {
      handleChange();
      requestId = requestAnimationFrame(checkPathname);
    };
    requestId = requestAnimationFrame(checkPathname);
    return () => {
      cancelAnimationFrame(requestId);
    };
  }, [hasAliveNodes]);
  return { pathname };
};
