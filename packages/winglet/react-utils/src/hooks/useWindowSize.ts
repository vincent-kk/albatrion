import { useEffect, useState } from 'react';

/**
 * Returns the current browser window size and automatically updates when the user resizes the window.
 * Useful for responsive components that need to adapt to window size changes.
 * @returns An object containing width and height properties of the current window
 * @example
 * const { width, height } = useWindowSize();
 * return <div>Width: {width}, Height: {height}</div>;
 */
export const useWindowSize = () => {
  const [windowSize, setWindowSize] = useState({ width: 0, height: 0 });
  useEffect(() => {
    const handleResize = () => {
      setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    };
    window.addEventListener('resize', handleResize);
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  return windowSize;
};
