import type { Nullable } from '@aileron/declare';

import { observeFieldNodeReports } from '@/schema-form/core';
import type { FormErrorRecord } from '@/schema-form/errors';
import { FormErrorCode } from '@/schema-form/errors';

import type { FormErrorService } from '../type';
import { isReportedFailureBundle } from './isReportedFailureBundle';
import { reportFailureToHost } from './reportFailureToHost';

/** Create an instance reporter; React supplies the current callback through onError. */
export const createFormErrorService = (): FormErrorService => {
  const seen = new WeakSet<object>();
  const handlerFailures = new WeakSet<object>();
  const warnings = new WeakMap<object, Set<string>>();
  let reportScope: object | undefined;
  let delivering = false;
  const service: FormErrorService = {
    hasConsumer: () =>
      !!service.onError || process.env.NODE_ENV !== 'production',
    load: 0,
    warningScope: {},
    reportInLoad(record, scope) {
      const previous = reportScope;
      reportScope = scope;
      try {
        service.report(record);
      } finally {
        reportScope = previous;
      }
    },
    beginLoad: () => {
      service.load++;
      service.warningScope = {};
    },
    report(record) {
      if (delivering) return;
      if (record.error && typeof record.error === 'object') {
        seen.add(record.error);
      }
      if (record.level === 'warning') {
        const key = JSON.stringify([record.code, record.path]);
        const scope = reportScope ?? service.warningScope;
        let keys = warnings.get(scope);
        if (!keys) warnings.set(scope, (keys = new Set()));
        if (keys.has(key)) return;
        keys.add(key);
      }
      delivering = true;
      try {
        if (service.onError) {
          const deliver = () => service.onError?.(record);
          if (service.root) observeFieldNodeReports(service.root, deliver);
          else deliver();
        } else if (process.env.NODE_ENV !== 'production')
          console.warn(record.message, record);
      } catch (error) {
        if (error && typeof error === 'object') handlerFailures.add(error);
        throw error;
      } finally {
        delivering = false;
      }
    },
    capture(error, origin, componentStack, path) {
      if (
        error &&
        typeof error === 'object' &&
        (seen.has(error) || handlerFailures.has(error))
      ) {
        if (componentStack !== undefined) seen.delete(error);
        return;
      }
      const domain = error as Nullable<{
        code?: FormErrorRecord['code'];
        details?: FormErrorRecord['details'];
        message?: string;
      }>;
      if (
        domain?.code === FormErrorCode.MultipleErrors &&
        isReportedFailureBundle(domain.details?.errors, seen, handlerFailures)
      )
        return;
      try {
        service.report({
          level: 'error',
          code:
            componentStack !== undefined
              ? FormErrorCode.RenderFailed
              : (domain?.code ?? FormErrorCode.RenderFailed),
          message: domain?.message ?? String(error),
          error,
          ...(path !== undefined ? { path } : {}),
          details: domain?.details,
          origin,
          ...(componentStack !== undefined ? { componentStack } : {}),
        });
      } catch (handlerError) {
        reportFailureToHost(handlerError);
      }
    },
  };
  return service;
};
