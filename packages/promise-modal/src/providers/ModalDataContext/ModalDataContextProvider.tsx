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
import { type ModalNode, nodeFactory } from '@/promise-modal/core';
import { getMillisecondsFromDuration } from '@/promise-modal/helpers/getMillisecondsFromDuration';
import { useModalOptions } from '@/promise-modal/providers';
import type { Modal } from '@/promise-modal/types';

import { ModalDataContext } from './ModalDataContext';

interface ModalDataContextProviderProps {
  pathname: string;
}

export const ModalDataContextProvider = memo(
  ({
    pathname,
    children,
  }: PropsWithChildren<ModalDataContextProviderProps>) => {
    const modalDictionary = useRef<Map<ModalNode['id'], ModalNode>>(new Map());

    const [modalIds, setModalIds] = useState<ModalNode['id'][]>([]);
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
        const modal = nodeFactory({
          id: modalIdSequence.current++,
          initiator: initiator.current,
          ...data,
        });
        modalDictionary.current.set(modal.id, modal);
        setModalIds((ids) => [...ids, modal.id]);
      }

      ModalManager.setup((data: Modal) => {
        const modal = nodeFactory({
          id: modalIdSequence.current++,
          initiator: initiator.current,
          ...data,
        });
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
        if (modal.initiator === pathname) modal.onShow();
        else modal.onHide();
      }
      initiator.current = pathname;
    }, [modalIdsRef, pathname]);

    const getModalData = useCallback((modalId: ModalNode['id']) => {
      return modalDictionary.current.get(modalId);
    }, []);

    const onDestroy = useCallback((modalId: ModalNode['id']) => {
      const modal = modalDictionary.current.get(modalId);
      if (!modal) return;
      modal.onDestroy();
      updaterRef.current?.();
    }, []);

    const updaterRef = useRef<Fn>();
    const hideModal = useCallback(
      (modalId: ModalNode['id']) => {
        const modal = modalDictionary.current.get(modalId);
        if (!modal) return;
        modal.onHide();
        modal.publish();
        updaterRef.current?.();
        if (!manualDestroy || !modal.manualDestroy)
          setTimeout(() => {
            modal.onDestroy();
          }, duration);
      },
      [manualDestroy, duration],
    );

    const onChange = useCallback((modalId: ModalNode['id'], value: any) => {
      const modal = modalDictionary.current.get(modalId);
      if (!modal) return;
      if (modal.type === 'prompt') modal.onChange(value);
    }, []);

    const onConfirm = useCallback(
      (modalId: ModalNode['id']) => {
        const modal = modalDictionary.current.get(modalId);
        if (!modal) return;
        modal.onConfirm();
        hideModal(modalId);
      },
      [hideModal],
    );

    const onClose = useCallback(
      (modalId: ModalNode['id']) => {
        const modal = modalDictionary.current.get(modalId);
        if (!modal) return;
        modal.onClose();
        hideModal(modalId);
      },
      [hideModal],
    );

    const getModalHandlers = useCallback(
      (modalId: ModalNode['id']) => {
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
