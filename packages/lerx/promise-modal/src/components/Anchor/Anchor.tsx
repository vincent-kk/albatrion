import { type CSSProperties, memo, useSyncExternalStore } from 'react';

import { ModalManager } from '@/promise-modal/app';
import { Presenter } from '@/promise-modal/components/Presenter';
import { useActiveModalCount } from '@/promise-modal/hooks/useActiveModalCount';
import {
  useConfigurationOptions,
  useModalManagerContext,
} from '@/promise-modal/providers';

import { AnchorErrorBoundary } from './components/AnchorErrorBoundary';
import { anchor, backdrop } from './styles/style';

/** Stable server membership avoids leaking browser modal state during SSR. */
const EMPTY_IDS: readonly number[] = [];
/** Reads the store's stable membership snapshot. */
const getIds = () => ModalManager.ids;
/** Returns the empty server membership snapshot. */
const getServerIds = () => EMPTY_IDS;
/** Reads registration changes, excluding destruction during error recovery. */
const getRegistration = () => ModalManager.registrationVersion;
/** Supplies the initial server boundary identity. */
const getServerRegistration = () => 0;

/** Renders the current modal membership and a visibility-derived backdrop. */
const AnchorInner = () => {
  const ids = useSyncExternalStore(
    ModalManager.subscribe,
    getIds,
    getServerIds,
  );
  const options = useConfigurationOptions();
  const dimmed = useActiveModalCount((node) => node.visible && node.dimmed);
  const anchorStyle = {
    '--z-index': options.zIndex,
    '--transition-duration': options.duration,
  } as CSSProperties;
  return (
    <div className={anchor} style={anchorStyle}>
      <div
        className={backdrop}
        style={{ ...options.backdrop, opacity: dimmed ? 1 : 0 }}
      />
      {ids.map((id) => (
        <Presenter key={id} modalId={id} />
      ))}
    </div>
  );
};

/** Restarts the last-resort boundary only after a new modal registration. */
export const Anchor = memo(() => {
  const registration = useSyncExternalStore(
    ModalManager.subscribe,
    getRegistration,
    getServerRegistration,
  );
  const { onRejectAll } = useModalManagerContext();
  return (
    <AnchorErrorBoundary resetKey={registration} onError={onRejectAll}>
      <AnchorInner />
    </AnchorErrorBoundary>
  );
});
