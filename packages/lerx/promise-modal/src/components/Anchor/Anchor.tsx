import { memo, useEffect } from 'react';

import { useTick, withErrorBoundary } from '@winglet/react-utils';

import { Presenter } from '@/promise-modal/components/Presenter';
import type { ModalNode } from '@/promise-modal/core';
import { useActiveModalCount } from '@/promise-modal/hooks/useActiveModalCount';
import { useModalContext } from '@/promise-modal/providers';
import { useModalDataContext } from '@/promise-modal/providers/ModalDataContext';

import { anchor } from './classNames.emotion';

const AnchorInner = () => {
  const [refreshKey, update] = useTick();

  const { modalIds, setUpdater } = useModalDataContext();

  useEffect(() => {
    setUpdater(update);
  }, [setUpdater, update]);

  const { options } = useModalContext();

  const dimmed = useActiveModalCount(validateDimmable, refreshKey);

  return (
    <div
      className={anchor}
      style={{
        transitionDuration: options.duration,
        backgroundColor: dimmed ? options.backdrop : 'transparent',
      }}
    >
      {modalIds.map((id) => {
        return <Presenter key={id} modalId={id} />;
      })}
    </div>
  );
};

const validateDimmable = (modal?: ModalNode) => modal?.visible && modal.dimmed;

export const Anchor = memo(withErrorBoundary(AnchorInner));
