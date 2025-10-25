import { memo, useCallback, useRef } from 'react';

import { useOnMountLayout } from '@winglet/react-utils/hook';

import { Background } from '@/promise-modal/components/Background';
import { Foreground } from '@/promise-modal/components/Foreground';
import { useSubscribeModal } from '@/promise-modal/hooks/useSubscribeModal';
import { useConfigurationOptions, useModal } from '@/promise-modal/providers';
import type { PresenterProps } from '@/promise-modal/types';

import { presenter } from './style';

export const Presenter = memo(
  ({ modalId, getValue, increment }: PresenterProps) => {
    const ref = useRef<HTMLDivElement>(null);
    const options = useConfigurationOptions();
    const { modal } = useModal(modalId);
    useSubscribeModal(modal);

    useOnMountLayout(() => {
      if (ref.current === null) return;
      ref.current.style.zIndex = '' + (options.zIndex + increment());
    });

    const handleChangeOrder = useCallback(() => {
      const element = ref.current;
      if (element === null) return;
      if (element.style.zIndex === '' + (options.zIndex + getValue())) return;
      element.style.zIndex = '' + (options.zIndex + increment());
    }, [getValue, increment, options.zIndex]);

    return (
      <div ref={ref} className={presenter}>
        <Background modalId={modalId} onChangeOrder={handleChangeOrder} />
        <Foreground modalId={modalId} onChangeOrder={handleChangeOrder} />
      </div>
    );
  },
);
