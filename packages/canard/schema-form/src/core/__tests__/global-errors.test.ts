import { describe, expect, it } from 'vitest';

import { nodeFromJSONSchema } from '@/schema-form/__tests__/fixtures/nodeFromJSONSchema';
import {
  FieldNodeEventType,
  type ValidationIssue,
  ValidationMode,
} from '@/schema-form/core/engine';
import {
  type FieldNode,
  adoptFieldNodeTree,
  reloadFieldNodeForm,
} from '@/schema-form/core/surface';

/**
 * Build a mounted public tree without automatic validation requests.
 * @param readIssues - Validator result supplied for each explicit request.
 * @returns Mounted tree exposing the public error and validation channels.
 */
const createRoot = (
  readIssues: () => readonly ValidationIssue[] = () => [],
): FieldNode =>
  nodeFromJSONSchema({
    jsonSchema: { type: 'object', properties: { field: { type: 'string' } } },
    defaultValue: { field: 'text' },
    validationMode: ValidationMode.OnRequest,
    deferMountValidation: true,
    validator: { compile: () => readIssues, compileGuard: () => () => true },
  });

describe('form-level external and validation errors', () => {
  it('SURFACE-053 VALIDATE-043 79C-01 places root external errors before every routed validation issue', async () => {
    const external = [{ dataPath: '/field', message: 'server' }];
    const validation = [
      { dataPath: '/field', message: 'validator' },
      { dataPath: '/absent', message: 'ownerless' },
    ];
    const root = createRoot(() => validation);
    root.setExternalErrors(external);
    await root.validate();
    expect(root.globalErrors).toEqual([...external, ...validation]);
    expect(root.errors).toEqual(external);
    expect(root.find('/field')!.errors).toEqual([validation[0]]);
  });

  it('SURFACE-053 VALIDATE-043 79C-01 returns the same merged reference across unchanged reads from any node', async () => {
    const external = [{ dataPath: '', message: 'server' }];
    const validation = [{ dataPath: '/field', message: 'validator' }];
    const root = createRoot(() => validation);
    root.setExternalErrors(external);
    await root.validate();
    const errors = root.globalErrors;
    expect(errors).toEqual([...external, ...validation]);
    expect(root.globalErrors).toBe(errors);
    expect(root.find('/field')!.globalErrors).toBe(errors);
    root.setExternalErrors(external);
    await root.validate();
    expect(root.globalErrors).toBe(errors);
  });

  it('SURFACE-053 round 185 reflects a non-root external write and clear in the root list by path', async () => {
    const validation = [{ dataPath: '/field', message: 'validator' }];
    const root = createRoot(() => validation);
    await root.validate();
    const before = root.globalErrors;
    const field = root.find('/field')!;
    const external = [{ dataPath: '/field', message: 'server' }];
    field.setExternalErrors(external);
    expect(field.errors).toEqual([...external, ...validation]);
    expect(root.errors).toEqual(external);
    expect(root.globalErrors).toEqual([...external, ...validation]);
    expect(root.globalErrors).not.toBe(before);
    const replacement = [{ dataPath: '/field', message: 'replaced' }];
    field.setExternalErrors(replacement);
    expect(root.errors).toEqual(replacement);
    expect(root.globalErrors).toEqual([...replacement, ...validation]);
    field.clearExternalErrors();
    expect(field.errors).toEqual(validation);
    expect(root.errors).toEqual([]);
    expect(root.globalErrors).toEqual(validation);
  });

  it('SURFACE-053 round 185 leaves the root list untouched when a form-level apply already placed the same references', async () => {
    const root = createRoot();
    const field = root.find('/field')!;
    const shared = { dataPath: '/field', message: 'server' };
    const other = { dataPath: '', message: 'form' };
    let rootEvents = 0;
    let aggregateEvents = 0;
    root.subscribe(({ type, payload }) => {
      if (type & FieldNodeEventType.UpdateError) rootEvents++;
      if (type & FieldNodeEventType.UpdateGlobalError) {
        aggregateEvents++;
        expect(payload?.[FieldNodeEventType.UpdateGlobalError]).toBe(
          root.globalErrors,
        );
      }
    });
    root.batch(() => {
      root.setExternalErrors([other, shared]);
      field.setExternalErrors([shared]);
    });
    expect(root.errors).toEqual([other, shared]);
    expect(rootEvents).toBe(1);
    expect(aggregateEvents).toBe(1);
    const list = root.errors;
    field.setExternalErrors([shared]);
    expect(root.errors).toBe(list);
    expect(rootEvents).toBe(1);
    expect(aggregateEvents).toBe(1);
    field.clearExternalErrors();
    expect(root.errors).toEqual([other]);
    expect(aggregateEvents).toBe(2);
  });

  it('195C-01 places a non-standard-path issue in the root list once when the node receives the same reference', () => {
    const root = createRoot();
    const field = root.find('/field')!;
    const issue = { dataPath: '#/field', message: 'server' };
    root.setExternalErrors([issue]);
    field.setExternalErrors([issue]);
    expect(root.errors).toEqual([issue]);
    expect(field.errors).toEqual([issue]);
    field.clearExternalErrors();
    expect(root.errors).toEqual([]);
  });

  it('195C-01 attributes a child list to the node regardless of its dataPath on rewrite and clear', () => {
    const root = createRoot();
    const field = root.find('/field')!;
    const first = { dataPath: '/other', message: 'a' };
    const second = { dataPath: '/elsewhere', message: 'b' };
    field.setExternalErrors([first]);
    expect(root.errors).toEqual([first]);
    field.setExternalErrors([second]);
    expect(root.errors).toEqual([second]);
    field.clearExternalErrors();
    expect(root.errors).toEqual([]);
  });

  it('195C-01 rebuilds the root list for a child clear made by a listener during delivery', () => {
    const root = createRoot();
    const field = root.find('/field')!;
    const issue = { dataPath: '/field', message: 'server' };
    root.setExternalErrors([issue]);
    field.setExternalErrors([issue]);
    expect(root.errors).toEqual([issue]);
    let aggregates = 0;
    root.subscribe(({ type }) => {
      if (type & FieldNodeEventType.UpdateGlobalError) aggregates++;
    });
    field.subscribe(({ type }) => {
      if (type & FieldNodeEventType.UpdateValue) field.clearExternalErrors();
    });
    field.setValue('next');
    expect(field.errors).toEqual([]);
    expect(root.errors).toEqual([]);
    expect(root.globalErrors).toEqual([]);
    expect(aggregates).toBe(1);
  });

  it('195C-01 ends a listener that keeps rewriting child external errors with the feedback limit', () => {
    const root = createRoot();
    const field = root.find('/field')!;
    let rounds = 0;
    const rewrite = () =>
      field.setExternalErrors([
        { dataPath: '/field', message: `r${rounds++}` },
      ]);
    field.subscribe(({ type }) => {
      if (type & FieldNodeEventType.UpdateValue) rewrite();
    });
    root.subscribe(({ type }) => {
      if (type & FieldNodeEventType.UpdateGlobalError) rewrite();
    });
    let failure: unknown;
    try {
      field.setValue('next');
    } catch (error) {
      failure = error;
    }
    expect(failure).toMatchObject({
      code: 'SCHEMA_FORM_ERROR.FEEDBACK_LIMIT_EXCEEDED',
    });
    expect(rounds).toBeGreaterThan(0);
    expect(rounds).toBeLessThanOrEqual(26);
  });

  it('SURFACE-053 VALIDATE-043 79C-01 rebuilds the form list when root external errors are cleared', async () => {
    const external = [{ dataPath: '', message: 'server' }];
    const validation = [{ dataPath: '/field', message: 'validator' }];
    const root = createRoot(() => validation);
    await root.validate();
    root.setExternalErrors(external);
    const errors = root.globalErrors;
    expect(errors).toEqual([...external, ...validation]);
    root.clearExternalErrors();
    expect(root.globalErrors).toEqual(validation);
    expect(root.globalErrors).not.toBe(errors);
    const cleared = root.globalErrors;
    root.clearExternalErrors();
    expect(root.globalErrors).toBe(cleared);
  });

  it('SURFACE-053 VALIDATE-043 79C-01 preserves each channel when the other one changes', async () => {
    let validation: readonly ValidationIssue[] = [
      { dataPath: '/field', message: 'validator' },
    ];
    const root = createRoot(() => validation);
    const external = [{ dataPath: '', message: 'server' }];
    root.setExternalErrors(external);
    expect(root.globalErrors).toEqual(external);
    const initial = root.globalErrors;
    await root.validate();
    expect(root.globalErrors).toEqual([...external, ...validation]);
    expect(root.globalErrors).not.toBe(initial);
    const routed = root.globalErrors;
    const replacement = [{ dataPath: '', message: 'replacement' }];
    root.setExternalErrors(replacement);
    expect(root.globalErrors).toEqual([...replacement, ...validation]);
    expect(root.globalErrors).not.toBe(routed);
    validation = [];
    await root.validate();
    expect(root.globalErrors).toEqual(replacement);
  });

  it('SURFACE-053 VALIDATE-043 WRITE-045 79C-01 clears both form error channels on reset', async () => {
    const root = createRoot(() => [
      { dataPath: '/field', message: 'validator' },
    ]);
    root.setExternalErrors([{ dataPath: '', message: 'server' }]);
    await root.validate();
    expect(root.globalErrors).toHaveLength(2);
    reloadFieldNodeForm(root, { field: 'reset' });
    expect(root.globalErrors).toEqual([]);
    expect(root.errors).toEqual([]);
  });

  it('SURFACE-053 WRITE-045 79C-01 clears a root external error set between two resets with no validation between them', () => {
    const root = createRoot();
    reloadFieldNodeForm(root, { field: 'a' });
    root.setExternalErrors([{ dataPath: '', message: 'server' }]);
    reloadFieldNodeForm(root, { field: 'b' });
    expect(root.globalErrors).toEqual([]);
    expect(root.errors).toEqual([]);
  });

  it('195C-01 folds a pending child change into the root list before adoption hands it over', () => {
    const root = createRoot();
    const issue = { dataPath: '/field', message: 'server' };
    const replacement = createRoot();
    root.batch(() => {
      root.find('/field')!.setExternalErrors([issue]);
      adoptFieldNodeTree(root, replacement);
    });
    expect(replacement.errors).toEqual([issue]);
    expect(replacement.globalErrors).toEqual([issue]);
  });

  it('195C-01 removes the root entry when a child clear empties the list so a root clear is silent', () => {
    const root = createRoot();
    const field = root.find('/field')!;
    const issue = { dataPath: '/field', message: 'server' };
    field.setExternalErrors([issue]);
    field.clearExternalErrors();
    expect(root.errors).toEqual([]);
    let aggregates = 0;
    root.subscribe(({ type }) => {
      if (type & FieldNodeEventType.UpdateGlobalError) aggregates++;
    });
    root.clearExternalErrors();
    expect(aggregates).toBe(0);
  });

  it('SURFACE-053 VALIDATE-043 WRITE-045 79C-01 restores adopted root external errors by path', () => {
    const root = createRoot();
    const external = [{ dataPath: '/field', message: 'server' }];
    root.setExternalErrors(external);
    const replacement = createRoot();
    adoptFieldNodeTree(root, replacement);
    const errors = replacement.globalErrors;
    expect(errors).toEqual(external);
    expect(replacement.globalErrors).toBe(errors);
  });
});
