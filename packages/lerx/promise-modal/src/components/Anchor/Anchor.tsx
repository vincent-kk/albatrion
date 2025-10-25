import { type CSSProperties, memo, useEffect } from 'react';

import { map } from '@winglet/common-utils/array';
import { counterFactory } from '@winglet/common-utils/lib';
import { withErrorBoundary } from '@winglet/react-utils/hoc';
import { useVersion } from '@winglet/react-utils/hook';

import { Presenter } from '@/promise-modal/components/Presenter';
import type { ModalNode } from '@/promise-modal/core';
import { useActiveModalCount } from '@/promise-modal/hooks/useActiveModalCount';
import {
  useConfigurationOptions,
  useModalManagerContext,
} from '@/promise-modal/providers';

import { anchor } from './style';

const { getValue, increment, reset } = counterFactory(0);

const AnchorInner = () => {
  const [version, update] = useVersion();

  const { modalIds, setUpdater } = useModalManagerContext();

  useEffect(() => {
    setUpdater(update);
  }, [setUpdater, update]);

  const options = useConfigurationOptions();
  const dimmed = useActiveModalCount(validateDimmable, version);
  if (!dimmed) reset();

  return (
    <div
      className={anchor}
      style={
        {
          '--z-index': options.zIndex,
          transitionDuration: options.duration,
          backgroundColor: dimmed ? options.backdrop : 'transparent',
        } as CSSProperties
      }
    >
      {map(modalIds, (id) => (
        <Presenter
          key={id}
          modalId={id}
          getValue={getValue}
          increment={increment}
          reset={reset}
        />
      ))}
    </div>
  );
};

const validateDimmable = (modal?: ModalNode) => modal?.visible && modal.dimmed;

export const Anchor = memo(withErrorBoundary(AnchorInner));
