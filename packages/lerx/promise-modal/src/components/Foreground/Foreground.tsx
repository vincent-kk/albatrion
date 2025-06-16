import { useMemo } from 'react';

import { dataCondition } from '@winglet/react-utils/style-manager';

import { ModalManager } from '@/promise-modal/app/ModalManager';
import {
  useConfigurationContext,
  useModal,
  useUserDefinedContext,
} from '@/promise-modal/providers';
import type { ModalLayerProps } from '@/promise-modal/types';

import { AlertInner, ConfirmInner, PromptInner } from './components';
import { style } from './style';

ModalManager.defineStyleSheet('foreground', style);

export const ForegroundFrame = ({
  modalId,
  onChangeOrder,
}: ModalLayerProps) => {
  const { ForegroundComponent } = useConfigurationContext();
  const { context: userDefinedContext } = useUserDefinedContext();

  const { modal, onChange, onConfirm, onClose, onDestroy } = useModal(modalId);

  const Foreground = useMemo(
    () => modal?.ForegroundComponent || ForegroundComponent,
    [ForegroundComponent, modal],
  );

  if (!modal) return null;

  return (
    <div
      data-foreground
      data-active={dataCondition(modal.visible)}
      data-visible={dataCondition(
        modal.manualDestroy ? modal.alive : modal.visible,
      )}
    >
      <Foreground
        id={modal.id}
        type={modal.type}
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
