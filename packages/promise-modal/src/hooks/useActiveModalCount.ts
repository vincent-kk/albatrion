import { useMemo } from 'react';

import { useModalDataContext } from '../providers';

export const useActiveModalCount = (tick: string | number = 0) => {
  const { modalIds, getModalData } = useModalDataContext();
  return useMemo(() => {
    let count = 0;
    for (const id of modalIds) {
      if (getModalData(id)?.visible) count++;
    }
    return count;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [getModalData, modalIds, tick]);
};
