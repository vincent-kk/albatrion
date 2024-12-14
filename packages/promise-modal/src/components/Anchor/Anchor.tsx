import {
  type ChangeEvent,
  memo,
  useCallback,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import {
  useOnMountLayout,
  useReference,
  useTick,
} from '@lumy-pack/common-react';

import { ModalManager } from '@/promise-modal/app/ModalManager';
import { Presenter } from '@/promise-modal/components/Presenter';
import { useModalContext } from '@/promise-modal/providers/ModalContextProvider';
import { type ManagedModal, type Modal } from '@/promise-modal/types';

import styles from './Anchor.module.css';

interface AnchorProps {
  pathname: string;
}

export const Anchor = memo(({ pathname }: AnchorProps) => {
  const [modalIds, setModalIds] = useState<ManagedModal['id'][]>([]);
  const modalDictionary = useRef<Map<ManagedModal['id'], ManagedModal>>(
    new Map(),
  );
  const modalIdsRef = useReference(modalIds);

  const [tick, update] = useTick();

  const { options } = useModalContext();
  const initiator = useRef(pathname);
  const modalId = useRef(0);

  useOnMountLayout(() => {
    ModalManager.prerender.forEach((data) => {
      const modal = {
        ...data,
        id: ++modalId.current,
        initiator: initiator.current,
        alive: true,
        visible: true,
      };
      modalDictionary.current.set(modal.id, modal);
      setModalIds((ids) => [...ids, modal.id]);
    });
    ModalManager.setup((data: Modal) => {
      const modal = {
        ...data,
        id: ++modalId.current,
        initiator: initiator.current,
        alive: true,
        visible: true,
      };
      modalDictionary.current.set(modal.id, modal);
      setModalIds((ids) => [...ids, modal.id]);
    });
    ModalManager.clearPrerender();
  });

  useLayoutEffect(() => {
    const cleanupTargets: Set<ManagedModal['id']> = new Set();
    for (const id of modalIdsRef.current) {
      const modal = modalDictionary.current.get(id);
      if (!modal) continue;
      if (!modal.alive) cleanupTargets.add(id);
      else {
        if (modal.initiator === pathname) modal.visible = true;
        else modal.visible = false;
        modalDictionary.current.set(id, modal);
      }
    }
    for (const id of cleanupTargets) modalDictionary.current.delete(id);
    setModalIds((ids) => ids.filter((id) => !cleanupTargets.has(id)));
    initiator.current = pathname;
  }, [modalIdsRef, pathname]);

  const hideModal = useCallback(
    (modalId: ManagedModal['id']) => {
      const modal = modalDictionary.current.get(modalId);
      if (!modal) return;
      modal.visible = false;
      modalDictionary.current.set(modalId, modal);
      update();
    },
    [update],
  );

  const onChange = useCallback(
    (
      modalId: ManagedModal['id'],
      changeEvent: ChangeEvent<{ value?: any }>,
    ) => {
      const modal = modalDictionary.current.get(modalId);
      if (!modal) return;
      if (modal.type === 'prompt') {
        modal.value = changeEvent?.target?.value
          ? changeEvent.target.value
          : changeEvent;
        modalDictionary.current.set(modalId, modal);
      }
    },
    [],
  );

  const onConfirm = useCallback(
    (modalId: ManagedModal['id']) => {
      const modal = modalDictionary.current.get(modalId);
      if (!modal) return;
      if (modal.type === 'alert') {
        modal.resolve(null);
      } else if (modal.type === 'confirm') {
        modal.resolve(true);
      } else if (modal.type === 'prompt') {
        modal.resolve(modal.value);
      }
      hideModal(modalId);
    },
    [hideModal],
  );

  const onClose = useCallback(
    (modalId: ManagedModal['id']) => {
      const modal = modalDictionary.current.get(modalId);
      if (!modal) return;
      if (modal.type === 'alert') {
        modal.resolve(null);
      } else if (modal.type === 'confirm') {
        modal.resolve(false);
      } else if (modal.type === 'prompt') {
        if (modal.returnOnCancel) {
          modal.resolve(modal.value);
        } else {
          modal.resolve(null);
        }
      }
      hideModal(modalId);
    },
    [hideModal],
  );

  const onDestroy = useCallback(
    (modalId: ManagedModal['id']) => {
      const modal = modalDictionary.current.get(modalId);
      if (!modal) return;
      modal.alive = false;
      modalDictionary.current.set(modalId, modal);
      update();
    },
    [update],
  );

  const dimmed = useMemo(
    () => modalIds.some((id) => modalDictionary.current.get(id)?.visible),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [modalIds, tick],
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
        const modal = modalDictionary.current.get(id);
        if (!modal) return null;
        return (
          <Presenter
            key={id}
            {...modal}
            onConfirm={onConfirm}
            onClose={onClose}
            onChange={onChange}
            onDestroy={onDestroy}
          />
        );
      })}
    </div>
  );
});
