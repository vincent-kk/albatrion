import { memo, useCallback } from 'react';

import { ErrorBoundary } from '@winglet/react-utils/hoc';

import { Background } from '@/promise-modal/components/Background';
import { Foreground } from '@/promise-modal/components/Foreground';
import { useSubscribeModal } from '@/promise-modal/hooks/useSubscribeModal';
import {
  useConfigurationOptions,
  useModalManager,
  useModalManagerContext,
} from '@/promise-modal/providers';
import type { PresenterProps } from '@/promise-modal/types/modal';

import { presenter } from './style';

/** Presents one node and routes render failures through context operations. */
export const Presenter = memo(({ modalId }: PresenterProps) => {
  const options = useConfigurationOptions();
  const { modal } = useModalManager(modalId);
  const { onReject, onChangeOrder } = useModalManagerContext();
  useSubscribeModal(modalId);
  const handleChangeOrder = useCallback(
    () => onChangeOrder(modalId),
    [modalId, onChangeOrder],
  );
  const handleError = useCallback(
    (error: unknown) => onReject(modalId, error),
    [modalId, onReject],
  );
  if (!modal) return null;
  return (
    <ErrorBoundary fallback={null} onError={handleError}>
      <div
        className={presenter}
        style={{ zIndex: options.zIndex + modal.order }}
      >
        <Background modalId={modalId} onChangeOrder={handleChangeOrder} />
        <Foreground modalId={modalId} onChangeOrder={handleChangeOrder} />
      </div>
    </ErrorBoundary>
  );
});
