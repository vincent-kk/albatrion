import {
  type PropsWithChildren,
  memo,
  useCallback,
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
          ...data,
          id: modalIdSequence.current++,
          initiator: initiator.current,
          manualDestroy:
            data.manualDestroy !== undefined
              ? data.manualDestroy
              : manualDestroy,
          closeOnBackdropClick:
            data.closeOnBackdropClick !== undefined
              ? data.closeOnBackdropClick
              : closeOnBackdropClick,
        });
        modalDictionary.current.set(modal.id, modal);
        setModalIds((ids) => [...ids, modal.id]);
      }

      ModalManager.openHandler = (data: Modal) => {
        const modal = nodeFactory({
          ...data,
          id: modalIdSequence.current++,
          initiator: initiator.current,
          manualDestroy:
            data.manualDestroy !== undefined
              ? data.manualDestroy
              : manualDestroy,
          closeOnBackdropClick:
            data.closeOnBackdropClick !== undefined
              ? data.closeOnBackdropClick
              : closeOnBackdropClick,
        });
        modalDictionary.current.set(modal.id, modal);
        setModalIds((ids) => {
          const aliveIds: number[] = [];
          for (let index = 0; index < ids.length; index++) {
            const id = ids[index];
            const destroyed = !modalDictionary.current.get(id)?.alive;
            if (destroyed) modalDictionary.current.delete(id);
            else aliveIds.push(id);
          }
          return [...aliveIds, modal.id];
        });
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

    const getModalNode = useCallback((modalId: ModalNode['id']) => {
      return modalDictionary.current.get(modalId);
    }, []);

    const onDestroy = useCallback((modalId: ModalNode['id']) => {
      const modal = modalDictionary.current.get(modalId);
      if (!modal) return;
      modal.onDestroy();
      updaterRef.current?.();
    }, []);

    const updaterRef = useRef<Fn>(undefined);
    const hideModal = useCallback(
      (modalId: ModalNode['id']) => {
        const modal = modalDictionary.current.get(modalId);
        if (!modal) return;
        modal.onHide();
        updaterRef.current?.();
        if (!modal.manualDestroy)
          setTimeout(() => {
            modal.onDestroy();
          }, duration);
      },
      [duration],
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

    const getModal = useCallback(
      (modalId: ModalNode['id']) => ({
        modal: getModalNode(modalId),
        onConfirm: () => onConfirm(modalId),
        onClose: () => onClose(modalId),
        onChange: (value: any) => onChange(modalId, value),
        onDestroy: () => onDestroy(modalId),
      }),
      [getModalNode, onConfirm, onClose, onChange, onDestroy],
    );

    const value = useMemo(() => {
      return {
        modalIds,
        getModalNode,
        onChange,
        onConfirm,
        onClose,
        onDestroy,
        getModal,
        setUpdater: (updater: Fn) => {
          updaterRef.current = updater;
        },
      };
    }, [
      modalIds,
      getModal,
      getModalNode,
      onChange,
      onConfirm,
      onClose,
      onDestroy,
    ]);

    return (
      <ModalManagerContext.Provider value={value}>
        {children}
      </ModalManagerContext.Provider>
    );
  },
);
