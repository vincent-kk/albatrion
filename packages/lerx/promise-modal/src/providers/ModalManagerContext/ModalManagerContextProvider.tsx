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

import { ModalManager } from '@/promise-modal/app';
import { type ModalNode, nodeFactory } from '@/promise-modal/core';
import { closeModal } from '@/promise-modal/helpers/closeModal';
import { hideModal } from '@/promise-modal/helpers/hideModal';
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
    const optionsRef = useReference(options);

    useOnMountLayout(() => {
      // Registering the handler also flushes the prerender queue, so modals
      // opened before mount are created here with their promise wiring intact.
      ModalManager.openHandler = (data: Modal) => {
        const { duration, manualDestroy, closeOnBackdropClick } =
          optionsRef.current;
        const modalNode = nodeFactory({
          duration: convertMsFromDuration(duration),
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

    const getModalNodeRef = useRef((modalId?: ModalNode['id']) =>
      modalId !== undefined ? modalDictionary.current.get(modalId) : undefined,
    );

    const onDestroyRef = useRef((modalId?: ModalNode['id']) => {
      const modal = getModalNodeRef.current(modalId);
      if (!modal) return;
      modal.onDestroy();
      ModalManager.refresh();
    });

    const onChangeRef = useRef(
      (modalId: ModalNode['id'] | undefined, value: any) => {
        const modal = getModalNodeRef.current(modalId);
        if (!modal) return;
        if (modal.type === 'prompt') modal.onChange(value);
      },
    );

    const onConfirmRef = useRef((modalId?: ModalNode['id']) => {
      const modal = getModalNodeRef.current(modalId);
      if (!modal) return;
      modal.onConfirm();
      hideModal(modal);
    });

    const onCloseRef = useRef((modalId?: ModalNode['id']) => {
      const modal = getModalNodeRef.current(modalId);
      if (!modal) return;
      closeModal(modal);
    });

    const getModalRef = useRef((modalId?: ModalNode['id']) => ({
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
