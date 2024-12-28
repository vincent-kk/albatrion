import { memo, useEffect } from 'react';

import { useTick, withErrorBoundary } from '@winglet/react-utils';

import { Presenter } from '@/promise-modal/components/Presenter';
import { useActiveModalCount } from '@/promise-modal/hooks/useActiveModalCount';
import { useModalContext } from '@/promise-modal/providers';
import { useModalDataContext } from '@/promise-modal/providers/ModalDataContext';

import { root } from './classNames.emotion';

const AnchorInner = () => {
  const [key, update] = useTick();

  const { modalIds, setUpdater } = useModalDataContext();

  useEffect(() => {
    setUpdater(update);
  }, [setUpdater, update]);

  const { options } = useModalContext();

  const dimmed = useActiveModalCount(key);

  return (
    <div
      className={root}
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

export const Anchor = memo(withErrorBoundary(AnchorInner));
