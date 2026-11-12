import { useCallback, useLayoutEffect, useMemo, useRef } from 'react';

import { cxLite } from '@winglet/style-utils/util';

import { ModalManager } from '@/promise-modal/app';
import {
  useConfigurationContext,
  useModalManager,
  useUserDefinedContext,
} from '@/promise-modal/providers';
import type { ModalLayerProps } from '@/promise-modal/types/modal';

import { AlertInner, ConfirmInner, PromptInner } from './components';
import { active, foreground, visible } from './style';

export const ForegroundFrame = ({
  modalId,
  onChangeOrder,
}: ModalLayerProps) => {
  const frameRef = useRef<HTMLDivElement | null>(null);
  const setFrameElement = useCallback(
    (element: HTMLDivElement | null) => {
      frameRef.current = element;
      ModalManager.setFrameElement(modalId, element);
    },
    [modalId],
  );
  const { ForegroundComponent } = useConfigurationContext();
  const { context: userDefinedContext } = useUserDefinedContext();
  const { modal, onChange, onConfirm, onClose, onDestroy } =
    useModalManager(modalId);

  const Foreground = useMemo(
    () => modal?.ForegroundComponent || ForegroundComponent,
    [ForegroundComponent, modal],
  );

  useLayoutEffect(() => {
    ModalManager.setFrameElement(modalId, frameRef.current);
  });

  if (!modal) return null;

  return (
    <div
      ref={setFrameElement}
      tabIndex={-1}
      className={cxLite(
        foreground,
        modal.visible && active,
        (modal.manualDestroy ? modal.alive : modal.visible) && visible,
      )}
    >
      <Foreground
        id={modal.id}
        type={modal.type}
        subtype={modal.subtype}
        group={modal.group}
        settled={modal.settled}
        alive={modal.alive}
        visible={modal.visible}
        initiator={modal.initiator}
        manualDestroy={modal.manualDestroy}
        closeOnBackdropClick={modal.closeOnBackdropClick}
        background={modal.background}
        onChange={onChange}
        onConfirm={onConfirm}
        onClose={onClose}
        onDestroy={onDestroy}
        onChangeOrder={onChangeOrder}
        context={userDefinedContext}
      >
        {modal.type === 'alert' && (
          <AlertInner modal={modal} handlers={{ onConfirm }} />
        )}
        {modal.type === 'confirm' && (
          <ConfirmInner modal={modal} handlers={{ onConfirm, onClose }} />
        )}
        {modal.type === 'prompt' && (
          <PromptInner
            modal={modal}
            handlers={{ onChange, onConfirm, onClose }}
          />
        )}
      </Foreground>
    </div>
  );
};
