import { memo, useCallback, useRef } from 'react';

import { counterFactory } from '@winglet/common-utils/lib';

import { Background } from '@/promise-modal/components/Background';
import { Foreground } from '@/promise-modal/components/Foreground';
import { useSubscribeModal } from '@/promise-modal/hooks/useSubscribeModal';
import { useConfigurationOptions, useModal } from '@/promise-modal/providers';
import type { ModalIdProps } from '@/promise-modal/types';

import { presenter } from './style';

const { getValue, increment } = counterFactory(1);

export const Presenter = memo(({ modalId }: ModalIdProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const options = useConfigurationOptions();
  const { modal } = useModal(modalId);
  useSubscribeModal(modal);

  const handleChangeOrder = useCallback(() => {
    if (ref.current === null) return;
    if (ref.current.style.zIndex === '' + options.zIndex + getValue()) return;
    ref.current.style.zIndex = '' + options.zIndex + increment();
  }, [options.zIndex]);
  return (
    <div ref={ref} className={presenter}>
      <Background modalId={modalId} onChangeOrder={handleChangeOrder} />
      <Foreground modalId={modalId} onChangeOrder={handleChangeOrder} />
    </div>
  );
});
