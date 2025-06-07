import { memo, useEffect } from 'react';

import { map } from '@winglet/common-utils/array';
import { useVersion, withErrorBoundary } from '@winglet/react-utils';

import { Presenter } from '@/promise-modal/components/Presenter';
import type { ModalNode } from '@/promise-modal/core';
import { useActiveModalCount } from '@/promise-modal/hooks/useActiveModalCount';
import {
  useConfigurationOptions,
  useModalManagerContext,
} from '@/promise-modal/providers';

import { anchor } from './classNames.emotion';

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
      className={anchor}
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
