import {
  type PropsWithChildren,
  memo,
  useLayoutEffect,
  useMemo,
  useRef,
} from 'react';

import { useReference } from '@winglet/react-utils/hook';

import type { Fn } from '@aileron/declare';

import { ModalManager } from '@/promise-modal/app';
import { type ModalNode, nodeFactory } from '@/promise-modal/core';
import { closeModal } from '@/promise-modal/helpers/closeModal';
import { hideModal } from '@/promise-modal/helpers/hideModal';
import { mergeDefined } from '@/promise-modal/helpers/mergeDefined';
import { normalizeDuration } from '@/promise-modal/helpers/normalizeDuration';
import { usePathname as useDefaultPathname } from '@/promise-modal/hooks/useDefaultPathname';
import { useConfigurationOptions } from '@/promise-modal/providers/ConfigurationContext';
import type { Modal } from '@/promise-modal/types/modal';

import { ModalManagerContext } from './ModalManagerContext';

interface ModalManagerContextProviderProps {
  usePathname: Fn<[], { pathname: string }>;
}

export const ModalManagerContextProvider = memo(
  ({
    usePathname,
    children,
  }: PropsWithChildren<ModalManagerContextProviderProps>) => {
    const { pathname } = usePathname();
    const initiator = useRef(pathname);

    const options = useConfigurationOptions();
    const optionsRef = useReference(options);

    useLayoutEffect(() => {
      const openHandler = (data: Modal) => {
        const {
          duration,
          manualDestroy,
          closeOnBackdropClick,
          trapFocus,
          lockScroll,
        } = optionsRef.current;
        const merged = mergeDefined(
          { manualDestroy, closeOnBackdropClick, trapFocus, lockScroll },
          data,
        );
        const node = nodeFactory({
          ...merged,
          closeOnEscape:
            data.closeOnEscape ??
            data.closeOnBackdropClick ??
            optionsRef.current.closeOnEscape ??
            closeOnBackdropClick,
          duration: parseFloat(normalizeDuration(data.duration, duration)),
          id: ModalManager.nextId(),
          initiator:
            usePathname === useDefaultPathname
              ? window.location.pathname
              : initiator.current,
        });
        ModalManager.register(node);
        return node;
      };
      ModalManager.openHandler = openHandler;
      return () => ModalManager.releaseOpenHandler(openHandler);
    }, [optionsRef, usePathname]);

    useLayoutEffect(() => {
      for (const id of ModalManager.ids) {
        const modal = ModalManager.node(id);
        if (!modal?.alive) continue;
        if (modal.initiator === pathname) modal.onShow();
        else modal.onHide();
      }
      initiator.current = pathname;
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [pathname]);

    const getModalNodeRef = useRef((modalId?: ModalNode['id']) =>
      modalId !== undefined ? ModalManager.node(modalId) : undefined,
    );

    const onDestroyRef = useRef((modalId?: ModalNode['id']) => {
      const modal = getModalNodeRef.current(modalId);
      if (!modal) return;
      modal.onDestroy();
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
      if (!modal || modal.settled) return;
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
        getModalNode: getModalNodeRef.current,
        onChange: onChangeRef.current,
        onConfirm: onConfirmRef.current,
        onClose: onCloseRef.current,
        onDestroy: onDestroyRef.current,
        getModal: getModalRef.current,
        onChangeOrder: ModalManager.raise,
        onReject: (id: number, error: unknown) => {
          const node = ModalManager.node(id);
          if (!node) return;
          node.onReject(error);
          node.onDestroy();
        },
        onRejectAll: (error: unknown) => {
          for (const id of ModalManager.ids) {
            const node = ModalManager.node(id);
            if (!node?.alive) continue;
            node.onReject(error);
            node.onDestroy();
          }
        },
      };
    }, []);

    return (
      <ModalManagerContext.Provider value={value}>
        {children}
      </ModalManagerContext.Provider>
    );
  },
);
