import {
  type PropsWithChildren,
  memo,
  useCallback,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import { useOnMountLayout, useReference } from '@lumy-pack/common-react';

import { ModalManager } from '@/promise-modal/app/ModalManager';
import { emitEvent } from '@/promise-modal/helpers/emitEvent';
import { getMillisecondsFromDuration } from '@/promise-modal/helpers/getMillisecondsFromDuration';
import { subscribeFactory } from '@/promise-modal/helpers/subscribeFactory';
import { useModalOptions } from '@/promise-modal/providers';
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
    const modalEventListeners = useRef<Map<ManagedModal['id'], Fn[]>>(
      new Map(),
    );
    const [modalIds, setModalIds] = useState<ManagedModal['id'][]>([]);
    const modalIdsRef = useReference(modalIds);

    const initiator = useRef(pathname);
    const modalIdSequence = useRef(0);

    const options = useModalOptions();

    const { manualDestroy, duration } = useMemo(
      () => ({
        manualDestroy: options.manualDestroy,
        duration: getMillisecondsFromDuration(options.duration),
      }),
      [options],
    );

    useOnMountLayout(() => {
      for (const data of ModalManager.prerender) {
        const modalId = modalIdSequence.current++;
        const modal = {
          ...data,
          id: modalId,
          initiator: initiator.current,
          alive: true,
          visible: true,
          subscribe: subscribeFactory(modalId, modalEventListeners.current),
        };
        modalDictionary.current.set(modal.id, modal);
        setModalIds((ids) => [...ids, modal.id]);
      }

      ModalManager.setup((data: Modal) => {
        const modalId = modalIdSequence.current++;
        const modal = {
          ...data,
          id: modalId,
          initiator: initiator.current,
          alive: true,
          visible: true,
          subscribe: subscribeFactory(modalId, modalEventListeners.current),
        };
        modalDictionary.current.set(modal.id, modal);
        setModalIds((ids) => {
          const aliveIds = ids.filter((id) => {
            const destroyed = !modalDictionary.current.get(id)?.alive;
            if (destroyed) {
              modalDictionary.current.delete(id);
              modalEventListeners.current.delete(id);
            }
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

    const onDestroy = useCallback((modalId: ManagedModal['id']) => {
      const modal = modalDictionary.current.get(modalId);
      if (!modal) return;
      modal.alive = false;
      modalDictionary.current.set(modalId, modal);
      updaterRef.current?.();
    }, []);

    const updaterRef = useRef<Fn>();
    const hideModal = useCallback(
      (modalId: ManagedModal['id']) => {
        const modal = modalDictionary.current.get(modalId);
        if (!modal) return;
        modal.visible = false;
        modalDictionary.current.set(modalId, modal);
        updaterRef.current?.();
        emitEvent(modalId, modalEventListeners.current);
        if (!manualDestroy || !modal.manualDestroy)
          setTimeout(() => {
            onDestroy(modalId);
          }, duration);
      },
      [manualDestroy, duration, onDestroy],
    );

    const onChange = useCallback((modalId: ManagedModal['id'], value: any) => {
      const modal = modalDictionary.current.get(modalId);
      if (!modal) return;
      if (modal.type === 'prompt') {
        modal.value = value;
        modalDictionary.current.set(modalId, modal);
      }
    }, []);

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
          if (modal.returnOnCancel) modal.resolve(modal.value);
          else modal.resolve(null);
        }
        hideModal(modalId);
      },
      [hideModal],
    );

    const getModalHandlers = useCallback(
      (modalId: ManagedModal['id']) => {
        return {
          getModalData: () => getModalData(modalId),
          onConfirm: () => onConfirm(modalId),
          onClose: () => onClose(modalId),
          onChange: (value: any) => onChange(modalId, value),
          onDestroy: () => onDestroy(modalId),
        };
      },
      [getModalData, onConfirm, onClose, onChange, onDestroy],
    );

    const value = useMemo(() => {
      return {
        modalIds,
        getModalData,
        onChange,
        onConfirm,
        onClose,
        onDestroy,
        getModalHandlers,
        setUpdater: (updater: Fn) => {
          updaterRef.current = updater;
        },
      };
    }, [
      modalIds,
      getModalData,
      getModalHandlers,
      onChange,
      onConfirm,
      onClose,
      onDestroy,
    ]);

    return (
      <ModalDataContext.Provider value={value}>
        {children}
      </ModalDataContext.Provider>
    );
  },
);
