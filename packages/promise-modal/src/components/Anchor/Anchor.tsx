import { memo, useEffect } from 'react';

import { useTick } from '@lumy-pack/common-react';

import { Presenter } from '@/promise-modal/components/Presenter';
import { useActiveModalCount } from '@/promise-modal/hooks/useActiveModalCount';
import { useModalContext } from '@/promise-modal/providers';
import { useModalDataContext } from '@/promise-modal/providers/ModalDataContext';

import styles from './Anchor.module.css';

export const Anchor = memo(() => {
  const [key, update] = useTick();

  const { modalIds, setUpdater } = useModalDataContext();

  useEffect(() => {
    setUpdater(update);
  }, [setUpdater, update]);

  const { options } = useModalContext();

  const dimmed = useActiveModalCount(key);

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
