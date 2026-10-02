import type { FormErrorRecord } from '@/schema-form/errors';

import { reportErrorToHost } from '../reportErrorToHost';
import type { FormErrorService } from '../type';

/** Create an instance reporter; React supplies the current callback through onError. */
export const createFormErrorService = (): FormErrorService => {
  const seen = new WeakSet<object>();
  const warnings = new Set<string>();
  let delivering = false;
  const service: FormErrorService = {
    hasConsumer: () =>
      !!service.onError || process.env.NODE_ENV !== 'production',
    beginLoad: () => warnings.clear(),
    report(record) {
      if (delivering) return;
      if (record.error && typeof record.error === 'object') {
        seen.add(record.error);
      }
      if (record.level === 'warning') {
        const key = JSON.stringify([record.code, record.path]);
        if (warnings.has(key)) return;
        warnings.add(key);
      }
      delivering = true;
      try {
        if (service.onError) service.onError(record);
        else if (process.env.NODE_ENV !== 'production')
          console.warn(record.message, record);
      } finally {
        delivering = false;
      }
    },
    capture(error, componentStack, surface = 'sink', path) {
      if (error && typeof error === 'object' && seen.has(error)) {
        if (componentStack !== undefined) seen.delete(error);
        return;
      }
      const domain = error as {
        code?: FormErrorRecord['code'];
        details?: FormErrorRecord['details'];
        message?: string;
      } | null;
      try {
        service.report({
          level: 'error',
          code:
            componentStack !== undefined
              ? 'SCHEMA_FORM_ERROR.RENDER_FAILED'
              : (domain?.code ?? 'SCHEMA_FORM_ERROR.RENDER_FAILED'),
          message: domain?.message ?? String(error),
          error,
          ...(path !== undefined ? { path } : {}),
          details: domain?.details,
          surface,
          ...(componentStack !== undefined ? { componentStack } : {}),
        });
      } catch (handlerError) {
        reportErrorToHost(handlerError);
      }
    },
  };
  return service;
};
