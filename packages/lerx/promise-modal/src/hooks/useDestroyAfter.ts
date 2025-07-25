import { useEffect, useRef } from 'react';

import { convertMsFromDuration } from '@winglet/common-utils/convert';
import { isString } from '@winglet/common-utils/filter';

import type { Duration } from '@aileron/declare';

import type { ModalNode } from '@/promise-modal/core';
import { useModal } from '@/promise-modal/providers';

import { useSubscribeModal } from './useSubscribeModal';

export const useDestroyAfter = (
  modalId: ModalNode['id'],
  duration: Duration | number,
) => {
  const { modal, onDestroy } = useModal(modalId);
  const tick = useSubscribeModal(modal);

  const reference = useRef({
    modal,
    onDestroy,
    milliseconds: isString(duration)
      ? convertMsFromDuration(duration)
      : duration,
  });

  useEffect(() => {
    const { modal, onDestroy, milliseconds } = reference.current;
    if (!modal || modal.visible || !modal.alive) return;
    const timer = setTimeout(() => {
      onDestroy();
    }, milliseconds);
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [tick]);
};
