import { describe, expect, it } from 'vitest';

import {
  ValidationMode,
  adoptSchemaNodeTree,
  nodeFromJSONSchema,
  reloadSchemaNodeForm,
  type SchemaNode,
  type ValidationIssue,
} from '../index';

/**
 * Build a mounted public tree without automatic validation requests.
 * @param readIssues - Validator result supplied for each explicit request.
 * @returns Mounted tree exposing the public error and validation channels.
 */
const createRoot = (
  readIssues: () => readonly ValidationIssue[] = () => [],
): SchemaNode => nodeFromJSONSchema({
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

  it('SURFACE-053 VALIDATE-043 79C-01 keeps direct non-root external errors only on that node', async () => {
    const validation = [{ dataPath: '/field', message: 'validator' }];
    const root = createRoot(() => validation);
    await root.validate();
    const errors = root.globalErrors;
    const field = root.find('/field')!;
    const external = [{ dataPath: '/field', message: 'server' }];
    field.setExternalErrors(external);
    expect(field.errors).toEqual([...external, ...validation]);
    expect(root.globalErrors).toBe(errors);
    expect(root.globalErrors).toEqual(validation);
    field.clearExternalErrors();
    expect(field.errors).toEqual(validation);
    expect(root.globalErrors).toBe(errors);
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
    let validation: readonly ValidationIssue[] = [{ dataPath: '/field', message: 'validator' }];
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
    const root = createRoot(() => [{ dataPath: '/field', message: 'validator' }]);
    root.setExternalErrors([{ dataPath: '', message: 'server' }]);
    await root.validate();
    expect(root.globalErrors).toHaveLength(2);
    reloadSchemaNodeForm(root, { field: 'reset' });
    expect(root.globalErrors).toEqual([]);
    expect(root.errors).toEqual([]);
  });

  it('SURFACE-053 VALIDATE-043 WRITE-045 79C-01 restores adopted root external errors by path', () => {
    const root = createRoot();
    const external = [{ dataPath: '/field', message: 'server' }];
    root.setExternalErrors(external);
    const replacement = createRoot();
    adoptSchemaNodeTree(root, replacement);
    const errors = replacement.globalErrors;
    expect(errors).toEqual(external);
    expect(replacement.globalErrors).toBe(errors);
  });
});
