import {
  type PropsWithChildren,
  memo,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import { convertMsFromDuration } from '@winglet/common-utils/convert';
import { useOnMountLayout, useReference } from '@winglet/react-utils/hook';

import type { Fn } from '@aileron/declare';

import { ModalManager } from '@/promise-modal/app/ModalManager';
import { type ModalNode, nodeFactory } from '@/promise-modal/core';
import { useConfigurationOptions } from '@/promise-modal/providers/ConfigurationContext';
import type { Modal } from '@/promise-modal/types';

import { ModalManagerContext } from './ModalManagerContext';

interface ModalManagerContextProviderProps {
  usePathname: Fn<[], { pathname: string }>;
}

export const ModalManagerContextProvider = memo(
  ({
    usePathname,
    children,
  }: PropsWithChildren<ModalManagerContextProviderProps>) => {
    const modalDictionary = useRef<Map<ModalNode['id'], ModalNode>>(new Map());

    const [modalIds, setModalIds] = useState<ModalNode['id'][]>([]);
    const modalIdsRef = useReference(modalIds);
    const { pathname } = usePathname();

    const initiator = useRef(pathname);
    const modalIdSequence = useRef(0);

    const options = useConfigurationOptions();

    const duration = useMemo(
      () => convertMsFromDuration(options.duration),
      [options],
    );

    useOnMountLayout(() => {
      const { manualDestroy, closeOnBackdropClick } = options;

      for (const data of ModalManager.prerender) {
        const modal = nodeFactory({
          duration,
          manualDestroy,
          closeOnBackdropClick,
          ...data,
          id: modalIdSequence.current++,
          initiator: initiator.current,
        });
        modalDictionary.current.set(modal.id, modal);
        setModalIds((ids) => [...ids, modal.id]);
      }

      ModalManager.openHandler = (data: Modal) => {
        const modalNode = nodeFactory({
          duration,
          manualDestroy,
          closeOnBackdropClick,
          ...data,
          id: modalIdSequence.current++,
          initiator: initiator.current,
        });
        modalDictionary.current.set(modalNode.id, modalNode);
        setModalIds((ids) => {
          const aliveIds: number[] = [];
          for (let i = 0, l = ids.length; i < l; i++) {
            const id = ids[i];
            const destroyed = !modalDictionary.current.get(id)?.alive;
            if (destroyed) modalDictionary.current.delete(id);
            else aliveIds.push(id);
          }
          return [...aliveIds, modalNode.id];
        });
        return modalNode;
      };
    });

    useLayoutEffect(() => {
      for (const id of modalIdsRef.current) {
        const modal = modalDictionary.current.get(id);
        if (!modal?.alive) continue;
        if (modal.initiator === pathname) modal.onShow();
        else modal.onHide();
      }
      initiator.current = pathname;
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [pathname]);

    const getModalNodeRef = useRef((modalId: ModalNode['id']) =>
      modalDictionary.current.get(modalId),
    );

    const onDestroyRef = useRef((modalId: ModalNode['id']) => {
      const modal = modalDictionary.current.get(modalId);
      if (!modal) return;
      modal.onDestroy();
      ModalManager.refresh();
    });

    const hideModalRef = useRef((modalId: ModalNode['id']) => {
      const modal = modalDictionary.current.get(modalId);
      if (!modal) return;
      modal.onHide();
      ModalManager.refresh();
      if (modal.manualDestroy === false)
        setTimeout(() => modal.onDestroy(), modal.duration);
    });

    const onChangeRef = useRef((modalId: ModalNode['id'], value: any) => {
      const modal = modalDictionary.current.get(modalId);
      if (!modal) return;
      if (modal.type === 'prompt') modal.onChange(value);
    });

    const onConfirmRef = useRef((modalId: ModalNode['id']) => {
      const modal = modalDictionary.current.get(modalId);
      if (!modal) return;
      modal.onConfirm();
      hideModalRef.current(modalId);
    });

    const onCloseRef = useRef((modalId: ModalNode['id']) => {
      const modal = modalDictionary.current.get(modalId);
      if (!modal) return;
      modal.onClose();
      hideModalRef.current(modalId);
    });

    const getModalRef = useRef((modalId: ModalNode['id']) => ({
      modal: getModalNodeRef.current(modalId),
      onConfirm: () => onConfirmRef.current(modalId),
      onClose: () => onCloseRef.current(modalId),
      onChange: (value: any) => onChangeRef.current(modalId, value),
      onDestroy: () => onDestroyRef.current(modalId),
    }));

    const value = useMemo(() => {
      return {
        modalIds,
        getModalNode: getModalNodeRef.current,
        onChange: onChangeRef.current,
        onConfirm: onConfirmRef.current,
        onClose: onCloseRef.current,
        onDestroy: onDestroyRef.current,
        getModal: getModalRef.current,
      };
    }, [modalIds]);

    return (
      <ModalManagerContext.Provider value={value}>
        {children}
      </ModalManagerContext.Provider>
    );
  },
);
