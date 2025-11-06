import { type CSSProperties, memo, useEffect, useMemo } from 'react';

import { map } from '@winglet/common-utils/array';
import { counterFactory } from '@winglet/common-utils/lib';
import { withErrorBoundary } from '@winglet/react-utils/hoc';
import { useVersion } from '@winglet/react-utils/hook';

import { ModalManager } from '@/promise-modal/app/ModalManager';
import { Presenter } from '@/promise-modal/components/Presenter';
import type { ModalNode } from '@/promise-modal/core';
import { useActiveModalCount } from '@/promise-modal/hooks/useActiveModalCount';
import {
  useConfigurationOptions,
  useModalManagerContext,
} from '@/promise-modal/providers';

import { anchor, backdrop } from './style';

const { getValue, increment, reset } = counterFactory(0);

const AnchorInner = () => {
  const [version, update] = useVersion();

  const { modalIds } = useModalManagerContext();

  useEffect(() => {
    ModalManager.refreshHandler = update;
  }, [update]);

  const options = useConfigurationOptions();
  const dimmed = useActiveModalCount(validateDimmable, version);
  if (!dimmed) reset();

  const anchorStyle = useMemo(
    () =>
      ({
        '--z-index': options.zIndex,
        '--transition-duration': options.duration,
      }) as CSSProperties,
    [options],
  );

  const backdropStyle = useMemo(
    () => ({
      ...options.backdrop,
      opacity: dimmed ? 1 : 0,
    }),
    [dimmed, options],
  );

  return (
    <div className={anchor} style={anchorStyle}>
      <div className={backdrop} style={backdropStyle} />
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
