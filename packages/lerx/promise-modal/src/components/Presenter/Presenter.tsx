import { memo, useRef } from 'react';

import { counterFactory } from '@winglet/common-utils/lib';
import { useHandle } from '@winglet/react-utils/hook';

import { Background } from '@/promise-modal/components/Background';
import { Foreground } from '@/promise-modal/components/Foreground';
import { useSubscribeModal } from '@/promise-modal/hooks/useSubscribeModal';
import { useModal } from '@/promise-modal/providers';
import type { ModalIdProps } from '@/promise-modal/types';

import { presenter } from './style';

const { increment } = counterFactory(1);

export const Presenter = memo(({ modalId }: ModalIdProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const { modal } = useModal(modalId);
  useSubscribeModal(modal);
  const handleChangeOrder = useHandle(() => {
    if (ref.current) {
      ref.current.style.zIndex = `${increment()}`;
    }
  });
  return (
    <div ref={ref} className={presenter}>
      <Background modalId={modalId} onChangeOrder={handleChangeOrder} />
      <Foreground modalId={modalId} onChangeOrder={handleChangeOrder} />
    </div>
  );
});
