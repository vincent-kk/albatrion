import { useEffect, useState } from 'react';

/**
 * 현재 웹 브라우저 창의 크기를 반환합니다.
 * 사용자가 브라우저 창의 크기를 조정할 때마다 자동으로 업데이트됩니다.
 * @returns {크기 객체} - width와 height 속성을 포함하는 객체
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
