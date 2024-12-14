import {
  type ChangeEvent,
  memo,
  useCallback,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import { useHandle } from '@lumy-pack/common-react';

import Presenter from '@/promise-modal/components/Presenter';
import { useModalContext } from '@/promise-modal/providers/ModalContextProvider';
import { type ManagedModal, type Modal } from '@/promise-modal/types';

import styles from './Anchor.module.css';

let __modalList__: Modal[] = [];

// eslint-disable-next-line react-refresh/only-export-components
export let openModal = (modal: Modal) => {
  __modalList__.push(modal);
};

interface AnchorProps {
  pathname: string;
}

export const Anchor = memo(({ pathname }: AnchorProps) => {
  const [modalList, setModalList] = useState<ManagedModal[]>([]);
  const initiator = useRef(pathname);
  const { options } = useModalContext();
  const modalId = useRef(0);

  useLayoutEffect(() => {
    setModalList(
      __modalList__.map((modal) => ({
        ...modal,
        id: ++modalId.current,
        initiator: initiator.current,
        isValid: true,
        isVisible: true,
      })),
    );
    __modalList__ = [];

    openModal = (modal: Modal) => {
      setModalList((modals) => [
        ...modals.filter((modal) => modal.isValid),
        {
          ...modal,
          id: ++modalId.current,
          initiator: initiator.current,
          isValid: true,
          isVisible: true,
        },
      ]);
    };
    return () => {
      __modalList__ = [];
    };
  }, []);

  useLayoutEffect(() => {
    setModalList((modals) =>
      modals.map((modal) => {
        if (modal.initiator === pathname)
          return modal.isValid ? { ...modal, isVisible: true } : modal;
        else return { ...modal, isVisible: false };
      }),
    );
    initiator.current = pathname;
  }, [pathname]);

  const hideModal = useCallback((modalId: ManagedModal['id']) => {
    setModalList((modals) =>
      modals.map((m) => (m.id === modalId ? { ...m, isVisible: false } : m)),
    );
  }, []);

  const onChange = useCallback(
    (
      modalId: ManagedModal['id'],
      changeEvent: ChangeEvent<{ value?: any }>,
    ) => {
      const modal = modalList.find((modal) => modal.id === modalId);

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
    [modalList],
  );

  const onConfirm = useCallback(
    (modalId: ManagedModal['id']) => {
      const modal = modalList.find((modal) => modal.id === modalId);

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
    [hideModal, modalList],
  );

  const onClose = useCallback(
    (modalId: ManagedModal['id']) => {
      const modal = modalList.find((modal) => modal.id === modalId);

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
    [hideModal, modalList],
  );

  const onCleanup = useCallback((modalId: ManagedModal['id']) => {
    setModalList((modals) =>
      modals.map((m) => (m.id === modalId ? { ...m, isValid: false } : m)),
    );
  }, []);

  const handleChange = useHandle(onChange);
  const handleConfirm = useHandle(onConfirm);
  const handleClose = useHandle(onClose);
  const handleCleanup = useHandle(onCleanup);

  const dimmed = useMemo(
    () => modalList.some((modal) => modal.isVisible),
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
          onConfirm={handleConfirm}
          onClose={handleClose}
          onChange={handleChange}
          onCleanup={handleCleanup}
        />
      ))}
    </div>
  );
});
