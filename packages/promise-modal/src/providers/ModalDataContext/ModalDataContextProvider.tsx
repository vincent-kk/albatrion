import {
  type ChangeEvent,
  type PropsWithChildren,
  memo,
  useCallback,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';

import { useOnMountLayout, useReference } from '@lumy-pack/common-react';

import { ModalManager } from '@/promise-modal/app/ModalManager';
import type { ManagedModal, Modal } from '@/promise-modal/types';

import { ModalDataContext } from './ModalDataContext';

interface ModalDataContextProviderProps {
  pathname: string;
}

export const ModalDataContextProvider = memo(
  ({
    pathname,
    children,
  }: PropsWithChildren<ModalDataContextProviderProps>) => {
    const modalDictionary = useRef<Map<ManagedModal['id'], ManagedModal>>(
      new Map(),
    );
    const [modalIds, setModalIds] = useState<ManagedModal['id'][]>([]);
    const modalIdsRef = useReference(modalIds);

    const initiator = useRef(pathname);
    const modalIdSequence = useRef(0);

    // const [tick, update] = useTick();

    useOnMountLayout(() => {
      for (const data of ModalManager.prerender) {
        const modal = {
          ...data,
          id: ++modalIdSequence.current,
          initiator: initiator.current,
          alive: true,
          visible: true,
        };
        modalDictionary.current.set(modal.id, modal);
        setModalIds((ids) => [...ids, modal.id]);
      }

      ModalManager.setup((data: Modal) => {
        const modal = {
          ...data,
          id: ++modalIdSequence.current,
          initiator: initiator.current,
          alive: true,
          visible: true,
        };
        modalDictionary.current.set(modal.id, modal);
        setModalIds((ids) => {
          const aliveIds = ids.filter((id) => {
            const destroyed = !modalDictionary.current.get(id)?.alive;
            if (destroyed) modalDictionary.current.delete(id);
            return !destroyed;
          });
          return [...aliveIds, modal.id];
        });
      });
      ModalManager.clearPrerender();
    });

    useLayoutEffect(() => {
      for (const id of modalIdsRef.current) {
        const modal = modalDictionary.current.get(id);
        if (!modal?.alive) continue;
        if (modal.initiator === pathname) modal.visible = true;
        else modal.visible = false;
        modalDictionary.current.set(id, modal);
      }
      initiator.current = pathname;
    }, [modalIdsRef, pathname]);

    const getModalData = useCallback((modalId: ManagedModal['id']) => {
      return modalDictionary.current.get(modalId);
    }, []);

    const hideModal = useCallback((modalId: ManagedModal['id']) => {
      const modal = modalDictionary.current.get(modalId);
      if (!modal) return;
      modal.visible = false;
      modalDictionary.current.set(modalId, modal);
    }, []);

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

    const onDestroy = useCallback((modalId: ManagedModal['id']) => {
      const modal = modalDictionary.current.get(modalId);
      if (!modal) return;
      modal.alive = false;
      modalDictionary.current.set(modalId, modal);
    }, []);

    const getModalHandlers = useCallback(
      (modalId: ManagedModal['id']) => {
        return {
          getModalData: () => getModalData(modalId),
          onChange: (changeEvent: ChangeEvent<{ value?: any }>) =>
            onChange(modalId, changeEvent),
          onConfirm: () => onConfirm(modalId),
          onClose: () => onClose(modalId),
          onDestroy: () => onDestroy(modalId),
        };
      },
      [getModalData, onChange, onConfirm, onClose, onDestroy],
    );

    return (
      <ModalDataContext.Provider
        value={{
          modalIds,
          getModalData,
          hideModal,
          onChange,
          onConfirm,
          onClose,
          onDestroy,
          getModalHandlers,
        }}
      >
        {children}
      </ModalDataContext.Provider>
    );
  },
);
