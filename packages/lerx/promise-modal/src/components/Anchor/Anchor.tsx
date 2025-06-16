import { memo, useEffect } from 'react';

import { map } from '@winglet/common-utils/array';
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

import { style } from './style';

ModalManager.defineStyleSheet('anchor', style);

const AnchorInner = () => {
  const [version, update] = useVersion();

  const { modalIds, setUpdater } = useModalManagerContext();

  useEffect(() => {
    setUpdater(update);
  }, [setUpdater, update]);

  const options = useConfigurationOptions();
  const dimmed = useActiveModalCount(validateDimmable, version);
  return (
    <div
      data-anchor
      style={{
        transitionDuration: options.duration,
        backgroundColor: dimmed ? options.backdrop : 'transparent',
      }}
    >
      {map(modalIds, (id) => (
        <Presenter key={id} modalId={id} />
      ))}
    </div>
  );
};

const validateDimmable = (modal?: ModalNode) => modal?.visible && modal.dimmed;

export const Anchor = memo(withErrorBoundary(AnchorInner));
