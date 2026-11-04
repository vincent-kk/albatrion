import type { plugin } from '@canard/schema-form-ajv8-plugin';

import type {
  CoreObservationEnv,
  CoreValidatorObservation,
  CoreValidatorRecord,
} from '../../../types';
import { readCoreProbeValue } from './utils/readCoreProbeValue';

/** Wrapped plugin and its page-lifetime records. */
export interface CoreWrappedValidator {
  /** Plugin to register; every compile and run is recorded, verdicts pass through unchanged. */
  plugin: typeof plugin;
  /** Page-lifetime records. */
  observation: CoreValidatorObservation;
}

/**
 * Wrap the validator plugin so every compile and run is timed and attributed.
 * @param source - Plugin whose validator is wrapped; other members are kept.
 * @param measuredPath - JSON Pointer read from each run's data as probeValue; null records null.
 * @param env - Browser-owned clock.
 * @returns The wrapped plugin and its observation; throws and rejections are recorded as failed calls and re-thrown.
 */
export function observeCoreValidator(
  source: typeof plugin,
  measuredPath: string | null,
  env: CoreObservationEnv,
): CoreWrappedValidator {
  const records: CoreValidatorRecord[] = [];
  const pending = new Set<CoreValidatorRecord>();
  const open = (
    kind: CoreValidatorRecord['kind'],
    probeValue: string | null,
  ): CoreValidatorRecord => {
    const record = {
      seq: records.length + 1,
      kind,
      probeValue,
      startMs: env.now(),
      syncReturnMs: 0,
      settledMs: 0,
      ok: true,
    };
    records.push(record);
    return record;
  };
  const settle = (record: CoreValidatorRecord, error?: unknown) => {
    record.settledMs = env.now();
    pending.delete(record);
    if (error === undefined) return;
    record.ok = false;
    record.error = error instanceof Error ? error.message : String(error);
  };
  const compile: typeof source.validator.compile = (schema) => {
    const compiled = open('compile', null);
    let validate: ReturnType<typeof source.validator.compile>;
    try {
      validate = source.validator.compile(schema);
    } catch (error) {
      compiled.syncReturnMs = env.now();
      settle(compiled, error);
      throw error;
    }
    compiled.syncReturnMs = env.now();
    settle(compiled);
    const run: typeof validate = (data) => {
      const record = open('run', readCoreProbeValue(data, measuredPath));
      pending.add(record);
      let result: ReturnType<typeof validate>;
      try {
        result = validate(data);
      } catch (error) {
        record.syncReturnMs = env.now();
        settle(record, error);
        throw error;
      }
      record.syncReturnMs = env.now();
      if (result instanceof Promise)
        result.then(
          () => settle(record),
          (error: unknown) => settle(record, error),
        );
      else settle(record);
      return result;
    };
    return run;
  };
  return {
    plugin: { ...source, validator: { ...source.validator, compile } },
    observation: { records, pending },
  };
}
