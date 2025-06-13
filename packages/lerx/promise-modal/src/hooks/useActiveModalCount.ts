import { useMemo } from 'react';

import type { Fn } from '@aileron/declare';

import type { ModalNode } from '@/promise-modal/core';
import { useModalManagerContext } from '@/promise-modal/providers/ModalManagerContext/useModalManagerContext';

const defaultValidate = (modal?: ModalNode) => modal?.visible;

export const useActiveModalCount = (
  validate: Fn<[ModalNode?], boolean | undefined> = defaultValidate,
  refreshKey: string | number = 0,
) => {
  const { modalIds, getModalNode } = useModalManagerContext();
  return useMemo(() => {
    let count = 0;
    for (const id of modalIds) {
      if (validate(getModalNode(id))) count++;
    }
    return count;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [getModalNode, modalIds, refreshKey]);
};
