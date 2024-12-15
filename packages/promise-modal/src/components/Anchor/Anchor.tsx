import { memo, useEffect, useMemo } from 'react';

import { useTick } from '@lumy-pack/common-react';

import { Presenter } from '@/promise-modal/components/Presenter';
import { useModalContext } from '@/promise-modal/providers';
import { useModalDataContext } from '@/promise-modal/providers/ModalDataContext';

import styles from './Anchor.module.css';

export const Anchor = memo(() => {
  const [key, update] = useTick();

  const { modalIds, getModalData, setUpdater } = useModalDataContext();

  useEffect(() => {
    setUpdater(update);
  }, [setUpdater, update]);

  const { options } = useModalContext();

  const dimmed = useMemo(
    () => modalIds.some((id) => getModalData(id)?.visible),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [modalIds, key],
  );

  return (
    <div
      className={styles.root}
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
});
