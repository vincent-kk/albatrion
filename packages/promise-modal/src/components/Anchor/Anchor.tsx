import {
  type ChangeEvent,
  memo,
  useCallback,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import { useOnMountLayout, useReference } from '@lumy-pack/common-react';

import { ModalManager } from '@/promise-modal/app/ModalManager';
import { Presenter } from '@/promise-modal/components/Presenter';
import { useModalContext } from '@/promise-modal/providers/ModalContextProvider';
import { type ManagedModal, type Modal } from '@/promise-modal/types';

import styles from './Anchor.module.css';

interface AnchorProps {
  pathname: string;
}

export const Anchor = memo(({ pathname }: AnchorProps) => {
  const [modalList, setModalList] = useState<ManagedModal[]>([]);
  const modalListRef = useReference(modalList);

  const { options } = useModalContext();

  const initiator = useRef(pathname);
  const modalId = useRef(0);

  useOnMountLayout(() => {
    setModalList(
      ModalManager.prerender.map((modal) => ({
        ...modal,
        id: ++modalId.current,
        initiator: initiator.current,
        alive: true,
        visible: true,
      })),
    );
    ModalManager.setup((modal: Modal) => {
      setModalList((modals) => [
        ...modals.filter((modal) => modal.alive),
        {
          ...modal,
          id: ++modalId.current,
          initiator: initiator.current,
          alive: true,
          visible: true,
        },
      ]);
    });
    ModalManager.clearPrerender();
  });

  useLayoutEffect(() => {
    setModalList((modals) =>
      modals.map((modal) => {
        if (modal.initiator === pathname)
          return modal.alive ? { ...modal, visible: true } : modal;
        else return { ...modal, visible: false };
      }),
    );
    initiator.current = pathname;
  }, [pathname]);

  const hideModal = useCallback((modalId: ManagedModal['id']) => {
    setModalList((modals) =>
      modals.map((m) => (m.id === modalId ? { ...m, visible: false } : m)),
    );
  }, []);

  const onChange = useCallback(
    (
      modalId: ManagedModal['id'],
      changeEvent: ChangeEvent<{ value?: any }>,
    ) => {
      const modal = modalListRef.current.find((modal) => modal.id === modalId);

      if (!modal) return;

      if (modal.type === 'prompt') {
        setModalList((modals) =>
          modals.map((m) =>
            m.id === modal.id
              ? {
                  ...m,
                  value: changeEvent?.target?.value
                    ? changeEvent.target.value
                    : changeEvent,
                }
              : m,
          ),
        );
      }
    },
    [modalListRef],
  );

  const onConfirm = useCallback(
    (modalId: ManagedModal['id']) => {
      const modal = modalListRef.current.find((modal) => modal.id === modalId);

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
    [hideModal, modalListRef],
  );

  const onClose = useCallback(
    (modalId: ManagedModal['id']) => {
      const modal = modalListRef.current.find((modal) => modal.id === modalId);

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
    [hideModal, modalListRef],
  );

  const onDestroy = useCallback((modalId: ManagedModal['id']) => {
    setModalList((modals) =>
      modals.map((m) => (m.id === modalId ? { ...m, alive: false } : m)),
    );
  }, []);

  const dimmed = useMemo(
    () => modalList.some((modal) => modal.visible),
    [modalList],
  );

  return (
    <div
      className={styles.root}
      style={{
        transitionDuration: options.duration,
        backgroundColor: dimmed ? options.backdrop : 'transparent',
      }}
    >
      {modalList.map((modal) => (
        <Presenter
          key={modal.id}
          {...modal}
          onConfirm={onConfirm}
          onClose={onClose}
          onChange={onChange}
          onDestroy={onDestroy}
        />
      ))}
    </div>
  );
});
