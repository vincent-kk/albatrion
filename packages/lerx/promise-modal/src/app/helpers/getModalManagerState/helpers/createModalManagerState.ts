import { polynomialHash } from '@winglet/common-utils/hash';
import { getRandomString } from '@winglet/common-utils/lib';

import type { Modal } from '@/promise-modal/types/modal';

import type { ModalManagerState } from '../../../types/ModalManagerState';

/**
 * Creates DOM-free state without installing effects or publishing a registry.
 * @param version - Shape version that all sharing copies must understand.
 * @returns A new independent state whose default handler preserves queued requests.
 */
export function createModalManagerState(version: number): ModalManagerState {
  const scope = `promise-modal-${getRandomString(36)}`;
  const defaultOpenHandler = (modal: Modal) => {
    state.prerenderList.push({ modal });
    return undefined;
  };
  const state: ModalManagerState = {
    version,
    frames: new Map(),
    focusTargets: new Map(),
    focused: new Set(),
    inertElements: [],
    inertRoot: null,
    anchor: null,
    scope,
    hash: polynomialHash(scope),
    styleSheetDefinition: new Map(),
    nodes: new Map(),
    nodeCleanups: new Map(),
    ids: [],
    listeners: new Set(),
    id: 0,
    order: 0,
    registrationVersion: 0,
    generation: 0,
    owner: null,
    warned: new WeakSet(),
    bootstraps: new Map(),
    prerenderList: [],
    defaultOpenHandler,
    openHandler: defaultOpenHandler,
  };
  return state;
}
