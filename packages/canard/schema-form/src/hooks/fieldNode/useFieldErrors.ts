import { useMemo } from 'react';

import { NULL_FUNCTION } from '@winglet/common-utils/constant';
import { useVersion } from '@winglet/react-utils/hook';

import type { FieldNode } from '@/schema-form/core';
import { useWorkspaceContext } from '@/schema-form/providers';
import {
  FIELD_ERROR_TRACKING_EVENTS,
  resolveFieldErrorVisibility,
  selectFieldErrorMessage,
  useErrorRevealSubscription,
  useFieldRendererContext,
} from '@/schema-form/providers/FieldRendererContext';

import { useFieldNodeTracker } from './useFieldNodeTracker';

/**
 * Observe one field's raw errors and the owning form's current display policy.
 * @param node - Required field belonging to the surrounding form.
 * @returns Stable errors, visibility, message and gated formatter when those values are unchanged.
 */
export const useFieldErrors = (node: FieldNode) => {
  const {
    formatError: configuredFormatError,
    checkErrorVisibility,
    errorVisibility,
  } = useFieldRendererContext();
  const { context } = useWorkspaceContext();
  const revision = useFieldNodeTracker(node, FIELD_ERROR_TRACKING_EVENTS);
  const visibility = resolveFieldErrorVisibility(
    node,
    checkErrorVisibility,
    errorVisibility,
  );
  const errorVisible = visibility === true;
  const version = typeof visibility === 'number' ? visibility : undefined;
  const [, update] = useVersion();
  useErrorRevealSubscription(node, version, update);
  const formatError = errorVisible ? configuredFormatError : NULL_FUNCTION;
  const errorMessage = useMemo(() => {
    return selectFieldErrorMessage(node, context, formatError);
    // Node identity stays stable across tracked deliveries.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [node, revision, context, formatError]);
  const errors = node.errors;
  return useMemo(
    () => ({ errors, errorVisible, errorMessage, formatError }),
    [errors, errorVisible, errorMessage, formatError],
  );
};
