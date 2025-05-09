import { type EffectCallback, useEffect, useLayoutEffect } from 'react';

/**
 * 컴포넌트가 마운트될 때 한 번만 실행되는 후크입니다.
 * @param handler - 마운트 시 실행될 함수
 */
export const useOnMount = (handler: EffectCallback) => {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(handler, []);
};

/**
 * 컴포넌트가 마운트될 때 한 번만 실행되는 레이아웃 후크입니다.
 * useOnMount와 비슷하지만 DOM 업데이트 전에 실행됩니다.
 * @param handler - 마운트 시 실행될 함수
 */
export const useOnMountLayout = (handler: EffectCallback) => {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useLayoutEffect(handler, []);
};
